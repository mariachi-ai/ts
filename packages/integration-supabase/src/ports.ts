import { ConfigError } from '@mariachi/core';
import type { SupabaseConfig } from './generated';
import { projectUrl } from './keys';

/**
 * The config Mariachi's own ports take to use a Supabase project. Each returns a plain object of the shape the
 * port's factory takes, so this package depends on none of them.
 */

/**
 * `createGoTrueAuth`'s config (`@mariachi/auth-gotrue`): Supabase Auth is GoTrue, at `<project URL>/auth/v1`,
 * which is also the tokens' issuer. Tokens are checked against the project's JWKS, ES256 or RS256, whichever
 * key the project signs with.
 *
 * The project must sign with JWT signing keys (dashboard › JWT Keys). A project still on the legacy JWT secret
 * signs with a shared HS256 secret, which publishes no key to check against: migrate it there first, which
 * Supabase does without signing anyone out.
 */
export function supabaseAuthConfig(config: Pick<SupabaseConfig, 'url'>): { url: string; algorithms: Array<'ES256' | 'RS256'> } {
  return { url: `${projectUrl(config.url)}/auth/v1`, algorithms: ['ES256', 'RS256'] };
}

/** What `supabaseStorageConfig` returns: `createStorage`'s config (`@mariachi/storage`) for the S3 adapter. */
export interface SupabaseStorageConfig {
  adapter: 's3';
  bucket: string;
  region: string;
  endpoint: string;
  forcePathStyle: true;
  credentials: { accessKeyId: string; secretAccessKey: string };
  publicBaseUrl: string;
}

/**
 * `createStorage`'s config for one bucket, through Storage's S3 endpoint: `https://<project-ref>.storage.supabase.co/storage/v1/s3`
 * for a hosted project (`<url>/storage/v1/s3` for any other URL, such as the local stack's), path-style, signed
 * with the S3 access key. `publicUrl` gives the address Supabase serves a public bucket's objects at.
 *
 * The access key reaches every bucket and skips Row Level Security, so check who may read or write a key before
 * the call, as for any bucket. Supabase takes no per-object ACLs: a bucket is public or it isn't.
 */
export function supabaseStorageConfig(config: SupabaseConfig, options: { bucket: string }): SupabaseStorageConfig {
  const missing = (
    [
      ['s3AccessKeyId', 'SUPABASE_S3_ACCESS_KEY_ID'],
      ['s3SecretAccessKey', 'SUPABASE_S3_SECRET_ACCESS_KEY'],
      ['s3Region', 'SUPABASE_S3_REGION'],
    ] as const
  )
    .filter(([key]) => !config[key])
    .map(([, env]) => env);
  if (missing.length) throw new ConfigError('supabase/missing-setting', `Storage through S3 needs ${missing.join(', ')}`, { missing });
  if (!options.bucket) throw new ConfigError('supabase/missing-setting', 'Storage through S3 needs a bucket');
  const base = projectUrl(config.url);
  const host = new URL(base).hostname;
  const ref = /^([a-z0-9]+)\.supabase\.co$/.exec(host)?.[1];
  return {
    adapter: 's3',
    bucket: options.bucket,
    region: config.s3Region!,
    endpoint: ref ? `https://${ref}.storage.supabase.co/storage/v1/s3` : `${base}/storage/v1/s3`,
    forcePathStyle: true,
    credentials: { accessKeyId: config.s3AccessKeyId!, secretAccessKey: config.s3SecretAccessKey! },
    publicBaseUrl: `${base}/storage/v1/object/public/${encodeURIComponent(options.bucket)}`,
  };
}

/** What `supabaseDatabaseConfig` returns: `createPostgresDatabase`'s config (`@mariachi/database-postgres`). */
export interface SupabaseDatabaseConfig {
  url: string;
  ssl?: 'require';
  prepare?: false;
}

/**
 * `createPostgresDatabase`'s config for one of the project's connection strings: TLS required for Supabase's
 * hosts, and prepared statements off for the shared pooler in transaction mode (`*.pooler.supabase.com:6543`),
 * which doesn't keep them. The dedicated pooler (`db.<project-ref>.supabase.co:6543`) does, on PgBouncer 1.21
 * and later, so it keeps them on.
 *
 * Which string to use is in the recipe (`mariachi docs recipes/use-supabase`): the session pooler for a
 * long-running server, the direct connection where it has IPv6 (or the IPv4 add-on), transaction mode only for
 * short-lived processes, and never transaction mode for migrations.
 */
export function supabaseDatabaseConfig(url: string): SupabaseDatabaseConfig {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    // The string holds the database password: never echo it
    throw new ConfigError('supabase/invalid-database-url', 'The database URL is not a postgres:// URL (percent-encode special characters in the password)');
  }
  if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
    throw new ConfigError('supabase/invalid-database-url', 'The database URL must start postgres:// or postgresql://');
  }
  const host = parsed.hostname.toLowerCase();
  const supabase = host.endsWith('.supabase.co') || host.endsWith('.supabase.com');
  const transactionPooler = host.endsWith('.pooler.supabase.com') && parsed.port === '6543';
  return { url, ...(supabase ? { ssl: 'require' as const } : {}), ...(transactionPooler ? { prepare: false as const } : {}) };
}
