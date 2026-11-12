import type { ArchetypeRecipe } from '../types';

/*
 * Marquee's seven page shapes: framework-free HTML using only @mariachi/design classes and tokens (no
 * colour literals), with sample data from a made-up film-club streaming app, "Foxglove". They follow
 * the language's real screen patterns: a black top bar over a big rounded billboard with white and
 * grey pills, rows of rounded 16:9 stills and 2:3 posters (token gradients stand in for artwork) with
 * red progress bars, ranked and "new" tags, a card grown into its preview, the title modal with its
 * episode list, the profile picker, and the plain light account pages. Every name, number, label and
 * nav item is invented.
 */

// Lucide icons, outlined at 2px (the reference's glyphs are bold and round); play is filled, as the
// reference fills it
const icon = (paths: string, size = 20, filled = false) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  play: '<path d="M6 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L7.5 3.64A1 1 0 0 0 6 4.5z"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  thumbsUp:
    '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  searchX: '<path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  circleX: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  alert:
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  award:
    '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',
  volumeX:
    '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',
  clapper:
    '<path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  pencil:
    '<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/><path d="m15 5 4 4"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  cloudOff:
    '<path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193"/><path d="M21.532 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.008 7.008 0 0 0 10 5.07"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  monitorPlay:
    '<path d="M10 7.75a.75.75 0 0 1 1.142-.638l3.664 2.249a.75.75 0 0 1 0 1.278l-3.664 2.25a.75.75 0 0 1-1.142-.64z"/><path d="M12 17v4"/><path d="M8 21h8"/><rect x="2" y="3" width="20" height="14" rx="2"/>',
  captions: '<rect width="18" height="14" x="3" y="5" rx="2" ry="2"/><path d="M7 15h4M15 15h2M7 11h2M13 11h4"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  rocket:
    '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  feather:
    '<path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/>',
  globe:
    '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  download: '<path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/>',
};

// Text styles: 48px page titles, 32px section titles, 24px row titles, 18px synopses, 13px kickers
const hero =
  'font-family: var(--m-font-family-display); font-size: clamp(2.25rem, 5vw, 3.5rem); font-weight: var(--m-font-weight-bold); line-height: 1.05';
const h1 =
  'font-family: var(--m-font-family-display); font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-bold); line-height: var(--m-font-leading-tight)';
const rowTitle =
  'font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); line-height: var(--m-font-leading-tight)';
const bold = 'font-weight: var(--m-font-weight-bold)';
const medium = 'font-weight: var(--m-font-weight-medium)';
const small = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
const tiny = 'font-size: var(--m-font-size-xs); color: var(--m-color-fg-muted)';
const kicker =
  'font-size: 0.8125rem; font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-wide); text-transform: uppercase; color: var(--m-color-fg-muted)';
const nums = 'font-variant-numeric: tabular-nums';
const clip = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis';
// Text that sits on artwork stays white in both modes
const onArt = 'color: var(--m-color-accent-fg)';

// Button treatments drawn with the button's own tokens: the white "Play" pill, the round outlined
// card button, and bigger labels on 48px pills
const big = '--m-button-font-size: var(--m-font-size-lg)';
const whitePill =
  '--m-button-primary-bg: var(--m-color-bg-inverse); --m-button-primary-border: var(--m-color-bg-inverse); --m-button-primary-fg: var(--m-color-fg-inverse); --m-button-primary-hover-bg: var(--m-color-fg-muted); --m-button-primary-active-bg: var(--m-color-fg-muted)';
const roundVars =
  '--m-button-secondary-bg: var(--m-color-bg-raised); --m-button-secondary-border: var(--m-color-border-strong); --m-button-secondary-hover-bg: var(--m-color-bg-raised); --m-button-border-width: 2px';
const round = (label: string, ic: string, extra = '') =>
  `<button type="button" class="m-button" data-icon-only aria-label="${label}" style="${roundVars}${extra}">${icon(ic, 20)}</button>`;
const iconBtn = (label: string, ic: string, size = 20, extra = '') =>
  `<button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="${label}"${extra}>${icon(ic, size)}</button>`;
const playPill = (label = 'Play', size = '') =>
  `<a class="m-button" data-variant="primary"${size ? ` data-size="${size}"` : ''} href="#" style="${whitePill}${size === 'lg' ? `; ${big}` : ''}">${icon(I.play, 22, true)} ${label}</a>`;

// Artwork stands in as token gradients: no stills, posters or title art ship
const grads = [
  'linear-gradient(150deg, var(--m-color-info-solid), var(--m-color-accent-active) 75%)',
  'linear-gradient(160deg, var(--m-color-warning-solid), var(--m-color-accent-active) 80%)',
  'linear-gradient(140deg, var(--m-color-success-solid), var(--m-color-info-solid) 85%)',
  'linear-gradient(170deg, var(--m-color-brand-default), var(--m-color-accent-active) 70%)',
  'linear-gradient(130deg, var(--m-color-accent-active), var(--m-color-info-solid))',
  'linear-gradient(160deg, var(--m-color-info-solid), var(--m-color-success-solid) 90%)',
  'linear-gradient(150deg, var(--m-color-warning-solid), var(--m-color-success-solid) 85%)',
  'linear-gradient(120deg, var(--m-color-accent-active), var(--m-color-warning-solid))',
];
const shade = 'linear-gradient(to top, var(--m-color-bg-overlay), transparent 55%)';
// A piece of artwork: a ratio, a gradient, a shade at the foot, the title set on it, and extras
// (tags, a progress bar) laid over it
const art = (n: number, ratio: string, title = '', over = '', radius = '12px') =>
  `<span aria-hidden="true" style="position: relative; display: block; aspect-ratio: ${ratio}; border-radius: ${radius}; overflow: hidden; background: ${shade}, ${grads[n % grads.length]}">${title ? `<span style="position: absolute; inset-inline: var(--m-space-3); inset-block-end: ${over.includes('m-badge') ? 'var(--m-space-8)' : 'var(--m-space-3)'}; ${onArt}; font-family: var(--m-font-family-display); font-weight: var(--m-font-weight-bold); font-size: var(--m-font-size-lg); line-height: 1.05; text-wrap: balance">${title}</span>` : ''}${over}</span>`;

// The app's own mark: a red tile with a Lucide clapperboard beside a plain wordmark (invented)
const mark = (size = '1.75rem') =>
  `<span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: ${size}; block-size: ${size}; border-radius: var(--m-radius-sm); background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">${icon(I.clapper, 16)}</span>`;

