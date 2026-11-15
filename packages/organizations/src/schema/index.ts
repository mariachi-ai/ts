import { column, defineTable, index } from '@mariachi/database';
import { tenantsTable } from '@mariachi/database/schema';

/**
 * Who belongs to which organization. An organization is a row of `tenants`, so its id is the tenant
 * id every tenant-scoped table already uses. One row per user per organization; a removed member's
 * row stays, marked `removed`, so who was once a member can still be told.
 *
 * `userId` is the user's id in the identity provider (the token's subject): this module keeps no
 * users table. `email` and `name` are a copy taken when the user joined, for listing members.
 */
export const organizationMembershipsTable = defineTable(
  'organization_memberships',
  {
    id:             column.uuid().primaryKey().defaultRandom(),
    organizationId: column.uuid().notNull().references(() => tenantsTable, 'id', { onDelete: 'cascade' }),
    userId:         column.text().notNull(),
    /** `owner`, `admin` or `member`. */
    role:           column.text().notNull(),
    /** `active` or `removed`. */
    status:         column.text().notNull().default('active'),
    email:          column.text(),
    name:           column.text(),
    /** The user who invited them; null for the organization's creator. */
    invitedBy:      column.text(),
    createdAt:      column.timestamp().notNull().defaultNow(),
    updatedAt:      column.timestamp().notNull().defaultNow(),
  },
  {
    // Keyed by organization, and read across organizations ("the ones I belong to"): the store scopes every statement itself
    tenantColumn: false,
    softDeleteColumn: false,
    indexes: [
      index('organization_memberships_org_user_uniq').on('organizationId', 'userId').unique(),
      index('organization_memberships_user_idx').on('userId'),
      index('organization_memberships_org_email_idx').on('organizationId', 'email'),
    ],
  },
);

/**
 * Invitations to an organization. Only a hash of the invitation's secret is stored. An invitation
 * is pending until it is accepted or revoked, and unusable once `expiresAt` has passed.
 */
export const organizationInvitationsTable = defineTable(
  'organization_invitations',
  {
    id:             column.uuid().primaryKey().defaultRandom(),
    organizationId: column.uuid().notNull().references(() => tenantsTable, 'id', { onDelete: 'cascade' }),
    /** Lowercased. */
    email:          column.text().notNull(),
    role:           column.text().notNull(),
    /** SHA-256 of the secret in the invitation link, hex. */
    tokenHash:      column.text().notNull(),
    invitedBy:      column.text().notNull(),
    expiresAt:      column.timestamp().notNull(),
    acceptedAt:     column.timestamp(),
    acceptedBy:     column.text(),
    revokedAt:      column.timestamp(),
    createdAt:      column.timestamp().notNull().defaultNow(),
    updatedAt:      column.timestamp().notNull().defaultNow(),
  },
  {
    tenantColumn: false,
    softDeleteColumn: false,
    indexes: [
      // One pending invitation per address per organization
      index('organization_invitations_pending_uniq').on('organizationId', 'email').unique().where('accepted_at IS NULL AND revoked_at IS NULL'),
    ],
  },
);
