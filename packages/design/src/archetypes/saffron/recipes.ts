import type { ArchetypeRecipe } from '../types';

/*
 * Saffron's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from a small bakery's email marketing app ("Posy"). They
 * follow the language's real screen patterns: a thin yellow stripe across the top of the app, a white
 * top bar with a centred search, a white sidebar whose current row sits on a grey fill, flat bordered
 * cards, figures in the serif, help terms with a dashed teal underline, change badges on flat tints,
 * teal text links ending in an arrow, and big yellow pill buttons only on public pages.
 */

// Lucide icons, outlined, 1.5px stroke
const icon = (paths: string, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  write:
    '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  overview:
    '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  contacts:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
  sends: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
  journeys:
    '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
  pages:
    '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  results: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  library:
    '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  apps: '<path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2"/><rect x="14" y="2" width="8" height="8" rx="1"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  left: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  up: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  dn: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  upload: '<path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
  filter: '<path d="M2 5h20"/><path d="M6 12h12"/><path d="M9 19h6"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  click:
    '<path d="M14 4.1 12 6"/><path d="m5.1 8-2.9-.8"/><path d="m6 12-1.9 2"/><path d="M7.2 2.2 8 5.1"/><path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"/>',
  send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/>',
  userPlus:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  calendar:
    '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  sparkles:
    '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
  layout:
    '<rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/>',
};

// Type and the small repeated treatments
const pageTitle =
  'font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)';
const sectionTitle = 'font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium)';
const serif = (size: string) =>
  `font-family: var(--m-font-family-display); font-size: var(--m-font-size-${size}); font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)`;
const figure =
  'font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight); font-variant-numeric: tabular-nums';
// A term with help behind it: a dashed teal underline
const term = (t: string) =>
  `<span style="text-decoration: underline dashed var(--m-color-accent-default); text-decoration-thickness: 2px; text-underline-offset: 5px">${t}</span>`;
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)';
const label = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
// A teal text link that ends in an arrow
const more = (t: string) =>
  `<a href="#" class="m-cluster" data-gap="1" style="color: var(--m-color-accent-text); text-decoration: none; font-weight: var(--m-font-weight-medium)">${t} ${icon(I.right, 16)}</a>`;
// Change badges on a flat tint, with an arrow
const rise = (v: string) => `<span class="m-badge" data-tone="success">${icon(I.up, 14)} ${v}</span>`;
const fall = (v: string) => `<span class="m-badge" data-tone="danger">${icon(I.dn, 14)} ${v}</span>`;
// The big public button: the brand yellow, a pill, warm ink
const yellowPill =
  'background: var(--m-color-brand-default); color: var(--m-color-brand-fg); border-color: var(--m-color-brand-fg); border-radius: var(--m-radius-full); font-weight: var(--m-font-weight-bold)';
const inkPill =
  'background: transparent; color: var(--m-color-fg-default); border-color: var(--m-color-fg-default); border-radius: var(--m-radius-full); font-weight: var(--m-font-weight-bold)';
// The product's wordmark: a plain word in the serif
const wordmark = `<a href="#" style="${serif('xl')}; color: var(--m-color-fg-default); text-decoration: none">Posy</a>`;
const serifAvatar = (initial: string, size = '') =>
  `<span class="m-avatar"${size ? ` data-size="${size}"` : ''} style="font-family: var(--m-font-family-display)">${initial}</span>`;

const navItem = (ic: string, l: string, current: string, extra = '', sub = '') =>
  `          <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${icon(I[ic as keyof typeof I], 20)} ${l}${extra}</a>${sub}</li>`;
const subNav = (items: string[], current: string) =>
  `<ul>${items.map((l) => `<li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${l}</a></li>`).join('')}</ul>`;

// The app: a yellow stripe, the top bar with a centred search, then the sidebar beside the page
const shell = (
  current: string,
  main: string,
  sub = '',
) => `<div style="min-block-size: 100vh; border-block-start: 4px solid var(--m-color-brand-default); background: var(--m-color-bg-canvas)">
  <header class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-5); background: var(--m-color-bg-surface); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default); gap: var(--m-space-4)">
    ${wordmark}
    <span style="position: relative; flex: 1; max-inline-size: 28rem; display: flex">
      <span style="position: absolute; inset-inline-start: var(--m-space-3); inset-block: 0; display: flex; align-items: center; color: var(--m-color-fg-muted)">${icon(I.search, 18)}</span>
      <input class="m-input" type="search" placeholder="Search Posy" aria-label="Search" style="padding-inline-start: var(--m-space-10)">
    </span>
    <span class="m-cluster" data-gap="3">
      <button type="button" class="m-button" data-size="sm">Help</button>
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Notifications" style="color: var(--m-color-fg-default)">${icon(I.bell, 20)}</button>
      ${serifAvatar('W')}
    </span>
  </header>
  <div class="m-split" style="--m-layout-split-side: 13.5rem; --m-layout-split-gap: 0">
    <nav class="m-sidebar" aria-label="Main">
      <div class="m-sidebar-section">
        <button type="button" class="m-button" style="inline-size: 100%; justify-content: flex-start">${icon(I.write, 18)} Write</button>
      </div>
      <div class="m-sidebar-section">
        <ul>
${navItem('overview', 'Overview', current)}
${navItem('contacts', 'Contacts', current, ' <span class="m-sidebar-count">4,812</span>', subNav(['All contacts', 'Groups', 'Imports'], sub))}
${navItem('sends', 'Sends', current)}
${navItem('journeys', 'Journeys', current)}
${navItem('pages', 'Pages', current, ' <span class="m-badge" data-tone="info">New</span>')}
${navItem('results', 'Results', current)}
${navItem('library', 'Library', current)}
${navItem('apps', 'Apps', current)}
        </ul>
      </div>
    </nav>
    <main class="m-container" style="padding-block: var(--m-space-8) var(--m-space-16)">
${main}
    </main>
  </div>
</div>`;

