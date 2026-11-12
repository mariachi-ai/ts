import type { ArchetypeRecipe } from '../types';

/*
 * Comet's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from a made-up support team ("Tern", the customer desk of
 * a small outdoor-gear shop). They follow the language's real screen patterns: a narrow icon rail
 * with its items in one rounded well, large light split tabs with small grey counts, generous
 * one-line rows (sender, label chip, subject and a grey snippet, the date on the right), the current
 * row on a pale tint with a purple edge, a quiet side panel, a command menu with keys on every row,
 * and an inverted one-line confirmation with Undo. Every icon is Lucide at 1.5px.
 */

// Lucide icons, outlined, 1.5px stroke (1px from 32px up)
const icon = (paths: string, size = 16, label?: string) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${size > 24 ? 1 : 1.5}" stroke-linecap="round" stroke-linejoin="round"${label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"'}>${paths}</svg>`;
const I = {
  inbox:
    '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  pkg: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  pencil:
    '<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/><path d="m15 5 4 4"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  clip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  reply: '<polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>',
  fwd: '<polyline points="15 17 20 12 15 7"/><path d="M4 18v-2a4 4 0 0 1 4-4h12"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  user: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>',
  hours: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  route:
    '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  rules: '<path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/>',
  fields: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h6"/>',
  plug: '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  truck:
    '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
  mapPin:
    '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  ext: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/>',
  cloudOff:
    '<path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193"/><path d="M21.532 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.008 7.008 0 0 0 10 5.07"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  keyboard:
    '<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>',
  coffee:
    '<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
};

// Type: 12 meta, 13 menus, 14 rows, 16 reading, 22 split tabs, 28 page titles
const meta = 'font-size: var(--m-font-size-xs); color: var(--m-color-fg-subtle)';
const small = 'font-size: var(--m-font-size-sm)';
const reading = 'font-size: var(--m-font-size-lg); line-height: var(--m-font-leading-normal)';
const pageTitle =
  'font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-regular); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)';
const hair = 'var(--m-border-width-thin) solid var(--m-color-border-default)';
const nums = 'font-variant-numeric: tabular-nums';
const ellipsis = 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap';
const kbd = (...keys: string[]) => keys.map((k) => `<kbd class="m-kbd">${k}</kbd>`).join(' ');
const avatar = (initials: string, name: string, size = 'sm') =>
  `<span class="m-avatar" data-size="${size}" role="img" aria-label="${name}">${initials}</span>`;
const iconBtn = (paths: string, name: string, size = 'sm') =>
  `<button type="button" class="m-button" data-variant="ghost" data-size="${size}" data-icon-only aria-label="${name}" style="color: var(--m-color-fg-muted)">${icon(paths, 18)}</button>`;
const chip = (tone: string, text: string) => `<span class="m-badge" data-tone="${tone}">${text}</span>`;
// The unread mark: a small blue dot before the sender
const unreadDot = `<span role="img" aria-label="Unread" style="inline-size: 0.5rem; block-size: 0.5rem; border-radius: var(--m-radius-full); background: var(--m-color-info-solid); flex: none"></span>`;
const readSpace = `<span aria-hidden="true" style="inline-size: 0.5rem; flex: none"></span>`;

/* ---------------------------------------------------------------- the frame */

// The icon rail: its items sit in one rounded well; the current one is a raised circle
type RailItem = [keyof typeof I, string];
const railItems: RailItem[] = [
  ['inbox', 'Queue'],
  ['users', 'Customers'],
  ['pkg', 'Orders'],
  ['chart', 'Reports'],
];
const railBtn = (ic: keyof typeof I, name: string, current: boolean) =>
  `<a href="#" aria-label="${name}"${current ? ' aria-current="page"' : ''} style="display: grid; place-items: center; inline-size: 2.25rem; block-size: 2.25rem; border-radius: var(--m-radius-full); color: ${current ? 'var(--m-color-fg-default)' : 'var(--m-color-fg-subtle)'}${current ? '; background: var(--m-color-bg-raised); box-shadow: var(--m-shadow-sm)' : ''}">${icon(I[ic], 18)}</a>`;
const rail = (
  current: string,
) => `<nav aria-label="Main" class="m-stack" data-gap="3" data-align="center" style="inline-size: 3.5rem; flex: none; padding-block: var(--m-space-4); border-inline-end: ${hair}; background: var(--m-color-bg-canvas)">
    <div class="m-stack" data-gap="1" data-align="center" style="padding: var(--m-space-1); border-radius: var(--m-radius-full); background: var(--m-color-bg-sunken)">
      ${railItems.map(([ic, name]) => railBtn(ic, name, name === current)).join('\n      ')}
    </div>
    <div class="m-stack" data-gap="2" data-align="center" style="margin-block-start: auto">
      ${railBtn('help', 'Help and shortcuts', current === 'Help')}
      ${railBtn('gear', 'Settings', current === 'Settings')}
      ${avatar('MV', 'Maren Voss')}
    </div>
  </nav>`;
const frame = (
  current: string,
  body: string,
) => `<div style="display: flex; min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  ${rail(current)}
${body}
</div>`;

// Split tabs: large light labels, small grey counts, no indicator; the current one in full ink
const splits: [string, string?][] = [
  ['Open', '9'],
  ['Returns', '4'],
  ['Wholesale', '3'],
  ['Warranty', '2'],
  ['Shipping', '6'],
  ['Press'],
];
const splitTabs = (
  current: string,
) => `<div class="m-tabs" style="--m-tabs-font-size: var(--m-font-size-xl); --m-tabs-height: 2.75rem; --m-tabs-list-gap: var(--m-space-6); min-inline-size: 0; overflow: hidden">
        <div class="m-tab-list" role="tablist" aria-label="Splits" style="flex-wrap: nowrap; ${ellipsis}">
          ${splits
            .map(
              ([l, n]) =>
                `<button type="button" class="m-tab" role="tab" aria-selected="${l === current}"${l === current ? '' : ' tabindex="-1"'} style="--m-tabs-indicator-width: 0px; flex: none">${l}${n ? ` <span style="font-size: var(--m-font-size-md); color: var(--m-color-fg-subtle); ${nums}">${n}</span>` : ''}</button>`,
            )
            .join('\n          ')}
        </div>
      </div>`;
