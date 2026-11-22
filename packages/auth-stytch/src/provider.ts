import { createLocalJWKSet, errors as joseErrors, type JWTPayload, type JWTVerifyGetKey, jwtVerify } from 'jose';
import { AuthError } from '@mariachi/core';
import type { AuthProvider, AuthProviderWebhookConfig, ResolvedIdentity } from '@mariachi/auth';
import { ProviderError } from '@mariachi/integrations';
import { type StytchDeps, segment, stytchApiBaseUrl, stytchCall, stytchIssuer } from './api';
import type { StytchConfig } from './generated';
import { StytchJwks, StytchSessionAuthenticated } from './schemas';
import { StytchWebhookHandler } from './webhooks';

/** The claim a Stytch session JWT carries its session in. */
export const STYTCH_SESSION_CLAIM = 'https://stytch.com/session';

/** Stytch's JWKS holds RSA keys; never an HMAC algorithm. */
const ALGORITHMS = ['RS256', 'RS384', 'RS512', 'PS256', 'PS384', 'PS512'];

export interface StytchAuthConfig extends Partial<Omit<StytchConfig, 'projectId'>> {
  /** The environment's project id (`STYTCH_PROJECT_ID`): the audience of its JWTs and part of their issuer. */
  projectId: string;
  /**
   * Also check with Stytch (`sessions.authenticate`) any JWT issued more than this many seconds ago, so a revoked
   * session stops working before its JWT's five minutes are up. `0` checks every token. Needs `secret`. Unset (the
   * default), JWTs are only checked locally, as Stytch's own SDKs do.
   */
  maxTokenAgeSeconds?: number;
  /** Clock skew allowed on `exp`, `nbf` and `iat`, in seconds. Default 5. */
  clockToleranceSeconds?: number;
  /** How long a fetched JWKS is trusted before it's fetched again, in ms. Default 10 minutes. */
  jwksCacheMaxAgeMs?: number;
  /** The least time between two JWKS fetches caused by an unknown `kid`, in ms. Default 30 000. */
  jwksCooldownMs?: number;
}

/** What the `https://stytch.com/session` claim holds. */
interface SessionClaim {
  id: string;
  started_at?: string;
  last_accessed_at?: string;
  expires_at?: string;
  roles?: unknown;
  authentication_factors?: unknown;
}

function sessionClaim(payload: JWTPayload): SessionClaim | undefined {
  const claim = payload[STYTCH_SESSION_CLAIM] as Partial<SessionClaim> | undefined;
  return claim && typeof claim === 'object' && typeof claim.id === 'string' && claim.id ? (claim as SessionClaim) : undefined;
}

function strings(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.length > 0) : [];
}

/**
 * Verifies Stytch (Consumer) session JWTs against the project's JWKS and maps them onto `ResolvedIdentity`:
 *
 * - `sub` → `userId`; the `https://stytch.com/session` claim's `id` → `sessionId` and its `roles` → `roles`;
 * - `tenantId` is empty (a Consumer project has no organizations): give tenants after verification;
 * - the whole verified payload (custom claims included) → `claims`.
 *
 * The signature, `aud` (the project id), `iss` (`stytch.com/<projectId>`, or the API's base URL) and `exp` are
 * checked on every call, locally: a session revoked at Stytch keeps passing until its JWT expires (five minutes),
 * unless `maxTokenAgeSeconds` asks for a check with Stytch. A token without a session claim (an M2M or Connected
 * Apps token from the same project) is refused. The JWKS is fetched through `callProvider` (`stytch sessions.jwks`)
 * and cached.
 */
export class StytchAuthProvider implements AuthProvider {
  readonly name = 'stytch';

  private readonly issuers: string[];
  private readonly clockTolerance: number;
  private readonly cacheMaxAgeMs: number;
  private readonly cooldownMs: number;
  private keys?: { get: JWTVerifyGetKey; fetchedAt: number };
  private loading?: Promise<JWTVerifyGetKey>;
  private readonly getKey: JWTVerifyGetKey;

  constructor(
    private readonly config: StytchAuthConfig,
    private readonly deps: StytchDeps & { now?: () => number } = {},
    /** A key set to use in place of the project's published one (tests). */
    jwks?: JWTVerifyGetKey,
  ) {
    if (!config.projectId) throw new AuthError('auth/invalid-config', 'Stytch: `projectId` is required');
    if (config.maxTokenAgeSeconds !== undefined && !config.secret) {
      throw new AuthError('auth/invalid-config', 'Stytch: `maxTokenAgeSeconds` checks sessions with Stytch, which needs `secret`');
    }
    this.issuers = [stytchIssuer(config.projectId), stytchApiBaseUrl(config.projectId)];
    this.clockTolerance = config.clockToleranceSeconds ?? 5;
    this.cacheMaxAgeMs = config.jwksCacheMaxAgeMs ?? 600_000;
    this.cooldownMs = config.jwksCooldownMs ?? 30_000;
    this.getKey = jwks ?? ((header, token) => this.publishedKey(header, token));
  }

