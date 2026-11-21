import { describe, expect, it } from 'vitest';
import { contractJsonSchema, generateModule } from './codegen';
import { checkSetting, parseContract, settingsFromEnv } from './contract';

const contract = {
  provider: { id: 'acme-crm', name: 'Acme CRM', category: 'crm', server: 'api.acme.test', baseUrl: 'https://api.acme.test/v1', docs: 'https://docs.acme.test' },
  settings: [
    {
      key: 'apiKey',
      env: 'ACME_API_KEY',
      label: 'API key',
      meaning: "The account's secret API key.",
      secret: true,
      required: true,
      whereToFind: 'Settings › API keys',
      url: 'https://app.acme.test/settings/api',
      environments: { test: { notStartsWith: ['live_'], because: "That's a live key: the test environment takes test keys" }, production: { startsWith: ['live_'] } },
    },
    { key: 'webhookSecret', env: 'ACME_WEBHOOK_SECRET', label: 'Webhook secret', meaning: 'Checks the webhooks.', secret: true, required: false, whereToFind: 'Settings › Webhooks' },
  ],
  credentials: { kind: 'app' },
  operations: [
    { name: 'contacts.create', purpose: 'Adds a contact.', method: 'POST', path: '/contacts', idempotency: { header: 'Idempotency-Key' } },
    { name: 'contacts.get', purpose: 'Reads one contact.', method: 'GET', path: '/contacts/{contactId}', idempotency: 'natural' },
  ],
  errors: [{ providerCode: 'RATE_LIMIT', category: 'rate-limited', reason: 'rate-limited' }, { providerCode: "it's_taken", category: 'conflict', reason: 'contact-exists' }],
  webhooks: {
    signature: { scheme: 'hmac-sha256-hex', header: 'x-acme-signature', secretSetting: 'webhookSecret', description: 'HMAC-SHA256 of the raw body, hex.' },
    events: [{ type: 'contact.created', meaning: 'A contact was added.' }],
  },
};

describe('the contract', () => {
  it('reads a valid contract, and refuses a bad one with every problem', () => {
    expect(parseContract(contract).provider.id).toBe('acme-crm');
    const bad = { ...contract, settings: [...contract.settings, contract.settings[0]], operations: [{ ...contract.operations[0], name: 'Create' }] };
    expect(() => parseContract(bad)).toThrow(/listed twice[\s\S]*resource\.action|resource\.action[\s\S]*listed twice/);
    expect(() => parseContract({ ...contract, webhooks: { ...contract.webhooks, signature: { ...contract.webhooks.signature, secretSetting: 'nope' } } })).toThrow(/isn't a setting/);
    expect(() => parseContract({ ...contract, settings: [{ ...contract.settings[0], public: true }] })).toThrow(/never public/);
  });

  it("checks a setting's value per environment", () => {
    const [key] = parseContract(contract).settings;
    expect(checkSetting(key!, 'test', 'live_abc')).toBe("That's a live key: the test environment takes test keys");
    expect(checkSetting(key!, 'test', 'test_abc')).toBeNull();
    expect(checkSetting(key!, 'production', 'test_abc')).toMatch(/should start with live_/);
    expect(checkSetting(key!, 'production', ' ')).toMatch(/empty/);
  });

  it('reads the config from the environment by each setting’s name, naming what’s missing', () => {
    const { settings } = parseContract(contract);
    expect(settingsFromEnv(settings, (n) => ({ ACME_API_KEY: 'k' })[n])).toEqual({ apiKey: 'k' });
    expect(() => settingsFromEnv(settings, () => undefined)).toThrow('Missing ACME_API_KEY');
  });
});

describe('the generator', () => {
  it('writes the provider, settings, config schema, operations, errors and events', () => {
    const out = generateModule(contract);
    expect(out.startsWith('// Generated from contract.json')).toBe(true);
    expect(out).toContain("export const provider = {\n  id: 'acme-crm',");
    expect(out).toContain('  apiKey: z.string().min(1),\n  webhookSecret: z.string().min(1).optional(),');
    expect(out).toContain('export type AcmeCrmConfig = z.infer<typeof configSchema>;');
    expect(out).toContain("  'contacts.create': {");
    expect(out).toContain('export type AcmeCrmOperation = keyof typeof operations;');
    expect(out).toContain("  \"it's_taken\": {\n    category: 'conflict',\n    reason: 'contact-exists',");
    expect(out).toContain("export const webhookEvents = ['contact.created'] as const;");
    expect(generateModule(contract)).toBe(out);
  });

  it('publishes a JSON Schema for the contract', () => {
    const schema = contractJsonSchema() as { $id: string; definitions: Record<string, { required: string[] }> };
    expect(schema.$id).toBe('@mariachi/integrations/contract.schema.json');
    expect(schema.definitions.IntegrationContract!.required).toEqual(expect.arrayContaining(['provider', 'settings', 'credentials', 'operations', 'errors']));
  });
});
