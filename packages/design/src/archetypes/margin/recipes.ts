import type { ArchetypeRecipe } from '../types';

/*
 * Margin's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with invented data from a reading-seminar app ("Gloss"). They follow the
 * language's real screen patterns: a pale grey 240px rail with grey icons and a grey current row,
 * a document list with token-shape thumbnails, dot-separated meta and a progress line that doubles
 * as the row's hairline, small uppercase view tabs, a serif reading pane with yellow highlights
 * (lavender when they carry a note), a right panel with ink-underlined tabs and label-value rows,
 * keyboard hints beside actions, soft grey pill buttons and one blue one.
 */

// Lucide icons, outlined, 1.5 on the 24px grid
const icon = (paths: string, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none">${paths}</svg>`;
const I = {
  desk: '<path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M16 2v20"/>',
  syllabus:
    '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  seminars:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
  glossary:
    '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/><path d="M8 11h8"/><path d="M8 7h6"/>',
  drafts:
    '<path d="M13 21h8"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
  shelf: '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
  essay:
    '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  paper:
    '<path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
  highlighter:
    '<path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>',
  note: '<path d="M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"/><path d="M15 3v5a1 1 0 0 0 1 1h5"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1"/>',
  panel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
  panelRight: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  up: '<path d="m18 15-6-6-6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  sort: '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
  clock: '<path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/>',
  finish:
    '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  listen:
    '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  type: '<path d="M12 4v16"/><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2"/><path d="M9 20h6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
  monitor:
    '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
  keyboard:
    '<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>',
  flame: '<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/>',
  sparkles:
    '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
  calendar:
    '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  warn: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  searchX:
    '<path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  refresh:
    '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  upload:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  send: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  trash:
    '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
};

// Shared inline treatments (tokens only)
const muted = 'color: var(--m-color-fg-muted)';
const subtle = 'color: var(--m-color-fg-subtle)';
const small = 'font-size: var(--m-font-size-sm)';
const hair = 'border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)';
const hairTop = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)';
const serif = 'font-family: var(--m-font-family-serif)';
const clip = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-inline-size: 0';
// Small uppercase section labels ("DOCUMENT NOTE", "HIGHLIGHTS")
const caps = `font-family: var(--m-font-body-family); font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-wide); text-transform: uppercase; ${muted}`;
const sep = `<span aria-hidden="true" style="${subtle}">·</span>`;

// The highlighter: a pale yellow wash over a 2px deeper underline. A highlight carrying a note is lavender
const hl = (t: string) =>
  `<span style="background: linear-gradient(0deg, var(--m-color-brand-default) 0 2px, var(--m-color-brand-subtle) 2px); -webkit-box-decoration-break: clone; box-decoration-break: clone; color: inherit">${t}</span>`;
const hlNote = (t: string) =>
  `<span style="background: linear-gradient(0deg, var(--m-color-info-solid) 0 2px, var(--m-color-info-border) 2px); -webkit-box-decoration-break: clone; box-decoration-break: clone; color: inherit">${t}</span>`;
// A key hint
const kbd = (k: string) => `<kbd class="m-kbd">${k}</kbd>`;

// Thumbnails are content, so they are token shapes, never images: a book is a tinted cover with a
// serif initial; an essay or a paper is a pale page with ruled lines
const cover = (tone: string, letter: string, size = '3.875rem') =>
  `<span aria-hidden="true" style="flex: none; inline-size: ${size}; block-size: ${size}; display: grid; place-items: center; border-radius: var(--m-radius-sm); background: var(--m-color-${tone}); box-shadow: inset 0 0 0 var(--m-border-width-thin) var(--m-color-border-default); ${serif}; font-size: calc(${size} * 0.42); font-weight: var(--m-font-weight-semibold); color: var(--m-color-fg-muted)">${letter}</span>`;
const page = (size = '3.875rem') =>
  `<span aria-hidden="true" style="flex: none; inline-size: ${size}; block-size: ${size}; display: flex; flex-direction: column; justify-content: center; gap: calc(${size} * 0.1); padding-inline: calc(${size} * 0.18); border-radius: var(--m-radius-sm); background: var(--m-color-bg-sunken); box-shadow: inset 0 0 0 var(--m-border-width-thin) var(--m-color-border-default)"><span style="block-size: 3px; inline-size: 70%; border-radius: 2px; background: var(--m-color-fg-subtle)"></span><span style="block-size: 2px; border-radius: 2px; background: var(--m-color-border-strong)"></span><span style="block-size: 2px; border-radius: 2px; background: var(--m-color-border-strong)"></span><span style="block-size: 2px; inline-size: 60%; border-radius: 2px; background: var(--m-color-border-strong)"></span></span>`;
// Reading progress: the row's own hairline, filled from the left with a blue-to-violet line
const progressLine = (pct: number) =>
  `<div role="progressbar" aria-label="Read" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" style="block-size: 2px; background: var(--m-color-border-default)"><div style="inline-size: ${pct}%; block-size: 100%; background: linear-gradient(108deg, var(--m-color-accent-default), var(--m-color-info-solid))"></div></div>`;
const iconButton = (paths: string, label: string, variant = 'ghost', size = 'sm') =>
  `<button type="button" class="m-button" data-variant="${variant}" data-size="${size}" data-icon-only aria-label="${label}">${icon(paths)}</button>`;

// The mark: a highlighter-yellow tile with a dark glyph, then a plain wordmark
const mark = (size = '1.5rem', glyph = 14) =>
  `<span aria-hidden="true" style="flex: none; display: grid; place-items: center; inline-size: ${size}; block-size: ${size}; border-radius: var(--m-radius-md); background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">${icon(I.highlighter, glyph)}</span>`;

// The rail: the app's name, collapse and add; the destinations with grey icons; a collapsible unit
// group with counts; shelves under a plain heading; find, settings and the reader at the bottom
const navLink = (ic: string, label: string, current: string, extra = '', nested = false) =>
  `        <li><a class="m-sidebar-link" href="#"${label === current ? ' aria-current="page"' : ''}${nested ? ' style="padding-inline-start: var(--m-space-6)"' : ''}><span style="${muted}; display: inline-flex">${icon(ic)}</span> <span style="flex: 1; ${clip}">${label}</span>${extra}</a></li>`;
