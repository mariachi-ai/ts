import type { ArchetypeRecipe } from '../types';

/*
 * Zephyr's seven layout recipes: framework-free HTML using only @mariachi/design classes and
 * tokens (no colour literals), with sample data from a made-up brokerage, Updraft. They follow the
 * language's real screen patterns, translated from a phone app to the desktop the way its own web
 * pages do it: a top bar with search, a main column beside a 330px panel, a large regular-weight
 * balance over a thin line chart tinted by the day's direction, timeframe chips, hairline rows,
 * solid price chips with black figures, loud pills, and charcoal cards on black.
 */

// Lucide icons, outlined, 1.75px stroke
const icon = (paths: string, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  wind: '<path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  user: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>',
  sliders:
    '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
  plusCircle: '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  layers:
    '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  clock: '<path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/>',
  wallet:
    '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  refresh:
    '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
};

// The filled up and down marks beside a change: ▲ ▼
const up = `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M5 1.5 9.5 8.5h-9z" fill="currentColor"/></svg>`;
const downMark = `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M5 8.5 9.5 1.5h-9z" fill="currentColor"/></svg>`;

const gain = 'color: var(--m-color-success-fg)';
const loss = 'color: var(--m-color-danger-fg)';
const num = 'font-variant-numeric: tabular-nums';
const label = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
const hair = 'border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)';
const hairTop = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)';
// Display figures are regular weight, never bold: a 32px balance
const big = `font-family: var(--m-font-family-display); font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-regular); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight); ${num}`;
const h2 =
  'font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-medium)';
const bold13 = 'font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-bold)';

// The day's change: a filled mark, the amount and percentage in the tone, then the period in ink
const change = (dir: 'up' | 'down', text: string, period = 'Today') =>
  `<span class="m-cluster" data-gap="1" style="${bold13}; ${num}"><span class="m-cluster" data-gap="1" style="${dir === 'up' ? gain : loss}">${dir === 'up' ? up : downMark} ${text}</span><span style="font-weight: var(--m-font-weight-regular)">${period}</span></span>`;

// A seeded random walk, so the sample lines look like prices rather than ramps
const walk = (n: number, seed: number, drift: number, vol: number) => {
  let x = seed;
  let v = 0;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    x = (x * 9301 + 49297) % 233280;
    v += drift + (x / 233280 - 0.5) * vol;
    out.push(v);
  }
  return out;
};

