import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { DEFAULT_PAGE_CSP, html } from '@mariachi/api-facade';
import { InMemoryIdempotencyStore, createContext } from '@mariachi/core';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { describe, expect, it } from 'vitest';
import { createTawkTo } from './client';
import { TawkToError } from './errors';
import { settings } from './generated';
import { fakeTawkTo, signedTawkToWebhook, tawkToEvent } from './testing';
import { TawkToWebhookBody, tawkToEventType, tawkToWebhookAuth } from './webhooks';
import { tawkToCsp } from './widget';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger });
const config = { propertyId: '58ca8453b8a7e060cd3b1ecb', widgetId: 'default', apiKey: 'key' };

describe('chatIdentity', () => {
  it("signs the user's id with the API key, hex HMAC-SHA256, as Tawk.to's login expects", async () => {
    // RFC 4231-style known answer: HMAC-SHA256("key", "The quick brown fox jumps over the lazy dog")
    const identity = await createTawkTo(config).chatIdentity({ id: 'The quick brown fox jumps over the lazy dog', email: 'ada@example.com', name: 'Ada' });
    expect(identity).toEqual({
      provider: 'tawk-to',
      userId: 'The quick brown fox jumps over the lazy dog',
      hash: 'f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8',
      name: 'Ada',
      email: 'ada@example.com',
      attributes: {},
    });
  });

  it('puts the company and sign-up date in custom attributes', async () => {
    const identity = await createTawkTo(config).chatIdentity({ id: 'u1', createdAt: new Date('2026-01-02T03:04:05Z'), company: { id: 'c1', name: 'Acme' } });
    expect(identity.attributes).toEqual({ 'company-id': 'c1', 'company-name': 'Acme', 'created-at': '2026-01-02T03:04:05.000Z' });
    expect(identity).not.toHaveProperty('email');
  });

  it('fails without the API key, and on a bad user', async () => {
    await expect(createTawkTo({ ...config, apiKey: undefined }).chatIdentity({ id: 'u1' })).rejects.toMatchObject({ code: 'tawk-to/no-api-key' });
    await expect(createTawkTo(config).chatIdentity({ id: '', email: 'nope' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });
});

describe('widgetSnippet', () => {
  it('is one script tag for the loader, the IDs and the signed user in data- attributes', async () => {
    const tawk = createTawkTo(config);
    expect(tawk.widgetSnippet().value).toBe('<script src="/assets/lib/tawk-to.js" data-property-id="58ca8453b8a7e060cd3b1ecb" data-widget-id="default"></script>');
    const identity = await tawk.chatIdentity({ id: 'u1', name: 'Ada "<b>"', company: { id: 'c1' } });
    const snippet = tawk.widgetSnippet({ identity, src: '/static/tawk.js' }).value;
    expect(snippet).toBe(
      `<script src="/static/tawk.js" data-property-id="58ca8453b8a7e060cd3b1ecb" data-widget-id="default" data-user-id="u1" data-hash="${identity.hash}" data-name="Ada &quot;&lt;b&gt;&quot;" data-attributes="{&quot;company-id&quot;:&quot;c1&quot;}"></script>`,
    );
    expect(html`<body>${tawk.widgetSnippet()}</body>`.value).toContain('<body><script src=');
  });

  it("refuses a property or widget ID that couldn't be one", () => {
    expect(() => createTawkTo({ ...config, propertyId: 'x/../y' })).toThrow(expect.objectContaining({ code: 'tawk-to/invalid-setting' }));
    expect(() => createTawkTo({ ...config, widgetId: 'a b' })).toThrow(TawkToError);
  });
});

describe('what Tawk.to only does in the browser', () => {
  it('fails upsertContact and trackEvent with tawk-to/not-supported', async () => {
    const tawk = createTawkTo(config);
    const contact = await tawk.upsertContact(ctx, { id: 'u1', email: 'ada@example.com' }).catch((e) => e);
    expect(contact).toBeInstanceOf(TawkToError);
    expect([contact.code, contact.category]).toEqual(['tawk-to/not-supported', 'invalid-request']);
    await expect(tawk.trackEvent(ctx, { userId: 'u1', name: 'upgraded' })).rejects.toMatchObject({ code: 'tawk-to/not-supported', message: expect.stringContaining('window.tawkTo.addEvent') });
  });
});

describe('tawkToCsp', () => {
  it("adds Tawk.to's hosts to the page's policy, and nothing that lets inline script run", () => {
    const policy = tawkToCsp();
    expect(policy).toBe(
      "default-src 'self'; style-src 'self' 'unsafe-inline' https://*.tawk.to https://fonts.googleapis.com https://cdn.jsdelivr.net; img-src 'self' data: https://*.tawk.to https://cdn.jsdelivr.net https://tawk.link https://s3.amazonaws.com; object-src 'none'; base-uri 'none'; form-action 'self' https://*.tawk.to; frame-ancestors 'none'; script-src 'self' https://*.tawk.to https://cdn.jsdelivr.net; frame-src 'self' https://*.tawk.to; font-src 'self' https://*.tawk.to https://fonts.gstatic.com; connect-src 'self' https://*.tawk.to wss://*.tawk.to",
    );
    expect(policy).not.toMatch(/script-src[^;]*unsafe-inline/);
    expect(DEFAULT_PAGE_CSP).not.toContain('tawk.to');
  });
});

describe('settings', () => {
  it('reads from the environment by name, and says where to find each', () => {
    expect(settingsFromEnv(settings, (n) => ({ TAWKTO_PROPERTY_ID: 'p1', TAWKTO_WIDGET_ID: 'default' })[n])).toEqual({ propertyId: 'p1', widgetId: 'default' });
    expect(settings.every((s) => s.whereToFind && s.url)).toBe(true);
    expect(settings.filter((s) => s.secret).map((s) => s.env)).toEqual(['TAWKTO_API_KEY', 'TAWKTO_WEBHOOK_SECRET']);
    expect(checkSetting(settings[0]!, 'production', 'p1')).toBeNull();
  });
});

describe('the loader (browser/tawk-to.js)', () => {
  const source = readFileSync(fileURLToPath(new URL('../browser/tawk-to.js', import.meta.url)), 'utf8');

  function run(attributes: Record<string, string>, existing: Record<string, unknown> = {}) {
    const window: Record<string, any> = { ...existing };
    const inserted: Array<Record<string, any>> = [];
    const currentScript = {
      getAttribute: (name: string) => attributes[name] ?? null,
      nextSibling: null,
      parentNode: { insertBefore: (el: Record<string, any>) => inserted.push(el) },
    };
    const document = {
      currentScript,
      createElement: () => {
        const el: Record<string, any> = { attrs: {} };
        el.setAttribute = (k: string, v: string) => { el.attrs[k] = v; };
        return el;
      },
    };
    const warnings: unknown[] = [];
    runInNewContext(source, { window, document, console: { warn: (...a: unknown[]) => warnings.push(a) } });
    return { window, inserted, warnings };
  }

  /** Stands in for Tawk.to's widget: records calls and answers each callback. */
  function widget(api: Record<string, any>, error?: string) {
    const calls: unknown[][] = [];
    api.login = (data: unknown, cb: (e?: string) => void) => { calls.push(['login', data]); cb(error); };
    api.addEvent = (...args: unknown[]) => { calls.push(['addEvent', ...args.slice(0, -1)]); (args.at(-1) as (e?: string) => void)(error); };
    api.logout = (cb: (e?: string) => void) => { calls.push(['logout']); cb(error); };
    return calls;
  }

  const ids = { 'data-property-id': '58ca8453b8a7e060cd3b1ecb', 'data-widget-id': 'default' };

  it("loads Tawk.to's widget the way its embed code does", () => {
    const { window, inserted } = run(ids);
    expect(inserted).toHaveLength(1);
    expect(inserted[0]).toMatchObject({ async: true, src: 'https://embed.tawk.to/58ca8453b8a7e060cd3b1ecb/default', charset: 'UTF-8', attrs: { crossorigin: '*' } });
    expect(typeof window.Tawk_API).toBe('object');
    expect(window.Tawk_LoadStart).toBeDefined();
  });

  it('signs the user in once the widget loads, then runs what was waiting', async () => {
    const previous: string[] = [];
    const { window } = run(
      { ...ids, 'data-user-id': 'u1', 'data-hash': 'abc', 'data-name': 'Ada', 'data-email': 'ada@example.com', 'data-attributes': '{"company-id":"c1","bad key":"x","n":1}' },
      { Tawk_API: { onLoad: () => previous.push('page') } },
    );
    const calls = widget(window.Tawk_API);
    const event = window.tawkTo.addEvent('requested-quotation', { sku: 'A1' });
    expect(calls).toEqual([]);
    window.Tawk_API.onLoad();
    await event;
    expect(calls).toEqual([
      ['login', { 'company-id': 'c1', userId: 'u1', hash: 'abc', name: 'Ada', email: 'ada@example.com' }],
      ['addEvent', 'requested-quotation', { sku: 'A1' }],
    ]);
    expect(previous).toEqual(['page']);
    // After load, at once, and without metadata as Tawk.to's own example calls it
    await window.tawkTo.addEvent('upgraded');
    await window.tawkTo.logout();
    expect(calls.slice(2)).toEqual([['addEvent', 'upgraded'], ['logout']]);
  });

  it("stays anonymous without an identity, and passes on the widget's errors", async () => {
    const { window, warnings } = run({ ...ids, 'data-user-id': 'u1', 'data-hash': 'abc' });
    const calls = widget(window.Tawk_API, 'SESSION_EXPIRED');
    window.Tawk_API.onLoad();
    expect(warnings).toHaveLength(1);
    await expect(window.tawkTo.addEvent('x')).rejects.toBe('SESSION_EXPIRED');
    await expect(window.tawkTo.addEvent('not allowed!')).rejects.toBe('INVALID_EVENT_NAME');

    const anonymous = run(ids).window;
    const none = widget(anonymous.Tawk_API);
    anonymous.Tawk_API.onLoad();
    expect(none).toEqual([]);
    expect(calls[0]![0]).toBe('login');
  });

  it('does nothing with an ID that could change the address', () => {
    const { window, inserted } = run({ 'data-property-id': '../evil', 'data-widget-id': 'default' });
    expect([inserted.length, window.Tawk_API, window.tawkTo]).toEqual([0, undefined, undefined]);
  });
});

describe('webhooks', () => {
  class TawkToWebhooks extends WebhookController {
    readonly prefix = 'tawk-to';
    readonly auth = tawkToWebhookAuth('whsec-test');
    init() {
      this.post('events', { mode: 'direct', procedure: 'support.fromTawkTo', eventType: tawkToEventType }, async (_ctx, body) => TawkToWebhookBody.parse(body));
    }
  }

  function server() {
    const received: unknown[] = [];
    const tracer = new TestTracer();
    const communication = { call: async (_ctx: unknown, _name: string, input: unknown) => { received.push(input); return { ok: true }; } } as never;
    const s = new WebhookServer({ name: 'webhooks', logger }, { communication, tracer, idempotency: new InMemoryIdempotencyStore() }).registerController(new TawkToWebhooks());
    const post = (rawBody: string, headers: Record<string, string>) => s.inject({ method: 'POST', url: '/tawk-to/events', headers: { 'content-type': 'application/json', ...headers }, payload: rawBody });
    return { post, received, tracer };
  }

  it('receives a signed delivery through WebhookServer, with its span, once however often Tawk.to retries it', async () => {
    const { post, received, tracer } = server();
    const { rawBody, headers } = signedTawkToWebhook(tawkToEvent.chatStart({ chatId: 'c42' }), 'whsec-test');
    expect((await post(rawBody, headers)).statusCode).toBe(200);
    const retry = await post(rawBody, { ...headers, 'x-hook-event-id': 'changed' });
    expect([retry.statusCode, retry.json()]).toEqual([200, { ok: true, duplicate: true }]);
    expect(received).toHaveLength(1);
    const body = received[0] as TawkToWebhookBody;
    expect(body.event === 'chat:start' && [body.chatId, body.message.text, body.visitor.email]).toEqual(['c42', 'Hello', 'ada@example.com']);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['mariachi.integration.event']])[0]).toEqual(['tawk-to webhook', 'server', 'chat:start']);
  });

  it('refuses a forged or altered delivery', async () => {
    const { post, received } = server();
    const forged = signedTawkToWebhook(tawkToEvent.chatEnd(), 'someone-else');
    expect((await post(forged.rawBody, forged.headers)).statusCode).toBe(401);
    const real = signedTawkToWebhook(tawkToEvent.chatEnd(), 'whsec-test');
    expect((await post(`${real.rawBody} `, real.headers)).statusCode).toBe(401);
    expect((await post(real.rawBody, { 'x-hook-event-id': 'e' })).statusCode).toBe(401);
    expect(received).toHaveLength(0);
  });

  it('reads each documented event', () => {
    for (const payload of [tawkToEvent.chatStart(), tawkToEvent.chatEnd(), tawkToEvent.chatTranscript(), tawkToEvent.ticketCreate()]) {
      expect(TawkToWebhookBody.parse(payload).event).toBe(payload.event);
      expect(tawkToEventType(payload)).toBe(payload.event);
    }
    // Tawk.to's own transcript example, attachments and all
    const transcript = TawkToWebhookBody.parse(
      tawkToEvent.chatTranscript({
        chat: {
          id: 'c',
          visitor: { name: 'V1561719148780935' },
          messages: [{ sender: { t: 'a', n: 'Eugene', id: 'a1' }, type: 'msg', msg: 'msg', time: '2024-07-03T01:02:37.780Z', attchs: [{ type: 'file', content: { file: { url: 'https://tawkto.link/x.png', name: 'x.png', mimeType: 'image/png', size: 3797, extension: 'png' } } }] }],
        },
      }),
    );
    expect(transcript.event === 'chat:transcript_created' && transcript.chat.messages[0]!.attchs![0]!.content.file!.size).toBe(3797);
    expect(TawkToWebhookBody.safeParse({ event: 'chat:unknown' }).success).toBe(false);
    expect(tawkToEventType(null)).toBeUndefined();
  });
});

describe('the fake', () => {
  it('is the client with test settings, remembering who it signed', async () => {
    const fake = fakeTawkTo();
    await fake.chatIdentity({ id: 'u1' });
    expect(fake.identities_.map((i) => i.userId)).toEqual(['u1']);
    expect(fake.widgetSnippet({ identity: fake.identities_[0] }).value).toContain('data-user-id="u1"');
    await expect(fake.trackEvent(ctx, { userId: 'u1', name: 'x' })).rejects.toMatchObject({ code: 'tawk-to/not-supported' });
  });
});
