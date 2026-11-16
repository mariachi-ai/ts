import { HttpResponse } from '@mariachi/server';

/**
 * Markup that is safe to send: built by `html`, which escapes what is put into it, or vouched for
 * with `raw`. A plain string is never one of these, so text can't reach a page unescaped by accident.
 */
export class Html {
  constructor(readonly value: string) {}

  toString(): string {
    return this.value;
  }
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Text as it may appear between tags or inside a quoted attribute. */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ESCAPES[c] as string);
}

function render(value: unknown): string {
  if (value instanceof Html) return value.value;
  if (value === null || value === undefined || value === false || value === true) return '';
  if (Array.isArray(value)) return value.map(render).join('');
  return escapeHtml(typeof value === 'string' ? value : String(value));
}

/**
 * A page, or a piece of one, as a template:
 *
 * ```ts
 * const row = (note: Note) => html`<li class="m-list-item">${note.title}</li>`;
 * html`<ul class="m-list">${notes.map(row)}</ul>`
 * ```
 *
 * Everything put in with `${}` is escaped, so a title of `<script>` is shown, not run. Another `html`
 * piece goes in as it is; a list of pieces is joined; `null`, `undefined` and booleans are nothing
 * (`${isOwner && html`…`}`).
 *
 * The escaping is right for text between tags and for a quoted attribute value (`title="${name}"`).
 * It is not enough anywhere else, so don't put values there: not in an unquoted attribute, not inside
 * `<script>` or `<style>`, never in a `style="…"` attribute (escaped text is still CSS there, and can
 * hide or cover parts of the page), and not as a whole `href` or `src` unless you have checked it is
 * a link you mean (`safeHref`). Data for a script goes in a `data-` attribute, which the script reads.
 */
export function html(strings: TemplateStringsArray, ...values: unknown[]): Html {
  let out = strings[0] as string;
  for (let i = 0; i < values.length; i++) out += render(values[i]) + (strings[i + 1] as string);
  return new Html(out);
}

/** Markup you vouch for, used as it is. Never for anything a user wrote. */
export function raw(markup: string): Html {
  return new Html(markup);
}

/**
 * A link target that is safe to put in `href` or `src`: a path on this site (`/notes/1`, `?page=2`,
 * `#top`) or an `http:`, `https:` or `mailto:` address. Anything else (`javascript:`, `data:`, an
 * address with a control character or a backslash) becomes `#`.
 */
export function safeHref(target: string): string {
  // Control characters and whitespace are skipped by browsers when they read a scheme. A backslash is
  // read as a slash in a web address, so `/\\evil.example` would be another site.
  if (/[\p{Cc}\\]/u.test(target)) return '#';
  const trimmed = target.trim();
  if (/^(\/(?!\/)|\?|#)/.test(trimmed) || trimmed === '') return trimmed || '#';
  if (/^(https?:\/\/|mailto:)/i.test(trimmed)) return trimmed;
  return '#';
}

export interface HtmlResponseOptions {
  /** Default 200. */
  status?: number;
  /**
   * The page's Content-Security-Policy. By default the page may load scripts, styles, fonts and
   * images from its own origin only (plus `data:` images), talk only to its own origin, be framed by
   * nobody and post forms only to itself. Inline script does not run. Inline styles do, because
   * laying out with `style="…"` and design tokens is how `@mariachi/design` markup is written; an
   * injected style can change how a page looks, not what it does. Give your own policy
   * to widen it for a named origin. `false` sets none here, which leaves the server's own header for
   * API responses (`default-src 'none'`, under which a page loads nothing).
   */
  csp?: string | false;
  headers?: Record<string, string | string[]>;
}

export const DEFAULT_PAGE_CSP =
  "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";

/**
 * Sends a page. Takes only `html` output, so nothing unescaped gets here by mistake:
 *
 * ```ts
 * this.get('/', { root: true, auth: false }, async () => htmlResponse(layout({ title: 'Home', body: html`<h1>Hello</h1>` })));
 * ```
 *
 * With it go a Content-Security-Policy (see `csp`), `X-Content-Type-Options: nosniff`, a
 * `Referrer-Policy` that keeps this page's address from other sites, and `Cache-Control: no-cache`.
 * `headers` overrides any of them.
 */
export function htmlResponse(page: Html, options: HtmlResponseOptions = {}): HttpResponse<string> {
  const csp = options.csp ?? DEFAULT_PAGE_CSP;
  const body = /^\s*<!doctype/i.test(page.value) ? page.value : `<!doctype html>\n${page.value}`;
  return new HttpResponse(options.status ?? 200, body, {
    'content-type': 'text/html; charset=utf-8',
    ...(csp === false ? {} : { 'content-security-policy': csp }),
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'same-origin',
    'cache-control': 'no-cache',
    ...options.headers,
  });
}
