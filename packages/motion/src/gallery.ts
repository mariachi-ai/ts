/**
 * dist/gallery.html: every pattern, live, in any language. Open it from the repo with a built
 * @mariachi/design beside it:
 *
 *   packages/motion/dist/gallery.html?theme=terracotta&mode=dark
 *
 * `theme` is any kit id (default minimal), `mode` light or dark, and `design` the path to
 * @mariachi/design's dist (default ../../design/dist). Build-time only; not published.
 */
import { chart } from './charts';
import { patterns } from './catalog';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const example = (name: string, i = 0) => patterns.find((p) => p.name === name)?.examples[i]?.html ?? '';

const icon = (d: string) =>
  `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  check: icon('<path d="M20 6 9 17l-5-5"/>'),
  send: icon('<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>'),
  refresh: icon('<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>'),
};

const people = [
  ['AO', 'Amara Okafor', 'Design lead', '3 open reviews'],
  ['JL', 'Jonas Lindqvist', 'Engineer', 'On call this week'],
  ['PR', 'Priya Raman', 'Product', '12 comments today'],
  ['TM', 'Tomás Medina', 'Support', '4 tickets waiting'],
];

const panel = (id: string, title: string, note: string, body: string, actions = '') =>
  `<article class="m-card gallery-panel" id="${id}">
  <header class="m-card-header"><div><h3 class="m-card-title">${title}</h3><p class="m-card-description">${note}</p></div>${actions ? `<div class="m-cluster" data-gap="2">${actions}</div>` : ''}</header>
  <div class="m-card-body">${body}</div>