// A metric in a row of four: the term, the figure in the serif, its change
const metric = (
  ic: string,
  t: string,
  value: string,
  change: string,
  first = false,
) => `            <div class="m-stack" data-gap="2" style="padding: var(--m-space-5) var(--m-space-6)${first ? '' : '; border-inline-start: var(--m-border-width-thin) solid var(--m-color-border-default)'}">
              <span class="m-cluster" data-gap="2" style="color: var(--m-color-fg-default)">${icon(I[ic as keyof typeof I], 18)} ${term(t)}</span>
              <span style="${figure}">${value}</span>
              <span>${change}</span>
            </div>`;

// New contacts by week: pale teal bars, the picked week solid with its flag
const weeks = [38, 52, 44, 61, 57, 70, 66, 84, 79, 92, 88, 104];
const bars = weeks
  .map((v, i) => {
    const h = v * 1.3;
    const x = i * 50 + 12;
    const picked = i === 9;
    return `<rect x="${x}" y="${150 - h}" width="26" height="${h}" style="fill: var(--m-color-accent-default)"${picked ? '' : ' opacity="0.3"'}/>`;
  })
  .join('');
const chart = `<svg viewBox="0 0 600 160" width="100%" style="display: block; block-size: 11rem" role="img" aria-label="New contacts by week for twelve weeks, rising from 38 to 104">
              <g style="stroke: var(--m-color-border-default)" stroke-width="1"><path d="M0 150.5H600"/><path d="M0 100.5H600" stroke-dasharray="3 4"/><path d="M0 50.5H600" stroke-dasharray="3 4"/></g>
              ${bars}
            </svg>`;

const sendRow = (
  name: string,
  kind: string,
  status: string,
  tone: string,
  sent: string,
  opens: string,
  clicks: string,
) => `            <tr>
              <td><span class="m-stack" data-gap="0"><a href="#" style="color: var(--m-color-accent-text); font-weight: var(--m-font-weight-medium); text-decoration: none">${name}</a><span style="${label}">${kind}</span></span></td>
              <td><span class="m-badge"${tone ? ` data-tone="${tone}"` : ''}>${status}</span></td>
              <td data-numeric>${sent}</td>
              <td data-numeric>${opens}</td>
              <td data-numeric>${clicks}</td>
              <td style="text-align: end"><button type="button" class="m-button" data-size="sm">View results</button></td>
            </tr>`;

const dashboard = shell(
  'Overview',
  `      <div class="m-stack" data-gap="8">
        <div class="m-cluster" data-justify="between">
          <h1 style="${pageTitle}">Overview</h1>
          <div class="m-cluster" data-gap="3">
            <button type="button" class="m-button">Shortcuts ${icon(I.down, 16)}</button>
            <button type="button" class="m-button" data-variant="primary">New email</button>
          </div>
        </div>
        <div class="m-field" style="max-inline-size: 16rem">
          <label class="m-field-label" for="sf-range">Showing</label>
          <select class="m-select" id="sf-range"><option>Past 4 weeks</option><option>Past 12 weeks</option><option>This year</option></select>
        </div>
        <section class="m-stack" data-gap="3" aria-labelledby="sf-email">
          <div class="m-cluster" data-justify="between">
            <h2 id="sf-email" class="m-cluster" data-gap="2" style="${sectionTitle}">Email results <span class="m-subtle" style="display: inline-flex">${icon(I.info, 18)}</span></h2>
            ${more('All results')}
          </div>
          <div class="m-card" style="padding: 0">
            <div class="m-grid" style="--m-layout-grid-min: 12rem; --m-layout-grid-gap: 0">
${metric('eye', 'Open rate', '48.6%', rise('4.1%'), true)}
${metric('click', 'Click rate', '6.2%', rise('0.8%'))}
${metric('sends', 'Emails sent', '18,940', '<span class="m-badge">Same as before</span>')}
${metric('contacts', 'Unsubscribes', '37', fall('12'))}
            </div>
          </div>
        </section>
        <div class="m-grid" style="--m-layout-grid-min: 22rem; --m-layout-grid-gap: var(--m-space-6)">
          <section class="m-stack" data-gap="3" aria-labelledby="sf-growth">
            <div class="m-cluster" data-justify="between">
              <h2 id="sf-growth" class="m-cluster" data-gap="2" style="${sectionTitle}">Contact growth <span class="m-subtle" style="display: inline-flex">${icon(I.info, 18)}</span></h2>
              ${more('Contacts')}
            </div>
            <div class="m-card">
              <div class="m-card-body m-stack" data-gap="4">
                <div class="m-cluster" data-justify="between" data-align="end">
                  <div class="m-stack" data-gap="1"><span style="${label}">${term('New contacts')}</span><span style="${figure}">1,027</span></div>
                  <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Period">
                    <button type="button" class="m-tab" role="tab" aria-selected="true">Weekly</button>
                    <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Monthly</button>
                  </div></div>
                </div>
                <div style="position: relative">
                  <span style="position: absolute; inset-block-start: 0; inset-inline-start: 74%; background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse); font-size: var(--m-font-size-xs); padding: var(--m-space-1) var(--m-space-2); border-radius: var(--m-radius-sm)">92 · Oct 20</span>
                  ${chart}
                </div>
                <div class="m-cluster" data-justify="between" style="${label}"><span>Aug 25</span><span>Sep 22</span><span>Oct 20</span><span>Nov 10</span></div>
              </div>
            </div>
          </section>
          <section class="m-stack" data-gap="3" aria-labelledby="sf-revenue">
            <div class="m-cluster" data-justify="between">
              <h2 id="sf-revenue" class="m-cluster" data-gap="2" style="${sectionTitle}">Shop sales from email <span class="m-subtle" style="display: inline-flex">${icon(I.info, 18)}</span></h2>
              ${more('Store')}
            </div>
            <div class="m-card">
              <div class="m-card-body m-stack" data-gap="4">
                <div class="m-cluster" data-gap="8">
                  <div class="m-stack" data-gap="1"><span style="${label}">${term('Revenue')}</span><span style="${figure}">$6,482</span>${rise('18%')}</div>
                  <div class="m-stack" data-gap="1"><span style="${label}">${term('Orders')}</span><span style="${figure}">214</span>${rise('9%')}</div>
                  <div class="m-stack" data-gap="1"><span style="${label}">${term('Average order')}</span><span style="${figure}">$30.29</span>${fall('2%')}</div>
                </div>
                <ul class="m-stack" data-gap="0" style="padding: 0; ${hair}">
                  <li class="m-cluster" data-justify="between" style="padding-block: var(--m-space-3); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)"><span>Rye and fennel loaf</span><span class="m-muted" style="font-variant-numeric: tabular-nums">68 sold · $748</span></li>
                  <li class="m-cluster" data-justify="between" style="padding-block: var(--m-space-3); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)"><span>Saturday pastry box</span><span class="m-muted" style="font-variant-numeric: tabular-nums">41 sold · $1,435</span></li>
                  <li class="m-cluster" data-justify="between" style="padding-block: var(--m-space-3)"><span>Starter kit</span><span class="m-muted" style="font-variant-numeric: tabular-nums">19 sold · $532</span></li>
                </ul>
              </div>
            </div>
          </section>
        </div>
        <section class="m-stack" data-gap="3" aria-labelledby="sf-recent">
          <div class="m-cluster" data-justify="between">
            <h2 id="sf-recent" style="${sectionTitle}">Recent sends</h2>
            ${more('All sends')}
          </div>
          <div class="m-table-wrap">
            <table class="m-table">
              <thead><tr><th>Name</th><th>Status</th><th data-numeric>Recipients</th><th data-numeric>Opens</th><th data-numeric>Clicks</th><th aria-label="Actions"></th></tr></thead>
              <tbody>
${sendRow('The autumn loaf club is back', 'Regular email · Bread lovers', 'Sent', 'success', '3,904', '51.2%', '7.9%')}
${sendRow('Two seats left in Sunday’s sourdough class', 'Regular email · Class waitlist', 'Sent', 'success', '612', '63.0%', '14.4%')}
${sendRow('Market stall hours for November', 'Regular email · Everyone', 'Scheduled', 'info', '4,812', '—', '—')}
${sendRow('Thank you for your first order', 'Journey · New customers', 'Ongoing', 'warning', '1,148', '58.7%', '9.1%')}
${sendRow('Holiday pre-orders', 'Regular email · Everyone', 'Draft', '', '—', '—', '—')}
              </tbody>
            </table>
          </div>
        </section>
      </div>`,
);

