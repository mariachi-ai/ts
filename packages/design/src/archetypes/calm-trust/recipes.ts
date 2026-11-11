import type { ArchetypeRecipe } from '../types';

/*
 * Calm trust's six layout recipes: framework-free HTML using only @mariachi/design classes and
 * tokens (no colour literals), with sample data from a small business's money app. An agent copies
 * the shape and swaps the data; DESIGN.md says the same in words.
 */

// Lucide icons, outlined, 1.5px stroke (DESIGN.md: icons)
const icon = (paths: string, size = 16, label?: string) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"${label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"'}>${paths}</svg>`;
const up = (label: string) => icon('<path d="M7 7h10v10"/><path d="M7 17 17 7"/>', 14, label);
const down = (label: string) => icon('<path d="m7 7 10 10"/><path d="M17 7v10H7"/>', 14, label);
const check = icon('<path d="M20 6 9 17l-5-5"/>', 16);

const figure =
  'font-variant-numeric: tabular-nums; font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-tight)';
const mono = 'font-family: var(--m-font-family-mono)';

const sidebar = (current: string) => `<nav class="m-sidebar" aria-label="Main">
    <div class="m-sidebar-section">
      <ul>
${['Overview', 'Payments', 'Invoices', 'Payees', 'Reports', 'Settings']
  .map(
    (l) => `        <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${l}</a></li>`,
  )
  .join('\n')}
      </ul>
    </div>
  </nav>`;

const figureCard = (label: string, amount: string, change: string) => `<div class="m-card" data-size="sm">
        <div class="m-card-body m-stack" data-gap="1">
          <span class="m-muted">${label}</span>
          <span style="${figure}">${amount}</span>
          ${change}
        </div>
      </div>`;

const changeLine = (dir: 'up' | 'down', text: string, period: string) =>
  `<span class="m-cluster" data-gap="1" style="color: var(--m-color-${dir === 'up' ? 'success' : 'danger'}-fg); font-size: var(--m-font-size-sm); font-variant-numeric: tabular-nums">${dir === 'up' ? up('Up') : down('Down')} ${text} <span class="m-muted">${period}</span></span>`;

// A plain bar chart in the accent: one series, so one colour
const bars = [62, 58, 64, 71, 69, 74, 80, 77, 83, 86, 81, 88, 92, 90, 95];
const chart = `<svg viewBox="0 0 900 160" width="100%" role="img" aria-label="Balance over the last 30 days, rising from $41,300 to $48,210">
          ${bars.map((h, i) => `<rect x="${i * 60 + 8}" y="${160 - h * 1.6}" width="44" height="${h * 1.6}" rx="3" fill="var(--m-color-accent-default)"/>`).join('')}
        </svg>`;

const status = (s: 'Paid' | 'Due' | 'Overdue' | 'Failed' | 'Draft') =>
  `<span class="m-badge" data-tone="${{ Paid: 'success', Due: 'info', Overdue: 'warning', Failed: 'danger', Draft: 'accent' }[s]}">${s}</span>`;

const dashboard = `<div class="m-split" style="--m-layout-split-side: 15rem; --m-layout-split-gap: 0; min-block-size: 100%">
  ${sidebar('Overview')}
  <main class="m-container" style="padding-block: var(--m-space-8)">
    <div class="m-stack" data-gap="6">
      <div class="m-stack" data-gap="1">
        <h1>Good morning, Dana</h1>
        <span class="m-muted">Acme Ltd · Thursday, November 14</span>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 13rem; --m-layout-grid-gap: var(--m-space-6)">
      ${figureCard('Balance', '$48,210.55', changeLine('up', '+$2,140.00', 'this month'))}
      ${figureCard('Money in', '$12,400.00', changeLine('up', '+8.2%', 'vs October'))}
      ${figureCard('Money out', '$9,180.20', changeLine('down', '−3.1%', 'vs October'))}
      ${figureCard('Due this week', '$3,610.50', '<span class="m-muted" style="font-size: var(--m-font-size-sm)">3 invoices</span>')}
      </div>
      <section class="m-card" aria-labelledby="ct-chart-title">
        <div class="m-card-header">
          <h2 class="m-card-title" id="ct-chart-title">Balance, last 30 days</h2>
          <p class="m-card-description">Updated 2 minutes ago</p>
        </div>
        <div class="m-card-body">
        ${chart}
        </div>
      </section>
      <section class="m-stack" data-gap="3" aria-labelledby="ct-activity-title">
        <div class="m-cluster" data-justify="between">
          <h2 id="ct-activity-title">Recent activity</h2>
          <a href="#">See all</a>
        </div>
        <div class="m-table-wrap">
          <table class="m-table">
            <thead><tr><th>Date</th><th>Description</th><th>Status</th><th data-numeric>Amount</th></tr></thead>
            <tbody>
              <tr><td>Nov 14</td><td>Acme Logistics · INV-2041</td><td>${status('Paid')}</td><td data-numeric>+$12,400.00</td></tr>
              <tr><td>Nov 13</td><td>Payroll · November, first half</td><td>${status('Paid')}</td><td data-numeric>−$6,820.00</td></tr>
              <tr><td>Nov 12</td><td>Bluebird Studio · INV-2040</td><td>${status('Due')}</td><td data-numeric>$2,150.00</td></tr>
              <tr><td>Nov 11</td><td>Office rent · Harbor &amp; Pine</td><td>${status('Paid')}</td><td data-numeric>−$1,950.00</td></tr>
              <tr><td>Nov 10</td><td>Card payment · Cloud hosting</td><td>${status('Failed')}</td><td data-numeric>−$410.20</td></tr>
              <tr><td>Nov 9</td><td>Kessler GmbH · INV-2039</td><td>${status('Overdue')}</td><td data-numeric>€8,920.00 EUR</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
</div>`;

