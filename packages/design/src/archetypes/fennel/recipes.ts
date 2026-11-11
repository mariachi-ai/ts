import type { ArchetypeRecipe } from '../types';

/*
 * Fennel's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from a small ceramics studio's money app. They follow the
 * language's real screen patterns: a white side column with pill-shaped nav items, one bright lime
 * pill per screen, list rows led by 48px icon circles, amounts with the currency code after them,
 * neutral-fill cards with no border or shadow, inline prompts on tinted surfaces, and heavy
 * condensed capitals only for the big moments.
 */

// Lucide icons, outlined, 1.5px stroke
const icon = (paths: string, size = 24) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  up: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  down: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  convert: '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  left: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  xCircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  plug: '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  wallet:
    '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  globe:
    '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  repeat:
    '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  sliders:
    '<path d="M21 4h-7"/><path d="M10 4H3"/><path d="M21 12h-9"/><path d="M8 12H3"/><path d="M21 20h-5"/><path d="M12 20H3"/><path d="M14 2v4"/><path d="M8 10v4"/><path d="M16 18v4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  phone: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  receipt:
    '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
};

// Type: the text face carries the product; the display face (heavy, condensed, capitals) only the big moments
const screenTitle =
  'font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-semibold); letter-spacing: -0.021em; line-height: 1.15';
const sectionTitle = 'font-size: var(--m-font-size-xl); letter-spacing: -0.018em; line-height: 1.25';
const display =
  'font-family: var(--m-font-family-display); font-weight: 900; line-height: 0.85; text-transform: uppercase; letter-spacing: -0.02em';
const figure = 'font-family: var(--m-font-family-display); font-weight: 800; line-height: 1; letter-spacing: -0.02em';
const small = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
const strong = 'font-weight: var(--m-font-weight-semibold)';
const link =
  'color: var(--m-color-accent-text); font-weight: var(--m-font-weight-semibold); text-decoration: underline; text-underline-offset: 3px';
const gain = 'color: var(--m-color-success-fg)';
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)';
const tabular = 'font-variant-numeric: tabular-nums';

// The 48px icon circle that leads every list row: the neutral fill, the icon in forest green
const circle = (paths: string, size = 'lg') =>
  `<span class="m-avatar" data-size="${size}" style="background: var(--m-color-bg-sunken); color: var(--m-color-accent-text)">${icon(paths, 24)}</span>`;
// The outlined circle used on public pages
const ring = (paths: string) =>
  `<span class="m-avatar" data-size="lg" style="background: transparent; color: var(--m-color-fg-default); border: var(--m-border-width-thin) solid var(--m-color-border-default)">${icon(paths, 24)}</span>`;

interface Row {
  lead: string;
  title: string;
  sub: string;
  value?: string;
  valueSub?: string;
  up?: boolean;
  trail?: string;
}
// A list row: circle, title and subtitle, the amount on the right with its second line under it
const row = (
  r: Row,
  pad = 'var(--m-space-3)',
) => `<li class="m-cluster" data-gap="4" style="flex-wrap: nowrap; padding-block: ${pad}">
            ${r.lead}
            <span class="m-stack" data-gap="0" style="flex: 1; min-inline-size: 0"><span style="${strong}">${r.title}</span><span style="${small}">${r.sub}</span></span>
            ${r.value ? `<span class="m-stack" data-gap="0" data-align="end" style="text-align: end; ${tabular}"><span style="${strong}${r.up ? `; ${gain}` : ''}">${r.value}</span>${r.valueSub ? `<span style="${small}">${r.valueSub}</span>` : ''}</span>` : ''}${r.trail ?? ''}
          </li>`;
const chevron = `<span style="color: var(--m-color-fg-default); display: inline-flex">${icon(I.right, 24)}</span>`;

// The app shell: a white side column with pill nav items, a quiet top bar, the content column
const nav = (items: [keyof typeof I, string][], current: string) =>
  items
    .map(
      ([ic, l]) =>
        `        <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${icon(I[ic], 24)} ${l}</a></li>`,
    )
    .join('\n');

