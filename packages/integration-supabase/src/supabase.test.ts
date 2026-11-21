import { createContext } from '@mariachi/core';
import { settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createSupabase } from './client';
import { SupabaseError } from './errors';
import { settings } from './generated';
import { supabaseAuthConfig, supabaseDatabaseConfig, supabaseStorageConfig } from './ports';
import { SendEmailHookBody } from './schemas';
import { fakeSupabase, signedSupabaseAuthHook, supabaseUser } from './testing';
import { supabaseAuthHookAuth, supabaseAuthHookType } from './webhooks';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger });
const URL_ = 'https://abcdefghijklmnopqrst.supabase.co';
const config = { url: URL_, secretKey: 'sb_secret_abc', publishableKey: 'sb_publishable_xyz' };
const LEGACY_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.c2ln';
const ADA = '0b9d4c53-8f0a-4d0e-9a63-5c2f1e7b3a41';
const noWait = { sleep: async () => {} };

describe('functions.invoke', () => {
  it('posts the body with the secret key on apikey only, one span, nothing sensitive on it', async () => {
    const fetch = scriptedFetch({ json: { resized: true } });
    const tracer = new TestTracer();
    const out = await createSupabase(config, { fetch, tracer }).functions.invoke(ctx, { name: 'resize-image', body: { path: 'a.png' } }, z.object({ resized: z.boolean() }));
    expect(out).toEqual({ resized: true });
    const [req] = fetch.requests;
    expect([req!.method, req!.url.href, req!.json]).toEqual(['POST', `${URL_}/functions/v1/resize-image`, { path: 'a.png' }]);
    expect(req!.headers.apikey).toBe('sb_secret_abc');
    expect(req!.headers.authorization).toBeUndefined();
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([['supabase functions.invoke', 'client', 'abcdefghijklmnopqrst.supabase.co']]);
    assertProviderSpans(tracer.spans);
  });

  it("calls for a signed-in user with their token and the publishable key, and refuses to without that key", async () => {
    const fetch = scriptedFetch({ json: {} });
    await createSupabase(config, { fetch }).functions.invoke(ctx, { name: 'me', accessToken: 'user.jwt.token' });
    expect(fetch.requests[0]!.headers).toMatchObject({ apikey: 'sb_publishable_xyz', authorization: 'Bearer user.jwt.token' });
    await expect(createSupabase({ url: URL_, secretKey: 'sb_secret_abc' }, { fetch }).functions.invoke(ctx, { name: 'me', accessToken: 't' })).rejects.toMatchObject({ code: 'supabase/no-publishable-key' });
  });

  it('sends a legacy service_role key as the bearer token too', async () => {
    const fetch = scriptedFetch({ json: {} });
    await createSupabase({ url: URL_, secretKey: LEGACY_SERVICE_ROLE }, { fetch }).functions.invoke(ctx, { name: 'f' });
    expect(fetch.requests[0]!.headers).toMatchObject({ apikey: LEGACY_SERVICE_ROLE, authorization: `Bearer ${LEGACY_SERVICE_ROLE}` });
  });

  it("tries once by default, since the function may have run; retries when it's safe to", async () => {
    const once = scriptedFetch({ status: 503, headers: { 'retry-after': '0' } }, { json: {} });
    const err = (await createSupabase(config, { fetch: once, ...noWait }).functions.invoke(ctx, { name: 'charge' }).catch((e) => e)) as SupabaseError;
    expect([err instanceof SupabaseError, err.code, once.requests.length]).toEqual([true, 'supabase/unavailable', 1]);

    const twice = scriptedFetch({ status: 503, headers: { 'retry-after': '0' } }, { json: { ok: 1 } });
    expect(await createSupabase(config, { fetch: twice, ...noWait }).functions.invoke(ctx, { name: 'thumbnail', safeToRetry: true })).toEqual({ ok: 1 });
    expect(twice.requests.length).toBe(2);
  });

  it('refuses a project URL with a path before calling anything', () => {
    expect(() => createSupabase({ ...config, url: `${URL_}/auth/v1` })).toThrow(/without \/auth\/v1/);
  });
});

