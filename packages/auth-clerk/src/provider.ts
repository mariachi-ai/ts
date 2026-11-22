import type { JsonWebKey } from 'node:crypto';
import { createClerkClient, verifyToken, type ClerkClient } from '@clerk/backend';
import { decodeJwt, verifyJwt } from '@clerk/backend/jwt';
import { AuthError, isReservedTenantId } from '@mariachi/core';
import { type FailureInfo, type ProviderDeps, ProviderError, mappedFailure, providerRequest } from '@mariachi/integrations';
import { z } from 'zod';
import { errorMap, provider } from './generated';
import type { AuthProvider, AuthProviderWebhookConfig, ResolvedIdentity } from '@mariachi/auth';
import type { AuthWebhookHandler } from '@mariachi/auth';
import type { ClerkConfig } from './types';
import { ClerkWebhookHandler } from './webhooks/handler';

/** The session-token claims this package reads; the rest stay in `claims`. */
export interface ClerkSessionClaims {
  sub?: string;
  sid?: string;
  org_id?: string;
  org_role?: string;
  org_permissions?: unknown;
  [claim: string]: unknown;
}

/**
 * The mapping `ClerkAuthProvider.verify` applies to a verified payload: `sub` → `userId`, `sid` →
 * `sessionId`, `org_id` → `tenantId` (empty for a user acting in no organization), `org_role` →
 * `roles` and `scopes`, `org_permissions` → `scopes`, and the whole payload → `claims`.
 */
export function clerkIdentity(payload: ClerkSessionClaims): ResolvedIdentity {
  if (typeof payload.sub !== 'string' || !payload.sub) throw new AuthError('auth/invalid-token', 'Clerk token has no subject');
  const tenantId = typeof payload.org_id === 'string' ? payload.org_id : '';
  // Personal tenants are given after verification (withPersonalTenants), never read from a claim.
  if (isReservedTenantId(tenantId)) throw new AuthError('auth/invalid-token', 'Clerk token names a tenant in the reserved personal-tenant namespace');
  const roles = typeof payload.org_role === 'string' && payload.org_role ? [payload.org_role] : [];
  const permissions = Array.isArray(payload.org_permissions) ? payload.org_permissions.filter((p): p is string => typeof p === 'string') : [];
  return {
    userId: payload.sub,
    tenantId,
    scopes: [...new Set([...roles, ...permissions])],
    roles,
    identityType: 'session',
    sessionId: typeof payload.sid === 'string' ? payload.sid : undefined,
    claims: { ...payload },
  };
}

/** The tracer, metrics and retry settings for the key fetches, from the container. All optional. */
export interface ClerkDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

/** How long fetched keys are trusted, as Clerk's SDK does: five minutes. */
const KEYS_MAX_AGE_MS = 5 * 60_000;
/** The least time between two fetches caused by a key the set doesn't have. */
const KEYS_COOLDOWN_MS = 5_000;

const Jwks = z.object({ keys: z.array(z.object({ kid: z.string() }).passthrough()) });

/**
 * Verifies Clerk session tokens. With `jwtKey`, locally and with no call to Clerk. Without it, against the
 * instance's keys from the Backend API (`GET /v1/jwks`), fetched through `callProvider` (one `clerk jwks.get` CLIENT
 * span, retried when rate limited or down) and kept for five minutes; the token's claims are checked by Clerk's
 * own `verifyJwt`. `verify` has no context, so the spans have no tenant.
 *
 * `client` is Clerk's SDK client as it comes: calls made through it are the app's own, without the span.
 */
export class ClerkAuthProvider implements AuthProvider {
  readonly name = 'clerk';
  private readonly clerk: ClerkClient;
  private readonly config: ClerkConfig;
  private keys?: { byKid: Map<string, JsonWebKey>; fetchedAt: number };
  /** The last key fetch that failed, and when: within the cooldown it fails again without calling Clerk. */
  private failed?: { error: unknown; at: number };
  private loading?: Promise<Map<string, JsonWebKey>>;

