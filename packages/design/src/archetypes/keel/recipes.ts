import type { ArchetypeRecipe } from '../types';

/*
 * Keel's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens (no
 * colour literals), with sample data from an invented small-batch bakery and pantry business,
 * "Rookwood Provisions". They follow the language's real screen patterns: a near-black frame holding
 * the navigation (search at the top, the shop at the bottom), a white page with rounded corners, a
 * title bar with a round back button and a breadcrumb, ink pill actions beside flat grey ones,
 * containers on a hairline ring, a metrics strip, index tables with view tabs, bulk actions and
 * small status badges, and settings as cards of label-and-value rows. The pricing page is the dark
 * marketing site.
 */

// Lucide icons, outlined, 2.25 stroke: 1.5px lines at 16px, like the reference's own 16px glyphs
const icon = (paths: string, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0">${paths}</svg>`;
const I = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  inbox:
    '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  layers:
    '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  truck:
    '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  store:
    '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2 2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>',
  calendar:
    '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  panel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
  wheat:
    '<path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  ellipsis: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  filter: '<path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/>',
  sort: '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  printer:
    '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
  package:
    '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/><path d="m7.5 4.27 9 5.15"/>',
  up: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  downRight: '<path d="m7 7 10 10"/><path d="M17 7v10H7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  triangle:
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  pencil:
    '<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/><path d="m15 5 4 4"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  globe:
    '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  receipt:
    '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  scale:
    '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  coffee:
    '<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  flame:
    '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  shirt:
    '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
  image:
    '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  note: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  refresh:
    '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  external:
    '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  map: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
};

// Type: page titles are 22px at medium weight, tightened; section titles 15px; body 13px
const title =
  'font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)';
const bigTitle =
  'font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)';
const section = 'font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium); letter-spacing: -0.01em';
const cardTitle = 'font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-medium)';
const muted = 'color: var(--m-color-fg-muted)';
const small = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
const num = 'font-variant-numeric: tabular-nums';
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-muted)';
// Metric names carry a dotted underline: hover explains how they're counted
const defined = 'text-decoration: underline dotted var(--m-color-border-strong); text-underline-offset: 0.3em';
const link = 'color: var(--m-color-accent-text); text-decoration: none';
// The page-header buttons: white pills on the toolbar ring
const pageButton =
  'style="--m-button-secondary-bg: var(--m-color-bg-surface); --m-button-secondary-hover-bg: var(--m-color-bg-sunken); --m-button-secondary-shadow: var(--m-shadow-sm); --m-button-secondary-hover-shadow: var(--m-shadow-sm)"';
// The badge "pip": a hollow ring for not started, a filled dot for done, a half for partly
const pip = (kind: 'empty' | 'full' | 'half') =>
  `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" style="flex-shrink: 0"><circle cx="5" cy="5" r="3.5" fill="none" stroke="currentColor" stroke-width="1.5"/>${kind === 'full' ? '<circle cx="5" cy="5" r="3.5" fill="currentColor"/>' : kind === 'half' ? '<path d="M5 1.5a3.5 3.5 0 0 1 0 7z" fill="currentColor"/>' : ''}</svg>`;
type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
const badge = (tone: Tone, text: string, p?: 'empty' | 'full' | 'half') =>
  `<span class="m-badge"${tone === 'neutral' ? '' : ` data-tone="${tone}"`}${tone === 'danger' || tone === 'neutral' ? '' : ' data-variant="solid"'}>${p ? pip(p) : ''}${text}</span>`;
// Product photos are token-coloured tiles with an image glyph, never a real image
const thumb = (n: number, size = '36px') => {
  const tints = [
    'var(--m-color-warning-bg)',
    'var(--m-color-success-bg)',
    'var(--m-color-info-bg)',
    'var(--m-color-bg-sunken)',
    'var(--m-color-danger-bg)',
  ];
  return `<span aria-hidden="true" style="display: grid; place-items: center; flex-shrink: 0; inline-size: ${size}; block-size: ${size}; border-radius: var(--m-radius-md); background: ${tints[n % tints.length]}; color: var(--m-color-fg-subtle); box-shadow: var(--m-shadow-sm)">${icon(I.image, 14)}</span>`;
};

/* ----------------------------------------------------------------------------------------------
 * The frame: near-black navigation with search, the shop and a bell at the foot; the page is a
 * white sheet with rounded corners set into it
 * -------------------------------------------------------------------------------------------- */

const navItems: [keyof typeof I, string, string?][] = [
  ['home', 'Overview'],
  ['inbox', 'Inbox', '<span class="m-sidebar-count">6</span>'],
  ['clock', 'Pre-orders', '<span class="m-sidebar-count">14</span>'],
  ['layers', 'Batches'],
  ['truck', 'Suppliers'],
  ['undo', 'Returns'],
  ['star', 'Reviews'],
  ['store', 'Stockists'],
  ['calendar', 'Calendar'],
];
const navLink = ([ic, l, extra]: [keyof typeof I, string, string?], current: string) =>
  `<li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page" style="box-shadow: inset 0 0 0 1px var(--m-color-border-default)"' : ''}><span style="display: inline-flex; color: ${l === current ? 'inherit' : 'var(--m-color-fg-subtle)'}">${icon(I[ic], 16)}</span><span style="flex: 1">${l}</span>${extra ?? ''}</a></li>`;

// The frame is set to the dark mode so its search field, keys and counts read on black
const frameNav = (current: string) => `<nav class="m-sidebar" data-theme="keel" data-mode="dark" aria-label="Main" style="background: var(--m-sidebar-bg); justify-content: space-between; min-block-size: 100%">
    <div class="m-stack" data-gap="3">
      <div class="m-cluster" data-justify="between" style="padding: var(--m-space-1) var(--m-space-1) 0">
        <span aria-label="Rookwood" style="display: grid; place-items: center; inline-size: 28px; block-size: 28px; border-radius: var(--m-radius-md); background: var(--m-color-fg-default); color: var(--m-color-bg-canvas)">${icon(I.wheat, 16)}</span>
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Collapse navigation" style="color: var(--m-color-fg-muted)">${icon(I.panel, 16)}</button>
      </div>
      <button type="button" class="m-button" data-size="sm" style="justify-content: flex-start; inline-size: 100%; --m-button-secondary-bg: var(--m-color-bg-raised); --m-button-secondary-fg: var(--m-color-fg-muted); --m-button-radius: var(--m-radius-md)">${icon(I.search, 14)}<span style="flex: 1; text-align: start; font-weight: var(--m-font-weight-regular)">Search</span><kbd class="m-kbd">⌘K</kbd></button>
      <div class="m-sidebar-section">
        <ul>
          ${navItems.map((n) => navLink(n, current)).join('\n          ')}
        </ul>
      </div>
      <div class="m-sidebar-section">
        <h2 class="m-sidebar-heading">Pinned</h2>
        <ul>
          ${navLink(['bookmark', 'Late batches', '<span class="m-sidebar-count">2</span>'], current)}
          ${navLink(['bookmark', 'Wholesale this week'], current)}
        </ul>
      </div>
    </div>
    <div class="m-stack" data-gap="1">
      <ul>
        ${navLink(['gear', 'Settings'], current)}
      </ul>
      <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding: var(--m-space-1) var(--m-space-2)">
        <span class="m-cluster" data-gap="2" style="flex-wrap: nowrap; white-space: nowrap; overflow: hidden; color: var(--m-sidebar-link-fg)"><span class="m-avatar" data-size="sm" style="--m-avatar-size-sm: 20px; font-size: var(--m-font-size-xs)">RP</span>Rookwood</span>
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Notifications" style="color: var(--m-color-fg-muted)">${icon(I.bell, 16)}</button>
      </div>
    </div>
  </nav>`;

