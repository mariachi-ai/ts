import { lucidePaths } from '../lucide';
import type { ArchetypeRecipe } from '../types';

/*
 * Basalt's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from a small company's spend tool. They follow the
 * language's real screen patterns: a warm-grey sidebar whose open group is a rounded block, lime
 * counts, a big tight page title under a muted eyebrow, square hairline panels, an underline tab row
 * with counts, a toolbar strip of pill controls over a table of two-line cells, square tinted status
 * tags, outlined tone actions, and one lime button per view.
 */

// Lucide icons, outlined: 1.25px at 16px (1.875 on Lucide's 24px grid)
const icon = (paths: string, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.875" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none">${paths}</svg>`;
const L = lucidePaths;
const I = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  insights: '<path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>',
  layers:
    '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  dollar: '<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/>',
  plane:
    '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  bill: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  bank: '<path d="M10 18v-7"/><path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/>',
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  store:
    '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/>',
  building:
    '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  sparkle: '<path d="M12 3v18"/><path d="M4.2 7.5l15.6 9"/><path d="M4.2 16.5l15.6-9"/>',
  clipboard:
    '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  columns: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/>',
  rows: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 12h18"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  up: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  corner: '<path d="m15 10 5 5-5 5"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  users:
    '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14a6.5 6.5 0 0 1 3.5 6"/>',
  chevronUp: '<path d="m18 15-6-6-6 6"/>',
  chevronsUpDown: '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
  dot: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z"/>',
};

// Shared inline treatments (tokens only)
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-muted)';
const panelBorder = 'border: var(--m-border-width-thin) solid var(--m-color-border-default)';
const muted = 'color: var(--m-color-fg-muted)';
const small = 'font-size: var(--m-font-size-xs)';
const num = 'font-variant-numeric: tabular-nums';
const eyebrow = 'font-size: var(--m-font-size-md); color: var(--m-color-fg-muted)';
const pageTitle =
  'font-family: var(--m-font-family-display); font-size: var(--m-font-size-3xl); font-weight: var(--m-font-heading-weight); letter-spacing: var(--m-font-tracking-tight); line-height: 1.2';
const sectionTitle =
  'font-size: var(--m-font-size-xl); font-weight: var(--m-font-heading-weight); letter-spacing: var(--m-font-tracking-tight); line-height: 1.4';
const pill = 'border-radius: var(--m-radius-full)';
// A count: a lime pill; neutral counts sit on the warm fill; the current tab's count is an ink ring
const limeCount = (n: string) => `<span class="m-sidebar-count">${n}</span>`;
const count = (n: string) => `<span class="m-badge" style="${pill}; ${num}">${n}</span>`;
const ringCount = (n: string) =>
  `<span class="m-badge" style="${pill}; background: transparent; color: inherit; box-shadow: inset 0 0 0 var(--m-border-width-thin) currentColor; ${num}">${n}</span>`;
const roundIcon = (paths: string, label: string) =>
  `<button type="button" class="m-button" data-size="sm" data-icon-only aria-label="${label}" style="${pill}">${icon(paths)}</button>`;

// The side navigation: the open group is a rounded warm block; its current item is lighter
const navItem = (ic: string, label: string, extra = '', current = false) =>
  `<li><a class="m-sidebar-link" href="#"${current ? ' aria-current="page"' : ''}>${icon(ic)} ${label}${extra}</a></li>`;
const subItem = (label: string, extra = '', current = false) =>
  `<li><a class="m-sidebar-link" href="#"${current ? ' aria-current="page"' : ''} style="padding-inline-start: var(--m-space-8); white-space: nowrap${current ? '; background: var(--m-color-bg-sunken)' : ''}">${label}${extra}</a></li>`;
const group = (ic: string, label: string, items: string) =>
  `<li style="background: var(--m-color-border-muted); border-radius: var(--m-radius-lg); padding: var(--m-space-1)">
            <a class="m-sidebar-link" href="#" style="color: var(--m-color-fg-default)">${icon(ic)} ${label}</a>
            <ul style="margin: 0; padding: 0; border: 0">${items}</ul>
          </li>`;

const sidebar = (open: 'home' | 'accounting' | 'company' | 'vendors') => `<nav class="m-sidebar" aria-label="Main">
    <div class="m-sidebar-section" style="padding: var(--m-space-2)">
      <span class="m-cluster" data-gap="2"><span class="m-avatar" data-size="sm" style="border-radius: var(--m-radius-md); background: var(--m-color-fg-default); color: var(--m-color-bg-surface)">T</span> Tidewater Studio</span>
    </div>
    <div class="m-sidebar-section" style="padding: var(--m-space-2); padding-block-end: var(--m-space-4); ${hair.replace('block-start', 'block-end')}">
      <span class="m-cluster" data-gap="2" style="${muted}">${icon(I.clipboard)} Setup guide</span>
      <span style="${small}; ${muted}">Next: Connect your accounting</span>
      <progress class="m-progress" data-size="sm" value="2" max="5" aria-label="Setup: 2 of 5 steps done">2 of 5</progress>
    </div>
    <div class="m-sidebar-section">
      <ul>
        ${
          open === 'home'
            ? group(
                I.home,
                'Home',
                subItem('Overview', limeCount('59'), true) +
                  subItem('Inbox') +
                  subItem('My expenses') +
                  subItem('My trips'),
              )
            : navItem(I.home, 'Home', limeCount('59'))
        }
        ${navItem(I.insights, 'Insights')}
      </ul>
    </div>
    <div class="m-sidebar-section" style="${hair}; padding-block-start: var(--m-space-4)">
      <ul>
        ${navItem(I.layers, 'Manage spend')}
        ${navItem(I.dollar, 'Expenses')}
        ${navItem(I.plane, 'Travel')}
        ${navItem(I.bill, 'Bill pay', limeCount('30'))}
        ${navItem(I.bank, 'Banking')}
      </ul>
    </div>
    <div class="m-sidebar-section" style="${hair}; padding-block-start: var(--m-space-4)">
      <ul>
        ${
          open === 'accounting'
            ? group(
                I.book,
                'Accounting',
                subItem('Transactions', limeCount('204'), true) +
                  subItem('Reimbursements', limeCount('33')) +
                  subItem('Bill pay', limeCount('57')),
              )
            : navItem(I.book, 'Accounting', limeCount('319'))
        }
        ${navItem(I.store, 'Vendors', '', open === 'vendors')}
        ${navItem(L['sliders-horizontal'], 'Policy')}
        ${navItem(I.building, 'Company', '', open === 'company')}
      </ul>
    </div>
    <div class="m-sidebar-section" style="margin-block-start: auto; ${hair}; padding-block-start: var(--m-space-3)">
      <ul>${navItem(I.sparkle, 'Assistant')}</ul>
    </div>
  </nav>`;

// The top bar: a wide warm search field with its shortcut, then bell, add, help and the avatar
const topbar = `<header class="m-cluster" data-justify="between" data-gap="4" style="padding: var(--m-space-2) var(--m-space-6); ${hair.replace('block-start', 'block-end')}; flex-wrap: nowrap">
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="flex: 1; justify-content: flex-start; background: var(--m-color-bg-sunken); border-radius: var(--m-radius-md); max-inline-size: 58rem">${icon(L.search)} <span style="flex: 1; text-align: start">Search for anything</span><kbd class="m-kbd">⌘</kbd><kbd class="m-kbd">K</kbd></button>
      <div class="m-cluster" data-gap="1" style="flex-wrap: nowrap">
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Updates" style="${pill}">${icon(L.bell)}</button>
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Create" style="${pill}">${icon(L.plus)}</button>
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Help" style="${pill}">${icon(L['circle-help'])}</button>
        <span class="m-avatar" data-size="md" aria-label="Maya Okafor">MO</span>
      </div>
    </header>`;

const shell = (
  open: Parameters<typeof sidebar>[0],
  main: string,
  canvas = false,
) => `<div class="m-split" style="--m-layout-split-side: 13.5rem; --m-layout-split-gap: 0; min-block-size: 100vh">
  ${sidebar(open)}
  <div class="m-stack" data-gap="0" style="background: var(--m-color-bg-${canvas ? 'canvas' : 'surface'})">
    ${topbar}
    <main class="m-container" style="padding-block: var(--m-space-10) var(--m-space-16)">
${main}
    </main>
  </div>
</div>`;

// Charts: a denim spend area, a green-and-denim balance bar, a filled step line for cash
const spend = [2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 5, 6, 9, 14, 28, 52, 76, 96, 96];
const spendLine = spend.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * 300) / (spend.length - 1)},${100 - v}`).join(' ');
const spendChart = `<svg viewBox="0 0 300 100" width="100%" preserveAspectRatio="none" style="display: block; block-size: 5.5rem" role="img" aria-label="Spend over 90 days, rising sharply in the last three weeks">
                <defs><linearGradient id="bs-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: var(--m-color-info-border); stop-opacity: 0.35"/><stop offset="1" style="stop-color: var(--m-color-info-border); stop-opacity: 0"/></linearGradient></defs>
                <path d="${spendLine} L300,100 L0,100 Z" fill="url(#bs-fade)"/>
                <path d="${spendLine}" fill="none" style="stroke: var(--m-color-info-border)" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
              </svg>`;
