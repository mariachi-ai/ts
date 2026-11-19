import fs from 'node:fs';
import path from 'node:path';
import type { Command } from 'commander';
import { ConfigError } from '@mariachi/core';
import { createJiti } from 'jiti';
import { DIM, GREEN, RED, RESET, YELLOW } from '../colors';
import { fail } from '../output';

type DesignBuild = typeof import('@mariachi/design/build');
export type DesignKits = typeof import('@mariachi/design-kits');

const CONFIG_NAMES = ['mariachi.design.ts', 'mariachi.design.mts', 'mariachi.design.js', 'mariachi.design.mjs'];

/** Finds and loads the design config (default export of mariachi.design.ts). */
export async function loadDesignConfig(cwd: string, file?: string): Promise<{ file: string; config: unknown }> {
  const found = file ? path.resolve(cwd, file) : CONFIG_NAMES.map((n) => path.join(cwd, n)).find((f) => fs.existsSync(f));
  if (!found || !fs.existsSync(found)) {
    throw new ConfigError('cli/design-config-missing', `No design config found${file ? ` at ${file}` : ''}. Create mariachi.design.ts (see mariachi design new-theme, or the design docs).`);
  }
  const jiti = createJiti(import.meta.url, { interopDefault: true });
  const mod = (await jiti.import(found)) as { default?: unknown } | unknown;
  const config = mod && typeof mod === 'object' && 'default' in mod ? (mod as { default: unknown }).default : mod;
  return { file: found, config };
}

const isMissing = (err: unknown): boolean => {
  const code = (err as { code?: string }).code;
  return code === 'ERR_MODULE_NOT_FOUND' || code === 'MODULE_NOT_FOUND';
};

/** `@mariachi/design` is an optional peer: only `mariachi design` loads it, so a project that never runs it doesn't install it. */
const design = async (): Promise<DesignBuild> => {
  try {
    return await import('@mariachi/design/build');
  } catch (err) {
    if (isMissing(err)) {
      throw new ConfigError('cli/design-missing', 'mariachi design needs @mariachi/design: pnpm add -D @mariachi/design (it matches your @mariachi version)');
    }
    throw err;
  }
};

/** `@mariachi/design-kits` is an optional peer too: only `design add` and `design list` load it. */
const designKits = async (): Promise<DesignKits> => {
  try {
    return await import('@mariachi/design-kits');
  } catch (err) {
    if (isMissing(err)) {
      throw new ConfigError(
        'cli/design-kits-missing',
        'mariachi design add needs @mariachi/design-kits: pnpm add -D @mariachi/design-kits (or, with nothing installed: npx @mariachi/design-kits add <kit>)',
      );
    }
    throw err;
  }
};

/** Resolves to undefined when the optional package isn't installed. */
const optional = async <T>(load: () => Promise<T>): Promise<T | undefined> => {
  try {
    return await load();
  } catch (err) {
    if (err instanceof ConfigError && (err.code === 'cli/design-missing' || err.code === 'cli/design-kits-missing')) return undefined;
    throw err;
  }
};

/** `@mariachi/design-kits`, or undefined when it isn't installed (`init --ui` then copies the kit with npx). */
export const optionalDesignKits = (): Promise<DesignKits | undefined> => optional(designKits);

function printCheck(check: Awaited<ReturnType<DesignBuild['buildDesign']>>['check'], format: DesignBuild['formatContrastFailure']): void {
  const passed = check.results.length - check.failures.length;
  if (check.ok) console.log(`${GREEN}contrast${RESET} ${passed}/${check.results.length} pairs pass`);
  else {
    console.log(`${RED}contrast${RESET} ${check.failures.length} pair(s) below the minimum:`);
    for (const f of check.failures) console.log(`  ${format(f)}`);
  }
  for (const u of check.unchecked) console.log(`${YELLOW}unchecked${RESET} ${u.pair.fg} / ${u.pair.bg} (${u.mode}): ${u.value}`);
}

export const themeTemplate = (name: string, from: string) => `import { extendTheme, ${from} } from '@mariachi/design';

/**
 * The "${name}" theme: ${from} with your changes. Only what you set here differs.
 * Use it as the base in mariachi.design.ts:  base: ${camel(name)}
 */
export const ${camel(name)} = extendTheme(${from}, {
  name: '${name}',
  tokens: {
    color: {
      accent: {
        // default: { light: 'oklch(0.55 0.2 260)', dark: 'oklch(0.6 0.18 260)' },
      },
    },
    // radius: { control: '8px' },
    // font: { family: { sans: '"Inter", system-ui, sans-serif' } },
  },
  components: {
    // button: { radius: '999px' },
  },
});
`;

const camel = (s: string) => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

