import { type Context, createContext } from '@mariachi/core';
import { createEncryption, generateLocalKey } from '@mariachi/encryption';
import { TestTracer } from '@mariachi/testing';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { providerRequest } from '../request';
import { assertProviderSpans } from '../testing';
import { Connections } from './connections';
import { MemoryConnectionStore } from './memory';
import { type StandInOptions, type StandInProvider, standInProvider } from './stand-in-provider';
import { connectionStoreContract } from './store-contract';
import type { ConnectionStore, OAuthProvider } from './types';

connectionStoreContract('memory', () => new MemoryConnectionStore());

const logged: Array<{ obj: Record<string, unknown>; msg?: string }> = [];
const logger = {
  info: (obj: Record<string, unknown>, msg?: string) => void logged.push({ obj, msg }),
  warn: (obj: Record<string, unknown>, msg?: string) => void logged.push({ obj, msg }),
  error: (obj: Record<string, unknown>, msg?: string) => void logged.push({ obj, msg }),
  debug: (obj: Record<string, unknown>, msg?: string) => void logged.push({ obj, msg }),
  child: () => logger,
};
const as = (userId: string | null, tenantId: string | null = 't-1'): Context => createContext({ userId, tenantId, identityType: 'session', logger });

const encryption = createEncryption({ adapter: 'local', keys: { k1: generateLocalKey() } });
const stateSecret = 'state-secret-for-tests-0123456789abcdef';

interface Setup {
  idp: StandInProvider;
  connections: Connections;
  store: MemoryConnectionStore;
  tracer: TestTracer;
  clock: { now: number };
  /** Connects the user through the whole flow: authorize, the provider's approval, the callback. */
  connect(ctx: Context): Promise<Awaited<ReturnType<Connections['complete']>>>;
  /** Every secret value the test has seen: none may reach a span, a log line, an error or the store as plaintext. */
  secrets(): string[];
}

function setup(options: StandInOptions & { provider?: Partial<OAuthProvider>; store?: ConnectionStore } = {}): Setup {
  const idp = standInProvider(options);
  const tracer = new TestTracer();
  const clock = { now: 1_800_000_000_000 };
  const store = (options.store as MemoryConnectionStore | undefined) ?? new MemoryConnectionStore();
  const states: string[] = [];
  const provider: OAuthProvider = {
    id: 'acme',
    category: 'crm',
    oauth: idp.oauth,
    clientId: idp.clientId,
    clientSecret: idp.clientSecret,
    redirectUri: idp.redirectUri,
    ...options.provider,
  };
  const connections = new Connections({ store, encryption, stateSecret, providers: [provider] }, { tracer, fetch: idp.fetch, now: () => clock.now, sleep: async () => {} });
  return {
    idp,
    connections,
    store,
    tracer,
    clock,
    async connect(ctx) {
      const { url } = await connections.authorize(ctx, 'acme');
      const back = new URL(idp.approve(url));
      const state = back.searchParams.get('state') ?? '';
      states.push(state);
      return connections.complete(ctx, 'acme', { code: back.searchParams.get('code') ?? '', state });
    },
    secrets: () => [...idp.log.issued, ...idp.log.codes, ...states, idp.clientSecret, ...idp.log.tokenRequests.map((r) => r.code_verifier ?? '').filter(Boolean)],
  };
}

/** Nothing secret in any span attribute or event, and only the allowed attributes. */
function assertNoSecretsRecorded(s: Setup): void {
  assertProviderSpans(s.tracer.spans);
  const recorded = JSON.stringify([s.tracer.spans, logged]);
  for (const secret of s.secrets()) expect(recorded).not.toContain(secret);
}

