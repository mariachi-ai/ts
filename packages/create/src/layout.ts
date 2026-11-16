/** Canonical layout of a generated project. Generators and `validate` both rely on it. */
export const LAYOUT = {
  /** The entry point: starts the app that `app` builds. */
  main: 'src/main.ts',
  /** The composition root: `createApp()` builds the object graph, for `main.ts` and for tests. */
  app: 'src/app.ts',
  schemaIndex: 'src/schema/index.ts',
  seedsDir: 'src/seeds',
  seedsIndex: 'src/seeds/index.ts',
  contractsDir: 'src/contracts',
  servicesDir: 'src/services',
  servicesIndex: 'src/services/index.ts',
  controllersDir: 'src/api/controllers',
  controllersIndex: 'src/api/controllers/index.ts',
  jobsDir: 'src/jobs',
  jobsIndex: 'src/jobs/index.ts',
  integrationsDir: 'src/integrations',
} as const;

/** Registry markers: generated lines are inserted above the line containing the marker. */
export const MARKERS = {
  imports: 'mariachi:imports',
  schema: 'mariachi:schema',
  services: 'mariachi:services',
  controllers: 'mariachi:controllers',
  jobs: 'mariachi:jobs',
  seeds: 'mariachi:seeds',
  /** In `pages.controller.ts`: where a page's route goes. */
  pages: 'mariachi:pages',
  /** In the pages' `layout.ts`: where a page's link in the bar goes. */
  nav: 'mariachi:nav',
} as const;
