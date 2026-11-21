import { decodeJwt } from 'jose';
import { AuthError } from '@mariachi/core';
import type {
  AuthorizationUrlInput,
  CodeExchangeInput,
  CreateIdentityUserInput,
  EmailCodeInput,
  EmailDelivery,
  IdentityClient,
  IdentityRequestContext,
  IdentityUser,
  PasswordSignInInput,
  SignInResult,
  SignOutInput,
  TokenSet,
  VerifyEmailInput,
} from '@mariachi/auth';
import { ProviderError } from '@mariachi/integrations';
import type { z } from 'zod';
import { type StytchDeps, segment, stytchApiBaseUrl, stytchCall } from './api';
import { type StytchConfig, type StytchOperation, configSchema } from './generated';
import {
  StytchAuthenticated,
  StytchOk,
  StytchOtpSent,
  StytchResetStarted,
  StytchSessionAuthenticated,
  StytchUser,
  StytchUserCreated,
  StytchUserResponse,
  StytchUserSearch,
} from './schemas';

export interface StytchIdentityClientConfig extends StytchConfig {
  /**
   * How long a session lasts, in minutes (5 to 527 040), for every sign-in. Default 60. Its JWT lasts five
   * minutes whatever this says; `refresh` with the session token gets a new one.
   */
  sessionDurationMinutes?: number;
  /**
   * Where the password reset email links to (your reset page, which reads `token` from the query). Must be a
   * Reset password redirect URL in the Dashboard. Unset, the Dashboard's default is used.
   */
  passwordResetRedirectUrl?: string;
  /** How long a reset link works, in minutes (5 to 10 080). Unset, Stytch's default (30). */
  passwordResetExpirationMinutes?: number;
  /** How long an emailed code works, in minutes. Unset, Stytch's default. */
  emailCodeExpirationMinutes?: number;
}

/** Stytch's names for the social sign-in providers the port knows. */
const OAUTH_PROVIDERS = { google: 'google', github: 'github' } as const;

type Refused = 'auth/invalid-credentials' | 'auth/invalid-grant';

/**
 * `IdentityUser` from Stytch's User object: its first email address and whether Stytch has seen the person
 * prove it (`verified`, which Stytch sets only once they authenticate with it), the name's parts joined, the
 * first OAuth provider's picture, and `external_id`.
 */
export function stytchIdentityUser(user: z.input<typeof StytchUser>): IdentityUser {
  const u = StytchUser.parse(user);
  const email = u.emails[0];
  const name = [u.name?.first_name, u.name?.middle_name, u.name?.last_name].filter(Boolean).join(' ') || null;
  return {
    id: u.user_id,
    email: email?.email ?? '',
    emailVerified: email?.verified === true,
    name,
    avatarUrl: u.providers.find((p) => p.profile_picture_url)?.profile_picture_url ?? null,
    externalId: u.external_id || null,
  };
}

/** The session id and the JWT's expiry, from a session JWT Stytch just returned to us over TLS (read, not verified). */
function tokens(res: { session_token: string; session_jwt: string; session?: { session_id: string } }): TokenSet {
  let expiresAt: number | undefined;
  try {
    const exp = decodeJwt(res.session_jwt).exp;
    if (typeof exp === 'number') expiresAt = exp * 1000;
  } catch {
    // Not a JWT: no expiry to report.
  }
  return { accessToken: res.session_jwt, refreshToken: res.session_token, sessionId: res.session?.session_id, expiresAt };
}

function signedIn(res: z.infer<typeof StytchAuthenticated>): SignInResult {
  const session = res.session ?? res.user_session;
  return { status: 'signed-in', user: stytchIdentityUser(res.user), tokens: tokens({ ...res, session }) };
}

function attributes(context: IdentityRequestContext): { ip_address?: string; user_agent?: string } | undefined {
  if (!context.ipAddress && !context.userAgent) return undefined;
  return { ip_address: context.ipAddress, user_agent: context.userAgent };
}

/**
 * `IdentityClient` on Stytch's Consumer API, for sign-in on the app's own pages: passwords, emailed one-time
 * codes, Google and GitHub, sign-out, password resets and users. Every call is server-side with the project id and
 * secret, goes through `callProvider` (`stytch passwords.authenticate`), and fails as an `AuthError`:
 * `auth/invalid-credentials` or `auth/invalid-grant` when Stytch refused what the person gave,
 * `auth/password-reset-required` when Stytch wants a reset before a password works again (a breached password,
 * or an email first used without one), `auth/account-locked`, `auth/rate-limited`, and `auth/identity-provider`
 * for anything else. `metadata.providerCode` is Stytch's `error_type`.
 *
 * Stytch sends the codes and reset links itself, with the Dashboard's email templates, so `startEmailCode` and
 * `sendPasswordReset` always answer `deliveredBy: 'provider'` (or `'nobody'`).
 *
 * Not supported (`auth/not-supported`): `setPassword` (Stytch takes no new password by user id) and the
 * `email-verification` hold (`pendingVerificationCode`, `verifyEmailAndSignIn`): Stytch never holds a sign-in for
 * it.
 */
