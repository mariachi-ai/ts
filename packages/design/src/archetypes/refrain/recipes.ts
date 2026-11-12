import type { ArchetypeRecipe } from '../types';

/*
 * Refrain's seven page shapes: framework-free HTML using only @mariachi/design classes and tokens (no
 * colour literals), with sample data from a made-up listening app, "Sonder". They follow the
 * language's real screen patterns: a pale sidebar library with blue glyphs, bold large titles,
 * square artwork everywhere (token gradients stand in for real art), shelves with a chevron title,
 * black pills beside round grey buttons, hairline track lists, grouped inset settings and a floating
 * capsule player. Every name, number, label and nav item is invented.
 */

// Lucide icons, outlined at 1.75px (the reference's symbols are regular weight); play, pause and the
// transport are filled, as the reference fills them
const icon = (paths: string, size = 16, filled = false) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="${filled ? '1' : '1.75'}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  pulse: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
  charts: '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
  mic: '<path d="m11 7.601-5.994 8.19a1 1 0 0 0 .1 1.298l.817.818a1 1 0 0 0 1.314.087L15.09 12"/><path d="M16.5 21.174C15.5 20.5 14.372 20 13 20c-2.058 0-3.928 2.356-6 2-2.072-.356-2.775-3.369-1.5-4.5"/><circle cx="16" cy="7" r="5"/>',
  ticket:
    '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',
  disc: '<circle cx="12" cy="12" r="10"/><path d="M6 12c0-1.7.7-3.2 1.8-4.2"/><circle cx="12" cy="12" r="2"/><path d="M18 12c0 1.7-.7 3.2-1.8 4.2"/>',
  feather:
    '<path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  decades:
    '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M8 2v4"/><path d="M17 14h-6"/><path d="M13 18H7"/><path d="M7 14h.01"/><path d="M17 18h.01"/>',
  download: '<circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="m8 12 4 4 4-4"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  share: '<path d="M12 2v13"/><path d="m16 6-4-4-4 4"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  play: '<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/>',
  pause: '<rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/>',
  rewind:
    '<path d="M12 6a2 2 0 0 0-3.414-1.414l-6 6a2 2 0 0 0 0 2.828l6 6A2 2 0 0 0 12 18z"/><path d="M22 6a2 2 0 0 0-3.414-1.414l-6 6a2 2 0 0 0 0 2.828l6 6A2 2 0 0 0 22 18z"/>',
  forward:
    '<path d="M12 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 12 18z"/><path d="M2 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 2 18z"/>',
  shuffle:
    '<path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"/><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"/><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  lyrics:
    '<path d="M14 14a2 2 0 0 0 2-2V8h-2"/><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/><path d="M8 14a2 2 0 0 0 2-2V8H8"/>',
  queue: '<path d="M3 5h.01"/><path d="M3 12h.01"/><path d="M3 19h.01"/><path d="M8 5h13"/><path d="M8 12h13"/><path d="M8 19h13"/>',
  cast: '<path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/><path d="m12 15 5 6H7Z"/>',
  volume:
    '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  cloudOff:
    '<path d="M10.94 5.274A7 7 0 0 1 15.71 10h1.79a4.5 4.5 0 0 1 4.222 6.057"/><path d="M18.796 18.81A4.5 4.5 0 0 1 17.5 19H9A7 7 0 0 1 5.79 5.78"/><path d="m2 2 20 20"/>',
  wave: '<path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/>',
  headphones:
    '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  radio:
    '<path d="M16.247 7.761a6 6 0 0 1 0 8.478"/><path d="M19.075 4.933a10 10 0 0 1 0 14.134"/><path d="M4.925 19.067a10 10 0 0 1 0-14.134"/><path d="M7.753 16.239a6 6 0 0 1 0-8.478"/><circle cx="12" cy="12" r="2"/>',
  external: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  sparkles:
    '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>',
};

// Text styles (the published scale): 34 bold page titles, 26 bold record titles, 22 bold section
// heads, 17 bold shelf titles with a chevron, 11 semibold eyebrows in capitals
const pageTitle =
  'font-family: var(--m-font-family-display); font-size: var(--m-font-size-4xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)';
const largeTitle =
  'font-family: var(--m-font-family-display); font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)';
const title1 =
  'font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)';
const title2 = 'font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold)';
const eyebrow =
  'font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-semibold); color: var(--m-color-fg-muted); text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide)';
const semi = 'font-weight: var(--m-font-weight-semibold)';
const small = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
const muted = 'color: var(--m-color-fg-muted)';
const nums = 'font-variant-numeric: tabular-nums';
const clip = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis';
const link = 'color: var(--m-color-accent-text); text-decoration: none';
const blue = 'color: var(--m-color-accent-text); display: inline-flex';

// Buttons: the round grey button (secondary, icon only), the bare toolbar glyph (ghost), and small
// 13px pills for rows
const circle = (label: string, ic: string, size = 16, extra = '') =>
  `<button type="button" class="m-button" data-icon-only aria-label="${label}"${extra}>${icon(ic, size)}</button>`;
const glyph = (label: string, ic: string, size = 16, extra = '', filled = false) =>
  `<button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="${label}"${extra}>${icon(ic, size, filled)}</button>`;
const sm13 = '--m-button-font-size: var(--m-font-size-md)';