// Profiles: rounded squares in a gradient with a glyph
const profiles: [string, number, string][] = [
  ['Ines', 0, I.moon],
  ['Dario', 6, I.rocket],
  ['Mila', 3, I.feather],
  ['Joon', 2, I.leaf],
];
const face = (n: number, glyph: string, size: string, glyphSize = 20) =>
  `<span aria-hidden="true" style="display: inline-grid; place-items: center; flex: none; inline-size: ${size}; block-size: ${size}; border-radius: var(--m-radius-sm); background: ${grads[n]}; ${onArt}">${icon(glyph, glyphSize)}</span>`;

// The top bar: the mark, our own sections (the current one white and bold), search, the bell with
// its red count, and the profile square with a caret
const sections = ['Programme', 'Retrospectives', 'Directors', 'Shorts', 'Archive', 'Festival'];
const topBar = (current: string) => `<header class="m-navbar" data-sticky>
  <a class="m-navbar-brand" href="#">${mark()}<span>Foxglove</span></a>
  <nav class="m-navbar-nav" aria-label="Main">
${sections.map((s) => `    <a class="m-navbar-link" href="#"${s === current ? ` aria-current="page" style="${bold}"` : ''}>${s}</a>`).join('\n')}
  </nav>
  <div class="m-navbar-actions m-cluster" data-gap="1" style="flex-wrap: nowrap">
    ${iconBtn('Search', I.search, 22)}
    <span style="position: relative; display: inline-flex">${iconBtn('Notifications, 3 new', I.bell, 22)}<span aria-hidden="true" style="position: absolute; inset-block-start: var(--m-space-1); inset-inline-end: var(--m-space-1); display: inline-grid; place-items: center; min-inline-size: 1rem; block-size: 1rem; padding-inline: var(--m-space-1); border-radius: 9999px; background: var(--m-color-brand-default); color: var(--m-color-brand-fg); font-size: 0.625rem; ${bold}">3</span></span>
    <button type="button" class="m-button" data-variant="ghost" aria-label="Ines: switch profile or open the account" style="--m-button-padding-x-md: var(--m-space-1); gap: var(--m-space-1)">${face(0, I.moon, '2rem', 16)}${icon(I.down, 16)}</button>
  </div>
</header>`;

// A row: the 24px title with an "all" chevron, the page dashes on the right, then the cards in one
// line that runs off the edge, with the grey next arrow
const dashes = (n: number, current = 0) =>
  `<span class="m-cluster" data-gap="1" aria-hidden="true" style="flex-wrap: nowrap">${Array.from({ length: n }, (_, i) => `<span style="display: block; inline-size: 0.75rem; block-size: 2px; background: ${i === current ? 'var(--m-color-fg-default)' : 'var(--m-color-border-default)'}"></span>`).join('')}</span>`;
const row = (id: string, title: string, cards: string, opts: { pages?: number; align?: string } = {}) =>
  `    <section class="m-stack" data-gap="3" aria-labelledby="${id}">
      <div class="m-cluster" data-justify="between">
        <h2 id="${id}" style="${rowTitle}"><a href="#" class="m-cluster" data-gap="2" style="color: inherit; text-decoration: none; flex-wrap: nowrap">${title}<span style="color: var(--m-color-fg-muted); display: inline-flex">${icon(I.right, 20)}</span></a></h2>
        ${dashes(opts.pages ?? 4)}
      </div>
      <div style="position: relative">
        <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap; overflow: hidden; align-items: ${opts.align ?? 'flex-start'}; padding-block-end: var(--m-space-1)">
${cards}
        </div>
        <button type="button" class="m-button" aria-label="Next titles in ${title}" style="position: absolute; inset-inline-end: calc(var(--m-space-2) * -1); inset-block-start: 50%; translate: 0 -50%; inline-size: 1.75rem; block-size: 5rem; padding: 0">${icon(I.right, 20)}</button>
      </div>
    </section>`;

// A 16:9 still in the "still watching" row: the red bar at its foot, the title and what's left
const still = (n: number, title: string, left: string, pct: number) =>
  `          <a href="#" class="m-stack" data-gap="2" style="flex: 0 0 clamp(14rem, 23%, 22rem); color: var(--m-color-fg-default); text-decoration: none">
            ${art(n, '16 / 9', title, `<progress class="m-progress" data-size="sm" value="${pct}" max="100" aria-label="${pct}% watched" style="position: absolute; inset-inline: 0; inset-block-end: 0; --m-progress-radius: 0">${pct}%</progress>`)}
            <span style="${small}; ${nums}; ${clip}">${left}</span>
          </a>`;

// A ranked still: the red rank tag in the corner, a "new" tag on the art's foot
const rankTag = (n: number) =>
  `<span style="position: absolute; inset-block-start: 0; inset-inline-end: var(--m-space-2); display: grid; place-items: center; padding: var(--m-space-1) var(--m-space-2); border-end-start-radius: var(--m-radius-sm); border-end-end-radius: var(--m-radius-sm); background: var(--m-color-brand-default); color: var(--m-color-brand-fg); font-size: var(--m-font-size-xs); ${bold}; line-height: 1.1; text-align: center">No.<br><span style="font-size: var(--m-font-size-lg)">${n}</span></span>`;
const newTag = (label: string) =>
  `<span class="m-badge" data-tone="accent" data-variant="solid" style="position: absolute; inset-block-end: 0; inset-inline-start: 50%; translate: -50% 0; --m-badge-radius: var(--m-radius-sm) var(--m-radius-sm) 0 0; --m-badge-font-size: var(--m-font-size-sm); --m-badge-height: 1.5rem; font-weight: var(--m-font-weight-bold); white-space: nowrap">${label}</span>`;
const ranked = (n: number, rank: number, title: string, tag = '') =>
  `          <a href="#" aria-label="${title}, number ${rank} today" style="flex: 0 0 clamp(14rem, 23%, 22rem); display: block">${art(n, '16 / 9', title, `${rankTag(rank)}${tag ? newTag(tag) : ''}`)}</a>`;

// A 2:3 poster with its title under it (the public pages' rows)
const poster = (n: number, title: string, tag = '') =>
  `          <a href="#" class="m-stack" data-gap="2" style="flex: 0 0 clamp(9rem, 15%, 12rem); color: var(--m-color-fg-default); text-decoration: none; text-align: center">${art(n, '2 / 3', '', tag ? newTag(tag) : '')}<span style="font-size: var(--m-font-size-sm); ${clip}">${title}</span></a>`;

