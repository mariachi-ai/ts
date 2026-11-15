import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { AuthError, MariachiError } from '@mariachi/core';
import { parseCookies, type IncomingRequest } from '@mariachi/server';
import type { AuthStrategyHandler, ResolvedIdentity } from '../types';

export interface TokenVerifier {
  verify(token: string): Promise<ResolvedIdentity>;
}

function header(req: IncomingRequest, name: string): string | undefined {
  const v = req.headers[name.toLowerCase()];
  return Array.isArray(v) ? v[0] : v;
}

function safeEqual(a: string | Buffer, b: string | Buffer): boolean {
  const ab = Buffer.isBuffer(a) ? a : Buffer.from(a);
  const bb = Buffer.isBuffer(b) ? b : Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

async function verifyOrThrow(verifier: TokenVerifier, token: string, code: string): Promise<ResolvedIdentity> {
  try {
    return await verifier.verify(token);
  } catch (error) {
    if (error instanceof MariachiError && error.code.startsWith('auth/')) throw error;
    throw new AuthError(code, 'Invalid credentials');
  }
}

/** A cookie-authenticated request that didn't come from this origin. Code `auth/cross-site-request`, status 403. */
export class CrossSiteRequestError extends AuthError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super('auth/cross-site-request', message, metadata);
    this.name = 'CrossSiteRequestError';
  }
}