const cash = [20, 24, 40, 44, 44, 45, 62, 66, 64, 66, 66, 68, 68];
const cashLine = cash.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * 200) / (cash.length - 1)},${80 - v}`).join(' ');
const cashChart = `<svg viewBox="0 0 200 80" width="100%" preserveAspectRatio="none" style="display: block; block-size: 5rem" role="img" aria-label="Cash balance over 90 days, up from $122K to $488K">
                <path d="${cashLine} L200,80 L0,80 Z" style="fill: var(--m-color-success-bg)"/>
                <path d="${cashLine}" fill="none" style="stroke: var(--m-color-success-solid)" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
              </svg>`;
const insight = (label: string, value: string, extra: string, style = '') =>
  `<div class="m-stack" data-gap="2" style="padding: var(--m-space-4) var(--m-space-5); ${style}">
              <span style="font-size: var(--m-font-size-sm); ${muted}">${label}</span>
              <a href="#" class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-2xl); letter-spacing: var(--m-font-tracking-tight); color: var(--m-color-fg-default); text-decoration: none; ${num}">${value} ${icon(L['arrow-right'], 20)}</a>
              ${extra}
            </div>`;
const balanceBar = `<div class="m-cluster" data-gap="0" role="img" aria-label="Card balance: $210K settled, $96K pending, $494K available" style="flex-wrap: nowrap; block-size: 0.375rem; margin-block-start: var(--m-space-3)">
                <span style="flex: 26; block-size: 100%; background: var(--m-color-info-border)"></span>
                <span style="flex: 12; block-size: 100%; background: var(--m-color-success-solid)"></span>
                <span style="flex: 62; block-size: 100%; background: var(--m-color-border-muted)"></span>
              </div>`;

// A task row: a round warm icon, a 16px title and a muted line, then an arrow or a Review button
const task = (
  ic: string,
  title: string,
  line: string,
  action = '',
) => `<a href="#" class="m-cluster" data-gap="4" data-justify="between" style="padding: var(--m-space-5); ${panelBorder}; background: var(--m-color-bg-surface); color: var(--m-color-fg-default); text-decoration: none">
              <span class="m-cluster" data-gap="4" style="flex-wrap: nowrap; min-inline-size: 0">
                <span class="m-avatar" data-size="lg" style="background: var(--m-color-bg-sunken); color: var(--m-color-fg-default); flex: none">${icon(ic, 20)}</span>
                <span class="m-stack" data-gap="1" style="min-inline-size: 0"><span style="font-size: var(--m-font-size-md)">${title}</span><span style="font-size: var(--m-font-size-sm); ${muted}">${line}</span></span>
              </span>
              ${action || icon(L['arrow-right'])}
            </a>`;
const budget = (
  name: string,
  left: string,
  used: number,
) => `<div class="m-stack" data-gap="2" style="padding-block: var(--m-space-3); ${hair}">
              <div class="m-cluster" data-justify="between"><span>${name}</span><span style="${muted}; ${num}">${left} left</span></div>
              <progress class="m-progress" data-size="sm" value="${used}" max="100" aria-label="${name}: ${used}% used" style="--m-progress-fill: var(--m-color-info-border)">${used}%</progress>
            </div>`;

const dashboard = shell(
  'home',
  `      <div class="m-split" style="--m-layout-split-side: 18rem; --m-layout-split-gap: var(--m-space-10); flex-direction: row-reverse; flex-wrap: wrap-reverse; align-items: flex-end">
        <aside class="m-stack" data-gap="3" aria-label="Quick actions" style="padding-block-start: var(--m-space-16)">
          <button type="button" class="m-button" data-variant="primary" style="inline-size: 100%">Issue card</button>
          <button type="button" class="m-button" style="inline-size: 100%">New ${icon(L['chevron-down'])}</button>
          <section class="m-stack" data-gap="0" aria-labelledby="bs-budgets" style="margin-block-start: var(--m-space-6)">
            <h2 id="bs-budgets" style="font-size: var(--m-font-size-sm); ${muted}; font-weight: var(--m-font-weight-regular); padding-block-end: var(--m-space-2)">Your funds</h2>
            ${budget('Software', '$20K', 34)}
            ${budget('Client travel', '$995.39', 88)}
            ${budget('Office and supplies', '$682.92', 61)}
            <a href="#" style="padding-block-start: var(--m-space-3); color: var(--m-color-fg-default)">View all (8)</a>
          </section>
        </aside>
        <div class="m-stack" data-gap="8">
          <h1 style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-heading-weight); letter-spacing: var(--m-font-tracking-tight)">Good morning, Maya</h1>
          <section class="m-grid" aria-label="Overview" style="--m-layout-grid-min: 16rem; --m-layout-grid-gap: 0; ${panelBorder.replace('default', 'muted')}; background: var(--m-color-bg-surface)">
            ${insight('Current card balance', '$306K', balanceBar, 'border-inline-end: var(--m-border-width-thin) solid var(--m-color-border-muted)')}
            ${insight('Cash balance', '$488K', cashChart)}
            <div class="m-cluster" data-gap="6" data-align="end" style="grid-column: 1 / -1; ${hair}; flex-wrap: nowrap">
              ${insight('Total spend, 90 days', '$1.2M', `<span class="m-cluster" data-gap="1" style="font-size: var(--m-font-size-sm); color: var(--m-color-info-fg)">${icon(I.up, 14)} <a href="#" style="color: inherit; text-decoration-style: dotted">212.4%</a></span>`, 'flex: none')}
              <div style="flex: 1; min-inline-size: 0; padding: var(--m-space-4) var(--m-space-5) var(--m-space-4) 0">${spendChart}</div>
            </div>
          </section>
          <div class="m-tabs">
            <div class="m-tab-list" role="tablist" aria-label="Tasks">
              <button type="button" class="m-tab" role="tab" aria-selected="true">All</button>
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">My expenses ${count('20')}</button>
            </div>
          </div>
          <section class="m-stack" data-gap="3" aria-labelledby="bs-approval">
            <div class="m-cluster" data-justify="between">
              <h2 id="bs-approval" class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-regular)">${icon(L['chevron-down'])} Requires your approval</h2>
              <a href="#" class="m-cluster" data-gap="2" style="color: var(--m-color-fg-default)">View all ${count('38')}</a>
            </div>
            ${task(I.bill, '8 bills', '$642,530.35 total · Harbor Freightways, Lumen Print and 6 others')}
            ${task(I.history, '4 reimbursements', '$2,686.55 total · <span style="color: var(--m-color-warning-fg)">Review recommended</span>', `<span class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="More" style="${pill}">${icon(L['ellipsis-vertical'])}</span><span class="m-button">Review</span></span>`)}
            ${task(I.dollar, '6 card transactions', '$3,138.60 total · Priya, Jonah and Elena · <span style="color: var(--m-color-warning-fg)">Review recommended</span>')}
            ${task(I.dollar, '17 card transactions', '$7,726.36 total · Jonah, Elena and Priya · <span style="color: var(--m-color-success-fg)">Approval recommended</span>')}
          </section>
        </div>
      </div>`,
  true,
);

// A two-line cell: the name, then a muted 12px line
const two = (a: string, b: string) =>
  `<span class="m-stack" data-gap="0"><span>${a}</span><span style="${small}; ${muted}">${b}</span></span>`;
const tag = (tone: string, ic: string, label: string) =>
  `<span class="m-badge" data-tone="${tone}">${icon(ic, 12)} ${label}</span>`;
const approve = (who: string) =>
  `<button type="button" class="m-button" data-icon-only aria-label="Mark ${who} ready" style="color: var(--m-color-success-fg); border-color: var(--m-color-success-border)">${icon(I.check)}</button>`;
const tx = (
  initials: string,
  merchant: string,
  category: string,
  status: string,
  date: string,
  amount: string,
  who: string,
  team: string,
) => `              <tr>
                <td><input class="m-checkbox" type="checkbox" aria-label="Select ${merchant}"></td>
                <td><span class="m-cluster" data-gap="3" style="flex-wrap: nowrap"><span class="m-avatar" data-size="md" style="background: var(--m-color-bg-sunken); color: var(--m-color-fg-default)">${initials}</span>${two(merchant, category)}</span></td>
                <td>${status}</td>
                <td style="${num}">${date}</td>
                <td data-numeric style="${num}">${amount}</td>
                <td>${two(who, team)}</td>
                <td>${approve(merchant)}</td>
                <td><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="More for ${merchant}" style="${pill}">${icon(L['ellipsis-vertical'])}</button></td>
              </tr>`;

const ready = tag('success', I.bill, 'Mark ready');
const reviewCat = tag('warning', L['triangle-alert'], 'Review category');
const reviewFields = tag('warning', L['triangle-alert'], 'Review fields');
const outOfPolicy = tag('danger', L['octagon-alert'], 'Out of policy');

// A row of details: an icon and a label on the left, the value on the right; no rules between
const detailRow = (ic: string, label: string, value: string) =>
  `<div class="m-split" style="--m-layout-split-side: 14rem; --m-layout-split-gap: var(--m-space-4); padding-block: var(--m-space-3)"><dt class="m-cluster" data-gap="3">${icon(ic)} ${label}</dt><dd>${value}</dd></div>`;

const listDetail = shell(
  'accounting',
  `      <div class="m-stack" data-gap="12">
        <!-- The list: eyebrow, big title, actions, underline tabs with counts, a toolbar strip, the table -->
        <section class="m-stack" data-gap="0" aria-labelledby="bs-tx-title">
          <span style="${eyebrow}">Accounting</span>
          <div class="m-cluster" data-justify="between" style="padding-block: var(--m-space-2) var(--m-space-6)">
            <h1 id="bs-tx-title" style="${pageTitle}">Card transactions</h1>
            <div class="m-cluster" data-gap="2">
              <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="More actions" style="${pill}">${icon(L['ellipsis-vertical'])}</button>
              <button type="button" class="m-button">Settings</button>
              <button type="button" class="m-button" data-variant="primary">Export all ${ringCount('53')}</button>
            </div>
          </div>
          <div class="m-tabs">
            <div class="m-tab-list" role="tablist" aria-label="Review state">
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">All ${count('204')}</button>
              <button type="button" class="m-tab" role="tab" aria-selected="true">Needs review ${ringCount('151')}</button>
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Ready to export ${count('53')}</button>
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Waiting on cardholder ${count('28')}</button>
            </div>
          </div>
          <div class="m-cluster" data-justify="between" role="search" style="padding: var(--m-space-2) 0; background: var(--m-color-bg-canvas)">
            <div class="m-cluster" data-gap="2">
              <input class="m-input" data-size="sm" type="search" placeholder="Search or filter…" aria-label="Search or filter" style="${pill}; inline-size: 14rem">
              ${roundIcon(L.calendar, 'Date range')}
              <span class="m-cluster" data-gap="1" style="padding: var(--m-space-1); ${pill}; background: var(--m-color-bg-sunken); font-size: var(--m-font-size-xs)">
                <span class="m-cluster" data-gap="1" style="padding-inline: var(--m-space-2); ${muted}">${icon(I.lock, 12)} Status</span>
                <span style="padding: var(--m-space-1) var(--m-space-3); ${pill}; background: var(--m-color-bg-surface)">Needs review</span>
              </span>
            </div>
            <div class="m-cluster" data-gap="2">
              ${roundIcon(I.rows, 'Row density')}
              ${roundIcon(I.columns, 'Columns')}
              <button type="button" class="m-button" data-size="sm" style="${pill}">Options ${icon(L['chevron-down'])}</button>
            </div>
          </div>
          <div class="m-table-wrap" style="border-inline: 0">
            <table class="m-table">
              <thead><tr><th style="inline-size: 2.5rem"><input class="m-checkbox" type="checkbox" aria-label="Select all"></th><th>Merchant</th><th>Suggested action</th><th>Date</th><th data-numeric>Amount</th><th>Cardholder</th><th>Actions</th><th><span class="m-sr-only">More</span></th></tr></thead>
              <tbody>
