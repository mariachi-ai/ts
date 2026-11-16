import { AIError, type Context } from '@mariachi/core';
import type { AISession, AIResponse, ToolCall, ToolDefinition, ToolResult } from '../types';
import { ToolRegistry } from '../tools/registry';

export const DEFAULT_MAX_ITERATIONS = 10;

export interface RunAgentConfig {
  /** How many model calls the run may make. Default: the session's `maxIterations`, else 10. */
  maxIterations?: number;
  /** The tools to run. Default: the ones the session offers the model. */
  tools?: ToolDefinition[];
  toolRegistry?: ToolRegistry;
  onToolCall?: (call: ToolCall) => void;
  /** Cancels the run: the model call in flight is stopped, and no further tool is run. */
  signal?: AbortSignal;
  /** Passed to each tool's handler. */
  ctx?: Context;
  /** Makes each model call. Default: `session.send`. `ai.runAgent` passes its own, so every call is costed and recorded. */
  send?: (message: string, toolResults?: ToolResult[]) => Promise<AIResponse>;
}

/**
 * The agent loop: send, run the tools the model asks for, send their results, until the model
 * answers without asking for a tool. A tool that throws becomes an error result the model sees.
 *
 * Called on its own, this makes model calls that no cost or telemetry is recorded for. Use
 * `ai.runAgent(ctx, session, message)` unless you are recording them yourself.
 */
export async function runAgent(session: AISession, userMessage: string, config: RunAgentConfig = {}): Promise<AIResponse> {
  const { toolRegistry, onToolCall, signal, ctx } = config;
  const maxIterations = config.maxIterations ?? session.maxIterations ?? DEFAULT_MAX_ITERATIONS;
  if (!Number.isInteger(maxIterations) || maxIterations < 1) throw new AIError('ai/config', 'maxIterations is a whole number, 1 or more');
  const registry =
    toolRegistry ??
    (() => {
      const reg = new ToolRegistry();
      for (const t of config.tools ?? session.tools?.() ?? []) reg.register(t);
      return reg;
    })();
  const send = config.send ?? ((message: string, toolResults?: ToolResult[]) => session.send(message, toolResults, { signal }));
  const cancelled = (): void => {
    if (signal?.aborted) throw new AIError('ai/aborted', 'The agent run was cancelled');
  };

  cancelled();
  let lastResponse: AIResponse = await send(userMessage);
  let iterations = 1;

  while (lastResponse.toolCalls?.length && iterations < maxIterations) {
    const toolResults: ToolResult[] = [];
    for (const tc of lastResponse.toolCalls) {
      cancelled();
      onToolCall?.(tc);
      try {
        const result = await registry.execute(tc.name, tc.arguments, ctx);
        toolResults.push({ callId: tc.id, result, toolName: tc.name });
      } catch (error) {
        toolResults.push({
          callId: tc.id,
          toolName: tc.name,
          isError: true,
          result: { error: error instanceof Error ? error.message : String(error) },
        });
      }
    }
    cancelled();
    lastResponse = await send('', toolResults);
    iterations++;
  }

  if (iterations >= maxIterations && lastResponse.toolCalls?.length) {
    throw new AIError(
      'ai/max-iterations-exceeded',
      `Agent exceeded maxIterations (${maxIterations})`,
      { toolCalls: lastResponse.toolCalls },
    );
  }

  return lastResponse;
}
