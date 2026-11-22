import { DEFAULT_PAGE_CSP, type Html, html, safeHref } from '@mariachi/api-facade';
import { fromZodError } from '@mariachi/core';
import { SignJWT } from 'jose';
import { settingError } from './errors';
import { ChatUser } from './schemas';

/** Where an Intercom workspace's data lives (`INTERCOM_REGION`). */
export const REGIONS = ['us', 'eu', 'au'] as const;
export type IntercomRegion = (typeof REGIONS)[number];

/** The REST API's address for each region. */
export const API_BASE: Record<IntercomRegion, string> = {
  us: 'https://api.intercom.io',
  eu: 'https://api.eu.intercom.io',
  au: 'https://api.au.intercom.io',
};

/** The Messenger's `api_base` for each region. */
export const MESSENGER_API_BASE: Record<IntercomRegion, string> = {
  us: 'https://api-iam.intercom.io',
  eu: 'https://api-iam.eu.intercom.io',
  au: 'https://api-iam.au.intercom.io',
};

/** Where the app serves the Messenger's loader (`@mariachi/integration-intercom/intercom.js`). */
export const INTERCOM_SCRIPT_PATH = '/assets/lib/intercom.js';

/**
 * Who the Messenger is talking to, signed on the server: a JWT (HS256, the Messenger API secret) carrying the user's
 * `user_id`, so nobody can open another user's conversations by changing an id in the page. Make one per page
 * render; it expires (`expiresAt`).
 */
export interface ChatIdentity {
  /** The app's own id for the user. */
  userId: string;
  /** The JWT the Messenger takes as `intercom_user_jwt`. Not a secret from the user it names, but don't log it. */
  token: string;
  expiresAt: Date;
}

export interface ChatIdentityOptions {
  /** Seconds the identity is good for: 3600 by default, at least 300 (Intercom's advice). */
  expiresIn?: number;
  /** For tests: the clock. */
  now?: () => number;
}

/**
 * Signs the user's identity for the Messenger with the Messenger API secret: HS256, with `user_id` (the app's id),
 * `email`, `name`, `created_at` and the `company` (`company_id`, `name`) as claims, and an `exp`. Intercom updates
 * the user's profile from them, so what's signed can't be changed in the browser.
 */
export async function signChatIdentity(secret: string | undefined, user: ChatUser, options: ChatIdentityOptions = {}): Promise<ChatIdentity> {
  if (!secret) {
    throw settingError('no-messenger-secret', 'Set INTERCOM_MESSENGER_SECRET to identify users in the Messenger: Settings › Workspace › Security › Messenger');
  }
  const parsed = ChatUser.safeParse(user);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Intercom chat user');
  const u = parsed.data;
  const expiresIn = options.expiresIn ?? 3600;
  if (!Number.isInteger(expiresIn) || expiresIn < 300) throw settingError('invalid-expiry', 'A Messenger identity lasts at least 300 seconds, as a whole number');
  const now = Math.floor((options.now ?? Date.now)() / 1000);
  const claims: Record<string, unknown> = { user_id: u.id };
  if (u.email) claims.email = u.email;
  if (u.name) claims.name = u.name;
  if (u.createdAt) claims.created_at = Math.floor(u.createdAt.getTime() / 1000);
  // Company data must be nested under `company`: flat company claims are ignored
  if (u.company) claims.company = { company_id: u.company.id, ...(u.company.name ? { name: u.company.name } : {}) };
  const token = await new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresIn)
    .sign(new TextEncoder().encode(secret));
  return { userId: u.id, token, expiresAt: new Date((now + expiresIn) * 1000) };
}

export interface WidgetSnippetOptions {
  /** The signed-in user, from `chatIdentity`. Left out, the Messenger talks to an anonymous visitor. */
  identity?: ChatIdentity;
  /** Hide Intercom's launcher button, to open the Messenger from the app's own (`window.Intercom('show')`). */
  hideDefaultLauncher?: boolean;
  /** Where the loader is served; `/assets/lib/intercom.js` by default. */
  src?: string;
}

/**
 * The Messenger for a page: one `<script>`, the loader this package ships (a file the app serves, since a Mariachi
 * page runs no inline script), with the workspace, region and signed identity in `data-` attributes. The loader
 * then loads Intercom's widget from widget.intercom.io.
 */
export function messengerSnippet(appId: string | undefined, region: IntercomRegion, options: WidgetSnippetOptions = {}): Html {
  if (!appId) throw settingError('no-app-id', 'Set INTERCOM_APP_ID (the workspace ID) to put the Messenger on a page');
  if (!/^[A-Za-z0-9]+$/.test(appId)) throw settingError('invalid-app-id', 'INTERCOM_APP_ID is the workspace ID, letters and digits: the part of the Intercom address after /apps/');
  const jwt = options.identity?.token;
  if (jwt !== undefined && !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(jwt)) throw settingError('invalid-identity', 'The identity is not a JWT from chatIdentity');
  return html`<script src="${safeHref(options.src ?? INTERCOM_SCRIPT_PATH)}" data-app-id="${appId}" data-api-base="${MESSENGER_API_BASE[region]}"${jwt ? html` data-user-jwt="${jwt}"` : null}${options.hideDefaultLauncher ? html` data-hide-default-launcher` : null}></script>`;
}

