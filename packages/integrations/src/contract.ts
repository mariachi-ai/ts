import { ConfigError } from '@mariachi/core';
import { z } from 'zod';
import { ERROR_CATEGORIES, type ErrorCategory } from './provider-error';

/**
 * The integration contract: everything an implementation of a provider needs, in any language, as data
 * (`contract.json` in each `@mariachi/integration-<provider>` package). The TypeScript in `src/generated.ts` is
 * written from it, and `pnpm integrations:generate --check` fails when the two disagree. The format is
 * documented in docs/integration-contracts.md.
 */

const Id = z.string().regex(/^[a-z][a-z0-9-]*$/, 'lowercase letters, digits and dashes');
const Camel = z.string().regex(/^[a-z][A-Za-z0-9]*$/, 'camelCase');
const EnvName = z.string().regex(/^[A-Z][A-Z0-9_]*$/, 'UPPER_SNAKE_CASE');
const Operation = z.string().regex(/^[a-z][A-Za-z0-9]*(\.[a-z][A-Za-z0-9]*)+$/, 'resource.action, such as contacts.create');

/** Declarative checks on a setting's value in one environment. Never code: a host in any language applies them. */
export const EnvironmentCheck = z
  .object({
    /** The value must start with one of these. */
    startsWith: z.array(z.string().min(1)).min(1).optional(),
    /** The value must not start with any of these: a live key in the test environment. */
    notStartsWith: z.array(z.string().min(1)).min(1).optional(),
    /** Why, in a sentence a person reads when the check fails. */
    because: z.string().min(1).optional(),
  })
  .strict();

export const SettingSchema = z
  .object({
    /** The key in the integration's config object: `accessToken`. */
    key: Camel,
    /** The environment variable an app reads it from: `HUBSPOT_ACCESS_TOKEN`. */
    env: EnvName,
    /** A label for the form that connects the provider: "Access token". */
    label: z.string().min(1),
    /** What it is, in a sentence. */
    meaning: z.string().min(1),
    secret: z.boolean(),
    required: z.boolean(),
    /** Where in the provider's dashboard it is: "Settings › Integrations › Private apps". */
    whereToFind: z.string().min(1),
    url: z.string().url().optional(),
    /** Safe in a browser: a publishable key, a client id. Never true for a secret. */
    public: z.boolean().optional(),
    environments: z.object({ test: EnvironmentCheck.optional(), production: EnvironmentCheck.optional() }).strict().optional(),
  })
  .strict()
  .refine((s) => !(s.secret && s.public), { message: 'a secret setting is never public' });

const OAuth = z
  .object({
    authorizeUrl: z.string().url(),
    tokenUrl: z.string().url(),
    scopes: z.array(z.string().min(1)).min(1),
    pkce: z.boolean().optional(),
    /** Whether the provider hands out refresh tokens. */
    refresh: z.boolean(),
  })
  .strict();

export const CredentialsSchema = z.discriminatedUnion('kind', [
  /** One set for the whole app: the settings. */
  z.object({ kind: z.literal('app') }).strict(),
  /** Each end user connects their own account. */
  z.object({ kind: z.literal('user'), oauth: OAuth }).strict(),
  /** Either: the app's own account through its settings, or its users' through OAuth. */
  z.object({ kind: z.literal('app-or-user'), oauth: OAuth }).strict(),
]);

export const OperationSchema = z
  .object({
    name: Operation,
    /** What it does, in a sentence. */
    purpose: z.string().min(1),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional(),
    /** The path template under the provider's base URL: `/crm/v3/objects/contacts/{contactId}`. */
    path: z.string().startsWith('/').optional(),
    /** How a retried call stays done once: a header the provider takes, safe by nature, or not at all. */
    idempotency: z.union([z.object({ header: z.string().min(1) }).strict(), z.literal('natural'), z.literal('none')]),
  })
  .strict();

export const ErrorMappingSchema = z
  .object({
    /** The provider's code for it, as its error body says: `card_declined`, `RATE_LIMIT`. */
    providerCode: z.string().min(1),
    category: z.enum(ERROR_CATEGORIES),
    /** The kebab-case end of the integration's code: `card-declined` makes `stripe/card-declined`. */
    reason: Id,
  })
  .strict();