// A line chart: a 2px line in the day's tone over a dotted baseline at the open; no fill, no axes
const line = (pts: number[], w: number, h: number, pad = 0) => {
  const lo = Math.min(...pts);
  const hi = Math.max(...pts);
  const y = (v: number) => h - pad - ((v - lo) / (hi - lo || 1)) * (h - pad * 2);
  return pts
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${((i * w) / (pts.length - 1)).toFixed(1)},${y(v).toFixed(1)}`)
    .join(' ');
};
const chart = (pts: number[], tone: 'success' | 'danger', labelText: string, height = '15rem') => {
  const lo = Math.min(...pts);
  const hi = Math.max(...pts);
  const y = (v: number) => (200 - 16 - ((v - lo) / (hi - lo || 1)) * 168).toFixed(1);
  return `<svg viewBox="0 0 700 200" width="100%" preserveAspectRatio="none" style="display: block; block-size: ${height}; overflow: visible" role="img" aria-label="${labelText}">
            <path d="M0,${y(pts[0])} L700,${y(pts[0])}" fill="none" style="stroke: var(--m-color-fg-subtle)" stroke-width="1.5" stroke-dasharray="1 5" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
            <path d="${line(pts, 700, 200, 16)}" fill="none" style="stroke: var(--m-color-${tone}-solid)" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
            <circle cx="700" cy="${y(pts[pts.length - 1])}" r="4" style="fill: var(--m-color-${tone}-solid)"/>
          </svg>`;
};
// A sparkline for rows
const spark = (pts: number[], tone: 'success' | 'danger') =>
  `<svg viewBox="0 0 80 28" width="80" height="28" aria-hidden="true" style="display: block"><path d="${line(pts, 80, 28, 2)}" fill="none" style="stroke: var(--m-color-${tone}-solid)" stroke-width="1.5" stroke-linejoin="round"/></svg>`;

// The timeframe row: chips in the accent text, the current one a solid accent chip
const timeframes = (
  items: string[],
  current: string,
  id: string,
) => `<div class="m-tabs" data-variant="pill" style="--m-tabs-fg: var(--m-color-accent-text); --m-tabs-hover-fg: var(--m-color-accent-text); --m-tabs-active-fg: var(--m-color-accent-fg); --m-tabs-pill-active-bg: var(--m-color-accent-default); --m-tabs-height: 1.75rem; --m-tabs-padding-x: var(--m-space-2); --m-tabs-list-gap: var(--m-space-4)">
            <div class="m-tab-list" role="tablist" aria-label="Chart period">
${items.map((t) => `              <button type="button" class="m-tab" role="tab" id="${id}-${t.toLowerCase()}" aria-selected="${t === current}"${t === current ? '' : ' tabindex="-1"'}>${t}</button>`).join('\n')}
            </div>
          </div>`;

// The top bar: the mark and name, a search field, ink links, the current one in the accent text
const navLinks = ['Home', 'Markets', 'Watchlists', 'Cash', 'Activity'];
const topbar = (current: string) => `<header class="m-navbar">
  <a class="m-navbar-brand" href="#"><span style="color: var(--m-color-accent-text); display: inline-flex">${icon(I.wind, 22)}</span> Updraft</a>
  <div role="search" style="flex: 1; max-inline-size: 32rem; position: relative">
    <span style="position: absolute; inset-inline-start: var(--m-space-3); inset-block: 0; display: flex; align-items: center; color: var(--m-color-fg-muted); pointer-events: none">${icon(I.search, 16)}</span>
    <input class="m-input" type="search" placeholder="Search" aria-label="Search" style="padding-inline-start: var(--m-space-10); background: var(--m-color-bg-sunken); border-color: var(--m-color-bg-sunken)">
  </div>
  <nav class="m-navbar-nav" aria-label="Main" style="margin-inline-start: auto">
${navLinks.map((l) => `    <a class="m-navbar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${l}</a>`).join('\n')}
  </nav>
  <div class="m-navbar-actions">
    <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Notifications">${icon(I.bell, 18)}</button>
    <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Account">${icon(I.user, 18)}</button>
  </div>
</header>`;

// Two columns as on the web: the main column, and a 330px panel on its right (first in the
// source, moved after; on a phone it drops below)
const twoCol = (
  main: string,
  panel: string,
) => `<div class="m-container" style="padding-block: var(--m-space-6) var(--m-space-16)">
  <div class="m-split" style="--m-layout-split-side: 20.625rem; --m-layout-split-gap: var(--m-space-12); align-items: flex-start">
    <aside style="order: 2; position: sticky; inset-block-start: var(--m-space-6)">
${panel}
    </aside>
    <main class="m-stack" data-gap="8">
${main}
    </main>
  </div>
</div>`;

// ---------------------------------------------------------------------------------------------
// Dashboard: the balance and its chart, buying power, holdings by kind, movers, a brand panel;
// the watchlist panel on the right.

const balancePts = walk(140, 17, 0.12, 2.6);

const holdingRow = (
  name: string,
  value: string,
  dir?: 'up' | 'down',
  last = false,
) => `              <li class="m-cluster" data-justify="between" style="${last ? '' : `${hair}; `}padding-block: var(--m-space-4)">
                <span>${name}</span>
                <span class="m-cluster" data-gap="2" style="${num}${dir ? `; ${dir === 'up' ? gain : loss}` : ''}">${dir ? (dir === 'up' ? up : downMark) : ''} ${value}</span>
              </li>`;

const watchRow = (
  sym: string,
  sub: string,
  pts: number[],
  price: string,
  tone: 'success' | 'danger',
) => `          <li class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding-block: var(--m-space-3)">
            <span class="m-stack" data-gap="0" style="min-inline-size: 4.5rem"><span style="font-weight: var(--m-font-weight-semibold)">${sym}</span><span style="${label}">${sub}</span></span>
            ${spark(pts, tone)}
            <span class="m-badge" data-variant="solid" data-tone="${tone}" style="${num}; min-inline-size: 5.25rem; justify-content: center">${price}</span>
          </li>`;

const watchPanel = `      <section class="m-card" aria-labelledby="zp-watch">
        <div class="m-card-body m-stack" data-gap="1" style="padding-block: var(--m-space-3)">
          <div class="m-cluster" data-justify="between" style="padding-block: var(--m-space-2)">
            <h2 id="zp-watch" style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-bold)">Positions</h2>
            <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Sort positions">${icon(I.sliders, 16)}</button>
          </div>
          <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
