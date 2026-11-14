import { describe, expect, it } from 'vitest';
import { easeOut, formatWritten, lerp, parseDuration, parseWritten } from '../src/number';

describe('number helpers', () => {
  it('reads a number as written, keeping what is around it', () => {
    expect(parseWritten('$12,400.50 /mo')).toEqual({ prefix: '$', value: 12400.5, suffix: ' /mo', decimals: 2, grouped: true });
    expect(parseWritten('98.6%')).toMatchObject({ prefix: '', value: 98.6, suffix: '%', decimals: 1, grouped: false });
    expect(parseWritten('−42 points')).toMatchObject({ value: -42, suffix: ' points' });
    expect(parseWritten('no number')).toBeUndefined();
  });

  it('writes any value the same way', () => {
    const like = parseWritten('$12,400.50 /mo');
    expect(like).toBeDefined();
    if (!like) return;
    expect(formatWritten(like, 0)).toBe('$0.00 /mo');
    expect(formatWritten(like, 6123.456)).toBe('$6,123.46 /mo');
    expect(formatWritten(like, 12400.5)).toBe('$12,400.50 /mo');
    expect(formatWritten({ prefix: '', value: 0, suffix: '', decimals: 0, grouped: false }, -3.2)).toBe('-3');
  });

  it('eases out between 0 and 1, and clamps', () => {
    expect(easeOut(0)).toBe(0);
    expect(easeOut(1)).toBe(1);
    expect(easeOut(0.5)).toBeGreaterThan(0.5);
    expect(easeOut(2)).toBe(1);
    expect(lerp(10, 20, 0.25)).toBe(12.5);
  });

  it('reads CSS times', () => {
    expect(parseDuration('240ms', 0)).toBe(240);
    expect(parseDuration(' 0.6s', 0)).toBe(600);
    expect(parseDuration('calc(320ms * 5)', 7)).toBe(7);
    expect(parseDuration(undefined, 9)).toBe(9);
  });
});
