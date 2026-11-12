import type { ArchetypeRecipe } from '../types';

/*
 * Bazaar's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from an invented handmade marketplace ("thimble") and one
 * invented pottery shop. They follow the language's real screen patterns: the seller pages' white side
 * column with icon rows and orange counts, a warm canvas under white 12px cards, light serif figures
 * and headings beside a plain sans, black pill actions and 2px outlined secondaries, grey chip
 * filters, hairline tables with underlined titles and black switches; and on the buyer side, the
 * header with the serif wordmark and a pill search ending in an orange button, listing cards with
 * a photo on top (a token-coloured placeholder here), black stars and green sale prices.
 */

// Lucide icons, outlined, 1.75px stroke (the reference's own glyphs read as about 1.5–2px at 24px)
const icon = (paths: string, size = 18) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0">${paths}</svg>`;
// Stars are filled
const solid = (paths: string, size = 14) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true" style="flex-shrink: 0">${paths}</svg>`;
const I = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  palette:
    '<circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
  package:
    '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/><path d="m7.5 4.27 9 5.15"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1"/>',
  bank: '<path d="M10 18v-7"/><path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  heart:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  left: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  up: '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
  downArrow: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  truck:
    '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  image:
    '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  pencil:
    '<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/><path d="m15 5 4 4"/>',
  sliders:
    '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
  ellipsis: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  camera:
    '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  store:
    '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2 2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>',
};

// Type: the light serif for display headings and big figures; the sans for everything else
const serif = (size: string) =>
  `font-family: var(--m-font-family-display); font-weight: 300; font-size: var(--m-font-size-${size}); line-height: var(--m-font-leading-tight); letter-spacing: var(--m-font-heading-tracking)`;
const figure = `${serif('2xl')}; font-variant-numeric: lining-nums tabular-nums`;
const adminTitle =
  'font-family: var(--m-font-family-sans); font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold); letter-spacing: 0; line-height: var(--m-font-leading-tight)';
const sectionTitle =
  'font-family: var(--m-font-family-sans); font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-bold); letter-spacing: 0; line-height: var(--m-font-leading-normal)';
const small = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)';
// A grey "tertiary" pill: the ghost button with its hover fill at rest
const chip = 'style="--m-button-ghost-bg: var(--m-button-ghost-hover-bg)"';
// Terms with an explanation carry a dotted underline
const dotted = 'text-decoration: underline dotted; text-underline-offset: 0.25em';
const link = 'color: var(--m-color-accent-text); text-decoration: underline; text-underline-offset: 0.15em';
const sale = 'color: var(--m-color-success-fg)';
// Field errors are body size, led by the alert icon
const fieldError = 'display: flex; gap: var(--m-space-1); align-items: center; font-size: var(--m-font-size-md)';
const down = 'color: var(--m-color-danger-fg)';

// Photo placeholders: warm tints from the palette, never a real image
const tints = [
  'var(--m-color-brand-subtle)',
  'var(--m-color-success-bg)',
  'var(--m-color-info-bg)',
  'var(--m-color-accent-subtle)',
  'var(--m-color-bg-sunken)',
  'var(--m-color-warning-bg)',
  'var(--m-color-danger-bg)',
];
const photo = (n: number, ratio = '1 / 1', radius = 'var(--m-radius-md)', size = 28) =>
  `<span aria-hidden="true" style="display: grid; place-items: center; aspect-ratio: ${ratio}; inline-size: 100%; border-radius: ${radius}; background: ${tints[n % tints.length]}; color: var(--m-color-fg-subtle)">${icon(I.image, size)}</span>`;
const thumb = (n: number, size = '3.5rem') =>
  `<span aria-hidden="true" style="display: grid; place-items: center; flex-shrink: 0; inline-size: ${size}; block-size: ${size}; border-radius: var(--m-radius-sm); background: ${tints[n % tints.length]}; color: var(--m-color-fg-subtle)">${icon(I.image, 16)}</span>`;
const stars = (rating: string, count: string) =>
  `<span class="m-cluster" data-gap="1" style="gap: 0.25rem; font-size: var(--m-font-size-sm)"><span>${rating}</span>${solid(I.star, 13)}<span style="color: var(--m-color-fg-muted)">(${count})</span></span>`;
const fiveStars = (n = 5) =>
  `<span class="m-cluster" style="gap: 0.125rem" role="img" aria-label="${n} out of 5 stars">${solid(I.star, 15).repeat(n)}</span>`;
// The round white heart chip over a photo
const heartChip = `<button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Add to favourites" style="position: absolute; inset-block-start: var(--m-space-1); inset-inline-end: var(--m-space-1); --m-button-ghost-bg: var(--m-color-bg-surface); --m-button-ghost-hover-bg: var(--m-color-bg-surface); box-shadow: var(--m-shadow-sm)">${icon(I.heart, 18)}</button>`;

// A listing card: photo on top, a one-line title, stars, the price (green when on sale)
const listing = (
  n: number,
  title: string,
  rating: string,
  count: string,
  price: string,
  was = '',
  off = '',
  extra = '',
  badge = '',
) => `<article class="m-stack" data-gap="1" style="position: relative; min-inline-size: 0">
            <div style="position: relative">${photo(n, '1 / 1', 'var(--m-radius-sm)')}${heartChip}${badge ? `<span class="m-badge" style="position: absolute; inset-block-start: var(--m-space-1); inset-inline-start: var(--m-space-1); --m-badge-neutral-bg: var(--m-color-bg-surface); box-shadow: var(--m-shadow-sm)">${badge}</span>` : ''}</div>
            <a href="#" style="color: var(--m-color-fg-default); text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: var(--m-font-size-sm)">${title}</a>
            ${stars(rating, count)}
            <span class="m-cluster" data-gap="1" style="gap: 0.375rem; font-variant-numeric: tabular-nums"><strong style="font-size: var(--m-font-size-lg)${was ? `; ${sale}` : ''}">${price}</strong>${was ? `<s style="${small}">${was}</s><span style="${small}">(${off})</span>` : ''}</span>
            ${extra}
            <span style="padding-block-start: var(--m-space-1)"><button type="button" class="m-button" data-variant="secondary" data-size="sm">${icon(I.plus, 16)} Add to basket</button></span>
          </article>`;

