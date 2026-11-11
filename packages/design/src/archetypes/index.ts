import { calmTrustArchetype } from './calm-trust';
import type { Archetype } from './types';

/**
 * The design archetypes, in display order: complete languages an app is built from. Each is a
 * preset (in `presets`, same name) plus its discovery card, type, icons, charts, six layout
 * recipes and a `DESIGN.md`. Calm trust is first; the other nine follow in their own change.
 */
export const archetypes: Archetype[] = [calmTrustArchetype];

export { recipeNames } from './types';
export type { Archetype, ArchetypeRecipe, RecipeName } from './types';
