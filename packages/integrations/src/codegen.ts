/**
 * `@mariachi/integrations/codegen`: writes an integration's `src/generated.ts` from its `contract.json`, and the
 * contract's JSON Schema. Run by `pnpm integrations:generate`, which `--check` fails when a package's generated
 * file doesn't match its contract.
 */
import { zodToJsonSchema } from 'zod-to-json-schema';
import { type Contract, ContractSchema, parseContract } from './contract';

const HEADER = '// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.\n';

/** The TypeScript module for a contract: the provider, its settings, config schema, operations, errors and events. */
export function generateModule(input: unknown): string {
  const c: Contract = parseContract(input);
  const pascal = pascalCase(c.provider.id);
  const lines: string[] = [HEADER, "import type { SettingDescriptor } from '@mariachi/integrations';", "import { z } from 'zod';", ''];

  lines.push(`/** ${c.provider.name}: who the integration calls. \`id\` and \`category\` name its spans. */`);
  lines.push(`export const provider = ${literal({ id: c.provider.id, name: c.provider.name, category: c.provider.category, server: c.provider.server, ...(c.provider.baseUrl ? { baseUrl: c.provider.baseUrl } : {}), docs: c.provider.docs })} as const;`, '');

  lines.push('/** What the app sets to connect it, with where to find each value and its checks per environment. */');
  lines.push(`export const settings: readonly SettingDescriptor[] = ${literal(c.settings)};`, '');

  lines.push(`/** The config \`create${pascal}\` takes, keyed by each setting's \`key\`. */`);
  lines.push('export const configSchema = z.object({');
  for (const s of c.settings) lines.push(`  ${s.key}: z.string().min(1)${s.required ? '' : '.optional()'},`);
  lines.push('});');
  lines.push(`export type ${pascal}Config = z.infer<typeof configSchema>;`, '');

  lines.push(`/** How each setting's value is read from the environment: \`settingsFromEnv(settings, readEnv)\`. */`);
  lines.push(`export const envNames = ${literal(Object.fromEntries(c.settings.map((s) => [s.key, s.env])))} as const;`, '');

  lines.push(`export const credentials = ${literal(c.credentials)} as const;`, '');

  lines.push('/** The operations, by name: the span name is `<provider> <operation>`. */');
  lines.push(`export const operations = ${literal(Object.fromEntries(c.operations.map((o) => [o.name, { purpose: o.purpose, ...(o.method ? { method: o.method } : {}), ...(o.path ? { path: o.path } : {}), idempotency: o.idempotency }])))} as const;`);
  lines.push(`export type ${pascal}Operation = keyof typeof operations;`, '');

  lines.push("/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */");
  lines.push(`export const errorMap: Readonly<Record<string, { category: ${categoryUnion()}; reason: string }>> = ${literal(Object.fromEntries(c.errors.map((e) => [e.providerCode, { category: e.category, reason: e.reason }])))};`, '');

  if (c.webhooks) {
    lines.push('/** How its webhooks are signed, and the events it sends. */');
    lines.push(`export const webhookSignature = ${literal(c.webhooks.signature)} as const;`);
    lines.push(`export const webhookEvents = ${literal(c.webhooks.events.map((e) => e.type))} as const;`);
    lines.push(`export type ${pascal}WebhookEvent = (typeof webhookEvents)[number];`, '');
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

/** The contract's JSON Schema, for `$schema` in every `contract.json` and for implementations in other languages. */
export function contractJsonSchema(): Record<string, unknown> {
  const schema = zodToJsonSchema(ContractSchema, { name: 'IntegrationContract', $refStrategy: 'none' }) as Record<string, unknown>;
  return { $id: '@mariachi/integrations/contract.schema.json', title: 'Mariachi integration contract', ...schema };
}

function categoryUnion(): string {
  return "'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'";
}

function pascalCase(id: string): string {
  return id
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

/** A value as TypeScript source, keys unquoted where they can be, two-space indented. */
function literal(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent + 1);
  const end = '  '.repeat(indent);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    if (value.every((v) => typeof v !== 'object' || v === null)) return `[${value.map((v) => literal(v)).join(', ')}]`;
    return `[\n${value.map((v) => `${pad}${literal(v, indent + 1)},`).join('\n')}\n${end}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return '{}';
    return `{\n${entries.map(([k, v]) => `${pad}${/^[A-Za-z_$][\w$]*$/.test(k) ? k : quote(k)}: ${literal(v, indent + 1)},`).join('\n')}\n${end}}`;
  }
  return typeof value === 'string' ? quote(value) : JSON.stringify(value);
}

/** A string in single quotes, or double quotes when it has a single quote in it (as Biome writes them). */
function quote(value: string): string {
  return value.includes("'") ? JSON.stringify(value) : `'${value.replace(/\\/g, '\\\\')}'`;
}
