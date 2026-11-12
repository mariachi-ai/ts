import type { ArchetypeRecipe } from '../types';

/*
 * Broadsheet's seven layout recipes: framework-free HTML using only @mariachi/design classes and
 * tokens (no colour literals), with sample data from a made-up nature-writing publication, The
 * Understory, and its writer. They follow the language's real screen patterns: the writer's white
 * sidebar with small uppercase groups and the current row on grey, stat tiles with an orange top
 * rule, a 728px reading column with a serif body and a sans chrome, pill reaction buttons, comment
 * threads with small uppercase actions, the joined email-and-subscribe form, and plan cards whose
 * chosen one takes an orange edge.
 */

// Lucide icons, outlined, 2px stroke (the reference draws Lucide at its default weight)
const icon = (paths: string, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  draft: '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  layers:
    '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  comment: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/>',
  wallet:
    '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  palette:
    '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  inbox:
    '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  left: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  updown: '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
  up: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  downArrow: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  external: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  heart:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  restack: '<path d="m2 9 3-3 3 3"/><path d="M13 18H7a2 2 0 0 1-2-2V6"/><path d="m22 15-3 3-3-3"/><path d="M11 6h6a2 2 0 0 1 2 2v10"/>',
  share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  check: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  cross: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  feather: '<path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/>',
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  refresh:
    '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
};

// Shared styles, all from tokens
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)';
const meta =
  'font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-medium); text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide); color: var(--m-color-fg-muted)';
const small = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
const pageTitle = 'font-size: var(--m-font-size-2xl); line-height: var(--m-font-leading-tight)';
const cardTitle = 'font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-bold)';
const num = 'font-variant-numeric: tabular-nums';
const mutedLink = `${small}; text-decoration: none; font-weight: var(--m-font-weight-medium)`;
// The brand mark: the signature orange in a rounded square (no logo, an abstract feather)
const mark = (size: number, radius = 'var(--m-radius-md)') =>
  `<span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: ${size}px; block-size: ${size}px; border-radius: ${radius}; background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">${icon(I.feather, Math.round(size * 0.55))}</span>`;
// A photo slot: images are the writer's own; recipes show the slot, never a picture
const thumb = (w: string, h: string) =>
  `<span aria-hidden="true" style="display: grid; place-items: center; flex: none; inline-size: ${w}; block-size: ${h}; border-radius: var(--m-radius-sm); background: var(--m-color-bg-sunken); box-shadow: inset 0 0 0 1px var(--m-color-border-default); color: var(--m-color-fg-subtle)">${icon(I.image, 20)}</span>`;
// The segmented control: a bordered track, the current segment on grey
const segmented = (label: string, items: string[], current: string) =>
  `<div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="${label}" style="box-shadow: inset 0 0 0 1px var(--m-color-border-default)">${items
    .map(
      (t) =>
        `<button type="button" class="m-tab" role="tab" aria-selected="${t === current}"${t === current ? '' : ' tabindex="-1"'}>${t}</button>`,
    )
    .join('')}</div></div>`;

const nav = (items: [string, string, string?][], current: string) =>
  items
    .map(
      ([ic, l, count]) =>
        `          <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${icon(I[ic as keyof typeof I], 16)} ${l}${count ? ` <span class="m-sidebar-count">${count}</span>` : ''}</a></li>`,
    )
    .join('\n');

// The writer's workspace: a white sidebar with a hairline edge, the publication switcher, a
// full-width orange action, and groups under small uppercase labels
const shell = (current: string, title: string, main: string) => `<div class="m-split" style="--m-layout-split-gap: 0; min-block-size: 100vh">
  <nav class="m-sidebar" aria-label="Writer" style="border-inline-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
    <div class="m-stack" data-gap="3">
      <button type="button" class="m-button" data-variant="ghost" style="justify-content: space-between; inline-size: 100%; box-shadow: inset 0 0 0 1px var(--m-color-border-default)"><span class="m-cluster" data-gap="2">${mark(20, 'var(--m-radius-sm)')} The Understory</span>${icon(I.updown, 14)}</button>
      <ul class="m-stack" data-gap="1" style="padding: 0; list-style: none">
${nav([['home', 'Overview']], current)}
      </ul>
      <button type="button" class="m-button" data-variant="primary" style="inline-size: 100%">Write ${icon(I.down, 14)}</button>
    </div>
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Publishing</h2>
      <ul>
${nav(
  [
    ['draft', 'Drafts', '3'],
    ['calendar', 'Scheduled'],
    ['file', 'Published'],
    ['layers', 'Series'],
  ],
  current,
)}
      </ul>
    </div>
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Readers</h2>
      <ul>
${nav(
  [
    ['mail', 'Mailing list'],
    ['comment', 'Comments', '12'],
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
    ['tag', 'Plans and pricing'],
    ['wallet', 'Payouts'],
    ['palette', 'Appearance'],
  ],
  current,
)}
      </ul>
    </div>
  </nav>
  <div class="m-stack" data-gap="0">
    <header class="m-cluster" data-justify="between" style="padding: var(--m-space-4) var(--m-space-8); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
      <h1 style="${pageTitle}">${title}</h1>
      <div class="m-cluster" data-gap="1">
        <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Search">${icon(I.search, 20)}</button>
        <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Messages">${icon(I.comment, 20)}</button>
        <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Notifications">${icon(I.bell, 20)}</button>
        <span class="m-avatar" aria-label="Odile Brannock">OB</span>
      </div>
    </header>
    <main class="m-container" style="padding-block: var(--m-space-8) var(--m-space-12)">
${main}
    </main>
  </div>
</div>`;