const count = (n: string) => ` <span class="m-sidebar-count">${n}</span>`;
const rail = (current: string) => `  <nav class="m-sidebar" aria-label="Main" style="display: flex; flex-direction: column; min-block-size: 100%">
    <div class="m-cluster" data-justify="between" style="padding-inline-start: var(--m-space-2)">
      <span class="m-cluster" data-gap="2" style="font-weight: var(--m-font-weight-semibold); font-size: var(--m-font-size-lg)">${mark()} Gloss</span>
      <span class="m-cluster" data-gap="1">${iconButton(I.panel, 'Hide the rail')}${iconButton(I.plus, 'Add a reading')}</span>
    </div>
    <div class="m-sidebar-section">
      <ul>
${navLink(I.desk, 'Desk', current)}
${navLink(I.syllabus, 'Syllabus', current, '', false)}
${navLink(I.essay, 'Unit 1 · Attention', current, count('6'), true)}
${navLink(I.essay, 'Unit 2 · Memory', current, count('9'), true)}
${navLink(I.essay, 'Unit 3 · Craft', current, count('4'), true)}
${navLink(I.seminars, 'Seminars', current, count('2'))}
${navLink(I.glossary, 'Glossary', current)}
${navLink(I.drafts, 'Drafts', current)}
      </ul>
    </div>
    <details class="m-sidebar-group m-sidebar-section" open>
      <summary class="m-sidebar-heading">Shelves</summary>
      <ul>
${navLink(I.shelf, 'To cite', current, count('12'))}
${navLink(I.shelf, 'Slow reads', current, count('7'))}
${navLink(I.shelf, 'Poetry', current, count('3'))}
      </ul>
    </details>
    <div class="m-sidebar-section" style="margin-block-start: auto; ${hairTop}; padding-block-start: var(--m-space-3)">
      <ul>
${navLink(I.search, 'Find', current, ` ${kbd('/')}`)}
${navLink(I.gear, 'Settings', current)}
        <li><a class="m-sidebar-link" href="#"><span class="m-avatar" data-size="sm" style="--m-avatar-size-sm: 1.25rem; font-size: 0.5625rem">IO</span> <span style="flex: 1">Ines Okafor</span></a></li>
      </ul>
    </div>
  </nav>`;

// The app frame: the rail, then the panes side by side (they stack on a phone)
// (the rail grows to the full width once the panes can't keep 60% beside it)
const frame = (current: string, panes: string) => `<div style="display: flex; flex-wrap: wrap; min-block-size: 100vh; background: var(--m-color-bg-surface)">
  <div style="flex: 1 1 15rem; display: flex; flex-direction: column">
${rail(current)}
  </div>
  <div style="flex: 999 1 0; min-inline-size: 60%; display: flex; flex-wrap: wrap">
${panes}
  </div>
</div>`;

// A pane header: a title, then the actions at the right
const paneHead = (title: string, actions: string, style = '') =>
  `<header class="m-cluster" data-justify="between" style="min-block-size: 4.0625rem; padding-inline: var(--m-space-5); ${hair}${style}">${title}<span class="m-cluster" data-gap="1">${actions}</span></header>`;

// ─── Dashboard: the desk ─────────────────────────────────────────────────────────────────────────

const docCard = (thumb: string, title: string, by: string, left: string, pct: number) =>
  `          <a class="m-card" data-interactive href="#" style="padding: 0; overflow: hidden; text-decoration: none; color: inherit">
            <div style="display: grid; place-items: center; block-size: 8.5rem; background: var(--m-color-bg-sunken); ${hair}">${thumb}</div>
            <div class="m-stack" data-gap="1" style="padding: var(--m-space-3)">
              <span class="m-card-title" style="${clip}">${title}</span>
              <span style="${small}; ${muted}; ${clip}">${by}</span>
              <span class="m-cluster" data-gap="2" style="${small}; ${subtle}">${icon(I.clock, 12)} ${left}</span>
            </div>
            ${progressLine(pct)}
          </a>`;

const sectionHead = (ic: string, title: string, action: string) =>
  `<div class="m-cluster" data-justify="between"><h2 class="m-cluster" data-gap="2" style="font-family: var(--m-font-body-family); font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-semibold); letter-spacing: 0"><span style="${muted}; display: inline-flex">${icon(ic, 18)}</span>${title} <span style="${subtle}; display: inline-flex">${icon(I.right, 14)}</span></h2>${action}</div>`;

const dueRow = (thumb: string, title: string, meta: string, due: string, tone = '') =>
  `          <li style="display: flex; gap: var(--m-space-3); align-items: center; padding-block: var(--m-space-3); ${hair}">
            ${thumb}
            <div class="m-stack" data-gap="1" style="flex: 1; min-inline-size: 0">
              <span style="font-weight: var(--m-font-weight-semibold); ${clip}">${title}</span>
              <span class="m-cluster" data-gap="2" style="${small}; ${muted}">${meta}</span>
            </div>
            <span class="m-badge"${tone ? ` data-tone="${tone}"` : ''}>${due}</span>
          </li>`;

const minutes = [
  ['Mon', 34],
  ['Tue', 52],
  ['Wed', 18],
  ['Thu', 61],
  ['Fri', 40],
  ['Sat', 75],
  ['Sun', 27],
] as const;
const weekBars = `<div role="img" aria-label="Minutes read each day this week: 307 in all" style="display: flex; align-items: flex-end; gap: var(--m-space-2); block-size: 7rem">
${minutes
  .map(
    ([d, m], i) =>
      `            <div class="m-stack" data-gap="1" style="flex: 1; align-items: center; justify-content: flex-end; block-size: 100%"><div style="inline-size: 100%; block-size: ${Math.round((m / 75) * 100)}%; border-radius: var(--m-radius-sm) var(--m-radius-sm) 0 0; background: ${i === 5 ? 'linear-gradient(180deg, var(--m-color-info-solid), var(--m-color-accent-default))' : 'var(--m-color-border-default)'}"></div><span style="font-size: var(--m-font-size-xs); ${subtle}">${d}</span></div>`,
  )
  .join('\n')}
          </div>`;

const quoteCard = (quote: string, source: string, note = '') =>
  `          <figure class="m-stack" data-gap="2" style="margin: 0; padding-block: var(--m-space-3); ${hair}">
            <blockquote style="margin: 0; ${serif}; font-size: var(--m-font-size-lg); line-height: var(--m-font-leading-relaxed)">${note ? hlNote(quote) : hl(quote)}</blockquote>
            ${note ? `<p class="m-cluster" data-gap="2" style="${small}; align-items: flex-start"><span style="color: var(--m-color-info-fg); display: inline-flex; padding-block-start: 1px">${icon(I.note, 14)}</span>${note}</p>` : ''}
            <figcaption style="${small}; ${muted}">${source}</figcaption>
          </figure>`;

