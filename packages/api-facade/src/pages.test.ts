import { mkdir, mkdtemp, rm, symlink, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AuthError } from '@mariachi/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { BaseController, bearerStrategy, createApiServer, DEFAULT_PAGE_CSP, Html, html, htmlResponse, raw, type ResolvedIdentity, safeHref } from './index';

const silent = { info() {}, warn() {}, error() {}, debug() {}, child() { return silent; } };
const verifier = {
  async verify(token: string): Promise<ResolvedIdentity> {
    if (token === 'good') return { userId: 'u1', tenantId: 't1', scopes: [], identityType: 'session' };
    throw new AuthError('auth/invalid-session', 'bad');
  },
};

describe('html', () => {
  it('escapes what is put into it, between tags and in a quoted attribute', () => {
    const title = '<script>alert("x")</script> & \'more\'';
    const page = html`<h1 title="${title}">${title}</h1>`;
    expect(page).toBeInstanceOf(Html);
    expect(page.value).toBe(
      '<h1 title="&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;more&#39;">&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;more&#39;</h1>',
    );
  });

  it('takes pieces as they are, joins lists, and makes nothing of null, undefined and booleans', () => {
    const items = ['a<b', 'c'].map((text) => html`<li>${text}</li>`);
    const owner = false;
    expect(html`<ul>${items}</ul>${null}${undefined}${owner && html`<p>owner</p>`}${true}${0}${3.5}`.value).toBe('<ul><li>a&lt;b</li><li>c</li></ul>03.5');
    // A list of plain strings is escaped item by item
    expect(html`${['<a>', '<b>']}`.value).toBe('&lt;a&gt;&lt;b&gt;');
  });

  it('uses markup only when it is vouched for', () => {
    expect(html`<div>${raw('<b>bold</b>')}${'<b>not</b>'}</div>`.value).toBe('<div><b>bold</b>&lt;b&gt;not&lt;/b&gt;</div>');
    // A string that looks like a piece is still a string
    expect(html`${String(html`<b>x</b>`)}`.value).toBe('&lt;b&gt;x&lt;/b&gt;');
  });
});

describe('safeHref', () => {
  it('keeps paths on this site and web or mail addresses', () => {
    for (const ok of ['/notes/1', '?page=2', '#top', 'https://example.com/a?b=c', 'http://example.com', 'mailto:ada@example.com']) expect(safeHref(ok)).toBe(ok);
  });

  it('turns anything that could run or leave by a side door into #', () => {
    for (const bad of ['javascript:alert(1)', ' JaVaScRiPt:alert(1)', 'java\tscript:alert(1)', 'data:text/html,<script>', 'vbscript:x', '//evil.example/path', 'notes/1', '', 'ftp://example.com']) {
      expect(safeHref(bad), bad).toBe('#');
    }
  });
});

class PagesController extends BaseController {
  readonly prefix = '';

  init(): void {
    this.get('/', { root: true, auth: false }, async () => htmlResponse(html`<html><body><h1>${'Home & <garden>'}</h1></body></html>`));
    this.get('/settings', { root: true }, async (ctx) => htmlResponse(html`<p>${ctx.userId}</p>`, { csp: "default-src 'none'", headers: { 'cache-control': 'no-store' } }));
    this.get('/plain', { root: true, auth: false }, async () => htmlResponse(raw('<!DOCTYPE html><p>mine</p>'), { status: 404, csp: false }));
    this.get('/notes', async () => ({ notes: [] }));
  }
}

