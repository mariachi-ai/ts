import type { ArchetypeRecipe } from '../types';

/*
 * Reel's seven page shapes: framework-free HTML using only @mariachi/design classes and tokens (no
 * colour literals), with sample data from a made-up repertory-cinema companion, "Matinee": people
 * book screenings, rate and note what they saw, and follow film clubs. They follow the language's
 * real screen patterns: a 950px column under a dark header with tracked uppercase links and a green
 * action, tight poster grids (token gradients and shapes stand in for poster art), counts in green,
 * blue and orange under posters, star ratings, tracked uppercase section headings over a hairline,
 * serif titles and serif reading text, slate panels and a dense diary-style table. Every name,
 * number, label and nav item is invented.
 */

// Lucide icons at 2px; stars, hearts and a few marks are filled, as the reference fills its glyphs
const icon = (paths: string, size = 16, filled = false) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="${filled ? 0 : 2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  starHalf:
    '<path d="M12 18.338a2.1 2.1 0 0 0-.987.244L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.12 2.12 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.12 2.12 0 0 0 1.597-1.16l2.309-4.679A.53.53 0 0 1 12 2"/>',
  heart:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  ticket:
    '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',
  ticketCheck:
    '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="m9 12 2 2 4-4"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  pencil:
    '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  note: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  film: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/>',
  clapper:
    '<path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  repeat: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  triangle: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  refresh:
    '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  sliders:
    '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
};

// Type. Titles are the serif at 700; page titles are the sans at its light 300; reading text is
// the serif at 15 over 25; metadata is the sans at 12
const serifTitle = (size: string) =>
  `font-family: var(--m-font-family-display); font-size: ${size}; font-weight: var(--m-font-weight-bold); line-height: var(--m-font-leading-tight); color: var(--m-color-fg-default)`;
const lightTitle = (size = 'var(--m-font-size-3xl)') =>
  `font-family: var(--m-font-family-sans); font-size: ${size}; font-weight: 300; line-height: var(--m-font-leading-tight); color: var(--m-color-fg-default)`;
const reading =
  'font-family: var(--m-font-family-serif); font-size: var(--m-font-size-lg); line-height: var(--m-font-leading-relaxed); color: var(--m-color-fg-muted)';
const meta = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-subtle)';
const caps =
  'font-family: var(--m-font-family-sans); font-size: var(--m-font-size-xs); text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide); color: var(--m-color-fg-muted)';
const capsBold =
  'font-family: var(--m-font-family-sans); font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-bold); text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide)';
const nums = 'font-variant-numeric: tabular-nums';
const clip = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis';
const linkPlain = 'color: var(--m-color-fg-default); text-decoration: none';

// Posters stand in as token gradients with one simple shape each: no art ships. 2:3, 4px corners
// and a faint inner frame, as the reference draws them
const art = [
  ['var(--m-color-warning-solid)', 'var(--m-color-danger-solid)', 'var(--m-color-bg-sunken)'],
  ['var(--m-color-info-solid)', 'var(--m-color-bg-raised)', 'var(--m-color-brand-default)'],
  ['var(--m-color-bg-raised)', 'var(--m-color-bg-sunken)', 'var(--m-color-warning-solid)'],
  ['var(--m-color-brand-default)', 'var(--m-color-info-solid)', 'var(--m-color-bg-sunken)'],
  ['var(--m-color-danger-solid)', 'var(--m-color-bg-sunken)', 'var(--m-color-info-bg)'],
  ['var(--m-color-info-bg)', 'var(--m-color-info-solid)', 'var(--m-color-danger-solid)'],
  ['var(--m-color-warning-bg)', 'var(--m-color-warning-solid)', 'var(--m-color-bg-sunken)'],
  ['var(--m-color-fg-subtle)', 'var(--m-color-bg-sunken)', 'var(--m-color-brand-default)'],
  ['var(--m-color-selection-bg)', 'var(--m-color-danger-solid)', 'var(--m-color-warning-bg)'],
  ['var(--m-color-success-bg)', 'var(--m-color-brand-default)', 'var(--m-color-bg-sunken)'],
];
const shapes = [
  (c: string) => `radial-gradient(circle at 68% 30%, ${c} 0 17%, transparent 18%)`,
  (c: string) => `linear-gradient(180deg, transparent 0 62%, ${c} 62% 70%, transparent 70%)`,
  (c: string) => `radial-gradient(ellipse 60% 26% at 50% 88%, ${c} 0 98%, transparent 100%)`,
  (c: string) => `linear-gradient(115deg, transparent 0 46%, ${c} 46% 54%, transparent 54%)`,
  (c: string) => `radial-gradient(circle at 30% 72%, ${c} 0 24%, transparent 25%)`,
];
const posterBg = (n: number) => {
  const [a, b, c] = art[n % art.length];
  return `${shapes[n % shapes.length](c)}, linear-gradient(160deg, ${a}, ${b})`;
};
const frame = 'box-shadow: inset 0 0 0 1px var(--m-color-border-default)';
const poster = (n: number, width = '100%', label = '') =>
  `<span ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'} style="display: block; inline-size: ${width}; aspect-ratio: 2 / 3; border-radius: var(--m-radius-lg); background: ${posterBg(n)}; ${frame}; flex: none"></span>`;
// A wide still for backdrops: the same palette, faded into the page at the bottom
const backdrop = (n: number, height = '17rem') => {
  const [a, b, c] = art[n % art.length];
  return `<div aria-hidden="true" style="block-size: ${height}; background: linear-gradient(180deg, transparent 0 45%, var(--m-color-bg-canvas) 100%), radial-gradient(ellipse 40% 60% at 70% 40%, ${c} 0 30%, transparent 70%), linear-gradient(120deg, ${a}, ${b})"></div>`;
};

// Stars: earned ones in the bright green, half stars allowed; empty ones in the hairline slate
const stars = (rating: number, size = 12, showEmpty = false) => {
  let out = '';
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) out += icon(I.star, size, true);
    else if (rating >= i - 0.5)
      out += `<span style="display: inline-grid">${showEmpty ? `<span style="grid-area: 1 / 1; color: var(--m-color-border-default); display: inline-flex">${icon(I.star, size, true)}</span>` : ''}<span style="grid-area: 1 / 1; display: inline-flex">${icon(I.starHalf, size, true)}</span></span>`;
    else if (showEmpty) out += `<span style="color: var(--m-color-border-default); display: inline-flex">${icon(I.star, size, true)}</span>`;
  }
  return `<span role="img" aria-label="${rating} out of 5" style="display: inline-flex; gap: 1px; color: var(--m-color-success-fg)">${out}</span>`;
};
const heart = (on = true, size = 12) =>
  `<span role="img" aria-label="${on ? 'Loved' : 'Not loved'}" style="display: inline-flex; color: ${on ? 'var(--m-color-warning-fg)' : 'var(--m-color-border-default)'}">${icon(I.heart, size, true)}</span>`;

// Counts under a poster: attended (green), in clubs (blue), loved (orange)
const counts = (a: string, c: string, l: string) =>
  `<span class="m-cluster" data-gap="2" data-justify="center" style="${meta}; ${nums}; flex-wrap: nowrap">
          <span class="m-cluster" data-gap="1" style="flex-wrap: nowrap"><span style="color: var(--m-color-success-fg); display: inline-flex">${icon(I.ticketCheck, 12)}</span>${a}</span>
          <span class="m-cluster" data-gap="1" style="flex-wrap: nowrap"><span style="color: var(--m-color-info-fg); display: inline-flex">${icon(I.users, 12)}</span>${c}</span>
          <span class="m-cluster" data-gap="1" style="flex-wrap: nowrap"><span style="color: var(--m-color-warning-fg); display: inline-flex">${icon(I.heart, 12, true)}</span>${l}</span>
        </span>`;