export class StytchIdentityClient implements IdentityClient {
  readonly provider = 'stytch';

  private readonly cfg: StytchIdentityClientConfig;
  private readonly sessionMinutes: number;

  constructor(
    config: StytchIdentityClientConfig,
    private readonly deps: StytchDeps = {},
  ) {
    const parsed = configSchema.safeParse(config);
    if (!parsed.success) throw new AuthError('auth/invalid-config', 'Stytch: `projectId` and `secret` are required');
    this.cfg = { ...config, ...parsed.data };
    this.sessionMinutes = config.sessionDurationMinutes ?? 60;
    if (!Number.isInteger(this.sessionMinutes) || this.sessionMinutes < 5 || this.sessionMinutes > 527_040) {
      throw new AuthError('auth/invalid-config', 'Stytch: `sessionDurationMinutes` is from 5 to 527040');
    }
  }

  /** One call, with `ctx` null: the port's methods carry no context. */
  private call<T>(operation: StytchOperation, request: Parameters<typeof stytchCall>[3], schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
    return stytchCall(null, { projectId: this.cfg.projectId, secret: this.cfg.secret, deps: this.deps }, operation, request, schema);
  }

  /** A failed call as the port's `AuthError`, keeping Stytch's `error_type` and never its message. */
  private error(error: unknown, refused: Refused | 'auth/identity-provider', credential = false): AuthError {
    if (error instanceof AuthError) return error;
    if (!(error instanceof ProviderError)) return new AuthError('auth/identity-provider', 'Stytch request failed');
    const meta = { status: error.status, providerCode: error.providerCode, category: error.category };
    if (error.providerCode === 'reset_password') return new AuthError('auth/password-reset-required', 'Stytch wants a password reset before this password works', meta);
    if (error.providerCode === 'user_lock_limit_reached') return new AuthError('auth/account-locked', 'Stytch has locked the user after too many failed attempts', meta);
    if (error.category === 'rate-limited') return new AuthError('auth/rate-limited', 'Stytch rate limit reached', meta);
    const reason = error.code.slice('stytch/'.length);
    // What the person gave was refused (a code, a token, an address). A wrong environment is the app's config, and
    // `unauthorized_credentials` means a wrong password or session token only where one was sent; elsewhere it's
    // the app's own project id and secret.
    const refusedCategory = ['invalid-request', 'not-found', 'conflict'].includes(error.category) || (credential && error.category === 'unauthorized');
    if (reason !== 'wrong-environment' && refusedCategory) {
      return new AuthError(refused, `Stytch refused the request (${error.providerCode ?? error.status})`, meta);
    }
    return new AuthError('auth/identity-provider', `Stytch request failed (${error.providerCode ?? error.category})`, meta);
  }

  async signInWithPassword(input: PasswordSignInInput): Promise<SignInResult> {
    try {
      const res = await this.call(
        'passwords.authenticate',
        { method: 'POST', path: '/v1/passwords/authenticate', json: { email: input.email, password: input.password, session_duration_minutes: this.sessionMinutes } },
        StytchAuthenticated,
      );
      return signedIn(res);
    } catch (error) {
      throw this.error(error, 'auth/invalid-credentials', true);
    }
  }

  /**
   * Stytch's OAuth start URL, for the browser. Stytch has no `state` parameter, so `state` rides on the redirect
   * URL as a query parameter: register `<redirectUri>?state={}` as both a Login and a Signup redirect URL in the
   * Dashboard. Stytch comes back to it with `state`, `stytch_token_type=oauth` and `token` (the code for
   * `exchangeCode`): read them with `readStytchOAuthCallback`. Needs `publicToken`.
   */
  authorizationUrl(input: AuthorizationUrlInput): string {
    if (!this.cfg.publicToken) throw new AuthError('auth/invalid-config', 'Stytch: social sign-in needs `publicToken` (STYTCH_PUBLIC_TOKEN)');
    const redirect = new URL(input.redirectUri);
    redirect.searchParams.set('state', input.state);
    const url = new URL(`${stytchApiBaseUrl(this.cfg.projectId)}/v1/public/oauth/${OAUTH_PROVIDERS[input.provider]}/start`);
    url.searchParams.set('public_token', this.cfg.publicToken);
    url.searchParams.set('login_redirect_url', redirect.toString());
    url.searchParams.set('signup_redirect_url', redirect.toString());
    url.searchParams.set('code_challenge', input.codeChallenge);
    if (input.loginHint) url.searchParams.set('provider_login_hint', input.loginHint);
    return url.toString();
  }

