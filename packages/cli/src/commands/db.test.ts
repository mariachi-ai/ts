import { describe, expect, it } from 'vitest';
import { assertSeedTarget, databaseHosts, seedEnvironment } from './db';

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
    // This machine, a Unix socket, or a service on a container network (a name with no dot)
    for (const local of [
      'postgres://postgres:postgres@localhost:5432/app',
      'postgres://postgres:postgres@127.0.0.1:5432/app',
      'postgres://postgres:postgres@postgres:5432/app',
      'postgres:///app?host=/var/run/postgresql',
      'postgresql://app@%2Fvar%2Frun%2Fpostgresql/app',
    ]) {
      expect(() => assertSeedTarget(local, 'development', false)).not.toThrow();
    }
  });

  it('takes the host a URL without one reaches from its host= parameter, else PGHOST, else this machine', () => {
    expect(databaseHosts('postgres://app@db.example.com/app?host=/tmp', '10.0.0.9')).toEqual(['db.example.com']);
    expect(databaseHosts('postgres:///app?host=db.example.com', '/tmp')).toEqual(['db.example.com']);
    expect(databaseHosts('postgres:///app', 'db.example.com')).toEqual(['db.example.com']);
    expect(databaseHosts('postgres:///app', '')).toEqual(['localhost']);
    expect(databaseHosts('postgres:///app')).toEqual(['localhost']);
    expect(databaseHosts('postgres:///app?host=a.example.com,/tmp')).toEqual(['a.example.com', '/tmp']);
  });

  it('refuses a URL with no host when its host= parameter or PGHOST names another machine', () => {
    const unclear = expect.objectContaining({ code: 'cli/seed-target-unclear' });
    expect(() => assertSeedTarget('postgres://app:secret@/app?host=db.example.com', 'development', false)).toThrowError(unclear);
    expect(() => assertSeedTarget('postgres:///app', 'development', false, 'db.example.com')).toThrowError(unclear);
    expect(() => assertSeedTarget('postgres:///app', 'development', false, '10.0.4.12')).toThrowError(unclear);
    // Every host of a list has to be near
    expect(() => assertSeedTarget('postgres:///app', 'development', false, '/var/run/postgresql,db.example.com')).toThrowError(unclear);
    // The URL's own host decides, whatever the parameter says
    expect(() => assertSeedTarget('postgres://app@db.example.com/app?host=/var/run/postgresql', 'development', false)).toThrowError(unclear);
    // The message names the host the URL doesn't show
    expect(() => assertSeedTarget('postgres:///app', 'development', false, 'db.example.com')).toThrowError(/postgres:\/\/\/app, host db\.example\.com\) is not on this machine/);
    // --env still lets it run
    expect(() => assertSeedTarget('postgres:///app', 'development', true, 'db.example.com')).not.toThrow();
  });

  it('runs a URL with no host when what it falls back to is near', () => {
    for (const [url, pgHost] of [
      ['postgres:///app', undefined],
      ['postgres:///app', 'localhost'],
      ['postgres:///app', '127.0.0.1'],
      ['postgres:///app', '::1'],
      ['postgres:///app', '/var/run/postgresql'],
      ['postgres:///app', 'postgres'],
      ['postgres:///app?host=localhost', 'db.example.com'],
      ['postgres:///app?host=/tmp', 'db.example.com'],
      ['postgres://app@localhost/app', 'db.example.com'],
    ] as const) {
      expect(() => assertSeedTarget(url, 'development', false, pgHost), `${url} ${pgHost}`).not.toThrow();
    }
  });
});
