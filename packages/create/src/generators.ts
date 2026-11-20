import { existsSync } from 'node:fs';
import { appendFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ConfigError } from '@mariachi/core';
import { addImport, imports } from './edit';
import { parseFields } from './fields';
import { LAYOUT, MARKERS } from './layout';
import { eventNames, names } from './names';
import { E2E_HARNESS_FILE } from './templates/e2e';
import { entityFiles } from './templates/entity';
import { EVENTS_INDEX, eventFile, eventTestFile, subscriberFile, subscriberRegistration, subscriberTestFile } from './templates/events';
import {
  controllerFile,
  integrationFiles,
  jobFile,
  procedureContract,
  procedureMethod,
  procedureNames,
  procedureRegistration,
  procedureTest,
  seedFile,
  serviceFiles,
} from './templates/parts';
import { WEBHOOK_PORT_ENV, WEBHOOKS_INDEX, WEBHOOKS_SCHEMA, WEBHOOKS_SCHEMA_FILE, webhookFiles, webhookRegistration, webhookSecretEnv, webhookSecretName } from './templates/webhooks';
import { EVENTS_SCHEMA, EVENTS_SCHEMA_FILE } from './templates/wiring';
import { projectFiles } from './templates/project';
import { PAGES_CONTROLLER_FILE, PAGES_DIR, PAGES_LAYOUT_FILE, pageFile, pageTestFile, pageTitle } from './templates/ui';
import { PROJECT_AUTH } from './types';
import type {
  GenerateControllerConfig,
  GenerateEntityConfig,
  GenerateEventConfig,
  GenerateIntegrationConfig,
  GenerateJobConfig,
  GeneratePageConfig,
  GenerateProcedureConfig,
  GenerateResult,
  GenerateSeedConfig,
  GenerateServiceConfig,
  GenerateSubscriberConfig,
  GenerateWebhookConfig,
  ProjectConfig,
} from './types';
import { MARIACHI_VERSION } from './version';
import { mergeResults, writeFiles, type Insertion } from './writer';

const NPM_NAME = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

/**
 * Scaffolds a runnable project and, unless `example: false`, a `note` entity wired end to end and
 * kept in a search index: the worked example of `deps.search`.
 * `auth: 'gotrue'` signs users in with GoTrue (see `ProjectConfig.auth`); `organizations: true` adds
 * organizations, memberships and invitations (see `ProjectConfig.organizations`).
 */
export async function createProject(config: ProjectConfig): Promise<GenerateResult> {
  if (!NPM_NAME.test(config.name)) {
    throw new ConfigError('create/invalid-name', `"${config.name}" is not a valid npm package name`);
  }
  const auth = config.auth ?? 'jwt';
  if (!PROJECT_AUTH.includes(auth)) {
    throw new ConfigError('create/invalid-auth', `Unknown auth "${auth}": use ${PROJECT_AUTH.join(' or ')}`);
  }
  if (existsSync(config.outputDir) && (await readdir(config.outputDir)).length > 0) {
    throw new ConfigError('create/dir-not-empty', `${config.outputDir} already exists and is not empty`);
  }
  await mkdir(config.outputDir, { recursive: true });
  const range = config.mariachiVersion ?? `^${MARIACHI_VERSION}`;
  const project = await writeFiles(config.outputDir, projectFiles(config.name, range, auth, { e2e: config.e2e, organizations: config.organizations, ui: config.ui, example: config.example !== false }));
  if (config.example === false) return project;
  const example = await generateEntity({ name: 'note', projectRoot: config.outputDir, search: true });
  return { ...mergeResults(project, example), updated: [] };
}

function assertProject(root: string): void {
  if (!existsSync(join(root, 'src'))) {
    throw new ConfigError('create/not-a-project', `${root} has no src/ directory; run this from a project created by \`mariachi init\``);
  }
}

/**
 * Table, contract, repository, service, handlers, controller and a service test; registers all of
 * them. `fields` are its columns (`title:string`, `dueAt:timestamp?`); without them it has a `name`.
 * `search: true` also keeps it in a search index, listed in `src/search/index.ts`, with a
 * `<plural>.search` procedure and route.
 */
