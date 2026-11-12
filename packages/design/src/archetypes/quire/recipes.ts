import type { ArchetypeRecipe } from '../types';

/*
 * Quire's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from a small publication's writing studio ("Alder Press").
 * They follow the language's real screen patterns: a calm grey sidebar where the current row is a
 * white tile, a toolbar of round icon buttons and capsule groups, white pages that float on a soft
 * shadow, tinted block decorations, toggle blocks as grey wells, page blocks as rounded cards with
 * soft colour covers, chips for dates and flags, a mini month calendar, and settings as grey grouped
 * rows. Covers are token gradients, never images.
 */

// Lucide icons, outlined, 1.5px stroke
const icon = (paths: string, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  layers:
    '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  pen: '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  calendarClock:
    '<path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h5"/><path d="M17.5 17.5 16 16.3V14"/><circle cx="16" cy="16" r="6"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  folder:
    '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  type: '<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>',
  tree: '<path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.03V6a3 3 0 1 1 6 0v.04a3.5 3.5 0 0 1 3.24 5.65A4 4 0 0 1 16 19Z"/><path d="M12 19v3"/>',
  panel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
  kanban: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 7v7"/><path d="M12 7v4"/><path d="M16 7v9"/>',
  sort: '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
  more: '<circle cx="12" cy="12" r="10"/><path d="M17 12h.01"/><path d="M12 12h.01"/><path d="M7 12h.01"/>',
  dots: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>',
  share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/>',
  sparkles:
    '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  squareCheck: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/>',
  square: '<rect width="18" height="18" x="3" y="3" rx="2"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
  squarePlus: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/>',
  inbox:
    '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
};

const label = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
const small = 'font-size: var(--m-font-size-xs); color: var(--m-color-fg-muted)';
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)';
const dotted = 'border-block-start: 2px dotted var(--m-color-border-default)';
// The toolbar's title and a page's title
const viewTitle = 'font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-tight)';
const docTitle = 'font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)';
const groupTitle = 'font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-semibold)';
// A white page on the window: 16px corners and the soft page shadow
const page = 'background: var(--m-color-bg-raised); border-radius: var(--m-radius-lg); box-shadow: var(--m-shadow-md)';
// Round icon buttons and white capsule groups sit on a faint ring
const ring = 'box-shadow: var(--m-shadow-sm)';
// Soft colour covers for pages and cards, from the status tints and the paper
const covers = {
  sky: 'linear-gradient(140deg, var(--m-color-info-border), var(--m-color-accent-subtle) 70%)',
  mint: 'linear-gradient(140deg, var(--m-color-success-border), var(--m-color-success-bg) 70%)',
  peach: 'linear-gradient(140deg, var(--m-color-warning-border), var(--m-color-warning-bg) 70%)',
  rose: 'linear-gradient(140deg, var(--m-color-danger-border), var(--m-color-danger-bg) 70%)',
  paper: 'linear-gradient(140deg, var(--m-color-border-default), var(--m-color-brand-subtle) 70%)',
};

const roundBtn = (ic: string, name: string) =>
  `<button type="button" class="m-button" data-icon-only aria-label="${name}">${icon(ic, 16)}</button>`;

// A chip: a date in blue, a flag in red, a weekday in grey, a desk tag in its tint
const chip = (text: string, tone = '', ic = '') =>
  `<span class="m-badge"${tone ? ` data-tone="${tone}"` : ''}>${ic ? icon(ic, 12) : ''}${text}</span>`;

const navLink = (ic: string, text: string, current: string, extra = '', tint = '') =>
  `        <li><a class="m-sidebar-link" href="#"${text === current ? ` aria-current="page" style="${ring}"` : ''}><span style="display: inline-flex; color: ${tint || 'var(--m-color-fg-muted)'}">${icon(ic, 16)}</span> ${text}${extra}</a></li>`;
const count = (n: number) => ` <span class="m-sidebar-count">${n}</span>`;

const shell = (current: string, main: string) => `<div class="m-split" style="--m-layout-split-side: 17.5rem; --m-layout-split-gap: 0; min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  <nav class="m-sidebar" aria-label="Main">
    <div class="m-stack" data-gap="3">
      <div class="m-cluster" data-justify="between" style="padding-inline: var(--m-space-2)">
        <span class="m-cluster" data-gap="2" style="font-weight: var(--m-font-weight-semibold); font-size: var(--m-font-size-sm)"><span class="m-avatar" data-size="sm" style="border-radius: var(--m-radius-sm)">${icon(I.tree, 12)}</span>Alder Press ${icon(I.down, 12)}</span>
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Hide sidebar">${icon(I.panel, 16)}</button>
      </div>
    </div>
    <div class="m-sidebar-section">
      <ul>
${navLink(I.layers, 'Desk', current)}
${navLink(I.pen, 'Drafts', current, count(12))}
${navLink(I.eye, 'In review', current, count(3))}
${navLink(I.calendarClock, 'Scheduled', current, count(5))}
${navLink(I.globe, 'Published', current)}
      </ul>
    </div>
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Issues</h2>
      <ul>
${navLink(I.book, 'No. 41 · November', current)}
${navLink(I.book, 'No. 40 · October', current)}
      </ul>
    </div>
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Desks</h2>
      <ul>
${navLink(I.folder, 'Culture', current, count(9), 'var(--m-color-danger-fg)')}
${navLink(I.folder, 'Science', current, count(6), 'var(--m-color-success-fg)')}
${navLink(I.folder, 'City', current, count(14), 'var(--m-color-accent-text)')}
${navLink(I.folder, 'Letters', current, count(4), 'var(--m-color-warning-fg)')}
      </ul>
    </div>
    <div class="m-sidebar-section" style="${hair}; padding-block-start: var(--m-space-3)">
      <ul>
${navLink(I.users, 'Contributors', current)}
${navLink(I.type, 'Style guide', current)}
      </ul>
    </div>
  </nav>
  <div class="m-stack" data-gap="0">
${main}
  </div>
</div>`;

