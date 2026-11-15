import type { ArchetypeRecipe } from '../types';

/*
 * Halcyon's nine layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from a small company's money app. They follow the
 * language's real screen patterns: a pale sidebar with thin icons, pill actions in a row, cards on
 * a ring shadow, full-bleed hairline tables, figures with small raised cents, and settings as
 * label-and-value rows with an Edit link rather than boxed forms.
 */

// Lucide icons, outlined, 1.25px stroke
const icon = (paths: string, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  tasks: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  command: '<path d="m4 17 6-5-6-5"/><path d="M12 19h8"/>',
  bank: '<path d="M3 21h18"/><path d="M5 21V10m4 11V10m6 11V10m4 11V10"/><path d="M12 3 3 8h18z"/>',
  transfer: '<path d="M7 4 3 8l4 4"/><path d="M3 8h18"/><path d="m17 20 4-4-4-4"/><path d="M21 16H3"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19"/>',
  send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  invoice: '<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6"/><path d="M9 13h6m-6 4h4"/>',
  book: '<path d="M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  upload: '<path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M4 21h16"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 6 6 6-6 6"/>',
  left: '<path d="m15 6-6 6 6 6"/>',
  up: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  downArrow: '<path d="M7 7l10 10"/><path d="M17 8v9H8"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 10h18M9 4v16"/>',
  key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.8-9.8"/><path d="m16 7 3 3"/><path d="m18.5 4.5 2 2"/>',
  mark: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12"/><circle cx="12" cy="12" r="3"/>',
  users:
    '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14a6.5 6.5 0 0 1 3.5 6"/>',
};

// A figure with its cents small and raised: $5,216,471.18
const money = (whole: string, cents: string) =>
  `${whole}<span style="font-size: 0.62em; vertical-align: 0.5em; margin-inline-start: 0.04em">.${cents}</span>`;
// Four weights, each with one job: 360 for actions and figures (the button default), 380 for titles,
// 400 for running text (the body default) and 480 for small labels
const figure =
  'font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-heading-weight); letter-spacing: var(--m-font-tracking-tight); font-variant-numeric: tabular-nums';
const pageTitle =
  'font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-heading-weight)';
const cardTitle = 'font-size: var(--m-font-size-md); font-weight: var(--m-font-body-weight)';
const label = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
const small = 'font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-semibold)';
const gain = 'color: var(--m-color-success-fg)';
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)';

type NavItem = [string, string, string?, string[]?];
const nav = (items: NavItem[], current: string) =>
  items
    .map(
      ([ic, l, extra, sub]) =>
        `          <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${icon(I[ic as keyof typeof I], 12)} ${l}${extra ?? ''}</a>${
          sub && l === current
            ? `<ul>${sub.map((x) => `<li><a class="m-sidebar-link" href="#">${x}</a></li>`).join('')}</ul>`
            : ''
        }</li>`,
    )
    .join('\n');

// The workspace and the product switch: the same at the top of every app page, settings included
const workspace = `    <div class="m-stack" data-gap="3" style="padding: var(--m-space-1)">
      <div class="m-cluster" data-justify="between">
        <span class="m-cluster" data-gap="2"><span class="m-avatar" data-size="sm" style="border-radius: var(--m-radius-md)">FS</span> Fieldstone</span>
        <span class="m-badge" data-variant="solid" style="${small}">Pro</span>
      </div>
      <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Product">
        <button type="button" class="m-tab" role="tab" aria-selected="true">Banking</button>
        <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Payroll</button>
      </div></div>
    </div>`;

const mainNav = (current: string) => `${workspace}
    <div class="m-sidebar-section">
      <ul>
${nav(
  [
    ['home', 'Home'],
    ['tasks', 'Tasks', ` <span class="m-sidebar-count" style="background: none; font-weight: var(--m-font-weight-semibold)">10</span>`],
    ['command', 'Assistant', ' <span class="m-badge">New</span>'],
  ],
  current,
)}
      </ul>
    </div>
    <div class="m-sidebar-section" style="${hair}; padding-block-start: var(--m-space-3)">
      <ul>
${nav(
  [
    ['bank', 'Accounts'],
    ['transfer', 'Transactions', '', ['Insights']],
    ['card', 'Cards'],
    ['users', 'Team spend'],
    ['send', 'Payments', '', ['Bill pay', 'Recipients']],
    ['invoice', 'Invoicing'],
    ['book', 'Accounting'],
  ],
  current,
)}
      </ul>
    </div>
    <div class="m-sidebar-section" style="${hair}; padding-block-start: var(--m-space-3)">
      <h2 class="m-sidebar-heading">Bookmarks</h2>
      <ul>
        <li><a class="m-sidebar-link" href="#">${icon(I.bookmark, 12)} <span class="m-stack" data-gap="0">Operations<span class="m-subtle" style="font-size: var(--m-font-size-sm); font-variant-numeric: tabular-nums">$2,023,267.12</span></span></a></li>
        <li><a class="m-sidebar-link" href="#">${icon(I.bookmark, 12)} Credit card</a></li>
        <li><a class="m-sidebar-link" href="#">${icon(I.bookmark, 12)} Bill pay</a></li>
        <li><a class="m-sidebar-link" href="#">${icon(I.bookmark, 12)} Insights</a></li>
      </ul>
    </div>`;

