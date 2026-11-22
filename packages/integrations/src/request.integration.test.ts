// providerRequest against a provider stand-in on a local port, over real fetch and real headers: what a
// scripted fetch can't show (how headers merge on the wire, a real 204, a real Retry-After).
import { type IncomingMessage, type Server, type ServerResponse, createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createContext } from '@mariachi/core';
import { TestTracer } from '@mariachi/testing';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ProviderError } from './provider-error';
import { providerRequest } from './request';
import { assertProviderSpans } from './testing';

interface Seen {
  method: string;
  path: string;
  headers: IncomingMessage['headers'];
  body: string;
}

type Handler = (req: Seen, res: ServerResponse) => void;

const logger = {
  info() {},
  warn() {},
  error() {},
  debug() {},
  child() {
    return logger;
  },
};
const ctx = createContext({ logger, tenantId: 'tenant-1' });
const call = { integration: 'acme', operation: 'widgets.create', category: 'crm', server: '127.0.0.1' };
const Widget = z.object({ id: z.string() });
class AcmeError extends ProviderError {}

let server: Server;
let base: string;
let seen: Seen[] = [];
let script: Handler[] = [];

beforeAll(async () => {
  server = createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      const request = { method: req.method ?? 'GET', path: req.url ?? '/', headers: req.headers, body };
      seen.push(request);
      const next = script.shift();
      if (!next) {
        res.writeHead(500).end();
        return;
      }
      next(request, res);
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

beforeEach(() => {
  seen = [];
  script = [];
});

const json =
  (status: number, body: unknown, headers: Record<string, string> = {}): Handler =>
  (_req, res) => {
    res.writeHead(status, { 'content-type': 'application/json', ...headers }).end(JSON.stringify(body));
  };

describe('providerRequest against a provider stand-in', () => {
  it("sends one Accept and one Content-Type, the caller's, and the same idempotency key on every attempt", async () => {
    script = [json(429, { error: 'slow_down' }, { 'retry-after': '0' }), json(201, { id: 'w1' })];
    const out = await providerRequest(
      ctx,
      call,
      {
        method: 'POST',
        url: `${base}/v1/widgets`,
        headers: {
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          Authorization: 'Bearer t',
        },
        json: { name: 'x' },
        idempotencyKey: { header: 'Idempotency-Key', value: 'k1' },
      },
      { schema: Widget, error: AcmeError },
    );
    expect(out).toEqual({ id: 'w1' });
    expect(seen).toHaveLength(2);
    for (const request of seen) {
      expect(request.headers.accept).toBe('application/vnd.api+json');
      expect(request.headers['content-type']).toBe('application/vnd.api+json');
      expect(request.headers['idempotency-key']).toBe('k1');
      expect(request.body).toBe('{"name":"x"}');
    }
  });

  it('sends a form body and a query string', async () => {
    script = [json(200, { id: 'w2' })];
    await providerRequest(
      ctx,
      call,
      {
        method: 'POST',
        url: `${base}/v1/token`,
        query: { a: 1, b: undefined },
        form: { grant_type: 'client_credentials', scope: 'read write' },
      },
      { schema: Widget },
    );
    expect(seen[0]).toMatchObject({ path: '/v1/token?a=1', body: 'grant_type=client_credentials&scope=read+write' });
    expect(seen[0]!.headers['content-type']).toBe('application/x-www-form-urlencoded');
  });

  it('reads a real 204 as no body', async () => {
    script = [(_req, res) => res.writeHead(204).end()];
    await expect(
      providerRequest(
        ctx,
        { ...call, operation: 'widgets.delete' },
        { method: 'DELETE', url: `${base}/v1/widgets/w1` },
        { schema: z.null() },
      ),
    ).resolves.toBeNull();
  });

  it("turns the provider's error body into the integration's error, its code but never its message, with one span", async () => {
    const tracer = new TestTracer();
    script = [json(422, { code: 'NAME_TAKEN', message: 'ada@example.com already has a widget named x' })];
    const err = await providerRequest(
      ctx,
      call,
      { method: 'POST', url: `${base}/v1/widgets`, json: { name: 'x' } },
      {
        schema: Widget,
        error: AcmeError,
        failure: (_status, body) => ({ reason: 'name-taken', providerCode: (body as { code: string }).code }),
        deps: { tracer },
      },
    ).catch((e) => e);
    expect(err).toBeInstanceOf(AcmeError);
    expect(err).toMatchObject({
      code: 'acme/name-taken',
      category: 'invalid-request',
      providerCode: 'NAME_TAKEN',
      status: 422,
    });
    expect(err.message).not.toContain('example.com');
    expect(tracer.spans).toHaveLength(1);
    expect(tracer.spans[0]!.attributes).toMatchObject({ 'error.type': 'NAME_TAKEN', 'http.response.status_code': 422 });
    assertProviderSpans(tracer.spans);
    expect(JSON.stringify(tracer.spans)).not.toContain('example.com');
  });

  it("fails at once on a Retry-After longer than the app allows, and stops at the caller's deadline", async () => {
    script = [json(503, {}, { 'retry-after': '120' })];
    await expect(
      providerRequest(ctx, call, { method: 'GET', url: `${base}/v1/widgets/w1` }, { schema: Widget }),
    ).rejects.toMatchObject({ code: 'acme/unavailable', retryAfterMs: 120_000 });
    expect(seen).toHaveLength(1);

    // A provider that hangs: the caller's signal ends the request itself
    script = [() => {}];
    const started = Date.now();
    await expect(
      providerRequest(
        ctx,
        call,
        { method: 'GET', url: `${base}/v1/widgets/w1` },
        { schema: Widget, deps: { signal: AbortSignal.timeout(100) } },
      ),
    ).rejects.toThrow();
    expect(Date.now() - started).toBeLessThan(2_000);
  });
});
