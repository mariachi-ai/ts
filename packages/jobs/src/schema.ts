import { column, defineTable, index } from '@mariachi/database';

/**
 * The Postgres job queue (`@mariachi/jobs/postgres`). A row is a job that is waiting, running or
 * dead-lettered; a job that completes is deleted. `id` is the job's id within its queue, which is
 * also the deduplication key.
 */
export const jobsTable = defineTable(
  'mariachi_jobs',
  {
    queue:       column.text().notNull(),
    id:          column.text().notNull(),
    name:        column.text().notNull(),
    /** The payload with the enqueuing context (trace, tenant, user). */
    data:        column.json().notNull(),
    /** `waiting`, `active` or `dead`. */
    status:      column.text().notNull().default('waiting'),
    /** Lower runs first. */
    priority:    column.integer().notNull().default(3),
    /** Attempts started so far. */
    attempts:    column.integer().notNull().default(0),
    runAt:       column.timestamp().notNull().defaultNow(),
    /** The worker running it, and until when its claim holds; another worker takes it over after that. */
    lockedBy:    column.text(),
    lockedUntil: column.timestamp(),
    progress:    column.json(),
    lastError:   column.json(),
    failedAt:    column.timestamp(),
    createdAt:   column.timestamp().notNull().defaultNow(),
  },
  {
    primaryKey: ['queue', 'id'],
    tenantColumn: false,
    softDeleteColumn: false,
    indexes: [
      index('mariachi_jobs_ready_idx').on('queue', 'priority', 'runAt').where("status = 'waiting'"),
      index('mariachi_jobs_active_idx').on('queue', 'lockedUntil').where("status = 'active'"),
      index('mariachi_jobs_dead_idx').on('queue', 'failedAt').where("status = 'dead'"),
    ],
  },
);

/** Cron schedules of the Postgres job queue. `nextRunAt` is the tick that hasn't been enqueued yet. */
export const jobSchedulesTable = defineTable(
  'mariachi_job_schedules',
  {
    queue:     column.text().notNull(),
    name:      column.text().notNull(),
    cron:      column.text().notNull(),
    timezone:  column.text(),
    jobName:   column.text().notNull(),
    data:      column.json(),
    nextRunAt: column.timestamp().notNull(),
    updatedAt: column.timestamp().notNull().defaultNow(),
  },
  { primaryKey: ['queue', 'name'], tenantColumn: false, softDeleteColumn: false },
);
