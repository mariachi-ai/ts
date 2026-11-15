import { ConfigError } from '@mariachi/core';

export interface CookieOptions {
  /** Seconds until the browser drops it. Without this or `expires`, the cookie lasts for the browser session. */
  maxAgeSeconds?: number;
  expires?: Date;
  /** Default `/`. */
  path?: string;
  /** Leave unset to bind the cookie to this exact host (the safer choice). */
  domain?: string;
  /** Send only over https. Default true (browsers treat localhost as secure). */
  secure?: boolean;
  /** Keep it from page scripts. Default true. */
  httpOnly?: boolean;
  /** Default `lax`: sent on top-level navigations to the site, not on cross-site requests it didn't start. */
  sameSite?: 'lax' | 'strict' | 'none';
  /** CHIPS: one cookie jar per top-level site, for a cookie set in a cross-site frame. */
  partitioned?: boolean;
}

// RFC 6265 token: no separators, spaces or control characters
const NAME = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
const DOMAIN = /^\.?[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?$/;
// Anything but control characters and `;`
const PATH = /^\/[\x20-\x3a\x3c-\x7e]*$/;

const invalid = (name: string, why: string) => new ConfigError('http/invalid-cookie', `Cookie "${name}": ${why}`, { cookie: name });

/**
 * One `Set-Cookie` header value. The value is percent-encoded, so any string is safe to store.
 * Defaults: `Path=/; HttpOnly; Secure; SameSite=Lax`. The `__Host-` and `__Secure-` name prefixes are
 * checked against the rules browsers hold them to.
 */
export function serializeCookie(name: string, value: string, options: CookieOptions = {}): string {
  if (!NAME.test(name)) throw new ConfigError('http/invalid-cookie', 'Cookie names are letters, digits and !#$%&\'*+-.^_`|~', { cookie: name });
  const path = options.path ?? '/';
  const secure = options.secure ?? true;
  const sameSite = options.sameSite ?? 'lax';
  if (!PATH.test(path)) throw invalid(name, 'the path must start with / and hold no ; or control characters');
  if (options.domain !== undefined && !DOMAIN.test(options.domain)) throw invalid(name, 'the domain is not a host name');
  if (sameSite === 'none' && !secure) throw invalid(name, 'SameSite=None needs Secure');
  if (options.partitioned && !secure) throw invalid(name, 'Partitioned needs Secure');
  if (name.startsWith('__Secure-') && !secure) throw invalid(name, 'the __Secure- prefix needs Secure');
  if (name.startsWith('__Host-') && (!secure || path !== '/' || options.domain !== undefined)) {
    throw invalid(name, 'the __Host- prefix needs Secure, Path=/ and no Domain');
  }
  if (options.maxAgeSeconds !== undefined && !Number.isInteger(options.maxAgeSeconds)) throw invalid(name, 'maxAgeSeconds must be a whole number');

  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`];
  if (options.domain !== undefined) parts.push(`Domain=${options.domain}`);
  if (options.maxAgeSeconds !== undefined) parts.push(`Max-Age=${options.maxAgeSeconds}`);
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options.httpOnly ?? true) parts.push('HttpOnly');
  if (secure) parts.push('Secure');
  parts.push(`SameSite=${sameSite === 'none' ? 'None' : sameSite === 'strict' ? 'Strict' : 'Lax'}`);
  if (options.partitioned) parts.push('Partitioned');
  return parts.join('; ');
}

/** A `Set-Cookie` value that removes the cookie. `path` and `domain` must be the ones it was set with. */
export function serializeClearedCookie(name: string, options: Pick<CookieOptions, 'path' | 'domain' | 'secure' | 'httpOnly' | 'sameSite' | 'partitioned'> = {}): string {
  return serializeCookie(name, '', { ...options, maxAgeSeconds: 0, expires: new Date(0) });
}

/**
 * The cookies in a `Cookie` header. The first value wins when a name repeats (browsers send the most
 * specific path first). A value that isn't valid percent-encoding is kept as sent.
 */
export function parseCookies(header: string | string[] | undefined): Record<string, string> {
  const out: Record<string, string> = Object.create(null);
  const text = Array.isArray(header) ? header.join('; ') : header;
  if (!text) return out;
  for (const pair of text.split(';')) {
    const eq = pair.indexOf('=');
    if (eq < 1) continue;
    const name = pair.slice(0, eq).trim();
    if (!name || name in out) continue;
    let value = pair.slice(eq + 1).trim();
    if (value.length > 1 && value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    try {
      out[name] = decodeURIComponent(value);
    } catch {
      out[name] = value;
    }
  }
  return out;
}