// The hovered card grown into its preview: the still, the round buttons, the score, the rating box,
// the length and quality, and the moods
const preview = (n: number, title: string) =>
  `          <article aria-label="${title}, preview" style="flex: 0 0 clamp(18rem, 30%, 26rem); border-radius: 12px; overflow: hidden; background: var(--m-color-bg-raised); box-shadow: var(--m-shadow-md); position: relative; z-index: 1">
            ${art(n, '16 / 9', title, `<span style="position: absolute; inset-block-start: var(--m-space-2); inset-inline-end: var(--m-space-2)">${iconBtn('Sound off', I.volumeX, 18, ` data-size="sm" style="${roundVars}; --m-button-ghost-fg: var(--m-color-accent-fg)"`)}</span>`, '0')}
            <div class="m-stack" data-gap="3" style="padding: var(--m-space-4)">
              <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap">
                <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap">
                  <a class="m-button" data-variant="primary" data-icon-only href="#" aria-label="Play ${title}" style="${whitePill}">${icon(I.play, 20, true)}</a>
                  ${round('Save for later', I.plus)}
                  ${round('Rate it', I.thumbsUp)}
                </div>
                ${round(`More about ${title}`, I.down)}
              </div>
              <div class="m-cluster" data-gap="2" style="${nums}">
                <span style="color: var(--m-color-success-fg); ${bold}">92% for you</span>
                <span class="m-badge">16+</span>
                <span style="color: var(--m-color-fg-muted)">1h 48m</span>
                <span class="m-badge" style="--m-badge-height: 1rem; --m-badge-padding-x: 0.25rem; font-size: 0.625rem">HD</span>
              </div>
              <p class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-sm)">Tense <span aria-hidden="true" style="color: var(--m-color-fg-subtle)">•</span> Slow-burn <span aria-hidden="true" style="color: var(--m-color-fg-subtle)">•</span> Coastal</p>
            </div>
          </article>`;

// The billboard: a rounded panel of "still" (token light and shade), the title, a meta line, the
// synopsis, the white Play pill and the grey "More info" pill; an award chip and a mute button
const billboard = `    <section aria-labelledby="mq-bb-title" style="position: relative; display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: var(--m-space-4); min-block-size: clamp(26rem, 62vh, 40rem); border-radius: 20px; overflow: hidden; background: linear-gradient(to right, var(--m-color-bg-overlay) 0%, transparent 65%), linear-gradient(to top, var(--m-color-bg-overlay), transparent 45%), radial-gradient(circle at 72% 30%, var(--m-color-warning-solid), transparent 42%), linear-gradient(120deg, var(--m-color-accent-active), var(--m-color-info-solid))">
      <div class="m-stack" data-gap="4" style="padding: clamp(1.5rem, 4vw, 3rem); max-inline-size: 38rem; ${onArt}">
        <span style="${kicker}; ${onArt}">Limited series</span>
        <h1 id="mq-bb-title" style="${hero}">The Salt Road</h1>
        <p class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-md); ${nums}"><span style="${medium}">Thriller</span><span aria-hidden="true">•</span><span style="${medium}">2026</span><span aria-hidden="true">•</span><span style="${medium}">6 episodes</span><span aria-hidden="true">•</span><span>16+</span></p>
        <p style="font-size: var(--m-font-size-lg); line-height: var(--m-font-leading-normal)">A ferry pilot inherits her father's debts and his last unfinished route, a crossing nobody on the island will talk about.</p>
        <div class="m-cluster" data-gap="3">
          ${playPill('Play', 'lg')}
          <a class="m-button" data-size="lg" href="#" style="${big}">${icon(I.info, 22)} More info</a>
        </div>
      </div>
      <div class="m-cluster" data-gap="3" style="padding: 0 clamp(1.5rem, 4vw, 2rem) clamp(1.5rem, 4vw, 2rem); flex-wrap: nowrap">
        <span class="m-cluster" data-gap="2" style="padding: var(--m-space-2) var(--m-space-3); border-radius: var(--m-radius-md); background: var(--m-color-bg-overlay); ${onArt}; font-size: var(--m-font-size-sm); ${medium}; flex-wrap: nowrap">${icon(I.award, 16)} Festival winner</span>
      </div>
    </section>`;

