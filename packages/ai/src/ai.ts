import type { Context, Logger, Instrumentable } from '@mariachi/core';
import { withSpan, AIError, resolveInstrumentation, type InstrumentationDeps } from '@mariachi/core';
import type { TracerAdapter, MetricsAdapter } from '@mariachi/core';
import type {
  AISession,
  AIResponse,
  CallOptions,
  SessionConfig,
  StreamChunk,
  ToolCall,
  ToolDefinition,
  ToolResult,
  PromptTemplate,
  AITelemetryEntry,
  TokenBudget,
  CostTable,
} from './types';
import type { SessionManager } from './session/manager';
import { runAgent } from './patterns/agent';
import type { ToolRegistry } from './tools/registry';
import type { PromptRegistry } from './prompts/registry';
import type { AITelemetryTracker } from './telemetry';
import { estimateCost, resolveRates } from './cost';

export interface AgentRunOptions extends CallOptions {
  /** How many model calls the run may make. Default: the session's `maxIterations`, else 10. */
  maxIterations?: number;
  /** Tools to run in place of the ones the session offers. They must be ones the session offers the model, or it won't ask for them. */
  tools?: ToolDefinition[];
  onToolCall?: (call: ToolCall) => void;
}

export abstract class AI implements Instrumentable {
  readonly logger: Logger;
  readonly tracer?: TracerAdapter;
  readonly metrics?: MetricsAdapter;
  readonly sessions: SessionManager;
  readonly tools: ToolRegistry;
  readonly prompts: PromptRegistry;
  readonly telemetry: AITelemetryTracker;
  private readonly costTable?: CostTable;
  private readonly unpricedModels = new Set<string>();

  constructor(config: { sessions: SessionManager; tools: ToolRegistry; prompts: PromptRegistry; telemetry: AITelemetryTracker; costTable?: CostTable }, instrumentation?: InstrumentationDeps) {
    const resolved = resolveInstrumentation(instrumentation);
    this.logger = resolved.logger;
    this.tracer = resolved.tracer;
    this.metrics = resolved.metrics;
    this.sessions = config.sessions;
    this.tools = config.tools;
    this.prompts = config.prompts;
    this.telemetry = config.telemetry;
    this.costTable = config.costTable;
    // A telemetry row that can't be written is said, once per failure, where the app's errors are read
    this.telemetry.onPersistError ??= (error, entry) => {
      this.logger.warn({ sessionId: entry.sessionId, model: entry.model, error: error.message }, 'AI telemetry could not be saved');
      this.metrics?.increment('ai.telemetry.persist_error', 1);
    };
  }

  async createSession(ctx: Context, id: string, sessionConfig: SessionConfig): Promise<AISession> {
    return withSpan(this.tracer, 'ai.createSession', { sessionId: id, model: sessionConfig.model ?? 'default' }, async () => {
      this.logger.info({ traceId: ctx.traceId, sessionId: id, model: sessionConfig.model }, 'Creating AI session');
      const session = await this.sessions.createPersisted(id, sessionConfig);
      this.metrics?.increment('ai.session.created', 1, { model: sessionConfig.model ?? 'default' });
      return session;
    });
  }

  /**
   * What every model call ends with, however it was made: its cost worked out, a telemetry entry
   * recorded, metrics counted and a log line written.
   */
  private account(ctx: Context, session: AISession, call: { model: string; inputTokens: number; outputTokens: number; latencyMs: number; kind: 'send' | 'stream' | 'agent'; cancelled?: boolean }): number {
    const cost = estimateCost(call.model, call.inputTokens, call.outputTokens, this.costTable);
    if (!resolveRates(call.model, this.costTable) && !this.unpricedModels.has(call.model)) {
      this.unpricedModels.add(call.model);
      this.logger.warn({ model: call.model }, 'No cost table entry for model; add it to ai.costTable to track spend');
    }
    const entry: AITelemetryEntry = {
      sessionId: session.id,
      model: call.model,
      inputTokens: call.inputTokens,
      outputTokens: call.outputTokens,
      latencyMs: call.latencyMs,
      costUsd: cost,
      createdAt: new Date(),
      tenantId: ctx.tenantId,
      userId: ctx.userId,
    };
    this.telemetry.record(entry);

    this.metrics?.histogram('ai.request.latency', call.latencyMs, { model: call.model });
    this.metrics?.increment('ai.tokens.input', call.inputTokens, { model: call.model });
    this.metrics?.increment('ai.tokens.output', call.outputTokens, { model: call.model });
    this.metrics?.increment('ai.request.count', 1, { model: call.model, kind: call.kind });
    if (call.cancelled) this.metrics?.increment('ai.request.cancelled', 1, { model: call.model });

    this.logger.info(
      {
        traceId: ctx.traceId,
        sessionId: session.id,
        model: call.model,
        kind: call.kind,
        inputTokens: call.inputTokens,
        outputTokens: call.outputTokens,
        latencyMs: call.latencyMs,
        costUsd: cost,
        ...(call.cancelled ? { cancelled: true } : {}),
      },
      call.cancelled ? 'AI response cancelled' : 'AI response received',
    );
    return cost;
  }