describe('admin.users', () => {
  it('lists a page and pages through them all', async () => {
    const page = (n: number) => ({ json: { aud: 'authenticated', users: Array.from({ length: n }, () => supabaseUser()) } });
    const fetch = scriptedFetch(page(2), page(1));
    const tracer = new TestTracer();
    let seen = 0;
    for await (const _ of createSupabase(config, { fetch, tracer }).admin.users.all(ctx, { perPage: 2 })) seen += 1;
    expect(seen).toBe(3);
    expect(fetch.requests.map((r) => r.url.search)).toEqual(['?page=1&per_page=2', '?page=2&per_page=2']);
    expect(fetch.requests[0]!.url.pathname).toBe('/auth/v1/admin/users');
    assertProviderSpans(tracer.spans);
  });

  it('reads one user, and answers null for one that is not there', async () => {
    const fetch = scriptedFetch({ json: supabaseUser({ id: ADA, email: 'ada@example.com' }) }, { status: 404, json: { code: 404, error_code: 'user_not_found', msg: 'User not found' } });
    const supabase = createSupabase(config, { fetch });
    expect((await supabase.admin.users.get(ctx, ADA))?.email).toBe('ada@example.com');
    expect(await supabase.admin.users.get(ctx, ADA)).toBeNull();
    await expect(supabase.admin.users.get(ctx, '../settings')).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });

  it("creates a user, failing on a taken address with Auth's code and never its message", async () => {
    const fetch = scriptedFetch({ json: supabaseUser({ email: 'ada@example.com' }) }, { status: 422, json: { code: 422, error_code: 'email_exists', msg: 'ada@example.com is taken' } });
    const supabase = createSupabase(config, { fetch });
    await supabase.admin.users.create(ctx, { email: 'ada@example.com', emailConfirm: true, appMetadata: { plan: 'team' } });
    expect(fetch.requests[0]!.json).toEqual({ email: 'ada@example.com', email_confirm: true, app_metadata: { plan: 'team' } });
    const err = await supabase.admin.users.create(ctx, { email: 'ada@example.com' }).catch((e) => e);
    expect([err.code, err.category, err.providerCode]).toEqual(['supabase/email-exists', 'conflict', 'email_exists']);
    expect(err.message).not.toContain('ada@example.com');
    await expect(supabase.admin.users.create(ctx, {})).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });

  it('invites by email with where the link lands, and deletes (soft or not), a missing user being no error', async () => {
    const fetch = scriptedFetch({ json: supabaseUser({ email: 'bo@example.com' }) }, { json: {} }, { status: 404, json: { error_code: 'user_not_found' } });
    const supabase = createSupabase(config, { fetch });
    await supabase.admin.users.invite(ctx, { email: 'bo@example.com', data: { invitedBy: ADA }, redirectTo: 'https://app.example.com/welcome' });
    expect([fetch.requests[0]!.url.pathname, fetch.requests[0]!.url.searchParams.get('redirect_to'), fetch.requests[0]!.json]).toEqual([
      '/auth/v1/invite',
      'https://app.example.com/welcome',
      { email: 'bo@example.com', data: { invitedBy: ADA } },
    ]);
    await supabase.admin.users.delete(ctx, { userId: ADA, softDelete: true });
    expect([fetch.requests[1]!.method, fetch.requests[1]!.json]).toEqual(['DELETE', { should_soft_delete: true }]);
    await expect(supabase.admin.users.delete(ctx, { userId: ADA })).resolves.toBeUndefined();
  });

  it('retries a rate limit, and maps the email rate limit to its own reason', async () => {
    const fetch = scriptedFetch(
      { status: 429, headers: { 'retry-after': '0' }, json: { error_code: 'over_request_rate_limit' } },
      { status: 429, headers: { 'retry-after': '0' }, json: { error_code: 'over_email_send_rate_limit' } },
      { status: 429, headers: { 'retry-after': '0' }, json: { error_code: 'over_email_send_rate_limit' } },
    );
    const err = await createSupabase(config, { fetch, ...noWait }).admin.users.invite(ctx, { email: 'bo@example.com' }).catch((e) => e);
    expect([err.code, err.category, fetch.requests.length]).toEqual(['supabase/email-rate-limited', 'rate-limited', 3]);
  });
});