const dashboard = frame(
  'Desk',
  `  <main style="flex: 1 1 32rem; min-inline-size: 0">
    ${paneHead(`<span class="m-cluster" data-gap="3"><span style="${caps}">Thursday, November 12</span></span>`, `<button type="button" class="m-button" data-variant="ghost" data-size="sm">${icon(I.search)} Find <span style="${subtle}">${kbd('/')}</span></button>${iconButton(I.panelRight, 'Show the side panel')}`)}
    <div class="m-container" style="padding-block: var(--m-space-8) var(--m-space-12)">
      <div class="m-stack" data-gap="10">
        <div class="m-stack" data-gap="2">
          <h1 style="font-size: var(--m-font-size-2xl)">Good evening, Ines</h1>
          <p style="${muted}">Four readings are due before Tuesday’s seminar. You left off in the middle of two.</p>
        </div>
        <section class="m-stack" data-gap="4" aria-label="Pick up where you left off">
          ${sectionHead(I.book, 'Pick up where you left off', `<span class="m-cluster" data-gap="1">${iconButton(I.back, 'Earlier')}${iconButton(I.right, 'Later')}</span>`)}
          <div class="m-grid" style="--m-layout-grid-min: 11.5rem">
${docCard(cover('brand-subtle', 'T', '4.5rem'), 'The Tidy Mind', 'Rosalind Achebe', '2 h 10 min left', 62)}
${docCard(page('4.5rem'), 'Why We Forget on Purpose', 'quarterlyreview.org', '14 min left', 35)}
${docCard(cover('info-bg', 'O', '4.5rem'), 'On Rereading', 'Mateo Lindqvist', '5 h 3 min left', 12)}
${docCard(page('4.5rem'), 'Notes Toward a Commonplace', 'thewideningcircle.net', '9 min left', 81)}
          </div>
        </section>
        <div class="m-grid" style="--m-layout-grid-min: 20rem; --m-layout-grid-gap: var(--m-space-10); align-items: start">
          <section class="m-stack" data-gap="2" aria-label="Due this week">
            ${sectionHead(I.calendar, 'Due this week', `<a href="#" style="${small}; color: var(--m-color-accent-text); text-decoration: none">Open syllabus</a>`)}
            <ul style="list-style: none; margin: 0; padding: 0">
${dueRow(page('2.5rem'), 'The Palace of Memory, Revisited', `${icon(I.essay, 12)} 22 min ${sep} Unit 2`, 'Mon', 'warning')}
${dueRow(cover('success-bg', 'S', '2.5rem'), 'Spaced Out: A History of Review', `${icon(I.book, 12)} Ch. 3–4 ${sep} Unit 2`, 'Tue')}
${dueRow(page('2.5rem'), 'Encoding and the Second Look', `${icon(I.paper, 12)} 31 min ${sep} Unit 2`, 'Tue')}
${dueRow(cover('accent-subtle', 'M', '2.5rem'), 'Marginal Notes', `${icon(I.book, 12)} Preface ${sep} Unit 3`, 'Thu')}
            </ul>
          </section>
          <section class="m-stack" data-gap="6" aria-label="This week">
            <div class="m-stack" data-gap="4">
              ${sectionHead(I.flame, 'This week', `<span style="${small}; ${muted}">307 min ${sep} 48 highlights</span>`)}
${weekBars}
            </div>
            <div class="m-stack" data-gap="1">
              <h3 style="${caps}">Recent highlights</h3>
${quoteCard('Forgetting is not the failure of memory but its editor, deciding what deserves a second reading.', 'Why We Forget on Purpose · 2 h ago')}
${quoteCard('Every margin is an argument with the page.', 'Notes Toward a Commonplace · yesterday', 'Use this to open Tuesday’s discussion.')}
            </div>
          </section>
        </div>
      </div>
    </div>
  </main>`,
);

// ─── List and detail: the unit's readings beside the open one ─────────────────────────────────────

const docRow = (
  thumb: string,
  title: string,
  meta: string,
  blurb: string,
  pct: number,
  opts: { current?: boolean; unread?: boolean; due?: string } = {},
) =>
  `        <li style="position: relative; ${opts.current ? 'background: var(--m-color-bg-sunken); box-shadow: inset 3px 0 0 var(--m-color-border-focus)' : ''}">
          <a href="#" style="display: flex; gap: var(--m-space-3); padding: var(--m-space-4) var(--m-space-4) var(--m-space-3); color: inherit; text-decoration: none"${opts.current ? ' aria-current="true"' : ''}>
            ${opts.unread ? `<span aria-label="Unopened" style="position: absolute; inset-block-start: var(--m-space-3); inset-inline-start: var(--m-space-3); inline-size: 6px; block-size: 6px; border-radius: var(--m-radius-full); background: var(--m-color-accent-text)"></span>` : ''}${thumb}
            <span class="m-stack" data-gap="1" style="flex: 1; min-inline-size: 0">
              <span class="m-cluster" data-justify="between" style="flex-wrap: nowrap"><span style="font-weight: var(--m-font-weight-semibold); ${clip}">${title}</span>${opts.due ? `<span style="flex: none; font-size: var(--m-font-size-xs); ${muted}">${opts.due}</span>` : ''}</span>
              <span class="m-cluster" data-gap="2" style="${small}; ${muted}; flex-wrap: nowrap">${meta}</span>
              <span style="${small}; ${muted}; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden">${blurb}</span>
            </span>
          </a>
          <div style="margin-inline: var(--m-space-4) 0; padding-inline-start: calc(3.875rem + var(--m-space-3))">${progressLine(pct)}</div>
        </li>`;

const metaRow = (label: string, value: string) =>
  `            <div style="display: grid; grid-template-columns: 6.5rem 1fr; gap: var(--m-space-3); padding-block: var(--m-space-1)"><span style="${muted}">${label}</span><span>${value}</span></div>`;

const noteEntry = (quote: string, note: string, when: string, tone: 'hl' | 'note' = 'hl') =>
  `            <article class="m-stack" data-gap="2" style="padding-block: var(--m-space-3); ${hair}">
              <p style="${serif}; font-size: var(--m-font-size-lg); line-height: var(--m-font-leading-relaxed); padding-inline-start: var(--m-space-3); box-shadow: inset 2px 0 0 ${tone === 'note' ? 'var(--m-color-info-solid)' : 'var(--m-color-brand-default)'}">${quote}</p>
              ${note ? `<p style="padding-inline-start: var(--m-space-3)">${note}</p>` : ''}
              <span class="m-cluster" data-justify="between" style="${small}; ${subtle}; padding-inline-start: var(--m-space-3)">${when}<span class="m-cluster" data-gap="1">${iconButton(I.tag, 'Tag this highlight')}${iconButton(I.more, 'More actions')}</span></span>
            </article>`;

const viewTabs = (labels: string[], selected: string, countFor = '') =>
  `<div class="m-tabs"><div class="m-tab-list" role="tablist" aria-label="Show" style="border: 0">${labels
    .map(
      (l) =>
        `<button type="button" class="m-tab" role="tab" aria-selected="${l === selected}" style="text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide); font-size: var(--m-font-size-sm); block-size: 2rem">${l}${l === countFor ? ` <span class="m-badge" style="margin-inline-start: var(--m-space-1); block-size: 1.125rem">9</span>` : ''}</button>`,
    )
    .join('')}</div></div>`;

