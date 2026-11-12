import type { ArchetypeRecipe } from '../types';

/*
 * Obsidian's seven layout recipes: framework-free HTML using only @mariachi/design classes and
 * tokens (no colour literals), with sample data from a made-up product team ("Lantern", squads
 * Platform, Mobile and Growth). They follow the language's real screen patterns: a darker sidebar
 * beside one inset panel with a hairline edge, 44px header bars, dense 36px rows with status and
 * priority glyphs, grey group bars, hairline label pills, a command menu for everything, and
 * settings as grouped panels of label-and-control rows. Status and priority glyphs are drawn in the
 * language's own style from circles and bars; every other icon is Lucide at 1.5px.
 */

// Lucide icons, outlined, 1.5px stroke
const icon = (paths: string, size = 16, label?: string) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${size > 24 ? 1 : 1.5}" stroke-linecap="round" stroke-linejoin="round"${label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"'}>${paths}</svg>`;
const I = {
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  user: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>',
  at: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>',
  map: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
  box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  pkg: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  layers:
    '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  queue: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10"/><path d="M7 13h10"/><path d="M7 17h6"/>',
  sprint: '<circle cx="12" cy="12" r="9"/><path d="m10 8.5 5 3.5-5 3.5z"/>',
  doc: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 13h4"/><path d="M10 17h4"/>',
  userPlus:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  compose:
    '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  filter: '<path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/>',
  display:
    '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  pr: '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M6 9v12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  arrowUp: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  arrowDown: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  clip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  palette:
    '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
  keyboard:
    '<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  plug: '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  importIcon:
    '<path d="M12 3v12"/><path d="m8 11 4 4 4-4"/><path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4"/>',
  bellOff:
    '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742"/><path d="m2 2 20 20"/><path d="M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  hexagon:
    '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  triangle:
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/>',
  serverOff:
    '<path d="M7 2h13a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-5"/><path d="M10 10 2.5 2.5C2 2 2 2.5 2 5v3a2 2 0 0 0 2 2h6z"/><path d="M22 17v-1a2 2 0 0 0-2-2h-1"/><path d="M4 14a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16.5l1-.5.5.5-8-8H4z"/><path d="M6 18h.01"/><path d="m2 2 20 20"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  rotate: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
};

// The language's own glyphs: status circles and priority bars, drawn from tokens
const glyph = (inner: string, color: string, label: string, size = 14) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${label}" style="color: ${color}; flex: none">${inner}</svg>`;
const canvasStroke = 'style="stroke: var(--m-color-bg-canvas)"';
const status = {
  backlog: glyph(
    '<path d="M10.1 2.182a10 10 0 0 1 3.8 0"/><path d="M13.9 21.818a10 10 0 0 1-3.8 0"/><path d="M17.609 3.721a10 10 0 0 1 2.69 2.7"/><path d="M2.182 13.9a10 10 0 0 1 0-3.8"/><path d="M20.279 17.609a10 10 0 0 1-2.7 2.69"/><path d="M21.818 10.1a10 10 0 0 1 0 3.8"/><path d="M3.721 6.391a10 10 0 0 1 2.7-2.69"/><path d="M6.391 20.279a10 10 0 0 1-2.69-2.7"/>',
    'var(--m-color-fg-muted)',
    'Backlog',
  ),
  todo: glyph('<circle cx="12" cy="12" r="10"/>', 'var(--m-color-fg-muted)', 'Todo'),
  progress: glyph(
    '<circle cx="12" cy="12" r="10"/><path d="M12 6a6 6 0 0 1 0 12z" fill="currentColor" stroke="none"/>',
    'var(--m-color-warning-solid)',
    'In progress',
  ),
  review: glyph(
    '<circle cx="12" cy="12" r="10"/><path d="M12 6a6 6 0 1 1-6 6h6z" fill="currentColor" stroke="none"/>',
    'var(--m-color-success-solid)',
    'In review',
  ),
  done: glyph(
    `<circle cx="12" cy="12" r="11" fill="currentColor" stroke="none"/><path d="m7.5 12.5 3 3 6-6.5" ${canvasStroke}/>`,
    'var(--m-color-accent-default)',
    'Done',
  ),
  canceled: glyph(
    `<circle cx="12" cy="12" r="11" fill="currentColor" stroke="none"/><path d="m8.5 8.5 7 7" ${canvasStroke}/><path d="m15.5 8.5-7 7" ${canvasStroke}/>`,
    'var(--m-color-fg-muted)',
    'Canceled',
  ),
};
const bars = (n: number, label: string) =>
  glyph(
    [7, 12, 17]
      .map(
        (h, i) =>
          `<rect x="${3 + i * 7}" y="${20 - h}" width="4" height="${h}" rx="1" fill="currentColor" stroke="none"${i < n ? '' : ' opacity="0.3"'}/>`,
      )
      .join(''),
    'var(--m-color-fg-muted)',
    label,
  );
const priority = {
  urgent: glyph(
    `<rect x="2" y="2" width="20" height="20" rx="5" fill="currentColor" stroke="none"/><path d="M12 7v6" ${canvasStroke} stroke-width="2.6"/><path d="M12 17h.01" ${canvasStroke} stroke-width="3"/>`,
    'var(--m-color-danger-fg)',
    'Urgent',
  ),
  high: bars(3, 'High priority'),
  medium: bars(2, 'Medium priority'),
  low: bars(1, 'Low priority'),
  none: glyph(
    '<path d="M4 12h3"/><path d="M10.5 12h3"/><path d="M17 12h3"/>',
    'var(--m-color-fg-subtle)',
    'No priority',
  ),
};

// Type and small shared styles (the dense scale: 12, 13, 15, 24)
const meta = 'font-size: var(--m-font-size-xs); color: var(--m-color-fg-muted)';
const small = 'font-size: var(--m-font-size-sm)';
const issueId =
  'font-size: var(--m-font-size-xs); color: var(--m-color-fg-muted); font-variant-numeric: tabular-nums; min-inline-size: 3.75rem';
const pageTitle =
  'font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-tight)';
const hair = 'var(--m-border-width-thin) solid var(--m-color-border-default)';
const quiet = 'var(--m-border-width-thin) solid var(--m-color-border-muted)';
const dot = (tone: string) =>
  `<span aria-hidden="true" style="inline-size: 0.5rem; block-size: 0.5rem; border-radius: var(--m-radius-full); background: var(--m-color-${tone}); flex: none"></span>`;