// The section heading: small tracked capitals over a hairline, an optional link on the right
const sectionHead = (title: string, right = '', id = '') =>
  `<div class="m-cluster" data-justify="between" style="border-block-end: 1px solid var(--m-color-border-default); padding-block-end: var(--m-space-1); margin-block-end: var(--m-space-2); flex-wrap: nowrap; gap: var(--m-space-2)">
        <h2${id ? ` id="${id}"` : ''} style="margin: 0; ${caps}; font-weight: var(--m-font-weight-regular)">${title}</h2>
        ${right ? `<a href="#" style="${caps}; text-decoration: none; color: var(--m-color-fg-subtle); white-space: nowrap">${right}</a>` : ''}
      </div>`;

// The app's own mark: a slate tile with a ticket glyph beside the name (invented; no real logo)
const mark = `<a href="#" class="m-cluster" data-gap="2" aria-label="Matinee, home" style="${linkPlain}; flex-wrap: nowrap">
      <span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: 2rem; block-size: 2rem; border-radius: var(--m-radius-md); background: var(--m-color-bg-raised); color: var(--m-color-brand-default)">${icon(I.ticket, 18)}</span>
      <span style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); letter-spacing: -0.01em">Matinee</span>
    </a>`;

// The header: the page colour, the content column's width, tracked bold capitals, a green action
const navItems = ['Tonight', 'Seasons', 'Clubs', 'Cinemas'];
const header = (current = '', signedIn = true) => `<header class="m-navbar" style="padding-inline: max(var(--m-space-4), calc((100% - 59.375rem) / 2)); flex-wrap: wrap; row-gap: var(--m-space-1); block-size: auto; min-block-size: 4.5rem">
    ${mark}
    <nav class="m-navbar-nav" aria-label="Main" style="justify-content: flex-end">
      ${
        signedIn
          ? `<a class="m-navbar-link" href="#" style="text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide); gap: var(--m-space-1)"><span class="m-avatar" data-size="sm" aria-hidden="true">MV</span>maren_v ${icon(I.down, 14)}</a>`
          : `<a class="m-navbar-link" href="#" style="text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide)">Sign in</a><a class="m-navbar-link" href="#" style="text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide)">Join</a>`
      }
      ${navItems.map((n) => `<a class="m-navbar-link" href="#"${n === current ? ' aria-current="page"' : ''} style="text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide)${n === current ? '' : '; color: var(--m-color-fg-muted)'}">${n}</a>`).join('')}
    </nav>
    <div class="m-navbar-actions">
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Search" style="--m-button-ghost-fg: var(--m-color-fg-default)">${icon(I.search, 18)}</button>
      ${signedIn ? `<a class="m-button" data-variant="primary" data-size="sm" href="#">${icon(I.ticket, 14)} Tickets</a>` : ''}
    </div>
  </header>`;

const footer = `<footer style="background: var(--m-color-bg-surface); margin-block-start: var(--m-space-10); padding-block: var(--m-space-5)">
    <div class="m-container m-cluster" data-justify="between" style="${meta}">
      <nav class="m-cluster" data-gap="4" aria-label="Footer" style="${caps}">
        <a href="#" style="color: var(--m-color-fg-muted); text-decoration: none">About</a><a href="#" style="color: var(--m-color-fg-muted); text-decoration: none">Help</a><a href="#" style="color: var(--m-color-fg-muted); text-decoration: none">Cinemas on Matinee</a><a href="#" style="color: var(--m-color-fg-muted); text-decoration: none">Terms</a>
      </nav>
      <span>Showtimes from the cinemas themselves.</span>
    </div>
  </footer>`;

// Page shell: the canvas with the reference's faint top-lit fade under the header
const page = (body: string, current = '', signedIn = true) => `<div style="min-block-size: 100vh; background: linear-gradient(180deg, var(--m-color-bg-surface) 0, var(--m-color-bg-canvas) 36rem); color: var(--m-color-fg-muted); font-size: var(--m-font-size-md)">
  ${header(current, signedIn)}
  ${body}
  ${footer}
</div>`;

// A calendar tile for a month, as the diary draws it
const monthTile = (m: string, y: string) =>
  `<span style="display: inline-grid; place-items: center; inline-size: 2.75rem; block-size: 2.5rem; border-radius: var(--m-radius-md); background: var(--m-color-border-default); border-block-start: 3px solid var(--m-color-border-strong); line-height: 1.1"><span style="font-size: var(--m-font-size-sm); text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide); color: var(--m-color-fg-default)">${m}</span><span style="font-size: 0.625rem; color: var(--m-color-fg-muted)">${y}</span></span>`;

// The profile bar: a framed strip with sentence-case tabs, the current one over a green line
const profileTabs = ['Overview', 'Attended', 'Clubs', 'Tickets', 'Passes', 'Venues'];
const profileBar = (current: string) => `<nav aria-label="Profile" style="border: 1px solid var(--m-color-border-muted); border-radius: var(--m-radius-md); padding-inline: var(--m-space-3); margin-block: var(--m-space-4)">
      <ul class="m-cluster" data-gap="5" data-justify="center" style="list-style: none; margin: 0; padding: 0; min-block-size: 2.75rem">
        ${profileTabs.map((t) => `<li><a href="#"${t === current ? ' aria-current="page"' : ''} style="display: inline-block; padding-block: var(--m-space-2); font-size: var(--m-font-size-lg); text-decoration: none; color: ${t === current ? 'var(--m-color-fg-default)' : 'var(--m-color-fg-muted)'}; ${t === current ? 'box-shadow: inset 0 -2px 0 var(--m-color-success-fg)' : ''}">${t}</a></li>`).join('')}
      </ul>
    </nav>`;

// A filter trigger in tracked capitals with a chevron
const filter = (label: string) =>
  `<button type="button" class="m-button" data-variant="ghost" data-size="sm" aria-haspopup="menu" style="--m-button-font-weight: var(--m-font-weight-regular); --m-button-padding-x-sm: var(--m-space-1)">${label} ${icon(I.down, 12)}</button>`;

// ------------------------------------------------------------------------------------------------
// Dashboard: Tonight
// ------------------------------------------------------------------------------------------------
const showing: [number, string, string, string, string][] = [
  [0, 'The Salt Orchard', '4.1K', '612', '1.9K'],
  [1, 'Northbound Static', '2.7K', '388', '940'],
  [5, 'Paper Moons Over Ostend', '6.3K', '1.2K', '3.4K'],
  [3, 'Kiln', '1.1K', '154', '402'],
];
const prints: [number, string, number][] = [
  [2, 'Six Rooms', 4],
  [4, 'Amber Interval', 3.5],
  [6, 'Low Tide Choir', 4.5],
  [7, 'Hollow Bell', 3],
  [8, 'The Glasshouse Year', 5],
  [9, 'Midnight at Varga’s', 4],
  [1, 'A Quiet Ledger', 2.5],
  [0, 'Second Reel', 3.5],
];

