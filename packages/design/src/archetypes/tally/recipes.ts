import { lucidePaths as L } from '../lucide';
import type { ArchetypeRecipe } from '../types';

/*
 * Tally's nine layout recipes (the seven required shapes, then reading and sign-in): framework-free HTML using
 * only @mariachi/design classes and tokens (no colour literals), with invented data: "Hopline", a link tool,
 * used by the workspace "Orbit Coffee" (short domain orbt.co). They follow the language's real screen
 * patterns: a light grey frame holding a 64px icon rail and a pale area panel, one white content panel with
 * 12px corners, a 64px page header on a hairline, 40px controls with 8px corners, link rows as 12px hairline
 * cards, the black primary with a key hint, white menus and tooltips, and stat tabs over an area chart.
 * Icons are Lucide, outlined, 16px at a 1.5px stroke.
 */

const icon = (paths: string, size = 16, label?: string) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${size > 20 ? 1.5 : 1.75}" stroke-linecap="round" stroke-linejoin="round"${label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"'} style="flex: none">${paths}</svg>`;
const I: Record<string, string> = {
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  click: '<path d="M14 4.1 12 6"/><path d="m5.1 8-2.9-.8"/><path d="m6 12-1.9 2"/><path d="M7.2 2.2 8 5.1"/><path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/>',
  signpost: '<path d="M12 13v8"/><path d="M12 3v3"/><path d="M18 6a2 2 0 0 1 1.387.56l2.307 2.22a1 1 0 0 1 0 1.44l-2.307 2.22A2 2 0 0 1 18 13H6a2 2 0 0 1-1.387-.56l-2.306-2.22a1 1 0 0 1 0-1.44l2.306-2.22A2 2 0 0 1 6 6z"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  plug: '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
  webhook: '<path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2"/><path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06"/><path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/>',
  network: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
  turn: '<polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/>',
  enter: '<polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>',
  qr: '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
  archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
  table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  crosshair: '<circle cx="12" cy="12" r="10"/><path d="M22 12h-4"/><path d="M6 12H2"/><path d="M12 6V2"/><path d="M12 22v-4"/>',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
  phone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
  updown: '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
  code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  ...L,
};

const hair = '1px solid var(--m-color-border-default)';
const small = 'font-size: var(--m-font-size-sm)';
const num = 'font-variant-numeric: tabular-nums';

const kbd = (k: string) => `<kbd class="m-kbd">${k}</kbd>`;
const btn = (label: string, opts: { variant?: string; ic?: string; trail?: string; size?: string; extra?: string } = {}) =>
  `<button type="button" class="m-button"${opts.variant ? ` data-variant="${opts.variant}"` : ''}${opts.size ? ` data-size="${opts.size}"` : ''}${opts.extra ?? ''}>${opts.ic ? icon(opts.ic) : ''}${label}${opts.trail ?? ''}</button>`;
const iconBtn = (paths: string, name: string, variant = 'ghost', size = 'sm') =>
  `<button type="button" class="m-button" data-variant="${variant}" data-size="${size}" data-icon-only aria-label="${name}">${icon(paths)}</button>`;
const chevron = `<span class="m-subtle" style="display: inline-flex">${icon(I['chevron-down'])}</span>`;
const avatar = (initials: string, name: string, size = 'sm') =>
  `<span class="m-avatar" data-size="${size}" role="img" aria-label="${name}" style="font-size: var(--m-font-size-xs)">${initials}</span>`;
// A creator's 16px avatar in a row: a round grey face, named for screen readers
const mini = (_initials: string, name: string) =>
  `<span class="m-avatar" role="img" aria-label="${name}" style="inline-size: 1rem; block-size: 1rem; border: 0; display: inline-grid; place-items: center">${icon(I.user, 12)}</span>`;

// The product's own mark: an invented wordmark in the display face, never the source's
const wordmark = () =>
  `<span style="font-family: var(--m-font-family-display); font-weight: var(--m-font-weight-semibold); font-size: var(--m-font-size-xl); letter-spacing: var(--m-font-tracking-tight); color: var(--m-color-fg-default)">hopline</span>`;
// A workspace's mark: a black disc with its initial
const disc = (letter: string, size = '2rem') =>
  `<span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: ${size}; block-size: ${size}; border-radius: var(--m-radius-full); background: var(--m-color-accent-default); color: var(--m-color-accent-fg); font-weight: var(--m-font-weight-semibold); font-size: var(--m-font-size-md); flex: none">${letter}</span>`;

/* ------------------------------------------------------------------ the app frame */

type NavItem = [string, string, string?];
type NavGroup = [string | null, NavItem[]];
const AREA_LINKS: NavGroup[] = [
  [null, [['link', 'Links'], ['globe', 'Domains']]],
  ['Insights', [['chart', 'Analytics'], ['click', 'Events'], ['user', 'Customers']]],
  ['Library', [['folder', 'Folders', '4'], ['tag', 'Tags'], ['signpost', 'UTM templates']]],
];
const AREA_SETTINGS: NavGroup[] = [
  ['Workspace', [['settings', 'General'], ['receipt', 'Billing'], ['globe', 'Domains'], ['users', 'People'], ['plug', 'Integrations'], ['shield', 'Security']]],
  ['Developer', [['key', 'API keys'], ['webhook', 'Webhooks']]],
  ['Account', [['bell', 'Notifications']]],
];

const railBtn = (paths: string, name: string, current: boolean) =>
  `<a class="m-button" data-variant="ghost" data-icon-only href="#" aria-label="${name}"${current ? ' aria-current="page"' : ''} style="block-size: 2.75rem; inline-size: 2.75rem${current ? '; background: var(--m-color-bg-surface)' : ''}">${icon(paths, 20)}</a>`;
// The 64px rail: the wordmark's initials, the workspace, then the product areas as 44px squares (the current one white)
const rail = (area: 'links' | 'settings') => `<div class="m-stack" data-gap="3" style="align-items: center; padding-block: var(--m-space-3)">
      <span aria-hidden="true" style="font-family: var(--m-font-family-display); font-weight: var(--m-font-weight-semibold); font-size: var(--m-font-size-xl); letter-spacing: var(--m-font-tracking-tight); padding-block: var(--m-space-2)">hl</span>
      <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Workspace: Orbit Coffee" style="block-size: 2.75rem; inline-size: 2.75rem">${disc('O', '1.75rem')}</button>
      ${railBtn(I.compass, 'Links', area === 'links')}
      ${railBtn(I.network, 'Programs', false)}
      ${railBtn(I.settings, 'Settings', area === 'settings')}
    </div>`;

