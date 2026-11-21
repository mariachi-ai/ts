/**
 * `@mariachi/auth-okta/testing`: an Okta identity client for an app's tests, held in memory, with the same shape
 * as `createOktaIdentityClient`'s; and Event Hook requests to post to the app's endpoint.
 */
import { randomUUID } from 'node:crypto';
import type { IdentityUser } from '@mariachi/auth';
import { AuthError } from '@mariachi/core';
import type { OktaIdentityClient, OktaSignInResult } from './identity-client';
import type { LogEvent, OktaEventHookDelivery } from './schemas';
import { OKTA_VERIFICATION_HEADER } from './webhooks';

/** The identity client's public methods: what an app's code depends on. */
export type OktaIdentity = Pick<OktaIdentityClient, keyof OktaIdentityClient>;

export interface FakeOktaIdentity extends OktaIdentity {
  users_: Map<string, IdentityUser>;
  /** Codes `exchangeCode` accepts, each to the user it signs in. Add one where the test stands in for Okta's redirect. */
  codes_: Map<string, string>;
  /** Refresh tokens that are still good, each to its user. */
  refreshTokens_: Map<string, string>;
}

/** An in-memory Okta: seed users and sign-in codes, then hand it to the code under test in place of the client. */
export function fakeOktaIdentity(seed: { users?: IdentityUser[] } = {}): FakeOktaIdentity {
  const users_ = new Map((seed.users ?? []).map((u) => [u.id, u]));
  const codes_ = new Map<string, string>();
  const refreshTokens_ = new Map<string, string>();
  const refused = () => new AuthError('auth/invalid-grant', 'Okta refused the grant (invalid_grant)');
  const notSupported = (method: string) => async (): Promise<never> => {
    throw new AuthError('auth/not-supported', `Okta: ${method} is not supported`);
  };
  const issue = (userId: string): OktaSignInResult['tokens'] => {
    const refreshToken = `rt_${randomUUID()}`;
    refreshTokens_.set(refreshToken, userId);
    return { accessToken: `at_${randomUUID()}`, refreshToken, idToken: `id_${userId}`, expiresAt: Date.now() + 3_600_000 };
  };
  const url = (path: string, params: Record<string, string | undefined>) => {
    const u = new URL(`https://okta.test/oauth2/default${path}`);
    for (const [k, v] of Object.entries(params)) if (v !== undefined) u.searchParams.set(k, v);
    return u.toString();
  };
  return {
    provider: 'okta',
    users_,
    codes_,
    refreshTokens_,
    authorizationUrl: (input) => url('/v1/authorize', { redirect_uri: input.redirectUri, state: input.state, code_challenge: input.codeChallenge, idp: input.provider }),
    signInUrl: (input) => url('/v1/authorize', { redirect_uri: input.redirectUri, state: input.state, code_challenge: input.codeChallenge, idp: input.idp }),
    logoutUrl: (input) => url('/v1/logout', { id_token_hint: input.idToken, post_logout_redirect_uri: input.postLogoutRedirectUri, state: input.state }),
    async exchangeCode(input) {
      const userId = codes_.get(input.code);
      const user = userId ? users_.get(userId) : undefined;
      if (!user) throw refused();
      codes_.delete(input.code);
      return { status: 'signed-in', user, tokens: issue(user.id) };
    },
    async refresh(refreshToken) {
      const userId = refreshTokens_.get(refreshToken);
      if (!userId) throw refused();
      return { ...issue(userId), refreshToken };
    },
    async signOut(input) {
      if (input.refreshToken) refreshTokens_.delete(input.refreshToken);
    },
    async getUser(id) {
      return users_.get(id) ?? null;
    },
    async findUserByEmail(email) {
      return [...users_.values()].find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
    },
    async findUserByLogin(login) {
      return [...users_.values()].find((u) => u.email.toLowerCase() === login.toLowerCase()) ?? null;
    },
    async createUser(input) {
      if ([...users_.values()].some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
        throw new AuthError('auth/identity-provider', 'Okta request failed (okta/validation-failed)');
      }
      const user: IdentityUser = { id: `00u${randomUUID().replace(/-/g, '').slice(0, 17)}`, email: input.email, emailVerified: false, name: input.name ?? null, avatarUrl: null, externalId: input.externalId ?? null };
      users_.set(user.id, user);
      return user;
    },
    async deleteUser(id) {
      users_.delete(id);
    },
    signInWithPassword: notSupported('signInWithPassword'),
    sendPasswordReset: notSupported('sendPasswordReset'),
    resetPassword: notSupported('resetPassword'),
    setPassword: notSupported('setPassword'),
    startEmailCode: notSupported('startEmailCode'),
    signInWithEmailCode: notSupported('signInWithEmailCode'),
    pendingVerificationCode: notSupported('pendingVerificationCode'),
    verifyEmailAndSignIn: notSupported('verifyEmailAndSignIn'),
  };
}

/** A System Log event about a user, to put in a test delivery. */
export function oktaLogEvent(eventType: string, user: { id: string; login?: string; displayName?: string }, overrides: Partial<LogEvent> = {}): LogEvent {
  return {
    uuid: randomUUID(),
    published: '2026-11-21T10:00:00.000Z',
    eventType,
    actor: { id: '00uadmin', type: 'User', alternateId: 'admin@example.com', displayName: 'Admin' },
    target: [{ id: user.id, type: 'User', alternateId: user.login ?? null, displayName: user.displayName ?? null }],
    outcome: { result: 'SUCCESS', reason: null },
    ...overrides,
  };
}

/** The body and headers Okta would send to an Event Hook for these events. */
export function oktaEventHookRequest(events: LogEvent[], secret: string): { rawBody: string; headers: Record<string, string>; delivery: OktaEventHookDelivery } {
  const delivery: OktaEventHookDelivery = {
    eventType: 'com.okta.event_hook',
    eventTypeVersion: '1.0',
    cloudEventsVersion: '0.1',
    source: 'https://okta.test/api/v1/eventHooks/who_test',
    eventId: randomUUID(),
    eventTime: '2026-11-21T10:00:01.000Z',
    contentType: 'application/json',
    data: { events },
  };
  return { rawBody: JSON.stringify(delivery), headers: { authorization: secret, 'content-type': 'application/json' }, delivery };
}

/** The headers of Okta's one-time verification `GET`. */
export function oktaVerificationRequest(secret: string, challenge = randomUUID()): { headers: Record<string, string>; challenge: string } {
  return { headers: { authorization: secret, [OKTA_VERIFICATION_HEADER]: challenge }, challenge };
}