const noteRow = (n: number, film: string, year: string, who: string, initials: string, rating: number, loved: boolean, text: string, replies: number) => `<article class="m-cluster" data-gap="4" data-align="start" style="flex-wrap: nowrap; padding-block: var(--m-space-3); border-block-end: 1px solid var(--m-color-border-muted)">
          ${poster(n, '4.375rem')}
          <div class="m-stack" data-gap="1" style="min-inline-size: 0">
            <h3 style="margin: 0; ${serifTitle('var(--m-font-size-2xl)')}"><a href="#" style="${linkPlain}">${film}</a> <span style="font-family: var(--m-font-family-sans); font-weight: 300; font-size: var(--m-font-size-xl); color: var(--m-color-fg-muted)">${year}</span></h3>
            <div class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-md)">
              <span class="m-avatar" data-size="sm" aria-hidden="true">${initials}</span>
              <a href="#" style="${linkPlain}; font-weight: var(--m-font-weight-bold)">${who}</a>
              ${stars(rating)}${loved ? heart() : ''}
              <span class="m-cluster" data-gap="1" style="${meta}">${icon(I.note, 12)}${replies}</span>
            </div>
            <p style="margin: 0; ${reading}">${text}</p>
          </div>
        </article>`;

const dashboard = page(
  `<main class="m-container" style="padding-block: var(--m-space-6) 0">
    <p style="margin: 0 0 var(--m-space-6); text-align: center; ${lightTitle('var(--m-font-size-2xl)')}; color: var(--m-color-fg-muted)">Good evening, <a href="#" style="${linkPlain}; text-decoration: underline; text-underline-offset: 3px">maren_v</a>. Here’s what’s on near you.</p>

    <section aria-labelledby="showing">
      ${sectionHead('Tonight at your cinemas', 'See all', 'showing')}
      <ul class="m-grid" style="--m-layout-grid-min: 10rem; gap: var(--m-space-3); list-style: none; margin: 0; padding: 0">
        ${showing
          .map(
            ([n, t, a, c, l]) => `<li class="m-stack" data-gap="2">
          <a href="#" aria-label="${t}">${poster(n)}</a>
          ${counts(a, c, l)}
        </li>`,
          )
          .join('\n        ')}
      </ul>
    </section>

    <section aria-labelledby="clubs" style="margin-block-start: var(--m-space-6)">
      ${sectionHead('New prints and restorations', '41,208 seats booked this week', 'clubs')}
      <ul style="display: grid; grid-template-columns: repeat(auto-fill, minmax(6.25rem, 1fr)); gap: var(--m-space-2); list-style: none; margin: 0; padding: 0">
        ${prints
          .map(
            ([n, t, r]) => `<li class="m-stack" data-gap="1" data-align="center">
          <a href="#" aria-label="${t}" style="inline-size: 100%">${poster(n)}</a>
          ${stars(r, 10)}
        </li>`,
          )
          .join('\n        ')}
      </ul>
    </section>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr)); gap: var(--m-space-8); margin-block-start: var(--m-space-6); align-items: start">
      <section aria-labelledby="notes" style="grid-column: span 2; min-inline-size: 0">
        ${sectionHead('Notes from your clubs', 'More notes', 'notes')}
        ${noteRow(0, 'The Salt Orchard', '2025', 'iris.dunmore', 'ID', 4.5, true, 'The orchard scenes are shot like weather reports, and it works. Forty minutes in I stopped checking the time and started checking the sky.', 12)}
        ${noteRow(5, 'Paper Moons Over Ostend', '2024', 'teo.brandvold', 'TB', 3, false, 'A gentle film about a ferry timetable that somehow ends in a dance hall. The 35mm print at the Filmhouse had a scratch through reel two and I loved it anyway.', 4)}
        ${noteRow(6, 'Low Tide Choir', '2023', 'ama.nkrumah', 'AN', 5, true, 'Saw it with the Thursday club. Nobody spoke on the walk home, which is the highest praise I know.', 27)}
      </section>

      <aside class="m-stack" data-gap="6" aria-label="Your month">
        <section aria-labelledby="month">
          ${sectionHead('Your November', '', 'month')}
          <dl style="display: grid; grid-template-columns: repeat(3, 1fr); margin: 0; text-align: center">
            ${[
              ['14', 'Attended'],
              ['3', 'Clubs'],
              ['9', 'Notes'],
            ]
              .map(
                ([v, l], i) => `<div style="${i ? 'border-inline-start: 1px solid var(--m-color-border-muted);' : ''} padding-block: var(--m-space-1)"><dd style="margin: 0; ${serifTitle('var(--m-font-size-2xl)')}; ${nums}">${v}</dd><dt style="${caps}; font-size: 0.625rem; color: var(--m-color-fg-subtle)">${l}</dt></div>`,
              )
              .join('')}
          </dl>
        </section>
        <section aria-labelledby="ratings">
          ${sectionHead('Your ratings', '14 screenings', 'ratings')}
          <div class="m-cluster" data-gap="2" data-align="end" style="flex-wrap: nowrap">
            <span style="color: var(--m-color-success-fg); display: inline-flex">${icon(I.star, 10, true)}</span>
            <span role="img" aria-label="Ratings from half a star to five stars: 0, 0, 1, 1, 2, 3, 4, 2, 1, 0" style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 1px; align-items: end; block-size: 2.75rem; flex: 1">
              ${[4, 4, 14, 18, 30, 50, 100, 46, 22, 6].map((h) => `<span style="block-size: ${h}%; background: var(--m-color-border-default); border-radius: 1px 1px 0 0"></span>`).join('')}
            </span>
            <span class="m-stack" data-gap="0" data-align="end"><span style="font-family: var(--m-font-family-sans); font-weight: 300; font-size: var(--m-font-size-2xl); ${nums}">3.6</span>${stars(5, 8)}</span>
          </div>
        </section>
        <section aria-labelledby="next">
          ${sectionHead('Next up', 'All tickets', 'next')}
          <ul class="m-stack" data-gap="3" style="list-style: none; margin: 0; padding: 0">
            ${[
              ['Nov', '14', 'Kiln', 'Cameo 2 · 20:40'],
              ['Nov', '19', 'Six Rooms', 'Filmhouse · 18:15'],
              ['Dec', '02', 'Hollow Bell', 'Dominion · 21:00'],
            ]
              .map(
                ([m, d, t, w]) => `<li class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${monthTile(m, '')}<span style="font-size: var(--m-font-size-xl); font-weight: 300; ${nums}; color: var(--m-color-fg-subtle)">${d}</span><span class="m-stack" data-gap="0" style="min-inline-size: 0"><a href="#" style="${linkPlain}; ${clip}">${t}</a><span style="${meta}">${w}</span></span></li>`,
              )
              .join('\n            ')}
          </ul>
        </section>
      </aside>
    </div>
  </main>`,
  'Tonight',
);