// The toolbar: a round add button and the view's title, capsule groups and round buttons at the right
const toolbar = (title: string, right: string) => `    <header class="m-cluster" data-justify="between" style="padding: var(--m-space-4) var(--m-space-6)">
      <div class="m-cluster" data-gap="3">
        ${roundBtn(I.plus, 'New draft')}
        <h1 style="${viewTitle}">${title}</h1>
      </div>
      <div class="m-cluster" data-gap="2">
${right}
      </div>
    </header>`;

const viewSwitch = `        <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="View" style="${ring}">
          <button type="button" class="m-tab" role="tab" aria-selected="true" aria-label="Cards">${icon(I.grid, 16)}</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" aria-label="List" tabindex="-1">${icon(I.list, 16)}</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" aria-label="Board" tabindex="-1">${icon(I.kanban, 16)}</button>
        </div></div>
        ${roundBtn(I.sort, 'Sort')}
        ${roundBtn(I.more, 'More')}
        <button type="button" class="m-button" aria-label="Search">${icon(I.search, 16)} ${icon(I.down, 12)}</button>`;

// A page card: a soft cover band, the title, two lines of the opening, its desk and date
const draftCard = (cover: string, title: string, opening: string, desk: string, deskTone: string, when: string, whenTone = '') => `          <a href="#" class="m-card" data-interactive style="padding: 0; overflow: hidden; color: inherit; text-decoration: none">
            <div style="block-size: 4.5rem; background: ${cover}"></div>
            <div class="m-stack" data-gap="2" style="padding: var(--m-space-3) var(--m-space-4) var(--m-space-4)">
              <h3 style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-semibold); line-height: var(--m-font-leading-tight)">${title}</h3>
              <p style="${label}; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden">${opening}</p>
              <div class="m-cluster" data-gap="1">${chip(desk, deskTone)}${chip(when, whenTone)}</div>
            </div>
          </a>`;

// The month: a 7-column grid, today a dark square, the chosen day a blue tint, dots under scheduled days
const days = [
  27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
  29, 30, 1, 2, 3, 4, 5, 6, 7,
];
const scheduled = new Set([14, 18, 21, 26]);
const dayCell = (d: number, i: number) => {
  const out = i < 5 || i > 34;
  const base = 'display: grid; place-items: center; block-size: 2rem; border-radius: var(--m-radius-sm); font-size: var(--m-font-size-sm); font-variant-numeric: tabular-nums; position: relative';
  if (!out && d === 12)
    return `<span style="${base}; background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse); font-weight: var(--m-font-weight-semibold)" aria-current="date">${d}</span>`;
  if (!out && d === 14)
    return `<span style="${base}; background: var(--m-color-accent-subtle); color: var(--m-color-accent-text); font-weight: var(--m-font-weight-semibold)">${d}</span>`;
  const dot = !out && scheduled.has(d) ? '<span style="position: absolute; inset-block-end: 3px; inline-size: 4px; block-size: 4px; border-radius: var(--m-radius-full); background: var(--m-color-accent-default)"></span>' : '';
  return `<span style="${base}${out ? '; color: var(--m-color-fg-subtle)' : ''}">${d}${dot}</span>`;
};
const month = `<div class="m-stack" data-gap="2">
              <div class="m-cluster" data-justify="between">
                <h2 style="${groupTitle}">November</h2>
                <span class="m-cluster" data-gap="1" style="color: var(--m-color-fg-muted)">
                  <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Previous month">${icon(I.left, 14)}</button>
                  <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Go to today">${icon(I.target, 14)}</button>
                  <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Next month">${icon(I.right, 14)}</button>
                </span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center">
                ${['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => `<span style="${small}; padding-block: var(--m-space-1)">${d}</span>`).join('')}
                ${days.map(dayCell).join('')}
              </div>
            </div>`;

const task = (text: string, chips: string, done = false, flagged = false) => `              <li class="m-cluster" data-gap="2" style="flex-wrap: nowrap; padding-block: var(--m-space-1)">
                <input class="m-checkbox" type="checkbox"${done ? ' checked' : ''} aria-label="${text}"${flagged ? ' style="border-color: var(--m-color-danger-solid)"' : ''}>
                <span style="flex: 1; min-inline-size: 0; font-size: var(--m-font-size-sm)${done ? '; color: var(--m-color-fg-subtle); text-decoration: line-through' : ''}">${text}</span>
                <span class="m-cluster" data-gap="1" style="flex: none">${chips}</span>
              </li>`;

