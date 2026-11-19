import { ConfigError } from '@mariachi/core';
import type { AppConfigInput } from './schema';

type Env = Record<string, string | undefined>;

/** A value that can't be read is a config error naming the variable, not a silent default. */
const unreadable = (name: string, expected: string) => new ConfigError('config/invalid', `Invalid configuration: ${name} must be ${expected}`, { variable: name });

function num(v: string | undefined, name: string): number | undefined {
  if (v === undefined || v.trim() === '') return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) throw unreadable(name, 'a number');
  return n;
}

const TRUE = new Set(['true', '1', 'yes', 'on']);
const FALSE = new Set(['false', '0', 'no', 'off']);

function bool(v: string | undefined, name: string): boolean | undefined {
  if (v === undefined || v.trim() === '') return undefined;
  const value = v.trim().toLowerCase();
  if (TRUE.has(value)) return true;
  if (FALSE.has(value)) return false;
  throw unreadable(name, 'true or false');
}

const ENVIRONMENTS = ['development', 'test', 'production'] as const;

/** `ENV`, else `NODE_ENV`. An unknown value is refused: read as "development" it would switch production safeguards off. */
function environment(env: Env): (typeof ENVIRONMENTS)[number] | undefined {
  const name = env.ENV ? 'ENV' : 'NODE_ENV';
  const value = env.ENV || env.NODE_ENV;
  if (value === undefined || value === '') return undefined;
  if ((ENVIRONMENTS as readonly string[]).includes(value)) return value as (typeof ENVIRONMENTS)[number];
  throw unreadable(name, `development, test or production${name === 'NODE_ENV' ? ' (set ENV to one of them if NODE_ENV has to stay as it is)' : ''}`);
}

function list(v: string | undefined): string[] | undefined {
  if (!v) return undefined;
  return v.split(',').map((s) => s.trim()).filter(Boolean);
}

/** Parses a JSON variable. Invalid JSON is a config error, not a silent default. */
function json<T>(v: string | undefined, name: string): T | undefined {
  if (!v) return undefined;
  try {
    return JSON.parse(v) as T;
  } catch {
    throw new ConfigError('config/invalid-json', `${name} is not valid JSON`);
  }
}

/**
 * The email key for the adapter in use, so one provider's key never goes to another: `EMAIL_API_KEY`
 * belongs to the adapter `EMAIL_ADAPTER` names, and `RESEND_API_KEY` is only ever Resend's. The
 * adapter defaults to Resend, so `EMAIL_API_KEY` without `EMAIL_ADAPTER` is refused instead of
 * being sent there.
 */
function emailApiKey(env: Env): string | undefined {
  if (!env.EMAIL_ADAPTER) {
    if (env.EMAIL_API_KEY) {
      throw new ConfigError('config/email-adapter-required', 'EMAIL_API_KEY is set without EMAIL_ADAPTER: set EMAIL_ADAPTER to the provider the key is for (resend, postmark, sendgrid, custom)');
    }
    return env.RESEND_API_KEY;
  }
  return env.EMAIL_ADAPTER === 'resend' ? (env.EMAIL_API_KEY ?? env.RESEND_API_KEY) : env.EMAIL_API_KEY;
}

function compact<T extends Record<string, unknown>>(obj: T): T | undefined {
  const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
  return entries.length ? (Object.fromEntries(entries) as T) : undefined;
}

