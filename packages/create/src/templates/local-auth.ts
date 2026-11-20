import { createPrivateKey, generateKeyPairSync, randomBytes, randomUUID, sign, type JsonWebKey, type KeyObject } from 'node:crypto';
import { ConfigError } from '@mariachi/core';

/**
 * The local GoTrue of an `--auth gotrue` project: the Compose services that run it (GoTrue on the
 * project's own Postgres, in an `auth` schema, and Mailpit to catch its email), and the keys it
 * signs with. The keys are made for each project, at `init` or by `mariachi dev`, and kept in `.env`
 * only: `.env.example` lists them empty.
 */

/** GoTrue (Supabase Auth). The same release the framework's own tests run against. */
export const GOTRUE_IMAGE = 'supabase/auth:v2.197.0';
/** A mailbox for development: GoTrue's email and the app's own land here, readable in a browser and over HTTP. */
export const MAILPIT_IMAGE = 'axllent/mailpit:v1.27.11';
/** Where the local GoTrue answers, on this machine. Its issuer and the base of the links in its email. */
export const LOCAL_AUTH_URL = 'http://localhost:9999';
/** Mailpit's web page and API. */
export const MAILBOX_URL = 'http://localhost:8025';
/** Mailpit's SMTP port on this machine, for the app's own email. */
export const MAILBOX_SMTP_URL = 'smtp://localhost:1025';

/** The variables `.env.example` leaves empty and `.env` gets values for. Filled in this order. */
export const LOCAL_SECRETS = ['GOTRUE_JWT_SECRET', 'GOTRUE_JWT_KEYS', 'AUTH_SERVICE_KEY'] as const;

/** A service-role key is good this long: it lives in a development `.env` and opens only the local GoTrue. */
const SERVICE_KEY_YEARS = 10;

const part = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');

/** A new ES256 signing key for GoTrue, as the JSON array `GOTRUE_JWT_KEYS` takes: the private key, its id, its use. */
export function newSigningKeys(): string {
  const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const jwk = { ...privateKey.export({ format: 'jwk' }), kid: randomUUID(), alg: 'ES256', use: 'sig', key_ops: ['sign', 'verify'] };
  return JSON.stringify([jwk]);
}

/**
 * A service-role key for the local GoTrue: a token with `role: service_role`, signed with the first
 * key of `GOTRUE_JWT_KEYS`. It opens GoTrue's admin API, which is how the app reads whether a user's
 * address is confirmed (`AUTH_SERVICE_KEY`).
 */
export function serviceRoleKey(keys: string, now: Date = new Date()): string {
  let jwk: (JsonWebKey & { kid?: string }) | undefined;
  let key: KeyObject | undefined;
  try {
    jwk = (JSON.parse(keys) as Array<JsonWebKey & { kid?: string }>)[0];
    key = jwk ? createPrivateKey({ key: jwk, format: 'jwk' }) : undefined;
  } catch {
    key = undefined;
  }
  if (!jwk || !key) throw new ConfigError('create/invalid-signing-key', 'GOTRUE_JWT_KEYS is not a JSON array whose first entry is a private ES256 key (a JWK)');
  const iat = Math.floor(now.getTime() / 1000);
  const body = `${part({ alg: 'ES256', typ: 'JWT', ...(jwk.kid ? { kid: jwk.kid } : {}) })}.${part({ role: 'service_role', iat, exp: iat + SERVICE_KEY_YEARS * 365 * 24 * 3600 })}`;
  const signature = sign('sha256', Buffer.from(body), { key, dsaEncoding: 'ieee-p1363' });
  return `${body}.${signature.toString('base64url')}`;
}

const LINE = /^([A-Z][A-Z0-9_]*)=(.*)$/;

