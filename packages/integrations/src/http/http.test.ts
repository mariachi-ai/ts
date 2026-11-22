import { BaseController, bearerStrategy, createApiServer } from '@mariachi/api-facade';
import { createCommunication } from '@mariachi/communication';
import { AuthError } from '@mariachi/core';
import { createEncryption, generateLocalKey } from '@mariachi/encryption';
import { TestTracer } from '@mariachi/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Connections } from '../connections/connections';
import { MemoryConnectionStore } from '../connections/memory';
import { CONNECTION_PROCEDURES, registerConnectionProcedures } from '../connections/procedures';
import { type StandInProvider, standInProvider } from '../connections/stand-in-provider';
import { assertProviderSpans } from '../testing';
import { ConnectionsController } from './index';

const silent = { info() {}, warn() {}, error() {}, debug() {}, child: () => silent };

/** A bearer token is `<user>`; every user is in tenant `t-1`. */
const verifier = {
  async verify(token: string) {
    if (!token) throw new AuthError('auth/invalid-token', 'bad token');
    return { userId: token, tenantId: 't-1', scopes: [], identityType: 'session' };
  },
};

/** The app's own route that uses a connection, as a client of the provider's API would. */
class ContactsController extends BaseController {
  readonly prefix = 'contacts';
  constructor(private readonly connections: Connections) {
    super();
  }
  init() {
    this.get('token-works', async (ctx) => ({ connectionId: (await this.connections.resolve(ctx, { provider: 'acme' })).connectionId }));
  }
}

let idp: StandInProvider;
let base: string;

beforeAll(async () => {
  idp = standInProvider({ delayMs: 5 });
  base = await idp.listen();
});

afterAll(async () => {
  await idp.close();
});

function app() {
  const tracer = new TestTracer();
  const store = new MemoryConnectionStore();
  const connections = new Connections(
    {
      store,
      encryption: createEncryption({ adapter: 'local', keys: { k1: generateLocalKey() } }),
      stateSecret: 'an-http-test-state-secret-0123456789',
      providers: [{ id: 'acme', category: 'crm', oauth: idp.oauth, clientId: idp.clientId, clientSecret: idp.clientSecret, redirectUri: idp.redirectUri, clientAuth: 'basic' }],
    },
    { tracer },
  );
  const communication = createCommunication({}, { logger: silent });
  registerConnectionProcedures(communication, connections);
  const api = createApiServer({ name: 'test', logger: silent, prefix: '/api' })
    .withAuthStrategy('session', bearerStrategy(verifier))
    .withAuth('session')
    .registerController(new ConnectionsController(communication))
    .registerController(new ContactsController(connections));
  const call = async (user: string, method: 'GET' | 'POST' | 'DELETE', url: string, payload?: unknown) => {
    const response = await api.inject({ method, url: `/api${url}`, headers: { authorization: `Bearer ${user}` }, ...(payload === undefined ? {} : { payload }) });
    return { status: response.statusCode, headers: response.headers, body: response.json<Record<string, any>>() };
  };
  return { call, communication, tracer, store };
}

describe('connections over HTTP, against a stand-in OAuth server', () => {
  it('registers every procedure the controller calls', () => {
    const { communication } = app();
    expect(CONNECTION_PROCEDURES.filter((name) => !communication.has(name))).toEqual([]);
  });

  it('connects, uses, lists and disconnects an account', async () => {
    const { call, tracer, store } = app();
    const started = await call('ada', 'POST', '/connections/acme/authorize');
    expect(started.status).toBe(200);
    expect(started.headers['cache-control']).toBe('no-store');
    expect(started.body.url.startsWith(`${base}/authorize?`)).toBe(true);

    // The user approves at the provider, which sends the browser to the app's page with the code and state;
    // the page posts them here as the signed-in user
    const back = new URL(idp.approve(started.body.url));
    const callback = { code: back.searchParams.get('code'), state: back.searchParams.get('state') };
    expect((await call('eve', 'POST', '/connections/acme/callback', callback)).body.error.code).toBe('integrations/invalid-state');
    const done = await call('ada', 'POST', '/connections/acme/callback', callback);
    expect(done.status).toBe(200);
    expect(done.body).toMatchObject({ provider: 'acme', status: 'active', scopes: ['contacts.read', 'contacts.write'] });
    expect(JSON.stringify(done.body)).not.toMatch(/at_|rt_|mx1:/);
    expect(done.body).not.toHaveProperty('userId');
    const id = done.body.id as string;

    // Replayed: refused, and the provider isn't asked again
    const replay = await call('ada', 'POST', '/connections/acme/callback', callback);
    expect(replay).toMatchObject({ status: 400, body: { error: { code: 'integrations/invalid-state' } } });

    expect((await call('ada', 'GET', '/contacts/token-works')).body).toEqual({ connectionId: id });
    expect((await call('eve', 'GET', '/contacts/token-works')).body.error.code).toBe('integrations/connection-not-found');

    const listed = await call('ada', 'GET', '/connections');
    expect(listed.body).toMatchObject([{ id, provider: 'acme', status: 'active' }]);
    expect((await call('eve', 'GET', '/connections')).body).toEqual([]);

    expect((await call('eve', 'DELETE', `/connections/${id}`)).status).toBe(404);
    expect((await call('ada', 'DELETE', `/connections/${id}`)).body).toEqual({ revokedAtProvider: true });
    expect((await call('ada', 'GET', '/connections')).body).toEqual([]);
    expect(store.rows()[0]).toMatchObject({ status: 'revoked', accessToken: null, refreshToken: null });

    expect(tracer.spans.map((s) => s.name)).toEqual(['acme oauth.exchange', 'acme oauth.revoke']);
    expect(tracer.spans[0]!.attributes['server.address']).toBe(new URL(base).host);
    expect(tracer.spans[1]!.attributes['mariachi.integration.connection']).toBe(id);
    assertProviderSpans(tracer.spans);
    const recorded = JSON.stringify(tracer.spans);
    for (const secret of [...idp.log.issued, ...idp.log.codes, callback.state!, idp.clientSecret]) expect(recorded).not.toContain(secret);
  });

  it('checks what each route takes', async () => {
    const { call } = app();
    expect((await call('ada', 'POST', '/connections/Not_An_Id/authorize')).status).toBe(400);
    expect((await call('ada', 'POST', '/connections/other/authorize')).body.error.code).toBe('integrations/provider-not-found');
    expect((await call('ada', 'POST', '/connections/acme/callback', { code: 'c', state: 's', extra: 1 })).status).toBe(400);
    expect((await call('ada', 'DELETE', '/connections/not-a-uuid')).status).toBe(400);
  });
});
