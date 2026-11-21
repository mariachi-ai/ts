import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { InMemoryIdempotencyStore, type Context } from '@mariachi/core';
import { GitHubWebhookAuth, HmacWebhookAuth, StandardWebhookAuth, StripeWebhookAuth, VerifiedWebhookAuth, WebhookController, WebhookServer, type AuthController, type VerifiedWebhookAuthOptions, type WebhookHeaders } from '../index';
import { parseStandardWebhookSecrets, signStandardWebhook, signStripeWebhook, verifyGitHubWebhook, verifyHmacSignature, verifyStandardWebhook, verifyStripeWebhook } from './index';

const silent = { info() {}, warn() {}, error() {}, debug() {}, child() { return silent; } };
const invalid = expect.objectContaining({ code: 'webhooks/invalid-signature' });
const now = 1_800_000_000;
const body = '{"id":"evt_1","type":"invoice.paid","amount":1200}';
const hex = (secret: string, text: string | Buffer, algorithm = 'sha256') => createHmac(algorithm, secret).update(text).digest('hex');

describe('verifyHmacSignature', () => {
  it('accepts the exact bytes and refuses anything else', () => {
    const signature = `sha256=${hex('s3cret', body)}`;
    expect(() => verifyHmacSignature(body, signature, 's3cret', { prefix: 'sha256=' })).not.toThrow();
    expect(() => verifyHmacSignature(Buffer.from(body), signature, 's3cret', { prefix: 'sha256=' })).not.toThrow();
    // The same JSON, re-serialised: a different byte sequence, so a different signature.
    expect(() => verifyHmacSignature(JSON.stringify(JSON.parse(body), null, 1), signature, 's3cret', { prefix: 'sha256=' })).toThrow(invalid);
    expect(() => verifyHmacSignature(body, signature, 'other', { prefix: 'sha256=' })).toThrow(invalid);
    expect(() => verifyHmacSignature(body, signature.slice(0, -2), 's3cret', { prefix: 'sha256=' })).toThrow(invalid);
    expect(() => verifyHmacSignature(body, hex('s3cret', body), 's3cret', { prefix: 'sha256=' })).toThrow(invalid);
    expect(() => verifyHmacSignature(body, undefined, 's3cret')).toThrow(invalid);
    expect(() => verifyHmacSignature(body, 'sha256=not-hex', 's3cret', { prefix: 'sha256=' })).toThrow(invalid);
  });

  it('gives one dedup key to every spelling of the same signature', () => {
    const mac = createHmac('sha256', 'shop').update(body).digest();
    const padded = mac.toString('base64');
    expect(padded.endsWith('=')).toBe(true);
    const unpadded = padded.replace(/=+$/, '');
    // The last character of a padded base64 string carries bits the decoder ignores: bump it and the bytes are the same.
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const stray = `${unpadded.slice(0, -1)}${alphabet[alphabet.indexOf(unpadded.slice(-1)) + 1]}=`;
    expect(Buffer.from(stray, 'base64').equals(mac)).toBe(true);
    const keys = [padded, unpadded, stray].map((signature) => verifyHmacSignature(body, signature, 'shop', { encoding: 'base64' }).eventId);
    expect(new Set(keys).size).toBe(1);

    const lower = mac.toString('hex');
    expect(verifyHmacSignature(body, lower.toUpperCase(), 'shop').eventId).toBe(verifyHmacSignature(body, lower, 'shop').eventId);
    expect(verifyHmacSignature(body, lower, 'shop').eventId).toBe(keys[0]);
  });

  it('accepts either secret during a rotation, and base64 or sha1 signatures', () => {
    expect(() => verifyHmacSignature(body, hex('old', body), ['new', 'old'])).not.toThrow();
    expect(() => verifyHmacSignature(body, hex('gone', body), ['new', 'old'])).toThrow(invalid);
    const base64 = createHmac('sha256', 'shop').update(body).digest('base64');
    expect(() => verifyHmacSignature(body, base64, 'shop', { encoding: 'base64' })).not.toThrow();
    expect(() => verifyHmacSignature(body, hex('k', body, 'sha1'), 'k', { algorithm: 'sha1' })).not.toThrow();
    expect(() => verifyHmacSignature(body, hex('k', body), [])).toThrow(expect.objectContaining({ code: 'webhooks/invalid-secret' }));
  });
});

