export { FirebaseAuthProvider, type FirebaseAuthConfig, type FirebaseIdTokenPayload } from './provider';
export { FirebaseIdentityClient, type FirebaseIdentityClientConfig } from './identity-client';
export { FirebaseError } from './errors';
export { FIREBASE_KEYS_URL, type FirebaseDeps } from './api';
export { firebaseWebConfig, type FirebaseWebConfig } from './web-config';
export { provider, settings, configSchema, envNames, operations, type FirebaseConfig, type FirebaseOperation } from './generated';

import type { FirebaseDeps } from './api';
import { FirebaseIdentityClient, type FirebaseIdentityClientConfig } from './identity-client';
import { type FirebaseAuthConfig, FirebaseAuthProvider } from './provider';

/** An `AuthProvider` for Firebase ID tokens. Pass it to `bearerStrategy` or `createAuthMiddleware`. */
export function createFirebaseAuth(config: FirebaseAuthConfig, deps: FirebaseDeps = {}): FirebaseAuthProvider {
  return new FirebaseAuthProvider(config, deps);
}

/** An `IdentityClient` on Firebase Authentication, for an app's own sign-in pages. */
export function createFirebaseIdentityClient(config: FirebaseIdentityClientConfig, deps: FirebaseDeps = {}): FirebaseIdentityClient {
  return new FirebaseIdentityClient(config, deps);
}
