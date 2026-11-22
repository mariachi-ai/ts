import { InMemoryIdempotencyStore, createContext } from '@mariachi/core';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { describe, expect, it } from 'vitest';
import { createCalendly } from './client';
import { CalendlyError } from './errors';
import { settings } from './generated';
import { testEventType, testInvitee, testInviteeEvent, testScheduledEvent, testUser, fakeCalendly, signedCalendlyWebhook } from './testing';
import { answersByQuestion, emailKey, inviteeUuids, uuidFromUri } from './uris';
import { CalendlyWebhookBody, calendlyEventKey, calendlyEventType, calendlyWebhookAuth, isInviteeEvent } from './webhooks';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger });
const config = { accessToken: 'pat-test', webhookSigningKey: 'signing-key-test' };
const noWait = { sleep: async () => {} };
const API = 'https://api.calendly.com';
const ORG = `${API}/organizations/ORG1`;
const USER = `${API}/users/USER1`;
const page = (collection: unknown[], next: string | null = null) => ({ json: { collection, pagination: { count: collection.length, next_page_token: next, next_page: null, previous_page: null, previous_page_token: null } } });

describe('the client', () => {
  it('reads the token’s user and lists its events with the token and filters, one span per call, nothing sensitive on it', async () => {
    const me = testUser({ uri: USER, current_organization: ORG });
    const fetch = scriptedFetch({ json: { resource: me } }, page([testScheduledEvent()]));
    const tracer = new TestTracer();
    const calendly = createCalendly(config, { fetch, tracer });
    const user = await calendly.users.me(ctx);
    const events = await calendly.scheduledEvents.list(ctx, { user: user.uri, organization: user.current_organization, status: 'active', minStartTime: '2026-11-01T00:00:00Z', inviteeEmail: 'a@b.co' });
    expect(events.collection).toHaveLength(1);
    const [, req] = fetch.requests;
    expect(fetch.requests[0]!.url.href).toBe(`${API}/users/me`);
    expect(req!.url.pathname).toBe('/scheduled_events');
    expect(Object.fromEntries(req!.url.searchParams)).toEqual({ user: USER, organization: ORG, status: 'active', min_start_time: '2026-11-01T00:00:00Z', invitee_email: 'a@b.co' });
    expect(req!.headers.authorization).toBe('Bearer pat-test');
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([
      ['calendly users.me', 'client', 'api.calendly.com'],
      ['calendly scheduledEvents.list', 'client', 'api.calendly.com'],
    ]);
    assertProviderSpans(tracer.spans);
  });

  it('pages through every event by next_page_token', async () => {
    const fetch = scriptedFetch(page([testScheduledEvent(), testScheduledEvent()], 'tok2'), page([testScheduledEvent()]));
    const tracer = new TestTracer();
    let n = 0;
    for await (const _ of createCalendly(config, { fetch, tracer }).scheduledEvents.all(ctx, { organization: ORG })) n += 1;
    expect(n).toBe(3);
    expect(fetch.requests.map((r) => [r.url.searchParams.get('page_token'), r.url.searchParams.get('count')])).toEqual([[null, '100'], ['tok2', '100']]);
    assertProviderSpans(tracer.spans);
  });

  it('takes resources by URI: an invitee from a webhook or the embed, a cancellation by event URI', async () => {
    const event = testScheduledEvent({ uri: `${API}/scheduled_events/EV1` });
    const invitee = testInvitee({ uri: `${API}/scheduled_events/EV1/invitees/IN1` }, event);
    const fetch = scriptedFetch({ json: { resource: invitee } }, { status: 201, json: { resource: { canceled_by: 'Ada', reason: 'Ill', canceler_type: 'host', created_at: '2026-11-21T10:00:00Z' } } });
    const tracer = new TestTracer();
    const calendly = createCalendly(config, { fetch, tracer });
    // The embed's calendly.event_scheduled message names the invitee under /api/v2
    await calendly.invitees.get(ctx, `${API}/api/v2/scheduled_events/EV1/invitees/IN1`);
    await calendly.scheduledEvents.cancel(ctx, { event: event.uri, reason: 'Ill' });
    expect(fetch.requests.map((r) => [r.method, r.url.pathname, r.json])).toEqual([
      ['GET', '/scheduled_events/EV1/invitees/IN1', undefined],
      ['POST', '/scheduled_events/EV1/cancellation', { reason: 'Ill' }],
    ]);
    assertProviderSpans(tracer.spans);
  });

  it('books an invitee in Calendly’s shape, and never retries the booking after an outage', async () => {
    const booked = testInvitee({ scheduling_method: 'api' });
    const fetch = scriptedFetch({ status: 201, json: { resource: booked } }, { status: 503 });
    const tracer = new TestTracer();
    const calendly = createCalendly(config, { fetch, tracer, ...noWait });
    const input = {
      eventType: `${API}/event_types/ET1`,
      startTime: '2026-11-25T15:00:00Z',
      invitee: { name: 'Grace', email: 'grace@example.com', timezone: 'America/New_York' },
      location: { kind: 'zoom_conference' },
      tracking: { utmContent: 'user_42' },
      eventGuests: ['alex@example.com'],
    };
    expect((await calendly.invitees.create(ctx, input)).scheduling_method).toBe('api');
    expect(fetch.requests[0]!.json).toEqual({
      event_type: `${API}/event_types/ET1`,
      start_time: '2026-11-25T15:00:00Z',
      invitee: { name: 'Grace', email: 'grace@example.com', timezone: 'America/New_York' },
      location: { kind: 'zoom_conference' },
      tracking: { utm_content: 'user_42' },
      event_guests: ['alex@example.com'],
    });
    await expect(calendly.invitees.create(ctx, input)).rejects.toMatchObject({ code: 'calendly/unavailable' });
    expect(fetch.requests).toHaveLength(2);
    assertProviderSpans(tracer.spans);
  });

  it('marks and unmarks a no-show, and makes a single-use link', async () => {
    const inviteeUri = `${API}/scheduled_events/EV1/invitees/IN1`;
    const fetch = scriptedFetch(
      { status: 201, json: { resource: { uri: `${API}/invitee_no_shows/NS1`, invitee: inviteeUri, created_at: '2026-11-21T10:00:00Z' } } },
      { status: 204 },
      { status: 201, json: { resource: { booking_url: 'https://calendly.com/d/abc', owner: `${API}/event_types/ET1`, owner_type: 'EventType' } } },
    );
    const calendly = createCalendly(config, { fetch });
    const noShow = await calendly.noShows.create(ctx, inviteeUri);
    await calendly.noShows.delete(ctx, noShow.uri);
    const link = await calendly.schedulingLinks.create(ctx, `${API}/event_types/ET1`);
    expect(link.booking_url).toBe('https://calendly.com/d/abc');
    expect(fetch.requests.map((r) => [r.method, r.url.pathname, r.json])).toEqual([
      ['POST', '/invitee_no_shows', { invitee: inviteeUri }],
      ['DELETE', '/invitee_no_shows/NS1', undefined],
      ['POST', '/scheduling_links', { max_event_count: 1, owner: `${API}/event_types/ET1`, owner_type: 'EventType' }],
    ]);
  });

  it('subscribes a webhook with the signing key, refuses to without one, and names a second subscription for the URL', async () => {
    const sub = { uri: `${API}/webhook_subscriptions/WH1`, callback_url: 'https://app.test/hooks', created_at: 'x', updated_at: 'x', retry_started_at: null, state: 'active', events: ['invitee.created'], scope: 'organization', organization: ORG, user: null, group: null, creator: null };
    const fetch = scriptedFetch({ status: 201, json: { resource: sub } }, { status: 409, json: { title: 'Already Exists', message: 'Hook with this url already exists' } });
    const calendly = createCalendly(config, { fetch });
    const input = { url: 'https://app.test/hooks', events: ['invitee.created' as const, 'invitee.canceled' as const], scope: 'organization' as const, organization: ORG };
    await calendly.webhookSubscriptions.create(ctx, input);
    expect(fetch.requests[0]!.json).toEqual({ url: 'https://app.test/hooks', events: ['invitee.created', 'invitee.canceled'], scope: 'organization', organization: ORG, signing_key: 'signing-key-test' });
    const err = await calendly.webhookSubscriptions.create(ctx, input).catch((e) => e);
    expect([err.code, err.category, err.providerCode]).toEqual(['calendly/already-exists', 'conflict', 'Already Exists']);
    await expect(createCalendly({ accessToken: 'x' }).webhookSubscriptions.create(ctx, input)).rejects.toMatchObject({ code: 'calendly/no-webhook-signing-key' });
    await expect(calendly.webhookSubscriptions.create(ctx, { ...input, scope: 'user' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });

  it("fails as a CalendlyError with Calendly's title, retrying only rate limits, and without its message", async () => {
    const fetch = scriptedFetch(
      { status: 429, headers: { 'retry-after': '0' } },
      { status: 403, json: { title: 'Insufficient scope', message: "This operation requires the scopes listed in the 'required_scopes' array.", required_scopes: ['scheduled_events:write'] } },
    );
    const err = await createCalendly(config, { fetch, ...noWait }).scheduledEvents.cancel(ctx, { event: 'EV1' }).catch((e) => e);
    expect(err).toBeInstanceOf(CalendlyError);
    expect([err.code, err.category, err.providerCode, fetch.requests.length]).toEqual(['calendly/insufficient-scope', 'forbidden', 'Insufficient scope', 2]);
    expect(err.message).not.toContain('required_scopes');
  });

  it('checks its input before calling', async () => {
    const calendly = createCalendly(config, { fetch: scriptedFetch() });
    await expect(calendly.scheduledEvents.list(ctx, {})).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(calendly.eventTypes.list(ctx, { user: USER, count: 500 })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(calendly.invitees.get(ctx, `${API}/scheduled_events/EV1`)).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(calendly.scheduledEvents.get(ctx, 'not a uuid')).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(calendly.invitees.create(ctx, { eventType: `${API}/event_types/ET1`, startTime: '2026-11-25T15:00:00Z', invitee: { email: 'a@b.co', timezone: 'UTC' } })).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });
});

describe('settings', () => {
  it('reads from the environment by name, and says where to find each', () => {
    expect(settingsFromEnv(settings, (n) => ({ CALENDLY_ACCESS_TOKEN: 'pat_1' })[n])).toEqual({ accessToken: 'pat_1' });
    expect(settings.every((s) => s.whereToFind)).toBe(true);
    expect(checkSetting(settings[0]!, 'test', 'anything')).toBeNull();
  });
});

describe('helpers', () => {
  it('reads UUIDs out of URIs, answers by question, and an email key', () => {
    expect(uuidFromUri(`${API}/scheduled_events/ABC-123/`)).toBe('ABC-123');
    expect(uuidFromUri('ABC123')).toBe('ABC123');
    expect(() => uuidFromUri(`${API}/`)).toThrow();
    expect(inviteeUuids(`${API}/scheduled_events/EV1/invitees/IN1`)).toEqual({ eventUuid: 'EV1', inviteeUuid: 'IN1' });
    expect(answersByQuestion({ questions_and_answers: [{ question: 'Company', answer: 'Acme', position: 0 }] })).toEqual({ Company: 'Acme' });
    expect(emailKey('  Grace@Example.COM ')).toBe('grace@example.com');
  });
});

describe('webhooks', () => {
  const KEY = 'signing-key-test';
  class CalendlyWebhooks extends WebhookController {
    readonly prefix = 'calendly';
    readonly auth = calendlyWebhookAuth(KEY);
    init() {
      this.post('events', { mode: 'direct', procedure: 'bookings.fromCalendly', eventType: calendlyEventType }, async (_ctx, body) => CalendlyWebhookBody.parse(body));
    }
  }
  const setup = () => {
    const received: unknown[] = [];
    const tracer = new TestTracer();
    const communication = { call: async (_ctx: unknown, _name: string, input: unknown) => { received.push(input); return { ok: true }; } } as never;
    const server = new WebhookServer({ name: 'webhooks', logger }, { communication, tracer, idempotency: new InMemoryIdempotencyStore() }).registerController(new CalendlyWebhooks());
    const post = (signed: { rawBody: string; headers: Record<string, string> }) =>
      server.inject({ method: 'POST', url: '/calendly/events', headers: { 'content-type': 'application/json', ...signed.headers }, payload: signed.rawBody });
    return { received, tracer, post };
  };

  it('receives a signed delivery through WebhookServer, with its span, and reads the invitee', async () => {
    const { received, tracer, post } = setup();
    const invitee = testInvitee({ email: 'Grace@Example.com', tracking: { utm_content: 'user_42' } });
    const ok = await post(signedCalendlyWebhook(testInviteeEvent('invitee.created', invitee), KEY));
    expect(ok.statusCode).toBe(200);
    const body = received[0] as CalendlyWebhookBody;
    if (!isInviteeEvent(body)) throw new Error('expected an invitee event');
    expect([body.event, emailKey(body.payload.email), body.payload.tracking?.utm_content, body.payload.scheduled_event.uri]).toEqual(['invitee.created', 'grace@example.com', 'user_42', invitee.event]);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['mariachi.integration.event']])).toEqual([['calendly webhook', 'server', 'invitee.created']]);
    assertProviderSpans(tracer.spans);
  });

  it('refuses a forged, a tampered and a stale delivery', async () => {
    const { received, post } = setup();
    const body = testInviteeEvent('invitee.canceled');
    expect((await post(signedCalendlyWebhook(body, 'someone-else'))).statusCode).toBe(401);
    const signed = signedCalendlyWebhook(body, KEY);
    expect((await post({ ...signed, rawBody: `${signed.rawBody} ` })).statusCode).toBe(401);
    expect((await post(signedCalendlyWebhook(body, KEY, Math.floor(Date.now() / 1000) - 181))).statusCode).toBe(401);
    expect((await post({ rawBody: signed.rawBody, headers: {} })).statusCode).toBe(401);
    expect(received).toHaveLength(0);
  });

  it('handles a retried delivery once, though its signature is new', async () => {
    const { received, post } = setup();
    const body = testInviteeEvent('invitee.created');
    const now = Math.floor(Date.now() / 1000);
    expect((await post(signedCalendlyWebhook(body, KEY, now - 60))).statusCode).toBe(200);
    expect((await post(signedCalendlyWebhook(body, KEY, now))).json()).toMatchObject({ duplicate: true });
    // The same invitee canceled is another event
    expect((await post(signedCalendlyWebhook({ ...body, event: 'invitee.canceled' }, KEY, now))).json()).not.toMatchObject({ duplicate: true });
    expect(received).toHaveLength(2);
    expect(calendlyEventKey(body)).toMatch(/^calendly:[0-9a-f]{64}$/);
    expect(calendlyEventKey({ event: 'x' })).toBeUndefined();
  });

  it('parses other events with their payload kept', () => {
    const body = CalendlyWebhookBody.parse({ event: 'invitee_no_show.created', created_at: 'x', created_by: USER, payload: { uri: `${API}/scheduled_events/EV1/invitees/IN1`, extra: 1 } });
    expect(isInviteeEvent(body)).toBe(false);
    expect(body.payload).toMatchObject({ extra: 1 });
    expect(() => CalendlyWebhookBody.parse({ event: 'invitee.created', created_at: 'x', created_by: USER, payload: { uri: 'x' } })).toThrow();
  });
});

describe('the fake', () => {
  it('stands in for the client in an app’s tests: books an open time, lists, cancels and refuses a duplicate subscription', async () => {
    const type = testEventType();
    const calendly = fakeCalendly({ eventTypes: [type], availableTimes: { [type.uri]: ['2026-11-25T15:00:00.000Z'] } });
    const [slot] = await calendly.eventTypes.availableTimes(ctx, { eventType: type.uri, startTime: '2026-11-25T00:00:00.000Z', endTime: '2026-11-26T00:00:00.000Z' });
    const invitee = await calendly.invitees.create(ctx, { eventType: type.uri, startTime: slot!.start_time, invitee: { name: 'Grace', email: 'grace@example.com', timezone: 'UTC' } });
    await expect(calendly.invitees.create(ctx, { eventType: type.uri, startTime: slot!.start_time, invitee: { name: 'Bo', email: 'bo@example.com', timezone: 'UTC' } })).rejects.toMatchObject({ code: 'calendly/invalid-request' });
    const events = await calendly.scheduledEvents.list(ctx, { organization: ORG, inviteeEmail: 'GRACE@example.com' });
    expect(events.collection.map((e) => e.uri)).toEqual([invitee.event]);
    await calendly.scheduledEvents.cancel(ctx, { event: invitee.event });
    expect((await calendly.invitees.get(ctx, invitee.uri)).status).toBe('canceled');
    await calendly.webhookSubscriptions.create(ctx, { url: 'https://app.test/h', events: ['invitee.created'], scope: 'organization', organization: ORG });
    await expect(calendly.webhookSubscriptions.create(ctx, { url: 'https://app.test/h', events: ['invitee.created'], scope: 'organization', organization: ORG })).rejects.toMatchObject({ code: 'calendly/already-exists' });
    await expect(calendly.scheduledEvents.get(ctx, 'NOPE')).rejects.toMatchObject({ code: 'calendly/not-found' });
  });
});