const areaPanel = (area: 'links' | 'settings', current: string) => {
  const groups = area === 'links' ? AREA_LINKS : AREA_SETTINGS;
  const title =
    area === 'links'
      ? `<p style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold); padding: var(--m-space-2) var(--m-space-2) var(--m-space-3)">Short links</p>`
      : `<p class="m-cluster" data-gap="3" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold); padding: var(--m-space-2) var(--m-space-2) var(--m-space-3); flex-wrap: nowrap"><a class="m-button" data-variant="ghost" data-size="sm" data-icon-only href="#" aria-label="Back to links" style="inline-size: 1.5rem; block-size: 1.5rem; background: var(--m-color-border-default)">${icon(I['chevron-left'], 12)}</a>Settings</p>`;
  return `<nav class="m-sidebar" aria-label="${area === 'links' ? 'Short links' : 'Settings'}" style="border-radius: var(--m-radius-lg); min-block-size: 0; overflow-y: auto">
      ${title}
${groups
  .map(
    ([heading, items]) => `      <div class="m-sidebar-section">
        ${heading ? `<p class="m-sidebar-heading">${heading}</p>` : ''}
        <ul>
${items.map(([ic, l, count]) => `          <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${icon(I[ic])} ${l}${count ? ` <span class="m-sidebar-count">${count}</span>` : ''}</a></li>`).join('\n')}
        </ul>
      </div>`,
  )
  .join('\n')}
      <div class="m-stack" data-gap="2" style="margin-block-start: auto; padding: var(--m-space-2)">
        <div class="m-cluster" data-justify="between" style="${small}; font-weight: var(--m-font-weight-medium)"><span class="m-muted">Events</span><span style="${num}">18.4K of 50K</span></div>
        <progress class="m-progress" value="37" max="100" aria-label="Events used this month: 37%">37%</progress>
        <div class="m-cluster" data-justify="between" style="${small}; font-weight: var(--m-font-weight-medium)"><span class="m-muted">Links</span><span style="${num}">248 of 1,000</span></div>
        <progress class="m-progress" value="25" max="100" aria-label="Links used this month: 25%">25%</progress>
      </div>
    </nav>`;
};

// The page: a light grey frame holding the rail and the area panel, and one white panel with 12px corners.
// The sidebar is the window's height and stays put while the page scrolls, so its usage block always shows at
// the bottom. On a phone the panel comes first and the sidebar drops below it.
const shell = (area: 'links' | 'settings', current: string, head: string, body: string) => `<div class="m-split" style="--m-layout-split-side: 19rem; --m-layout-split-gap: 0; min-block-size: 100vh; flex-wrap: wrap-reverse; background: var(--m-color-border-default)">
  <div style="display: grid; grid-template-columns: 4rem 1fr; grid-template-rows: minmax(0, 1fr); position: sticky; inset-block-start: 0; align-self: flex-end; block-size: 100vh; box-sizing: border-box; padding-block: var(--m-space-2); padding-inline-end: var(--m-space-2)">
    ${rail(area)}
    ${areaPanel(area, current)}
  </div>
  <main style="margin: var(--m-space-2) var(--m-space-2) var(--m-space-2) 0; border-radius: var(--m-radius-lg); background: var(--m-color-bg-canvas)">
    ${head}
    <div class="m-container" data-size="lg" style="padding-block: var(--m-space-5) var(--m-space-10)">
${body}
    </div>
  </main>
</div>`;

// The 64px page header on a hairline: an 18px semibold title, the page's controls at the right
const header = (title: string, right = '', extra = '') =>
  `<header style="border-block-end: ${hair}">
      <div class="m-container" data-size="lg"><div class="m-cluster" data-justify="between" style="min-block-size: 4rem">
        <h1 class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-xl); line-height: 1.75rem">${title}${extra}</h1>
        <div class="m-cluster" data-gap="2">${right}</div>
      </div></div>
    </header>`;

// The toolbar of a list page: filter and display menus, a search field, and the black primary with its key
const toolbar = () => `<div class="m-cluster" data-justify="between" data-gap="2">
        <div class="m-cluster" data-gap="2">
          ${btn('Filter', { ic: I['list-filter'], trail: chevron })}
          ${btn('Display', { ic: I['sliders-horizontal'], trail: chevron })}
        </div>
        <div class="m-cluster" data-gap="2">
          <label class="m-cluster" data-gap="2" style="position: relative; flex-wrap: nowrap"><span class="m-sr-only">Search links</span><span class="m-subtle" style="position: absolute; inset-inline-start: var(--m-space-3); display: inline-flex">${icon(I.search)}</span><input class="m-input" type="search" placeholder="Search by short link or URL" style="padding-inline-start: var(--m-space-8); inline-size: 16rem"></label>
          ${btn('Create link', { variant: 'primary', trail: kbd('C') })}
        </div>
      </div>`;

/* ------------------------------------------------------------------ link rows */

// A link's favicon stand-in: a 32px ring with a soft fill and the destination's initial
const logo = (_letter: string) =>
  `<span aria-hidden="true" class="m-muted" style="display: inline-grid; place-items: center; inline-size: 2rem; block-size: 2rem; border-radius: var(--m-radius-full); border: ${hair}; background: linear-gradient(to top, var(--m-color-bg-sunken), var(--m-color-bg-surface)); flex: none">${icon(I.globe)}</span>`;
const clicks = (n: string) =>
  `<span class="m-cluster" data-gap="1" style="flex-wrap: nowrap; padding: 0.125rem var(--m-space-2); border: ${hair}; border-radius: var(--m-radius-sm); background: var(--m-color-bg-raised); ${num}; white-space: nowrap">${icon(I.click)} ${n} clicks</span>`;
type Link = [string, string, string, string, string, string, string[]?];
const LINKS: Link[] = [
  ['O', 'orbt.co/spring-menu', 'orbitcoffee.com/menu/spring', 'MR', 'Mar 3', '4,812', ['Campaign']],
  ['A', 'orbt.co/app', 'apps.orbitcoffee.com/download', 'JL', 'Feb 26', '12.9K', ['App']],
  ['N', 'orbt.co/news', 'orbitcoffee.com/journal/roasting-notes', 'MR', 'Feb 21', '967'],
  ['G', 'orbt.co/gift', 'shop.orbitcoffee.com/gift-cards', 'TS', 'Feb 14', '2,140', ['Shop']],
  ['C', 'orbt.co/careers', 'jobs.orbitcoffee.com', 'JL', 'Feb 9', '388'],
  ['R', 'orbt.co/refer', 'orbitcoffee.com/refer?ref=winter', 'TS', 'Jan 30', '1,206', ['Referral']],
  ['W', 'orbt.co/wholesale', 'orbitcoffee.com/wholesale', 'MR', 'Jan 22', '173'],
];
const tagChip = (t: string) => `<span class="m-chip" data-size="sm" style="font-size: var(--m-font-size-md)">${icon(I.tag, 12)} ${t}</span>`;
const linkRow = ([letter, short, dest, who, when, n, tags]: Link, open = false) => `<li><div class="m-row" style="border: ${hair}"${open ? ' aria-current="true"' : ''}>
            <span class="m-row-lead">${logo(letter)}</span>
            <span class="m-row-body">
              <span class="m-row-title m-cluster" data-gap="2" style="flex-wrap: nowrap"><a href="#" style="color: inherit; text-decoration: none">${short}</a>${iconBtn(I.copy, `Copy ${short}`)}${tags ? tags.map(tagChip).join('') : ''}</span>
              <span class="m-row-meta m-cluster" data-gap="2" style="flex-wrap: nowrap">${icon(I.turn, 12)}<span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">${dest}</span>${mini(who, `Created by ${who}`)}<span>${when}</span></span>
            </span>
            <span class="m-row-trail m-cluster" data-gap="2" style="flex-wrap: nowrap">${clicks(n)}${iconBtn(I['ellipsis-vertical'], `More for ${short}`, 'ghost')}</span>
          </div></li>`;

/* ------------------------------------------------------------------ dashboard: analytics */

