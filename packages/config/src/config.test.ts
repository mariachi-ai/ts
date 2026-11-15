import { describe, it, expect, beforeEach, vi } from 'vitest';
import { format, inspect } from 'node:util';
import { z } from 'zod';
import { ConfigError } from '@mariachi/core';
import {
  loadConfig,
  useConfig,
  resetConfig,
  registerConfigSection,
  useConfigSection,
  createSecrets,
  createFeatureFlags,
  EnvSecretsAdapter,
  Secrets,
  REDACTED,
  secret,
} from './index';

beforeEach(() => resetConfig());

describe('loadConfig', () => {
  it('merges env and overrides, and useConfig returns the same object', () => {
    const config = loadConfig({ serviceName: 'svc' }, { env: { PORT: '4000', DATABASE_URL: 'postgres://u:p@h:5432/db' } });
    expect(config.server.port).toBe(4000);
    expect(config.serviceName).toBe('svc');
    expect(config.database?.url).toContain('postgres://');
    expect(useConfig()).toBe(config);
  });

  it('reads AI fallbacks and cost table from env', () => {
    const config = loadConfig({}, {
      env: { AI_FALLBACK_MODELS: 'gpt-4o, gpt-4o-mini', AI_COST_TABLE: '{"claude-sonnet-5":{"input":0.003,"output":0.015}}' },
    });
    expect(config.ai?.fallbackModels).toEqual(['gpt-4o', 'gpt-4o-mini']);
    expect(config.ai?.costTable?.['claude-sonnet-5']).toEqual({ input: 0.003, output: 0.015 });
    expect(() => loadConfig({}, { env: { AI_COST_TABLE: '{nope' } })).toThrow(ConfigError);
  });

  it('throws ConfigError with readable issues on invalid input', () => {
    expect(() => loadConfig({}, { env: { DATABASE_URL: 'not a url' } })).toThrow(ConfigError);
    try {
      loadConfig({}, { env: { DATABASE_URL: 'not a url' } });
    } catch (e) {
      expect((e as ConfigError).message).toContain('database.url');
    }
  });

  it('refuses a number, a boolean or an environment name it cannot read, naming the variable', () => {
    const failure = (env: Record<string, string>) => {
      try {
        loadConfig({}, { env });
      } catch (error) {
        return [(error as ConfigError).code, (error as ConfigError).message];
      }
      return 'loaded';
    };
    expect(failure({ PORT: 'eighty' })).toEqual(['config/invalid', 'Invalid configuration: PORT must be a number']);
    expect(failure({ DATABASE_URL: 'postgres://localhost/app', DATABASE_POOL_MAX: '10 connections' })).toEqual(['config/invalid', 'Invalid configuration: DATABASE_POOL_MAX must be a number']);
    expect(failure({ TRUST_PROXY: 'maybe' })).toEqual(['config/invalid', 'Invalid configuration: TRUST_PROXY must be true or false']);
    expect(failure({ NODE_ENV: 'banana' })).toEqual([
      'config/invalid',
      'Invalid configuration: NODE_ENV must be development, test or production (set ENV to one of them if NODE_ENV has to stay as it is)',
    ]);
    expect(failure({ ENV: 'prod' })).toEqual(['config/invalid', 'Invalid configuration: ENV must be development, test or production']);
    // The value is never echoed: a mistyped secret pasted into the wrong variable stays out of logs
    expect(JSON.stringify(failure({ PORT: 'sk_live_not_a_port' }))).not.toContain('sk_live');
  });

  it('reads the usual spellings of a boolean, leaves an empty variable unset, and lets ENV decide over NODE_ENV', () => {
    for (const yes of ['true', 'TRUE', '1', 'yes', 'on']) expect(loadConfig({}, { env: { TRUST_PROXY: yes } }).server.trustProxy, yes).toBe(true);
    for (const no of ['false', '0', 'no', 'Off']) expect(loadConfig({}, { env: { TRUST_PROXY: no } }).server.trustProxy, no).toBe(false);
    expect(loadConfig({}, { env: { PORT: '', TRUST_PROXY: ' ', NODE_ENV: '' } })).toMatchObject({ env: 'development', server: { port: 3000 } });
    expect(loadConfig({}, { env: { PORT: ' 8080 ' } }).server.port).toBe(8080);
    // NODE_ENV=staging is common for tooling; ENV then says which of the three the app runs as
    expect(loadConfig({}, { env: { NODE_ENV: 'staging', ENV: 'production' } }).env).toBe('production');
  });

  it('warns once when nothing says which environment this is, since it then runs as development', async () => {
    vi.resetModules();
    const fresh = await import('./index');
    const warn = vi.spyOn(process, 'emitWarning').mockImplementation(() => undefined);
    try {
      // Told through options or overrides, or reading a test's own env: nothing to warn about
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('ENV', '');
      fresh.loadConfig({}, { dotenv: false });
      vi.stubEnv('NODE_ENV', '');
      fresh.loadConfig({ env: 'production' }, { dotenv: false });
      fresh.loadConfig({}, { env: {} });
      expect(warn).not.toHaveBeenCalled();

      expect(fresh.loadConfig({}, { dotenv: false }).env).toBe('development');
      fresh.loadConfig({}, { dotenv: false });
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0]?.[0]).toMatch(/Neither ENV nor NODE_ENV is set, so this app runs as "development"/);
      expect(warn.mock.calls[0]?.[1]).toEqual({ code: 'MARIACHI_ENV_UNSET' });
    } finally {
      warn.mockRestore();
      vi.unstubAllEnvs();
    }
  });

  it('reads the storage, encryption and logging settings the docs name', () => {
    const config = loadConfig(
      {},
      {
        env: {
          STORAGE_ADAPTER: 'local',
          STORAGE_BASE_PATH: './storage',
          STORAGE_SIGNING_SECRET: 's'.repeat(32),
          STORAGE_PUBLIC_BASE_URL: '/api/storage',
          ENCRYPTION_ADAPTER: 'aws-kms',
          ENCRYPTION_KMS_KEY_ID: 'arn:aws:kms:eu-west-1:1:key/abc',
          ENCRYPTION_KEY_VERSION: '3',
          LOG_PRETTY: 'true',
        },
      },
    );
    expect(config.storage).toMatchObject({ adapter: 'local', basePath: './storage', signingSecret: 's'.repeat(32), publicBaseUrl: '/api/storage' });
    expect(config.encryption).toMatchObject({ adapter: 'aws-kms', kmsKeyId: 'arn:aws:kms:eu-west-1:1:key/abc', keyVersion: 3 });
    expect(config.observability?.logging?.pretty).toBe(true);
    // A signing secret too short to sign anything safely is refused
    expect(() => loadConfig({}, { env: { STORAGE_SIGNING_SECRET: 'short' } })).toThrow(ConfigError);
    expect(() => loadConfig({}, { env: { LOG_PRETTY: 'sometimes' } })).toThrow(/LOG_PRETTY must be true or false/);
  });

  describe('secrets in the loaded config', () => {
    const secrets = {
      DATABASE_URL: 'postgres://app:db-pass-0123456789@db.internal:5432/app',
      REDIS_URL: 'rediss://default:redis-pass-0123456789@cache.internal:6380',
      JWT_SECRET: 'jwt-secret-0123456789-0123456789-0123',
      SESSION_SECRET: 'session-secret-0123456789-0123456789',
      ENCRYPTION_KEY: 'encryption-key-0123456789-0123456789',
      STORAGE_SIGNING_SECRET: 'storage-signing-0123456789-0123456789',
      STRIPE_SECRET_KEY: 'sk_live_stripe_0123456789',
      STRIPE_WEBHOOK_SECRET: 'whsec_stripe_0123456789',
      RESEND_API_KEY: 're_email_key_0123456789',
      SMTP_URL: 'smtps://mailer:smtp-pass-0123456789@smtp.example.com:465',
      TYPESENSE_API_KEY: 'ts_search_key_0123456789',
      OPENAI_API_KEY: 'sk-openai-0123456789',
      ANTHROPIC_API_KEY: 'sk-ant-0123456789',
    };
    // Every value that must never be printed: the keys, and the password inside each URL
    const forbidden = Object.values(secrets).map((v) => (/^[a-z]+:\/\//.test(v) ? new URL(v).password : v));
    const load = () => loadConfig({}, { env: { ...secrets, EMAIL_ADAPTER: 'resend', SEARCH_ADAPTER: 'typesense' } });
    const clean = (text: string) => {
      for (const value of forbidden) expect(text, value).not.toContain(value);
    };

    it('still gives code the real values', () => {
      const config = load();
      expect(config.auth?.jwtSecret).toBe(secrets.JWT_SECRET);
      expect(config.database?.url).toBe(secrets.DATABASE_URL);
      expect(config.billing?.secretKey).toBe(secrets.STRIPE_SECRET_KEY);
      // Every secret given above did reach the config, so the checks below are checking something
      const found = JSON.stringify(Object.fromEntries(Object.entries(config).map(([k, v]) => [k, v && typeof v === 'object' ? { ...v } : v])));
      for (const value of forbidden) expect(found, value).toContain(value);
    });

    it('never shows them when the config, or any part of it, is turned into JSON', () => {
      const config = load();
      const json = JSON.stringify(config);
      clean(json);
      clean(JSON.stringify({ config }));
      clean(JSON.stringify(config.auth));
      clean(JSON.stringify([config.billing, config.email, config.ai, config.search, config.storage, config.encryption]));
      // Shown as redacted, not dropped, and what isn't secret stays readable
      const shown = JSON.parse(json);
      expect(shown.auth).toMatchObject({ jwtSecret: REDACTED, sessionSecret: REDACTED, jwtExpiresIn: '1h' });
      expect(shown.database.url).toBe('postgres://app:***@db.internal:5432/app');
      expect(shown.redis.url).toBe('rediss://default:***@cache.internal:6380');
      expect(shown.email.smtpUrl).toBe('smtps://mailer:***@smtp.example.com:465');
      expect(shown.serviceName).toBe(config.serviceName);
    });

    it('never shows them when it is printed: console.log, util.inspect, a template, an error message', () => {
      const config = load();
      clean(inspect(config, { depth: null }));
      clean(inspect(config.auth));
      clean(inspect({ nested: { deeper: [config.database] } }, { depth: null }));
      clean(format('%o %O %j', config, config.billing, config.ai));
      expect(inspect(config.auth)).toContain(REDACTED);
    });

    it('leaves an unset secret unset, so a missing one can be told from a hidden one', () => {
      const config = loadConfig({}, { env: { STRIPE_SECRET_KEY: 'sk_live_only_this_one' } });
      expect(JSON.parse(JSON.stringify(config)).billing).toEqual({ adapter: 'stripe', secretKey: REDACTED });
    });

    it("hides a package section's own secrets, marked with secret()", () => {
      registerConfigSection('payments', {
        // Optional, because a registered section stays registered for the tests that follow
        schema: z.object({ apiKey: secret(z.string()).optional(), region: z.string().default('eu') }),
        fromEnv: (read) => ({ apiKey: read('PAYMENTS_API_KEY') }),
      });
      const config = loadConfig({}, { env: { PAYMENTS_API_KEY: 'pay_live_0123456789' } });
      expect(useConfigSection<{ apiKey: string }>('payments').apiKey).toBe('pay_live_0123456789');
      expect(JSON.stringify(config)).not.toContain('pay_live_0123456789');
      expect(inspect(useConfigSection('payments'))).toBe(`{ apiKey: '${REDACTED}', region: 'eu' }`);
    });
  });

  it('defaults observability adapters to noop', () => {
    const config = loadConfig({ observability: { tracing: {}, errors: {} } }, { env: {} });
    expect(config.observability?.tracing?.adapter).toBe('noop');
    expect(config.observability?.errors?.adapter).toBe('noop');
  });

  it('validates registered package sections', () => {
    registerConfigSection('widgets', {
      schema: z.object({ size: z.coerce.number().default(3) }),
      fromEnv: (read) => ({ size: read('WIDGET_SIZE') }),
    });
    loadConfig({}, { env: { WIDGET_SIZE: '7' } });
    expect(useConfigSection<{ size: number }>('widgets').size).toBe(7);
  });
});