const topBar = `    <header class="m-cluster" data-justify="between" style="padding: var(--m-space-2) var(--m-space-6)">
      <button type="button" class="m-button" data-variant="ghost">${icon(I.search, 12)} Search payments and people</button>
      <div class="m-cluster" data-gap="1">
        <button type="button" class="m-button" data-variant="ghost">${icon(I.transfer, 12)} Pay or transfer</button>
        <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Settings">${icon(I.gear, 12)}</button>
        <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Notifications">${icon(I.bell, 12)}</button>
        <span class="m-avatar" data-size="sm" aria-label="Dana Whitfield">DW</span>
      </div>
    </header>`;

// The app frame: a pale sidebar with a hairline edge, a bare top bar, then the page. Every app page
// sits in it, the empty, not-found and failed states included. On a phone the page comes first and
// the sidebar drops below it.
const shell = (
  current: string,
  main: string,
  sidebar = mainNav(current),
) => `<div class="m-split" style="--m-layout-split-side: 13.75rem; --m-layout-split-gap: 0; min-block-size: 100vh; flex-wrap: wrap-reverse">
  <nav class="m-sidebar" aria-label="Main" style="${hair.replace('block-start', 'inline-end')}">
${sidebar}
  </nav>
  <div class="m-stack" data-gap="0">
${topBar}
    <main class="m-container" style="padding-block: var(--m-space-8) var(--m-space-12)">
${main}
    </main>
  </div>
</div>`;

