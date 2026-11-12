import type { ArchetypeRecipe } from '../types';

/*
 * Mosaic's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with invented content from a visual-ideas app ("Tessera"). They follow the
 * language's real screen patterns: an 80px white top bar with a round red mark, nav pills (the
 * current one solid black) and a long grey search pill; a masonry of image tiles with 16px corners
 * and a bold title under each; a red Save pill and white round buttons over a darkened tile on
 * hover; a 32px-cornered detail card; profile and collection grids; grey pills everywhere else.
 * Images are never real: every picture is a token-coloured placeholder.
 */

// Lucide icons at 2.25: the reference's glyphs are solid and heavy, so the stroke is too
const icon = (paths: string, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none">${paths}</svg>`;
const I = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  out: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  heart:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  sliders:
    '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  searchX: '<path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  sparkles:
    '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>',
  pencil:
    '<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/><path d="m15 5 4 4"/>',
  globe:
    '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
};

// Shared treatments (tokens only)
const muted = 'color: var(--m-color-fg-muted)';
const subtle = 'color: var(--m-color-fg-subtle)';
const bold = 'font-weight: var(--m-font-weight-bold)';
const heading = (size: string) =>
  `font-family: var(--m-font-family-display); font-size: var(--m-font-size-${size}); font-weight: var(--m-font-heading-weight); letter-spacing: var(--m-font-heading-tracking); line-height: var(--m-font-leading-tight)`;
// White on a darkened picture, in both modes
const onImage = 'color: var(--m-color-accent-fg)';

// Picture placeholders: soft two-stop fills from the status tints, never images
const fills = [
  'linear-gradient(165deg, var(--m-color-warning-bg), var(--m-color-warning-border))',
  'linear-gradient(165deg, var(--m-color-info-bg), var(--m-color-info-border))',
  'linear-gradient(165deg, var(--m-color-success-bg), var(--m-color-success-border))',
  'linear-gradient(165deg, var(--m-color-brand-subtle), var(--m-color-danger-border))',
  'linear-gradient(165deg, var(--m-color-bg-sunken), var(--m-color-border-default))',
  'linear-gradient(165deg, var(--m-color-danger-bg), var(--m-color-warning-border))',
  'linear-gradient(165deg, var(--m-color-info-bg), var(--m-color-success-border))',
];
const fill = (i: number) => fills[i % fills.length];
const tile = (ratio: string, i: number, inner = '', radius = 'var(--m-radius-lg)') =>
  `<div role="img" aria-label="Picture" style="position: relative; aspect-ratio: ${ratio}; border-radius: ${radius}; background: ${fill(i)}; overflow: hidden">${inner}</div>`;

const roundButton = (paths: string, label: string, variant = 'secondary', size = 'md') =>
  `<button type="button" class="m-button" data-variant="${variant}" data-size="${size}" data-icon-only aria-label="${label}">${icon(paths, size === 'sm' ? 16 : 20)}</button>`;

// The hover layer over a tile: darkened, the collection picker and red Save on top, link and actions below
const hoverLayer = (
  board: string,
  site: string,
) => `<div aria-hidden="true" style="position: absolute; inset: 0; background: var(--m-color-bg-overlay); opacity: 0.4"></div>
      <div style="position: absolute; inset: 0; padding: var(--m-space-3); display: flex; flex-direction: column; justify-content: space-between">
        <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap">
          <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="${onImage}; padding-inline: var(--m-space-1); min-inline-size: 0; overflow: hidden"><span style="overflow: hidden; text-overflow: ellipsis">${board}</span> ${icon(I.down, 16)}</button>
          <button type="button" class="m-button" data-variant="primary" style="flex: none">Save</button>
        </div>
        <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap">
          <a class="m-button" data-size="sm" href="#" style="background: var(--m-color-bg-raised); min-inline-size: 0; overflow: hidden">${icon(I.out, 16)} <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">${site}</span></a>
          <span class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${roundButton(I.share, 'Share', 'secondary', 'sm').replace('data-variant="secondary"', 'data-variant="secondary" style="background: var(--m-color-bg-raised)"')}${roundButton(I.more, 'More', 'secondary', 'sm').replace('data-variant="secondary"', 'data-variant="secondary" style="background: var(--m-color-bg-raised)"')}</span>
        </div>
      </div>`;

interface Pin {
  r: string;
  title?: string;
  by?: string;
  hover?: [string, string];
}
// One masonry item: the tile, then a bold two-line title and the person who saved it
const pin = (p: Pin, i: number) => `    <article style="break-inside: avoid; margin-block-end: var(--m-space-4)">
      ${tile(p.r, i, p.hover ? hoverLayer(p.hover[0], p.hover[1]) : '')}
      ${p.title || p.by ? `<div class="m-stack" data-gap="1" style="padding: var(--m-space-2) var(--m-space-1) 0">${p.title ? `<h3 style="font-size: var(--m-font-size-sm); ${bold}; line-height: var(--m-font-leading-normal)">${p.title}</h3>` : ''}${p.by ? `<span class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-sm)"><span class="m-avatar" data-size="sm">${p.by[0]}</span>${p.by}</span>` : ''}</div>` : ''}
    </article>`;
