import type { AuthProvider, AuthProviderWebhookConfig, ResolvedIdentity } from '@mariachi/auth';
import { type OidcClaims, type OidcConfig, OidcAuthProvider } from '@mariachi/auth-oidc';
import { AuthError, isReservedTenantId } from '@mariachi/core';
import type { JWTVerifyGetKey } from 'jose';
import { auth0Host } from './domain';
import { Auth0WebhookHandler } from './webhooks';

/**
 * How `Auth0AuthProvider` checks tokens. `domain`, `clientId` and `audience` are the settings of the same names;
 * the claim options are `@mariachi/auth-oidc`'s, for the custom claims an Auth0 Action adds.
 */
export interface Auth0AuthConfig
  extends Omit<OidcConfig, 'issuer' | 'audience' | 'jwksUrl' | 'discoveryUrl' | 'userIdClaim'> {
  /** `AUTH0_DOMAIN`: the domain tokens are issued on (the custom domain, when sign-in goes through one). */
  domain: string;
  /** `AUTH0_CLIENT_ID`. The audience when there's no `audience`: ID tokens are issued to the client. */
  clientId?: string;
  /**
   * `AUTH0_AUDIENCE`, the API identifier: only access tokens for that API are accepted (an ID token's `aud` is the
   * client ID, so it isn't). Without it, `clientId` is the audience and the app's ID tokens are accepted.
   */
  audience?: string | string[];
}

/**
 * Verifies tokens Auth0 issues, through `@mariachi/auth-oidc`, against the tenant's keys at
 * `https://<domain>/.well-known/jwks.json`, with issuer `https://<domain>/` (the trailing slash is Auth0's), the
 * audience, `exp` and `nbf`, and RS256 only unless `algorithms` says otherwise (never HMAC). Maps:
 *
 * - `sub` → `userId` (`auth0|…`, `google-oauth2|…`), `sid` → `sessionId`;
 * - `org_id` → `tenantId` (Auth0 Organizations), empty without one; a `user.` tenant (the personal namespace) is refused;
 * - `permissions` (RBAC's "Add Permissions in the Access Token") and `scope` → `scopes`;
 * - roles from `rolesClaim`: Auth0 puts none in tokens itself, so an Action adds a namespaced claim
 *   (`https://app.example.com/roles`) and this names it;
 * - the whole verified payload → `claims`.
 */
export class Auth0AuthProvider implements AuthProvider {
  readonly name = 'auth0';
  private readonly oidc: OidcAuthProvider;
  /** `https://<domain>/`, exactly as Auth0 writes `iss`. */
  readonly issuer: string;

  constructor(
    private readonly config: Auth0AuthConfig,
    /** A key set to use in place of the tenant's published one (tests: `testAuth0Auth` from `./testing`). */
    jwks?: JWTVerifyGetKey,
  ) {
    const host = auth0Host(config.domain);
    const audience = config.audience ?? config.clientId;
    if (!audience || (Array.isArray(audience) && audience.length === 0)) {
      throw new AuthError('auth/invalid-config', 'Auth0: set `audience` (the API identifier) to accept access tokens, or `clientId` to accept ID tokens');
    }
    const { domain: _domain, clientId: _clientId, audience: _audience, ...claims } = config;
    this.issuer = `https://${host}/`;
    this.oidc = new OidcAuthProvider(
      { algorithms: ['RS256'], ...claims, issuer: this.issuer, audience, jwksUrl: `https://${host}/.well-known/jwks.json` },
      jwks,
    );
  }

  async verify(token: string): Promise<ResolvedIdentity> {
    return this.checked(await this.oidc.verify(token));
  }

  /** The mapping `verify` applies to a verified payload. */
  toIdentity(claims: OidcClaims): ResolvedIdentity {
    return this.checked(this.oidc.toIdentity(claims));
  }

  private checked(identity: ResolvedIdentity): ResolvedIdentity {
    // Personal tenants are given after verification (withPersonalTenants), never read from a claim.
    if (isReservedTenantId(identity.tenantId)) {
      throw new AuthError('auth/invalid-token', 'Auth0 token names a tenant in the reserved personal-tenant namespace');
    }
    return identity;
  }

  /** A handler for a webhook event stream. `secret` is the stream's bearer token (`AUTH0_EVENT_STREAM_TOKEN`). */
  createWebhookHandler(config: AuthProviderWebhookConfig): Auth0WebhookHandler {
    return new Auth0WebhookHandler({ token: config.secret });
  }
}
