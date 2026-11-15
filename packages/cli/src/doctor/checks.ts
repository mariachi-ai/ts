import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfig } from '@mariachi/config';
import { validate } from '@mariachi/create';
import { planProjectMigration } from '../db/project';
import { readJournal } from '../db/migrations';
import { probeDatabase, probeRedis, reason, type DatabaseProbe } from './probe';

export type CheckStatus = 'ok' | 'warn' | 'fail' | 'skip';

export interface CheckResult {
  /** Stable id: `node`, `project`, `dependencies`, `env`, `config`, `database`, `migrations`, `redis`, `architecture`. */
  name: string;
  status: CheckStatus;
  detail: string;
  /** What to run or change. Present on `warn` and `fail` when there is something to do. */
  fix?: string;
}

export interface DoctorOptions {
  /** The project's root. */
  cwd: string;
  /** The environment the app would start with (the process's, with `.env` loaded). */
  env: Record<string, string | undefined>;
  /** Default `src/schema/index.ts`. */
  schema?: string;
  /** Default `drizzle`. */
  migrations?: string;
  /** How long to wait for Postgres and Redis. Default 5000. */
  timeoutMs?: number;
  /** The running Node version. Default `process.versions.node`. */
  nodeVersion?: string;
}

const readJson = (file: string): Record<string, unknown> | null => {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const numbers = (version: string): number[] => version.replace(/^[^\d]*/, '').split('.').map((n) => Number.parseInt(n, 10) || 0);

/** True when `version` is at least the `>=x.y.z` a package's `engines.node` asks for. Other range shapes pass. */
export function satisfiesMinimum(version: string, range: string): boolean {
  const minimum = /^\s*>=\s*(\d+(?:\.\d+){0,2})\s*$/.exec(range)?.[1];
  if (!minimum) return true;
  const [have, want] = [numbers(version), numbers(minimum)];
  for (let i = 0; i < 3; i++) {
    if ((have[i] ?? 0) !== (want[i] ?? 0)) return (have[i] ?? 0) > (want[i] ?? 0);
  }
  return true;
}

/** The variable names a `.env.example` sets (uncommented `NAME=` lines). */
export function exampleKeys(text: string): string[] {
  return [...text.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map((m) => m[1] as string);
}

export const isLocal = (url: string): boolean => {
  try {
    return ['localhost', '127.0.0.1', '::1', '[::1]'].includes(new URL(url).hostname);
  } catch {
    return false;
  }
};

export const composeFile = (cwd: string): string | undefined => ['docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml'].find((f) => existsSync(join(cwd, f)));

/** What to do about a local service that isn't answering. */
function startHint(cwd: string, url: string, service: string): string {
  if (!isLocal(url)) return `Check that ${service} at ${safeUrl(url)} is running and reachable from here`;
  return composeFile(cwd) ? 'docker compose up -d (or: mariachi dev, which starts the services and waits for them)' : `Start ${service} on ${new URL(url).host}`;
}

/** A URL without its password, for messages. */
export function safeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) parsed.password = '***';
    return parsed.toString();
  } catch {
    return '(not a URL)';
  }
}

/**
 * Checks that a project is ready to run, in the order a first run goes wrong: Node, the project
 * itself, installed packages, `.env`, the configuration the app would load, the database, its
 * migrations, Redis, and the architecture rules. Each result says what it found and what to do.
 * Later checks that depend on an earlier failure are skipped, not failed twice.
 */
