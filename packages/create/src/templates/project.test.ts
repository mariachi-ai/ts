import { describe, expect, it } from 'vitest';
import { names } from '../names';
import { entityFiles } from './entity';
import { projectFiles } from './project';

const files = projectFiles('acme-app', '^0.1.0');
const gotrue = projectFiles('acme-app', '^0.1.0', 'gotrue');
const pkg = JSON.parse(files['package.json'] as string);

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
    expect(harness).toContain('dotenv: false');
    expect(harness).toContain('SERVICE_NAME: name');
    expect(harness).toContain("PORT: '0'");
    expect(harness).toContain('installSignalHandlers: false');
    expect(harness).not.toMatch(/process\.env/);
    expect(files['src/testing/global-setup.ts']).not.toMatch(/process\.env/);
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