const dashboard = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas); color: var(--m-color-fg-default)">
${topBar('Programme')}
<main class="m-stack" data-gap="10" style="padding: var(--m-space-3) clamp(1rem, 4vw, 3.75rem) var(--m-space-16)">
${billboard}
${row(
  'mq-still',
  'Still watching for Ines',
  [
    still(0, 'Undertow', 'S1 E4 · 31m left', 62),
    still(3, 'Night Ferry', '1h 12m left', 24),
    still(5, 'Paper Moons', 'S2 E1 · 44m left', 9),
    still(1, 'Copperline', 'S1 E8 · 9m left', 88),
    still(2, 'Midsummer Static', 'S3 E2 · 22m left', 47),
  ].join('\n'),
  { pages: 2 },
)}
${row(
  'mq-ranked',
  'Most watched in the club today',
  [
    ranked(4, 1, 'A Quiet Heist', 'New episodes'),
    ranked(6, 2, 'Low Tide Kings'),
    ranked(0, 3, 'Orbit of Small Things', 'Recently added'),
    ranked(7, 4, 'The Ninth Lighthouse'),
    ranked(2, 5, 'Still Water Club'),
  ].join('\n'),
  { pages: 3 },
)}
${row(
  'mq-festival',
  'Festival picks',
  [
    poster(3, 'Wolves of Tallinn', 'New'),
    preview(1, 'Blue Hour'),
    poster(5, 'The Cartographer’s Daughter'),
    poster(7, 'Kettle Lake'),
    poster(0, 'Second Unit'),
    poster(6, 'Velvet Static'),
  ].join('\n'),
  { pages: 5 },
)}
</main>
</div>`;

// List and detail: the title modal over the dimmed browse page. The still with the title, Play and
// round buttons; the facts in two columns; the episode list with a season select; more like this
const episode = (
  n: number,
  title: string,
  len: string,
  body: string,
  opts: { current?: boolean; watched?: number } = {},
) =>
  `          <li class="m-cluster" data-gap="4" style="flex-wrap: nowrap; align-items: center; padding: var(--m-space-6) var(--m-space-4); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)${opts.current ? '; background: var(--m-color-bg-surface); border-radius: var(--m-radius-sm)' : ''}">
            <span style="flex: none; inline-size: 1.5rem; text-align: center; font-size: var(--m-font-size-2xl); color: var(--m-color-fg-muted); ${nums}">${n}</span>
            <span style="flex: 0 0 clamp(6rem, 20%, 9rem)">${art(n + 1, '16 / 9', '', opts.watched ? `<progress class="m-progress" data-size="sm" value="${opts.watched}" max="100" aria-label="${opts.watched}% watched" style="position: absolute; inset-inline: 0; inset-block-end: 0; --m-progress-radius: 0">${opts.watched}%</progress>` : '', 'var(--m-radius-sm)')}</span>
            <span class="m-stack" data-gap="2" style="min-inline-size: 0; flex: 1">
              <span class="m-cluster" data-justify="between" style="flex-wrap: nowrap"><span style="${bold}; ${clip}">${title}</span><span style="${nums}; flex: none">${len}</span></span>
              <span style="${small}; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden">${body}</span>
            </span>
          </li>`;

const likeCard = (n: number, title: string, score: string, rating: string, year: string, body: string) =>
  `          <article class="m-card" style="padding: 0; overflow: hidden; --m-card-radius: var(--m-radius-sm); --m-card-bg: var(--m-color-bg-surface)">
            ${art(n, '16 / 9', title, '', '0')}
            <div class="m-stack" data-gap="3" style="padding: var(--m-space-4)">
              <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap">
                <div class="m-stack" data-gap="1"><span style="color: var(--m-color-success-fg); ${bold}; font-size: var(--m-font-size-sm)">${score}</span><span class="m-cluster" data-gap="2" style="${nums}; font-size: var(--m-font-size-sm)"><span class="m-badge">${rating}</span><span style="color: var(--m-color-fg-muted)">${year}</span></span></div>
                ${round(`Save ${title} for later`, I.plus)}
              </div>
              <p style="${small}">${body}</p>
            </div>
          </article>`;

const fact = (label: string, value: string) =>
  `<p style="font-size: var(--m-font-size-sm)"><span style="color: var(--m-color-fg-subtle)">${label}</span> ${value}</p>`;

const listDetail = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas); color: var(--m-color-fg-default)">
${topBar('Retrospectives')}
<div style="background: var(--m-color-bg-overlay); padding: var(--m-space-8) var(--m-space-4) var(--m-space-16)">
  <div class="m-dialog" data-static data-size="lg" role="dialog" aria-labelledby="mq-title" style="--m-dialog-padding: 0; margin-inline: auto; overflow: hidden; max-inline-size: 100%; max-block-size: none">
    <div style="position: relative">
      ${art(0, '16 / 8', '', '', '0')}
      <span style="position: absolute; inset-block-start: var(--m-space-4); inset-inline-end: var(--m-space-4)"><button type="button" class="m-button" data-icon-only aria-label="Close" style="--m-button-secondary-bg: var(--m-color-bg-raised); --m-button-secondary-border: var(--m-color-bg-raised)">${icon(I.x, 22)}</button></span>
      <div class="m-stack" data-gap="4" style="position: absolute; inset-inline: clamp(1rem, 4vw, 3rem); inset-block-end: clamp(1rem, 4vw, 3rem); ${onArt}">
        <h1 id="mq-title" style="${hero}">Undertow</h1>
        <div class="m-cluster" data-justify="between">
          <div class="m-cluster" data-gap="2">
            ${playPill('Resume')}
            ${round('Saved for later', I.check)}
            ${round('Rate it', I.thumbsUp)}
          </div>
          ${round('Sound off', I.volumeX)}
        </div>
      </div>
    </div>
    <div class="m-stack" data-gap="10" style="padding: var(--m-space-6) clamp(1rem, 4vw, 3rem) var(--m-space-12)">
      <div class="m-cluster" style="gap: var(--m-space-8); align-items: flex-start">
        <div class="m-stack" data-gap="3" style="flex: 2 1 22rem">
          <p class="m-cluster" data-gap="2" style="${nums}"><span style="color: var(--m-color-success-fg); ${bold}">96% for you</span><span style="color: var(--m-color-fg-muted)">2026</span><span style="color: var(--m-color-fg-muted)">8 episodes</span><span class="m-badge" style="--m-badge-height: 1rem; --m-badge-padding-x: 0.25rem; font-size: 0.625rem">HD</span><span class="m-badge" style="--m-badge-height: 1rem; --m-badge-padding-x: 0.25rem; font-size: 0.625rem">AD</span></p>
          <p class="m-cluster" data-gap="2"><span class="m-badge">16+</span><span style="${small}">Violence, strong language</span></p>
          <p class="m-cluster" data-gap="2" style="${bold}"><span style="display: inline-grid; place-items: center; inline-size: 1.75rem; block-size: 1.75rem; border-radius: var(--m-radius-sm); background: var(--m-color-brand-default); color: var(--m-color-brand-fg); font-size: var(--m-font-size-sm)">4</span> Most watched series in the club today</p>
          <p style="font-size: var(--m-font-size-lg)">Two estranged divers return to the flooded quarry town where they grew up, and find the water level is the only thing that hasn't changed.</p>
        </div>
        <div class="m-stack" data-gap="3" style="flex: 1 1 13rem">
          ${fact('With:', 'Amara Quist, Teodor Vance, Lucía Brenner, <a href="#" style="color: inherit; font-style: italic">more</a>')}
          ${fact('Genres:', 'Mystery series, Drama, Scandinavian')}
          ${fact('Mood:', 'Brooding, Suspenseful')}
        </div>
      </div>
      <section class="m-stack" data-gap="4" aria-labelledby="mq-eps">
        <div class="m-cluster" data-justify="between">
          <h2 id="mq-eps" style="${rowTitle}">Episodes</h2>
          <select class="m-select" aria-label="Season" style="inline-size: auto; min-inline-size: 9rem; ${bold}"><option>Season 1</option><option>Season 2</option></select>
        </div>
        <p style="${small}">Season 1: <span style="${medium}">16+</span> Violence, strong language</p>
        <ol class="m-stack" data-gap="0" style="list-style: none; padding: 0; border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)">
${episode(1, 'The Quarry Gate', '52m', 'Helle comes home for her aunt’s funeral and finds the diving school boarded up and her old partner living above it.', { watched: 100 })}
${episode(2, 'Silt', '48m', 'A camera found at the bottom of the quarry holds footage from the night of the flood. Joakim wants nothing to do with it.', { current: true, watched: 58 })}
${episode(3, 'Pressure', '55m', 'The two dive the old pumping station together for the first time in eleven years, and the town council notices.')}
${episode(4, 'Slack Water', '50m', 'A storm cuts the town off for a night. Helle shares a kitchen table with the man she blames for everything.')}
        </ol>
      </section>
      <section class="m-stack" data-gap="4" aria-labelledby="mq-like">
        <h2 id="mq-like" style="${rowTitle}">More like this</h2>
        <div class="m-grid" style="--m-layout-grid-min: 14rem; --m-layout-grid-gap: var(--m-space-4)">
${likeCard(4, 'Low Tide Kings', '91% for you', '13+', '2025', 'Three brothers run the last oyster farm on a sinking coast and the worst year of their lives at the same time.')}
${likeCard(7, 'Kettle Lake', '88% for you', '16+', '2024', 'A park ranger reopens a cold case after the lake gives back a car that was never reported missing.')}
${likeCard(2, 'Still Water Club', '84% for you', '12+', '2026', 'A winter swimming club, a missing member and a town that would rather keep swimming.')}
        </div>
      </section>
    </div>
  </div>
</div>
</div>`;

