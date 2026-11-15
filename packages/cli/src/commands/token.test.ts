import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { JWTAdapter } from '@mariachi/auth';
import { Command } from 'commander';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerTokenCommand, signDevToken, type TokenOptions } from './token';

const SECRET = 'token-test-secret-at-least-32-characters';
const defaults: TokenOptions = { user: 'dev-user', tenant: 'dev-tenant', role: [], scope: [], expires: '1h' };

describe('signDevToken', () => {
  it("signs what the project's JWT adapter verifies: a user in a tenant, for an hour", async () => {
    const token = await signDevToken({ JWT_SECRET: SECRET }, defaults);
    const identity = await new JWTAdapter({ secret: SECRET }).verify(token);
    expect(identity).toMatchObject({ userId: 'dev-user', tenantId: 'dev-tenant', scopes: [], identityType: 'session' });
    const { exp, iat } = identity.claims as { exp: number; iat: number };
    expect(exp - iat).toBe(3600);
  });

  it('carries roles, scopes and an email address marked verified', async () => {
    const token = await signDevToken({ JWT_SECRET: SECRET }, { ...defaults, user: 'ada', tenant: 'acme', email: 'ada@example.com', role: ['admin'], scope: ['notes:read'], expires: '15m' });
    const identity = await new JWTAdapter({ secret: SECRET }).verify(token);
    expect(identity).toMatchObject({ userId: 'ada', tenantId: 'acme', roles: ['admin'], scopes: ['notes:read'] });
    expect(identity.claims).toMatchObject({ email: 'ada@example.com', email_verified: true });
  });

  it('names no tenant when told to: a user in no organization', async () => {
    const token = await signDevToken({ JWT_SECRET: SECRET }, { ...defaults, tenant: false });
    // The default adapter refuses it, as an app with no organizations does
    await expect(new JWTAdapter({ secret: SECRET }).verify(token)).rejects.toMatchObject({ code: 'auth/invalid-token' });
    expect(await new JWTAdapter({ secret: SECRET, requireTenant: false }).verify(token)).toMatchObject({ userId: 'dev-user', tenantId: '' });
  });

  it("uses the project's issuer and audience, so the app's own checks pass", async () => {
    const env = { JWT_SECRET: SECRET, JWT_ISSUER: 'https://app.example.com', JWT_AUDIENCE: 'api' };
    const token = await signDevToken(env, defaults);
    expect(await new JWTAdapter({ secret: SECRET, issuer: env.JWT_ISSUER, audience: env.JWT_AUDIENCE }).verify(token)).toMatchObject({ userId: 'dev-user' });
    await expect(new JWTAdapter({ secret: SECRET, issuer: 'https://other.example.com' }).verify(token)).rejects.toMatchObject({ code: 'auth/invalid-token' });
  });

  it('does nothing in production, and says what is missing without a secret', async () => {
    await expect(signDevToken({ JWT_SECRET: SECRET, NODE_ENV: 'production' }, defaults)).rejects.toMatchObject({ code: 'cli/token-in-production' });
    await expect(signDevToken({}, defaults)).rejects.toMatchObject({ code: 'cli/jwt-secret-missing' });
  });
});

describe('mariachi token', () => {
  let dir: string;
  let out: string[];
  let err: string[];

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'mariachi-token-'));
    await writeFile(join(dir, 'package.json'), '{"name":"app"}');
    await writeFile(join(dir, '.env'), `JWT_SECRET=${SECRET}\n`);
    out = [];
    err = [];
    vi.spyOn(console, 'log').mockImplementation((line: string) => void out.push(line));
    vi.spyOn(console, 'error').mockImplementation((line: string) => void err.push(line));
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    await rm(dir, { recursive: true, force: true });
  });

  async function token(...args: string[]) {
    const program = new Command().exitOverride();
    registerTokenCommand(program);
    await program.parseAsync(['node', 'mariachi', 'token', dir, ...args]);
  }

  it("prints the token alone on stdout, signed with the secret in the project's .env", async () => {
    // Whatever this machine's environment holds must not stand in for the project's file
    vi.stubEnv('JWT_SECRET', undefined as unknown as string);
    vi.stubEnv('NODE_ENV', 'development');
    await token();
    expect(out).toHaveLength(1);
    expect(await new JWTAdapter({ secret: SECRET }).verify(out[0] as string)).toMatchObject({ userId: 'dev-user', tenantId: 'dev-tenant' });
    expect(err).toEqual(['dev-user in dev-tenant: good for 1h']);
  });

  it('takes who the token is for from the flags', async () => {
    vi.stubEnv('JWT_SECRET', undefined as unknown as string);
    vi.stubEnv('NODE_ENV', 'development');
    await token('--user', 'ada', '--no-tenant', '--email', 'ada@example.com', '--role', 'owner', '--role', 'billing', '--expires', '7d');
    const identity = await new JWTAdapter({ secret: SECRET, requireTenant: false }).verify(out[0] as string);
    expect(identity).toMatchObject({ userId: 'ada', tenantId: '', roles: ['owner', 'billing'], claims: { email: 'ada@example.com', email_verified: true } });
    expect(err).toEqual(['ada, no tenant, ada@example.com: good for 7d']);
  });
});
