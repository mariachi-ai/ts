import { createContext } from '@mariachi/core';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { describe, expect, it } from 'vitest';
import { createPipedrive } from './client';
import { PipedriveError } from './errors';
import { fieldsBody, noteHtml } from './fields';
import { settings } from './generated';
import { fakePipedrive, pipedriveEvent, pipedriveWebhook } from './testing';
import { PipedriveWebhookBody, pipedriveEventType, pipedriveWebhookAuth } from './webhooks';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger });
const config = { apiToken: 'pd-token', companyDomain: 'acme', webhookUser: 'pipedrive', webhookPassword: 'hook-password' };
const noWait = { sleep: async () => {} };
const CUSTOM = 'dcf558aac1ae4e8c4f849ba5e668430d8df9be12';

const person = (over: Record<string, unknown> = {}) => ({ id: 7, name: 'Ada Lovelace', emails: [{ value: 'ada@example.com', primary: true, label: 'work' }], phones: [], org_id: null, ...over });
const ok = (data: unknown, additional_data?: unknown) => ({ json: { success: true, data, ...(additional_data ? { additional_data } : {}) } });
const hits = (items: unknown[]) => ok({ items: items.map((item) => ({ result_score: 1, item })) }, { next_cursor: null });

describe('the client', () => {
  it('reads a person with the token in x-api-token, from the company domain, one span per call and nothing sensitive on it', async () => {
    const fetch = scriptedFetch(ok(person()));
    const tracer = new TestTracer();
    const p = await createPipedrive(config, { fetch, tracer }).persons.get(ctx, 7);
    expect(p.emails[0]!.value).toBe('ada@example.com');
    const [req] = fetch.requests;
    expect(req!.url.href).toBe('https://acme.pipedrive.com/api/v2/persons/7');
    expect(req!.headers['x-api-token']).toBe('pd-token');
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([['pipedrive persons.get', 'client', 'acme.pipedrive.com']]);
    assertProviderSpans(tracer.spans);
  });

  it('takes the company domain as a subdomain, a host or a URL, and refuses anything else', async () => {
    for (const companyDomain of ['acme.pipedrive.com', 'https://acme.pipedrive.com/']) {
      const fetch = scriptedFetch(ok(person()));
      await createPipedrive({ ...config, companyDomain }, { fetch }).persons.get(ctx, 7);
      expect(fetch.requests[0]!.url.host).toBe('acme.pipedrive.com');
    }
    expect(() => createPipedrive({ ...config, companyDomain: 'acme.example.com/x y' })).toThrow(/subdomain/);
  });

  it('finds a person by email with an exact search of the email field', async () => {
    const fetch = scriptedFetch(hits([{ id: 7, name: 'Ada', emails: ['ada@example.com'], phones: [] }]));
    const found = await createPipedrive(config, { fetch }).persons.findByEmail(ctx, 'ada@example.com');
    expect(found?.id).toBe(7);
    const q = fetch.requests[0]!.url.searchParams;
    expect([fetch.requests[0]!.url.pathname, q.get('term'), q.get('fields'), q.get('exact_match'), q.get('limit')]).toEqual(['/api/v2/persons/search', 'ada@example.com', 'email', 'true', '1']);
  });

  it('puts custom fields under custom_fields and standard ones at the top', async () => {
    const fetch = scriptedFetch(ok({ id: 3, title: 'Big', value: 100, currency: 'EUR' }));
    await createPipedrive(config, { fetch }).deals.create(ctx, { title: 'Big', value: 100, currency: 'EUR', fields: { [CUSTOM]: 'Enterprise', visible_to: 3 } });
    expect(fetch.requests[0]!.json).toEqual({ title: 'Big', value: 100, currency: 'EUR', visible_to: 3, custom_fields: { [CUSTOM]: 'Enterprise' } });
  });

  it('keeps a standard field given in fields when its option is unset', async () => {
    const fetch = scriptedFetch(ok(person()));
    await createPipedrive(config, { fetch }).persons.update(ctx, { id: 7, fields: { owner_id: 5 } });
    expect(fetch.requests[0]!.json).toEqual({ owner_id: 5 });
  });

  it('pages through every deal by cursor', async () => {
    const fetch = scriptedFetch(ok([{ id: 1, title: 'a' }, { id: 2, title: 'b' }], { next_cursor: 'c2' }), ok([{ id: 3, title: 'c' }], { next_cursor: null }));
    const seen: number[] = [];
    for await (const d of createPipedrive(config, { fetch }).deals.all(ctx, { status: ['open', 'won'] })) seen.push(d.id);
    expect(seen).toEqual([1, 2, 3]);
    expect(fetch.requests[0]!.url.searchParams.get('status')).toBe('open,won');
    expect(fetch.requests[0]!.url.searchParams.get('cursor')).toBeNull();
    expect(fetch.requests[1]!.url.searchParams.get('cursor')).toBe('c2');
  });

  it('pages through notes by offset, on API v1', async () => {
    const fetch = scriptedFetch(
      ok([{ id: 1, content: 'a' }], { pagination: { start: 0, limit: 1, more_items_in_collection: true, next_start: 1 } }),
      ok([{ id: 2, content: 'b' }], { pagination: { start: 1, limit: 1, more_items_in_collection: false } }),
    );
    const seen: number[] = [];
    for await (const n of createPipedrive(config, { fetch }).notes.all(ctx, { dealId: 4, limit: 1 })) seen.push(n.id);
    expect(seen).toEqual([1, 2]);
    expect(fetch.requests.map((r) => [r.url.pathname, r.url.searchParams.get('start'), r.url.searchParams.get('deal_id')])).toEqual([
      ['/api/v1/notes', '0', '4'],
      ['/api/v1/notes', '1', '4'],
    ]);
  });

  it('makes a v2 webhook with the Basic credentials, drops the password from the answer, and refuses without them', async () => {
    const fetch = scriptedFetch(ok({ id: 9, event_action: 'change', event_object: 'deal', subscription_url: 'https://app.test/webhooks/pipedrive/events', version: '2.0', http_auth_user: 'pipedrive', http_auth_password: 'hook-password' }));
    const hook = await createPipedrive(config, { fetch }).webhooks.create(ctx, { url: 'https://app.test/webhooks/pipedrive/events', action: 'change', object: 'deal', name: 'app' });
    expect(fetch.requests[0]!.url.pathname).toBe('/api/v1/webhooks');
    expect(fetch.requests[0]!.json).toEqual({ subscription_url: 'https://app.test/webhooks/pipedrive/events', event_action: 'change', event_object: 'deal', name: 'app', version: '2.0', http_auth_user: 'pipedrive', http_auth_password: 'hook-password' });
    expect(hook).not.toHaveProperty('http_auth_password');
    await expect(createPipedrive({ apiToken: 't', companyDomain: 'acme' }).webhooks.create(ctx, { url: 'https://app.test/h', action: '*', object: '*', name: 'app' })).rejects.toMatchObject({ code: 'pipedrive/no-webhook-auth' });
  });

  it("fails as a PipedriveError with Pipedrive's code, never its message, retrying only rate limits", async () => {
    const fetch = scriptedFetch(
      { status: 429, headers: { 'x-ratelimit-remaining': '0' } },
      { status: 404, json: { success: false, error: 'Person ada@example.com not found', error_info: 'see docs', data: null, additional_data: { code: 'NOT_FOUND' } } },
    );
    const tracer = new TestTracer();
    const err = await createPipedrive(config, { fetch, tracer, ...noWait }).persons.get(ctx, 7).catch((e) => e);
    expect(err).toBeInstanceOf(PipedriveError);
    expect([err.code, err.category, err.providerCode, fetch.requests.length]).toEqual(['pipedrive/not-found', 'not-found', 'NOT_FOUND', 2]);
    expect(err.message).not.toContain('ada@');
    assertProviderSpans(tracer.spans);
  });

  it("names the failures Pipedrive documents by status, and doesn't retry them", async () => {
    const at = async (status: number) => createPipedrive(config, { fetch: scriptedFetch({ status, json: { success: false, error: 'x' } }), ...noWait }).deals.get(ctx, 1).catch((e) => e);
    expect([(await at(402)).code, (await at(402)).category]).toEqual(['pipedrive/account-not-open', 'forbidden']);
    expect((await at(415)).code).toBe('pipedrive/feature-not-enabled');
    expect((await at(501)).code).toBe('pipedrive/not-implemented');
    expect((await at(401)).category).toBe('unauthorized');
  });

  it('checks its input before calling', async () => {
    const pd = createPipedrive(config, { fetch: scriptedFetch() });
    await expect(pd.persons.get(ctx, -1)).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(pd.notes.create(ctx, { content: 'orphan' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(pd.upsertContactByEmail(ctx, { email: 'not-an-email' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });
});

describe('the same three in every CRM', () => {
  it('upsertContactByEmail adds a person, with a new organization, when none has the address', async () => {
    const fetch = scriptedFetch(hits([]), hits([]), ok({ id: 50, name: 'Acme' }), ok(person({ id: 8 })));
    const tracer = new TestTracer();
    const result = await createPipedrive(config, { fetch, tracer }).upsertContactByEmail(ctx, { email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace', phone: '+44 20 1234', company: 'Acme', properties: { [CUSTOM]: 'Gold' } });
    expect(result).toEqual({ id: '8', created: true });
    expect(fetch.requests.map((r) => `${r.method} ${r.url.pathname}`)).toEqual(['GET /api/v2/persons/search', 'GET /api/v2/organizations/search', 'POST /api/v2/organizations', 'POST /api/v2/persons']);
    expect(fetch.requests[3]!.json).toEqual({ name: 'Ada Lovelace', emails: [{ value: 'ada@example.com', primary: true }], phones: [{ value: '+44 20 1234', primary: true }], org_id: 50, custom_fields: { [CUSTOM]: 'Gold' } });
    expect(tracer.spans.map((s) => s.name)).toEqual(['pipedrive persons.search', 'pipedrive organizations.search', 'pipedrive organizations.create', 'pipedrive persons.create']);
    assertProviderSpans(tracer.spans);
  });

  it('upsertContactByEmail changes the person who has the address, keeping their other phones', async () => {
    const fetch = scriptedFetch(
      hits([{ id: 7, name: 'Ada', emails: ['ada@example.com'], phones: ['111'] }]),
      ok(person({ phones: [{ value: '111', primary: true, label: 'home' }] })),
      ok(person()),
    );
    const result = await createPipedrive(config, { fetch }).upsertContactByEmail(ctx, { email: 'ADA@example.com', phone: '222' });
    expect(result).toEqual({ id: '7', created: false });
    expect(fetch.requests[2]!.method).toBe('PATCH');
    expect(fetch.requests[2]!.url.pathname).toBe('/api/v2/persons/7');
    expect(fetch.requests[2]!.json).toEqual({ phones: [{ value: '222', primary: true }, { value: '111', primary: false, label: 'home' }] });
  });

  it("upsertContactByEmail changes nothing when there's nothing to change", async () => {
    const fetch = scriptedFetch(hits([{ id: 7, name: 'Ada', emails: ['ada@example.com'], phones: [] }]));
    expect(await createPipedrive(config, { fetch }).upsertContactByEmail(ctx, { email: 'ada@example.com' })).toEqual({ id: '7', created: false });
    expect(fetch.requests).toHaveLength(1);
  });

  it('createDeal resolves a stage name to its id and pipeline', async () => {
    const fetch = scriptedFetch(
      ok([{ id: 1, name: 'Qualified', pipeline_id: 1 }, { id: 5, name: 'Proposal made', pipeline_id: 2 }], { next_cursor: null }),
      ok({ id: 30, title: 'Acme renewal' }),
    );
    const result = await createPipedrive(config, { fetch }).createDeal(ctx, { name: 'Acme renewal', amount: 1200, currency: 'EUR', stage: 'proposal made', contactId: '7', companyId: '50' });
    expect(result).toEqual({ id: '30' });
    expect(fetch.requests[1]!.json).toEqual({ title: 'Acme renewal', value: 1200, currency: 'EUR', person_id: 7, org_id: 50, pipeline_id: 2, stage_id: 5 });
  });

  it('createDeal takes a stage id as it is, and refuses a name two pipelines share', async () => {
    const byId = scriptedFetch(ok({ id: 31, title: 'x' }));
    await createPipedrive(config, { fetch: byId }).createDeal(ctx, { name: 'x', stage: '4' });
    expect(byId.requests[0]!.json).toEqual({ title: 'x', stage_id: 4 });
    const shared = scriptedFetch(ok([{ id: 1, name: 'Won', pipeline_id: 1 }, { id: 9, name: 'won', pipeline_id: 2 }], { next_cursor: null }));
    await expect(createPipedrive(config, { fetch: shared }).createDeal(ctx, { name: 'x', stage: 'Won' })).rejects.toMatchObject({ code: 'pipedrive/ambiguous-stage' });
  });

  it('addNote adds a v1 note to the person, deal and organization given', async () => {
    const fetch = scriptedFetch(ok({ id: 77, content: 'Called' }));
    expect(await createPipedrive(config, { fetch }).addNote(ctx, { body: noteHtml('Called <them>\nback'), contactId: '7', dealId: '30' })).toEqual({ id: '77' });
    expect(fetch.requests[0]!.url.pathname).toBe('/api/v1/notes');
    expect(fetch.requests[0]!.json).toEqual({ content: 'Called &lt;them&gt;<br>back', person_id: 7, deal_id: 30 });
    await expect(createPipedrive(config, { fetch: scriptedFetch() }).addNote(ctx, { body: 'x' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });
});

describe('fieldsBody', () => {
  it('sends 40-character codes as custom fields, and nothing extra when there are none', () => {
    expect(fieldsBody({ owner_id: 2, [CUSTOM]: null })).toEqual({ owner_id: 2, custom_fields: { [CUSTOM]: null } });
    expect(fieldsBody({ owner_id: 2 })).toEqual({ owner_id: 2 });
    expect(fieldsBody(undefined)).toEqual({});
  });
});

describe('settings', () => {
  it('reads from the environment by name, and says where to find each', () => {
    expect(settingsFromEnv(settings, (n) => ({ PIPEDRIVE_API_TOKEN: 't', PIPEDRIVE_COMPANY_DOMAIN: 'acme' })[n])).toEqual({ apiToken: 't', companyDomain: 'acme' });
    expect(() => settingsFromEnv(settings, () => undefined)).toThrow(/PIPEDRIVE_API_TOKEN, PIPEDRIVE_COMPANY_DOMAIN/);
    expect(settings.every((s) => s.whereToFind)).toBe(true);
    expect(checkSetting(settings[0]!, 'test', 'abc')).toBeNull();
  });
});

describe('webhooks', () => {
  const credentials = { user: 'pipedrive', password: 'hook-password' };

  class PipedriveWebhooks extends WebhookController {
    readonly prefix = 'pipedrive';
    readonly auth = pipedriveWebhookAuth(credentials);
    init() {
      this.post('events', { mode: 'direct', procedure: 'crm.fromPipedrive', eventType: pipedriveEventType }, async (_ctx, body) => PipedriveWebhookBody.parse(body));
    }
  }

  function server() {
    const received: unknown[] = [];
    const tracer = new TestTracer();
    const communication = { call: async (_ctx: unknown, _name: string, input: unknown) => { received.push(input); return { ok: true }; } } as never;
    const s = new WebhookServer({ name: 'webhooks', logger }, { communication, tracer }).registerController(new PipedriveWebhooks());
    const post = (d: { rawBody: string; headers: Record<string, string> }) => s.inject({ method: 'POST', url: '/pipedrive/events', headers: { 'content-type': 'application/json', ...d.headers }, payload: d.rawBody });
    return { received, tracer, post };
  }

  it('receives a delivery with the right Basic credentials through WebhookServer, with its span', async () => {
    const { received, tracer, post } = server();
    const event = pipedriveEvent({ entity: 'deal', action: 'change', data: { id: 30, stage_id: 5 }, previous: { stage_id: 1 } });
    expect((await post(pipedriveWebhook(event, credentials))).statusCode).toBe(200);
    const body = received[0] as ReturnType<typeof PipedriveWebhookBody.parse>;
    expect([body.meta.entity, body.meta.action, body.data?.stage_id, body.previous?.stage_id]).toEqual(['deal', 'change', 5, 1]);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['mariachi.integration.event']])).toEqual([['pipedrive webhook', 'server', 'deal.change']]);
  });

  it('answers 401 to a wrong password, a wrong user, or none', async () => {
    const { received, post } = server();
    const event = pipedriveEvent({ entity: 'person', action: 'create', data: { id: 7 } });
    expect((await post(pipedriveWebhook(event, { ...credentials, password: 'guess' }))).statusCode).toBe(401);
    expect((await post(pipedriveWebhook(event, { ...credentials, user: 'someone' }))).statusCode).toBe(401);
    expect((await post({ rawBody: JSON.stringify(event), headers: {} })).statusCode).toBe(401);
    expect((await post({ rawBody: JSON.stringify(event), headers: { authorization: 'Bearer hook-password' } })).statusCode).toBe(401);
    expect(received).toHaveLength(0);
  });

  it('takes the event id from meta, and accepts the next password while rotating', async () => {
    const auth = pipedriveWebhookAuth({ user: 'pipedrive', password: ['old-password', 'hook-password'] });
    const delivery = pipedriveWebhook(pipedriveEvent({ entity: 'note', action: 'delete', previous: { id: 77 }, id: 'e5a5c0c2-1f1a-4c8e-9d2a-000000000001', attempt: 2 }), credentials);
    const identity = await auth.auth({ rawBody: Buffer.from(delivery.rawBody), headers: delivery.headers } as never, { logger } as never);
    expect([identity?.eventId, identity?.metadata]).toEqual(['e5a5c0c2-1f1a-4c8e-9d2a-000000000001', { attempt: 2 }]);
    expect(pipedriveEventType({ meta: { entity: 'note', action: 'delete' } })).toBe('note.delete');
    expect(pipedriveEventType({})).toBeUndefined();
  });

  it('refuses to start without a password or a user', () => {
    expect(() => pipedriveWebhookAuth({ user: 'pipedrive', password: '' })).toThrow();
    expect(() => pipedriveWebhookAuth({ user: '', password: 'x' })).toThrow();
  });
});

describe('the fake', () => {
  it('stands in for the client, the shared helpers included', async () => {
    const fake = fakePipedrive({ stages: [{ id: 1, name: 'Qualified', pipeline_id: 1 }] });
    const first = await fake.upsertContactByEmail(ctx, { email: 'ada@example.com', firstName: 'Ada', company: 'Acme' });
    const again = await fake.upsertContactByEmail(ctx, { email: 'Ada@Example.com', lastName: 'Lovelace' });
    expect([first.created, again.created, again.id]).toEqual([true, false, first.id]);
    expect(fake.persons_.get(Number(first.id))?.name).toBe('Ada');
    await fake.upsertContactByEmail(ctx, { email: 'ada@example.com', firstName: 'Ada', lastName: 'Lovelace' });
    expect(fake.persons_.get(Number(first.id))?.name).toBe('Ada Lovelace');
    expect(fake.organizations_.size).toBe(1);
    const deal = await fake.createDeal(ctx, { name: 'Renewal', stage: 'qualified', contactId: first.id });
    expect(fake.deals_.get(Number(deal.id))).toMatchObject({ stage_id: 1, pipeline_id: 1, person_id: Number(first.id) });
    await fake.addNote(ctx, { body: 'Hi', dealId: deal.id });
    expect((await fake.notes.list(ctx, { dealId: Number(deal.id) })).items).toHaveLength(1);
    await expect(fake.persons.get(ctx, 999)).rejects.toMatchObject({ code: 'pipedrive/not-found', category: 'not-found' });
  });
});
