import { basename, relative, resolve } from 'node:path';
import type { Command } from 'commander';
import { createProject, PROJECT_AUTH, type ProjectAuth } from '@mariachi/create';
import { DIM, GREEN, RESET } from '../colors';
import { fail, printResult } from '../output';

/** What to type after `init`. GoTrue's address has to be in .env before the app can start, so that project makes its .env first. */
export function nextSteps(cd: string, auth: ProjectAuth): string[] {
  return [`cd ${cd}`, 'pnpm install', ...(auth === 'gotrue' ? ['cp .env.example .env'] : []), 'pnpm dev'];
}

export function registerInitCommand(program: Command): void {
  program
    .command('init <directory>')
    .description('Create a new Mariachi project (API, services, jobs, schema) in <directory>')
    .option('-n, --name <name>', 'package name (default: directory name)')
    .option('--no-example', 'skip the example "note" entity')
    .option('--no-e2e', 'skip end-to-end test support (pnpm test:e2e, which needs Docker)')
    .option('--mariachi-version <range>', 'version range for @mariachi/* dependencies')
    .option('--auth <provider>', 'how users sign in: jwt (HS256 tokens from JWT_SECRET) or gotrue (GoTrue / Supabase Auth, with a sign-in page)', 'jwt')
    .option('--orgs', 'organizations, memberships and invitations in your own database (@mariachi/organizations): for apps whose identity provider keeps none')
    .action(async (directory: string, opts: { name?: string; example: boolean; e2e: boolean; mariachiVersion?: string; auth: string; orgs?: boolean }) => {
      try {
        const outputDir = resolve(directory);
        const name = opts.name ?? basename(outputDir);
        const auth = opts.auth as ProjectAuth;
        const result = await createProject({ name, outputDir, example: opts.example, e2e: opts.e2e, mariachiVersion: opts.mariachiVersion, auth, organizations: opts.orgs === true });
        printResult(result);
        const cd = relative(process.cwd(), outputDir) || '.';
        console.log(`\n${GREEN}Created ${name}.${RESET} Next steps:\n`);
        for (const step of nextSteps(cd, auth)) console.log(`  ${DIM}$${RESET} ${step}`);
        console.log(`\n  ${DIM}pnpm dev${RESET} creates .env, starts Postgres (Docker Compose), applies the first migration and runs the app.`);
        if (auth === 'gotrue') {
          console.log(`  Sign-in is GoTrue's: set ${DIM}AUTH_URL${RESET} in .env (see README.md), then open ${DIM}/api/sign-in${RESET}.`);
        } else {
          const route = opts.orgs ? 'organizations' : opts.example ? 'notes' : 'health/ready';
          console.log(`  To call the API: ${DIM}curl -H "authorization: Bearer $(pnpm -s mariachi token${opts.orgs ? ' --no-tenant' : ''})" localhost:3000/api/${route}${RESET}`);
        }
        if (opts.orgs) {
          console.log(`\n  Organizations: the routes are under ${DIM}/api/organizations${RESET}. To email invitations, set ${DIM}INVITATION_URL${RESET} and ${DIM}EMAIL_ADAPTER${RESET} in .env (see README.md).`);
        }
      } catch (error) {
        fail(error);
      }
    });
}
