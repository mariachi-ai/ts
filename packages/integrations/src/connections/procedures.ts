import type { CommunicationLayer } from '@mariachi/communication';
import { z } from 'zod';
import type { Connections } from './connections';
import { CONNECTION_STATUSES } from './types';

/** A connection as the API returns it: never a token. */
export const connectionSchema = z.object({
  id: z.string(),
  provider: z.string(),
  accountId: z.string().nullable(),
  scopes: z.array(z.string()),
  status: z.enum(CONNECTION_STATUSES),
  expiresAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const provider = z.string().regex(/^[a-z][a-z0-9-]{0,63}$/, 'an integration id, such as hubspot');

/** The names of the procedures `registerConnectionProcedures` registers. */
export const CONNECTION_PROCEDURES = [
  'integrations.connections.list',
  'integrations.connections.authorize',
  'integrations.connections.complete',
  'integrations.connections.revoke',
] as const;

/**
 * Registers the connections procedures, so controllers (the one in `@mariachi/integrations/http`, or your own)
 * call them instead of the service. Each acts for the signed-in user (`ctx.userId`) only.
 */
export function registerConnectionProcedures(communication: Pick<CommunicationLayer, 'register'>, connections: Connections): void {
  const out = (c: z.infer<typeof connectionSchema>) => connectionSchema.parse(c);

  communication.register('integrations.connections.list', {
    schema: { input: z.object({}).optional(), output: z.array(connectionSchema) },
    handler: async (ctx) => (await connections.list(ctx)).map(out),
  });

  communication.register('integrations.connections.authorize', {
    schema: { input: z.object({ provider }), output: z.object({ url: z.string().url() }) },
    handler: (ctx, input) => connections.authorize(ctx, input.provider),
  });

  communication.register('integrations.connections.complete', {
    schema: {
      input: z.object({ provider, code: z.string().min(1).max(4096), state: z.string().min(1).max(200) }),
      output: connectionSchema,
    },
    handler: async (ctx, input) => out(await connections.complete(ctx, input.provider, { code: input.code, state: input.state })),
  });

  communication.register('integrations.connections.revoke', {
    schema: { input: z.object({ connectionId: z.string().uuid() }), output: z.object({ revokedAtProvider: z.boolean() }) },
    handler: (ctx, input) => connections.revoke(ctx, input.connectionId),
  });
}