/* ----------------------------------------------------------------------------------------------
 * The seller pages: a white side column, a warm canvas, white cards
 * -------------------------------------------------------------------------------------------- */

const nav = (items: [keyof typeof I, string, string?][], current: string) =>
  items
    .map(
      ([ic, l, extra]) =>
        `          <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${icon(I[ic], 20)} <span style="flex: 1">${l}</span>${extra ?? ''}</a></li>`,
    )
    .join('\n');
const count = (n: string) => `<span class="m-sidebar-count">${n}</span>`;
const more = icon(I.right, 16);
const market = (initial: string, name: string, sub: string, tint: string) =>
  `          <li><a class="m-sidebar-link" href="#"><span aria-hidden="true" style="display: grid; place-items: center; inline-size: 1.75rem; block-size: 1.75rem; border-radius: var(--m-radius-sm); background: ${tint}; color: var(--m-color-fg-default); font-weight: var(--m-font-weight-bold); font-size: var(--m-font-size-sm)">${initial}</span><span class="m-stack" data-gap="0" style="gap: 0"><span>${name}</span><span style="${small}">${sub}</span></span></a></li>`;

const shell = (current: string, main: string, white = false) => `<div class="m-split" style="--m-layout-split-side: 17.5rem; --m-layout-split-gap: 0; min-block-size: 100vh">
  <nav class="m-sidebar" aria-label="Shop">
    <a href="#" class="m-cluster" data-gap="2" style="padding: var(--m-space-1) var(--m-space-2) var(--m-space-3); color: var(--m-color-fg-default); text-decoration: none">
      <span class="m-avatar" style="background: var(--m-color-brand-subtle)">KK</span>
      <span style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-semibold)">Kettle &amp; Kiln</span>
      ${icon(I.down, 16)}
    </a>
    <div class="m-sidebar-section">
      <ul>
${nav(
  [
    ['home', 'Overview'],
    ['palette', 'Custom requests', count('3')],
    ['package', 'Inventory'],
    ['chat', 'Conversations', count('2')],
    ['star', 'Reviews'],
  ],
  current,
)}
      </ul>
    </div>
    <div class="m-sidebar-section">
      <ul>
${nav(
  [
    ['chart', 'Insights', more],
    ['tag', 'Coupons', '<span class="m-badge" data-tone="info" data-variant="solid">New</span>'],
    ['bank', 'Payouts', `<span class="m-sidebar-count" style="--m-sidebar-count-bg: var(--m-color-border-muted); --m-sidebar-count-fg: var(--m-color-fg-default)">1</span>`],
    ['gear', 'Workshop settings', more],
  ],
  current,
)}
      </ul>
    </div>
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Where you sell</h2>
      <ul>
${market('T', 'thimble shop', 'kettleandkiln', 'var(--m-color-brand-subtle)')}
${market('M', 'Market stall', 'Saturdays, Pier 4', 'var(--m-color-info-bg)')}
${market('W', 'Wholesale', '2 stockists', 'var(--m-color-success-bg)')}
      </ul>
    </div>
  </nav>
  <main style="padding: var(--m-space-5) clamp(1rem, 3vw, 2.25rem) var(--m-space-10)${white ? '; background: var(--m-color-bg-surface)' : ''}">
${main}
  </main>
</div>`;

