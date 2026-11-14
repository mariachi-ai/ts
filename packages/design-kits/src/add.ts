import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DesignKitsError } from './errors';
import { KIT_ID, type KitManifest, parseManifest, sha256 } from './manifest';
import { type KitStore, openKitStore } from './store';

/** What a project has done to its copy of a kit, against the sha256s in the copy's `kit.json`. */
export interface KitChanges {
  /** Files whose contents differ */
  edited: string[];
  /** Files in `kit.json` that are gone */
  missing: string[];
  /** Files in the folder that `kit.json` doesn't list */
  extra: string[];
}

export interface InstalledKit extends KitChanges {
  id: string;
  /** The kit's folder */
  dir: string;
  manifest: KitManifest;
  /** True when the folder is exactly what its `kit.json` says */
  clean: boolean;
}

export interface AddKitOptions {
  /** The project's design folder. The kit goes in `<dir>/<id>/`, beside the project's own `<dir>/design.css`. */
  dir: string;
  /** Replace a copy the project has edited, and files it added inside the kit's folder. Default false. */
  force?: boolean;
  /** Leave other kits in `dir` where they are. By default taking a kit is a switch: the old kit's folder is removed whole. */
  keepOthers?: boolean;
  /** Work out and report what would happen; write nothing. */
  dryRun?: boolean;
  /** The packed kits to copy from. Default: this package's own. */
  store?: KitStore;
}

export interface AddKitResult {
  /**
   * `added`: the folder had no kit. `switched`: another kit was removed for this one. `updated`: this kit
   * was there in another version, or edited and replaced with `force`. `unchanged`: it was there, exactly as packed.
   */
  status: 'added' | 'switched' | 'updated' | 'unchanged';
  dryRun: boolean;
  kit: { id: string; label: string; kind: 'language' | 'preset'; version: string; commit: string };
  /** The kit's folder, absolute */
  dir: string;
  /** The files written, as paths inside the kit's folder (`kit.json` last). Empty when unchanged. */
  files: string[];
  /** The copy of this kit that was there before */
  previous?: { version: string; commit: string };
  /** Other kits removed on a switch */
  removed: Array<{ id: string; dir: string; version: string }>;
  /** What `force` discarded: the project's changes to copies that were replaced or removed */
  discarded: Array<{ id: string } & KitChanges>;
  /** The project's own stylesheet beside the kit: made once when missing, never written again */
  designCss: { path: string; created: boolean };
  /** What the project does next. Paths are absolute. */
  next: { imports: string[]; dataTheme: string; enhance: string | null; reference: string };
}

const IGNORED = new Set(['.DS_Store', 'Thumbs.db']);

function walk(dir: string, prefix = ''): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED.has(entry.name)) continue;
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walk(path.join(dir, entry.name), rel));
    else out.push(rel);
  }
  return out;
}

function inspect(dir: string, id: string): InstalledKit | null {
  const file = path.join(dir, 'kit.json');
  if (!fs.existsSync(file)) return null;
  let manifest: KitManifest;
  try {
    manifest = parseManifest(fs.readFileSync(file), file);
  } catch {
    return null;
  }
  if (manifest.id !== id) return null;
  const edited: string[] = [];
  const missing: string[] = [];
  for (const [rel, sha] of Object.entries(manifest.files)) {
    const at = path.join(dir, ...rel.split('/'));
    if (!fs.existsSync(at) || !fs.statSync(at).isFile()) missing.push(rel);
    else if (sha256(fs.readFileSync(at)) !== sha) edited.push(rel);
  }
  const extra = walk(dir).filter((rel) => rel !== 'kit.json' && !(rel in manifest.files));
  return { id, dir, manifest, edited, missing, extra, clean: !edited.length && !missing.length && !extra.length };
}

/**
 * The kits copied into a design folder: each subfolder with a `kit.json` naming it, with what the project
 * has changed in it since (edited, missing and extra files, by the sha256s in that `kit.json`).
 */
export function installedKits(dir: string): InstalledKit[] {
  const root = path.resolve(dir);
  if (!fs.existsSync(root)) return [];
  if (!fs.statSync(root).isDirectory()) throw new DesignKitsError('design-kits/invalid-dir', `${root} is a file, not a folder`, { dir: root });
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory() && KIT_ID.test(e.name))
    .map((e) => inspect(path.join(root, e.name), e.name))
    .filter((k): k is InstalledKit => k !== null)
    .sort((a, b) => a.id.localeCompare(b.id));
}

const DESIGN_CSS = `/*
 * This project's own design changes.
 *
 * \`mariachi design add\` made this file once and never writes to it again: not on a re-run, not on a change
 * of language. Import it last, after the kit's index.css and motion/motion.css, so what's here wins.
 *
 * Change tokens (--m-*), not selectors: a token set here applies to every component that reads it, and
 * still applies after a move to another language.
 */
`;

