import type { ArchetypeRecipe } from '../types';

/*
 * Relay's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from an invented delivery service, "Larder". They follow
 * the language's real screen patterns: a white header with a Delivery / Pickup segmented pill, a
 * grey search pill and a red cart pill; a side nav whose current row is red on a red tint; round
 * grey category tiles; outlined filter chips that turn ink when chosen; image-led store cards
 * (name in bold, then rating, distance, time and fee in grey, then a red promo tag); section
 * headings with round grey arrow buttons; a store page with a sticky underline menu nav, dish rows
 * with round white add buttons and a cart drawer; and a live order card with a black stepper over
 * a map. Food photos are token gradients and shapes, the map is drawn in tokens, never tiles.
 */

// Lucide icons, outlined at 2px with round ends, like the reference's own outline set
const icon = (paths: string, size = 20, fill = false) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  menu: '<path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  user: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  left: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  sunrise: '<path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  sunset: '<path d="M12 10V2"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m16 6-4 4-4-4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  cookie: '<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/>',
  carrot: '<path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7zM8.64 14l-2.05-2.04M15.34 15l-2.46-2.46"/><path d="M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z"/><path d="M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.84 2-3.5C17 3.33 15 2 15 2z"/>',
  wine: '<path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  coffee: '<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',
  soup: '<path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M7 21h10"/><path d="M19.5 12 22 6"/><path d="M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62"/><path d="M11.25 3c.27.1.8.53.74 1.36-.05.83-.93 1.2-.98 2.02-.06.78.33 1.24.72 1.62"/><path d="M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.74 1.62"/>',
  salad: '<path d="M7 21h10"/><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1"/><path d="m13 12 4-4"/><path d="M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2"/>',
  iceCream: '<path d="m7 11 4.08 10.35a1 1 0 0 0 1.84 0L17 11"/><path d="M17 7A5 5 0 0 0 7 7"/><path d="M17 7a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  chef: '<path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"/><path d="M6 17h12"/>',
  store: '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  bike: '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  pencil:
    '<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/><path d="m15 5 4 4"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
  share: '<path d="M12 2v13"/><path d="m16 6-4-4-4 4"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>',
  sliders:
    '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
};
type IconName = keyof typeof I;

// Type: bold, dense, tracked slightly tight
const h = (size: string) =>
  `font-size: var(--m-font-size-${size}); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)`;
const bold = 'font-weight: var(--m-font-weight-bold)';
const medium = 'font-weight: var(--m-font-weight-medium)';
const meta = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
const figure = 'font-variant-numeric: tabular-nums';
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)';
const sm = 'font-size: var(--m-font-size-sm)';

// The mark: an ink wordmark beside a red rounded tile holding an unrelated glyph
const brand = (label = 'Larder') =>
  `<a href="#" class="m-cluster" data-gap="2" style="flex: none; color: var(--m-color-fg-default); text-decoration: none"><span class="m-cluster" data-justify="center" style="inline-size: 1.75rem; block-size: 1.75rem; border-radius: var(--m-radius-md); background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">${icon(I.chef, 18)}</span><span style="${h('xl')}">${label}</span></a>`;

// A filter chip: white with a hairline; the chosen one fills ink
const chip = (text: string, opts: { on?: boolean; lead?: IconName; caret?: boolean } = {}) =>
  `<button type="button" class="m-button" data-size="sm" aria-pressed="${opts.on ? 'true' : 'false'}" style="${sm}; ${opts.on ? 'background: var(--m-color-fg-default); color: var(--m-color-fg-inverse); border-color: var(--m-color-fg-default)' : 'background: var(--m-color-bg-surface); border-color: var(--m-color-border-default)'}">${opts.lead ? icon(I[opts.lead], 16) : ''}${text}${opts.caret ? icon(I.down, 16) : ''}</button>`;

// A round grey icon button (section arrows, quantity steps)
const roundBtn = (ic: IconName, labelText: string, size: 'sm' | 'md' = 'sm') =>
  `<button type="button" class="m-button" data-size="${size}" data-icon-only aria-label="${labelText}">${icon(I[ic], 18)}</button>`;

// The round white add button that floats on a photo
const addBtn = (labelText: string) =>
  `<button type="button" class="m-button" data-size="sm" data-icon-only aria-label="${labelText}" style="position: absolute; inset-inline-end: var(--m-space-2); inset-block-end: var(--m-space-2); background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-md)">${icon(I.plus, 18)}</button>`;

// A food photo is content, so it's drawn: a tinted table, a white plate with a dish and garnish on
// it, and a small side bowl
const tones = {
  saffron: ['warning-bg', 'warning-border', 'warning-solid', 'success-solid'],
  chilli: ['danger-bg', 'danger-border', 'accent-default', 'success-solid'],
  herb: ['success-bg', 'success-border', 'success-solid', 'warning-solid'],
  ocean: ['info-bg', 'info-border', 'info-solid', 'accent-default'],
  ember: ['danger-bg', 'warning-border', 'warning-solid', 'accent-default'],
} as const;
type Tone = keyof typeof tones;
const photo = (tone: Tone, ratio = '16 / 9', at = '62% 52%', more = '') => {
  const [a, b, dish, garnish] = tones[tone];
  const [x, y] = at.split(' ');
  const disc = (size: string, left: string, top: string, bg: string, shadow = '') =>
    `<span style="position: absolute; block-size: ${size}; aspect-ratio: 1; inset-inline-start: ${left}; inset-block-start: ${top}; transform: translate(-50%, -50%); border-radius: var(--m-radius-full); background: ${bg}${shadow}"></span>`;
  return `<div aria-hidden="true" style="position: relative; aspect-ratio: ${ratio}; border-radius: var(--m-radius-md); overflow: hidden; background: linear-gradient(135deg, var(--m-color-${a}), var(--m-color-${b}))${more}">${disc('34%', '16%', '30%', `radial-gradient(circle, var(--m-color-${b}) 0 52%, var(--m-color-bg-surface) 54%)`, '; box-shadow: var(--m-shadow-md)')}${disc('80%', x, y, 'var(--m-color-bg-surface)', '; box-shadow: var(--m-shadow-md)')}${disc('54%', x, y, `radial-gradient(circle at 32% 34%, var(--m-color-${garnish}) 0 10%, transparent 11%), radial-gradient(circle at 66% 64%, var(--m-color-${garnish}) 0 8%, transparent 9%), radial-gradient(circle at 64% 30%, var(--m-color-bg-surface) 0 9%, transparent 10%), radial-gradient(circle at 30% 70%, var(--m-color-${b}) 0 12%, transparent 13%), var(--m-color-${dish})`)}</div>`;
};

// The rating line: 4.7 ★ (1,200+) · 0.8 mi · 24 min
const rating = (r: string, n: string) =>
  `<span class="m-cluster" data-gap="1" style="display: inline-flex">${r} ${icon(I.star, 14, true)} (${n})</span>`;

