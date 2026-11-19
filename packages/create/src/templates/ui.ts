import { MARKERS } from '../layout';
import type { Names } from '../names';
import type { ProjectAuth } from '../types';

/**
 * What `mariachi init --ui` adds to a project: pages sent by the same server as the API, built from
 * `@mariachi/design`'s components and given their look by a design kit the project owns, copied into
 * `src/design` (the CLI copies it; this package only writes files). A page is a function that returns
 * `html`; its script, if it has one, is a file in `public/`. There is no client framework and no build
 * step.
 */

export const UI_DEPS = ['design'] as const;

export const PAGES_DIR = 'src/api/pages';
export const PAGES_LAYOUT_FILE = `${PAGES_DIR}/layout.ts`;
export const PAGES_CONTROLLER_FILE = 'src/api/controllers/pages.controller.ts';
export const PAGES_E2E_FILE = 'src/pages.e2e.test.ts';
/** Where the design kit is copied (`mariachi design add`'s default), and the project's own stylesheet beside it. */
export const DESIGN_KIT_DIR = 'src/design';
export const DESIGN_CSS_FILE = 'src/design.css';
export const DESIGN_KIT_FILE = 'src/design-kit.ts';
/** The kit `mariachi init --ui` copies in unless told another. */
export const DEFAULT_KIT = 'linen';

/** What every page loads, in this order. The tests of the generated layout check it. */
export const PAGE_STYLESHEETS = ['/assets/design/index.css', '/assets/design/motion/motion.css', '/assets/lib/components.css', '/assets/design.css'] as const;

const title = (name: string): string =>
  name
    .replace(/^@[^/]+\//, '')
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');

const LAYOUT_TS = (name: string, auth: ProjectAuth) => `import { html, type Html } from '@mariachi/api-facade';
import { designTheme } from '../../design-kit';

/** Shown in the bar and in every page's title. */
export const APP_NAME = ${JSON.stringify(title(name) || 'App')};

/**
 * The stylesheets every page loads, in this order:
 * 1. the design kit in src/design, the project's own copy: fonts, base styles and tokens;
 * 2. the kit's motion (loading, entrances, open and close);
 * 3. @mariachi/design's components (the m- classes), which read the kit's tokens;
 * 4. src/design.css, this project's own changes, last so they win.
 */
const STYLESHEETS = ${JSON.stringify(PAGE_STYLESHEETS, null, 2).replace(/"/g, "'")};

/** Runs on every page: @mariachi/design's behaviours (tabs, menus, dialogs) and the kit's motion. A file in public/. */
const ENHANCE = '/assets/enhance.js';

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
 * The frame around every page: the design's styles, the bar, the page's body.
 *
 * The look is the design kit in src/design. \`<html data-theme>\` is the kit's id, read from
 * src/design/kit.json, so \`mariachi design add <id>\` changes the look with no change here.
 *
 * Markup is \`@mariachi/design\`'s: classes that start with m-, variants in data- attributes, and
 * spacing and colour from tokens (\`style="padding: var(--m-space-4)"\`). Don't write new selectors
 * or colour values; change a token in src/design.css instead. To build something the library has
 * no component for, follow the kit's reference: src/design/DESIGN.md.
 */
export function layout(page: PageOptions): Html {
  return html\`<html lang="en" data-theme="\${designTheme()}" data-mode="auto">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>\${page.title} · \${APP_NAME}</title>
\${STYLESHEETS.map((href) => html\`<link rel="stylesheet" href="\${href}">\`)}
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
\${[ENHANCE, ...(page.scripts ?? [])].map((src) => html\`<script type="module" src="\${src}"></script>\`)}
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
import { html } from '@mariachi/api-facade';
import { designTheme } from '../../design-kit';
import { homePage } from './home';
import { layout } from './layout';

describe('the pages', () => {
  it("frames the home page with the kit's look, the components, then the project's own styles", () => {
    const page = homePage().value;
    expect(page).toContain(\`<html lang="en" data-theme="\${designTheme()}" data-mode="auto">\`);
    const styles = [...page.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map((match) => match[1]);
    expect(styles).toEqual(${JSON.stringify(PAGE_STYLESHEETS).replace(/"/g, "'").replace(/,/g, ', ')});
    expect(page).toContain('<a class="m-navbar-link" href="/" aria-current="page">Home</a>');
    expect(page).toContain('<script type="module" src="/assets/enhance.js"></script>');
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

const ENHANCE_JS = `// Runs on every page (the layout loads it): @mariachi/design's behaviours, for markup that needs
// script beyond HTML (tabs, menus, dialogs, copy buttons; toast() for notices), and the design kit's
// motion (loading states, counters, staggered lists). Both are served from this site, as modules.
import { enhance as behaviors } from '/assets/lib/behaviors.js';
import { enhance as motion } from '/assets/design/motion/motion.js';

behaviors();
motion();
`;

/**
 * \`src/design.css\`: the project's own design changes. Written once, here; \`mariachi design add\`
 * makes the same file only when it is missing, so this one stays.
 */
const DESIGN_CSS = `/*
 * This project's own design changes, loaded last: after the design kit in src/design, its motion and
 * @mariachi/design's components, so what is set here wins.
 *
 * Change how the app looks by setting design tokens (--m-*), not by writing selectors of your own.
 * A colour belongs in a token too, never in a page's markup:
 *
 *   [data-theme] { --m-radius-md: 0.75rem; }
 *
 * A token set here applies to every component that reads it, and still applies after a move to
 * another kit (mariachi design add <id>). Don't edit the kit's own files in src/design: a newer copy
 * would replace them. The tokens are listed in node_modules/@mariachi/core/docs/design.md.
 */
`;

/** \`src/design-kit.ts\`: where the kit is, and which one it is. */
const DESIGN_KIT_TS = `import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ConfigError } from '@mariachi/core';
import { z } from 'zod';