// Readers over 60 days: the signature orange over a soft fade of itself
const pts = [
  31, 33, 32, 35, 34, 37, 41, 39, 44, 52, 49, 46, 47, 45, 50, 55, 53, 51, 57, 63, 61, 58, 60, 66, 71, 68, 65, 69, 74,
  72, 70, 76, 79, 77, 83, 88,
];
const line = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${((i * 640) / (pts.length - 1)).toFixed(1)},${(180 - v * 1.8).toFixed(1)}`).join(' ');
const chart = `<svg viewBox="0 0 640 180" width="100%" preserveAspectRatio="none" style="display: block; block-size: 13rem" role="img" aria-label="Paying readers over the last 30 days, rising from 1,210 to 1,284">
              <defs><linearGradient id="bs-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: var(--m-color-brand-default); stop-opacity: 0.24"/><stop offset="1" style="stop-color: var(--m-color-brand-default); stop-opacity: 0.02"/></linearGradient></defs>
              <path d="M0,45 L640,45 M0,90 L640,90 M0,135 L640,135" fill="none" style="stroke: var(--m-color-border-muted)" stroke-width="1" vector-effect="non-scaling-stroke"/>
              <path d="${line} L640,180 L0,180 Z" fill="url(#bs-fade)"/>
              <path d="${line}" fill="none" style="stroke: var(--m-color-brand-default)" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
            </svg>`;

// A stat tile: the chosen one is white with a 3px orange rule on top; the rest sit on the quiet grey
const tile = (label: string, value: string, delta: string, up: boolean | null, from: string, chosen = false) =>
  `<button type="button" class="m-stack" data-gap="1" aria-pressed="${chosen}" style="padding: var(--m-space-4) var(--m-space-5); text-align: start; font: inherit; color: inherit; border: 0; border-block-start: 3px solid ${chosen ? 'var(--m-color-brand-default)' : 'transparent'}; border-inline-end: var(--m-border-width-thin) solid var(--m-color-border-default); background: ${chosen ? 'var(--m-color-bg-surface)' : 'var(--m-color-bg-sunken)'}; cursor: pointer">
                <span class="m-cluster" data-justify="between"><span style="font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-medium)">${label}</span><span style="color: var(--m-color-fg-subtle); display: inline-flex">${icon(I.info, 14)}</span></span>
                <span class="m-cluster" data-justify="between"><span style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); ${num}">${value}</span><span class="m-badge"${up === true ? ' data-tone="success"' : ''}>${up === null ? '' : icon(up ? I.up : I.downArrow, 12)} ${delta}</span></span>
                <span style="${small}; ${num}">${from}</span>
              </button>`;

const source = (name: string, tone: string, kind: string, count: string, share: string) =>
  `              <tr><td>${name}</td><td><span class="m-badge" data-tone="${tone}">${kind}</span></td><td data-numeric style="${num}">${count} <span style="color: var(--m-color-fg-muted)">(${share})</span></td></tr>`;

const dashboard = shell(
  'Overview',
  'Overview',
  `      <div class="m-stack" data-gap="6">
        <div class="m-cluster" data-justify="between">
          <h2 style="${cardTitle}">Last 30 days</h2>
          <select class="m-select" data-size="sm" aria-label="Period" style="inline-size: auto"><option>30 days</option><option>90 days</option><option>12 months</option></select>
        </div>
        <section class="m-card" style="padding: 0; overflow: hidden" aria-label="Key figures">
          <div class="m-grid" style="--m-layout-grid-min: 12rem; --m-layout-grid-gap: 0; border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
              ${tile('Paying readers', '1,284', '6.1%', true, 'From 1,210', true)}
              ${tile('Annual revenue', '$61,430', '3.8%', true, 'From $59,180')}
              ${tile('Open rate', '52%', '1.4%', false, 'From 53%')}
          </div>
          <div style="padding: var(--m-space-5) var(--m-space-5) var(--m-space-3)">
            ${chart}
            <div class="m-cluster" data-justify="between" style="${small}; padding-block-start: var(--m-space-2)"><span>Oct 13</span><span>Oct 20</span><span>Oct 27</span><span>Nov 3</span><span>Nov 10</span></div>
          </div>
        </section>
        <div class="m-grid" style="--m-layout-grid-min: 20rem">
          <section class="m-card" aria-labelledby="bs-latest">
            <div class="m-card-body m-stack" data-gap="4">
              <div class="m-cluster" data-justify="between"><h2 id="bs-latest" style="${cardTitle}">Latest post</h2><a href="#" style="${mutedLink}">Open report</a></div>
              <div class="m-cluster" data-gap="4" style="flex-wrap: nowrap" data-align="start">
                ${thumb('5rem', '3.5rem')}
                <div class="m-stack" data-gap="1"><span style="font-weight: var(--m-font-weight-bold)">What the hedgerow remembers</span><span style="${meta}">Nov 10 · Everyone</span></div>
              </div>
              <dl class="m-grid" style="--m-layout-grid-min: 6rem; ${hair}; padding-block-start: var(--m-space-4)">
                <div class="m-stack" data-gap="1"><dt style="${small}">Opened</dt><dd style="font-weight: var(--m-font-weight-bold); ${num}">58%</dd></div>
                <div class="m-stack" data-gap="1"><dt style="${small}">Views</dt><dd style="font-weight: var(--m-font-weight-bold); ${num}">9,804</dd></div>
                <div class="m-stack" data-gap="1"><dt style="${small}">New readers</dt><dd style="font-weight: var(--m-font-weight-bold); ${num}">38</dd></div>
              </dl>
            </div>
          </section>
          <section class="m-card" aria-labelledby="bs-drafts">
            <div class="m-card-body m-stack" data-gap="2">
              <div class="m-cluster" data-justify="between"><h2 id="bs-drafts" style="${cardTitle}">Drafts</h2><a href="#" style="${mutedLink}">See all</a></div>
              <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
                <li class="m-cluster" data-justify="between" style="padding-block: var(--m-space-3)"><span>Moss, slowly</span><span style="${small}">Edited 2h ago</span></li>
                <li class="m-cluster" data-justify="between" style="padding-block: var(--m-space-3); ${hair}"><span>A field guide to fog</span><span style="${small}">Yesterday</span></li>
                <li class="m-cluster" data-justify="between" style="padding-block: var(--m-space-3); ${hair}"><span>Letters, no. 14</span><span style="${small}">Nov 2</span></li>
              </ul>
            </div>
          </section>
        </div>
        <section class="m-stack" data-gap="3" aria-labelledby="bs-sources">
          <div class="m-cluster" data-justify="between">
            <h2 id="bs-sources" style="${cardTitle}">Where new readers came from</h2>
            <button type="button" class="m-button" data-size="sm">${icon(I.download, 14)} Export</button>
          </div>
          <div class="m-table-wrap">
            <table class="m-table">
              <thead><tr><th>Source</th><th>Kind</th><th data-numeric>New readers</th></tr></thead>
              <tbody>
