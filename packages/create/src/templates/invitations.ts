import type { ProjectAuth } from '../types';

/**
 * The page that accepts an invitation, for a project with `--orgs --ui`. With `--auth gotrue` it
 * carries the visitor from the emailed link through sign-in and back, then accepts the invitation as
 * them. With `--auth jwt` there is no sign-in in the browser to carry them through, so the page says
 * what accepting needs instead.
 */

/** Where the page is: `INVITATION_URL` defaults to it on the app's own origin (GoTrue projects). */
export const ACCEPT_INVITATION_PATH = '/invitations/accept';
export const ACCEPT_INVITATION_FILE = 'src/api/pages/accept-invitation.ts';
export const ACCEPT_INVITATION_SCRIPT = 'public/accept-invitation.js';
export const ACCEPT_INVITATION_E2E_FILE = 'src/accept-invitation.e2e.test.ts';

/** In `pages.controller.ts`. */
export const ACCEPT_INVITATION_IMPORT = "import { acceptInvitationPage } from '../pages/accept-invitation';\n";
export const ACCEPT_INVITATION_ROUTE = `    // The link in an invitation email opens this page; the token is in its fragment, which reaches no server
    this.get('${ACCEPT_INVITATION_PATH}', { root: true, auth: false }, async () =>
      htmlResponse(acceptInvitationPage(), { headers: { 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' } }),
    );
`;

const GOTRUE_PAGE = `import { html, type Html } from '@mariachi/api-facade';
import { heading, layout } from './layout';

/** The sign-in page, told to send the visitor back here once they are signed in. The path is in the fragment: no server sees it. */
export const SIGN_IN_AND_RETURN = '/api/sign-in#return=${ACCEPT_INVITATION_PATH}';

/**
 * The page at ${ACCEPT_INVITATION_PATH}, which the link in an invitation email opens (INVITATION_URL).
 * Its script (public/accept-invitation.js) keeps the token from the link, sends a visitor who isn't
 * signed in to the sign-in page and back, and accepts the invitation as them when they say so.
 */
export function acceptInvitationPage(): Html {
  return layout({
    title: 'Accept an invitation',
    path: '${ACCEPT_INVITATION_PATH}',
    scripts: ['/assets/accept-invitation.js'],
    body: html\`<div class="m-stack" data-gap="5">
  \${heading('Join an organization')}
  <article class="m-card">
    <div class="m-card-body">
      <p id="invitation-status" role="status">Reading the invitation…</p>
    </div>
    <footer class="m-card-footer">
      <a class="m-button" id="invitation-sign-in" href="\${SIGN_IN_AND_RETURN}" hidden>Sign in to accept</a>
      <button type="button" class="m-button" data-variant="primary" id="invitation-accept" hidden>Accept the invitation</button>
      <a class="m-button" data-variant="primary" id="invitation-done" href="/" hidden>Continue</a>
    </footer>
  </article>
</div>\`,
  });
}
`;