// The title bar inside the page: a round back button, a breadcrumb with the section's icon
const titleBar = (crumbIcon: keyof typeof I, crumbs: string[], actions = '') => `<div class="m-cluster" data-justify="between" style="padding: var(--m-space-2) var(--m-space-3)">
        <div class="m-cluster" data-gap="2">
          <button type="button" class="m-button" data-size="sm" data-icon-only aria-label="Back" ${pageButton}>${icon(I.left, 14)}</button>
          <nav class="m-breadcrumb" aria-label="Breadcrumb"><ol><li class="m-cluster" data-gap="1"><span style="display: inline-flex; color: var(--m-color-fg-subtle)">${icon(I[crumbIcon], 14)}</span>${crumbs
            .slice(0, -1)
            .map((c) => `<a href="#">${c}</a>`)
            .join('</li><li>')}${crumbs.length > 1 ? '</li><li>' : ''}<span aria-current="page">${crumbs[crumbs.length - 1]}</span></li></ol></nav>
        </div>
        <div class="m-cluster" data-gap="2">${actions}</div>
      </div>`;

const shell = (current: string, bar: string, main: string, width = 'lg') => `<div class="m-split" style="--m-layout-split-side: 224px; --m-layout-split-gap: 0; min-block-size: 100vh; background: var(--m-sidebar-bg); font-feature-settings: 'calt' on, 'ss03' on, 'cv09' on, 'cv02' on, 'cv03' on, 'cv04' on">
  ${frameNav(current)}
  <div style="padding: var(--m-space-2) var(--m-space-2) var(--m-space-2) 0">
    <div class="m-stack" data-gap="0" style="min-block-size: 100%; background: var(--m-color-bg-canvas); border-radius: calc(var(--m-radius-md) + 2px); box-shadow: var(--m-shadow-sm); overflow: hidden">
      ${bar}
      <main class="m-container"${width === 'lg' ? '' : ` data-size="${width}"`} style="padding-block: var(--m-space-4) var(--m-space-12)">
${main}
      </main>
    </div>
  </div>
</div>`;

/* ----------------------------------------------------------------------------------------------
 * Dashboard: Overview
 * -------------------------------------------------------------------------------------------- */

// A metric cell: the dotted name, the figure, the change and a run of small bars
const spark = (vals: number[]) =>
  `<svg viewBox="0 0 ${vals.length * 6} 24" width="${vals.length * 6}" height="24" aria-hidden="true" style="display: block">${vals
    .map(
      (v, i) =>
        `<rect x="${i * 6}" y="${24 - v}" width="4" height="${v}" rx="1" style="fill: var(--m-color-info-${i > vals.length - 6 ? 'border' : 'solid'})"/>`,
    )
    .join('')}</svg>`;
const metric = (name: string, value: string, change: string, upGood: boolean, bars: number[], first = false) => `<div class="m-stack" data-gap="1" style="flex: 1 1 160px; padding: var(--m-space-3) var(--m-space-4);${first ? '' : ' border-inline-start: var(--m-border-width-thin) solid var(--m-color-border-muted);'}">
            <span style="${defined}; ${muted}; inline-size: fit-content">${name}</span>
            <div class="m-cluster" data-justify="between" data-align="end">
              <span class="m-cluster" data-gap="2" data-align="baseline"><span style="${title}; ${num}">${value}</span><span class="m-cluster" data-gap="0" style="font-size: var(--m-font-size-sm); color: var(--m-color-${upGood ? 'success' : 'danger'}-fg)">${icon(upGood ? I.up : I.downRight, 12)}${change}</span></span>
              ${spark(bars)}
            </div>
          </div>`;