// A store card: photo, then bold name, the grey meta lines and an optional promo tag
const storeCard = (
  name: string,
  tone: Tone,
  r: string,
  n: string,
  dist: string,
  time: string,
  fee: string,
  opts: { promo?: string; fav?: boolean; at?: string } = {},
) => `            <a href="#" class="m-stack" data-gap="2" style="color: inherit; text-decoration: none; min-inline-size: 0">
              ${photo(tone, '16 / 9', opts.at)}
              <span class="m-stack" data-gap="0">
                <span class="m-cluster" data-justify="between" style="flex-wrap: nowrap"><span style="${bold}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">${name}</span><span style="color: ${opts.fav ? 'var(--m-color-accent-default)' : 'var(--m-color-fg-muted)'}; display: inline-flex">${icon(I.heart, 18, opts.fav)}</span></span>
                <span class="m-cluster" data-gap="1" style="${meta}">${rating(r, n)} · ${dist} · ${time}</span>
                <span style="${meta}">${fee}</span>
              </span>
              ${opts.promo ? `<span><span class="m-badge" data-tone="danger">${opts.promo}</span></span>` : ''}
            </a>`;

// A section heading with the two round grey arrows on the right
const sectionHead = (id: string, title: string, sub = '') => `<div class="m-cluster" data-justify="between">
          <div class="m-stack" data-gap="0"><h2 id="${id}" style="${h('2xl')}">${title}</h2>${sub ? `<span style="${meta}">${sub}</span>` : ''}</div>
          <div class="m-cluster" data-gap="2" style="flex: none"><a href="#" class="m-button" data-variant="ghost" data-size="sm" style="${sm}">See all</a>${roundBtn('left', 'Previous')}${roundBtn('arrow', 'Next')}</div>
        </div>`;

// The header: menu, mark, Delivery / Pickup, the address, the search pill, alerts and the red cart pill
const appHeader = (count = 3) => `<header class="m-cluster" data-gap="3" style="padding: var(--m-space-3) var(--m-layout-container-padding); background: var(--m-color-bg-surface); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
    <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Menu">${icon(I.menu)}</button>
    ${brand()}
    <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="How you get it">
      <button type="button" class="m-tab" role="tab" aria-selected="true" style="${sm}">Delivery</button>
      <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1" style="${sm}">Pickup</button>
    </div></div>
    <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="${sm}">${icon(I.pin, 16)} 418 Quince Street ${icon(I.down, 16)}</button>
    <div style="position: relative; flex: 1 1 14rem; min-inline-size: 0">
      <label class="m-sr-only" for="rl-search">Search Larder</label>
      <span style="position: absolute; inset-inline-start: var(--m-space-4); inset-block: 0; display: inline-flex; align-items: center; color: var(--m-color-fg-muted)">${icon(I.search, 18)}</span>
      <input class="m-input" id="rl-search" type="search" placeholder="Search kitchens, dishes and markets" style="border-radius: var(--m-radius-full); padding-inline-start: var(--m-space-10)">
    </div>
    <div class="m-cluster" data-gap="2" style="flex: none">
      <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Alerts">${icon(I.bell)}</button>
      <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Account">${icon(I.user)}</button>
      <button type="button" class="m-button" data-variant="primary" aria-label="Cart, ${count} items">${icon(I.cart, 18)} ${count}</button>
    </div>
  </header>`;

// The side nav: by time of day, then markets, then what's yours. The current row is red on a tint
const sideNav = (current: string) => {
  const groups: [string, [IconName, string, string?][]][] = [
    [
      '',
      [
        ['sunrise', 'Morning'],
        ['sun', 'Midday'],
        ['sunset', 'Evening'],
        ['moon', 'After hours'],
      ],
    ],
    [
      'Markets',
      [
        ['cookie', 'Bakery'],
        ['carrot', 'Farm stand'],
        ['wine', 'Cellar'],
      ],
    ],
    [
      'Yours',
      [
        ['heart', 'Favourites'],
        ['receipt', 'Receipts', '1'],
        ['wallet', 'Wallet'],
      ],
    ],
  ];
  return `<nav class="m-sidebar" aria-label="Browse">
${groups
  .map(
    ([head, items]) => `    <div class="m-sidebar-group">
      ${head ? `<div class="m-sidebar-heading">${head}</div>` : ''}
      <ul class="m-sidebar-section">
${items.map(([ic, l, count]) => `        <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${icon(I[ic], 20)} ${l}${count ? ` <span class="m-sidebar-count">${count}</span>` : ''}</a></li>`).join('\n')}
      </ul>
    </div>`,
  )
  .join('\n')}
  </nav>`;
};

// The map is drawn in tokens: grey ground, white streets, a park and water, the route in ink,
// black round pins with white glyphs, and the courier as a red dot. Never real map tiles.
const map = (h2: string, label = 'Map: the courier between the kitchen and your door') => `<svg viewBox="0 0 600 360" width="100%" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}" style="display: block; block-size: ${h2}; border-radius: var(--m-radius-lg); background: var(--m-color-bg-sunken)">
          <path d="M420 0h180v120L500 160 420 90z" style="fill: var(--m-color-info-bg)"/>
          <path d="M40 250l110-20 30 90-120 30z" style="fill: var(--m-color-success-bg)"/>
          <g style="stroke: var(--m-color-bg-canvas)" fill="none" stroke-linecap="round">
            <path d="M0 90 600 60M0 200h600M0 300 600 330M110 0l40 360M300 0v360M470 0l-30 360" stroke-width="12"/>
            <path d="M0 140h600M0 250 600 262M210 0l14 360M390 0l20 360M550 0 540 360" stroke-width="5"/>
          </g>
          <path d="M150 300 L224 300 L224 200 L300 200 L300 128 L452 112" fill="none" style="stroke: var(--m-color-fg-default)" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
          <circle cx="300" cy="170" r="11" style="fill: var(--m-color-accent-default); stroke: var(--m-color-bg-canvas)" stroke-width="4"/>
          <g transform="translate(150 300)"><path d="M0 0v-18" style="stroke: var(--m-color-fg-default)" stroke-width="3"/><circle cy="-36" r="20" style="fill: var(--m-color-fg-default)"/><g transform="translate(-10 -46) scale(0.84)" fill="none" style="stroke: var(--m-color-bg-canvas)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${I.store}</g></g>
          <g transform="translate(452 112)"><path d="M0 0v-18" style="stroke: var(--m-color-fg-default)" stroke-width="3"/><circle cy="-36" r="20" style="fill: var(--m-color-fg-default)"/><g transform="translate(-10 -46) scale(0.84)" fill="none" style="stroke: var(--m-color-bg-canvas)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${I.home}</g></g>
        </svg>`;

