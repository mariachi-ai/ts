import type { ArchetypeRecipe } from '../types';

/*
 * Onyx's seven page shapes: framework-free HTML using only @mariachi/design classes and tokens (no
 * colour literals), with invented content from a made-up money app, "Kestrel". The reference is a
 * phone app, so these translate its screens to the desktop the way its tablet layout does: a side
 * menu on the grouped grey, a round search field on top, a hero balance set huge with small cents,
 * round action buttons with labels underneath, and white 16px widgets holding list rows with round
 * icons, grey second lines and amounts on the right.
 */

// Lucide icons, outlined, 2px stroke (the reference's own glyphs are filled, with about a 2px weight)
const icon = (paths: string, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  transfer: '<path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/>',
  vault: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="12" r="3.5"/><path d="M12 8.5V7m0 10v-1.5M15.5 12H17M7 12h1.5"/>',
  trend: '<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C9.5 3 12 8 12 8s2.5-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 13h4"/><path d="M10 17h4"/>',
  key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
  phone: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  coffee: '<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  train: '<rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><path d="M8 15h.01"/><path d="M16 15h.01"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  split: '<path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  rotate: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
};

const t = {
  // Page titles and section heads: the display face, heavy and tight
  page: 'font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)',
  h2: 'font-family: var(--m-font-family-display); font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight)',
  // Subheaders above a widget: 14px grey
  sub: 'font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-medium); color: var(--m-color-fg-subtle)',
  second: 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-subtle)',
  title: 'font-weight: var(--m-font-weight-medium)',
  num: 'font-variant-numeric: tabular-nums; white-space: nowrap',
  gain: 'color: var(--m-color-success-fg)',
};

// A balance set huge, with the cents at half size on the same baseline: $12,480.52
const money = (whole: string, cents: string) =>
  `${whole}<span style="font-size: 0.5em; letter-spacing: 0">.${cents}</span>`;
const hero =
  'font-family: var(--m-font-family-display); font-size: var(--m-font-size-4xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: 1; font-variant-numeric: tabular-nums';

// A round icon: the grey fill for neutral things, the action background for actions
const disc = (ic: string, size = '2.5rem', tone: 'neutral' | 'accent' | 'danger' | 'success' = 'neutral') => {
  const bg = {
    neutral: 'var(--m-color-border-muted)',
    accent: 'var(--m-color-accent-subtle)',
    danger: 'var(--m-color-danger-bg)',
    success: 'var(--m-color-success-bg)',
  }[tone];
  const fg = {
    neutral: 'var(--m-color-fg-default)',
    accent: 'var(--m-color-accent-text)',
    danger: 'var(--m-color-danger-fg)',
    success: 'var(--m-color-success-fg)',
  }[tone];
  return `<span style="display: inline-grid; place-items: center; flex: none; inline-size: ${size}; block-size: ${size}; border-radius: 9999px; background: ${bg}; color: ${fg}">${ic}</span>`;
};

// A list row inside a widget: a round icon, a title and a grey second line, the value on the right
const row = (lead: string, title: string, second: string, end: string, selected = false) =>
  `<li class="m-cluster" data-justify="between" data-gap="4" style="flex-wrap: nowrap; padding: var(--m-space-3) var(--m-space-4)${selected ? '; background: var(--m-color-bg-sunken)" aria-current="true' : ''}">
                <span class="m-cluster" data-gap="4" style="flex-wrap: nowrap; min-inline-size: 0">${lead}<span class="m-stack" data-gap="0" style="min-inline-size: 0"><span style="${t.title}">${title}</span><span style="${t.second}">${second}</span></span></span>
                <span class="m-stack" data-gap="0" data-align="end" style="text-align: end">${end}</span>
              </li>`;
const list = (rows: string[]) =>
  `<ul class="m-stack" data-gap="0" style="padding: 0; margin: 0; list-style: none">
              ${rows.join('\n              ')}
            </ul>`;

// A round action button with its label underneath
const action = (ic: string, label: string, variant = '') =>
  `<span class="m-stack" data-gap="2" data-align="center" style="min-inline-size: 4.25rem"><button type="button" class="m-button"${variant} data-size="lg" data-icon-only aria-label="${label}">${icon(ic, 22)}</button><span style="font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-medium)">${label}</span></span>`;

const navItem = (ic: string, label: string, current: string, extra = '') =>
  `          <li><a class="m-sidebar-link" href="#"${label === current ? ' aria-current="page"' : ''}>${icon(I[ic as keyof typeof I], 20)} ${label}${extra}</a></li>`;

