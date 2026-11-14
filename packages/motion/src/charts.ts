/**
 * @mariachi/motion's chart set: line, area, bar, donut and sparkline charts as SVG, plus a stat (a
 * number that counts up, with its change). No dependencies; `chart()` runs in Node and the browser.
 *
 * ```ts
 * import { chart } from './design/motion/charts.js'; // mariachi-lint-ignore (a project's copy)
 * el.innerHTML = chart({ kind: 'line', title: 'Revenue', labels: months, series: [{ name: '2026', values }] });
 * ```
 *
 * The markup is a `<figure class="m-chart">` holding the SVG (with its `<title>` and `<desc>`) and a
 * visually hidden table of the data, so every label and value is real text for screen readers.
 * motion.css colours it from the language's tokens (`--m-chart-1` … `--m-chart-5`, its neutrals)
 * and animates it: lines draw on, bars grow from their base one after another, donuts sweep.
 * `updateChart(el, spec)` animates a drawn chart to new data.
 */
import { domain, labelIndices, linearPath, monotonePath, niceTicks, r2 } from './charts/scale';
import { MotionError } from './errors';
import { easeOut, lerp, parseDuration } from './number';

export type ChartKind = 'line' | 'area' | 'bar' | 'donut' | 'sparkline' | 'stat';

export interface ChartSeries {
  name: string;
  values: number[];
}

export interface ChartSpec {
  kind: ChartKind;
  /** What the chart shows: its accessible name (the SVG's <title>, the table's caption, a stat's label). */
  title: string;
  /** A sentence for screen readers (the SVG's <desc>). Default: a summary of the data. */
  description?: string;
  /** One or more series (up to five colours; more repeat them), or the values of one. */
  series?: ChartSeries[] | number[];
  /** The x labels (line, area, bar) or the segment names (donut). */
  labels?: string[];
  /** Intl.NumberFormat options for values (`{ style: 'currency', currency: 'EUR' }`). */
  format?: Intl.NumberFormatOptions;
  locale?: string;
  /** Size of the drawing in px (it scales to its container's width). */
  width?: number;
  height?: number;
  /** Line and area charts: smooth (default) or straight lines. */
  curve?: 'smooth' | 'linear';
  /** False draws it in place with no animation (updateChart uses this between frames). */
  animate?: boolean;
  /** A stable id for the SVG's title and gradients. Default: generated. */
  id?: string;
  /** Stat: the number. */
  value?: number;
  /** Stat: the change as a fraction (0.124 is 12.4%). */
  change?: number;
  /** Stat: what the change compares with ("vs last month"). */
  changeLabel?: string;
  /** Stat: whether up is good (default) or down is (costs, errors, churn). */
  goodWhen?: 'up' | 'down';
  /** Donut: the word under the total. Default "Total". */
  totalLabel?: string;
}

const KINDS: ChartKind[] = ['line', 'area', 'bar', 'donut', 'sparkline', 'stat'];

const esc = (s: string | number): string =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let counter = 0;

/** One to five, the series colour slot for the nth series (more than five repeat). */
const slot = (i: number) => (i % 5) + 1;

function seriesOf(spec: ChartSpec): ChartSeries[] {
  const s = spec.series ?? [];
  if (s.length === 0) return [];
  return typeof s[0] === 'number' ? [{ name: spec.title, values: s as number[] }] : (s as ChartSeries[]);
}

function formatters(spec: ChartSpec) {
  const locale = spec.locale ?? 'en-US';
  const value = new Intl.NumberFormat(locale, spec.format);
  const { style, currency, unit } = spec.format ?? {};
  const axis = new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
    ...(style ? { style, currency, unit } : {}),
    ...(style === 'percent' ? { maximumFractionDigits: 0, notation: 'standard' } : {}),
  } as Intl.NumberFormatOptions);
  return { value: (n: number) => value.format(n), axis: (n: number) => axis.format(n) };
}

function svgOpen(id: string, w: number, h: number, title: string, desc: string, hidden = false): string {
  const a11y = hidden ? 'aria-hidden="true"' : `role="img" aria-labelledby="${id}-t ${id}-d"`;
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" ${a11y} focusable="false"><title id="${id}-t">${esc(title)}</title><desc id="${id}-d">${esc(desc)}</desc>`;
}