${watchRow('NBLA', '24 shares', walk(36, 3, 0.15, 1.6), '$118.42', 'success')}
${watchRow('QELP', '60 shares', walk(36, 11, -0.15, 1.6), '$31.07', 'danger')}
${watchRow('HRBR', '8 shares', walk(36, 23, 0.12, 1.6), '$402.15', 'success')}
${watchRow('MOSK', '115 shares', walk(36, 31, -0.08, 1.6), '$7.84', 'danger')}
          </ul>
          <div class="m-cluster" data-justify="between" style="${hairTop}; padding-block: var(--m-space-4) var(--m-space-2)">
            <h2 style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-bold)">Lists</h2>
            <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="New list">${icon(I.plus, 16)}</button>
          </div>
          <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
            <li class="m-cluster" data-justify="between" style="padding-block: var(--m-space-3)"><span class="m-cluster" data-gap="3"><span class="m-avatar" data-size="md" style="border-radius: var(--m-radius-md); background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">${icon(I.zap, 16)}</span> Grid builders</span><span style="color: var(--m-color-fg-muted); display: inline-flex">${icon(I.down, 16)}</span></li>
            <li class="m-cluster" data-justify="between" style="padding-block: var(--m-space-3)"><span class="m-cluster" data-gap="3"><span class="m-avatar" data-size="md" style="border-radius: var(--m-radius-md)">${icon(I.layers, 16)}</span> Dividend core</span><span style="color: var(--m-color-fg-muted); display: inline-flex">${icon(I.down, 16)}</span></li>
          </ul>
        </div>
      </section>`;

const mover = (sym: string, name: string, pct: string, tone: 'success' | 'danger') =>
  `<a href="#" class="m-card" style="text-decoration: none; color: inherit"><div class="m-card-body m-stack" data-gap="3">
            <span class="m-stack" data-gap="0"><span style="font-weight: var(--m-font-weight-semibold)">${sym}</span><span style="${label}">${name}</span></span>
            <span><span class="m-badge" data-variant="solid" data-tone="${tone}" style="${num}">${tone === 'success' ? up : downMark} ${pct}</span></span>
          </div></a>`;

const dashboard = `${topbar('Home')}
${twoCol(
  `      <section class="m-stack" data-gap="3" aria-labelledby="zp-bal">
        <div class="m-stack" data-gap="1">
          <h1 id="zp-bal" style="${big}">Brokerage</h1>
          <span style="${big}">$84,312.56</span>
        </div>
        ${change('up', '$1,204.18 (1.45%)')}
        ${chart(balancePts, 'success', 'Balance today, rising from $83,108.38 to $84,312.56')}
        <div style="${hair}; padding-block-end: var(--m-space-3)">
          ${timeframes(['1D', '5D', '1M', '6M', '1Y', 'MAX'], '1D', 'zp-tf')}
        </div>
        <a href="#" class="m-cluster" data-justify="between" style="${hair}; padding-block: var(--m-space-4); color: inherit; text-decoration: none">
          <span>Cash available to trade</span>
          <span class="m-cluster" data-gap="2" style="${num}">$3,410.22 ${icon(I.right, 16)}</span>
        </a>
      </section>
      <section class="m-stack" data-gap="4" aria-labelledby="zp-alloc">
        <h2 id="zp-alloc" style="${h2}">Allocation</h2>
        <div class="m-card"><div class="m-card-body">
          <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none; margin-block: calc(var(--m-space-4) * -1)">
${holdingRow('Equities', '$61,920.10')}
${holdingRow('Fixed income', '$12,004.55', 'up')}
${holdingRow('Cash sweep', '$8,210.00')}
${holdingRow('Commodities', '$2,177.91', 'down', true)}
          </ul>
        </div></div>
      </section>
      <section class="m-stack" data-gap="4" aria-labelledby="zp-swing">
        <div class="m-cluster" data-justify="between">
          <h2 id="zp-swing" style="${h2}">Biggest swings</h2>
          <a href="#" style="color: var(--m-color-accent-text); ${bold13}; text-decoration: none">See all</a>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 11rem; --m-layout-grid-gap: var(--m-space-3)">
          ${mover('TLLW', 'Tallow &amp; Pine', '14.82%', 'success')}
          ${mover('VTRX', 'Vantrix Energy', '9.36%', 'success')}
          ${mover('QELP', 'Quell Pharma', '7.10%', 'danger')}
        </div>
      </section>
      <section class="m-card" aria-labelledby="zp-plus" style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg); border-color: transparent">
        <div class="m-card-body m-cluster" data-justify="between" data-gap="6">
          <div class="m-stack" data-gap="1" style="max-inline-size: 28rem">
            <h2 id="zp-plus" style="${h2}">Earn 4.1% on idle cash</h2>
            <p>Updraft Plus sweeps what you're not investing into an interest account, from $6 a month.</p>
          </div>
          <a href="#" class="m-button" data-variant="secondary" style="--m-button-secondary-bg: var(--m-color-brand-fg); --m-button-secondary-border: var(--m-color-brand-fg); --m-button-secondary-fg: var(--m-color-brand-default)">Try Plus</a>
        </div>
      </section>`,
  watchPanel,
)}`;

// ---------------------------------------------------------------------------------------------
// List and detail: a curated list with its rows, then one company's page with the order panel.

const listRow = (
  sym: string,
  name: string,
  price: string,
  pct: string,
  tone: 'success' | 'danger',
  cap: string,
) => `              <tr>
                <td><span class="m-stack" data-gap="0"><span style="font-weight: var(--m-font-weight-semibold)">${sym}</span><span style="${label}">${name}</span></span></td>
                <td data-numeric style="${tone === 'success' ? gain : loss}">${price}</td>
                <td data-numeric style="${tone === 'success' ? gain : loss}"><span class="m-cluster" data-gap="1" data-justify="end">${tone === 'success' ? up : downMark} ${pct}</span></td>
                <td data-numeric style="color: var(--m-color-fg-muted)">${cap}</td>
              </tr>`;

const stat = (k: string, v: string) =>
  `<div class="m-stack" data-gap="1"><dt style="${bold13}">${k}</dt><dd style="font-size: var(--m-font-size-sm); ${num}">${v}</dd></div>`;

const orderRow = (k: string, v: string, strong = false) =>
  `<div class="m-cluster" data-justify="between" style="font-size: var(--m-font-size-sm)${strong ? `; font-weight: var(--m-font-weight-bold); ${hairTop}; padding-block-start: var(--m-space-4)` : ''}"><span>${k}</span><span style="${num}">${v}</span></div>`;

const orderPanel = `      <section class="m-card" aria-labelledby="zp-order">
        <div class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-5); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-muted)">
          <h2 id="zp-order" style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-bold)">Buy NBLA</h2>
          <span style="display: inline-flex">${icon(I.down, 18)}</span>
        </div>
        <form class="m-stack" data-gap="4" style="padding: var(--m-space-4) var(--m-space-5) var(--m-space-5)">
          <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap"><label for="zp-type" style="font-size: var(--m-font-size-sm)">Order type</label><select class="m-select" id="zp-type" style="inline-size: 9rem"><option>Market</option><option>Limit</option><option>Stop</option></select></div>
          <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap"><label for="zp-in" style="font-size: var(--m-font-size-sm)">Buy in</label><select class="m-select" id="zp-in" style="inline-size: 9rem"><option>Shares</option><option>Dollars</option></select></div>
          <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap"><label for="zp-qty" style="font-size: var(--m-font-size-sm)">Shares</label><input class="m-input" id="zp-qty" inputmode="decimal" value="12" style="inline-size: 9rem; text-align: end; ${num}"></div>
          ${orderRow('Market price', '$118.42')}
          ${orderRow('Estimated cost', '$1,421.04', true)}
          <button type="submit" class="m-button" data-variant="primary" style="inline-size: 100%">Review order</button>
          <p style="${label}; text-align: center">$3,410.22 available to trade</p>
        </form>
      </section>
      <div style="padding: var(--m-space-4) var(--m-space-6)"><button type="button" class="m-button" data-variant="ghost" style="inline-size: 100%">${icon(I.bell, 16)} Set a price alert</button></div>`;

const nblaPts = walk(110, 5, 0.08, 2.2);

const listDetail = `${topbar('Watchlists')}
${twoCol(
  `      <!-- The list: a header, a short description, then hairline rows -->
      <section class="m-stack" data-gap="5" aria-labelledby="zp-list">
        <div class="m-stack" data-gap="2">
          <h1 id="zp-list" style="${big}">Grid builders</h1>
          <span class="m-cluster" data-gap="1" style="${label}"><span style="color: var(--m-color-accent-text); display: inline-flex">${icon(I.checkCircle, 14)}</span> Curated by Updraft · Refreshed 3 hrs ago</span>
        </div>
        <p style="max-inline-size: 40rem">Companies laying cable, storing power and running the software that balances the grid. Reviewed each quarter.</p>
        <div class="m-cluster" data-justify="between">
          <span class="m-stack" data-gap="0"><span>In this list</span><span style="${label}">42 companies</span></span>
          <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Sort and filter">${icon(I.sliders, 18)}</button>
        </div>
        <div class="m-table-wrap">
          <table class="m-table">
            <thead><tr><th>Name</th><th data-numeric>Price</th><th data-numeric>Today</th><th data-numeric>Market cap</th></tr></thead>
            <tbody>
${listRow('NBLA', 'Nebula Grid Systems', '$118.42', '2.31%', 'success', '18.6B')}
${listRow('VTRX', 'Vantrix Energy', '$54.90', '9.36%', 'success', '7.2B')}
${listRow('CDRW', 'Cedarwell Storage', '$22.18', '1.04%', 'danger', '3.9B')}
${listRow('HRBR', 'Harbor Transmission', '$402.15', '0.62%', 'success', '61.0B')}
${listRow('MOSK', 'Moskit Controls', '$7.84', '3.75%', 'danger', '880.4M')}
            </tbody>
          </table>
        </div>
      </section>

      <hr class="m-divider">

      <!-- The detail: one company's page -->
      <section class="m-stack" data-gap="4" aria-labelledby="zp-co">
        <div class="m-stack" data-gap="1">
          <h1 id="zp-co" style="${big}">Nebula Grid Systems</h1>
          <span style="${big}">$118.42</span>
        </div>
        <div class="m-stack" data-gap="1">
          ${change('up', '$2.67 (2.31%)')}
          ${change('down', '$0.19 (0.16%)', 'Overnight')}
        </div>
        ${chart(nblaPts, 'success', 'Price today, rising from $115.75 to $118.42', '13rem')}
        <div class="m-tabs">
          <div class="m-tab-list" role="tablist" aria-label="Chart period" style="--m-tabs-list-gap: var(--m-space-8)">
            <button type="button" class="m-tab" role="tab" aria-selected="true" style="letter-spacing: var(--m-font-tracking-wide)">1D</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1" style="letter-spacing: var(--m-font-tracking-wide)">5D</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1" style="letter-spacing: var(--m-font-tracking-wide)">1M</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1" style="letter-spacing: var(--m-font-tracking-wide)">6M</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1" style="letter-spacing: var(--m-font-tracking-wide)">1Y</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1" style="letter-spacing: var(--m-font-tracking-wide)">MAX</button>
          </div>
        </div>
        <div class="m-stack" data-gap="4" style="padding-block-start: var(--m-space-6)">
          <h2 style="${h2}; ${hair}; padding-block-end: var(--m-space-4)">About NBLA</h2>
          <p>Nebula Grid Systems builds substations and the control software utilities use to route power between regions. <a href="#" style="color: var(--m-color-accent-text); font-weight: var(--m-font-weight-bold); text-decoration: none">Read more</a></p>
          <dl class="m-grid" style="--m-layout-grid-min: 10.5rem; --m-layout-grid-gap: var(--m-space-5)">
            ${stat('Chief executive', 'Renata Solberg')}
            ${stat('Employees', '12,480')}
            ${stat('Head office', 'Tulsa, Oklahoma')}
            ${stat('Listed', '2011')}
          </dl>
        </div>
        <div class="m-stack" data-gap="4" style="padding-block-start: var(--m-space-6)">
          <h2 style="${h2}; ${hair}; padding-block-end: var(--m-space-4)">Figures</h2>
          <dl class="m-grid" style="--m-layout-grid-min: 10.5rem; --m-layout-grid-gap: var(--m-space-5)">
            ${stat('Market cap', '18.6B')}
            ${stat('Earnings multiple', '24.10')}
            ${stat('Yield', '1.12%')}
            ${stat('Volume', '3.41M')}
            ${stat('Day range', '$115.20 – $119.06')}
            ${stat('Year range', '$71.44 – $126.90')}
          </dl>
        </div>
      </section>`,
  orderPanel,
)}`;

// ---------------------------------------------------------------------------------------------
// Onboarding: one question per screen, a thin accent progress line, a full-width pill at the end.

const onboarding = `<div class="m-stack" data-gap="0" style="min-block-size: 100vh">
  <div style="padding: var(--m-space-4) var(--m-space-6)">
    <progress class="m-progress" data-size="sm" value="3" max="7" aria-label="Step 3 of 7">3 of 7</progress>
  </div>
  <div class="m-cluster" data-justify="between" style="padding-inline: var(--m-space-4)">
    <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Back" style="border-color: transparent">${icon(I.left, 22)}</button>
    <span style="${label}">Step 3 of 7</span>
    <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Close" style="border-color: transparent">${icon(I.x, 22)}</button>
  </div>
  <main class="m-container" data-size="sm" style="padding-block: var(--m-space-10) var(--m-space-16)">
    <form class="m-stack" data-gap="8" aria-labelledby="zp-onb">
      <div class="m-stack" data-gap="3">
        <h1 id="zp-onb" style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-regular); line-height: var(--m-font-leading-tight); letter-spacing: var(--m-font-tracking-tight)">Where do you live?</h1>
        <p class="m-muted">We need a home address, not a mailbox, to open a brokerage account.</p>
      </div>
      <div class="m-stack" data-gap="5">
        <div class="m-field">
          <label class="m-field-label" for="zp-street">Street address</label>
          <input class="m-input" data-size="lg" style="font-size: var(--m-font-size-md)" id="zp-street" value="418 Larkin Row" autocomplete="address-line1">
        </div>
        <div class="m-field">
          <label class="m-field-label" for="zp-unit">Apartment or unit <span class="m-subtle">(optional)</span></label>
          <input class="m-input" data-size="lg" style="font-size: var(--m-font-size-md)" id="zp-unit" autocomplete="address-line2">
        </div>
        <div class="m-cluster" data-gap="4" data-align="start" style="flex-wrap: nowrap">
          <div class="m-field" style="flex: 2">
            <label class="m-field-label" for="zp-city">City</label>
            <input class="m-input" data-size="lg" style="font-size: var(--m-font-size-md)" id="zp-city" value="Boise" autocomplete="address-level2">
          </div>
          <div class="m-field" style="flex: 1">
            <label class="m-field-label" for="zp-zip">ZIP code</label>
            <input class="m-input" data-size="lg" id="zp-zip" value="8370" inputmode="numeric" aria-invalid="true" aria-describedby="zp-zip-e" style="font-size: var(--m-font-size-md); ${num}">
            <p class="m-field-error" id="zp-zip-e">A ZIP code has 5 digits.</p>
          </div>
        </div>
      </div>
      <div class="m-stack" data-gap="4">
        <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Continue</button>
        <p class="m-cluster" data-gap="2" data-justify="center" style="${label}; flex-wrap: nowrap">${icon(I.lock, 14)} Your address is encrypted and only used to verify who you are.</p>
      </div>
    </form>
  </main>