// Masonry: as many 236px-ish columns as fit, 16px gutters
const masonry = (pins: Pin[], label: string, offset = 0) =>
  `<section aria-label="${label}" style="columns: 6 10rem; column-gap: var(--m-space-4)">
${pins.map((p, i) => pin(p, i + offset)).join('\n')}
  </section>`;

// The round red mark (a plain glyph, not a logo)
const mark = (size = '2rem') =>
  `<span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: ${size}; block-size: ${size}; border-radius: var(--m-radius-full); background: var(--m-color-brand-default); color: var(--m-color-brand-fg); font-family: var(--m-font-family-display); font-weight: var(--m-font-weight-bold); font-size: calc(${size} * 0.6); line-height: 1">t</span>`;

// The long grey search pill
const searchPill = (
  placeholder: string,
  id: string,
) => `<div style="position: relative; flex: 1; min-inline-size: 8rem">
      <span style="position: absolute; inset-inline-start: var(--m-space-4); inset-block: 0; display: flex; align-items: center; ${subtle}">${icon(I.search, 16)}</span>
      <label class="m-sr-only" for="${id}">Search</label>
      <input class="m-input" id="${id}" type="search" placeholder="${placeholder}" style="border-radius: var(--m-radius-full); border-color: transparent; background: var(--m-color-bg-sunken); padding-inline-start: 2.75rem">
    </div>`;

// The signed-in top bar: mark, nav pills (current black), search, then notifications, messages and you
const appBar = (current: string) => `<header class="m-navbar" data-sticky style="gap: var(--m-space-2)">
  <a class="m-navbar-brand" href="#" aria-label="Tessera home" style="padding-inline: var(--m-space-3)">${mark()}</a>
  <nav class="m-navbar-nav" aria-label="Main" style="flex: 0 1 auto; contain: none">
${['Discover', 'Studio', 'Shop'].map((l) => `    <a class="m-navbar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${l}</a>`).join('\n')}
  </nav>
  ${searchPill('Search for balcony plants, bread, linen…', `q-${current.toLowerCase() || 'none'}`)}
  <div class="m-navbar-actions" style="gap: 0">
    <span style="position: relative; display: inline-flex">${roundButton(I.bell, 'Notifications, 3 new', 'ghost')}<span aria-hidden="true" style="position: absolute; inset-block-start: var(--m-space-2); inset-inline-end: var(--m-space-2); inline-size: 0.625rem; block-size: 0.625rem; border-radius: var(--m-radius-full); background: var(--m-color-accent-default); box-shadow: 0 0 0 2px var(--m-color-bg-canvas)"></span></span>
    ${roundButton(I.chat, 'Messages', 'ghost')}
    <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Your profile"><span class="m-avatar" data-size="sm">I</span></button>
    ${roundButton(I.down, 'Accounts and more', 'ghost', 'sm')}
  </div>
</header>`;

// ---------------------------------------------------------------------------------------------
// Dashboard: the home feed. Filter pills, then the masonry, one tile shown hovered
const chips = [
  'All',
  'Small kitchens',
  'Clay and glaze',
  'Balcony plants',
  'Slow bread',
  'Linen rooms',
  'Watercolour',
  'Tiny cabins',
  'Rug weaving',
];
const feedPins: Pin[] = [
  { r: '3 / 4', title: 'Glazed bowls in a speckled oat finish', by: 'Marisol Duarte' },
  { r: '2 / 3', hover: ['Clay and glaze', 'kilnnotes.example'] },
  { r: '1 / 1', title: 'A balcony herb ladder from one pallet', by: 'Tomasz Wren' },
  { r: '9 / 16', title: 'Overnight rye, step by step' },
  { r: '4 / 5', by: 'Adaeze Obi' },
  { r: '3 / 4', title: 'Washed linen in clay and sage', by: 'Ines Okafor' },
  { r: '2 / 3', title: 'Pocket door pantry' },
  { r: '1 / 1', title: 'Loose watercolour lemons', by: 'Keiko Brandt' },
  { r: '3 / 5', title: 'Cabin loft with a ladder shelf', by: 'Rafa Lindqvist' },
  { r: '4 / 5' },
  { r: '3 / 4', title: 'Hand-tufted rug, first try', by: 'Noor Haddad' },
  { r: '2 / 3', title: 'Window box of trailing thyme' },
  { r: '1 / 1', by: 'Marisol Duarte' },
  { r: '3 / 4', title: 'Seeded focaccia garden', by: 'Tomasz Wren' },
  { r: '9 / 16', title: 'Tall jars for a small counter' },
  { r: '4 / 5', title: 'Indigo shibori napkins', by: 'Adaeze Obi' },
  { r: '2 / 3' },
  { r: '1 / 1', title: 'Terracotta and moss', by: 'Keiko Brandt' },
];

const dashboard = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
${appBar('Discover')}
<main style="padding: var(--m-space-2) var(--m-space-4) var(--m-space-12)">
  <div class="m-stack" data-gap="4">
    <nav class="m-cluster" data-gap="2" aria-label="Topics">
${chips.map((c, i) => `      <a class="m-button" data-size="sm" href="#" style="${i === 0 ? 'background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)' : ''}"${i === 0 ? ' aria-current="page"' : ''}>${c}</a>`).join('\n')}
    </nav>
    ${masonry(feedPins, 'Ideas for you')}
  </div>
</main>
</div>`;

