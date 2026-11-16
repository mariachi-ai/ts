import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { addKit, installedKit } from './add';
import { DesignKitsError } from './errors';
import { fixtureStore, kitFiles, snapshot, tmp } from './fixture';

const caught = (fn: () => unknown): DesignKitsError => {
  try {
    fn();
  } catch (err) {
    if (err instanceof DesignKitsError) return err;
    throw err;
  }
  throw new Error('expected a DesignKitsError');
};

function project(kits?: Parameters<typeof fixtureStore>[0]) {
  const fx = fixtureStore(kits);
  const src = path.join(tmp('project'), 'src');
  const dir = path.join(src, 'design');
  return { ...fx, src, dir, add: (id: string, opts: Partial<Parameters<typeof addKit>[1]> = {}) => addKit(id, { dir, store: fx.store, ...opts }) };
}

describe('addKit', () => {
  it('copies the kit straight into the folder, byte for byte, and makes design.css beside it', () => {
    const { src, dir, source, add } = project();
    const result = add('linen');
    expect(result.status).toBe('added');
    expect(snapshot(dir)).toEqual(snapshot(path.join(source, 'linen')));
    expect(result.files.at(-1)).toBe('kit.json');
    expect(result.files).toHaveLength(10);
    expect(result.kit).toEqual({ id: 'linen', label: 'Linen', kind: 'language', version: '1.0.0', commit: 'abc123' });
    expect(result.designCss).toEqual({ path: path.join(src, 'design.css'), created: true });
    expect(fs.readFileSync(path.join(src, 'design.css'), 'utf8')).toMatch(/never writes to it again/);
    expect(fs.readdirSync(src).sort()).toEqual(['design', 'design.css']);
  });

  it('says what the project does next: the imports in order, data-theme, enhance()', () => {
    const { src, dir, add } = project();
    expect(add('linen').next).toEqual({
      imports: [path.join(dir, 'index.css'), path.join(dir, 'motion', 'motion.css'), path.join(src, 'design.css')],
      dataTheme: 'linen',
      enhance: path.join(dir, 'motion', 'motion.js'),
      reference: path.join(dir, 'DESIGN.md'),
    });
  });

  it('writes nothing on a re-run when the copy is as packed', () => {
    const { dir, add } = project();
    add('linen');
    const before = fs.statSync(path.join(dir, 'tokens.css')).mtimeMs;
    const again = add('linen');
    expect(again).toMatchObject({ status: 'unchanged', files: [], removed: [], left: [], designCss: { created: false } });
    expect(again.discarded).toEqual({ edited: [], missing: [], extra: [] });
    expect(fs.statSync(path.join(dir, 'tokens.css')).mtimeMs).toBe(before);
  });

  it('never writes design.css again: not on a re-run, a switch or with force', () => {
    const { src, add } = project();
    add('linen');
    fs.writeFileSync(path.join(src, 'design.css'), ':root { --m-color-accent-default: rebeccapurple; }\n');
    add('linen', { force: true });
    add('marigold', { force: true });
    expect(fs.readFileSync(path.join(src, 'design.css'), 'utf8')).toBe(':root { --m-color-accent-default: rebeccapurple; }\n');
  });

  it('reports an edited copy and writes nothing', () => {
    const { src, dir, add } = project();
    add('linen');
    fs.appendFileSync(path.join(dir, 'tokens.css'), '/* mine */');
    fs.rmSync(path.join(dir, 'motion', 'motion.js'));
    const before = snapshot(src);
    for (const id of ['linen', 'marigold']) {
      const err = caught(() => add(id));
      expect(err.code).toBe('design-kits/edited');
      expect(err.metadata).toMatchObject({ dir, kit: 'linen', edited: ['tokens.css'], missing: ['motion/motion.js'], extra: [] });
      expect(err.message).toMatch(/changed 2 file\(s\) of the kit/);
      expect(snapshot(src)).toEqual(before);
    }
  });

  it('replaces an edited copy with force, and says what was discarded', () => {
    const { dir, source, add } = project();
    add('linen');
    fs.appendFileSync(path.join(dir, 'tokens.css'), '/* mine */');
    fs.rmSync(path.join(dir, 'DESIGN.md'));
    const result = add('linen', { force: true });
    expect(result.status).toBe('updated');
    expect(result.discarded).toEqual({ edited: ['tokens.css'], missing: ['DESIGN.md'], extra: [] });
    expect(snapshot(dir)).toEqual(snapshot(path.join(source, 'linen')));
  });

  it('switches in place: the old kit\'s files go, the new one\'s arrive, the folder and the imports stay', () => {
    const { src, dir, source, add } = project([
      { id: 'linen', files: { ...kitFiles('linen', '1.0.0'), 'fonts/only-linen.woff2': 'L', 'library/card.css': '.card {}' } },
      { id: 'marigold' },
    ]);
    add('linen');
    const result = add('marigold');
    expect(result.status).toBe('switched');
    expect(result.previous).toEqual({ id: 'linen', version: '1.0.0', commit: 'abc123' });
    expect(result.removed.sort()).toEqual(['fonts/only-linen.woff2', 'library/card.css']);
    expect(snapshot(dir)).toEqual(snapshot(path.join(source, 'marigold')));
    // library/ had only the old kit's file, so the empty folder goes too
    expect(fs.existsSync(path.join(dir, 'library'))).toBe(false);
    expect(fs.readdirSync(src).sort()).toEqual(['design', 'design.css']);
    expect(result.next.imports[0]).toBe(path.join(dir, 'index.css'));
  });

  it('leaves a file of the project\'s own in the folder, on a switch and with force, and says so', () => {
    const { dir, add } = project();
    add('linen');
    fs.writeFileSync(path.join(dir, 'notes.md'), 'mine');
    fs.mkdirSync(path.join(dir, 'fonts', 'extra'));
    fs.writeFileSync(path.join(dir, 'fonts', 'extra', 'mine.woff2'), 'mine');
    expect(add('linen')).toMatchObject({ status: 'unchanged', left: ['fonts/extra/mine.woff2', 'notes.md'] });
    const switched = add('marigold');
    expect(switched).toMatchObject({ status: 'switched', left: ['fonts/extra/mine.woff2', 'notes.md'] });
    expect(switched.discarded).toEqual({ edited: [], missing: [], extra: [] });
    fs.appendFileSync(path.join(dir, 'base.css'), '/* mine */');
    add('linen', { force: true });
    expect(fs.readFileSync(path.join(dir, 'notes.md'), 'utf8')).toBe('mine');
    expect(fs.readFileSync(path.join(dir, 'fonts', 'extra', 'mine.woff2'), 'utf8')).toBe('mine');
  });

  it('counts a file of the project\'s own as a change only when the new kit has a file of that name', () => {
    const { dir, add } = project([{ id: 'linen' }, { id: 'marigold', files: { ...kitFiles('marigold', '1.0.0'), 'library/card.css': '.card {}' } }]);
    add('linen');
    fs.mkdirSync(path.join(dir, 'library'));
    fs.writeFileSync(path.join(dir, 'library', 'card.css'), '/* the project wrote this */');
    const err = caught(() => add('marigold'));
    expect(err.code).toBe('design-kits/edited');
    expect(err.metadata).toMatchObject({ kit: 'linen', edited: [], missing: [], extra: ['library/card.css'] });
    expect(fs.readFileSync(path.join(dir, 'library', 'card.css'), 'utf8')).toBe('/* the project wrote this */');

    const forced = add('marigold', { force: true });
    expect(forced.discarded.extra).toEqual(['library/card.css']);
    expect(fs.readFileSync(path.join(dir, 'library', 'card.css'), 'utf8')).toBe('.card {}');
  });

  it('updates a clean copy when the packed kit is another version', () => {
    const { dir, add } = project();
    add('linen');
    const next = fixtureStore([{ id: 'linen', version: '2.0.0' }]);
    const result = addKit('linen', { dir, store: next.store });
    expect(result).toMatchObject({ status: 'updated', previous: { id: 'linen', version: '1.0.0', commit: 'abc123' }, kit: { version: '2.0.0' } });
    expect(snapshot(dir)).toEqual(snapshot(path.join(next.source, 'linen')));
  });

  it('writes nothing in a dry run, and reports the same result', () => {
    const { src, dir, add } = project();
    const dry = add('linen', { dryRun: true });
    expect(dry).toMatchObject({ status: 'added', dryRun: true, designCss: { created: true } });
    expect(dry.files).toHaveLength(10);
    expect(fs.existsSync(src)).toBe(false);

    add('linen');
    const before = snapshot(src);
    expect(add('marigold', { dryRun: true })).toMatchObject({ status: 'switched', previous: { id: 'linen' } });
    expect(snapshot(src)).toEqual(before);
    expect(installedKit(dir)?.id).toBe('linen');
  });

  it('refuses a folder that has files and no kit, with or without force, and takes an empty one', () => {
    const { src, add } = project();
    fs.mkdirSync(path.join(src, 'components'), { recursive: true });
    fs.writeFileSync(path.join(src, 'main.ts'), 'app');
    const store = fixtureStore().store;
    for (const force of [false, true]) {
      const err = caught(() => addKit('linen', { dir: src, store, force }));
      expect(err.code).toBe('design-kits/not-a-kit');
      expect(err.metadata?.files).toEqual(['main.ts']);
    }
    expect(fs.readdirSync(src).sort()).toEqual(['components', 'main.ts']);

    fs.mkdirSync(path.join(src, 'design'));
    expect(add('linen').status).toBe('added');
  });

  it('never removes anything but the files a kit.json lists, even when one names a path outside', () => {
    const { src, dir, add } = project();
    add('linen');
    fs.writeFileSync(path.join(src, 'main.ts'), 'app');
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'kit.json'), 'utf8'));
    manifest.files['../main.ts'] = 'a'.repeat(64);
    fs.writeFileSync(path.join(dir, 'kit.json'), JSON.stringify(manifest));
    // An unreadable manifest: the folder is files without a kit, so nothing is touched
    expect(caught(() => add('marigold', { force: true })).code).toBe('design-kits/not-a-kit');
    expect(fs.readFileSync(path.join(src, 'main.ts'), 'utf8')).toBe('app');
  });

  it('refuses to write or remove through a symbolic link inside the folder', () => {
    const { src, dir, add } = project();
    add('linen');
    const elsewhere = path.join(src, 'elsewhere');
    fs.mkdirSync(elsewhere);
    fs.writeFileSync(path.join(elsewhere, 'motion.css'), 'not the kit');
    fs.rmSync(path.join(dir, 'motion'), { recursive: true });
    fs.symlinkSync(elsewhere, path.join(dir, 'motion'));
    expect(caught(() => add('marigold', { force: true })).code).toBe('design-kits/invalid-dir');
    expect(fs.readFileSync(path.join(elsewhere, 'motion.css'), 'utf8')).toBe('not the kit');
  });

  it('refuses a file where the folder should be, and a kit it doesn\'t have, before touching the project', () => {
    const { src, add } = project();
    expect(caught(() => add('nope')).code).toBe('design-kits/unknown-kit');
    expect(fs.existsSync(src)).toBe(false);
    const file = path.join(tmp('project'), 'design');
    fs.writeFileSync(file, 'x');
    expect(caught(() => addKit('linen', { dir: file, store: fixtureStore().store })).code).toBe('design-kits/invalid-dir');
  });
});

describe('installedKit', () => {
  it('reads the kit in a folder with what the project changed, and null when there is none', () => {
    const { dir, add } = project();
    expect(installedKit(dir)).toBeNull();
    add('linen');
    expect(installedKit(dir)).toMatchObject({ id: 'linen', dir, clean: true, edited: [], missing: [], extra: [] });
    fs.appendFileSync(path.join(dir, 'DESIGN.md'), 'note');
    fs.writeFileSync(path.join(dir, 'mine.css'), 'a {}');
    fs.writeFileSync(path.join(dir, '.DS_Store'), 'ignored');
    const found = installedKit(dir);
    expect(found).toMatchObject({ clean: false, edited: ['DESIGN.md'], missing: [], extra: ['mine.css'] });
    expect(found?.manifest.mariachi.version).toBe('1.0.0');
  });
});
