export type { AsymmetricAlgorithm, ClaimSource, OidcClaims, OidcConfig } from './types';
export { OidcAuthProvider } from './provider';

import { OidcAuthProvider } from './provider';
import type { OidcConfig } from './types';

/** An `AuthProvider` for any OpenID Connect issuer. Pass it to `bearerStrategy` or `createAuthMiddleware`. */
export function createOidcAuth(config: OidcConfig): OidcAuthProvider {
  return new OidcAuthProvider(config);
}