// ---------------------------------------------------------------------------------------------
// List and detail: one idea in a 32px card (picture left, details right), more like it below
const comment = (
  name: string,
  text: string,
  when: string,
  likes: string,
) => `          <div class="m-cluster" data-gap="2" data-align="start" style="flex-wrap: nowrap">
            <span class="m-avatar" data-size="md">${name[0]}</span>
            <div class="m-stack" data-gap="1">
              <p style="font-size: var(--m-font-size-sm)"><strong style="${bold}">${name}</strong> ${text}</p>
              <span class="m-cluster" data-gap="4" style="font-size: var(--m-font-size-xs); ${subtle}">${when}<a href="#" style="color: inherit; ${bold}; text-decoration: none">Reply</a><span class="m-cluster" data-gap="1">${icon(I.heart, 14)} ${likes}</span></span>
            </div>
          </div>`;

const morePins: Pin[] = [
  { r: '3 / 4', title: 'Stacked bowls, oatmeal glaze' },
  { r: '1 / 1', by: 'Keiko Brandt' },
  { r: '2 / 3', title: 'Wax resist rims', by: 'Marisol Duarte' },
  { r: '4 / 5' },
  { r: '9 / 16', title: 'A glaze test wall', by: 'Noor Haddad' },
  { r: '3 / 4', title: 'Thrown mugs with pulled handles' },
  { r: '1 / 1', by: 'Tomasz Wren' },
  { r: '2 / 3', title: 'Speckled stoneware plates' },
  { r: '4 / 5', title: 'Kiln shelf layout', by: 'Adaeze Obi' },
  { r: '3 / 4' },
  { r: '2 / 3', title: 'Celadon over carved lines', by: 'Ines Okafor' },
  { r: '1 / 1', title: 'Drying rack ideas' },
];

const listDetail = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
${appBar('Discover')}
<main style="padding: var(--m-space-4) var(--m-space-4) var(--m-space-12)">
  <div class="m-stack" data-gap="10">
    <div style="position: relative">
      <div style="position: absolute; inset-inline-start: 0; inset-block-start: 0">${roundButton(I.back, 'Back to your feed', 'ghost', 'lg')}</div>
      <article class="m-card" style="max-inline-size: 63.5rem; margin-inline: auto; padding: 0; border-radius: 32px; box-shadow: var(--m-shadow-md); display: grid; grid-template-columns: repeat(auto-fit, minmax(min(20rem, 100%), 1fr)); overflow: hidden" aria-labelledby="ms-pin-title">
        ${tile('3 / 4', 0, '', '32px')}
        <div class="m-stack" data-gap="5" style="padding: var(--m-space-8)">
          <div class="m-cluster" data-justify="between">
            <span class="m-cluster" data-gap="1">${roundButton(I.heart, 'React', 'ghost')}${roundButton(I.share, 'Share', 'ghost')}${roundButton(I.link, 'Copy link', 'ghost')}${roundButton(I.more, 'More options', 'ghost')}</span>
            <span class="m-cluster" data-gap="2">
              <button type="button" class="m-button" data-variant="ghost" data-size="lg">Clay and glaze ${icon(I.down, 16)}</button>
              <button type="button" class="m-button" data-variant="primary" data-size="lg">Save</button>
            </span>
          </div>
          <a href="#" style="font-size: var(--m-font-size-sm); color: var(--m-color-fg-default)">kilnnotes.example</a>
          <h1 id="ms-pin-title" style="${heading('xl')}">Glazed bowls in a speckled oat finish</h1>
          <p>Three dips of a satin oat glaze over iron-speckled clay, fired to cone 6. The rims are wiped back so the clay shows through.</p>
          <div class="m-cluster" data-justify="between">
            <span class="m-cluster" data-gap="3">
              <span class="m-avatar" data-size="lg">M</span>
              <span class="m-stack" data-gap="0"><strong style="${bold}">Marisol Duarte</strong><span style="font-size: var(--m-font-size-sm)">3,180 followers</span></span>
            </span>
            <button type="button" class="m-button" data-size="lg">Follow</button>
          </div>
          <section class="m-stack" data-gap="4" aria-labelledby="ms-comments">
            <h2 id="ms-comments" class="m-cluster" data-gap="2" style="${heading('lg')}">14 comments ${icon(I.down, 20)}</h2>
