import type { StytchDeps } from './api';
import { StytchIdentityClient, type StytchIdentityClientConfig } from './identity-client';
import { type StytchAuthConfig, StytchAuthProvider } from './provider';

export { StytchAuthProvider, STYTCH_SESSION_CLAIM, type StytchAuthConfig } from './provider';
export { StytchIdentityClient, stytchIdentityUser, readStytchOAuthCallback, type StytchIdentityClientConfig } from './identity-client';
export { StytchWebhookHandler, stytchWebhookAuth, stytchEventType, normalizeStytchEventType, StytchWebhookBody, type StytchWebhookHandlerConfig } from './webhooks';
export { StytchError } from './errors';
export { stytchApiBaseUrl, stytchIssuer, type StytchDeps } from './api';
export { provider, settings, configSchema, envNames, operations, webhookEvents, type StytchConfig, type StytchOperation, type StytchWebhookEvent } from './generated';
export { StytchUser, StytchSession } from './schemas';

/**
 * Checks Stytch session JWTs (the `AuthProvider` for `createAuthMiddleware`). Build it once at startup: it caches
 * the project's JWKS.
 *
 * ```ts
 * const stytch = createStytchAuth(settingsFromEnv(settings, readEnv), { tracer, metrics });
 * ```
 */
export function createStytchAuth(config: StytchAuthConfig, deps: StytchDeps = {}): StytchAuthProvider {
  return new StytchAuthProvider(config, deps);
}

/** Signs people in through Stytch from the app's own backend (the auth port's `IdentityClient`). */
export function createStytchIdentityClient(config: StytchIdentityClientConfig, deps: StytchDeps = {}): StytchIdentityClient {
  return new StytchIdentityClient(config, deps);
}
