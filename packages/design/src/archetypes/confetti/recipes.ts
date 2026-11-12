import type { ArchetypeRecipe } from '../types';

/*
 * Confetti's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from a made-up podcast host ("Gumdrop") studying its own
 * product. The app screens follow the language's real patterns: a warm 215px navigation column with
 * coloured tool icons, a strip of open tabs above each scene, a bold scene title with ledge buttons
 * on the right, white hairline panels, tiny uppercase meta lines over chart titles, dashed gridlines,
 * bold uppercase table headers and lilac lettermarks. Pricing and onboarding take the public site's
 * quirk instead: a desktop with labelled icons, a taskbar, and pages that open as windows.
 */

// Lucide icons, outlined, 1.5px stroke
const icon = (paths: string, size = 16, style = '') =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${style ? ` style="${style}"` : ''}>${paths}</svg>`;
const I = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  inbox:
    '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/>',
  board:
    '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  route:
    '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  toggle: '<rect width="20" height="12" x="2" y="6" rx="6"/><circle cx="16" cy="12" r="2"/>',
  flask:
    '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/>',
  poll: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8"/><path d="M8 13h5"/>',
  video:
    '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  database:
    '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  up: '<path d="m18 15-6-6-6 6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  calendar:
    '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  filter: '<path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/>',
  sparkles:
    '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  share: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  copy: '<rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  warn: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  trash:
    '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  mic: '<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/>',
  folder:
    '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  receipt:
    '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  terminal: '<path d="M12 19h8"/><path d="m4 17 6-6-6-6"/>',
  globe:
    '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
  key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  plug: '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
  square: '<rect width="18" height="18" x="3" y="3" rx="2"/>',
  minus: '<path d="M5 12h14"/>',
  trendUp: '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
  trendDown: '<path d="M16 17h6v-6"/><path d="m22 17-8.5-8.5-5 5L2 7"/>',
  panel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
  server:
    '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',
};
type IconName = keyof typeof I;

// Each tool in the navigation has its own colour, from the status and brand tokens
const tone = {
  blue: 'color: var(--m-color-info-solid)',
  amber: 'color: var(--m-color-warning-solid)',
  orange: 'color: var(--m-color-accent-default)',
  green: 'color: var(--m-color-success-solid)',
  red: 'color: var(--m-color-danger-solid)',
  brand: 'color: var(--m-color-brand-default)',
  ink: 'color: var(--m-color-fg-muted)',
};

const num = 'font-variant-numeric: tabular-nums';
const sceneTitle =
  'font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight); margin: 0';
const h2 = 'font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-bold); margin: 0';
// The tiny uppercase line over a chart title ("LINE · LAST 30 DAYS")
const meta =
  'font-size: 0.6875rem; font-weight: var(--m-font-weight-semibold); text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide); color: var(--m-color-fg-subtle)';
const hair = (side = 'block-end') => `border-${side}: var(--m-border-width-thin) solid var(--m-color-border-default)`;
const axis = 'font-size: 0.6875rem; fill: var(--m-color-fg-muted)';
const big = `font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: 1; ${num}`;

const navItem = (ic: IconName, label: string, color: string, current: string, extra = '') =>
  `          <li><a class="m-sidebar-link" href="#"${label === current ? ' aria-current="page"' : ''}>${icon(I[ic], 16, color)} ${label}${extra}</a></li>`;

// The app shell: the warm navigation column, the strip of open tabs, and the scene
const shell = (
  current: string,
  tabs: [IconName, string, string][],
  main: string,
) => `<div class="m-split" style="min-block-size: 100vh">
  <nav class="m-sidebar" aria-label="Main">
    <div class="m-cluster" data-justify="between" style="padding: var(--m-space-1)">
      <span class="m-cluster" data-gap="2" style="font-weight: var(--m-font-weight-semibold)"><span class="m-avatar" data-size="md" style="border-radius: var(--m-radius-md)">G</span> Gumdrop Web</span>
      ${icon(I.down, 14, tone.ink)}
    </div>
    <div class="m-sidebar-section">
      <ul>
${navItem('home', 'Overview', tone.ink, current)}
${navItem('inbox', 'Inbox', tone.ink, current, ' <span class="m-sidebar-count" style="margin-inline-start: auto">7</span>')}
${navItem('compass', 'Explore', tone.ink, current)}
${navItem('sparkles', 'Ask a question', tone.ink, current)}
      </ul>
    </div>
    <div class="m-sidebar-section" style="${hair('block-start')}; padding-block-start: var(--m-space-3)">
      <h2 class="m-sidebar-heading">Understand</h2>
      <ul>
${navItem('board', 'Boards', tone.amber, current)}
${navItem('chart', 'Charts', tone.blue, current)}
${navItem('route', 'Journeys', tone.green, current)}
${navItem('users', 'Listeners', tone.blue, current)}
${navItem('video', 'Session tapes', tone.amber, current)}
      </ul>
    </div>
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Ship</h2>
      <ul>
${navItem('toggle', 'Switches', tone.green, current)}
${navItem('flask', 'Trials', tone.red, current, ' <span class="m-badge" data-tone="warning" style="margin-inline-start: auto">Beta</span>')}
${navItem('poll', 'Polls', tone.orange, current)}
${navItem('database', 'Sources', tone.ink, current)}
      </ul>
    </div>
    <div class="m-sidebar-section" style="${hair('block-start')}; padding-block-start: var(--m-space-3); margin-block-start: auto">
      <ul>
${navItem('gear', 'Workspace settings', tone.ink, current)}
${navItem('help', 'Help and docs', tone.ink, current)}
      </ul>
    </div>
  </nav>
  <div class="m-stack" data-gap="0">
    <div class="m-cluster" data-gap="1" style="background: var(--m-sidebar-bg); padding: var(--m-space-1) var(--m-space-2) 0; ${hair()}; flex-wrap: nowrap; overflow: hidden">
${tabs
  .map(
    ([ic, label, color], i) =>
      `      <span class="m-cluster" data-gap="2" style="padding: var(--m-space-1) var(--m-space-3); font-size: var(--m-font-size-sm); border-radius: var(--m-radius-md) var(--m-radius-md) 0 0; white-space: nowrap; ${i === 0 ? 'background: var(--m-color-bg-canvas); border: var(--m-border-width-thin) solid var(--m-color-border-default); border-block-end: 0; margin-block-end: calc(var(--m-border-width-thin) * -1)' : 'color: var(--m-color-fg-muted)'}">${icon(I[ic], 14, color)} ${label}</span>`,
  )
  .join('\n')}
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="New tab">${icon(I.plus, 14)}</button>
    </div>
    <main style="padding: var(--m-space-4) var(--m-space-4) var(--m-space-16); min-inline-size: 0">