const label = (tone: string, text: string) => `<span class="m-badge">${dot(tone)} ${text}</span>`;
const kbd = (...keys: string[]) => keys.map((k) => `<kbd class="m-kbd">${k}</kbd>`).join(' ');
const avatar = (initials: string, name: string, size = 'sm') =>
  `<span class="m-avatar" data-size="${size}" role="img" aria-label="${name}" style="font-size: 0.625rem">${initials}</span>`;
const iconBtn = (paths: string, name: string, size = 'sm') =>
  `<button type="button" class="m-button" data-variant="ghost" data-size="${size}" data-icon-only aria-label="${name}">${icon(paths, 16)}</button>`;
// A squad's mark: a small rounded square in a tone
const mark = (tone: string, letter: string) =>
  `<span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: 1rem; block-size: 1rem; border-radius: var(--m-radius-sm); background: var(--m-color-${tone}); color: var(--m-color-bg-canvas); font-size: 0.625rem; font-weight: var(--m-font-weight-semibold); flex: none">${letter}</span>`;

// The app sidebar: its own sections and order; the treatment is the reference's
type NavItem = [string, string, string?];
const navList = (items: NavItem[], current: string, nested = false) =>
  `<ul${nested ? ' style="padding-inline-start: var(--m-space-4)"' : ''}>
${items
  .map(
    ([ic, l, count]) =>
      `          <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${ic.startsWith('<') ? ic : icon(I[ic as keyof typeof I], 16)} ${l}${count ? ` <span class="m-sidebar-count">${count}</span>` : ''}</a></li>`,
  )
  .join('\n')}
        </ul>`;

const sidebar = (current: string) => `<nav class="m-sidebar" aria-label="Main" style="min-block-size: 100%">
    <div class="m-cluster" data-justify="between" style="padding: var(--m-space-1) var(--m-space-1) var(--m-space-2)">
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="font-weight: var(--m-font-weight-semibold)">${mark('accent-default', 'L')} Lantern ${icon(I.down, 12)}</button>
      <span class="m-cluster" data-gap="1">${iconBtn(I.search, 'Search')}<button type="button" class="m-button" data-size="sm" data-icon-only aria-label="New issue">${icon(I.compose, 16)}</button></span>
    </div>
    <div class="m-sidebar-section">
      ${navList(
        [
          ['gauge', 'Overview'],
          ['user', 'Assigned to me', '6'],
          ['at', 'Mentions', '2'],
        ],
        current,
      )}
    </div>
    <details class="m-sidebar-section m-sidebar-group" open>
      <summary class="m-sidebar-heading">Planning</summary>
      ${navList(
        [
          ['map', 'Roadmap'],
          ['flag', 'Milestones'],
          ['pkg', 'Releases'],
        ],
        current,
      )}
    </details>
    <details class="m-sidebar-section m-sidebar-group" open>
      <summary class="m-sidebar-heading">Squads</summary>
      <ul>
        <li><a class="m-sidebar-link" href="#">${mark('accent-default', 'P')} Platform</a>
          ${navList(
            [
              ['queue', 'Queue', '14'],
              ['sprint', 'Sprints'],
              ['doc', 'Docs'],
            ],
            current,
            true,
          )}
        </li>
        <li><a class="m-sidebar-link" href="#">${mark('info-solid', 'M')} Mobile</a></li>
        <li><a class="m-sidebar-link" href="#">${mark('success-solid', 'G')} Growth</a></li>
      </ul>
    </details>
    <div class="m-sidebar-section" style="margin-block-start: auto">
      ${navList(
        [
          ['userPlus', 'Invite people'],
          ['help', 'Help and shortcuts'],
        ],
        current,
      )}
    </div>
  </nav>`;

// The page: a darker frame holding the sidebar, and one inset panel with a hairline and 8px corners
const shell = (
  current: string,
  header: string,
  body: string,
) => `<div class="m-split" style="--m-layout-split-side: 14.5rem; --m-layout-split-gap: 0; min-block-size: 100vh; background: var(--m-color-bg-sunken)">
  ${sidebar(current)}
  <main class="m-stack" data-gap="0" style="margin: var(--m-space-2); border: ${hair}; border-radius: var(--m-radius-container); background: var(--m-color-bg-canvas); overflow: hidden">
    ${header}
${body}
  </main>
</div>`;

// The panel's header bar: 44px, a location on the left, view chips, quiet icon actions on the right
const bar = (left: string, right: string) =>
  `<header class="m-cluster" data-justify="between" style="min-block-size: 2.75rem; padding: var(--m-space-2) var(--m-space-3) var(--m-space-2) var(--m-space-4); border-block-end: ${quiet}">
      <div class="m-cluster" data-gap="2" style="${small}">${left}</div>
      <div class="m-cluster" data-gap="1">${right}</div>
    </header>`;
const crumb = (...parts: string[]) =>
  parts
    .map((p, i) =>
      i === parts.length - 1
        ? `<span style="font-weight: var(--m-font-weight-medium)">${p}</span>`
        : `<span class="m-muted">${p}</span><span class="m-subtle" aria-hidden="true">›</span>`,
    )
    .join(' ');
const viewTabs = (labels: string[], current: string, name: string) =>
  `<div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="${name}">${labels
    .map(
      (l) =>
        `<button type="button" class="m-tab" role="tab" aria-selected="${l === current}"${l === current ? '' : ' tabindex="-1"'}>${l}</button>`,
    )
    .join('')}</div></div>`;

/* ---------------------------------------------------------------- dashboard */

// Issues closed per week, stacked by kind: feature (accent), fix (info), chore (subtle)
const weeks: [string, number, number, number][] = [
  ['Sep 8', 9, 5, 3],
  ['Sep 15', 11, 4, 2],
  ['Sep 22', 7, 8, 4],
  ['Sep 29', 13, 6, 3],
  ['Oct 6', 10, 9, 5],
  ['Oct 13', 15, 5, 2],
  ['Oct 20', 12, 7, 6],
  ['Oct 27', 17, 6, 3],
  ['Nov 3', 14, 10, 4],
];
const chart = `<svg viewBox="0 0 540 180" width="100%" preserveAspectRatio="none" style="display: block; block-size: 12rem" role="img" aria-label="Issues closed per week, Sep 8 to Nov 3: features, fixes and chores, rising from 17 to 28 a week">
          ${[0, 1, 2, 3].map((g) => `<path d="M0 ${20 + g * 50}H540" style="stroke: var(--m-color-border-muted)" stroke-dasharray="2 4"/>`).join('')}
          ${weeks
            .map(([, f, x, c], i) => {
              const k = 5;
              const xPos = 18 + i * 58;
              let y = 170;
              return [
                ['accent-default', f],
                ['info-solid', x],
                ['border-strong', c],
              ]
                .map(([tone, v]) => {
                  const h = (v as number) * k;
                  y -= h;
                  return `<rect x="${xPos}" y="${y + 1}" width="28" height="${h - 1}" rx="2" style="fill: var(--m-color-${tone})"/>`;
                })
                .join('');
            })
            .join('\n          ')}
        </svg>`;
