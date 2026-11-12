import type { ArchetypeRecipe } from '../types';

/*
 * Flint's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from a made-up product ("Lathe", an agent workspace used by
 * the Kestrel team: repositories kestrel-api, web-console and ledger-sync). The language comes from a
 * desktop code editor, so the web translation is a dashboard-style app in its spirit: a near-black
 * side panel beside the work, an agent thread with its composer, a task list, a diff, settings as
 * grouped panels, and the public site in its warm light mode for pricing. Icons are Lucide at 1.25px.
 */

// Lucide icons, outlined, 1.25px stroke (1px at 32px and over)
const icon = (paths: string, size = 16, label?: string) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${size > 24 ? 1 : 1.25}" stroke-linecap="round" stroke-linejoin="round"${label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"'} style="flex: none">${paths}</svg>`;
const I = {
  activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  pr: '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" x2="6" y1="9" y2="21"/>',
  branch: '<path d="M15 6a9 9 0 0 0-9 9V3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>',
  siren: '<path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/><path d="M21 12h1"/><path d="M18.5 4.5 18 5"/><path d="M2 12h1"/><path d="M12 2v1"/><path d="m4.929 4.929.707.707"/><path d="M12 12v6"/>',
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  settings: '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',
  keyboard: '<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  ellipsis: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  left: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  arrowUp: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  arrowUpRight: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  file: '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/>',
  fileCode: '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 12.5 8 15l2 2.5"/><path d="m14 12.5 2 2.5-2 2.5"/>',
  rotate: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  trash: '<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  mic: '<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/>',
  paperclip: '<path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  alert: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  clock: '<path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/>',
  terminal: '<path d="M12 19h8"/><path d="m4 17 6-6-6-6"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
  panel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  user: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>',
  palette: '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  webhook: '<path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2"/><path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06"/><path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
  merge: '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>',
  filter: '<path d="M2 5h20"/><path d="M6 12h12"/><path d="M9 19h6"/>',
  loader: '<path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>',
  triangle: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  compass: '<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/>',
  serverOff: '<path d="M7 2h13a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-5"/><path d="M10 10 2.5 2.5C2 2 2 2.5 2 5v3a2 2 0 0 0 2 2h6z"/><path d="M22 17v-1a2 2 0 0 0-2-2h-1"/><path d="M4 14a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16.5l1-.5.5.5-8-8H4z"/><path d="M6 18h.01"/><path d="m2 2 20 20"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  thumbsUp: '<path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/><path d="M7 10v12"/>',
  thumbsDown: '<path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/><path d="M17 14V2"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  split: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  listChecks: '<path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/>',
  arrowDownLine: '<path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/>',
};

// Type and small shared styles (the compact scale: 11, 12, 13, 22)
const meta = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
const small = 'font-size: var(--m-font-size-sm)';
const ui = 'font-size: var(--m-font-size-md)';
const num = 'font-variant-numeric: tabular-nums';
const mono = 'font-family: var(--m-font-family-mono); font-size: var(--m-font-size-sm)';
const pageTitle =
  'font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-regular); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)';
const hair = 'var(--m-border-width-thin) solid var(--m-color-border-default)';
const kbd = (...keys: string[]) => keys.map((k) => `<kbd class="m-kbd">${k}</kbd>`).join(' ');
const iconBtn = (paths: string, name: string, size = 'sm') =>
  `<button type="button" class="m-button" data-variant="ghost" data-size="${size}" data-icon-only aria-label="${name}">${icon(paths, 16)}</button>`;
const avatar = (initials: string, name: string, size = 'sm') =>
  `<span class="m-avatar" data-size="${size}" role="img" aria-label="${name}" style="font-size: 9px">${initials}</span>`;
// The sample product's mark: a small orange tile with an unrelated glyph, beside a plain wordmark
const tile = (size = '18px') =>
  `<span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: ${size}; block-size: ${size}; border-radius: var(--m-radius-sm); background: var(--m-color-brand-default); color: var(--m-color-brand-fg); flex: none">${icon(I.zap, 12)}</span>`;
// A diff count: green additions, red removals, in tabular figures
const diff = (add: number, del: number) =>
  `<span style="${num}; ${small}; white-space: nowrap"><span style="color: var(--m-color-success-fg)">+${add}</span> <span style="color: var(--m-color-danger-fg)">−${del}</span></span>`;
const dot = (tone: string, label: string) =>
  `<span role="img" aria-label="${label}" style="display: inline-block; inline-size: 6px; block-size: 6px; border-radius: var(--m-radius-full); background: var(--m-color-${tone}); flex: none"></span>`;
// The working state: a ring of short strokes, muted
const working = `<span class="m-muted" style="display: inline-flex" role="img" aria-label="Working">${icon(I.loader, 14)}</span>`;

/* ---------------------------------------------------------------- the app frame */

type NavItem = [keyof typeof I, string, string?];
const navList = (items: NavItem[], current: string) =>
  `<ul>
${items
  .map(
    ([ic, l, count]) =>
      `          <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${icon(I[ic], 16)} ${l}${count ? ` <span class="m-sidebar-count">${count}</span>` : ''}</a></li>`,
  )
  .join('\n')}
        </ul>`;

const top = `<div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding: 0 0 var(--m-space-2) var(--m-space-1)">
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="padding-inline: var(--m-space-1)">${tile()} Kestrel ${icon(I.down, 12)}</button>
      <span class="m-cluster" data-gap="0" style="flex-wrap: nowrap">${iconBtn(I.search, 'Search')}${iconBtn(I.panel, 'Hide side panel')}</span>
    </div>`;
const me = `<div class="m-sidebar-section" style="margin-block-start: auto">
      <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding: var(--m-space-1) var(--m-space-2)">
        <span class="m-cluster" data-gap="2" style="${ui}; flex-wrap: nowrap">${avatar('MO', 'Mira Okafor', 'md')} <span class="m-stack" data-gap="0"><span>Mira Okafor</span><span style="font-size: var(--m-font-size-xs); color: var(--m-color-fg-muted)">Kestrel</span></span></span>
        ${iconBtn(I.settings, 'Settings')}
      </div>
    </div>`;