const listHeader = (
  current: string,
) => `<header class="m-cluster" data-justify="between" style="flex-wrap: nowrap; gap: var(--m-space-4); padding: var(--m-space-5) var(--m-space-6) var(--m-space-3) var(--m-space-4)">
      <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap; min-inline-size: 0">
        ${iconBtn(I.menu, 'Folders')}
        ${splitTabs(current)}
      </div>
      <div class="m-cluster" data-gap="1" style="flex-wrap: nowrap">${iconBtn(I.pencil, 'New conversation')}${iconBtn(I.search, 'Search')}</div>
    </header>`;

// One conversation, one line: sender, label chips, subject and a grey snippet, then the date
type Row = {
  from: string;
  subject: string;
  snippet: string;
  date: string;
  unread?: boolean;
  chips?: [string, string][];
  draft?: boolean;
  clip?: boolean;
  current?: boolean;
  count?: number;
};
const row = (r: Row) => `<li>
          <a href="#" class="m-cluster" data-gap="3"${r.current ? ' aria-current="true"' : ''} style="flex-wrap: nowrap; min-block-size: calc(2.75rem * var(--m-density)); padding-inline: var(--m-space-4) var(--m-space-6); color: var(--m-color-fg-default); text-decoration: none; ${r.current ? 'background: var(--m-color-accent-subtle); box-shadow: inset 3px 0 0 var(--m-color-accent-default)' : ''}">
            ${r.unread ? unreadDot : readSpace}
            <span style="flex: 0 1 12rem; min-inline-size: 6rem; ${ellipsis}; font-weight: ${r.unread ? 'var(--m-font-weight-bold)' : 'var(--m-font-weight-semibold)'}">${r.draft ? `<span style="color: var(--m-color-success-fg)">Draft</span> to ` : ''}${r.from}${r.count ? ` <span style="${meta}; ${nums}">${r.count}</span>` : ''}</span>
            <span class="m-cluster" data-gap="2" style="flex: 1 1 auto; min-inline-size: 0; flex-wrap: nowrap">
              ${(r.chips ?? []).map(([t, l]) => chip(t, l)).join('')}
              <span style="${ellipsis}; min-inline-size: 0"><span${r.unread ? ' style="font-weight: var(--m-font-weight-medium)"' : ''}>${r.subject}</span> <span style="color: var(--m-color-fg-subtle)">${r.snippet}</span></span>
            </span>
            ${r.clip ? `<span style="color: var(--m-color-fg-subtle); display: inline-flex; flex: none">${icon(I.clip, 14)}</span>` : ''}
            <span style="${meta}; ${nums}; flex: none; min-inline-size: 3.25rem; text-align: end">${r.date}</span>
          </a>
        </li>`;
const group = (labelText: string) =>
  `<li style="padding: var(--m-space-5) var(--m-space-6) var(--m-space-2) calc(var(--m-space-4) + 0.5rem + var(--m-space-3)); ${meta}">${labelText}</li>`;
const list = (
  rows: string,
) => `<ul class="m-stack" data-gap="0" style="list-style: none; padding: 0; ${small}; font-size: var(--m-font-size-md)">
        ${rows}
      </ul>`;

// The inverted one-line confirmation, bottom left, with Undo and its key
const undoToast = (
  text: string,
) => `<div class="m-toast-region" data-position="bottom-start" aria-live="polite" style="inset-inline-start: calc(3.5rem + var(--m-toast-offset))">
        <div class="m-toast" role="status" style="align-items: center">
          <div class="m-cluster" data-gap="3" data-justify="between" style="flex-wrap: nowrap">
            <p class="m-toast-title" style="font-weight: var(--m-font-weight-regular)">${text}</p>
            <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="--m-button-ghost-fg: var(--m-color-fg-inverse); --m-button-ghost-hover-bg: transparent; text-decoration: underline; text-underline-offset: 3px">Undo <kbd class="m-kbd" style="--m-kbd-bg: transparent; --m-kbd-fg: var(--m-color-fg-inverse)">Z</kbd></button>
          </div>
        </div>
      </div>`;

/* ---------------------------------------------------------------- dashboard */

// The queue home: split tabs over the one-line list, with a quiet panel of this week's figures
const openRows: Row[] = [
  {
    from: 'Ilse Brandt',
    chips: [['danger', 'urgent']],
    subject: 'Stove arrived with a cracked burner',
    snippet: 'Hi, the box looked fine but when I opened it the burner ring was split along…',
    date: '9:41 AM',
    unread: true,
    clip: true,
    current: true,
  },
  {
    from: 'Joaquin Reyes',
    subject: 'Can I still change the size on order 20417?',
    snippet: 'I ordered the medium shell but the chart says I need a large. It hasn’t shipped…',
    date: '9:12 AM',
    unread: true,
  },
  {
    from: 'Halvorsen Outfitters',
    chips: [['accent', 'wholesale']],
    subject: 'Spring restock: 40 units of the trail pack',
    snippet: 'Same terms as last season if possible. We’d like delivery before March 3.',
    date: '8:55 AM',
    count: 3,
  },
  {
    from: 'Ada Okafor',
    draft: true,
    subject: 'Re: Tent pole replacement',
    snippet: 'Thanks for the photos. A new pole set is on its way and should reach you by…',
    date: '8:20 AM',
  },
  {
    from: 'Priya Raman',
    chips: [['warning', 'return']],
    subject: 'Return label not working',
    snippet: 'The carrier’s site says the code has expired. Could you send a fresh one?',
    date: '7:48 AM',
    unread: true,
  },
];
const earlierRows: Row[] = [
  {
    from: 'Tomasz Wierzba',
    chips: [['success', 'resolved']],
    subject: 'Thanks, the replacement fits',
    snippet: 'All good now. Out on the ridge this weekend with it.',
    date: 'Tue',
  },
  {
    from: 'Noor Haddad',
    subject: 'Gift card balance',
    snippet: 'I have a card from last winter and can’t see the balance anywhere in my account…',
    date: 'Tue',
    clip: true,
  },
  {
    from: 'Lena, Marco',
    chips: [['info', 'shipping']],
    subject: 'Parcel stuck in the depot since Friday',
    snippet: 'Tracking hasn’t moved in four days. Is there anything you can do from your side?',
    date: 'Mon',
    count: 2,
  },
  {
    from: 'Fjell & Co',
    chips: [['accent', 'wholesale']],
    subject: 'Invoice 3318 question',
    snippet: 'The second line shows the old unit price. Could you reissue it?',
    date: 'Mon',
  },
];