${main}
    </main>
  </div>
</div>`;

// A scene's title row: the tool icon, the title, and ledge buttons on the right
const titleRow = (
  ic: IconName,
  color: string,
  title: string,
  actions: string,
  sub = '',
) => `      <header class="m-stack" data-gap="1" style="margin-block-end: var(--m-space-4)">
        <div class="m-cluster" data-justify="between">
          <div class="m-cluster" data-gap="2">${icon(I[ic], 20, color)}<h1 style="${sceneTitle}">${title}</h1></div>
          <div class="m-cluster" data-gap="2">
${actions}
          </div>
        </div>${sub ? `\n        <p class="m-muted" style="margin: 0">${sub}</p>` : ''}
      </header>`;

// ---------------------------------------------------------------- dashboard

// Daily listeners over 30 days, two series, with dashed gridlines and a y axis
const listeners = [
  420, 455, 438, 470, 512, 498, 466, 530, 548, 571, 540, 590, 612, 598, 640, 655, 630, 688, 702, 676, 720, 748, 731,
  770, 802, 788, 815, 842, 830, 866,
];
const returning = [
  180, 192, 176, 205, 214, 220, 210, 236, 230, 248, 252, 260, 255, 279, 284, 290, 276, 302, 311, 300, 322, 330, 318,
  340, 352, 349, 361, 372, 368, 380,
];
const path = (vals: number[], w: number, h: number, max: number) =>
  vals
    .map(
      (v, i) => `${i === 0 ? 'M' : 'L'}${((i * w) / (vals.length - 1)).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`,
    )
    .join(' ');
const grid = (h: number, steps: number[], max: number, w = 560) =>
  steps
    .map((s) => {
      const y = (h - (s / max) * h).toFixed(1);
      return `<line x1="40" x2="${w}" y1="${y}" y2="${y}" style="stroke: var(--m-color-border-default)" stroke-dasharray="4 4"/><text x="34" y="${+y + 4}" text-anchor="end" style="${axis}">${s}</text>`;
    })
    .join('');
const lineChart = `<svg viewBox="0 0 560 200" width="100%" style="display: block; block-size: 13rem; overflow: visible" role="img" aria-label="Daily listeners rose from 420 to 866 over 30 days; returning listeners from 180 to 380">
              ${grid(180, [0, 250, 500, 750, 1000], 1000)}
              <g transform="translate(44 0)">
                <path d="${path(returning, 512, 180, 1000)}" fill="none" style="stroke: var(--m-color-warning-solid)" stroke-width="2"/>
                <path d="${path(listeners, 512, 180, 1000)}" fill="none" style="stroke: var(--m-color-info-solid)" stroke-width="2"/>
              </g>
              <text x="44" y="198" style="${axis}">Oct 13</text><text x="300" y="198" text-anchor="middle" style="${axis}">Oct 27</text><text x="556" y="198" text-anchor="end" style="${axis}">Nov 11</text>
            </svg>`;

// A step chart: solid bars for who made it, a hatched remainder for who dropped off
const step = (
  n: number,
  label: string,
  pct: number,
  people: string,
) => `<div class="m-stack" data-gap="2" style="flex: 1; min-inline-size: 0">
                <div style="block-size: 9rem; display: flex; flex-direction: column; justify-content: flex-end; background: repeating-linear-gradient(-45deg, var(--m-color-info-bg) 0 5px, transparent 5px 10px)">
                  <div style="block-size: ${pct}%; background: var(--m-color-info-solid)"></div>
                </div>
                <div class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-sm); flex-wrap: nowrap"><span class="m-badge">${n}</span><strong style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">${label}</strong></div>
                <span class="m-muted" style="font-size: var(--m-font-size-sm); ${num}">${people} · ${pct}%</span>
              </div>`;

// A retention grid: each cell is the blue at the share of people who came back
const cohorts: [string, string, number[]][] = [
  ['Oct 14', '1,204', [100, 46, 38, 33, 31]],
  ['Oct 21', '1,388', [100, 49, 41, 36]],
  ['Oct 28', '1,512', [100, 52, 44]],
  ['Nov 4', '1,467', [100, 55]],
];
const cell = (v: number) =>
  `<td data-numeric style="padding: 2px"><div style="position: relative; border-radius: var(--m-radius-sm); padding: var(--m-space-1) var(--m-space-2); text-align: center; ${v > 45 ? 'color: var(--m-color-info-on-solid)' : ''}"><span style="position: absolute; inset: 0; border-radius: inherit; background: var(--m-color-info-solid); opacity: ${(0.12 + (v / 100) * 0.88).toFixed(2)}"></span><span style="position: relative">${v}%</span></div></td>`;

const insightHead = (
  kind: string,
  title: string,
) => `<div class="m-cluster" data-justify="between" style="align-items: flex-start; flex-wrap: nowrap">
              <div class="m-stack" data-gap="1"><span style="${meta}">${kind}</span><h2 class="m-card-title" style="font-size: var(--m-font-size-md); margin: 0">${title}</h2></div>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="More">${icon(I.more, 16)}</button>
            </div>`;

const dashboard = shell(
  'Boards',
  [
    ['board', 'Weekly pulse', tone.amber],
    ['users', 'Listeners', tone.blue],
    ['route', 'First upload', tone.green],
  ],
  `${titleRow(
    'board',
    tone.amber,
    'Weekly pulse',
    `            <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Pin">${icon(I.star, 16)}</button>
            <button type="button" class="m-button">${icon(I.share, 16)} Share</button>
            <button type="button" class="m-button" data-variant="primary">${icon(I.plus, 16)} Add a chart</button>`,
    'How listening, uploads and first plays moved this month. Refreshed 4 minutes ago.',
  )}
      <div class="m-cluster" data-gap="2" style="margin-block-end: var(--m-space-4)">
        <button type="button" class="m-button" data-size="sm">${icon(I.calendar, 16)} Last 30 days ${icon(I.down, 14)}</button>
        <button type="button" class="m-button" data-size="sm">${icon(I.filter, 16)} Filters</button>
        <button type="button" class="m-button" data-size="sm">${icon(I.plus, 16)} Break down by</button>
        <span class="m-subtle" style="font-size: var(--m-font-size-sm); margin-inline-start: auto">Computed 4 minutes ago · <a href="#" style="color: var(--m-color-accent-text)">Refresh</a></span>
      </div>
      <div class="m-stack" data-gap="4">
        <div class="m-split" style="--m-layout-split-side: 18rem; --m-layout-split-gap: var(--m-space-4); align-items: stretch">
        <article class="m-card" data-size="sm">
          <div class="m-stack" data-gap="3" style="block-size: 100%">
            ${insightHead('Number · this month', 'Episodes published')}
            <div class="m-stack" data-gap="2" style="margin-block: auto">
              <span style="${big}">1,284</span>
              <span class="m-cluster" data-gap="1" style="color: var(--m-color-success-fg); font-weight: var(--m-font-weight-semibold)">${icon(I.trendUp, 16)} 12.4% <span class="m-muted" style="font-weight: var(--m-font-weight-regular)">on October</span></span>
            </div>
            <div style="${hair('block-start')}; padding-block-start: var(--m-space-3)" class="m-cluster" data-justify="between">
              <span class="m-muted" style="font-size: var(--m-font-size-sm)">Median length</span><strong style="${num}">38 min</strong>
            </div>
          </div>
        </article>
        <article class="m-card" data-size="sm">
          <div class="m-stack" data-gap="3">
            ${insightHead('Line · daily · last 30 days', 'Daily listeners')}
            <div class="m-cluster" data-gap="4" style="font-size: var(--m-font-size-sm)">
              <span class="m-cluster" data-gap="1"><span style="inline-size: 10px; block-size: 10px; border-radius: 2px; background: var(--m-color-info-solid)"></span> All listeners</span>
              <span class="m-cluster" data-gap="1"><span style="inline-size: 10px; block-size: 10px; border-radius: 2px; background: var(--m-color-warning-solid)"></span> Returning</span>
            </div>
            ${lineChart}
          </div>
        </article>
        </div>
        <div class="m-split" style="--m-layout-split-side: 18rem; --m-layout-split-gap: var(--m-space-4); align-items: stretch">
        <article class="m-card" data-size="sm">
          <div class="m-stack" data-gap="3">
            ${insightHead('Table · last 7 days', 'Where listeners came from')}
            <div class="m-table-wrap" style="border: 0; border-radius: 0">
              <table class="m-table" data-density="compact">
                <thead><tr><th>Source</th><th data-numeric>Visitors</th><th data-numeric>Share</th></tr></thead>
                <tbody>
                  <tr><td>Newsletter</td><td data-numeric>3,904</td><td data-numeric>38%</td></tr>
                  <tr><td>Search</td><td data-numeric>2,611</td><td data-numeric>25%</td></tr>
                  <tr><td>Direct</td><td data-numeric>1,977</td><td data-numeric>19%</td></tr>
                  <tr><td>Show notes</td><td data-numeric>1,120</td><td data-numeric>11%</td></tr>
                  <tr><td>Other</td><td data-numeric>702</td><td data-numeric>7%</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </article>
        <article class="m-card" data-size="sm">
          <div class="m-stack" data-gap="3">
            ${insightHead('Steps · conversion within 14 days', 'Sign-up to first upload')}
            <div class="m-cluster" data-gap="6" style="font-size: var(--m-font-size-sm)">
              <span>Total conversion <strong style="${num}">31.6%</strong></span>
              <span>Median time <strong style="color: var(--m-color-accent-text)">2d 4h</strong></span>
            </div>
            <div class="m-cluster" data-gap="3" style="align-items: stretch; flex-wrap: nowrap">
              ${step(1, 'Signed up', 100, '4,860')}
              ${step(2, 'Made a show', 62, '3,013')}
              ${step(3, 'Recorded', 44, '2,138')}
              ${step(4, 'Uploaded', 32, '1,536')}
            </div>
          </div>
        </article>
        </div>
        <article class="m-card" data-size="sm">
          <div class="m-stack" data-gap="3">
            ${insightHead('Return rate · weekly cohorts', 'Who comes back after their first episode')}
            <div class="m-table-wrap" style="border: 0; border-radius: 0">
              <table class="m-table" data-density="compact">
                <thead><tr><th>Cohort</th><th data-numeric>People</th><th data-numeric>Week 0</th><th data-numeric>Week 1</th><th data-numeric>Week 2</th><th data-numeric>Week 3</th><th data-numeric>Week 4</th></tr></thead>
                <tbody>