${source('Recommended by other writers', 'accent', 'Network', '412', '54%')}
${source('Web search', 'success', 'Search', '139', '18%')}
${source('Shared links', 'info', 'Social', '97', '13%')}
${source('Typed the address', 'neutral', 'Direct', '64', '8%')}
              </tbody>
            </table>
          </div>
        </section>
      </div>`,
);

// The publication's reader view: a centred masthead, underline tabs, then the 728px column
const masthead = (current: string) => `<header class="m-navbar" style="justify-content: space-between; flex-wrap: wrap; block-size: auto; min-block-size: var(--m-navbar-height); padding-block: var(--m-space-3)">
    <span style="flex: 1" aria-hidden="true"></span>
    <a class="m-navbar-brand" href="#">The Understory</a>
    <div class="m-cluster" data-gap="2" style="flex: 1; justify-content: flex-end">
      <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Search">${icon(I.search, 20)}</button>
      <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Share">${icon(I.share, 20)}</button>
      <button type="button" class="m-button" data-variant="primary">Subscribe</button>
      <button type="button" class="m-button" data-variant="ghost">Sign in</button>
    </div>
  </header>
  <div class="m-tabs"><div class="m-tab-list" role="tablist" aria-label="Sections" style="justify-content: center">${['Front page', 'Essays', 'Field guides', 'Letters', 'Colophon']
    .map(
      (t) =>
        `<button type="button" class="m-tab" role="tab" aria-selected="${t === current}"${t === current ? '' : ' tabindex="-1"'}>${t}</button>`,
    )
    .join('')}</div></div>`;

const postRow = (title: string, sub: string, date: string, paid = false, first = false) =>
  `          <li class="m-cluster" data-gap="6" data-align="start" style="flex-wrap: nowrap; padding-block: var(--m-space-5)${first ? '' : `; ${hair}`}">
            <a href="#" class="m-stack" data-gap="1" style="flex: 1; color: inherit; text-decoration: none">
              <span style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold); line-height: var(--m-font-leading-tight)">${title}</span>
              <span>${sub}</span>
              <span class="m-cluster" data-gap="2" style="${meta}">${paid ? `<span class="m-badge" style="padding-inline: 3px" aria-label="For paying readers">${icon(I.lock, 12)}</span>` : ''}${date} · Odile Brannock</span>
            </a>
            ${thumb('min(10rem, 30%)', 'auto; aspect-ratio: 3 / 2')}
          </li>`;

const reactions = `<div class="m-cluster" data-justify="between">
            <div class="m-cluster" data-gap="2">
              <button type="button" class="m-button" style="border-radius: var(--m-radius-full); background: transparent; box-shadow: inset 0 0 0 1px var(--m-color-border-default); color: var(--m-color-fg-muted)" aria-label="Like, 312 likes">${icon(I.heart, 18)} 312</button>
              <button type="button" class="m-button" style="border-radius: var(--m-radius-full); background: transparent; box-shadow: inset 0 0 0 1px var(--m-color-border-default); color: var(--m-color-fg-muted)" aria-label="48 comments">${icon(I.comment, 18)} 48</button>
              <button type="button" class="m-button" style="border-radius: var(--m-radius-full); background: transparent; box-shadow: inset 0 0 0 1px var(--m-color-border-default); color: var(--m-color-fg-muted)" aria-label="Restack, 21 restacks">${icon(I.restack, 18)} 21</button>
            </div>
            <button type="button" class="m-button" style="border-radius: var(--m-radius-full); background: transparent; box-shadow: inset 0 0 0 1px var(--m-color-border-default); color: var(--m-color-fg-muted); font-weight: var(--m-font-weight-medium)">Share</button>
          </div>`;

// The joined subscribe form: the email field and the orange button share one 8px-cornered box
const subscribeForm = (id: string, invalid = false) => `<form class="m-stack" data-gap="2" style="inline-size: 100%; max-inline-size: 24rem; margin-inline: auto" aria-label="Subscribe">
            <div class="m-cluster" data-gap="0" style="flex-wrap: nowrap">
              <input class="m-input" id="${id}" type="email" placeholder="Type your email…" aria-label="Email"${invalid ? ` value="odile@understory" aria-invalid="true" aria-describedby="${id}-e"` : ''} style="flex: 1; border-start-end-radius: 0; border-end-end-radius: 0${invalid ? '' : '; border-color: var(--m-color-accent-default)'}">
              <button type="submit" class="m-button" data-variant="primary" style="border-start-start-radius: 0; border-end-start-radius: 0">Subscribe</button>
            </div>${invalid ? `\n            <p class="m-field-error" id="${id}-e">That address is missing its ending, like .com. Nothing was sent.</p>` : ''}
          </form>`;

const comment = (
  initials: string,
  name: string,
  date: string,
  body: string,
  likes: number,
  liked = false,
  replies = '',
) => `            <article class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap">
              <span class="m-avatar" data-size="md">${initials}</span>
              <div class="m-stack" data-gap="2" style="flex: 1">
                <div class="m-cluster" data-justify="between"><span class="m-cluster" data-gap="2"><span style="font-weight: var(--m-font-weight-medium)">${name}</span><span style="${small}">${date}</span></span><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="More">${icon(I.more, 16)}</button></div>
                ${liked ? `<span><span class="m-badge" data-tone="accent" data-variant="outline">${icon(I.heart, 12)} Liked by Odile Brannock</span></span>` : ''}
                <p>${body}</p>
                <div class="m-cluster" data-justify="between" style="${meta}">
                  <span class="m-cluster" data-gap="5"><span class="m-cluster" data-gap="1">${icon(I.heart, 14)} Like (${likes})</span><span class="m-cluster" data-gap="1">${icon(I.comment, 14)} Reply</span></span>
                  <span class="m-cluster" data-gap="1">${icon(I.share, 14)} Share</span>
                </div>${replies}
              </div>
            </article>`;

const listDetail = `<div class="m-stack" data-gap="0">
  ${masthead('Essays')}
  <main class="m-container" data-size="md" style="padding-block: var(--m-space-8) var(--m-space-16)">
    <div class="m-stack" data-gap="16">
      <!-- The list: the archive, newest first, with a lock on posts for paying readers -->
      <section class="m-stack" data-gap="4" aria-label="Essays">
        <div class="m-cluster" data-justify="between">
          ${segmented('Sort', ['Newest', 'Most read', 'Most discussed'], 'Newest')}
          <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Search the archive">${icon(I.search, 20)}</button>
        </div>
        <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
