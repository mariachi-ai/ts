import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createProject, generatePage } from '../generators';
import { projectFiles } from './project';

const AUTHS = ['jwt', 'gotrue'] as const;
const plain = { jwt: projectFiles('acme-app', '^0.1.0'), gotrue: projectFiles('acme-app', '^0.1.0', 'gotrue') };
const ui = {
  jwt: projectFiles('acme-app', '^0.1.0', 'jwt', { ui: true }),
  gotrue: projectFiles('acme-app', '^0.1.0', 'gotrue', { ui: true }),
};
const UI_FILES = ['src/api/pages/layout.ts', 'src/api/pages/home.ts', 'src/api/pages/home.test.ts', 'src/api/controllers/pages.controller.ts', 'public/home.js', 'public/app.css', 'src/pages.e2e.test.ts'];

describe('a project without --ui', () => {
  it('has no pages, no public directory and no design library', () => {
    for (const auth of AUTHS) {
      const files = plain[auth];
      for (const file of UI_FILES) expect(files[file], `${auth} ${file}`).toBeUndefined();
      expect(JSON.parse(files['package.json'] as string).dependencies['@mariachi/design']).toBeUndefined();
      expect(files['src/app.ts']).not.toMatch(/withStatic|DESIGN_CSS/);
      expect(files['src/api/controllers/index.ts']).not.toContain('PagesController');
    }
  });
});

describe('a project with --ui', () => {
  it('adds the design library, the pages and the files they load, for either sign-in choice', () => {
    for (const auth of AUTHS) {
      const files = ui[auth];
      for (const file of UI_FILES) expect(files[file], `${auth} ${file}`).toBeTruthy();
      expect(JSON.parse(files['package.json'] as string).dependencies).toHaveProperty('@mariachi/design', '^0.1.0');
      expect(files['src/api/controllers/index.ts']).toContain('new PagesController(communication),');
      expect(files['README.md']).toContain('## Pages');
      expect(files['AGENTS.md']).toContain('## Pages');
      expect(Object.values(files).join('\n')).not.toMatch(/\bundefined\b\n|\[object Object\]/);
    }
    expect(projectFiles('acme-app', '^0.1.0', 'jwt', { ui: true, e2e: false })['src/pages.e2e.test.ts']).toBeUndefined();
  });

  it("serves the design library's styles from wherever the package is, and the app's own files from public/", () => {
    for (const auth of AUTHS) {
      const app = ui[auth]['src/app.ts'] as string;
      expect(app).toContain("const DESIGN_CSS = dirname(createRequire(import.meta.url).resolve('@mariachi/design/mariachi.css'));");
      expect(app).toContain(".withStatic('/assets/design', DESIGN_CSS)");
      expect(app).toContain(".withStatic('/assets', 'public')");
      // Never the project's own directory, nor node_modules as a whole
      expect(app).not.toMatch(/withStatic\('[^']*', '(\.|node_modules)'\)/);
    }
  });

  it('puts pages at the root, open to anyone, built with the escaping template', () => {
    const controller = ui.jwt['src/api/controllers/pages.controller.ts'] as string;
    expect(controller).toContain("this.get('/', { root: true, auth: false }, async () => htmlResponse(homePage()));");
    const layout = ui.jwt['src/api/pages/layout.ts'] as string;
    expect(layout).toContain("import { html, type Html } from '@mariachi/api-facade';");
    expect(layout).toContain('export const APP_NAME = "Acme App";');
    expect(layout).toContain('<html lang="en" data-theme="${THEME}" data-mode="auto">');
    expect(layout).toContain('<link rel="stylesheet" href="/assets/design/themes/${THEME}.css">');
    // No script written into a page, and none of the generated markup opts out of escaping
    for (const file of ['src/api/pages/layout.ts', 'src/api/pages/home.ts']) {
      expect(ui.jwt[file]).not.toContain('raw(');
      expect(ui.jwt[file]).not.toMatch(/<script>(?!alert)/);
    }
  });

  it('links to the sign-in page only where there is one', () => {
    expect(ui.gotrue['src/api/pages/layout.ts']).toContain("{ href: '/api/sign-in', label: 'Sign in' },");
    expect(ui.jwt['src/api/pages/layout.ts']).not.toContain('sign-in');
  });

  it('uses only the design library for looks: no colour values, no selectors of its own', () => {
    for (const file of ['src/api/pages/layout.ts', 'src/api/pages/home.ts', 'public/app.css']) {
      const text = (ui.jwt[file] as string).replace(/\/\*[\s\S]*?\*\//g, '');
      expect(text, file).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(/);
    }
    // Every class in the markup is the library's
    const classes = [...`${ui.jwt['src/api/pages/layout.ts']}${ui.jwt['src/api/pages/home.ts']}`.matchAll(/class="([^"]+)"/g)].flatMap((m) => (m[1] as string).split(/\s+/));
    expect(classes.length).toBeGreaterThan(5);
    for (const name of classes) expect(name).toMatch(/^m-/);
  });
});

describe('mariachi generate page', () => {
  let dir: string;
  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'mariachi-page-'));
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('writes the page and its test, gives it a route at the root and a link in the bar', async () => {
    const root = join(dir, 'app');
    await createProject({ name: 'acme-app', outputDir: root, example: false, ui: true });
    const result = await generatePage({ name: 'team-settings', projectRoot: root });
    expect(result.created).toEqual(['src/api/pages/team-settings.ts', 'src/api/pages/team-settings.test.ts']);
    expect(result.updated).toEqual(['src/api/controllers/pages.controller.ts', 'src/api/pages/layout.ts']);
    expect(result.notes).toEqual([]);

    const controller = await readFile(join(root, 'src/api/controllers/pages.controller.ts'), 'utf-8');
    expect(controller).toContain("import { teamSettingsPage } from '../pages/team-settings';");
    expect(controller).toContain("this.get('/team-settings', { root: true, auth: false }, async () => htmlResponse(teamSettingsPage()));");
    // Markers stay, for the next page
    expect(controller).toContain('// mariachi:pages');
    expect(await readFile(join(root, 'src/api/pages/layout.ts'), 'utf-8')).toContain(`{ href: '/team-settings', label: "Team settings" },`);
    const page = await readFile(join(root, 'src/api/pages/team-settings.ts'), 'utf-8');
    expect(page).toContain('export function teamSettingsPage(): Html {');
    expect(page).toContain("path: '/team-settings',");
  });

  it('refuses a second page of the same name, a path the API or the files have, and a project with no pages', async () => {
    const root = join(dir, 'app');
    await createProject({ name: 'acme-app', outputDir: root, example: false, ui: true });
    await generatePage({ name: 'settings', projectRoot: root });
    await expect(generatePage({ name: 'settings', projectRoot: root })).rejects.toMatchObject({ code: 'create/file-exists' });
    await expect(generatePage({ name: 'home', projectRoot: root })).rejects.toMatchObject({ code: 'create/file-exists' });
    for (const name of ['api', 'assets']) await expect(generatePage({ name, projectRoot: root })).rejects.toMatchObject({ code: 'create/reserved-page' });

    const bare = join(dir, 'bare');
    await createProject({ name: 'bare-app', outputDir: bare, example: false });
    await expect(generatePage({ name: 'settings', projectRoot: bare })).rejects.toMatchObject({ code: 'create/no-pages' });
  });
});
