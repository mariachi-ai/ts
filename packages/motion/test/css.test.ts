import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { COLOUR_LITERAL, keyframes, motionCss, root, rules } from './helpers';

const all = rules(motionCss);
const isReduced = (r: { context: string[] }) => r.context.some((c) => c.includes('prefers-reduced-motion'));
const moves = (decl: string) =>
  /(^|[;\s])animation(-name)?\s*:\s*(?!none\b)/.test(decl) || /(^|[;\s])transition(-property|-duration)?\s*:\s*(?!none\b)/.test(decl);

describe('motion.css', () => {
  it('lives in the mariachi.motion layer, declared after the components and before the overrides', () => {
    expect(motionCss).toContain('@layer mariachi.reset, mariachi.theme, mariachi.base, mariachi.components, mariachi.motion, mariachi.overrides;');
    const outside = all.filter((r) => !r.context[0]?.startsWith('@layer mariachi.motion'));
    expect(outside).toEqual([]);
  });

  it('has a reduced-motion rule for every selector that animates or transitions', () => {
    const reduced = new Set(all.filter(isReduced).flatMap((r) => r.selectors));
    const animated = all.filter((r) => !isReduced(r) && !r.context.some((c) => c.startsWith('nested')) && moves(r.declarations));
    expect(animated.length).toBeGreaterThan(20);
    const missing = animated.flatMap((r) => r.selectors).filter((s) => !reduced.has(s));
    expect(missing).toEqual([]);
  });

  it('under reduced motion uses only opacity keyframes, never a transform, and nothing longer than 150 ms but a pulse', () => {
    const reduced = all.filter(isReduced);
    const names = reduced.flatMap((r) => [...r.declarations.matchAll(/animation(?:-name)?\s*:\s*([\w-]+)/g)].map((m) => m[1]));
    expect(new Set(names)).toEqual(new Set(['none', 'm-pulse', 'm-fade-in', 'm-fade-out']));
    for (const name of ['m-pulse', 'm-fade-in', 'm-fade-out']) expect(keyframes(motionCss, name)).not.toMatch(/transform|translate|scale/);
    for (const r of reduced) {
      expect(r.declarations).not.toMatch(/transition[^;]*transform/);
      for (const m of r.declarations.matchAll(/(?:animation|transition)-duration\s*:\s*([^;]+)/g)) expect(m[1].trim()).toMatch(/^min\(.*, 120ms\)$/);
    }
    // The fades that replace movement are short: transitions in the block are min(…, 120ms)
    for (const m of reduced.map((r) => r.declarations).join('\n').matchAll(/transition\s*:\s*opacity ([^;]+)/g)) expect(m[1]).toMatch(/min\(.*, 120ms\)/);
  });

  it('turns off every chart animation and the shimmer under reduced motion', () => {
    const reduced = all.filter(isReduced);
    const off = (sel: string) => reduced.some((r) => r.selectors.includes(sel) && /animation:\s*none/.test(r.declarations));
    expect(off('.m-skeleton')).toBe(true);
    for (const part of ['line', 'area', 'dot', 'bar', 'arc']) expect(off(`.m-chart:not([data-static]) .m-chart-${part}`)).toBe(true);
  });

  it('has no colour literals, and every token has a plain fallback', () => {
    const code = motionCss.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(code.match(COLOUR_LITERAL)).toBeNull();
    expect(code.match(/var\(--m-[a-z0-9-]+\)/g)).toBeNull();
  });

  it('sets timings and corners through tokens', () => {
    const decl = all.map((r) => r.declarations).join('\n');
    for (const m of decl.matchAll(/border-radius\s*:\s*([^;]+)/g)) expect(m[1]).toMatch(/var\(--|inherit|^0$/);
    for (const m of decl.matchAll(/(?:transition|animation)-duration\s*:\s*([^;]+)/g)) expect(m[1]).toMatch(/var\(--m-/);
  });

  it('reads every overlay token the README lists', () => {
    for (const token of [
      '--m-motion-duration-enter',
      '--m-motion-duration-exit',
      '--m-motion-easing-enter',
      '--m-motion-easing-exit',
      '--m-motion-enter-transform',
      '--m-motion-stagger',
      '--m-motion-stagger-max',
      '--m-motion-route-duration',
      '--m-skeleton-animation',
      '--m-loader-stroke',
      '--m-chart-1',
      '--m-chart-5',
      '--m-chart-stroke',
      '--m-chart-bar-radius',
      '--m-chart-draw',
    ]) {
      expect(motionCss).toContain(`var(${token},`);
    }
  });

  it('keeps @mariachi/design’s shared keyframes identical, so either copy gives the same motion', () => {
    const design = fs.readFileSync(path.join(root, '../design/src/css/motion.css'), 'utf8');
    for (const name of ['m-spin', 'm-pulse', 'm-shimmer']) {
      expect(keyframes(motionCss, name)).toBeDefined();
      expect(keyframes(motionCss, name)).toBe(keyframes(design, name));
    }
  });

  it('keeps the skeleton’s existing markup (text, circle, block) and adds the new shapes', () => {
    for (const shape of ['circle', 'block', 'media', 'row', 'card', 'lines']) expect(motionCss).toContain(`.m-skeleton[data-shape="${shape}"]`);
    expect(all.some((r) => r.selectors.includes('.m-skeleton') && /animation:\s*var\(--m-skeleton-animation, m-shimmer\)/.test(r.declarations))).toBe(true);
  });

  it('opens and closes dialogs, popovers, sheets and toasts with @starting-style and allow-discrete', () => {
    expect(motionCss).toMatch(/transition-behavior: allow-discrete/);
    const starting = all.filter((r) => r.context.some((c) => c.startsWith('nested in')));
    const owners = starting.map((r) => r.context.find((c) => c.startsWith('nested in')));
    for (const sel of ['dialog[open]:not([data-static])', '.m-toast:not([data-state="closing"], [data-leaving])']) {
      expect(owners.some((o) => o?.includes(sel))).toBe(true);
    }
    expect(motionCss).toMatch(/@view-transition\s*{\s*navigation: auto;/);
  });
});