// The order stepper: round stops joined by a track; done and current stops are ink with a white
// glyph, the rest pale grey with an ink glyph; the track fills ink up to the current stop
const stepper = (stops: [IconName, string][], current: number) => `<ol class="m-cluster" data-gap="0" aria-label="Order progress" style="list-style: none; margin: 0; padding: 0; flex-wrap: nowrap">
${stops
  .map(([ic, l], i) => {
    const done = i <= current;
    const stop = `<li style="flex: none" aria-label="${l}${i === current ? ', now' : done ? ', done' : ''}"${i === current ? ' aria-current="step"' : ''}><span class="m-cluster" data-justify="center" style="inline-size: 2.5rem; block-size: 2.5rem; border-radius: var(--m-radius-full); ${done ? 'background: var(--m-color-fg-default); color: var(--m-color-fg-inverse)' : 'background: var(--m-color-border-default); color: var(--m-color-fg-default)'}">${icon(I[ic], 18)}</span></li>`;
    const track =
      i < stops.length - 1
        ? `<li aria-hidden="true" style="flex: 1; block-size: 4px; border-radius: var(--m-radius-full); background: ${i < current ? 'var(--m-color-fg-default)' : `linear-gradient(90deg, var(--m-color-fg-default) ${i === current ? '45%' : '0'}, var(--m-color-border-default) 0)`}"></li>`
        : '';
    return `  ${stop}${track}`;
  })
  .join('\n')}
</ol>`;

const orderStops: [IconName, string][] = [
  ['receipt', 'Order placed'],
  ['chef', 'Being made'],
  ['bike', 'On the way'],
  ['home', 'At your door'],
];

// A round category tile with a glyph, label under it
const category = (ic: IconName, l: string, on = false) => `<a href="#" class="m-stack" data-gap="2" data-align="center" style="flex: none; inline-size: 4.5rem; color: inherit; text-decoration: none; ${sm}${on ? `; ${bold}` : ''}">
            <span class="m-cluster" data-justify="center" style="inline-size: 4rem; block-size: 4rem; border-radius: var(--m-radius-full); background: ${on ? 'var(--m-color-accent-subtle)' : 'var(--m-color-bg-sunken)'}; color: ${on ? 'var(--m-color-accent-text)' : 'var(--m-color-fg-default)'}">${icon(I[ic], 28)}</span>${l}
          </a>`;

// A grey promo panel: words on the left, a drawn picture on the right
const promo = (titleText: string, body: string, tone: Tone, at?: string) => `      <a href="#" class="m-cluster" data-gap="4" style="flex-wrap: nowrap; padding: var(--m-space-4); border-radius: var(--m-radius-lg); background: var(--m-color-bg-sunken); color: inherit; text-decoration: none">
        <span class="m-stack" data-gap="1" style="flex: 1; min-inline-size: 0"><span style="${h('lg')}">${titleText}</span><span style="${meta}">${body}</span></span>
        <span style="flex: none; inline-size: 7.5rem">${photo(tone, '1 / 1', at)}</span>
      </a>`;

const dashboard = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  ${appHeader()}
  <div class="m-split" style="--m-layout-split-gap: 0">
  ${sideNav('Evening')}
  <main class="m-stack" data-gap="10" style="padding: var(--m-space-6) var(--m-layout-container-padding) var(--m-space-16)">
    <!-- The live order: the stepper over its words, the map beside -->
    <section class="m-card" aria-labelledby="rl-live">
      <div class="m-card-body m-cluster" data-gap="6" data-align="start">
        <div class="m-stack" data-gap="4" style="flex: 1 1 20rem; min-inline-size: 0">
          <div class="m-stack" data-gap="1">
            <span style="${meta}">Copperpot Curry House · 3 items</span>
            <h2 id="rl-live" style="${h('2xl')}">Arriving 7:42 – 7:52 pm</h2>
          </div>
          ${stepper(orderStops, 1)}
          <p style="${sm}">Tomasz is picking up your order. We'll text you when he's 2 minutes away.</p>
          <div class="m-cluster" data-gap="2"><a href="#" class="m-button" data-size="sm">View order</a><a href="#" class="m-button" data-variant="ghost" data-size="sm">${icon(I.message, 16)} Message</a></div>
        </div>
        <div style="flex: 1 1 18rem; min-inline-size: 0">${map('13rem')}</div>
      </div>
    </section>
    <!-- Categories: round grey tiles in a strip -->
    <nav aria-label="Cuisines" style="overflow-x: auto"><div class="m-cluster" data-gap="4" style="flex-wrap: nowrap; padding-block-end: var(--m-space-1)">
          ${category('soup', 'Noodles')}
          ${category('flame', 'Curry', true)}
          ${category('salad', 'Bowls')}
          ${category('coffee', 'Coffee')}
          ${category('cookie', 'Sweets')}
          ${category('iceCream', 'Gelato')}
          ${category('leaf', 'Vegan')}
          ${category('wine', 'Drinks')}
    </div></nav>
    <!-- Filters: outlined pills; the chosen one fills ink -->
    <div class="m-cluster" data-gap="2" role="group" aria-label="Filters">${chip('Under 30 min', { lead: 'clock' })}${chip('Rated 4.5+', { lead: 'star', on: true })}${chip('No delivery fee', { lead: 'tag' })}${chip('Price', { caret: true })}${chip('Diet', { caret: true })}</div>
    <!-- Promos: a red brand band and two drawn panels -->
    <div class="m-grid" style="--m-layout-grid-min: 17rem">
      <a href="#" class="m-stack" data-gap="3" style="justify-content: space-between; padding: var(--m-space-5); border-radius: var(--m-radius-lg); background: var(--m-color-brand-default); color: var(--m-color-brand-fg); text-decoration: none">
        <span class="m-stack" data-gap="1"><span style="${h('xl')}">Half off your third order</span><span style="${sm}">Any kitchen, any night this week. Up to $12 off.</span></span>
        <span><span class="m-button" data-size="sm" style="background: var(--m-color-bg-surface); color: var(--m-color-fg-default)">See kitchens</span></span>
      </a>
${promo('Soup weather', 'Broths and ramen, hot in 25 min', 'saffron')}
${promo('Farm stand boxes', 'Seasonal produce from 4 growers', 'herb', '55% 50%')}
    </div>
    <!-- Store rows -->
    <section class="m-stack" data-gap="4" aria-labelledby="rl-fast">
      ${sectionHead('rl-fast', 'Fastest near you', 'Delivered in 25 min or less')}
      <div class="m-grid" style="--m-layout-grid-min: 14rem">
