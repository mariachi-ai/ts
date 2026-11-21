import { createContext } from '@mariachi/core';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { describe, expect, it } from 'vitest';
import { answersByRef } from './answers';
import { createTypeform } from './client';
import { TypeformError } from './errors';
import { settings } from './generated';
import { fakeTypeform, signedTypeformWebhook, typeformResponse } from './testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { TypeformWebhookBody, typeformEventType, typeformWebhookAuth } from './webhooks';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger });
const config = { token: 'tfp_test', webhookSecret: 'whsec-test' };
const noWait = { sleep: async () => {} };

describe('the client', () => {
  it('lists responses with the token and query, one span per call, and nothing sensitive on it', async () => {
    const fetch = scriptedFetch({ json: { total_items: 1, page_count: 1, items: [typeformResponse({ token: 't1' })] } });
    const tracer = new TestTracer();
    const page = await createTypeform(config, { fetch, tracer }).responses.list(ctx, { formId: 'abc', since: '2026-11-01T00:00:00Z' });
    expect(page.items.map((r) => r.token)).toEqual(['t1']);
    const [req] = fetch.requests;
    expect(req!.url.href).toBe('https://api.typeform.com/forms/abc/responses?since=2026-11-01T00%3A00%3A00Z');
    expect(req!.headers.authorization).toBe('Bearer tfp_test');
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([['typeform responses.list', 'client', 'api.typeform.com']]);
    assertProviderSpans(tracer.spans);
  });

  it("calls the EU data center when it's set", async () => {
    const fetch = scriptedFetch({ json: { id: 'abc', title: 'Signup', fields: [], hidden: [] } });
    await createTypeform({ ...config, apiBaseUrl: 'https://api.eu.typeform.com/' }, { fetch }).forms.get(ctx, 'abc');
    expect(fetch.requests[0]!.url.href).toBe('https://api.eu.typeform.com/forms/abc');
  });

  it('pages through every response, newest first, by the last token', async () => {
    const page = (tokens: string[]) => ({ json: { total_items: 3, page_count: 2, items: tokens.map((token) => typeformResponse({ token })) } });
    const fetch = scriptedFetch(page(['a', 'b']), page(['c']));
    const seen: string[] = [];
    for await (const r of createTypeform(config, { fetch }).responses.all(ctx, { formId: 'f', pageSize: 2 })) seen.push(r.token);
    expect(seen).toEqual(['a', 'b', 'c']);
    expect(fetch.requests[1]!.url.searchParams.get('before')).toBe('b');
  });

  it('makes the webhook with the secret, and refuses to without one', async () => {
    const fetch = scriptedFetch({ json: { id: 'w', form_id: 'f', tag: 'app', url: 'https://app.test/hooks/typeform', enabled: true } });
    await createTypeform(config, { fetch }).webhooks.put(ctx, { formId: 'f', tag: 'app', url: 'https://app.test/hooks/typeform' });
    expect(fetch.requests[0]!.json).toEqual({ url: 'https://app.test/hooks/typeform', enabled: true, secret: 'whsec-test', verify_ssl: true });
    await expect(createTypeform({ token: 'tfp_x' }).webhooks.put(ctx, { formId: 'f', tag: 'app', url: 'https://app.test/h' })).rejects.toMatchObject({ code: 'typeform/no-webhook-secret' });
  });

  it("fails as a TypeformError with Typeform's code, retrying only rate limits", async () => {
    const fetch = scriptedFetch({ status: 429, headers: { 'retry-after': '0' } }, { status: 404, json: { code: 'FORM_NOT_FOUND', description: 'nope' } });
    const err = await createTypeform(config, { fetch, ...noWait }).forms.get(ctx, 'gone').catch((e) => e);
    expect(err).toBeInstanceOf(TypeformError);
    expect([err.code, err.category, err.providerCode, fetch.requests.length]).toEqual(['typeform/not-found', 'not-found', 'FORM_NOT_FOUND', 2]);
    expect(err.message).not.toContain('nope');
  });

  it('checks its input before calling', async () => {
    await expect(createTypeform(config, { fetch: scriptedFetch() }).responses.list(ctx, { formId: '', pageSize: 5000 })).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });
});

