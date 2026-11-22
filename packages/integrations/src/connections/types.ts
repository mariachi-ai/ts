import type { Context, MetricsAdapter, TracerAdapter } from '@mariachi/core';
import type { ContractOAuth } from '../contract';
import type { ProviderError, ProviderErrorOptions } from '../provider-error';

/**
 * - `active`: its token works, or can be refreshed.
 * - `needs-reconnect`: the provider refused its refresh token (`invalid_grant`), or it expired with none. The user
 *   connects again; the row is reused.
 * - `revoked`: the user disconnected it. Its tokens are gone.
 */
export const CONNECTION_STATUSES = ['active', 'needs-reconnect', 'revoked'] as const;
export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];

/** A connection as the app sees it: never its tokens. */
export interface Connection {
  /** Opaque. The only thing about a connection that may appear in a span or a log. */
  id: string;
  tenantId: string | null;
  userId: string;
  provider: string;
  /** The provider's id for the account, when the provider config reads one. Shown to its owner; never logged. */
  accountId: string | null;
  scopes: string[];
  status: ConnectionStatus;
  /** When the current access token expires; null when the provider didn't say. */
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** A connection as the store keeps it: its tokens are ciphertext, written and read only by `Connections`. */
export interface StoredConnection extends Connection {
  accessToken: string | null;
  refreshToken: string | null;
  /** When the current access token was issued, by the `Connections` clock: with `expiresAt`, its lifetime. */
  issuedAt: Date | null;
}

export type NewConnection = Pick<StoredConnection, 'tenantId' | 'userId' | 'provider' | 'accountId' | 'scopes' | 'accessToken' | 'expiresAt' | 'issuedAt'> & {
  /** Left out, an existing connection keeps the refresh token it has (a new one gets none). */
  refreshToken?: string | null;
};
export type ConnectionPatch = Partial<Pick<StoredConnection, 'scopes' | 'accessToken' | 'refreshToken' | 'expiresAt' | 'issuedAt' | 'status'>>;

/** An authorization in progress, between the redirect to the provider and its callback. */
export interface PendingAuthorization {
  /** SHA-256 of the nonce in `state`, hex. The nonce itself is never stored. */
  nonceHash: string;
  tenantId: string | null;
  userId: string;
  provider: string;
  /** Ciphertext of the PKCE verifier, or null when the provider takes no PKCE. */
  codeVerifier: string | null;
  expiresAt: Date;
}

/**
 * Where connections and authorizations in progress are kept. Two ship: Postgres
 * (`@mariachi/integrations/postgres`) and memory, and both pass the same contract suite. The store holds
 * ciphertext only and does no authorization: `Connections` decides who may use what.
 */
export interface ConnectionStore {
  /**
   * Creates the connection, or updates the one the user already has to the same provider account (same tenant,
   * user, provider and `accountId`, a null `accountId` matching null), which becomes `active` again.
   */
  saveConnection(ctx: Context, connection: NewConnection): Promise<StoredConnection>;
  /** The connection with this id in this tenant, any status. */
  getConnection(ctx: Context, tenantId: string | null, connectionId: string): Promise<StoredConnection | null>;
  /** The user's most recently updated connection to the provider that isn't revoked. */
  findConnection(ctx: Context, tenantId: string | null, userId: string, provider: string): Promise<StoredConnection | null>;
  /** The user's connections that aren't revoked, most recently updated first. */
  listConnections(ctx: Context, tenantId: string | null, userId: string): Promise<StoredConnection[]>;
  updateConnection(ctx: Context, connectionId: string, patch: ConnectionPatch): Promise<StoredConnection | null>;
  /**
   * Runs `fn` with the connection locked: no other `lockConnection` for the same id runs meanwhile, in this process
   * or any other sharing the database. `fn` gets the row as it is once the lock is held, and `updateConnection`
   * calls inside it are part of the same unit, which is its own: never the caller's transaction, so a token the
   * provider has just rotated is kept even if the app's work around the call is rolled back. This is what keeps two
   * requests from both spending a refresh token that the provider accepts only once.
   */
  lockConnection<T>(ctx: Context, connectionId: string, fn: (current: StoredConnection | null) => Promise<T>): Promise<T>;