const dashboard = shell(
  'Desk',
  `${toolbar('Desk', viewSwitch)}
    <main style="padding: var(--m-space-2) clamp(var(--m-space-4), 3vw, var(--m-space-6)) var(--m-space-12)">
      <div style="display: flex; flex-wrap: wrap; gap: var(--m-space-8); align-items: start">
        <div class="m-stack" data-gap="8" style="flex: 999 1 26rem; min-inline-size: 0">
          <section class="m-stack" data-gap="4" aria-labelledby="qr-progress">
            <div class="m-cluster" data-gap="2">
              <h2 id="qr-progress" style="${groupTitle}">In progress</h2>
              <span style="${small}">6</span>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Section options">${icon(I.dots, 14)}</button>
            </div>
            <div class="m-grid" style="--m-layout-grid-min: 13rem; --m-layout-grid-gap: var(--m-space-4)">
${draftCard(covers.sky, 'The quiet return of the river otter', 'Three winters of camera traps along the Ashby reach, and what the volunteers learned about patience.', 'Science', 'success', 'Nov 14.', 'info')}
${draftCard(covers.peach, 'A bakery that never closes its door', 'At 4 a.m. on Mercer Street the ovens are already warm, and the queue is mostly night nurses.', 'City', 'info', 'Overdue', 'danger')}
${draftCard(covers.rose, 'Notes toward a museum of small things', 'A thimble, a bus ticket, a seed packet from 1962: our readers sent us the objects they keep.', 'Culture', 'danger', 'Friday')}
${draftCard(covers.mint, 'Where the tram line used to run', 'The old rails still surface after rain. A walk from the depot to the harbour, stop by stop.', 'City', 'info', 'Nov 21.', 'info')}
${draftCard(covers.paper, 'Letters: on reading aloud', 'Eleven readers on the books they read to someone else, and the ones they could not finish.', 'Letters', 'warning', 'Nov 26.', 'info')}
${draftCard(covers.sky, 'Field guide to winter light', 'A photographer’s notes on the hour after sunrise, from the roof of the old grain store.', 'Culture', 'danger', 'Dec 2.')}
            </div>
          </section>
          <section class="m-stack" data-gap="3" aria-labelledby="qr-recent">
            <h2 id="qr-recent" style="${groupTitle}">Recently edited</h2>
            <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
${[
  ['Interview: the last lock keeper', 'Rosa Imbert', '10 min ago'],
  ['Style note: numbers and dates', 'Theo Marsh', '1 h ago'],
  ['Pitch list for No. 42', 'Ines Calloway', 'Yesterday'],
]
  .map(
    ([t, who, when], i) => `              <li><a href="#" class="m-cluster" data-justify="between" style="padding: var(--m-space-2) var(--m-space-2); border-radius: var(--m-radius-md); color: inherit; text-decoration: none${i ? `; ${hair.replace('default', 'muted')}` : ''}">
                <span class="m-cluster" data-gap="3"><span style="color: var(--m-color-fg-muted); display: inline-flex">${icon(I.file, 16)}</span><span class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-medium)">${t}</span><span style="${small}">${who}</span></span></span>
                <span style="${small}">${when}</span>
              </a></li>`,
  )
  .join('\n')}
            </ul>
          </section>
        </div>
        <aside class="m-stack" data-gap="4" aria-label="This month" style="flex: 1 1 16rem; max-inline-size: 22rem">
          <section class="m-card" style="padding: var(--m-space-4)">
            ${month}
          </section>
          <section class="m-card m-stack" data-gap="2" style="padding: var(--m-space-4)" aria-labelledby="qr-due">
            <div class="m-cluster" data-justify="between">
              <h2 id="qr-due" class="m-cluster" data-gap="2" style="${groupTitle}"><span style="color: var(--m-color-fg-muted); display: inline-flex">${icon(I.inbox, 16)}</span>Due this week</h2>
              <span style="${small}">4 open</span>
            </div>
            <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
${task('Fact-check the otter counts', chip('Nov 14.', 'info'))}
${task('Send proofs to Mercer Street', chip('Overdue', 'danger', I.flag), false, true)}
${task('Caption the tram photos', chip('Friday', '', I.flag))}
${task('Book the reading-room table', chip('Nov 13.', 'info'), true)}
            </ul>
            <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="align-self: start; color: var(--m-color-accent-text)">${icon(I.squarePlus, 14)} Add a task</button>
          </section>
        </aside>
      </div>
    </main>`,
);

// The list: a collection table. The detail: the document itself, on its page
const reviewRow = (n: number, title: string, desk: string, tone: string, initials: string, editor: string, status: string, statusTone: string, due: string) => `              <tr>
                <td style="color: var(--m-color-fg-subtle); font-variant-numeric: tabular-nums">${n}</td>
                <td><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span style="color: var(--m-color-fg-muted); display: inline-flex">${icon(I.file, 14)}</span><a href="#" style="color: inherit; text-decoration: none; font-weight: var(--m-font-weight-medium)">${title}</a></span></td>
                <td>${chip(desk, tone)}</td>
                <td><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span class="m-avatar" data-size="sm">${initials}</span>${editor}</span></td>
                <td>${chip(status, statusTone)}</td>
                <td style="font-variant-numeric: tabular-nums">${due}</td>
              </tr>`;

const pageBlock = (cover: string, title: string, sub: string) => `                <a href="#" class="m-card" data-interactive style="padding: 0; overflow: hidden; border-radius: 7px; box-shadow: var(--m-shadow-lg); color: inherit; text-decoration: none">
                  <div class="m-stack" data-gap="1" style="min-block-size: 7rem; padding: var(--m-space-4); background: ${cover}; justify-content: end">
                    <span style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-bold)">${title}</span>
                    <span style="${label}">${sub}</span>
                  </div>
                </a>`;