// Artwork stands in as token gradients: no real art ships. The reference's tiles are flat, vivid
// duotones; these step through the brand, the blue and the status fills
const grads = [
  'var(--m-color-brand-default), var(--m-color-warning-solid)',
  'var(--m-color-info-solid), var(--m-color-brand-subtle)',
  'var(--m-color-success-solid), var(--m-color-info-solid)',
  'var(--m-color-warning-solid), var(--m-color-brand-subtle)',
  'var(--m-color-fg-default), var(--m-color-fg-muted)',
  'var(--m-color-brand-subtle), var(--m-color-brand-default)',
  'var(--m-color-accent-active), var(--m-color-success-solid)',
  'var(--m-color-danger-solid), var(--m-color-info-solid)',
];
const glyphs = [I.disc, I.wave, I.radio, I.headphones, I.sparkles, I.mic];
const art = (n: number, size: string, ic = glyphs[n % glyphs.length], radius = 'var(--m-radius-sm)') =>
  `<span aria-hidden="true" style="display: inline-grid; place-items: center; flex: none; inline-size: ${size}; block-size: ${size}; border-radius: ${radius}; background: linear-gradient(140deg, ${grads[n % grads.length]}); color: var(--m-color-brand-fg)">${icon(ic, 14)}</span>`;
const artFill = (n: number, ic = glyphs[n % glyphs.length], opts: { round?: boolean; big?: boolean; label?: string } = {}) =>
  `<span aria-hidden="true" style="position: relative; display: grid; place-items: center; aspect-ratio: 1; border-radius: ${opts.round ? '50%' : opts.big ? 'var(--m-radius-lg)' : '7px'}; background: linear-gradient(140deg, ${grads[n % grads.length]}); color: var(--m-color-brand-fg); box-shadow: ${opts.big ? 'var(--m-shadow-md)' : 'var(--m-shadow-sm)'}">${opts.label ? `<span style="position: absolute; inset-inline-start: 10%; inset-block-end: 9%; inset-inline-end: 10%; font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: 1.05">${opts.label}</span>` : icon(ic, opts.big ? 56 : 32)}</span>`;

// The app's own mark: an ink tile with sound bars beside the name (invented; no real logo)
const mark = (size = '28px') =>
  `<span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: ${size}; block-size: ${size}; border-radius: 28%; background: var(--m-color-fg-default); color: var(--m-color-bg-canvas)">${icon(I.wave, 16)}</span>`;
const wordmark = `<a href="#" class="m-cluster" data-gap="2" style="color: var(--m-color-fg-default); text-decoration: none; font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight)">${mark()} Sonder</a>`;

// The sidebar library: our own sections in the reference's treatment (blue glyphs, 32px rows, the
// current row in the selection grey and semibold, small art for mixes, plain grey headings)
const navItem = (ic: string, label: string, current: string, count = '') =>
  `          <li><a class="m-sidebar-link" href="#"${label === current ? ' aria-current="page"' : ''}><span style="${blue}">${icon(ic, 18)}</span> ${label}${count ? `<span class="m-sidebar-count">${count}</span>` : ''}</a></li>`;
const mixItem = (n: number, label: string, current: string) =>
  `          <li><a class="m-sidebar-link" href="#"${label === current ? ' aria-current="page"' : ''}>${art(n, '20px', '', '4px')} <span style="${clip}">${label}</span></a></li>`;

const sidebar = (current: string) => `  <nav class="m-sidebar" aria-label="Library" style="inline-size: auto">
    <div style="padding: var(--m-space-2) var(--m-space-1) var(--m-space-1)">${wordmark}</div>
    <div class="m-sidebar-section">
      <ul>
${navItem(I.pulse, 'Pulse', current)}
${navItem(I.charts, 'Charts', current)}
${navItem(I.mic, 'Live sessions', current)}
${navItem(I.ticket, 'Concerts', current)}
      </ul>
    </div>
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Crate</h2>
      <ul>
${navItem(I.disc, 'Records', current)}
${navItem(I.feather, 'Composers', current)}
${navItem(I.tag, 'Labels', current)}
${navItem(I.decades, 'Decades', current)}
${navItem(I.download, 'Downloads', current, current === 'Downloads' ? '' : '42')}
      </ul>
    </div>
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Mixes</h2>
      <ul>
${mixItem(0, 'Sunday Bake', current)}
${mixItem(2, 'Long Run Tempo', current)}
${mixItem(5, 'Late Library', current)}
${mixItem(3, 'Porch Strings', current)}
          <li><a class="m-sidebar-link" href="#" style="color: var(--m-color-fg-muted)"><span style="${blue}">${icon(I.plus, 18)}</span> New mix</a></li>
      </ul>
    </div>
    <a class="m-sidebar-link" href="#"${current === 'Settings' ? ' aria-current="page"' : ''} style="margin-block-start: auto; padding-block: var(--m-space-2)"><span class="m-avatar" data-size="sm">NO</span> Noor Okafor</a>
  </nav>`;

// The floating capsule player: the transport on the left (shuffle on: blue on a pale blue disc), the
// track with a thin scrubber under it, and the lyrics, queue, speaker and volume glyphs on the right
const onDisc =
  ' aria-pressed="true" style="--m-button-ghost-fg: var(--m-color-accent-text); --m-button-ghost-bg: var(--m-color-accent-subtle); --m-button-ghost-hover-bg: var(--m-color-accent-subtle)"';
const player = (lyricsOn = false) => `      <footer aria-label="Now playing" class="m-cluster" data-gap="2" style="margin: var(--m-space-4) auto 0; inline-size: 100%; max-inline-size: 704px; padding: var(--m-space-2) var(--m-space-4); flex-wrap: nowrap; border-radius: 9999px; background: var(--m-color-bg-raised); box-shadow: var(--m-shadow-lg), 0 0 0 0.5px var(--m-color-border-default)">
        <div class="m-cluster" data-gap="1" style="flex-wrap: nowrap; flex: none">
          ${glyph('Shuffle is on', I.shuffle, 14, onDisc)}${glyph('Previous', I.rewind, 16, '', true)}${glyph('Pause', I.pause, 18, '', true)}${glyph('Next', I.forward, 16, '', true)}${glyph('Repeat', I.repeat, 14)}
        </div>
        <div class="m-stack" data-gap="1" style="flex: 1; min-inline-size: 0">
          <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${art(1, '36px')}<div class="m-stack" data-gap="0" style="min-inline-size: 0"><span style="${semi}; ${clip}">Lantern Hours</span><span style="${small}; ${clip}">Mirela Sand — Salt and Static</span></div></div>
          <progress class="m-progress" data-size="sm" value="38" max="100" aria-label="1:24 of 3:41" style="block-size: 2px; --m-progress-fill: var(--m-color-fg-muted)">38%</progress>
        </div>
        <div class="m-cluster" data-gap="1" style="flex-wrap: nowrap; flex: none">
          ${glyph('More for Lantern Hours', I.more, 16)}${glyph(lyricsOn ? 'Lyrics are showing' : 'Lyrics', I.lyrics, 16, lyricsOn ? onDisc : '')}${glyph('Up next', I.queue, 16)}${glyph('Play on a speaker', I.cast, 16)}${glyph('Volume', I.volume, 16)}
        </div>
      </footer>`;

