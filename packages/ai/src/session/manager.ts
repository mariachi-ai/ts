import { AIError } from '@mariachi/core';
import type {
  AIMessage,
  AIResponse,
  AISession,
  AITelemetryEntry,
  CallOptions,
  CallRecord,
  SessionConfig,
  StreamChunk,
  ToolDefinition,
  ToolResult,
} from '../types';

/** What a session passes to its adapter on every call. */
export interface AdapterCallConfig {
  model?: string;
  tools?: ToolDefinition[];
  /** The session's `userId`. An adapter sends it to the provider only when it's configured to. */
  userId?: string;
  /** Cancels the call. An adapter stops the provider request and fails with `ai/aborted`. */
  signal?: AbortSignal;
  /** The most the model may write in this call: what is left of the session's budget. */
  maxOutputTokens?: number;
}

export interface Adapter {
  generate(messages: AIMessage[], config: AdapterCallConfig): Promise<AIResponse>;
  stream?(messages: AIMessage[], config: AdapterCallConfig): AsyncIterable<StreamChunk>;
}

export interface SessionState {
  messages: AIMessage[];
  config: SessionConfig;
  totalInputTokens: number;
  totalOutputTokens: number;
  /** What the latest call counted. Kept in memory only. */
  lastCall?: CallRecord;
}

/** Tokens in a text when the provider didn't say: about four characters each. */
const estimateTokens = (text: string): number => Math.ceil(text.length / 4);
const promptText = (messages: AIMessage[]): string => messages.map((m) => `${m.content}${m.toolCalls?.length ? JSON.stringify(m.toolCalls) : ''}`).join('\n');
const cancelledError = (): AIError => new AIError('ai/aborted', 'The request was cancelled');

/** Optional persistence for sessions, messages and running token totals. */
export interface AISessionStore {
  load(id: string): Promise<SessionState | null>;
  save(id: string, state: SessionState): Promise<void>;
  /** When the store keeps telemetry too, `createAI` writes every model call's entry through it. */
  recordTelemetry?(entry: AITelemetryEntry): Promise<void>;
}

/** Where a session finds the tools it names, and the ones it offers when it names none: the tool registry. */
export interface ToolSource {
  get(name: string): ToolDefinition | undefined;
  getAll(): ToolDefinition[];
}

/** Errors another model or provider would meet too, so nothing else is tried. */
export function isFinalError(error: unknown): boolean {
  return error instanceof AIError && ['ai/token-budget-exceeded', 'ai/session-not-found', 'ai/aborted', 'ai/tool-not-found'].includes(error.code);
}

export class SessionManager {
  private readonly sessions = new Map<string, SessionState>();

  constructor(
    private readonly adapter: Adapter,
    private readonly store?: AISessionStore,
    /** Called when the background save in `create` fails. `createPersisted` throws instead. */
    private readonly onPersistError?: (error: Error, sessionId: string) => void,
    /** Registered tools. A session with `toolNames` gets those; one with neither `tools` nor `toolNames` gets all. */
    private readonly registry?: ToolSource,
  ) {}

  /** Starts a session in memory and saves it in the background. Prefer `createPersisted` when a store is set. */
  create(id: string, config: SessionConfig): AISession {
    const state = this.init(id, config);
    this.store?.save(id, state).catch((error: unknown) => {
      this.onPersistError?.(error instanceof Error ? error : new Error(String(error)), id);
    });
    return this.bind(id);
  }

  /** Starts a session and waits until the store has saved it. */
  async createPersisted(id: string, config: SessionConfig): Promise<AISession> {
    const state = this.init(id, config);
    try {
      await this.store?.save(id, state);
    } catch (error) {
      this.sessions.delete(id);
      throw new AIError('ai/session-persist-failed', error instanceof Error ? error.message : String(error), { sessionId: id });
    }
    return this.bind(id);
  }

  private init(id: string, config: SessionConfig): SessionState {
    const messages: AIMessage[] = [];
    if (config.systemPrompt) messages.push({ role: 'system', content: config.systemPrompt });
    const state: SessionState = { messages, config, totalInputTokens: 0, totalOutputTokens: 0 };
    this.sessions.set(id, state);
    return state;
  }

  /** Returns the live session. Does not reset its history. */
  get(id: string): AISession | undefined {
    if (!this.sessions.has(id)) return undefined;
    return this.bind(id);
  }

  /** Loads a persisted session into memory when it is not already there. */
  async open(id: string): Promise<AISession | undefined> {
    if (!this.sessions.has(id) && this.store) {
      const loaded = await this.store.load(id);
      if (loaded) this.sessions.set(id, loaded);
    }
    return this.get(id);
  }

