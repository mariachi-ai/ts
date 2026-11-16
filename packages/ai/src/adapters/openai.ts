import { AISdkAdapter } from './ai-sdk';
import { lazyPeer } from './peer';

export interface OpenAIAdapterConfig {
  apiKey?: string;
  /**
   * The full URL prefix, `/v1` included, as in OpenAI's own SDK (default `https://api.openai.com/v1`).
   * Point it at any server that speaks OpenAI's API: a proxy, or a local model server such as
   * `http://localhost:11434/v1`.
   */
  baseURL?: string;
  /**
   * Which OpenAI API to call. Default `'responses'`, or `'chat'` (Chat Completions) when `baseURL`
   * is set, since most OpenAI-compatible servers only implement that one.
   */
  api?: 'responses' | 'chat';
  /** Default `gpt-4o-mini`. */
  defaultModel?: string;
  /** A `fetch` to use in place of the global one (tests, proxies). */
  fetch?: typeof globalThis.fetch;
}

/**
 * OpenAI's models, and any server that speaks its API, through `@ai-sdk/openai`: an optional peer
 * dependency that's imported on the first call (`pnpm add @ai-sdk/openai`).
 */
export class OpenAIAdapter extends AISdkAdapter {
  constructor(config: OpenAIAdapterConfig = {}) {
    const provider = lazyPeer('@ai-sdk/openai', 'OpenAIAdapter', async () => {
      const { createOpenAI } = await import('@ai-sdk/openai');
      return createOpenAI({ apiKey: config.apiKey, baseURL: config.baseURL, fetch: config.fetch });
    });
    const api = config.api ?? (config.baseURL ? 'chat' : 'responses');
    super('openai', async (modelId) => (api === 'chat' ? (await provider()).chat(modelId) : (await provider()).responses(modelId)), config.defaultModel ?? 'gpt-4o-mini');
  }
}