// Sales over the month: the blue line over last month's dashed one
const cur = [22, 26, 24, 31, 29, 35, 33, 38, 36, 41, 39, 46, 44, 49, 47, 52, 58, 55, 61, 57, 63, 66, 62, 70, 68, 74, 71, 78];
const prev = [20, 21, 25, 23, 27, 26, 30, 29, 28, 33, 31, 35, 34, 37, 36, 39, 41, 40, 44, 43, 45, 47, 46, 49, 48, 52, 51, 53];
const path = (vals: number[]) => vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * 600) / (vals.length - 1)},${160 - v * 1.8}`).join(' ');
const salesChart = `<svg viewBox="0 0 600 160" width="100%" preserveAspectRatio="none" style="display: block; block-size: 176px" role="img" aria-label="Sales this month, rising from $1.1K to $3.9K a day, above last month">
              <g style="stroke: var(--m-color-border-muted)" stroke-width="1" vector-effect="non-scaling-stroke"><path d="M0,40H600M0,80H600M0,120H600" vector-effect="non-scaling-stroke"/></g>
              <path d="${path(prev)}" fill="none" style="stroke: var(--m-color-info-solid)" stroke-width="2" stroke-dasharray="4 4" vector-effect="non-scaling-stroke"/>
              <path d="${path(cur)} L600,160 L0,160 Z" style="fill: var(--m-color-info-bg); opacity: 0.6"/>
              <path d="${path(cur)}" fill="none" style="stroke: var(--m-color-info-border)" stroke-width="2" vector-effect="non-scaling-stroke"/>
            </svg>`;

const batchRow = (name: string, due: string, done: number, of: number, b: string) => `<li class="m-stack" data-gap="1" style="padding-block: var(--m-space-2); ${hair}">
                <div class="m-cluster" data-justify="between"><span style="font-weight: var(--m-font-weight-medium)">${name}</span>${b}</div>
                <div class="m-cluster" data-justify="between" style="${small}"><span>${due}</span><span style="${num}">${done} of ${of} filled</span></div>
                <progress class="m-progress" data-size="sm" value="${done}" max="${of}" aria-label="${name}: ${done} of ${of} filled"></progress>
              </li>`;

const sellerBar = (name: string, value: string, pct: number, change: string) => `<li class="m-stack" data-gap="1">
                <span>${name}</span>
                <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span aria-hidden="true" style="flex: 0 0 ${pct}%; block-size: 8px; border-radius: var(--m-radius-full); background: var(--m-color-info-border)"></span><strong style="font-weight: var(--m-font-weight-semibold); ${num}">${value}</strong><span class="m-cluster" data-gap="0" style="font-size: var(--m-font-size-sm); color: var(--m-color-success-fg)">${icon(I.up, 12)}${change}</span></div>
              </li>`;

const attention = (ic: keyof typeof I, text: string, meta: string, b: string) => `<li><a href="#" class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding: var(--m-space-2); border-radius: var(--m-radius-md); color: inherit; text-decoration: none">
                <span style="display: grid; place-items: center; inline-size: 32px; block-size: 32px; flex-shrink: 0; border-radius: var(--m-radius-md); background: var(--m-color-bg-sunken)">${icon(I[ic], 16)}</span>
                <span class="m-stack" data-gap="0" style="flex: 1; min-inline-size: 0"><span style="font-weight: var(--m-font-weight-medium)">${text}</span><span style="${small}">${meta}</span></span>
                ${b}<span style="display: inline-flex; color: var(--m-color-fg-subtle)">${icon(I.right, 14)}</span>
              </a></li>`;

const dashboard = shell(
  'Overview',
  titleBar('home', ['Overview'], `<button type="button" class="m-button" data-size="sm" ${pageButton}>${icon(I.pencil, 14)} Edit layout</button>`),
  `        <div class="m-stack" data-gap="5">
          <div class="m-stack" data-gap="1">
            <h1 style="${title}">Good afternoon, Marguerite</h1>
            <p style="${muted}">Batch 14 closes tomorrow at noon. Two suppliers haven't confirmed flour for next week.</p>
          </div>
          <div class="m-cluster" data-gap="2">
            <button type="button" class="m-button" data-size="sm" ${pageButton}>${icon(I.calendar, 14)} Last 28 days</button>
            <button type="button" class="m-button" data-size="sm" ${pageButton}>Compare: Sep 15 – Oct 12 ${icon(I.down, 14)}</button>
            <button type="button" class="m-button" data-size="sm" ${pageButton}>All stalls ${icon(I.down, 14)}</button>
          </div>
          <section class="m-card" aria-label="This period" style="padding: 0">
            <div class="m-cluster" data-gap="0" style="align-items: stretch">
          ${metric('Gross sales', '$48,912', '12%', true, [6, 9, 7, 11, 10, 13, 12, 15, 14, 17, 16, 20, 19, 22], true)}
          ${metric('Pre-orders', '316', '8%', true, [8, 7, 10, 9, 12, 11, 10, 13, 15, 14, 16, 15, 18, 17])}
          ${metric('Batch fill rate', '87%', '3%', false, [18, 19, 17, 18, 16, 17, 15, 16, 15, 14, 16, 15, 14, 15])}
          ${metric('Returns', '1.9%', '0.4%', true, [10, 9, 11, 8, 9, 7, 8, 6, 7, 6, 5, 6, 5, 4])}
            </div>
          </section>
          <div class="m-grid" style="--m-layout-grid-min: 352px">
            <section class="m-card" aria-labelledby="kl-sales">
              <div class="m-card-body m-stack" data-gap="2">
                <div class="m-cluster" data-justify="between">
                  <h2 id="kl-sales" style="${cardTitle}; ${defined}">Sales over time</h2>
                  <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Open the report">${icon(I.external, 14)}</button>
                </div>
                <div class="m-cluster" data-gap="2" data-align="baseline"><span style="${title}; ${num}">$48,912.40</span><span class="m-cluster" data-gap="0" style="font-size: var(--m-font-size-sm); color: var(--m-color-success-fg)">${icon(I.up, 12)}12%</span></div>
                ${salesChart}
                <div class="m-cluster" data-justify="between" style="${small}; ${num}"><span>Oct 13</span><span>Oct 20</span><span>Oct 27</span><span>Nov 3</span><span>Nov 9</span></div>
                <div class="m-cluster" data-gap="4" style="${small}">
                  <span class="m-cluster" data-gap="1"><span aria-hidden="true" style="inline-size: 12px; block-size: 2px; background: var(--m-color-info-border)"></span>Oct 13 – Nov 9</span>
                  <span class="m-cluster" data-gap="1"><span aria-hidden="true" style="inline-size: 12px; block-size: 0; border-block-start: 2px dashed var(--m-color-info-solid)"></span>Sep 15 – Oct 12</span>
                </div>
              </div>
            </section>
            <section class="m-card" aria-labelledby="kl-batches">
              <div class="m-card-body m-stack" data-gap="1">
                <div class="m-cluster" data-justify="between">
                  <h2 id="kl-batches" style="${cardTitle}">Batches closing soon</h2>
                  <a href="#" style="${link}">View all</a>
                </div>
                <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
                ${batchRow('Batch 14 · Rye sourdough', 'Closes tomorrow, 12:00', 46, 52, badge('warning', 'Almost full', 'half'))}
                ${batchRow('Batch 15 · Spiced pear chutney', 'Closes Nov 15', 31, 80, badge('info', 'Open', 'empty'))}
                ${batchRow('Batch 16 · Seeded crackers', 'Closes Nov 19', 120, 120, badge('success', 'Full', 'full'))}
                </ul>
              </div>
            </section>
            <section class="m-card" aria-labelledby="kl-attention">
              <div class="m-card-body m-stack" data-gap="1">
                <h2 id="kl-attention" style="${cardTitle}">Needs attention</h2>
                <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none; margin-inline: calc(var(--m-space-2) * -1)">
                ${attention('clock', '9 deposits not yet paid', 'Reminders went out Monday', badge('warning', '9'))}
                ${attention('truck', 'Mill order unconfirmed', 'Hollin Mill · 400 kg rye', badge('danger', 'Late'))}
                ${attention('undo', '2 returns to inspect', 'Arrived at the workshop today', badge('neutral', '2'))}
                </ul>
              </div>
            </section>
            <section class="m-card" aria-labelledby="kl-sellers">
              <div class="m-card-body m-stack" data-gap="3">
                <h2 id="kl-sellers" style="${cardTitle}; ${defined}">Top sellers by revenue</h2>
                <ul class="m-stack" data-gap="3" style="padding: 0; list-style: none">
                ${sellerBar('Rye sourdough, large', '$9.4K', 74, '14%')}
                ${sellerBar('Seeded crackers, 3-pack', '$7.1K', 58, '6%')}
                ${sellerBar('Spiced pear chutney', '$5.8K', 47, '21%')}
                ${sellerBar('Oat and honey loaf', '$4.2K', 35, '3%')}
                </ul>
              </div>
            </section>
          </div>
        </div>`,
);

/* ----------------------------------------------------------------------------------------------
 * List and detail: Pre-orders, then one pre-order
 * -------------------------------------------------------------------------------------------- */

type Row = [string, string, string, string, string, string, string, boolean?];
const rows: Row[] = [
  ['PO-2231', 'Today at 9:42', 'Sunniva Holt', '$64.50', badge('neutral', 'Paid', 'full'), badge('warning', 'Awaiting batch', 'empty'), '3 items', true],
  ['PO-2230', 'Today at 8:15', 'Tobiah Lund', '$22.00', badge('warning', 'Deposit due', 'empty'), badge('warning', 'Awaiting batch', 'empty'), '1 item', true],
  ['PO-2229', 'Yesterday at 18:03', 'Ama Castellanos', '$118.75', badge('neutral', 'Paid', 'full'), badge('info', 'Baking', 'half'), '6 items'],
  ['PO-2228', 'Yesterday at 11:27', 'Felix Aranda', '$41.20', badge('neutral', 'Paid', 'full'), badge('success', 'Ready to collect', 'full'), '2 items'],
  ['PO-2227', 'Nov 10 at 16:50', 'Priyanka Dass', '$86.00', badge('danger', 'Refunded'), badge('neutral', 'Cancelled', 'full'), '4 items'],
  ['PO-2226', 'Nov 10 at 9:12', 'Dmitri Vance', '$35.40', badge('neutral', 'Paid', 'full'), badge('success', 'Collected', 'full'), '2 items'],
];
const tr = ([id, date, who, total, pay, batch, items, sel]: Row) => `<tr${sel ? ' aria-selected="true" style="background: var(--m-color-bg-sunken)"' : ''}>
                <td style="inline-size: 40px"><input class="m-checkbox" type="checkbox" aria-label="Select ${id}"${sel ? ' checked' : ''}></td>
                <td><a href="#" style="color: inherit; text-decoration: none; font-weight: var(--m-font-weight-semibold)">${id}</a></td>
                <td style="${muted}">${date}</td>
                <td>${who}</td>
                <td data-numeric>${total}</td>
                <td>${pay}</td>
                <td>${batch}</td>
                <td style="${muted}">${items}</td>
              </tr>`;

const viewTab = (label: string, on = false) =>
  `<button type="button" class="m-button" data-variant="ghost" data-size="sm" aria-pressed="${on}"${on ? ' style="--m-button-ghost-bg: var(--m-button-secondary-bg)"' : ''}>${label}${on ? ` ${icon(I.down, 12)}` : ''}</button>`;

const lineItem = (n: number, name: string, variant: string, price: string, qty: string, total: string) => `<li class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding-block: var(--m-space-3); ${hair}">
                    ${thumb(n, '40px')}
                    <div class="m-stack" data-gap="1" style="flex: 1; min-inline-size: 0"><span style="font-weight: var(--m-font-weight-medium)">${name}</span><span><span class="m-badge" style="--m-badge-neutral-fg: var(--m-color-fg-default)">${variant}</span></span></div>
                    <span style="${num}">${price} <span style="${muted}">×</span> <span class="m-badge" style="--m-badge-neutral-fg: var(--m-color-fg-default); --m-badge-neutral-bg: var(--m-color-bg-sunken)">${qty}</span></span>
                    <span data-numeric style="${num}; min-inline-size: 80px; text-align: end">${total}</span>
                  </li>`;
const sumRow = (label: string, mid: string, value: string, strong = false) =>
  `<div class="m-cluster" data-justify="between" style="padding-block: var(--m-space-1)${strong ? `; ${hair}; padding-block-start: var(--m-space-2); font-weight: var(--m-font-weight-semibold)` : ''}"><span>${label}</span><span class="m-cluster" data-gap="8"><span style="${muted}">${mid}</span><span style="${num}; min-inline-size: 80px; text-align: end">${value}</span></span></div>`;
const event = (text: string, time: string) =>
  `<li class="m-cluster" data-justify="between" data-align="start" style="flex-wrap: nowrap; gap: var(--m-space-3)"><span class="m-cluster" data-gap="2" data-align="start" style="flex-wrap: nowrap"><span aria-hidden="true" style="flex-shrink: 0; inline-size: 8px; block-size: 8px; margin-block-start: 6px; border-radius: var(--m-radius-full); background: var(--m-color-border-strong)"></span><span>${text}</span></span><span style="${small}; white-space: nowrap">${time}</span></li>`;

const listDetail = shell(
  'Pre-orders',
  titleBar(
    'clock',
    ['Pre-orders'],
    `<button type="button" class="m-button" data-size="sm" ${pageButton}>${icon(I.download, 14)} Export</button>
          <button type="button" class="m-button" data-size="sm" ${pageButton}>More actions ${icon(I.down, 14)}</button>
          <button type="button" class="m-button" data-variant="primary" data-size="sm">${icon(I.plus, 14)} Pre-order</button>`,
  ),
  `        <div class="m-stack" data-gap="5">
          <h1 style="${title}">Pre-orders</h1>
          <section class="m-card" aria-label="Pre-orders" style="padding: 0; overflow: hidden">
            <div class="m-cluster" data-justify="between" style="padding: var(--m-space-2)">
              <div class="m-cluster" data-gap="1" role="group" aria-label="Views">
                ${viewTab('All', true)}
                ${viewTab('Deposit due')}
                ${viewTab('Awaiting batch')}
                ${viewTab('Ready to collect')}
                <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Add a view">${icon(I.plus, 14)}</button>
              </div>
              <div class="m-cluster" data-gap="1">
                <button type="button" class="m-button" data-size="sm" ${pageButton} aria-label="Search and filter">${icon(I.search, 14)}${icon(I.filter, 14)}</button>
                <button type="button" class="m-button" data-size="sm" data-icon-only ${pageButton} aria-label="Sort">${icon(I.sort, 14)}</button>
              </div>
            </div>
            <div class="m-table-wrap" style="--m-table-wrap-shadow: none; --m-table-wrap-radius: 0">
            <table class="m-table">
              <thead>
                <tr>
                  <th style="inline-size: 40px"><input class="m-checkbox" type="checkbox" aria-label="Select all pre-orders"></th>
                  <th colspan="7"><div class="m-cluster" data-gap="2"><span style="color: var(--m-color-fg-default)">2 selected</span>
                    <button type="button" class="m-button" data-size="sm" ${pageButton}>${icon(I.package, 14)} Mark as packed</button>
                    <button type="button" class="m-button" data-size="sm" ${pageButton}>${icon(I.printer, 14)} Print slips</button>
                    <button type="button" class="m-button" data-size="sm" data-icon-only ${pageButton} aria-label="More bulk actions">${icon(I.ellipsis, 14)}</button>
                  </div></th>
                </tr>
                <tr>
                  <th></th><th>Pre-order</th><th>Placed</th><th>Customer</th><th data-numeric>Total</th><th>Deposit</th><th>Batch</th><th>Items</th>
                </tr>
              </thead>
              <tbody>
              ${rows.map(tr).join('\n              ')}
              </tbody>
            </table>
            </div>
            <div class="m-cluster" data-justify="center" style="padding: var(--m-space-2); ${hair}">
              <nav class="m-pagination" aria-label="Pages"><a class="m-pagination-item" href="#" aria-label="Previous page">${icon(I.left, 14)}</a><a class="m-pagination-item" href="#" aria-label="Next page">${icon(I.right, 14)}</a></nav>
              <span style="${small}">1–6 of 214</span>
            </div>
          </section>

          <div class="m-stack" data-gap="2" style="padding-block-start: var(--m-space-6)">
            <div class="m-cluster" data-gap="3" data-align="center">
              <h2 style="${bigTitle}">PO-2229</h2>
              ${badge('neutral', 'Paid', 'full')}
              ${badge('info', 'Baking', 'half')}
            </div>
            <p style="${muted}">Placed yesterday at 18:03 from the Saturday stall · collect at the Wharf Street market</p>
          </div>
          <div class="m-split" style="--m-layout-split-side: 272px; --m-layout-split-gap: var(--m-space-5); flex-direction: row-reverse; align-items: flex-start">
            <aside class="m-stack" data-gap="4" aria-label="Customer">
              <div class="m-stack" data-gap="2">
                <h3 style="${section}">Ama Castellanos</h3>
                <span class="m-cluster" data-gap="2" style="${muted}">${icon(I.mail, 14)} ama.c@example.com</span>
                <span class="m-cluster" data-gap="2" style="${muted}">${icon(I.receipt, 14)} 11 pre-orders since March</span>
              </div>
              <div class="m-stack" data-gap="1" style="${hair}; padding-block-start: var(--m-space-3)">
                <span style="${small}">Collection point</span>
                <span>Wharf Street market, stall 7<br>Saturdays 8:00 – 13:00</span>
              </div>
              <div class="m-stack" data-gap="2" style="${hair}; padding-block-start: var(--m-space-3)">
                <span style="${small}">Timeline</span>
                <input class="m-input" type="text" placeholder="Leave a note for the team" aria-label="Note">
                <ol class="m-stack" data-gap="2" style="padding: 0; list-style: none">
                  ${event('Moved to batch 14 · baking', '07:30')}
                  ${event('Deposit of $40.00 received by card', 'Nov 11')}
                  ${event('Confirmation sent to Ama', 'Nov 11')}
                </ol>
              </div>
            </aside>
            <div class="m-stack" data-gap="5">
              <div class="m-stack" data-gap="1" style="padding: var(--m-space-2) var(--m-space-3); border-inline-start: 2px solid var(--m-color-warning-solid)">
                <span style="${small}">Note from Ama</span>
                <span><mark style="background: var(--m-color-warning-bg); color: inherit; padding-inline: 2px">Please slice the rye. Collecting with a friend if I'm away.</mark></span>
              </div>
              <div class="m-stack" data-gap="2">
                <div class="m-cluster" data-justify="between">
                  <span class="m-cluster" data-gap="2" style="${section}"><span style="display: grid; place-items: center; inline-size: 24px; block-size: 24px; border-radius: var(--m-radius-sm); background: var(--m-color-info-solid); color: var(--m-color-info-on-solid)">${icon(I.layers, 14)}</span>Batch 14</span>
                  <div class="m-cluster" data-gap="2">
                    <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="More actions">${icon(I.ellipsis, 14)}</button>
                    <button type="button" class="m-button" data-size="sm">Move to batch ${icon(I.down, 12)}</button>
                    <button type="button" class="m-button" data-variant="primary" data-size="sm">Mark ready to collect</button>
                  </div>
                </div>
                <section class="m-card" aria-label="Items" style="padding: var(--m-space-1) var(--m-space-4)">
                  <div class="m-cluster" data-justify="between" style="padding-block: var(--m-space-2); ${muted}"><span class="m-cluster" data-gap="2">${icon(I.flame, 14)} Baking Thursday</span><span class="m-cluster" data-gap="2">${icon(I.pin, 14)} Rookwood workshop</span></div>
                  <ul style="padding: 0; margin: 0; list-style: none">
                  ${lineItem(0, 'Rye sourdough, large', 'Sliced', '$9.50', '2', '$19.00')}
                  ${lineItem(1, 'Seeded crackers, 3-pack', 'Rosemary', '$12.25', '3', '$36.75')}
                  ${lineItem(2, 'Spiced pear chutney', '340 g jar', '$7.00', '1', '$7.00')}
                  </ul>
                </section>
              </div>
              <div class="m-stack" data-gap="2">
                <h3 style="${section}">Payment</h3>
                <div style="border-radius: var(--m-radius-lg); background: var(--m-color-bg-sunken)">
                  <section class="m-card" aria-label="Payment" style="padding: var(--m-space-3) var(--m-space-4)">
                    ${sumRow('Subtotal', '6 items', '$62.75')}
                    ${sumRow('Market discount', 'STALL5', '−$3.14')}
                    ${sumRow('Collection', 'Wharf Street', '$0.00')}
                    ${sumRow('Total', '', '$59.61', true)}
                  </section>
                  <div class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-4); ${muted}"><span class="m-cluster" data-gap="2">${icon(I.card, 14)} Deposit, card ending 4417</span><span style="${num}">$40.00</span></div>
                  <div class="m-cluster" data-justify="between" style="padding: 0 var(--m-space-4) var(--m-space-3)"><span>Balance due at collection</span><strong style="${num}; font-weight: var(--m-font-weight-semibold)">$19.61</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>`,
);

/* ----------------------------------------------------------------------------------------------
 * Onboarding: setting up a new workshop, full page with no frame
 * -------------------------------------------------------------------------------------------- */

const choice = (ic: keyof typeof I, label: string, on = false) => `<label class="m-cluster" data-gap="3" style="padding: var(--m-space-3); border-radius: var(--m-radius-md); background: var(--m-color-bg-surface); box-shadow: ${on ? 'inset 0 0 0 2px var(--m-color-fg-default)' : 'var(--m-shadow-md)'}; cursor: pointer; flex-wrap: nowrap">
              <input class="m-checkbox" type="checkbox"${on ? ' checked' : ''}>
              <span style="display: grid; place-items: center; inline-size: 32px; block-size: 32px; border-radius: var(--m-radius-md); background: var(--m-color-bg-sunken)">${icon(I[ic], 16)}</span>
              <span style="font-weight: var(--m-font-weight-medium)">${label}</span>
            </label>`;

const onboarding = `<div class="m-stack" data-gap="0" style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  <header class="m-cluster" data-justify="between" style="padding: var(--m-space-4) var(--m-space-6)">
    <span class="m-cluster" data-gap="2" style="font-weight: var(--m-font-weight-semibold)"><span aria-hidden="true" style="display: grid; place-items: center; inline-size: 28px; block-size: 28px; border-radius: var(--m-radius-md); background: var(--m-color-fg-default); color: var(--m-color-bg-canvas)">${icon(I.wheat, 16)}</span>Rookwood</span>
    <button type="button" class="m-button" data-variant="ghost" data-size="sm">Skip setup</button>
  </header>
  <main class="m-container" data-size="sm" style="padding-block: var(--m-space-10) var(--m-space-12)">
    <div class="m-stack" data-gap="6">
      <div class="m-cluster" data-gap="1" role="progressbar" aria-label="Step 2 of 4" aria-valuenow="2" aria-valuemin="1" aria-valuemax="4" style="flex-wrap: nowrap">
        <span style="flex: 1; block-size: 4px; border-radius: var(--m-radius-full); background: var(--m-color-accent-default)"></span>
        <span style="flex: 1; block-size: 4px; border-radius: var(--m-radius-full); background: var(--m-color-accent-default)"></span>
        <span style="flex: 1; block-size: 4px; border-radius: var(--m-radius-full); background: var(--m-color-border-default)"></span>
        <span style="flex: 1; block-size: 4px; border-radius: var(--m-radius-full); background: var(--m-color-border-default)"></span>
      </div>
      <div class="m-stack" data-gap="2">
        <span style="${small}">Step 2 of 4</span>
        <h1 style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)">What will you make first?</h1>
        <p style="${muted}; font-size: var(--m-font-size-lg)">Pick everything that fits. We'll set up batches and labels to match, and you can change this later.</p>
      </div>
      <div class="m-grid" data-gap="2" style="--m-layout-grid-min: 208px">
        ${choice('wheat', 'Bread and bakes', true)}
        ${choice('leaf', 'Preserves and pickles', true)}
        ${choice('coffee', 'Coffee and tea')}
        ${choice('flame', 'Sauces and spice')}
        ${choice('gift', 'Gift boxes')}
        ${choice('shirt', 'Aprons and goods')}
      </div>
      <div class="m-field">
        <label class="m-field-label" for="kl-name">Workshop name</label>
        <input class="m-input" id="kl-name" value="Rookwood Provisions">
        <p class="m-field-hint">Shown on receipts, labels and your stall sign.</p>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="kl-size">How many orders a week, roughly?</label>
        <select class="m-select" id="kl-size"><option>Up to 50</option><option selected>50 to 200</option><option>More than 200</option></select>
      </div>
      <div class="m-cluster" data-justify="between" style="${hair}; padding-block-start: var(--m-space-4)">
        <button type="button" class="m-button" data-variant="ghost">${icon(I.left, 14)} Back</button>
        <button type="button" class="m-button" data-variant="primary">Next</button>
      </div>
    </div>
  </main>