/** The value of `NAME=` in env text, without the quotes `.env` files allow. */
function valueIn(text: string, name: string): string | undefined {
  for (const line of text.split('\n')) {
    const match = LINE.exec(line.trimEnd());
    if (match?.[1] !== name) continue;
    const raw = (match[2] ?? '').trim();
    return /^(['"]).*\1$/.test(raw) ? raw.slice(1, -1) : raw;
  }
  return undefined;
}

/**
 * Fills in the local GoTrue's keys where env text lists them empty (`GOTRUE_JWT_SECRET=`), and only
 * there: a line with a value, a commented line and every other line stay as they are. The service
 * key is signed with the text's own signing key, so it is filled only alongside one. Returns the new
 * text and the names it filled.
 */
export function fillLocalSecrets(text: string): { text: string; filled: string[] } {
  const filled: string[] = [];
  let out = text;
  const fill = (name: string, make: () => string) => {
    if (valueIn(out, name) !== '') return;
    const value = make();
    // A JSON value is single-quoted: Compose, Node's --env-file and parseEnv all read it back unchanged
    const written = /^[[{]/.test(value) ? `'${value}'` : value;
    out = out.replace(new RegExp(`^${name}=[ \\t]*$`, 'm'), () => `${name}=${written}`);
    filled.push(name);
  };
  fill('GOTRUE_JWT_SECRET', () => randomBytes(32).toString('hex'));
  fill('GOTRUE_JWT_KEYS', newSigningKeys);
  const keys = valueIn(out, 'GOTRUE_JWT_KEYS');
  if (keys) fill('AUTH_SERVICE_KEY', () => serviceRoleKey(keys));
  return { text: out, filled };
}

/** `docker-compose.yml` of an `--auth gotrue` project: Postgres, the `auth` schema in it, GoTrue and Mailpit. */
export const GOTRUE_DOCKER_COMPOSE = (db: string): string => `# Everything the app needs on this machine. \`pnpm dev\` starts it; \`docker compose down\` stops it.
#   postgres     the app's database, which also holds GoTrue's tables (in the auth schema)
#   auth         GoTrue (Supabase Auth) at ${LOCAL_AUTH_URL}: sign-up, sign-in, magic links. It signs with the
#                keys in .env (GOTRUE_JWT_KEYS, written by mariachi init or mariachi dev)
#   mail         Mailpit: every email GoTrue and the app send lands here. Read it at ${MAILBOX_URL}
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ${db}
    ports: ["5432:5432"]
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres", "-d", "${db}"]
      interval: 2s
      retries: 30

  # Runs once, then exits: GoTrue's own role and the auth schema it keeps its tables in. Safe to run again.
  auth-schema:
    image: postgres:16-alpine
    depends_on:
      postgres: { condition: service_healthy }
    environment:
      PGHOST: postgres
      PGUSER: postgres
      PGPASSWORD: postgres
      PGDATABASE: ${db}
    command:
      - psql
      - -v
      - ON_ERROR_STOP=1
      - -c
      - |
        DO $$$$ BEGIN
          IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
            CREATE ROLE supabase_auth_admin NOINHERIT CREATEROLE LOGIN PASSWORD 'auth';
          END IF;
        END $$$$;
        CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION supabase_auth_admin;
        GRANT CREATE ON DATABASE "${db}" TO supabase_auth_admin;
        ALTER ROLE supabase_auth_admin SET search_path = auth;

  # Applies its migrations at start, then serves. For development only: it trusts this machine.
  auth:
    image: ${GOTRUE_IMAGE}
    depends_on:
      auth-schema: { condition: service_completed_successfully }
      mail: { condition: service_started }
    ports: ["9999:9999"]
    environment:
      GOTRUE_API_HOST: 0.0.0.0
      PORT: "9999"
      API_EXTERNAL_URL: ${LOCAL_AUTH_URL}
      GOTRUE_DB_DRIVER: postgres
      DATABASE_URL: postgres://supabase_auth_admin:auth@postgres:5432/${db}
      # Where its links send people back to: this app's pages (PORT is read from .env)
      GOTRUE_SITE_URL: http://localhost:\${PORT:-3000}/api/sign-in
      GOTRUE_URI_ALLOW_LIST: http://localhost:\${PORT:-3000}/**,http://127.0.0.1:\${PORT:-3000}/**
      # Tokens are ES256, signed with the key in .env; the app checks them against ${LOCAL_AUTH_URL}/.well-known/jwks.json
      GOTRUE_JWT_KEYS: \${GOTRUE_JWT_KEYS:?is not set in .env. Run pnpm dev, which writes the local GoTrue keys}
      GOTRUE_JWT_SECRET: \${GOTRUE_JWT_SECRET:?is not set in .env. Run pnpm dev, which writes the local GoTrue keys}
      GOTRUE_JWT_ISSUER: ${LOCAL_AUTH_URL}
      GOTRUE_JWT_AUD: authenticated
      GOTRUE_JWT_DEFAULT_GROUP_NAME: authenticated
      # Sign-ups confirm their address by email, which goes to Mailpit
      GOTRUE_EXTERNAL_EMAIL_ENABLED: "true"
      GOTRUE_MAILER_AUTOCONFIRM: "false"
      GOTRUE_SMTP_HOST: mail
      GOTRUE_SMTP_PORT: "1025"
      GOTRUE_SMTP_ADMIN_EMAIL: auth@example.com
      GOTRUE_MAILER_URLPATHS_CONFIRMATION: /verify
      GOTRUE_MAILER_URLPATHS_RECOVERY: /verify
      GOTRUE_MAILER_URLPATHS_INVITE: /verify
      GOTRUE_MAILER_URLPATHS_EMAIL_CHANGE: /verify
      # Development limits: an email a second, not one a minute
      GOTRUE_SMTP_MAX_FREQUENCY: 1s
      GOTRUE_RATE_LIMIT_EMAIL_SENT: "1000"
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:9999/health"]
      interval: 2s
      retries: 30

  mail:
    image: ${MAILPIT_IMAGE}
    # 8025: the mailbox in a browser, and its API. 1025: SMTP, for the app's own email (SMTP_URL)
    ports: ["8025:8025", "1025:1025"]
`;