  private async assertBudget(ctx: Context, session: AISession): Promise<void> {
    if (!session.budget) return;
    const check = await this.checkTokenBudget(ctx, session, session.budget);
    if (!check.allowed) throw new AIError('ai/token-budget-exceeded', check.reason ?? 'Token budget exceeded');
  }

  private async failed(ctx: Context, session: AISession, error: unknown): Promise<AIError> {
    const cancelled = error instanceof AIError && error.code === 'ai/aborted';
    this.metrics?.increment(cancelled ? 'ai.request.cancelled' : 'ai.request.error', 1);
    if (!cancelled) {
      this.logger.error({ traceId: ctx.traceId, sessionId: session.id, error: (error as Error).message }, 'AI request failed');
      await this.onRequestFailed?.(ctx, session, error as Error);
    }
    return error instanceof AIError ? error : new AIError('ai/request-failed', (error as Error).message);
  }

  /** One model call, costed and recorded. `send`, and each step of `runAgent`, is this. */
  private async exchange(ctx: Context, session: AISession, message: string, toolResults: ToolResult[] | undefined, options: CallOptions | undefined, kind: 'send' | 'agent'): Promise<AIResponse> {
    return withSpan(this.tracer, 'ai.send', { sessionId: session.id }, async (span) => {
      const start = performance.now();
      this.logger.info({ traceId: ctx.traceId, sessionId: session.id }, 'Sending message to AI');
      await this.assertBudget(ctx, session);
      try {
        const response = await session.send(message, toolResults, options);
        const cost = this.account(ctx, session, {
          model: response.model,
          inputTokens: response.usage.inputTokens,
          outputTokens: response.usage.outputTokens,
          latencyMs: performance.now() - start,
          kind,
        });
        span?.setAttribute('model', response.model);
        span?.setAttribute('inputTokens', response.usage.inputTokens);
        span?.setAttribute('outputTokens', response.usage.outputTokens);
        span?.setAttribute('costUsd', cost);
        await this.onResponse?.(ctx, session, response);
        return response;
      } catch (error) {
        throw await this.failed(ctx, session, error);
      }
    });
  }

  async send(ctx: Context, session: AISession, message: string, options?: CallOptions): Promise<AIResponse> {
    return this.exchange(ctx, session, message, undefined, options, 'send');
  }

