import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
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
  /**
   * What to deduplicate on. It always comes from signed material: an id the signature covers, or a
   * digest of the signature itself. An id from an unsigned header is never used, since whoever
   * replays a captured delivery can change it.
   */
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

/**
 * A dedup key for schemes that sign only the body: the same body under the same secret has the
 * same signature, so a replay gets the same key whatever its unsigned headers say. Pass the
 * signature's decoded bytes, not its text: one MAC has several spellings (hex in either case,
 * base64 with or without padding or with stray trailing bits), and each would get its own key.
 */
export function signatureDigest(mac: Buffer): string {
  return `sig:${createHash('sha256').update(mac).digest('hex')}`;
}

/** Constant-time comparison; a length difference is a mismatch. */
export function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Parses Unix seconds and checks them against the tolerance. `text` is the timestamp exactly as
 * sent: the sender signed those characters, so the MAC is computed over them and not over the
 * parsed number (a leading zero would otherwise turn a valid signature into a mismatch).
 */
export function checkedTimestamp(provider: string, value: string | undefined, options: TimestampOptions): { timestampSeconds: number; text: string } {
  if (!value || !/^\d{1,12}$/.test(value)) return invalidSignature(provider, 'timestamp is missing or not Unix seconds');
  const timestampSeconds = Number(value);
  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestampSeconds) > (options.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS)) {
    return invalidSignature(provider, 'timestamp is outside the tolerance');
  }
  return { timestampSeconds, text: value };
}