// Conversations answered per day this week: one purple bar each
const days: [string, number][] = [
  ['Mon', 42],
  ['Tue', 51],
  ['Wed', 38],
  ['Thu', 57],
  ['Fri', 46],
];
const bars = `<svg viewBox="0 0 200 80" width="100%" preserveAspectRatio="none" style="display: block; block-size: 5rem" role="img" aria-label="Conversations answered per day this week: 42, 51, 38, 57 and 46">
              ${days.map(([, v], i) => `<rect x="${8 + i * 40}" y="${80 - v * 1.3}" width="24" height="${v * 1.3}" rx="3" style="fill: var(--m-color-accent-default)${i === 3 ? '' : '; opacity: 0.45'}"/>`).join('')}
            </svg>`;
const figure = (value: string, labelText: string) =>
  `<div class="m-stack" data-gap="1"><span style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-regular); letter-spacing: var(--m-font-tracking-tight); ${nums}">${value}</span><span style="${meta}">${labelText}</span></div>`;
const shortcut = (text: string, keys: string[]) =>
  `<li class="m-cluster" data-justify="between" style="flex-wrap: nowrap"><span class="m-muted">${text}</span><span>${kbd(...keys)}</span></li>`;

const sidePanel = (content: string) =>
  `<aside class="m-stack" data-gap="6" style="flex: 1 1 19rem; max-inline-size: 100%; min-inline-size: 15rem; padding: var(--m-space-6); background: var(--m-color-bg-sunken); border-inline-start: ${hair}">
${content}
    </aside>`;

const dashboard = frame(
  'Queue',
  `  <main class="m-stack" data-gap="0" style="flex: 1 1 0; min-inline-size: 0; position: relative">
    ${listHeader('Open')}
    <div style="display: flex; flex: 1; flex-wrap: wrap">
      <div style="flex: 999 1 32rem; min-inline-size: 0; padding-block-end: var(--m-space-16)">
      ${list(`${openRows.map(row).join('\n        ')}
        ${group('Earlier this week')}
        ${earlierRows.map(row).join('\n        ')}`)}
      </div>
      ${sidePanel(`      <div class="m-stack" data-gap="1">
        <h2 style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium)">This week</h2>
        <p style="${meta}">Nov 10 – Nov 14 · Tern customer desk</p>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 6rem; --m-layout-grid-gap: var(--m-space-5)">
        ${figure('234', 'Answered')}
        ${figure('38m', 'Median first reply')}
        ${figure('24', 'Waiting on us')}
        ${figure('96%', 'Closed in one reply')}
      </div>
      <section class="m-stack" data-gap="2" aria-labelledby="cm-days">
        <h3 id="cm-days" style="${small}; font-weight: var(--m-font-weight-medium)">Answered per day</h3>
        ${bars}
        <div class="m-cluster" data-justify="between" style="${meta}; padding-inline: var(--m-space-1)">${days.map(([d]) => `<span>${d}</span>`).join('')}</div>
      </section>
      <section class="m-stack" data-gap="3" aria-labelledby="cm-keys" style="border-block-start: ${hair}; padding-block-start: var(--m-space-5)">
        <h3 id="cm-keys" style="${small}; font-weight: var(--m-font-weight-medium)">Keys for this list</h3>
        <ul class="m-stack" data-gap="2" style="list-style: none; padding: 0; ${small}">
          ${shortcut('Open', ['↵'])}
          ${shortcut('Close conversation', ['C'])}
          ${shortcut('Next split', ['Tab'])}
          ${shortcut('Any command', ['⌘', 'K'])}
        </ul>
      </section>`)}
    </div>
    ${undoToast('Closed 2 conversations')}
  </main>`,
);

/* ---------------------------------------------------------------- list and detail */

// An open conversation: earlier messages collapse to one line, the latest reads in full, the reply
// composer sits below it, and the customer's panel on the right
const collapsed = (from: string, text: string, date: string) =>
  `<li class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding-block: var(--m-space-3); border-block-end: ${hair}">
            <span style="flex: 0 0 8rem; font-weight: var(--m-font-weight-medium); ${ellipsis}">${from}</span>
            <span style="flex: 1; min-inline-size: 0; color: var(--m-color-fg-subtle); ${ellipsis}">${text}</span>
            <span style="${meta}; ${nums}; flex: none">${date}</span>
          </li>`;
const orderLine = (id: string, what: string, state: string, tone: string) =>
  `<li class="m-stack" data-gap="1" style="padding-block: var(--m-space-2)"><span class="m-cluster" data-justify="between"><span style="${nums}">${id}</span>${chip(tone, state)}</span><span style="${meta}">${what}</span></li>`;