describe('Connections: connecting', () => {
  it('sends the user to the provider with PKCE and a state, and stores the tokens encrypted', async () => {
    const s = setup();
    const { url } = await s.connections.authorize(as('ada'), 'acme');
    const q = new URL(url).searchParams;
    expect(q.get('redirect_uri')).toBe(s.idp.redirectUri);
    expect(q.get('code_challenge_method')).toBe('S256');
    expect(q.get('scope')).toBe('contacts.read contacts.write');

    const back = new URL(s.idp.approve(url));
    const connection = await s.connections.complete(as('ada'), 'acme', { code: back.searchParams.get('code')!, state: back.searchParams.get('state')! });
    expect(connection).toMatchObject({ provider: 'acme', userId: 'ada', tenantId: 't-1', status: 'active', scopes: ['contacts.read', 'contacts.write'], accountId: null });
    expect(connection.expiresAt?.getTime()).toBe(s.clock.now + 3_600_000);
    // What leaves Connections has no tokens
    expect(Object.keys(connection)).not.toContain('accessToken');
    expect(JSON.stringify(connection)).not.toMatch(/at_|rt_/);

    // The code was exchanged with the verifier whose challenge was sent, and the same redirect URI
    const [exchange] = s.idp.log.tokenRequests;
    expect(exchange).toMatchObject({ grant_type: 'authorization_code', redirect_uri: s.idp.redirectUri, client_id: s.idp.clientId });
    expect(exchange!.code_verifier).toMatch(/^[A-Za-z0-9_-]{43}$/);

    // At rest: ciphertext only
    const [row] = s.store.rows();
    expect(row!.accessToken).toMatch(/^mx1:/);
    expect(row!.refreshToken).toMatch(/^mx1:/);
    const stored = JSON.stringify(s.store.rows());
    for (const secret of s.secrets()) expect(stored).not.toContain(secret);

    expect(s.tracer.spans.map((span) => span.name)).toEqual(['acme oauth.exchange']);
    expect(s.tracer.spans[0]!.attributes).toMatchObject({ 'mariachi.integration': 'acme', 'mariachi.integration.operation': 'oauth.exchange', 'server.address': 'auth.acme.test', 'http.request.method': 'POST' });
    assertNoSecretsRecorded(s);
  });

  it('takes a state once: a replay fails without calling the provider', async () => {
    const s = setup();
    const { url } = await s.connections.authorize(as('ada'), 'acme');
    const back = new URL(s.idp.approve(url));
    const input = { code: back.searchParams.get('code')!, state: back.searchParams.get('state')! };
    await s.connections.complete(as('ada'), 'acme', input);
    await expect(s.connections.complete(as('ada'), 'acme', input)).rejects.toMatchObject({ code: 'integrations/invalid-state', statusCode: 400 });
    expect(s.idp.log.tokenRequests).toHaveLength(1);
  });

  it('refuses a state made for another user, another tenant or another provider, or one that expired', async () => {
    const s = setup();
    const start = async () => {
      const { url } = await s.connections.authorize(as('ada'), 'acme');
      const back = new URL(s.idp.approve(url));
      return { code: back.searchParams.get('code')!, state: back.searchParams.get('state')! };
    };
    const input = await start();
    // Eve can't finish Ada's authorization (and so can't link her account to Ada's user, or Ada's to hers)
    await expect(s.connections.complete(as('eve'), 'acme', input)).rejects.toMatchObject({ code: 'integrations/invalid-state' });
    await expect(s.connections.complete(as('ada', 't-2'), 'acme', input)).rejects.toMatchObject({ code: 'integrations/invalid-state' });
    // Ada still can: a forged attempt doesn't burn her state
    await expect(s.connections.complete(as('ada'), 'acme', input)).resolves.toMatchObject({ userId: 'ada' });

    const late = await start();
    s.clock.now += 10 * 60_000 + 1;
    await expect(s.connections.complete(as('ada'), 'acme', late)).rejects.toMatchObject({ code: 'integrations/invalid-state' });

    await expect(s.connections.complete(as('ada'), 'acme', { code: 'c', state: 'forged.state.value' })).rejects.toMatchObject({ code: 'integrations/invalid-state' });
    await expect(s.connections.complete(as('ada'), 'nope', input)).rejects.toMatchObject({ code: 'integrations/provider-not-found', statusCode: 404 });
    await expect(s.connections.authorize(as(null), 'acme')).rejects.toMatchObject({ code: 'integrations/user-required', statusCode: 401 });
    expect(s.idp.log.tokenRequests).toHaveLength(1);
  });

  it('fails a code the provider refuses with the provider’s code, never its description', async () => {
    const s = setup();
    const { url } = await s.connections.authorize(as('ada'), 'acme');
    const state = new URL(s.idp.approve(url)).searchParams.get('state')!;
    const failure = await s.connections.complete(as('ada'), 'acme', { code: 'code_guessed', state }).catch((e) => e);
    expect(failure).toMatchObject({ code: 'acme/invalid-grant', category: 'unauthorized', providerCode: 'invalid_grant' });
    expect(JSON.stringify({ message: failure.message, metadata: failure.metadata })).not.toContain('code_guessed');
    expect(s.tracer.spans[0]).toMatchObject({ attributes: { 'error.type': 'invalid_grant', 'mariachi.integration.error_category': 'unauthorized' }, status: { status: 'error' } });
    assertNoSecretsRecorded(s);
  });

  it('sends the client secret with HTTP Basic when the provider asks for it, and works without PKCE when it takes none', async () => {
    const s = setup({ provider: { clientAuth: 'basic', oauth: { ...standInProvider().oauth, pkce: false } } });
    const { url } = await s.connections.authorize(as('ada'), 'acme');
    expect(new URL(url).searchParams.has('code_challenge')).toBe(false);
    const back = new URL(s.idp.approve(url));
    await s.connections.complete(as('ada'), 'acme', { code: back.searchParams.get('code')!, state: back.searchParams.get('state')! });
    expect(s.idp.log.tokenRequests[0]).not.toHaveProperty('client_secret');
    expect(s.idp.log.tokenRequests[0]).not.toHaveProperty('code_verifier');
  });

  it('keeps one connection per account; connecting again updates it', async () => {
    const s = setup({ provider: { accountId: (t) => (typeof t.account === 'string' ? t.account : undefined) } });
    const first = await s.connect(as('ada'));
    const second = await s.connect(as('ada'));
    expect(first.accountId).toBe('acct-42');
    expect(second.id).toBe(first.id);
    expect(await s.connections.list(as('ada'))).toHaveLength(1);
    expect(await s.connections.list(as('eve'))).toEqual([]);
  });
});