const shell = (current: string, main: string, width = '') => `<div class="m-split" style="--m-layout-split-side: 15.5rem; --m-layout-split-gap: 0; min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  <nav class="m-sidebar" aria-label="Main">
    <a href="#" class="m-cluster" data-gap="3" style="padding: var(--m-space-3) var(--m-space-4) var(--m-space-5); color: var(--m-color-fg-default); text-decoration: none; flex-wrap: nowrap">
      <span class="m-avatar">MO</span>
      <span class="m-stack" data-gap="0"><span style="font-weight: var(--m-font-weight-semibold)">Maya Okafor</span><span style="${t.second}">Personal</span></span>
    </a>
    <div class="m-sidebar-section">
      <ul>
${[
  ['home', 'Home'],
  ['transfer', 'Payments'],
  ['card', 'Cards'],
  ['vault', 'Vaults'],
  ['trend', 'Invest'],
  ['gift', 'Perks', ' <span class="m-sidebar-count">2</span>'],
]
  .map(([ic, l, x]) => navItem(ic, l, current, x))
  .join('\n')}
      </ul>
    </div>
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Insights</h2>
      <ul>
${[
  ['chart', 'Spending'],
  ['users', 'Contacts'],
]
  .map(([ic, l]) => navItem(ic, l, current))
  .join('\n')}
      </ul>
    </div>
    <div class="m-sidebar-section">
      <ul>
${[
  ['help', 'Help'],
  ['gear', 'Settings'],
]
  .map(([ic, l]) => navItem(ic, l, current))
  .join('\n')}
      </ul>
    </div>
  </nav>
  <div class="m-stack" data-gap="0">
    <header class="m-cluster" data-justify="between" data-gap="3" style="padding: var(--m-space-3) var(--m-space-6); flex-wrap: nowrap">
      <label class="m-cluster" data-gap="2" style="flex: 1; max-inline-size: 30rem; flex-wrap: nowrap; position: relative">
        <span class="m-sr-only">Search</span>
        <span style="position: absolute; inset-inline-start: var(--m-space-3); color: var(--m-color-fg-subtle); display: inline-flex">${icon(I.search, 18)}</span>
        <input class="m-input" data-size="sm" type="search" placeholder="Search" style="border-radius: 9999px; padding-inline-start: var(--m-space-10)">
      </label>
      <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap">
        <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Spending">${icon(I.chart, 20)}</button>
        <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Notifications">${icon(I.bell, 20)}</button>
      </div>
    </header>
    <main class="m-container"${width} style="padding-block: var(--m-space-6) var(--m-space-16)">
${main}
    </main>
  </div>
</div>`;

// Spending by week: the current bar in the action colour, the rest in the grey fill
const bars = [38, 52, 44, 70, 61, 48, 82, 57];
const barChart = `<div role="img" aria-label="Spending by week: highest this week at $412" class="m-cluster" data-gap="2" data-align="end" style="flex-wrap: nowrap; block-size: 7rem">
              ${bars.map((h, i) => `<span style="flex: 1; block-size: ${h}%; border-radius: var(--m-radius-sm); background: ${i === bars.length - 2 ? 'var(--m-color-accent-default)' : 'var(--m-color-border-muted)'}"></span>`).join('')}
            </div>`;