// Intercom's source allowlist for the Messenger, every region (only the workspace's own region's hosts are used):
// https://www.intercom.com/help/en/articles/3894-using-intercom-with-content-security-policy
const FRAMES = ['https://intercom-sheets.com', 'https://www.intercom-reporting.com', 'https://www.youtube.com', 'https://player.vimeo.com', 'https://fast.wistia.net'];
const INTERCOM_SOURCES: Record<string, string[]> = {
  'script-src': ['https://app.intercom.io', 'https://widget.intercom.io', 'https://js.intercomcdn.com'],
  'connect-src': [
    'https://via.intercom.io',
    'https://api.intercom.io',
    'https://api.au.intercom.io',
    'https://api.eu.intercom.io',
    'https://api-iam.intercom.io',
    'https://api-iam.eu.intercom.io',
    'https://api-iam.au.intercom.io',
    'https://api-ping.intercom.io',
    'https://*.intercom-messenger.com',
    'wss://*.intercom-messenger.com',
    'https://nexus-websocket-a.intercom.io',
    'wss://nexus-websocket-a.intercom.io',
    'https://nexus-websocket-b.intercom.io',
    'wss://nexus-websocket-b.intercom.io',
    'https://nexus-europe-websocket.intercom.io',
    'wss://nexus-europe-websocket.intercom.io',
    'https://nexus-australia-websocket.intercom.io',
    'wss://nexus-australia-websocket.intercom.io',
    'https://uploads.intercomcdn.com',
    'https://uploads.intercomcdn.eu',
    'https://uploads.au.intercomcdn.com',
    'https://uploads.eu.intercomcdn.com',
    'https://uploads.intercomusercontent.com',
  ],
  'child-src': FRAMES,
  'font-src': ['https://js.intercomcdn.com', 'https://fonts.intercomcdn.com'],
  'form-action': ['https://intercom.help', 'https://api-iam.intercom.io', 'https://api-iam.eu.intercom.io', 'https://api-iam.au.intercom.io'],
  'media-src': ['https://js.intercomcdn.com', 'https://downloads.intercomcdn.com', 'https://downloads.intercomcdn.eu', 'https://downloads.au.intercomcdn.com'],
  'img-src': [
    'blob:',
    'data:',
    'https://js.intercomcdn.com',
    'https://static.intercomassets.com',
    'https://downloads.intercomcdn.com',
    'https://downloads.intercomcdn.eu',
    'https://downloads.au.intercomcdn.com',
    'https://uploads.intercomusercontent.com',
    'https://gifs.intercomcdn.com',
    'https://video-messages.intercomcdn.com',
    'https://messenger-apps.intercom.io',
    'https://messenger-apps.eu.intercom.io',
    'https://messenger-apps.au.intercom.io',
    'https://*.intercom-attachments-1.com',
    'https://*.intercom-attachments.eu',
    'https://*.au.intercom-attachments.com',
    'https://*.intercom-attachments-2.com',
    'https://*.intercom-attachments-3.com',
    'https://*.intercom-attachments-4.com',
    'https://*.intercom-attachments-5.com',
    'https://*.intercom-attachments-6.com',
    'https://*.intercom-attachments-7.com',
    'https://*.intercom-attachments-8.com',
    'https://*.intercom-attachments-9.com',
    'https://static.intercomassets.eu',
    'https://static.au.intercomassets.com',
  ],
  'style-src': ["'unsafe-inline'"],
};
/** Where else a directive's sources also go when the policy has it: frames and workers that `child-src` covers. */
const ALSO = { 'child-src': ['frame-src', 'worker-src'] } as Record<string, string[]>;
/** Directives that don't fall back to `default-src`: absent, nothing is restricted, so none is added. */
const NO_FALLBACK = new Set(['form-action']);

/**
 * A page's Content-Security-Policy with what Intercom's Messenger needs added: Intercom's published source allowlist
 * (scripts from widget.intercom.io and js.intercomcdn.com, its API and realtime hosts, its frames, fonts, media and
 * images). `policy` is the page's own (by default `htmlResponse`'s); everything else in it stays. The page's own
 * scripts still come from its origin only, and inline script still doesn't run.
 */
export function intercomCsp(policy: string = DEFAULT_PAGE_CSP): string {
  const directives = policy
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => d.split(/\s+/));
  const find = (name: string) => directives.find((d) => d[0] === name);
  const fallback = find('default-src')?.slice(1);
  for (const [name, sources] of Object.entries(INTERCOM_SOURCES)) {
    const targets = [name, `${name}-elem`, ...(ALSO[name] ?? [])].map(find).filter((d): d is string[] => d !== undefined);
    // Without the directive or a default-src, the policy doesn't restrict this kind of request at all
    if (!find(name) && fallback && !NO_FALLBACK.has(name)) {
      const created = [name, ...fallback.filter((s) => s !== "'none'")];
      directives.push(created);
      targets.push(created);
    }
    for (const d of targets) for (const s of sources) if (!d.includes(s)) d.push(s);
  }
  return directives.map((d) => d.join(' ')).join('; ');
}