${comment('Keiko Brandt', 'What cone do you bisque to first? Mine keep crawling at the rim.', '2d', '6')}
${comment('Noor Haddad', 'The wiped rim is such a nice touch.', '5d', '3')}
          </section>
          <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap; margin-block-start: auto; padding-block-start: var(--m-space-4); border-block-start: var(--m-border-width-thin) solid var(--m-color-border-muted)">
            <strong style="${bold}; white-space: nowrap">What do you think?</strong>
            <span class="m-cluster" data-gap="1" style="margin-inline-start: auto; ${muted}">${icon(I.heart, 16)} 212</span>
          </div>
          <div style="position: relative">
            <label class="m-sr-only" for="ms-comment">Add a comment</label>
            <input class="m-input" id="ms-comment" placeholder="Add a comment" style="border-radius: var(--m-radius-full); border-color: transparent; background: var(--m-color-bg-sunken); padding-inline-end: 3rem">
            <span style="position: absolute; inset-inline-end: var(--m-space-3); inset-block: 0; display: flex; align-items: center; ${muted}">${icon(I.smile, 20)}</span>
          </div>
        </div>
      </article>
    </div>
    <h2 style="${heading('lg')}; text-align: center">More to explore</h2>
    ${masonry(morePins, 'More like this', 2)}
  </div>
</main>
</div>`;

// ---------------------------------------------------------------------------------------------
// Onboarding: pick topics to start the feed. Big picture tiles with the name on top; picked ones darken
const topics: [string, boolean][] = [
  ['Ceramics', true],
  ['Balcony gardens', false],
  ['Bread baking', true],
  ['Cabin living', false],
  ['Watercolour', false],
  ['Linen and textiles', true],
  ['Small kitchens', false],
  ['Rug making', false],
  ['Bike touring', false],
  ['Houseplants', false],
  ['Printmaking', false],
  ['Tiny gardens', false],
];
const topic = (
  [name, picked]: [string, boolean],
  i: number,
) => `      <button type="button" aria-pressed="${picked}" style="all: unset; cursor: pointer; display: block; border-radius: var(--m-radius-lg)">
        ${tile(
          '1 / 1',
          i,
          `<div aria-hidden="true" style="position: absolute; inset: 0; background: var(--m-color-bg-overlay); opacity: ${picked ? '0.6' : '0.25'}"></div>
          <span style="position: absolute; inset: 0; display: grid; place-items: center; padding: var(--m-space-3); text-align: center; ${onImage}; ${bold}; font-size: var(--m-font-size-md)">${name}</span>${
            picked
              ? `<span style="position: absolute; inset-block-start: var(--m-space-3); inset-inline-end: var(--m-space-3); display: grid; place-items: center; inline-size: 1.75rem; block-size: 1.75rem; border-radius: var(--m-radius-full); background: var(--m-color-bg-raised); color: var(--m-color-fg-default)">${icon(I.check, 16)}</span>`
              : ''
          }`,
        )}
      </button>`;

const onboarding = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
<header class="m-navbar">
  <a class="m-navbar-brand" href="#" aria-label="Tessera">${mark()}</a>
  <div class="m-navbar-actions">
    <span class="m-cluster" data-gap="2" aria-label="Step 2 of 3"><span style="inline-size: 0.5rem; block-size: 0.5rem; border-radius: var(--m-radius-full); background: var(--m-color-border-default)"></span><span style="inline-size: 0.5rem; block-size: 0.5rem; border-radius: var(--m-radius-full); background: var(--m-color-fg-default)"></span><span style="inline-size: 0.5rem; block-size: 0.5rem; border-radius: var(--m-radius-full); background: var(--m-color-border-default)"></span></span>
  </div>
</header>
<main class="m-container" style="--m-layout-container-max-lg: 56rem; padding-block: var(--m-space-6) var(--m-space-12)">
  <div class="m-stack" data-gap="8">
    <div class="m-stack" data-gap="3" data-align="center" style="text-align: center">
      <h1 style="${heading('2xl')}">What would you like to make?</h1>
      <p style="${muted}; font-size: var(--m-font-size-lg)">Pick five or more. They shape your first feed, and you can change them later.</p>
    </div>
    <div class="m-grid" style="--m-layout-grid-min: 10rem">
${topics.map(topic).join('\n')}
    </div>
  </div>
</main>
<footer style="background: var(--m-color-bg-canvas); box-shadow: 0 -2px 8px var(--m-color-border-muted); padding: var(--m-space-4)">
  <div class="m-cluster" data-justify="between" style="max-inline-size: 56rem; margin-inline: auto">
    <button type="button" class="m-button" data-size="lg">${icon(I.left, 20)} Back</button>
    <span class="m-cluster" data-gap="4">
      <span style="${muted}">3 picked · 2 to go</span>
      <button type="button" class="m-button" data-variant="primary" data-size="lg" disabled>Next</button>
    </span>
  </div>
</footer>
</div>`;

