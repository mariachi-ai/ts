export type { AsymmetricAlgorithm, ClaimSource, OidcClaims, OidcConfig } from './types';
export { OidcAuthProvider } from './provider';
export type { OidcDeps } from './provider-fetch';
export { settings, operations, envNames, type OidcOperation } from './generated';

import { OidcAuthProvider } from './provider';
import type { OidcDeps } from './provider-fetch';
import type { OidcConfig } from './types';

/**
 * An `AuthProvider` for any OpenID Connect issuer. Pass it to `bearerStrategy` or `createAuthMiddleware`. `deps` is
 * the container's tracer and metrics, for the spans of the discovery and key fetches.
 */
export function createOidcAuth(config: OidcConfig, deps: OidcDeps = {}): OidcAuthProvider {
  return new OidcAuthProvider(config, undefined, deps);
}