const contactRow = (
  email: string,
  name: string,
  status: string,
  tone: string,
  source: string,
  added: string,
  tags: string[],
  checked = false,
) => `              <tr${checked ? ' aria-selected="true"' : ''}>
                <td><input class="m-checkbox" type="checkbox" aria-label="Select ${name}"${checked ? ' checked' : ''}></td>
                <td><a href="#" style="color: var(--m-color-accent-text); text-decoration: none">${email}</a></td>
                <td>${name}</td>
                <td><span class="m-badge"${tone ? ` data-tone="${tone}"` : ''}>${status}</span></td>
                <td>${source}</td>
                <td style="white-space: nowrap">${added}</td>
                <td><span class="m-cluster" data-gap="1">${tags.map((t) => `<span class="m-badge">${t}</span>`).join('')}</span></td>
              </tr>`;

const activity = (ic: string, what: string, when: string) =>
  `<li class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap; padding-block: var(--m-space-3); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)"><span style="color: var(--m-color-fg-muted); display: inline-flex; padding-block-start: 2px">${icon(I[ic as keyof typeof I], 18)}</span><span class="m-stack" data-gap="0"><span>${what}</span><span style="${label}">${when}</span></span></li>`;
const detailRow = (k: string, v: string) =>
  `<div class="m-stack" data-gap="1" style="padding-block: var(--m-space-3); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)"><dt style="${label}">${k}</dt><dd>${v}</dd></div>`;

