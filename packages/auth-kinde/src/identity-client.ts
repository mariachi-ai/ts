import { decodeJwt } from 'jose';
import { AuthError } from '@mariachi/core';
import type {
  AuthorizationUrlInput,
  CodeExchangeInput,
  CreateIdentityUserInput,
  EmailDelivery,
  IdentityClient,
  IdentityOAuthProvider,
  IdentityUser,
  SignInResult,
  SignOutInput,
  TokenSet,
} from '@mariachi/auth';
import { type FailureInfo, type ProviderDeps, type ProviderRequest, mappedFailure, providerRequest } from '@mariachi/integrations';
import { z } from 'zod';
import { KindeError } from './errors';
import { type KindeConfig, type KindeOperation, configSchema, errorMap, provider } from './generated';
import { kindeIssuer } from './provider';
import { CreatedUser, KindeIdentities, KindeUser, KindeUserList, TokenResponse } from './schemas';

export interface KindeIdentityClientConfig extends KindeConfig {
  /**
   * The social connection for each provider `authorizationUrl` accepts (`conn_…`, from the connection's settings in
   * Kinde). A provider without one is refused: Kinde picks a social sign-in by connection id.
   */
  connectionIds?: Partial<Record<IdentityOAuthProvider, string>>;
  /** Scopes asked for at sign-in. Default `openid profile email offline`: `offline` is what gives a refresh token. */
  scope?: string;
  /** The API audience to ask access tokens for (`aud`), as registered in Kinde (Settings › APIs). */
  audience?: string;
  /**
   * The Management API's audience for the machine-to-machine token. Default `<issuerUrl>/api`, right for a
   * `<subdomain>.kinde.com` domain; with a custom domain, pass `https://<subdomain>.kinde.com/api`.
   */
  managementAudience?: string;
}

export interface KindeDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

type Refused = 'auth/invalid-credentials' | 'auth/invalid-grant';

const DEFAULT_SCOPE = 'openid profile email offline';