export async function runDoctor(options: DoctorOptions): Promise<CheckResult[]> {
  const { cwd, env } = options;
  const schema = options.schema ?? 'src/schema/index.ts';
  const migrations = options.migrations ?? 'drizzle';
  const timeoutMs = options.timeoutMs ?? 5000;
  const results: CheckResult[] = [];
  const add = (name: string, status: CheckStatus, detail: string, fix?: string) => void results.push({ name, status, detail, ...(fix ? { fix } : {}) });

  // --- the project
  const pkg = readJson(join(cwd, 'package.json'));
  const deps = { ...(pkg?.dependencies as Record<string, string> | undefined), ...(pkg?.devDependencies as Record<string, string> | undefined) };
  const node = options.nodeVersion ?? process.versions.node;
  const wanted = (pkg?.engines as { node?: string } | undefined)?.node;
  if (wanted && !satisfiesMinimum(node, wanted)) add('node', 'fail', `Node ${node}; this project needs ${wanted}`, `Install Node ${wanted.replace(/^\s*>=\s*/, '')} or newer`);
  else add('node', 'ok', `Node ${node}${wanted ? ` (needs ${wanted})` : ''}`);

  if (!pkg || !deps['@mariachi/core'] || !existsSync(join(cwd, 'src'))) {
    add('project', 'fail', 'This is not a Mariachi project (no package.json that depends on @mariachi/core, or no src/)', 'Run this in a project made by `mariachi init`');
    return results;
  }
  add('project', 'ok', `${String(pkg.name ?? 'unnamed')} ${String(pkg.version ?? '')}`.trim());

  // --- installed packages
  const scope = join(cwd, 'node_modules', '@mariachi');
  if (!existsSync(join(scope, 'core', 'package.json'))) {
    add('dependencies', 'fail', 'Dependencies are not installed', 'pnpm install');
  } else {
    const versions = new Map<string, string[]>();
    for (const name of readdirSync(scope)) {
      const version = readJson(join(scope, name, 'package.json'))?.version;
      if (typeof version === 'string') versions.set(version, [...(versions.get(version) ?? []), name]);
    }
    if (versions.size > 1) {
      const mix = [...versions].map(([version, names]) => `${version}: ${names.join(', ')}`).join('; ');
      add('dependencies', 'warn', `@mariachi packages are at different versions (${mix}). They are released together and tested together`, 'Set every @mariachi/* dependency to the same version, then pnpm install');
    } else add('dependencies', 'ok', `@mariachi ${[...versions.keys()][0] ?? ''} installed`.trim());
  }

  // --- .env
  const example = existsSync(join(cwd, '.env.example')) ? exampleKeys(readFileSync(join(cwd, '.env.example'), 'utf8')) : [];
  const missing = example.filter((key) => !env[key]);
  if (!existsSync(join(cwd, '.env')) && example.length) {
    add('env', missing.length ? 'fail' : 'warn', `.env is missing${missing.length ? `, and the environment has no ${missing.join(', ')}` : ' (the environment has what .env.example lists)'}`, 'cp .env.example .env');
  } else if (missing.length) {
    add('env', 'warn', `.env.example lists ${missing.join(', ')}, which ${missing.length === 1 ? 'is' : 'are'} empty or missing here`, 'Set them in .env (copy the lines from .env.example)');
  } else add('env', 'ok', example.length ? `Every variable in .env.example is set (${example.length})` : 'No .env.example to compare with');

  // --- the configuration the app would load
  let configured = true;
  try {
    loadConfig({}, { env });
    add('config', 'ok', 'The configuration loads');
  } catch (error) {
    configured = false;
    add('config', 'fail', `The configuration does not load: ${reason(error)}`, 'Fix the variable it names in .env');
  }

  // --- the database and its migrations
  const databaseUrl = env.DATABASE_URL;
  let database: DatabaseProbe | undefined;
  if (!databaseUrl) {
    add('database', example.includes('DATABASE_URL') || configured ? 'fail' : 'skip', 'DATABASE_URL is not set', 'Set DATABASE_URL in .env');
  } else {
    try {
      database = await probeDatabase(databaseUrl, timeoutMs);
      add('database', 'ok', `Postgres ${database.version} at ${safeUrl(databaseUrl)}`);
    } catch (error) {
      add('database', 'fail', `Can't reach Postgres at ${safeUrl(databaseUrl)}: ${reason(error)}`, startHint(cwd, databaseUrl, 'Postgres'));
    }
  }

  if (!existsSync(join(cwd, schema))) {
    add('migrations', 'skip', `No schema at ${schema}`);
  } else {
    try {
      const journal = await readJournal(join(cwd, migrations));
      const plan = await planProjectMigration({ cwd, schema, out: migrations });
      const pending = database ? journal.entries.filter((entry) => database?.lastMigration === null || entry.when > (database?.lastMigration ?? 0)) : [];
      if (plan.statements.length && journal.entries.length === 0) {
        add('migrations', 'fail', 'The schema has tables and there are no migrations yet', 'mariachi db generate && mariachi db migrate (or: mariachi dev, which does both on a first run)');
      } else if (plan.statements.length) {
        add('migrations', 'warn', `The schema has ${plan.statements.length} change(s) that no migration captures`, 'mariachi db generate, review the SQL, then mariachi db migrate');
      } else if (pending.length) {
        add('migrations', 'fail', `${pending.length} migration(s) are not applied to the database: ${pending.map((e) => e.tag).join(', ')}`, 'mariachi db migrate');
      } else if (!database) {
        add('migrations', 'skip', `${journal.entries.length} migration(s) match the schema; whether they are applied can't be told without the database`);
      } else add('migrations', 'ok', journal.entries.length ? `${journal.entries.length} migration(s), all applied, matching the schema` : 'The schema has no tables yet');
    } catch (error) {
      add('migrations', 'fail', `Can't read the schema or the migrations: ${reason(error)}`, `Check ${schema} and ${migrations}/meta`);
    }
  }

  // --- Redis
  const redisUrl = env.REDIS_URL;
  if (!redisUrl) {
    if (example.includes('REDIS_URL')) add('redis', 'fail', 'REDIS_URL is not set, and .env.example says this project uses Redis', 'Set REDIS_URL in .env');
    else add('redis', 'skip', 'REDIS_URL is not set; this project does not use Redis');
  } else {
    try {
      await probeRedis(redisUrl, timeoutMs);
      add('redis', 'ok', `Redis at ${safeUrl(redisUrl)}`);
    } catch (error) {
      add('redis', 'fail', `Can't reach Redis at ${safeUrl(redisUrl)}: ${reason(error)}`, startHint(cwd, redisUrl, 'Redis'));
    }
  }

  // --- the architecture rules
  try {
    const checked = await validate(cwd);
    const errors = checked.violations.filter((v) => v.severity === 'error').length;
    const warnings = checked.violations.length - errors;
    if (errors) add('architecture', 'fail', `${errors} rule violation(s) in ${checked.filesChecked} files`, 'mariachi validate');
    else if (warnings) add('architecture', 'warn', `${warnings} warning(s) in ${checked.filesChecked} files`, 'mariachi validate');
    else add('architecture', 'ok', `${checked.filesChecked} files follow the architecture rules`);
  } catch (error) {
    add('architecture', 'fail', `mariachi validate could not run: ${reason(error)}`);
  }

  return results;
}
