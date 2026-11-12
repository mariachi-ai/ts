import { lucidePaths } from '../lucide';
import type { ArchetypeRecipe } from '../types';

/*
 * Folio's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with invented content from a small publishing team's workspace ("Orchard
 * Lane Press"). They follow the language's real screen patterns: a warm off-white 240px sidebar with
 * emoji page icons and quiet section labels, a bare top bar with a breadcrumb and hover-only icon
 * buttons, a white page with a large emoji, a 40px bold title and property rows, database views
 * (table, board, chart) with view tabs in grey, tinted tag pills and status pills with a dot, callouts
 * as pale tinted boxes, toggles with a small triangle, and one blue button.
 */

// Lucide icons, outlined, 1.5 on the 24px grid
const P: Record<string, string> = {
  ...lucidePaths,
  house:
    '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  inbox:
    '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  comment: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  page: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
  board: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/>',
  sort: '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
  sparkles:
    '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  collapse: '<path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/>',
  peekClose: '<path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/>',
  expandPage:
    '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  searchX:
    '<path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  status:
    '<path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>',
  select: '<circle cx="12" cy="12" r="10"/><path d="m16 10-4 4-4-4"/>',
  hash: '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
  text: '<path d="M15 18H3"/><path d="M17 6H3"/><path d="M21 12H3"/>',
  list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>',
  bars: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  palette:
    '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
  key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  building:
    '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  graduation:
    '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  feather:
    '<path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/>',
};

