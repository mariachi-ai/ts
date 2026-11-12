import type { ArchetypeRecipe } from '../types';

/*
 * Cadence's seven page shapes: framework-free HTML using only @mariachi/design classes and tokens (no
 * colour literals), with sample data from a made-up listening app, "Wavelet". They follow the
 * language's real screen patterns: near-black 8px panels in a black frame with a top bar and a
 * now-playing bar, cover-art tiles (token gradients stand in for real art), huge bold titles over a
 * colour wash, dense track lists without rules, a green round play button, white and outlined pills.
 * Every name, number, label and nav item is invented.
 */

// Lucide icons, outlined at 2px (the reference's glyphs are bold); a few are filled, as the
// reference fills play, pause and the current nav item
const icon = (paths: string, size = 16, filled = false) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  library: '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  heart:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  saved: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  addCircle: '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>',
  shuffle:
    '<path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"/><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"/><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/>',
  back: '<path d="M19 20 9 12l10-8z"/><path d="M5 19V5"/>',
  next: '<path d="m5 4 10 8-10 8z"/><path d="M19 5v14"/>',
  play: '<path d="M6 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L7.5 3.64A1 1 0 0 0 6 4.5z"/>',
  pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  lyrics:
    '<path d="m11 7.601-5.994 8.19a1 1 0 0 0 .1 1.298l.817.818a1 1 0 0 0 1.314.087L15.09 12"/><path d="M16.5 21.174C15.5 20.5 14.372 20 13 20c-2.058 0-3.928 2.356-6 2-2.072-.356-2.775-3.369-1.5-4.5"/><circle cx="16" cy="7" r="5"/>',
  queue: '<path d="M21 15V6"/><path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/><path d="M12 12H3"/><path d="M16 6H3"/><path d="M12 18H3"/>',
  speaker: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M12 6h.01"/><circle cx="12" cy="14" r="4"/><path d="M12 14h.01"/>',
  volume:
    '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>',
  expand: '<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  bars: '<path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
  radio:
    '<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>',
  disc: '<circle cx="12" cy="12" r="10"/><path d="M6 12c0-1.7.7-3.2 1.8-4.2"/><circle cx="12" cy="12" r="2"/><path d="M18 12c0 1.7-.7 3.2-1.8 4.2"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
  headphones:
    '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  cloudOff:
    '<path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193"/><path d="M21.532 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.008 7.008 0 0 0 10 5.07"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
};

// Text styles (the published scale): 96/800 page titles, 48 and 32 bold headings, 24 shelf titles
const hero =
  'font-family: var(--m-font-family-display); font-size: clamp(2.5rem, 5.5vw, var(--m-font-size-4xl)); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: 1.05';
const h1 = 'font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-semibold)';
const shelf = 'font-family: var(--m-font-family-display); font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold)';
const bold = 'font-weight: var(--m-font-weight-semibold)';
// A bold 16px title in the text face (group titles, card titles)
const title16 = 'font-family: var(--m-font-family-sans); font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-semibold); letter-spacing: 0';
const small = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
const tiny = 'font-size: var(--m-font-size-xs); color: var(--m-color-fg-muted)';
const nums = 'font-variant-numeric: tabular-nums';
const clip = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis';

// Pill treatments drawn with the button's own tokens: the white (inverted) pill, the highlight-grey
// pill, the filter chip and the round icon button on grey
// Medium (48px) pills set their label at 16px, as the reference does; small ones stay 14px
const big = '--m-button-font-size: var(--m-font-size-md)';
const whitePill =
  '--m-button-primary-bg: var(--m-color-bg-inverse); --m-button-primary-border: var(--m-color-bg-inverse); --m-button-primary-fg: var(--m-color-fg-inverse); --m-button-primary-hover-bg: var(--m-color-bg-inverse); --m-button-primary-active-bg: var(--m-color-bg-inverse)';
const greyPill =
  '--m-button-secondary-bg: var(--m-color-bg-surface); --m-button-secondary-border: var(--m-color-bg-surface); --m-button-secondary-hover-bg: var(--m-color-border-default); --m-button-secondary-active-bg: var(--m-color-border-default)';
const chipVars = `${greyPill}; --m-button-font-weight: var(--m-font-weight-regular); --m-button-hover-transform: none; --m-button-padding-x-sm: var(--m-space-3)`;
const chipOnVars =
  '--m-button-secondary-bg: var(--m-color-bg-inverse); --m-button-secondary-border: var(--m-color-bg-inverse); --m-button-secondary-fg: var(--m-color-fg-inverse); --m-button-secondary-hover-bg: var(--m-color-bg-inverse); --m-button-font-weight: var(--m-font-weight-regular); --m-button-hover-transform: none; --m-button-padding-x-sm: var(--m-space-3)';
const chip = (label: string, on = false) =>
  `<button type="button" class="m-button" data-size="sm" aria-pressed="${on}" style="${on ? chipOnVars : chipVars}">${label}</button>`;
const roundGrey = (label: string, ic: string, size = 16) =>
  `<button type="button" class="m-button" data-icon-only aria-label="${label}" style="${greyPill}; --m-button-secondary-fg: var(--m-color-fg-muted); flex: none">${icon(ic, size)}</button>`;
const iconBtn = (label: string, ic: string, size = 16, extra = '') =>
  `<button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="${label}"${extra}>${icon(ic, size)}</button>`;
// The green round play button (56px on a page, 48 on a hovered card)
const playBig = (label: string, size = '3.5rem') =>
  `<button type="button" class="m-button" data-variant="primary" data-icon-only aria-label="${label}" style="inline-size: ${size}; block-size: ${size}; padding: 0">${icon(I.play, 22, true)}</button>`;

// Cover art stands in as token gradients with a glyph: no real art ships
const grads = [
  'var(--m-color-brand-default), var(--m-color-info-solid)',
  'var(--m-color-danger-solid), var(--m-color-warning-solid)',
  'var(--m-color-info-solid), var(--m-color-brand-subtle)',
  'var(--m-color-warning-solid), var(--m-color-danger-bg)',
  'var(--m-color-info-bg), var(--m-color-info-solid)',
  'var(--m-color-brand-subtle), var(--m-color-brand-default)',
  'var(--m-color-danger-bg), var(--m-color-info-solid)',
  'var(--m-color-warning-bg), var(--m-color-brand-default)',
];
const art = (n: number, size: string, glyph: string, round = false, radius = 'var(--m-radius-sm)') =>
  `<span aria-hidden="true" style="display: inline-grid; place-items: center; flex: none; inline-size: ${size}; block-size: ${size}; border-radius: ${round ? '50%' : radius}; background: linear-gradient(135deg, ${grads[n % grads.length]}); color: var(--m-color-brand-fg)">${icon(glyph, 18)}</span>`;
