import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DesignKitsError } from './errors';
import { KIT_ID, type KitManifest, parseManifest, sha256 } from './manifest';

/**
 * The packed kits, as this package ships them:
 *
 *   kits.json            what's here: the design version and commit, and a line per kit
 *   kits/<id>/kit.json   the kit's manifest, byte for byte as @mariachi/design's build wrote it
 *   kits/<id>/<file>     the files only this kit has (its tokens, DESIGN.md, the CSS with its header)
 *   shared/<sha256>      a file two or more kits have (fonts, their licences, motion), stored once
 *
 * A kit is put back together from its manifest: each file comes from the kit's folder, or from `shared/`
 * by the sha256 the manifest records, and is checked against that sha256 before it's handed over.
 */
export const STORE_FORMAT = 1;

export interface KitSummary {
  id: string;
  label: string;
  kind: 'language' | 'preset';
  /** The language's family (`dark-sharp`, `warm-editorial` …); null for a plain preset */
  category: string | null;
  /** `both`, `light-first` or `dark-first` */
  mode: string;
  /** The font families the kit carries files for */
  fonts: string[];
  /** How many files the kit copies in, without `kit.json` */
  files: number;
  /** Their size in bytes */
  bytes: number;
}

export interface KitStoreIndex {
  format: number;
  /** The @mariachi/design build the kits come from */
  design: { package: string; version: string; commit: string };
  kits: KitSummary[];
}

export interface Kit {
  manifest: KitManifest;
  /** `kit.json` exactly as built: write these bytes, never a re-serialised manifest */
  manifestBytes: Buffer;
  /** Every file in the manifest, by its path inside the kit, in the manifest's order */
  files: Map<string, Buffer>;
}

export interface KitStore {
  readonly root: string;
  index(): KitStoreIndex;
  list(): KitSummary[];
  has(id: string): boolean;
  /** `kit.json` alone: parsed, and its bytes as built. Reads no other file. */
  manifest(id: string): { manifest: KitManifest; bytes: Buffer };
  /** One file of a kit, checked against the sha256 `kit.json` records. Only a path `kit.json` names. */
  file(id: string, rel: string): Buffer;
  read(id: string): Kit;
}

/** Where this package's own kits are: beside the built code, or in `dist` when run from source. */
export function defaultStoreRoot(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const found = [here, path.join(here, '..', 'dist')].find((dir) => fs.existsSync(path.join(dir, 'kits.json')));
  if (!found) {
    throw new DesignKitsError('design-kits/store-missing', '@mariachi/design-kits has no packed kits (kits.json is missing). Reinstall it, or build it: pnpm --filter @mariachi/design-kits build');
  }
  return found;
}

