import type { IncomingRequest, RequestContext } from '@mariachi/server';
import { AuthController } from './auth-controller';
import type { WebhookIdentity } from './auth-controller';

/**
 * Base for webhooks that verify a signature header (e.g. HMAC-SHA256) over the exact raw body.
 * Subclasses implement `verifySignature`; use `crypto.timingSafeEqual` for comparisons.
 */
export abstract class SignatureAuthController extends AuthController {
  abstract readonly provider: string;
  abstract readonly signatureHeader: string;
  /**
   * Header carrying the provider's delivery id, used for dedup. Only safe when the signature
   * covers that header: if it doesn't, a captured delivery resent under a new id is processed
   * again. The ready-made authenticators (`GitHubWebhookAuth`, `HmacWebhookAuth`, ...) deduplicate
   * on signed material instead.
   */
  protected readonly eventIdHeader?: string;

  protected abstract verifySignature(signature: string, rawBody: Buffer, ctx: RequestContext, req: IncomingRequest): Promise<boolean>;

  /**
   * Override to map a delivery to a tenant. A tenant read from the path is only as trustworthy as
   * the secret: with one secret for every tenant, a valid delivery posted to another tenant's path
   * would be attributed to that tenant, so verify with that tenant's own secret, or read the tenant
   * from the signed body.
   */
  protected resolveTenant(_req: IncomingRequest): string | undefined {
    return undefined;
  }

  async auth(req: IncomingRequest, ctx: RequestContext): Promise<WebhookIdentity | null> {
    const signature = req.headers[this.signatureHeader.toLowerCase()];
    const sig = typeof signature === 'string' ? signature : Array.isArray(signature) ? signature[0] : undefined;
    if (!sig) return null;
    if (!req.rawBody || req.rawBody.length === 0) {
      ctx.logger.warn({ provider: this.provider }, 'webhook has no raw body; rejecting');
      return null;
    }
    if (!(await this.verifySignature(sig, req.rawBody, ctx, req))) return null;
    const eventId = this.eventIdHeader ? req.headers[this.eventIdHeader.toLowerCase()] : undefined;
    return {
      provider: this.provider,
      verified: true,
      tenantId: this.resolveTenant(req),
      eventId: typeof eventId === 'string' ? eventId : undefined,
      metadata: {},
    };
  }
}