const health = (tone: string, text: string) =>
  `<span class="m-cluster" data-gap="2" style="${small}; color: var(--m-color-${tone}-fg)">${icon(tone === 'success' ? I.checkCircle : tone === 'warning' ? I.clock : I.alert, 14)} ${text}</span>`;
const projectRow = (
  ic: string,
  name: string,
  h: string,
  ht: string,
  pct: number,
  lead: [string, string],
  date: string,
) => `<tr>
              <td><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${icon(ic, 14)} <span style="font-weight: var(--m-font-weight-medium)">${name}</span></span></td>
              <td>${health(h, ht)}</td>
              <td><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><progress class="m-progress" value="${pct}" max="100" style="inline-size: 4rem" aria-label="${name}: ${pct}% done">${pct}%</progress><span class="m-muted" style="font-variant-numeric: tabular-nums">${pct}%</span></span></td>
              <td>${avatar(lead[0], lead[1])}</td>
              <td class="m-muted" style="font-variant-numeric: tabular-nums">${date}</td>
            </tr>`;
const stat = (value: string, labelText: string, trend?: string) =>
  `<div class="m-stack" data-gap="1"><span style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-tight); font-variant-numeric: tabular-nums">${value}</span><span style="${meta}">${labelText}${trend ? ` · ${trend}` : ''}</span></div>`;

const dashboard = shell(
  'Overview',
  bar(
    `${icon(I.gauge, 16)} ${crumb('Platform', 'Overview')} ${iconBtn(I.star, 'Add to favourites')}`,
    `${viewTabs(['This sprint', 'Last 90 days', 'All time'], 'Last 90 days', 'Range')} ${iconBtn(I.filter, 'Filter')} ${iconBtn(I.more, 'More')}`,
  ),
  `    <div class="m-stack" data-gap="6" style="padding: var(--m-space-6) var(--m-space-6) var(--m-space-10)">
      <div class="m-cluster" data-gap="10" style="row-gap: var(--m-space-4)">
        ${stat('41', 'Open issues', '−6 this week')}
        ${stat('12', 'In progress')}
        ${stat('3.4d', 'Median cycle time')}
        ${stat('83%', 'Sprint 24 scope done')}
      </div>
      <div class="m-cluster" data-gap="4" data-align="stretch">
        <section class="m-card" aria-labelledby="ob-closed" style="flex: 2 1 28rem; min-inline-size: 0">
          <div class="m-card-body m-stack" data-gap="3">
            <div class="m-cluster" data-justify="between">
              <h2 id="ob-closed" style="${small}; font-weight: var(--m-font-weight-medium)">Closed per week</h2>
              <div class="m-cluster" data-gap="4" style="${meta}">
                <span class="m-cluster" data-gap="2">${dot('accent-default')} Features</span>
                <span class="m-cluster" data-gap="2">${dot('info-solid')} Fixes</span>
                <span class="m-cluster" data-gap="2">${dot('border-strong')} Chores</span>
              </div>
            </div>
            ${chart}
            <div class="m-cluster" data-justify="between" style="${meta}; padding-inline: var(--m-space-2)">${weeks
              .filter((_, i) => i % 2 === 0)
              .map(([w]) => `<span>${w}</span>`)
              .join('')}</div>
          </div>
        </section>
        <section class="m-card" aria-labelledby="ob-sprint" style="flex: 1 1 17rem">
          <div class="m-card-body m-stack" data-gap="4">
            <div class="m-cluster" data-justify="between">
              <h2 id="ob-sprint" class="m-cluster" data-gap="2" style="${small}; font-weight: var(--m-font-weight-medium)">${icon(I.sprint, 14)} Sprint 24</h2>
              <span style="${meta}">Nov 3 – Nov 16</span>
            </div>
            <div class="m-usage" data-level="ok" style="--m-usage-value: 83%">
              <div class="m-usage-header"><span class="m-usage-label">Scope done</span><span class="m-usage-amount">29 of 35</span></div>
              <div class="m-usage-bar" role="meter" aria-label="Scope done" aria-valuemin="0" aria-valuemax="100" aria-valuenow="83"></div>
              <div class="m-usage-footer"><span>4 days left</span><span>2 added since start</span></div>
            </div>
            <ul class="m-stack" data-gap="2" style="${small}; padding: 0; list-style: none">
              <li class="m-cluster" data-justify="between"><span class="m-cluster" data-gap="2">${status.done} Done</span><span class="m-muted">29</span></li>
              <li class="m-cluster" data-justify="between"><span class="m-cluster" data-gap="2">${status.review} In review</span><span class="m-muted">2</span></li>
              <li class="m-cluster" data-justify="between"><span class="m-cluster" data-gap="2">${status.progress} In progress</span><span class="m-muted">3</span></li>
              <li class="m-cluster" data-justify="between"><span class="m-cluster" data-gap="2">${status.todo} Todo</span><span class="m-muted">1</span></li>
            </ul>
          </div>
        </section>
      </div>
      <section class="m-stack" data-gap="2" aria-labelledby="ob-projects">
        <div class="m-cluster" data-justify="between">
          <h2 id="ob-projects" style="${small}; font-weight: var(--m-font-weight-medium)">Projects</h2>
          <button type="button" class="m-button" data-variant="ghost" data-size="sm">${icon(I.plus, 14)} New project</button>
        </div>
        <div class="m-table-wrap">
          <table class="m-table">
            <thead><tr><th scope="col">Name</th><th scope="col">Health</th><th scope="col">Progress</th><th scope="col">Lead</th><th scope="col">Target</th></tr></thead>
            <tbody>
            ${projectRow(I.box, 'Webhook delivery v2', 'success', 'On track', 72, ['TM', 'Theo Marsh'], 'Dec 5')}
            ${projectRow(I.box, 'Edge settings cache', 'warning', 'At risk', 41, ['PN', 'Priya Nair'], 'Nov 28')}
            ${projectRow(I.shield, 'Key rotation', 'success', 'On track', 58, ['CR', 'Callum Reid'], 'Jan 16')}
            ${projectRow(I.layers, 'Audit log exports', 'danger', 'Off track', 23, ['ID', 'Ines Duarte'], 'Nov 21')}
            </tbody>
          </table>
        </div>
      </section>
    </div>`,
);

