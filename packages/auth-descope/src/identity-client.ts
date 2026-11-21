import { decodeJwt } from 'jose';
import { AuthError } from '@mariachi/core';
import type {
  CreateIdentityUserInput,
  EmailCodeInput,
  EmailDelivery,
  IdentityClient,
  IdentityUser,
  PasswordSignInInput,
  SignInResult,
  SignOutInput,
  TokenSet,
} from '@mariachi/auth';
import { type FailureInfo, type ProviderDeps, type ProviderRequest, mappedFailure, providerRequest } from '@mariachi/integrations';
import { z } from 'zod';
import { DescopeError } from './errors';
import { type DescopeConfig, type DescopeOperation, configSchema, errorMap, provider } from './generated';
import { descopeBase } from './provider';
import { type DescopeUser, JwtResponse, UserResponse, UsersResponse } from './schemas';

export interface DescopeIdentityClientConfig extends DescopeConfig {
  /** Descope's API address: a regional one, or the project's custom domain. Default `https://api.descope.com`. */
  baseUrl?: string;
  /** Where a password reset email's link goes (the app's page that reads its token and calls `resetPassword`). */
  passwordResetUrl?: string;
}

export interface DescopeDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

type Refused = 'auth/invalid-credentials' | 'auth/invalid-grant';
/** Who the call is made as: the project (sign-in), a user's refresh JWT, or the management key. */
type As = { project: true } | { refreshJwt: string } | { management: true };

