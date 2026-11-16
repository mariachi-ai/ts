import type { Context } from '@mariachi/core';
import type { CookieOptions, IncomingRequest, MultipartLimits, ServerConfig, UploadedFile } from '@mariachi/server';
import type { RateLimiter, RateLimitRule } from '@mariachi/rate-limit';
import type { z } from 'zod';

/** Built-in strategy names; register any other name with `withAuthStrategy`. */
export type AuthStrategy = 'session' | 'api-key' | 'service' | 'webhook' | (string & {});

export interface ResolvedIdentity {
  userId: string;
  tenantId: string;
  scopes: string[];
  identityType: string;
  roles?: string[];
  apiKeyId?: string;
  sessionId?: string;
  /** The verified token's claims, when the strategy's verifier returns them (e.g. `@mariachi/auth-gotrue`). */
  claims?: Record<string, unknown>;
}

/** @deprecated alias of ResolvedIdentity */
export type RequestIdentity = ResolvedIdentity;

/**
 * Resolves an identity from a request. Return `null` when this strategy's credentials are absent
 * (the next strategy is tried). Throw `AuthError` when credentials are present but invalid.
 */
export type AuthStrategyHandler = (req: IncomingRequest) => Promise<ResolvedIdentity | null>;

export interface HttpContext extends Context {
  identity: ResolvedIdentity | null;
  locals: Record<string, unknown>;
  request: {
    ip: string;
    method: string;
    url: string;
    routePath: string;
    headers: IncomingRequest['headers'];
    /** Exact request bytes, for signature checks and binary uploads (the parsed body may differ). */
    rawBody?: Buffer;
    /** The request's cookies, by name. */
    cookies: Readonly<Record<string, string>>;
    /** The files of a multipart upload, on a route with `upload` set; empty otherwise. */
    files: UploadedFile[];
    /** Aborts when the client goes away before the response is finished: pass it to slow upstream calls. */
    signal: AbortSignal;
  };
  /** Headers added to the response. */
  responseHeaders: Record<string, string>;
  /**
   * Adds a `Set-Cookie` to the response (also when the handler then throws). Defaults:
   * `Path=/; HttpOnly; Secure; SameSite=Lax`. The value is percent-encoded.
   */
  setCookie(name: string, value: string, options?: CookieOptions): void;
  /** Removes a cookie. `path` and `domain` must be the ones it was set with. */
  clearCookie(name: string, options?: Pick<CookieOptions, 'path' | 'domain' | 'secure' | 'httpOnly' | 'sameSite' | 'partitioned'>): void;
}

export type HttpMiddleware = (ctx: HttpContext, next: () => Promise<void>) => Promise<void>;

export interface RouteSchemas {
  body?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  response?: z.ZodTypeAny;
}

type Out<T, Fallback> = T extends z.ZodTypeAny ? z.output<T> : Fallback;

export type RouteHandler<S extends RouteSchemas = RouteSchemas> = (
  ctx: HttpContext,
  body: Out<S['body'], unknown>,
  params: Out<S['params'], Record<string, string>>,
  query: Out<S['query'], Record<string, string | string[]>>,
) => Promise<
  | Out<S['response'], unknown>
  | import('@mariachi/server').HttpResponse
  | import('@mariachi/server').StreamResponse
  | import('@mariachi/server').SseResponse
  | undefined
>;

export interface RouteOpts<S extends RouteSchemas = RouteSchemas> {
  /** Strategies accepted by this route, or `false` for public. Default: server `withAuth` list. */
  auth?: AuthStrategy | AuthStrategy[] | false;
  /** Every listed scope is required. */
  scopes?: string[];
  /**
   * Whether the caller must be in a tenant. `'required'` (the default) refuses an identity with none
   * (`tenancy/missing-tenant`). `'optional'` lets one through with `ctx.tenantId` null, for the few
   * routes a signed-in user needs before they are in any tenant: listing or creating their
   * organizations, accepting an invitation. A handler on such a route must not touch tenant-scoped data.
   */
  tenant?: 'required' | 'optional';
  rateLimit?: RateLimitRule | false;
  schema?: S;
  /** Success status. Default 200 (204 when the handler returns undefined). */
  status?: number;
  summary?: string;
  description?: string;
  tags?: string[];
  deprecated?: boolean;
  bodyLimitBytes?: number;
  /**
   * Take a `multipart/form-data` body: the files arrive in `ctx.request.files` and the text fields
   * as the handler's `body` (checked by `schema.body`). Files are held in memory, so raise
   * `bodyLimitBytes` only as far as this route needs. `true` uses the default limits.
   */
  upload?: MultipartLimits | true;
}

export interface RouteDefinition<S extends RouteSchemas = RouteSchemas> extends RouteOpts<S> {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  handler: RouteHandler<S>;
}

export interface RateLimitSettings {
  limiter: RateLimiter;
  /** Rule for authenticated callers. */
  default: RateLimitRule;
  /** Rule for anonymous callers (keyed by IP). Default: `default`. */
  anonymous?: RateLimitRule;
  /** Per-tenant override (plans/tiers). */
  forTenant?: (tenantId: string) => RateLimitRule | undefined;
  /** Custom key. Default: api key id, then tenant+user, then IP. */
  key?: (ctx: HttpContext) => string;
  /** Emit RateLimit-* headers. Default true. */
  headers?: boolean;
  /** If the limiter backend errors, allow the request (fail open). Default true. */
  failOpen?: boolean;
}

export interface OpenApiSettings {
  path?: string;
  info: { title: string; version: string; description?: string };
  servers?: Array<{ url: string; description?: string }>;
}

export interface HealthSource {
  liveness(): unknown | Promise<unknown>;
  readiness(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy' }>;
  startup?(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy' }>;
}

export interface ApiServerConfig extends ServerConfig {
  /** Validate handler output against `schema.response`. Default true. */
  validateResponses?: boolean;
  /** Header a service identity may use to act within a tenant. Default `x-tenant-id`. */
  tenantHeader?: string;
}

/** @deprecated use RateLimitSettings */
export type RateLimitConfig = RateLimitSettings;

/** @deprecated strategies are registered with withAuthStrategy */
export type AuthResolver = (req: IncomingRequest, strategies: AuthStrategy[]) => Promise<ResolvedIdentity | null>;
