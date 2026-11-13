import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.ts', build: 'src/build.ts' },
    // ESM only and no source maps: the package is copied into every project that installs it (#45)
    format: ['esm'],
    dts: true,
    sourcemap: false,
    shims: true,
    splitting: false,
    external: ['lightningcss'],
  },
  {
    // Browser-only progressive enhancement; ESM, no Node shims.
    entry: { behaviors: 'src/behaviors/index.ts' },
    format: ['esm'],
    dts: true,
    sourcemap: false,
    platform: 'browser',
    splitting: false,
  },
]);
