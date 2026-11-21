#!/usr/bin/env node
// Writes src/generated.ts from contract.json in every package that has one (each integration-*, and port adapters), and the contract's JSON Schema
// (packages/integrations/contract.schema.json). `--check` writes nothing and fails when a file is out of date.
// Needs `@mariachi/integrations` built (pnpm build).
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const codegen = join(root, 'packages/integrations/dist/codegen.js');
if (!existsSync(codegen)) {
  console.error('Build @mariachi/integrations first: pnpm build --filter @mariachi/integrations');
  process.exit(1);
}
const { generateModule, contractJsonSchema } = await import(codegen);

const outputs = [[join(root, 'packages/integrations/contract.schema.json'), `${JSON.stringify(contractJsonSchema(), null, 2)}\n`]];
// Every integration-* package has a contract; a port's adapter package (auth-auth0, billing-paddle) has one too
for (const dir of readdirSync(join(root, 'packages')).sort()) {
  const contract = join(root, 'packages', dir, 'contract.json');
  if (!existsSync(contract)) {
    if (!dir.startsWith('integration-')) continue;
    console.error(`packages/${dir} has no contract.json`);
    process.exit(1);
  }
  try {
    outputs.push([join(root, 'packages', dir, 'src/generated.ts'), generateModule(JSON.parse(readFileSync(contract, 'utf8')))]);
  } catch (error) {
    console.error(`packages/${dir}/contract.json: ${error.message}`);
    process.exit(1);
  }
}

let stale = 0;
for (const [file, content] of outputs) {
  const current = existsSync(file) ? readFileSync(file, 'utf8') : null;
  if (current === content) continue;
  const rel = file.slice(root.length + 1);
  if (check) {
    console.error(`${rel} is out of date: run pnpm integrations:generate`);
    stale += 1;
  } else {
    writeFileSync(file, content);
    console.log(`wrote ${rel}`);
  }
}
if (stale) process.exit(1);
console.log(check ? `Integrations are up to date (${outputs.length - 1} contracts).` : 'Integrations generated.');