// Browser JavaScript, served as it is: no template literals or backslashes inside.
const GOTRUE_SCRIPT = `// The page that accepts an invitation (src/api/pages/accept-invitation.ts). The emailed link brings the
// token in its fragment (#token=...), which no server sees. This keeps it in this browser for an hour,
// because signing in may finish in another tab (an emailed link opens one); sends a visitor who isn't
// signed in to the sign-in page, which sends them back here; and accepts the invitation as them when
// they click Accept. The token goes nowhere else: not into an address, a log or another site.
const PENDING = 'invitation';
const PENDING_SECONDS = 3600;
const ACTIONS = ['invitation-sign-in', 'invitation-accept', 'invitation-done'];
const byId = (id) => document.getElementById(id);
const now = () => Math.floor(Date.now() / 1000);

// The answers to show for the refusals a visitor can do something about. Anything else is shown by its code.
const MESSAGES = {
  'organizations/email-mismatch': 'This invitation was sent to another address. Sign in as that address to accept it.',
  'organizations/email-unverified': 'Your address is not confirmed yet. Confirm it with the link in the email sent when you signed up, then accept again.',
  'organizations/invitation-invalid': 'This invitation can no longer be used: it was accepted, withdrawn or sent again. Ask for a new one.',
  'organizations/invitation-expired': 'This invitation has expired. Ask for a new one.',
  'auth/verified-email-unavailable': 'This app cannot tell yet whether your address is confirmed (set AUTH_SERVICE_KEY: see README.md).',
};
// After these the token is no use: it is forgotten
const SPENT = ['organizations/invitation-invalid', 'organizations/invitation-expired'];

function say(text, show) {
  byId('invitation-status').textContent = text;
  for (const id of ACTIONS) byId(id).hidden = !(show || []).includes(id);
}

// Out of the address bar at once, so it isn't kept in history, and into this browser's storage
function keepToken() {
  const token = new URLSearchParams(location.hash.slice(1)).get('token');
  if (location.hash) history.replaceState(null, '', location.pathname);
  if (token) localStorage.setItem(PENDING, JSON.stringify({ token: token, at: now() }));
}

function pendingToken() {
  let kept = null;
  try {
    kept = JSON.parse(localStorage.getItem(PENDING) || 'null');
  } catch {
    kept = null;
  }
  if (kept && typeof kept.token === 'string' && now() - Number(kept.at) < PENDING_SECONDS) return kept.token;
  localStorage.removeItem(PENDING);
  return null;
}

// The session the sign-in page keeps in this tab (src/api/pages/sign-in.ts), while its access token is good.
// When it has run out, the sign-in page refreshes it and sends the visitor back.
function session() {
  try {
    const kept = JSON.parse(sessionStorage.getItem('session') || 'null');
    return kept && kept.expiresAt - 30 > now() ? kept : null;
  } catch {
    return null;
  }
}

function signIn(text) {
  byId('invitation-sign-in').textContent = 'Sign in to accept';
  say(text, ['invitation-sign-in']);
}

async function start() {
  keepToken();
  if (!pendingToken()) return say('There is no invitation to accept here. Open the link in the invitation email again.');
  const current = session();
  if (!current) return signIn('Sign in, or sign up, with the address the invitation was sent to. You will come back here to accept it.');
  const res = await fetch('/api/me', { headers: { authorization: 'Bearer ' + current.accessToken } });
  if (res.status === 401) return signIn('Your sign-in has expired. Sign in again to accept the invitation.');
  const me = res.ok ? await res.json().catch(() => ({})) : {};
  byId('invitation-sign-in').textContent = 'Use another account';
  say('You are signed in' + (me.email ? ' as ' + me.email : '') + '. Accept the invitation as this account, or sign in with another.', ['invitation-accept', 'invitation-sign-in']);
}

byId('invitation-accept').addEventListener('click', async () => {
  const token = pendingToken();
  const current = session();
  if (!token || !current) return start();
  say('Accepting the invitation…');
  const res = await fetch('/api/organizations/invitations/accept', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + current.accessToken },
    body: JSON.stringify({ token: token }),
  });
  const body = await res.json().catch(() => ({}));
  if (res.ok) {
    localStorage.removeItem(PENDING);
    const name = body.organization && body.organization.name;
    const role = body.membership && body.membership.role;
    return say('You joined ' + (name || 'the organization') + (role ? ' as ' + role : '') + '.', ['invitation-done']);
  }
  if (res.status === 401) return signIn('Your sign-in has expired. Sign in again to accept the invitation.');
  if (res.status === 429) return say('Too many attempts. Wait a few minutes, then try again.', ['invitation-accept']);
  const code = body.error && body.error.code;
  if (SPENT.includes(code)) {
    localStorage.removeItem(PENDING);
    return say(MESSAGES[code]);
  }
  byId('invitation-sign-in').textContent = 'Use another account';
  say(MESSAGES[code] || 'The invitation could not be accepted (' + (code || 'HTTP ' + res.status) + ').', ['invitation-accept', 'invitation-sign-in']);
});

// Tests wait on this
const ready = start();
`;

