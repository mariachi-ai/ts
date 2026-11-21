import { decodeJwt } from 'jose';
import { AuthError, fromZodError } from '@mariachi/core';
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
import { type ProviderRequest, providerRequest } from '@mariachi/integrations';
import { z } from 'zod';
import { type CognitoAdminClient, cognitoAdmin } from './admin';
import { CognitoError } from './errors';
import { type CognitoConfig, type CognitoOperation, configSchema, provider } from './generated';
import { type AuthenticationResult, CognitoUser, CreateUserResponse, InitiateAuthResponse, ListUsersResponse, TokenResponse } from './schemas';
import { cognitoSecretHash } from './secret-hash';
import { type CognitoDeps, domainOrigin, failure, idpHost, toAuthError } from './shared';

export interface CognitoIdentityClientConfig extends CognitoConfig {
  /** OAuth scopes for managed login. Default `openid email profile` (`openid` is what returns an ID token). */
  scopes?: string[];
  /**
   * The `identity_provider` names for social sign-in, as they appear in the user pool. Default `Google` for google;
   * GitHub isn't one of Cognito's social providers, so `github` works only once it's added as an OIDC provider and
   * named here.
   */
  identityProviders?: Partial<Record<'google' | 'github', string>>;
  /** A custom attribute that holds the app's own id for the user, such as `custom:external_id`. */
  externalIdAttribute?: string;
}

export interface CognitoIdentityDeps extends CognitoDeps {
  /** A `CognitoIdentityProviderClient` to use for the admin calls instead of making one (tests, or a client of your own). */
  adminClient?: CognitoAdminClient;
}

/** Cognito's tokens, with the ID token kept: the port's `TokenSet` has no place for it. */
export interface CognitoTokenSet extends TokenSet {
  idToken?: string;
}

/** Challenges that are a second factor: answered with RespondToAuthChallenge, `Session` as the pending token. */
const MFA_CHALLENGES = new Set(['SMS_MFA', 'SOFTWARE_TOKEN_MFA', 'EMAIL_OTP', 'MFA_SETUP', 'SELECT_MFA_TYPE']);

const Email = z.string().trim().min(1).max(256);
const PasswordInput = z.object({ email: Email, password: z.string().min(1).max(256), ipAddress: z.string().optional(), userAgent: z.string().optional() });
const CodeInput = z.object({ code: z.string().min(1), codeVerifier: z.string().min(43).max(128), redirectUri: z.string().url() });
const CreateInput = z.object({ email: Email, emailVerified: z.boolean(), password: z.string().min(1).max(256).optional(), name: z.string().min(1).max(2048).optional(), externalId: z.string().min(1).optional() });
const Id = z.string().min(1).max(128);

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Cognito input');
  return parsed.data;
}

/**
 * `IdentityClient` on an Amazon Cognito user pool, server-side:
 *
 * - **managed login** (the hosted UI): `authorizationUrl` with PKCE, `exchangeCode`, `refresh` and `signOut` at the
 *   pool's domain (`COGNITO_DOMAIN`), and `logoutUrl` to end the managed login session in the browser;
 * - **password sign-in** from the app's own page: InitiateAuth `USER_PASSWORD_AUTH`, which the app client must allow;
 * - **users** through the admin API (AdminGetUser, ListUsers, AdminCreateUser, AdminSetUserPassword, AdminDeleteUser),
 *   signed by `@aws-sdk/client-cognito-identity-provider`, an optional peer loaded on first use.
 *
 * Users are identified by `sub`. The pool signs users in by email (email as the username attribute). Every call goes
 * through `callProvider` with a null context (the port has none): one span each, `cognito auth.initiate`. Failures are
 * the port's `AuthError`s. Password resets and email codes are Cognito's own flows and aren't offered here.
 */
export class CognitoIdentityClient implements IdentityClient {
  readonly provider = 'cognito';

  private readonly cfg: CognitoConfig;
  private readonly host: string;
  private readonly origin?: string;
  private readonly admin: ReturnType<typeof cognitoAdmin>;

