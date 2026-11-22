import { column, defineTable, index } from '@mariachi/database';

/**
 * An end user's connection to a provider's account: their OAuth tokens, encrypted with `@mariachi/encryption`
 * (never plaintext), what they granted, and whether it still works. One row per user per provider account; a
 * reconnect updates the row, and a disconnect blanks its tokens and marks it `revoked`.
 *
 * `id` is the opaque connection id: the one value about a connection that may appear in a span
 * (`mariachi.integration.connection`). `accountId` is the provider's own id for the account, kept only to tell a
 * user's accounts apart: never log it.
 *
 * `tenantId` is nullable, for apps without tenants, so the table isn't tenant-scoped by `defineTable`: the store
 * scopes every statement to the tenant and user itself.
 */
export const integrationConnectionsTable = defineTable(
  'integration_connections',
  {
    id:           column.uuid().primaryKey().defaultRandom(),
    tenantId:     column.text(),
    /** The user's id in the identity provider (the token's subject). */
    userId:       column.text().notNull(),
    /** The integration's id: `hubspot`. */
    provider:     column.text().notNull(),
    accountId:    column.text(),
    /** The scopes the user granted, as the provider reported them. */
    scopes:       column.json().notNull().$type<string[]>(),
    /** Ciphertext. Null once revoked, or when the provider refused it for good. */
    accessToken:  column.text(),
    /** Ciphertext. Null when the provider gives none. */
    refreshToken: column.text(),
    /** When the access token stops working; null when the provider didn't say. */
    expiresAt:    column.timestamp(),
    /** When the access token was issued; with `expiresAt`, its lifetime, which caps the refresh margin. */
    issuedAt:     column.timestamp(),
    /** `active`, `needs-reconnect` or `revoked`. */
    status:       column.text().notNull().default('active'),
    createdAt:    column.timestamp().notNull().defaultNow(),
    updatedAt:    column.timestamp().notNull().defaultNow(),
  },
  {
    tenantColumn: false,
    softDeleteColumn: false,
    indexes: [
      index('integration_connections_owner_idx').on('tenantId', 'userId', 'provider'),
      // One row per tenant, user, provider and account, enforced by the database. Tenant and account may be null,
      // and nulls are distinct in a unique index, so each combination has its own partial index.
      index('integration_connections_account_uniq').on('tenantId', 'userId', 'provider', 'accountId').unique().where('tenant_id IS NOT NULL AND account_id IS NOT NULL'),
      index('integration_connections_account_notenant_uniq').on('userId', 'provider', 'accountId').unique().where('tenant_id IS NULL AND account_id IS NOT NULL'),
      index('integration_connections_noaccount_uniq').on('tenantId', 'userId', 'provider').unique().where('tenant_id IS NOT NULL AND account_id IS NULL'),
      index('integration_connections_noaccount_notenant_uniq').on('userId', 'provider').unique().where('tenant_id IS NULL AND account_id IS NULL'),
    ],
  },
);

/**
 * An OAuth authorization in progress: made when a user starts connecting, taken (deleted) when the provider sends
 * them back, unusable after `expiresAt`. Only a hash of the `state` nonce is kept, and the PKCE verifier is
 * encrypted.
 */
export const integrationAuthorizationsTable = defineTable(
  'integration_authorizations',
  {
    id:           column.uuid().primaryKey().defaultRandom(),
    /** SHA-256 of the nonce in `state`, hex. */
    nonceHash:    column.text().notNull(),
    tenantId:     column.text(),
    userId:       column.text().notNull(),
    provider:     column.text().notNull(),
    /** Ciphertext of the PKCE code verifier; null when the provider takes no PKCE. */
    codeVerifier: column.text(),
    expiresAt:    column.timestamp().notNull(),
    createdAt:    column.timestamp().notNull().defaultNow(),
  },
  {
    tenantColumn: false,
    softDeleteColumn: false,
    indexes: [
      index('integration_authorizations_nonce_uniq').on('nonceHash').unique(),
      index('integration_authorizations_expires_idx').on('expiresAt'),
    ],
  },
);
