import { ConfigError, MariachiError } from '@mariachi/core';
import type { IncomingRequest, RequestContext } from '@mariachi/server';
import { headerValue, type VerifiedWebhook, type WebhookHeaders } from '../verify/common';
import { verifyGitHubWebhook } from '../verify/github';
import { type HmacOptions, verifyHmacSignature } from '../verify/hmac';
import { parseStandardWebhookSecrets, verifyStandardWebhook } from '../verify/standard';
import { type StripeStyleOptions, verifyStripeWebhook } from '../verify/stripe';
import { AuthController, type WebhookIdentity } from './auth-controller';

type Secrets = string | string[];

/** The secret for one tenant. Return nothing for a tenant that has none, and the delivery is refused. */
export type TenantSecretResolver = (tenantId: string, req: IncomingRequest) => Secrets | undefined | Promise<Secrets | undefined>;

export interface VerifiedWebhookAuthOptions {
  /**
   * The signing secret (or several while one is being rotated), shared by every delivery; or a
   * function giving each tenant's own secret, used with `tenantFromRequest`.
   */
  secret: Secrets | TenantSecretResolver;
  /** The name deliveries are logged and deduplicated under. Each class has a default. */
  provider?: string;
  /**
   * The tenant the request names (a path parameter, usually). Nothing signs a path, so this is only
   * accepted together with a per-tenant `secret` function: the delivery must then verify under that
   * tenant's secret, which is what proves it's theirs.
   */
  tenantFromRequest?: (req: IncomingRequest) => string | undefined;
  /**
   * The tenant named inside the verified body (parsed JSON; `undefined` when it isn't JSON). Use
   * this with one shared secret: the signature covers the body, so the sender vouches for it.
   */
  tenantFromPayload?: (payload: unknown) => string | undefined;
}

type Verified = VerifiedWebhook & { metadata?: Record<string, unknown> };

/**
 * A webhook authenticator built on one check of the delivery. The ready-made ones below cover the common
 * schemes; a provider package subclasses it for a scheme of its own, implementing `verify` (which may be
 * async, for a scheme checked against published keys). The base class reads the secret, the tenant and the
 * dedup key the same way for every scheme.
 */
export abstract class VerifiedWebhookAuth extends AuthController {
  /** The sender's name: dedup keys, logs and the delivery's span use it. */
  readonly provider: string;

  protected constructor(
    private readonly base: VerifiedWebhookAuthOptions,
    defaultProvider: string,
  ) {
    super();
    this.provider = base.provider ?? defaultProvider;
    const perTenant = typeof base.secret === 'function';
    if (base.tenantFromRequest && !perTenant) {
      throw new ConfigError(
        'webhooks/unauthenticated-tenant',
        `${this.provider} webhook: tenantFromRequest needs a per-tenant secret function. With one shared secret, a valid delivery could be posted to any tenant's path; take the tenant from the signed body with tenantFromPayload`,
      );
    }
    if (perTenant && !base.tenantFromRequest) {
      throw new ConfigError('webhooks/invalid-secret', `${this.provider} webhook: a per-tenant secret function needs tenantFromRequest to say which tenant`);
    }
    if (!perTenant && !hasSecret(base.secret as Secrets)) {
      throw new ConfigError('webhooks/invalid-secret', `${this.provider} webhook: no secret configured`);
    }
  }

  /**
   * Throws `webhooks/invalid-signature`, or returns the delivery's dedup key (from signed material only) and
   * anything else worth keeping. `secret` is what verifies the delivery: a shared secret, or, for a scheme
   * signed with the provider's published keys, whatever names those keys.
   */
  protected abstract verify(rawBody: Buffer, headers: WebhookHeaders, secret: Secrets): Verified | Promise<Verified>;

