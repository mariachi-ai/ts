import { AuthError, type Context, fromZodError } from '@mariachi/core';
import {
  type FailureInfo,
  type ProviderDeps,
  type ProviderRequest,
  callProvider,
  categoryForStatus,
  mappedFailure,
  parseRetryAfter,
  providerRequest,
} from '@mariachi/integrations';
import { SignJWT, importPKCS8 } from 'jose';
import type { z } from 'zod';
import { FirebaseError } from './errors';
import { type FirebaseOperation, errorMap, operations, provider } from './generated';
import {
  AccessTokenResponse,
  Email,
  KeySet,
  LookupResponse,
  OobCodeResponse,
  RefreshResponse,
  ResetPasswordResponse,
  ServiceAccount,
  SignInResponse,
  type UserInfo,
} from './schemas';

/** Where Firebase publishes the keys its ID tokens are signed with, as JWKs. */
export const FIREBASE_KEYS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const SECURE_TOKEN_URL = 'https://securetoken.googleapis.com/v1/token';
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
/** The narrower of the two scopes the Identity Toolkit admin methods accept (the other is cloud-platform). */
const ADMIN_SCOPE = 'https://www.googleapis.com/auth/identitytoolkit';
/** An access token is fetched again this long before it expires. */
const TOKEN_MARGIN_MS = 5 * 60_000;
/** When the keys' answer has no max-age. */
const DEFAULT_KEYS_MAX_AGE_MS = 60 * 60_000;

export interface FirebaseDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

export interface FirebaseApiConfig {
  projectId: string;
  apiKey?: string;
  serviceAccountJson?: string;
}

/** The service account key, checked: right shape, and the configured project's own. */
export function parseServiceAccount(json: string, projectId: string): ServiceAccount {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new AuthError('auth/invalid-config', 'Firebase: FIREBASE_SERVICE_ACCOUNT_JSON is not JSON; set it to the whole key file');
  }
  const parsed = ServiceAccount.safeParse(raw);
  if (!parsed.success) {
    throw new AuthError('auth/invalid-config', `Firebase: FIREBASE_SERVICE_ACCOUNT_JSON is not a service account key file (${parsed.error.issues.map((i) => i.path.join('.')).join(', ')})`);
  }
  // Test and production are separate projects: a key from the other one is a mix-up, not a choice.
  if (parsed.data.project_id !== projectId) {
    throw new AuthError('auth/invalid-config', 'Firebase: the service account key belongs to another project than FIREBASE_PROJECT_ID');
  }
  return parsed.data;
}

/**
 * Firebase's REST APIs, one span per call (`firebase accounts.signInWithPassword`). Each operation
 * takes `ctx` first; the auth port's `IdentityClient` and `AuthProvider` have none to give, so they
 * pass `null`. Internal: apps use `createFirebaseAuth` and `createFirebaseIdentityClient`.
 */
