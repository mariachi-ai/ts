import type { ArchetypeRecipe } from '../types';

/*
 * Ember's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from a made-up everyday bank ("tally"). They follow the
 * language's real screen patterns: a pale mint screen with white 16px cards, grouped list rows with
 * hairlines that start after the icon, amounts with small pence (and no currency sign in lists),
 * money in shown green with a plus, heavy wide headings, blue pill actions with pale pill
 * secondaries, round icon buttons in the top bar, and navy slabs for account cards and dead ends.
 */

// Lucide icons, outlined, 2px stroke
const icon = (paths: string, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  trends: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  payments: '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  pot: '<path d="M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z"/><path d="M16 10h.01"/><path d="M2 8v1a2 2 0 0 0 2 2h1"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  gear: '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  plusCircle: '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  bank: '<path d="M10 18v-7"/><path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/>',
  calendar:
    '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  file: '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  snowflake:
    '<path d="m10 20-1.25-2.5L6 18"/><path d="M10 4 8.75 6.5 6 6"/><path d="m14 20 1.25-2.5L18 18"/><path d="m14 4 1.25 2.5L18 6"/><path d="m17 21-3-6h-4"/><path d="m17 3-3 6 1.5 3"/><path d="M2 12h6.5L10 9"/><path d="m20 10-1.5 2 1.5 2"/><path d="M22 12h-6.5L14 15"/><path d="m4 10 1.5 2L4 14"/><path d="m7 21 3-6-1.5-3"/><path d="m7 3 3 6h4"/>',
  receipt:
    '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  split:
    '<path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/>',
  note: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  train:
    '<path d="M8 3.1V7a4 4 0 0 0 8 0V3.1"/><path d="m9 15-1-1"/><path d="m15 15 1-1"/><path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z"/><path d="m8 19-2 3"/><path d="m16 19 2 3"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  xCircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  alert:
    '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/>',
  sparkles:
    '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>',
  logout: '<path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>',
};

// Money: the pound sign and the pence small, on the baseline. Lists leave the sign off.
const small = (s: string) => `<span style="font-size: 0.7em">${s}</span>`;
const gbp = (pounds: string, pence: string, sign = '') => `${sign}${small('£')}${pounds}${small(`.${pence}`)}`;
const amt = (pounds: string, pence: string) => `${pounds}${small(`.${pence}`)}`;
const num = 'font-variant-numeric: tabular-nums';
const figure = `font-family: var(--m-font-family-display); font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-tight); ${num}`;
const heavy =
  'font-family: var(--m-font-family-display); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)';
const pageTitle = `${heavy}; font-size: var(--m-font-size-2xl)`;
const label = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
const gain = 'color: var(--m-color-success-fg)';
const hair = 'border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)';
const cardTitle = 'font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-semibold)';

// A round icon tile: the app's coloured squares behind row icons, softened to the tone's wash
const tile = (ic: string, tone = 'accent', size = 40) => {
  const [bg, fg] =
    tone === 'accent'
      ? ['var(--m-color-accent-subtle)', 'var(--m-color-accent-text)']
      : [`var(--m-color-${tone}-bg)`, `var(--m-color-${tone}-fg)`];
  return `<span aria-hidden="true" style="display: inline-grid; place-items: center; flex: none; inline-size: ${size}px; block-size: ${size}px; border-radius: 12px; background: ${bg}; color: ${fg}">${icon(ic, Math.round(size / 2))}</span>`;
};
// A merchant: a rounded square with initials, in one of the pastel pairs
const merchant = (initials: string, tone = '') => {
  const style =
    tone === ''
      ? 'border-radius: 12px'
      : tone === 'accent'
        ? 'border-radius: 12px; background: var(--m-color-accent-subtle); color: var(--m-color-accent-text)'
        : `border-radius: 12px; background: var(--m-color-${tone}-bg); color: var(--m-color-${tone}-fg)`;
  return `<span class="m-avatar" style="${style}" aria-hidden="true">${initials}</span>`;
};

const nav = (items: [keyof typeof I, string][], current: string) =>
  items
    .map(
      ([ic, l]) =>
        `        <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${icon(I[ic], 20)} ${l}</a></li>`,
    )
    .join('\n');

const shell = (
  current: string,
  main: string,
  size = '',
) => `<div class="m-split" style="--m-layout-split-side: 15rem; --m-layout-split-gap: 0; min-block-size: 100vh">
  <nav class="m-sidebar" aria-label="Main">
    <div class="m-stack" data-gap="6">
      <a href="#" style="${heavy}; font-size: var(--m-font-size-xl); color: var(--m-color-fg-default); text-decoration: none; padding-inline: var(--m-space-4)">tally</a>
      <div class="m-cluster" data-gap="2" style="padding-inline: var(--m-space-2)">
        <span class="m-avatar">PS</span>
        <button type="button" class="m-button" data-variant="secondary" data-size="sm">Upgrade</button>
      </div>
      <div class="m-sidebar-section">
        <ul>
${nav(
  [
    ['home', 'Home'],
    ['trends', 'Trends'],
    ['payments', 'Payments'],
    ['pot', 'Savings'],
    ['card', 'Cards'],
  ],
  current,
)}
        </ul>
      </div>
      <div class="m-sidebar-section">
        <ul>
${nav(
  [
    ['gear', 'Settings'],
    ['help', 'Help'],
  ],
  current,
)}
        </ul>
      </div>
    </div>
  </nav>
  <div class="m-stack" data-gap="0">
    <header class="m-cluster" data-justify="end" data-gap="2" style="padding: var(--m-space-4) var(--m-space-6)">
      <button type="button" class="m-button" data-variant="secondary" data-icon-only aria-label="Rewards">${icon(I.gift, 20)}</button>
      <button type="button" class="m-button" data-variant="secondary" data-icon-only aria-label="Search">${icon(I.search, 20)}</button>
      <button type="button" class="m-button" data-variant="primary" data-icon-only aria-label="Add">${icon(I.plus, 22)}</button>
    </header>
    <main class="m-container"${size ? ` data-size="${size}"` : ''} style="padding-block: var(--m-space-2) var(--m-space-16)">
${main}
    </main>
  </div>
</div>`;