  constructor(
    private readonly config: CognitoIdentityClientConfig,
    private readonly deps: CognitoIdentityDeps = {},
  ) {
    const parsed = configSchema.safeParse(config);
    if (!parsed.success) throw new AuthError('auth/invalid-config', `Cognito: ${parsed.error.issues.map((i) => `\`${i.path.join('.')}\` ${i.message}`).join('; ')}`);
    this.cfg = parsed.data;
    this.host = idpHost(this.cfg.region);
    this.origin = this.cfg.domain ? domainOrigin(this.cfg.domain) : undefined;
    this.admin = cognitoAdmin(this.cfg, deps);
  }

  // ── Calls ──────────────────────────────────────────────────────────────

  /** One unsigned call to the user pool's JSON API (`X-Amz-Target`). */
  private api<T>(operation: CognitoOperation, target: string, json: object, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
    return providerRequest(
      null,
      { integration: provider.id, operation, category: provider.category, server: this.host },
      { method: 'POST', url: `https://${this.host}/`, headers: { 'content-type': 'application/x-amz-json-1.1', 'x-amz-target': `AWSCognitoIdentityProviderService.${target}` }, json },
      { schema, error: CognitoError, failure, deps: this.deps },
    );
  }

  /** One call to the pool domain's OAuth endpoints, with the client secret as Basic auth when there is one. */
  private oauth<T>(operation: CognitoOperation, path: string, form: Record<string, string>, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
    const origin = this.domain(operation);
    const secret = this.cfg.clientSecret;
    const request: ProviderRequest = {
      method: 'POST',
      url: `${origin}${path}`,
      // A public client names itself in the body; a confidential one in the Authorization header
      form: secret ? form : { ...form, client_id: this.cfg.clientId },
      ...(secret ? { headers: { authorization: `Basic ${Buffer.from(`${this.cfg.clientId}:${secret}`).toString('base64')}` } } : {}),
    };
    return providerRequest(null, { integration: provider.id, operation, category: provider.category, server: new URL(origin).host }, request, { schema, error: CognitoError, failure, deps: this.deps });
  }

  private domain(what: string): string {
    if (!this.origin) throw new AuthError('auth/invalid-config', `Cognito: ${what} needs the user pool's domain (COGNITO_DOMAIN)`);
    return this.origin;
  }

  // ── Sign-in ────────────────────────────────────────────────────────────

  async signInWithPassword(input: PasswordSignInInput): Promise<SignInResult> {
    const i = parse(PasswordInput, input);
    let res: z.infer<typeof InitiateAuthResponse>;
    try {
      res = await this.api(
        'auth.initiate',
        'InitiateAuth',
        {
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: this.cfg.clientId,
          AuthParameters: {
            USERNAME: i.email,
            PASSWORD: i.password,
            ...(this.cfg.clientSecret ? { SECRET_HASH: cognitoSecretHash(i.email, this.cfg.clientId, this.cfg.clientSecret) } : {}),
          },
          ...(i.ipAddress ? { UserContextData: { IpAddress: i.ipAddress } } : {}),
        },
        InitiateAuthResponse,
      );
    } catch (error) {
      // Signed up but not confirmed: Cognito sent a code; the app confirms it with Cognito's ConfirmSignUp
      if (error instanceof CognitoError && error.providerCode === 'UserNotConfirmedException') return { status: 'pending', reason: 'email-verification', email: i.email };
      throw toAuthError(error, 'auth/invalid-credentials');
    }
    if (res.AuthenticationResult) return this.signedIn(tokensOf(res.AuthenticationResult));
    const challenge = res.ChallengeName ?? '';
    if (MFA_CHALLENGES.has(challenge)) {
      const username = res.ChallengeParameters?.USER_ID_FOR_SRP;
      return {
        status: 'pending',
        reason: 'mfa',
        email: i.email,
        ...(res.Session ? { pendingToken: res.Session } : {}),
        providerData: { challengeName: challenge, ...(username ? { username } : {}) },
      };
    }
    throw new AuthError('auth/not-supported', `Cognito asked for the ${challenge || 'unknown'} challenge, which this client doesn't answer`, { challengeName: challenge });
  }

  authorizationUrl(input: AuthorizationUrlInput): string {
    const url = new URL('/oauth2/authorize', this.domain('authorizationUrl'));
    const idp = { google: 'Google', ...this.config.identityProviders }[input.provider];
    if (!idp) throw new AuthError('auth/invalid-config', `Cognito: name the user pool's identity provider for ${input.provider} in \`identityProviders\``);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.cfg.clientId);
    url.searchParams.set('redirect_uri', input.redirectUri);
    url.searchParams.set('state', input.state);
    url.searchParams.set('scope', (this.config.scopes ?? ['openid', 'email', 'profile']).join(' '));
    url.searchParams.set('identity_provider', idp);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('code_challenge', input.codeChallenge);
    if (input.loginHint) url.searchParams.set('login_hint', input.loginHint);
    return url.toString();
  }

  async exchangeCode(input: CodeExchangeInput): Promise<SignInResult> {
    const i = parse(CodeInput, input);
    let res: TokenResponse;
    try {
      res = await this.oauth('tokens.exchange', '/oauth2/token', { grant_type: 'authorization_code', code: i.code, code_verifier: i.codeVerifier, redirect_uri: i.redirectUri }, TokenResponse);
    } catch (error) {
      throw toAuthError(error, 'auth/invalid-grant');
    }
    return this.signedIn({ accessToken: res.access_token, idToken: res.id_token, refreshToken: res.refresh_token ?? '', expiresIn: res.expires_in });
  }

  /** New tokens. Cognito returns a new refresh token only when the app client rotates them; otherwise the old one stays. */
  async refresh(refreshToken: string, _context?: IdentityRequestContext): Promise<CognitoTokenSet> {
    const token = parse(z.string().min(1), refreshToken);
    try {
      const res = await this.oauth('tokens.refresh', '/oauth2/token', { grant_type: 'refresh_token', refresh_token: token }, TokenResponse);
      return tokenSet({ accessToken: res.access_token, idToken: res.id_token, refreshToken: res.refresh_token ?? token, expiresIn: res.expires_in });
    } catch (error) {
      throw toAuthError(error, 'auth/invalid-grant');
    }
  }

  /**
   * Revokes the refresh token and the access tokens issued with it (`/oauth2/revoke`). Without a refresh token, does
   * nothing: Cognito ends sessions by token. To end the managed login session in the browser too, send it to `logoutUrl`.
   */
  async signOut(input: SignOutInput): Promise<void> {
    if (!input.refreshToken) return;
    try {
      await this.oauth('tokens.revoke', '/oauth2/revoke', { token: input.refreshToken }, z.unknown());
    } catch (error) {
      throw toAuthError(error, 'auth/invalid-grant');
    }
  }

  /** Where to send the browser to end its managed login session; `logoutUri` must be one of the app client's sign-out URLs. */
  logoutUrl(input: { logoutUri: string }): string {
    const url = new URL('/logout', this.domain('logoutUrl'));
    url.searchParams.set('client_id', this.cfg.clientId);
    url.searchParams.set('logout_uri', input.logoutUri);
    return url.toString();
  }

  /** The user from the ID token Cognito just returned over TLS (read, not verified: `AuthProvider.verify` checks what clients send). */
  private async signedIn(t: RawTokens): Promise<SignInResult> {
    const tokens = tokenSet(t);
    const claims = t.idToken ? decodeJwt(t.idToken) : undefined;
    const user = claims ? this.toUser(claims as Record<string, unknown>) : await this.getUser(String(decodeJwt(t.accessToken).sub ?? ''));
    if (!user) throw new AuthError('auth/identity-provider', 'Cognito returned tokens for a user it then could not find');
    return { status: 'signed-in', user, tokens };
  }

  // ── Users ──────────────────────────────────────────────────────────────

  /** The user with this `sub`, or null. */
  async getUser(id: string): Promise<IdentityUser | null> {
    const sub = parse(Id, id);
    try {
      const user = await this.findCognitoUser(sub);
      return user ? this.toUser(attributes(user)) : null;
    } catch (error) {
      throw toAuthError(error, 'auth/invalid-grant');
    }
  }

  async findUserByEmail(email: string): Promise<IdentityUser | null> {
    const address = parse(Email, email);
    try {
      const page = await this.admin('users.list', 'ListUsersCommand', { UserPoolId: this.cfg.userPoolId, Filter: `email = ${quoted(address)}`, Limit: 10 }, ListUsersResponse);
      const match = page.Users.map(attributes).find((a) => typeof a.email === 'string' && a.email.toLowerCase() === address.toLowerCase());
      return match ? this.toUser(match) : null;
    } catch (error) {
      throw toAuthError(error, 'auth/invalid-grant');
    }
  }

  /**
   * Creates the user with their email as the username, without Cognito's invitation email. With a password it's set
   * permanent (AdminSetUserPassword), so the user signs in with it straight away; without one, they sign in through a
   * social provider or Cognito's forgot-password flow.
   */
  async createUser(input: CreateIdentityUserInput): Promise<IdentityUser> {
    const i = parse(CreateInput, input);
    if (i.externalId && !this.config.externalIdAttribute) {
      throw new AuthError('auth/invalid-config', 'Cognito: storing `externalId` needs `externalIdAttribute`, a custom attribute such as custom:external_id');
    }
    const attrs = [
      { Name: 'email', Value: i.email },
      ...(i.emailVerified ? [{ Name: 'email_verified', Value: 'true' }] : []),
      ...(i.name ? [{ Name: 'name', Value: i.name }] : []),
      ...(i.externalId && this.config.externalIdAttribute ? [{ Name: this.config.externalIdAttribute, Value: i.externalId }] : []),
    ];
    try {
      const { User } = await this.admin('users.create', 'AdminCreateUserCommand', { UserPoolId: this.cfg.userPoolId, Username: i.email, MessageAction: 'SUPPRESS', UserAttributes: attrs }, CreateUserResponse);
      if (i.password) await this.admin('users.setPassword', 'AdminSetUserPasswordCommand', { UserPoolId: this.cfg.userPoolId, Username: User.Username, Password: i.password, Permanent: true }, z.unknown());
      return this.toUser(attributes(User));
    } catch (error) {
      throw toAuthError(error, 'auth/invalid-grant');
    }
  }

  async deleteUser(id: string): Promise<void> {
    const sub = parse(Id, id);
    try {
      const user = await this.findCognitoUser(sub);
      if (!user) return;
      await this.admin('users.delete', 'AdminDeleteUserCommand', { UserPoolId: this.cfg.userPoolId, Username: user.Username }, z.unknown());
    } catch (error) {
      if (error instanceof CognitoError && error.providerCode === 'UserNotFoundException') return; // already gone
      throw toAuthError(error, 'auth/invalid-grant');
    }
  }

  async setPassword(userId: string, password: string): Promise<void> {
    const sub = parse(Id, userId);
    const pw = parse(z.string().min(1).max(256), password);
    try {
      const user = await this.findCognitoUser(sub);
      if (!user) throw new AuthError('auth/invalid-grant', 'Cognito has no user with this id');
      await this.admin('users.setPassword', 'AdminSetUserPasswordCommand', { UserPoolId: this.cfg.userPoolId, Username: user.Username, Password: pw, Permanent: true }, z.unknown());
    } catch (error) {
      throw toAuthError(error, 'auth/invalid-grant');
    }
  }

  /**
   * A user by `sub`. AdminGetUser takes a local user's `sub` as its username; a federated user's username is the
   * provider's (`Google_1234…`), so a miss is looked up by `sub` with ListUsers.
   */
  private async findCognitoUser(sub: string): Promise<CognitoUser | null> {
    try {
      return await this.admin('users.get', 'AdminGetUserCommand', { UserPoolId: this.cfg.userPoolId, Username: sub }, CognitoUser);
    } catch (error) {
      if (!(error instanceof CognitoError && error.providerCode === 'UserNotFoundException')) throw error;
    }
    const page = await this.admin('users.list', 'ListUsersCommand', { UserPoolId: this.cfg.userPoolId, Filter: `sub = ${quoted(sub)}`, Limit: 1 }, ListUsersResponse);
    return page.Users[0] ?? null;
  }

  /** An `IdentityUser` from ID token claims or a user's attributes (the same names). */
  private toUser(a: Record<string, unknown>): IdentityUser {
    const s = (k: string) => (typeof a[k] === 'string' && a[k] ? (a[k] as string) : null);
    const id = s('sub');
    if (!id) throw new AuthError('auth/identity-provider', 'Cognito returned a user without a sub');
    return {
      id,
      email: s('email') ?? '',
      // Cognito's own answer: true once the user proved the inbox (a code, a link) or an admin or trigger set it
      emailVerified: a.email_verified === true || a.email_verified === 'true',
      name: s('name') ?? ([s('given_name'), s('family_name')].filter(Boolean).join(' ') || null),
      avatarUrl: s('picture'),
      externalId: this.config.externalIdAttribute ? s(this.config.externalIdAttribute) : null,
    };
  }

  // ── Not offered ────────────────────────────────────────────────────────

  async sendPasswordReset(_email: string): Promise<EmailDelivery<{ token: string; url?: string; expiresAt?: number }>> {
    throw notSupported("password resets (Cognito's ForgotPassword and ConfirmForgotPassword, or managed login)");
  }

  async resetPassword(_input: { token: string; password: string }): Promise<IdentityUser> {
    throw notSupported("password resets (Cognito's ForgotPassword and ConfirmForgotPassword, or managed login)");
  }

  async startEmailCode(_email: string, _context?: IdentityRequestContext): Promise<EmailDelivery<{ code: string; expiresAt?: number }>> {
    throw notSupported("email codes (Cognito's passwordless USER_AUTH flow, or managed login)");
  }

  async signInWithEmailCode(_input: EmailCodeInput): Promise<SignInResult> {
    throw notSupported("email codes (Cognito's passwordless USER_AUTH flow, or managed login)");
  }

  async pendingVerificationCode(_pending: Extract<SignInResult, { status: 'pending' }>): Promise<string> {
    throw notSupported('reading a verification code: Cognito emails it itself');
  }

  async verifyEmailAndSignIn(_input: VerifyEmailInput): Promise<SignInResult> {
    throw notSupported("confirming a sign-up (Cognito's ConfirmSignUp), then signInWithPassword");
  }
}