const listDetail = frame(
  'Queue',
  `  <main style="display: flex; flex: 1 1 0; min-inline-size: 0; flex-wrap: wrap">
    <div class="m-stack" data-gap="0" style="flex: 999 1 34rem; min-inline-size: 0">
      <header class="m-cluster" data-justify="between" style="padding: var(--m-space-4) var(--m-space-6) var(--m-space-2) var(--m-space-4)">
        <div class="m-cluster" data-gap="1">
          <a class="m-button" data-variant="ghost" data-size="sm" href="#" style="color: var(--m-color-fg-muted)">${icon(I.back, 16)} Open <span style="${nums}">9</span></a>
          <span style="${meta}; ${nums}">1 of 9</span>
        </div>
        <div class="m-cluster" data-gap="1">
          ${iconBtn(I.check, 'Close conversation (C)')}
          ${iconBtn(I.clock, 'Snooze until… (S)')}
          ${iconBtn(I.tag, 'Add a label (L)')}
          ${iconBtn(I.more, 'More')}
        </div>
      </header>
      <article class="m-stack" data-gap="5" style="padding: var(--m-space-4) var(--m-space-8) var(--m-space-12); max-inline-size: 52rem">
        <div class="m-stack" data-gap="2">
          <h1 style="${pageTitle}; font-size: var(--m-font-size-xl)">Stove arrived with a cracked burner</h1>
          <div class="m-cluster" data-gap="2">${chip('danger', 'urgent')}${chip('warning', 'return')}<span style="${meta}">Order 20391 · 3 messages</span></div>
        </div>
        <ul class="m-stack" data-gap="0" style="list-style: none; padding: 0; ${small}; font-size: var(--m-font-size-md)">
          ${collapsed('Ilse Brandt', 'Hi, the box looked fine but when I opened it the burner ring was split along one side.', 'Nov 12')}
          ${collapsed('Ada Okafor', 'Sorry to hear that. Could you send a photo of the ring and the label on the box?', 'Nov 12')}
        </ul>
        <section class="m-stack" data-gap="4" aria-label="Latest message">
          <div class="m-cluster" data-justify="between" data-align="start">
            <div class="m-cluster" data-gap="3">
              ${avatar('IB', 'Ilse Brandt', 'md')}
              <div class="m-stack" data-gap="0"><span style="font-weight: var(--m-font-weight-medium)">Ilse Brandt</span><span style="${meta}">to Tern Support</span></div>
            </div>
            <span style="${meta}; ${nums}">9:41 AM</span>
          </div>
          <div class="m-stack" data-gap="3" style="${reading}; max-inline-size: 40rem">
            <p>Here are the photos. The crack runs from the valve to the outer edge, and the label on the box says batch 0921.</p>
            <p>I’d rather have a replacement than a refund if you have one in stock. We leave for the coast on the 21st.</p>
            <p class="m-muted">Ilse</p>
          </div>
          <div class="m-cluster" data-gap="2">
            <span class="m-badge" style="block-size: 2rem; padding-inline: var(--m-space-3)">${icon(I.clip, 14)} burner-ring.jpg <span style="${meta}">1.8 MB</span></span>
            <span class="m-badge" style="block-size: 2rem; padding-inline: var(--m-space-3)">${icon(I.clip, 14)} box-label.jpg <span style="${meta}">920 KB</span></span>
          </div>
        </section>
        <form class="m-card" aria-label="Reply" style="--m-card-bg: var(--m-color-bg-surface); box-shadow: var(--m-shadow-md); border-color: transparent">
          <div class="m-card-body m-stack" data-gap="3">
            <div class="m-cluster" data-gap="2" style="${small}"><span class="m-subtle">To</span><span>Ilse Brandt</span><span class="m-subtle" style="margin-inline-start: auto">${kbd('⌘', '⇧', 'C')} Cc</span></div>
            <textarea class="m-input" rows="4" aria-label="Message" style="border: 0; padding: 0; box-shadow: none; background: transparent; ${reading}; resize: none">Hi Ilse, thanks for the photos. A replacement stove from batch 0944 leaves today by express and will reach you on the 18th. Keep the cracked one; there’s nothing to send back.</textarea>
            <div class="m-cluster" data-justify="between">
              <div class="m-cluster" data-gap="2">
                <button type="button" class="m-button" data-variant="primary">Send</button>
                <span style="${meta}">${kbd('⌘', '↵')}</span>
              </div>
              <div class="m-cluster" data-gap="1">${iconBtn(I.clip, 'Attach a file')}${iconBtn(I.fwd, 'Forward')}${iconBtn(I.more, 'More')}</div>
            </div>
          </div>
        </form>
      </article>
    </div>
    ${sidePanel(`      <div class="m-stack" data-gap="3">
        ${avatar('IB', 'Ilse Brandt', 'lg')}
        <div class="m-stack" data-gap="1">
          <h2 style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium)">Ilse Brandt</h2>
          <span class="m-muted" style="${small}">ilse.brandt@fjordpost.example</span>
          <span class="m-cluster" data-gap="1" style="${meta}">${icon(I.mapPin, 12)} Bergen · 10:41 AM there</span>
        </div>
      </div>
      <section class="m-stack" data-gap="1" aria-labelledby="cm-orders" style="${small}">
        <h3 id="cm-orders" class="m-cluster" data-gap="2" style="${small}; font-weight: var(--m-font-weight-medium)">${icon(I.pkg, 14)} Orders</h3>
        <ul class="m-stack" data-gap="0" style="list-style: none; padding: 0">
          ${orderLine('20391', 'Two-burner stove · Nov 8', 'delivered', 'success')}
          ${orderLine('19866', 'Insulated mugs ×2 · Sep 30', 'delivered', 'success')}
          ${orderLine('20402', 'Fuel canister ×4 · Nov 9', 'in transit', 'info')}
        </ul>
      </section>
      <section class="m-stack" data-gap="2" aria-labelledby="cm-before" style="${small}">
        <h3 id="cm-before" class="m-cluster" data-gap="2" style="${small}; font-weight: var(--m-font-weight-medium)">${icon(I.mail, 14)} Earlier conversations</h3>
        <a href="#" class="m-muted" style="text-decoration: none">Mug lid doesn’t seal · Oct 4</a>
        <a href="#" class="m-muted" style="text-decoration: none">Gift wrapping for the mugs · Sep 29</a>
      </section>
      <a href="#" class="m-cluster" data-gap="1" style="${small}; color: var(--m-color-accent-text); text-decoration: none">Open in Customers ${icon(I.ext, 14)}</a>`)}
  </main>`,
);

/* ---------------------------------------------------------------- onboarding */

// The command menu: a large input, then rows with an icon, the command and its keys
const cmdItem = (paths: string, text: string, keys: string[], active = false) =>
  `<button type="button" class="m-menu-item" role="option" aria-selected="${active}"${active ? ' style="background: var(--m-popover-item-hover-bg)"' : ''}>${icon(paths, 16)} <span style="flex: 1; text-align: start">${text}</span> <span class="m-menu-shortcut">${kbd(...keys)}</span></button>`;