${tx('NB', 'Noble Bakehouse', 'Restaurants', ready, 'Jun 5, 2026', '$276.76 USD', 'Priya Raman', 'Customer success · London')}
${tx('KC', 'Kiln Coffee', 'Restaurants', reviewCat, 'Jun 5, 2026', '$352.87 USD', 'Jonah Feld', 'Executive · New York')}
${tx('FG', 'Figtree Design', 'Software', ready, 'Jun 5, 2026', '$8.00 USD', 'Jonah Feld', 'Executive · New York')}
${tx('CR', 'City Rideshare', 'Taxi and rideshare', reviewFields, 'Jun 5, 2026', '$78.00 USD', 'Elena Ortiz', 'Finance · Seattle')}
${tx('CM', 'Corner Market', 'Groceries', outOfPolicy, 'Jun 4, 2026', '$24.99 USD', 'Elena Ortiz', 'Finance · Seattle')}
${tx('BT', 'Bayside Tours', 'Other', reviewCat, 'Jun 4, 2026', '$1,578.89 USD', 'Elena Ortiz', 'Finance · Seattle')}
              </tbody>
            </table>
          </div>
          <div class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-3); ${hair}; background: var(--m-color-bg-canvas); ${small}; ${muted}">
            <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="${small}; ${muted}; text-decoration: underline">Select ${icon(L['chevron-down'], 12)}</button>
            <span class="m-cluster" data-gap="2" style="${num}">1–50 of 151 transactions · ${icon(L.info, 12)} $141,781.68 USD ${icon(L['arrow-right'])}</span>
          </div>
        </section>

        <hr class="m-divider">

        <!-- The detail: a statement title, linked people, a notice, then label-and-value rows and the decision -->
        <section class="m-stack" data-gap="8" aria-labelledby="bs-detail-title" style="max-inline-size: 48rem">
          <a href="#" class="m-cluster" data-gap="2" style="color: var(--m-color-fg-default)">${icon(L['arrow-left'])} Inbox</a>
          <div class="m-stack" data-gap="3">
            <span class="m-avatar" data-size="lg" style="background: var(--m-color-bg-sunken); color: var(--m-color-fg-default)">${icon(I.plane, 20)}</span>
            <h1 id="bs-detail-title" style="${pageTitle}; ${num}">$1,048.25 USD at Skyline Air</h1>
            <div class="m-cluster" data-justify="between">
              <span class="m-cluster" data-gap="2" style="${muted}"><a href="#" style="color: inherit">Priya Raman</a> · <a href="#" style="color: inherit">Skyline Air</a> · Mar 23, 2026 at 4:07 PM</span>
              <a href="#" class="m-cluster" data-gap="1" style="color: var(--m-color-fg-default)">Options ${icon(L['chevron-down'])}</a>
            </div>
          </div>
          <div class="m-alert" data-tone="danger" role="note" style="background: var(--m-color-bg-surface)">
            <div class="m-alert-content">
              <div class="m-alert-title" style="font-weight: var(--m-font-weight-bold); font-size: var(--m-font-size-md)">Rejection recommended</div>
              <ul class="m-alert-body" style="color: var(--m-color-fg-default); padding-inline-start: var(--m-space-5)">
                <li>Business class upgrades aren’t allowed for this role</li>
                <li>Never allowed: first-class fares, seat auctions, lounge memberships</li>
              </ul>
            </div>
          </div>
          <section class="m-stack" data-gap="2" aria-labelledby="bs-details">
            <h2 id="bs-details" class="m-cluster" data-gap="3" style="${sectionTitle}">Details <span class="m-badge" data-tone="success">Complete</span></h2>
            <dl class="m-stack" data-gap="0">
              ${detailRow(I.card, 'Spent from', 'Client travel (3912)')}
              ${detailRow(I.building, 'Entity', 'Tidewater Studio, Inc.')}
              ${detailRow(L['square-pen'], 'Memo', 'Flight back to New York')}
              ${detailRow(I.bill, 'Receipt', `<span class="m-cluster" data-gap="1" style="color: var(--m-color-success-fg)">${icon(L['circle-check'], 14)} Auto-verified</span>`)}
              ${detailRow(I.dollar, 'Budget', '<a href="#" style="color: inherit">65100 · Travel, airfare and lodging</a> <span class="m-badge">Tracking</span>')}
            </dl>
          </section>
          <div class="m-grid" style="--m-layout-grid-min: 14rem; --m-layout-grid-gap: var(--m-space-4); ${hair}; padding-block-start: var(--m-space-4)">
            <button type="button" class="m-button" data-size="lg" style="color: var(--m-color-danger-fg); border-color: var(--m-color-danger-border)">Reject ${icon(L['chevron-down'])}</button>
            <button type="button" class="m-button" data-size="lg" style="color: var(--m-color-success-fg); border-color: var(--m-color-success-border)">Approve <kbd class="m-kbd" style="color: inherit; border-color: currentColor">⌘</kbd><kbd class="m-kbd" style="color: inherit; border-color: currentColor">↵</kbd></button>
          </div>
        </section>
      </div>`,
);

// Onboarding: a full-page flow. A bar with the step and a round close button, then one 768px column
const onboarding = `<div class="m-stack" data-gap="0" style="min-block-size: 100vh; background: var(--m-color-bg-surface)">
  <header class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-6); background: var(--m-color-bg-canvas); ${hair.replace('block-start', 'block-end')}">
    <span class="m-cluster" data-gap="3"><span class="m-avatar" data-size="sm" style="border-radius: var(--m-radius-md); background: var(--m-color-fg-default); color: var(--m-color-bg-surface)">T</span> <span style="${muted}">Set up Tidewater Studio · Step 2 of 4</span></span>
    <button type="button" class="m-button" data-icon-only aria-label="Close" style="${pill}">${icon(L.x)}</button>
  </header>
  <progress class="m-progress" data-size="sm" value="2" max="4" aria-label="Step 2 of 4">2 of 4</progress>
  <main class="m-container" data-size="md" style="padding-block: var(--m-space-8) var(--m-space-16)">
    <form class="m-stack" data-gap="8" aria-labelledby="bs-onb-title">
      <a href="#" class="m-cluster" data-gap="2" style="${muted}; text-decoration: none">${icon(L['arrow-left'])} Back</a>
      <div class="m-stack" data-gap="2">
        <h1 id="bs-onb-title" style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-4xl); font-weight: var(--m-font-heading-weight); letter-spacing: var(--m-font-tracking-tight); line-height: 1">Your company</h1>
        <p style="${muted}">We use this to set card limits and match your books. About 4 minutes.</p>
      </div>
      <div class="m-alert" data-tone="info" role="note">
        <span class="m-alert-icon">${icon(I.sparkle)}</span>
        <div class="m-alert-content"><div class="m-alert-title">Upload your formation documents to fill this in</div><div class="m-alert-body">We’ll read the legal name, address and EIN from your certificate of incorporation.</div></div>
      </div>
      <section class="m-stack" data-gap="4" aria-labelledby="bs-onb-legal">
        <h2 id="bs-onb-legal" style="${sectionTitle}">Legal details</h2>
        <div class="m-field">
          <label class="m-field-label" for="bs-onb-name">Legal name</label>
          <input class="m-input" data-size="lg" id="bs-onb-name" value="Tidewater Studio, Inc." required>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="bs-onb-type" data-required>Entity type</label>
          <select class="m-select" data-size="lg" id="bs-onb-type"><option>C corporation</option><option>LLC</option><option>S corporation</option></select>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="bs-onb-ein" data-required>Federal EIN</label>
          <input class="m-input" data-size="lg" id="bs-onb-ein" value="12-34567" aria-invalid="true" aria-describedby="bs-onb-ein-error" style="${num}">
          <p class="m-field-error" id="bs-onb-ein-error">An EIN has 9 digits, like 12-3456789.</p>
        </div>
      </section>
      <section class="m-stack" data-gap="4" aria-labelledby="bs-onb-spend">
        <h2 id="bs-onb-spend" style="${sectionTitle}">How much do you spend a month?</h2>
        <div class="m-grid" style="--m-layout-grid-min: 12rem; --m-layout-grid-gap: var(--m-space-3)">
          <div class="m-field">
            <label class="m-field-label" for="bs-onb-cards">On cards</label>
            <select class="m-select" data-size="lg" id="bs-onb-cards"><option>$10K–$50K</option><option>Under $10K</option><option>$50K–$250K</option></select>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="bs-onb-bills">On bills</label>
            <select class="m-select" data-size="lg" id="bs-onb-bills"><option>$50K–$250K</option><option>Under $50K</option></select>
          </div>
        </div>
        <label class="m-field" data-layout="inline"><input class="m-checkbox" type="checkbox" checked> We have more than one entity</label>
      </section>
      <div class="m-cluster" data-justify="between" style="${hair}; padding-block-start: var(--m-space-6)">
        <button type="button" class="m-button" data-variant="ghost" style="text-decoration: underline">Cancel</button>
        <div class="m-cluster" data-gap="2">
          <button type="button" class="m-button">Save draft</button>
          <button type="submit" class="m-button" data-variant="primary">Continue</button>
        </div>
      </div>
    </form>
  </main>
