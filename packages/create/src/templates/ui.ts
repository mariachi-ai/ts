import { MARKERS } from '../layout';
import type { Names } from '../names';
import type { ProjectAuth } from '../types';

/**
 * What `mariachi init --ui` adds to a project: pages sent by the same server as the API, styled with
 * `@mariachi/design`. A page is a function that returns `html`; its script, if it has one, is a file
 * in `public/`. There is no client framework and no build step.
 */

export const UI_DEPS = ['design'] as const;

export const PAGES_DIR = 'src/api/pages';
export const PAGES_LAYOUT_FILE = `${PAGES_DIR}/layout.ts`;
export const PAGES_CONTROLLER_FILE = 'src/api/controllers/pages.controller.ts';
export const PAGES_E2E_FILE = 'src/pages.e2e.test.ts';

const title = (name: string): string =>
  name
    .replace(/^@[^/]+\//, '')
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');

const LAYOUT_TS = (name: string, auth: ProjectAuth) => `import { html, type Html } from '@mariachi/api-facade';

/** Shown in the bar and in every page's title. */
export const APP_NAME = ${JSON.stringify(title(name) || 'App')};

/**
 * The design preset every page uses. To change the look, change this one word:
 * node_modules/@mariachi/core/docs/design.md lists the presets. To own a design instead of
 * depending on the package, copy one in with \`mariachi design add <id>\`.
 */
export const THEME = 'minimal';

/** The links in the bar. \`mariachi generate page\` adds to it. */
const LINKS: Array<{ href: string; label: string }> = [
  { href: '/', label: 'Home' },
  // ${MARKERS.nav}
${auth === 'gotrue' ? "  { href: '/api/sign-in', label: 'Sign in' },\n" : ''}];

export interface PageOptions {
  title: string;
  /** The page's own path, so its link in the bar is marked as the current one. */
  path: string;
  body: Html;
  /** Scripts the page loads, as modules: files in public/, served under /assets (\`/assets/home.js\`). */
  scripts?: string[];
}

/**
 * The frame around every page: the design library's styles, the bar, the page's body.
 *
 * Markup is \`@mariachi/design\`'s: classes that start with m-, variants in data- attributes, and
 * spacing and colour from tokens (\`style="padding: var(--m-space-4)"\`). Don't write new selectors
 * or colour values; change a token in public/app.css instead.
 */
export function layout(page: PageOptions): Html {
  return html\`<html lang="en" data-theme="\${THEME}" data-mode="auto">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>\${page.title} · \${APP_NAME}</title>
<link rel="stylesheet" href="/assets/design/mariachi.css">
<link rel="stylesheet" href="/assets/design/themes/\${THEME}.css">
<link rel="stylesheet" href="/assets/app.css">
</head>
<body>
<header class="m-navbar">
  <a class="m-navbar-brand" href="/">\${APP_NAME}</a>
  <nav class="m-navbar-nav" aria-label="Main">
    \${LINKS.map((link) => html\`<a class="m-navbar-link" href="\${link.href}" aria-current="\${link.href === page.path ? 'page' : 'false'}">\${link.label}</a>\`)}
  </nav>
</header>
<main class="m-container" style="padding-block: var(--m-space-8) var(--m-space-12)">
\${page.body}
</main>
\${(page.scripts ?? []).map((src) => html\`<script type="module" src="\${src}"></script>\`)}
</body>
</html>\`;
}

/** A page's main heading, in the design's display type. */
export function heading(text: string): Html {
  return html\`<h1 style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-heading-weight)">\${text}</h1>\`;
}
`;

const HOME_PAGE = `import { html, type Html } from '@mariachi/api-facade';
import { APP_NAME, heading, layout } from './layout';

/** The page at /. Replace it with your own. */
export function homePage(): Html {
  return layout({
    title: 'Home',
    path: '/',
    scripts: ['/assets/home.js'],
    body: html\`<div class="m-stack" data-gap="5">
  \${heading(APP_NAME)}
  <article class="m-card">
    <header class="m-card-header">
      <div>
        <h2 class="m-card-title">The API</h2>
        <p class="m-card-description">This page and the API are one server. Pages are at the root, the API under /api.</p>
      </div>
    </header>
    <div class="m-card-body">
      <p id="api-status" role="status">Asking the API whether it is ready…</p>
    </div>
    <footer class="m-card-footer">
      <a class="m-button" data-size="sm" href="/api/openapi.json">OpenAPI document</a>
    </footer>
  </article>
</div>\`,
  });
}
`;

const HOME_PAGE_TEST = `import { describe, expect, it } from 'vitest';
import { homePage } from './home';
import { layout } from './layout';
import { html } from '@mariachi/api-facade';

describe('the pages', () => {
  it('frames the home page with the design styles and marks its link as current', () => {
    const page = homePage().value;
    expect(page).toContain('<link rel="stylesheet" href="/assets/design/mariachi.css">');
    expect(page).toContain('<a class="m-navbar-link" href="/" aria-current="page">Home</a>');
    expect(page).toContain('<script type="module" src="/assets/home.js"></script>');
  });

  it('shows what a page is given as text, never as markup', () => {
    const page = layout({ title: '<script>alert(1)</script>', path: '/x', body: html\`<p>\${'<img onerror=x>'}</p>\` }).value;
    expect(page).not.toContain('<script>alert(1)</script>');
    expect(page).toContain('&lt;img onerror=x&gt;');
  });
});
`;

const HOME_JS = `// The home page's script: asks the API whether it is ready and says so.
// A page's script is a file here, loaded as a module. Inline <script> does not run: the page's
// Content-Security-Policy allows scripts from this site only.
const status = document.getElementById('api-status');
try {
  const res = await fetch('/api/health/ready');
  status.textContent = res.ok ? 'The API is ready.' : 'The API is running, but not ready yet.';
} catch {
  status.textContent = 'The API did not answer.';
}
`;

const APP_CSS = `/*
 * This app's own styles, loaded after the design library's.
 *
 * Change how the app looks by changing design tokens, not by writing selectors or colour values:
 *
 *   [data-theme] { --m-radius-md: 0.75rem; }
 *
 * The tokens are listed in node_modules/@mariachi/core/docs/design.md.
 */
`;

const PAGES_CONTROLLER = `import { BaseController, htmlResponse } from '@mariachi/api-facade';
import { homePage } from '../pages/home';
// ${MARKERS.imports}

/**
 * The app's pages: HTML at the server's root (/, /settings), beside the API under /api.
 *
 * A page is a function in src/api/pages that returns html. \`root: true\` puts its route outside
 * /api. \`auth: false\` lets anyone open it: a browser going to a page sends no Authorization header,
 * so a page that needs the user is public and its script calls the API with the user's token.
 * Never put anything a visitor shouldn't see into a public page: it is sent to everyone.
 */
export class PagesController extends BaseController {
  readonly prefix = '';

  init(): void {
    this.get('/', { root: true, auth: false }, async () => htmlResponse(homePage()));
    // ${MARKERS.pages}
  }
}
`;

const PAGES_E2E_TEST = `import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startApp, type RunningApp } from './testing/e2e';

let running: RunningApp;
beforeAll(async () => {
  running = await startApp();
});
afterAll(() => running?.stop());

describe('the pages, served beside the API', () => {
  it('sends the home page to anyone, with a policy that runs no inline script', async () => {
    const res = await running.request('/');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8');
    const policy = res.headers.get('content-security-policy') ?? '';
    expect(policy).toContain("default-src 'self'");
    expect(policy).not.toContain('script-src');
    expect(await res.text()).toContain('<header class="m-navbar">');
  });

  it("serves the design library's styles and this app's own files", async () => {
    const design = await running.request('/assets/design/mariachi.css');
    expect(design.status).toBe(200);
    expect(design.headers.get('content-type')).toBe('text/css; charset=utf-8');
    expect((await running.request('/assets/design/themes/minimal.css')).status).toBe(200);
    expect((await running.request('/assets/app.css')).status).toBe(200);
    expect((await running.request('/assets/home.js')).headers.get('content-type')).toBe('text/javascript; charset=utf-8');
  });

  it('serves nothing from outside those directories, and keeps the API under /api', async () => {
    expect((await running.request('/assets/../package.json')).status).toBe(404);
    expect((await running.request('/assets/design/../../package.json')).status).toBe(404);
    expect((await running.request('/package.json')).status).toBe(404);
    expect((await running.request('/api/health/ready')).status).toBe(200);
  });
});
`;

/** Files of a project with pages. */
export function uiFiles(name: string, auth: ProjectAuth, e2e: boolean): Record<string, string> {
  return {
    [PAGES_LAYOUT_FILE]: LAYOUT_TS(name, auth),
    [`${PAGES_DIR}/home.ts`]: HOME_PAGE,
    [`${PAGES_DIR}/home.test.ts`]: HOME_PAGE_TEST,
    [PAGES_CONTROLLER_FILE]: PAGES_CONTROLLER,
    'public/home.js': HOME_JS,
    'public/app.css': APP_CSS,
    ...(e2e ? { [PAGES_E2E_FILE]: PAGES_E2E_TEST } : {}),
  };
}

/** Imports `app.ts` gains. */
export const UI_APP_IMPORTS = `import { createRequire } from 'node:module';
import { dirname } from 'node:path';
`;

/** Where the design library's CSS is, wherever the package manager put it. Goes above `createApp()`. */
export const UI_APP_CONSTANTS = `
/** The design library's stylesheets, served under /assets/design. */
const DESIGN_CSS = dirname(createRequire(import.meta.url).resolve('@mariachi/design/mariachi.css'));
`;

/** Chained onto the API server: the files pages load. */
export const UI_APP_STATIC = `    // What pages load: the design library's styles, then this app's own files in public/
    .withStatic('/assets/design', DESIGN_CSS)
    .withStatic('/assets', 'public')
`;

/** A section for AGENTS.md. */
export const UI_AGENTS = `
## Pages

- The app has pages, sent by the same server as the API: \`src/api/pages/<name>.ts\` returns the
  page as \`html\`, \`src/api/controllers/pages.controller.ts\` gives it a route at the server's root
  (\`root: true\`), and \`src/api/pages/layout.ts\` is the frame around every page.
  \`pnpm mariachi generate page <name>\` writes all three parts.
- **Build pages with \`html\`** from \`@mariachi/api-facade\`. It escapes every value put in with
  \`\${}\`, so user text can't become markup. \`raw()\` is only for markup you wrote yourself. Put a link
  that comes from data through \`safeHref()\`. Never put a value inside \`<script>\`, \`<style>\`, a
  \`style="…"\` attribute or an unquoted attribute.
- **Use the design library's markup**: classes that start with \`m-\`, variants as \`data-\` attributes,
  layout and colour from tokens in \`style="…"\`. No new selectors and no colour values; change tokens
  in \`public/app.css\`. The components and their markup are in
  \`node_modules/@mariachi/core/docs/design.md\` and \`design-catalog.md\`.
- **A page's script is a file** in \`public/\`, loaded with \`scripts: ['/assets/<name>.js']\`. Inline
  \`<script>\` does not run (Content-Security-Policy). Pass data to a script in a \`data-\` attribute.
- **Pages are public unless you say otherwise.** A browser opening a page sends no \`Authorization\`
  header, so a page shows nothing private by itself: its script fetches the user's data from
  \`/api\` with the user's token. Never render another user's data, a secret or a token into a page.
- \`public/\` is served to everyone, as it is. Nothing private goes in it.
`;

/** A section for README.md. */
export const UI_README = `
## Pages

The server that answers the API also sends the app's pages, styled with \`@mariachi/design\`. Open
\`http://localhost:3000/\`.

| Path | What it is |
| --- | --- |
| \`src/api/pages/layout.ts\` | The frame around every page: the styles, the bar, \`THEME\` (the design preset) |
| \`src/api/pages/<name>.ts\` | One page: a function that returns \`html\` |
| \`src/api/controllers/pages.controller.ts\` | Gives each page its route, at the server's root |
| \`public/\` | Files pages load, served under \`/assets\`: scripts, \`app.css\`, images |

\`\`\`bash
pnpm mariachi generate page settings     # src/api/pages/settings.ts, its route at /settings, a link in the bar
\`\`\`

- **\`html\` escapes what is put into it**, so text a user wrote is shown as text.
- **Scripts are files** in \`public/\`; a page's policy lets it load scripts from this site only, and
  inline script does not run.
- **To change the look**, set \`THEME\` in \`src/api/pages/layout.ts\` to another preset, or override
  tokens in \`public/app.css\`. \`pnpm mariachi design add <id>\` copies a design into the project.
- Pages are public; private data is fetched by a page's script from \`/api\`, with the user's token.
`;

/** `src/api/pages/<name>.ts`, written by `mariachi generate page`. */
export const pageFile = (n: Names): string => `import { html, type Html } from '@mariachi/api-facade';
import { heading, layout } from './layout';

/** The page at /${n.kebab}. */
export function ${n.camel}Page(): Html {
  return layout({
    title: ${JSON.stringify(pageTitle(n))},
    path: '/${n.kebab}',
    body: html\`<div class="m-stack" data-gap="5">
  \${heading(${JSON.stringify(pageTitle(n))})}
  <article class="m-card">
    <div class="m-card-body">
      <p>This is the ${n.kebab} page. Replace this card with what it shows.</p>
    </div>
  </article>
</div>\`,
  });
}
`;

export const pageTestFile = (n: Names): string => `import { describe, expect, it } from 'vitest';
import { ${n.camel}Page } from './${n.kebab}';

describe('the ${n.kebab} page', () => {
  it('is framed like every page, with its own link marked as current', () => {
    const page = ${n.camel}Page().value;
    expect(page).toContain('<header class="m-navbar">');
    expect(page).toContain('<a class="m-navbar-link" href="/${n.kebab}" aria-current="page">${pageTitle(n)}</a>');
  });
});
`;

/** `invoice-item` → `Invoice item`. */
export function pageTitle(n: Names): string {
  const words = n.kebab.split('-').join(' ');
  return words[0]?.toUpperCase() + words.slice(1);
}