// The side panel: its own sections and order; the treatment (28px rows, 6px current step, quiet keys) is the reference's
const sidebar = (current: string) => `<nav class="m-sidebar" aria-label="Main" style="min-block-size: 100%">
    ${top}
    <div class="m-sidebar-section">
      <ul>
        <li><a class="m-sidebar-link" href="#">${icon(I.plus, 16)} New task <span class="m-sidebar-count">⌘N</span></a></li>
      </ul>
    </div>
    <div class="m-sidebar-section">
      ${navList(
        [
          ['activity', 'Throughput'],
          ['inbox', 'Inbox', '3'],
          ['pr', 'Reviews', '5'],
          ['branch', 'Branches'],
          ['siren', 'Incidents'],
        ],
        current,
      )}
    </div>
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Repositories</h2>
      ${navList(
        [
          ['folder', 'kestrel-api'],
          ['folder', 'web-console'],
          ['folder', 'ledger-sync'],
        ],
        current,
      )}
    </div>
    ${me}
  </nav>`;

// The page: the side panel on the darker step, the work on the panel colour
const shell = (
  side: string,
  body: string,
) => `<div class="m-split" style="--m-layout-split-side: 240px; --m-layout-split-gap: 0; min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  ${side}
  <main class="m-stack" data-gap="0" style="background: var(--m-color-bg-canvas)">
${body}
  </main>
</div>`;

// The panel's title bar: 40px, the location on the left, quiet actions on the right
const bar = (left: string, right: string) =>
  `<header class="m-cluster" data-justify="between" style="flex-wrap: nowrap; min-block-size: 40px; padding: var(--m-space-1) var(--m-space-3) var(--m-space-1) var(--m-space-4); border-block-end: ${hair}">
      <div class="m-cluster" data-gap="2" style="${small}; flex-wrap: nowrap; min-inline-size: 0">${left}</div>
      <div class="m-cluster" data-gap="1" style="flex-wrap: nowrap">${right}</div>
    </header>`;
const crumbs = (...parts: string[]) =>
  `<nav class="m-breadcrumb" aria-label="Breadcrumb"><ol>${parts
    .map((p, i) => (i === parts.length - 1 ? `<li><span aria-current="page">${p}</span></li>` : `<li><a href="#">${p}</a></li>`))
    .join('')}</ol></nav>`;

/* ---------------------------------------------------------------- dashboard */

// Changes merged per day: by an agent (green) and by hand (amber), as the reference's split bars
const days: [string, number, number][] = [
  ['Oct 30', 9, 4],
  ['Oct 31', 12, 3],
  ['Nov 1', 4, 1],
  ['Nov 2', 3, 0],
  ['Nov 3', 14, 5],
  ['Nov 4', 16, 3],
  ['Nov 5', 11, 6],
  ['Nov 6', 18, 4],
  ['Nov 7', 15, 2],
  ['Nov 8', 5, 1],
  ['Nov 9', 2, 1],
  ['Nov 10', 19, 5],
  ['Nov 11', 21, 3],
  ['Nov 12', 13, 2],
];
const chart = `<svg viewBox="0 0 700 160" width="100%" preserveAspectRatio="none" style="display: block; block-size: 160px" role="img" aria-label="Changes merged per day, Oct 30 to Nov 12: mostly by agents, rising from 13 to 24 on weekdays">
          ${[0, 1, 2, 3].map((g) => `<path d="M0 ${10 + g * 48}H700" style="stroke: var(--m-color-border-muted)"/>`).join('')}
          ${days
            .map(([, a, h], i) => {
              const k = 6;
              const x = 14 + i * 49.5;
              const ya = 154 - a * k;
              const yh = ya - h * k;
              return `<rect x="${x}" y="${ya}" width="22" height="${a * k}" rx="2" style="fill: var(--m-color-success-solid)"/>${h ? `<rect x="${x}" y="${yh}" width="22" height="${h * k - 2}" rx="2" style="fill: var(--m-color-warning-solid)"/>` : ''}`;
            })
            .join('\n          ')}
        </svg>`;
// A split bar: amber then green, as the reference's session bars
const split = (amber: number, green: number, label: string) =>
  `<span role="img" aria-label="${label}" style="display: flex; gap: 1px; inline-size: 88px; block-size: 4px; border-radius: var(--m-radius-full); overflow: hidden; background: var(--m-progress-track)"><span style="inline-size: ${amber}%; background: var(--m-color-warning-solid)"></span><span style="inline-size: ${green}%; background: var(--m-color-success-solid)"></span></span>`;
const cell = (value: string, labelText: string, first = false) =>
  `<div class="m-stack" data-gap="2" style="flex: 1 1 144px; padding: var(--m-space-3) var(--m-space-4); ${first ? '' : `border-inline-start: ${hair}`}"><span style="${meta}">${labelText}</span><span style="font-size: var(--m-font-size-xl); ${num}">${value}</span></div>`;
const changeRow = (
  title: string,
  repo: string,
  by: string,
  add: number,
  del: number,
  checks: [string, string],
  bars: [number, number],
  when: string,
) => `<tr>
                <td><a href="#" style="color: var(--m-color-fg-default); text-decoration: none">${title}</a></td>
                <td class="m-muted">${repo}</td>
                <td class="m-muted">${by}</td>
                <td>${diff(add, del)}</td>
                <td><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${dot(checks[0], checks[1])}<span class="m-muted">${checks[1]}</span></span></td>
                <td>${split(bars[0], bars[1], `${bars[1]}% reviewed`)}</td>
                <td class="m-muted" style="${num}; text-align: end">${when}</td>
              </tr>`;

