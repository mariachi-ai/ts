import { randomBytes } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { StartedNetwork, StartedTestContainer } from 'testcontainers';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createProject } from './index';

/**
 * The generated sign-in page's script, run against a real GoTrue (v2.197.0 on Postgres 16) that sends
 * its emails to a real mailbox (Mailpit): ask for a link, read the email, follow the link, and exchange
 * the one-time code it comes back with. The script runs in the generated project's own fake browser.
 */
const GOTRUE_IMAGE = 'supabase/auth:v2.197.0';
const MAILPIT_IMAGE = 'axllent/mailpit:v1.27';
const PAGE = 'http://localhost:3000/api/sign-in';
// Where GoTrue believes it is; links in its emails start with this, and the test swaps in the mapped port.
const EXTERNAL = 'http://localhost:9999';

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const app = join(pkgRoot, '.scaffold-test', 'pkce-app');
const started: StartedTestContainer[] = [];
let network: StartedNetwork;
let gotrue: string;
let mailpit: string;

type FakePage = {
  url(): string;
  session: Map<string, string>;
  local: Map<string, string>;
  text(id: string): string;
  type(id: string, value: string): void;
  fire(id: string, event: 'click' | 'submit'): Promise<void>;
};
let openPage: (options: { script: string; url: string; fetch: (input: string, init?: RequestInit) => Promise<Response>; local?: Map<string, string> }) => Promise<FakePage>;
let script: string;

beforeAll(async () => {
  await rm(app, { recursive: true, force: true });
  await createProject({ name: 'pkce-app', outputDir: app, auth: 'gotrue' });
  ({ openPage } = await import(pathToFileURL(join(app, 'src/api/pages/fake-browser.ts')).href));

  const { GenericContainer, Network, Wait } = await import('testcontainers');
  network = await new Network().start();
  const pg = await new GenericContainer('postgres:16-alpine')
    .withNetwork(network)
    .withNetworkAliases('pg')
    .withEnvironment({ POSTGRES_PASSWORD: 'test', POSTGRES_DB: 'app' })
    .withWaitStrategy(Wait.forLogMessage(/database system is ready to accept connections/, 2))
    .start();
  started.push(pg);
  const init = await pg.exec([
    'psql', '-U', 'postgres', '-d', 'app', '-v', 'ON_ERROR_STOP=1',
    '-c', "CREATE ROLE supabase_auth_admin NOINHERIT CREATEROLE LOGIN PASSWORD 'auth'",
    '-c', 'CREATE SCHEMA auth AUTHORIZATION supabase_auth_admin',
    '-c', 'GRANT CREATE ON DATABASE app TO supabase_auth_admin',
    '-c', "ALTER ROLE supabase_auth_admin SET search_path = 'auth'",
  ]);
  if (init.exitCode !== 0) throw new Error(`init: ${init.output}`); // mariachi-lint-ignore test setup

  const mail = await new GenericContainer(MAILPIT_IMAGE)
    .withNetwork(network)
    .withNetworkAliases('mail')
    .withExposedPorts(8025)
    .withWaitStrategy(Wait.forHttp('/readyz', 8025))
    .start();
  started.push(mail);
  mailpit = `http://${mail.getHost()}:${mail.getMappedPort(8025)}`;

  const env = {
    API_EXTERNAL_URL: EXTERNAL,
    GOTRUE_SITE_URL: PAGE,
    GOTRUE_URI_ALLOW_LIST: PAGE,
    GOTRUE_DB_DRIVER: 'postgres',
    DATABASE_URL: 'postgres://supabase_auth_admin:auth@pg:5432/app',
    GOTRUE_JWT_SECRET: randomBytes(32).toString('hex'),
    GOTRUE_JWT_AUD: 'authenticated',
    GOTRUE_JWT_DEFAULT_GROUP_NAME: 'authenticated',
    GOTRUE_API_HOST: '0.0.0.0',
    PORT: '9999',
    // Every new account and every magic link goes through an email, so every sign-in below is by link
    GOTRUE_MAILER_AUTOCONFIRM: 'false',
    GOTRUE_EXTERNAL_EMAIL_ENABLED: 'true',
    GOTRUE_SMTP_HOST: 'mail',
    GOTRUE_SMTP_PORT: '1025',
    // No SMTP user: GoTrue won't send a password over an unencrypted connection, and Mailpit asks for none
    GOTRUE_SMTP_ADMIN_EMAIL: 'auth@example.test',
    GOTRUE_SMTP_MAX_FREQUENCY: '1s',
    GOTRUE_RATE_LIMIT_EMAIL_SENT: '1000',
    GOTRUE_MAILER_URLPATHS_CONFIRMATION: '/verify',
    GOTRUE_MAILER_URLPATHS_RECOVERY: '/verify',
    GOTRUE_MAILER_URLPATHS_INVITE: '/verify',
    GOTRUE_MAILER_URLPATHS_EMAIL_CHANGE: '/verify',
  };
  const migrate = await new GenericContainer(GOTRUE_IMAGE)
    .withNetwork(network)
    .withEnvironment(env)
    .withCommand(['auth', 'migrate'])
    .withWaitStrategy(Wait.forOneShotStartup())
    .start();
  started.push(migrate);
  const serve = await new GenericContainer(GOTRUE_IMAGE)
    .withNetwork(network)
    .withEnvironment(env)
    .withCommand(['auth', 'serve'])
    .withExposedPorts(9999)
    .withWaitStrategy(Wait.forHttp('/health', 9999))
    .start();
  started.push(serve);
  gotrue = `http://${serve.getHost()}:${serve.getMappedPort(9999)}`;

  const { signInScript } = await import(pathToFileURL(join(app, 'src/api/pages/sign-in.ts')).href);
  script = signInScript({ authUrl: gotrue });
}, 240_000);