// The weekly visits, a dark line with dots over faint gridlines
const pts = [31, 28, 34, 30, 39, 42, 40, 47, 44, 51, 49, 58, 55, 61];
const spark = (values: number[], label: string, h = 7) => {
  const max = Math.max(...values) * 1.1;
  const xy = values.map((v, i) => [(i * 300) / (values.length - 1), 100 - (v / max) * 92] as const);
  const line = xy.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return `<svg viewBox="-4 -4 308 108" width="100%" preserveAspectRatio="none" style="display: block; block-size: ${h}rem; overflow: visible" role="img" aria-label="${label}">
              <g style="stroke: var(--m-color-border-muted)" stroke-width="1" vector-effect="non-scaling-stroke"><path d="M0,0 H300 M0,33 H300 M0,66 H300 M0,100 H300" vector-effect="non-scaling-stroke"/></g>
              <path d="${line}" fill="none" style="stroke: var(--m-color-success-fg)" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
              ${xy.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" style="fill: var(--m-color-success-fg)"/>`).join('')}
            </svg>`;
};

const kpi = (labelText: string, value: string, delta: string, up: boolean, values: number[]) => `<section class="m-card" aria-label="${labelText}">
            <div class="m-card-body m-stack" data-gap="2">
              <span style="${dotted}; align-self: start">${labelText}</span>
              <span class="m-cluster" data-gap="2" data-align="baseline"><span style="${figure}">${value}</span><span class="m-cluster" data-gap="1" style="gap: 0.125rem; font-size: var(--m-font-size-sm); ${up ? sale : down}">${icon(up ? I.up : I.downArrow, 14)}<span style="${dotted}">${delta} vs last year</span></span></span>
              ${spark(values, `${labelText} over the last 14 days`, 5)}
            </div>
          </section>`;

const order = (
  n: number,
  who: string,
  item: string,
  total: string,
  status: string,
  tone: string,
  ship: string,
) => `              <tr>
                <td><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${thumb(n, '2.75rem')}<span class="m-stack" data-gap="0" style="gap: 0"><a href="#" style="${link}">${item}</a><span style="${small}">${who}</span></span></span></td>
                <td>${ship}</td>
                <td><span class="m-badge"${tone ? ` data-tone="${tone}"` : ''}>${status}</span></td>
                <td data-numeric>${total}</td>
              </tr>`;

const dashboard = shell(
  'Overview',
  `    <div class="m-stack" data-gap="5">
      <div class="m-cluster" data-justify="between" data-align="end">
        <div class="m-stack" data-gap="1">
          <h1 style="${serif('2xl')}">Good morning, Maren</h1>
          <p class="m-muted">Four orders to send this week, and two people waiting on a reply.</p>
        </div>
        <div class="m-cluster" data-gap="2">
          <button type="button" class="m-button" data-variant="ghost" ${chip}>Last 14 days ${icon(I.down, 16)}</button>
          <button type="button" class="m-button" data-variant="primary">${icon(I.plus, 18)} Add a listing</button>
        </div>
      </div>

      <div class="m-grid" style="--m-layout-grid-min: 12.5rem; --m-layout-grid-gap: var(--m-space-3)">
        ${kpi('Shop visits', '3,418', '12%', true, pts)}
        ${kpi('Orders', '96', '4%', true, [5, 7, 6, 4, 8, 9, 6, 7, 10, 8, 6, 9, 7, 8])}
        ${kpi('Conversion rate', '2.8%', '0.3%', false, [3.4, 3.1, 3.3, 2.9, 3, 2.7, 2.9, 2.6, 2.8, 2.5, 2.7, 2.9, 2.6, 2.8])}
        ${kpi('Revenue', '$4,206', '9%', true, [210, 260, 240, 190, 300, 330, 280, 310, 350, 290, 320, 380, 340, 360])}
      </div>

      <div class="m-grid" style="--m-layout-grid-min: 22rem; --m-layout-grid-gap: var(--m-space-3); align-items: start">
        <section class="m-card" aria-labelledby="bz-payout">
          <div class="m-card-body m-stack" data-gap="2">
            <div class="m-cluster" data-justify="between" data-align="start">
              <div class="m-stack" data-gap="0" style="gap: 0">
                <h2 id="bz-payout" style="${sectionTitle}; font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-semibold)">Available</h2>
                <span style="${figure}; font-size: var(--m-font-size-3xl)">$1,284.50</span>
                <span style="${small}">Paid to your account every Monday</span>
              </div>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" ${chip}>Pay out now</button>
            </div>
            <div class="m-cluster" data-justify="between" style="${hair}; padding-block-start: var(--m-space-2)">
              <span class="m-cluster" data-gap="1">${icon(I.clock, 16)} <span style="${dotted}">On hold</span></span>
              <strong style="font-variant-numeric: tabular-nums">$212.00</strong>
            </div>
          </div>
        </section>
        <section class="m-card" aria-labelledby="bz-todo">
          <div class="m-card-body m-stack" data-gap="2">
            <h2 id="bz-todo" style="${sectionTitle}">Worth a look</h2>
            <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
              <li class="m-cluster" data-gap="2" style="padding-block: var(--m-space-2); flex-wrap: nowrap">${icon(I.palette, 20)}<span style="flex: 1">A request for a set of six dinner plates in moss glaze</span><a href="#" style="${link}">Reply</a></li>
              <li class="m-cluster" data-gap="2" style="${hair}; padding-block: var(--m-space-2); flex-wrap: nowrap">${icon(I.package, 20)}<span style="flex: 1">Two listings are almost out of stock</span><a href="#" style="${link}">Restock</a></li>
              <li class="m-cluster" data-gap="2" style="${hair}; padding-block: var(--m-space-2); flex-wrap: nowrap">${icon(I.star, 20)}<span style="flex: 1">Three new five-star reviews this week</span><a href="#" style="${link}">Read</a></li>
            </ul>
          </div>
        </section>
      </div>

      <section class="m-card" aria-labelledby="bz-orders">
        <div class="m-card-body m-stack" data-gap="2">
          <div class="m-cluster" data-justify="between">
            <h2 id="bz-orders" style="${sectionTitle}">Ready to send</h2>
            <a href="#" class="m-cluster" data-gap="1" style="color: var(--m-color-fg-default); font-weight: var(--m-font-weight-bold); text-decoration: none">All orders ${icon(I.arrow, 16)}</a>
          </div>
          <div class="m-table-wrap">
            <table class="m-table">
              <thead><tr><th>Order</th><th>Send by</th><th>Status</th><th data-numeric>Total</th></tr></thead>
              <tbody>
${order(0, 'Ines Calloway · 2 items', 'Speckled latte mug', '$68.00', 'Gift wrapped', 'warning', 'Nov 14')}
${order(1, 'Theo Vandermeer', 'Moss glaze bud vase', '$34.00', 'Paid', 'success', 'Nov 15')}
${order(2, 'Priya Raman · 4 items', 'Set of 4 ramen bowls', '$212.00', 'Personalised', '', 'Nov 16')}
${order(3, 'Jonah Petrakis', 'Ash-white serving platter', '$96.00', 'Paid', 'success', 'Nov 18')}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>`,
);

/* ----------------------------------------------------------------------------------------------
 * List and detail: the inventory table, then one listing as buyers see it
 * -------------------------------------------------------------------------------------------- */

const item = (
  n: number,
  title: string,
  stock: string,
  price: string,
  views: string,
  on = true,
  low = false,
) => `              <tr>
                <td><input class="m-checkbox" type="checkbox" aria-label="Select ${title}"></td>
                <td><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${thumb(n)}<a href="#" style="${link}">${title}</a></span></td>
                <td><input class="m-switch" type="checkbox" role="switch" aria-label="${title} is live"${on ? ' checked' : ''}></td>
                <td data-numeric${low ? ` style="${down}"` : ''}>${stock}${low ? ' left' : ''}</td>
                <td data-numeric>${price}</td>
                <td data-numeric>${views}</td>
              </tr>`;

const listDetail = shell(
  'Inventory',
  `    <div class="m-stack" data-gap="8">
      <section class="m-stack" data-gap="3" aria-labelledby="bz-inv-title">
        <div class="m-cluster" data-justify="between">
          <h1 id="bz-inv-title" style="${adminTitle}">Inventory</h1>
          <button type="button" class="m-button" data-variant="primary">${icon(I.plus, 18)} Add a listing</button>
        </div>
        <div class="m-tabs"><div class="m-tab-list" role="tablist" aria-label="Listing state">
          <button type="button" class="m-tab" role="tab" aria-selected="true">Live <span style="color: var(--m-color-fg-muted)">48</span></button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Drafts <span style="color: var(--m-color-fg-muted)">5</span></button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Sold out <span style="color: var(--m-color-fg-muted)">7</span></button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Paused</button>
        </div></div>
        <div class="m-cluster" data-justify="between">
          <div class="m-cluster" data-gap="2">
            <button type="button" class="m-button" data-variant="ghost" ${chip}>Collection <strong>All</strong> ${icon(I.down, 16)}</button>
            <button type="button" class="m-button" data-variant="ghost" ${chip}>Sort <strong>Newest</strong> ${icon(I.down, 16)}</button>
            <button type="button" class="m-button" data-variant="ghost" ${chip}>${icon(I.sliders, 18)} More filters</button>
          </div>
          <input class="m-input" type="search" placeholder="Search your listings" aria-label="Search your listings" style="max-inline-size: 18rem; border-radius: var(--m-radius-full)">
        </div>
        <div class="m-table-wrap">
          <table class="m-table">
            <thead><tr><th style="inline-size: 2.5rem"><span class="m-sr-only">Select</span></th><th>Listing</th><th>Live</th><th data-numeric>Stock</th><th data-numeric>Price</th><th data-numeric>Views (30 days)</th></tr></thead>
            <tbody>
