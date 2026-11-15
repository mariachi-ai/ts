import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { createContext } from '@mariachi/core';
import { applySchema, createPostgresDatabase, type PostgresDatabase } from '@mariachi/database-postgres';
import { startPostgres, stopAll } from '../../../../test/setup';
import { aiMessagesTable, aiSessionsTable, aiTelemetryTable } from '../schema/index';
import { DefaultAI } from '../ai';
import { createAI } from '../index';
import { SessionManager } from '../session/manager';
import { ToolRegistry } from '../tools/registry';
import type { AIResponse } from '../types';
import { DrizzleAISessionStore } from './index';

let database: PostgresDatabase;
let store: DrizzleAISessionStore;
const run = crypto.randomUUID().slice(0, 8);

const reply = (n: number): AIResponse => ({
  content: `reply ${n}`,
  usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
  model: 'test',
  latencyMs: 1,
});

beforeAll(async () => {
  database = createPostgresDatabase({ url: await startPostgres() });
  await database.connect();
  await applySchema(database.db, [aiSessionsTable, aiMessagesTable, aiTelemetryTable]);
  store = new DrizzleAISessionStore(database.db);
}, 180_000);

afterAll(async () => {
  await database?.disconnect();
  await stopAll();
});

describe('DrizzleAISessionStore', () => {
  it('restores history in order and usage after a restart', async () => {
    let n = 0;
    const adapter = { generate: async () => reply(++n) };
    const id = `chat-${run}`;
    const first = new SessionManager(adapter, store);
    const session = await first.createPersisted(id, { model: 'test', systemPrompt: 'be brief', tenantId: 't1', userId: 'u1' });
    await session.send('one');
    await session.send('two');

    const restarted = new SessionManager(adapter, store);
    expect(restarted.get(id)).toBeUndefined();
    const reopened = await restarted.open(id);
    expect(reopened?.getHistory().map((m) => m.content)).toEqual(['be brief', 'one', 'reply 1', 'two', 'reply 2']);
    expect(reopened?.usage?.().totalTokens).toBe(30);

    await reopened!.send('three');
    const rows = await database.db.execute(sql`select position from ai_messages where session_id = ${id} order by position`);
    expect([...rows].map((r) => Number(r.position))).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('saves a session\'s tools by name, and gives working tools back in another process', async () => {
    const lookup = { name: 'lookup', description: 'Look an order up', schema: z.object({ order: z.string() }), handler: async ({ order }: { order: string }) => ({ order, status: 'shipped' }) };
    const id = `tools-${run}`;
    const adapter = { generate: async () => ({ ...reply(1), content: '', toolCalls: [{ id: 'c1', name: 'lookup', arguments: { order: 'A-1' } }] }) };
    const registry = new ToolRegistry();
    registry.register(lookup);
    const first = new SessionManager(adapter, store, undefined, registry);
    const session = await first.createPersisted(id, { model: 'test', tenantId: 't1', userId: 'u1', tools: [lookup] });
    await session.send('where is A-1?');
    const [row] = [...(await database.db.execute(sql`select config from ai_sessions where id = ${id}`))];
    const config = typeof row?.config === 'string' ? JSON.parse(row.config) : row?.config;
    expect(config.toolNames).toEqual(['lookup']);
    expect(config.tools).toBeUndefined();

    // Another process, the same registration at startup
    const second = new SessionManager({ generate: async () => reply(2) }, store, undefined, registry);
    const reopened = await second.open(id);
    const [tool] = reopened?.tools?.() ?? [];
    expect(await tool?.handler({ order: 'A-1' })).toEqual({ order: 'A-1', status: 'shipped' });
    const [call] = reopened?.getHistory().at(-1)?.toolCalls ?? [];
    expect((await reopened?.send('', [{ callId: call?.id ?? '', toolName: 'lookup', result: await registry.execute('lookup', call?.arguments) }]))?.content).toBe('reply 2');

    // A process that never registered it is told which tool is missing
    const third = new SessionManager({ generate: async () => reply(3) }, store, undefined, new ToolRegistry());
    await expect((await third.open(id))?.send('again')).rejects.toMatchObject({ code: 'ai/tool-not-found', metadata: { tool: 'lookup' } });
  });

  it('reads a row saved before tool names were kept: the tools\' remains give their names', async () => {
    const id = `old-row-${run}`;
    // What JSON made of a tool: no handler, and whatever the schema serialised to
    const old = { model: 'test', maxIterations: 3, tools: [{ name: 'lookup', description: 'Look an order up', schema: { _def: {} } }] };
    await database.db.execute(sql`insert into ai_sessions (id, tenant_id, user_id, model, config) values (${id}, 't1', 'u1', 'test', ${JSON.stringify(old)}::jsonb)`);
    const loaded = await store.load(id);
    expect(loaded?.config.tools).toBeUndefined();
    expect(loaded?.config.toolNames).toEqual(['lookup']);
    expect(loaded?.config.maxIterations).toBe(3);
  });

  it('records telemetry', async () => {
    await store.recordTelemetry({ sessionId: `chat-${run}`, tenantId: 't1', model: 'test', inputTokens: 1, outputTokens: 2, latencyMs: 3.4, costUsd: 0.000123, createdAt: new Date() });
    const rows = await database.db.execute(sql`select cost_usd from ai_telemetry where session_id = ${`chat-${run}`}`);
    expect(Number([...rows][0]?.cost_usd)).toBeCloseTo(0.000123);
  });

  it('writes a row for every model call when it is the session store given to createAI', async () => {
    const id = `telemetry-${run}`;
    const silent = { info() {}, warn() {}, error() {}, debug() {}, child: () => silent };
    const ai = new DefaultAI(createAI({ adapter: 'custom', instance: { generate: async () => reply(1) }, sessions: store, costTable: { test: { input: 1, output: 2 } } }), { logger: silent });
    const ctx = createContext({ userId: 'u9', tenantId: 'tenant-9', logger: silent });
    const session = await ai.createSession(ctx, id, { model: 'test', tenantId: 'tenant-9', userId: 'u9' });
    await ai.send(ctx, session, 'one');
    await ai.send(ctx, session, 'two');
    // Written without holding the call up, so give the two inserts a moment
    let written: Array<Record<string, unknown>> = [];
    for (let i = 0; i < 50 && written.length < 2; i++) {
      await new Promise((resolve) => setTimeout(resolve, 20));
      written = [...(await database.db.execute(sql`select tenant_id, model, input_tokens, output_tokens, cost_usd from ai_telemetry where session_id = ${id}`))];
    }
    expect(written).toHaveLength(2);
    expect(written[0]).toMatchObject({ tenant_id: 'tenant-9', model: 'test', input_tokens: 10, output_tokens: 5 });
    expect(Number(written[0]?.cost_usd)).toBeCloseTo(0.02);
  });
});