${cohorts.map(([c, n, vals]) => `                  <tr><td>${c}</td><td data-numeric>${n}</td>${vals.map(cell).join('')}${'<td></td>'.repeat(5 - vals.length)}</tr>`).join('\n')}
                </tbody>
              </table>
            </div>
          </div>
        </article>
      </div>`,
);

// ---------------------------------------------------------------- list and detail

const people: [string, string, string, string, string, number, string][] = [
  ['PO', 'priya.okafor@lumen.fm', 'Lagos', 'Sep 2', '2 minutes ago', 1840, 'Host'],
  ['TR', 'tomasz@brightbarn.audio', 'Kraków', 'Jun 19', '14 minutes ago', 932, 'Host'],
  ['IH', 'ines.halvorsen@mail.no', 'Bergen', 'Oct 30', '1 hour ago', 77, 'Listener'],
  ['KL', 'kwame.l@studio-nine.co', 'Accra', 'Mar 8', '3 hours ago', 2215, 'Host'],
  ['MC', 'mei.calder@quietroom.org', 'Wellington', 'Aug 21', 'yesterday', 410, 'Listener'],
  ['RD', 'rafael.diniz@ondas.br', 'Recife', 'Nov 1', 'yesterday', 58, 'Listener'],
  ['AS', 'anja.sorensen@kort.dk', 'Aarhus', 'Jan 12', '2 days ago', 1309, 'Host'],
];
const listDetail = shell(
  'Listeners',
  [
    ['users', 'Listeners', tone.blue],
    ['board', 'Weekly pulse', tone.amber],
  ],
  `${titleRow(
    'users',
    tone.blue,
    'Listeners',
    `            <button type="button" class="m-button">${icon(I.download, 16)} Export</button>
            <button type="button" class="m-button" data-variant="primary">${icon(I.plus, 16)} New group</button>`,
    'Everyone who has played, recorded or uploaded on Gumdrop, newest activity first.',
  )}
      <div class="m-tabs">
        <div class="m-tab-list" role="tablist" aria-label="Listener views">
          <button type="button" class="m-tab" role="tab" aria-selected="true">People</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Groups</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Traits</button>
        </div>
      </div>
      <div class="m-split" style="--m-layout-split-side: 22rem; --m-layout-split-gap: var(--m-space-4); flex-direction: row-reverse; align-items: flex-start; margin-block-start: var(--m-space-4)">
        <aside class="m-card" data-size="sm" aria-label="Selected person">
          <div class="m-stack" data-gap="4">
            <div class="m-cluster" data-justify="between" style="align-items: flex-start">
              <div class="m-cluster" data-gap="3"><span class="m-avatar" data-size="lg">KL</span><div class="m-stack" data-gap="1"><strong>Kwame Lindqvist</strong><span class="m-muted" style="font-size: var(--m-font-size-sm)">kwame.l@studio-nine.co</span></div></div>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Close">${icon(I.x, 16)}</button>
            </div>
            <div class="m-cluster" data-gap="1"><span class="m-badge" data-tone="success">Host</span><span class="m-badge">Paid plan</span><span class="m-badge">Accra</span></div>
            <div class="m-tabs" data-variant="pill">
              <div class="m-tab-list" role="tablist" aria-label="Person">
                <button type="button" class="m-tab" role="tab" aria-selected="true">Traits</button>
                <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Timeline</button>
                <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Tapes</button>
              </div>
            </div>
            <dl class="m-stack" data-gap="0" style="margin: 0; font-size: var(--m-font-size-sm)">
