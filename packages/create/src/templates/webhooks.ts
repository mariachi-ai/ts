import { MARKERS } from '../layout';
import type { Names } from '../names';

/**
 * `src/webhooks/index.ts`: the webhook server and the controllers on it. In every new project;
 * written by `generate webhook` in an older one.
 */
export const WEBHOOKS_INDEX = `import { DrizzleWebhookDedup } from '@mariachi/auth/postgres';
import type { CommunicationLayer } from '@mariachi/communication';
import type { AppConfig, Secrets } from '@mariachi/config';
import { ConfigError, type Logger, type TracerAdapter } from '@mariachi/core';
import type { DrizzleDb } from '@mariachi/database-postgres';
import type { JobQueue } from '@mariachi/jobs';
import type { Lifecycle } from '@mariachi/lifecycle';
import { WebhookServer, type WebhookController } from '@mariachi/webhooks';
// ${MARKERS.imports}

export interface WebhookDeps {
  config: AppConfig;
  secrets: Secrets;
  lifecycle: Lifecycle;
  logger: Logger;
  tracer?: TracerAdapter;
  db: DrizzleDb;
  /** Where a route in queue mode enqueues its job. */
  jobQueue: JobQueue;
  /** What a route in direct mode calls its procedure on. */
  communication: CommunicationLayer;
}

/**
 * Webhooks: calls from other services, signed with a secret you share with them. They have their
 * own server under /webhooks on WEBHOOK_PORT (default 3002), so the API's sign-in, rate limits and
 * body limit don't apply to them, and the port can be exposed on its own. On every delivery the
 * server checks the signature over the raw body, answers one it has seen before as a duplicate
 * (src/schema/webhooks.ts), then hands it to a job (or a procedure) and answers at once.
 * \`mariachi generate webhook <name>\` adds one here. With none, no server starts.
 */
export async function setupWebhooks(deps: WebhookDeps): Promise<WebhookServer | undefined> {
  /** A webhook with its signing secret. In production a missing secret stops the app; elsewhere the webhook is left off. */
  const signed = async (secretName: string, controller: (secret: string) => WebhookController): Promise<WebhookController[]> => {
    const secret = await deps.secrets.get(secretName);
    if (secret) return [controller(secret)];
    if (deps.config.env === 'production') throw new ConfigError('app/webhook-secret-required', \`\${secretName} is required\`);
    deps.logger.warn({ secret: secretName }, 'a webhook is off: its signing secret is not set');
    return [];
  };
  const controllers: WebhookController[] = [
    // ${MARKERS.webhooks}
  ];
  if (controllers.length === 0) return undefined;

  const server = new WebhookServer(
    { name: 'webhooks', prefix: '/webhooks', logger: deps.logger, tracer: deps.tracer, trustProxy: deps.config.server.trustProxy },
    { jobQueue: deps.jobQueue, communication: deps.communication, idempotency: new DrizzleWebhookDedup(deps.db) },
  );
  for (const controller of controllers) server.registerController(controller);
  deps.lifecycle.startup.register({
    name: 'webhooks',
    priority: 100,
    fn: async () => {
      const address = await server.listen(deps.config.server.webhookPort, deps.config.server.host);
      deps.logger.info({ address }, 'Webhooks listening');
    },
  });
  deps.lifecycle.shutdown.register({ name: 'webhooks', priority: 100, fn: () => server.close() });
  return server;
}
`;

/** `src/schema/webhooks.ts`: the table deliveries are deduplicated in. Written by the first `generate webhook`. */
export const WEBHOOKS_SCHEMA_FILE = 'src/schema/webhooks.ts';
export const WEBHOOKS_SCHEMA = `/** Webhook deliveries already handled (src/webhooks/index.ts), so a redelivery isn't handled twice. */
export { authWebhookDedupTable } from '@mariachi/auth/schema';
`;

/** The environment variable holding a webhook's signing secret: `ACME_WEBHOOK_SECRET`. */
export const webhookSecretName = (n: Names): string => `${n.kebab.replace(/-/g, '_').toUpperCase()}_WEBHOOK_SECRET`;

