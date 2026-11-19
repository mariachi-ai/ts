import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Command } from 'commander';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MARIACHI_VERSION } from '@mariachi/create';
import { type InitDeps, kitCommand, nextSteps, registerInitCommand, type RunCommand } from './init';

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'mariachi-init-'));
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  await rm(dir, { recursive: true, force: true });
});

async function init(...args: string[]) {
  return initWith({}, ...args);
}

async function initWith(deps: InitDeps, ...args: string[]) {
  const program = new Command().exitOverride();
  registerInitCommand(program, deps);
  await program.parseAsync(['node', 'mariachi', 'init', ...args]);
}

/** Makes process.exit throw, so a failing command stops the test where it would have stopped the process. */
const exitThrows = () =>
  vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
    throw new Error(`exit ${code}`); // mariachi-lint-ignore: stands in for process.exit in the test
  }) as never);

const errors = () =>
  vi
    .mocked(console.error)
    .mock.calls.map(([line]) => String(line))
    .join('\n');

describe('mariachi init --auth', () => {
  it('defaults to the JWT template', async () => {
    await init(join(dir, 'app'), '--no-example');
    const pkg = JSON.parse(await readFile(join(dir, 'app/package.json'), 'utf-8'));
    expect(pkg.dependencies['@mariachi/auth-gotrue']).toBeUndefined();
    expect(existsSync(join(dir, 'app/src/api/pages/sign-in.ts'))).toBe(false);
  });

  it('generates the GoTrue sign-in template with --auth gotrue', async () => {
    await init(join(dir, 'app'), '--no-example', '--auth', 'gotrue');
    const pkg = JSON.parse(await readFile(join(dir, 'app/package.json'), 'utf-8'));
    expect(pkg.dependencies).toHaveProperty('@mariachi/auth-gotrue');
    expect(pkg.dependencies).toHaveProperty('@mariachi/tenancy');
    expect(existsSync(join(dir, 'app/src/api/pages/sign-in.ts'))).toBe(true);
    expect(existsSync(join(dir, 'app/src/api/controllers/me.controller.ts'))).toBe(true);
  });

  it('refuses an unknown provider', async () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`exit ${code}`); // mariachi-lint-ignore: stands in for process.exit in the test
    }) as never);
    await expect(init(join(dir, 'app'), '--auth', 'clerk')).rejects.toThrow('exit 1');
    expect(exit).toHaveBeenCalledWith(1);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Unknown auth "clerk"'));
  });
});

describe('mariachi init --orgs', () => {
  it('leaves organizations out unless asked', async () => {
    await init(join(dir, 'app'), '--no-example');
    const pkg = JSON.parse(await readFile(join(dir, 'app/package.json'), 'utf-8'));
    expect(pkg.dependencies['@mariachi/organizations']).toBeUndefined();
    expect(existsSync(join(dir, 'app/src/organizations.ts'))).toBe(false);
  });

  it('adds organizations to either sign-in choice', async () => {
    await init(join(dir, 'jwt'), '--no-example', '--orgs');
    await init(join(dir, 'gotrue'), '--no-example', '--orgs', '--auth', 'gotrue');
    for (const app of ['jwt', 'gotrue']) {
      const pkg = JSON.parse(await readFile(join(dir, app, 'package.json'), 'utf-8'));
      expect(pkg.dependencies).toHaveProperty('@mariachi/organizations');
      expect(existsSync(join(dir, app, 'src/organizations.ts'))).toBe(true);
      expect(existsSync(join(dir, app, 'src/schema/organizations.ts'))).toBe(true);
      expect(await readFile(join(dir, app, 'src/app.ts'), 'utf-8')).toContain('organizationStrategy(bearerStrategy(');
    }
  });
});

describe('what init says to do next', () => {
  const said = () =>
    vi
      .mocked(console.log)
      .mock.calls.map(([line]) => String(line))
      .join('\n');

  it('is install and dev: dev makes .env, starts Postgres and migrates', async () => {
    expect(nextSteps('app', 'jwt')).toEqual(['cd app', 'pnpm install', 'pnpm dev']);
    await init(join(dir, 'app'), '--no-example');
    expect(said()).not.toMatch(/docker compose up|db:migrate/);
    expect(said()).toContain('$(pnpm -s mariachi token)" localhost:3000/api/health/ready');
    expect(JSON.parse(await readFile(join(dir, 'app/package.json'), 'utf-8')).scripts.dev).toBe('mariachi dev');
  });

  it('has a GoTrue project make its .env first, since AUTH_URL has to be set in it', () => {
    expect(nextSteps('app', 'gotrue')).toEqual(['cd app', 'pnpm install', 'cp .env.example .env', 'pnpm dev']);
  });

  it('names a token with no tenant for a project with organizations', async () => {
    await init(join(dir, 'app'), '--no-example', '--orgs');
    expect(said()).toContain('$(pnpm -s mariachi token --no-tenant)" localhost:3000/api/organizations');
  });
});