const artFill = (n: number, glyph: string, round = false, glyphSize = 40) =>
  `<span aria-hidden="true" style="display: grid; place-items: center; aspect-ratio: 1; border-radius: ${round ? '50%' : 'var(--m-radius-md)'}; background: linear-gradient(135deg, ${grads[n % grads.length]}); color: var(--m-color-brand-fg); box-shadow: var(--m-shadow-lg)">${icon(glyph, glyphSize)}</span>`;

// The app's own mark: a green disc with sound bars (invented; no real logo)
const mark = (size = '2rem') =>
  `<span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: ${size}; block-size: ${size}; border-radius: 50%; background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">${icon(I.bars, 18)}</span>`;

// The top bar: the mark, a round "Discover" button, the round search field, and on the right a white
// pill, a bell, people and the avatar
const topBar = `  <header class="m-cluster" data-justify="between" style="min-block-size: 4rem; padding-inline: var(--m-space-2); flex-wrap: nowrap">
    <div class="m-cluster" data-gap="2" style="flex: 1; flex-wrap: nowrap; min-inline-size: 0">
      <a href="#" aria-label="Wavelet" style="display: inline-flex; margin-inline: var(--m-space-2)">${mark()}</a>
      ${roundGrey('Discover', I.compass, 24).replace('data-icon-only', 'data-icon-only data-size="lg"')}
      <div role="search" class="m-cluster" data-gap="3" style="flex: 0 1 30rem; min-inline-size: 0; block-size: 3rem; padding-inline: var(--m-space-3) var(--m-space-4); border-radius: 9999px; background: var(--m-color-bg-surface); color: var(--m-color-fg-muted); flex-wrap: nowrap">${icon(I.search, 24)}<span style="${clip}">Search songs, performers, shows</span></div>
    </div>
    <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap">
      <a class="m-button" data-variant="primary" data-size="sm" href="#" style="${whitePill}">Try Plus</a>
      ${iconBtn('What’s new', I.bell)}
      ${iconBtn('Listening with friends', I.users)}
      <span class="m-avatar" data-size="md" aria-label="Rosa Lindqvist" style="box-shadow: 0 0 0 var(--m-space-2) var(--m-color-bg-surface)">RL</span>
    </div>
  </header>`;

// The collection panel: our own sections (chips, sort, rows with art), the reference's treatment
const libRow = (n: number, glyph: string, title: string, meta: string, current = false, round = false, pinned = false, playing = false) =>
  `        <li><a class="m-sidebar-link" href="#"${current ? ' aria-current="page"' : ''} style="gap: var(--m-space-3)">${art(n, '3rem', glyph, round)}<span class="m-stack" data-gap="0" style="min-inline-size: 0"><span style="${clip}${playing ? '; color: var(--m-color-accent-text)' : ''}">${title}</span><span class="m-cluster" data-gap="1" style="${small}; flex-wrap: nowrap">${pinned ? `<span style="color: var(--m-color-accent-text); display: inline-flex">${icon(I.pin, 12, true)}</span>` : ''}<span style="${clip}">${meta}</span></span></span>${playing ? `<span style="margin-inline-start: auto; color: var(--m-color-accent-text); display: inline-flex">${icon(I.volume, 14)}</span>` : ''}</a></li>`;

const library = (current: string) => {
  const rows: [number, string, string, string, boolean?, boolean?, boolean?][] = [
    [5, I.bookmark, 'Kept for later', 'Mix · 212 tracks', false, false, true],
    [0, I.music, 'Slow Coffee', 'Mix · Rosa Lindqvist'],
    [2, I.mic, 'Mara Solene', 'Performer', true],
    [3, I.radio, 'The Long Table', 'Show · Fieldnotes Audio'],
    [1, I.disc, 'Signals at Dusk', 'Record · Pale Harbour'],
    [4, I.music, 'Rain on Tin', 'Mix · Wavelet'],
    [6, I.mic, 'Kofi Amankwah', 'Performer', true],
    [7, I.disc, 'Night Orchard', 'Record · Night Orchard'],
  ];
  return `  <nav class="m-sidebar" aria-label="Collection" style="inline-size: auto; border-radius: var(--m-radius-lg); gap: var(--m-space-3)">
    <div class="m-cluster" data-justify="between" style="padding: var(--m-space-2) var(--m-space-2) 0">
      <h2 class="m-sidebar-heading" style="padding: 0">Collection</h2>
      <div class="m-cluster" data-gap="1">
        <button type="button" class="m-button" data-size="sm" style="${greyPill}">${icon(I.plus, 16)} New</button>
        ${iconBtn('Widen the panel', I.arrowRight)}
      </div>
    </div>
    <div class="m-cluster" data-gap="2" role="group" aria-label="Show" style="padding-inline: var(--m-space-2); flex-wrap: nowrap; overflow: hidden">
      ${chip('Mixes')}${chip('Shows')}${chip('Performers')}${chip('Saved')}
    </div>
    <div class="m-cluster" data-justify="between" style="padding-inline: var(--m-space-1)">
      ${iconBtn('Search the collection', I.search)}
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="--m-button-font-weight: var(--m-font-weight-regular)">Latest added ${icon(I.list, 16)}</button>
    </div>
    <div class="m-sidebar-section">
      <ul>
${rows.map(([n, g, t, m, round, pinned]) => libRow(n, g, t, m, t === current, round, pinned, t === 'Slow Coffee')).join('\n')}
      </ul>
    </div>
  </nav>`;
};