const dashboard = shell(
  sidebar('Throughput'),
  `    ${bar(crumbs('Kestrel', 'Throughput'), `<button type="button" class="m-button" data-size="sm">${icon(I.clock, 14)} Last 14 days ${icon(I.down, 12)}</button> <button type="button" class="m-button" data-variant="primary" data-size="sm">${icon(I.rotate, 14)} Refresh</button>`)}
    <div class="m-container" style="padding-block: var(--m-space-8) var(--m-space-12)">
      <div class="m-stack" data-gap="6">
        <div class="m-stack" data-gap="1">
          <h1 style="${pageTitle}">Throughput</h1>
          <p class="m-muted" style="${ui}">What merged across Kestrel's repositories, and who wrote it. Agent runs count once per branch.</p>
        </div>
        <section class="m-card" aria-label="Totals">
          <div class="m-cluster" data-gap="0" data-align="stretch">
            ${cell('148', 'Merged', true)}
            ${cell('117 / 31', 'Agent / by hand')}
            ${cell('2h 40m', 'Median time to merge')}
            ${cell('6', 'Reverted')}
          </div>
        </section>
        <section class="m-card" aria-labelledby="fl-merged">
          <div class="m-card-body m-stack" data-gap="3">
            <div class="m-cluster" data-justify="between">
              <h2 id="fl-merged" style="${ui}">Merged per day</h2>
              <div class="m-cluster" data-gap="4" style="${meta}">
                <span class="m-cluster" data-gap="2">${dot('success-solid', '')} By an agent</span>
                <span class="m-cluster" data-gap="2">${dot('warning-solid', '')} By hand</span>
              </div>
            </div>
            ${chart}
            <div class="m-cluster" data-justify="between" style="${meta}; ${num}">${days
              .filter((_, i) => i % 3 === 0)
              .map(([d]) => `<span>${d}</span>`)
              .join('')}</div>
          </div>
        </section>
        <section class="m-stack" data-gap="2" aria-labelledby="fl-open">
          <div class="m-cluster" data-justify="between">
            <h2 id="fl-open" style="${ui}">Open changes <span class="m-muted" style="${num}">(14)</span></h2>
            <button type="button" class="m-button" data-variant="ghost" data-size="sm">${icon(I.filter, 14)} Filter</button>
          </div>
          <div class="m-table-wrap">
            <table class="m-table">
              <thead><tr><th scope="col">Change</th><th scope="col">Repository</th><th scope="col">Author</th><th scope="col">Diff</th><th scope="col">Checks</th><th scope="col">Review</th><th scope="col" style="text-align: end">Updated</th></tr></thead>
              <tbody>
              ${changeRow('Batch ledger writes per tenant', 'ledger-sync', 'Agent · Lena', 212, 48, ['success-solid', 'Passing'], [30, 70], '12m')}
              ${changeRow('Paginate the audit export', 'kestrel-api', 'Agent · Daniel', 96, 31, ['warning-solid', 'Running'], [60, 0], '25m')}
              ${changeRow('Keyboard focus in the date picker', 'web-console', 'Aiko Mori', 41, 9, ['success-solid', 'Passing'], [0, 100], '1h')}
              ${changeRow('Drop the legacy webhook signer', 'kestrel-api', 'Agent · Mira', 8, 164, ['danger-solid', 'Failing'], [20, 20], '2h')}
              ${changeRow('Cache currency rates for an hour', 'ledger-sync', 'Tomás Ferreira', 57, 12, ['success-solid', 'Passing'], [0, 45], '3h')}
              ${changeRow('Empty states for saved views', 'web-console', 'Agent · Sam', 133, 20, ['fg-subtle', 'Queued'], [0, 0], '5h')}
              </tbody>
            </table>
          </div>
          <div class="m-cluster" data-justify="between" style="${meta}; padding-inline: var(--m-space-3)">
            <span style="${num}">Showing 1–6 of 14</span>
            <nav class="m-pagination" aria-label="Pagination">
              <ul>
                <li><a class="m-pagination-item" aria-disabled="true" aria-label="Previous page">Prev</a></li>
                <li><span class="m-muted" style="${num}; padding-inline: var(--m-space-2)">1 / 3</span></li>
                <li><a class="m-pagination-item" href="#" aria-label="Next page">Next</a></li>
              </ul>
            </nav>
          </div>
        </section>
      </div>
    </div>`,
);

/* ---------------------------------------------------------------- list and detail */

// The task list: tasks grouped by repository, a state mark first, the age or diff on the right
type Task = [string, string, string, boolean?];
const taskRow = ([mark, title, right, current]: Task) =>
  `<li><a class="m-sidebar-link" href="#"${current ? ' aria-current="page"' : ''}><span style="display: inline-grid; place-items: center; inline-size: 16px; flex: none">${mark}</span> <span style="flex: 1; min-inline-size: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">${title}</span> <span class="m-sidebar-count">${right}</span></a></li>`;
const taskGroup = (name: string, tasks: Task[]) => `<div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">${name}</h2>
      <ul>
        ${tasks.map(taskRow).join('\n        ')}
      </ul>
    </div>`;
const done = `<span class="m-muted" style="display: inline-flex">${icon(I.checkCircle, 14, 'Finished')}</span>`;
const taskSidebar = `<nav class="m-sidebar" aria-label="Tasks" style="min-block-size: 100%">
    ${top}
    <div class="m-sidebar-section">
      <ul>
        <li><a class="m-sidebar-link" href="#">${icon(I.plus, 16)} New task <span class="m-sidebar-count">⌘N</span></a></li>
        <li><a class="m-sidebar-link" href="#">${icon(I.history, 16)} Earlier tasks</a></li>
      </ul>
    </div>
    ${taskGroup('kestrel-api', [
      [working, 'Retry failed webhook sends', '', true],
      [dot('info-solid', 'Unread'), 'Paginate the audit export', '25m'],
      [dot('fg-subtle', 'Idle'), 'Rotate signing keys', '1d'],
    ])}
    ${taskGroup('web-console', [
      [done, 'Focus ring in date picker', '1h'],
      [dot('fg-subtle', 'Idle'), 'Saved views empty states', '5h'],
    ])}
    ${taskGroup('ledger-sync', [
      [done, 'Batch ledger writes', `<span style="color: var(--m-color-success-fg)">+212</span>`],
      [done, 'Currency rate cache', '3h'],
    ])}
    ${me}
  </nav>`;

// Tool steps: a verb, then what it acted on in muted text
const step = (verb: string, what: string) =>
  `<p style="${ui}; color: var(--m-color-fg-muted)"><span style="color: var(--m-color-fg-default)">${verb}</span> ${what}</p>`;
const fileRow = (ic: string, name: string, add: number, del: number) =>
  `<li class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding: var(--m-space-1) var(--m-space-3)"><span class="m-cluster" data-gap="2" style="${small}; flex-wrap: nowrap">${icon(ic, 14)} ${name}</span>${diff(add, del)}</li>`;