// Spotlights: small white tiles with a figure, a label and one detail
const spotlight = (
  ic: string,
  fig: string,
  lbl: string,
  extra: string,
  figStyle = '',
) => `          <section class="m-card" data-size="sm">
            <div class="m-card-body m-stack" data-gap="1">
              <div class="m-cluster" data-justify="end" style="color: var(--m-color-fg-subtle)">${icon(ic, 18)}</div>
              <span style="${figure}; font-weight: var(--m-font-weight-semibold); font-size: var(--m-font-size-lg)${figStyle}">${fig}</span>
              <span style="${label}">${lbl}</span>
              ${extra}
            </div>
          </section>`;

// An activity row: the hairline starts after the merchant, as in the app
const activity = (m: string, name: string, sub: string, value: string, inflow = false, last = false) =>
  `                <li class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${m}<span class="m-cluster" data-justify="between" data-gap="3" style="flex: 1; flex-wrap: nowrap; padding-block: var(--m-space-3)${last ? '' : `; ${hair}`}"><span class="m-stack" data-gap="0"><span>${name}</span>${sub ? `<span style="${label}">${sub}</span>` : ''}</span><span style="${num}; font-size: var(--m-font-size-lg)${inflow ? `; ${gain}` : ''}">${value}</span></span></li>`;

// Spending over six months: rounded bars, this month in the action blue
const months = [
  ['Jun', 62],
  ['Jul', 78],
  ['Aug', 70],
  ['Sep', 88],
  ['Oct', 74],
  ['Nov', 52],
] as const;
const bars = `<svg viewBox="0 0 300 124" width="100%" style="display: block; block-size: auto" role="img" aria-label="Spending by month, June to November; November so far £1,286">
${months.map(([m, v], i) => `              <rect x="${i * 50 + 12}" y="${100 - v}" width="26" height="${v}" rx="6" style="fill: ${i === months.length - 1 ? 'var(--m-color-accent-default)' : 'var(--m-color-border-default)'}"/><text x="${i * 50 + 25}" y="120" text-anchor="middle" style="fill: var(--m-color-fg-muted); font-size: 11px">${m}</text>`).join('\n')}
            </svg>`;

const category = (tone: string, name: string, value: string) =>
  `<li class="m-cluster" data-justify="between"><span class="m-cluster" data-gap="2"><span aria-hidden="true" style="inline-size: 0.625rem; block-size: 0.625rem; border-radius: 9999px; background: ${tone}"></span>${name}</span><span style="${num}">${value}</span></li>`;

const pot = (name: string, saved: string, of: string, pct: number, last = false) =>
  `                <li class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${tile(I.pot, 'accent')}<span class="m-stack" data-gap="1" style="flex: 1; padding-block: var(--m-space-3)${last ? '' : `; ${hair}`}"><span class="m-cluster" data-justify="between"><span>${name}</span><span style="${num}">${saved}</span></span><progress class="m-progress" value="${pct}" max="100" aria-label="${name}: ${pct}% of ${of}">${pct}%</progress><span style="${label}">of ${of}</span></span></li>`;

