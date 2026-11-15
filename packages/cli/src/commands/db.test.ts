import { describe, expect, it } from 'vitest';
import { assertSeedTarget, seedEnvironment } from './db';

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

describe('where `db seed` will run', () => {
  const REMOTE = 'postgres://app:secret@db.example.com:5432/app';

  it('refuses a database on another machine when the seeds would run as development by default', () => {
    expect(() => assertSeedTarget(REMOTE, 'development', false)).toThrowError(expect.objectContaining({ code: 'cli/seed-target-unclear' }));
    expect(() => assertSeedTarget('postgres://app:secret@10.0.4.12:5432/app', 'development', false)).toThrowError(expect.objectContaining({ code: 'cli/seed-target-unclear' }));
    // The message names the database without its password
    try {
      assertSeedTarget(REMOTE, 'development', false);
    } catch (error) {
      expect((error as Error).message).toContain('db.example.com');
      expect((error as Error).message).not.toContain('secret');
    }
  });

  it('runs once a person has said what the database is, and always for a local one', () => {
    expect(() => assertSeedTarget(REMOTE, 'development', true)).not.toThrow();
    expect(() => assertSeedTarget(REMOTE, 'staging', false)).not.toThrow();
    expect(() => assertSeedTarget(REMOTE, 'production', false)).not.toThrow();
    // This machine, or a service on a container network (a name with no dot)
    for (const local of ['postgres://postgres:postgres@localhost:5432/app', 'postgres://postgres:postgres@127.0.0.1:5432/app', 'postgres://postgres:postgres@postgres:5432/app']) {
      expect(() => assertSeedTarget(local, 'development', false)).not.toThrow();
    }
  });
});