// The balance over 30 days: an accent line over a soft fade of the accent
const pts = [
  42, 40, 41, 39, 43, 44, 42, 47, 50, 46, 49, 55, 53, 52, 58, 62, 60, 57, 61, 66, 64, 70, 76, 74, 72, 78, 75, 71, 73,
  69,
];
const line = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * 600) / (pts.length - 1)},${150 - v * 1.6}`).join(' ');
const area = `<svg viewBox="0 0 600 150" width="100%" preserveAspectRatio="none" style="display: block; block-size: 10rem" role="img" aria-label="Balance over the last 30 days, rising from $4.6M to $5.2M">
            <defs><linearGradient id="hc-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: var(--m-color-accent-default); stop-opacity: 0.16"/><stop offset="1" style="stop-color: var(--m-color-accent-default); stop-opacity: 0"/></linearGradient></defs>
            <path d="${line} L600,150 L0,150 Z" fill="url(#hc-fade)"/>
            <path d="${line}" fill="none" style="stroke: var(--m-color-accent-default)" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
          </svg>`;

const account = (initials: string, name: string, whole: string, cents: string) =>
  `<li class="m-cluster" data-justify="between" style="padding-block: var(--m-space-2)"><span class="m-cluster" data-gap="3"><span class="m-avatar" data-size="sm">${initials}</span>${name}</span><span style="font-variant-numeric: tabular-nums">${money(whole, cents)}</span></li>`;

const dashboard = shell(
  'Home',
  `      <div class="m-stack" data-gap="6">
        <h1 style="${pageTitle}">Good morning, Dana</h1>
        <div class="m-cluster" data-justify="between">
          <div class="m-cluster" data-gap="2">
            <button type="button" class="m-button" data-variant="primary" data-size="sm">${icon(I.send, 12)} Send</button>
            <button type="button" class="m-button" data-size="sm">${icon(I.transfer, 12)} Transfer</button>
            <button type="button" class="m-button" data-size="sm">${icon(I.plus, 12)} Deposit</button>
            <button type="button" class="m-button" data-size="sm">${icon(I.invoice, 12)} Request</button>
            <button type="button" class="m-button" data-size="sm">${icon(I.upload, 12)} Upload bill</button>
          </div>
          <button type="button" class="m-button" data-variant="ghost" data-size="sm">Customize</button>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 24rem; --m-layout-grid-gap: var(--m-space-6)">
          <section class="m-card" aria-labelledby="hc-balance">
            <div class="m-card-body m-stack" data-gap="3">
              <div class="m-cluster" data-justify="between" data-align="start">
                <div class="m-stack" data-gap="1">
                  <h2 id="hc-balance" style="${cardTitle}">Total balance</h2>
                  <span style="${figure}">${money('$5,216,471', '18')}</span>
                </div>
                <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="View">
                  <button type="button" class="m-tab" role="tab" aria-selected="true" aria-label="Chart">${icon(I.chart, 12)}</button>
                  <button type="button" class="m-tab" role="tab" aria-selected="false" aria-label="Table" tabindex="-1">${icon(I.table, 12)}</button>
                </div></div>
              </div>
              <div class="m-cluster" data-justify="between">
                <button type="button" class="m-button" data-variant="ghost" data-size="sm">Last 30 days ${icon(I.down, 12)}</button>
                <span class="m-cluster" data-gap="4" style="font-variant-numeric: tabular-nums">
                  <span class="m-cluster" data-gap="1" style="${gain}">${icon(I.up, 12)} $1.8M</span>
                  <span class="m-cluster" data-gap="1"><span style="color: var(--m-color-danger-fg); display: inline-flex">${icon(I.downArrow, 12)}</span> −$482K</span>
                </span>
              </div>
            </div>
            ${area}
            <div class="m-cluster" data-justify="between" style="padding: var(--m-space-2) var(--m-space-6) var(--m-space-4); ${label}"><span>Oct 17</span><span>Oct 22</span><span>Oct 27</span><span>Nov 1</span><span>Nov 6</span></div>
          </section>
          <section class="m-card" aria-labelledby="hc-accounts">
            <div class="m-card-body m-stack" data-gap="2">
              <div class="m-cluster" data-justify="between">
                <h2 id="hc-accounts" style="${cardTitle}">Accounts</h2>
                <button type="button" class="m-button" data-size="sm" data-icon-only aria-label="Add an account">${icon(I.plus, 12)}</button>
              </div>
              <ul class="m-stack" data-gap="0" style="padding: 0">
                ${account('CR', 'Credit', '$12,505', '87')}
                ${account('TR', 'Treasury', '$2,950,000', '00')}
                ${account('OP', 'Operations', '$2,023,267', '12')}
                ${account('AP', 'Payables', '$180,412', '06')}
                ${account('AR', 'Receivables', '$50,286', '13')}
              </ul>
            </div>
          </section>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 16rem; --m-layout-grid-gap: var(--m-space-6)">
          <section class="m-card" aria-labelledby="hc-credit">
            <div class="m-card-body m-stack" data-gap="3">
              <h2 id="hc-credit" style="${cardTitle}">Credit card</h2>
              <span style="${figure}">${money('$12,505', '87')}</span>
              <progress class="m-progress" value="25" max="100" aria-label="Credit used: 25%">25%</progress>
              <div class="m-cluster" data-justify="between" style="${label}"><span>Balance · Pending</span><span style="font-variant-numeric: tabular-nums">$21,249 available</span></div>
            </div>
          </section>
          <section class="m-card" aria-labelledby="hc-bills">
            <div class="m-card-body m-stack" data-gap="3">
              <h2 id="hc-bills" style="${cardTitle}">Bill pay</h2>
              <dl class="m-cluster" data-gap="8">
                <div class="m-stack" data-gap="1"><dt style="${label}">Outstanding</dt><dd style="font-variant-numeric: tabular-nums">11</dd></div>
                <div class="m-stack" data-gap="1"><dt style="${label}">Overdue</dt><dd style="font-variant-numeric: tabular-nums">1</dd></div>
                <div class="m-stack" data-gap="1"><dt style="${label}">Due soon</dt><dd>—</dd></div>
              </dl>
            </div>
          </section>
        </div>
      </div>`,
);

const tx = (
  date: string,
  initials: string,
  who: string,
  amount: string,
  inflow: boolean,
  acct: string,
  method: string,
  failed = false,
) => `            <tr>
              <td><input class="m-checkbox" type="checkbox" aria-label="Select ${who}"></td>
              <td>${date}</td>
              <td><span class="m-cluster" data-gap="3"><span class="m-avatar" data-size="sm">${initials}</span>${who}${failed ? ' <span class="m-badge" data-tone="danger" data-variant="outline">Failed</span>' : ''}</span></td>
              <td data-numeric style="${inflow ? gain : ''}${failed ? '; text-decoration: line-through' : ''}">${amount}</td>
              <td>${acct}</td>
              <td style="color: var(--m-color-fg-muted)">${method}</td>
            </tr>`;

const listDetail = shell(
  'Transactions',
  `      <div class="m-stack" data-gap="12">
        <!-- The list: a full-bleed table under its filters and the month's figures -->
        <section class="m-stack" data-gap="5" aria-labelledby="hc-tx-title">
          <div class="m-cluster" data-justify="between">
            <h1 id="hc-tx-title" style="${pageTitle}">Transactions</h1>
            <button type="button" class="m-button" data-size="sm">${icon(I.invoice, 12)} Attach receipts</button>
          </div>
          <div class="m-cluster" data-gap="2" role="search">
            <select class="m-select" data-size="sm" aria-label="Saved views"><option>Saved views</option></select>
            <select class="m-select" data-size="sm" aria-label="Date"><option>Date</option><option>This month</option></select>
            <select class="m-select" data-size="sm" aria-label="Keyword"><option>Keyword</option></select>
            <select class="m-select" data-size="sm" aria-label="Amount"><option>Amount</option></select>
          </div>
          <dl class="m-cluster" data-gap="10" style="${hair}; padding-block-start: var(--m-space-4)">
            <div class="m-stack" data-gap="1"><dt style="${label}">Net change this month</dt><dd style="${gain}; font-size: var(--m-font-size-xl); font-variant-numeric: tabular-nums">$2,328,436.03</dd></div>
            <div class="m-stack" data-gap="1"><dt style="${label}">Money in</dt><dd style="${gain}; font-size: var(--m-font-size-xl); font-variant-numeric: tabular-nums">$3,163,527.25</dd></div>
            <div class="m-stack" data-gap="1"><dt style="${label}">Money out</dt><dd style="font-size: var(--m-font-size-xl); font-variant-numeric: tabular-nums">−$835,091.22</dd></div>
          </dl>
          <div class="m-table-wrap">
            <table class="m-table">
              <thead><tr><th style="inline-size: 2rem"><span class="m-sr-only">Select</span></th><th>Date</th><th>To / from</th><th data-numeric>Amount</th><th>Account</th><th>Method</th></tr></thead>
              <tbody>
