import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { run } from './cli';
import { fixtureStore, tmp } from './fixture';

function cli() {
  const { store } = fixtureStore();
  const cwd = tmp('project');
  const out: string[] = [];
  const err: string[] = [];
  const io = { cwd, store, out: (line: string) => out.push(line), err: (line: string) => err.push(line) };
  return { cwd, out, err, run: (...argv: string[]) => run(argv, io) };
}

describe('the command line', () => {
  it('adds a kit to src/design by default and prints the next steps with paths from the project', () => {
    const c = cli();
    expect(c.run('add', 'linen')).toBe(0);
    expect(fs.existsSync(path.join(c.cwd, 'src', 'design', 'linen', 'kit.json'))).toBe(true);
    expect(c.out[0]).toBe('added src/design/linen/ Linen (linen): 10 files (@mariachi/design 1.0.0, commit abc123)');
    expect(c.out).toContain("created src/design/design.css (the project's own changes; never written again)");
    expect(c.out).toContain('  1. Import, in this order: src/design/linen/index.css, src/design/linen/motion/motion.css, src/design/design.css');
    expect(c.out.join('\n')).toMatch(/data-theme="linen"/);
    expect(c.err).toEqual([]);
  });

  it('takes --dir, and says unchanged on a re-run', () => {
    const c = cli();
    expect(c.run('add', 'linen', '--dir', 'web/styles')).toBe(0);
    expect(fs.existsSync(path.join(c.cwd, 'web', 'styles', 'linen', 'index.css'))).toBe(true);
    c.out.length = 0;
    expect(c.run('add', 'linen', '-d', 'web/styles')).toBe(0);
    expect(c.out).toEqual([
      'unchanged web/styles/linen/ is Linen (linen) exactly as packed (@mariachi/design 1.0.0, commit abc123)',
      "kept web/styles/design.css (the project's own; not touched)",
    ]);
  });

  it('exits 1 and lists the edited files, then replaces them with --force', () => {
    const c = cli();
    c.run('add', 'linen');
    fs.appendFileSync(path.join(c.cwd, 'src', 'design', 'linen', 'tokens.css'), '/* mine */');
    expect(c.run('add', 'marigold')).toBe(1);
    expect(c.err[0]).toMatch(/^error The project has changed 1 file\(s\) in linen\/; nothing was written/);
    expect(c.err).toContain('  edited   linen/tokens.css');
    expect(fs.existsSync(path.join(c.cwd, 'src', 'design', 'marigold'))).toBe(false);

    c.out.length = 0;
    expect(c.run('add', 'marigold', '--force')).toBe(0);
    expect(c.out).toContain('removed src/design/linen/ (the kit before this one)');
    expect(c.out).toContain('discarded linen/tokens.css (edited)');
  });

  it('writes nothing with --dry-run, and keeps the old kit with --keep-others', () => {
    const c = cli();
    expect(c.run('add', 'linen', '--dry-run')).toBe(0);
    expect(c.out[0]).toMatch(/^would be added src\/design\/linen\//);
    expect(fs.existsSync(path.join(c.cwd, 'src'))).toBe(false);
    c.run('add', 'linen');
    expect(c.run('add', 'marigold', '--keep-others')).toBe(0);
    expect(fs.readdirSync(path.join(c.cwd, 'src', 'design')).sort()).toEqual(['design.css', 'linen', 'marigold']);
  });

  it('prints JSON for a result and for an error', () => {
    const c = cli();
    expect(c.run('add', 'linen', '--json')).toBe(0);
    expect(JSON.parse(c.out.join('\n'))).toMatchObject({ status: 'added', kit: { id: 'linen' } });
    c.out.length = 0;
    expect(c.run('add', 'nope', '--json')).toBe(1);
    expect(JSON.parse(c.out.join('\n'))).toMatchObject({ error: { code: 'design-kits/unknown-kit', kits: ['linen', 'marigold'] } });
  });

  it('lists the kits, as text and as JSON', () => {
    const c = cli();
    expect(c.run('list')).toBe(0);
    expect(c.out[0]).toBe('Languages: calm-minimal');
    expect(c.out[1]).toMatch(/^ {2}linen\s+Linen · Shared · \d+ KB$/);
    c.out.length = 0;
    expect(c.run('list', '--json')).toBe(0);
    expect(JSON.parse(c.out.join('\n')).map((k: { id: string }) => k.id)).toEqual(['linen', 'marigold']);
  });

  it('exits 2 with the usage for a command it doesn\'t know, a missing id or an unknown flag', () => {
    for (const argv of [[], ['add'], ['remove', 'linen'], ['add', 'linen', 'marigold'], ['add', 'linen', '--nope']]) {
      const c = cli();
      expect(c.run(...argv)).toBe(2);
      expect([...c.out, ...c.err].join('\n')).toMatch(/Usage:/);
    }
    const c = cli();
    expect(c.run('--help')).toBe(0);
    expect(c.out[0]).toBe('Usage:');
  });
});
