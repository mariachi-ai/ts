/** The six page shapes every language gives, so an agent never invents a layout. */
export const recipeNames = ['dashboard', 'list-detail', 'onboarding', 'settings', 'empty-state', 'pricing'] as const;
export type RecipeName = (typeof recipeNames)[number];

/** Categories for browsing the languages: each holds several, each with its own character. */
export const categories = {
  'calm-trust': {
    label: 'Calm trust',
    description: 'Money, health, insurance: anything where people need to feel safe',
  },
} as const;
export type CategoryId = keyof typeof categories;

export interface ArchetypeRecipe {
  name: RecipeName;
  title: string;
  description: string;
  /** Framework-free HTML using only @mariachi/design classes and tokens, with sample data. */
  html: string;
}

/**
 * A design language: a preset plus what an app needs to be built from it, taken faithfully from one
 * real product's visual system (its values measured, not invented) under an abstract name. The
 * preset holds the tokens; this holds the rest (category, the discovery card, type, icons, charts,
 * recipes). Its `DESIGN.md` (shipped as `archetypes/<id>/DESIGN.md`) is the same in words, for agents.
 */
export interface Archetype {
  /** The preset's name: `data-theme="<id>"`, `themes/<id>.css`. An abstract name, never a company's. */
  id: string;
  /** The category it's browsed under. */
  category: CategoryId;
  /** What New Project's design step searches, beside the name and category (lowercase words). */
  tags: {
    /** How it feels: calm, bold, warm, playful, quiet, precise… */
    feel: string[];
    density: 'airy' | 'balanced' | 'dense';
    mode: 'light-first' | 'dark-first' | 'both';
    /** The kinds of apps it suits: banking, dashboards, bookings, social… */
    suits: string[];
    /** Visible traits: minimal, rounded, high-contrast, editorial, serif, pill buttons… */
    style: string[];
  };
  /** Who it's for, in a phrase. */
  for: string;
  /** The discovery card's one sentence: what using an app in this language feels like. */
  pitch: string;
  /** Token paths shown as the card's swatches, in order. */
  swatches: string[];
  /** Open fonts only, by family name (self-hosted with @fontsource). */
  type: { body: string; heading: string; mono: string };
  icons: { set: 'lucide'; stroke: number; size: { text: number; control: number }; style: 'outline' | 'filled' };
  /** Categorical chart colours in order, light and dark. */
  charts: { categorical: { name: string; light: string; dark: string }[] };
  /** The density dial: 1 by default; the value for data-heavy tools. */
  density: { default: number; dense: number };
  recipes: ArchetypeRecipe[];
}
