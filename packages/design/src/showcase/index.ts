/**
 * Showcases: someone's key component drawn in a design language (New project's look step; `design_reference`'s
 * named patterns). `drawShowcase(kind, archetype, content)` gives the HTML, to be shown inside a frame that loads
 * the language's kit (`kits/<id>/index.css`) and the library's components (`css/mariachi.css`), with
 * `data-theme="<id>"` and `data-mode` on its root.
 */
import type { Archetype } from '../archetypes/types';
import { arrangements } from './arrangements';
import { calendar, card, chat_thread, dashboard_tile, feed_item, form, list_row, map, player, table } from './kinds';
import { DesignError } from '../errors';
import type { Arrangement, DrawnKind, ShowcaseContent, ShowcaseKind, ShowcasePattern } from './types';
import { drawnKinds } from './types';

export { arrangementsFrom } from './arrange';
export { arrangements } from './arrangements';
export type {
  Arrangement,
  CalendarContent,
  CardContent,
  ChatThreadContent,
  DashboardTileContent,
  DrawnKind,
  FeedItemContent,
  FormContent,
  FormField,
  ListRowContent,
  MapContent,
  PlayerContent,
  ShowcaseContent,
  ShowcaseKind,
  ShowcasePattern,
  Status,
  TableCell,
  TableContent,
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
  calendar: {
    title: 'Studio bookings',
    range: '10–16 March',
    days: [
      { day: 'Mon', date: '10', slots: [{ time: '9:00', label: 'Wheel class' }, { time: '14:00', label: 'Free', free: true }] },
      { day: 'Tue', date: '11', slots: [{ time: '10:00', label: 'Glazing' }, { time: '18:00', label: 'Wheel class' }] },
      {
        day: 'Wed',
        date: '12',
        slots: [
          { time: '9:00', label: 'Wheel class', meta: '6 of 8 booked' },
          { time: '11:30', label: 'Free', free: true },
          { time: '14:00', label: 'Private lesson', meta: 'Ines Calder' },
          { time: '17:30', label: 'Free', free: true },
        ],
      },
      { day: 'Thu', date: '13', slots: [{ time: '9:00', label: 'Open studio' }, { time: '16:00', label: 'Free', free: true }] },
      { day: 'Fri', date: '14', slots: [{ time: '10:00', label: 'Glazing' }] },
      { day: 'Sat', date: '15', slots: [{ time: '10:00', label: 'Family class' }, { time: '13:00', label: 'Taster' }] },
      { day: 'Sun', date: '16', slots: [] },
    ],
    selected: 2,
    action: 'Book a slot',
  },
  chat_thread: {
    title: 'Ines Calder',
    meta: 'Support · replies in a few minutes',
    initials: 'IC',
    myInitials: 'MV',
    status: { label: 'Open', tone: 'info' },
    messages: [
      { from: 'them', text: 'Hi Mara, I can see your order of stoneware mugs. What went wrong?', time: '10:02' },
      { from: 'me', text: 'One arrived with a chipped rim.', time: '10:04' },
      { from: 'me', text: 'Could I swap just that one?', time: '10:04' },
      { from: 'them', text: "Of course. I've sent a new one; it ships tomorrow.", time: '10:06' },
    ],
    suggestions: ['Thank you!', 'Do I send it back?'],
    placeholder: 'Write a reply…',
    action: 'Send',
  },
  table: {
    title: 'Invoices',
    columns: [
      { label: 'Invoice' },
      { label: 'Client', minor: true },
      { label: 'Due', minor: true },
      { label: 'Amount', numeric: true },
      { label: 'Status' },
    ],
    rows: [
      ['INV-0142', 'Low Orchard Café', 'Due 12 Mar', '£1,240.00', { label: 'Paid', tone: 'success' }],
      ['INV-0143', 'Mara Vell', 'Due 18 Mar', '£860.00', { label: 'Sent', tone: 'info' }],
      ['INV-0144', 'Quay Lane Press', 'Due 2 Mar', '£1,970.00', { label: 'Overdue', tone: 'danger' }],
      ['INV-0145', 'Ines Calder', 'Due 28 Mar', '£315.50', { label: 'Draft', tone: 'neutral' }],
    ],
    total: { label: 'Outstanding', value: '£3,145.50' },
    action: 'New invoice',
  },
  form: {
    title: 'Book a table',
    intro: 'We hold tables for 15 minutes.',
    fields: [
      { kind: 'text', label: 'Name', value: 'Mara Vell' },
      { kind: 'email', label: 'Email', value: 'mara@example.com' },
      { kind: 'text', label: 'Date', value: 'Sat 14 March', half: true },
      { kind: 'select', label: 'Time', options: ['18:30', '19:00', '19:30', '20:00'], value: '19:00', half: true },
      { kind: 'choice', label: 'Guests', options: ['1', '2', '3', '4', '5+'], value: '2' },
      { kind: 'check', label: 'Text me a reminder', checked: true },
    ],
    action: 'Request booking',
    secondary: 'Cancel',
    note: "You'll get a confirmation by email.",
  },
  map: {
    title: 'Bakeries nearby',
    query: 'Bakeries',
    places: [
      {
        name: 'Crumb & Kiln',
        meta: 'Bakery · Quay Lane',
        distance: '350 m',
        rating: '4.7',
        status: { label: 'Open', tone: 'success' },
      },
      {
        name: 'Rye and Tide',
        meta: 'Bakery · Mill Street',
        distance: '600 m',
        rating: '4.5',
        status: { label: 'Closes 3 pm', tone: 'warning' },
      },
      {
        name: 'Saltgrass Bread',
        meta: 'Bakery and café · Harbour Street',
        distance: '1.1 km',
        rating: '4.8',
        status: { label: 'Open', tone: 'success' },
      },
    ],
    selected: 0,
    action: 'Directions',
  },
  feed_item: {
    author: 'Ines Calder',
    initials: 'IC',
    meta: '2 h · Allotment club',
    title: 'First broad beans of the year',
    text: 'Sown in November under fleece, and they came through the frost. Anyone else picking yet?',
    tag: { label: 'Harvest', tone: 'success' },
    likes: '24',
    comments: '6',
    action: 'Reply',
  },
  dashboard_tile: {
    label: 'Revenue',
    value: '£18,420',
    change: { label: '12.4%', tone: 'success', direction: 'up' },
    period: 'vs February',
    series: [9.2, 10.1, 9.6, 11.4, 12, 11.2, 13.1, 12.6, 14.2, 15, 14.1, 16.3, 17.2, 18.4],
    breakdown: [
      { label: 'Subscriptions', value: '£12,300', share: 0.67 },
      { label: 'One-off orders', value: '£6,120', share: 0.33 },
    ],
    action: 'View report',
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
  calendar: {
    aliases: ['calendar', 'week view', 'schedule', 'bookings', 'booking calendar', 'appointments', 'agenda', 'timetable'],
    intent: 'A week of bookings: the days, what is booked when, the free slots, and booking one.',
  },
  chat_thread: {
    aliases: ['chat', 'messages', 'conversation', 'support chat', 'direct messages', 'inbox thread', 'messenger'],
    intent: 'A conversation with one person: who, the messages in turn, and the reply box.',
  },
  table: {
    aliases: ['table', 'data table', 'grid', 'spreadsheet', 'invoices', 'records', 'ledger'],
    intent: 'Rows and columns to compare: a name per row, values aligned, a status, and a total.',
  },
  form: {
    aliases: ['form', 'sign-up form', 'sign up', 'booking form', 'registration', 'checkout form', 'contact form'],
    intent: 'A few fields to fill in, a choice or two, and one clear button to send it.',
  },
  map: {
    aliases: ['map', 'store finder', 'nearby', 'locations', 'places', 'map view', 'directions', 'find near me'],
    intent: 'Places on a map near you: the pins, one place open with its details, and how to get there.',
  },
  feed_item: {
    aliases: ['post', 'feed', 'feed post', 'social post', 'update', 'community post', 'timeline item'],
    intent: 'One post in a feed: who and when, what they said, a picture, and the reactions.',
  },
  dashboard_tile: {
    aliases: ['stat', 'KPI', 'metric card', 'stat card', 'dashboard card', 'metric', 'number tile', 'widget'],
    intent: 'One number that matters: its value, how it changed, its trend, and what it is made of.',
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
    case 'calendar':
      return calendar(c, (content as ShowcaseContent['calendar'] | undefined) ?? exampleContent.calendar);
    case 'chat_thread':
      return chat_thread(c, (content as ShowcaseContent['chat_thread'] | undefined) ?? exampleContent.chat_thread);
    case 'table':
      return table(c, (content as ShowcaseContent['table'] | undefined) ?? exampleContent.table);
    case 'form':
      return form(c, (content as ShowcaseContent['form'] | undefined) ?? exampleContent.form);
    case 'map':
      return map(c, (content as ShowcaseContent['map'] | undefined) ?? exampleContent.map);
    case 'feed_item':
      return feed_item(c, (content as ShowcaseContent['feed_item'] | undefined) ?? exampleContent.feed_item);
    case 'dashboard_tile':
      return dashboard_tile(
        c,
        (content as ShowcaseContent['dashboard_tile'] | undefined) ?? exampleContent.dashboard_tile,
      );
    default:
      throw new DesignError('design/missing-asset', `No showcase template for "${kind}" yet`);
  }
}

/** A language's named patterns: each kind, drawn with the example content. */
export function showcasePatterns(a: Archetype): ShowcasePattern[] {
  return drawnKinds.map((name) => ({ name, ...NAMES[name], html: drawShowcase(name, a) }));
}
