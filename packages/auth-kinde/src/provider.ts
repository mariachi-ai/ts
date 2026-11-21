import { createRemoteJWKSet, type JWTPayload, type JWTVerifyGetKey, jwtVerify } from 'jose';
import { AuthError, isReservedTenantId } from '@mariachi/core';
import type { AuthProvider, ResolvedIdentity } from '@mariachi/auth';
import { KindeWebhookHandler } from './webhooks';

export interface KindeAuthConfig {
  /** The Kinde domain (`KINDE_ISSUER_URL`): `https://<subdomain>.kinde.com`, or a custom domain. Tokens carry it as `iss`. */
  issuerUrl: string;
  /**
   * The application or applications tokens may have been issued to: a token's `azp` must be one of them. Pass
   * the back-end app's client id (`KINDE_CLIENT_ID`), and any other app (a front end, a machine-to-machine app)
   * whose tokens this API accepts. Unset, any application of the business is accepted.
   */
  clientId?: string | string[];
  /**
   * The `aud` an access token must carry: your API's audience, as registered in Kinde (Settings › APIs) and
   * requested at sign-in (`audience`). Set it: Kinde puts only the audiences a sign-in asked for in `aud`, so
   * without it a token meant for another API of the same business is accepted.
   */
  audience?: string | string[];
  /** Where the keys are. Default `<issuerUrl>/.well-known/jwks`. */
  jwksUrl?: string;
  /** How long fetched keys are trusted, in ms. Default 10 minutes. */
  jwksCacheMaxAgeMs?: number;
  /** The least time between two key fetches caused by an unknown `kid`, in ms. Default 30 000. */
  jwksCooldownMs?: number;
  /** Clock skew allowed on `exp`, `nbf` and `iat`, in seconds. Default 5. */
  clockToleranceSeconds?: number;
}

/** Kinde access-token claims this package reads; the rest stay in `claims`. */
export interface KindeAccessClaims extends JWTPayload {
  azp?: string;
  org_code?: string;
  permissions?: unknown;
  roles?: unknown;
  scp?: unknown;
  feature_flags?: unknown;
}

/** The issuer without a trailing slash, checked to be https (http only on this machine). */
export function kindeIssuer(issuerUrl: string): string {
  let url: URL;
  try {
    url = new URL(issuerUrl);
  } catch {
    throw new AuthError('auth/invalid-config', 'Kinde: `issuerUrl` is not a URL (https://<subdomain>.kinde.com)');
  }
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) {
    throw new AuthError('auth/invalid-config', 'Kinde: `issuerUrl` must be https://');
  }
  return `${url.origin}${url.pathname}`.replace(/\/+$/, '');
}

function strings(value: unknown): string[] {
  if (typeof value === 'string' && value) return [value];
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry === 'string' && entry) return [entry];
    // Kinde's `roles` claim lists objects: `{ id, key, name }`. The key is the stable one.
    const key = (entry as { key?: unknown } | null)?.key;
    return typeof key === 'string' && key ? [key] : [];
  });
}

/**
 * Verifies tokens Kinde issues against the business's keys (`<issuerUrl>/.well-known/jwks`, RS256) and maps an
 * access token onto `ResolvedIdentity`:
 *
 * - `sub` → `userId`; `org_code` (the organization the user signed in to) → `tenantId`;
 * - `permissions` → `scopes`; `roles` (when the token includes them: each role's `key`) → `roles`;
 * - the whole verified payload (`feature_flags`, `scp`, `azp`, …) → `claims`.
 *
 * Kinde access tokens carry no session id, so `sessionId` is unset. The issuer is checked exactly; `aud` when
 * `audience` is set (do set it); `azp` when `clientId` is.
 */
export class KindeAuthProvider implements AuthProvider {
  readonly name = 'kinde';

  private readonly issuer: string;
  private readonly jwks: JWTVerifyGetKey;
  private readonly clientIds: string[] | undefined;

  constructor(
    private readonly config: KindeAuthConfig,
    /** A key set to use in place of Kinde's (tests: `kindeTestKeys` from `@mariachi/auth-kinde/testing`). */
    jwks?: JWTVerifyGetKey,
  ) {
    if (!config.issuerUrl) throw new AuthError('auth/invalid-config', 'Kinde: `issuerUrl` is required');
    this.issuer = kindeIssuer(config.issuerUrl);
    this.clientIds = config.clientId === undefined ? undefined : [config.clientId].flat().filter(Boolean);
    this.jwks =
      jwks ??
      createRemoteJWKSet(new URL(config.jwksUrl ?? `${this.issuer}/.well-known/jwks`), {
        cacheMaxAge: config.jwksCacheMaxAgeMs ?? 600_000,
        cooldownDuration: config.jwksCooldownMs ?? 30_000,
      });
  }

  /** Verifies an access token and resolves who it is for. */
  async verify(token: string): Promise<ResolvedIdentity> {
    const claims = await this.verified(token, this.config.audience);
    return this.toIdentity(claims as KindeAccessClaims);
  }

  /**
   * Verifies an ID token (signature, issuer, times, and `azp` when `clientId` is set) and returns its claims:
   * `sub`, `email`, `given_name`, `family_name`, `picture`, `org_codes`. Not for authorizing API calls: use
   * `verify` with an access token for that.
   */
  async verifyIdToken(token: string): Promise<JWTPayload> {
    return this.verified(token, undefined);
  }

  private async verified(token: string, audience: string | string[] | undefined): Promise<JWTPayload> {
    let payload: JWTPayload;
    try {
      ({ payload } = await jwtVerify(token, this.jwks, {
        algorithms: ['RS256'],
        issuer: this.issuer,
        audience,
        clockTolerance: this.config.clockToleranceSeconds ?? 5,
        requiredClaims: ['sub', 'exp'],
      }));
    } catch (error) {
      throw new AuthError('auth/invalid-token', `Kinde token verification failed: ${(error as Error).message}`);
    }
    if (this.clientIds && !(typeof payload.azp === 'string' && this.clientIds.includes(payload.azp))) {
      throw new AuthError('auth/invalid-token', 'Kinde token verification failed: issued to another application');
    }
    return payload;
  }

  /** The mapping `verify` applies to a verified access token's payload. */
  toIdentity(claims: KindeAccessClaims): ResolvedIdentity {
    if (typeof claims.sub !== 'string' || !claims.sub) throw new AuthError('auth/invalid-token', 'Kinde token has no subject');
    const tenantId = typeof claims.org_code === 'string' ? claims.org_code : '';
    // Personal tenants are given after verification (withPersonalTenants), never read from a claim.
    if (isReservedTenantId(tenantId || undefined)) {
      throw new AuthError('auth/invalid-token', 'Kinde token names a tenant in the reserved personal-tenant namespace');
    }
    return {
      userId: claims.sub,
      tenantId,
      scopes: [...new Set(strings(claims.permissions))],
      roles: [...new Set(strings(claims.roles))],
      identityType: 'session',
      claims: { ...claims },
    };
  }

  /**
   * A handler for `createAuthWebhookDispatcher`, verifying deliveries against this business's keys. Kinde signs
   * webhooks with its keys rather than a shared secret, so `config.secret` is not used and may be omitted.
   * With `WebhookServer`, use `kindeWebhookAuth` instead.
   */
  createWebhookHandler(_config?: { secret?: string }): KindeWebhookHandler {
    return new KindeWebhookHandler({ issuerUrl: this.issuer, jwks: this.jwks });
  }
}