</article>`;

const button = (label: string, attrs: string, variant = 'ghost') =>
  `<button type="button" class="m-button" data-size="sm" data-variant="${variant}" ${attrs}>${label}</button>`;

const rowSkeleton = '<div class="m-skeleton" data-shape="row" aria-hidden="true"></div>';
const peopleList = `<ul class="gallery-list" data-stagger>${people
  .map(
    ([initials, name, role, note]) =>
      `<li class="gallery-person"><span class="m-avatar">${initials}</span><span class="gallery-person-text"><strong>${name}</strong><span class="m-muted">${role} · ${note}</span></span></li>`,
  )
  .join('')}</ul>`;

const charts = {
  line: chart({
    kind: 'line',
    id: 'g-line',
    title: 'Signups by month',
    labels: months,
    series: [
      { name: '2026', values: [320, 380, 360, 450, 520, 490, 610, 680, 720, 690, 780, 860] },
      { name: '2025', values: [210, 240, 260, 250, 300, 340, 330, 390, 410, 450, 470, 520] },
    ],
  }),
  area: chart({
    kind: 'area',
    id: 'g-area',
    title: 'Cloud spend by week',
    format: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10'],
    series: [{ name: 'Spend', values: [1840, 2120, 1980, 2460, 2380, 2710, 2590, 3020, 2880, 3240] }],
  }),
  bar: chart({
    kind: 'bar',
    id: 'g-bar',
    title: 'Orders by month',
    labels: months.slice(0, 8),
    series: [
      { name: 'Online', values: [1240, 1580, 1720, 2140, 1980, 2310, 2480, 2290] },
      { name: 'In store', values: [980, 1020, 1110, 1290, 1180, 1240, 1320, 1410] },
    ],
  }),
  donut: chart({ kind: 'donut', id: 'g-donut', title: 'Customers by plan', labels: ['Starter', 'Team', 'Business', 'Enterprise'], series: [1820, 1240, 610, 190] }),
  stats: [
    chart({ kind: 'stat', id: 'g-stat-1', title: 'Revenue this month', value: 48210, format: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }, change: 0.124, changeLabel: 'vs last month', series: [31, 34, 33, 38, 41, 40, 44, 48] }),
    chart({ kind: 'stat', id: 'g-stat-2', title: 'Active users', value: 12804, change: 0.038, changeLabel: 'vs last week', series: [11.2, 11.6, 11.4, 12.1, 12.0, 12.5, 12.8] }),
    chart({ kind: 'stat', id: 'g-stat-3', title: 'Error rate', value: 0.0042, format: { style: 'percent', maximumFractionDigits: 2 }, change: -0.21, goodWhen: 'down', changeLabel: 'vs last week' }),
  ],
  sparks: [
    ['api-gateway', [42, 48, 45, 52, 61, 58, 64, 70, 66, 72, 81, 78, 86, 92]],
    ['billing', [30, 28, 31, 27, 26, 29, 24, 22, 25, 21, 20, 19, 18, 17]],
    ['search', [12, 14, 13, 18, 16, 21, 19, 24, 28, 26, 31, 30, 34, 33]],
  ].map(([name, values], i) => [name as string, chart({ kind: 'sparkline', id: `g-spark-${i}`, title: `${name} requests, last 14 days`, series: values as number[] })] as const),
};

const STYLE = `
  body { margin: 0; background: var(--m-color-bg-canvas); color: var(--m-color-fg-default); font-family: var(--m-font-body-family, system-ui); font-size: var(--m-font-size-md, 1rem); line-height: var(--m-font-leading-normal, 1.5); }
  .gallery { max-inline-size: 76rem; margin-inline: auto; padding: var(--m-space-10, 2.5rem) var(--m-space-6, 1.5rem) var(--m-space-16, 4rem); display: flex; flex-direction: column; gap: var(--m-space-10, 2.5rem); }
  .gallery-head { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: var(--m-space-4, 1rem); }
  .gallery-head h1 { margin: 0; font-family: var(--m-font-heading-family); font-weight: var(--m-font-heading-weight); letter-spacing: var(--m-font-heading-tracking); text-transform: var(--m-font-heading-transform); font-size: var(--m-font-size-4xl, 2.25rem); line-height: var(--m-font-leading-tight, 1.2); }
  .gallery-head p { margin: var(--m-space-2, 0.5rem) 0 0; color: var(--m-color-fg-muted); max-inline-size: 44rem; }
  .gallery-section { display: flex; flex-direction: column; gap: var(--m-space-4, 1rem); }
  .gallery-section > h2 { margin: 0; font-family: var(--m-font-heading-family); font-weight: var(--m-font-heading-weight); letter-spacing: var(--m-font-heading-tracking); text-transform: var(--m-font-heading-transform); font-size: var(--m-font-size-xl, 1.25rem); }
  .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr)); gap: var(--m-space-4, 1rem); align-items: start; }
  .gallery-grid[data-wide] { grid-template-columns: repeat(auto-fill, minmax(min(100%, 34rem), 1fr)); }
  .gallery-panel .m-card-body { display: flex; flex-direction: column; gap: var(--m-space-4, 1rem); }
  .gallery-panel .m-card-header { align-items: start; }
  .gallery-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--m-space-4, 1rem); }
  .gallery-person { display: flex; align-items: center; gap: var(--m-space-3, 0.75rem); min-block-size: 2.5rem; }
  .gallery-person-text { display: flex; flex-direction: column; font-size: var(--m-font-size-sm, 0.875rem); line-height: 1.35; }
  .gallery-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--m-space-3, 0.75rem); }
  .gallery-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); gap: var(--m-space-4, 1rem); }
  .gallery-stats > .m-card { padding: var(--m-space-5, 1.25rem); }
  .gallery-table { inline-size: 100%; border-collapse: collapse; font-size: var(--m-font-size-sm, 0.875rem); }
  .gallery-table td { padding: var(--m-space-2, 0.5rem) 0; border-block-end: 1px solid var(--m-color-border-muted); }
  .gallery-table td:last-child { inline-size: 8rem; }
  .gallery-route { position: relative; view-transition-name: gallery-route; min-block-size: 7rem; }
  .gallery-pictures { display: grid; grid-template-columns: 2fr 1fr; gap: var(--m-space-3, 0.75rem); align-items: start; }
  .gallery-pictures img { inline-size: 100%; block-size: auto; border-radius: var(--m-skeleton-block-radius, var(--m-radius-container)); }
  .gallery-strip { display: flex; flex-direction: column; gap: var(--m-space-2, 0.5rem); }
  .gallery-pending { display: flex; flex-direction: column; gap: var(--m-space-3, 0.75rem); }
  .gallery-note { margin: 0; color: var(--m-color-fg-muted); font-size: var(--m-font-size-sm, 0.875rem); }
  .gallery-items { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--m-space-2, 0.5rem); }
  .gallery-items li { display: flex; align-items: center; justify-content: space-between; gap: var(--m-space-3, 0.75rem); padding: var(--m-space-2, 0.5rem) var(--m-space-3, 0.75rem); border: 1px solid var(--m-color-border-muted); border-radius: var(--m-radius-control); background: var(--m-color-bg-surface); font-size: var(--m-font-size-sm, 0.875rem); }
