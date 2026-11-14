/**
 * Showcases: the key component of someone's app (their player, their job card) drawn in any design language, for
 * New project's look step and for "how does this language draw a …?". One template per kind of component; each
 * language's measured habits (its `Arrangement`) decide the structure, and its kit's tokens decide the paint, so
 * three languages give three different components from the same content.
 */

/**
 * The kinds a showcase can be: New project's `SHOWCASE_KINDS`, less `other`, which is drawn live. The interview picks
 * one from the idea and the first flow.
 */
export const showcaseKinds = [
  'player',
  'card',
  'list_row',
  'calendar',
  'chat_thread',
  'table',
  'form',
  'map',
  'feed_item',
  'dashboard_tile',
] as const;
export type ShowcaseKind = (typeof showcaseKinds)[number];
/** The kinds with a template so far. */
export const drawnKinds = ['player', 'card', 'list_row'] as const satisfies readonly ShowcaseKind[];
export type DrawnKind = (typeof drawnKinds)[number];

/**
 * How a language arranges a component, from its fingerprint (see `arrangementsFrom`). Each value is relative to the
 * other languages, so the arrangement says what's characteristic of it, not what every language does.
 */
export interface Arrangement {
  /** How things are set apart: a bordered card, a raised card, a tinted panel, rules between, or space alone. */
  separation: 'border' | 'shadow' | 'tint' | 'divider' | 'space';
  /** Pictures: one leads (large, first), sits beside the words, or is a small thumbnail. */
  media: 'leads' | 'beside' | 'thumb';
  /** How far the title stands above the body text. */
  title: 'quiet' | 'medium' | 'loud' | 'display';
  /** How tight things sit. */
  density: 'dense' | 'regular' | 'airy';
  /** Where the main action sits: at the head, at the foot, centred, or in line with its row. */
  primary: 'header' | 'footer' | 'centre' | 'inline';
  /** How wide the content runs. */
  width: 'narrow' | 'regular' | 'wide';
}

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

/** Now playing. */
export interface PlayerContent {
  title: string;
  by: string;
  from?: string;
  elapsed: string;
  length: string;
  /** Share played, 0 to 1. */
  played: number;
  /** A picture URL (data: or https:). A neutral artwork is drawn when absent. */
  cover?: string;
}

/** One thing with a short checklist, who's on it and when it's due. */
export interface CardContent {
  title: string;
  meta: string;
  status?: { label: string; tone: Tone };
  items: { label: string; done?: boolean }[];
  people?: string[];
  action: string;
}

/** A few rows of a list, each with a status or a value. */
export interface ListRowContent {
  title: string;
  rows: { title: string; meta: string; status?: { label: string; tone: Tone }; value?: string; picture?: boolean }[];
  action: string;
}

export interface ShowcaseContent {
  player: PlayerContent;
  card: CardContent;
  list_row: ListRowContent;
}

/** A language's named pattern: what `design_reference` answers for "how does this language draw a player?". */
export interface ShowcasePattern {
  name: DrawnKind;
  aliases: string[];
  intent: string;
  html: string;
}
