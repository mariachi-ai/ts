import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { DEFAULT_PAGE_CSP } from '@mariachi/api-facade';
import { InMemoryIdempotencyStore, createContext } from '@mariachi/core';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { decodeProtectedHeader, jwtVerify } from 'jose';
import { describe, expect, it } from 'vitest';
import { checkedSubdomain, createZendesk } from './client';
import { ZendeskError } from './errors';
import { settings } from './generated';
import { fakeZendesk, signedZendeskWebhook, zendeskEvent } from './testing';
import { zendeskCsp } from './widget';
import { ZendeskWebhookBody, zendeskEventType, zendeskSubject, zendeskWebhookAuth } from './webhooks';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger });
const oauth = { subdomain: 'acme', clientId: 'mariachi_app', clientSecret: 'cs-test' };
const noWait = { sleep: async () => {} };
const token = { json: { access_token: 'at-1', token_type: 'bearer', expires_in: 1800 } };
const user = (over: Record<string, unknown> = {}) => ({ id: 42, name: 'Ada', email: 'ada@example.com', external_id: 'u_1', role: 'end-user', created_at: '2026-11-21T10:00:00Z', updated_at: '2026-11-21T10:00:00Z', ...over });
const ticket = (over: Record<string, unknown> = {}) => ({ id: 7, subject: 'Help', status: 'new', requester_id: 42, tags: [], created_at: '2026-11-21T10:00:00Z', updated_at: '2026-11-21T10:00:00Z', ...over });

