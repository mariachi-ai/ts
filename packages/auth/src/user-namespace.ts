import { AuthError } from '@mariachi/core';
import type { ResolvedIdentity } from './types';

const NAMESPACE = /^[a-z0-9][a-z0-9_-]{0,31}$/;

/**
 * Wraps a token verifier so that the people it verifies get user ids prefixed with a namespace:
 * `workos.user_01H…` in place of `user_01H…`.
 *
 * A user id is unique only within the identity provider that issued it. An app that accepts sign-ins
 * from one provider needs nothing. An app that accepts them from several must make sure two
 * providers can't issue the same id, because the id is the key of everything kept about a user:
 * memberships, sessions, rows a user owns. Give each provider's verifier its own namespace.
 *
 * ```ts
 * const workos = withUserNamespace(workosProvider, 'workos');
 * const google = withUserNamespace(oidcProvider, 'google');
 * ```
 *
 * Choose it once: changing a namespace makes every user of that provider a new user. Wrap it inside
 * `withPersonalTenants`, so the personal tenant is made from the namespaced id. Only people are
 * renamed (`identityType: 'session'`); an API key or a service keeps its id.
 */
export function withUserNamespace<T extends { verify(token: string): Promise<ResolvedIdentity> }>(verifier: T, namespace: string): T {
  if (!NAMESPACE.test(namespace)) {
    throw new AuthError('auth/config', `A user namespace is 1 to 32 lowercase letters, digits, "_" or "-", starting with a letter or digit: got "${namespace}"`);
  }
  const prefix = `${namespace}.`;
  const verify = async (token: string): Promise<ResolvedIdentity> => {
    const identity = await verifier.verify(token);
    if (identity.identityType !== 'session' || !identity.userId) return identity;
    return { ...identity, userId: `${prefix}${identity.userId}` };
  };
  // Everything else on the verifier (createWebhookHandler, sign, revoke, ...) stays reachable
  return Object.create(verifier, { verify: { value: verify, enumerable: true } }) as T;
}
