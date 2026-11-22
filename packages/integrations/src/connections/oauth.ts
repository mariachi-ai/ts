import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { ConfigError, type Context } from '@mariachi/core';
import { z } from 'zod';
import type { ErrorCategory } from '../provider-error';
import { type FailureInfo, providerRequest } from '../request';
import type { ConnectionsDeps, OAuthProvider } from './types';

/**
 * The OAuth 2.0 pieces `Connections` is built from, each small enough to check by reading: PKCE (RFC 7636), the
 * signed `state`, and the token endpoint calls (RFC 6749, RFC 7009), every one through `providerRequest`, so each
 * has its span. No token, code, verifier or state value is ever put in a span, a log line or an error message.
 */

const b64url = (bytes: Buffer): string => bytes.toString('base64url');

/** A PKCE verifier (43 characters from 32 random bytes) and its S256 challenge. */
export function createPkce(): { verifier: string; challenge: string; method: 'S256' } {
  const verifier = b64url(randomBytes(32));
  return { verifier, challenge: pkceChallenge(verifier), method: 'S256' };
}

/** The S256 challenge for a verifier: base64url(SHA-256(verifier)). */
export function pkceChallenge(verifier: string): string {
  return b64url(createHash('sha256').update(verifier, 'ascii').digest());
}

/** Who and what a `state` is for. A state made for one user and provider fails for any other. */
export interface StateBinding {
  provider: string;
  tenantId: string | null;
  userId: string;
}

const STATE_VERSION = 'mariachi.oauth-state.v1';
const NONCE = /^[A-Za-z0-9_-]{43}$/;

function stateMac(secret: string, nonce: string, expiresAt: number, binding: StateBinding): Buffer {
  // JSON keeps the fields apart whatever characters a user id holds
  const signed = JSON.stringify([STATE_VERSION, nonce, expiresAt, binding.provider, binding.tenantId ?? '', binding.userId]);
  return createHmac('sha256', secret).update(signed, 'utf8').digest();
}

/**
 * A new `state`: `<nonce>.<expiry>.<signature>`. The signature covers the nonce, the expiry, the provider, the
 * tenant and the user, though only the nonce and the expiry are in it: the user's id never travels to the provider.
 */
export function signState(secret: string, binding: StateBinding, expiresAt: number): { state: string; nonce: string } {
  const nonce = b64url(randomBytes(32));
  return { state: `${nonce}.${expiresAt.toString(36)}.${b64url(stateMac(secret, nonce, expiresAt, binding))}`, nonce };
}

/**
 * The nonce of a `state` that this app signed for this user and provider and that hasn't expired, or null. It
 * checks the signature only: that the state is used once is the store's `takeAuthorization`.
 */
export function verifyState(secret: string, state: string, binding: StateBinding, now: number): { nonce: string; expiresAt: number } | null {
  if (typeof state !== 'string' || state.length > 200) return null;
  const [nonce, exp, mac, extra] = state.split('.');
  if (extra !== undefined || !nonce || !exp || !mac || !NONCE.test(nonce) || !/^[0-9a-z]{1,12}$/.test(exp)) return null;
  const expiresAt = Number.parseInt(exp, 36);
  const expected = stateMac(secret, nonce, expiresAt, binding);
  const given = Buffer.from(mac, 'base64url');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  if (!(expiresAt > now)) return null;
  return { nonce, expiresAt };
}

/** The hex SHA-256 under which an authorization is stored: the nonce itself never is. */
export function hashNonce(nonce: string): string {
  return createHash('sha256').update(nonce, 'utf8').digest('hex');
}

/** What a token endpoint answers. Other fields (Salesforce's `instance_url`, an `id_token`) pass through. */
export const TokenResponse = z
  .object({
    access_token: z.string().min(1),
    token_type: z.string().optional(),
    // 0 or absent: the provider didn't say when it expires. Refusing the answer would lose a rotated refresh token
    expires_in: z.coerce.number().nonnegative().optional(),
    refresh_token: z.string().min(1).optional(),
    scope: z.string().optional(),
  })
  .passthrough();
export type TokenResponse = z.infer<typeof TokenResponse>;

