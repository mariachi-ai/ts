import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';
import { decodeJwt } from 'jose';
import { AuthError } from '@mariachi/core';
import { ProviderError, callProvider, categoryForStatus, parseRetryAfter } from '@mariachi/integrations';
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
import { type FusionauthOperation, provider } from './generated';
import type { FusionAuthDeps } from './provider-fetch';

export interface FusionAuthIdentityClientConfig {
  /** FusionAuth's base URL (e.g. `https://auth.example.com`). */
  serverUrl: string;
  /** An API key with the user, login, registration and JWT APIs. Server-side only. */
  apiKey: string;
  /** The application: its id (for logins and registrations) and OAuth client. */
  applicationId: string;
  clientId: string;
  clientSecret: string;
  /** The tenant to create users in, when the API key isn't scoped to one. */
  tenantId?: string;
  /** Identity provider ids for `idp_hint`, so social sign-in skips FusionAuth's own page. */
  identityProviderIds?: Partial<Record<'google' | 'github', string>>;
  /** OAuth scopes. Default `openid email profile offline_access`. */
  scope?: string;
  /**
   * Who sends password-reset and email-verification messages: `provider` (the default: FusionAuth
   * sends them with its tenant's templates) or `app` (FusionAuth sends nothing, and the app emails
   * the reset token and verification code these calls return). Passwordless codes are always the app's.
   */
  emailsSentBy?: 'app' | 'provider';
  /** `fetch`, for tests. */
  fetch?: typeof fetch;
}

/** A FusionAuth user as its APIs return it (the fields this client reads). */
export interface FusionAuthUser {
  id: string;
  email?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  verified?: boolean;
  data?: Record<string, unknown>;
  identities?: Array<{ type?: string; value?: string; verified?: boolean; verifiedReason?: string }>;
}

/**
 * Whether FusionAuth vouches for a user's email: its email identity is verified (`Completed`, or by
 * an identity provider), or verification was **skipped by whoever created the user through the
 * admin API** (`verifiedReason: "Skipped"`; only an API-key holder can do that). Never a
 * self-registered address: FusionAuth ≥ 1.59 gives it `verified: false` (`Disabled` or `Pending`)
 * while the legacy `user.verified` says true for everyone when email verification is off. Without
 * identities (an older FusionAuth), the legacy flag.
 */
export function fusionAuthEmailVouched(user: FusionAuthUser): boolean {
  const identities = user.identities;
  if (!Array.isArray(identities)) return user.verified === true;
  const identity = identities.find((i) => i.type === 'email' && i.value?.toLowerCase() === user.email?.toLowerCase());
  return identity?.verified === true || identity?.verifiedReason === 'Skipped';
}

function toUser(u: FusionAuthUser): IdentityUser {
  const name = u.fullName || [u.firstName, u.lastName].filter(Boolean).join(' ') || null;
  const externalId = typeof u.data?.externalId === 'string' ? u.data.externalId : null;
  return { id: u.id, email: u.email ?? '', emailVerified: fusionAuthEmailVouched(u), name, avatarUrl: u.imageUrl ?? null, externalId };
}

/** The session (`sid`, FusionAuth's refresh token id) and expiry from an access token FusionAuth just returned. */
function session(accessToken: string): Pick<TokenSet, 'sessionId' | 'expiresAt'> {
  try {
    const claims = decodeJwt(accessToken);
    return {
      sessionId: typeof claims.sid === 'string' ? claims.sid : undefined,
      expiresAt: typeof claims.exp === 'number' ? claims.exp * 1000 : undefined,
    };
  } catch {
    return {};
  }
}

