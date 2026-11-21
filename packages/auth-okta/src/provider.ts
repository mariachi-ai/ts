import type { AuthProvider, AuthWebhookHandler, ResolvedIdentity } from '@mariachi/auth';
import { type ClaimSource, OidcAuthProvider, type OidcClaims } from '@mariachi/auth-oidc';
import { AuthError } from '@mariachi/core';
import type { JWTVerifyGetKey } from 'jose';
import type { OktaConfig } from './generated';
import { oktaAudience, oktaServer } from './server';

export interface OktaAuthOptions {
  /**
   * The clients whose access tokens are accepted (the token's `cid`). Default: `OKTA_CLIENT_ID` only. Add the
   * others that call your API with tokens from the same authorization server (a mobile app, say).
   */
  clientIds?: string[];
  /**
   * The claim holding the tenant, when the authorization server adds one (a custom claim). Default none: Okta
   * has no tenant claim of its own. It must be a claim only an admin can set, never one a user can edit.
   */
  tenantClaim?: ClaimSource<string>;
  /** The claim holding roles. Default `groups`, the groups claim an admin adds to the authorization server. */
  rolesClaim?: ClaimSource<string | string[]>;
  /** Clock skew allowed on `exp`, `nbf` and `iat`, in seconds. Default 5. */
  clockToleranceSeconds?: number;
}

/**
 * Verifies access tokens from an Okta custom authorization server (`OKTA_ISSUER`) against its published keys, and
 * maps them onto `ResolvedIdentity`:
 *
 * - `uid` (Okta's id for the user, `00u…`) → `userId`. Not `sub`: in an access token that's usually the user's
 *   login, which can change. A token with no `uid` has no user (a service app's) and is refused;
 * - `scp` → `scopes`; the groups claim → `roles`; the tenant claim, when set, → `tenantId`;
 * - the whole verified payload → `claims`.
 *
 * The signature (RS256), `iss`, `aud` (`OKTA_AUDIENCE`, `api://default` for the default server), `exp` and the
 * client (`cid`) are checked on every call. Only custom authorization servers: the org authorization server's
 * access tokens aren't meant for your API to validate.
 */
export class OktaAuthProvider implements AuthProvider {
  readonly name = 'okta';
  private readonly oidc: OidcAuthProvider;

  constructor(
    config: Pick<OktaConfig, 'issuer' | 'audience' | 'clientId'>,
    options: OktaAuthOptions = {},
    /** A key set in place of Okta's published one (tests). */
    jwks?: JWTVerifyGetKey,
  ) {
    if (!config.clientId) throw new AuthError('auth/invalid-config', 'Okta: OKTA_CLIENT_ID is required');
    const server = oktaServer(config.issuer);
    const clients = options.clientIds?.length ? options.clientIds : [config.clientId];
    this.oidc = new OidcAuthProvider(
      {
        issuer: server.issuer,
        audience: oktaAudience(server, config.audience),
        algorithms: ['RS256'],
        userIdClaim: 'uid',
        scopesClaim: 'scp',
        rolesClaim: options.rolesClaim ?? 'groups',
        tenantClaim: options.tenantClaim ?? (() => undefined),
        clockToleranceSeconds: options.clockToleranceSeconds,
        validate: (claims: OidcClaims) => {
          if (typeof claims.cid !== 'string' || !clients.includes(claims.cid)) {
            throw new AuthError('auth/invalid-token', 'Okta token refused: issued to a client that is not allowed');
          }
          if (typeof claims.uid !== 'string' || !claims.uid) {
            throw new AuthError('auth/invalid-token', 'Okta token refused: no user is bound to it (a service app token)');
          }
        },
      },
      jwks,
    );
  }

  async verify(token: string): Promise<ResolvedIdentity> {
    return this.oidc.verify(token);
  }

  /**
   * Not supported: an Okta Event Hook delivery carries several events, and the port's handler yields one. Receive
   * them through `WebhookServer` with `oktaWebhookAuth`, and turn each delivery into the port's events with
   * `oktaAuthEvents`.
   */
  createWebhookHandler(): AuthWebhookHandler {
    throw new AuthError(
      'auth/not-supported',
      'Okta Event Hooks deliver several events at once: receive them with oktaWebhookAuth on a WebhookServer and read them with oktaAuthEvents',
    );
  }
}