const listDetail = frame(
  'Unit 2 · Memory',
  `  <section aria-label="Unit 2 readings" style="flex: 1 1 22rem; min-inline-size: 0; max-inline-size: 26rem; ${'border-inline-end: var(--m-border-width-thin) solid var(--m-color-border-default)'}">
    ${paneHead(`<span class="m-cluster" data-gap="2"><span style="${muted}; display: inline-flex">${icon(I.syllabus, 18)}</span><span style="font-weight: var(--m-font-weight-semibold)">Unit 2 · Memory</span> <span style="${subtle}; display: inline-flex">${icon(I.down, 14)}</span></span>`, `<button type="button" class="m-button" data-variant="ghost" data-size="sm">${icon(I.sort)} Due date</button>`)}
    <div style="padding-inline: var(--m-space-4); ${hair}">${viewTabs(['All', 'Assigned', 'Optional', 'Discussed'], 'All', 'All')}</div>
    <ul style="list-style: none; margin: 0; padding: 0">
${docRow(page(), 'The Palace of Memory, Revisited', `${icon(I.essay, 12)} <span style="${clip}">longform.example</span> ${sep} 22 min`, 'A walk through the old method of loci, and why it still works on a crowded afternoon.', 58, { current: true, due: 'MON' })}
${docRow(cover('success-bg', 'S'), 'Spaced Out: A History of Review', `${icon(I.book, 12)} <span style="${clip}">Harriet Osei</span> ${sep} 4 h 12 min`, 'From flash cards to slips in a box: how people learned to come back to what they read.', 21, { due: 'TUE' })}
${docRow(page(), 'Encoding and the Second Look', `${icon(I.paper, 12)} <span style="${clip}">J. Varga, P. Lund</span> ${sep} 31 min`, 'Readers who paused to restate a passage recalled it twice as often a week later.', 0, { unread: true, due: 'TUE' })}
${docRow(page(), 'What the Margins Remember', `${icon(I.essay, 12)} <span style="${clip}">thelamp.example</span> ${sep} 11 min`, 'Annotated library copies as a record of a hundred quiet conversations.', 100, {})}
${docRow(cover('accent-subtle', 'F'), 'Field Notes on Forgetting', `${icon(I.book, 12)} <span style="${clip}">Ana Ferreira</span> ${sep} 3 h 40 min`, 'Short chapters on what slips away first: names, then places, then the order of things.', 0, { unread: true })}
    </ul>
    <p class="m-cluster" data-gap="2" style="padding: var(--m-space-3) var(--m-space-4); ${small}; ${muted}">${kbd('J')} ${kbd('K')} to move ${sep} ${kbd('E')} to finish ${sep} ${kbd('H')} to highlight</p>
  </section>
  <main style="flex: 3 1 30rem; min-inline-size: 0">
    ${paneHead(`<span class="m-cluster" data-gap="1">${iconButton(I.back, 'Back to the list')}${iconButton(I.up, 'Previous reading')}${iconButton(I.down, 'Next reading')}${iconButton(I.type, 'Type and layout')}</span>`, `${iconButton(I.listen, 'Listen')}${iconButton(I.clock, 'Save for later')}${iconButton(I.finish, 'Finish')}${iconButton(I.more, 'More actions')}`, '; min-block-size: 3.25rem; border-block-end: 0')}
    <div style="display: flex; flex-wrap: wrap; gap: var(--m-space-8); padding: var(--m-space-6) var(--m-space-6) var(--m-space-12)">
      <article style="flex: 1 1 24rem; min-inline-size: 0">
        <div class="m-stack" data-gap="3" style="max-inline-size: 38.25rem; margin-inline: auto">
          <span class="m-cluster" data-justify="between"><span style="${caps}">longform.example</span><button type="button" class="m-button" data-variant="ghost" data-size="sm" style="border: var(--m-border-width-thin) solid var(--m-color-border-default)">${icon(I.listen, 14)} Listen</button></span>
          <h1 style="font-size: var(--m-font-size-3xl)">The Palace of Memory, Revisited</h1>
          <div class="m-cluster" data-justify="between" style="${small}; ${muted}; padding-block: var(--m-space-3); ${hairTop}"><span>Odile Marchetti ${sep} 22 min</span><span>Oct 30</span></div>
          <div class="m-prose" style="${serif}; padding-block-start: var(--m-space-3)">
            <p>The method is older than the printed page. You walk through a building you know well and leave one thing to remember in each room: a name on the stair, a date by the window, a whole argument folded into the coat on the hook.</p>
            <p>${hl('What surprised me, coming back to it after years, is how little the building matters.')} A kitchen works as well as a cathedral. ${hlNote('What matters is the walk: the order you pass things in, and the small effort of placing each one where you will trip over it again.')}</p>
            <blockquote><p>Memory is not a vault but a route, and a route is something you can learn.</p></blockquote>
            <p>Readers do a version of this without noticing. We remember that a line was near the bottom of a left-hand page, just after a long footnote, and our hand finds it before our mind does.</p>
          </div>
        </div>
      </article>
      <aside aria-label="Reading notes" style="flex: 0 1 17rem; min-inline-size: 15rem">
        <div class="m-tabs">
          <div class="m-tab-list" role="tablist" aria-label="Side panel">
            <button type="button" class="m-tab" role="tab" aria-selected="true">Notes <span class="m-badge" style="block-size: 1.125rem; margin-inline-start: var(--m-space-1)">2</span></button>
            <button type="button" class="m-tab" role="tab" aria-selected="false">Terms</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false">Group</button>
          </div>
          <div class="m-tab-panel" role="tabpanel">
            <div class="m-stack" data-gap="1">
              <h2 style="${caps}">Reading note</h2>
              <input class="m-input" data-size="sm" placeholder="Add a note about the whole piece…" aria-label="Reading note">
            </div>
            <div class="m-stack" data-gap="0" style="margin-block-start: var(--m-space-6)">
              <h2 style="${caps}">Highlights</h2>
${noteEntry('What surprised me, coming back to it after years, is how little the building matters.', '', '4 min ago')}
${noteEntry('What matters is the walk: the order you pass things in…', 'Ask the group: is this true of rereading, too?', '1 min ago', 'note')}
            </div>
            <div class="m-stack" data-gap="1" style="margin-block-start: var(--m-space-6); ${small}">
              <h2 style="${caps}">Details</h2>
${metaRow('Type', 'Essay')}
${metaRow('Unit', 'Memory')}
${metaRow('Length', '22 min (4,610 words)')}
${metaRow('Progress', '58% (9 min left)')}
${metaRow('Added', 'Oct 30 by Prof. Haddad')}
            </div>
          </div>
        </div>
      </aside>
    </div>
  </main>`,
);

// ─── Onboarding: one card, one question ──────────────────────────────────────────────────────────

const themeTile = (id: string, label: string, bg: string, fg: string, checked = false) =>
  `            <label style="cursor: pointer">
              <input class="m-sr-only" type="radio" name="mg-theme" id="${id}"${checked ? ' checked' : ''}>
              <span class="m-stack" data-gap="1" style="align-items: center; justify-content: center; block-size: 6.5rem; border-radius: var(--m-radius-lg); background: var(--m-color-${bg}); color: var(--m-color-${fg}); box-shadow: inset 0 0 0 ${checked ? '3px var(--m-color-border-focus)' : 'var(--m-border-width-thin) var(--m-color-border-default)'}"><span style="${serif}; font-size: var(--m-font-size-3xl); line-height: 1">Aa</span><span style="${small}">${label}</span></span>
            </label>`;