/* ---------------------------------------------------------------- list and detail */

type Issue = [
  string,
  string,
  keyof typeof priority,
  keyof typeof status,
  [string, string][],
  [string, string] | null,
  string,
];
const issues: Record<string, Issue[]> = {
  'In progress': [
    [
      'PLT-482',
      'Retry webhook deliveries with backoff',
      'high',
      'progress',
      [['danger-fg', 'Reliability']],
      ['TM', 'Theo Marsh'],
      'Nov 14',
    ],
    [
      'PLT-479',
      'Cache tenant settings at the edge',
      'medium',
      'progress',
      [['info-solid', 'Performance']],
      ['PN', 'Priya Nair'],
      'Nov 12',
    ],
    [
      'PLT-474',
      'Show retry count on delivery rows',
      'low',
      'progress',
      [['accent-default', 'Feature']],
      ['YT', 'Yuki Tanaka'],
      'Nov 11',
    ],
  ],
  Todo: [
    [
      'PLT-471',
      'Audit export stops after ten thousand rows',
      'urgent',
      'todo',
      [['danger-fg', 'Bug']],
      ['ID', 'Ines Duarte'],
      'Nov 10',
    ],
    [
      'PLT-466',
      'Rotate signing keys without downtime',
      'high',
      'todo',
      [['warning-solid', 'Security']],
      ['CR', 'Callum Reid'],
      'Nov 9',
    ],
    ['PLT-463', 'Document the delivery status codes', 'none', 'todo', [['success-solid', 'Docs']], null, 'Nov 7'],
  ],
  Backlog: [
    [
      'PLT-460',
      'Return org instead of workspace in API payloads',
      'low',
      'backlog',
      [['accent-default', 'API']],
      null,
      'Nov 4',
    ],
    [
      'PLT-455',
      'Billing sync job fails one run in fifty',
      'none',
      'backlog',
      [['danger-fg', 'Bug']],
      ['OH', 'Omar Haddad'],
      'Oct 30',
    ],
  ],
};
const issueRow = ([id, title, p, s, labels, who, date]: Issue, selected = false) =>
  `<li class="m-cluster" data-gap="3" style="flex-wrap: nowrap; min-block-size: 2.25rem; padding-inline: var(--m-space-4) var(--m-space-3); border-block-end: ${quiet}${selected ? '; background: var(--m-table-row-hover-bg); box-shadow: inset 2px 0 0 var(--m-color-accent-default)' : ''}">
          ${priority[p]}
          <span style="${issueId}">${id}</span>
          ${status[s]}
          <a href="#" style="${small}; font-weight: var(--m-font-weight-medium); color: var(--m-color-fg-default); text-decoration: none; flex: 1; min-inline-size: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap"${selected ? ' aria-current="true"' : ''}>${title}</a>
          <span class="m-cluster" data-gap="1" style="flex-wrap: nowrap">${labels.map(([t, l]) => label(t, l)).join('')}</span>
          <span style="${meta}; font-variant-numeric: tabular-nums; min-inline-size: 3rem; text-align: end">${date}</span>
          ${who ? avatar(who[0], who[1]) : `<span class="m-subtle" style="display: inline-flex">${icon(I.user, 20, 'Unassigned')}</span>`}
        </li>`;
const group = (name: string, glyphSvg: string, list: Issue[], selectedId?: string) => `<section aria-label="${name}">
        <div class="m-cluster" data-justify="between" style="min-block-size: 2.25rem; padding-inline: var(--m-space-4) var(--m-space-3); background: var(--m-table-header-bg); border-block-end: ${quiet}">
          <span class="m-cluster" data-gap="2" style="${small}; font-weight: var(--m-font-weight-medium)">${glyphSvg} ${name} <span class="m-muted" style="font-weight: var(--m-font-weight-regular)">${list.length}</span></span>
          ${iconBtn(I.plus, `New issue in ${name}`)}
        </div>
        <ul style="padding: 0; list-style: none">
        ${list.map((i) => issueRow(i, i[0] === selectedId)).join('\n        ')}
        </ul>
      </section>`;
const prop = (name: string, value: string) =>
  `<div class="m-cluster" data-gap="2" style="flex-wrap: nowrap; min-block-size: 2rem"><span style="${meta}; min-inline-size: 5.5rem">${name}</span><span class="m-cluster" data-gap="2" style="${small}">${value}</span></div>`;

