/**
 * From measured screens to `fingerprint.json` and `checks.json`, and the distance between a screen and a
 * library, as `docs/design-fingerprint.md` (spec 1) defines them. Node-side; the probe is in `probe.ts`.
 */
import type { MeasureValue, ScreenMeasures } from './probe';

export const SPEC_VERSION = 1;
export const WIDTHS = { wide: [1440, 900], narrow: [1024, 768], phone: [390, 844] } as const;
export type WidthName = keyof typeof WIDTHS;
export const KINDS = ['list', 'detail', 'form', 'dashboard', 'settings', 'dialog', 'firstUse', 'empty', 'error', 'loading', 'marketing'] as const;
export type ScreenKind = (typeof KINDS)[number];

/** A language's recipes as screens of the inventory. */
export const RECIPE_KINDS: Record<string, ScreenKind[]> = {
  dashboard: ['dashboard'],
  'list-detail': ['list', 'detail'],
  onboarding: ['firstUse'],
  settings: ['settings'],
  'empty-state': ['empty'],
  pricing: ['marketing'],
  errors: ['error'],
};

/** One screen measured at one width. */
export interface MeasuredScreen { id: string; kinds: ScreenKind[]; width: WidthName; result: ScreenMeasures }

export interface Stat { typical: number; range: [number, number]; n: number }
export interface MeasureSummary {
  unit: 'number' | 'shares' | 'counts' | 'label';
  typical: number | Record<string, number>;
  range?: [number, number];
  n: number;
  byKind: Record<string, { typical: number | Record<string, number>; range?: [number, number]; n: number }>;
  byWidth: Record<string, { typical: number | Record<string, number>; range?: [number, number]; n: number }>;
  evidence: 'observed';
}
export interface Fingerprint {
  specVersion: number;
  library: string;
  source: { mode: 'language' | 'existing' | 'url' | 'project'; commit?: string; measuredAt: string };
  screens: { id: string; kind: ScreenKind[]; widths: WidthName[] }[];
  measures: Record<string, MeasureSummary>;
}
export interface Check { id: string; measure: string; normal: { all: [number, number]; byKind: Record<string, [number, number]> }; message: string }
export interface Checks { specVersion: number; library: string; checks: Check[] }