${[
  ['first_show', 'Night Shift Radio'],
  ['plan', 'studio_annual'],
  ['episodes', '214'],
  ['browser', 'Firefox 141'],
  ['initial_referrer', 'newsletter'],
  ['timezone', 'Africa/Accra'],
]
  .map(
    ([k, v]) =>
      `              <div class="m-cluster" data-justify="between" style="${hair()}; padding-block: var(--m-space-2); flex-wrap: nowrap"><dt><code class="m-code-inline">${k}</code></dt><dd style="margin: 0; text-align: end">${v}</dd></div>`,
  )
  .join('\n')}
            </dl>
            <button type="button" class="m-button" style="justify-content: center">${icon(I.video, 16)} Watch latest tape</button>
          </div>
        </aside>
        <div class="m-stack" data-gap="3" style="min-inline-size: 0">
          <div class="m-cluster" data-gap="3">
            <input class="m-input" type="search" placeholder="Search by email or name" aria-label="Search listeners" style="max-inline-size: 16rem">
            <span class="m-muted" style="font-size: var(--m-font-size-sm); ${num}">1–7 of 3,912 people</span>
            <span style="margin-inline-start: auto" class="m-cluster" data-gap="2"><strong style="font-size: var(--m-font-size-sm)">Role</strong>
              <select class="m-select" data-size="sm" aria-label="Role"><option>Anyone</option><option>Hosts</option><option>Listeners</option></select></span>
          </div>
          <div class="m-table-wrap">
            <table class="m-table">
              <thead><tr><th style="inline-size: 2rem"><input class="m-checkbox" type="checkbox" aria-label="Select all"></th><th>Person</th><th>City</th><th>First seen</th><th>Last active</th><th data-numeric>Plays</th><th><span class="m-sr-only">Actions</span></th></tr></thead>
              <tbody>
${people
  .map(
    ([ini, email, city, first, last, plays, role], i) =>
      `                <tr${i === 3 ? ' style="background: var(--m-color-accent-subtle)"' : ''}><td><input class="m-checkbox" type="checkbox" aria-label="Select ${email}"${i === 3 ? ' checked' : ''}></td><td><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span class="m-avatar" data-size="md">${ini[0]}</span><span class="m-stack" data-gap="0"><strong style="font-weight: var(--m-font-weight-semibold)">${email}</strong><span class="m-subtle" style="font-size: var(--m-font-size-xs)">${role}</span></span></span></td><td>${city}</td><td class="m-muted">${first}</td><td class="m-muted">${last}</td><td data-numeric>${plays.toLocaleString('en-US')}</td><td><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="More">${icon(I.more, 16)}</button></td></tr>`,
  )
  .join('\n')}
              </tbody>
            </table>
            <div class="m-cluster" data-justify="end" data-gap="2" style="${hair('block-start')}; padding: var(--m-space-2)">
              <span class="m-muted" style="font-size: var(--m-font-size-sm); ${num}">1–7 of 3,912 people</span>
              <nav class="m-pagination" aria-label="Pages">
                <a class="m-pagination-item" aria-disabled="true" aria-label="Previous">${icon(I.left, 16)}</a>
                <a class="m-pagination-item" href="#" aria-current="page">1</a>
                <a class="m-pagination-item" href="#">2</a>
                <a class="m-pagination-item" href="#">3</a>
                <span class="m-pagination-ellipsis">…</span>
                <a class="m-pagination-item" href="#">559</a>
                <a class="m-pagination-item" href="#" aria-label="Next">${icon(I.right, 16)}</a>
              </nav>
            </div>
          </div>
        </div>
      </div>`,
);

// ---------------------------------------------------------------- the public site's desktop

// A desktop icon: a big outlined glyph over its label, as on the public site
const desk = (ic: IconName, label: string) =>
  `<a href="#" class="m-stack" data-gap="1" data-align="center" style="inline-size: 5.5rem; text-align: center; font-size: var(--m-font-size-sm); color: var(--m-color-fg-default); text-decoration: none">${icon(I[ic], 32, 'color: var(--m-color-fg-muted)')}<span>${label}</span></a>`;

const taskbar = (current: string) => `  <header class="m-navbar">
    <a class="m-navbar-brand" href="#">${icon(I.mic, 20, tone.orange)} gumdrop</a>
    <nav class="m-navbar-nav" aria-label="Site">
