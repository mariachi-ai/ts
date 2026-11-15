import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { createJiti } from 'jiti';
import { ConfigError } from '@mariachi/core';
import { toDrizzleImports } from '@mariachi/database-postgres';
import { drizzleConfigSource, planMigration, schemaShimSource, writeMigration, type PlannedMigration } from './migrations';

/** Loads a TypeScript module of the project (its schema, its seeds). */
export async function importModule(path: string, cwd: string = process.cwd()): Promise<Record<string, unknown>> {
  const abs = resolve(cwd, path);
  if (!existsSync(abs)) throw new ConfigError('cli/file-not-found', `File not found: ${relative(cwd, abs)}`);
  // No module cache: the schema is read again each time, so a file changed since the last look is seen (dev and doctor can run in one process)
  const jiti = createJiti(import.meta.url, { interopDefault: true, moduleCache: false });
  return (await jiti.import(abs)) as Record<string, unknown>;
}

export interface WrittenMigration {
  plan: PlannedMigration;
  /** The migration file, or null when the schema had no changes. */
  file: string | null;
  /** True when `drizzle.config.ts` was created. */
  wroteConfig: boolean;
}

/** The plan for the project's schema against its migrations folder. */
export async function planProjectMigration(options: { cwd?: string; schema: string; out: string }): Promise<PlannedMigration> {
  const cwd = options.cwd ?? process.cwd();
  return planMigration(resolve(cwd, options.out), await importModule(options.schema, cwd));
}

/**
 * Writes the migration for a plan (what `db generate` does once it has decided to go ahead), with
 * the files drizzle-kit's own tooling reads.
 */
export async function writePlannedMigration(options: { cwd?: string; schema: string; out: string; name: string; plan: PlannedMigration }): Promise<WrittenMigration> {
  const cwd = options.cwd ?? process.cwd();
  const out = resolve(cwd, options.out);
  const file = await writeMigration(out, options.plan, options.name);
  if (!file) return { plan: options.plan, file: null, wroteConfig: false };
  const schema = await importModule(options.schema, cwd);
  const shimPath = join(out, 'meta', 'schema.ts');
  const schemaImport = relative(dirname(shimPath), resolve(cwd, options.schema)).replace(/\.ts$/, '');
  await writeFile(shimPath, schemaShimSource(schemaImport.startsWith('.') ? schemaImport : `./${schemaImport}`, Object.keys(toDrizzleImports(schema))));
  const config = join(cwd, 'drizzle.config.ts');
  const wroteConfig = !existsSync(config);
  if (wroteConfig) {
    const rel = (p: string) => `./${relative(cwd, p).split('\\').join('/')}`;
    await writeFile(config, drizzleConfigSource({ out: rel(out), schemaShim: rel(shimPath) }));
  }
  return { plan: options.plan, file, wroteConfig };
}