const fontOption = (id: string, label: string, sample: string, family: string, checked = false) =>
  `            <label class="m-cluster" data-justify="between" for="${id}" style="padding: var(--m-space-3) var(--m-space-4); border-radius: var(--m-radius-control); box-shadow: inset 0 0 0 var(--m-border-width-thin) ${checked ? 'var(--m-color-border-focus)' : 'var(--m-color-border-default)'}; cursor: pointer">
              <span class="m-stack" data-gap="1"><span style="font-weight: var(--m-font-weight-medium)">${label}</span><span style="font-family: var(--m-font-family-${family}); font-size: var(--m-font-size-lg); ${muted}">${sample}</span></span>
              <input class="m-radio" type="radio" name="mg-font" id="${id}"${checked ? ' checked' : ''}>
            </label>`;

const onboarding = `<main style="min-block-size: 100vh; display: grid; place-items: center; padding: var(--m-space-10) var(--m-space-4); background: var(--m-color-bg-sunken)">
  <div class="m-stack" data-gap="6" style="inline-size: 100%; max-inline-size: 34rem">
    <span class="m-cluster" data-gap="2" style="justify-content: center; font-weight: var(--m-font-weight-semibold); font-size: var(--m-font-size-lg)">${mark('1.75rem', 16)} Gloss</span>
    <form class="m-card" data-size="lg" aria-labelledby="mg-ob-title" style="box-shadow: var(--m-shadow-md); border-color: transparent; border-radius: var(--m-radius-lg)">
      <div class="m-stack" data-gap="6">
        <div class="m-stack" data-gap="2">
          <span class="m-cluster" data-justify="between"><span style="${caps}">Step 2 of 4</span><span class="m-cluster" data-gap="1" aria-hidden="true"><span style="inline-size: 1.25rem; block-size: 3px; border-radius: 2px; background: var(--m-color-fg-default)"></span><span style="inline-size: 1.25rem; block-size: 3px; border-radius: 2px; background: var(--m-color-fg-default)"></span><span style="inline-size: 1.25rem; block-size: 3px; border-radius: 2px; background: var(--m-color-border-default)"></span><span style="inline-size: 1.25rem; block-size: 3px; border-radius: 2px; background: var(--m-color-border-default)"></span></span></span>
          <h1 id="mg-ob-title" style="font-size: var(--m-font-size-2xl)">How should pages look?</h1>
          <p style="${muted}">Pick a page and a typeface for long reading. You can change both from any document with ${kbd('Shift')} ${kbd('T')}.</p>
        </div>
        <fieldset class="m-stack" data-gap="2" style="border: 0; margin: 0; padding: 0">
          <legend style="${caps}; margin-block-end: var(--m-space-2)">Page</legend>
          <div class="m-grid" style="--m-layout-grid-min: 8rem; --m-layout-grid-gap: var(--m-space-3)">
${themeTile('mg-th-light', 'Paper', 'bg-surface', 'fg-default', true)}
${themeTile('mg-th-dim', 'Dim', 'bg-sunken', 'fg-muted')}
${themeTile('mg-th-dark', 'Night', 'bg-inverse', 'fg-inverse')}
          </div>
        </fieldset>
        <fieldset class="m-stack" data-gap="2" style="border: 0; margin: 0; padding: 0">
          <legend style="${caps}; margin-block-end: var(--m-space-2)">Typeface</legend>
${fontOption('mg-f-serif', 'Book serif', 'The second look is the real one.', 'serif', true)}
${fontOption('mg-f-sans', 'Clean sans', 'The second look is the real one.', 'sans')}
        </fieldset>
        <div class="m-field" data-layout="inline" style="justify-content: space-between">
          <label class="m-field-label" for="mg-ob-size">Text size <span style="${muted}; font-weight: var(--m-font-weight-regular)">20 px</span></label>
          <input type="range" id="mg-ob-size" min="14" max="32" value="20" style="flex: 0 1 12rem">
        </div>
        <div class="m-cluster" data-justify="between">
          <button type="button" class="m-button" data-variant="ghost">${icon(I.back)} Back</button>
          <span class="m-cluster" data-gap="3"><span style="${small}; ${subtle}">${kbd('Enter')}</span><button type="submit" class="m-button" data-variant="primary">Continue</button></span>
        </div>
      </div>
    </form>
    <p style="text-align: center; ${small}; ${muted}">Already have a reading list? <a href="#" style="color: var(--m-color-accent-text)">Bring it in</a></p>
  </div>
</main>`;

// ─── Settings: a grouped list beside label-and-control rows ───────────────────────────────────────

const setNav = (groups: [string, string[]][], current: string) =>
  groups
    .map(
      ([h, items]) => `      <div class="m-sidebar-section">
        ${h ? `<h2 class="m-sidebar-heading">${h}</h2>` : ''}
        <ul>
${items.map((t) => `          <li><a class="m-sidebar-link" href="#"${t === current ? ' aria-current="page"' : ''}>${t}</a></li>`).join('\n')}
        </ul>
      </div>`,
    )
    .join('\n');

const settingRow = (title: string, desc: string, control: string, id = '') =>
  `        <div class="m-cluster" data-justify="between" data-gap="6" style="padding-block: var(--m-space-4); ${hair}; flex-wrap: nowrap">
          <div class="m-stack" data-gap="1" style="min-inline-size: 0"><${id ? `label for="${id}"` : 'span'} style="font-weight: var(--m-font-weight-medium)">${title}</${id ? 'label' : 'span'}><span style="${muted}">${desc}</span></div>
          <div style="flex: none">${control}</div>
        </div>`;

const themeSwitch = `<div class="m-cluster" data-gap="2" role="radiogroup" aria-label="Interface theme">
            <button type="button" role="radio" aria-checked="true" aria-label="Light" style="display: grid; place-items: center; inline-size: 2rem; block-size: 2rem; border: 0; border-radius: var(--m-radius-md); background: var(--m-color-bg-surface); color: var(--m-color-fg-default); box-shadow: inset 0 0 0 2px var(--m-color-border-focus)">${icon(I.sun)}</button>
            <button type="button" role="radio" aria-checked="false" aria-label="Dark" style="display: grid; place-items: center; inline-size: 2rem; block-size: 2rem; border: 0; border-radius: var(--m-radius-md); background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)">${icon(I.moon)}</button>
            <button type="button" role="radio" aria-checked="false" aria-label="Match the system" style="display: grid; place-items: center; inline-size: 2rem; block-size: 2rem; border: 0; border-radius: var(--m-radius-md); background: linear-gradient(135deg, var(--m-color-bg-surface) 50%, var(--m-color-bg-inverse) 50%); color: var(--m-color-fg-muted); box-shadow: inset 0 0 0 var(--m-border-width-thin) var(--m-color-border-default)">${icon(I.monitor)}</button>
          </div>`;

const swatchChoice = `<div class="m-cluster" data-gap="2" role="radiogroup" aria-label="Highlight colour">
            <button type="button" role="radio" aria-checked="true" aria-label="Yellow" style="inline-size: 1.75rem; block-size: 1.75rem; border: 0; border-radius: var(--m-radius-full); background: linear-gradient(0deg, var(--m-color-brand-default) 0 3px, var(--m-color-brand-subtle) 3px); box-shadow: 0 0 0 2px var(--m-color-bg-surface), 0 0 0 4px var(--m-color-border-focus)"></button>
            <button type="button" role="radio" aria-checked="false" aria-label="Lavender" style="inline-size: 1.75rem; block-size: 1.75rem; border: 0; border-radius: var(--m-radius-full); background: linear-gradient(0deg, var(--m-color-info-solid) 0 3px, var(--m-color-info-border) 3px)"></button>
          </div>`;

