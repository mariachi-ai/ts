import type { Command } from 'commander';
import { ConfigError } from '@mariachi/core';
import { DIM, GREEN, RED, RESET, YELLOW } from '../colors';
import { LIST_JSON_VERSION, type JobEntry, type ListIssue, type Location, type ProcedureEntry, type ProjectListing, type RouteEntry } from '../list/listing';
import { listProject } from '../list/project';
import { fail } from '../output';

export const LIST_SECTIONS = ['routes', 'procedures', 'jobs'] as const;
export type ListSection = (typeof LIST_SECTIONS)[number];

const at = (location: Location | undefined) => (location ? `${location.file}:${location.line}` : '');

/** Columns padded to their widest cell, and a dimmed last part that is not. */
function table(rows: string[][], tails: string[]): string[] {
  const widths: number[] = [];
  for (const row of rows) {
    row.forEach((cell, i) => {
      widths[i] = Math.max(widths[i] ?? 0, cell.length);
    });
  }
  return rows.map((row, i) => `${row.map((cell, j) => cell.padEnd(widths[j] as number)).join('  ')}  ${DIM}${tails[i]}${RESET}`.trimEnd());
}

/** `session`, `public`, `default` (the server's, not found), `session, tenant optional`. */
export function authText(route: RouteEntry): string {
  if (route.auth === null) return 'default';
  if (route.auth.length === 0) return 'public';
  const parts = [route.auth.join('|')];
  if (route.tenant === 'optional') parts.push('tenant optional');
  if (route.scopes.length) parts.push(`scopes ${route.scopes.join(' ')}`);
  return parts.join(', ');
}

export function formatRoutes(routes: RouteEntry[]): string[] {
  if (routes.length === 0) return [`${DIM}No routes.${RESET}`];
  const rows = routes.map((r) => [r.method, r.path, authText(r), r.procedures.length ? r.procedures.join(', ') : r.kind === 'controller' ? '-' : `(${r.kind})`]);
  return table(
    rows,
    routes.map((r) => [r.controller ?? '', at(r.location)].filter(Boolean).join(' ')),
  );
}

export function formatProcedures(procedures: ProcedureEntry[]): string[] {
  if (procedures.length === 0) return [`${DIM}No procedures.${RESET}`];
  const width = Math.max(...procedures.map((p) => p.name.length));
  const lines: string[] = [];
  for (const p of procedures) {
    const callers = p.calledBy.length ? `  ← ${p.calledBy.join(', ')}` : '';
    lines.push(`${p.name.padEnd(width)}  ${DIM}${at(p.location)}${RESET}${callers}`.trimEnd());
    if (p.input) lines.push(`  ${DIM}in ${RESET} ${p.input}`);
    if (p.output) lines.push(`  ${DIM}out${RESET} ${p.output}`);
  }
  return lines;
}

/** 1000 → `1s`, 90000 → `90s`, 300000 → `5m`, 250 → `250ms`. */
export function duration(ms: number): string {
  if (ms % 60_000 === 0 && ms >= 120_000) return `${ms / 60_000}m`;
  if (ms % 1000 === 0 && ms >= 1000) return `${ms / 1000}s`;
  return `${ms}ms`;
}

export function formatJobs(jobs: JobEntry[]): string[] {
  if (jobs.length === 0) return [`${DIM}No jobs.${RESET}`];
  const width = Math.max(...jobs.map((j) => j.name.length));
  const lines: string[] = [];
  for (const job of jobs) {
    const facts: string[] = [];
    if (job.retry?.attempts) {
      facts.push(`${job.retry.attempts} attempts${job.retry.backoff ? `, ${job.retry.backoff}` : ''}${job.retry.delay ? ` from ${duration(job.retry.delay)}` : ''}`);
    }
    if (job.timeoutMs !== undefined) facts.push(`timeout ${duration(job.timeoutMs)}`);
    lines.push(`${job.name.padEnd(width)}  ${DIM}${at(job.location)}${RESET}${facts.length ? `  ${facts.join('; ')}` : ''}`.trimEnd());
    if (job.payload) lines.push(`  ${DIM}payload ${RESET} ${job.payload}`);
    for (const s of job.schedules) lines.push(`  ${DIM}schedule${RESET} ${s.cron}${s.timezone ? ` ${s.timezone}` : ''} (${s.name})  ${DIM}${s.file}:${s.line}${RESET}`);
    if (job.schedules.length === 0) lines.push(`  ${DIM}schedule${RESET} none: runs when enqueued`);
  }
  return lines;
}

export function formatIssues(issues: ListIssue[]): string[] {
  return issues.map((i) => `${i.severity === 'error' ? `${RED}error${RESET}` : `${YELLOW}warn${RESET} `} ${i.message} ${DIM}${i.code}${RESET}`);
}

/** The listing as text, one section after another. */
export function formatListing(listing: ProjectListing, sections: readonly ListSection[]): string[] {
  const lines: string[] = [];
  const section = (title: string, count: number, body: string[]) => {
    if (lines.length) lines.push('');
    lines.push(`${GREEN}${title}${RESET} ${DIM}(${count})${RESET}`, ...body);
  };
  if (sections.includes('routes')) section('Routes', listing.routes.length, formatRoutes(listing.routes));
  if (sections.includes('procedures')) section('Procedures', listing.procedures.length, formatProcedures(listing.procedures));
  if (sections.includes('jobs')) section('Jobs', listing.jobs.length, formatJobs(listing.jobs));
  if (listing.issues.length) lines.push('', ...formatIssues(listing.issues));
  return lines;
}

/** The `--json` document: the sections asked for, and the issues. */
export function listingJson(listing: ProjectListing, sections: readonly ListSection[]): Record<string, unknown> {
  const out: Record<string, unknown> = { version: LIST_JSON_VERSION, root: listing.root };
  for (const name of sections) out[name] = listing[name];
  out.issues = listing.issues;
  return out;
}

export function parseSection(what: string | undefined): ListSection[] {
  if (!what) return [...LIST_SECTIONS];
  const name = what.toLowerCase();
  const found = LIST_SECTIONS.find((s) => s === name || s === `${name}s`);
  if (!found) throw new ConfigError('cli/list-unknown-section', `mariachi list shows routes, procedures or jobs, not "${what}"`);
  return [found];
}

export function registerListCommand(program: Command): void {
  program
    .command('list [what]')
    .description("List what the project exposes, from its own registrations and without starting it: routes (method, path, auth, the procedure each calls), procedures (input and output, where registered, which routes call them) and jobs (payload, retries, schedules). `what` is routes, procedures or jobs; all three by default")
    .option('--json', 'machine-readable output')
    .option('-C, --cwd <dir>', 'the project to list', '.')
    .action(async (what: string | undefined, opts: { json?: boolean; cwd: string }) => {
      try {
        const sections = parseSection(what);
        const listing = await listProject(opts.cwd, { only: sections });
        if (opts.json) console.log(JSON.stringify(listingJson(listing, sections), null, 2));
        else for (const line of formatListing(listing, sections)) console.log(line);
        if (listing.issues.some((i) => i.severity === 'error')) process.exitCode = 1;
      } catch (error) {
        fail(error);
      }
    });
}
