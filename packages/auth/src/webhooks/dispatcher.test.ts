import { describe, expect, it } from 'vitest';
import { InMemoryIdempotencyStore, type Context } from '@mariachi/core';
import type { CommunicationLayer } from '@mariachi/communication';
import { createAuthWebhookDispatcher } from './dispatcher';
import type { AuthWebhookEvent, AuthWebhookHandler } from './types';

const silent = { info() {}, warn() {}, error() {}, debug() {}, child() { return silent; } };

function setup(event: Partial<AuthWebhookEvent>) {
  const calls: Array<{ ctx: Context; name: string; input: unknown }> = [];
  const communication = {
    has: () => true,
    call: async (ctx: Context, name: string, input: unknown) => {
      calls.push({ ctx, name, input });
      return undefined;
    },
  } as unknown as CommunicationLayer;
  const handler: AuthWebhookHandler = {
    verify: () => ({ id: 'evt_1', type: 'user.created', provider: 'test', data: { id: 'user_1' }, raw: {}, ...event }),
  };
  const dispatcher = createAuthWebhookDispatcher({ handler, communication, logger: silent, idempotency: new InMemoryIdempotencyStore() });
  return { calls, dispatcher };
}

describe('createAuthWebhookDispatcher', () => {
  it("calls the event's procedure in the event's tenant, once", async () => {
    const { calls, dispatcher } = setup({ tenantId: 'org_1' });
    expect(await dispatcher.handle('{}', {})).toMatchObject({ procedure: 'auth.user.created', dispatched: true });
    expect(await dispatcher.handle('{}', {})).toMatchObject({ dispatched: false, duplicate: true });
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ name: 'auth.user.created', input: { id: 'user_1' } });
    expect(calls[0].ctx).toMatchObject({ tenantId: 'org_1', identityType: 'webhook', userId: null });
  });

  it('refuses an event whose tenant is in the reserved personal-tenant namespace', async () => {
    const { calls, dispatcher } = setup({ tenantId: 'user.app.alice' });
    await expect(dispatcher.handle('{}', {})).rejects.toMatchObject({ code: 'auth/webhook-invalid-payload', message: expect.stringContaining('reserved') });
    expect(calls).toHaveLength(0);
  });
});