`;

const SCRIPT = `
import { enhance, busy, optimistic, leave, countUp, navigate } from './motion.js'; // mariachi-lint-ignore (the built file beside the page)
import { chart, updateChart } from './charts.js'; // mariachi-lint-ignore (the built file beside the page)
enhance();
const $ = (s, r = document) => r.querySelector(s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const replay = (el) => { const c = el.cloneNode(true); el.replaceWith(c); return c; };

// A picture painted from the language's own chart colours
function picture(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); const s = getComputedStyle(document.documentElement);
  const col = (n) => s.getPropertyValue('--m-chart-' + n).trim() || s.color;
  const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, col(2)); g.addColorStop(1, col(1));
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.globalAlpha = 0.85; x.fillStyle = col(3); x.beginPath(); x.moveTo(0, h * 0.72);
  x.bezierCurveTo(w * 0.3, h * 0.5, w * 0.55, h * 0.85, w, h * 0.6); x.lineTo(w, h); x.lineTo(0, h); x.fill();
  x.globalAlpha = 0.9; x.fillStyle = col(4); x.beginPath(); x.arc(w * 0.74, h * 0.3, h * 0.13, 0, 7); x.fill();
  return c.toDataURL('image/png');
}
function pictures() {
  const host = $('#g-pictures');
  host.innerHTML = '<img class="m-media" alt="A painted landscape" width="640" height="360" style="aspect-ratio: 16 / 9"><div class="m-media-frame" style="aspect-ratio: 1"><img class="m-media" alt="A painted square"></div>';
  const [blur, framed] = host.querySelectorAll('img');
  blur.dataset.placeholder = picture(16, 9);
  enhance(host);
  setTimeout(() => { blur.src = picture(640, 360); }, 1400);
  setTimeout(() => { framed.src = picture(240, 240); }, 2000);
}
pictures();

function loadRegion() {
  const r = $('#g-region-box'); r.setAttribute('aria-busy', 'true');
  return sleep(1500).then(() => r.setAttribute('aria-busy', 'false'));
}
$('#g-region-load').addEventListener('click', loadRegion);
loadRegion();

for (const b of document.querySelectorAll('[data-demo-busy]')) b.addEventListener('click', () => busy(b, sleep(1800)));

let attempts = 0;
for (const input of document.querySelectorAll('[data-demo-optimistic]')) {
  input.addEventListener('change', () => {
    const on = input.checked; const fails = input.dataset.demoOptimistic === 'fails' && attempts++ % 2 === 0;
    optimistic(input.closest('label'), () => {}, () => sleep(1100).then(() => { if (fails) return Promise.reject(new Error('offline')); }), {
      undo: () => { input.checked = !on; }, error: "Couldn't update " + input.dataset.name,
    });
  });
}
$('#g-rename').addEventListener('click', () => {
  const t = $('#g-rename-title'); const before = t.textContent; const next = before === 'Q3 plan' ? 'Q3 plan (final)' : 'Q3 plan';
  optimistic(t, () => { t.textContent = next; }, () => sleep(900), { undo: () => { t.textContent = before; }, message: 'Renamed to ' + next });
});

const replayStagger = () => replay($('#g-stagger-list'));
$('#g-stagger-replay').addEventListener('click', replayStagger);
$('#g-enter-replay').addEventListener('click', () => replay($('#g-enter-card')));

const items = ['Invoice #1042 paid', 'Build 381 passed', 'Amara mentioned you', 'Backup finished'];
function fillItems() {
  $('#g-items').innerHTML = items.map((t) => '<li data-enter>' + t + '<button type="button" class="m-button" data-size="sm" data-variant="ghost">Dismiss</button></li>').join('');
}
fillItems();
$('#g-items').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) leave(b.closest('li')); });
$('#g-items-reset').addEventListener('click', fillItems);

