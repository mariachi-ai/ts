import { describe, expect, it } from 'vitest';
import { buildChecks, buildFingerprint, checkMessage, clearRange, deltaE2000, distance, parseCssColor, probeSource, quantile, rgbToOklch, spreads } from '../src/fingerprint';
import type { MeasuredScreen } from '../src/fingerprint';

describe('colour', () => {
  it('CIEDE2000 matches the published test pairs (Sharma, Wu and Dalal 2005)', () => {
    expect(deltaE2000([50, 2.6772, -79.7751], [50, 0, -82.7485])).toBeCloseTo(2.0425, 4);
    expect(deltaE2000([50, 2.5, 0], [73, 25, -18])).toBeCloseTo(27.1492, 4);
    expect(deltaE2000([2.0776, 0.0795, -1.135], [0.9033, -0.0636, -0.5514])).toBeCloseTo(0.9082, 4);
  });
  it('reads rgb(), rgba() and hex, and nothing else', () => {
    expect(parseCssColor('rgb(255, 56, 92)')).toEqual([255, 56, 92, 1]);
    expect(parseCssColor('rgba(0, 0, 0, 0.5)')).toEqual([0, 0, 0, 0.5]);
    expect(parseCssColor('#e31c5f')).toEqual([227, 28, 95, 1]);
    expect(parseCssColor('linear-gradient(red, blue)')).toBeNull();
  });
  it('gives an everyday blue a chroma above the saturated threshold', () => {
    const [, c, h] = rgbToOklch([59, 130, 246]);
    expect(c).toBeGreaterThan(0.08);
    expect(h).toBeGreaterThan(240);
  });
  it('serialises the probe as one self-contained expression', () => {
    expect(probeSource).toMatch(/^\(\(\) => \{/);
    expect(probeSource).toContain('function measureScreen');
    expect(probeSource).toContain('function deltaE2000');
  });
});

const screen = (id: string, kinds: MeasuredScreen['kinds'], measures: Record<string, number | string | Record<string, number> | null>): MeasuredScreen => ({
  id, kinds, width: 'wide', result: { specVersion: 1, width: 1440, measures },
});

describe('fingerprint', () => {
  const screens = [3, 4, 4, 5, 4, 4].map((n, i) => screen(`s${i}`, i < 3 ? ['list'] : ['settings'], {
    'type.sizes': n,
    'media.role': i % 2 ? 'inset' : 'none',
    'structure.separation': { border: i % 2, divider: 1 - (i % 2) },
    'shape.radiusBySize': { '<40': 6 + i },
  }));
  const fp = buildFingerprint('test', screens, { mode: 'language', measuredAt: '2026-11-13T00:00:00Z' });

  it('summarises numbers as a median with a 10th–90th percentile range, by kind', () => {
    expect(fp.measures['type.sizes'].typical).toBe(4);
    expect(fp.measures['type.sizes'].range).toEqual([3.5, 4.5]);
    expect(fp.measures['type.sizes'].byKind.list.typical).toBe(4);
  });
  it('summarises labels and shares as shares, and other maps as medians per key', () => {
    expect(fp.measures['media.role'].typical).toEqual({ none: 0.5, inset: 0.5 });
    expect(fp.measures['structure.separation'].unit).toBe('shares');
    expect(fp.measures['shape.radiusBySize'].unit).toBe('counts');
    expect((fp.measures['shape.radiusBySize'].typical as Record<string, number>)['<40']).toBe(8.5);
  });
  it('checks only clear numeric ranges, and says the distance in plain words', () => {
    const checks = buildChecks(fp);
    expect(checks.checks.map((c) => c.id)).toEqual(['type.sizes']);
    expect(checkMessage(checks.checks[0], 4)).toBeNull();
    expect(checkMessage(checks.checks[0], 7)).toBe('This screen uses 7 text sizes. Your screens use 3.5 to 4.5.');
  });
  it('treats a range stuck at 0 or spread wide as not clear', () => {
    expect(clearRange([0, 0])).toBe(false);
    expect(clearRange([2, 9])).toBe(false);
    expect(clearRange([3, 5])).toBe(true);
  });
  it('measures distance outside the range, scaled by the spread across libraries', () => {
    const checks = buildChecks(fp);
    expect(distance({ 'type.sizes': 4 }, checks, { 'type.sizes': 2 })).toBe(0);
    expect(distance({ 'type.sizes': 6.5 }, checks, { 'type.sizes': 2 })).toBe(1);
    expect(spreads([fp, fp, fp])['type.sizes']).toBeGreaterThan(0);
  });
  it('interpolates quantiles', () => {
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
  });
});