// The now-playing bar: the track, the transport with its scrubber, and device controls
const nowPlaying = `  <footer class="m-cluster" data-justify="between" aria-label="Now playing" style="min-block-size: 4.5rem; padding: var(--m-space-2); flex-wrap: nowrap; gap: var(--m-space-4)">
    <div class="m-cluster" data-gap="3" style="flex: 1 1 0; min-inline-size: 0; flex-wrap: nowrap">
      ${art(0, '3.5rem', I.music)}
      <div class="m-stack" data-gap="0" style="min-inline-size: 0"><a href="#" style="color: var(--m-color-fg-default); text-decoration: none; font-size: var(--m-font-size-sm); ${clip}">Paper Lanterns</a><span style="${tiny}; ${clip}">Mara Solene</span></div>
      <span style="color: var(--m-color-accent-default); display: inline-flex" aria-label="In your collection">${icon(I.saved, 16)}</span>
    </div>
    <div class="m-stack" data-gap="1" data-align="center" style="flex: 2 1 0; max-inline-size: 45rem">
      <div class="m-cluster" data-gap="4" data-justify="center">
        ${iconBtn('Shuffle is on', I.shuffle, 16, ' aria-pressed="true" style="--m-button-ghost-fg: var(--m-color-accent-text)"')}
        ${iconBtn('Previous', I.back, 16)}
        <button type="button" class="m-button" data-variant="primary" data-size="sm" data-icon-only aria-label="Pause" style="${whitePill}">${icon(I.pause, 16, true)}</button>
        ${iconBtn('Next', I.next, 16)}
        ${iconBtn('Repeat', I.repeat, 16)}
      </div>
      <div class="m-cluster" data-gap="2" style="inline-size: 100%; flex-wrap: nowrap; ${tiny}; ${nums}">
        <span>1:12</span>
        <progress class="m-progress" data-size="sm" value="31" max="100" aria-label="Position: 1:12 of 3:54" style="flex: 1; --m-progress-fill: var(--m-color-fg-default)">31%</progress>
        <span>3:54</span>
      </div>
    </div>
    <div class="m-cluster" data-gap="1" data-justify="end" style="flex: 1 1 0; flex-wrap: nowrap">
      ${iconBtn('Lyrics', I.lyrics)}${iconBtn('Up next', I.queue)}${iconBtn('Play on a speaker', I.speaker)}${iconBtn('Volume', I.volume)}
      <progress class="m-progress" data-size="sm" value="70" max="100" aria-label="Volume 70%" style="inline-size: 5.5rem; --m-progress-fill: var(--m-color-fg-default)">70%</progress>
      ${iconBtn('Full screen', I.expand)}
    </div>
  </footer>`;

const panel = 'background: var(--m-color-bg-canvas); border-radius: var(--m-radius-lg); overflow: hidden; min-inline-size: 0';
const shell = (current: string, main: string, aside = '') => `<div class="m-stack" data-gap="0" style="min-block-size: 100vh; background: var(--m-color-bg-sunken); padding-inline: var(--m-space-2)">
${topBar}
  <div class="m-split" style="--m-layout-split-side: 21rem; --m-layout-split-gap: var(--m-space-2); flex: 1">
${library(current)}
    <div style="display: flex; flex-wrap: wrap; gap: var(--m-space-2); align-items: stretch">
      <main style="${panel}; flex: 999 1 32rem">
${main}
      </main>${aside}
    </div>
  </div>
${nowPlaying}
</div>`;

// A shortcut tile: art flush left, a bold title, the tint behind (the reference's top-of-home grid)
const shortcut = (n: number, glyph: string, title: string, playing = false) =>
  `<a href="#" class="m-cluster" data-gap="3" style="flex-wrap: nowrap; background: var(--m-color-bg-surface); border-radius: var(--m-radius-sm); overflow: hidden; color: var(--m-color-fg-default); text-decoration: none; ${bold}; font-size: var(--m-font-size-sm); padding-inline-end: var(--m-space-3)">${art(n, '4rem', glyph, false, '0')}<span style="${clip}; flex: 1">${title}</span>${playing ? `<span style="color: var(--m-color-accent-text); display: inline-flex">${icon(I.bars, 16)}</span>` : ''}</a>`;

// A shelf card: square art (round for a person), a title and two subdued lines; the hovered one shows
// the highlight behind it and the green play button risen onto the art
const card = (n: number, glyph: string, title: string, sub: string, opts: { round?: boolean; hover?: boolean } = {}) =>
  `<a href="#" class="m-stack" data-gap="2" style="padding: var(--m-space-3); border-radius: var(--m-radius-md); color: var(--m-color-fg-default); text-decoration: none; min-inline-size: 0${opts.hover ? '; background: var(--m-color-bg-surface)' : ''}">
              <span style="position: relative; display: block">${artFill(n, glyph, opts.round)}${opts.hover ? `<span style="position: absolute; inset-block-end: var(--m-space-2); inset-inline-end: var(--m-space-2); border-radius: 50%; box-shadow: var(--m-shadow-md)">${playBig(`Play ${title}`, '3rem')}</span>` : ''}</span>
              <span class="m-stack" data-gap="1"><span style="${clip}">${title}</span><span style="${small}; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden">${sub}</span></span>
            </a>`;

const shelfHead = (id: string, title: string) =>
  `<div class="m-cluster" data-justify="between" style="padding-inline: var(--m-space-3)"><h2 id="${id}" style="${shelf}"><a href="#" style="color: inherit; text-decoration: none">${title}</a></h2><a href="#" style="${small}; ${bold}; text-decoration: none">See everything</a></div>`;

