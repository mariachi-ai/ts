import { type JWK, type JWTPayload, decodeProtectedHeader, importJWK, jwtVerify } from 'jose';
import { AuthError, isReservedTenantId } from '@mariachi/core';
import type { AuthProvider, AuthWebhookHandler, ResolvedIdentity } from '@mariachi/auth';
import { type EntraDeps, type Endpoints, endpoints, entraRequest, isGuid } from './endpoints';
import { Discovery, type Jwk, KeySet } from './schemas';

export interface EntraAuthConfig {
  /** The Directory (tenant) ID; `organizations` or `common` to accept tokens from any work or school tenant. */
  tenantId: string;
  /** The Application (client) ID of the API the tokens are for. */
  clientId: string;
  /** For an External ID (customer) tenant: `https://<subdomain>.ciamlogin.com`. */
  authority?: string;
  /**
   * The `aud` a token must carry. Default `clientId`: a v2.0 access token's `aud` is always the API's client id.
   * Set it only when several registrations' tokens are accepted.
   */
  audience?: string | string[];
  /** With `organizations` or `common`: the tenants allowed in. Without it, any tenant's users get in. */
  allowedTenants?: string[];
  /**
   * Put the token's `tid` (its Entra tenant) in `ResolvedIdentity.tenantId`. Default: on for `organizations` and
   * `common` (each customer organization is its own tenant), off for one tenant (every user shares it, so the
   * app assigns tenants itself, as with personal tenants).
   */
  directoryAsTenant?: boolean;
  /** How long the tenant's keys are trusted before they're read again, in ms. Default one hour. */
  keysMaxAgeMs?: number;
  /** The least time between two key reads caused by a key id not yet seen, in ms. Default five minutes. */
  keysCooldownMs?: number;
  /** Clock skew allowed on `exp` and `nbf`, in seconds. Default 5. */
  clockToleranceSeconds?: number;
}

interface Metadata {
  issuer: string;
  keys: Map<string, Jwk>;
  loadedAt: number;
}

const TENANT_PLACEHOLDER = /\{tenantid\}/i;

/**
 * Verifies access tokens Microsoft Entra ID or Entra External ID issued for your API, with the tenant's own
 * signing keys (found through `{authority}/{tenant}/v2.0/.well-known/openid-configuration`):
 *
 * - the RS256 signature, `exp` and `nbf`; `aud` is the API's client id;
 * - `iss` is the issuer the tenant's configuration names, with the token's `tid` in place of `{tenantid}` for
 *   `organizations` and `common`; the signing key's own `issuer`, when Entra gives one, must match too;
 * - `tid` is the configured tenant (or one of `allowedTenants`).
 *
 * Only v2.0 access tokens are accepted: set `requestedAccessTokenVersion` to 2 in the app registration's manifest.
 *
 * The identity: `oid` → `userId` (the same id Microsoft Graph uses; `sub` differs per application), `scp` →
 * `scopes`, `roles` → `roles`, `sid` → `sessionId`, the whole payload → `claims`. A token without `scp` was issued to
 * an application (client credentials), and its identity type is `service`.
 */
export class EntraAuthProvider implements AuthProvider {
  readonly name = 'entra';

  private readonly ep: Endpoints;
  private readonly audience: string | string[];
  private readonly maxAgeMs: number;
  private readonly cooldownMs: number;
  private readonly now: () => number;
  private meta?: Metadata;
  private loading?: Promise<Metadata>;
  private lastLoad = Number.NEGATIVE_INFINITY;

  constructor(
    private readonly config: EntraAuthConfig,
    private readonly deps: EntraDeps = {},
  ) {
    if (!config.clientId) throw new AuthError('auth/invalid-config', 'Entra: `clientId` is required');
    this.ep = endpoints(config);
    if (!this.ep.multiTenant && config.allowedTenants) {
      throw new AuthError('auth/invalid-config', 'Entra: `allowedTenants` is for `organizations` or `common`; one tenant is already pinned by `tenantId`');
    }
    this.audience = config.audience ?? config.clientId;
    this.maxAgeMs = config.keysMaxAgeMs ?? 3_600_000;
    this.cooldownMs = config.keysCooldownMs ?? 300_000;
    this.now = deps.now ?? Date.now;
  }