</div>`;

// ---------------------------------------------------------------------------------------------
// Settings: a settings list beside rows of title, help and a control or a chevron.

const setNav = (groups: [string, string[]][], current: string) =>
  groups
    .map(
      ([h, items]) => `      <div class="m-sidebar-section">
        <h2 class="m-sidebar-heading">${h}</h2>
        <ul>
${items.map((l) => `          <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${l}</a></li>`).join('\n')}
        </ul>
      </div>`,
    )
    .join('\n');

const setRow = (
  title: string,
  help: string,
  control: string,
) => `          <div class="m-cluster" data-justify="between" data-gap="6" style="${hair}; padding-block: var(--m-space-5); flex-wrap: nowrap">
            <div class="m-stack" data-gap="1"><span style="font-weight: var(--m-font-weight-semibold)">${title}</span>${help ? `<span style="${label}">${help}</span>` : ''}</div>
            ${control}
          </div>`;
const toggle = (id: string, labelText: string, on: boolean) =>
  `<input class="m-switch" type="checkbox" role="switch" id="${id}" aria-label="${labelText}"${on ? ' checked' : ''}>`;
const chev = (value: string) =>
  `<a href="#" class="m-cluster" data-gap="2" style="color: var(--m-color-fg-muted); text-decoration: none; flex: none; ${num}">${value} ${icon(I.right, 16)}</a>`;

const settings = `${topbar('')}
<div class="m-container" style="padding-block: var(--m-space-8) var(--m-space-16)">
  <div class="m-stack" data-gap="6">
    <h1 style="${big}">Account</h1>
    <div class="m-split" style="--m-layout-split-side: 15rem; --m-layout-split-gap: var(--m-space-12); align-items: flex-start">
      <nav class="m-sidebar" aria-label="Settings" style="border: 0; padding-inline: 0; flex-grow: 0">