/**
 * Copies a kit into a project: `<dir>/<id>/`, every file as packed (each matches its sha256 in `kit.json`).
 *
 * - Taking a kit when another is there is a switch: the old kit's folder is removed whole (`keepOthers` keeps it).
 * - A copy the project has edited isn't replaced or removed: this throws `design-kits/edited` with the files
 *   in `metadata.kits`, and writes nothing. `force` replaces it; the result's `discarded` says what was lost.
 * - `<dir>/design.css` is the project's own. It's made when missing and never written after that.
 * - Nothing outside `dir` is read or written.
 */
export function addKit(id: string, options: AddKitOptions): AddKitResult {
  const store = options.store ?? openKitStore();
  const kit = store.read(id);
  const root = path.resolve(options.dir);
  if (fs.existsSync(root) && !fs.statSync(root).isDirectory()) throw new DesignKitsError('design-kits/invalid-dir', `${root} is a file, not a folder`, { dir: root });
  const target = path.join(root, id);
  const dryRun = options.dryRun ?? false;

  const installed = installedKits(root);
  const same = installed.find((k) => k.id === id);
  const others = options.keepOthers ? [] : installed.filter((k) => k.id !== id);

  if (!same && fs.existsSync(target) && !options.force) {
    throw new DesignKitsError(
      'design-kits/not-a-kit',
      `${target} exists and isn't a copy of the "${id}" kit (no kit.json naming it). Move it, or pass force to replace it.`,
      { dir: target },
    );
  }

  const upToDate = !!same && same.clean && fs.readFileSync(path.join(same.dir, 'kit.json')).equals(kit.manifestBytes);
  const touched = [...(same && !upToDate ? [same] : []), ...others];
  const changed = touched.filter((k) => !k.clean).map((k) => ({ id: k.id, edited: k.edited, missing: k.missing, extra: k.extra }));
  if (changed.length && !options.force) {
    const count = changed.reduce((n, k) => n + k.edited.length + k.missing.length + k.extra.length, 0);
    throw new DesignKitsError(
      'design-kits/edited',
      `The project has changed ${count} file(s) in ${changed.map((k) => `${k.id}/`).join(', ')}; nothing was written. Move the changes to design.css, or pass force to discard them.`,
      { dir: root, kits: changed },
    );
  }

  const designCss = path.join(root, 'design.css');
  const createDesignCss = !fs.existsSync(designCss);
  const files = upToDate ? [] : [...kit.files.keys(), 'kit.json'];

  if (!dryRun) {
    if (!upToDate) {
      fs.mkdirSync(root, { recursive: true });
      // Written whole beside the target, then moved into place, so a failure never leaves half a kit
      const staging = path.join(root, `.${id}.${crypto.randomBytes(4).toString('hex')}.tmp`);
      try {
        for (const [rel, bytes] of kit.files) {
          const to = path.join(staging, ...rel.split('/'));
          fs.mkdirSync(path.dirname(to), { recursive: true });
          fs.writeFileSync(to, bytes);
        }
        fs.writeFileSync(path.join(staging, 'kit.json'), kit.manifestBytes);
        fs.rmSync(target, { recursive: true, force: true });
        fs.renameSync(staging, target);
      } finally {
        fs.rmSync(staging, { recursive: true, force: true });
      }
    }
    for (const other of others) fs.rmSync(other.dir, { recursive: true, force: true });
    if (createDesignCss) {
      fs.mkdirSync(root, { recursive: true });
      // wx: never over a file that appeared since the check
      try {
        fs.writeFileSync(designCss, DESIGN_CSS, { flag: 'wx' });
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err;
      }
    }
  }

  const motion = kit.manifest.motion?.files ?? [];
  const motionCss = motion.find((f) => f.endsWith('motion.css'));
  const motionJs = motion.find((f) => f.endsWith('motion.js'));
  const at = (rel: string) => path.join(target, ...rel.split('/'));
  return {
    status: same && !upToDate ? 'updated' : others.length ? 'switched' : upToDate ? 'unchanged' : 'added',
    dryRun,
    kit: { id, label: kit.manifest.label, kind: kit.manifest.kind, version: kit.manifest.mariachi.version, commit: kit.manifest.mariachi.commit },
    dir: target,
    files,
    previous: same ? { version: same.manifest.mariachi.version, commit: same.manifest.mariachi.commit } : undefined,
    removed: others.map((k) => ({ id: k.id, dir: k.dir, version: k.manifest.mariachi.version })),
    discarded: changed,
    designCss: { path: designCss, created: createDesignCss },
    next: {
      imports: [at(kit.manifest.entry), ...(motionCss ? [at(motionCss)] : []), designCss],
      dataTheme: kit.manifest.dataTheme,
      enhance: motionJs ? at(motionJs) : null,
      reference: at('DESIGN.md'),
    },
  };
}