${tx('Nov 11', 'DW', 'Dana’s account', `−${money('$750', '00')}`, false, 'Operations', 'Transfer')}
${tx('Nov 11', 'BS', 'Bluebird Studio', money('$419', '00'), true, 'Receivables', 'Invoice payment', true)}
${tx('Nov 11', 'AC', 'Acme Corp', money('$200', '00'), true, 'Receivables', 'Invoice payment')}
${tx('Nov 11', 'OP', 'To Operations', `−${money('$55,810', '16')}`, false, 'Receivables', 'Transfer')}
${tx('Nov 10', 'LE', 'Lily’s Eatery', money('$63', '53'), true, 'Credit', 'Card ··1234')}
${tx('Nov 10', 'OS', 'Office Stop Co.', `−${money('$287', '89')}`, false, 'Operations', 'Card ··9914')}
${tx('Nov 9', 'DA', 'Domestic Ads', `−${money('$82', '75')}`, false, 'Operations', 'Real-time payment')}
              </tbody>
            </table>
          </div>
        </section>

        <hr class="m-divider">

        <!-- The detail: its own page, with label-and-value rows -->
        <section class="m-stack" data-gap="6" aria-labelledby="hc-detail-title" style="max-inline-size: 48rem">
          <a href="#" class="m-cluster" data-gap="1" style="color: var(--m-color-fg-muted); text-decoration: none">${icon(I.left, 12)} Transactions</a>
          <div class="m-cluster" data-gap="4">
            <span class="m-avatar" data-size="lg">AC</span>
            <div class="m-stack" data-gap="1">
              <h1 id="hc-detail-title" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-heading-weight)">Payment from Acme Corp</h1>
              <span style="${figure}; ${gain}">${money('$200', '00')}</span>
            </div>
          </div>
          <dl class="m-stack" data-gap="0">
            <div class="m-cluster" data-justify="between" style="${hair}; padding-block: var(--m-space-4)"><dt>Status</dt><dd><span class="m-badge" data-tone="success">Completed</span></dd></div>
            <div class="m-cluster" data-justify="between" style="${hair}; padding-block: var(--m-space-4)"><dt>Date</dt><dd>November 11, 2026 at 9:42</dd></div>
            <div class="m-cluster" data-justify="between" style="${hair}; padding-block: var(--m-space-4)"><dt>Account</dt><dd>Receivables <span style="font-family: var(--m-font-family-mono); color: var(--m-color-fg-muted)">··4296</span></dd></div>
            <div class="m-cluster" data-justify="between" style="${hair}; padding-block: var(--m-space-4)"><dt>Method</dt><dd>Invoice payment, INV-2041</dd></div>
            <div class="m-cluster" data-justify="between" style="${hair}; padding-block: var(--m-space-4)"><dt>Category</dt><dd><select class="m-select" data-size="sm" aria-label="Category"><option>Client revenue</option></select></dd></div>
          </dl>
          <div class="m-cluster" data-gap="2">
            <button type="button" class="m-button">Download receipt</button>
            <button type="button" class="m-button" data-variant="ghost">Add a note</button>
          </div>
        </section>
      </div>`,
);

// Flows (onboarding, sign-in) leave the app frame: a pale ground, the mark and one way out at the top,
// then one white card in a narrow column
const flowBar = (right: string) => `  <header class="m-cluster" data-justify="between" style="padding: var(--m-space-6) var(--m-space-8)">
    <span class="m-cluster" data-gap="2" style="font-weight: var(--m-font-weight-semibold)">${icon(I.mark, 24)} Tidewater</span>
    ${right}
  </header>`;
const flowGround = 'min-block-size: 100vh; background: var(--m-color-border-muted)';

const onboarding = `<div style="${flowGround}">
${flowBar(`<button type="button" class="m-button" data-variant="ghost" style="font-size: var(--m-font-size-lg)">Save and finish later ${icon(I.right, 12)}</button>`)}
<main class="m-container" data-size="sm" style="--m-layout-container-max-sm: 30rem; padding-block: var(--m-space-4) var(--m-space-16)">
  <form class="m-card" aria-labelledby="hc-onb-title">
    <div class="m-card-body m-stack" data-gap="8" style="padding: var(--m-space-10)">
      <div class="m-stack" data-gap="2">
        <span style="${small}; color: var(--m-color-fg-muted)" id="hc-onb-step">Step 2 of 4 · Your company</span>
        <progress class="m-progress" data-size="sm" value="2" max="4" aria-labelledby="hc-onb-step">2 of 4</progress>
      </div>
      <div class="m-stack" data-gap="2">
        <h1 id="hc-onb-title" style="${pageTitle}; line-height: var(--m-font-leading-tight)">Tell us about your company</h1>
        <p class="m-muted">It takes about 5 minutes. Your answers are saved as you go.</p>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="hc-onb-name">Legal company name</label>
        <input class="m-input" id="hc-onb-name" value="Fieldstone Studio, Inc." aria-describedby="hc-onb-name-hint">
        <p class="m-field-hint" id="hc-onb-name-hint">Exactly as it appears on your formation documents.</p>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="hc-onb-type">Company type</label>
        <select class="m-select" id="hc-onb-type"><option>C corporation</option><option>LLC</option><option>S corporation</option></select>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="hc-onb-ein">Federal EIN</label>
        <input class="m-input" id="hc-onb-ein" value="12-34567" aria-invalid="true" aria-describedby="hc-onb-ein-error" style="font-variant-numeric: tabular-nums">
        <p class="m-field-error" id="hc-onb-ein-error">An EIN has 9 digits, like 12-3456789.</p>
      </div>
      <div class="m-cluster" data-justify="between">
        <button type="button" class="m-button" data-variant="ghost">${icon(I.left, 12)} Back</button>
        <button type="submit" class="m-button" data-variant="primary">Continue</button>
      </div>
    </div>
  </form>