const listDetail = shell(
  'In review',
  `${toolbar(
    'In review',
    `        <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Show" style="${ring}">
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Mine</button>
          <button type="button" class="m-tab" role="tab" aria-selected="true">Everyone</button>
        </div></div>
        ${roundBtn(I.sort, 'Sort')}
        <button type="button" class="m-button" aria-label="Search">${icon(I.search, 16)} ${icon(I.down, 12)}</button>`,
  )}
    <main class="m-stack" data-gap="10" style="padding: var(--m-space-2) clamp(var(--m-space-4), 3vw, var(--m-space-6)) var(--m-space-12)">
      <section aria-label="Drafts in review" class="m-stack" data-gap="2">
        <div class="m-table-wrap" style="background: var(--m-color-bg-surface)">
          <table class="m-table">
            <thead><tr><th style="inline-size: 2.5rem">#</th><th>Title</th><th>Desk</th><th>Editor</th><th>Status</th><th>Due</th></tr></thead>
            <tbody>
${reviewRow(1, 'The quiet return of the river otter', 'Science', 'success', 'RI', 'Rosa Imbert', 'Fact-check', 'warning', 'Nov 14')}
${reviewRow(2, 'A bakery that never closes its door', 'City', 'info', 'TM', 'Theo Marsh', 'Changes asked', 'danger', 'Nov 11')}
${reviewRow(3, 'Letters: on reading aloud', 'Letters', 'warning', 'IC', 'Ines Calloway', 'Ready', 'success', 'Nov 26')}
            </tbody>
          </table>
        </div>
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="align-self: start; color: var(--m-color-fg-muted)">${icon(I.plus, 14)} New</button>
      </section>

      <!-- The detail: the draft opens as a white page with the reference's blocks -->
      <article style="${page}; max-inline-size: 48.5rem; inline-size: 100%; margin-inline: auto; padding: var(--m-space-6) clamp(var(--m-space-4), 5vw, var(--m-space-12)) var(--m-space-12)" aria-labelledby="qr-doc-title">
        <div class="m-stack" data-gap="5">
          <div class="m-cluster" data-justify="between">
            <nav class="m-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="#">Desks</a></li><li><a href="#">Science</a></li><li><span aria-current="page">River otter</span></li></ol></nav>
            <span class="m-cluster" data-gap="2">
              <button type="button" class="m-button" data-size="sm">${icon(I.share, 14)} Share</button>
              <button type="button" class="m-button" data-size="sm" data-icon-only aria-label="Style">${icon(I.type, 14)}</button>
            </span>
          </div>
          <div class="m-stack" data-gap="3" style="padding-block-end: var(--m-space-3); ${hair.replace('block-start', 'block-end').replace('default', 'muted')}">
            <h1 id="qr-doc-title" style="${docTitle}">The quiet return of the river otter</h1>
            <span class="m-cluster" data-gap="2" style="${label}"><span class="m-avatar" data-size="sm">RI</span>Rosa Imbert · 2,140 words · edited 10 min ago</span>
          </div>
          <div class="m-accordion" data-variant="separated"><details class="m-accordion-item"><summary>Editor’s notes</summary><div class="m-accordion-content">Keep the opening scene. Cut the second interview by half and move the counts into a box.</div></details></div>
          <div class="m-prose">
            <p>For three winters the volunteers checked the cameras every Sunday. Most weeks they found herons, a fox, once a very surprised swan. Then, in the second February, a long low shape slid across the frame at 5:12 in the morning.</p>
            <h3 style="border-inline-start: 3px solid var(--m-color-fg-default); padding-inline-start: var(--m-space-3)">What the cameras saw</h3>
            <p>Across the Ashby reach the team logged 41 sightings from 18 cameras. Type <code class="m-code-inline">/counts</code> to pull the latest table from the survey page.</p>
          </div>
          <div class="m-alert" data-tone="success" role="note">
            <div class="m-alert-content"><div class="m-alert-title">Checked</div><div class="m-alert-body">Sighting counts match the survey sheet of Nov 3.</div></div>
          </div>
          <div class="m-alert" data-tone="warning" role="note">
            <div class="m-alert-content"><div class="m-alert-title">Open questions</div>
              <div class="m-alert-body m-stack" data-gap="1">
                <label class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><input class="m-checkbox" type="checkbox"> Confirm the date of the first sighting</label>
                <label class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><input class="m-checkbox" type="checkbox"> Ask the trust for the 2019 baseline</label>
              </div>
            </div>
          </div>
          <div style="${dotted}"></div>
          <div class="m-grid" style="--m-layout-grid-min: 12rem; --m-layout-grid-gap: var(--m-space-3)">
${pageBlock(covers.sky, 'Interview notes', '4 sources')}
${pageBlock(covers.mint, 'Photo brief', '12 frames')}
          </div>
          <a href="#" class="m-cluster" data-gap="3" style="color: inherit; text-decoration: none">
            <span style="display: grid; place-items: center; inline-size: 2rem; block-size: 2.5rem; border-radius: 3px; background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-sm); color: var(--m-color-fg-subtle)">${icon(I.file, 14)}</span>
            <span class="m-stack" data-gap="0"><span style="font-weight: var(--m-font-weight-semibold)">Sources and permissions</span><span style="${label}">Every quote, with who said it and when.</span></span>
          </a>
        </div>
      </article>
    </main>`,
);

// Onboarding: one white page over a soft colour cover, a style picker and an accent picker
const styleTile = (name: string, family: string, sample: string, selected = false) =>
  `<label class="m-stack" data-gap="1" data-align="center" style="flex: 1; padding: var(--m-space-3); border-radius: var(--m-radius-md); background: var(--m-color-bg-sunken); text-align: center; cursor: pointer${selected ? '; box-shadow: inset 0 0 0 2px var(--m-color-accent-default)' : ''}"><input class="m-sr-only" type="radio" name="qr-style"${selected ? ' checked' : ''}><span style="font-family: var(--m-font-family-${family}); font-size: var(--m-font-size-2xl); line-height: 1">${sample}</span><span style="${small}">${name}</span></label>`;
const swatch = (token: string, name: string, selected = false) =>
  `<label style="display: inline-grid; place-items: center; inline-size: 2rem; block-size: 2rem; border-radius: var(--m-radius-full); cursor: pointer${selected ? '; box-shadow: 0 0 0 2px var(--m-color-bg-surface), 0 0 0 4px var(--m-color-border-strong)' : ''}"><input class="m-sr-only" type="radio" name="qr-accent" aria-label="${name}"${selected ? ' checked' : ''}><span style="inline-size: 1.5rem; block-size: 1.5rem; border-radius: var(--m-radius-full); background: var(${token})"></span></label>`;