const listDetail = shell(
  '',
  `      <div class="m-stack" data-gap="12">
        <!-- The list: tabs by status, a search and filters, then a frameless table -->
        <section class="m-stack" data-gap="5" aria-labelledby="sf-contacts">
          <div class="m-cluster" data-justify="between">
            <h1 id="sf-contacts" style="${pageTitle}">Contacts</h1>
            <div class="m-cluster" data-gap="3">
              <button type="button" class="m-button">${icon(I.upload, 16)} Import</button>
              <button type="button" class="m-button" data-variant="primary">${icon(I.userPlus, 16)} Add a contact</button>
            </div>
          </div>
          <p class="m-muted" style="max-inline-size: 44rem">Your contacts are everyone who has bought from you or asked to hear from you. <a href="#" style="color: var(--m-color-accent-text)">How contacts work</a></p>
          <div class="m-tabs"><div class="m-tab-list" role="tablist" aria-label="Status">
            <button type="button" class="m-tab" role="tab" aria-selected="true">Everyone (4,812)</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Opted in (4,206)</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Waiting to confirm (131)</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Opted out (475)</button>
          </div></div>
          <div class="m-cluster" data-justify="between">
            <div class="m-cluster" data-gap="3" role="search">
              <span style="position: relative; display: flex; inline-size: 18rem">
                <span style="position: absolute; inset-inline-start: var(--m-space-3); inset-block: 0; display: flex; align-items: center; color: var(--m-color-fg-muted)">${icon(I.search, 16)}</span>
                <input class="m-input" type="search" data-size="sm" placeholder="Search by name or email" aria-label="Search contacts" style="padding-inline-start: var(--m-space-8)">
              </span>
              <select class="m-select" data-size="sm" aria-label="Group"><option>Any group</option><option>Bread lovers</option><option>Class waitlist</option></select>
              <button type="button" class="m-button" data-size="sm">${icon(I.filter, 16)} More filters</button>
            </div>
            <span class="m-cluster" data-gap="3"><span style="${label}">1 selected</span><button type="button" class="m-button" data-size="sm">${icon(I.tag, 16)} Add to group</button></span>
          </div>
          <div class="m-table-wrap">
            <table class="m-table">
              <thead><tr><th><input class="m-checkbox" type="checkbox" aria-label="Select all"></th><th>Email address</th><th>Name</th><th>Status</th><th>Joined from</th><th>Added</th><th>Groups</th></tr></thead>
              <tbody>
${contactRow('maya.okafor@example.com', 'Maya Okafor', 'Opted in', 'success', 'Shop checkout', 'Nov 9, 2026', ['Bread lovers'], true)}
${contactRow('theo.lindqvist@example.com', 'Theo Lindqvist', 'Opted in', 'success', 'Sign-up page', 'Nov 7, 2026', ['Class waitlist', 'Local'])}
${contactRow('priya.raman@example.com', 'Priya Raman', 'Waiting to confirm', 'warning', 'Pop-up form', 'Nov 6, 2026', ['Local'])}
${contactRow('sam.achterberg@example.com', 'Sam Achterberg', 'Opted in', 'success', 'Import', 'Oct 30, 2026', ['Wholesale'])}
${contactRow('lucia.ferraro@example.com', 'Lucía Ferraro', 'Opted out', 'danger', 'Shop checkout', 'Oct 28, 2026', [])}
${contactRow('dev.marsh@example.com', 'Dev Marsh', 'Opted in', 'success', 'Added by hand', 'Oct 21, 2026', ['Bread lovers'])}
              </tbody>
            </table>
          </div>
          <div class="m-cluster" data-justify="between">
            <span style="${label}">Showing 1–6 of 4,812</span>
            <nav class="m-pagination" aria-label="Pagination"><ul>
              <li><a class="m-pagination-item" aria-disabled="true" aria-label="Previous page">${icon(I.left, 16)}</a></li>
              <li><a class="m-pagination-item" href="#" aria-current="page">1</a></li>
              <li><a class="m-pagination-item" href="#">2</a></li>
              <li><a class="m-pagination-item" href="#">3</a></li>
              <li><span class="m-pagination-ellipsis" aria-hidden="true">…</span></li>
              <li><a class="m-pagination-item" href="#">802</a></li>
              <li><a class="m-pagination-item" href="#" aria-label="Next page">${icon(I.right, 16)}</a></li>
            </ul></nav>
          </div>
        </section>
        <!-- The detail: a contact's own page, opened from a row -->
        <section class="m-stack" data-gap="6" aria-labelledby="sf-contact" style="${hair}; padding-block-start: var(--m-space-10)">
          <nav class="m-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="#">Contacts</a></li><li><span aria-current="page">Maya Okafor</span></li></ol></nav>
          <div class="m-cluster" data-justify="between">
            <div class="m-cluster" data-gap="4">
              ${serifAvatar('M', 'lg')}
              <div class="m-stack" data-gap="1">
                <h2 id="sf-contact" style="${pageTitle}">Maya Okafor</h2>
                <span class="m-cluster" data-gap="2"><span class="m-muted">maya.okafor@example.com</span><span class="m-badge" data-tone="success">Opted in</span></span>
              </div>
            </div>
            <div class="m-cluster" data-gap="3">
              <button type="button" class="m-button" data-icon-only aria-label="More actions">${icon(I.more, 18)}</button>
              <button type="button" class="m-button">Edit</button>
              <button type="button" class="m-button" data-variant="primary">${icon(I.send, 16)} Send an email</button>
            </div>
          </div>
          <div class="m-grid" style="--m-layout-grid-min: 20rem; --m-layout-grid-gap: var(--m-space-6)">
            <div class="m-card">
              <div class="m-card-body m-stack" data-gap="2">
                <h3 style="${sectionTitle}">Details</h3>
                <dl style="margin: 0">
                  ${detailRow('Phone', '(503) 555-0142')}
                  ${detailRow('Birthday', 'March 14')}
                  ${detailRow('Joined from', 'Shop checkout, Nov 9, 2026')}
                  ${detailRow('Groups', '<span class="m-badge">Bread lovers</span>')}
                  ${detailRow('Lifetime orders', '<span style="font-variant-numeric: tabular-nums">7 · $218.40</span>')}
                </dl>
              </div>
            </div>
            <div class="m-card">
              <div class="m-card-body m-stack" data-gap="2">
                <div class="m-cluster" data-justify="between"><h3 style="${sectionTitle}">Activity</h3>${more('Full history')}</div>
                <ul class="m-stack" data-gap="0" style="padding: 0">
                  ${activity('eye', 'Opened “The autumn loaf club is back”', 'Nov 10, 2026 · 8:14 am')}
                  ${activity('click', 'Clicked “Reserve a loaf” in “The autumn loaf club is back”', 'Nov 10, 2026 · 8:15 am')}
                  ${activity('sends', 'Was sent “The autumn loaf club is back”', 'Nov 10, 2026 · 7:00 am')}
                  ${activity('userPlus', 'Joined from the shop checkout', 'Nov 9, 2026 · 4:52 pm')}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>`,
  'All contacts',
);

