import { InMemoryIdempotencyStore, createContext } from '@mariachi/core';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { describe, expect, it } from 'vitest';
import { createHubSpot } from './client';
import { HubSpotError } from './errors';
import { settings } from './generated';
import { fakeHubSpot, hubspotEvent, signedHubSpotWebhook } from './testing';
import { HubSpotWebhookBody, hubspotEventKey, hubspotEventType, hubspotWebhookAuth, verifyHubSpotSignature } from './webhooks';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger });
const config = { accessToken: 'pat-test', clientSecret: 'client-secret' };
const noWait = { sleep: async () => {} };
const record = (id: string, properties: Record<string, string | null> = {}) => ({ id, properties, createdAt: '2026-11-21T10:00:00Z', updatedAt: '2026-11-21T10:00:00Z', archived: false });

describe('the same three in every CRM', () => {
  it('upsertContactByEmail makes one batch upsert by email, says whether it created, and spans it', async () => {
    const fetch = scriptedFetch({ json: { status: 'COMPLETE', results: [{ ...record('101'), new: true }], startedAt: 'x', completedAt: 'y' } });
    const tracer = new TestTracer();
    const result = await createHubSpot(config, { fetch, tracer }).upsertContactByEmail(ctx, { email: 'ada@example.com', firstName: 'Ada', company: 'Engines', properties: { lifecyclestage: 'lead', score: 4 } });
    expect(result).toEqual({ id: '101', created: true });
    const [req] = fetch.requests;
    expect([req!.method, req!.url.href, req!.headers.authorization]).toEqual(['POST', 'https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert', 'Bearer pat-test']);
    expect(req!.json).toEqual({ inputs: [{ id: 'ada@example.com', idProperty: 'email', properties: { email: 'ada@example.com', firstname: 'Ada', company: 'Engines', lifecyclestage: 'lead', score: '4' } }] });
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['mariachi.integration.category']])).toEqual([['hubspot contacts.batchUpsert', 'client', 'crm']]);
    assertProviderSpans(tracer.spans);
  });

  it('upsertContactByEmail fails with the category HubSpot gave when the batch did nothing', async () => {
    const fetch = scriptedFetch({ status: 207, json: { status: 'COMPLETE', results: [], numErrors: 1, errors: [{ status: 'error', category: 'VALIDATION_ERROR', message: 'ada@example.com is bad' }] } });
    const tracer = new TestTracer();
    const err = await createHubSpot(config, { fetch, tracer }).upsertContactByEmail(ctx, { email: 'ada@example.com' }).catch((e) => e);
    expect(err).toBeInstanceOf(HubSpotError);
    expect([err.code, err.category, err.providerCode]).toEqual(['hubspot/invalid-properties', 'invalid-request', 'VALIDATION_ERROR']);
    expect(err.message).not.toContain('ada@');
    // The span says it failed: a 207 is a 2xx, but this batch did nothing
    expect(tracer.spans).toHaveLength(1);
    expect(tracer.spans[0]).toMatchObject({ ended: true, status: { status: 'error' } });
    expect(tracer.spans[0]!.attributes).toMatchObject({ 'error.type': 'VALIDATION_ERROR', 'mariachi.integration.error_category': 'invalid-request' });
    assertProviderSpans(tracer.spans);
  });

  it('upsertContactByEmail fails as invalid-request with an error HubSpot has no reason for', async () => {
    const fetch = scriptedFetch({ status: 207, json: { status: 'COMPLETE', results: [], errors: [{ status: 'error', category: 'SOMETHING_NEW' }] } });
    const err = await createHubSpot(config, { fetch }).upsertContactByEmail(ctx, { email: 'ada@example.com' }).catch((e) => e);
    expect([err.code, err.category, err.providerCode]).toEqual(['hubspot/upsert-failed', 'invalid-request', 'SOMETHING_NEW']);
  });

  it('createDeal sends the deal properties and associates the contact and primary company', async () => {
    const fetch = scriptedFetch({ status: 201, json: record('900') });
    const tracer = new TestTracer();
    const deal = await createHubSpot(config, { fetch, tracer }).createDeal(ctx, { name: 'Renewal', amount: 1500.5, currency: 'EUR', stage: 'qualifiedtobuy', contactId: '101', companyId: '202', properties: { closedate: '2026-12-31' } });
    expect(deal).toEqual({ id: '900' });
    expect(fetch.requests[0]!.url.pathname).toBe('/crm/v3/objects/deals');
    expect(fetch.requests[0]!.json).toEqual({
      properties: { dealname: 'Renewal', amount: '1500.5', deal_currency_code: 'EUR', dealstage: 'qualifiedtobuy', closedate: '2026-12-31' },
      associations: [
        { to: { id: '101' }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }] },
        { to: { id: '202' }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 5 }] },
      ],
    });
    assertProviderSpans(tracer.spans);
  });

  it('createDeal without a stage puts it in the first stage of the first pipeline', async () => {
    const stages = [
      { id: 'won', label: 'Won', displayOrder: 1, metadata: {} },
      { id: 'new', label: 'New', displayOrder: 0, metadata: {} },
    ];
    const fetch = scriptedFetch(
      { json: { results: [{ id: 'second', label: 'B', displayOrder: 1, stages }, { id: 'default', label: 'A', displayOrder: 0, stages }] } },
      { status: 201, json: record('901') },
    );
    await createHubSpot(config, { fetch }).createDeal(ctx, { name: 'New logo' });
    expect(fetch.requests.map((r) => r.url.pathname)).toEqual(['/crm/v3/pipelines/deals', '/crm/v3/objects/deals']);
    expect(fetch.requests[1]!.json).toEqual({ properties: { dealname: 'New logo', dealstage: 'new', pipeline: 'default' }, associations: [] });
  });

  it('addNote puts a note on each record, and needs at least one', async () => {
    const fetch = scriptedFetch({ status: 201, json: record('n1', { hs_note_body: 'Called' }) });
    const hubspot = createHubSpot(config, { fetch });
    expect(await hubspot.addNote(ctx, { body: 'Called', contactId: '1', dealId: '2', companyId: '3' })).toEqual({ id: 'n1' });
    const body = fetch.requests[0]!.json as { properties: Record<string, string>; associations: Array<{ types: Array<{ associationTypeId: number }> }> };
    expect(fetch.requests[0]!.url.pathname).toBe('/crm/v3/objects/notes');
    expect(body.properties.hs_note_body).toBe('Called');
    expect(Number.isNaN(Date.parse(body.properties.hs_timestamp!))).toBe(false);
    expect(body.associations.map((a) => a.types[0]!.associationTypeId)).toEqual([202, 214, 190]);
    await expect(hubspot.addNote(ctx, { body: 'Nowhere' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });
});

describe('the client', () => {
  it('finds a contact by email with one search, or null', async () => {
    const fetch = scriptedFetch({ json: { total: 1, results: [record('7', { email: 'ada@example.com' })] } }, { json: { total: 0, results: [] } });
    const hubspot = createHubSpot(config, { fetch });
    expect((await hubspot.contacts.findByEmail(ctx, { email: 'ada@example.com', properties: ['email', 'phone'] }))?.id).toBe('7');
    expect(fetch.requests[0]!.json).toEqual({ filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: 'ada@example.com' }] }], properties: ['email', 'phone'], limit: 1 });
    expect(await hubspot.contacts.findByEmail(ctx, { email: 'nobody@example.com' })).toBeNull();
  });

  it('finds a company by its domain, cutting a URL to its host', async () => {
    const fetch = scriptedFetch({ json: { total: 0, results: [] } });
    await createHubSpot(config, { fetch }).companies.findByDomain(ctx, { domain: 'https://Example.com/about' });
    expect(fetch.requests[0]!.url.pathname).toBe('/crm/v3/objects/companies/search');
    expect((fetch.requests[0]!.json as { filterGroups: Array<{ filters: Array<{ value: string }> }> }).filterGroups[0]!.filters[0]!.value).toBe('example.com');
  });

  it('reads with the properties asked for, and updates with null as a cleared value', async () => {
    const fetch = scriptedFetch({ json: record('5', { firstname: 'Ada' }) }, { json: record('5') });
    const hubspot = createHubSpot(config, { fetch });
    await hubspot.contacts.get(ctx, { id: '5', properties: ['firstname', 'lastname'] });
    await hubspot.contacts.update(ctx, { id: '5', properties: { phone: null, vip: true } });
    expect(fetch.requests[0]!.url.href).toBe('https://api.hubapi.com/crm/v3/objects/contacts/5?properties=firstname%2Clastname');
    expect([fetch.requests[1]!.method, fetch.requests[1]!.json]).toEqual(['PATCH', { properties: { phone: '', vip: 'true' } }]);
  });

  it('moves a deal to another stage, and lists pipelines in display order without archived ones', async () => {
    const fetch = scriptedFetch(
      { json: record('9', { dealstage: 'closedwon' }) },
      { json: { results: [{ id: 'b', label: 'B', displayOrder: 1, stages: [] }, { id: 'old', label: 'Old', displayOrder: 0, archived: true, stages: [] }, { id: 'a', label: 'A', displayOrder: 0, stages: [{ id: 's2', label: 'S2', displayOrder: 2, metadata: {} }, { id: 's1', label: 'S1', displayOrder: 1, metadata: { isClosed: 'false' } }] }] } },
    );
    const hubspot = createHubSpot(config, { fetch });
    await hubspot.deals.moveToStage(ctx, { id: '9', stage: 'closedwon' });
    expect([fetch.requests[0]!.method, fetch.requests[0]!.url.pathname, fetch.requests[0]!.json]).toEqual(['PATCH', '/crm/v3/objects/deals/9', { properties: { dealstage: 'closedwon' } }]);
    const pipelines = await hubspot.dealPipelines.list(ctx);
    expect(pipelines.map((p) => [p.id, p.stages.map((s) => s.id)])).toEqual([['a', ['s1', 's2']], ['b', []]]);
  });

  it('associates, lists and dissociates records through associations v4', async () => {
    const fetch = scriptedFetch(
      { json: { status: 'COMPLETE', results: [] } },
      { json: { results: [{ toObjectId: 202, associationTypes: [{ category: 'HUBSPOT_DEFINED', typeId: 279, label: null }] }] } },
      { status: 204 },
    );
    const tracer = new TestTracer();
    const hubspot = createHubSpot(config, { fetch, tracer });
    await hubspot.associations.create(ctx, { from: { type: 'contact', id: '101' }, to: { type: 'company', id: '202' } });
    const page = await hubspot.associations.list(ctx, { from: { type: 'contact', id: '101' }, toType: 'company' });
    await hubspot.associations.delete(ctx, { from: { type: 'contact', id: '101' }, to: { type: 'company', id: '202' } });
    expect(fetch.requests.map((r) => `${r.method} ${r.url.pathname}`)).toEqual([
      'PUT /crm/v4/objects/contact/101/associations/default/company/202',
      'GET /crm/v4/objects/contact/101/associations/company',
      'DELETE /crm/v4/objects/contact/101/associations/company/202',
    ]);
    expect(page.results[0]!.toObjectId).toBe('202');
    expect(tracer.spans.map((s) => s.name)).toEqual(['hubspot associations.create', 'hubspot associations.list', 'hubspot associations.delete']);
    assertProviderSpans(tracer.spans);
  });

  it("fails as a HubSpotError with HubSpot's category, never its message, retrying only rate limits", async () => {
    const fetch = scriptedFetch(
      { status: 429, headers: { 'retry-after': '0' }, json: { status: 'error', message: 'You have reached your secondly limit.', category: 'RATE_LIMITS' } },
      { status: 409, json: { status: 'error', message: 'Contact already exists. Existing ID: 123', category: 'OBJECT_ALREADY_EXISTS' } },
    );
    const tracer = new TestTracer();
    const err = await createHubSpot(config, { fetch, tracer, ...noWait }).contacts.create(ctx, { properties: { email: 'ada@example.com' } }).catch((e) => e);
    expect(err).toBeInstanceOf(HubSpotError);
    expect([err.code, err.category, err.providerCode, fetch.requests.length]).toEqual(['hubspot/already-exists', 'conflict', 'OBJECT_ALREADY_EXISTS', 2]);
    expect(err.message).not.toContain('123');
    expect(tracer.spans[0]!.attributes['error.type']).toBe('OBJECT_ALREADY_EXISTS');
    assertProviderSpans(tracer.spans);
  });

  it('checks its input before calling', async () => {
    const hubspot = createHubSpot(config, { fetch: scriptedFetch() });
    await expect(hubspot.upsertContactByEmail(ctx, { email: 'not-an-email' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(hubspot.createDeal(ctx, { name: 'x', currency: 'euro' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(hubspot.contacts.search(ctx, { limit: 500 })).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });
});

describe('settings', () => {
  it('reads from the environment by name, and says where to find each', () => {
    expect(settingsFromEnv(settings, (n) => ({ HUBSPOT_ACCESS_TOKEN: 'pat-na1-1' })[n])).toEqual({ accessToken: 'pat-na1-1' });
    expect(settings.every((s) => s.whereToFind && s.secret)).toBe(true);
    expect(checkSetting(settings[0]!, 'production', 'pat-na1-1')).toBeNull();
  });
});

describe('webhooks', () => {
  it("matches HubSpot's documented example signature", () => {
    const rawBody =
      '[{"eventId":531833541,"subscriptionId":3923621,"portalId":48807704,"appId":16111050,"occurredAt":1752613920733,"subscriptionType":"contact.creation","attemptNumber":0,"objectId":138017612137,"changeFlag":"CREATED","changeSource":"CRM_UI","sourceId":"userId:76023669"}]';
    const headers = { 'x-hubspot-signature-v3': 'gbj1XPRvUt0noT7i7fXfTzOD4sLzQmf0VT28ZYq0EYg=', 'x-hubspot-request-timestamp': '1752613922216' };
    const request = { method: 'POST', url: 'https://webhook.site/335453f5-94b3-49d9-b684-a55354d4b8df', nowMs: 1752613922216 + 1000 };
    expect(verifyHubSpotSignature(rawBody, headers, 'cfc68c0b-4b4e-4ef8-b764-95350e4ea479', request).eventId).toMatch(/^events:/);
    expect(() => verifyHubSpotSignature(rawBody, headers, 'cfc68c0b-4b4e-4ef8-b764-95350e4ea479', { ...request, nowMs: 1752613922216 + 6 * 60_000 })).toThrow(/five minutes/);
    expect(() => verifyHubSpotSignature(rawBody, headers, 'cfc68c0b-4b4e-4ef8-b764-95350e4ea479', { ...request, method: 'PUT' })).toThrow(/mismatch/);
  });

  it('signs the query with the characters HubSpot decodes', () => {
    const events = [hubspotEvent()];
    const { rawBody, headers } = signedHubSpotWebhook('https://app.test/hooks?portal=a:b@c', events, 'client-secret');
    expect(() => verifyHubSpotSignature(rawBody, headers, 'client-secret', { method: 'POST', url: 'https://app.test/hooks?portal=a%3Ab%40c' })).not.toThrow();
  });

  it("dedupes HubSpot's retry of a batch, though its attempt number and timestamp changed", () => {
    const first = [hubspotEvent({ eventId: 1 }), hubspotEvent({ eventId: 2 })];
    const retry = first.map((e) => ({ ...e, attemptNumber: 1 })).reverse();
    const url = 'https://app.test/hooks';
    const a = signedHubSpotWebhook(url, first, 'client-secret');
    const b = signedHubSpotWebhook(url, retry, 'client-secret', { timestampMs: Date.now() + 1000 });
    const key = (s: typeof a) => verifyHubSpotSignature(s.rawBody, s.headers, 'client-secret', { method: 'POST', url }).eventId;
    expect(key(a)).toBe(key(b));
    expect(hubspotEventKey(first[0]!)).toBe(hubspotEventKey(retry[1]!));
  });

  it('reads the batch event type for the span', () => {
    expect(hubspotEventType([hubspotEvent(), hubspotEvent()])).toBe('contact.creation');
    expect(hubspotEventType([hubspotEvent(), hubspotEvent({ subscriptionType: 'deal.propertyChange' })])).toBe('mixed');
    expect(hubspotEventType({})).toBeUndefined();
  });

  class HubSpotWebhooks extends WebhookController {
    readonly prefix = 'hubspot';
    readonly auth = hubspotWebhookAuth('client-secret', { publicBaseUrl: 'https://app.example.com/' });
    init() {
      this.post('events', { mode: 'direct', procedure: 'crm.fromHubSpot', eventType: hubspotEventType }, async (_ctx, body) => HubSpotWebhookBody.parse(body));
    }
  }

  it('receives a signed delivery through WebhookServer at its public URL, once, and refuses forged and stale ones', async () => {
    const received: unknown[] = [];
    const tracer = new TestTracer();
    const communication = { call: async (_ctx: unknown, _name: string, input: unknown) => { received.push(input); return { ok: true }; } } as never;
    const server = new WebhookServer({ name: 'webhooks', logger }, { communication, tracer, idempotency: new InMemoryIdempotencyStore() }).registerController(new HubSpotWebhooks());
    const post = (s: { rawBody: string; headers: Record<string, string> }) => server.inject({ method: 'POST', url: '/hubspot/events', headers: { 'content-type': 'application/json', ...s.headers }, payload: s.rawBody });
    const events = [hubspotEvent({ subscriptionType: 'deal.propertyChange', propertyName: 'dealstage', propertyValue: 'closedwon', objectId: 9 })];
    const url = 'https://app.example.com/hubspot/events';

    expect((await post(signedHubSpotWebhook(url, events, 'client-secret'))).statusCode).toBe(200);
    const body = received[0] as ReturnType<typeof HubSpotWebhookBody.parse>;
    expect([body[0]!.objectId, body[0]!.propertyValue]).toEqual([9, 'closedwon']);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['mariachi.integration.event']])).toEqual([['hubspot webhook', 'server', 'deal.propertyChange']]);

    // HubSpot's retry of the same batch is a duplicate
    expect((await post(signedHubSpotWebhook(url, events.map((e) => ({ ...e, attemptNumber: 1 })), 'client-secret'))).json()).toMatchObject({ duplicate: true });
    // Forged, stale, or signed for another URL
    expect((await post(signedHubSpotWebhook(url, [hubspotEvent()], 'someone-else'))).statusCode).toBe(401);
    expect((await post(signedHubSpotWebhook(url, [hubspotEvent()], 'client-secret', { timestampMs: Date.now() - 6 * 60_000 }))).statusCode).toBe(401);
    expect((await post(signedHubSpotWebhook('https://elsewhere.example.com/hubspot/events', [hubspotEvent()], 'client-secret'))).statusCode).toBe(401);
    expect(received).toHaveLength(1);
  });
});

describe('the fake', () => {
  it('stands in for the client in an app’s tests', async () => {
    const hubspot = fakeHubSpot();
    const first = await hubspot.upsertContactByEmail(ctx, { email: 'ada@example.com', firstName: 'Ada' });
    const again = await hubspot.upsertContactByEmail(ctx, { email: 'ADA@example.com', lastName: 'Lovelace' });
    expect([first.created, again.created, again.id]).toEqual([true, false, first.id]);
    expect(hubspot.records_.contacts.get(first.id)?.properties).toMatchObject({ firstname: 'Ada', lastname: 'Lovelace' });
    const deal = await hubspot.createDeal(ctx, { name: 'Renewal', amount: 10, contactId: first.id });
    expect(hubspot.records_.deals.get(deal.id)?.properties).toMatchObject({ dealstage: 'appointmentscheduled', amount: '10' });
    await hubspot.addNote(ctx, { body: 'Called', dealId: deal.id });
    expect((await hubspot.associations.list(ctx, { from: { type: 'contact', id: first.id }, toType: 'deal' })).results.map((a) => a.toObjectId)).toEqual([deal.id]);
    await expect(hubspot.contacts.create(ctx, { properties: { email: 'ada@example.com' } })).rejects.toMatchObject({ code: 'conflict' });
    await expect(hubspot.deals.get(ctx, { id: 'nope' })).rejects.toMatchObject({ code: 'not-found' });
  });
});