export function createFirebaseApi(config: FirebaseApiConfig, deps: FirebaseDeps = {}) {
  const projectId = config.projectId;
  const serviceAccount = config.serviceAccountJson ? parseServiceAccount(config.serviceAccountJson, projectId) : undefined;
  const doFetch = deps.fetch ?? fetch;
  const project = `/projects/${encodeURIComponent(projectId)}`;

  function call<T>(ctx: Context | null, operation: FirebaseOperation, request: Omit<ProviderRequest, 'method'>, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
    // A call Firebase can't recognise as a repeat (a sign-in, a sign-up, an email sent) is made once.
    const once = operations[operation].idempotency === 'none';
    return providerRequest(
      ctx,
      { integration: provider.id, operation, category: provider.category, server: new URL(request.url).host },
      { method: 'POST', ...request },
      { schema, error: FirebaseError, failure, deps: once ? { ...deps, retry: { ...deps.retry, attempts: 1 } } : deps },
    );
  }

  /** A call with the web API key. */
  function publicCall<T>(ctx: Context | null, operation: FirebaseOperation, path: string, json: unknown, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
    if (!config.apiKey) throw new AuthError('auth/invalid-config', 'Firebase: set FIREBASE_API_KEY (the web API key) for sign-in calls');
    return call(ctx, operation, { url: `${provider.baseUrl}${path}`, query: { key: config.apiKey }, json }, schema);
  }

  /** A call with the service account's access token. */
  async function adminCall<T>(ctx: Context | null, operation: FirebaseOperation, path: string, json: unknown, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
    const token = await accessToken(ctx);
    return call(ctx, operation, { url: `${provider.baseUrl}${project}${path}`, headers: { authorization: `Bearer ${token}` }, json }, schema);
  }

  let cached: { value: string; expiresAt: number } | undefined;
  let pending: Promise<string> | undefined;
  let signingKey: ReturnType<typeof importPKCS8> | undefined;

  /**
   * A Google OAuth access token for the service account: a JWT signed with its key, exchanged at
   * Google's token endpoint, and reused until five minutes before it expires. One exchange at a time.
   */
  function accessToken(ctx: Context | null): Promise<string> {
    if (!serviceAccount) {
      return Promise.reject(new AuthError('auth/invalid-config', 'Firebase: set FIREBASE_SERVICE_ACCOUNT_JSON to manage users (Settings › Service accounts › Generate new private key)'));
    }
    if (cached && cached.expiresAt - TOKEN_MARGIN_MS > Date.now()) return Promise.resolve(cached.value);
    pending ??= (async () => {
      signingKey ??= importPKCS8(serviceAccount.private_key, 'RS256').catch(() => {
        signingKey = undefined;
        throw new AuthError('auth/invalid-config', "Firebase: the service account key's private_key can't be read");
      });
      const iat = Math.floor(Date.now() / 1000);
      const assertion = await new SignJWT({ scope: ADMIN_SCOPE })
        .setProtectedHeader({ alg: 'RS256', typ: 'JWT', kid: serviceAccount.private_key_id })
        .setIssuer(serviceAccount.client_email)
        .setAudience(OAUTH_TOKEN_URL)
        .setIssuedAt(iat)
        .setExpirationTime(iat + 3600)
        .sign(await signingKey);
      const started = Date.now();
      const res = await call(ctx, 'serviceAccount.token', { url: OAUTH_TOKEN_URL, form: { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion } }, AccessTokenResponse);
      cached = { value: res.access_token, expiresAt: started + res.expires_in * 1000 };
      return res.access_token;
    })().finally(() => {
      pending = undefined;
    });
    return pending;
  }

  return {
    hasServiceAccount: serviceAccount !== undefined,

    /** The signing keys, and how long the answer may be kept (its `Cache-Control: max-age`). */
    async keys(ctx: Context | null): Promise<{ keys: KeySet['keys']; maxAgeMs: number }> {
      const url = new URL(FIREBASE_KEYS_URL);
      return callProvider(
        ctx,
        { integration: provider.id, operation: 'keys.get', category: provider.category, server: url.host, method: 'GET' },
        async (attempt) => {
          const response = await doFetch(url.href, { method: 'GET', headers: { accept: 'application/json' } });
          attempt.setStatusCode(response.status);
          if (!response.ok) {
            const category = categoryForStatus(response.status);
            throw new FirebaseError(`firebase/${category}`, `firebase keys.get failed (${response.status})`, { category, status: response.status, retryAfterMs: parseRetryAfter(response.headers.get('retry-after')) });
          }
          const parsed = KeySet.safeParse(await response.json().catch(() => null));
          if (!parsed.success) throw new FirebaseError('firebase/invalid-response', 'firebase keys.get answered in an unexpected shape', { category: 'unavailable', status: response.status });
          return { keys: parsed.data.keys, maxAgeMs: maxAge(response.headers.get('cache-control')) };
        },
        deps,
      );
    },

    async signInWithPassword(ctx: Context | null, input: { email: string; password: string }) {
      return publicCall(ctx, 'accounts.signInWithPassword', '/accounts:signInWithPassword', { email: parse(Email, input.email), password: input.password, returnSecureToken: true }, SignInResponse);
    },

    async signUp(ctx: Context | null, input: { email: string; password: string; displayName?: string }) {
      return publicCall(ctx, 'accounts.signUp', '/accounts:signUp', { email: parse(Email, input.email), password: input.password, displayName: input.displayName, returnSecureToken: true }, SignInResponse);
    },

    async sendOobCode(ctx: Context | null, input: { requestType: 'PASSWORD_RESET' | 'EMAIL_SIGNIN'; email: string; continueUrl?: string; canHandleCodeInApp?: boolean }) {
      return publicCall(ctx, 'accounts.sendOobCode', '/accounts:sendOobCode', { ...input, email: parse(Email, input.email) }, OobCodeResponse);
    },

    async resetPassword(ctx: Context | null, input: { oobCode: string; newPassword: string }) {
      return publicCall(ctx, 'accounts.resetPassword', '/accounts:resetPassword', input, ResetPasswordResponse);
    },

    async signInWithEmailLink(ctx: Context | null, input: { email: string; oobCode: string }) {
      return publicCall(ctx, 'accounts.signInWithEmailLink', '/accounts:signInWithEmailLink', { email: parse(Email, input.email), oobCode: input.oobCode }, SignInResponse);
    },

    async refresh(ctx: Context | null, refreshToken: string) {
      if (!config.apiKey) throw new AuthError('auth/invalid-config', 'Firebase: set FIREBASE_API_KEY (the web API key) to refresh tokens');
      return call(ctx, 'token.refresh', { url: SECURE_TOKEN_URL, query: { key: config.apiKey }, form: { grant_type: 'refresh_token', refresh_token: refreshToken } }, RefreshResponse);
    },

    async lookup(ctx: Context | null, by: { localId: string } | { email: string }): Promise<UserInfo | null> {
      const json = 'localId' in by ? { localId: [by.localId] } : { email: [parse(Email, by.email)] };
      const { users } = await adminCall(ctx, 'projects.accounts.lookup', '/accounts:lookup', json, LookupResponse);
      return users[0] ?? null;
    },

    async createUser(ctx: Context | null, input: { email: string; emailVerified: boolean; password?: string; displayName?: string }) {
      return adminCall(ctx, 'projects.accounts.signUp', '/accounts', { ...input, email: parse(Email, input.email) }, SignInResponse);
    },

    async updateUser(ctx: Context | null, input: { localId: string; password?: string; validSince?: string }) {
      await adminCall(ctx, 'projects.accounts.update', '/accounts:update', input, LookupResponse.partial().passthrough());
    },

    async deleteUser(ctx: Context | null, localId: string) {
      await adminCall(ctx, 'projects.accounts.delete', '/accounts:delete', { localId }, LookupResponse.partial().passthrough());
    },

    /** The code and link, without Firebase emailing them: the app does. */
    async oobLink(ctx: Context | null, input: { requestType: 'PASSWORD_RESET' | 'EMAIL_SIGNIN'; email: string; continueUrl?: string; canHandleCodeInApp?: boolean }) {
      return adminCall(ctx, 'projects.accounts.sendOobCode', '/accounts:sendOobCode', { ...input, email: parse(Email, input.email), returnOobLink: true }, OobCodeResponse);
    },
  };
}

