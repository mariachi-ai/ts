import { Readable } from 'node:stream';
import { MariachiError } from '@mariachi/core';
import { afterEach, describe, expect, it } from 'vitest';
import { encodeSse, FastifyServerAdapter, formatSseEvent, type ServerSentEvent, sseResponse, streamResponse } from './index';

const errors: unknown[] = [];
const logger = { info() {}, warn() {}, debug() {}, error: (...args: unknown[]) => void errors.push(args), child: () => logger };
const servers: FastifyServerAdapter[] = [];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** A server on a real socket: streaming is about when bytes reach the client, which inject() can't show. */
async function listen(routes: Parameters<FastifyServerAdapter['register']>[0]): Promise<string> {
  const server = new FastifyServerAdapter({ name: 'test', logger, shutdownTimeoutMs: 200 }).register(routes);
  servers.push(server);
  return server.listen(0, '127.0.0.1');
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((s) => s.close()));
  errors.length = 0;
});

const text = async (events: AsyncIterable<string>) => {
  let out = '';
  for await (const chunk of events) out += chunk;
  return out;
};

async function* from<T>(items: T[]): AsyncGenerator<T> {
  for (const item of items) yield item;
}

describe('formatSseEvent', () => {
  it('writes data, event, id and retry; objects as JSON; one data line per line of text', () => {
    expect(formatSseEvent('hello')).toBe('data: hello\n\n');
    expect(formatSseEvent({ data: { n: 1 } })).toBe('data: {"n":1}\n\n');
    expect(formatSseEvent({ event: 'token', id: '7', retry: 2000, data: 'a\nb\r\nc' })).toBe('event: token\nid: 7\nretry: 2000\ndata: a\ndata: b\ndata: c\n\n');
    expect(formatSseEvent({ data: undefined })).toBe('data: null\n\n');
  });

  it('refuses a line break in an event name or id, where it would start a new field', () => {
    for (const bad of [{ event: 'a\ndata: forged', data: '' }, { id: '1\r\nevent: x', data: '' }, { retry: -1, data: '' }, { retry: 1.5, data: '' }]) {
      expect(() => formatSseEvent(bad as ServerSentEvent)).toThrowError(expect.objectContaining({ code: 'http/invalid-sse-event' }));
    }
  });
});

describe('encodeSse', () => {
  const onError = (error: unknown): ServerSentEvent => ({ event: 'error', data: { message: (error as Error).message } });

  it('encodes each event and ends with the source', async () => {
    expect(await text(encodeSse(from<ServerSentEvent | string>(['a', { event: 'done', data: 1 }]), 0, onError))).toBe('data: a\n\nevent: done\ndata: 1\n\n');
  });

  it('sends a comment line while the source is quiet, and loses no event to it', async () => {
    async function* slow() {
      yield 'first';
      await sleep(70);
      yield 'second';
    }
    const out = await text(encodeSse(slow(), 20, onError));
    expect(out.startsWith('data: first\n\n: keep-alive\n\n')).toBe(true);
    expect(out.endsWith('data: second\n\n')).toBe(true);
    expect(out.match(/data: /g)).toHaveLength(2);
  });

  it('turns a failure of the source, or an event it can\'t write, into a last error event', async () => {
    async function* failing() {
      yield 'one';
      throw new Error('upstream went away');
    }
    expect(await text(encodeSse(failing(), 0, onError))).toBe('data: one\n\nevent: error\ndata: {"message":"upstream went away"}\n\n');
    const bad = await text(encodeSse(from<ServerSentEvent>([{ event: 'a\nb', data: 1 }, { data: 'never sent' }]), 0, onError));
    expect(bad).toMatch(/^event: error\n/);
    expect(bad).not.toContain('never sent');
  });

  it('ends the source when the reader stops', async () => {
    let cleaned = false;
    async function* source() {
      try {
        yield 'a';
        yield 'b';
      } finally {
        cleaned = true;
      }
    }
    for await (const _chunk of encodeSse(source(), 0, onError)) break;
    await sleep(5);
    expect(cleaned).toBe(true);
  });
});