// The diff: line numbers, a 2px bar in the gutter, green and red line fills
type Line = [string, string, string];
const lines: Line[] = [
  ['14', ' ', 'export async function deliver(hook: Hook, body: string) {'],
  ['15', '-', '  const res = await send(hook.url, body);'],
  ['16', '-', '  if (!res.ok) log.warn("webhook failed", hook.id);'],
  ['15', '+', '  for (let attempt = 0; attempt < policy.maxAttempts; attempt++) {'],
  ['16', '+', '    const res = await send(hook.url, body);'],
  ['17', '+', '    if (res.ok) return record(hook, attempt);'],
  ['18', '+', '    await sleep(policy.delay(attempt));'],
  ['19', '+', '  }'],
  ['20', '+', '  return park(hook, body);'],
  ['21', ' ', '}'],
];
const lineHtml = ([n, kind, text]: Line) => {
  const tone = kind === '+' ? 'success' : kind === '-' ? 'danger' : '';
  return `<div style="display: flex; ${tone ? `background: var(--m-color-${tone}-bg); box-shadow: inset 2px 0 0 var(--m-color-${tone}-solid)` : ''}"><span style="inline-size: 44px; flex: none; padding-inline-end: var(--m-space-3); text-align: end; color: var(--m-color-fg-subtle)">${n}</span><span style="white-space: pre">${text.replace(/</g, '&lt;')}</span></div>`;
};
const editorTab = (name: string, current = false) =>
  `<button type="button" class="m-tab" role="tab" aria-selected="${current}"${current ? '' : ' tabindex="-1"'}>${icon(I.fileCode, 14)} ${name}${current ? ` <span class="m-subtle" style="display: inline-flex">${icon(I.x, 12)}</span>` : ''}</button>`;

const listDetail = shell(
  taskSidebar,
  `    <div class="m-cluster" data-gap="0" data-align="stretch" style="flex: 1; flex-wrap: wrap">
      <section class="m-stack" data-gap="0" aria-label="Task" style="flex: 1 1 384px; min-inline-size: 0; border-inline-end: ${hair}">
        ${bar(`<span style="color: var(--m-color-fg-default)">Retry failed webhook sends</span> <span class="m-subtle" style="display: inline-flex">${icon(I.cloud, 14, 'Runs in the cloud')}</span>`, `${iconBtn(I.plus, 'New task')}${iconBtn(I.ellipsis, 'More')}`)}
        <div class="m-stack" data-gap="3" style="flex: 1; padding: var(--m-space-3) var(--m-space-4)">
          <div class="m-chat" data-variant="flat" role="log" aria-label="Conversation">
            <article class="m-message" data-role="user" style="display: block">
              <div class="m-message-body">Failed webhook sends are dropped after one try. Retry with backoff using the delivery policy, and park the body if every attempt fails.</div>
            </article>
          </div>
          <details class="m-thinking"><summary><span class="m-thinking-label">Thought</span><span class="m-thinking-duration">6s</span></summary><div class="m-thinking-body"><p>The policy module already exposes maxAttempts and a delay function; the sender only needs a loop and a parking call.</p></div></details>
          ${step('Read', 'delivery/retry.ts')}
          ${step('Searched', 'policy.delay usages')}
          <details class="m-tool-call" data-status="done">
            <summary><span class="m-tool-call-name" style="display: inline-flex; align-items: center; gap: var(--m-space-2)">${icon(I.terminal, 14)} Ran <span style="${mono}">pnpm test delivery</span></span><span class="m-tool-call-status">Passed</span><span class="m-tool-call-duration">9s</span></summary>
            <div class="m-tool-call-body"><pre class="m-code" tabindex="0"><code>✓ delivery/retry.test.ts (6 tests)\n✓ delivery/park.test.ts (3 tests)</code></pre></div>
          </details>
          <p style="${ui}; line-height: var(--m-font-leading-relaxed)">Sends now retry up to <strong>five times</strong> with the policy's backoff. After the last failure the body is parked in <code class="m-code-inline">webhook_parked</code>, so nothing is lost and it can be replayed from the console.</p>
          <section class="m-card" aria-label="Files changed" style="--m-card-padding-md: 0; --m-card-gap: 0">
            <div class="m-cluster" data-justify="between" style="padding: var(--m-space-2) var(--m-space-3); border-block-end: ${hair}"><span style="${small}">3 files changed</span><a href="#" style="${small}; color: var(--m-color-fg-muted); text-decoration: none">Review</a></div>
            <ul style="padding: var(--m-space-1) 0; list-style: none">
              ${fileRow(I.fileCode, 'retry.ts', 38, 6)}
              ${fileRow(I.fileCode, 'park.ts', 22, 0)}
              ${fileRow(I.file, 'retry.test.ts', 41, 2)}
            </ul>
          </section>
          <div class="m-cluster" data-gap="1" style="margin-block-start: auto; padding-block-start: var(--m-space-6)">
            <button type="button" class="m-button" data-size="sm" style="--m-button-radius: var(--m-radius-full)">Open pull request</button>
            <button type="button" class="m-button" data-size="sm" style="--m-button-radius: var(--m-radius-full)">Run checks</button>
          </div>
          <form class="m-composer">
            <label class="m-sr-only" for="fl-follow">Follow-up</label>
            <textarea class="m-composer-input" id="fl-follow" rows="1" placeholder="Send a follow-up"></textarea>
            <div class="m-composer-actions">
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Add context">${icon(I.plus, 16)}</button>
              <span class="m-badge" data-tone="warning" style="border-radius: var(--m-radius-full)">${icon(I.listChecks, 12)} Draft</span>
              <select class="m-composer-model" aria-label="Model"><option>Quarry 3 · Fast</option><option>Quarry 3</option><option>Tern mini</option></select>
              <span class="m-composer-spacer"></span>
              <button type="submit" class="m-button" data-variant="primary" data-size="sm" data-icon-only aria-label="Send" style="--m-button-radius: var(--m-radius-full)">${icon(I.arrowUp, 14)}</button>
            </div>
          </form>
          <div class="m-cluster" data-gap="3" style="${meta}"><span class="m-cluster" data-gap="1">${icon(I.branch, 12)} hooks/retry-backoff</span><span class="m-cluster" data-gap="1">${icon(I.cloud, 12)} Cloud ${icon(I.down, 12)}</span></div>
        </div>
      </section>
      <section class="m-stack" data-gap="0" aria-label="retry.ts" style="flex: 1 1 416px; min-inline-size: 0; background: var(--m-color-bg-sunken)">
        <div class="m-tabs" style="border-block-end: ${hair}; padding: var(--m-space-1) var(--m-space-2)"><div class="m-tab-list" role="tablist" aria-label="Open files" style="border: 0">${editorTab('retry.ts', true)}${editorTab('park.ts')}${editorTab('retry.test.ts')}</div></div>
        <div class="m-cluster" data-justify="between" style="padding: var(--m-space-1) var(--m-space-3) var(--m-space-1) var(--m-space-4); border-block-end: ${hair}">
          ${crumbs('src', 'delivery', 'retry.ts')}
          <span class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${diff(38, 6)} <button type="button" class="m-button" data-size="sm">${icon(I.undo, 14)} Undo</button><button type="button" class="m-button" data-variant="primary" data-size="sm">${icon(I.check, 14)} Keep</button></span>
        </div>
        <div role="region" aria-label="Diff of retry.ts" tabindex="0" style="${mono}; line-height: 1.7; padding-block: var(--m-space-2); overflow-x: auto">
          ${lines.map(lineHtml).join('\n          ')}
        </div>
      </section>
    </div>`,
);

