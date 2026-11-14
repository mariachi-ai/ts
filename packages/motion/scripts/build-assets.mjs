#!/usr/bin/env node
// Writes the package's non-JS files to dist/, after tsup:
//   motion.css    src/css/motion.css, validated with lightningcss (shipped as written: it's read by agents)
//   catalog.json  every pattern with its markup examples (src/catalog.ts)
//   gallery.html  every pattern live, in any language (src/gallery.ts; not published)
// The catalog and gallery come from .build/build.js (tsup's build-time entry), removed afterwards.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { transform } from 'lightningcss';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

const source = fs.readFileSync(path.join(root, 'src', 'css', 'motion.css'), 'utf8');
const result = transform({ filename: 'motion.css', code: Buffer.from(source), errorRecovery: true });
if (result.warnings.length) {
  for (const w of result.warnings) console.error(`src/css/motion.css:${w.loc.line}:${w.loc.column} ${w.message}`);
  process.exit(1);
}
fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, 'motion.css'), `/* @mariachi/motion ${pkg.version} */\n${source}`);

const build = await import(pathToFileURL(path.join(root, '.build', 'build.js')).href);
fs.writeFileSync(path.join(dist, 'catalog.json'), `${JSON.stringify(build.buildCatalog(pkg.version), null, 2)}\n`);
fs.writeFileSync(path.join(dist, 'gallery.html'), build.galleryPage(pkg.version));
fs.rmSync(path.join(root, '.build'), { recursive: true, force: true });
console.log(`@mariachi/motion: wrote motion.css, catalog.json (${build.patterns.length} patterns) and gallery.html`);
