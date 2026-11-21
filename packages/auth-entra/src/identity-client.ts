import { decodeJwt } from 'jose';
import { z } from 'zod';
import { AuthError, fromZodError } from '@mariachi/core';
import { ProviderError } from '@mariachi/integrations';
import type {
  AuthorizationUrlInput,
  CodeExchangeInput,
  CreateIdentityUserInput,
  EmailDelivery,
  IdentityClient,
  IdentityRequestContext,
  IdentityUser,
  SignInResult,
  SignOutInput,
  TokenSet,
} from '@mariachi/auth';
import { GRAPH, type EntraDeps, type Endpoints, appTokenSource, endpoints, entraRequest } from './endpoints';
import { GraphUser, GraphUserList, TokenResponse } from './schemas';


export interface EntraIdentityClientConfig {
  tenantId: string;
  clientId: string;
  /** Needed for every call: the code exchange, refresh and Microsoft Graph. */
  clientSecret: string;
  /** For an External ID (customer) tenant: `https://<subdomain>.ciamlogin.com`. */
  authority?: string;
  /**
   * The scopes asked for at sign-in, besides `openid profile email offline_access` (which are always asked for:
   * `profile` puts `oid` and `tid` in the tokens, `offline_access` brings a refresh token). Default
   * `api://<clientId>/.default`, so the access token is for your own API and `EntraAuthProvider` can verify it: give
   * the registration that Application ID URI and a scope under Expose an API.
   */
  apiScopes?: string[];
}

const SELECT = 'id,displayName,mail,userPrincipalName,identities';
const OIDC_SCOPES = ['openid', 'profile', 'email', 'offline_access'];

/**
 * `IdentityClient` on Microsoft Entra ID and Entra External ID: sign-in through Entra's own pages (the
 * authorization code flow with PKCE), refresh, the sign-out URL, and the directory's users through Microsoft Graph
 * with the app's own token (client credentials; the registration needs the application permission
 * `User.ReadWrite.All`, admin-consented).
 *
 * Entra signs people in on its own pages, so the headless calls (password, email code, password reset) fail with
 * `auth/not-supported`. User ids are Graph object ids, the `oid` of a token, as `EntraAuthProvider` reports them.
 * Graph has no email-verified flag, so `emailVerified` is always false: an app that links accounts by email must
 * prove the address itself.
 */
export class EntraIdentityClient implements IdentityClient {
  readonly provider = 'entra';

  private readonly ep: Endpoints;
  private readonly appToken: ReturnType<typeof appTokenSource>;
  private readonly scopes: string;
  private readonly now: () => number;

  constructor(
    private readonly config: EntraIdentityClientConfig,
    private readonly deps: EntraDeps = {},
  ) {
    for (const k of ['tenantId', 'clientId', 'clientSecret'] as const) {
      if (!config[k]) throw new AuthError('auth/invalid-config', `Entra: \`${k}\` is required`);
    }
    this.ep = endpoints(config);
    this.appToken = appTokenSource(this.ep, config, deps);
    this.scopes = [...OIDC_SCOPES, ...(config.apiScopes ?? [`api://${config.clientId}/.default`])].join(' ');
    this.now = deps.now ?? Date.now;
  }

