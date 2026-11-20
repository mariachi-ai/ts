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
  /** Event definitions (`<name>.event.ts`), and `subscribers/`. */
  eventsDir: 'src/events',
  /** `registerSubscribers()`: every subscriber, subscribed at start. */
  eventsIndex: 'src/events/index.ts',
  subscribersDir: 'src/events/subscribers',
  /** Webhook controllers (`<name>.controller.ts`). */
  webhooksDir: 'src/webhooks',
  /** `setupWebhooks()`: the webhook server and every controller on it. */
  webhooksIndex: 'src/webhooks/index.ts',
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
  /** In a service class and its `register…Handlers()`: where `generate procedure` adds a method and its registration. */
  procedures: 'mariachi:procedures',
  /** In `src/events/index.ts`: where a subscriber is subscribed. */
  subscribers: 'mariachi:subscribers',
  /** In `src/webhooks/index.ts`: where a webhook controller is listed. */
  webhooks: 'mariachi:webhooks',
} as const;