// Onboarding: a narrow form column beside a brand panel built from token shapes, never an illustration
const option = (name: string, title: string, desc: string, checked = false) =>
  `<label class="m-cluster" data-gap="3" data-align="start" style="padding: var(--m-space-4); border: var(--m-border-width-thin) solid ${checked ? 'var(--m-color-accent-default)' : 'var(--m-color-border-strong)'}; border-radius: var(--m-radius-sm); cursor: pointer"><input class="m-radio" type="radio" name="${name}"${checked ? ' checked' : ''} style="margin-block-start: 2px"><span class="m-stack" data-gap="0"><span style="font-weight: var(--m-font-weight-medium)">${title}</span><span style="${label}">${desc}</span></span></label>`;

const onboarding = `<div style="min-block-size: 100vh; border-block-start: 4px solid var(--m-color-brand-default); background: var(--m-color-bg-canvas)">
  <header class="m-cluster" data-justify="between" style="padding: var(--m-space-4) var(--m-space-6)">
    ${wordmark}
    <a href="#" style="color: var(--m-color-accent-text)">Finish later</a>
  </header>
  <div class="m-grid" style="--m-layout-grid-min: 22rem; --m-layout-grid-gap: 0; align-items: stretch">
    <main class="m-stack" data-gap="6" style="padding: var(--m-space-10) clamp(1rem, 6vw, 5rem); max-inline-size: 38rem">
      <div class="m-stack" data-gap="2">
        <span style="${label}">Step 2 of 4</span>
        <progress class="m-progress" value="50" max="100" aria-label="Set-up progress: step 2 of 4">50%</progress>
      </div>
      <h1 style="${serif('3xl')}">Tell us about your business</h1>
      <p class="m-muted" style="font-size: var(--m-font-size-lg)">We’ll use this to suggest your first email and fill in the footer every email needs.</p>
      <div class="m-field">
        <label class="m-field-label" for="sf-biz">Business name</label>
        <input class="m-input" id="sf-biz" value="Wildflower Bakehouse">
      </div>
      <div class="m-field">
        <label class="m-field-label" for="sf-site">Website <span class="m-subtle">(optional)</span></label>
        <input class="m-input" id="sf-site" placeholder="www.example.com">
        <p class="m-field-hint">We’ll pull your logo and colours from it.</p>
      </div>
      <fieldset class="m-stack" data-gap="3" style="border: 0; padding: 0; margin: 0">
        <legend style="font-weight: var(--m-font-weight-medium); margin-block-end: var(--m-space-3)">What do you mostly sell?</legend>
        ${option('sf-sell', 'Things people buy online', 'A shop with products and checkout', true)}
        ${option('sf-sell', 'Services and bookings', 'Classes, appointments, events')}
        ${option('sf-sell', 'Nothing yet', 'Just getting started, and that’s fine')}
      </fieldset>
      <div class="m-cluster" data-justify="between" style="padding-block-start: var(--m-space-4)">
        <button type="button" class="m-button" data-variant="ghost">${icon(I.left, 16)} Back</button>
        <button type="button" class="m-button" data-variant="primary" data-size="lg">Continue</button>
      </div>
    </main>
    <aside aria-hidden="true" style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg); padding: var(--m-space-12) var(--m-space-10); display: flex; flex-direction: column; justify-content: center; gap: var(--m-space-8); min-block-size: 24rem; overflow: hidden">
      <div style="position: relative; block-size: 12rem">
        <span style="position: absolute; inset-inline-start: 0; inset-block-start: 1rem; inline-size: 9rem; block-size: 9rem; border-radius: var(--m-radius-full); background: var(--m-color-brand-fg)"></span>
        <span style="position: absolute; inset-inline-start: 6rem; inset-block-start: 0; inline-size: 11rem; block-size: 7rem; border-radius: var(--m-radius-lg); background: var(--m-color-bg-surface); border: 2px solid var(--m-color-brand-fg)"></span>
        <span style="position: absolute; inset-inline-start: 8rem; inset-block-start: 1.5rem; inline-size: 7rem; block-size: 0.75rem; border-radius: var(--m-radius-full); background: var(--m-color-brand-fg)"></span>
        <span style="position: absolute; inset-inline-start: 8rem; inset-block-start: 3.25rem; inline-size: 5rem; block-size: 0.75rem; border-radius: var(--m-radius-full); background: var(--m-color-brand-subtle)"></span>
      </div>
      <p style="${serif('3xl')}; color: var(--m-color-brand-fg); max-inline-size: 22rem">Your first email can go out today.</p>
    </aside>
  </div>
</div>`;

// Settings: tabs across the top, then sections with their title and help on the left and fields on the right
const settingsSection = (
  id: string,
  title: string,
  help: string,
  body: string,
  first = false,
) => `        <section class="m-split" style="--m-layout-split-side: 17rem; --m-layout-split-gap: var(--m-space-10); ${first ? '' : `${hair}; `}padding-block: var(--m-space-8)" aria-labelledby="${id}">
          <div class="m-stack" data-gap="2"><h2 id="${id}" style="${sectionTitle}">${title}</h2><p class="m-muted" style="font-size: var(--m-font-size-sm)">${help}</p></div>
          <div class="m-stack" data-gap="5">
${body}
          </div>
        </section>`;
const toggle = (title: string, desc: string, on: boolean) =>
  `            <label class="m-cluster" data-justify="between" data-align="start" style="gap: var(--m-space-6); flex-wrap: nowrap"><span class="m-stack" data-gap="0"><span>${title}</span><span style="${label}">${desc}</span></span><input class="m-switch" type="checkbox" role="switch"${on ? ' checked' : ''}></label>`;