${storeCard('Copperpot Curry House', 'ember', '4.7', '1,800+', '0.6 mi', '18 min', '$0 delivery fee over $15', { promo: '20% off select dishes' })}
${storeCard('Little Orchid Noodle Bar', 'saffron', '4.8', '940+', '0.9 mi', '21 min', '$1.49 delivery fee', { fav: true, at: '40% 60%' })}
${storeCard('Golden Fig Taqueria', 'chilli', '4.6', '2,300+', '1.1 mi', '23 min', '$0.99 delivery fee')}
${storeCard('Mezze Corner', 'herb', '4.5', '610+', '1.4 mi', '25 min', '$0 delivery fee over $15', { promo: 'Free falafel over $25', at: '70% 50%' })}
      </div>
    </section>
    <section class="m-stack" data-gap="4" aria-labelledby="rl-loved">
      ${sectionHead('rl-loved', 'Most loved this week')}
      <div class="m-grid" style="--m-layout-grid-min: 14rem">
${storeCard('Nonna Rosa Trattoria', 'chilli', '4.9', '3,100+', '2.0 mi', '34 min', '$2.49 delivery fee', { at: '55% 45%' })}
${storeCard('Coral Poke Bar', 'ocean', '4.7', '780+', '1.7 mi', '29 min', '$0.99 delivery fee', { promo: '$5 off $30+' })}
${storeCard('Sunday Bagel Co.', 'saffron', '4.8', '1,200+', '0.8 mi', '20 min', '$0 delivery fee over $15', { at: '35% 55%' })}
${storeCard('Basil & Brine', 'herb', '4.6', '450+', '2.3 mi', '36 min', '$1.99 delivery fee', { fav: true })}
      </div>
    </section>
  </main>
  </div>
</div>`;

// Store page parts
const dish = (name: string, desc: string, price: string, tone: Tone, opts: { tag?: [string, string]; at?: string } = {}) => `            <article class="m-cluster" data-gap="4" data-align="start" style="flex-wrap: nowrap; padding: var(--m-space-4); border: var(--m-border-width-thin) solid var(--m-color-border-default); border-radius: var(--m-radius-lg)">
              <div class="m-stack" data-gap="1" style="flex: 1; min-inline-size: 0">
                <h4 style="${bold}">${name}</h4>
                <p style="${meta}; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden">${desc}</p>
                <span class="m-cluster" data-gap="2" style="${sm}"><span style="${figure}">${price}</span>${opts.tag ? `<span class="m-badge" data-tone="${opts.tag[0]}">${opts.tag[1]}</span>` : ''}</span>
              </div>
              <div style="position: relative; flex: none; inline-size: 7.5rem">${photo(tone, '1 / 1', opts.at)}${addBtn(`Add ${name}`)}</div>
            </article>`;

const cartLine = (qty: number, name: string, note: string, price: string, tone: Tone) => `          <li class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap; padding-block: var(--m-space-3); ${hair}">
            <div style="flex: none; inline-size: 3.5rem">${photo(tone, '1 / 1')}</div>
            <div class="m-stack" data-gap="1" style="flex: 1; min-inline-size: 0">
              <span style="${bold}; ${sm}">${name}</span>
              ${note ? `<span style="${meta}; font-size: var(--m-font-size-xs)">${note}</span>` : ''}
              <span style="${sm}; ${figure}">${price}</span>
            </div>
            <div class="m-cluster" data-gap="0" role="group" aria-label="Quantity of ${name}" style="flex: none; flex-wrap: nowrap; border-radius: var(--m-radius-full); background: var(--m-color-bg-sunken)">
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="One less">${icon(qty > 1 ? I.minus : I.x, 16)}</button>
              <span style="min-inline-size: 1.5rem; text-align: center; ${bold}; ${sm}">${qty}</span>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="One more">${icon(I.plus, 16)}</button>
            </div>
          </li>`;

const sum = (k: string, v: string, strong = false) =>
  `<div class="m-cluster" data-justify="between" style="${strong ? `${bold}` : sm}"><dt>${k}</dt><dd style="${figure}">${v}</dd></div>`;

const menuTabs = ['Most ordered', 'Small plates', 'Curries', 'From the tandoor', 'Rice and breads', 'Sides', 'Drinks'];

const listDetail = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  ${appHeader(4)}
  <div class="m-cluster" data-gap="8" data-align="start" style="padding: var(--m-space-6) var(--m-layout-container-padding) var(--m-space-16)">
    <main class="m-stack" data-gap="6" style="flex: 999 1 32rem; min-inline-size: 0">
      <!-- The store header: a drawn banner with floating round buttons -->
      <div style="position: relative">
        ${photo('ember', '21 / 6', '70% 55%', '; aspect-ratio: auto; block-size: clamp(9rem, 22vw, 15rem); border-radius: var(--m-radius-lg)')}
        <div class="m-cluster" data-gap="2" style="position: absolute; inset-block-start: var(--m-space-3); inset-inline-end: var(--m-space-3)">
          <button type="button" class="m-button" data-size="sm" data-icon-only aria-label="Save to favourites" style="background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-md)">${icon(I.heart, 18)}</button>
          <button type="button" class="m-button" data-size="sm" data-icon-only aria-label="Share" style="background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-md)">${icon(I.share, 18)}</button>
        </div>
      </div>
      <div class="m-cluster" data-justify="between" data-align="end" data-gap="4">
        <div class="m-stack" data-gap="1">
          <h1 style="${h('3xl')}">Copperpot Curry House</h1>
          <span class="m-cluster" data-gap="1" style="${meta}">${rating('4.7', '1,800+ ratings')} · North Indian · $$ · 0.6 mi</span>
        </div>
        <div class="m-cluster" data-gap="2">
          <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="How you get it">
            <button type="button" class="m-tab" role="tab" aria-selected="true">Delivery</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Pickup</button>
          </div></div>
          <button type="button" class="m-button">${icon(I.users, 18)} Order together</button>
        </div>
      </div>
      <!-- Fees and timing in one outlined strip -->
      <dl class="m-cluster" data-gap="0" style="border: var(--m-border-width-thin) solid var(--m-color-border-default); border-radius: var(--m-radius-lg)">
        <div class="m-stack" data-gap="0" style="flex: 1 1 10rem; padding: var(--m-space-3) var(--m-space-4)"><dt style="${bold}; ${figure}">$0.99 delivery fee</dt><dd class="m-cluster" data-gap="1" style="${meta}">Fees and pricing ${icon(I.info, 14)}</dd></div>
        <div class="m-stack" data-gap="0" style="flex: 1 1 10rem; padding: var(--m-space-3) var(--m-space-4); border-inline-start: var(--m-border-width-thin) solid var(--m-color-border-default)"><dt style="${bold}">18 – 26 min</dt><dd style="${meta}">Delivery time</dd></div>
        <div class="m-stack" data-gap="0" style="flex: 1 1 10rem; padding: var(--m-space-3) var(--m-space-4); border-inline-start: var(--m-border-width-thin) solid var(--m-color-border-default)"><dt style="${bold}">Open until 11:30 pm</dt><dd style="${meta}">Order ahead for later</dd></div>
      </dl>
      <!-- The menu nav sticks under the header; the current section is ink over a 2px bar -->
      <div class="m-cluster" data-gap="2" style="position: sticky; top: 0; z-index: var(--m-z-sticky); flex-wrap: nowrap; background: var(--m-color-bg-canvas)">
        <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="All menu sections">${icon(I.list)}</button>
        <div class="m-tabs" style="min-inline-size: 0; flex: 1"><div class="m-tab-list" role="tablist" aria-label="Menu">
${menuTabs.map((t, i) => `          <button type="button" class="m-tab" role="tab" aria-selected="${i === 0}"${i === 0 ? '' : ' tabindex="-1"'}>${t}</button>`).join('\n')}
        </div></div>
      </div>
      <section class="m-stack" data-gap="4" aria-labelledby="rl-most">
        <div class="m-stack" data-gap="0"><h3 id="rl-most" style="${h('2xl')}">Most ordered</h3><span style="${meta}">The dishes people here come back for</span></div>
        <div class="m-grid" style="--m-layout-grid-min: 21rem">
${dish('Butter paneer', 'Charred paneer in a slow tomato and fenugreek gravy, finished with cream.', '$15.50', 'saffron', { tag: ['danger', '#1 most liked'] })}
${dish('Lamb rogan josh', 'Kashmiri chilli, browned onions and yoghurt, cooked down for three hours.', '$18.25', 'ember', { at: '45% 55%' })}
${dish('Garlic naan', 'Blistered in the tandoor and brushed with garlic ghee and coriander.', '$3.75', 'saffron', { at: '50% 50%' })}
${dish('Chana chaat', 'Chickpeas, tamarind, mint chutney, crisp sev and pomegranate.', '$8.90', 'herb', { tag: ['success', 'Vegan'], at: '55% 60%' })}
        </div>
      </section>
      <section class="m-stack" data-gap="4" aria-labelledby="rl-small">
        <h3 id="rl-small" style="${h('2xl')}">Small plates</h3>
        <div class="m-grid" style="--m-layout-grid-min: 21rem">
${dish('Onion bhaji', 'Shredded onion and gram flour fritters with a green chilli dip.', '$6.50', 'saffron', { at: '40% 50%' })}
${dish('Tandoori broccoli', 'Whole florets in a mustard and yoghurt marinade, charred at the edges.', '$9.25', 'herb')}
        </div>
      </section>
    </main>
    <!-- The cart drawer: open beside the menu on wide screens -->
    <aside class="m-card" aria-labelledby="rl-cart" style="flex: 1 1 22rem; position: sticky; top: var(--m-space-4); box-shadow: var(--m-shadow-lg); border-color: transparent">
      <div class="m-card-body m-stack" data-gap="4">
        <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap">
          <div class="m-stack" data-gap="0"><h2 id="rl-cart" style="${h('xl')}">Your cart</h2><span style="${meta}">From Copperpot Curry House</span></div>
          <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Close cart">${icon(I.x)}</button>
        </div>
        <ul class="m-stack" data-gap="0" style="list-style: none; margin: 0; padding: 0">
${cartLine(2, 'Butter paneer', 'Medium heat', '$31.00', 'saffron')}
${cartLine(1, 'Garlic naan', '', '$3.75', 'saffron')}
${cartLine(1, 'Mango lassi', 'Less sugar', '$4.95', 'ember')}
        </ul>
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="align-self: start; ${sm}; color: var(--m-color-accent-text)">${icon(I.plus, 16)} Add more dishes</button>
        <dl class="m-stack" data-gap="2" style="${hair}; padding-block-start: var(--m-space-4)">
          ${sum('Subtotal', '$39.70')}
          ${sum('Delivery fee', '$0.99')}
          ${sum('Service fee', '$3.18')}
          ${sum('Total', '$43.87', true)}
        </dl>
        <a href="#" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Go to checkout</a>
      </div>
    </aside>
  </div>
</div>`;