// Daily clicks over 30 days: an area under a 2px line in the first series colour, dashed gridlines
const DAYS = [212, 268, 371, 334, 290, 241, 260, 318, 402, 455, 431, 377, 352, 298, 330, 389, 446, 512, 488, 420, 396, 438, 501, 562, 534, 470, 452, 498, 541, 507];
const chartSvg = () => {
  const W = 1000;
  const H = 260;
  const max = 600;
  const pts = DAYS.map((v, i) => [Math.round((i / (DAYS.length - 1)) * W), Math.round(H - (v / max) * H)]);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
  return `<svg viewBox="0 0 ${W} ${H + 1}" width="100%" preserveAspectRatio="none" style="display: block; block-size: 16rem; overflow: visible" role="img" aria-label="Clicks per day, Feb 10 to Mar 11: from about 200 to 500 a day, peaking at 562 on Mar 5">
            <defs><linearGradient id="tl-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: var(--m-chart-1); stop-opacity: 0.18"/><stop offset="1" style="stop-color: var(--m-chart-1); stop-opacity: 0"/></linearGradient></defs>
            ${[0, 1, 2].map((g) => `<path d="M0 ${Math.round((g * H) / 3)}H${W}" style="stroke: var(--m-color-border-default)" stroke-dasharray="4 4" vector-effect="non-scaling-stroke"/>`).join('')}
            <path d="M0 ${H}H${W}" style="stroke: var(--m-color-border-default)" vector-effect="non-scaling-stroke"/>
            <path d="${line} L${W} ${H} L0 ${H} Z" fill="url(#tl-fade)"/>
            <path d="${line}" fill="none" style="stroke: var(--m-chart-1)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
          </svg>`;
};
const statTab = (tone: string, label: string, value: string, selected: boolean, last = false) =>
  `<button type="button" role="tab" aria-selected="${selected}"${selected ? '' : ' tabindex="-1"'} class="m-stack" data-gap="1" style="position: relative; align-items: flex-start; padding: clamp(0.75rem, 2vw, 1.5rem) clamp(1rem, 3vw, 2rem); min-inline-size: 0; text-align: start; background: none; border: 0; ${last ? '' : `border-inline-end: ${hair};`} cursor: pointer; color: inherit; font: inherit">
            <span class="m-cluster m-muted" data-gap="2"><span aria-hidden="true" style="inline-size: 0.5rem; block-size: 0.5rem; border-radius: 2px; background: var(--m-chart-${tone})"></span>${label}</span>
            <span style="font-size: clamp(1.25rem, 4vw, var(--m-font-size-3xl)); font-weight: var(--m-font-weight-medium); ${num}">${value}</span>
            ${selected ? '<span aria-hidden="true" style="position: absolute; inset-inline: 0; inset-block-end: -1px; block-size: 2px; background: var(--m-color-fg-default)"></span>' : ''}
          </button>`;
type Bar = [string, string, number, string?];
const barList = (tone: string, rows: Bar[], max: number) => `<ul class="m-stack" data-gap="1" style="padding: var(--m-space-3) var(--m-space-4)">
${rows
  .map(
    ([ic, label, value, shown]) => `            <li style="position: relative; display: flex; align-items: center; justify-content: space-between; gap: var(--m-space-3); min-block-size: 2.25rem; padding-inline: var(--m-space-3)">
              <span aria-hidden="true" style="position: absolute; inset-block: 0; inset-inline-start: 0; inline-size: ${Math.round((value / max) * 100)}%; border-radius: var(--m-radius-sm); background: var(--m-chart-${tone}); opacity: 0.16"></span>
              <span class="m-cluster" data-gap="3" style="position: relative; flex-wrap: nowrap">${icon(I[ic as keyof typeof I])}<span>${label}</span></span>
              <span class="m-muted" style="position: relative; ${num}">${shown ?? value.toLocaleString('en-US')}</span>
            </li>`,
  )
  .join('\n')}
          </ul>`;
const subTabs = (labels: string[], name: string) =>
  `<div class="m-tabs"><div class="m-tab-list" role="tablist" aria-label="${name}" style="border: 0">${labels.map((l, i) => `<button type="button" class="m-tab" role="tab" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''}>${l}</button>`).join('')}</div></div>`;
const facet = (title: string, tabs: string[], tone: string, rows: Bar[], max: number) => `<section class="m-card" data-variant="outline" aria-label="${title}" style="padding: 0; overflow: hidden">
          <header class="m-cluster" data-justify="between" style="padding-inline: var(--m-space-4); border-block-end: ${hair}">
            ${subTabs(tabs, title)}
            <span class="m-cluster m-subtle" data-gap="1" style="${small}; text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide)">${icon(I.click, 12)} Clicks</span>
          </header>
          ${barList(tone, rows, max)}
          <div class="m-cluster" data-justify="center" style="padding-block: var(--m-space-3) var(--m-space-4)">${btn('View all', { size: 'sm' })}</div>
        </section>`;

const dashboard = shell(
  'links',
  'Analytics',
  header('Analytics'),
  `      <div class="m-stack" data-gap="5">
      <div class="m-cluster" data-justify="between" data-gap="2">
        <div class="m-cluster" data-gap="2">
          ${btn('Filter', { ic: I['list-filter'], trail: chevron })}
          ${btn('Last 30 days', { ic: I.calendar, trail: chevron, extra: ' style="min-inline-size: 15rem; justify-content: space-between"' })}
        </div>
        <div class="m-cluster" data-gap="2">
          ${btn('View events', { ic: I.table })}
          ${iconBtn(I['ellipsis-vertical'], 'More options', 'secondary', 'md')}
        </div>
      </div>

      <section class="m-card" data-variant="outline" aria-label="Clicks, sign-ups and sales" style="padding: 0; overflow: hidden">
        <div role="tablist" aria-label="Event" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-block-end: ${hair}">
          ${statTab('1', 'Clicks', '12,847', true)}
          ${statTab('2', 'Sign-ups', '1,906', false)}
          ${statTab('3', 'Sales', '$3,821', false, true)}
        </div>
        <div style="padding: var(--m-space-8) var(--m-space-8) var(--m-space-6)">
          <div style="display: grid; grid-template-columns: auto 1fr; gap: var(--m-space-3)">
            <div class="m-stack m-subtle" style="justify-content: space-between; ${small}; ${num}; text-align: end; padding-block-end: var(--m-space-6)"><span>600</span><span>400</span><span>200</span><span>0</span></div>
            <div class="m-stack" data-gap="2">
              ${chartSvg()}
              <div class="m-cluster m-subtle" data-justify="between" style="${small}"><span>Feb 10</span><span style="color: var(--m-color-fg-default)">Mar 11</span></div>
            </div>
          </div>
        </div>
      </section>

      <div class="m-grid" style="--m-layout-grid-min: 26rem">
        ${facet('Top links', ['Short links', 'Destinations'], '4', [['link', 'orbt.co/app', 4120], ['link', 'orbt.co/spring-menu', 2760], ['link', 'orbt.co/gift', 1530], ['link', 'orbt.co/refer', 1180], ['link', 'orbt.co/news', 702], ['link', 'orbt.co/careers', 311]], 4120)}
        ${facet('Locations', ['Countries', 'Cities', 'Regions'], '1', [['map-pin', 'United States', 5212], ['map-pin', 'Canada', 2104], ['map-pin', 'Germany', 1388], ['map-pin', 'Japan', 1022], ['map-pin', 'Brazil', 640], ['map-pin', 'Australia', 498]], 5212)}
        ${facet('Devices', ['Devices', 'Browsers', 'OS'], '5', [['phone', 'Mobile', 7930], ['monitor', 'Desktop', 4402], ['monitor', 'Tablet', 515]], 7930)}
        ${facet('Referrers', ['Referrers', 'UTM parameters'], '2', [['globe', 'Direct', 4870], ['globe', 'Newsletter', 3215], ['globe', 'Social', 2290], ['globe', 'Search', 1610], ['globe', 'Partners', 862]], 4870)}
      </div>
      </div>`,
);

