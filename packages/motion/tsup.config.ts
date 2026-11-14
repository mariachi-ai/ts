import { defineConfig } from 'tsup';

export default defineConfig([
  {
    // Browser only: enhance(), busy(), optimistic(), leave(), countUp(), navigate()
    entry: { motion: 'src/motion.ts' },
    format: ['esm'],
    dts: true,
    sourcemap: false,
    platform: 'browser',
    target: 'es2022',
    splitting: false,
    minify: true,
  },
  {
    // chart() renders in Node and the browser (no DOM at import); updateChart() is browser only
    entry: { charts: 'src/charts.ts' },
    format: ['esm'],
    dts: true,
    sourcemap: false,
    platform: 'neutral',
    target: 'es2022',
    splitting: false,
    minify: true,
  },
  {
    // Build-time only: the catalog and the gallery page, written to dist by scripts/build-assets.mjs
    entry: { build: 'src/build.ts' },
    outDir: '.build',
    format: ['esm'],
    dts: false,
    sourcemap: false,
    platform: 'node',
    splitting: false,
  },
]);