  /** Finishes social sign-in: `code` is the `token` Stytch put on the redirect, with the PKCE verifier. */
  async exchangeCode(input: CodeExchangeInput): Promise<SignInResult> {
    try {
      const res = await this.call(
        'oauth.authenticate',
        { method: 'POST', path: '/v1/oauth/authenticate', json: { token: input.code, code_verifier: input.codeVerifier, session_duration_minutes: this.sessionMinutes } },
        StytchAuthenticated,
      );
      return signedIn(res);
    } catch (error) {
      throw this.error(error, 'auth/invalid-grant');
    }
  }

  /** A fresh session JWT for the session token (`refreshToken`), while the session lasts. */
  async refresh(refreshToken: string): Promise<TokenSet> {
    try {
      const res = await this.call('sessions.authenticate', { method: 'POST', path: '/v1/sessions/authenticate', json: { session_token: refreshToken } }, StytchSessionAuthenticated);
      return tokens(res);
    } catch (error) {
      throw this.error(error, 'auth/invalid-grant', true);
    }
  }

  /** Revokes the session by id, or else by its token. A session that's already gone is fine. */
  async signOut(input: SignOutInput): Promise<void> {
    const json = input.sessionId ? { session_id: input.sessionId } : input.refreshToken ? { session_token: input.refreshToken } : undefined;
    if (!json) return;
    try {
      await this.call('sessions.revoke', { method: 'POST', path: '/v1/sessions/revoke', json }, StytchOk);
    } catch (error) {
      if (error instanceof ProviderError && error.category === 'not-found') return;
      throw this.error(error, 'auth/identity-provider');
    }
  }

  async getUser(id: string): Promise<IdentityUser | null> {
    try {
      return stytchIdentityUser(await this.call('users.get', { method: 'GET', path: `/v1/users/${segment(id)}` }, StytchUserResponse));
    } catch (error) {
      if (error instanceof ProviderError && error.category === 'not-found') return null;
      throw this.error(error, 'auth/identity-provider');
    }
  }

  async findUserByEmail(email: string): Promise<IdentityUser | null> {
    const user = await this.stytchUserByEmail(email);
    return user ? stytchIdentityUser(user) : null;
  }

  /**
   * Creates the user: with a password through `passwords.create`, otherwise `users.create`; an `externalId` is set
   * with `users.update` after a password create, which doesn't take one. Stytch marks an email verified only once
   * the person signs in with it, so the user starts unverified whatever `emailVerified` says.
   */
  async createUser(input: CreateIdentityUserInput): Promise<IdentityUser> {
    const name = input.name ? splitName(input.name) : undefined;
    try {
      if (!input.password) {
        const res = await this.call('users.create', { method: 'POST', path: '/v1/users', json: { email: input.email, name, external_id: input.externalId } }, StytchUserCreated);
        return stytchIdentityUser(res.user);
      }
      const res = await this.call('passwords.create', { method: 'POST', path: '/v1/passwords', json: { email: input.email, password: input.password, name } }, StytchUserCreated);
      if (!input.externalId) return stytchIdentityUser(res.user);
      const updated = await this.call('users.update', { method: 'PUT', path: `/v1/users/${segment(res.user_id)}`, json: { external_id: input.externalId } }, StytchUserCreated);
      return stytchIdentityUser(updated.user);
    } catch (error) {
      throw this.error(error, 'auth/invalid-grant');
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.call('users.delete', { method: 'DELETE', path: `/v1/users/${segment(id)}` }, StytchOk);
    } catch (error) {
      if (error instanceof ProviderError && error.category === 'not-found') return;
      throw this.error(error, 'auth/identity-provider');
    }
  }