const settings = shell(
  '',
  `      <div class="m-stack" data-gap="6" style="max-inline-size: 60rem">
        <h1 style="${pageTitle}">Settings</h1>
        <div class="m-tabs"><div class="m-tab-list" role="tablist" aria-label="Settings">
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Your profile</button>
          <button type="button" class="m-tab" role="tab" aria-selected="true">Business</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Sending</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Team</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Plan and billing</button>
        </div></div>
        <div>
${settingsSection(
  'sf-set-biz',
  'Business details',
  'Shown in the footer of every email, as the law in most places asks.',
  `            <div class="m-field"><label class="m-field-label" for="sf-s-name">Business name</label><input class="m-input" id="sf-s-name" value="Wildflower Bakehouse"></div>
            <div class="m-field"><label class="m-field-label" for="sf-s-addr">Street address</label><input class="m-input" id="sf-s-addr" value="218 Larch Street"></div>
            <div class="m-grid" style="--m-layout-grid-min: 9rem; --m-layout-grid-gap: var(--m-space-4)">
              <div class="m-field"><label class="m-field-label" for="sf-s-city">City</label><input class="m-input" id="sf-s-city" value="Portland"></div>
              <div class="m-field"><label class="m-field-label" for="sf-s-zip">Postcode</label><input class="m-input" id="sf-s-zip" value="97214"></div>
            </div>
            <div class="m-field"><label class="m-field-label" for="sf-s-tz">Time zone</label><select class="m-select" id="sf-s-tz"><option>Pacific Time (US and Canada)</option></select><p class="m-field-hint">Scheduled sends go out in this time zone.</p></div>`,
  true,
)}
${settingsSection(
  'sf-set-from',
  'Who emails come from',
  'The name and address people see in their inbox. Replies go to the same address.',
  `            <div class="m-field"><label class="m-field-label" for="sf-s-from">From name</label><input class="m-input" id="sf-s-from" value="Wildflower Bakehouse"></div>
            <div class="m-field"><label class="m-field-label" for="sf-s-email">From address</label><input class="m-input" id="sf-s-email" value="hello@example.com"><p class="m-field-hint"><span class="m-cluster" data-gap="1" style="color: var(--m-color-success-fg)">${icon(I.check, 14)} Verified</span></p></div>`,
)}
${settingsSection(
  'sf-set-notify',
  'Notifications',
  'What we email you about. These take effect at once.',
  `${toggle('A weekly summary', 'Opens, clicks and sales from the past seven days, every Monday', true)}
${toggle('When a send finishes', 'One email once everyone has received it', true)}
${toggle('Tips and new features', 'Now and then, never more than twice a month', false)}`,
)}
        </div>
        <div class="m-cluster" data-justify="end" data-gap="3" style="${hair}; padding-block-start: var(--m-space-6)">
          <button type="button" class="m-button" data-variant="ghost">Discard changes</button>
          <button type="button" class="m-button" data-variant="primary">Save changes</button>
        </div>
        <section class="m-card" aria-labelledby="sf-close" style="margin-block-start: var(--m-space-8)">
          <div class="m-card-body m-cluster" data-justify="between" style="gap: var(--m-space-6)">
            <div class="m-stack" data-gap="1"><h2 id="sf-close" style="${sectionTitle}">Close this account</h2><p class="m-muted" style="font-size: var(--m-font-size-sm)">Your contacts, sends and results are deleted after 30 days. Export them first if you need them.</p></div>
            <button type="button" class="m-button" data-variant="danger">Close account</button>
          </div>
        </section>
      </div>`,
);

// Empty state: a plain heading and sentence, one action, and three ways in on tinted tiles made of token shapes
const way = (
  tint: string,
  ic: string,
  title: string,
  desc: string,
  action: string,
) => `          <div class="m-card" style="padding: 0; overflow: hidden">
            <div style="background: ${tint}; block-size: 8rem; display: grid; place-items: center; color: var(--m-color-fg-default)">${icon(I[ic as keyof typeof I], 40)}</div>
            <div class="m-card-body m-stack" data-gap="2" data-align="center" style="text-align: center">
              <h3 style="${sectionTitle}">${title}</h3>
              <p class="m-muted" style="font-size: var(--m-font-size-sm)">${desc}</p>
              <button type="button" class="m-button" data-size="sm">${action}</button>
            </div>
          </div>`;

const emptyState = shell(
  'Journeys',
  `      <div class="m-stack" data-gap="10">
        <h1 style="${pageTitle}">Journeys</h1>
        <section class="m-stack" data-gap="4" data-align="center" style="text-align: center; background: var(--m-color-bg-sunken); border-radius: var(--m-radius-lg); padding: var(--m-space-12) var(--m-space-6)" aria-labelledby="sf-empty">
          <h2 id="sf-empty" style="${serif('3xl')}">Send the right note at the right time</h2>
          <p class="m-muted" style="max-inline-size: 34rem; font-size: var(--m-font-size-lg)">A journey sends emails on its own when something happens, like a first order or a birthday. You don’t have any yet.</p>
          <div class="m-cluster" data-gap="3" data-justify="center">
            <button type="button" class="m-button" data-variant="primary" data-size="lg">${icon(I.plus, 16)} Build a journey</button>
            <button type="button" class="m-button" data-variant="ghost" data-size="lg">See how journeys work</button>
          </div>
        </section>
        <section class="m-stack" data-gap="4" aria-labelledby="sf-start">
          <h2 id="sf-start" style="${sectionTitle}">Start from a common one</h2>
          <div class="m-grid" style="--m-layout-grid-min: 15rem; --m-layout-grid-gap: var(--m-space-6)">
${way('var(--m-color-success-bg)', 'userPlus', 'Welcome new contacts', 'Three short emails over a week for everyone who joins.', 'Use this')}
${way('var(--m-color-selection-bg)', 'sends', 'Follow up a first order', 'Say thanks, then ask how it went a week later.', 'Use this')}
${way('var(--m-color-brand-subtle)', 'calendar', 'Celebrate a birthday', 'A note and an offer on the day, every year.', 'Use this')}
          </div>
        </section>
      </div>`,
);

