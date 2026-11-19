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
const UI_FILES = [
  'src/api/pages/layout.ts',
  'src/api/pages/home.ts',
  'src/api/pages/home.test.ts',
  'src/api/controllers/pages.controller.ts',
  'public/home.js',
  'public/enhance.js',
  'src/design.css',
  'src/design-kit.ts',
  'src/pages.e2e.test.ts',
];

describe('a project without --ui', () => {
  it('has no pages, no public directory and no design library', () => {
    for (const auth of AUTHS) {
      const files = plain[auth];
      for (const file of UI_FILES) expect(files[file], `${auth} ${file}`).toBeUndefined();
      expect(JSON.parse(files['package.json'] as string).dependencies['@mariachi/design']).toBeUndefined();
      expect(files['src/app.ts']).not.toMatch(/withStatic|design-kit|designTheme/);
      expect(Object.keys(files).some((file) => file.startsWith('src/design'))).toBe(false);
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
      // The look comes from the kit and design.css now: no token file in public/, and no kit written here (the CLI copies it)
      expect(files['public/app.css']).toBeUndefined();
      expect(Object.keys(files).filter((file) => file.startsWith('src/design/'))).toEqual([]);
    }
    expect(projectFiles('acme-app', '^0.1.0', 'jwt', { ui: true, e2e: false })['src/pages.e2e.test.ts']).toBeUndefined();
  });

  it("serves the kit and design.css from src/, @mariachi/design's components and behaviours from the package, and public/", () => {
    for (const auth of AUTHS) {
      const app = ui[auth]['src/app.ts'] as string;
      expect(app).toContain("import { DESIGN_CSS_FILE, DESIGN_DIR, designTheme } from './design-kit';");
      // The components only: the kit brings the fonts, the base and the tokens
      expect(app).toContain("const COMPONENTS_CSS = packageFile('@mariachi/design/components.css');");
      expect(app).not.toContain('mariachi.css');
      expect(app).toContain("const BEHAVIORS_JS = packageFile('@mariachi/design/behaviors.js');");
      // public/ is found from the file, not from wherever the app happens to be started
      expect(app).toContain("const PUBLIC_DIR = fileURLToPath(new URL('../public', import.meta.url));");
      const served = [...app.matchAll(/\.(withStatic(?:File)?)\('([^']+)', (\w+)\)/g)].map((m) => `${m[1]} ${m[2]} ${m[3]}`);
      expect(served).toEqual([
        'withStatic /assets/design DESIGN_DIR',
        'withStaticFile /assets/design.css DESIGN_CSS_FILE',
        'withStaticFile /assets/lib/components.css COMPONENTS_CSS',
        'withStaticFile /assets/lib/behaviors.js BEHAVIORS_JS',
        'withStatic /assets PUBLIC_DIR',
      ]);
      // Never the project's own directory, src/ as a whole, nor node_modules as a whole
      expect(app).not.toMatch(/withStatic\('[^']*', '(\.|src|node_modules)'\)/);
      // The app doesn't start without its kit, and says what to run
      expect(app).toContain("DATABASE_URL is required');\n  // The pages need the design kit in src/design: fail now, saying what to run, not on the first page\n  designTheme();\n");
    }
  });

  it('finds the kit from its own file, so the paths hold from dist/ too, and reads data-theme from kit.json', () => {
    const kit = ui.jwt['src/design-kit.ts'] as string;
    // src/design-kit.ts and dist/main.js are both one level down: ../src/design is the same folder from either
    expect(kit).toContain("export const DESIGN_DIR = fileURLToPath(new URL('../src/design', import.meta.url));");
    expect(kit).toContain("export const DESIGN_CSS_FILE = fileURLToPath(new URL('../src/design.css', import.meta.url));");
    expect(kit).toContain("const file = join(DESIGN_DIR, 'kit.json');");
    expect(kit).toContain('kitJson.safeParse(JSON.parse(readFileSync(file');
    expect(kit).toContain('read = { mtimeMs: info.mtimeMs, theme: parsed.data.dataTheme };');
    expect(kit).toContain("'app/design-kit-missing'");
    expect(kit).toContain('pnpm mariachi design add linen (or npx @mariachi/design-kits add linen)');
  });

  it('writes design.css for token overrides, and a script that starts the behaviours and the kit motion', () => {
    expect(ui.jwt['src/design.css']).toContain("This project's own design changes, loaded last");
    const enhance = ui.jwt['public/enhance.js'] as string;
    expect(enhance).toContain("import { enhance as behaviors } from '/assets/lib/behaviors.js';");
    expect(enhance).toContain("import { enhance as motion } from '/assets/design/motion/motion.js';");
    expect(enhance).toMatch(/\nbehaviors\(\);\nmotion\(\);\n$/);
  });

  it('puts pages at the root, open to anyone, built with the escaping template', () => {
    const controller = ui.jwt['src/api/controllers/pages.controller.ts'] as string;
    expect(controller).toContain("this.get('/', { root: true, auth: false }, async () => htmlResponse(homePage()));");
    const layout = ui.jwt['src/api/pages/layout.ts'] as string;
    expect(layout).toContain("import { html, type Html } from '@mariachi/api-facade';");
    expect(layout).toContain('export const APP_NAME = "Acme App";');
    // The theme is the kit's id, from kit.json: no fixed preset
    expect(layout).toContain("import { designTheme } from '../../design-kit';");
    expect(layout).toContain('<html lang="en" data-theme="${designTheme()}" data-mode="auto">');
    expect(layout).not.toMatch(/THEME|minimal/);
    // The kit, its motion, the components, then the project's own design.css
    expect(layout).toContain(`const STYLESHEETS = [
  '/assets/design/index.css',
  '/assets/design/motion/motion.css',
  '/assets/lib/components.css',
  '/assets/design.css'
];`);
    expect(layout).toContain('${STYLESHEETS.map((href) => html`<link rel="stylesheet" href="${href}">`)}');
    expect(layout).toContain("const ENHANCE = '/assets/enhance.js';");
    expect(layout).toContain('${[ENHANCE, ...(page.scripts ?? [])].map(');
    expect(ui.jwt['src/api/pages/home.test.ts']).toContain(
      "expect(styles).toEqual(['/assets/design/index.css', '/assets/design/motion/motion.css', '/assets/lib/components.css', '/assets/design.css']);",
    );
    // No script written into a page, and none of the generated markup opts out of escaping
    for (const file of ['src/api/pages/layout.ts', 'src/api/pages/home.ts']) {
      expect(ui.jwt[file]).not.toContain('raw(');
      expect(ui.jwt[file]).not.toMatch(/<script>(?!alert)/);
    }
  });

  it('links to the sign-in page only where there is one, and tells agents where a page gets the token', () => {
    expect(ui.gotrue['src/api/pages/layout.ts']).toContain("{ href: '/api/sign-in', label: 'Sign in' },");
    expect(ui.jwt['src/api/pages/layout.ts']).not.toContain('sign-in');
    expect(ui.gotrue['AGENTS.md']).toContain("The user's token comes from the session the sign-in page keeps");
    expect(ui.jwt['AGENTS.md']).toContain('There is no sign-in in the browser yet.');
    for (const auth of AUTHS) expect(ui[auth]['AGENTS.md']).toMatch(/never put a token in a URL/i);
  });

  it('uses only the design library for looks: no colour values, no selectors of its own', () => {
    for (const file of ['src/api/pages/layout.ts', 'src/api/pages/home.ts', 'src/design.css']) {
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
