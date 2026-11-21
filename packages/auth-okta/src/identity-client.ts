import { randomUUID } from 'node:crypto';
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
import { AuthError, fromZodError } from '@mariachi/core';
import { type FailureInfo, type ProviderDeps, type ProviderRequest, mappedFailure, providerRequest } from '@mariachi/integrations';
import { type CryptoKey, type JWK, type KeyObject, SignJWT, decodeJwt, importJWK, importPKCS8 } from 'jose';
import { z } from 'zod';
import { OktaError, toAuthError } from './errors';
import { type OktaConfig, type OktaOperation, errorMap, provider } from './generated';
import { OktaUser, OktaUserList, TokenResponse } from './schemas';
import { type OktaServer, oktaServer } from './server';

type SigningAlgorithm = 'RS256' | 'RS384' | 'RS512' | 'ES256' | 'ES384' | 'ES512';

export interface OktaIdentityOptions extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
  /**
   * The ids of the identity providers set up in Okta for social sign-in (Admin Console › Security › Identity
   * Providers), so `authorizationUrl({ provider: 'google' })` goes straight to Google. A provider with no id here
   * can't be asked for.
   */
  identityProviderIds?: Partial<Record<IdentityOAuthProvider, string>>;
  /** The scopes sign-in asks for. Default `openid email profile offline_access` (`offline_access` gives the refresh token). */
  scope?: string;
  /** A custom profile attribute that holds the app's own id for the user, read into `externalId` and written by `createUser`. */
  externalIdProperty?: string;
  /** The service app's scopes. Default `okta.users.read okta.users.manage`. */
  serviceScopes?: string;
  /** The algorithm of a PEM service key. Default `RS256`; a JWK's own `alg` wins. */
  serviceKeyAlgorithm?: SigningAlgorithm;
}

/** Okta's tokens: the port's `TokenSet`, and the ID token, which `logoutUrl` needs to end the Okta session. */
export interface OktaTokenSet extends TokenSet {
  idToken?: string;
}

export type OktaSignInResult = { status: 'signed-in'; user: IdentityUser; tokens: OktaTokenSet };

const DEFAULT_SCOPE = 'openid email profile offline_access';
const NOT_SUPPORTED: Record<string, string> = {
  signInWithPassword: 'Okta sign-in goes through its hosted page: send the browser to authorizationUrl or signInUrl, then exchangeCode',
  sendPasswordReset: "Okta's hosted sign-in page handles password resets",
  resetPassword: "Okta's hosted sign-in page handles password resets",
  setPassword: 'Setting a password through the Okta API is not supported yet',
  startEmailCode: "Okta's hosted sign-in page handles email codes (its email authenticator)",
  signInWithEmailCode: "Okta's hosted sign-in page handles email codes (its email authenticator)",
  pendingVerificationCode: 'Okta sign-ins never stop at email verification here: its hosted page handles it',
  verifyEmailAndSignIn: 'Okta sign-ins never stop at email verification here: its hosted page handles it',
};

