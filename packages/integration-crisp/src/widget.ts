import { createHmac } from 'node:crypto';
import { DEFAULT_PAGE_CSP, type Html, html, safeHref } from '@mariachi/api-facade';
import { fromZodError } from '@mariachi/core';
import { CrispError, missingSetting } from './errors';
import { ChatUser, type DataRecord } from './schemas';

/**
 * Who the chat widget says the visitor is, made on the server by `crisp.chatIdentity(user)` and put in the page by
 * `crisp.widgetSnippet({ identity })`. Nothing in it is secret from the user it belongs to; render it only in that
 * user's own pages.
 */
export interface ChatIdentity {
  provider: 'crisp';
  /** The app's id for the user. */
  userId: string;
  /**
   * The session token (`CRISP_TOKEN_ID`) that ties the user's conversations to them on every device and browser.
   * Derived from the user's id with the identity secret, so it's the same each time and nobody can guess another
   * user's.
   */
  tokenId: string;
  /** The user's email and its signature: Crisp shows the conversation as verified. Absent when the user has no email. */
  email?: string;
  emailSignature?: string;
  nickname?: string;
  company?: string;
  /** Set on the conversation as its data (`user_id`, `company_id`, `signed_up_at`). The browser sends it, so it isn't verified. */
  data: DataRecord;
}

/** Where the app serves the widget's loader (`@mariachi/integration-crisp/crisp.js`). */
export const CRISP_SCRIPT_PATH = '/assets/lib/crisp.js';

export interface WidgetSnippetOptions {
  /** The signed-in user, from `crisp.chatIdentity(user)`. Left out, the visitor chats anonymously. */
  identity?: ChatIdentity;
  /** The widget's language (`fr`, `pt-br`); left out, Crisp follows the browser's. */
  locale?: string;
  /**
   * Unbinds the browser from the last signed-in user's conversations. Set it on the first page after signing out,
   * so the next person on the same browser doesn't see them.
   */
  resetSession?: boolean;
  /** Where the loader is served; `/assets/lib/crisp.js` by default. */
  src?: string;
}

/** The website ID, or `crisp/invalid-website-id`: only letters, digits and dashes reach a page. */
export function checkedWebsiteId(id: string): string {
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(id)) {
    throw missingSetting('invalid-website-id', 'The Crisp website ID (CRISP_WEBSITE_ID) is letters, digits and dashes: Settings › Workspace Settings › Setup & Integrations');
  }
  return id;
}

/**
 * The identity for `widgetSnippet`, signed with the identity secret, as Crisp's identity verification requires: the
 * email's HMAC-SHA256 in hex, and a session token derived from the user's id. Never compute either in the browser.
 */
export async function chatIdentityFor(secret: string | undefined, user: ChatUser): Promise<ChatIdentity> {
  if (!secret) throw missingSetting('no-identity-secret', 'Set the identity verification secret (CRISP_IDENTITY_SECRET) to identify users in the chat widget');
  const parsed = ChatUser.safeParse(user);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Crisp chat user');
  const u = parsed.data;
  const data: DataRecord = { user_id: u.id };
  if (u.company) data.company_id = u.company.id;
  if (u.createdAt) data.signed_up_at = u.createdAt.toISOString();
  return {
    provider: 'crisp',
    userId: u.id,
    tokenId: sessionToken(secret, u.id),
    ...(u.email ? { email: u.email, emailSignature: emailSignature(secret, u.email) } : {}),
    ...(u.name ? { nickname: u.name } : {}),
    ...(u.company?.name ? { company: u.company.name } : {}),
    data,
  };
}

/** Crisp's identity verification signature: the hex HMAC-SHA256 of the email, keyed with the website's secret. */
export function emailSignature(secret: string, email: string): string {
  return createHmac('sha256', secret).update(email).digest('hex');
}

