#!/usr/bin/env node
// Writes dist/kits/<id>/: what a project copies in to take a design language (or a plain preset) as its own.
// Only the base: the tokens, the reset and base styles, the fonts and DESIGN.md. Components aren't copied;
// a project makes each one when it needs it, from the language's reference (catalog, component CSS, DESIGN.md).
//
//   <id>/index.css    imports the three below, in order
//   <id>/fonts.css    @font-face for the body and heading families, with fonts/*.woff2
//   <id>/base.css     the reset and base layers (no components)
//   <id>/tokens.css   the language's tokens, light and dark, scoped to [data-theme="<id>"]
//   <id>/DESIGN.md    the language in words, with the generated reference
//   <id>/kit.json     id, label, kind, the Mariachi version and commit, fonts, and a sha256 per file
//
// Kits are build output for tools that copy them (Ensemble's template and its copy-in tool); the npm
// package leaves them out. Run after build-assets.
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { archetypes, presets } from '../dist/index.js';
import { designReference } from '../dist/build.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const out = path.join(dist, 'kits');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const REPO = 'github.com/mariachi-ai/ts';

/** The commit the kits come from: MARIACHI_COMMIT, else git (marked when packages/design has local changes). */
function commit() {
  if (process.env.MARIACHI_COMMIT) return process.env.MARIACHI_COMMIT;
  try {
    const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    const dirty = execFileSync('git', ['status', '--porcelain', '--', '.'], { cwd: root, encoding: 'utf8' }).trim();
    return dirty ? `${head} (with local changes)` : head;
  } catch {
    return 'unknown';
  }
}
const COMMIT = commit();

// The open fonts the languages name, self-hosted from @fontsource (dev dependencies). Latin and Latin Extended only.
const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const LATIN_EXT = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';
const slug = (family) => family.toLowerCase().replace(/\s+/g, '-');
const pkgDir = (name) => path.join(root, 'node_modules', ...name.split('/'));

/** The woff2 files and @font-face rules for one family, or null when there's no open package for it. */
function fontFace(family) {
  const s = slug(family);
  const variable = pkgDir(`@fontsource-variable/${s}`);
  if (fs.existsSync(variable)) {
    const files = [
      [`${s}-latin-ext-wght-normal.woff2`, LATIN_EXT],
      [`${s}-latin-wght-normal.woff2`, LATIN],
    ].filter(([f]) => fs.existsSync(path.join(variable, 'files', f)));
    // Themes name the variable face first ("Figtree Variable", "Figtree"), so both names point at the same files.
    const css = [`${family} Variable`, family].flatMap((name) =>
      files.map(
        ([f, range]) =>
          `@font-face {\n  font-family: '${name}';\n  font-style: normal;\n  font-display: swap;\n  font-weight: 100 900;\n  src: url(./fonts/${f}) format('woff2-variations');\n  unicode-range: ${range};\n}\n`,
      ),
    );
    return { family, source: `@fontsource-variable/${s}`, files: files.map(([f]) => [path.join(variable, 'files', f), f]), css };
  }
  const fixed = pkgDir(`@fontsource/${s}`);
  if (fs.existsSync(fixed)) {
    const files = [];
    const css = [];
    for (const w of [400, 500, 600, 700]) {
      for (const [sub, range] of [['latin-ext', LATIN_EXT], ['latin', LATIN]]) {
        const f = `${s}-${sub}-${w}-normal.woff2`;
        if (!fs.existsSync(path.join(fixed, 'files', f))) continue;
        files.push([path.join(fixed, 'files', f), f]);
        css.push(`@font-face {\n  font-family: '${family}';\n  font-style: normal;\n  font-display: swap;\n  font-weight: ${w};\n  src: url(./fonts/${f}) format('woff2');\n  unicode-range: ${range};\n}\n`);
      }
    }
    return files.length ? { family, source: `@fontsource/${s}`, files, css } : null;
  }
  return null;
}

/** Lucide defaults for a plain preset's DESIGN.md (the languages each set their own). */
const PLAIN_ICONS = { ...archetypes[0].icons, stroke: 2, size: { text: 16, control: 18 } };

const PLAIN_PRINCIPLES = {
  minimal: 'Neutral and quiet: greys, one blue accent, 6px corners and soft shadows. A starting point that gets out of the way.',
  brutalist: 'Loud and literal: no corners, thick borders, hard offset shadows, uppercase headings and one loud accent.',
  editorial: 'Reading first: serif headings, warm paper, an ink-blue accent, hairline rules and no shadows.',
  soft: 'Gentle and rounded: pastels, pill controls, large corners, diffuse shadows and rounded type.',
  enterprise: 'Dense and sober: small corners, compact type and strong tables, for screens full of data.',
  terminal: 'A console: monospace everywhere, square corners, no shadows and a phosphor-green dark mode.',
};

function plainDesignMd(theme) {
  const a = {
    id: theme.name,
    icons: PLAIN_ICONS,
    density: { default: 1, dense: 0.85 },
    charts: archetypes[0].charts,
  };
  return [
    `# ${theme.label ?? theme.name}`,
    '',
    PLAIN_PRINCIPLES[theme.name] ?? '',
    '',
    `This is one of \`@mariachi/design\`'s plain presets, not a design language: it has no page recipes and no notes on how each component is drawn. Build components on the library's defaults (the design_reference tool), with these tokens, and keep every colour, corner, shadow and font on a token.`,
  ].join('\n') + designReference(a, theme);
}

