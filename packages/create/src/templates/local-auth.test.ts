import { createPublicKey, verify } from 'node:crypto';
import { parseEnv } from 'node:util';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { fillLocalSecrets, GOTRUE_IMAGE, LOCAL_AUTH_URL, MAILPIT_IMAGE, newSigningKeys, serviceRoleKey } from './local-auth';
import { projectFiles } from './project';

interface Service {
  image?: string;
  ports?: string[];
  environment?: Record<string, string>;
  command?: string[];
  depends_on?: Record<string, { condition: string }>;
  healthcheck?: { test: string[] };
}

const files = projectFiles('acme-app', '^0.1.0', 'gotrue');
const orgs = projectFiles('acme-app', '^0.1.0', 'gotrue', { organizations: true });
const compose = parseYaml(files['docker-compose.yml'] as string) as { services: Record<string, Service> };
const auth = compose.services.auth as Service;

/** A token's header and payload, and whether its ES256 signature checks out with the public half of `keys`. */
function decode(token: string, keys: string) {
  const [header, payload, signature] = token.split('.') as [string, string, string];
  const jwk = JSON.parse(keys)[0];
  const publicKey = createPublicKey({ key: { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y }, format: 'jwk' });
  return {
    header: JSON.parse(Buffer.from(header, 'base64url').toString()),
    payload: JSON.parse(Buffer.from(payload, 'base64url').toString()),
    valid: verify('sha256', Buffer.from(`${header}.${payload}`), { key: publicKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(signature, 'base64url')),
  };
}

describe("the --auth gotrue project's Compose file", () => {
  it('runs GoTrue and Mailpit at exact versions, beside Postgres', () => {
    expect(GOTRUE_IMAGE).toMatch(/^supabase\/auth:v\d+\.\d+\.\d+$/);
    expect(MAILPIT_IMAGE).toMatch(/^axllent\/mailpit:v\d+\.\d+\.\d+$/);
    expect(auth.image).toBe(GOTRUE_IMAGE);
    expect(compose.services.mail?.image).toBe(MAILPIT_IMAGE);
    expect(auth.ports).toEqual(['9999:9999']);
    expect(compose.services.mail?.ports).toEqual(['8025:8025', '1025:1025']);
  });

  it("gives GoTrue an auth schema and a role of its own in the app's database, before it starts", () => {
    const schema = compose.services['auth-schema'] as Service;
    const sql = schema.command?.at(-1) ?? '';
    expect(sql).toContain('CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION supabase_auth_admin;');
    expect(sql).toContain('IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = \'supabase_auth_admin\')');
    // Compose reads $$ as one $
    expect(sql).toContain('DO $$$$ BEGIN');
    expect(sql).toContain('GRANT CREATE ON DATABASE "acme_app" TO supabase_auth_admin;');
    expect(schema.environment?.PGDATABASE).toBe('acme_app');
    expect(schema.depends_on).toEqual({ postgres: { condition: 'service_healthy' } });
    expect(auth.depends_on?.['auth-schema']).toEqual({ condition: 'service_completed_successfully' });
    expect(auth.environment?.DATABASE_URL).toBe('postgres://supabase_auth_admin:auth@postgres:5432/acme_app');
    expect(compose.services.postgres?.healthcheck?.test).toEqual(['CMD', 'pg_isready', '-U', 'postgres', '-d', 'acme_app']);
  });

  it('issues the tokens the app checks: ES256 from the keys in .env, with the issuer AUTH_URL names', () => {
    const env = auth.environment ?? {};
    expect(env.GOTRUE_JWT_ISSUER).toBe(LOCAL_AUTH_URL);
    expect(env.API_EXTERNAL_URL).toBe(LOCAL_AUTH_URL);
    expect(files['.env.example']).toContain(`\nAUTH_URL=${LOCAL_AUTH_URL}\n`);
    // Read from .env, never written here
    expect(env.GOTRUE_JWT_KEYS).toMatch(/^\$\{GOTRUE_JWT_KEYS:\?.+\}$/);
    expect(env.GOTRUE_JWT_SECRET).toMatch(/^\$\{GOTRUE_JWT_SECRET:\?.+\}$/);
    expect(env.GOTRUE_JWT_AUD).toBe('authenticated');
    expect(env.GOTRUE_JWT_DEFAULT_GROUP_NAME).toBe('authenticated');
  });

  it("sends GoTrue's email to the mailbox, confirms sign-ups by email, and lets links back to this app's pages only", () => {
    const env = auth.environment ?? {};
    expect(env.GOTRUE_SMTP_HOST).toBe('mail');
    expect(env.GOTRUE_SMTP_PORT).toBe('1025');
    expect(env.GOTRUE_MAILER_AUTOCONFIRM).toBe('false');
    expect(env.GOTRUE_SITE_URL).toBe('http://localhost:${PORT:-3000}/api/sign-in');
    expect(env.GOTRUE_URI_ALLOW_LIST).toBe('http://localhost:${PORT:-3000}/**,http://127.0.0.1:${PORT:-3000}/**');
  });
});

describe("the local GoTrue's keys", () => {
  it('are listed empty in .env.example, and made for the project in .env, which is otherwise the same', () => {
    const example = files['.env.example'] as string;
    expect(example).toMatch(/^GOTRUE_JWT_SECRET=$/m);
    expect(example).toMatch(/^GOTRUE_JWT_KEYS=$/m);
    const env = parseEnv(files['.env'] as string);
    expect(env.GOTRUE_JWT_SECRET).toMatch(/^[0-9a-f]{64}$/);
    const keys = JSON.parse(env.GOTRUE_JWT_KEYS as string);
    expect(keys).toEqual([expect.objectContaining({ kty: 'EC', crv: 'P-256', alg: 'ES256', use: 'sig', key_ops: ['sign', 'verify'], d: expect.any(String), kid: expect.any(String) })]);
    const strip = (text: string) => text.replace(/^(GOTRUE_JWT_SECRET|GOTRUE_JWT_KEYS)=.*$/gm, '$1=');
    expect(strip(files['.env'] as string)).toBe(example);
    // .gitignore keeps them out of git
    expect(files['.gitignore']).toMatch(/^\.env$/m);
  });

  it('are new for every project', () => {
    const again = projectFiles('acme-app', '^0.1.0', 'gotrue');
    expect(parseEnv(again['.env'] as string).GOTRUE_JWT_KEYS).not.toBe(parseEnv(files['.env'] as string).GOTRUE_JWT_KEYS);
    expect(parseEnv(again['.env'] as string).GOTRUE_JWT_SECRET).not.toBe(parseEnv(files['.env'] as string).GOTRUE_JWT_SECRET);
  });

  it('include, with --orgs, a service-role key signed with the signing key', () => {
    const env = parseEnv(orgs['.env'] as string);
    const key = decode(env.AUTH_SERVICE_KEY as string, env.GOTRUE_JWT_KEYS as string);
    expect(key.valid).toBe(true);
    expect(key.header).toEqual({ alg: 'ES256', typ: 'JWT', kid: JSON.parse(env.GOTRUE_JWT_KEYS as string)[0].kid });
    expect(key.payload).toMatchObject({ role: 'service_role' });
    expect(key.payload.exp).toBeGreaterThan(Date.now() / 1000 + 365 * 24 * 3600);
  });
});

describe('fillLocalSecrets', () => {
  it('fills only the empty lines, and keeps every other line as it is', () => {
    const text = '# GOTRUE_JWT_SECRET=\nGOTRUE_JWT_SECRET=\nGOTRUE_JWT_KEYS=\nAUTH_SERVICE_KEY=\nOTHER=\n';
    const { text: filled, filled: names } = fillLocalSecrets(text);
    expect(names).toEqual(['GOTRUE_JWT_SECRET', 'GOTRUE_JWT_KEYS', 'AUTH_SERVICE_KEY']);
    const lines = filled.split('\n');
    expect(lines[0]).toBe('# GOTRUE_JWT_SECRET=');
    expect(lines[2]).toMatch(/^GOTRUE_JWT_KEYS='\[\{.*\}\]'$/);
    expect(lines[4]).toBe('OTHER=');
    expect(fillLocalSecrets(filled)).toEqual({ text: filled, filled: [] });
  });

  it('signs a missing service key with the signing key already there', () => {
    const keys = newSigningKeys();
    const { text } = fillLocalSecrets(`GOTRUE_JWT_KEYS='${keys}'\nAUTH_SERVICE_KEY=\n`);
    expect(decode(parseEnv(text).AUTH_SERVICE_KEY as string, keys).valid).toBe(true);
    expect(text.startsWith(`GOTRUE_JWT_KEYS='${keys}'\n`)).toBe(true);
  });

  it('adds nothing a file does not list', () => {
    expect(fillLocalSecrets('PORT=3000\n')).toEqual({ text: 'PORT=3000\n', filled: [] });
    // A project that uses a hosted GoTrue and kept its own service key
    expect(fillLocalSecrets('AUTH_SERVICE_KEY=hosted-key\n').filled).toEqual([]);
  });

  it("says so when the signing key isn't one", () => {
    expect(() => serviceRoleKey('not json')).toThrow(expect.objectContaining({ code: 'create/invalid-signing-key' }));
    expect(() => fillLocalSecrets("GOTRUE_JWT_KEYS='[]'\nAUTH_SERVICE_KEY=\n")).toThrow(expect.objectContaining({ code: 'create/invalid-signing-key' }));
  });
});