const shell = (
  current: string,
  main: string,
  size = '',
) => `<div class="m-split" style="--m-layout-split-side: 16.5rem; --m-layout-split-gap: 0; min-block-size: 100vh">
  <nav class="m-sidebar" aria-label="Main">
    <div style="padding: var(--m-space-3) var(--m-space-3) var(--m-space-6)"><span style="${display}; font-size: var(--m-font-size-2xl); color: var(--m-color-accent-text)">Tidepay</span></div>
    <div class="m-sidebar-section">
      <ul>
${nav(
  [
    ['home', 'Home'],
    ['card', 'Cards'],
    ['convert', 'Payments'],
    ['users', 'Recipients'],
    ['chart', 'Insights'],
  ],
  current,
)}
      </ul>
    </div>
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Business</h2>
      <ul>
${nav(
  [
    ['briefcase', 'Team'],
    ['plug', 'Integrations'],
    ['gear', 'Settings'],
  ],
  current,
)}
      </ul>
    </div>
    <div class="m-card" data-size="sm" style="margin-block-start: var(--m-space-6)">
      <div class="m-card-body m-stack" data-gap="2">
        <span style="${strong}">Earn 4.1% on GBP</span>
        <span style="${small}">Variable rate. Capital at risk.</span>
        <a href="#" style="${link}; font-size: var(--m-font-size-sm)">Learn more</a>
      </div>
    </div>
  </nav>
  <div class="m-stack" data-gap="0">
    <header class="m-cluster" data-justify="end" data-gap="2" style="padding: var(--m-space-4) var(--m-space-6)">
      <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Notifications" style="background: var(--m-color-bg-sunken)">${icon(I.bell, 20)}</button>
      <button type="button" class="m-button" data-variant="ghost" style="padding-inline: var(--m-space-1) var(--m-space-3)"><span class="m-avatar" data-size="sm">MO</span> Maya Okafor</button>
    </header>
    <main class="m-container"${size ? ` data-size="${size}"` : ''} style="padding-block: var(--m-space-4) var(--m-space-16)">
${main}
    </main>
  </div>
</div>`;

// ---------------------------------------------------------------------------------------------
// Dashboard: the total, the money actions, balances as neutral cards, the latest activity

const balance = (
  sym: string,
  amount: string,
  name: string,
) => `          <a class="m-card" href="#" style="text-decoration: none; color: inherit">
            <div class="m-card-body m-stack" data-gap="6">
              <span class="m-avatar" data-size="md" style="background: var(--m-color-bg-canvas); color: var(--m-color-fg-default); ${strong}">${sym}</span>
              <span class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-lg); ${strong}; ${tabular}">${amount}</span><span style="${small}">${name}</span></span>
            </div>
          </a>`;

const dashboard = shell(
  'Home',
  `      <div class="m-stack" data-gap="10">
        <section class="m-stack" data-gap="5" aria-labelledby="fn-total">
          <div class="m-stack" data-gap="2">
            <h1 id="fn-total" style="${small}; ${strong}">Total balance</h1>
            <span style="${figure}; font-size: clamp(2.5rem, 9vw, var(--m-font-size-4xl))">48,215.60 GBP</span>
          </div>
          <div class="m-cluster" data-gap="2">
            <button type="button" class="m-button" data-variant="primary">${icon(I.up, 16)} Send</button>
            <button type="button" class="m-button">${icon(I.plus, 16)} Add money</button>
            <button type="button" class="m-button">${icon(I.down, 16)} Request</button>
            <button type="button" class="m-button">${icon(I.convert, 16)} Convert</button>
          </div>
        </section>

        <section class="m-stack" data-gap="4" aria-labelledby="fn-balances">
          <div class="m-cluster" data-justify="between">
            <h2 id="fn-balances" style="${sectionTitle}">Balances</h2>
            <a href="#" style="${link}">Open a balance</a>
          </div>
          <div class="m-grid" style="--m-layout-grid-min: 12rem">
${balance('£', '32,410.25 GBP', 'British pound')}
${balance('$', '11,862.00 USD', 'US dollar')}
${balance('€', '4,105.70 EUR', 'Euro')}
${balance('¥', '96,500 JPY', 'Japanese yen')}
          </div>
        </section>

        <div class="m-alert" data-tone="success" role="status">
          <span class="m-alert-icon">${icon(I.percent, 24)}</span>
          <div class="m-alert-content"><div class="m-alert-title">Your pounds could be earning</div><div class="m-alert-body">Hold GBP in Interest and earn 4.1% a year, paid out every working day. <a href="#">Find out more</a></div></div>
        </div>

        <section class="m-stack" data-gap="2" aria-labelledby="fn-tx">
          <div class="m-cluster" data-justify="between">
            <h2 id="fn-tx" style="${sectionTitle}">Transactions</h2>
            <a href="#" style="${link}">See all</a>
          </div>
          <ul class="m-stack" data-gap="0" style="padding: 0">
${row({ lead: circle(I.up), title: 'Harbour Clay Supply', sub: 'Sent · Today', value: '1,240.00 GBP', valueSub: '1,412.18 EUR' })}
${row({ lead: circle(I.down), title: 'Odile Marchand', sub: 'Received · Today', value: '+ 860.00 EUR', up: true })}
${row({ lead: circle(I.card), title: 'Kilnworks Hire', sub: 'Card ··4421 · Yesterday', value: '96.40 GBP' })}
${row({ lead: circle(I.convert), title: 'Converted GBP to USD', sub: 'Nov 9', value: '2,000.00 GBP', valueSub: '2,618.40 USD' })}
${row({ lead: circle(I.plus), title: 'To your GBP balance', sub: 'Added · Nov 8', value: '+ 5,000.00 GBP', up: true })}
          </ul>
        </section>
      </div>`,
);