// Pricing: the public site — a white bar, a serif headline with a yellow underline, square plan columns
// split by hairlines, yellow pill buttons, a striped comparison and plain questions
const plan = (
  name: string,
  blurb: string,
  price: string,
  per: string,
  then: string,
  cta: string,
  ctaStyle: string,
  popular = false,
) => `        <div class="m-stack" data-gap="4" style="padding-block-end: var(--m-space-6); border-inline-start: var(--m-border-width-thin) solid var(--m-color-border-default)">
          <div style="${popular ? 'background: var(--m-color-selection-bg); color: var(--m-color-selection-fg); ' : ''}text-align: center; padding: var(--m-space-2); font-size: var(--m-font-size-sm); min-block-size: 2.5rem">${popular ? term('Most popular') : ''}</div>
          <div class="m-stack" data-gap="4" style="padding-inline: var(--m-space-5)">
            <h3 style="${serif('2xl')}">${name}</h3>
            <p class="m-muted" style="font-size: var(--m-font-size-sm); min-block-size: 3em">${blurb}</p>
            <div class="m-stack" data-gap="1" style="border: var(--m-border-width-thin) solid var(--m-color-border-strong); border-radius: var(--m-radius-sm); padding: var(--m-space-3)">
              <span><span style="${serif('3xl')}">${price}</span> <span style="font-size: var(--m-font-size-sm)">${per}</span></span>
              <span style="${label}">${then}</span>
            </div>
            <a href="#" class="m-button" data-size="lg" style="${ctaStyle}">${cta}</a>
          </div>
        </div>`;
const compareRow = (feature: string, cells: string[]) =>
  `<tr><td>${term(feature)}</td>${cells.map((c) => `<td>${c === 'yes' ? `<span aria-label="Included">${icon(I.check, 18)}</span>` : c === 'no' ? `<span class="m-subtle" aria-label="Not included">${icon(I.x, 18)}</span>` : c}</td>`).join('')}</tr>`;

const pricing = `<div style="background: var(--m-color-bg-canvas)">
<header class="m-navbar">
  <a class="m-navbar-brand" href="#">Posy</a>
  <nav class="m-navbar-nav" aria-label="Main">
    <a class="m-navbar-link" href="#">What it does</a>
    <a class="m-navbar-link" href="#">Who it’s for</a>
    <a class="m-navbar-link" href="#">Guides</a>
    <a class="m-navbar-link" href="#" aria-current="page">Plans</a>
  </nav>
  <div class="m-navbar-actions">
    <a class="m-button" href="#" style="${inkPill}">Log in</a>
    <a class="m-button" href="#" style="${yellowPill}">Start free</a>
  </div>
</header>
<main class="m-container" style="padding-block: var(--m-space-12) var(--m-space-16)">
  <div class="m-stack" data-gap="12">
    <div class="m-stack" data-gap="5" data-align="center" style="text-align: center">
      <div class="m-cluster" data-gap="0" role="tablist" aria-label="Product" style="border: var(--m-border-width-thin) solid var(--m-color-fg-default); border-radius: var(--m-radius-full); padding: var(--m-space-1)">
        <button type="button" role="tab" aria-selected="true" class="m-button" data-variant="ghost" style="border-radius: var(--m-radius-full); background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)">Email</button>
        <button type="button" role="tab" aria-selected="false" class="m-button" data-variant="ghost" style="border-radius: var(--m-radius-full); color: var(--m-color-fg-default)">Email and texts</button>
      </div>
      <h1 style="${serif('4xl')}; max-inline-size: 40rem">Plans that grow with your list, starting <span style="box-shadow: inset 0 -0.16em var(--m-color-brand-default)">free</span></h1>
      <p class="m-muted" style="font-size: var(--m-font-size-lg); max-inline-size: 36rem">Every plan comes with the email designer, sign-up pages and results. Pay for more as you add contacts.</p>
    </div>
    <div style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg); padding: var(--m-space-4); text-align: center" class="m-cluster" data-justify="center" data-gap="3">
      <span><strong style="font-weight: var(--m-font-weight-bold)">Not sure which?</strong> Answer three questions and we’ll suggest one.</span>
      <a href="#" class="m-cluster" data-gap="1" style="color: var(--m-color-brand-fg); font-weight: var(--m-font-weight-bold); text-decoration: none">Help me choose ${icon(I.right, 16)}</a>
    </div>
    <section aria-label="Plans" class="m-grid" style="--m-layout-grid-min: 15rem; --m-layout-grid-gap: 0; background: var(--m-color-bg-surface); border: var(--m-border-width-thin) solid var(--m-color-border-default); border-inline-start: 0">
${plan('Starter', 'For a first list. Send a few emails a month and see what works.', '$0', '/month', 'Up to 400 contacts', 'Sign up', inkPill)}
${plan('Grow', 'Journeys, testing and scheduling for a list that’s taking off.', '$16', '/month', 'For 500 contacts, then $3 per 100 more', 'Start a free trial', yellowPill, true)}
${plan('Team', 'Every tool, more people and help on the phone, for busy shops.', '$290', '/month', 'For 10,000 contacts, billed monthly', 'Start a free trial', yellowPill)}
    </section>
    <section class="m-stack" data-gap="4" aria-labelledby="sf-compare">
      <h2 id="sf-compare" style="${serif('2xl')}; text-align: center">Compare what’s included</h2>
      <div class="m-table-wrap" style="border: var(--m-border-width-thin) solid var(--m-color-border-default)">
        <table class="m-table" data-striped>
          <thead><tr><th>Feature</th><th>Starter</th><th>Grow</th><th>Team</th></tr></thead>
          <tbody>
            ${compareRow('Emails a month', ['2,000', '6,000', '150,000'])}
            ${compareRow('People on the account', ['1', '3', 'Unlimited'])}
            ${compareRow('Journeys', ['1 step', 'Up to 100', 'Unlimited'])}
            ${compareRow('Send-time testing', ['no', 'yes', 'yes'])}
            ${compareRow('Your own email footer', ['no', 'yes', 'yes'])}
            ${compareRow('Phone support', ['no', 'no', 'yes'])}
          </tbody>
        </table>
      </div>
    </section>
    <section class="m-stack" data-gap="2" aria-labelledby="sf-faq" style="max-inline-size: 48rem; margin-inline: auto; inline-size: 100%">
      <h2 id="sf-faq" style="${serif('2xl')}">Questions people ask</h2>
      <div class="m-accordion" style="border-inline: 0">
        <details class="m-accordion-item" name="sf-faq" open><summary>How long is the free trial?</summary><div class="m-accordion-content">Fourteen days on Grow or Team, with no card needed to start. We’ll remind you two days before it ends.</div></details>
        <details class="m-accordion-item" name="sf-faq"><summary>What counts as a contact?</summary><div class="m-accordion-content">Anyone on your list who has opted in or is waiting to confirm. People who opt out don’t count.</div></details>
        <details class="m-accordion-item" name="sf-faq"><summary>Can I change plans later?</summary><div class="m-accordion-content">Yes, whenever you like. Moving up takes effect at once; moving down at the end of the month.</div></details>
      </div>
    </section>
  </div>
</main>
</div>`;

