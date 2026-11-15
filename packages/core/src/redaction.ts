/**
 * An object that holds secrets can say how it should be shown: a method under this symbol that
 * returns a copy safe to print. `@mariachi/config` puts one on every part of the loaded config that
 * holds a secret, and the framework's loggers call `redactForOutput` on what they are given.
 *
 * `toJSON` alone isn't enough: a logger that copies an object before writing it (to apply its own
 * redaction rules, for one) drops a non-enumerable `toJSON` with the copy.
 */
export const REDACT: unique symbol = Symbol.for('mariachi.redact');

export interface Redactable {
  [REDACT](): unknown;
}

const isRedactable = (value: object): value is Redactable => typeof (value as Partial<Redactable>)[REDACT] === 'function';

/**
 * What each object visited was replaced by, so one that appears twice is redacted both times and a cycle
 * ends. Made on the first nested object: a flat log object (most of them) costs no allocation.
 */
interface Visited {
  top: object;
  map?: Map<object, unknown>;
}

function walk(value: unknown, depth: number, visited: Visited): unknown {
  if (typeof value !== 'object' || value === null || depth < 0) return value;
  visited.map ??= new Map<object, unknown>([[visited.top, visited.top]]);
  const done = visited.map;
  if (done.has(value)) return done.get(value);
  done.set(value, value);
  const result = isRedactable(value) ? walk(value[REDACT](), depth - 1, visited) : walkInto(value, depth, visited);
  done.set(value, result);
  return result;
}

/** Same class, message, stack and own properties. The stack is read here: on the original it is an accessor that answers only for the original. */
function copyOfError(error: Error): Record<string, unknown> {
  const copy = Object.defineProperties(Object.create(Object.getPrototypeOf(error)), Object.getOwnPropertyDescriptors(error));
  Object.defineProperty(copy, 'stack', { value: error.stack, writable: true, configurable: true, enumerable: false });
  return copy;
}

function walkInto(value: object, depth: number, visited: Visited): unknown {
  if (Array.isArray(value)) {
    let copy: unknown[] | undefined;
    for (let i = 0; i < value.length; i++) {
      const next = walk(value[i], depth - 1, visited);
      if (next !== value[i]) {
        copy ??= [...value];
        copy[i] = next;
      }
    }
    return copy ?? value;
  }

  // Plain objects and errors: the two things a log call is given. Anything else (a Date, a Buffer, a class
  // instance) is the logger's to serialise.
  const proto = Object.getPrototypeOf(value);
  const plain = proto === Object.prototype || proto === null;
  if (!plain && !(value instanceof Error)) return value;
  let copy: Record<string, unknown> | undefined;
  // An error's `cause` is its own property but not an enumerable one
  const keys = !plain && Object.hasOwn(value, 'cause') && !Object.keys(value).includes('cause') ? [...Object.keys(value), 'cause'] : Object.keys(value);
  for (const key of keys) {
    const current = (value as Record<string, unknown>)[key];
    const next = walk(current, depth - 1, visited);
    if (next !== current) {
      // An error keeps its type, message and stack; only the property that held a secret is replaced
      copy ??= plain ? { ...(value as Record<string, unknown>) } : copyOfError(value as Error);
      copy[key] = next;
    }
  }
  return copy ?? value;
}

/**
 * What to hand a logger or a serialiser in place of `value`: the same value when nothing in it
 * declares a redacted form (no copy is made), else a copy in which each such object is replaced by
 * the form it declares. Looks six levels deep by default, through plain objects, arrays and the
 * properties of errors.
 */
export function redactForOutput<T>(value: T, depth = 6): T {
  if (typeof value !== 'object' || value === null || depth < 0) return value;
  const visited: Visited = { top: value };
  return (isRedactable(value) ? walk(value[REDACT](), depth - 1, visited) : walkInto(value, depth, visited)) as T;
}
