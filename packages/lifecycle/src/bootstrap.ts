import { createContainer, getContainer, setContainer, KEYS, MariachiError, type Container, type Logger } from '@mariachi/core';
import { loadConfig, createSecrets, type AppConfig, type AppConfigInput, type LoadConfigOptions, type Secrets } from '@mariachi/config';
import {
  createObservability,
  ConsoleLoggerAdapter,
  NoopTracerAdapter,
  NoopMetricsAdapter,
  NoopErrorTracker,
  openTelemetryRegistered,
  setupOpenTelemetry,
} from '@mariachi/observability';
import type { TracerAdapter, MetricsAdapter, ErrorTracker } from '@mariachi/observability';
import { Lifecycle } from './lifecycle';
import type { StartupManager } from './startup';
import type { ShutdownManager } from './shutdown';
import type { HealthManager } from './health';

export interface BootstrapOptions {
  config?: AppConfigInput;
  configOptions?: LoadConfigOptions;
  /** Defaults to the global container. */
  container?: Container;
  /** Install SIGTERM/SIGINT handlers. Default true. */
  installSignalHandlers?: boolean;
  /** Log and report unhandled rejections / uncaught exceptions. Default true. */
  captureProcessErrors?: boolean;
}

export interface BootstrapResult {
  config: AppConfig;
  logger: Logger;
  tracer: TracerAdapter;
  metrics: MetricsAdapter;
  errors: ErrorTracker;
  secrets: Secrets;
  container: Container;
  lifecycle: Lifecycle;
  startup: StartupManager;
  shutdown: ShutdownManager;
  health: HealthManager;
}

/**
 * Composition root: loads config, builds observability, and registers Config, Logger, Tracer,
 * Metrics, ErrorTracker, Secrets and Lifecycle in the container. Construct services after this.
 */
export function bootstrap(options: BootstrapOptions = {}): BootstrapResult {
  const config = loadConfig(options.config, options.configOptions);
  const observability = createObservability({ serviceName: config.serviceName, ...config.observability });
  const { logger, tracer, metrics, errors } = observability;
  const secrets = createSecrets({ adapter: 'env' });
  const lifecycle = new Lifecycle(logger);

  const container = options.container ?? getContainer();
  container.register(KEYS.Config, config);
  container.register(KEYS.Logger, logger);
  container.register(KEYS.Tracer, tracer);
  container.register(KEYS.Metrics, metrics);
  container.register(KEYS.ErrorTracker, errors);
  container.register(KEYS.Secrets, secrets);
  container.register(KEYS.Lifecycle, lifecycle);

  const tracing = config.observability?.tracing;
  if (tracing && tracing.adapter !== 'noop' && tracing.endpoint) {
    startTracing(config.serviceName, tracing.endpoint, logger, lifecycle);
  }
  if (errors.flush) {
    lifecycle.shutdown.register({ name: 'error-tracker', priority: -1001, fn: async () => void (await errors.flush?.()) });
  }

  if (options.captureProcessErrors !== false) {
    process.on('unhandledRejection', (reason) => {
      const err = reason instanceof Error ? reason : new Error(String(reason)); // mariachi-lint-ignore
      logger.error({ err }, 'Unhandled promise rejection');
      errors.captureException(err);
    });
    process.on('uncaughtException', (err) => {
      logger.error({ err }, 'Uncaught exception');
      errors.captureException(err);
    });
  }

  if (options.installSignalHandlers !== false) {
    lifecycle.installSignalHandlers({ timeoutMs: config.server.shutdownTimeoutMs });
  }

  return {
    config,
    logger,
    tracer,
    metrics,
    errors,
    secrets,
    container,
    lifecycle,
    startup: lifecycle.startup,
    shutdown: lifecycle.shutdown,
    health: lifecycle.health,
  };
}

/**
 * Exports spans to `endpoint`, unless an OpenTelemetry SDK is already registered (a `--require` preload,
 * or one the app started): then Mariachi's spans go to that one, and a second SDK is not started over it.
 * Tracing never stops the app from starting: without the SDK packages installed, it warns and spans
 * are not exported.
 */
function startTracing(serviceName: string, endpoint: string, logger: Logger, lifecycle: Lifecycle): void {
  if (openTelemetryRegistered()) {
    logger.info({ collector: origin(endpoint) }, 'An OpenTelemetry SDK is already registered; using it');
    return;
  }
  let stop: () => Promise<void>;
  try {
    stop = setupOpenTelemetry({ serviceName, endpoint });
  } catch (err) {
    if (!(err instanceof MariachiError && err.code === 'dependency/missing-peer')) throw err;
    logger.warn(
      { err, collector: origin(endpoint) },
      'Tracing is on, but spans are not exported: install @opentelemetry/sdk-node and @opentelemetry/exporter-trace-otlp-http, or register an SDK before the app starts',
    );
    return;
  }
  lifecycle.shutdown.register({ name: 'opentelemetry', priority: -1000, fn: stop });
}

/** Where an OTLP endpoint points, for a log line: its origin only, since its URL can carry credentials. */
function origin(endpoint: string): string {
  try {
    return new URL(endpoint).origin;
  } catch {
    return '(not a URL)';
  }
}

/**
 * Isolated bootstrap for tests: fresh global container, console logger at `warn`, noop tracing
 * and metrics, no signal handlers, and config built only from `config` (the process environment is ignored).
 */
export function bootstrapForTest(options: { config?: AppConfigInput; env?: Record<string, string> } = {}): BootstrapResult & {
  restore: () => void;
} {
  const container = createContainer();
  const previous = setContainer(container);
  const config = loadConfig({ env: 'test', ...options.config }, { env: options.env ?? {} });
  const logger = new ConsoleLoggerAdapter({}, 'warn');
  const tracer = new NoopTracerAdapter();
  const metrics = new NoopMetricsAdapter();
  const errors = new NoopErrorTracker();
  const secrets = createSecrets({ adapter: 'env' });
  const lifecycle = new Lifecycle(logger);

  container.register(KEYS.Config, config);
  container.register(KEYS.Logger, logger);
  container.register(KEYS.Tracer, tracer);
  container.register(KEYS.Metrics, metrics);
  container.register(KEYS.ErrorTracker, errors);
  container.register(KEYS.Secrets, secrets);
  container.register(KEYS.Lifecycle, lifecycle);

  return {
    config,
    logger,
    tracer,
    metrics,
    errors,
    secrets,
    container,
    lifecycle,
    startup: lifecycle.startup,
    shutdown: lifecycle.shutdown,
    health: lifecycle.health,
    restore: () => void setContainer(previous),
  };
}
