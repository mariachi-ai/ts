import { IntegrationError } from '@mariachi/core';

/**
 * What went wrong with a call to a provider, the same seven words for every provider. An app decides what to
 * do from the category, never from a provider's own code: `rate-limited` and `unavailable` are retried by
 * `callProvider`, everything else fails at once.
 */
export const ERROR_CATEGORIES = [
  'unauthorized',
  'forbidden',
  'not-found',
  'invalid-request',
  'conflict',
  'rate-limited',
  'unavailable',
] as const;

export type ErrorCategory = (typeof ERROR_CATEGORIES)[number];

/** The categories `callProvider` retries. A retry of anything else would fail the same way again. */
export const RETRIED_CATEGORIES: ReadonlySet<ErrorCategory> = new Set(['rate-limited', 'unavailable']);

/**
 * The HTTP status an app's own API answers with when a provider call fails and the error isn't caught. The
 * provider failing is the app's upstream failing, so most are 502; a provider's not-found, conflict and
 * invalid request usually mean the app asked for something that doesn't exist or can't be done.
 */
const STATUS_FOR: Record<ErrorCategory, number> = {
  unauthorized: 502,
  forbidden: 502,
  'not-found': 404,
  'invalid-request': 422,
  conflict: 409,
  'rate-limited': 503,
  unavailable: 502,
};

export interface ProviderErrorOptions {
  category: ErrorCategory;
  /** The provider's own code for it, such as `card_declined`. Never its message: messages can carry data. */
  providerCode?: string;
  /** The provider's HTTP status, when it answered. */
  status?: number;
  /** How long the provider asked to wait (`Retry-After`), in milliseconds. */
  retryAfterMs?: number;
  details?: Record<string, unknown>;
}

/**
 * A call to a provider that failed. Each integration subclasses it (`class HubSpotError extends ProviderError`)
 * with codes `<provider>/<reason>`, such as `hubspot/rate-limited` or `stripe/card-declined`.
 */
export class ProviderError extends IntegrationError {
  readonly category: ErrorCategory;
  readonly providerCode?: string;
  readonly status?: number;
  readonly retryAfterMs?: number;
  readonly statusCode: number;

  constructor(code: string, message: string, options: ProviderErrorOptions) {
    super(code, message, { ...options.details, category: options.category, providerCode: options.providerCode, status: options.status });
    this.name = 'ProviderError';
    this.category = options.category;
    this.providerCode = options.providerCode;
    this.status = options.status;
    this.retryAfterMs = options.retryAfterMs;
    this.statusCode = STATUS_FOR[options.category];
  }

  get retryable(): boolean {
    return RETRIED_CATEGORIES.has(this.category);
  }
}

/** The category an HTTP status means, for a provider that gives no code of its own. */
export function categoryForStatus(status: number): ErrorCategory {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404 || status === 410) return 'not-found';
  if (status === 409) return 'conflict';
  if (status === 429) return 'rate-limited';
  if (status >= 500 || status === 408) return 'unavailable';
  return 'invalid-request';
}

/**
 * `Retry-After` in milliseconds: seconds, or an HTTP date. Undefined when absent or unreadable. Capped at five
 * minutes, so a provider can't hold a request open for ever.
 */
export function parseRetryAfter(value: string | null | undefined, now: number = Date.now()): number | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  const MAX = 5 * 60_000;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return Math.min(MAX, Math.round(Number(trimmed) * 1000));
  const at = Date.parse(trimmed);
  if (Number.isNaN(at)) return undefined;
  return Math.min(MAX, Math.max(0, at - now));
}