const icon = (name: string, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none">${P[name]}</svg>`;

// Shared inline treatments (tokens only)
const muted = 'color: var(--m-color-fg-muted)';
const subtle = 'color: var(--m-color-fg-subtle)';
const small = 'font-size: var(--m-font-size-sm)';
const xs = 'font-size: var(--m-font-size-xs)';
const hair = 'border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)';
const ellipsis = 'min-inline-size: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap';

// The small solid triangle of a toggle, pointing right when closed
const tri = (open = true) =>
  `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" style="flex: none; fill: currentColor; transform: rotate(${open ? '90' : '0'}deg)"><path d="M3 1.5v7L8.5 5z"/></svg>`;
// A toggle block: the small triangle, the line, and the content indented under it
const toggle = (summary: string, body: string, open = false) =>
  `        <details${open ? ' open' : ''} style="font-size: var(--m-font-size-md)"><summary class="m-cluster" data-gap="2" style="flex-wrap: nowrap; list-style: none; cursor: pointer; padding-block: var(--m-space-1)"><span style="display: inline-flex; inline-size: 1.25rem; justify-content: center">${tri(open)}</span>${summary}</summary><div style="padding-inline-start: 1.75rem; padding-block: var(--m-space-1)">${body}</div></details>`;
// A coloured dot (status pills, legends)
const dot = (tone: string, size = '0.5rem') =>
  `<span aria-hidden="true" style="flex: none; inline-size: ${size}; block-size: ${size}; border-radius: var(--m-radius-full); background: var(--m-color-${tone})"></span>`;
// A tag pill: a pale tint, 4px corners
const tag = (tone: string, label: string) => `<span class="m-badge"${tone ? ` data-tone="${tone}"` : ''}>${label}</span>`;
// A status pill: round, with a dot in the hue
const status = (tone: string, label: string) =>
  `<span class="m-badge"${tone ? ` data-tone="${tone}"` : ''} style="border-radius: var(--m-radius-full); padding-inline: var(--m-space-2)">${dot(tone ? `${tone}-solid` : 'fg-subtle', '0.4375rem')}${label}</span>`;
// A person: a small round initial and the name
const person = (initials: string, name: string) =>
  `<span class="m-cluster" data-gap="1" style="flex-wrap: nowrap; display: inline-flex"><span class="m-avatar" data-size="sm" style="font-size: 0.625rem">${initials}</span><span style="${ellipsis}">${name}</span></span>`;
const iconButton = (name: string, label: string, size = 'sm') =>
  `<button type="button" class="m-button" data-variant="ghost" data-size="${size}" data-icon-only aria-label="${label}">${icon(name)}</button>`;

// ── The app shell ────────────────────────────────────────────────────────────────────────────────
const navItem = (ic: string, label: string, current: string, extra = '') =>
  `        <li><a class="m-sidebar-link" href="#"${label === current ? ' aria-current="page"' : ''}>${icon(ic, 18)}<span style="${ellipsis}; flex: 1">${label}</span>${extra}</a></li>`;
const pageItem = (emoji: string, label: string, current: string) =>
  `          <li><a class="m-sidebar-link" href="#"${label === current ? ' aria-current="page"' : ''}><span aria-hidden="true" style="inline-size: 1.125rem; text-align: center; flex: none">${emoji}</span><span style="${ellipsis}; flex: 1">${label}</span></a></li>`;

const sidebar = (current: string) => `  <nav class="m-sidebar" aria-label="Workspace">
    <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding: var(--m-space-1) var(--m-space-1) var(--m-space-1) var(--m-space-2)">
      <span class="m-cluster" data-gap="2" style="flex-wrap: nowrap; font-weight: var(--m-font-weight-medium); ${small}; min-inline-size: 0"><span class="m-avatar" data-size="sm" style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg); border-radius: var(--m-radius-sm); font-size: 0.6875rem">O</span><span style="${ellipsis}">Orchard Lane Press</span>${icon('chevron-down', 14)}</span>
      ${iconButton('square-pen', 'New page')}
    </div>
    <div class="m-sidebar-section">
      <ul>
${navItem('search', 'Search', current)}
${navItem('house', 'Home', current)}
${navItem('inbox', 'Inbox', current, '<span class="m-sidebar-count">3</span>')}
${navItem('sparkles', 'Ask', current)}
      </ul>
    </div>
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Favorites</h2>
      <ul>
${pageItem('📚', 'Spring list', current)}
${pageItem('🗓️', 'Production calendar', current)}
      </ul>
    </div>
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Teamspaces</h2>
      <ul>
${pageItem('🌿', 'Editorial', current)}
${pageItem('🖋️', 'Manuscripts', current)}
${pageItem('🎨', 'Design & covers', current)}
${pageItem('📣', 'Publicity', current)}
${pageItem('🧾', 'Rights & contracts', current)}
      </ul>
    </div>
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Private</h2>
      <ul>
${pageItem('☕', 'Reading notes', current)}
${pageItem('✏️', 'Draft blurbs', current)}
      </ul>
    </div>
    <div class="m-sidebar-section" style="margin-block-start: auto">
      <ul>
${navItem('settings', 'Settings', current)}
${navItem('trash-2', 'Trash', current)}
      </ul>
    </div>
  </nav>`;

// The bare top bar: a breadcrumb on the left, quiet actions on the right
const topbar = (crumbs: string[], edited = 'Edited 2h ago') => `    <header class="m-cluster" data-justify="between" style="flex-wrap: nowrap; min-block-size: 2.75rem; padding-inline: var(--m-space-3)">
      <nav class="m-breadcrumb" aria-label="Breadcrumb" style="min-inline-size: 0; overflow: hidden"><ol style="flex-wrap: nowrap; white-space: nowrap">${crumbs
        .map((c, i) => `<li>${i === crumbs.length - 1 ? `<span aria-current="page">${c}</span>` : `<a href="#">${c}</a>`}</li>`)
        .join('')}</ol></nav>
      <div class="m-cluster" data-gap="1" style="flex-wrap: nowrap">
        <span style="${subtle}; ${small}; margin-inline-end: var(--m-space-2); white-space: nowrap">${edited}</span>
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="color: var(--m-color-fg-default)">Share</button>
        ${iconButton('comment', 'Comments')}${iconButton('clock', 'Updates')}${iconButton('star', 'Add to favorites')}${iconButton('ellipsis', 'More')}
      </div>
    </header>`;

const shell = (current: string, crumbs: string[], main: string, edited?: string) => `<div class="m-split" style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
${sidebar(current)}
  <div class="m-stack" data-gap="0">
${topbar(crumbs, edited)}
    <main>
${main}
    </main>
  </div>
</div>`;

// A page header: a large emoji, the 40px bold title, then property rows
const pageHead = (emoji: string, title: string, props = '') => `      <div class="m-stack" data-gap="2" style="padding-block-start: var(--m-space-12)">
        <span aria-hidden="true" style="font-size: 4.5rem; line-height: 1.1">${emoji}</span>
        <h1 style="font-size: var(--m-font-size-4xl); font-weight: var(--m-font-weight-bold); line-height: var(--m-font-leading-tight); letter-spacing: var(--m-font-tracking-tight); margin-block-start: var(--m-space-4)">${title}</h1>
${props}
      </div>`;
const prop = (ic: string, label: string, value: string) =>
  `          <div style="display: grid; grid-template-columns: 10rem minmax(0, 1fr); align-items: center; gap: var(--m-space-2); min-block-size: 2.125rem; ${small}"><span class="m-cluster" data-gap="2" style="${subtle}; flex-wrap: nowrap">${icon(ic)}${label}</span><span class="m-cluster" data-gap="2">${value}</span></div>`;
const props = (rows: string[]) =>
  `        <div class="m-stack" data-gap="0" style="margin-block-start: var(--m-space-3); padding-block-end: var(--m-space-3); ${hair}">
${rows.join('\n')}
        </div>`;

// A callout: a pale tinted box with an emoji, ink text
const callout = (tone: string, emoji: string, body: string) => `        <div class="m-alert"${tone ? ` data-tone="${tone}"` : ''} role="note" style="color: var(--m-color-fg-default)">
          <span class="m-alert-icon" aria-hidden="true" style="font-size: var(--m-font-size-lg)">${emoji}</span>
          <div class="m-alert-content"><div class="m-alert-body" style="color: var(--m-color-fg-default)">${body}</div></div>
        </div>`;

// View tabs above a database: grey labels, the current one on a soft pill, then the toolbar
const viewTabs = (views: [string, string][], current: string, extra = '') => `        <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; ${hair}; padding-block-end: var(--m-space-1)">
          <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Views">
${views.map(([ic, v]) => `            <button type="button" class="m-tab" role="tab" aria-selected="${v === current}"${v === current ? '' : ' tabindex="-1"'}>${icon(ic, 14)} ${v}</button>`).join('\n')}
          </div></div>
          <div class="m-cluster" data-gap="1" style="flex-wrap: nowrap">
            ${iconButton('list-filter', 'Filter')}${iconButton('sort', 'Sort')}${iconButton('search', 'Search this view')}${iconButton('ellipsis', 'View options')}${extra}
            <span class="m-cluster" data-gap="0" style="flex-wrap: nowrap; margin-inline-start: var(--m-space-1)"><button type="button" class="m-button" data-variant="primary" data-size="sm" style="border-start-end-radius: 0; border-end-end-radius: 0">New</button><button type="button" class="m-button" data-variant="primary" data-size="sm" data-icon-only aria-label="New from a template" style="border-start-start-radius: 0; border-end-start-radius: 0; border-inline-start: var(--m-border-width-thin) solid var(--m-color-accent-active); inline-size: 1.5rem">${icon('chevron-down', 14)}</button></span>
          </div>
        </div>`;

// A database section title: an icon and a 20px name, like a linked view's heading
const dbTitle = (ic: string, name: string) =>
  `        <h2 class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold); flex-wrap: nowrap">${icon(ic, 20)} ${name}</h2>`;

// ── Dashboard: the team home with a chart view and a board view ─────────────────────────────────
const bars = [
  ['Ines', 7, 3],
  ['Tomas', 5, 4],
  ['Priya', 9, 2],
  ['Malik', 4, 5],
  ['Hana', 6, 1],
];
const barChart = `<svg viewBox="0 0 400 200" width="100%" style="display: block; block-size: 12.5rem" role="img" aria-label="Pieces per editor: edited and still in draft">
              ${[40, 80, 120, 160].map((y) => `<line x1="28" x2="400" y1="${y}" y2="${y}" style="stroke: var(--m-color-border-muted)" stroke-width="1"/>`).join('')}
              ${[['12', 40], ['8', 80], ['4', 120], ['0', 160]].map(([t, y]) => `<text x="0" y="${+y + 4}" style="fill: var(--m-color-fg-subtle); font-size: 11px">${t}</text>`).join('')}
              ${bars
                .map(([n, a, b], i) => {
                  const x = 52 + i * 72;
                  const ha = (+a * 120) / 12;
                  const hb = (+b * 120) / 12;
                  return `<rect x="${x}" y="${160 - ha}" width="28" height="${ha}" rx="3" style="fill: var(--m-color-accent-default)"/><rect x="${x}" y="${160 - ha - hb - 2}" width="28" height="${hb}" rx="3" style="fill: var(--m-color-success-solid)"/><text x="${x + 14}" y="182" text-anchor="middle" style="fill: var(--m-color-fg-subtle); font-size: 11px">${n}</text>`;
                })
                .join('')}
            </svg>`;
const words = [12, 18, 15, 22, 19, 27, 24, 31, 29, 35, 33, 40];
const wordsLine = words.map((v, i) => `${i === 0 ? 'M' : 'L'}${34 + i * 33},${160 - v * 3.2}`).join(' ');
const reviews = [8, 10, 9, 14, 12, 11, 16, 15, 19, 17, 21, 20];
const reviewsLine = reviews.map((v, i) => `${i === 0 ? 'M' : 'L'}${34 + i * 33},${160 - v * 3.2}`).join(' ');
const lineChart = `<svg viewBox="0 0 400 200" width="100%" style="display: block; block-size: 12.5rem" role="img" aria-label="Words edited per week, in thousands, rising from 12 to 40; review notes rising from 8 to 20">
              ${[32, 64, 96, 128, 160].map((y) => `<line x1="28" x2="400" y1="${y}" y2="${y}" style="stroke: var(--m-color-border-muted)" stroke-width="1"/>`).join('')}
              ${[['40', 32], ['30', 64], ['20', 96], ['10', 128], ['0', 160]].map(([t, y]) => `<text x="0" y="${+y + 4}" style="fill: var(--m-color-fg-subtle); font-size: 11px">${t}</text>`).join('')}
              <path d="${wordsLine}" fill="none" style="stroke: var(--m-color-danger-solid)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
              <path d="${reviewsLine}" fill="none" style="stroke: var(--m-color-warning-solid)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
              ${['Sep', 'Oct', 'Nov'].map((m, i) => `<text x="${50 + i * 132}" y="182" style="fill: var(--m-color-fg-subtle); font-size: 11px">${m}</text>`).join('')}
            </svg>`;
const legend = (items: [string, string][]) =>
  `<div class="m-cluster" data-gap="4" style="${xs}; ${muted}">${items.map(([t, l]) => `<span class="m-cluster" data-gap="1">${dot(t)}${l}</span>`).join('')}</div>`;
const chartBlock = (ic: string, title: string, chart: string, leg: string) => `          <section class="m-stack" data-gap="3" aria-label="${title}">
            <h3 class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-semibold); padding-block-end: var(--m-space-2); ${hair}">${icon(ic, 18)} ${title}</h3>
            ${chart}
            ${leg}
          </section>`;

const boardCard = (emoji: string, title: string, who: string, due: string, tags: string, pct?: number) => `              <article class="m-card" data-size="sm" style="gap: var(--m-space-2)">
                <h4 class="m-card-title m-cluster" data-gap="2" style="flex-wrap: nowrap; align-items: flex-start"><span aria-hidden="true">${emoji}</span><span>${title}</span></h4>
                <div style="${xs}">${who}</div>
${pct === undefined ? '' : `                <div class="m-cluster" data-gap="2" style="${xs}; flex-wrap: nowrap"><span style="min-inline-size: 2rem">${pct}%</span><progress class="m-progress" data-size="sm" value="${pct}" max="100" aria-label="${title}: ${pct}% done" style="inline-size: 6rem"></progress></div>\n`}                <div style="${xs}; ${muted}">${due}</div>
                <div class="m-cluster" data-gap="1">${tags}</div>
              </article>`;
const boardColumn = (pill: string, count: number, cards: string) => `            <section class="m-stack" data-gap="2" style="flex: 0 0 16.5rem; padding: var(--m-space-2); border-radius: var(--m-radius-lg); background: var(--m-color-bg-sunken)">
              <div class="m-cluster" data-gap="2" style="padding-inline: var(--m-space-1)">${pill}<span style="${small}; ${subtle}">${count}</span></div>
${cards}
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="justify-content: flex-start; ${subtle}">${icon('plus', 14)} New piece</button>
            </section>`;

const dashboard = shell(
  'Editorial',
  ['🌿 Editorial', 'Season home'],
  `      <div class="m-container" data-size="lg">
${pageHead(
  '🌿',
  'Season home',
  props([
    prop('users', 'Owners', `${person('IC', 'Ines Calder')} ${person('TR', 'Tomas Reyes')}`),
    prop('status', 'Season', status('success', 'On track')),
    prop('calendar', 'Ships', 'March 30, 2027'),
  ]),
)}
      <div class="m-stack" data-gap="8" style="padding-block: var(--m-space-6) var(--m-space-16)">
${callout('warning', '💡', 'Copyedits for <strong>The Salt Road</strong> are due Friday. Leave notes as comments on the page, not in the doc itself.')}
        <div class="m-grid" style="--m-layout-grid-min: 22rem; --m-layout-grid-gap: var(--m-space-10)">
${chartBlock('bars', 'Pieces per editor', barChart, legend([['accent-default', 'Edited'], ['success-solid', 'In draft']]))}
${chartBlock('chart', 'Words edited per week (k)', lineChart, legend([['danger-solid', 'Words'], ['warning-solid', 'Review notes']]))}
        </div>
        <section class="m-stack" data-gap="3" aria-labelledby="fo-board">
          <h2 id="fo-board" class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold)">${icon('board', 20)} This season</h2>
${viewTabs([['board', 'By stage'], ['table', 'All pieces'], ['calendar', 'Calendar']], 'By stage')}
          <div class="m-cluster" data-gap="3" style="align-items: flex-start; flex-wrap: nowrap; overflow-x: auto; padding-block-end: var(--m-space-2)">
${boardColumn(
  status('', 'Pitched'),
  2,
  [
    boardCard('🧭', 'A field guide to small harbours', person('PA', 'Priya Anand'), 'Due Jan 12', tag('info', 'Nonfiction') + tag('', 'Spring')),
    boardCard('🌙', 'Night trains, collected', person('HS', 'Hana Sato'), 'Due Feb 3', tag('accent', 'Essays')),
  ].join('\n'),
)}
${boardColumn(
  status('warning', 'Editing'),
  2,
  [
    boardCard('🧂', 'The Salt Road', person('IC', 'Ines Calder'), 'Copyedits due Nov 20', tag('success', 'Fiction') + tag('warning', 'Lead title'), 60),
    boardCard('🪴', 'Window boxes for slow people', person('MO', 'Malik Osei'), 'Due Dec 4', tag('info', 'Nonfiction'), 25),
  ].join('\n'),
)}
${boardColumn(
  status('success', 'Ready'),
  1,
  boardCard('📮', 'Letters to the lighthouse', person('TR', 'Tomas Reyes'), 'Sent to print Nov 2', tag('success', 'Fiction'), 100),
)}
          </div>
        </section>
      </div>
      </div>`,
);

// ── List and detail: a table view with a side peek ──────────────────────────────────────────────
// Database cells: one line each, with a hairline between columns
const vrule = 'border-inline-end: var(--m-border-width-thin) solid var(--m-color-border-default); white-space: nowrap';
const th = (ic: string, label: string, w = '') =>
  `<th scope="col" style="${vrule}${w ? `; inline-size: ${w}` : ''}"><span class="m-cluster" data-gap="1" style="flex-wrap: nowrap">${icon(ic, 14)} ${label}</span></th>`;
const row = (sel: boolean, emoji: string, title: string, st: string, who: string, kind: string, words: string, due: string) =>
  `              <tr${sel ? ' aria-selected="true" style="background: var(--m-color-accent-subtle)"' : ''}><td style="font-weight: var(--m-font-weight-medium); ${vrule}"><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span aria-hidden="true">${emoji}</span><span style="${ellipsis}">${title}</span></span></td><td style="${vrule}">${st}</td><td style="${vrule}">${who}</td><td style="${vrule}">${kind}</td><td data-numeric style="font-variant-numeric: tabular-nums; ${vrule}">${words}</td><td style="white-space: nowrap">${due}</td></tr>`;
const listTable = `          <div class="m-table-wrap">
            <table class="m-table">
              <thead><tr>${th('text', 'Title', '34%')}${th('status', 'Stage')}${th('users', 'Editor')}${th('select', 'Kind')}<th scope="col" data-numeric style="${vrule}"><span class="m-cluster" data-gap="1" data-justify="end" style="flex-wrap: nowrap">${icon('hash', 14)} Words</span></th><th scope="col" style="white-space: nowrap"><span class="m-cluster" data-gap="1" style="flex-wrap: nowrap">${icon('calendar', 14)} Due</span></th></tr></thead>
              <tbody>
${[
  row(false, '🧂', 'The Salt Road', status('warning', 'Editing'), person('IC', 'Ines Calder'), tag('success', 'Fiction'), '84,200', 'Nov 20, 2026'),
  row(true, '🌙', 'Night trains, collected', status('', 'Pitched'), person('HS', 'Hana Sato'), tag('accent', 'Essays'), '31,950', 'Feb 3, 2027'),
  row(false, '🧭', 'A field guide to small harbours', status('', 'Pitched'), person('PA', 'Priya Anand'), tag('info', 'Nonfiction'), '12,400', 'Jan 12, 2027'),
  row(false, '🪴', 'Window boxes for slow people', status('warning', 'Editing'), person('MO', 'Malik Osei'), tag('info', 'Nonfiction'), '46,075', 'Dec 4, 2026'),
  row(false, '📮', 'Letters to the lighthouse', status('success', 'Ready'), person('TR', 'Tomas Reyes'), tag('success', 'Fiction'), '67,310', 'Nov 2, 2026'),
  row(false, '🐝', 'What the hive remembers', status('danger', 'Paused'), person('PA', 'Priya Anand'), tag('warning', 'Poetry'), '9,880', '—'),
].join('\n')}
              </tbody>
            </table>
          </div>
          <div class="m-cluster" data-gap="2" style="${subtle}; ${small}; padding: var(--m-space-2); ${hair}">${icon('plus', 14)} New page</div>
          <div style="${subtle}; ${small}; padding-inline: var(--m-space-2)">Count <span style="color: var(--m-color-fg-default)">6</span> · Sum of words <span style="color: var(--m-color-fg-default); font-variant-numeric: tabular-nums">251,815</span></div>`;

const peek = `    <aside aria-label="Night trains, collected" style="position: absolute; inset-block: 0; inset-inline-end: 0; inline-size: min(30rem, 88%); overflow: auto; border-inline-start: var(--m-border-width-thin) solid var(--m-color-border-default); box-shadow: var(--m-shadow-lg); background: var(--m-color-bg-surface)">
      <div class="m-cluster" data-justify="between" style="padding: var(--m-space-2) var(--m-space-3)">
        <div class="m-cluster" data-gap="1">${iconButton('peekClose', 'Close the preview')}${iconButton('expandPage', 'Open as a full page')}</div>
        <div class="m-cluster" data-gap="1">${iconButton('link', 'Copy link')}${iconButton('ellipsis', 'More')}</div>
      </div>
      <div class="m-stack" data-gap="2" style="padding: var(--m-space-6) var(--m-space-10) var(--m-space-10)">
        <span aria-hidden="true" style="font-size: 3rem; line-height: 1.1">🌙</span>
        <h2 style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-bold); line-height: var(--m-font-leading-tight)">Night trains, collected</h2>
        <div class="m-stack" data-gap="0" style="margin-block-start: var(--m-space-2)">
${[
  prop('status', 'Stage', status('', 'Pitched')),
  prop('users', 'Editor', person('HS', 'Hana Sato')),
  prop('select', 'Kind', tag('accent', 'Essays')),
  prop('hash', 'Words', '31,950'),
  prop('calendar', 'Due', 'February 3, 2027'),
  prop('list', 'Rights', `${tag('', 'World English')}${tag('', 'Audio')}`),
].join('\n')}
        </div>
        <div style="${hair}; margin-block: var(--m-space-2)"></div>
        <div class="m-stack" data-gap="3" style="${small}">
          <div class="m-cluster" data-gap="2" style="align-items: flex-start; flex-wrap: nowrap"><span class="m-avatar" data-size="sm" style="font-size: 0.625rem">TR</span><div><span style="font-weight: var(--m-font-weight-medium)">Tomas Reyes</span> <span style="${subtle}">Yesterday</span><p>Could the Vienna piece open the book? It sets the tone better than the timetable essay.</p></div></div>
          <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span class="m-avatar" data-size="sm" style="font-size: 0.625rem">IC</span><span style="${subtle}">Add a comment…</span></div>
        </div>
        <div style="${hair}; margin-block: var(--m-space-2)"></div>
        <div class="m-prose" style="font-size: var(--m-font-size-md)">
          <p>Twelve essays about sleeping on the move, written between 2019 and last spring. Hana has the first eight in clean draft.</p>
          <ul><li>Confirm the map permissions</li><li>Pick a running order before the January meeting</li></ul>
        </div>
${toggle('Running order, first draft', '<ol style="margin: 0; padding-inline-start: 1.5em"><li>The Vienna sleeper</li><li>Timetables as literature</li><li>Bunk eleven</li></ol>', true)}
${toggle('Permissions still to clear', 'Two maps and one photograph. Priya is writing to the archive this week.')}
      </div>
    </aside>`;

const listDetail = `<div class="m-split" style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
${sidebar('Manuscripts')}
  <div class="m-stack" data-gap="0">
${topbar(['🖋️ Manuscripts', 'All manuscripts'], 'Edited just now')}
    <div style="position: relative; flex: 1; min-inline-size: 0; min-block-size: 46rem">
      <main style="min-inline-size: 0; padding: var(--m-space-10) var(--m-space-8)">
        <div class="m-stack" data-gap="3">
          <h1 style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-bold); line-height: var(--m-font-leading-tight)">All manuscripts</h1>
${viewTabs([['table', 'Everything'], ['board', 'By stage'], ['users', 'Mine']], 'Everything')}
${listTable}
        </div>
      </main>
${peek}
    </div>
  </div>
</div>`;

// ── Onboarding: one narrow centred column ───────────────────────────────────────────────────────
const useTile = (ic: string, label: string, note: string, checked = false) =>
  `            <label class="m-card" data-size="sm" style="cursor: pointer; align-items: center; text-align: center; gap: var(--m-space-1); ${checked ? 'box-shadow: 0 0 0 2px var(--m-color-border-focus)' : ''}"><input class="m-sr-only" type="radio" name="fo-use"${checked ? ' checked' : ''}><span style="${muted}">${icon(ic, 22)}</span><span style="${small}; font-weight: var(--m-font-weight-medium)">${label}</span><span style="${xs}; ${subtle}">${note}</span></label>`;

const onboarding = `<main style="min-block-size: 100vh; background: var(--m-color-bg-canvas); padding: var(--m-space-16) var(--m-space-4)">
  <div class="m-stack" data-gap="6" style="max-inline-size: 22.5rem; margin-inline: auto">
    <div class="m-stack" data-gap="1" style="align-items: center; text-align: center">
      <span class="m-avatar" data-size="lg" style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg); border-radius: var(--m-radius-md); font-size: var(--m-font-size-lg); margin-block-end: var(--m-space-4)">${icon('feather', 22)}</span>
      <h1 style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold); line-height: var(--m-font-leading-tight)">Set up your workspace</h1>
      <p style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold); line-height: var(--m-font-leading-tight); ${subtle}">Step 2 of 3</p>
    </div>
    <progress class="m-progress" data-size="sm" value="66" max="100" aria-label="Step 2 of 3" style="--m-progress-fill: var(--m-color-fg-default)">66%</progress>
    <form class="m-stack" data-gap="4">
      <div class="m-field">
        <label class="m-field-label" for="fo-ws">Workspace name</label>
        <input class="m-input" data-size="lg" id="fo-ws" value="Orchard Lane Press" aria-describedby="fo-ws-h">
        <p class="m-field-hint" id="fo-ws-h">The name of your company or team. You can change it later.</p>
      </div>
      <fieldset class="m-stack" data-gap="2" style="border: 0; padding: 0; margin: 0">
        <legend class="m-field-label" style="margin-block-end: var(--m-space-2)">What will you use it for?</legend>
        <div class="m-grid" style="--m-layout-grid-min: 6.5rem; --m-layout-grid-gap: var(--m-space-2)">
${useTile('users', 'A team', 'Shared pages', true)}
${useTile('feather', 'Just me', 'Notes and plans')}
${useTile('graduation', 'School', 'Classes and study')}
        </div>
      </fieldset>
      <div class="m-field">
        <label class="m-field-label" for="fo-invite">Invite people</label>
        <input class="m-input" data-size="lg" id="fo-invite" type="email" placeholder="Email, comma separated" aria-describedby="fo-invite-h">
        <p class="m-field-hint" id="fo-invite-h">They will get an email with a link to join.</p>
      </div>
      <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Continue</button>
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="align-self: center">Skip for now</button>
    </form>
    <p style="${xs}; ${subtle}; text-align: center">You can invite more people and change these choices any time in Settings.</p>
  </div>
</main>`;

// ── Settings: the settings window, a grouped nav beside rows with a control on the right ─────────
const setNav = (ic: string, label: string, current = false) =>
  `          <li><a class="m-sidebar-link" href="#"${current ? ' aria-current="page"' : ''}>${icon(ic, 18)} ${label}</a></li>`;
const setRow = (title: string, desc: string, control: string) => `          <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; gap: var(--m-space-8); padding-block: var(--m-space-3)">
            <div class="m-stack" data-gap="1" style="min-inline-size: 0"><div style="${small}">${title}</div><div style="${xs}; ${muted}; max-inline-size: 30rem">${desc}</div></div>
            <div style="flex: none">${control}</div>
          </div>`;
const sw = (label: string, on: boolean) =>
  `<input class="m-switch" type="checkbox" role="switch" aria-label="${label}"${on ? ' checked' : ''}>`;
const setSection = (title: string, rows: string) => `        <section class="m-stack" data-gap="0" aria-label="${title}">
          <h2 style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-medium); padding-block-end: var(--m-space-3); margin-block-end: var(--m-space-2); ${hair}">${title}</h2>
${rows}
        </section>`;

const settings = `<div style="min-block-size: 100vh; background: var(--m-color-bg-overlay); padding: var(--m-space-10) var(--m-space-4)">
  <div class="m-split" role="dialog" aria-label="Settings" style="max-inline-size: 72rem; margin-inline: auto; min-block-size: 44rem; border-radius: var(--m-radius-container); overflow: hidden; background: var(--m-color-bg-raised); box-shadow: var(--m-shadow-overlay)">
    <nav class="m-sidebar" aria-label="Settings" style="--m-sidebar-border: transparent">
      <div class="m-sidebar-section">
        <h2 class="m-sidebar-heading">Account</h2>
        <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap; padding: var(--m-space-1) var(--m-space-2)"><span class="m-avatar" data-size="sm" style="font-size: 0.625rem">IC</span><div style="min-inline-size: 0"><div style="${small}; font-weight: var(--m-font-weight-medium)">Ines Calder</div><div style="${xs}; ${muted}; ${ellipsis}">ines@orchardlane.example</div></div></div>
        <ul>
${setNav('circle-user', 'My account')}
${setNav('sliders-horizontal', 'Preferences', true)}
${setNav('bell', 'Notifications')}
${setNav('link', 'Connections')}
${setNav('globe', 'Language and time')}
        </ul>
      </div>
      <div class="m-sidebar-section">
        <h2 class="m-sidebar-heading">Workspace</h2>
        <ul>
${setNav('settings', 'General')}
${setNav('users', 'People')}
${setNav('building', 'Teamspaces')}
${setNav('key', 'Security')}
${setNav('upload', 'Import')}
${setNav('card', 'Billing')}
        </ul>
      </div>
    </nav>
    <main class="m-stack" data-gap="10" style="padding: var(--m-space-8) var(--m-space-12) var(--m-space-12); min-inline-size: 0">
${setSection(
  'Preferences',
  [
    setRow(
      'Appearance',
      'Choose how the workspace looks on this device.',
      '<select class="m-select" data-size="sm" aria-label="Appearance" style="border-color: transparent; background-color: transparent"><option>Use system setting</option><option>Light</option><option>Dark</option></select>',
    ),
    setRow('Page font', 'The default font for new pages. Each page can still pick its own.', '<select class="m-select" data-size="sm" aria-label="Page font" style="border-color: transparent; background-color: transparent"><option>Default</option><option>Serif</option><option>Mono</option></select>'),
    setRow('Open pages in side peek', 'Database pages open beside the table instead of over it.', sw('Open pages in side peek', true)),
    setRow('Small text', 'Use 14px body text on pages you create.', sw('Small text', false)),
  ].join('\n'),
)}
${setSection(
  'Start-up',
  [
    setRow('Open on start', 'What you see first when the app opens.', '<select class="m-select" data-size="sm" aria-label="Open on start" style="border-color: transparent; background-color: transparent"><option>Last visited page</option><option>Home</option></select>'),
    setRow('Show the week ahead on Home', 'A short list of due dates from every database you follow.', sw('Show the week ahead on Home', true)),
  ].join('\n'),
)}
${setSection(
  'Privacy',
  [
    setRow('Cookie settings', 'Choose which optional cookies this workspace may set.', `<button type="button" class="m-button" data-size="sm">${icon('arrow-up-right', 14)} Manage</button>`),
    setRow('Show my view history', 'People with edit access can see when you viewed a page.', sw('Show my view history', true)),
  ].join('\n'),
)}
${setSection(
  'Danger zone',
  setRow(
    'Leave Orchard Lane Press',
    'You will lose access to every teamspace and private page in this workspace.',
    '<button type="button" class="m-button" data-size="sm" style="color: var(--m-color-danger-fg); border-color: var(--m-color-danger-border)">Leave workspace</button>',
  ),
)}
    </main>
  </div>
</div>`;

// ── Empty state: a new database with no pages yet ───────────────────────────────────────────────
const template = (ic: string, name: string, note: string) =>
  `            <li><a class="m-cluster" data-gap="3" href="#" style="flex-wrap: nowrap; padding: var(--m-space-2); border-radius: var(--m-radius-md); color: var(--m-color-fg-default); text-decoration: none"><span style="${muted}">${icon(ic, 18)}</span><span style="${small}; font-weight: var(--m-font-weight-medium)">${name}</span><span style="${small}; ${subtle}">${note}</span></a></li>`;

const emptyState = shell(
  'Reading notes',
  ['☕ Reading notes'],
  `      <div class="m-container" data-size="lg">
${pageHead('☕', 'Reading notes')}
        <div class="m-stack" data-gap="3" style="padding-block: var(--m-space-6) var(--m-space-16)">
${viewTabs([['table', 'Table']], 'Table')}
          <div class="m-table-wrap">
            <table class="m-table">
              <thead><tr>${th('text', 'Name', '40%')}${th('users', 'Author')}${th('select', 'Shelf')}${th('calendar', 'Finished')}</tr></thead>
              <tbody></tbody>
            </table>
          </div>
          <div class="m-stack" data-gap="2" style="align-items: center; text-align: center; padding-block: var(--m-space-12) var(--m-space-8)">
            <span style="${subtle}">${icon('book', 32)}</span>
            <h2 style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-medium)">No notes in this view yet</h2>
            <p style="${small}; ${muted}; max-inline-size: 22rem">Each note is a page, so you can write as much as you like and still sort the list by shelf or date.</p>
            <div class="m-cluster" data-gap="2" style="margin-block-start: var(--m-space-2)">
              <button type="button" class="m-button" data-size="sm">${icon('upload', 14)} Import a list</button>
              <button type="button" class="m-button" data-variant="primary" data-size="sm">${icon('plus', 14)} New note</button>
            </div>
          </div>
          <div class="m-stack" data-gap="1" style="max-inline-size: 30rem">
            <h3 style="${xs}; ${subtle}; font-weight: var(--m-font-weight-medium); padding-inline: var(--m-space-2)">Or start from a template</h3>
            <ul class="m-stack" data-gap="0" style="list-style: none; padding: 0; margin: 0">
${template('book', 'Book notes', 'Quotes, themes, a rating')}
${template('bulb', 'Ideas log', 'One page per idea')}
${template('calendar', 'Reading plan', 'A shelf for each month')}
            </ul>
          </div>
        </div>
      </div>`,
  'Created just now',
);

// ── Pricing: the public site's plans page ───────────────────────────────────────────────────────
const feature = (t: string) =>
  `<li class="m-cluster" data-gap="2" style="flex-wrap: nowrap; align-items: flex-start; ${small}"><span style="margin-block-start: 0.15em">${icon('check', 14)}</span><span>${t}</span></li>`;
const plan = (name: string, price: string, per: string, blurb: string, cta: string, lead: string, features: string[], badge = '') => `        <div class="m-stack" data-gap="4" style="min-inline-size: 0">
          <div class="m-stack" data-gap="1">
            <h3 class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold)">${name}${badge}</h3>
            <p class="m-cluster" data-gap="2" style="align-items: baseline"><span style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold); font-variant-numeric: tabular-nums">${price}</span><span style="${small}">${per}</span></p>
            <p style="font-size: var(--m-font-size-md); line-height: var(--m-font-leading-normal); min-block-size: 3lh">${blurb}</p>
          </div>
          ${cta}
          <div class="m-stack" data-gap="2">
            <p style="${small}; font-weight: var(--m-font-weight-semibold)">${lead}</p>
            <ul class="m-stack" data-gap="2" style="list-style: none; padding: 0; margin: 0">${features.map(feature).join('')}</ul>
          </div>
        </div>`;
const softButton = (label: string) =>
  `<a class="m-button" href="#" style="inline-size: 100%; background: var(--m-color-accent-subtle); color: var(--m-color-accent-text); border-color: transparent">${label}</a>`;
const solidButton = (label: string) => `<a class="m-button" data-variant="primary" href="#" style="inline-size: 100%">${label}</a>`;
const cmpRow = (label: string, cells: string[]) =>
  `<tr><th scope="row" style="font-weight: var(--m-font-weight-regular)">${label}</th>${cells.map((c) => `<td>${c === 'yes' ? `<span aria-label="Included">${icon('check', 16)}</span>` : c}</td>`).join('')}</tr>`;
const faq = (q: string, a: string, open = false) =>
  `      <details class="m-accordion-item"${open ? ' open' : ''} style="${hair}"><summary style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium); padding-block: var(--m-space-4)">${q}</summary><div class="m-accordion-content" style="padding-block-end: var(--m-space-4); ${muted}">${a}</div></details>`;

const pricing = `<div style="background: var(--m-color-bg-canvas); min-block-size: 100vh">
  <header class="m-navbar">
    <a class="m-navbar-brand m-cluster" data-gap="2" href="#"><span class="m-avatar" data-size="sm" style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg); border-radius: var(--m-radius-sm)">${icon('feather', 14)}</span> Folio</a>
    <nav class="m-navbar-nav" aria-label="Main" style="margin-inline: auto">
      <a class="m-navbar-link" href="#">Product ${icon('chevron-down', 14)}</a>
      <a class="m-navbar-link" href="#">Templates</a>
      <a class="m-navbar-link" href="#" aria-current="page">Plans</a>
      <a class="m-navbar-link" href="#">Talk to us</a>
    </nav>
    <div class="m-navbar-actions"><a class="m-button" data-variant="ghost" href="#" style="color: var(--m-color-fg-default)">Sign in</a><a class="m-button" data-variant="primary" href="#">Start writing</a></div>
  </header>
  <main class="m-container" data-size="lg">
    <div class="m-stack" data-gap="10" style="padding-block: var(--m-space-16)">
      <h1 style="font-size: clamp(2.5rem, 6vw, 4rem); font-weight: var(--m-font-weight-bold); line-height: 1; letter-spacing: -0.035em">Write it down. Run the whole team on it.</h1>
      <div class="m-cluster" data-justify="between">
        <div class="m-cluster" data-gap="3">
          <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Billing period" style="background: var(--m-color-bg-sunken); border-radius: var(--m-radius-full); padding: 3px">
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Monthly</button>
            <button type="button" class="m-tab" role="tab" aria-selected="true" style="background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-sm); color: var(--m-color-fg-default)">Yearly</button>
          </div></div>
          <span style="${small}; color: var(--m-color-accent-text)">Two months free when you pay yearly</span>
        </div>
        <span style="${small}; ${subtle}">Prices in <span style="color: var(--m-color-fg-default); font-weight: var(--m-font-weight-medium)">USD</span></span>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 30rem; --m-layout-grid-gap: var(--m-space-6); align-items: stretch">
        <section class="m-stack" data-gap="8" aria-labelledby="fo-p-solo" style="padding: var(--m-space-8); border: var(--m-border-width-thin) solid var(--m-color-border-default); border-radius: var(--m-radius-lg)">
          <h2 id="fo-p-solo" style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-bold); line-height: var(--m-font-leading-tight); letter-spacing: var(--m-font-tracking-tight); max-inline-size: 18ch">For writing on your own, or in pairs.</h2>
          <div class="m-grid" style="--m-layout-grid-min: 13rem; --m-layout-grid-gap: var(--m-space-8)">
${plan('Personal', '$0', 'per person / month', 'Pages, databases and a sidebar for one writer’s notes and plans.', softButton('Start for free'), 'Includes:', ['Unlimited pages and blocks', 'Board, table and calendar views', 'Page history for 7 days', 'Share pages with up to 5 guests'])}
${plan('Studio', '$11', 'per person / month', 'A shared workspace for a small team that edits together.', softButton('Try Studio'), 'Everything in Personal, and:', ['Unlimited people and guests', 'Page history for 90 days', 'Charts and forms', 'Teamspaces with their own access'])}
          </div>
        </section>
        <section class="m-stack" data-gap="8" aria-labelledby="fo-p-co" style="padding: var(--m-space-8); border-radius: var(--m-radius-lg); background: var(--m-color-accent-subtle)">
          <h2 id="fo-p-co" style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-bold); line-height: var(--m-font-leading-tight); letter-spacing: var(--m-font-tracking-tight); max-inline-size: 18ch">For a whole company, with the AI built in.</h2>
          <div class="m-grid" style="--m-layout-grid-min: 13rem; --m-layout-grid-gap: var(--m-space-8)">
${plan('Company', '$22', 'per person / month', 'Ask questions of everything your company has written down.', solidButton('Try Company'), 'Everything in Studio, and:', ['Ask across every page', 'Meeting notes that write themselves', 'Single sign-on', 'Private teamspaces', 'Page history for 1 year'], ' <span class="m-badge" data-tone="info" style="background: var(--m-color-bg-surface)">Most teams</span>')}
${plan('Enterprise', 'Talk to us', '', 'Controls, audit trails and support for large organisations.', `<a class="m-button" href="#" style="inline-size: 100%; background: var(--m-color-bg-surface); border-color: transparent; color: var(--m-color-accent-text)">Contact sales</a>`, 'Everything in Company, and:', ['User provisioning', 'Audit log', 'Data residency choices', 'A named success manager'])}
          </div>
        </section>
      </div>
      <section class="m-stack" data-gap="4" aria-labelledby="fo-cmp">
        <h2 id="fo-cmp" style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight)">Compare the plans</h2>
        <div class="m-table-wrap">
          <table class="m-table">
            <thead><tr><th scope="col" style="inline-size: 28%"><span class="m-sr-only">Feature</span></th><th scope="col">Personal</th><th scope="col">Studio</th><th scope="col">Company</th><th scope="col">Enterprise</th></tr></thead>
            <tbody>
              ${cmpRow('Pages and blocks', ['Unlimited', 'Unlimited', 'Unlimited', 'Unlimited'])}
              ${cmpRow('Guests', ['5', 'Unlimited', 'Unlimited', 'Unlimited'])}
              ${cmpRow('Page history', ['7 days', '90 days', '1 year', 'Unlimited'])}
              ${cmpRow('Charts and forms', ['—', 'yes', 'yes', 'yes'])}
              ${cmpRow('Single sign-on', ['—', '—', 'yes', 'yes'])}
              ${cmpRow('Audit log', ['—', '—', '—', 'yes'])}
            </tbody>
          </table>
        </div>
      </section>
      <section class="m-stack" data-gap="2" aria-labelledby="fo-faq" style="max-inline-size: 48rem">
        <h2 id="fo-faq" style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); margin-block-end: var(--m-space-4)">Questions</h2>
        <div class="m-accordion">
${faq('Who counts as a person on a paid plan?', 'Anyone who is a member of the workspace. Guests you invite to single pages are free and don’t count.', true)}
${faq('Can I move from Studio to Company later?', 'Yes. Your pages, databases and history move with you, and we charge only for the rest of the billing period.')}
${faq('Do you offer discounts for schools and non-profits?', 'Students and teachers get Studio free with a school email. Registered non-profits get half off Company.')}
        </div>
      </section>
    </div>
  </main>
</div>`;

// ── Errors: in a field, in a form, somewhere else, and whole pages ──────────────────────────────
const errorPage = (code: string, ic: string, title: string, body: string, actions: string) => `        <section class="m-stack" data-gap="2" aria-label="${code}" style="align-items: center; text-align: center; padding-block: var(--m-space-12); ${hair}">
          <span style="${muted}">${icon(ic, 24)}</span>
          <span style="font-family: var(--m-font-family-mono); ${xs}; ${subtle}">${code}</span>
          <h2 style="font-size: 1.0625rem; font-weight: var(--m-font-weight-semibold)">${title}</h2>
          <p style="${small}; ${muted}; max-inline-size: 22rem">${body}</p>
          <div class="m-cluster" data-gap="2" style="margin-block-start: var(--m-space-3)">${actions}</div>
        </section>`;

const errors = shell(
  'Publicity',
  ['📣 Publicity', 'Launch form'],
  `      <div class="m-container" data-size="md">
${pageHead('📣', 'Launch form')}
        <div class="m-stack" data-gap="10" style="padding-block: var(--m-space-6) var(--m-space-16)">
          <form class="m-stack" data-gap="4" aria-labelledby="fo-err-form" novalidate>
            <h2 id="fo-err-form" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-semibold)">Request a launch slot</h2>
            <div class="m-alert" data-tone="danger" role="alert">
              <span class="m-alert-icon">${icon('circle-alert')}</span>
              <div class="m-alert-content"><div class="m-alert-title">2 answers need fixing</div><div class="m-alert-body">Nothing was sent. Fix the fields marked below, then submit again.</div></div>
            </div>
            <div class="m-field">
              <label class="m-field-label" for="fo-err-title">Book title</label>
              <input class="m-input" id="fo-err-title" value="" placeholder="The title on the cover" aria-invalid="true" aria-describedby="fo-err-title-e">
              <p class="m-field-error" id="fo-err-title-e">Add the title so the team can find the page.</p>
            </div>
            <div class="m-field">
              <label class="m-field-label" for="fo-err-date">Launch date</label>
              <input class="m-input" id="fo-err-date" value="Feb 30, 2027" aria-invalid="true" aria-describedby="fo-err-date-e">
              <p class="m-field-error" id="fo-err-date-e">February has 28 days in 2027. Pick another date.</p>
            </div>
            <div class="m-field">
              <label class="m-field-label" for="fo-err-kind">Kind</label>
              <select class="m-select" id="fo-err-kind"><option>Fiction</option><option>Nonfiction</option><option>Poetry</option></select>
            </div>
            <div class="m-cluster" data-justify="end" data-gap="2">
              <button type="button" class="m-button" data-variant="ghost">Cancel</button>
              <button type="submit" class="m-button" data-variant="primary">Submit</button>
            </div>
          </form>
${callout('', '🔒', 'Some pages linked here are in a private teamspace. People without access will see the link but not the page.')}
          <div class="m-toast" data-tone="danger" role="alert"><div class="m-toast-content"><div class="m-toast-title">Couldn’t move “The Salt Road”</div><div class="m-toast-body">You can’t edit the Design &amp; covers teamspace. Nothing was moved.</div></div><button type="button" class="m-button" data-size="sm">Ask for access</button></div>
${errorPage('404', 'searchX', 'This page couldn’t be found', 'It may have been moved to the trash, or the link is wrong.', `<a class="m-button" href="#">Go back</a><a class="m-button" data-variant="primary" href="#">Go to Home</a>`)}
${errorPage('500', 'circle-alert', 'Something went wrong', 'Your changes are saved. Reload the page to keep working.', `<button type="button" class="m-button">Contact support</button><button type="button" class="m-button" data-variant="primary">${icon('rotate-cw', 14)} Reload</button>`)}
${errorPage('403', 'lock', 'You don’t have access to this page', 'Ask the person who shared it, or a workspace owner, to add you.', `<a class="m-button" href="#">Go back</a><button type="button" class="m-button" data-variant="primary">Request access</button>`)}
        </div>
      </div>`,
);

export const folioRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'A team home page: the warm sidebar, a bare top bar, a large emoji and bold title with property rows, a tinted callout, two chart views and a board grouped by stage.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'A database table with grey view tabs and a blue New button, property icons in the headers, status and tag pills, a calculated footer, and the selected row open in a side peek.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One narrow centred column on white: a dark mark, a two-tone heading, small grey labels over 40px inputs, use-case tiles and a full-width blue Continue.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'The settings window over a dimmed page: a warm grouped nav on the left, sections with a hairline under each heading, and rows with a title, a grey line and a control on the right.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'A new database with only its header row: a thin grey icon, one quiet line, an outline and a blue button, then templates to start from.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The public plans page: a huge tight bold heading, a monthly or yearly pill switch, a hairline panel and a pale blue panel of plans, a comparison table and plain questions.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors with a red ring, a red callout above the form saying nothing was sent, a grey note callout, a toast for failures elsewhere, and centred whole-page errors for 404, 500 and no access.',
    html: errors,
  },
];
