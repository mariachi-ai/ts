import { decodeJwt } from 'jose';
import { AuthError } from '@mariachi/core';
import { type ProviderAttempt, ProviderError, callProvider, categoryForStatus } from '@mariachi/integrations';
import type {
  AuthorizationUrlInput,
  CodeExchangeInput,
  CreateIdentityUserInput,
  EmailCodeInput,
  EmailDelivery,
  VerifyEmailInput,
  IdentityClient,
  IdentityPendingReason,
  IdentityRequestContext,
  IdentityUser,
  PasswordSignInInput,
  SignInResult,
  SignOutInput,
  TokenSet,
} from '@mariachi/auth';
import { type WorkosOperation, provider } from './generated';
import type { WorkOSDeps } from './provider-fetch';
import type { WorkOSIdentityClientConfig } from './types';

type WorkOSSdk = typeof import('@workos-inc/node');
type WorkOSClient = InstanceType<WorkOSSdk['WorkOS']>;
type WorkOSUser = Awaited<ReturnType<WorkOSClient['userManagement']['getUser']>>;
type AuthenticationResponse = Awaited<ReturnType<WorkOSClient['userManagement']['authenticateWithPassword']>>;

const DEFAULT_API_HOSTNAME = 'api.workos.com';
const PENDING: Record<string, IdentityPendingReason> = {
  email_verification_required: 'email-verification',
  mfa_challenge: 'mfa',
  mfa_enrollment: 'mfa',
  mfa_verification: 'mfa',
  organization_selection_required: 'organization-selection',
  sso_required: 'sso-required',
  radar_email_challenge: 'risk-challenge',
  radar_sms_challenge: 'risk-challenge',
};

/** What the SDK's exceptions carry (`AuthenticationException`, `BadRequestException`, …). */
interface SdkError {
  name?: string;
  status?: number;
  code?: string;
  message?: string;
  error?: string;
  retryAfter?: number | null;
  pendingAuthenticationToken?: string;
  rawData?: { user?: Record<string, unknown>; error?: string; code?: string; email?: string; [key: string]: unknown };
}

/** A failed SDK call as `callProvider` sees it. The SDK's own exception stays inside, for the pending sign-ins it carries. */
class WorkOSCallError extends ProviderError {
  declare readonly sdkError: unknown;
}

/**
 * The SDK's exception as a `ProviderError`: its HTTP status, the category it means, WorkOS's code (`invalid_credentials`,
 * `email_verification_required`) and `Retry-After`. A dropped connection (a `TypeError`) and anything without a
 * status pass through: `callProvider` makes the first `unavailable`, and fails on the rest at once.
 */
function sdkFailure(error: unknown, attempt: ProviderAttempt): unknown {
  const e = error as SdkError | undefined;
  if (typeof e?.status !== 'number') return error;
  attempt.setStatusCode(e.status);
  const category = e.name === 'RateLimitExceededException' ? 'rate-limited' : categoryForStatus(e.status);
  const raw = e.code ?? e.rawData?.code ?? e.rawData?.error ?? e.error;
  const failure = new WorkOSCallError(`${provider.id}/${category}`, `WorkOS answered ${e.status}`, {
    category,
    status: e.status,
    providerCode: typeof raw === 'string' && /^[a-z][a-z0-9_]*$/.test(raw) ? raw : undefined,
    retryAfterMs: typeof e.retryAfter === 'number' && e.retryAfter >= 0 ? Math.min(300_000, e.retryAfter * 1000) : undefined,
  });
  Object.defineProperty(failure, 'sdkError', { value: error, enumerable: false });
  return failure;
}

/** The SDK's own exception behind a failed call, or the failure itself when there's none (WorkOS couldn't be reached). */
function sdkError(error: unknown): SdkError | undefined {
  return (error instanceof WorkOSCallError ? error.sdkError : error) as SdkError | undefined;
}

/** The category of a failed call, for the `AuthError`'s metadata. */
function categoryOf(error: unknown): { category?: string } {
  return error instanceof ProviderError ? { category: error.category } : {};
}

/** Ids in a pending sign-in's raw data the app needs to finish it, camel-cased. */
const PROVIDER_DATA: Record<string, string> = {
  email_verification_id: 'emailVerificationId',
  authentication_challenge_id: 'authenticationChallengeId',
  radar_challenge_id: 'radarChallengeId',
};

function toUser(u: WorkOSUser): IdentityUser {
  const name = u.name ?? ([u.firstName, u.lastName].filter(Boolean).join(' ') || null);
  return {
    id: u.id,
    email: u.email,
    emailVerified: u.emailVerified === true,
    name,
    avatarUrl: u.profilePictureUrl ?? null,
    externalId: u.externalId ?? null,
  };
}