// The toolbar: a round back button on the left; on the right a glass capsule with share and more,
// and the search capsule
const capsule =
  'display: inline-flex; align-items: center; border-radius: 9999px; background: var(--m-color-bg-raised); box-shadow: var(--m-shadow-lg), 0 0 0 0.5px var(--m-color-border-default)';
const toolbar = (find: string, back = true) => `      <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap">
        ${back ? `<span style="${capsule}">${glyph('Back', I.left, 18)}</span>` : '<span></span>'}
        <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap">
          <span style="${capsule}; padding-inline: var(--m-space-1)">${glyph('Share', I.share, 16)}${glyph('More', I.more, 16)}</span>
          <span role="search" class="m-cluster" data-gap="2" style="${capsule}; block-size: 36px; inline-size: clamp(144px, 22vw, 240px); padding-inline: var(--m-space-3); flex-wrap: nowrap; color: var(--m-color-fg-subtle)">${icon(I.search, 14)}<span style="${clip}">${find}</span></span>
        </div>
      </div>`;

const shell = (current: string, main: string, lyricsOn = false) => `<div class="m-split" style="--m-layout-split-side: 260px; --m-layout-split-gap: 0; min-block-size: 100vh; background: var(--m-color-bg-canvas)">
${sidebar(current)}
  <div style="overflow: hidden">
${main}
  </div>
</div>`.replace('%PLAYER%', player(lyricsOn));

// A shelf title: 17px bold with a chevron, as a link
const shelfRow = (w: string) =>
  `display: grid; grid-auto-flow: column; grid-auto-columns: ${w}; gap: var(--m-space-5); overflow: hidden; margin-inline-end: calc(clamp(16px, 3vw, 40px) * -1)`;
const shelfHead = (id: string, title: string) =>
  `<h2 id="${id}" style="${title2}"><a href="#" class="m-cluster" data-gap="1" style="display: inline-flex; color: inherit; text-decoration: none">${title} <span style="${muted}; display: inline-flex">${icon(I.right, 16)}</span></a></h2>`;

// A square lockup: art with 7px corners on the layered shadow, a 12px title and a grey line
const lockup = (n: number, title: string, sub: string, opts: { round?: boolean; label?: string; live?: boolean } = {}) =>
  `<a href="#" class="m-stack" data-gap="2" style="color: var(--m-color-fg-default); text-decoration: none; min-inline-size: 0${opts.round ? '; text-align: center' : ''}">
              <span style="position: relative; display: block">${artFill(n, opts.round ? I.feather : undefined, { round: opts.round, label: opts.label })}${opts.live ? '<span class="m-badge" data-variant="solid" style="position: absolute; inset-block-start: var(--m-space-2); inset-inline-start: var(--m-space-2); --m-badge-neutral-solid-bg: var(--m-color-brand-default); --m-badge-neutral-solid-fg: var(--m-color-brand-fg); letter-spacing: var(--m-font-tracking-wide)">LIVE</span>' : ''}</span>
              <span class="m-stack" data-gap="0" style="font-size: var(--m-font-size-sm)"><span style="${clip}">${title}</span><span style="${muted}; ${clip}">${sub}</span></span>
            </a>`;

// A compact song row in a shelf: small art, two lines, more on the right, a hairline under
const songRow = (n: number, title: string, who: string, explicit = false) =>
  `<li class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding-block: var(--m-space-2)">${art(n, '48px')}<span class="m-stack" data-gap="0" style="flex: 1; min-inline-size: 0; align-self: stretch; justify-content: center; border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)"><span class="m-cluster" data-gap="1" style="flex-wrap: nowrap"><span style="${clip}">${title}</span>${explicit ? '<span class="m-badge" title="Explicit" style="--m-badge-height: 14px; --m-badge-padding-x: 3px; --m-badge-radius: 3px; font-size: 9px">E</span>' : ''}</span><span style="${muted}; ${clip}">${who}</span></span>${glyph(`More for ${title}`, I.more, 16)}</li>`;

// A wide editorial lockup: eyebrow, headline and a grey line over a 16:9 tile with a caption scrim
const feature = (n: number, kicker: string, head: string, sub: string, caption: string) =>
  `<a href="#" class="m-stack" data-gap="3" style="color: var(--m-color-fg-default); text-decoration: none; min-inline-size: 0">
              <span class="m-stack" data-gap="0"><span style="${eyebrow}">${kicker}</span><span style="font-size: var(--m-font-size-xl); ${clip}">${head}</span><span style="font-size: var(--m-font-size-xl); ${muted}; ${clip}">${sub}</span></span>
              <span style="position: relative; display: block; aspect-ratio: 16 / 8; border-radius: var(--m-radius-lg); overflow: hidden; background: linear-gradient(140deg, ${grads[n % grads.length]}); box-shadow: var(--m-shadow-sm)"><span style="position: absolute; inset: auto 0 0; padding: var(--m-space-8) var(--m-space-4) var(--m-space-3); background: linear-gradient(to top, var(--m-color-bg-overlay), transparent); color: var(--m-color-brand-fg); font-size: var(--m-font-size-md)">${caption}</span></span>
            </a>`;