${item(0, 'Speckled latte mug, 12 oz', '24', '$34.00', '1,902')}
${item(1, 'Moss glaze bud vase', '3', '$34.00', '1,288', true, true)}
${item(2, 'Ramen bowl with chopstick rest', '16', '$53.00', '960')}
${item(5, 'Ash-white serving platter', '2', '$96.00', '744', true, true)}
${item(3, 'Tea for one set, oatmeal', '0', '$78.00', '410', false)}
            </tbody>
          </table>
        </div>
        <nav class="m-pagination" aria-label="Pages">
          <ul>
            <li><a class="m-pagination-item" aria-disabled="true" aria-label="Previous page">${icon(I.left, 18)}</a></li>
            <li><a class="m-pagination-item" href="#" aria-current="page">1</a></li>
            <li><a class="m-pagination-item" href="#">2</a></li>
            <li><a class="m-pagination-item" href="#">3</a></li>
            <li><span class="m-pagination-ellipsis" aria-hidden="true">…</span></li>
            <li><a class="m-pagination-item" href="#">10</a></li>
            <li><a class="m-pagination-item" href="#" aria-label="Next page">${icon(I.arrow, 18)}</a></li>
          </ul>
        </nav>
      </section>

      <section class="m-card" aria-labelledby="bz-listing-title">
        <div class="m-card-body m-stack" data-gap="4">
          <div class="m-cluster" data-justify="between">
            <nav class="m-breadcrumb" aria-label="Category"><ol><li><a href="#" style="text-decoration: underline; text-underline-offset: 0.15em">Home &amp; living</a></li><li><a href="#" style="text-decoration: underline; text-underline-offset: 0.15em">Kitchen &amp; dining</a></li><li><a href="#" style="text-decoration: underline; text-underline-offset: 0.15em">Drinkware</a></li><li><span aria-current="page">Mugs</span></li></ol></nav>
            <div class="m-cluster" data-gap="2">
              <button type="button" class="m-button" data-variant="secondary" data-size="sm">${icon(I.pencil, 16)} Edit</button>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="More actions">${icon(I.ellipsis, 18)}</button>
            </div>
          </div>
          <div class="m-grid" style="--m-layout-grid-min: 18rem; --m-layout-grid-gap: var(--m-space-5); align-items: start">
            <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap; align-items: start">
              <div class="m-stack" data-gap="1" style="inline-size: 3.5rem">${thumb(0)}${thumb(4)}${thumb(1)}${thumb(3)}</div>
              <div style="position: relative; flex: 1">${photo(0, '4 / 5', 'var(--m-radius-md)', 48)}${heartChip}</div>
            </div>
            <div class="m-stack" data-gap="3">
              <div class="m-stack" data-gap="1">
                <span style="font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-bold); color: var(--m-color-danger-fg); text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide)">Only 3 left, and in 9 baskets</span>
                <span class="m-cluster" data-gap="2" data-align="baseline"><span style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold); font-variant-numeric: tabular-nums">Now $27.20</span><s style="color: var(--m-color-fg-muted)">$34.00</s></span>
                <span style="${sale}; font-weight: var(--m-font-weight-semibold)">20% off · Sale ends Sunday</span>
              </div>
              <h2 id="bz-listing-title" style="${sectionTitle}; font-weight: var(--m-font-weight-regular)">Speckled latte mug, 12 oz, wheel-thrown stoneware with a satin oatmeal glaze</h2>
              <span class="m-cluster" data-gap="2"><a href="#" style="color: var(--m-color-fg-default); font-weight: var(--m-font-weight-bold); text-decoration: none">Kettle &amp; Kiln</a>${fiveStars()}</span>
              <ul class="m-stack" data-gap="1" style="padding: 0; list-style: none">
                <li class="m-cluster" data-gap="2">${icon(I.check, 18)} Ships in 1–2 days from Portland</li>
                <li class="m-cluster" data-gap="2">${icon(I.check, 18)} Returns accepted within 30 days</li>
              </ul>
              <div class="m-field">
                <label class="m-field-label" for="bz-glaze">Glaze</label>
                <select class="m-select" id="bz-glaze"><option>Oatmeal</option><option>Moss</option><option>Ash white</option></select>
              </div>
              <div class="m-field">
                <label class="m-field-label" for="bz-qty">Quantity</label>
                <select class="m-select" id="bz-qty"><option>1</option><option>2</option><option>3</option></select>
              </div>
              <div class="m-stack" data-gap="2">
                <button type="button" class="m-button" data-variant="secondary" style="inline-size: 100%">Buy it now</button>
                <button type="button" class="m-button" data-variant="primary" style="inline-size: 100%">Add to basket</button>
              </div>
              <div class="m-accordion" style="border-inline: 0">
              <details class="m-accordion-item" open>
                <summary>Item details</summary>
                <div class="m-accordion-content">Each mug is thrown by hand, so sizes vary a little. Dishwasher and microwave safe; the glaze is food safe and lead free.</div>
              </details>
              <details class="m-accordion-item">
                <summary>Delivery and returns</summary>
                <div class="m-accordion-content">Wrapped in recycled paper and posted from Portland, Oregon.</div>
              </details>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>`,
);

/* ----------------------------------------------------------------------------------------------
 * The buyer header: the serif wordmark, a pill search that ends in an orange button, icon actions
 * -------------------------------------------------------------------------------------------- */

const header = `<header class="m-navbar" style="gap: var(--m-space-3); border-block-end: 0">
  <a class="m-navbar-brand" href="#" style="color: var(--m-color-brand-default)">thimble</a>
  <form role="search" class="m-cluster" style="flex: 1; flex-wrap: nowrap; max-inline-size: 48rem; position: relative">
    <input class="m-input" type="search" placeholder="Search for anything handmade" aria-label="Search" style="flex: 1; min-inline-size: 0; border-radius: var(--m-radius-full); border-width: var(--m-border-width-thick); border-color: var(--m-color-fg-default); box-shadow: none; padding-inline-end: 3.5rem">
    <button type="submit" class="m-button" data-size="sm" data-icon-only aria-label="Search" style="position: absolute; inset-inline-end: 0.375rem; --m-button-secondary-bg: var(--m-color-brand-default); --m-button-secondary-hover-bg: var(--m-color-brand-default); --m-button-secondary-border: var(--m-color-brand-default); --m-button-secondary-fg: var(--m-color-bg-surface)">${icon(I.search, 18)}</button>
  </form>
  <div class="m-navbar-actions">
    <a class="m-navbar-link" href="#">Sign in</a>
    <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Favourites">${icon(I.heart, 22)}</button>
    <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Gifts">${icon(I.gift, 22)}</button>
    <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Basket">${icon(I.cart, 22)}</button>
  </div>