  async auth(req: IncomingRequest, ctx: RequestContext): Promise<WebhookIdentity | null> {
    if (!req.rawBody || req.rawBody.length === 0) {
      ctx.logger.warn({ provider: this.provider }, 'webhook has no raw body; rejecting');
      return null;
    }
    let tenantId: string | undefined;
    let secret: Secrets | undefined;
    if (typeof this.base.secret === 'function') {
      tenantId = this.base.tenantFromRequest?.(req);
      secret = tenantId ? await this.base.secret(tenantId, req) : undefined;
      if (!tenantId || !secret || !hasSecret(secret)) {
        ctx.logger.warn({ provider: this.provider }, 'webhook names no tenant, or one with no secret; rejecting');
        return null;
      }
    } else {
      secret = this.base.secret;
    }
    try {
      const { eventId, metadata } = await this.verify(req.rawBody, req.headers, secret);
      if (this.base.tenantFromPayload) {
        const fromPayload = this.base.tenantFromPayload(parseJson(req.rawBody));
        if (tenantId && fromPayload && fromPayload !== tenantId) {
          ctx.logger.warn({ provider: this.provider }, 'webhook body names a different tenant from the request; rejecting');
          return null;
        }
        tenantId ??= fromPayload;
      }
      return {
        provider: this.provider,
        verified: true,
        tenantId,
        // One tenant's delivery never deduplicates another's.
        eventId: eventId && tenantId ? `${tenantId}:${eventId}` : eventId,
        metadata: metadata ?? {},
      };
    } catch (error) {
      if (error instanceof MariachiError && error.code === 'webhooks/invalid-signature') {
        ctx.logger.warn({ provider: this.provider, reason: error.message }, 'webhook signature rejected');
        return null;
      }
      throw error;
    }
  }
}

function hasSecret(secret: Secrets): boolean {
  return (Array.isArray(secret) ? secret : [secret]).some((entry) => typeof entry === 'string' && entry.trim() !== '');
}

function parseJson(rawBody: Buffer): unknown {
  try {
    return JSON.parse(rawBody.toString('utf8'));
  } catch {
    return undefined;
  }
}

/** Standard Webhooks and Svix (`webhook-*` or `svix-*` headers): Clerk, Resend and many others. Deduplicated on the signed `webhook-id`. */
export class StandardWebhookAuth extends VerifiedWebhookAuth {
  constructor(private readonly options: VerifiedWebhookAuthOptions & { toleranceSeconds?: number }) {
    super(options, 'standard-webhooks');
    // A shared secret that isn't a key should stop the app at startup, not the first delivery.
    if (typeof options.secret !== 'function') parseStandardWebhookSecrets(options.secret);
  }

  protected verify(rawBody: Buffer, headers: WebhookHeaders, secret: Secrets): Verified {
    return verifyStandardWebhook(rawBody, headers, secret, { toleranceSeconds: this.options.toleranceSeconds });
  }
}

/**
 * GitHub: `X-Hub-Signature-256`. Deduplicated on a digest of the signature, because GitHub doesn't
 * sign `X-GitHub-Delivery`; that id and the event name are in `identity.metadata`.
 */
export class GitHubWebhookAuth extends VerifiedWebhookAuth {
  constructor(options: VerifiedWebhookAuthOptions) {
    super(options, 'github');
  }

  protected verify(rawBody: Buffer, headers: WebhookHeaders, secret: Secrets): Verified {
    const { eventId, deliveryId, event } = verifyGitHubWebhook(rawBody, headers, secret);
    return { eventId, metadata: { deliveryId, event } };
  }
}

/** Stripe's `t=…,v1=…` scheme, deduplicated on the signed body's `id`. `header` and `provider` adapt it to senders that copy the scheme. */
export class StripeWebhookAuth extends VerifiedWebhookAuth {
  constructor(private readonly options: VerifiedWebhookAuthOptions & Pick<StripeStyleOptions, 'header' | 'toleranceSeconds'>) {
    super(options, 'stripe');
  }

  protected verify(rawBody: Buffer, headers: WebhookHeaders, secret: Secrets): Verified {
    return verifyStripeWebhook(rawBody, headers, secret, { header: this.options.header, toleranceSeconds: this.options.toleranceSeconds, provider: this.provider });
  }
}

/**
 * A plain HMAC of the raw body in one header, for senders with no scheme of their own.
 * Deduplicated on a digest of the signature; the sender's own delivery id, if it sends one, is an
 * unsigned header and only goes to `identity.metadata.deliveryId`.
 */
export class HmacWebhookAuth extends VerifiedWebhookAuth {
  constructor(
    private readonly options: VerifiedWebhookAuthOptions &
      Omit<HmacOptions, 'provider'> & {
        provider: string;
        /** The header holding the signature. */
        header: string;
        /** The header holding the sender's delivery id, kept in `identity.metadata.deliveryId`. */
        deliveryIdHeader?: string;
      },
  ) {
    super(options, options.provider);
  }

  protected verify(rawBody: Buffer, headers: WebhookHeaders, secret: Secrets): Verified {
    const { eventId } = verifyHmacSignature(rawBody, headerValue(headers, this.options.header), secret, {
      algorithm: this.options.algorithm,
      encoding: this.options.encoding,
      prefix: this.options.prefix,
      provider: this.provider,
    });
    return { eventId, metadata: { deliveryId: this.options.deliveryIdHeader ? headerValue(headers, this.options.deliveryIdHeader) : undefined } };
  }
}