${['Tools', 'Pricing', 'Docs', 'Stories', 'About']
  .map((l) => `      <a class="m-navbar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${l}</a>`)
  .join('\n')}
    </nav>
    <div class="m-navbar-actions">
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Search">${icon(I.search, 16)}</button>
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Sign in">${icon(I.user, 16)}</button>
      <button type="button" class="m-button" data-variant="primary" data-size="sm">Start free</button>
    </div>
  </header>`;

// A window on the desktop: a title bar with the window controls, then its page
const windowFrame = (
  title: string,
  body: string,
  width = '62rem',
) => `<section class="m-card" data-size="sm" style="padding: 0; max-inline-size: ${width}; inline-size: 100%; margin-inline: auto; box-shadow: var(--m-shadow-overlay); overflow: hidden" aria-label="${title}">
      <div class="m-cluster" data-justify="between" style="padding: var(--m-space-2) var(--m-space-3); background: var(--m-color-bg-sunken); ${hair()}">
        <span class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-semibold)">${icon(I.folder, 14, tone.brand)} ${title}</span>
        <span class="m-cluster" data-gap="1" style="color: var(--m-color-fg-muted)">${icon(I.minus, 14)}${icon(I.square, 13)}${icon(I.x, 14)}</span>
      </div>
${body}
    </section>`;

const desktop = (
  current: string,
  win: string,
) => `<div class="m-stack" data-gap="0" style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
${taskbar(current)}
  <div class="m-cluster" data-gap="4" style="align-items: flex-start; flex-wrap: nowrap; padding: var(--m-space-6) var(--m-space-4)">
    <div class="m-stack" data-gap="4" style="flex: none">
      ${desk('home', 'Home')}
      ${desk('receipt', 'Pricing')}
      ${desk('book', 'Docs')}
      ${desk('terminal', 'Changelog')}
      ${desk('trash', 'Bin')}
    </div>
    <div style="flex: 1; min-inline-size: 0">
    ${win}
    </div>
  </div>
</div>`;

// ---------------------------------------------------------------- onboarding

const tool = (
  ic: IconName,
  color: string,
  name: string,
  line: string,
  on: boolean,
) => `<label class="m-card" data-size="sm" data-interactive style="cursor: pointer;${on ? ' border-color: var(--m-color-brand-default); box-shadow: inset 0 -3px 0 var(--m-color-brand-default)' : ''}">
              <div class="m-cluster" data-justify="between" style="align-items: flex-start; flex-wrap: nowrap">
                <span class="m-stack" data-gap="1">${icon(I[ic], 24, color)}<strong style="margin-block-start: var(--m-space-2)">${name}</strong><span class="m-muted" style="font-size: var(--m-font-size-sm)">${line}</span></span>
                <input class="m-checkbox" type="checkbox"${on ? ' checked' : ''} aria-label="${name}">
              </div>
            </label>`;

const onboarding = desktop(
  '',
  windowFrame(
    'set-up.exe',
    `      <div class="m-stack" data-gap="6" style="padding: var(--m-space-8) var(--m-space-6)">
        <div class="m-stack" data-gap="2">
          <div class="m-cluster" data-justify="between"><span style="${meta}">Step 2 of 4</span><span class="m-subtle" style="font-size: var(--m-font-size-sm)">About 3 minutes left</span></div>
          <progress class="m-progress" value="2" max="4" aria-label="Set-up progress">2 of 4</progress>
        </div>
        <div class="m-stack" data-gap="2">
          <h1 style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight); margin: 0">Which tools should we <span style="background: var(--m-color-brand-subtle); box-shadow: 0 0 0 4px var(--m-color-brand-subtle); border-radius: var(--m-radius-sm)">switch on?</span></h1>
          <p class="m-muted" style="margin: 0; font-size: var(--m-font-size-lg)">Pick as many as you like. Each one is free until you're properly busy, and you can change your mind later.</p>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 15rem; --m-layout-grid-gap: var(--m-space-3)">
          ${tool('chart', tone.blue, 'Charts', 'Count, compare and break down anything people do', true)}
          ${tool('video', tone.amber, 'Session tapes', 'Watch real visits back, clicks and all', true)}
          ${tool('toggle', tone.green, 'Switches', 'Ship to some people before everyone', false)}
          ${tool('flask', tone.red, 'Trials', 'Test two versions and keep the winner', false)}
          ${tool('poll', tone.orange, 'Polls', 'Ask a question right inside your app', false)}
          ${tool('database', tone.ink, 'Sources', 'Pull in billing and support data', false)}
        </div>
        <div class="m-alert" data-tone="info" role="note">
          <span class="m-alert-icon">${icon(I.info, 18)}</span>
          <div class="m-alert-content"><p class="m-alert-body">Charts and tapes share one snippet. Paste it once and both start collecting.</p></div>
        </div>
        <div class="m-cluster" data-justify="between" style="${hair('block-start')}; padding-block-start: var(--m-space-4)">
          <button type="button" class="m-button" data-variant="ghost">${icon(I.back, 16)} Back</button>
          <div class="m-cluster" data-gap="2">
            <button type="button" class="m-button" data-variant="ghost">Skip for now</button>
            <button type="button" class="m-button" data-variant="primary" data-size="lg">Continue with 2 tools ${icon(I.arrow, 16)}</button>
          </div>
        </div>
      </div>`,
    '52rem',
  ),
);

// ---------------------------------------------------------------- settings

const settingsNav = (current: string) =>
  `<nav class="m-sidebar" aria-label="Settings" style="--m-sidebar-bg: transparent; --m-sidebar-border: transparent; --m-sidebar-width: 14rem; padding: 0; flex-grow: 0">
          <div class="m-sidebar-section"><h2 class="m-sidebar-heading">Workspace</h2><ul>
${['General', 'Data capture', 'Members', 'Integrations', 'Billing'].map((l) => `            <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${l}</a></li>`).join('\n')}
          </ul></div>
          <div class="m-sidebar-section"><h2 class="m-sidebar-heading">You</h2><ul>
${['Profile', 'Notifications', 'Personal keys'].map((l) => `            <li><a class="m-sidebar-link" href="#">${l}</a></li>`).join('\n')}
          </ul></div>
        </nav>`;

const section = (
  title: string,
  body: string,
  desc = '',
) => `          <section class="m-stack" data-gap="3" style="${hair()}; padding-block-end: var(--m-space-6)">
            <div class="m-stack" data-gap="1"><h2 style="${h2}">${title}</h2>${desc ? `<p class="m-muted" style="margin: 0">${desc}</p>` : ''}</div>
