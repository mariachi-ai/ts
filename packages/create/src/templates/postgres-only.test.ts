import { describe, expect, it } from 'vitest';
import { projectFiles } from './project';

const VARIANTS = {
  jwt: projectFiles('acme-app', '^0.1.0'),
  gotrue: projectFiles('acme-app', '^0.1.0', 'gotrue'),
  'jwt with organizations': projectFiles('acme-app', '^0.1.0', 'jwt', { organizations: true }),
  'gotrue with organizations': projectFiles('acme-app', '^0.1.0', 'gotrue', { organizations: true }),
};

describe.each(Object.entries(VARIANTS))('a generated project (%s) needs only Postgres', (_name, files) => {
  const app = files['src/app.ts'] as string;

  it('runs jobs in Postgres, and on Redis only when REDIS_URL is set', () => {
    expect(app).not.toContain('app/redis-required');
    expect(app).toMatch(/const queue = config\.redis\s+\? createJobQueue\(\{ adapter: 'bullmq', redisUrl: config\.redis\.url, prefix: config\.serviceName \}, logger\)\s+: createPostgresJobQueue\(database\.db, \{ prefix: config\.serviceName \}, logger\);/);
    // The queue and search are built from the Drizzle client, which exists once the database is connected
    expect(app.indexOf('await database.connect();')).toBeLessThan(app.indexOf('createPostgresJobQueue(database.db'));
    expect(app.match(/await database\.connect\(\);/g)).toHaveLength(1);
    expect(files['src/schema/job-queue.ts']).toContain("export { jobSchedulesTable, jobsTable } from '@mariachi/jobs/schema';");
    expect(files['src/schema/index.ts']).toContain("export * from './job-queue';");
  });

  it('asks for no Redis: not in .env.example, not in the Compose file', () => {
    const env = files['.env.example'] as string;
    expect(env).not.toMatch(/^REDIS_URL=/m);
    expect(env).toContain('# REDIS_URL=redis://localhost:6379');
    const compose = files['docker-compose.yml'] as string;
    expect(compose).toContain('  postgres:');
    expect(compose).not.toMatch(/^ {2}redis:/m);
  });

  it('wires search on Postgres, tenant-scoped, and creates the indexes the app lists', () => {
    expect(app).toContain('new DefaultSearch({ client: createPostgresSearch(database.db), tenantScoped: true }, instrumentation),');
    expect(app).toContain('registerServices(communication, { db: database.db, jobs, search, events, outbox });');
    // Managed, so a database without the search tables says so at start; then the app's indexes are made sure of
    expect(app).toMatch(/const search = lifecycle\.manage\(\s+'search',/);
    expect(app).toContain('await search.ensureIndexes(options.searchIndexes ?? searchIndexes)');
    expect(files['src/schema/search.ts']).toContain("export { searchDocumentsTable, searchIndexesTable } from '@mariachi/search/schema';");
    expect(files['src/schema/index.ts']).toContain("export * from './search';");
    // Empty until an entity is generated with --search (the example notes are, in createProject)
    expect(files['src/search/index.ts']).toContain('export const searchIndexes: SearchIndex[] = [\n  // mariachi:search\n];');
    expect(files['src/services/index.ts']).toContain('search: Search;');
    expect(JSON.parse(files['package.json'] as string).dependencies).toHaveProperty('@mariachi/search', '^0.1.0');
  });

  it('starts with pnpm dev, which is mariachi dev', () => {
    expect(JSON.parse(files['package.json'] as string).scripts.dev).toBe('mariachi dev');
    const readme = files['README.md'] as string;
    expect(readme).toContain('pnpm dev');
    expect(readme).not.toMatch(/docker compose up|db:generate && pnpm db:migrate/);
  });

  it('tests itself against Postgres alone', () => {
    const setup = files['src/testing/global-setup.ts'] as string;
    expect(setup).toContain("project.provide('postgresUrl', await startPostgres());");
    expect(setup).not.toMatch(/redis/i);
    expect(files['src/testing/e2e.ts']).not.toMatch(/redis/i);
    expect(files['src/search.e2e.test.ts']).toContain("rejects.toMatchObject({ code: 'search/tenant-required' })");
  });
});

describe('the default project says how to call its API', () => {
  it('with a development token, in the README and for agents', () => {
    const files = VARIANTS.jwt;
    expect(files['README.md']).toContain('TOKEN=$(pnpm -s mariachi token)');
    expect(files['AGENTS.md']).toContain('TOKEN=$(pnpm -s mariachi token)');
    // A GoTrue project signs users in with GoTrue: no token of the app's own making
    expect(VARIANTS.gotrue['README.md']).not.toContain('mariachi token');
  });

  it('with a token that names no tenant when the project has organizations', () => {
    expect(VARIANTS['jwt with organizations']['README.md']).toContain('TOKEN=$(pnpm -s mariachi token --user ada --no-tenant --email ada@example.com)');
    expect(VARIANTS['gotrue with organizations']['README.md']).not.toContain('mariachi token');
  });
});