// Onboarding: one narrow column, the stepper as progress, edged choice rows, toggle chips
const choice = (name: string, ic: IconName, titleText: string, body: string, on = false) => `          <label class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding: var(--m-space-4); border-radius: var(--m-radius-lg); cursor: pointer; box-shadow: inset 0 0 0 ${on ? '2px var(--m-color-fg-default)' : '1px var(--m-color-border-default)'}">
            <span class="m-cluster" data-justify="center" style="flex: none; inline-size: 2.5rem; block-size: 2.5rem; border-radius: var(--m-radius-full); background: var(--m-color-bg-sunken)">${icon(I[ic], 20)}</span>
            <span class="m-stack" data-gap="0" style="flex: 1"><span style="${bold}">${titleText}</span><span style="${meta}">${body}</span></span>
            <input class="m-radio" type="radio" name="${name}"${on ? ' checked' : ''}>
          </label>`;

const onboarding = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  <header class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-layout-container-padding); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
    ${brand()}
    <a href="#" class="m-button" data-variant="ghost" data-size="sm">Skip for now</a>
  </header>
  <main class="m-container" data-size="sm" style="padding-block: var(--m-space-10) var(--m-space-16)">
    <form class="m-stack" data-gap="8" aria-labelledby="rl-onb">
      ${stepper(
        [
          ['pin', 'Address'],
          ['home', 'Drop-off'],
          ['leaf', 'Diet'],
          ['check', 'Done'],
        ],
        1,
      )}
      <div class="m-stack" data-gap="2">
        <span style="${meta}">Step 2 of 4</span>
        <h1 id="rl-onb" style="${h('3xl')}">How should we hand it over?</h1>
        <p style="color: var(--m-color-fg-muted)">Couriers see this on every order to 418 Quince Street. You can change it at checkout.</p>
      </div>
      <fieldset class="m-stack" data-gap="3" style="border: 0; padding: 0; margin: 0">
        <legend class="m-sr-only">Drop-off</legend>
${choice('rl-drop', 'bag', 'Leave it at the door', 'We send a photo when it lands', true)}
${choice('rl-drop', 'users', 'Hand it to me', 'The courier knocks and waits')}
${choice('rl-drop', 'pin', 'Meet me outside', 'Best for buildings with a gate')}
      </fieldset>
      <div class="m-field">
        <label class="m-field-label" for="rl-onb-note">Notes for the courier</label>
        <textarea class="m-input" id="rl-onb-note" rows="3" placeholder="Gate code, which door, where to leave it">Blue door beside the bike rack. Code 4471.</textarea>
        <p class="m-field-hint">Only the courier on your order can read this.</p>
      </div>
      <div class="m-stack" data-gap="3">
        <span style="${bold}">Anything to avoid?</span>
        <div class="m-cluster" data-gap="2" role="group" aria-label="Dietary needs">${chip('Vegetarian', { on: true })}${chip('Vegan')}${chip('No peanuts', { on: true })}${chip('Gluten-free')}${chip('Halal')}${chip('Dairy-free')}</div>
      </div>
      <div class="m-stack" data-gap="2">
        <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Continue</button>
        <button type="button" class="m-button" data-variant="ghost" data-size="lg" style="inline-size: 100%">${icon(I.left, 18)} Back</button>
      </div>
    </form>
  </main>