export interface SameOriginOptions {
  /**
   * Other origins whose pages may make state-changing requests with the cookie, e.g.
   * `['https://app.example.com']` for an API on `api.example.com`. The API's own origin always may.
   */
  allowedOrigins?: string[];
  /**
   * The API's own origin as browsers see it, e.g. `https://api.example.com`. When set, a browser that
   * sends no `Sec-Fetch-Site` must send exactly this `Origin`, scheme included. Without it the
   * `Origin`'s host is compared with the `Host` header, which can't tell http from https.
   */
  publicOrigin?: string;
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * The check that makes a cookie safe to authenticate with (CSRF): a request that can change state
 * must come from a page of this origin, or of an origin on the list. A browser attaches the cookie to
 * requests other sites cause, and says where a request comes from in `Sec-Fetch-Site` and `Origin`,
 * which a page can't forge. `GET`, `HEAD` and `OPTIONS` pass, so they must not change state. A
 * request that says nothing about where it comes from is refused: a client that isn't a browser
 * sends a bearer token, not a cookie. Throws `auth/cross-site-request` (403).
 */
export function assertSameOrigin(req: IncomingRequest, options: SameOriginOptions = {}): void {
  if (SAFE_METHODS.has(req.method.toUpperCase())) return;
  const origin = header(req, 'origin');
  const site = header(req, 'sec-fetch-site');
  const refuse = (why: string) => new CrossSiteRequestError(`Cross-site request refused: ${why}`, { origin: origin?.slice(0, 200), site: site?.slice(0, 40) });
  if (origin !== undefined && options.allowedOrigins?.includes(origin)) return;
  // The browser's own statement, which a page can't set: the page that sent this is of the origin it was sent to
  if (site === 'same-origin') return;
  // A sibling subdomain (same-site) is another origin, and may be someone else's
  if (site === 'cross-site' || site === 'same-site') throw refuse('it comes from another origin');
  // A browser that doesn't send Sec-Fetch-Site: compare Origin with the Host it was sent to (also not the page's to set)
  if (origin === undefined) throw refuse("it doesn't say where it comes from");
  if (options.publicOrigin !== undefined) {
    if (origin === options.publicOrigin) return;
    throw refuse('it comes from another origin');
  }
  let host: string | undefined;
  try {
    host = new URL(origin).host;
  } catch {
    throw refuse('the Origin header is not an origin');
  }
  if (host && host === header(req, 'host')) return;
  throw refuse('it comes from another origin');
}

export interface BearerOptions extends SameOriginOptions {
  /** Also take the token from this cookie when there's no `Authorization` header. See `cookieStrategy`. */
  cookie?: string;
}

/**
 * `Authorization: Bearer <token>` verified by a JWT adapter, SessionManager, or auth provider. With
 * `cookie`, a request without the header may carry the token in that cookie; such a request must then
 * pass `assertSameOrigin`, because browsers send cookies on requests other sites cause.
 */
export function bearerStrategy(verifier: TokenVerifier, options: BearerOptions = {}): AuthStrategyHandler {
  return async (req) => {
    const auth = header(req, 'authorization');
    let token = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : undefined;
    if (!token && options.cookie) {
      token = parseCookies(req.headers.cookie)[options.cookie] || undefined;
      if (token) assertSameOrigin(req, options);
    }
    if (!token) return null;
    return verifyOrThrow(verifier, token, 'auth/invalid-token');
  };
}

const warnedCookies = new Set<string>();

export interface CookieStrategyOptions extends SameOriginOptions {
  /** The cookie holding the session token. Name it `__Host-…` so no other host can set it. */
  cookie: string;
}

/**
 * A session token in a cookie, verified by a SessionManager, JWT adapter or auth provider. Every
 * state-changing request must pass `assertSameOrigin`. Set the cookie with `ctx.setCookie` (its
 * defaults are `HttpOnly; Secure; SameSite=Lax`) and remove it with `ctx.clearCookie`.
 */
export function cookieStrategy(verifier: TokenVerifier, options: CookieStrategyOptions): AuthStrategyHandler {
  if (!options.cookie.startsWith('__Host-') && !warnedCookies.has(options.cookie)) {
    warnedCookies.add(options.cookie);
    // Without the prefix a sibling subdomain can plant a cookie of this name, and the planted one may be read first
    process.emitWarning(
      `cookieStrategy: the session cookie "${options.cookie}" has no __Host- prefix, so another host under the same domain can set it. Name it __Host-${options.cookie}.`,
      { code: 'MARIACHI_COOKIE_PREFIX' },
    );
  }
  return async (req) => {
    const token = parseCookies(req.headers.cookie)[options.cookie];
    if (!token) return null;
    assertSameOrigin(req, options);
    return verifyOrThrow(verifier, token, 'auth/invalid-session');
  };
}

/** `x-api-key: <key>` verified by `ApiKeyAdapter` (hash lookup). */
export function apiKeyStrategy(verifier: TokenVerifier, options: { header?: string } = {}): AuthStrategyHandler {
  const name = options.header ?? 'x-api-key';
  return async (req) => {
    const key = header(req, name);
    if (!key) return null;
    const identity = await verifyOrThrow(verifier, key, 'auth/invalid-api-key');
    return { ...identity, identityType: 'api-key' };
  };
}

export interface ServiceTokenOptions {
  /** service name → sha256 hex of its token (preferred) or the raw token. */
  tokens: Record<string, string>;
  header?: string;
  scopes?: string[] | ((service: string) => string[]);
  /** Header a service uses to select the tenant it acts in. Default `x-tenant-id`. */
  tenantHeader?: string;
}

/** Internal service-to-service calls with pre-shared tokens, compared in constant time. */
export function serviceTokenStrategy(options: ServiceTokenOptions): AuthStrategyHandler {
  const headerName = options.header ?? 'x-service-token';
  const entries = Object.entries(options.tokens).map(([service, value]) => ({
    service,
    hash: /^[a-f0-9]{64}$/.test(value) ? value : createHash('sha256').update(value).digest('hex'),
  }));
  return async (req) => {
    const token = header(req, headerName);
    if (!token) return null;
    const hash = createHash('sha256').update(token).digest('hex');
    const match = entries.find((e) => safeEqual(e.hash, hash));
    if (!match) throw new AuthError('auth/invalid-token', 'Invalid service token');
    const scopes = typeof options.scopes === 'function' ? options.scopes(match.service) : (options.scopes ?? ['service']);
    return {
      userId: `service:${match.service}`,
      tenantId: header(req, options.tenantHeader ?? 'x-tenant-id') ?? 'system',
      scopes,
      identityType: 'service',
    };
  };
}

export interface HmacSignatureOptions {
  secret: string | string[];
  header: string;
  algorithm?: 'sha256' | 'sha512' | 'sha1';
  encoding?: 'hex' | 'base64';
  /** Strip a prefix such as `sha256=`. */
  prefix?: string;
  provider: string;
  tenantId?: string | ((req: IncomingRequest) => string | undefined);
}

/** Generic HMAC webhook verification over the raw body. Supports secret rotation via arrays. */
export function hmacSignatureStrategy(options: HmacSignatureOptions): AuthStrategyHandler {
  const secrets = Array.isArray(options.secret) ? options.secret : [options.secret];
  return async (req) => {
    let sig = header(req, options.header);
    if (!sig) return null;
    if (!req.rawBody) throw new AuthError('auth/webhook-verification-failed', 'Raw body unavailable for signature check');
    if (options.prefix && sig.startsWith(options.prefix)) sig = sig.slice(options.prefix.length);
    const ok = secrets.some((secret) => {
      const expected = createHmac(options.algorithm ?? 'sha256', secret)
        .update(req.rawBody!)
        .digest(options.encoding ?? 'hex');
      return safeEqual(expected, sig!);
    });
    if (!ok) throw new AuthError('auth/webhook-verification-failed', 'Invalid webhook signature');
    const tenantId = typeof options.tenantId === 'function' ? options.tenantId(req) : options.tenantId;
    return { userId: `webhook:${options.provider}`, tenantId: tenantId ?? 'system', scopes: ['webhook'], identityType: 'webhook' };
  };
}
