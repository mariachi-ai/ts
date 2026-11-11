/** The page shapes every language gives, so an agent never invents a layout. */
export const recipeNames = [
  'dashboard',
  'list-detail',
  'onboarding',
  'settings',
  'empty-state',
  'pricing',
  'errors',
] as const;
export type RecipeName = (typeof recipeNames)[number];

/** Categories for browsing the languages: each holds several, each with its own character. */
export const categories = {
  'calm-fintech': { label: 'Calm fintech', description: 'Quiet, exact money tools: banking, spending, budgets' },
  'bold-fast': {
    label: 'Bold and fast',
    description: 'High energy and high contrast: trading, fitness, payments on the go',
  },
  'warm-friendly': {
    label: 'Warm and friendly',
    description: 'Encouraging and human: learning, wellbeing, hosting, small business',
  },
  'calm-minimal': { label: 'Calm and minimal', description: 'Focus first: notes, tasks, journals, meditation' },
  editorial: {
    label: 'Editorial and warm-neutral',
    description: 'Reading and writing first: docs, newsletters, knowledge tools',
  },
  'dark-sharp': {
    label: 'Dark and sharp',
    description: 'Dark-first, precise and keyboard-driven: developer and pro tools',
  },
  'content-first': {
    label: 'Content-first and immersive',
    description: 'The content is the hero: music, video, film, inspiration',
  },
  marketplace: { label: 'Marketplace and commerce', description: 'Listings, shops, bookings and delivery' },
  social: { label: 'Social and messaging', description: 'People, conversations and communities' },
  playful: {
    label: 'Playful and quirky',
    description: 'Characterful and surprising: creative tools and brands with a wink',
  },
} as const;
export type CategoryId = keyof typeof categories;

/** The common actions every language names an icon for. */
export const iconActions = [
  'add',
  'edit',
  'delete',
  'settings',
  'search',
  'filter',
  'more',
  'close',
  'back',
  'forward',
  'expand',
  'download',
  'upload',
  'copy',
  'external',
  'send',
  'refresh',
  'user',
  'notifications',
  'calendar',
  'help',
  'info',
  'success',
  'warning',
  'error',
] as const;
export type IconAction = (typeof iconActions)[number];

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
  /** Other categories it also appears in (one language can serve two). */
  alsoIn?: CategoryId[];
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
  icons: {
    set: 'lucide';
    stroke: number;
    size: { text: number; control: number };
    style: 'outline' | 'filled';
    /** The icon (a Lucide name) for each common action, so every screen uses the same one. */
    actions: Record<IconAction, string>;
  };
  /** Categorical chart colours in order, light and dark. */
  charts: { categorical: { name: string; light: string; dark: string }[] };
  /** The density dial: 1 by default; the value for data-heavy tools. */
  density: { default: number; dense: number };
  recipes: ArchetypeRecipe[];
}
