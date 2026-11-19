import { describe, expect, it } from 'vitest';
import { findJobDefinitions, findSchedules, loadTypeScript, readApiServer } from './source';

const ts = await loadTypeScript();

const APP = `import { createApiServer } from '@mariachi/api-facade';
export async function createApp() {
  const prefix = '/v2';
  const api = createApiServer({
    name: 'api',
    prefix: '/api',
    logger,
  })
    .withAuthStrategy('session', bearerStrategy(verifier))
    .withAuth(['session', 'api-key'])
    .withStatic('/assets/design/', DESIGN_CSS)
    .withHealth(lifecycle.health, { path: '/healthz' })
    .withOpenApi({ info: { title: 'x', version: '1' } });
  jobs.schedule({ name: 'nightly-digest', cron: '0 6 * * *', timezone: 'Europe/Amsterdam', jobName: 'send-digest', data: {} });
  jobs.schedule({ cron: EVERY_HOUR, jobName: 'cleanup' });
  other.schedule('not a job schedule');
}
`;

describe('readApiServer', () => {
  it('reads the prefix, the default auth and the routes the server adds itself', () => {
    expect(readApiServer(ts, 'src/app.ts', APP)).toEqual({
      prefix: '/api',
      defaultAuth: ['session', 'api-key'],
      line: 4,
      routes: [
        { method: 'GET', path: '/assets/design/*', root: true, kind: 'static' },
        { method: 'GET', path: '/api/healthz/live', root: false, kind: 'health' },
        { method: 'GET', path: '/api/healthz/ready', root: false, kind: 'health' },
        { method: 'GET', path: '/api/healthz/startup', root: false, kind: 'health' },
        { method: 'GET', path: '/api/openapi.json', root: false, kind: 'openapi' },
      ],
    });
  });

  it('leaves the default auth unset when there is no withAuth, and the prefix empty when there is none', () => {
    const server = readApiServer(ts, 'src/app.ts', `const api = createApiServer({ name: 'api' }).withHealth(h);`);
    expect(server).toMatchObject({ prefix: '', routes: [{ path: '/health/live' }, { path: '/health/ready' }, { path: '/health/startup' }] });
    expect(server?.defaultAuth).toBeUndefined();
  });

  it('shows an expression it cannot read as its source text, in angle brackets', () => {
    expect(readApiServer(ts, 'src/app.ts', 'createApiServer({ prefix: config.prefix }).withAuth(DEFAULT)')).toMatchObject({ prefix: '<config.prefix>', defaultAuth: ['<DEFAULT>'] });
  });

  it('is undefined for a file that builds no API server', () => {
    expect(readApiServer(ts, 'src/worker.ts', 'export const x = 1;')).toBeUndefined();
  });
});

describe('findSchedules', () => {
  it('finds jobs.schedule() calls with a cron and a job, and where each is', () => {
    expect(findSchedules(ts, 'src/app.ts', APP)).toEqual([
      { name: 'nightly-digest', cron: '0 6 * * *', jobName: 'send-digest', timezone: 'Europe/Amsterdam', file: 'src/app.ts', line: 14 },
      { name: 'cleanup', cron: '<EVERY_HOUR>', jobName: 'cleanup', file: 'src/app.ts', line: 15 },
    ]);
  });
});

describe('findJobDefinitions', () => {
  it('finds where each job is defined', () => {
    const text = `import { defineJob } from '@mariachi/jobs';\n\nexport const sendDigestJob = defineJob({\n  name: 'send-digest',\n  schema,\n  handler,\n});\nconst other = defineJob(config);\n`;
    expect(findJobDefinitions(ts, 'src/jobs/send-digest.job.ts', text)).toEqual([{ name: 'send-digest', file: 'src/jobs/send-digest.job.ts', line: 3 }]);
  });
});
