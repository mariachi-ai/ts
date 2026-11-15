import { describe, expect, it } from 'vitest';
import { seedEnvironment } from './db';

describe('the environment `db seed` runs as', () => {
  it('is --env when given, whatever the process says', () => {
    expect(seedEnvironment('staging', 'production')).toBe('staging');
    expect(seedEnvironment('production', undefined)).toBe('production');
  });

  it('is NODE_ENV otherwise, so a production process does not seed as development', () => {
    expect(seedEnvironment(undefined, 'production')).toBe('production');
    expect(seedEnvironment(undefined, 'test')).toBe('test');
    expect(seedEnvironment('  ', 'production')).toBe('production');
  });

  it('is development when nothing says', () => {
    expect(seedEnvironment(undefined, undefined)).toBe('development');
    expect(seedEnvironment('', '')).toBe('development');
  });
});
