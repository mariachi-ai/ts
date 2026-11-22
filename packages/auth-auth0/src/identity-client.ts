import { randomBytes } from 'node:crypto';
import type {
  AuthorizationUrlInput,
  CodeExchangeInput,
  CreateIdentityUserInput,
  EmailCodeInput,
  EmailDelivery,
  IdentityClient,
  IdentityOAuthProvider,
  IdentityRequestContext,
  IdentityUser,
  PasswordSignInInput,
  SignInResult,
  SignOutInput,
  TokenSet,
  VerifyEmailInput,
} from '@mariachi/auth';
import { AuthError, fromZodError } from '@mariachi/core';
import { type FailureInfo, type ProviderDeps, type ProviderRequest, ProviderError, mappedFailure, providerRequest } from '@mariachi/integrations';
import { decodeJwt } from 'jose';
import { z } from 'zod';
import { auth0Host } from './domain';
import { Auth0Error } from './errors';
import { type Auth0Config, type Auth0Operation, configSchema, errorMap, provider } from './generated';
import { type Auth0User, Auth0User as Auth0UserSchema, Auth0UserList, ManagementToken, TokenResponse } from './schemas';

/** The database connection Auth0 makes in every new tenant. */
export const DEFAULT_DATABASE_CONNECTION = 'Username-Password-Authentication';
/** What sign-in asks for: an ID token with the profile and email, and a refresh token. */
export const DEFAULT_SCOPE = 'openid profile email offline_access';
/** Auth0's default names for the Google and GitHub social connections. */
const DEFAULT_CONNECTIONS: Record<IdentityOAuthProvider, string> = { google: 'google-oauth2', github: 'github' };

export interface Auth0IdentityClientConfig extends Auth0Config {
  /** The connection each of the port's social providers signs in through. Defaults `google-oauth2` and `github`. */
  connections?: Partial<Record<IdentityOAuthProvider, string>>;
  /** The scopes sign-in asks for. Default `openid profile email offline_access`. */
  scope?: string;
}

export interface Auth0Deps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

type Refused = 'auth/invalid-credentials' | 'auth/invalid-grant';
type Api = 'authentication' | 'management';

const Email = z.string().trim().min(1).max(320);
const Context = { ipAddress: z.string().min(1).optional(), userAgent: z.string().optional() };
const PasswordSignIn = z.object({ email: Email, password: z.string().min(1), ...Context });
const Authorization = z.object({
  provider: z.enum(['google', 'github']),
  redirectUri: z.string().url(),
  state: z.string().min(1),
  codeChallenge: z.string().min(1),
  loginHint: z.string().min(1).optional(),
});
const CodeExchange = z.object({ code: z.string().min(1), codeVerifier: z.string().min(1), redirectUri: z.string().url(), ...Context });
const EmailCode = z.object({ email: Email, code: z.string().min(1), ...Context });
const CreateUser = z.object({
  email: Email,
  emailVerified: z.boolean(),
  password: z.string().min(1).optional(),
  name: z.string().min(1).max(300).optional(),
  externalId: z.string().min(1).optional(),
});
const Id = z.string().min(1);
const Password = z.string().min(1);

/**
 * `IdentityClient` on Auth0, server-side with the application's client secret:
 *
 * - **Universal Login**: `authorizationUrl` (the social connection, PKCE S256), `exchangeCode`, `refresh`, and
 *   `signOut` (revokes the refresh token; `auth0LogoutUrl` ends the browser's Auth0 session);
 * - **headless sign-in** on the Authentication API: `signInWithPassword` (the password-realm grant) and
 *   `startEmailCode` / `signInWithEmailCode` (passwordless email codes), when those grants are on;
 * - **users** on the Management API, with a client_credentials token for the Machine to Machine application,
 *   kept until shortly before it expires: `getUser`, `findUserByEmail`, `createUser`, `deleteUser`, `setPassword`;
 * - **emails** Auth0 sends itself: `sendPasswordReset` and `startEmailCode` answer `{ deliveredBy: 'provider' }`.
 *
 * Auth0 resets passwords and verifies addresses on its own pages, from links it emails, so `resetPassword`,
 * `pendingVerificationCode` and `verifyEmailAndSignIn` fail with `auth/not-supported`.
 *
 * Every call goes through `providerRequest`: one span (`auth0 tokens.exchangeCode`), metrics, retries of rate
 * limits. The port's methods carry no context, so the spans have no tenant.
 */