const pad = 'padding: var(--m-space-3) clamp(16px, 3vw, 40px) var(--m-space-6)';

const dashboard = shell(
  'Pulse',
  `    <main class="m-stack" data-gap="8" style="${pad}">
${toolbar('Search Sonder', false)}
      <h1 style="${pageTitle}">Pulse</h1>
      <section class="m-grid" aria-label="Featured" style="--m-layout-grid-min: 352px; --m-layout-grid-gap: var(--m-space-5)">
            ${feature(1, 'Session of the week', 'Mirela Sand plays the whole record live', 'Recorded at the Glasshouse, Lisbon', 'Eleven songs, one take, and a choir she met that afternoon.')}
            ${feature(6, 'New record', 'Quiet Engines', 'Teodor Kade', 'A drum machine, a cello and a very old organ.')}
      </section>
      <section class="m-stack" data-gap="3" aria-labelledby="ar-rising">
        ${shelfHead('ar-rising', 'Rising this week')}
        <div style="${shelfRow('clamp(144px, 15vw, 204px)')}">
            ${lockup(0, 'Paper Moons', 'Orla Finch', { label: 'Paper Moons' })}
            ${lockup(2, 'Live at Ostra Hall', 'Sable Coast', { live: true })}
            ${lockup(3, 'Evening Arcade', 'Hollis Gray')}
            ${lockup(5, 'Second Summer', 'Cass Arden', { label: 'Second Summer' })}
            ${lockup(7, 'Low Orbit Lullabies', 'The Velvet Atlas')}
        </div>
      </section>
      <section class="m-stack" data-gap="2" aria-labelledby="ar-fresh">
        ${shelfHead('ar-fresh', 'Fresh tracks')}
        <div class="m-grid" style="--m-layout-grid-min: 256px; --m-layout-grid-gap: var(--m-space-5)">
          <ul class="m-stack" data-gap="0" style="list-style: none; margin: 0; padding: 0">
            ${songRow(1, 'Lantern Hours', 'Mirela Sand')}
            ${songRow(4, 'Coastline Static', 'Lowfield', true)}
            ${songRow(6, 'Telegraph Blue', 'Orla Finch')}
          </ul>
          <ul class="m-stack" data-gap="0" style="list-style: none; margin: 0; padding: 0">
            ${songRow(3, 'Small Hours Waltz', 'Teodor Kade')}
            ${songRow(0, 'Kite Season', 'Cass Arden')}
            ${songRow(5, 'Glass Bells', 'Sable Coast, Hollis Gray')}
          </ul>
          <ul class="m-stack" data-gap="0" style="list-style: none; margin: 0; padding: 0">
            ${songRow(2, 'Overpass', 'The Velvet Atlas', true)}
            ${songRow(7, 'Morning Ferry', 'Lowfield')}
            ${songRow(1, 'Northbound', 'Ilse Marrow')}
          </ul>
        </div>
      </section>
      <section class="m-stack" data-gap="3" aria-labelledby="ar-composers">
        ${shelfHead('ar-composers', 'Composers you return to')}
        <div style="${shelfRow('clamp(128px, 12vw, 168px)')}">
            ${lockup(4, 'Ilse Marrow', 'Composer', { round: true })}
            ${lockup(1, 'Teodor Kade', 'Composer', { round: true })}
            ${lockup(5, 'Orla Finch', 'Composer', { round: true })}
            ${lockup(2, 'Hollis Gray', 'Composer', { round: true })}
            ${lockup(6, 'Cass Arden', 'Composer', { round: true })}
        </div>
      </section>
%PLAYER%
    </main>`,
);

// The record page: big art on the radiosity shadow, a 26px bold title with the performer in blue
// below, grey metadata, the round shuffle, the black Play pill and a round add; the hairline track
// list; the detail is the lyrics pane on the right, the current line in ink and the rest faded
const track = (n: number, title: string, len: string, opts: { playing?: boolean; hover?: boolean; explicit?: boolean } = {}) => {
  const bg = opts.hover ? '; background: var(--m-table-row-hover-bg)' : '';
  return `                <tr>
                  <td data-numeric style="inline-size: 40px; text-align: center; border-block-end-color: transparent; ${muted}${bg}">${opts.playing ? `<span aria-label="Playing" style="color: var(--m-color-fg-default); display: inline-flex">${icon(I.wave, 14)}</span>` : opts.hover ? `<span aria-label="Play" style="color: var(--m-color-fg-default); display: inline-flex">${icon(I.play, 12, true)}</span>` : n}</td>
                  <td style="${opts.playing ? semi : ''}${bg}"><span class="m-cluster" data-gap="1" style="flex-wrap: nowrap">${title}${opts.explicit ? '<span class="m-badge" title="Explicit" style="--m-badge-height: 14px; --m-badge-padding-x: 3px; --m-badge-radius: 3px; font-size: 9px">E</span>' : ''}</span></td>
                  <td data-numeric style="${muted}; ${nums}${bg}">${len}</td>
                  <td style="inline-size: 40px${bg}">${glyph(`More for ${title}`, I.more, 16)}</td>
                </tr>`;
};

const lyricLine = (text: string, state: 'past' | 'now' | 'next') =>
  `<p style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight); color: var(--m-color-fg-default)${state === 'now' ? '' : `; opacity: ${state === 'past' ? '0.25' : '0.4'}`}">${text}</p>`;