// ---------------------------------------------------------------------------------------------
// Settings: a plain list of sections (current one solid black), one form column, a Save bar along the bottom
const settingsSections = [
  'Your profile',
  'Alerts',
  'Feed preferences',
  'Sign-in and devices',
  'Linked shops',
  'Data and downloads',
  'Accessibility',
];
const field = (id: string, label: string, value: string, hint = '') => `        <div class="m-field">
          <label class="m-field-label" for="${id}">${label}</label>
          <input class="m-input" id="${id}" value="${value}"${hint ? ` aria-describedby="${id}-h"` : ''}>
          ${hint ? `<p class="m-field-hint" id="${id}-h">${hint}</p>` : ''}
        </div>`;
const toggle = (
  id: string,
  title: string,
  text: string,
  on: boolean,
) => `        <div class="m-cluster" data-justify="between" data-gap="6" style="flex-wrap: nowrap">
          <label class="m-stack" data-gap="1" for="${id}"><strong style="${bold}">${title}</strong><span style="${muted}; font-size: var(--m-font-size-sm)">${text}</span></label>
          <input class="m-switch" id="${id}" type="checkbox" role="switch"${on ? ' checked' : ''}>
        </div>`;

const settings = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
${appBar('')}
<div class="m-split" style="--m-layout-split-side: 15rem; --m-layout-split-gap: var(--m-space-8); padding: var(--m-space-6) var(--m-space-4) var(--m-space-12)">
  <nav class="m-sidebar" aria-label="Settings" style="padding-block-start: 0">
    <div class="m-sidebar-section">
      <ul>
${settingsSections.map((s, i) => `        <li><a class="m-sidebar-link" href="#"${i === 0 ? ' aria-current="page"' : ''}>${s}</a></li>`).join('\n')}
      </ul>
    </div>
  </nav>
  <main>
    <div class="m-stack" data-gap="6" style="max-inline-size: 30.5rem">
      <div class="m-stack" data-gap="2">
        <h1 style="${heading('xl')}">Your profile</h1>
        <p>Anyone who opens your profile sees these. Keep your private details private.</p>
      </div>
      <div class="m-stack" data-gap="2">
        <span style="font-size: var(--m-font-size-xs)">Photo</span>
        <span class="m-cluster" data-gap="4"><span class="m-avatar" style="inline-size: 4.5rem; block-size: 4.5rem; font-size: var(--m-font-size-xl)">I</span><button type="button" class="m-button">Change</button></span>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 12rem; gap: var(--m-space-4)">
${field('ms-first', 'First name', 'Ines')}
${field('ms-last', 'Last name', 'Okafor')}
      </div>
      <div class="m-field">
        <label class="m-field-label" for="ms-about">About</label>
        <textarea class="m-input" id="ms-about" rows="3" aria-describedby="ms-about-h">Potter in a converted garage. Glazes, bowls and the odd lopsided mug.</textarea>
        <p class="m-field-hint" id="ms-about-h">72 of 500 characters</p>
      </div>
${field('ms-site', 'Website', 'https://okafor-clay.example', 'Add a link to send people to your shop or portfolio.')}
${field('ms-user', 'Username', 'ines.okafor', 'tessera.example/ines.okafor')}
      <div class="m-stack" data-gap="5" style="padding-block-start: var(--m-space-2)">
        <h2 style="${heading('lg')}">Visibility</h2>
${toggle('ms-show', 'Show collections on my profile', 'Secret collections stay hidden either way.', true)}
${toggle('ms-allow', 'Let people save my uploads', 'Turning this off removes Save from your ideas for everyone else.', true)}
${toggle('ms-search', 'Hide my profile from search engines', 'It can take a few weeks for search engines to catch up.', false)}
      </div>
    </div>
  </main>
</div>
<div style="background: var(--m-color-bg-canvas); box-shadow: 0 -2px 8px var(--m-color-border-muted); padding: var(--m-space-4)">
  <div class="m-cluster" data-gap="2" data-justify="center">
    <button type="button" class="m-button" data-size="lg">Reset</button>
    <button type="button" class="m-button" data-variant="primary" data-size="lg">Save</button>
  </div>