const settings = frame(
  'Settings',
  `  <div style="flex: 1 1 40rem; min-inline-size: 0; display: flex; flex-wrap: wrap">
    <nav class="m-sidebar" aria-label="Settings" style="flex: 1 1 13rem; --m-sidebar-link-active-bg: transparent; --m-sidebar-link-active-fg: var(--m-color-accent-text); --m-sidebar-link-active-weight: var(--m-font-weight-regular); background: var(--m-color-bg-surface); border-inline-end: 0; padding-block-start: var(--m-space-8)">
${setNav(
  [
    ['', ['Account', 'Reading view', 'Keyboard', 'Connected apps']],
    ['Seminar', ['Group', 'Invitations', 'Plan']],
  ],
  'Reading view',
)}
    </nav>
    <main style="flex: 999 1 0; min-inline-size: 60%; padding: var(--m-space-8) var(--m-space-6) var(--m-space-12)">
      <div class="m-stack" data-gap="0" style="max-inline-size: 44rem">
        <h1 style="font-size: var(--m-font-size-2xl); margin-block-end: var(--m-space-2)">Reading view</h1>
        <p style="${muted}; margin-block-end: var(--m-space-6)">How documents open and look on this account. Changes save as you make them.</p>
${settingRow('Interface theme', 'Light, dark, or whatever your computer uses.', themeSwitch)}
${settingRow('Open to', 'The page Gloss shows when you start it.', `<select class="m-select" id="mg-open" style="min-inline-size: 10rem"><option>Desk</option><option>Syllabus</option><option>Last reading</option></select>`, 'mg-open')}
${settingRow('Move on when I finish', 'Open the next reading in the list instead of going back to it.', `<input class="m-switch" type="checkbox" role="switch" id="mg-adv" checked>`, 'mg-adv')}
${settingRow('Side panels', 'Which panels are open when a document first opens.', `<select class="m-select" id="mg-panels" style="min-inline-size: 10rem"><option>Both open</option><option>Notes only</option><option>Both closed</option></select>`, 'mg-panels')}
${settingRow('Highlight colour', 'The wash new highlights get. Highlights with a note turn lavender.', swatchChoice)}
${settingRow('Keyboard shortcuts', 'See every shortcut, or change the ones you use most.', `<a href="#" style="color: var(--m-color-accent-text); text-decoration: none">Customize</a>`)}
${settingRow('Reading assistant', 'Explain terms and summarize sections on request. Off for shared seminar copies.', `<input class="m-switch" type="checkbox" role="switch" id="mg-assist">`, 'mg-assist')}
        <div class="m-stack" data-gap="2" style="margin-block-start: var(--m-space-10)">
          <h2 style="${caps}">Leave Gloss</h2>
          <div class="m-cluster" data-justify="between" data-gap="6" style="padding-block: var(--m-space-4); ${hairTop}">
            <div class="m-stack" data-gap="1"><span style="font-weight: var(--m-font-weight-medium)">Delete account</span><span style="${small}; ${muted}">Removes your readings, highlights and notes. Group copies stay with the group.</span></div>
            <button type="button" class="m-button" data-variant="danger" data-size="sm">${icon(I.trash, 14)} Delete account</button>
          </div>
        </div>
      </div>
    </main>
  </div>`,
);

// ─── Empty state: a finished unit ────────────────────────────────────────────────────────────────

const stack = `<div aria-hidden="true" style="position: relative; inline-size: 7rem; block-size: 6rem; margin-inline: auto">
          <span style="position: absolute; inset: 0.75rem 1.5rem 0 0; transform: rotate(-8deg); border-radius: var(--m-radius-sm); background: var(--m-color-bg-sunken); box-shadow: inset 0 0 0 var(--m-border-width-thin) var(--m-color-border-default)"></span>
          <span style="position: absolute; inset: 0.25rem 0.75rem 0.5rem 0.75rem; transform: rotate(4deg); border-radius: var(--m-radius-sm); background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-sm)"></span>
          <span style="position: absolute; inset: 0 0 0.75rem 1.5rem; display: flex; flex-direction: column; justify-content: center; gap: 0.375rem; padding-inline: 0.75rem; border-radius: var(--m-radius-sm); background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-md)"><span style="block-size: 4px; inline-size: 70%; border-radius: 2px; background: var(--m-color-fg-subtle)"></span><span style="block-size: 3px; border-radius: 2px; background: linear-gradient(0deg, var(--m-color-brand-default) 0 1px, var(--m-color-brand-subtle) 1px)"></span><span style="block-size: 3px; border-radius: 2px; background: var(--m-color-border-strong)"></span><span style="block-size: 3px; inline-size: 55%; border-radius: 2px; background: var(--m-color-border-strong)"></span></span>
        </div>`;

const emptyState = frame(
  'Unit 3 · Craft',
  `  <section aria-label="Unit 3 readings" style="flex: 1 1 22rem; min-inline-size: 0; max-inline-size: 26rem; border-inline-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
    ${paneHead(`<span class="m-cluster" data-gap="2"><span style="${muted}; display: inline-flex">${icon(I.syllabus, 18)}</span><span style="font-weight: var(--m-font-weight-semibold)">Unit 3 · Craft</span></span>`, `<button type="button" class="m-button" data-variant="ghost" data-size="sm">${icon(I.sort)} Due date</button>`)}
    <div style="padding-inline: var(--m-space-4); ${hair}">${viewTabs(['Assigned', 'Optional'], 'Assigned')}</div>
    <div class="m-stack" data-gap="4" style="align-items: center; text-align: center; padding: var(--m-space-16) var(--m-space-6)">
        ${stack}
        <div class="m-stack" data-gap="2">
          <h2 style="font-size: var(--m-font-size-xl)">Nothing left to read here</h2>
          <p style="${muted}; max-inline-size: 22rem">You finished all four Unit 3 readings. New ones from Prof. Haddad will appear here first.</p>
        </div>
        <div class="m-cluster" data-gap="2" style="justify-content: center">
          <button type="button" class="m-button" data-variant="primary">${icon(I.plus)} Add a reading</button>
          <button type="button" class="m-button">Review highlights</button>
        </div>
        <p class="m-cluster" data-gap="2" style="justify-content: center; ${small}; ${muted}">Press ${kbd('A')} to add from a link, or ${kbd('Shift')} ${kbd('O')} for the optional ones</p>
    </div>
  </section>
  <main style="flex: 3 1 30rem; min-inline-size: 0; display: grid; place-items: center; background: var(--m-color-bg-sunken); padding: var(--m-space-12) var(--m-space-6)">
    <div class="m-stack" data-gap="2" style="align-items: center; text-align: center; ${muted}">
      ${icon(I.book, 40)}
      <p>Pick a reading to open it here.</p>
      <p class="m-cluster" data-gap="2" style="${small}">${kbd('J')} ${kbd('K')} to move ${sep} ${kbd('Enter')} to open</p>
    </div>
  </main>`,
);

