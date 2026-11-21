import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { DEFAULT_PAGE_CSP, html } from '@mariachi/api-facade';
import { InMemoryIdempotencyStore, createContext } from '@mariachi/core';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { jwtVerify } from 'jose';
import { describe, expect, it } from 'vitest';
import { INTERCOM_API_VERSION, createIntercom } from './client';
import { IntercomError } from './errors';
import { settings } from './generated';
import { intercomCsp } from './messenger';
import { Conversation } from './schemas';
import { fakeIntercom, intercomContact, intercomConversation, intercomNotification, signedIntercomWebhook } from './testing';
import { IntercomWebhookBody, intercomEventType, intercomWebhookAuth } from './webhooks';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger });
const MESSENGER_SECRET = 'messenger-secret-for-tests';
const config = { accessToken: 'dG9rOmFiYw==', appId: 'a86dr8yl', messengerSecret: MESSENGER_SECRET };
const noWait = { sleep: async () => {} };
const contact = (id: string, externalId: string) => ({ json: intercomContact({ id, external_id: externalId }) });
const notFound = { status: 404, json: { type: 'error.list', request_id: 'r1', errors: [{ code: 'not_found', message: 'User Not Found for jane@example.com' }] } };

describe('the client', () => {
  it('creates the user when there is none, with the token and pinned version, one span per call and nothing sensitive on it', async () => {
    const fetch = scriptedFetch(notFound, contact('c1', 'u1'));
    const tracer = new TestTracer();
    const result = await createIntercom(config, { fetch, tracer }).upsertContact(ctx, { id: 'u1', email: 'jane@example.com', name: 'Jane', attributes: { plan: 'team' } });
    expect(result).toEqual({ id: 'c1', created: true });
    const [find, create] = fetch.requests;
    expect([find!.method, find!.url.href]).toEqual(['GET', 'https://api.intercom.io/contacts/find_by_external_id/u1']);
    expect([create!.method, create!.url.href]).toEqual(['POST', 'https://api.intercom.io/contacts']);
    expect(create!.json).toEqual({ role: 'user', external_id: 'u1', email: 'jane@example.com', name: 'Jane', custom_attributes: { plan: 'team' } });
    expect(create!.headers.authorization).toBe('Bearer dG9rOmFiYw==');
    expect(create!.headers['intercom-version']).toBe(INTERCOM_API_VERSION);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([
      ['intercom contacts.findByExternalId', 'client', 'api.intercom.io'],
      ['intercom contacts.create', 'client', 'api.intercom.io'],
    ]);
    assertProviderSpans(tracer.spans);
  });

  it('updates the user it finds by the app’s id', async () => {
    const fetch = scriptedFetch(contact('c9', 'u1'), contact('c9', 'u1'));
    expect(await createIntercom(config, { fetch }).upsertContact(ctx, { id: 'u1', name: 'Jane' })).toEqual({ id: 'c9', created: false });
    expect([fetch.requests[1]!.method, fetch.requests[1]!.url.pathname, fetch.requests[1]!.json]).toEqual(['PUT', '/contacts/c9', { name: 'Jane' }]);
  });

  it('updates the user made by someone else between the lookup and the create', async () => {
    const conflict = { status: 409, json: { type: 'error.list', errors: [{ code: 'conflict', message: 'A contact matching those details already exists' }] } };
    const fetch = scriptedFetch(notFound, conflict, contact('c2', 'u1'), contact('c2', 'u1'));
    expect(await createIntercom(config, { fetch }).upsertContact(ctx, { id: 'u1' })).toEqual({ id: 'c2', created: false });
    expect(fetch.requests.map((r) => r.method)).toEqual(['GET', 'POST', 'GET', 'PUT']);
  });

  it('calls the region’s API, and refuses a region Intercom has not', async () => {
    const fetch = scriptedFetch(contact('c1', 'u1'));
    await createIntercom({ ...config, region: 'eu' }, { fetch }).contacts.get(ctx, 'c1');
    expect(fetch.requests[0]!.url.href).toBe('https://api.eu.intercom.io/contacts/c1');
    expect(() => createIntercom({ ...config, region: 'asia' })).toThrow(expect.objectContaining({ code: 'intercom/invalid-region' }));
  });

  it("fails as an IntercomError with Intercom's code, retrying only rate limits, and never keeps its message", async () => {
    const fetch = scriptedFetch(
      { status: 429, headers: { 'x-ratelimit-reset': '0' }, json: { type: 'error.list', errors: [{ code: 'rate_limit_exceeded' }] } },
      { status: 422, json: { type: 'error.list', errors: [{ code: 'parameter_invalid', message: 'jane@example.com is not valid' }] } },
    );
    const tracer = new TestTracer();
    const err = await createIntercom(config, { fetch, tracer, ...noWait }).contacts.create(ctx, { externalId: 'u1' }).catch((e) => e);
    expect(err).toBeInstanceOf(IntercomError);
    expect([err.code, err.category, err.providerCode, fetch.requests.length]).toEqual(['intercom/invalid-parameter', 'invalid-request', 'parameter_invalid', 2]);
    expect(err.message).not.toContain('jane');
    expect(tracer.spans[0]!.attributes['error.type']).toBe('parameter_invalid');
    assertProviderSpans(tracer.spans);
  });

  it('does not repeat a create after an outage, but does repeat a search', async () => {
    const outage = { status: 503, json: { type: 'error.list', errors: [{ code: 'service_unavailable' }] } };
    const create = scriptedFetch(outage);
    await expect(createIntercom(config, { fetch: create, ...noWait }).contacts.create(ctx, { externalId: 'u1' })).rejects.toMatchObject({ code: 'intercom/unavailable' });
    expect(create.requests).toHaveLength(1);
    const search = scriptedFetch(outage, { json: { type: 'list', data: [], total_count: 0, pages: { type: 'pages', page: 1 } } });
    const page = await createIntercom(config, { fetch: search, ...noWait }).contacts.search(ctx, { query: { field: 'email', operator: '=', value: 'jane@example.com' }, perPage: 10 });
    expect([page.data, search.requests.length]).toEqual([[], 2]);
    expect(search.requests[1]!.json).toEqual({ query: { field: 'email', operator: '=', value: 'jane@example.com' }, pagination: { per_page: 10 } });
  });

  it('tracks an event on the user, to the second, so a repeat is ignored by Intercom', async () => {
    const fetch = scriptedFetch({ status: 202, text: '' });
    await createIntercom(config, { fetch }).trackEvent(ctx, { userId: 'u1', name: 'invited-friend', metadata: { invite_code: 'ABC', price: { amount: 34999, currency: 'eur' } }, occurredAt: new Date('2026-11-21T10:00:00.900Z') });
    expect([fetch.requests[0]!.url.pathname, fetch.requests[0]!.json]).toEqual([
      '/events',
      { event_name: 'invited-friend', created_at: 1_795_255_200, user_id: 'u1', metadata: { invite_code: 'ABC', price: { amount: 34999, currency: 'eur' } } },
    ]);
  });

  it('makes companies and attaches them, by the app’s id and then Intercom’s', async () => {
    const fetch = scriptedFetch({ json: { type: 'company', id: 'co_1', company_id: 'org_1', name: 'Acme' } }, { json: { type: 'company', id: 'co_1', company_id: 'org_1' } });
    const intercom = createIntercom(config, { fetch });
    const company = await intercom.companies.createOrUpdate(ctx, { companyId: 'org_1', name: 'Acme', createdAt: new Date('2026-01-01T00:00:00Z') });
    await intercom.contacts.attachCompany(ctx, { contactId: 'c1', companyId: company.id });
    expect(fetch.requests.map((r) => [r.url.pathname, r.json])).toEqual([
      ['/companies', { company_id: 'org_1', name: 'Acme', remote_created_at: 1_767_225_600 }],
      ['/contacts/c1/companies', { id: 'co_1' }],
    ]);
  });

  it('reads, searches, answers and closes conversations as a teammate, and notes a contact', async () => {
    const conversation = intercomConversation({ id: '123' });
    const fetch = scriptedFetch(
      { json: { type: 'conversation.list', conversations: [conversation], pages: { next: { starting_after: 'cur' } } } },
      { json: conversation },
      { json: conversation },
      { json: { ...conversation, state: 'closed' } },
      { json: { type: 'note', id: 'n1', created_at: 1, body: '<p>VIP</p>' } },
    );
    const intercom = createIntercom(config, { fetch });
    const page = await intercom.conversations.search(ctx, { query: { operator: 'AND', value: [{ field: 'contact_ids', operator: '=', value: 'c1' }, { field: 'state', operator: '=', value: 'open' }] } });
    expect(page.pages?.next?.starting_after).toBe('cur');
    await intercom.conversations.get(ctx, { conversationId: '123', plaintext: true });
    await intercom.conversations.reply(ctx, { conversationId: '123', adminId: '42', body: 'On it' });
    await intercom.conversations.close(ctx, { conversationId: '123', adminId: '42' });
    await intercom.notes.create(ctx, { contactId: 'c1', body: 'VIP', adminId: '42' });
    expect(fetch.requests.map((r) => `${r.method} ${r.url.pathname}${r.url.search}`)).toEqual([
      'POST /conversations/search',
      'GET /conversations/123?display_as=plaintext',
      'POST /conversations/123/reply',
      'POST /conversations/123/parts',
      'POST /contacts/c1/notes',
    ]);
    expect(fetch.requests[2]!.json).toEqual({ message_type: 'comment', type: 'admin', admin_id: '42', body: 'On it' });
    expect(fetch.requests[3]!.json).toEqual({ message_type: 'close', type: 'admin', admin_id: '42' });
  });

  it('checks its input before calling', async () => {
    const intercom = createIntercom(config, { fetch: scriptedFetch() });
    await expect(intercom.events.create(ctx, { name: 'x', userId: 'u1', email: 'a@b.co' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(intercom.contacts.search(ctx, { query: { field: 'email', operator: '=', value: 'a' }, perPage: 500 })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(intercom.contacts.get(ctx, '')).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });
});

describe('the Messenger', () => {
  it('signs the user with the Messenger secret: HS256, user_id, email and the company nested, expiring', async () => {
    const now = Date.parse('2026-11-21T10:00:00Z');
    const intercom = createIntercom(config);
    const identity = await intercom.chatIdentity({ id: 'u1', email: 'jane@example.com', name: 'Jane', createdAt: new Date('2026-01-01T00:00:00Z'), company: { id: 'org_1', name: 'Acme' } }, { now: () => now });
    const { payload, protectedHeader } = await jwtVerify(identity.token, new TextEncoder().encode(MESSENGER_SECRET), { currentDate: new Date(now) });
    expect(protectedHeader.alg).toBe('HS256');
    expect(payload).toEqual({ user_id: 'u1', email: 'jane@example.com', name: 'Jane', created_at: 1_767_225_600, company: { company_id: 'org_1', name: 'Acme' }, iat: now / 1000, exp: now / 1000 + 3600 });
    expect([identity.userId, identity.expiresAt.toISOString()]).toEqual(['u1', '2026-11-21T11:00:00.000Z']);
    await expect(jwtVerify(identity.token, new TextEncoder().encode('another-secret'))).rejects.toThrow();
  });

  it('refuses to identify without a secret, or for less than five minutes', async () => {
    await expect(createIntercom({ accessToken: 't' }).chatIdentity({ id: 'u1' })).rejects.toMatchObject({ code: 'intercom/no-messenger-secret' });
    await expect(createIntercom(config).chatIdentity({ id: 'u1' }, { expiresIn: 60 })).rejects.toMatchObject({ code: 'intercom/invalid-expiry' });
    await expect(createIntercom(config).chatIdentity({ id: '' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });

  it('loads the loader script with the workspace, region and identity, as markup for a page', async () => {
    const intercom = createIntercom({ ...config, region: 'eu' });
    expect(intercom.widgetSnippet().value).toBe('<script src="/assets/lib/intercom.js" data-app-id="a86dr8yl" data-api-base="https://api-iam.eu.intercom.io"></script>');
    const identity = await intercom.chatIdentity({ id: 'u1' });
    const snippet = intercom.widgetSnippet({ identity, hideDefaultLauncher: true });
    expect(html`<body>${snippet}</body>`.value).toContain(`data-user-jwt="${identity.token}" data-hide-default-launcher></script>`);
  });

  it('refuses a missing or odd workspace ID, and a token that is not a JWT', () => {
    expect(() => createIntercom({ accessToken: 't' }).widgetSnippet()).toThrow(expect.objectContaining({ code: 'intercom/no-app-id' }));
    expect(() => createIntercom({ ...config, appId: 'a1"><script>' }).widgetSnippet()).toThrow(expect.objectContaining({ code: 'intercom/invalid-app-id' }));
    expect(() => createIntercom(config).widgetSnippet({ identity: { userId: 'u', token: '"><script>', expiresAt: new Date() } })).toThrow(IntercomError);
  });

  it("widens the page's policy for the Messenger, and leaves inline script blocked", () => {
    const csp = intercomCsp();
    const directive = (name: string) => csp.split('; ').find((d) => d.startsWith(`${name} `))!.split(' ');
    expect(directive('script-src')).toEqual(["script-src", "'self'", 'https://app.intercom.io', 'https://widget.intercom.io', 'https://js.intercomcdn.com']);
    expect(directive('connect-src')).toEqual(expect.arrayContaining(["'self'", 'https://api-iam.intercom.io', 'wss://*.intercom-messenger.com', 'wss://nexus-websocket-a.intercom.io']));
    expect(directive('form-action')).toEqual(["form-action", "'self'", 'https://intercom.help', 'https://api-iam.intercom.io', 'https://api-iam.eu.intercom.io', 'https://api-iam.au.intercom.io']);
    expect(directive('child-src')).toContain('https://intercom-sheets.com');
    expect(directive('img-src')).toEqual(expect.arrayContaining(["'self'", 'data:', 'blob:', 'https://static.intercomassets.com']));
    expect(directive('script-src')).not.toContain("'unsafe-inline'");
    expect(DEFAULT_PAGE_CSP).not.toContain('intercom');
    // A directive the policy leaves unrestricted stays so, and an existing frame-src gets the frames
    expect(intercomCsp("default-src 'none'; frame-src 'self'")).not.toContain('form-action');
    expect(intercomCsp("default-src 'none'; frame-src 'self'")).toContain("frame-src 'self' https://intercom-sheets.com");
  });
});

describe('the loader (browser/intercom.js)', () => {
  const source = readFileSync(fileURLToPath(new URL('../browser/intercom.js', import.meta.url)), 'utf8');

  function run(attributes: Record<string, string>, window: Record<string, unknown> = {}) {
    const appended: Array<{ src?: string; async?: boolean }> = [];
    const currentScript = { getAttribute: (name: string) => attributes[name] ?? null, hasAttribute: (name: string) => name in attributes };
    const document = { currentScript, createElement: () => ({}), head: { appendChild: (el: { src?: string }) => appended.push(el) } };
    runInNewContext(source, { window, document });
    return { window: window as { intercomSettings?: Record<string, unknown>; Intercom?: ((...args: unknown[]) => void) & { q?: unknown[] } }, appended };
  }

  it('sets the settings with the signed identity, queues calls, and loads the widget', () => {
    const { window, appended } = run({ 'data-app-id': 'a86dr8yl', 'data-api-base': 'https://api-iam.eu.intercom.io', 'data-user-jwt': 'h.p.s', 'data-hide-default-launcher': '' });
    expect(window.intercomSettings).toEqual({ app_id: 'a86dr8yl', api_base: 'https://api-iam.eu.intercom.io', intercom_user_jwt: 'h.p.s', hide_default_launcher: true });
    expect(appended).toEqual([{ async: true, src: 'https://widget.intercom.io/widget/a86dr8yl' }]);
    window.Intercom!('show');
    expect(window.Intercom!.q!.map((args) => Array.from(args as ArrayLike<unknown>))).toEqual([['show']]);
    expect(Object.prototype.toString.call(window.Intercom!.q![0])).toBe('[object Arguments]');
  });

  it('ignores an api_base that is not Intercom’s, and does nothing without a workspace', () => {
    expect(run({ 'data-app-id': 'abc', 'data-api-base': 'https://evil.example' }).window.intercomSettings).toEqual({ app_id: 'abc' });
    const none = run({});
    expect([none.window.intercomSettings, none.appended]).toEqual([undefined, []]);
  });

  it('updates a Messenger that is already loaded instead of loading another', () => {
    const calls: unknown[][] = [];
    const { appended } = run({ 'data-app-id': 'abc' }, { Intercom: (...args: unknown[]) => calls.push(args) });
    expect(appended).toEqual([]);
    expect(calls).toEqual([['reattach_activator'], ['update', { app_id: 'abc' }]]);
  });
});

describe('settings', () => {
  it('reads from the environment by name, and says where to find each', () => {
    expect(settingsFromEnv(settings, (n) => ({ INTERCOM_ACCESS_TOKEN: 'tok', INTERCOM_REGION: 'eu' })[n])).toEqual({ accessToken: 'tok', region: 'eu' });
    expect(settings.every((s) => s.whereToFind && s.url)).toBe(true);
    expect(checkSetting(settings[0]!, 'test', 'tok')).toBeNull();
    expect(settings.filter((s) => s.secret).map((s) => s.env)).toEqual(['INTERCOM_ACCESS_TOKEN', 'INTERCOM_MESSENGER_SECRET', 'INTERCOM_CLIENT_SECRET']);
  });
});

describe('webhooks', () => {
  class IntercomWebhooks extends WebhookController {
    readonly prefix = 'intercom';
    readonly auth = intercomWebhookAuth('client-secret');
    init() {
      this.post('notifications', { mode: 'direct', procedure: 'support.fromIntercom', eventType: intercomEventType }, async (_ctx, body) => IntercomWebhookBody.parse(body));
    }
  }

  it('receives a signed notification through WebhookServer, with its span, dedupes a retry on its id, and refuses a forged one', async () => {
    const received: unknown[] = [];
    const tracer = new TestTracer();
    const communication = { call: async (_ctx: unknown, _name: string, input: unknown) => { received.push(input); return { ok: true }; } } as never;
    const server = new WebhookServer({ name: 'webhooks', logger }, { communication, tracer, idempotency: new InMemoryIdempotencyStore() }).registerController(new IntercomWebhooks());
    const notification = intercomNotification('conversation.user.created', intercomConversation({ id: '77', contacts: { type: 'contact.list', contacts: [{ type: 'contact', id: 'c1', external_id: 'u1' }] } }));
    const post = (signed: { rawBody: string; headers: Record<string, string> }) =>
      server.inject({ method: 'POST', url: '/intercom/notifications', headers: { 'content-type': 'application/json', ...signed.headers }, payload: signed.rawBody });

    expect((await post(signedIntercomWebhook(notification, 'client-secret'))).statusCode).toBe(200);
    const body = received[0] as ReturnType<typeof IntercomWebhookBody.parse>;
    const conversation = Conversation.parse(body.data.item);
    expect([body.topic, conversation.id, conversation.contacts?.contacts[0]?.external_id]).toEqual(['conversation.user.created', '77', 'u1']);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['mariachi.integration.event']])).toEqual([['intercom webhook', 'server', 'conversation.user.created']]);

    // Intercom's retry: the same id, a different body (delivery_attempts), signed again
    const retry = await post(signedIntercomWebhook({ ...notification, delivery_attempts: 2 }, 'client-secret'));
    expect([retry.statusCode, received.length]).toEqual([200, 1]);

    expect((await post(signedIntercomWebhook(notification, 'someone-else'))).statusCode).toBe(401);
    const tampered = signedIntercomWebhook(notification, 'client-secret');
    expect((await post({ ...tampered, rawBody: tampered.rawBody.replace('"77"', '"78"') })).statusCode).toBe(401);
    expect(received).toHaveLength(1);
  });
});

describe('the fake', () => {
  it('stands in for the client in an app’s tests', async () => {
    const fake = fakeIntercom({ conversations: [intercomConversation({ id: '1', contacts: { type: 'contact.list', contacts: [{ type: 'contact', id: 'c1' }] } })] });
    const first = await fake.upsertContact(ctx, { id: 'u1', email: 'jane@example.com' });
    expect(first.created).toBe(true);
    expect(await fake.upsertContact(ctx, { id: 'u1', name: 'Jane' })).toEqual({ id: first.id, created: false });
    await fake.trackEvent(ctx, { userId: 'u1', name: 'signed-up' });
    await expect(fake.trackEvent(ctx, { userId: 'nobody', name: 'x' })).rejects.toMatchObject({ code: 'intercom/not-found' });
    expect(fake.events_.map((e) => [e.userId, e.name])).toEqual([['u1', 'signed-up']]);
    expect((await fake.conversations.search(ctx, { query: { field: 'contact_ids', operator: '=', value: 'c1' } })).conversations.map((c) => c.id)).toEqual(['1']);
    await fake.conversations.close(ctx, { conversationId: '1', adminId: '42' });
    expect(fake.conversations_.get('1')?.state).toBe('closed');
    expect((await fake.chatIdentity({ id: 'u1' })).userId).toBe('u1');
  });
});