// ---------------------------------------------------------------------------------------------
// List and detail: search and chips over date-grouped rows; a row opens a side panel

const chip = (label: string, on = false) =>
  `<button type="button" class="m-button" data-variant="ghost" data-size="sm" aria-pressed="${on}" style="${
    on
      ? 'background: var(--m-color-accent-default); color: var(--m-color-accent-fg)'
      : 'border: var(--m-border-width-thin) solid var(--m-color-border-strong)'
  }">${label}</button>`;

const step = (
  done: boolean,
  title: string,
  when: string,
) => `            <li class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap">
              <span class="m-avatar" data-size="sm" style="${
                done
                  ? 'background: var(--m-color-accent-default); color: var(--m-color-accent-fg)'
                  : 'background: transparent; color: var(--m-color-fg-subtle); border: var(--m-border-width-thin) solid var(--m-color-border-strong)'
              }">${icon(done ? I.check : I.clock, 16)}</span>
              <span class="m-stack" data-gap="0"><span style="${done ? strong : 'color: var(--m-color-fg-muted)'}">${title}</span><span style="${small}">${when}</span></span>
            </li>`;

const detailRow = (k: string, v: string) =>
  `            <div class="m-cluster" data-justify="between" style="padding-block: var(--m-space-3); ${hair}"><dt style="${small}">${k}</dt><dd style="text-align: end">${v}</dd></div>`;

