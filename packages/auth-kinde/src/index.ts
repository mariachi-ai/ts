export { KindeAuthProvider, type KindeAuthConfig, type KindeAccessClaims } from './provider';
export { KindeIdentityClient, type KindeIdentityClientConfig, type KindeDeps } from './identity-client';
export { KindeError } from './errors';
export {
  KindeWebhookAuth,
  KindeWebhookBody,
  KindeWebhookHandler,
  KINDE_WEBHOOK_TOLERANCE_SECONDS,
  kindeAuthEvent,
  kindeEventType,
  kindeWebhookAuth,
  normalizeKindeEventType,
  type KindeWebhookOptions,
} from './webhooks';
export type { KindeWebhookPayload } from './schemas';
export { provider, settings, configSchema, envNames, operations, webhookEvents, type KindeConfig, type KindeOperation } from './generated';

import { type KindeAuthConfig, KindeAuthProvider } from './provider';
import { type KindeDeps, KindeIdentityClient, type KindeIdentityClientConfig } from './identity-client';

/** An `AuthProvider` for Kinde's tokens. Pass it to `bearerStrategy` or `createAuthMiddleware`. */
export function createKindeAuth(config: KindeAuthConfig): KindeAuthProvider {
  return new KindeAuthProvider(config);
}

/** An `IdentityClient` on Kinde: the hosted sign-in's code exchange, refresh and revoke, and users through the Management API. */
export function createKindeIdentityClient(config: KindeIdentityClientConfig, deps: KindeDeps = {}): KindeIdentityClient {
  return new KindeIdentityClient(config, deps);
}