const GOTRUE_TEST = `import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { openPage } from './fake-browser';
import { acceptInvitationPage, SIGN_IN_AND_RETURN } from './accept-invitation';

const script = readFileSync(new URL('../../../public/accept-invitation.js', import.meta.url), 'utf8');
const page = 'https://app.example.test${ACCEPT_INVITATION_PATH}';
const TOKEN = '6f0d6b0c-3a4e-4c1b-9f5e-2b7d1a9c8e10.c2VjcmV0LXNlY3JldC1zZWNyZXQtc2VjcmV0';
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
/** This tab's sessionStorage once the sign-in page has signed the visitor in. */
const signedIn = () => new Map([['session', JSON.stringify({ accessToken: 'access-1', refreshToken: 'refresh-1', expiresAt: Math.floor(Date.now() / 1000) + 3600 })]]);
const kept = (local: Map<string, string>) => JSON.parse(local.get('invitation') ?? 'null') as { token: string; at: number } | null;

/** A fetch that records the API calls and answers them. */
function api(accept: () => Response = () => json({ organization: { id: 'org-1', name: 'Acme Rockets' }, membership: { role: 'member' } })) {
  const calls: Array<{ url: string; method: string; body?: unknown; authorization?: string }> = [];
  const fetch = async (input: string, init?: RequestInit) => {
    const headers = (init?.headers ?? {}) as Record<string, string>;
    calls.push({ url: input, method: init?.method ?? 'GET', body: init?.body ? JSON.parse(String(init.body)) : undefined, authorization: headers.authorization });
    if (input === '/api/me') return json({ userId: 'user-ivy', email: 'ivy@example.test' });
    if (input === '/api/organizations/invitations/accept') return accept();
    return json({}, 404);
  };
  return { calls, fetch };
}

describe('the page that accepts an invitation', () => {
  it('is framed like every page, sends the visitor to sign in and back, and loads its script', () => {
    const html = acceptInvitationPage().value;
    expect(html).toContain('<header class="m-navbar">');
    expect(html).toContain('<script type="module" src="/assets/accept-invitation.js"></script>');
    expect(html).toContain(\`href="\${SIGN_IN_AND_RETURN}"\`);
    expect(SIGN_IN_AND_RETURN).toBe('/api/sign-in#return=${ACCEPT_INVITATION_PATH}');
  });

  it('takes the token out of the address bar, keeps it in this browser, and asks a visitor who is signed out to sign in', async () => {
    const { calls, fetch } = api();
    const tab = await openPage({ script, url: page + '#token=' + TOKEN, fetch });
    expect(tab.url()).toBe(page);
    expect(kept(tab.local)?.token).toBe(TOKEN);
    expect(tab.text('invitation-status')).toMatch(/^Sign in, or sign up/);
    expect(tab.hidden('invitation-sign-in')).toBe(false);
    expect(tab.hidden('invitation-accept')).toBe(true);
    // Nothing was sent anywhere
    expect(calls).toEqual([]);
  });

  it('accepts as the signed-in user only when they click Accept, then forgets the token', async () => {
    const { calls, fetch } = api();
    const local = new Map([['invitation', JSON.stringify({ token: TOKEN, at: Math.floor(Date.now() / 1000) })]]);
    // Back from the sign-in page, in a tab with a session, with no token in the address any more
    const tab = await openPage({ script, url: page, fetch, local, session: signedIn() });
    expect(tab.text('invitation-status')).toBe('You are signed in as ivy@example.test. Accept the invitation as this account, or sign in with another.');
    expect(calls.map((c) => c.url)).toEqual(['/api/me']);

    await tab.fire('invitation-accept', 'click');
    expect(calls.at(-1)).toEqual({ url: '/api/organizations/invitations/accept', method: 'POST', body: { token: TOKEN }, authorization: 'Bearer access-1' });
    expect(tab.text('invitation-status')).toBe('You joined Acme Rockets as member.');
    expect(tab.hidden('invitation-done')).toBe(false);
    expect(local.has('invitation')).toBe(false);
  });

  it('says why when the invitation is refused, and forgets a token that is spent', async () => {
    const mismatch = api(() => json({ error: { code: 'organizations/email-mismatch', message: 'x' } }, 403));
    const local = new Map([['invitation', JSON.stringify({ token: TOKEN, at: Math.floor(Date.now() / 1000) })]]);
    const tab = await openPage({ script, url: page, fetch: mismatch.fetch, local, session: signedIn() });
    await tab.fire('invitation-accept', 'click');
    expect(tab.text('invitation-status')).toBe('This invitation was sent to another address. Sign in as that address to accept it.');
    expect(tab.text('invitation-sign-in')).toBe('Use another account');
    expect(tab.hidden('invitation-sign-in')).toBe(false);
    expect(local.has('invitation')).toBe(true);

    const used = api(() => json({ error: { code: 'organizations/invitation-invalid', message: 'x' } }, 400));
    const again = await openPage({ script, url: page, fetch: used.fetch, local, session: signedIn() });
    await again.fire('invitation-accept', 'click');
    expect(again.text('invitation-status')).toMatch(/can no longer be used/);
    expect(local.has('invitation')).toBe(false);
  });

  it('shows a refusal by its code, never by text the answer carries', async () => {
    const { fetch } = api(() => json({ error: { code: 'organizations/suspended', message: 'Call this number' } }, 403));
    const local = new Map([['invitation', JSON.stringify({ token: TOKEN, at: Math.floor(Date.now() / 1000) })]]);
    const tab = await openPage({ script, url: page, fetch, local, session: signedIn() });
    await tab.fire('invitation-accept', 'click');
    expect(tab.text('invitation-status')).toBe('The invitation could not be accepted (organizations/suspended).');
  });

  it('has nothing to accept without a token, or with one more than an hour old', async () => {
    const { calls, fetch } = api();
    const stale = new Map([['invitation', JSON.stringify({ token: TOKEN, at: Math.floor(Date.now() / 1000) - 3601 })]]);
    const tab = await openPage({ script, url: page, fetch, local: stale, session: signedIn() });
    expect(tab.text('invitation-status')).toMatch(/^There is no invitation to accept here/);
    expect(stale.has('invitation')).toBe(false);
    expect(calls).toEqual([]);
  });
});
`;

