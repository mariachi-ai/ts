import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { DEFAULT_PAGE_CSP } from '@mariachi/api-facade';
import { createContext } from '@mariachi/core';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { describe, expect, it } from 'vitest';
import { createCrisp } from './client';
import { CrispError } from './errors';
import { settings } from './generated';
import { crispWebhookEvent, fakeCrisp, signedCrispWebhook } from './testing';
import { CrispWebhookBody, crispEventType, crispWebhookAuth, crispWebsiteHookAuth } from './webhooks';
import { crispCsp } from './widget';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger });
const config = { websiteId: 'site-1', tokenIdentifier: 'tok-id', tokenKey: 'tok-key', identitySecret: 'identity-secret' };
const noWait = { sleep: async () => {} };
const ok = (data: unknown, status = 200) => ({ status, json: { error: false, reason: 'resolved', data } });
const notFound = { status: 404, json: { error: true, reason: 'people_not_found', data: { message: 'no such user a@b.co' } } };

describe('the client', () => {
  it('adds a profile that is missing, keeps the app id in its data, one span per call, nothing sensitive on them', async () => {
    const fetch = scriptedFetch(notFound, ok({ people_id: 'p-1' }, 201), ok({}));
    const tracer = new TestTracer();
    const result = await createCrisp(config, { fetch, tracer }).upsertContact(ctx, { id: 'u1', email: 'Ada@Example.com ', name: 'Ada', attributes: { plan: 'team' } });
    expect(result).toEqual({ id: 'p-1', created: true });
    const [get, create, data] = fetch.requests;
    expect([get!.method, get!.url.href]).toEqual(['GET', 'https://api.crisp.chat/v1/website/site-1/people/profile/ada%40example.com']);
    expect(get!.headers.authorization).toBe(`Basic ${Buffer.from('tok-id:tok-key').toString('base64')}`);
    expect(get!.headers['x-crisp-tier']).toBe('website');
    expect([create!.method, create!.url.pathname, create!.json]).toEqual(['POST', '/v1/website/site-1/people/profile', { email: 'ada@example.com', person: { nickname: 'Ada' } }]);
    expect([data!.method, data!.url.pathname, data!.json]).toEqual(['PATCH', '/v1/website/site-1/people/data/p-1', { data: { plan: 'team', user_id: 'u1' } }]);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([
      ['crisp people.get', 'client', 'api.crisp.chat'],
      ['crisp people.create', 'client', 'api.crisp.chat'],
      ['crisp people.updateData', 'client', 'api.crisp.chat'],
    ]);
    assertProviderSpans(tracer.spans);
  });

  it('updates a profile that exists, and reads it again when another request added it first', async () => {
    const found = ok({ people_id: 'p-2', email: 'ada@example.com', person: { nickname: 'A.' } });
    const existing = scriptedFetch(found, ok({}), ok({}));
    expect(await createCrisp(config, { fetch: existing }).upsertContact(ctx, { id: 'u1', email: 'ada@example.com', name: 'Ada' })).toEqual({ id: 'p-2', created: false });
    expect(existing.requests.map((r) => [r.method, r.url.pathname, r.json])).toEqual([
      ['GET', '/v1/website/site-1/people/profile/ada%40example.com', undefined],
      ['PATCH', '/v1/website/site-1/people/profile/p-2', { person: { nickname: 'Ada' } }],
      ['PATCH', '/v1/website/site-1/people/data/p-2', { data: { user_id: 'u1' } }],
    ]);

    const raced = scriptedFetch(notFound, { status: 409, json: { error: true, reason: 'people_exists', data: {} } }, found, ok({}));
    expect(await createCrisp(config, { fetch: raced }).upsertContact(ctx, { id: 'u1', email: 'ada@example.com' })).toEqual({ id: 'p-2', created: false });
  });

  it('needs an email to upsert, since Crisp keys profiles by it', async () => {
    const fetch = scriptedFetch();
    await expect(createCrisp(config, { fetch }).upsertContact(ctx, { id: 'u1' })).rejects.toMatchObject({ code: 'crisp/email-required', category: 'invalid-request' });
    expect(fetch.requests).toHaveLength(0);
  });

  it('tracks an event on the profile, by people_id or email', async () => {
    const fetch = scriptedFetch(ok({}, 201));
    await createCrisp(config, { fetch }).trackEvent(ctx, { userId: 'p-1', name: 'plan_upgraded', metadata: { plan: 'team', seats: 5 } });
    expect([fetch.requests[0]!.method, fetch.requests[0]!.url.pathname, fetch.requests[0]!.json]).toEqual(['POST', '/v1/website/site-1/people/events/p-1', { text: 'plan_upgraded', data: { plan: 'team', seats: 5 } }]);
  });

  it('lists, answers and resolves conversations', async () => {
    const fetch = scriptedFetch(ok([{ session_id: 'session_1', state: 'unresolved', is_verified: true }]), ok({ fingerprint: 42 }, 202), ok({}), ok({ email: 'ada@example.com', data: { user_id: 'u1' } }));
    const crisp = createCrisp(config, { fetch });
    const page = await crisp.conversations.list(ctx, { page: 2, notResolved: true, search: 'refund' });
    expect(page.map((c) => c.session_id)).toEqual(['session_1']);
    expect(fetch.requests[0]!.url.href).toBe('https://api.crisp.chat/v1/website/site-1/conversations/2?search_query=refund&search_type=text&filter_not_resolved=1');
    expect(await crisp.conversations.sendMessage(ctx, { sessionId: 'session_1', content: 'On it!', nickname: 'Support' })).toMatchObject({ fingerprint: 42 });
    expect(fetch.requests[1]!.json).toEqual({ type: 'text', from: 'operator', origin: 'chat', content: 'On it!', user: { nickname: 'Support' } });
    await crisp.conversations.resolve(ctx, 'session_1');
    expect([fetch.requests[2]!.method, fetch.requests[2]!.url.pathname, fetch.requests[2]!.json]).toEqual(['PATCH', '/v1/website/site-1/conversation/session_1/state', { state: 'resolved' }]);
    expect((await crisp.conversations.getMeta(ctx, 'session_1')).data).toEqual({ user_id: 'u1' });
  });

  it("fails as a CrispError with Crisp's reason, never its message, retrying only rate limits (429 and 420)", async () => {
    const fetch = scriptedFetch({ status: 429, headers: { 'retry-after': '0' } }, { status: 420, json: { error: true, reason: 'rate_limited', data: {} } }, notFound);
    const err = await createCrisp(config, { fetch, ...noWait }).people.get(ctx, 'a@b.co').catch((e) => e);
    expect(err).toBeInstanceOf(CrispError);
    expect([err.code, err.category, err.providerCode, fetch.requests.length]).toEqual(['crisp/not-found', 'not-found', 'people_not_found', 3]);
    expect(err.message).not.toContain('a@b.co');

    const bad = scriptedFetch({ status: 401, json: { error: true, reason: 'invalid_session', data: {} } }, { status: 400, json: { error: true, reason: 'invalid_data', data: {} } });
    const crisp = createCrisp(config, { fetch: bad });
    await expect(crisp.people.get(ctx, 'p-1')).rejects.toMatchObject({ code: 'crisp/invalid-token', category: 'unauthorized' });
    await expect(crisp.people.addEvent(ctx, { peopleId: 'p-1', text: 'x' })).rejects.toMatchObject({ code: 'crisp/invalid-data', category: 'invalid-request' });
  });

  it('sends a plugin token with its tier, and needs a token for the REST API', async () => {
    const fetch = scriptedFetch(ok({ people_id: 'p-1' }));
    await createCrisp({ ...config, tokenTier: 'plugin' }, { fetch }).people.get(ctx, 'p-1');
    expect(fetch.requests[0]!.headers['x-crisp-tier']).toBe('plugin');
    await expect(createCrisp({ websiteId: 'site-1' }).people.get(ctx, 'p-1')).rejects.toMatchObject({ code: 'crisp/no-token' });
    expect(() => createCrisp({ ...config, tokenTier: 'user' })).toThrow(expect.objectContaining({ code: 'crisp/invalid-token-tier' }));
  });

  it('checks its input before calling', async () => {
    const crisp = createCrisp(config, { fetch: scriptedFetch() });
    await expect(crisp.conversations.list(ctx, { perPage: 500 })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(crisp.people.addEvent(ctx, { peopleId: 'p', text: 'x', color: 'mauve' as never })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(crisp.people.get(ctx, '')).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });
});

describe('the chat widget', () => {
  const crisp = createCrisp(config);

  it("signs the user's email as Crisp's identity verification asks, and derives a session token only the server can", async () => {
    const identity = await crisp.chatIdentity({ id: 'u1', email: 'Ada@Example.com', name: 'Ada', createdAt: new Date('2026-01-02T03:04:05Z'), company: { id: 'c1', name: 'Acme' } });
    expect(identity).toMatchObject({ provider: 'crisp', userId: 'u1', email: 'ada@example.com', nickname: 'Ada', company: 'Acme', data: { user_id: 'u1', company_id: 'c1', signed_up_at: '2026-01-02T03:04:05.000Z' } });
    expect(identity.emailSignature).toBe(createHmac('sha256', 'identity-secret').update('ada@example.com').digest('hex'));
    expect(identity.tokenId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect((await crisp.chatIdentity({ id: 'u1' })).tokenId).toBe(identity.tokenId);
    expect((await crisp.chatIdentity({ id: 'u2' })).tokenId).not.toBe(identity.tokenId);
    expect((await createCrisp({ ...config, identitySecret: 'other' }).chatIdentity({ id: 'u1' })).tokenId).not.toBe(identity.tokenId);
    expect(await crisp.chatIdentity({ id: 'u3' })).not.toHaveProperty('email');
    await expect(createCrisp({ websiteId: 'site-1' }).chatIdentity({ id: 'u1' })).rejects.toMatchObject({ code: 'crisp/no-identity-secret' });
  });

  it('is one script tag, the loader, with the identity in escaped data attributes', async () => {
    const identity = await crisp.chatIdentity({ id: 'u1', email: 'ada@example.com', name: '<Ada> "the" Admin' });
    const tag = crisp.widgetSnippet({ identity, locale: 'fr' }).toString();
    expect(tag).toMatch(/^<script src="\/assets\/lib\/crisp\.js" data-website-id="site-1" data-token-id="[0-9a-f-]{36}" data-email="ada@example.com" data-email-signature="[0-9a-f]{64}"/);
    expect(tag).toContain('data-nickname="&lt;Ada&gt; &quot;the&quot; Admin"');
    expect(tag).toContain('data-session-data="{&quot;user_id&quot;:&quot;u1&quot;}"');
    expect(tag).toContain('data-locale="fr"');
    expect(tag.match(/<script/g)).toHaveLength(1);
    expect(crisp.widgetSnippet({ resetSession: true }).toString()).toBe('<script src="/assets/lib/crisp.js" data-website-id="site-1" data-reset defer></script>');
    expect(() => createCrisp({ websiteId: 'x" onload="alert(1)' })).toThrow(expect.objectContaining({ code: 'crisp/invalid-website-id' }));
  });

  it("widens the page's policy for Crisp's origins only, and still runs no inline script", () => {
    const csp = crispCsp();
    const directive = (name: string) => csp.split('; ').find((d) => d.startsWith(`${name} `));
    expect(directive('script-src')).toBe("script-src 'self' https://*.crisp.chat");
    expect(directive('connect-src')).toBe("connect-src 'self' https://*.crisp.chat wss://*.relay.crisp.chat wss://*.relay.rescue.crisp.chat");
    expect(directive('frame-src')).toBe("frame-src 'self' https://*.crisp.chat https://*.crisp.help");
    expect(directive('img-src')).toBe("img-src 'self' data: https://*.crisp.chat");
    expect(directive('frame-ancestors')).toBe("frame-ancestors 'none'");
    expect(csp.startsWith(DEFAULT_PAGE_CSP.split(';')[0]!)).toBe(true);
  });

  it("the loader sets the website, the session token and the verified email before Crisp's l.js, then loads it", async () => {
    const source = readFileSync(fileURLToPath(new URL('../browser/crisp.js', import.meta.url)), 'utf8');
    const run = (attributes: Record<string, string>) => {
      const window: Record<string, unknown> = {};
      const appended: Array<{ src?: string; async?: boolean }> = [];
      const currentScript = { getAttribute: (n: string) => attributes[n] ?? null, hasAttribute: (n: string) => n in attributes };
      const document = { currentScript, createElement: () => ({}), head: { appendChild: (el: { src?: string }) => appended.push(el) } };
      runInNewContext(source, { window, document });
      return { window, appended };
    };
    const identity = await crisp.chatIdentity({ id: 'u1', email: 'ada@example.com', name: 'Ada' });
    const { window, appended } = run({ 'data-website-id': 'site-1', 'data-token-id': identity.tokenId, 'data-email': identity.email!, 'data-email-signature': identity.emailSignature!, 'data-nickname': 'Ada', 'data-session-data': '{"user_id":"u1"}' });
    expect([window.CRISP_WEBSITE_ID, window.CRISP_TOKEN_ID]).toEqual(['site-1', identity.tokenId]);
    expect(JSON.parse(JSON.stringify(window.$crisp))).toEqual([
      ['set', 'user:email', ['ada@example.com', identity.emailSignature]],
      ['set', 'user:nickname', ['Ada']],
      ['set', 'session:data', [[['user_id', 'u1']]]],
    ]);
    expect(appended).toEqual([{ src: 'https://client.crisp.chat/l.js', async: true }]);

    const reset = run({ 'data-website-id': 'site-1', 'data-reset': '' });
    expect([reset.window.CRISP_TOKEN_ID, JSON.parse(JSON.stringify(reset.window.$crisp))]).toEqual([null, [['do', 'session:reset']]]);
    expect(run({ 'data-website-id': 'bad id' }).appended).toHaveLength(0);
  });
});

describe('settings', () => {
  it('reads from the environment by name, and says where to find each', () => {
    expect(settingsFromEnv(settings, (n) => ({ CRISP_WEBSITE_ID: 'site-1', CRISP_TOKEN_KEY: 'k' })[n])).toEqual({ websiteId: 'site-1', tokenKey: 'k' });
    expect(settings.every((s) => s.whereToFind && s.url)).toBe(true);
    expect(settings.find((s) => s.key === 'websiteId')?.public).toBe(true);
    expect(settings.filter((s) => s.secret).map((s) => s.env)).toEqual(['CRISP_TOKEN_KEY', 'CRISP_IDENTITY_SECRET', 'CRISP_WEBHOOK_SECRET']);
    expect(checkSetting(settings[0]!, 'production', 'site-1')).toBeNull();
  });
});

describe('web hooks', () => {
  const message = crispWebhookEvent('message:send', { session_id: 'session_1', type: 'text', from: 'user', origin: 'chat', content: 'Hello', fingerprint: 163239614 });
  const json = { 'content-type': 'application/json' };

  function server(auth: ReturnType<typeof crispWebhookAuth> | ReturnType<typeof crispWebsiteHookAuth>) {
    class CrispWebhooks extends WebhookController {
      readonly prefix = 'crisp';
      readonly auth = auth;
      init() {
        this.post('events', { mode: 'direct', procedure: 'support.fromCrisp', eventType: crispEventType }, async (_ctx, body) => CrispWebhookBody.parse(body));
      }
    }
    const received: unknown[] = [];
    const tracer = new TestTracer();
    const communication = { call: async (_ctx: unknown, _name: string, input: unknown) => { received.push(input); return { ok: true }; } } as never;
    return { received, tracer, server: new WebhookServer({ name: 'webhooks', logger }, { communication, tracer }).registerController(new CrispWebhooks()) };
  }

  it("receives a plugin's signed hook through WebhookServer, with its span, and refuses a forged or altered one", async () => {
    const { received, tracer, server: s } = server(crispWebhookAuth('plugin-secret'));
    const { rawBody, headers } = signedCrispWebhook(message, 'plugin-secret');
    expect((await s.inject({ method: 'POST', url: '/crisp/events', headers: { ...json, ...headers }, payload: rawBody })).statusCode).toBe(200);
    const body = received[0] as CrispWebhookBody;
    expect([body.event, body.data.content]).toEqual(['message:send', 'Hello']);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['mariachi.integration.event']])).toEqual([['crisp webhook', 'server', 'message:send']]);

    const forged = signedCrispWebhook(message, 'someone-else');
    expect((await s.inject({ method: 'POST', url: '/crisp/events', headers: { ...json, ...forged.headers }, payload: forged.rawBody })).statusCode).toBe(401);
    const altered = rawBody.replace('Hello', 'Hullo');
    expect((await s.inject({ method: 'POST', url: '/crisp/events', headers: { ...json, ...headers }, payload: altered })).statusCode).toBe(401);
    const otherTime = { ...headers, 'x-crisp-request-timestamp': String(Number(headers['x-crisp-request-timestamp']) + 1) };
    expect((await s.inject({ method: 'POST', url: '/crisp/events', headers: { ...json, ...otherTime }, payload: rawBody })).statusCode).toBe(401);
    expect(received).toHaveLength(1);
  });

  it('accepts the body as Crisp signs it (JSON.stringify of it), however it was spaced on the wire, under either secret while rotating', async () => {
    const { received, server: s } = server(crispWebhookAuth(['new-secret', 'old-secret']));
    const { headers } = signedCrispWebhook(message, 'old-secret');
    const spaced = JSON.stringify(message, null, 2);
    expect((await s.inject({ method: 'POST', url: '/crisp/events', headers: { ...json, ...headers }, payload: spaced })).statusCode).toBe(200);
    expect(received).toHaveLength(1);
  });

  it('refuses a stale delivery when a tolerance is set', async () => {
    const { server: s } = server(crispWebhookAuth('plugin-secret', { toleranceSeconds: 300 }));
    const fresh = signedCrispWebhook(message, 'plugin-secret');
    const stale = signedCrispWebhook(message, 'plugin-secret', Date.now() - 3_600_000);
    expect((await s.inject({ method: 'POST', url: '/crisp/events', headers: { ...json, ...fresh.headers }, payload: fresh.rawBody })).statusCode).toBe(200);
    expect((await s.inject({ method: 'POST', url: '/crisp/events', headers: { ...json, ...stale.headers }, payload: stale.rawBody })).statusCode).toBe(401);
  });

  it("checks a website hook's key in its URL, since Crisp doesn't sign those", async () => {
    const key = 'k'.repeat(32);
    const { received, server: s } = server(crispWebsiteHookAuth(key));
    const payload = JSON.stringify(message);
    expect((await s.inject({ method: 'POST', url: `/crisp/events?key=${key}`, headers: json, payload })).statusCode).toBe(200);
    expect((await s.inject({ method: 'POST', url: '/crisp/events?key=wrong', headers: json, payload })).statusCode).toBe(401);
    expect((await s.inject({ method: 'POST', url: '/crisp/events', headers: json, payload })).statusCode).toBe(401);
    expect(received).toHaveLength(1);
    expect(() => crispWebsiteHookAuth('short')).toThrow(expect.objectContaining({ code: 'webhooks/invalid-secret' }));
  });
});

