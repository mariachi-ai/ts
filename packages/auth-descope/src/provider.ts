import { createRemoteJWKSet, type JWTPayload, type JWTVerifyGetKey, jwtVerify } from 'jose';
import { AuthError, isReservedTenantId } from '@mariachi/core';
import type { AuthProvider, AuthWebhookHandler, ResolvedIdentity } from '@mariachi/auth';
import { provider } from './generated';

export interface DescopeAuthConfig {
  /** The Descope project (`DESCOPE_PROJECT_ID`). */
  projectId: string;
  /** Descope's API address: a regional one, or the project's custom domain. Default `https://api.descope.com`. */
  baseUrl?: string;
  /**
   * The `iss` a session token must carry. Default: any of the three forms Descope documents for this project,
   * `<baseUrl>/v1/apps/<projectId>` (the default JWT template), `<baseUrl>/<projectId>` (federated apps and older
   * templates) and the bare `<projectId>`. The project's own keys must have signed it either way.
   */
  issuer?: string | string[];
  /** The `aud` a token must carry, when a JWT template sets one. Unset, `aud` isn't checked (Descope sets none by default). */
  audience?: string | string[];
  /** Where the keys are. Default `<baseUrl>/<projectId>/.well-known/jwks.json`. */
  jwksUrl?: string;
  /** How long fetched keys are trusted, in ms. Default 10 minutes. */
  jwksCacheMaxAgeMs?: number;
  /** The least time between two key fetches caused by an unknown `kid`, in ms. Default 30 000. */
  jwksCooldownMs?: number;
  /** Clock skew allowed on `exp`, `nbf` and `iat`, in seconds. Default 5. */
  clockToleranceSeconds?: number;
}

/** Descope session-token claims this package reads; the rest stay in `claims`. */
export interface DescopeSessionClaims extends JWTPayload {
  /** Where the token is kept: `DS` for a session token. A refresh token says `DSR`. */
  drn?: string;
  /** The user's current tenant. */
  dct?: string;
  /** Per-tenant roles and permissions: `{ [tenantId]: { roles, permissions } }`. */
  tenants?: Record<string, { roles?: unknown; permissions?: unknown }>;
  roles?: unknown;
  permissions?: unknown;
  amr?: unknown;
}

export const DEFAULT_DESCOPE_BASE_URL = 'https://api.descope.com';

export function descopeBase(baseUrl: string | undefined): string {
  const base = (baseUrl ?? DEFAULT_DESCOPE_BASE_URL).replace(/\/+$/, '');
  let url: URL;
  try {
    url = new URL(base);
  } catch {
    throw new AuthError('auth/invalid-config', 'Descope: `baseUrl` is not a URL');
  }
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) throw new AuthError('auth/invalid-config', 'Descope: `baseUrl` must be https://');
  return base;
}

function strings(value: unknown): string[] {
  if (typeof value === 'string' && value) return [value];
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string' && v.length > 0) : [];
}

/**
 * Verifies Descope session JWTs against the project's keys (`<baseUrl>/<projectId>/.well-known/jwks.json`, RS256)
 * and maps them onto `ResolvedIdentity`:
 *
 * - `sub` → `userId`; `dct` (the current tenant) → `tenantId`, empty when there is none;
 * - root `roles` and `permissions`, plus those of the current tenant in `tenants`, → `roles` and `scopes`;
 * - the whole verified payload (`amr`, `tenants`, custom claims, …) → `claims`.
 *
 * A refresh token (`drn: DSR`) is refused: it is for getting a new session token, not for calling the API.
 * Descope's tokens carry no session id.
 */
export class DescopeAuthProvider implements AuthProvider {
  readonly name = provider.id;

  private readonly issuers: string[];
  private readonly jwks: JWTVerifyGetKey;

  constructor(
    private readonly config: DescopeAuthConfig,
    /** A key set to use in place of the project's (tests: `descopeTestKeys` from `@mariachi/auth-descope/testing`). */
    jwks?: JWTVerifyGetKey,
  ) {
    if (!config.projectId) throw new AuthError('auth/invalid-config', 'Descope: `projectId` is required');
    const base = descopeBase(config.baseUrl);
    this.issuers = config.issuer ? [config.issuer].flat() : [`${base}/v1/apps/${config.projectId}`, `${base}/${config.projectId}`, config.projectId];
    this.jwks =
      jwks ??
      createRemoteJWKSet(new URL(config.jwksUrl ?? `${base}/${encodeURIComponent(config.projectId)}/.well-known/jwks.json`), {
        cacheMaxAge: config.jwksCacheMaxAgeMs ?? 600_000,
        cooldownDuration: config.jwksCooldownMs ?? 30_000,
      });
  }

  async verify(token: string): Promise<ResolvedIdentity> {
    let claims: DescopeSessionClaims;
    try {
      ({ payload: claims } = await jwtVerify<DescopeSessionClaims>(token, this.jwks, {
        algorithms: ['RS256'],
        issuer: this.issuers,
        audience: this.config.audience,
        clockTolerance: this.config.clockToleranceSeconds ?? 5,
        requiredClaims: ['sub', 'exp'],
      }));
    } catch (error) {
      throw new AuthError('auth/invalid-token', `Descope token verification failed: ${(error as Error).message}`);
    }
    if (claims.drn === 'DSR') throw new AuthError('auth/invalid-token', 'Descope token refused: a refresh token, not a session token');
    return this.toIdentity(claims);
  }

  /** The mapping `verify` applies to a verified payload. */
  toIdentity(claims: DescopeSessionClaims): ResolvedIdentity {
    if (typeof claims.sub !== 'string' || !claims.sub) throw new AuthError('auth/invalid-token', 'Descope token has no subject');
    const tenantId = typeof claims.dct === 'string' ? claims.dct : '';
    // Personal tenants are given after verification (withPersonalTenants), never read from a claim.
    if (isReservedTenantId(tenantId || undefined)) {
      throw new AuthError('auth/invalid-token', 'Descope token names a tenant in the reserved personal-tenant namespace');
    }
    const current = tenantId && claims.tenants && typeof claims.tenants === 'object' ? claims.tenants[tenantId] : undefined;
    return {
      userId: claims.sub,
      tenantId,
      scopes: [...new Set([...strings(claims.permissions), ...strings(current?.permissions)])],
      roles: [...new Set([...strings(claims.roles), ...strings(current?.roles)])],
      identityType: 'session',
      claims: { ...claims },
    };
  }

  /**
   * Not available: Descope's Audit Webhook posts events in batches, which one `AuthWebhookEvent` can't hold.
   * Receive them with `WebhookServer` and `descopeWebhookAuth`, and map them with `descopeAuthEvents`.
   */
  createWebhookHandler(): AuthWebhookHandler {
    throw new AuthError('auth/not-supported', 'Descope webhooks arrive in batches: receive them with WebhookServer and descopeWebhookAuth, and map them with descopeAuthEvents');
  }
}
