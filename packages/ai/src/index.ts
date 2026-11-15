import { AIError } from '@mariachi/core';
import type { AIConfig } from './types';
import { AnthropicAdapter, DEFAULT_ANTHROPIC_MODEL } from './adapters/anthropic';
import { GoogleAdapter } from './adapters/google';
import { OpenAIAdapter } from './adapters/openai';
import { FallbackAdapter, type FallbackProvider } from './adapters/fallback';
import { SessionManager, type AISessionStore, type Adapter as AIAdapter } from './session/manager';
import { ToolRegistry } from './tools/registry';
import { PromptRegistry } from './prompts/registry';
import { AITelemetryTracker } from './telemetry';
import type { AITelemetryEntry } from './types';

/**
 * Builds the pieces `DefaultAI` needs. `adapter` is `'openai'`, `'anthropic'` or `'google'` (the last
 * two import their optional peer, `@ai-sdk/anthropic` or `@ai-sdk/google`, on the first call), or
 * `'custom'` with `instance` for anything else. `baseURL` points the adapter at a proxy, a gateway
 * or a local model server. `fallbackProviders` are tried in order after the primary fails.
 */
export function createAI(config: AIConfig & {
  instance?: AIAdapter;
  fallbackProviders?: FallbackProvider[];
  sessions?: AISessionStore;
  /** Where each model call's telemetry entry is written. Default: the session store, when it keeps telemetry (the Postgres one does). */
  persistTelemetry?: (entry: AITelemetryEntry) => void | Promise<void>;
  onPersistError?: (error: Error, sessionId: string) => void;
}) {
  let primary: AIAdapter;
  let primaryModels: string[] | undefined;
  if (config.adapter === 'openai') {
    primary = new OpenAIAdapter({ apiKey: config.apiKey, baseURL: config.baseURL, defaultModel: config.defaultModel });
    primaryModels = [config.defaultModel ?? 'gpt-4o-mini'];
  } else if (config.adapter === 'anthropic') {
    primary = new AnthropicAdapter({ apiKey: config.apiKey, baseURL: config.baseURL, defaultModel: config.defaultModel });
    primaryModels = [config.defaultModel ?? DEFAULT_ANTHROPIC_MODEL];
  } else if (config.adapter === 'google') {
    if (!config.defaultModel) throw new AIError('ai/config', "adapter 'google' requires defaultModel");
    primary = new GoogleAdapter({ apiKey: config.apiKey, baseURL: config.baseURL, defaultModel: config.defaultModel });
    primaryModels = [config.defaultModel];
  } else if (config.adapter === 'custom') {
    if (!config.instance) throw new AIError('ai/config', "adapter 'custom' requires instance");
    primary = config.instance;
    primaryModels = config.defaultModel ? [config.defaultModel] : undefined;
  } else {
    throw new AIError('ai/unknown-adapter', `Unknown adapter: ${config.adapter}`);
  }

  const chain: FallbackProvider[] = [];
  if (config.fallbackModels?.length) {
    chain.push({ id: config.adapter, adapter: primary, models: [...(primaryModels ?? []), ...config.fallbackModels] });
  } else if (config.fallbackProviders?.length) {
    chain.push({ id: config.adapter, adapter: primary, models: primaryModels });
  }
  chain.push(...(config.fallbackProviders ?? []));
  const adapter: AIAdapter = chain.length ? new FallbackAdapter(chain) : primary;

  const tools = new ToolRegistry();
  // The registry is where a session finds its tools, so `ai.registerTool` is all a tool needs
  const sessions = new SessionManager(adapter, config.sessions, config.onPersistError, tools);
  const prompts = new PromptRegistry();
  const store = config.sessions;
  const telemetry = new AITelemetryTracker(config.persistTelemetry ?? (store?.recordTelemetry ? (entry) => store.recordTelemetry?.(entry) : undefined));

  return {
    sessions,
    tools,
    prompts,
    telemetry,
    costTable: config.costTable,
  };
}

export type {
  AIConfig,
  AIMessage,
  AISession,
  AIResponse,
  ToolCall,
  ToolResult,
  ToolDefinition,
  PromptTemplate,
  AITelemetryEntry,
  SessionConfig,
  StreamChunk,
  CallOptions,
  TokenBudget,
  CostTable,
  AIProvider,
} from './types';

export { OpenAIAdapter, type OpenAIAdapterConfig } from './adapters/openai';
export { AnthropicAdapter, anthropicBaseUrl, DEFAULT_ANTHROPIC_MODEL, type AnthropicAdapterConfig } from './adapters/anthropic';
export { GoogleAdapter, type GoogleAdapterConfig } from './adapters/google';
export { AISdkAdapter, type AISdkAdapterOptions, type ModelFactory } from './adapters/ai-sdk';
export { FallbackAdapter, type FallbackProvider } from './adapters/fallback';
export { SessionManager, type AISessionStore, type SessionState, type Adapter as AIAdapter, type AdapterCallConfig, type ToolSource } from './session/manager';
export { ToolRegistry } from './tools/registry';
export { PromptRegistry } from './prompts/registry';
export { AITelemetryTracker } from './telemetry';
export { runAgent, type RunAgentConfig } from './patterns/agent';
export { toSse, type AIStreamEvents } from './patterns/sse';
export { createRAGPipeline } from './patterns/rag';
export { estimateCost, resolveRates, DEFAULT_COST_TABLE } from './cost';
export { AI, DefaultAI, type AgentRunOptions } from './ai';
export * from './schema/index';
