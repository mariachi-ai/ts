import { createHash } from 'node:crypto';
import { createContext } from '@mariachi/core';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { describe, expect, it } from 'vitest';
import { createMailchimp } from './client';
import { MailchimpError } from './errors';
import { settings } from './generated';
import { serverPrefixOf, subscriberHash } from './hash';
import { fakeMailchimp, mailchimpMember, signedMailchimpWebhook } from './testing';
import { MailchimpWebhookBody, expandFormBody, mailchimpEventType, mailchimpWebhookAuth } from './webhooks';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger });
const config = { apiKey: '0123456789abcdef-us6', audienceId: 'aud123' };
const noWait = { sleep: async () => {} };
const ada = 'Ada@Example.com';
const hash = createHash('md5').update('ada@example.com').digest('hex');
const member = (status: string) => ({ json: { id: hash, email_address: 'ada@example.com', status, list_id: 'aud123' } });

describe('subscriberHash and the server prefix', () => {
  it('hashes the lowercased address, so one person is one contact', () => {
    expect(subscriberHash(ada)).toBe(hash);
    expect(subscriberHash(' ada@example.com ')).toBe(hash);
  });

  it("reads the data center from the key, takes an explicit one, and refuses a key that has none", async () => {
    expect(serverPrefixOf('abc-us21')).toBe('us21');
    expect(serverPrefixOf('abc')).toBeUndefined();
    const fetch = scriptedFetch(member('subscribed'));
    await createMailchimp({ ...config, serverPrefix: 'us1' }, { fetch }).members.get(ctx, ada);
    expect(fetch.requests[0]!.url.host).toBe('us1.api.mailchimp.com');
    expect(() => createMailchimp({ apiKey: 'nodash', audienceId: 'a' })).toThrow(expect.objectContaining({ code: 'mailchimp/no-server-prefix' }));
    expect(() => createMailchimp({ ...config, serverPrefix: 'evil.example.com/x' })).toThrow(expect.objectContaining({ code: 'mailchimp/no-server-prefix' }));
  });
});