/* ------------------------------------------------------------------ list and detail: links, and the edit dialog */

const help = `<span class="m-subtle" style="display: inline-flex">${icon(I['circle-help'])}</span>`;
const field = (label: string, control: string, hint = '', helpIcon = true) =>
  `<div class="m-field"><label class="m-field-label m-cluster" data-gap="1">${label}${helpIcon ? help : ''}</label>${control}${hint ? `<p class="m-field-hint">${hint}</p>` : ''}</div>`;
// A text prefix joined to its input (the domain before a slug)
const prefixed = (prefix: string, input: string) =>
  `<div style="display: flex"><span class="m-cluster m-subtle" style="padding-inline: var(--m-space-3); border: 1px solid var(--m-color-border-strong); border-inline-end: 0; border-radius: var(--m-radius-sm) 0 0 var(--m-radius-sm); background: var(--m-color-bg-sunken); white-space: nowrap">${prefix}</span>${input}</div>`;

const linkDialog = `<div class="m-dialog" data-static data-size="lg" role="dialog" aria-modal="false" aria-labelledby="tl-edit-title" style="padding: 0; overflow: hidden; margin-inline: auto">
          <header class="m-dialog-header" style="align-items: center; padding: var(--m-space-3) var(--m-space-6); border-block-end: ${hair}">
            <div><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${icon(I.folder)}<span class="m-muted">Links</span><span class="m-subtle" style="display: inline-flex">${icon(I['chevron-right'])}</span><h2 class="m-dialog-title" id="tl-edit-title" style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-semibold)">orbt.co/spring-menu</h2></span></div>
            <span class="m-cluster" data-gap="2">${btn('Save as draft', { size: 'sm' })}${iconBtn(I.x, 'Close')}</span>
          </header>
          <div class="m-dialog-body" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: var(--m-space-6); padding: var(--m-space-4) var(--m-space-6) var(--m-space-6)">
            <div class="m-stack" data-gap="6" style="grid-column: span 2">
              ${field('Destination URL', '<input class="m-input" type="url" aria-label="Destination URL" value="https://orbitcoffee.com/menu/spring">')}
              <div class="m-field"><div class="m-cluster" data-justify="between"><label class="m-field-label m-cluster" data-gap="1" for="tl-key">Short link${help}</label><span class="m-cluster m-subtle" data-gap="1">${iconBtn(I.shuffle, 'Random key')}${iconBtn(I.sparkles, 'Suggest a key')}</span></div>
                <div style="display: flex"><select class="m-select" aria-label="Domain" style="inline-size: 9rem; border-start-end-radius: 0; border-end-end-radius: 0"><option>orbt.co</option><option>go.orbitcoffee.com</option></select><input class="m-input" id="tl-key" value="spring-menu" style="border-start-start-radius: 0; border-end-start-radius: 0; margin-inline-start: -1px"></div></div>
              ${field('Tags', `<div class="m-cluster" data-gap="2" style="min-block-size: 2.375rem; padding: var(--m-space-1) var(--m-space-2); border: 1px solid var(--m-color-border-strong); border-radius: var(--m-radius-sm)">${tagChip('Campaign')}${tagChip('Spring')}<span class="m-subtle">Add tags…</span></div>`)}
              ${field('Comments', '<textarea class="m-input" rows="3" aria-label="Comments" placeholder="Add notes for your team"></textarea>')}
            </div>
            <aside class="m-stack" data-gap="6" aria-label="Preview" style="padding: var(--m-space-3) var(--m-space-4); border: ${hair}; border-radius: var(--m-radius-lg); background: var(--m-color-bg-raised)">
              <div class="m-stack" data-gap="3"><div class="m-cluster" data-justify="between"><span style="font-weight: var(--m-font-weight-medium)">QR code</span>${iconBtn(I.pencil, 'Edit QR code')}</div>
                <div style="display: grid; place-items: center; block-size: 8rem; border: ${hair}; border-radius: var(--m-radius-md); background: var(--m-color-bg-surface)">${icon(I.qr, 64, 'QR code for orbt.co/spring-menu')}</div></div>
              <div class="m-stack" data-gap="3"><div class="m-cluster" data-justify="between"><span style="font-weight: var(--m-font-weight-medium)">Link preview</span>${iconBtn(I.pencil, 'Edit preview')}</div>
                <div class="m-subtle" style="aspect-ratio: 1200 / 630; border: ${hair}; border-radius: var(--m-radius-md); background: var(--m-color-bg-sunken); display: grid; place-items: center">${icon(I.globe, 24)}</div>
                <p style="font-weight: var(--m-font-weight-semibold)">Spring menu · Orbit Coffee</p>
                <p class="m-subtle">Five new seasonal drinks, roasted in small batches and back until the end of May.</p></div>
            </aside>
          </div>
          <footer class="m-dialog-footer m-cluster" data-justify="between" style="padding: var(--m-space-4); border-block-start: 1px solid var(--m-color-border-muted); background: var(--m-color-bg-raised)">
            <span class="m-cluster" data-gap="2">${btn('UTM', { ic: I.signpost, size: 'sm' })}${btn('Expiration', { ic: I.clock, size: 'sm' })}${btn('Targeting', { ic: I.crosshair, size: 'sm' })}${btn('Password', { ic: I.lock, size: 'sm' })}${iconBtn(I['ellipsis-vertical'], 'More options', 'secondary')}</span>
            ${btn('Save changes', { variant: 'primary', trail: `<kbd class="m-kbd" aria-label="Enter">${icon(I.enter, 12)}</kbd>` })}
          </footer>
        </div>`;

const menuItem = (ic: string, label: string, key: string, danger = false) =>
  `<button type="button" class="m-menu-item" role="menuitem"${danger ? ' data-tone="danger"' : ''}>${icon(ic)} ${label} <span class="m-menu-shortcut">${kbd(key)}</span></button>`;
const linkMenu = `<div class="m-popover" data-static style="inline-size: 15rem">
            <div class="m-menu" role="menu" aria-label="Link actions">
              ${menuItem(I.pencil, 'Edit', 'E')}
              ${menuItem(I.qr, 'QR code', 'Q')}
              ${menuItem(I.copy, 'Copy link ID', 'I')}
              <div class="m-menu-separator" role="separator"></div>
              ${menuItem(I.folder, 'Move', 'M')}
              ${menuItem(I.archive, 'Archive', 'A')}
              ${menuItem(I['trash-2'], 'Delete', 'X', true)}
            </div>
          </div>`;

const listDetail = shell(
  'links',
  'Links',
  header('Links', '', `<button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Switch folder">${icon(I.updown)}</button>`),
  `      <div class="m-stack" data-gap="4">
      ${toolbar()}
      <ul class="m-stack" data-gap="3" aria-label="Links">
${LINKS.map((l) => `        ${linkRow(l)}`).join('\n')}
      </ul>
      <div class="m-cluster" data-justify="between">
        <span class="m-muted">Viewing <span style="${num}; color: var(--m-color-fg-default); font-weight: var(--m-font-weight-medium)">1–7</span> of <span style="${num}">248</span> links</span>
        <span class="m-cluster" data-gap="2">${btn('Previous', { size: 'sm', extra: ' disabled' })}${btn('Next', { size: 'sm' })}</span>
      </div>
      <section class="m-stack" data-gap="4" aria-label="Open link" style="padding-block-start: var(--m-space-6)">
        <div style="display: flex; justify-content: flex-end">${linkMenu}</div>
        ${linkDialog}
      </section>
      </div>`,
);