const listDetail = shell(
  'Payments',
  `      <div class="m-grid" style="--m-layout-grid-min: 22rem; --m-layout-grid-gap: var(--m-space-8); align-items: start">
        <section class="m-stack" data-gap="5" aria-labelledby="fn-tx-title">
          <div class="m-cluster" data-justify="between">
            <h1 id="fn-tx-title" style="${screenTitle}">Payments</h1>
            <button type="button" class="m-button" data-size="sm">${icon(I.download, 16)} Statement</button>
          </div>
          <div role="search" style="position: relative">
            <span style="position: absolute; inset-inline-start: var(--m-space-4); inset-block-start: 50%; translate: 0 -50%; display: inline-flex; color: var(--m-color-fg-subtle)">${icon(I.search, 20)}</span>
            <input class="m-input" type="search" placeholder="Search payments" aria-label="Search payments" style="border-radius: var(--m-radius-full); padding-inline-start: calc(var(--m-space-4) + 1.75rem)">
          </div>
          <div class="m-cluster" data-gap="2">
            ${chip('All', true)}${chip('Sent')}${chip('Received')}${chip('Card')}${chip('Converted')}
          </div>
          <div class="m-stack" data-gap="1">
            <h2 style="${small}; ${strong}">Today</h2>
            <ul class="m-stack" data-gap="0" style="padding: 0">
${row({ lead: circle(I.up), title: 'Harbour Clay Supply', sub: 'Sent · Paid out', value: '1,240.00 GBP', valueSub: '1,412.18 EUR' })}
${row({ lead: circle(I.down), title: 'Odile Marchand', sub: 'Received', value: '+ 860.00 EUR', up: true })}
            </ul>
          </div>
          <div class="m-stack" data-gap="1">
            <h2 style="${small}; ${strong}">Yesterday</h2>
            <ul class="m-stack" data-gap="0" style="padding: 0">
${row({ lead: circle(I.card), title: 'Kilnworks Hire', sub: 'Card ··4421', value: '96.40 GBP' })}
${row({ lead: circle(I.up), title: 'Fenwick Glazes', sub: 'Sent · Cancelled', value: '<s>310.00 GBP</s>' })}
${row({ lead: circle(I.card), title: 'Studio rent', sub: 'Direct Debit', value: '1,450.00 GBP' })}
            </ul>
          </div>
        </section>

        <aside class="m-stack" data-gap="6" aria-labelledby="fn-detail-title" style="padding: var(--m-space-6); border-radius: var(--m-radius-lg); background: var(--m-color-bg-raised); box-shadow: var(--m-shadow-overlay)">
          <div class="m-cluster" data-justify="between">
            <span class="m-avatar" data-size="lg" style="background: var(--m-color-bg-sunken); color: var(--m-color-accent-text)">${icon(I.up, 24)}</span>
            <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Close" style="background: var(--m-color-bg-sunken)">${icon(I.close, 20)}</button>
          </div>
          <div class="m-stack" data-gap="2">
            <h2 id="fn-detail-title" style="${small}; ${strong}">To Harbour Clay Supply</h2>
            <span style="${figure}; font-size: var(--m-font-size-3xl)">1,240.00 GBP</span>
            <span style="${small}">They receive 1,412.18 EUR · 1 GBP = 1.1389 EUR</span>
          </div>
          <div class="m-tabs">
            <div class="m-tab-list" role="tablist" aria-label="Payment">
              <button type="button" class="m-tab" role="tab" aria-selected="true" id="fn-t1" aria-controls="fn-p1">Updates</button>
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1" id="fn-t2">Details</button>
            </div>
            <div class="m-tab-panel" role="tabpanel" id="fn-p1" aria-labelledby="fn-t1" style="padding-block-start: var(--m-space-5)">
              <ol class="m-stack" data-gap="4" style="padding: 0; list-style: none">
${step(true, 'You set up your transfer', 'Today, 9:02')}
${step(true, 'We received your GBP', 'Today, 9:04')}
${step(true, 'We paid out your EUR', 'Today, 9:05')}
${step(false, 'Harbour Clay Supply should have it', 'By today, 11:00')}
              </ol>
            </div>
          </div>
          <dl class="m-stack" data-gap="0">
${detailRow('Fee', '<span style="font-variant-numeric: tabular-nums">4.62 GBP</span>')}
${detailRow('Account', '<span style="font-family: var(--m-font-family-mono); font-size: var(--m-font-size-sm)">FR76 ··· 0193</span>')}
${detailRow('Reference', 'INV-0418 glaze order')}
${detailRow('Transfer number', '<span style="font-variant-numeric: tabular-nums">1960417733</span>')}
          </dl>
          <div class="m-cluster" data-gap="2">
            <button type="button" class="m-button">${icon(I.receipt, 16)} Get receipt</button>
            <button type="button" class="m-button">${icon(I.repeat, 16)} Repeat</button>
          </div>
        </aside>
      </div>`,
);

// ---------------------------------------------------------------------------------------------
// Onboarding: a flow bar with close, step progress, a centred title, one column of fields

const option = (
  ic: keyof typeof I,
  title: string,
  desc: string,
  checked = false,
) => `        <label class="m-cluster" data-gap="4" style="flex-wrap: nowrap; padding: var(--m-space-4); border-radius: var(--m-radius-lg); border: var(--m-border-width-thin) solid var(--m-color-border-${checked ? 'focus' : 'default'}); cursor: pointer">
          ${circle(I[ic])}
          <span class="m-stack" data-gap="0" style="flex: 1"><span style="${strong}">${title}</span><span style="${small}">${desc}</span></span>
          <input class="m-radio" type="radio" name="fn-onb-type"${checked ? ' checked' : ''}>
        </label>`;

