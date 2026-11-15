import { AuthError, MariachiError } from '@mariachi/core';
import { createCommunication, defineProcedure } from '@mariachi/communication';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import {
  BaseController,
  bearerStrategy,
  cookieStrategy,
  createApiServer,
  httpResponse,
  type ResolvedIdentity,
  type ServerSentEvent,
  sseResponse,
  streamResponse,
} from './index';

const silent = { info() {}, warn() {}, error() {}, debug() {}, child() { return silent; } };
const verified: string[] = [];
const verifier = {
  async verify(token: string): Promise<ResolvedIdentity> {
    verified.push(token);
    if (token === 'good') return { userId: 'u1', tenantId: 't1', scopes: [], identityType: 'session' };
    throw new AuthError('auth/invalid-session', 'bad');
  },
};
const HOST = 'app.example.test';
const code = (res: { json<T>(): T }) => res.json<{ error: { code: string } }>().error.code;

const BOUNDARY = '----facade-boundary';
type Part = { name: string; value: string | Buffer; filename?: string; type?: string };
function multipart(parts: Part[]): { payload: Buffer; headers: Record<string, string> } {
  const chunks: Buffer[] = [];
  for (const part of parts) {
    const file = part.filename !== undefined ? `; filename="${part.filename}"` : '';
    const type = part.type ? `Content-Type: ${part.type}\r\n` : '';
    chunks.push(Buffer.from(`--${BOUNDARY}\r\nContent-Disposition: form-data; name="${part.name}"${file}\r\n${type}\r\n`), Buffer.from(part.value), Buffer.from('\r\n'));
  }
  chunks.push(Buffer.from(`--${BOUNDARY}--\r\n`));
  return { payload: Buffer.concat(chunks), headers: { 'content-type': `multipart/form-data; boundary=${BOUNDARY}` } };
}

describe('cookies', () => {
  class SessionController extends BaseController {
    readonly prefix = 'session';
    init() {
      this.post('', { auth: false }, async (ctx) => {
        ctx.setCookie('__Host-session', 'token value;1', { maxAgeSeconds: 3600 });
        ctx.setCookie('theme', 'dark', { httpOnly: false });
        ctx.clearCookie('legacy', { path: '/old' });
        return { seen: ctx.request.cookies };
      });
      this.get('redirect', { auth: false }, async (ctx) => {
        ctx.setCookie('state', 'abc');
        return httpResponse(302, undefined, { location: '/app', 'set-cookie': ['a=1; Path=/', 'b=2; Path=/'] });
      });
      this.post('fail', { auth: false }, async (ctx) => {
        ctx.clearCookie('__Host-session');
        throw new MariachiError('session/expired', 'Expired');
      });
    }
  }
  const app = () => createApiServer({ name: 'test', logger: silent, prefix: '/api' }).registerController(new SessionController());

  it('reads the request\'s cookies and sets several on the response, one header each', async () => {
    const res = await app().inject({ method: 'POST', url: '/api/session', headers: { cookie: 'a=1; b=two%20words' } });
    expect(res.json()).toEqual({ seen: { a: '1', b: 'two words' } });
    expect(res.headers['set-cookie']).toEqual([
      '__Host-session=token%20value%3B1; Path=/; Max-Age=3600; HttpOnly; Secure; SameSite=Lax',
      'theme=dark; Path=/; Secure; SameSite=Lax',
      'legacy=; Path=/old; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax',
    ]);
  });

  it('redirects with cookies from both the response and the context', async () => {
    const res = await app().inject({ method: 'GET', url: '/api/session/redirect' });
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/app');
    expect(res.headers['set-cookie']).toEqual(['a=1; Path=/', 'b=2; Path=/', 'state=abc; Path=/; HttpOnly; Secure; SameSite=Lax']);
  });

  it('still sends a cookie set before the handler threw', async () => {
    const res = await app().inject({ method: 'POST', url: '/api/session/fail' });
    expect(code(res)).toBe('session/expired');
    expect(res.headers['set-cookie']).toMatch(/^__Host-session=; Path=\/; Max-Age=0/);
  });

  it('refuses a cookie the browser would reject, as a server error', async () => {
    class Bad extends BaseController {
      readonly prefix = 'bad';
      init() {
        this.get('', { auth: false }, async (ctx) => {
          ctx.setCookie('__Host-x', 'v', { domain: 'example.test' });
          return {};
        });
      }
    }
    const res = await createApiServer({ name: 'test', logger: silent }).registerController(new Bad()).inject({ method: 'GET', url: '/bad' });
    expect(res.statusCode).toBe(500);
    expect(res.headers['set-cookie']).toBeUndefined();
  });
});

