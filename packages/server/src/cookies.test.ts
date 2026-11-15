import { describe, expect, it } from 'vitest';
import { parseCookies, serializeClearedCookie, serializeCookie } from './index';

const code = (fn: () => unknown) => {
  try {
    fn();
  } catch (err) {
    return (err as { code?: string }).code;
  }
  return undefined;
};

describe('serializeCookie', () => {
  it('defaults to a cookie scripts and other sites can\'t use', () => {
    expect(serializeCookie('session', 'abc')).toBe('session=abc; Path=/; HttpOnly; Secure; SameSite=Lax');
  });

  it('writes every option, and percent-encodes the value', () => {
    const expires = new Date(Date.UTC(2030, 0, 1));
    expect(serializeCookie('pref', 'a b;c=d,é', { maxAgeSeconds: 60, expires, path: '/app', domain: 'example.com', httpOnly: false, sameSite: 'none', partitioned: true })).toBe(
      'pref=a%20b%3Bc%3Dd%2C%C3%A9; Path=/app; Domain=example.com; Max-Age=60; Expires=Tue, 01 Jan 2030 00:00:00 GMT; Secure; SameSite=None; Partitioned',
    );
    expect(serializeCookie('theme', 'dark', { secure: false, sameSite: 'strict' })).toBe('theme=dark; Path=/; HttpOnly; SameSite=Strict');
  });

  it('refuses a name, path or domain that could add an attribute or a second cookie', () => {
    for (const name of ['', 'a b', 'a;b', 'a=b', 'a\r\nSet-Cookie: x', 'é']) expect(code(() => serializeCookie(name, 'v')), name).toBe('http/invalid-cookie');
    for (const path of ['app', '/a;Domain=evil.test', '/a\nb']) expect(code(() => serializeCookie('a', 'v', { path })), path).toBe('http/invalid-cookie');
    for (const domain of ['evil.test; Path=/', 'a b', '']) expect(code(() => serializeCookie('a', 'v', { domain })), domain).toBe('http/invalid-cookie');
    expect(serializeCookie('a', 'v\r\nSet-Cookie: evil=1; x')).toBe('a=v%0D%0ASet-Cookie%3A%20evil%3D1%3B%20x; Path=/; HttpOnly; Secure; SameSite=Lax');
  });

  it('holds the __Host- and __Secure- prefixes, SameSite=None and Partitioned to their rules', () => {
    expect(serializeCookie('__Host-session', 'v')).toContain('__Host-session=v; Path=/');
    expect(code(() => serializeCookie('__Host-session', 'v', { secure: false }))).toBe('http/invalid-cookie');
    expect(code(() => serializeCookie('__Host-session', 'v', { path: '/app' }))).toBe('http/invalid-cookie');
    expect(code(() => serializeCookie('__Host-session', 'v', { domain: 'example.com' }))).toBe('http/invalid-cookie');
    expect(code(() => serializeCookie('__Secure-id', 'v', { secure: false }))).toBe('http/invalid-cookie');
    expect(code(() => serializeCookie('a', 'v', { sameSite: 'none', secure: false }))).toBe('http/invalid-cookie');
    expect(code(() => serializeCookie('a', 'v', { partitioned: true, secure: false }))).toBe('http/invalid-cookie');
    expect(code(() => serializeCookie('a', 'v', { maxAgeSeconds: 1.5 }))).toBe('http/invalid-cookie');
  });

  it('clears a cookie with the same path and domain', () => {
    expect(serializeClearedCookie('session')).toBe('session=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax');
    expect(serializeClearedCookie('session', { path: '/app', domain: 'example.com' })).toContain('Path=/app; Domain=example.com; Max-Age=0');
  });
});

describe('parseCookies', () => {
  it('reads names and decoded values; the first of a repeated name wins', () => {
    expect({ ...parseCookies('a=1; b=two%20words; a=3; c="quoted"; d=x=y') }).toEqual({ a: '1', b: 'two words', c: 'quoted', d: 'x=y' });
    expect({ ...parseCookies(undefined) }).toEqual({});
    expect({ ...parseCookies(['a=1', 'b=2']) }).toEqual({ a: '1', b: '2' });
  });

  it('keeps a value that isn\'t valid percent-encoding, skips what has no name, and has no inherited keys', () => {
    const cookies = parseCookies('bad=%E0%A4%A; =nameless; novalue; __proto__=x; ok=1');
    expect(cookies.bad).toBe('%E0%A4%A');
    expect(cookies.ok).toBe('1');
    expect(Object.keys(cookies).sort()).toEqual(['__proto__', 'bad', 'ok']);
    expect(parseCookies('a=1').toString).toBeUndefined();
    expect(parseCookies('a=1').constructor).toBeUndefined();
  });

  it('round-trips what serializeCookie wrote', () => {
    const value = 'a b;c=d,é "q" \r\n';
    const header = serializeCookie('v', value).split('; ')[0] as string;
    expect(parseCookies(header).v).toBe(value);
  });
});
