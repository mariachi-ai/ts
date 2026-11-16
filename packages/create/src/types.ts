export interface ProjectConfig {
  /** npm package name of the new project. */
  name: string;
  /** Directory to create. It must not exist or must be empty. */
  outputDir: string;
  /** Generate the example `note` entity (schema, service, handlers, controller, test). Default true. */
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

export type GenerateEntityConfig = GenerateOptions;
export type GenerateServiceConfig = GenerateOptions;
export type GenerateControllerConfig = GenerateOptions;
export type GenerateJobConfig = GenerateOptions;
export type GenerateIntegrationConfig = GenerateOptions;
export type GeneratePageConfig = GenerateOptions;
export type GenerateSeedConfig = GenerateOptions;

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
