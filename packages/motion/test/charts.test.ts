import { describe, expect, it } from 'vitest';
import { type ChartKind, type ChartSpec, chart, interpolateSpec, sameShape } from '../src/charts';
import { domain, labelIndices, monotonePath, niceTicks } from '../src/charts/scale';
import { MotionError } from '../src/errors';
import { COLOUR_LITERAL, wellFormed } from './helpers';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const specs: Record<ChartKind, ChartSpec> = {
  line: { kind: 'line', title: 'Signups', labels: months, series: [{ name: '2026', values: [3, 5, 4, 8, 9, 12] }, { name: '2025', values: [2, 3, 3, 4, 6, 7] }] },
  area: { kind: 'area', title: 'Spend & tax', labels: months, format: { style: 'currency', currency: 'EUR' }, series: [{ name: 'Spend', values: [120, 180, 160, 240, 220, 300] }] },
  bar: { kind: 'bar', title: 'Orders', labels: months, series: [{ name: 'Online', values: [12, 15, 17, -3, 19, 23] }, { name: 'Store', values: [9, 10, 11, 12, 11, 12] }] },
  donut: { kind: 'donut', title: 'Plans', labels: ['Starter', 'Team', 'Business'], series: [50, 30, 20] },
  sparkline: { kind: 'sparkline', title: 'Requests', series: [4, 6, 5, 8, 7, 9] },
  stat: { kind: 'stat', title: 'Revenue', value: 48210, format: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }, change: 0.124, changeLabel: 'vs last month', series: [3, 4, 5] },
};
const svgOf = (html: string) => /<svg[\s\S]*<\/svg>/.exec(html)?.[0] ?? '';

describe.each(Object.entries(specs))('chart %s', (kind, spec) => {
  const html = chart({ ...spec, id: `t-${kind}` });

  it('is well-formed markup in a .m-chart figure', () => {
    expect(html.startsWith(`<figure class="m-chart" data-kind="${kind}"`)).toBe(true);
    expect(wellFormed(html)).toBe(true);
  });

  it('has no colour literals: series colours are data-series slots for --m-chart-1 … 5', () => {
    expect(html.match(COLOUR_LITERAL)).toBeNull();
    if (kind !== 'stat') expect(html).toContain('data-series="1"');
  });

  it('stores its spec for updateChart', () => {
    const stored = /data-m-chart="([^"]*)"/.exec(html)?.[1] ?? '';
    const back = JSON.parse(stored.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
    expect(back.kind).toBe(kind);
    expect(back.title).toBe(spec.title);
  });

  if (kind !== 'stat') {
    it('is a named image with a <title>, a <desc> and a table of its data', () => {
      const svg = svgOf(html);
      expect(svg).toMatch(new RegExp(`role="img" aria-labelledby="t-${kind}-t t-${kind}-d"`));
      expect(svg).toContain(`<title id="t-${kind}-t">${spec.title.replace('&', '&amp;')}</title>`);
      expect(svg).toMatch(/<desc id="[^"]+">[^<]{10,}<\/desc>/);
      expect(html).toContain(`<table class="m-chart-table"><caption>${spec.title.replace('&', '&amp;')}</caption>`);
      const values = (Array.isArray(spec.series) && typeof spec.series[0] === 'number' ? spec.series : (spec.series as { values: number[] }[])[0].values) as number[];
      expect((html.match(/<td>/g) ?? []).length).toBeGreaterThanOrEqual(values.length);
    });
  }
});