const onboarding = `<main style="min-block-size: 100vh; padding: var(--m-space-16) var(--m-space-4); background: ${covers.sky}">
  <form class="m-stack" data-gap="6" aria-labelledby="qr-onb-title" style="${page}; max-inline-size: 30rem; margin-inline: auto; padding: var(--m-space-8)">
    <div class="m-cluster" data-justify="between">
      <span class="m-cluster" data-gap="1" aria-label="Step 2 of 3"><span style="inline-size: 1.25rem; block-size: 0.375rem; border-radius: var(--m-radius-full); background: var(--m-color-fg-default)"></span><span style="inline-size: 1.25rem; block-size: 0.375rem; border-radius: var(--m-radius-full); background: var(--m-color-fg-default)"></span><span style="inline-size: 1.25rem; block-size: 0.375rem; border-radius: var(--m-radius-full); background: var(--m-color-border-default)"></span></span>
      <span style="${small}">Step 2 of 3</span>
    </div>
    <div class="m-stack" data-gap="2">
      <h1 id="qr-onb-title" style="font-family: var(--m-font-family-serif); font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-regular); letter-spacing: -0.02em; line-height: var(--m-font-leading-tight)">Make it feel like yours</h1>
      <p class="m-muted">Pick how your pages look. You can change any of this later, page by page.</p>
    </div>
    <div class="m-field">
      <label class="m-field-label" for="qr-onb-name">Publication name</label>
      <input class="m-input" id="qr-onb-name" value="Alder Press" aria-describedby="qr-onb-name-hint">
      <p class="m-field-hint" id="qr-onb-name-hint">Shown at the top of every shared page.</p>
    </div>
    <fieldset class="m-stack" data-gap="2" style="border: 0; padding: 0; margin: 0">
      <legend style="${groupTitle}; margin-block-end: var(--m-space-2)">Page style</legend>
      <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${styleTile('Sans', 'sans', 'Ag', true)}${styleTile('Serif', 'serif', 'Ag')}${styleTile('Mono', 'mono', 'Ag')}</div>
    </fieldset>
    <fieldset class="m-stack" data-gap="2" style="border: 0; padding: 0; margin: 0">
      <legend style="${groupTitle}; margin-block-end: var(--m-space-2)">Accent colour</legend>
      <div class="m-cluster" data-gap="2">${swatch('--m-color-accent-default', 'Blue', true)}${swatch('--m-color-success-solid', 'Green')}${swatch('--m-color-warning-solid', 'Amber')}${swatch('--m-color-danger-solid', 'Red')}${swatch('--m-color-fg-muted', 'Graphite')}</div>
    </fieldset>
    <div class="m-cluster" data-justify="between">
      <button type="button" class="m-button" data-variant="ghost">${icon(I.left, 14)} Back</button>
      <button type="submit" class="m-button" data-variant="primary" data-size="lg">Continue</button>
    </div>
  </form>
</main>`;

// Settings: a grouped settings column, then grey grouped rows on the window
const settingsNav = (groups: [string, [string, string][]][], current: string) =>
  groups
    .map(
      ([h, items]) => `    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">${h}</h2>
      <ul>
${items.map(([ic, l]) => navLink(ic, l, current)).join('\n')}
      </ul>
    </div>`,
    )
    .join('\n');

const groupBox = (rows: string[]) =>
  `<div class="m-card" data-variant="sunken" style="gap: 0; padding: 0 var(--m-space-4); border-radius: 12px">${rows.map((r, i) => `<div class="m-cluster" data-justify="between" style="padding-block: var(--m-space-3)${i ? `; ${hair}` : ''}">${r}</div>`).join('')}</div>`;
const switchRow = (text: string, on: boolean) =>
  `<label class="m-cluster" data-justify="between" style="inline-size: 100%; font-size: var(--m-font-size-sm)">${text}<input class="m-switch" type="checkbox" role="switch"${on ? ' checked' : ''}></label>`;
const section = (id: string, title: string, desc: string, body: string) => `      <section class="m-stack" data-gap="2" aria-labelledby="${id}">
        <div class="m-stack" data-gap="0"><h2 id="${id}" style="${groupTitle}">${title}</h2>${desc ? `<p style="${label}">${desc}</p>` : ''}</div>
        ${body}
      </section>`;
// A theme thumbnail: a tiny window drawn with token shapes
const theme = (name: string, bg: string, side: string, pageBg: string, selected = false) => `<label class="m-stack" data-gap="2" data-align="center" style="flex: 1; cursor: pointer"><input class="m-sr-only" type="radio" name="qr-theme"${selected ? ' checked' : ''}>
          <span style="display: grid; grid-template-columns: 1fr 2fr; gap: 4px; inline-size: 100%; block-size: 4.5rem; padding: 6px; border-radius: var(--m-radius-md); background: ${bg}; box-shadow: ${selected ? '0 0 0 2px var(--m-color-accent-default)' : 'var(--m-shadow-sm)'}"><span style="border-radius: 4px; background: ${side}"></span><span style="border-radius: 4px; background: ${pageBg}"></span></span>
          <span style="font-size: var(--m-font-size-sm)${selected ? '; color: var(--m-color-accent-text); font-weight: var(--m-font-weight-medium)' : ''}">${name}</span></label>`;

