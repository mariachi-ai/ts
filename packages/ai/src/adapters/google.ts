import type { LanguageModel } from 'ai';
import { AISdkAdapter } from './ai-sdk';
import { lazyPeer } from './peer';

export interface GoogleAdapterConfig {
  /** Without it, `@ai-sdk/google` reads `GOOGLE_GENERATIVE_AI_API_KEY`. */
  apiKey?: string;
  /** The full URL prefix, version included (default `https://generativelanguage.googleapis.com/v1beta`). */
  baseURL?: string;
  /** No built-in default: name the Gemini model here, or on each session. */
  defaultModel?: string;
  /** A `fetch` to use in place of the global one (tests, proxies). */
  fetch?: typeof globalThis.fetch;
}

/** Gemini models through `@ai-sdk/google`, an optional peer dependency that's imported on the first call. */
export class GoogleAdapter extends AISdkAdapter {
  constructor(config: GoogleAdapterConfig = {}) {
    const provider = lazyPeer('@ai-sdk/google', 'GoogleAdapter', async () => {
      const { createGoogleGenerativeAI } = await import('@ai-sdk/google');
      return createGoogleGenerativeAI({ apiKey: config.apiKey, baseURL: config.baseURL, fetch: config.fetch });
    });
    // The cast bridges two patch versions of the AI SDK's model interface (the provider package may be newer than `ai`).
    super('google', async (modelId) => (await provider())(modelId) as unknown as LanguageModel, config.defaultModel ?? '');
  }
}