const listDetail = `<div class="m-container" style="padding-block: var(--m-space-8)">
  <div class="m-stack" data-gap="10">
    <!-- The list -->
    <section class="m-stack" data-gap="4" aria-labelledby="ct-list-title">
      <div class="m-cluster" data-justify="between">
        <h1 id="ct-list-title">Invoices</h1>
        <button type="button" class="m-button" data-variant="primary">New invoice</button>
      </div>
      <div class="m-cluster" data-gap="2" role="search">
        <input class="m-input" type="search" placeholder="Search by customer or number" aria-label="Search invoices" style="min-inline-size: 18rem">
        <select class="m-select" aria-label="Status"><option>All statuses</option><option>Due</option><option>Overdue</option><option>Paid</option></select>
        <select class="m-select" aria-label="Period"><option>Last 90 days</option><option>This year</option></select>
      </div>
      <div class="m-table-wrap">
        <table class="m-table" data-sticky>
          <thead><tr><th>Number</th><th>Customer</th><th>Issued</th><th>Due</th><th>Status</th><th data-numeric>Amount</th></tr></thead>
          <tbody>
            <tr><td><a href="#" style="${mono}">INV-2041</a></td><td>Acme Logistics</td><td>Nov 4</td><td>Dec 4</td><td>${status('Due')}</td><td data-numeric>$12,400.00</td></tr>
            <tr><td><a href="#" style="${mono}">INV-2040</a></td><td>Bluebird Studio</td><td>Oct 18</td><td>Nov 17</td><td>${status('Due')}</td><td data-numeric>$2,150.00</td></tr>
            <tr><td><a href="#" style="${mono}">INV-2039</a></td><td>Kessler GmbH</td><td>Oct 1</td><td>Oct 31</td><td>${status('Overdue')}</td><td data-numeric>€8,920.00 EUR</td></tr>
            <tr><td><a href="#" style="${mono}">INV-2038</a></td><td>Harbor &amp; Pine</td><td>Sep 30</td><td>Oct 30</td><td>${status('Paid')}</td><td data-numeric>$3,610.50</td></tr>
            <tr><td><a href="#" style="${mono}">INV-2037</a></td><td>Northfield Clinic</td><td>Sep 12</td><td>Oct 12</td><td>${status('Paid')}</td><td data-numeric>$980.00</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <hr class="m-divider">

    <!-- The detail: a page of its own, not a drawer -->
    <section class="m-stack" data-gap="6" aria-labelledby="ct-detail-title">
      <nav class="m-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="#">Invoices</a></li><li><span aria-current="page">INV-2041</span></li></ol></nav>
      <div class="m-cluster" data-justify="between" data-align="start">
        <div class="m-stack" data-gap="2">
          <div class="m-cluster" data-gap="3"><h1 id="ct-detail-title" style="${mono}">INV-2041</h1>${status('Due')}</div>
          <span style="${figure}">$12,400.00 <span class="m-muted" style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-regular)">USD</span></span>
          <span class="m-muted">Acme Logistics · due Dec 4, in 20 days</span>
        </div>
        <div class="m-cluster" data-gap="2">
          <button type="button" class="m-button">Download PDF</button>
          <button type="button" class="m-button" data-variant="primary">Record payment</button>
        </div>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 18rem">
        <section class="m-card" aria-labelledby="ct-details">
          <div class="m-card-header"><h2 class="m-card-title" id="ct-details">Details</h2></div>
          <div class="m-card-body">
            <dl class="m-stack" data-gap="3">
              <div class="m-cluster" data-justify="between"><dt class="m-muted">Customer</dt><dd>Acme Logistics</dd></div>
              <div class="m-cluster" data-justify="between"><dt class="m-muted">Issued</dt><dd>Nov 4, 2026</dd></div>
              <div class="m-cluster" data-justify="between"><dt class="m-muted">Terms</dt><dd>Net 30</dd></div>
              <div class="m-cluster" data-justify="between"><dt class="m-muted">Pays into</dt><dd style="${mono}">Checking ···· 4821</dd></div>
            </dl>
          </div>
        </section>
        <section class="m-card" aria-labelledby="ct-activity">
          <div class="m-card-header"><h2 class="m-card-title" id="ct-activity">Activity</h2></div>
          <div class="m-card-body">
            <ol class="m-stack" data-gap="3" style="padding: 0">
              <li class="m-stack" data-gap="0"><span>Viewed by Acme Logistics</span><span class="m-muted">Nov 6, 10:12</span></li>
              <li class="m-stack" data-gap="0"><span>Sent to billing@acme-logistics.example</span><span class="m-muted">Nov 4, 16:40</span></li>
              <li class="m-stack" data-gap="0"><span>Created by Dana Whitfield</span><span class="m-muted">Nov 4, 16:31</span></li>
            </ol>
          </div>
        </section>
      </div>
      <section class="m-card" aria-labelledby="ct-lines">
        <div class="m-card-header"><h2 class="m-card-title" id="ct-lines">Line items</h2></div>
        <div class="m-card-body">
          <table class="m-table">
            <thead><tr><th>Item</th><th data-numeric>Qty</th><th data-numeric>Unit price</th><th data-numeric>Amount</th></tr></thead>
            <tbody>
              <tr><td>Freight audit, October</td><td data-numeric>1</td><td data-numeric>$9,500.00</td><td data-numeric>$9,500.00</td></tr>
              <tr><td>Route planning workshop</td><td data-numeric>2</td><td data-numeric>$1,450.00</td><td data-numeric>$2,900.00</td></tr>
              <tr><th scope="row">Total</th><td></td><td></td><td data-numeric><strong>$12,400.00</strong></td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  </div>
</div>`;

