import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { extname, join, sep } from 'node:path';
import { MariachiError } from '@mariachi/core';
import { HttpResponse, StreamResponse } from '@mariachi/server';
import type { HttpContext } from './types';

export interface StaticOptions {
  /**
   * How long a browser may reuse a file without asking, in seconds. Default 0: it asks every time,
   * and gets a short "not changed" answer when the file is the same (`ETag`).
   */
  maxAgeSeconds?: number;
  /** The files never change under their name (a hash in the name): browsers stop asking for `maxAgeSeconds`. */
  immutable?: boolean;
  /** Extra headers on every file. */
  headers?: Record<string, string>;
}

/** What each kind of file is sent as. Anything else is sent as a download (`application/octet-stream`). */
const TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.wasm': 'application/wasm',
};

const notFound = (): MariachiError => new MariachiError('http/not-found', 'Not found');

/**
 * A handler that serves the files of one directory, for a route whose path ends in `*`
 * (`api.withStatic` registers one for you). It is for files that are part of the app: its styles,
 * scripts, fonts and images. It is not for files users upload, which belong in storage.
 *
 * What it will and won't send:
 * - only regular files inside the directory. A path that leaves it, by `..` or through a symbolic
 *   link, is not found. Neither is a directory (there are no listings) or a name that starts with a
 *   dot (`.env`, `.git/…`);
 * - each with its type by extension and `X-Content-Type-Options: nosniff`; an unknown extension is
 *   sent as a download, never guessed;
 * - an SVG with a policy that stops scripts in it from running when it is opened on its own;
 * - with an `ETag`, so an unchanged file is answered with 304 and no body.
 */
export function staticFiles(directory: string, options: StaticOptions = {}): (ctx: HttpContext, body: unknown, params: Record<string, string>) => Promise<HttpResponse | StreamResponse> {
  const maxAge = Math.max(0, Math.floor(options.maxAgeSeconds ?? 0));
  const cacheControl = maxAge > 0 ? `public, max-age=${maxAge}${options.immutable ? ', immutable' : ''}` : 'no-cache';
  let root: Promise<string> | undefined;

  return async (ctx, _body, params) => {
    const requested = params['*'] ?? '';
    const segments = requested.split('/');
    // Nothing that could step out of the directory or name a hidden file is even looked for
    if (!requested || requested.includes('\0') || requested.includes('\\') || segments.some((s) => s === '' || s === '..' || s.startsWith('.'))) {
      throw notFound();
    }
    // Resolved once, links followed: the directory itself may be a link (node_modules under pnpm is)
    root ??= realpath(directory);
    let base: string;
    let file: string;
    try {
      base = await root;
      // Links followed here too, so a link inside the directory that points out of it is caught below
      file = await realpath(join(base, ...segments));
    } catch {
      root = undefined;
      throw notFound();
    }
    if (!file.startsWith(base + sep)) throw notFound();
    const info = await stat(file).catch(() => undefined);
    if (!info?.isFile()) throw notFound();

    const extension = extname(file).toLowerCase();
    const etag = `W/"${info.size.toString(16)}-${Math.floor(info.mtimeMs).toString(16)}"`;
    const headers: Record<string, string> = {
      etag,
      'cache-control': cacheControl,
      'x-content-type-options': 'nosniff',
      // An SVG is a document: opened on its own it could run script. This lets it draw and nothing else.
      ...(extension === '.svg' ? { 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox" } : {}),
      ...options.headers,
    };
    const seen = ctx.request.headers['if-none-match'];
    if (typeof seen === 'string' && seen.split(',').some((tag) => tag.trim() === etag)) return new HttpResponse(304, undefined, headers);
    return new StreamResponse(createReadStream(file), {
      contentType: TYPES[extension] ?? 'application/octet-stream',
      headers: { ...headers, 'content-length': String(info.size) },
    });
  };
}
