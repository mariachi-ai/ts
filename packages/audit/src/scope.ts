import { AuditError, isTenantlessCaller, type Context } from '@mariachi/core';

/**
 * The tenant a read, an export, a retention run or a chain check covers.
 *
 * - A context in a tenant covers that tenant, whatever the filter asks for.
 * - A context with no tenant and nobody signed in is the system (a maintenance job): it covers the
 *   tenant it asks for, or every tenant when it asks for none.
 * - Someone signed in who is in no tenant covers nothing: they are refused (`audit/tenant-required`).
 *   Without this, "no tenant" would read as "every tenant" for a user who has not joined one yet.
 */
export function auditTenantScope(ctx: Context, requested?: string | null): string | null | undefined {
  if (ctx.tenantId) return ctx.tenantId;
  if (isTenantlessCaller(ctx)) {
    throw new AuditError('audit/tenant-required', 'The audit log is read within a tenant, and this caller is in none');
  }
  return requested;
}