describe('verifyGitHubWebhook', () => {
  it('checks X-Hub-Signature-256 and returns the delivery id and event', () => {
    const headers = { 'X-Hub-Signature-256': `sha256=${hex('gh', body)}`, 'X-GitHub-Delivery': 'd-1', 'X-GitHub-Event': 'push' };
    const verified = verifyGitHubWebhook(body, headers, 'gh');
    expect(verified).toMatchObject({ deliveryId: 'd-1', event: 'push' });
    // The dedup key comes from the signature, not from the delivery id, which GitHub doesn't sign.
    expect(verified.eventId).toMatch(/^sig:[0-9a-f]{64}$/);
    expect(verifyGitHubWebhook(body, { ...headers, 'X-GitHub-Delivery': 'd-2' }, 'gh').eventId).toBe(verified.eventId);
    expect(verifyGitHubWebhook(body, { ...headers, 'X-Hub-Signature-256': headers['X-Hub-Signature-256'].toUpperCase().replace('SHA256=', 'sha256=') }, 'gh').eventId).toBe(verified.eventId);
    const otherBody = body.replace('1200', '1300');
    expect(verifyGitHubWebhook(otherBody, { ...headers, 'X-Hub-Signature-256': `sha256=${hex('gh', otherBody)}` }, 'gh').eventId).not.toBe(verified.eventId);
    expect(() => verifyGitHubWebhook(`${body} `, headers, 'gh')).toThrow(invalid);
    expect(() => verifyGitHubWebhook(body, { 'x-github-delivery': 'd-1' }, 'gh')).toThrow(invalid);
  });
});

describe('verifyStandardWebhook', () => {
  const secret = `whsec_${Buffer.from('0123456789abcdef0123456789abcdef').toString('base64')}`;
  const [key] = parseStandardWebhookSecrets(secret);
  const headers = (id = 'msg_1', timestamp = now, payload = body, signingKey = key) => ({
    'webhook-id': id,
    'webhook-timestamp': String(timestamp),
    'webhook-signature': signStandardWebhook(signingKey, id, timestamp, payload),
  });

  it('accepts a signed delivery and returns its id', () => {
    expect(verifyStandardWebhook(body, headers(), secret, { nowSeconds: now })).toEqual({ eventId: 'msg_1', timestampSeconds: now });
    expect(verifyStandardWebhook(Buffer.from(body), headers(), `v1,${secret}`, { nowSeconds: now }).eventId).toBe('msg_1');
  });

  it("reads Svix's header names", () => {
    const h = headers();
    const svix = { 'svix-id': h['webhook-id'], 'svix-timestamp': h['webhook-timestamp'], 'svix-signature': h['webhook-signature'] };
    expect(verifyStandardWebhook(body, svix, secret, { nowSeconds: now }).eventId).toBe('msg_1');
  });

  it('refuses a changed body, id or timestamp, and a stale delivery', () => {
    expect(() => verifyStandardWebhook(`${body}\n`, headers(), secret, { nowSeconds: now })).toThrow(invalid);
    expect(() => verifyStandardWebhook(body, { ...headers(), 'webhook-id': 'msg_2' }, secret, { nowSeconds: now })).toThrow(invalid);
    expect(() => verifyStandardWebhook(body, { ...headers(), 'webhook-timestamp': String(now + 1) }, secret, { nowSeconds: now })).toThrow(invalid);
    expect(() => verifyStandardWebhook(body, headers('msg_1', now - 301), secret, { nowSeconds: now })).toThrow(invalid);
    expect(() => verifyStandardWebhook(body, headers('msg_1', now + 301), secret, { nowSeconds: now })).toThrow(invalid);
    expect(verifyStandardWebhook(body, headers('msg_1', now - 300), secret, { nowSeconds: now }).eventId).toBe('msg_1');
    expect(verifyStandardWebhook(body, headers('msg_1', now - 600), secret, { nowSeconds: now, toleranceSeconds: 900 }).eventId).toBe('msg_1');
    expect(() => verifyStandardWebhook(body, { 'webhook-id': 'msg_1' }, secret, { nowSeconds: now })).toThrow(invalid);
  });

  it('accepts any of several signatures and any of several secrets', () => {
    const other = `whsec_${Buffer.from('fedcba9876543210fedcba9876543210').toString('base64')}`;
    const [otherKey] = parseStandardWebhookSecrets(other);
    const h = headers();
    const both = { ...h, 'webhook-signature': `${signStandardWebhook(otherKey, 'msg_1', now, body)} ${h['webhook-signature']} v2,ignored` };
    expect(verifyStandardWebhook(body, both, secret, { nowSeconds: now }).eventId).toBe('msg_1');
    expect(verifyStandardWebhook(body, headers(), `${other}|${secret}`, { nowSeconds: now }).eventId).toBe('msg_1');
    expect(verifyStandardWebhook(body, headers(), [other, secret], { nowSeconds: now }).eventId).toBe('msg_1');
    expect(() => verifyStandardWebhook(body, headers(), other, { nowSeconds: now })).toThrow(invalid);
  });

  it('refuses a secret that is not a key', () => {
    expect(() => parseStandardWebhookSecrets('')).toThrow(expect.objectContaining({ code: 'webhooks/invalid-secret' }));
    expect(() => parseStandardWebhookSecrets('whsec_not base64!')).toThrow(expect.objectContaining({ code: 'webhooks/invalid-secret' }));
    expect(() => parseStandardWebhookSecrets('whsec_c2hvcnQ=')).toThrow(/shorter than 16 bytes/);
  });
});

