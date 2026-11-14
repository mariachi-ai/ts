import { AISdkAdapter } from './ai-sdk';
import { lazyPeer } from './peer';

export const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-5-5';

export interface AnthropicAdapterConfig {
  /** Sent as `x-api-key`. Without it, `@ai-sdk/anthropic` reads `ANTHROPIC_API_KEY`. */
  apiKey?: string;
  /**
   * The API's host, without `/v1`, as in Anthropic's own SDK: `https://api.anthropic.com` by default,
   * or a gateway that speaks the Messages API. A URL that already ends in `/v1` is taken as it is.
   */
  baseURL?: string;
  /** Default `claude-sonnet-5-5`. */
  defaultModel?: string;
  /**
   * Send the session's `userId` as `metadata.user_id`, which a provider or gateway can use for
   * per-user limits and abuse detection. Default false. Only for opaque ids: never an email
   * address, a name or a phone number.
   */
  forwardUserId?: boolean;
  /**
   * Let `anthropic-beta` headers through. Default false: `@ai-sdk/anthropic` adds one whenever
   * tools are passed to a model that supports structured output, the calls this adapter makes work
   * without it, and a gateway may refuse beta headers.
   */
  allowBetaHeaders?: boolean;
  /** A `fetch` to use in place of the global one (tests, proxies). */
  fetch?: typeof globalThis.fetch;
}

/** `https://host` → `https://host/v1`; a URL already ending in `/v1` is kept. */
export function anthropicBaseUrl(baseURL: string | undefined): string | undefined {
  if (!baseURL) return undefined;
  const trimmed = baseURL.replace(/\/+$/, '');
  return /\/v1$/.test(trimmed) ? trimmed : `${trimmed}/v1`;
}

function withoutBetaHeaders(inner: typeof globalThis.fetch): typeof globalThis.fetch {
  return (input, init) => {
    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
    headers.delete('anthropic-beta');
    return inner(input, { ...init, headers });
  };
}

/**
 * Claude models through `@ai-sdk/anthropic`, an optional peer dependency that's imported on the
 * first call. Also exported from `@mariachi/ai/anthropic`.
 */
export class AnthropicAdapter extends AISdkAdapter {
  constructor(config: AnthropicAdapterConfig = {}) {
    const provider = lazyPeer('@ai-sdk/anthropic', 'AnthropicAdapter', async () => {
      const { createAnthropic } = await import('@ai-sdk/anthropic');
      const fetch = config.fetch ?? globalThis.fetch;
      return createAnthropic({
        apiKey: config.apiKey,
        baseURL: anthropicBaseUrl(config.baseURL),
        fetch: config.allowBetaHeaders ? config.fetch : withoutBetaHeaders(fetch),
      });
    });
    super('anthropic', async (modelId) => (await provider())(modelId), config.defaultModel ?? DEFAULT_ANTHROPIC_MODEL, {
      providerOptions: (call) => (config.forwardUserId && call.userId ? { anthropic: { metadata: { userId: call.userId } } } : undefined),
    });
  }
}