const commandMenu = (
  query: string,
  items: string,
) => `<div class="m-popover" data-static role="dialog" aria-label="Command menu" style="max-inline-size: none; inline-size: 100%; padding: 0; box-shadow: var(--m-shadow-overlay)">
          <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding: var(--m-space-4) var(--m-space-5); border-block-end: ${hair}">
            <span class="m-subtle" style="display: inline-flex">${icon(I.search, 18)}</span>
            <input class="m-input" type="text" value="${query}" placeholder="Type a command…" aria-label="Command" style="border: 0; padding: 0; background: transparent; font-size: var(--m-font-size-lg); block-size: auto; box-shadow: none">
          </div>
          <div class="m-menu" role="listbox" aria-label="Commands" style="padding: var(--m-space-2)">
            ${items}
          </div>
        </div>`;

const onboarding = `<div class="m-stack" data-align="center" style="min-block-size: 100vh; background: var(--m-color-bg-sunken); padding: var(--m-space-6) var(--m-space-4) var(--m-space-16)">
  <div class="m-cluster" data-justify="between" style="inline-size: 100%; max-inline-size: 64rem">
    <span style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-tight)">tern</span>
    <span style="${meta}; ${nums}">Step 2 of 4</span>
  </div>
  <div class="m-container" data-size="sm" style="--m-layout-container-max-sm: 36rem; margin-block-start: clamp(var(--m-space-8), 9vh, var(--m-space-16))">
    <div class="m-stack" data-gap="8">
      <div class="m-stack" data-gap="3" style="text-align: center">
        <h1 style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-regular); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)">Work the queue from the keyboard</h1>
        <p class="m-muted" style="${reading}">Press ${kbd('⌘', 'K')} anywhere to find any action. Each command shows its own key, so next time you can skip the menu.</p>
      </div>
      ${commandMenu(
        'clo',
        `${cmdItem(I.check, 'Close conversation', ['C'], true)}
            ${cmdItem(I.checkCircle, 'Close and go to next', ['⇧', 'C'])}
            ${cmdItem(I.clock, 'Snooze until tomorrow', ['S'])}
            ${cmdItem(I.tag, 'Add the closed label', ['L'])}`,
      )}
      <p style="${meta}; text-align: center">Try it: press ${kbd('C')} to close the conversation you’re on.</p>
      <div class="m-stack" data-gap="3" data-align="center">
        <button type="button" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%; max-inline-size: 20rem">Continue</button>
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="color: var(--m-color-fg-muted)">${icon(I.left, 14)} Back</button>
      </div>
    </div>
  </div>
</div>`;

/* ---------------------------------------------------------------- settings */

// Settings: a quiet section list beside a 44rem column of hairline rows, the control on the right
type NavItem = [keyof typeof I, string];
const settingsNav = (current: string) => {
  const link = ([ic, l]: NavItem) =>
    `<li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${icon(I[ic], 16)} ${l}</a></li>`;
  const section = (heading: string, items: NavItem[]) => `<div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">${heading}</h2>
      <ul>
        ${items.map(link).join('\n        ')}
      </ul>
    </div>`;
  return `<nav class="m-sidebar" aria-label="Settings" style="flex: 0 1 15rem; min-inline-size: 13rem">
    <h1 style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-regular); padding: var(--m-space-2) var(--m-space-3) var(--m-space-3)">Settings</h1>
    ${section('You', [
      ['user', 'Profile'],
      ['hours', 'Working hours'],
      ['bell', 'Notifications'],
    ])}
    ${section('Tern customer desk', [
      ['rules', 'Queue rules'],
      ['route', 'Routing'],
      ['fields', 'Customer fields'],
      ['plug', 'Integrations'],
      ['card', 'Plan'],
    ])}
  </nav>`;
};
const settingRow = (title: string, help: string, control: string) =>
  `<div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; gap: var(--m-space-6); padding-block: var(--m-space-4); border-block-end: ${hair}">
            <div class="m-stack" data-gap="1"><span>${title}</span><span style="${meta}; font-size: var(--m-font-size-sm)">${help}</span></div>
            <div style="flex: none">${control}</div>
          </div>`;
const sw = (name: string, on: boolean) =>
  `<input class="m-switch" type="checkbox" role="switch" aria-label="${name}"${on ? ' checked' : ''}>`;
const radio = (name: string, value: string, labelText: string, help: string, on = false) =>
  `<label class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap; padding-block: var(--m-space-2)"><input class="m-radio" type="radio" name="${name}" value="${value}"${on ? ' checked' : ''} style="margin-block-start: 0.125rem"><span class="m-stack" data-gap="0"><span>${labelText}</span><span style="${meta}; font-size: var(--m-font-size-sm)">${help}</span></span></label>`;

const check = (labelText: string, help: string, on = false) =>
  `<label class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap; padding-block: var(--m-space-2)"><input class="m-checkbox" type="checkbox"${on ? ' checked' : ''} style="margin-block-start: 0.125rem"><span class="m-stack" data-gap="0"><span>${labelText}</span><span style="${meta}; font-size: var(--m-font-size-sm)">${help}</span></span></label>`;

