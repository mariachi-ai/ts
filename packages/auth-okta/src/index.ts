import { type OktaConfig, configSchema } from './generated';
import { OktaIdentityClient, type OktaIdentityOptions } from './identity-client';
import { type OktaAuthOptions, OktaAuthProvider } from './provider';

export { OktaAuthProvider, type OktaAuthOptions } from './provider';
export { OktaIdentityClient, type OktaIdentityOptions, type OktaSignInResult, type OktaTokenSet } from './identity-client';
export { OktaError } from './errors';
export {
  OktaEventHookAuth,
  OktaEventHookBody,
  OKTA_VERIFICATION_HEADER,
  normalizeOktaEventType,
  oktaAuthEvents,
  oktaEventType,
  oktaVerification,
  oktaWebhookAuth,
} from './webhooks';
export { oktaServer, type OktaServer } from './server';
export { provider, settings, configSchema, envNames, operations, webhookEvents, type OktaConfig, type OktaOperation, type OktaWebhookEvent } from './generated';
export type { LogEvent, LogEventObject, OktaEventHookDelivery, OktaUser } from './schemas';

/**
 * The `AuthProvider` for Okta: verifies access tokens from the custom authorization server in `OKTA_ISSUER`. Pass
 * it to `bearerStrategy` or `createAuthMiddleware`.
 *
 * ```ts
 * const okta = createOktaAuth(settingsFromEnv(settings, readEnv));
 * ```
 */
export function createOktaAuth(config: OktaConfig, options: OktaAuthOptions = {}): OktaAuthProvider {
  return new OktaAuthProvider(configSchema.parse(config), options);
}

/**
 * The `IdentityClient` for Okta: hosted sign-in with PKCE, refresh, sign-out, and users through the Management API.
 * Give it the container's tracer and metrics so each call has its span.
 *
 * ```ts
 * const identity = createOktaIdentityClient(settingsFromEnv(settings, readEnv), { tracer, metrics });
 * ```
 */
export function createOktaIdentityClient(config: OktaConfig, options: OktaIdentityOptions = {}): OktaIdentityClient {
  return new OktaIdentityClient(configSchema.parse(config), options);
}