const dashboard = shell(
  'Mara Solene',
  `        <div class="m-stack" data-gap="8" style="padding: var(--m-space-4) var(--m-space-6) var(--m-space-10); background: linear-gradient(to bottom, var(--m-color-brand-subtle), var(--m-color-bg-canvas) 16rem)">
          <div class="m-cluster" data-gap="2" role="group" aria-label="Show">${chip('Everything', true)}${chip('Songs')}${chip('Talk')}${chip('Live')}</div>
          <section class="m-stack" data-gap="4" aria-labelledby="en-tonight">
            <h1 id="en-tonight" style="${h1}">Evening, Rosa</h1>
            <div class="m-grid" style="--m-layout-grid-min: 12rem; --m-layout-grid-gap: var(--m-space-2)">
              ${shortcut(0, I.music, 'Slow Coffee', true)}
              ${shortcut(5, I.bookmark, 'Kept for later')}
              ${shortcut(3, I.radio, 'The Long Table')}
              ${shortcut(1, I.disc, 'Signals at Dusk')}
              ${shortcut(2, I.mic, 'Mara Solene radio')}
              ${shortcut(4, I.music, 'Rain on Tin')}
              ${shortcut(6, I.headphones, 'Sunday Workbench')}
              ${shortcut(7, I.music, 'Night Drive Signals')}
            </div>
          </section>
          <section class="m-stack" data-gap="2" aria-labelledby="en-picked">
            ${shelfHead('en-picked', 'Picked for tonight')}
            <div class="m-grid" style="--m-layout-grid-min: 10.5rem; --m-layout-grid-gap: 0">
            ${card(2, I.music, 'Low Light Mix', 'Pale Harbour, Ivy Calder, Night Orchard and more')}
            ${card(1, I.music, 'Brass and Rain', 'Kofi Amankwah, The Quiet Ferns and more', { hover: true })}
            ${card(4, I.music, 'Fresh This Week', 'New songs from performers you follow')}
            ${card(6, I.music, 'Kitchen Radio', 'Warm records for long dinners')}
            ${card(3, I.music, 'Halfway Home', 'Calder, Solene, Amankwah and more')}
            </div>
          </section>
          <section class="m-stack" data-gap="2" aria-labelledby="en-return">
            ${shelfHead('en-return', 'Performers you return to')}
            <div class="m-grid" style="--m-layout-grid-min: 10.5rem; --m-layout-grid-gap: 0">
            ${card(2, I.mic, 'Mara Solene', 'Performer', { round: true })}
            ${card(0, I.mic, 'Ivy Calder', 'Performer', { round: true })}
            ${card(7, I.mic, 'The Quiet Ferns', 'Performer', { round: true })}
            ${card(5, I.mic, 'Kofi Amankwah', 'Performer', { round: true })}
            ${card(1, I.mic, 'Pale Harbour', 'Performer', { round: true })}
            </div>
          </section>
        </div>`,
);

// The track list: number, art and two lines, record, when added, length; the playing row in green
// with bars for its number, one row hovered with its play and more buttons showing
const track = (
  n: number,
  title: string,
  who: string,
  record: string,
  added: string,
  len: string,
  opts: { playing?: boolean; hover?: boolean; tag?: boolean } = {},
) => `                <tr${opts.hover ? ' style="--m-table-fg: var(--m-color-fg-default)"' : ''}>
                  <td data-numeric style="inline-size: 2.5rem; text-align: center; font-size: var(--m-font-size-md)${opts.playing ? '; color: var(--m-color-accent-text)' : ''}${opts.hover ? '; background: var(--m-color-bg-surface)' : ''}">${opts.playing ? `<span aria-label="Playing" style="display: inline-flex">${icon(I.bars, 14)}</span>` : opts.hover ? `<span aria-label="Play" style="display: inline-flex; color: var(--m-color-fg-default)">${icon(I.play, 14, true)}</span>` : n}</td>
                  <td${opts.hover ? ' style="background: var(--m-color-bg-surface)"' : ''}><span class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${art(n, '2.5rem', I.music)}<span class="m-stack" data-gap="0" style="min-inline-size: 0"><span style="font-size: var(--m-font-size-md); color: ${opts.playing ? 'var(--m-color-accent-text)' : 'var(--m-color-fg-default)'}; ${clip}">${title}</span><span class="m-cluster" data-gap="1" style="flex-wrap: nowrap">${opts.tag ? '<span class="m-badge" data-variant="solid" title="Explicit" style="--m-badge-height: 1rem; --m-badge-padding-x: 0.25rem; --m-badge-radius: 2px; font-size: 0.5625rem">E</span>' : ''}<span style="${clip}">${who}</span></span></span></span></td>
                  <td${opts.hover ? ' style="background: var(--m-color-bg-surface)"' : ''}>${record}</td>
                  <td${opts.hover ? ' style="background: var(--m-color-bg-surface)"' : ''}>${added}</td>
                  <td data-numeric style="${nums}${opts.hover ? '; background: var(--m-color-bg-surface)' : ''}"><span class="m-cluster" data-gap="4" data-justify="end" style="flex-wrap: nowrap">${opts.hover ? `<span style="color: var(--m-color-fg-muted); display: inline-flex">${icon(I.addCircle, 16)}</span>` : ''}${len}${opts.hover ? `<span style="color: var(--m-color-fg-default); display: inline-flex">${icon(I.more, 16)}</span>` : '<span style="inline-size: 1rem"></span>'}</span></td>
                </tr>`;

const th = 'border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)';

// The detail: the now-playing panel on the right, big art, title, the performer's card and credits
const nowPanel = `
      <aside aria-labelledby="en-np-title" style="${panel}; flex: 1 1 20rem; max-inline-size: 26rem">
        <div class="m-stack" data-gap="4" style="padding: var(--m-space-4)">
          <div class="m-cluster" data-justify="between"><span style="${bold}">Slow Coffee</span>${iconBtn('Close the panel', I.x)}</div>
          ${artFill(0, I.music, false, 64)}
          <div class="m-cluster" data-justify="between" data-align="start" style="flex-wrap: nowrap">
            <div class="m-stack" data-gap="1" style="min-inline-size: 0"><h2 id="en-np-title" style="${shelf}; ${clip}">Paper Lanterns</h2><a href="#" style="${small}; text-decoration: none">Mara Solene</a></div>
            <div class="m-cluster" data-gap="1" style="flex-wrap: nowrap"><span style="color: var(--m-color-accent-default); display: inline-flex" aria-label="In your collection">${icon(I.saved, 20)}</span>${iconBtn('More for Paper Lanterns', I.more)}</div>
          </div>
          <section class="m-card" aria-labelledby="en-about" style="padding: 0; overflow: hidden">
            <div style="aspect-ratio: 16 / 10; background: linear-gradient(160deg, var(--m-color-info-solid), var(--m-color-brand-subtle)); padding: var(--m-space-4); display: flex; align-items: flex-start"><span id="en-about" style="${bold}; color: var(--m-color-fg-default)">About the performer</span></div>
            <div class="m-card-body m-stack" data-gap="2">
              <span style="${bold}">Mara Solene</span>
              <span style="${small}; ${nums}">412,806 listeners each month</span>
              <p style="${small}">Songs written on a borrowed upright piano in a harbour town, recorded live in one room with whoever turned up that week.</p>
              <div><button type="button" class="m-button" data-size="sm">Follow</button></div>
            </div>
          </section>
          <section class="m-card m-stack" data-gap="3" aria-labelledby="en-credits" style="padding: var(--m-space-4)">
            <div class="m-cluster" data-justify="between"><h3 id="en-credits" style="${title16}">Credits</h3><a href="#" style="${small}; ${bold}; text-decoration: none">Show all</a></div>
            <div class="m-cluster" data-justify="between"><div class="m-stack" data-gap="0"><span>Mara Solene</span><span style="${small}">Main performer, writer</span></div><button type="button" class="m-button" data-size="sm">Follow</button></div>
            <div class="m-stack" data-gap="0"><span>Teo Brandt</span><span style="${small}">Producer</span></div>
          </section>
        </div>
      </aside>`;