${setNav(
  [
    ['Profile', ['Personal details', 'Tax documents', 'Beneficiaries']],
    ['Money', ['Linked banks', 'Recurring buys', 'Cash sweep']],
    ['Safety', ['Sign-in and security', 'Devices', 'Alerts']],
  ],
  'Sign-in and security',
)}
      </nav>
      <main class="m-stack" data-gap="8" style="max-inline-size: 44rem">
        <section class="m-stack" data-gap="0" aria-labelledby="zp-sec">
          <h2 id="zp-sec" style="${h2}; padding-block-end: var(--m-space-2)">Sign-in and security</h2>
${setRow('Two-step verification', 'A code from your authenticator app every time you sign in on a new device.', toggle('zp-2fa', 'Two-step verification', true))}
${setRow('Face or fingerprint unlock', 'Open the app without your password on this phone.', toggle('zp-bio', 'Face or fingerprint unlock', true))}
${setRow('Password', 'Changed 41 days ago', chev('Change'))}
${setRow('Trusted contact', 'Someone we can reach if we can’t reach you.', chev('Lena Ortiz'))}
        </section>
        <section class="m-stack" data-gap="0" aria-labelledby="zp-alerts">
          <h2 id="zp-alerts" style="${h2}; padding-block-end: var(--m-space-2)">Alerts</h2>