/** FusionAuth's Errors body (`fieldErrors`, `generalErrors`) as its codes and one readable line. */
function fusionAuthErrors(body: Record<string, any>): { codes: string[]; message: string } {
  const list: Array<{ code?: unknown; message?: unknown }> = [
    ...(Array.isArray(body.generalErrors) ? body.generalErrors : []),
    ...Object.values(body.fieldErrors && typeof body.fieldErrors === 'object' ? body.fieldErrors : {}).flatMap((v) => (Array.isArray(v) ? v : [])),
  ];
  return {
    codes: list.map((e) => String(e.code ?? '')).filter(Boolean),
    message: list.map((e) => (typeof e.message === 'string' ? e.message : '')).filter(Boolean).join(' '),
  };
}

/** The first of FusionAuth's error codes (`[blank]loginId`, `[TrustTokenRequired]`), for the span. Never its message. */
function providerCode(body: Record<string, any>): string | undefined {
  return fusionAuthErrors(body).codes.find((code) => /^\[[A-Za-z]+\][A-Za-z.]*$/.test(code));
}

/**
 * What a sign-in held at `email-verification` carries in its `pendingToken`: FusionAuth's
 * verification id, the user, and (when the app sends the email) the one-time code. Sealed, so a
 * browser holding the token can neither read the code nor point the verification at another user.
 */
interface HeldVerification {
  /** FusionAuth's `verificationId`. */
  v: string;
  /** The user's id and email. */
  u: string;
  e: string;
  /** The `oneTimeCode` for `v`, when the app emails it. */
  c?: string;
}

const SEALED_PREFIX = 'fa1.';

/**
 * The longest wait between attempts of an identity-client call: they hold a user's request (a sign-in) open, so a
 * provider asking for a longer wait (`Retry-After`) fails at once as `auth/rate-limited`. `deps.retry.maxDelayMs`
 * overrides it.
 */
const SIGN_IN_MAX_DELAY_MS = 2_000;

/**
 * `IdentityClient` on FusionAuth's APIs: the Login API for password sign-in, OAuth for social
 * sign-in and refresh, and the User API for lookups. Matches what an app did by hand against
 * FusionAuth, so it can move onto `IdentityClient` before switching providers.
 *
 * Every call goes through `callProvider`: one CLIENT span (`fusionauth users.login`, `fusionauth users.get`),
 * metrics, and retries of rate limits and outages (a POST or PATCH only of a rate limit, since FusionAuth
 * takes no idempotency key). The port's methods carry no context, so the spans have no tenant.
 */
export class FusionAuthIdentityClient implements IdentityClient {
  readonly provider = 'fusionauth';

  private readonly base: string;
  private readonly host: string;
  private readonly http: typeof fetch;
  private readonly sealKey: Buffer;

  constructor(
    private readonly config: FusionAuthIdentityClientConfig,
    /** The tracer and metrics for the calls, from the container. Without them, spans go through `@opentelemetry/api` when it's installed. */
    private readonly deps: FusionAuthDeps = {},
  ) {
    for (const k of ['serverUrl', 'apiKey', 'applicationId', 'clientId', 'clientSecret'] as const) {
      if (!config[k]) throw new AuthError('auth/invalid-config', `FusionAuth: \`${k}\` is required`);
    }
    this.base = config.serverUrl.replace(/\/+$/, '');
    this.host = hostname(this.base);
    this.http = deps.fetch ?? config.fetch ?? fetch;
    // Seals held verifications' pending tokens; a new client secret voids the ones outstanding.
    this.sealKey = Buffer.from(hkdfSync('sha256', config.clientSecret, 'mariachi/auth-fusionauth', 'held email verification', 32));
  }

  private get appSendsEmails(): boolean {
    return this.config.emailsSentBy === 'app';
  }