/* ---------------------------------------------------------------- onboarding */

const repoOption = (name: string, detail: string, checked = false) =>
  `<label class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding: var(--m-space-2) var(--m-space-3); border-block-end: ${hair}; cursor: pointer">
              <input class="m-checkbox" type="checkbox"${checked ? ' checked' : ''}>
              <span class="m-stack" data-gap="0" style="flex: 1; min-inline-size: 0"><span style="${ui}">${name}</span><span style="${meta}">${detail}</span></span>
            </label>`;

const onboarding = `<div class="m-stack" data-align="center" style="min-block-size: 100vh; background: var(--m-color-bg-canvas); padding: var(--m-space-6) var(--m-space-4) var(--m-space-16)">
  <div class="m-cluster" data-justify="between" style="inline-size: 100%; max-inline-size: 1152px">
    <span class="m-cluster" data-gap="2" style="${ui}">${tile()} Lathe</span>
    <span style="${meta}; ${num}">Step 2 of 3</span>
  </div>
  <div class="m-container" data-size="sm" style="--m-layout-container-max-sm: 480px; margin-block-start: clamp(var(--m-space-8), 12vh, var(--m-space-16))">
    <div class="m-stack" data-gap="6">
      <div class="m-stack" data-gap="2">
        <div class="m-cluster" data-gap="1" role="img" aria-label="Step 2 of 3">
          <span style="inline-size: 24px; block-size: 3px; border-radius: var(--m-radius-full); background: var(--m-color-fg-default)"></span>
          <span style="inline-size: 24px; block-size: 3px; border-radius: var(--m-radius-full); background: var(--m-color-fg-default)"></span>
          <span style="inline-size: 24px; block-size: 3px; border-radius: var(--m-radius-full); background: var(--m-color-border-default)"></span>
        </div>
        <h1 style="${pageTitle}">Pick the repositories agents may work in</h1>
        <p class="m-muted" style="${ui}; line-height: var(--m-font-leading-relaxed)">Agents clone only what you choose here, each run on its own branch. You can add more later from a repository's menu.</p>
      </div>
      <fieldset class="m-card" style="--m-card-padding-md: 0; --m-card-gap: 0; padding: 0; margin: 0">
        <legend class="m-sr-only">Repositories</legend>
        <div class="m-cluster" data-justify="between" style="padding: var(--m-space-2) var(--m-space-3); border-block-end: ${hair}">
          <span class="m-cluster" data-gap="2" style="${small}">${icon(I.branch, 14)} kestrel-team</span>
          <span style="${meta}; ${num}">2 of 5 selected</span>
        </div>
        ${repoOption('kestrel-api', 'TypeScript · updated 2h ago', true)}
        ${repoOption('web-console', 'TypeScript · updated today', true)}
        ${repoOption('ledger-sync', 'Go · updated yesterday')}
        ${repoOption('mobile-shell', 'Swift · updated last week')}
        <label class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding: var(--m-space-2) var(--m-space-3); cursor: pointer">
          <input class="m-checkbox" type="checkbox">
          <span class="m-stack" data-gap="0" style="flex: 1"><span style="${ui}">infra-terraform</span><span style="${meta}">HCL · updated in March</span></span>
        </label>
      </fieldset>
      <div class="m-stack" data-gap="2">
        <button type="button" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Continue <span style="opacity: 0.6">↵</span></button>
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="align-self: center; color: var(--m-color-fg-muted)">Skip for now</button>
      </div>
      <p style="${meta}; text-align: center">Lathe never trains on your code. ${kbd('⌘', ',')} opens privacy settings at any time.</p>
    </div>
  </div>
</div>`;

/* ---------------------------------------------------------------- settings */

const settingsNav = (current: string) => `<nav class="m-sidebar" aria-label="Settings" style="min-block-size: 100%">
    <a class="m-button" data-variant="ghost" data-size="sm" href="#" style="align-self: start; color: var(--m-color-fg-muted); margin-block-end: var(--m-space-2)">${icon(I.left, 14)} Back to Lathe</a>
    <div class="m-sidebar-section">
      ${navList(
        [
          ['user', 'Profile'],
          ['palette', 'Appearance'],
          ['keyboard', 'Keyboard'],
          ['bell', 'Notifications'],
          ['lock', 'Privacy'],
        ],
        current,
      )}
    </div>
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Kestrel</h2>
      ${navList(
        [
          ['database', 'Environment'],
          ['webhook', 'Webhooks'],
          ['shield', 'Data retention'],
        ],
        current,
      )}
    </div>
  </nav>`;
const row = (title: string, help: string, control: string, last = false) =>
  `<div class="m-cluster" data-justify="between" data-gap="4" style="flex-wrap: nowrap; padding-block: var(--m-space-3); ${last ? '' : `border-block-end: ${hair}`}">
            <div class="m-stack" data-gap="0" style="min-inline-size: 0"><span style="${ui}">${title}</span><span style="${ui}; color: var(--m-color-fg-muted)">${help}</span></div>
            ${control}
          </div>`;
// A group: a muted label above one box of rows, as the reference's settings
const group = (heading: string, rows: string[]) => `<section class="m-stack" data-gap="2" aria-label="${heading}">
        <h2 style="${ui}; color: var(--m-color-fg-muted); padding-inline: var(--m-space-1)">${heading}</h2>
        <div class="m-card" style="--m-card-bg: var(--m-color-bg-raised); --m-card-radius: var(--m-radius-lg); --m-card-padding-md: 0 var(--m-space-4)">
          <div class="m-card-body m-stack" data-gap="0">
          ${rows.join('\n          ')}
          </div>
        </div>
      </section>`;