export function webhookFiles(n: Names): Record<string, string> {
  return {
    [`src/contracts/${n.kebab}-webhook.ts`]: webhookContract(n),
    [`src/webhooks/${n.kebab}.controller.ts`]: webhookController(n),
    [`src/webhooks/${n.kebab}.controller.test.ts`]: webhookTest(n),
    [`src/jobs/${n.kebab}-webhook.job.ts`]: webhookJob(n),
  };
}

const webhookContract = (n: Names) => `import { z } from 'zod';

/**
 * What ${n.pascal} posts, checked once its signature is. Describe the fields you use; any others are
 * dropped. A body this refuses is answered 400.
 */
export const ${n.camel}WebhookPayload = z.object({
  type: z.string().min(1),
  data: z.object({ id: z.string().min(1) }),
});

/** What the ${n.kebab}-webhook job is given. */
export const ${n.camel}WebhookJobData = z.object({
  type: z.string(),
  id: z.string(),
});

export type ${n.pascal}WebhookPayload = z.infer<typeof ${n.camel}WebhookPayload>;
export type ${n.pascal}WebhookJobData = z.infer<typeof ${n.camel}WebhookJobData>;
`;

const webhookController = (n: Names) => `import { fromZodError } from '@mariachi/core';
import { StandardWebhookAuth, WebhookController } from '@mariachi/webhooks';
import { ${n.camel}WebhookPayload, type ${n.pascal}WebhookJobData } from '../contracts/${n.kebab}-webhook';

/**
 * Deliveries from ${n.pascal}: POST /webhooks/${n.kebab}/events, on WEBHOOK_PORT.
 *
 * Signed with the Standard Webhooks scheme (webhook-id, webhook-timestamp and webhook-signature
 * headers; Svix's svix-* names work too) and the secret in ${webhookSecretName(n)} (whsec_...).
 * A delivery more than five minutes old is refused, and its signed id is what a redelivery is
 * recognised by. For a sender with another scheme, swap the authenticator: GitHubWebhookAuth,
 * StripeWebhookAuth or HmacWebhookAuth (node_modules/@mariachi/core/docs/recipes/add-webhook-endpoint.md).
 */
export class ${n.pascal}WebhookController extends WebhookController {
  readonly prefix = '${n.kebab}';
  readonly auth: StandardWebhookAuth;

  constructor(secret: string) {
    super();
    // Deliveries belong to no tenant. When they name one, take it from the signed body, never the URL:
    //   new StandardWebhookAuth({ secret, provider: '${n.kebab}', tenantFromPayload: (body) => (body as { account?: string })?.account })
    this.auth = new StandardWebhookAuth({ secret, provider: '${n.kebab}' });
  }

  init(): void {
    // Queue mode: answered 202 once the job is enqueued; the job does the work, with retries. For a
    // quick answer from a procedure instead: { mode: 'direct', procedure: '<domain>.<action>' }.
    this.post('/events', { mode: 'queue', jobName: '${n.kebab}-webhook' }, async (_ctx, body): Promise<${n.pascal}WebhookJobData> => {
      const parsed = ${n.camel}WebhookPayload.safeParse(body);
      if (!parsed.success) throw fromZodError(parsed.error, 'Invalid ${n.kebab} webhook payload');
      return { type: parsed.data.type, id: parsed.data.data.id };
    });
  }
}
`;

const webhookJob = (n: Names) => `import { defineJob } from '@mariachi/jobs';
import { ${n.camel}WebhookJobData } from '../contracts/${n.kebab}-webhook';

/**
 * Handles one ${n.pascal} delivery, enqueued by its webhook (src/webhooks/${n.kebab}.controller.ts). The
 * job id is the delivery's, so a redelivery isn't enqueued twice while the first waits. A retry
 * runs it again: keep what it does safe to repeat.
 */
export const ${n.camel}WebhookJob = defineJob({
  name: '${n.kebab}-webhook',
  schema: ${n.camel}WebhookJobData,
  retry: { attempts: 5, backoff: 'exponential', delay: 2_000 },
  timeoutMs: 60_000,
  handler: async (ctx, data) => {
    ctx.logger.info({ type: data.type, id: data.id, attempt: ctx.attemptNumber }, '${n.kebab} webhook');
  },
});
`;