const settings = `<div class="m-split" style="--m-layout-split-side: 17.5rem; --m-layout-split-gap: 0; min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  <nav class="m-sidebar" aria-label="Settings">
    <div class="m-stack" data-gap="2" data-align="center" style="padding-block: var(--m-space-4) var(--m-space-2)">
      <span class="m-avatar" data-size="lg" style="inline-size: 4rem; block-size: 4rem; border-radius: var(--m-radius-lg); font-size: var(--m-font-size-xl)">${icon(I.tree, 28)}</span>
      <span class="m-cluster" data-gap="1" style="font-weight: var(--m-font-weight-semibold)">Alder Press ${icon(I.down, 12)}</span>
    </div>
${settingsNav(
  [
    [
      'Publication',
      [
        [I.book, 'Masthead'],
        [I.folder, 'Desks'],
        [I.calendarClock, 'Issue schedule'],
        [I.link, 'Custom domain'],
      ],
    ],
    [
      'Editing',
      [
        [I.type, 'Style rules'],
        [I.eye, 'Review flow'],
      ],
    ],
    [
      'You',
      [
        [I.monitor, 'Appearance'],
        [I.bell, 'Notifications'],
      ],
    ],
  ],
  'Appearance',
)}
  </nav>
  <div>
    <header class="m-cluster" data-gap="2" style="padding: var(--m-space-4) var(--m-space-6)">
      ${roundBtn(I.x, 'Close settings')}
      ${roundBtn(I.left, 'Back')}
      <h1 style="${viewTitle}; margin-inline-start: var(--m-space-2)">Appearance</h1>
    </header>
    <main class="m-stack" data-gap="8" style="max-inline-size: 46rem; padding: var(--m-space-4) var(--m-space-6) var(--m-space-12)">
${section(
  'qr-theme',
  'Theme',
  '',
  `<div class="m-card" data-variant="sunken" style="border-radius: 12px; padding: var(--m-space-4)"><div class="m-cluster" data-gap="4" style="flex-wrap: nowrap">
          ${theme('Match system', 'linear-gradient(90deg, var(--m-color-bg-sunken) 50%, var(--m-color-bg-inverse) 50%)', 'var(--m-color-border-default)', 'var(--m-color-bg-surface)', true)}
          ${theme('Light', 'var(--m-color-bg-sunken)', 'var(--m-color-border-default)', 'var(--m-color-bg-surface)')}
          ${theme('Dark', 'var(--m-color-bg-inverse)', 'var(--m-color-fg-muted)', 'var(--m-color-fg-subtle)')}
        </div></div>`,
)}
${section(
  'qr-accent',
  'Accent colour',
  'Buttons, links and the selected day use it across the app.',
  `<div class="m-card" data-variant="sunken" style="border-radius: 12px; padding: var(--m-space-3) var(--m-space-4)"><div class="m-cluster" data-gap="2">${swatch('--m-color-accent-default', 'Blue', true)}${swatch('--m-color-success-solid', 'Green')}${swatch('--m-color-warning-solid', 'Amber')}${swatch('--m-color-danger-solid', 'Red')}${swatch('--m-color-fg-muted', 'Graphite')}</div></div>`,
)}
${section(
  'qr-pages',
  'Pages',
  'How new pages open, and what the editor shows around the text.',
  groupBox([
    switchRow('Use each page’s style across the app', true),
    switchRow('Show the word count while writing', true),
    switchRow('Reduce motion', false),
    `<span style="font-size: var(--m-font-size-sm)">Default page style</span><select class="m-select" data-size="sm" aria-label="Default page style" style="inline-size: auto"><option>Sans</option><option selected>Serif</option><option>Mono</option></select>`,
  ]),
)}
${section(
  'qr-styles',
  'Saved styles',
  'Up to 12 styles, shared with everyone at Alder Press.',
  groupBox([
    `<span class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-sm)"><span style="inline-size: 1.25rem; block-size: 1.25rem; border-radius: 4px; background: ${covers.peach}"></span>Issue cover · warm</span><a href="#" style="color: var(--m-color-accent-text); font-size: var(--m-font-size-sm); text-decoration: none">Edit</a>`,
    `<a href="#" class="m-cluster" data-gap="2" style="color: var(--m-color-accent-text); font-size: var(--m-font-size-sm); text-decoration: none">${icon(I.squarePlus, 16)} Add a style</a>`,
  ]),
)}
    </main>
  </div>
