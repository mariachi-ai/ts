import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// The design packages install nothing of the backend framework: a project (or a tool) can use the design library
// without @mariachi/core. Only @mariachi/motion, which depends on nothing, may come with it.
describe('standalone', () => {
  it('depends on no Mariachi package but @mariachi/motion', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')) as Record<string, Record<string, string> | undefined>;
    const names = ['dependencies', 'peerDependencies', 'optionalDependencies'].flatMap((k) => Object.keys(pkg[k] ?? {}));
    expect(names.filter((n) => n.startsWith('@mariachi/') && n !== '@mariachi/motion')).toEqual([]);
  });

  it('imports nothing from @mariachi/core', () => {
    const src = path.join(__dirname, '..', 'src');
    const files = fs.readdirSync(src, { recursive: true, withFileTypes: true }).filter((d) => d.isFile() && /\.ts$/.test(d.name) && !d.name.endsWith('.test.ts'));
    for (const f of files) expect(fs.readFileSync(path.join(f.parentPath, f.name), 'utf8'), f.name).not.toMatch(/from '@mariachi\/core/);
  });
});
