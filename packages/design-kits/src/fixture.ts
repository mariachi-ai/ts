import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { packKits } from './pack';
import { type KitStore, openKitStore } from './store';

/** Test support: small kits laid out the way @mariachi/design's build writes `dist/kits`, and a store packed from them. */
export const tmp = (name = 'kits'): string => fs.mkdtempSync(path.join(os.tmpdir(), `mariachi-design-${name}-`));

const sha = (bytes: Buffer) => crypto.createHash('sha256').update(bytes).digest('hex');

export const FONT = Buffer.from([0x77, 0x4f, 0x46, 0x32, 0, 1, 2, 3, 250, 251, 252, 253]);
const MOTION = 'export function enhance() {}\n';

export interface FixtureKit {
  id: string;
  version?: string;
  kind?: 'language' | 'preset';
  files?: Record<string, string | Buffer>;
}

export function kitFiles(id: string, version: string): Record<string, string | Buffer> {
  return {
    'fonts/shared-latin.woff2': FONT,
    'fonts/shared.LICENSE.txt': 'SIL Open Font License 1.1\n',
    'fonts.css': `/* ${id} ${version} */\n@font-face { font-family: 'Shared'; src: url(./fonts/shared-latin.woff2); }\n`,
    'base.css': `/* ${id} ${version} */\n*, ::before, ::after { box-sizing: border-box; }\n`,
    'tokens.css': `/* ${id} ${version} */\n:where([data-theme="${id}"]) { --m-color-accent-default: #123456; }\n`,
    'index.css': `/* ${id} */\n@import './fonts.css';\n@import './base.css';\n@import './tokens.css';\n`,
    'motion/motion.css': '.m-skeleton { animation: none; }\n',
    'motion/motion.js': MOTION,
    'DESIGN.md': `# ${id}\n\nVersion ${version}.\n`,
  };
}

/** Writes kits into `dir` as the design build does, each with a `kit.json` carrying a sha256 per file. */
export function writeSource(dir: string, kits: FixtureKit[]): string {
  for (const kit of kits) {
    const version = kit.version ?? '1.0.0';
    const files = kit.files ?? kitFiles(kit.id, version);
    const shas: Record<string, string> = {};
    for (const [rel, content] of Object.entries(files)) {
      const bytes = Buffer.isBuffer(content) ? content : Buffer.from(content);
      const to = path.join(dir, kit.id, ...rel.split('/'));
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.writeFileSync(to, bytes);
      shas[rel] = sha(bytes);
    }
    const manifest = {
      id: kit.id,
      label: kit.id[0]!.toUpperCase() + kit.id.slice(1),
      kind: kit.kind ?? 'language',
      category: kit.kind === 'preset' ? null : 'calm-minimal',
      mode: 'both',
      mariachi: { package: '@mariachi/design', version, commit: 'abc123' },
      motion: { package: '@mariachi/motion', version, files: Object.keys(files).filter((f) => f.startsWith('motion/')) },
      source: `example.test/${kit.id}`,
      dataTheme: kit.id,
      entry: 'index.css',
      fonts: 'fonts/shared-latin.woff2' in files ? [{ family: 'Shared', source: '@fontsource/shared', license: 'fonts/shared.LICENSE.txt', files: ['fonts/shared-latin.woff2'] }] : [],
      files: shas,
    };
    fs.writeFileSync(path.join(dir, kit.id, 'kit.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  }
  return dir;
}

/** A packed store of the given kits (default: linen and marigold, sharing a font and motion). */
export function fixtureStore(kits: FixtureKit[] = [{ id: 'linen' }, { id: 'marigold' }]): { store: KitStore; source: string; root: string } {
  const source = writeSource(tmp('source'), kits);
  const root = tmp('store');
  packKits(source, root);
  return { store: openKitStore(root), source, root };
}

/** Every file under `dir`, as `path -> sha256`, to compare two folders byte for byte. */
export function snapshot(dir: string, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) Object.assign(out, snapshot(path.join(dir, entry.name), rel));
    else out[rel] = sha(fs.readFileSync(path.join(dir, entry.name)));
  }
  return out;
}