const onboarding = `<div class="m-stack" data-gap="0" style="min-block-size: 100vh">
  <header class="m-cluster" data-justify="between" style="padding: var(--m-space-5) clamp(1rem, 4vw, 2.5rem); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
    <span style="${display}; font-size: var(--m-font-size-2xl); color: var(--m-color-accent-text)">Tidepay</span>
    <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Close">${icon(I.close, 24)}</button>
  </header>
  <main class="m-container" data-size="sm" style="padding-block: var(--m-space-8) var(--m-space-16)">
    <form class="m-stack" data-gap="6" aria-labelledby="fn-onb-title">
      <div class="m-stack" data-gap="2">
        <progress class="m-progress" data-size="sm" value="2" max="4" aria-label="Step 2 of 4">2 of 4</progress>
        <div class="m-cluster" data-justify="between" style="font-size: var(--m-font-size-xs); color: var(--m-color-fg-muted)"><span>You</span><span style="color: var(--m-color-accent-text); ${strong}">Business</span><span>Owners</span><span>Review</span></div>
      </div>
      <div class="m-stack" data-gap="2" style="text-align: center; padding-block: var(--m-space-4)">
        <h1 id="fn-onb-title" style="${screenTitle}">Tell us about your business</h1>
        <p class="m-muted" style="font-size: var(--m-font-size-sm)">It takes about 5 minutes. Already started? <a href="#" style="${link}">Pick up where you left off</a></p>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="fn-onb-name">Registered business name</label>
        <input class="m-input" id="fn-onb-name" value="Larkspur Ceramics Ltd" aria-describedby="fn-onb-name-hint">
        <p class="m-field-hint" id="fn-onb-name-hint">Exactly as it appears on your registration documents.</p>
      </div>
      <fieldset class="m-stack" data-gap="3" style="border: 0; padding: 0; margin: 0">
        <legend style="font-size: var(--m-font-size-sm); ${strong}; margin-block-end: var(--m-space-3)">What kind of business is it?</legend>
${option('user', 'Sole trader', 'You run it on your own, without a company')}
${option('briefcase', 'Limited company', 'Registered with Companies House', true)}
${option('users', 'Partnership', 'Two or more people share the business')}
      </fieldset>
      <div class="m-field">
        <label class="m-field-label" for="fn-onb-country">Country of registration</label>
        <select class="m-select" id="fn-onb-country"><option>United Kingdom</option><option>Ireland</option><option>France</option></select>
      </div>
      <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Continue</button>
      <p class="m-subtle" style="font-size: var(--m-font-size-sm); text-align: center">We use this to verify your business. <a href="#" style="${link}">How we use your data</a></p>
    </form>
  </main>
</div>`;

// ---------------------------------------------------------------------------------------------
// Settings: the profile on top, then grouped rows: circle, title and description, a chevron or a switch

const group = (title: string, rows: string) => `        <section class="m-stack" data-gap="1" aria-label="${title}">
          <h2 style="${small}; ${strong}">${title}</h2>
          <ul class="m-stack" data-gap="0" style="padding: 0">
${rows}
          </ul>
        </section>`;
const toggle = (label: string, on: boolean) =>
  `<input class="m-switch" type="checkbox" role="switch" aria-label="${label}"${on ? ' checked' : ''}>`;

const settings = shell(
  'Settings',
  `      <div class="m-stack" data-gap="8">
        <div class="m-cluster" data-gap="5">
          <span class="m-avatar" style="--_size: 4.5rem; font-size: var(--m-font-size-xl)">LC</span>
          <div class="m-stack" data-gap="1" style="flex: 1">
            <h1 style="${screenTitle}">Larkspur Ceramics</h1>
            <span style="${small}">Business account · Membership number <span style="${tabular}">P41835276</span></span>
          </div>
          <button type="button" class="m-button" data-size="sm">Edit profile</button>
        </div>
${group(
  'Account',
  [
    row({
      lead: circle(I.briefcase),
      title: 'Business details',
      sub: 'Name, address, registration number',
      trail: chevron,
    }),
    row({ lead: circle(I.user), title: 'Your details', sub: 'Maya Okafor · Owner', trail: chevron }),
    row({
      lead: circle(I.shield),
      title: 'Security and privacy',
      sub: 'Password, 2-step verification, devices',
      trail: chevron,
    }),
    row({
      lead: circle(I.file),
      title: 'Statements and reports',
      sub: 'Monthly statements are ready on the 1st',
      trail: chevron,
    }),
  ].join('\n'),
)}
${group(
  'Notifications',
  [
    row({
      lead: circle(I.mail),
      title: 'Payment updates',
      sub: 'Email me when money arrives or a transfer is paid out',
      trail: toggle('Payment updates', true),
    }),
    row({
      lead: circle(I.chart),
      title: 'Rate alerts',
      sub: 'Tell me when GBP to EUR reaches a rate I choose',
      trail: toggle('Rate alerts', false),
    }),
    row({
      lead: circle(I.phone),
      title: 'Sign-in alerts',
      sub: 'Always on for your security',
      trail: toggle('Sign-in alerts', true).replace('>', ' disabled>'),
    }),
  ].join('\n'),
)}
${group(
  'Business',
  [
    row({ lead: circle(I.users), title: 'Team', sub: '4 people · 2 can send money', trail: chevron }),
    row({
      lead: circle(I.plug),
      title: 'Integrations',
      sub: 'Accounting sync <span class="m-badge" data-tone="success">Connected</span>',
      trail: chevron,
    }),
  ].join('\n'),
)}
        <section class="m-stack" data-gap="3" style="${hair}; padding-block-start: var(--m-space-6)" aria-labelledby="fn-close">
          <h2 id="fn-close" style="font-size: var(--m-font-size-lg)">Close account</h2>
          <p class="m-muted" style="font-size: var(--m-font-size-sm)">Move your balances out first. Closing cancels your cards and scheduled transfers, and can't be undone.</p>
          <div><button type="button" class="m-button" data-variant="danger">Close account</button></div>
        </section>
      </div>`,
  'md',
);