</div>`;

/* ----------------------------------------------------------------------------------------------
 * Settings: a grouped list beside cards of label-and-value rows
 * -------------------------------------------------------------------------------------------- */

const setLink = (ic: keyof typeof I, label: string, current = false) =>
  `<li><a class="m-sidebar-link" href="#"${current ? ' aria-current="page"' : ''}><span style="display: inline-flex; color: var(--m-color-fg-subtle)">${icon(I[ic], 16)}</span>${label}</a></li>`;
const setRow = (label: string, value: string, action = '') => `<div class="m-cluster" data-justify="between" data-align="start" style="flex-wrap: nowrap; gap: var(--m-space-4); padding-block: var(--m-space-3); ${hair}">
                  <div class="m-stack" data-gap="0"><span style="${small}">${label}</span><span>${value}</span></div>${action}
                </div>`;
const editBtn = (what: string) =>
  `<button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Edit ${what}">${icon(I.pencil, 14)}</button>`;
const toggle = (label: string, hint: string, on: boolean) => `<label class="m-cluster" data-justify="between" style="flex-wrap: nowrap; gap: var(--m-space-4); padding-block: var(--m-space-3); ${hair}">
                  <span class="m-stack" data-gap="0"><span>${label}</span><span style="${small}">${hint}</span></span>
                  <input class="m-switch" type="checkbox" role="switch"${on ? ' checked' : ''}>
                </label>`;