$('#g-dialog-open').addEventListener('click', () => $('#g-dialog').showModal());
$('#g-sheet-open').addEventListener('click', () => $('#g-sheet').showModal());
for (const b of document.querySelectorAll('[data-close]')) b.addEventListener('click', () => b.closest('dialog').close());
$('#g-toast-open').addEventListener('click', () => {
  const region = $('#g-toasts');
  const t = document.createElement('div'); t.className = 'm-toast'; t.setAttribute('role', 'status'); t.dataset.tone = 'success';
  t.innerHTML = '<div class="m-toast-content"><p class="m-toast-title">Export ready</p><p class="m-toast-body">customers.csv · 1,284 rows</p></div><button type="button" class="m-toast-close" aria-label="Dismiss">✕</button>';
  t.querySelector('button').addEventListener('click', () => leave(t));
  region.append(t); setTimeout(() => leave(t), 4000);
});

let page = 0;
const pages = [
  '<h4 class="m-card-title">Overview</h4><p class="gallery-note">Three projects are on track; one needs a decision on scope before Friday.</p>',
  '<h4 class="m-card-title">Activity</h4><p class="gallery-note">Amara approved the brand refresh. Jonas deployed 2.4.1 to production.</p>',
];
$('#g-route-next').addEventListener('click', () => navigate(() => { page = 1 - page; $('#g-route').innerHTML = pages[page]; }));

const specs = {
  'g-line': (k) => ({ kind: 'line', title: 'Signups by month', labels: ${JSON.stringify(months)}, series: [{ name: '2026', values: [320, 380, 360, 450, 520, 490, 610, 680, 720, 690, 780, 860].map((v, i) => Math.round(v * (1 + 0.18 * Math.sin(i + k)))) }, { name: '2025', values: [210, 240, 260, 250, 300, 340, 330, 390, 410, 450, 470, 520].map((v, i) => Math.round(v * (1 + 0.14 * Math.cos(i * 0.7 + k)))) }] }),
  'g-area': (k) => ({ kind: 'area', title: 'Cloud spend by week', format: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }, labels: ['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10'], series: [{ name: 'Spend', values: [1840, 2120, 1980, 2460, 2380, 2710, 2590, 3020, 2880, 3240].map((v, i) => Math.round(v * (1 + 0.2 * Math.sin(i * 0.9 + k)))) }] }),
  'g-bar': (k) => ({ kind: 'bar', title: 'Orders by month', labels: ${JSON.stringify(months.slice(0, 8))}, series: [{ name: 'Online', values: [1240, 1580, 1720, 2140, 1980, 2310, 2480, 2290].map((v, i) => Math.round(v * (1 + 0.25 * Math.sin(i + k * 2)))) }, { name: 'In store', values: [980, 1020, 1110, 1290, 1180, 1240, 1320, 1410].map((v, i) => Math.round(v * (1 + 0.2 * Math.cos(i + k)))) }] }),
  'g-donut': (k) => ({ kind: 'donut', title: 'Customers by plan', labels: ['Starter', 'Team', 'Business', 'Enterprise'], series: [1820, 1240, 610, 190].map((v, i) => Math.round(v * (1 + 0.35 * Math.sin(i * 1.7 + k)))) }),
};
let round = 0;
$('#g-update').addEventListener('click', () => { round++; for (const [id, make] of Object.entries(specs)) updateChart($('#' + id + '-t').closest('.m-chart'), make(round)); });
$('#g-redraw').addEventListener('click', () => { for (const id of Object.keys(specs)) replay($('#' + id + '-t').closest('.m-chart')); for (const v of document.querySelectorAll('.m-chart-value')) countUp(v); });

// For the screenshot script
window.gallery = { replayStagger, loadRegion, pictures, replay, countUp, busy, sleep };
`;

/** The gallery page. */
export function galleryPage(version: string): string {
  const loading = `<section class="gallery-section" aria-labelledby="g-loading"><h2 id="g-loading">Loading</h2><div class="gallery-grid">
