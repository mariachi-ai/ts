import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { Command } from 'commander';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerValidateCommand } from './validate';

const HANDLER = `import type { CommunicationLayer } from '@mariachi/communication';
import { z } from 'zod';

export function registerNotesHandlers(communication: CommunicationLayer): void {
  communication.register('notes.create', {
    schema: { input: z.object({ name: z.string() }), output: z.object({ id: z.string() }) },
    handler: (input) => Promise.resolve({ id: String(input) }),
  });
}
`;

describe('mariachi validate', () => {
  let dir: string;
  let out: string[];

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'mariachi-validate-'));
    out = [];
    vi.spyOn(console, 'log').mockImplementation((line: string) => void out.push(line));
    process.exitCode = undefined;
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    process.exitCode = undefined;
    await rm(dir, { recursive: true, force: true });
  });

  async function project(files: Record<string, string>) {
    for (const [path, content] of Object.entries(files)) {
      await mkdir(dirname(join(dir, path)), { recursive: true });
      await writeFile(join(dir, path), content);
    }
  }

  async function validate(...args: string[]) {
    const program = new Command().exitOverride();
    registerValidateCommand(program);
    await program.parseAsync(['node', 'mariachi', 'validate', dir, ...args]);
  }

  it('prints each finding with its place, rule and fix, and exits 1', async () => {
    await project({ 'src/services/notes/notes.handler.ts': HANDLER });
    await validate();
    const text = out.join('\n');
    expect(text).toContain('src/services/notes/notes.handler.ts:7 ctx-first');
    expect(text).toContain('The handler of procedure "notes.create" takes input first, not the Context');
    expect(text).toContain('→ Take ctx first: handler: (ctx, input) => …');
    expect(text).toMatch(/1 error\(s\)/);
    expect(process.exitCode).toBe(1);
  });

  it('prints JSON with --json', async () => {
    await project({ 'src/services/notes/notes.handler.ts': HANDLER });
    await validate('--json');
    const result = JSON.parse(out.join('\n'));
    expect(result.valid).toBe(false);
    expect(result.violations).toEqual([
      expect.objectContaining({ rule: 'ctx-first', severity: 'error', file: 'src/services/notes/notes.handler.ts', line: 7 }),
    ]);
    expect(process.exitCode).toBe(1);
  });

  it('passes a clean project', async () => {
    await project({ 'src/services/notes/notes.handler.ts': HANDLER.replace('(input) => Promise.resolve({ id: String(input) })', '(ctx, input) => Promise.resolve({ id: input.name })') });
    await validate();
    expect(out.at(-1)).toMatch(/0 error\(s\), 0 warning\(s\)/);
    expect(process.exitCode).toBeUndefined();
  });

  it('lists the rules, the new ones among them', async () => {
    await validate('--list');
    const rules = out.map((line) => line.split(/\s+/)[0]);
    expect(rules).toEqual(expect.arrayContaining(['ctx-first', 'zod-at-boundaries', 'procedure-name-format', 'procedure-registered', 'unique-procedure-names']));
  });
});