</div>
</div>`;

// ---------------------------------------------------------------------------------------------
// Empty state: your profile with no saved collections yet
const emptyCover = `<div aria-hidden="true" style="display: grid; grid-template-columns: 2fr 1fr; grid-template-rows: 1fr 1fr; gap: 2px; inline-size: 15rem; aspect-ratio: 3 / 2; border-radius: var(--m-radius-lg); overflow: hidden">
        <span style="grid-row: span 2; background: var(--m-color-bg-sunken)"></span>
        <span style="background: var(--m-color-bg-sunken)"></span>
        <span style="background: var(--m-color-bg-sunken)"></span>
      </div>`;

const emptyState = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
${appBar('')}
<main class="m-container" style="padding-block: var(--m-space-6) var(--m-space-16)">
  <div class="m-stack" data-gap="6" data-align="center" style="text-align: center">
    <div class="m-stack" data-gap="2" data-align="center">
      <span class="m-avatar" style="inline-size: 7.5rem; block-size: 7.5rem; font-size: var(--m-font-size-3xl)">I</span>
      <h1 style="${heading('2xl')}; margin-block-start: var(--m-space-2)">Ines Okafor</h1>
      <span class="m-cluster" data-gap="1" style="${muted}">${mark('1rem')} ines.okafor</span>
      <span style="${bold}">0 followers · 12 following</span>
    </div>
    <div class="m-cluster" data-gap="2" data-justify="center">
      <button type="button" class="m-button" data-size="lg">Share</button>
      <button type="button" class="m-button" data-size="lg">Edit profile</button>
    </div>
    <div class="m-tabs" style="inline-size: auto">
      <div class="m-tab-list" role="tablist" aria-label="Profile">
        <button type="button" class="m-tab" role="tab" aria-selected="true" aria-controls="ms-tab-collections" id="ms-t-collections">Collections</button>
        <button type="button" class="m-tab" role="tab" aria-selected="false" aria-controls="ms-tab-uploads" id="ms-t-uploads">Uploads</button>
      </div>
    </div>
  </div>
  <div class="m-cluster" data-justify="between" style="margin-block: var(--m-space-4) var(--m-space-10)">
    ${roundButton(I.sliders, 'Sort and filter', 'ghost', 'lg')}
    ${roundButton(I.plus, 'Create', 'ghost', 'lg')}
  </div>
  <section class="m-tab-panel" role="tabpanel" id="ms-tab-collections" aria-labelledby="ms-t-collections">
    <div class="m-stack" data-gap="4" data-align="center" style="text-align: center">
      ${emptyCover}
      <h2 style="${heading('lg')}; margin-block-start: var(--m-space-2)">Nothing saved yet</h2>
      <p style="max-inline-size: 26rem">Save ideas you like and they land here, sorted into collections you name.</p>
      <div class="m-cluster" data-gap="2" data-justify="center">
        <a class="m-button" data-variant="primary" data-size="lg" href="#">Find ideas</a>
        <button type="button" class="m-button" data-size="lg">Create a collection</button>
      </div>
    </div>
  </section>
</main>
</div>`;

// ---------------------------------------------------------------------------------------------
// Pricing: the public site's bar, a segmented switch, three big rounded plan panels, a table, questions
const plan = (
  name: string,
  price: string,
  per: string,
  intro: string,
  features: string[],
  cta: string,
  primary = false,
) => `      <section class="m-card" data-variant="sunken" style="border-radius: 32px; padding: var(--m-space-8)${primary ? '; background: var(--m-color-brand-subtle)' : ''}" aria-labelledby="ms-plan-${name.toLowerCase()}">
        <div class="m-stack" data-gap="5" style="block-size: 100%">
          <div class="m-cluster" data-justify="between">
            <h2 id="ms-plan-${name.toLowerCase()}" style="${heading('lg')}">${name}</h2>
            ${primary ? '<span class="m-badge" data-variant="solid">Most chosen</span>' : ''}
          </div>
          <p class="m-cluster" data-gap="1" data-align="baseline"><span style="${heading('2xl')}">${price}</span><span style="${muted}">${per}</span></p>
          <p style="${muted}">${intro}</p>
          <ul class="m-stack" data-gap="3" style="padding: 0; list-style: none; flex: 1">
${features.map((f) => `            <li class="m-cluster" data-gap="2" data-align="start" style="flex-wrap: nowrap">${icon(I.check, 20)}<span>${f}</span></li>`).join('\n')}
          </ul>
          <button type="button" class="m-button" data-size="lg"${primary ? ' data-variant="primary"' : ''} style="inline-size: 100%">${cta}</button>
        </div>
      </section>`;

const yes = `<span aria-label="Included" style="display: inline-flex">${icon(I.check, 20)}</span>`;
const no = `<span aria-label="Not included" style="${subtle}">–</span>`;
const compareRow = (label: string, cells: string[]) =>
  `        <tr><th scope="row" style="font-weight: var(--m-font-weight-regular)">${label}</th>${cells.map((c) => `<td style="text-align: center">${c}</td>`).join('')}</tr>`;

const faq = (q: string, a: string, open = false) =>
  `    <details class="m-accordion-item"${open ? ' open' : ''}><summary>${q}</summary><div class="m-accordion-content"><p>${a}</p></div></details>`;

const pricing = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
<header class="m-navbar">
  <a class="m-navbar-brand" href="#" style="color: var(--m-color-brand-default); gap: var(--m-space-1)">${mark('1.5rem')} Tessera</a>
  <nav class="m-navbar-nav" aria-label="Site">
    <a class="m-navbar-link" href="#">Ideas</a>
    <a class="m-navbar-link" href="#" aria-current="page">For shops</a>
    <a class="m-navbar-link" href="#">Help</a>
  </nav>
  <div class="m-navbar-actions">
    <a class="m-button" data-size="lg" href="#">Log in</a>
    <a class="m-button" data-variant="primary" data-size="lg" href="#">Join free</a>
  </div>