  private bind(id: string): AISession {
    const state = () => this.sessions.get(id);
    return {
      id,
      budget: state()?.config.budget,
      maxIterations: state()?.config.maxIterations,
      send: (message, toolResults, options) => this.doSend(id, message, toolResults, options),
      stream: (message, options) => this.doStream(id, message, options),
      getHistory: () => {
        const current = state();
        return current ? [...current.messages] : [];
      },
      usage: () => {
        const current = state();
        const inputTokens = current?.totalInputTokens ?? 0;
        const outputTokens = current?.totalOutputTokens ?? 0;
        return { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens };
      },
      tools: () => {
        const current = state();
        return current ? (this.toolsFor(current) ?? []) : [];
      },
      lastCall: () => state()?.lastCall,
    };
  }

  private require(id: string): SessionState {
    const state = this.sessions.get(id);
    if (!state) throw new AIError('ai/session-not-found', `Session ${id} not found`);
    return state;
  }

  /**
   * The tools the model is offered: the session's own, else the registered ones it names (`'*'` for
   * all of them), else none. A registered tool is available; only a session that names it puts it in
   * front of a model. A name with no registered tool fails here, before a call is paid for.
   */
  private toolsFor(state: SessionState): ToolDefinition[] | undefined {
    if (state.config.tools) return state.config.tools.length ? state.config.tools : undefined;
    if (state.config.toolNames === '*') {
      const all = this.registry?.getAll() ?? [];
      return all.length ? all : undefined;
    }
    if (state.config.toolNames) {
      const tools = state.config.toolNames.map((name) => {
        const tool = this.registry?.get(name);
        if (!tool) {
          throw new AIError('ai/tool-not-found', `This session uses the tool "${name}", which is not registered here. Register it (ai.registerTool) before opening the session.`, { tool: name });
        }
        return tool;
      });
      return tools.length ? tools : undefined;
    }
    return undefined;
  }

  private assertBudget(state: SessionState): void {
    const budget = state.config.budget;
    if (!budget) return;
    const used = { input: state.totalInputTokens, output: state.totalOutputTokens, total: state.totalInputTokens + state.totalOutputTokens };
    const limits: Array<[kind: string, used: number, limit: number | undefined]> = [
      ['total', used.total, budget.maxTotalTokens],
      ['input', used.input, budget.maxInputTokens],
      ['output', used.output, budget.maxOutputTokens],
    ];
    for (const [kind, total, limit] of limits) {
      if (limit !== undefined && total >= limit) {
        throw new AIError('ai/token-budget-exceeded', `Token budget exceeded: ${total}/${limit}${kind === 'total' ? '' : ` ${kind} tokens`}`, { total, limit, kind });
      }
    }
  }

  /** What the model may still write before the session's budget is spent, when the budget says. */
  private outputLeft(state: SessionState): number | undefined {
    const budget = state.config.budget;
    const left = [
      budget?.maxOutputTokens !== undefined ? budget.maxOutputTokens - state.totalOutputTokens : undefined,
      budget?.maxTotalTokens !== undefined ? budget.maxTotalTokens - state.totalInputTokens - state.totalOutputTokens : undefined,
    ].filter((value): value is number => value !== undefined);
    return left.length ? Math.max(1, Math.min(...left)) : undefined;
  }

  private callConfig(state: SessionState, model: string | undefined, options?: CallOptions): AdapterCallConfig {
    const maxOutputTokens = this.outputLeft(state);
    return {
      model,
      tools: this.toolsFor(state),
      userId: state.config.userId,
      ...(options?.signal ? { signal: options.signal } : {}),
      ...(maxOutputTokens !== undefined ? { maxOutputTokens } : {}),
    };
  }

  private modelsFor(state: SessionState): Array<string | undefined> {
    if (state.config.models?.length) return state.config.models;
    return [state.config.model];
  }

  private async doSend(id: string, message: string, toolResults?: ToolResult[], options?: CallOptions): Promise<AIResponse> {
    const state = this.require(id);
    this.assertBudget(state);
    if (options?.signal?.aborted) throw cancelledError();
    state.lastCall = undefined;
    const before = state.messages.length;
    this.appendInput(state, message, toolResults);

    let lastError: unknown;
    try {
      for (const model of this.modelsFor(state)) {
        try {
          const response = await this.adapter.generate(state.messages, this.callConfig(state, model, options));
          this.record(state, response);
          state.lastCall = { model: response.model, inputTokens: response.usage.inputTokens, outputTokens: response.usage.outputTokens, estimated: false, interrupted: false };
          await this.store?.save(id, state);
          return response;
        } catch (error) {
          if (isFinalError(error)) throw error;
          lastError = error;
        }
      }
      throw lastError instanceof AIError
        ? lastError
        : new AIError('ai/request-failed', lastError instanceof Error ? lastError.message : 'AI request failed');
    } catch (error) {
      // Nothing was answered: the message isn't part of the conversation, so sending it again doesn't say it twice
      if (state.messages.length === before + (toolResults?.length || (message ? 1 : 0))) state.messages.length = before;
      throw error;
    }
  }