describe('cookieStrategy and the same-origin check', () => {
  class NotesController extends BaseController {
    readonly prefix = 'notes';
    init() {
      this.get('', async (ctx) => ({ user: ctx.userId }));
      this.post('', async (ctx) => ({ user: ctx.userId }));
      this.delete(':id', async (ctx) => ({ user: ctx.userId }));
    }
  }
  const app = (options: { allowedOrigins?: string[]; publicOrigin?: string } = {}) =>
    createApiServer({ name: 'test', logger: silent })
      .withAuthStrategy('session', cookieStrategy(verifier, { cookie: '__Host-session', ...options }))
      .withAuth('session')
      .registerController(new NotesController());
  const cookie = { cookie: '__Host-session=good', host: HOST };
  const post = (s: ReturnType<typeof app>, headers: Record<string, string>, method: 'POST' | 'DELETE' = 'POST') =>
    s.inject({ method, url: method === 'POST' ? '/notes' : '/notes/1', headers, payload: method === 'POST' ? {} : undefined });

  it('signs a request in by its cookie; reads need nothing more', async () => {
    const res = await app().inject({ method: 'GET', url: '/notes', headers: cookie });
    expect(res.json()).toEqual({ user: 'u1' });
    expect((await app().inject({ method: 'GET', url: '/notes', headers: { host: HOST } })).statusCode).toBe(401);
    const bad = await app().inject({ method: 'GET', url: '/notes', headers: { cookie: '__Host-session=stolen', host: HOST } });
    expect(bad.statusCode).toBe(401);
    expect(code(bad)).toBe('auth/invalid-session');
  });

  it('lets a state-changing request through only from this origin', async () => {
    const s = app();
    expect((await post(s, { ...cookie, origin: `https://${HOST}` })).statusCode).toBe(200);
    expect((await post(s, { ...cookie, origin: `https://${HOST}`, 'sec-fetch-site': 'same-origin' })).statusCode).toBe(200);
    expect((await post(s, { ...cookie, 'sec-fetch-site': 'same-origin' })).statusCode).toBe(200);
    expect((await post(s, { ...cookie, origin: `https://${HOST}` }, 'DELETE')).statusCode).toBe(200);
    // Behind a proxy that rewrites Host, the browser's own same-origin statement still holds
    expect((await post(s, { cookie: '__Host-session=good', host: 'internal:3000', origin: `https://${HOST}`, 'sec-fetch-site': 'same-origin' })).statusCode).toBe(200);
    expect((await post(s, { cookie: '__Host-session=good', host: 'internal:3000', origin: `https://${HOST}` })).statusCode).toBe(403);
  });

  it('refuses one another site caused, before the token is even checked', async () => {
    const s = app();
    const cases: Array<Record<string, string>> = [
      { origin: 'https://evil.example' },
      { origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' },
      { 'sec-fetch-site': 'cross-site' },
      // A sibling subdomain is another origin: it may be someone else's
      { origin: 'https://other.example.test', 'sec-fetch-site': 'same-site' },
      { 'sec-fetch-site': 'same-site' },
      { origin: `https://${HOST}.evil.example` },
      { origin: 'null' },
      { origin: 'not an origin' },
      // Says nothing about where it comes from: not a browser, so it shouldn't be using a cookie
      {},
    ];
    for (const headers of cases) {
      verified.length = 0;
      for (const method of ['POST', 'DELETE'] as const) {
        const res = await post(s, { ...cookie, ...headers }, method);
        expect(res.statusCode, JSON.stringify(headers)).toBe(403);
        expect(code(res)).toBe('auth/cross-site-request');
      }
      expect(verified).toEqual([]);
    }
  });

  it('lets listed origins through, and no others', async () => {
    const s = app({ allowedOrigins: ['https://web.example.test'] });
    expect((await post(s, { ...cookie, origin: 'https://web.example.test', 'sec-fetch-site': 'same-site' })).statusCode).toBe(200);
    expect((await post(s, { ...cookie, origin: 'https://web.example.test', 'sec-fetch-site': 'cross-site' })).statusCode).toBe(200);
    expect((await post(s, { ...cookie, origin: 'https://web.example.test.evil.example' })).statusCode).toBe(403);
    expect((await post(s, { ...cookie, origin: 'http://web.example.test' })).statusCode).toBe(403);
  });

  it('compares the whole origin, scheme included, when told the public origin', async () => {
    const s = app({ publicOrigin: `https://${HOST}` });
    expect((await post(s, { ...cookie, origin: `https://${HOST}` })).statusCode).toBe(200);
    // Same host over http: a page on the network path, not the app
    expect((await post(s, { ...cookie, origin: `http://${HOST}` })).statusCode).toBe(403);
    expect((await post(s, { ...cookie, origin: `https://${HOST}:8443` })).statusCode).toBe(403);
    // Host is no longer what's compared, so a rewriting proxy is fine
    expect((await post(s, { cookie: '__Host-session=good', host: 'internal:3000', origin: `https://${HOST}` })).statusCode).toBe(200);
    expect((await post(s, { ...cookie, 'sec-fetch-site': 'same-origin' })).statusCode).toBe(200);
  });

  it('warns once when the session cookie has no __Host- prefix', () => {
    const warn = vi.spyOn(process, 'emitWarning').mockImplementation(() => undefined);
    try {
      cookieStrategy(verifier, { cookie: 'sid' });
      cookieStrategy(verifier, { cookie: 'sid' });
      cookieStrategy(verifier, { cookie: '__Host-sid' });
      expect(warn).toHaveBeenCalledTimes(1);
      expect(String(warn.mock.calls[0]?.[0])).toMatch(/"sid" has no __Host- prefix/);
    } finally {
      warn.mockRestore();
    }
  });

  it('holds bearerStrategy\'s cookie to the same check, and leaves its header alone', async () => {
    const s = createApiServer({ name: 'test', logger: silent })
      .withAuthStrategy('session', bearerStrategy(verifier, { cookie: 'token' }))
      .withAuth('session')
      .registerController(new NotesController());
    const viaCookie = { cookie: 'token=good', host: HOST };
    expect((await s.inject({ method: 'GET', url: '/notes', headers: viaCookie })).statusCode).toBe(200);
    expect((await post(s, { ...viaCookie, origin: `https://${HOST}` })).statusCode).toBe(200);
    expect(code(await post(s, { ...viaCookie, origin: 'https://evil.example' }))).toBe('auth/cross-site-request');
    expect(code(await post(s, viaCookie))).toBe('auth/cross-site-request');
    // A token in the Authorization header is not something a browser attaches by itself
    expect((await post(s, { authorization: 'Bearer good', host: HOST })).statusCode).toBe(200);
    expect((await post(s, { authorization: 'Bearer good', host: HOST, origin: 'https://evil.example', cookie: 'token=good' })).statusCode).toBe(200);
  });
});

describe('uploads', () => {
  class FilesController extends BaseController {
    readonly prefix = 'files';
    init() {
      this.post(
        '',
        {
          upload: { maxFiles: 2, maxFileBytes: 1000, allowedTypes: ['image/*', 'text/plain'] },
          schema: { body: z.object({ title: z.string().min(1), tags: z.array(z.string()).optional() }) },
        },
        async (ctx, body) => ({
          title: body.title,
          tags: body.tags,
          files: ctx.request.files.map((f) => ({ field: f.field, filename: f.filename, contentType: f.contentType, size: f.size, first: f.bytes[0] })),
        }),
      );
      this.post('plain', { schema: { body: z.object({ a: z.number() }) } }, async (ctx, body) => ({ a: body.a, files: ctx.request.files.length }));
    }
  }
  const app = () =>
    createApiServer({ name: 'test', logger: silent })
      .withAuthStrategy('session', bearerStrategy(verifier))
      .withAuth('session')
      .withOpenApi({ info: { title: 'Test', version: '1' } })
      .registerController(new FilesController());
  const auth = { authorization: 'Bearer good' };
  const upload = (parts: Part[], headers: Record<string, string> = auth) => {
    const body = multipart(parts);
    return app().inject({ method: 'POST', url: '/files', headers: { ...body.headers, ...headers }, payload: body.payload });
  };

  it('gives the handler the files and the validated text fields', async () => {
    const res = await upload([
      { name: 'title', value: 'Holiday' },
      { name: 'tags', value: 'a' },
      { name: 'tags', value: 'b' },
      { name: 'photo', value: Buffer.from([0x89, 0x50, 0x4e, 0x47]), filename: '../beach.png', type: 'image/png' },
    ]);
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ title: 'Holiday', tags: ['a', 'b'], files: [{ field: 'photo', filename: 'beach.png', contentType: 'image/png', size: 4, first: 0x89 }] });
  });

  it('checks the text fields against the route\'s schema', async () => {
    const res = await upload([{ name: 'photo', value: 'x', filename: 'a.txt', type: 'text/plain' }]);
    expect(res.statusCode).toBe(400);
  });

  it('refuses what the route\'s limits rule out', async () => {
    const title = { name: 'title', value: 't' };
    const file = (name: string, size = 10, type = 'text/plain') => ({ name, value: Buffer.alloc(size, 65), filename: `${name}.txt`, type });
    const tooMany = await upload([title, file('a'), file('b'), file('c')]);
    expect([tooMany.statusCode, code(tooMany)]).toEqual([413, 'http/too-many-files']);
    const tooLarge = await upload([title, file('a', 2000)]);
    expect([tooLarge.statusCode, code(tooLarge)]).toEqual([413, 'http/file-too-large']);
    const wrongType = await upload([title, file('a', 10, 'application/x-msdownload')]);
    expect([wrongType.statusCode, code(wrongType)]).toEqual([415, 'http/unsupported-file-type']);
  });

  it('takes only multipart on an upload route, and parses nothing for a caller it hasn\'t let in', async () => {
    const json = await app().inject({ method: 'POST', url: '/files', headers: auth, payload: { title: 't' } });
    expect([json.statusCode, code(json)]).toEqual([415, 'http/unsupported-media-type']);
    // Not signed in: refused for that, although the body is not even valid multipart
    const anonymous = await app().inject({ method: 'POST', url: '/files', headers: { 'content-type': `multipart/form-data; boundary=${BOUNDARY}` }, payload: Buffer.from('garbage') });
    expect(anonymous.statusCode).toBe(401);
    const garbage = await app().inject({ method: 'POST', url: '/files', headers: { ...auth, 'content-type': `multipart/form-data; boundary=${BOUNDARY}` }, payload: Buffer.from('garbage') });
    expect([garbage.statusCode, code(garbage)]).toEqual([400, 'http/invalid-multipart']);
  });

  it('leaves other routes as they were: no files, JSON bodies', async () => {
    const res = await app().inject({ method: 'POST', url: '/files/plain', headers: auth, payload: { a: 1 } });
    expect(res.json()).toEqual({ a: 1, files: 0 });
  });

  it('documents an upload route as multipart/form-data', () => {
    const doc = app().openApiDocument() as { paths: Record<string, { post: { requestBody: { content: Record<string, { schema: { properties: object } }> } } }> };
    expect(Object.keys(doc.paths['/files']!.post.requestBody.content)).toEqual(['multipart/form-data']);
    expect(doc.paths['/files']!.post.requestBody.content['multipart/form-data']!.schema.properties).toHaveProperty('title');
    expect(Object.keys(doc.paths['/files/plain']!.post.requestBody.content)).toEqual(['application/json']);
  });
});