const JWT_PAGE = `import { html, type Html } from '@mariachi/api-facade';
import { heading, layout } from './layout';

/** How a developer accepts an invitation until the app has a browser sign-in. */
const BY_HAND = \`curl -X POST localhost:3000/api/organizations/invitations/accept \\\\
  -H "authorization: Bearer $(pnpm -s mariachi token --user <user id> --no-tenant --email <invited address>)" \\\\
  -H 'content-type: application/json' -d '{"token":"<the token>"}'\`;

/**
 * The page at ${ACCEPT_INVITATION_PATH}. Accepting an invitation needs the visitor signed in as the
 * invited address, and this app has no sign-in in the browser: it accepts tokens signed with
 * JWT_SECRET, which no browser is given. So the page says what is needed instead of failing. Once
 * the app has a browser sign-in, this page's script reads the token from location.hash, signs the
 * visitor in, then calls POST /api/organizations/invitations/accept with { token } as them; then set
 * INVITATION_URL to this page so the invitation emails link here.
 */
export function acceptInvitationPage(): Html {
  return layout({
    title: 'Accept an invitation',
    path: '${ACCEPT_INVITATION_PATH}',
    body: html\`<div class="m-stack" data-gap="5">
  \${heading('Join an organization')}
  <div class="m-alert" data-tone="info" role="status">
    <div class="m-alert-content">
      <p class="m-alert-title">Invitations can't be accepted in the browser yet</p>
      <p class="m-alert-body">Accepting needs you signed in as the address the invitation was sent to, and this app has no sign-in page yet.</p>
    </div>
  </div>
  <article class="m-card">
    <header class="m-card-header">
      <div>
        <h2 class="m-card-title">For this app's developers</h2>
        <p class="m-card-description">The API checks tokens signed with JWT_SECRET, and nothing gives a browser one.</p>
      </div>
    </header>
    <div class="m-card-body">
      <div class="m-prose">
        <p>For this page to accept invitations, the app needs:</p>
        <ol>
          <li>a sign-in in the browser, whose tokens carry the user's <code>email</code> and <code>email_verified</code>;</li>
          <li>a script for this page that reads the token from the fragment of its address (<code>#token=</code>), signs the visitor in, then calls <code>POST /api/organizations/invitations/accept</code> with <code>{ "token": … }</code> as them;</li>
          <li><code>INVITATION_URL</code> set to this page, so invitation emails link here.</li>
        </ol>
        <p>Until then, accept as the invited user from a terminal. The token is the part of this page's address after <code>#token=</code>.</p>
        <pre><code>\${BY_HAND}</code></pre>
      </div>
    </div>
  </article>
</div>\`,
  });
}
`;

const JWT_TEST = `import { describe, expect, it } from 'vitest';
import { acceptInvitationPage } from './accept-invitation';

describe('the page that accepts an invitation', () => {
  it('says what accepting needs, since this app has no sign-in in the browser, and runs nothing', () => {
    const html = acceptInvitationPage().value;
    expect(html).toContain('<header class="m-navbar">');
    expect(html).toContain('<div class="m-alert" data-tone="info" role="status">');
    expect(html).toContain('POST /api/organizations/invitations/accept');
    // The command is shown as text
    expect(html).toContain('--email &lt;invited address&gt;');
    expect(html).not.toContain('/assets/accept-invitation.js');
  });
});
`;