// ---------------------------------------------------------------------------------------------
// Empty state: a large icon in a pale lime circle, a heading, one line, a primary and a secondary pill

const emptyState = shell(
  'Recipients',
  `      <div class="m-stack" data-gap="8">
        <h1 style="${screenTitle}">Recipients</h1>
        <div class="m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-12)">
          <span class="m-avatar" style="--_size: 6rem">${icon(I.users, 48)}</span>
          <h2 style="${sectionTitle}">No recipients yet</h2>
          <p class="m-muted" style="max-inline-size: 26rem">Add the people and businesses you pay. Their details are saved, so next time it's two taps.</p>
          <div class="m-cluster" data-gap="2" data-justify="center">
            <button type="button" class="m-button" data-variant="primary">${icon(I.plus, 16)} Add a recipient</button>
            <button type="button" class="m-button">${icon(I.link, 16)} Request with a link</button>
          </div>
        </div>
      </div>`,
  'md',
);

// ---------------------------------------------------------------------------------------------
// Pricing: a bright lime band with heavy capitals, a white panel of what you can do, then the fees

const doRow = (
  title: string,
  desc: string,
  first = false,
) => `        <a href="#" class="m-cluster" data-gap="4" style="flex-wrap: nowrap; padding: var(--m-space-6) 0; color: inherit; text-decoration: none${first ? '' : `; ${hair}`}">
          <span class="m-stack" data-gap="2" style="flex: 1"><span style="font-size: var(--m-font-size-xl); ${strong}; letter-spacing: -0.018em">${title}</span><span class="m-muted" style="font-size: var(--m-font-size-sm)">${desc}</span></span>
          <span class="m-avatar" data-size="lg" style="background: var(--m-color-bg-sunken); color: var(--m-color-fg-default)">${icon(I.arrow, 24)}</span>
        </a>`;

const fee = (
  title: string,
  desc: string,
  price: string,
  free = false,
) => `          <div class="m-cluster" data-justify="between" data-gap="6" style="flex-wrap: nowrap; padding: var(--m-space-6) var(--m-space-4); ${hair.replace('block-start', 'block-end')}">
            <div class="m-stack" data-gap="1"><span style="${strong}">${title}</span>${desc ? `<span style="font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)">${desc}</span>` : ''}</div>
            <span style="${strong}; ${tabular}; white-space: nowrap${free ? `; ${gain}` : ''}">${price}</span>
          </div>`;

const feeGroup = (
  ic: keyof typeof I,
  title: string,
  fees: string[],
) => `        <section class="m-stack" data-gap="3" aria-label="${title}">
          <div class="m-cluster" data-gap="4">${ring(I[ic])}<h3 style="${sectionTitle}">${title}</h3></div>
          <div class="m-stack" data-gap="0" style="margin-inline-start: var(--m-space-12)">
${fees.join('\n')}
          </div>
        </section>`;