/** Opens a packed store. With no `root`, this package's own. */
export function openKitStore(root?: string): KitStore {
  const base = root ?? defaultStoreRoot();
  let cached: KitStoreIndex | undefined;

  const index = (): KitStoreIndex => {
    if (cached) return cached;
    const file = path.join(base, 'kits.json');
    let parsed: KitStoreIndex;
    try {
      parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as KitStoreIndex;
    } catch {
      throw new DesignKitsError('design-kits/store-missing', `No packed kits at ${base} (kits.json is missing or unreadable)`, { root: base });
    }
    if (parsed.format !== STORE_FORMAT || !Array.isArray(parsed.kits)) {
      throw new DesignKitsError('design-kits/store-missing', `The kits at ${base} are in a format this version can't read (format ${String(parsed.format)}, expected ${STORE_FORMAT})`, { root: base });
    }
    cached = parsed;
    return parsed;
  };

  const has = (id: string): boolean => typeof id === 'string' && KIT_ID.test(id) && index().kits.some((k) => k.id === id);

  /** The kit's folder, after checking the id is one of this store's kits: an id never becomes a path otherwise. */
  const folder = (id: string): string => {
    if (!has(id)) {
      const known = index().kits.map((k) => k.id);
      throw new DesignKitsError('design-kits/unknown-kit', `Unknown kit "${String(id)}". Kits: ${known.join(', ')}`, { id, kits: known });
    }
    return path.join(base, 'kits', id);
  };

  const manifest = (id: string): { manifest: KitManifest; bytes: Buffer } => {
    const bytes = fs.readFileSync(path.join(folder(id), 'kit.json'));
    return { manifest: parseManifest(bytes, `kits/${id}/kit.json`), bytes };
  };

  /** A file the manifest names, from the kit's folder or from `shared/`, checked against its sha256. */
  const checked = (id: string, dir: string, rel: string, sha: string): Buffer => {
    const own = path.join(dir, ...rel.split('/'));
    const from = fs.existsSync(own) ? own : path.join(base, 'shared', sha);
    let bytes: Buffer;
    try {
      bytes = fs.readFileSync(from);
    } catch {
      throw new DesignKitsError('design-kits/corrupt', `Kit "${id}" is missing ${rel} in the installed @mariachi/design-kits; reinstall it`, { id, file: rel });
    }
    if (sha256(bytes) !== sha) {
      throw new DesignKitsError('design-kits/corrupt', `Kit "${id}": ${rel} doesn't match the sha256 in kit.json; reinstall @mariachi/design-kits`, { id, file: rel });
    }
    return bytes;
  };

  const file = (id: string, rel: string): Buffer => {
    const dir = folder(id);
    const { manifest: kit } = manifest(id);
    // Only what kit.json lists is a file of the kit. The path is looked up, never joined to a folder as given,
    // so nothing outside the kit can be named: not `kit.json` itself, not `../other-kit/…`, not an absolute path.
    const sha = typeof rel === 'string' && Object.hasOwn(kit.files, rel) ? kit.files[rel] : undefined;
    if (!sha) throw new DesignKitsError('design-kits/unknown-file', `Kit "${id}" has no file ${JSON.stringify(rel)}`, { id, file: rel });
    return checked(id, dir, rel, sha);
  };

  const read = (id: string): Kit => {
    const dir = folder(id);
    const { manifest: kit, bytes: manifestBytes } = manifest(id);
    const files = new Map<string, Buffer>();
    for (const [rel, sha] of Object.entries(kit.files)) files.set(rel, checked(id, dir, rel, sha));
    return { manifest: kit, manifestBytes, files };
  };

  return { root: base, index, list: () => index().kits, has, manifest, file, read };
}

/** Every kit in this package: id, label, kind, category, mode, fonts and size. */
export function listKits(store: KitStore = openKitStore()): KitSummary[] {
  return store.list();
}

/** One kit, put back together and checked: the manifest, `kit.json`'s bytes, and every file. */
export function readKit(id: string, store: KitStore = openKitStore()): Kit {
  return store.read(id);
}

/** Whether this package has a kit of that id. */
export function hasKit(id: string, store: KitStore = openKitStore()): boolean {
  return store.has(id);
}

/**
 * A kit's `kit.json`, as a project that adds the kit gets it: its id, label, mode and `dataTheme`, the
 * design version and commit it was built from (`mariachi.version`, `mariachi.commit`), its fonts, and
 * every file with its sha256. Reads that one file.
 */
export function kitJson(id: string, store: KitStore = openKitStore()): KitManifest {
  return store.manifest(id).manifest;
}

/** `kit.json`'s bytes exactly as built, for writing or serving it unchanged. */
export function kitJsonBytes(id: string, store: KitStore = openKitStore()): Buffer {
  return store.manifest(id).bytes;
}

/**
 * One file of a kit, without writing the kit anywhere: for a server that hands out single files, or
 * a tool that assembles a kit in memory. `path` must be one `kit.json` lists; anything else, `kit.json`
 * included, is refused (`design-kits/unknown-file`). The bytes are checked against the sha256
 * `kit.json` records before they are returned.
 */
export function readKitFile(id: string, path: string, store: KitStore = openKitStore()): Buffer {
  return store.file(id, path);
}

/** Where the design catalog shipped with this package is: `components[]`, `archetypes[]`, presets and tokens. */
export function catalogPath(root: string = defaultStoreRoot()): string {
  return path.join(root, 'catalog.json');
}
