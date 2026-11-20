import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Command } from 'commander';
import { ConfigError } from '@mariachi/core';
import { DIM, GREEN, RESET } from '../colors';
import { prepareDev } from '../dev/prepare';
import { envFiles } from '../env-files';
import { fail } from '../output';

/** Runs a command with the terminal attached and resolves to its exit code (127 when it isn't installed). */
function exec(cwd: string) {
  return (command: string, args: string[]): Promise<number> =>
    new Promise((done) => {
      const child = spawn(command, args, { cwd, stdio: 'inherit' });
      child.once('error', () => done(127));
      child.once('exit', (code) => done(code ?? 1));
    });
}

const collect = (value: string, previous: string[]) => [...previous, value];

/** True unless the environment says something else runs the services (`MARIACHI_DEV_SERVICES=off`). */
export function servicesFromEnv(value: string | undefined): boolean {
  return !['off', 'false', '0', 'no'].includes((value ?? '').trim().toLowerCase());
}

/** The command that runs the app: tsx from the project, watching unless told not to, with the project's env files that exist, in order. */
export function appCommand(cwd: string, entry: string, watch: boolean, files: string[] = ['.env']): { command: string; args: string[] } {
  const tsx = join(cwd, 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx');
  if (!existsSync(tsx)) throw new ConfigError('cli/tsx-missing', 'tsx is not installed in this project: pnpm install (it is a devDependency of generated projects)');
  if (!existsSync(join(cwd, entry))) throw new ConfigError('cli/file-not-found', `File not found: ${entry}`);
  // Node gives a later --env-file precedence over an earlier one, and the environment precedence over both
  return { command: tsx, args: [...(watch ? ['watch'] : []), ...files.filter((f) => existsSync(join(cwd, f))).map((f) => `--env-file=${f}`), entry] };
}

export function registerDevCommand(program: Command): void {
  program
    .command('dev [path]')
    .description('Get the project running: .env, the Compose services, a first migration, pending migrations, then the app with reload')
    .option('-e, --entry <file>', 'the app to run', 'src/main.ts')
    .option('-s, --schema <path>', 'module exporting defineTable() tables', 'src/schema/index.ts')
    .option('-o, --out <dir>', 'migrations folder', 'drizzle')
    .option('--no-services', "don't start the Compose services; wait for the database, Redis and a local GoTrue to answer instead (also: MARIACHI_DEV_SERVICES=off)")
    .option('--env-file <file>', "an env file the app starts with (repeatable, later wins); default: package.json's mariachi.envFiles, else .env", collect, [])
    .option('--wait <ms>', 'how long to wait for the database, Redis and a local GoTrue to answer', '60000')
    .option('--no-watch', 'run once, without reloading on changes')
    .option('--prepare-only', 'do the preparation and stop before starting the app')
    .action(async (path: string | undefined, opts: { entry: string; schema: string; out: string; services: boolean; watch: boolean; envFile: string[]; wait: string; prepareOnly?: boolean }) => {
      try {
        const cwd = resolve(path ?? '.');
        const files = envFiles(cwd, opts.envFile);
        await prepareDev({
          cwd,
          schema: opts.schema,
          migrations: opts.out,
          services: opts.services && servicesFromEnv(process.env.MARIACHI_DEV_SERVICES),
          envFiles: files,
          waitMs: Number(opts.wait) || 60_000,
          exec: exec(cwd),
          log: (line) => console.log(`${GREEN}dev${RESET} ${line}`),
        });
        if (opts.prepareOnly) return;
        const { command, args } = appCommand(cwd, opts.entry, opts.watch, files.files);
        console.log(`${GREEN}dev${RESET} starting ${opts.entry} ${DIM}(tsx ${args.slice(0, -1).join(' ')})${RESET}`);
        const child = spawn(command, args, { cwd, stdio: 'inherit' });
        // Ctrl-C reaches the child through the terminal; these cover a signal sent to this process alone
        const forward = (signal: NodeJS.Signals) => () => void child.kill(signal);
        process.on('SIGINT', forward('SIGINT'));
        process.on('SIGTERM', forward('SIGTERM'));
        child.once('error', (error) => fail(error));
        child.once('exit', (code, signal) => {
          process.exitCode = code ?? (signal ? 1 : 0);
        });
      } catch (error) {
        fail(error);
      }
    });
}