// Onboarding: the profile picker on black (a big title, rounded-square profiles with names, an add
// tile, an outlined "Edit profiles"), then the new profile's form in a 28rem column
const pickTile = (name: string, n: number, glyph: string, current = false) =>
  `      <a href="#" class="m-stack" data-gap="3" data-align="center" style="color: var(--m-color-fg-muted); text-decoration: none; inline-size: clamp(5.5rem, 14vw, 9rem)">
        <span style="display: block; inline-size: 100%; border-radius: var(--m-radius-sm); ${current ? 'outline: 3px solid var(--m-color-fg-default); outline-offset: 0' : ''}">${face(n, glyph, '100%', 48).replace('inline-size: 100%; block-size: 100%', 'inline-size: 100%; aspect-ratio: 1')}</span>
        <span style="${current ? 'color: var(--m-color-fg-default)' : ''}; font-size: var(--m-font-size-lg)">${name}</span>
      </a>`;
const glyphPick = (n: number, glyph: string, on = false) =>
  `<button type="button" aria-pressed="${on}" aria-label="Choose this picture" style="padding: 0; border: 0; background: none; cursor: pointer; border-radius: var(--m-radius-sm); ${on ? 'outline: 3px solid var(--m-color-fg-default); outline-offset: 2px' : ''}">${face(n, glyph, '3.5rem', 24)}</button>`;

const onboarding = `<div style="min-block-size: 100vh; background: var(--m-color-bg-sunken); color: var(--m-color-fg-default)">
<header class="m-cluster" style="padding: var(--m-space-6) clamp(1rem, 4vw, 3.75rem)"><a href="#" class="m-cluster" data-gap="2" style="color: var(--m-color-fg-default); text-decoration: none; font-family: var(--m-font-family-display); font-size: var(--m-font-size-xl); ${bold}">${mark()} Foxglove</a></header>
<main class="m-stack" data-gap="12" style="padding: var(--m-space-8) var(--m-space-4) var(--m-space-16)">
  <section class="m-stack" data-gap="8" data-align="center" aria-labelledby="mq-pick" style="text-align: center">
    <div class="m-stack" data-gap="2" data-align="center">
      <span style="${kicker}">Step 2 of 3</span>
      <h1 id="mq-pick" style="font-family: var(--m-font-family-display); font-size: clamp(2rem, 4vw, var(--m-font-size-4xl)); ${bold}; line-height: var(--m-font-leading-tight)">Who's settling in?</h1>
    </div>
    <div class="m-cluster" data-gap="6" data-justify="center" style="align-items: flex-start">
${profiles.map(([name, n, g], i) => pickTile(name, n, g, i === 0)).join('\n')}
      <a href="#" class="m-stack" data-gap="3" data-align="center" style="color: var(--m-color-fg-muted); text-decoration: none; inline-size: clamp(5.5rem, 14vw, 9rem)">
        <span style="display: grid; place-items: center; inline-size: 100%; aspect-ratio: 1; border-radius: var(--m-radius-sm)"><span style="display: grid; place-items: center; inline-size: 50%; aspect-ratio: 1; border-radius: 50%; background: var(--m-color-bg-surface); color: var(--m-color-fg-muted)">${icon(I.plus, 40)}</span></span>
        <span style="font-size: var(--m-font-size-lg)">Add profile</span>
      </a>
    </div>
    <a class="m-button" data-size="lg" href="#" style="--m-button-secondary-bg: transparent; --m-button-secondary-border: var(--m-color-fg-muted); --m-button-secondary-fg: var(--m-color-fg-muted); --m-button-secondary-hover-bg: transparent; letter-spacing: 0.1em">Edit profiles</a>
  </section>
  <section class="m-container" data-size="sm" aria-labelledby="mq-new" style="inline-size: 100%">
    <form class="m-card m-stack" data-gap="6" style="--m-card-bg: var(--m-color-bg-raised)">
      <div class="m-stack" data-gap="2">
        <h2 id="mq-new" style="${h1}">Add a profile</h2>
        <p style="${small}">Each profile gets its own picks, its own list and its own place in what you were watching.</p>
      </div>
      <div class="m-stack" data-gap="2">
        <span style="font-size: var(--m-font-size-sm); ${medium}">Picture</span>
        <div class="m-cluster" data-gap="3" role="group" aria-label="Picture">${glyphPick(7, I.leaf, true)}${glyphPick(4, I.rocket)}${glyphPick(5, I.moon)}${glyphPick(1, I.feather)}</div>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="mq-name">Name</label>
        <input class="m-input" id="mq-name" value="" placeholder="Name" aria-invalid="true" aria-describedby="mq-name-e">
        <p class="m-field-error m-cluster" data-gap="1" id="mq-name-e" style="flex-wrap: nowrap">${icon(I.circleX, 16)} Give this profile a name.</p>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="mq-lang">Language</label>
        <select class="m-select" id="mq-lang"><option>English</option><option>Português</option><option>Deutsch</option></select>
      </div>
      <label class="m-cluster" data-justify="between" style="flex-wrap: nowrap; gap: var(--m-space-6)">
        <span class="m-stack" data-gap="1"><span style="${medium}">A younger viewer’s profile</span><span style="${small}">Only titles rated 12+ and under, with a simpler home.</span></span>
        <input class="m-switch" type="checkbox" role="switch">
      </label>
      <div class="m-cluster" data-gap="3">
        <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="${big}; flex: 1">Continue</button>
        <button type="button" class="m-button" data-size="lg" style="${big}">Cancel</button>
      </div>
    </form>
  </section>
</main>
</div>`;