describe('verifyStripeWebhook', () => {
  it('accepts a signed delivery and takes the event id from the body', () => {
    const headers = { 'Stripe-Signature': signStripeWebhook('whsec_live', now, body) };
    expect(verifyStripeWebhook(body, headers, 'whsec_live', { nowSeconds: now })).toEqual({ eventId: 'evt_1', timestampSeconds: now });
    // A signed body with no id of its own is keyed on the signature that matched, so a replay is still a duplicate.
    const plain = verifyStripeWebhook('not json', { 'stripe-signature': signStripeWebhook('k', now, 'not json') }, 'k', { nowSeconds: now });
    expect(plain.eventId).toMatch(/^sig:[0-9a-f]{64}$/);
    expect(verifyStripeWebhook('not json', { 'stripe-signature': signStripeWebhook('k', now, 'not json') }, 'k', { nowSeconds: now }).eventId).toBe(plain.eventId);
    expect(verifyStripeWebhook('other text', { 'stripe-signature': signStripeWebhook('k', now, 'other text') }, 'k', { nowSeconds: now }).eventId).not.toBe(plain.eventId);
    expect(verifyStripeWebhook('{"no":"id"}', { 'stripe-signature': signStripeWebhook('k', now, '{"no":"id"}') }, 'k', { nowSeconds: now }).eventId).toMatch(/^sig:/);
  });

  it('checks the signature over the timestamp exactly as it was sent', () => {
    // A sender that writes its timestamp with a leading zero signed those characters.
    const text = `0${now}`;
    const stripeStyle = `t=${text},v1=${createHmac('sha256', 'k').update(`${text}.${body}`).digest('hex')}`;
    expect(verifyStripeWebhook(body, { 'stripe-signature': stripeStyle }, 'k', { nowSeconds: now })).toEqual({ eventId: 'evt_1', timestampSeconds: now });

    const secret = `whsec_${Buffer.from('0123456789abcdef0123456789abcdef').toString('base64')}`;
    const [key] = parseStandardWebhookSecrets(secret);
    const signature = `v1,${createHmac('sha256', key).update(`msg_1.${text}.${body}`).digest('base64')}`;
    const headers = { 'webhook-id': 'msg_1', 'webhook-timestamp': text, 'webhook-signature': signature };
    expect(verifyStandardWebhook(body, headers, secret, { nowSeconds: now })).toEqual({ eventId: 'msg_1', timestampSeconds: now });
    // And the parsed number is not accepted in its place.
    expect(() => verifyStandardWebhook(body, { ...headers, 'webhook-timestamp': String(now) }, secret, { nowSeconds: now })).toThrow(invalid);
  });

  it('refuses a changed body or timestamp, a stale delivery and a wrong secret', () => {
    const signature = signStripeWebhook('whsec_live', now, body);
    expect(() => verifyStripeWebhook(body.replace('1200', '9900'), { 'stripe-signature': signature }, 'whsec_live', { nowSeconds: now })).toThrow(invalid);
    expect(() => verifyStripeWebhook(body, { 'stripe-signature': signature.replace(`t=${now}`, `t=${now + 5}`) }, 'whsec_live', { nowSeconds: now })).toThrow(invalid);
    expect(() => verifyStripeWebhook(body, { 'stripe-signature': signature }, 'whsec_live', { nowSeconds: now + 301 })).toThrow(invalid);
    expect(() => verifyStripeWebhook(body, { 'stripe-signature': signature }, 'whsec_other', { nowSeconds: now })).toThrow(invalid);
    expect(() => verifyStripeWebhook(body, {}, 'whsec_live', { nowSeconds: now })).toThrow(invalid);
    expect(() => verifyStripeWebhook(body, { 'stripe-signature': `t=${now},v0=abcd` }, 'whsec_live', { nowSeconds: now })).toThrow(invalid);
  });

  it('accepts several v1 signatures, several secrets, and another header name', () => {
    const fresh = signStripeWebhook('new', now, body);
    const stale = signStripeWebhook('old', now, body).split(',')[1];
    expect(verifyStripeWebhook(body, { 'stripe-signature': `${fresh},${stale}` }, 'old', { nowSeconds: now }).eventId).toBe('evt_1');
    expect(verifyStripeWebhook(body, { 'stripe-signature': fresh }, ['old', 'new'], { nowSeconds: now }).eventId).toBe('evt_1');
    expect(verifyStripeWebhook(body, { 'x-acme-signature': fresh }, 'new', { nowSeconds: now, header: 'x-acme-signature', provider: 'Acme' }).eventId).toBe('evt_1');
  });
});