/** The user in an `AuthenticationException`'s raw (snake_case) data. */
function rawUser(raw: Record<string, unknown> | undefined): IdentityUser | undefined {
  if (!raw || typeof raw.id !== 'string' || typeof raw.email !== 'string') return undefined;
  const s = (k: string) => (typeof raw[k] === 'string' ? (raw[k] as string) : null);
  return {
    id: raw.id,
    email: raw.email,
    emailVerified: raw.email_verified === true,
    name: s('name') ?? ([s('first_name'), s('last_name')].filter(Boolean).join(' ') || null),
    avatarUrl: s('profile_picture_url'),
    externalId: s('external_id'),
  };
}

/**
 * `sid` and `exp` from an access token WorkOS just returned to us over TLS. Read, not verified:
 * the token is the API's own reply, and `AuthProvider.verify` checks every token a client sends.
 */
function tokens(res: { accessToken: string; refreshToken: string }): TokenSet {
  let sessionId: string | undefined;
  let expiresAt: number | undefined;
  try {
    const claims = decodeJwt(res.accessToken);
    if (typeof claims.sid === 'string') sessionId = claims.sid;
    if (typeof claims.exp === 'number') expiresAt = claims.exp * 1000;
  } catch {
    // An opaque access token: no session id or expiry to report.
  }
  return { accessToken: res.accessToken, refreshToken: res.refreshToken, sessionId, expiresAt };
}

/**
 * `IdentityClient` on the WorkOS User Management API, for a headless sign-in (the app's own
 * pages). Every call is server-side with the environment's API key. `@workos-inc/node` is an
 * optional peer, loaded on first use.
 *
 * Every SDK call goes through `callProvider`: one CLIENT span (`workos authenticate.password`,
 * `workos users.get`), metrics, and the retries, which the SDK's own are turned off for. A POST
 * is retried only when WorkOS rate limited it. The port's methods carry no context, so the spans
 * have no tenant.
 */
export class WorkOSIdentityClient implements IdentityClient {
  readonly provider = 'workos';

  private sdk: Promise<WorkOSClient> | null = null;
  private readonly host: string;

  constructor(
    private readonly config: WorkOSIdentityClientConfig,
    /** An SDK client to use instead of loading one (tests). */
    client?: WorkOSClient,
    /** The tracer and metrics for the calls, from the container. Without them, spans go through `@opentelemetry/api` when it's installed. */
    private readonly deps: WorkOSDeps = {},
  ) {
    if (!config.apiKey) throw new AuthError('auth/invalid-config', 'WorkOS: `apiKey` is required');
    if (!config.clientId) throw new AuthError('auth/invalid-config', 'WorkOS: `clientId` is required');
    this.host = config.apiHostname ?? DEFAULT_API_HOSTNAME;
    if (client) this.sdk = Promise.resolve(client);
  }

  private client(): Promise<WorkOSClient> {
    this.sdk ??= import('@workos-inc/node').then(
      ({ WorkOS }) =>
        new WorkOS(this.config.apiKey, {
          clientId: this.config.clientId,
          // callProvider retries, so each call is one span with its attempts
          maxRetries: 0,
          ...(this.config.apiHostname ? { apiHostname: this.config.apiHostname } : {}),
        }),
      () => {
        this.sdk = null;
        throw new AuthError(
          'auth/invalid-config',
          'WorkOSIdentityClient requires the optional peer dependency "@workos-inc/node". Install it with: pnpm add @workos-inc/node',
        );
      },
    );
    return this.sdk;
  }

  /** One SDK call through `callProvider`. `unsafe`: not to be repeated after an outage (a POST that creates or spends something). */
  private async call<T>(operation: WorkosOperation, method: 'GET' | 'POST' | 'PUT' | 'DELETE', fn: (w: WorkOSClient) => Promise<T>, unsafe = method === 'POST'): Promise<T> {
    const w = await this.client();
    return callProvider(
      null,
      { integration: provider.id, operation, category: provider.category, server: this.host, method },
      async (attempt) => {
        try {
          return await fn(w);
        } catch (error) {
          throw sdkFailure(error, attempt);
        }
      },
      { ...this.deps, retry: { unsafe, ...this.deps.retry } },
    );
  }

  /** Turns the SDK's exceptions into a pending sign-in or an `AuthError`. */
  private failure(error: unknown, refused: 'auth/invalid-credentials' | 'auth/invalid-grant'): SignInResult {
    const e = sdkError(error);
    if (e?.name === 'AuthenticationException') {
      const code = e.code ?? e.rawData?.code ?? e.rawData?.error ?? '';
      const reason = PENDING[code];
      if (reason) {
        const providerData: Record<string, string> = {};
        for (const [raw, name] of Object.entries(PROVIDER_DATA)) {
          const value = e.rawData?.[raw];
          if (typeof value === 'string') providerData[name] = value;
        }
        const user = rawUser(e.rawData?.user);
        const email = typeof e.rawData?.email === 'string' ? e.rawData.email : user?.email;
        return {
          status: 'pending',
          reason,
          ...(e.pendingAuthenticationToken ? { pendingToken: e.pendingAuthenticationToken } : {}),
          ...(user ? { user } : {}),
          ...(email ? { email } : {}),
          ...(Object.keys(providerData).length ? { providerData } : {}),
        };
      }
    }
    throw this.error(error, refused);
  }