export class Auth0IdentityClient implements IdentityClient {
  readonly provider = provider.id;

  private readonly cfg: Auth0IdentityClientConfig;
  private readonly host: string;
  private readonly managementAudience: string;
  private readonly connection: string;
  private readonly scope: string;
  private readonly connections: Record<IdentityOAuthProvider, string>;
  private readonly now: () => number;
  private managementTokenCache?: { token: string; expiresAt: number };
  private managementTokenLoading?: Promise<string>;

  constructor(
    config: Auth0IdentityClientConfig,
    private readonly deps: Auth0Deps = {},
  ) {
    const parsed = configSchema.safeParse(config);
    if (!parsed.success) {
      throw new AuthError('auth/invalid-config', `Auth0: ${parsed.error.issues.map((i) => `\`${i.path.join('.')}\` ${i.message}`).join('; ')}`);
    }
    if (!parsed.data.clientSecret) throw new AuthError('auth/invalid-config', 'Auth0: `clientSecret` (AUTH0_CLIENT_SECRET) is required to sign in from the backend');
    this.cfg = { ...config, ...parsed.data };
    this.host = auth0Host(parsed.data.domain);
    // The Management API's audience always names the tenant's own domain, even when it's called on a custom one.
    this.managementAudience = `https://${parsed.data.tenantDomain ? auth0Host(parsed.data.tenantDomain, 'tenantDomain') : this.host}/api/v2/`;
    this.connection = parsed.data.databaseConnection ?? DEFAULT_DATABASE_CONNECTION;
    this.scope = config.scope ?? DEFAULT_SCOPE;
    this.connections = { ...DEFAULT_CONNECTIONS, ...config.connections };
    this.now = deps.now ?? Date.now;
  }

  // Sign-in

  async signInWithPassword(input: PasswordSignInInput): Promise<SignInResult> {
    const i = parse(PasswordSignIn, input);
    return this.signIn(
      'tokens.password',
      { grant_type: 'http://auth0.com/oauth/grant-type/password-realm', realm: this.connection, username: i.email, password: i.password },
      'auth/invalid-credentials',
      'the password sign-in',
      i,
    );
  }