export type FirebaseApi = ReturnType<typeof createFirebaseApi>;

/**
 * Firebase's error body is `{ error: { code, message, errors } }`, where `message` is the code
 * (`EMAIL_EXISTS`), sometimes followed by ` : ` and a sentence. Only the code is kept. Google's
 * OAuth token endpoint answers `{ error: "invalid_grant", error_description }` instead.
 */
export function failure(_status: number, body: unknown): FailureInfo | undefined {
  const error = typeof body === 'object' && body !== null ? (body as { error?: unknown }).error : undefined;
  let code: string | undefined;
  if (typeof error === 'string' && /^[a-z_]+$/.test(error)) code = error;
  else if (typeof error === 'object' && error !== null && typeof (error as { message?: unknown }).message === 'string') {
    const message = (error as { message: string }).message;
    // A wrong web API key: Google's own sentence, not a Firebase code.
    if (message.startsWith('API key not valid')) return { category: 'unauthorized', reason: 'invalid-api-key' };
    const first = message.split(/\s/)[0] ?? '';
    if (/^[A-Z][A-Z0-9_]+$/.test(first)) code = first;
  }
  const mapped = mappedFailure(errorMap, code);
  return { providerCode: code, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

function maxAge(cacheControl: string | null): number {
  const match = cacheControl?.match(/(?:^|,)\s*max-age=(\d+)/i);
  return match ? Number(match[1]) * 1000 : DEFAULT_KEYS_MAX_AGE_MS;
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Firebase input');
  return parsed.data;
}