${body}
          </section>`;

const settings = shell(
  'Workspace settings',
  [
    ['gear', 'Settings', tone.ink],
    ['board', 'Weekly pulse', tone.amber],
  ],
  `${titleRow('gear', tone.ink, 'Workspace settings', `            <button type="button" class="m-button" data-variant="ghost">${icon(I.help, 16)} Settings guide</button>`)}
      <div class="m-split" style="--m-layout-split-side: 14rem; --m-layout-split-gap: var(--m-space-8); align-items: flex-start">
        ${settingsNav('Data capture')}
        <div><div class="m-stack" data-gap="6" style="max-inline-size: 46rem">
${section(
  'Workspace name',
  `            <form class="m-cluster" data-gap="2" style="align-items: flex-end">
              <div class="m-field" style="flex: 1; min-inline-size: 14rem"><label class="m-field-label" for="ws">Name</label><input class="m-input" id="ws" value="Gumdrop Web"></div>
              <button type="button" class="m-button" data-variant="primary">Rename</button>
            </form>`,
)}
${section(
  'Record clicks and page views on their own',
  `            <label class="m-cluster" data-gap="3"><input class="m-switch" type="checkbox" role="switch" checked> <span style="font-weight: var(--m-font-weight-medium)">Capture clicks, form submits and page changes</span></label>
            <label class="m-cluster" data-gap="3"><input class="m-switch" type="checkbox" role="switch"> <span style="font-weight: var(--m-font-weight-medium)">Capture what people copy</span></label>`,
  'Turn this on and you get events without writing any tracking code. Text people type is never kept.',
)}
${section(
  'Session tapes',
  `            <fieldset class="m-stack" data-gap="2" style="border: 0; padding: 0; margin: 0">
              <legend class="m-field-label" style="margin-block-end: var(--m-space-2)">Record</legend>
              <label class="m-cluster" data-gap="2"><input class="m-radio" type="radio" name="rec" checked> Every visit</label>
              <label class="m-cluster" data-gap="2"><input class="m-radio" type="radio" name="rec"> One in ten visits</label>
              <label class="m-cluster" data-gap="2"><input class="m-radio" type="radio" name="rec"> Only visits that hit an error</label>
            </fieldset>
            <div class="m-field" style="max-inline-size: 20rem"><label class="m-field-label" for="ret">Keep tapes for</label>
              <select class="m-select" id="ret"><option>30 days</option><option selected>90 days</option><option>1 year</option></select>
              <span class="m-field-hint">Longer than 90 days uses paid storage.</span></div>`,
)}
${section(
  'Snippet key',
  `            <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap">
              <code class="m-code-inline" style="flex: 1; padding: var(--m-space-2) var(--m-space-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap">gd_live_7Qm2xR9vKp4TzB1nW8cYe3H</code>
              <button type="button" class="m-button">${icon(I.copy, 16)} Copy</button>
              <button type="button" class="m-button">${icon(I.refresh, 16)} Rotate</button>
            </div>`,
  'Public by design: it can only send events in, never read them out.',
)}
          <section class="m-stack" data-gap="3">
            <h2 style="${h2}; color: var(--m-color-danger-fg)">Danger zone</h2>
            <div class="m-card" data-size="sm" style="border-color: var(--m-color-danger-border)">
              <div class="m-cluster" data-justify="between">
                <div class="m-stack" data-gap="1"><strong>Delete this workspace</strong><span class="m-muted" style="font-size: var(--m-font-size-sm)">Removes 18 months of events, 41 boards and every tape. This can't be undone.</span></div>
                <button type="button" class="m-button" data-variant="danger">${icon(I.trash, 16)} Delete workspace</button>
              </div>
            </div>
          </section>
        </div></div>
      </div>`,
);

// ---------------------------------------------------------------- empty state

const emptyState = shell(
  'Polls',
  [
    ['poll', 'Polls', tone.orange],
    ['board', 'Weekly pulse', tone.amber],
  ],
  `${titleRow('poll', tone.orange, 'Polls', `            <button type="button" class="m-button" data-variant="primary">${icon(I.plus, 16)} New poll</button>`)}
      <div class="m-tabs">
        <div class="m-tab-list" role="tablist" aria-label="Poll views">
          <button type="button" class="m-tab" role="tab" aria-selected="true">Polls</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Replies</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Templates</button>
        </div>
      </div>
      <section class="m-card" style="border-style: dashed; margin-block-start: var(--m-space-4); padding-block: var(--m-space-12)" aria-labelledby="empty-title">
        <div class="m-stack" data-gap="4" data-align="center" style="text-align: center; max-inline-size: 34rem; margin-inline: auto">
          <span style="display: grid; place-items: center; inline-size: 4rem; block-size: 4rem; border-radius: var(--m-radius-lg); background: var(--m-color-brand-subtle); color: var(--m-color-accent-default); box-shadow: inset 0 -3px 0 var(--m-color-brand-default)">${icon(I.poll, 32)}</span>
          <h2 id="empty-title" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); margin: 0">Nobody's been asked anything yet</h2>
          <p class="m-muted" style="margin: 0; font-size: var(--m-font-size-lg)">Pop a one-question poll into your app, or send a longer one by link. Replies land here, sorted by mood.</p>
          <div class="m-cluster" data-gap="2" data-justify="center">
            <button type="button" class="m-button" data-variant="primary" data-size="lg">${icon(I.plus, 16)} Write your first poll</button>
            <button type="button" class="m-button" data-size="lg">${icon(I.book, 16)} Pick a template</button>
          </div>
          <a href="#" class="m-cluster" data-gap="1" style="font-size: var(--m-font-size-sm); color: var(--m-color-accent-text); font-weight: var(--m-font-weight-semibold)">How polls work ${icon(I.share, 14)}</a>
        </div>
      </section>
      <div class="m-grid" style="--m-layout-grid-min: 16rem; margin-block-start: var(--m-space-4)">