const webhookTest = (n: Names) => `import { describe, expect, it, vi } from 'vitest';
import { InMemoryIdempotencyStore, type Logger } from '@mariachi/core';
import type { JobQueue } from '@mariachi/jobs';
import { signStandardWebhook, WebhookServer } from '@mariachi/webhooks';
import { ${n.pascal}WebhookController } from './${n.kebab}.controller';

const logger = { debug() {}, info() {}, warn() {}, error() {}, child: () => logger } as unknown as Logger;
const key = Buffer.from('a signing key for the tests only');
const secret = \`whsec_\${key.toString('base64')}\`;
const event = { type: 'thing.updated', data: { id: 'thing-1' } };

function setup() {
  const enqueue = vi.fn(async (_name: string, _data: unknown, _options?: unknown) => 'job-1');
  const server = new WebhookServer(
    { name: 'webhooks', prefix: '/webhooks', logger },
    { jobQueue: { enqueue } as unknown as JobQueue, idempotency: new InMemoryIdempotencyStore() },
  ).registerController(new ${n.pascal}WebhookController(secret));
  return { enqueue, server };
}

/** A delivery as ${n.pascal} sends it: the body, signed with the key, with its id and the time. */
function delivery(body: unknown, id = 'msg_1', signingKey = key) {
  const payload = JSON.stringify(body);
  const timestamp = Math.floor(Date.now() / 1000);
  return {
    method: 'POST' as const,
    url: '/webhooks/${n.kebab}/events',
    payload,
    headers: {
      'content-type': 'application/json',
      'webhook-id': id,
      'webhook-timestamp': String(timestamp),
      'webhook-signature': signStandardWebhook(signingKey, id, timestamp, payload),
    },
  };
}

describe('${n.kebab} webhook', () => {
  it('checks the signature and hands the delivery to its job', async () => {
    const { enqueue, server } = setup();
    const res = await server.inject(delivery(event));
    expect(res.statusCode).toBe(202);
    expect(enqueue).toHaveBeenCalledTimes(1);
    expect(enqueue).toHaveBeenCalledWith('${n.kebab}-webhook', { type: 'thing.updated', id: 'thing-1' }, expect.objectContaining({ jobId: '${n.kebab}:msg_1' }));
  });

  it('refuses a delivery signed with another key, or not signed at all', async () => {
    const { enqueue, server } = setup();
    expect((await server.inject(delivery(event, 'msg_2', Buffer.from('somebody else entirely, 32 bytes')))).statusCode).toBe(401);
    const { headers, ...unsigned } = delivery(event, 'msg_3');
    expect((await server.inject({ ...unsigned, headers: { 'content-type': headers['content-type'] } })).statusCode).toBe(401);
    expect(enqueue).not.toHaveBeenCalled();
  });

  it('answers a delivery it has handled as a duplicate, and does not enqueue it again', async () => {
    const { enqueue, server } = setup();
    const first = delivery(event, 'msg_4');
    expect((await server.inject(first)).statusCode).toBe(202);
    const again = await server.inject(first);
    expect(again.statusCode).toBe(200);
    expect(again.json()).toMatchObject({ duplicate: true });
    expect(enqueue).toHaveBeenCalledTimes(1);
  });

  it('refuses a body the contract rules out', async () => {
    const { enqueue, server } = setup();
    const res = await server.inject(delivery({ type: 'thing.updated' }, 'msg_5'));
    expect(res.statusCode).toBe(400);
    expect(enqueue).not.toHaveBeenCalled();
  });
});
`;

/** The lines in `src/webhooks/index.ts` for a webhook. */
export function webhookRegistration(n: Names): { import: string; line: string } {
  return {
    import: `import { ${n.pascal}WebhookController } from './${n.kebab}.controller';`,
    line: `...(await signed('${webhookSecretName(n)}', (secret) => new ${n.pascal}WebhookController(secret))),`,
  };
}

/** Appended to `.env.example` by the first webhook, and one line for each. */
export const WEBHOOK_PORT_ENV = `
# Webhooks are served on their own port (src/webhooks/index.ts)
# WEBHOOK_PORT=3002
`;
export const webhookSecretEnv = (n: Names): string => `# ${n.pascal}'s webhook signing secret (whsec_...). Without it the webhook is off, except in production, which won't start.
# ${webhookSecretName(n)}=
`;
