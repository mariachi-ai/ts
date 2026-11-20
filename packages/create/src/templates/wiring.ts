/**
 * Events and webhooks in `src/app.ts`, shared by both sign-in templates. The registries they read
 * are `src/events/index.ts` and `src/webhooks/index.ts` (templates/events.ts, templates/webhooks.ts).
 */

export const EVENTS_SCHEMA_FILE = 'src/schema/events.ts';
export const EVENTS_SCHEMA = `/** The events outbox (@mariachi/events/outbox): events written with the change that caused them, sent once it commits. */
export { eventOutboxTable } from '@mariachi/events/schema';
`;

export const WIRING_APP_IMPORTS = `import { createEventBus, DefaultEvents } from '@mariachi/events';
import { Outbox, OutboxRelay } from '@mariachi/events/outbox';
import type { WebhookServer } from '@mariachi/webhooks';
`;

/** After the app's own registry imports. */
export const WIRING_APP_REGISTRY_IMPORTS = `import { registerSubscribers } from './events/index';
import { setupWebhooks } from './webhooks/index';
`;

export const WIRING_APP_FIELDS = `  /** Publishes to the subscribers in src/events/; for events that must not be lost, services use the outbox. */
  events: DefaultEvents;
  /** The webhook server (src/webhooks/), or undefined while there are no webhooks. */
  webhooks: WebhookServer | undefined;
`;

/** Builds events before the services, which publish them. */
export const WIRING_APP_EVENTS = `  // Events (src/events/) go to the subscribers in this process. Through the outbox, an event is written
  // to Postgres in the transaction that caused it (src/schema/events.ts) and sent once that commits, at
  // least once. Subscribers in other processes need a shared bus (node_modules/@mariachi/core/docs/events.md).
  const events = lifecycle.manage(
    'events',
    new DefaultEvents({ bus: createEventBus({ adapter: 'memory', logger }), source: config.serviceName }, instrumentation),
    { priority: 22 },
  );
  const outbox = new Outbox(database.db, { source: config.serviceName });
  lifecycle.manage('outbox-relay', new OutboxRelay({ db: database.db, target: events, logger }), { priority: 95 });
`;

/** The services' dependencies, and the subscribers, which hand work to procedures and jobs. */
export const WIRING_APP_SERVICES = `  registerServices(communication, { db: database.db, jobs, search, events, outbox });
  registerSubscribers(events, { communication, jobs });
`;

/** After the API's controllers. */
export const WIRING_APP_WEBHOOKS = `
  // Webhooks (src/webhooks/) on their own port, WEBHOOK_PORT: none of the API's sign-in or limits.
  const webhooks = await setupWebhooks({ config, secrets, lifecycle, logger, tracer, db: database.db, jobQueue: queue, communication });
`;

export const WIRING_APP_RETURN = `    events,
    webhooks,
`;
