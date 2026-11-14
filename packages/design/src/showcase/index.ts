/**
 * Showcases: someone's key component drawn in a design language (New project's look step; `design_reference`'s
 * named patterns). `drawShowcase(kind, archetype, content)` gives the HTML, to be shown inside a frame that loads
 * the language's kit (`kits/<id>/index.css`) and the library's components (`css/mariachi.css`), with
 * `data-theme="<id>"` and `data-mode` on its root.
 */
import type { Archetype } from '../archetypes/types';
import { arrangements } from './arrangements';
import { card, list_row, player } from './kinds';
import { DesignError } from '../errors';
import type { Arrangement, DrawnKind, ShowcaseContent, ShowcaseKind, ShowcasePattern } from './types';
import { drawnKinds } from './types';

export { arrangementsFrom } from './arrange';
export { arrangements } from './arrangements';
export type {
  Arrangement,
  CardContent,
  DrawnKind,
  ListRowContent,
  PlayerContent,
  ShowcaseContent,
  ShowcaseKind,
  ShowcasePattern,
  Tone,
} from './types';
export { drawnKinds, showcaseKinds } from './types';

/** Example content for each kind, invented and neutral: the same in every language, so only the look differs. */
export const exampleContent: ShowcaseContent = {
  player: {
    title: 'Low Tide Hours',
    by: 'The Marram Quartet',
    from: 'Salt Year',
    elapsed: '1:24',
    length: '3:41',
    played: 0.38,
  },
  card: {
    title: 'Harbour Street flat',
    meta: 'Thursday · Turnover clean',
    status: { label: 'Due 2 pm', tone: 'warning' },
    items: [
      { label: 'Strip and change the beds', done: true },
      { label: 'Descale the kettle' },
      { label: 'Restock dish soap and bin bags' },
      { label: 'Photo of the kitchen for the host' },
    ],
    people: ['JM', 'AR'],
    action: 'Add a task',
  },
  list_row: {
    title: 'Orders',
    rows: [
      {
        title: 'Linen apron, oat',
        meta: 'Mara Vell · 2 items',
        status: { label: 'Packed', tone: 'success' },
        picture: true,
      },
      {
        title: 'Stoneware mugs, set of 4',
        meta: 'Ines Calder · 1 item',
        status: { label: 'Waiting', tone: 'warning' },
        picture: true,
      },
      { title: 'Walnut serving board', meta: 'Low Orchard Café · 6 items', value: '£312.00', picture: true },
    ],
    action: 'New order',
  },
};

/** What each kind is called, and the words people use for it, for `design_reference`. */
const NAMES: Record<DrawnKind, { aliases: string[]; intent: string }> = {
  player: {
    aliases: ['now playing', 'audio player', 'music player', 'media player', 'podcast player'],
    intent: 'Play one thing: its picture, what it is, how far in, and the controls.',
  },
  card: {
    aliases: ['job card', 'task card', 'item card', 'checklist card', 'work order'],
    intent: 'One thing to get done: what and when, its status, its checklist, who is on it.',
  },
  list_row: {
    aliases: ['list row', 'list item', 'row', 'table row', 'orders list', 'inbox row'],
    intent: 'Many things, one per row, each with what it is and its status or value.',
  },
};

/** The arrangement a language is drawn with: its measured one, or a plain default for a language not yet measured. */
export function arrangementOf(a: Archetype): Arrangement {
  return (
    arrangements[a.id] ?? {
      separation: 'border',
      media: 'beside',
      title: 'medium',
      density: a.tags.density === 'dense' ? 'dense' : a.tags.density === 'airy' ? 'airy' : 'regular',
      primary: 'footer',
      width: 'regular',
    }
  );
}

/** Whether a kind has a template yet (see `drawnKinds`). */
export const isDrawn = (kind: ShowcaseKind | string): kind is DrawnKind =>
  (drawnKinds as readonly string[]).includes(kind);

/** One kind of component, drawn in a language, from the person's content (or the example). */
export function drawShowcase<K extends DrawnKind>(kind: K, a: Archetype, content?: ShowcaseContent[K]): string {
  const c = { a, arr: arrangementOf(a) };
  switch (kind as DrawnKind) {
    case 'player':
      return player(c, (content as ShowcaseContent['player'] | undefined) ?? exampleContent.player);
    case 'card':
      return card(c, (content as ShowcaseContent['card'] | undefined) ?? exampleContent.card);
    case 'list_row':
      return list_row(c, (content as ShowcaseContent['list_row'] | undefined) ?? exampleContent.list_row);
    default:
      throw new DesignError('design/missing-asset', `No showcase template for "${kind}" yet`);
  }
}

/** A language's named patterns: each kind, drawn with the example content. */
export function showcasePatterns(a: Archetype): ShowcasePattern[] {
  return drawnKinds.map((name) => ({ name, ...NAMES[name], html: drawShowcase(name, a) }));
}
