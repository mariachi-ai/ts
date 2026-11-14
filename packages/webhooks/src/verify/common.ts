import { createHmac, timingSafeEqual } from 'node:crypto';
import { AuthError, ConfigError } from '@mariachi/core';

export type WebhookHeaders = Record<string, string | string[] | undefined>;

/** How far a signed timestamp may be from now, either way, in seconds. */
export const DEFAULT_TOLERANCE_SECONDS = 300;

export interface TimestampOptions {
  /** Default 300 (five minutes). */
  toleranceSeconds?: number;
  /** The current time in Unix seconds, for tests. */
  nowSeconds?: number;
}

/** What a verifier returns once the signature holds. */
export interface VerifiedWebhook {
  /** The sender's id for this delivery, to deduplicate on. Absent when the sender gives none. */
  eventId?: string;
  /** The signed timestamp, for schemes that have one. */
  timestampSeconds?: number;
}

/** A header's value whatever the case of its name; the first one when repeated. */
export function headerValue(headers: WebhookHeaders, name: string): string | undefined {
  const wanted = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === wanted) return Array.isArray(value) ? value[0] : value;
  }
  return undefined;
}

/** One secret or several (during a rotation), as a non-empty list. */
export function secretList(secret: string | string[], provider: string): string[] {
  const list = (Array.isArray(secret) ? secret : [secret]).map((s) => s?.trim()).filter(Boolean);
  if (list.length === 0) throw new ConfigError('webhooks/invalid-secret', `${provider} webhook: no secret configured`);
  return list;
}

/** Every verifier fails the same way, with a reason that names no secret. */
export function invalidSignature(provider: string, reason: string): never {
  throw new AuthError('webhooks/invalid-signature', `${provider} webhook: ${reason}`);
}

export function hmac(algorithm: string, key: string | Buffer, parts: Array<string | Buffer>): Buffer {
  const mac = createHmac(algorithm, key);
  for (const part of parts) mac.update(part);
  return mac.digest();
}

/** Constant-time comparison; a length difference is a mismatch. */
export function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Parses Unix seconds and checks them against the tolerance. */
export function checkedTimestamp(provider: string, value: string | undefined, options: TimestampOptions): number {
  if (!value || !/^\d{1,12}$/.test(value)) return invalidSignature(provider, 'timestamp is missing or not Unix seconds');
  const timestampSeconds = Number(value);
  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestampSeconds) > (options.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS)) {
    return invalidSignature(provider, 'timestamp is outside the tolerance');
  }
  return timestampSeconds;
}