const listDetail = shell(
  'Queue',
  bar(
    `${mark('accent-default', 'P')} ${crumb('Platform', 'Queue')} ${viewTabs(['All', 'Active', 'Backlog'], 'Active', 'Views')}`,
    `${iconBtn(I.bell, 'Subscribe')} ${iconBtn(I.more, 'More')}`,
  ),
  `    <div class="m-cluster" data-justify="between" style="padding: var(--m-space-1) var(--m-space-3) var(--m-space-1) var(--m-space-2); border-block-end: ${quiet}">
      <button type="button" class="m-button" data-variant="ghost" data-size="sm">${icon(I.filter, 14)} Filter</button>
      <button type="button" class="m-button" data-size="sm">${icon(I.display, 14)} Display</button>
    </div>
    <div class="m-cluster" data-gap="0" data-align="stretch" style="flex: 1">
      <div class="m-stack" data-gap="0" style="flex: 999 1 30rem; min-inline-size: 0">
      ${group('In progress', status.progress, issues['In progress'], 'PLT-482')}
      ${group('Todo', status.todo, issues.Todo)}
      ${group('Backlog', status.backlog, issues.Backlog)}
      </div>
      <aside class="m-stack" data-gap="5" aria-label="PLT-482" style="flex: 1 1 22rem; padding: var(--m-space-4) var(--m-space-5) var(--m-space-8); border-inline-start: ${quiet}; background: var(--m-color-bg-canvas)">
        <div class="m-cluster" data-justify="between">
          <span style="${issueId}">PLT-482</span>
          <span class="m-cluster" data-gap="1">${iconBtn(I.link, 'Copy link')}${iconBtn(I.pr, 'Copy branch name')}${iconBtn(I.x, 'Close')}</span>
        </div>
        <div class="m-stack" data-gap="2">
          <h1 style="${pageTitle}">Retry webhook deliveries with backoff</h1>
          <p class="m-muted" style="line-height: var(--m-font-leading-relaxed)">Failed deliveries are dropped after one attempt. Retry up to eight times over 24 hours, doubling the wait each time, and show each attempt on the delivery row.</p>
        </div>
        <div class="m-stack" data-gap="0" style="border-block: ${quiet}; padding-block: var(--m-space-2)">
          ${prop('Status', `${status.progress} In progress`)}
          ${prop('Priority', `${priority.high} High`)}
          ${prop('Assignee', `${avatar('TM', 'Theo Marsh')} Theo Marsh`)}
          ${prop('Labels', label('danger-fg', 'Reliability'))}
          ${prop('Project', `${icon(I.box, 14)} Webhook delivery v2`)}
          ${prop('Sprint', `${icon(I.sprint, 14)} Sprint 24`)}
        </div>
        <section class="m-stack" data-gap="3" aria-labelledby="ob-activity">
          <h2 id="ob-activity" style="${small}; font-weight: var(--m-font-weight-semibold)">Activity</h2>
          <ul class="m-stack" data-gap="3" style="${meta}; padding: 0; list-style: none">
            <li class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${avatar('PN', 'Priya Nair')} <span><span style="color: var(--m-color-fg-default)">Priya Nair</span> created the issue · Nov 3</span></li>
            <li class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${status.progress} <span><span style="color: var(--m-color-fg-default)">Theo Marsh</span> moved it from Todo to In progress · Nov 6</span></li>
          </ul>
          <div class="m-card" style="--m-card-padding-md: var(--m-space-3)">
            <div class="m-card-body m-stack" data-gap="2">
              <div class="m-cluster" data-gap="2" style="${meta}">${avatar('TM', 'Theo Marsh')} <span style="color: var(--m-color-fg-default); font-weight: var(--m-font-weight-medium)">Theo Marsh</span> · 2h ago</div>
              <p style="${small}">Backoff is in. Attempts show on the row; the dashboard tile comes next.</p>
            </div>
          </div>
          <form class="m-composer" style="${small}">
            <textarea class="m-composer-input" rows="1" placeholder="Leave a comment…" aria-label="Comment"></textarea>
            <div class="m-composer-actions">
              ${iconBtn(I.clip, 'Attach a file')}<span class="m-composer-spacer"></span>
              <button type="button" class="m-button" data-variant="primary" data-size="sm" data-icon-only aria-label="Send">${icon(I.arrowUp, 14)}</button>
            </div>
          </form>
        </section>
      </aside>
    </div>`,
);

/* ---------------------------------------------------------------- onboarding */

const cmdItem = (paths: string, text: string, keys: string[], active = false) =>
  `<button type="button" class="m-menu-item" role="option" aria-selected="${active}"${active ? ' style="background: var(--m-popover-item-hover-bg)"' : ''}>${icon(paths, 16)} <span style="flex: 1; text-align: start">${text}</span> <span class="m-menu-shortcut">${kbd(...keys)}</span></button>`;

const onboarding = `<div class="m-stack" data-align="center" style="min-block-size: 100vh; background: var(--m-color-bg-canvas); padding: var(--m-space-8) var(--m-space-4) var(--m-space-16)">
  <div class="m-cluster" data-justify="between" style="inline-size: 100%; max-inline-size: 64rem">
    <span class="m-cluster" data-gap="2" style="${small}; font-weight: var(--m-font-weight-semibold)">${mark('accent-default', 'L')} Lantern</span>
    <button type="button" class="m-button" data-variant="ghost" data-size="sm">Skip setup</button>
  </div>
  <div class="m-container" data-size="sm" style="--m-layout-container-max-sm: 35rem; margin-block-start: clamp(var(--m-space-8), 10vh, var(--m-space-16))">
    <div class="m-stack" data-gap="8">
      <div class="m-stack" data-gap="3" style="text-align: center">
        <span style="${meta}; font-variant-numeric: tabular-nums">Step 3 of 5</span>
        <progress class="m-progress" data-size="sm" value="60" max="100" aria-label="Setup: step 3 of 5" style="inline-size: 8rem; margin-inline: auto">60%</progress>
        <h1 style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)">Every action is a keystroke away</h1>
        <p class="m-muted" style="font-size: var(--m-font-size-md)">Open the command menu with ${kbd('⌘', 'K')} from anywhere. Try it on the issue below.</p>
      </div>
      <div class="m-popover" data-static role="dialog" aria-label="Command menu" style="max-inline-size: none; inline-size: 100%; padding: 0; border-radius: var(--m-radius-lg); box-shadow: var(--m-shadow-overlay)">
        <div class="m-stack" data-gap="3" style="padding: var(--m-space-4) var(--m-space-4) var(--m-space-3); border-block-end: ${hair}">
          <span class="m-badge" data-variant="solid" style="align-self: start; border-radius: var(--m-radius-md)">PLT-482 · Retry webhook deliveries with backoff</span>
          <input class="m-input" type="text" value="" placeholder="Type a command or search…" aria-label="Command" style="border: 0; padding: 0; background: transparent; font-size: var(--m-font-size-lg); block-size: auto; box-shadow: none">
        </div>
        <div class="m-menu" role="listbox" aria-label="Commands" style="padding: var(--m-space-2)">
          <div class="m-menu-label">Issue</div>
          ${cmdItem(I.checkCircle, 'Change status…', ['S'], true)}
          ${cmdItem(I.user, 'Assign to…', ['A'])}
          ${cmdItem(I.flag, 'Set priority…', ['P'])}
          ${cmdItem(I.link, 'Copy issue link', ['⌘', '⇧', ','])}
          <div class="m-menu-separator" role="separator"></div>
          <div class="m-menu-label">Navigate</div>
          ${cmdItem(I.queue, 'Go to Queue', ['G', 'Q'])}
          ${cmdItem(I.map, 'Go to Roadmap', ['G', 'R'])}
        </div>
      </div>
      <div class="m-stack" data-gap="3" data-align="center">
        <button type="button" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%; max-inline-size: 20rem">Continue</button>
        <button type="button" class="m-button" data-variant="ghost" data-size="sm">${icon(I.left, 14)} Back</button>
      </div>
    </div>
  </div>
</div>`;

/* ---------------------------------------------------------------- settings */

