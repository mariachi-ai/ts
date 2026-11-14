/**
 * The motion overlay: the tokens @mariachi/motion reads are in the contract with the README's
 * defaults, every theme and kit carries them, and motion's CSS uses only tokens the contract has.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { packageAssets } from '../src/build';
import { overlayComponentPaths, tokenByPath, tokenList } from '../src/contract';
import { unknownVars } from '../src/engine/css-vars';
import { archetypes, presets, type Theme, withMotionOverlay } from '../src/index';

const root = path.resolve(__dirname, '..');
const motionCss = fs.readFileSync(path.join(root, '../motion/src/css/motion.css'), 'utf8');
const all = Object.values(presets as Record<string, Theme>);

// The README's table (packages/motion/README.md): token → default
const DEFAULTS: Record<string, string> = {
  '--m-motion-duration-fast': '120ms',
  '--m-motion-duration-normal': '200ms',
  '--m-motion-duration-slow': '320ms',
  '--m-motion-duration-enter': '240ms',
  '--m-motion-duration-exit': '160ms',
  '--m-motion-enter-transform': 'translateY(0.375rem)',
  '--m-motion-stagger': '40ms',
  '--m-motion-stagger-max': '320ms',
  '--m-motion-route': 'fade',
  '--m-motion-route-duration': '200ms',
  '--m-skeleton-animation': 'm-shimmer',
  '--m-loader-stroke': '2px',
  '--m-chart-stroke': '2px',
  '--m-chart-bar-radius': '2px',
  '--m-chart-draw': '600ms',
};
const byVar = new Map(tokenList.map((t) => [t.cssVar, t]));

describe('motion overlay tokens', () => {
  it('are in the contract with the README’s defaults', () => {
    for (const [cssVar, value] of Object.entries(DEFAULTS)) expect(byVar.get(cssVar)?.def.default, cssVar).toBe(value);
    for (const cssVar of ['--m-motion-easing-enter', '--m-motion-easing-exit', '--m-chart-1', '--m-chart-2', '--m-chart-3', '--m-chart-4', '--m-chart-5']) {
      expect(byVar.get(cssVar)?.def.default, cssVar).toBeTruthy();
    }
  });

  it('are carried by every preset, so every kit’s tokens.css has them', () => {
    for (const theme of all) {
      for (const path of [...overlayComponentPaths, 'motion.duration.enter', 'motion.enterTransform', 'motion.routeDuration']) {
        expect(theme.tokens[path], `${theme.name} ${path}`).toBeDefined();
      }
    }
    const assets = packageAssets(root).files;
    for (const theme of all) {
      const css = assets[`css/themes/${theme.name}.css`];
      for (const cssVar of ['--m-motion-duration-enter', '--m-motion-stagger-max', '--m-skeleton-animation', '--m-loader-stroke', '--m-chart-1', '--m-chart-5', '--m-chart-draw']) {
        expect(css, `${theme.name} ${cssVar}`).toContain(`${cssVar}:`);
      }
    }
  });

  it('take the chart colours from each language’s charts.categorical, light and dark', () => {
    const assets = packageAssets(root).files;
    for (const a of archetypes) {
      const theme = withMotionOverlay((presets as Record<string, Theme>)[a.id]);
      a.charts.categorical.slice(0, 5).forEach((c, i) => {
        const value = theme.tokens[`components.chart.${i + 1}`];
        expect(value, `${a.id} chart ${i + 1}`).toEqual(c.light === c.dark ? c.light : { light: c.light, dark: c.dark });
      });
      expect(assets[`css/themes/${a.id}.css`]).toContain(`--m-chart-1: ${a.charts.categorical[0].light};`);
    }
    // A plain preset keeps the contract's defaults (its accent and status colours)
    expect(withMotionOverlay(presets.minimal).tokens['components.chart.1']).toBe(tokenByPath.get('components.chart.1')?.def.default);
  });

  it('keep a chart colour a theme sets itself', () => {
    const own = { ...presets.terracotta, tokens: { ...presets.terracotta.tokens, 'components.chart.1': 'var(--m-color-brand-default)' } };
    expect(withMotionOverlay(own).tokens['components.chart.1']).toBe('var(--m-color-brand-default)');
  });

  it("are the only --m-* names @mariachi/motion's CSS reads", () => {
    expect(unknownVars(motionCss)).toEqual([]);
  });

  it('put mariachi.motion between the components and the overrides', () => {
    const layers = fs.readFileSync(path.join(root, 'src/css/layers.css'), 'utf8');
    expect(layers).toContain('mariachi.components, mariachi.motion, mariachi.overrides;');
  });
});

const kits = path.join(root, 'dist', 'kits');
describe.skipIf(!fs.existsSync(kits))('kits (after a build)', () => {
  it('copy motion’s files into motion/ and record their shas and version in kit.json', () => {
    const version = JSON.parse(fs.readFileSync(path.join(root, '../motion/package.json'), 'utf8')).version;
    for (const id of fs.readdirSync(kits)) {
      const kit = JSON.parse(fs.readFileSync(path.join(kits, id, 'kit.json'), 'utf8'));
      expect(kit.motion).toEqual({
        package: '@mariachi/motion',
        version,
        files: ['motion/motion.css', 'motion/motion.js', 'motion/charts.js', 'motion/motion.d.ts', 'motion/charts.d.ts'],
      });
      for (const f of kit.motion.files) {
        const sha = crypto.createHash('sha256').update(fs.readFileSync(path.join(kits, id, f))).digest('hex');
        expect(kit.files[f], `${id}/${f}`).toBe(sha);
      }
      expect(fs.readFileSync(path.join(kits, id, 'tokens.css'), 'utf8')).toContain('--m-motion-duration-enter:');
    }
  });
});