const listDetail = shell(
  'Slow Coffee',
  `        <header class="m-cluster" data-gap="6" data-align="end" style="padding: var(--m-space-12) var(--m-space-6) var(--m-space-6); background: linear-gradient(to bottom, var(--m-color-info-solid), var(--m-color-brand-subtle)); flex-wrap: wrap">
          <span style="inline-size: clamp(8rem, 18vw, 14.5rem); flex: none">${artFill(0, I.music, false, 72)}</span>
          <div class="m-stack" data-gap="2" style="min-inline-size: 0; flex: 1 1 18rem; color: var(--m-color-fg-default)">
            <span style="font-size: var(--m-font-size-sm)">Public mix</span>
            <h1 id="en-mix-title" style="${hero}">Slow Coffee</h1>
            <p style="font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)">Unhurried songs for the first hour of the day. Refreshed every Monday.</p>
            <p class="m-cluster" data-gap="1" style="font-size: var(--m-font-size-sm); ${nums}"><span class="m-avatar" data-size="sm" aria-hidden="true">RL</span><a href="#" style="color: var(--m-color-fg-default); text-decoration: none; ${bold}">Rosa Lindqvist</a><span style="color: var(--m-color-fg-muted)">• 1,284 saves • 38 tracks, 2 hr 14 min</span></p>
          </div>
        </header>
        <div class="m-stack" data-gap="6" style="padding: var(--m-space-6); background: linear-gradient(to bottom, var(--m-color-brand-subtle), var(--m-color-bg-canvas) 14rem)">
          <div class="m-cluster" data-justify="between">
            <div class="m-cluster" data-gap="6">
              ${playBig('Play Slow Coffee')}
              <span style="color: var(--m-color-fg-muted); display: inline-flex">${iconBtn('Shuffle Slow Coffee', I.shuffle, 32, ' data-size="lg"')}</span>
              ${iconBtn('Add to your collection', I.addCircle, 32, ' data-size="lg"')}
              ${iconBtn('More for Slow Coffee', I.more, 32, ' data-size="lg"')}
            </div>
            <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="--m-button-font-weight: var(--m-font-weight-regular)">Compact ${icon(I.list, 16)}</button>
          </div>
          <div class="m-table-wrap">
            <table class="m-table" aria-labelledby="en-mix-title">
              <thead><tr><th data-numeric style="${th}; text-align: center">#</th><th style="${th}">Title</th><th style="${th}">Record</th><th style="${th}">Added</th><th data-numeric style="${th}"><span class="m-cluster" data-justify="end"><span aria-label="Length" style="display: inline-flex">${icon(I.clock, 16)}</span><span style="inline-size: 1rem"></span></span></th></tr></thead>
              <tbody>
${track(1, 'Paper Lanterns', 'Mara Solene', 'Harbour Hours', '2 days ago', '3:54', { playing: true })}
${track(2, 'Small Engines', 'Pale Harbour', 'Signals at Dusk', '2 days ago', '4:12', { hover: true, tag: true })}
${track(3, 'Copper Kettle', 'Ivy Calder', 'Copper Kettle', '5 days ago', '2:47')}
${track(4, 'Window Seat', 'The Quiet Ferns', 'Moss and Mortar', 'Nov 3, 2026', '3:31')}
${track(5, 'Lake Effect', 'Kofi Amankwah', 'Brass Weather', 'Nov 3, 2026', '5:06', { tag: true })}
${track(6, 'First Tram', 'Night Orchard', 'Night Orchard', 'Oct 29, 2026', '3:18')}
${track(7, 'Half Light', 'Mara Solene, Teo Brandt', 'Harbour Hours', 'Oct 22, 2026', '4:40')}
              </tbody>
            </table>
          </div>
        </div>`,
  nowPanel,
);

// Onboarding: the reference's sign-up shape on the panel colour: the mark, a thin green step bar,
// a back chevron beside the step, one bold question, then round performer picks with a green tick
const pick = (n: number, name: string, on = false) =>
  `<button type="button" aria-pressed="${on}" class="m-stack" data-gap="2" data-align="center" style="background: none; border: 0; padding: 0; color: var(--m-color-fg-default); font: inherit; font-size: var(--m-font-size-sm); cursor: pointer">
          <span style="position: relative; display: block; inline-size: 100%">${artFill(n, I.mic, true, 32)}${on ? `<span style="position: absolute; inset-block-start: var(--m-space-1); inset-inline-end: var(--m-space-1); display: inline-grid; place-items: center; inline-size: 1.75rem; block-size: 1.75rem; border-radius: 50%; background: var(--m-color-accent-default); color: var(--m-color-accent-fg)">${icon(I.check, 16)}</span>` : ''}</span>
          <span style="${clip}; max-inline-size: 100%">${name}</span>
        </button>`;