describe('Connections: a token for each call', () => {
  it('gives the access token and the connection id, which a client puts on its span', async () => {
    const s = setup();
    const connection = await s.connect(as('ada'));
    const credential = await s.connections.resolve(as('ada'), { provider: 'acme' });
    expect(credential.connectionId).toBe(connection.id);
    expect(s.idp.accepts(credential.accessToken)).toBe(true);

    // A client's operation, as the recipe writes it
    const api = async (input: string | URL | Request, init?: RequestInit) => {
      const auth = (init?.headers as Record<string, string>).authorization;
      return new Response(JSON.stringify({ ok: auth === `Bearer ${credential.accessToken}` }), { status: 200 });
    };
    const out = await providerRequest(
      as('ada'),
      { integration: 'acme', operation: 'contacts.list', category: 'crm', server: 'api.acme.test', connection: credential.connectionId },
      { method: 'GET', url: 'https://api.acme.test/contacts', headers: { authorization: `Bearer ${credential.accessToken}` } },
      { schema: z.object({ ok: z.boolean() }), deps: { tracer: s.tracer, fetch: api as typeof fetch } },
    );
    expect(out.ok).toBe(true);
    expect(s.tracer.spans.at(-1)!.attributes['mariachi.integration.connection']).toBe(connection.id);
    assertNoSecretsRecorded(s);
  });

  it('names no connection the user doesn’t have, nor one in another tenant', async () => {
    const s = setup();
    await expect(s.connections.resolve(as('ada'), { provider: 'acme' })).rejects.toMatchObject({ code: 'integrations/connection-not-found', statusCode: 404 });
    const connection = await s.connect(as('ada'));
    await expect(s.connections.resolve(as('ada', 't-2'), { provider: 'acme' })).rejects.toMatchObject({ code: 'integrations/connection-not-found' });
    await expect(s.connections.resolve(as(null, 't-2'), { provider: 'acme', connectionId: connection.id })).rejects.toMatchObject({ code: 'integrations/connection-not-found' });
    // A job in the tenant may act for a connection by its id
    await expect(s.connections.resolve(as(null), { provider: 'acme', connectionId: connection.id })).resolves.toMatchObject({ connectionId: connection.id });
    await expect(s.connections.resolve(as(null), { provider: 'acme' })).rejects.toMatchObject({ code: 'integrations/user-required' });
  });

  it('refreshes once the token is within the margin of expiring, and not before', async () => {
    const s = setup();
    await s.connect(as('ada'));
    const first = await s.connections.resolve(as('ada'), { provider: 'acme' });
    s.clock.now += 3_600_000 - 5 * 60_000 - 1_000;
    expect((await s.connections.resolve(as('ada'), { provider: 'acme' })).accessToken).toBe(first.accessToken);
    expect(s.idp.log.refreshes).toBe(0);

    s.clock.now += 2_000;
    const refreshed = await s.connections.resolve(as('ada'), { provider: 'acme' });
    expect(refreshed.accessToken).not.toBe(first.accessToken);
    expect(s.idp.accepts(refreshed.accessToken)).toBe(true);
    expect(s.idp.log.refreshes).toBe(1);
    // The rotated refresh token was kept: the next refresh works
    s.clock.now += 3_600_000;
    await s.connections.resolve(as('ada'), { provider: 'acme' });
    expect(s.idp.log.refreshes).toBe(2);
    expect(s.tracer.spans.filter((span) => span.name === 'acme oauth.refresh').map((span) => span.attributes['mariachi.integration.connection'])).toEqual([first.connectionId, first.connectionId]);
    assertNoSecretsRecorded(s);
  });

  it('keeps the refresh token when the provider doesn’t rotate it', async () => {
    const s = setup({ rotate: false });
    await s.connect(as('ada'));
    s.clock.now += 3_600_000;
    await s.connections.resolve(as('ada'), { provider: 'acme' });
    s.clock.now += 3_600_000;
    await s.connections.resolve(as('ada'), { provider: 'acme' });
    expect(s.idp.log.refreshes).toBe(2);
  });

  it('refreshes once however many calls ask at the same moment', async () => {
    const s = setup({ delayMs: 20 });
    await s.connect(as('ada'));
    s.clock.now += 3_600_000;
    const tokens = await Promise.all(Array.from({ length: 8 }, () => s.connections.resolve(as('ada'), { provider: 'acme' })));
    expect(new Set(tokens.map((t) => t.accessToken)).size).toBe(1);
    expect(s.idp.log.refreshes).toBe(1);
  });

  it('refreshes once across two processes sharing the store: the second finds the first’s token under the lock', async () => {
    const shared = new MemoryConnectionStore();
    const one = setup({ delayMs: 20, store: shared });
    await one.connect(as('ada'));
    const two = new Connections(
      { store: shared, encryption, stateSecret, providers: [{ id: 'acme', category: 'crm', oauth: one.idp.oauth, clientId: one.idp.clientId, clientSecret: one.idp.clientSecret, redirectUri: one.idp.redirectUri }] },
      { fetch: one.idp.fetch, now: () => one.clock.now },
    );
    one.clock.now += 3_600_000;
    const [a, b] = await Promise.all([one.connections.resolve(as('ada'), { provider: 'acme' }), two.resolve(as('ada'), { provider: 'acme' })]);
    expect(a.accessToken).toBe(b.accessToken);
    expect(one.idp.log.refreshes).toBe(1);
  });

  it('marks the connection needs-reconnect when the provider refuses the refresh token, and stops calling it', async () => {
    const s = setup();
    const connection = await s.connect(as('ada'));
    s.idp.revokeAllAtProvider();
    s.clock.now += 3_600_000;
    const failure = await s.connections.resolve(as('ada'), { provider: 'acme' }).catch((e) => e);
    expect(failure).toMatchObject({ code: 'integrations/reconnect-required', statusCode: 409, metadata: { provider: 'acme', connectionId: connection.id } });
    // Not an auth/* code: a dead connection doesn't sign the user out of the app
    expect(failure.code.startsWith('auth/')).toBe(false);
    expect(await s.connections.list(as('ada'))).toMatchObject([{ id: connection.id, status: 'needs-reconnect' }]);
    const [row] = s.store.rows();
    expect(row).toMatchObject({ accessToken: null, refreshToken: null, status: 'needs-reconnect' });

    await expect(s.connections.resolve(as('ada'), { provider: 'acme' })).rejects.toMatchObject({ code: 'integrations/reconnect-required' });
    expect(s.idp.log.tokenRequests.filter((r) => r.grant_type === 'refresh_token')).toHaveLength(1);
    expect(JSON.stringify({ message: failure.message, metadata: failure.metadata })).not.toMatch(/rt_|at_/);

    // Connecting again brings the same connection back
    const again = await s.connect(as('ada'));
    expect(again).toMatchObject({ id: connection.id, status: 'active' });
    await expect(s.connections.resolve(as('ada'), { provider: 'acme' })).resolves.toMatchObject({ connectionId: connection.id });
    assertNoSecretsRecorded(s);
  });

  it('keeps the connection when the refresh fails for a reason that passes', async () => {
    const s = setup();
    await s.connect(as('ada'));
    s.clock.now += 3_600_000;
    const down = new Connections(
      { store: s.store, encryption, stateSecret, providers: [{ id: 'acme', category: 'crm', oauth: s.idp.oauth, clientId: s.idp.clientId, clientSecret: s.idp.clientSecret, redirectUri: s.idp.redirectUri }] },
      { now: () => s.clock.now, fetch: (async () => new Response(null, { status: 503 })) as typeof fetch },
    );
    await expect(down.resolve(as('ada'), { provider: 'acme' })).rejects.toMatchObject({ code: 'acme/unavailable', category: 'unavailable' });
    expect(s.store.rows()[0]!.status).toBe('active');
    await expect(s.connections.resolve(as('ada'), { provider: 'acme' })).resolves.toMatchObject({ connectionId: expect.any(String) });
  });

  it('asks for a reconnect when the token expires and the provider gives no refresh token', async () => {
    const s = setup({ noRefresh: true });
    await s.connect(as('ada'));
    s.clock.now += 3_600_000 - 60_000;
    // Within the margin but not expired: still used
    await expect(s.connections.resolve(as('ada'), { provider: 'acme' })).resolves.toMatchObject({ accessToken: expect.stringMatching(/^at_/) });
    s.clock.now += 60_000;
    await expect(s.connections.resolve(as('ada'), { provider: 'acme' })).rejects.toMatchObject({ code: 'integrations/reconnect-required' });
    expect(s.idp.log.refreshes).toBe(0);
  });

  it('uses a token that never expires without refreshing it', async () => {
    const s = setup({ expiresIn: null });
    const connection = await s.connect(as('ada'));
    expect(connection.expiresAt).toBeNull();
    s.clock.now += 365 * 24 * 3_600_000;
    await s.connections.resolve(as('ada'), { provider: 'acme' });
    expect(s.idp.log.refreshes).toBe(0);
  });

  it('refreshes a token the provider refused, once, when the client invalidates it', async () => {
    const s = setup();
    await s.connect(as('ada'));
    const refused = await s.connections.resolve(as('ada'), { provider: 'acme' });
    await s.connections.invalidate(as('ada'), refused);
    const next = await s.connections.resolve(as('ada'), { provider: 'acme' });
    expect(next.accessToken).not.toBe(refused.accessToken);
    // A second report of the old token doesn't throw the new one away
    await s.connections.invalidate(as('ada'), refused);
    expect((await s.connections.resolve(as('ada'), { provider: 'acme' })).accessToken).toBe(next.accessToken);
    expect(s.idp.log.refreshes).toBe(1);
  });
});

