#!/usr/bin/env node
// Run before this package is published (prepublishOnly). Every kit names the @mariachi/design commit it was
// built from, and a project that copies a kit in keeps that name as the record of what it has. So the name
// has to be one commit, exactly: a build from a working tree with uncommitted changes in packages/design
// records "<sha> (with local changes)", and the bytes shipped would then be no commit's. Such a build is refused.
//
//   node scripts/check-release.mjs [dist]   (default: this package's dist)
//
// To release, build from a clean checkout of the commit being released (commit the version bump first).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.resolve(process.argv[2] ?? path.join(root, 'dist'));
const SHA = /^[0-9a-f]{40}$/;

const problems = [];
const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    problems.push(`${path.relative(dist, file) || file} is missing or isn't JSON`);
    return undefined;
  }
};
const checkCommit = (where, commit) => {
  if (typeof commit !== 'string' || !SHA.test(commit))
    problems.push(`${where} names commit ${JSON.stringify(commit ?? null)}, not one commit's full sha`);
};

const index = readJson(path.join(dist, 'kits.json'));
if (index) checkCommit('kits.json', index.design?.commit);
const kits = path.join(dist, 'kits');
const ids = fs.existsSync(kits)
  ? fs.readdirSync(kits).filter((id) => fs.existsSync(path.join(kits, id, 'kit.json')))
  : [];
if (index && ids.length === 0) problems.push('dist/kits has no kits');
const named = new Set();
for (const id of ids) {
  const kit = readJson(path.join(kits, id, 'kit.json'));
  if (!kit) continue;
  const commit = kit.mariachi?.commit;
  if (typeof commit !== 'string' || !SHA.test(commit)) named.add(JSON.stringify(commit ?? null));
  else if (index?.design?.commit && commit !== index.design.commit)
    problems.push(`kits/${id}/kit.json names ${commit}, kits.json ${index.design.commit}`);
}
if (named.size) problems.push(`${ids.length} kits name ${[...named].join(', ')}, not one commit's full sha`);

if (problems.length) {
  console.error(
    `@mariachi/design-kits: not publishing. The kits must come from one commit of @mariachi/design:\n${problems.map((p) => `  - ${p}`).join('\n')}`,
  );
  console.error(
    'Build from a clean checkout of the commit being released (commit the version bump before building), then publish.',
  );
  process.exit(1);
}
console.log(`@mariachi/design-kits: ${ids.length} kits, all from @mariachi/design commit ${index.design.commit}`);
