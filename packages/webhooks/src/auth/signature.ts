import { createHash } from 'node:crypto';
import { ConfigError } from '@mariachi/core';
import type { IncomingRequest, RequestContext } from '@mariachi/server';
import { AuthController } from './auth-controller';
import type { WebhookIdentity } from './auth-controller';

type Secrets = string | string[];

/**
 * Base for a signature scheme the ready-made authenticators don't cover (`GitHubWebhookAuth`,
 * `StripeWebhookAuth`, `StandardWebhookAuth`, `HmacWebhookAuth`). A subclass says which header
 * holds the signature, where the secret comes from, and how to check a signature under one secret;
 * the base class does the rest so that two rules can't be broken by accident:
 *
 * - **Dedup uses signed material only.** The default key is a digest of the raw body. A delivery-id
 *   header the signature doesn't cover is never used: whoever replays a captured delivery can change it.
 * - **A tenant is authenticated.** It comes from the verified body (`tenantFromPayload`), or from the
 *   request (`tenantFromRequest`) only when the delivery then verifies under that tenant's own
 *   secret (`tenantSecret`). A tenant read from the path under one shared secret is refused at the
 *   first delivery, since a valid delivery could be posted to any tenant's path.
 */
export abstract class SignatureAuthController extends AuthController {
  abstract readonly provider: string;
  abstract readonly signatureHeader: string;

  /**
   * Whether `signature` is valid for `rawBody` under `secret`. Compare with `crypto.timingSafeEqual`
   * (see `verifyHmacSignature` in `@mariachi/webhooks/verify`). Called once per candidate secret.
   */
  protected abstract verifySignature(signature: string, rawBody: Buffer, secret: string, req: IncomingRequest): boolean | Promise<boolean>;

  /** The secret every delivery is signed with, or several while one is being rotated. */
  protected secret(_req: IncomingRequest): Secrets | undefined | Promise<Secrets | undefined> {
    return undefined;
  }

  /** The tenant the request names (a path parameter, usually). Needs `tenantSecret`. */
  protected tenantFromRequest(_req: IncomingRequest): string | undefined {
    return undefined;
  }

  /** That tenant's own secret. Return nothing for a tenant that has none, and the delivery is refused. */
  protected tenantSecret(_tenantId: string, _req: IncomingRequest): Secrets | undefined | Promise<Secrets | undefined> {
    return undefined;
  }

  /** The tenant named inside the verified body (parsed JSON; `undefined` when it isn't JSON). */
  protected tenantFromPayload(_payload: unknown): string | undefined {
    return undefined;
  }

  /**
   * What to deduplicate on. Default: a digest of the raw body. Override only to return an id the
   * signature covers (one inside the body, or a header the scheme signs).
   */
  protected dedupKey(rawBody: Buffer, _req: IncomingRequest): string | undefined {
    return `body:${createHash('sha256').update(rawBody).digest('hex')}`;
  }

  async auth(req: IncomingRequest, ctx: RequestContext): Promise<WebhookIdentity | null> {
    const header = req.headers[this.signatureHeader.toLowerCase()];
    const signature = typeof header === 'string' ? header : Array.isArray(header) ? header[0] : undefined;
    if (!signature) return null;
    if (!req.rawBody || req.rawBody.length === 0) {
      ctx.logger.warn({ provider: this.provider }, 'webhook has no raw body; rejecting');
      return null;
    }

    let tenantId = this.tenantFromRequest(req);
    let secrets: string[];
    if (tenantId) {
      secrets = list(await this.tenantSecret(tenantId, req));
      if (secrets.length === 0) {
        if (list(await this.secret(req)).length > 0) {
          throw new ConfigError(
            'webhooks/unauthenticated-tenant',
            `${this.provider} webhook: tenantFromRequest needs tenantSecret. With one shared secret, a valid delivery could be posted to any tenant's path; take the tenant from the signed body with tenantFromPayload`,
          );
        }
        ctx.logger.warn({ provider: this.provider }, 'webhook names a tenant with no secret; rejecting');
        return null;
      }
    } else {
      secrets = list(await this.secret(req));
      if (secrets.length === 0) throw new ConfigError('webhooks/invalid-secret', `${this.provider} webhook: no secret configured`);
    }

    let verified = false;
    for (const secret of secrets) {
      if (await this.verifySignature(signature, req.rawBody, secret, req)) {
        verified = true;
        break;
      }
    }
    if (!verified) {
      ctx.logger.warn({ provider: this.provider }, 'webhook signature rejected');
      return null;
    }

    const fromPayload = this.tenantFromPayload(parseJson(req.rawBody));
    if (tenantId && fromPayload && fromPayload !== tenantId) {
      ctx.logger.warn({ provider: this.provider }, 'webhook body names a different tenant from the request; rejecting');
      return null;
    }
    tenantId ??= fromPayload;
    const key = this.dedupKey(req.rawBody, req);
    return {
      provider: this.provider,
      verified: true,
      tenantId,
      // One tenant's delivery never deduplicates another's.
      eventId: key && tenantId ? `${tenantId}:${key}` : key,
      metadata: {},
    };
  }
}

function list(secret: Secrets | undefined): string[] {
  return (Array.isArray(secret) ? secret : secret === undefined ? [] : [secret]).filter((entry) => typeof entry === 'string' && entry.trim() !== '');
}

function parseJson(rawBody: Buffer): unknown {
  try {
    return JSON.parse(rawBody.toString('utf8'));
  } catch {
    return undefined;
  }
}