</div>`;

// Settings: rows with a medium title over a grey value and a chevron, switches that act at once
const row = (titleText: string, value: string, trailing = icon(I.right, 18)) => `          <li><a href="#" class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding-block: var(--m-space-4); color: inherit; text-decoration: none; ${hair}">
            <span class="m-stack" data-gap="0"><span style="${medium}">${titleText}</span><span style="${meta}">${value}</span></span>
            <span style="flex: none; display: inline-flex; color: var(--m-color-fg-muted)">${trailing}</span>
          </a></li>`;
const toggle = (id: string, titleText: string, body: string, on: boolean) => `          <li class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding-block: var(--m-space-4); ${hair}">
            <label class="m-stack" data-gap="0" for="${id}"><span style="${medium}">${titleText}</span><span style="${meta}">${body}</span></label>
            <input class="m-switch" id="${id}" type="checkbox" role="switch"${on ? ' checked' : ''}>
          </li>`;
const appearance = (id: string, l: string, on = false) =>
  `<label class="m-cluster" data-gap="3" for="${id}" style="padding-block: var(--m-space-3); ${hair}"><input class="m-radio" type="radio" name="rl-look" id="${id}"${on ? ' checked' : ''}> ${l}</label>`;

const settingsNav = (current: string) => {
  const items: [IconName, string][] = [
    ['user', 'Profile'],
    ['users', 'Household'],
    ['leaf', 'Dietary needs'],
    ['wallet', 'Spending limits'],
    ['bell', 'Alerts'],
    ['mail', 'Email receipts'],
    ['help', 'Get help'],
  ];
  return `<nav class="m-sidebar" aria-label="Account">
    <div class="m-sidebar-group">
      <div class="m-sidebar-heading">Account</div>
      <ul class="m-sidebar-section">
${items.map(([ic, l]) => `        <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${icon(I[ic], 20)} ${l}</a></li>`).join('\n')}
      </ul>
    </div>
  </nav>`;
};

const settings = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  ${appHeader()}
  <div class="m-split" style="--m-layout-split-gap: 0">
  ${settingsNav('Profile')}
  <main style="padding: var(--m-space-8) var(--m-layout-container-padding) var(--m-space-16)">
    <div class="m-stack" data-gap="10" style="max-inline-size: var(--m-layout-container-max-md)">
      <div class="m-cluster" data-gap="4">
        <span class="m-avatar" data-size="lg" aria-hidden="true">PR</span>
        <div class="m-stack" data-gap="0" style="flex: 1"><h1 style="${h('3xl')}">Priya Raman</h1><span style="${meta}">Member since March · 46 orders</span></div>
        <button type="button" class="m-button">${icon(I.pencil, 16)} Edit profile</button>
      </div>
      <section class="m-stack" data-gap="1" aria-labelledby="rl-s-me">
        <h2 id="rl-s-me" style="${h('xl')}; padding-block-end: var(--m-space-2)">Your details</h2>
        <ul style="list-style: none; margin: 0; padding: 0">
${row('Mobile number', '(415) 555-0148 · verified')}
${row('Email', 'priya.raman@example.com')}
${row('Household', '2 people share this account')}
${row('Spending limit', '$150 a week, resets Mondays')}
${row('Saved cards', 'Card ending 6012 · default')}
        </ul>
      </section>
      <section class="m-stack" data-gap="1" aria-labelledby="rl-s-alerts">
        <h2 id="rl-s-alerts" style="${h('xl')}; padding-block-end: var(--m-space-2)">Alerts</h2>
        <ul style="list-style: none; margin: 0; padding: 0">
${toggle('rl-s-a1', 'Order updates', 'Texts when your order is picked up and two minutes away', true)}
${toggle('rl-s-a2', 'Reorder nudges', 'A reminder when a favourite dish is back on the menu', true)}
${toggle('rl-s-a3', 'Offers near you', 'Weekly deals from kitchens within 2 miles', false)}
        </ul>
      </section>
      <section class="m-stack" data-gap="1" aria-labelledby="rl-s-look">
        <h2 id="rl-s-look" style="${h('xl')}; padding-block-end: var(--m-space-2)">Appearance</h2>
        <fieldset class="m-stack" data-gap="0" style="border: 0; padding: 0; margin: 0">
          <legend class="m-sr-only">Appearance</legend>
          ${appearance('rl-look-1', 'Light')}
          ${appearance('rl-look-2', 'Dark')}
          ${appearance('rl-look-3', 'Match this device', true)}
        </fieldset>
      </section>
      <section class="m-stack" data-gap="3" aria-labelledby="rl-s-close" style="${hair}; padding-block-start: var(--m-space-6)">
        <h2 id="rl-s-close" style="${h('xl')}">Close account</h2>
        <p style="${meta}">Your receipts stay available for 90 days. Credits left in your wallet are refunded to card ending 6012.</p>
        <div><button type="button" class="m-button" data-variant="danger">Close account</button></div>
      </section>
    </div>
  </main>
  </div>
</div>`;

const emptyState = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  ${appHeader(0)}
  <div class="m-split" style="--m-layout-split-gap: 0">
  ${sideNav('Favourites')}
  <main class="m-stack" data-gap="10" style="padding: var(--m-space-8) var(--m-layout-container-padding) var(--m-space-16)">
    <h1 style="${h('3xl')}">Favourites</h1>
    <section class="m-stack" data-gap="4" data-align="center" aria-labelledby="rl-empty" style="text-align: center; padding-block: var(--m-space-12); max-inline-size: 28rem; margin-inline: auto">
      <span class="m-cluster" data-justify="center" style="inline-size: 6rem; block-size: 6rem; border-radius: var(--m-radius-full); background: var(--m-color-accent-subtle); color: var(--m-color-accent-text)">${icon(I.heart, 44)}</span>
      <h2 id="rl-empty" style="${h('2xl')}">No favourites yet</h2>
      <p style="color: var(--m-color-fg-muted)">Tap the heart on any kitchen or dish and it lands here, ready to reorder in two taps.</p>
      <div class="m-cluster" data-gap="2" data-justify="center"><a href="#" class="m-button" data-variant="primary">Find a kitchen</a><a href="#" class="m-button">Browse markets</a></div>
    </section>
    <section class="m-stack" data-gap="4" aria-labelledby="rl-try">
      ${sectionHead('rl-try', 'Popular with your neighbours')}
      <div class="m-grid" style="--m-layout-grid-min: 14rem">