const dashboard = shell(
  'Home',
  `      <div class="m-stack" data-gap="6">
        <!-- The hero: the action colour fading into the brand black, the balance huge and centred -->
        <section class="m-stack" data-gap="3" data-align="center" aria-labelledby="ox-balance" style="padding: var(--m-space-16) var(--m-space-6) var(--m-space-12); border-radius: var(--m-radius-lg); background: linear-gradient(180deg, var(--m-color-accent-default), var(--m-color-brand-default)); color: var(--m-color-brand-fg); text-align: center">
          <span id="ox-balance" style="font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-medium)">Personal · USD</span>
          <span style="${hero}">${money('$12,480', '52')}</span>
          <button type="button" class="m-button" data-size="sm">All balances</button>
        </section>
        <div class="m-cluster" data-gap="4" data-justify="center">
          ${action(I.plus, 'Top up')}
          ${action(I.transfer, 'Transfer')}
          ${action(I.card, 'Card')}
          ${action(I.more, 'Options')}
        </div>
        <!-- The web app's account cards, under accent underline tabs -->
        <div class="m-tabs"><div class="m-tab-list" role="tablist" aria-label="Overview">
          <button type="button" class="m-tab" role="tab" aria-selected="true">Balances</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Activity</button>
        </div></div>
        <div class="m-grid" style="--m-layout-grid-min: 14rem">
          <section class="m-card" aria-label="US dollar" style="padding: var(--m-space-6)">
            <div class="m-cluster" data-justify="between" data-align="start" style="flex-wrap: nowrap"><span class="m-stack" data-gap="0"><span style="${t.title}">US dollar</span><span style="${t.second}">USD</span></span>${disc('<span style="font-weight: var(--m-font-weight-bold)">$</span>', '2.5rem', 'accent')}</div>
            <span style="margin-block-start: var(--m-space-6); font-family: var(--m-font-family-display); font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold); ${t.num}">${money('$9,214', '30')}</span>
          </section>
          <section class="m-card" aria-label="Euro" style="padding: var(--m-space-6)">
            <div class="m-cluster" data-justify="between" data-align="start" style="flex-wrap: nowrap"><span class="m-stack" data-gap="0"><span style="${t.title}">Euro</span><span style="${t.second}">EUR</span></span>${disc('<span style="font-weight: var(--m-font-weight-bold)">€</span>', '2.5rem', 'success')}</div>
            <span style="margin-block-start: var(--m-space-6); font-family: var(--m-font-family-display); font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold); ${t.num}">${money('€1,806', '12')}</span>
          </section>
          <section class="m-card" aria-label="Mexican peso" style="padding: var(--m-space-6)">
            <div class="m-cluster" data-justify="between" data-align="start" style="flex-wrap: nowrap"><span class="m-stack" data-gap="0"><span style="${t.title}">Mexican peso</span><span style="${t.second}">MXN</span></span>${disc('<span style="font-weight: var(--m-font-weight-bold)">$</span>', '2.5rem', 'neutral')}</div>
            <span style="margin-block-start: var(--m-space-6); font-family: var(--m-font-family-display); font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold); ${t.num}">${money('MX$2,940', '00')}</span>
          </section>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 20rem">
          <section class="m-card" aria-labelledby="ox-recent" style="padding: var(--m-space-4) 0 var(--m-space-2)">
            <div class="m-card-body m-stack" data-gap="2">
              <h2 id="ox-recent" style="${t.sub}; padding-inline: var(--m-space-4)">Recent</h2>
              ${list([
                row(disc(icon(I.coffee), '2.5rem', 'danger'), 'Harbor Roasters', 'Today, 08:42', `<span style="${t.num}">−$6.40</span>`),
                row(
                  `<span class="m-avatar">JL</span>`,
                  'From Jonah Lee',
                  'Yesterday, 19:05 · Dinner',
                  `<span style="${t.num}; ${t.gain}">+$38.00</span>`,
                ),
                row(disc(icon(I.train), '2.5rem', 'accent'), 'Metro Transit', 'Yesterday, 07:58', `<span style="${t.num}">−$2.90</span>`),
                row(
                  disc(icon(I.zap), '2.5rem', 'accent'),
                  'Power bill',
                  'Scheduled · Nov 18',
                  `<span style="${t.num}">−$71.15</span>`,
                ),
              ])}
              <a href="#" style="align-self: center; padding: var(--m-space-2) var(--m-space-4); color: var(--m-color-accent-text); font-weight: var(--m-font-weight-medium); text-decoration: none">View all</a>
            </div>
          </section>
          <div class="m-stack" data-gap="4">
            <section class="m-card" aria-labelledby="ox-spent">
              <div class="m-card-body m-stack" data-gap="4">
                <div class="m-stack" data-gap="1">
                  <h2 id="ox-spent" style="${t.sub}">Spent this month</h2>
                  <span style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold); ${t.num}">${money('$1,946', '30')}</span>
                </div>
                ${barChart}
              </div>
            </section>
            <section class="m-card" aria-labelledby="ox-vault">
              <div class="m-card-body m-stack" data-gap="3">
                <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap">
                  <span class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${disc(icon(I.vault), '2.5rem', 'accent')}<span class="m-stack" data-gap="0"><span id="ox-vault" style="${t.title}">Rainy day vault</span><span style="${t.second}">4.10% a year, paid daily</span></span></span>
                  <span class="m-stack" data-gap="0" data-align="end"><span style="${t.num}; ${t.title}">$3,205.00</span><span style="font-size: var(--m-font-size-sm); ${t.gain}; ${t.num}">+$0.36 today</span></span>
                </div>
                <progress class="m-progress" value="64" max="100" aria-label="64% of the $5,000 goal">64%</progress>
                <span style="${t.second}">64% of $5,000</span>
              </div>
            </section>
          </div>
        </div>
      </div>`,
);