const pricing = `<div class="m-stack" data-gap="0">
  <div style="background: var(--m-button-primary-bg); color: var(--m-button-primary-fg)">
    <header class="m-navbar" style="--m-navbar-bg: transparent; --m-navbar-link-fg: var(--m-button-primary-fg); --m-navbar-link-hover-fg: var(--m-button-primary-fg); --m-navbar-link-hover-bg: transparent; --m-navbar-link-active-fg: var(--m-button-primary-fg); --m-navbar-link-active-bg: transparent; flex-wrap: wrap; block-size: auto; min-block-size: var(--m-navbar-height); row-gap: 0">
      <a class="m-navbar-brand" href="#" style="${display}; font-size: var(--m-font-size-2xl); color: inherit">Tidepay</a>
      <nav class="m-navbar-nav" aria-label="Main" style="min-inline-size: max-content">
        <a class="m-navbar-link" href="#">Personal</a>
        <a class="m-navbar-link" href="#" aria-current="page" style="text-decoration: underline; text-underline-offset: 6px">Business</a>
        <a class="m-navbar-link" href="#">Developers</a>
      </nav>
      <div class="m-navbar-actions">
        <a class="m-navbar-link" href="#">Log in</a>
        <a class="m-button" href="#" data-size="sm" style="--m-button-secondary-bg: var(--m-color-accent-default); --m-button-secondary-fg: var(--m-color-accent-fg); --m-button-secondary-hover-bg: var(--m-color-accent-hover)">Sign up</a>
      </div>
    </header>
    <main class="m-container" style="padding-block: var(--m-space-16)">
      <div class="m-stack" data-gap="6" data-align="center" style="text-align: center">
        <h1 style="${display}; font-size: clamp(3rem, 8vw, 5.5rem); max-inline-size: 14ch">Built to cost you less</h1>
        <p style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-semibold); max-inline-size: 36rem">Other providers hide fees in the exchange rate. We show every fee up front and use the mid-market rate, so you know what you pay.</p>
        <a href="#" class="m-cluster" data-gap="1" style="color: inherit; ${strong}; text-decoration: underline; text-underline-offset: 3px">See business pricing ${icon(I.right, 16)}</a>
      </div>
      <h2 style="${display}; font-size: clamp(2.25rem, 5vw, 3.75rem); text-align: center; margin-block: var(--m-space-16) var(--m-space-8)">Pay only for what you use</h2>
      <div class="m-stack" data-gap="0" style="max-inline-size: 42rem; margin-inline: auto; padding: var(--m-space-2) var(--m-space-8); border-radius: 2.5rem; background: var(--m-color-bg-raised); color: var(--m-color-fg-default); box-shadow: var(--m-shadow-lg)">
${doRow('Send money', 'Low-cost transfers to 160 countries, at the mid-market rate', true)}
${doRow('Receive money', 'Account details in 9 currencies, free to get paid')}
${doRow('Convert money', 'Move between 40 currencies without a hidden markup')}
${doRow('Spend with the card', 'Pay in the local currency anywhere the card is accepted')}
      </div>
    </main>
  </div>
  <main class="m-container" data-size="md" style="padding-block: var(--m-space-16)">
    <div class="m-stack" data-gap="12">
      <h2 style="${display}; font-size: clamp(2.25rem, 5vw, 3.75rem); text-align: center">Fees at a glance</h2>
${feeGroup('user', 'Opening an account', [fee('Open a business account', 'One-off, then no monthly fee', '45 GBP'), fee('Personal account', '', 'Free', true)])}
${feeGroup('up', 'Sending money', [fee('Sending money', 'Fee varies by currency and amount', 'From 0.43%'), fee('Sending over 20,000 GBP a month', 'The fee drops as you send more', 'From 0.31%')])}
${feeGroup('card', 'Spending with the card', [fee('Spending in a currency you hold', '', 'Free', true), fee('Cash withdrawals', 'Two a month up to 200 GBP are free', '0.50 GBP + 1.75%'), fee('Getting a card', 'Extra cards for your team', '5 GBP')])}
${feeGroup('wallet', 'Holding money', [fee('Holding money in 40 currencies', '', 'Free', true), fee('Interest', 'A fund of government-backed assets', '0.38% a year')])}
      <section class="m-stack" data-gap="4" aria-labelledby="fn-faq">
        <h2 id="fn-faq" style="${sectionTitle}">Questions</h2>
        <div class="m-accordion" style="border-inline: 0">
          <details class="m-accordion-item" name="fn-faq" open><summary>Why are you cheaper than a bank?</summary><div class="m-accordion-content">We convert at the mid-market rate, the one you see on independent sites, and charge a small fee you see before you pay. Banks add a markup to the rate and don't show it.</div></details>
          <details class="m-accordion-item" name="fn-faq"><summary>Do fees change with the amount?</summary><div class="m-accordion-content">The percentage gets smaller as you send more each month. Your fee is always shown before you confirm.</div></details>
          <details class="m-accordion-item" name="fn-faq"><summary>Is there a monthly fee?</summary><div class="m-accordion-content">No. After the one-off fee to open a business account, you only pay when you use a feature.</div></details>
        </div>
      </section>
    </div>
  </main>
</div>`;

// ---------------------------------------------------------------------------------------------
// Errors: a prompt above the form, tinted inline prompts under fields, a snackbar, and full pages.
// The reference's full pages are left-aligned: a title, one line, a link, then pills.

const inlineError = (id: string, text: string) =>
  `<p class="m-field-error" id="${id}" style="display: inline-flex; align-items: start; gap: var(--m-space-2); align-self: start; padding: var(--m-space-1) var(--m-space-2); border-radius: var(--m-radius-md); background: var(--m-color-danger-bg)"><span style="display: inline-flex; padding-block-start: 0.125rem">${icon(I.alert, 16)}</span>${text}</p>`;