// Settings: the light account page. A plain bar, "Back to Foxglove", the account nav with outline
// icons (the current item bold), a 32px title, small grey section labels and white 8px cards with
// chevron rows; the plan card wears the gradient bar along its top
const acctNav: [string, string][] = [
  ['Viewing', I.monitorPlay],
  ['Subtitles', I.captions],
  ['Ratings history', I.history],
  ['Notifications', I.bell],
  ['Plan', I.card],
  ['Sign-in', I.shield],
];
const chevRow = (label: string, sub = '', end = '') =>
  `          <a href="#" class="m-cluster" data-justify="between" style="flex-wrap: nowrap; gap: var(--m-space-4); padding: var(--m-space-4) 0; margin-inline: var(--m-space-6); border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default); color: var(--m-color-fg-default); text-decoration: none">
            <span class="m-stack" data-gap="1"><span style="${medium}">${label}</span>${sub ? `<span style="${small}">${sub}</span>` : ''}</span>
            <span class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${end}<span style="color: var(--m-color-fg-muted); display: inline-flex">${icon(I.right, 20)}</span></span>
          </a>`;
const switchRow = (label: string, sub: string, on: boolean) =>
  `          <label class="m-cluster" data-justify="between" style="flex-wrap: nowrap; gap: var(--m-space-6); padding: var(--m-space-4) 0; margin-inline: var(--m-space-6); border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)">
            <span class="m-stack" data-gap="1"><span style="${medium}">${label}</span><span style="${small}">${sub}</span></span>
            <input class="m-switch" type="checkbox" role="switch"${on ? ' checked' : ''}>
          </label>`;
const acctCard = (inner: string, top = '') =>
  `        <div class="m-card" style="padding: 0; overflow: hidden; --m-card-radius: var(--m-radius-md); --m-card-gap: 0">${top}
${inner}
        </div>`;

const settings = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas); color: var(--m-color-fg-default)">
<header class="m-navbar">
  <a class="m-navbar-brand" href="#">${mark()}<span>Foxglove</span></a>
  <div class="m-navbar-actions" style="margin-inline-start: auto">${face(0, I.moon, '2rem', 16)}</div>
</header>
<div class="m-container" style="padding-block: var(--m-space-8) var(--m-space-16); max-inline-size: 76rem">
  <div class="m-split">
    <nav class="m-sidebar" aria-label="Account">
      <a href="#" class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-sm); color: var(--m-color-fg-default); text-decoration: none; margin-block-end: var(--m-space-6)">${icon(I.arrowLeft, 18)} Back to Foxglove</a>
      <div class="m-sidebar-section">
        <ul>
${acctNav.map(([l, g]) => `          <li><a class="m-sidebar-link" href="#"${l === 'Viewing' ? ' aria-current="page"' : ''} style="gap: var(--m-space-3)">${icon(g, 22)} ${l}</a></li>`).join('\n')}
        </ul>
      </div>
    </nav>
    <main class="m-stack" data-gap="8" style="max-inline-size: 46rem">
      <div class="m-stack" data-gap="2">
        <h1 style="${h1}">Viewing</h1>
        <p style="${small}">For Ines on every screen. Other profiles keep their own.</p>
      </div>
      <section class="m-stack" data-gap="3" aria-labelledby="mq-s-play">
        <h2 id="mq-s-play" style="${small}; font-weight: var(--m-font-weight-regular)">Playback</h2>
${acctCard(
  [
    switchRow('Play the next episode on its own', 'After the credits start, with a 10-second countdown.', true),
    switchRow('Play trailers while browsing', 'On the billboard and when a card opens.', false),
    `          <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; gap: var(--m-space-6); padding: var(--m-space-4) 0; margin-inline: var(--m-space-6); border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)">
            <span class="m-stack" data-gap="1"><label for="mq-q" style="${medium}">Picture quality</label><span style="${small}">Higher quality uses more data.</span></span>
            <select class="m-select" id="mq-q" style="inline-size: auto; min-inline-size: 10rem"><option>Automatic</option><option>Data saver</option><option>Best</option></select>
          </div>`,
  ]
    .join('\n')
    .replace(
      'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)',
      'border-block-start: 0',
    ),
)}
      </section>
      <section class="m-stack" data-gap="3" aria-labelledby="mq-s-prof">
        <h2 id="mq-s-prof" style="${small}; font-weight: var(--m-font-weight-regular)">Profile</h2>
${acctCard(
  [
    `          <a href="#" class="m-cluster" data-justify="between" style="flex-wrap: nowrap; gap: var(--m-space-4); padding: var(--m-space-4) var(--m-space-6); color: var(--m-color-fg-default); text-decoration: none"><span class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${face(0, I.moon, '2.5rem', 18)}<span class="m-stack" data-gap="0"><span style="${bold}">Ines</span><span style="${small}">ines.duarte@mailbox.example</span></span></span><span style="color: var(--m-color-fg-muted); display: inline-flex">${icon(I.right, 20)}</span></a>`,
    chevRow('Viewing limits', 'All ratings, no PIN'),
    chevRow('Download quality', '', `<span style="${small}">Standard</span>`),
  ].join('\n'),
)}
      </section>
      <section class="m-stack" data-gap="3" aria-labelledby="mq-s-plan">
        <h2 id="mq-s-plan" style="${small}; font-weight: var(--m-font-weight-regular)">Plan</h2>
${acctCard(
  [
    `          <div class="m-stack" data-gap="1" style="padding: var(--m-space-5) var(--m-space-6) var(--m-space-4)"><span style="${bold}; font-size: var(--m-font-size-lg)">Feature plan</span><span style="${small}">2 screens at once, 1080p, downloads on 2 devices</span><span style="${small}; ${nums}">Next payment: 4 December 2026</span></div>`,
    chevRow('Change plan'),
    chevRow('Payment method', '', `<span style="${small}; ${nums}">Card ending 4417</span>`),
  ].join('\n'),
  `<span aria-hidden="true" style="display: block; block-size: 6px; background: linear-gradient(to right, var(--m-color-info-solid), var(--m-color-accent-active), var(--m-color-brand-default))"></span>`,
)}
      </section>
      <a class="m-button" data-size="lg" href="#" style="inline-size: 100%; --m-button-radius: var(--m-radius-sm); --m-button-secondary-bg: var(--m-color-bg-surface); --m-button-secondary-border: var(--m-color-border-default); --m-button-secondary-fg: var(--m-color-danger-fg); --m-button-secondary-hover-bg: var(--m-color-danger-bg)">Close this account</a>
    </main>
  </div>