const tx = (lead: string, who: string, second: string, amount: string, inflow = false, selected = false) =>
  row(lead, who, second, `<span style="${t.num}${inflow ? `; ${t.gain}` : ''}">${amount}</span>`, selected);

const detailRow = (label: string, value: string) =>
  `<div class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-4); flex-wrap: nowrap"><dt style="color: var(--m-color-fg-subtle)">${label}</dt><dd style="text-align: end">${value}</dd></div>`;

const listDetail = shell(
  'Payments',
  `      <div class="m-stack" data-gap="6">
        <div class="m-cluster" data-justify="between">
          <h1 style="${t.page}">Transactions</h1>
          <button type="button" class="m-button" data-size="sm">${icon(I.file, 16)} Statements</button>
        </div>
        <label style="position: relative; display: block">
          <span class="m-sr-only">Search transactions</span>
          <span style="position: absolute; inset-inline-start: var(--m-space-4); inset-block-start: 50%; translate: 0 -50%; color: var(--m-color-fg-subtle); display: inline-flex">${icon(I.search, 20)}</span>
          <input class="m-input" type="search" placeholder="Search transactions" style="background: var(--m-color-bg-surface); border-radius: var(--m-radius-md); padding-inline-start: var(--m-space-12)">
        </label>
        <div class="m-cluster" data-gap="2" role="search">
          <select class="m-select" data-size="sm" aria-label="Account" style="border-radius: 9999px"><option>All accounts</option><option>Personal</option><option>Shared</option></select>
          <select class="m-select" data-size="sm" aria-label="Category" style="border-radius: 9999px"><option>Category</option></select>
          <select class="m-select" data-size="sm" aria-label="Date" style="border-radius: 9999px"><option>November</option></select>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(22rem, 100%), 1fr)); gap: var(--m-space-6); align-items: start">
          <!-- The list: grouped by day, each day a white widget -->
          <div class="m-stack" data-gap="3">
            <div class="m-cluster" data-justify="between" style="padding-inline: var(--m-space-1)"><h2 style="${t.sub}">Today</h2><span style="${t.sub}; ${t.num}">−$70.60</span></div>
            <section class="m-card" aria-label="Today" style="padding: var(--m-space-2) 0">
              ${list([
                tx(disc(icon(I.cart), '2.5rem', 'success'), 'Fernwood Market', '12:14 · Groceries', '−$64.20', false, true),
                tx(disc(icon(I.coffee), '2.5rem', 'danger'), 'Harbor Roasters', '08:42 · Card ··4021', '−$6.40'),
              ])}
            </section>
            <div class="m-cluster" data-justify="between" style="padding-inline: var(--m-space-1)"><h2 style="${t.sub}">Monday, Nov 9</h2><span style="${t.sub}; ${t.num}">+$1,815.10</span></div>
            <section class="m-card" aria-label="Monday, Nov 9" style="padding: var(--m-space-2) 0">
              ${list([
                tx('<span class="m-avatar">JL</span>', 'From Jonah Lee', '19:05 · Dinner', '+$38.00', true),
                tx(disc(icon(I.train), '2.5rem', 'accent'), 'Metro Transit', '07:58 · Card ··4021', '−$2.90'),
                tx(disc(icon(I.file), '2.5rem', 'success'), 'Pinecrest Labs', '06:00 · Salary', '+$1,780.00', true),
              ])}
            </section>
          </div>

          <!-- The detail: a side panel, the amount large, round actions, then label-and-value rows -->
          <aside class="m-stack" data-gap="4" aria-labelledby="ox-detail">
            <section class="m-card">
              <div class="m-card-body m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block-end: var(--m-space-2)">
                <div class="m-cluster" data-justify="end" style="align-self: stretch; margin-block-end: calc(var(--m-space-8) * -1)"><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Close">${icon(I.x, 18)}</button></div>
                ${disc(icon(I.cart, 28), '3.5rem')}
                <div class="m-stack" data-gap="1">
                  <span style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); ${t.num}">−${money('$64', '20')}</span>
                  <h2 id="ox-detail" style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-medium)">Fernwood Market</h2>
                  <span style="${t.second}">Today, 12:14</span>
                </div>
                <div class="m-cluster" data-gap="4" data-justify="center">
                  ${action(I.split, 'Split')}
                  ${action(I.repeat, 'Repeat')}
                  ${action(I.receipt, 'Receipt')}
                </div>
              </div>
            </section>
            <section class="m-card" aria-label="Details" style="padding: var(--m-space-2) 0">
              <dl class="m-stack" data-gap="0">
                ${detailRow('Status', '<span class="m-badge" data-tone="success">Completed</span>')}
                ${detailRow('Card', 'Virtual ··4021')}
                ${detailRow('Category', '<select class="m-select" data-size="sm" aria-label="Category" style="border-radius: 9999px"><option>Groceries</option><option>Eating out</option></select>')}
                ${detailRow('Exchange rate', '<span style="font-variant-numeric: tabular-nums">No exchange</span>')}
              </dl>
            </section>
            <section class="m-card" aria-label="Help" style="padding: var(--m-space-2) 0">
              <ul class="m-stack" data-gap="0" style="padding: 0; margin: 0; list-style: none">
                <li><a href="#" class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-4); color: var(--m-color-fg-default); text-decoration: none">Get help with this payment ${icon(I.right, 18)}</a></li>
                <li><a href="#" class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-4); color: var(--m-color-danger-fg); text-decoration: none">Report a problem ${icon(I.right, 18)}</a></li>
              </ul>
            </section>
          </aside>
        </div>
      </div>`,
);