</div>`;

// Settings: a read-only panel of labelled values, each row with an Edit button, then switches
const valueRow = (
  label: string,
  value: string,
  action = '<button type="button" class="m-button" data-size="sm">Edit</button>',
) =>
  `<div class="m-cluster" data-justify="between" style="padding: var(--m-space-4) var(--m-space-5); ${hair}">
              <div class="m-stack" data-gap="1"><span style="${small}; ${muted}">${label}</span><span>${value}</span></div>
              ${action}
            </div>`;
const switchRow = (label: string, hint: string, on: boolean) =>
  `<div class="m-cluster" data-justify="between" style="padding: var(--m-space-4) var(--m-space-5); ${hair}; flex-wrap: nowrap">
              <label class="m-stack" data-gap="1" for="bs-set-${label.toLowerCase().replace(/[^a-z]+/g, '-')}"><span>${label}</span><span style="font-size: var(--m-font-size-sm); ${muted}">${hint}</span></label>
              <input class="m-switch" type="checkbox" role="switch" id="bs-set-${label.toLowerCase().replace(/[^a-z]+/g, '-')}"${on ? ' checked' : ''}>
            </div>`;
const verified = `<span class="m-cluster" data-gap="1" style="font-size: var(--m-font-size-sm); ${muted}">${icon(I.lock, 14)} Verified</span>`;
const panel = (rows: string) =>
  `<div class="m-stack" data-gap="0" style="${panelBorder}; background: var(--m-color-bg-surface)">
            ${rows.replace(hair, 'border-block-start: 0')}
          </div>`;

const settings = shell(
  'company',
  `      <div class="m-stack" data-gap="10" style="max-inline-size: 56rem">
        <div class="m-stack" data-gap="0">
          <span style="${eyebrow}">Company</span>
          <h1 style="${pageTitle}; padding-block: var(--m-space-2) var(--m-space-6)">Settings</h1>
          <div class="m-tabs">
            <div class="m-tab-list" role="tablist" aria-label="Settings">
              <button type="button" class="m-tab" role="tab" aria-selected="true">General</button>
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Entities ${count('2')}</button>
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">People</button>
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Notifications</button>
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Security</button>
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Plan</button>
            </div>
          </div>
        </div>
        <section class="m-stack" data-gap="4" aria-labelledby="bs-set-biz">
          <h2 id="bs-set-biz" style="${sectionTitle}">Business details</h2>
          ${panel(
            valueRow('Legal name', 'Tidewater Studio, Inc.', verified) +
              valueRow('Doing business as', 'Tidewater Studio') +
              valueRow('Federal EIN', '<span style="letter-spacing: 0.15em">•••••4567</span>', verified) +
              valueRow('Business address', '2140 Harbor Way, Suite 300, Oakland, CA 94607') +
              valueRow('Fiscal year starts', 'January'),
          )}
        </section>
        <section class="m-stack" data-gap="4" aria-labelledby="bs-set-cards">
          <h2 id="bs-set-cards" style="${sectionTitle}">Cards and receipts</h2>
          <div class="m-alert" role="note">
            <span class="m-alert-icon">${icon(L.info)}</span>
            <div class="m-alert-content"><div class="m-alert-body">Changes apply to new transactions only. Past transactions keep the rules they were made under.</div></div>
          </div>
          ${panel(
            switchRow(
              'Lock cards when receipts are missing',
              'After 14 days without a receipt, the card is paused until one is added.',
              true,
            ) +
              switchRow('Text receipt reminders', 'Cardholders get a text after each purchase over $75.', true) +
              switchRow('Allow ATM withdrawals', 'Off for every card unless a policy turns it on.', false),
          )}
        </section>
        <section class="m-stack" data-gap="4" aria-labelledby="bs-set-close" style="${hair}; padding-block-start: var(--m-space-8)">
          <h2 id="bs-set-close" style="${sectionTitle}">Close account</h2>
          <p style="${muted}; max-inline-size: 40rem">Closing locks all 48 cards, cancels 6 scheduled bills and exports your records. It can’t be undone.</p>
          <div><button type="button" class="m-button" data-variant="danger">Close account…</button></div>
        </section>
      </div>`,
);

const emptyState = shell(
  'vendors',
  `      <div class="m-stack" data-gap="0">
        <span style="${eyebrow}">Vendors</span>
        <div class="m-cluster" data-justify="between" style="padding-block: var(--m-space-2) var(--m-space-6)">
          <h1 style="${pageTitle}">Contracts</h1>
          <button type="button" class="m-button" data-variant="primary">${icon(L.plus)} Add contract</button>
        </div>
        <div class="m-tabs">
          <div class="m-tab-list" role="tablist" aria-label="Contracts">
            <button type="button" class="m-tab" role="tab" aria-selected="true">Active ${ringCount('0')}</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Renewing soon ${count('0')}</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Expired ${count('0')}</button>
          </div>
        </div>
        <section class="m-stack" data-gap="4" data-align="center" aria-labelledby="bs-empty" style="text-align: center; padding: var(--m-space-16) var(--m-space-6); margin-block-start: var(--m-space-6); ${panelBorder.replace('default', 'muted')}; background: var(--m-color-bg-canvas)">
          <span class="m-avatar" data-size="lg" style="background: var(--m-color-bg-sunken); color: var(--m-color-fg-default)">${icon(I.bill, 20)}</span>
          <h2 id="bs-empty" style="${sectionTitle}">No contracts yet</h2>
          <p style="${muted}; max-inline-size: 28rem">Upload a vendor contract and we’ll read the terms, track the renewal date and flag price increases before you pay them.</p>
          <div class="m-cluster" data-gap="2" data-justify="center">
            <button type="button" class="m-button" data-variant="primary">${icon(L.upload)} Upload a contract</button>
            <button type="button" class="m-button">Import from a spreadsheet</button>
          </div>
          <a href="#" class="m-cluster" data-gap="1" style="font-size: var(--m-font-size-sm); color: var(--m-color-fg-default)">How contract tracking works ${icon(L['arrow-right'], 14)}</a>
        </section>
      </div>`,
  true,
);

// Pricing: 8px-rounded tier panels with a tag on the top edge, the middle one ringed in lime
const tier = (
  tagLabel: string,
  tagStyle: string,
  name: string,
  price: string,
  note: string,
  pitch: string,
  button: string,
  groups: [string, string[]][],
  featured = false,
) => `      <section class="m-stack" data-gap="6" aria-label="${name}" style="position: relative; padding: var(--m-space-10) var(--m-space-8); border-radius: var(--m-radius-lg); border: ${featured ? '3px solid var(--m-button-primary-bg)' : 'var(--m-border-width-thin) solid var(--m-color-border-default)'}; background: var(--m-color-bg-surface)">
        <span style="position: absolute; inset-block-start: -1rem; inset-inline: 0; margin-inline: auto; inline-size: max-content; padding: var(--m-space-1) var(--m-space-4); border-radius: var(--m-radius-lg); ${tagStyle}">${tagLabel}</span>
        <div class="m-stack" data-gap="1">
          <h2 style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-regular); letter-spacing: var(--m-font-tracking-tight)">${name}</h2>
          <span style="font-size: var(--m-font-size-2xl); letter-spacing: var(--m-font-tracking-tight); ${muted}; ${num}">${price}</span>
          <span style="font-size: var(--m-font-size-sm); ${muted}; min-block-size: 2.5em">${note}</span>
        </div>
        <p style="min-block-size: 3em">${pitch}</p>
        ${button}
        <div class="m-stack" data-gap="5" style="${hair}; padding-block-start: var(--m-space-6)">
