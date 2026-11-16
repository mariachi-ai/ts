import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    dts: true,
    sourcemap: false,
    platform: 'node',
    splitting: false,
  },
  {
    // npx @mariachi/design-kits add <kit>: the same code as `mariachi design add`, with nothing else to install
    entry: { bin: 'src/bin.ts' },
    format: ['esm'],
    dts: false,
    sourcemap: false,
    platform: 'node',
    splitting: false,
    banner: { js: '#!/usr/bin/env node' },
  },
  {
    // Build-time only: scripts/pack.mjs packs @mariachi/design's kits into dist with it
    entry: { pack: 'src/pack.ts' },
    outDir: '.build',
    format: ['esm'],
    dts: false,
    sourcemap: false,
    platform: 'node',
    splitting: false,
  },
]);