const settingsNav = (current: string) => {
  const items = (heading: string, list: [string, string][]) => `<div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">${heading}</h2>
      ${navList(list, current)}
    </div>`;
  return `<nav class="m-sidebar" aria-label="Settings" style="min-block-size: 100%">
    <a class="m-button" data-variant="ghost" data-size="sm" href="#" style="align-self: start; color: var(--m-color-fg-muted); margin-block-end: var(--m-space-2)">${icon(I.left, 14)} Settings</a>
    ${items('You', [
      ['user', 'Profile'],
      ['palette', 'Appearance'],
      ['bellOff', 'Alerts'],
      ['keyboard', 'Keyboard'],
    ])}
    ${items('Lantern', [
      ['hexagon', 'General'],
      ['users', 'People'],
      ['card', 'Plan and billing'],
      ['plug', 'Integrations'],
      ['importIcon', 'Data import'],
    ])}
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Squads</h2>
      <ul>
        <li><a class="m-sidebar-link" href="#">${mark('accent-default', 'P')} Platform</a></li>
        <li><a class="m-sidebar-link" href="#">${mark('info-solid', 'M')} Mobile</a></li>
        <li><a class="m-sidebar-link" href="#">${mark('success-solid', 'G')} Growth</a></li>
      </ul>
    </div>
  </nav>`;
};
const row = (title: string, help: string, control: string, last = false) =>
  `<div class="m-cluster" data-justify="between" data-gap="4" style="padding-block: calc(var(--m-space-3) + 2px); ${last ? '' : `border-block-end: ${hair}; `}flex-wrap: nowrap">
            <div class="m-stack" data-gap="0" style="min-inline-size: 0"><span style="${small}; font-weight: var(--m-font-weight-medium)">${title}</span><span style="${meta}">${help}</span></div>
            ${control}
          </div>`;
const panel = (heading: string, rows: string) => `<section class="m-stack" data-gap="3" aria-label="${heading}">
        <h2 style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-medium)">${heading}</h2>
        <div class="m-card" style="--m-card-padding-md: 0 var(--m-space-4)">
          <div class="m-card-body m-stack" data-gap="0">
          ${rows}
          </div>
        </div>
      </section>`;
// Settings dropdowns are buttons that open a menu, showing the current value and a chevron
const sel = (id: string, options: string[]) =>
  `<button type="button" class="m-button" aria-haspopup="menu" aria-label="${id.replace(/-/g, ' ')}: ${options[0]}">${options[0]} ${icon(I.down, 12)}</button>`;
const toggle = (name: string, on: boolean) =>
  `<input class="m-switch" type="checkbox" role="switch" aria-label="${name}"${on ? ' checked' : ''}>`;

const settings = `<div class="m-split" style="--m-layout-split-side: 14.5rem; --m-layout-split-gap: 0; min-block-size: 100vh; background: var(--m-color-bg-sunken)">
  ${settingsNav('Appearance')}
  <main style="margin: var(--m-space-2); border: ${hair}; border-radius: var(--m-radius-container); background: var(--m-color-bg-canvas)">
    <div class="m-container" data-size="md" style="padding-block: var(--m-space-12) var(--m-space-16)">
      <div class="m-stack" data-gap="10">
        <div class="m-stack" data-gap="1">
          <h1 style="${pageTitle}">Appearance</h1>
          <p class="m-muted" style="${small}">How Lantern looks on this device. Changes apply at once.</p>
        </div>
        ${panel(
          'Theme',
          [
            row(
              'Interface theme',
              'Dark, light, or follow the system',
              sel('interface-theme', ['Dark', 'Light', 'System']),
            ),
            row('Accent', 'Used for the primary action and links', sel('accent', ['Indigo', 'Graphite'])),
            row(
              'Translucent sidebar',
              'Let the desktop show through the sidebar',
              toggle('Translucent sidebar', false),
              true,
            ),
          ].join('\n          '),
        )}
        ${panel(
          'Density',
          [
            row('Text size', 'Scales every screen', sel('text-size', ['Default', 'Small', 'Large'])),
            row(
              'Row height',
              'Compact fits more issues on screen',
              `<div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Row height"><button type="button" class="m-tab" role="tab" aria-selected="true">Compact</button><button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Roomy</button></div></div>`,
            ),
            row('Show full names', 'Instead of first names in lists', toggle('Show full names', true)),
            row(
              'Pointer cursor on controls',
              'A hand over anything clickable',
              toggle('Pointer cursor on controls', false),
              true,
            ),
          ].join('\n          '),
        )}
        ${panel(
          'Keyboard',
          [
            row(
              'Command menu',
              'Search and run any action',
              `<span class="m-cluster" data-gap="1">${kbd('⌘', 'K')}</span>`,
            ),
            row('Shortcut hints', 'Show keys beside menu items and tooltips', toggle('Shortcut hints', true), true),
          ].join('\n          '),
        )}
        <div class="m-cluster" data-justify="end">
          <button type="button" class="m-button" data-variant="ghost" data-size="sm">${icon(I.rotate, 14)} Reset to defaults</button>
        </div>
      </div>
    </div>
  </main>
