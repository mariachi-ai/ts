import type { StreamChunk, ToolCall } from '../types';

/** A model stream as server-sent events, with what to send when it ends. */
export interface AIStreamEvents {
  /** `delta` events with `{ content }`, and a `tool-calls` event when the model asks for tools. */
  events: AsyncIterable<{ event: string; data: unknown }>;
  /** The data of the closing `done` event: the usage and the model, once the stream has ended. */
  done: () => { usage?: { inputTokens: number; outputTokens: number }; model?: string };
}

/**
 * Turns `ai.stream(...)` into what `sseResponse` takes:
 *
 * ```ts
 * const { events, done } = toSse(ai.stream(ctx, session, message, { signal: ctx.request.signal }));
 * return sseResponse(events, { done });
 * ```
 *
 * The browser gets `delta` events as the reply is written, then one `done` event with the usage and
 * the model. When the browser goes away, the transport stops reading, which cancels the model call.
 */
export function toSse(chunks: AsyncIterable<StreamChunk>): AIStreamEvents {
  let usage: StreamChunk['usage'];
  let model: string | undefined;
  async function* events(): AsyncIterable<{ event: string; data: unknown }> {
    for await (const chunk of chunks) {
      if (chunk.content) yield { event: 'delta', data: { content: chunk.content } };
      if (chunk.usage) usage = chunk.usage;
      if (chunk.model) model = chunk.model;
      if (chunk.toolCalls?.length) yield { event: 'tool-calls', data: chunk.toolCalls satisfies ToolCall[] };
    }
  }
  return { events: events(), done: () => ({ ...(usage ? { usage } : {}), ...(model ? { model } : {}) }) };
}