</header>
<main class="m-container" style="padding-block: var(--m-space-12) var(--m-space-16)">
  <div class="m-stack" data-gap="12">
    <div class="m-stack" data-gap="5" data-align="center" style="text-align: center">
      <h1 style="${heading('3xl')}; max-inline-size: 18ch">Plans for makers who sell what they share</h1>
      <p style="font-size: var(--m-font-size-lg); max-inline-size: 36rem">Tag products in your ideas, see what people save, and promote the ones that work.</p>
      <div class="m-tabs" data-variant="pill">
        <div class="m-tab-list" role="tablist" aria-label="Billing">
          <button type="button" class="m-tab" role="tab" aria-selected="false">Monthly</button>
          <button type="button" class="m-tab" role="tab" aria-selected="true">Yearly · save 20%</button>
        </div>
      </div>
    </div>
    <div class="m-grid" style="--m-layout-grid-min: 17rem; align-items: stretch">
${plan('Maker', '$0', 'forever', 'For one shop finding its feet.', ['Tag up to 50 products', 'Saves and clicks for 30 days', 'One collaborator'], 'Start free')}
${plan('Studio', '$14', 'a month, billed yearly', 'For shops posting every week.', ['Unlimited product tags', 'A year of saves, clicks and outbound visits', 'Five collaborators', 'Scheduled posting'], 'Try Studio free for 14 days', true)}
${plan('Label', '$58', 'a month, billed yearly', 'For brands with a team and a budget.', ['Everything in Studio', 'Promoted ideas from $5 a day', 'Audience lists and lookalikes', 'Priority help, same day'], 'Talk to us')}
    </div>
    <section class="m-stack" data-gap="4" aria-labelledby="ms-compare">
      <h2 id="ms-compare" style="${heading('xl')}">Compare plans</h2>
      <div class="m-table-wrap">
        <table class="m-table">
          <thead><tr><th scope="col">Feature</th><th scope="col" style="text-align: center">Maker</th><th scope="col" style="text-align: center">Studio</th><th scope="col" style="text-align: center">Label</th></tr></thead>
          <tbody>
${compareRow('Product tags', ['50', 'Unlimited', 'Unlimited'])}
${compareRow('Scheduled posting', [no, yes, yes])}
${compareRow('Promoted ideas', [no, no, yes])}
${compareRow('Collaborators', ['1', '5', '25'])}
          </tbody>
        </table>
      </div>
    </section>
    <section class="m-stack" data-gap="4" style="max-inline-size: 48rem" aria-labelledby="ms-faq">
      <h2 id="ms-faq" style="${heading('xl')}">Questions</h2>
      <div class="m-accordion">
${faq('Can I switch plans later?', 'Yes. Upgrades start at once and we credit what is left of your old plan; downgrades start at your next bill.', true)}
${faq('Do people need an account to see my ideas?', 'No. Anyone with the link can look; they need an account to save.')}
${faq('What counts as a product tag?', 'One product linked to one idea. Tag the same product in ten ideas and it counts once.')}
      </div>
    </section>
  </div>
