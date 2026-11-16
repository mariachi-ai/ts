import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', schema: 'src/schema/index.ts', postgres: 'src/postgres/index.ts', http: 'src/http/index.ts' },
  external: ['@mariachi/database-postgres', 'drizzle-orm', '@mariachi/api-facade'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  shims: true,
  splitting: false,
});