</div>`;

const emptyState = shell(
  'Scheduled',
  `${toolbar('Scheduled', `        ${roundBtn(I.calendar, 'Calendar view')}\n        ${roundBtn(I.more, 'More')}`)}
    <main style="display: grid; place-items: center; padding: var(--m-space-16) var(--m-space-6)">
      <div class="m-stack" data-gap="4" data-align="center" style="text-align: center; max-inline-size: 26rem">
        <span style="color: var(--m-color-fg-subtle)">${icon(I.calendarClock, 44)}</span>
        <h2 style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold)">Nothing scheduled yet</h2>
        <p class="m-muted">Give a finished draft a date and a time, and it will wait here until it goes out.</p>
        <div class="m-cluster" data-gap="2" data-justify="center">
          <button type="button" class="m-button" data-variant="primary">${icon(I.calendarClock, 14)} Schedule a draft</button>
          <button type="button" class="m-button">Open drafts</button>
        </div>
      </div>
    </main>`,
);

// Pricing: the public pages. Warm paper, serif headlines, capsule buttons in ink, rounded plan panels
const caps = 'font-size: var(--m-font-size-sm); font-weight: 800; letter-spacing: var(--m-font-tracking-wide); text-transform: uppercase; color: var(--m-color-fg-muted)';
const serif = (size: string) =>
  `font-family: var(--m-font-family-serif); font-size: ${size}; font-weight: var(--m-font-weight-regular); letter-spacing: -0.02em; line-height: 1.1`;
const feature = (text: string, off = false) =>
  `<li class="m-cluster" data-gap="2" style="flex-wrap: nowrap; font-size: var(--m-font-size-sm)${off ? '; color: var(--m-color-fg-subtle); text-decoration: line-through' : ''}">${icon(off ? I.square : I.squareCheck, 14)}${text}</li>`;
const plan = (kicker: string, name: string, price: string, per: string, blurb: string, cta: string, primary: boolean, features: string, tint = '') => `      <section class="m-stack" data-gap="5" style="padding: var(--m-space-8); border-radius: 24px; background: ${tint || 'var(--m-color-bg-surface)'}; box-shadow: var(--m-shadow-md)" aria-label="${name}">
        <span style="${caps}">${kicker}</span>
        <div class="m-stack" data-gap="3">
          <span class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-semibold); text-transform: uppercase; letter-spacing: 0.02em">${name}${primary ? ' <span class="m-badge" data-variant="solid">Most chosen</span>' : ''}</span>
          <span class="m-cluster" data-gap="2" style="align-items: baseline"><span style="${serif('var(--m-font-size-4xl)')}">${price}</span><span style="${serif('var(--m-font-size-xl)')}; color: var(--m-color-fg-muted)">${per}</span></span>
          <p class="m-muted" style="font-size: var(--m-font-size-sm)">${blurb}</p>
        </div>
        <button type="button" class="m-button" data-size="lg" style="align-self: start${primary ? '; background: var(--m-color-brand-default); color: var(--m-color-brand-fg)' : ''}">${cta}</button>
        <ul class="m-stack" data-gap="2" style="padding: 0; list-style: none">${features}</ul>
      </section>`;
const cmpRow = (name: string, cells: string[], note = '') =>
  `<tr><th scope="row" style="text-align: start; font-weight: var(--m-font-weight-semibold); padding: var(--m-space-3) var(--m-space-4); border-block-start: 1px dashed var(--m-color-border-default)">${name}${note ? `<div style="${small}; font-weight: var(--m-font-weight-regular)">${note}</div>` : ''}</th>${cells.map((c) => `<td style="text-align: center; padding: var(--m-space-3); border-block-start: 1px dashed var(--m-color-border-default)">${c === 'yes' ? `<span style="color: var(--m-color-success-fg); display: inline-flex" aria-label="Included">${icon(I.check, 16)}</span>` : c === 'no' ? '<span style="color: var(--m-color-fg-subtle)" aria-label="Not included">—</span>' : c}</td>`).join('')}</tr>`;
const cmpBand = (name: string) =>
  `<tr><th colspan="4" scope="rowgroup" style="text-align: start; padding: 0; padding-block-start: var(--m-space-5)"><div style="padding: var(--m-space-3) var(--m-space-4); border-radius: var(--m-radius-lg); background: var(--m-color-bg-sunken); ${serif('var(--m-font-size-xl)')}">${name}</div></th></tr>`;

const pricing = `<div style="min-block-size: 100vh; background: var(--m-color-brand-subtle)">
  <div style="padding: var(--m-space-4) var(--m-space-4) 0">
    <header class="m-navbar" style="max-inline-size: 58rem; margin-inline: auto; border-radius: var(--m-radius-full)">
      <a class="m-navbar-brand" href="#" style="${serif('var(--m-font-size-xl)')}">Alder</a>
      <nav class="m-navbar-nav" aria-label="Main">
        <a class="m-navbar-link" href="#">Tour</a>
        <a class="m-navbar-link" href="#">Stories</a>
        <a class="m-navbar-link" href="#" aria-current="page">Pricing</a>
        <a class="m-navbar-link" href="#">Help</a>
      </nav>
      <div class="m-navbar-actions">
        <a class="m-navbar-link" href="#">Sign in</a>
        <a class="m-button" href="#" style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">Start writing</a>
      </div>
    </header>
  </div>
  <main class="m-container" style="padding-block: var(--m-space-8) var(--m-space-16)">
    <div class="m-stack" data-gap="12">
      <div class="m-stack" data-gap="10" style="margin-inline: calc(var(--m-space-6) * -1); padding: var(--m-space-12) var(--m-space-6); border-radius: 24px; background: ${covers.sky}">
      <div class="m-stack" data-gap="6" data-align="center" style="text-align: center">
        <h1 style="${serif('var(--m-font-size-4xl)')}">Plans for every kind of writer</h1>
        <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Billing" style="${ring}">
          <button type="button" class="m-tab" role="tab" aria-selected="true">Yearly</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Monthly</button>
        </div></div>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 17rem; --m-layout-grid-gap: var(--m-space-5)">
${plan('For one writer', 'Notebook', '€0', '', 'Everything you need to keep a notebook and share a page now and then.', 'Start free', false, [feature('2,000 blocks'), feature('One publication'), feature('Share a page by link'), feature('Your own domain', true)].join(''))}
${plan('For one writer', 'Studio', '€7', '/month', 'No limits, every page style, and publishing on your own domain.', 'Try Studio', true, [feature('Unlimited blocks'), feature('Five publications'), feature('Scheduled publishing'), feature('Your own domain')].join(''))}
${plan('For a newsroom', 'Newsroom', '€6', '/seat /month', 'Shared desks, a review flow and roles for editors. From three seats.', 'Talk to us', false, [feature('Everything in Studio'), feature('Shared desks'), feature('Review flow and roles'), feature('One invoice')].join(''), 'var(--m-color-info-bg)')}
      </div>
      </div>
      <section class="m-stack" data-gap="6" aria-labelledby="qr-compare">
        <div class="m-stack" data-gap="2" data-align="center" style="text-align: center">
          <h2 id="qr-compare" style="${serif('var(--m-font-size-3xl)')}">Side by side</h2>
          <p class="m-muted">The same editor in every plan; the limits are what change.</p>
        </div>
        <div style="padding: var(--m-space-6) var(--m-space-8); border-radius: 24px; background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-md); overflow-x: auto">
          <table style="inline-size: 100%; border-collapse: collapse; font-size: var(--m-font-size-sm)">
            <thead><tr><td></td>${[
              ['Notebook', '€0'],
              ['Studio', '€7/mo'],
              ['Newsroom', '€6/seat/mo'],
            ]
              .map(([n, p]) => `<th scope="col" style="padding: var(--m-space-3); font-weight: var(--m-font-weight-regular)"><div style="${serif('var(--m-font-size-xl)')}">${n}</div><div style="${small}">${p}</div></th>`)
              .join('')}</tr></thead>
            <tbody>
              ${cmpRow('Blocks', ['2,000', 'Unlimited', 'Unlimited'])}
              ${cmpRow('Publications', ['1', '5', '5 per seat'])}
              ${cmpRow('Page history', ['14 days', '60 days', '1 year'])}
              ${cmpBand('Writing')}
              ${cmpRow('Page styles', ['yes', 'yes', 'yes'], 'Sans, serif and mono pages')}
              ${cmpRow('Tasks in pages', ['yes', 'yes', 'yes'], 'Dates and flags on any line')}
              ${cmpBand('Publishing')}
              ${cmpRow('Scheduled publishing', ['no', 'yes', 'yes'])}
              ${cmpRow('Your own domain', ['no', 'yes', 'yes'])}
            </tbody>
          </table>
        </div>
      </section>
      <section class="m-stack" data-gap="4" aria-labelledby="qr-faq" style="max-inline-size: 44rem; margin-inline: auto; inline-size: 100%">
        <h2 id="qr-faq" style="${serif('var(--m-font-size-3xl)')}; text-align: center">Questions</h2>
        <div class="m-accordion" data-variant="separated">
          <details class="m-accordion-item" name="qr-faq" open><summary>What counts as a block?</summary><div class="m-accordion-content">Every paragraph, heading, image or task is one block. A page of 800 words is usually about 25.</div></details>
          <details class="m-accordion-item" name="qr-faq"><summary>Can I move between plans?</summary><div class="m-accordion-content">Yes. Moving up applies at once; moving down applies at the end of the period you paid for.</div></details>
          <details class="m-accordion-item" name="qr-faq"><summary>Do readers need an account?</summary><div class="m-accordion-content">No. Shared and published pages open in any browser.</div></details>
        </div>
      </section>
    </div>
  </main>