  private error(error: unknown, refused: 'auth/invalid-credentials' | 'auth/invalid-grant'): AuthError {
    if (error instanceof AuthError) return error;
    const e = sdkError(error);
    const meta = { status: e?.status, code: e?.code, ...categoryOf(error) };
    if (e?.name === 'RateLimitExceededException' || e?.status === 429) {
      return new AuthError('auth/rate-limited', 'WorkOS rate limit reached', meta);
    }
    if (e?.status && [400, 401, 403, 422].includes(e.status)) {
      return new AuthError(refused, `WorkOS refused the request: ${e.message ?? e.code ?? e.status}`, meta);
    }
    return new AuthError('auth/identity-provider', `WorkOS request failed: ${e?.message ?? String(error)}`, meta);
  }

  async signInWithPassword(input: PasswordSignInInput): Promise<SignInResult> {
    let res: AuthenticationResponse;
    try {
      res = await this.call('authenticate.password', 'POST', (w) =>
        w.userManagement.authenticateWithPassword({
          clientId: this.config.clientId,
          email: input.email,
          password: input.password,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        }),
      );
    } catch (error) {
      return this.failure(error, 'auth/invalid-credentials');
    }
    return { status: 'signed-in', user: toUser(res.user), tokens: tokens(res) };
  }