export async function generateEntity(config: GenerateEntityConfig): Promise<GenerateResult> {
  assertProject(config.projectRoot);
  const n = names(config.name, { plural: config.plural });
  const fields = parseFields(config.fields);
  const svc = `./${n.pluralKebab}/${n.pluralKebab}`;
  const search = config.search ?? false;
  const files = entityFiles(n, fields, { search });
  const insertions: Insertion[] = [
    { file: LAYOUT.schemaIndex, marker: MARKERS.schema, line: `export * from './${n.pluralKebab}';` },
    { file: LAYOUT.servicesIndex, marker: MARKERS.imports, line: `import { ${n.pluralPascal}Repository } from '${svc}.repository';` },
    { file: LAYOUT.servicesIndex, marker: MARKERS.imports, line: `import { ${n.pluralPascal}Service } from '${svc}.service';` },
    { file: LAYOUT.servicesIndex, marker: MARKERS.imports, line: `import { register${n.pluralPascal}Handlers } from '${svc}.handler';` },
    {
      file: LAYOUT.servicesIndex,
      marker: MARKERS.services,
      line: `register${n.pluralPascal}Handlers(communication, new ${n.pluralPascal}Service(new ${n.pluralPascal}Repository(deps.db)${search ? ', deps.search, deps.db' : ''}));`,
    },
    ...controllerInsertions(n.pluralPascal, n.pluralKebab),
    ...(search
      ? [
          { file: LAYOUT.searchIndex, marker: MARKERS.imports, line: `import { ${n.pluralCamel}Index } from './${n.pluralKebab}';` },
          { file: LAYOUT.searchIndex, marker: MARKERS.search, line: `${n.pluralCamel}Index,` },
        ]
      : []),
  ];
  // A project made without end-to-end support has no harness for the test to use
  if (!existsSync(join(config.projectRoot, E2E_HARNESS_FILE))) delete files[`${LAYOUT.controllersDir}/${n.pluralKebab}.e2e.test.ts`];
  const result = await writeFiles(config.projectRoot, files, insertions, config);
  result.notes.push('Run `mariachi db generate` to create the migration for the new table.');
  return result;
}

/** A service with one `<name>.execute` procedure, its contract, handler and test. */
export async function generateService(config: GenerateServiceConfig): Promise<GenerateResult> {
  assertProject(config.projectRoot);
  const n = names(config.name);
  const svc = `./${n.kebab}/${n.kebab}`;
  return writeFiles(
    config.projectRoot,
    serviceFiles(n),
    [
      { file: LAYOUT.servicesIndex, marker: MARKERS.imports, line: `import { ${n.pascal}Service } from '${svc}.service';` },
      { file: LAYOUT.servicesIndex, marker: MARKERS.imports, line: `import { register${n.pascal}Handlers } from '${svc}.handler';` },
      { file: LAYOUT.servicesIndex, marker: MARKERS.services, line: `register${n.pascal}Handlers(communication, new ${n.pascal}Service());` },
    ],
    config,
  );
}

/** A controller calling `<name>.execute`; reuses `src/contracts/<name>.ts` when the service exists. */
export async function generateController(config: GenerateControllerConfig): Promise<GenerateResult> {
  assertProject(config.projectRoot);
  const n = names(config.name);
  const withContract = existsSync(join(config.projectRoot, LAYOUT.contractsDir, `${n.kebab}.ts`));
  return writeFiles(
    config.projectRoot,
    { [`${LAYOUT.controllersDir}/${n.kebab}.controller.ts`]: controllerFile(n, withContract) },
    controllerInsertions(n.pascal, n.kebab),
    config,
  );
}

function controllerInsertions(pascal: string, file: string): Insertion[] {
  return [
    { file: LAYOUT.controllersIndex, marker: MARKERS.imports, line: `import { ${pascal}Controller } from './${file}.controller';` },
    { file: LAYOUT.controllersIndex, marker: MARKERS.controllers, line: `new ${pascal}Controller(communication),` },
  ];
}

export async function generateJob(config: GenerateJobConfig): Promise<GenerateResult> {
  assertProject(config.projectRoot);
  const n = names(config.name);
  return writeFiles(
    config.projectRoot,
    { [`${LAYOUT.jobsDir}/${n.kebab}.job.ts`]: jobFile(n) },
    [
      { file: LAYOUT.jobsIndex, marker: MARKERS.imports, line: `import { ${n.camel}Job } from './${n.kebab}.job';` },
      { file: LAYOUT.jobsIndex, marker: MARKERS.jobs, line: `${n.camel}Job,` },
    ],
    config,
  );
}

