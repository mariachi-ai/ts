import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createProject, generateEntity } from '../generators';
import { names } from '../names';
import { entityFiles } from './entity';
import { projectFiles } from './project';

const files = projectFiles('acme-app', '^0.1.0');
const gotrue = projectFiles('acme-app', '^0.1.0', 'gotrue');
const pkg = JSON.parse(files['package.json'] as string);

describe('the generated project checks itself', () => {
  it("has a lint script, mariachi validate then tsc, with no linter of its own to install", () => {
    expect(pkg.scripts.lint).toBe('mariachi validate && tsc --noEmit');
    expect(pkg.devDependencies).toMatchObject({ '@mariachi/cli': '^0.1.0', typescript: expect.any(String) });
    expect(Object.keys(pkg.devDependencies)).not.toEqual(expect.arrayContaining([expect.stringMatching(/eslint|biome/)]));
  });

  it('tells people and agents to run it', () => {
    for (const set of [files, gotrue]) {
      expect(set['README.md']).toContain('`pnpm lint` runs `mariachi validate`');
      expect(set['AGENTS.md']).toMatch(/pnpm lint +# mariachi validate \(layers, ctx first, Zod at boundaries, procedure names\) \+ tsc/);
    }
  });
});

describe('the generated project can be started from a test', () => {
  it('builds the app in app.ts and only starts it in main.ts', () => {
    const main = files['src/main.ts'] as string;
    expect(main).toContain("import { createApp } from './app';");
    expect(main).toMatch(/createApp\(\)\s*\.then\(\(app\) => app\.start\(\)\)/);
    // Nothing is built in the entry point: importing app.ts has no side effects, importing main.ts starts the app
    expect(main).not.toMatch(/bootstrap|createApiServer|createPostgresDatabase/);
    for (const app of [files['src/app.ts'], gotrue['src/app.ts']] as string[]) {
      expect(app).toContain('export async function createApp(options: AppOptions = {}): Promise<App>');
      expect(app).toContain('bootstrap(options.bootstrap)');
      expect(app).toMatch(/start: async \(\) => \{\s+await lifecycle\.start\(\);\s+return address;/);
      expect(app).toMatch(/stop: async \(\) => \{\s+await lifecycle\.stop\(\);/);
      expect(app).not.toMatch(/\bmain\(\)|process\.exit/);
    }
  });

  it('lets a test replace who checks tokens, and nothing else about sign-in', () => {
    const app = files['src/app.ts'] as string;
    expect(app).toContain('let verifier = options.verifier;');
    // Without a verifier the secret is still required
    expect(app).toMatch(/if \(!verifier\) \{\s+if \(!config\.auth\?\.jwtSecret\) throw new ConfigError\('app\/jwt-secret-required'/);
    const withProvider = gotrue['src/app.ts'] as string;
    expect(withProvider).toContain('const provider = options.verifier ?? createGoTrueAuth(goTrueConfig(app.auth));');
    // Personal tenants and tenancy still wrap whatever verifier is used
    expect(withProvider).toContain("app.auth.personalTenants ? withPersonalTenants(provider, { namespace: 'app' }) : provider");
    expect(withProvider).toContain('.withMiddleware(createTenancyMiddleware(tenancy))');
  });

  it('ships the end-to-end support, a first test, and a script that runs them apart from the unit tests', () => {
    for (const set of [files, gotrue]) {
      for (const file of ['vitest.e2e.config.ts', 'src/testing/e2e.ts', 'src/testing/global-setup.ts', 'src/app.e2e.test.ts']) expect(set[file], file).toBeTruthy();
    }
    expect(pkg.scripts['test:e2e']).toBe('vitest run --config vitest.e2e.config.ts');
    expect(pkg.devDependencies).toMatchObject({ '@mariachi/testing': '^0.1.0', testcontainers: expect.any(String) });
    expect(pkg.dependencies['@mariachi/testing']).toBeUndefined();
    expect(files['vitest.config.ts']).toContain("exclude: ['src/**/*.e2e.test.ts'");
    expect(files['vitest.e2e.config.ts']).toContain("include: ['src/**/*.e2e.test.ts']");
    expect(files['vitest.e2e.config.ts']).toContain("globalSetup: ['./src/testing/global-setup.ts']");
  });

  it('gives each test file its own database and job queue, and never the developer\'s', () => {
    const harness = files['src/testing/e2e.ts'] as string;
    expect(harness).toContain('create database');
    // The GoTrue project reads a request's claims through the provider's own mapping
    expect(harness).not.toContain('toIdentity');
    expect(gotrue['src/testing/e2e.ts']).toContain('return provider.toIdentity(claims);');
    expect(gotrue['src/testing/e2e.ts']).toContain('[settings().orgClaim]: identity.tenantId');
    expect(harness).toContain('dotenv: false');
    expect(harness).toContain('SERVICE_NAME: name');
    expect(harness).toContain("PORT: '0'");
    expect(harness).toContain('installSignalHandlers: false');
    expect(harness).not.toMatch(/process\.env/);
    expect(files['src/testing/global-setup.ts']).not.toMatch(/process\.env/);
  });

  it('takes migrations at start and additions to the API as options, so a wrapper needn\'t edit app.ts', () => {
    for (const app of [files['src/app.ts'], gotrue['src/app.ts']] as string[]) {
      expect(app).toContain('configureApi?: (api: FastifyAdapter) => void;');
      // After the defaults, before the controllers
      expect(app).toMatch(/\.withOpenApi\(\{[^\n]+\);\n\s+options\.configureApi\?\.\(api\);\n\s+for \(const controller of createControllers/);
      expect(app).toContain("name: 'migrations',");
      expect(app).toContain('priority: 15,');
    }
    expect(files['src/app.ts']).toContain("options.migrateOnStart === true ? { folder: 'drizzle' } : options.migrateOnStart || undefined");
    expect(gotrue['src/app.ts']).toContain('if (options.migrateOnStart ?? app.migrateOnStart) {');
  });

  it('leaves all of it out with e2e: false', async () => {
    for (const auth of ['jwt', 'gotrue'] as const) {
      const plain = projectFiles('acme-app', '^0.1.0', auth, { e2e: false });
      expect(Object.keys(plain).filter((f) => /e2e|src\/testing\//.test(f)), auth).toEqual([]);
      const plainPkg = JSON.parse(plain['package.json'] as string);
      expect(plainPkg.scripts['test:e2e']).toBeUndefined();
      expect(plainPkg.devDependencies['@mariachi/testing']).toBeUndefined();
      expect(plainPkg.devDependencies.testcontainers).toBeUndefined();
      expect(`${plain['AGENTS.md']}${plain['README.md']}`).not.toMatch(/test:e2e|src\/testing|startApp/);
      // Everything else is the same project
      const full = projectFiles('acme-app', '^0.1.0', auth);
      for (const file of ['src/app.ts', 'src/main.ts', 'vitest.config.ts', '.env.example', 'docker-compose.yml']) expect(plain[file], file).toBe(full[file]);
    }
    const dir = await mkdtemp(join(tmpdir(), 'mariachi-no-e2e-'));
    try {
      await createProject({ name: 'plain', outputDir: join(dir, 'plain'), e2e: false });
      const added = await generateEntity({ name: 'invoice-item', projectRoot: join(dir, 'plain') });
      expect(added.created.filter((f) => f.includes('e2e'))).toEqual([]);
      expect(existsSync(join(dir, 'plain', 'src/api/controllers/notes.e2e.test.ts'))).toBe(false);
      await createProject({ name: 'full', outputDir: join(dir, 'full') });
      expect(existsSync(join(dir, 'full', 'src/api/controllers/notes.e2e.test.ts'))).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('writes an end-to-end test with every generated entity', () => {
    const entity = entityFiles(names('invoice-item'));
    const test = entity['src/api/controllers/invoice-items.e2e.test.ts'] as string;
    expect(test).toContain("const path = '/api/invoice-items';");
    expect(test).toContain("import { startApp, type RunningApp } from '../../testing/e2e';");
    for (const covered of ['creates, reads, lists, updates and deletes', "keeps one tenant's rows from another", 'asks for a token', 'refuses a body the contract rules out']) {
      expect(test).toContain(covered);
    }
    expect(test).toContain('const invoiceItem = (await created.json())');
  });
});