describe('subscribe', () => {
  it('adds a new contact as pending (double opt-in), with names and tags, one span per call and nothing sensitive on them', async () => {
    const fetch = scriptedFetch(member('pending'), { status: 204 });
    const tracer = new TestTracer();
    const contact = await createMailchimp(config, { fetch, tracer }).subscribe(ctx, { email: ada, firstName: 'Ada', lastName: 'Lovelace', tags: ['signup-page'] });
    expect(contact.status).toBe('pending');
    const [put, tags] = fetch.requests;
    expect([put!.method, put!.url.href]).toEqual(['PUT', `https://us6.api.mailchimp.com/3.0/lists/aud123/members/${hash}`]);
    expect(put!.headers.authorization).toBe('Bearer 0123456789abcdef-us6');
    expect(put!.json).toEqual({ email_address: ada, status_if_new: 'pending', merge_fields: { FNAME: 'Ada', LNAME: 'Lovelace' } });
    expect([tags!.method, tags!.url.pathname, tags!.json]).toEqual(['POST', `/3.0/lists/aud123/members/${hash}/tags`, { tags: [{ name: 'signup-page', status: 'active' }] }]);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([
      ['mailchimp members.upsert', 'client', 'us6.api.mailchimp.com'],
      ['mailchimp members.updateTags', 'client', 'us6.api.mailchimp.com'],
    ]);
    assertProviderSpans(tracer.spans);
  });

  it("leaves a subscribed contact subscribed, and asks one who'd unsubscribed to confirm again", async () => {
    const kept = scriptedFetch(member('subscribed'));
    expect((await createMailchimp(config, { fetch: kept }).subscribe(ctx, { email: ada })).status).toBe('subscribed');
    expect(kept.requests).toHaveLength(1);

    const back = scriptedFetch(member('unsubscribed'), member('pending'));
    expect((await createMailchimp(config, { fetch: back }).subscribe(ctx, { email: ada })).status).toBe('pending');
    expect([back.requests[1]!.method, back.requests[1]!.json]).toEqual(['PATCH', { status: 'pending' }]);
  });

  it('subscribes at once only when double opt-in is turned off', async () => {
    const fetch = scriptedFetch(member('subscribed'));
    await createMailchimp(config, { fetch }).subscribe(ctx, { email: ada, doubleOptIn: false });
    expect((fetch.requests[0]!.json as { status_if_new: string }).status_if_new).toBe('subscribed');
  });

  it('checks its input before calling', async () => {
    await expect(createMailchimp(config, { fetch: scriptedFetch() }).subscribe(ctx, { email: 'not an address' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(createMailchimp(config, { fetch: scriptedFetch() }).members.updateTags(ctx, { email: ada })).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });
});

describe('members, merge fields and webhooks', () => {
  it('unsubscribes, archives and deletes permanently at their own paths', async () => {
    const fetch = scriptedFetch(member('unsubscribed'), { status: 204 }, { status: 204 });
    const mc = createMailchimp(config, { fetch });
    await mc.members.unsubscribe(ctx, ada);
    await mc.members.archive(ctx, ada);
    await mc.members.deletePermanently(ctx, ada);
    expect(fetch.requests.map((r) => [r.method, r.url.pathname, r.json])).toEqual([
      ['PATCH', `/3.0/lists/aud123/members/${hash}`, { status: 'unsubscribed' }],
      ['DELETE', `/3.0/lists/aud123/members/${hash}`, undefined],
      ['POST', `/3.0/lists/aud123/members/${hash}/actions/delete-permanent`, undefined],
    ]);
  });

  it('updates merge fields, batches contacts and lists merge fields', async () => {
    const fetch = scriptedFetch(
      member('subscribed'),
      { json: { new_members: [{ email_address: 'b@example.com', status: 'pending' }], updated_members: [], errors: [{ email_address: 'c@example.com', error_code: 'ERROR_CONTACT_EXISTS' }], total_created: 1, total_updated: 0, error_count: 1 } },
      { json: { merge_fields: [{ merge_id: 1, tag: 'FNAME', name: 'First Name', type: 'text', required: false }], total_items: 1 } },
    );
    const mc = createMailchimp(config, { fetch });
    await mc.members.update(ctx, { email: ada, mergeFields: { PLAN: 'team' }, skipMergeValidation: true });
    const batch = await mc.members.batch(ctx, { members: [{ email: 'b@example.com', status: 'pending' }, { email: 'c@example.com', status: 'pending' }] });
    const fields = await mc.mergeFields.list(ctx, { count: 100 });
    expect([fetch.requests[0]!.url.search, fetch.requests[0]!.json]).toEqual(['?skip_merge_validation=true', { merge_fields: { PLAN: 'team' } }]);
    expect([fetch.requests[1]!.url.pathname, fetch.requests[1]!.json]).toEqual([
      '/3.0/lists/aud123',
      { members: [{ email_address: 'b@example.com', status: 'pending' }, { email_address: 'c@example.com', status: 'pending' }], update_existing: false },
    ]);
    expect(batch.errors.map((e) => e.error_code)).toEqual(['ERROR_CONTACT_EXISTS']);
    expect(fields.merge_fields.map((f) => f.tag)).toEqual(['FNAME']);
    expect(fetch.requests[2]!.url.searchParams.get('count')).toBe('100');
  });

  it('creates a webhook for contact events from people and admins, and returns its signing secret', async () => {
    const fetch = scriptedFetch({ json: { id: 'wh1', url: 'https://app.test/webhooks/mailchimp/events', list_id: 'aud123', signing_enabled: true, signing_secret: 'shh' } });
    const hook = await createMailchimp(config, { fetch }).webhooks.create(ctx, { url: 'https://app.test/webhooks/mailchimp/events' });
    expect(hook.signing_secret).toBe('shh');
    expect(fetch.requests[0]!.json).toEqual({
      url: 'https://app.test/webhooks/mailchimp/events',
      events: { subscribe: true, unsubscribe: true, profile: true, upemail: true, cleaned: true, campaign: false },
      sources: { user: true, admin: true, api: false },
    });
  });
});

describe('errors', () => {
  it("maps Mailchimp's title to a code and category, and never keeps its detail", async () => {
    const fetch = scriptedFetch({ status: 400, json: { title: 'Member Exists', status: 400, detail: 'ada@example.com is already a list member.' } });
    const tracer = new TestTracer();
    const err = await createMailchimp(config, { fetch, tracer }).members.update(ctx, { email: ada, newEmail: 'ada@example.com' }).catch((e) => e);
    expect(err).toBeInstanceOf(MailchimpError);
    expect([err.code, err.category, err.providerCode]).toEqual(['mailchimp/member-exists', 'conflict', 'Member Exists']);
    expect(JSON.stringify({ message: err.message, metadata: err.metadata })).not.toContain('example.com');
    expect(tracer.spans[0]!.attributes['error.type']).toBe('Member Exists');
    assertProviderSpans(tracer.spans);
  });

  it('names the fields an invalid resource got wrong, without their messages', async () => {
    const fetch = scriptedFetch({ status: 400, json: { title: 'Invalid Resource', status: 400, detail: 'Your merge fields were invalid.', errors: [{ field: 'RADIO', message: 'Please enter a value' }] } });
    const err = await createMailchimp(config, { fetch }).subscribe(ctx, { email: ada }).catch((e) => e);
    expect([err.code, err.category]).toEqual(['mailchimp/invalid-resource', 'invalid-request']);
    expect(err.message).toContain('RADIO');
    expect(err.message).not.toContain('Please enter');
  });

  it("says when an address was deleted permanently and can't be added back", async () => {
    const fetch = scriptedFetch({ status: 400, json: { title: 'Forgotten Email Not Subscribed', status: 400, detail: 'ada@example.com was permanently deleted' } });
    expect(await createMailchimp(config, { fetch }).subscribe(ctx, { email: ada }).catch((e) => e.code)).toBe('mailchimp/forgotten-email');
  });

  it('retries only rate limits and outages, then falls back to the status', async () => {
    const fetch = scriptedFetch({ status: 429, headers: { 'retry-after': '0' }, json: { title: 'Too Many Requests', status: 429 } }, { status: 404, json: { title: 'Resource Not Found', status: 404 } });
    const err = await createMailchimp(config, { fetch, ...noWait }).members.get(ctx, ada).catch((e) => e);
    expect([err.code, err.category, fetch.requests.length]).toEqual(['mailchimp/not-found', 'not-found', 2]);
    const bad = scriptedFetch({ status: 401, json: { title: 'API Key Invalid', status: 401 } });
    expect(await createMailchimp(config, { fetch: bad }).members.get(ctx, ada).catch((e) => e.code)).toBe('mailchimp/invalid-api-key');
    expect(bad.requests).toHaveLength(1);
  });
});

describe('settings', () => {
  it('reads from the environment by name, with the server prefix optional, and says where to find each', () => {
    expect(settingsFromEnv(settings, (n) => ({ MAILCHIMP_API_KEY: 'k-us6', MAILCHIMP_AUDIENCE_ID: 'aud' })[n])).toEqual({ apiKey: 'k-us6', audienceId: 'aud' });
    expect(() => settingsFromEnv(settings, () => undefined)).toThrow(/MAILCHIMP_API_KEY, MAILCHIMP_AUDIENCE_ID/);
    expect(settings.every((s) => s.whereToFind)).toBe(true);
    expect(checkSetting(settings[0]!, 'test', 'k-us6')).toBeNull();
  });
});

describe('webhooks', () => {
  const secret = 'mc-signing-secret';
  const unsubscribe = { type: 'unsubscribe' as const, data: { action: 'unsub', reason: 'manual', id: hash, list_id: 'aud123', email: 'ada@example.com', merges: { EMAIL: 'ada@example.com', FNAME: 'Ada' } } };

  function serverFor(received: unknown[], tracer?: TestTracer) {
    class MailchimpWebhooks extends WebhookController {
      readonly prefix = 'mailchimp';
      readonly auth = mailchimpWebhookAuth(secret);
      init() {
        const route = { mode: 'direct', procedure: 'newsletter.fromMailchimp', eventType: mailchimpEventType } as const;
        const read = async (_ctx: unknown, body: unknown) => MailchimpWebhookBody.parse(body);
        this.post('events', route, read);
        this.get('events', route, read);
      }
    }
    const communication = { call: async (_ctx: unknown, _name: string, input: unknown) => { received.push(input); return { ok: true }; } } as never;
    return new WebhookServer({ name: 'webhooks', logger }, { communication, tracer }).registerController(new MailchimpWebhooks());
  }

  it('receives a signed, form-encoded delivery through WebhookServer, typed, with its span', async () => {
    const received: unknown[] = [];
    const tracer = new TestTracer();
    const server = serverFor(received, tracer);
    const { rawBody, headers } = signedMailchimpWebhook(unsubscribe, secret);
    expect(rawBody).toContain('data%5Bmerges%5D%5BFNAME%5D=Ada');
    const ok = await server.inject({ method: 'POST', url: '/mailchimp/events', headers, payload: rawBody });
    expect(ok.statusCode).toBe(200);
    const body = received[0] as MailchimpWebhookBody;
    expect(body.type).toBe('unsubscribe');
    if (body.type === 'unsubscribe') expect([body.data.email, body.data.reason, body.data.merges?.FNAME]).toEqual(['ada@example.com', 'manual', 'Ada']);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['mariachi.integration.event']])).toEqual([['mailchimp webhook', 'server', 'unsubscribe']]);
    assertProviderSpans(tracer.spans);
  });

  it('refuses a forged, altered or stale delivery', async () => {
    const received: unknown[] = [];
    const server = serverFor(received);
    const forged = signedMailchimpWebhook(unsubscribe, 'someone-else');
    const stale = signedMailchimpWebhook(unsubscribe, secret, { timestampSeconds: Math.floor(Date.now() / 1000) - 600 });
    const good = signedMailchimpWebhook(unsubscribe, secret);
    for (const delivery of [forged, stale, { ...good, rawBody: good.rawBody.replace('manual', 'abuse') }, { rawBody: good.rawBody, headers: { 'content-type': 'application/x-www-form-urlencoded' } }]) {
      expect((await server.inject({ method: 'POST', url: '/mailchimp/events', headers: delivery.headers, payload: delivery.rawBody })).statusCode).toBe(401);
    }
    expect(received).toHaveLength(0);
  });

  it("answers Mailchimp's GET check of the URL without reaching the handler", async () => {
    const received: unknown[] = [];
    const tracer = new TestTracer();
    const check = await serverFor(received, tracer).inject({ method: 'GET', url: '/mailchimp/events' });
    expect(check.statusCode).toBe(200);
    expect(received).toHaveLength(0);
    expect(tracer.spans[0]!.attributes['mariachi.integration.event']).toBe('handshake');
  });

  it('reads every event, from the form encoding or JSON', () => {
    const upemail = MailchimpWebhookBody.parse({ type: 'upemail', fired_at: '2026-11-21 10:00:00', 'data[list_id]': 'aud123', 'data[new_email]': 'new@example.com', 'data[old_email]': 'old@example.com' });
    expect(upemail.type === 'upemail' && upemail.data.new_email).toBe('new@example.com');
    const subscribe = MailchimpWebhookBody.parse({ type: 'subscribe', fired_at: '2026-11-21 10:00:00', data: { id: hash, list_id: 'aud123', email: 'ada@example.com' } });
    expect(mailchimpEventType(subscribe)).toBe('subscribe');
    for (const type of ['profile', 'cleaned', 'campaign'] as const) {
      expect(MailchimpWebhookBody.safeParse({ type, fired_at: 'x', data: { id: 'c1', list_id: 'aud123', email: 'a@example.com' } }).success).toBe(true);
    }
    expect(MailchimpWebhookBody.safeParse({ type: 'something-else', fired_at: 'x', data: {} }).success).toBe(false);
  });

  it("doesn't let a form key reach an object's prototype", () => {
    const out = expandFormBody({ type: 'profile', 'data[__proto__][polluted]': 'yes', 'constructor[prototype][polluted]': 'yes' }) as Record<string, unknown>;
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(out.type).toBe('profile');
  });
});

describe('the fake', () => {
  it('stands in for the client in an app’s tests', async () => {
    const fake = fakeMailchimp({ members: [mailchimpMember('old@example.com', { status: 'unsubscribed' })] });
    expect((await fake.subscribe(ctx, { email: 'new@example.com', tags: ['beta'] })).status).toBe('pending');
    expect((await fake.members.get(ctx, 'NEW@example.com')).tags?.map((t) => t.name)).toEqual(['beta']);
    expect((await fake.subscribe(ctx, { email: 'old@example.com', doubleOptIn: false })).status).toBe('subscribed');
    await fake.members.deletePermanently(ctx, 'new@example.com');
    await expect(fake.subscribe(ctx, { email: 'new@example.com' })).rejects.toMatchObject({ code: 'mailchimp/forgotten-email' });
    await expect(fake.members.get(ctx, 'nobody@example.com')).rejects.toMatchObject({ code: 'not-found' });
  });
});