// ------------------------------------------------------------------------------------------------
// List and detail: the screening log, then one film's page
// ------------------------------------------------------------------------------------------------
// Each row: month tile, day, poster, title, screen and time, format, rating (with the heart when
// loved), who came along
const logRows: [string, string, string, number, string, string, string, string, number, boolean, string[]][] = [
  ['Nov', '2025', '11', 0, 'The Salt Orchard', 'Cameo 1', '20:40', '35mm', 4.5, true, ['ID', 'TB']],
  ['', '', '08', 5, 'Paper Moons Over Ostend', 'Filmhouse 2', '18:15', 'DCP', 3, false, []],
  ['', '', '03', 3, 'Kiln', 'Dominion', '21:00', 'DCP', 3.5, false, ['AN']],
  ['Oct', '2025', '29', 6, 'Low Tide Choir', 'Cameo 2', '19:30', '35mm', 5, true, ['ID', 'AN', 'KO']],
  ['', '', '22', 2, 'Six Rooms', 'Filmhouse 1', '14:00', '16mm', 4, true, []],
  ['', '', '17', 8, 'The Glasshouse Year', 'Summerhall', '20:00', 'DCP', 2.5, false, ['PS']],
];
const logTable = `<div class="m-table-wrap" tabindex="0" role="region" aria-label="Screenings attended" style="position: relative">
        <table class="m-table">
          <thead><tr><th scope="col" colspan="2">Date</th><th scope="col">Film</th><th scope="col">Screen</th><th scope="col">Format</th><th scope="col">Rating</th><th scope="col">With</th><th scope="col"><span class="m-sr-only">Actions</span></th></tr></thead>
          <tbody>
            ${logRows
              .map(
                ([m, y, d, n, t, screen, time, format, r, loved, withWho]) => `<tr>
              <td style="inline-size: 3.5rem">${m ? monthTile(m, y) : ''}</td>
              <td style="font-size: var(--m-font-size-2xl); font-weight: 300; color: var(--m-color-fg-subtle); ${nums}">${d}</td>
              <td><span class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${poster(n, '1.75rem')}<a href="#" style="${serifTitle('var(--m-font-size-xl)')}; text-decoration: none; ${clip}">${t}</a></span></td>
              <td style="white-space: nowrap">${screen}<br><span style="${meta}; ${nums}">${time}</span></td>
              <td><span class="m-badge">${format}</span></td>
              <td style="white-space: nowrap"><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${stars(r, 13, true)}${loved ? heart(true) : ''}</span></td>
              <td>${withWho.length ? `<span class="m-avatar-group">${withWho.map((w) => `<span class="m-avatar" data-size="sm">${w}</span>`).join('')}</span>` : `<span style="${meta}">Alone</span>`}</td>
              <td style="background: var(--m-color-bg-sunken); white-space: nowrap"><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Edit ${t}">${icon(I.pencil, 14)}</button><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="More for ${t}">${icon(I.more, 14)}</button></td>
            </tr>`,
              )
              .join('\n            ')}
          </tbody>
        </table>
      </div>`;

const screeningChips = [
  'Thu 13 · 20:40 · Cameo 1',
  'Fri 14 · 18:00 · Cameo 1',
  'Fri 14 · 21:15 · Filmhouse 2',
  'Sat 15 · 14:30 · Cameo 2',
  'Sat 15 · 20:40 · Cameo 1',
  'Sun 16 · 16:00 · Dominion',
  'Tue 18 · 19:00 · Summerhall',
  'Wed 19 · 20:40 · Cameo 1',
];
const chip = (label: string) =>
  `<a href="#" style="display: inline-block; padding: 0.125rem var(--m-space-1); border-radius: var(--m-radius-md); background: var(--m-color-bg-surface); color: var(--m-color-fg-muted); text-decoration: none; font-size: var(--m-font-size-md)">${label}</a>`;

// The action panel: three icon actions, the rating, then hairline-separated rows
const actionPanel = `<aside aria-label="Your plans for this film" style="border-radius: var(--m-radius-lg); background: var(--m-color-border-default); overflow: hidden; text-align: center">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); padding: var(--m-space-3) var(--m-space-1) var(--m-space-2)">
            <button type="button" class="m-button" data-variant="ghost" aria-pressed="true" style="flex-direction: column; block-size: auto; gap: var(--m-space-1); --m-button-text-transform: none; --m-button-tracking: 0; --m-button-font-weight: var(--m-font-weight-regular); --m-button-ghost-fg: var(--m-color-fg-default)"><span style="color: var(--m-color-success-fg); display: inline-flex">${icon(I.ticketCheck, 30)}</span>Going</button>
            <button type="button" class="m-button" data-variant="ghost" aria-pressed="true" style="flex-direction: column; block-size: auto; gap: var(--m-space-1); --m-button-text-transform: none; --m-button-tracking: 0; --m-button-font-weight: var(--m-font-weight-regular); --m-button-ghost-fg: var(--m-color-fg-default)"><span style="color: var(--m-color-info-fg); display: inline-flex">${icon(I.users, 30)}</span>2 friends</button>
            <button type="button" class="m-button" data-variant="ghost" aria-pressed="false" style="flex-direction: column; block-size: auto; gap: var(--m-space-1); --m-button-text-transform: none; --m-button-tracking: 0; --m-button-font-weight: var(--m-font-weight-regular); --m-button-ghost-fg: var(--m-color-fg-default)"><span style="display: inline-flex">${icon(I.bell, 30)}</span>Remind me</button>
          </div>
          <div style="border-block-start: 1px solid var(--m-color-bg-raised); padding-block: var(--m-space-2)">
            <span style="font-size: var(--m-font-size-sm); color: var(--m-color-fg-default)">Your rating</span>
            <div>${stars(4.5, 26, true)}</div>
          </div>
          ${['Pick seats…', 'Compare formats', 'Write a note…']
            .map((l) => `<a href="#" style="display: block; padding-block: var(--m-space-2); border-block-start: 1px solid var(--m-color-bg-raised); color: var(--m-color-fg-default); text-decoration: none; font-size: var(--m-font-size-md)">${l}</a>`)
            .join('\n          ')}
        </aside>`;