${groups
  .map(
    ([h, items]) => `          <div class="m-stack" data-gap="2">
            <h3 style="font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-regular)">${h}</h3>
            <ul class="m-stack" data-gap="2" style="padding: 0; font-size: var(--m-font-size-sm); ${muted}">
${items.map((f) => `              <li class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${icon(I.check, 12)} ${f}</li>`).join('\n')}
            </ul>
          </div>`,
  )
  .join('\n')}
        </div>
      </section>`;
const yes = `<span style="color: var(--m-color-success-solid); display: inline-flex">${icon(L['circle-check'], 20)}</span><span class="m-sr-only">Included</span>`;
const no = `<span style="${muted}">—</span><span class="m-sr-only">Not included</span>`;
const compareRow = (label: string, a: boolean, b: boolean, c: boolean) =>
  `<tr><td><a href="#" style="color: inherit; text-decoration-style: dotted">${label}</a></td><td>${a ? yes : no}</td><td>${b ? yes : no}</td><td>${c ? yes : no}</td></tr>`;

const pricing = `<div style="background: var(--m-color-bg-surface)">
<header class="m-navbar">
  <a class="m-navbar-brand" href="#">Ledgerline</a>
  <nav class="m-navbar-nav" aria-label="Main">
    <a class="m-navbar-link" href="#">Products ${icon(L['chevron-down'], 14)}</a>
    <a class="m-navbar-link" href="#">Solutions ${icon(L['chevron-down'], 14)}</a>
    <a class="m-navbar-link" href="#">Customers</a>
    <a class="m-navbar-link" href="#" aria-current="page">Pricing</a>
  </nav>
  <div class="m-navbar-actions">
    <a class="m-button" data-variant="ghost" href="#">Sign in</a>
    <a class="m-button" data-variant="primary" href="#">See a demo</a>
    <a class="m-button" href="#" style="background: var(--m-color-bg-inverse); border-color: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)">Get started</a>
  </div>
