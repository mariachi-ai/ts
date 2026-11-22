import { type JWTPayload, type JWTVerifyGetKey, createRemoteJWKSet, customFetch, jwtVerify } from 'jose';
import { AuthError, isReservedTenantId } from '@mariachi/core';
import type { AuthProvider, AuthWebhookHandler, ResolvedIdentity } from '@mariachi/auth';
import { providerRequest } from '@mariachi/integrations';
import { CognitoError } from './errors';
import { type CognitoConfig, provider } from './generated';
import { Jwks } from './schemas';
import { type CognitoDeps, assertTrustedAttribute, failure, idpHost, issuerOf } from './shared';

export interface CognitoAuthConfig extends Pick<CognitoConfig, 'region' | 'userPoolId' | 'clientId'> {
  /**
   * Which token the app accepts: `access` (the default: what an API should check) or `id` (the user's profile,
   * for an app that sends it instead). Cognito says which a token is in `token_use`; the other kind is refused.
   */
  tokenUse?: 'access' | 'id';
  /**
   * A claim that names the user's tenant, such as one a pre token generation trigger adds. Without it, `tenantId`
   * is empty: Cognito has no organizations of its own. A `custom:` attribute is refused unless `trustCustomAttributes`
   * is set: users can write their own custom attributes by default.
   */
  tenantClaim?: string;
  /**
   * Confirms that the `custom:` attribute named by `tenantClaim` can't be written by users: it is removed from every
   * app client's write attributes, or set only by AdminCreateUser or a trigger. Without it, a `custom:` `tenantClaim`
   * throws `ConfigError` `cognito/user-writable-attribute`.
   */
  trustCustomAttributes?: boolean;
  /** Clock skew allowed on `exp`, `nbf` and `iat`, in seconds. Default 5. */
  clockToleranceSeconds?: number;
  /** How long fetched keys are trusted before they're fetched again, in ms. Default 10 minutes. */
  jwksCacheMaxAgeMs?: number;
}

export interface CognitoAuthDeps extends CognitoDeps {
  /** Keys to verify with in place of the pool's (tests: `cognitoTestIssuer().jwks` from `./testing`). */
  jwks?: JWTVerifyGetKey;
}

/** The claims of a Cognito token this package reads; the rest stay in `claims`. */
export interface CognitoClaims extends JWTPayload {
  token_use?: 'access' | 'id';
  client_id?: string;
  username?: string;
  scope?: string;
  'cognito:groups'?: string[];
  'cognito:username'?: string;
  email?: string;
  email_verified?: boolean | string;
  [claim: string]: unknown;
}

/**
 * Verifies the ID or access tokens a Cognito user pool issues, as Cognito says to: an RS256 signature by one of the
 * pool's keys, `iss` the pool, `exp`, `token_use`, and the app client (`aud` on an ID token, `client_id` on an access
 * token). Maps them onto `ResolvedIdentity`:
 *
 * - `sub` → `userId`; `cognito:groups` → `roles`; the access token's space-separated `scope` → `scopes`;
 * - `tenantClaim`, when set, → `tenantId` (a `custom:` attribute only with `trustCustomAttributes`);
 * - the whole verified payload → `claims`.
 *
 * The keys are fetched through `callProvider` (span `cognito jwks.get`) and cached. A token revoked at Cognito (sign-out,
 * RevokeToken) still verifies until it expires: keep access tokens short-lived.
 */
export class CognitoAuthProvider implements AuthProvider {
  readonly name = 'cognito';

  private readonly issuer: string;
  private readonly tokenUse: 'access' | 'id';
  private readonly jwks: JWTVerifyGetKey;

  constructor(
    private readonly config: CognitoAuthConfig,
    deps: CognitoAuthDeps = {},
  ) {
    if (!config.clientId) throw new AuthError('auth/invalid-config', 'Cognito: `clientId` is required');
    assertTrustedAttribute('tenantClaim', config.tenantClaim, config.trustCustomAttributes);
    this.issuer = issuerOf(config.region, config.userPoolId);
    this.tokenUse = config.tokenUse ?? 'access';
    const host = idpHost(config.region);
    this.jwks =
      deps.jwks ??
      createRemoteJWKSet(new URL(`${this.issuer}/.well-known/jwks.json`), {
        cacheMaxAge: config.jwksCacheMaxAgeMs ?? 600_000,
        cooldownDuration: 30_000,
        // The keys come through callProvider like every call to Cognito: one span, retries on 5xx and rate limits
        [customFetch]: async (url: string) => {
          const keys = await providerRequest(null, { integration: provider.id, operation: 'jwks.get', category: provider.category, server: host }, { method: 'GET', url }, { schema: Jwks, error: CognitoError, failure, deps });
          return Response.json(keys);
        },
      });
  }

  async verify(token: string): Promise<ResolvedIdentity> {
    let claims: CognitoClaims;
    try {
      const result = await jwtVerify(token, this.jwks, {
        algorithms: ['RS256'],
        issuer: this.issuer,
        ...(this.tokenUse === 'id' ? { audience: this.config.clientId } : {}),
        clockTolerance: this.config.clockToleranceSeconds ?? 5,
        requiredClaims: ['sub', 'exp', 'token_use'],
      });
      claims = result.payload as CognitoClaims;
    } catch (error) {
      throw new AuthError('auth/invalid-token', `Cognito token verification failed: ${(error as Error).message}`);
    }
    if (claims.token_use !== this.tokenUse) {
      throw new AuthError('auth/invalid-token', `Cognito token refused: an ${this.tokenUse === 'access' ? 'access' : 'ID'} token is expected`);
    }
    if (this.tokenUse === 'access' && claims.client_id !== this.config.clientId) {
      throw new AuthError('auth/invalid-token', 'Cognito token refused: issued to another app client');
    }
    return this.toIdentity(claims);
  }

  /** The mapping `verify` applies to a verified payload. */
  toIdentity(claims: CognitoClaims): ResolvedIdentity {
    if (typeof claims.sub !== 'string' || !claims.sub) throw new AuthError('auth/invalid-token', 'Cognito token has no subject');
    const groups = Array.isArray(claims['cognito:groups']) ? claims['cognito:groups'].filter((g): g is string => typeof g === 'string' && g.length > 0) : [];
    const scopes = typeof claims.scope === 'string' ? claims.scope.split(/\s+/).filter(Boolean) : [];
    const tenant = this.config.tenantClaim ? claims[this.config.tenantClaim] : undefined;
    const tenantId = typeof tenant === 'string' ? tenant : '';
    // Personal tenants are given after verification (withPersonalTenants), never read from a claim
    if (isReservedTenantId(tenantId || undefined)) throw new AuthError('auth/invalid-token', 'Cognito token names a tenant in the reserved personal-tenant namespace');
    return { userId: claims.sub, tenantId, scopes: [...new Set(scopes)], roles: [...new Set(groups)], identityType: 'session', claims: { ...claims } };
  }

  /**
   * Cognito sends no webhooks: it runs Lambda triggers (post confirmation, pre token generation, ...) instead. Have a
   * trigger call the app's own endpoint, signed with `@mariachi/webhooks`, if the app needs to hear about sign-ups.
   */
  createWebhookHandler(): AuthWebhookHandler {
    throw new AuthError('auth/not-supported', 'Cognito sends no webhooks; it runs Lambda triggers instead');
  }
}