/** A seed: `src/seeds/<name>.seed.ts`, listed in the seeds index so `mariachi db seed` runs it. */
export async function generateSeed(config: GenerateSeedConfig): Promise<GenerateResult> {
  assertProject(config.projectRoot);
  const n = names(config.name);
  const result = await writeFiles(
    config.projectRoot,
    { [`${LAYOUT.seedsDir}/${n.kebab}.seed.ts`]: seedFile(n) },
    [
      { file: LAYOUT.seedsIndex, marker: MARKERS.imports, line: `import { ${n.camel}Seed } from './${n.kebab}.seed';` },
      { file: LAYOUT.seedsIndex, marker: MARKERS.seeds, line: `${n.camel}Seed,` },
    ],
    config,
  );
  result.notes.push('Run it with: pnpm mariachi db seed (--force runs it again; pnpm dev does not run seeds).');
  return result;
}

/** Paths a page can't have: they are the API's and the static files'. */
const RESERVED_PAGES = new Set(['api', 'assets']);

/**
 * A page: `src/api/pages/<name>.ts` and its test, its route at `/<name>` in the pages controller,
 * and its link in the bar. For a project made with `--ui`.
 */
export async function generatePage(config: GeneratePageConfig): Promise<GenerateResult> {
  assertProject(config.projectRoot);
  if (!existsSync(join(config.projectRoot, PAGES_CONTROLLER_FILE))) {
    throw new ConfigError('create/no-pages', `This project has no pages (${PAGES_CONTROLLER_FILE}): it was made without --ui`);
  }
  const n = names(config.name);
  if (RESERVED_PAGES.has(n.kebab)) throw new ConfigError('create/reserved-page', `/${n.kebab} is not free for a page: the API and the static files are served there`);
  return writeFiles(
    config.projectRoot,
    { [`${PAGES_DIR}/${n.kebab}.ts`]: pageFile(n), [`${PAGES_DIR}/${n.kebab}.test.ts`]: pageTestFile(n) },
    [
      { file: PAGES_CONTROLLER_FILE, marker: MARKERS.imports, line: `import { ${n.camel}Page } from '../pages/${n.kebab}';` },
      { file: PAGES_CONTROLLER_FILE, marker: MARKERS.pages, line: `this.get('/${n.kebab}', { root: true, auth: false }, async () => htmlResponse(${n.camel}Page()));` },
      { file: PAGES_LAYOUT_FILE, marker: MARKERS.nav, line: `{ href: '/${n.kebab}', label: ${JSON.stringify(pageTitle(n))} },` },
    ],
    config,
  );
}

/** An HTTP client with timeouts, retries and typed errors, plus tests. Not wired automatically. */
export async function generateIntegration(config: GenerateIntegrationConfig): Promise<GenerateResult> {
  assertProject(config.projectRoot);
  const n = names(config.name);
  const result = await writeFiles(config.projectRoot, integrationFiles(n), [], config);
  result.notes.push(`Construct ${n.pascal}Client in src/app.ts with credentials from config or secrets and pass it to the services that need it.`);
  return result;
}