describe('settings', () => {
  it('reads from the environment by name, and says where to find each', () => {
    expect(settingsFromEnv(settings, (n) => ({ SUPABASE_URL: URL_, SUPABASE_SECRET_KEY: 'sb_secret_1' })[n])).toEqual({ url: URL_, secretKey: 'sb_secret_1' });
    expect(() => settingsFromEnv(settings, () => undefined)).toThrow(/SUPABASE_URL, SUPABASE_SECRET_KEY/);
    expect(settings.every((s) => s.whereToFind)).toBe(true);
    // Test and live are separate projects: no prefix tells their keys apart, so there are no checks
    expect(settings.some((s) => s.environments)).toBe(false);
    expect(settings.filter((s) => s.public).map((s) => s.env)).toEqual(['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY']);
  });
});

describe('the ports', () => {
  it('points auth-gotrue at the project: /auth/v1, ES256 or RS256 through the JWKS', () => {
    expect(supabaseAuthConfig({ url: `${URL_}/` })).toEqual({ url: `${URL_}/auth/v1`, algorithms: ['ES256', 'RS256'] });
  });

  it("points storage at the bucket through Storage's S3 endpoint, with the URL public objects are served at", () => {
    const s3 = { s3AccessKeyId: 'ak', s3SecretAccessKey: 'sk', s3Region: 'eu-central-1' };
    expect(supabaseStorageConfig({ ...config, ...s3 }, { bucket: 'avatars' })).toEqual({
      adapter: 's3',
      bucket: 'avatars',
      region: 'eu-central-1',
      endpoint: 'https://abcdefghijklmnopqrst.storage.supabase.co/storage/v1/s3',
      forcePathStyle: true,
      credentials: { accessKeyId: 'ak', secretAccessKey: 'sk' },
      publicBaseUrl: `${URL_}/storage/v1/object/public/avatars`,
    });
    expect(supabaseStorageConfig({ ...config, ...s3, url: 'http://127.0.0.1:54321' }, { bucket: 'b' }).endpoint).toBe('http://127.0.0.1:54321/storage/v1/s3');
    expect(() => supabaseStorageConfig(config, { bucket: 'avatars' })).toThrow(/SUPABASE_S3_ACCESS_KEY_ID, SUPABASE_S3_SECRET_ACCESS_KEY, SUPABASE_S3_REGION/);
  });

  it('requires TLS on Supabase hosts, and turns prepared statements off only for the shared pooler in transaction mode', () => {
    const pooler = 'postgres.abcdefghijklmnopqrst:pw@aws-0-eu-central-1.pooler.supabase.com';
    expect(supabaseDatabaseConfig(`postgresql://${pooler}:5432/postgres`)).toEqual({ url: `postgresql://${pooler}:5432/postgres`, ssl: 'require' });
    expect(supabaseDatabaseConfig(`postgresql://${pooler}:6543/postgres`)).toMatchObject({ ssl: 'require', prepare: false });
    // The dedicated pooler (PgBouncer 1.21+) keeps prepared statements
    expect(supabaseDatabaseConfig('postgresql://postgres:pw@db.abcdefghijklmnopqrst.supabase.co:6543/postgres')).not.toHaveProperty('prepare');
    expect(supabaseDatabaseConfig('postgres://postgres:postgres@127.0.0.1:54322/postgres')).toEqual({ url: 'postgres://postgres:postgres@127.0.0.1:54322/postgres' });
    const err = (() => {
      try {
        supabaseDatabaseConfig('not a url with secret-pw');
      } catch (e) {
        return e as Error;
      }
    })();
    expect(err?.message).not.toContain('secret-pw');
  });
});

