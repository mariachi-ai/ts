import { AuthError } from '@mariachi/core';
import type { AuthWebhookHandler, AuthWebhookEvent } from '@mariachi/auth';
import type { ClerkWebhookEvent } from './types';
import { extractSvixHeaders, verifyClerkWebhook } from './verify';

/**
 * The organization a Clerk event belongs to, read from the signed body: an `organization.*` event's
 * own id, or the `organization.id` (or `organization_id`) of a membership, invitation or domain event.
 */
function organizationId(type: string, data: Record<string, unknown>): string | undefined {
  if (type.startsWith('organization.')) return typeof data.id === 'string' ? data.id : undefined;
  if (!type.startsWith('organization')) return undefined;
  const organization = data.organization as { id?: unknown } | undefined;
  if (typeof organization?.id === 'string') return organization.id;
  return typeof data.organization_id === 'string' ? data.organization_id : undefined;
}

/**
 * Clerk implementation of `AuthWebhookHandler`.
 *
 * Verifies Svix signatures and normalizes Clerk webhook payloads into
 * standard `AuthWebhookEvent` objects. Does not handle dispatch —
 * use `createAuthWebhookDispatcher` from `@mariachi/auth` for that.
 */
export class ClerkWebhookHandler implements AuthWebhookHandler {
  constructor(private readonly signingSecret: string) {}

  verify(
    rawBody: string | Buffer,
    headers: Record<string, string | string[] | undefined>,
  ): AuthWebhookEvent {
    const svixHeaders = extractSvixHeaders(headers);
    if (!svixHeaders) {
      throw new AuthError(
        'auth/webhook-verification-failed',
        'Missing required Svix headers (svix-id, svix-timestamp, svix-signature)',
      );
    }

    const event: ClerkWebhookEvent = verifyClerkWebhook(this.signingSecret, rawBody, svixHeaders);
    const svixTimestamp = Number.parseInt(svixHeaders['svix-timestamp'], 10);

    return {
      id: svixHeaders['svix-id'],
      type: event.type,
      provider: 'clerk',
      tenantId: organizationId(event.type, event.data as Record<string, unknown>),
      data: event.data as Record<string, unknown>,
      raw: event,
      timestamp: Number.isFinite(svixTimestamp) ? svixTimestamp * 1000 : undefined,
    };
  }
}
