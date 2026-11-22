import { ConfigError, type Context } from '@mariachi/core';
import type { Credential, CredentialRequest, CredentialResolver } from '../credentials';
import { ProviderError } from '../provider-error';
import { ConnectionError } from './errors';
import { authorizeUrl, checkProvider, createPkce, exchangeCode, grantedScopes, hashNonce, refreshTokens, revokeToken, signState, type TokenResponse, verifyState } from './oauth';
import type { Connection, ConnectionsConfig, ConnectionsDeps, OAuthProvider, StoredConnection } from './types';

const MINUTE = 60_000;

type Owner = Pick<StoredConnection, 'tenantId' | 'userId' | 'provider' | 'accountId'>;
type Refreshed = { kind: 'ok'; accessToken: string } | { kind: 'reconnect' } | { kind: 'gone' };

/** A connection without its tokens: what leaves `Connections`. */
function view(row: StoredConnection): Connection {
  return {
    id: row.id,
    tenantId: row.tenantId,
    userId: row.userId,
    provider: row.provider,
    accountId: row.accountId,
    scopes: [...row.scopes],
    status: row.status,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const notFound = () => new ConnectionError('integrations/connection-not-found', 'No such connection');
const reconnect = (provider: string, connectionId: string) =>
  new ConnectionError('integrations/reconnect-required', `The connection to ${provider} no longer works: the user must connect again`, { provider, connectionId });
const invalidState = () => new ConnectionError('integrations/invalid-state', 'This authorization is invalid, expired or already used: start connecting again');

/**
 * End users' connections to providers: the OAuth authorization-code flow with PKCE and a signed, single-use
 * `state`; their tokens, encrypted in the app's database; a fresh access token for each call, refreshed before it
 * expires, one refresh at a time per connection; and disconnecting, which revokes the grant at the provider.
 *
 * It is a `CredentialResolver`: give it to a client as `deps.credentials`.
 *
 * ```ts
 * const connections = new Connections({
 *   store: new DrizzleConnectionStore(db),
 *   encryption,                                  // createEncryption(...) from @mariachi/encryption
 *   stateSecret: config.connections.stateSecret, // a secret setting, 32+ characters
 *   providers: [oauthProvider(hubspotContract, { clientId, clientSecret, redirectUri })],
 * }, { tracer, metrics });
 * ```
 */
export class Connections implements CredentialResolver {
  private readonly providers = new Map<string, OAuthProvider>();
  /** Refreshes running in this process, by connection id: a second caller waits for the first. */
  private readonly refreshing = new Map<string, Promise<Credential>>();
  private readonly margin: number;
  private readonly ttl: number;

  constructor(
    private readonly config: ConnectionsConfig,
    private readonly deps: ConnectionsDeps = {},
  ) {
    if (typeof config.stateSecret !== 'string' || config.stateSecret.length < 32) {
      throw new ConfigError('integrations/weak-state-secret', 'Connections needs a stateSecret of at least 32 characters');
    }
    for (const provider of config.providers) {
      checkProvider(provider);
      if (this.providers.has(provider.id)) throw new ConfigError('integrations/invalid-oauth-provider', `OAuth provider "${provider.id}" is listed twice`);
      this.providers.set(provider.id, provider);
    }
    this.margin = config.refreshMarginMs ?? 5 * MINUTE;
    this.ttl = config.authorizationTtlMs ?? 10 * MINUTE;
  }

  /** The providers users can connect to, by id. */
  get providerIds(): string[] {
    return [...this.providers.keys()];
  }

  /**
   * Starts connecting the signed-in user to a provider: returns the provider's authorize URL to send the browser
   * to. The `state` in it is signed for this user and provider, expires (ten minutes by default) and works once.
   */
  async authorize(ctx: Context, providerId: string): Promise<{ url: string }> {
    const provider = this.provider(providerId);
    const { tenantId, userId } = this.signedIn(ctx);
    const now = this.now();
    const expiresAt = now + this.ttl;
    const { state, nonce } = signState(this.config.stateSecret, { provider: provider.id, tenantId, userId }, expiresAt);
    const nonceHash = hashNonce(nonce);
    const pkce = provider.oauth.pkce === false ? null : createPkce();
    await this.config.store.deleteExpiredAuthorizations(ctx, new Date(now));
    await this.config.store.saveAuthorization(ctx, {
      nonceHash,
      tenantId,
      userId,
      provider: provider.id,
      codeVerifier: pkce ? await this.config.encryption.encrypt(pkce.verifier, { aad: aadOf(['integration_authorizations', nonceHash]) }) : null,
      expiresAt: new Date(expiresAt),
    });
    return { url: authorizeUrl(provider, { state, challenge: pkce?.challenge }) };
  }

  /**
   * Finishes connecting: checks `state` (this user's, this provider's, not expired, not used), trades the code
   * for tokens and stores them encrypted. Connecting the same account again updates its connection.
   */
  async complete(ctx: Context, providerId: string, input: { code: string; state: string }): Promise<Connection> {
    const provider = this.provider(providerId);
    const { tenantId, userId } = this.signedIn(ctx);
    const now = this.now();
    const verified = verifyState(this.config.stateSecret, input.state, { provider: provider.id, tenantId, userId }, now);
    if (!verified) throw invalidState();
    const nonceHash = hashNonce(verified.nonce);
    // Taken before anything else, so a replay finds nothing even if this attempt fails later
    const pending = await this.config.store.takeAuthorization(ctx, nonceHash);
    if (!pending || pending.userId !== userId || pending.tenantId !== tenantId || pending.provider !== provider.id || pending.expiresAt.getTime() <= now) throw invalidState();
    const codeVerifier = pending.codeVerifier ? await this.config.encryption.decrypt(pending.codeVerifier, { aad: aadOf(['integration_authorizations', nonceHash]) }) : null;

    const tokens = await exchangeCode(ctx, provider, { code: input.code, codeVerifier }, this.deps);
    const owner: Owner = { tenantId, userId, provider: provider.id, accountId: provider.accountId?.(tokens) ?? null };
    const saved = await this.config.store.saveConnection(ctx, {
      ...owner,
      scopes: grantedScopes(tokens, provider.oauth.scopes),
      accessToken: await this.seal(owner, 'access', tokens.access_token),
      // A reconnect that brings no refresh token (Google's, without prompt=consent) keeps the one stored
      ...(tokens.refresh_token ? { refreshToken: await this.seal(owner, 'refresh', tokens.refresh_token) } : {}),
      expiresAt: this.expiry(tokens),
      issuedAt: new Date(now),
    });
    return view(saved);
  }

  /** The signed-in user's connections that aren't revoked, newest first. */
  async list(ctx: Context): Promise<Connection[]> {
    const { tenantId, userId } = this.signedIn(ctx);
    return (await this.config.store.listConnections(ctx, tenantId, userId)).map(view);
  }

  /**
   * Disconnects one of the signed-in user's connections: asks the provider to revoke the grant when its contract
   * has a `revokeUrl`, then deletes the tokens here and marks it `revoked`. The tokens are deleted even when the
   * provider can't be reached; `revokedAtProvider` says whether it confirmed.
   */
  async revoke(ctx: Context, connectionId: string): Promise<{ revokedAtProvider: boolean }> {
    const { tenantId, userId } = this.signedIn(ctx);
    const found = await this.config.store.getConnection(ctx, tenantId, connectionId);
    if (!found || found.userId !== userId || found.status === 'revoked') throw notFound();
    const provider = this.providers.get(found.provider);
    return this.config.store.lockConnection(ctx, connectionId, async (current) => {
      if (!current || current.status === 'revoked') return { revokedAtProvider: false };
      let revokedAtProvider = false;
      if (provider?.oauth.revokeUrl && (current.refreshToken || current.accessToken)) {
        const token = current.refreshToken
          ? { value: await this.open(current, 'refresh', current.refreshToken), hint: 'refresh_token' as const }
          : { value: await this.open(current, 'access', current.accessToken as string), hint: 'access_token' as const };
        try {
          await revokeToken(ctx, provider, token, current.id, this.deps);
          revokedAtProvider = true;
        } catch (error) {
          // The code only: never the token, nor the provider's message
          ctx.logger.warn({ integration: current.provider, connection: current.id, code: (error as { code?: string }).code }, 'the provider did not confirm the revocation; the tokens are deleted here');
        }
      }
      await this.config.store.updateConnection(ctx, current.id, { status: 'revoked', accessToken: null, refreshToken: null, expiresAt: null, issuedAt: null });
      return { revokedAtProvider };
    });
  }

  /**
   * A working access token for a call: the signed-in user's connection to the provider, or the one named. Refreshes
   * it first when it expires within the margin (five minutes by default), once however many calls ask at the same
   * time. Fails with `integrations/connection-not-found` or `integrations/reconnect-required`.
   *
   * A `connectionId` is looked up in the caller's tenant. With a signed-in user it must be that user's connection:
   * another user's fails as `integrations/connection-not-found`, like one that doesn't exist, so ids can't be
   * probed. A context with no user (a job, system work) resolves any connection in the tenant by its id.
   */
  async resolve(ctx: Context, request: CredentialRequest): Promise<Credential> {
    const provider = this.provider(request.provider);
    const tenantId = ctx.tenantId || null;
    let row: StoredConnection | null;
    if (request.connectionId) {
      row = await this.config.store.getConnection(ctx, tenantId, request.connectionId);
      if (row && (row.provider !== provider.id || !this.owns(ctx, row))) row = null;
    } else {
      if (!ctx.userId) throw new ConnectionError('integrations/user-required', 'A connection is resolved for a signed-in user, or by its id');
      row = await this.config.store.findConnection(ctx, tenantId, ctx.userId, provider.id);
    }
    if (!row || row.status === 'revoked') throw notFound();
    if (row.status === 'needs-reconnect') throw reconnect(provider.id, row.id);
    if (row.accessToken && this.fresh(row)) return { accessToken: await this.open(row, 'access', row.accessToken), connectionId: row.id };
    return this.refreshOnce(ctx, provider, row.id);
  }

  /**
   * The provider refused this connection's access token before it expired: the next `resolve` refreshes it (or,
   * with no refresh token, asks for a reconnect). A token that was refreshed meanwhile is left alone. Like
   * `resolve`, a signed-in user can invalidate only their own connection: another user's fails as
   * `integrations/connection-not-found`.
   */
  async invalidate(ctx: Context, credential: Credential): Promise<void> {
    if (!credential.connectionId) return;
    const id = credential.connectionId;
    const row = await this.config.store.getConnection(ctx, ctx.tenantId || null, id);
    if (row && !this.owns(ctx, row)) throw notFound();
    if (!row || row.status !== 'active') return;
    await this.config.store.lockConnection(ctx, id, async (current) => {
      if (!current?.accessToken || current.status !== 'active') return;
      if ((await this.open(current, 'access', current.accessToken)) !== credential.accessToken) return;
      await this.config.store.updateConnection(ctx, id, { expiresAt: new Date(0) });
    });
  }

  private refreshOnce(ctx: Context, provider: OAuthProvider, connectionId: string): Promise<Credential> {
    const running = this.refreshing.get(connectionId);
    if (running) return running;
    const started = this.refresh(ctx, provider, connectionId).finally(() => this.refreshing.delete(connectionId));
    this.refreshing.set(connectionId, started);
    return started;
  }

  private async refresh(ctx: Context, provider: OAuthProvider, connectionId: string): Promise<Credential> {
    const store = this.config.store;
    // The lock serializes refreshes across processes; the outcome is returned rather than thrown, so that marking a
    // connection `needs-reconnect` is kept and not undone with the lock's transaction
    const outcome = await store.lockConnection<Refreshed>(ctx, connectionId, async (current) => {
      if (!current || current.status === 'revoked') return { kind: 'gone' };
      if (current.status === 'needs-reconnect') return { kind: 'reconnect' };
      // Another process refreshed it while this one waited for the lock
      if (current.accessToken && this.fresh(current)) return { kind: 'ok', accessToken: await this.open(current, 'access', current.accessToken) };
      if (!current.refreshToken || !provider.oauth.refresh) {
        const usable = current.accessToken && current.expiresAt && current.expiresAt.getTime() > this.now();
        if (usable) return { kind: 'ok', accessToken: await this.open(current, 'access', current.accessToken as string) };
        await store.updateConnection(ctx, connectionId, { status: 'needs-reconnect', accessToken: null });
        return { kind: 'reconnect' };
      }
      let tokens: TokenResponse;
      try {
        tokens = await refreshTokens(ctx, provider, await this.open(current, 'refresh', current.refreshToken), connectionId, this.deps);
      } catch (error) {
        if (error instanceof ProviderError && error.providerCode === 'invalid_grant') {
          await store.updateConnection(ctx, connectionId, { status: 'needs-reconnect', accessToken: null, refreshToken: null });
          return { kind: 'reconnect' };
        }
        throw error;
      }
      await store.updateConnection(ctx, connectionId, {
        accessToken: await this.seal(current, 'access', tokens.access_token),
        // A provider that rotates refresh tokens sends a new one; one that doesn't, keeps the old one working
        ...(tokens.refresh_token ? { refreshToken: await this.seal(current, 'refresh', tokens.refresh_token) } : {}),
        expiresAt: this.expiry(tokens),
        issuedAt: new Date(this.now()),
        ...(tokens.scope ? { scopes: grantedScopes(tokens, current.scopes) } : {}),
      });
      return { kind: 'ok', accessToken: tokens.access_token };
    });
    if (outcome.kind === 'gone') throw notFound();
    if (outcome.kind === 'reconnect') throw reconnect(provider.id, connectionId);
    return { accessToken: outcome.accessToken, connectionId };
  }

  /** A signed-in user owns only their own connections; a context with no user (a job, system work) acts for any. */
  private owns(ctx: Context, row: StoredConnection): boolean {
    return !ctx.userId || row.userId === ctx.userId;
  }

  /**
   * Whether the access token outlives the refresh margin. The margin is at most half the token's lifetime, so a
   * token issued for less than the margin (five minutes) is still used for a while before it is refreshed.
   */
  private fresh(row: StoredConnection): boolean {
    if (row.expiresAt === null) return true;
    const expiresAt = row.expiresAt.getTime();
    const lifetime = row.issuedAt ? expiresAt - row.issuedAt.getTime() : Number.POSITIVE_INFINITY;
    const margin = Math.max(0, Math.min(this.margin, lifetime / 2));
    return expiresAt - margin > this.now();
  }

  private expiry(tokens: TokenResponse): Date | null {
    return tokens.expires_in ? new Date(this.now() + tokens.expires_in * 1000) : null;
  }

  /** Each token is bound to its owner, provider, account and column: a ciphertext copied to another row won't open. */
  private seal(owner: Owner, column: 'access' | 'refresh', token: string): Promise<string> {
    return this.config.encryption.encrypt(token, { aad: tokenAad(owner, column) });
  }

  private open(owner: Owner, column: 'access' | 'refresh', ciphertext: string): Promise<string> {
    return this.config.encryption.decrypt(ciphertext, { aad: tokenAad(owner, column) });
  }

  private provider(id: string): OAuthProvider {
    const provider = this.providers.get(id);
    if (!provider) throw new ConnectionError('integrations/provider-not-found', `No OAuth provider "${id}" is configured`, { provider: id });
    return provider;
  }

  private signedIn(ctx: Context): { tenantId: string | null; userId: string } {
    if (!ctx.userId) throw new ConnectionError('integrations/user-required', 'Connecting an account needs a signed-in user');
    return { tenantId: ctx.tenantId || null, userId: ctx.userId };
  }

  private now(): number {
    return (this.deps.now ?? Date.now)();
  }
}

const aadOf = (parts: string[]): string => JSON.stringify(parts);

function tokenAad(owner: Owner, column: 'access' | 'refresh'): string {
  return aadOf(['integration_connections', owner.tenantId ?? '', owner.userId, owner.provider, owner.accountId ?? '', column]);
}
