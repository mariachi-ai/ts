import { ConfigError } from '@mariachi/core';

/**
 * The headers that carry a project key. Supabase's `sb_publishable_…` and `sb_secret_…` keys aren't JWTs and go
 * on `apikey` only: on `Authorization` the platform reads them as a JWT and refuses the request. The legacy `anon`
 * and `service_role` keys are JWTs and go on both, as they always have.
 */
export function keyHeaders(key: string): Record<string, string> {
  return isJwt(key) ? { apikey: key, authorization: `Bearer ${key}` } : { apikey: key };
}

/** A legacy key: a JWT (`eyJ…`), not an `sb_…` key. */
export function isJwt(key: string): boolean {
  return key.startsWith('eyJ');
}

/**
 * The project URL with no trailing slash, refusing one with a path: `SUPABASE_URL` is the project's own address
 * (`https://<project-ref>.supabase.co`), and every service is a path under it.
 */
export function projectUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new ConfigError('supabase/invalid-url', 'SUPABASE_URL is not a URL: it is https://<project-ref>.supabase.co');
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new ConfigError('supabase/invalid-url', 'SUPABASE_URL must be an http(s) URL: https://<project-ref>.supabase.co');
  }
  if (parsed.pathname.replace(/\/+$/, '') !== '' || parsed.search || parsed.hash) {
    throw new ConfigError('supabase/invalid-url', 'SUPABASE_URL is the project URL alone (https://<project-ref>.supabase.co), without /auth/v1 or any other path');
  }
  return parsed.origin;
}