const toggle = (name: string, on: boolean) =>
  `<input class="m-switch" type="checkbox" role="switch" aria-label="${name}"${on ? ' checked' : ''}>`;
const sel = (name: string, options: string[]) =>
  `<select class="m-select" data-size="sm" aria-label="${name}" style="inline-size: auto">${options.map((o) => `<option>${o}</option>`).join('')}</select>`;

const settings = `<div class="m-split" style="--m-layout-split-side: 240px; --m-layout-split-gap: 0; min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  ${settingsNav('Notifications')}
  <main>
    <div class="m-container" data-size="md" style="padding-block: var(--m-space-10) var(--m-space-16)">
      <div class="m-stack" data-gap="8">
        <div class="m-stack" data-gap="1">
          <h1 style="${pageTitle}">Notifications</h1>
          <p class="m-muted" style="${ui}">When Lathe should interrupt you, and where. Changes save as you make them.</p>
        </div>
        ${group('When a task finishes', [
          row(
            `Tell me on this computer <span class="m-badge" data-tone="success">Allowed</span>`,
            'A system notification when an agent stops or needs an answer',
            toggle('Tell me on this computer', true),
          ),
          row('Play a sound', 'Only when the window is in the background', toggle('Play a sound', false)),
          row(
            'Quiet hours',
            'Hold notifications between these times',
            `<span class="m-cluster" data-gap="1" style="flex-wrap: nowrap">${sel('Quiet hours start', ['19:00', '20:00', '21:00'])}<span class="m-muted">to</span>${sel('Quiet hours end', ['08:00', '09:00'])}</span>`,
            true,
          ),
        ])}
        ${group('Reviews', [
          row(
            'Ask me to review',
            'When an agent opens a pull request on a repository I own',
            toggle('Ask me to review', true),
          ),
          row(
            'Daily summary',
            'One message with everything merged in the last day',
            `<input class="m-input" data-size="sm" type="email" value="mira@kestrel.dev" aria-label="Summary address" style="inline-size: 192px">`,
          ),
          row(
            'Mute ledger-sync',
            'Stop all notifications from one repository for a week',
            `<button type="button" class="m-button" data-size="sm">Mute</button>`,
            true,
          ),
        ])}
        ${group('Devices', [
          row(
            'Phone · paired',
            'Last used 4 hours ago',
            `<span class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><button type="button" class="m-button" data-variant="ghost" data-size="sm" style="color: var(--m-color-fg-muted)">Send a test</button><button type="button" class="m-button" data-size="sm">Unpair</button></span>`,
            true,
          ),
        ])}
      </div>
    </div>
  </main>
</div>`;

/* ---------------------------------------------------------------- empty state */

const emptyState = shell(
  sidebar('Incidents'),
  `    ${bar(crumbs('Kestrel', 'Incidents'), `<button type="button" class="m-button" data-size="sm">${icon(I.plus, 14)} Report</button>`)}
    <div class="m-stack" data-gap="4" data-align="center" style="flex: 1; justify-content: center; padding: var(--m-space-16) var(--m-space-6); text-align: center">
      <span class="m-subtle" style="display: inline-flex">${icon(I.siren, 40)}</span>
      <div class="m-stack" data-gap="1" data-align="center" style="max-inline-size: 384px">
        <h1 style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium)">No incidents in the last 30 days</h1>
        <p class="m-muted" style="${ui}; line-height: var(--m-font-leading-relaxed)">When an alert fires, Lathe opens an incident here and can start an agent on the failing service.</p>
      </div>
      <div class="m-cluster" data-gap="2" data-justify="center">
        <button type="button" class="m-button" data-variant="primary">Connect alerts</button>
        <button type="button" class="m-button">Read the guide</button>
      </div>
      <p class="m-cluster" data-gap="2" data-justify="center" style="${meta}; margin-block-start: var(--m-space-4)"><span>${kbd('⌘', 'N')} New task</span><span aria-hidden="true">·</span><span>${kbd('⌘', 'K')} Commands</span></p>
    </div>`,
);

/* ---------------------------------------------------------------- pricing */

// The public site: pill buttons; the one to pick is inverted, the rest a grey step
const pill = '--m-button-radius: var(--m-radius-full)';
const check = `<span style="display: inline-flex; color: var(--m-color-fg-default)">${icon(I.check, 14, 'Included')}</span>`;
const no = '<span class="m-subtle" aria-label="Not included">—</span>';
const plan = (
  name: string,
  price: string,
  per: string,
  lead: string,
  big: string,
  bigNote: string,
  features: string[],
  cta: string,
  featured = false,
) => `<section class="m-card" aria-label="${name}" style="--m-card-radius: var(--m-radius-sm); --m-card-border: transparent; --m-card-padding-md: var(--m-space-4)">
          <div class="m-card-body m-stack" data-gap="4" style="block-size: 100%">
            <div class="m-cluster" data-justify="between"><h2 style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); letter-spacing: -0.005em">${name}</h2>${featured ? '<span class="m-badge" style="--m-badge-radius: var(--m-radius-full); background: var(--m-color-brand-subtle); color: var(--m-color-fg-default)">Recommended</span>' : ''}</div>
            <p><span style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-3xl); letter-spacing: var(--m-font-tracking-tight); ${num}">${price}</span> <span style="${meta}">${per}</span></p>
            <a class="m-button" href="#" data-size="lg" ${featured ? 'data-variant="primary" ' : ''}style="${pill}; inline-size: 100%; font-size: var(--m-font-size-lg)">${cta}</a>
            <div class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-lg); color: var(--m-color-fg-muted)">${lead}</span><span style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl)">${big}</span><span style="font-size: var(--m-font-size-lg)">${bigNote}</span></div>
            <ul class="m-stack" data-gap="2" style="font-size: var(--m-font-size-lg); padding: var(--m-space-3) 0 0; border-block-start: ${hair}; list-style: none">
              ${features.map((f) => `<li class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${check} ${f}</li>`).join('\n              ')}
            </ul>
          </div>
        </section>`;
const compareRow = (feature: string, cells: string[]) =>
  `<tr><th scope="row" style="font-weight: var(--m-font-weight-regular)">${feature}</th>${cells.map((c) => `<td class="m-muted" style="text-align: center">${c === 'y' ? check : c === 'n' ? no : c}</td>`).join('')}</tr>`;