  /**
   * The reply as it is written, costed and recorded like `send`. The last chunk has `done: true`
   * with the usage, the model and any tool calls. Pass the request's signal, or just stop reading:
   * either cancels the provider call, and the part already written is still recorded and costed
   * with whatever usage the provider reported.
   */
  async *stream(ctx: Context, session: AISession, message: string, options?: CallOptions): AsyncIterable<StreamChunk> {
    if (!session.stream) throw new AIError('ai/not-supported', 'This session cannot stream');
    await this.assertBudget(ctx, session);
    const start = performance.now();
    this.logger.info({ traceId: ctx.traceId, sessionId: session.id }, 'Streaming message to AI');
    let content = '';
    let last: StreamChunk | undefined;
    let usage: StreamChunk['usage'];
    let finished = false;
    let failure: unknown;
    try {
      for await (const chunk of session.stream(message, options)) {
        content += chunk.content;
        if (chunk.usage) usage = chunk.usage;
        if (chunk.done) {
          last = chunk;
          finished = true;
        }
        yield chunk;
      }
      finished = true;
    } catch (error) {
      failure = error;
      throw await this.failed(ctx, session, error);
    } finally {
      // Also when the reader stopped early, which ends this generator without an error
      if (finished || usage || content) {
        const cancelled = !finished && (failure === undefined || (failure instanceof AIError && failure.code === 'ai/aborted'));
        this.account(ctx, session, {
          model: last?.model ?? 'default',
          inputTokens: usage?.inputTokens ?? 0,
          outputTokens: usage?.outputTokens ?? 0,
          latencyMs: performance.now() - start,
          kind: 'stream',
          cancelled,
        });
      }
    }
    if (last) {
      const inputTokens = usage?.inputTokens ?? 0;
      const outputTokens = usage?.outputTokens ?? 0;
      await this.onResponse?.(ctx, session, {
        content,
        toolCalls: last.toolCalls,
        usage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens },
        model: last.model ?? 'default',
        latencyMs: Math.round(performance.now() - start),
      });
    }
  }

  /**
   * Runs the agent loop on a session: the model is called, the tools it asks for are run with `ctx`,
   * and their results sent back, until it answers. Every model call in the run is costed and
   * recorded as `send` is, and stops at the session's budget.
   */
  async runAgent(ctx: Context, session: AISession, message: string, options: AgentRunOptions = {}): Promise<AIResponse> {
    return withSpan(this.tracer, 'ai.runAgent', { sessionId: session.id }, async (span) => {
      let calls = 0;
      const response = await runAgent(session, message, {
        maxIterations: options.maxIterations,
        tools: options.tools,
        signal: options.signal,
        ctx,
        onToolCall: (call) => {
          this.metrics?.increment('ai.tool.called', 1, { tool: call.name });
          this.logger.info({ traceId: ctx.traceId, sessionId: session.id, tool: call.name }, 'Running tool');
          options.onToolCall?.(call);
        },
        send: (text, toolResults) => {
          calls += 1;
          return this.exchange(ctx, session, text, toolResults, { signal: options.signal }, 'agent');
        },
      });
      span?.setAttribute('modelCalls', calls);
      return response;
    });
  }

  registerTool(tool: ToolDefinition): void {
    this.tools.register(tool);
    this.logger.info({ tool: tool.name }, 'Tool registered');
  }

  registerPrompt(prompt: PromptTemplate): void {
    this.prompts.register(prompt);
  }

  async checkTokenBudget(ctx: Context, session: AISession, budget: TokenBudget): Promise<{ allowed: boolean; reason?: string; usage: { total: number; limit: number } }> {
    const used = session.usage?.() ?? { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    const totalTokens = used.totalTokens;
    const limit = budget.maxTotalTokens ?? Number.POSITIVE_INFINITY;

    if (budget.warningThresholdPercent && totalTokens > limit * (budget.warningThresholdPercent / 100)) {
      this.logger.warn({ traceId: ctx.traceId, sessionId: session.id, totalTokens, limit }, 'Token budget warning threshold reached');
    }

    const spent: Array<[what: string, used: number, limit: number | undefined]> = [
      ['', totalTokens, budget.maxTotalTokens],
      [' input tokens', used.inputTokens, budget.maxInputTokens],
      [' output tokens', used.outputTokens, budget.maxOutputTokens],
    ];
    for (const [what, total, max] of spent) {
      if (max === undefined || total < max) continue;
      this.metrics?.increment('ai.token_budget.exceeded', 1);
      await this.onTokenBudgetExceeded?.(ctx, session, { total, limit: max });
      return { allowed: false, reason: `Token budget exceeded: ${total}/${max}${what}`, usage: { total, limit: max } };
    }

    return { allowed: true, usage: { total: totalTokens, limit } };
  }

  protected onResponse?(ctx: Context, session: AISession, response: AIResponse): Promise<void>;
  protected onRequestFailed?(ctx: Context, session: AISession, error: Error): Promise<void>;
  protected onTokenBudgetExceeded?(ctx: Context, session: AISession, usage: { total: number; limit: number }): Promise<void>;
}

export class DefaultAI extends AI {}