// ─── Pricing: the public page ────────────────────────────────────────────────────────────────────

const feature = (lead: string, rest: string) =>
  `              <li class="m-cluster" data-gap="3" style="align-items: flex-start; flex-wrap: nowrap"><span style="color: var(--m-color-warning-fg); display: inline-flex; padding-block-start: 2px">${icon(I.check, 14)}</span><span style="${muted}"><strong style="color: var(--m-color-fg-default); font-weight: var(--m-font-weight-semibold)">${lead}</strong> ${rest}</span></li>`;

const tier = (tile: string, name: string, desc: string, missing: string, price: string) =>
  `      <article style="display: flex; flex-wrap: wrap; gap: var(--m-space-4) var(--m-space-6); align-items: flex-start; padding-block: var(--m-space-6) var(--m-space-4); ${hair}">
        ${tile}
        <div class="m-stack" data-gap="1" style="flex: 1 1 18rem; min-inline-size: 0">
          <h3 style="font-family: var(--m-font-body-family); font-size: var(--m-font-size-lg); letter-spacing: 0">${name}</h3>
          <p style="${muted}">${desc}<br>${missing}</p>
          <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="align-self: flex-start; padding-inline: 0; ${muted}">See what’s included ${icon(I.plus, 14)}</button>
        </div>
        <div class="m-cluster" data-gap="5" style="flex-wrap: nowrap">
          <div style="text-align: end"><span style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold); font-variant-numeric: tabular-nums">${price}</span><span style="${muted}">/mo</span><br><span style="${small}; ${muted}">billed yearly</span></div>
          <a class="m-button" data-size="lg" href="#" style="background: transparent; box-shadow: inset 0 0 0 var(--m-border-width-thin) var(--m-color-fg-default); min-inline-size: 13rem">Start free trial</a>
        </div>
      </article>`;

const tile = (paths: string, tone: string) =>
  `<span aria-hidden="true" style="flex: none; display: grid; place-items: center; inline-size: 2.5rem; block-size: 2.5rem; border-radius: var(--m-radius-lg); background: var(--m-color-${tone}); box-shadow: var(--m-shadow-sm)">${icon(paths, 20)}</span>`;

const faq = (q: string, a: string, open = false) =>
  `      <details class="m-accordion-item"${open ? ' open' : ''}><summary>${q}</summary><div class="m-accordion-content"><p>${a}</p></div></details>`;

const pricing = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  <header class="m-navbar">
    <a class="m-navbar-brand" href="#" style="gap: var(--m-space-2)">${mark('2rem', 18)} Gloss</a>
    <nav class="m-navbar-nav" aria-label="Site">
      <a class="m-navbar-link" href="#">For classes</a>
      <a class="m-navbar-link" href="#">For book clubs</a>
      <a class="m-navbar-link" href="#" aria-current="page">Pricing</a>
    </nav>
    <div class="m-navbar-actions"><a class="m-button" href="#" data-size="lg">Sign in</a></div>
  </header>
  <main class="m-container" data-size="lg" style="max-inline-size: 62rem; padding-block: var(--m-space-10) var(--m-space-16)">
    <div class="m-stack" data-gap="4" style="align-items: center; text-align: center">
      <h1 style="font-size: var(--m-font-size-4xl); letter-spacing: -0.02em">Plans for every reader</h1>
      <div class="m-tabs" data-variant="pill">
        <div class="m-tab-list" role="tablist" aria-label="Billing">
          <button type="button" class="m-tab" role="tab" aria-selected="true" style="min-inline-size: 6rem">Yearly</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" style="min-inline-size: 6rem">Monthly</button>
        </div>
      </div>
      <p style="${small}; ${muted}">Two months free when you pay for the year</p>
    </div>
    <article aria-labelledby="mg-pr-full" style="position: relative; display: flex; flex-wrap: wrap; gap: var(--m-space-8) var(--m-space-12); margin-block-start: var(--m-space-10); padding: var(--m-space-10); border-radius: calc(var(--m-radius-lg) * 2); background: linear-gradient(180deg, var(--m-color-warning-bg), var(--m-color-bg-canvas)); box-shadow: inset 0 0 0 var(--m-border-width-thin) var(--m-color-warning-solid)">
      <div class="m-stack" data-gap="5" style="flex: 1 1 20rem; min-inline-size: 0">
        <div class="m-cluster" data-justify="between">${mark('2.75rem', 24)}<span class="m-badge" data-variant="outline" data-tone="warning" style="position: absolute; inset-block-start: var(--m-space-8); inset-inline-end: var(--m-space-8); border-radius: var(--m-radius-full); block-size: 1.75rem; padding-inline: var(--m-space-2); font-size: var(--m-font-size-md); background: var(--m-color-warning-bg); box-shadow: inset 0 0 0 var(--m-border-width-thin) var(--m-color-warning-solid)">Best value</span></div>
        <h2 id="mg-pr-full" style="font-family: var(--m-font-body-family); font-size: 1.375rem; letter-spacing: 0">Seminar</h2>
        <p class="m-cluster" data-gap="3"><span style="font-size: 2.5rem; line-height: 1; font-weight: var(--m-font-weight-semibold); letter-spacing: -0.025em; font-variant-numeric: tabular-nums">$11.50</span><span style="${muted}; line-height: 1.3">per reader a month,<br>billed yearly</span></p>
        <p style="${muted}">Shared syllabi, group notes and every reading tool, for classes of up to 40.</p>
        <a class="m-button" data-variant="primary" data-size="lg" href="#" style="--m-button-primary-bg: var(--m-color-bg-inverse); --m-button-primary-hover-bg: var(--m-color-fg-default); --m-button-primary-fg: var(--m-color-fg-inverse); margin-block-start: var(--m-space-6)">Start a free term</a>
      </div>
      <ul class="m-stack" data-gap="4" style="flex: 1 1 20rem; list-style: none; margin: 0; padding: 0; align-self: center">
${feature('Everything in Solo.', 'Unlimited essays, books, papers and transcripts, with highlights and notes on all of them.')}
${feature('A shared syllabus.', 'Assign readings by unit and see who has started each one.')}
${feature('Group margins.', 'Read each other’s highlights in place, or keep yours private.')}
${feature('Exports for the term.', 'Every note as plain text, with page numbers, when the course ends.')}
        <li><button type="button" class="m-button" data-variant="ghost" data-size="sm" style="padding-inline: 0; margin-inline-start: calc(14px + var(--m-space-3)); ${muted}">Compare every feature ${icon(I.plus, 14)}</button></li>
      </ul>
    </article>
    <section aria-label="Single plans" style="margin-block-start: var(--m-space-16)">
      <h2 style="font-family: var(--m-font-body-family); font-size: var(--m-font-size-lg); letter-spacing: 0; padding-block-end: var(--m-space-4); ${hair}">Reading on your own?</h2>
