export { FastifyAdapter, createApiServer } from './server';
export { BaseController } from './controller';
export { Html, html, raw, escapeHtml, safeHref, htmlResponse, DEFAULT_PAGE_CSP, type HtmlResponseOptions } from './html';
export { staticFiles, type StaticOptions } from './static';
export { generateOpenApi } from './openapi';
export {
  bearerStrategy,
  cookieStrategy,
  assertSameOrigin,
  CrossSiteRequestError,
  type BearerOptions,
  type CookieStrategyOptions,
  type SameOriginOptions,
  apiKeyStrategy,
  serviceTokenStrategy,
  hmacSignatureStrategy,
  type TokenVerifier,
  type ServiceTokenOptions,
  type HmacSignatureOptions,
} from './auth/strategies';
export { HttpResponse, httpResponse, SseResponse, sseResponse, StreamResponse, streamResponse, UploadError, safeFilename } from '@mariachi/server';
export type { ServerConfig, CorsOptions, CookieOptions, MultipartLimits, ServerSentEvent, SseOptions, StreamOptions, UploadedFile } from '@mariachi/server';
export type {
  ApiServerConfig,
  AuthStrategy,
  AuthStrategyHandler,
  ResolvedIdentity,
  RequestIdentity,
  HttpContext,
  HttpMiddleware,
  RouteSchemas,
  RouteHandler,
  RouteOpts,
  RouteDefinition,
  RateLimitSettings,
  RateLimitConfig,
  OpenApiSettings,
  HealthSource,
  AuthResolver,
} from './types';
