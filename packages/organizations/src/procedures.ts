import { z } from 'zod';
import { MariachiError, type Context } from '@mariachi/core';
import type { CommunicationLayer } from '@mariachi/communication';
import type { InvitationDelivery } from './email';
import type { Organizations } from './organizations';
import { ORGANIZATION_ROLES, type Invitation, type Organization } from './types';

const id = z.string().uuid();
const role = z.enum(ORGANIZATION_ROLES);

export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  status: z.enum(['active', 'suspended', 'deleted']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const membershipSchema = z.object({
  organizationId: z.string(),
  userId: z.string(),
  role,
  status: z.enum(['active', 'removed']),
  email: z.string().nullable(),
  name: z.string().nullable(),
  invitedBy: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const invitationSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  email: z.string(),
  role,
  invitedBy: z.string(),
  expiresAt: z.date(),
  acceptedAt: z.date().nullable(),
  acceptedBy: z.string().nullable(),
  revokedAt: z.date().nullable(),
  createdAt: z.date(),
});

const done = z.object({ ok: z.literal(true) });
const issued = z.object({ invitation: invitationSchema, token: z.string().optional() });
const joined = z.object({ organization: organizationSchema, membership: membershipSchema });

/** A limit: at most `maxRequests` in `windowMs`. */
export interface OrganizationLimit {
  windowMs: number;
  maxRequests: number;
}

/** What a rate limiter must do here; `@mariachi/rate-limit`'s limiters fit. */
export interface OrganizationLimiter {
  check(key: string, rule: OrganizationLimit): Promise<{ allowed: boolean; retryAfterMs: number }>;
}

export interface OrganizationProcedureOptions {
  /**
   * Sends an invitation: email the link that carries `token`. When given, the token is not returned
   * to whoever invited, so it reaches only the invited address. Without it, the caller gets the token
   * and must deliver it.
   */
  deliverInvitation?: (ctx: Context, delivery: InvitationDelivery) => Promise<void>;
  /**
   * Limits creating organizations, inviting and accepting. Without one there are no limits here: give
   * the limiter your API uses.
   */
  limiter?: OrganizationLimiter;
  limits?: {
    /** Organizations one user may create. Default 10 an hour. */
    create?: OrganizationLimit;
    /** Invitations one user may send (resends count). Default 30 an hour. */
    invitePerUser?: OrganizationLimit;
    /** Invitations one organization may send. Default 200 an hour. */
    invitePerOrganization?: OrganizationLimit;
    /** Accept attempts by one user. Default 10 in ten minutes. */
    acceptPerUser?: OrganizationLimit;
    /** Accept attempts from one address. Default 30 in ten minutes. */
    acceptPerIp?: OrganizationLimit;
  };
}

const HOUR = 60 * 60 * 1000;
const DEFAULT_LIMITS: Required<NonNullable<OrganizationProcedureOptions['limits']>> = {
  create: { windowMs: HOUR, maxRequests: 10 },
  invitePerUser: { windowMs: HOUR, maxRequests: 30 },
  invitePerOrganization: { windowMs: HOUR, maxRequests: 200 },
  acceptPerUser: { windowMs: 10 * 60 * 1000, maxRequests: 10 },
  acceptPerIp: { windowMs: 10 * 60 * 1000, maxRequests: 30 },
};

/** The names of the procedures `registerOrganizationProcedures` registers. */
export const ORGANIZATION_PROCEDURES = [
  'organizations.create',
  'organizations.listMine',
  'organizations.get',
  'organizations.update',
  'organizations.suspend',
  'organizations.reactivate',
  'organizations.delete',
  'organizations.leave',
  'organizations.members.list',
  'organizations.members.changeRole',
  'organizations.members.remove',
  'organizations.invitations.create',
  'organizations.invitations.list',
  'organizations.invitations.resend',
  'organizations.invitations.revoke',
  'organizations.invitations.accept',
] as const;

/** The caller's name and address as their verified token states them, for the copy kept on a membership. */
function person(ctx: Context): { email?: string; name?: string } {
  const claims = (ctx as Context & { identity?: { claims?: Record<string, unknown> } | null }).identity?.claims ?? {};
  const email = typeof claims.email === 'string' && z.string().email().safeParse(claims.email).success ? claims.email : undefined;
  const name = typeof claims.name === 'string' && claims.name.trim() ? claims.name.trim().slice(0, 200) : undefined;
  return { ...(email ? { email } : {}), ...(name ? { name } : {}) };
}

/**
 * Registers the organizations procedures, so controllers (the one in `@mariachi/organizations/http`,
 * or your own) call them instead of the service. Who may do what is decided by `Organizations`;
 * these add input checking, rate limits and invitation delivery.
 */
export function registerOrganizationProcedures(communication: Pick<CommunicationLayer, 'register'>, organizations: Organizations, options: OrganizationProcedureOptions = {}): void {
  const limits = { ...DEFAULT_LIMITS, ...options.limits };

  const limit = async (ctx: Context, key: string, rule: OrganizationLimit): Promise<void> => {
    if (!options.limiter) return;
    let result: { allowed: boolean; retryAfterMs: number };
    try {
      result = await options.limiter.check(`organizations:${key}`, rule);
    } catch (error) {
      // A limiter that is down must not take invitations down with it
      ctx.logger.warn({ error: (error as Error).message }, 'rate limiter unavailable; allowing the organizations call');
      return;
    }
    if (!result.allowed) throw new MariachiError('rate-limit/exceeded', 'Too many attempts. Try again later.', { retryAfterSeconds: Math.ceil(result.retryAfterMs / 1000) });
  };

  const issue = async (ctx: Context, result: { invitation: Invitation; token: string }): Promise<z.infer<typeof issued>> => {
    if (!options.deliverInvitation) return result;
    const organization = await organizations.get(ctx, result.invitation.organizationId);
    await options.deliverInvitation(ctx, { organization, invitation: result.invitation, token: result.token });
    return { invitation: result.invitation };
  };

  communication.register('organizations.create', {
    schema: { input: z.object({ name: z.string(), slug: z.string().optional() }), output: joined },
    handler: async (ctx, input) => {
      await limit(ctx, `create:user:${ctx.userId}`, limits.create);
      return organizations.create(ctx, { ...input, owner: person(ctx) });
    },
  });

  communication.register('organizations.listMine', {
    schema: { input: z.object({}).optional(), output: z.array(z.object({ organization: organizationSchema, role })) },
    handler: (ctx) => organizations.listMine(ctx),
  });

  communication.register('organizations.get', {
    schema: { input: z.object({ organizationId: id }), output: organizationSchema },
    handler: (ctx, input) => organizations.get(ctx, input.organizationId),
  });

  communication.register('organizations.update', {
    schema: { input: z.object({ organizationId: id, name: z.string().optional(), slug: z.string().optional() }), output: organizationSchema },
    handler: (ctx, { organizationId, ...patch }) => organizations.update(ctx, organizationId, patch),
  });

  communication.register('organizations.suspend', {
    schema: { input: z.object({ organizationId: id }), output: organizationSchema },
    handler: (ctx, input) => organizations.suspend(ctx, input.organizationId),
  });

  communication.register('organizations.reactivate', {
    schema: { input: z.object({ organizationId: id }), output: organizationSchema },
    handler: (ctx, input) => organizations.reactivate(ctx, input.organizationId),
  });

  communication.register('organizations.delete', {
    schema: { input: z.object({ organizationId: id }), output: done },
    handler: async (ctx, input) => {
      await organizations.delete(ctx, input.organizationId);
      return { ok: true as const };
    },
  });

  communication.register('organizations.leave', {
    schema: { input: z.object({ organizationId: id }), output: done },
    handler: async (ctx, input) => {
      await organizations.leave(ctx, input.organizationId);
      return { ok: true as const };
    },
  });

  communication.register('organizations.members.list', {
    schema: {
      input: z.object({ organizationId: id, page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(200).default(50) }),
      output: z.object({ data: z.array(membershipSchema), total: z.number(), page: z.number(), pageSize: z.number(), totalPages: z.number() }),
    },
    handler: (ctx, { organizationId, page, pageSize }) => organizations.listMembers(ctx, organizationId, { page, pageSize }),
  });

  communication.register('organizations.members.changeRole', {
    schema: { input: z.object({ organizationId: id, userId: z.string().min(1), role }), output: membershipSchema },
    handler: (ctx, input) => organizations.changeRole(ctx, input.organizationId, input.userId, input.role),
  });

  communication.register('organizations.members.remove', {
    schema: { input: z.object({ organizationId: id, userId: z.string().min(1) }), output: done },
    handler: async (ctx, input) => {
      await organizations.removeMember(ctx, input.organizationId, input.userId);
      return { ok: true as const };
    },
  });

  communication.register('organizations.invitations.create', {
    schema: { input: z.object({ organizationId: id, email: z.string(), role: role.optional() }), output: issued },
    handler: async (ctx, { organizationId, ...invitation }) => {
      await limit(ctx, `invite:user:${ctx.userId}`, limits.invitePerUser);
      await limit(ctx, `invite:organization:${organizationId}`, limits.invitePerOrganization);
      return issue(ctx, await organizations.invite(ctx, organizationId, invitation));
    },
  });

  communication.register('organizations.invitations.list', {
    schema: { input: z.object({ organizationId: id }), output: z.array(invitationSchema.extend({ status: z.enum(['pending', 'accepted', 'revoked', 'expired']) })) },
    handler: (ctx, input) => organizations.listInvitations(ctx, input.organizationId),
  });

  communication.register('organizations.invitations.resend', {
    schema: { input: z.object({ organizationId: id, invitationId: id }), output: issued },
    handler: async (ctx, input) => {
      await limit(ctx, `invite:user:${ctx.userId}`, limits.invitePerUser);
      await limit(ctx, `invite:organization:${input.organizationId}`, limits.invitePerOrganization);
      return issue(ctx, await organizations.resendInvitation(ctx, input.organizationId, input.invitationId));
    },
  });

  communication.register('organizations.invitations.revoke', {
    schema: { input: z.object({ organizationId: id, invitationId: id }), output: done },
    handler: async (ctx, input) => {
      await organizations.revokeInvitation(ctx, input.organizationId, input.invitationId);
      return { ok: true as const };
    },
  });

  communication.register('organizations.invitations.accept', {
    // No email here: the address comes from the caller's verified identity, never from what they send
    schema: { input: z.object({ token: z.string().max(200), name: z.string().optional() }).strict(), output: joined },
    handler: async (ctx, input) => {
      await limit(ctx, `accept:user:${ctx.userId}`, limits.acceptPerUser);
      const ip = (ctx as Context & { request?: { ip?: string } }).request?.ip;
      if (ip) await limit(ctx, `accept:ip:${ip}`, limits.acceptPerIp);
      return organizations.acceptInvitation(ctx, input);
    },
  });
}
