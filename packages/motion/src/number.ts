/**
 * Number helpers shared by countUp() and the charts: no DOM, so they're tested directly.
 */

/** A number as it was written: what's around it and how it's grouped, so a count-up keeps the look. */
export interface WrittenNumber {
  prefix: string;
  value: number;
  suffix: string;
  decimals: number;
  grouped: boolean;
}

/**
 * Reads the first number in a piece of text, keeping its prefix and suffix ("$12,400.50 /mo" →
 * prefix "$", 12400.5, suffix " /mo", 2 decimals, grouped). Undefined when there's no number.
 */
export function parseWritten(text: string): WrittenNumber | undefined {
  const match = /(-|−)?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?/.exec(text);
  if (!match) return undefined;
  const [whole, sign, int, frac] = match;
  const value = Number(`${sign ? '-' : ''}${int.replace(/,/g, '')}${frac ? `.${frac}` : ''}`);
  return {
    prefix: text.slice(0, match.index),
    value,
    suffix: text.slice(match.index + whole.length),
    decimals: frac?.length ?? 0,
    grouped: int.includes(','),
  };
}

/** `value` written the way `like` was written. */
export function formatWritten(like: WrittenNumber, value: number): string {
  const fixed = Math.abs(value).toFixed(like.decimals);
  const [int, frac] = fixed.split('.');
  const grouped = like.grouped ? int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : int;
  const sign = value < 0 && Number(fixed) !== 0 ? '-' : '';
  return `${like.prefix}${sign}${grouped}${frac ? `.${frac}` : ''}${like.suffix}`;
}

/** Deceleration for count-ups and chart updates (an ease-out cubic). */
export function easeOut(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return 1 - (1 - c) ** 3;
}

/** A CSS time ("240ms", "0.24s", "calc(…)" is not handled) in milliseconds, or the fallback. */
export function parseDuration(value: string | null | undefined, fallback: number): number {
  const v = (value ?? '').trim();
  const m = /^(-?[\d.]+)(ms|s)$/.exec(v);
  if (!m) return fallback;
  const n = Number(m[1]) * (m[2] === 's' ? 1000 : 1);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** The value between `from` and `to` at `t` (0 to 1). */
export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}
