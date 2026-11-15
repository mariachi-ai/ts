import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseEnv } from 'node:util';
import type { Command } from 'commander';
import { DIM, GREEN, RED, RESET, YELLOW } from '../colors';
import { runDoctor, type CheckResult, type CheckStatus } from '../doctor/checks';
import { fail } from '../output';

const MARK: Record<CheckStatus, string> = { ok: `${GREEN}ok${RESET}  `, warn: `${YELLOW}warn${RESET}`, fail: `${RED}fail${RESET}`, skip: `${DIM}skip${RESET}` };

/** The environment a project's app would start with: its `.env`, under whatever is already set. */
export function projectEnv(cwd: string): Record<string, string | undefined> {
  const file = join(cwd, '.env');
  const fromFile = existsSync(file) ? parseEnv(readFileSync(file, 'utf8')) : {};
  // Variables already set in the environment win over the file, as when the app starts
  return { ...fromFile, ...process.env };
}

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
    .option('--strict', 'exit 1 on warnings too')
    .option('--json', 'machine-readable output')
    .action(async (path: string | undefined, opts: { schema: string; out: string; timeout: string; strict?: boolean; json?: boolean }) => {
      try {
        const cwd = resolve(path ?? '.');
        const results = await runDoctor({ cwd, env: projectEnv(cwd), schema: opts.schema, migrations: opts.out, timeoutMs: Number(opts.timeout) || 5000 });
        if (opts.json) console.log(JSON.stringify({ ready: !results.some((r) => r.status === 'fail'), checks: results }, null, 2));
        else for (const line of formatDoctor(results)) console.log(line);
        if (results.some((r) => r.status === 'fail' || (opts.strict && r.status === 'warn'))) process.exitCode = 1;
      } catch (error) {
        fail(error);
      }
    });
}