${setRow('Price moves', 'When a position moves more than 5% in a day.', toggle('zp-moves', 'Price moves', true))}
${setRow('Order fills', '', toggle('zp-fills', 'Order fills', true))}
${setRow('Market open and close', '', toggle('zp-bell', 'Market open and close', false))}
        </section>
        <section class="m-stack" data-gap="3" aria-labelledby="zp-close">
          <h2 id="zp-close" style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-bold)">Close account</h2>
          <p class="m-muted">Sell or transfer your positions first. Closing withdraws your $3,410.22 in cash to your linked bank and can’t be undone.</p>
          <div><button type="button" class="m-button" data-variant="danger">Close account</button></div>
        </section>
      </main>
    </div>
  </div>
</div>`;

// ---------------------------------------------------------------------------------------------
// Empty state: a large outlined icon in a ring, a heading, one sentence, the accent pill.

const emptyState = `${topbar('Activity')}
<main class="m-container" data-size="md" style="padding-block: var(--m-space-16)">
  <div class="m-stack" data-gap="5" data-align="center" style="text-align: center">
    <span style="display: inline-flex; align-items: center; justify-content: center; inline-size: 4.5rem; block-size: 4.5rem; border-radius: var(--m-radius-full); border: var(--m-border-width-thin) solid var(--m-color-border-default); color: var(--m-color-accent-text)">${icon(I.bell, 30)}</span>
    <div class="m-stack" data-gap="2" data-align="center">
      <h1 style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-medium)">No alerts yet</h1>
      <p class="m-muted" style="max-inline-size: 26rem">Set a price on anything you follow and we’ll tell you the moment it crosses, day or night.</p>
    </div>
    <div class="m-cluster" data-gap="3" data-justify="center">
      <button type="button" class="m-button" data-variant="primary">${icon(I.plus, 16)} Create an alert</button>
      <button type="button" class="m-button" data-variant="ghost">Browse markets</button>
    </div>
  </div>
</main>`;

// ---------------------------------------------------------------------------------------------
// Pricing: a serif headline on black, two plan cards (the paid one on the brand lime), a hairline
// comparison, a hairline FAQ and a lime band.

const feature = (text: string) =>
  `<li class="m-cluster" data-gap="3" style="flex-wrap: nowrap" data-align="start"><span style="display: inline-flex; flex: none; padding-block-start: 0.1875rem">${icon(I.check, 16)}</span>${text}</li>`;

const serifHead = (size: string) =>
  `font-family: var(--m-font-family-serif); font-size: var(--m-font-size-${size}); font-weight: var(--m-font-weight-regular); line-height: var(--m-font-leading-tight); letter-spacing: var(--m-font-tracking-tight)`;

const cmpRow = (k: string, a: string, b: string) =>
  `            <tr><td>${k}</td><td data-numeric>${a}</td><td data-numeric>${b}</td></tr>`;

const pricing = `<header class="m-navbar">
  <a class="m-navbar-brand" href="#"><span style="color: var(--m-color-accent-text); display: inline-flex">${icon(I.wind, 22)}</span> Updraft</a>
  <nav class="m-navbar-nav" aria-label="Main">
    <a class="m-navbar-link" href="#">Invest</a>
    <a class="m-navbar-link" href="#">Retire</a>
    <a class="m-navbar-link" href="#" aria-current="page">Plus</a>
    <a class="m-navbar-link" href="#">Learn</a>
  </nav>
  <div class="m-navbar-actions" style="margin-inline-start: auto">
    <a class="m-button" data-variant="ghost" data-size="sm" href="#" style="border-color: var(--m-color-accent-default); color: var(--m-color-accent-text)">Sign in</a>
    <a class="m-button" data-variant="primary" data-size="sm" href="#">Open an account</a>
  </div>
