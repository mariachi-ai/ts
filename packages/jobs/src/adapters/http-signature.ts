import { createHmac, timingSafeEqual } from 'node:crypto';
import { JobsError } from '@mariachi/core';

/** How far a run's `t` may be from this clock, either way, in seconds. */
export const RUN_SIGNATURE_TOLERANCE_SECONDS = 300;

const HEADER = /^t=([0-9]{1,12})((?:,v1=[0-9a-f]{64}){1,2})$/;
const RUN_ID = /^run_[0-9A-HJKMNP-TV-Z]{26}$/;
const ATTEMPT = /^[1-9][0-9]{0,2}$/;

/** The run a signature covers: its `Jobs-Run-Id` and `Jobs-Run-Attempt` header values. */
export interface SignedRun {
  runId: string;
  attempt: string;
}

function wellFormed(run: Partial<SignedRun> | undefined): run is SignedRun {
  return typeof run?.runId === 'string' && RUN_ID.test(run.runId) && typeof run.attempt === 'string' && ATTEMPT.test(run.attempt);
}

/** HMAC-SHA256 of `<t>.<run id>.<attempt>.<raw body>`, so neither header can be swapped under a body. */
function hmacHex(secret: string, t: number, run: SignedRun, body: string | Uint8Array): string {
  return createHmac('sha256', Buffer.from(secret, 'utf8')).update(`${t}.${run.runId}.${run.attempt}.`).update(body).digest('hex');
}

/**
 * The `Jobs-Signature` value for one attempt of a run: `t=<seconds>,v1=<hex>`, one `v1` per secret (the
 * new one first during a rotation), over `<t>.<run id>.<attempt>.<raw body>`. What a queue sends; the
 * app only verifies.
 */
export function signJobRun(secrets: readonly string[], run: SignedRun, body: string | Uint8Array, t: number): string {
  if (secrets.length < 1 || secrets.length > 2) {
    throw new JobsError('jobs/invalid-signature-input', 'Sign with one secret, or two during a rotation');
  }
  if (!Number.isInteger(t) || t < 0) throw new JobsError('jobs/invalid-signature-input', 't is whole Unix seconds');
  if (!wellFormed(run)) throw new JobsError('jobs/invalid-signature-input', 'A run id is run_ and a ULID, and an attempt is 1 to 999');
  return `t=${t}${secrets.map((s) => `,v1=${hmacHex(s, t, run, body)}`).join('')}`;
}

/**
 * Whether a `Jobs-Signature` checks against the run headers and the exact bytes it came with: both run
 * headers well formed, `t` within 300 seconds of `nowSeconds`, and any one `v1` equal (in constant time)
 * to the HMAC-SHA256 of `<t>.<run id>.<attempt>.<raw body>`.
 */
export function verifyJobRunSignature(
  secret: string,
  header: string | null | undefined,
  run: Partial<SignedRun> | undefined,
  rawBody: string | Uint8Array,
  nowSeconds: number,
): boolean {
  const m = header ? HEADER.exec(header) : null;
  if (!m || !secret || !wellFormed(run)) return false;
  const t = Number(m[1]);
  if (Math.abs(nowSeconds - t) > RUN_SIGNATURE_TOLERANCE_SECONDS) return false;
  const expected = Buffer.from(hmacHex(secret, t, run, rawBody), 'hex');
  return (m[2] ?? '')
    .split(',v1=')
    .slice(1)
    .some((hex) => {
      const got = Buffer.from(hex, 'hex');
      return got.length === expected.length && timingSafeEqual(got, expected);
    });
}