  /** Stytch emails the reset link. An address with no account answers `nobody`: tell the person the same either way. */
  async sendPasswordReset(email: string): Promise<EmailDelivery<{ token: string; url?: string; expiresAt?: number }>> {
    try {
      await this.call(
        'passwords.resetStart',
        {
          method: 'POST',
          path: '/v1/passwords/email/reset/start',
          json: { email, reset_password_redirect_url: this.cfg.passwordResetRedirectUrl, reset_password_expiration_minutes: this.cfg.passwordResetExpirationMinutes },
        },
        StytchResetStarted,
      );
      return { deliveredBy: 'provider' };
    } catch (error) {
      if (error instanceof ProviderError && error.category === 'not-found') return { deliveredBy: 'nobody' };
      throw this.error(error, 'auth/invalid-grant');
    }
  }

  /** Sets the new password with the `token` from the reset link's query. */
  async resetPassword(input: { token: string; password: string }): Promise<IdentityUser> {
    try {
      const res = await this.call('passwords.reset', { method: 'POST', path: '/v1/passwords/email/reset', json: { token: input.token, password: input.password } }, StytchAuthenticated.pick({ user: true }));
      return stytchIdentityUser(res.user);
    } catch (error) {
      throw this.error(error, 'auth/invalid-grant');
    }
  }

  async setPassword(_userId: string, _password: string): Promise<void> {
    throw new AuthError('auth/not-supported', "Stytch doesn't set a password by user id: send a password reset instead");
  }

  /** Stytch emails a one-time code, creating the user (passwordless, unverified) when the address is new. */
  async startEmailCode(email: string, context: IdentityRequestContext = {}): Promise<EmailDelivery<{ code: string; expiresAt?: number }>> {
    try {
      await this.call(
        'otps.emailLoginOrCreate',
        { method: 'POST', path: '/v1/otps/email/login_or_create', json: { email, expiration_minutes: this.cfg.emailCodeExpirationMinutes, attributes: attributes(context) } },
        StytchOtpSent,
      );
      return { deliveredBy: 'provider' };
    } catch (error) {
      throw this.error(error, 'auth/invalid-grant');
    }
  }

  /** Signs in with the emailed code. Stytch takes the email's id, so the user is looked up by email first. */
  async signInWithEmailCode(input: EmailCodeInput): Promise<SignInResult> {
    const user = await this.stytchUserByEmail(input.email);
    const methodId = user?.emails.find((e) => e.email.toLowerCase() === input.email.toLowerCase())?.email_id;
    if (!methodId) throw new AuthError('auth/invalid-grant', 'Stytch refused the code: no code was sent to this address');
    try {
      const res = await this.call(
        'otps.authenticate',
        { method: 'POST', path: '/v1/otps/authenticate', json: { method_id: methodId, code: input.code, session_duration_minutes: this.sessionMinutes, attributes: attributes(input) } },
        StytchAuthenticated,
      );
      return signedIn(res);
    } catch (error) {
      throw this.error(error, 'auth/invalid-grant');
    }
  }

  async pendingVerificationCode(_pending: Extract<SignInResult, { status: 'pending' }>): Promise<string> {
    throw new AuthError('auth/not-supported', 'Stytch never holds a sign-in for email verification');
  }

  async verifyEmailAndSignIn(_input: VerifyEmailInput): Promise<SignInResult> {
    throw new AuthError('auth/not-supported', 'Stytch never holds a sign-in for email verification');
  }

  private async stytchUserByEmail(email: string): Promise<z.infer<typeof StytchUser> | null> {
    try {
      const res = await this.call(
        'users.search',
        { method: 'POST', path: '/v1/users/search', json: { limit: 1, query: { operator: 'AND', operands: [{ filter_name: 'email_address', filter_value: [email] }] } } },
        StytchUserSearch,
      );
      return res.results.find((u) => u.emails.some((e) => e.email.toLowerCase() === email.toLowerCase())) ?? null;
    } catch (error) {
      throw this.error(error, 'auth/identity-provider');
    }
  }
}

/** "Ada Lovelace" as Stytch's name object: the first word, and the rest as the last name. */
function splitName(name: string): { first_name: string; last_name?: string } {
  const [first = '', ...rest] = name.trim().split(/\s+/);
  return rest.length ? { first_name: first, last_name: rest.join(' ') } : { first_name: first };
}

/**
 * What Stytch's OAuth redirect carries: `token` (the `code` for `exchangeCode`) and the `state` that
 * `authorizationUrl` put on the redirect URL. `null` when it isn't an OAuth redirect.
 */
export function readStytchOAuthCallback(query: URLSearchParams | Record<string, string | string[] | undefined>): { code: string; state: string } | null {
  const get = (k: string) => {
    if (query instanceof URLSearchParams) return query.get(k) ?? undefined;
    const v = query[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const code = get('token');
  const state = get('state');
  if (get('stytch_token_type') !== 'oauth' || !code || !state) return null;
  return { code, state };
}
