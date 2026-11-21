import { DEFAULT_PAGE_CSP } from '@mariachi/api-facade';

/** Where the app serves the widget's loader (`@mariachi/integration-tawk-to/tawk-to.js`). */
export const TAWK_TO_SCRIPT_PATH = '/assets/lib/tawk-to.js';

// What the widget loads and talks to, from Tawk.to's own list:
// https://help.tawk.to/article/why-are-images-not-showing-up-in-the-widget
const TAWK_SOURCES = {
  'script-src': ['https://*.tawk.to', 'https://cdn.jsdelivr.net'],
  'style-src': ['https://*.tawk.to', 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
  'frame-src': ['https://*.tawk.to'],
  'font-src': ['https://*.tawk.to', 'https://fonts.gstatic.com'],
  'img-src': ['https://*.tawk.to', 'https://cdn.jsdelivr.net', 'https://tawk.link', 'https://s3.amazonaws.com'],
  'connect-src': ['https://*.tawk.to', 'wss://*.tawk.to'],
  'form-action': ['https://*.tawk.to'],
} as const;

/**
 * A page's Content-Security-Policy with what the Tawk.to widget needs added: its script, styles, frames, fonts and
 * images from `*.tawk.to` and the few other hosts Tawk.to lists, and its connection (`wss://*.tawk.to`). `policy` is
 * the page's own (by default `htmlResponse`'s); everything else in it stays, and inline script still doesn't run.
 *
 * ```ts
 * htmlResponse(page, { csp: tawkToCsp() });
 * ```
 */
export function tawkToCsp(policy: string = DEFAULT_PAGE_CSP): string {
  const directives = policy
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => d.split(/\s+/));
  const find = (name: string) => directives.find((d) => d[0] === name);
  const fallback = find('default-src')?.slice(1);
  for (const [name, sources] of Object.entries(TAWK_SOURCES)) {
    const targets = [name, `${name}-elem`].map(find).filter((d): d is string[] => d !== undefined);
    // form-action doesn't fall back to default-src: without it, forms may post anywhere already
    if (!targets.some((d) => d[0] === name) && fallback && name !== 'form-action') {
      const created = [name, ...fallback.filter((s) => s !== "'none'")];
      directives.push(created);
      targets.push(created);
    }
    for (const d of targets) for (const s of sources) if (!d.includes(s)) d.push(s);
  }
  return directives.map((d) => d.join(' ')).join('; ');
}