const header = (kit, what) =>
  [
    '/*',
    ` * ${kit.label} (${kit.id}): ${what}`,
    ` * Copied from Mariachi's @mariachi/design ${pkg.version}, commit ${COMMIT}.`,
    ` * The library's source for it: ${kit.source} in ${REPO}.`,
    ' * Components aren\'t copied. Make each one when the app needs it, from this language\'s reference:',
    ' * the design_reference tool, or DESIGN.md beside this file. Keep colours, corners, shadows and fonts on --m-* tokens.',
    ' * This copy is the project\'s own. Put the project\'s changes in ../design.css, so they stay easy to see',
    ' * and survive a change of language. Moving to a newer version of the language is a deliberate Change, never automatic.',
    ' */',
    '',
  ].join('\n');

const mdHeader = (kit) =>
  `<!-- ${kit.label} (${kit.id}), copied from Mariachi's @mariachi/design ${pkg.version}, commit ${COMMIT} (${kit.source} in ${REPO}). This copy is the project's own; components come from the design_reference tool; moving to a newer version is a deliberate Change. -->\n\n`;

const read = (...p) => fs.readFileSync(path.join(dist, ...p), 'utf8');
const stripBanner = (css) => css.replace(/^\/\* @mariachi\/design [^*]*\*\/\n/, '');
const base = stripBanner(read('css', 'base.css'));

fs.rmSync(out, { recursive: true, force: true });
const byId = new Map(archetypes.map((a) => [a.id, a]));
let count = 0;
for (const theme of Object.values(presets)) {
  const a = byId.get(theme.name);
  const kit = {
    id: theme.name,
    label: theme.label ?? theme.name,
    kind: a ? 'language' : 'preset',
    source: a ? `packages/design/src/archetypes/${theme.name}/` : `packages/design/src/presets/${theme.name}.ts`,
  };
  const dir = path.join(out, kit.id);
  fs.mkdirSync(path.join(dir, 'fonts'), { recursive: true });
  const files = {};
  const write = (rel, content) => {
    fs.writeFileSync(path.join(dir, rel), content);
    files[rel] = crypto.createHash('sha256').update(content).digest('hex');
  };

  // Fonts: the language's body and heading families (mono falls back to the system's).
  const families = a ? [...new Set([a.type.body, a.type.heading])] : [];
  const fonts = [];
  const faceCss = [];
  for (const family of families) {
    const face = fontFace(family);
    if (!face) {
      fonts.push({ family, files: [], note: 'No open font package; the theme falls back to the next font in its stack.' });
      continue;
    }
    for (const [from, name] of face.files) write(`fonts/${name}`, fs.readFileSync(from));
    fonts.push({ family, source: face.source, files: face.files.map(([, name]) => `fonts/${name}`) });
    faceCss.push(...face.css);
  }
  if (!fonts.some((f) => f.files.length)) fs.rmSync(path.join(dir, 'fonts'), { recursive: true });

  write('fonts.css', header(kit, 'fonts') + (faceCss.length ? faceCss.join('\n') : '/* None: this one uses the system fonts. */\n'));
  write('base.css', header(kit, 'reset and base styles') + base);
  write('tokens.css', header(kit, 'tokens, light and dark') + stripBanner(read('css', 'themes', `${kit.id}.css`)));
  write('index.css', `${header(kit, 'the design base, in order')}@import './fonts.css';\n@import './base.css';\n@import './tokens.css';\n`);
  const doc = a ? read('archetypes', kit.id, 'DESIGN.md') : plainDesignMd(theme);
  write(
    'DESIGN.md',
    mdHeader(kit) +
      doc.replace(/the same values are in `themes\/[a-z0-9-]+\.css` and `tokens\/[a-z0-9-]+\.json`/, 'the same values are in `tokens.css` beside this file'),
  );

  const manifest = {
    id: kit.id,
    label: kit.label,
    kind: kit.kind,
    category: a?.category ?? null,
    mode: a?.tags.mode ?? 'both',
    mariachi: { package: '@mariachi/design', version: pkg.version, commit: COMMIT },
    source: `${REPO}/${kit.source}`,
    dataTheme: kit.id,
    entry: 'index.css',
    fonts,
    files,
  };
  fs.writeFileSync(path.join(dir, 'kit.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  count++;
}
// Each language's library files (the design-language playbook) go beside its DESIGN.md in dist/archetypes/<id>/.
const LIBRARY = ['brief.md', 'never.md', 'preferences.md', 'questions.md', 'patterns', 'precedents'];
for (const a of archetypes) {
  for (const name of LIBRARY) {
    const from = path.join(root, 'src', 'archetypes', a.id, name);
    if (fs.existsSync(from)) fs.cpSync(from, path.join(dist, 'archetypes', a.id, name), { recursive: true });
  }
}

// Check what was written: every sha matches its file, and every language has its body font.
for (const id of fs.readdirSync(out)) {
  const m = JSON.parse(fs.readFileSync(path.join(out, id, 'kit.json'), 'utf8'));
  for (const [rel, sha] of Object.entries(m.files)) {
    const got = crypto.createHash('sha256').update(fs.readFileSync(path.join(out, id, rel))).digest('hex');
    if (got !== sha) throw new Error(`dist/kits/${id}/${rel}: sha256 doesn't match kit.json`);
  }
  const a = byId.get(id);
  if (a && !m.fonts.find((f) => f.family === a.type.body)?.files.length) throw new Error(`dist/kits/${id}: no font files for its body family ${a.type.body}`);
}
console.log(`@mariachi/design: wrote ${count} kits to dist/kits`);