  /**
   * Where to send the browser to sign in: Entra's page for the tenant. Entra shows the sign-in methods the tenant
   * has set up (an External ID tenant's Google or Facebook among them), so `input.provider` doesn't pick one.
   */
  authorizationUrl(input: AuthorizationUrlInput): string {
    const url = new URL(this.ep.authorize);
    url.searchParams.set('client_id', this.config.clientId);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('response_mode', 'query');
    url.searchParams.set('redirect_uri', input.redirectUri);
    url.searchParams.set('scope', this.scopes);
    url.searchParams.set('state', input.state);
    url.searchParams.set('code_challenge', input.codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    if (input.loginHint) url.searchParams.set('login_hint', input.loginHint);
    return url.toString();
  }

  async exchangeCode(input: CodeExchangeInput): Promise<SignInResult> {
    const res = await this.token('tokens.exchangeCode', {
      grant_type: 'authorization_code',
      code: input.code,
      code_verifier: input.codeVerifier,
      redirect_uri: input.redirectUri,
      scope: this.scopes,
    });
    if (!res.id_token) throw new AuthError('auth/identity-provider', 'Entra returned no id_token: the `openid` scope was not granted');
    return { status: 'signed-in', user: userFromIdToken(res.id_token), tokens: this.tokens(res) };
  }

  async refresh(refreshToken: string, _context?: IdentityRequestContext): Promise<TokenSet> {
    const res = await this.token('tokens.refresh', { grant_type: 'refresh_token', refresh_token: refreshToken, scope: this.scopes });
    // Entra may hand out a new refresh token: the old one is then to be discarded.
    return this.tokens(res, refreshToken);
  }

  /**
   * Entra ends a session in the browser, not from the server: send the user to `signOutUrl` as well. This call
   * makes no request; drop the tokens the app holds.
   */
  async signOut(_input: SignOutInput): Promise<void> {}

  /**
   * Entra's sign-out page, which ends the user's Entra session and returns to `postLogoutRedirectUri` (one of the
   * registration's redirect URIs). `logoutHint` is the `login_hint` optional claim of the user's ID token, never a
   * UPN or phone number; with it Entra doesn't ask which account to sign out.
   */
  signOutUrl(input: { postLogoutRedirectUri?: string; logoutHint?: string } = {}): string {
    const url = new URL(this.ep.logout);
    if (input.postLogoutRedirectUri) url.searchParams.set('post_logout_redirect_uri', input.postLogoutRedirectUri);
    if (input.logoutHint) url.searchParams.set('logout_hint', input.logoutHint);
    return url.toString();
  }

  async getUser(id: string): Promise<IdentityUser | null> {
    if (!id) return null;
    try {
      return toUser(await this.graph('users.get', { method: 'GET', path: `/users/${encodeURIComponent(id)}`, query: { $select: SELECT } }, GraphUser));
    } catch (error) {
      if (error instanceof AuthError && error.metadata?.category === 'not-found') return null;
      throw error;
    }
  }

  /**
   * The user whose `mail` or `userPrincipalName` is this address; in an External ID tenant, whose email sign-in
   * identity is.
   */
  async findUserByEmail(email: string): Promise<IdentityUser | null> {
    const address = z.string().email().safeParse(email);
    if (!address.success) return null;
    const literal = odata(address.data);
    const filter = this.ep.externalId
      ? `identities/any(c:c/issuerAssignedId eq ${literal} and c/issuer eq ${odata(this.identityIssuer())})`
      : `mail eq ${literal} or userPrincipalName eq ${literal}`;
    const page = await this.graph('users.find', { method: 'GET', path: '/users', query: { $filter: filter, $select: SELECT, $top: 1 } }, GraphUserList);
    const found = page.value[0];
    return found ? toUser(found) : null;
  }

  /**
   * Creates a user who signs in with this email and password. In a workforce tenant the email becomes the
   * userPrincipalName, so its domain must be one of the tenant's verified domains; in an External ID tenant it's
   * the user's email sign-in identity. Entra needs a password for both. Entra has no external id or email-verified
   * flag to store, so `externalId` is refused and `emailVerified` isn't sent.
   */
  async createUser(input: CreateIdentityUserInput): Promise<IdentityUser> {
    const i = CreateUserInput.safeParse(input);
    if (!i.success) throw fromZodError(i.error, 'Invalid Entra user');
    if (i.data.externalId) throw new AuthError('auth/not-supported', 'Entra stores no external id on a user; keep the mapping in the app');
    const { email, password, name } = i.data;
    const displayName = name ?? email;
    const body = this.ep.externalId
      ? {
          accountEnabled: true,
          displayName,
          mail: email,
          identities: [{ signInType: 'emailAddress', issuer: this.identityIssuer(), issuerAssignedId: email }],
          passwordProfile: { password, forceChangePasswordNextSignIn: false },
          // Graph requires it for local accounts in an External ID tenant
          passwordPolicies: 'DisablePasswordExpiration',
        }
      : {
          accountEnabled: true,
          displayName,
          mail: email,
          mailNickname: mailNickname(email),
          userPrincipalName: email,
          passwordProfile: { password, forceChangePasswordNextSignIn: false },
        };
    return toUser(await this.graph('users.create', { method: 'POST', path: '/users', json: body }, GraphUser));
  }

  /** Deletes the user; one already gone is no error. Entra keeps it soft-deleted for 30 days. */
  async deleteUser(id: string): Promise<void> {
    try {
      await this.graph('users.delete', { method: 'DELETE', path: `/users/${encodeURIComponent(id)}` }, z.unknown());
    } catch (error) {
      if (error instanceof AuthError && error.metadata?.category === 'not-found') return;
      throw error;
    }
  }

  async signInWithPassword(): Promise<SignInResult> {
    throw notSupported('password sign-in');
  }

  async sendPasswordReset(): Promise<EmailDelivery<{ token: string; url?: string; expiresAt?: number }>> {
    throw notSupported('password reset (Entra resets passwords on its own pages, with self-service password reset)');
  }

  async resetPassword(): Promise<IdentityUser> {
    throw notSupported('password reset');
  }

  async setPassword(): Promise<void> {
    throw notSupported('setting a password');
  }

  async startEmailCode(): Promise<EmailDelivery<{ code: string; expiresAt?: number }>> {
    throw notSupported('email codes (an External ID tenant offers email one-time passcodes on its own sign-in page)');
  }

  async signInWithEmailCode(): Promise<SignInResult> {
    throw notSupported('email codes');
  }

  async pendingVerificationCode(): Promise<string> {
    throw notSupported('email verification codes');
  }

  async verifyEmailAndSignIn(): Promise<SignInResult> {
    throw notSupported('email verification');
  }

  private identityIssuer(): string {
    if (!this.ep.identityIssuer) {
      throw new AuthError('auth/invalid-config', "Entra: email identities need the tenant's <subdomain>.ciamlogin.com authority, which names its <subdomain>.onmicrosoft.com domain");
    }
    return this.ep.identityIssuer;
  }

  private tokens(res: z.infer<typeof TokenResponse>, previousRefreshToken = ''): TokenSet {
    let sessionId: string | undefined;
    if (res.id_token) {
      try {
        const sid = decodeJwt(res.id_token).sid;
        if (typeof sid === 'string' && sid) sessionId = sid;
      } catch {
        // No session id to report.
      }
    }
    return {
      accessToken: res.access_token,
      refreshToken: res.refresh_token ?? previousRefreshToken,
      ...(sessionId ? { sessionId } : {}),
      ...(res.expires_in ? { expiresAt: this.now() + res.expires_in * 1000 } : {}),
    };
  }

  private async token(operation: 'tokens.exchangeCode' | 'tokens.refresh', form: Record<string, string>) {
    try {
      return await entraRequest(null, this.deps, operation, { method: 'POST', url: this.ep.token, form: { client_id: this.config.clientId, client_secret: this.config.clientSecret, ...form } }, TokenResponse);
    } catch (error) {
      throw asAuthError(error);
    }
  }

  private async graph<T>(
    operation: 'users.get' | 'users.find' | 'users.create' | 'users.delete',
    request: { method: 'GET' | 'POST' | 'DELETE'; path: string; query?: Record<string, string | number>; json?: unknown },
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  ): Promise<T> {
    try {
      const token = await this.appToken(null);
      return await entraRequest(null, this.deps, operation, { method: request.method, url: `${GRAPH}${request.path}`, query: request.query, json: request.json, headers: { authorization: `Bearer ${token}` } }, schema);
    } catch (error) {
      throw asAuthError(error);
    }
  }
}

const CreateUserInput = z.object({
  email: z.string().email(),
  emailVerified: z.boolean().optional(),
  password: z.string({ required_error: 'Entra needs a password for a new user' }).min(1, 'Entra needs a password for a new user'),
  name: z.string().min(1).optional(),
  externalId: z.string().optional(),
});

function notSupported(what: string): AuthError {
  return new AuthError('auth/not-supported', `Entra doesn't offer ${what} through its API: users sign in on Entra's own pages (authorizationUrl)`);
}

/**
 * An `EntraError` (or the unreachable provider's `ProviderError`) as the auth port's codes: `auth/rate-limited`; `auth/invalid-grant` for what Entra refused (a used
 * code, a bad verifier, a user that exists); `auth/identity-provider` for the rest, including a missing Graph
 * permission. The category, status and Entra's code stay in `metadata`, never Entra's message.
 */
function asAuthError(error: unknown): unknown {
  // A provider that can't be reached is a plain ProviderError (`entra/unavailable`), so test for the base class
  if (!(error instanceof ProviderError)) return error;
  const metadata = { category: error.category, status: error.status, providerCode: error.providerCode };
  if (error.category === 'rate-limited') return new AuthError('auth/rate-limited', 'Entra rate limit reached', metadata);
  if (error.category === 'invalid-request' || error.category === 'conflict' || error.category === 'not-found') {
    return new AuthError('auth/invalid-grant', `Entra refused the request (${error.providerCode ?? error.status ?? error.category})`, metadata);
  }
  if (error.category === 'forbidden') {
    return new AuthError('auth/identity-provider', `Entra refused the app (${error.providerCode ?? 'forbidden'}): check its admin-consented API permissions`, metadata);
  }
  return new AuthError('auth/identity-provider', `Entra request failed (${error.code})`, metadata);
}

function toUser(u: z.infer<typeof GraphUser>): IdentityUser {
  const emailIdentity = u.identities?.find((x) => x.signInType === 'emailAddress')?.issuerAssignedId;
  return {
    id: u.id,
    email: u.mail ?? emailIdentity ?? u.userPrincipalName ?? '',
    emailVerified: false,
    name: u.displayName ?? null,
    avatarUrl: null,
    externalId: null,
  };
}

/**
 * The user in an ID token Entra's token endpoint just returned to us over TLS, so read rather than verified (as
 * OpenID Connect allows for a token from the token endpoint). `oid` is the id, as Graph and access tokens have it.
 */
function userFromIdToken(idToken: string): IdentityUser {
  let claims: Record<string, unknown>;
  try {
    claims = decodeJwt(idToken);
  } catch {
    throw new AuthError('auth/identity-provider', 'Entra returned an id_token that is not a JWT');
  }
  if (typeof claims.oid !== 'string' || !claims.oid) throw new AuthError('auth/identity-provider', 'Entra id_token has no `oid`: the `profile` scope was not granted');
  const str = (k: string) => (typeof claims[k] === 'string' && claims[k] ? (claims[k] as string) : null);
  return {
    id: claims.oid,
    email: str('email') ?? str('preferred_username') ?? '',
    emailVerified: false,
    name: str('name'),
    avatarUrl: null,
    externalId: null,
  };
}

/** An OData string literal: quoted, with each quote doubled. */
function odata(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/** A mail alias from the address's local part, in the characters Graph allows. */
function mailNickname(email: string): string {
  const local = email.split('@')[0] ?? '';
  return local.replace(/[^A-Za-z0-9._-]/g, '').slice(0, 64) || 'user';
}