</header>
<main class="m-container" style="padding-block: var(--m-space-16)">
  <div class="m-stack" data-gap="16">
    <div class="m-stack" data-gap="4" data-align="center" style="text-align: center">
      <h1 style="font-family: var(--m-font-family-display); font-size: clamp(var(--m-font-size-3xl), 6vw, 4rem); font-weight: var(--m-font-heading-weight); letter-spacing: var(--m-font-tracking-tight); line-height: 1">Start free.<br>Grow without switching.</h1>
      <p style="font-size: var(--m-font-size-xl); ${muted}; max-inline-size: 34rem">Whether you have five people or five thousand, the plan scales with your team and never charges for cards.</p>
    </div>
    <div class="m-grid" style="--m-layout-grid-min: 18rem; --m-layout-grid-gap: var(--m-space-6); align-items: start">
${tier(
  'Essentials',
  'background: var(--m-color-bg-sunken)',
  'Free',
  '$0/mo per user',
  '',
  'For small teams that want to stop chasing receipts.',
  '<button type="button" class="m-button" style="inline-size: 100%; background: var(--m-color-bg-sunken); border-color: var(--m-color-bg-sunken)">Get started for free</button>',
  [
    ['Cards', ['Unlimited virtual and physical cards', 'Limits by merchant and category']],
    ['Expenses', ['Receipts by text or email', 'Automatic receipt matching']],
    ['Bill pay', ['Pay by ACH, card or check', 'Invoice reading']],
  ],
)}
${tier(
  'Most teams',
  'background: var(--m-button-primary-bg); color: var(--m-button-primary-fg)',
  'Plus',
  '$12/mo per user',
  '+ a platform fee by team size<br>Save 20% with yearly billing',
  'For teams that want approvals and books to run themselves.',
  '<button type="button" class="m-button" data-variant="primary" style="inline-size: 100%">Get started for free</button>',
  [
    [
      'Everything in Free, plus',
      ['Multi-step approvals', 'Purchase orders and three-way match', 'Accounting sync with custom fields'],
    ],
    ['Controls', ['Custom roles', 'Audit log', 'Entity-level permissions']],
  ],
  true,
)}
${tier(
  'Large companies',
  'background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)',
  'Enterprise',
  'Custom',
  'Billed yearly',
  'For companies with many entities, currencies and systems.',
  '<button type="button" class="m-button" style="inline-size: 100%; background: var(--m-color-bg-inverse); border-color: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)">Contact sales</button>',
  [
    ['Everything in Plus, plus', ['Local cards in 30+ countries', 'ERP integrations', 'A dedicated account team']],
    ['Support', ['Implementation plan', 'Priority support, any time']],
  ],
)}
    </div>
    <section class="m-stack" data-gap="4" aria-labelledby="bs-compare">
      <h2 id="bs-compare" style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-regular); letter-spacing: var(--m-font-tracking-tight); line-height: 1.1">Compare plans</h2>
      <div class="m-table-wrap" style="border: 0">
        <table class="m-table" style="font-size: var(--m-font-size-md)">
          <thead><tr><th style="font-size: var(--m-font-size-xl); color: var(--m-color-fg-default)">Cards</th><th style="font-size: var(--m-font-size-xl); color: var(--m-color-fg-default)">Free</th><th style="font-size: var(--m-font-size-xl); color: var(--m-color-fg-default)">Plus</th><th style="font-size: var(--m-font-size-xl); color: var(--m-color-fg-default)">Enterprise</th></tr></thead>
          <tbody>
            ${compareRow('Corporate charge card', true, true, true)}
            ${compareRow('Unlimited virtual cards', true, true, true)}
            ${compareRow('Merchant and category limits', true, true, true)}
            ${compareRow('Purchase orders', false, true, true)}
            ${compareRow('Local cards abroad', false, false, true)}
          </tbody>
        </table>
      </div>
    </section>
    <section class="m-stack" data-gap="4" aria-labelledby="bs-faq" style="max-inline-size: 48rem">
      <h2 id="bs-faq" style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-regular); letter-spacing: var(--m-font-tracking-tight); line-height: 1.1">Questions</h2>
      <div class="m-accordion" data-variant="separated">
        <details class="m-accordion-item" name="bs-faq" open><summary>Is it really free?</summary><div class="m-accordion-content">Yes. The Free plan has no monthly fee, no minimums and no card fees. We earn from the card network when you spend.</div></details>
        <details class="m-accordion-item" name="bs-faq"><summary>How is the platform fee set?</summary><div class="m-accordion-content">By the number of people who use the product each month, shown before you upgrade.</div></details>
        <details class="m-accordion-item" name="bs-faq"><summary>Can we switch plans later?</summary><div class="m-accordion-content">Any time. Upgrades apply at once; downgrades at the end of the billing period.</div></details>
      </div>
    </section>
  </div>