const errorPage = (
  code: string,
  ic: string,
  title: string,
  body: string,
  actions: string,
) => `  <section class="m-grid" style="--m-layout-grid-min: 18rem; align-items: center; padding-block: var(--m-space-16); ${hair}" aria-labelledby="fn-err-${code}">
    <div class="m-stack" data-gap="4" data-align="start">
      <span style="${small}; font-family: var(--m-font-family-mono)">Error ${code}</span>
      <h1 id="fn-err-${code}" style="${screenTitle}">${title}</h1>
      <p class="m-muted" style="font-size: var(--m-font-size-sm)">${body}</p>
      <div class="m-cluster" data-gap="3" style="margin-block-start: var(--m-space-2)">${actions}</div>
    </div>
    <div class="m-cluster" data-justify="center"><span class="m-avatar" style="--_size: 9rem">${icon(ic, 64)}</span></div>
  </section>`;

const errors = `<main class="m-container" data-size="md" style="padding-block: var(--m-space-12)">
  <div class="m-stack" data-gap="12">
    <section class="m-stack" data-gap="5" aria-labelledby="fn-err-form" style="max-inline-size: 30rem">
      <h1 id="fn-err-form" style="${screenTitle}">Who are you sending to?</h1>
      <div class="m-alert" data-tone="danger" role="alert">
        <span class="m-alert-icon">${icon(I.xCircle, 24)}</span>
        <div class="m-alert-content"><div class="m-alert-title">2 details need checking</div><div class="m-alert-body">Nothing was sent. Fix the fields below, then continue.</div></div>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="fn-err-iban">IBAN</label>
        <input class="m-input" id="fn-err-iban" value="FR76 3000 6000 0112 3456 7890 1" aria-invalid="true" aria-describedby="fn-err-iban-e" style="font-variant-numeric: tabular-nums">
        ${inlineError('fn-err-iban-e', 'This IBAN is 3 characters short. French IBANs have 27.')}
      </div>
      <div class="m-field">
        <label class="m-field-label" for="fn-err-amount">You send</label>
        <input class="m-input" id="fn-err-amount" value="0.50 GBP" aria-invalid="true" aria-describedby="fn-err-amount-e" style="font-variant-numeric: tabular-nums">
        ${inlineError('fn-err-amount-e', 'Send at least 1.00 GBP. Your GBP balance is 32,410.25 GBP.')}
      </div>
      <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Continue</button>
    </section>
    <section class="m-stack" data-gap="3" aria-label="A snackbar">
      <div class="m-toast" data-tone="danger" role="alert"><div class="m-toast-content"><div class="m-toast-title">Your transfer to Fenwick Glazes was returned</div><div class="m-toast-body">310.00 GBP is back in your balance.</div></div><button type="button" class="m-button" data-variant="ghost" data-size="sm" style="color: inherit; text-decoration: underline; text-underline-offset: 3px">View</button></div>
    </section>
${errorPage('404', I.search, 'Sorry, looks like we lost this page.', 'The link may be old, or the page has moved. Try Home or the Help Centre.', `<a class="m-button" data-variant="primary" href="#">Go to Home</a><a href="#" style="${link}">Help Centre</a>`)}
${errorPage('500', I.alert, 'Something went wrong on our side.', 'Nothing was sent or changed. Try again in a minute; if it keeps happening, contact us.', `<button type="button" class="m-button" data-variant="primary">Try again</button><button type="button" class="m-button">Contact us</button>`)}
${errorPage('403', I.lock, "You don't have access to this.", 'Only owners of Larkspur Ceramics can manage the team. Ask Maya Okafor to give you access.', `<button type="button" class="m-button" data-variant="primary">Ask for access</button><a class="m-button" href="#">Go back</a>`)}
  </div>
</main>`;

export const fennelRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'The total in heavy figures, one lime Send pill beside pale-lime actions, balances as neutral cards, and the latest activity as circle-led rows.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'A pill search and filter chips over date-grouped rows; a row opens a side panel with the amount, an updates timeline and label-and-value rows.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'A flow bar with close, a step progress line, a centred title, one column of 48px fields and choice rows, and a full-width lime Continue.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'The profile on top, then grouped rows: an icon circle, a title and description, and a chevron or a switch. Closing the account comes last.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description: 'A large icon in a pale lime circle, a heading, one sentence, a lime pill and a pale-lime one.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'A bright lime band with heavy condensed capitals and a white panel of arrow rows, then the fees as grouped rows with the price on the right.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'A danger prompt above the form that says nothing was sent, tinted inline prompts under the fields, a dark snackbar, and left-aligned full pages for 404, 500 and no access.',
    html: errors,
  },
];
