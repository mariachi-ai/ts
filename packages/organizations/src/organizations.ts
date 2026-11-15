import { z } from 'zod';
import type { Context, Instrumentable, Logger, MetricsAdapter, PaginatedResult, PaginationParams, TracerAdapter } from '@mariachi/core';
import { OrganizationsError, fromZodError, resolveInstrumentation, withSpan, type InstrumentationDeps } from '@mariachi/core';
import { SLUG, hashInvitationSecret, invitationToken, isUuid, newInvitationSecret, normalizeEmail, parseInvitationToken, randomSuffix, secretMatches, slugify } from './tokens';
import {
  ORGANIZATION_ROLES,
  type Invitation,
  type InvitationStatus,
  type Membership,
  type Organization,
  type OrganizationAudit,
  type OrganizationChange,
  type OrganizationRole,
  type OrganizationStore,
  type OrganizationsConfig,
  type StoredInvitation,
  type VerifiedEmail,
} from './types';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const MAX_PAGE_SIZE = 200;
/** A hash to compare against when there is no invitation, so a wrong id takes as long as a wrong secret. */
const NO_INVITATION = hashInvitationSecret('no such invitation');

const rank = (role: OrganizationRole): number => ORGANIZATION_ROLES.length - ORGANIZATION_ROLES.indexOf(role);
/** Whether `role` can do what `minimum` can. */
export const roleAtLeast = (role: OrganizationRole, minimum: OrganizationRole): boolean => rank(role) >= rank(minimum);

const roleSchema = z.enum(ORGANIZATION_ROLES);
const nameSchema = z.string().trim().min(1).max(100);
const slugSchema = z.string().regex(SLUG, 'A slug is 3 to 63 lowercase letters, digits and hyphens, and starts and ends with a letter or digit');
const emailSchema = z.string().trim().max(320).email();
const personSchema = z.object({ email: emailSchema.optional(), name: z.string().trim().max(200).optional() });
const createSchema = z.object({ name: nameSchema, slug: slugSchema.optional(), owner: personSchema.optional() });
const updateSchema = z.object({ name: nameSchema.optional(), slug: slugSchema.optional() }).refine((v) => v.name !== undefined || v.slug !== undefined, 'Give a name or a slug to change');
const inviteSchema = z.object({ email: emailSchema, role: roleSchema.default('member') });
const acceptSchema = z.object({ token: z.string(), name: z.string().trim().max(200).optional() });

/** The standard claims of the request's verified token, where the API layer puts them. */
function emailFromClaims(ctx: Context): VerifiedEmail | undefined {
  const claims = (ctx as Context & { identity?: { claims?: Record<string, unknown> } | null }).identity?.claims;
  if (!claims) return undefined;
  return { email: typeof claims.email === 'string' ? claims.email : undefined, verified: claims.email_verified === true };
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input);
  if (!result.success) throw fromZodError(result.error);
  return result.data;
}

/** The same refusal for an organization that doesn't exist and one the caller isn't in, so neither can be told from the other. */
const notFound = (): OrganizationsError => new OrganizationsError('organizations/not-found', 'Organization not found');
const invalidInvitation = (): OrganizationsError => new OrganizationsError('organizations/invitation-invalid', 'This invitation is not valid');

function publicInvitation(stored: StoredInvitation): Invitation {
  const { tokenHash: _hash, ...invitation } = stored;
  return invitation;
}

/**
 * Organizations, memberships and invitations in the app's own database, for apps whose identity
 * provider supplies none. An organization is a tenant: its id is the tenant id.
 *
 * Every method decides for itself whether the caller may do what is asked, from the caller's own
 * membership of the organization named. `ctx.tenantId` plays no part, so a client can't reach an
 * organization by claiming to be in it.
 */
export abstract class Organizations implements Instrumentable {
  readonly logger: Logger;
  readonly tracer?: TracerAdapter;
  readonly metrics?: MetricsAdapter;
  protected readonly store: OrganizationStore;
  protected readonly audit?: OrganizationAudit;
  protected readonly invitationTtlMs: number;
  protected readonly emailCheck: NonNullable<OrganizationsConfig['emailCheck']>;
  protected readonly verifiedEmail: NonNullable<OrganizationsConfig['verifiedEmail']>;
  protected readonly reservedSlugs: Set<string>;
  protected readonly now: () => Date;
  private readonly listeners = new Set<(change: OrganizationChange) => void>();