${[
  ['smile', 'How did that episode feel?', 'A five-face rating after playback'],
  ['poll', 'What should we build next?', 'Multiple choice, one vote each'],
  ['mail', 'Why did you cancel?', 'Free text, sent by link after a downgrade'],
]
  .map(
    ([ic, t, d]) =>
      `        <a href="#" class="m-card" data-size="sm" style="text-decoration: none; color: inherit"><div class="m-stack" data-gap="2">${icon(I[ic as IconName], 20, tone.orange)}<strong>${t}</strong><span class="m-muted" style="font-size: var(--m-font-size-sm)">${d}</span></div></a>`,
  )
  .join('\n')}
      </div>`,
);

// ---------------------------------------------------------------- pricing

const tier = (range: string, price: string) =>
  `<tr><td>${range}</td><td data-numeric style="${num}">${price}</td></tr>`;
const pricing = desktop(
  'Pricing',
  windowFrame(
    'pricing.txt',
    `      <div class="m-stack" data-gap="8" style="padding: var(--m-space-8) var(--m-space-8) var(--m-space-12)">
        <div class="m-stack" data-gap="4" style="max-inline-size: 40rem">
          <h1 style="font-size: var(--m-font-size-4xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: 1.05; margin: 0">Nine in ten shows pay <span style="background: var(--m-color-success-bg); color: var(--m-color-success-fg); padding-inline: var(--m-space-2); border-radius: var(--m-radius-sm)">nothing at all.</span></h1>
          <p style="margin: 0; font-size: var(--m-font-size-lg); color: var(--m-color-fg-muted)">Every tool has a free allowance that resets each month. Add a card only when you outgrow it, and set a cap so a viral week never surprises you.</p>
          <div class="m-cluster" data-gap="3"><button type="button" class="m-button" data-variant="primary" data-size="lg">Start free</button><span class="m-muted">No card needed</span></div>
        </div>
        <div class="m-stack" data-gap="2">
          <h2 style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); margin: 0; ${hair()}; padding-block-end: var(--m-space-2)">Two ways to use it</h2>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 18rem; align-items: stretch">
          <article class="m-card" data-size="lg">
            <div class="m-stack" data-gap="4" style="block-size: 100%">
              <span class="m-cluster" data-gap="2" style="${meta}; color: var(--m-color-fg-muted)"><span class="m-avatar" data-size="sm" style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">1</span> Where everyone starts</span>
              <div class="m-stack" data-gap="1"><h3 style="${h2}">Hobby</h3><p class="m-muted" style="margin: 0">Not a trial. Most shows never leave it.</p></div>
              <div><span style="${big}">$0</span> <span class="m-muted">a month</span></div>
              <ul class="m-stack" data-gap="2" style="list-style: none; margin: 0; padding: 0">
${[
  'Every tool, with a monthly allowance',
  'Unlimited teammates',
  'One workspace, a year of history',
  'Help from the forum',
]
  .map(
    (l) =>
      `                <li class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${icon(I.check, 16, 'color: var(--m-color-success-solid); flex: none')} ${l}</li>`,
  )
  .join('\n')}
              </ul>
              <button type="button" class="m-button" data-variant="primary" data-size="lg" style="margin-block-start: auto; justify-content: center">Start free</button>
            </div>
          </article>
          <article class="m-card" data-variant="sunken" data-size="lg" style="border-style: dashed; border-width: 2px">
            <div class="m-stack" data-gap="4" style="block-size: 100%">
              <span class="m-cluster" data-gap="2" style="${meta}; color: var(--m-color-fg-muted)"><span class="m-avatar" data-size="sm" style="background: var(--m-color-bg-surface); color: var(--m-color-fg-default); border: var(--m-border-width-thin) solid var(--m-color-border-strong)">2</span> Once you're busy</span>
              <div class="m-stack" data-gap="1"><h3 style="${h2}">Metered</h3><p class="m-muted" style="margin: 0">The same <a href="#" style="color: var(--m-color-accent-text); font-weight: var(--m-font-weight-semibold)">free allowance</a>, then a small price per use.</p></div>
              <div><span style="${big}">From $0</span> <span class="m-muted">, billed on use</span></div>
              <ul class="m-stack" data-gap="2" style="list-style: none; margin: 0; padding: 0">