const listDetail = page(
  `<main class="m-container" style="padding-block: var(--m-space-2) 0">
    ${profileBar('Attended')}

    <section aria-labelledby="log">
      <h1 id="log" class="m-sr-only">Screenings attended</h1>
      <div class="m-cluster" data-justify="between" style="border-block-end: 1px solid var(--m-color-border-default); gap: var(--m-space-2)">
        <div class="m-cluster" data-gap="4" role="tablist" aria-label="Show" style="${capsBold}; font-weight: var(--m-font-weight-regular)">
          <a href="#" role="tab" aria-selected="false" style="color: var(--m-color-success-fg); text-decoration: none; padding-block: var(--m-space-1)">All</a>
          <a href="#" role="tab" aria-selected="true" style="color: var(--m-color-fg-default); text-decoration: none; padding-block: var(--m-space-1); box-shadow: inset 0 -1px 0 var(--m-color-fg-default)">This season</a>
          <a href="#" role="tab" aria-selected="false" style="color: var(--m-color-success-fg); text-decoration: none; padding-block: var(--m-space-1)">Rated</a>
          <a href="#" role="tab" aria-selected="false" style="color: var(--m-color-success-fg); text-decoration: none; padding-block: var(--m-space-1)">With notes</a>
        </div>
        <div class="m-cluster" data-gap="1" style="${caps}">
          ${filter('Venue')}${filter('Format')}${filter('Year')}
          <span style="color: var(--m-color-fg-subtle)">Sort by</span>${filter('Date seen')}
        </div>
      </div>
      ${logTable}
    </section>

    <article aria-labelledby="film" style="margin-block-start: var(--m-space-10); border-radius: var(--m-radius-lg); overflow: hidden">
      ${backdrop(0)}
      <div style="display: flex; flex-wrap: wrap; gap: var(--m-space-6); margin-block-start: -8rem; position: relative; padding-inline: var(--m-space-2)">
        <div class="m-stack" data-gap="2" style="flex: 0 1 14.375rem; margin-inline: auto">
          <span style="box-shadow: var(--m-shadow-lg); border-radius: var(--m-radius-lg)">${poster(0, '100%', 'The Salt Orchard')}</span>
          ${counts('4.1K', '612', '1.9K')}
          <a class="m-button" data-variant="secondary" data-size="sm" href="#" style="--m-button-secondary-bg: var(--m-color-bg-surface); --m-button-secondary-fg: var(--m-color-fg-muted); justify-content: space-between">Trailer ${icon(I.film, 14)}</a>
        </div>
        <div class="m-stack" data-gap="4" style="flex: 1 1 20rem; min-inline-size: 0; padding-block-start: var(--m-space-12)">
          <header class="m-stack" data-gap="1">
            <h2 id="film" style="margin: 0; ${serifTitle('var(--m-font-size-4xl)')}">The Salt Orchard</h2>
            <p style="margin: 0; font-size: var(--m-font-size-xl); font-weight: 300; color: var(--m-color-fg-muted)"><a href="#" style="${linkPlain}; text-decoration: underline; text-underline-offset: 3px">2025</a> &nbsp;<em style="font-family: var(--m-font-family-serif)">‘Le Verger de sel’</em> &nbsp;Directed by <a href="#" style="${linkPlain}; text-decoration: underline; text-underline-offset: 3px">Ines Valcourt</a></p>
          </header>
          <p style="margin: 0; ${caps}">Every tree keeps a secret.</p>
          <p style="margin: 0; ${reading}; font-size: var(--m-font-size-xl); line-height: 1.6">On a salt marsh in the Vendée, two sisters inherit an orchard that should not grow, and a summer of storms decides which of them stays to keep it.</p>
          <div class="m-tabs">
            <div class="m-tab-list" role="tablist" aria-label="Film details">
              <button type="button" class="m-tab" style="letter-spacing: var(--m-font-tracking-wide)" role="tab" aria-selected="true">Screenings</button>
              <button type="button" class="m-tab" style="letter-spacing: var(--m-font-tracking-wide)" role="tab" aria-selected="false">Formats</button>
              <button type="button" class="m-tab" style="letter-spacing: var(--m-font-tracking-wide)" role="tab" aria-selected="false">People</button>
              <button type="button" class="m-tab" style="letter-spacing: var(--m-font-tracking-wide)" role="tab" aria-selected="false">Languages</button>
            </div>
            <div class="m-tab-panel" role="tabpanel" style="padding-block-start: var(--m-space-2)">
              <div class="m-cluster" data-gap="1">${screeningChips.map(chip).join('')}</div>
            </div>
          </div>
          <p style="margin: 0; ${meta}">104 mins &nbsp;·&nbsp; 35mm and DCP &nbsp;·&nbsp; French, Breton</p>
        </div>
        <div class="m-stack" data-gap="5" style="flex: 1 0 14.375rem; max-inline-size: 100%; padding-block-start: var(--m-space-12)">
          ${actionPanel}
          <section aria-labelledby="film-ratings">
            ${sectionHead('Ratings', '212 loved it', 'film-ratings')}
            <div class="m-cluster" data-gap="2" data-align="end" style="flex-wrap: nowrap">
              <span style="color: var(--m-color-success-fg); display: inline-flex">${icon(I.star, 10, true)}</span>
              <span role="img" aria-label="Most ratings are four stars" style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 1px; align-items: end; block-size: 3rem; flex: 1">
                ${[2, 3, 6, 9, 18, 30, 58, 100, 64, 28].map((h) => `<span style="block-size: ${h}%; background: var(--m-color-border-default); border-radius: 1px 1px 0 0"></span>`).join('')}
              </span>
              <span class="m-stack" data-gap="0" data-align="end"><span style="font-weight: 300; font-size: var(--m-font-size-2xl); ${nums}">3.9</span>${stars(5, 8)}</span>
            </div>
          </section>
        </div>
      </div>
    </article>
  </main>`,
  'Seasons',
);

// ------------------------------------------------------------------------------------------------
// Onboarding: the welcome hero, then the step panel
// ------------------------------------------------------------------------------------------------
const slot = (filled = -1) =>
  filled >= 0
    ? `<span style="position: relative; display: block">${poster(filled)}<button type="button" class="m-button" data-variant="secondary" data-size="sm" data-icon-only aria-label="Remove" style="position: absolute; inset-block-start: var(--m-space-1); inset-inline-end: var(--m-space-1); --m-button-height-sm: 1.25rem; --m-button-radius: 9999px">${icon(I.x, 12)}</button></span>`
    : `<button type="button" aria-label="Pick a film" style="display: grid; place-items: center; inline-size: 100%; aspect-ratio: 2 / 3; border-radius: var(--m-radius-lg); background: var(--m-color-bg-raised); border: 1px solid var(--m-color-border-default); color: var(--m-color-fg-subtle); cursor: pointer"><span style="display: inline-grid; place-items: center; inline-size: 1.75rem; block-size: 1.75rem; border-radius: 50%; background: var(--m-color-bg-surface)">${icon(I.plus, 14)}</span></button>`;

const clubOption = (name: string, meta2: string, checked: boolean) =>
  `<label class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding-block: var(--m-space-2); border-block-start: 1px solid var(--m-color-border-muted); cursor: pointer">
            <input class="m-checkbox" type="checkbox"${checked ? ' checked' : ''}>
            <span class="m-stack" data-gap="0"><span style="color: var(--m-color-fg-default)">${name}</span><span style="${meta}">${meta2}</span></span>
          </label>`;

const onboarding = page(
  `<main>
    <section aria-labelledby="welcome" style="position: relative">
      ${backdrop(5, '22rem')}
      <div class="m-container m-stack" data-gap="4" data-align="center" style="position: relative; margin-block-start: -12rem; text-align: center">
        <h1 id="welcome" style="margin: 0; ${serifTitle('var(--m-font-size-4xl)')}; max-inline-size: 30rem; text-shadow: 0 1px 3px var(--m-color-bg-canvas)">Every screening you go to, kept. Every club you join, close.</h1>
        <p style="margin: 0; ${lightTitle('var(--m-font-size-xl)')}; color: var(--m-color-fg-muted)">Three short steps and your first season is ready.</p>
      </div>
    </section>

    <div class="m-container" data-size="md" style="margin-block-start: var(--m-space-8)">
      <form class="m-stack" data-gap="5" aria-labelledby="step" style="background: var(--m-color-bg-raised); border-radius: var(--m-radius-md); padding: var(--m-space-5)">
        <div class="m-cluster" data-justify="between">
          <p style="margin: 0; ${caps}; color: var(--m-color-fg-default)">Step 2 of 3</p>
          <span class="m-cluster" data-gap="1" aria-hidden="true">${[1, 2, 3].map((s) => `<span style="inline-size: 1.5rem; block-size: 3px; border-radius: 1px; background: ${s <= 2 ? 'var(--m-color-brand-default)' : 'var(--m-color-border-default)'}"></span>`).join('')}</span>
        </div>
        <div class="m-stack" data-gap="1">
          <h2 id="step" style="margin: 0; ${serifTitle('var(--m-font-size-2xl)')}">Pin four films you’d cross town for</h2>
          <p style="margin: 0; color: var(--m-color-fg-default)">They sit at the top of your page and help us pick screenings for you. Drag to reorder.</p>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="ob-find">Find a film</label>
          <input class="m-input" id="ob-find" placeholder="Title, director or year">
        </div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--m-space-2)">
          ${slot(2)}${slot(6)}${slot()}${slot()}
        </div>
        <fieldset class="m-stack" data-gap="0" style="border: 0; margin: 0; padding: 0">
          <legend style="${caps}; color: var(--m-color-fg-default); margin-block-end: var(--m-space-2)">Clubs near you</legend>
          ${clubOption('The Thursday Night Club', 'Cameo · 214 members · one film a week', true)}
          ${clubOption('Forty Millimetre Society', 'Summerhall · 61 members · prints only', false)}
          ${clubOption('Second Features', 'Dominion · 98 members · double bills', false)}
        </fieldset>
        <div class="m-cluster" data-justify="between" style="border-block-start: 1px solid var(--m-color-border-muted); padding-block-start: var(--m-space-4)">
          <button type="button" class="m-button" data-variant="secondary">${icon(I.left, 14)} Back</button>
          <div class="m-cluster" data-gap="3">
            <a href="#" style="${meta}; color: var(--m-color-fg-default)">Skip for now</a>
            <button type="submit" class="m-button" data-variant="primary">Continue</button>
          </div>
        </div>
      </form>
    </div>
  </main>`,
  '',
  false,
);