</div>`;

/* ---------------------------------------------------------------- empty state */

const emptyState = shell(
  'Sprints',
  bar(
    `${mark('accent-default', 'P')} ${crumb('Platform', 'Sprints')} ${viewTabs(['Current', 'Upcoming', 'Past'], 'Current', 'Sprints')}`,
    iconBtn(I.more, 'More'),
  ),
  `    <div class="m-stack" data-gap="5" data-align="center" style="flex: 1; justify-content: center; padding: var(--m-space-16) var(--m-space-6); text-align: center">
      <span class="m-subtle" style="display: inline-flex">${icon(I.sprint, 48)}</span>
      <div class="m-stack" data-gap="2" data-align="center" style="max-inline-size: 26rem">
        <h1 style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-medium)">No sprint running</h1>
        <p class="m-muted" style="${small}; line-height: var(--m-font-leading-relaxed)">Sprints are two-week blocks of work. Unfinished issues roll into the next one, so the queue never goes stale.</p>
      </div>
      <div class="m-cluster" data-gap="2" data-justify="center">
        <button type="button" class="m-button" data-variant="primary">Start a sprint <kbd class="m-kbd" style="background: transparent; color: inherit">⇧ S</kbd></button>
        <button type="button" class="m-button">How sprints work</button>
      </div>
    </div>`,
);

/* ---------------------------------------------------------------- pricing */

const invert =
  '--m-button-primary-bg: var(--m-color-bg-inverse); --m-button-primary-fg: var(--m-color-fg-inverse); --m-button-primary-border: var(--m-color-bg-inverse); --m-button-primary-hover-bg: var(--m-color-fg-default); --m-button-primary-active-bg: var(--m-color-fg-default); --m-button-radius: var(--m-radius-full)';
const pill = '--m-button-radius: var(--m-radius-full)';
const tick = glyph(
  `<circle cx="12" cy="12" r="11" fill="currentColor" stroke="none"/><path d="m7.5 12.5 3 3 6-6.5" ${canvasStroke}/>`,
  'var(--m-color-fg-muted)',
  'Included',
  15,
);
const no = `<span class="m-subtle" style="display: inline-flex">${icon(I.x, 14, 'Not included')}</span>`;
const plan = (
  name: string,
  price: string,
  per: string,
  billing: string,
  features: string[],
  cta: string,
  featured = false,
  first = false,
) => `<section class="m-stack" data-gap="4" aria-label="${name}" style="padding-inline: var(--m-space-6); ${first ? '' : `border-inline-start: ${quiet}`}">
          <div class="m-stack" data-gap="1">
            <h2 style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-tight)">${name}</h2>
            <p style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium)"><span style="font-variant-numeric: tabular-nums">${price}</span> <span class="m-muted" style="font-weight: var(--m-font-weight-regular)">${per}</span></p>
          </div>
          <div style="border-block: ${quiet}; padding-block: var(--m-space-3); ${small}; color: var(--m-color-fg-muted)">${billing}</div>
          <ul class="m-stack" data-gap="3" style="${small}; flex: 1; padding: 0; list-style: none">
            ${features.map((f) => `<li class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${tick} ${f}</li>`).join('\n            ')}
          </ul>
          <a class="m-button" data-size="lg" href="#" ${featured ? `data-variant="primary" style="${invert}; block-size: 2.5rem"` : `style="${pill}; block-size: 2.5rem"`}>${cta}</a>
        </section>`;
const yearly = (on: boolean) =>
  `<label class="m-field" data-layout="inline" style="color: var(--m-color-fg-muted)"><input class="m-switch" type="checkbox" role="switch"${on ? ' checked' : ''}> Billed yearly</label>`;
const compareRow = (feature: string, cells: string[]) =>
  `<tr><th scope="row" style="font-weight: var(--m-font-weight-regular); color: var(--m-color-fg-muted)">${feature}</th>${cells.map((c) => `<td>${c === 'y' ? tick : c === 'n' ? no : c}</td>`).join('')}</tr>`;

const pricing = `<div style="background: var(--m-color-bg-canvas); min-block-size: 100vh">
  <header class="m-navbar" data-sticky data-translucent>
    <a class="m-navbar-brand" href="#">${mark('accent-default', 'L')} Lantern</a>
    <nav class="m-navbar-nav" aria-label="Main" style="margin-inline-start: auto">
      <a class="m-navbar-link" href="#">Features</a>
      <a class="m-navbar-link" href="#">Changelog</a>
      <a class="m-navbar-link" href="#">Stories</a>
      <a class="m-navbar-link" href="#">Docs</a>
      <a class="m-navbar-link" href="#" aria-current="page">Pricing</a>
    </nav>
    <div class="m-navbar-actions">
      <a class="m-button" data-variant="ghost" data-size="lg" href="#" style="color: var(--m-color-fg-muted)">Log in</a>
      <a class="m-button" data-variant="primary" data-size="lg" href="#" style="${invert}">Start free</a>
    </div>
  </header>
  <main>
    <section style="background: radial-gradient(60rem 22rem at 30% 0%, var(--m-color-accent-subtle), transparent 70%); padding-block: var(--m-space-16) var(--m-space-12)">
      <div class="m-container" style="--m-layout-container-max-lg: 84rem">
        <div class="m-stack" data-gap="3">
          <h1 style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-4xl); font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)">Plans</h1>
          <p class="m-muted" style="font-size: var(--m-font-size-lg); max-inline-size: 36rem">Start on your own and add the team when you need it. Every plan includes the command menu, sprints and the API.</p>
        </div>
      </div>
    </section>
    <div class="m-container" style="--m-layout-container-max-lg: 84rem">
      <div class="m-grid" style="--m-layout-grid-min: 15rem; --m-layout-grid-gap: var(--m-space-8) 0; margin-inline: calc(var(--m-space-6) * -1)">
        ${plan('Solo', '$0', '', 'Free for one person', ['One squad', '300 open issues', 'Command menu and shortcuts', 'Two integrations'], 'Start free', false, true)}
        ${plan('Crew', '$9', 'per member/month', yearly(true), ['Everything in Solo', 'Five squads', 'Unlimited issues', 'Sprints and roadmaps'], 'Start a trial')}
        ${plan('Fleet', '$18', 'per member/month', yearly(true), ['Everything in Crew', 'Unlimited squads', 'Private squads and guests', 'Delivery insights', 'Release pipelines'], 'Start a trial', true)}
        ${plan('Charter', 'Custom', '', 'Yearly contracts', ['Everything in Fleet', 'SAML and SCIM', 'Audit log exports', 'Data residency', 'A named contact'], 'Talk to us')}
      </div>
      <section class="m-stack" data-gap="4" aria-labelledby="ob-compare" style="margin-block-start: var(--m-space-16)">
        <h2 id="ob-compare" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-tight)">Compare plans</h2>
        <div class="m-table-wrap">
          <table class="m-table" style="--m-table-header-bg: transparent; --m-table-cell-padding-y: var(--m-space-3)">
            <thead><tr><th scope="col">Feature</th><th scope="col">Solo</th><th scope="col">Crew</th><th scope="col">Fleet</th><th scope="col">Charter</th></tr></thead>
            <tbody>
              ${compareRow('Members', ['1', 'Unlimited', 'Unlimited', 'Unlimited'])}
              ${compareRow('Squads', ['1', '5', 'Unlimited', 'Unlimited'])}
              ${compareRow('File uploads', ['5MB each', 'Unlimited', 'Unlimited', 'Unlimited'])}
              ${compareRow('Sprints and roadmaps', ['n', 'y', 'y', 'y'])}
              ${compareRow('Private squads', ['n', 'n', 'y', 'y'])}
              ${compareRow('Delivery insights', ['n', 'n', 'y', 'y'])}
              ${compareRow('SAML and SCIM', ['n', 'n', 'n', 'y'])}
            </tbody>
          </table>
        </div>
      </section>
      <section class="m-stack" data-gap="4" aria-labelledby="ob-faq" style="margin-block: var(--m-space-16); max-inline-size: 48rem">
        <h2 id="ob-faq" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-tight)">Questions</h2>
        <div class="m-accordion">
          <details class="m-accordion-item" open><summary>Who counts as a member?</summary><div class="m-accordion-content">Anyone who can sign in. Guests on Fleet and Charter are free and see only the squads you share.</div></details>
          <details class="m-accordion-item"><summary>Can we switch plans later?</summary><div class="m-accordion-content">Yes. Moving up takes effect at once and is prorated; moving down applies at the next renewal.</div></details>
          <details class="m-accordion-item"><summary>Is there a discount for nonprofits?</summary><div class="m-accordion-content">Registered nonprofits and schools get Crew at no cost. Write to us from your organisation's address.</div></details>
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
            <h3 style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-semibold)">${title}</h3>
            <p class="m-muted" style="${small}; max-inline-size: 22rem">${sentence}</p>
            <div class="m-cluster" data-gap="2" data-justify="center">${actions}</div>
          </div>
        </section>`;

const errors = shell(
  'Queue',
  bar(`${mark('accent-default', 'P')} ${crumb('Platform', 'Queue', 'New issue')}`, iconBtn(I.more, 'More')),
  `    <div class="m-container" style="padding-block: var(--m-space-8) var(--m-space-12)">
      <div class="m-stack" data-gap="10">
        <section class="m-stack" data-gap="3" aria-labelledby="ob-form-errors">
          <h2 id="ob-form-errors" style="${meta}">In a form</h2>
          <div class="m-dialog" data-static data-size="md" role="dialog" aria-modal="false" aria-labelledby="ob-new-title">
            <header class="m-dialog-header">
              <div><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span class="m-badge" data-variant="solid" style="border-radius: var(--m-radius-md)">${mark('accent-default', 'P')} PLT</span><span class="m-subtle" aria-hidden="true">›</span><h3 class="m-dialog-title" id="ob-new-title" style="font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-medium)">New issue</h3></span></div>
              ${iconBtn(I.x, 'Close')}
            </header>
            <div class="m-dialog-body m-stack" data-gap="4">
              <div class="m-alert" data-tone="danger" role="alert">
                <span class="m-alert-icon">${icon(I.alert, 16)}</span>
                <div class="m-alert-content">
                  <p class="m-alert-title">2 fields need fixing</p>
                  <p class="m-alert-body">The issue wasn't created.</p>
                </div>
              </div>
              <div class="m-field">
                <label class="m-field-label" for="ob-title">Title</label>
                <input class="m-input" id="ob-title" type="text" value="" placeholder="Issue title" aria-invalid="true" aria-describedby="ob-title-error">
                <p class="m-field-error" id="ob-title-error">Give the issue a title.</p>
              </div>
              <div class="m-field">
                <label class="m-field-label" for="ob-due">Due date</label>
                <input class="m-input" id="ob-due" type="text" value="Nov 31" aria-invalid="true" aria-describedby="ob-due-error">
                <p class="m-field-error" id="ob-due-error">November has 30 days. Try Nov 30 or Dec 1.</p>
              </div>
              <div class="m-cluster" data-gap="1">
                <button type="button" class="m-button" data-size="sm">${status.backlog} Backlog</button>
                <button type="button" class="m-button" data-size="sm">${priority.medium} Medium</button>
                <button type="button" class="m-button" data-size="sm">${icon(I.user, 14)} Assignee</button>
              </div>
            </div>
            <footer class="m-dialog-footer">
              <label class="m-field" data-layout="inline" style="${small}; color: var(--m-color-fg-muted); margin-inline-end: auto"><input class="m-switch" type="checkbox" role="switch"> Create more</label>
              <button type="button" class="m-button" data-variant="primary">Create issue</button>
            </footer>
          </div>
        </section>
        <section class="m-stack" data-gap="3" aria-labelledby="ob-toast-errors">
          <h2 id="ob-toast-errors" style="${meta}">Somewhere else</h2>
          <div class="m-toast-region" data-static aria-live="polite" style="position: static; inline-size: auto; max-inline-size: 26rem; padding: 0; align-items: start">
            <div class="m-toast" data-tone="danger" role="alert">
              <div class="m-toast-content">
                <p class="m-toast-title">Couldn't move PLT-466</p>
                <p class="m-toast-body">You're offline. The change is kept and will sync when you reconnect.</p>
                <div class="m-toast-actions"><button type="button" class="m-button" data-size="sm">Retry</button></div>
              </div>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Dismiss">${icon(I.x, 14)}</button>
            </div>
          </div>
        </section>
        <section class="m-stack" data-gap="3" aria-labelledby="ob-page-errors">
          <h2 id="ob-page-errors" style="${meta}">A whole page</h2>
          <div class="m-grid" style="--m-layout-grid-min: 15rem">
            ${fullPage(I.compass, '404', 'Nothing at this address', 'The issue may have moved to another squad, or the link is incomplete.', `<a class="m-button" data-variant="primary" data-size="sm" href="#">Go to Queue</a>`)}
            ${fullPage(I.serverOff, '500', 'Something broke on our side', 'Nothing you changed was lost. Try again in a moment.', `<button type="button" class="m-button" data-size="sm">Try again</button><a class="m-button" data-variant="ghost" data-size="sm" href="#">Status page</a>`)}
            ${fullPage(I.lock, '403', 'This squad is private', 'Ask a squad admin to add you, or open a squad you belong to.', `<button type="button" class="m-button" data-variant="primary" data-size="sm">Request access</button>`)}
          </div>
        </section>
      </div>
    </div>`,
);

export const obsidianRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'A team overview in the inset panel: a row of plain figures, a stacked bar chart and a sprint meter in hairline cards, then a full-bleed projects list.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'Issues grouped under grey status bars in dense 36px rows (priority, ID, status, title, label pills, date, assignee), with the selected issue open in a side panel.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One centred step with a thin progress bar and a display heading, teaching the command menu by showing it: a context chip, a large borderless input, grouped commands with keys.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A settings sidebar with a back link and plain group headings; each section a hairline panel of rows with the label and help on the left and the control on the right.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'A large thin icon, a 15px medium heading, one or two muted lines, and the primary action with its key.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The public page: a blurred bar, a faint indigo glow behind the title, plan columns split by hairlines with a yearly switch and pill buttons (inverted for the one to pick), then a comparison list and questions.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors under the field and a summary above them in the new-issue dialog, an offline toast that keeps the change, and full pages for 404, 500 and no access.',
    html: errors,
  },
];
