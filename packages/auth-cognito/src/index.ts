import { type CognitoAuthConfig, type CognitoAuthDeps, CognitoAuthProvider } from './provider';
import { type CognitoIdentityClientConfig, type CognitoIdentityDeps, CognitoIdentityClient } from './identity-client';

export { CognitoAuthProvider, type CognitoAuthConfig, type CognitoAuthDeps, type CognitoClaims } from './provider';
export { CognitoIdentityClient, type CognitoIdentityClientConfig, type CognitoIdentityDeps, type CognitoTokenSet } from './identity-client';
export type { CognitoAdminClient } from './admin';
export type { CognitoDeps } from './shared';
export { CognitoError } from './errors';
export { cognitoSecretHash } from './secret-hash';
export { provider, settings, configSchema, envNames, operations, type CognitoConfig, type CognitoOperation } from './generated';

/**
 * An `AuthProvider` for a Cognito user pool's tokens. Pass it to `bearerStrategy` or `createAuthMiddleware`.
 *
 * ```ts
 * const cognito = settingsFromEnv<CognitoConfig>(settings, readEnv);
 * const auth = createCognitoAuth(cognito, { tracer, metrics });
 * ```
 */
export function createCognitoAuth(config: CognitoAuthConfig, deps?: CognitoAuthDeps): CognitoAuthProvider {
  return new CognitoAuthProvider(config, deps);
}

/** An `IdentityClient` for a Cognito user pool: managed login, password sign-in and users. Server-side only. */
export function createCognitoIdentityClient(config: CognitoIdentityClientConfig, deps?: CognitoIdentityDeps): CognitoIdentityClient {
  return new CognitoIdentityClient(config, deps);
}
