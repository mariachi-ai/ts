import { createOpenAI } from '@ai-sdk/openai';
import { AISdkAdapter } from './ai-sdk';

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

export class OpenAIAdapter extends AISdkAdapter {
  constructor(config: OpenAIAdapterConfig = {}) {
    const provider = createOpenAI({ apiKey: config.apiKey, baseURL: config.baseURL, fetch: config.fetch });
    const api = config.api ?? (config.baseURL ? 'chat' : 'responses');
    super('openai', (modelId) => (api === 'chat' ? provider.chat(modelId) : provider.responses(modelId)), config.defaultModel ?? 'gpt-4o-mini');
  }
}