describe('the Support API', () => {
  it('signs in with the OAuth client once, then creates or updates a user by external_id, saying which', async () => {
    const fetch = scriptedFetch(token, { status: 201, json: { user: user() } }, { status: 200, json: { user: user({ name: 'Ada L.' }) } });
    const tracer = new TestTracer();
    const zendesk = createZendesk(oauth, { fetch, tracer });
    const first = await zendesk.users.createOrUpdate(ctx, { externalId: 'u_1', email: 'ada@example.com', name: 'Ada', userFields: { plan: 'pro' } });
    const second = await zendesk.users.createOrUpdate(ctx, { externalId: 'u_1', name: 'Ada L.' });
    expect([first.created, second.created, second.user.name]).toEqual([true, false, 'Ada L.']);

    const [tok, create] = fetch.requests;
    expect([tok!.method, tok!.url.href, tok!.headers.authorization]).toEqual(['POST', 'https://acme.zendesk.com/oauth/tokens', undefined]);
    expect(Object.fromEntries(new URLSearchParams(tok!.body))).toEqual({ grant_type: 'client_credentials', client_id: 'mariachi_app', client_secret: 'cs-test' });
    expect(create!.url.href).toBe('https://acme.zendesk.com/api/v2/users/create_or_update');
    expect(create!.headers.authorization).toBe('Bearer at-1');
    expect(create!.json).toEqual({ user: { external_id: 'u_1', email: 'ada@example.com', name: 'Ada', user_fields: { plan: 'pro' } } });
    expect(fetch.requests).toHaveLength(3);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([
      ['zendesk oauth.token', 'client', 'acme.zendesk.com'],
      ['zendesk users.createOrUpdate', 'client', 'acme.zendesk.com'],
      ['zendesk users.createOrUpdate', 'client', 'acme.zendesk.com'],
    ]);
    assertProviderSpans(tracer.spans);
  });

  it('uses a legacy API token as Basic <email>/token:<token> when no OAuth client is set', async () => {
    const fetch = scriptedFetch({ json: { user: user() } });
    await createZendesk({ subdomain: 'acme', email: 'agent@example.com', apiToken: 'tok' }, { fetch }).users.get(ctx, 42);
    expect(fetch.requests[0]!.headers.authorization).toBe(`Basic ${Buffer.from('agent@example.com/token:tok').toString('base64')}`);
    expect(fetch.requests[0]!.url.pathname).toBe('/api/v2/users/42');
  });

  it('refuses to call without credentials, and checks the subdomain', async () => {
    await expect(createZendesk({ subdomain: 'acme' }, { fetch: scriptedFetch() }).tickets.get(ctx, 1)).rejects.toMatchObject({ code: 'zendesk/no-credentials' });
    expect([checkedSubdomain('acme'), checkedSubdomain('https://Acme.zendesk.com/'), checkedSubdomain('acme.zendesk.com')]).toEqual(['acme', 'acme', 'acme']);
    expect(() => createZendesk({ subdomain: 'evil.example/x' })).toThrow(expect.objectContaining({ code: 'zendesk/invalid-subdomain' }));
    expect(() => createZendesk({ ...oauth, eventSource: 'Zendesk' })).toThrow(expect.objectContaining({ code: 'zendesk/invalid-event-source' }));
  });

  it('creates a ticket with one Idempotency-Key across its retries', async () => {
    const fetch = scriptedFetch(token, { status: 429, headers: { 'retry-after': '0' } }, { status: 201, json: { ticket: ticket(), audit: {} } });
    const created = await createZendesk(oauth, { fetch, ...noWait }).tickets.create(ctx, { subject: 'Help', comment: { body: 'It broke' }, requesterId: 42, tags: ['web'] });
    expect(created.id).toBe(7);
    const [, a, b] = fetch.requests;
    expect(a!.headers['idempotency-key']).toMatch(/^[0-9a-f-]{36}$/);
    expect(b!.headers['idempotency-key']).toBe(a!.headers['idempotency-key']);
    expect(a!.json).toEqual({ ticket: { subject: 'Help', comment: { body: 'It broke' }, requester_id: 42, tags: ['web'] } });
  });

  it("never retries a comment after an outage, since Zendesk may have added it; does after a rate limit", async () => {
    const outage = scriptedFetch(token, { status: 503 });
    await expect(createZendesk(oauth, { fetch: outage, ...noWait }).comments.add(ctx, { ticketId: 7, body: 'Thanks', public: true })).rejects.toMatchObject({ code: 'zendesk/unavailable' });
    expect(outage.requests).toHaveLength(2);
    const limited = scriptedFetch(token, { status: 429, headers: { 'retry-after': '0' } }, { json: { ticket: ticket() } });
    await createZendesk(oauth, { fetch: limited, ...noWait }).tickets.update(ctx, { ticketId: 7, status: 'solved', comment: { body: 'Fixed', public: false } });
    expect(limited.requests[2]!.json).toEqual({ ticket: { status: 'solved', comment: { body: 'Fixed', public: false } } });
    expect(limited.requests[2]!.method).toBe('PUT');
  });

  it("fails as a ZendeskError with Zendesk's code, never its description; a sentence isn't kept as a code", async () => {
    const fetch = scriptedFetch(token, { status: 404, json: { error: 'RecordNotFound', description: 'Not found: ada@example.com' } }, { status: 400, json: { error: 'Invalid brand_id parameter: 9', description: 'x' } });
    const zendesk = createZendesk(oauth, { fetch });
    const err = await zendesk.tickets.get(ctx, 99).catch((e) => e);
    expect(err).toBeInstanceOf(ZendeskError);
    expect([err.code, err.category, err.providerCode]).toEqual(['zendesk/not-found', 'not-found', 'RecordNotFound']);
    expect(err.message).not.toContain('ada@');
    const bad = await zendesk.tickets.get(ctx, 98).catch((e) => e);
    expect([bad.code, bad.providerCode]).toEqual(['zendesk/invalid-request', undefined]);
  });

  it('fetches a new access token after Zendesk refuses one', async () => {
    const fetch = scriptedFetch(token, { status: 401, json: { error: 'invalid_token', error_description: 'expired' } }, { json: { access_token: 'at-2', expires_in: 1800 } }, { json: { ticket: ticket() } });
    const zendesk = createZendesk(oauth, { fetch });
    await expect(zendesk.tickets.get(ctx, 7)).rejects.toMatchObject({ code: 'zendesk/invalid-token', category: 'unauthorized' });
    await zendesk.tickets.get(ctx, 7);
    expect(fetch.requests.map((r) => r.url.pathname)).toEqual(['/oauth/tokens', '/api/v2/tickets/7', '/oauth/tokens', '/api/v2/tickets/7']);
    expect(fetch.requests[3]!.headers.authorization).toBe('Bearer at-2');
  });

  it('lists requested tickets with cursor pagination, searches tickets, and reads every comment', async () => {
    const comment = (id: number) => ({ id, type: 'Comment', body: `c${id}`, public: true, author_id: 42, attachments: [], created_at: '2026-11-21T10:00:00Z' });
    const fetch = scriptedFetch(
      token,
      { json: { tickets: [ticket()], meta: { has_more: false, after_cursor: null } } },
      { json: { results: [ticket()], next_page: null, count: 1 } },
      { json: { comments: [comment(1)], meta: { has_more: true, after_cursor: 'cur' } } },
      { json: { comments: [comment(2)], meta: { has_more: false, after_cursor: null } } },
    );
    const zendesk = createZendesk(oauth, { fetch });
    await zendesk.tickets.listRequested(ctx, { userId: 42, sort: '-updated_at' });
    await zendesk.tickets.search(ctx, { query: 'status<solved', sortBy: 'updated_at' });
    const seen: number[] = [];
    for await (const c of zendesk.comments.all(ctx, { ticketId: 7 })) seen.push(c.id);
    expect(seen).toEqual([1, 2]);
    const [, listed, searched, , page2] = fetch.requests;
    expect([listed!.url.pathname, listed!.url.searchParams.get('page[size]'), listed!.url.searchParams.get('sort')]).toEqual(['/api/v2/users/42/tickets/requested', '25', '-updated_at']);
    expect([searched!.url.searchParams.get('query'), searched!.url.searchParams.get('sort_by')]).toEqual(['type:ticket status<solved', 'updated_at']);
    expect(page2!.url.searchParams.get('page[after]')).toBe('cur');
  });

  it('creates or updates an organization by external_id, and refuses one with only a name', async () => {
    const fetch = scriptedFetch(token, { json: { organization: { id: 3, name: 'Acme', external_id: 'team_1', created_at: 'x', updated_at: 'x' } } });
    const zendesk = createZendesk(oauth, { fetch });
    await zendesk.organizations.createOrUpdate(ctx, { externalId: 'team_1', name: 'Acme', domainNames: ['acme.test'] });
    expect(fetch.requests[1]!.json).toEqual({ organization: { external_id: 'team_1', name: 'Acme', domain_names: ['acme.test'] } });
    await expect(zendesk.organizations.createOrUpdate(ctx, { name: 'Acme' } as never)).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });

  it('checks its input before calling', async () => {
    const zendesk = createZendesk(oauth, { fetch: scriptedFetch() });
    await expect(zendesk.users.createOrUpdate(ctx, { name: 'No id' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(zendesk.tickets.get(ctx, -1)).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(zendesk.tickets.create(ctx, { comment: {} } as never)).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });
});

describe('the chat surface', () => {
  const messaging = { ...oauth, widgetKey: '8a1d6c3e-1111-4c2b-9d5e-000000000000', messagingKeyId: 'app_5963ceb97cde542d000dbdb1', messagingSecret: 'msg-secret' };

  it('signs the user as a messaging JWT: HS256, kid, scope user, external_id, a short exp', async () => {
    const identity = await createZendesk(messaging).chatIdentity({ id: 'u_1', email: 'ada@example.com', emailVerified: true, name: 'Ada', company: { id: 't1' } });
    const { payload } = await jwtVerify(identity.token, new TextEncoder().encode('msg-secret'), { algorithms: ['HS256'] });
    expect(decodeProtectedHeader(identity.token)).toEqual({ alg: 'HS256', typ: 'JWT', kid: 'app_5963ceb97cde542d000dbdb1' });
    expect(payload).toEqual({ scope: 'user', external_id: 'u_1', name: 'Ada', email: 'ada@example.com', email_verified: true, exp: expect.any(Number) });
    expect(payload.exp! - Date.now() / 1000).toBeGreaterThan(590);
    expect(payload.exp! - Date.now() / 1000).toBeLessThanOrEqual(600);
    expect([identity.provider, identity.userId, identity.expiresAt.getTime()]).toEqual(['zendesk', 'u_1', payload.exp! * 1000]);
  });

  it("leaves an unverified email out, and refuses without the messaging key", async () => {
    const identity = await createZendesk(messaging).chatIdentity({ id: 'u_1', email: 'ada@example.com' });
    const { payload } = await jwtVerify(identity.token, new TextEncoder().encode('msg-secret'));
    expect(payload.email).toBeUndefined();
    await expect(createZendesk(oauth).chatIdentity({ id: 'u_1' })).rejects.toMatchObject({ code: 'zendesk/no-messaging-key' });
    await expect(createZendesk(messaging).chatIdentity({ id: '' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });

  it("renders Zendesk's snippet, then the setup script with the token and the cookie choice", async () => {
    const zendesk = createZendesk(messaging);
    const identity = await zendesk.chatIdentity({ id: 'u_1' });
    expect(zendesk.widgetSnippet().value).toBe(
      '<script id="ze-snippet" src="https://static.zdassets.com/ekr/snippet.js?key=8a1d6c3e-1111-4c2b-9d5e-000000000000"></script>\n<script src="/assets/lib/zendesk-messenger.js" data-cookies="functional"></script>',
    );
    expect(zendesk.widgetSnippet({ identity, tokenUrl: '/chat/token', cookies: 'all' }).value).toContain(`data-cookies="all" data-token="${identity.token}" data-token-url="/chat/token"`);
    expect(() => zendesk.widgetSnippet({ tokenUrl: 'https://evil.example/t' })).toThrow(expect.objectContaining({ code: 'zendesk/invalid-token-url' }));
    expect(() => zendesk.widgetSnippet({ tokenUrl: '//evil.example/t' })).toThrow(expect.objectContaining({ code: 'zendesk/invalid-token-url' }));
    expect(() => createZendesk({ ...messaging, widgetKey: 'x"><script>' }).widgetSnippet()).toThrow(expect.objectContaining({ code: 'zendesk/invalid-widget-key' }));
    expect(() => createZendesk(oauth).widgetSnippet()).toThrow(expect.objectContaining({ code: 'zendesk/no-widget-key' }));
  });

  it("widens the page's policy with Zendesk's hosts, keeping the rest", () => {
    const csp = zendeskCsp();
    const directive = (name: string) => csp.split('; ').find((d) => d.startsWith(`${name} `))!.split(' ');
    expect(directive('default-src')).toEqual(["default-src", "'self'", 'https://*.zdassets.com', 'https://*.zendesk.com', 'https://*.smooch.io', 'https://*.twilio.com', 'wss://*.zendesk.com', 'wss://api.smooch.io', 'wss://voice-js.roaming.twilio.com']);
    expect(directive('img-src')).toEqual(['img-src', "'self'", 'data:', 'https://static.zdassets.com', 'https://*.zendesk.com', 'https://media.smooch.io', 'https://*.zdusercontent.com', 'blob:']);
    expect(directive('media-src')).toEqual(['media-src', "'self'", 'https://static.zdassets.com']);
    for (const kept of ["object-src 'none'", "frame-ancestors 'none'", "form-action 'self'", "base-uri 'none'"]) expect(csp).toContain(kept);
    expect(csp).not.toContain("script-src 'unsafe-inline'");
    expect(DEFAULT_PAGE_CSP).not.toContain('zdassets');
    expect(zendeskCsp("default-src 'none'; script-src 'self'")).toBe(
      "default-src https://*.zdassets.com https://*.zendesk.com https://*.smooch.io https://*.twilio.com wss://*.zendesk.com wss://api.smooch.io wss://voice-js.roaming.twilio.com; script-src 'self' https://*.zdassets.com https://*.zendesk.com https://*.smooch.io https://*.twilio.com wss://*.zendesk.com wss://api.smooch.io wss://voice-js.roaming.twilio.com; img-src https://static.zdassets.com https://*.zendesk.com https://media.smooch.io https://*.zdusercontent.com blob: data:; media-src https://static.zdassets.com; style-src 'unsafe-inline'",
    );
  });

  it('upserts the contact by external_id and returns Zendesk\'s id; tracks an event in the timeline', async () => {
    const fetch = scriptedFetch(token, { status: 201, json: { user: user() } }, { status: 202, json: { status: 'received', user_id: '42', profile_id: 'p1' } });
    const tracer = new TestTracer();
    const zendesk = createZendesk({ ...oauth, eventSource: 'mariachi-app' }, { fetch, tracer });
    expect(await zendesk.upsertContact(ctx, { id: 'u_1', email: 'ada@example.com', name: 'Ada', attributes: { plan: 'pro' } })).toEqual({ id: '42', created: true });
    await zendesk.trackEvent(ctx, { userId: 'u_1', name: 'plan_upgraded', metadata: { plan: 'pro' } });
    expect(fetch.requests[2]!.url.pathname).toBe('/api/v2/user_profiles/events');
    expect(fetch.requests[2]!.json).toEqual({
      profile: { source: 'mariachi-app', type: 'user', identifiers: [{ type: 'external_id', value: 'u_1' }] },
      event: { source: 'mariachi-app', type: 'plan_upgraded', properties: { plan: 'pro' } },
    });
    expect(tracer.spans.map((s) => s.name)).toEqual(['zendesk oauth.token', 'zendesk users.createOrUpdate', 'zendesk events.track']);
    assertProviderSpans(tracer.spans);
  });
});

describe('the setup script (browser/zendesk-messenger.js)', () => {
  const source = readFileSync(fileURLToPath(new URL('../browser/zendesk-messenger.js', import.meta.url)), 'utf8');
  const jwt = (exp: number) => `h.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.s`;

  function run(attributes: Record<string, string>, options: { stored?: Record<string, string>; fetched?: unknown } = {}) {
    const calls: unknown[][] = [];
    const given: string[] = [];
    const store = new Map(Object.entries(options.stored ?? {}));
    const fetches: string[] = [];
    const zE = (...args: unknown[]) => {
      calls.push(args);
      if (args[1] === 'loginUser') {
        (args[2] as (cb: (t: string) => void) => void)((t) => given.push(t));
        (args[3] as (e: unknown) => void)(null);
      }
    };
    const window = {
      zE,
      localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v), removeItem: (k: string) => store.delete(k) },
    };
    const fetch = async (url: string) => {
      fetches.push(url);
      return { ok: true, json: async () => options.fetched };
    };
    runInNewContext(source, { window, document: { currentScript: { getAttribute: (n: string) => attributes[n] ?? null } }, fetch, atob, Date, JSON });
    return { calls, given, store, fetches };
  }

  it('sets the cookie choice and signs the user in with the page’s token', () => {
    const token = jwt(Math.floor(Date.now() / 1000) + 600);
    const { calls, given, store } = run({ 'data-cookies': 'functional', 'data-token': token });
    expect(calls.map((c) => c.slice(0, 3).filter((x) => typeof x === 'string'))).toEqual([['messenger:set', 'cookies', 'functional'], ['messenger', 'loginUser']]);
    expect(given).toEqual([token]);
    expect(store.get('mariachi-zendesk-signed-in')).toBe('1');
  });

  it('fetches a fresh token from the app once the page’s has expired', async () => {
    const { given, fetches } = run({ 'data-token': jwt(Math.floor(Date.now() / 1000) - 10), 'data-token-url': '/chat/token' }, { fetched: { token: 'fresh' } });
    await new Promise((r) => setTimeout(r, 0));
    expect([fetches, given]).toEqual([['/chat/token'], ['fresh']]);
  });

  it('signs the widget out on a page without a token after one with', () => {
    const out = run({ 'data-cookies': 'functional' }, { stored: { 'mariachi-zendesk-signed-in': '1' } });
    expect(out.calls.at(-1)).toEqual(['messenger', 'logoutUser']);
    expect(out.store.has('mariachi-zendesk-signed-in')).toBe(false);
    expect(run({ 'data-cookies': 'functional' }).calls).toEqual([['messenger:set', 'cookies', 'functional']]);
  });

  it('does nothing without the widget (blocked) and signs nobody in when nothing may be stored', () => {
    expect(() => runInNewContext(source, { window: {}, document: { currentScript: { getAttribute: () => null } } })).not.toThrow();
    expect(run({ 'data-cookies': 'none', 'data-token': jwt(Math.floor(Date.now() / 1000) + 600) }).calls).toEqual([['messenger:set', 'cookies', 'none']]);
  });
});

describe('webhooks', () => {
  const secret = 'whsec-zendesk';

  class ZendeskWebhooks extends WebhookController {
    readonly prefix = 'zendesk';
    readonly auth = zendeskWebhookAuth(secret);
    init() {
      this.post('events', { mode: 'direct', procedure: 'support.fromZendesk', eventType: zendeskEventType }, async (_ctx, body) => ZendeskWebhookBody.parse(body));
    }
  }

  function server(tracer = new TestTracer()) {
    const received: unknown[] = [];
    const communication = { call: async (_ctx: unknown, _name: string, input: unknown) => { received.push(input); return { ok: true }; } } as never;
    const s = new WebhookServer({ name: 'webhooks', logger }, { communication, tracer, idempotency: new InMemoryIdempotencyStore() }).registerController(new ZendeskWebhooks());
    const post = (d: { rawBody: string; headers: Record<string, string> }) => s.inject({ method: 'POST', url: '/zendesk/events', headers: { 'content-type': 'application/json', ...d.headers }, payload: d.rawBody });
    return { received, post, tracer };
  }

  it('receives a signed event through WebhookServer, with its span, and dedupes a redelivery on the event id', async () => {
    const { received, post, tracer } = server();
    const event = zendeskEvent('ticket.created', { id: '35', status: 'NEW' });
    const ok = await post(signedZendeskWebhook(event, secret));
    expect(ok.statusCode).toBe(200);
    expect(zendeskSubject((received[0] as typeof event).subject)).toEqual({ kind: 'ticket', id: '35' });
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['mariachi.integration.event']])).toEqual([['zendesk webhook', 'server', 'zen:event-type:ticket.created']]);
    // Zendesk's retry: the same event, signed again a second later
    const again = await post(signedZendeskWebhook(event, secret, new Date(Date.now() + 1000)));
    expect([again.statusCode, JSON.parse(again.body).duplicate]).toEqual([200, true]);
    expect(received).toHaveLength(1);
  });

  it('refuses a forged, altered or stale delivery', async () => {
    const { received, post } = server();
    const event = zendeskEvent('user.created', { id: '9' });
    const signed = signedZendeskWebhook(event, secret);
    expect((await post(signedZendeskWebhook(event, 'someone-else'))).statusCode).toBe(401);
    expect((await post({ ...signed, rawBody: `${signed.rawBody} ` })).statusCode).toBe(401);
    expect((await post({ ...signed, headers: { ...signed.headers, 'x-zendesk-webhook-signature-timestamp': new Date(Date.now() + 1000).toISOString() } })).statusCode).toBe(401);
    expect((await post(signedZendeskWebhook(event, secret, new Date(Date.now() - 10 * 60_000)))).statusCode).toBe(401);
    expect(received).toHaveLength(0);
  });

  it("verifies a trigger's own body too, and reads no type it didn't give", async () => {
    const auth = zendeskWebhookAuth([secret, 'old-secret']);
    const d = signedZendeskWebhook({ ticket_id: '35', status: 'open' }, 'old-secret');
    const identity = await auth.auth({ headers: d.headers, rawBody: Buffer.from(d.rawBody), body: {}, params: {}, query: {}, method: 'POST', url: '/', routePath: '/', ip: '' }, { logger } as never);
    expect(identity?.eventId).toMatch(/^sig:/);
    expect(identity?.metadata).toEqual({ webhookId: '01F1KRFQ6BG29CNWFR60NK5FNY', invocationId: d.headers['x-zendesk-webhook-invocation-id'] });
    expect(zendeskEventType({ ticket_id: '35' })).toBeUndefined();
  });
});

describe('settings', () => {
  it('reads from the environment by name, and says where to find each', () => {
    expect(settingsFromEnv(settings, (n) => ({ ZENDESK_SUBDOMAIN: 'acme', ZENDESK_CLIENT_ID: 'c' })[n])).toEqual({ subdomain: 'acme', clientId: 'c' });
    expect(() => settingsFromEnv(settings, () => undefined)).toThrow(/ZENDESK_SUBDOMAIN/);
    expect(settings.every((s) => s.whereToFind && s.url)).toBe(true);
    expect(settings.filter((s) => s.secret).map((s) => s.env)).toEqual(['ZENDESK_CLIENT_SECRET', 'ZENDESK_API_TOKEN', 'ZENDESK_MESSAGING_SECRET', 'ZENDESK_WEBHOOK_SECRET']);
    expect(checkSetting(settings[0]!, 'test', 'acme-sandbox')).toBeNull();
  });
});

describe('the fake', () => {
  it('stands in for the client in an app’s tests', async () => {
    const zendesk = fakeZendesk();
    const { id, created } = await zendesk.upsertContact(ctx, { id: 'u_1', name: 'Ada', email: 'ada@example.com' });
    expect(created).toBe(true);
    expect((await zendesk.upsertContact(ctx, { id: 'U_1', name: 'Ada L.' })).created).toBe(false);
    const t = await zendesk.tickets.create(ctx, { subject: 'Help', comment: { body: 'It broke' }, requesterId: Number(id) });
    await zendesk.comments.add(ctx, { ticketId: t.id, body: 'On it', public: false });
    expect((await zendesk.comments.list(ctx, { ticketId: t.id })).comments.map((c) => [c.body, c.public])).toEqual([['It broke', true], ['On it', false]]);
    expect((await zendesk.tickets.listRequested(ctx, { userId: Number(id) })).tickets).toHaveLength(1);
    await zendesk.trackEvent(ctx, { userId: 'u_1', name: 'signed_up' });
    expect(zendesk.events_).toEqual([{ userId: 'u_1', type: 'signed_up', properties: {} }]);
    expect(zendesk.widgetSnippet({ identity: await zendesk.chatIdentity({ id: 'u_1' }) }).value).toContain('data-token="fake.u_1"');
    await expect(zendesk.tickets.get(ctx, 1)).rejects.toMatchObject({ code: 'not-found' });
  });
});