</main>
</div>`;

const row = (
  name: string,
  desc: string,
  value: string,
  edit = true,
) => `          <div class="m-split" style="--m-layout-split-side: 20rem; ${hair}; padding-block: var(--m-space-5)">
            <dt class="m-stack" data-gap="1"><span>${name}</span>${desc ? `<span style="${label}">${desc}</span>` : ''}</dt>
            <dd class="m-stack" data-gap="1" data-align="start">${value}${edit ? `<a href="#" class="m-cluster" data-gap="1" style="color: var(--m-color-accent-text); text-decoration: none; font-size: var(--m-font-size-sm)">Edit ${icon(I.right, 12)}</a>` : ''}</dd>
          </div>`;

// Settings keep the workspace and the top bar; the main nav gives way to a back link and grouped pages
const settingsNav = (groups: [string, string[]][], current: string) => `${workspace}
    <a href="#" class="m-sidebar-link" style="color: var(--m-color-fg-default)">${icon(I.left, 12)} Settings</a>
${groups
  .map(
    ([h, items]) => `    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">${h}</h2>
      <ul>
${items.map((l) => `        <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${l}</a></li>`).join('\n')}
      </ul>
    </div>`,
  )
  .join('\n')}`;

const settings = shell(
  '',
  `      <div class="m-stack" data-gap="6" style="max-inline-size: 61rem">
        <div class="m-cluster" data-gap="4">
          <span class="m-avatar" data-size="lg" style="border-radius: var(--m-radius-md)">FS</span>
          <h1 style="${pageTitle}">Fieldstone Studio</h1>
        </div>
        <dl class="m-stack" data-gap="0">
${row('Legal name', '', 'Fieldstone Studio, Inc.', false)}
${row('Doing business as', '', '<span class="m-cluster" data-gap="2">Fieldstone Studio <span class="m-badge">Default</span></span><span>Fieldstone Labs</span>', false)}
${row('Federal EIN', '', '<span aria-label="Hidden" style="letter-spacing: 0.2em">•••••••••</span>', false)}
${row('Company name', 'The name on your statements and in notifications.', 'Fieldstone Studio')}
${row('Phone number', '', '+1 (415) 555-0142')}
${row('Bill forwarding email', 'Vendors can send bills straight to your account at this address.', '<span style="font-family: var(--m-font-family-mono); font-size: var(--m-font-size-sm)">bills@fieldstone.example</span>')}
        </dl>
        <section class="m-stack" data-gap="3" style="${hair}; padding-block-start: var(--m-space-6)" aria-labelledby="hc-close">
          <h2 id="hc-close" style="${cardTitle}">Close account</h2>
          <p class="m-muted">Closing sends your balance of $5,216,471.18 to a linked account, then cancels cards and scheduled payments. It can't be undone.</p>
          <div><button type="button" class="m-button" data-variant="danger">Close account…</button></div>
        </section>
      </div>`,
  settingsNav(
    [
      ['Company', ['Company profile', 'Plans & billing', 'Documents', 'Categories', 'Integrations']],
      ['Payroll', ['Pay schedules', 'Work locations', 'Tax accounts']],
      ['Team', ['Team', 'Departments', 'Advisors']],
      ['Security & controls', ['Activity log', 'Approval rules', 'Controls']],
    ],
    'Company profile',
  ),
);

// Nothing here: the page keeps its frame, title, action and column heads; the message sits centred
// where the rows would be, in body type, with one line and a link. A list page's own action is a
// quiet pill, as on every list page; the accent is kept for sending money and finishing a flow
const emptyState = shell(
  'Recipients',
  `      <div class="m-stack" data-gap="5">
        <div class="m-cluster" data-justify="between">
          <h1 style="${pageTitle}">Recipients</h1>
          <button type="button" class="m-button" data-size="sm">${icon(I.plus, 12)} Add recipient</button>
        </div>
        <div class="m-cluster" data-gap="2" role="search">
          <input class="m-input" data-size="sm" type="search" placeholder="Search recipients" aria-label="Search recipients" style="max-inline-size: 16rem">
          <select class="m-select" data-size="sm" aria-label="Payment method"><option>Payment method</option></select>
          <select class="m-select" data-size="sm" aria-label="Last paid"><option>Last paid</option></select>
        </div>
        <div class="m-table-wrap">
          <table class="m-table">
            <thead><tr><th>Name</th><th>Payment method</th><th>Last paid</th><th data-numeric>Total paid</th></tr></thead>
          </table>
        </div>
        <div class="m-stack" data-gap="2" data-align="center" style="text-align: center; padding-block: var(--m-space-12)">
          <h2 style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-body-weight)">No recipients yet</h2>
          <p class="m-muted" style="max-inline-size: 26rem">Recipients are the people and companies you pay. Add one, or <a href="#" style="color: var(--m-color-accent-text)">import them from a file</a>.</p>
        </div>
      </div>`,
);

// Public pages: a white site bar with the mark, the links in the middle, Log in and the primary pill
const siteBar = `<header class="m-cluster" data-justify="between" style="padding: var(--m-space-4) var(--m-space-8)">
  <span class="m-cluster" data-gap="2" style="font-weight: var(--m-font-weight-semibold)">${icon(I.mark, 24)} Tidewater</span>
  <nav class="m-cluster" data-gap="8" aria-label="Site" style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium)">
    <a href="#" class="m-cluster" data-gap="1" style="color: var(--m-color-fg-default); text-decoration: none">Products ${icon(I.down, 12)}</a>
    <a href="#" class="m-cluster" data-gap="1" style="color: var(--m-color-fg-default); text-decoration: none">Customers ${icon(I.down, 12)}</a>
    <a href="#" class="m-cluster" data-gap="1" style="color: var(--m-color-fg-default); text-decoration: none">Resources ${icon(I.down, 12)}</a>
    <a href="#" style="color: var(--m-color-fg-default); text-decoration: none">Pricing</a>
  </nav>
  <div class="m-cluster" data-gap="2">
    <a class="m-button" data-variant="ghost" href="#">Log in</a>
    <a class="m-button" data-variant="primary" href="#">Open an account</a>
  </div>