/** RFC 6749's error codes, and what each means for an app. Anything else is read from the HTTP status. */
const OAUTH_ERRORS: Record<string, { category: ErrorCategory; reason: string }> = {
  invalid_grant: { category: 'unauthorized', reason: 'invalid-grant' },
  invalid_client: { category: 'unauthorized', reason: 'invalid-client' },
  unauthorized_client: { category: 'unauthorized', reason: 'invalid-client' },
  invalid_scope: { category: 'invalid-request', reason: 'invalid-scope' },
  invalid_request: { category: 'invalid-request', reason: 'invalid-request' },
  unsupported_grant_type: { category: 'invalid-request', reason: 'invalid-request' },
  access_denied: { category: 'forbidden', reason: 'access-denied' },
  temporarily_unavailable: { category: 'unavailable', reason: 'unavailable' },
  server_error: { category: 'unavailable', reason: 'unavailable' },
};

/** The provider's OAuth error code from its body: only a code, never `error_description`, which can echo input. */
function oauthError(body: unknown): FailureInfo | undefined {
  const code = (body as { error?: unknown } | null)?.error;
  if (typeof code !== 'string' || !/^[a-z_]{1,64}$/.test(code)) return undefined;
  return { ...(OAUTH_ERRORS[code] ?? {}), providerCode: code };
}

function clientAuth(provider: OAuthProvider): { headers: Record<string, string>; form: Record<string, string> } {
  if (provider.clientAuth === 'basic' && provider.clientSecret) {
    // RFC 6749 2.3.1: each part form-encoded before it's joined
    const pair = `${encodeURIComponent(provider.clientId)}:${encodeURIComponent(provider.clientSecret)}`;
    return { headers: { authorization: `Basic ${Buffer.from(pair).toString('base64')}` }, form: {} };
  }
  return { headers: {}, form: { client_id: provider.clientId, ...(provider.clientSecret ? { client_secret: provider.clientSecret } : {}) } };
}

/** One call to the provider's token or revoke endpoint, spanned as `<provider> oauth.<action>`. */
async function oauthPost<T>(
  ctx: Context,
  provider: OAuthProvider,
  operation: 'oauth.exchange' | 'oauth.refresh' | 'oauth.revoke',
  url: string,
  form: Record<string, string>,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  deps: ConnectionsDeps,
  connection?: string,
): Promise<T> {
  const auth = clientAuth(provider);
  return providerRequest(
    ctx,
    { integration: provider.id, operation, category: provider.category, server: new URL(url).host, ...(connection ? { connection } : {}) },
    { method: 'POST', url, form: { ...form, ...auth.form }, headers: auth.headers },
    {
      schema,
      error: provider.error,
      failure: (_status, body) => oauthError(body),
      // Some providers (GitHub's) answer 200 with an error body
      failureInBody: (body) => {
        const info = (body as { access_token?: unknown } | null)?.access_token === undefined ? oauthError(body) : undefined;
        return info ? { category: 'invalid-request', ...info } : undefined;
      },
      // A token request isn't safe to repeat after an outage (a code, or a rotating refresh token, works once):
      // providerRequest retries a POST with no idempotency key only when the provider rate-limited it
      deps,
    },
  );
}

/** Trades the authorization code for tokens. */
export function exchangeCode(ctx: Context, provider: OAuthProvider, input: { code: string; codeVerifier: string | null }, deps: ConnectionsDeps): Promise<TokenResponse> {
  return oauthPost(
    ctx,
    provider,
    'oauth.exchange',
    provider.oauth.tokenUrl,
    { grant_type: 'authorization_code', code: input.code, redirect_uri: provider.redirectUri, ...(input.codeVerifier ? { code_verifier: input.codeVerifier } : {}) },
    TokenResponse,
    deps,
  );
}

/** Trades a refresh token for a new access token (and, with providers that rotate them, a new refresh token). */
export function refreshTokens(ctx: Context, provider: OAuthProvider, refreshToken: string, connectionId: string, deps: ConnectionsDeps): Promise<TokenResponse> {
  return oauthPost(ctx, provider, 'oauth.refresh', provider.oauth.tokenUrl, { grant_type: 'refresh_token', refresh_token: refreshToken }, TokenResponse, deps, connectionId);
}

/** Asks the provider to revoke a token (RFC 7009). Revoking the refresh token ends the grant with most providers. */
export async function revokeToken(ctx: Context, provider: OAuthProvider, token: { value: string; hint: 'refresh_token' | 'access_token' }, connectionId: string, deps: ConnectionsDeps): Promise<void> {
  const url = provider.oauth.revokeUrl;
  if (!url) return;
  await oauthPost(ctx, provider, 'oauth.revoke', url, { token: token.value, token_type_hint: token.hint }, z.unknown(), deps, connectionId);
}

