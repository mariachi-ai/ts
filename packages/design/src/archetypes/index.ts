import { fennelArchetype } from './fennel';
import { basaltArchetype } from './basalt';
import { emberArchetype } from './ember';
import { cirrusArchetype } from './cirrus';
import { halcyonArchetype } from './halcyon';
import { zephyrArchetype } from './zephyr';
import { onyxArchetype } from './onyx';
import { terracottaArchetype } from './terracotta';
import { marigoldArchetype } from './marigold';
import { linenArchetype } from './linen';
import { quillArchetype } from './quill';
import type { Archetype } from './types';

/**
 * The design languages, in display order: complete languages an app is built from, each faithful to
 * one real product's visual system under an abstract name, browsed by category. Each is a preset
 * (in `presets`, same name) plus its discovery card, type, icons, charts, six layout recipes and a
 * `DESIGN.md`. Halcyon is the first; the rest follow a category at a time.
 */
export const archetypes: Archetype[] = [halcyonArchetype, fennelArchetype, basaltArchetype, emberArchetype, cirrusArchetype, zephyrArchetype, onyxArchetype, terracottaArchetype, marigoldArchetype, linenArchetype, quillArchetype];

export { categories, iconActions, recipeNames } from './types';
export type { Archetype, ArchetypeRecipe, CategoryId, IconAction, RecipeName } from './types';