describe('settings', () => {
  it('reads from the environment by name, and says where to find each', () => {
    expect(settingsFromEnv(settings, (n) => ({ TYPEFORM_TOKEN: 'tfp_1' })[n])).toEqual({ token: 'tfp_1' });
    expect(settings.every((s) => s.whereToFind)).toBe(true);
    expect(checkSetting(settings[0]!, 'test', 'tfp_1')).toBeNull();
  });
});

describe('webhooks', () => {
  const response = typeformResponse({ token: 'r1', hidden: { user_id: 'u1' }, answers: [{ field: { id: '1', type: 'email', ref: 'email' }, type: 'email', email: 'a@b.co' }] });

  class TypeformWebhooks extends WebhookController {
    readonly prefix = 'typeform';
    readonly auth = typeformWebhookAuth('whsec-test');
    init() {
      this.post('responses', { mode: 'direct', procedure: 'signups.fromTypeform', eventType: typeformEventType }, async (_ctx, body) => TypeformWebhookBody.parse(body));
    }
  }

  it('receives a signed delivery through WebhookServer, with its span, and reads its answers by ref', async () => {
    const received: unknown[] = [];
    const tracer = new TestTracer();
    const communication = { call: async (_ctx: unknown, _name: string, input: unknown) => { received.push(input); return { ok: true }; } } as never;
    const server = new WebhookServer({ name: 'webhooks', logger }, { communication, tracer }).registerController(new TypeformWebhooks());
    const { rawBody, headers } = signedTypeformWebhook('f1', response, 'whsec-test');
    const ok = await server.inject({ method: 'POST', url: '/typeform/responses', headers: { 'content-type': 'application/json', ...headers }, payload: rawBody });
    expect(ok.statusCode).toBe(200);
    const body = received[0] as ReturnType<typeof TypeformWebhookBody.parse>;
    expect([body.form_response.form_id, body.form_response.hidden?.user_id]).toEqual(['f1', 'u1']);
    expect(answersByRef(body.form_response)).toEqual({ email: 'a@b.co' });
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['mariachi.integration.event']])).toEqual([['typeform webhook', 'server', 'form_response']]);

    const forged = signedTypeformWebhook('f1', response, 'someone-else');
    expect((await server.inject({ method: 'POST', url: '/typeform/responses', headers: { 'content-type': 'application/json', ...forged.headers }, payload: forged.rawBody })).statusCode).toBe(401);
    expect((await server.inject({ method: 'POST', url: '/typeform/responses', headers: { 'content-type': 'application/json', ...headers }, payload: `${rawBody} ` })).statusCode).toBe(401);
    expect(received).toHaveLength(1);
  });
});

describe('answersByRef', () => {
  it('turns each kind of answer into a plain value', () => {
    expect(
      answersByRef({
        answers: [
          { field: { id: '1', type: 'short_text', ref: 'name' }, type: 'text', text: 'Ada' },
          { field: { id: '2', type: 'number', ref: 'seats' }, type: 'number', number: 4 },
          { field: { id: '3', type: 'yes_no', ref: 'agree' }, type: 'boolean', boolean: true },
          { field: { id: '4', type: 'multiple_choice', ref: 'plan' }, type: 'choice', choice: { label: 'Team' } },
          { field: { id: '5', type: 'multiple_choice', ref: 'tools' }, type: 'choices', choices: { labels: ['Slack'], other: 'Zulip' } },
        ],
      }),
    ).toEqual({ name: 'Ada', seats: 4, agree: true, plan: 'Team', tools: ['Slack', 'Zulip'] });
  });
});

describe('the fake', () => {
  it('stands in for the client in an app’s tests', async () => {
    const fake = fakeTypeform({ forms: [{ id: 'f', title: 'Signup', fields: [], hidden: [] }], responses: { f: [typeformResponse({ token: 'old', submitted_at: '2026-01-01T00:00:00Z' }), typeformResponse({ token: 'new' })] } });
    expect((await fake.responses.list(ctx, { formId: 'f' })).items.map((r) => r.token)).toEqual(['new', 'old']);
    await expect(fake.forms.get(ctx, 'nope')).rejects.toMatchObject({ code: 'not-found' });
  });
});
