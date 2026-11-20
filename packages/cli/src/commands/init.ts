import { spawn } from 'node:child_process';
import { basename, join, relative, resolve } from 'node:path';
import type { Command } from 'commander';
import { ConfigError } from '@mariachi/core';
import { createProject, DEFAULT_KIT, DESIGN_KIT_DIR, MARIACHI_VERSION, type ProjectAuth } from '@mariachi/create';
import { DIM, GREEN, RESET } from '../colors';
import { fail, printResult } from '../output';
import { type DesignKits, optionalDesignKits } from './design';

/** What to type after `init`: the same for either sign-in, since a GoTrue project runs its own GoTrue and `init` wrote its keys into .env. */
export function nextSteps(cd: string): string[] {
  return [`cd ${cd}`, 'pnpm install', 'pnpm dev'];
}

/** What a command run by `init` gave back. `error` is set when it couldn't be started at all. */
export interface CommandResult {
  code: number | null;
  stdout: string;
  stderr: string;
  error?: Error;
}

/** Runs a command and collects its output. `init` uses it for npx; tests pass their own. */
export type RunCommand = (command: string, args: string[], options: { cwd: string }) => Promise<CommandResult>;

/** The part of `@mariachi/design-kits` that `init` uses. */
export type KitCopier = Pick<DesignKits, 'addKit' | 'kitJson'>;

export interface InitDeps {
  /** Loads `@mariachi/design-kits`, or gives undefined when it isn't installed. Called only for `--ui`. */
  designKits?: () => Promise<KitCopier | undefined>;
  /** Runs npx when `@mariachi/design-kits` isn't installed. */
  run?: RunCommand;
}

/** The same rule `@mariachi/design-kits` has for an id, checked before anything is written or run. */
const KIT_ID = /^[a-z][a-z0-9-]*$/;