const onboarding = `<main class="m-container" data-size="sm" style="padding-block: var(--m-space-6) var(--m-space-12); min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  <form class="m-stack" data-gap="6" aria-labelledby="ox-onb-title">
    <div class="m-cluster" data-gap="4" style="flex-wrap: nowrap">
      <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Back">${icon(I.back, 20)}</button>
      <progress class="m-progress" value="2" max="5" aria-label="Step 2 of 5" style="flex: 1">2 of 5</progress>
    </div>
    <div class="m-stack" data-gap="2">
      <h1 id="ox-onb-title" style="${t.page}">Tell us about you</h1>
      <p class="m-muted">Use your name exactly as it's printed on your ID. It takes about two minutes.</p>
    </div>
    <div class="m-stack" data-gap="4">
      <div class="m-grid" style="--m-layout-grid-min: 10rem; --m-layout-grid-gap: var(--m-space-3)">
        <div class="m-field">
          <label class="m-field-label" for="ox-onb-first">First name</label>
          <input class="m-input" id="ox-onb-first" value="Maya" autocomplete="given-name">
        </div>
        <div class="m-field">
          <label class="m-field-label" for="ox-onb-last">Last name</label>
          <input class="m-input" id="ox-onb-last" value="Okafor" autocomplete="family-name">
        </div>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="ox-onb-dob">Date of birth</label>
        <input class="m-input" id="ox-onb-dob" placeholder="MM / DD / YYYY" inputmode="numeric" aria-describedby="ox-onb-dob-hint">
        <p class="m-field-hint" id="ox-onb-dob-hint">You need to be 18 or older to open an account.</p>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="ox-onb-country">Country of residence</label>
        <select class="m-select" id="ox-onb-country"><option>United States</option><option>Canada</option><option>Mexico</option></select>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="ox-onb-email">Email</label>
        <input class="m-input" id="ox-onb-email" type="email" value="maya.okafor@" aria-invalid="true" aria-describedby="ox-onb-email-e">
        <p class="m-field-error" id="ox-onb-email-e">Add the part after the @, like maya@example.com.</p>
      </div>
    </div>
    <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Continue</button>
    <p style="${t.second}; text-align: center">By continuing you agree to the account terms. We'll never share your details without asking.</p>
  </form>
</main>`;

// A settings row: an icon, the label (and a grey line), then the value, a chevron or a switch
const setting = (
  ic: string,
  label: string,
  second: string,
  end: string,
  href = true,
  tone: 'neutral' | 'accent' | 'danger' | 'success' = 'neutral',
) => {
  const inner = `<span class="m-cluster" data-gap="4" style="flex-wrap: nowrap; min-inline-size: 0">${disc(icon(ic, 20), '2.5rem', tone)}<span class="m-stack" data-gap="0"><span style="${t.title}">${label}</span>${second ? `<span style="${t.second}">${second}</span>` : ''}</span></span><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap; color: var(--m-color-fg-subtle)">${end}</span>`;
  return href
    ? `<li><a href="#" class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding: var(--m-space-3) var(--m-space-4); color: var(--m-color-fg-default); text-decoration: none">${inner}</a></li>`
    : `<li><label class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding: var(--m-space-3) var(--m-space-4)">${inner}</label></li>`;
};
const group = (title: string, items: string[]) => `        <section class="m-stack" data-gap="2" aria-label="${title}">
          <h2 style="${t.sub}; padding-inline: var(--m-space-1)">${title}</h2>
          <div class="m-card" style="padding: var(--m-space-2) 0"><ul class="m-stack" data-gap="0" style="padding: 0; margin: 0; list-style: none">
            ${items.join('\n            ')}
          </ul></div>
        </section>`;