/** Descope's error body is `{ errorCode, errorDescription, errorMessage }`: the code is kept, the rest isn't (it can echo input). */
function failure(_status: number, body: unknown): FailureInfo | undefined {
  const code = (body as { errorCode?: unknown } | null)?.errorCode;
  const providerCode = typeof code === 'string' ? code : undefined;
  const mapped = mappedFailure(errorMap, providerCode);
  return { providerCode, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

function withCause(error: AuthError, cause: unknown): AuthError {
  Object.defineProperty(error, 'cause', { value: cause, enumerable: false });
  return error;
}

/** A failed call as the auth port's error, with Descope's error kept as `cause`. */
function portError(error: unknown, refused: Refused | null): AuthError {
  if (error instanceof AuthError) return error;
  if (!(error instanceof DescopeError)) return withCause(new AuthError('auth/identity-provider', 'Descope request failed'), error);
  const meta = { descopeCode: error.code, category: error.category, providerCode: error.providerCode, status: error.status };
  if (error.category === 'rate-limited') return withCause(new AuthError('auth/rate-limited', 'Descope rate limit reached', meta), error);
  // A sign-in refused for a wrong secret, an unknown user or a spent code: all the same answer, so it says nothing about which.
  if (refused && ['invalid-request', 'unauthorized', 'forbidden', 'not-found'].includes(error.category)) {
    return withCause(new AuthError(refused, 'Descope refused the sign-in', meta), error);
  }
  return withCause(new AuthError('auth/identity-provider', `Descope request failed (${error.code})`, meta), error);
}

function notFound(error: unknown): boolean {
  return error instanceof DescopeError && error.category === 'not-found';
}

function toUser(u: DescopeUser): IdentityUser {
  return {
    id: u.userId,
    email: u.email ?? '',
    emailVerified: u.verifiedEmail === true,
    name: u.name || [u.givenName, u.familyName].filter(Boolean).join(' ') || null,
    avatarUrl: u.picture || null,
    externalId: null,
  };
}

const FLOWS = "Descope's main sign-in path is its Flows, run in the browser by Descope's web SDK; verify the session JWT they give with DescopeAuthProvider";

/**
 * `IdentityClient` on Descope's REST API, for an app whose backend drives sign-in: password sign-in, emailed
 * one-time codes (Descope sends them), password reset links, refresh and sign-out. Users are read, created and
 * deleted with the management key (`DESCOPE_MANAGEMENT_KEY`). Social sign-in isn't here: Descope's OAuth starts
 * with a call that returns the provider's URL, which the port's `authorizationUrl` can't make, so run it in a
 * Descope Flow.
 *
 * Sign-ins need the project to return refresh tokens in the response body, not manage them in cookies (Project
 * Settings); otherwise there is no refresh token to hand back.
 *
 * Every call is one span (`descope password.signIn`, `descope users.load`). The port's methods take no context, so
 * the spans carry no tenant. Failures are the port's `AuthError` codes, with the `DescopeError` as `cause`.
 */
export class DescopeIdentityClient implements IdentityClient {
  readonly provider = provider.id;

  private readonly cfg: DescopeIdentityClientConfig;
  private readonly base: string;
  private readonly server: string;

  constructor(
    config: DescopeIdentityClientConfig,
    private readonly deps: DescopeDeps = {},
  ) {
    const parsed = configSchema.safeParse(config);
    if (!parsed.success) throw new AuthError('auth/invalid-config', 'Descope: `projectId` is required');
    this.cfg = config;
    this.base = descopeBase(config.baseUrl);
    this.server = new URL(this.base).host;
  }

  private bearer(as: As): string {
    if ('refreshJwt' in as) return `Bearer ${this.cfg.projectId}:${as.refreshJwt}`;
    if ('management' in as) {
      if (!this.cfg.managementKey) {
        throw new AuthError('auth/invalid-config', 'Descope: reading or changing users needs DESCOPE_MANAGEMENT_KEY (Company settings › Management keys)');
      }
      return `Bearer ${this.cfg.projectId}:${this.cfg.managementKey}`;
    }
    return `Bearer ${this.cfg.projectId}`;
  }

  private async call<T>(operation: DescopeOperation, as: As, request: Omit<ProviderRequest, 'url' | 'headers'> & { path: string }, schema: z.ZodType<T, z.ZodTypeDef, unknown>, deps: DescopeDeps = this.deps): Promise<T> {
    const { path, ...rest } = request;
    return providerRequest(
      null,
      { integration: provider.id, operation, category: provider.category, server: this.server },
      { ...rest, url: `${this.base}${path}`, headers: { authorization: this.bearer(as) } },
      { schema, error: DescopeError, failure, deps },
    );
  }

  /** Not retried: each starts or spends something (a code, a link, a sign-in) that a retry after a lost answer would repeat. */
  private get once(): DescopeDeps {
    return { ...this.deps, retry: { ...this.deps.retry, attempts: 1 } };
  }

  private tokens(res: JwtResponse, previousRefreshJwt?: string): TokenSet {
    const refreshToken = res.refreshJwt ?? previousRefreshJwt;
    if (!refreshToken) {
      throw new AuthError('auth/identity-provider', 'Descope returned no refresh JWT: set the project to return refresh tokens in the response body, not in cookies (Project Settings)');
    }
    let expiresAt: number | undefined;
    try {
      // Read, not verified: the token is Descope's own reply over TLS, and AuthProvider.verify checks every token a client sends.
      const exp = decodeJwt(res.sessionJwt).exp;
      if (typeof exp === 'number') expiresAt = exp * 1000;
    } catch {
      // Not a JWT we can read: no expiry to report.
    }
    return { accessToken: res.sessionJwt, refreshToken, expiresAt };
  }

  private signedIn(res: JwtResponse): SignInResult {
    if (!res.user) throw new AuthError('auth/identity-provider', 'Descope signed the user in but returned no user');
    return { status: 'signed-in', user: toUser(res.user), tokens: this.tokens(res) };
  }

  async signInWithPassword(input: PasswordSignInInput): Promise<SignInResult> {
    try {
      const res = await this.call('password.signIn', { project: true }, { method: 'POST', path: '/v1/auth/password/signin', json: { loginId: input.email, password: input.password } }, JwtResponse, this.once);
      return this.signedIn(res);
    } catch (error) {
      throw portError(error, 'auth/invalid-credentials');
    }
  }

  authorizationUrl(): string {
    throw new AuthError('auth/not-supported', `Descope: social sign-in isn't available through IdentityClient. ${FLOWS}`);
  }

  async exchangeCode(): Promise<SignInResult> {
    throw new AuthError('auth/not-supported', `Descope: social sign-in isn't available through IdentityClient. ${FLOWS}`);
  }

  async refresh(refreshToken: string): Promise<TokenSet> {
    try {
      return this.tokens(await this.call('sessions.refresh', { refreshJwt: refreshToken }, { method: 'POST', path: '/v1/auth/refresh', json: {} }, JwtResponse), refreshToken);
    } catch (error) {
      throw portError(error, 'auth/invalid-grant');
    }
  }

  /** Ends the session the refresh JWT belongs to. Descope's tokens name no session, so without one this does nothing. */
  async signOut(input: SignOutInput): Promise<void> {
    if (!input.refreshToken) return;
    try {
      await this.call('sessions.logout', { refreshJwt: input.refreshToken }, { method: 'POST', path: '/v1/auth/logout', json: {} }, z.unknown());
    } catch (error) {
      if (error instanceof DescopeError && error.category === 'unauthorized') return; // Already ended or expired.
      throw portError(error, null);
    }
  }

  async getUser(id: string): Promise<IdentityUser | null> {
    try {
      return toUser((await this.call('users.load', { management: true }, { method: 'GET', path: '/v1/mgmt/user', query: { userId: id } }, UserResponse)).user);
    } catch (error) {
      if (notFound(error)) return null;
      throw portError(error, null);
    }
  }

  private async loginIdOf(userId: string): Promise<string> {
    const { user } = await this.call('users.load', { management: true }, { method: 'GET', path: '/v1/mgmt/user', query: { userId } }, UserResponse);
    const loginId = user.loginIds?.[0];
    if (!loginId) throw new AuthError('auth/identity-provider', 'Descope user has no login id');
    return loginId;
  }

  async findUserByEmail(email: string): Promise<IdentityUser | null> {
    try {
      const { users } = await this.call('users.search', { management: true }, { method: 'POST', path: '/v2/mgmt/user/search', json: { emails: [email], limit: 10 } }, UsersResponse);
      const match = (users ?? []).find((u) => u.email?.toLowerCase() === email.toLowerCase());
      return match ? toUser(match) : null;
    } catch (error) {
      throw portError(error, null);
    }
  }

  /**
   * Creates a user whose login id is the email, verified as `emailVerified` says, with the password when one is
   * given. Descope keeps no id of the app's for a user, so `externalId` is refused: keep that mapping in the app.
   * Not retried, since Descope takes no idempotency key and a retry after a lost answer would make the user twice.
   */
  async createUser(input: CreateIdentityUserInput): Promise<IdentityUser> {
    if (input.externalId !== undefined) throw new AuthError('auth/not-supported', "Descope keeps no external id for a user; store the mapping in the app");
    try {
      const { user } = await this.call(
        'users.create',
        { management: true },
        { method: 'POST', path: '/v1/mgmt/user/create', json: { loginId: input.email, email: input.email, verifiedEmail: input.emailVerified, name: input.name, password: input.password } },
        UserResponse,
        this.once,
      );
      return toUser(user);
    } catch (error) {
      throw portError(error, null);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.call('users.delete', { management: true }, { method: 'POST', path: '/v1/mgmt/user/delete', json: { userId: id } }, z.unknown());
    } catch (error) {
      if (notFound(error)) return;
      throw portError(error, null);
    }
  }

  /**
   * Descope emails a reset link (to `passwordResetUrl`, when set). An address with no user is answered as
   * `nobody`, which the app answers the same way as a sent one.
   */
  async sendPasswordReset(email: string): Promise<EmailDelivery<{ token: string; url?: string; expiresAt?: number }>> {
    try {
      await this.call('password.sendReset', { project: true }, { method: 'POST', path: '/v1/auth/password/reset', json: { loginId: email, redirectUrl: this.cfg.passwordResetUrl } }, z.unknown(), this.once);
      return { deliveredBy: 'provider' };
    } catch (error) {
      if (notFound(error)) return { deliveredBy: 'nobody' };
      throw portError(error, null);
    }
  }

  /**
   * Finishes a reset with the token from the link Descope emailed: the token is verified as a magic link (which
   * signs the user in), the new password is set with that session, and the session is ended again.
   */
  async resetPassword(input: { token: string; password: string }): Promise<IdentityUser> {
    let session: JwtResponse;
    try {
      session = await this.call('magicLink.verify', { project: true }, { method: 'POST', path: '/v1/auth/magiclink/verify', json: { token: input.token } }, JwtResponse, this.once);
    } catch (error) {
      throw portError(error, 'auth/invalid-grant');
    }
    const user = session.user;
    const loginId = user?.loginIds?.[0] ?? user?.email;
    if (!user || !loginId || !session.refreshJwt) {
      throw new AuthError('auth/identity-provider', 'Descope verified the link but returned no user or refresh JWT: set the project to return refresh tokens in the response body');
    }
    try {
      await this.call('password.update', { refreshJwt: session.refreshJwt }, { method: 'POST', path: '/v1/auth/password/update', json: { loginId, newPassword: input.password } }, z.unknown());
    } catch (error) {
      throw portError(error, 'auth/invalid-grant');
    }
    await this.signOut({ refreshToken: session.refreshJwt }).catch(() => undefined);
    return toUser(user);
  }

  async setPassword(userId: string, password: string): Promise<void> {
    try {
      const loginId = await this.loginIdOf(userId);
      await this.call('users.setActivePassword', { management: true }, { method: 'POST', path: '/v1/mgmt/user/password/set/active', json: { loginId, password } }, z.unknown());
    } catch (error) {
      throw portError(error, null);
    }
  }

  /** Descope emails the code, signing the address up first when it's new. */
  async startEmailCode(email: string): Promise<EmailDelivery<{ code: string; expiresAt?: number }>> {
    try {
      await this.call('otp.signUpOrInEmail', { project: true }, { method: 'POST', path: '/v1/auth/otp/signup-in/email', json: { loginId: email } }, z.unknown(), this.once);
      return { deliveredBy: 'provider' };
    } catch (error) {
      throw portError(error, null);
    }
  }

  async signInWithEmailCode(input: EmailCodeInput): Promise<SignInResult> {
    try {
      return this.signedIn(await this.call('otp.verifyEmail', { project: true }, { method: 'POST', path: '/v1/auth/otp/verify/email', json: { loginId: input.email, code: input.code } }, JwtResponse, this.once));
    } catch (error) {
      throw portError(error, 'auth/invalid-grant');
    }
  }

  async pendingVerificationCode(): Promise<string> {
    throw new AuthError('auth/not-supported', 'Descope: sign-ins are never held for email verification here; sign in with an email code instead');
  }

  async verifyEmailAndSignIn(): Promise<SignInResult> {
    throw new AuthError('auth/not-supported', 'Descope: sign-ins are never held for email verification here; sign in with an email code instead');
  }
}