const pricing = `<div style="background: var(--m-color-bg-canvas); min-block-size: 100vh">
  <header class="m-navbar" data-sticky data-translucent>
    <a class="m-navbar-brand" href="#">${tile('20px')} Lathe</a>
    <nav class="m-navbar-nav" aria-label="Main" style="flex: 1; justify-content: center">
      <a class="m-navbar-link" href="#">Docs</a>
      <a class="m-navbar-link" href="#">Customers</a>
      <a class="m-navbar-link" href="#" aria-current="page">Pricing</a>
      <a class="m-navbar-link" href="#">Careers</a>
    </nav>
    <div class="m-navbar-actions">
      <a class="m-button" data-variant="ghost" href="#" style="${pill}; font-size: var(--m-font-size-lg)">Log in</a>
      <a class="m-button" data-variant="primary" href="#" style="${pill}; font-size: var(--m-font-size-lg)">Start building</a>
    </div>
  </header>
  <main class="m-container" style="--m-layout-container-max-lg: 1344px; padding-block: var(--m-space-12) var(--m-space-16)">
    <div class="m-stack" data-gap="10">
      <div class="m-stack" data-gap="5" data-align="center">
        <h1 style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-4xl); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)">Pricing</h1>
        <div class="m-tabs" data-variant="pill" style="--m-tabs-pill-list-bg: var(--m-color-accent-subtle); --m-tabs-pill-list-radius: var(--m-radius-full); --m-tabs-pill-list-padding: 2px; --m-tabs-pill-radius: var(--m-radius-full); --m-tabs-pill-active-bg: var(--m-color-bg-raised); --m-tabs-height: 36px; --m-tabs-padding-x: var(--m-space-5); --m-tabs-font-size: var(--m-font-size-lg)"><div class="m-tab-list" role="tablist" aria-label="Billing"><button type="button" class="m-tab" role="tab" aria-selected="true">Monthly</button><button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Yearly</button></div></div>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 240px; --m-layout-grid-gap: var(--m-space-3)">
        ${plan('Starter', '$0', '/month', 'To try it with:', 'Light', 'agent time each week', ['Two repositories', 'Code search across branches', 'Community support'], 'Download')}
        ${plan('Builder', '$18', '/month', 'For daily work:', '10 hours', 'of agent time a month', ['Unlimited repositories', 'Cloud runs on your branches', 'Every model at list price'], 'Choose Builder')}
        ${plan('Studio', '$45', '/month', 'All of Builder, plus:', '3×', 'the agent time of Builder', ['Runs in parallel', 'Review on every pull request', 'Priority at busy times', 'Usage alerts'], 'Choose Studio', true)}
        ${plan('Foundry', '$150', '/month', 'All of Studio, plus:', '12×', 'the agent time of Builder', ['Early models', 'Long-running tasks', 'A named engineer'], 'Choose Foundry')}
      </div>
      <p style="${meta}; text-align: center; max-inline-size: 704px; margin-inline: auto">Prices exclude tax. Agent time beyond your plan is billed at cost, and you can set a monthly cap. Cancel any time before renewal.</p>
      <section class="m-stack" data-gap="6" aria-labelledby="fl-compare" style="margin-block-start: var(--m-space-8)">
        <h2 id="fl-compare" style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-3xl); letter-spacing: var(--m-font-tracking-tight); text-align: center">Compare the plans</h2>
        <div class="m-table-wrap" style="--m-table-wrap-border: transparent; --m-table-wrap-radius: 0">
          <table class="m-table" style="--m-table-font-size: var(--m-font-size-lg); --m-table-cell-padding-y: var(--m-space-3)">
            <thead><tr><th scope="col"><span class="m-sr-only">Feature</span></th><th scope="col" style="text-align: center">Starter</th><th scope="col" style="text-align: center">Builder</th><th scope="col" style="text-align: center">Studio</th><th scope="col" style="text-align: center">Foundry</th></tr></thead>
            <tbody>
              ${compareRow('Agent time', ['Light', '10 hours', '3× Builder', '12× Builder'])}
              ${compareRow('Repositories', ['2', 'Unlimited', 'Unlimited', 'Unlimited'])}
              ${compareRow('Cloud runs', ['n', 'y', 'y', 'y'])}
              ${compareRow('Parallel runs', ['n', 'n', 'y', 'y'])}
              ${compareRow('Pull request review', ['n', 'n', 'y', 'y'])}
              ${compareRow('Long-running tasks', ['n', 'n', 'n', 'y'])}
            </tbody>
          </table>
        </div>
      </section>
      <section class="m-stack" data-gap="4" aria-labelledby="fl-faq" style="max-inline-size: 768px; inline-size: 100%; margin-inline: auto">
        <h2 id="fl-faq" style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl)">Questions</h2>
        <div class="m-accordion">
          <details class="m-accordion-item" open><summary>What counts as agent time?</summary><div class="m-accordion-content">The minutes an agent spends working on a task, from the first step to its last answer. Waiting for you doesn't count.</div></details>
          <details class="m-accordion-item"><summary>Can I bring my own model keys?</summary><div class="m-accordion-content">Yes. Runs that use your keys don't use your plan's agent time.</div></details>
          <details class="m-accordion-item"><summary>Do you offer team billing?</summary><div class="m-accordion-content">Studio and Foundry can be billed to one workspace with shared caps. Write to us for invoices.</div></details>
        </div>
      </section>
    </div>
  </main>
</div>`;

/* ---------------------------------------------------------------- errors */

const fullPage = (paths: string, code: string, title: string, sentence: string, actions: string) =>
  `<section class="m-card" aria-label="${code}" style="--m-card-bg: var(--m-color-bg-canvas)">
          <div class="m-card-body m-stack" data-gap="2" data-align="center" style="padding-block: var(--m-space-10); text-align: center">
            <span class="m-subtle" style="display: inline-flex">${icon(paths, 32)}</span>
            <span style="${mono}; color: var(--m-color-fg-muted)">${code}</span>
            <h3 style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium)">${title}</h3>
            <p class="m-muted" style="${ui}; max-inline-size: 320px">${sentence}</p>
            <div class="m-cluster" data-gap="2" data-justify="center" style="margin-block-start: var(--m-space-2)">${actions}</div>
          </div>
        </section>`;