describe('the fake', () => {
  it('stands in for the client in an app’s tests', async () => {
    const fake = fakeCrisp({ conversations: [{ session_id: 's1', state: 'unresolved' }] });
    const { id, created } = await fake.upsertContact(ctx, { id: 'u1', email: 'ada@example.com', name: 'Ada' });
    expect(created).toBe(true);
    expect((await fake.upsertContact(ctx, { id: 'u1', email: 'ada@example.com' })).created).toBe(false);
    await fake.trackEvent(ctx, { userId: 'ada@example.com', name: 'signed_up' });
    expect(fake.events_).toEqual([{ peopleId: id, text: 'signed_up', data: undefined, color: undefined }]);
    expect(fake.profiles_.get(id)?.data).toEqual({ user_id: 'u1' });
    await fake.conversations.sendMessage(ctx, { sessionId: 's1', content: 'Hi' });
    await fake.conversations.resolve(ctx, 's1');
    expect([fake.messages_.length, fake.conversations_.get('s1')?.state]).toEqual([1, 'resolved']);
    await expect(fake.people.get(ctx, 'nobody@example.com')).rejects.toMatchObject({ category: 'not-found' });
    expect((await fake.chatIdentity({ id: 'u1', email: 'ada@example.com' })).emailSignature).toMatch(/^[0-9a-f]{64}$/);
  });
});