const onboarding = `<main class="m-container" data-size="sm" style="--m-layout-container-max-sm: 30rem; padding-block: var(--m-space-12)">
  <form class="m-stack" data-gap="6" aria-labelledby="ct-onb-title">
    <div class="m-stack" data-gap="2">
      <span class="m-muted" id="ct-onb-step">Step 2 of 4 · Your business</span>
      <progress class="m-progress" value="2" max="4" aria-labelledby="ct-onb-step">2 of 4</progress>
    </div>
    <div class="m-stack" data-gap="1">
      <h1 id="ct-onb-title">Tell us about your business</h1>
      <p class="m-muted">We use this to set up payouts. You can change it later in Settings.</p>
    </div>
    <div class="m-field">
      <label class="m-field-label" for="ct-onb-name" data-required>Legal business name</label>
      <input class="m-input" id="ct-onb-name" value="Acme Ltd" aria-describedby="ct-onb-name-hint">
      <p class="m-field-hint" id="ct-onb-name-hint">Why we ask: it must match the name on your bank account, or payouts are held.</p>
    </div>
    <div class="m-field">
      <label class="m-field-label" for="ct-onb-country" data-required>Country</label>
      <select class="m-select" id="ct-onb-country" aria-describedby="ct-onb-country-hint"><option>United States</option><option>United Kingdom</option><option>Germany</option></select>
      <p class="m-field-hint" id="ct-onb-country-hint">Why we ask: it decides your currency and the tax form you'll need.</p>
    </div>
    <div class="m-field">
      <label class="m-field-label" for="ct-onb-ein">Employer Identification Number</label>
      <input class="m-input" id="ct-onb-ein" value="12-34567" aria-invalid="true" aria-describedby="ct-onb-ein-error" style="${mono}">
      <p class="m-field-error" id="ct-onb-ein-error">An EIN has 9 digits, like 12-3456789.</p>
    </div>
    <div class="m-cluster" data-justify="between">
      <button type="button" class="m-button">Back</button>
      <button type="submit" class="m-button" data-variant="primary">Continue</button>
    </div>
    <p class="m-subtle" style="font-size: var(--m-font-size-sm)">Your answers are saved as you go.</p>
  </form>
</main>`;