const settings = shell(
  'Settings',
  titleBar('gear', ['Settings', 'Workshop details']),
  `        <div class="m-split" style="--m-layout-split-side: 224px; --m-layout-split-gap: var(--m-space-6); align-items: flex-start">
          <nav class="m-sidebar" aria-label="Settings" style="--m-sidebar-bg: transparent; --m-sidebar-link-fg: var(--m-color-fg-default); --m-sidebar-link-hover-fg: var(--m-color-fg-default); --m-sidebar-link-hover-bg: var(--m-color-bg-sunken); --m-sidebar-link-active-fg: var(--m-color-fg-default); --m-sidebar-link-active-bg: var(--m-color-accent-subtle); --m-sidebar-heading-fg: var(--m-color-fg-muted); padding: 0">
            <div class="m-sidebar-section">
              <h2 class="m-sidebar-heading">Workshop</h2>
              <ul>
                ${setLink('store', 'Workshop details', true)}
                ${setLink('users', 'Team and roles')}
                ${setLink('card', 'Payments and deposits')}
                ${setLink('receipt', 'Receipts and invoices')}
              </ul>
            </div>
            <div class="m-sidebar-section">
              <h2 class="m-sidebar-heading">Selling</h2>
              <ul>
                ${setLink('map', 'Stalls and collection')}
                ${setLink('scale', 'Units and labels')}
                ${setLink('mail', 'Customer messages')}
                ${setLink('globe', 'Languages')}
              </ul>
            </div>
          </nav>
          <div class="m-stack" data-gap="5" style="max-inline-size: 720px">
            <div class="m-stack" data-gap="1">
              <h1 style="${title}">Workshop details</h1>
              <p style="${muted}">How Rookwood appears on receipts, labels and messages.</p>
            </div>
            <section class="m-card" aria-labelledby="kl-profile">
              <div class="m-card-body">
                <div class="m-cluster" data-justify="between" style="padding-block-end: var(--m-space-2)"><h2 id="kl-profile" style="${cardTitle}">Profile</h2></div>
                ${setRow('Trading name', 'Rookwood Provisions', editBtn('trading name'))}
                ${setRow('Contact email', 'hello@rookwood.example', editBtn('contact email'))}
                ${setRow('Phone', '+44 20 7946 0318', editBtn('phone'))}
              </div>
            </section>
            <section class="m-card" aria-labelledby="kl-address">
              <div class="m-card-body">
                <div class="m-cluster" data-justify="between" style="padding-block-end: var(--m-space-2)"><h2 id="kl-address" style="${cardTitle}">Workshop address</h2><button type="button" class="m-button" data-size="sm">Edit</button></div>
                ${setRow('Used for collections and supplier deliveries', 'Unit 4, Coalhouse Yard<br>Bristol BS2 0QT<br>United Kingdom')}
              </div>
            </section>
            <section class="m-card" aria-labelledby="kl-units">
              <div class="m-card-body m-stack" data-gap="3">
                <h2 id="kl-units" style="${cardTitle}">Units and formats</h2>
                <div class="m-grid" style="--m-layout-grid-min: 192px; --m-layout-grid-gap: var(--m-space-3)">
                  <div class="m-field"><label class="m-field-label" for="kl-weight">Weight</label><select class="m-select" id="kl-weight"><option selected>Grams (g)</option><option>Ounces (oz)</option></select></div>
                  <div class="m-field"><label class="m-field-label" for="kl-currency">Currency</label><select class="m-select" id="kl-currency"><option selected>Pound sterling (GBP)</option><option>Euro (EUR)</option></select></div>
                  <div class="m-field"><label class="m-field-label" for="kl-prefix">Pre-order prefix</label><input class="m-input" id="kl-prefix" value="PO-"></div>
                  <div class="m-field"><label class="m-field-label" for="kl-zone">Time zone</label><select class="m-select" id="kl-zone"><option selected>London (GMT)</option><option>Dublin (GMT)</option></select></div>
                </div>
              </div>
            </section>
            <section class="m-card" aria-labelledby="kl-notify">
              <div class="m-card-body">
                <h2 id="kl-notify" style="${cardTitle}; padding-block-end: var(--m-space-2)">Messages to the team</h2>
                ${toggle('A batch is nearly full', 'When 90% of places are taken', true)}
                ${toggle('A deposit is overdue', 'Two days after the reminder', true)}
                ${toggle('Weekly summary', 'Mondays at 8:00', false)}
              </div>
            </section>
            <section class="m-card" aria-labelledby="kl-close">
              <div class="m-card-body m-cluster" data-justify="between" style="gap: var(--m-space-4)">
                <div class="m-stack" data-gap="1"><h2 id="kl-close" style="${cardTitle}">Close the workshop</h2><p style="${muted}">Stops new pre-orders. Open batches finish and customers keep their receipts.</p></div>
                <button type="button" class="m-button" data-variant="danger" data-size="sm">Close workshop</button>
              </div>
            </section>
          </div>
        </div>`,
);