function table(spec: ChartSpec, series: ChartSeries[], labels: string[], fmt: (n: number) => string): string {
  const head = series.map((s) => `<th scope="col">${esc(s.name)}</th>`).join('');
  const rows = labels
    .map((label, i) => `<tr><th scope="row">${esc(label)}</th>${series.map((s) => `<td>${s.values[i] === undefined ? '' : esc(fmt(s.values[i]))}</td>`).join('')}</tr>`)
    .join('');
  return `<table class="m-chart-table"><caption>${esc(spec.title)}</caption><thead><tr><td></td>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}

function legend(items: { name: string; value?: string }[]): string {
  return `<ul class="m-chart-legend" aria-hidden="true">${items
    .map((it, i) => `<li data-series="${slot(i)}"><span>${esc(it.name)}</span>${it.value ? `<span class="m-chart-legend-value">${esc(it.value)}</span>` : ''}</li>`)
    .join('')}</ul>`;
}

/** The spec as stored on the figure for updateChart (functions and ids left out). */
function stored(spec: ChartSpec): string {
  const { id: _id, animate: _animate, ...rest } = spec;
  return esc(JSON.stringify(rest));
}

function figure(spec: ChartSpec, body: string): string {
  return `<figure class="m-chart" data-kind="${spec.kind}"${spec.animate === false ? ' data-static' : ''} data-m-chart="${stored(spec)}">${body}</figure>`;
}

function summary(kind: string, series: ChartSeries[], labels: string[], fmt: (n: number) => string): string {
  const range = labels.length > 1 ? ` from ${labels[0]} to ${labels[labels.length - 1]}` : '';
  const parts = series.slice(0, 3).map((s) => {
    const hi = Math.max(...s.values);
    return `${s.name}: ${fmt(s.values[0])} to ${fmt(s.values[s.values.length - 1])}, highest ${fmt(hi)}${labels.length ? ` (${labels[s.values.indexOf(hi)] ?? ''})` : ''}.`;
  });
  return `${kind}${range}. ${parts.join(' ')}`.trim();
}

// ---------------------------------------------------------------------------------------------
// Line, area and sparkline

function lineChart(spec: ChartSpec, id: string): string {
  const series = seriesOf(spec);
  const spark = spec.kind === 'sparkline';
  const area = spec.kind === 'area';
  const n = Math.max(...series.map((s) => s.values.length));
  const labels = spec.labels ?? [...Array(n).keys()].map((i) => String(i + 1));
  const fmt = formatters(spec);
  const w = spec.width ?? (spark ? 120 : 640);
  const h = spec.height ?? (spark ? 32 : 240);
  const all = series.flatMap((s) => s.values);
  const [lo0, hi0] = domain(all, area);
  const ticks = spark ? [lo0, hi0 === lo0 ? lo0 + 1 : hi0] : niceTicks(lo0, hi0, 4);
  const lo = ticks[0];
  const hi = ticks[ticks.length - 1];
  const yLabels = ticks.map(fmt.axis);
  const left = spark ? 3 : Math.max(...yLabels.map((l) => l.length)) * 7 + 12;
  const right = spark ? 4 : 10;
  const top = spark ? 4 : 10;
  const bottom = spark ? 4 : 28;
  const pw = w - left - right;
  const ph = h - top - bottom;
  const x = (i: number) => left + (n > 1 ? (i / (n - 1)) * pw : pw / 2);
  const y = (v: number) => top + ph - ((v - lo) / (hi - lo || 1)) * ph;
  const curve = spec.curve === 'linear' ? linearPath : monotonePath;

  let grid = '';
  if (!spark) {
    grid = ticks
      .map((t, i) => {
        const ty = r2(y(t));
        const cls = i === 0 ? 'm-chart-baseline' : 'm-chart-grid';
        return `<line class="${cls}" x1="${left}" x2="${w - right}" y1="${ty}" y2="${ty}"/><text class="m-chart-axis" x="${left - 10}" y="${r2(ty + 4)}" text-anchor="end">${esc(yLabels[i])}</text>`;
      })
      .join('');
    const shown = labelIndices(n, Math.max(2, Math.floor(pw / 64)));
    grid += shown
      .map((i) => {
        const anchor = n > 1 && i === 0 ? 'start' : n > 1 && i === n - 1 ? 'end' : 'middle';
        return `<text class="m-chart-axis" x="${r2(x(i))}" y="${h - 8}" text-anchor="${anchor}">${esc(labels[i] ?? '')}</text>`;
      })
      .join('');
  }

  const paths = series
    .map((s, k) => {
      const pts = s.values.map((v, i) => [x(i), y(v)] as [number, number]);
      const d = curve(pts);
      const last = pts[pts.length - 1];
      let g = `<g data-series="${slot(k)}" style="--i:${k}">`;
      if (area) {
        const gid = `${id}-g${k}`;
        g += `<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop class="m-chart-stop" offset="0" stop-opacity="0.28"/><stop class="m-chart-stop" offset="1" stop-opacity="0"/></linearGradient>`;
        g += `<path class="m-chart-area" fill="url(#${gid})" d="${d}L${r2(last[0])} ${r2(y(Math.max(lo, 0)))}L${r2(pts[0][0])} ${r2(y(Math.max(lo, 0)))}Z"/>`;
      }
      g += `<path class="m-chart-line" pathLength="1" d="${d}"/>`;
      if (last) g += `<circle class="m-chart-dot" cx="${r2(last[0])}" cy="${r2(last[1])}" r="${spark ? 2.5 : 4}"/>`;
      return `${g}</g>`;
    })
    .join('');

  const kindName = spark ? 'Trend' : area ? 'Area chart' : 'Line chart';
  const desc = spec.description ?? summary(kindName, series, spark ? [] : labels, fmt.value);
  const svg = `${svgOpen(id, w, h, spec.title, desc)}${grid}${paths}</svg>`;
  const key = series.length > 1 ? legend(series.map((s) => ({ name: s.name }))) : '';
  return figure(spec, `${key}${svg}${table(spec, series, labels, fmt.value)}`);
}

// ---------------------------------------------------------------------------------------------
// Bar

function barChart(spec: ChartSpec, id: string): string {
  const series = seriesOf(spec);
  const n = Math.max(...series.map((s) => s.values.length));
  const labels = spec.labels ?? [...Array(n).keys()].map((i) => String(i + 1));
  const fmt = formatters(spec);
  const w = spec.width ?? 640;
  const h = spec.height ?? 240;
  const [lo0, hi0] = domain(series.flatMap((s) => s.values), true);
  const ticks = niceTicks(lo0, hi0, 4);
  const lo = ticks[0];
  const hi = ticks[ticks.length - 1];
  const yLabels = ticks.map(fmt.axis);
  const left = Math.max(...yLabels.map((l) => l.length)) * 7 + 12;
  const right = 4;
  const top = 10;
  const bottom = 28;
  const pw = w - left - right;
  const ph = h - top - bottom;
  const y = (v: number) => top + ph - ((v - lo) / (hi - lo || 1)) * ph;
  const band = pw / n;
  const group = Math.min(band * 0.72, 56 * series.length);
  const gap = series.length > 1 ? Math.min(4, group * 0.06) : 0;
  const bw = (group - gap * (series.length - 1)) / series.length;
  const base = y(0);

  let out = ticks
    .map((t, i) => {
      const ty = r2(y(t));
      const cls = t === 0 ? 'm-chart-baseline' : 'm-chart-grid';
      return `<line class="${cls}" x1="${left}" x2="${w - right}" y1="${ty}" y2="${ty}"/><text class="m-chart-axis" x="${left - 10}" y="${r2(ty + 4)}" text-anchor="end">${esc(yLabels[i])}</text>`;
    })
    .join('');
  const shown = new Set(labelIndices(n, Math.max(2, Math.floor(pw / 56))));
  out += labels
    .map((label, i) => (shown.has(i) ? `<text class="m-chart-axis" x="${r2(left + band * (i + 0.5))}" y="${h - 8}" text-anchor="middle">${esc(label)}</text>` : ''))
    .join('');
  series.forEach((s, k) => {
    out += `<g data-series="${slot(k)}">`;
    s.values.forEach((v, i) => {
      const bx = left + band * i + (band - group) / 2 + k * (bw + gap);
      const top = Math.min(y(v), base);
      const bh = Math.max(Math.abs(y(v) - base), v === 0 ? 0 : 1);
      out += `<rect class="m-chart-bar" x="${r2(bx)}" y="${r2(top)}" width="${r2(bw)}" height="${r2(bh)}" rx="2"${v < 0 ? ' data-negative' : ''} style="--i:${i * series.length + k}"><title>${esc(`${labels[i] ?? ''}${series.length > 1 ? ` · ${s.name}` : ''}: ${fmt.value(v)}`)}</title></rect>`;
    });
    out += '</g>';
  });
  const desc = spec.description ?? summary('Bar chart', series, labels, fmt.value);
  const svg = `${svgOpen(id, w, h, spec.title, desc)}${out}</svg>`;
  const key = series.length > 1 ? legend(series.map((s) => ({ name: s.name }))) : '';
  return figure(spec, `${key}${svg}${table(spec, series, labels, fmt.value)}`);
}

// ---------------------------------------------------------------------------------------------
// Donut

function donutChart(spec: ChartSpec, id: string): string {
  const [first] = seriesOf(spec);
  const values = first.values.map((v) => Math.max(0, v));
  const labels = spec.labels ?? values.map((_, i) => `${i + 1}`);
  const fmt = formatters(spec);
  const total = values.reduce((a, b) => a + b, 0);
  const pct = new Intl.NumberFormat(spec.locale ?? 'en-US', { style: 'percent', maximumFractionDigits: 0 });
  const size = 200;
  const c = size / 2;
  const r = 78;
  const gap = values.filter((v) => v > 0).length > 1 ? 0.8 : 0;
  let at = 0;
  const arcs = values
    .map((v, i) => {
      const share = total ? (v / total) * 100 : 0;
      const dash = Math.max(share - gap, 0);
      const arc = `<circle class="m-chart-arc" data-series="${slot(i)}" cx="${c}" cy="${c}" r="${r}" pathLength="100" stroke-width="24" stroke-dasharray="${r2(dash)} ${r2(100 - dash)}" stroke-dashoffset="${r2(-at)}" transform="rotate(-90 ${c} ${c})" style="--_at:${r2(at / 100)};--_share:${r2(share / 100)}"><title>${esc(`${labels[i]}: ${fmt.value(v)} (${pct.format(total ? v / total : 0)})`)}</title></circle>`;
      at += share;
      return share > 0 ? arc : '';
    })
    .join('');
  const centre = `<text class="m-chart-total" x="${c}" y="${c - 4}" text-anchor="middle" dominant-baseline="central">${esc(fmt.axis(total))}</text><text class="m-chart-total-label" x="${c}" y="${c + 22}" text-anchor="middle">${esc(spec.totalLabel ?? 'Total')}</text>`;
  const largest = values.indexOf(Math.max(...values));
  const desc =
    spec.description ?? `Donut chart, total ${fmt.value(total)}. Largest: ${labels[largest]}, ${pct.format(total ? values[largest] / total : 0)}.`;
  const svg = `${svgOpen(id, size, size, spec.title, desc)}${arcs}${centre}</svg>`;
  const key = legend(labels.map((name, i) => ({ name, value: `${fmt.value(values[i] ?? 0)} · ${pct.format(total ? (values[i] ?? 0) / total : 0)}` })));
  return figure(spec, `${svg}${key}${table(spec, [{ name: first.name, values }], labels, fmt.value)}`);
}

// ---------------------------------------------------------------------------------------------
// Stat

const ARROW = '<svg viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M5 1.5 9 8.5H1Z"/></svg>';

function statChart(spec: ChartSpec, id: string): string {
  const fmt = formatters(spec);
  const value = spec.value ?? 0;
  const counting = spec.animate === false ? '' : ` data-count-up data-count-to="${value}"${spec.format ? ` data-count-format="${esc(JSON.stringify(spec.format))}"` : ''}${spec.locale ? ` data-count-locale="${esc(spec.locale)}"` : ''}`;
  let body = `<p class="m-chart-label" id="${id}-t">${esc(spec.title)}</p><p class="m-chart-value"${counting}>${esc(fmt.value(value))}</p>`;
  if (spec.change !== undefined) {
    const up = spec.change > 0;
    const flat = spec.change === 0;
    const good = flat ? 'flat' : up === ((spec.goodWhen ?? 'up') === 'up') ? 'good' : 'bad';
    const pct = new Intl.NumberFormat(spec.locale ?? 'en-US', { style: 'percent', maximumFractionDigits: 1 }).format(Math.abs(spec.change));
    const arrow = flat ? '' : up ? ARROW : ARROW.replace('<path', '<path transform="rotate(180 5 5)"');
    body += `<p class="m-chart-change"><span class="m-chart-delta" data-trend="${good}">${arrow}<span class="m-sr-only">${flat ? 'No change' : up ? 'Up' : 'Down'} </span>${pct}</span>${spec.changeLabel ? `<span>${esc(spec.changeLabel)}</span>` : ''}</p>`;
  }
  const [trend] = seriesOf(spec);
  if (trend?.values.length) {
    const spark = lineChart({ kind: 'sparkline', title: spec.title, series: [trend], width: 240, height: 40, animate: spec.animate, id: `${id}-s` }, `${id}-s`);
    // Only its drawing: the number above says what it shows
    body += /<svg[\s\S]*<\/svg>/.exec(spark)?.[0].replace(/role="img" aria-labelledby="[^"]*"/, 'aria-hidden="true"') ?? '';
  }
  return figure(spec, body);
}

// ---------------------------------------------------------------------------------------------

/**
 * A chart as markup: a `<figure class="m-chart">` with the SVG and a table of its data (a stat is
 * text, with an optional sparkline). Throws a MotionError for an unknown kind or a chart with no data.
 */
export function chart(spec: ChartSpec): string {
  if (!KINDS.includes(spec.kind)) {
    throw new MotionError('motion/invalid-chart', `Unknown chart kind "${spec.kind}". Kinds: ${KINDS.join(', ')}`, { kind: spec.kind });
  }
  const series = seriesOf(spec);
  if (spec.kind !== 'stat' && (series.length === 0 || series.every((s) => s.values.length === 0))) {
    throw new MotionError('motion/invalid-chart', `A ${spec.kind} chart needs series with values`, { kind: spec.kind });
  }
  const id = spec.id ?? `m-chart-${++counter}`;
  if (spec.kind === 'bar') return barChart(spec, id);
  if (spec.kind === 'donut') return donutChart(spec, id);
  if (spec.kind === 'stat') return statChart(spec, id);
  return lineChart(spec, id);
}

/** A spec between two of the same shape: every value (and a stat's value and change) at `t`. */
export function interpolateSpec(from: ChartSpec, to: ChartSpec, t: number): ChartSpec {
  const a = seriesOf(from);
  return {
    ...to,
    series: seriesOf(to).map((s, k) => ({ ...s, values: s.values.map((v, i) => lerp(a[k]?.values[i] ?? v, v, t)) })),
    ...(to.value !== undefined ? { value: lerp(from.value ?? to.value, to.value, t) } : {}),
    ...(to.change !== undefined ? { change: lerp(from.change ?? to.change, to.change, t) } : {}),
  };
}

/** True when two specs have the same kind and series lengths, so one can animate into the other. */
export function sameShape(a: ChartSpec, b: ChartSpec): boolean {
  const sa = seriesOf(a);
  const sb = seriesOf(b);
  return a.kind === b.kind && sa.length === sb.length && sa.every((s, i) => s.values.length === sb[i].values.length);
}

/**
 * Animates a drawn chart (`el` is its `.m-chart` figure or contains one) to new data over the
 * language's `--m-chart-draw`. A chart of a different shape is drawn afresh; under reduced
 * motion the new data appears at once. Browser only.
 */
export function updateChart(el: Element, spec: ChartSpec): Promise<void> {
  const fig = el.matches('.m-chart') ? el : el.querySelector('.m-chart');
  if (!fig) return Promise.reject(new MotionError('motion/no-element', 'updateChart: no .m-chart in the element'));
  let previous: ChartSpec | undefined;
  try {
    previous = JSON.parse(fig.getAttribute('data-m-chart') ?? '') as ChartSpec;
  } catch {
    previous = undefined;
  }
  const id = spec.id ?? fig.querySelector('[id$="-t"]')?.id.replace(/-t$/, '') ?? undefined;
  const render = (s: ChartSpec, animate: boolean) => {
    const holder = fig.ownerDocument.createElement('div');
    holder.innerHTML = chart({ ...s, id, animate });
    const next = holder.firstElementChild;
    if (!next) return;
    for (const name of ['data-kind', 'data-m-chart', 'data-static']) {
      const v = next.getAttribute(name);
      if (v === null) fig.removeAttribute(name);
      else fig.setAttribute(name, v);
    }
    fig.replaceChildren(...next.childNodes);
  };
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !previous || !sameShape(previous, spec) || typeof requestAnimationFrame !== 'function') {
    render(spec, !reduced && !(previous && sameShape(previous, spec)));
    return Promise.resolve();
  }
  const from = previous;
  const duration = parseDuration(getComputedStyle(fig).getPropertyValue('--m-chart-draw'), 600);
  return new Promise((resolve) => {
    const start = performance.now();
    const frame = (now: number) => {
      const t = duration > 0 ? (now - start) / duration : 1;
      if (t >= 1) {
        render(spec, false);
        resolve();
        return;
      }
      render(interpolateSpec(from, spec, easeOut(t)), false);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}
