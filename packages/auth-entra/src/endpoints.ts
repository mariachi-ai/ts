import { AuthError, type Context } from '@mariachi/core';
import { type FailureInfo, type ProviderDeps, type ProviderRequest, mappedFailure, providerRequest } from '@mariachi/integrations';
import type { z } from 'zod';
import { EntraError } from './errors';
import { type EntraOperation, errorMap, provider } from './generated';
import { TokenResponse } from './schemas';

/** The workforce sign-in host. An External ID tenant has its own, `https://<subdomain>.ciamlogin.com`. */
export const WORKFORCE_AUTHORITY = 'https://login.microsoftonline.com';
export const GRAPH = 'https://graph.microsoft.com/v1.0';
/** The tenant values that accept any work or school tenant (`common` adds personal Microsoft accounts). */
export const MULTI_TENANT: ReadonlySet<string> = new Set(['organizations', 'common']);
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isGuid(value: unknown): value is string {
  return typeof value === 'string' && GUID.test(value);
}

export interface EntraDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

/** Where a tenant's endpoints are, from `tenantId` and, for External ID, `authority`. */
export interface Endpoints {
  tenant: string;
  /** `organizations` or `common`: tokens from any tenant, each checked against its own `tid`. */
  multiTenant: boolean;
  /** An External ID (customer) tenant, signing in at `*.ciamlogin.com` or its custom domain. */
  externalId: boolean;
  /** `https://login.microsoftonline.com/<tenant>`: every endpoint is under it. */
  base: string;
  discovery: string;
  authorize: string;
  token: string;
  logout: string;
  /** For External ID: the issuer of email sign-in identities, `<subdomain>.onmicrosoft.com`, when the host says it. */
  identityIssuer?: string;
}

export function endpoints(config: { tenantId: string; authority?: string }): Endpoints {
  const tenant = config.tenantId.trim();
  if (!tenant || /[/?#\s]/.test(tenant)) throw new AuthError('auth/invalid-config', 'Entra: `tenantId` must be the Directory (tenant) ID');
  let origin = WORKFORCE_AUTHORITY;
  let externalId = false;
  let identityIssuer: string | undefined;
  if (config.authority) {
    let url: URL;
    try {
      url = new URL(config.authority);
    } catch {
      throw new AuthError('auth/invalid-config', 'Entra: `authority` is not a URL');
    }
    if (url.protocol !== 'https:' || (url.pathname !== '/' && url.pathname !== '') || url.search || url.hash) {
      throw new AuthError('auth/invalid-config', 'Entra: `authority` is the sign-in host alone, https://<subdomain>.ciamlogin.com');
    }
    origin = url.origin;
    externalId = origin !== WORKFORCE_AUTHORITY;
    const sub = /^([a-z0-9-]+)\.ciamlogin\.com$/i.exec(url.hostname)?.[1];
    if (sub) identityIssuer = `${sub.toLowerCase()}.onmicrosoft.com`;
  }
  const multiTenant = MULTI_TENANT.has(tenant.toLowerCase());
  if (multiTenant && externalId) throw new AuthError('auth/invalid-config', 'Entra: an External ID tenant signs in its own users; set `tenantId` to its Directory (tenant) ID');
  const base = `${origin}/${encodeURIComponent(tenant)}`;
  return {
    tenant,
    multiTenant,
    externalId,
    base,
    discovery: `${base}/v2.0/.well-known/openid-configuration`,
    authorize: `${base}/oauth2/v2.0/authorize`,
    token: `${base}/oauth2/v2.0/token`,
    logout: `${base}/oauth2/v2.0/logout`,
    identityIssuer,
  };
}

/** One call to Entra or Graph, through `providerRequest`: its span is `entra <operation>`. */
export function entraRequest<T>(ctx: Context | null, deps: EntraDeps, operation: EntraOperation, request: ProviderRequest, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
  return providerRequest(ctx, { integration: provider.id, operation, category: provider.category, server: new URL(request.url).host }, request, {
    schema,
    error: EntraError,
    failure,
    deps,
  });
}

/**
 * The identity platform answers `{ error: 'invalid_grant', error_codes: [...] }`, Graph `{ error: { code } }`. The
 * code is kept; `error_description` and `message` aren't (they can echo the input).
 */
function failure(_status: number, body: unknown): FailureInfo | undefined {
  const error = (body as { error?: unknown } | null)?.error;
  const code = typeof error === 'string' ? error : typeof (error as { code?: unknown } | undefined)?.code === 'string' ? (error as { code: string }).code : undefined;
  const mapped = mappedFailure(errorMap, code);
  return { providerCode: code, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

/**
 * The app's own Graph token (client credentials, `https://graph.microsoft.com/.default`), kept until five minutes
 * before it expires. One request at a time.
 */
export function appTokenSource(ep: Endpoints, cfg: { clientId: string; clientSecret?: string }, deps: EntraDeps) {
  let cached: { token: string; expiresAt: number } | undefined;
  let pending: Promise<string> | undefined;
  const now = deps.now ?? Date.now;
  return async function appToken(ctx: Context | null): Promise<string> {
    if (!cfg.clientSecret) throw new AuthError('auth/invalid-config', 'Entra: Microsoft Graph calls need `clientSecret` (ENTRA_CLIENT_SECRET)');
    if (ep.multiTenant) throw new AuthError('auth/invalid-config', "Entra: Microsoft Graph calls need the app's own Directory (tenant) ID, not `organizations` or `common`");
    if (cached && cached.expiresAt - 5 * 60_000 > now()) return cached.token;
    pending ??= entraRequest(
      ctx,
      deps,
      'tokens.appToken',
      { method: 'POST', url: ep.token, form: { grant_type: 'client_credentials', client_id: cfg.clientId, client_secret: cfg.clientSecret, scope: 'https://graph.microsoft.com/.default' } },
      TokenResponse,
    )
      .then((res) => {
        cached = { token: res.access_token, expiresAt: now() + (res.expires_in ?? 3600) * 1000 };
        return res.access_token;
      })
      .finally(() => {
        pending = undefined;
      });
    return pending;
  };
}