const onboarding = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
<main class="m-container" data-size="sm" style="padding-block: var(--m-space-8) var(--m-space-12)">
  <form class="m-stack" data-gap="8" aria-labelledby="en-onb-title">
    <div class="m-cluster" data-justify="center">${mark('2.5rem')}</div>
    <div class="m-stack" data-gap="4">
      <progress class="m-progress" data-size="sm" value="2" max="3" aria-labelledby="en-onb-step">2 of 3</progress>
      <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap">
        ${iconBtn('Back', I.left, 24, ' data-size="lg"')}
        <div class="m-stack" data-gap="0"><span id="en-onb-step" style="${small}">Step 2 of 3</span><span style="${bold}">Tell us what you like</span></div>
      </div>
    </div>
    <div class="m-stack" data-gap="2">
      <h1 id="en-onb-title" style="${h1}">Pick 3 or more performers you like</h1>
      <p class="m-muted" style="font-size: var(--m-font-size-sm)">We’ll fill your first mixes with them and with people who sound alike. You can change this later.</p>
    </div>
    <div role="search" class="m-cluster" data-gap="3" style="block-size: 3rem; padding-inline: var(--m-space-3); border-radius: 9999px; background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse); flex-wrap: nowrap">${icon(I.search, 20)}<span>Search performers</span></div>
    <div class="m-grid" role="group" aria-label="Performers" style="--m-layout-grid-min: 6.5rem; --m-layout-grid-gap: var(--m-space-4)">
        ${pick(2, 'Mara Solene', true)}
        ${pick(0, 'Ivy Calder', true)}
        ${pick(7, 'The Quiet Ferns')}
        ${pick(5, 'Kofi Amankwah', true)}
        ${pick(1, 'Pale Harbour')}
        ${pick(3, 'Night Orchard')}
    </div>
    <div class="m-field">
      <label class="m-field-label" for="en-onb-name">What should we call you?</label>
      <input class="m-input" id="en-onb-name" value="" aria-invalid="true" aria-describedby="en-onb-name-e">
      <p class="m-field-error m-cluster" data-gap="1" id="en-onb-name-e" style="flex-wrap: nowrap">${icon(I.alert, 16)} Enter a name for your profile.</p>
      <p class="m-field-hint">This appears on your profile and on mixes you share.</p>
    </div>
    <button type="submit" class="m-button" data-variant="primary" style="inline-size: 100%; ${big}">Next</button>
  </form>
</main>
</div>`;

// Settings: one long column on the panel, a bold 32px title with search, bold 16px group titles and
// rows of subdued 14px labels with the control on the right
const setRow = (label: string, control: string, desc = '') =>
  `            <div class="m-cluster" data-justify="between" style="padding-block: var(--m-space-2); flex-wrap: nowrap; gap: var(--m-space-6)">
              <div class="m-stack" data-gap="1" style="min-inline-size: 0"><span style="${desc ? '' : `${small}`}">${label}</span>${desc ? `<span style="${tiny}">${desc}</span>` : ''}</div>
              <div style="flex: none">${control}</div>
            </div>`;
const sw = (label: string, on: boolean) =>
  `<input class="m-switch" type="checkbox" role="switch" aria-label="${label}"${on ? ' checked' : ''}>`;
const sel = (label: string, opts: string[]) =>
  `<select class="m-select" data-size="sm" aria-label="${label}" style="min-inline-size: 15rem">${opts.map((o) => `<option>${o}</option>`).join('')}</select>`;
const group = (id: string, title: string, rows: string) =>
  `          <section class="m-stack" data-gap="1" aria-labelledby="${id}">
            <h2 id="${id}" style="${title16}">${title}</h2>
${rows}
          </section>`;

const settings = shell(
  '',
  `        <div class="m-container" data-size="md" style="padding-block: var(--m-space-8) var(--m-space-12)">
        <div class="m-stack" data-gap="8">
          <div class="m-cluster" data-justify="between"><h1 style="${h1}">Settings</h1>${iconBtn('Search settings', I.search)}</div>
${group(
  'en-set-play',
  'Playback',
  [
    setRow('Blend one track into the next', sw('Blend one track into the next', true)),
    setRow('Crossfade length', `<span class="m-cluster" data-gap="2" style="${small}; ${nums}; flex-wrap: nowrap">4 s <progress class="m-progress" data-size="sm" value="4" max="12" aria-label="Crossfade 4 seconds" style="inline-size: 10rem; --m-progress-fill: var(--m-color-fg-default)">4</progress></span>`),
    setRow('Even out loudness', sw('Even out loudness', true)),
    setRow('Loudness level', sel('Loudness level', ['Balanced', 'Quiet room', 'Busy street'])),
  ].join('\n'),
)}
${group(
  'en-set-quality',
  'Sound quality',
  [
    setRow('Streaming', sel('Streaming quality', ['Automatic', 'Standard', 'High', 'Lossless'])),
    setRow('Downloads', sel('Download quality', ['High', 'Standard', 'Lossless'])),
    setRow('Save mobile data', sw('Save mobile data', false), 'Plays at standard quality and skips video loops on mobile networks.'),
  ].join('\n'),
)}
${group(
  'en-set-social',
  'Profile and sharing',
  [
    setRow('Change how others see you', `<a class="m-button" data-size="sm" href="#">Edit ${icon(I.external, 16)}</a>`),
    setRow('Show what I’m playing to people who follow me', sw('Show what I’m playing', false)),
    setRow('Bring in mixes from another app', `<button type="button" class="m-button" data-size="sm">Bring in mixes</button>`),
  ].join('\n'),
)}
${group(
  'en-set-storage',
  'Storage',
  [
    setRow('Downloads folder', `<span style="font-family: var(--m-font-family-mono); ${small}">~/Music/Wavelet/Offline</span>`),
    setRow('Space used by downloads', `<span class="m-cluster" data-gap="3" style="flex-wrap: nowrap"><span style="${small}; ${nums}">6.4 GB</span><button type="button" class="m-button" data-size="sm">Clear downloads</button></span>`),
  ].join('\n'),
)}
          <section class="m-stack" data-gap="3" aria-labelledby="en-set-close" style="padding-block-start: var(--m-space-4); border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)">
            <h2 id="en-set-close" style="${title16}">Close this account</h2>
            <p style="${small}">Your 41 mixes, 1,206 saved tracks and listening history are removed after 14 days. Shared mixes stop working for everyone.</p>
            <div><button type="button" class="m-button" data-variant="danger" data-size="sm">Close account</button></div>
          </section>
        </div>
        </div>`,
);

// Empty: the full-panel empty state (a big glyph in a disc, a bold title, one line, a white pill and an
// outlined one), with the reference's own grey prompt boxes beside it
const prompt = (title: string, body: string, action: string) =>
  `<section class="m-card"><div class="m-card-body m-stack" data-gap="5"><div class="m-stack" data-gap="2"><h2 style="${title16}">${title}</h2><p style="font-size: var(--m-font-size-sm)">${body}</p></div><div><button type="button" class="m-button" data-variant="primary" data-size="sm" style="${whitePill}">${action}</button></div></div></section>`;

const emptyState = shell(
  '',
  `        <div class="m-stack" data-gap="10" style="padding: var(--m-space-6) var(--m-space-6) var(--m-space-12)">
          <div class="m-cluster" data-gap="2" role="group" aria-label="Show">${chip('Mixes')}${chip('Shows', true)}${chip('Performers')}</div>
          <div class="m-stack" data-gap="6" data-align="center" style="text-align: center; padding-block: var(--m-space-12)">
            <span style="display: inline-grid; place-items: center; inline-size: 5.5rem; block-size: 5.5rem; border-radius: 50%; background: var(--m-color-bg-surface); color: var(--m-color-fg-default)">${icon(I.radio, 48)}</span>
            <h1 style="${h1}">Shows you save land here</h1>
            <p style="max-inline-size: 28rem">Save a show and new episodes arrive in your collection the morning they’re out.</p>
            <div class="m-cluster" data-gap="3" data-justify="center">
              <a class="m-button" data-variant="primary" href="#" style="${big}; ${whitePill}">Browse shows</a>
              <button type="button" class="m-button" style="${big}">Bring in from a file</button>
            </div>
          </div>
          <div class="m-grid" style="--m-layout-grid-min: 18rem; --m-layout-grid-gap: var(--m-space-4)">
            ${prompt('Start your first mix', 'Pick a few songs and we’ll suggest the rest.', 'New mix')}
            ${prompt('Follow a show or two', 'New episodes will be waiting for you here.', 'Find shows')}
          </div>
        </div>`,
);

// Pricing: the public page. A black header, a huge title, then plan cards on the highlight grey with
// a coloured tag, the tier name in its colour, a rule, plain bullets and a full-width pill in that
// colour, small print centred under it; questions as hairline rows
const navbar = `<header class="m-navbar">
  <a class="m-navbar-brand m-cluster" data-gap="2" href="#">${mark()} Wavelet</a>
  <nav class="m-navbar-nav" aria-label="Main">
    <a class="m-navbar-link" href="#">For creators</a>
    <a class="m-navbar-link" href="#" aria-current="page">Plans</a>
    <a class="m-navbar-link" href="#">Help center</a>
  </nav>
  <div class="m-navbar-actions">
    <a class="m-button" data-variant="ghost" href="#" style="--m-button-ghost-fg: var(--m-color-fg-muted)">Create account</a>
    <a class="m-button" data-variant="primary" href="#" style="${big}; ${whitePill}">Sign in</a>
  </div>
