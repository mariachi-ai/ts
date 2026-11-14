import { MariachiError } from '@mariachi/core';
import type { IncomingRequest, RequestContext } from '@mariachi/server';
import { headerValue, type VerifiedWebhook, type WebhookHeaders } from '../verify/common';
import { verifyGitHubWebhook } from '../verify/github';
import { type HmacOptions, verifyHmacSignature } from '../verify/hmac';
import { parseStandardWebhookSecrets, verifyStandardWebhook } from '../verify/standard';
import { type StripeStyleOptions, verifyStripeWebhook } from '../verify/stripe';
import { AuthController, type WebhookIdentity } from './auth-controller';

export interface VerifiedWebhookAuthOptions {
  /** The signing secret, or several while one is being rotated. */
  secret: string | string[];
  /** The name deliveries are logged and deduplicated under. Each class has a default. */
  provider?: string;
  /** The tenant a delivery belongs to, e.g. from a path parameter. */
  resolveTenant?: (req: IncomingRequest) => string | undefined;
}

/** A webhook authenticator built on one of the `@mariachi/webhooks/verify` checks. */
abstract class VerifiedWebhookAuth extends AuthController {
  protected abstract readonly provider: string;
  protected abstract readonly resolveTenant?: (req: IncomingRequest) => string | undefined;

  /** Throws `webhooks/invalid-signature`, or returns the delivery's id and anything else worth keeping. */
  protected abstract verify(rawBody: Buffer, headers: WebhookHeaders): VerifiedWebhook & { metadata?: Record<string, unknown> };

  async auth(req: IncomingRequest, ctx: RequestContext): Promise<WebhookIdentity | null> {
    if (!req.rawBody || req.rawBody.length === 0) {
      ctx.logger.warn({ provider: this.provider }, 'webhook has no raw body; rejecting');
      return null;
    }
    try {
      const { eventId, metadata } = this.verify(req.rawBody, req.headers);
      return { provider: this.provider, verified: true, tenantId: this.resolveTenant?.(req), eventId, metadata: metadata ?? {} };
    } catch (error) {
      if (error instanceof MariachiError && error.code === 'webhooks/invalid-signature') {
        ctx.logger.warn({ provider: this.provider, reason: error.message }, 'webhook signature rejected');
        return null;
      }
      throw error;
    }
  }
}

/** Standard Webhooks and Svix (`webhook-*` or `svix-*` headers): Clerk, Resend and many others. */
export class StandardWebhookAuth extends VerifiedWebhookAuth {
  protected readonly provider: string;
  protected readonly resolveTenant?: (req: IncomingRequest) => string | undefined;
  private readonly keys: Buffer[];

  constructor(private readonly options: VerifiedWebhookAuthOptions & { toleranceSeconds?: number }) {
    super();
    this.provider = options.provider ?? 'standard-webhooks';
    this.resolveTenant = options.resolveTenant;
    this.keys = parseStandardWebhookSecrets(options.secret);
  }

  protected verify(rawBody: Buffer, headers: WebhookHeaders) {
    return verifyStandardWebhook(rawBody, headers, this.keys, { toleranceSeconds: this.options.toleranceSeconds });
  }
}

/** GitHub: `X-Hub-Signature-256`, deduplicated on `X-GitHub-Delivery`. The event name is in `identity.metadata.event`. */
export class GitHubWebhookAuth extends VerifiedWebhookAuth {
  protected readonly provider: string;
  protected readonly resolveTenant?: (req: IncomingRequest) => string | undefined;

  constructor(private readonly options: VerifiedWebhookAuthOptions) {
    super();
    this.provider = options.provider ?? 'github';
    this.resolveTenant = options.resolveTenant;
    verifyConfigured(options.secret, this.provider);
  }

  protected verify(rawBody: Buffer, headers: WebhookHeaders) {
    const { eventId, event } = verifyGitHubWebhook(rawBody, headers, this.options.secret);
    return { eventId, metadata: { event } };
  }
}

/** Stripe's `t=…,v1=…` scheme, deduplicated on the body's `id`. `header` and `provider` adapt it to senders that copy the scheme. */
export class StripeWebhookAuth extends VerifiedWebhookAuth {
  protected readonly provider: string;
  protected readonly resolveTenant?: (req: IncomingRequest) => string | undefined;

  constructor(private readonly options: VerifiedWebhookAuthOptions & Pick<StripeStyleOptions, 'header' | 'toleranceSeconds'>) {
    super();
    this.provider = options.provider ?? 'stripe';
    this.resolveTenant = options.resolveTenant;
    verifyConfigured(options.secret, this.provider);
  }

  protected verify(rawBody: Buffer, headers: WebhookHeaders) {
    return verifyStripeWebhook(rawBody, headers, this.options.secret, {
      header: this.options.header,
      toleranceSeconds: this.options.toleranceSeconds,
      provider: this.provider,
    });
  }
}

/** A plain HMAC of the raw body in one header, for senders with no scheme of their own. */
export class HmacWebhookAuth extends VerifiedWebhookAuth {
  protected readonly provider: string;
  protected readonly resolveTenant?: (req: IncomingRequest) => string | undefined;

  constructor(
    private readonly options: VerifiedWebhookAuthOptions &
      Omit<HmacOptions, 'provider'> & {
        provider: string;
        /** The header holding the signature. */
        header: string;
        /** The header holding the sender's delivery id, if it sends one. */
        eventIdHeader?: string;
      },
  ) {
    super();
    this.provider = options.provider;
    this.resolveTenant = options.resolveTenant;
    verifyConfigured(options.secret, this.provider);
  }

  protected verify(rawBody: Buffer, headers: WebhookHeaders) {
    verifyHmacSignature(rawBody, headerValue(headers, this.options.header), this.options.secret, {
      algorithm: this.options.algorithm,
      encoding: this.options.encoding,
      prefix: this.options.prefix,
      provider: this.provider,
    });
    return { eventId: this.options.eventIdHeader ? headerValue(headers, this.options.eventIdHeader) : undefined };
  }
}

/** Fail at construction, not on the first delivery, when no secret was configured. */
function verifyConfigured(secret: string | string[], provider: string): void {
  const list = (Array.isArray(secret) ? secret : [secret]).filter((s) => s?.trim());
  if (list.length === 0) throw new MariachiError('webhooks/invalid-secret', `${provider} webhook: no secret configured`);
}