${storeCard('Sunday Bagel Co.', 'saffron', '4.8', '1,200+', '0.8 mi', '20 min', '$0 delivery fee over $15', { at: '35% 55%' })}
${storeCard('Coral Poke Bar', 'ocean', '4.7', '780+', '1.7 mi', '29 min', '$0.99 delivery fee')}
${storeCard('Golden Fig Taqueria', 'chilli', '4.6', '2,300+', '1.1 mi', '23 min', '$0.99 delivery fee', { promo: '2 tacos free over $20' })}
      </div>
    </section>
  </main>
  </div>
</div>`;

// Pricing: the public header, a membership pitch beside the plan cards, then how it works and an FAQ
const perk = (text: string) =>
  `<li class="m-cluster" data-gap="2" data-align="start" style="flex-wrap: nowrap"><span style="flex: none; display: inline-flex; color: var(--m-color-accent-text)">${icon(I.check, 20)}</span><span>${text}</span></li>`;
// A plan card: a tinted head panel (grey, pink, or the brand red for the one to pick), then the perks
// and the price, then a pill
const heads = {
  grey: ['var(--m-color-bg-sunken)', 'var(--m-color-fg-default)', 'var(--m-color-accent-text)'],
  pink: ['var(--m-color-accent-subtle)', 'var(--m-color-fg-default)', 'var(--m-color-accent-text)'],
  red: ['var(--m-color-brand-default)', 'var(--m-color-brand-fg)', 'var(--m-color-brand-fg)'],
} as const;
const plan = (
  name: string,
  line: string,
  price: string,
  note: string,
  perks: string[],
  opts: { head: keyof typeof heads; badge?: string; cta: string },
) => {
  const [bg, fg, nameFg] = heads[opts.head];
  return `        <section class="m-card" aria-label="${name}" style="padding: var(--m-space-2)">
          <div class="m-stack" data-gap="5" style="block-size: 100%">
            <div class="m-stack" data-gap="3" style="padding: var(--m-space-5); border-radius: var(--m-radius-lg); background: ${bg}; color: ${fg}">
              <div class="m-cluster" data-justify="between"><h3 style="${h('2xl')}; color: ${nameFg}">${name}</h3>${opts.badge ? `<span class="m-badge" style="background: var(--m-color-bg-surface); color: var(--m-color-accent-text)">${opts.badge}</span>` : ''}</div>
              <p>${line}</p>
            </div>
            <div class="m-stack" data-gap="5" style="flex: 1; padding: 0 var(--m-space-4) var(--m-space-4)">
              <ul class="m-stack" data-gap="3" style="list-style: none; margin: 0; padding: 0; flex: 1; ${sm}">${perks.map(perk).join('')}</ul>
              <div class="m-stack" data-gap="1" style="${hair}; padding-block-start: var(--m-space-4)"><span class="m-cluster" data-gap="1" data-align="end"><span style="${h('3xl')}; ${figure}">${price}</span><span style="${meta}; padding-block-end: var(--m-space-1)">/ month</span></span><span style="${meta}">${note}</span></div>
              <a href="#" class="m-button" data-variant="${opts.head === 'red' ? 'primary' : 'secondary'}" data-size="lg" style="inline-size: 100%">${opts.cta}</a>
            </div>
          </div>
        </section>`;
};
const how = (ic: IconName, titleText: string, body: string) => `        <div class="m-stack" data-gap="3">
          <span class="m-cluster" data-justify="center" style="inline-size: 3rem; block-size: 3rem; border-radius: var(--m-radius-full); background: var(--m-color-accent-subtle); color: var(--m-color-accent-text)">${icon(I[ic], 24)}</span>
          <h3 style="${h('lg')}">${titleText}</h3>
          <p style="${meta}">${body}</p>
        </div>`;
const faq = (q: string, a: string, open = false) =>
  `        <details class="m-accordion-item"${open ? ' open' : ''}><summary>${q}</summary><div class="m-accordion-content"><p>${a}</p></div></details>`;

const pricing = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  <nav class="m-navbar" aria-label="Main">
    <span class="m-navbar-brand">${brand()}</span>
    <div class="m-navbar-nav">
      <a class="m-navbar-link" href="#">Kitchens</a>
      <a class="m-navbar-link" href="#">Markets</a>
      <a class="m-navbar-link" href="#" aria-current="page">Larder Plus</a>
      <a class="m-navbar-link" href="#">Gift cards</a>
    </div>
    <div class="m-navbar-actions">
      <a class="m-navbar-link" href="#">Sign in</a>
      <a class="m-button" data-variant="primary" href="#">Sign up</a>
    </div>
  </nav>
  <main>
    <section>
      <div class="m-container m-stack" data-gap="10" style="padding-block: var(--m-space-12)">
        <div class="m-stack" data-gap="4" data-align="center" style="text-align: center; max-inline-size: 40rem; margin-inline: auto">
          <span class="m-cluster" data-gap="2" style="padding: var(--m-space-1) var(--m-space-3); border: var(--m-border-width-thin) solid var(--m-color-danger-border); border-radius: var(--m-radius-full); ${sm}; ${bold}; color: var(--m-color-accent-text)">${icon(I.gift, 16)} Larder Plus</span>
          <h1 style="${h('4xl')}">Free delivery, lower fees, every night of the week</h1>
          <p style="font-size: var(--m-font-size-lg); color: var(--m-color-fg-muted)">$0 delivery fees on orders over $15 from thousands of kitchens and markets. Cancel any time.</p>
          <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Billing">
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Monthly</button>
            <button type="button" class="m-tab" role="tab" aria-selected="true">Yearly</button>
          </div></div>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 17rem; --m-layout-grid-gap: var(--m-space-5)">
${plan('Solo', 'Lower fees for one', '$6.99', 'Billed $83.88 a year', ['$0 delivery fee on orders over $15', 'Service fees cut by a third', 'Members-only dishes each week'], { head: 'grey', cta: 'Choose Solo' })}
${plan('Student', 'Late nights, small prices', '$3.49', 'With a valid student email', ['$0 delivery fee on orders over $15', 'Late-night kitchens till 3 am', 'Pause during holidays'], { head: 'pink', cta: 'Check eligibility' })}
${plan('Household', 'One plan for everyone at home', '$9.99', 'Billed $119.88 a year · up to 4 people', ['Everything in Solo, for everyone at home', 'One shared cart and one bill', 'Spending limits for each person', 'Priority help in under 2 minutes'], { head: 'red', badge: 'Most chosen', cta: 'Start 30 days free' })}
        </div>
      </div>
    </section>
    <section class="m-container m-stack" data-gap="8" style="padding-block: var(--m-space-16)" aria-labelledby="rl-how">
      <h2 id="rl-how" style="${h('3xl')}">How it pays for itself</h2>
      <div class="m-grid" style="--m-layout-grid-min: 15rem; --m-layout-grid-gap: var(--m-space-8)">
${how('tag', 'Two orders a month', 'At an average $3.40 delivery fee, the plan is covered by the second order.')}
${how('percent', 'Smaller service fees', 'Members pay 6% instead of 9% on every order, applied before tip.')}
${how('users', 'One plan for the flat', 'Add up to three people. Each gets their own receipts and limits.')}
      </div>
    </section>
    <section class="m-container m-stack" data-gap="4" style="padding-block-end: var(--m-space-16)" aria-labelledby="rl-faq">
      <h2 id="rl-faq" style="${h('2xl')}">Questions</h2>
      <div class="m-accordion" style="max-inline-size: var(--m-layout-container-max-md)">
${faq('Which orders get free delivery?', 'Any order over $15 before fees and tip, from kitchens and markets that show the member tag. Small-order fees still apply under $15.', true)}
${faq('Can I switch plans?', 'Yes. Changes start on your next billing date, and any difference is prorated to the day.')}
${faq('What happens if I cancel?', 'Benefits run until the end of the period you paid for. Nothing is charged after that.')}
      </div>
    </section>
  </main>
</div>`;