/** A UUID-shaped token for the user, the same every time, that only someone with the secret can work out. */
function sessionToken(secret: string, userId: string): string {
  const h = createHmac('sha256', secret).update(`mariachi-crisp-session:${userId}`).digest('hex');
  const variant = ((Number.parseInt(h[16] as string, 16) & 0x3) | 0x8).toString(16);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-${variant}${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

/**
 * The chat widget for a page's `<head>` or the end of its `<body>`: one `<script>`, the loader this package ships
 * (a Mariachi page runs no inline script), which sets the website, the user's session token and verified email,
 * then loads Crisp's `l.js`. Send the page with `crispCsp()` as its policy.
 */
export function widgetSnippetFor(websiteId: string, options: WidgetSnippetOptions = {}): Html {
  const id = checkedWebsiteId(websiteId);
  const identity = options.identity;
  if (identity && identity.provider !== 'crisp') throw new CrispError('crisp/foreign-identity', 'This identity was made for another chat provider', { category: 'invalid-request' });
  const locale = options.locale && /^[a-z]{2}(-[a-z]{2})?$/i.test(options.locale) ? options.locale.toLowerCase() : undefined;
  return html`<script src="${safeHref(options.src ?? CRISP_SCRIPT_PATH)}" data-website-id="${id}"${
    identity
      ? html` data-token-id="${identity.tokenId}"${identity.email && identity.emailSignature ? html` data-email="${identity.email}" data-email-signature="${identity.emailSignature}"` : null}${
          identity.nickname ? html` data-nickname="${identity.nickname}"` : null
        }${identity.company ? html` data-company="${identity.company}"` : null} data-session-data="${JSON.stringify(identity.data)}"`
      : null
  }${locale ? html` data-locale="${locale}"` : null}${options.resetSession && !identity ? html` data-reset` : null} defer></script>`;
}

// What the widget loads and talks to: Crisp's sample policy,
// https://docs.crisp.chat/guides/others/whitelisting-our-systems/crisp-domain-names/
const CRISP_SOURCES = {
  'script-src': ['https://*.crisp.chat'],
  'style-src': ["'unsafe-inline'", 'https://*.crisp.chat'],
  'img-src': ['data:', 'https://*.crisp.chat'],
  'font-src': ['https://*.crisp.chat'],
  'media-src': ['https://*.crisp.chat'],
  'frame-src': ['https://*.crisp.chat', 'https://*.crisp.help'],
  'worker-src': ['blob:', 'https://*.crisp.chat'],
  'connect-src': ['https://*.crisp.chat', 'wss://*.relay.crisp.chat', 'wss://*.relay.rescue.crisp.chat'],
} as const;

/**
 * A page's Content-Security-Policy with what Crisp's widget needs added, from Crisp's own list: its scripts, styles,
 * fonts, images and workers from `*.crisp.chat`, its frames (and Helpdesk articles on `*.crisp.help`), and its
 * WebSocket relays. `policy` is the page's own (by default `htmlResponse`'s); everything else in it stays, and inline
 * script still doesn't run. A Helpdesk on a custom domain needs that domain in `frame-src` too.
 */
export function crispCsp(policy: string = DEFAULT_PAGE_CSP): string {
  const directives = policy
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => d.split(/\s+/));
  const find = (name: string) => directives.find((d) => d[0] === name);
  const fallback = find('default-src')?.slice(1);
  for (const [name, sources] of Object.entries(CRISP_SOURCES)) {
    const targets = [name, `${name}-elem`].map(find).filter((d): d is string[] => d !== undefined);
    // Without the directive or a default-src, the policy doesn't restrict this kind of request at all
    if (!targets.some((d) => d[0] === name) && fallback) {
      const created = [name, ...fallback.filter((s) => s !== "'none'")];
      directives.push(created);
      targets.push(created);
    }
    for (const d of targets) for (const s of sources) if (!d.includes(s)) d.push(s);
  }
  return directives.map((d) => d.join(' ')).join('; ');
}
