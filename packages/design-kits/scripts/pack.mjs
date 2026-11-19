#!/usr/bin/env node
// Packs @mariachi/design's dist/kits into this package's dist: kits.json, kits/<id>/ and shared/<sha256>.
// Fonts, their licences and the motion files are in many kits and are stored once; every kit is read back
// and compared with the build's, byte for byte, before this exits. Run after tsup (which writes .build/pack.js).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packKits } from '../.build/pack.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const design = fs.realpathSync(path.join(root, 'node_modules', '@mariachi', 'design'));
const source = path.join(design, 'dist', 'kits');
if (!fs.existsSync(source)) {
  console.error("@mariachi/design isn't built (no dist/kits); build it first");
  process.exit(1);
}
const result = packKits(source, path.join(root, 'dist'));
// The design catalog (components, languages, presets, tokens) for tools that describe or pick a design. It is
// too large for @mariachi/design, which every app installs; this package is the one tools install.
const catalog = path.join(design, 'dist', 'catalog.json');
if (!fs.existsSync(catalog)) {
  console.error("@mariachi/design has no dist/catalog.json; build it first");
  process.exit(1);
}
fs.copyFileSync(catalog, path.join(root, 'dist', 'catalog.json'));
// The reference beside it (`design reference`): each component's CSS, and each language's named patterns (a player,
// a job card…) drawn in it. A project copies a component's CSS from here; the library itself is never its dependency.
const reference = path.join(root, 'dist', 'reference');
fs.rmSync(reference, { recursive: true, force: true });
fs.mkdirSync(path.join(reference, 'components'), { recursive: true });
fs.mkdirSync(path.join(reference, 'patterns'), { recursive: true });
const componentsDir = path.join(design, 'dist', 'css', 'components');
if (!fs.existsSync(componentsDir)) {
  console.error("@mariachi/design has no dist/css/components; build it first");
  process.exit(1);
}
for (const f of fs.readdirSync(componentsDir).filter((f) => f.endsWith('.css'))) fs.copyFileSync(path.join(componentsDir, f), path.join(reference, 'components', f));
const archetypes = path.join(design, 'dist', 'archetypes');
for (const id of fs.readdirSync(archetypes)) {
  const showcase = path.join(archetypes, id, 'showcase.json');
  if (fs.existsSync(showcase)) fs.copyFileSync(showcase, path.join(reference, 'patterns', `${id}.json`));
}
const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;
console.log(`@mariachi/design-kits: packed ${result.kits} kits (${mb(result.sourceBytes)} as built, ${mb(result.packedBytes)} packed, ${result.shared} files stored once)`);
fs.rmSync(path.join(root, '.build'), { recursive: true, force: true });