</header>`;

const plan = (
  id: string,
  name: string,
  colour: string,
  btnVars: string,
  tag: string,
  price: string,
  after: string,
  points: string[],
  cta: string,
  fine: string,
) => `      <section class="m-card" aria-labelledby="en-plan-${id}" style="overflow: hidden">
        <div class="m-card-body m-stack" data-gap="4">
          ${tag ? `<span style="align-self: flex-start; margin: calc(var(--m-space-4) * -1) 0 0 calc(var(--m-space-5) * -1); padding: var(--m-space-1) var(--m-space-2); border-end-end-radius: var(--m-radius-sm); background: ${colour === 'var(--m-color-accent-text)' ? 'var(--m-color-brand-default)' : colour}; color: var(--m-color-brand-fg); font-size: var(--m-font-size-sm); ${bold}">${tag}</span>` : ''}
          <div class="m-stack" data-gap="2">
            <span class="m-cluster" data-gap="2" style="${bold}">${mark('1.5rem')} Plus</span>
            <h2 id="en-plan-${id}" style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-semibold); color: ${colour}; line-height: var(--m-font-leading-tight)">${name}</h2>
            <div class="m-stack" data-gap="0"><span style="${bold}; ${nums}">${price}</span>${after ? `<span style="${small}; ${nums}">${after}</span>` : ''}</div>
          </div>
          <hr class="m-divider">
          <ul class="m-stack" data-gap="1" style="padding-inline-start: var(--m-space-5); list-style: disc">
${points.map((p) => `            <li>${p}</li>`).join('\n')}
          </ul>
          <a class="m-button" data-variant="primary" href="#" style="inline-size: 100%; ${big}; ${btnVars}">${cta}</a>
          <p style="${tiny}; text-align: center">${fine}</p>
        </div>
      </section>`;

const orange =
  '--m-button-primary-bg: var(--m-color-warning-solid); --m-button-primary-border: var(--m-color-warning-solid); --m-button-primary-hover-bg: var(--m-color-warning-solid); --m-button-primary-active-bg: var(--m-color-warning-solid); --m-button-primary-fg: var(--m-color-warning-on-solid)';
const blue =
  '--m-button-primary-bg: var(--m-color-info-solid); --m-button-primary-border: var(--m-color-info-solid); --m-button-primary-hover-bg: var(--m-color-info-solid); --m-button-primary-active-bg: var(--m-color-info-solid); --m-button-primary-fg: var(--m-color-info-on-solid)';

const pricing = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
${navbar}
<main>
  <section class="m-container" style="padding-block: var(--m-space-16) var(--m-space-12)" aria-labelledby="en-price-title">
    <div class="m-stack" data-gap="6" style="max-inline-size: 52rem">
      <h1 id="en-price-title" style="${hero}">Hear it all. Skip nothing.</h1>
      <p style="font-size: var(--m-font-size-lg); ${bold}">Plus is $0 for 30 days, then from $11.49 a month. Cancel whenever you like.</p>
      <div class="m-cluster" data-gap="3">
        <a class="m-button" data-variant="primary" href="#" style="${big}">Start 30 days free</a>
        <a class="m-button" href="#" style="${big}">Compare plans</a>
      </div>
      <p style="${tiny}; max-inline-size: 34rem">Solo plan only. $0 for 30 days, then $11.49 a month. Only for people who haven’t had Plus before.</p>
    </div>
  </section>
  <section class="m-container" style="padding-block: var(--m-space-8) var(--m-space-16)" aria-labelledby="en-plans">
    <div class="m-stack" data-gap="8">
      <div class="m-stack" data-gap="2" data-align="center" style="text-align: center">
        <h2 id="en-plans" style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight)">One plan for each kind of household</h2>
        <p class="m-muted">Every plan streams without breaks, plays offline and works on any speaker.</p>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 17rem; --m-layout-grid-gap: var(--m-space-6); align-items: start">
${plan('solo', 'Solo', 'var(--m-color-accent-text)', '', '$0 for 30 days', '$0 for 30 days', '$11.49 / month after', ['1 Plus profile', 'Download up to 8,000 songs', 'Lossless sound', 'Stop whenever you like'], 'Start 30 days free', '$0 for 30 days, then $11.49 a month. Only if you haven’t had Plus before.')}
${plan('pair', 'Pair', 'var(--m-color-warning-fg)', orange, '', '$15.99 / month', '', ['2 Plus profiles', 'A shared Pair Mix, updated daily', 'Lossless sound', 'Stop whenever you like'], 'Get Plus Pair', 'For two people living at the same address.')}
${plan('home', 'Household', 'var(--m-color-info-fg)', blue, '', '$19.49 / month', '', ['Up to 5 Plus profiles', 'Filters for younger listeners', 'A shared Household Mix', 'Stop whenever you like'], 'Get Plus Household', 'For up to 5 people living at the same address.')}
      </div>
    </div>
  </section>
  <section class="m-container" data-size="md" style="padding-block: 0 var(--m-space-16)" aria-labelledby="en-faq">
    <div class="m-stack" data-gap="4">
      <h2 id="en-faq" style="${shelf}">Questions</h2>
      <div class="m-accordion" style="border: 0">
        <details class="m-accordion-item" name="en-faq" open><summary>What happens when the free 30 days end?</summary><div class="m-accordion-content">Your plan carries on at its monthly price. We send a reminder 3 days before, and you can stop it from your account in two taps.</div></details>
        <details class="m-accordion-item" name="en-faq"><summary>Can I move from Solo to Household later?</summary><div class="m-accordion-content">Yes. The change applies at once and the price is worked out for the days left in the month.</div></details>
        <details class="m-accordion-item" name="en-faq"><summary>Do downloads stay if I stop paying?</summary><div class="m-accordion-content">They stay on the device but won’t play until a plan is active again.</div></details>
      </div>
    </div>
  </section>
</main>
</div>`;

