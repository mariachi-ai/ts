import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DesignKitsError } from './errors';
import { fixtureStore, FONT, kitFiles, snapshot, tmp, writeSource } from './fixture';
import { isKitPath, parseManifest, sha256 } from './manifest';
import { packKits } from './pack';
import { listKits, openKitStore, readKit } from './store';

const code = (fn: () => unknown): string | undefined => {
  try {
    fn();
  } catch (err) {
    return err instanceof DesignKitsError ? err.code : `not a DesignKitsError: ${String(err)}`;
  }
  return undefined;
};

describe('packKits', () => {
  it('stores a file two kits share once, and keeps each kit\'s own files in its folder', () => {
    const { root } = fixtureStore();
    const shared = fs.readdirSync(path.join(root, 'shared')).sort();
    // the font, its licence, motion.css and motion.js
    expect(shared).toHaveLength(4);
    expect(shared).toContain(sha256(FONT));
    expect(fs.readdirSync(path.join(root, 'kits', 'linen')).sort()).toEqual(['DESIGN.md', 'base.css', 'fonts.css', 'index.css', 'kit.json', 'tokens.css']);
  });

  it('reads every kit back exactly as it was built', () => {
    const { store, source } = fixtureStore();
    for (const id of ['linen', 'marigold']) {
      const kit = readKit(id, store);
      expect(kit.manifestBytes.equals(fs.readFileSync(path.join(source, id, 'kit.json')))).toBe(true);
      expect([...kit.files.keys()]).toEqual(Object.keys(kitFiles(id, '1.0.0')));
      for (const [rel, bytes] of kit.files) expect(bytes.equals(fs.readFileSync(path.join(source, id, rel)))).toBe(true);
    }
  });

  it('writes an index with a line per kit', () => {
    const { store } = fixtureStore([{ id: 'linen' }, { id: 'minimal', kind: 'preset', files: { 'index.css': '/* minimal */\n', 'DESIGN.md': '# minimal\n' } }]);
    expect(store.index().design).toEqual({ package: '@mariachi/design', version: '1.0.0', commit: 'abc123' });
    expect(listKits(store)).toEqual([
      { id: 'linen', label: 'Linen', kind: 'language', category: 'calm-minimal', mode: 'both', fonts: ['Shared'], files: 9, bytes: expect.any(Number) },
      { id: 'minimal', label: 'Minimal', kind: 'preset', category: null, mode: 'both', fonts: [], files: 2, bytes: 24 },
    ]);
  });

  it('refuses a source file that doesn\'t match its sha256', () => {
    const source = writeSource(tmp('source'), [{ id: 'linen' }]);
    fs.appendFileSync(path.join(source, 'linen', 'tokens.css'), '/* changed after the build */');
    expect(code(() => packKits(source, tmp('store')))).toBe('design-kits/corrupt');
  });

  it('refuses kits from two builds, and an empty source', () => {
    const source = writeSource(tmp('source'), [{ id: 'linen' }, { id: 'marigold', version: '2.0.0' }]);
    expect(code(() => packKits(source, tmp('store')))).toBe('design-kits/corrupt');
    expect(code(() => packKits(tmp('source'), tmp('store')))).toBe('design-kits/store-missing');
  });

  it('refuses a manifest whose folder has another kit\'s id', () => {
    const source = writeSource(tmp('source'), [{ id: 'linen' }]);
    fs.renameSync(path.join(source, 'linen'), path.join(source, 'other'));
    expect(code(() => packKits(source, tmp('store')))).toBe('design-kits/invalid-manifest');
  });
});

describe('openKitStore', () => {
  it('names the kits when asked for one it doesn\'t have, and never reads outside the store for an id', () => {
    const { store } = fixtureStore();
    expect(code(() => store.read('nope'))).toBe('design-kits/unknown-kit');
    expect(code(() => store.read('../linen'))).toBe('design-kits/unknown-kit');
    expect(() => store.read('nope')).toThrow(/Kits: linen, marigold/);
  });

  it('refuses a shared file whose bytes changed, and one that\'s gone', () => {
    const { store, root } = fixtureStore();
    const font = path.join(root, 'shared', sha256(FONT));
    fs.writeFileSync(font, Buffer.from('not the font'));
    expect(code(() => store.read('linen'))).toBe('design-kits/corrupt');
    fs.rmSync(font);
    expect(code(() => store.read('marigold'))).toBe('design-kits/corrupt');
  });

  it('says so when there are no packed kits, or they are in a newer format', () => {
    const empty = tmp('store');
    expect(code(() => openKitStore(empty).list())).toBe('design-kits/store-missing');
    const { root } = fixtureStore();
    const index = JSON.parse(fs.readFileSync(path.join(root, 'kits.json'), 'utf8'));
    fs.writeFileSync(path.join(root, 'kits.json'), JSON.stringify({ ...index, format: 2 }));
    expect(code(() => openKitStore(root).list())).toBe('design-kits/store-missing');
  });
});

describe('manifest', () => {
  it('accepts only paths inside the kit', () => {
    for (const ok of ['index.css', 'fonts/a.woff2', 'motion/x/y.js']) expect(isKitPath(ok)).toBe(true);
    for (const bad of ['', '/etc/passwd', '../design.css', 'fonts/../../x', 'a//b', './a', 'a\\b', 'a/.', 'a\0b']) expect(isKitPath(bad)).toBe(false);
  });

  it('refuses a manifest that lists a path outside the kit, or isn\'t JSON', () => {
    const source = writeSource(tmp('source'), [{ id: 'linen' }]);
    const manifest = JSON.parse(fs.readFileSync(path.join(source, 'linen', 'kit.json'), 'utf8'));
    expect(code(() => parseManifest(JSON.stringify({ ...manifest, files: { '../design.css': 'a'.repeat(64) } }), 'kit.json'))).toBe('design-kits/invalid-manifest');
    expect(code(() => parseManifest(JSON.stringify({ ...manifest, entry: '/index.css' }), 'kit.json'))).toBe('design-kits/invalid-manifest');
    expect(code(() => parseManifest('{', 'kit.json'))).toBe('design-kits/invalid-manifest');
  });

  it('keeps fields it doesn\'t know, so a newer build\'s manifest still reads', () => {
    const source = writeSource(tmp('source'), [{ id: 'linen' }]);
    const manifest = JSON.parse(fs.readFileSync(path.join(source, 'linen', 'kit.json'), 'utf8'));
    expect(parseManifest(JSON.stringify({ ...manifest, library: { files: [] } }), 'kit.json')).toMatchObject({ id: 'linen', library: { files: [] } });
  });
});

describe('snapshot (test support)', () => {
  it('differs when a byte differs', () => {
    const a = writeSource(tmp('a'), [{ id: 'linen' }]);
    const b = writeSource(tmp('b'), [{ id: 'linen' }]);
    expect(snapshot(a)).toEqual(snapshot(b));
    fs.appendFileSync(path.join(b, 'linen', 'DESIGN.md'), ' ');
    expect(snapshot(a)).not.toEqual(snapshot(b));
  });
});