/** The space-separated scopes a token response reports (a few providers use commas), else the ones asked for. */
export function grantedScopes(response: TokenResponse, requested: readonly string[]): string[] {
  const reported = response.scope?.split(/[\s,]+/).filter(Boolean);
  return reported && reported.length > 0 ? [...new Set(reported)] : [...requested];
}

/** The authorize URL a user is sent to. */
export function authorizeUrl(provider: OAuthProvider, input: { state: string; challenge?: string }): string {
  const url = new URL(provider.oauth.authorizeUrl);
  for (const [k, v] of Object.entries(provider.authorizeParams ?? {})) url.searchParams.set(k, v);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', provider.clientId);
  url.searchParams.set('redirect_uri', provider.redirectUri);
  url.searchParams.set('scope', provider.oauth.scopes.join(' '));
  url.searchParams.set('state', input.state);
  if (input.challenge) {
    url.searchParams.set('code_challenge', input.challenge);
    url.searchParams.set('code_challenge_method', 'S256');
  }
  return url.toString();
}

/**
 * What `oauthProvider` reads of a contract: its provider and its credentials. A provider package's generated
 * `provider` and `credentials` exports fit, as does its parsed `contract.json`.
 */
export interface OAuthContract {
  provider: { readonly id: string; readonly category: string };
  credentials:
    | { readonly kind: 'app' }
    | {
        readonly kind: 'user' | 'app-or-user';
        readonly oauth: { readonly authorizeUrl: string; readonly tokenUrl: string; readonly scopes: readonly string[]; readonly pkce?: boolean; readonly refresh: boolean; readonly revokeUrl?: string };
      };
}

/**
 * A provider end users connect to, from its integration's contract and the app's settings:
 *
 * ```ts
 * import { provider, credentials, settings } from '@mariachi/integration-google-drive';
 * const drive = settingsFromEnv(settings, readEnv);   // GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET
 * oauthProvider({ provider, credentials }, { clientId: drive.clientId, clientSecret: drive.clientSecret, redirectUri: `${appUrl}/connect/google-drive` });
 * ```
 *
 * `scopes` narrows the contract's. Fails with `integrations/not-oauth` for a contract whose credentials are the
 * app's alone.
 */
export function oauthProvider(contract: OAuthContract, options: Omit<OAuthProvider, 'id' | 'category' | 'oauth'> & { scopes?: readonly string[] }): OAuthProvider {
  const credentials = contract.credentials;
  if (credentials.kind === 'app') {
    throw new ConfigError('integrations/not-oauth', `${contract.provider.id}'s contract has no OAuth: its credentials are the app's settings`);
  }
  const { scopes, ...rest } = options;
  return { ...rest, id: contract.provider.id, category: contract.provider.category, oauth: { ...credentials.oauth, scopes: [...(scopes ?? credentials.oauth.scopes)] } };
}

/** An http URL is for a stand-in on this machine only. */
function secureUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.hash) return false;
    return url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname));
  } catch {
    return false;
  }
}

/** Fails at startup on a provider config that would be unsafe or can't work. */
export function checkProvider(provider: OAuthProvider): void {
  const bad = (what: string) => {
    throw new ConfigError('integrations/invalid-oauth-provider', `OAuth provider "${provider.id}": ${what}`);
  };
  if (!provider.id || !provider.category) bad('needs an id and a category');
  if (!provider.clientId) bad('the client id setting is empty');
  for (const [name, url] of [['authorizeUrl', provider.oauth.authorizeUrl], ['tokenUrl', provider.oauth.tokenUrl], ['revokeUrl', provider.oauth.revokeUrl], ['redirectUri', provider.redirectUri]] as const) {
    if (url !== undefined && !secureUrl(url)) bad(`${name} must be an https URL without a fragment (http only on localhost)`);
  }
  if (provider.oauth.scopes.length === 0) bad('asks for no scopes');
  if (provider.clientAuth === 'basic' && !provider.clientSecret) bad('clientAuth "basic" needs a client secret');
  if (!provider.clientSecret && provider.oauth.pkce === false) bad('a public client (no secret) needs PKCE');
}