// ------------------------------------------------------------------------------------------------
// Settings
// ------------------------------------------------------------------------------------------------
const toggleRow = (label: string, hint: string, on: boolean) =>
  `<div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; gap: var(--m-space-4); padding-block: var(--m-space-2); border-block-start: 1px solid var(--m-color-border-muted)">
              <span class="m-stack" data-gap="0"><span style="color: var(--m-color-fg-default)">${label}</span><span style="${meta}">${hint}</span></span>
              <input class="m-switch" type="checkbox" role="switch"${on ? ' checked' : ''} aria-label="${label}">
            </div>`;

const settings = page(
  `<main class="m-container" style="padding-block: var(--m-space-6) 0">
    <div class="m-cluster" data-justify="between" style="gap: var(--m-space-3)">
      <h1 style="margin: 0; ${lightTitle()}">Account settings</h1>
      <p class="m-cluster" data-gap="2" style="margin: 0; color: var(--m-color-fg-muted)">Go further with <span class="m-badge" data-tone="warning" data-variant="solid">Cinephile</span>
        <a class="m-button" data-variant="secondary" data-size="sm" href="#" style="--m-button-secondary-bg: transparent; --m-button-secondary-fg: var(--m-color-fg-muted); --m-button-secondary-hover-bg: var(--m-color-bg-surface); --m-button-secondary-border: var(--m-color-border-strong); --m-button-font-size: 0.625rem">Compare plans</a></p>
    </div>

    <div class="m-tabs" style="margin-block-start: var(--m-space-6)">
      <div class="m-cluster" data-justify="between" style="border-block-end: 1px solid var(--m-color-border-default); flex-wrap: nowrap; gap: var(--m-space-3)">
        <div class="m-tab-list" role="tablist" aria-label="Settings" style="--m-tabs-list-border: transparent; flex-wrap: wrap">
          <button type="button" class="m-tab" style="letter-spacing: var(--m-font-tracking-wide)" role="tab" aria-selected="true">Account</button>
          <button type="button" class="m-tab" style="letter-spacing: var(--m-font-tracking-wide)" role="tab" aria-selected="false">Membership</button>
          <button type="button" class="m-tab" style="letter-spacing: var(--m-font-tracking-wide)" role="tab" aria-selected="false">Clubs</button>
          <button type="button" class="m-tab" style="letter-spacing: var(--m-font-tracking-wide)" role="tab" aria-selected="false">Seating</button>
          <button type="button" class="m-tab" style="letter-spacing: var(--m-font-tracking-wide)" role="tab" aria-selected="false">Privacy</button>
        </div>
        <a href="#" style="color: var(--m-color-fg-muted); text-decoration: none; white-space: nowrap">Close account</a>
      </div>

      <div class="m-tab-panel" role="tabpanel">
        <h2 style="margin: var(--m-space-6) 0 var(--m-space-4); ${lightTitle('var(--m-font-size-2xl)')}">Account</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(22rem, 100%), 1fr)); gap: var(--m-space-8); align-items: start">
          <form class="m-stack" data-gap="4" aria-label="Account details">
            <div class="m-field">
              <div class="m-cluster" data-justify="between"><label class="m-field-label" for="s-user">Username</label><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Change username">${icon(I.pencil, 14)}</button></div>
              <input class="m-input" id="s-user" value="maren_v" readonly>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: var(--m-space-3)">
              <div class="m-field"><label class="m-field-label" for="s-given">Given name</label><input class="m-input" id="s-given" value="Maren"></div>
              <div class="m-field"><label class="m-field-label" for="s-family">Family name</label><input class="m-input" id="s-family" value="Vestergaard"></div>
            </div>
            <div class="m-field"><label class="m-field-label" for="s-email">Email address</label><input class="m-input" id="s-email" type="email" value="maren@vestergaard.example"></div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: var(--m-space-3)">
              <div class="m-field"><label class="m-field-label" for="s-home">Home cinema</label><select class="m-select" id="s-home"><option>Cameo, Tollcross</option><option>Filmhouse</option><option>Dominion</option></select></div>
              <div class="m-field"><label class="m-field-label" for="s-seat">Seat preference</label><select class="m-select" id="s-seat"><option>Aisle, middle rows</option><option>Front row</option><option>No preference</option></select></div>
            </div>
            <div class="m-field">
              <label class="m-field-label" for="s-bio">Bio</label>
              <textarea class="m-input" id="s-bio" rows="4" style="font-family: var(--m-font-family-serif); font-size: var(--m-font-size-lg)">Thursday club regular. Mostly here for 35mm, double bills and anything with a lighthouse in it.</textarea>
              <p class="m-field-hint">Shown on your page. Up to 400 characters.</p>
            </div>
          </form>

          <div class="m-stack" data-gap="6">
            <section class="m-stack" data-gap="2" aria-labelledby="pinned">
              <div class="m-cluster" data-justify="between"><h3 id="pinned" style="margin: 0; font-family: var(--m-font-family-sans); font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-bold); color: var(--m-color-fg-default)">Pinned films</h3><span style="${meta}">Drag to reorder.</span></div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--m-space-2)">${slot(8)}${slot(3)}${slot()}${slot()}</div>
            </section>
            <section aria-labelledby="alerts">
              <h3 id="alerts" style="margin: 0 0 var(--m-space-1); font-family: var(--m-font-family-sans); font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-bold); color: var(--m-color-fg-default)">Alerts</h3>
              ${toggleRow('Door time reminders', 'Two hours before a booked screening', true)}
              ${toggleRow('New prints at my cinemas', 'Restorations and 35mm runs', true)}
              ${toggleRow('Club picks', 'When a club you follow picks its next film', false)}
              ${toggleRow('Hide ratings until I’ve rated', 'Keep scores out of sight before you see a film', true)}
            </section>
          </div>
        </div>
        <div class="m-cluster" data-gap="3" style="margin-block-start: var(--m-space-6); padding-block-start: var(--m-space-4); border-block-start: 1px solid var(--m-color-border-muted)">
          <button type="submit" class="m-button" data-variant="primary">Save changes</button>
          <span style="${meta}">Last saved 3 days ago.</span>
        </div>
      </div>
    </div>
  </main>`,
);

