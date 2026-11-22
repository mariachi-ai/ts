import { JobsError } from '@mariachi/core';
import type { Logger } from '@mariachi/core';
import type { JobConfig, JobQueue, JobWorker, JobScheduler } from './types';
import { BullMQAdapter } from './adapters/bullmq';
import { MemoryJobAdapter } from './adapters/memory';
import { HttpJobBackend } from './adapters/http';

export type JobBackend = JobQueue & JobWorker & JobScheduler;

export function createJobQueue(config: JobConfig, logger: Logger): JobBackend {
  if (config.adapter === 'bullmq') return new BullMQAdapter(config, logger);
  if (config.adapter === 'memory') return new MemoryJobAdapter(config, logger);
  if (config.adapter === 'http') return new HttpJobBackend(config, logger);
  if (config.adapter === 'postgres') {
    // It needs the app's database client, and lives behind a subpath so apps on Redis don't load a Postgres driver
    throw new JobsError('jobs/postgres-needs-database', "The Postgres queue takes the database client: createPostgresJobQueue(database.db, config, logger) from '@mariachi/jobs/postgres'");
  }
  throw new JobsError('jobs/unknown-adapter', `Unknown job adapter: ${config.adapter}`);
}