  constructor(
    config: ClerkConfig,
    /** The tracer and metrics for the key fetches. Without them, spans go through `@opentelemetry/api` when it's installed. */
    private readonly deps: ClerkDeps = {},
  ) {
    this.config = config;
    this.clerk = createClerkClient({
      secretKey: config.secretKey,
      publishableKey: config.publishableKey,
    });
  }

  async verify(token: string): Promise<ResolvedIdentity> {
    let payload: ClerkSessionClaims;
    try {
      payload = (
        this.config.jwtKey
          ? await verifyToken(token, { secretKey: this.config.secretKey, authorizedParties: this.config.authorizedParties, jwtKey: this.config.jwtKey })
          : await verifyJwt(token, { key: await this.signingKey(token), authorizedParties: this.config.authorizedParties })
      ) as ClerkSessionClaims;
    } catch (error) {
      // A key fetch that failed keeps its status and category; the token itself was never checked
      const meta = error instanceof ProviderError ? { status: error.status, category: error.category, providerCode: error.providerCode } : undefined;
      throw new AuthError('auth/invalid-token', `Clerk token verification failed: ${(error as Error).message}`, meta);
    }
    return clerkIdentity(payload);
  }

  /** The instance key the token names (`kid`), from the keys in hand or, when they're stale or lack it, Clerk's. */
  private async signingKey(token: string): Promise<JsonWebKey> {
    const { kid } = decodeJwt(token).header;
    if (!kid) throw new AuthError('auth/invalid-token', 'the token names no signing key (kid)');
    const now = Date.now();
    const keys = this.keys;
    const fresh = keys !== undefined && now - keys.fetchedAt < KEYS_MAX_AGE_MS;
    if (fresh && keys.byKid.has(kid)) return keys.byKid.get(kid) as JsonWebKey;
    // An unknown key refetches, but not more than once per cooldown: a made-up kid can't make every request call Clerk
    if (!(fresh && now - keys.fetchedAt < KEYS_COOLDOWN_MS) && this.failed && now - this.failed.at < KEYS_COOLDOWN_MS) {
      // Nor can an outage: a fetch that just failed fails again until the cooldown is over
      throw this.failed.error;
    }
    const byKid = fresh && now - keys.fetchedAt < KEYS_COOLDOWN_MS ? keys.byKid : await this.loadKeys();
    const key = byKid.get(kid);
    if (!key) throw new AuthError('auth/invalid-token', "the token is signed with a key the instance's JWKS doesn't have");
    return key;
  }

  /** `GET https://api.clerk.com/v1/jwks` with the secret key, one fetch at a time. */
  private loadKeys(): Promise<Map<string, JsonWebKey>> {
    this.loading ??= providerRequest(
      null,
      { integration: provider.id, operation: 'jwks.get', category: provider.category, server: provider.server },
      { method: 'GET', url: `https://${provider.server}/v1/jwks`, headers: { authorization: `Bearer ${this.config.secretKey}` } },
      { schema: Jwks, failure: clerkFailure, deps: this.deps },
    )
      .then(({ keys }) => {
        const byKid = new Map(keys.map((key) => [key.kid, key as JsonWebKey]));
        this.keys = { byKid, fetchedAt: Date.now() };
        this.failed = undefined;
        return byKid;
      })
      .catch((error: unknown) => {
        this.failed = { error, at: Date.now() };
        throw error;
      })
      .finally(() => {
        this.loading = undefined;
      });
    return this.loading;
  }

  createWebhookHandler(config: AuthProviderWebhookConfig): AuthWebhookHandler {
    return new ClerkWebhookHandler(config.secret);
  }

  /** Access the underlying Clerk SDK client for provider-specific operations */
  get client(): ClerkClient {
    return this.clerk;
  }
}

/** The Backend API's error body is `{ errors: [{ code, message }] }`: the code is kept, the message isn't. */
function clerkFailure(_status: number, body: unknown): FailureInfo | undefined {
  const raw = (body as { errors?: Array<{ code?: unknown }> } | null)?.errors?.[0]?.code;
  const code = typeof raw === 'string' && /^[a-z][a-z0-9_]*$/.test(raw) ? raw : undefined;
  const mapped = mappedFailure(errorMap, code);
  return { providerCode: code, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}
