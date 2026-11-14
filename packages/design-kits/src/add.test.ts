import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { addKit, installedKits } from './add';
import { DesignKitsError } from './errors';
import { fixtureStore, snapshot, tmp } from './fixture';

const caught = (fn: () => unknown): DesignKitsError => {
  try {
    fn();
  } catch (err) {
    if (err instanceof DesignKitsError) return err;
    throw err;
  }
  throw new Error('expected a DesignKitsError');
};

function project() {
  const fx = fixtureStore();
  const dir = path.join(tmp('project'), 'src', 'design');
  return { ...fx, dir, add: (id: string, opts: Partial<Parameters<typeof addKit>[1]> = {}) => addKit(id, { dir, store: fx.store, ...opts }) };
}

describe('addKit', () => {
  it('copies the kit byte for byte, kit.json included, and makes design.css', () => {
    const { dir, source, add } = project();
    const result = add('linen');
    expect(result.status).toBe('added');
    expect(snapshot(path.join(dir, 'linen'))).toEqual(snapshot(path.join(source, 'linen')));
    expect(result.files.at(-1)).toBe('kit.json');
    expect(result.files).toHaveLength(10);
    expect(result.kit).toEqual({ id: 'linen', label: 'Linen', kind: 'language', version: '1.0.0', commit: 'abc123' });
    expect(result.designCss).toEqual({ path: path.join(dir, 'design.css'), created: true });
    expect(fs.readFileSync(path.join(dir, 'design.css'), 'utf8')).toMatch(/never writes to it again/);
    expect(fs.readdirSync(dir).sort()).toEqual(['design.css', 'linen']);
  });

  it('says what the project does next: the imports in order, data-theme, enhance()', () => {
    const { dir, add } = project();
    expect(add('linen').next).toEqual({
      imports: [path.join(dir, 'linen', 'index.css'), path.join(dir, 'linen', 'motion', 'motion.css'), path.join(dir, 'design.css')],
      dataTheme: 'linen',
      enhance: path.join(dir, 'linen', 'motion', 'motion.js'),
      reference: path.join(dir, 'linen', 'DESIGN.md'),
    });
  });

  it('writes nothing on a re-run when the copy is exactly as packed', () => {
    const { dir, add } = project();
    add('linen');
    const before = fs.statSync(path.join(dir, 'linen', 'tokens.css')).mtimeMs;
    const inode = fs.statSync(path.join(dir, 'linen')).ino;
    const again = add('linen');
    expect(again).toMatchObject({ status: 'unchanged', files: [], removed: [], discarded: [], designCss: { created: false } });
    expect(fs.statSync(path.join(dir, 'linen', 'tokens.css')).mtimeMs).toBe(before);
    expect(fs.statSync(path.join(dir, 'linen')).ino).toBe(inode);
  });

  it('never writes design.css again: not on a re-run, a switch or with force', () => {
    const { dir, add } = project();
    add('linen');
    fs.writeFileSync(path.join(dir, 'design.css'), ':root { --m-color-accent-default: rebeccapurple; }\n');
    add('linen', { force: true });
    add('marigold', { force: true });
    expect(fs.readFileSync(path.join(dir, 'design.css'), 'utf8')).toBe(':root { --m-color-accent-default: rebeccapurple; }\n');
  });

  it('reports an edited copy and writes nothing', () => {
    const { dir, add } = project();
    add('linen');
    fs.appendFileSync(path.join(dir, 'linen', 'tokens.css'), '/* mine */');
    fs.rmSync(path.join(dir, 'linen', 'motion', 'motion.js'));
    fs.writeFileSync(path.join(dir, 'linen', 'extra.css'), 'a {}');
    const before = snapshot(dir);
    const err = caught(() => add('linen'));
    expect(err.code).toBe('design-kits/edited');
    expect(err.metadata?.kits).toEqual([{ id: 'linen', edited: ['tokens.css'], missing: ['motion/motion.js'], extra: ['extra.css'] }]);
    expect(err.message).toMatch(/3 file\(s\) in linen\//);
    expect(snapshot(dir)).toEqual(before);
  });

  it('replaces an edited copy with force, and says what was discarded', () => {
    const { dir, source, add } = project();
    add('linen');
    fs.appendFileSync(path.join(dir, 'linen', 'tokens.css'), '/* mine */');
    fs.writeFileSync(path.join(dir, 'linen', 'extra.css'), 'a {}');
    const result = add('linen', { force: true });
    expect(result.status).toBe('updated');
    expect(result.discarded).toEqual([{ id: 'linen', edited: ['tokens.css'], missing: [], extra: ['extra.css'] }]);
    expect(snapshot(path.join(dir, 'linen'))).toEqual(snapshot(path.join(source, 'linen')));
  });

  it('removes the old kit\'s folder whole on a switch', () => {
    const { dir, source, add } = project();
    add('linen');
    const result = add('marigold');
    expect(result.status).toBe('switched');
    expect(result.removed).toEqual([{ id: 'linen', dir: path.join(dir, 'linen'), version: '1.0.0' }]);
    expect(fs.readdirSync(dir).sort()).toEqual(['design.css', 'marigold']);
    expect(snapshot(path.join(dir, 'marigold'))).toEqual(snapshot(path.join(source, 'marigold')));
  });

  it('refuses a switch when the old kit was edited, and leaves both as they were', () => {
    const { dir, add } = project();
    add('linen');
    fs.appendFileSync(path.join(dir, 'linen', 'base.css'), '/* mine */');
    const before = snapshot(dir);
    const err = caught(() => add('marigold'));
    expect(err.code).toBe('design-kits/edited');
    expect(err.metadata?.kits).toEqual([{ id: 'linen', edited: ['base.css'], missing: [], extra: [] }]);
    expect(snapshot(dir)).toEqual(before);
    expect(fs.existsSync(path.join(dir, 'marigold'))).toBe(false);
  });

  it('keeps other kits with keepOthers, edited or not', () => {
    const { dir, add } = project();
    add('linen');
    fs.appendFileSync(path.join(dir, 'linen', 'base.css'), '/* mine */');
    const result = add('marigold', { keepOthers: true });
    expect(result).toMatchObject({ status: 'added', removed: [], discarded: [] });
    expect(fs.readdirSync(dir).sort()).toEqual(['design.css', 'linen', 'marigold']);
    expect(fs.readFileSync(path.join(dir, 'linen', 'base.css'), 'utf8')).toMatch(/mine/);
  });

  it('updates a clean copy when the packed kit is another version', () => {
    const { dir, add } = project();
    add('linen');
    const next = fixtureStore([{ id: 'linen', version: '2.0.0' }]);
    const result = addKit('linen', { dir, store: next.store });
    expect(result).toMatchObject({ status: 'updated', previous: { version: '1.0.0', commit: 'abc123' }, kit: { version: '2.0.0' }, discarded: [] });
    expect(snapshot(path.join(dir, 'linen'))).toEqual(snapshot(path.join(next.source, 'linen')));
  });

  it('writes nothing in a dry run, and reports the same result', () => {
    const { dir, add } = project();
    const dry = add('linen', { dryRun: true });
    expect(dry).toMatchObject({ status: 'added', dryRun: true, designCss: { created: true } });
    expect(dry.files).toHaveLength(10);
    expect(fs.existsSync(dir)).toBe(false);

    add('linen');
    const before = snapshot(dir);
    expect(add('marigold', { dryRun: true })).toMatchObject({ status: 'switched', removed: [{ id: 'linen' }] });
    expect(snapshot(dir)).toEqual(before);
  });

  it('refuses a folder with the kit\'s name that isn\'t a kit, unless forced', () => {
    const { dir, add } = project();
    fs.mkdirSync(path.join(dir, 'linen'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'linen', 'notes.md'), 'mine');
    expect(caught(() => add('linen')).code).toBe('design-kits/not-a-kit');
    expect(fs.readFileSync(path.join(dir, 'linen', 'notes.md'), 'utf8')).toBe('mine');
    expect(add('linen', { force: true }).status).toBe('added');
    expect(fs.existsSync(path.join(dir, 'linen', 'notes.md'))).toBe(false);
  });

  it('leaves everything else in the design folder alone', () => {
    const { dir, add } = project();
    fs.mkdirSync(path.join(dir, 'components'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'components', 'button.css'), '.button {}');
    fs.mkdirSync(path.join(dir, 'vendor'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'vendor', 'kit.json'), '{"not":"ours"}');
    add('linen');
    add('marigold');
    expect(fs.readdirSync(dir).sort()).toEqual(['components', 'design.css', 'marigold', 'vendor']);
    expect(fs.readFileSync(path.join(dir, 'components', 'button.css'), 'utf8')).toBe('.button {}');
  });

  it('leaves no staging folder behind, and refuses a file where the design folder should be', () => {
    const { dir, add } = project();
    add('linen');
    expect(fs.readdirSync(dir).filter((f) => f.startsWith('.'))).toEqual([]);
    const file = path.join(tmp('project'), 'design');
    fs.writeFileSync(file, 'x');
    expect(caught(() => addKit('linen', { dir: file, store: project().store })).code).toBe('design-kits/invalid-dir');
  });

  it('refuses a kit it doesn\'t have before touching the project', () => {
    const { dir, add } = project();
    expect(caught(() => add('nope')).code).toBe('design-kits/unknown-kit');
    expect(fs.existsSync(dir)).toBe(false);
  });
});

describe('installedKits', () => {
  it('lists the kits in a folder with what the project changed', () => {
    const { dir, add } = project();
    expect(installedKits(dir)).toEqual([]);
    add('linen');
    add('marigold', { keepOthers: true });
    fs.appendFileSync(path.join(dir, 'marigold', 'DESIGN.md'), 'note');
    fs.writeFileSync(path.join(dir, 'linen', '.DS_Store'), 'ignored');
    const found = installedKits(dir);
    expect(found.map((k) => [k.id, k.clean, k.edited])).toEqual([
      ['linen', true, []],
      ['marigold', false, ['DESIGN.md']],
    ]);
    expect(found[0]?.manifest.mariachi.version).toBe('1.0.0');
  });
});
