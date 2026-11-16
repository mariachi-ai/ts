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
const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;
console.log(`@mariachi/design-kits: packed ${result.kits} kits (${mb(result.sourceBytes)} as built, ${mb(result.packedBytes)} packed, ${result.shared} files stored once)`);
fs.rmSync(path.join(root, '.build'), { recursive: true, force: true });