  constructor(config: OrganizationsConfig, instrumentation?: InstrumentationDeps) {
    const resolved = resolveInstrumentation(instrumentation);
    this.logger = resolved.logger;
    this.tracer = resolved.tracer;
    this.metrics = resolved.metrics;
    this.store = config.store;
    this.audit = config.audit;
    this.invitationTtlMs = config.invitationTtlMs ?? SEVEN_DAYS;
    this.emailCheck = config.emailCheck ?? 'verified';
    this.verifiedEmail = config.verifiedEmail ?? emailFromClaims;
    this.reservedSlugs = new Set((config.reservedSlugs ?? []).map((slug) => slug.toLowerCase()));
    this.now = config.now ?? (() => new Date());
  }

  /** Calls `listener` after a change is committed. Returns a function that stops it. */
  onChange(listener: (change: OrganizationChange) => void): () => void {
    this.listeners.add(listener);
    return () => void this.listeners.delete(listener);
  }

  private emit(ctx: Context, ...changes: OrganizationChange[]): void {
    for (const change of changes) {
      this.metrics?.increment('organizations.changes', 1, { type: change.type });
      for (const listener of this.listeners) {
        try {
          listener(change);
        } catch (error) {
          this.logger.warn({ traceId: ctx.traceId, type: change.type, error: (error as Error).message }, 'An organization change listener failed');
        }
      }
    }
  }

  private async record(ctx: Context, organizationId: string, action: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.audit?.log(ctx, { actor: ctx.userId ?? 'system', action, resource: 'organization', resourceId: organizationId, tenantId: organizationId, metadata });
  }

  private actor(ctx: Context): string {
    if (!ctx.userId) throw new OrganizationsError('organizations/user-required', 'This needs a signed-in user');
    return ctx.userId;
  }

  /** The caller's active membership of an organization that exists, or the one refusal. */
  private async membership(ctx: Context, organizationId: string, minimum: OrganizationRole): Promise<{ organization: Organization; membership: Membership }> {
    const userId = this.actor(ctx);
    if (!isUuid(organizationId)) throw notFound();
    const [organization, membership] = await Promise.all([this.store.getOrganization(ctx, organizationId), this.store.getMembership(ctx, organizationId, userId)]);
    if (!organization || organization.status === 'deleted' || !membership || membership.status !== 'active') throw notFound();
    if (!roleAtLeast(membership.role, minimum)) {
      throw new OrganizationsError('organizations/forbidden', `This needs the ${minimum} role`, { role: membership.role, required: minimum });
    }
    return { organization, membership };
  }

  private assertSlugFree(slug: string): void {
    if (this.reservedSlugs.has(slug)) throw new OrganizationsError('organizations/slug-taken', `The slug "${slug}" is taken`, { slug });
  }

  private invitationStatus(invitation: Pick<Invitation, 'acceptedAt' | 'revokedAt' | 'expiresAt'>): InvitationStatus {
    if (invitation.acceptedAt) return 'accepted';
    if (invitation.revokedAt) return 'revoked';
    return invitation.expiresAt.getTime() <= this.now().getTime() ? 'expired' : 'pending';
  }

  // ---- organizations