const settings = frame(
  'Settings',
  `  <div style="display: flex; flex: 1 1 0; min-inline-size: 0; flex-wrap: wrap">
  ${settingsNav('Notifications')}
  <main style="flex: 999 1 30rem; min-inline-size: 0; padding: var(--m-space-8) var(--m-space-6) var(--m-space-16)">
    <div class="m-container" data-size="md" style="margin-inline: 0">
      <div class="m-stack" data-gap="10">
        <div class="m-stack" data-gap="2">
          <h2 style="${pageTitle}">Notifications</h2>
          <p class="m-muted" style="font-size: var(--m-font-size-md)">Choose what reaches you outside the queue. Changes save as you make them.</p>
        </div>
        <section class="m-stack" data-gap="0" aria-labelledby="cm-desktop">
          <h3 id="cm-desktop" style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium); padding-block-end: var(--m-space-2); border-block-end: ${hair}">On this computer</h3>
          ${settingRow('New conversations in Open', 'A banner for each new message that lands in your Open split.', sw('New conversations in Open', true))}
          ${settingRow('Replies to conversations you own', 'Only when the customer writes back, not when a teammate does.', sw('Replies to conversations you own', true))}
          ${settingRow('Wholesale orders', 'Any message from an account on the wholesale list.', sw('Wholesale orders', false))}
          ${settingRow('Sound', 'Played with each banner.', `<select class="m-select" data-size="sm" aria-label="Sound" style="inline-size: 9rem"><option>Soft click</option><option>Chime</option><option>None</option></select>`)}
        </section>
        <section class="m-stack" data-gap="2" aria-labelledby="cm-digest">
          <h3 id="cm-digest" style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium); padding-block-end: var(--m-space-2); border-block-end: ${hair}">Email summary</h3>
          <div role="radiogroup" aria-labelledby="cm-digest" class="m-stack" data-gap="0">
            ${radio('digest', 'daily', 'Every weekday at 8:00 AM', 'What’s waiting, what’s overdue and what closed yesterday.', true)}
            ${radio('digest', 'weekly', 'Mondays only', 'The week before in one message.')}
            ${radio('digest', 'never', 'Never', 'You’ll still get messages about your account.')}
          </div>
        </section>
        <section class="m-stack" data-gap="2" aria-labelledby="cm-quiet">
          <h3 id="cm-quiet" style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium); padding-block-end: var(--m-space-2); border-block-end: ${hair}">Quiet hours</h3>
          ${check('Pause banners outside working hours', 'Mon–Fri, 8:30 AM – 5:30 PM, Oslo time.', true)}
          ${check('Mute weekends', 'Nothing from Friday evening to Monday morning.', true)}
          ${check('Let urgent through', 'Conversations labelled urgent still show a banner.')}
        </section>
        <p style="${meta}">Every setting here is also a command: ${kbd('⌘', 'K')}</p>
      </div>
    </div>
  </main>
  </div>`,
);

/* ---------------------------------------------------------------- empty state */

const emptyState = frame(
  'Queue',
  `  <main class="m-stack" data-gap="0" style="flex: 1 1 0; min-inline-size: 0">
    ${listHeader('Returns')}
    <div class="m-stack" data-gap="5" data-align="center" data-justify="center" style="flex: 1; padding: var(--m-space-16) var(--m-space-6); text-align: center; background: linear-gradient(180deg, var(--m-color-bg-canvas), var(--m-color-brand-subtle))">
      <span class="m-subtle" style="display: inline-flex">${icon(I.coffee, 48)}</span>
      <div class="m-stack" data-gap="2" data-align="center">
        <h2 style="${pageTitle}">No returns waiting</h2>
        <p class="m-muted" style="${reading}; max-inline-size: 26rem">New return requests land here as they arrive. The last one closed at 11:20 AM.</p>
      </div>
      <div class="m-cluster" data-gap="2" data-justify="center">
        <button type="button" class="m-button" data-variant="primary">${icon(I.arrowRight, 16)} Go to Open <span style="${nums}">9</span></button>
        <button type="button" class="m-button">${icon(I.pencil, 16)} New conversation</button>
      </div>
      <p style="${meta}">${kbd('Tab')} next split · ${kbd('⌘', 'K')} any command</p>
    </div>
  </main>`,
);

/* ---------------------------------------------------------------- pricing */

// The public page: a plain white bar, a light 39px title, a two-way switch with a saving chip, three
// joined plan columns (the middle one tinted, with a charcoal cap), a comparison table and questions
const tick = `<span style="color: var(--m-color-fg-default); display: inline-flex; flex: none">${icon(I.check, 16)}</span>`;
const plan = (
  name: string,
  price: string,
  cadence: string,
  intro: string,
  features: string[],
  cta: string,
  picked = false,
  position: 'start' | 'mid' | 'end' = 'mid',
) => `<section class="m-stack" data-gap="6" aria-labelledby="cm-plan-${name.toLowerCase()}" style="padding: var(--m-space-6); border: ${picked ? 'var(--m-border-width-thin) solid var(--m-color-accent-default)' : hair}; ${position === 'start' ? 'border-start-start-radius: var(--m-radius-md); border-end-start-radius: var(--m-radius-md)' : position === 'end' ? 'border-start-end-radius: var(--m-radius-md); border-end-end-radius: var(--m-radius-md)' : ''}; background: ${picked ? 'var(--m-color-accent-subtle)' : 'var(--m-color-bg-surface)'}; position: relative">
            ${picked ? `<p style="position: absolute; inset-inline: -1px; inset-block-end: 100%; padding-block: var(--m-space-2); text-align: center; ${small}; background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse); border-start-start-radius: var(--m-radius-md); border-start-end-radius: var(--m-radius-md)">Most teams pick this</p>` : ''}
            <div class="m-stack" data-gap="3">
              <h2 id="cm-plan-${name.toLowerCase()}" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-tight)">${name}</h2>
              <div class="m-stack" data-gap="1"><span style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-medium); ${nums}">${price}</span><span class="m-muted" style="${small}">${cadence}</span></div>
            </div>
            <a class="m-button" data-variant="${picked ? 'primary' : 'ghost'}" data-size="lg" href="#" style="block-size: 3rem; border-radius: var(--m-radius-lg); font-size: var(--m-font-size-lg)${picked ? '' : '; color: var(--m-color-accent-text); box-shadow: inset 0 0 0 1px var(--m-color-accent-default)'}">${cta}</a>
            <div class="m-stack" data-gap="3">
              <span style="font-weight: var(--m-font-weight-semibold)">${intro}</span>
              <ul class="m-stack" data-gap="3" style="list-style: none; padding: 0; ${small}">
                ${features.map((f) => `<li class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${tick} ${f}</li>`).join('\n                ')}
              </ul>
            </div>
          </section>`;
const yes = `<span role="img" aria-label="Included" style="display: inline-flex">${icon(I.check, 16)}</span>`;
const no = `<span class="m-subtle" aria-label="Not included">–</span>`;
const compareRow = (feature: string, cells: string[]) =>
  `<tr><th scope="row" style="font-weight: var(--m-font-weight-regular)">${feature}</th>${cells.map((c) => `<td>${c === 'y' ? yes : c === 'n' ? no : c}</td>`).join('')}</tr>`;
