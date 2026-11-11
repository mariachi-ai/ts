import { halcyonArchetype } from './halcyon';
import type { Archetype } from './types';

/**
 * The design languages, in display order: complete languages an app is built from, each faithful to
 * one real product's visual system under an abstract name, browsed by category. Each is a preset
 * (in `presets`, same name) plus its discovery card, type, icons, charts, six layout recipes and a
 * `DESIGN.md`. Halcyon is the first; the rest follow a category at a time.
 */
export const archetypes: Archetype[] = [halcyonArchetype];

export { categories, recipeNames } from './types';
export type { Archetype, ArchetypeRecipe, CategoryId, RecipeName } from './types';
