import { IntegrationError, type Context } from '@mariachi/core';
import type { IntegrationContext } from './types';

export interface SecretReader {
  get(key: string, tenantId?: string): Promise<string | undefined>;
}

export interface FieldDecryptor {
  decrypt(ciphertext: string): Promise<string>;
}

/**
 * Loads a tenant secret, falling back to the global value, and decrypts it when a
 * decryptor is provided. Ciphertext is what `@mariachi/encryption` stores.
 * Pass `fallbackToGlobal: false` for credentials that must belong to the tenant (its own Slack
 * workspace, its own API account): a missing tenant secret then fails instead of using yours.
 */
export async function resolveTenantCredential(
  ctx: Pick<Context, 'tenantId'> | IntegrationContext,
  key: string,
  secrets: SecretReader,
  decryptor?: FieldDecryptor,
  options: { fallbackToGlobal?: boolean } = {},
): Promise<string> {
  const tenantId = ctx.tenantId ?? undefined;
  const fallback = options.fallbackToGlobal ?? true;
  if (!tenantId && !fallback) {
    throw new IntegrationError('integrations/missing-credential', `Credential "${key}" requires a tenant`, { key });
  }
  const scoped = tenantId ? await secrets.get(key, tenantId) : undefined;
  const raw = scoped ?? (fallback ? await secrets.get(key) : undefined);
  if (!raw) {
    throw new IntegrationError('integrations/missing-credential', `Missing credential "${key}"`, { key, tenantId });
  }
  return decryptor ? decryptor.decrypt(raw) : raw;
}

/** What a client asks a `CredentialResolver` for. */
export interface CredentialRequest {
  /** The integration's id, as its contract names it: `hubspot`, `google-drive`. */
  provider: string;
  /**
   * One connection by its id, when the user has several to the provider or a job acts for a connection it was
   * given. Without it, the signed-in user's (`ctx.userId`) connection to the provider is used.
   */
  connectionId?: string;
}

/** A credential for one call. Never log it, put it in an error, or return it from an API. */
export interface Credential {
  /** Sent as `Authorization: Bearer <accessToken>`. */
  accessToken: string;
  /**
   * The opaque id of the end user's connection the token came from. Pass it as `connection` to `callProvider` or
   * `providerRequest`, which records it as `mariachi.integration.connection`. Absent for the app's own credential.
   */
  connectionId?: string;
}

/**
 * Where a client gets the credential for a call. `Connections` (an end user's OAuth tokens, kept encrypted in the
 * app's database and refreshed before they expire) is one; an app that keeps credentials elsewhere implements this
 * itself. A client takes it as `deps.credentials` and calls it per operation:
 *
 * ```ts
 * const credential = await deps.credentials.resolve(ctx, { provider: provider.id });
 * return providerRequest(ctx, { ...call, connection: credential.connectionId },
 *   { ...request, headers: { authorization: `Bearer ${credential.accessToken}` } }, options);
 * ```
 */
export interface CredentialResolver {
  resolve(ctx: Context, request: CredentialRequest): Promise<Credential>;
  /**
   * The provider refused this credential (`unauthorized`) although it hadn't expired: it was revoked, or rotated
   * elsewhere. The next `resolve` gets a new one (a refresh, for a connection) instead of the same again.
   */
  invalidate?(ctx: Context, credential: Credential): Promise<void>;
}
