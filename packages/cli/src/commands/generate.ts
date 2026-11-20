import { resolve } from 'node:path';
import type { Command } from 'commander';
import {
  FIELD_TYPES,
  generateController,
  generateEntity,
  generateEvent,
  generateIntegration,
  generateJob,
  generatePage,
  generateProcedure,
  generateSeed,
  generateService,
  generateSubscriber,
  generateWebhook,
  type GenerateResult,
} from '@mariachi/create';
import { ConfigError } from '@mariachi/core';
import { fail, printResult } from '../output';

interface GenerateFlags {
  projectRoot: string;
  force?: boolean;
  field: string[];
  plural?: string;
  subscriber?: string | boolean;
}

interface Generator {
  /** What the positional arguments are, for messages. */
  usage: string;
  /** Takes a second positional argument: required (`procedure`) or optional (`subscriber`). */
  second?: 'required' | 'optional';
  /** The options it takes beyond --project-root and --force. */
  flags?: Array<'field' | 'plural' | 'subscriber'>;
  run(first: string, second: string | undefined, flags: GenerateFlags): Promise<GenerateResult>;
}

const simple = (generate: (o: { name: string; projectRoot: string; force?: boolean }) => Promise<GenerateResult>): Generator => ({
  usage: '<name>',
  run: (name, _second, flags) => generate({ name, projectRoot: flags.projectRoot, force: flags.force }),
});

const GENERATORS: Record<string, Generator> = {
  entity: {
    usage: '<name> [--field name:type ...] [--plural <word>]',
    flags: ['field', 'plural'],
    run: (name, _second, flags) => generateEntity({ name, projectRoot: flags.projectRoot, force: flags.force, fields: flags.field, plural: flags.plural }),
  },
  service: simple(generateService),
  procedure: {
    usage: '<service> <name>',
    second: 'required',
    run: (service, name, flags) => generateProcedure({ service, name: name as string, projectRoot: flags.projectRoot, force: flags.force }),
  },
  controller: simple(generateController),
  job: simple(generateJob),
  event: {
    usage: '<domain.thing.happened> [--subscriber [name]]',
    flags: ['subscriber'],
    run: (name, _second, flags) => generateEvent({ name, projectRoot: flags.projectRoot, force: flags.force, subscriber: flags.subscriber }),
  },
  subscriber: {
    usage: '<event> [name]',
    second: 'optional',
    run: (event, name, flags) => generateSubscriber({ event, name, projectRoot: flags.projectRoot, force: flags.force }),
  },
  webhook: simple(generateWebhook),
  integration: simple(generateIntegration),
  page: simple(generatePage),
  seed: simple(generateSeed),
};

const collect = (value: string, previous: string[]) => [...previous, value];

export function registerGenerateCommand(program: Command): void {
  program
    .command('generate <type> <name> [second]')
    .alias('g')
    .description(`Generate code into src/ (${Object.keys(GENERATORS).join(', ')})`)
    .option('-p, --project-root <path>', 'project root', '.')
    .option('-f, --force', 'overwrite existing files')
    .option('--field <name:type>', `entity: a column, repeatable; name:type? is nullable. Types: ${FIELD_TYPES.join(', ')}`, collect, [])
    .option('--plural <word>', 'entity: its plural, when the rules get it wrong')
    .option('--subscriber [name]', 'event: also a subscriber to it (default on-<event>)')
    .addHelpText(
      'after',
      `\n${Object.entries(GENERATORS)
        .map(([type, g]) => `  mariachi generate ${type} ${g.usage}`)
        .join('\n')}`,
    )
    .action(async (type: string, first: string, second: string | undefined, opts: GenerateFlags) => {
      try {
        const kind = type.toLowerCase();
        const generator = GENERATORS[kind];
        if (!generator) {
          throw new ConfigError('cli/unknown-generator', `Unknown type "${type}". Use one of: ${Object.keys(GENERATORS).join(', ')}`);
        }
        if (second !== undefined && !generator.second) {
          throw new ConfigError('cli/unexpected-argument', `generate ${kind} takes one name: mariachi generate ${kind} ${generator.usage}`);
        }
        if (second === undefined && generator.second === 'required') {
          throw new ConfigError('cli/missing-argument', `generate ${kind} takes two: mariachi generate ${kind} ${generator.usage}`);
        }
        const given = [opts.field.length > 0 && 'field', opts.plural !== undefined && 'plural', opts.subscriber !== undefined && 'subscriber'].filter(
          (flag): flag is 'field' | 'plural' | 'subscriber' => typeof flag === 'string',
        );
        const stray = given.find((flag) => !generator.flags?.includes(flag));
        if (stray) {
          throw new ConfigError('cli/unexpected-option', `--${stray} is not an option of generate ${kind}: mariachi generate ${kind} ${generator.usage}`);
        }
        printResult(await generator.run(first, second, { ...opts, projectRoot: resolve(opts.projectRoot) }));
      } catch (error) {
        fail(error);
      }
    });
}