/* ----------------------------------------------------------------------------------------------
 * Empty state: a section with nothing in it yet, a two-line display heading and two actions
 * -------------------------------------------------------------------------------------------- */

const ghostRow = (w: string) =>
  `<div class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding: var(--m-space-3) var(--m-space-4); ${hair}"><span class="m-skeleton" style="inline-size: 32px; block-size: 32px; border-radius: var(--m-radius-md); animation: none"></span><span class="m-stack" data-gap="1" style="flex: 1"><span class="m-skeleton" style="inline-size: ${w}; block-size: 10px; animation: none"></span><span class="m-skeleton" style="inline-size: 30%; block-size: 8px; animation: none"></span></span></div>`;

const emptyState = shell(
  'Suppliers',
  titleBar('truck', ['Suppliers']),
  `        <div class="m-grid" style="--m-layout-grid-min: 320px; --m-layout-grid-gap: var(--m-space-10); align-items: center; min-block-size: 70vh">
          <div class="m-stack" data-gap="5">
            <h1 style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)">Suppliers<br><span style="color: var(--m-color-fg-subtle)">Every batch starts with them</span></h1>
            <p style="${muted}; max-inline-size: 416px">Add the mills, farms and makers you buy from. Their prices and lead times then fill in on every batch.</p>
            <div class="m-cluster" data-gap="2">
              <button type="button" class="m-button" data-variant="primary">${icon(I.plus, 14)} Supplier</button>
              <button type="button" class="m-button" data-variant="ghost">${icon(I.upload, 14)} Import</button>
            </div>
            <p style="${small}">Buying from a market trader? Add them as a supplier without an account. <a href="#" style="display: inline-flex; align-items: center; gap: 2px; color: var(--m-color-fg-default); font-weight: var(--m-font-weight-medium); text-decoration: none; white-space: nowrap">Learn more ${icon(I.right, 12)}</a></p>
          </div>
          <div aria-hidden="true" class="m-card" style="padding: 0; overflow: hidden">
            <div class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-4)"><span class="m-skeleton" style="inline-size: 96px; block-size: 12px; animation: none"></span><span class="m-skeleton" style="inline-size: 56px; block-size: 20px; border-radius: var(--m-radius-full); animation: none"></span></div>
            ${ghostRow('55%')}
            ${ghostRow('40%')}
            ${ghostRow('62%')}
          </div>
        </div>`,
);