  authorizationUrl(input: AuthorizationUrlInput): string {
    const names = { google: 'GoogleOAuth', github: 'GitHubOAuth', ...this.config.providerNames };
    const url = new URL(`https://${this.host}/user_management/authorize`);
    url.searchParams.set('client_id', this.config.clientId);
    url.searchParams.set('redirect_uri', input.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('provider', names[input.provider]);
    url.searchParams.set('state', input.state);
    url.searchParams.set('code_challenge', input.codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    if (input.loginHint) url.searchParams.set('login_hint', input.loginHint);
    return url.toString();
  }

  async exchangeCode(input: CodeExchangeInput): Promise<SignInResult> {
    let res: AuthenticationResponse;
    try {
      res = await this.call('authenticate.code', 'POST', (w) =>
        w.userManagement.authenticateWithCodeAndVerifier({
          clientId: this.config.clientId,
          code: input.code,
          codeVerifier: input.codeVerifier,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        }),
      );
    } catch (error) {
      return this.failure(error, 'auth/invalid-grant');
    }
    return { status: 'signed-in', user: toUser(res.user), tokens: tokens(res) };
  }

  async refresh(refreshToken: string, context: IdentityRequestContext = {}): Promise<TokenSet> {
    try {
      const res = await this.call('authenticate.refreshToken', 'POST', (w) =>
        w.userManagement.authenticateWithRefreshToken({
          clientId: this.config.clientId,
          refreshToken,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        }),
      );
      return tokens(res);
    } catch (error) {
      throw this.error(error, 'auth/invalid-grant');
    }
  }

  async signOut(input: SignOutInput): Promise<void> {
    const { sessionId } = input;
    if (!sessionId) return; // WorkOS revokes sessions by id; a refresh token alone names none.
    try {
      // Revoking a session twice is the same as once
      await this.call('sessions.revoke', 'POST', (w) => w.userManagement.revokeSession({ sessionId }), false);
    } catch (error) {
      if (sdkError(error)?.status === 404) return; // Already gone.
      throw this.error(error, 'auth/invalid-grant');
    }
  }

  async getUser(id: string): Promise<IdentityUser | null> {
    try {
      return toUser(await this.call('users.get', 'GET', (w) => w.userManagement.getUser(id)));
    } catch (error) {
      if (sdkError(error)?.status === 404) return null;
      throw this.error(error, 'auth/invalid-grant');
    }
  }

  async findUserByEmail(email: string): Promise<IdentityUser | null> {
    try {
      const page = await this.call('users.list', 'GET', (w) => w.userManagement.listUsers({ email, limit: 1 }));
      const match = page.data.find((u) => u.email.toLowerCase() === email.toLowerCase());
      return match ? toUser(match) : null;
    } catch (error) {
      throw this.error(error, 'auth/invalid-grant');
    }
  }

  async createUser(input: CreateIdentityUserInput): Promise<IdentityUser> {
    try {
      const created = await this.call('users.create', 'POST', (w) =>
        w.userManagement.createUser({
          email: input.email,
          emailVerified: input.emailVerified,
          password: input.password,
          name: input.name,
          externalId: input.externalId,
        }),
      );
      return toUser(created);
    } catch (error) {
      throw this.error(error, 'auth/invalid-grant');
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.call('users.delete', 'DELETE', (w) => w.userManagement.deleteUser(id));
    } catch (error) {
      if (sdkError(error)?.status === 404) return;
      throw this.error(error, 'auth/invalid-grant');
    }
  }

  private get appSendsEmails(): boolean {
    return (this.config.emailsSentBy ?? 'app') === 'app';
  }

  private async signedIn(call: () => Promise<AuthenticationResponse>, refused: 'auth/invalid-credentials' | 'auth/invalid-grant'): Promise<SignInResult> {
    let res: AuthenticationResponse;
    try {
      res = await call();
    } catch (error) {
      return this.failure(error, refused);
    }
    return { status: 'signed-in', user: toUser(res.user), tokens: tokens(res) };
  }

  async sendPasswordReset(email: string): Promise<EmailDelivery<{ token: string; url?: string; expiresAt?: number }>> {
    try {
      const reset = await this.call('passwordResets.create', 'POST', (w) => w.userManagement.createPasswordReset({ email }));
      if (!this.appSendsEmails) return { deliveredBy: 'provider' };
      return { deliveredBy: 'app', token: reset.passwordResetToken, url: reset.passwordResetUrl, expiresAt: Date.parse(reset.expiresAt) || undefined };
    } catch (error) {
      if (sdkError(error)?.status === 404) return { deliveredBy: 'nobody' }; // answered as for an account
      throw this.error(error, 'auth/invalid-grant');
    }
  }

  async resetPassword(input: { token: string; password: string }): Promise<IdentityUser> {
    try {
      const { user } = await this.call('passwordResets.confirm', 'POST', (w) => w.userManagement.resetPassword({ token: input.token, newPassword: input.password }));
      return toUser(user);
    } catch (error) {
      // A used or unknown token is a 404 (`password_reset_token_not_found`), not a failure of WorkOS.
      const e = sdkError(error);
      if (e?.status === 404) throw new AuthError('auth/invalid-grant', 'WorkOS refused the reset: the token is used or unknown', { status: 404, code: e.code, ...categoryOf(error) });
      throw this.error(error, 'auth/invalid-grant');
    }
  }

  async setPassword(userId: string, password: string): Promise<void> {
    try {
      await this.call('users.update', 'PUT', (w) => w.userManagement.updateUser({ userId, password }));
    } catch (error) {
      throw this.error(error, 'auth/invalid-grant');
    }
  }

  async startEmailCode(email: string, context: IdentityRequestContext = {}): Promise<EmailDelivery<{ code: string; expiresAt?: number }>> {
    try {
      const magic = await this.call('magicAuth.create', 'POST', (w) => w.userManagement.createMagicAuth({ email, ipAddress: context.ipAddress, userAgent: context.userAgent }));
      if (!this.appSendsEmails) return { deliveredBy: 'provider' };
      return { deliveredBy: 'app', code: magic.code, expiresAt: Date.parse(magic.expiresAt) || undefined };
    } catch (error) {
      throw this.error(error, 'auth/invalid-grant');
    }
  }

  async signInWithEmailCode(input: EmailCodeInput): Promise<SignInResult> {
    return this.signedIn(
      () =>
        this.call('authenticate.magicAuth', 'POST', (w) =>
          w.userManagement.authenticateWithMagicAuth({ clientId: this.config.clientId, email: input.email, code: input.code, ipAddress: input.ipAddress, userAgent: input.userAgent }),
        ),
      'auth/invalid-grant',
    );
  }

  async pendingVerificationCode(pending: Extract<SignInResult, { status: 'pending' }>): Promise<string> {
    const id = pending.providerData?.emailVerificationId;
    if (pending.reason !== 'email-verification' || !id) {
      throw new AuthError('auth/not-supported', 'No email verification is pending for this sign-in');
    }
    try {
      return (await this.call('emailVerifications.get', 'GET', (w) => w.userManagement.getEmailVerification(id))).code;
    } catch (error) {
      throw this.error(error, 'auth/invalid-grant');
    }
  }

  async verifyEmailAndSignIn(input: VerifyEmailInput): Promise<SignInResult> {
    return this.signedIn(
      () =>
        this.call('authenticate.emailVerification', 'POST', (w) =>
          w.userManagement.authenticateWithEmailVerification({
            clientId: this.config.clientId,
            code: input.code,
            pendingAuthenticationToken: input.pendingToken,
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
          }),
        ),
      'auth/invalid-grant',
    );
  }
}