/** Maps well-known environment variables onto the config shape. The only place `process.env` is read. */
export function buildConfigFromEnv(env: Env = process.env): AppConfigInput {
  return {
    env: environment(env),
    serviceName: env.SERVICE_NAME,
    server: compact({
      host: env.HOST,
      port: num(env.PORT, 'PORT'),
      adminPort: num(env.ADMIN_PORT, 'ADMIN_PORT'),
      webhookPort: num(env.WEBHOOK_PORT, 'WEBHOOK_PORT'),
      trustProxy: bool(env.TRUST_PROXY, 'TRUST_PROXY'),
      bodyLimitBytes: num(env.BODY_LIMIT_BYTES, 'BODY_LIMIT_BYTES'),
      corsOrigins: list(env.CORS_ORIGINS),
      shutdownTimeoutMs: num(env.SHUTDOWN_TIMEOUT_MS, 'SHUTDOWN_TIMEOUT_MS'),
    }),
    database: env.DATABASE_URL
      ? compact({
          url: env.DATABASE_URL,
          adapter: env.DATABASE_ADAPTER,
          poolMin: num(env.DATABASE_POOL_MIN, 'DATABASE_POOL_MIN'),
          poolMax: num(env.DATABASE_POOL_MAX, 'DATABASE_POOL_MAX'),
        }) as NonNullable<AppConfigInput['database']>
      : undefined,
    redis: env.REDIS_URL ? { url: env.REDIS_URL } : undefined,
    rateLimit: env.RATE_LIMIT_ADAPTER ? { adapter: env.RATE_LIMIT_ADAPTER as 'memory' | 'redis' | 'postgres' } : undefined,
    auth: compact({
      adapter: env.AUTH_ADAPTER,
      jwtSecret: env.JWT_SECRET,
      jwtIssuer: env.JWT_ISSUER,
      jwtAudience: env.JWT_AUDIENCE,
      jwtExpiresIn: env.JWT_EXPIRES_IN,
      sessionSecret: env.SESSION_SECRET,
    }),
    encryption: compact({
      adapter: env.ENCRYPTION_ADAPTER as 'local' | 'aws-kms' | 'gcp-kms' | undefined,
      key: env.ENCRYPTION_KEY,
      keyVersion: num(env.ENCRYPTION_KEY_VERSION, 'ENCRYPTION_KEY_VERSION'),
      kmsKeyId: env.ENCRYPTION_KMS_KEY_ID,
    }),
    storage: compact({
      adapter: env.STORAGE_ADAPTER,
      bucket: env.STORAGE_BUCKET ?? env.S3_BUCKET,
      region: env.STORAGE_REGION ?? env.AWS_REGION,
      basePath: env.STORAGE_BASE_PATH,
      signingSecret: env.STORAGE_SIGNING_SECRET,
      publicBaseUrl: env.STORAGE_PUBLIC_BASE_URL,
    }),
    billing: compact({
      adapter: env.BILLING_ADAPTER,
      secretKey: env.STRIPE_SECRET_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    }),
    email: compact({
      adapter: env.EMAIL_ADAPTER,
      apiKey: emailApiKey(env),
      from: env.EMAIL_FROM,
      smtpUrl: env.SMTP_URL,
      apiUrl: env.EMAIL_API_URL,
    }),
    search: compact({
      adapter: env.SEARCH_ADAPTER,
      url: env.TYPESENSE_URL,
      apiKey: env.TYPESENSE_API_KEY,
    }),
    ai: compact({
      adapter: env.AI_ADAPTER,
      apiKey: env.AI_API_KEY ?? env.OPENAI_API_KEY,
      baseUrl: env.AI_BASE_URL,
      model: env.AI_MODEL,
      fallbackModels: list(env.AI_FALLBACK_MODELS),
      anthropicApiKey: env.ANTHROPIC_API_KEY,
      costTable: json(env.AI_COST_TABLE, 'AI_COST_TABLE'),
    }),
    observability: compact({
      logging: compact({
        adapter: env.LOG_ADAPTER as 'pino' | 'console' | undefined,
        level: env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error' | undefined,
        pretty: bool(env.LOG_PRETTY, 'LOG_PRETTY'),
      }),
      tracing: compact({
        adapter: env.TRACING_ADAPTER as 'noop' | 'otel' | undefined,
        endpoint: env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ?? env.OTEL_EXPORTER_OTLP_ENDPOINT,
      }),
      metrics: compact({
        adapter: env.METRICS_ADAPTER as 'noop' | 'prometheus' | undefined,
        prefix: env.METRICS_PREFIX,
      }),
      errors: compact({
        adapter: (env.ERRORS_ADAPTER ?? (env.SENTRY_DSN ? 'sentry' : undefined)) as 'noop' | 'sentry' | undefined,
        dsn: env.SENTRY_DSN,
      }),
    }),
  };
}

/** Raw env lookup for package-registered sections. */
export function readEnv(key: string): string | undefined {
  return process.env[key];
}