${panel(
  'g-region',
  'A region that loads',
  'aria-busy swaps the skeleton for the content, which enters in turn.',
  `<div id="g-region-box" aria-busy="true" aria-label="Team">
  <div class="gallery-list" data-when="loading">${rowSkeleton.repeat(4)}</div>
  <div data-when="loaded">${peopleList}</div>
</div>`,
  button(`${ICON.refresh}Reload`, 'id="g-region-load"'),
)}
${panel(
  'g-cards',
  'Cards and a paragraph',
  'Shaped like what is coming: a card grid, a heading, a paragraph.',
  `<div class="gallery-cards" aria-hidden="true"><div class="m-skeleton" data-shape="card" style="--m-skeleton-block-height: 4.5rem"></div><div class="m-skeleton" data-shape="card" style="--m-skeleton-block-height: 4.5rem"></div><div class="m-skeleton" data-shape="card" style="--m-skeleton-block-height: 4.5rem"></div></div>
<div class="m-stack" data-gap="3" aria-hidden="true"><div class="m-cluster" data-gap="3" data-align="center"><div class="m-skeleton" data-shape="circle"></div><div class="m-skeleton" style="inline-size: 40%; block-size: 1.25em"></div></div><div class="m-skeleton" data-shape="lines" style="--lines: 4"></div></div>`,
)}
${panel('g-media', 'Pictures', 'Blur-up from a tiny placeholder; a spinner in a frame when there is none.', '<div class="gallery-pictures" id="g-pictures"></div>', button(`${ICON.refresh}Reload`, 'onclick="gallery.pictures()"'))}
${panel('g-progress', 'Uploads and long work', 'The library’s progress bar, and data-indeterminate when the length is unknown.', `${example('progress', 0)}${example('progress', 1)}`)}
</div></section>`;

  const actions = `<section class="gallery-section" aria-labelledby="g-actions"><h2 id="g-actions">Actions</h2><div class="gallery-grid">
${panel(
  'g-busy',
  'Busy buttons',
  'The spinner takes the icon’s place, or covers the label; the width holds and clicks are ignored.',
  `<div class="m-cluster" data-gap="3">
  <button type="button" class="m-button" data-variant="primary" data-demo-busy id="g-busy-save">${ICON.check}Save changes</button>
  <button type="button" class="m-button" data-demo-busy id="g-busy-export">Export</button>
  <button type="button" class="m-button" data-variant="ghost" data-demo-busy>${ICON.send}Send invite</button>
</div>
<div class="m-cluster" data-gap="3" aria-label="Busy now"><button type="button" class="m-button" data-variant="primary" data-busy aria-busy="true">${ICON.check}Saving</button><button type="button" class="m-button" data-busy aria-busy="true">Export</button></div>`,
)}
${panel(
  'g-optimistic',
  'Optimistic changes',
  'Applied at once and marked pending; undone with a toast if saving fails. Small edits only.',
  `<div class="gallery-pending">
  <label class="m-field" data-layout="inline"><input class="m-switch" type="checkbox" role="switch" checked data-demo-optimistic data-name="email alerts"> Email me when a build fails</label>
  <label class="m-field" data-layout="inline"><input class="m-switch" type="checkbox" role="switch" data-demo-optimistic="fails" data-name="the weekly digest"> Weekly digest <span class="m-muted">(fails every other time)</span></label>
  <div class="m-cluster" data-gap="3" data-align="center"><strong id="g-rename-title">Q3 plan</strong>${button('Rename', 'id="g-rename"', 'secondary')}</div>
</div>`,
)}
</div></section>`;

  const motion = `<section class="gallery-section" aria-labelledby="g-motion"><h2 id="g-motion">Motion</h2><div class="gallery-grid">
