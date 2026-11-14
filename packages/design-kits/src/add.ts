import fs from 'node:fs';
import path from 'node:path';
import { DesignKitsError } from './errors';
import { type KitManifest, parseManifest, sha256 } from './manifest';
import { type KitStore, openKitStore } from './store';

/** What a project has done to its copy of a kit, against the sha256s in the copy's `kit.json`. */
export interface KitChanges {
  /** Kit files whose contents differ */
  edited: string[];
  /** Kit files that are gone */
  missing: string[];
  /** Files in the folder that `kit.json` doesn't list: the project's own */
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
  /**
   * The kit's folder, e.g. `src/design`. The kit's files go straight into it (`<dir>/index.css`,
   * `<dir>/kit.json` …), and the project's own stylesheet is the file beside it, `<dir>/../design.css`.
   * A project has one kit; `<html data-theme>` names the language, the folder doesn't.
   */
  dir: string;
  /** Replace a copy the project has edited. Default false. */
  force?: boolean;
  /** Work out and report what would happen; write nothing. */
  dryRun?: boolean;
  /** The packed kits to copy from. Default: this package's own. */
  store?: KitStore;
}

export interface AddKitResult {
  /**
   * `added`: the folder had no kit. `switched`: another kit was replaced by this one. `updated`: this kit
   * was there in another version, or edited and replaced with `force`. `unchanged`: it was there, as packed.
   */
  status: 'added' | 'switched' | 'updated' | 'unchanged';
  dryRun: boolean;
  kit: { id: string; label: string; kind: 'language' | 'preset'; version: string; commit: string };
  /** The kit's folder, absolute */
  dir: string;
  /** The files written, as paths inside the kit's folder (`kit.json` last). Empty when unchanged. */
  files: string[];
  /** The kit that was in the folder before */
  previous?: { id: string; version: string; commit: string };
  /** Files of the kit before that the new one doesn't have, removed from the folder */
  removed: string[];
  /** What `force` discarded: the project's changes to kit files, and its own files that the new kit writes over */
  discarded: KitChanges;
  /** The project's own files in the kit's folder, left where they are */
  left: string[];
  /** The project's own stylesheet beside the kit's folder: made once when missing, never written again */
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
  return out.sort();
}

/**
 * Where a kit path is on disk. Refuses a path that goes through a symbolic link inside the kit's folder,
 * so a write or a removal can't land outside it.
 */
function inside(root: string, rel: string): string {
  let at = root;
  const parts = rel.split('/');
  for (const [i, part] of parts.entries()) {
    at = path.join(at, part);
    const stat = fs.lstatSync(at, { throwIfNoEntry: false });
    if (stat?.isSymbolicLink() && i < parts.length - 1) {
      throw new DesignKitsError('design-kits/invalid-dir', `${at} is a symbolic link; a kit's folders have to be real folders`, { dir: root, file: rel });
    }
  }
  return at;
}

/**
 * The kit copied into a folder (the folder's `kit.json`), with what the project has changed since:
 * edited and missing kit files by the sha256s in that `kit.json`, and files of its own. Null when the
 * folder has no kit.
 */
