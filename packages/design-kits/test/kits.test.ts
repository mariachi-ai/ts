import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { addKit } from '../src/add';
import { snapshot, tmp } from '../src/fixture';
import { packKits } from '../src/pack';
import { designReference, openReferenceSource, referenceList } from '../src/reference';
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
    // One folder, each kit switched in over the last: what's there is always exactly the kit as built
    const dir = path.join(tmp('project'), 'src', 'design');
    for (const { id } of store.list()) {
      addKit(id, { dir, store });
      expect(snapshot(dir), id).toEqual(snapshot(path.join(built, id)));
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

  it("ships each language's display face, with its files and licence", () => {
    // A renamed or missing font package would otherwise fall back to the system's without a sound
    const display: Record<string, string> = {
      brutalist: 'Archivo Black',
      fennel: 'Sofia Sans Condensed',
      hearth: 'Archivo',
      tinker: 'Jura',
      trellis: 'Red Hat Display',
      halcyon: 'Inter Display',
      obsidian: 'Inter Display',
      doodle: 'Inter Tight',
    };
    for (const [id, family] of Object.entries(display)) {
      const { manifest, files } = store.read(id);
      const font = manifest.fonts.find((f) => f.family === family);
      expect(font?.files.length, `${id}: ${family}`).toBeGreaterThan(0);
      for (const file of font?.files ?? []) expect(files.has(file), `${id}: ${file}`).toBe(true);
      expect(files.get(font?.license as string)?.toString('utf8'), `${id}: ${family}`).toMatch(/SIL Open Font License/i);
      expect(files.get('fonts.css')?.toString('utf8'), `${id}: ${family}`).toContain(`font-family: '${family}'`);
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

describe('design reference, from the real build', () => {
  // The catalog and the reference laid out beside the packed kits, as scripts/pack.mjs does
  const design = path.dirname(built);
  fs.copyFileSync(path.join(design, 'catalog.json'), path.join(root, 'catalog.json'));
  fs.mkdirSync(path.join(root, 'reference', 'components'), { recursive: true });
  fs.mkdirSync(path.join(root, 'reference', 'patterns'), { recursive: true });
  for (const f of fs.readdirSync(path.join(design, 'css', 'components'))) fs.copyFileSync(path.join(design, 'css', 'components', f), path.join(root, 'reference', 'components', f));
  for (const id of fs.readdirSync(path.join(design, 'archetypes'))) {
    const showcase = path.join(design, 'archetypes', id, 'showcase.json');
    if (fs.existsSync(showcase)) fs.copyFileSync(showcase, path.join(root, 'reference', 'patterns', `${id}.json`));
  }
  const source = openReferenceSource(root, store);

  it('answers every component in every kit, with its CSS', () => {
    const components = source.components();
    expect(components.length).toBeGreaterThanOrEqual(30);
    for (const { id } of store.list()) {
      for (const c of components) {
        const answer = designReference(c.name, id, source);
        expect(answer.found, `${c.name} in ${id}`).toBe('component');
        expect(answer.markdown, `${c.name} in ${id}`).not.toContain('(No CSS file for it in this build.)');
      }
    }
  });

  it("finds each language's own notes on its buttons, and lists its named patterns", () => {
    for (const lang of source.languages()) {
      expect(designReference('button', lang.id, source).markdown, lang.id).not.toContain("DESIGN.md has no entry for Button");
      expect(referenceList(lang.id, source), lang.id).toContain('## Patterns in this language');
    }
  });
});