</header>`;
// On public pages the quiet pill is tinted with the accent, not grey
const publicSecondary = 'background: var(--m-color-accent-subtle); color: var(--m-color-fg-default)';

// Every public page ends with the site footer: columns of 13px links under small 480 labels, then the fine print
const footCol = (h: string, links: string[]) => `    <div class="m-stack" data-gap="3">
      <h2 style="${small}; color: var(--m-color-fg-muted)">${h}</h2>
      <ul class="m-stack" data-gap="2" style="padding: 0; list-style: none; font-size: var(--m-font-size-sm)">
${links.map((l) => `        <li><a href="#" style="color: var(--m-color-fg-default); text-decoration: none">${l}</a></li>`).join('\n')}
      </ul>
    </div>`;
const siteFooter = `<footer class="m-container" style="padding-block: var(--m-space-12); ${hair}">
  <div class="m-grid" style="--m-layout-grid-min: 10rem; --m-layout-grid-gap: var(--m-space-8)">
${footCol('Products', ['Business banking', 'Credit card', 'Invoicing', 'Bill pay', 'Treasury'])}
${footCol('Resources', ['Journal', 'Guides', 'Help centre', 'Status'])}
${footCol('Company', ['About', 'Careers', 'Press', 'Security'])}
${footCol('Legal', ['Terms', 'Privacy', 'Licences', 'Accessibility'])}
  </div>
  <p style="${label}; padding-block-start: var(--m-space-8)">Tidewater is a financial technology company, not a bank. Banking services are provided by partner banks.</p>
</footer>`;

const tier = (
  name: string,
  accentWord: string,
  price: string,
  note: string,
  intro: string,
  features: string[],
  primary = false,
  first = false,
) => `      <section class="m-stack" data-gap="5" style="padding: var(--m-space-6)${first ? '' : '; border-inline-start: var(--m-border-width-thin) solid var(--m-color-border-default)'}" aria-labelledby="hc-tier-${(accentWord || name).toLowerCase()}">
        <div class="m-stack" data-gap="1">
          <h2 id="hc-tier-${(accentWord || name).toLowerCase()}" style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-semibold)">${name}${accentWord ? ` <span style="color: var(--m-color-accent-default)">${accentWord}</span>` : ''}</h2>
          <span style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-regular); font-variant-numeric: tabular-nums">${price}</span>
          <p class="m-muted">${note}</p>
        </div>
        <button type="button" class="m-button"${primary ? ' data-variant="primary"' : ` style="${publicSecondary}; inline-size: 100%"`}${primary ? ' style="inline-size: 100%"' : ''}>${primary ? 'Try it free for 30 days' : 'Open an account'}</button>
        <div class="m-stack" data-gap="3">
          <h3 style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-semibold)">${intro}</h3>
          <ul class="m-stack" data-gap="2" style="padding: 0">
${features.map((f) => `            <li class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${icon(I.check, 12)}${f}</li>`).join('\n')}
          </ul>
        </div>
      </section>`;

// Public pages run at 16px; titles are 480, prices and the lede light at 360
const pricing = `<div style="font-size: var(--m-font-size-lg)">
${siteBar}
<main class="m-container" style="padding-block: var(--m-space-12) var(--m-space-16)">
  <div class="m-stack" data-gap="10">
    <div class="m-stack" data-gap="3" data-align="center" style="text-align: center">
      <h1 style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-4xl); font-weight: var(--m-font-weight-semibold); line-height: var(--m-font-leading-tight)">Plans that grow<br>with your company</h1>
      <p class="m-muted" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-regular); max-inline-size: 32rem">Banking and the essentials are always $0 a month, with more as your company grows.</p>
    </div>
    <section class="m-card" style="padding: 0" aria-label="Compare plans">
      <div class="m-cluster" data-justify="between" style="padding: var(--m-space-4) var(--m-space-6)">
        <span style="font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-medium); text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide); color: var(--m-color-fg-muted)">Compare plans</span>
        <label class="m-field" data-layout="inline"><input class="m-switch" type="checkbox" role="switch" checked> Pay yearly, save 15%</label>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 16rem; --m-layout-grid-gap: 0; ${hair}">