  async verify(token: string): Promise<ResolvedIdentity> {
    let payload: JWTPayload;
    try {
      ({ payload } = await jwtVerify(token, this.getKey, {
        algorithms: ALGORITHMS,
        issuer: this.issuers,
        audience: this.config.projectId,
        typ: 'JWT',
        clockTolerance: this.clockTolerance,
        currentDate: this.deps.now ? new Date(this.deps.now()) : undefined,
        requiredClaims: ['sub', 'exp', 'iat'],
      }));
    } catch (error) {
      if (error instanceof AuthError) throw error;
      if (error instanceof joseErrors.JWTExpired) throw new AuthError('auth/token-expired', 'Stytch session JWT expired: refresh it');
      throw new AuthError('auth/invalid-token', `Stytch token verification failed: ${(error as Error).message}`);
    }
    const claim = sessionClaim(payload);
    if (!claim) throw new AuthError('auth/invalid-token', 'Stytch token is not a session JWT (no https://stytch.com/session claim)');

    const max = this.config.maxTokenAgeSeconds;
    const nowSeconds = (this.deps.now?.() ?? Date.now()) / 1000;
    if (max !== undefined && nowSeconds - (payload.iat ?? 0) >= max) {
      return this.checkWithStytch(token, payload, claim);
    }
    return this.toIdentity(payload, claim, strings(claim.roles));
  }

  /** The mapping `verify` applies to a verified payload. */
  toIdentity(payload: JWTPayload, claim: SessionClaim, roles: string[]): ResolvedIdentity {
    return {
      userId: payload.sub as string,
      tenantId: '',
      scopes: [],
      roles,
      identityType: 'session',
      sessionId: claim.id,
      claims: { ...payload },
    };
  }

  /** A handler for Stytch's webhooks. `secret` is the endpoint's signing secret (`whsec_…`) from the Dashboard. */
  createWebhookHandler(config: AuthProviderWebhookConfig): StytchWebhookHandler {
    return new StytchWebhookHandler({ secret: config.secret });
  }

  /** `sessions.authenticate` with the JWT: the session must still be alive at Stytch, and be the one the JWT names. */
  private async checkWithStytch(token: string, payload: JWTPayload, claim: SessionClaim): Promise<ResolvedIdentity> {
    try {
      const res = await stytchCall(
        null,
        { projectId: this.config.projectId, secret: this.config.secret, deps: this.deps },
        'sessions.authenticate',
        { method: 'POST', path: '/v1/sessions/authenticate', json: { session_jwt: token } },
        StytchSessionAuthenticated,
      );
      if (res.session.user_id !== payload.sub || res.session.session_id !== claim.id) {
        throw new AuthError('auth/invalid-token', 'Stytch returned a different session for this JWT');
      }
      return this.toIdentity(payload, claim, res.session.roles);
    } catch (error) {
      if (error instanceof AuthError) throw error;
      if (error instanceof ProviderError && ['not-found', 'unauthorized', 'invalid-request'].includes(error.category)) {
        throw new AuthError('auth/invalid-session', 'Stytch: the session has ended', { providerCode: error.providerCode });
      }
      const meta = error instanceof ProviderError ? { providerCode: error.providerCode, category: error.category } : {};
      throw new AuthError('auth/identity-provider', 'Stytch could not check the session', meta);
    }
  }

  /** A key from the published JWKS; an unknown `kid` (a rotation) fetches it again, at most once per cooldown. */
  private async publishedKey(...args: Parameters<JWTVerifyGetKey>): Promise<Awaited<ReturnType<JWTVerifyGetKey>>> {
    const now = this.deps.now?.() ?? Date.now();
    const cached = this.keys && now - this.keys.fetchedAt < this.cacheMaxAgeMs ? this.keys.get : await this.load();
    try {
      return await cached(...args);
    } catch (error) {
      if (!(error instanceof joseErrors.JWKSNoMatchingKey) || !this.keys || now - this.keys.fetchedAt < this.cooldownMs) throw error;
      return (await this.load())(...args);
    }
  }

  private load(): Promise<JWTVerifyGetKey> {
    this.loading ??= stytchCall(
      null,
      { projectId: this.config.projectId, deps: this.deps },
      'sessions.jwks',
      { method: 'GET', path: `/v1/sessions/jwks/${segment(this.config.projectId)}` },
      StytchJwks,
    )
      .then((jwks) => {
        const get = createLocalJWKSet({ keys: jwks.keys as never });
        this.keys = { get, fetchedAt: this.deps.now?.() ?? Date.now() };
        return get;
      })
      .catch((error) => {
        throw new AuthError('auth/identity-provider', "Stytch: couldn't read the project's JWKS", error instanceof ProviderError ? { providerCode: error.providerCode, category: error.category } : {});
      })
      .finally(() => {
        this.loading = undefined;
      });
    return this.loading;
  }
}
