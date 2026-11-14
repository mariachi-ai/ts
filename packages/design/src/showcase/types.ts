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
/** The kinds with a template (all of them: `other` is drawn live). */
export const drawnKinds = [
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
] as const satisfies readonly ShowcaseKind[];
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

/** A status, drawn as a badge. */
export interface Status {
  label: string;
  tone: Tone;
}

/** A week of bookings, with one day open. */
export interface CalendarContent {
  title: string;
  /** The week, as words: "10–16 March". */
  range: string;
  days: {
    /** Short day name: "Mon". */
    day: string;
    /** Day of the month: "10". */
    date: string;
    slots: { time: string; label: string; meta?: string; free?: boolean }[];
  }[];
  /** Which day is open (an index into `days`): its slots are listed, and it's marked in the week. */
  selected: number;
  action: string;
}

/** A conversation with one other person: who, the messages, and the reply box. */
export interface ChatThreadContent {
  title: string;
  meta: string;
  /** The other person's initials, for their avatar. */
  initials: string;
  /** The person's own initials, for theirs. */
  myInitials: string;
  status?: Status;
  messages: { from: 'them' | 'me'; text: string; time: string }[];
  /** Quick replies, drawn as chips where the language centres its action. */
  suggestions?: string[];
  placeholder: string;
  action: string;
}

/** A cell: text, or a status drawn as a badge. */
export type TableCell = string | Status;
/** Rows and columns, with an optional total. */
export interface TableContent {
  title: string;
  /**
   * The columns, in order. The first names the row; `numeric` ones align to the end; `minor` ones fold under the
   * first cell as a muted line, so the table keeps to a phone's width.
   */
  columns: { label: string; numeric?: boolean; minor?: boolean }[];
  /** Each row's cells, one per column. */
  rows: TableCell[][];
  /** A footer row: a label and the value under the last numeric column. */
  total?: { label: string; value: string };
  action: string;
}

/** A field of a form. A `choice` is one of a few short options; `half` fields pair up where the language runs wide. */
export type FormField =
  | { kind: 'text' | 'email' | 'tel'; label: string; value?: string; placeholder?: string; hint?: string; half?: boolean }
  | { kind: 'select'; label: string; options: string[]; value?: string; half?: boolean }
  | { kind: 'choice'; label: string; options: string[]; value?: string }
  | { kind: 'check'; label: string; checked?: boolean };
/** A short form: a sign-up, a booking. */
export interface FormContent {
  title: string;
  intro?: string;
  fields: FormField[];
  action: string;
  secondary?: string;
  /** A line under the buttons. */
  note?: string;
}

/** Places on a map, with one place's card open. */
export interface MapContent {
  title: string;
  /** What was searched for, shown in the search box. */
  query?: string;
  places: { name: string; meta: string; distance: string; rating?: string; status?: Status }[];
  /** Which place's card is open (an index into `places`). */
  selected: number;
  action: string;
}

/** One post in a feed: who, when, the words, a picture, and the reactions. */
export interface FeedItemContent {
  author: string;
  initials: string;
  meta: string;
  title?: string;
  text: string;
  tag?: Status;
  /** A picture URL (data: or https:). A neutral artwork is drawn when absent; `false` for none. */
  picture?: string | false;
  likes: string;
  comments: string;
  action: string;
}

/** One number on a dashboard: its value, its change, its trend, and what it's made of. */
export interface DashboardTileContent {
  label: string;
  value: string;
  change: { label: string; tone: Tone; direction: 'up' | 'down' };
  /** What the change is against: "vs February". */
  period: string;
  /** The trend, oldest first, drawn as a sparkline. */
  series: number[];
  /** What the value is made of; `share` (0 to 1) draws a bar where there's room. */
  breakdown?: { label: string; value: string; share?: number }[];
  action: string;
}

export interface ShowcaseContent {
  player: PlayerContent;
  card: CardContent;
  list_row: ListRowContent;
  calendar: CalendarContent;
  chat_thread: ChatThreadContent;
  table: TableContent;
  form: FormContent;
  map: MapContent;
  feed_item: FeedItemContent;
  dashboard_tile: DashboardTileContent;
}

/** A language's named pattern: what `design_reference` answers for "how does this language draw a player?". */
export interface ShowcasePattern {
  name: DrawnKind;
  aliases: string[];
  intent: string;
  html: string;
}