</header>
<main>
  <section class="m-container" data-size="md" style="padding-block: var(--m-space-16) var(--m-space-12); text-align: center">
    <div class="m-stack" data-gap="4" data-align="center">
      <h1 style="${serifHead('4xl')}; max-inline-size: 36rem">Make idle cash pull its weight</h1>
      <p class="m-muted" style="font-size: var(--m-font-size-lg); max-inline-size: 30rem">Trading is free on every plan. Plus adds interest on cash, deeper data and a bigger instant deposit limit.</p>
    </div>
  </section>
  <section class="m-container" data-size="md" aria-label="Plans">
    <div class="m-grid" style="--m-layout-grid-min: 18rem; --m-layout-grid-gap: var(--m-space-4)">
      <div class="m-card" data-variant="outline" style="border-radius: 20px">
        <div class="m-card-body m-stack" data-gap="6" style="padding: var(--m-space-8)">
          <div class="m-stack" data-gap="2">
            <h2 style="${h2}">Standard</h2>
            <span style="${serifHead('4xl')}; ${num}">$0</span>
            <span class="m-muted">Always free</span>
          </div>
          <a href="#" class="m-button" data-variant="secondary" style="inline-size: 100%">Open an account</a>
          <ul class="m-stack" data-gap="3" style="padding: 0; list-style: none">
            ${feature('Shares, funds and options with no commission')}
            ${feature('Instant deposits up to $1,000')}
            ${feature('Price alerts and watchlists')}
          </ul>
        </div>
      </div>
      <div class="m-card" style="border-radius: 20px; background: var(--m-color-brand-default); color: var(--m-color-brand-fg); border-color: transparent">
        <div class="m-card-body m-stack" data-gap="6" style="padding: var(--m-space-8)">
          <div class="m-stack" data-gap="2">
            <h2 class="m-cluster" data-justify="between" style="${h2}">Plus <span class="m-badge" style="background: var(--m-color-brand-fg); color: var(--m-color-brand-default)">30 days free</span></h2>
            <span style="${serifHead('4xl')}; ${num}">$6<span style="font-family: var(--m-font-family-sans); font-size: var(--m-font-size-lg)">/month</span></span>
            <span>Billed monthly, cancel any time</span>
          </div>
          <a href="#" class="m-button" data-variant="secondary" style="inline-size: 100%; --m-button-secondary-bg: var(--m-color-brand-fg); --m-button-secondary-border: var(--m-color-brand-fg); --m-button-secondary-fg: var(--m-color-brand-default)">Start free trial</a>
          <ul class="m-stack" data-gap="3" style="padding: 0; list-style: none">
            ${feature('4.1% interest on uninvested cash')}
            ${feature('Instant deposits up to $25,000')}
            ${feature('Level 2 quotes and analyst notes')}
            ${feature('A 2% match on retirement deposits')}
          </ul>
        </div>
      </div>
    </div>
  </section>
  <section class="m-container" data-size="md" style="padding-block: var(--m-space-16) 0" aria-labelledby="zp-cmp">
    <h2 id="zp-cmp" style="${serifHead('3xl')}; padding-block-end: var(--m-space-6); text-align: center">Side by side</h2>
    <div class="m-table-wrap">
      <table class="m-table">
        <thead><tr><th></th><th data-numeric>Standard</th><th data-numeric>Plus</th></tr></thead>
        <tbody>
${cmpRow('Commission on shares and funds', '$0', '$0')}
${cmpRow('Interest on cash', '0.25%', '4.1%')}
${cmpRow('Instant deposit limit', '$1,000', '$25,000')}
${cmpRow('Margin rate, first $50,000', '11.75%', '6.25%')}
        </tbody>
      </table>
    </div>
  </section>
  <section class="m-container" data-size="md" style="padding-block: var(--m-space-16)" aria-labelledby="zp-faq">
    <h2 id="zp-faq" style="${h2}; padding-block-end: var(--m-space-4)">Questions about Plus</h2>
    <div class="m-accordion" style="border-inline: 0; border-radius: 0">
      <details class="m-accordion-item" name="zp-faq" open><summary>Where does the interest come from?</summary><div class="m-accordion-content">Uninvested cash is swept to partner banks, which pay interest on it. The rate can change; we show it before you start.</div></details>
      <details class="m-accordion-item" name="zp-faq"><summary>Can I cancel in the middle of a month?</summary><div class="m-accordion-content">Yes. Plus stays on until the end of the month you’ve paid for, then your account goes back to Standard.</div></details>
      <details class="m-accordion-item" name="zp-faq"><summary>Is my cash insured?</summary><div class="m-accordion-content">Swept cash is held at several banks, each covered up to the usual limit, for a combined cover of up to $2.5 million.</div></details>
    </div>
  </section>
  <section style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg); padding-block: var(--m-space-12)" aria-labelledby="zp-band">
    <div class="m-container m-cluster" data-justify="between" data-gap="6">
      <h2 id="zp-band" style="${serifHead('3xl')}">Start with $0. Upgrade when it pays.</h2>
      <a href="#" class="m-button" data-variant="secondary" data-size="lg" style="--m-button-secondary-bg: var(--m-color-brand-fg); --m-button-secondary-border: var(--m-color-brand-fg); --m-button-secondary-fg: var(--m-color-brand-default)">Open an account</a>
    </div>
  </section>
