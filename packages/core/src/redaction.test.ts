import { describe, expect, it } from 'vitest';
import { REDACT, redactForOutput } from './redaction';

const holder = (fields: Record<string, unknown>, shown: Record<string, unknown>) => {
  const value = { ...fields };
  Object.defineProperty(value, REDACT, { value: () => shown, enumerable: false });
  return value;
};

describe('redactForOutput', () => {
  const database = holder({ url: 'postgres://app:pw@db/app', poolMax: 5 }, { url: 'postgres://app:***@db/app', poolMax: 5 });

  it('returns the very same value when nothing in it declares a redacted form', () => {
    const plain = { a: 1, list: [{ b: 2 }], when: new Date(0), err: new Error('x') };
    expect(redactForOutput(plain)).toBe(plain);
    expect(redactForOutput('text')).toBe('text');
    expect(redactForOutput(null)).toBeNull();
  });

  it('replaces an object that declares one: itself, nested, in a list, and each time it appears', () => {
    expect(redactForOutput(database)).toEqual({ url: 'postgres://app:***@db/app', poolMax: 5 });
    const shared = { database };
    const input = { first: shared, second: shared, list: [database, 1], untouched: { n: 1 } };
    const output = redactForOutput(input);
    expect(JSON.stringify(output)).not.toContain(':pw@');
    expect(output.first.database.url).toBe('postgres://app:***@db/app');
    expect(output.second.database.url).toBe('postgres://app:***@db/app');
    expect((output.list[0] as typeof database).url).toBe('postgres://app:***@db/app');
    // What needed no change is the same object, and the input is as it was
    expect(output.untouched).toBe(input.untouched);
    expect(input.first.database.url).toBe('postgres://app:pw@db/app');
    expect(database.url).toBe('postgres://app:pw@db/app');
  });

  it('keeps an error an error, with its message and stack, and looks in its properties and its cause', () => {
    class StartError extends Error {}
    const cause = Object.assign(new Error('refused'), { database });
    const err = Object.assign(new StartError('could not start', { cause }), { settings: { database } });
    const output = redactForOutput({ err }).err;
    expect(output).toBeInstanceOf(StartError);
    expect(output).not.toBe(err);
    expect(output.message).toBe('could not start');
    expect(output.stack).toBe(err.stack);
    expect(output.settings.database.url).toBe('postgres://app:***@db/app');
    expect((output.cause as typeof cause).database.url).toBe('postgres://app:***@db/app');
    expect(err.settings.database.url).toBe('postgres://app:pw@db/app');
  });

  it('ends on a cycle, and leaves class instances to whoever serialises them', () => {
    const loop: Record<string, unknown> = { database };
    loop.self = loop;
    const output = redactForOutput(loop) as { database: { url: string } };
    expect(output.database.url).toBe('postgres://app:***@db/app');

    class Client {
      settings = database;
    }
    const client = new Client();
    expect(redactForOutput({ client }).client).toBe(client);
  });

  it('stops looking past the depth it is given', () => {
    const deep = { a: { b: { c: { database } } } };
    expect(redactForOutput(deep, 2)).toBe(deep);
    expect(redactForOutput(deep, 4).a.b.c.database.url).toBe('postgres://app:***@db/app');
  });
});