const faq = (q: string, a: string, open = false) =>
  `<details class="m-accordion-item"${open ? ' open' : ''}><summary>${q}</summary><div class="m-accordion-content"><p class="m-muted">${a}</p></div></details>`;

const pricing = `<div style="background: var(--m-color-bg-canvas); min-block-size: 100vh">
  <header class="m-navbar" data-sticky>
    <a class="m-navbar-brand" href="#" style="letter-spacing: var(--m-font-tracking-tight)">tern</a>
    <nav class="m-navbar-nav" aria-label="Main">
      <a class="m-navbar-link" href="#">Product ${icon(I.down, 14)}</a>
      <a class="m-navbar-link" href="#">Customers</a>
      <a class="m-navbar-link" href="#">Changelog</a>
      <a class="m-navbar-link" href="#" aria-current="page">Pricing</a>
      <a class="m-navbar-link" href="#">Help</a>
    </nav>
    <div class="m-navbar-actions">
      <a class="m-button" data-variant="ghost" href="#" style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-regular)">Log in</a>
      <a class="m-button" data-variant="primary" href="#" style="block-size: 2.25rem">Start free</a>
    </div>
  </header>
  <main style="background: linear-gradient(0deg, var(--m-color-bg-canvas) 70%, var(--m-color-bg-sunken) 100%)">
    <div class="m-container" style="--m-layout-container-max-lg: 60rem; padding-block: var(--m-space-16) var(--m-space-16)">
      <div class="m-stack" data-gap="10" data-align="center">
        <div class="m-stack" data-gap="3" data-align="center" style="text-align: center">
          <h1 style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-regular); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)">Pick a plan for your desk</h1>
          <p class="m-muted" style="${reading}">Every plan answers from the keyboard. Add seats whenever the team grows.</p>
        </div>
        <div class="m-tabs" data-variant="pill" style="--m-tabs-height: 2.125rem; --m-tabs-padding-x: var(--m-space-2); --m-tabs-font-size: var(--m-font-size-xs); --m-tabs-list-gap: var(--m-space-1)"><div class="m-tab-list" role="tablist" aria-label="Billing" style="box-shadow: inset 0 0 0 1px var(--m-color-border-default)">
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Monthly</button>
          <button type="button" class="m-tab" role="tab" aria-selected="true" style="--m-tabs-pill-active-bg: var(--m-color-bg-inverse); --m-tabs-active-fg: var(--m-color-fg-inverse)">Yearly <span class="m-badge" data-tone="accent" style="block-size: 1.125rem; font-size: var(--m-font-size-xs)">Save 15%</span></button>
        </div></div>
        <div class="m-grid" style="--m-layout-grid-min: 16rem; --m-layout-grid-gap: var(--m-space-10) 0; inline-size: 100%; margin-block-start: var(--m-space-6)">
          ${plan('Personal', '$12', 'per seat / month, billed yearly', 'Made for one:', ['One shared address', 'Splits and labels', 'Command menu and keys', 'Customer panel'], 'Start free', false, 'start')}
          ${plan('Team', '$22', 'per seat / month, billed yearly', 'On top of Personal:', ['Unlimited addresses', 'Routing and owners', 'Shared drafts and notes', 'Weekly reports', 'Order lookups'], 'Start a trial', true)}
          ${plan('Organization', 'Talk to us', 'yearly contract', 'On top of Team:', ['Single sign-on', 'Audit history', 'Data kept in your region', 'A named contact'], 'Contact us', false, 'end')}
        </div>
        <a class="m-button" data-variant="ghost" data-size="lg" href="#" style="color: var(--m-color-accent-text); font-size: var(--m-font-size-lg)">Compare every feature ${icon(I.down, 16)}</a>
      </div>
      <section class="m-stack" data-gap="4" aria-labelledby="cm-compare" style="margin-block-start: var(--m-space-12)">
        <h2 id="cm-compare" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-regular); letter-spacing: var(--m-font-tracking-tight)">Compare plans</h2>
        <div class="m-table-wrap">
          <table class="m-table" style="--m-table-border-color: var(--m-color-border-default); --m-table-cell-padding-y: var(--m-space-3)">
            <thead><tr><th scope="col">Feature</th><th scope="col">Personal</th><th scope="col">Team</th><th scope="col">Organization</th></tr></thead>
            <tbody>
              ${compareRow('Seats', ['1', 'Unlimited', 'Unlimited'])}
              ${compareRow('Shared addresses', ['1', 'Unlimited', 'Unlimited'])}
              ${compareRow('Splits', ['6', 'Unlimited', 'Unlimited'])}
              ${compareRow('Routing and owners', ['n', 'y', 'y'])}
              ${compareRow('Order lookups', ['n', 'y', 'y'])}
              ${compareRow('Single sign-on', ['n', 'n', 'y'])}
            </tbody>
          </table>
        </div>
      </section>
      <section class="m-stack" data-gap="4" aria-labelledby="cm-faq" style="margin-block-start: var(--m-space-12)">
        <h2 id="cm-faq" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-regular); letter-spacing: var(--m-font-tracking-tight)">Questions</h2>
        <div class="m-accordion">
          ${faq('Can I try Team before paying?', 'Yes. Every new desk gets 14 days of Team. Nothing is charged until you add a card.', true)}
          ${faq('What counts as a seat?', 'Anyone who can reply. People who only read reports are free.')}
          ${faq('Can we switch plans later?', 'Any time. Moving up takes effect at once; moving down takes effect at the next renewal.')}
        </div>
      </section>
    </div>
  </main>
</div>`;

/* ---------------------------------------------------------------- errors */

const fullPage = (paths: string, code: string, title: string, sentence: string, actions: string) =>
  `<section class="m-card" aria-label="${code}" style="--m-card-bg: var(--m-color-bg-canvas)">
          <div class="m-card-body m-stack" data-gap="3" data-align="center" style="padding-block: var(--m-space-10); text-align: center">
            <span class="m-subtle" style="display: inline-flex">${icon(paths, 32)}</span>
            <span style="font-family: var(--m-font-family-mono); ${meta}">${code}</span>
            <h3 style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-regular)">${title}</h3>
            <p class="m-muted" style="${small}; max-inline-size: 22rem">${sentence}</p>
            <div class="m-cluster" data-gap="2" data-justify="center">${actions}</div>
          </div>
        </section>`;