describe('pages beside the API', () => {
  let dir: string;
  let outside: string;

  const server = () =>
    createApiServer({ name: 'pages-test', prefix: '/api', logger: silent as never })
      .withAuthStrategy('session', bearerStrategy(verifier))
      .withAuth('session')
      .withOpenApi({ info: { title: 'pages', version: '1' } })
      .withStatic('/assets', dir, { maxAgeSeconds: 0 })
      .registerController(new PagesController());

  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), 'mariachi-static-'));
    outside = await mkdtemp(join(tmpdir(), 'mariachi-outside-'));
    await mkdir(join(dir, 'css'));
    await mkdir(join(dir, '.git'));
    await writeFile(join(dir, 'css/app.css'), 'body { margin: 0 }');
    await writeFile(join(dir, 'app.js'), 'export const a = 1;');
    await writeFile(join(dir, 'logo.svg'), '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    await writeFile(join(dir, 'notes.xyz'), 'who knows');
    await writeFile(join(dir, '.env'), 'SECRET=1');
    await writeFile(join(dir, '.git/config'), '[core]');
    await writeFile(join(outside, 'secret.txt'), 'outside the directory');
    await symlink(join(outside, 'secret.txt'), join(dir, 'link.txt'));
    await symlink(outside, join(dir, 'linked'));
  });

  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  });

  it('serves a page at the root, outside the API prefix, with a policy that runs no inline script', async () => {
    const api = server();
    const res = await api.inject({ method: 'GET', url: '/' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toBe('<!doctype html>\n<html><body><h1>Home &amp; &lt;garden&gt;</h1></body></html>');
    expect(res.headers).toMatchObject({
      'content-type': 'text/html; charset=utf-8',
      'content-security-policy': DEFAULT_PAGE_CSP,
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'same-origin',
      'cache-control': 'no-cache',
    });
    expect(DEFAULT_PAGE_CSP).not.toMatch(/unsafe-inline|unsafe-eval/);
    // It is at the root and nowhere else
    expect((await api.inject({ method: 'GET', url: '/api/' })).statusCode).toBe(404);
    await api.close();
  });

  it('keeps the API where it was, and leaves pages out of its OpenAPI document', async () => {
    const api = server();
    expect((await api.inject({ method: 'GET', url: '/api/notes', headers: { authorization: 'Bearer good' } })).json()).toEqual({ notes: [] });
    expect((await api.inject({ method: 'GET', url: '/notes' })).statusCode).toBe(404);
    const paths = Object.keys((await api.inject({ method: 'GET', url: '/api/openapi.json' })).json<{ paths: Record<string, unknown> }>().paths);
    expect(paths).toContain('/api/notes');
    expect(paths.some((path) => path === '/' || path.includes('settings') || path.includes('assets'))).toBe(false);
    await api.close();
  });

  it('asks a page for sign-in like any route unless it says it is public, and takes your own policy, status and headers', async () => {
    const api = server();
    expect((await api.inject({ method: 'GET', url: '/settings' })).statusCode).toBe(401);
    const mine = await api.inject({ method: 'GET', url: '/settings', headers: { authorization: 'Bearer good' } });
    expect(mine.body).toBe('<!doctype html>\n<p>u1</p>');
    expect(mine.headers).toMatchObject({ 'content-security-policy': "default-src 'none'", 'cache-control': 'no-store' });
    const plain = await api.inject({ method: 'GET', url: '/plain' });
    expect(plain.statusCode).toBe(404);
    // A page that brings its own doctype keeps it, once
    expect(plain.body).toBe('<!DOCTYPE html><p>mine</p>');
    // With no policy of its own it keeps the server's, the one every API response has
    expect(plain.headers['content-security-policy']).toBe("default-src 'none'; frame-ancestors 'none'");
    await api.close();
  });

  it('serves the files of a directory with their types, to anyone, at the root', async () => {
    const api = server();
    const css = await api.inject({ method: 'GET', url: '/assets/css/app.css' });
    expect(css.statusCode).toBe(200);
    expect(css.body).toBe('body { margin: 0 }');
    expect(css.headers).toMatchObject({ 'content-type': 'text/css; charset=utf-8', 'content-length': '18', 'x-content-type-options': 'nosniff', 'cache-control': 'no-cache' });
    expect((await api.inject({ method: 'GET', url: '/assets/app.js' })).headers['content-type']).toBe('text/javascript; charset=utf-8');
    // An unknown kind is a download, never guessed at
    expect((await api.inject({ method: 'GET', url: '/assets/notes.xyz' })).headers['content-type']).toBe('application/octet-stream');
    expect((await api.inject({ method: 'GET', url: '/api/assets/app.js' })).statusCode).toBe(404);
    await api.close();
  });

  it('answers 304 for a file the browser already has, and sends it again once it has changed', async () => {
    const api = server();
    const first = await api.inject({ method: 'GET', url: '/assets/app.js' });
    const etag = first.headers.etag as string;
    expect(etag).toMatch(/^W\/"[0-9a-f]+-[0-9a-f]+"$/);
    const again = await api.inject({ method: 'GET', url: '/assets/app.js', headers: { 'if-none-match': `"other", ${etag}` } });
    expect(again.statusCode).toBe(304);
    expect(again.body).toBe('');
    await utimes(join(dir, 'app.js'), new Date(), new Date(Date.now() + 5000));
    expect((await api.inject({ method: 'GET', url: '/assets/app.js', headers: { 'if-none-match': etag } })).statusCode).toBe(200);
    await api.close();
  });

  it('finds nothing outside the directory: not by .., an encoded .., a link, a hidden name or a directory', async () => {
    const api = server();
    for (const url of [
      '/assets/../package.json',
      '/assets/%2e%2e/%2e%2e/etc/passwd',
      '/assets/..%2f..%2fetc%2fpasswd',
      '/assets/css/..%5c..%5csecret',
      '/assets/link.txt',
      '/assets/linked/secret.txt',
      '/assets/.env',
      '/assets/.git/config',
      '/assets/css',
      '/assets/css/',
      '/assets/',
      '/assets/nope.css',
      '/assets/app.js%00.css',
    ]) {
      const res = await api.inject({ method: 'GET', url });
      expect(res.statusCode, url).toBe(404);
      expect(res.body, url).not.toContain('outside the directory');
      expect(res.body, url).not.toContain('SECRET');
    }
    await api.close();
  });

  it('stops a script inside an SVG from running when the file is opened on its own', async () => {
    const api = server();
    const svg = await api.inject({ method: 'GET', url: '/assets/logo.svg' });
    expect(svg.headers).toMatchObject({ 'content-type': 'image/svg+xml', 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox" });
    await api.close();
  });

  it('lets a browser keep files that never change under their name', async () => {
    const api = createApiServer({ name: 'pages-test', prefix: '/api', logger: silent as never }).withStatic('/static/', dir, { maxAgeSeconds: 31536000, immutable: true });
    expect((await api.inject({ method: 'GET', url: '/static/app.js' })).headers['cache-control']).toBe('public, max-age=31536000, immutable');
    await api.close();
  });
});