const SignInUrlInput = z.object({
  redirectUri: z.string().url(),
  state: z.string().min(1),
  codeChallenge: z.string().min(43),
  loginHint: z.string().optional(),
  idp: z.string().optional(),
});
const CodeInput = z.object({ code: z.string().min(1), codeVerifier: z.string().min(43), redirectUri: z.string().url() });
/** Search values go in double quotes: one that could end the quote is refused rather than escaped. */
const SearchValue = z.string().min(1).refine((v) => !/["\\]/.test(v), 'must not contain " or \\');
const CreateInput = z.object({
  email: z.string().email(),
  emailVerified: z.boolean(),
  password: z.string().min(1).optional(),
  name: z.string().optional(),
  externalId: z.string().optional(),
});
const LogoutInput = z.object({ idToken: z.string().min(1), postLogoutRedirectUri: z.string().url().optional(), state: z.string().optional() });

/**
 * `IdentityClient` on Okta: sign-in through Okta's hosted page with PKCE (`authorizationUrl`, `signInUrl`,
 * `exchangeCode`), `refresh`, `signOut` (revokes the refresh token; `logoutUrl` ends the Okta session in the
 * browser), and users through the Management API.
 *
 * - Sign-in, refresh and sign-out use the OIDC app (`OKTA_CLIENT_ID`, `OKTA_CLIENT_SECRET`) against the custom
 *   authorization server (`OKTA_ISSUER`).
 * - Users use a service app (`OKTA_SERVICE_CLIENT_ID`, `OKTA_SERVICE_PRIVATE_KEY`: client credentials with a
 *   private_key_jwt assertion, Okta's recommendation) or else an API token (`OKTA_API_TOKEN`, sent as
 *   `SSWS <token>`).
 *
 * Every call goes to Okta through `callProvider`, so each has its span (`okta token.authorizationCode`). The port's
 * interface carries no context, so these spans have no tenant. Failures are the port's `AuthError`s, with the
 * `OktaError` as their `cause`. Password, email-code and reset flows are Okta's hosted page's, so those methods
 * fail with `auth/not-supported`.
 */
export class OktaIdentityClient implements IdentityClient {
  readonly provider = 'okta';
  private readonly server: OktaServer;
  private readonly scope: string;
  private serviceToken?: { value: string; expiresAt: number };
  private serviceTokenPending?: Promise<string>;
  private serviceKey?: Promise<{ key: CryptoKey | KeyObject | Uint8Array; alg: string; kid?: string }>;

  constructor(
    private readonly config: OktaConfig,
    private readonly options: OktaIdentityOptions = {},
  ) {
    if (!config.clientId) throw new AuthError('auth/invalid-config', 'Okta: OKTA_CLIENT_ID is required');
    this.server = oktaServer(config.issuer);
    this.scope = options.scope ?? DEFAULT_SCOPE;
    if (config.serviceClientId && !config.servicePrivateKey) {
      throw new AuthError('auth/invalid-config', 'Okta: OKTA_SERVICE_CLIENT_ID needs OKTA_SERVICE_PRIVATE_KEY');
    }
  }

  // Sign-in

  /** Where to send the browser for social sign-in: Okta's `/authorize`, straight to that provider's identity provider in Okta. */
  authorizationUrl(input: AuthorizationUrlInput): string {
    const idp = this.options.identityProviderIds?.[input.provider];
    if (!idp) {
      throw new AuthError('auth/invalid-config', `Okta: no identity provider id for "${input.provider}"; set identityProviderIds.${input.provider}, or use signInUrl for Okta's own sign-in page`);
    }
    return this.signInUrl({ redirectUri: input.redirectUri, state: input.state, codeChallenge: input.codeChallenge, loginHint: input.loginHint, idp });
  }

  /**
   * Where to send the browser for Okta's hosted sign-in page (or, with `idp`, one identity provider set up in
   * Okta). Authorization code with PKCE (S256): keep the verifier, and pass it to `exchangeCode` with the code.
   */
  signInUrl(input: z.input<typeof SignInUrlInput>): string {
    const i = parse(SignInUrlInput, input);
    const url = new URL(`${this.server.issuer}/v1/authorize`);
    url.searchParams.set('client_id', this.config.clientId);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', this.scope);
    url.searchParams.set('redirect_uri', i.redirectUri);
    url.searchParams.set('state', i.state);
    url.searchParams.set('code_challenge', i.codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    if (i.loginHint) url.searchParams.set('login_hint', i.loginHint);
    if (i.idp) url.searchParams.set('idp', i.idp);
    return url.toString();
  }

  /**
   * Exchanges the code Okta sent to the redirect URI for tokens. The user is read from the ID token (`sub` is Okta's
   * id for them, and `email_verified` says whether Okta has verified their email); `tokens.idToken` is kept for
   * `logoutUrl`. Never retried: a code works once.
   */
  async exchangeCode(input: CodeExchangeInput): Promise<OktaSignInResult> {
    const i = parse(CodeInput, input);
    const res = await this.oauth('token.authorizationCode', '/v1/token', { grant_type: 'authorization_code', code: i.code, code_verifier: i.codeVerifier, redirect_uri: i.redirectUri }, TokenResponse, 'auth/invalid-grant', 1);
    return { status: 'signed-in', user: userFromIdToken(res.id_token), tokens: tokenSet(res) };
  }

  /**
   * A new access token for a refresh token. When Okta rotates refresh tokens the answer has a new one, which
   * replaces the old; otherwise the old one is returned. Never retried, so a rotated token isn't spent twice.
   */
  async refresh(refreshToken: string): Promise<OktaTokenSet> {
    const token = parse(z.string().min(1), refreshToken);
    const res = await this.oauth('token.refresh', '/v1/token', { grant_type: 'refresh_token', refresh_token: token }, TokenResponse, 'auth/invalid-grant', 1);
    return tokenSet(res, token);
  }

  /**
   * Revokes the refresh token at Okta. That ends the app's session; the Okta session in the browser (single
   * sign-on) stays until the browser visits `logoutUrl`. Okta access tokens carry no session id, so `sessionId`
   * is ignored. Without a refresh token, does nothing.
   */
  async signOut(input: SignOutInput): Promise<void> {
    if (!input.refreshToken) return;
    await this.oauth('token.revoke', '/v1/revoke', { token: input.refreshToken, token_type_hint: 'refresh_token' }, z.unknown(), 'auth/identity-provider');
  }

  /** Where to send the browser to end its Okta session: `/v1/logout` with the ID token from sign-in. */
  logoutUrl(input: z.input<typeof LogoutInput>): string {
    const i = parse(LogoutInput, input);
    const url = new URL(`${this.server.issuer}/v1/logout`);
    url.searchParams.set('id_token_hint', i.idToken);
    if (i.postLogoutRedirectUri) url.searchParams.set('post_logout_redirect_uri', i.postLogoutRedirectUri);
    if (i.state) url.searchParams.set('state', i.state);
    return url.toString();
  }

  // Users (Management API)

  /** A user by Okta id (or login); `null` when there's none. */
  async getUser(id: string): Promise<IdentityUser | null> {
    const userId = parse(z.string().min(1), id);
    try {
      return this.toUser(await this.management('users.get', { method: 'GET', path: `/api/v1/users/${encodeURIComponent(userId)}` }, OktaUser));
    } catch (error) {
      if (error instanceof OktaError && error.category === 'not-found') return null;
      throw toAuthError(error);
    }
  }

  /** The user whose primary email is this one (compared without case); `null` when there's none. Okta's search is eventually consistent. */
  async findUserByEmail(email: string): Promise<IdentityUser | null> {
    const value = parse(z.string().email().pipe(SearchValue), email);
    const users = await this.search(`profile.email eq "${value}"`);
    const match = users.find((u) => u.profile.email?.toLowerCase() === value.toLowerCase());
    return match ? this.toUser(match) : null;
  }

  /** The user with this login (username); `null` when there's none. */
  async findUserByLogin(login: string): Promise<IdentityUser | null> {
    const value = parse(SearchValue, login);
    const users = await this.search(`profile.login eq "${value}"`);
    const match = users.find((u) => u.profile.login.toLowerCase() === value.toLowerCase());
    return match ? this.toUser(match) : null;
  }

  /**
   * Creates a user with the email as their login. With a password they're active at once; without one they're
   * staged, and Okta sends nothing until they're activated. `name` is split into first and last name at its first
   * space. Okta's API has no way to mark an email verified, so `emailVerified` isn't sent. Never retried: Okta
   * takes no idempotency key, and a second create would fail on the login anyway.
   */
  async createUser(input: CreateIdentityUserInput): Promise<IdentityUser> {
    const i = parse(CreateInput, input);
    const property = this.options.externalIdProperty;
    if (i.externalId && !property) throw new AuthError('auth/invalid-config', 'Okta: set externalIdProperty (a custom profile attribute) to store externalId');
    const [firstName, ...rest] = (i.name ?? '').trim().split(/\s+/).filter(Boolean);
    const profile: Record<string, string> = { email: i.email, login: i.email };
    if (firstName) profile.firstName = firstName;
    if (rest.length) profile.lastName = rest.join(' ');
    if (i.externalId && property) profile[property] = i.externalId;
    try {
      const created = await this.management(
        'users.create',
        { method: 'POST', path: '/api/v1/users', query: { activate: i.password !== undefined }, json: { profile, ...(i.password ? { credentials: { password: { value: i.password } } } : {}) } },
        OktaUser,
        1,
      );
      return this.toUser(created);
    } catch (error) {
      throw toAuthError(error);
    }
  }

  /** Deletes a user for good: Okta deactivates an active user on the first delete and deletes on the second, so it's sent twice. Gone already is fine. */
  async deleteUser(id: string): Promise<void> {
    const userId = parse(z.string().min(1), id);
    for (let i = 0; i < 2; i += 1) {
      try {
        await this.management('users.delete', { method: 'DELETE', path: `/api/v1/users/${encodeURIComponent(userId)}` }, z.unknown());
      } catch (error) {
        if (error instanceof OktaError && error.category === 'not-found') return;
        throw toAuthError(error);
      }
    }
  }

  // Flows Okta's hosted page owns

  async signInWithPassword(): Promise<SignInResult> {
    throw notSupported('signInWithPassword');
  }
  async sendPasswordReset(): Promise<EmailDelivery<{ token: string; url?: string; expiresAt?: number }>> {
    throw notSupported('sendPasswordReset');
  }
  async resetPassword(): Promise<IdentityUser> {
    throw notSupported('resetPassword');
  }
  async setPassword(): Promise<void> {
    throw notSupported('setPassword');
  }
  async startEmailCode(): Promise<EmailDelivery<{ code: string; expiresAt?: number }>> {
    throw notSupported('startEmailCode');
  }
  async signInWithEmailCode(): Promise<SignInResult> {
    throw notSupported('signInWithEmailCode');
  }
  async pendingVerificationCode(): Promise<string> {
    throw notSupported('pendingVerificationCode');
  }
  async verifyEmailAndSignIn(): Promise<SignInResult> {
    throw notSupported('verifyEmailAndSignIn');
  }

  // Calls

  private call<T>(operation: OktaOperation, request: ProviderRequest, schema: z.ZodType<T, z.ZodTypeDef, unknown>, attempts?: number): Promise<T> {
    const { fetch, ...deps } = this.options;
    return providerRequest(null, { integration: provider.id, operation, category: provider.category, server: this.server.host }, request, {
      schema,
      error: OktaError,
      failure,
      deps: { ...deps, fetch, ...(attempts ? { retry: { ...deps.retry, attempts } } : {}) },
    });
  }

  /** A call to the authorization server's endpoints, authenticated as the OIDC app (`client_secret_basic`). */
  private async oauth<T>(operation: OktaOperation, path: string, form: Record<string, string>, schema: z.ZodType<T, z.ZodTypeDef, unknown>, refused: 'auth/invalid-grant' | 'auth/identity-provider', attempts?: number): Promise<T> {
    if (!this.config.clientSecret) throw new AuthError('auth/invalid-config', 'Okta: OKTA_CLIENT_SECRET is required to exchange, refresh or revoke tokens');
    const basic = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');
    try {
      return await this.call(operation, { method: 'POST', url: `${this.server.issuer}${path}`, headers: { authorization: `Basic ${basic}` }, form }, schema, attempts);
    } catch (error) {
      throw toAuthError(error, refused);
    }
  }

  /** A Management API call, as the service app when it's set up, else with the API token. */
  private async management<T>(operation: OktaOperation, request: Omit<ProviderRequest, 'url' | 'headers'> & { path: string }, schema: z.ZodType<T, z.ZodTypeDef, unknown>, attempts?: number): Promise<T> {
    const { path, ...rest } = request;
    const authorization = await this.managementAuthorization();
    try {
      return await this.call(operation, { ...rest, url: `${this.server.origin}${path}`, headers: { authorization } }, schema, attempts);
    } catch (error) {
      // An access token Okta no longer takes (revoked, or its role changed) is fetched again on the next call.
      if (error instanceof OktaError && error.category === 'unauthorized' && authorization.startsWith('Bearer ')) this.serviceToken = undefined;
      throw error;
    }
  }

  private async search(expression: string): Promise<OktaUser[]> {
    try {
      return await this.management('users.search', { method: 'GET', path: '/api/v1/users', query: { search: expression } }, OktaUserList);
    } catch (error) {
      throw toAuthError(error);
    }
  }

  private async managementAuthorization(): Promise<string> {
    if (this.config.serviceClientId) return `Bearer ${await this.serviceAccessToken()}`;
    if (this.config.apiToken) return `SSWS ${this.config.apiToken}`;
    throw new AuthError('auth/invalid-config', 'Okta: users need OKTA_SERVICE_CLIENT_ID and OKTA_SERVICE_PRIVATE_KEY (a service app), or OKTA_API_TOKEN');
  }

  /** The service app's access token, from the org authorization server, kept until a minute before it expires. One fetch at a time. */
  private async serviceAccessToken(): Promise<string> {
    const now = (this.options.now ?? Date.now)();
    if (this.serviceToken && this.serviceToken.expiresAt > now) return this.serviceToken.value;
    this.serviceTokenPending ??= this.fetchServiceToken().finally(() => {
      this.serviceTokenPending = undefined;
    });
    return this.serviceTokenPending;
  }

  private async fetchServiceToken(): Promise<string> {
    const clientId = this.config.serviceClientId!;
    const tokenUrl = `${this.server.origin}/oauth2/v1/token`;
    const { key, alg, kid } = await this.signingKey();
    const assertion = await new SignJWT({})
      .setProtectedHeader({ alg, ...(kid ? { kid } : {}) })
      .setIssuer(clientId)
      .setSubject(clientId)
      .setAudience(tokenUrl)
      .setIssuedAt()
      .setExpirationTime('5m')
      .setJti(randomUUID())
      .sign(key);
    let res: TokenResponse;
    try {
      res = await this.call(
        'token.clientCredentials',
        {
          method: 'POST',
          url: tokenUrl,
          form: {
            grant_type: 'client_credentials',
            scope: this.options.serviceScopes ?? 'okta.users.read okta.users.manage',
            client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            client_assertion: assertion,
          },
        },
        TokenResponse,
        // A retry would reuse the assertion's jti, which Okta may refuse as a replay.
        1,
      );
    } catch (error) {
      throw toAuthError(error);
    }
    if (res.token_type.toLowerCase() !== 'bearer') {
      throw new AuthError('auth/invalid-config', `Okta gave the service app a ${res.token_type} token: turn off "Require DPoP" on the service app (DPoP is not supported yet)`);
    }
    const now = (this.options.now ?? Date.now)();
    this.serviceToken = { value: res.access_token, expiresAt: now + Math.max(0, (res.expires_in ?? 3600) - 60) * 1000 };
    return res.access_token;
  }

  private signingKey() {
    this.serviceKey ??= (async () => {
      const raw = this.config.servicePrivateKey!.trim();
      try {
        if (raw.startsWith('{')) {
          const jwk = JSON.parse(raw) as JWK;
          const alg = jwk.alg ?? 'RS256';
          return { key: await importJWK(jwk, alg), alg, kid: jwk.kid };
        }
        const alg = this.options.serviceKeyAlgorithm ?? 'RS256';
        return { key: await importPKCS8(raw.replace(/\\n/g, '\n'), alg), alg };
      } catch {
        this.serviceKey = undefined;
        throw new AuthError('auth/invalid-config', 'Okta: OKTA_SERVICE_PRIVATE_KEY is not a private JWK (JSON) or a PKCS#8 PEM');
      }
    })();
    return this.serviceKey;
  }

  private toUser(u: OktaUser): IdentityUser {
    const p = u.profile;
    const external = this.options.externalIdProperty ? p[this.options.externalIdProperty] : undefined;
    return {
      id: u.id,
      email: p.email ?? '',
      // The Users API says nothing about whether the email was verified; never claim it was.
      emailVerified: false,
      name: p.displayName || [p.firstName, p.lastName].filter(Boolean).join(' ') || null,
      avatarUrl: null,
      externalId: typeof external === 'string' ? external : null,
    };
  }
}

/**
 * Okta's error bodies: the Management API's `{ errorCode, errorSummary, … }` and OAuth's `{ error,
 * error_description }`. The code is kept, the description isn't (it can echo input).
 */
function failure(_status: number, body: unknown): FailureInfo | undefined {
  const b = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const code = typeof b.errorCode === 'string' ? b.errorCode : typeof b.error === 'string' ? b.error : undefined;
  const mapped = mappedFailure(errorMap, code);
  return { providerCode: code, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

/**
 * The user in an ID token Okta just returned over TLS, from its token endpoint. Read, not verified: it's the API's
 * own reply, and `OktaAuthProvider.verify` checks every token a client sends.
 */
function userFromIdToken(idToken: string | undefined): IdentityUser {
  let claims: Record<string, unknown>;
  try {
    if (!idToken) throw new AuthError('auth/identity-provider', 'no id_token');
    claims = decodeJwt(idToken);
  } catch {
    throw new AuthError('auth/identity-provider', 'Okta returned no readable ID token: sign-in must ask for the openid scope');
  }
  const s = (k: string) => (typeof claims[k] === 'string' && claims[k] ? (claims[k] as string) : null);
  const id = s('sub');
  if (!id) throw new AuthError('auth/identity-provider', 'Okta ID token has no subject');
  return {
    id,
    email: s('email') ?? '',
    emailVerified: claims.email_verified === true,
    name: s('name') ?? ([s('given_name'), s('family_name')].filter(Boolean).join(' ') || null),
    avatarUrl: s('picture'),
    externalId: null,
  };
}

function tokenSet(res: TokenResponse, previousRefreshToken?: string): OktaTokenSet {
  let expiresAt: number | undefined;
  try {
    const exp = decodeJwt(res.access_token).exp;
    if (typeof exp === 'number') expiresAt = exp * 1000;
  } catch {
    // An opaque access token: fall back to expires_in.
  }
  if (expiresAt === undefined && typeof res.expires_in === 'number') expiresAt = Date.now() + res.expires_in * 1000;
  return {
    accessToken: res.access_token,
    refreshToken: res.refresh_token ?? previousRefreshToken ?? '',
    ...(expiresAt !== undefined ? { expiresAt } : {}),
    ...(res.id_token ? { idToken: res.id_token } : {}),
  };
}

function notSupported(method: string): AuthError {
  return new AuthError('auth/not-supported', `Okta: ${method} is not supported. ${NOT_SUPPORTED[method]}`);
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Okta input');
  return parsed.data;
}
