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

  const read = (id: string): Kit => {
    const known = index().kits.map((k) => k.id);
    if (!KIT_ID.test(id) || !known.includes(id)) {
      throw new DesignKitsError('design-kits/unknown-kit', `Unknown kit "${id}". Kits: ${known.join(', ')}`, { id, kits: known });
    }
    const dir = path.join(base, 'kits', id);
    const manifestBytes = fs.readFileSync(path.join(dir, 'kit.json'));
    const manifest = parseManifest(manifestBytes, `kits/${id}/kit.json`);
    const files = new Map<string, Buffer>();
    for (const [rel, sha] of Object.entries(manifest.files)) {
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
      files.set(rel, bytes);
    }
    return { manifest, manifestBytes, files };
  };

  return { root: base, index, list: () => index().kits, read };
}

/** Every kit in this package: id, label, kind, category, mode, fonts and size. */
export function listKits(store: KitStore = openKitStore()): KitSummary[] {
  return store.list();
}

/** One kit, put back together and checked: the manifest, `kit.json`'s bytes, and every file. */
export function readKit(id: string, store: KitStore = openKitStore()): Kit {
  return store.read(id);
}