${postRow('What the hedgerow remembers', 'Three hundred years of a single field boundary, read like a diary.', 'Nov 10', false, true)}
${postRow('A field guide to fog', 'Valley fog, sea fret and the kind that only sits on rivers.', 'Nov 3', true)}
        </ul>
        <span style="${meta}; color: var(--m-color-fg-default); padding-block-start: var(--m-space-4); ${hair}">October 2026</span>
        <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
${postRow('The year the swifts came late', 'Notes from a tower count, and what an empty sky sounds like.', 'Oct 27', false, true)}
        </ul>
      </section>

      <!-- The detail: the post itself, read in the serif, then the discussion -->
      <article class="m-stack" data-gap="6" aria-labelledby="bs-post" style="${hair}; padding-block-start: var(--m-space-12)">
        <header class="m-stack" data-gap="4">
          <div class="m-stack" data-gap="2">
            <h1 id="bs-post" style="font-size: var(--m-font-size-3xl); line-height: var(--m-font-leading-tight)">What the hedgerow remembers</h1>
            <p style="font-size: var(--m-font-size-lg); color: var(--m-color-fg-muted)">Three hundred years of a single field boundary, read like a diary.</p>
          </div>
          <div class="m-cluster" data-gap="3"><span class="m-avatar" data-size="md">OB</span><span class="m-stack" data-gap="0"><span style="${meta}; color: var(--m-color-fg-default)">Odile Brannock</span><span style="${meta}">Nov 10, 2026</span></span></div>
          ${reactions}
        </header>
        <div class="m-prose" style="font-family: var(--m-font-family-serif)">
          <p>The hedge at the bottom of the lane is older than the house, the road and the parish boundary. You can count its age, roughly, by the number of woody species in a thirty-yard stretch: one for every century, give or take a hawthorn.</p>
          <p>Ours has eleven. That puts the first planting somewhere before anyone thought to write down who owned the field, which is the kind of fact that rearranges a morning walk.</p>
          <h3>Reading the layers</h3>
          <p>Hazel and field maple came first. Blackthorn arrived with the enclosures, and the elder, as ever, turned up wherever someone left a gap. <a href="#">Last spring’s survey</a> found a single spindle tree, which no one alive remembers planting.</p>
          <blockquote>A hedge is a document written very slowly, in a hand that changes every generation.</blockquote>
          <p>What follows is the field notebook from a year of walking it, one season at a time.</p>
        </div>
        ${subscribeForm('bs-sub')}
        <div style="${hair}; padding-block-start: var(--m-space-4)">${reactions}</div>
        <section class="m-stack" data-gap="6" aria-labelledby="bs-discussion" style="padding-block-start: var(--m-space-4)">
          <h2 id="bs-discussion" style="font-size: var(--m-font-size-xl)">Discussion about this post</h2>
          ${segmented('Responses', ['Comments', 'Restacks'], 'Comments')}
          <div class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap">
            <span class="m-avatar" data-size="md" aria-hidden="true">${icon(I.feather, 16)}</span>
            <textarea class="m-input" rows="3" placeholder="Write a comment…" aria-label="Write a comment" style="flex: 1"></textarea>
          </div>
