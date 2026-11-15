import { resolve } from 'node:path';
import type { Command } from 'commander';
import { DIM, GREEN, RED, RESET, YELLOW } from '../colors';
import { runDoctor, type CheckResult, type CheckStatus } from '../doctor/checks';
import { envFiles, projectEnv } from '../env-files';
import { fail } from '../output';

const MARK: Record<CheckStatus, string> = { ok: `${GREEN}ok${RESET}  `, warn: `${YELLOW}warn${RESET}`, fail: `${RED}fail${RESET}`, skip: `${DIM}skip${RESET}` };

/** The version of `doctor --json`'s shape. Check names and this shape are a contract for tools. */
export const DOCTOR_JSON_VERSION = 1;

const collect = (value: string, previous: string[]) => [...previous, value];

export function formatDoctor(results: CheckResult[]): string[] {
  const width = Math.max(...results.map((r) => r.name.length));
  const lines: string[] = [];
  for (const r of results) {
    lines.push(`${MARK[r.status]} ${r.name.padEnd(width)}  ${r.detail}`);
    if (r.fix) lines.push(`     ${' '.repeat(width)}  ${DIM}→ ${r.fix}${RESET}`);
  }
  const failed = results.filter((r) => r.status === 'fail').length;
  const warned = results.filter((r) => r.status === 'warn').length;
  lines.push('');
  if (failed) lines.push(`${RED}${failed} problem(s) to fix${warned ? `, ${warned} warning(s)` : ''}.${RESET}`);
  else if (warned) lines.push(`${YELLOW}Ready to run, with ${warned} warning(s).${RESET}`);
  else lines.push(`${GREEN}Ready to run.${RESET}`);
  return lines;
}

export function registerDoctorCommand(program: Command): void {
  program
    .command('doctor [path]')
    .description('Check that the project is ready to run (Node, packages, .env, config, database, migrations, Redis, architecture) and say how to fix what is not')
    .option('-s, --schema <path>', 'module exporting defineTable() tables', 'src/schema/index.ts')
    .option('-o, --out <dir>', 'migrations folder', 'drizzle')
    .option('--timeout <ms>', 'how long to wait for Postgres and Redis', '5000')
    .option('--env-file <file>', "an env file the app starts with (repeatable, later wins); default: package.json's mariachi.envFiles, else .env", collect, [])
    .option('--strict', 'exit 1 on warnings too')
    .option('--json', 'machine-readable output')
    .action(async (path: string | undefined, opts: { schema: string; out: string; timeout: string; envFile: string[]; strict?: boolean; json?: boolean }) => {
      try {
        const cwd = resolve(path ?? '.');
        const files = envFiles(cwd, opts.envFile);
        const results = await runDoctor({ cwd, env: projectEnv(cwd, files.files), envFiles: files, schema: opts.schema, migrations: opts.out, timeoutMs: Number(opts.timeout) || 5000 });
        if (opts.json) console.log(JSON.stringify({ version: DOCTOR_JSON_VERSION, ready: !results.some((r) => r.status === 'fail'), checks: results }, null, 2));
        else for (const line of formatDoctor(results)) console.log(line);
        if (results.some((r) => r.status === 'fail' || (opts.strict && r.status === 'warn'))) process.exitCode = 1;
      } catch (error) {
        fail(error);
      }
    });
}
