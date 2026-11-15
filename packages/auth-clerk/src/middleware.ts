import type { Context, Middleware } from '@mariachi/core';
import { createAuthMiddleware, type AuthProvider } from '@mariachi/auth';

export interface ClerkMiddlewareOptions {
  /**
   * Extract the session token from the context.
   * Defaults to reading `ctx.token` (set by HTTP adapters from the Authorization header).
   */
  getToken?: (ctx: Context) => string | null;
}

/**
 * The framework's auth middleware over a Clerk provider. Kept for existing imports: it is
 * `createAuthMiddleware(provider, options)` from `@mariachi/auth`, so the verified claims reach
 * `ctx.jwtClaims` (and tenancy's `jwt-claim` strategy) as they do for every other provider.
 */
export function createClerkMiddleware(provider: AuthProvider, options?: ClerkMiddlewareOptions): Middleware {
  return createAuthMiddleware({ verify: (token) => provider.verify(token), sign: async () => '' }, options);
}
