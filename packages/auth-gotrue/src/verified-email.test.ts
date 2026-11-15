import { describe, expect, it } from 'vitest';
import { goTrueVerifiedEmail } from './verified-email';

const ADA = '0b9d4c53-8f0a-4d0e-9a63-5c2f1e7b3a41';
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const withClaims = (claims: Record<string, unknown>) => ({ identity: { claims } });

function gotrue(answer: (url: string) => Response | Promise<Response>) {
  const calls: Array<{ url: string; headers: Record<string, string> }> = [];
  const fetcher = (async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
    calls.push({ url: String(input), headers: { ...(init?.headers as Record<string, string>) } });
    return answer(String(input));
  }) as typeof fetch;
  return { calls, fetcher };
}

describe('goTrueVerifiedEmail', () => {
  it("uses the token's own email_verified claim, true or false, and asks GoTrue nothing", async () => {
    const { calls, fetcher } = gotrue(() => json({}));
    const read = goTrueVerifiedEmail({ url: 'http://gotrue.test', serviceKey: 'service-key', fetch: fetcher });
    expect(await read(withClaims({ sub: ADA, email: 'ada@example.com', email_verified: true }))).toEqual({ email: 'ada@example.com', verified: true });
    expect(await read(withClaims({ sub: ADA, email: 'ada@example.com', email_verified: false }))).toEqual({ email: 'ada@example.com', verified: false });
    expect(calls).toHaveLength(0);
  });

  it("never reads user_metadata: what the user wrote about themselves is not an answer", async () => {
    const { calls, fetcher } = gotrue(() => json({ id: ADA, email: 'ada@example.com', email_confirmed_at: null, user_metadata: { email_verified: true } }));
    const read = goTrueVerifiedEmail({ url: 'http://gotrue.test/auth/v1/', serviceKey: 'service-key', fetch: fetcher });
    const answer = await read(withClaims({ sub: ADA, email: 'ada@example.com', user_metadata: { email_verified: true, email: 'ceo@example.com' } }));
    expect(answer).toEqual({ email: 'ada@example.com', verified: false });
    expect(calls).toEqual([
      { url: `http://gotrue.test/auth/v1/admin/users/${ADA}`, headers: { accept: 'application/json', authorization: 'Bearer service-key', apikey: 'service-key' } },
    ]);
  });

  it("reads the user's record: its email, verified when email_confirmed_at is set", async () => {
    const { fetcher } = gotrue(() => json({ id: ADA, email: 'ada@new.example.com', email_confirmed_at: '2026-11-01T10:00:00Z' }));
    const read = goTrueVerifiedEmail({ url: 'http://gotrue.test', serviceKey: 'service-key', fetch: fetcher });
    // The token still carries the address the user had when it was issued
    expect(await read(withClaims({ sub: ADA, email: 'ada@old.example.com' }))).toEqual({ email: 'ada@new.example.com', verified: true });
  });

  it('says it cannot answer when the token does not say and there is no key to look it up', async () => {
    const read = goTrueVerifiedEmail({ url: 'http://gotrue.test' });
    await expect(read(withClaims({ sub: ADA, email: 'ada@example.com', user_metadata: { email_verified: true } }))).rejects.toMatchObject({
      code: 'auth/verified-email-unavailable',
    });
  });

  it('fails, and never says verified, when GoTrue cannot be asked or answers something else', async () => {
    const claims = withClaims({ sub: ADA, email: 'ada@example.com' });
    const refused = goTrueVerifiedEmail({ url: 'http://gotrue.test', serviceKey: 'wrong', fetch: gotrue(() => json({ msg: 'no' }, 401)).fetcher });
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
      fetch: gotrue(() => json({ id: 'c2a1f0de-7b6c-4e59-8d3a-1f0e9b8c7d62', email: 'ada@example.com', email_confirmed_at: '2026-11-01T10:00:00Z' })).fetcher,
    });
    await expect(another(claims)).rejects.toMatchObject({ code: 'auth/user-lookup-failed' });
  });

  it('answers unverified for a user GoTrue no longer has, and for a subject that is not one of its ids', async () => {
    const { calls, fetcher } = gotrue(() => json({ msg: 'User not found' }, 404));
    const read = goTrueVerifiedEmail({ url: 'http://gotrue.test', serviceKey: 'k', fetch: fetcher });
    expect(await read(withClaims({ sub: ADA, email: 'ada@example.com' }))).toEqual({ email: 'ada@example.com', verified: false });
    expect(await read(withClaims({ sub: '../admin/users', email: 'ada@example.com' }))).toEqual({ email: 'ada@example.com', verified: false });
    expect(calls).toHaveLength(1);
  });

  it('has nothing to say for a request with no verified token', async () => {
    const read = goTrueVerifiedEmail({ url: 'http://gotrue.test', serviceKey: 'k' });
    expect(await read({})).toEqual({});
    expect(await read({ identity: null })).toEqual({});
  });
});