/* ------------------------------------------------------------------ settings */

// A settings card: a 16px title and a line, the control, then a grey footer with a hint and the save button
const formCard = (title: string, desc: string, control: string, hint: string, action = btn('Save changes', { variant: 'primary', size: 'sm' }), danger = false) => `<form class="m-card" data-variant="outline" style="padding: 0; overflow: hidden${danger ? '; border-color: var(--m-color-danger-solid)' : ''}" aria-label="${title}">
          <div class="m-stack" data-gap="6" style="padding: var(--m-space-6)">
            <div class="m-stack" data-gap="1"><h2 style="font-size: var(--m-font-size-lg)">${title}</h2><p class="m-subtle">${desc}</p></div>
            ${control}
          </div>
          <div class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-5); border-block-start: 1px solid ${danger ? 'var(--m-color-danger-solid)' : 'var(--m-color-border-default)'}; background: ${danger ? 'var(--m-color-danger-bg)' : 'var(--m-color-bg-raised)'}">
            <p class="m-subtle">${hint}</p>
            ${action}
          </div>
        </form>`;

const settings = shell(
  'settings',
  'General',
  header('General'),
  `      <div class="m-stack" data-gap="5">
        ${formCard('Workspace name', 'This is the name of your workspace on Hopline.', '<input class="m-input" aria-label="Workspace name" value="Orbit Coffee" maxlength="32" style="max-inline-size: 28rem">', 'Max 32 characters.')}
        ${formCard('Workspace slug', 'This is your workspace’s unique slug on Hopline.', `<div style="max-inline-size: 28rem">${prefixed('app.hopline.io/', '<input class="m-input" aria-label="Workspace slug" value="orbit-coffee" style="border-start-start-radius: 0; border-end-start-radius: 0">')}</div>`, 'Only lowercase letters, numbers and dashes. Max 48 characters.')}
        ${formCard('Workspace logo', 'This is your workspace’s logo on Hopline.', `<div class="m-cluster" data-gap="4">${disc('O', '5rem')}<label class="m-dropzone" style="min-block-size: 5rem; flex: 1; max-inline-size: 22rem"><input type="file" accept="image/*" class="m-sr-only"><span class="m-cluster" data-gap="2">${icon(I.upload)} Drop an image or click to upload</span></label></div>`, 'Square image recommended. Accepted file types: .png, .jpg. Max file size: 2MB.')}
        ${formCard('Workspace ID', 'Your workspace’s unique ID on Hopline.', `<div class="m-cluster" data-gap="2" style="max-inline-size: 28rem; flex-wrap: nowrap"><input class="m-input" aria-label="Workspace ID" readonly value="ws_7KQ2ZP4D9MB1XRT" style="font-family: var(--m-font-family-mono)">${iconBtn(I.copy, 'Copy workspace ID', 'secondary', 'md')}</div>`, 'Used to identify your workspace when calling the API.', '')}
        ${formCard('Delete workspace', 'Permanently delete your workspace, custom domains and all their links with their stats. This can’t be undone.', '', 'Everything in Orbit Coffee will be gone within a day.', btn('Delete workspace', { variant: 'danger', size: 'sm' }), true)}
      </div>`,
);

/* ------------------------------------------------------------------ empty state */

const ghostRow = (w: string) => `<li class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding: var(--m-space-3) var(--m-space-4); border: ${hair}; border-radius: var(--m-radius-lg); background: var(--m-color-bg-surface)">
            <span class="m-subtle" style="display: inline-flex">${icon(I.link)}</span><span class="m-skeleton" style="block-size: 0.625rem; inline-size: ${w}"></span>
            <span class="m-cluster m-subtle" data-gap="1" style="margin-inline-start: auto">${icon(I.click, 12)}<span class="m-skeleton" style="block-size: 0.625rem; inline-size: 2rem"></span></span>
          </li>`;
const emptyState = shell(
  'links',
  'Links',
  header('Links'),
  `      <div class="m-stack" data-gap="4">
      ${toolbar()}
      <section class="m-stack" data-gap="6" style="align-items: center; padding-block: var(--m-space-16) var(--m-space-12); text-align: center" aria-labelledby="tl-empty-title">
        <ul class="m-stack" data-gap="2" aria-hidden="true" style="inline-size: min(100%, 22rem); mask-image: linear-gradient(to bottom, black 40%, transparent)">
          ${ghostRow('6rem')}
          ${ghostRow('9rem')}
          ${ghostRow('7rem')}
        </ul>
        <div class="m-stack" data-gap="2" style="align-items: center">
          <h2 id="tl-empty-title" style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium)">No links yet</h2>
          <p class="m-subtle" style="max-inline-size: 24rem; text-wrap: balance">Start making short links for your campaigns, referral programs and more.</p>
        </div>
        <div class="m-cluster" data-gap="2">${btn('Create link', { variant: 'primary', trail: kbd('C') })}${btn('Import links', { ic: I.upload })}</div>
        <a href="#" class="m-subtle" style="text-decoration: underline; text-underline-offset: 2px">Read how short links work</a>
      </section>
      </div>`,
);

/* ------------------------------------------------------------------ errors */

// A whole-page state: the 64px tile with 16px corners, a 16px line, one sentence, one button
const pageState = (ic: string, code: string, title: string, text: string, actions: string) => `<section class="m-card" data-variant="outline" aria-label="Error ${code}" style="padding: var(--m-space-12) var(--m-space-6)">
          <div class="m-stack" data-gap="4" style="align-items: center; text-align: center">
            <span class="m-tile" data-size="lg" data-tone="neutral" aria-hidden="true" style="border: ${hair}">${icon(ic, 24)}</span>
            <div class="m-stack" data-gap="1" style="align-items: center"><h3 style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium)">${title}</h3><p class="m-subtle" style="max-inline-size: 24rem">${text}</p></div>
            <div class="m-cluster" data-gap="2">${actions}</div>
            <p class="m-subtle" style="${small}">Error ${code}</p>
          </div>
        </section>`;