</main>
</div>`;

// ---------------------------------------------------------------------------------------------
// Errors: a form with field errors and a summary, toasts, a destructive confirm, and full pages
const fieldError = (id: string, text: string) =>
  `<p class="m-field-error" id="${id}" style="display: flex; gap: var(--m-space-1); align-items: center">${icon(I.alert, 16)} ${text}</p>`;
const errorPage = (
  code: string,
  ic: string,
  title: string,
  text: string,
  actions: string,
) => `    <section class="m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-12); border-block-start: var(--m-border-width-thin) solid var(--m-color-border-muted)" aria-labelledby="ms-err-${code}">
      <span style="display: grid; place-items: center; inline-size: 4rem; block-size: 4rem; border-radius: var(--m-radius-full); background: var(--m-color-bg-sunken)">${icon(ic, 32)}</span>
      <span style="font-family: var(--m-font-family-mono); font-size: var(--m-font-size-sm); ${subtle}">${code}</span>
      <h2 id="ms-err-${code}" style="${heading('xl')}">${title}</h2>
      <p style="max-inline-size: 28rem">${text}</p>
      <div class="m-cluster" data-gap="2" data-justify="center">${actions}</div>
    </section>`;
const toastThumb = (i: number) =>
  `<span aria-hidden="true" style="flex: none; inline-size: 2.5rem; block-size: 3.25rem; border-radius: var(--m-radius-md); background: ${fill(i)}"></span>`;

const errors = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
${appBar('Studio')}
<main class="m-container" data-size="md" style="padding-block: var(--m-space-8) var(--m-space-16)">
  <div class="m-stack" data-gap="10">
    <section class="m-card" style="border-radius: 32px; box-shadow: var(--m-shadow-md); padding: var(--m-space-8); max-inline-size: 34rem; margin-inline: auto; inline-size: 100%" aria-labelledby="ms-err-form">
      <form class="m-stack" data-gap="5" novalidate>
        <h1 id="ms-err-form" style="${heading('xl')}; text-align: center">New collection</h1>
        <div class="m-alert" data-tone="danger" role="alert">
          <span class="m-alert-icon">${icon(I.alert, 20)}</span>
          <div class="m-alert-content"><div class="m-alert-title">Two things to fix</div><div class="m-alert-body">Nothing was created yet. Fix the fields below and try again.</div></div>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="ms-e-name">Name</label>
          <input class="m-input" id="ms-e-name" value="" placeholder="Like “Spring glazes” or “Shed ideas”" aria-invalid="true" aria-describedby="ms-e-name-e">
          ${fieldError('ms-e-name-e', 'Give your collection a name.')}
        </div>
        <div class="m-field">
          <label class="m-field-label" for="ms-e-slug">Short link</label>
          <input class="m-input" id="ms-e-slug" value="spring glazes!" aria-invalid="true" aria-describedby="ms-e-slug-e">
          ${fieldError('ms-e-slug-e', 'Use letters, numbers and dashes only.')}
        </div>
        <label class="m-field" data-layout="inline"><input class="m-checkbox" type="checkbox" checked> Keep this collection secret</label>
        <div class="m-cluster" data-gap="2" data-justify="end">
          <button type="button" class="m-button" data-size="lg">Cancel</button>
          <button type="submit" class="m-button" data-variant="primary" data-size="lg">Create</button>
        </div>
      </form>
    </section>
    <div class="m-toast-region" data-static aria-live="polite" aria-label="Toasts" style="align-items: center">
      <div class="m-toast" role="alert" style="grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; inline-size: min(100%, 26rem)">${toastThumb(1)}<div class="m-toast-content"><p class="m-toast-title">Couldn’t save to Clay and glaze</p><p class="m-toast-body">You’re offline. We’ll keep trying.</p></div><button type="button" class="m-button" data-size="sm">Try again</button></div>
      <div class="m-toast" role="status" style="grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; inline-size: min(100%, 26rem)">${toastThumb(2)}<div class="m-toast-content"><p class="m-toast-title">Saved to Balcony plants</p></div><button type="button" class="m-button" data-size="sm">Undo</button></div>
    </div>
    <div class="m-dialog" data-static data-size="sm" role="dialog" aria-modal="false" aria-labelledby="ms-del-title" aria-describedby="ms-del-desc" style="margin-inline: auto">
      <div class="m-dialog-header"><h2 class="m-dialog-title" id="ms-del-title" style="text-align: center">Delete Shed ideas?</h2></div>
      <div class="m-dialog-body"><p class="m-dialog-description" id="ms-del-desc" style="text-align: center">Its 38 saved ideas and 2 sections go too. People you invited lose access. This can’t be undone.</p></div>
      <div class="m-dialog-footer"><button type="button" class="m-button" data-size="lg">Cancel</button><button type="button" class="m-button" data-variant="primary" data-size="lg">Delete</button></div>
    </div>
${errorPage('404', I.searchX, 'We couldn’t find that page', 'The link may be old, or the idea was deleted by the person who saved it.', `<a class="m-button" data-variant="primary" data-size="lg" href="#">${icon(I.home, 20)} Go to your feed</a>`)}
${errorPage('500', I.refresh, 'Something went wrong on our end', 'Nothing you saved was lost. Give it a moment and try again.', `<button type="button" class="m-button" data-variant="primary" data-size="lg">Try again</button><a class="m-button" data-size="lg" href="#">Get help</a>`)}
${errorPage('403', I.lock, 'This collection is secret', 'Only the people its owner invited can see it. Ask Marisol Duarte for an invite.', `<button type="button" class="m-button" data-variant="primary" data-size="lg">Ask to join</button><a class="m-button" data-size="lg" href="#">Go back</a>`)}
  </div>
</main>
</div>`;

export const mosaicRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'The home feed: the top bar with a black current pill and a long grey search, a row of topic pills, then a masonry of 16px picture tiles with bold titles; one tile hovered shows red Save.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'One idea in a 32px card (picture left; actions, collection picker and Save, title, author and comments right), then more like it as a masonry.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'Pick topics to start the feed: a centred bold question, square picture tiles named in white that darken when picked, a bottom bar with Back and a red Next.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A plain list of sections with the current one solid black, one 488px form column of 48px fields and switches, and a Reset and Save bar along the bottom.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'Your profile with nothing saved: a big round avatar, bold name, grey pills, underline tabs, a grey collection cover and a red Find ideas pill.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The public bar, a bold centred headline, a segmented yearly switch, three 32px plan panels (the chosen one on the brand tint), a comparison table and questions.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors in red under 48px fields, a tinted summary that says nothing was created, near-black toasts, a red destructive confirm, and full pages for 404, 500 and no access.',
    html: errors,
  },
];