/**
 * The design kit the pages use: the project's own copy of a design language in src/design (tokens,
 * base styles, fonts, motion, DESIGN.md and kit.json), served under /assets/design. \`mariachi init
 * --ui\` copied it in; \`mariachi design add <id>\` replaces it with another. Found from this file, so
 * the path holds wherever the app is started from, and from dist/ once built.
 */
export const DESIGN_DIR = fileURLToPath(new URL('../src/design', import.meta.url));

/** This project's own design changes (token overrides), served as /assets/design.css after everything else. */
export const DESIGN_CSS_FILE = fileURLToPath(new URL('../src/design.css', import.meta.url));

const kitJson = z.object({ id: z.string(), dataTheme: z.string().regex(/^[a-z][a-z0-9-]*$/) });
let read: { mtimeMs: number; theme: string } | undefined;

/**
 * The kit's theme, for \`<html data-theme>\`: the \`dataTheme\` in src/design/kit.json, the kit's id.
 * Read again whenever kit.json changes, so another kit takes effect without a code change.
 */
export function designTheme(): string {
  const file = join(DESIGN_DIR, 'kit.json');
  const info = statSync(file, { throwIfNoEntry: false });
  if (!info) {
    throw new ConfigError(
      'app/design-kit-missing',
      \`There is no design kit in \${DESIGN_DIR} (no kit.json). Copy one in: pnpm mariachi design add ${DEFAULT_KIT} (or npx @mariachi/design-kits add ${DEFAULT_KIT}); pnpm mariachi design list --kits lists the others.\`,
    );
  }
  if (read?.mtimeMs !== info.mtimeMs) {
    let parsed: z.SafeParseReturnType<unknown, z.infer<typeof kitJson>> | undefined;
    try {
      parsed = kitJson.safeParse(JSON.parse(readFileSync(file, 'utf8')));
    } catch {
      parsed = undefined;
    }
    if (!parsed?.success) {
      throw new ConfigError('app/design-kit-invalid', \`\${file} is not a kit's kit.json. Copy the kit in again: pnpm mariachi design add <id> --force\`);
    }
    read = { mtimeMs: info.mtimeMs, theme: parsed.data.dataTheme };
  }
  return read.theme;
}
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
import { designTheme } from './design-kit';
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

  it("dresses the page in the design kit's theme", async () => {
    expect(await (await running.request('/')).text()).toContain(\`<html lang="en" data-theme="\${designTheme()}" data-mode="auto">\`);
  });

  it("serves the design kit, @mariachi/design's components and behaviours, and this app's own files", async () => {
    const css = 'text/css; charset=utf-8';
    const js = 'text/javascript; charset=utf-8';
    for (const [path, type] of [
      ['/assets/design/index.css', css],
      ['/assets/design/motion/motion.css', css],
      ['/assets/design/motion/motion.js', js],
      ['/assets/lib/components.css', css],
      ['/assets/lib/behaviors.js', js],
      ['/assets/design.css', css],
      ['/assets/enhance.js', js],
      ['/assets/home.js', js],
    ]) {
      const res = await running.request(path);
      expect(res.status, path).toBe(200);
      expect(res.headers.get('content-type'), path).toBe(type);
    }
  });

  it('serves nothing from outside those directories, and keeps the API under /api', async () => {
    for (const path of ['/assets/../package.json', '/assets/design/../../package.json', '/assets/design/../app.ts', '/assets/lib/index.js', '/package.json']) {
      expect((await running.request(path)).status, path).toBe(404);
    }
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
    'public/enhance.js': ENHANCE_JS,
    [DESIGN_CSS_FILE]: DESIGN_CSS,
    [DESIGN_KIT_FILE]: DESIGN_KIT_TS,
    ...(e2e ? { [PAGES_E2E_FILE]: PAGES_E2E_TEST } : {}),
  };
}

/** Imports `app.ts` gains. */
export const UI_APP_IMPORTS = `import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
`;

/** The design kit, @mariachi/design's files wherever the package manager put them, and public/. Goes above `createApp()`. */
export const UI_APP_CONSTANTS = `import { DESIGN_CSS_FILE, DESIGN_DIR, designTheme } from './design-kit';

const packageFile = createRequire(import.meta.url).resolve;
/** @mariachi/design's component styles (the m- classes, no look of their own), served as /assets/lib/components.css. */
const COMPONENTS_CSS = packageFile('@mariachi/design/components.css');
/** @mariachi/design's behaviours (tabs, menus, dialogs, toast), served as /assets/lib/behaviors.js. */
const BEHAVIORS_JS = packageFile('@mariachi/design/behaviors.js');
/** This app's own files, served under /assets: public/ beside src/ (and beside dist/ once built), wherever the app is started from. */
const PUBLIC_DIR = fileURLToPath(new URL('../public', import.meta.url));
`;

/** At the top of `createApp()`: a project with pages doesn't start without its design kit. */
export const UI_APP_CHECK = `  // The pages need the design kit in src/design: fail now, saying what to run, not on the first page
  designTheme();
`;

/** Chained onto the API server: the files pages load. */
export const UI_APP_STATIC = `    // What pages load: the design kit (src/design) and this project's own design.css, @mariachi/design's
    // components and behaviours, then this app's own files in public/
    .withStatic('/assets/design', DESIGN_DIR)
    .withStaticFile('/assets/design.css', DESIGN_CSS_FILE)
    .withStaticFile('/assets/lib/components.css', COMPONENTS_CSS)
    .withStaticFile('/assets/lib/behaviors.js', BEHAVIORS_JS)
    .withStatic('/assets', PUBLIC_DIR)
`;

/** A section for AGENTS.md. */
export const uiAgents = (auth: ProjectAuth): string => `
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
  layout and colour from tokens in \`style="…"\`. No new selectors and no colour values. The components
  and their markup are in \`node_modules/@mariachi/core/docs/design.md\` and \`design-catalog.md\`.
- **The look is the design kit in \`src/design/\`**, the project's own copy of a design language
  (tokens, base styles, fonts, motion). \`<html data-theme>\` is its id, read from
  \`src/design/kit.json\`. Don't edit the kit's files: change tokens in \`src/design.css\`, which loads
  last. To build something the library has no component for, follow the kit's reference
  (\`src/design/DESIGN.md\`, or \`pnpm mariachi design reference <name>\`), on
  \`--m-*\` tokens. Another kit: \`pnpm mariachi design add <id>\`.
- **A page's script is a file** in \`public/\`, loaded with \`scripts: ['/assets/<name>.js']\`. Inline
  \`<script>\` does not run (Content-Security-Policy). Pass data to a script in a \`data-\` attribute.
- **Pages are public unless you say otherwise.** A browser opening a page sends no \`Authorization\`
  header, so a page shows nothing private by itself: its script fetches the user's data from
  \`/api\` with the user's token. Never render another user's data, a secret or a token into a page.
${
  auth === 'gotrue'
    ? "- **The user's token comes from the session the sign-in page keeps** (\`src/api/pages/sign-in.ts\`: \`sessionStorage\`, key \`session\`). A page's script reads it from there. Don't keep a second copy anywhere, and never put a token in a URL, a page or a log.\n"
    : "- **There is no sign-in in the browser yet.** This project checks tokens signed with \`JWT_SECRET\`, and nothing here gives a browser one. Until you add a sign-in, pages show public content and call public routes. Never put a token in a URL or a page, and never ship \`JWT_SECRET\` or a token made with \`mariachi token\` to a browser.\n"
}- \`public/\` and \`src/design/\` are served to everyone, as they are. Nothing private goes in them.
`;

/** A section for README.md. */
export const UI_README = `
## Pages

The server that answers the API also sends the app's pages, built from \`@mariachi/design\`'s
components and given their look by a design kit the project owns. Open \`http://localhost:3000/\`.

| Path | What it is |
| --- | --- |
| \`src/api/pages/layout.ts\` | The frame around every page: the styles, in order, and the bar |
| \`src/api/pages/<name>.ts\` | One page: a function that returns \`html\` |
| \`src/api/controllers/pages.controller.ts\` | Gives each page its route, at the server's root |
| \`src/design/\` | The design kit, the project's own copy: tokens, base styles, fonts, motion, \`DESIGN.md\`, \`kit.json\`. Served under \`/assets/design\` |
| \`src/design.css\` | The project's own design changes (token overrides), loaded last. Served as \`/assets/design.css\` |
| \`src/design-kit.ts\` | Where the kit is, and its id (\`<html data-theme>\`), read from \`src/design/kit.json\` |
| \`public/\` | Files pages load, served under \`/assets\`: scripts (\`enhance.js\` runs on every page), images |

Every page loads, in this order: the kit (\`/assets/design/index.css\`), its motion
(\`/assets/design/motion/motion.css\`), \`@mariachi/design\`'s components (\`/assets/lib/components.css\`)
and \`src/design.css\`. \`public/enhance.js\` starts the library's behaviours
(\`/assets/lib/behaviors.js\`) and the kit's motion.

\`\`\`bash
pnpm mariachi generate page settings     # src/api/pages/settings.ts, its route at /settings, a link in the bar
\`\`\`

- **\`html\` escapes what is put into it**, so text a user wrote is shown as text.
- **Scripts are files** in \`public/\`; a page's policy lets it load scripts from this site only, and
  inline script does not run.
- **To change the look**, override tokens in \`src/design.css\`, or take another kit:
  \`pnpm mariachi design add <id>\` (with \`@mariachi/design-kits\` installed, or
  \`npx @mariachi/design-kits add <id>\`; \`pnpm mariachi design list --kits\` lists them). It replaces
  \`src/design/\`, keeps \`src/design.css\`, and the pages follow its \`kit.json\` with no code change.
  Don't edit the kit's own files; they are replaced as a whole.
- **Deploying**: \`src/design/\`, \`src/design.css\` and \`public/\` are read at run time, so ship them
  beside \`dist/\`.
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