export const runCommand: RunCommand = (command, args, { cwd }) =>
  new Promise((done) => {
    // npx is a .cmd file on Windows, which only a shell runs
    const child = spawn(command, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32' });
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr?.on('data', (chunk) => {
      stderr += chunk;
    });
    child.once('error', (error) => done({ code: null, stdout, stderr, error }));
    child.once('close', (code) => done({ code, stdout, stderr }));
  });

/**
 * The npx command that copies a kit into a new project with nothing installed: the
 * `@mariachi/design-kits` release in the range the project pins for every `@mariachi/*` package.
 */
export function kitCommand(id: string, range: string): { command: string; args: string[] } {
  return { command: 'npx', args: ['--yes', `@mariachi/design-kits@${range}`, 'add', id, '--dir', DESIGN_KIT_DIR, '--json'] };
}

interface CopiedKit {
  kit: { id: string; label: string; version: string };
  files: string[];
}

/** The line `init` prints once the kit is in. */
export const copiedLine = (copied: CopiedKit): string =>
  `${GREEN}added${RESET}   ${DESIGN_KIT_DIR}/ ${copied.kit.label} (${copied.kit.id}): ${copied.files.length} files, from @mariachi/design ${copied.kit.version}`;

/**
 * Copies the design kit into a project `createProject` has just written: with `@mariachi/design-kits`
 * when it can be imported, otherwise with npx. Throws `cli/design-kit-failed`, saying what to run by
 * hand, when the kit couldn't be copied.
 */
export async function copyKit(outputDir: string, id: string, range: string, kits: KitCopier | undefined, run: RunCommand): Promise<CopiedKit> {
  const { command, args } = kitCommand(id, range);
  const byHand = `${command} ${args.filter((arg) => arg !== '--json' && arg !== '--yes').join(' ')}`;
  const failed = (reason: string) =>
    new ConfigError(
      'cli/design-kit-failed',
      `The project is in ${outputDir}, but its design kit isn't: ${reason}\nCopy it in by hand: cd ${relative(process.cwd(), outputDir) || '.'} && ${byHand}`,
      { kit: id, command: byHand },
    );
  if (kits) {
    try {
      return kits.addKit(id, { dir: join(outputDir, DESIGN_KIT_DIR) });
    } catch (error) {
      throw failed(error instanceof Error ? error.message : String(error));
    }
  }
  console.log(`${DIM}Copying the ${id} design kit: ${command} ${args.join(' ')}${RESET}`);
  const ran = await run(command, args, { cwd: outputDir });
  if (ran.error) throw failed(`${command} could not be run (${ran.error.message})`);
  let parsed: (Partial<CopiedKit> & { error?: { code?: string; message?: string } }) | undefined;
  try {
    parsed = JSON.parse(ran.stdout.trim());
  } catch {
    parsed = undefined;
  }
  if (ran.code === 0 && parsed?.kit && Array.isArray(parsed.files)) return parsed as CopiedKit;
  const said = parsed?.error?.message ?? (ran.stderr.trim() || ran.stdout.trim()).split('\n').slice(-5).join('\n');
  throw failed(`${command} exited with ${ran.code}${said ? `:\n${said}` : ''}`);
}

export function registerInitCommand(program: Command, deps: InitDeps = {}): void {
  const loadKits = deps.designKits ?? optionalDesignKits;
  const run = deps.run ?? runCommand;
  program
    .command('init <directory>')
    .description('Create a new Mariachi project (API, services, jobs, schema) in <directory>')
    .option('-n, --name <name>', 'package name (default: directory name)')
    .option('--no-example', 'skip the example "note" entity')
    .option('--no-e2e', 'skip end-to-end test support (pnpm test:e2e, which needs Docker)')
    .option('--mariachi-version <range>', 'version range for @mariachi/* dependencies')
    .option('--auth <provider>', 'how users sign in: jwt (HS256 tokens from JWT_SECRET) or gotrue (GoTrue / Supabase Auth, with a sign-in page)', 'jwt')
    .option('--orgs', 'organizations, memberships and invitations in your own database (@mariachi/organizations): for apps whose identity provider keeps none')
    .option(
      '--ui',
      `pages sent by the same server as the API: @mariachi/design's components, with a design kit copied into ${DESIGN_KIT_DIR} for the look; add more with \`mariachi generate page\``,
    )
    .option('--kit <id>', `the design kit --ui copies into ${DESIGN_KIT_DIR} (default ${DEFAULT_KIT}; \`mariachi design list --kits\` lists them)`)
    .action(
      async (
        directory: string,
        opts: { name?: string; example: boolean; e2e: boolean; mariachiVersion?: string; auth: string; orgs?: boolean; ui?: boolean; kit?: string },
      ) => {
        try {
          const outputDir = resolve(directory);
          const name = opts.name ?? basename(outputDir);
          const auth = opts.auth as ProjectAuth;
          if (opts.kit !== undefined && !opts.ui) throw new ConfigError('cli/kit-needs-ui', '--kit picks the design kit of a project with pages: add --ui');
          const kit = opts.ui ? (opts.kit ?? DEFAULT_KIT) : undefined;
          if (kit !== undefined && !KIT_ID.test(kit)) throw new ConfigError('cli/invalid-kit', `"${kit}" isn't a kit id: kit ids are lowercase letters, digits and dashes`);
          // Only a project with pages loads @mariachi/design-kits. Checked before anything is written:
          // an unknown id throws design-kits/unknown-kit, naming the kits there are.
          const kits = kit !== undefined ? await loadKits() : undefined;
          if (kit !== undefined && kits) kits.kitJson(kit);
          const range = opts.mariachiVersion ?? `^${MARIACHI_VERSION}`;
          const result = await createProject({ name, outputDir, example: opts.example, e2e: opts.e2e, mariachiVersion: opts.mariachiVersion, auth, organizations: opts.orgs === true, ui: opts.ui === true });
          printResult(result);
          const copied = kit !== undefined ? await copyKit(outputDir, kit, range, kits, run) : undefined;
          if (copied) console.log(copiedLine(copied));
          const cd = relative(process.cwd(), outputDir) || '.';
          console.log(`\n${GREEN}Created ${name}.${RESET} Next steps:\n`);
          for (const step of nextSteps(cd)) console.log(`  ${DIM}$${RESET} ${step}`);
          if (auth === 'gotrue') {
            console.log(
              `\n  ${DIM}pnpm dev${RESET} starts Postgres, a local GoTrue and a mailbox (Docker Compose), applies the first migration and runs the app.`,
            );
            console.log(`  Sign in at ${DIM}http://localhost:3000/api/sign-in${RESET}; the email GoTrue sends is at ${DIM}http://localhost:8025${RESET}.`);
            console.log(`  .env holds the local GoTrue's keys, made for this project. To use a Supabase project instead, set ${DIM}AUTH_URL${RESET} (see README.md).`);
          } else {
            console.log(`\n  ${DIM}pnpm dev${RESET} creates .env, starts Postgres (Docker Compose), applies the first migration and runs the app.`);
            const route = opts.orgs ? 'organizations' : opts.example ? 'notes' : 'health/ready';
            console.log(`  To call the API: ${DIM}curl -H "authorization: Bearer $(pnpm -s mariachi token${opts.orgs ? ' --no-tenant' : ''})" localhost:3000/api/${route}${RESET}`);
          }
          if (opts.ui) {
            console.log(`  Pages: open ${DIM}http://localhost:3000/${RESET}; add one with ${DIM}pnpm mariachi generate page <name>${RESET}.`);
            console.log(
              `  Look: the ${copied?.kit.label ?? kit} kit in ${DIM}${DESIGN_KIT_DIR}/${RESET} is the project's own; change tokens in ${DIM}src/design.css${RESET}, or take another kit with ${DIM}mariachi design add <id>${RESET}.`,
            );
          }
          if (opts.orgs) {
            const invitations =
              auth === 'gotrue' && opts.ui
                ? `Invitations are emailed to the mailbox, and their link opens ${DIM}/invitations/accept${RESET}, which signs the invitee in and accepts.`
                : auth === 'gotrue'
                  ? `To email invitations (to the mailbox), set ${DIM}INVITATION_URL${RESET} to your accept page in .env (see README.md).`
                  : `To email invitations, set ${DIM}INVITATION_URL${RESET} and ${DIM}EMAIL_ADAPTER${RESET} in .env (see README.md).`;
            console.log(`\n  Organizations: the routes are under ${DIM}/api/organizations${RESET}. ${invitations}`);
          }
        } catch (error) {
          fail(error);
        }
      },
    );
}