/**
 * \`src/accept-invitation.e2e.test.ts\` (GoTrue): the page's script, in the generated fake browser,
 * against the running app: the link from the invitation email, a visitor who signs in, and the accept.
 */
const GOTRUE_E2E = `import { TestEmailAdapter } from '@mariachi/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { openPage } from './api/pages/fake-browser';
import { startApp, type RunningApp } from './testing/e2e';

let running: RunningApp;
let outbox: TestEmailAdapter;
beforeAll(async () => {
  outbox = new TestEmailAdapter();
  // The app's own default: the accept page on its origin
  running = await startApp({ mailer: outbox, env: { APP_ORIGIN: 'https://app.example.test' } });
});
afterAll(() => running?.stop());

const ada = { userId: '0b9d4c53-8f0a-4d0e-9a63-5c2f1e7b3a41', tenantId: '', claims: { email: 'ada@example.test', email_verified: true } };
// Ivy as GoTrue's token describes her, with the email_verified claim a hook of yours would add
const ivy = { sub: 'c2a1f0de-7b6c-4e59-8d3a-1f0e9b8c7d62', role: 'authenticated', email: 'ivy@example.test', email_verified: true };

/** The page's requests, sent to the running app. */
const browserFetch = (input: string, init?: RequestInit) => fetch(running.url + input, init);
/** What the sign-in page leaves in a tab once Ivy is signed in. */
function signedIn(): Map<string, string> {
  const token = running.auth.headersForClaims(ivy).authorization.replace(/^Bearer /, '');
  return new Map([['session', JSON.stringify({ accessToken: token, refreshToken: 'unused', expiresAt: Math.floor(Date.now() / 1000) + 3600 })]]);
}

describe('accepting an invitation in the browser', () => {
  it('opens the emailed link, has the visitor sign in, and accepts as them', async () => {
    const created = await running.request('/api/organizations', { as: ada, json: { name: 'Acme Rockets' } });
    const { organization } = (await created.json()) as { organization: { id: string } };
    expect((await running.request(\`/api/organizations/\${organization.id}/invitations\`, { as: ada, json: { email: ivy.email } })).status).toBe(201);
    const words = (outbox.getSentEmails().at(-1)?.text ?? '').split(/\\s+/);
    const link = words.find((word) => word.startsWith('https://app.example.test${ACCEPT_INVITATION_PATH}#token='));
    expect(link).toBeTruthy();

    const page = await (await fetch(running.url + '${ACCEPT_INVITATION_PATH}')).text();
    expect(page).toContain('<script type="module" src="/assets/accept-invitation.js"></script>');
    const script = await (await fetch(running.url + '/assets/accept-invitation.js')).text();

    // Signed out: the token is kept and the visitor is asked to sign in
    const first = await openPage({ script, url: link as string, fetch: browserFetch });
    expect(first.hidden('invitation-sign-in')).toBe(false);
    // Back from signing in, in a tab with her session
    const back = await openPage({ script, url: 'https://app.example.test${ACCEPT_INVITATION_PATH}', fetch: browserFetch, local: first.local, session: signedIn() });
    expect(back.text('invitation-status')).toMatch(/^You are signed in as ivy@example\\.test/);
    await back.fire('invitation-accept', 'click');
    expect(back.text('invitation-status')).toBe('You joined Acme Rockets as member.');

    const hers = (await (await running.request('/api/organizations', { claims: ivy })).json()) as Array<{ organization: { id: string }; role: string }>;
    expect(hers).toContainEqual(expect.objectContaining({ organization: expect.objectContaining({ id: organization.id }), role: 'member' }));
  });
});
`;

/** The page's files. */
export function acceptInvitationFiles(auth: ProjectAuth, e2e: boolean): Record<string, string> {
  if (auth !== 'gotrue') return { [ACCEPT_INVITATION_FILE]: JWT_PAGE, 'src/api/pages/accept-invitation.test.ts': JWT_TEST };
  return {
    [ACCEPT_INVITATION_FILE]: GOTRUE_PAGE,
    'src/api/pages/accept-invitation.test.ts': GOTRUE_TEST,
    [ACCEPT_INVITATION_SCRIPT]: GOTRUE_SCRIPT,
    ...(e2e ? { [ACCEPT_INVITATION_E2E_FILE]: GOTRUE_E2E } : {}),
  };
}