</main>
</div>`;

// Errors: under the field, a notice above the form, a toast, and full pages for 404, 500 and 403
const errorPage = (
  code: string,
  ic: string,
  title: string,
  body: string,
  actions: string,
) => `  <section class="m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-16); ${hair}" aria-labelledby="bs-err-${code}">
    <span class="m-avatar" data-size="lg" style="background: var(--m-color-bg-sunken); color: var(--m-color-fg-default)">${icon(ic, 20)}</span>
    <span style="${small}; ${muted}; font-family: var(--m-font-family-mono)">Error ${code}</span>
    <h1 id="bs-err-${code}" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-heading-weight); letter-spacing: var(--m-font-tracking-tight)">${title}</h1>
    <p style="${muted}; max-inline-size: 28rem">${body}</p>
    <div class="m-cluster" data-gap="2" data-justify="center">${actions}</div>
  </section>`;

const errors = `<main class="m-container" data-size="md" style="padding-block: var(--m-space-12)">
  <div class="m-stack" data-gap="12">
    <section class="m-stack" data-gap="6" aria-labelledby="bs-err-form">
      <div class="m-stack" data-gap="1">
        <span style="${eyebrow}">Bill pay</span>
        <h1 id="bs-err-form" style="${pageTitle}">New bill</h1>
      </div>
      <div class="m-alert" data-tone="danger" role="alert" style="background: var(--m-color-bg-surface)">
        <span class="m-alert-icon">${icon(L['octagon-alert'])}</span>
        <div class="m-alert-content"><div class="m-alert-title">2 fields need fixing</div><div class="m-alert-body">Nothing was scheduled. Check the routing number and the due date.</div></div>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="bs-err-routing" data-required>Routing number</label>
        <input class="m-input" data-size="lg" id="bs-err-routing" value="02100002" aria-invalid="true" aria-describedby="bs-err-routing-e" style="${num}">
        <p class="m-field-error" id="bs-err-routing-e">A routing number has 9 digits.</p>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="bs-err-due" data-required>Due date</label>
        <input class="m-input" data-size="lg" id="bs-err-due" value="Feb 30, 2026" aria-invalid="true" aria-describedby="bs-err-due-e">
        <p class="m-field-error" id="bs-err-due-e">February has 28 days in 2026. Pick a date on or before Feb 28.</p>
      </div>
      <div class="m-cluster" data-justify="between" style="${hair}; padding-block-start: var(--m-space-6)">
        <button type="button" class="m-button" data-variant="ghost" style="text-decoration: underline">Cancel</button>
        <div class="m-cluster" data-gap="2"><button type="button" class="m-button">Save draft</button><button type="submit" class="m-button" data-variant="primary">Schedule payment</button></div>
      </div>
    </section>
    <section class="m-stack" data-gap="3" aria-label="Notices and toasts">
      <table class="m-table" style="border: 0"><tbody><tr><td style="background: var(--m-color-danger-bg); color: var(--m-color-danger-fg)"><span class="m-cluster" data-gap="2">${icon(I.corner)} This bill may be a duplicate of <a href="#" style="color: inherit">INV 2041</a>. Make sure you’re not paying twice.</span></td></tr></tbody></table>
      <div class="m-toast-region" data-static>
        <div class="m-toast" data-tone="danger" role="alert" style="border-color: var(--m-color-danger-border); background: var(--m-color-danger-bg)"><div class="m-toast-content"><div class="m-toast-title" style="color: var(--m-color-danger-fg)">Payment to Harbor Freightways failed</div><div class="m-toast-body" style="color: var(--m-color-fg-default)">Their bank returned $4,310.00. Nothing else was sent.</div></div><button type="button" class="m-button" data-size="sm">View</button></div>
      </div>
    </section>