describe('streaming responses over a socket', () => {
  it('sends server-sent events as they are produced, with the headers a proxy needs', async () => {
    const base = await listen([
      {
        method: 'GET',
        path: '/events',
        handler: async () =>
          sseResponse(
            (async function* () {
              yield { event: 'token', data: 'one' };
              await sleep(150);
              yield { event: 'token', data: 'two' };
            })(),
          ),
      },
    ]);
    const res = await fetch(`${base}/events`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/event-stream; charset=utf-8');
    expect(res.headers.get('cache-control')).toBe('no-cache, no-transform');
    expect(res.headers.get('x-accel-buffering')).toBe('no');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('x-request-id')).toBeTruthy();

    const reader = (res.body as ReadableStream<Uint8Array>).getReader();
    const decoder = new TextDecoder();
    const started = Date.now();
    const first = decoder.decode((await reader.read()).value);
    // The first event arrives well before the second is produced
    expect(first).toBe('event: token\ndata: one\n\n');
    expect(Date.now() - started).toBeLessThan(120);
    let rest = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      rest += decoder.decode(value);
    }
    expect(rest).toBe('event: token\ndata: two\n\n');
  });

  it('ends an event stream with an error event carrying the error envelope', async () => {
    const base = await listen([
      {
        method: 'GET',
        path: '/events',
        handler: async () =>
          sseResponse(
            (async function* () {
              yield 'one';
              throw new MariachiError('notes/not-found', 'No such note');
            })(),
          ),
      },
      {
        method: 'GET',
        path: '/crash',
        handler: async () =>
          sseResponse(
            (async function* (): AsyncGenerator<string> {
              if (Date.now() > 0) throw new Error('secret detail');
              yield 'never';
            })(),
          ),
      },
    ]);
    const body = await (await fetch(`${base}/events`)).text();
    expect(body).toMatch(/^data: one\n\nevent: error\ndata: \{"error":\{"code":"notes\/not-found","message":"No such note","traceId":"[^"]+"\}\}\n\n$/);
    const crash = await (await fetch(`${base}/crash`)).text();
    expect(crash).toContain('"code":"internal","message":"Internal Server Error"');
    expect(crash).not.toContain('secret detail');
    expect(errors).toHaveLength(1);
  });

  it('streams bytes from a generator or a Node stream with the given type', async () => {
    const base = await listen([
      {
        method: 'GET',
        path: '/export.csv',
        handler: async () =>
          streamResponse(
            (async function* () {
              yield 'id,name\n';
              yield new TextEncoder().encode('1,Ada\n');
              yield Buffer.from('2,Lin\n');
            })(),
            { contentType: 'text/csv; charset=utf-8', headers: { 'content-disposition': 'attachment; filename="export.csv"' } },
          ),
      },
      { method: 'GET', path: '/file', handler: async () => streamResponse(Readable.from([Buffer.from([1, 2, 3])]), { status: 206 }) },
    ]);
    const csv = await fetch(`${base}/export.csv`);
    expect(csv.headers.get('content-type')).toBe('text/csv; charset=utf-8');
    expect(csv.headers.get('content-disposition')).toBe('attachment; filename="export.csv"');
    expect(await csv.text()).toBe('id,name\n1,Ada\n2,Lin\n');
    const file = await fetch(`${base}/file`);
    expect(file.status).toBe(206);
    expect(file.headers.get('content-type')).toBe('application/octet-stream');
    expect([...new Uint8Array(await file.arrayBuffer())]).toEqual([1, 2, 3]);
  });

  it('answers with a normal error when the handler throws before it starts streaming', async () => {
    const base = await listen([
      {
        method: 'GET',
        path: '/events',
        handler: async () => {
          throw new MariachiError('notes/not-found', 'No such note');
        },
      },
    ]);
    const res = await fetch(`${base}/events`);
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('stops the source and aborts the signal when the client goes away', async () => {
    let cleaned = false;
    let aborted = false;
    let produced = 0;
    const base = await listen([
      {
        method: 'GET',
        path: '/events',
        handler: async (ctx) => {
          ctx.signal.addEventListener('abort', () => {
            aborted = true;
          });
          return sseResponse(
            (async function* () {
              try {
                for (;;) {
                  yield { data: produced++ };
                  await sleep(10);
                }
              } finally {
                cleaned = true;
              }
            })(),
          );
        },
      },
    ]);
    const client = new AbortController();
    const res = await fetch(`${base}/events`, { signal: client.signal });
    const reader = (res.body as ReadableStream<Uint8Array>).getReader();
    await reader.read();
    client.abort();
    await sleep(150);
    expect(aborted).toBe(true);
    expect(cleaned).toBe(true);
    const then = produced;
    await sleep(60);
    expect(produced).toBe(then);
  });

  it('doesn\'t abort the signal of a request that finished normally', async () => {
    let signal: AbortSignal | undefined;
    const base = await listen([
      {
        method: 'GET',
        path: '/ok',
        handler: async (ctx) => {
          signal = ctx.signal;
          return { ok: true };
        },
      },
    ]);
    await (await fetch(`${base}/ok`)).json();
    await sleep(30);
    expect(signal?.aborted).toBe(false);
  });
});