  saveAuthorization(ctx: Context, authorization: PendingAuthorization): Promise<void>;
  /** Removes and returns the authorization, so it can be used once: a second take of the same hash is null. */
  takeAuthorization(ctx: Context, nonceHash: string): Promise<PendingAuthorization | null>;
  /** Removes those that expired before `now`; returns how many. */
  deleteExpiredAuthorizations(ctx: Context, now: Date): Promise<number>;
}

/**
 * Encrypts tokens at rest. `createEncryption(...)` from `@mariachi/encryption` is one; give it the app's key
 * management (KMS in production). The `aad` binds each ciphertext to its connection's owner, provider and column.
 */
export interface TokenCipher {
  encrypt(plaintext: string, options?: { aad?: string }): Promise<string>;
  decrypt(ciphertext: string, options?: { aad?: string }): Promise<string>;
}

/** One provider end users connect to, by OAuth 2.0 authorization code. `oauthProvider(contract, …)` builds it. */
export interface OAuthProvider {
  /** The integration's id, `hubspot`: what a client's `CredentialRequest.provider` names. */
  id: string;
  /** The span's category, `crm`. */
  category: string;
  /** The endpoints, scopes, and whether the provider takes PKCE and gives refresh tokens: the contract's `credentials.oauth`. */
  oauth: ContractOAuth;
  /** The OAuth client's id: a setting of the integration's (`<PROVIDER>_CLIENT_ID`). */
  clientId: string;
  /** The OAuth client's secret: a secret setting. Left out for a public client that relies on PKCE alone. */
  clientSecret?: string;
  /**
   * Where the provider sends the user back: the app's page that posts `code` and `state` to the callback route.
   * Registered with the provider exactly as written here, and sent unchanged on the authorize and token requests.
   */
  redirectUri: string;
  /** How the client authenticates at the token endpoint: in the form body (default), or HTTP Basic. */
  clientAuth?: 'body' | 'basic';
  /** Extra query parameters on the authorize URL, such as Google's `{ access_type: 'offline', prompt: 'consent' }`. */
  authorizeParams?: Record<string, string>;
  /**
   * Reads the provider's id for the account from the token response, so a user can connect two accounts and a
   * reconnect updates the right one. Without it, a user has one connection per provider.
   */
  accountId?: (tokenResponse: Readonly<Record<string, unknown>>) => string | undefined;
  /** The integration's error class, so failures are `instanceof HubSpotError`. */
  error?: new (code: string, message: string, options: ProviderErrorOptions) => ProviderError;
}

export interface ConnectionsConfig {
  store: ConnectionStore;
  /** `createEncryption(...)` from `@mariachi/encryption`. */
  encryption: TokenCipher;
  /**
   * Signs the OAuth `state`: a secret setting of the app's, at least 32 characters, read through
   * `@mariachi/config`. Changing it fails the authorizations in progress, nothing else.
   */
  stateSecret: string;
  providers: OAuthProvider[];
  /** Refresh an access token this long before it expires. Default five minutes. */
  refreshMarginMs?: number;
  /** How long a user has to finish connecting. Default ten minutes. */
  authorizationTtlMs?: number;
}

export interface ConnectionsDeps {
  /** From the container: the token endpoint calls are spanned like every provider call. */
  tracer?: TracerAdapter;
  metrics?: MetricsAdapter;
  /** For tests: `scriptedFetch`, or a fetch to a stand-in provider. */
  fetch?: typeof fetch;
  /** For tests: the clock, in milliseconds. */
  now?: () => number;
  /** For tests: wait this long between retries of a rate-limited token call. */
  sleep?: (ms: number) => Promise<void>;
}