/* ----------------------------------------------------------------------------------------------
 * Pricing: the dark marketing site, plan cards with outlined pills and hairline feature rows
 * -------------------------------------------------------------------------------------------- */

const feature = (text: string) =>
  `<li style="padding-block: var(--m-space-3); ${hair}; ${muted}">${text}</li>`;
const plan = (name: string, tag: string, price: string, cta: string, features: string[], from = false) => `<article class="m-card" aria-labelledby="kl-plan-${name.toLowerCase()}" style="--m-card-bg: var(--m-color-bg-surface); box-shadow: none">
          <div class="m-card-body m-stack" data-gap="5">
            <div class="m-cluster" data-justify="between" data-align="start" style="flex-wrap: nowrap">
              <div class="m-stack" data-gap="0"><h2 id="kl-plan-${name.toLowerCase()}" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-regular); letter-spacing: var(--m-font-tracking-tight)">${name}</h2><span style="color: var(--m-color-brand-default)">${tag}</span></div>
              <span style="font-size: var(--m-font-size-xl); white-space: nowrap; ${num}">${from ? `<span style="font-size: var(--m-font-size-sm)">from </span>` : ''}${price}<span style="font-size: var(--m-font-size-sm)">/mo</span></span>
            </div>
            <button type="button" class="m-button" data-size="lg" style="inline-size: 100%; --m-button-secondary-bg: transparent; --m-button-secondary-hover-bg: var(--m-color-bg-raised); --m-button-secondary-border: var(--m-color-fg-default); --m-button-border-width: 2px; font-size: var(--m-font-size-lg)">${cta}</button>
            <ul style="padding: 0; margin: 0; list-style: none">${features.map(feature).join('')}</ul>
          </div>
        </article>`;

const faq = (q: string, a: string, open = false) =>
  `<details class="m-accordion-item"${open ? ' open' : ''}><summary>${q}</summary><div class="m-accordion-content"><p>${a}</p></div></details>`;

const pricing = `<div data-theme="keel" data-mode="dark" style="min-block-size: 100vh; background: var(--m-color-bg-canvas); color: var(--m-color-fg-default); font-feature-settings: 'calt' on, 'ss03' on, 'cv09' on">
  <header class="m-navbar" style="--m-navbar-bg: transparent; --m-navbar-link-fg: var(--m-color-fg-default); font-size: var(--m-font-size-lg)">
    <a class="m-navbar-brand" href="#"><span aria-hidden="true" style="display: grid; place-items: center; inline-size: 28px; block-size: 28px; border-radius: var(--m-radius-md); background: var(--m-color-fg-default); color: var(--m-color-bg-canvas)">${icon(I.wheat, 16)}</span> Rookwood</a>
    <nav class="m-navbar-nav" aria-label="Site">
      <a class="m-navbar-link" href="#">For makers ${icon(I.down, 12)}</a>
      <a class="m-navbar-link" href="#">Features ${icon(I.down, 12)}</a>
      <a class="m-navbar-link" href="#" aria-current="page">Plans</a>
      <a class="m-navbar-link" href="#">Stories</a>
    </nav>
    <div class="m-navbar-actions">
      <a class="m-navbar-link" href="#">Sign in</a>
      <a class="m-button" data-variant="primary" href="#">Open a workshop</a>
    </div>
  </header>
  <main class="m-container" style="max-inline-size: 1376px; padding-block: var(--m-space-12) var(--m-space-16)">
    <div class="m-stack" data-gap="10">
      <div class="m-stack" data-gap="3" style="text-align: center; align-items: center">
        <h1 style="font-size: clamp(36px, 6vw, 64px); font-weight: var(--m-font-weight-regular); letter-spacing: -0.035em; line-height: 1.05">Plans that rise with you.</h1>
        <p style="font-size: var(--m-font-size-xl); letter-spacing: var(--m-font-tracking-tight)">Run your first two batches free, then pick a plan.</p>
      </div>
      <div class="m-cluster" data-justify="between">
        <label class="m-cluster" data-gap="2"><input class="m-switch" type="checkbox" role="switch" checked style="--m-switch-track-checked-bg: var(--m-color-brand-default); --m-switch-thumb-checked-bg: var(--m-color-brand-fg)"> Pay yearly (save 20%)</label>
        <a href="#" style="color: var(--m-color-fg-default); text-underline-offset: 0.2em">Compare every feature</a>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 260px">
        ${plan('Stall', 'For one maker at one market', '$14', 'Start free', ['Pre-orders and deposits', 'One collection point', 'Card payments at the stall', 'Email help, weekdays'])}
        ${plan('Workshop', 'For a small team', '$39', 'Start free', ['Everything in Stall', 'Up to 6 team members', 'Batches with supplier costs', 'Printed labels and slips', 'Chat help, every day'])}
        ${plan('Kitchen', 'For several sites', '$119', 'Start free', ['Everything in Workshop', 'Up to 20 team members', 'Stockists and wholesale prices', 'Multiple collection points', 'Allergen sheets by batch'])}
        ${plan('Co-op', 'For shared kitchens', '$420', 'Talk to us', ['Everything in Kitchen', 'Unlimited members', 'Shared ingredient buying', 'Phone help with a named contact'], true)}
      </div>
      <div class="m-stack" data-gap="4" style="max-inline-size: 720px; margin-inline: auto; inline-size: 100%">
        <h2 style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-regular); letter-spacing: var(--m-font-tracking-tight); text-align: center">Questions</h2>
        <div class="m-accordion" style="--m-accordion-bg: transparent; --m-accordion-border: var(--m-color-border-default)">
          ${faq('Can I change plans later?', 'Yes. Moving up takes effect straight away; moving down applies from your next bill.', true)}
          ${faq('Do you take a cut of each sale?', 'Card payments cost 1.6% + 20p on every plan. Cash and bank transfers are free.')}
          ${faq('What happens to open batches if I stop?', 'They finish as planned and customers can still collect. New pre-orders close.')}
        </div>
      </div>
    </div>
  </main>
</div>`;

