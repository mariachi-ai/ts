import { fennelArchetype } from './fennel';
import { basaltArchetype } from './basalt';
import { bazaarArchetype } from './bazaar';
import { emberArchetype } from './ember';
import { cirrusArchetype } from './cirrus';
import { folioArchetype } from './folio';
import { halcyonArchetype } from './halcyon';
import { meridianArchetype } from './meridian';
import { flintArchetype } from './flint';
import { cometArchetype } from './comet';
import { reelArchetype } from './reel';
import { ariaArchetype } from './aria';
import { zephyrArchetype } from './zephyr';
import { onyxArchetype } from './onyx';
import { terracottaArchetype } from './terracotta';
import { marigoldArchetype } from './marigold';
import { linenArchetype } from './linen';
import { quillArchetype } from './quill';
import { broadsheetArchetype } from './broadsheet';
import { obsidianArchetype } from './obsidian';
import { carbonArchetype } from './carbon';
import { cadenceArchetype } from './cadence';
import { mosaicArchetype } from './mosaic';
import { transitArchetype } from './transit';
import { hearthArchetype } from './hearth';
import { harborArchetype } from './harbor';
import { prismArchetype } from './prism';
import { confettiArchetype } from './confetti';
import { voltArchetype } from './volt';
import { sprintArchetype } from './sprint';
import { summitArchetype } from './summit';
import { solaceArchetype } from './solace';
import { heatherArchetype } from './heather';
import { saffronArchetype } from './saffron';
import { nocturneArchetype } from './nocturne';
import { vellumArchetype } from './vellum';
import { chalkArchetype } from './chalk';
import { ochreArchetype } from './ochre';
import { marginArchetype } from './margin';
import { quireArchetype } from './quire';
import { marqueeArchetype } from './marquee';
import { keelArchetype } from './keel';
import type { Archetype } from './types';

/**
 * The design languages, in display order: complete languages an app is built from, each faithful to
 * one real product's visual system under an abstract name, browsed by category. Each is a preset
 * (in `presets`, same name) plus its discovery card, type, icons, charts, six layout recipes and a
 * `DESIGN.md`. Halcyon is the first; the rest follow a category at a time.
 */
export const archetypes: Archetype[] = [halcyonArchetype, fennelArchetype, basaltArchetype, emberArchetype, cirrusArchetype, zephyrArchetype, onyxArchetype, terracottaArchetype, marigoldArchetype, linenArchetype, quillArchetype, folioArchetype, broadsheetArchetype, obsidianArchetype, carbonArchetype, cadenceArchetype, mosaicArchetype, bazaarArchetype, transitArchetype, hearthArchetype, harborArchetype, prismArchetype, confettiArchetype, voltArchetype, sprintArchetype, summitArchetype, solaceArchetype, heatherArchetype, saffronArchetype, nocturneArchetype, vellumArchetype, chalkArchetype, ochreArchetype, marginArchetype, quireArchetype, meridianArchetype, flintArchetype, cometArchetype, marqueeArchetype, reelArchetype, ariaArchetype, keelArchetype];

export { categories, iconActions, recipeNames } from './types';
export type { Archetype, ArchetypeRecipe, CategoryId, IconAction, RecipeName } from './types';