export function registerDesignCommand(program: Command): void {
  const cmd = program.command('design').description('Build and check @mariachi/design themes and overrides');

  cmd
    .command('build')
    .description('Build one CSS file from mariachi.design.ts: base, chosen components, and only the tokens you changed')
    .option('-c, --config <file>', 'design config (default: mariachi.design.ts in the current directory)')
    .option('-o, --out <file>', 'output CSS file', 'design.css')
    .option('--minify', 'minify with lightningcss')
    .option('--strict', 'exit 1 when a contrast pair fails')
    .action(async (opts: { config?: string; out: string; minify?: boolean; strict?: boolean }) => {
      try {
        const { file, config } = await loadDesignConfig(process.cwd(), opts.config);
        const { buildDesign, formatContrastFailure } = await design();
        const result = await buildDesign(config as never, { cwd: path.dirname(file), outFile: path.resolve(process.cwd(), opts.out), minify: opts.minify });
        console.log(
          `${GREEN}built${RESET} ${path.relative(process.cwd(), result.outFile!)} ${DIM}(${result.design.components.length} components, base ${result.design.base.name}, ${(result.css.length / 1024).toFixed(1)} KB)${RESET}`,
        );
        printCheck(result.check, formatContrastFailure);
        if (opts.strict && !result.check.ok) process.exitCode = 1;
      } catch (error) {
        fail(error);
      }
    });

  cmd
    .command('check')
    .description('Validate mariachi.design.ts against the token contract and check contrast (exit 1 on failures)')
    .option('-c, --config <file>', 'design config (default: mariachi.design.ts in the current directory)')
    .option('--json', 'machine-readable output')
    .action(async (opts: { config?: string; json?: boolean }) => {
      try {
        const { config } = await loadDesignConfig(process.cwd(), opts.config);
        const { checkTheme, defineDesign, formatContrastFailure } = await design();
        const resolved = 'theme' in (config as object) ? (config as ReturnType<typeof defineDesign>) : defineDesign(config as never);
        const check = checkTheme(resolved.theme);
        if (opts.json) console.log(JSON.stringify({ ok: check.ok, failures: check.failures, unchecked: check.unchecked }, null, 2));
        else printCheck(check, formatContrastFailure);
        if (!check.ok) process.exitCode = 1;
      } catch (error) {
        fail(error);
      }
    });

  cmd
    .command('new-theme <name>')
    .description('Scaffold a theme file that extends a preset')
    .option('--from <preset>', 'preset to extend', 'minimal')
    .option('-o, --out <file>', 'file to write (default: src/styles/<name>.theme.ts)')
    .action(async (name: string, opts: { from: string; out?: string }) => {
      try {
        const { presets } = await design();
        if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new ConfigError('cli/invalid-name', 'Theme names use lowercase letters, digits and dashes');
        if (!(opts.from in presets)) throw new ConfigError('cli/unknown-preset', `Unknown preset "${opts.from}". Presets: ${Object.keys(presets).join(', ')}`);
        const out = path.resolve(process.cwd(), opts.out ?? path.join('src', 'styles', `${name}.theme.ts`));
        if (fs.existsSync(out)) throw new ConfigError('cli/file-exists', `${path.relative(process.cwd(), out)} already exists`);
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.writeFileSync(out, themeTemplate(name, opts.from));
        console.log(`${GREEN}created${RESET} ${path.relative(process.cwd(), out)}`);
        console.log(`${DIM}Use it: import { ${camel(name)} } from './${path.relative(process.cwd(), out).replace(/\.ts$/, '')}' and set base: ${camel(name)} in mariachi.design.ts${RESET}`);
      } catch (error) {
        fail(error);
      }
    });

  cmd
    .command('add <kit>')
    .description("Copy a design language (or a plain preset) into the project as its own: tokens, base styles, fonts, motion and DESIGN.md")
    .option('-d, --dir <dir>', "the kit's folder; design.css, the project's own, is made beside it", 'src/design')
    .option('--force', 'replace a copy the project has edited (the edits are listed, then lost)')
    .option('--dry-run', 'say what would happen; write nothing')
    .option('--json', 'machine-readable output')
    .action(async (kit: string, opts: { dir: string; force?: boolean; dryRun?: boolean; json?: boolean }) => {
      try {
        const { runAdd } = await designKits();
        process.exitCode = runAdd(kit, opts, { cwd: process.cwd(), out: (line) => console.log(line), err: (line) => console.error(line) });
      } catch (error) {
        fail(error);
      }
    });

  cmd
    .command('list')
    .description('List presets and components, and the kits `design add` can copy in')
    .option('--kits', 'only the kits')
    .option('--json', 'machine-readable output')
    .action(async (opts: { kits?: boolean; json?: boolean }) => {
      try {
        const [lib, kits] = await Promise.all([opts.kits ? undefined : optional(design), optional(designKits)]);
        if (opts.kits && !kits) await designKits();
        if (!lib && !kits) await design();
        if (opts.json) {
          console.log(
            JSON.stringify(
              {
                presets: lib ? Object.values(lib.presets).map((p) => ({ name: p.name, description: p.description })) : undefined,
                components: lib?.componentList.map((c) => ({ name: c.name, category: c.category, description: c.description })),
                kits: kits?.listKits(),
              },
              null,
              2,
            ),
          );
          return;
        }
        if (lib) {
          console.log('Presets');
          for (const p of Object.values(lib.presets)) console.log(`  ${p.name.padEnd(12)} ${DIM}${p.description}${RESET}`);
          console.log('\nComponents');
          for (const c of lib.componentList) console.log(`  ${c.name.padEnd(12)} ${DIM}${c.category}: ${c.description}${RESET}`);
        }
        if (kits) {
          if (lib) console.log('');
          console.log(`Kits ${DIM}(mariachi design add <kit>)${RESET}`);
          for (const line of kits.formatKitList(kits.listKits())) console.log(line);
        } else console.log(`\n${DIM}Kits: install @mariachi/design-kits to copy a language into the project (mariachi design add <kit>)${RESET}`);
      } catch (error) {
        fail(error);
      }
    });
}
