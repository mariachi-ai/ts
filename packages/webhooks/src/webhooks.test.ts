import { createHmac, timingSafeEqual } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { InMemoryIdempotencyStore, type Context } from '@mariachi/core';
import { type IncomingRequest, httpResponse } from '@mariachi/server';
import { SignatureAuthController, WebhookController, WebhookServer, redactHeaders, type WebhookLogStore } from './index';

const silent = { info() {}, warn() {}, error() {}, debug() {}, child() { return silent; } };
const SECRET = 'whsec';

const check = (sig: string, raw: Buffer, secret: string) => {
  const expected = Buffer.from(createHmac('sha256', secret).update(raw).digest('hex'));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
};

/** A custom scheme with one shared secret: the tenant comes from the signed body. */
class AcmeAuth extends SignatureAuthController {
  readonly provider = 'acme';
  readonly signatureHeader = 'x-acme-signature';
  protected signingSecrets() {
    return SECRET;
  }
  protected verifySignature(sig: string, raw: Buffer, secret: string) {
    return check(sig, raw, secret);
  }
  protected tenantFromPayload(payload: unknown) {
    return (payload as { tenant?: string } | undefined)?.tenant;
  }
}

/** The same scheme with a secret per tenant: the path names the tenant. */
class PerTenantAuth extends SignatureAuthController {
  readonly provider = 'acme-tenants';
  readonly signatureHeader = 'x-acme-signature';
  protected tenantFromRequest(req: IncomingRequest) {
    return req.params.tenant;
  }
  protected tenantSigningSecrets(tenantId: string) {
    return ({ t42: ['rotated-42', 'secret-42'], t99: 'secret-99' } as Record<string, string | string[]>)[tenantId];
  }
  protected verifySignature(sig: string, raw: Buffer, secret: string) {
    return check(sig, raw, secret);
  }
}

/** The mistake the base class refuses: a tenant from the path, under one shared secret. */
class UnsafeAuth extends SignatureAuthController {
  readonly provider = 'unsafe';
  readonly signatureHeader = 'x-acme-signature';
  protected signingSecrets() {
    return SECRET;
  }
  protected tenantFromRequest(req: IncomingRequest) {
    return req.params.tenant;
  }
  protected verifySignature(sig: string, raw: Buffer, secret: string) {
    return check(sig, raw, secret);
  }
}

class AcmeController extends WebhookController {
  readonly prefix = 'acme';
  constructor(readonly auth: SignatureAuthController = new AcmeAuth()) {
    super();
  }
  init() {
    this.post(':tenant/events', { mode: 'direct', procedure: 'acme.event' }, async (_ctx, body) => body);
  }
}

function memoryLogStore() {
  const entries: Array<{ headers: Record<string, string>; status: string }> = [];
  const store: WebhookLogStore = {
    async log(e) {
      entries.push({ headers: e.headers, status: e.status });
      return String(entries.length);
    },
    async update(id, patch) {
      if (patch.status) entries[Number(id) - 1].status = patch.status;
    },
    async query() {
      return [];
    },
    async cleanup() {
      return 0;
    },
  };
  return { store, entries };
}