</main>`;

// ---------------------------------------------------------------------------------------------
// Errors: in the field, above the form, a snackbar for what happened elsewhere, and whole pages
// set left like the reference's own: the code, a large title, one sentence, a pill.

const errorPage = (
  code: string,
  title: string,
  body: string,
  actions: string,
) => `  <section class="m-stack" data-gap="4" style="padding-block: var(--m-space-12); ${hairTop}" aria-labelledby="zp-err-${code}">
    <span style="${big}">${code}</span>
    <h2 id="zp-err-${code}" style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-4xl); font-weight: var(--m-font-weight-regular); line-height: var(--m-font-leading-tight); letter-spacing: var(--m-font-tracking-tight)">${title}</h2>
    <p style="max-inline-size: 28rem">${body}</p>
    <div class="m-cluster" data-gap="3">${actions}</div>
  </section>`;

const errors = `${topbar('Cash')}
<main class="m-container" data-size="md" style="padding-block: var(--m-space-10) var(--m-space-16)">
  <div class="m-stack" data-gap="10">
    <section class="m-stack" data-gap="5" aria-labelledby="zp-err-form" style="max-inline-size: 28rem">
      <h1 id="zp-err-form" style="${big}">Move money</h1>
      <div class="m-alert" data-tone="danger" role="alert">
        <span class="m-alert-icon">${icon(I.alert, 18)}</span>
        <div class="m-alert-content"><div class="m-alert-title">Transfer not started</div><div class="m-alert-body">Two details need fixing. No money has moved.</div></div>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="zp-from">From</label>
        <select class="m-select" id="zp-from"><option>Northfield Credit Union ··6614</option></select>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="zp-amt">Amount</label>
        <input class="m-input" id="zp-amt" value="$30,000.00" aria-invalid="true" aria-describedby="zp-amt-e" style="${num}">
        <p class="m-field-error" id="zp-amt-e">Instant deposits are limited to $1,000 a day on Standard. Enter $1,000.00 or less.</p>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="zp-date">Date</label>
        <input class="m-input" id="zp-date" value="Sunday, Nov 15" aria-invalid="true" aria-describedby="zp-date-e">
        <p class="m-field-error" id="zp-date-e">Banks don’t send on weekends. Pick a weekday.</p>
      </div>
      <div class="m-stack" data-gap="3">
        <button type="submit" class="m-button" data-variant="primary" style="inline-size: 100%">Review transfer</button>
        <button type="button" class="m-button" data-variant="ghost" style="inline-size: 100%; border-color: transparent">Cancel</button>
      </div>
    </section>
    <section class="m-stack" data-gap="3" aria-label="A snackbar">
      <div class="m-toast" data-tone="danger" role="alert"><div class="m-toast-content"><div class="m-toast-title">Your limit order for VTRX didn’t fill</div><div class="m-toast-body">The price never reached $52.00 before the session closed.</div></div><button type="button" class="m-button" data-variant="primary" data-size="sm">Edit order</button></div>
    </section>
${errorPage('404', 'Page not found', 'This address doesn’t lead anywhere. It may have moved, or the link was mistyped.', `<a class="m-button" data-variant="primary" href="#">${icon(I.home, 16)} Go to Home</a>`)}
${errorPage('500', 'Something broke on our end', 'Nothing in your account changed. Try again in a moment; your orders are still live.', `<button type="button" class="m-button" data-variant="primary">${icon(I.refresh, 16)} Try again</button><button type="button" class="m-button" data-variant="ghost">Service status</button>`)}
${errorPage('403', 'This needs another check', 'Options trading isn’t turned on for this account yet. Apply and we’ll review it within a day.', `<button type="button" class="m-button" data-variant="primary">Apply for options</button><a class="m-button" data-variant="ghost" href="#">Go back</a>`)}
  </div>
</main>`;

export const zephyrRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'The balance large and regular-weight over a thin line chart in the day’s tone, timeframe chips, hairline rows, charcoal cards, a brand panel, and the positions panel with price chips on the right.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'A curated list with a hairline table of symbols and day changes; a company page with its chart, underline timeframe tabs, key figures and the order panel on the right.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One question per screen: a thin accent progress line, a large regular heading, large fields, and a full-width accent pill.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A settings list beside rows of a title, one line of help and a switch or a chevron; closing the account last, as an orange-red pill.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'A large outlined icon in a hairline ring, a heading, one sentence, the accent pill and an outline pill.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'A serif headline, two plan cards with the paid one on the brand lime, a hairline comparison, a hairline FAQ, and a lime band.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors in orange-red, a tinted alert above the form saying no money moved, a solid snackbar with one action, and left-set whole pages for 404, 500 and no access.',
    html: errors,
  },
];
