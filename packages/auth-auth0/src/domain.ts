import { AuthError } from '@mariachi/core';

/**
 * The tenant's host from `AUTH0_DOMAIN`, which Auth0 shows bare (`acme.us.auth0.com`) but people often paste as a
 * URL. Only HTTPS, and only a host: the issuer and the key set are derived from it.
 */
export function auth0Host(domain: string, setting = 'domain'): string {
  const value = domain?.trim();
  if (!value) throw new AuthError('auth/invalid-config', `Auth0: \`${setting}\` is required`);
  let url: URL;
  try {
    url = new URL(value.includes('://') ? value : `https://${value}`);
  } catch {
    throw new AuthError('auth/invalid-config', `Auth0: \`${setting}\` is not a domain`);
  }
  if (url.protocol !== 'https:' || (url.pathname !== '/' && url.pathname !== '') || url.search || url.hash || url.username) {
    throw new AuthError('auth/invalid-config', `Auth0: \`${setting}\` must be the tenant's domain alone, such as acme.us.auth0.com`);
  }
  return url.host;
}