</header>
<nav class="m-cluster" aria-label="Departments" style="gap: var(--m-space-1); padding: 0 clamp(1rem, 3vw, 2.25rem) var(--m-space-1); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default); background: var(--m-color-bg-surface)">
  <a class="m-navbar-link" href="#">${icon(I.gift, 18)} Gift finder</a>
  <a class="m-navbar-link" href="#">Ceramics</a>
  <a class="m-navbar-link" href="#">Textiles</a>
  <a class="m-navbar-link" href="#">Paper goods</a>
  <a class="m-navbar-link" href="#">Jewellery</a>
  <a class="m-navbar-link" href="#">Old &amp; found</a>
</nav>`;
const buyer = (main: string) =>
  `<div style="min-block-size: 100vh; background: var(--m-color-bg-surface)">
${header}
${main}
</div>`;

/* ----------------------------------------------------------------------------------------------
 * Onboarding: opening a shop, one question per page under a dotted step line
 * -------------------------------------------------------------------------------------------- */

const step = (n: number, labelText: string, state: 'done' | 'now' | 'next') =>
  `<li class="m-stack" data-gap="1" data-align="center" style="flex: 1; text-align: center; position: relative"><span aria-hidden="true" style="display: block; inline-size: 1.125rem; block-size: 1.125rem; border-radius: var(--m-radius-full); background: ${state === 'next' ? 'var(--m-color-border-muted)' : 'var(--m-color-accent-default)'}; ${state === 'now' ? 'box-shadow: 0 0 0 0.375rem var(--m-color-accent-subtle)' : ''}"></span><span style="font-size: var(--m-font-size-sm); ${state === 'next' ? 'color: var(--m-color-fg-muted)' : 'font-weight: var(--m-font-weight-bold)'}"><span class="m-sr-only">Step ${n}: </span>${labelText}${state === 'done' ? '<span class="m-sr-only"> (done)</span>' : ''}</span></li>`;

const craft = (n: number, name: string, checked = false) =>
  `<label class="m-stack" data-gap="1" style="cursor: pointer; padding: var(--m-space-1); border-radius: var(--m-radius-lg); box-shadow: ${checked ? '0 0 0 2px var(--m-color-accent-default)' : 'none'}">
          <input type="checkbox" class="m-sr-only"${checked ? ' checked' : ''}>
          ${photo(n, '4 / 3')}
          <span class="m-cluster" data-gap="1" style="font-weight: var(--m-font-weight-bold)">${checked ? icon(I.check, 16) : ''}${name}</span>
        </label>`;

const onboarding = buyer(`<main class="m-container" data-size="md" style="padding-block: var(--m-space-6) var(--m-space-12)">
  <form class="m-stack" data-gap="6" aria-labelledby="bz-onb-title">
    <ol class="m-cluster" style="padding: 0; list-style: none; align-items: start; flex-wrap: nowrap; background: linear-gradient(var(--m-color-border-muted), var(--m-color-border-muted)) center 0.4375rem / 75% 0.25rem no-repeat" aria-label="Opening your shop">
      ${step(1, 'Your craft', 'now')}
      ${step(2, 'Shop name', 'next')}
      ${step(3, 'First listing', 'next')}
      ${step(4, 'Getting paid', 'next')}
    </ol>
    <div class="m-stack" data-gap="2" style="text-align: center">
      <h1 id="bz-onb-title" style="${serif('3xl')}">What do you make?</h1>
      <p class="m-muted">Pick everything that fits. It helps buyers find you, and you can change it later.</p>
    </div>
    <fieldset class="m-grid" style="--m-layout-grid-min: 10rem; --m-layout-grid-gap: var(--m-space-3); border: 0; padding: 0; margin: 0">
      <legend class="m-sr-only">Crafts</legend>
      ${craft(0, 'Ceramics', true)}
      ${craft(2, 'Textiles')}
      ${craft(1, 'Woodwork')}
      ${craft(5, 'Prints &amp; paper')}
      ${craft(3, 'Jewellery')}
      ${craft(4, 'Something else')}
    </fieldset>
    <div class="m-field">
      <label class="m-field-label" for="bz-onb-where">Where do you work from?</label>
      <input class="m-input" id="bz-onb-where" value="Portland, Oregon" aria-describedby="bz-onb-where-hint">
      <p class="m-field-hint" id="bz-onb-where-hint">Buyers see the city on your listings, never your address.</p>
    </div>
    <label class="m-field" data-layout="inline"><input class="m-checkbox" type="checkbox" checked> I make or design everything I'll sell</label>
    <div class="m-cluster" data-justify="between" style="${hair}; padding-block-start: var(--m-space-3)">
      <button type="button" class="m-button" data-variant="ghost">${icon(I.left, 18)} Back</button>
      <button type="submit" class="m-button" data-variant="primary">Save and continue</button>
    </div>
  </form>