describe('Auth Hooks', () => {
  const SECRET = `v1,whsec_${Buffer.from('a-hook-secret-of-32-bytes-length').toString('base64')}`;
  const email = {
    user: { id: ADA, email: 'ada@example.com', app_metadata: {}, user_metadata: {}, is_anonymous: false },
    email_data: { token: '305805', token_hash: 'h', redirect_to: 'https://app.example.com', email_action_type: 'signup', site_url: 'https://app.example.com', token_new: '', token_hash_new: '' },
  };

  class SupabaseHooks extends WebhookController {
    readonly prefix = 'supabase';
    readonly auth = supabaseAuthHookAuth(SECRET);
    init() {
      this.post('send-email', { mode: 'queue', jobName: 'auth-email', eventType: supabaseAuthHookType, logPayload: false }, async (_ctx, body) => SendEmailHookBody.parse(body));
    }
  }

  it('takes a signed Send Email hook through WebhookServer, with its span, and refuses a forged or altered one', async () => {
    const queued: unknown[] = [];
    const tracer = new TestTracer();
    const jobQueue = { enqueue: async (_name: string, payload: unknown) => { queued.push(payload); return 'job-1'; } } as never;
    const server = new WebhookServer({ name: 'webhooks', logger }, { jobQueue, tracer }).registerController(new SupabaseHooks());
    const post = (d: { rawBody: string; headers: Record<string, string> }, payload = d.rawBody) =>
      server.inject({ method: 'POST', url: '/supabase/send-email', headers: { 'content-type': 'application/json', ...d.headers }, payload });

    const signed = signedSupabaseAuthHook(email, SECRET);
    expect((await post(signed)).statusCode).toBe(202);
    expect((queued[0] as typeof email).email_data.token).toBe('305805');
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['mariachi.integration.event']])).toEqual([['supabase webhook', 'server', 'send-email']]);

    const forged = signedSupabaseAuthHook(email, `v1,whsec_${Buffer.from('someone-elses-secret-32-bytes-xx').toString('base64')}`);
    expect((await post(forged)).statusCode).toBe(401);
    expect((await post(signed, `${signed.rawBody} `)).statusCode).toBe(401);
    const stale = signedSupabaseAuthHook(email, SECRET, { timestampSeconds: Math.floor(Date.now() / 1000) - 3600 });
    expect((await post(stale)).statusCode).toBe(401);
    expect(queued).toHaveLength(1);
  });

  it('refuses a secret that is not v1,whsec_<base64> at startup', () => {
    expect(() => supabaseAuthHookAuth('not-a-secret!')).toThrow();
  });

  it('reads the hook from the body', () => {
    expect([supabaseAuthHookType(email), supabaseAuthHookType({ user: {}, sms: { otp: '123456' } }), supabaseAuthHookType({ claims: {} })]).toEqual(['send-email', 'send-sms', undefined]);
  });
});

describe('the fake', () => {
  it('stands in for the client in an app’s tests', async () => {
    const fake = fakeSupabase({ functions: { hello: (body) => ({ hi: (body as { name: string }).name }) }, users: [supabaseUser({ id: ADA, email: 'ada@example.com' })] });
    expect(await fake.functions.invoke(ctx, { name: 'hello', body: { name: 'Ada' } })).toEqual({ hi: 'Ada' });
    await expect(fake.functions.invoke(ctx, { name: 'nope' })).rejects.toMatchObject({ code: 'supabase/not-found' });
    await expect(fake.admin.users.create(ctx, { email: 'ada@example.com' })).rejects.toMatchObject({ code: 'supabase/email-exists' });
    await fake.admin.users.invite(ctx, { email: 'bo@example.com' });
    expect(fake.invitations_).toEqual([{ email: 'bo@example.com', redirectTo: undefined }]);
    expect((await fake.admin.users.list(ctx)).users.map((u) => u.email)).toEqual(['ada@example.com', 'bo@example.com']);
    await fake.admin.users.delete(ctx, { userId: ADA });
    expect(await fake.admin.users.get(ctx, ADA)).toBeNull();
  });
});