const listDetail = shell(
  'Records',
  `    <div style="display: flex; flex-wrap: wrap; align-items: stretch; min-block-size: 100vh">
    <main class="m-stack" data-gap="6" style="${pad}; flex: 999 1 544px; min-inline-size: 0">
${toolbar('Find in record')}
      <header class="m-cluster" data-gap="8" data-align="end" style="flex-wrap: wrap">
        <span style="inline-size: clamp(160px, 22vw, 272px); flex: none">${artFill(1, I.disc, { big: true })}</span>
        <div class="m-stack" data-gap="4" style="flex: 1 1 288px; min-inline-size: 0">
          <div class="m-stack" data-gap="1">
            <h1 id="ar-record" class="m-cluster" data-gap="2" style="${largeTitle}">Salt and Static <span class="m-badge" title="Explicit" style="--m-badge-height: 18px; --m-badge-padding-x: 5px">E</span></h1>
            <a href="#" style="${largeTitle}; font-weight: var(--m-font-weight-regular); ${link}">Mirela Sand</a>
            <span style="font-size: var(--m-font-size-sm); ${semi}; ${muted}">Folk · 2026 · Studio quality</span>
          </div>
          <p style="${muted}; max-inline-size: 480px">Written over one winter in a borrowed flat above a ferry terminal, with the foghorn left in on three songs. <a href="#" style="${eyebrow}; color: var(--m-color-fg-default); text-decoration: none">More</a></p>
          <div class="m-cluster" data-gap="3">
            ${circle('Shuffle Salt and Static', I.shuffle, 16)}
            <button type="button" class="m-button" data-variant="primary" style="min-inline-size: 130px">${icon(I.play, 14, true)} Play</button>
            ${circle('Add to your crate', I.plus, 18)}
          </div>
        </div>
      </header>
      <div class="m-table-wrap">
        <table class="m-table" aria-labelledby="ar-record">
          <thead><tr><th data-numeric style="text-align: center; border-block-end-color: transparent"><span class="m-sr-only">Number</span></th><th><span class="m-sr-only">Title</span></th><th data-numeric><span class="m-sr-only">Length</span></th><th><span class="m-sr-only">Actions</span></th></tr></thead>
          <tbody>
${track(1, 'Ferry Lights', '3:12')}
${track(2, 'Lantern Hours', '3:41', { playing: true })}
${track(3, 'Weatherglass', '4:05', { hover: true })}
${track(4, 'Small Talk, Big Sea', '2:58', { explicit: true })}
${track(5, 'Foghorn in D', '5:20')}
${track(6, 'Upstairs Neighbours', '3:33')}
${track(7, 'Salt and Static', '4:47')}
          </tbody>
        </table>
      </div>
      <p style="${small}">November 7, 2026 · 7 songs, 27 minutes<br>Released on Halfmoon Records</p>
%PLAYER%
    </main>
    <aside aria-label="Lyrics" style="flex: 1 1 288px; max-inline-size: 384px; background: var(--m-color-bg-surface); padding: var(--m-space-12) var(--m-space-6)">
      <div class="m-stack" data-gap="6">
        ${lyricLine('the gulls were awake before me', 'past')}
        ${lyricLine('I kept the window open for the boat', 'now')}
        ${lyricLine('and the radio hissing like the tide', 'next')}
        ${lyricLine('nobody calls it home out loud', 'next')}
        ${lyricLine('but the kettle knows', 'next')}
      </div>
    </aside>
    </div>`,
  true,
);

// Onboarding: a centred sheet on the page. Step dots, a big bold question, a capsule search, round
// composer picks with a blue tick, genre capsules (the chosen ones black), the profile name field,
// the black Continue pill and a blue "Not now"
const pick = (n: number, name: string, on = false) =>
  `<button type="button" aria-pressed="${on}" class="m-stack" data-gap="2" data-align="center" style="background: none; border: 0; padding: 0; color: var(--m-color-fg-default); font: inherit; font-size: var(--m-font-size-sm); cursor: pointer">
          <span style="position: relative; display: block; inline-size: 100%">${artFill(n, I.feather, { round: true })}${on ? `<span style="position: absolute; inset-block-end: 2%; inset-inline-end: 2%; display: inline-grid; place-items: center; inline-size: 26px; block-size: 26px; border-radius: 50%; background: var(--m-color-accent-default); color: var(--m-color-accent-fg); box-shadow: 0 0 0 2px var(--m-color-bg-canvas)">${icon(I.check, 14)}</span>` : ''}</span>
          <span style="${clip}; max-inline-size: 100%">${name}</span>
        </button>`;
const genre = (label: string, on = false) =>
  `<button type="button" class="m-button" data-size="sm" aria-pressed="${on}"${on ? ' data-variant="primary"' : ''} style="${sm13}">${label}</button>`;
const dot = (on = false) =>
  `<span style="inline-size: 7px; block-size: 7px; border-radius: 50%; background: var(--m-color-fg-default)${on ? '' : '; opacity: 0.25'}"></span>`;

const onboarding = `<div style="min-block-size: 100vh; background: var(--m-color-bg-sunken); padding: var(--m-space-10) var(--m-space-4)">
<main class="m-container" data-size="md" style="background: var(--m-color-bg-canvas); border-radius: 18px; box-shadow: var(--m-shadow-overlay); padding-block: var(--m-space-10)">
  <form class="m-stack" data-gap="8" aria-labelledby="ar-onb-title" style="max-inline-size: 544px; margin-inline: auto">
    <div class="m-stack" data-gap="3" data-align="center" style="text-align: center">
      ${mark('48px')}
      <div class="m-cluster" data-gap="2" role="img" aria-label="Step 2 of 3">${dot()}${dot(true)}${dot()}</div>
      <h1 id="ar-onb-title" style="${pageTitle}">Who do you play the most?</h1>
      <p style="font-size: var(--m-font-size-lg); ${muted}">Pick three or more. Your first mixes start from them, and you can change them later.</p>
    </div>
    <div role="search" class="m-cluster" data-gap="2" style="${capsule}; block-size: 38px; padding-inline: var(--m-space-3); flex-wrap: nowrap; color: var(--m-color-fg-subtle)">${icon(I.search, 14)}<span>Search composers and bands</span></div>
    <div class="m-grid" role="group" aria-label="Composers" style="--m-layout-grid-min: 104px; --m-layout-grid-gap: var(--m-space-5)">
        ${pick(4, 'Ilse Marrow', true)}
        ${pick(1, 'Teodor Kade', true)}
        ${pick(5, 'Orla Finch')}
        ${pick(2, 'Hollis Gray', true)}
        ${pick(6, 'Cass Arden')}
        ${pick(0, 'Lowfield')}
    </div>
    <div class="m-stack" data-gap="2">
      <span style="${eyebrow}">Also into</span>
      <div class="m-cluster" data-gap="2" role="group" aria-label="Genres">${genre('Folk', true)}${genre('Chamber pop')}${genre('Ambient', true)}${genre('Jazz')}${genre('Choral')}${genre('Electronic')}</div>
    </div>
    <div class="m-field">
      <label class="m-field-label" for="ar-onb-name">Profile name</label>
      <input class="m-input" id="ar-onb-name" value="noor.listens" aria-describedby="ar-onb-name-h">
      <p class="m-field-hint" id="ar-onb-name-h">Shown on mixes you share. Letters, numbers and dots.</p>
    </div>
    <div class="m-stack" data-gap="3" data-align="center">
      <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: min(100%, 320px)">Continue</button>
      <a href="#" style="${link}">Not now</a>
    </div>
  </form>
</main>
</div>`;