describe('webhooks', () => {
  it('verifies raw body, carries tenant, redacts headers and dedups deliveries', async () => {
    const calls: Array<{ ctx: Context; input: unknown }> = [];
    const communication = {
      call: async (ctx: Context, _name: string, input: unknown) => {
        calls.push({ ctx, input });
        return { ok: true };
      },
    } as never;
    const { store, entries } = memoryLogStore();
    const server = new WebhookServer(
      { name: 'webhooks', logger: silent },
      { communication, logStore: store, idempotency: new InMemoryIdempotencyStore() },
    ).registerController(new AcmeController());

    const payload = '{"type":"invoice.paid","tenant":"t42"}';
    const sig = createHmac('sha256', SECRET).update(payload).digest('hex');
    const headers = { 'content-type': 'application/json', 'x-acme-signature': sig, 'x-acme-delivery': 'evt_1', authorization: 'Bearer x' };
    // Posted to another tenant's path: the tenant is the one in the signed body.
    const first = await server.inject({ method: 'POST', url: '/acme/t99/events', headers, payload });
    expect(first.statusCode).toBe(200);
    expect(calls[0].ctx.tenantId).toBe('t42');
    expect(calls[0].input).toEqual({ type: 'invoice.paid', tenant: 't42' });
    expect(entries[0].headers['x-acme-signature']).toBe('[redacted]');
    expect(entries[0].headers.authorization).toBe('[redacted]');
    expect(entries[0].status).toBe('processed');

    const dup = await server.inject({ method: 'POST', url: '/acme/t42/events', headers, payload });
    expect(dup.json()).toMatchObject({ duplicate: true });
    // A replay under a new delivery id is still a duplicate: that header isn't signed, the body is.
    const replay = await server.inject({ method: 'POST', url: '/acme/t42/events', headers: { ...headers, 'x-acme-delivery': 'evt_2' }, payload });
    expect(replay.json()).toMatchObject({ duplicate: true });
    expect(calls).toHaveLength(1);

    const bad = await server.inject({ method: 'POST', url: '/acme/t42/events', headers: { ...headers, 'x-acme-delivery': 'evt_3' }, payload: '{"type":"tampered"}' });
    expect(bad.statusCode).toBe(401);
  });

  it('a custom scheme with a secret per tenant only counts a delivery for the tenant whose secret signed it', async () => {
    const calls: Array<{ ctx: Context }> = [];
    const communication = { call: async (ctx: Context) => { calls.push({ ctx }); return { ok: true }; } } as never;
    const server = new WebhookServer({ name: 'webhooks', logger: silent }, { communication, idempotency: new InMemoryIdempotencyStore() }).registerController(
      new AcmeController(new PerTenantAuth()),
    );
    const payload = '{"type":"invoice.paid"}';
    const post = (tenant: string, secret: string) =>
      server.inject({ method: 'POST', url: `/acme/${tenant}/events`, headers: { 'content-type': 'application/json', 'x-acme-signature': createHmac('sha256', secret).update(payload).digest('hex') }, payload });

    expect((await post('t42', 'secret-42')).statusCode).toBe(200);
    expect((await post('t99', 'secret-42')).statusCode).toBe(401);
    expect((await post('t7', 'secret-42')).statusCode).toBe(401);
    // The same body for another tenant, signed by that tenant, is its own delivery.
    expect((await post('t99', 'secret-99')).json()).not.toMatchObject({ duplicate: true });
    expect(calls.map((call) => call.ctx.tenantId)).toEqual(['t42', 't99']);
    // Either of a tenant's secrets is accepted during a rotation; the repeat is a duplicate.
    expect((await post('t42', 'rotated-42')).json()).toMatchObject({ duplicate: true });
  });

  it('refuses a tenant taken from the path under one shared secret', async () => {
    const communication = { call: async () => ({ ok: true }) } as never;
    const server = new WebhookServer({ name: 'webhooks', logger: silent }, { communication }).registerController(new AcmeController(new UnsafeAuth()));
    const payload = '{"type":"invoice.paid"}';
    const res = await server.inject({
      method: 'POST',
      url: '/acme/t42/events',
      headers: { 'content-type': 'application/json', 'x-acme-signature': createHmac('sha256', SECRET).update(payload).digest('hex') },
      payload,
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(500);
    expect(res.json<{ error: { code: string } }>().error.code).toBe('webhooks/unauthenticated-tenant');
  });

  it('gives each delivery a SERVER span: the provider, the event type the route reads, and whether it was accepted', async () => {
    const spans: Array<{ name: string; kind?: string; attributes: Record<string, unknown>; status?: string; ended: boolean }> = [];
    const tracer = {
      startSpan(name: string, attributes: Record<string, string | number | boolean> = {}, options: { kind?: string } = {}) {
        const span = { name, kind: options.kind, attributes: { ...attributes } as Record<string, unknown>, status: undefined as string | undefined, ended: false };
        spans.push(span);
        return {
          setAttribute: (k: string, v: unknown) => {
            span.attributes[k] = v;
          },
          setStatus: (st: 'ok' | 'error') => {
            span.status = st;
          },
          end: () => {
            span.ended = true;
          },
        };
      },
      withSpan: async <T>(_n: string, fn: (s: never) => Promise<T>) => fn({} as never),
    };
    class TypedController extends AcmeController {
      init() {
        this.post(':tenant/events', { mode: 'direct', procedure: 'acme.event', eventType: (p) => (p as { type?: string }).type }, async (_ctx, body) => body);
      }
    }
    const communication = { call: async () => ({ ok: true }) } as never;
    const server = new WebhookServer({ name: 'webhooks', logger: silent }, { communication, tracer }).registerController(new TypedController());
    const payload = '{"type":"invoice.paid","tenant":"t42"}';
    const sig = createHmac('sha256', SECRET).update(payload).digest('hex');
    expect((await server.inject({ method: 'POST', url: '/acme/t42/events', headers: { 'content-type': 'application/json', 'x-acme-signature': sig }, payload })).statusCode).toBe(200);
    expect((await server.inject({ method: 'POST', url: '/acme/t42/events', headers: { 'content-type': 'application/json', 'x-acme-signature': 'nope' }, payload })).statusCode).toBe(401);
    expect(spans.map((s) => [s.name, s.kind, s.attributes['mariachi.integration'], s.attributes['mariachi.integration.event'], s.status, s.ended])).toEqual([
      ['acme webhook', 'server', 'acme', 'invoice.paid', 'ok', true],
      ['acme webhook', 'server', 'acme', undefined, 'error', true],
    ]);
    expect(spans[1]!.attributes['error.type']).toBe('webhooks/unauthorized');
  });

  it("answers a sender's endpoint check before authenticating, and never hands it to the route", async () => {
    let handled = 0;
    class GraphLikeAuth extends AcmeAuth {
      handshake(req: IncomingRequest) {
        const token = req.query.validationToken;
        return typeof token === 'string' ? httpResponse(200, token, { 'content-type': 'text/plain' }) : undefined;
      }
    }
    class CheckedController extends AcmeController {
      init() {
        this.post(':tenant/events', { mode: 'direct', procedure: 'acme.event' }, async (_ctx, body) => {
          handled += 1;
          return body;
        });
      }
    }
    const communication = { call: async () => ({ ok: true }) } as never;
    const server = new WebhookServer({ name: 'webhooks', logger: silent }, { communication }).registerController(new CheckedController(new GraphLikeAuth()));
    const check = await server.inject({ method: 'POST', url: '/acme/t42/events?validationToken=abc%20123' });
    expect([check.statusCode, check.body]).toEqual([200, 'abc 123']);
    expect((await server.inject({ method: 'POST', url: '/acme/t42/events', headers: { 'content-type': 'application/json' }, payload: '{}' })).statusCode).toBe(401);
    expect(handled).toBe(0);
  });

  it("answers a sender's HEAD check of a route's address with an empty 200, never reaching the route", async () => {
    let handled = 0;
    class CountingController extends AcmeController {
      init() {
        this.post(':tenant/events', { mode: 'direct', procedure: 'acme.event' }, async (_ctx, body) => {
          handled += 1;
          return body;
        });
      }
    }
    const communication = { call: async () => ({ ok: true }) } as never;
    const server = new WebhookServer({ name: 'webhooks', logger: silent }, { communication }).registerController(new CountingController());
    const head = await server.inject({ method: 'HEAD', url: '/acme/t42/events' });
    expect([head.statusCode, head.body, handled]).toEqual([200, '', 0]);
  });

  it('redactHeaders masks credentials and signatures', () => {
    expect(redactHeaders({ 'stripe-signature': 'x', cookie: 'y', 'x-custom': 'z' }, ['x-custom'])).toEqual({
      'stripe-signature': '[redacted]',
      cookie: '[redacted]',
      'x-custom': '[redacted]',
    });
  });
});
describe('SignatureAuthController subclasses', () => {
  it('may keep their secret in a field called `secret`, the obvious name for it', async () => {
    class FieldAuth extends SignatureAuthController {
      readonly provider = 'field';
      readonly signatureHeader = 'x-acme-signature';
      constructor(private readonly secret: string) {
        super();
      }
      protected signingSecrets() {
        return this.secret;
      }
      protected verifySignature(sig: string, raw: Buffer, secret: string) {
        return check(sig, raw, secret);
      }
    }
    const communication = { call: async () => ({ ok: true }) } as never;
    const server = new WebhookServer({ name: 'webhooks', logger: silent }, { communication }).registerController(new AcmeController(new FieldAuth(SECRET)));
    const payload = '{"type":"invoice.paid"}';
    const res = await server.inject({
      method: 'POST',
      url: '/acme/t42/events',
      headers: { 'content-type': 'application/json', 'x-acme-signature': createHmac('sha256', SECRET).update(payload).digest('hex') },
      payload,
    });
    expect(res.statusCode).toBe(200);
  });
});
