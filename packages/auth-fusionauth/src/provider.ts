import { createRemoteJWKSet, customFetch, jwtVerify } from 'jose';
import { AuthError, isReservedTenantId } from '@mariachi/core';
import { ProviderError } from '@mariachi/integrations';
import type {
  AuthProvider,
  AuthProviderWebhookConfig,
  ResolvedIdentity,
} from '@mariachi/auth';
import { type FusionAuthDeps, jwksFetch } from './provider-fetch';
import type { FusionAuthConfig } from './types';
import { FusionAuthWebhookHandler } from './webhooks/handler';

/** FusionAuth access token payload claims (subset we use) */
interface FusionAuthJwtPayload {
  sub: string;
  applicationId?: string;
  tid?: string;
  roles?: string[];
  aud?: string | string[];
  iss?: string;
  sid?: string;
}

/**
 * Verifies FusionAuth access tokens against the server's keys (`/.well-known/jwks.json`). The keys are fetched
 * through `callProvider`, one `fusionauth jwks.get` CLIENT span each time, with retries of rate limits and outages;
 * checking a token against keys in hand calls nothing. `verify` has no context, so the spans have no tenant.
 */
export class FusionAuthAuthProvider implements AuthProvider {
  readonly name = 'fusionauth';

  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;
  private readonly config: FusionAuthConfig;

  constructor(
    config: FusionAuthConfig,
    /** The tracer and metrics for the key fetches. Without them, spans go through `@opentelemetry/api` when it's installed. */
    private readonly deps: FusionAuthDeps = {},
  ) {
    this.config = config;
    if (!config.issuer) {
      const message = 'FusionAuth: no `issuer` configured, so the tokens\' `iss` is not checked (the audience still is). Set it to the tenant\'s Issuer.';
      if (config.logger) config.logger.warn({ provider: 'fusionauth' }, message);
      else process.emitWarning(message, { code: 'MARIACHI_FUSIONAUTH_ISSUER' });
    }
    const baseUrl = config.serverUrl.replace(/\/$/, '');
    const jwksUrl = new URL('/.well-known/jwks.json', baseUrl);
    this.jwks = createRemoteJWKSet(jwksUrl, { [customFetch]: jwksFetch(deps) });
  }

  async verify(token: string): Promise<ResolvedIdentity> {
    try {
      const verifyOpts: { audience?: string; issuer?: string; algorithms: string[] } = {
        algorithms: ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512'],
      };
      if (this.config.clientId) verifyOpts.audience = this.config.clientId;
      if (this.config.issuer) verifyOpts.issuer = this.config.issuer;
      const { payload } = await jwtVerify(token, this.jwks, verifyOpts);

      const claims = payload as unknown as FusionAuthJwtPayload;
      const roles = Array.isArray(claims.roles) ? claims.roles : [];
      const tenantId = claims.tid ?? claims.applicationId ?? '';
      // Personal tenants are given after verification (withPersonalTenants), never read from a claim.
      if (isReservedTenantId(tenantId)) throw new AuthError('auth/invalid-token', 'token names a tenant in the reserved personal-tenant namespace');

      return {
        userId: claims.sub,
        tenantId,
        scopes: roles,
        roles,
        identityType: 'session',
        sessionId: claims.sid,
        claims: { ...payload },
      };
    } catch (error) {
      // A key fetch that failed keeps its status and category; the token itself was never checked
      const provider = error instanceof ProviderError ? { status: error.status, category: error.category } : undefined;
      throw new AuthError(
        'auth/invalid-token',
        `FusionAuth token verification failed: ${(error as Error).message}`,
        provider,
      );
    }
  }

  createWebhookHandler(config: AuthProviderWebhookConfig): FusionAuthWebhookHandler {
    return new FusionAuthWebhookHandler(
      {
        serverUrl: this.config.serverUrl,
        secret: config.secret,
      },
      this.deps,
    );
  }
}