describe('streams from controllers', () => {
  const communication = createCommunication({}, { logger: silent as never });
  // A procedure may return an async iterable: it passes through the in-process layer as it is
  communication.register(
    'chat.reply',
    defineProcedure({
      schema: { input: z.object({ prompt: z.string() }), output: z.custom<AsyncIterable<string>>((value) => typeof (value as AsyncIterable<string>)?.[Symbol.asyncIterator] === 'function') },
      handler: async (ctx, input) =>
        (async function* () {
          for (const word of `${input.prompt} for ${ctx.userId}`.split(' ')) yield word;
        })(),
    }),
  );

  class ChatController extends BaseController {
    readonly prefix = 'chat';
    init() {
      this.post('', { schema: { body: z.object({ prompt: z.string() }) } }, async (ctx, body) => {
        const tokens = await this.call<AsyncIterable<string>>(ctx, 'chat.reply', body);
        let count = 0;
        return sseResponse(
          (async function* (): AsyncGenerator<ServerSentEvent> {
            for await (const token of tokens) {
              count++;
              yield { event: 'token', data: { token } };
            }
          })(),
          { done: () => ({ usage: { tokens: count } }) },
        );
      });
      this.get('export', async (ctx) => {
        ctx.setCookie('exported', '1');
        return streamResponse(
          (async function* () {
            yield 'id\n';
            yield '1\n';
          })(),
          { contentType: 'text/csv' },
        );
      });
    }
  }
  const app = () =>
    createApiServer({ name: 'test', logger: silent })
      .withAuthStrategy('session', bearerStrategy(verifier))
      .withAuth('session')
      .registerController(new ChatController(communication));
  const auth = { authorization: 'Bearer good' };

  it('streams a procedure\'s tokens as server-sent events, behind the route\'s auth and validation', async () => {
    const res = await app().inject({ method: 'POST', url: '/chat', headers: auth, payload: { prompt: 'hello there' } });
    expect(res.headers['content-type']).toBe('text/event-stream; charset=utf-8');
    expect(res.body).toBe(
      [...['hello', 'there', 'for', 'u1'].map((token) => `event: token\ndata: ${JSON.stringify({ token })}\n\n`), 'event: done\ndata: {"usage":{"tokens":4}}\n\n'].join(''),
    );
    expect((await app().inject({ method: 'POST', url: '/chat', payload: { prompt: 'x' } })).statusCode).toBe(401);
    expect((await app().inject({ method: 'POST', url: '/chat', headers: auth, payload: {} })).statusCode).toBe(400);
  });

  it('streams bytes with a content type, cookies and the usual headers', async () => {
    const res = await app().inject({ method: 'GET', url: '/chat/export', headers: auth });
    expect(res.headers['content-type']).toBe('text/csv');
    expect(res.body).toBe('id\n1\n');
    expect(res.headers['set-cookie']).toBe('exported=1; Path=/; HttpOnly; Secure; SameSite=Lax');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});
