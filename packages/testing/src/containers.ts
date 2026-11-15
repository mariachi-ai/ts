import { ConfigError } from '@mariachi/core';

type Stoppable = { stop(): Promise<unknown> };
const started: Stoppable[] = [];

async function testcontainers(): Promise<typeof import('testcontainers')> {
  try {
    return await import('testcontainers');
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === 'ERR_MODULE_NOT_FOUND' || code === 'MODULE_NOT_FOUND') {
      throw new ConfigError('testing/testcontainers-missing', 'Starting a throwaway database needs testcontainers: pnpm add -D testcontainers (and Docker running)');
    }
    throw error;
  }
}

export interface ContainerOptions {
  /** The image to run. Defaults: `postgres:16-alpine`, `redis:7-alpine`. */
  image?: string;
}

/**
 * Starts a throwaway Postgres in Docker and returns its URL. Every call is a new, empty server, so a
 * test file owns its data. Stop them with `stopContainers()` in `afterAll`.
 */
export async function startPostgres(options: ContainerOptions = {}): Promise<string> {
  const { GenericContainer, Wait } = await testcontainers();
  const container = await new GenericContainer(options.image ?? 'postgres:16-alpine')
    .withEnvironment({ POSTGRES_PASSWORD: 'test', POSTGRES_DB: 'test' })
    .withExposedPorts(5432)
    // Postgres restarts once while it initialises; the second "ready" is the one that stays
    .withWaitStrategy(Wait.forLogMessage(/database system is ready to accept connections/, 2))
    .start();
  started.push(container);
  return `postgresql://postgres:test@${container.getHost()}:${container.getMappedPort(5432)}/test`;
}

/** Starts a throwaway Redis in Docker and returns its URL. */
export async function startRedis(options: ContainerOptions = {}): Promise<string> {
  const { GenericContainer } = await testcontainers();
  const container = await new GenericContainer(options.image ?? 'redis:7-alpine').withExposedPorts(6379).start();
  started.push(container);
  return `redis://${container.getHost()}:${container.getMappedPort(6379)}`;
}

/** Stops every container this module started. */
export async function stopContainers(): Promise<void> {
  await Promise.all(started.splice(0).map((container) => container.stop()));
}
