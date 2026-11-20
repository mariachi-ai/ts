export interface ProjectConfig {
  /** npm package name of the new project. */
  name: string;
  /** Directory to create. It must not exist or must be empty. */
  outputDir: string;
  /**
   * Generate the example `note` entity (schema, service, handlers, controller, tests), kept in a
   * search index with `notes.search` (`GET /api/notes/search?q=`): the worked example of
   * `deps.search`. Default true.
   */
  example?: boolean;
  /** Override the `@mariachi/*` version range written to package.json. Default `^<framework version>`. */
  mariachiVersion?: string;
  /**
   * End-to-end test support: `pnpm test:e2e`, `src/testing/`, a first test, and one per generated
   * entity, with `@mariachi/testing` and `testcontainers` as devDependencies. The tests need Docker.
   * Default true; `false` leaves all of it out (and `generate entity` then writes no end-to-end test).
   */
  e2e?: boolean;
  /**
   * How users sign in. `jwt` (default): HS256 tokens from `JWT_SECRET` (`JWTAdapter`). `gotrue`:
   * GoTrue (Supabase Auth, hosted or your own), verified with `@mariachi/auth-gotrue`; the tenant is
   * the token's organization claim (`@mariachi/tenancy`) or the user's personal tenant, with an
   * example sign-in page and `GET /api/me`.
   */
  auth?: ProjectAuth;
  /**
   * Organizations, memberships and invitations in the app's own database (`@mariachi/organizations`):
   * the tables, the `/api/organizations` routes, the check that puts a request in the organization
   * it names, and invitation emails. For apps whose identity provider doesn't keep organizations
   * itself. Works with either `auth`. Default false.
   */
  organizations?: boolean;
  /**
   * Pages, sent by the same server as the API and styled with `@mariachi/design`: a layout, a home
   * page, `public/` for the files pages load, and `mariachi generate page`. Works with either `auth`.
   * Default false.
   */
  ui?: boolean;
}

export const PROJECT_AUTH = ['jwt', 'gotrue'] as const;
export type ProjectAuth = (typeof PROJECT_AUTH)[number];

export interface GenerateOptions {
  name: string;
  /** Project root (the directory containing `src/`). */
  projectRoot: string;
  /** Overwrite files that already exist. */
  force?: boolean;
}

export interface GenerateEntityConfig extends GenerateOptions {
  /**
   * The entity's columns, as `name:type`: `title:string`, `done:boolean`, and `dueAt:timestamp?` (or
   * `dueAt:timestamp:optional`) for a nullable one. Types: string, text, integer, number, boolean,
   * timestamp, date, uuid. Default: one `name:string`.
   */
  fields?: string[];
  /** The plural (table, routes, procedure namespace) when the rules get it wrong: `cactus` → `cacti`. */
  plural?: string;
  /**
   * Keep it in a search index: `src/search/<plural>.ts`, listed in `src/search/index.ts`. Its service
   * indexes a row when it is created or updated and removes it when it is deleted, in the same
   * transaction, and `<plural>.search` (`GET /api/<plural>/search?q=`) finds rows by the words in its
   * text fields, tenant-scoped. Needs a string or text field. Default false.
   */
  search?: boolean;
}
export type GenerateServiceConfig = GenerateOptions;
export type GenerateControllerConfig = GenerateOptions;
export type GenerateJobConfig = GenerateOptions;
export type GenerateIntegrationConfig = GenerateOptions;
export type GeneratePageConfig = GenerateOptions;
export type GenerateSeedConfig = GenerateOptions;
export type GenerateWebhookConfig = GenerateOptions;

export interface GenerateEventConfig extends GenerateOptions {
  /** Also a subscriber to it: its name, or `true` for `on-<event>`. */
  subscriber?: string | boolean;
}

export interface GenerateSubscriberConfig extends Omit<GenerateOptions, 'name'> {
  /** The event, made by `generate event`: `billing.invoice.paid`. */
  event: string;
  /** The subscriber's name. Default `on-<event>`. */
  name?: string;
}

export interface GenerateProcedureConfig extends GenerateOptions {
  /** The service it goes on: its folder in `src/services` (`notes`, `billing-report`) or an entity's singular (`note`). */
  service: string;
}

export interface GenerateResult {
  /** Paths relative to the project root. */
  created: string[];
  /** Registry files that were edited. */
  updated: string[];
  /** Manual follow-ups (e.g. a registry marker was missing). */
  notes: string[];
}

export interface ValidationResult {
  valid: boolean;
  violations: Violation[];
  filesChecked: number;
}

export interface Violation {
  rule: string;
  severity: 'error' | 'warning';
  file: string;
  line?: number;
  message: string;
  suggestion?: string;
}

export interface ValidateOptions {
  /** Rule names to skip. */
  disable?: string[];
}
