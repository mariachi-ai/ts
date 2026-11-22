// Test-only: checks bodies against the protocol documents in `packages/jobs/protocol`. Not exported
// from the package; its dependencies (ajv, yaml) are dev dependencies.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020';
import { parse } from 'yaml';

const dir = fileURLToPath(new URL('../../../protocol/', import.meta.url));

export const appApi = parse(readFileSync(`${dir}app-api.openapi.yaml`, 'utf8')) as Record<string, any>;
export const runCall = parse(readFileSync(`${dir}webhook.openapi.yaml`, 'utf8')) as Record<string, any>;

const ajv = new Ajv2020({ strict: false, validateFormats: false, allErrors: true });
ajv.addKeyword({
  keyword: 'x-max-json-bytes',
  validate: (max: number, data: unknown) => Buffer.byteLength(JSON.stringify(data ?? null)) <= max,
});
ajv.addKeyword({
  keyword: 'x-unique-by',
  validate: (property: string, data: unknown) => {
    if (!Array.isArray(data)) return true;
    const seen = data.map((item) => (item as Record<string, unknown>)?.[property]);
    return new Set(seen).size === seen.length;
  },
});
ajv.addSchema({ ...appApi, $id: 'app-api' });
ajv.addSchema({ ...runCall, $id: 'run-call' });

/** Throws, naming what's wrong, unless `value` matches `components/schemas/<name>` of the document. */
export function expectSchema(document: 'app-api' | 'run-call', name: string, value: unknown): void {
  const validate = ajv.getSchema(`${document}#/components/schemas/${name}`);
  if (!validate) throw new Error(`No schema ${name} in ${document}`);
  if (!validate(value)) throw new Error(`${name} doesn't match ${document}: ${ajv.errorsText(validate.errors)}`);
}

/** The schema name a request to the queue's API must match. */
export function requestSchemaFor(method: string, path: string): string | undefined {
  if (method === 'PUT' && path.endsWith('/definitions')) return 'DefinitionsRequest';
  if (method === 'POST' && path.endsWith('/runs')) return 'EnqueueRequest';
  return undefined;
}

export interface RunVector {
  secrets: string[];
  timestamp: number;
  runId: string;
  attempt: string;
  body: string;
  signatures: string[];
  refused: Array<{ summary: string; runId: string; attempt: string; header: string; passing: string }>;
}

export const runVectors = runCall.webhooks.run.post['x-test-vectors'] as RunVector[];
