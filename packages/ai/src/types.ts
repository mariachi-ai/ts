import type { z } from 'zod';
import type { Context } from '@mariachi/core';

export interface AIConfig {
  /** `'openai'`, `'anthropic'`, `'google'`, or `'custom'` with `instance`. */
  adapter: string;
  apiKey?: string;
  /**
   * Where the provider's API is, for a proxy, a gateway or a local model server. Each adapter reads
   * it as its provider's own SDK does: Anthropic takes the host without `/v1`; OpenAI and Google
   * take the full prefix (`…/v1`, `…/v1beta`).
   */
  baseURL?: string;
  defaultModel?: string;
  /** Tried in order when the primary model fails. */
  fallbackModels?: string[];
  /** USD per 1K tokens. Overrides the built-in table. */
  costTable?: CostTable;
}

export type CostTable = Record<string, { input: number; output: number }>;

export interface AIProvider {
  id: string;
  generate(messages: AIMessage[], config: { model?: string; tools?: ToolDefinition[]; userId?: string }): Promise<AIResponse>;
  stream?(messages: AIMessage[], config: { model?: string; tools?: ToolDefinition[]; userId?: string }): AsyncIterable<StreamChunk>;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  /** An assistant message that was cut short: the call was cancelled, or failed, after this much was written. */
  interrupted?: boolean;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  callId: string;
  result: unknown;
  toolName?: string;
  /** Set when the tool threw. The agent loop keeps going and shows this to the model. */
  isError?: boolean;
}

/** Options of one model call. */
export interface CallOptions {
  /** Cancels the call. A cancelled call ends with `ai/aborted`; what the model wrote so far is kept in the history. */
  signal?: AbortSignal;
}

export interface AISession {
  id: string;
  send(message: string, toolResults?: ToolResult[], options?: CallOptions): Promise<AIResponse>;
  /**
   * The reply as it is written. The last chunk has `done: true` with the usage, the model and any
   * tool calls. Stop reading (`break`, or the client going away) and the provider call is cancelled.
   */
  stream?(message: string, options?: CallOptions): AsyncIterable<StreamChunk>;
  getHistory(): AIMessage[];
  usage?(): { inputTokens: number; outputTokens: number; totalTokens: number };
  budget?: TokenBudget;
  /** The tools the model is offered in this session. */
  tools?(): ToolDefinition[];
  /** The session's `maxIterations`, which an agent run uses unless told otherwise. */
  maxIterations?: number;
  /** What the session counted for its latest call, or undefined when that call counted nothing. */
  lastCall?(): CallRecord | undefined;
}

/** What one model call used, as the session counted it. */
export interface CallRecord {
  model: string;
  inputTokens: number;
  outputTokens: number;
  /** The provider reported no usage (the call was cut short), so the tokens are an estimate from the text: four characters each. */
  estimated: boolean;
  /** The reply was cut short. */
  interrupted: boolean;
}

export interface AIResponse {
  content: string;
  toolCalls?: ToolCall[];
  usage: { inputTokens: number; outputTokens: number; totalTokens: number };
  model: string;
  latencyMs: number;
}

export interface ToolDefinition<T = unknown> {
  name: string;
  description: string;
  schema: z.ZodType<T>;
  /**
   * `ctx` is the context of the agent run that called the tool, when there is one (`ai.runAgent(ctx, ...)`).
   * (Written as a method so that a tool with a typed input can go wherever a tool is taken.)
   */
  handler(input: T, ctx?: Context): Promise<unknown>;
}

export interface PromptTemplate {
  name: string;
  version: string;
  template: string;
  variables?: string[];
}

export interface AITelemetryEntry {
  sessionId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  costUsd: number;
  createdAt: Date;
  /** From the context of the call. */
  tenantId?: string | null;
  userId?: string | null;
  /** The provider reported no usage for this call (it was cut short): the tokens and the cost are estimates. */
  estimated?: boolean;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  usage?: { inputTokens: number; outputTokens: number };
  /** On the last chunk: the tools the model asked for, if any. */
  toolCalls?: ToolCall[];
  /** On the last chunk: the model that answered. */
  model?: string;
}

/** Limits on what a session may use in all, across its calls. A call that starts at or past one is refused. */
export interface TokenBudget {
  maxInputTokens?: number;
  maxOutputTokens?: number;
  maxTotalTokens?: number;
  warningThresholdPercent?: number;
}

export interface SessionConfig {
  model?: string;
  /** Tried in order when `model` fails. */
  models?: string[];
  systemPrompt?: string;
  tenantId?: string;
  userId?: string;
  /** Tools for this session only. Their handlers live in memory: a session loaded in another process gets them by name. */
  tools?: ToolDefinition[];
  /**
   * Registered tools (`ai.registerTool`) this session offers, by name, or `'*'` for every registered
   * tool. This is what is saved with the session, so a session opened later, or in another process,
   * gets working tools back. A session with neither `tools` nor `toolNames` offers none: registering
   * a tool makes it available, and only naming it puts it in front of a model.
   */
  toolNames?: string[] | '*';
  /** How many model calls one agent run may make. Default 10. */
  maxIterations?: number;
  budget?: TokenBudget;
}
