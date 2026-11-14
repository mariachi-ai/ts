import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildDesign, checkTheme, defineDesign } from '@mariachi/design/build';
import { Command } from 'commander';
import { describe, expect, it, vi } from 'vitest';
import { loadDesignConfig, registerDesignCommand, themeTemplate } from './design';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'mariachi-design-cli-'));

describe('loadDesignConfig', () => {
  it('loads the default export of mariachi.design.ts', async () => {
    const dir = tmp();
    fs.writeFileSync(path.join(dir, 'mariachi.design.ts'), "export default { base: 'minimal', include: ['button'] } as const;\n");
    const { file, config } = await loadDesignConfig(dir);
    expect(file).toBe(path.join(dir, 'mariachi.design.ts'));
    expect(defineDesign(config as never).components).toEqual(['button']);
  });

  it('fails clearly when there is no config', async () => {
    await expect(loadDesignConfig(tmp())).rejects.toThrow(/No design config found/);
  });
});

describe('themeTemplate', () => {
  it('scaffolds a theme that extends the preset and passes contrast', async () => {
    const dir = tmp();
    const design = path.dirname(require.resolve('@mariachi/design/package.json'));
    const source = themeTemplate('acme-dark', 'brutalist').replace("from '@mariachi/design'", `from '${path.join(design, 'dist', 'index.js')}'`);
    fs.writeFileSync(path.join(dir, 'acme.theme.ts'), source);
    fs.writeFileSync(path.join(dir, 'mariachi.design.ts'), "import { acmeDark } from './acme.theme';\nexport default { base: acmeDark };\n");
    const { config } = await loadDesignConfig(dir);
    const result = await buildDesign(config as never, { cwd: dir });
    expect(result.design.base.name).toBe('acme-dark');
    expect(result.design.base.extends).toBe('brutalist');
    expect(checkTheme(result.design.theme).ok).toBe(true);
  });
});

describe('mariachi design add / list', () => {
  const cli = async (...args: string[]) => {
    const program = new Command().exitOverride();
    registerDesignCommand(program);
    const out: string[] = [];
    const err: string[] = [];
    const log = vi.spyOn(console, 'log').mockImplementation((line: string) => void out.push(String(line)));
    const error = vi.spyOn(console, 'error').mockImplementation((line: string) => void err.push(String(line)));
    process.exitCode = undefined;
    try {
      await program.parseAsync(['node', 'mariachi', 'design', ...args]);
      return { out, err, exitCode: process.exitCode ?? 0 };
    } finally {
      process.exitCode = undefined;
      log.mockRestore();
      error.mockRestore();
    }
  };

  it('copies a kit into the project exactly as @mariachi/design built it, and makes design.css once', async () => {
    const dir = path.join(tmp(), 'src', 'design');
    const added = await cli('add', 'linen', '--dir', dir);
    expect(added.exitCode).toBe(0);
    expect(added.out[0]).toMatch(/^added .*linen\/ Linen \(linen\): \d+ files \(@mariachi\/design /);

    const built = path.join(path.dirname(require.resolve('@mariachi/design/package.json')), 'dist', 'kits', 'linen');
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'linen', 'kit.json'), 'utf8')) as { files: Record<string, string> };
    expect(fs.readFileSync(path.join(dir, 'linen', 'kit.json')).equals(fs.readFileSync(path.join(built, 'kit.json')))).toBe(true);
    for (const rel of Object.keys(manifest.files)) {
      expect(fs.readFileSync(path.join(dir, 'linen', rel)).equals(fs.readFileSync(path.join(built, rel))), rel).toBe(true);
    }

    fs.writeFileSync(path.join(dir, 'design.css'), '/* mine */');
    const again = await cli('add', 'linen', '--dir', dir);
    expect(again.out[0]).toMatch(/^unchanged /);
    expect(fs.readFileSync(path.join(dir, 'design.css'), 'utf8')).toBe('/* mine */');
  });

  it('exits 1 and names the files when the project edited its copy; --force replaces it', async () => {
    const dir = path.join(tmp(), 'design');
    await cli('add', 'linen', '--dir', dir);
    fs.appendFileSync(path.join(dir, 'linen', 'tokens.css'), '/* mine */');
    const refused = await cli('add', 'marigold', '--dir', dir);
    expect(refused.exitCode).toBe(1);
    expect(refused.err).toContain('  edited   linen/tokens.css');
    expect(fs.readdirSync(dir).sort()).toEqual(['design.css', 'linen']);

    const forced = await cli('add', 'marigold', '--dir', dir, '--force');
    expect(forced.exitCode).toBe(0);
    expect(fs.readdirSync(dir).sort()).toEqual(['design.css', 'marigold']);
  });

  it('lists the kits beside the presets and components', async () => {
    const all = await cli('list');
    expect(all.out).toContain('Presets');
    expect(all.out.some((line) => line.startsWith('Kits'))).toBe(true);
    expect(all.out.some((line) => /^ {2}linen\s+Linen · /.test(line))).toBe(true);

    const kits = JSON.parse((await cli('list', '--kits', '--json')).out.join('\n')) as { presets?: unknown; kits: Array<{ id: string; kind: string }> };
    expect(kits.presets).toBeUndefined();
    expect(kits.kits.find((k) => k.id === 'minimal')?.kind).toBe('preset');
    expect(kits.kits.find((k) => k.id === 'linen')?.kind).toBe('language');
  });
});