${comment(
  'PW',
  'Priya Whitcombe',
  'Nov 10',
  'We have a ten-species stretch on the old drove road near us. I’d always assumed the elder was planted on purpose. Now I know better.',
  24,
  true,
  `
                <div class="m-stack" data-gap="4" style="border-inline-start: 2px solid var(--m-color-border-default); padding: var(--m-space-2) 0 var(--m-space-2) var(--m-space-4); margin-block-start: var(--m-space-2)">
${comment('OB', 'Odile Brannock', 'Nov 11', 'The elder always looks deliberate. It never is.', 9)}
                </div>`,
)}
${comment('JH', 'Jonah Haverill', 'Nov 11', 'Is there a version of the count for stone walls? Asking for a friend with a lot of Pennine wall and no hedges at all.', 6)}
          <a href="#" style="font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-bold); color: var(--m-color-fg-muted); text-decoration: none">45 more comments…</a>
        </section>
      </article>
    </div>
  </main>
</div>`;

// Setting up a publication: one narrow column, a segmented progress bar, the mark, then the fields
const step = (done: boolean) =>
  `<progress class="m-progress" data-size="sm" value="${done ? 1 : 0}" max="1" style="flex: 1" aria-hidden="true"></progress>`;

const onboarding = `<main class="m-container" data-size="sm" style="padding-block: var(--m-space-10) var(--m-space-16)">
  <form class="m-stack" data-gap="8" aria-labelledby="bs-onb-title">
    <div class="m-stack" data-gap="2">
      <div class="m-cluster" data-gap="1" style="flex-wrap: nowrap" role="img" aria-label="Step 2 of 4">${step(true)}${step(true)}${step(false)}${step(false)}</div>
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="align-self: flex-start">${icon(I.left, 16)} Back</button>
    </div>
    <div class="m-stack" data-gap="3" data-align="center" style="text-align: center">
      ${mark(56, 'var(--m-radius-lg)')}
      <h1 id="bs-onb-title" style="${pageTitle}">Name your publication</h1>
      <p class="m-muted">This is what readers see at the top of every post and in their inbox. You can change it later.</p>
    </div>
    <div class="m-stack" data-gap="5">
      <div class="m-field">
        <label class="m-field-label" for="bs-onb-name">Publication name</label>
        <input class="m-input" id="bs-onb-name" value="The Understory">
      </div>
      <div class="m-field">
        <label class="m-field-label" for="bs-onb-desc">Short description</label>
        <textarea class="m-input" id="bs-onb-desc" rows="3" aria-describedby="bs-onb-desc-hint">Slow essays on hedges, weather and the small lives in between.</textarea>
        <p class="m-field-hint" id="bs-onb-desc-hint">63 of 140 characters. It appears under your name on the front page.</p>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="bs-onb-addr">Web address</label>
        <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><input class="m-input" id="bs-onb-addr" value="understory" style="flex: 1" aria-describedby="bs-onb-addr-hint"><span class="m-muted">.pages.example</span></div>
        <p class="m-field-hint" id="bs-onb-addr-hint">Letters, numbers and hyphens. Available.</p>
      </div>
      <label class="m-field" data-layout="inline"><input class="m-checkbox" type="checkbox" checked> Send me a short guide for new writers</label>
    </div>
    <div class="m-stack" data-gap="3">
      <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Continue</button>
      <button type="button" class="m-button" data-variant="ghost" style="align-self: center; color: var(--m-color-fg-muted)">Skip for now ${icon(I.right, 16)}</button>
    </div>
  </form>
</main>`;

// A setting: its label and help on the left, the control on the right, in a hairline-framed card
const setting = (label: string, help: string, control: string, first = false) =>
  `          <div class="m-cluster" data-justify="between" data-gap="6" style="flex-wrap: nowrap; padding: var(--m-space-4) var(--m-space-5)${first ? '' : `; ${hair}`}">
            <div class="m-stack" data-gap="1"><span style="font-weight: var(--m-font-weight-semibold)">${label}</span>${help ? `<span style="${small}">${help}</span>` : ''}</div>
            <div class="m-cluster" data-gap="2" style="flex: none; flex-wrap: nowrap">${control}</div>
          </div>`;

const settingsNav = (items: string[], current: string) =>
  items
    .map(
      (l) =>
        `        <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${l}</a></li>`,
    )
    .join('\n');

const settings = `<div class="m-split" style="--m-layout-split-side: 15rem; --m-layout-split-gap: 0; min-block-size: 100vh">
  <nav class="m-sidebar" aria-label="Settings" style="--m-sidebar-link-fg: var(--m-color-fg-muted); --m-sidebar-link-active-bg: transparent; --m-sidebar-link-hover-bg: transparent; --m-sidebar-link-hover-fg: var(--m-color-fg-default); border-inline-end: var(--m-border-width-thin) solid var(--m-color-border-default); padding-block-start: var(--m-space-8)">
    <div class="m-stack" data-gap="4" style="padding-inline: var(--m-space-3)">
      <a href="#" class="m-cluster" data-gap="1" style="${mutedLink}">${icon(I.left, 14)} Overview</a>
      <h1 style="font-size: var(--m-font-size-xl)">Settings</h1>
      <input class="m-input" type="search" placeholder="Search settings" aria-label="Search settings" style="background: var(--m-color-border-muted); border-color: transparent; box-shadow: none">
    </div>
    <div class="m-sidebar-section">
      <ul>