const chev = icon(I.right, 18);
const sw = (label: string, on: boolean) =>
  `<input class="m-switch" type="checkbox" role="switch" aria-label="${label}"${on ? ' checked' : ''}>`;

const settings = shell(
  'Settings',
  `      <div class="m-stack" data-gap="6">
        <div class="m-stack" data-gap="3" data-align="center" style="text-align: center; padding-block: var(--m-space-4)">
          <span class="m-avatar" data-size="lg" style="inline-size: 4.75rem; block-size: 4.75rem; font-size: var(--m-font-size-xl)">MO</span>
          <div class="m-stack" data-gap="1" data-align="center">
            <h1 style="${t.page}">Maya Okafor</h1>
            <span style="${t.second}">@mayaok · Member since 2021</span>
          </div>
          <span class="m-badge" data-variant="solid">Signature</span>
        </div>
        <div class="m-cluster" data-gap="4" data-justify="center">
          ${action(I.lock, 'Freeze cards')}
          ${action(I.phone, 'Sign out all')}
          ${action(I.help, 'Get help')}
        </div>
${group('Account', [
  setting(I.user, 'Personal details', 'Name, address, email', chev, true, 'accent'),
  setting(I.globe, 'Plan', 'Signature · renews Dec 3', chev, true, 'success'),
  setting(I.file, 'Documents and statements', '', chev),
])}
${group('Security', [
  setting(I.key, 'Passcode', 'Changed 4 months ago', chev, true, 'accent'),
  setting(I.scan, 'Sign in with your face', 'Instead of the passcode', sw('Sign in with your face', true), false, 'success'),
  setting(I.pin, 'Location-based security', 'Blocks card payments far from your phone', sw('Location-based security', false), false, 'danger'),
  setting(I.phone, 'Devices', '', `<span style="${t.num}">2</span> ${chev}`),
])}
${group('Notifications', [
  setting(I.bell, 'Payment alerts', 'Every card payment, as it happens', sw('Payment alerts', true), false, 'accent'),
  setting(I.calendar, 'Weekly summary', 'Sundays at 6 pm', sw('Weekly summary', true), false, 'success'),
])}
        <section class="m-stack" data-gap="2" aria-label="Close account">
          <div class="m-card"><div class="m-card-body m-cluster" data-justify="between" data-gap="4">
            <span class="m-stack" data-gap="0"><span style="${t.title}">Close account</span><span style="${t.second}">Move your $12,480.52 out first. Cards stop working at once.</span></span>
            <button type="button" class="m-button" data-variant="danger" data-size="sm">Close account</button>
          </div></div>
        </section>
      </div>`,
  ' data-size="md"',
);

const emptyState = `<main class="m-container" data-size="md" style="padding-block: var(--m-space-16); min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  <section class="m-card" aria-labelledby="ox-empty" style="padding: var(--m-space-12) var(--m-space-6)">
    <div class="m-card-body m-stack" data-gap="4" data-align="center" style="text-align: center">
      ${disc(icon(I.calendar, 28), '3.5rem', 'accent')}
      <div class="m-stack" data-gap="2" data-align="center">
        <h1 id="ox-empty" style="${t.h2}">No scheduled payments</h1>
        <p class="m-muted" style="max-inline-size: 24rem">Set up rent, bills or pocket money once, and they go out on the day, every time.</p>
      </div>
      <div class="m-cluster" data-gap="2" data-justify="center">
        <button type="button" class="m-button" data-variant="primary">${icon(I.plus, 18)} Schedule a payment</button>
        <button type="button" class="m-button">How it works</button>
      </div>
    </div>
  </section>
</main>`;

