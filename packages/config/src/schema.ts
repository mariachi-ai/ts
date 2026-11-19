import { z } from 'zod';
import { secret, secretUrl } from './redact';

const port = z.coerce.number().int().min(0).max(65535);

export const AppConfigSchema = z.object({
  env: z.enum(['development', 'test', 'production']).default('development'),
  serviceName: z.string().default('mariachi'),
  server: z
    .object({
      host: z.string().default('0.0.0.0'),
      port: port.default(3000),
      adminPort: port.default(3001),
      webhookPort: port.default(3002),
      trustProxy: z.boolean().default(false),
      bodyLimitBytes: z.number().int().positive().default(1_048_576),
      corsOrigins: z.array(z.string()).default([]),
      shutdownTimeoutMs: z.number().int().positive().default(15_000),
    })
    .default({}),
  database: z
    .object({
      adapter: z.string().default('postgres'),
      url: secretUrl(z.string().url()),
      /** @deprecated Not used: the Postgres driver opens connections on demand and closes idle ones. Only `poolMax` bounds the pool. */
      poolMin: z.number().int().min(0).default(2),
      poolMax: z.number().int().min(1).default(10),
    })
    .optional(),
  redis: z
    .object({
      url: secretUrl(z.string().url()),
    })
    .optional(),
  /**
   * Where `createRateLimiter` keeps its counts (`RATE_LIMIT_ADAPTER`): `memory` (one process),
   * `redis` (`REDIS_URL`) or `postgres` (the app's database). Unset, the app chooses.
   */
  rateLimit: z
    .object({
      adapter: z.enum(['memory', 'redis', 'postgres']),
    })
    .optional(),
  auth: z
    .object({
      adapter: z.string().default('jwt'),
      jwtSecret: secret(z.string().min(32)).optional(),
      jwtIssuer: z.string().optional(),
      jwtAudience: z.string().optional(),
      jwtExpiresIn: z.string().default('1h'),
      sessionSecret: secret(z.string().min(32)).optional(),
    })
    .optional(),
  encryption: z
    .object({
      adapter: z.enum(['local', 'aws-kms', 'gcp-kms']).default('local'),
      /** The local adapter's key (`ENCRYPTION_KEY`). */
      key: secret(z.string().min(32)).optional(),
      /** Which generation `key` is. Use it as the key's id (`keys: { ['v' + keyVersion]: key }`), and raise it when you rotate. */
      keyVersion: z.number().int().positive().default(1),
      /** The KMS key to wrap data keys with (`ENCRYPTION_KMS_KEY_ID`): an AWS key id or ARN, or a GCP key name. */
      kmsKeyId: z.string().optional(),
    })
    .optional(),
  storage: z
    .object({
      adapter: z.string().default('local'),
      bucket: z.string().optional(),
      region: z.string().optional(),
      basePath: z.string().optional(),
      /** Signs the local adapter's URLs (`STORAGE_SIGNING_SECRET`). */
      signingSecret: secret(z.string().min(32)).optional(),
      /** Where public objects are served from, e.g. a CDN or `/api/storage` (`STORAGE_PUBLIC_BASE_URL`). */
      publicBaseUrl: z.string().optional(),
    })
    .optional(),
  billing: z
    .object({
      adapter: z.string().default('stripe'),
      secretKey: secret(z.string()).optional(),
      webhookSecret: secret(z.string()).optional(),
    })
    .optional(),
  email: z
    .object({
      adapter: z.string().default('resend'),
      apiKey: secret(z.string()).optional(),
      from: z.string().optional(),
      /** `smtp://user:pass@host:587` or `smtps://…`, for `adapter: 'smtp'`. */
      smtpUrl: secretUrl(z.string()).optional(),
      /** The base URL of an HTTP email API, when it isn't the provider's own (also for custom adapters). */
      apiUrl: secretUrl(z.string().url()).optional(),
    })
    .optional(),
  search: z
    .object({
      adapter: z.string().default('typesense'),
      url: secretUrl(z.string()).optional(),
      apiKey: secret(z.string()).optional(),
    })
    .optional(),
  ai: z
    .object({
      adapter: z.string().default('openai'),
      apiKey: secret(z.string()).optional(),
      /** Where the provider's API is, for a proxy, a gateway or a local model server (`createAI`'s `baseURL`). */
      baseUrl: secretUrl(z.string().url()).optional(),
      model: z.string().optional(),
      /** Tried in order on the primary provider when the model fails. */
      fallbackModels: z.array(z.string()).optional(),
      /** For `AnthropicAdapter`, as the primary or a fallback provider. */
      anthropicApiKey: secret(z.string()).optional(),
      /** USD per 1K tokens, merged over the built-in table. Keys match model ids or their prefixes. */
      costTable: z.record(z.object({ input: z.number().nonnegative(), output: z.number().nonnegative() })).optional(),
    })
    .optional(),
  observability: z
    .object({
      logging: z
        .object({
          adapter: z.enum(['pino', 'console']).default('pino'),
          level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
          /** Human-readable lines for a terminal (`LOG_PRETTY`). Needs `pino-pretty`. Not for production. */
          pretty: z.boolean().optional(),
        })
        .optional(),
      tracing: z
        .object({
          adapter: z.enum(['noop', 'otel', 'opentelemetry']).default('noop'),
          endpoint: z.string().optional(),
        })
        .optional(),
      metrics: z
        .object({
          adapter: z.enum(['noop', 'prometheus']).default('noop'),
          prefix: z.string().optional(),
        })
        .optional(),
      errors: z
        .object({
          adapter: z.enum(['noop', 'sentry']).default('noop'),
          // A current DSN has only a public key and shows as it is; an older `public:secret@` one has its secret hidden
          dsn: secretUrl(z.string()).optional(),
        })
        .optional(),
    })
    .optional(),
  /** Sections contributed by packages via `registerConfigSection()`. */
  sections: z.record(z.unknown()).default({}),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
export type AppConfigInput = z.input<typeof AppConfigSchema>;