// Errors: fields, the form banner, the snackbar and three full pages
const errorPage = (code: string, ic: IconName, titleText: string, body: string, actions: string) => `      <section class="m-stack" data-gap="4" data-align="center" aria-label="Error ${code}" style="text-align: center; padding: var(--m-space-12) var(--m-space-6); border: var(--m-border-width-thin) solid var(--m-color-border-default); border-radius: var(--m-radius-lg)">
        <span class="m-cluster" data-justify="center" style="inline-size: 5rem; block-size: 5rem; border-radius: var(--m-radius-full); background: var(--m-color-bg-sunken)">${icon(I[ic], 36)}</span>
        <span style="${meta}; ${bold}">Error ${code}</span>
        <h2 style="${h('2xl')}">${titleText}</h2>
        <p style="color: var(--m-color-fg-muted); max-inline-size: 26rem">${body}</p>
        <div class="m-cluster" data-gap="2" data-justify="center">${actions}</div>
      </section>`;

const errors = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  ${appHeader()}
  <main class="m-container m-stack" data-gap="12" style="padding-block: var(--m-space-8) var(--m-space-16)">
    <div class="m-cluster" data-gap="8" data-align="start">
      <form class="m-stack" data-gap="5" aria-labelledby="rl-err-pay" style="flex: 1 1 24rem; min-inline-size: 0" novalidate>
        <h1 id="rl-err-pay" style="${h('3xl')}">Checkout</h1>
        <div class="m-alert" data-tone="danger" role="alert">
          <span class="m-alert-icon">${icon(I.alert, 20)}</span>
          <div class="m-alert-content"><div class="m-alert-title">We couldn't place your order</div><div class="m-alert-body">Check the 2 details below. Nothing has been charged.</div></div>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="rl-err-apt">Apartment or unit</label>
          <input class="m-input" id="rl-err-apt" value="" placeholder="Unit, floor or building" aria-invalid="true" aria-describedby="rl-err-apt-e">
          <p class="m-field-error" id="rl-err-apt-e">Add a unit number. This address has 24 apartments.</p>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="rl-err-card">Card number</label>
          <input class="m-input" id="rl-err-card" value="4000 1234 5678" inputmode="numeric" aria-invalid="true" aria-describedby="rl-err-card-e" style="${figure}">
          <p class="m-field-error" id="rl-err-card-e">That number is 4 digits short. Check the front of the card.</p>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="rl-err-tip">Courier tip</label>
          <select class="m-select" id="rl-err-tip"><option>$3.00</option><option selected>$4.00</option><option>$5.00</option><option>Other</option></select>
          <p class="m-field-hint">100% of the tip goes to Tomasz.</p>
        </div>
        <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Place order · $47.87</button>
      </form>
      <div class="m-stack" data-gap="4" style="flex: 1 1 20rem; min-inline-size: 0">
        <div class="m-alert" data-tone="warning" role="status">
          <span class="m-alert-icon">${icon(I.clock, 20)}</span>
          <div class="m-alert-content"><div class="m-alert-title">Busier than usual</div><div class="m-alert-body">Copperpot is running about 10 minutes behind. Your arrival time already includes it.</div></div>
        </div>
        <div class="m-toast" role="status" style="position: static; max-inline-size: 100%">
          <div class="m-toast-content"><div class="m-toast-title">Sunday Bagel Co. just closed</div><div class="m-toast-body">We kept your cart. Similar kitchens are still open.</div></div>
          <div class="m-toast-actions"><button type="button" class="m-button" data-size="sm" style="background: var(--m-color-bg-surface); color: var(--m-color-fg-default)">Show similar</button></div>
        </div>
      </div>
    </div>
    <div class="m-grid" style="--m-layout-grid-min: 18rem">
${errorPage('404', 'search', 'This page went cold', 'The link may be old, or the kitchen has moved. Start again from your home feed.', `<a class="m-button" data-variant="primary" href="#">Back to home</a>`)}
${errorPage('500', 'chef', 'Our kitchen hit a snag', "It's on our side. Your cart is safe and nothing was charged. Try again in a minute.", `<button type="button" class="m-button" data-variant="primary">${icon(I.refresh, 18)} Try again</button>`)}
${errorPage('403', 'lock', 'This receipt is on another account', 'Sign in with the account that placed the order, or ask its owner to forward the receipt.', `<a class="m-button" data-variant="primary" href="#">Switch account</a><a class="m-button" href="#">Get help</a>`)}
    </div>
  </main>
</div>`;

export const relayRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'The home feed: header with Delivery / Pickup, a search pill and the red cart pill; a side nav with a red current row; a live order card with the black stepper and a drawn map; round category tiles, outlined filter chips, a red promo band and rows of image-led store cards.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'The store page: a drawn banner with floating round buttons, a bold name over the rating line, an outlined fees strip, a sticky underline menu nav, dish rows with round white add buttons on the photo, and the cart drawer with quantity pills and a red checkout.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One narrow column: the order stepper as progress, a bold question, drop-off choices as edged rows (the chosen one in a 2px ink edge), a grey note field, toggle chips and a full-width red Continue.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'An account side nav, the profile with a large avatar, rows with a medium title over a grey value and a chevron, alerts as switches, appearance as radios, and closing the account last.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'A 96px heart on the red tint, a bold heading, one sentence, a red and a grey pill, then store cards to start from.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The white public header, a warm brand panel with the membership pitch beside a Monthly / Yearly pill switch, three plan cards (the picked one in a 2px ink edge with a red tag and the red button), then how it pays and an FAQ.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Red-edged fields with the fix underneath, a tinted banner that says nothing was charged, a warning banner, a near-black snackbar with one pill action, and centred cards for 404, 500 and no access.',
    html: errors,
  },
];