  private seal(held: HeldVerification): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.sealKey, iv);
    const data = Buffer.concat([cipher.update(JSON.stringify(held), 'utf8'), cipher.final(), cipher.getAuthTag()]);
    return `${SEALED_PREFIX}${iv.toString('base64url')}.${data.toString('base64url')}`;
  }

  private unseal(token: string): HeldVerification | null {
    if (!token.startsWith(SEALED_PREFIX)) return null;
    const [ivPart, dataPart] = token.slice(SEALED_PREFIX.length).split('.');
    if (!ivPart || !dataPart) return null;
    try {
      const iv = Buffer.from(ivPart, 'base64url');
      const data = Buffer.from(dataPart, 'base64url');
      if (iv.length !== 12 || data.length <= 16) return null;
      const decipher = createDecipheriv('aes-256-gcm', this.sealKey, iv);
      decipher.setAuthTag(data.subarray(-16));
      const held = JSON.parse(Buffer.concat([decipher.update(data.subarray(0, -16)), decipher.final()]).toString('utf8'));
      if (typeof held?.v !== 'string' || typeof held.u !== 'string' || typeof held.e !== 'string') return null;
      return held as HeldVerification;
    } catch {
      return null; // tampered with, or sealed with another client secret
    }
  }

  /**
   * One call, through `callProvider`. FusionAuth's answer comes back whatever its status, as before: the callers
   * read 212, 404 and the rest themselves. A status that isn't 2xx still fails the span, with its category.
   */
  private async call(
    operation: FusionauthOperation,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    opts: { json?: unknown; form?: Record<string, string>; ip?: string } = {},
  ): Promise<{ status: number; body: Record<string, any> }> {
    const headers: Record<string, string> = {};
    let body: string | undefined;
    if (opts.form) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      body = new URLSearchParams(opts.form).toString();
    } else {
      headers.Authorization = this.config.apiKey;
      if (this.config.tenantId) headers['X-FusionAuth-TenantId'] = this.config.tenantId;
      if (opts.json !== undefined) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(opts.json);
      }
    }
    if (opts.ip) headers['X-Forwarded-For'] = opts.ip;
    let answer: { status: number; body: Record<string, any> } | undefined;
    try {
      return await callProvider(
        null,
        { integration: provider.id, operation, category: provider.category, server: this.host, method },
        async (attempt) => {
          answer = undefined;
          const res = await this.http(`${this.base}${path}`, { method, headers, body });
          attempt.setStatusCode(res.status);
          answer = { status: res.status, body: await readBody(res) };
          if (!res.ok) {
            const category = categoryForStatus(res.status);
            throw new ProviderError(`${provider.id}/${category}`, `FusionAuth ${operation} answered ${res.status}`, {
              category,
              status: res.status,
              providerCode: providerCode(answer.body),
              retryAfterMs: parseRetryAfter(res.headers.get('retry-after')),
            });
          }
          return answer;
        },
        // FusionAuth takes no idempotency key: a POST or PATCH is retried only when it was rate limited. These calls
        // hold a user's request open, so a wait longer than SIGN_IN_MAX_DELAY_MS fails at once (auth/rate-limited)
        { ...this.deps, retry: { unsafe: method === 'POST' || method === 'PATCH', maxDelayMs: SIGN_IN_MAX_DELAY_MS, ...this.deps.retry } },
      );
    } catch (error) {
      if (error instanceof ProviderError && answer) return answer;
      throw new AuthError('auth/identity-provider', `FusionAuth request failed: ${(error as Error).message}`, error instanceof ProviderError ? { category: error.category } : undefined);
    }
  }

  private fail(status: number, what: string, refused: 'auth/invalid-credentials' | 'auth/invalid-grant'): AuthError {
    const meta = { status, ...(status >= 400 ? { category: categoryForStatus(status) } : {}) };
    if (status === 429) return new AuthError('auth/rate-limited', 'FusionAuth rate limit reached', meta);
    if (status >= 400 && status < 500) return new AuthError(refused, `FusionAuth refused ${what} (${status})`, meta);
    return new AuthError('auth/identity-provider', `FusionAuth ${what} failed (${status})`, meta);
  }

  async signInWithPassword(input: PasswordSignInInput): Promise<SignInResult> {
    const { status, body } = await this.call('users.login', 'POST', '/api/login', {
      json: { loginId: input.email, password: input.password, applicationId: this.config.applicationId, ipAddress: input.ipAddress },
      ip: input.ipAddress,
    });
    return this.loginResult(status, body, input.email, 'the login');
  }

  /** The Login API's answer (password or passwordless) as a SignInResult. */
  private async loginResult(status: number, body: Record<string, any>, email: string, what: string): Promise<SignInResult> {
    // 200: signed in; 202: signed in but not registered for the application (no app roles).
    if ((status === 200 || status === 202) && typeof body.token === 'string' && body.user) {
      return {
        status: 'signed-in',
        user: toUser(body.user),
        tokens: { accessToken: body.token, refreshToken: body.refreshToken ?? '', ...session(body.token) },
      };
    }
    if (status === 212) return this.heldForVerification(body, email);
    if (status === 213) {
      return { status: 'pending', reason: 'email-verification', email: body.user?.email ?? email, ...(body.user ? { user: toUser(body.user) } : {}) };
    }
    if (status === 242) return { status: 'pending', reason: 'mfa', pendingToken: body.twoFactorId };
    // 404: no such user or a wrong password; 409: locked; 410: expired; 423: breached password.
    if ([404, 409, 410, 423].includes(status)) {
      throw new AuthError('auth/invalid-credentials', 'Invalid email or password', { status });
    }
    throw this.fail(status, what, 'auth/invalid-credentials');
  }

  /**
   * A sign-in FusionAuth answered with 212 (the email isn't verified). With the tenant's `FormField`
   * verification strategy, the reply names the user's current verification (`emailVerificationId`):
   * FusionAuth emailed its code, so that verification is the one to finish. When the app sends the
   * email instead, a new verification is started without FusionAuth's email (which ends the old
   * one) and its code kept, sealed, in the pending token for `pendingVerificationCode`. Without
   * `FormField` there is no code to enter: FusionAuth verifies through its own link.
   */
  private async heldForVerification(body: Record<string, any>, email: string): Promise<SignInResult> {
    const address: string = body.user?.email ?? email;
    const pending: Extract<SignInResult, { status: 'pending' }> = { status: 'pending', reason: 'email-verification', email: address, ...(body.user ? { user: toUser(body.user) } : {}) };
    const current = body.emailVerificationId ?? body.identityVerificationId;
    if (typeof current !== 'string' || typeof body.user?.id !== 'string') return pending;
    let held: HeldVerification = { v: current, u: body.user.id, e: address };
    if (this.appSendsEmails) {
      const query = new URLSearchParams({ email: address, applicationId: this.config.applicationId, sendVerifyEmail: 'false' });
      const res = await this.call('emailVerification.start', 'PUT', `/api/user/verify-email?${query}`);
      if (res.status !== 200 || typeof res.body.verificationId !== 'string') throw this.fail(res.status, 'the email verification start', 'auth/invalid-grant');
      // The docs name the code `verificationOneTimeCode`; FusionAuth (1.71) replies with `oneTimeCode`.
      const code = res.body.oneTimeCode ?? res.body.verificationOneTimeCode;
      held = { v: res.body.verificationId, u: body.user.id, e: address, ...(typeof code === 'string' ? { c: code } : {}) };
    }
    return { ...pending, pendingToken: this.seal(held) };
  }

  authorizationUrl(input: AuthorizationUrlInput): string {
    const url = new URL('/oauth2/authorize', this.base);
    url.searchParams.set('client_id', this.config.clientId);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('redirect_uri', input.redirectUri);
    url.searchParams.set('scope', this.config.scope ?? 'openid email profile offline_access');
    url.searchParams.set('state', input.state);
    url.searchParams.set('code_challenge', input.codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    const idp = this.config.identityProviderIds?.[input.provider];
    if (idp) url.searchParams.set('idp_hint', idp);
    if (input.loginHint) url.searchParams.set('login_hint', input.loginHint);
    return url.toString();
  }

  private async token(operation: 'tokens.exchangeCode' | 'tokens.refresh', form: Record<string, string>, what: string, ip?: string): Promise<Record<string, any>> {
    const { status, body } = await this.call(operation, 'POST', '/oauth2/token', {
      form: { client_id: this.config.clientId, client_secret: this.config.clientSecret, ...form },
      ip,
    });
    if (status !== 200 || typeof body.access_token !== 'string') throw this.fail(status, what, 'auth/invalid-grant');
    return body;
  }

  async exchangeCode(input: CodeExchangeInput): Promise<SignInResult> {
    const body = await this.token(
      'tokens.exchangeCode',
      { grant_type: 'authorization_code', code: input.code, code_verifier: input.codeVerifier, redirect_uri: input.redirectUri },
      'the code exchange',
      input.ipAddress,
    );
    const userId = typeof body.userId === 'string' ? body.userId : (decodeJwt(body.access_token).sub as string);
    const user = await this.getUser(userId);
    if (!user) throw new AuthError('auth/identity-provider', 'FusionAuth returned tokens for a user it then could not find');
    return {
      status: 'signed-in',
      user,
      tokens: { accessToken: body.access_token, refreshToken: body.refresh_token ?? '', ...session(body.access_token) },
    };
  }

  async refresh(refreshToken: string, context: IdentityRequestContext = {}): Promise<TokenSet> {
    const body = await this.token('tokens.refresh', { grant_type: 'refresh_token', refresh_token: refreshToken }, 'the refresh', context.ipAddress);
    return { accessToken: body.access_token, refreshToken: body.refresh_token ?? refreshToken, ...session(body.access_token) };
  }

  async signOut(input: SignOutInput): Promise<void> {
    const path = input.refreshToken
      ? `/api/jwt/refresh?token=${encodeURIComponent(input.refreshToken)}`
      : input.sessionId
        ? `/api/jwt/refresh/${encodeURIComponent(input.sessionId)}`
        : null;
    if (!path) return;
    const { status } = await this.call('tokens.revoke', 'DELETE', path);
    // 404: already revoked or expired; signed out all the same.
    if (status !== 200 && status !== 404) throw this.fail(status, 'the refresh token revoke', 'auth/invalid-grant');
  }

  async getUser(id: string): Promise<IdentityUser | null> {
    const { status, body } = await this.call('users.get', 'GET', `/api/user/${encodeURIComponent(id)}`);
    if (status === 404) return null;
    if (status !== 200 || !body.user) throw this.fail(status, 'the user lookup', 'auth/invalid-grant');
    return toUser(body.user);
  }

  async findUserByEmail(email: string): Promise<IdentityUser | null> {
    const { status, body } = await this.call('users.byEmail', 'GET', `/api/user?email=${encodeURIComponent(email)}`);
    if (status === 404) return null;
    if (status !== 200 || !body.user) throw this.fail(status, 'the user lookup', 'auth/invalid-grant');
    return toUser(body.user);
  }

  async createUser(input: CreateIdentityUserInput): Promise<IdentityUser> {
    const { status, body } = await this.call('users.create', 'POST', '/api/user/registration', {
      json: {
        user: {
          email: input.email,
          // FusionAuth requires a password; a user without one signs in through a provider or a reset.
          password: input.password ?? randomBytes(32).toString('base64url'),
          ...(input.name ? { fullName: input.name } : {}),
          ...(input.externalId ? { data: { externalId: input.externalId } } : {}),
        },
        registration: { applicationId: this.config.applicationId },
        skipVerification: input.emailVerified,
        sendSetPasswordEmail: false,
      },
    });
    if (status !== 200 || !body.user) throw this.fail(status, 'the user creation', 'auth/invalid-grant');
    return toUser(body.user);
  }

  async deleteUser(id: string): Promise<void> {
    const { status } = await this.call('users.delete', 'DELETE', `/api/user/${encodeURIComponent(id)}?hardDelete=true`);
    if (status !== 200 && status !== 404) throw this.fail(status, 'the user deletion', 'auth/invalid-grant');
  }

  /**
   * The Forgot Password API. FusionAuth emails the link (its tenant's template, which can point at
   * the app's own page with `${changePasswordId}`), or, with `emailsSentBy: 'app'`, returns the
   * `changePasswordId` for the app to send. Either way that id is the token for `resetPassword`.
   */
  async sendPasswordReset(email: string): Promise<EmailDelivery<{ token: string; url?: string; expiresAt?: number }>> {
    const app = this.appSendsEmails;
    const { status, body } = await this.call('passwords.forgot', 'POST', '/api/user/forgot-password', {
      json: { loginId: email, applicationId: this.config.applicationId, sendForgotPasswordEmail: !app },
    });
    if (status === 404) return { deliveredBy: 'nobody' }; // answered as for an account
    if (status === 403) {
      throw new AuthError('auth/not-supported', "FusionAuth's tenant has no forgot-password email template", { status });
    }
    if (status !== 200) throw this.fail(status, 'the password reset', 'auth/invalid-grant');
    if (!app) return { deliveredBy: 'provider' };
    if (typeof body.changePasswordId !== 'string') throw new AuthError('auth/identity-provider', 'FusionAuth started a password reset without a changePasswordId');
    return { deliveredBy: 'app', token: body.changePasswordId };
  }

  /**
   * The Change Password API with the `changePasswordId` (FusionAuth ≥ 1.33, in the body). Its reply
   * doesn't say whose password it was, only a one-time password for the Login API; that login,
   * with `noJWT`, names the user without issuing tokens (FusionAuth records it as a login).
   */
  async resetPassword(input: { token: string; password: string }): Promise<IdentityUser> {
    const changed = await this.call('passwords.change', 'POST', '/api/user/change-password', { json: { changePasswordId: input.token, password: input.password } });
    if (changed.status === 404) throw new AuthError('auth/invalid-grant', 'FusionAuth refused the reset: the token is used, expired or unknown', { status: 404 });
    if (changed.status === 400) {
      const { codes, message } = fusionAuthErrors(changed.body);
      if (codes.includes('[TrustTokenRequired]')) {
        throw new AuthError('auth/not-supported', 'FusionAuth wants a two-factor trust token to reset this password', { status: 400, errors: codes });
      }
      // e.g. `[tooShort]password`: the tenant's password rules.
      throw new AuthError('auth/invalid-grant', `FusionAuth refused the new password${message ? `: ${message}` : ''}`, { status: 400, errors: codes });
    }
    if (changed.status !== 200 || typeof changed.body.oneTimePassword !== 'string') throw this.fail(changed.status, 'the password reset', 'auth/invalid-grant');

    const { status, body } = await this.call('users.login', 'POST', '/api/login', {
      json: { oneTimePassword: changed.body.oneTimePassword, applicationId: this.config.applicationId, noJWT: true },
    });
    if (status === 429) throw this.fail(status, 'the login after the reset', 'auth/invalid-grant');
    if (status >= 200 && status < 300 && body.user) return toUser(body.user);
    throw new AuthError('auth/identity-provider', `FusionAuth reset the password but did not say whose (${status})`, { status });
  }

  async setPassword(userId: string, password: string): Promise<void> {
    const { status } = await this.call('users.update', 'PATCH', `/api/user/${encodeURIComponent(userId)}`, { json: { user: { password } } });
    if (status !== 200) throw this.fail(status, 'the password change', 'auth/invalid-grant');
  }

  /** FusionAuth's passwordless API: the app sends the code. */
  async startEmailCode(email: string): Promise<EmailDelivery<{ code: string; expiresAt?: number }>> {
    const { status, body } = await this.call('passwordless.start', 'POST', '/api/passwordless/start', { json: { loginId: email, applicationId: this.config.applicationId } });
    if (status === 404) return { deliveredBy: 'nobody' };
    if (status !== 200 || typeof body.code !== 'string') throw this.fail(status, 'the passwordless start', 'auth/invalid-grant');
    return { deliveredBy: 'app', code: body.code };
  }

  async signInWithEmailCode(input: EmailCodeInput): Promise<SignInResult> {
    const { status, body } = await this.call('passwordless.login', 'POST', '/api/passwordless/login', { json: { code: input.code, ipAddress: input.ipAddress }, ip: input.ipAddress });
    if (status === 404) throw new AuthError('auth/invalid-grant', 'The code is wrong or expired', { status });
    return this.loginResult(status, body, input.email, 'the passwordless login');
  }

  private heldFrom(pendingToken: string | undefined): HeldVerification {
    const held = pendingToken ? this.unseal(pendingToken) : null;
    if (!held) throw new AuthError('auth/invalid-grant', 'The pending token is not one this FusionAuth client issued');
    return held;
  }

  /** The code sealed into the pending token at sign-in, when the app sends the verification email. */
  async pendingVerificationCode(pending: Extract<SignInResult, { status: 'pending' }>): Promise<string> {
    if (pending.reason !== 'email-verification' || !pending.pendingToken) {
      throw new AuthError('auth/not-supported', "No email verification with a code is pending for this sign-in (FusionAuth's tenant needs the FormField verification strategy)");
    }
    const held = this.heldFrom(pending.pendingToken);
    if (!held.c) {
      throw new AuthError('auth/not-supported', "FusionAuth emails this code itself; set `emailsSentBy: 'app'` to send it from the app");
    }
    return held.c;
  }

  /**
   * The Verify Email API with the verification id and code, then a sign-in. FusionAuth has no held
   * sign-in to resume, so the tokens come from its passwordless API (started with the API key, for
   * the user the pending token names): the application needs passwordless login enabled.
   */
  async verifyEmailAndSignIn(input: VerifyEmailInput): Promise<SignInResult> {
    const held = this.heldFrom(input.pendingToken);
    const verified = await this.call('emailVerification.verify', 'POST', '/api/user/verify-email', { json: { verificationId: held.v, oneTimeCode: input.code }, ip: input.ipAddress });
    // 400: a wrong code (`[invalid]verificationId`) or none; 404: used, replaced or expired.
    if (verified.status === 400 || verified.status === 404) {
      throw new AuthError('auth/invalid-grant', 'The code is wrong or expired', { status: verified.status, errors: fusionAuthErrors(verified.body).codes });
    }
    if (verified.status === 403) throw new AuthError('auth/not-supported', "Email verification is off for FusionAuth's tenant", { status: 403 });
    if (verified.status !== 200) throw this.fail(verified.status, 'the email verification', 'auth/invalid-grant');

    const start = await this.call('passwordless.start', 'POST', '/api/passwordless/start', { json: { loginId: held.e, applicationId: this.config.applicationId } });
    if (start.status === 400 && fusionAuthErrors(start.body).codes.includes('[disabled]applicationId')) {
      throw new AuthError('auth/not-supported', "The email is verified, but signing in after it needs passwordless login enabled on FusionAuth's application", { status: 400 });
    }
    if (start.status === 404) throw new AuthError('auth/invalid-grant', 'The email is verified, but its user is gone', { status: 404 });
    if (start.status !== 200 || typeof start.body.code !== 'string') throw this.fail(start.status, 'the sign-in after verification', 'auth/invalid-grant');

    const { status, body } = await this.call('passwordless.login', 'POST', '/api/passwordless/login', { json: { code: start.body.code, ipAddress: input.ipAddress }, ip: input.ipAddress });
    const result = await this.loginResult(status, body, held.e, 'the sign-in after verification');
    if (result.status === 'signed-in' && result.user.id !== held.u) {
      throw new AuthError('auth/identity-provider', 'FusionAuth signed in another user than the one it verified');
    }
    return result;
  }
}

/** FusionAuth's answer as JSON, `{ text }` when it isn't, `{}` when empty. */
async function readBody(res: Response): Promise<Record<string, any>> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}

/** The host the spans name. A `serverUrl` that isn't a URL fails on its first call, as it always has. */
function hostname(base: string): string {
  try {
    return new URL(base).hostname;
  } catch {
    return 'fusionauth';
  }
}