// Errors: on the field, a summary above the form, the dark snackbar for something elsewhere, and full pages
const errorPage = (
  code: string,
  ic: string,
  title: string,
  body: string,
  actions: string,
) => `    <section class="m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-12); ${hair}" aria-labelledby="sf-err-${code}">
      <span style="color: var(--m-color-fg-muted)">${icon(ic, 40)}</span>
      <span style="${label}; font-family: var(--m-font-family-mono)">Error ${code}</span>
      <h1 id="sf-err-${code}" style="${serif('3xl')}">${title}</h1>
      <p class="m-muted" style="max-inline-size: 30rem">${body}</p>
      <div class="m-cluster" data-gap="3" data-justify="center">${actions}</div>
    </section>`;

const errors = `<div style="min-block-size: 100vh; border-block-start: 4px solid var(--m-color-brand-default); background: var(--m-color-bg-canvas)">
<main class="m-container" data-size="md" style="padding-block: var(--m-space-10)">
  <div class="m-stack" data-gap="10">
    <section class="m-stack" data-gap="5" aria-labelledby="sf-err-form">
      <h1 id="sf-err-form" style="${pageTitle}">Schedule this email</h1>
      <div class="m-alert" data-tone="danger" role="alert">
        <span class="m-alert-icon">${icon(I.alert, 18)}</span>
        <div class="m-alert-content"><div class="m-alert-title">Fix 2 things before this can be scheduled</div><div class="m-alert-body">Nothing has been sent. The time and the subject line need another look.</div></div>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="sf-err-subject">Subject line</label>
        <input class="m-input" id="sf-err-subject" value="" aria-invalid="true" aria-describedby="sf-err-subject-e">
        <p class="m-field-error" id="sf-err-subject-e">Add a subject line. It’s the first thing people read.</p>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="sf-err-when">Send on</label>
        <input class="m-input" id="sf-err-when" value="Nov 3, 2026 at 7:00 am" aria-invalid="true" aria-describedby="sf-err-when-e">
        <p class="m-field-error" id="sf-err-when-e">That time has passed. Pick a time after now (Nov 12, 10:40 am).</p>
      </div>
      <div class="m-cluster" data-justify="between">
        <button type="button" class="m-button" data-variant="ghost">Cancel</button>
        <button type="submit" class="m-button" data-variant="primary">${icon(I.calendar, 16)} Schedule</button>
      </div>
    </section>
    <section class="m-stack" data-gap="3" aria-label="A snackbar">
      <div class="m-toast" data-tone="danger" role="alert"><div class="m-toast-content"><div class="m-toast-title">“Market stall hours” didn’t send</div><div class="m-toast-body">Your sending address needs to be verified again.</div></div><button type="button" class="m-button" data-size="sm" data-variant="ghost" style="color: var(--m-color-fg-inverse); text-decoration: underline">Verify</button></div>
    </section>
${errorPage('404', I.search, 'We can’t find that page', 'The link might be old, or the page has moved. Try searching, or head back to your overview.', `<a class="m-button" data-variant="primary" href="#">Go to overview</a>`)}
${errorPage('500', I.alert, 'Something went wrong on our end', 'Nothing was changed, and nothing was sent. Give it a minute and try again.', `<button type="button" class="m-button" data-variant="primary">${icon(I.zap, 16)} Try again</button><button type="button" class="m-button">Check our status</button>`)}
${errorPage('403', I.lock, 'This part is for account owners', 'Plan and billing can only be changed by an owner of Wildflower Bakehouse. Ask one to give you access.', `<button type="button" class="m-button" data-variant="primary">Ask for access</button><a class="m-button" data-variant="ghost" href="#">${icon(I.left, 16)} Go back</a>`)}
  </div>
</main>
</div>`;

export const saffronRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'A title with a primary and a secondary action, a row of serif metrics split by hairlines with change badges, a teal bar chart, and a frameless table of recent sends.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'Status tabs, a search and filters above a frameless table of contacts with status badges; a row opens its own page with details and an activity list.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'A narrow form column with a step count, a teal progress bar, a serif question and bordered choices, beside a yellow panel built from token shapes.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'Underline tabs, then sections split by hairlines with the title and help on the left and fields or switches on the right; closing the account comes last.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'A grey panel with a serif heading, one sentence and a primary action, then three tinted tiles to start from.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The public bar with pill buttons, a serif headline underlined in yellow, a yellow help band, square plan columns split by hairlines with a blue "most popular" band, a striped comparison and plain questions.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors under the field, a summary above the form that says nothing was sent, a dark snackbar for failures elsewhere, and serif full pages for 404, 500 and no access.',
    html: errors,
  },
];
