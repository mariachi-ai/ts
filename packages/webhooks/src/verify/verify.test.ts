import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { InMemoryIdempotencyStore, type Context } from '@mariachi/core';
import { GitHubWebhookAuth, HmacWebhookAuth, StandardWebhookAuth, StripeWebhookAuth, WebhookController, WebhookServer, type AuthController } from '../index';
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
    expect(verifyGitHubWebhook(body, headers, 'gh')).toEqual({ eventId: 'd-1', event: 'push' });
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
    expect(verifyStripeWebhook('not json', { 'stripe-signature': signStripeWebhook('k', now, 'not json') }, 'k', { nowSeconds: now })).toEqual({ timestampSeconds: now });
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
  const tenant = (req: { params: Record<string, string> }) => req.params.tenant;

  it('GitHub: verifies, carries the tenant, and skips a repeated delivery', async () => {
    const { calls, post } = serverFor('github', new GitHubWebhookAuth({ secret: 'gh', resolveTenant: tenant }));
    const headers = { 'x-hub-signature-256': `sha256=${hex('gh', body)}`, 'x-github-delivery': 'd-1', 'x-github-event': 'push' };
    expect((await post(headers)).statusCode).toBeLessThan(300);
    expect((await post(headers)).json()).toMatchObject({ duplicate: true });
    expect(calls).toHaveLength(1);
    expect(calls[0].ctx.tenantId).toBe('t42');
    expect((await post({ ...headers, 'x-hub-signature-256': `sha256=${hex('wrong', body)}` })).statusCode).toBe(401);
    expect((await post(headers, `${body} `)).statusCode).toBe(401);
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
    const auth = new HmacWebhookAuth({ provider: 'acme', secret: ['new', 'old'], header: 'x-acme-signature', eventIdHeader: 'x-acme-delivery', encoding: 'base64' });
    const { calls, post } = serverFor('acme', auth);
    const headers = { 'x-acme-signature': createHmac('sha256', 'old').update(body).digest('base64'), 'x-acme-delivery': 'a-1' };
    expect((await post(headers)).statusCode).toBeLessThan(300);
    expect((await post(headers)).json()).toMatchObject({ duplicate: true });
    expect(calls).toHaveLength(1);
    expect((await post({ 'x-acme-delivery': 'a-2' })).statusCode).toBe(401);
  });

  it('refuses to be built without a secret', () => {
    expect(() => new GitHubWebhookAuth({ secret: '' })).toThrow(expect.objectContaining({ code: 'webhooks/invalid-secret' }));
    expect(() => new StripeWebhookAuth({ secret: [] })).toThrow(expect.objectContaining({ code: 'webhooks/invalid-secret' }));
    expect(() => new StandardWebhookAuth({ secret: '' })).toThrow(expect.objectContaining({ code: 'webhooks/invalid-secret' }));
  });
});