${settingsNav(['Publication', 'Profile', 'Appearance', 'Email delivery', 'Plans and payouts', 'Team', 'Integrations', 'Data export', 'Close publication'], 'Publication')}
      </ul>
    </div>
  </nav>
  <div>
  <main class="m-container" data-size="md" style="padding-block: var(--m-space-8) var(--m-space-16)">
    <div class="m-stack" data-gap="10">
      <section class="m-stack" data-gap="3" aria-labelledby="bs-set-basics">
        <h2 id="bs-set-basics" style="font-size: var(--m-font-size-xl)">Publication</h2>
        <div class="m-card" style="padding: 0">
${setting('Name', 'Shown at the top of every post and email.', '<input class="m-input" value="The Understory" aria-label="Name" style="inline-size: 16rem">', true)}
${setting('Short description', 'One line under your name on the front page.', '<input class="m-input" value="Slow essays on hedges and weather" aria-label="Short description" style="inline-size: 16rem">')}
${setting('Language', '', '<select class="m-select" aria-label="Language" style="inline-size: 16rem"><option>English (UK)</option><option>English (US)</option><option>Cymraeg</option></select>')}
${setting('Mark', 'A square image, at least 256 pixels.', `${mark(40)}<button type="button" class="m-button">${icon(I.upload, 16)} Upload</button>`)}
        </div>
      </section>
      <section class="m-stack" data-gap="3" aria-labelledby="bs-set-readers">
        <h2 id="bs-set-readers" style="font-size: var(--m-font-size-xl)">Reading and comments</h2>
        <div class="m-card" style="padding: 0">
${setting('Ask new visitors to subscribe', 'A short prompt after they read for a while.', '<input class="m-switch" type="checkbox" role="switch" checked aria-label="Ask new visitors to subscribe">', true)}
${setting('Who can comment', '', '<select class="m-select" aria-label="Who can comment" style="inline-size: 16rem"><option>Paying readers</option><option>All subscribers</option><option>No one</option></select>')}
${setting('Hide like counts', 'Readers still see their own likes.', '<input class="m-switch" type="checkbox" role="switch" aria-label="Hide like counts">')}
        </div>
      </section>
      <section class="m-stack" data-gap="3" aria-labelledby="bs-set-plans">
        <div class="m-cluster" data-justify="between"><h2 id="bs-set-plans" style="font-size: var(--m-font-size-xl)">Plans</h2><span class="m-badge" data-tone="success">Payouts connected</span></div>
        <div class="m-card" style="padding: 0">
${setting('Monthly', '', '<input class="m-input" value="7.00" aria-label="Monthly price" style="inline-size: 7rem; text-align: end; font-variant-numeric: tabular-nums"><select class="m-select" aria-label="Currency" style="inline-size: 6rem"><option>GBP</option><option>EUR</option><option>USD</option></select>', true)}
${setting('Yearly', 'Two months free compared with paying monthly.', '<input class="m-input" value="70.00" aria-label="Yearly price" style="inline-size: 7rem; text-align: end; font-variant-numeric: tabular-nums"><select class="m-select" aria-label="Currency" style="inline-size: 6rem"><option>GBP</option><option>EUR</option><option>USD</option></select>')}
${setting('Patron', 'An optional yearly plan for readers who want to give more. They choose the amount, from your suggestion up.', '<button type="button" class="m-button">Remove patron plan</button>')}
        </div>
      </section>
      <section class="m-stack" data-gap="3" aria-labelledby="bs-set-close">
        <h2 id="bs-set-close" style="font-size: var(--m-font-size-xl)">Close publication</h2>
        <div class="m-card" style="padding: 0">
${setting('Close The Understory', 'Ends 1,284 paid plans with a prorated refund and takes the archive offline. Your mailing list is exported to you first. This can’t be undone.', '<button type="button" class="m-button" data-variant="danger">Close publication</button>', true)}
        </div>
      </section>
    </div>
  </main>
  </div>
