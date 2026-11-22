import { createHmac, timingSafeEqual } from 'node:crypto';
import { JobsError } from '@mariachi/core';

/** How far a run's `t` may be from this clock, either way, in seconds. */
export const RUN_SIGNATURE_TOLERANCE_SECONDS = 300;

const HEADER = /^t=([0-9]{1,12})((?:,v1=[0-9a-f]{64}){1,2})$/;

function hmacHex(secret: string, t: number, body: string | Uint8Array): string {
  return createHmac('sha256', Buffer.from(secret, 'utf8')).update(`${t}.`).update(body).digest('hex');
}

/**
 * The `Jobs-Signature` value for a body: `t=<seconds>,v1=<hex>`, one `v1` per secret (the new one first
 * during a rotation). What a queue sends; the app only verifies.
 */
export function signJobRun(secrets: readonly string[], body: string | Uint8Array, t: number): string {
  if (secrets.length < 1 || secrets.length > 2) {
    throw new JobsError('jobs/invalid-signature-input', 'Sign with one secret, or two during a rotation');
  }
  if (!Number.isInteger(t) || t < 0) throw new JobsError('jobs/invalid-signature-input', 't is whole Unix seconds');
  return `t=${t}${secrets.map((s) => `,v1=${hmacHex(s, t, body)}`).join('')}`;
}

/**
 * Whether a `Jobs-Signature` checks against the exact bytes it came with: `t` within 300 seconds of
 * `nowSeconds`, and any one `v1` equal (in constant time) to the HMAC-SHA256 of `<t>.<raw body>`.
 */
export function verifyJobRunSignature(
  secret: string,
  header: string | null | undefined,
  rawBody: string | Uint8Array,
  nowSeconds: number,
): boolean {
  const m = header ? HEADER.exec(header) : null;
  if (!m || !secret) return false;
  const t = Number(m[1]);
  if (Math.abs(nowSeconds - t) > RUN_SIGNATURE_TOLERANCE_SECONDS) return false;
  const expected = Buffer.from(hmacHex(secret, t, rawBody), 'hex');
  return (m[2] ?? '')
    .split(',v1=')
    .slice(1)
    .some((hex) => {
      const got = Buffer.from(hex, 'hex');
      return got.length === expected.length && timingSafeEqual(got, expected);
    });
}
