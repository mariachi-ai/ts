export type { AsymmetricAlgorithm, WorkOSConfig, WorkOSIdentityClientConfig, WorkOSJwtPayload } from './types';
export { WorkOSAuthProvider } from './provider';
export { WorkOSWebhookHandler, normalizeWorkOSEventType, computeWorkOSSignature } from './webhooks/handler';
export type { WorkOSWebhookHandlerConfig } from './webhooks/handler';
export { WorkOSIdentityClient } from './identity-client';
export type { WorkOSDeps } from './provider-fetch';
export { settings, operations, envNames, webhookEvents, type WorkosOperation } from './generated';

import type { WorkOSConfig, WorkOSIdentityClientConfig } from './types';
import { WorkOSAuthProvider } from './provider';
import { WorkOSIdentityClient } from './identity-client';
import type { WorkOSDeps } from './provider-fetch';

/** `deps` is the container's tracer and metrics, for the spans of the key fetches. */
export function createWorkOSAuth(config: WorkOSConfig, deps: WorkOSDeps = {}): WorkOSAuthProvider {
  return new WorkOSAuthProvider(config, undefined, deps);
}

/** `deps` is the container's tracer and metrics, for the span of every call. */
export function createWorkOSIdentityClient(config: WorkOSIdentityClientConfig, deps: WorkOSDeps = {}): WorkOSIdentityClient {
  return new WorkOSIdentityClient(config, undefined, deps);
}