</main>`);

/* ----------------------------------------------------------------------------------------------
 * Settings: the shop's settings as white cards of label-and-value rows, with tabs on top
 * -------------------------------------------------------------------------------------------- */

// A setting: the label in bold over its value, an underlined Edit on the right, a hairline under it
const row = (name: string, value: string, action = 'Edit') =>
  `          <div class="m-cluster" data-justify="between" data-align="start" style="padding-block: var(--m-space-3); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default); flex-wrap: nowrap">
            <div class="m-stack" data-gap="0" style="gap: 0.125rem"><dt style="font-weight: var(--m-font-weight-bold)">${name}</dt><dd>${value}</dd></div>
            ${action ? `<a href="#" style="${link}; font-weight: var(--m-font-weight-bold)">${action}</a>` : ''}
          </div>`;
const toggle = (name: string, hint: string, on: boolean) =>
  `          <div class="m-cluster" data-justify="between" style="padding-block: var(--m-space-3); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default); flex-wrap: nowrap; gap: var(--m-space-3)">
            <span class="m-stack" data-gap="0" style="gap: 0.125rem"><span style="font-weight: var(--m-font-weight-bold)">${name}</span><span style="${small}">${hint}</span></span>
            <input class="m-switch" type="checkbox" role="switch" aria-label="${name}"${on ? ' checked' : ''}>
          </div>`;
// The in-page settings menu: plain rows, the current one bold with a 2px orange bar on its left
const subnav = (items: string[], current: string) =>
  `<nav class="m-sidebar" aria-label="Settings sections" style="align-self: start; --m-sidebar-bg: transparent; --m-sidebar-border: transparent; --m-sidebar-padding: 0; --m-sidebar-link-radius: 0; --m-sidebar-link-active-bg: transparent; --m-sidebar-link-hover-bg: transparent; --m-sidebar-link-fg: var(--m-color-fg-muted); --m-sidebar-link-indicator: var(--m-color-brand-default); --m-sidebar-link-indicator-width: 2px; border-inline-start: var(--m-border-width-thin) solid var(--m-color-border-default); inline-size: auto">
        <div class="m-sidebar-section"><ul>
${items.map((l) => `          <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${l}</a></li>`).join('\n')}
        </ul></div>
      </nav>`;

const settings = shell(
  'Workshop settings',
  `    <div class="m-stack" data-gap="5">
      <div class="m-cluster" data-justify="between">
        <h1 style="${adminTitle}">Workshop settings</h1>
        <button type="button" class="m-button" data-variant="secondary" data-size="sm">${icon(I.store, 16)} Preview your shop</button>
      </div>
      <div class="m-split" style="--m-layout-split-side: 13rem; --m-layout-split-gap: var(--m-space-8)">
      ${subnav(['Your shop', 'Delivery', 'Policies', 'Helpers', 'Billing'], 'Your shop')}
      <div class="m-stack" data-gap="8" style="max-inline-size: 42rem">
        <section class="m-stack" data-gap="2" aria-labelledby="bz-set-shop">
          <h2 id="bz-set-shop" style="${serif('2xl')}">Your shop</h2>
          <p class="m-muted" style="font-size: var(--m-font-size-lg)">How your shop appears to buyers across the marketplace.</p>
          <dl class="m-stack" data-gap="0" style="padding-block-start: var(--m-space-2)">
${row('Shop name', 'Kettle &amp; Kiln')}
${row('Web address', '<span>thimble.example/<strong>kettleandkiln</strong></span>', 'Copy')}
${row('Tagline', 'Small-batch stoneware for slow mornings')}
${row('Shop owner', '<span class="m-cluster" data-gap="1" style="padding-block-start: 0.25rem"><span class="m-avatar" data-size="sm">MO</span> Maren Okafor</span>')}
${row('Location', 'Portland, Oregon')}
          </dl>
        </section>

        <section class="m-stack" data-gap="2" aria-labelledby="bz-set-away">
          <h2 id="bz-set-away" style="${serif('xl')}">Time away</h2>
          <dl class="m-stack" data-gap="0">
