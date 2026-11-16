import fs from 'node:fs';
import path from 'node:path';
import { DesignKitsError } from './errors';
import { parseManifest, sha256 } from './manifest';
import { type KitStoreIndex, type KitSummary, openKitStore, STORE_FORMAT } from './store';

export interface PackResult {
  kits: number;
  /** Files stored once in `shared/` */
  shared: number;
  /** Bytes in the kits as built, and as packed */
  sourceBytes: number;
  packedBytes: number;
}

/**
 * Packs `@mariachi/design`'s `dist/kits` into `outDir` (see ./store for the layout), then reads every kit
 * back and compares it with the source, byte for byte. Build-time only.
 */
export function packKits(sourceDir: string, outDir: string): PackResult {
  const ids = fs
    .readdirSync(sourceDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(sourceDir, e.name, 'kit.json')))
    .map((e) => e.name)
    .sort();
  if (!ids.length) throw new DesignKitsError('design-kits/store-missing', `No kits in ${sourceDir}; build @mariachi/design first`, { sourceDir });

  const kits = ids.map((id) => {
    const manifestBytes = fs.readFileSync(path.join(sourceDir, id, 'kit.json'));
    const manifest = parseManifest(manifestBytes, `${id}/kit.json`);
    if (manifest.id !== id) throw new DesignKitsError('design-kits/invalid-manifest', `${id}/kit.json names another kit (${manifest.id})`, { id });
    const files = Object.entries(manifest.files).map(([rel, sha]) => {
      const bytes = fs.readFileSync(path.join(sourceDir, id, ...rel.split('/')));
      if (sha256(bytes) !== sha) throw new DesignKitsError('design-kits/corrupt', `${id}/${rel} doesn't match the sha256 in kit.json`, { id, file: rel });
      return { rel, sha, bytes };
    });
    return { id, manifest, manifestBytes, files };
  });

  // A file's bytes, by sha256, and how many kits have it
  const uses = new Map<string, number>();
  for (const kit of kits) for (const sha of new Set(kit.files.map((f) => f.sha))) uses.set(sha, (uses.get(sha) ?? 0) + 1);

  fs.rmSync(path.join(outDir, 'kits'), { recursive: true, force: true });
  fs.rmSync(path.join(outDir, 'shared'), { recursive: true, force: true });
  fs.mkdirSync(path.join(outDir, 'shared'), { recursive: true });

  const written = new Set<string>();
  let sourceBytes = 0;
  let packedBytes = 0;
  const summaries: KitSummary[] = [];
  for (const kit of kits) {
    const dir = path.join(outDir, 'kits', kit.id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'kit.json'), kit.manifestBytes);
    let bytes = 0;
    for (const file of kit.files) {
      bytes += file.bytes.length;
      if ((uses.get(file.sha) ?? 0) > 1) {
        if (written.has(file.sha)) continue;
        written.add(file.sha);
        fs.writeFileSync(path.join(outDir, 'shared', file.sha), file.bytes);
      } else {
        const to = path.join(dir, ...file.rel.split('/'));
        fs.mkdirSync(path.dirname(to), { recursive: true });
        fs.writeFileSync(to, file.bytes);
      }
      packedBytes += file.bytes.length;
    }
    sourceBytes += bytes;
    summaries.push({
      id: kit.id,
      label: kit.manifest.label,
      kind: kit.manifest.kind,
      category: kit.manifest.category ?? null,
      mode: kit.manifest.mode ?? 'both',
      fonts: kit.manifest.fonts.filter((f) => f.files.length).map((f) => f.family),
      files: kit.files.length,
      bytes,
    });
  }

  const first = kits[0]!.manifest.mariachi;
  const mixed = kits.find((k) => k.manifest.mariachi.version !== first.version || k.manifest.mariachi.commit !== first.commit);
  if (mixed) throw new DesignKitsError('design-kits/corrupt', `The kits come from more than one build (${kits[0]!.id} and ${mixed.id} differ); rebuild @mariachi/design`, { id: mixed.id });
  const index: KitStoreIndex = { format: STORE_FORMAT, design: { package: first.package, version: first.version, commit: first.commit }, kits: summaries };
  fs.writeFileSync(path.join(outDir, 'kits.json'), `${JSON.stringify(index, null, 2)}\n`);

  // Read every kit back the way a project gets it, and compare with what was built
  const store = openKitStore(outDir);
  for (const kit of kits) {
    const back = store.read(kit.id);
    if (!back.manifestBytes.equals(kit.manifestBytes)) throw new DesignKitsError('design-kits/corrupt', `${kit.id}: kit.json changed in packing`, { id: kit.id });
    if (back.files.size !== kit.files.length) throw new DesignKitsError('design-kits/corrupt', `${kit.id}: packed ${back.files.size} files, built ${kit.files.length}`, { id: kit.id });
    for (const file of kit.files) {
      if (!back.files.get(file.rel)?.equals(file.bytes)) throw new DesignKitsError('design-kits/corrupt', `${kit.id}/${file.rel} changed in packing`, { id: kit.id, file: file.rel });
    }
  }
  return { kits: kits.length, shared: written.size, sourceBytes, packedBytes };
}