/* ----------------------------------------------------------------------------------------------
 * Errors: field, form, toast and whole-page errors, as one page
 * -------------------------------------------------------------------------------------------- */

// Inline errors: the alert icon and the message in the critical text colour
const inlineError = (id: string, text: string) =>
  `<p class="m-field-error" id="${id}" style="display: flex; gap: var(--m-space-1); align-items: center">${icon(I.alert, 14)} ${text}</p>`;

const fullPage = (ic: keyof typeof I, code: string, heading: string, body: string, actions: string) => `<section class="m-card" aria-label="${code} page">
              <div class="m-card-body m-stack" data-gap="3" style="align-items: center; text-align: center; padding-block: var(--m-space-10)">
                <span style="display: grid; place-items: center; inline-size: 48px; block-size: 48px; border-radius: var(--m-radius-lg); background: var(--m-color-bg-sunken); color: var(--m-color-fg-muted)">${icon(I[ic], 20)}</span>
                <span style="${small}; font-family: var(--m-font-family-mono)">${code}</span>
                <h3 style="${section}">${heading}</h3>
                <p style="${muted}; max-inline-size: 352px">${body}</p>
                <div class="m-cluster" data-gap="2" data-justify="center">${actions}</div>
              </div>
            </section>`;

const errors = shell(
  'Batches',
  titleBar('layers', ['Batches', 'New batch'], `<button type="button" class="m-button" data-size="sm" ${pageButton}>Discard</button><button type="button" class="m-button" data-variant="primary" data-size="sm">Save</button>`),
  `        <div class="m-stack" data-gap="6">
          <h1 style="${title}">New batch</h1>
          <div class="m-alert" data-tone="danger" role="alert">
            <span class="m-alert-icon">${icon(I.alert, 16)}</span>
            <div class="m-alert-content">
              <p class="m-alert-title">2 things to fix before this batch can open</p>
              <div class="m-alert-body"><ul style="margin: 0; padding-inline-start: 1.1em"><li>Choose a closing date after today</li><li>Places must be a whole number</li></ul></div>
            </div>
          </div>
          <section class="m-card" aria-label="Batch details">
            <div class="m-card-body m-stack" data-gap="4">
              <div class="m-field">
                <label class="m-field-label" for="kl-bname">Name</label>
                <input class="m-input" id="kl-bname" value="Batch 17 · Fig and walnut loaf">
              </div>
              <div class="m-grid" style="--m-layout-grid-min: 224px; --m-layout-grid-gap: var(--m-space-3)">
                <div class="m-field">
                  <label class="m-field-label" for="kl-close-date">Closes on</label>
                  <input class="m-input" id="kl-close-date" value="Nov 9, 2026" aria-invalid="true" aria-describedby="kl-close-err" style="background: var(--m-color-danger-bg)">
                  ${inlineError('kl-close-err', 'Choose a date after today')}
                </div>
                <div class="m-field">
                  <label class="m-field-label" for="kl-places">Places</label>
                  <input class="m-input" id="kl-places" value="48.5" aria-invalid="true" aria-describedby="kl-places-err" style="background: var(--m-color-danger-bg)">
                  ${inlineError('kl-places-err', 'Places must be a whole number')}
                </div>
              </div>
              <div class="m-field">
                <label class="m-field-label" for="kl-supplier">Flour from</label>
                <select class="m-select" id="kl-supplier"><option>Hollin Mill</option><option>Tarrant Farm</option></select>
                <p class="m-field-hint">Lead time 5 days. Last delivery Nov 4.</p>
              </div>
            </div>
          </section>

          <div class="m-alert" data-tone="warning">
            <span class="m-alert-icon">${icon(I.triangle, 16)}</span>
            <div class="m-alert-content">
              <p class="m-alert-title">Hollin Mill hasn't confirmed next week's flour</p>
              <div class="m-alert-body">This batch can still open. If the order isn't confirmed by Friday, places stay on hold.</div>
              <div class="m-alert-actions"><button type="button" class="m-button" data-size="sm" ${pageButton}>Message the mill</button></div>
            </div>
          </div>

          <div class="m-toast-region" data-static data-position="bottom" aria-live="polite" style="position: relative; inset: auto; margin-inline: auto">
            <div class="m-toast" role="status" style="inline-size: auto; align-items: center">
              <div class="m-toast-content"><p class="m-toast-title">Couldn't print 3 slips. The printer is offline.</p></div>
              <div class="m-cluster" data-gap="1"><button type="button" class="m-button" data-size="sm">${icon(I.refresh, 14)} Retry</button><button type="button" class="m-toast-close" aria-label="Dismiss">${icon(I.x, 14)}</button></div>
            </div>
          </div>

          <div class="m-stack" data-gap="3" style="padding-block-start: var(--m-space-4)">
            <h2 style="${section}">Whole-page errors</h2>
            <div class="m-grid" style="--m-layout-grid-min: 200px">
              ${fullPage('map', '404', 'There’s nothing at this address', 'The link may be old, or the page was moved when the batch closed.', '<button type="button" class="m-button" data-variant="primary" data-size="sm">Go to Overview</button>')}
              ${fullPage('alert', '500', 'Something went wrong on our side', 'Nothing was saved or sent. Try again in a moment.', `<button type="button" class="m-button" data-variant="primary" data-size="sm">${icon(I.refresh, 14)} Try again</button><button type="button" class="m-button" data-size="sm">Status page</button>`)}
              ${fullPage('lock', '403', 'You don’t have access to this', 'Payouts are only open to owners. Ask Marguerite to add you.', '<button type="button" class="m-button" data-variant="primary" data-size="sm">Request access</button>')}
            </div>
          </div>
        </div>`,
  'md',
);

export const keelRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Overview',
    description:
      'The frame with search and pinned views, a white page with a round back button, date and comparison pills, a metrics strip with dotted names and small bars, then cards: a sales line against last month, batches with meters, a needs-attention list and top sellers as bars.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'Pre-orders and one pre-order',
    description:
      'An index table in a rounded container: view tabs as small pills, search and sort at the right, two rows selected with bulk actions in the header, status badges with pips. Below, one pre-order: title with badges, a highlighted note, line items, a payment summary with a grey footer, and the customer and timeline on the right.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Set up a workshop',
    description:
      'A full page with no frame: a segmented step bar, a large medium-weight question, choice tiles with checkboxes (the chosen ones ringed in ink), two fields, then Back as a ghost pill and Next as the ink pill.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Workshop details',
    description:
      'Grouped settings links beside cards: label-and-value rows with a pencil button, an address with an Edit pill, selects in a grid, switches that take effect at once, and closing the workshop last with the red pill.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'No suppliers yet',
    description:
      'A two-line display heading (the section in ink, the line under it in grey), one sentence, the ink pill and a ghost Import, a small help line, and a faint outline of the list to come.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Plans',
    description:
      'The dark marketing site: a large light heading, a yearly switch in the leaf green, four plan cards with green taglines, prices at the top right, full-width outlined pills and hairline feature rows, then questions.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'A banner above the form listing what to fix, fields with a red border, a pink fill and an icon-led message, a warning banner with an action, a dark toast with Retry, and 404, 500 and 403 pages.',
    html: errors,
  },
];
