import { DEFAULT_PAGE_CSP, type Html, html, safeHref } from '@mariachi/api-facade';
import { settingError } from './errors';
import type { ChatIdentity } from './schemas';

/** Where the app serves the widget's setup script (`@mariachi/integration-zendesk/zendesk-messenger.js`). */
export const ZENDESK_MESSENGER_SCRIPT_PATH = '/assets/lib/zendesk-messenger.js';

/** What the widget may store: Zendesk's own three settings for `zE('messenger:set', 'cookies', …)`. */
export type WidgetCookies = 'all' | 'functional' | 'none';

export interface WidgetSnippetOptions {
  /** The signed-in user, from `chatIdentity`. Left out, the visitor chats anonymously. */
  identity?: ChatIdentity;
  /**
   * A path on the app that answers a signed-in user with `{ "token": "<a fresh chatIdentity token>" }` (and 401
   * otherwise), for when the widget asks again once the page's token has expired. Same origin only.
   */
  tokenUrl?: string;
  /**
   * What the visitor agreed the widget may store. `functional` (the default) keeps everything but Zendesk's
   * analytics cookies; `all` adds them (pages viewed, proactive message analytics); `none` stores nothing, which
   * hides the widget.
   */
  cookies?: WidgetCookies;
  /** Where the setup script is served; `/assets/lib/zendesk-messenger.js` by default. */
  src?: string;
}

/**
 * The messaging Web Widget for a page: Zendesk's snippet, then the setup script this package ships (a Mariachi page
 * runs no inline script), which sets the cookie choice and, given `identity`, signs the user in.
 */
export function zendeskWidgetSnippet(widgetKey: string, options: WidgetSnippetOptions = {}): Html {
  const key = checkedWidgetKey(widgetKey);
  const cookies = options.cookies ?? 'functional';
  if (!['all', 'functional', 'none'].includes(cookies)) throw settingError('invalid-cookies', "cookies is 'all', 'functional' or 'none'");
  const tokenUrl = options.tokenUrl === undefined ? undefined : checkedTokenUrl(options.tokenUrl);
  const identity = options.identity;
  return html`<script id="ze-snippet" src="https://static.zdassets.com/ekr/snippet.js?key=${key}"></script>
<script src="${safeHref(options.src ?? ZENDESK_MESSENGER_SCRIPT_PATH)}" data-cookies="${cookies}"${identity ? html` data-token="${identity.token}"` : null}${tokenUrl ? html` data-token-url="${tokenUrl}"` : null}></script>`;
}

// What the widget loads and talks to, from Zendesk's list for a custom policy:
// https://developer.zendesk.com/documentation/zendesk-web-widget-sdks/sdks/web/csp/
// Zendesk's list also has https://*.ingest.*.sentry.io (the widget's own error reports). A wildcard is allowed only
// at the start of a host, so browsers ignore that source and warn about it; it's left out, which blocks only those reports.
const ZENDESK_HOSTS = [
  'https://*.zdassets.com',
  'https://*.zendesk.com',
  'https://*.smooch.io',
  'https://*.twilio.com',
  'wss://*.zendesk.com',
  'wss://api.smooch.io',
  'wss://voice-js.roaming.twilio.com',
];
const ZENDESK_IMAGES = ['https://static.zdassets.com', 'https://*.zendesk.com', 'https://media.smooch.io', 'https://*.zdusercontent.com', 'blob:', 'data:'];
const ZENDESK_MEDIA = ['https://static.zdassets.com'];
/** The fetch directives a policy may set instead of relying on `default-src`: each gets the widget's hosts. */
const FETCH_DIRECTIVES = ['script-src', 'script-src-elem', 'connect-src', 'frame-src', 'child-src', 'font-src', 'worker-src', 'manifest-src'];

/**
 * A page's Content-Security-Policy with what the messaging Web Widget needs added: Zendesk's hosts in `default-src`
 * and in every fetch directive the policy sets on its own (`script-src`, `connect-src`, `frame-src`, `font-src`…),
 * its images and media, and inline styles. `policy` is the page's own (by default `htmlResponse`'s); everything else
 * in it stays, and inline script still doesn't run.
 *
 * ```ts
 * htmlResponse(page, { csp: zendeskCsp() });
 * ```
 *
 * This is Zendesk's list for a policy that isn't Google's strict, nonce-based kind. Zendesk says it can't guarantee
 * a custom policy, so check the browser console after a change to the widget's features.
 */
export function zendeskCsp(policy: string = DEFAULT_PAGE_CSP): string {
  const directives = policy
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => d.split(/\s+/));
  const find = (name: string) => directives.find((d) => d[0] === name);
  const add = (d: string[], sources: readonly string[]) => {
    for (const s of sources) if (!d.includes(s)) d.push(s);
    const none = d.indexOf("'none'");
    if (none > 0 && d.length > 2) d.splice(none, 1);
  };
  const fallback = find('default-src');
  if (fallback) add(fallback, ZENDESK_HOSTS);
  for (const name of FETCH_DIRECTIVES) {
    const d = find(name);
    if (d) add(d, ZENDESK_HOSTS);
  }
  // Images, media and styles get their own lists. A directive the policy doesn't set falls back to default-src,
  // so it's made from default-src's sources (before the widget's hosts were added) plus the list.
  const base = (fallback ?? []).slice(1).filter((s) => !ZENDESK_HOSTS.includes(s) && s !== "'none'");
  for (const [name, sources] of [
    ['img-src', ZENDESK_IMAGES],
    ['media-src', ZENDESK_MEDIA],
    ['style-src', ["'unsafe-inline'"]],
  ] as const) {
    let d = find(name);
    if (!d) {
      if (!fallback) continue;
      d = [name, ...base];
      directives.push(d);
    }
    add(d, sources);
  }
  return directives.map((d) => d.join(' ')).join('; ');
}

/** The widget key, or `zendesk/invalid-widget-key`: only letters, digits and dashes reach a page or a URL. */
export function checkedWidgetKey(key: string | undefined): string {
  if (!key) throw settingError('no-widget-key', 'Set the Web Widget key (ZENDESK_WIDGET_KEY): Admin Center › Channels › Messaging and social › Messaging › your widget › Installation, the key= in the snippet');
  if (!/^[A-Za-z0-9-]{1,64}$/.test(key)) {
    throw settingError('invalid-widget-key', 'The Web Widget key (ZENDESK_WIDGET_KEY) is the key= value of the snippet, letters, digits and dashes: Admin Center › Channels › Messaging and social › Messaging › your widget › Installation');
  }
  return key;
}

function checkedTokenUrl(url: string): string {
  // The page's own origin only: the token is a credential for the user
  if (!/^\/(?![/\\])[^\s]*$/.test(url)) throw settingError('invalid-token-url', 'tokenUrl is a path on the app itself, such as /chat/token');
  return url;
}
