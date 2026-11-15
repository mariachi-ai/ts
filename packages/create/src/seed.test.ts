import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createProject, generateSeed } from './generators';

describe('mariachi generate seed', () => {
  let root: string;
  beforeEach(async () => {
    root = join(await mkdtemp(join(tmpdir(), 'mariachi-seed-')), 'app');
    await createProject({ name: 'acme-app', outputDir: root, example: false });
  });
  afterEach(async () => {
    await rm(join(root, '..'), { recursive: true, force: true });
  });

  it('writes the seed and lists it in the seeds index, in the order they were made', async () => {
    const first = await generateSeed({ name: 'demo-data', projectRoot: root });
    expect(first).toEqual({ created: ['src/seeds/demo-data.seed.ts'], updated: ['src/seeds/index.ts'], notes: [] });
    await generateSeed({ name: 'PlanCatalog', projectRoot: root });

    const seed = await readFile(join(root, 'src/seeds/demo-data.seed.ts'), 'utf-8');
    expect(seed).toContain('export const demoDataSeed = defineSeed<DrizzleDb>({');
    expect(seed).toContain("name: 'demo-data',");
    const index = await readFile(join(root, 'src/seeds/index.ts'), 'utf-8');
    expect(index).toContain("import { demoDataSeed } from './demo-data.seed';");
    expect(index).toContain("import { planCatalogSeed } from './plan-catalog.seed';");
    // Seeds run in the order listed
    expect(index).toMatch(/export const seeds: SeedDefinition<DrizzleDb>\[\] = \[\n {2}demoDataSeed,\n {2}planCatalogSeed,\n {2}\/\/ mariachi:seeds\n\];/);
  });

  it('refuses a seed that is there already, and leaves the index as it was', async () => {
    await generateSeed({ name: 'demo-data', projectRoot: root });
    const before = await readFile(join(root, 'src/seeds/index.ts'), 'utf-8');
    await expect(generateSeed({ name: 'demo-data', projectRoot: root })).rejects.toMatchObject({ code: 'create/file-exists' });
    expect(await readFile(join(root, 'src/seeds/index.ts'), 'utf-8')).toBe(before);
  });

  it('says which lines to add by hand in a project whose seeds index has no markers', async () => {
    // What a project made before this generator has
    await writeFile(join(root, 'src/seeds/index.ts'), "import type { SeedDefinition } from '@mariachi/database';\n\nexport const seeds: SeedDefinition[] = [];\n");
    const result = await generateSeed({ name: 'demo-data', projectRoot: root });
    expect(result.created).toEqual(['src/seeds/demo-data.seed.ts']);
    expect(result.updated).toEqual([]);
    expect(result.notes).toEqual([
      "src/seeds/index.ts has no \"mariachi:imports\" marker; add manually: import { demoDataSeed } from './demo-data.seed';",
      'src/seeds/index.ts has no "mariachi:seeds" marker; add manually: demoDataSeed,',
    ]);
  });
});
