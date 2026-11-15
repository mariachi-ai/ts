import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseEnv } from 'node:util';

export interface EnvFiles {
  /** The files, in order: a later file's value wins over an earlier one's. Missing files are skipped. */
  files: string[];
  /** True when the project (or the command line) named them, false for the default `.env`. */
  configured: boolean;
}

/**
 * The env files a project's app starts with. In order of precedence: `--env-file` flags, then
 * `"mariachi": { "envFiles": [...] }` in the project's package.json, then `.env`.
 */
export function envFiles(cwd: string, flags: string[] = []): EnvFiles {
  if (flags.length) return { files: flags, configured: true };
  try {
    const pkg = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8')) as { mariachi?: { envFiles?: unknown } };
    const listed = pkg.mariachi?.envFiles;
    if (Array.isArray(listed) && listed.length && listed.every((f) => typeof f === 'string' && f)) return { files: listed as string[], configured: true };
  } catch {
    // No package.json, or not JSON: the default
  }
  return { files: ['.env'], configured: false };
}

/** What the files set, later files over earlier ones. */
export function readEnvFiles(cwd: string, files: string[]): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const file of files) {
    const path = join(cwd, file);
    if (existsSync(path)) Object.assign(merged, parseEnv(readFileSync(path, 'utf8')));
  }
  return merged;
}

/** The environment the app would start with: its env files, under whatever is already set (which wins, as when it starts). */
export function projectEnv(cwd: string, files: string[] = envFiles(cwd).files): Record<string, string | undefined> {
  return { ...readEnvFiles(cwd, files), ...process.env };
}

/** Puts the project's env files into this process's environment, without replacing what is already set. */
export function loadEnvFiles(cwd: string, files: string[] = envFiles(cwd).files): void {
  for (const [key, value] of Object.entries(readEnvFiles(cwd, files))) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