const dashboard = shell(
  'Home',
  `      <div class="m-stack" data-gap="6">
        <h1 style="${pageTitle}">Morning, Priya</h1>
        <div class="m-grid" style="--m-layout-grid-min: 9.5rem; --m-layout-grid-gap: var(--m-space-3)">
${spotlight(I.bank, gbp('1,345', '88'), 'Personal balance', `<span style="${label}">Account and pots</span>`)}
${spotlight(I.calendar, gbp('123', '45'), 'Total upcoming', `<span style="${label}">3 payments this week</span>`)}
${spotlight(I.trends, gbp('567', '89'), 'Left to spend', '<meter class="m-meter" min="0" max="100" low="20" high="60" optimum="100" value="64" aria-label="64% of your budget left">64%</meter>', `; ${gain}`)}
${spotlight(I.pot, gbp('2,140', '00'), 'In savings pots', `<span style="${label}">3 pots</span>`)}
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 22rem; --m-layout-grid-gap: var(--m-space-4); align-items: start">
          <div class="m-stack" data-gap="4">
            <!-- The account: a navy card with the balance large and its pence small -->
            <section class="m-card" style="background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)" aria-labelledby="em-acct">
              <div class="m-card-body m-stack" data-gap="6">
                <div class="m-cluster" data-justify="between" data-align="start">
                  <h2 id="em-acct" style="${heavy}; font-size: var(--m-font-size-xl)">Current account</h2>
                  <div class="m-stack" data-gap="0" style="text-align: end">
                    <span style="${figure}; font-size: var(--m-font-size-3xl); line-height: 1">${gbp('1,234', '56')}</span>
                    <span style="font-size: var(--m-font-size-sm); opacity: 0.85">Balance</span>
                  </div>
                </div>
                <span class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-sm); opacity: 0.85; ${num}">${icon(I.bank, 16)} 04-00-04 · 12345678</span>
                <div class="m-cluster" data-justify="between">
                  <div class="m-cluster" data-gap="2">
                    <button type="button" class="m-button" data-variant="secondary" data-size="sm">${icon(I.plusCircle, 18)} Add money</button>
                    <button type="button" class="m-button" data-variant="secondary" data-size="sm">${icon(I.card, 18)} Card</button>
                  </div>
                  <button type="button" class="m-button" data-variant="secondary" data-size="sm" data-icon-only aria-label="More for this account">${icon(I.more, 18)}</button>
                </div>
              </div>
            </section>
            <section class="m-card" aria-labelledby="em-activity">
              <div class="m-card-body m-stack" data-gap="2">
                <div class="m-cluster" data-justify="between">
                  <h2 id="em-activity" style="${cardTitle}">Activity</h2>
                  <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Activity options">${icon(I.more, 18)}</button>
                </div>
                <a href="#" class="m-cluster" data-justify="between" data-gap="3" style="flex-wrap: nowrap; padding: var(--m-space-3); border-radius: 12px; background: var(--m-color-bg-sunken); color: inherit; text-decoration: none">
                  <span class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${tile(I.calendar, 'accent')}<span class="m-stack" data-gap="0"><span>3 upcoming payments</span><span style="${label}">Tomorrow</span></span></span>
                  <span style="${num}; font-size: var(--m-font-size-lg); color: var(--m-color-fg-muted)">${amt('47', '83')}</span>
                </a>
                <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
${activity(merchant('GC', 'accent'), 'Greenline Cabs', '', amt('26', '00'))}
${activity(merchant('MT', 'info'), 'Metro Transit', 'Travel charge for Monday, 9 Nov', amt('5', '80'))}
${activity(merchant('SL', 'success'), 'Sam Lee', 'Thanks for dinner', `+${amt('12', '49')}`, true)}
${activity(merchant('BB', 'warning'), 'Bean &amp; Barley', 'Coffee', amt('3', '40'), false, true)}
                </ul>
                <div><a class="m-button" data-variant="ghost" data-size="sm" href="#" style="padding-inline: 0">See all</a></div>
              </div>
            </section>
          </div>
          <div class="m-stack" data-gap="4">
            <section class="m-card" aria-labelledby="em-spent">
              <div class="m-card-body m-stack" data-gap="3">
                <div class="m-cluster" data-justify="between" data-align="start">
                  <div class="m-stack" data-gap="0">
                    <h2 id="em-spent" style="${label}; font-weight: var(--m-font-weight-regular)">Spent this month</h2>
                    <span style="${figure}; font-weight: var(--m-font-weight-semibold); font-size: var(--m-font-size-2xl)">${gbp('1,286', '40')}</span>
                  </div>
                  <span class="m-badge" data-tone="success">On track</span>
                </div>
                ${bars}
                <ul class="m-stack" data-gap="2" style="padding: 0; list-style: none; padding-block-start: var(--m-space-2)">
                  ${category('var(--m-color-danger-border)', 'Eating out', '£312.20')}
                  ${category('var(--m-color-accent-default)', 'Bills', '£540.00')}
                  ${category('var(--m-color-warning-solid)', 'Groceries', '£268.75')}
                  ${category('var(--m-color-success-solid)', 'Transport', '£165.45')}
                </ul>
              </div>
            </section>
            <section class="m-card" aria-labelledby="em-pots">
              <div class="m-card-body m-stack" data-gap="1">
                <div class="m-cluster" data-justify="between">
                  <h2 id="em-pots" style="${cardTitle}">Pots</h2>
                  <button type="button" class="m-button" data-variant="secondary" data-size="sm">${icon(I.plus, 16)} New pot</button>
                </div>
                <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
${pot('Holiday', '£420.00', '£1,200', 35)}
${pot('Rainy day', '£1,500.00', '£2,000', 75)}
${pot('New laptop', '£220.00', '£900', 24, true)}
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>`,
);

// Transactions: grouped by day in white cards, a segmented filter, and a detail panel beside
const tx = (m: string, name: string, sub: string, value: string, inflow = false, last = false, current = false) =>
  `              <li><a href="#" class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding-inline: var(--m-space-3); margin-inline: calc(var(--m-space-3) * -1); border-radius: 12px; color: inherit; text-decoration: none${current ? '; background: var(--m-color-bg-sunken)' : ''}"${current ? ' aria-current="true"' : ''}>${m}<span class="m-cluster" data-justify="between" data-gap="3" style="flex: 1; flex-wrap: nowrap; padding-block: var(--m-space-3)${last ? '' : `; ${hair}`}"><span class="m-stack" data-gap="0"><span>${name}</span><span style="${label}">${sub}</span></span><span style="${num}; font-size: var(--m-font-size-lg)${inflow ? `; ${gain}` : ''}">${value}</span></span></a></li>`;

const day = (
  title: string,
  total: string,
  rows: string,
) => `          <section class="m-stack" data-gap="2" aria-label="${title}">
            <div class="m-cluster" data-justify="between" style="padding-inline: var(--m-space-1)"><h2 style="font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-semibold); color: var(--m-color-fg-muted)">${title}</h2><span style="${label}; ${num}">${total}</span></div>
            <div class="m-card" style="padding-block: var(--m-space-2)"><div class="m-card-body"><ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
${rows}
            </ul></div></div>
          </section>`;

const detailRow = (left: string, right: string, last = false) =>
  `                <li class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${left}<span class="m-cluster" data-justify="between" data-gap="3" style="flex: 1; flex-wrap: nowrap; padding-block: var(--m-space-3)${last ? '' : `; ${hair}`}">${right}</span></li>`;

