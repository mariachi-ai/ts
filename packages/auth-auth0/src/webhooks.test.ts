import type { AuthWebhookEvent } from '@mariachi/auth';
import { TestTracer } from '@mariachi/testing';
import { WebhookServer } from '@mariachi/webhooks';
import { describe, expect, it } from 'vitest';
import { Auth0AuthProvider } from './provider';
import { auth0Event, auth0User, auth0WebhookDelivery } from './testing';
import { Auth0WebhookAuth, Auth0WebhookController, auth0BearerMatches, auth0EventType } from './webhooks';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const token = 'stream-token-0123456789abcdef';

function server(tracer = new TestTracer()) {
  const received: AuthWebhookEvent[] = [];
  const communication = { call: async (_ctx: unknown, _name: string, input: unknown) => { received.push(input as AuthWebhookEvent); return { ok: true }; } } as never;
  const s = new WebhookServer({ name: 'webhooks', logger }, { communication, tracer }).registerController(new Auth0WebhookController({ token }));
  return { s, received, tracer };
}

describe('event stream webhooks', () => {
  it('receives an event with the right bearer token through WebhookServer, normalized, with its span', async () => {
    const { s, received, tracer } = server();
    const user = auth0User({ user_id: 'auth0|u1', email: 'ada@example.com', email_verified: true });
    const event = auth0Event('user.created', user, { id: 'evt_1' });
    const { rawBody, headers } = auth0WebhookDelivery(event, token);
    const res = await s.inject({ method: 'POST', url: '/auth0/events', headers, payload: rawBody });
    expect(res.statusCode).toBe(200);
    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({ id: 'evt_1', type: 'user.created', provider: 'auth0', data: { user_id: 'auth0|u1', email: 'ada@example.com' }, timestamp: Date.parse('2026-11-21T10:00:01.000Z') });
    expect(tracer.spans.map((sp) => [sp.name, sp.kind, sp.attributes['mariachi.integration.event']])).toEqual([['auth0 webhook', 'server', 'user.created']]);
  });

  it('refuses a wrong token, a missing one, and a bare token without "Bearer"', async () => {
    const { s, received } = server();
    const event = auth0Event('user.deleted');
    const body = JSON.stringify(event);
    const attempts: Record<string, string>[] = [{ authorization: 'Bearer someone-else' }, {}, { authorization: token }];
    for (const headers of attempts) {
      const res = await s.inject({ method: 'POST', url: '/auth0/events', headers: { 'content-type': 'application/json', ...headers }, payload: body });
      expect(res.statusCode).toBe(401);
    }
    expect(received).toHaveLength(0);
  });

  it('reads the com.auth0. form of the type the same way', () => {
    expect(auth0EventType({ type: 'com.auth0.user.updated' })).toBe('user.updated');
    expect(auth0EventType({})).toBeUndefined();
  });

  it('accepts either token while one is rotated, and needs one', () => {
    expect(auth0BearerMatches(`Bearer ${token}`, ['new-token', token])).toBe(true);
    expect(auth0BearerMatches('Bearer new-token', ['new-token', token])).toBe(true);
    expect(auth0BearerMatches(`Bearer ${token}x`, token)).toBe(false);
    expect(() => new Auth0WebhookAuth('')).toThrow(expect.objectContaining({ code: 'webhooks/invalid-secret' }));
  });
});

describe('the dispatcher handler', () => {
  const handler = new Auth0AuthProvider({ domain: 'acme.us.auth0.com', audience: 'a' }).createWebhookHandler({ secret: token });

  it('verifies the token and normalizes the event for createAuthWebhookDispatcher', () => {
    const event = auth0Event('com.auth0.user.updated', auth0User({ user_id: 'auth0|u2' }), { id: 'evt_2' });
    const { rawBody, headers } = auth0WebhookDelivery(event, token);
    expect(handler.verify(rawBody, headers)).toMatchObject({ id: 'evt_2', type: 'user.updated', provider: 'auth0', data: { user_id: 'auth0|u2' } });
  });

  it('refuses a forged or malformed delivery', () => {
    const { rawBody } = auth0WebhookDelivery(auth0Event('user.created'), token);
    expect(() => handler.verify(rawBody, { authorization: 'Bearer nope' })).toThrow(expect.objectContaining({ code: 'auth/webhook-verification-failed' }));
    expect(() => handler.verify(rawBody, {})).toThrow(expect.objectContaining({ code: 'auth/webhook-verification-failed' }));
    expect(() => handler.verify('{"not":"an event"}', { authorization: `Bearer ${token}` })).toThrow(expect.objectContaining({ code: 'auth/webhook-invalid-payload' }));
  });
});