${errorPage('404', L.search, 'We can’t find that page', 'The link may be old, or the page has moved.', `<a class="m-button" data-variant="primary" href="#">Go home</a>`)}
${errorPage('500', L['triangle-alert'], 'Something went wrong on our side', 'Nothing was changed. Try again in a moment; if it keeps happening, contact support.', `<button type="button" class="m-button" data-variant="primary">Try again</button><button type="button" class="m-button">Contact support</button>`)}
${errorPage('403', I.lock, 'You don’t have access to this', 'Only admins at Tidewater Studio can see bank accounts. Ask one for access.', `<button type="button" class="m-button" data-variant="primary">Request access</button><a class="m-button" href="#">Go back</a>`)}
  </div>
</main>`;

export const basaltRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'A greeting, a hairline panel of balances with small charts, task tabs, and approval rows; the lime action and funds on the right.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'Eyebrow, big title and actions over underline tabs with counts, a toolbar of pill controls and a two-line table; a row opens a statement page with a notice and the decision.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'A full-page flow: a bar with the step and a round close button, a 768px column, a big title, an info notice, square fields, Cancel, Save draft and a lime Continue.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'Tabs under a big title; square panels of labelled values with Edit buttons, a panel of green switches, and closing the account last.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'The page keeps its title, tabs and lime action; a quiet panel holds a round icon, a heading, one sentence and two buttons.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'Three rounded tier panels with a tag on the top edge, the middle one ringed in lime; grouped feature lists, a comparison table with green checks, and questions.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors under the field, a notice above the form that says nothing was scheduled, an inline duplicate warning, a toast, and full pages for 404, 500 and no access.',
    html: errors,
  },
];