${toggle('Away mode', 'Listings stay up, but buyers can’t check out until you’re back.', false)}
${toggle('Take custom requests', 'Buyers can ask for something made to order.', true)}
${toggle('Auto-reply to messages', 'Sends your away note to anyone who writes while you’re away.', true)}
          </dl>
          <div class="m-field" style="padding-block-start: var(--m-space-2)">
            <label class="m-field-label" for="bz-set-note">Away note</label>
            <textarea class="m-input" id="bz-set-note" rows="3">Back from the kiln on the 20th. Orders placed now ship the following week.</textarea>
          </div>
        </section>

        <section class="m-stack" data-gap="2" aria-labelledby="bz-set-mail">
          <h2 id="bz-set-mail" style="${serif('xl')}">Emails from us</h2>
          <label class="m-field" data-layout="inline"><input class="m-checkbox" type="checkbox" checked> A new order comes in</label>
          <label class="m-field" data-layout="inline"><input class="m-checkbox" type="checkbox" checked> Someone leaves a review</label>
          <label class="m-field" data-layout="inline"><input class="m-checkbox" type="checkbox"> Weekly shop summary</label>
          <div class="m-cluster" data-gap="2" style="padding-block-start: var(--m-space-2)">
            <button type="button" class="m-button" data-variant="primary">Save</button>
            <button type="button" class="m-button" data-variant="ghost">Cancel</button>
          </div>
        </section>

        <section class="m-stack" data-gap="2" style="${hair}; padding-block-start: var(--m-space-4)" aria-labelledby="bz-set-close">
          <h2 id="bz-set-close" style="${sectionTitle}">Close your shop</h2>
          <p class="m-muted">Your listings come down and your shop page shows as closed. Open orders still need to be sent.</p>
          <div><button type="button" class="m-button" data-variant="danger">Close shop</button></div>
        </section>
      </div>
      </div>
    </div>`,
  true,
);

/* ----------------------------------------------------------------------------------------------
 * Empty state: a search with no results, suggestions, then things people like right now
 * -------------------------------------------------------------------------------------------- */

const emptyState = buyer(`<main class="m-container" style="padding-block: var(--m-space-8) var(--m-space-12)">
  <div class="m-stack" data-gap="8">
    <section class="m-stack" data-gap="3" data-align="center" style="text-align: center; padding: var(--m-space-8) var(--m-space-4); border-radius: var(--m-radius-lg); background: var(--m-color-brand-subtle)" aria-labelledby="bz-empty-title">
      <span style="display: grid; place-items: center; inline-size: 4.5rem; block-size: 4.5rem; border-radius: var(--m-radius-full); background: var(--m-color-bg-surface)">${icon(I.search, 32)}</span>
      <h1 id="bz-empty-title" style="${serif('2xl')}">Nothing yet for “linen lampshade, sage”</h1>
      <p style="max-inline-size: 32rem">Try fewer words, or one of these. Makers add new things every day, so it may turn up soon.</p>
      <div class="m-cluster" data-gap="2" data-justify="center">
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="--m-button-ghost-bg: var(--m-color-bg-surface)">linen lampshade</button>
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="--m-button-ghost-bg: var(--m-color-bg-surface)">sage table linen</button>
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="--m-button-ghost-bg: var(--m-color-bg-surface)">pleated lampshade</button>
      </div>
      <button type="button" class="m-button" data-variant="secondary">${icon(I.heart, 18)} Save this search</button>
    </section>

    <section class="m-stack" data-gap="3" aria-labelledby="bz-popular">
      <div class="m-stack" data-gap="0" style="gap: 0">
        <a href="#" id="bz-popular" class="m-cluster" data-gap="1" style="${sectionTitle}; color: var(--m-color-fg-default); text-decoration: none">Popular in lighting ${icon(I.arrow, 18)}</a>
        <span class="m-muted">Picked from what people are favouriting this week</span>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 11rem; --m-layout-grid-gap: var(--m-space-3)">
        ${listing(0, 'Hand-pleated paper lampshade, drum', '4.9', '812', '$58.00', '', '', '<span class="m-muted" style="font-size: var(--m-font-size-sm)">Free delivery</span>', 'Best loved')}
        ${listing(2, 'Linen pendant shade in oat', '4.8', '233', '$41.60', '$52.00', '20% off', `<span style="font-size: var(--m-font-size-sm); ${sale}">Sale ends in 2 days</span>`)}
        ${listing(1, 'Stoneware table lamp, moss', '5.0', '96', '$140.00', '', '', '', 'Trending')}
        ${listing(5, 'Block-printed fabric shade', '4.7', '1.4k', '$36.00')}
        ${listing(3, 'Beeswax pillar candles, set of 3', '4.9', '3.1k', '$22.50', '$30.00', '25% off', '<span class="m-muted" style="font-size: var(--m-font-size-sm)">Free delivery</span>')}
      </div>
    </section>
  </div>
</main>`);

/* ----------------------------------------------------------------------------------------------
 * Pricing: the seller plans, side by side on cards, a cream band, then a comparison table
 * -------------------------------------------------------------------------------------------- */

const plan = (
  name: string,
  price: string,
  per: string,
  intro: string,
  features: string[],
  primary = false,
  ribbon = '',
) => `      <section class="m-card" style="${primary ? 'border-color: var(--m-color-fg-default); border-width: var(--m-border-width-thick)' : ''}" aria-labelledby="bz-plan-${name.toLowerCase()}">
        <div class="m-card-body m-stack" data-gap="3">
          <div class="m-cluster" data-justify="between">
            <h2 id="bz-plan-${name.toLowerCase()}" style="${serif('xl')}">${name}</h2>
            ${ribbon ? `<span class="m-badge" data-tone="warning" data-variant="solid">${ribbon}</span>` : ''}
          </div>
          <div class="m-stack" data-gap="0" style="gap: 0">
            <span class="m-cluster" data-gap="1" data-align="baseline"><span style="${figure}; font-size: var(--m-font-size-3xl)">${price}</span><span class="m-muted">${per}</span></span>
            <span class="m-muted">${intro}</span>
          </div>
          <button type="button" class="m-button"${primary ? ' data-variant="primary"' : ' data-variant="secondary"'} style="inline-size: 100%">${price === '$0' ? 'Open a shop' : `Choose ${name}`}</button>
          <ul class="m-stack" data-gap="2" style="padding: 0; list-style: none">
${features.map((f) => `            <li class="m-cluster" data-gap="2" style="flex-wrap: nowrap; align-items: start">${icon(I.check, 18)}<span>${f}</span></li>`).join('\n')}
          </ul>
        </div>
      </section>`;

const cmp = (feature: string, a: string, b: string, c: string) =>
  `          <tr><th scope="row" style="font-weight: var(--m-font-weight-regular)">${feature}</th><td>${a}</td><td>${b}</td><td>${c}</td></tr>`;
const yes = `<span style="display: inline-flex" role="img" aria-label="Included">${icon(I.check, 20)}</span>`;
const no = '<span class="m-muted" aria-label="Not included">—</span>';

const pricing = buyer(`<main class="m-container" style="padding-block: var(--m-space-8) var(--m-space-12)">
  <div class="m-stack" data-gap="8">
    <div class="m-stack" data-gap="2" data-align="center" style="text-align: center">
      <h1 style="${serif('4xl')}">Sell what you make</h1>
      <p class="m-muted" style="max-inline-size: 34rem; font-size: var(--m-font-size-lg)">No setup cost. Pay a small fee when something sells, and move up when your shop needs more.</p>
      <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Billing">
        <button type="button" class="m-tab" role="tab" aria-selected="true">Monthly</button>
        <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Yearly, 2 months free</button>
      </div></div>
    </div>
    <div class="m-grid" style="--m-layout-grid-min: 17rem; --m-layout-grid-gap: var(--m-space-3); align-items: start">
