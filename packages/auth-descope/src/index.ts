export { DescopeAuthProvider, DEFAULT_DESCOPE_BASE_URL, type DescopeAuthConfig, type DescopeSessionClaims } from './provider';
export { DescopeIdentityClient, type DescopeIdentityClientConfig, type DescopeDeps } from './identity-client';
export { DescopeError } from './errors';
export { DESCOPE_SIGNATURE_HEADER, DescopeWebhookBody, descopeAuthEvents, descopeEventType, descopeWebhookAuth, normalizeDescopeEventType } from './webhooks';
export type { DescopeAuditEvent, DescopeUser } from './schemas';
export { provider, settings, configSchema, envNames, operations, webhookEvents, type DescopeConfig, type DescopeOperation } from './generated';

import { type DescopeAuthConfig, DescopeAuthProvider } from './provider';
import { type DescopeDeps, DescopeIdentityClient, type DescopeIdentityClientConfig } from './identity-client';

/** An `AuthProvider` for Descope's session tokens. Pass it to `bearerStrategy` or `createAuthMiddleware`. */
export function createDescopeAuth(config: DescopeAuthConfig): DescopeAuthProvider {
  return new DescopeAuthProvider(config);
}

/** An `IdentityClient` on Descope's REST API: password, email-code and reset sign-ins, sessions, and users with the management key. */
export function createDescopeIdentityClient(config: DescopeIdentityClientConfig, deps: DescopeDeps = {}): DescopeIdentityClient {
  return new DescopeIdentityClient(config, deps);
}