</div>`;

// Errors: a block decoration above the form, the field's own message, a toast, and whole pages
const errorPage = (code: string, ic: string, title: string, body: string, actions: string) => `  <section class="m-stack" data-gap="3" data-align="center" style="${page}; text-align: center; padding: var(--m-space-12) var(--m-space-6)" aria-labelledby="qr-err-${code}">
    <span style="color: var(--m-color-fg-subtle)">${icon(ic, 40)}</span>
    <span style="${small}; font-family: var(--m-font-family-mono)">${code}</span>
    <h2 id="qr-err-${code}" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold)">${title}</h2>
    <p class="m-muted" style="max-inline-size: 26rem">${body}</p>
    <div class="m-cluster" data-gap="2" data-justify="center">${actions}</div>
  </section>`;

const errors = `<main style="min-block-size: 100vh; background: var(--m-color-bg-canvas); padding: var(--m-space-10) var(--m-space-4)">
  <div class="m-stack" data-gap="8" style="max-inline-size: 40rem; margin-inline: auto">
    <form class="m-stack" data-gap="5" style="${page}; padding: var(--m-space-8)" aria-labelledby="qr-err-form" novalidate>
      <div class="m-stack" data-gap="1">
        <h1 id="qr-err-form" style="${docTitle}">Connect your domain</h1>
        <p class="m-muted">Published pages will open at this address.</p>
      </div>
      <div class="m-alert" data-tone="danger" role="alert">
        <span class="m-alert-icon">${icon(I.alert, 16)}</span>
        <div class="m-alert-content"><div class="m-alert-title">2 things to fix</div><div class="m-alert-body">Nothing was changed. Your pages still open at alder.example/press.</div></div>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="qr-err-domain">Domain</label>
        <input class="m-input" id="qr-err-domain" value="read.alderpress" aria-invalid="true" aria-describedby="qr-err-domain-e">
        <p class="m-field-error" id="qr-err-domain-e">Add the ending, like read.alderpress.org.</p>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="qr-err-path">Start page</label>
        <select class="m-select" id="qr-err-path" aria-invalid="true" aria-describedby="qr-err-path-e"><option>Choose a page</option><option>No. 41 · November</option></select>
        <p class="m-field-error" id="qr-err-path-e">Choose the page readers see first.</p>
      </div>
      <div class="m-cluster" data-justify="end" data-gap="2">
        <button type="button" class="m-button" data-variant="ghost">Cancel</button>
        <button type="submit" class="m-button" data-variant="primary">Connect</button>
      </div>
    </form>
    <div class="m-toast-region" data-static aria-live="polite"><div class="m-toast" data-tone="danger" role="alert"><div class="m-toast-content"><p class="m-toast-title">“A bakery that never closes” didn’t publish</p><p class="m-toast-body">The cover is still uploading. It will try again in 2 minutes.</p><div class="m-toast-actions"><button type="button" class="m-button" data-size="sm">Retry now</button></div></div><button type="button" class="m-toast-close" aria-label="Dismiss">${icon(I.x, 14)}</button></div></div>
${errorPage('404', I.search, 'This page isn’t here', 'It may have been moved to another desk, or unpublished.', `<a class="m-button" data-variant="primary" href="#">${icon(I.layers, 14)} Back to the desk</a>`)}
${errorPage('500', I.alert, 'Something went wrong on our side', 'Your writing is saved on this device. Try again in a moment; nothing was lost.', `<button type="button" class="m-button" data-variant="primary">Try again</button><button type="button" class="m-button">Contact support</button>`)}
${errorPage('403', I.lock, 'This page is private', 'Only the Culture desk can open it. Ask an editor to add you.', `<button type="button" class="m-button" data-variant="primary">Ask for access</button><a class="m-button" data-variant="ghost" href="#">Go back</a>`)}
  </div>
</main>`;

export const quireRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'A toolbar of round buttons and capsule groups, page cards with soft covers, a mini month with today as a dark square, and tasks with date and flag chips.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'A collection table with tag chips; a row opens as a white page with a toggle block, tinted block decorations and page blocks as rounded cards.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One white page over a soft colour cover: a serif heading, a name field, a page-style picker and accent swatches, Continue as a capsule.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A settings column with the space on top; round close and back buttons; theme tiles, accent swatches and switches in grey grouped rows.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description: 'Inside the app shell: a large thin icon, a short heading, one sentence, a blue capsule and a white one.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The public pages: warm paper, serif headlines and prices, capital kickers, rounded plan panels, an ink capsule, and a dashed comparison table.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'A red block decoration above the form that says nothing changed, messages under each field, a toast with Retry, and whole pages for 404, 500 and no access.',
    html: errors,
  },
];