afterAll(async () => {
  await Promise.all(started.splice(0).map((c) => c.stop()));
  await network?.stop();
  await rm(app, { recursive: true, force: true });
});

/** The page's requests: GoTrue's go to the real one; GET /api/me is this app's, recorded and answered. */
function browserFetch() {
  const me: string[] = [];
  const gotrueCalls: string[] = [];
  const fetchFn = async (input: string, init?: RequestInit) => {
    if (input === '/api/me') {
      me.push(String((init?.headers as Record<string, string>).authorization));
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    gotrueCalls.push(input.replace(gotrue, ''));
    return fetch(input, init);
  };
  return { me, gotrueCalls, fetch: fetchFn };
}

/** The link in the newest email to `address`, as GoTrue wrote it. */
async function emailedLink(address: string): Promise<URL> {
  for (let attempt = 0; attempt < 50; attempt++) {
    const found = (await (await fetch(`${mailpit}/api/v1/search?query=${encodeURIComponent(`to:${address}`)}`)).json()) as { messages: Array<{ ID: string }> };
    if (found.messages.length) {
      const message = (await (await fetch(`${mailpit}/api/v1/message/${found.messages[0]?.ID}`)).json()) as { HTML: string };
      const href = /href="([^"]*\/verify\?[^"]*)"/.exec(message.HTML)?.[1];
      if (href) return new URL(href.replaceAll('&amp;', '&'));
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`no email with a link arrived for ${address}`); // mariachi-lint-ignore test helper
}

/** Follows an emailed link the way a browser does, as far as GoTrue's redirect back to the page. */
async function follow(link: URL): Promise<URL> {
  expect(link.origin).toBe(EXTERNAL);
  const res = await fetch(gotrue + link.pathname + link.search, { redirect: 'manual' });
  expect(res.status).toBe(303);
  return new URL(res.headers.get('location') as string);
}

const user = async (accessToken: string) => (await fetch(`${gotrue}/user`, { headers: { authorization: `Bearer ${accessToken}` } })).json() as Promise<{ email?: string }>;
const stored = (tab: FakePage) => JSON.parse(tab.session.get('session') ?? 'null') as { accessToken: string; refreshToken: string } | null;

describe('the generated sign-in page against a real GoTrue', () => {
  it('signs in by magic link with PKCE: the link brings a code, and the browser that asked exchanges it', async () => {
    const email = 'ada@example.test';
    const net = browserFetch();
    const asked = await openPage({ script, url: PAGE, fetch: net.fetch });
    asked.type('email', email);
    await asked.fire('magic-link', 'click');
    expect(asked.text('status')).toBe('Check your email for the sign-in link.');
    const verifier = asked.local.get('sign-in-verifier');
    expect(verifier).toMatch(/^[A-Za-z0-9_-]{64}$/);

    const link = await emailedLink(email);
    expect(link.searchParams.get('token')).toMatch(/^pkce_/);
    const back = await follow(link);
    // A code in the query, and no session anywhere in the address
    expect(back.origin + back.pathname).toBe(PAGE);
    expect(back.searchParams.get('code')).toBeTruthy();
    expect(back.href).not.toMatch(/access_token|refresh_token/);

    // The link opens in a new tab of the same browser: its own sessionStorage, the same localStorage
    const tab = await openPage({ script, url: back.href, fetch: net.fetch, local: asked.local });
    expect(tab.text('status')).toBe('Signed in.');
    expect(tab.url()).toBe(PAGE);
    expect(tab.local.has('sign-in-verifier')).toBe(false);
    const session = stored(tab);
    expect((await user(session?.accessToken as string)).email).toBe(email);
    expect(net.me).toEqual([`Bearer ${session?.accessToken}`]);
    expect(net.gotrueCalls).toEqual([`/otp?redirect_to=${encodeURIComponent(PAGE)}`, '/token?grant_type=pkce']);
  }, 60_000);

  it("can't be used from another browser, or twice", async () => {
    const email = 'grace@example.test';
    const net = browserFetch();
    const asked = await openPage({ script, url: PAGE, fetch: net.fetch });
    asked.type('email', email);
    await asked.fire('magic-link', 'click');
    const verifier = asked.local.get('sign-in-verifier') as string;
    const back = await follow(await emailedLink(email));
    const code = back.searchParams.get('code') as string;

    // Someone else's browser (the link was forwarded, or read in transit): no verifier, so no request and no session
    const stranger = browserFetch();
    const other = await openPage({ script, url: back.href, fetch: stranger.fetch });
    expect(other.session.size).toBe(0);
    expect(stranger.gotrueCalls).toEqual([]);
    expect(other.text('status')).toMatch(/not asked for in this browser/);

    // And GoTrue itself refuses the code with a wrong verifier
    const wrong = await fetch(`${gotrue}/token?grant_type=pkce`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ auth_code: code, code_verifier: 'x'.repeat(64) }),
    });
    expect(wrong.status).toBeGreaterThanOrEqual(400);

    // The browser that asked still gets in, once
    const tab = await openPage({ script, url: back.href, fetch: net.fetch, local: asked.local });
    expect((await user(stored(tab)?.accessToken as string)).email).toBe(email);

    // The same code and verifier again: refused
    const replay = await openPage({ script, url: back.href, fetch: browserFetch().fetch, local: new Map([['sign-in-verifier', verifier]]) });
    expect(replay.session.size).toBe(0);
    expect(replay.text('status')).toMatch(/^The link did not work: /);
  }, 60_000);

  it('confirms a sign-up by link the same way, after which the password signs in', async () => {
    const email = 'lin@example.test';
    const password = `pw-${randomBytes(12).toString('hex')}`;
    const net = browserFetch();
    const asked = await openPage({ script, url: PAGE, fetch: net.fetch });
    asked.type('email', email);
    asked.type('password', password);
    await asked.fire('sign-up', 'click');
    expect(asked.text('status')).toBe('Check your email for the confirmation link.');
    expect(asked.session.size).toBe(0);

    // Not confirmed yet: the password alone doesn't sign in
    await asked.fire('password-form', 'submit');
    expect(asked.text('status')).toMatch(/^Sign-in failed: /);

    const back = await follow(await emailedLink(email));
    expect(back.searchParams.get('code')).toBeTruthy();
    const tab = await openPage({ script, url: back.href, fetch: net.fetch, local: asked.local });
    expect((await user(stored(tab)?.accessToken as string)).email).toBe(email);

    const later = await openPage({ script, url: PAGE, fetch: browserFetch().fetch });
    later.type('email', email);
    later.type('password', password);
    await later.fire('password-form', 'submit');
    expect(later.text('status')).toBe('Signed in.');
    expect((await user(stored(later)?.accessToken as string)).email).toBe(email);
  }, 60_000);

  it('never takes a session from the address bar, even a real one', async () => {
    // A real session of someone else's, planted in a link the way the implicit flow would deliver it
    const email = 'mallory@example.test';
    const net = browserFetch();
    const asked = await openPage({ script, url: PAGE, fetch: net.fetch });
    asked.type('email', email);
    await asked.fire('magic-link', 'click');
    const tab = await openPage({ script, url: (await follow(await emailedLink(email))).href, fetch: net.fetch, local: asked.local });
    const theirs = stored(tab);
    expect(theirs?.accessToken).toBeTruthy();

    const victim = browserFetch();
    const planted = await openPage({ script, url: `${PAGE}#access_token=${theirs?.accessToken}&refresh_token=${theirs?.refreshToken}&expires_in=3600&token_type=bearer`, fetch: victim.fetch });
    expect(planted.session.size).toBe(0);
    expect(victim.me).toEqual([]);
    expect(victim.gotrueCalls).toEqual([]);
    expect(planted.url()).toBe(PAGE);
  }, 60_000);
});