const errors = frame(
  'Queue',
  `  <main class="m-stack" data-gap="0" style="flex: 1 1 0; min-inline-size: 0">
    <div class="m-container" data-size="md" style="--m-layout-container-max-md: 52rem; padding-block: var(--m-space-8) var(--m-space-16)">
      <div class="m-stack" data-gap="10">
        <h1 style="${pageTitle}">When something goes wrong</h1>
        <section class="m-stack" data-gap="3" aria-labelledby="cm-form-errors">
          <h2 id="cm-form-errors" style="${meta}">In a form</h2>
          <div class="m-dialog" data-static data-size="md" role="dialog" aria-modal="false" aria-labelledby="cm-new-title">
            <header class="m-dialog-header">
              <h3 class="m-dialog-title" id="cm-new-title">New conversation</h3>
              ${iconBtn(I.x, 'Close')}
            </header>
            <div class="m-dialog-body m-stack" data-gap="4">
              <div class="m-alert" data-tone="danger" role="alert">
                <span class="m-alert-icon">${icon(I.alert, 16)}</span>
                <div class="m-alert-content">
                  <p class="m-alert-title">2 things to fix before sending</p>
                  <p class="m-alert-body">Nothing was sent. Your text is kept as a draft.</p>
                </div>
              </div>
              <div class="m-field">
                <label class="m-field-label" for="cm-to">To</label>
                <input class="m-input" id="cm-to" type="text" value="joaquin.reyes@fieldmail" aria-invalid="true" aria-describedby="cm-to-error">
                <p class="m-field-error" id="cm-to-error">This address has no ending. Did you mean joaquin.reyes@fieldmail.example?</p>
              </div>
              <div class="m-field">
                <label class="m-field-label" for="cm-subject">Subject</label>
                <input class="m-input" id="cm-subject" type="text" value="" placeholder="What it’s about" aria-invalid="true" aria-describedby="cm-subject-error">
                <p class="m-field-error" id="cm-subject-error">Add a subject so the customer can find it later.</p>
              </div>
              <div class="m-field">
                <label class="m-field-label" for="cm-body">Message</label>
                <textarea class="m-input" id="cm-body" rows="3">Your size swap is done: the large shell ships today.</textarea>
              </div>
            </div>
            <footer class="m-dialog-footer">
              <span style="${meta}; margin-inline-end: auto">${kbd('⌘', '↵')} to send</span>
              <button type="button" class="m-button" data-variant="ghost">Save draft</button>
              <button type="button" class="m-button" data-variant="primary">Send</button>
            </footer>
          </div>
        </section>
        <section class="m-stack" data-gap="3" aria-labelledby="cm-toast-errors">
          <h2 id="cm-toast-errors" style="${meta}">Somewhere else</h2>
          <div class="m-toast-region" data-static aria-live="polite" style="position: static; inline-size: auto; max-inline-size: 26rem; padding: 0; align-items: start">
            <div class="m-toast" data-tone="danger" role="alert">
              <div class="m-toast-content">
                <p class="m-toast-title">Couldn’t send to Priya Raman</p>
                <p class="m-toast-body">You’re offline. The reply is in Drafts and sends when you reconnect.</p>
              </div>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="--m-button-ghost-fg: var(--m-color-fg-inverse); --m-button-ghost-hover-bg: transparent; text-decoration: underline; text-underline-offset: 3px">Retry</button>
            </div>
            <div class="m-toast" role="status">
              <div class="m-toast-content">
                <p class="m-toast-title" style="font-weight: var(--m-font-weight-regular)">Conversation closed</p>
              </div>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="--m-button-ghost-fg: var(--m-color-fg-inverse); --m-button-ghost-hover-bg: transparent; text-decoration: underline; text-underline-offset: 3px">Undo</button>
            </div>
          </div>
        </section>
        <section class="m-stack" data-gap="3" aria-labelledby="cm-page-errors">
          <h2 id="cm-page-errors" style="${meta}">A whole page</h2>
          <div class="m-grid" style="--m-layout-grid-min: 14rem">
            ${fullPage(I.compass, '404', 'This conversation isn’t here', 'It may have been merged into another one, or the link is missing a part.', `<a class="m-button" data-variant="primary" data-size="sm" href="#">Back to Open</a>`)}
            ${fullPage(I.cloudOff, '500', 'Something broke on our side', 'Nothing you wrote was lost. Try again in a moment.', `<button type="button" class="m-button" data-size="sm">${icon(I.undo, 14)} Try again</button>`)}
            ${fullPage(I.lock, '403', 'Only the wholesale team can open this', 'Ask Maren Voss to add you, or go back to your splits.', `<button type="button" class="m-button" data-variant="primary" data-size="sm">Ask for access</button>`)}
          </div>
        </section>
      </div>
    </div>
  </main>`,
);

export const cometRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'The queue home: an icon rail, large split tabs with grey counts over generous one-line rows (the current one tinted with a purple edge), a quiet side panel of this week’s figures and keys, and a one-line confirmation with Undo.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'An open conversation: earlier messages folded to one line, the latest in 16px reading text, the reply composer on a ring shadow with Send and its key, and the customer’s panel on the right.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One centred step on the warm page teaching the command menu by showing it: a large input, rows with the command and its key, then a wide primary Continue.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A quiet section list beside a 44rem column: a light 28px title, sections of hairline rows with the label and help on the left and a switch, select or key on the right, and a radio group.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'A cleared split: the tabs stay, and the pane holds a thin 48px icon, a light 28px heading, one muted line, the next place to go and the keys for it, over a faint brand wash.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The public page: a plain white bar, a light 39px title, a Monthly/Yearly switch with a saving chip, three joined plan columns with the middle one tinted under a charcoal cap, then a comparison table and questions.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors and a summary in the new-conversation dialog, an offline toast that keeps the draft beside the Undo toast, and full pages for 404, 500 and no access.',
    html: errors,
  },
];
