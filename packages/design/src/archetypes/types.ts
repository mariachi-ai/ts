/** The six page shapes every archetype gives, so an agent never invents a layout. */
export const recipeNames = ['dashboard', 'list-detail', 'onboarding', 'settings', 'empty-state', 'pricing'] as const;
export type RecipeName = (typeof recipeNames)[number];

export interface ArchetypeRecipe {
  name: RecipeName;
  title: string;
  description: string;
  /** Framework-free HTML using only @mariachi/design classes and tokens, with sample data. */
  html: string;
}

/**
 * A design archetype: a preset plus what an app needs to be built from it. The preset holds the
 * tokens; this holds the rest (who it's for, the discovery card, type, icons, charts, recipes).
 * Its `DESIGN.md` (shipped as `archetypes/<id>/DESIGN.md`) is the same thing in words, for agents.
 */
export interface Archetype {
  /** The preset's name: `data-theme="<id>"`, `themes/<id>.css`. */
  id: string;
  /** Who it's for, in a phrase. */
  for: string;
  /** The discovery card's one sentence: what using an app in this language feels like. */
  pitch: string;
  /** Token paths shown as the card's swatches, in order. */
  swatches: string[];
  /** Open fonts only, by family name (self-hosted with @fontsource). */
  type: { body: string; heading: string; mono: string };
  icons: { set: 'lucide'; stroke: number; size: { text: number; control: number }; style: 'outline' | 'filled' };
  /** Categorical chart colours in order, light and dark, checked against the surface. */
  charts: { categorical: { name: string; light: string; dark: string }[] };
  /** The density dial: 1 by default; the value for data-heavy tools. */
  density: { default: number; dense: number };
  recipes: ArchetypeRecipe[];
}
