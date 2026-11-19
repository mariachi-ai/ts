import path from 'node:path';
import { parseArgs } from 'node:util';
import { MariachiError } from '@mariachi/core/errors';
import { addKit, installedKit, type KitChanges } from './add';
import { DesignKitsError } from './errors';
import { formatAddResult, formatChanges, formatKitList } from './format';
import { designReference, openReferenceSource, referenceList } from './reference';
import { defaultStoreRoot, type KitStore, listKits } from './store';

export interface CliIO {
  cwd: string;
  out: (line: string) => void;
  err: (line: string) => void;
  /** The packed kits to use. Default: this package's own. */
  store?: KitStore;
}

export const DEFAULT_DESIGN_DIR = 'src/design';

const USAGE = [
  'Usage:',
  '  mariachi-design-kits list [--json]',
  '  mariachi-design-kits add <kit> [--dir src/design] [--force] [--dry-run] [--json]',
  '  mariachi-design-kits reference <name> [--kit <id>] [--dir src/design] [--json]',
  '  mariachi-design-kits reference --list [--kit <id>]',
  '',
  'add copies a kit into <dir> (tokens, base styles, fonts, motion, DESIGN.md, kit.json) and makes design.css',
  "beside that folder, once, for the project's own changes. Taking a kit when another is there replaces the",
  'old one in the same folder. A copy the project has edited is reported and left alone unless --force.',
  '',
  "reference says how a kit's design language builds a component: how it draws it, its anatomy, example markup,",
  "the CSS to copy (on --m-* tokens) and where it appears in the language's pages. The kit is the project's own",
  '(the one in <dir>) unless --kit names another.',
];

export interface AddCommandOptions {
  dir?: string;
  force?: boolean;
  dryRun?: boolean;
  json?: boolean;
}

/** `design add <kit>`: copies the kit and prints what happened. Returns the exit code. */
export function runAdd(id: string, opts: AddCommandOptions, io: CliIO): number {
  try {
    const result = addKit(id, {
      dir: path.resolve(io.cwd, opts.dir ?? DEFAULT_DESIGN_DIR),
      force: opts.force,
      dryRun: opts.dryRun,
      store: io.store,
    });
    if (opts.json) io.out(JSON.stringify(result, null, 2));
    else for (const line of formatAddResult(result, io.cwd)) io.out(line);
    return 0;
  } catch (error) {
    if (!(error instanceof MariachiError)) throw error;
    if (opts.json) io.out(JSON.stringify({ error: { code: error.code, message: error.message, ...error.metadata } }, null, 2));
    else {
      io.err(`error ${error.message}`);
      if (error.code === 'design-kits/edited') for (const line of formatChanges(error.metadata as unknown as KitChanges, path.relative(io.cwd, String(error.metadata?.dir)))) io.err(line);
    }
    return 1;
  }
}

/** `design list`'s kits. Returns the exit code. */
export function runList(opts: { json?: boolean }, io: CliIO): number {
  const kits = listKits(io.store);
  if (opts.json) io.out(JSON.stringify(kits, null, 2));
  else for (const line of formatKitList(kits)) io.out(line);
  return 0;
}

export interface ReferenceCommandOptions {
  kit?: string;
  dir?: string;
  list?: boolean;
  json?: boolean;
}

/**
 * `design reference <name>`: how the kit's language builds a component, as Markdown (or the answer as JSON). The kit
 * is `--kit`, else the project's own in `--dir`. Returns the exit code.
 */
export function runReference(name: string | undefined, opts: ReferenceCommandOptions, io: CliIO): number {
  const kit = opts.kit ?? installedKit(path.resolve(io.cwd, opts.dir ?? DEFAULT_DESIGN_DIR))?.id ?? null;
  const source = openReferenceSource(io.store?.root ?? defaultStoreRoot(), io.store);
  if (opts.list) {
    io.out(referenceList(kit, source));
    return 0;
  }
  if (!name) throw new DesignKitsError('design-kits/usage', 'reference takes the name of a component or pattern (or --list)');
  if (!kit) {
    throw new DesignKitsError(
      'design-kits/no-kit',
      `There's no kit in ${opts.dir ?? DEFAULT_DESIGN_DIR} to answer for. Name one with --kit <id>, or add one first (design add <kit>).`,
    );
  }
  const answer = designReference(name, kit, source);
  if (opts.json) io.out(JSON.stringify(answer, null, 2));
  else io.out(answer.markdown);
  return answer.found === 'none' ? 1 : 0;
}

/** The package's own command line (`npx @mariachi/design-kits …`). Returns the exit code. */
export function run(argv: string[], io: CliIO): number {
  let parsed: ReturnType<typeof parseArgs>;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        dir: { type: 'string', short: 'd' },
        force: { type: 'boolean' },
        'dry-run': { type: 'boolean' },
        json: { type: 'boolean' },
        kit: { type: 'string', short: 'k' },
        list: { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
      },
    });
  } catch (error) {
    io.err(`error ${error instanceof Error ? error.message : String(error)}`);
    for (const line of USAGE) io.err(line);
    return 2;
  }
  const { values, positionals } = parsed;
  const [command, id, ...rest] = positionals;
  if (values.help || !command) {
    for (const line of USAGE) io.out(line);
    return values.help ? 0 : 2;
  }
  try {
    if (command === 'list' && !id) return runList({ json: values.json as boolean | undefined }, io);
    if (command === 'add' && id && !rest.length) {
      return runAdd(
        id,
        {
          dir: values.dir as string | undefined,
          force: values.force as boolean | undefined,
          dryRun: values['dry-run'] as boolean | undefined,
          json: values.json as boolean | undefined,
        },
        io,
      );
    }
    if (command === 'reference' && !rest.length) {
      return runReference(
        id,
        { kit: values.kit as string | undefined, dir: values.dir as string | undefined, list: values.list as boolean | undefined, json: values.json as boolean | undefined },
        io,
      );
    }
    throw new DesignKitsError('design-kits/usage', command === 'add' ? 'add takes one kit id' : command === 'reference' ? 'reference takes one name' : `Unknown command "${command}"`);
  } catch (error) {
    if (!(error instanceof MariachiError)) throw error;
    io.err(`error ${error.message}`);
    if (error.code === 'design-kits/usage') for (const line of USAGE) io.err(line);
    return error.code === 'design-kits/usage' ? 2 : 1;
  }
}