${[
  '<strong>Ten workspaces</strong>, up from one',
  '<strong>Three years</strong> of history',
  '<strong>Email help</strong> within a day',
  'A spend cap on every tool',
]
  .map(
    (l) =>
      `                <li class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${icon(I.check, 16, 'color: var(--m-color-success-solid); flex: none')} <span>${l}</span></li>`,
  )
  .join('\n')}
              </ul>
              <button type="button" class="m-button" data-size="lg" style="margin-block-start: auto; justify-content: center">Set a spend cap</button>
            </div>
          </article>
        </div>
        <div class="m-stack" data-gap="3">
          <h2 style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); margin: 0; ${hair()}; padding-block-end: var(--m-space-2)">What each tool costs</h2>
          <div class="m-tabs" data-variant="pill">
            <div class="m-tab-list" role="tablist" aria-label="Tool">
              <button type="button" class="m-tab" role="tab" aria-selected="true">Charts</button>
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Session tapes</button>
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Switches</button>
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Polls</button>
            </div>
          </div>
          <div class="m-split" style="--m-layout-split-side: 18rem; --m-layout-split-gap: var(--m-space-6); align-items: flex-start">
            <div class="m-stack" data-gap="2">
              <span class="m-cluster" data-gap="2">${icon(I.chart, 24, tone.blue)} <strong style="font-size: var(--m-font-size-lg)">Charts</strong></span>
              <p class="m-muted" style="margin: 0">Priced per event you send. The first 2 million each month are on us.</p>
              <div class="m-usage" data-level="ok" style="--m-usage-value: 42%">
                <div class="m-usage-header"><span class="m-usage-label">A typical show</span><span class="m-usage-amount">840k events</span></div>
                <div class="m-usage-bar"></div>
                <div class="m-usage-footer">Comfortably free</div>
              </div>
            </div>
            <div class="m-table-wrap">
              <table class="m-table">
                <thead><tr><th>Events a month</th><th data-numeric>Price per event</th></tr></thead>
                <tbody>
                  ${tier('First 2 million', '<span class="m-badge" data-tone="success">Free</span>')}
                  ${tier('2–10 million', '$0.000042')}
                  ${tier('10–50 million', '$0.000027')}
                  ${tier('50–200 million', '$0.000016')}
                  ${tier('Beyond 200 million', '$0.000009')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="m-stack" data-gap="3">
          <h2 style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); margin: 0">Questions people ask</h2>
          <div class="m-accordion" data-variant="separated">
            <details class="m-accordion-item" open><summary>What happens when I hit the free allowance?</summary><div class="m-accordion-content">Collecting pauses until next month, unless you've added a card. Nothing you've already sent is lost.</div></details>
            <details class="m-accordion-item"><summary>Can one noisy tool run up a bill?</summary><div class="m-accordion-content">Not if you set a cap. Each tool has its own, and we email you at 80%.</div></details>
            <details class="m-accordion-item"><summary>Do you discount for nonprofits and schools?</summary><div class="m-accordion-content">Yes. Write to us from your organisation's address and we'll sort it out.</div></details>
          </div>
        </div>
      </div>`,
  ),
);

// ---------------------------------------------------------------- errors

const errorPage = (
  code: string,
  ic: IconName,
  title: string,
  line: string,
  actions: string,
) => `<section class="m-card" data-size="lg" style="text-align: center" aria-label="${code} page">
          <div class="m-stack" data-gap="3" data-align="center">
            <span style="display: grid; place-items: center; inline-size: 3.5rem; block-size: 3.5rem; border-radius: var(--m-radius-lg); background: var(--m-color-bg-sunken); color: var(--m-color-fg-muted)">${icon(I[ic], 28)}</span>
            <code style="font-family: var(--m-font-family-mono); font-size: var(--m-font-size-sm); color: var(--m-color-fg-subtle)">${code}</code>
            <h2 style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold); margin: 0">${title}</h2>
            <p class="m-muted" style="margin: 0">${line}</p>
            <div class="m-cluster" data-gap="2" data-justify="center">${actions}</div>
          </div>
        </section>`;

const errors = shell(
  'Polls',
  [
    ['poll', 'New poll', tone.orange],
    ['board', 'Weekly pulse', tone.amber],
  ],
  `${titleRow(
    'poll',
    tone.orange,
    'New poll',
    `            <button type="button" class="m-button">Cancel</button>
            <button type="button" class="m-button" data-variant="primary" aria-busy="true">Saving</button>`,
  )}
      <div class="m-stack" data-gap="6" style="max-inline-size: 48rem">
        <div class="m-alert" data-tone="danger" role="alert">
          <span class="m-alert-icon">${icon(I.alert, 18)}</span>
          <div class="m-alert-content">
            <p class="m-alert-title">2 things need fixing before this poll can go live</p>
            <p class="m-alert-body">Nothing was published. The draft is saved.</p>
          </div>
        </div>
        <form class="m-card" data-size="sm" novalidate>
          <div class="m-stack" data-gap="4">
            <div class="m-field"><label class="m-field-label" for="q">Question</label>
              <input class="m-input" id="q" aria-invalid="true" aria-describedby="q-err" placeholder="What would you like to ask?">
              <span class="m-field-error" id="q-err">Write a question. Polls without one can't be shown.</span></div>
            <div class="m-field"><label class="m-field-label" for="who">Show it to</label>
              <select class="m-select" id="who" aria-invalid="true" aria-describedby="who-err"><option>Pick a group</option></select>
              <span class="m-field-error" id="who-err">The group "Night owls" was deleted. Pick another one.</span></div>
            <div class="m-field"><label class="m-field-label" for="end">Close after</label>
              <input class="m-input" id="end" value="500 replies"><span class="m-field-hint">Leave empty to keep it open.</span></div>
          </div>
        </form>
        <div class="m-alert" data-tone="warning" role="status">
          <span class="m-alert-icon">${icon(I.warn, 18)}</span>
          <div class="m-alert-content"><p class="m-alert-body">Polls are paused on Android while version 4.2 rolls out. They'll resume on their own.</p></div>
        </div>
        <div class="m-toast-region" data-static aria-live="polite">
          <div class="m-toast" data-tone="danger" role="alert">
            <div class="m-toast-content"><p class="m-toast-title">Couldn't refresh "Weekly pulse"</p><p class="m-toast-body">The query ran out of time. Your charts show the last good results.</p>
              <div class="m-toast-actions"><button type="button" class="m-button" data-size="sm">${icon(I.refresh, 14)} Try again</button></div></div>
            <button type="button" class="m-toast-close" aria-label="Dismiss">${icon(I.x, 14)}</button>
          </div>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 14rem">
        ${errorPage('404', 'compass', 'This page wandered off', 'It may have been renamed, or it never existed.', `<button type="button" class="m-button" data-variant="primary">${icon(I.home, 16)} Back to overview</button>`)}
        ${errorPage('500', 'server', 'Something broke on our side', "Nothing was changed. We've been told and we're on it.", `<button type="button" class="m-button" data-variant="primary">${icon(I.refresh, 16)} Try again</button><button type="button" class="m-button">Status page</button>`)}
        ${errorPage('403', 'lock', "You can't open this board", 'It belongs to a team you are not in yet.', `<button type="button" class="m-button" data-variant="primary">Ask for access</button>`)}
        </div>
      </div>`,
);

export const confettiRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Board',
    description:
      'The app shell (warm navigation column with coloured tool icons, a strip of open tabs) and a board of chart panels: a two-series line chart with dashed gridlines, a big number, a step chart with hatched drop-off, a small table and a return-rate grid.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'People list with a profile panel',
    description:
      'A scene title with ledge buttons, underline tabs, a search row with the count, a framed table with bold uppercase headers and lettermarks, pagination, and the selected person in a side panel with traits as code keys.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Set-up window',
    description:
      'The public site’s desktop: a taskbar, a column of labelled icons, and set-up opening as a window with a step bar, a highlighted bold heading, tool tiles you tick (the chosen ones framed in amber), and a large amber Continue.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Workspace settings',
    description:
      'A plain settings nav beside sections divided by hairlines: a rename row, switches that apply at once, radios and a select, a copyable key, and a danger zone with an outlined orange-red button.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'No polls yet',
    description:
      'A dashed panel with a ledged icon tile, a bold heading, one cheeky sentence, a primary and a secondary ledge button, then templates to start from.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing window',
    description:
      'The desktop again: a huge bold claim with a highlighted phrase, a white free card beside a dashed metered card, a per-tool price table with a usage meter, and an FAQ.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'A danger banner above the form, fields with their own messages, a warning banner, a toast with a retry, and the 404, 500 and 403 pages as panels.',
    html: errors,
  },
];