${plan('Market', '$0', 'a month', '5% on each sale, plus card processing', ['Unlimited listings, 25¢ each for four months', 'A shop page with your story', 'Messages and custom requests'])}
${plan('Studio', '$14', 'a month', '4% on each sale, plus card processing', ['Everything in Market', '20 free listings each month', 'Coupons and restock alerts', 'Your own shop colours and banner'], true, 'Most shops')}
${plan('Atelier', '$42', 'a month', '3.5% on each sale, plus card processing', ['Everything in Studio', 'Wholesale price lists', 'Up to 4 helpers with their own sign-in', 'Priority help from a person'])}
    </div>
    <section class="m-cluster" data-justify="between" style="padding: var(--m-space-5); border-radius: var(--m-radius-lg); background: var(--m-color-brand-subtle); gap: var(--m-space-3)" aria-labelledby="bz-fees">
      <div class="m-stack" data-gap="1" style="max-inline-size: 36rem">
        <h2 id="bz-fees" style="${serif('xl')}">What a $40 mug costs you</h2>
        <p>On Market, $2.00 in fees and about $1.46 in card processing. You keep $36.54, paid out every Monday.</p>
      </div>
      <a href="#" class="m-cluster" data-gap="1" style="color: var(--m-color-fg-default); font-weight: var(--m-font-weight-bold)">Work out your fees ${icon(I.arrow, 18)}</a>
    </section>
    <div class="m-table-wrap">
      <table class="m-table">
        <caption class="m-sr-only">What each plan includes</caption>
        <thead><tr><th>Compare plans</th><th>Market</th><th>Studio</th><th>Atelier</th></tr></thead>
        <tbody>
${cmp('Fee on each sale', '5%', '4%', '3.5%')}
${cmp('Free listings a month', no, '20', '60')}
${cmp('Coupons and sales', yes, yes, yes)}
${cmp('Restock alerts for buyers', no, yes, yes)}
${cmp('Wholesale price lists', no, no, yes)}
${cmp('Helpers', no, '1', '4')}
        </tbody>
      </table>
    </div>
  </div>
</main>`);

/* ----------------------------------------------------------------------------------------------
 * Errors: a page that's gone, a failed save, and a form that needs fixing
 * -------------------------------------------------------------------------------------------- */

const errors = buyer(`<main class="m-container" data-size="md" style="padding-block: var(--m-space-10) var(--m-space-12)">
  <div class="m-stack" data-gap="10">
    <section class="m-stack" data-gap="3" data-align="center" style="text-align: center" aria-labelledby="bz-404">
      <span style="font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-bold); color: var(--m-color-fg-muted); letter-spacing: var(--m-font-tracking-wide)">ERROR 404</span>
      <h1 id="bz-404" style="${serif('4xl')}">This page has wandered off</h1>
      <p class="m-muted" style="max-inline-size: 30rem">The listing may have sold, or the link has a typo. Everything else is right where you left it.</p>
      <div class="m-cluster" data-gap="2" data-justify="center">
        <a class="m-button" data-variant="primary" href="#">Back to the homepage</a>
        <a class="m-button" data-variant="secondary" href="#">${icon(I.search, 18)} Search instead</a>
      </div>
    </section>

    <div class="m-alert" data-tone="danger" role="alert">
      <span class="m-alert-icon" aria-hidden="true">${icon(I.alert, 20)}</span>
      <div class="m-alert-content">
        <p class="m-alert-title">We couldn’t save your listing</p>
        <p class="m-alert-body">The photo upload timed out. Your words are safe; try the photos again.</p>
        <div class="m-alert-actions"><button type="button" class="m-button" data-variant="secondary" data-size="sm">Try again</button></div>
      </div>
    </div>

    <form class="m-card" aria-labelledby="bz-addr">
      <div class="m-card-body m-stack" data-gap="3">
        <h2 id="bz-addr" style="${serif('xl')}">Where should we send it?</h2>
        <div class="m-field">
          <label class="m-field-label" for="bz-addr-name">Full name</label>
          <input class="m-input" id="bz-addr-name" value="Ines Calloway">
        </div>
        <div class="m-field">
          <label class="m-field-label" for="bz-addr-street" data-required>Street address</label>
          <input class="m-input" id="bz-addr-street" value="" aria-invalid="true" aria-describedby="bz-addr-street-error">
          <p class="m-field-error" id="bz-addr-street-error" style="${fieldError}">${icon(I.alert, 16)} Add a street address so the maker can post it.</p>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 12rem; --m-layout-grid-gap: var(--m-space-3)">
          <div class="m-field">
            <label class="m-field-label" for="bz-addr-city">City</label>
            <input class="m-input" id="bz-addr-city" value="Asheville">
          </div>
          <div class="m-field">
            <label class="m-field-label" for="bz-addr-zip" data-required>ZIP code</label>
            <input class="m-input" id="bz-addr-zip" value="2880" aria-invalid="true" aria-describedby="bz-addr-zip-error" style="font-variant-numeric: tabular-nums">
            <p class="m-field-error" id="bz-addr-zip-error" style="${fieldError}">${icon(I.alert, 16)} A ZIP code has 5 digits.</p>
          </div>
        </div>
        <div class="m-cluster" data-justify="end" style="${hair}; padding-block-start: var(--m-space-3)">
          <button type="submit" class="m-button" data-variant="primary">Continue to payment</button>
        </div>
      </div>
    </form>
  </div>
</main>`);

export const bazaarRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Seller overview',
    description:
      'The seller home: a white side column with icon rows and orange counts, a serif greeting, four stat cards with serif figures, dotted-underlined terms, green or brick changes and a dark line with dots, then orders to send in a hairline table and a payout card.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'Inventory and a listing',
    description:
      'Tabs with counts, grey chip filters and a pill search over a frameless table (thumbnails, underlined titles, black switches, brick low stock), round page numbers; then one listing as buyers see it: photo strip, sale price in green, stars, selects and the two pill buttons.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Open a shop',
    description:
      'The buyer header over a dotted step line, a light serif question, photo cards to pick from (ink ring when chosen), one field with a hint and a Back / Save and continue row.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Workshop settings',
    description:
      'A white page beside the side column: an outlined pill at the top right, an in-page menu whose current row is bold with a 2px orange bar, a light serif section heading, label-over-value rows with underlined Edit links on hairlines, switches with hints, checkboxes with Save and Cancel, and closing the shop last with the brick button.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'No search results',
    description:
      'A cream panel with a round icon, a serif line, white suggestion chips and an outlined Save button, then listing cards: photo, heart chip, badge, one-line title, black star, the price in green with the old one struck, and a small outlined add button.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Seller plans',
    description:
      'A large serif heading, a segmented Monthly / Yearly switch, three plan cards (the chosen one on a 2px ink border with a yellow badge), a cream fee example and a comparison table with ticks.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Not found and form errors',
    description:
      'A 404 with a serif line and two pill buttons, a brick alert with a retry, and an address form whose invalid fields carry a brick border and a message with an icon.',
    html: errors,
  },
];