describe('Connections: at rest', () => {
  it('binds each ciphertext to its owner: a token copied into another user’s row doesn’t open', async () => {
    const s = setup();
    await s.connect(as('ada'));
    await s.connect(as('eve'));
    const [ada, eve] = s.store.rows().sort((a, b) => a.userId.localeCompare(b.userId));
    await s.store.updateConnection(as('eve'), eve!.id, { accessToken: ada!.accessToken });
    await expect(s.connections.resolve(as('eve'), { provider: 'acme' })).rejects.toMatchObject({ code: 'encryption/decrypt-failed' });
  });
});

describe('Connections: disconnecting', () => {
  it('revokes the grant at the provider, deletes the tokens, and the connection is gone', async () => {
    const s = setup();
    const connection = await s.connect(as('ada'));
    const refresh = s.idp.log.issued.find((t) => t.startsWith('rt_'));
    await expect(s.connections.revoke(as('eve'), connection.id)).rejects.toMatchObject({ code: 'integrations/connection-not-found' });
    expect(await s.connections.revoke(as('ada'), connection.id)).toEqual({ revokedAtProvider: true });
    expect(s.idp.log.revoked).toEqual([{ token: refresh, hint: 'refresh_token' }]);
    expect(s.store.rows()[0]).toMatchObject({ status: 'revoked', accessToken: null, refreshToken: null, expiresAt: null });
    expect(await s.connections.list(as('ada'))).toEqual([]);
    await expect(s.connections.resolve(as('ada'), { provider: 'acme' })).rejects.toMatchObject({ code: 'integrations/connection-not-found' });
    await expect(s.connections.revoke(as('ada'), connection.id)).rejects.toMatchObject({ code: 'integrations/connection-not-found' });
    expect(s.tracer.spans.map((span) => span.name)).toContain('acme oauth.revoke');
    assertNoSecretsRecorded(s);
  });

  it('deletes the tokens even when the provider can’t be reached, and says so', async () => {
    const s = setup();
    const connection = await s.connect(as('ada'));
    s.idp.failRevocations();
    logged.length = 0;
    expect(await s.connections.revoke(as('ada'), connection.id)).toEqual({ revokedAtProvider: false });
    expect(s.store.rows()[0]).toMatchObject({ status: 'revoked', accessToken: null, refreshToken: null });
    expect(logged.map((l) => l.obj)).toEqual([{ integration: 'acme', connection: connection.id, code: 'acme/unavailable' }]);
    assertNoSecretsRecorded(s);
  });

  it('only deletes the tokens when the contract has no revoke endpoint', async () => {
    const { revokeUrl: _, ...oauth } = standInProvider().oauth;
    const s = setup({ provider: { oauth } });
    const connection = await s.connect(as('ada'));
    expect(await s.connections.revoke(as('ada'), connection.id)).toEqual({ revokedAtProvider: false });
    expect(s.idp.log.revoked).toEqual([]);
    expect(s.store.rows()[0]!.status).toBe('revoked');
  });
});

describe('Connections: config', () => {
  it('refuses a weak state secret and a provider listed twice', () => {
    const idp = standInProvider();
    const provider = { id: 'acme', category: 'crm', oauth: idp.oauth, clientId: 'c', clientSecret: 's', redirectUri: idp.redirectUri };
    expect(() => new Connections({ store: new MemoryConnectionStore(), encryption, stateSecret: 'short', providers: [provider] })).toThrow(expect.objectContaining({ code: 'integrations/weak-state-secret' }));
    expect(() => new Connections({ store: new MemoryConnectionStore(), encryption, stateSecret, providers: [provider, provider] })).toThrow(expect.objectContaining({ code: 'integrations/invalid-oauth-provider' }));
  });
});