/** The value at fraction `p` of the sorted values (linear between neighbours). */
export function quantile(xs: number[], p: number): number {
  const s = [...xs].sort((a, b) => a - b);
  if (!s.length) return Number.NaN;
  const i = (s.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return s[lo] + (s[hi] - s[lo]) * (i - lo);
}
const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** How a measure's values combine: numbers as median and range; share and count maps by key; labels as shares. */
function summarise(values: MeasureValue[]): { unit: MeasureSummary['unit']; typical: number | Record<string, number>; range?: [number, number]; n: number } | null {
  const vs = values.filter((v) => v !== null && v !== undefined);
  if (!vs.length) return null;
  if (typeof vs[0] === 'number') {
    const ns = vs as number[];
    return { unit: 'number', typical: r3(quantile(ns, 0.5)), range: [r3(quantile(ns, 0.1)), r3(quantile(ns, 0.9))], n: ns.length };
  }
  if (typeof vs[0] === 'string') {
    const c: Record<string, number> = {};
    for (const v of vs as string[]) c[v] = (c[v] ?? 0) + 1;
    return { unit: 'label', typical: Object.fromEntries(Object.entries(c).map(([k, v]) => [k, r3(v / vs.length)])), n: vs.length };
  }
  // Maps: shares (values ≤ 1 that sum to about 1) are averaged per key; anything else (px by bucket, counts) is a median per key.
  const maps = vs as Record<string, number>[];
  const keys = [...new Set(maps.flatMap((o) => Object.keys(o)))];
  const isShares = maps.every((o) => Object.values(o).every((x) => x >= 0 && x <= 1));
  const typical = Object.fromEntries(keys.map((k) => {
    const xs = maps.map((o) => o[k] ?? 0);
    return [k, r3(isShares ? xs.reduce((a, b) => a + b, 0) / xs.length : quantile(xs, 0.5))];
  }));
  return { unit: isShares ? 'shares' : 'counts', typical, n: maps.length };
}

/** `fingerprint.json` from the screens measured for one library. */
export function buildFingerprint(library: string, screens: MeasuredScreen[], source: Fingerprint['source']): Fingerprint {
  const ids = [...new Set(screens.flatMap((s) => Object.keys(s.result.measures)))].sort();
  const measures: Record<string, MeasureSummary> = {};
  for (const id of ids) {
    const all = summarise(screens.map((s) => s.result.measures[id]));
    if (!all) continue;
    const by = (pick: (s: MeasuredScreen) => string[]) => {
      const groups = new Map<string, MeasureValue[]>();
      for (const s of screens) for (const g of pick(s)) groups.set(g, [...(groups.get(g) ?? []), s.result.measures[id]]);
      const out: MeasureSummary['byKind'] = {};
      for (const [g, vs] of groups) { const x = summarise(vs); if (x) out[g] = { typical: x.typical, ...(x.range ? { range: x.range } : {}), n: x.n }; }
      return out;
    };
    measures[id] = { ...all, byKind: by((s) => s.kinds), byWidth: by((s) => [s.width]), evidence: 'observed' };
  }
  const screenIds = [...new Set(screens.map((s) => s.id))];
  return {
    specVersion: SPEC_VERSION,
    library,
    source,
    screens: screenIds.map((id) => ({ id, kind: screens.find((s) => s.id === id)!.kinds, widths: [...new Set(screens.filter((s) => s.id === id).map((s) => s.width))] })),
    measures,
  };
}

/** Plain words for each measure in a check's sentence. */
const MESSAGES: Record<string, string> = {
  'type.sizes': 'This screen uses {value} text sizes. Your screens use {low} to {high}.',
  'type.headingRatio': 'The largest text here is {value} times the body size. On your screens it’s {low} to {high} times.',
  'type.weights': 'This screen uses {value} font weights. Your screens use {low} to {high}.',
  'type.lineLength': 'Lines of body text here run about {value} characters. Yours run {low} to {high}.',
  'space.empty': 'About {pct} of this screen is empty space. Your screens leave {lowPct} to {highPct}.',
  'space.contentWidth': 'Content here spans {pct} of the window. Yours spans {lowPct} to {highPct}.',
  'space.contentWidthPx': 'Content here is {value}px wide. Yours is {low} to {high}px.',
  'space.gutter': 'Content starts {value}px from the edge here. Yours starts {low} to {high}px in.',
  'density.elements': 'This screen shows {value} elements at once. Yours show {low} to {high}.',
  'density.targets': 'This screen has {value} things to click. Yours have {low} to {high}.',
  'density.rowHeight': 'Rows here are {value}px tall. Yours are {low} to {high}px.',
  'density.rowsVisible': 'This list shows {value} rows at once. Yours show {low} to {high}.',
  'structure.depth': 'Panels nest {value} deep here. Yours nest {low} to {high} deep.',
  'structure.columns': 'This screen has {value} columns. Yours have {low} to {high}.',
  'colour.accentArea': 'The accent colour covers {pct} of this screen. On yours it covers {lowPct} to {highPct}.',
  'colour.hues': 'This screen uses {value} colours besides neutrals. Yours use {low} to {high}.',
  'emphasis.primaries': 'This screen has {value} main actions. Yours have {low} to {high}.',
  'icons.size': 'Icons here are {value}px. Yours are {low} to {high}px.',
  'media.area': 'Pictures cover {pct} of this screen. On yours they cover {lowPct} to {highPct}.',
  'words.headingLength': 'Headings here are {value} words long. Yours are {low} to {high}.',
  'words.buttonLength': 'Button labels here are {value} words. Yours are {low} to {high}.',
};

/** Whether a range is clear enough to check: the 90th percentile within twice the 10th. */
export function clearRange(range: [number, number]): boolean {
  const [lo, hi] = range;
  return lo > 0 && hi <= 2 * lo;
}

/** `checks.json`: the numeric measures with a clear range, by kind of screen where a kind has 3 or more values. */
export function buildChecks(fp: Fingerprint): Checks {
  // A kind gets its own range only when two or more distinct screens show it (not one screen at three widths)
  const screensByKind: Record<string, Set<string>> = {};
  for (const s of fp.screens) for (const k of s.kind) (screensByKind[k] ??= new Set()).add(s.id);
  const checks: Check[] = [];
  for (const [id, s] of Object.entries(fp.measures)) {
    if (s.unit !== 'number' || !s.range || s.n < 5 || !clearRange(s.range) || !MESSAGES[id]) continue;
    const byKind: Record<string, [number, number]> = {};
    for (const [k, v] of Object.entries(s.byKind)) if (v.range && v.n >= 3 && (screensByKind[k]?.size ?? 0) >= 2) byKind[k] = v.range;
    checks.push({ id, measure: id, normal: { all: s.range, byKind }, message: MESSAGES[id] });
  }
  return { specVersion: SPEC_VERSION, library: fp.library, checks };
}

/** The sentence for one value outside a check's range, or null when it's inside. */
export function checkMessage(check: Check, value: number, kinds: string[] = []): string | null {
  const range = kinds.map((k) => check.normal.byKind[k]).find(Boolean) ?? check.normal.all;
  const [low, high] = range;
  if (value >= low && value <= high) return null;
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  const fmt = (x: number) => (Number.isInteger(x) ? String(x) : String(Math.round(x * 10) / 10));
  return check.message
    .replace('{value}', fmt(value)).replace('{low}', fmt(low)).replace('{high}', fmt(high))
    .replace('{pct}', pct(value)).replace('{lowPct}', pct(low)).replace('{highPct}', pct(high));
}

/**
 * A screen's distance from a library: the root mean square, over the library's checks, of how far the value is
 * outside its normal range divided by that measure's spread across languages (0 inside the range).
 */
export function distance(values: Record<string, MeasureValue>, checks: Checks, spread: Record<string, number>, kinds: string[] = []): number {
  let sum = 0;
  let n = 0;
  for (const c of checks.checks) {
    const v = values[c.measure];
    if (typeof v !== 'number') continue;
    const [lo, hi] = kinds.map((k) => c.normal.byKind[k]).find(Boolean) ?? c.normal.all;
    const out = v < lo ? lo - v : v > hi ? v - hi : 0;
    const sp = spread[c.measure] || 1;
    sum += (out / sp) ** 2; n++;
  }
  return n ? Math.sqrt(sum / n) : 0;
}

/** Each numeric measure's spread across libraries: the 10th-to-90th percentile width of their typical values. */
export function spreads(fingerprints: Fingerprint[]): Record<string, number> {
  const out: Record<string, number> = {};
  const ids = new Set(fingerprints.flatMap((f) => Object.keys(f.measures)));
  for (const id of ids) {
    const t = fingerprints.map((f) => f.measures[id]).filter((m) => m?.unit === 'number').map((m) => m.typical as number);
    if (t.length >= 3) out[id] = Math.max(1e-6, quantile(t, 0.9) - quantile(t, 0.1));
  }
  return out;
}
