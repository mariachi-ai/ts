import { generateText, streamText, type JSONValue, type LanguageModel, type ModelMessage } from 'ai';
import { AIError } from '@mariachi/core';
import type { AdapterCallConfig } from '../session/manager';
import type { AIMessage, AIResponse, StreamChunk, ToolDefinition } from '../types';

function toModelMessages(messages: AIMessage[]): { instructions?: string; messages: ModelMessage[] } {
  const systems: string[] = [];
  const out: ModelMessage[] = [];
  for (const message of messages) {
    if (message.role === 'system') {
      systems.push(message.content);
      continue;
    }
    if (message.role === 'tool') {
      const parsed = JSON.parse(message.content) as { callId?: string; result?: unknown; toolName?: string; isError?: boolean };
      out.push({
        role: 'tool',
        content: [{
          type: 'tool-result',
          toolCallId: parsed.callId ?? '',
          toolName: parsed.toolName ?? 'tool',
          output: parsed.isError
            ? { type: 'error-text', value: typeof parsed.result === 'string' ? parsed.result : JSON.stringify(parsed.result) }
            : { type: 'json', value: JSON.parse(JSON.stringify(parsed.result ?? null)) as JSONValue },
        }],
      });
      continue;
    }
    if (message.role === 'assistant' && message.toolCalls?.length) {
      out.push({
        role: 'assistant',
        content: [
          ...(message.content ? [{ type: 'text' as const, text: message.content }] : []),
          ...message.toolCalls.map((call) => ({
            type: 'tool-call' as const,
            toolCallId: call.id,
            toolName: call.name,
            input: call.arguments,
          })),
        ],
      });
      continue;
    }
    out.push({ role: message.role, content: message.content });
  }
  return { instructions: systems.length ? systems.join('\n') : undefined, messages: out };
}

function toTools(tools: ToolDefinition[] | undefined) {
  if (!tools?.length) return undefined;
  return Object.fromEntries(tools.map((item) => [item.name, {
    description: item.description,
    inputSchema: item.schema,
  }]));
}

/** A cancelled call, told apart from a provider failure. */
function aborted(config: AdapterCallConfig, error: unknown): AIError | undefined {
  const cancelled = config.signal?.aborted || (error instanceof Error && error.name === 'AbortError');
  return cancelled ? new AIError('ai/aborted', 'The request was cancelled') : undefined;
}

function toToolCalls(calls: Array<{ toolCallId: string; toolName: string; input?: unknown }> | undefined) {
  if (!calls?.length) return undefined;
  return calls.map((call) => ({ id: call.toolCallId, name: call.toolName, arguments: (call.input ?? {}) as Record<string, unknown> }));
}

function usageOf(usage: { inputTokens?: number; outputTokens?: number } | undefined) {
  const inputTokens = usage?.inputTokens ?? 0;
  const outputTokens = usage?.outputTokens ?? 0;
  return { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens };
}

type ProviderOptions = Record<string, Record<string, JSONValue>>;

export interface AISdkAdapterOptions {
  /** Provider-specific options for a call (the AI SDK's `providerOptions`), e.g. to pass the caller's user id. */
  providerOptions?: (call: AdapterCallConfig) => ProviderOptions | undefined;
}

/** A model factory may be async, so a provider package can be imported on first use. */
export type ModelFactory = (modelId: string) => LanguageModel | Promise<LanguageModel>;

/**
 * Adapter over any AI SDK provider. `OpenAIAdapter`, `AnthropicAdapter` and `GoogleAdapter` are thin
 * subclasses; pass another provider's model factory to support it without a new adapter.
 */
export class AISdkAdapter {
  constructor(
    readonly name: string,
    private readonly model: ModelFactory,
    protected readonly defaultModel: string,
    private readonly options: AISdkAdapterOptions = {},
  ) {}

  /** The model to call. A missing provider package is the caller's to fix, so its error passes through. */
  private async resolve(modelId: string): Promise<LanguageModel> {
    if (!modelId) throw new AIError('ai/config', `${this.name} adapter has no model: set defaultModel or the session's model`);
    return this.model(modelId);
  }

  async generate(messages: AIMessage[], config: AdapterCallConfig = {}): Promise<AIResponse> {
    const modelId = config.model ?? this.defaultModel;
    const model = await this.resolve(modelId);
    const prompt = toModelMessages(messages);
    const start = performance.now();
    try {
      const result = await generateText({
        model,
        instructions: prompt.instructions,
        messages: prompt.messages,
        tools: toTools(config.tools),
        providerOptions: this.options.providerOptions?.(config),
        abortSignal: config.signal,
        maxOutputTokens: config.maxOutputTokens,
      });
      return {
        content: result.text ?? '',
        toolCalls: toToolCalls(result.toolCalls),
        usage: usageOf(result.usage),
        model: modelId,
        latencyMs: Math.round(performance.now() - start),
      };
    } catch (error) {
      const cancelled = aborted(config, error);
      if (cancelled) throw cancelled;
      throw new AIError('ai/request-failed', error instanceof Error ? error.message : `${this.name} request failed`, {
        provider: this.name,
        model: modelId,
      });
    }
  }

  async *stream(messages: AIMessage[], config: AdapterCallConfig = {}): AsyncIterable<StreamChunk> {
    const modelId = config.model ?? this.defaultModel;
    const model = await this.resolve(modelId);
    const prompt = toModelMessages(messages);
    try {
      const result = streamText({
        model,
        instructions: prompt.instructions,
        messages: prompt.messages,
        tools: toTools(config.tools),
        providerOptions: this.options.providerOptions?.(config),
        abortSignal: config.signal,
        maxOutputTokens: config.maxOutputTokens,
      });
      // The full stream says how it ended: a `finish` part is a complete reply whatever the signal says by
      // then, an `abort` part a cancelled one, an `error` part a failed one
      const calls: Array<{ toolCallId: string; toolName: string; input?: unknown }> = [];
      let finished = false;
      for await (const part of result.fullStream) {
        if (part.type === 'text-delta') {
          if (part.text) yield { content: part.text, done: false };
        } else if (part.type === 'tool-call') {
          calls.push(part);
        } else if (part.type === 'abort') {
          throw new AIError('ai/aborted', 'The request was cancelled');
        } else if (part.type === 'error') {
          throw part.error;
        } else if (part.type === 'finish') {
          finished = true;
          yield {
            content: '',
            done: true,
            usage: { inputTokens: part.totalUsage.inputTokens ?? 0, outputTokens: part.totalUsage.outputTokens ?? 0 },
            model: modelId,
            toolCalls: toToolCalls(calls),
          };
        }
      }
      if (!finished) {
        throw aborted(config, undefined) ?? new AIError('ai/request-failed', `${this.name} ended the stream without finishing the reply`, { provider: this.name, model: modelId });
      }
    } catch (error) {
      if (error instanceof AIError) throw error;
      const cancelled = aborted(config, error);
      if (cancelled) throw cancelled;
      throw new AIError('ai/request-failed', error instanceof Error ? error.message : `${this.name} stream failed`, {
        provider: this.name,
        model: modelId,
      });
    }
  }
}