export function installedKit(dir: string): InstalledKit | null {
  const root = path.resolve(dir);
  const file = path.join(root, 'kit.json');
  if (!fs.existsSync(file)) return null;
  let manifest: KitManifest;
  try {
    manifest = parseManifest(fs.readFileSync(file), file);
  } catch {
    return null;
  }
  const edited: string[] = [];
  const missing: string[] = [];
  for (const [rel, sha] of Object.entries(manifest.files)) {
    const at = inside(root, rel);
    const stat = fs.lstatSync(at, { throwIfNoEntry: false });
    if (!stat?.isFile()) missing.push(rel);
    else if (sha256(fs.readFileSync(at)) !== sha) edited.push(rel);
  }
  const extra = walk(root).filter((rel) => rel !== 'kit.json' && !(rel in manifest.files));
  return { id: manifest.id, dir: root, manifest, edited, missing, extra, clean: !edited.length && !missing.length && !extra.length };
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

/** Removes the folders left empty above a removed file, up to (not including) the kit's folder. */
function pruneEmpty(root: string, rel: string): void {
  let dir = path.dirname(path.join(root, ...rel.split('/')));
  while (dir.startsWith(root + path.sep)) {
    if (fs.readdirSync(dir).length) return;
    fs.rmdirSync(dir);
    dir = path.dirname(dir);
  }
}

/**
 * Copies a kit into a project: its files go straight into `dir`, every one as packed (each matches its
 * sha256 in `kit.json`), and `<dir>/../design.css` is made for the project's own changes if it isn't there.
 *
 * - One kit per folder. Taking a kit when another is there is a switch: the old kit's files are removed
 *   and the new one's written, in the same folder, so the project's imports don't change.
 * - A copy the project has changed isn't replaced: this throws `design-kits/edited` with the files in the
 *   error's metadata, and writes nothing. `force` replaces it; the result's `discarded` says what was lost.
 * - Only kit files are ever removed. A file of the project's own in the folder stays, unless the new kit
 *   has a file of that name (then it counts as a change, above).
 * - A folder that has files and no kit is refused, with or without `force`.
 * - `design.css` is the project's own: made when missing, never written after that.
 */
export function addKit(id: string, options: AddKitOptions): AddKitResult {
  const store = options.store ?? openKitStore();
  const kit = store.read(id);
  const root = path.resolve(options.dir);
  const parent = path.dirname(root);
  const dryRun = options.dryRun ?? false;
  const exists = fs.lstatSync(root, { throwIfNoEntry: false });
  if (exists && !exists.isDirectory()) throw new DesignKitsError('design-kits/invalid-dir', `${root} isn't a folder`, { dir: root });

  const current = exists ? installedKit(root) : null;
  if (exists && !current) {
    const found = walk(root);
    if (found.length) {
      throw new DesignKitsError(
        'design-kits/not-a-kit',
        `${root} has files and no kit (no kit.json a kit wrote). A kit takes a folder of its own: empty this one, or pass another dir.`,
        { dir: root, files: found.slice(0, 20) },
      );
    }
  }

  const upToDate = !!current && !current.edited.length && !current.missing.length && fs.readFileSync(path.join(root, 'kit.json')).equals(kit.manifestBytes);
  // The project's own files: in the way only where the new kit has a file of that name
  const collisions = current && !upToDate ? current.extra.filter((rel) => kit.files.has(rel)) : [];
  const left = current ? current.extra.filter((rel) => !collisions.includes(rel)) : [];
  const changes: KitChanges = upToDate || !current ? { edited: [], missing: [], extra: [] } : { edited: current.edited, missing: current.missing, extra: collisions };
  const changed = changes.edited.length + changes.missing.length + changes.extra.length;
  if (changed && !options.force) {
    throw new DesignKitsError(
      'design-kits/edited',
      `The project has changed ${changed} file(s) of the kit in ${root}; nothing was written. Move the changes to ${path.join(parent, 'design.css')}, or pass force to discard them.`,
      { dir: root, kit: current?.id, ...changes },
    );
  }

  const removed = current && !upToDate ? Object.keys(current.manifest.files).filter((rel) => !kit.files.has(rel)) : [];
  const designCss = path.join(parent, 'design.css');
  const createDesignCss = !fs.existsSync(designCss);
  const files = upToDate ? [] : [...kit.files.keys(), 'kit.json'];

  if (!dryRun) {
    if (!upToDate) {
      fs.mkdirSync(root, { recursive: true });
      for (const rel of removed) {
        fs.rmSync(inside(root, rel), { force: true });
        pruneEmpty(root, rel);
      }
      for (const [rel, bytes] of kit.files) {
        const to = inside(root, rel);
        fs.mkdirSync(path.dirname(to), { recursive: true });
        fs.writeFileSync(to, bytes);
      }
      // Last: until it's written, the folder still reads as the old kit with changed files, which a re-run with force repairs
      fs.writeFileSync(path.join(root, 'kit.json'), kit.manifestBytes);
    }
    if (createDesignCss) {
      fs.mkdirSync(parent, { recursive: true });
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
  const at = (rel: string) => path.join(root, ...rel.split('/'));
  return {
    status: upToDate ? 'unchanged' : !current ? 'added' : current.id === id ? 'updated' : 'switched',
    dryRun,
    kit: { id, label: kit.manifest.label, kind: kit.manifest.kind, version: kit.manifest.mariachi.version, commit: kit.manifest.mariachi.commit },
    dir: root,
    files,
    previous: current ? { id: current.id, version: current.manifest.mariachi.version, commit: current.manifest.mariachi.commit } : undefined,
    removed,
    discarded: changes,
    left,
    designCss: { path: designCss, created: createDesignCss },
    next: {
      imports: [at(kit.manifest.entry), ...(motionCss ? [at(motionCss)] : []), designCss],
      dataTheme: kit.manifest.dataTheme,
      enhance: motionJs ? at(motionJs) : null,
      reference: at('DESIGN.md'),
    },
  };
}