/** `@mariachi/<pkg>` in the project's dependencies, at the range its `@mariachi/core` has. Returns a note when it had to be added. */
async function ensureDependency(root: string, pkg: string, result: GenerateResult): Promise<void> {
  const path = join(root, 'package.json');
  if (!existsSync(path)) return;
  const json = JSON.parse(await readFile(path, 'utf-8')) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
  if (json.dependencies?.[pkg] || json.devDependencies?.[pkg]) return;
  const dependencies = { ...json.dependencies, [pkg]: json.dependencies?.['@mariachi/core'] ?? `^${MARIACHI_VERSION}` };
  json.dependencies = Object.fromEntries(Object.entries(dependencies).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(path, `${JSON.stringify(json, null, 2)}\n`);
  result.updated.push('package.json');
  result.notes.push(`Added ${pkg} to package.json: run pnpm install.`);
}

/** Reads a file of the project, or undefined when it has none. */
async function read(root: string, file: string): Promise<string | undefined> {
  const path = join(root, file);
  return existsSync(path) ? readFile(path, 'utf-8') : undefined;
}

/**
 * What events need in a project made before they came with it: the subscriber registry and the
 * outbox's table. Its `src/app.ts` is the project's own, so wiring them there is left to a note.
 */
async function eventsWiring(root: string): Promise<{ files: Record<string, string>; insertions: Insertion[]; notes: string[] }> {
  const files: Record<string, string> = {};
  const insertions: Insertion[] = [];
  const notes: string[] = [];
  if (!existsSync(join(root, LAYOUT.eventsIndex))) files[LAYOUT.eventsIndex] = EVENTS_INDEX;
  if (!existsSync(join(root, EVENTS_SCHEMA_FILE))) {
    files[EVENTS_SCHEMA_FILE] = EVENTS_SCHEMA;
    insertions.push({ file: LAYOUT.schemaIndex, marker: MARKERS.schema, line: "export * from './events';" });
    notes.push('Run `mariachi db generate` to create the migration for the events outbox.');
  }
  if (!(await read(root, LAYOUT.app))?.includes('registerSubscribers(')) {
    notes.push(
      'src/app.ts does not set up events yet: build DefaultEvents, an Outbox and an OutboxRelay there, give services `events` and `outbox`, and call registerSubscribers(events, { communication, jobs }) from src/events/index.ts. A project made by `mariachi init` now shows how.',
    );
  }
  return { files, insertions, notes };
}

/**
 * An event: its definition and Zod payload in `src/events/<name>.event.ts`, how to publish it, and a
 * test. `subscriber` adds a subscriber to it too (see generateSubscriber). Names are lowercase and
 * dot-separated, domain first: `billing.invoice.paid`.
 */
export async function generateEvent(config: GenerateEventConfig): Promise<GenerateResult> {
  assertProject(config.projectRoot);
  const e = eventNames(config.name);
  const subscriber = config.subscriber === true ? `on-${e.kebab}` : config.subscriber || undefined;
  if (subscriber) {
    // Refused before anything is written, as writeFiles would refuse the subscriber after the event
    const file = `${LAYOUT.subscribersDir}/${names(subscriber).kebab}.subscriber.ts`;
    if (existsSync(join(config.projectRoot, file)) && !config.force) {
      throw new ConfigError('create/file-exists', `Refusing to overwrite: ${file} (use --force)`, { files: [file] });
    }
  }
  const wiring = await eventsWiring(config.projectRoot);
  const result = await writeFiles(
    config.projectRoot,
    { ...wiring.files, [`${LAYOUT.eventsDir}/${e.kebab}.event.ts`]: eventFile(e), [`${LAYOUT.eventsDir}/${e.kebab}.event.test.ts`]: eventTestFile(e) },
    wiring.insertions,
    config,
  );
  result.notes.push(...wiring.notes);
  await ensureDependency(config.projectRoot, '@mariachi/events', result);
  if (!subscriber) {
    result.notes.push(`Subscribe to it with: mariachi generate subscriber ${e.event} <name>`);
    return result;
  }
  return mergeResults(result, await generateSubscriber({ event: e.event, name: subscriber, projectRoot: config.projectRoot, force: config.force }));
}

/**
 * A subscriber to an event made by generateEvent: `src/events/subscribers/<name>.subscriber.ts` and
 * its test, subscribed in `src/events/index.ts`. The name defaults to `on-<event>`.
 */
export async function generateSubscriber(config: GenerateSubscriberConfig): Promise<GenerateResult> {
  assertProject(config.projectRoot);
  const e = eventNames(config.event);
  if (!existsSync(join(config.projectRoot, LAYOUT.eventsDir, `${e.kebab}.event.ts`))) {
    throw new ConfigError(
      'create/no-event',
      `There is no event ${e.event} (${LAYOUT.eventsDir}/${e.kebab}.event.ts). Make it first: mariachi generate event ${e.event}`,
    );
  }
  const s = names(config.name ?? `on-${e.kebab}`);
  const wiring = await eventsWiring(config.projectRoot);
  const registration = subscriberRegistration(s);
  const result = await writeFiles(
    config.projectRoot,
    {
      ...wiring.files,
      [`${LAYOUT.subscribersDir}/${s.kebab}.subscriber.ts`]: subscriberFile(e, s),
      [`${LAYOUT.subscribersDir}/${s.kebab}.subscriber.test.ts`]: subscriberTestFile(e, s),
    },
    [
      ...wiring.insertions,
      { file: LAYOUT.eventsIndex, marker: MARKERS.imports, line: registration.import },
      { file: LAYOUT.eventsIndex, marker: MARKERS.subscribers, line: registration.line, orBeforeEndOf: /^export function registerSubscribers\(/ },
    ],
    config,
  );
  result.notes.push(...wiring.notes);
  await ensureDependency(config.projectRoot, '@mariachi/events', result);
  return result;
}

/**
 * A webhook endpoint, the way the webhook recipe receives one: `src/webhooks/<name>.controller.ts`
 * on the webhook server (WEBHOOK_PORT), which checks a Standard Webhooks signature over the raw
 * body, parses the body with the Zod contract in `src/contracts/<name>-webhook.ts`, answers a
 * redelivery as a duplicate, and hands the delivery to the `<name>-webhook` job. Its secret is
 * `<NAME>_WEBHOOK_SECRET`.
 */
export async function generateWebhook(config: GenerateWebhookConfig): Promise<GenerateResult> {
  assertProject(config.projectRoot);
  const n = names(config.name);
  const files = webhookFiles(n);
  const insertions: Insertion[] = [];
  const notes: string[] = [];
  if (!existsSync(join(config.projectRoot, LAYOUT.webhooksIndex))) files[LAYOUT.webhooksIndex] = WEBHOOKS_INDEX;
  if (!existsSync(join(config.projectRoot, WEBHOOKS_SCHEMA_FILE))) {
    files[WEBHOOKS_SCHEMA_FILE] = WEBHOOKS_SCHEMA;
    insertions.push({ file: LAYOUT.schemaIndex, marker: MARKERS.schema, line: "export * from './webhooks';" });
    notes.push('Run `mariachi db generate` to create the migration for the table deliveries are deduplicated in.');
  }
  const registration = webhookRegistration(n);
  insertions.push(
    { file: LAYOUT.webhooksIndex, marker: MARKERS.imports, line: registration.import },
    { file: LAYOUT.webhooksIndex, marker: MARKERS.webhooks, line: registration.line },
    { file: LAYOUT.jobsIndex, marker: MARKERS.imports, line: `import { ${n.camel}WebhookJob } from './${n.kebab}-webhook.job';` },
    { file: LAYOUT.jobsIndex, marker: MARKERS.jobs, line: `${n.camel}WebhookJob,` },
  );
  const result = await writeFiles(config.projectRoot, files, insertions, config);

  const env = await read(config.projectRoot, '.env.example');
  if (env !== undefined && !env.includes(webhookSecretName(n))) {
    await appendFile(join(config.projectRoot, '.env.example'), `${env.includes('WEBHOOK_PORT') ? '' : WEBHOOK_PORT_ENV}${webhookSecretEnv(n)}`);
    result.updated.push('.env.example');
  }
  if (!(await read(config.projectRoot, LAYOUT.app))?.includes('setupWebhooks(')) {
    notes.push(
      'src/app.ts does not start the webhook server yet: call `await setupWebhooks({ config, secrets, lifecycle, logger, tracer, db, jobQueue, communication })` from src/webhooks/index.ts there, after the API. A project made by `mariachi init` now shows how.',
    );
  }
  await ensureDependency(config.projectRoot, '@mariachi/webhooks', result);
  result.notes.push(
    ...notes,
    `Set ${webhookSecretName(n)} (whsec_..., the secret the sender signs with). Deliveries go to POST /webhooks/${n.kebab}/events on WEBHOOK_PORT (default 3002); the ${n.kebab}-webhook job handles them.`,
  );
  return result;
}

/** The folders of `src/services` with a `<folder>.service.ts`: the services `generate procedure` can add to. */
async function serviceFolders(root: string): Promise<string[]> {
  const dir = join(root, LAYOUT.servicesDir);
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory() && existsSync(join(dir, e.name, `${e.name}.service.ts`))).map((e) => e.name);
}

/**
 * One more procedure, `<service>.<name>`, on a service that exists: its input and output schemas
 * and its `Procedures` entry in the service's contract, a method on the service, its registration
 * in `register…Handlers()`, and a test that calls it through communication. `service` is its folder
 * in `src/services` (`notes`, `billing-report`), or an entity's singular (`note`).
 */
export async function generateProcedure(config: GenerateProcedureConfig): Promise<GenerateResult> {
  assertProject(config.projectRoot);
  const root = config.projectRoot;
  const given = names(config.service);
  const folders = await serviceFolders(root);
  const folder = [given.kebab, given.pluralKebab].find((f) => folders.includes(f));
  if (!folder) {
    throw new ConfigError(
      'create/no-service',
      `There is no service "${config.service}" in ${LAYOUT.servicesDir} (${folders.length > 0 ? `there are: ${folders.join(', ')}` : 'it has none'}). Make one with: mariachi generate service ${given.kebab}`,
      { services: folders },
    );
  }
  const svc = names(folder);
  const p = procedureNames(svc, names(config.name));
  const dir = `${LAYOUT.servicesDir}/${folder}`;
  const serviceFile = `${dir}/${folder}.service.ts`;
  const handlerFile = `${dir}/${folder}.handler.ts`;
  const contractFile = `${LAYOUT.contractsDir}/${folder}.ts`;
  const service = (await read(root, serviceFile)) as string;
  const handler = await read(root, handlerFile);
  const contract = await read(root, contractFile);
  if (handler === undefined) {
    throw new ConfigError('create/no-handler', `${handlerFile} doesn't exist: a service's procedures are registered there`);
  }
  if ([contract, handler].some((text) => text?.includes(`'${p.procedure}'`)) || new RegExp(`^\\s+(?:async\\s+)?${p.method}\\s*\\(`, 'm').test(service)) {
    throw new ConfigError('create/procedure-exists', `${p.procedure} exists already (${contractFile}, ${handlerFile} or ${serviceFile})`);
  }
  const serviceClass = /^export class (\w+)/m.exec(service)?.[1];
  const register = /^export function (\w+)\s*\(/m.exec(handler)?.[1];
  if (!serviceClass || !register) {
    throw new ConfigError(
      'create/unrecognised-service',
      `${serviceClass ? handlerFile : serviceFile} isn't laid out as generated: it needs ${serviceClass ? 'an exported register function' : 'an exported service class'}`,
    );
  }

  const testFile = `${dir}/${folder}.${names(config.name).kebab}.test.ts`;
  const fromService = `../../contracts/${folder}`;
  const result = await writeFiles(
    root,
    { [testFile]: procedureTest(svc, p, register, serviceClass, /^\s+constructor\(/m.test(service)) },
    [
      { file: serviceFile, marker: MARKERS.procedures, line: procedureMethod(p), orBeforeEndOf: new RegExp(`^export class ${serviceClass}\\b`) },
      { file: handlerFile, marker: MARKERS.procedures, line: procedureRegistration(p), orBeforeEndOf: new RegExp(`^export function ${register}\\b`) },
    ],
    config,
  );
  let serviceText = addImport(await readFile(join(root, serviceFile), 'utf-8'), [`${p.pascal}Input`, `${p.pascal}Output`], fromService, { type: true });
  if (!imports(serviceText, 'Context')) serviceText = addImport(serviceText, ['Context'], '@mariachi/core', { type: true });
  await writeFile(join(root, serviceFile), serviceText);
  await writeFile(join(root, handlerFile), addImport(await readFile(join(root, handlerFile), 'utf-8'), [`${p.camel}Input`, `${p.camel}Output`], fromService));
  if (contract === undefined) {
    await writeFile(join(root, contractFile), `import { z } from 'zod';\n${procedureContract(p)}`);
    result.created.push(contractFile);
  } else {
    const withZod = imports(contract, 'z') ? contract : addImport(contract, ['z'], 'zod');
    await writeFile(join(root, contractFile), `${withZod.replace(/\n*$/, '\n')}${procedureContract(p)}`);
    result.updated.push(contractFile);
  }
  for (const file of [serviceFile, handlerFile]) if (!result.updated.includes(file)) result.updated.push(file);
  result.notes.push(`To call it over HTTP, add a route to a controller: this.post('/${names(config.name).kebab}', { schema: { body: ${p.camel}Input, response: ${p.camel}Output } }, (ctx, body) => this.call(ctx, '${p.procedure}', body)).`);
  return result;
}