// Settings: a big bold title, a segmented control for the sections, then grouped inset boxes with a
// semibold label above, rows split by inset hairlines, the control on the right and a grey footnote
const row = (label: string, control: string, last = false) =>
  `              <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; gap: var(--m-space-6); min-block-size: 44px; padding-block: var(--m-space-2)${last ? '' : '; border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)'}"><span style="min-inline-size: 0">${label}</span><span style="flex: none">${control}</span></div>`;
const sw = (label: string, on: boolean) =>
  `<input class="m-switch" type="checkbox" role="switch" aria-label="${label}"${on ? ' checked' : ''}>`;
const sel = (label: string, opts: string[]) =>
  `<select class="m-select" data-size="sm" aria-label="${label}" style="min-inline-size: 192px">${opts.map((o) => `<option>${o}</option>`).join('')}</select>`;
const chev = (value: string) =>
  `<span class="m-cluster" data-gap="1" style="${muted}; flex-wrap: nowrap">${value}${icon(I.right, 14)}</span>`;
const group = (id: string, title: string, rows: string, note = '') =>
  `          <section class="m-stack" data-gap="2" aria-labelledby="${id}">
            <h2 id="${id}" style="font-size: var(--m-font-size-md); ${semi}; padding-inline: var(--m-space-1)">${title}</h2>
            <div class="m-card" style="padding: 0 var(--m-space-4)">
${rows}
            </div>${note ? `\n            <p style="${small}; padding-inline: var(--m-space-1)">${note}</p>` : ''}
          </section>`;

const settings = shell(
  'Settings',
  `    <main class="m-stack" data-gap="6" style="${pad}">
${toolbar('Search settings', false)}
      <div class="m-stack" data-gap="6" style="max-inline-size: 720px">
        <h1 style="${pageTitle}">Settings</h1>
        <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Settings sections">
          <button type="button" class="m-tab" role="tab" aria-selected="true">Listening</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Concerts</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Storage</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Account</button>
        </div></div>
${group(
  'ar-set-play',
  'Playback',
  [
    row('Blend one track into the next', sw('Blend one track into the next', true)),
    row('Blend length', sel('Blend length', ['6 seconds', '3 seconds', '9 seconds', '12 seconds'])),
    row('Keep every record at the same loudness', sw('Keep every record at the same loudness', true), true),
  ].join('\n'),
)}
${group(
  'ar-set-sound',
  'Sound',
  [
    row('Streaming on Wi-Fi', sel('Streaming on Wi-Fi', ['Studio, up to 24-bit', 'High', 'Standard'])),
    row('Streaming on mobile data', sel('Streaming on mobile data', ['High', 'Standard', 'Studio, up to 24-bit'])),
    row('Downloads', sel('Download quality', ['Studio, up to 24-bit', 'High']), true),
  ].join('\n'),
  'Studio quality uses about 1.4 GB an hour. Downloads keep the quality they were saved in.',
)}
${group(
  'ar-set-account',
  'Account',
  [
    row('Plan', chev('Listen + Live')),
    row('Linked speakers', chev('3')),
    row('Show what I’m playing to people who follow me', sw('Show what I’m playing', false), true),
  ].join('\n'),
)}
        <section class="m-card" aria-label="Delete account" style="padding: var(--m-space-2) var(--m-space-4); align-items: flex-start">
          <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="${sm13}; --m-button-ghost-fg: var(--m-color-danger-fg); --m-button-font-weight: var(--m-font-weight-regular); padding-inline: 0">Delete account…</button>
        </section>
        <p style="${small}">Deleting removes your 6 mixes, 1,384 saved songs and listening history after 30 days.</p>
      </div>
%PLAYER%
    </main>`,
);

// Empty state: the page title, then a big thin glyph in grey, a 22px bold line, one sentence, the
// black pill and a blue link; a shelf of suggestions underneath
const emptyState = shell(
  'Downloads',
  `    <main class="m-stack" data-gap="8" style="${pad}">
${toolbar('Search downloads', false)}
      <h1 style="${pageTitle}">Downloads</h1>
      <section class="m-stack" data-gap="4" data-align="center" aria-labelledby="ar-empty" style="text-align: center; padding-block: var(--m-space-12)">
        <span style="color: var(--m-color-fg-subtle); display: inline-flex">${icon(I.download, 56)}</span>
        <h2 id="ar-empty" style="${title1}">Nothing downloaded yet</h2>
        <p style="font-size: var(--m-font-size-lg); ${muted}; max-inline-size: 416px">Records and mixes you download play without a connection, on the train or in the air.</p>
        <div class="m-cluster" data-gap="4" data-justify="center">
          <a class="m-button" data-variant="primary" href="#">Browse records</a>
          <a href="#" style="${link}">How downloads work</a>
        </div>
      </section>
      <section class="m-stack" data-gap="3" aria-labelledby="ar-suggest" style="border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default); padding-block-start: var(--m-space-6)">
        ${shelfHead('ar-suggest', 'Good for a long trip')}
        <div style="${shelfRow('clamp(144px, 15vw, 204px)')}">
            ${lockup(2, 'Long Run Tempo', 'Mix · 48 songs')}
            ${lockup(6, 'Quiet Engines', 'Teodor Kade')}
            ${lockup(0, 'Salt and Static', 'Mirela Sand')}
            ${lockup(3, 'Evening Arcade', 'Hollis Gray')}
        </div>
      </section>
%PLAYER%
    </main>`,
);