</div>
</div>`;

// Empty state: "Saved" with nothing in it (a glyph in an outlined circle, a title, one line, the red
// pill and the grey one), a search that found nothing, and a row of suggestions under them
const emptyState = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas); color: var(--m-color-fg-default)">
${topBar('')}
<main class="m-stack" data-gap="12" style="padding: var(--m-space-10) clamp(1rem, 4vw, 3.75rem) var(--m-space-16)">
  <h1 style="${h1}">Saved for later</h1>
  <section class="m-stack" data-gap="5" data-align="center" style="text-align: center; padding-block: var(--m-space-12)" aria-labelledby="mq-empty">
    <span style="display: inline-grid; place-items: center; inline-size: 5.5rem; block-size: 5.5rem; border-radius: 50%; border: 2px solid var(--m-color-border-strong); color: var(--m-color-fg-muted)">${icon(I.bookmark, 40)}</span>
    <h2 id="mq-empty" style="${rowTitle}">Nothing saved yet</h2>
    <p style="max-inline-size: 30rem; color: var(--m-color-fg-muted); font-size: var(--m-font-size-lg)">Press <span style="display: inline-flex; vertical-align: -0.125em">${icon(I.plus, 18)}</span> on any title and it waits here for you, on every screen.</p>
    <div class="m-cluster" data-gap="3" data-justify="center">
      <a class="m-button" data-variant="primary" data-size="lg" href="#" style="${big}">Browse the programme</a>
      <a class="m-button" data-size="lg" href="#" style="${big}">What’s new this week</a>
    </div>
  </section>
  <section class="m-stack" data-gap="3" aria-labelledby="mq-nores" style="max-inline-size: 40rem">
    <div role="search" class="m-cluster" data-gap="3" style="block-size: 3rem; padding-inline: var(--m-space-4); border: var(--m-border-width-thin) solid var(--m-color-fg-default); background: var(--m-color-bg-sunken); flex-wrap: nowrap">${icon(I.search, 22)}<span style="flex: 1">lighthouse noir</span>${icon(I.x, 20)}</div>
    <h2 id="mq-nores" style="font-size: var(--m-font-size-lg); ${medium}">Nothing in the club matches “lighthouse noir”.</h2>
    <ul class="m-stack" data-gap="1" style="${small}; padding-inline-start: var(--m-space-5); list-style: disc">
      <li>Try a different word, or fewer of them</li>
      <li>Search for a director, an actor or a festival</li>
      <li>Try a mood, like “tense” or “gentle”</li>
    </ul>
  </section>
${row(
  'mq-sugg',
  'People who saved what you watch also saved',
  [
    poster(2, 'The Ninth Lighthouse'),
    poster(4, 'Night Ferry'),
    poster(6, 'Kettle Lake', 'New'),
    poster(0, 'Undertow'),
    poster(3, 'Paper Moons'),
    poster(1, 'Copperline'),
    poster(5, 'Blue Hour'),
  ].join('\n'),
  { pages: 3 },
)}
</main>
</div>`;

// Pricing: the plan step. A step kicker and title, plan cards with a gradient header (the name and
// picture), the chosen one ringed with a tick; rows of grey labels over bold values; fine print and
// a wide red pill
const plan = (id: string, name: string, pic: string, grad: string, rows: [string, string][], chosen = false) =>
  `      <label class="m-card" style="padding: var(--m-space-2); cursor: pointer; --m-card-radius: var(--m-radius-lg); --m-card-bg: var(--m-color-bg-surface)${chosen ? '; --m-card-shadow: var(--m-shadow-md); --m-card-border: var(--m-color-fg-default)' : ''}">
        <input type="radio" name="mq-plan" value="${id}" class="m-sr-only"${chosen ? ' checked' : ''}>
        <span class="m-stack" data-gap="1" style="position: relative; padding: var(--m-space-4); border-radius: 12px; background: ${grad}; ${onArt}">
          <span id="mq-plan-${id}" style="font-size: var(--m-font-size-xl); ${bold}">${name}</span>
          <span style="${medium}">${pic}</span>
          ${chosen ? `<span style="position: absolute; inset-block-start: var(--m-space-4); inset-inline-end: var(--m-space-4); display: inline-flex">${icon('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>', 24)}</span>` : ''}
        </span>
        <dl class="m-stack" data-gap="0" style="padding: var(--m-space-2) var(--m-space-4) var(--m-space-2)">
${rows.map(([k, v], i) => `          <div class="m-stack" data-gap="1" style="padding-block: var(--m-space-3)${i ? '; border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)' : ''}"><dt style="${small}; ${medium}">${k}</dt><dd style="margin: 0; ${bold}; ${nums}">${v}</dd></div>`).join('\n')}
        </dl>
      </label>`;

const pricing = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas); color: var(--m-color-fg-default)">
<header class="m-navbar">
  <a class="m-navbar-brand" href="#">${mark()}<span>Foxglove</span></a>
  <div class="m-navbar-actions" style="margin-inline-start: auto"><a href="#" style="color: var(--m-color-fg-default); ${bold}; text-decoration: none">Sign out</a></div>
</header>
<main class="m-container" style="padding-block: var(--m-space-10) var(--m-space-16); max-inline-size: 72rem">
  <form class="m-stack" data-gap="8" aria-labelledby="mq-price-title">
    <div class="m-stack" data-gap="2">
      <span style="${kicker}">Step 1 of 3</span>
      <h1 id="mq-price-title" style="${h1}">Pick the plan for your household</h1>
      <p style="${small}">Change it or stop whenever you like. Every plan has the full programme, without breaks.</p>
    </div>
    <div class="m-grid" role="radiogroup" aria-labelledby="mq-price-title" style="--m-layout-grid-min: 15rem; --m-layout-grid-gap: var(--m-space-4); align-items: start">
${plan(
  'matinee',
  'Matinee',
  '720p',
  'linear-gradient(130deg, var(--m-color-info-solid), var(--m-color-accent-active))',
  [
    ['Monthly price', '$6.50'],
    ['Picture', 'Good · 720p'],
    ['Screens at once', '1'],
    ['Download devices', '1'],
    ['Sound', 'Stereo'],
  ],
)}
${plan(
  'feature',
  'Feature',
  '1080p',
  'linear-gradient(130deg, var(--m-color-info-solid), var(--m-color-brand-default))',
  [
    ['Monthly price', '$12.50'],
    ['Picture', 'Great · 1080p'],
    ['Screens at once', '2'],
    ['Download devices', '2'],
    ['Sound', 'Stereo and 5.1'],
  ],
  true,
)}
${plan(
  'premiere',
  'Premiere',
  '4K + HDR',
  'linear-gradient(130deg, var(--m-color-accent-active), var(--m-color-brand-default))',
  [
    ['Monthly price', '$19.50'],
    ['Picture', 'Best · 4K and HDR'],
    ['Screens at once', '4'],
    ['Download devices', '6'],
    ['Sound', 'Spatial sound'],
  ],
)}
    </div>
    <div class="m-stack" data-gap="2" style="${tiny}; max-inline-size: 52rem">
      <p>How sharp a title looks depends on your connection and your screen; not every title is in 4K. Screens at once means people in your home watching at the same time.</p>
      <p>Prices include tax where it applies. You can switch plans from your account in a minute; the new price starts at your next payment.</p>
    </div>
    <div class="m-cluster" data-justify="center"><button type="submit" class="m-button" data-variant="primary" data-size="lg" style="${big}; inline-size: min(100%, 27rem)">Next</button></div>
    <section class="m-stack" data-gap="4" aria-labelledby="mq-faq" style="padding-block-start: var(--m-space-8)">
      <h2 id="mq-faq" style="${rowTitle}">Questions</h2>
      <div class="m-accordion" data-variant="separated">
        <details class="m-accordion-item" name="mq-faq" open><summary>Can I change plans later?</summary><div class="m-accordion-content">Yes, at any time from your account. Moving up starts at once; moving down starts at your next payment date.</div></details>
        <details class="m-accordion-item" name="mq-faq"><summary>What does a screen mean here?</summary><div class="m-accordion-content">A television, laptop, tablet or phone playing a title. Downloads don’t count while you watch them offline.</div></details>
        <details class="m-accordion-item" name="mq-faq"><summary>Is there a contract?</summary><div class="m-accordion-content">No. Stop in two clicks and keep watching until the end of the month you paid for.</div></details>
      </div>
    </section>
  </form>
