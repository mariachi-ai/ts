import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { addKit } from '../src/add';
import { snapshot, tmp } from '../src/fixture';
import { packKits } from '../src/pack';
import { openKitStore } from '../src/store';

// The kits @mariachi/design's build wrote (turbo builds it before these tests), packed the way this package ships them
const built = path.join(fs.realpathSync(path.join(__dirname, '..', 'node_modules', '@mariachi', 'design')), 'dist', 'kits');
const root = tmp('store');
const packed = packKits(built, root);
const store = openKitStore(root);

describe("@mariachi/design's kits, packed", () => {
  it('packs every kit the build wrote, in well under the size they have unpacked', () => {
    const ids = fs.readdirSync(built).filter((id) => fs.existsSync(path.join(built, id, 'kit.json'))).sort();
    expect(ids.length).toBeGreaterThanOrEqual(55);
    expect(store.list().map((k) => k.id)).toEqual(ids);
    expect(packed.kits).toBe(ids.length);
    expect(packed.packedBytes).toBeLessThan(packed.sourceBytes * 0.6);
  });

  it('copies every kit into a project byte for byte as built', () => {
    const dir = path.join(tmp('project'), 'design');
    for (const { id } of store.list()) {
      addKit(id, { dir, store, keepOthers: true });
      expect(snapshot(path.join(dir, id)), id).toEqual(snapshot(path.join(built, id)));
    }
  });

  it('carries the licence of every font it copies', () => {
    for (const { id } of store.list()) {
      const { manifest, files } = store.read(id);
      for (const font of manifest.fonts.filter((f) => f.files.length)) {
        expect(font.license, `${id}: ${font.family}`).toBeTruthy();
        expect(files.get(font.license as string)?.toString('utf8'), `${id}: ${font.family}`).toMatch(/SIL Open Font License|Apache License/i);
      }
    }
  });

  it('stores motion and each font once', () => {
    const shared = new Set(fs.readdirSync(path.join(root, 'shared')));
    const linen = store.read('linen').manifest;
    for (const file of linen.motion?.files ?? []) expect(shared.has(linen.files[file] as string), file).toBe(true);
    for (const id of store.list().map((k) => k.id)) {
      expect(fs.existsSync(path.join(root, 'kits', id, 'motion')), id).toBe(false);
    }
  });
});