${tier(tile(I.highlighter, 'brand-subtle'), 'Solo', 'Everything you read, highlighted and searchable in one place.', 'Not included: shared syllabi or group notes.', '$6.50')}
${tier(tile(I.book, 'bg-surface'), 'Books only', 'Bring in the books you own and keep their notes together.', 'Not included: essays, papers and feeds.', '$3.75')}
    </section>
    <section class="m-stack" data-gap="6" style="margin-block-start: var(--m-space-16)" aria-labelledby="mg-pr-faq">
      <h2 id="mg-pr-faq" style="text-align: center; font-size: var(--m-font-size-4xl); letter-spacing: -0.02em">Questions</h2>
      <div class="m-accordion" style="max-inline-size: 48rem; margin-inline: auto; inline-size: 100%; border-inline: 0; border-block-start: 0">
${faq('Do students need their own plan?', 'No. A Seminar plan covers every reader you invite, up to 40 a class. They sign in with the link you send.', true)}
${faq('Can I keep my notes when the course ends?', 'Yes. Your highlights and notes stay yours. Export them as plain text, or keep reading in Solo.')}
${faq('What happens after the free term?', 'Nothing is charged until you choose a plan. Readings and notes stay where they are for 60 days.')}
${faq('Do you offer prices for schools?', 'Departments with more than five classes get a yearly invoice and a shared admin view. Write to us for a quote.')}
      </div>
    </section>
  </main>
</div>`;

// ─── Errors ──────────────────────────────────────────────────────────────────────────────────────

const errorPage = (code: string, ic: string, title: string, body: string, actions: string) =>
  `        <section class="m-stack" data-gap="3" aria-label="${code}" style="align-items: center; text-align: center; padding: var(--m-space-12) var(--m-space-6); ${hairTop}">
          <span style="${subtle}">${icon(ic, 40)}</span>
          <span style="font-family: var(--m-font-family-mono); font-size: var(--m-font-size-sm); ${muted}">${code}</span>
          <h2 style="font-size: var(--m-font-size-2xl)">${title}</h2>
          <p style="${muted}; max-inline-size: 26rem">${body}</p>
          <div class="m-cluster" data-gap="2" style="justify-content: center; margin-block-start: var(--m-space-2)">${actions}</div>
        </section>`;

const errors = frame(
  'Drafts',
  `  <main style="flex: 1 1 32rem; min-inline-size: 0">
    ${paneHead(`<span style="font-weight: var(--m-font-weight-semibold)">Add a reading</span>`, iconButton(I.x, 'Close'))}
    <div class="m-container" data-size="md" style="padding-block: var(--m-space-8) var(--m-space-12)">
      <div class="m-stack" data-gap="8">
        <form class="m-stack" data-gap="5" aria-labelledby="mg-err-form" novalidate>
          <h1 id="mg-err-form" style="font-size: var(--m-font-size-2xl)">Add to Unit 2 · Memory</h1>
          <div class="m-alert" data-tone="danger" role="alert">
            <span class="m-alert-icon">${icon(I.alert)}</span>
            <div class="m-alert-content"><div class="m-alert-title">2 things need fixing</div><div class="m-alert-body">Nothing was added to the unit yet.</div></div>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="mg-err-link">Link or title</label>
            <input class="m-input" id="mg-err-link" value="longform.example/palace" aria-invalid="true" aria-describedby="mg-err-link-e">
            <p class="m-field-error" id="mg-err-link-e">This reading is already in Unit 2. Open it, or paste a different link.</p>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="mg-err-due">Due</label>
            <input class="m-input" id="mg-err-due" value="Oct 3" aria-invalid="true" aria-describedby="mg-err-due-e">
            <p class="m-field-error" id="mg-err-due-e">Pick a date after today, like Nov 17.</p>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="mg-err-note">Note for the group <span style="${muted}; font-weight: var(--m-font-weight-regular)">(optional)</span></label>
            <textarea class="m-input" id="mg-err-note" rows="2" placeholder="What should people look for?"></textarea>
            <p class="m-field-hint">Shown above the reading for everyone in the seminar.</p>
          </div>
          <div class="m-cluster" data-justify="end" data-gap="2">
            <button type="button" class="m-button" data-variant="ghost">Cancel</button>
            <button type="submit" class="m-button" data-variant="primary">Add reading</button>
          </div>
        </form>
        <div class="m-alert" data-tone="warning" role="status">
          <span class="m-alert-icon">${icon(I.warn)}</span>
          <div class="m-alert-content"><div class="m-alert-title">Some highlights couldn’t be placed</div><div class="m-alert-body">The page changed since you read it. 3 highlights are kept in Notes, without a position.</div>
          <div class="m-alert-actions"><button type="button" class="m-button" data-size="sm">Show them</button></div></div>
        </div>
        <div class="m-toast-region" data-static>
          <div class="m-toast" data-tone="danger" role="alert"><div class="m-toast-content"><div class="m-toast-title">Couldn’t save your note</div><div class="m-toast-body">You’re offline. It’s kept on this device and will sync when you reconnect.</div></div><button type="button" class="m-button" data-size="sm">Retry</button></div>
        </div>
${errorPage('404', I.searchX, 'This reading isn’t here', 'It may have been removed from the unit, or the link is out of date.', `<a class="m-button" data-variant="primary" href="#">Back to the desk</a>`)}
${errorPage('500', I.alert, 'Something went wrong on our side', 'Your highlights and notes are safe; nothing was changed. Try again in a moment.', `<button type="button" class="m-button" data-variant="primary">${icon(I.refresh)} Try again</button><button type="button" class="m-button">${icon(I.help)} Contact us</button>`)}
${errorPage('403', I.lock, 'This seminar is private', 'Only members can open its readings. Ask the person who runs it for an invitation.', `<button type="button" class="m-button" data-variant="primary">Ask to join</button><a class="m-button" data-variant="ghost" href="#">Go back</a>`)}
      </div>
    </div>
  </main>`,
);

export const marginRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'The desk: a serif greeting, readings to pick up again as document cards with progress lines, what is due as hairline rows with token thumbnails, a week of reading as quiet bars, and recent highlights in the serif.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'Three panes: the grey rail, a document list with uppercase view tabs, token thumbnails, dot-separated meta and a progress hairline, then the serif reading pane with yellow and lavender highlights beside a notes panel.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One white card on the grey canvas: an uppercase step label with a segmented bar, a serif question, page tiles and typeface rows, and the keyboard hint beside Continue.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A plain grouped list beside hairline rows: a title and one grey line on the left, the control on the right (icon toggles, small selects, switches, a blue text link), and Delete last as a red tint.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'A finished list: a small stack of page shapes, a serif heading, one sentence, a blue pill and a grey one, and the keys that do the same; the empty reader says how to open something.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The public page: a large serif title, a yearly or monthly pill toggle, one featured plan with a warm hairline and orange checks, single plans as hairline rows with outlined pills, and questions below.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors under the field, a red tint above the form saying nothing was added, a warning tint for misplaced highlights, a dark toast for failures elsewhere, and whole pages for 404, 500 and no access.',
    html: errors,
  },
];