const plan = (
  name: string,
  price: string,
  note: string,
  features: string[],
  cta: string,
  primary = false,
  tag = '',
) => `      <section class="m-card" data-size="lg" aria-labelledby="ox-plan-${name.toLowerCase()}">
        <div class="m-card-body m-stack" data-gap="5">
          <div class="m-stack" data-gap="2">
            <div class="m-cluster" data-justify="between"><h2 id="ox-plan-${name.toLowerCase()}" style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold)">${name}</h2>${tag ? `<span class="m-badge" data-tone="accent">${tag}</span>` : ''}</div>
            <span class="m-cluster" data-gap="1" data-align="baseline"><span style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); ${t.num}">${price}</span><span style="${t.second}">/month</span></span>
            <p class="m-muted">${note}</p>
          </div>
          <button type="button" class="m-button"${primary ? ' data-variant="primary"' : ''} data-size="lg" style="inline-size: 100%">${cta}</button>
          <ul class="m-stack" data-gap="3" style="padding: 0; margin: 0; list-style: none">
${features.map((f) => `            <li class="m-cluster" data-gap="3" style="flex-wrap: nowrap; align-items: start"><span style="color: var(--m-color-accent-text); display: inline-flex; flex: none">${icon(I.check, 18)}</span>${f}</li>`).join('\n')}
          </ul>
        </div>
      </section>`;

const pricing = `<div style="background: var(--m-color-bg-canvas); min-block-size: 100vh">
  <!-- The brand band: black, with the heavy all-caps display heading -->
  <section style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg); padding: var(--m-space-16) var(--m-space-6) var(--m-space-12)" aria-labelledby="ox-price-title">
    <div class="m-stack" data-gap="5" data-align="center" style="text-align: center; max-inline-size: 48rem; margin-inline: auto">
      <h1 id="ox-price-title" style="font-family: var(--m-font-family-display); font-size: clamp(var(--m-font-size-2xl), 6vw, var(--m-font-size-4xl)); font-weight: 900; text-transform: uppercase; line-height: 1; letter-spacing: 0">Pick the plan<br>that moves you</h1>
      <p style="font-size: var(--m-font-size-lg); max-inline-size: 32rem">Every plan starts with a free account and a card. Upgrade for more travel, more interest and more cover.</p>
      <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Billing">
        <button type="button" class="m-tab" role="tab" aria-selected="true">Monthly</button>
        <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Yearly · 2 months free</button>
      </div></div>
    </div>
  </section>
  <main class="m-container" style="padding-block: var(--m-space-10) var(--m-space-16)">
    <div class="m-stack" data-gap="12">
      <div class="m-grid" style="--m-layout-grid-min: 15rem; align-items: start">
${plan('Starter', '$0', 'The account, a card and free transfers at home.', ['A virtual and a physical card', 'Free transfers to anyone in the US', 'Spending insights'], 'Get started')}
${plan('Boost', '$4.50', 'More free withdrawals and better rates abroad.', ['Everything in Starter', 'Three free cash withdrawals a month', 'Exchange 30+ currencies on weekdays'], 'Get Boost')}
${plan('Signature', '$11', 'Higher interest, travel cover and priority help.', ['Everything in Boost', '4.10% a year on vaults', 'Delayed flight and baggage cover', 'Chat with priority support'], 'Get Signature', true, 'Most picked')}
${plan('Summit', '$21', 'Our highest rates, a steel card and lounge passes.', ['Everything in Signature', 'Four lounge passes a year', 'Cashback on card spending abroad'], 'Get Summit')}
      </div>
      <section class="m-stack" data-gap="4" aria-labelledby="ox-faq" style="max-inline-size: 48rem; margin-inline: auto; inline-size: 100%">
        <h2 id="ox-faq" style="${t.page}">Questions</h2>
        <div class="m-accordion">
          <details class="m-accordion-item" name="ox-faq" open><summary>Can I switch plans whenever I like?</summary><div class="m-accordion-content">Yes. Upgrades start straight away; a downgrade takes effect when your current month ends.</div></details>
          <details class="m-accordion-item" name="ox-faq"><summary>What happens to my vault interest if I downgrade?</summary><div class="m-accordion-content">Your vaults stay open and keep earning, at the rate of the plan you move to.</div></details>
          <details class="m-accordion-item" name="ox-faq"><summary>Is there a minimum balance?</summary><div class="m-accordion-content">No. None of the plans needs a minimum balance or a monthly deposit.</div></details>
        </div>
      </section>
    </div>
  </main>
</div>`;

