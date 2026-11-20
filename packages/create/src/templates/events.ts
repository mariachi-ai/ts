import { MARKERS } from '../layout';
import type { EventNames, Names } from '../names';

const TEST_LOGGER = 'const logger = { debug() {}, info() {}, warn() {}, error() {}, child: () => logger } as unknown as Logger;';

/** `src/events/index.ts`: where subscribers are subscribed. In every new project; written by `generate event` in an older one. */
export const EVENTS_INDEX = `import type { CommunicationLayer } from '@mariachi/communication';
import type { Events } from '@mariachi/events';
import type { Jobs } from '@mariachi/jobs';
// ${MARKERS.imports}

/**
 * Events say that something happened, to whoever subscribed: \`mariachi generate event <name>\` defines
 * one (src/events/<name>.event.ts) and \`mariachi generate subscriber <event> <name>\` adds a
 * subscriber here. Services publish through \`deps.outbox\` (in the transaction that makes the
 * change) or \`deps.events\` (src/services/index.ts).
 */

/** What a subscriber is given: it hands work on to a procedure or a job, with the event's ctx. */
export interface SubscriberDeps {
  communication: CommunicationLayer;
  jobs: Jobs;
}

/** Subscribes every subscriber, at start (src/app.ts). */
export function registerSubscribers(events: Events, deps: SubscriberDeps): void {
  // ${MARKERS.subscribers}
}
`;

/** The event's definition and payload schema, `src/events/<name>.event.ts`. */
export function eventFile(e: EventNames): string {
  return `import { defineEvent } from '@mariachi/events';
import { z } from 'zod';

/** What ${e.event} carries. Checked when it is published and again when a subscriber receives it. */
export const ${e.camel}Payload = z.object({
  id: z.string().min(1),
});

export type ${e.pascal} = z.infer<typeof ${e.camel}Payload>;

/**
 * Publish it from a service, with the caller's ctx (src/services/index.ts gives services
 * \`deps.outbox\` and \`deps.events\`):
 *
 *   // In the transaction that makes the change: written to Postgres with it, sent once it commits
 *   await withTransaction(db, ctx, async () => {
 *     // ...the change...
 *     await outbox.add(ctx, ${e.camel}, { id });
 *   });
 *
 *   // Or straight away, to the subscribers in this process. It waits for them, and nothing is kept
 *   // if the process stops first: prefer the outbox for anything that must not be lost.
 *   await events.publish(ctx, ${e.camel}, { id });
 *
 * Subscribers: \`mariachi generate subscriber ${e.event} <name>\`.
 */
export const ${e.camel} = defineEvent('${e.event}', { schema: ${e.camel}Payload });
`;
}

export function eventTestFile(e: EventNames): string {
  return `import { describe, expect, it, vi } from 'vitest';
import { createContext, type Logger } from '@mariachi/core';
import { createEventBus, DefaultEvents } from '@mariachi/events';
import { ${e.camel} } from './${e.kebab}.event';

${TEST_LOGGER}
const ctx = createContext({ logger, tenantId: 'tenant-1', userId: 'user-1' });
const events = () => new DefaultEvents({ bus: createEventBus({ adapter: 'memory' }) }, { logger });

describe('${e.event}', () => {
  it("reaches a subscriber, which works in the publisher's tenant", async () => {
    const bus = events();
    const received = vi.fn();
    bus.subscribe(${e.camel}, async (subscriberCtx, payload) => {
      received(subscriberCtx.tenantId, payload);
    });
    await bus.publish(ctx, ${e.camel}, { id: 'abc' });
    expect(received).toHaveBeenCalledWith('tenant-1', { id: 'abc' });
  });

  it('refuses a payload its schema rules out', async () => {
    await expect(events().publish(ctx, ${e.camel}, { id: '' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });
});
`;
}

/** A subscriber, `src/events/subscribers/<name>.subscriber.ts`. */
export function subscriberFile(e: EventNames, s: Names): string {
  return `import type { Context } from '@mariachi/core';
import type { EventMeta, Events } from '@mariachi/events';
import { ${e.camel}, type ${e.pascal} } from '../${e.kebab}.event';
import type { SubscriberDeps } from '../index';

/**
 * Runs on each ${e.event}, with the publisher's ctx: the same tenant, user and trace.
 *
 * - Its group (\`${s.kebab}\`) makes it run once for each event, not once in every process.
 * - The same event can arrive more than once (the outbox sends at least once): make what this
 *   does safe to repeat, keyed on \`meta.id\`.
 * - A failure is tried three times, then logged as a dead letter. Hand slow or fallible work to a
 *   job, which has retries of its own.
 */
export function ${s.camel}(deps: SubscriberDeps) {
  return async (ctx: Context, payload: ${e.pascal}, meta: EventMeta): Promise<void> => {
    ctx.logger.info({ eventId: meta.id, id: payload.id }, '${s.kebab}');
    // Hand the work on, with the same ctx:
    //   await deps.communication.call(ctx, '<domain>.<action>', { id: payload.id });
    //   await deps.jobs.enqueue(ctx, '<job-name>', { id: payload.id });
    void deps;
  };
}

export function register${s.pascal}Subscriber(events: Events, deps: SubscriberDeps): void {
  events.subscribe(${e.camel}, ${s.camel}(deps), { group: '${s.kebab}', name: '${s.kebab}' });
}
`;
}

export function subscriberTestFile(e: EventNames, s: Names): string {
  return `import { describe, expect, it, vi } from 'vitest';
import { createContext, type Logger } from '@mariachi/core';
import { createEventBus, DefaultEvents } from '@mariachi/events';
import type { SubscriberDeps } from '../index';
import { ${e.camel} } from '../${e.kebab}.event';
import { register${s.pascal}Subscriber } from './${s.kebab}.subscriber';

const info = vi.fn();
const logger = { debug() {}, info, warn() {}, error() {}, child: () => logger } as unknown as Logger;
const ctx = createContext({ logger, tenantId: 'tenant-1', userId: 'user-1' });
// Stand-ins for what the subscriber calls: replace them with fakes once it calls something
const deps = {} as SubscriberDeps;

describe('${s.kebab}', () => {
  it('runs when ${e.event} is published', async () => {
    const events = new DefaultEvents({ bus: createEventBus({ adapter: 'memory' }) }, { logger });
    register${s.pascal}Subscriber(events, deps);
    const envelope = await events.publish(ctx, ${e.camel}, { id: 'abc' });
    expect(info).toHaveBeenCalledWith({ eventId: envelope.id, id: 'abc' }, '${s.kebab}');
  });
});
`;
}

/** The line in `src/events/index.ts` for a subscriber, and its import. */
export function subscriberRegistration(s: Names): { import: string; line: string } {
  return {
    import: `import { register${s.pascal}Subscriber } from './subscribers/${s.kebab}.subscriber';`,
    line: `register${s.pascal}Subscriber(events, deps);`,
  };
}