describe('secrets', () => {
  it('getOrThrow throws ConfigError for missing secrets and never mutates process.env', async () => {
    const secrets = new Secrets(new EnvSecretsAdapter({ API_KEY: 'k', TENANT_ACME_API_KEY: 'tk' }));
    expect(await secrets.getOrThrow('API_KEY')).toBe('k');
    expect(await secrets.getForTenant('API_KEY', 'acme')).toBe('tk');
    await expect(secrets.getOrThrow('MISSING')).rejects.toMatchObject({ code: 'config/missing-secret' });
    await secrets.set('NEW_ONE', 'v');
    expect(process.env.NEW_ONE).toBeUndefined();
    expect(createSecrets()).toBeInstanceOf(Secrets);
  });
});

describe('feature flags', () => {
  it('evaluates tenant overrides, allowlists and rollouts', async () => {
    const flags = createFeatureFlags({
      adapter: 'store',
      cacheTtlMs: 0,
      store: {
        async get(key) {
          if (key === 'beta') return { key, enabled: false, tenantOverrides: { acme: true }, metadata: { users: ['u1'] } };
          if (key === 'half') return { key, enabled: true, metadata: { rolloutPercent: 50 } };
          return null;
        },
      },
    });
    expect(await flags.isEnabled('beta')).toBe(false);
    expect(await flags.isEnabled('beta', { tenantId: 'acme' })).toBe(true);
    expect(await flags.isEnabled('beta', { userId: 'u1' })).toBe(true);
    expect(await flags.isEnabled('missing')).toBe(false);

    const results = await Promise.all(Array.from({ length: 200 }, (_, i) => flags.isEnabled('half', { userId: `u${i}` })));
    const on = results.filter(Boolean).length;
    expect(on).toBeGreaterThan(60);
    expect(on).toBeLessThan(140);
    expect(await flags.isEnabled('half', { userId: 'stable' })).toBe(await flags.isEnabled('half', { userId: 'stable' }));
  });
});
