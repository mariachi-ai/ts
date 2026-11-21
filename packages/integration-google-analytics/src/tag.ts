import { DEFAULT_PAGE_CSP, type Html, html, safeHref } from '@mariachi/api-facade';
import { settingError } from './errors';
import { MEASUREMENT_ID } from './schemas';

/** Consent Mode v2's four consent types. Each starts denied; the visitor's choice grants them. */
export const CONSENT_TYPES = ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage'] as const;
export type ConsentType = (typeof CONSENT_TYPES)[number];

/** What the visitor granted, by consent type. A type left out, or `false`, stays denied. */
export type ConsentGrant = Partial<Record<ConsentType, boolean>>;

/** Where the app serves the tag's setup script (`@mariachi/integration-google-analytics/gtag.js`). */
export const GTAG_SCRIPT_PATH = '/assets/lib/gtag.js';

export interface GtagSnippetOptions {
  /** The web stream's `G-` ID (`GA_MEASUREMENT_ID`). Anything else is refused. */
  measurementId: string;
  /**
   * What this visitor already granted, read from the app's own consent cookie, so a returning visitor's choice holds
   * from the first event on every page. Left out, everything is denied until the banner calls
   * `gtag('consent', 'update', …)`.
   */
  consent?: ConsentGrant;
  /** Where the setup script is served; `/assets/lib/gtag.js` by default. */
  src?: string;
}

/**
 * The Google tag for a page's `<head>`, with Consent Mode v2: every consent type (`ad_storage`, `ad_user_data`,
 * `ad_personalization`, `analytics_storage`) is denied by default, before gtag.js loads and before anything is
 * measured, and only what `consent` grants is updated to granted.
 *
 * Two scripts: the setup (a file the app serves, since a Mariachi page runs no inline script) and Google's gtag.js.
 * Put them in the layout's `<head>`, after the stylesheets, and send the page with `gtagCsp()` as its policy:
 *
 * ```ts
 * html`<head>…${STYLESHEETS.map(…)}${gtagSnippet({ measurementId, consent })}</head>`
 * htmlResponse(page, { csp: gtagCsp() });
 * api.withStaticFile('/assets/lib/gtag.js', packageFile('@mariachi/integration-google-analytics/gtag.js'));
 * ```
 *
 * The tag loads before consent and, while denied, sends Google cookieless pings (Consent Mode's "advanced" setup).
 * For the "basic" setup, render the snippet only once the visitor has granted `analytics_storage`.
 */
export function gtagSnippet(options: GtagSnippetOptions): Html {
  const id = checkedMeasurementId(options.measurementId);
  const update = consentUpdate(options.consent ?? {});
  const granted = CONSENT_TYPES.filter((t) => update[t] === 'granted').join(' ');
  return html`<script src="${safeHref(options.src ?? GTAG_SCRIPT_PATH)}" data-measurement-id="${id}"${granted ? html` data-granted="${granted}"` : null}></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>`;
}

/**
 * The parameters of a Consent Mode update, every type named: what the banner passes to
 * `gtag('consent', 'update', …)` when the visitor chooses. Types not granted are `denied`.
 *
 * ```ts
 * consentUpdate({ analytics_storage: true });
 * // { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' }
 * ```
 */
export function consentUpdate(granted: ConsentGrant): Record<ConsentType, 'granted' | 'denied'> {
  return Object.fromEntries(CONSENT_TYPES.map((t) => [t, granted[t] === true ? 'granted' : 'denied'])) as Record<ConsentType, 'granted' | 'denied'>;
}

// What the Google tag loads and calls, for Google Analytics without Ads features:
// https://developers.google.com/tag-platform/security/guides/csp
const GTAG_SOURCES = {
  'script-src': ['https://www.googletagmanager.com'],
  'img-src': ['https://www.googletagmanager.com', 'https://*.google-analytics.com'],
  'connect-src': ['https://www.googletagmanager.com', 'https://*.google-analytics.com', 'https://*.google.com'],
} as const;

/**
 * A page's Content-Security-Policy with what the Google tag needs added: gtag.js from www.googletagmanager.com, and
 * its hits to Google Analytics. `policy` is the page's own (by default `htmlResponse`'s); everything else in it stays.
 * The page's own scripts still come from its origin only, and inline script still doesn't run.
 *
 * This is Google's list for Analytics without Ads features. A property linked to Google Ads needs more origins
 * (Google's CSP guide lists them).
 */
export function gtagCsp(policy: string = DEFAULT_PAGE_CSP): string {
  const directives = policy
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => d.split(/\s+/));
  const find = (name: string) => directives.find((d) => d[0] === name);
  const fallback = find('default-src')?.slice(1);
  for (const [name, sources] of Object.entries(GTAG_SOURCES)) {
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

/** The measurement ID, or `google-analytics/invalid-measurement-id`: only `G-` and capital letters and digits reach a page or a URL. */
export function checkedMeasurementId(id: string): string {
  if (typeof id !== 'string' || !MEASUREMENT_ID.test(id)) {
    throw settingError('invalid-measurement-id', 'The measurement ID (GA_MEASUREMENT_ID) is G- followed by capital letters and digits: Admin › Data streams › your web stream');
  }
  return id;
}