interface RawTokens {
  accessToken: string;
  idToken?: string;
  refreshToken: string;
  expiresIn?: number;
}

function tokensOf(r: AuthenticationResult): RawTokens {
  return { accessToken: r.AccessToken, idToken: r.IdToken, refreshToken: r.RefreshToken ?? '', expiresIn: r.ExpiresIn };
}

/** The port's token set, with the access token's expiry (its `exp`, read: Cognito just returned it). */
function tokenSet(t: RawTokens): CognitoTokenSet {
  let expiresAt: number | undefined;
  try {
    const exp = decodeJwt(t.accessToken).exp;
    if (typeof exp === 'number') expiresAt = exp * 1000;
  } catch {
    if (t.expiresIn) expiresAt = Date.now() + t.expiresIn * 1000;
  }
  return { accessToken: t.accessToken, refreshToken: t.refreshToken, ...(t.idToken ? { idToken: t.idToken } : {}), ...(expiresAt ? { expiresAt } : {}) };
}

/** A user's attributes by name (plus `sub` and `username`). */
function attributes(user: CognitoUser): Record<string, unknown> {
  const out: Record<string, unknown> = { username: user.Username };
  for (const a of [...(user.Attributes ?? []), ...(user.UserAttributes ?? [])]) if (a.Value !== undefined) out[a.Name] = a.Value;
  return out;
}

/** A ListUsers filter value: in double quotes, with quotes and backslashes escaped. */
function quoted(value: string): string {
  return `"${value.replace(/[\\"]/g, (c) => `\\${c}`)}"`;
}

function notSupported(what: string): AuthError {
  return new AuthError('auth/not-supported', `CognitoIdentityClient doesn't offer ${what}`);
}