  async verify(token: string): Promise<ResolvedIdentity> {
    let header: { kid?: string; alg?: string };
    try {
      header = decodeProtectedHeader(token);
    } catch {
      throw new AuthError('auth/invalid-token', 'Entra token is not a JWT');
    }
    if (header.alg !== 'RS256' || !header.kid) throw new AuthError('auth/invalid-token', 'Entra token refused: not signed with RS256 by a key id');
    const meta = await this.metadata(header.kid);
    const jwk = meta.keys.get(header.kid);
    if (!jwk) throw new AuthError('auth/invalid-token', "Entra token refused: signed with a key the tenant doesn't publish");

    let payload: JWTPayload & Record<string, unknown>;
    try {
      const key = await importJWK(jwk as JWK, 'RS256');
      ({ payload } = await jwtVerify(token, key, {
        algorithms: ['RS256'],
        audience: this.audience,
        clockTolerance: this.config.clockToleranceSeconds ?? 5,
        requiredClaims: ['exp', 'iss', 'tid'],
      }));
    } catch (error) {
      throw new AuthError('auth/invalid-token', `Entra token verification failed: ${(error as Error).message}`);
    }
    // The signature, audience and times hold. Now tie the issuer, the key and the tenant together.
    const tid = payload.tid;
    if (!isGuid(tid)) throw new AuthError('auth/invalid-token', 'Entra token refused: `tid` is not a tenant id');
    if (payload.ver === '1.0') {
      throw new AuthError('auth/invalid-token', "Entra token refused: a v1.0 access token. Set requestedAccessTokenVersion to 2 in the app registration's manifest");
    }
    const expected = meta.issuer.replace(TENANT_PLACEHOLDER, tid);
    if (payload.iss !== expected) throw new AuthError('auth/invalid-token', "Entra token refused: issued by another tenant or authority");
    if (jwk.issuer && jwk.issuer.replace(TENANT_PLACEHOLDER, tid) !== payload.iss) {
      throw new AuthError('auth/invalid-token', "Entra token refused: its signing key belongs to another issuer");
    }
    if (this.ep.multiTenant) {
      if (this.config.allowedTenants && !this.config.allowedTenants.some((t) => t.toLowerCase() === tid.toLowerCase())) {
        throw new AuthError('auth/invalid-token', 'Entra token refused: its tenant is not allowed');
      }
    } else if (isGuid(this.ep.tenant) && this.ep.tenant.toLowerCase() !== tid.toLowerCase()) {
      throw new AuthError('auth/invalid-token', 'Entra token refused: issued for another tenant');
    }
    return this.toIdentity(payload);
  }

  /** The mapping `verify` applies to a verified payload. */
  toIdentity(payload: Record<string, unknown>): ResolvedIdentity {
    const oid = payload.oid;
    if (typeof oid !== 'string' || !oid) {
      throw new AuthError('auth/invalid-token', 'Entra token has no `oid`: request the `profile` scope when signing in');
    }
    const tid = typeof payload.tid === 'string' ? payload.tid : '';
    const tenantId = (this.config.directoryAsTenant ?? this.ep.multiTenant) ? tid : '';
    if (isReservedTenantId(tenantId || undefined)) throw new AuthError('auth/invalid-token', 'Entra token names a tenant in the reserved personal-tenant namespace');
    const scp = typeof payload.scp === 'string' ? payload.scp.split(/\s+/).filter(Boolean) : [];
    const roles = Array.isArray(payload.roles) ? payload.roles.filter((r): r is string => typeof r === 'string' && r.length > 0) : [];
    return {
      userId: oid,
      tenantId,
      scopes: [...new Set(scp)],
      roles: [...new Set(roles)],
      identityType: typeof payload.scp === 'string' ? 'session' : 'service',
      sessionId: typeof payload.sid === 'string' && payload.sid ? payload.sid : undefined,
      claims: { ...payload },
    };
  }

  /**
   * Entra's webhooks are Microsoft Graph change notifications: one delivery carries several notifications, and the
   * endpoint must answer Graph's validation handshake, neither of which an `AuthWebhookHandler` can express.
   */
  createWebhookHandler(): AuthWebhookHandler {
    throw new AuthError(
      'auth/not-supported',
      'Entra sends Microsoft Graph change notifications: receive them through WebhookServer with entraWebhookAuth, and read them with entraAuthEvents',
    );
  }

  /**
   * The tenant's issuer and keys, read again when they're older than `keysMaxAgeMs`, or when a token names a key id
   * not seen yet (at most once per `keysCooldownMs`). When a read fails, the keys in hand keep being used.
   */
  private async metadata(kid: string): Promise<Metadata> {
    const fresh = this.meta && this.now() - this.meta.loadedAt < this.maxAgeMs;
    const unknownKey = this.meta && !this.meta.keys.has(kid) && this.now() - this.lastLoad >= this.cooldownMs;
    if (this.meta && fresh && !unknownKey) return this.meta;
    const known = this.meta;
    this.loading ??= this.load()
      .then((meta) => {
        this.meta = meta;
        return meta;
      })
      .catch((error: unknown) => {
        if (known) return known;
        throw error instanceof AuthError ? error : new AuthError('auth/identity-provider', `Entra: the tenant's signing keys couldn't be read (${(error as { code?: string }).code ?? 'error'})`);
      })
      .finally(() => {
        this.loading = undefined;
      });
    return this.loading;
  }

  private async load(): Promise<Metadata> {
    this.lastLoad = this.now();
    const doc = await entraRequest(null, this.deps, 'discovery.get', { method: 'GET', url: this.ep.discovery }, Discovery);
    if (!doc.issuer.startsWith('https://') || !doc.jwks_uri.startsWith('https://')) {
      throw new AuthError('auth/identity-provider', "Entra: the tenant's OpenID configuration names a non-https issuer or keys");
    }
    const set = await entraRequest(null, this.deps, 'keys.list', { method: 'GET', url: doc.jwks_uri }, KeySet);
    return { issuer: doc.issuer, keys: new Map(set.keys.map((k) => [k.kid, k])), loadedAt: this.now() };
  }
}
