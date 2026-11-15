import { describe, expect, it } from 'vitest';
import { Webhook } from 'svix';
import { createContext, type Context } from '@mariachi/core';
import type { IncomingRequest, RequestContext } from '@mariachi/server';
import { ClerkWebhookAuth, ClerkWebhookHandler, clerkIdentity, createClerkMiddleware } from './index';

const silent = { info() {}, warn() {}, error() {}, debug() {}, child() { return silent; } };
const SECRET = `whsec_${Buffer.from('0123456789abcdef0123456789abcdef').toString('base64')}`;

/** Signs a body as Clerk (Svix) does, and returns the three headers. */
function signed(body: string, id = 'msg_1', at = new Date()) {
  return { 'svix-id': id, 'svix-timestamp': String(Math.floor(at.getTime() / 1000)), 'svix-signature': new Webhook(SECRET).sign(id, at, body) };
}

describe('clerkIdentity', () => {
  it('maps the session claims, keeping the whole payload', () => {
    const payload = { sub: 'user_1', sid: 'sess_1', org_id: 'org_1', org_role: 'org:admin', org_permissions: ['org:invoices:read'], azp: 'https://app.example.com' };
    expect(clerkIdentity(payload)).toEqual({
      userId: 'user_1',
      tenantId: 'org_1',
      scopes: ['org:admin', 'org:invoices:read'],
      roles: ['org:admin'],
      identityType: 'session',
      sessionId: 'sess_1',
      claims: payload,
    });
  });

  it('gives a user acting in no organization no tenant', () => {
    expect(clerkIdentity({ sub: 'user_1' })).toMatchObject({ userId: 'user_1', tenantId: '', scopes: [], roles: [] });
  });

  it('refuses a token with no subject, or one that names a reserved tenant', () => {
    expect(() => clerkIdentity({})).toThrow(expect.objectContaining({ code: 'auth/invalid-token' }));
    expect(() => clerkIdentity({ sub: 'mallory', org_id: 'user.app.alice' })).toThrow(expect.objectContaining({ code: 'auth/invalid-token', message: expect.stringContaining('reserved') }));
  });
});

describe('createClerkMiddleware', () => {
  it("puts the verified claims on the context, as the framework's own middleware does", async () => {
    const identity = clerkIdentity({ sub: 'user_1', sid: 'sess_1', org_id: 'org_1', org_role: 'org:admin' });
    const provider = { name: 'clerk', verify: async () => identity, createWebhookHandler: () => new ClerkWebhookHandler(SECRET) };
    const ctx = createContext({ logger: silent }) as Context & { token?: string; jwtClaims?: Record<string, unknown> };
    ctx.token = 't';
    let ran = false;
    await createClerkMiddleware(provider)(ctx, async () => { ran = true; });
    expect(ran).toBe(true);
    expect(ctx).toMatchObject({ userId: 'user_1', tenantId: 'org_1', scopes: ['org:admin'], identityType: 'session', sessionId: 'sess_1' });
    expect(ctx.jwtClaims).toMatchObject({ org_id: 'org_1', org_role: 'org:admin' });
    const none = createContext({ logger: silent });
    await expect(createClerkMiddleware(provider)(none, async () => undefined)).rejects.toMatchObject({ code: 'auth/unauthorized' });
  });
});

describe('ClerkWebhookHandler', () => {
  const handler = new ClerkWebhookHandler(SECRET);

  it('verifies a delivery and takes its id from the signed Svix id', () => {
    const body = JSON.stringify({ type: 'user.created', data: { id: 'user_1' } });
    const event = handler.verify(body, signed(body, 'msg_7'));
    expect(event).toMatchObject({ id: 'msg_7', type: 'user.created', provider: 'clerk', data: { id: 'user_1' } });
    expect(event.tenantId).toBeUndefined();
  });

  it('takes the organization from the signed body', () => {
    const org = JSON.stringify({ type: 'organization.updated', data: { id: 'org_1', name: 'Acme' } });
    expect(handler.verify(org, signed(org)).tenantId).toBe('org_1');
    const membership = JSON.stringify({ type: 'organizationMembership.created', data: { id: 'orgmem_1', organization: { id: 'org_2' }, public_user_data: { user_id: 'user_1' } } });
    expect(handler.verify(membership, signed(membership)).tenantId).toBe('org_2');
  });

  it('refuses a changed body, a changed id, a stale delivery and missing headers', () => {
    const body = JSON.stringify({ type: 'user.created', data: { id: 'user_1' } });
    const failed = expect.objectContaining({ code: 'auth/webhook-verification-failed' });
    expect(() => handler.verify(`${body} `, signed(body))).toThrow(failed);
    // The id is part of what's signed, so a replay can't be given a new one.
    expect(() => handler.verify(body, { ...signed(body, 'msg_1'), 'svix-id': 'msg_2' })).toThrow(failed);
    expect(() => handler.verify(body, signed(body, 'msg_1', new Date(Date.now() - 3600_000)))).toThrow(failed);
    expect(() => handler.verify(body, {})).toThrow(failed);
  });
});

describe('ClerkWebhookAuth', () => {
  const auth = new ClerkWebhookAuth(SECRET);
  const ctx = { logger: silent } as unknown as RequestContext;
  const request = (body: string, headers: Record<string, string>) => ({ headers, rawBody: Buffer.from(body), params: {} }) as unknown as IncomingRequest;

  it('returns the signed Svix id as the event id, so the webhook server can deduplicate', async () => {
    const body = JSON.stringify({ type: 'user.created', data: { id: 'user_1' } });
    expect(await auth.auth(request(body, signed(body, 'msg_9')), ctx)).toMatchObject({ provider: 'clerk', verified: true, eventId: 'msg_9' });
    expect(await auth.auth(request(`${body} `, signed(body, 'msg_9')), ctx)).toBeNull();
    expect(await auth.auth(request(body, {}), ctx)).toBeNull();
  });
});