const errors = shell(
  sidebar('Branches'),
  `    ${bar(crumbs('Kestrel', 'Branches', 'New schedule'), iconBtn(I.ellipsis, 'More'))}
    <div class="m-container" style="padding-block: var(--m-space-8) var(--m-space-12)">
      <div class="m-stack" data-gap="10">
        <section class="m-stack" data-gap="3" aria-labelledby="fl-form-errors">
          <h2 id="fl-form-errors" style="${meta}">In a form</h2>
          <div class="m-dialog" data-static data-size="md" role="dialog" aria-modal="false" aria-labelledby="fl-new-title">
            <header class="m-dialog-header">
              <h3 class="m-dialog-title" id="fl-new-title">Run an agent on a schedule</h3>
              ${iconBtn(I.x, 'Close')}
            </header>
            <div class="m-dialog-body m-stack" data-gap="4">
              <div class="m-alert" data-tone="danger" role="alert">
                <span class="m-alert-icon">${icon(I.alert, 16)}</span>
                <div class="m-alert-content">
                  <p class="m-alert-title">2 fields need fixing</p>
                  <p class="m-alert-body">The schedule wasn't saved.</p>
                </div>
              </div>
              <div class="m-field">
                <label class="m-field-label" for="fl-branch">Base branch</label>
                <input class="m-input" id="fl-branch" type="text" value="release/2.x" aria-invalid="true" aria-describedby="fl-branch-error" style="${mono}">
                <p class="m-field-error" id="fl-branch-error">kestrel-api has no branch called release/2.x. Try release/2.4 or main.</p>
              </div>
              <div class="m-field">
                <label class="m-field-label" for="fl-cron">Every</label>
                <input class="m-input" id="fl-cron" type="text" value="" placeholder="weekday at 07:00" aria-invalid="true" aria-describedby="fl-cron-error">
                <p class="m-field-error" id="fl-cron-error">Say when to run, for example "weekday at 07:00".</p>
              </div>
              <div class="m-field">
                <label class="m-field-label" for="fl-task">Task</label>
                <textarea class="m-input" id="fl-task" rows="2">Update dependencies with patch releases and open one pull request.</textarea>
                <p class="m-field-hint">The agent works on a fresh branch each run.</p>
              </div>
            </div>
            <footer class="m-dialog-footer">
              <button type="button" class="m-button" data-variant="ghost">Cancel <span class="m-subtle">esc</span></button>
              <button type="button" class="m-button" data-variant="primary">Save schedule <span style="opacity: 0.6">⌘↵</span></button>
            </footer>
          </div>
        </section>
        <section class="m-stack" data-gap="3" aria-labelledby="fl-run-errors">
          <h2 id="fl-run-errors" style="${meta}">In a run</h2>
          <details class="m-tool-call" data-status="error" open style="max-inline-size: 576px">
            <summary><span class="m-tool-call-name" style="display: inline-flex; align-items: center; gap: var(--m-space-2)">${icon(I.terminal, 14)} Ran <span style="${mono}">pnpm build</span></span><span class="m-tool-call-status">Failed</span><span class="m-tool-call-duration">41s</span></summary>
            <div class="m-tool-call-body"><pre class="m-code" tabindex="0"><code>src/ledger/batch.ts:88:14 - error TS2339:\nProperty 'tenantId' does not exist on type 'Entry'.</code></pre></div>
          </details>
          <p style="${ui}; max-inline-size: 576px">The build failed on a renamed field. I'll switch <code class="m-code-inline">tenantId</code> to <code class="m-code-inline">accountId</code> and run it again; nothing has been pushed.</p>
        </section>
        <section class="m-stack" data-gap="3" aria-labelledby="fl-toast-errors">
          <h2 id="fl-toast-errors" style="${meta}">Somewhere else</h2>
          <div class="m-toast-region" data-static aria-live="polite" style="position: static; inline-size: auto; max-inline-size: 384px; padding: 0; align-items: start">
            <div class="m-toast" data-tone="danger" role="alert">
              <div class="m-toast-content">
                <p class="m-toast-title">Couldn't reach the runner</p>
                <p class="m-toast-body">The task is queued and will start when the connection is back.</p>
                <div class="m-toast-actions"><button type="button" class="m-button" data-size="sm">Retry now</button></div>
              </div>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Dismiss">${icon(I.x, 14)}</button>
            </div>
          </div>
        </section>
        <section class="m-stack" data-gap="3" aria-labelledby="fl-page-errors">
          <h2 id="fl-page-errors" style="${meta}">A whole page</h2>
          <div class="m-grid" style="--m-layout-grid-min: 240px">
            ${fullPage(I.compass, '404', 'Nothing at this address', 'The task may have been deleted, or the link is cut short.', `<a class="m-button" data-variant="primary" data-size="sm" href="#">Go to Inbox</a>`)}
            ${fullPage(I.serverOff, '500', 'Lathe hit an error', 'Your tasks are safe and keep running. Try the page again.', `<button type="button" class="m-button" data-size="sm">Try again</button>`)}
            ${fullPage(I.lock, '403', 'This repository is private', 'Ask an owner of ledger-sync to add you.', `<button type="button" class="m-button" data-variant="primary" data-size="sm">Request access</button>`)}
          </div>
        </section>
      </div>
    </div>`,
);

export const flintRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'The web dashboard in the app frame: a 40px title bar, a regular-weight page title, a totals box split by hairlines, a two-tone bar chart and a boxed table of open changes with diff counts, check dots and split review bars.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'The agent workspace: tasks grouped by repository in the side panel, the thread with the person\'s message in a box, quiet tool steps, a files-changed box and the composer with mode and model, beside a diff with green and red lines.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One narrow step on the panel colour: a three-segment step bar, a regular-weight title, a boxed checklist of repositories and one wide inverted Continue.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A settings side panel beside a 672px column: muted group labels above rounded boxes of rows, each a title and a muted line on the left and a green switch, select or small button on the right.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'Centred in the panel: a thin 40px icon, a 14px medium heading, one muted line, an inverted action with a quiet one, and key hints below.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The public site: a 52px bar with pill actions, a large regular-weight title, a pill toggle, plan boxes with 4px corners, a 36px price, full-width pills (inverted on the recommended one), then a comparison table and questions.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors under the field and a summary above them in a dialog, a failed command in the thread with what happens next, a toast that keeps the task queued, and full pages for 404, 500 and no access.',
    html: errors,
  },
];
