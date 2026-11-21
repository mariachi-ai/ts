import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { tmp } from '../src/fixture';

const script = path.join(__dirname, '..', 'scripts', 'check-release.mjs');
const SHA = 'b66459c5c732388542f997b5221f5f6e290026fa';

/** A dist with kits.json and one kit.json per id, each naming `commit` (or its own, from `kitCommits`). */
function dist(commit: string, kitCommits: Record<string, string> = {}, ids = ['linen', 'marigold']): string {
  const dir = tmp('check-release');
  fs.writeFileSync(
    path.join(dir, 'kits.json'),
    JSON.stringify({ format: 1, design: { package: '@mariachi/design', version: '1.0.0', commit }, kits: [] }),
  );
  for (const id of ids) {
    fs.mkdirSync(path.join(dir, 'kits', id), { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'kits', id, 'kit.json'),
      JSON.stringify({
        id,
        mariachi: { package: '@mariachi/design', version: '1.0.0', commit: kitCommits[id] ?? commit },
      }),
    );
  }
  return dir;
}

const check = (dir: string) => spawnSync(process.execPath, [script, dir], { encoding: 'utf8' });

describe('check-release (prepublishOnly)', () => {
  it('lets kits built from one clean commit through', () => {
    const run = check(dist(SHA));
    expect(run.status, run.stderr).toBe(0);
    expect(run.stdout).toContain(`2 kits, all from @mariachi/design commit ${SHA}`);
  });

  it('refuses kits built from a working tree with local changes', () => {
    const run = check(dist(`${SHA} (with local changes)`));
    expect(run.status).toBe(1);
    expect(run.stderr).toContain('not publishing');
    expect(run.stderr).toContain(`kits.json names commit "${SHA} (with local changes)"`);
    expect(run.stderr).toContain('2 kits name');
  });

  it('refuses a commit that is not a full sha: short, unknown or missing', () => {
    for (const commit of ['b66459c5', 'unknown', '']) expect(check(dist(commit)).status, commit).toBe(1);
  });

  it('refuses kits that name different commits', () => {
    const other = 'c88d789c0000000000000000000000000000beef';
    const run = check(dist(SHA, { marigold: other }));
    expect(run.status).toBe(1);
    expect(run.stderr).toContain(`kits/marigold/kit.json names ${other}, kits.json ${SHA}`);
  });

  it('refuses a dist with no kits, or with no kits.json', () => {
    expect(check(dist(SHA, {}, [])).status).toBe(1);
    const empty = tmp('check-release-empty');
    const run = check(empty);
    expect(run.status).toBe(1);
    expect(run.stderr).toContain('kits.json is missing');
  });
});
