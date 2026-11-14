import { createClerkClient, verifyToken, type ClerkClient } from '@clerk/backend';
import { AuthError, isReservedTenantId } from '@mariachi/core';
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

export class ClerkAuthProvider implements AuthProvider {
  readonly name = 'clerk';
  private readonly clerk: ClerkClient;
  private readonly config: ClerkConfig;

  constructor(config: ClerkConfig) {
    this.config = config;
    this.clerk = createClerkClient({
      secretKey: config.secretKey,
      publishableKey: config.publishableKey,
    });
  }

  async verify(token: string): Promise<ResolvedIdentity> {
    let payload: ClerkSessionClaims;
    try {
      payload = (await verifyToken(token, {
        secretKey: this.config.secretKey,
        authorizedParties: this.config.authorizedParties,
        jwtKey: this.config.jwtKey,
      })) as ClerkSessionClaims;
    } catch (error) {
      throw new AuthError('auth/invalid-token', `Clerk token verification failed: ${(error as Error).message}`);
    }
    return clerkIdentity(payload);
  }

  createWebhookHandler(config: AuthProviderWebhookConfig): AuthWebhookHandler {
    return new ClerkWebhookHandler(config.secret);
  }

  /** Access the underlying Clerk SDK client for provider-specific operations */
  get client(): ClerkClient {
    return this.clerk;
  }
}