${tier('Essentials', '', '$0/mo.', 'Banking and the finance basics, included with every account.', 'What’s included:', ['Banking', 'Sending and receiving money', 'Cards and expenses', 'Invoicing', 'Bill pay'], false, true)}
${tier('Essentials', 'Plus', '$29.90/mo.', 'For companies that need more efficiency and simpler invoicing.', 'Everything in Essentials, plus:', ['Invoices paid by bank debit', 'Unlimited tax filings', 'Priority support', 'Accounting sync'], true)}
${tier('Essentials', 'Pro', '$299/mo.', 'For complex operations that need a relationship manager.', 'Everything in Plus, and more:', ['A relationship manager', 'Advanced approval rules', 'Custom user roles', 'Priority wires'])}
      </div>
      <a href="#" class="m-cluster" data-gap="2" data-justify="center" style="padding: var(--m-space-3); background: var(--m-color-bg-sunken); color: var(--m-color-fg-default); text-decoration: none; ${hair}; border-end-start-radius: inherit; border-end-end-radius: inherit">Personal accounts for your team come at no extra cost ${icon(I.arrow, 12)}</a>
    </section>
    <section class="m-stack" data-gap="3" aria-labelledby="hc-faq" style="max-inline-size: 44rem; margin-inline: auto; inline-size: 100%">
      <h2 id="hc-faq" style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-semibold)">Questions</h2>
      <div class="m-accordion">
        <details class="m-accordion-item" name="hc-faq" open><summary>What does it cost to run my company's banking here?</summary><div class="m-accordion-content">Nothing: no monthly fees, no minimum balance, and domestic and international wires in dollars are free.</div></details>
        <details class="m-accordion-item" name="hc-faq"><summary>How do you price currency exchange?</summary><div class="m-accordion-content">A 1% fee on the amount converted, shown before you send, on top of the market rate.</div></details>
        <details class="m-accordion-item" name="hc-faq"><summary>Can I change plans later?</summary><div class="m-accordion-content">Yes, any time. Upgrades apply at once; downgrades at the end of the billing period.</div></details>
      </div>
    </section>
  </div>
</main>
${siteFooter}
</div>`;

// Errors: inline on the field, a summary above the form, a toast for what happened elsewhere, and
// whole-page states that keep the app frame: a centred line in body type, one sentence, a muted
// note of where you are, and at most one quiet way on. The words carry it, not colour or pictures.
const errorState = (code: string, title: string, body: string, action: string) => `        <section class="m-stack" data-gap="2" data-align="center" style="text-align: center; padding-block: var(--m-space-12); ${hair}" aria-labelledby="hc-err-${code}">
          <h2 id="hc-err-${code}" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-body-weight)">${title}</h2>
          <p class="m-muted" style="max-inline-size: 28rem">${body}</p>
          <p style="${label}">Error ${code} · signed in to Fieldstone</p>
          <div style="padding-block-start: var(--m-space-2)">${action}</div>
        </section>`;

const errors = shell(
  'Payments',
  `      <div class="m-stack" data-gap="10">
        <section class="m-stack" data-gap="5" aria-labelledby="hc-err-form" style="max-inline-size: 30rem">
          <h1 id="hc-err-form" style="${pageTitle}">Send money</h1>
          <div class="m-alert" data-tone="danger" role="alert">
            <span class="m-alert-icon">${icon(I.alert, 16)}</span>
            <div class="m-alert-content"><div class="m-alert-title">2 things need fixing</div><div class="m-alert-body">Nothing was sent. Check the routing number and the amount.</div></div>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="hc-err-routing">Routing number</label>
            <input class="m-input" id="hc-err-routing" value="02100002" aria-invalid="true" aria-describedby="hc-err-routing-e" style="font-variant-numeric: tabular-nums">
            <p class="m-field-error" id="hc-err-routing-e">A routing number has 9 digits.</p>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="hc-err-amount">Amount</label>
            <input class="m-input" id="hc-err-amount" value="$0.00" aria-invalid="true" aria-describedby="hc-err-amount-e" style="font-variant-numeric: tabular-nums">
            <p class="m-field-error" id="hc-err-amount-e">Enter an amount above $0.00. Your Operations balance is $2,023,267.12.</p>
          </div>
          <div class="m-cluster" data-justify="between">
            <button type="button" class="m-button" data-variant="ghost">Cancel</button>
            <button type="submit" class="m-button" data-variant="primary">${icon(I.send, 12)} Review payment</button>
          </div>
        </section>
        <div class="m-toast" data-tone="danger" role="alert" style="max-inline-size: 30rem"><div class="m-toast-content"><div class="m-toast-title">Payment to Bluebird Studio failed</div><div class="m-toast-body">The bank returned $419.00. Check their account details.</div></div><button type="button" class="m-button" data-size="sm">View</button></div>
${errorState('404', 'This page doesn’t exist', 'The link may be old, or the page has moved.', `<a class="m-button" href="#">Go home</a>`)}
${errorState('500', 'Something went wrong on our side', 'Nothing was changed. Try again in a moment; if it keeps happening, contact support.', `<button type="button" class="m-button">Try again</button>`)}
${errorState('403', 'You don’t have access to this', 'Only admins of Fieldstone can see payroll. Ask one to give you access.', `<button type="button" class="m-button">Request access</button>`)}
      </div>`,
);

// Reading: the public site bar, a journal bar under a hairline, then one centred article column
const reading = `<div style="font-size: var(--m-font-size-lg)">
${siteBar}
<nav class="m-cluster" data-justify="between" aria-label="Journal" style="padding: var(--m-space-3) var(--m-space-8); ${hair}; border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default); font-size: var(--m-font-size-md)">
  <a href="#" style="color: var(--m-color-fg-default); text-decoration: none">Journal</a>
  <span class="m-cluster" data-gap="8"><a href="#" style="color: var(--m-color-fg-default); text-decoration: none">Guides</a><a href="#" style="color: var(--m-color-fg-default); text-decoration: none">Product news</a><a href="#" style="color: var(--m-color-fg-default); text-decoration: none">Company</a></span>
  <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Search the journal">${icon(I.search, 16)}</button>
