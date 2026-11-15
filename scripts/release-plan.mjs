#!/usr/bin/env node
/**
 * Says what the Release workflow has to do, as GitHub Actions outputs:
 *
 *   changesets=<n>    pending changesets: the "Version Packages" pull request needs opening or updating
 *   unpublished=<n>   public packages whose version isn't on npm yet: a publish is due
 *
 * The publish job runs in an environment that asks a person to approve, so it must start only when
 * there is something to publish. Run with `--print` to see the plan without writing outputs.
 */
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;

const changesets = readdirSync(join(root, '.changeset')).filter((name) => name.endsWith('.md') && name !== 'README.md').length;

/** The version of a package on npm, or undefined when npm has no such version (or no such package). */
function published(name, version) {
  try {
    return execFileSync('npm', ['view', `${name}@${version}`, 'version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || undefined;
  } catch {
    return undefined;
  }
}

const missing = [];
for (const dir of readdirSync(join(root, 'packages'))) {
  const file = join(root, 'packages', dir, 'package.json');
  if (!existsSync(file)) continue;
  const pkg = JSON.parse(readFileSync(file, 'utf8'));
  if (pkg.private) continue;
  if (!published(pkg.name, pkg.version)) missing.push(`${pkg.name}@${pkg.version}`);
}

console.log(`${changesets} pending changeset(s).`);
console.log(missing.length ? `Not on npm:\n  ${missing.join('\n  ')}` : 'Every public package is on npm at its current version.');

const output = process.env.GITHUB_OUTPUT;
if (output && !process.argv.includes('--print')) {
  appendFileSync(output, `changesets=${changesets}\nunpublished=${missing.length}\n`);
}