const errors = shell(
  'links',
  'Domains',
  header('Domains', btn('Add domain', { variant: 'primary', trail: kbd('A') })),
  `      <div class="m-stack" data-gap="5">
        <div class="m-alert" data-tone="danger" role="alert">
          <span class="m-alert-icon">${icon(I['circle-alert'])}</span>
          <div class="m-alert-content"><p class="m-alert-title">go.orbitcoffee.com isn’t pointing at Hopline yet</p><p class="m-alert-body">Links on it won’t redirect until the DNS record below is added. Nothing else was changed.</p><p class="m-subtle" style="${small}">Last checked 2 minutes ago</p></div>
        </div>
        <form class="m-card" data-variant="outline" style="padding: 0; overflow: hidden" aria-label="Add a domain" novalidate>
          <div class="m-stack" data-gap="6" style="padding: var(--m-space-6)">
            <div class="m-stack" data-gap="1"><h2 style="font-size: var(--m-font-size-lg)">Add a domain</h2><p class="m-subtle">Use a domain you own to brand your short links.</p></div>
            <div class="m-field" style="max-inline-size: 28rem">
              <label class="m-field-label" for="tl-domain">Domain</label>
              <div style="position: relative"><input class="m-input" id="tl-domain" value="orbit coffee.com" aria-invalid="true" aria-describedby="tl-domain-error" style="padding-inline-end: var(--m-space-10)"><span style="position: absolute; inset-block: 0; inset-inline-end: var(--m-space-3); display: flex; align-items: center; color: var(--m-color-danger-solid)">${icon(I['circle-alert'], 18)}</span></div>
              <p class="m-field-error" id="tl-domain-error">A domain can’t contain spaces. Try orbitcoffee.com.</p>
            </div>
          </div>
          <div class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-5); border-block-start: ${hair}; background: var(--m-color-bg-raised)">
            <p class="m-subtle">You’ll add one DNS record after this.</p>
            ${btn('Add domain', { variant: 'primary', size: 'sm' })}
          </div>
        </form>
        <div class="m-toast-region" data-static data-position="bottom" aria-live="polite" style="position: static; align-items: center">
          <div class="m-toast" data-tone="danger" role="alert">
            <span style="color: var(--m-color-danger-solid); display: inline-flex">${icon(I['circle-alert'])}</span>
            <div class="m-toast-content"><p class="m-toast-title">Couldn’t verify go.orbitcoffee.com</p><p class="m-toast-body">We’ll check again in a few minutes.</p></div>
            <div class="m-toast-actions">${btn('Retry', { size: 'sm' })}</div>
          </div>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 18rem">
          ${pageState(I.link, '404', 'Link not found', 'This link doesn’t exist, or it was moved to another workspace.', btn('Go to links', { size: 'sm' }))}
          ${pageState(I['triangle-alert'], '500', 'Something went wrong', 'We couldn’t load this page. Nothing was changed.', btn('Try again', { variant: 'primary', size: 'sm' }))}
          ${pageState(I.lock, '403', 'You don’t have access', 'Ask an owner of Orbit Coffee to add you to this folder.', btn('Request access', { size: 'sm' }))}
        </div>
      </div>`,
);

/* ------------------------------------------------------------------ the doors: sign-in (split) and onboarding (centred) */

// The sign-in door: a split page. The form sits open on white over a faint 64px grid, no card,
// the wordmark above it and a 12px note at the foot; a pale panel at the right holds one card. On a phone the
// form fills the window and the panel follows it.
const splitDoor = (form: string, note: string, aside: string) => `<div style="display: flex; flex-wrap: wrap; min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  <main class="m-stack" data-gap="6" style="flex: 1 1 24rem; min-block-size: 100vh; align-items: center; padding: var(--m-space-6) var(--m-space-4); background-image: linear-gradient(var(--m-color-border-muted) 1px, transparent 1px), linear-gradient(90deg, var(--m-color-border-muted) 1px, transparent 1px); background-size: 4rem 4rem">
    ${wordmark()}
    <div class="m-stack" data-gap="5" style="inline-size: min(100%, 23.5rem); margin-block: auto">
${form}
    </div>
    <p class="m-subtle" style="${small}; text-align: center">${note}</p>
  </main>
  <aside class="m-stack" data-gap="10" style="flex: 1 1 24rem; justify-content: center; padding: var(--m-space-12) var(--m-space-10); background: var(--m-color-bg-raised); border-inline-start: ${hair}">
${aside}
  </aside>
</div>`;
const rule = `<div class="m-cluster" data-gap="3" style="flex-wrap: nowrap; ${small}"><span style="flex: 1; border-block-start: ${hair}"></span><span class="m-subtle" style="text-transform: uppercase">or</span><span style="flex: 1; border-block-start: ${hair}"></span></div>`;
const wide = ' style="inline-size: 100%"';

// Onboarding is not the split door: one centred step on white. The wordmark at the top, a 60px grid that fades out
// under it, a 20px semibold title over a 16px line, the form in a 430px column with a full-width primary, and
// who is signed in at the bottom left (the help button at the right).
const onboarding = `<div style="position: relative; isolation: isolate; display: flex; flex-direction: column; min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  <div aria-hidden="true" style="position: absolute; z-index: -1; inset: 0; background-image: linear-gradient(transparent calc(100% - 1px), var(--m-color-border-default) 0), linear-gradient(90deg, transparent calc(100% - 1px), var(--m-color-border-default) 0); background-size: 3.75rem 3.75rem; background-position: center top; mask-image: linear-gradient(black, transparent 20rem); -webkit-mask-image: linear-gradient(black, transparent 20rem)"></div>
  <header style="display: flex; justify-content: center; padding-block: var(--m-space-8) 0">${wordmark()}</header>
  <main style="flex: 1; display: flex; flex-direction: column; justify-content: center; padding: var(--m-space-8) var(--m-space-5) var(--m-space-16)">
    <div class="m-stack" data-gap="8" style="inline-size: min(100%, 26.875rem); margin-inline: auto">
    <div class="m-stack" data-gap="2" style="align-items: center; text-align: center">
      <h1 style="font-size: 1.25rem; font-weight: var(--m-font-weight-semibold); line-height: 1.75rem">Create your workspace</h1>
      <p class="m-subtle" style="font-size: var(--m-font-size-lg); text-wrap: balance">A shared home for your team’s links, domains and analytics. <a href="#" style="color: inherit; font-weight: var(--m-font-weight-medium); text-decoration: underline dotted; text-underline-offset: 2px">What’s a workspace?</a></p>
    </div>
    <form class="m-stack" data-gap="6" aria-label="Create your workspace">
      <div class="m-field"><label class="m-field-label" for="tl-ws-name">Workspace name</label><input class="m-input" id="tl-ws-name" placeholder="Orbit Coffee"><p class="m-field-hint" style="${small}">Your company or product’s name.</p></div>
      <div class="m-field"><label class="m-field-label" for="tl-slug">Workspace slug</label>${prefixed('app.hopline.io/', '<input class="m-input" id="tl-slug" placeholder="orbit-coffee" style="border-start-start-radius: 0; border-end-start-radius: 0">')}<p class="m-field-hint" style="${small}">Used in your workspace’s address.</p></div>
      <div class="m-field"><span class="m-field-label">Workspace logo</span><div class="m-cluster" data-gap="5" style="flex-wrap: nowrap">
        <label style="display: grid; place-items: center; inline-size: 5rem; block-size: 5rem; flex: none; border: 1px solid var(--m-color-border-strong); border-radius: var(--m-radius-full); cursor: pointer"><input type="file" accept="image/*" class="m-sr-only"><span class="m-subtle" style="display: inline-flex">${icon(I.upload, 20, 'Upload a logo')}</span></label>
        <span class="m-stack" data-gap="1"><span>${btn('Upload image', { size: 'sm', extra: ' style="font-size: var(--m-font-size-sm)"' })}</span><span class="m-subtle" style="${small}">Square, at least 160 × 160 px.</span></span>
      </div></div>
      ${btn('Create workspace', { variant: 'primary', extra: wide })}
    </form>
    </div>
  </main>
  <footer class="m-cluster" data-justify="between" data-gap="3" style="padding: var(--m-space-5); align-items: flex-end">
    <div class="m-stack" data-gap="2"><p class="m-muted" style="${small}">Signed in as <strong style="color: var(--m-color-fg-default); font-weight: var(--m-font-weight-semibold)">maya@orbitcoffee.com</strong></p>${btn('Use another account', { size: 'sm', extra: ' style="font-size: var(--m-font-size-sm); align-self: flex-start"' })}</div>
    <button type="button" class="m-button" data-variant="secondary" data-icon-only aria-label="Help">${icon(I['circle-help'], 20)}</button>
  </footer>
</div>`;