/** `{ error }` from the OAuth endpoints, `{ errors: [{ code }] }` from the Management API. Never the message: it can echo input. */
function failure(_status: number, body: unknown): FailureInfo | undefined {
  const b = body as { error?: unknown; errors?: Array<{ code?: unknown }> } | null;
  const code = typeof b?.error === 'string' ? b.error : typeof b?.errors?.[0]?.code === 'string' ? (b.errors[0].code as string) : undefined;
  const mapped = mappedFailure(errorMap, code);
  return { providerCode: code, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

/** A failed call as the auth port's error, with Kinde's error kept as `cause`. */
function portError(error: unknown, refused: Refused | null): AuthError {
  if (error instanceof AuthError) return error;
  if (!(error instanceof KindeError)) return withCause(new AuthError('auth/identity-provider', 'Kinde request failed'), error);
  const meta = { kindeCode: error.code, category: error.category, providerCode: error.providerCode, status: error.status };
  if (error.category === 'rate-limited') return withCause(new AuthError('auth/rate-limited', 'Kinde rate limit reached', meta), error);
  if (refused && error.category === 'invalid-request') return withCause(new AuthError(refused, 'Kinde refused the grant', meta), error);
  return withCause(new AuthError('auth/identity-provider', `Kinde request failed (${error.code})`, meta), error);
}

function withCause(error: AuthError, cause: unknown): AuthError {
  Object.defineProperty(error, 'cause', { value: cause, enumerable: false });
  return error;
}

function notSupported(what: string): never {
  throw new AuthError('auth/not-supported', `Kinde: ${what} happens on Kinde's hosted pages. Send the user to authorizationUrl() and exchange the code.`);
}

function fullName(first?: string | null, last?: string | null): string | null {
  return [first, last].filter(Boolean).join(' ') || null;
}

/**
 * `IdentityClient` on Kinde. Kinde signs users in on its own hosted pages, so the port's sign-in is the redirect
 * (`authorizationUrl`, PKCE) and the code exchange; passwords, email codes and resets happen on those pages and
 * their methods here fail with `auth/not-supported`. Users are read, created and deleted through the Management
 * API, with a machine-to-machine token (`m2mClientId` and `m2mClientSecret`) fetched and kept until it expires.
 *
 * Every call to Kinde is one span (`kinde oauth.exchangeCode`, `kinde users.get`). The port's methods take no
 * context, so the spans carry no tenant. Failures are the port's `AuthError` codes, with the `KindeError` as
 * `cause`.
 */
export class KindeIdentityClient implements IdentityClient {
  readonly provider = provider.id;

  private readonly cfg: KindeIdentityClientConfig;
  private readonly issuer: string;
  private readonly server: string;
  private m2m: { token: Promise<string>; expiresAt: number } | null = null;

  constructor(
    config: KindeIdentityClientConfig,
    private readonly deps: KindeDeps = {},
  ) {
    const parsed = configSchema.safeParse(config);
    if (!parsed.success) {
      throw new AuthError('auth/invalid-config', `Kinde: ${parsed.error.issues.map((i) => i.path.join('.')).join(', ')} required`);
    }
    this.cfg = config;
    this.issuer = kindeIssuer(config.issuerUrl);
    this.server = new URL(this.issuer).host;
  }

  private call<T>(operation: KindeOperation, request: ProviderRequest, schema: z.ZodType<T, z.ZodTypeDef, unknown>, deps: KindeDeps = this.deps): Promise<T> {
    return providerRequest(null, { integration: provider.id, operation, category: provider.category, server: this.server }, request, { schema, error: KindeError, failure, deps });
  }

  private grant(operation: KindeOperation, form: Record<string, string | undefined>) {
    return this.call(operation, { method: 'POST', url: `${this.issuer}/oauth2/token`, form: { ...form, client_id: this.cfg.clientId, client_secret: this.cfg.clientSecret } }, TokenResponse);
  }

  /** A Management API token, fetched once and reused until a minute before it expires. */
  private managementToken(): Promise<string> {
    const { m2mClientId, m2mClientSecret } = this.cfg;
    if (!m2mClientId || !m2mClientSecret) {
      throw new AuthError('auth/invalid-config', 'Kinde: reading or changing users needs KINDE_M2M_CLIENT_ID and KINDE_M2M_CLIENT_SECRET (a machine-to-machine app authorized for the Management API)');
    }
    const now = (this.deps.now ?? Date.now)();
    if (this.m2m && this.m2m.expiresAt > now) return this.m2m.token;
    const token = this.call(
      'oauth.clientCredentials',
      {
        method: 'POST',
        url: `${this.issuer}/oauth2/token`,
        form: { grant_type: 'client_credentials', client_id: m2mClientId, client_secret: m2mClientSecret, audience: this.cfg.managementAudience ?? `${this.issuer}/api` },
      },
      TokenResponse,
    ).then((res) => {
      if (this.m2m?.token === token) this.m2m.expiresAt = now + Math.max(0, (res.expires_in ?? 3600) - 60) * 1000;
      return res.access_token;
    });
    this.m2m = { token, expiresAt: Number.POSITIVE_INFINITY };
    token.catch(() => {
      if (this.m2m?.token === token) this.m2m = null;
    });
    return token;
  }

  private async management<T>(operation: KindeOperation, request: Omit<ProviderRequest, 'url'> & { path: string }, schema: z.ZodType<T, z.ZodTypeDef, unknown>, deps?: KindeDeps): Promise<T> {
    const { path, ...rest } = request;
    const token = await this.managementToken();
    try {
      return await this.call(operation, { ...rest, url: `${this.issuer}${path}`, headers: { authorization: `Bearer ${token}` } }, schema, deps);
    } catch (error) {
      if (error instanceof KindeError && error.category === 'unauthorized') this.m2m = null; // fetch a new token next time
      throw error;
    }
  }

  private tokens(res: TokenResponse, previousRefreshToken?: string): TokenSet {
    const refreshToken = res.refresh_token ?? previousRefreshToken;
    if (!refreshToken) {
      throw new AuthError('auth/identity-provider', 'Kinde returned no refresh token: ask for the `offline` scope (the default `scope` does)');
    }
    const now = (this.deps.now ?? Date.now)();
    return { accessToken: res.access_token, refreshToken, expiresAt: res.expires_in ? now + res.expires_in * 1000 : undefined };
  }

  /** Whether the user's identity for `email` is confirmed, as Kinde records it. Unknown is false. */
  private async emailConfirmed(userId: string, email: string): Promise<boolean> {
    const { identities } = await this.management('users.identities', { method: 'GET', path: `/api/v1/users/${encodeURIComponent(userId)}/identities` }, KindeIdentities);
    const wanted = email.toLowerCase();
    return (identities ?? []).some((i) => i.type === 'email' && (i.email ?? i.name)?.toLowerCase() === wanted && i.is_confirmed === true);
  }

  private async toUser(row: { id: string; email?: string | null; first_name?: string | null; last_name?: string | null; picture?: string | null; provided_id?: string | null }): Promise<IdentityUser> {
    const email = row.email ?? '';
    return {
      id: row.id,
      email,
      emailVerified: email ? await this.emailConfirmed(row.id, email) : false,
      name: fullName(row.first_name, row.last_name),
      avatarUrl: row.picture ?? null,
      externalId: row.provided_id ?? null,
    };
  }

  /**
   * The user a sign-in's ID token names. With Management API credentials, the user's record (whose email is
   * verified only when Kinde has confirmed it); without them, the ID token's claims, with `emailVerified` false,
   * since Kinde's ID tokens don't say.
   */
  private async signedInUser(res: TokenResponse): Promise<IdentityUser> {
    // Read, not verified: the token is Kinde's own reply over TLS, and AuthProvider.verify checks every token a client sends.
    let claims: Record<string, unknown> = {};
    try {
      claims = res.id_token ? decodeJwt(res.id_token) : decodeJwt(res.access_token);
    } catch {
      // An opaque token: only the Management API can say who it is.
    }
    const sub = typeof claims.sub === 'string' ? claims.sub : undefined;
    if (!sub) throw new AuthError('auth/identity-provider', 'Kinde returned tokens that name no user: ask for the `openid` scope');
    if (this.cfg.m2mClientId && this.cfg.m2mClientSecret) {
      const user = await this.getUser(sub);
      if (user) return user;
    }
    const s = (k: string) => (typeof claims[k] === 'string' ? (claims[k] as string) : null);
    return { id: sub, email: s('email') ?? '', emailVerified: false, name: s('name') ?? fullName(s('given_name'), s('family_name')), avatarUrl: s('picture'), externalId: s('provided_id') };
  }

  /** Where to send the browser to sign in with Google or GitHub, through the connection set in `connectionIds`. */
  authorizationUrl(input: AuthorizationUrlInput): string {
    const connection = this.cfg.connectionIds?.[input.provider];
    if (!connection) {
      throw new AuthError('auth/invalid-config', `Kinde: no connection id for ${input.provider}; set connectionIds.${input.provider} to the connection's id (conn_…)`);
    }
    const url = new URL(`${this.issuer}/oauth2/auth`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.cfg.clientId);
    url.searchParams.set('redirect_uri', input.redirectUri);
    url.searchParams.set('scope', this.cfg.scope ?? DEFAULT_SCOPE);
    url.searchParams.set('state', input.state);
    url.searchParams.set('code_challenge', input.codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('connection_id', connection);
    if (this.cfg.audience) url.searchParams.set('audience', this.cfg.audience);
    if (input.loginHint) url.searchParams.set('login_hint', input.loginHint);
    return url.toString();
  }

  /**
   * Where to send the browser to end its Kinde session (`<issuerUrl>/logout?redirect=…`). `redirect` must be one of
   * the application's allowed logout redirect URLs. Pair it with `signOut`, which revokes the refresh token.
   */
  logoutUrl(redirect: string): string {
    const url = new URL(`${this.issuer}/logout`);
    url.searchParams.set('redirect', redirect);
    return url.toString();
  }

  async exchangeCode(input: CodeExchangeInput): Promise<SignInResult> {
    let res: TokenResponse;
    try {
      res = await this.grant('oauth.exchangeCode', { grant_type: 'authorization_code', code: input.code, code_verifier: input.codeVerifier, redirect_uri: input.redirectUri });
    } catch (error) {
      throw portError(error, 'auth/invalid-grant');
    }
    const tokens = this.tokens(res);
    try {
      return { status: 'signed-in', user: await this.signedInUser(res), tokens };
    } catch (error) {
      throw portError(error, null);
    }
  }

  async refresh(refreshToken: string): Promise<TokenSet> {
    try {
      return this.tokens(await this.grant('oauth.refresh', { grant_type: 'refresh_token', refresh_token: refreshToken }), refreshToken);
    } catch (error) {
      throw portError(error, 'auth/invalid-grant');
    }
  }

  /** Revokes the refresh token. Kinde's tokens name no session, so without a refresh token this does nothing. */
  async signOut(input: SignOutInput): Promise<void> {
    if (!input.refreshToken) return;
    try {
      await this.call(
        'oauth.revoke',
        {
          method: 'POST',
          url: `${this.issuer}/oauth2/revoke`,
          form: { token: input.refreshToken, token_type_hint: 'refresh_token', client_id: this.cfg.clientId, client_secret: this.cfg.clientSecret },
        },
        z.unknown(),
      );
    } catch (error) {
      throw portError(error, 'auth/invalid-grant');
    }
  }

  async getUser(id: string): Promise<IdentityUser | null> {
    try {
      const user = await this.management('users.get', { method: 'GET', path: '/api/v1/user', query: { id } }, KindeUser);
      return await this.toUser({ ...user, email: user.preferred_email });
    } catch (error) {
      if (error instanceof KindeError && error.category === 'not-found') return null;
      throw portError(error, null);
    }
  }

  async findUserByEmail(email: string): Promise<IdentityUser | null> {
    try {
      const { users } = await this.management('users.list', { method: 'GET', path: '/api/v1/users', query: { email, page_size: 10 } }, KindeUserList);
      const match = (users ?? []).find((u) => u.email?.toLowerCase() === email.toLowerCase());
      return match ? await this.toUser(match) : null;
    } catch (error) {
      throw portError(error, null);
    }
  }

  /**
   * Creates a user with an email identity, verified as `emailVerified` says, and `name` as the given name. Kinde
   * takes no password here: a user with one sets it on Kinde's pages. Not retried, since Kinde takes no
   * idempotency key and a retry after a lost answer would make the user twice.
   */
  async createUser(input: CreateIdentityUserInput): Promise<IdentityUser> {
    if (input.password !== undefined) {
      throw new AuthError('auth/not-supported', "Kinde: users can't be created with a password; they set one on Kinde's pages");
    }
    try {
      const created = await this.management(
        'users.create',
        {
          method: 'POST',
          path: '/api/v1/user',
          json: {
            ...(input.name ? { profile: { given_name: input.name } } : {}),
            ...(input.externalId ? { provided_id: input.externalId } : {}),
            identities: [{ type: 'email', is_verified: input.emailVerified, details: { email: input.email } }],
          },
        },
        CreatedUser,
        { ...this.deps, retry: { ...this.deps.retry, attempts: 1 } },
      );
      return { id: created.id, email: input.email, emailVerified: input.emailVerified, name: input.name ?? null, avatarUrl: null, externalId: input.externalId ?? null };
    } catch (error) {
      throw portError(error, null);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.management('users.delete', { method: 'DELETE', path: '/api/v1/user', query: { id } }, z.unknown());
    } catch (error) {
      if (error instanceof KindeError && error.category === 'not-found') return;
      throw portError(error, null);
    }
  }

  async signInWithPassword(): Promise<SignInResult> {
    return notSupported('password sign-in');
  }

  async sendPasswordReset(): Promise<EmailDelivery<{ token: string; url?: string; expiresAt?: number }>> {
    return notSupported('a password reset');
  }

  async resetPassword(): Promise<IdentityUser> {
    return notSupported('a password reset');
  }

  async setPassword(): Promise<void> {
    throw new AuthError('auth/not-supported', 'Kinde: the Management API sets only hashed passwords; users set theirs on Kinde\'s pages');
  }

  async startEmailCode(): Promise<EmailDelivery<{ code: string; expiresAt?: number }>> {
    return notSupported('an email code sign-in');
  }

  async signInWithEmailCode(): Promise<SignInResult> {
    return notSupported('an email code sign-in');
  }

  async pendingVerificationCode(): Promise<string> {
    return notSupported('email verification');
  }

  async verifyEmailAndSignIn(): Promise<SignInResult> {
    return notSupported('email verification');
  }
}