describe('chart details', () => {
  it('draws lines on with pathLength, and labels axes with real text', () => {
    for (const kind of ['line', 'area', 'sparkline'] as const) {
      const svg = svgOf(chart(specs[kind]));
      expect(svg).toContain('class="m-chart-line" pathLength="1"');
    }
    const line = svgOf(chart(specs.line));
    for (const m of ['Jan', 'Jun']) expect(line).toContain(`>${m}</text>`);
    expect(line).toMatch(/class="m-chart-axis"[^>]*>0<\/text>/);
    expect((line.match(/class="m-chart-line"/g) ?? []).length).toBe(2);
    expect(chart(specs.line)).toContain('<ul class="m-chart-legend" aria-hidden="true">');
  });

  it('fills an area with a gradient of its series colour', () => {
    const svg = svgOf(chart({ ...specs.area, id: 'a' }));
    expect(svg).toContain('<linearGradient id="a-g0"');
    expect(svg).toContain('fill="url(#a-g0)"');
    expect(svg).toContain('class="m-chart-stop"');
    expect(svg).toMatch(/>€[\d.,]+<\/text>/);
  });

  it('grows bars from their base, staggered, negative ones downwards, each with a title', () => {
    const svg = svgOf(chart(specs.bar));
    const bars = svg.match(/<rect class="m-chart-bar"[^>]*>/g) ?? [];
    expect(bars).toHaveLength(12);
    expect(bars.filter((b) => b.includes('data-negative'))).toHaveLength(1);
    expect(bars.map((b) => /--i:(\d+)/.exec(b)?.[1])).toEqual(['0', '2', '4', '6', '8', '10', '1', '3', '5', '7', '9', '11']);
    expect(svg).toContain('<title>Apr · Online: -3</title>');
    expect(svg).toContain('class="m-chart-baseline"');
  });

  it('sweeps donut segments in turn, with the total in the middle and a legend of values', () => {
    const html = chart(specs.donut);
    const arcs = html.match(/<circle class="m-chart-arc"[^>]*>/g) ?? [];
    expect(arcs).toHaveLength(3);
    expect(arcs.every((a) => a.includes('pathLength="100"'))).toBe(true);
    expect(arcs.map((a) => /--_at:([\d.]+)/.exec(a)?.[1])).toEqual(['0', '0.5', '0.8']);
    expect(html).toContain('>100</text>');
    expect(html).toContain('Starter</span><span class="m-chart-legend-value">50 · 50%</span>');
  });

  it('writes a stat as text that counts up, with its change in words', () => {
    const html = chart(specs.stat);
    expect(html).toContain('data-count-up data-count-to="48210"');
    expect(html).toContain('>$48,210</p>');
    expect(html).toContain('<span class="m-sr-only">Up </span>12.4%');
    expect(html).toContain('data-trend="good"');
    expect(chart({ ...specs.stat, change: 0.05, goodWhen: 'down' })).toContain('data-trend="bad"');
    expect(chart({ ...specs.stat, change: -0.05 })).toContain('<span class="m-sr-only">Down </span>5%');
    // Its sparkline is decoration: the number says it
    expect(svgOf(html)).toMatch(/^<svg [^>]*aria-hidden="true"/);
  });

  it('draws in place with animate: false (no count-up, data-static)', () => {
    expect(chart({ ...specs.line, animate: false })).toContain('<figure class="m-chart" data-kind="line" data-static');
    expect(chart({ ...specs.stat, animate: false })).not.toContain('data-count-up');
  });

  it('escapes text', () => {
    const html = chart({ kind: 'bar', title: '<b>"x"</b>', labels: ['a&b'], series: [1] });
    expect(html).not.toContain('<b>');
    expect(html).toContain('a&amp;b');
    expect(wellFormed(html)).toBe(true);
  });

  it('refuses an unknown kind or a chart with no data', () => {
    expect(() => chart({ kind: 'pie' as ChartKind, title: 'x', series: [1] })).toThrow(MotionError);
    expect(() => chart({ kind: 'line', title: 'x', series: [] })).toThrow(/needs series/);
  });

  it('interpolates between two specs of the same shape', () => {
    const a: ChartSpec = { kind: 'bar', title: 't', series: [0, 10] };
    const b: ChartSpec = { kind: 'bar', title: 't', series: [10, 20] };
    expect(sameShape(a, b)).toBe(true);
    expect(sameShape(a, { ...b, series: [1, 2, 3] })).toBe(false);
    expect(interpolateSpec(a, b, 0.5).series).toEqual([{ name: 't', values: [5, 15] }]);
    expect(interpolateSpec({ ...specs.stat, value: 0 }, specs.stat, 0.5).value).toBe(24105);
  });
});

describe('scales', () => {
  it('picks nice ticks that cover the data', () => {
    expect(niceTicks(0, 860, 4)).toEqual([0, 250, 500, 750, 1000]);
    expect(niceTicks(-3, 23, 4)).toEqual([-10, 0, 10, 20, 30]);
    expect(niceTicks(5, 5)).toEqual([0, 2, 4, 6]);
  });

  it('starts at zero unless the data sits far from it', () => {
    expect(domain([3, 12], false)).toEqual([0, 12]);
    expect(domain([95, 100], false)).toEqual([95, 100]);
    expect(domain([95, 100], true)).toEqual([0, 100]);
  });

  it('draws smooth lines that never overshoot the data', () => {
    const pts: [number, number][] = [[0, 10], [10, 10], [20, 0], [30, 0], [40, 5]];
    const ys = [...monotonePath(pts).matchAll(/[\d.]+ ([\d.]+)/g)].map((m) => Number(m[1]));
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...ys)).toBeLessThanOrEqual(10);
  });

  it('shows the first and last labels when there is no room for all', () => {
    const shown = labelIndices(12, 6);
    expect(shown[0]).toBe(0);
    expect(shown[shown.length - 1]).toBe(11);
    expect(shown.length).toBeLessThanOrEqual(6);
    expect(labelIndices(4, 6)).toEqual([0, 1, 2, 3]);
  });
});
