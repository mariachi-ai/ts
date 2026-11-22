export type { ClerkConfig } from './types';
export { ClerkAuthProvider, clerkIdentity, type ClerkSessionClaims, type ClerkDeps } from './provider';
export { settings, operations, envNames, webhookEvents, type ClerkOperation } from './generated';
export { createClerkMiddleware } from './middleware';
export type { ClerkMiddlewareOptions } from './middleware';

export { ClerkWebhookHandler } from './webhooks/handler';
export { verifyClerkWebhook, extractSvixHeaders } from './webhooks/verify';
export type { SvixHeaders } from './webhooks/verify';

export { ClerkWebhookAuth } from './webhooks/auth';

export { ClerkWebhookController } from './webhooks/controller';
export type { ClerkWebhookControllerConfig } from './webhooks/controller';

export type {
  ClerkWebhookEvent,
  ClerkUserData,
  ClerkSessionData,
  ClerkOrganizationData,
  ClerkOrganizationMembershipData,
  ClerkUserEventType,
  ClerkSessionEventType,
  ClerkOrganizationEventType,
  ClerkOrganizationMembershipEventType,
  ClerkEmailEventType,
  ClerkEventType,
} from './webhooks/types';
export { CLERK_EVENT_TYPES } from './webhooks/types';

import type { ClerkConfig } from './types';
import { type ClerkDeps, ClerkAuthProvider } from './provider';

/** `deps` is the container's tracer and metrics, for the spans of the key fetches. */
export function createClerkAuth(config: ClerkConfig, deps: ClerkDeps = {}): ClerkAuthProvider {
  return new ClerkAuthProvider(config, deps);
}