// Pricing: the public page. The local bar (name, links, a small black pill), a centred hero, then
// a big semibold heading with a grey second line, plan cards in the grouped grey with 18px corners:
// the tier, the price in grey, a rule, ticked lines and a pill; questions as hairline rows
const navbar = `<header class="m-navbar">
  <a class="m-navbar-brand m-cluster" data-gap="2" href="#">${mark('24px')} Sonder</a>
  <nav class="m-navbar-nav" aria-label="Main">
    <a class="m-navbar-link" href="#">Live sessions</a>
    <a class="m-navbar-link" href="#">Concerts</a>
    <a class="m-navbar-link" href="#" aria-current="page">Plans</a>
    <a class="m-navbar-link" href="#">Help</a>
  </nav>
  <div class="m-navbar-actions">
    <a class="m-button" data-variant="primary" data-size="sm" href="#" style="--m-button-font-size: var(--m-font-size-sm); --m-button-padding-x-sm: var(--m-space-3); --m-button-height-sm: 24px">Start free</a>
  </div>
</header>`;

// The tier and its price: 28px semibold, the price in grey
const planType =
  'font-family: var(--m-font-family-display); font-size: clamp(22px, 2.2vw, 28px); font-weight: var(--m-font-weight-semibold); letter-spacing: -0.005em; line-height: 1.15';
const plan = (id: string, name: string, price: string, points: string[], cta: string, primary = true) => `      <section class="m-card" aria-labelledby="ar-plan-${id}" style="--m-card-radius: 18px; --m-card-bg: var(--m-color-bg-canvas); padding: var(--m-space-10) var(--m-space-8) var(--m-space-8)">
        <div class="m-stack" data-gap="6" style="block-size: 100%">
          <div class="m-stack" data-gap="1">
            <h3 id="ar-plan-${id}" style="${planType}">${name}</h3>
            <p style="${planType}; ${muted}; ${nums}">${price}</p>
          </div>
          <hr class="m-divider" style="--m-divider-color: var(--m-color-fg-default)">
          <ul class="m-stack" data-gap="4" style="list-style: none; margin: 0; padding: 0; font-size: var(--m-font-size-xl); line-height: var(--m-font-leading-relaxed); flex: 1">
${points.map((p) => `            <li class="m-cluster" data-gap="2" data-align="start" style="flex-wrap: nowrap; font-size: var(--m-font-size-xl)"><span style="display: inline-flex; padding-block-start: 0.25em">${icon(I.check, 16).replace('stroke-width="1.75"', 'stroke-width="2.5"')}</span><span>${p}</span></li>`).join('\n')}
          </ul>
          <div><a class="m-button" ${primary ? 'data-variant="primary" ' : ''}href="#">${cta}</a></div>
        </div>
      </section>`;

const pricing = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
${navbar}
<main>
  <section class="m-container" style="padding-block: var(--m-space-16) var(--m-space-12); text-align: center" aria-labelledby="ar-price-hero">
    <div class="m-stack" data-gap="5" data-align="center">
      ${mark('56px')}
      <h1 id="ar-price-hero" style="font-family: var(--m-font-family-display); font-size: clamp(40px, 6vw, 70px); font-weight: var(--m-font-weight-bold); letter-spacing: -0.02em; line-height: 1.05; max-inline-size: 15ch">Every record. Every room it was played in.</h1>
      <p style="font-size: clamp(17px, 2vw, 21px); ${semi}; ${muted}; max-inline-size: 608px">Studio-quality streams, live sessions filmed on stage, and concerts near you, in one plan.</p>
      <a class="m-button" data-variant="primary" data-size="lg" href="#" style="--m-button-font-size: var(--m-font-size-xl)">Start a month free</a>
    </div>
  </section>
  <section style="background: var(--m-color-bg-surface); padding-block: var(--m-space-16)" aria-labelledby="ar-plans">
    <div class="m-container m-stack" data-gap="10">
      <div class="m-stack" data-gap="2">
        <h2 id="ar-plans" style="font-family: var(--m-font-family-display); font-size: clamp(32px, 4.5vw, 56px); font-weight: var(--m-font-weight-semibold); letter-spacing: -0.01em; line-height: 1.05">Pick how you listen.</h2>
        <p style="font-size: clamp(20px, 2.5vw, 28px); ${semi}; ${muted}">Switch plans whenever you like.</p>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 288px; --m-layout-grid-gap: var(--m-space-5); align-items: stretch">
