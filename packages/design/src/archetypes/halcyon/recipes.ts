import type { ArchetypeRecipe } from '../types';

/*
 * Halcyon's six layout recipes: framework-free HTML using only @mariachi/design classes and tokens
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
  users:
    '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14a6.5 6.5 0 0 1 3.5 6"/>',
};

// A figure with its cents small and raised: $5,216,471.18
const money = (whole: string, cents: string) =>
  `${whole}<span style="font-size: 0.62em; vertical-align: 0.5em; margin-inline-start: 0.04em">.${cents}</span>`;
const figure =
  'font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-regular); letter-spacing: var(--m-font-tracking-tight); font-variant-numeric: tabular-nums';
const pageTitle =
  'font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-regular)';
const label = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
const gain = 'color: var(--m-color-success-fg)';
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)';

const nav = (items: [string, string, string?][], current: string) =>
  items
    .map(
      ([ic, l, extra]) =>
        `          <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${icon(I[ic as keyof typeof I], 14)} ${l}${extra ?? ''}</a></li>`,
    )
    .join('\n');

const shell = (
  current: string,
  main: string,
) => `<div class="m-split" style="--m-layout-split-side: 13.75rem; --m-layout-split-gap: 0; min-block-size: 100vh">
  <nav class="m-sidebar" aria-label="Main" style="${hair.replace('block-start', 'inline-end')}">
    <div class="m-stack" data-gap="4" style="padding: var(--m-space-2)">
      <div class="m-cluster" data-justify="between">
        <span class="m-cluster" data-gap="2"><span class="m-avatar" data-size="sm" style="border-radius: var(--m-radius-md)">FS</span> Fieldstone</span>
        <span class="m-badge" data-variant="solid">Pro</span>
      </div>
      <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Product">
        <button type="button" class="m-tab" role="tab" aria-selected="true">Banking</button>
        <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Payroll</button>
      </div></div>
    </div>
    <div class="m-sidebar-section">
      <ul>
${nav(
  [
    ['home', 'Home'],
    ['tasks', 'Tasks', ' <span class="m-sidebar-count">10</span>'],
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
    ['transfer', 'Transactions'],
    ['card', 'Cards'],
    ['send', 'Payments'],
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
        <li><a class="m-sidebar-link" href="#">${icon(I.bookmark, 14)} <span class="m-stack" data-gap="0">Operations<span class="m-subtle" style="font-size: var(--m-font-size-sm); font-variant-numeric: tabular-nums">$2,023,267.12</span></span></a></li>
        <li><a class="m-sidebar-link" href="#">${icon(I.bookmark, 14)} Credit card</a></li>
      </ul>
    </div>
  </nav>
  <div class="m-stack" data-gap="0">
    <header class="m-cluster" data-justify="between" style="padding: var(--m-space-2) var(--m-space-6)">
      <button type="button" class="m-button" data-variant="ghost">${icon(I.search, 14)} Search for anything</button>
      <div class="m-cluster" data-gap="1">
        <button type="button" class="m-button" data-variant="ghost">${icon(I.transfer, 14)} Move money</button>
        <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Settings">${icon(I.gear, 16)}</button>
        <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Notifications">${icon(I.bell, 16)}</button>
        <span class="m-avatar" data-size="sm" aria-label="Dana Whitfield">DW</span>
      </div>
    </header>
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
        <h1 style="${pageTitle}">Welcome, Dana</h1>
        <div class="m-cluster" data-justify="between">
          <div class="m-cluster" data-gap="2">
            <button type="button" class="m-button" data-variant="primary" data-size="sm">${icon(I.send, 14)} Send</button>
            <button type="button" class="m-button" data-size="sm">${icon(I.transfer, 14)} Transfer</button>
            <button type="button" class="m-button" data-size="sm">${icon(I.plus, 14)} Deposit</button>
            <button type="button" class="m-button" data-size="sm">${icon(I.invoice, 14)} Request</button>
            <button type="button" class="m-button" data-size="sm">${icon(I.upload, 14)} Upload bill</button>
          </div>
          <button type="button" class="m-button" data-variant="ghost" data-size="sm">Customize</button>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 24rem; --m-layout-grid-gap: var(--m-space-6)">
          <section class="m-card" aria-labelledby="hc-balance">
            <div class="m-card-body m-stack" data-gap="3">
              <div class="m-cluster" data-justify="between" data-align="start">
                <div class="m-stack" data-gap="1">
                  <h2 id="hc-balance" style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-regular)">Total balance</h2>
                  <span style="${figure}">${money('$5,216,471', '18')}</span>
                </div>
                <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="View">
                  <button type="button" class="m-tab" role="tab" aria-selected="true" aria-label="Chart">${icon(I.chart, 14)}</button>
                  <button type="button" class="m-tab" role="tab" aria-selected="false" aria-label="Table" tabindex="-1">${icon(I.table, 14)}</button>
                </div></div>
              </div>
              <div class="m-cluster" data-justify="between">
                <button type="button" class="m-button" data-variant="ghost" data-size="sm">Last 30 days ${icon(I.down, 14)}</button>
                <span class="m-cluster" data-gap="4" style="font-variant-numeric: tabular-nums">
                  <span class="m-cluster" data-gap="1" style="${gain}">${icon(I.up, 14)} $1.8M</span>
                  <span class="m-cluster" data-gap="1"><span style="color: var(--m-color-danger-fg); display: inline-flex">${icon(I.downArrow, 14)}</span> −$482K</span>
                </span>
              </div>
            </div>
            ${area}
            <div class="m-cluster" data-justify="between" style="padding: var(--m-space-2) var(--m-space-6) var(--m-space-4); ${label}"><span>Oct 17</span><span>Oct 22</span><span>Oct 27</span><span>Nov 1</span><span>Nov 6</span></div>
          </section>
          <section class="m-card" aria-labelledby="hc-accounts">
            <div class="m-card-body m-stack" data-gap="2">
              <div class="m-cluster" data-justify="between">
                <h2 id="hc-accounts" style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-regular)">Accounts</h2>
                <button type="button" class="m-button" data-size="sm" data-icon-only aria-label="Add an account">${icon(I.plus, 14)}</button>
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
              <h2 id="hc-credit" style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-regular)">Credit card</h2>
              <span style="${figure}">${money('$12,505', '87')}</span>
              <progress class="m-progress" value="25" max="100" aria-label="Credit used: 25%">25%</progress>
              <div class="m-cluster" data-justify="between" style="${label}"><span>Balance · Pending</span><span style="font-variant-numeric: tabular-nums">$21,249 available</span></div>
            </div>
          </section>
          <section class="m-card" aria-labelledby="hc-bills">
            <div class="m-card-body m-stack" data-gap="3">
              <h2 id="hc-bills" style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-regular)">Bill pay</h2>
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
            <button type="button" class="m-button" data-size="sm">${icon(I.invoice, 14)} Match receipts</button>
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
          <a href="#" class="m-cluster" data-gap="1" style="color: var(--m-color-fg-muted); text-decoration: none">${icon(I.left, 14)} Transactions</a>
          <div class="m-cluster" data-gap="4">
            <span class="m-avatar" data-size="lg">AC</span>
            <div class="m-stack" data-gap="1">
              <h1 id="hc-detail-title" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-regular)">Payment from Acme Corp</h1>
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

const onboarding = `<main class="m-container" data-size="sm" style="--m-layout-container-max-sm: 30rem; padding-block: var(--m-space-12)">
  <form class="m-stack" data-gap="8" aria-labelledby="hc-onb-title">
    <div class="m-stack" data-gap="2">
      <span style="${label}" id="hc-onb-step">Step 2 of 4</span>
      <progress class="m-progress" data-size="sm" value="2" max="4" aria-labelledby="hc-onb-step">2 of 4</progress>
    </div>
    <div class="m-stack" data-gap="2">
      <h1 id="hc-onb-title" style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-regular); line-height: var(--m-font-leading-tight)">Tell us about your company</h1>
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
      <button type="button" class="m-button" data-variant="ghost">${icon(I.left, 14)} Back</button>
      <button type="submit" class="m-button" data-variant="primary">Continue</button>
    </div>
  </form>
</main>`;

const row = (
  name: string,
  desc: string,
  value: string,
  edit = true,
) => `          <div class="m-split" style="--m-layout-split-side: 20rem; ${hair}; padding-block: var(--m-space-5)">
            <dt class="m-stack" data-gap="1"><span>${name}</span>${desc ? `<span style="${label}">${desc}</span>` : ''}</dt>
            <dd class="m-stack" data-gap="1" data-align="start">${value}${edit ? `<a href="#" class="m-cluster" data-gap="1" style="color: var(--m-color-accent-text); text-decoration: none; font-size: var(--m-font-size-sm)">Edit ${icon(I.right, 12)}</a>` : ''}</dd>
          </div>`;

const settingsNav = (groups: [string, string[]][], current: string) =>
  groups
    .map(
      ([h, items]) => `    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">${h}</h2>
      <ul>
${items.map((l) => `        <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${l}</a></li>`).join('\n')}
      </ul>
    </div>`,
    )
    .join('\n');

const settings = `<div class="m-split" style="--m-layout-split-side: 13.75rem; --m-layout-split-gap: 0; min-block-size: 100vh">
  <nav class="m-sidebar" aria-label="Settings" style="${hair.replace('block-start', 'inline-end')}">
    <a href="#" class="m-cluster" data-gap="1" style="padding: var(--m-space-2); color: var(--m-color-fg-default); text-decoration: none">${icon(I.left, 14)} Settings</a>
${settingsNav(
  [
    ['Company', ['Company profile', 'Plans & billing', 'Documents', 'Categories', 'Integrations']],
    ['Team', ['Team', 'Departments', 'Advisors']],
    ['Security & controls', ['Activity log', 'Approval rules', 'Controls']],
  ],
  'Company profile',
)}
  </nav>
  <div>
  <main class="m-container" data-size="md" style="padding-block: var(--m-space-10) var(--m-space-12)">
    <div class="m-stack" data-gap="6">
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
        <h2 id="hc-close" style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-regular)">Close account</h2>
        <p class="m-muted">Closing sends your balance of $5,216,471.18 to a linked account, then cancels cards and scheduled payments. It can't be undone.</p>
        <div><button type="button" class="m-button" data-variant="danger">Close account…</button></div>
      </section>
    </div>
  </main>
  </div>
</div>`;

const emptyState = `<main class="m-container" data-size="md" style="padding-block: var(--m-space-16)">
  <div class="m-stack" data-gap="4" data-align="center" style="text-align: center">
    <span style="color: var(--m-color-fg-subtle)">${icon(I.users, 40)}</span>
    <h1 style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-regular)">No recipients yet</h1>
    <p class="m-muted" style="max-inline-size: 26rem">Recipients are the people and companies you pay. Add one, and every payment to them is two clicks.</p>
    <div class="m-cluster" data-gap="2" data-justify="center">
      <button type="button" class="m-button" data-variant="primary">${icon(I.plus, 14)} Add recipient</button>
      <button type="button" class="m-button">Import from a file</button>
    </div>
  </div>
</main>`;

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
          <h2 id="hc-tier-${(accentWord || name).toLowerCase()}" style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-regular)">${name}${accentWord ? ` <span style="color: var(--m-color-accent-default)">${accentWord}</span>` : ''}</h2>
          <span style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-regular); font-variant-numeric: tabular-nums">${price}</span>
          <p class="m-muted">${note}</p>
        </div>
        <button type="button" class="m-button"${primary ? ' data-variant="primary"' : ''} style="inline-size: 100%">${primary ? 'Start a 30-day trial' : 'Open an account'}</button>
        <div class="m-stack" data-gap="3">
          <h3 style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium)">${intro}</h3>
          <ul class="m-stack" data-gap="2" style="padding: 0">
${features.map((f) => `            <li class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${icon(I.check, 14)}${f}</li>`).join('\n')}
          </ul>
        </div>
      </section>`;

const pricing = `<main class="m-container" style="padding-block: var(--m-space-16)">
  <div class="m-stack" data-gap="10">
    <div class="m-stack" data-gap="3" data-align="center" style="text-align: center">
      <h1 style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-4xl); font-weight: var(--m-font-weight-regular); line-height: var(--m-font-leading-tight)">Pricing that fits<br>your company</h1>
      <p class="m-muted" style="font-size: var(--m-font-size-lg); max-inline-size: 32rem">Banking and the essentials are always $0 a month, with more as your company grows.</p>
    </div>
    <section class="m-card" style="padding: 0" aria-label="Compare plans">
      <div class="m-cluster" data-justify="between" style="padding: var(--m-space-4) var(--m-space-6)">
        <span style="font-size: var(--m-font-size-sm); text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide); color: var(--m-color-fg-muted)">Compare plans</span>
        <label class="m-field" data-layout="inline"><input class="m-switch" type="checkbox" role="switch" checked> Yearly pricing (15% off)</label>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 16rem; --m-layout-grid-gap: 0; ${hair}">
${tier('Essentials', '', '$0/mo.', 'Banking and the finance basics, included with every account.', 'Jump to a section:', ['Banking', 'Sending and receiving money', 'Cards and expenses', 'Invoicing', 'Bill pay'], false, true)}
${tier('Essentials', 'Plus', '$29.90/mo.', 'For companies that need more efficiency and simpler invoicing.', 'Everything in Essentials, plus:', ['Invoices paid by bank debit', 'Unlimited tax filings', 'Priority support', 'Accounting sync'], true)}
${tier('Essentials', 'Pro', '$299/mo.', 'For complex operations that need a relationship manager.', 'Everything in Plus, and more:', ['A relationship manager', 'Advanced approval rules', 'Custom user roles', 'Priority wires'])}
      </div>
      <a href="#" class="m-cluster" data-gap="2" data-justify="center" style="padding: var(--m-space-3); background: var(--m-color-bg-sunken); color: var(--m-color-fg-default); text-decoration: none; ${hair}; border-end-start-radius: inherit; border-end-end-radius: inherit">Personal banking is free with any company plan, $240 a year covered ${icon(I.arrow, 14)}</a>
    </section>
    <section class="m-stack" data-gap="3" aria-labelledby="hc-faq" style="max-inline-size: 44rem; margin-inline: auto; inline-size: 100%">
      <h2 id="hc-faq" style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-regular)">Questions</h2>
      <div class="m-accordion">
        <details class="m-accordion-item" name="hc-faq" open><summary>What does it cost to run my company's banking here?</summary><div class="m-accordion-content">Nothing: no monthly fees, no minimum balance, and domestic and international wires in dollars are free.</div></details>
        <details class="m-accordion-item" name="hc-faq"><summary>How do you price currency exchange?</summary><div class="m-accordion-content">A 1% fee on the amount converted, shown before you send, on top of the market rate.</div></details>
        <details class="m-accordion-item" name="hc-faq"><summary>Can I change plans later?</summary><div class="m-accordion-content">Yes, any time. Upgrades apply at once; downgrades at the end of the billing period.</div></details>
      </div>
    </section>
  </div>
</main>`;

// Errors: inline on the field, a summary above the form, a toast for what happened elsewhere, and
// full pages for not found, failure and no access. Quiet: the icon and the words carry it, not colour.
const errorPage = (
  code: string,
  ic: string,
  title: string,
  body: string,
  actions: string,
) => `  <section class="m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-16); ${hair}" aria-labelledby="hc-err-${code}">
    <span style="color: var(--m-color-fg-subtle)">${icon(ic, 40)}</span>
    <span style="${label}; font-family: var(--m-font-family-mono)">${code}</span>
    <h1 id="hc-err-${code}" style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-regular)">${title}</h1>
    <p class="m-muted" style="max-inline-size: 28rem">${body}</p>
    <div class="m-cluster" data-gap="2" data-justify="center">${actions}</div>
  </section>`;

const errors = `<main class="m-container" data-size="md" style="padding-block: var(--m-space-12)">
  <div class="m-stack" data-gap="10">
    <section class="m-stack" data-gap="5" aria-labelledby="hc-err-form">
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
        <button type="submit" class="m-button" data-variant="primary">${icon(I.send, 14)} Review payment</button>
      </div>
    </section>
    <section class="m-stack" data-gap="3" aria-label="A toast">
      <div class="m-toast" data-tone="danger" role="alert"><div class="m-toast-content"><div class="m-toast-title">Payment to Bluebird Studio failed</div><div class="m-toast-body">The bank returned $419.00. Check their account details.</div></div><button type="button" class="m-button" data-size="sm">View</button></div>
    </section>
${errorPage('404', I.search, 'This page doesn’t exist', 'The link may be old, or the page has moved.', `<a class="m-button" data-variant="primary" href="#">${icon(I.home, 14)} Go home</a>`)}
${errorPage('500', I.alert, 'Something went wrong on our side', 'Nothing was changed. Try again in a moment; if it keeps happening, contact support.', `<button type="button" class="m-button">Try again</button><button type="button" class="m-button" data-variant="ghost">Contact support</button>`)}
${errorPage('403', I.lock, 'You don’t have access to this', 'Only admins of Fieldstone can see payroll. Ask one to give you access.', `<button type="button" class="m-button" data-variant="primary">Request access</button><a class="m-button" data-variant="ghost" href="#">Go back</a>`)}
  </div>
</main>`;

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
      'One narrow column, a thin progress bar, light large headings, one question per field, Back as a quiet text button.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'Grouped settings nav; each setting a row with its label and help on the left, the value and Edit on the right.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description: 'A thin outline icon, a light heading, one sentence, a primary pill and a quiet alternative.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'One panel split into three columns by hairlines, a yearly switch, full-width pills and a footer band.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors under the field, a summary above the form that says nothing was sent, a toast for failures elsewhere, and full pages for 404, 500 and no access.',
    html: errors,
  },
];