  private async *doStream(id: string, message: string, options?: CallOptions): AsyncIterable<StreamChunk> {
    const state = this.require(id);
    this.assertBudget(state);
    if (options?.signal?.aborted) throw cancelledError();
    state.lastCall = undefined;
    const before = state.messages.length;
    this.appendInput(state, message);
    const requested = this.modelsFor(state)[0];

    // Our own signal, so that a reader who stops early cancels the provider call as the caller's signal would
    const controller = new AbortController();
    const cancel = (): void => controller.abort(options?.signal?.reason);
    options?.signal?.addEventListener('abort', cancel, { once: true });

    let text = '';
    let usage: StreamChunk['usage'];
    let toolCalls: StreamChunk['toolCalls'];
    let model = requested;
    let finished = false;
    let failure: unknown;
    let prompt = '';
    try {
      const config = this.callConfig(state, requested, { signal: controller.signal });
      prompt = promptText(state.messages);
      if (!this.adapter.stream) {
        const response = await this.adapter.generate(state.messages, config);
        text = response.content;
        usage = { inputTokens: response.usage.inputTokens, outputTokens: response.usage.outputTokens };
        toolCalls = response.toolCalls;
        model = response.model;
        finished = true;
        if (text) yield { content: text, done: false };
        yield { content: '', done: true, usage, model, ...(toolCalls?.length ? { toolCalls } : {}) };
        return;
      }
      for await (const chunk of this.adapter.stream(state.messages, config)) {
        text += chunk.content;
        if (chunk.usage) usage = chunk.usage;
        if (chunk.toolCalls?.length) toolCalls = chunk.toolCalls;
        if (chunk.model) model = chunk.model;
        if (chunk.done) finished = true;
        yield chunk.done ? { ...chunk, model: model ?? 'default', ...(toolCalls?.length ? { toolCalls } : {}) } : chunk;
      }
      finished = true;
    } catch (error) {
      failure = error;
      throw error;
    } finally {
      options?.signal?.removeEventListener('abort', cancel);
      // The reader stopped, or the stream broke: stop paying for it
      if (!finished) controller.abort();
      // Cancelled: by the reader stopping (this generator was ended, nothing threw) or by the signal
      const cancelled = !finished && (failure === undefined || (failure instanceof AIError && failure.code === 'ai/aborted'));
      if (finished || text || cancelled) {
        // The provider charges for the prompt once it has it, and for what it wrote, whether or not it got to
        // say so. Unreported usage is estimated, so that cancelling isn't a way past the budget.
        const counted = usage ?? { inputTokens: prompt ? estimateTokens(prompt) : 0, outputTokens: estimateTokens(text) };
        state.lastCall = { model: model ?? 'default', inputTokens: counted.inputTokens, outputTokens: counted.outputTokens, estimated: !usage, interrupted: !finished };
        state.totalInputTokens += counted.inputTokens;
        state.totalOutputTokens += counted.outputTokens;
        if (finished || text) {
          // A reply that was cut short is still what the model said: it stays in the history, marked
          state.messages.push({ role: 'assistant', content: text, toolCalls: finished ? toolCalls : undefined, ...(finished ? {} : { interrupted: true }) });
        } else {
          state.messages.length = before;
        }
        // Not thrown from here: an error in a `finally` would hide the one that ended the stream
        await this.store?.save(id, state).catch((error: unknown) => {
          this.onPersistError?.(error instanceof Error ? error : new Error(String(error)), id);
        });
      } else {
        state.messages.length = before;
      }
    }
  }

  private appendInput(state: SessionState, message: string, toolResults?: ToolResult[]): void {
    if (toolResults?.length) {
      for (const result of toolResults) {
        state.messages.push({
          role: 'tool',
          content: JSON.stringify({
            callId: result.callId,
            result: result.result,
            toolName: result.toolName,
            isError: result.isError,
          }),
        });
      }
    } else if (message) {
      state.messages.push({ role: 'user', content: message });
    }
  }

  private record(state: SessionState, response: AIResponse): void {
    state.totalInputTokens += response.usage.inputTokens;
    state.totalOutputTokens += response.usage.outputTokens;
    state.messages.push({ role: 'assistant', content: response.content, toolCalls: response.toolCalls });
  }
}

export function createSessionManager(
  adapter: Adapter,
  store?: AISessionStore,
  onPersistError?: (error: Error, sessionId: string) => void,
  registry?: ToolSource,
): SessionManager {
  return new SessionManager(adapter, store, onPersistError, registry);
}
