#!/usr/bin/env node
// Measures every design language's recipes with the fingerprint probe (docs/design-fingerprint.md), at the three
// widths, and writes dist/archetypes/<id>/fingerprint.json and checks.json, the raw screens, and the
// distinctiveness matrix (dist/fingerprints/matrix.json). Needs a built package and Chrome.
//
//   pnpm --filter @mariachi/design fingerprint [id,id,…]
//   MARIACHI_CHROME=/path/to/chrome to use a specific browser (default: the installed Chrome channel)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { buildChecks, buildFingerprint, distance, probeSource, quantile, RECIPE_KINDS, spreads, WIDTHS } from '../dist/build.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const out = path.join(dist, 'fingerprints');
const only = process.argv[2]?.split(',');
const ids = fs.readdirSync(path.join(dist, 'archetypes')).filter((d) => fs.existsSync(path.join(dist, 'archetypes', d, 'recipes')) && (!only || only.includes(d))).sort();
let commit = 'unknown';
try { commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(); } catch {}

const browser = await chromium.launch(process.env.MARIACHI_CHROME ? { executablePath: process.env.MARIACHI_CHROME } : { channel: 'chrome' });
const ctx = await browser.newContext({ deviceScaleFactor: 1, reducedMotion: 'no-preference', colorScheme: 'light' });
const page = await ctx.newPage();
fs.mkdirSync(out, { recursive: true });

const screensOf = {};
for (const id of ids) {
  const screens = [];
  for (const [recipe, kinds] of Object.entries(RECIPE_KINDS)) {
    const file = path.join(dist, 'archetypes', id, 'recipes', `${recipe}.html`);
    if (!fs.existsSync(file)) continue;
    for (const [width, [w, h]] of Object.entries(WIDTHS)) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(`file://${file}`, { waitUntil: 'networkidle' });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.race([Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))), new Promise((r) => setTimeout(r, 1000))]);
        await new Promise((r) => setTimeout(r, 300));
        window.scrollTo(0, 0);
      });
      screens.push({ id: recipe, kinds, width, result: await page.evaluate(probeSource) });
    }
  }
  screensOf[id] = screens;
  const fp = buildFingerprint(id, screens, { mode: 'language', commit, measuredAt: new Date().toISOString() });
  fs.writeFileSync(path.join(dist, 'archetypes', id, 'fingerprint.json'), `${JSON.stringify(fp, null, 2)}\n`);
  fs.writeFileSync(path.join(dist, 'archetypes', id, 'checks.json'), `${JSON.stringify(buildChecks(fp), null, 2)}\n`);
  fs.writeFileSync(path.join(out, `${id}.screens.json`), JSON.stringify(screens));
  process.stdout.write(`${id} `);
}
await browser.close();
console.log();

// The distinctiveness matrix: each language's own screens (each recipe held out in turn) against its checks,
// against every other language's screens, and its screens against every other language's checks.
const fps = Object.fromEntries(ids.map((id) => [id, buildFingerprint(id, screensOf[id], { mode: 'language', measuredAt: '' })]));
const checks = Object.fromEntries(ids.map((id) => [id, buildChecks(fps[id])]));
const sp = spreads(Object.values(fps));
const med = (xs) => quantile(xs, 0.5);
const FLOOR = 0.05;
const rows = [];
for (const L of ids) {
  const own = [];
  for (const recipe of Object.keys(RECIPE_KINDS)) {
    const rest = screensOf[L].filter((s) => s.id !== recipe);
    const held = screensOf[L].filter((s) => s.id === recipe);
    if (!held.length) continue;
    const c = buildChecks(buildFingerprint(L, rest, { mode: 'language', measuredAt: '' }));
    for (const s of held) own.push(distance(s.result.measures, c, sp, s.kinds));
  }
  const strangers = ids.filter((M) => M !== L).flatMap((M) => screensOf[M].map((s) => distance(s.result.measures, checks[L], sp, s.kinds)));
  const toOthers = ids.filter((M) => M !== L).map((M) => ({ M, d: med(screensOf[L].map((s) => distance(s.result.measures, checks[M], sp, s.kinds))) })).sort((a, b) => a.d - b.d);
  const ownD = med(own);
  const base = Math.max(ownD, FLOOR);
  const row = { id: L, checks: checks[L].checks.length, own: +ownD.toFixed(3), stranger: +med(strangers).toFixed(3), strangerRatio: +(med(strangers) / base).toFixed(2), nearest: toOthers[0].M, nearestRatio: +(toOthers[0].d / base).toFixed(2) };
  row.pass = row.strangerRatio >= 1.5 && row.nearestRatio >= 1.25;
  rows.push(row);
}
fs.writeFileSync(path.join(out, 'matrix.json'), `${JSON.stringify({ specVersion: 1, commit, floor: FLOOR, targets: { stranger: 1.5, nearest: 1.25 }, rows }, null, 2)}\n`);
console.table(rows);
console.log(`${rows.filter((r) => r.pass).length}/${rows.length} pass both targets`);