  /** Creates an organization. The caller becomes its owner. Without a slug, one is made from the name. */
  async create(ctx: Context, input: { name: string; slug?: string; owner?: { email?: string; name?: string } }): Promise<{ organization: Organization; membership: Membership }> {
    const userId = this.actor(ctx);
    const { name, slug: chosen, owner } = parse(createSchema, input);
    if (chosen) this.assertSlugFree(chosen);
    const base = slugify(name);
    return withSpan(this.tracer, 'organizations.create', {}, async () => {
      for (let attempt = 0; ; attempt++) {
        const slug = chosen ?? (attempt === 0 && !this.reservedSlugs.has(base) ? base : `${base.slice(0, 43)}-${randomSuffix()}`);
        try {
          const created = await this.store.transaction(ctx, async () => {
            const organization = await this.store.createOrganization(ctx, { name, slug });
            const membership = await this.store.putMembership(ctx, {
              organizationId: organization.id,
              userId,
              role: 'owner',
              email: owner?.email ? normalizeEmail(owner.email) : null,
              name: owner?.name || null,
              invitedBy: null,
            });
            await this.record(ctx, organization.id, 'organization.created', { name, slug });
            return { organization, membership };
          });
          this.emit(ctx, { type: 'organization.created', organizationId: created.organization.id }, { type: 'member.added', organizationId: created.organization.id, userId });
          return created;
        } catch (error) {
          // A generated slug that is taken gets another ending; a chosen one is the caller's to change
          const taken = error instanceof OrganizationsError && error.code === 'organizations/slug-taken';
          if (!taken || chosen || attempt >= 5) throw error;
        }
      }
    });
  }

  /** The organization, for one of its members. */
  async get(ctx: Context, organizationId: string): Promise<Organization> {
    return (await this.membership(ctx, organizationId, 'member')).organization;
  }

  /** The organizations the caller belongs to, with their role in each, oldest membership first. */
  async listMine(ctx: Context): Promise<Array<{ organization: Organization; role: OrganizationRole }>> {
    const mine = await this.store.listForUser(ctx, this.actor(ctx));
    return mine.map(({ organization, membership }) => ({ organization, role: membership.role }));
  }

  /**
   * What a request check needs: the organization and the caller's active membership, or null when
   * the caller isn't in it (or it doesn't exist). A suspended organization is returned as it is, for
   * the caller of this to refuse.
   */
  async access(ctx: Context, organizationId: string): Promise<{ organization: Organization; membership: Membership } | null> {
    if (!ctx.userId || !isUuid(organizationId)) return null;
    const [organization, membership] = await Promise.all([this.store.getOrganization(ctx, organizationId), this.store.getMembership(ctx, organizationId, ctx.userId)]);
    if (!organization || organization.status === 'deleted' || !membership || membership.status !== 'active') return null;
    return { organization, membership };
  }

  /** Changes the name, the slug or both. For admins and owners. */
  async update(ctx: Context, organizationId: string, input: { name?: string; slug?: string }): Promise<Organization> {
    const patch = parse(updateSchema, input);
    if (patch.slug) this.assertSlugFree(patch.slug);
    await this.membership(ctx, organizationId, 'admin');
    const updated = await this.store.transaction(ctx, async () => {
      const organization = await this.store.updateOrganization(ctx, organizationId, patch);
      if (!organization) throw notFound();
      await this.record(ctx, organizationId, 'organization.updated', patch);
      return organization;
    });
    this.emit(ctx, { type: 'organization.updated', organizationId });
    return updated;
  }

  private async setStatus(ctx: Context, organizationId: string, status: Organization['status'], action: string): Promise<Organization> {
    await this.membership(ctx, organizationId, 'owner');
    const updated = await this.store.transaction(ctx, async () => {
      const organization = await this.store.updateOrganization(ctx, organizationId, { status });
      if (!organization) throw notFound();
      await this.record(ctx, organizationId, action);
      return organization;
    });
    this.emit(ctx, { type: status === 'deleted' ? 'organization.deleted' : 'organization.updated', organizationId });
    return updated;
  }

  /** Stops the organization being used, without removing anything. For owners, who can still manage and reactivate it. */
  suspend(ctx: Context, organizationId: string): Promise<Organization> {
    return this.setStatus(ctx, organizationId, 'suspended', 'organization.suspended');
  }

  reactivate(ctx: Context, organizationId: string): Promise<Organization> {
    return this.setStatus(ctx, organizationId, 'active', 'organization.reactivated');
  }

  /**
   * Marks the organization deleted: no one can reach it afterwards, and its slug stays taken. Its
   * rows in your tenant-scoped tables are yours to remove. For owners.
   */
  async delete(ctx: Context, organizationId: string): Promise<void> {
    await this.setStatus(ctx, organizationId, 'deleted', 'organization.deleted');
  }