</main>
</div>`;

// Errors: the field (a red border and a red line with a cross icon), the form banner, the grey
// snackbar, and full pages over a token "still": a big bold title, one line, a white pill, and the
// code beside a red rule
const errorPage = (code: string, title: string, body: string, action: string, n: number, glyph = '') =>
  `    <section aria-labelledby="mq-err-${code}" style="display: grid; place-items: center; min-block-size: 26rem; padding: var(--m-space-12) var(--m-space-6); border-radius: 20px; background: linear-gradient(var(--m-color-bg-overlay), var(--m-color-bg-overlay)), ${grads[n]}; text-align: center; ${onArt}">
      <div class="m-stack" data-gap="5" data-align="center">
        ${glyph ? `<span style="display: inline-flex">${icon(glyph, 48)}</span>` : ''}
        <h2 id="mq-err-${code}" style="${hero}">${title}</h2>
        <p style="max-inline-size: 30rem; font-size: var(--m-font-size-lg)">${body}</p>
        ${playPill(action, 'lg').replace(`${icon(I.play, 22, true)} `, '')}
        <p style="padding-inline-start: var(--m-space-3); border-inline-start: 2px solid var(--m-color-brand-default); font-size: var(--m-font-size-lg); ${nums}">Error code <span style="${bold}">FX-${code}</span></p>
      </div>
    </section>`;

const errors = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas); color: var(--m-color-fg-default)">
${topBar('')}
<main class="m-stack" data-gap="12" style="padding: var(--m-space-10) clamp(1rem, 4vw, 3.75rem) var(--m-space-16)">
  <section class="m-stack" data-gap="6" aria-labelledby="mq-err-form" style="max-inline-size: 28rem; margin-inline: auto; inline-size: 100%">
    <h1 id="mq-err-form" style="${h1}">Change your sign-in email</h1>
    <div class="m-alert" data-tone="danger" role="alert">
      <span class="m-alert-icon">${icon(I.alert, 20)}</span>
      <div class="m-alert-content"><div class="m-alert-title">Your email hasn’t changed</div><div class="m-alert-body">2 fields need a second look.</div></div>
    </div>
    <div class="m-field">
      <label class="m-field-label" for="mq-err-email">New email</label>
      <input class="m-input" id="mq-err-email" type="email" value="ines.duarte@mailbox" aria-invalid="true" aria-describedby="mq-err-email-e">
      <p class="m-field-error m-cluster" data-gap="1" id="mq-err-email-e" style="flex-wrap: nowrap">${icon(I.circleX, 16)} This email needs an ending, like .com.</p>
    </div>
    <div class="m-field">
      <label class="m-field-label" for="mq-err-pass">Current password</label>
      <input class="m-input" id="mq-err-pass" type="password" value="••••••••" aria-invalid="true" aria-describedby="mq-err-pass-e">
      <p class="m-field-error m-cluster" data-gap="1" id="mq-err-pass-e" style="flex-wrap: nowrap">${icon(I.circleX, 16)} That password isn’t right. Try again, or reset it.</p>
    </div>
    <div class="m-cluster" data-gap="3">
      <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="${big}; flex: 1">Save</button>
      <button type="button" class="m-button" data-size="lg" style="${big}">Cancel</button>
    </div>
  </section>
  <section class="m-cluster" data-justify="center" aria-label="A snackbar">
    <div class="m-toast" role="status" style="max-inline-size: 28rem"><span style="color: var(--m-color-danger-fg); display: inline-flex; flex: none">${icon(I.cloudOff, 20)}</span><div class="m-toast-content"><div class="m-toast-body">Couldn’t save Blue Hour for later. Check your connection and try again.</div></div></div>
  </section>
${errorPage('404', 'This screening isn’t on', 'The page moved or never existed. Plenty else is showing tonight.', 'Back to the programme', 0)}
${errorPage('500', 'The projector stalled', 'Something went wrong on our side and nothing in your account changed. Try again in a minute.', 'Try again', 4, I.cloudOff)}
${errorPage('403', 'Not on this profile', 'Ines’s viewing limits keep this title off this profile. The account owner can change them.', 'Pick another profile', 5, I.lock)}
</main>
</div>`;

export const marqueeRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'The browse home: the black top bar, a big rounded billboard with the title, synopsis, white Play and grey More info pills, then rows of rounded stills with red progress bars and ranked tags, and a poster row with one card grown into its preview.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'The title modal over the dimmed browse page: the still with the title and round buttons, the score, rating box and synopsis beside the cast and moods, the episode list with a season select, and more like this.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'The profile picker on black: a big title, rounded-square profiles with names, an add tile and an outlined edit pill, then the new profile form with picture choices, a field error, a switch and a red pill.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'The plain light account page: back link and an icon nav with the current item bold, a 32px title, grey section labels and white 8px cards of switch and chevron rows, the plan card with its gradient bar.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'Saved with nothing in it: a glyph in an outlined circle, a title, one line, the red and grey pills; a search with no matches and its suggestions; a row of posters to start from.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The plan step: a step kicker and title, plan cards with gradient headers and the chosen one ringed with a tick, grey labels over bold values, fine print, a wide red pill and the grey question bars.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'A red border and a red line with a cross under the field, a banner saying nothing changed, the grey snackbar, and full pages for 404, 500 and no access over a dimmed still with a white pill and the code.',
    html: errors,
  },
];