export const WebhooksSchema = z
  .object({
    signature: z
      .object({
        scheme: z.enum(['standard-webhooks', 'hmac-sha256-hex', 'hmac-sha256-base64', 'hmac-sha256-timestamped', 'jwt', 'rsa-sha256-certificate', 'basic-auth', 'shared-secret', 'none']),
        /** The header the signature arrives in. */
        header: z.string().min(1).optional(),
        /** The setting that holds the secret: its `key`. */
        secretSetting: Camel.optional(),
        /** How the signed string is made and compared, exactly enough to implement it. */
        description: z.string().min(1),
      })
      .strict(),
    events: z.array(z.object({ type: z.string().min(1), meaning: z.string().min(1) }).strict()).min(1),
  })
  .strict();

export const ContractSchema = z
  .object({
    $schema: z.string().optional(),
    provider: z
      .object({
        id: Id,
        name: z.string().min(1),
        /** What kind of provider: `crm`, `payments`, `email`. The span's `mariachi.integration.category`. */
        category: Id,
        /** The host the operations call: `server.address` on their spans. */
        server: z.string().min(1),
        baseUrl: z.string().url().optional(),
        docs: z.string().url(),
      })
      .strict(),
    settings: z.array(SettingSchema).min(1),
    credentials: CredentialsSchema,
    operations: z.array(OperationSchema).min(1),
    errors: z.array(ErrorMappingSchema),
    webhooks: WebhooksSchema.optional(),
  })
  .strict()
  .superRefine((c, issue) => {
    const keys = new Set<string>();
    for (const s of c.settings) {
      if (keys.has(s.key)) issue.addIssue({ code: 'custom', message: `setting "${s.key}" is listed twice`, path: ['settings'] });
      keys.add(s.key);
    }
    const ops = new Set<string>();
    for (const o of c.operations) {
      if (ops.has(o.name)) issue.addIssue({ code: 'custom', message: `operation "${o.name}" is listed twice`, path: ['operations'] });
      ops.add(o.name);
    }
    const secret = c.webhooks?.signature.secretSetting;
    if (secret && !keys.has(secret)) issue.addIssue({ code: 'custom', message: `webhooks.signature.secretSetting "${secret}" isn't a setting`, path: ['webhooks'] });
  });

export type Contract = z.infer<typeof ContractSchema>;
export type ContractSetting = z.infer<typeof SettingSchema>;
export type ContractOperation = z.infer<typeof OperationSchema>;
export type ContractEnvironment = 'test' | 'production';

/** Reads a contract, failing with every problem it has. */
export function parseContract(json: unknown): Contract {
  const parsed = ContractSchema.safeParse(json);
  if (!parsed.success) {
    throw new ConfigError('integrations/invalid-contract', `The contract is invalid: ${parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')}`);
  }
  return parsed.data;
}

/** A setting as a host shows it: everything a form needs to connect the provider. */
export type SettingDescriptor = Readonly<ContractSetting>;

/**
 * Whether a value is right for a setting in an environment, by the contract's checks. Returns why not, in a
 * sentence, or `null`. A host runs it before saving a value, so a live key never reaches the test environment.
 */
export function checkSetting(setting: SettingDescriptor, environment: ContractEnvironment, value: string): string | null {
  const check = setting.environments?.[environment];
  if (!value.trim()) return `${setting.label} is empty`;
  if (!check) return null;
  if (check.notStartsWith?.some((p) => value.startsWith(p))) return check.because ?? `${setting.label} is for the other environment`;
  if (check.startsWith && !check.startsWith.some((p) => value.startsWith(p))) return check.because ?? `${setting.label} should start with ${check.startsWith.join(' or ')}`;
  return null;
}

/**
 * An integration's config from the environment, by its settings' `env` names. Pass `readEnv` from
 * `@mariachi/config`: only that package reads the environment. A required setting that's missing fails with
 * `integrations/missing-setting`, naming the variable.
 */
export function settingsFromEnv<T extends Record<string, string | undefined>>(settings: readonly SettingDescriptor[], read: (name: string) => string | undefined): T {
  const out: Record<string, string | undefined> = {};
  const missing: string[] = [];
  for (const s of settings) {
    const value = read(s.env);
    if (value === undefined || value === '') {
      if (s.required) missing.push(s.env);
      continue;
    }
    out[s.key] = value;
  }
  if (missing.length) throw new ConfigError('integrations/missing-setting', `Missing ${missing.join(', ')}`, { missing });
  return out as T;
}

/** The error mapping for a provider code, from the contract's `errors`. */
export function mappedFailure(errors: Readonly<Record<string, { category: ErrorCategory; reason: string }>>, providerCode: string | undefined) {
  return providerCode ? errors[providerCode] : undefined;
}