describe('webhook authenticators on WebhookServer', () => {
  it('a scheme of its own: a subclass whose check is async, deduplicated on what it returns', async () => {
    class AsyncAuth extends VerifiedWebhookAuth {
      constructor(options: VerifiedWebhookAuthOptions) {
        super(options, 'async');
      }
      protected async verify(raw: Buffer, headers: WebhookHeaders, secret: string | string[]) {
        await new Promise((resolve) => setTimeout(resolve, 1));
        const ok = [secret].flat().some((s) => headers['x-async-signature'] === hex(s, raw));
        if (!ok) return verifyHmacSignature(raw, undefined, secret, { provider: 'async' });
        return { eventId: (JSON.parse(raw.toString('utf8')) as { id: string }).id, metadata: { checked: true } };
      }
    }
    const { calls, post } = serverFor('async', new AsyncAuth({ secret: 'k' }));
    expect((await post({ 'x-async-signature': hex('k', body) })).statusCode).toBeLessThan(300);
    expect((await post({ 'x-async-signature': hex('k', body) })).json()).toMatchObject({ duplicate: true });
    expect((await post({ 'x-async-signature': hex('other', body) })).statusCode).toBe(401);
    expect(calls).toHaveLength(1);
  });

  function serverFor(prefix: string, auth: AuthController) {
    const calls: Array<{ ctx: Context; input: unknown }> = [];
    class Controller extends WebhookController {
      readonly prefix = prefix;
      readonly auth = auth;
      init() {
        this.post(':tenant/events', { mode: 'direct', procedure: `${prefix}.event` }, async (_ctx, input) => input);
      }
    }
    const communication = { call: async (ctx: Context, _name: string, input: unknown) => { calls.push({ ctx, input }); return { ok: true }; } } as never;
    const server = new WebhookServer({ name: 'webhooks', logger: silent }, { communication, idempotency: new InMemoryIdempotencyStore() }).registerController(new Controller());
    const post = (headers: Record<string, string>, payload = body) =>
      server.inject({ method: 'POST', url: `/${prefix}/t42/events`, headers: { 'content-type': 'application/json', ...headers }, payload });
    return { calls, post };
  }
  const tenantFromPath = (req: { params: Record<string, string> }) => req.params.tenant;

  it('GitHub: verifies, and a replay under a new delivery id is still a duplicate', async () => {
    const { calls, post } = serverFor('github', new GitHubWebhookAuth({ secret: 'gh' }));
    const headers = { 'x-hub-signature-256': `sha256=${hex('gh', body)}`, 'x-github-delivery': 'd-1', 'x-github-event': 'push' };
    expect((await post(headers)).statusCode).toBeLessThan(300);
    expect((await post(headers)).json()).toMatchObject({ duplicate: true });
    // The delivery id isn't signed, so whoever replays a captured delivery can change it.
    expect((await post({ ...headers, 'x-github-delivery': 'd-2' })).json()).toMatchObject({ duplicate: true });
    expect(calls).toHaveLength(1);
    expect(calls[0].ctx.tenantId).toBeNull();
    expect((await post({ ...headers, 'x-hub-signature-256': `sha256=${hex('wrong', body)}` })).statusCode).toBe(401);
    expect((await post(headers, `${body} `)).statusCode).toBe(401);
  });

  it('refuses a tenant from the request unless each tenant has its own secret', () => {
    expect(() => new GitHubWebhookAuth({ secret: 'shared', tenantFromRequest: tenantFromPath })).toThrow(expect.objectContaining({ code: 'webhooks/unauthenticated-tenant' }));
    expect(() => new StripeWebhookAuth({ secret: async () => 'x' })).toThrow(expect.objectContaining({ code: 'webhooks/invalid-secret' }));
  });

  it("per-tenant secrets: a delivery only counts for the tenant whose secret signed it", async () => {
    const secrets: Record<string, string> = { t42: 'secret-42', t99: 'secret-99' };
    const auth = new GitHubWebhookAuth({ secret: async (tenantId) => secrets[tenantId], tenantFromRequest: tenantFromPath });
    const calls: Array<{ ctx: Context }> = [];
    class Controller extends WebhookController {
      readonly prefix = 'gh';
      readonly auth = auth;
      init() {
        this.post(':tenant/events', { mode: 'direct', procedure: 'gh.event' }, async (_ctx, input) => input);
      }
    }
    const communication = { call: async (ctx: Context) => { calls.push({ ctx }); return { ok: true }; } } as never;
    const server = new WebhookServer({ name: 'webhooks', logger: silent }, { communication, idempotency: new InMemoryIdempotencyStore() }).registerController(new Controller());
    const post = (tenant: string, secret: string) =>
      server.inject({ method: 'POST', url: `/gh/${tenant}/events`, headers: { 'content-type': 'application/json', 'x-hub-signature-256': `sha256=${hex(secret, body)}` }, payload: body });

    expect((await post('t42', 'secret-42')).statusCode).toBeLessThan(300);
    expect(calls.map((call) => call.ctx.tenantId)).toEqual(['t42']);
    // Tenant 42's valid delivery, posted to tenant 99's path: not theirs.
    expect((await post('t99', 'secret-42')).statusCode).toBe(401);
    // A tenant with no secret is refused.
    expect((await post('t7', 'secret-42')).statusCode).toBe(401);
    // The same body for another tenant is that tenant's own delivery, not a duplicate of the first.
    expect((await post('t99', 'secret-99')).json()).not.toMatchObject({ duplicate: true });
    expect(calls.map((call) => call.ctx.tenantId)).toEqual(['t42', 't99']);
  });

  it('shared secret: the tenant comes from the signed body, whatever path it was posted to', async () => {
    const auth = new StripeWebhookAuth({ secret: 'whsec_live', tenantFromPayload: (payload) => (payload as { account?: string } | undefined)?.account });
    const { calls, post } = serverFor('stripe-connect', auth);
    const signed = '{"id":"evt_7","account":"acct_real"}';
    const headers = { 'stripe-signature': signStripeWebhook('whsec_live', Math.floor(Date.now() / 1000), signed) };
    // The route's path says t42; the body, which the signature covers, says acct_real.
    expect((await post(headers, signed)).statusCode).toBeLessThan(300);
    expect(calls[0].ctx.tenantId).toBe('acct_real');
  });

  it('Stripe: deduplicates on the id inside the signed body', async () => {
    const { calls, post } = serverFor('stripe', new StripeWebhookAuth({ secret: 'whsec_live' }));
    const live = () => ({ 'stripe-signature': signStripeWebhook('whsec_live', Math.floor(Date.now() / 1000), body) });
    expect((await post(live())).statusCode).toBeLessThan(300);
    expect((await post(live())).json()).toMatchObject({ duplicate: true });
    expect(calls).toHaveLength(1);
    const old = { 'stripe-signature': signStripeWebhook('whsec_live', Math.floor(Date.now() / 1000) - 3600, body) };
    expect((await post(old)).statusCode).toBe(401);
  });

  it('Standard Webhooks: verifies and deduplicates on webhook-id', async () => {
    const secret = `whsec_${Buffer.from('0123456789abcdef0123456789abcdef').toString('base64')}`;
    const [key] = parseStandardWebhookSecrets(secret);
    const { calls, post } = serverFor('svix', new StandardWebhookAuth({ secret }));
    const timestamp = Math.floor(Date.now() / 1000);
    const headers = { 'webhook-id': 'msg_9', 'webhook-timestamp': String(timestamp), 'webhook-signature': signStandardWebhook(key, 'msg_9', timestamp, body) };
    expect((await post(headers)).statusCode).toBeLessThan(300);
    expect((await post(headers)).json()).toMatchObject({ duplicate: true });
    expect(calls).toHaveLength(1);
    expect((await post({ ...headers, 'webhook-id': 'msg_10' })).statusCode).toBe(401);
  });

  it('HMAC: a sender with its own header', async () => {
    const auth = new HmacWebhookAuth({ provider: 'acme', secret: ['new', 'old'], header: 'x-acme-signature', deliveryIdHeader: 'x-acme-delivery', encoding: 'base64' });
    const { calls, post } = serverFor('acme', auth);
    const headers = { 'x-acme-signature': createHmac('sha256', 'old').update(body).digest('base64'), 'x-acme-delivery': 'a-1' };
    expect((await post(headers)).statusCode).toBeLessThan(300);
    expect((await post(headers)).json()).toMatchObject({ duplicate: true });
    expect((await post({ ...headers, 'x-acme-delivery': 'a-2' })).json()).toMatchObject({ duplicate: true });
    expect(calls).toHaveLength(1);
    expect((await post({ 'x-acme-delivery': 'a-3' })).statusCode).toBe(401);
  });

  it('refuses to be built without a secret', () => {
    expect(() => new GitHubWebhookAuth({ secret: '' })).toThrow(expect.objectContaining({ code: 'webhooks/invalid-secret' }));
    expect(() => new StripeWebhookAuth({ secret: [] })).toThrow(expect.objectContaining({ code: 'webhooks/invalid-secret' }));
    expect(() => new StandardWebhookAuth({ secret: '' })).toThrow(expect.objectContaining({ code: 'webhooks/invalid-secret' }));
  });
});