// Errors: the field (red ring, red line with an icon), the form banner in the negative subdued set,
// the blue snackbar centred at the bottom, and full-page errors in the reference's 404 shape: the
// mark, a 48px bold title, one subdued line, a white pill and a bold link
const errorPage = (code: string, title: string, body: string, action: string, link: string, glyph = '') =>
  `      <section class="m-stack" data-gap="6" data-align="center" style="text-align: center; padding-block: var(--m-space-16); border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)" aria-labelledby="en-err-${code}">
        ${glyph ? `<span style="color: var(--m-color-fg-muted)">${icon(glyph, 56)}</span>` : mark('3.5rem')}
        <div class="m-stack" data-gap="2" data-align="center">
          <span style="${tiny}; font-family: var(--m-font-family-mono)">Error ${code}</span>
          <h2 id="en-err-${code}" style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)">${title}</h2>
          <p class="m-muted" style="max-inline-size: 28rem">${body}</p>
        </div>
        <a class="m-button" data-variant="primary" href="#" style="${big}; ${whitePill}">${action}</a>
        <a href="#" style="${bold}; color: var(--m-color-fg-default); text-decoration: none">${link}</a>
      </section>`;

const errors = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
<main class="m-container" data-size="md" style="padding-block: var(--m-space-12)">
  <div class="m-stack" data-gap="12">
    <section class="m-stack" data-gap="6" aria-labelledby="en-err-form" style="max-inline-size: 28rem; margin-inline: auto; inline-size: 100%">
      <h1 id="en-err-form" style="${h1}">Change your sign-in email</h1>
      <div class="m-alert" data-tone="danger" role="alert">
        <span class="m-alert-icon">${icon(I.alert, 16)}</span>
        <div class="m-alert-content"><div class="m-alert-title">2 things need fixing</div><div class="m-alert-body">Your email hasn’t changed. Check the fields below.</div></div>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="en-err-email">New email</label>
        <input class="m-input" id="en-err-email" type="email" value="rosa.lindqvist@mail" aria-invalid="true" aria-describedby="en-err-email-e">
        <p class="m-field-error m-cluster" data-gap="1" id="en-err-email-e" style="flex-wrap: nowrap">${icon(I.alert, 16)} This email is missing its ending, like .com.</p>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="en-err-pass">Current password</label>
        <input class="m-input" id="en-err-pass" type="password" value="••••••" aria-invalid="true" aria-describedby="en-err-pass-e">
        <p class="m-field-error m-cluster" data-gap="1" id="en-err-pass-e" style="flex-wrap: nowrap">${icon(I.alert, 16)} That password doesn’t match. Try again or reset it.</p>
      </div>
      <div class="m-cluster" data-gap="4" data-justify="end">
        <button type="button" class="m-button" data-variant="ghost">Cancel</button>
        <button type="submit" class="m-button" data-variant="primary">Save email</button>
      </div>
    </section>
    <section class="m-stack" data-gap="3" data-align="center" aria-label="A toast">
      <div class="m-toast" role="status" style="max-inline-size: 24rem; text-align: center"><div class="m-toast-content"><div class="m-toast-body">Couldn’t add Paper Lanterns to Slow Coffee. Check your connection.</div></div></div>
    </section>
${errorPage('404', 'Page not found', 'We can’t find the page you’re looking for.', 'Back to Discover', 'Help center')}
${errorPage('500', 'Something went wrong', 'It’s on our side, and nothing in your collection changed. Try again in a minute.', 'Try again', 'Service status', I.cloudOff)}
${errorPage('403', 'This mix is private', 'Only Ivy Calder and the people she invited can open it. Ask her for a link.', 'Back to Discover', 'Why can’t I see this?', I.lock)}
  </div>
</main>
</div>`;

export const cadenceRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'The home panel in the black frame: filter chips, a greeting over a green wash, a grid of shortcut tiles, then shelves of cover cards and round performer cards; the collection panel and the now-playing bar around it.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'A mix page: a colour-washed header with big art and a huge title, the green play button and round actions, a rule-free track list with the playing row in green; the detail is the now-playing panel on the right.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One narrow column on the panel: the mark, a thin green step bar, a back chevron beside the step, a bold question, round performer picks with a green tick, and a full-width green pill.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'One long column inside the app frame: a bold title with search, bold group titles, subdued labels with switches, selects and outlined pills on the right, and closing the account last.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'A big glyph in a grey disc, a bold title, one line, a white pill and an outlined one; the grey prompt boxes with white pills below.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The public page: a black header, a huge bold title with green and outlined pills, plan cards with a coloured tag, the tier name and full-width pill in its colour, and questions as hairline rows.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'A red ring and a red line with an icon under the field, a banner above the form saying nothing changed, the blue snackbar, and full pages for 404, 500 and no access with a white pill.',
    html: errors,
  },
];