// Full-page errors: the reference's status screen, a big round status icon, a heavy title, one
// sentence and full-width pills
const errorPage = (code: string, ic: string, tone: 'neutral' | 'danger' | 'accent', title: string, body: string, actions: string) => `    <section class="m-card" aria-labelledby="ox-err-${code}" style="padding: var(--m-space-12) var(--m-space-6)">
      <div class="m-card-body m-stack" data-gap="4" data-align="center" style="text-align: center">
        ${disc(icon(ic, 32), '4.5rem', tone)}
        <span style="${t.second}; font-family: var(--m-font-family-mono)">Error ${code}</span>
        <h1 id="ox-err-${code}" style="${t.page}">${title}</h1>
        <p class="m-muted" style="max-inline-size: 26rem">${body}</p>
        <div class="m-stack" data-gap="2" style="inline-size: 100%; max-inline-size: 20rem">${actions}</div>
      </div>
    </section>`;

const errors = `<main class="m-container" data-size="md" style="padding-block: var(--m-space-10) var(--m-space-16); background: var(--m-color-bg-canvas)">
  <div class="m-stack" data-gap="8">
    <section class="m-stack" data-gap="4" aria-labelledby="ox-err-form">
      <h1 id="ox-err-form" style="${t.page}">Send to Jonah Lee</h1>
      <div class="m-alert" data-tone="danger" role="alert">
        <span class="m-alert-icon">${icon(I.alert, 20)}</span>
        <div class="m-alert-content"><div class="m-alert-title">This payment didn't go out</div><div class="m-alert-body">Nothing left your account. Fix the 2 fields below and try again.</div></div>
      </div>
      <div class="m-card"><div class="m-card-body m-stack" data-gap="4">
        <div class="m-field">
          <label class="m-field-label" for="ox-err-routing">Routing number</label>
          <input class="m-input" id="ox-err-routing" value="0260095" inputmode="numeric" aria-invalid="true" aria-describedby="ox-err-routing-e" style="font-variant-numeric: tabular-nums">
          <p class="m-field-error" id="ox-err-routing-e">Routing numbers have 9 digits. This one has 7.</p>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="ox-err-amount">Amount</label>
          <input class="m-input" id="ox-err-amount" value="$15,000.00" aria-invalid="true" aria-describedby="ox-err-amount-e" style="font-variant-numeric: tabular-nums">
          <p class="m-field-error" id="ox-err-amount-e">You have $12,480.52 in Personal. Send less, or add money first.</p>
        </div>
        <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Review</button>
      </div></div>
    </section>
    <section class="m-stack" data-gap="3" data-align="center" aria-label="A toast">
      <div class="m-toast" data-tone="danger" role="alert" style="max-inline-size: 26rem; align-items: center"><div class="m-cluster" data-gap="3" style="flex-wrap: nowrap"><span style="color: var(--m-color-danger-fg); display: inline-flex; flex: none">${icon(I.alert, 20)}</span><div class="m-toast-content"><div class="m-toast-title">Couldn't load your statements</div><div class="m-toast-body">Check your connection and try again.</div></div></div><button type="button" class="m-button" data-size="sm">${icon(I.rotate, 16)} Retry</button></div>
    </section>
${errorPage('404', I.search, 'neutral', 'We can’t find that page', 'The link might be old, or the page has moved. Your money is where you left it.', `<a class="m-button" data-variant="primary" data-size="lg" href="#">Back to Home</a>`)}
${errorPage('500', I.alert, 'danger', 'Something broke on our side', 'Nothing was changed and no money moved. Give it a minute, then try again.', `<button type="button" class="m-button" data-variant="primary" data-size="lg">Try again</button><button type="button" class="m-button" data-size="lg">Chat with us</button>`)}
${errorPage('403', I.lock, 'accent', 'This account isn’t yours to see', 'Only the owners of the shared vault can open it. Ask one of them to add you.', `<button type="button" class="m-button" data-variant="primary" data-size="lg">Ask for access</button><a class="m-button" data-variant="ghost" data-size="lg" href="#">Go back</a>`)}
  </div>
</main>`;

export const onyxRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'A hero balance set huge on the action colour fading to black, round actions with labels, then white widgets: recent rows, a spending bar chart and a savings goal.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'Round filter selects, rows grouped by day in white widgets with day totals, and a side panel with the amount large, round actions and label-and-value rows.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One 400px column: a back arrow beside a thin progress bar, a heavy heading, grey filled fields and a full-width 52px pill.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A centred profile header, then grouped white widgets of rows with round icons, chevrons and switches; closing the account last.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description: 'A white widget with a round action-coloured icon, a heavy short heading, one sentence and two pills.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'A black brand band with an all-caps heavy heading and a segmented billing switch, four plan widgets with full-width pills, and questions below.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'A danger notice above the form that says no money moved, grey fields turning red with their messages, a white toast with Retry, and status screens for 404, 500 and no access.',
    html: errors,
  },
];