// Sign-in: the same split door; the panel holds one customer story and a row of invented customer names
const signIn = splitDoor(
  `      <h1 style="font-size: 1.25rem; font-weight: var(--m-font-weight-semibold); line-height: 1.75rem; text-align: center">Log in to your Hopline account</h1>
      ${field('Work email', '<input class="m-input" type="email" aria-label="Work email" autocomplete="email" placeholder="you@orbitcoffee.com">', '', false)}
      ${btn('Log in with email', { variant: 'primary', extra: wide })}
      ${rule}
      ${btn('Continue with Google', { ic: I.globe, extra: wide })}
      ${btn('Continue with SSO', { ic: I.lock, extra: wide })}
      <p class="m-subtle" style="text-align: center; font-weight: var(--m-font-weight-medium)">New to Hopline? <a href="#" style="color: var(--m-color-fg-default); font-weight: var(--m-font-weight-semibold); text-decoration: none">Sign up</a></p>`,
  'By continuing, you agree to the <a href="#" style="color: var(--m-color-fg-default); text-decoration: none">Terms</a> and <a href="#" style="color: var(--m-color-fg-default); text-decoration: none">Privacy policy</a>.',
  `    <figure class="m-card" data-variant="outline" aria-label="A customer story" style="padding: 0; overflow: hidden; margin: 0">
      <div aria-hidden="true" style="block-size: 14rem; background: linear-gradient(135deg, var(--m-chart-1), var(--m-chart-2) 60%, var(--m-chart-3))"></div>
      <figcaption class="m-stack" data-gap="3" style="padding: var(--m-space-5) var(--m-space-6)"><p style="font-weight: var(--m-font-weight-medium)">How Larchwood Books tracks every podcast mention back to a sale</p>${btn('Read the story', { size: 'sm' })}</figcaption>
    </figure>
    <ul class="m-cluster m-subtle" data-gap="8" data-justify="center" aria-label="Teams using Hopline" style="font-weight: var(--m-font-weight-medium)"><li>Larchwood</li><li>Quillfeather</li><li>Northpine</li><li>Brightfold</li></ul>`,
);

/* ------------------------------------------------------------------ public pages: pricing and reading */

// The site bar: the wordmark, 14px links with a grey fill on the current one, an 8px secondary and the black primary
const siteBar = (current: string) => `<header style="background: var(--m-color-bg-canvas)">
    <nav class="m-navbar" aria-label="Site" style="max-inline-size: 64rem; margin-inline: auto; border: 0">
      <a class="m-navbar-brand" href="#">${wordmark()}</a>
      <ul class="m-navbar-nav">
${(
  [
    ['Product', true],
    ['Solutions', true],
    ['Resources', true],
    ['Customers', false],
    ['Pricing', false],
  ] as [string, boolean][]
)
  .map(([l, menu]) => `        <li><a class="m-navbar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${l}${menu ? ` ${icon(I['chevron-down'], 12)}` : ''}</a></li>`)
  .join('\n')}
      </ul>
      <div class="m-navbar-actions">${btn('Log in', { size: 'sm' })}${btn('Sign up', { variant: 'primary', size: 'sm' })}</div>
    </nav>
  </header>`;
const footer = `<footer style="border-block-start: ${hair}">
    <div class="m-grid" style="max-inline-size: 64rem; margin-inline: auto; padding: var(--m-space-12) var(--m-space-6); --m-layout-grid-min: 10rem">
      <div class="m-stack" data-gap="3">${wordmark()}<p class="m-subtle">Short links and attribution for marketing teams.</p></div>
${(
  [
    ['Product', ['Links', 'Analytics', 'Programs', 'API']],
    ['Resources', ['Docs', 'Help centre', 'Changelog', 'Blog']],
    ['Company', ['About', 'Customers', 'Careers', 'Brand']],
    ['Legal', ['Privacy', 'Terms', 'Security', 'Abuse']],
  ] as [string, string[]][]
)
  .map(
    ([h, items]) => `      <div class="m-stack" data-gap="3"><p style="font-weight: var(--m-font-weight-medium)">${h}</p><ul class="m-stack" data-gap="2">${items.map((i) => `<li><a href="#" class="m-subtle" style="text-decoration: none">${i}</a></li>`).join('')}</ul></div>`,
  )
  .join('\n')}
    </div>
  </footer>`;
// Public pages sit in a 64rem column drawn between two hairlines
const page = (current: string, body: string) => `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  ${siteBar(current)}
  <main style="max-inline-size: 64rem; margin-inline: auto; border-inline: ${hair}">
${body}
  </main>
  ${footer}
</div>`;
const display = (size: string) =>
  `font-family: var(--m-font-family-display); font-weight: var(--m-font-weight-medium); font-size: ${size}; letter-spacing: var(--m-font-tracking-tight); line-height: 1.15`;

type Plan = [string, string, string, string, [string, string][], boolean];
const PLANS: Plan[] = [
  ['Pro', '$25', 'For startups and small teams getting their first links out', 'Start 14-day trial', [['link', '1,000 new links a month'], ['chart', '1-year analytics'], ['globe', '10 custom domains'], ['lock', 'Link passwords']], false],
  ['Business', '$75', 'For growing teams who track sign-ups and sales', 'Start 14-day trial', [['click', 'Conversion tracking'], ['users', 'Unlimited teammates'], ['webhook', 'Webhooks'], ['folder', 'Folders and permissions']], true],
  ['Enterprise', 'Custom', 'For large organisations with volume and security needs', 'Talk to us', [['shield', 'SAML single sign-on'], ['key', 'Audit logs'], ['receipt', 'Invoiced billing'], ['plug', 'Dedicated support']], false],
];
const pricing = page(
  'Pricing',
  `    <section class="m-stack" data-gap="5" style="padding: var(--m-space-16) var(--m-space-8) var(--m-space-8); border-block-end: ${hair}">
      <h1 style="${display('var(--m-font-size-4xl)')}; max-inline-size: 32rem">Pricing that grows with your links</h1>
      <p class="m-muted" style="font-size: var(--m-font-size-xl); max-inline-size: 32rem">Every plan starts with a 14-day trial.</p>
      <div class="m-tabs" data-variant="pill" style="align-self: flex-start"><div class="m-tab-list" role="tablist" aria-label="Billing period" style="border: ${hair}"><button type="button" class="m-tab" role="tab" aria-selected="true">Monthly</button><button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Yearly <span class="m-badge" data-tone="info">2 months free</span></button></div></div>
    </section>
    <section aria-label="Plans" style="margin: var(--m-space-2); display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); border: ${hair}; border-radius: var(--m-radius-lg); background: var(--m-color-bg-raised)">