${plan('listen', 'Listen', '$8.99 a month, first month free.', ['Every record in the catalogue, without ads', 'Studio quality, up to 24-bit', 'Download up to 10,000 songs', 'Time-synced lyrics on every device'], 'Start free')}
${plan('live', 'Listen + Live', '$13.99 a month, first month free.', ['Everything in Listen', 'Full live sessions, filmed on stage', 'Early tickets for concerts near you'], 'Start free')}
${plan('crew', 'Crew', '$21.99 a month for up to 5 people.', ['Listen + Live for everyone', 'Each person keeps their own crate and mixes', 'One bill, managed by you'], 'Start free')}
      </div>
    </div>
  </section>
  <section class="m-container" data-size="md" style="padding-block: var(--m-space-16)" aria-labelledby="ar-faq">
    <div class="m-stack" data-gap="6">
      <h2 id="ar-faq" style="font-family: var(--m-font-family-display); font-size: clamp(32px, 4.5vw, 48px); font-weight: var(--m-font-weight-semibold); letter-spacing: -0.01em; text-align: center">Good to know</h2>
      <div class="m-accordion" style="border: 0; --m-accordion-summary-size: var(--m-font-size-2xl)">
        <details class="m-accordion-item" name="ar-faq" open><summary>What happens after the free month?</summary><div class="m-accordion-content">Your plan carries on at its monthly price. We email you three days before, and you can stop it from Settings at any time.</div></details>
        <details class="m-accordion-item" name="ar-faq"><summary>Can I move from Listen to Crew later?</summary><div class="m-accordion-content">Yes. The change applies at once, and you pay the difference for the days left in the month.</div></details>
        <details class="m-accordion-item" name="ar-faq"><summary>Do live sessions count towards my downloads?</summary><div class="m-accordion-content">No. Sessions stream only, so your 10,000 songs stay free for records.</div></details>
      </div>
    </div>
  </section>
</main>
</div>`;

// Errors: the field (a red edge and a red line under it), the banner above the form saying nothing
// changed, the notification banner, and full pages for 404, 500 and no access in the system's shape
const errorPage = (code: string, glyphPaths: string, title: string, body: string, action: string, linkText: string) =>
  `      <section class="m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-12); border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)" aria-labelledby="ar-err-${code}">
        <span style="color: var(--m-color-fg-subtle); display: inline-flex">${icon(glyphPaths, 48)}</span>
        <div class="m-stack" data-gap="2" data-align="center">
          <span style="${small}; font-family: var(--m-font-family-mono)">Error ${code}</span>
          <h2 id="ar-err-${code}" style="${largeTitle}">${title}</h2>
          <p style="font-size: var(--m-font-size-lg); ${muted}; max-inline-size: 448px">${body}</p>
        </div>
        <div class="m-cluster" data-gap="4" data-justify="center"><a class="m-button" data-variant="primary" href="#">${action}</a><a href="#" style="${link}">${linkText}</a></div>
      </section>`;

const errors = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
<main class="m-container" data-size="md" style="padding-block: var(--m-space-12)">
  <div class="m-stack" data-gap="12">
    <section class="m-stack" data-gap="5" aria-labelledby="ar-err-form" style="max-inline-size: 448px; margin-inline: auto; inline-size: 100%">
      <h1 id="ar-err-form" style="${largeTitle}">Change your sign-in email</h1>
      <div class="m-alert" data-tone="danger" role="alert">
        <span class="m-alert-icon">${icon(I.alert, 16)}</span>
        <div class="m-alert-content"><div class="m-alert-title">2 things need fixing</div><div class="m-alert-body">Your email hasn’t changed yet.</div></div>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="ar-err-email">New email</label>
        <input class="m-input" id="ar-err-email" type="email" value="noor.okafor@mail" aria-invalid="true" aria-describedby="ar-err-email-e">
        <p class="m-field-error" id="ar-err-email-e">This email is missing its ending, like .com.</p>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="ar-err-pass">Current password</label>
        <input class="m-input" id="ar-err-pass" type="password" value="••••••••" aria-invalid="true" aria-describedby="ar-err-pass-e">
        <p class="m-field-error" id="ar-err-pass-e">That password doesn’t match. Try again or reset it.</p>
      </div>
      <div class="m-cluster" data-gap="3" data-justify="end">
        <button type="button" class="m-button" style="${sm13}">Cancel</button>
        <button type="submit" class="m-button" data-variant="primary" style="${sm13}">Save email</button>
      </div>
    </section>
    <section class="m-stack" data-gap="3" data-align="center" aria-label="A notification">
      <div class="m-toast" role="status" style="max-inline-size: 384px; inline-size: 100%">
        <div class="m-toast-content"><div class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap">${mark('36px')}<div><div class="m-toast-title">Couldn’t download Salt and Static</div><div class="m-toast-body">Your Mac is out of space. Free up 420 MB and try again.</div></div></div></div>
        <button type="button" class="m-toast-close" aria-label="Close">${icon('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', 14)}</button>
      </div>
    </section>
${errorPage('404', I.search, 'This page can’t be found', 'The link may be old, or the record may have moved.', 'Go to Pulse', 'Search Sonder')}
${errorPage('500', I.cloudOff, 'Sonder isn’t responding', 'It’s on our side, and nothing in your crate changed. Try again in a minute.', 'Try again', 'Service status')}
${errorPage('403', I.lock, 'This mix is private', 'Only Cass Arden and the people she invited can open it.', 'Go to Pulse', 'Ask for access')}
  </div>
</main>
</div>`;

export const ariaRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'The landing page: a 34px bold title, two wide editorial lockups, shelves of square art with a chevron title, a three-column song shelf with hairlines, round composer lockups and the floating capsule player; the sidebar library beside it.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'A record page: big art on a soft shadow, a bold title with the performer in blue, round shuffle and add beside the black Play pill, a hairline track list with the playing row marked; the detail is the lyrics pane, the current line in ink.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'A centred sheet: the mark, step dots, a big bold question, a search capsule, round picks with a blue tick, genre capsules (chosen ones black), one field, the black Continue pill and a blue Not now.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A big title, a segmented control, then grouped inset boxes in the grouped grey: rows split by hairlines with switches, selects and grey values with a chevron, grey footnotes, and Delete account in red last.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'The page title, then a big thin glyph in grey, a 22px bold line, one sentence, the black pill and a blue link, with a shelf of suggestions underneath.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The public page: a white local bar with a small black pill, a centred hero, a big semibold heading with a grey second line, plan cards with 18px corners and ticked lines, and questions as hairline rows.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'A red edge and a red line under the field, a banner above the form saying nothing changed, the notification banner, and full pages for 404, 500 and no access with a black pill and a blue link.',
    html: errors,
  },
];
