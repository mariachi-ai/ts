import { z } from 'zod';
import { BaseController, type AuthStrategyHandler } from '@mariachi/api-facade';
import type { OrganizationAccess } from '../access';
import { ORGANIZATION_ROLES } from '../types';

export interface OrganizationStrategyOptions {
  /** The header a client names its organization in. Default `x-organization-id`. */
  header?: string;
  /**
   * Reads the organization from the request some other way: a subdomain, a path segment. Return
   * undefined when the request names none. Replaces the header.
   */
  organizationFrom?: (req: Parameters<AuthStrategyHandler>[0]) => string | undefined;
}

/**
 * Wraps an auth strategy so that the organization a request names becomes its tenant, once the
 * signed-in user's membership is confirmed:
 *
 * ```ts
 * api.withAuthStrategy('session', organizationStrategy(bearerStrategy(verifier), access));
 * ```
 *
 * This is the one point where the API turns a request into an identity, so every route gets the check
 * without doing anything. A request that names no organization keeps the identity's own tenant.
 */
export function organizationStrategy(strategy: AuthStrategyHandler, access: OrganizationAccess, options: OrganizationStrategyOptions = {}): AuthStrategyHandler {
  const name = (options.header ?? 'x-organization-id').toLowerCase();
  return async (req) => {
    const identity = await strategy(req);
    if (!identity) return null;
    const raw = options.organizationFrom ? options.organizationFrom(req) : req.headers[name];
    return access.resolve(identity, Array.isArray(raw) ? raw[0] : raw);
  };
}

const organization = z.object({ id: z.string().uuid() });
const member = organization.extend({ userId: z.string().min(1) });
const invitation = organization.extend({ invitationId: z.string().uuid() });

/**
 * Ready-made endpoints for organizations, under `/organizations`. It calls the procedures from
 * `registerOrganizationProcedures`, which must be registered on the same communication layer.
 *
 * Every route names its organization in the path and is decided by the caller's membership of it, so
 * the routes work whichever tenant the request is in: a personal one, another organization, or none
 * (`tenant: 'optional'`). That is what lets a user with no organization create or join one, and an
 * owner reach an organization that is suspended.
 *
 * | Route | Does |
 * | --- | --- |
 * | `GET /organizations` | the caller's organizations, with their role in each |
 * | `POST /organizations` | create one; the caller becomes its owner |
 * | `GET`, `PATCH`, `DELETE /organizations/:id` | read, rename, delete |
 * | `POST /organizations/:id/suspend`, `/reactivate`, `/leave` | |
 * | `GET /organizations/:id/members` | `?page=&pageSize=` |
 * | `PATCH`, `DELETE /organizations/:id/members/:userId` | change a role, remove |
 * | `GET`, `POST /organizations/:id/invitations` | list, invite |
 * | `POST /organizations/:id/invitations/:invitationId/resend`, `DELETE …/:invitationId` | |
 * | `POST /organizations/invitations/accept` | the signed-in user accepts `{ token }` |
 */
export class OrganizationsController extends BaseController {
  readonly prefix: string = 'organizations';
  override readonly tags = ['organizations'];

  init(): void {
    const open = { tenant: 'optional' as const };

    this.get('', open, (ctx) => this.call(ctx, 'organizations.listMine', {}));
    this.post('', { ...open, status: 201, schema: { body: z.object({ name: z.string(), slug: z.string().optional() }) } }, (ctx, body) =>
      this.call(ctx, 'organizations.create', body),
    );
    // Before the `:id` routes: an invitation is accepted by someone who isn't in the organization yet.
    // The body takes a token and a name; the invitee's address is read from their verified identity.
    this.post('invitations/accept', { ...open, schema: { body: z.object({ token: z.string(), name: z.string().optional() }).strict() } }, (ctx, body) =>
      this.call(ctx, 'organizations.invitations.accept', body),
    );

    this.get(':id', { ...open, schema: { params: organization } }, (ctx, _body, params) => this.call(ctx, 'organizations.get', { organizationId: params.id }));
    this.patch(
      ':id',
      { ...open, schema: { params: organization, body: z.object({ name: z.string().optional(), slug: z.string().optional() }) } },
      (ctx, body, params) => this.call(ctx, 'organizations.update', { organizationId: params.id, ...body }),
    );
    this.delete(':id', { ...open, schema: { params: organization } }, (ctx, _body, params) => this.call(ctx, 'organizations.delete', { organizationId: params.id }));
    for (const action of ['suspend', 'reactivate', 'leave'] as const) {
      this.post(`:id/${action}`, { ...open, schema: { params: organization } }, (ctx, _body, params) => this.call(ctx, `organizations.${action}`, { organizationId: params.id }));
    }

    this.get(
      ':id/members',
      { ...open, schema: { params: organization, query: z.object({ page: z.coerce.number().int().min(1).optional(), pageSize: z.coerce.number().int().min(1).max(200).optional() }) } },
      (ctx, _body, params, query) => this.call(ctx, 'organizations.members.list', { organizationId: params.id, ...query }),
    );
    this.patch(':id/members/:userId', { ...open, schema: { params: member, body: z.object({ role: z.enum(ORGANIZATION_ROLES) }) } }, (ctx, body, params) =>
      this.call(ctx, 'organizations.members.changeRole', { organizationId: params.id, userId: params.userId, role: body.role }),
    );
    this.delete(':id/members/:userId', { ...open, schema: { params: member } }, (ctx, _body, params) =>
      this.call(ctx, 'organizations.members.remove', { organizationId: params.id, userId: params.userId }),
    );

    this.get(':id/invitations', { ...open, schema: { params: organization } }, (ctx, _body, params) => this.call(ctx, 'organizations.invitations.list', { organizationId: params.id }));
    this.post(
      ':id/invitations',
      { ...open, status: 201, schema: { params: organization, body: z.object({ email: z.string(), role: z.enum(ORGANIZATION_ROLES).optional() }) } },
      (ctx, body, params) => this.call(ctx, 'organizations.invitations.create', { organizationId: params.id, ...body }),
    );
    this.post(':id/invitations/:invitationId/resend', { ...open, schema: { params: invitation } }, (ctx, _body, params) =>
      this.call(ctx, 'organizations.invitations.resend', { organizationId: params.id, invitationId: params.invitationId }),
    );
    this.delete(':id/invitations/:invitationId', { ...open, schema: { params: invitation } }, (ctx, _body, params) =>
      this.call(ctx, 'organizations.invitations.revoke', { organizationId: params.id, invitationId: params.invitationId }),
    );
  }
}