// ------------------------------------------------------------------------------------------------
// Empty state
// ------------------------------------------------------------------------------------------------
const emptyState = page(
  `<main class="m-container" style="padding-block: var(--m-space-2) 0">
    ${profileBar('Tickets')}
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr)); gap: var(--m-space-8); align-items: start">
      <section aria-labelledby="upcoming" style="grid-column: span 2">
        ${sectionHead('Upcoming tickets', '', 'upcoming')}
        <div class="m-stack" data-gap="4" data-align="center" style="text-align: center; padding: var(--m-space-10) var(--m-space-4); border-radius: var(--m-radius-lg); background: var(--m-color-bg-sunken)">
          <div aria-hidden="true" style="display: grid; grid-template-columns: repeat(4, 3.25rem); gap: var(--m-space-1)">
            ${[0, 1, 2, 3].map(() => `<span style="aspect-ratio: 2 / 3; border-radius: var(--m-radius-lg); border: 1px dashed var(--m-color-border-default)"></span>`).join('')}
          </div>
          <h1 style="margin: 0; ${lightTitle('var(--m-font-size-2xl)')}">No tickets yet</h1>
          <p style="margin: 0; max-inline-size: 26rem; color: var(--m-color-fg-muted)">Seats you book show up here with the door time, the screen and your row, and move to your log once the lights come up.</p>
          <div class="m-cluster" data-gap="2" data-justify="center">
            <a class="m-button" data-variant="primary" href="#">Find a screening</a>
            <a class="m-button" data-variant="secondary" href="#">Browse seasons</a>
          </div>
        </div>
      </section>
      <aside class="m-stack" data-gap="5" aria-label="Elsewhere">
        <section aria-labelledby="passes">
          ${sectionHead('Passes', '', 'passes')}
          <p style="margin: 0; ${meta}">You don’t hold a season pass. <a href="#" style="${linkPlain}">See what’s on sale</a>.</p>
        </section>
        <section aria-labelledby="past">
          ${sectionHead('Past tickets', '0', 'past')}
          <p style="margin: 0; ${meta}">Nothing here until your first screening.</p>
        </section>
      </aside>
    </div>
  </main>`,
);

// ------------------------------------------------------------------------------------------------
// Pricing
// ------------------------------------------------------------------------------------------------
const tag = (label: string, tone: 'neutral' | 'warning' | 'info') =>
  `<span style="display: inline-block; padding: var(--m-space-1) var(--m-space-2); border-radius: var(--m-radius-md); font-family: var(--m-font-family-sans); font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-wide); text-transform: uppercase; ${
    tone === 'neutral'
      ? 'background: var(--m-color-bg-raised); color: var(--m-color-fg-default)'
      : `background: var(--m-color-${tone}-solid); color: var(--m-color-${tone}-on-solid)`
  }">${label}</span>`;
const planCol = (name: string, tone: 'warning' | 'info', lines: string[], price: string, cta: string, divider: boolean) => `<section aria-label="${name}" style="display: grid; grid-template-rows: subgrid; grid-row: span 3; ${divider ? 'border-inline-start: 1px solid var(--m-color-border-default);' : ''}">
          <div class="m-stack" data-gap="3" data-align="center" style="padding: 0 var(--m-space-5) var(--m-space-5); text-align: center">
            <h2 style="margin: calc(var(--m-space-4) * -1) 0 var(--m-space-1)">${tag(name, tone)}</h2>
            ${lines.map((l) => `<p style="margin: 0; color: var(--m-color-fg-default)">${l}</p>`).join('\n            ')}
          </div>
          <p style="margin: 0; display: grid; place-items: center; padding: var(--m-space-4); background: var(--m-button-secondary-bg); color: var(--m-button-secondary-fg); text-align: center">
            <span><span style="font-size: var(--m-font-size-xl); font-weight: 300">USD</span> <strong style="font-size: var(--m-font-size-3xl); ${nums}">${price}</strong><span aria-hidden="true">*</span><br><span style="font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-wide); text-transform: uppercase">Per year</span></span>
          </p>
          <a href="#" style="display: grid; place-items: center; padding: var(--m-space-3); background: var(--m-button-secondary-bg); border-block-start: 1px solid var(--m-color-border-default); color: var(--m-button-secondary-fg); text-decoration: none; ${capsBold}">${cta}</a>
        </section>`;

const pricing = page(
  `<main class="m-container" style="padding-block: var(--m-space-8) 0">
    <header class="m-stack" data-gap="2" style="text-align: center; max-inline-size: 36rem; margin-inline: auto">
      <h1 style="margin: 0; ${serifTitle('var(--m-font-size-4xl)')}">Make every season count.</h1>
      <p style="margin: 0; ${lightTitle('var(--m-font-size-xl)')}; color: var(--m-color-fg-muted)">Matinee is free for logging, notes and clubs. Plans add the extras regulars ask for, and keep the lights on for us.</p>
    </header>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(14rem, 100%), 1fr)); gap: var(--m-space-6); align-items: start; margin-block-start: var(--m-space-10)">
      <div class="m-stack" data-gap="6">
        <section aria-label="Free" class="m-stack" data-gap="3" data-align="center" style="border: 1px solid var(--m-color-border-muted); border-radius: var(--m-radius-md); padding: 0 var(--m-space-4) var(--m-space-4); text-align: center">
          <h2 style="margin: calc(var(--m-space-4) * -1) 0 var(--m-space-1)">${tag('Free', 'neutral')}</h2>
          <p style="margin: 0; color: var(--m-color-fg-default)">Every account logs unlimited screenings, notes, ratings and clubs.</p>
        </section>
        <form class="m-stack" data-gap="2" aria-label="Gift code" style="text-align: center">
          <p style="margin: 0; ${meta}"><a href="#" style="${linkPlain}">Read more</a> about plans.</p>
          <div class="m-cluster" data-gap="1" data-justify="center" style="flex-wrap: nowrap"><input class="m-input" data-size="sm" placeholder="Gift code" aria-label="Gift code" style="inline-size: 8rem"><button type="submit" class="m-button" data-variant="secondary" data-size="sm">Redeem</button></div>
        </form>
      </div>
      <div style="grid-column: span 2; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(13rem, 100%), 1fr)); background: var(--m-color-bg-raised); border-radius: var(--m-radius-md)">
        ${planCol('Cinephile', 'warning', ['No ads, anywhere.', 'Yearly and all-time numbers: hours in the dark, favourite screens, your most-seen directors.', 'Seat alerts for sold-out shows; book for two in one go.', 'Hide scores until you’ve rated.'], '$22.00', 'Choose Cinephile', false)}
        ${planCol('Programmer', 'info', ['Everything in Cinephile.', 'Start a club with its own season page, a guest list and polls for the next pick.', 'Early booking for member screenings at partner cinemas.', 'Your name on the Programmers wall, with our thanks.'], '$55.00', 'Choose Programmer', true)}
      </div>
    </div>
    <p style="margin: var(--m-space-2) 0 0; text-align: end; ${meta}">*Prices include any sales tax that applies.</p>

    <section aria-labelledby="faq" style="max-inline-size: 40rem; margin: var(--m-space-10) auto 0">
      ${sectionHead('Questions', '', 'faq')}
      <div class="m-accordion">
        <details class="m-accordion-item" open><summary>Can I switch plans later?</summary><div class="m-accordion-content">Yes. Moving up takes effect at once and we credit what’s left of your year; moving down starts at your next renewal.</div></details>
        <details class="m-accordion-item"><summary>Do clubs need a plan?</summary><div class="m-accordion-content">Joining a club is free. Starting one with its own season page is part of Programmer.</div></details>
        <details class="m-accordion-item"><summary>What happens to my log if I cancel?</summary><div class="m-accordion-content">Nothing is deleted. Your screenings, notes and ratings stay; plan-only extras switch off.</div></details>
      </div>
    </section>
  </main>`,
);

