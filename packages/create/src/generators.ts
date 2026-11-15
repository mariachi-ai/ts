import { existsSync } from 'node:fs';
import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { ConfigError } from '@mariachi/core';
import { LAYOUT, MARKERS } from './layout';
import { names } from './names';
import { E2E_HARNESS_FILE } from './templates/e2e';
import { entityFiles } from './templates/entity';
import { controllerFile, integrationFiles, jobFile, seedFile, serviceFiles } from './templates/parts';
import { projectFiles } from './templates/project';
import { PAGES_CONTROLLER_FILE, PAGES_DIR, PAGES_LAYOUT_FILE, pageFile, pageTestFile, pageTitle } from './templates/ui';
import { PROJECT_AUTH } from './types';
import type {
  GenerateControllerConfig,
  GenerateEntityConfig,
  GenerateIntegrationConfig,
  GenerateJobConfig,
  GeneratePageConfig,
  GenerateResult,
  GenerateSeedConfig,
  GenerateServiceConfig,
  ProjectConfig,
} from './types';
import { MARIACHI_VERSION } from './version';
import { mergeResults, writeFiles, type Insertion } from './writer';

const NPM_NAME = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

/**
 * Scaffolds a runnable project and, unless `example: false`, a `note` entity wired end to end.
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
  const project = await writeFiles(config.outputDir, projectFiles(config.name, range, auth, { e2e: config.e2e, organizations: config.organizations, ui: config.ui }));
  if (config.example === false) return project;
  const example = await generateEntity({ name: 'note', projectRoot: config.outputDir });
  return { ...mergeResults(project, example), updated: [] };
}

function assertProject(root: string): void {
  if (!existsSync(join(root, 'src'))) {
    throw new ConfigError('create/not-a-project', `${root} has no src/ directory; run this from a project created by \`mariachi init\``);
  }
}

/** Table, contract, repository, service, handlers, controller and a service test; registers all of them. */
export async function generateEntity(config: GenerateEntityConfig): Promise<GenerateResult> {
  assertProject(config.projectRoot);
  const n = names(config.name);
  const svc = `./${n.pluralKebab}/${n.pluralKebab}`;
  const insertions: Insertion[] = [
    { file: LAYOUT.schemaIndex, marker: MARKERS.schema, line: `export * from './${n.pluralKebab}';` },
    { file: LAYOUT.servicesIndex, marker: MARKERS.imports, line: `import { ${n.pluralPascal}Repository } from '${svc}.repository';` },
    { file: LAYOUT.servicesIndex, marker: MARKERS.imports, line: `import { ${n.pluralPascal}Service } from '${svc}.service';` },
    { file: LAYOUT.servicesIndex, marker: MARKERS.imports, line: `import { register${n.pluralPascal}Handlers } from '${svc}.handler';` },
    {
      file: LAYOUT.servicesIndex,
      marker: MARKERS.services,
      line: `register${n.pluralPascal}Handlers(communication, new ${n.pluralPascal}Service(new ${n.pluralPascal}Repository(deps.db)));`,
    },
    ...controllerInsertions(n.pluralPascal, n.pluralKebab),
  ];
  const files = entityFiles(n);
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
  return writeFiles(
    config.projectRoot,
    { [`${LAYOUT.seedsDir}/${n.kebab}.seed.ts`]: seedFile(n) },
    [
      { file: LAYOUT.seedsIndex, marker: MARKERS.imports, line: `import { ${n.camel}Seed } from './${n.kebab}.seed';` },
      { file: LAYOUT.seedsIndex, marker: MARKERS.seeds, line: `${n.camel}Seed,` },
    ],
    config,
  );
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
