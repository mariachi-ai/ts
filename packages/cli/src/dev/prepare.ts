import { constants, existsSync } from 'node:fs';
import { copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ConfigError, type Logger } from '@mariachi/core';
import { PostgresAdapter, runMigrations } from '@mariachi/database-postgres';
import { envFiles as projectEnvFiles, projectEnv, type EnvFiles } from '../env-files';
import { readJournal } from '../db/migrations';
import { planProjectMigration, writePlannedMigration } from '../db/project';
import { composeFile, isLocal, safeUrl } from '../doctor/checks';
import { probeDatabase, probeRedis, reason } from '../doctor/probe';

export interface PrepareOptions {
  cwd: string;
  /** Default `src/schema/index.ts`. */
  schema?: string;
  /** Default `drizzle`. */
  migrations?: string;
  /**
   * Start the Compose services when a local Postgres or Redis isn't answering. Default true. With
   * `false`, something else runs them (an environment's own Compose, a container platform): this
   * only waits for them to answer.
   */
  services?: boolean;
  /** The project's env files. Default: package.json's `mariachi.envFiles`, else `.env`. */
  envFiles?: EnvFiles;
  /** How long to wait for the services after starting them. Default 60000. */
  waitMs?: number;
  /** How long one attempt to reach a service may take. Default 3000. */
  probeMs?: number;
  /** Runs a command in the project and resolves to its exit code. The command line spawns it; tests replace it. */
  exec: (command: string, args: string[]) => Promise<number>;
  /** One line per thing done. */
  log: (line: string) => void;
}

export interface Prepared {
  /** The environment the app starts with. */
  env: Record<string, string | undefined>;
  /** What was done, in order: `env`, `services`, `migration`, `migrate`. */
  did: string[];
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const quiet: Logger = { info() {}, warn() {}, error() {}, debug() {}, child: () => quiet } as unknown as Logger;

async function reachable(probe: () => Promise<unknown>): Promise<string | null> {
  try {
    await probe();
    return null;
  } catch (error) {
    return reason(error);
  }
}

/**
 * What stands between a fresh checkout and a running app, done in order:
 *
 * 1. `.env` from `.env.example` when there is none.
 * 2. The Compose services, when the project has a Compose file and its local Postgres or Redis
 *    isn't answering; then waits for them.
 * 3. A first migration, when the schema has tables and no migration exists yet. Later schema
 *    changes are not turned into migrations here: that stays a deliberate `mariachi db generate`.
 * 4. Pending migrations, applied.
 *
 * Nothing here is destructive: an existing `.env` is never written, and a migration is only ever
 * generated for an empty migrations folder.
 */
export async function prepareDev(options: PrepareOptions): Promise<Prepared> {
  const { cwd, log } = options;
  const schema = options.schema ?? 'src/schema/index.ts';
  const migrations = options.migrations ?? 'drizzle';
  const probeMs = options.probeMs ?? 3000;
  const did: string[] = [];

  if (!existsSync(join(cwd, 'package.json')) || !existsSync(join(cwd, 'src'))) {
    throw new ConfigError('cli/not-a-project', 'Run this in a project made by `mariachi init` (no package.json or no src/ here)');
  }

  const files = options.envFiles ?? projectEnvFiles(cwd);
  // Only for the default `.env`: a project that names its env files decides what's in them
  if (!files.configured && !existsSync(join(cwd, '.env')) && existsSync(join(cwd, '.env.example'))) {
    // EXCL: never over a file that appeared since the check
    await copyFile(join(cwd, '.env.example'), join(cwd, '.env'), constants.COPYFILE_EXCL);
    log('created .env from .env.example');
    did.push('env');
  }
  const env = projectEnv(cwd, files.files);

  const services: Array<{ name: string; url: string; probe: () => Promise<unknown> }> = [];
  if (env.DATABASE_URL) services.push({ name: 'Postgres', url: env.DATABASE_URL, probe: () => probeDatabase(env.DATABASE_URL as string, probeMs) });
  if (env.REDIS_URL) services.push({ name: 'Redis', url: env.REDIS_URL, probe: () => probeRedis(env.REDIS_URL as string, probeMs) });

  const down: typeof services = [];
  for (const service of services) if (await reachable(service.probe)) down.push(service);
  if (down.length) {
    const names = down.map((s) => `${s.name} at ${safeUrl(s.url)}`).join(' and ');
    const compose = composeFile(cwd);
    const managedElsewhere = options.services === false;
    if (!managedElsewhere && (!compose || !down.every((s) => isLocal(s.url)))) {
      throw new ConfigError('cli/services-unreachable', `Can't reach ${names}. Start them, or correct the URLs in ${files.files[files.files.length - 1] ?? '.env'}`);
    }
    if (managedElsewhere) {
      // Something else starts them, and they may still be coming up
      log(`waiting for ${down.map((s) => s.name).join(' and ')} (not started here: services are managed outside this command)`);
    } else {
      log(`starting services (docker compose up -d): ${down.map((s) => s.name).join(', ')} not answering`);
      const code = await options.exec('docker', ['compose', 'up', '-d']);
      if (code !== 0) throw new ConfigError('cli/compose-failed', `docker compose up -d exited with ${code}. Is Docker running? (Where something else runs the services, pass --no-services or set MARIACHI_DEV_SERVICES=off)`);
      did.push('services');
    }
    const deadline = Date.now() + (options.waitMs ?? 60_000);
    for (const service of down) {
      let last = await reachable(service.probe);
      while (last && Date.now() < deadline) {
        await sleep(500);
        last = await reachable(service.probe);
      }
      if (last) throw new ConfigError('cli/services-unreachable', `${service.name} at ${safeUrl(service.url)} still isn't answering: ${last}`);
      log(`${service.name} is up`);
    }
  }

  if (existsSync(join(cwd, schema))) {
    const journal = await readJournal(join(cwd, migrations));
    const plan = await planProjectMigration({ cwd, schema, out: migrations });
    let entries = journal.entries.length;
    if (plan.statements.length && entries === 0) {
      const written = await writePlannedMigration({ cwd, schema, out: migrations, name: 'init', plan });
      log(`wrote the first migration: ${written.file} (${plan.statements.length} statements). Commit the ${migrations}/ folder`);
      did.push('migration');
      entries = 1;
    } else if (plan.statements.length) {
      log(`note: the schema has ${plan.statements.length} change(s) that no migration captures. Run \`mariachi db generate\` when they're ready`);
    }
    if (entries > 0 && env.DATABASE_URL) {
      const before = (await probeDatabase(env.DATABASE_URL, probeMs)).lastMigration;
      const adapter = new PostgresAdapter({ adapter: 'postgres', url: env.DATABASE_URL, poolMax: 2, applicationName: 'mariachi-dev' });
      await adapter.connect();
      try {
        await runMigrations(adapter, { migrationsFolder: join(cwd, migrations), logger: quiet });
      } finally {
        await adapter.disconnect();
      }
      const after = (await probeDatabase(env.DATABASE_URL, probeMs)).lastMigration;
      if (after !== before) {
        log('applied pending migrations');
        did.push('migrate');
      }
    }
  }

  return { env, did };
}