${panel('g-stagger', 'A list that staggers in', 'Each item one step after the last, capped so a long list never waits.', `<div id="g-stagger-list">${peopleList}</div>`, button(`${ICON.refresh}Replay`, 'id="g-stagger-replay"'))}
${panel(
  'g-enter',
  'Enter and leave',
  'New content enters by the language’s motion style; leave() plays the exit and removes it.',
  `<div id="g-enter-card" class="m-card" data-enter style="padding: var(--m-space-4, 1rem)"><strong>Your export is ready</strong><p class="gallery-note">1,284 rows · customers.csv</p></div><ul class="gallery-items" id="g-items"></ul>`,
  `${button(`${ICON.refresh}Replay`, 'id="g-enter-replay"')}${button('Restore', 'id="g-items-reset"')}`,
)}
${panel(
  'g-overlays',
  'Dialogs, sheets, popovers, toasts',
  'They open with the entrance and close with the exit; nothing to add.',
  `<div class="m-cluster" data-gap="3">
  ${button('Dialog', 'id="g-dialog-open"', 'secondary')}${button('Sheet', 'id="g-sheet-open"', 'secondary')}${button('Popover', 'popovertarget="g-popover"', 'secondary')}${button('Toast', 'id="g-toast-open"', 'secondary')}
</div>
<div class="m-popover" id="g-popover" popover><div class="m-stack" data-gap="1" style="padding: var(--m-space-2, 0.5rem)"><strong>Share link</strong><span class="gallery-note">Anyone with the link can view.</span></div></div>
<dialog class="m-dialog" id="g-dialog" aria-labelledby="g-dialog-title"><header class="m-dialog-header"><div><h2 class="m-dialog-title" id="g-dialog-title">Invite a teammate</h2><p class="m-dialog-description">They’ll get an email with a link to join this workspace.</p></div></header><footer class="m-dialog-footer"><button type="button" class="m-button" data-close>Cancel</button><button type="button" class="m-button" data-variant="primary" data-close>Send invite</button></footer></dialog>
<dialog class="m-dialog m-sheet" id="g-sheet" aria-labelledby="g-sheet-title"><header class="m-dialog-header"><h2 class="m-dialog-title" id="g-sheet-title">Filters</h2><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Close" data-close>✕</button></header><div class="m-dialog-body"><div class="m-skeleton" data-shape="lines" style="--lines: 5" aria-hidden="true"></div></div></dialog>
<section class="m-toast-region" id="g-toasts" aria-live="polite" aria-label="Notifications"></section>`,
)}
${panel(
  'g-route-panel',
  'Page transitions',
  'navigate() wraps a route change in a view transition: a fade, or a slide when the language says so.',
  `<div class="gallery-route" id="g-route"><h4 class="m-card-title">Overview</h4><p class="gallery-note">Three projects are on track; one needs a decision on scope before Friday.</p></div>`,
  button('Next page', 'id="g-route-next"', 'secondary'),
)}
</div></section>`;

  const sparkRows = charts.sparks.map(([name, svg]) => `<tr><td><code>${name}</code></td><td>${svg}</td></tr>`).join('');
  const chartsSection = `<section class="gallery-section" aria-labelledby="g-charts"><div class="m-cluster" data-justify="between" data-align="center"><h2 id="g-charts">Charts</h2><div class="m-cluster" data-gap="2">${button(`${ICON.refresh}Draw again`, 'id="g-redraw"')}${button('New data', 'id="g-update"', 'secondary')}</div></div>
<div class="gallery-stats">${charts.stats.map((s) => `<article class="m-card">${s}</article>`).join('')}</div>
<div class="gallery-grid" data-wide>
${panel('g-line-panel', 'Line', 'Lines draw on; the latest point is marked.', charts.line)}
${panel('g-area-panel', 'Area', 'The fill fades in under the line, from zero.', charts.area)}
${panel('g-bar-panel', 'Bar', 'Bars grow from their base one after another.', charts.bar)}
${panel('g-donut-panel', 'Donut and sparklines', 'Parts sweep round in turn; sparklines sit in rows.', `${charts.donut}<table class="gallery-table"><tbody>${sparkRows}</tbody></table>`)}
</div></section>`;

  return `<!doctype html>
<html lang="en" data-theme="minimal">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Motion gallery · @mariachi/motion ${version}</title>
<script>
  (() => {
    const q = new URLSearchParams(location.search);
    const theme = q.get('theme') || 'minimal';
    const design = q.get('design') || '../../design/dist';
    const html = document.documentElement;
    html.dataset.theme = theme;
    if (q.get('mode')) html.dataset.mode = q.get('mode');
    for (const href of [design + '/kits/' + theme + '/index.css', design + '/css/components.css', './motion.css']) {
      document.write('<link rel="stylesheet" href="' + href + '">');
    }
  })();
</script>
<style>${STYLE}</style>
</head>
<body>
<main class="gallery">
<header class="gallery-head"><div><h1>Motion</h1><p>Loading, motion and charts from <code>@mariachi/motion</code> ${version}, in this language’s overlay. Every colour, corner and tempo comes from its tokens.</p></div></header>
${loading}
${actions}
${motion}
${chartsSection}
</main>
<script type="module">${SCRIPT}</script>
</body>
</html>
`;
}