describe('mariachi init --ui: the design kit', () => {
  const range = `^${MARIACHI_VERSION}`;
  const neverRun: RunCommand = vi.fn(async () => {
    throw new Error('npx should not run'); // mariachi-lint-ignore: fails the test if it is called
  });

  it('copies the default kit, linen, into src/design with @mariachi/design-kits when it can be imported', async () => {
    await initWith({ run: neverRun }, join(dir, 'app'), '--no-example', '--no-e2e', '--ui');
    const kit = JSON.parse(await readFile(join(dir, 'app/src/design/kit.json'), 'utf-8'));
    expect(kit).toMatchObject({ id: 'linen', dataTheme: 'linen', entry: 'index.css' });
    for (const file of ['index.css', 'motion/motion.css', 'motion/motion.js', 'DESIGN.md']) expect(existsSync(join(dir, 'app/src/design', file)), file).toBe(true);
    // The generator's design.css stays: the kit never writes over it
    expect(await readFile(join(dir, 'app/src/design.css'), 'utf-8')).toContain("This project's own design changes, loaded last");
    expect(existsSync(join(dir, 'app/public/app.css'))).toBe(false);
    expect(neverRun).not.toHaveBeenCalled();
    expect(vi.mocked(console.log).mock.calls.map(([line]) => String(line)).join('\n')).toMatch(/added.*src\/design\/ Linen \(linen\): \d+ files/);
  });

  it('takes another kit with --kit', async () => {
    await initWith({ run: neverRun }, join(dir, 'app'), '--no-example', '--no-e2e', '--ui', '--kit', 'folio');
    expect(JSON.parse(await readFile(join(dir, 'app/src/design/kit.json'), 'utf-8'))).toMatchObject({ id: 'folio', dataTheme: 'folio' });
  });

  it('refuses an unknown kit before writing anything, naming the kits there are', async () => {
    exitThrows();
    await expect(init(join(dir, 'app'), '--ui', '--kit', 'no-such-kit')).rejects.toThrow('exit 1');
    expect(errors()).toMatch(/Unknown kit "no-such-kit"\. Kits: .*linen/);
    expect(existsSync(join(dir, 'app'))).toBe(false);
  });

  it('refuses --kit without --ui, and an id that is not one', async () => {
    exitThrows();
    await expect(init(join(dir, 'app'), '--kit', 'linen')).rejects.toThrow('exit 1');
    expect(errors()).toContain('--kit picks the design kit of a project with pages: add --ui');
    await expect(init(join(dir, 'app'), '--ui', '--kit', '../x')).rejects.toThrow('exit 1');
    expect(errors()).toContain(`"../x" isn't a kit id`);
    expect(existsSync(join(dir, 'app'))).toBe(false);
  });

  it('runs npx @mariachi/design-kits, in the version the project pins, when the package cannot be imported', async () => {
    const run = vi.fn<RunCommand>(async () => ({
      code: 0,
      stdout: JSON.stringify({ status: 'added', kit: { id: 'linen', label: 'Linen', version: MARIACHI_VERSION }, files: ['index.css', 'kit.json'] }),
      stderr: 'npm warn exec The following package was not found and will be installed',
    }));
    await initWith({ designKits: async () => undefined, run }, join(dir, 'app'), '--no-example', '--no-e2e', '--ui');
    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith('npx', ['--yes', `@mariachi/design-kits@${range}`, 'add', 'linen', '--dir', 'src/design', '--json'], { cwd: join(dir, 'app') });
    expect(kitCommand('folio', '^9.9.9').args).toEqual(['--yes', '@mariachi/design-kits@^9.9.9', 'add', 'folio', '--dir', 'src/design', '--json']);
    expect(vi.mocked(console.log).mock.calls.map(([line]) => String(line)).join('\n')).toMatch(/added.*src\/design\/ Linen \(linen\): 2 files/);
  });

  it('uses the range given with --mariachi-version for npx too', async () => {
    const run = vi.fn<RunCommand>(async () => ({ code: 0, stdout: JSON.stringify({ kit: { id: 'folio', label: 'Folio', version: '0.2.0' }, files: [] }), stderr: '' }));
    await initWith({ designKits: async () => undefined, run }, join(dir, 'app'), '--no-example', '--no-e2e', '--ui', '--kit', 'folio', '--mariachi-version', '~0.2.0');
    expect(run.mock.calls[0]?.[1]).toEqual(['--yes', '@mariachi/design-kits@~0.2.0', 'add', 'folio', '--dir', 'src/design', '--json']);
  });

  it('says plainly what to run by hand, and exits 1, when npx fails', async () => {
    exitThrows();
    const run = vi.fn<RunCommand>(async () => ({
      code: 1,
      stdout: JSON.stringify({ error: { code: 'design-kits/unknown-kit', message: 'Unknown kit "nope". Kits: linen, folio' } }),
      stderr: '',
    }));
    await expect(initWith({ designKits: async () => undefined, run }, join(dir, 'app'), '--no-example', '--no-e2e', '--ui', '--kit', 'nope')).rejects.toThrow('exit 1');
    expect(errors()).toContain('Unknown kit "nope". Kits: linen, folio');
    expect(errors()).toContain('Copy it in by hand: cd ');
    expect(errors()).toContain(`npx @mariachi/design-kits@${range} add nope --dir src/design`);
  });

  it('says what to run by hand when npx cannot be started at all', async () => {
    exitThrows();
    const run = vi.fn<RunCommand>(async () => ({ code: null, stdout: '', stderr: '', error: new Error('spawn npx ENOENT') }));
    await expect(initWith({ designKits: async () => undefined, run }, join(dir, 'app'), '--no-example', '--no-e2e', '--ui')).rejects.toThrow('exit 1');
    expect(errors()).toContain('npx could not be run (spawn npx ENOENT)');
    expect(errors()).toContain(`npx @mariachi/design-kits@${range} add linen --dir src/design`);
  });

  it('never loads or fetches design-kits for a project without --ui', async () => {
    const designKits = vi.fn(async () => undefined);
    const run = vi.fn<RunCommand>();
    await initWith({ designKits, run }, join(dir, 'app'), '--no-example');
    expect(designKits).not.toHaveBeenCalled();
    expect(run).not.toHaveBeenCalled();
    expect(existsSync(join(dir, 'app/src/design'))).toBe(false);
    expect(existsSync(join(dir, 'app/src/design.css'))).toBe(false);
  });
});