</div>`;

const emptyState = shell(
  'Drafts',
  'Drafts',
  `      <div class="m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-16)">
        <span style="color: var(--m-color-fg-subtle)">${icon(I.draft, 40)}</span>
        <h2 style="font-size: var(--m-font-size-xl)">No drafts yet</h2>
        <p class="m-muted" style="max-inline-size: 26rem">Everything you start writing is kept here until you publish or schedule it.</p>
        <div class="m-cluster" data-gap="2" data-justify="center">
          <button type="button" class="m-button" data-variant="primary">${icon(I.draft, 16)} Start writing</button>
          <button type="button" class="m-button">${icon(I.upload, 16)} Import from a file</button>
        </div>
      </div>`,
);

// A plan card: name, price, the choice in its corner, and what's included; the chosen one takes an
// orange edge and a soft drop
const plan = (id: string, name: string, price: string, items: [boolean, string][], chosen = false, extra = '') =>
  `      <label class="m-card" for="bs-plan-${id}" style="cursor: pointer${chosen ? '; border-color: var(--m-color-brand-default); box-shadow: var(--m-shadow-md)' : ''}">
        <div class="m-card-body m-stack" data-gap="4">
          <div class="m-cluster" data-justify="between" data-align="start" style="flex-wrap: nowrap">
            <span class="m-stack" data-gap="1"><span style="font-weight: var(--m-font-weight-bold)">${name}</span><span style="${small}; ${num}">${price}</span></span>
            <input class="m-radio" type="radio" name="bs-plan" id="bs-plan-${id}"${chosen ? ' checked' : ''}>
          </div>${extra}
          <ul class="m-stack" data-gap="3" style="padding: 0; list-style: none; ${small}">
${items.map(([on, t]) => `            <li class="m-cluster" data-gap="2" data-align="start" style="flex-wrap: nowrap"><span style="display: inline-flex; flex: none">${icon(on ? I.check : I.cross, 16)}</span><span${on ? '' : ' style="text-decoration: line-through"'}>${t}</span></li>`).join('\n')}
          </ul>
        </div>
      </label>`;

const pricing = `<main class="m-container" style="padding-block: var(--m-space-12) var(--m-space-16)">
  <div class="m-stack" data-gap="12">
    <section class="m-card" style="box-shadow: var(--m-shadow-lg)" aria-labelledby="bs-plans">
      <div class="m-card-body m-stack" data-gap="8" style="padding: var(--m-space-10) var(--m-space-8)">
        <div class="m-stack" data-gap="4" data-align="center" style="text-align: center">
          ${mark(48, 'var(--m-radius-lg)')}
          <h1 id="bs-plans" style="${pageTitle}">Choose how to read The Understory</h1>
          <div class="m-cluster" data-gap="2" data-justify="center" role="group" aria-label="Who it’s for">
            <button type="button" class="m-button" data-size="sm" aria-pressed="true" style="border-radius: var(--m-radius-full); background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)">For me</button>
            <button type="button" class="m-button" data-size="sm" aria-pressed="false" style="border-radius: var(--m-radius-full)">For a team</button>
            <button type="button" class="m-button" data-size="sm" aria-pressed="false" style="border-radius: var(--m-radius-full)">As a gift</button>
          </div>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 13rem">
${plan('year', 'Yearly', '£70 a year (£5.83 a month)', [[true, 'Every essay and field guide'], [true, 'The full archive, back to the first issue'], [true, 'Comment and join the reading circle'], [true, 'Two months free']], true)}
${plan('month', 'Monthly', '£7 a month', [[true, 'Every essay and field guide'], [true, 'The full archive, back to the first issue'], [true, 'Comment and join the reading circle']])}
${plan(
  'patron',
  'Patron',
  'From £150 a year',
  [[true, 'Everything in Yearly'], [true, 'A signed print of the season’s map'], [true, 'Your name in the colophon']],
  false,
  `
          <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span class="m-muted">£</span><input class="m-input" value="150" aria-label="Patron amount per year" style="inline-size: 5rem; ${num}"><span class="m-muted" style="white-space: nowrap">/ year</span></div>`,
)}
${plan('free', 'Free', '£0', [[false, 'Every essay and field guide'], [false, 'The full archive'], [false, 'Comments'], [true, 'One free essay a month']])}
        </div>
        <div class="m-stack" data-gap="3" data-align="center" style="text-align: center">
          <button type="button" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%; max-inline-size: 24rem">Subscribe</button>
          <p style="${small}">Renews every year on November 12. Cancel any time from your account.</p>
          <button type="button" class="m-button" data-variant="ghost" style="color: var(--m-color-fg-muted)">Maybe later ${icon(I.right, 16)}</button>
        </div>
      </div>
    </section>
    <section class="m-stack" data-gap="3" aria-labelledby="bs-faq" style="max-inline-size: 45.5rem; margin-inline: auto; inline-size: 100%">
      <h2 id="bs-faq" style="font-size: var(--m-font-size-xl)">Questions</h2>
      <div class="m-accordion" style="border-inline: 0; border-radius: 0">
        <details class="m-accordion-item" name="bs-faq" open><summary>What do paying readers get?</summary><div class="m-accordion-content">Every essay and field guide as it’s published, the full archive, and the comments. Free readers get one essay a month.</div></details>
        <details class="m-accordion-item" name="bs-faq"><summary>Can I switch between monthly and yearly?</summary><div class="m-accordion-content">Yes. The change starts at your next renewal, and any difference is prorated.</div></details>
        <details class="m-accordion-item" name="bs-faq"><summary>How do gift plans work?</summary><div class="m-accordion-content">You choose the length and the recipient’s email. They get a note on the day you pick, and nothing renews.</div></details>
      </div>
    </section>
  </div>
