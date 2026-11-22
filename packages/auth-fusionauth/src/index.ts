export type { FusionAuthConfig } from './types';
export { FusionAuthAuthProvider } from './provider';
export { FusionAuthWebhookHandler } from './webhooks/handler';
export type { FusionAuthWebhookHandlerConfig } from './webhooks/handler';
export { FusionAuthIdentityClient, fusionAuthEmailVouched } from './identity-client';
export type { FusionAuthIdentityClientConfig, FusionAuthUser } from './identity-client';
export type { FusionAuthDeps } from './provider-fetch';
export { settings, operations, envNames, webhookEvents, type FusionauthOperation } from './generated';

import type { FusionAuthConfig } from './types';
import { FusionAuthAuthProvider } from './provider';
import { FusionAuthIdentityClient, type FusionAuthIdentityClientConfig } from './identity-client';
import type { FusionAuthDeps } from './provider-fetch';

/** `deps` is the container's tracer and metrics, for the spans of the key fetches. */
export function createFusionAuthAuth(config: FusionAuthConfig, deps: FusionAuthDeps = {}): FusionAuthAuthProvider {
  return new FusionAuthAuthProvider(config, deps);
}

/** `deps` is the container's tracer and metrics, for the span of every call. */
export function createFusionAuthIdentityClient(config: FusionAuthIdentityClientConfig, deps: FusionAuthDeps = {}): FusionAuthIdentityClient {
  return new FusionAuthIdentityClient(config, deps);
}
