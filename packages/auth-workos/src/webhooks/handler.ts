import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { AuthError } from '@mariachi/core';
import type { AuthWebhookEvent, AuthWebhookHandler } from '@mariachi/auth';

const SIGNATURE_HEADER = 'workos-signature';

export interface WorkOSWebhookHandlerConfig {
  /** The webhook endpoint's signing secret (WorkOS Dashboard → Webhooks), or several while one is being rotated. */
  secret: string | string[];
  /** Reject deliveries signed longer ago (or further ahead) than this. Default 180s, as the WorkOS SDK. */
  toleranceSeconds?: number;
  /** The clock, for tests. */
  now?: () => number;
}

const EVENT_TYPE_MAP: Record<string, string> = {
  'organization_membership.created': 'organizationMembership.created',
  'organization_membership.updated': 'organizationMembership.updated',
  'organization_membership.deleted': 'organizationMembership.deleted',
};

/**
 * Maps WorkOS event types onto the framework's `AuthEventType` vocabulary. `user.*`, `session.*`
 * and `organization.*` already match; unknown types (`dsync.*`, `invitation.*`,
 * `email_verification.created`, `authentication.*`, …) pass through.
 */
export function normalizeWorkOSEventType(workosType: string): string {
  return EVENT_TYPE_MAP[workosType] ?? workosType;
}

function header(headers: Record<string, string | string[] | undefined>, name: string): string | undefined {
  const direct = headers[name] ?? Object.entries(headers).find(([k]) => k.toLowerCase() === name)?.[1];
  return Array.isArray(direct) ? direct[0] : direct;
}

/** Parses `t=<ms>, v1=<hex>` (order and spaces don't matter). */
function parseSignature(value: string): { timestamp: number; text: string; signatures: string[] } | null {
  let text: string | null = null;
  const signatures: string[] = [];
  for (const part of value.split(',')) {
    const [k, v] = part.trim().split('=', 2);
    if (!k || !v) continue;
    if (k === 't' && /^\d{1,15}$/.test(v)) text = v;
    else if (k === 'v1' && /^[0-9a-f]+$/i.test(v) && v.length % 2 === 0) signatures.push(v.toLowerCase());
  }
  return text === null || signatures.length === 0 ? null : { timestamp: Number(text), text, signatures };
}

/** The `v1` signature WorkOS computes: HMAC-SHA256, keyed with the secret, of `<t>.<raw body>`, in hex. */
export function computeWorkOSSignature(secret: string, timestamp: number | string, rawBody: string | Buffer): string {
  const raw = typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf8') : rawBody;
  return createHmac('sha256', secret).update(`${timestamp}.`).update(raw).digest('hex');
}

/**
 * Verifies WorkOS webhook deliveries (`WorkOS-Signature: t=<ms>, v1=<hex>`): the HMAC over the
 * timestamp and the exact raw body, compared in constant time, and the timestamp within
 * `toleranceSeconds` of now. A replayed delivery outside the window is refused; inside it, dedupe
 * on the event `id` (Mariachi's webhook dispatcher does).
 */
export class WorkOSWebhookHandler implements AuthWebhookHandler {
  private readonly toleranceMs: number;
  private readonly now: () => number;

  private readonly secrets: string[];

  constructor(private readonly config: WorkOSWebhookHandlerConfig) {
    this.secrets = (Array.isArray(config.secret) ? config.secret : [config.secret]).filter((secret) => typeof secret === 'string' && secret.trim() !== '');
    if (this.secrets.length === 0) throw new AuthError('auth/invalid-config', 'WorkOS webhooks: `secret` is required');
    this.toleranceMs = (config.toleranceSeconds ?? 180) * 1000;
    this.now = config.now ?? Date.now;
  }

  verify(rawBody: string | Buffer, headers: Record<string, string | string[] | undefined>): AuthWebhookEvent {
    const raw = typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf8') : rawBody;
    const value = header(headers, SIGNATURE_HEADER);
    if (!value) throw new AuthError('auth/webhook-verification-failed', 'Missing WorkOS-Signature header');
    const parsed = parseSignature(value);
    if (!parsed) throw new AuthError('auth/webhook-verification-failed', 'Malformed WorkOS-Signature header');
    if (Math.abs(this.now() - parsed.timestamp) > this.toleranceMs) {
      throw new AuthError('auth/webhook-verification-failed', 'WorkOS webhook timestamp outside the tolerance');
    }
    // Over the timestamp exactly as sent: the sender signed those characters, not the parsed number.
    const ok = this.secrets.some((secret) => {
      const expected = Buffer.from(computeWorkOSSignature(secret, parsed.text, raw), 'hex');
      return parsed.signatures.some((sig) => {
        const given = Buffer.from(sig, 'hex');
        return given.length === expected.length && timingSafeEqual(given, expected);
      });
    });
    if (!ok) throw new AuthError('auth/webhook-verification-failed', 'WorkOS webhook signature invalid');

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(raw.toString('utf8'));
    } catch {
      throw new AuthError('auth/webhook-invalid-payload', 'WorkOS webhook body is not JSON');
    }
    const type = typeof body.event === 'string' ? body.event : 'unknown';
    const data = body.data && typeof body.data === 'object' ? (body.data as Record<string, unknown>) : {};
    const createdAt = typeof body.created_at === 'string' ? Date.parse(body.created_at) : Number.NaN;
    return {
      id: typeof body.id === 'string' ? body.id : createHash('sha256').update(raw).digest('hex'),
      type: normalizeWorkOSEventType(type),
      provider: 'workos',
      tenantId: typeof data.organization_id === 'string' ? data.organization_id : undefined,
      data,
      raw: body,
      timestamp: Number.isNaN(createdAt) ? parsed.timestamp : createdAt,
    };
  }
}