</main>`;

// Errors: under the field, a summary above the form, a snackbar for what failed elsewhere, the
// reference's own "page not found" over the archive, a failure page, and the paywall as "no access"
const errors = `<div class="m-stack" data-gap="0">
  ${masthead('Front page')}
  <main class="m-container" data-size="md" style="padding-block: var(--m-space-10) var(--m-space-16)">
    <div class="m-stack" data-gap="12">
      <section class="m-stack" data-gap="4" aria-labelledby="bs-err-sub">
        <h2 id="bs-err-sub" style="font-size: var(--m-font-size-xl)">In a field</h2>
        ${subscribeForm('bs-err-email', true)}
      </section>
      <section class="m-stack" data-gap="4" aria-labelledby="bs-err-form" style="${hair}; padding-block-start: var(--m-space-8)">
        <h2 id="bs-err-form" style="font-size: var(--m-font-size-xl)">In a form</h2>
        <div class="m-alert" data-tone="danger" role="alert">
          <span class="m-alert-icon">${icon(I.alert, 16)}</span>
          <div class="m-alert-content"><div class="m-alert-title">2 things need fixing</div><div class="m-alert-body">Your plan prices weren’t saved.</div></div>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="bs-err-month">Monthly price</label>
          <input class="m-input" id="bs-err-month" value="0.50" aria-invalid="true" aria-describedby="bs-err-month-e" style="${num}">
          <p class="m-field-error" id="bs-err-month-e">The monthly price must be at least £1.00.</p>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="bs-err-year">Yearly price</label>
          <input class="m-input" id="bs-err-year" value="5.00" aria-invalid="true" aria-describedby="bs-err-year-e" style="${num}">
          <p class="m-field-error" id="bs-err-year-e">The yearly price must be more than the monthly one.</p>
        </div>
        <div class="m-cluster" data-gap="2"><button type="submit" class="m-button" data-variant="primary">Save plans</button><button type="button" class="m-button" data-variant="ghost">Cancel</button></div>
      </section>
      <section class="m-stack" data-gap="4" aria-label="A snackbar" style="${hair}; padding-block-start: var(--m-space-8)">
        <div class="m-toast" role="alert" style="align-self: center; inline-size: fit-content; max-inline-size: 100%"><div class="m-toast-content"><div class="m-toast-body">Couldn’t send the test email. Check the address and try again.</div></div><button type="button" class="m-button" data-variant="ghost" data-size="sm" style="color: inherit">Retry</button></div>
      </section>
      <section class="m-stack" data-gap="5" aria-labelledby="bs-err-404" style="${hair}; padding-block-start: var(--m-space-10)">
        <span style="${small}; font-family: var(--m-font-family-mono)">404</span>
        <h1 id="bs-err-404" style="font-size: var(--m-font-size-3xl)">Page not found</h1>
        <p class="m-muted">The link may be old, or the post was moved. Here’s what’s new instead.</p>
        ${segmented('Sort', ['Newest', 'Most read'], 'Newest')}
        <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
${postRow('What the hedgerow remembers', 'Three hundred years of a single field boundary, read like a diary.', 'Nov 10', false, true)}
        </ul>
      </section>
      <section class="m-stack" data-gap="4" data-align="center" style="text-align: center; ${hair}; padding-block-start: var(--m-space-12)" aria-labelledby="bs-err-500">
        <span style="color: var(--m-color-fg-subtle)">${icon(I.alert, 40)}</span>
        <span style="${small}; font-family: var(--m-font-family-mono)">500</span>
        <h1 id="bs-err-500" style="${pageTitle}">Something went wrong on our side</h1>
        <p class="m-muted" style="max-inline-size: 28rem">Your post is safe and nothing was sent. Try again in a moment.</p>
        <div class="m-cluster" data-gap="2" data-justify="center"><button type="button" class="m-button" data-variant="primary">${icon(I.refresh, 16)} Try again</button><button type="button" class="m-button">Contact support</button></div>
      </section>
      <section class="m-stack" data-gap="4" data-align="center" style="text-align: center; ${hair}; padding-block-start: var(--m-space-12)" aria-labelledby="bs-err-403">
        <span style="color: var(--m-color-fg-subtle)">${icon(I.lock, 40)}</span>
        <span style="${small}; font-family: var(--m-font-family-mono)">403</span>
        <h1 id="bs-err-403" style="${pageTitle}">This essay is for paying readers</h1>
        <p class="m-muted" style="max-inline-size: 28rem">Subscribe to read the rest, and every field guide in the archive.</p>
        <button type="button" class="m-button" data-variant="primary" data-size="lg" style="min-inline-size: 16rem">Subscribe</button>
        <p style="${small}">Already a paying reader? <a href="#" style="color: var(--m-color-fg-default)">Sign in</a></p>
      </section>
    </div>
  </main>
</div>`;

export const broadsheetRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'The writer’s home: a white sidebar with uppercase groups, stat tiles with an orange top rule over an area chart, the latest post and drafts, and a sources table.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'A publication’s archive under a centred masthead and underline tabs; a row opens the post: serif body, pill reactions, the joined subscribe form and the comment thread.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One narrow column, a segmented progress bar, the orange mark, a bold heading, fields one under another and a full-width Continue.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A plain-text settings list (current in bold ink) beside sections of hairline-framed cards, each setting a row with its control on the right.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description: 'Inside the writer’s workspace: a 40px outline icon, a bold heading, one sentence, an orange action and a grey one.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The reader’s plan chooser: an ink pill switch, four plan cards with the chosen one on an orange edge, check and cross lists, a full-width Subscribe and an FAQ.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'An error under the joined subscribe field, a summary above a form that says nothing was saved, the ink snackbar, “Page not found” over the archive, a failure page and the paywall as no access.',
    html: errors,
  },
];