</nav>
<main class="m-container" data-size="md" style="padding-block: var(--m-space-12) var(--m-space-16)">
  <article class="m-stack" data-gap="6" aria-labelledby="hc-read-title">
    <header class="m-stack" data-gap="3" data-align="center" style="text-align: center">
      <span style="font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-medium); text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide)">Guides</span>
      <h1 id="hc-read-title" style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-semibold); line-height: var(--m-font-leading-tight)">How to close your books each month</h1>
      <p class="m-muted" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-regular); max-inline-size: 36rem">A five-step routine that keeps a small company's numbers right, in about an hour.</p>
      <span class="m-cluster" data-gap="2" style="${label}"><span class="m-avatar" data-size="sm">RA</span> Rosa Alvarez · Nov 6, 2026 · 7 min read</span>
    </header>
    <div class="m-prose" style="max-inline-size: 40rem; margin-inline: auto; line-height: var(--m-font-leading-relaxed)">
      <p>Closing the books means making sure every dollar that moved last month is recorded, explained and matched to a statement. Done monthly, it takes an hour. Left for a year, it takes a week and an accountant.</p>
      <h2 style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-semibold)">1. Match every receipt</h2>
      <p>Start with card spending. Each transaction over $75 needs a receipt; anything missing gets a note saying what it was for and who approved it.</p>
      <h2 style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-semibold)">2. Categorize what's left</h2>
      <p>Most transactions categorize themselves from the vendor. Check the rest against last month's categories so the same vendor lands in the same place.</p>
    </div>
  </article>
</main>
${siteFooter}
</div>`;

// Sign-in: the flow ground, the mark and a way to open an account, one white card
const signIn = `<div style="${flowGround}">
${flowBar(`<a class="m-button" data-variant="ghost" href="#" style="font-size: var(--m-font-size-lg)">Open an account ${icon(I.right, 12)}</a>`)}
<main class="m-container" data-size="sm" style="--m-layout-container-max-sm: 30rem; padding-block: var(--m-space-4) var(--m-space-16)">
  <form class="m-card" aria-labelledby="hc-sign-title">
    <div class="m-card-body m-stack" data-gap="5" style="padding: var(--m-space-10)">
      <h1 id="hc-sign-title" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-body-weight)">Log in</h1>
      <div class="m-field">
        <label class="m-field-label" for="hc-sign-email">Email</label>
        <input class="m-input" id="hc-sign-email" type="email" autocomplete="email" value="dana@fieldstone.example">
      </div>
      <div class="m-field">
        <label class="m-field-label" for="hc-sign-pass">Password</label>
        <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><input class="m-input" id="hc-sign-pass" type="password" autocomplete="current-password" value="correct-horse"><button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Show password">${icon(I.eye, 12)}</button></div>
        <a href="#" style="font-size: var(--m-font-size-xs); color: var(--m-color-fg-muted)">Forgot your password?</a>
      </div>
      <div><button type="submit" class="m-button" data-variant="primary">Log in</button></div>
    </div>
    <div class="m-card-body m-stack" data-gap="3" data-align="start" style="${hair}; padding: var(--m-space-6) var(--m-space-10) var(--m-space-8)">
      <button type="button" class="m-button">${icon(I.key, 12)} Continue with a passkey</button>
      <p style="${label}">Sign in with the device you already unlock. <a href="#" style="color: var(--m-color-fg-default)">How to set one up</a></p>
    </div>
  </form>
</main>
</div>`;

export const halcyonRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'A welcome line, a row of pill actions, the balance with its area chart, accounts, and smaller summary cards.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'Filters and the month’s figures above a full-bleed table; a row opens its own page of label-and-value rows.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'The flow ground, one white card in a narrow column, a thin progress bar, a 28px title, one question per field, Back as a quiet text button.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'The app frame with grouped settings pages; each setting a row with its label and help on the left, the value and Edit on the right.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'The page keeps its frame, title, action and column heads; one line in body type, a sentence and a link sit centred where the rows would be.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The site bar, a 480 headline, one panel split into three columns by hairlines, a yearly switch, full-width pills and a footer band.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors under the field, a summary above the form that says nothing was sent, a toast for failures elsewhere, and not found, failure and no access as centred lines inside the app frame.',
    html: errors,
  },
  {
    name: 'reading',
    title: 'Reading',
    description:
      'A journal article: the site bar and a section bar, a centred eyebrow, a 480 headline, a light lede, a byline and one 40rem column of 16px text.',
    html: reading,
  },
  {
    name: 'sign-in',
    title: 'Sign in',
    description:
      'The flow ground, the mark and Open an account, one white card: a 19px title, email and password, a primary pill, then a passkey pill under a hairline.',
    html: signIn,
  },
];