  /** Universal Login for the social connection: the browser goes here, and comes back to `redirectUri` with a code. */
  authorizationUrl(input: AuthorizationUrlInput): string {
    const i = parse(Authorization, input);
    const url = new URL(`https://${this.host}/authorize`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.cfg.clientId);
    url.searchParams.set('redirect_uri', i.redirectUri);
    url.searchParams.set('scope', this.scope);
    url.searchParams.set('state', i.state);
    url.searchParams.set('code_challenge', i.codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('connection', this.connections[i.provider]);
    if (this.cfg.audience) url.searchParams.set('audience', this.cfg.audience);
    if (i.loginHint) url.searchParams.set('login_hint', i.loginHint);
    return url.toString();
  }

  async exchangeCode(input: CodeExchangeInput): Promise<SignInResult> {
    const i = parse(CodeExchange, input);
    const res = await this.token(
      'tokens.exchangeCode',
      { grant_type: 'authorization_code', code: i.code, code_verifier: i.codeVerifier, redirect_uri: i.redirectUri },
      'auth/invalid-grant',
      'the code exchange',
    );
    return this.signedIn(res);
  }

  async refresh(refreshToken: string, _context: IdentityRequestContext = {}): Promise<TokenSet> {
    const token = parse(Id, refreshToken);
    const res = await this.token('tokens.refresh', { grant_type: 'refresh_token', refresh_token: token }, 'auth/invalid-grant', 'the refresh');
    // Without rotation Auth0 sends no new refresh token: the one in hand stays good.
    return this.tokenSet(res, token);
  }

  /**
   * Revokes the refresh token. A session id alone does nothing here: Auth0's own session lives in the browser's
   * cookie for the tenant, which `auth0LogoutUrl` ends.
   */
  async signOut(input: SignOutInput): Promise<void> {
    if (!input.refreshToken) return;
    try {
      await this.call('tokens.revoke', { method: 'POST', path: '/oauth/revoke', form: { ...this.client(), token: input.refreshToken } }, z.unknown(), 'authentication');
    } catch (error) {
      throw toAuthError(error, 'auth/invalid-grant', 'the sign-out', 'authentication');
    }
  }

  // Users

  async getUser(id: string): Promise<IdentityUser | null> {
    const userId = parse(Id, id);
    try {
      return toUser(await this.management('users.get', { method: 'GET', path: `/users/${encodeURIComponent(userId)}` }, Auth0UserSchema));
    } catch (error) {
      if (error instanceof ProviderError && error.category === 'not-found') return null;
      throw toAuthError(error, 'auth/invalid-grant', 'the user lookup', 'management');
    }
  }

  /**
   * The user with this address. Auth0 keeps one user per connection, so an address can have several (a password
   * and a Google sign-in, unlinked): the database connection's is preferred, then the first.
   */
  async findUserByEmail(email: string): Promise<IdentityUser | null> {
    const address = parse(Email, email).toLowerCase();
    let users: Auth0User[];
    try {
      // Auth0 stores the addresses of its own users in lower case, and this search is case-sensitive.
      users = await this.management('users.byEmail', { method: 'GET', path: '/users-by-email', query: { email: address } }, Auth0UserList);
    } catch (error) {
      throw toAuthError(error, 'auth/invalid-grant', 'the user lookup', 'management');
    }
    const matching = users.filter((u) => u.email?.toLowerCase() === address);
    const preferred = matching.find((u) => u.identities?.some((identity) => identity.connection === this.connection)) ?? matching[0];
    return preferred ? toUser(preferred) : null;
  }

  /**
   * Creates the user in the database connection. Without a password, it gets a long random one: the user sets their
   * own through `sendPasswordReset`, or signs in another way. `externalId` is kept in `app_metadata.external_id`.
   * With `emailVerified: false`, Auth0 sends its verification email.
   */
  async createUser(input: CreateIdentityUserInput): Promise<IdentityUser> {
    const i = parse(CreateUser, input);
    try {
      const created = await this.management(
        'users.create',
        {
          method: 'POST',
          path: '/users',
          json: {
            connection: this.connection,
            email: i.email,
            email_verified: i.emailVerified,
            password: i.password ?? randomPassword(),
            ...(i.name ? { name: i.name } : {}),
            ...(i.externalId ? { app_metadata: { external_id: i.externalId } } : {}),
          },
        },
        Auth0UserSchema,
      );
      return toUser(created);
    } catch (error) {
      throw toAuthError(error, 'auth/invalid-grant', 'the user creation', 'management');
    }
  }

  async deleteUser(id: string): Promise<void> {
    const userId = parse(Id, id);
    try {
      await this.management('users.delete', { method: 'DELETE', path: `/users/${encodeURIComponent(userId)}` }, z.unknown());
    } catch (error) {
      if (error instanceof ProviderError && error.category === 'not-found') return; // already gone
      throw toAuthError(error, 'auth/invalid-grant', 'the user deletion', 'management');
    }
  }

  async setPassword(userId: string, password: string): Promise<void> {
    const id = parse(Id, userId);
    const value = parse(Password, password);
    try {
      await this.management('users.update', { method: 'PATCH', path: `/users/${encodeURIComponent(id)}`, json: { password: value, connection: this.connection } }, z.unknown());
    } catch (error) {
      throw toAuthError(error, 'auth/invalid-grant', 'the new password', 'management');
    }
  }

  // Emails Auth0 sends

  /**
   * Auth0 emails a reset link for the database connection, to its own reset page. It answers the same whether or
   * not the address has an account, so this is always `{ deliveredBy: 'provider' }`.
   */
  async sendPasswordReset(email: string): Promise<EmailDelivery<{ token: string; url?: string; expiresAt?: number }>> {
    const address = parse(Email, email);
    try {
      await this.call(
        'passwords.requestChange',
        { method: 'POST', path: '/dbconnections/change_password', json: { client_id: this.cfg.clientId, email: address, connection: this.connection } },
        z.unknown(),
        'authentication',
      );
    } catch (error) {
      throw toAuthError(error, 'auth/invalid-grant', 'the password reset', 'authentication');
    }
    return { deliveredBy: 'provider' };
  }

  /** Auth0's reset link opens Auth0's own page, where the new password is set: there's no token to spend here. */
  async resetPassword(_input: { token: string; password: string }): Promise<IdentityUser> {
    throw new AuthError('auth/not-supported', "Auth0 sets the new password on its own reset page, from the link sendPasswordReset emails; use setPassword for an admin's change");
  }

  /** Auth0 emails a one-time code from the tenant's `email` passwordless connection. */
  async startEmailCode(email: string, _context: IdentityRequestContext = {}): Promise<EmailDelivery<{ code: string; expiresAt?: number }>> {
    const address = parse(Email, email);
    try {
      await this.call(
        'passwordless.start',
        { method: 'POST', path: '/passwordless/start', json: { ...this.client(), connection: 'email', email: address, send: 'code' } },
        z.unknown(),
        'authentication',
      );
    } catch (error) {
      throw toAuthError(error, 'auth/invalid-grant', 'the email code', 'authentication');
    }
    return { deliveredBy: 'provider' };
  }

  async signInWithEmailCode(input: EmailCodeInput): Promise<SignInResult> {
    const i = parse(EmailCode, input);
    return this.signIn(
      'tokens.emailCode',
      { grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp', realm: 'email', username: i.email, otp: i.code },
      'auth/invalid-grant',
      'the email code sign-in',
      i,
    );
  }

  async pendingVerificationCode(_pending: Extract<SignInResult, { status: 'pending' }>): Promise<string> {
    throw new AuthError('auth/not-supported', 'Auth0 verifies email addresses with a link it emails, not a code');
  }

  async verifyEmailAndSignIn(_input: VerifyEmailInput): Promise<SignInResult> {
    throw new AuthError('auth/not-supported', 'Auth0 verifies email addresses with a link it emails, not a code');
  }

  // Calls

  private client(): { client_id: string; client_secret: string } {
    return { client_id: this.cfg.clientId, client_secret: this.cfg.clientSecret as string };
  }

  private call<T>(
    operation: Auth0Operation,
    request: Omit<ProviderRequest, 'url'> & { path: string },
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
    api: Api,
    failure: (status: number, body: unknown) => FailureInfo | undefined = api === 'authentication' ? oauthFailure : () => undefined,
  ): Promise<T> {
    const { path, ...rest } = request;
    return providerRequest(
      null,
      { integration: provider.id, operation, category: provider.category, server: this.host },
      { ...rest, url: `https://${this.host}${path}` },
      { schema, error: Auth0Error, failure, deps: this.deps },
    );
  }

  /** `/oauth/token` with the application's credentials. `ip` goes in `auth0-forwarded-for` for Auth0's attack protection. */
  private async token(operation: Auth0Operation, form: Record<string, string>, refused: Refused, what: string, ip?: string, failure?: (status: number, body: unknown) => FailureInfo | undefined): Promise<TokenResponse> {
    try {
      return await this.call(
        operation,
        { method: 'POST', path: '/oauth/token', form: { ...this.client(), ...form }, ...(ip ? { headers: { 'auth0-forwarded-for': ip } } : {}) },
        TokenResponse,
        'authentication',
        failure,
      );
    } catch (error) {
      throw toAuthError(error, refused, what, 'authentication');
    }
  }

  /** A sign-in grant: tokens, or held at `mfa` with Auth0's `mfa_token` to finish it with its MFA API. */
  private async signIn(operation: Auth0Operation, grant: Record<string, string>, refused: Refused, what: string, who: { email: string; ipAddress?: string }): Promise<SignInResult> {
    let mfaToken: string | undefined;
    const failure = (status: number, body: unknown) => {
      const b = body as { error?: unknown; mfa_token?: unknown } | null;
      if (b?.error === 'mfa_required' && typeof b.mfa_token === 'string') mfaToken = b.mfa_token;
      return oauthFailure(status, body);
    };
    const form: Record<string, string> = { ...grant, scope: this.scope, ...(this.cfg.audience ? { audience: this.cfg.audience } : {}) };
    try {
      return this.signedIn(await this.token(operation, form, refused, what, who.ipAddress, failure));
    } catch (error) {
      if (mfaToken !== undefined) return { status: 'pending', reason: 'mfa', pendingToken: mfaToken, email: who.email };
      throw error;
    }
  }

  private signedIn(res: TokenResponse): SignInResult {
    return { status: 'signed-in', user: userFromIdToken(res.id_token), tokens: this.tokenSet(res) };
  }

  private tokenSet(res: TokenResponse, refreshToken?: string): TokenSet {
    const session = res.id_token ? idTokenClaims(res.id_token).sid : undefined;
    return {
      accessToken: res.access_token,
      // Only with `offline_access`, and an API that allows it ("Allow Offline Access"); empty otherwise.
      refreshToken: res.refresh_token ?? refreshToken ?? '',
      ...(typeof session === 'string' && session ? { sessionId: session } : {}),
      ...(typeof res.expires_in === 'number' ? { expiresAt: this.now() + res.expires_in * 1000 } : {}),
    };
  }

  /** The Management API token for the Machine to Machine application, fetched once and kept until near its expiry. */
  private async managementToken(): Promise<string> {
    const { m2mClientId, m2mClientSecret } = this.cfg;
    if (!m2mClientId || !m2mClientSecret) {
      throw new AuthError('auth/invalid-config', 'Auth0: user management needs a Machine to Machine application: set AUTH0_M2M_CLIENT_ID and AUTH0_M2M_CLIENT_SECRET');
    }
    const cached = this.managementTokenCache;
    if (cached && cached.expiresAt > this.now()) return cached.token;
    this.managementTokenLoading ??= this.call(
      'tokens.clientCredentials',
      { method: 'POST', path: '/oauth/token', form: { grant_type: 'client_credentials', client_id: m2mClientId, client_secret: m2mClientSecret, audience: this.managementAudience } },
      ManagementToken,
      'authentication',
    )
      .then((t) => {
        const lifetime = t.expires_in * 1000;
        // Renewed a little early (a tenth of its life, at most five minutes), so no call goes out with a token about to lapse.
        this.managementTokenCache = { token: t.access_token, expiresAt: this.now() + lifetime - Math.min(300_000, lifetime / 10) };
        return t.access_token;
      })
      .catch((error: unknown) => {
        throw toAuthError(error, 'auth/invalid-grant', 'the Management API token', 'management');
      })
      .finally(() => {
        this.managementTokenLoading = undefined;
      });
    return this.managementTokenLoading;
  }

  private async management<T>(operation: Auth0Operation, request: Omit<ProviderRequest, 'url' | 'headers'> & { path: string }, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
    const token = await this.managementToken();
    try {
      return await this.call(operation, { ...request, path: `/api/v2${request.path}`, headers: { authorization: `Bearer ${token}` } }, schema, 'management');
    } catch (error) {
      // A revoked or rotated token: fetch a new one next time.
      if (error instanceof ProviderError && error.status === 401) this.managementTokenCache = undefined;
      throw error;
    }
  }
}

/** The Authentication API's error body is `{ error, error_description }`: the code is kept, the description isn't. */
function oauthFailure(_status: number, body: unknown): FailureInfo | undefined {
  const raw = (body as { error?: unknown } | null)?.error;
  const code = typeof raw === 'string' && /^[a-z][a-z0-9_]*$/.test(raw) ? raw : undefined;
  const mapped = mappedFailure(errorMap, code);
  return { providerCode: code, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

/** A failed call as the auth port's `AuthError`, with the status and Auth0's code but never its message. */
function toAuthError(error: unknown, refused: Refused, what: string, api: Api): AuthError {
  if (error instanceof AuthError) return error;
  if (!(error instanceof ProviderError)) return new AuthError('auth/identity-provider', `Auth0 ${what} failed`);
  const { status, providerCode, category } = error;
  const meta = { status, providerCode, category };
  const detail = `${status ?? 'no answer'}${providerCode ? `, ${providerCode}` : ''}`;
  if (category === 'rate-limited') return new AuthError('auth/rate-limited', 'Auth0 rate limit reached', meta);
  if (api === 'management' && (status === 401 || status === 403)) {
    return new AuthError('auth/identity-provider', `Auth0's Management API refused the Machine to Machine application for ${what} (${detail}): authorize it for the Management API with the scopes the call needs`, meta);
  }
  if (providerCode === 'invalid_client') {
    return new AuthError('auth/identity-provider', `Auth0 refused the application's credentials for ${what}: check AUTH0_CLIENT_ID and AUTH0_CLIENT_SECRET`, meta);
  }
  if (status !== undefined && status >= 400 && status < 500) return new AuthError(refused, `Auth0 refused ${what} (${detail})`, meta);
  return new AuthError('auth/identity-provider', `Auth0 ${what} failed (${detail})`, meta);
}

function idTokenClaims(idToken: string): Record<string, unknown> {
  try {
    return decodeJwt(idToken);
  } catch {
    throw new AuthError('auth/identity-provider', 'Auth0 returned an ID token that is not a JWT');
  }
}

/**
 * The user named by the ID token Auth0 just returned to this backend over TLS. Read, not verified: OpenID Connect
 * lets a client trust a token it got straight from the token endpoint (Core 1.0, 3.1.3.7), and
 * `Auth0AuthProvider.verify` checks every token a client sends.
 */
function userFromIdToken(idToken: string | undefined): IdentityUser {
  if (!idToken) throw new AuthError('auth/identity-provider', 'Auth0 returned no ID token: sign-in must ask for the openid scope');
  const c = idTokenClaims(idToken);
  if (typeof c.sub !== 'string' || !c.sub) throw new AuthError('auth/identity-provider', 'Auth0 returned an ID token with no subject');
  if (typeof c.email !== 'string') throw new AuthError('auth/identity-provider', 'Auth0 returned an ID token with no email: sign-in must ask for the email scope');
  return {
    id: c.sub,
    email: c.email,
    emailVerified: c.email_verified === true,
    name: typeof c.name === 'string' && c.name ? c.name : null,
    avatarUrl: typeof c.picture === 'string' && c.picture ? c.picture : null,
    externalId: null,
  };
}

/** A Management API user as the port's `IdentityUser`. */
export function toUser(u: Auth0User): IdentityUser {
  const external = u.app_metadata?.external_id;
  return {
    id: u.user_id,
    email: u.email ?? '',
    emailVerified: u.email_verified === true,
    name: u.name || null,
    avatarUrl: u.picture || null,
    externalId: typeof external === 'string' && external ? external : null,
  };
}

/** 48 random characters with every class Auth0's password policies ask for, and no character three times in a row. */
function randomPassword(): string {
  for (;;) {
    const value = `${randomBytes(33).toString('base64url')}aZ7!`;
    if (!/(.)\1\1/.test(value)) return value;
  }
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Auth0 input');
  return parsed.data;
}
