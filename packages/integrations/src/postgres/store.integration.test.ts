import { IntegrationError, createContext } from '@mariachi/core';
import { type PostgresDatabase, applySchema, createPostgresDatabase, withTransaction } from '@mariachi/database-postgres';
import { createEncryption, generateLocalKey } from '@mariachi/encryption';
import { sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startPostgres, stopAll } from '../../../../test/setup';
import { Connections } from '../connections/connections';
import { standInProvider } from '../connections/stand-in-provider';
import { connectionStoreContract } from '../connections/store-contract';
import { integrationAuthorizationsTable, integrationConnectionsTable } from '../schema/index';
import { DrizzleConnectionStore } from './store';

let database: PostgresDatabase;
const silent = { info() {}, warn() {}, error() {}, debug() {}, child: () => silent };
const rows = <T>(result: unknown): T[] => (Array.isArray(result) ? (result as T[]) : ((result as { rows: T[] }).rows ?? []));

beforeAll(async () => {
  database = createPostgresDatabase({ url: await startPostgres() });
  await database.connect();
  await applySchema(database.db, [integrationConnectionsTable, integrationAuthorizationsTable]);
}, 180_000);

afterAll(async () => {
  await database?.disconnect();
  await stopAll();
});

connectionStoreContract('postgres', () => new DrizzleConnectionStore(database.db));

describe('DrizzleConnectionStore with Connections', () => {
  const encryption = createEncryption({ adapter: 'local', keys: { k1: generateLocalKey() } });

  it('keeps only ciphertext, and two processes refresh a connection once', async () => {
    const idp = standInProvider({ delayMs: 50 });
    const clock = { now: Date.now() };
    const provider = { id: 'acme', category: 'crm', oauth: idp.oauth, clientId: idp.clientId, clientSecret: idp.clientSecret, redirectUri: idp.redirectUri };
    // Two app processes: each its own Connections (its own in-process single flight), one database
    const process = () => new Connections({ store: new DrizzleConnectionStore(database.db), encryption, stateSecret: 'a-postgres-test-state-secret-0123456789', providers: [provider] }, { fetch: idp.fetch, now: () => clock.now });
    const [one, two] = [process(), process()];
    const userId = `ada-${crypto.randomUUID()}`;
    const ctx = createContext({ userId, tenantId: 't-pg', logger: silent });

    const { url } = await one.authorize(ctx, 'acme');
    const back = new URL(idp.approve(url));
    const state = back.searchParams.get('state')!;
    // The callback lands on the other process: the authorization is in the database
    const connection = await two.complete(ctx, 'acme', { code: back.searchParams.get('code')!, state });

    const stored = rows<Record<string, unknown>>(await database.db.execute(sql`select * from integration_connections where id = ${connection.id}::uuid`));
    expect(stored).toHaveLength(1);
    expect(stored[0]!.access_token).toMatch(/^mx1:/);
    expect(stored[0]!.refresh_token).toMatch(/^mx1:/);
    const dump = JSON.stringify(stored) + JSON.stringify(rows(await database.db.execute(sql`select * from integration_authorizations`)));
    for (const secret of [...idp.log.issued, ...idp.log.codes, state]) expect(dump).not.toContain(secret);

    clock.now += 3_600_000;
    const tokens = await Promise.all([one, two, one, two].map((c) => c.resolve(ctx, { provider: 'acme' })));
    expect(new Set(tokens.map((t) => t.accessToken)).size).toBe(1);
    expect(idp.log.refreshes).toBe(1);
    expect(idp.accepts(tokens[0]!.accessToken)).toBe(true);

    expect(await one.revoke(ctx, connection.id)).toEqual({ revokedAtProvider: true });
    const [revoked] = rows<{ status: string; access_token: string | null; refresh_token: string | null }>(
      await database.db.execute(sql`select status, access_token, refresh_token from integration_connections where id = ${connection.id}::uuid`),
    );
    expect(revoked).toEqual({ status: 'revoked', access_token: null, refresh_token: null });
  });

  it('keeps a refreshed token when the app’s own transaction around the call is rolled back', async () => {
    const idp = standInProvider();
    const clock = { now: Date.now() };
    const provider = { id: 'acme', category: 'crm', oauth: idp.oauth, clientId: idp.clientId, clientSecret: idp.clientSecret, redirectUri: idp.redirectUri };
    const connections = new Connections({ store: new DrizzleConnectionStore(database.db), encryption, stateSecret: 'a-postgres-test-state-secret-0123456789', providers: [provider] }, { fetch: idp.fetch, now: () => clock.now });
    const ctx = createContext({ userId: `bo-${crypto.randomUUID()}`, tenantId: 't-pg', logger: silent });
    const back = new URL(idp.approve((await connections.authorize(ctx, 'acme')).url));
    await connections.complete(ctx, 'acme', { code: back.searchParams.get('code')!, state: back.searchParams.get('state')! });

    clock.now += 3_600_000;
    let refreshed = '';
    await expect(
      withTransaction(database.db, ctx, async () => {
        refreshed = (await connections.resolve(ctx, { provider: 'acme' })).accessToken;
        throw new IntegrationError('test/rollback', 'the app’s work failed');
      }),
    ).rejects.toMatchObject({ code: 'test/rollback' });
    // The rotated refresh token was kept: the token is still the refreshed one, and the next refresh works
    expect((await connections.resolve(ctx, { provider: 'acme' })).accessToken).toBe(refreshed);
    clock.now += 3_600_000;
    await expect(connections.resolve(ctx, { provider: 'acme' })).resolves.toMatchObject({ accessToken: expect.stringMatching(/^at_/) });
    expect(idp.log.refreshes).toBe(2);
  });

  it('keeps the table and column names the docs promise', async () => {
    const columns = async (table: string) =>
      Object.fromEntries(
        rows<{ column_name: string; data_type: string }>(await database.db.execute(sql`select column_name, data_type from information_schema.columns where table_name = ${table}`)).map((c) => [c.column_name, c.data_type]),
      );
    expect(await columns('integration_connections')).toMatchObject({
      id: 'uuid',
      tenant_id: 'text',
      user_id: 'text',
      provider: 'text',
      account_id: 'text',
      scopes: 'jsonb',
      access_token: 'text',
      refresh_token: 'text',
      expires_at: 'timestamp with time zone',
      status: 'text',
    });
    expect(await columns('integration_authorizations')).toMatchObject({ nonce_hash: 'text', code_verifier: 'text', expires_at: 'timestamp with time zone' });
  });
});
