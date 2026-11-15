import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Command } from 'commander';
import { ConfigError } from '@mariachi/core';
import { DIM, GREEN, RESET } from '../colors';
import { prepareDev } from '../dev/prepare';
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

/** The command that runs the app: tsx from the project, watching unless told not to, with `.env` when there is one. */
export function appCommand(cwd: string, entry: string, watch: boolean): { command: string; args: string[] } {
  const tsx = join(cwd, 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx');
  if (!existsSync(tsx)) throw new ConfigError('cli/tsx-missing', 'tsx is not installed in this project: pnpm install (it is a devDependency of generated projects)');
  if (!existsSync(join(cwd, entry))) throw new ConfigError('cli/file-not-found', `File not found: ${entry}`);
  return { command: tsx, args: [...(watch ? ['watch'] : []), ...(existsSync(join(cwd, '.env')) ? ['--env-file=.env'] : []), entry] };
}

export function registerDevCommand(program: Command): void {
  program
    .command('dev [path]')
    .description('Get the project running: .env, the Compose services, a first migration, pending migrations, then the app with reload')
    .option('-e, --entry <file>', 'the app to run', 'src/main.ts')
    .option('-s, --schema <path>', 'module exporting defineTable() tables', 'src/schema/index.ts')
    .option('-o, --out <dir>', 'migrations folder', 'drizzle')
    .option('--no-services', "don't start the Compose services when the database or Redis isn't answering")
    .option('--no-watch', 'run once, without reloading on changes')
    .option('--prepare-only', 'do the preparation and stop before starting the app')
    .action(async (path: string | undefined, opts: { entry: string; schema: string; out: string; services: boolean; watch: boolean; prepareOnly?: boolean }) => {
      try {
        const cwd = resolve(path ?? '.');
        await prepareDev({
          cwd,
          schema: opts.schema,
          migrations: opts.out,
          services: opts.services,
          exec: exec(cwd),
          log: (line) => console.log(`${GREEN}dev${RESET} ${line}`),
        });
        if (opts.prepareOnly) return;
        const { command, args } = appCommand(cwd, opts.entry, opts.watch);
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