${PLANS.map(
  ([name, price, who, cta, features, rec]) => `      <article class="m-stack" data-gap="4" style="padding: var(--m-space-6) var(--m-space-5)">
        <div class="m-cluster" data-gap="2"><h2 style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-medium)">${name}</h2>${rec ? '<span class="m-badge" data-tone="info">Most popular</span>' : ''}</div>
        <p class="m-cluster" data-gap="1" style="align-items: baseline"><span style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-medium); ${num}">${price}</span>${price.startsWith('$') ? '<span class="m-subtle">/month</span>' : ''}</p>
        <p class="m-subtle" style="min-block-size: 2.5rem">${who}</p>
        ${btn(cta, { variant: rec ? 'primary' : undefined, extra: ' style="inline-size: 100%"' })}
        <p style="font-weight: var(--m-font-weight-medium)">${rec ? 'Everything in Pro, plus:' : name === 'Pro' ? 'Key features:' : 'Everything in Business, plus:'}</p>
        <ul class="m-stack" data-gap="3">${features.map(([ic, f]) => `<li class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span class="m-subtle" style="display: inline-flex">${icon(I[ic as keyof typeof I])}</span><span class="m-muted" style="text-decoration: underline dotted; text-underline-offset: 3px">${f}</span></li>`).join('')}</ul>
      </article>`,
).join('\n')}
    </section>
    <section class="m-stack" data-gap="4" style="padding: var(--m-space-12) var(--m-space-8)">
      <h2 style="${display('var(--m-font-size-2xl)')}">Questions</h2>
      <div class="m-accordion" style="max-inline-size: 44rem">
        <details class="m-accordion-item" open><summary>What counts as an event?</summary><div class="m-accordion-content"><p>Every click on a short link, and every sign-up or sale you track through it. Events over your limit are still recorded for 30 days.</p></div></details>
        <details class="m-accordion-item"><summary>Can I bring my own domain?</summary><div class="m-accordion-content"><p>Yes. Every plan includes custom domains; add one in settings and point a single DNS record at us.</p></div></details>
        <details class="m-accordion-item"><summary>Do unused links roll over?</summary><div class="m-accordion-content"><p>No. The new-link allowance resets on the first day of each billing month.</p></div></details>
      </div>
    </section>`,
);

// Reading: the help centre. A top bar with search, a tab row, the section nav with a blue current page, the article, and its contents
const helpNav: [string, string[]][] = [
  ['Getting started', ['Introduction', 'Your first link', 'Inviting your team']],
  ['Managing your links', ['Creating a short link', 'Custom domains', 'UTM templates', 'Folders']],
  ['Insights', ['Reading analytics', 'Exporting events']],
];
const reading = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  <header style="border-block-end: ${hair}">
    <div class="m-cluster" data-justify="between" data-gap="4" style="padding: var(--m-space-3) var(--m-space-8)">
      ${wordmark()}
      <label class="m-cluster" style="position: relative; flex: 0 1 24rem"><span class="m-sr-only">Search the help centre</span><span class="m-subtle" style="position: absolute; inset-inline-start: var(--m-space-3); display: inline-flex">${icon(I.search)}</span><input class="m-input" type="search" placeholder="Search…" style="padding-inline-start: var(--m-space-8); border-radius: var(--m-radius-full); background: var(--m-color-bg-sunken); border-color: transparent"></label>
      <div class="m-cluster" data-gap="2">${btn('Contact support', { variant: 'ghost', size: 'sm' })}${btn('Dashboard', { variant: 'primary', size: 'sm', trail: icon(I['chevron-right']) })}</div>
    </div>
    <nav class="m-tabs" aria-label="Sections" style="padding-inline: var(--m-space-8)"><div class="m-tab-list" style="border: 0">${(
      [
        ['code', 'Developer docs', false],
        ['circle-help', 'Help centre', true],
        ['webhook', 'Webhooks', false],
      ] as [string, string, boolean][]
    )
      .map(([ic, l, cur]) => `<a class="m-tab" href="#"${cur ? ' aria-current="page" aria-selected="true"' : ''}>${icon(I[ic as keyof typeof I])} ${l}</a>`)
      .join('')}</div></nav>
  </header>
  <div style="display: flex; flex-wrap: wrap-reverse; gap: var(--m-space-10); padding-inline: var(--m-space-6)">
    <nav class="m-sidebar" aria-label="Help centre" style="flex: 1 1 15rem; max-inline-size: 17rem; background: transparent; padding-block: var(--m-space-8); border-inline-end: ${hair}">
${helpNav
  .map(
    ([h, items]) => `      <div class="m-sidebar-section"><p class="m-sidebar-heading">${h}</p><ul>${items.map((i) => `<li><a class="m-sidebar-link" href="#"${i === 'Custom domains' ? ' aria-current="page"' : ''}>${i}</a></li>`).join('')}</ul></div>`,
  )
  .join('\n')}
    </nav>
    <article class="m-stack" data-gap="6" style="flex: 999 1 30rem; max-inline-size: 42rem; padding-block: var(--m-space-10) var(--m-space-16)">
      <header class="m-stack" data-gap="3">
        <a href="#" style="color: var(--m-color-info-fg); font-weight: var(--m-font-weight-medium); text-decoration: none">Links</a>
        <div class="m-cluster" data-justify="between" data-gap="4" style="align-items: flex-start"><h1 style="font-size: 2.25rem; font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-tight); line-height: 1.15; max-inline-size: 30rem">How to add a custom domain</h1>${btn('Copy page', { ic: I.copy, size: 'sm' })}</div>
        <p class="m-muted" style="font-size: var(--m-font-size-lg)">Brand every short link with a domain you own, in about five minutes.</p>
      </header>
      <div class="m-prose">
        <p>A custom domain turns a generic short link into one your customers recognise. Hopline works with any domain or subdomain you own, as long as you can add a DNS record to it.</p>
        <h2 id="step-1">Step 1: Add the domain in settings</h2>
        <p>Open <strong>Settings › Domains</strong> and choose <strong>Add domain</strong>, or press <kbd class="m-kbd">A</kbd> anywhere in the app. Type the domain without <code>https://</code>, for example <code>go.orbitcoffee.com</code>.</p>
        <h2 id="step-2">Step 2: Add the DNS record</h2>
        <p>Hopline shows the record to add. For a subdomain it’s a <code>CNAME</code>; for a root domain it’s an <code>A</code> record.</p>
        <pre class="m-code"><code>CNAME  go  →  cname.hopline.io</code></pre>
        <div class="m-alert" data-tone="info" role="note"><span class="m-alert-icon">${icon(I.info)}</span><div class="m-alert-content"><p class="m-alert-body">Moving a domain from another link tool? Import its links first, so nothing breaks while DNS updates.</p></div></div>
        <h2 id="step-3">Step 3: Make it the default</h2>
        <p>Set the new domain as the default, and every link you create from then on uses it. Existing links keep their domain.</p>
      </div>
    </article>
  </div>
</div>`;

export const tallyRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Analytics',
    description:
      'The analytics screen in the app frame: filter and date range, three stat tabs over an area chart, then four breakdown cards of tinted bar rows.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'Links, with a link open for editing',
    description:
      'The links list: a toolbar with the black create button and its key, link rows as 12px hairline cards with a clicks chip and a menu, then the row menu and the edit dialog.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Create a workspace',
    description:
      'One centred step on white under a fading grid: the wordmark, a 20px title and a 16px line, name, slug and logo, a full-width primary; who is signed in at the bottom left.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Workspace settings',
    description:
      'The settings area panel, then a stack of form cards, each with a grey footer holding a hint and its own save button; a red-edged danger card last.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'No links yet',
    description:
      'The links page with nothing in it: the toolbar stays, then faded placeholder rows, a 16px line, one sentence and two buttons.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The public family: a site bar, a centred display headline, a period switch, three plans in one hairline grid, questions and the footer.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'In the app frame: a danger alert, a field error with its icon, a toast at the bottom centre, then not found, failure and no access as tiled states.',
    html: errors,
  },
  {
    name: 'reading',
    title: 'Help article',
    description:
      'A public help article: breadcrumbs, a centred display headline, the byline, then one column of prose with code and a note.',
    html: reading,
  },
  {
    name: 'sign-in',
    title: 'Log in',
    description:
      'The split door: a 20px title, work email and a full-width primary, an "or" rule, providers, then a pale panel with one customer story.',
    html: signIn,
  },
];
