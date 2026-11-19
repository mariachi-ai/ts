import { z } from 'zod';
import { describe, expect, it } from 'vitest';
import { describeSchema, isSchema } from './schema';

describe('describeSchema', () => {
  it('spells out an object, with optional and defaulted keys marked', () => {
    const schema = z.object({
      id: z.string().uuid(),
      email: z.string().email(),
      name: z.string().trim().min(1),
      limit: z.coerce.number().int().min(1).default(20),
      score: z.number(),
      cursor: z.string().optional(),
      done: z.boolean(),
      at: z.date(),
    });
    expect(describeSchema(schema)).toBe('{ id: uuid, email: email, name: string, limit?: int, score: number, cursor?: string, done: boolean, at: date }');
  });

  it('reads enums, literals, unions, nullables, arrays and records', () => {
    expect(describeSchema(z.enum(['a', 'b']))).toBe("'a' | 'b'");
    expect(describeSchema(z.literal(true))).toBe('true');
    expect(describeSchema(z.union([z.string(), z.number()]).array())).toBe('(string | number)[]');
    expect(describeSchema(z.string().nullable())).toBe('string | null');
    expect(describeSchema(z.record(z.string(), z.number()))).toBe('Record<string, number>');
    expect(describeSchema(z.tuple([z.string(), z.number()]))).toBe('[string, number]');
    expect(describeSchema(z.discriminatedUnion('kind', [z.object({ kind: z.literal('a') }), z.object({ kind: z.literal('b'), n: z.number() })]))).toBe(
      "{ kind: 'a' } | { kind: 'b', n: number }",
    );
    expect(describeSchema(z.object({ a: z.string() }).and(z.object({ b: z.number() })))).toBe('{ a: string } & { b: number }');
  });

  it('sees through refinements, transforms, pipes, brands and partials', () => {
    expect(describeSchema(z.object({ a: z.string() }).refine(() => true))).toBe('{ a: string }');
    expect(describeSchema(z.string().transform((s) => s.length))).toBe('string');
    expect(describeSchema(z.string().pipe(z.string().email()))).toBe('string');
    expect(describeSchema(z.string().brand<'Id'>())).toBe('string');
    expect(describeSchema(z.object({ a: z.string(), b: z.number() }).partial())).toBe('{ a?: string, b?: number }');
    expect(describeSchema(z.object({ a: z.string().refine(() => true).optional() }))).toBe('{ a?: string }');
  });

  it('stops spelling out objects three levels down', () => {
    const deep = z.object({ a: z.object({ b: z.object({ c: z.object({ d: z.string() }) }) }) });
    expect(describeSchema(deep)).toBe('{ a: { b: { c: {…} } } }');
  });

  it('says void, empty and unknown plainly, and nothing for no schema', () => {
    expect(describeSchema(z.void())).toBe('void');
    expect(describeSchema(z.object({}))).toBe('{}');
    expect(describeSchema(z.unknown())).toBe('unknown');
    expect(describeSchema(undefined)).toBeUndefined();
    expect(describeSchema({ not: 'a schema' })).toBe('unknown');
  });

  it('reads a Zod 4 definition by its type', () => {
    const v4 = (def: Record<string, unknown>) => ({ _zod: { def } });
    const schema = v4({ type: 'object', shape: { id: v4({ type: 'string' }), tags: v4({ type: 'array', element: v4({ type: 'string' }) }), n: v4({ type: 'optional', innerType: v4({ type: 'number' }) }) } });
    expect(isSchema(schema)).toBe(true);
    expect(describeSchema(schema)).toBe('{ id: string, tags: string[], n?: number }');
  });
});
