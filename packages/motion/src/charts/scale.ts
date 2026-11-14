/** Scales and paths for the charts: plain maths, no DOM. */

/** Rounds to 2 decimals for compact SVG. */
export const r2 = (n: number): number => Math.round(n * 100) / 100;

/** A "nice" step (1, 2, 2.5 or 5 times a power of ten) for about `count` intervals over `span`. */
export function niceStep(span: number, count: number): number {
  if (!(span > 0)) return 1;
  const raw = span / Math.max(1, count);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
}

/** Tick values covering [min, max] with nice steps; the first and last are the axis ends. */
export function niceTicks(min: number, max: number, count = 4): number[] {
  let lo = min;
  let hi = max;
  if (lo === hi) {
    if (lo === 0) hi = 1;
    else if (lo > 0) lo = 0;
    else hi = 0;
  }
  const step = niceStep(hi - lo, count);
  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) ticks.push(Number(v.toPrecision(12)));
  return ticks;
}

/** The value range a chart shows: from 0 when the data is all on one side of it (bars and areas always). */
export function domain(values: number[], fromZero: boolean): [number, number] {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  if (fromZero) return [Math.min(0, lo), Math.max(0, hi)];
  // A line starts at 0 too, unless its values sit far from it (0 would flatten them)
  if (lo >= 0 && lo < hi * 0.5) return [0, hi];
  if (hi <= 0 && hi > lo * 0.5) return [lo, 0];
  return [lo, hi];
}

type Point = [number, number];

/** A straight polyline through the points. */
export function linearPath(points: Point[]): string {
  return points.map(([x, y], i) => `${i ? 'L' : 'M'}${r2(x)} ${r2(y)}`).join('');
}

/**
 * A smooth curve through the points that never overshoots them (monotone cubic interpolation,
 * Fritsch–Carlson), so a smooth line never shows a value the data doesn't have.
 */
export function monotonePath(points: Point[]): string {
  const n = points.length;
  if (n < 3) return linearPath(points);
  const dx: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(points[i + 1][0] - points[i][0]);
    m.push(dx[i] === 0 ? 0 : (points[i + 1][1] - points[i][1]) / dx[i]);
  }
  const t: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) {
    t.push(m[i - 1] * m[i] <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]));
  }
  t.push(m[n - 2]);
  let d = `M${r2(points[0][0])} ${r2(points[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const h = dx[i] / 3;
    d += `C${r2(x0 + h)} ${r2(y0 + t[i] * h)} ${r2(x1 - h)} ${r2(y1 - t[i + 1] * h)} ${r2(x1)} ${r2(y1)}`;
  }
  return d;
}

/** Indices of the x labels to show when there isn't room for all of them (always the first and last). */
export function labelIndices(count: number, room: number): number[] {
  if (count <= room) return [...Array(count).keys()];
  const step = Math.ceil((count - 1) / Math.max(1, room - 1));
  const out: number[] = [];
  for (let i = 0; i < count; i += step) out.push(i);
  if (out[out.length - 1] !== count - 1) {
    if (count - 1 - out[out.length - 1] < step / 2) out.pop();
    out.push(count - 1);
  }
  return out;
}
