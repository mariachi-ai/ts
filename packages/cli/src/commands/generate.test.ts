import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Command } from 'commander';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createProject } from '@mariachi/create';
import { registerGenerateCommand } from './generate';

let dir: string;
let project: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'mariachi-generate-'));
  project = join(dir, 'app');
  await createProject({ name: 'cli-app', outputDir: project });
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
    throw new Error(`exit ${code}`); // mariachi-lint-ignore: stands in for process.exit in the test
  }) as never);
});

afterEach(async () => {
  vi.restoreAllMocks();
  await rm(dir, { recursive: true, force: true });
});

async function generate(...args: string[]) {
  const program = new Command().exitOverride();
  registerGenerateCommand(program);
  await program.parseAsync(['node', 'mariachi', 'generate', ...args, '--project-root', project]);
}

const errors = () =>
  vi
    .mocked(console.error)
    .mock.calls.map(([line]) => String(line))
    .join('\n');
const text = (file: string) => readFile(join(project, file), 'utf-8');

describe('mariachi generate', () => {
  it('makes an entity of the fields it is given, with the plural it is given', async () => {
    await generate('entity', 'cactus', '--field', 'title:string', '--field', 'watered_at:timestamp:optional', '--plural', 'cacti');
    const table = await text('src/schema/cacti.ts');
    expect(table).toContain("defineTable('cacti'");
    expect(table).toContain('  title: column.text().notNull(),\n  wateredAt: column.timestamp(),');
  });

  it('makes an event with its subscriber, and a subscriber on its own', async () => {
    await generate('event', 'billing.invoice.paid', '--subscriber', 'send-receipt');
    expect(existsSync(join(project, 'src/events/subscribers/send-receipt.subscriber.ts'))).toBe(true);
    await generate('event', 'billing.invoice.voided', '--subscriber');
    expect(existsSync(join(project, 'src/events/subscribers/on-billing-invoice-voided.subscriber.ts'))).toBe(true);
    await generate('subscriber', 'billing.invoice.paid', 'audit-payment');
    expect(await text('src/events/index.ts')).toContain('registerAuditPaymentSubscriber(events, deps);');
  });

  it('makes a webhook and a procedure', async () => {
    await generate('webhook', 'acme');
    expect(existsSync(join(project, 'src/webhooks/acme.controller.ts'))).toBe(true);
    await generate('procedure', 'notes', 'archive');
    expect(await text('src/contracts/notes.ts')).toContain("'notes.archive'");
  });

  it('says how to call a generator given the wrong arguments or options', async () => {
    await expect(generate('procedure', 'notes')).rejects.toThrow('exit 1');
    expect(errors()).toContain('generate procedure takes two: mariachi generate procedure <service> <name>');
    await expect(generate('job', 'send-digest', 'extra')).rejects.toThrow('exit 1');
    expect(errors()).toContain('generate job takes one name');
    await expect(generate('job', 'send-digest', '--field', 'title:string')).rejects.toThrow('exit 1');
    expect(errors()).toContain('--field is not an option of generate job');
    await expect(generate('procedure', 'invoices', 'void')).rejects.toThrow('exit 1');
    expect(errors()).toContain('There is no service "invoices"');
    expect(existsSync(join(project, 'src/jobs/send-digest.job.ts'))).toBe(false);
  });
});