const settings = `<div class="m-container" style="padding-block: var(--m-space-8)">
  <div class="m-stack" data-gap="6">
    <h1>Settings</h1>
    <div class="m-split" style="--m-layout-split-side: 13.75rem; --m-layout-split-gap: var(--m-space-8)">
      <nav class="m-sidebar" aria-label="Settings sections">
        <div class="m-sidebar-section">
          <ul>
${['Profile', 'Business', 'Bank accounts', 'Notifications', 'Security', 'Close account']
  .map(
    (l) =>
      `            <li><a class="m-sidebar-link" href="#"${l === 'Bank accounts' ? ' aria-current="page"' : ''}>${l}</a></li>`,
  )
  .join('\n')}
          </ul>
        </div>
      </nav>
      <div class="m-stack" data-gap="6">
        <section class="m-card" aria-labelledby="ct-set-accounts">
          <div class="m-card-header">
            <div class="m-stack" data-gap="1">
              <h2 class="m-card-title" id="ct-set-accounts">Bank accounts</h2>
              <p class="m-card-description">Where payouts go. The default account receives every payout unless an invoice says otherwise.</p>
            </div>
          </div>
          <div class="m-card-body">
            <table class="m-table">
              <thead><tr><th>Account</th><th>Number</th><th>Currency</th><th></th></tr></thead>
              <tbody>
                <tr><td>Checking <span class="m-badge">Default</span></td><td style="${mono}">···· 4821</td><td>USD</td><td data-numeric><button type="button" class="m-button" data-variant="ghost" data-size="sm">Edit</button></td></tr>
                <tr><td>Euro account</td><td style="${mono}">DE89 ···· 3000</td><td>EUR</td><td data-numeric><button type="button" class="m-button" data-variant="ghost" data-size="sm">Edit</button></td></tr>
              </tbody>
            </table>
          </div>
          <div class="m-card-footer"><button type="button" class="m-button">Add an account</button></div>
        </section>
        <section class="m-card" aria-labelledby="ct-set-payouts">
          <div class="m-card-header"><h2 class="m-card-title" id="ct-set-payouts">Payout schedule</h2></div>
          <div class="m-card-body m-stack" data-gap="4">
            <div class="m-field">
              <label class="m-field-label" for="ct-set-freq">Pay out</label>
              <select class="m-select" id="ct-set-freq" aria-describedby="ct-set-freq-hint"><option>Daily</option><option selected>Weekly, on Mondays</option><option>Monthly, on the 1st</option></select>
              <p class="m-field-hint" id="ct-set-freq-hint">Your next payout is Monday, November 18.</p>
            </div>
          </div>
          <div class="m-card-footer"><button type="button" class="m-button" data-variant="primary">Save</button></div>
        </section>
        <section class="m-card" aria-labelledby="ct-set-notify">
          <div class="m-card-header"><h2 class="m-card-title" id="ct-set-notify">Notifications</h2></div>
          <div class="m-card-body m-stack" data-gap="3">
            <label class="m-field" data-layout="inline"><input class="m-switch" type="checkbox" role="switch" checked> An invoice is paid</label>
            <label class="m-field" data-layout="inline"><input class="m-switch" type="checkbox" role="switch" checked> A payment fails</label>
            <label class="m-field" data-layout="inline"><input class="m-switch" type="checkbox" role="switch"> Weekly summary</label>
          </div>
          <div class="m-card-footer"><button type="button" class="m-button" data-variant="primary">Save</button></div>
        </section>
        <section class="m-card" data-variant="outline" style="--m-card-border: var(--m-color-danger-border)" aria-labelledby="ct-set-close">
          <div class="m-card-header">
            <div class="m-stack" data-gap="1">
              <h2 class="m-card-title" id="ct-set-close">Close account</h2>
              <p class="m-card-description">Closing pays out your balance of $48,210.55 to Checking ···· 4821, then cancels open invoices. It can't be undone.</p>
            </div>
          </div>
          <div class="m-card-footer"><button type="button" class="m-button" data-variant="danger">Close account…</button></div>
        </section>
      </div>
    </div>
  </div>
</div>`;

const emptyState = `<div class="m-container" data-size="md" style="padding-block: var(--m-space-12)">
  <section class="m-card" aria-labelledby="ct-empty-title">
    <div class="m-card-body m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-12)">
      <span style="color: var(--m-color-fg-subtle)">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="12" width="36" height="26" rx="4"/><path d="M6 20h36"/><circle cx="32" cy="29" r="3"/><path d="M12 29h10"/></svg>
      </span>
      <h2 id="ct-empty-title">No payees yet</h2>
      <p class="m-muted" style="max-inline-size: 28rem">Payees are the people and companies you pay. Add one to send your first payment.</p>
      <div class="m-cluster" data-gap="4" data-justify="center">
        <button type="button" class="m-button" data-variant="primary">Add a payee</button>
        <a href="#">Learn how payments work</a>
      </div>
    </div>
  </section>
</div>`;

