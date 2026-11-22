import { InMemoryIdempotencyStore, createContext } from '@mariachi/core';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { describe, expect, it } from 'vitest';
import { CAL_API_VERSIONS } from './api-versions';
import { attendeeEmails } from './bookings';
import { createCalCom } from './client';
import { CalComError } from './errors';
import { operations, settings } from './generated';
import { bookingPageUrl, calLink } from './links';
import { slotList } from './slots';
import { calComBooking, calComBookingEvent, calComEventType, fakeCalCom, signedCalComWebhook } from './testing';
import { CalComWebhookBody, calComEventType as eventTypeOf, calComWebhookAuth, webhookBooking } from './webhooks';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger });
const config = { apiKey: 'cal_live_test', webhookSecret: 'whsec-test' };
const noWait = { sleep: async () => {} };
const ok = (data: unknown) => ({ json: { status: 'success', data } });

describe('the client', () => {
  it('reads the key’s user with the API key and no version header, one span per call, and nothing sensitive on it', async () => {
    const fetch = scriptedFetch(ok({ id: 1, username: 'alice', email: 'alice@example.com', name: 'Alice', timeZone: 'Europe/Rome' }));
    const tracer = new TestTracer();
    const me = await createCalCom(config, { fetch, tracer }).me.get(ctx);
    expect(me.username).toBe('alice');
    const [req] = fetch.requests;
    expect(req!.url.href).toBe('https://api.cal.com/v2/me');
    expect(req!.headers.authorization).toBe('Bearer cal_live_test');
    expect(req!.headers['cal-api-version']).toBeUndefined();
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([['cal-com me.get', 'client', 'api.cal.com']]);
    assertProviderSpans(tracer.spans);
  });

  it('sends each endpoint family the cal-api-version it asks for', async () => {
    const booking = calComBooking({ uid: 'b1' });
    const fetch = scriptedFetch(
      ok([calComEventType()]),
      ok(calComEventType()),
      ok({}),
      ok(booking),
      ok(booking),
      { json: { status: 'success', data: [], pagination: { nextCursor: null, hasMore: false } } },
      ok(booking),
      ok(booking),
      ok(booking),
      ok(booking),
      ok([]),
    );
    const tracer = new TestTracer();
    const calcom = createCalCom(config, { fetch, tracer });
    await calcom.eventTypes.list(ctx);
    await calcom.eventTypes.get(ctx, 10);
    await calcom.slots.list(ctx, { eventTypeId: 10, start: '2026-12-01', end: '2026-12-02' });
    await calcom.bookings.create(ctx, { eventTypeId: 10, start: '2026-12-01T09:00:00Z', attendee: { name: 'Ada', email: 'ada@example.com', timeZone: 'Europe/London' } });
    await calcom.bookings.get(ctx, 'b1');
    await calcom.bookings.list(ctx);
    await calcom.bookings.cancel(ctx, { bookingUid: 'b1' });
    await calcom.bookings.reschedule(ctx, { bookingUid: 'b1', start: '2026-12-02T09:00:00Z' });
    await calcom.bookings.confirm(ctx, 'b1');
    await calcom.bookings.decline(ctx, { bookingUid: 'b1' });
    await calcom.webhooks.list(ctx);
    const sent = tracer.spans.map((s, i) => [s.attributes['mariachi.integration.operation'], fetch.requests[i]!.headers['cal-api-version']]);
    expect(Object.fromEntries(sent)).toEqual({
      'eventTypes.list': '2026-06-12',
      'eventTypes.get': '2026-06-12',
      'slots.list': '2024-09-04',
      'bookings.create': '2026-02-25',
      'bookings.get': '2026-02-25',
      'bookings.list': '2026-05-01',
      'bookings.cancel': '2026-02-25',
      'bookings.reschedule': '2026-02-25',
      'bookings.confirm': '2026-02-25',
      'bookings.decline': '2026-02-25',
      'webhooks.list': undefined,
    });
    expect(Object.keys(CAL_API_VERSIONS).every((op) => op in operations)).toBe(true);
    assertProviderSpans(tracer.spans);
  });

  it('asks for slots as ranges, in the time zone, and a moment in UTC', async () => {
    const fetch = scriptedFetch(ok({ '2026-12-01': [{ start: '2026-12-01T10:00:00.000+01:00', end: '2026-12-01T10:30:00.000+01:00' }] }));
    const byDate = await createCalCom(config, { fetch }).slots.list(ctx, { eventTypeSlug: 'intro', username: 'alice', start: '2026-12-01T08:00:00+01:00', end: '2026-12-07', timeZone: 'Europe/Rome' });
    expect(Object.fromEntries(fetch.requests[0]!.url.searchParams)).toEqual({ eventTypeSlug: 'intro', username: 'alice', start: '2026-12-01T07:00:00.000Z', end: '2026-12-07', timeZone: 'Europe/Rome', format: 'range' });
    expect(slotList(byDate)).toEqual([{ start: '2026-12-01T09:00:00.000Z', end: '2026-12-01T09:30:00.000Z' }]);
  });

  it('books in UTC with the attendee and metadata, and never retries a booking after an outage', async () => {
    const fetch = scriptedFetch({ status: 503 });
    const err = await createCalCom(config, { fetch, ...noWait })
      .bookings.create(ctx, { eventTypeId: 10, start: '2026-12-01T11:00:00+02:00', attendee: { name: 'Ada', email: 'ada@example.com', timeZone: 'Europe/London' }, metadata: { appUser: 'ref_123' } })
      .catch((e) => e);
    expect([err.code, err.category, fetch.requests.length]).toEqual(['cal-com/unavailable', 'unavailable', 1]);
    expect(fetch.requests[0]!.json).toEqual({ eventTypeId: 10, start: '2026-12-01T09:00:00.000Z', attendee: { name: 'Ada', email: 'ada@example.com', timeZone: 'Europe/London' }, metadata: { appUser: 'ref_123' } });
  });

  it('retries a booking Cal.com rate-limited, since it did nothing', async () => {
    const fetch = scriptedFetch({ status: 429, headers: { 'retry-after': '0' } }, { status: 201, ...ok(calComBooking({ uid: 'b1' })) });
    const booking = await createCalCom(config, { fetch, ...noWait }).bookings.create(ctx, { eventTypeId: 10, start: '2026-12-01T09:00:00Z', attendee: { name: 'Ada', timeZone: 'UTC' } });
    expect([Array.isArray(booking) ? undefined : booking.uid, fetch.requests.length]).toEqual(['b1', 2]);
  });

  it('pages through bookings by cursor, with the filters', async () => {
    const page = (uids: string[], nextCursor: string | null) => ({ json: { status: 'success', data: uids.map((uid) => calComBooking({ uid })), pagination: { nextCursor, hasMore: nextCursor !== null } } });
    const fetch = scriptedFetch(page(['a', 'b'], 'c1'), page(['c'], null));
    const seen: string[] = [];
    for await (const b of createCalCom(config, { fetch }).bookings.all(ctx, { status: 'upcoming', attendeeEmail: 'ada@example.com', afterUpdatedAt: '2026-11-20T00:00:00+01:00' })) seen.push(b.uid);
    expect(seen).toEqual(['a', 'b', 'c']);
    expect(Object.fromEntries(fetch.requests[0]!.url.searchParams)).toEqual({ status: 'upcoming', attendeeEmail: 'ada@example.com', afterUpdatedAt: '2026-11-19T23:00:00.000Z', limit: '100' });
    expect(fetch.requests[1]!.url.searchParams.get('cursor')).toBe('c1');
  });

  it('cancels a booking or one seat, and reschedules with the reason', async () => {
    const fetch = scriptedFetch(ok(calComBooking()), ok(calComBooking()), ok(calComBooking()));
    const calcom = createCalCom(config, { fetch });
    await calcom.bookings.cancel(ctx, { bookingUid: 'b/1', cancellationReason: 'Travel' });
    await calcom.bookings.cancel(ctx, { bookingUid: 'b1', seatUid: 's1' });
    await calcom.bookings.reschedule(ctx, { bookingUid: 'b1', start: new Date('2026-12-02T09:00:00Z'), reschedulingReason: 'Clash' });
    expect(fetch.requests.map((r) => [r.method, r.url.pathname, r.json])).toEqual([
      ['POST', '/v2/bookings/b%2F1/cancel', { cancellationReason: 'Travel' }],
      ['POST', '/v2/bookings/b1/cancel', { seatUid: 's1' }],
      ['POST', '/v2/bookings/b1/reschedule', { start: '2026-12-02T09:00:00.000Z', reschedulingReason: 'Clash' }],
    ]);
  });

  it('calls a self-hosted instance when its address is set', async () => {
    const fetch = scriptedFetch(ok(calComEventType()));
    const tracer = new TestTracer();
    await createCalCom({ ...config, apiBaseUrl: 'https://cal.example.com/api/v2/' }, { fetch, tracer }).eventTypes.get(ctx, 10);
    expect(fetch.requests[0]!.url.href).toBe('https://cal.example.com/api/v2/event-types/10');
    expect(tracer.spans[0]!.attributes['server.address']).toBe('cal.example.com');
  });

  it('fails as a CalComError by status, never keeping Cal.com’s message', async () => {
    const fetch = scriptedFetch({ status: 404, json: { status: 'error', error: { message: 'Booking ada@example.com not found' } } });
    const err = await createCalCom(config, { fetch }).bookings.get(ctx, 'gone').catch((e) => e);
    expect(err).toBeInstanceOf(CalComError);
    expect([err.code, err.category, err.status]).toEqual(['cal-com/not-found', 'not-found', 404]);
    expect(err.message).not.toContain('ada@');
  });

  it('fails at the boundary when Cal.com answers in another shape', async () => {
    const changed = ok({ id: 'not-a-number' });
    const fetch = scriptedFetch(changed, changed, changed);
    await expect(createCalCom(config, { fetch, ...noWait }).eventTypes.get(ctx, 10)).rejects.toMatchObject({ code: 'cal-com/invalid-response' });
  });

  it('checks its input before calling', async () => {
    const calcom = createCalCom(config, { fetch: scriptedFetch() });
    const attendee = { name: 'Ada', timeZone: 'UTC' };
    await expect(calcom.bookings.create(ctx, { eventTypeSlug: 'intro', start: '2026-12-01T09:00:00Z', attendee })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(calcom.bookings.create(ctx, { eventTypeId: 10, start: '2026-12-01 09:00', attendee })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(calcom.bookings.create(ctx, { eventTypeId: 10, start: '2026-12-01T09:00:00Z', attendee: { name: 'Ada', timeZone: 'Mars/Olympus' } })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(calcom.bookings.create(ctx, { eventTypeId: 10, start: '2026-12-01T09:00:00Z', attendee, metadata: { ['k'.repeat(41)]: 'v' } })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(calcom.slots.list(ctx, { eventTypeId: 10, start: 'tomorrow', end: '2026-12-02' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });

  it('makes a webhook with the secret, and refuses to without one', async () => {
    const hook = { id: 7, subscriberUrl: 'https://app.test/webhooks/cal-com/events', triggers: ['BOOKING_CREATED'], active: true, version: '2021-10-20', payloadTemplate: null, secret: 'whsec-test', userId: 1 };
    const fetch = scriptedFetch({ status: 201, ...ok(hook) }, ok(hook));
    const calcom = createCalCom(config, { fetch });
    const made = await calcom.webhooks.create(ctx, { subscriberUrl: hook.subscriberUrl, triggers: ['BOOKING_CREATED', 'BOOKING_CANCELLED'] });
    expect(fetch.requests[0]!.json).toEqual({ subscriberUrl: hook.subscriberUrl, triggers: ['BOOKING_CREATED', 'BOOKING_CANCELLED'], active: true, secret: 'whsec-test' });
    expect(made).not.toHaveProperty('secret');
    await calcom.webhooks.delete(ctx, 7);
    expect([fetch.requests[1]!.method, fetch.requests[1]!.url.pathname]).toEqual(['DELETE', '/v2/webhooks/7']);
    await expect(createCalCom({ apiKey: 'cal_x' }).webhooks.create(ctx, { subscriberUrl: hook.subscriberUrl, triggers: ['BOOKING_CREATED'] })).rejects.toMatchObject({ code: 'cal-com/no-webhook-secret' });
  });
});

describe('settings', () => {
  it('reads from the environment by name, says where to find each, and checks no key prefix', () => {
    expect(settingsFromEnv(settings, (n) => ({ CALCOM_API_KEY: 'cal_1', CALCOM_API_BASE_URL: 'https://cal.example.com/api/v2' })[n])).toEqual({ apiKey: 'cal_1', apiBaseUrl: 'https://cal.example.com/api/v2' });
    expect(settings.every((s) => s.whereToFind)).toBe(true);
    expect(checkSetting(settings[0]!, 'production', 'cal_1')).toBeNull();
    expect(checkSetting(settings[0]!, 'test', 'cal_live_1')).toBeNull();
  });
});

describe('slotList', () => {
  it('makes the slots one list in UTC, earliest first, each once, across dates and offsets', () => {
    expect(
      slotList({
        '2026-10-26': [{ start: '2026-10-26T09:00:00.000+01:00', end: '2026-10-26T09:30:00.000+01:00' }],
        '2026-10-25': [
          { start: '2026-10-25T09:00:00.000+01:00', end: '2026-10-25T09:30:00.000+01:00' },
          { start: '2026-10-25T08:00:00.000Z', end: '2026-10-25T08:30:00.000Z' },
        ],
      }),
    ).toEqual([
      { start: '2026-10-25T08:00:00.000Z', end: '2026-10-25T08:30:00.000Z' },
      { start: '2026-10-26T08:00:00.000Z', end: '2026-10-26T08:30:00.000Z' },
    ]);
  });

  it('takes the length for slots without an end, and says so when there is none', () => {
    expect(slotList({ '2026-12-01': [{ start: '2026-12-01T09:00:00Z' }] }, { durationMinutes: 45 })).toEqual([{ start: '2026-12-01T09:00:00.000Z', end: '2026-12-01T09:45:00.000Z' }]);
    expect(() => slotList({ '2026-12-01': [{ start: '2026-12-01T09:00:00Z' }] })).toThrow(/durationMinutes/);
  });
});

describe('booking links', () => {
  it('builds the Cal link and the booking page, with answers to prefill', () => {
    expect(calLink('alice', 'intro')).toBe('alice/intro');
    expect(calLink('alice')).toBe('alice');
    expect(bookingPageUrl({ username: 'alice', eventSlug: 'intro', prefill: { name: 'Ada Lovelace', email: 'ada@example.com', guests: ['a@x.co', 'b@x.co'] } })).toBe(
      'https://cal.com/alice/intro?name=Ada+Lovelace&email=ada%40example.com&guests=a%40x.co&guests=b%40x.co',
    );
    expect(bookingPageUrl({ username: 'alice', eventSlug: 'intro', origin: 'https://cal.example.com' })).toBe('https://cal.example.com/alice/intro');
    expect(() => calLink(' ')).toThrow();
  });
});

describe('attendeeEmails', () => {
  it('lowercases, trims and dedupes, skipping attendees without one', () => {
    expect(attendeeEmails({ attendees: [{ email: ' Ada@Example.com ' }, { email: 'ada@example.com' }, { email: '' }, { email: 'b@x.co' }] })).toEqual(['ada@example.com', 'b@x.co']);
  });
});

describe('webhooks', () => {
  const booking = calComBooking({ uid: 'b1', metadata: { appUser: 'ref_123' }, attendees: [{ name: 'Ada', email: 'Ada@Example.com', timeZone: 'UTC' }] });

  class CalComWebhooks extends WebhookController {
    readonly prefix = 'cal-com';
    readonly auth = calComWebhookAuth('whsec-test');
    init() {
      this.post('events', { mode: 'direct', procedure: 'bookings.fromCalCom', eventType: eventTypeOf }, async (_ctx, body) => CalComWebhookBody.parse(body));
    }
  }

  function server() {
    const received: unknown[] = [];
    const tracer = new TestTracer();
    const communication = { call: async (_ctx: unknown, _name: string, input: unknown) => { received.push(input); return { ok: true }; } } as never;
    const s = new WebhookServer({ name: 'webhooks', logger }, { communication, tracer, idempotency: new InMemoryIdempotencyStore() }).registerController(new CalComWebhooks());
    const post = (d: { rawBody: string; headers: Record<string, string> }) => s.inject({ method: 'POST', url: '/cal-com/events', headers: { 'content-type': 'application/json', ...d.headers }, payload: d.rawBody });
    return { received, tracer, post };
  }

  it('receives a signed delivery through WebhookServer, with its span, once, and reads its booking', async () => {
    const { received, tracer, post } = server();
    const delivery = signedCalComWebhook(calComBookingEvent('BOOKING_CREATED', booking), 'whsec-test');
    expect((await post(delivery)).statusCode).toBe(200);
    expect((await post(delivery)).statusCode).toBe(200);
    expect(received).toHaveLength(1);
    const b = webhookBooking(received[0] as CalComWebhookBody);
    expect([b?.triggerEvent, b?.uid, b?.status, b?.metadata.appUser, b && attendeeEmails(b)]).toEqual(['BOOKING_CREATED', 'b1', 'ACCEPTED', 'ref_123', ['ada@example.com']]);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['mariachi.integration.event']])[0]).toEqual(['cal-com webhook', 'server', 'BOOKING_CREATED']);
  });

  it('refuses a forged delivery, a changed body, and one from a webhook without a secret', async () => {
    const { received, post } = server();
    const delivery = signedCalComWebhook(calComBookingEvent('BOOKING_CANCELLED', booking), 'whsec-test');
    expect((await post(signedCalComWebhook(calComBookingEvent('BOOKING_CANCELLED', booking), 'someone-else'))).statusCode).toBe(401);
    expect((await post({ rawBody: `${delivery.rawBody} `, headers: delivery.headers })).statusCode).toBe(401);
    expect((await post({ rawBody: delivery.rawBody, headers: { 'x-cal-signature-256': 'no-secret-provided' } })).statusCode).toBe(401);
    expect(received).toHaveLength(0);
  });

  it('reads the booking from flat meeting events and rescheduled ones, and nothing from others', () => {
    const ended = webhookBooking(CalComWebhookBody.parse(calComBookingEvent('MEETING_ENDED', booking)));
    expect([ended?.uid, ended?.bookingId, ended?.organizer?.username, ended?.endTime]).toEqual(['b1', 1, 'host', booking.end]);
    const moved = webhookBooking(CalComWebhookBody.parse(calComBookingEvent('BOOKING_RESCHEDULED', { ...booking, uid: 'b2' }, { rescheduleUid: 'b1' })));
    expect([moved?.uid, moved?.rescheduleUid]).toEqual(['b2', 'b1']);
    expect(webhookBooking({ triggerEvent: 'BOOKING_NO_SHOW_UPDATED', payload: { bookingUid: 'b1', attendees: [{ email: 'a@x.co', noShow: true }] } })).toBeUndefined();
    expect(eventTypeOf({ triggerEvent: 'MEETING_ENDED' })).toBe('MEETING_ENDED');
  });
});

describe('the fake', () => {
  it('stands in for the client in an app’s tests', async () => {
    const intro = calComEventType({ id: 10, slug: 'intro', lengthInMinutes: 30 });
    const fake = fakeCalCom({ eventTypes: [intro], slots: { 10: { '2026-12-01': [{ start: '2026-12-01T09:00:00Z', end: '2026-12-01T09:30:00Z' }] } } });
    const [slot] = slotList(await fake.slots.list(ctx, { eventTypeId: 10, start: '2026-12-01', end: '2026-12-01' }));
    const made = await fake.bookings.create(ctx, { eventTypeId: 10, start: slot!.start, attendee: { name: 'Ada', email: 'ada@example.com', timeZone: 'UTC' }, metadata: { appUser: 'ref_1' } });
    if (Array.isArray(made)) throw new Error('expected one booking');
    expect([made.status, made.end, made.metadata.appUser]).toEqual(['accepted', '2026-12-01T09:30:00.000Z', 'ref_1']);
    await expect(fake.bookings.create(ctx, { eventTypeId: 10, start: slot!.start, attendee: { name: 'Bo', timeZone: 'UTC' } })).rejects.toMatchObject({ code: 'cal-com/invalid-request' });
    const moved = await fake.bookings.reschedule(ctx, { bookingUid: made.uid, start: '2026-12-02T09:00:00Z' });
    if (Array.isArray(moved)) throw new Error('expected one booking');
    expect([moved.rescheduledFromUid, fake.bookings_.get(made.uid)?.status]).toEqual([made.uid, 'cancelled']);
    expect((await fake.bookings.list(ctx, { attendeeEmail: 'ADA@example.com' })).items).toHaveLength(2);
    await expect(fake.bookings.get(ctx, 'nope')).rejects.toBeInstanceOf(CalComError);
  });
});
