import { describe, expect, it } from 'vitest';
import { goTrueVerifiedEmail } from './verified-email';

const ADA = '0b9d4c53-8f0a-4d0e-9a63-5c2f1e7b3a41';
const CONFIRMED = { id: ADA, email: 'ada@example.com', email_confirmed_at: '2026-11-01T10:00:00Z' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
/** A service-role JWT (legacy Supabase, or a self-hosted GoTrue's): sent as the bearer token too. */
const SERVICE_ROLE_JWT = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.c2lnbmF0dXJl';
const withClaims = (claims: Record<string, unknown>) => ({ identity: { claims } });

/** A stand-in for GoTrue: `/settings` and `/admin/users/:id`. */
function gotrue(options: { user?: () => Response; settings?: () => Response } = {}) {
  const calls: Array<{ url: string; headers: Record<string, string> }> = [];
  const fetcher = (async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, headers: { ...(init?.headers as Record<string, string>) } });
    if (url.endsWith('/settings')) return (options.settings ?? (() => json({ mailer_autoconfirm: false })))();
    return (options.user ?? (() => json(CONFIRMED)))();
  }) as typeof fetch;
  return { calls, fetcher, paths: () => calls.map((call) => new URL(call.url).pathname) };
}

describe('goTrueVerifiedEmail', () => {
  it("uses the token's own email_verified claim, true or false, and asks GoTrue nothing", async () => {
    const { calls, fetcher } = gotrue();
    const read = goTrueVerifiedEmail({ url: 'http://gotrue.test', serviceKey: 'service-key', fetch: fetcher });
    expect(await read(withClaims({ sub: ADA, email: 'ada@example.com', email_verified: true }))).toEqual({ email: 'ada@example.com', verified: true });
    expect(await read(withClaims({ sub: ADA, email: 'ada@example.com', email_verified: false }))).toEqual({ email: 'ada@example.com', verified: false });
    expect(calls).toHaveLength(0);
  });

  it('never reads user_metadata: what the user wrote about themselves is not an answer', async () => {
    const { calls, fetcher } = gotrue({ user: () => json({ id: ADA, email: 'ada@example.com', email_confirmed_at: null, user_metadata: { email_verified: true } }) });
    const read = goTrueVerifiedEmail({ url: 'http://gotrue.test/auth/v1/', serviceKey: SERVICE_ROLE_JWT, fetch: fetcher });
    const answer = await read(withClaims({ sub: ADA, email: 'ada@example.com', user_metadata: { email_verified: true, email: 'ceo@example.com' } }));
    expect(answer).toEqual({ email: 'ada@example.com', verified: false });
    const headers = { accept: 'application/json', authorization: `Bearer ${SERVICE_ROLE_JWT}`, apikey: SERVICE_ROLE_JWT };
    expect(calls).toEqual([
      { url: 'http://gotrue.test/auth/v1/settings', headers },
      { url: `http://gotrue.test/auth/v1/admin/users/${ADA}`, headers },
    ]);
  });

  it("sends Supabase's secret key on apikey only: it isn't a JWT, and on Authorization the platform refuses it", async () => {
    const { calls, fetcher } = gotrue();
    const read = goTrueVerifiedEmail({ url: 'https://abcdefghijklmnopqrst.supabase.co/auth/v1', serviceKey: 'sb_secret_123', fetch: fetcher });
    expect(await read(withClaims({ sub: ADA, email: 'ada@example.com' }))).toEqual({ email: 'ada@example.com', verified: true });
    expect(calls.map((c) => c.headers)).toEqual([
      { accept: 'application/json', apikey: 'sb_secret_123' },
      { accept: 'application/json', apikey: 'sb_secret_123' },
    ]);
  });

  it("reads the user's record: its email, verified when email_confirmed_at is set", async () => {
    const { fetcher } = gotrue({ user: () => json({ ...CONFIRMED, email: 'ada@new.example.com' }) });
    const read = goTrueVerifiedEmail({ url: 'http://gotrue.test', serviceKey: 'service-key', fetch: fetcher });
    // The token still carries the address the user had when it was issued
    expect(await read(withClaims({ sub: ADA, email: 'ada@old.example.com' }))).toEqual({ email: 'ada@new.example.com', verified: true });
  });

  it('does not count a confirmation GoTrue gave without sending mail', async () => {
    const autoconfirm = gotrue({ settings: () => json({ mailer_autoconfirm: true }) });
    const read = goTrueVerifiedEmail({ url: 'http://gotrue.test', serviceKey: 'k', fetch: autoconfirm.fetcher });
    // Anyone can sign up as this address there, and the record says confirmed
    expect(await read(withClaims({ sub: ADA, email: 'ada@example.com' }))).toEqual({ email: 'ada@example.com', verified: false });
    // The record is not even asked for
    expect(autoconfirm.paths()).toEqual(['/settings']);
    // A hook's claim is still the hook's word, whatever the setting
    expect(await read(withClaims({ sub: ADA, email: 'ada@example.com', email_verified: true }))).toEqual({ email: 'ada@example.com', verified: true });
  });

  it('counts it when told to, for development, without asking for the settings', async () => {
    const autoconfirm = gotrue({ settings: () => json({ mailer_autoconfirm: true }) });
    const read = goTrueVerifiedEmail({ url: 'http://gotrue.test', serviceKey: 'k', trustAutoconfirm: true, fetch: autoconfirm.fetcher });
    expect(await read(withClaims({ sub: ADA, email: 'ada@example.com' }))).toEqual({ email: 'ada@example.com', verified: true });
    expect(autoconfirm.paths()).toEqual([`/admin/users/${ADA}`]);
  });

  it('remembers the settings for a while, and reads them again after', async () => {
    let autoconfirm = false;
    const server = gotrue({ settings: () => json({ mailer_autoconfirm: autoconfirm }) });
    const read = goTrueVerifiedEmail({ url: 'http://gotrue.test', serviceKey: 'k', settingsCacheMs: 40, fetch: server.fetcher });
    const claims = withClaims({ sub: ADA, email: 'ada@example.com' });
    expect((await read(claims)).verified).toBe(true);
    autoconfirm = true;
    expect((await read(claims)).verified).toBe(true);
    expect(server.paths().filter((path) => path === '/settings')).toHaveLength(1);
    await new Promise((done) => setTimeout(done, 60));
    expect((await read(claims)).verified).toBe(false);
    expect(server.paths().filter((path) => path === '/settings')).toHaveLength(2);
  });

  it('fails, and never says verified, when the settings cannot be read or do not say', async () => {
    const claims = withClaims({ sub: ADA, email: 'ada@example.com' });
    for (const settings of [() => json({ msg: 'no' }, 401), () => json({ external: {} }), () => new Response('not json', { status: 200 })]) {
      const server = gotrue({ settings });
      const read = goTrueVerifiedEmail({ url: 'http://gotrue.test', serviceKey: 'k', fetch: server.fetcher });
      await expect(read(claims)).rejects.toMatchObject({ code: 'auth/user-lookup-failed' });
      // And the failure is not remembered as an answer
      await expect(read(claims)).rejects.toMatchObject({ code: 'auth/user-lookup-failed' });
      expect(server.paths()).toEqual(['/settings', '/settings']);
    }
  });

  it('says it cannot answer when the token does not say and there is no key to look it up', async () => {
    const read = goTrueVerifiedEmail({ url: 'http://gotrue.test' });
    await expect(read(withClaims({ sub: ADA, email: 'ada@example.com', user_metadata: { email_verified: true } }))).rejects.toMatchObject({
      code: 'auth/verified-email-unavailable',
    });
  });

  it('with requireClaim, takes only the claim: no lookup even with a key, and a token without it is refused', async () => {
    const { calls, fetcher } = gotrue();
    const read = goTrueVerifiedEmail({ url: 'http://gotrue.test', serviceKey: 'k', requireClaim: true, fetch: fetcher });
    expect(await read(withClaims({ sub: ADA, email: 'ada@example.com', email_verified: false }))).toEqual({ email: 'ada@example.com', verified: false });
    await expect(read(withClaims({ sub: ADA, email: 'ada@example.com' }))).rejects.toMatchObject({ code: 'auth/verified-email-unavailable' });
    expect(calls).toHaveLength(0);
  });

  it("answers unverified for another issuer's token, claim or no claim, and looks nothing up", async () => {
    const { calls, fetcher } = gotrue();
    const read = goTrueVerifiedEmail({ url: 'http://gotrue.test', serviceKey: 'k', issuer: 'https://auth.example.com/auth/v1', fetch: fetcher });
    const other = { iss: 'https://login.other.example', sub: ADA, email: 'ada@example.com' };
    expect(await read(withClaims(other))).toEqual({ email: 'ada@example.com', verified: false });
    expect(await read(withClaims({ ...other, email_verified: true }))).toEqual({ email: 'ada@example.com', verified: false });
    expect(await read(withClaims({ sub: ADA, email: 'ada@example.com', email_verified: true }))).toEqual({ email: 'ada@example.com', verified: false });
    expect(calls).toHaveLength(0);
    // GoTrue's own token is answered as usual
    expect(await read(withClaims({ ...other, iss: 'https://auth.example.com/auth/v1' }))).toEqual({ email: 'ada@example.com', verified: true });
  });

  it('fails, and never says verified, when the record cannot be read or is not the user asked for', async () => {
    const claims = withClaims({ sub: ADA, email: 'ada@example.com' });
    const refused = goTrueVerifiedEmail({ url: 'http://gotrue.test', serviceKey: 'wrong', fetch: gotrue({ user: () => json({ msg: 'no' }, 401) }).fetcher });
    await expect(refused(claims)).rejects.toMatchObject({ code: 'auth/user-lookup-failed' });
    const down = goTrueVerifiedEmail({
      url: 'http://gotrue.test',
      serviceKey: 'k',
      fetch: (async () => {
        throw new TypeError('fetch failed');
      }) as typeof fetch,
    });
    await expect(down(claims)).rejects.toMatchObject({ code: 'auth/user-lookup-failed' });
    const another = goTrueVerifiedEmail({
      url: 'http://gotrue.test',
      serviceKey: 'k',
      fetch: gotrue({ user: () => json({ ...CONFIRMED, id: 'c2a1f0de-7b6c-4e59-8d3a-1f0e9b8c7d62' }) }).fetcher,
    });
    await expect(another(claims)).rejects.toMatchObject({ code: 'auth/user-lookup-failed' });
  });

  it('answers unverified for a user GoTrue no longer has, and for a subject that is not one of its ids', async () => {
    const server = gotrue({ user: () => json({ msg: 'User not found' }, 404) });
    const read = goTrueVerifiedEmail({ url: 'http://gotrue.test', serviceKey: 'k', fetch: server.fetcher });
    expect(await read(withClaims({ sub: ADA, email: 'ada@example.com' }))).toEqual({ email: 'ada@example.com', verified: false });
    expect(await read(withClaims({ sub: '../admin/users', email: 'ada@example.com' }))).toEqual({ email: 'ada@example.com', verified: false });
    expect(server.paths()).toEqual(['/settings', `/admin/users/${ADA}`]);
  });

  it('has nothing to say for a request with no verified token', async () => {
    const read = goTrueVerifiedEmail({ url: 'http://gotrue.test', serviceKey: 'k' });
    expect(await read({})).toEqual({});
    expect(await read({ identity: null })).toEqual({});
  });
});