const tier = (
  name: string,
  price: string,
  note: string,
  features: string[],
  chosen = false,
) => `<section class="m-card"${chosen ? ' style="--m-card-border: var(--m-color-accent-default); --m-card-border-width: var(--m-border-width-thick)"' : ''} aria-labelledby="ct-tier-${name.toLowerCase()}">
        <div class="m-card-body m-stack" data-gap="5" style="flex: 1">
          <div class="m-stack" data-gap="1">
            <div class="m-cluster" data-gap="2"><h2 class="m-card-title" id="ct-tier-${name.toLowerCase()}">${name}</h2>${chosen ? '<span class="m-badge" data-tone="accent">Most chosen</span>' : ''}</div>
            <p class="m-muted">${note}</p>
          </div>
          <div><span style="${figure}">${price}</span> <span class="m-muted">a month</span></div>
          <ul class="m-stack" data-gap="2" style="padding: 0">
${features.map((f) => `            <li class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span style="color: var(--m-color-accent-text); display: inline-flex">${check}</span>${f}</li>`).join('\n')}
          </ul>
        </div>
        <div class="m-card-footer"><button type="button" class="m-button"${chosen ? ' data-variant="primary"' : ''} style="inline-size: 100%">Choose ${name}</button></div>
      </section>`;

const pricing = `<main class="m-container" style="padding-block: var(--m-space-12)">
  <div class="m-stack" data-gap="8">
    <div class="m-stack" data-gap="2" data-align="center" style="text-align: center">
      <h1>Simple pricing, no surprises</h1>
      <p class="m-muted">Every plan includes unlimited invoices. Cancel any time; you're charged for the days you used.</p>
      <fieldset class="m-cluster" data-gap="4" data-justify="center">
        <legend class="m-sr-only">Billing period</legend>
        <label class="m-field" data-layout="inline"><input class="m-radio" type="radio" name="ct-period" checked> Monthly</label>
        <label class="m-field" data-layout="inline"><input class="m-radio" type="radio" name="ct-period"> Yearly, save $48 a year on Business</label>
      </fieldset>
    </div>
    <div class="m-grid" style="--m-layout-grid-min: 16rem; --m-layout-grid-gap: var(--m-space-6)">
      ${tier('Starter', '$0', 'For trying it out', ['Up to 5 invoices a month', 'One bank account', 'Email support'])}
      ${tier('Business', '$24', 'For most small businesses', ['Unlimited invoices', 'Three bank accounts', 'Automatic reminders', 'Support within 4 hours'], true)}
      ${tier('Scale', '$79', 'For teams with approvals', ['Everything in Business', 'Approval rules', 'Ten seats', 'A named account manager'])}
    </div>
    <section class="m-stack" data-gap="3" aria-labelledby="ct-faq" style="max-inline-size: 44rem; margin-inline: auto; inline-size: 100%">
      <h2 id="ct-faq">Questions</h2>
      <div class="m-accordion">
        <details class="m-accordion-item" name="ct-faq" open><summary>Are there fees on payments?</summary><div class="m-accordion-content">Bank transfers are free. Card payments cost 2.9% + $0.30, shown on every invoice before it's sent.</div></details>
        <details class="m-accordion-item" name="ct-faq"><summary>Can I change plans later?</summary><div class="m-accordion-content">Yes. Upgrades apply at once and you pay the difference for the rest of the month; downgrades apply at the next renewal.</div></details>
        <details class="m-accordion-item" name="ct-faq"><summary>Where is my data kept?</summary><div class="m-accordion-content">In the region you choose at sign-up, encrypted at rest. You can export everything as CSV at any time.</div></details>
      </div>
    </section>
  </div>
</main>`;

export const calmTrustRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description: 'A greeting, three or four figure cards, one primary chart, and recent activity as a short table.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'Filters above a table; a row opens a detail page with breadcrumbs, the key figure, sections as cards and actions top right.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One narrow column, a stepper, one question per step, why each piece of data is needed, Back always there.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'Sections on the left; each section a card with its own Save; closing the account last, in an outlined danger card.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'A small outlined illustration, one sentence on what goes here, one primary action and a "Learn how" link.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'Three tiers, the middle one marked by a border and a badge (not a fill), the saving as a figure, an FAQ below.',
    html: pricing,
  },
];