// ------------------------------------------------------------------------------------------------
// Errors
// ------------------------------------------------------------------------------------------------
const fullPage = (code: string, title: string, body: string, actions: string, n: number) => `<section aria-labelledby="e-${code}" style="border-radius: var(--m-radius-lg); overflow: hidden; background: var(--m-color-bg-sunken)">
        ${backdrop(n, '8rem')}
        <div class="m-stack" data-gap="3" data-align="center" style="padding: 0 var(--m-space-5) var(--m-space-6); text-align: center; margin-block-start: -2rem; position: relative">
          <p style="margin: 0; font-family: var(--m-font-family-mono); ${meta}">${code}</p>
          <h3 id="e-${code}" style="margin: 0; ${lightTitle('var(--m-font-size-2xl)')}">${title}</h3>
          <p style="margin: 0; max-inline-size: 22rem; color: var(--m-color-fg-muted)">${body}</p>
          <div class="m-cluster" data-gap="2" data-justify="center">${actions}</div>
        </div>
      </section>`;

const errors = page(
  `<main class="m-container" style="padding-block: var(--m-space-6) 0">
    <h1 style="margin: 0 0 var(--m-space-6); ${lightTitle()}">When something goes wrong</h1>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(22rem, 100%), 1fr)); gap: var(--m-space-8); align-items: start">
      <section aria-labelledby="form-err">
        ${sectionHead('In a form', '', 'form-err')}
        <form class="m-stack" data-gap="4" style="background: var(--m-color-bg-raised); border-radius: var(--m-radius-md); padding: var(--m-space-5)" novalidate>
          <div class="m-alert" data-tone="danger" role="alert">
            <span class="m-alert-icon">${icon(I.alert, 16)}</span>
            <div class="m-alert-content"><p class="m-alert-title">Your note wasn’t posted</p><div class="m-alert-body">Two things need fixing. Nothing was shared with your clubs.</div></div>
          </div>
          <div class="m-stack" data-gap="1">
            <p style="margin: 0; ${caps}; color: var(--m-color-fg-default)">I attended…</p>
            <h2 style="margin: 0; ${serifTitle('var(--m-font-size-2xl)')}">Kiln <span style="font-family: var(--m-font-family-sans); font-weight: 300; font-size: var(--m-font-size-xl); color: var(--m-color-fg-muted)">2025</span></h2>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="e-date">Date seen</label>
            <input class="m-input" id="e-date" value="14 Nov 2026" aria-invalid="true" aria-describedby="e-date-msg">
            <p class="m-field-error" id="e-date-msg" style="display: flex; gap: var(--m-space-1); align-items: center">${icon(I.alert, 12)} That date is still to come. Pick the day you went.</p>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="e-note">Note</label>
            <textarea class="m-input" id="e-note" rows="3" aria-invalid="true" aria-describedby="e-note-msg" style="font-family: var(--m-font-family-serif); font-size: var(--m-font-size-lg)"></textarea>
            <p class="m-field-error" id="e-note-msg" style="display: flex; gap: var(--m-space-1); align-items: center">${icon(I.alert, 12)} Write something, or turn off “Share with clubs”.</p>
          </div>
          <div class="m-cluster" data-justify="between">
            <label class="m-cluster" data-gap="2"><input class="m-checkbox" type="checkbox" checked> <span style="color: var(--m-color-fg-default)">Share with clubs</span></label>
            <button type="submit" class="m-button" data-variant="primary">Save</button>
          </div>
        </form>
      </section>

      <section aria-labelledby="elsewhere-err" class="m-stack" data-gap="4">
        ${sectionHead('Somewhere else', '', 'elsewhere-err')}
        <div class="m-toast" role="status">
          <div class="m-toast-content"><p class="m-toast-title">Booking didn’t go through</p><div class="m-toast-body">Row F at the Cameo sold out while you were choosing. Your card wasn’t charged.</div></div>
          <div class="m-toast-actions"><button type="button" class="m-button" data-variant="primary" data-size="sm">Pick seats</button></div>
          <button type="button" class="m-toast-close" aria-label="Dismiss">${icon(I.x, 14)}</button>
        </div>
        <div class="m-alert" data-tone="warning" role="status">
          <span class="m-alert-icon">${icon(I.triangle, 16)}</span>
          <div class="m-alert-content"><p class="m-alert-title">Showtimes may be out of date</p><div class="m-alert-body">We couldn’t reach the Dominion since 18:05. <a href="#" style="color: inherit">Try again</a></div></div>
        </div>
        <div class="m-alert" data-tone="info" role="status">
          <span class="m-alert-icon">${icon(I.refresh, 16)}</span>
          <div class="m-alert-content"><div class="m-alert-body">Your log is catching up with 3 screenings from another device.</div></div>
        </div>
      </section>
    </div>

    <section aria-labelledby="pages-err" style="margin-block-start: var(--m-space-8)">
      ${sectionHead('Whole pages', '', 'pages-err')}
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(17rem, 100%), 1fr)); gap: var(--m-space-3)">
        ${fullPage('404', 'This reel is missing', 'The page you asked for isn’t here. It may have moved, or the link was cut short.', `<a class="m-button" data-variant="primary" href="#">Back to Tonight</a>`, 3)}
        ${fullPage('500', 'The projector jammed', 'Something broke on our side. Nothing you saved was lost.', `<button type="button" class="m-button" data-variant="primary">${icon(I.refresh, 14)} Try again</button><a class="m-button" data-variant="secondary" href="#">Status</a>`, 4)}
        ${fullPage('403', 'Members only', 'This club’s season page is for its members. Ask to join and an organiser will let you in.', `<button type="button" class="m-button" data-variant="primary">${icon(I.lock, 14)} Ask to join</button>`, 7)}
      </div>
    </section>
  </main>`,
);

export const reelRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'A light welcome line, a row of large posters with green, blue and orange counts, a tight strip of small posters with stars, serif-titled notes, and a side column of tracked-capital sections: month figures, a ratings histogram and the next tickets.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'The framed profile bar, capital sub-tabs and filters over a dense diary table (month tiles, light day numbers, serif titles, stars, hearts); then one film’s page: a faded backdrop, the poster, a serif title, serif synopsis, capital tabs with chips and the slate action panel.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'A backdrop fading into the page under a centred serif headline, then one slate step panel: capital step label, poster slots to fill, a search field, checkbox rows, a slate Back and a green Continue.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A light page title with an upgrade tag, green capital tabs on a hairline, a light section title, two columns of slate fields and poster slots, switch rows, and a green Save changes.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'Inside the profile frame: a sunken panel with dashed poster outlines, a light title, one sentence, a green action and a slate one; quiet side sections say what will appear.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'A serif headline; an outlined free box beside one slate panel split by a hairline into two plans, each with a coloured capital tag overlapping its top, centred lines, a mid-slate price band and a capital action band; questions below.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors under slate fields, a danger box above the form saying nothing was shared, the slate flash message with one action, warning and info boxes, and full pages for 404, 500 and no access over a faded backdrop.',
    html: errors,
  },
];
