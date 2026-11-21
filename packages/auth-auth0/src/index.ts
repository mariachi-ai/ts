import { type Auth0Deps, Auth0IdentityClient, type Auth0IdentityClientConfig } from './identity-client';
import { type Auth0AuthConfig, Auth0AuthProvider } from './provider';

export { Auth0AuthProvider, type Auth0AuthConfig } from './provider';
export { Auth0IdentityClient, toUser as auth0UserToIdentityUser, DEFAULT_DATABASE_CONNECTION, DEFAULT_SCOPE, type Auth0IdentityClientConfig, type Auth0Deps } from './identity-client';
export { auth0LogoutUrl, type Auth0LogoutInput } from './logout';
export {
  Auth0WebhookAuth,
  Auth0WebhookController,
  Auth0WebhookHandler,
  Auth0WebhookBody,
  auth0WebhookAuth,
  auth0EventType,
  auth0BearerMatches,
  normalizeAuth0Event,
  normalizeAuth0EventType,
  type Auth0WebhookControllerConfig,
} from './webhooks';
export { Auth0Error } from './errors';
export { provider, settings, configSchema, envNames, operations, webhookEvents, type Auth0Config, type Auth0Operation } from './generated';
export type { Auth0Event, Auth0User, TokenResponse } from './schemas';

/** An `AuthProvider` for the tenant's tokens. Pass it to `bearerStrategy` or `createAuthMiddleware`. */
export function createAuth0Auth(config: Auth0AuthConfig): Auth0AuthProvider {
  return new Auth0AuthProvider(config);
}

/** The `IdentityClient` for Auth0. Build it once at startup, with the container's tracer and metrics. */
export function createAuth0IdentityClient(config: Auth0IdentityClientConfig, deps: Auth0Deps = {}): Auth0IdentityClient {
  return new Auth0IdentityClient(config, deps);
}