  // ---- members

  /** The organization's active members, owners first. For any member. */
  async listMembers(ctx: Context, organizationId: string, pagination: PaginationParams = { page: 1, pageSize: 50 }): Promise<PaginatedResult<Membership>> {
    await this.membership(ctx, organizationId, 'member');
    const page = Math.max(1, Math.floor(pagination.page) || 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pagination.pageSize) || 50));
    return this.store.listMembers(ctx, organizationId, { page, pageSize });
  }

  /**
   * Changes a member's role. An owner can set any role on anyone. An admin can move members between
   * admin and member, and can neither make an owner nor change one. The last owner stays an owner.
   */
  async changeRole(ctx: Context, organizationId: string, userId: string, role: OrganizationRole): Promise<Membership> {
    const to = parse(roleSchema, role);
    await this.membership(ctx, organizationId, 'admin');
    const changed = await this.store.transaction(
      ctx,
      async () => {
        // Read again under the lock: the caller's own role may have changed since the check above
        const { membership: mine } = await this.membership(ctx, organizationId, 'admin');
        const target = await this.store.getMembership(ctx, organizationId, userId);
        if (!target || target.status !== 'active') throw new OrganizationsError('organizations/member-not-found', 'No such member');
        if (mine.role !== 'owner' && (target.role === 'owner' || to === 'owner')) {
          throw new OrganizationsError('organizations/forbidden', "Only an owner can make an owner or change an owner's role", { role: mine.role, required: 'owner' });
        }
        if (target.role === to) return target;
        if (target.role === 'owner' && (await this.store.countOwners(ctx, organizationId)) <= 1) {
          throw new OrganizationsError('organizations/last-owner', 'An organization keeps at least one owner: make someone else an owner first');
        }
        const updated = await this.store.updateMembership(ctx, organizationId, userId, { role: to });
        if (!updated) throw new OrganizationsError('organizations/member-not-found', 'No such member');
        await this.record(ctx, organizationId, 'organization.member.role-changed', { userId, from: target.role, to });
        return updated;
      },
      { lock: organizationId },
    );
    this.emit(ctx, { type: 'member.role-changed', organizationId, userId });
    return changed;
  }

  private async remove(ctx: Context, organizationId: string, userId: string, action: string): Promise<void> {
    const self = userId === ctx.userId;
    // Before the lock, so someone who isn't a member can't hold up an organization's changes
    await this.membership(ctx, organizationId, self ? 'member' : 'admin');
    await this.store.transaction(
      ctx,
      async () => {
        const { membership: mine } = await this.membership(ctx, organizationId, self ? 'member' : 'admin');
        const target = self ? mine : await this.store.getMembership(ctx, organizationId, userId);
        if (!target || target.status !== 'active') throw new OrganizationsError('organizations/member-not-found', 'No such member');
        if (!self && target.role === 'owner' && mine.role !== 'owner') {
          throw new OrganizationsError('organizations/forbidden', 'Only an owner can remove an owner', { role: mine.role, required: 'owner' });
        }
        if (target.role === 'owner' && (await this.store.countOwners(ctx, organizationId)) <= 1) {
          throw new OrganizationsError('organizations/last-owner', 'An organization keeps at least one owner: make someone else an owner first');
        }
        await this.store.updateMembership(ctx, organizationId, userId, { status: 'removed' });
        await this.record(ctx, organizationId, action, { userId, role: target.role });
      },
      { lock: organizationId },
    );
    this.emit(ctx, { type: 'member.removed', organizationId, userId });
  }

  /** Removes a member. For admins and owners; only an owner can remove an owner, and never the last one. */
  removeMember(ctx: Context, organizationId: string, userId: string): Promise<void> {
    return this.remove(ctx, organizationId, userId, userId === ctx.userId ? 'organization.member.left' : 'organization.member.removed');
  }

  /** The caller leaves the organization. The last owner can't. */
  leave(ctx: Context, organizationId: string): Promise<void> {
    return this.remove(ctx, organizationId, this.actor(ctx), 'organization.member.left');
  }

  // ---- invitations

  /**
   * Invites an email address. Returns the invitation and its token, which is shown this once: put it
   * in the link you send. For admins and owners; only an owner can invite an owner. An address that is
   * already a member is refused, and an earlier invitation to the same address is replaced.
   */
  async invite(ctx: Context, organizationId: string, input: { email: string; role?: OrganizationRole }): Promise<{ invitation: Invitation; token: string }> {
    const parsed = parse(inviteSchema, input);
    const email = normalizeEmail(parsed.email);
    const { organization, membership: mine } = await this.membership(ctx, organizationId, 'admin');
    if (organization.status !== 'active') throw new OrganizationsError('organizations/suspended', 'This organization is suspended');
    if (parsed.role === 'owner' && mine.role !== 'owner') {
      throw new OrganizationsError('organizations/forbidden', 'Only an owner can invite an owner', { role: mine.role, required: 'owner' });
    }
    const secret = newInvitationSecret();
    const stored = await this.store.transaction(
      ctx,
      async () => {
        if (await this.store.findMemberByEmail(ctx, organizationId, email)) {
          throw new OrganizationsError('organizations/already-member', 'That address already belongs to a member');
        }
        const earlier = await this.store.findOpenInvitation(ctx, organizationId, email);
        if (earlier) await this.store.updateInvitation(ctx, earlier.id, { revokedAt: this.now() });
        const created = await this.store.createInvitation(ctx, {
          organizationId,
          email,
          role: parsed.role,
          tokenHash: hashInvitationSecret(secret),
          invitedBy: mine.userId,
          expiresAt: new Date(this.now().getTime() + this.invitationTtlMs),
        });
        await this.record(ctx, organizationId, 'organization.invitation.created', { invitationId: created.id, email, role: parsed.role, replaced: earlier?.id });
        return created;
      },
      { lock: organizationId },
    );
    return { invitation: publicInvitation(stored), token: invitationToken(stored.id, secret) };
  }

  /** Invitations that are neither accepted nor revoked, newest first, each `pending` or `expired`. For admins and owners. */
  async listInvitations(ctx: Context, organizationId: string): Promise<Array<Invitation & { status: InvitationStatus }>> {
    await this.membership(ctx, organizationId, 'admin');
    const open = await this.store.listOpenInvitations(ctx, organizationId);
    return open.map((stored) => ({ ...publicInvitation(stored), status: this.invitationStatus(stored) }));
  }

  private async openInvitation(ctx: Context, organizationId: string, invitationId: string): Promise<StoredInvitation> {
    const stored = isUuid(invitationId) ? await this.store.getInvitation(ctx, invitationId) : null;
    if (!stored || stored.organizationId !== organizationId || stored.acceptedAt || stored.revokedAt) {
      throw new OrganizationsError('organizations/invitation-not-found', 'No such invitation');
    }
    return stored;
  }

  /** Gives an invitation a new token and a new expiry. The token sent before stops working. */
  async resendInvitation(ctx: Context, organizationId: string, invitationId: string): Promise<{ invitation: Invitation; token: string }> {
    const { organization } = await this.membership(ctx, organizationId, 'admin');
    if (organization.status !== 'active') throw new OrganizationsError('organizations/suspended', 'This organization is suspended');
    const secret = newInvitationSecret();
    const stored = await this.store.transaction(
      ctx,
      async () => {
        const current = await this.openInvitation(ctx, organizationId, invitationId);
        const updated = await this.store.updateInvitation(ctx, current.id, { tokenHash: hashInvitationSecret(secret), expiresAt: new Date(this.now().getTime() + this.invitationTtlMs) });
        if (!updated) throw new OrganizationsError('organizations/invitation-not-found', 'No such invitation');
        await this.record(ctx, organizationId, 'organization.invitation.resent', { invitationId: current.id, email: current.email });
        return updated;
      },
      { lock: organizationId },
    );
    return { invitation: publicInvitation(stored), token: invitationToken(stored.id, secret) };
  }

  /** Cancels an invitation that hasn't been accepted. Its token stops working. */
  async revokeInvitation(ctx: Context, organizationId: string, invitationId: string): Promise<void> {
    await this.membership(ctx, organizationId, 'admin');
    await this.store.transaction(
      ctx,
      async () => {
        const current = await this.openInvitation(ctx, organizationId, invitationId);
        await this.store.updateInvitation(ctx, current.id, { revokedAt: this.now() });
        await this.record(ctx, organizationId, 'organization.invitation.revoked', { invitationId: current.id, email: current.email });
      },
      { lock: organizationId },
    );
  }

  /**
   * The signed-in user accepts an invitation and becomes a member with the invited role. Their email
   * address is not an argument: it comes from their verified identity (`verifiedEmail` in the config),
   * so nothing a client sends can stand in for it. An invitation works once, and only for a person
   * signed in (`ctx.identityType === 'session'`): not for an API key, a service or a webhook.
   */
  async acceptInvitation(ctx: Context, input: { token: string; name?: string }): Promise<{ organization: Organization; membership: Membership }> {
    const userId = this.actor(ctx);
    // Joining is a person's own act. An API key, a service or a webhook acting as the user is not that person
    // confirming, and its email claims are the least trustworthy.
    if (ctx.identityType !== 'session') throw new OrganizationsError('organizations/user-required', 'An invitation is accepted by the signed-in person it was sent to');
    const { token, name } = parse(acceptSchema, input);
    const parts = parseInvitationToken(token);
    const found = parts ? await this.store.getInvitation(ctx, parts.invitationId) : null;
    // Compared whether or not there is an invitation, so the answer takes as long either way
    const matches = secretMatches(parts?.secret ?? '', found?.tokenHash ?? NO_INVITATION);
    if (!found || !matches) throw invalidInvitation();
    this.assertUsable(found);
    const stated = (await this.verifiedEmail(ctx)) ?? {};
    const email = typeof stated.email === 'string' && stated.email.trim() ? normalizeEmail(stated.email) : undefined;
    if (this.emailCheck !== 'none') {
      if (email !== found.email) throw new OrganizationsError('organizations/email-mismatch', 'This invitation was sent to another email address. Sign in with that address to accept it.');
      if (this.emailCheck === 'verified' && stated.verified !== true) {
        throw new OrganizationsError('organizations/email-unverified', 'Verify your email address, then accept the invitation');
      }
    }
    const organizationId = found.organizationId;
    const accepted = await this.store.transaction(
      ctx,
      async () => {
        const organization = await this.store.getOrganization(ctx, organizationId);
        if (!organization || organization.status === 'deleted') throw invalidInvitation();
        if (organization.status !== 'active') throw new OrganizationsError('organizations/suspended', 'This organization is suspended');
        // Read again under the lock: it may have been accepted, revoked or resent a moment ago
        const current = await this.store.getInvitation(ctx, found.id);
        if (!current || current.tokenHash !== found.tokenHash) throw invalidInvitation();
        this.assertUsable(current);
        const existing = await this.store.getMembership(ctx, organizationId, userId);
        // Someone who is already a member keeps the role they have
        const membership =
          existing?.status === 'active'
            ? existing
            : await this.store.putMembership(ctx, { organizationId, userId, role: current.role, email: email ?? null, name: name || null, invitedBy: current.invitedBy });
        await this.store.updateInvitation(ctx, current.id, { acceptedAt: this.now(), acceptedBy: userId });
        await this.record(ctx, organizationId, 'organization.invitation.accepted', { invitationId: current.id, userId, role: membership.role });
        return { organization, membership, joined: existing?.status !== 'active' };
      },
      { lock: organizationId },
    );
    if (accepted.joined) this.emit(ctx, { type: 'member.added', organizationId, userId });
    return { organization: accepted.organization, membership: accepted.membership };
  }

  private assertUsable(invitation: StoredInvitation): void {
    const status = this.invitationStatus(invitation);
    if (status === 'expired') throw new OrganizationsError('organizations/invitation-expired', 'This invitation has expired. Ask for a new one.');
    if (status !== 'pending') throw invalidInvitation();
  }
}

export class DefaultOrganizations extends Organizations {}