const listDetail = shell(
  'Payments',
  `      <div class="m-grid" style="--m-layout-grid-min: 24rem; --m-layout-grid-gap: var(--m-space-6); align-items: start">
        <div class="m-stack" data-gap="5">
          <h1 style="${pageTitle}">Transactions</h1>
          <div class="m-stack" data-gap="3" role="search">
            <input class="m-input" type="search" placeholder="Search transactions" aria-label="Search transactions">
            <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Show">
              <button type="button" class="m-tab" role="tab" aria-selected="true">All</button>
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Money in</button>
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Money out</button>
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Pots</button>
            </div></div>
          </div>
${day(
  'Today',
  '−£35.20',
  [
    tx(merchant('GC', 'accent'), 'Greenline Cabs', 'Transport · 18:42', amt('26', '00'), false, false, true),
    tx(merchant('BB', 'warning'), 'Bean &amp; Barley', 'Eating out · 08:15', amt('3', '40')),
    tx(merchant('MT', 'info'), 'Metro Transit', 'Travel charge for Monday, 9 Nov', amt('5', '80'), false, true),
  ].join('\n'),
)}
${day(
  'Yesterday',
  '+£1,962.30',
  [
    tx(merchant('NW', 'success'), 'Northwind Studio', 'Salary', `+${amt('2,050', '00')}`, true),
    tx(merchant('SL', 'success'), 'Sam Lee', 'Thanks for dinner', `+${amt('12', '49')}`, true),
    tx(merchant('HM'), 'Harbour Market', 'Groceries', amt('64', '19')),
    tx(merchant('HL', 'accent'), 'Holiday pot', 'Moved to a pot', amt('36', '00'), false, true),
  ].join('\n'),
)}
        </div>

        <!-- The detail: the merchant, the amount large, actions as pale pills, then grouped rows -->
        <section class="m-stack" data-gap="4" aria-labelledby="em-tx-title">
          <div class="m-card">
            <div class="m-card-body m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-8)">
              <span class="m-avatar" data-size="lg" style="border-radius: 16px; background: var(--m-color-accent-subtle); color: var(--m-color-accent-text)" aria-hidden="true">GC</span>
              <div class="m-stack" data-gap="1">
                <h2 id="em-tx-title" style="${heavy}; font-size: var(--m-font-size-xl)">Greenline Cabs</h2>
                <span style="${label}">Today at 18:42 · London</span>
              </div>
              <span style="${figure}; font-size: var(--m-font-size-3xl); line-height: 1">${gbp('26', '00')}</span>
              <div class="m-cluster" data-gap="2" data-justify="center">
                <button type="button" class="m-button" data-variant="secondary" data-size="sm">${icon(I.split, 16)} Split bill</button>
                <button type="button" class="m-button" data-variant="secondary" data-size="sm">${icon(I.receipt, 16)} Add receipt</button>
                <button type="button" class="m-button" data-variant="secondary" data-size="sm">${icon(I.note, 16)} Add note</button>
              </div>
            </div>
          </div>
          <div class="m-card" style="padding-block: var(--m-space-2)">
            <div class="m-card-body">
              <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
${detailRow(tile(I.train, 'info'), `<span class="m-stack" data-gap="0"><span>Category</span><span style="${label}">Transport</span></span><span style="color: var(--m-color-fg-subtle); display: inline-flex">${icon(I.right, 18)}</span>`)}
${detailRow(tile(I.tag, 'accent'), `<span class="m-stack" data-gap="0"><span>Add tags</span><span style="${label}">#work #travel</span></span><span style="color: var(--m-color-fg-subtle); display: inline-flex">${icon(I.right, 18)}</span>`)}
${detailRow(tile(I.trends, 'accent'), `<label for="em-exclude" style="flex: 1">Leave out of budget</label><input class="m-switch" id="em-exclude" type="checkbox" role="switch">`, true)}
              </ul>
            </div>
          </div>
          <div class="m-card" style="padding-block: var(--m-space-2)">
            <div class="m-card-body">
              <dl class="m-stack" data-gap="0">
                <div class="m-cluster" data-justify="between" style="padding-block: var(--m-space-3); ${hair}"><dt style="color: var(--m-color-fg-muted)">Card</dt><dd>Personal debit ··4417</dd></div>
                <div class="m-cluster" data-justify="between" style="padding-block: var(--m-space-3); ${hair}"><dt style="color: var(--m-color-fg-muted)">Status</dt><dd><span class="m-badge" data-tone="success">Paid</span></dd></div>
                <div class="m-cluster" data-justify="between" style="padding-block: var(--m-space-3)"><dt style="color: var(--m-color-fg-muted)">Reference</dt><dd style="font-family: var(--m-font-family-mono); font-size: var(--m-font-size-sm)">GLC-88213-UK</dd></div>
              </dl>
            </div>
          </div>
          <div><a class="m-button" data-variant="ghost" href="#">${icon(I.help, 18)} Something wrong with this payment?</a></div>
        </section>
      </div>`,
);

const onboarding = `<main class="m-container" data-size="sm" style="padding-block: var(--m-space-12)">
  <div class="m-stack" data-gap="8">
    <a href="#" style="${heavy}; font-size: var(--m-font-size-xl); color: var(--m-color-fg-default); text-decoration: none">tally</a>
    <form class="m-card" data-size="lg" style="box-shadow: var(--m-shadow-sm)" aria-labelledby="em-onb-title">
      <div class="m-card-body m-stack" data-gap="6">
        <div class="m-stack" data-gap="2">
          <span style="${label}" id="em-onb-step">Step 2 of 4</span>
          <progress class="m-progress" data-size="sm" value="2" max="4" aria-labelledby="em-onb-step">2 of 4</progress>
        </div>
        <div class="m-stack" data-gap="3" style="text-align: center">
          <h1 id="em-onb-title" style="${heavy}; font-size: var(--m-font-size-2xl)">Tell us about you</h1>
          <p class="m-muted">We need these to open your account. It takes about two minutes.</p>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 9rem; --m-layout-grid-gap: var(--m-space-4)">
          <div class="m-field">
            <label class="m-field-label" for="em-onb-first">First name</label>
            <input class="m-input" id="em-onb-first" value="Priya" autocomplete="given-name">
          </div>
          <div class="m-field">
            <label class="m-field-label" for="em-onb-last">Last name</label>
            <input class="m-input" id="em-onb-last" value="Shah" autocomplete="family-name">
          </div>
        </div>
        <fieldset class="m-field" style="border: 0; padding: 0; margin: 0" aria-describedby="em-onb-dob-error">
          <legend class="m-field-label" style="margin-block-end: var(--m-space-2)">Date of birth</legend>
          <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap">
            <input class="m-input" style="inline-size: 4.5rem; ${num}" value="14" inputmode="numeric" aria-label="Day" aria-invalid="true">
            <input class="m-input" style="inline-size: 4.5rem; ${num}" value="03" inputmode="numeric" aria-label="Month" aria-invalid="true">
            <input class="m-input" style="inline-size: 6.5rem; ${num}" value="2010" inputmode="numeric" aria-label="Year" aria-invalid="true">
          </div>
          <p class="m-field-error" id="em-onb-dob-error">You need to be 18 or over to open this account.</p>
        </fieldset>
        <div class="m-field">
          <label class="m-field-label" for="em-onb-email">Email</label>
          <input class="m-input" id="em-onb-email" type="email" placeholder="you@example.com" aria-describedby="em-onb-email-hint">
          <p class="m-field-hint" id="em-onb-email-hint">We'll send you a secure link to finish signing up.</p>
        </div>
        <button type="submit" class="m-button" data-variant="primary" style="inline-size: 100%">Continue</button>
        <p style="text-align: center">Already have an account? <a href="#" style="color: var(--m-color-accent-text); font-weight: var(--m-font-weight-bold); text-decoration: none">Log in</a></p>
      </div>
    </form>
    <div class="m-alert" data-tone="info" role="note">
      <span class="m-alert-icon">${icon(I.info, 20)}</span>
      <div class="m-alert-content"><div class="m-alert-body">Your money is protected up to £85,000 by the deposit guarantee scheme.</div></div>
    </div>
  </div>
</main>`;

// Settings: grouped white cards, each row an icon tile, a label and help, and a control or a chevron
const setRow = (ic: string, tone: string, name: string, desc: string, control: string, last = false) =>
  `              <li class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${tile(ic, tone)}<span class="m-cluster" data-justify="between" data-gap="3" style="flex: 1; flex-wrap: nowrap; padding-block: var(--m-space-3)${last ? '' : `; ${hair}`}"><span class="m-stack" data-gap="0">${name}${desc ? `<span style="${label}">${desc}</span>` : ''}</span>${control}</span></li>`;
const chevron = (value = '') =>
  `<span class="m-cluster" data-gap="1" style="color: var(--m-color-fg-muted); flex-wrap: nowrap">${value}<span style="color: var(--m-color-fg-subtle); display: inline-flex">${icon(I.right, 18)}</span></span>`;
const toggle = (id: string, on: boolean, name: string) =>
  `<input class="m-switch" id="${id}" type="checkbox" role="switch"${on ? ' checked' : ''} aria-label="${name}">`;
const group = (id: string, title: string, rows: string) => `          <section class="m-card" aria-labelledby="${id}">
            <div class="m-card-body m-stack" data-gap="1" style="padding-block-end: var(--m-space-2)">
              <h2 id="${id}" style="${cardTitle}">${title}</h2>
              <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
${rows}
              </ul>
            </div>
          </section>`;
const theme = (value: string, title: string, desc: string, checked = false, last = false) =>
  `              <li><label class="m-cluster" data-justify="between" data-gap="3" style="flex-wrap: nowrap; padding-block: var(--m-space-3)${last ? '' : `; ${hair}`}"><span class="m-stack" data-gap="0"><span>${title}</span>${desc ? `<span style="${label}">${desc}</span>` : ''}</span><input class="m-radio" type="radio" name="em-theme" value="${value}"${checked ? ' checked' : ''}></label></li>`;

const settings = shell(
  'Settings',
  `      <div class="m-stack" data-gap="4">
        <h1 style="${pageTitle}">Settings</h1>
        <section class="m-card" aria-label="Your account">
          <div class="m-card-body m-cluster" data-gap="4" style="flex-wrap: nowrap">
            <span class="m-avatar" data-size="lg">PS</span>
            <div class="m-stack" data-gap="1" style="flex: 1">
              <span style="${heavy}; font-size: var(--m-font-size-xl)">Priya Shah</span>
              <span style="${label}; ${num}">Personal account · 04-00-04 · 12345678</span>
            </div>
            <button type="button" class="m-button" data-variant="secondary" data-size="sm">${icon(I.copy, 16)} Copy details</button>
          </div>
        </section>
${group(
  'em-set-account',
  'Account',
  [
    setRow(I.user, 'accent', 'Personal details', 'Name, address, phone and email', chevron()),
    setRow(I.file, 'accent', 'Statements', 'Monthly PDFs and spreadsheet exports', chevron()),
    setRow(I.sparkles, 'warning', 'Your plan', '', chevron('Everyday'), true),
  ].join('\n'),
)}
${group(
  'em-set-security',
  'Privacy and security',
  [
    setRow(I.lock, 'accent', 'Change your PIN', '', chevron()),
    setRow(
      I.shield,
      'success',
      '<label for="em-sw-face">Log in with Face ID</label>',
      '',
      toggle('em-sw-face', true, 'Log in with Face ID'),
    ),
    setRow(
      I.snowflake,
      'info',
      '<label for="em-sw-freeze">Freeze card</label>',
      'Stops card payments until you unfreeze it',
      toggle('em-sw-freeze', false, 'Freeze card'),
      true,
    ),
  ].join('\n'),
)}
${group(
  'em-set-notify',
  'Notifications',
  [
    setRow(
      I.bell,
      'accent',
      '<label for="em-sw-spend">Every payment</label>',
      'A notification as soon as you pay',
      toggle('em-sw-spend', true, 'Every payment'),
    ),
    setRow(
      I.calendar,
      'accent',
      '<label for="em-sw-upcoming">Upcoming payments</label>',
      'A day before a bill leaves',
      toggle('em-sw-upcoming', true, 'Upcoming payments'),
      true,
    ),
  ].join('\n'),
)}
          <section class="m-card" aria-labelledby="em-set-theme">
            <div class="m-card-body m-stack" data-gap="1" style="padding-block-end: var(--m-space-2)">
              <h2 id="em-set-theme" style="${cardTitle}">Theme</h2>
              <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none" role="radiogroup" aria-labelledby="em-set-theme">
${theme('light', 'Light', '')}
${theme('dark', 'Dark', '')}
${theme('device', 'Use device settings', 'Follows the light or dark setting on your device', true, true)}
              </ul>
            </div>
          </section>
        <section class="m-card" aria-labelledby="em-close">
          <div class="m-card-body m-stack" data-gap="3">
            <h2 id="em-close" style="${cardTitle}">Close your account</h2>
            <p class="m-muted">Move your balance of £1,234.56 out first. We'll cancel your card and any regular payments. You can't undo this.</p>
            <div class="m-cluster" data-gap="2">
              <button type="button" class="m-button" data-variant="danger">Close account</button>
              <a class="m-button" data-variant="ghost" href="#">${icon(I.logout, 18)} Log out</a>
            </div>
          </div>
        </section>
      </div>`,
  'md',
);

const emptyState = shell(
  'Savings',
  `      <div class="m-stack" data-gap="5">
        <h1 style="${pageTitle}">Savings</h1>
        <section class="m-card" data-size="lg" aria-labelledby="em-empty">
          <div class="m-card-body m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-12)">
            <span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: 6rem; block-size: 6rem; border-radius: 9999px; background: var(--m-color-accent-subtle); color: var(--m-color-accent-text)">${icon(I.pot, 44)}</span>
            <h2 id="em-empty" style="${heavy}; font-size: var(--m-font-size-xl)">No pots yet</h2>
            <p class="m-muted" style="max-inline-size: 26rem">Pots keep money for something apart from your spending, like a holiday or a rainy day. Set a goal and watch it fill.</p>
            <div class="m-cluster" data-gap="2" data-justify="center">
              <button type="button" class="m-button" data-variant="primary">${icon(I.plus, 18)} Create a pot</button>
              <button type="button" class="m-button" data-variant="secondary">How pots work</button>
            </div>
          </div>
        </section>
      </div>`,
  'md',
);

// Pricing: the public site. A white bar, a heavy headline, three plan cards, then a comparison
// table under a heavy heading, with green ticks and grey crosses
const yes = `<span style="color: var(--m-color-success-solid); display: inline-flex" role="img" aria-label="Included">${icon(I.checkCircle, 20)}</span>`;
const no = `<span style="color: var(--m-color-fg-subtle); display: inline-flex" role="img" aria-label="Not included">${icon(I.xCircle, 20)}</span>`;
const plan = (
  name: string,
  price: string,
  note: string,
  intro: string,
  features: string[],
  popular = false,
) => `      <section class="m-card" data-size="lg" aria-labelledby="em-plan-${name.toLowerCase()}"${popular ? ' style="box-shadow: var(--m-shadow-lg)"' : ''}>
        <div class="m-card-body m-stack" data-gap="5">
          <div class="m-stack" data-gap="2">
            <div class="m-cluster" data-justify="between"><h2 id="em-plan-${name.toLowerCase()}" style="${heavy}; font-size: var(--m-font-size-2xl)">${name}</h2>${popular ? '<span class="m-badge" data-tone="info">Most popular</span>' : ''}</div>
            <p style="font-size: var(--m-font-size-lg)">${intro}</p>
            <p style="${label}">${price} · ${note}</p>
          </div>
          <ul class="m-stack" data-gap="2" style="padding: 0; list-style: none">
${features.map((f) => `            <li class="m-cluster" data-gap="2" style="flex-wrap: nowrap; align-items: start"><span style="color: var(--m-color-success-solid); display: inline-flex; flex: none">${icon(I.check, 20)}</span>${f}</li>`).join('\n')}
          </ul>
          <div><a class="m-button" data-variant="primary" href="#">Get ${name}</a></div>
        </div>
      </section>`;
const cmp = (feature: string, cells: string[]) =>
  `            <tr><th scope="row" style="font-weight: var(--m-font-weight-regular); border-inline-end: var(--m-border-width-thin) solid var(--m-color-border-default)"><span class="m-cluster" data-justify="between" data-gap="2" style="flex-wrap: nowrap">${feature}<span style="color: var(--m-color-fg-default); display: inline-flex">${icon(I.info, 16)}</span></span></th>${cells.map((c) => `<td style="text-align: center">${c}</td>`).join('')}</tr>`;
const cmpGroup = (title: string) =>
  `            <tr><th scope="rowgroup" colspan="4" style="padding-block-start: var(--m-space-6)">${title}</th></tr>`;

const pricing = `<header class="m-navbar">
  <a class="m-navbar-brand" href="#">tally</a>
  <nav class="m-navbar-nav" aria-label="Main">
    <a class="m-navbar-link" href="#" aria-current="page">${icon(I.user, 18)} Personal</a>
    <a class="m-navbar-link" href="#">${icon(I.card, 18)} Business</a>
  </nav>
  <div class="m-navbar-actions">
    <a class="m-button" data-variant="secondary" href="#">Log in</a>
    <a class="m-button" data-variant="primary" href="#" style="--m-button-primary-bg: var(--m-color-bg-inverse); --m-button-primary-border: var(--m-color-bg-inverse); --m-button-primary-fg: var(--m-color-fg-inverse); --m-button-primary-hover-bg: var(--m-color-bg-inverse)">Sign up</a>
  </div>
</header>
<main class="m-container" style="padding-block: var(--m-space-12) var(--m-space-16)">
  <div class="m-stack" data-gap="16">
    <div class="m-stack" data-gap="4" style="max-inline-size: 40rem">
      <h1 style="${heavy}; font-size: var(--m-font-size-4xl)">Make your account work a bit harder</h1>
      <p style="font-size: var(--m-font-size-lg)">Everyday banking is free. Add a plan for more tools, cashback and cover. Change or cancel any time in the app.</p>
      <p style="${label}">UK residents aged 18+. Terms apply.</p>
    </div>
    <div class="m-grid" style="--m-layout-grid-min: 18rem; --m-layout-grid-gap: var(--m-space-4); align-items: stretch">
${plan('Everyday', 'Free', 'Aged 16+', 'The account, the card and the app, with no monthly fee.', ['Instant spending notifications', 'Pots for saving', 'Fee-free spending abroad', 'Split bills with anyone'])}
${plan('Plus', '£3 a month', 'Aged 18+', 'Tools to see all your money in one place, and save more of it.', ['Everything in Everyday', 'Connect your other banks', 'Custom spending categories', 'Higher interest on savings'], true)}
${plan('Premier', '£15 a month', 'Aged 18 to 69', 'Worldwide travel and phone cover, plus everything in Plus.', ['Everything in Plus', 'Worldwide travel insurance', 'Phone insurance', 'Priority support'])}
    </div>
    <section class="m-stack" data-gap="6" aria-labelledby="em-compare">
      <div class="m-stack" data-gap="2" style="text-align: center">
        <h2 id="em-compare" style="${heavy}; font-size: var(--m-font-size-3xl)">Compare the plans</h2>
        <p class="m-muted">Every plan, side by side.</p>
      </div>
      <div class="m-table-wrap">
        <table class="m-table">
          <thead>
            <tr><th scope="col" style="inline-size: 34%"><span class="m-sr-only">Feature</span></th>
${['Everyday', 'Plus', 'Premier'].map((n, i) => `              <th scope="col" style="text-align: center"><div class="m-stack" data-gap="2" data-align="center"><a class="m-button" data-variant="primary" data-size="sm" href="#">Get ${n}</a><span style="font-weight: var(--m-font-weight-regular)">${['Free', '£3 a month', '£15 a month'][i]}</span></div></th>`).join('\n')}
            </tr>
          </thead>
          <tbody>
${cmpGroup('Everyday banking')}
${cmp('A current account and card', [yes, yes, yes])}
${cmp('Fee-free spending abroad', [yes, yes, yes])}
${cmp('Savings pots', [yes, yes, yes])}
${cmpGroup('Money tools')}
${cmp('Connected banks and cards', ['One', yes, yes])}
${cmp('Custom categories', [no, yes, yes])}
${cmp('Virtual cards', [no, yes, yes])}
${cmpGroup('Cover')}
${cmp('Worldwide travel insurance', [no, no, yes])}
${cmp('Phone insurance', [no, no, yes])}
          </tbody>
        </table>
      </div>
    </section>
    <section class="m-stack" data-gap="4" aria-labelledby="em-faq" style="max-inline-size: 45rem; margin-inline: auto; inline-size: 100%">
      <h2 id="em-faq" style="${heavy}; font-size: var(--m-font-size-2xl)">Common questions</h2>
      <div class="m-accordion" data-variant="separated">
        <details class="m-accordion-item" name="em-faq" open><summary>Can I change plans later?</summary><div class="m-accordion-content">Yes. Upgrade any time and it starts straight away; downgrade and your plan runs to the end of the month you've paid for.</div></details>
        <details class="m-accordion-item" name="em-faq"><summary>Is there a minimum term?</summary><div class="m-accordion-content">Everyday and Plus are monthly. Premier has a three-month minimum, because the insurance starts as soon as you join.</div></details>
        <details class="m-accordion-item" name="em-faq"><summary>What happens to my pots if I downgrade?</summary><div class="m-accordion-content">Nothing. Your pots and the money in them stay exactly where they are.</div></details>
      </div>
    </section>
  </div>
</main>
<footer style="background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse); border-start-start-radius: 20px; border-start-end-radius: 20px; padding: var(--m-space-8) var(--m-layout-container-padding)">
  <div class="m-stack" data-gap="3" style="max-inline-size: var(--m-layout-container-max-lg); margin-inline: auto">
    <span style="${heavy}; font-size: var(--m-font-size-xl)">tally</span>
    <p style="font-size: var(--m-font-size-sm); opacity: 0.85">tally is a made-up bank used to show this design. Plans and prices are examples.</p>
  </div>
</footer>`;

// Errors: on the field, a notice above the form, a navy toast, and whole pages: the navy dead end
// for not found, white cards for failure and no access
const errorCard = (
  code: string,
  ic: string,
  tone: string,
  title: string,
  body: string,
  actions: string,
) => `    <section class="m-card" data-size="lg" aria-labelledby="em-err-${code}">
      <div class="m-card-body m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-10)">
        <span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: 5rem; block-size: 5rem; border-radius: 9999px; background: ${tone === 'accent' ? 'var(--m-color-accent-subtle)' : `var(--m-color-${tone}-bg)`}; color: ${tone === 'accent' ? 'var(--m-color-accent-text)' : `var(--m-color-${tone}-fg)`}">${icon(ic, 36)}</span>
        <span style="${label}; font-family: var(--m-font-family-mono)">${code}</span>
        <h2 id="em-err-${code}" style="${heavy}; font-size: var(--m-font-size-xl)">${title}</h2>
        <p class="m-muted" style="max-inline-size: 28rem">${body}</p>
        <div class="m-cluster" data-gap="2" data-justify="center">${actions}</div>
      </div>
    </section>`;

const errors = `<main class="m-container" data-size="md" style="padding-block: var(--m-space-12)">
  <div class="m-stack" data-gap="10">
    <form class="m-card" data-size="lg" aria-labelledby="em-err-form">
      <div class="m-card-body m-stack" data-gap="5">
        <h1 id="em-err-form" style="${pageTitle}">Pay someone new</h1>
        <div class="m-alert" data-tone="danger" role="alert">
          <span class="m-alert-icon">${icon(I.alert, 20)}</span>
          <div class="m-alert-content"><div class="m-alert-title">Check the details below</div><div class="m-alert-body">Two things need fixing. We haven't sent anything.</div></div>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="em-err-name">Name on the account</label>
          <input class="m-input" id="em-err-name" value="Sam Lee">
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 12rem; --m-layout-grid-gap: var(--m-space-4)">
          <div class="m-field">
            <label class="m-field-label" for="em-err-sort">Sort code</label>
            <input class="m-input" id="em-err-sort" value="04-00-0" aria-invalid="true" aria-describedby="em-err-sort-e" style="${num}">
            <p class="m-field-error" id="em-err-sort-e">Sort codes have 6 digits, like 04-00-04.</p>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="em-err-acct">Account number</label>
            <input class="m-input" id="em-err-acct" value="12345678" style="${num}">
          </div>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="em-err-amount">Amount</label>
          <input class="m-input" id="em-err-amount" value="£1,500.00" aria-invalid="true" aria-describedby="em-err-amount-e" style="${num}; font-size: var(--m-font-size-xl)">
          <p class="m-field-error" id="em-err-amount-e">You have £1,234.56 in your account. Move money from a pot or pay less.</p>
        </div>
        <div class="m-cluster" data-justify="between">
          <button type="button" class="m-button" data-variant="ghost">Cancel</button>
          <button type="submit" class="m-button" data-variant="primary">Continue</button>
        </div>
      </div>
    </form>
    <section class="m-stack" data-gap="3" aria-label="A toast">
      <div class="m-toast" data-tone="danger" role="alert"><div class="m-toast-content"><div class="m-toast-title">Your payment to Sam didn't go through</div><div class="m-toast-body">The £12.49 is back in your account.</div></div><button type="button" class="m-button" data-variant="secondary" data-size="sm">Try again</button></div>
    </section>
    <section class="m-card" style="background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)" aria-labelledby="em-err-404">
      <div class="m-card-body m-stack" data-gap="4" style="padding: var(--m-space-12) var(--m-space-10)">
        <span style="${heavy}; font-size: var(--m-font-size-4xl); line-height: 1">404</span>
        <h2 id="em-err-404" style="${heavy}; font-size: var(--m-font-size-xl); max-inline-size: 22rem">Sorry, we can't find the page you're looking for</h2>
        <div><a class="m-button" data-variant="secondary" href="#">${icon(I.home, 18)} Go to Home</a></div>
      </div>
    </section>
${errorCard('500', I.alert, 'danger', 'Something went wrong on our side', 'Nothing has changed in your account. Try again in a minute; if it keeps happening, message us from Help.', `<button type="button" class="m-button" data-variant="primary">Try again</button><a class="m-button" data-variant="secondary" href="#">${icon(I.help, 18)} Get help</a>`)}
${errorCard('403', I.lock, 'accent', 'Only account holders can see this', 'This is part of a joint account. Ask the other account holder to add you, then log in again.', `<button type="button" class="m-button" data-variant="primary">Ask for access</button><a class="m-button" data-variant="ghost" href="#">${icon(I.back, 18)} Back</a>`)}
  </div>
</main>`;

export const emberRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'A heavy greeting, small spotlight tiles, the account as a navy card with the balance large, an Activity card of rows, spending bars and pots.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'Search and a segmented filter above transactions grouped by day in white cards; the open one sits beside as a centred header, pale pill actions and grouped rows.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One white card on the mint screen: a thin progress bar, a heavy centred title, one question per field, a full-width blue pill and a log-in line.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'The profile card, then grouped white cards of rows: an icon tile, a label and help, and a chevron, a switch or a radio. Closing the account comes last.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'A large icon in a pale blue circle, a heavy heading, one friendly sentence, a blue pill and a pale pill.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The public site: a white bar with pill links, a heavy headline, three plan cards, a comparison table with green ticks and grey crosses, questions, and a navy footer.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Red field errors under the field, a notice above the form that says nothing was sent, a navy toast, the navy not-found page, and white cards for failure and no access.',
    html: errors,
  },
];
