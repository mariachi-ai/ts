import type { ArchetypeRecipe } from '../types';

/*
 * Transit's nine layout recipes: framework-free HTML using only @mariachi/design classes and
 * tokens (no colour literals), with sample data from an invented rides-and-parcels service,
 * "Roundabout". They follow the language's real screen patterns: a white app header with a 4px
 * underline on the current tab, a bordered booking panel beside a map (always a token-drawn
 * placeholder, never a real map), grey-filled fields with a dot and a square for the two ends of
 * a trip, option rows where the chosen one gets a 2px black edge, black 48px actions, pill chips,
 * big bold headings, and full-bleed black blocks on marketing pages. Habits kept on every page (measured
 * on the source's public pages): three weights (400, 500, 700), four to six sizes, 16px icons in rows
 * and buttons, edges drawn as borders (never a shadow on a panel), panels nested one level, and list
 * rows about 72px tall.
 */

// Lucide icons, outlined at 2px: the reference's own glyphs are chunky and solid-feeling
const icon = (paths: string, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  package:
    '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/><path d="m7.5 4.27 9 5.15"/>',
  timer: '<path d="M10 2h4"/><path d="m12 14 3-3"/><circle cx="12" cy="14" r="8"/>',
  bike: '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  locate: '<path d="M3 11 22 2l-9 19-2-8z"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  receipt:
    '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  wallet:
    '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect x="2" y="6" width="20" height="14" rx="2"/>',
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  left: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  sliders:
    '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
  route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
};

// Type: big bold display headings, medium labels, regular body
const display = (size: string) =>
  `font-family: var(--m-font-family-display); font-size: var(--m-font-size-${size}); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)`;
const label = 'font-weight: var(--m-font-weight-medium)';
const small = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
const figure = 'font-weight: var(--m-font-weight-medium); font-variant-numeric: tabular-nums';
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)';
const pill = 'border-radius: var(--m-radius-full)';
// A chip: the grey fill as a pill; the chosen one is black
const chip = (text: string, on = false, lead = '') =>
  `<button type="button" class="m-button" data-size="sm"${on ? ' data-variant="primary"' : ''} style="${pill}; font-size: var(--m-font-size-sm)"${on ? ' aria-pressed="true"' : ' aria-pressed="false"'}>${lead}${text}</button>`;
// A square icon tile on the grey fill (vehicle and place images are never used)
const tile = (ic: string, size = '3.5rem', round = false) =>
  `<span class="m-cluster" data-justify="center" style="flex: none; inline-size: ${size}; block-size: ${size}; background: var(--m-color-bg-sunken); border-radius: ${round ? 'var(--m-radius-full)' : 'var(--m-radius-md)'}">${icon(ic, 20)}</span>`;

// The two ends of a trip: a black dot for pickup, a black square for drop-off, joined by a line
const endDot =
  '<span aria-hidden="true" style="flex: none; inline-size: 0.625rem; block-size: 0.625rem; border-radius: var(--m-radius-full); background: var(--m-color-fg-default); box-shadow: 0 0 0 3px var(--m-color-bg-sunken), 0 0 0 5px var(--m-color-fg-default)"></span>';
const endSquare =
  '<span aria-hidden="true" style="flex: none; inline-size: 0.75rem; block-size: 0.75rem; background: var(--m-color-fg-default); box-shadow: inset 0 0 0 3px var(--m-color-fg-default), inset 0 0 0 4.5px var(--m-color-bg-sunken)"></span>';

// The place field: the grey fill with the end marker inside, like the reference's trip inputs
const placeField = (id: string, labelText: string, value: string, marker: string, trailing = '') =>
  `<div class="m-field" style="gap: 0">
            <label class="m-sr-only" for="${id}">${labelText}</label>
            <div class="m-cluster" data-gap="0" style="position: relative; flex-wrap: nowrap">
              <span style="position: absolute; inset-inline-start: var(--m-space-4); display: inline-flex">${marker}</span>
              <input class="m-input" id="${id}" placeholder="${labelText}" value="${value}" style="flex: 1; padding-inline-start: var(--m-space-10)${trailing ? '; padding-inline-end: var(--m-space-10)' : ''}">
              ${trailing ? `<span style="position: absolute; inset-inline-end: var(--m-space-4); display: inline-flex">${trailing}</span>` : ''}
            </div>
          </div>`;

// The map: a token-drawn placeholder (grey ground, white streets, tinted park and water, the route
// in ink with its two end markers and an ETA tag). Never a real map or map tiles.
const map = (h: string, eta = '6 min') => `<svg viewBox="0 0 800 600" width="100%" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Map placeholder: the route from pickup to drop-off" style="display: block; block-size: ${h}; border-radius: var(--m-radius-lg); background: var(--m-color-bg-sunken)">
          <path d="M520 0h280v170L640 230 520 120z" style="fill: var(--m-color-info-bg)"/>
          <path d="M60 380l140-30 50 120-150 60z" style="fill: var(--m-color-success-bg)"/>
          <path d="M600 420h140v120H600z" style="fill: var(--m-color-success-bg)"/>
          <g style="stroke: var(--m-color-bg-canvas)" fill="none" stroke-linecap="round">
            <path d="M0 140 800 90M0 300h800M0 470 800 520M140 0l60 600M380 0v600M620 0l-40 600" stroke-width="14"/>
            <path d="M0 220h800M0 390 800 400M260 0l20 600M500 0l30 600M720 0 700 600M70 0l20 600" stroke-width="6"/>
          </g>
          <path d="M210 470 L270 470 L270 300 L380 300 L380 200 L590 186" fill="none" style="stroke: var(--m-color-fg-default)" stroke-width="6" stroke-linejoin="round"/>
          <circle cx="210" cy="470" r="11" style="fill: var(--m-color-fg-default)"/><circle cx="210" cy="470" r="4" style="fill: var(--m-color-bg-canvas)"/>
          <rect x="580" y="176" width="20" height="20" style="fill: var(--m-color-fg-default)"/><rect x="586" y="182" width="8" height="8" style="fill: var(--m-color-bg-canvas)"/>
          <rect x="230" y="396" width="92" height="40" rx="4" style="fill: var(--m-color-fg-default)"/>
          <text x="276" y="422" text-anchor="middle" style="fill: var(--m-color-bg-canvas); font: var(--m-font-weight-medium) 16px var(--m-font-family-sans)">${eta}</text>
        </svg>`;

// The app header: the brand, then tabs with a 4px bar under the current one, then account actions
const appHeader = (current: string) => {
  const tabs: [string, string][] = [
    ['car', 'Rides'],
    ['package', 'Parcels'],
    ['timer', 'By the hour'],
  ];
  return `<header class="m-cluster" data-justify="between" style="padding-inline: var(--m-layout-container-padding); border-block-end: 4px solid var(--m-color-border-muted)">
    <div class="m-cluster" data-gap="8" style="min-inline-size: 0">
      <span style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-tight)">Roundabout</span>
      <div class="m-tabs"><div class="m-tab-list" role="tablist" aria-label="Services" style="margin-block-end: -4px">
${tabs.map(([ic, l]) => `        <button type="button" class="m-tab" role="tab" aria-selected="${l === current}"${l === current ? '' : ' tabindex="-1"'} style="block-size: 3.75rem">${icon(I[ic as keyof typeof I], 16)} ${l}</button>`).join('\n')}
      </div></div>
    </div>
    <div class="m-cluster" data-gap="2">
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="${pill}; font-size: var(--m-font-size-sm)">${icon(I.receipt, 16)} Activity</button>
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Notifications" style="${pill}">${icon(I.bell, 16)}</button>
      <span class="m-avatar" data-size="sm" aria-label="Noor Haddad" style="font-size: var(--m-font-size-sm)">NH</span>
    </div>
  </header>`;
};

// An option row: the vehicle tile, the name with its seats, the timing, a tag, and the price.
// The chosen row takes a 2px black edge.
const option = (
  ic: string,
  name: string,
  seats: number,
  timing: string,
  price: string,
  opts: { on?: boolean; tag?: [string, string]; was?: string } = {},
) => `            <label class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding: calc(var(--m-space-3) - 2px) var(--m-space-4); border-radius: var(--m-radius-lg); cursor: pointer; border: 2px solid ${opts.on ? 'var(--m-color-accent-default)' : 'transparent'}">
              <input class="m-radio m-sr-only" type="radio" name="tr-ride"${opts.on ? ' checked' : ''}>
              ${tile(I[ic as keyof typeof I], '3rem')}
              <span class="m-stack" data-gap="0" style="flex: 1; min-inline-size: 0">
                <span class="m-cluster" data-gap="2"><span style="${label}">${name}</span><span class="m-cluster" data-gap="1" style="${small}">${icon(I.user, 16)}${seats}</span>${opts.tag ? `<span class="m-badge" data-tone="${opts.tag[0]}">${opts.tag[1]}</span>` : ''}</span>
                <span style="${small}">${timing}</span>
              </span>
              <span class="m-stack" data-gap="0" data-align="end" style="text-align: end">
                <span style="${figure}">${price}</span>
                ${opts.was ? `<span style="${small}; text-decoration: line-through">${opts.was}</span>` : ''}
              </span>
            </label>`;

const suggestion = (title: string, body: string, ic: string) => `          <section class="m-card" data-variant="sunken" aria-label="${title}">
            <div class="m-card-body m-cluster" data-justify="between" data-align="start" style="flex-wrap: nowrap">
              <div class="m-stack" data-gap="2">
                <h3 style="${display('xl')}">${title}</h3>
                <p style="font-size: var(--m-font-size-sm)">${body}</p>
                <div style="padding-block-start: var(--m-space-3)"><button type="button" class="m-button" data-size="sm" style="${pill}; background: var(--m-color-bg-surface); font-size: var(--m-font-size-sm)">Details</button></div>
              </div>
              <span style="color: var(--m-color-fg-default)">${icon(I[ic as keyof typeof I], 40)}</span>
            </div>
          </section>`;

const dashboard = `<div style="min-block-size: 100vh">
  ${appHeader('Rides')}
  <main class="m-stack" data-gap="12" style="padding: var(--m-space-6) var(--m-layout-container-padding) var(--m-space-16)">
    <div class="m-split" style="--m-layout-split-side: 25rem; --m-layout-split-gap: var(--m-space-6)">
      <!-- The booking panel: where from and to, when, who for, then the options -->
      <section class="m-card" aria-labelledby="tr-book" style="align-self: start">
        <div class="m-card-body m-stack" data-gap="3">
          <h1 id="tr-book" style="${display('xl')}">Book a ride</h1>
          <div class="m-stack" data-gap="2">
            ${placeField('tr-from', 'Pickup', 'Larch Street Library', endDot, icon(I.locate, 18))}
            ${placeField('tr-to', 'Drop-off', 'Harbourside Arena, Gate C', endSquare)}
          </div>
          <button type="button" class="m-button" style="justify-content: start; background: var(--m-color-bg-sunken)">${icon(I.clock, 16)} Leave now <span style="margin-inline-start: auto; display: inline-flex">${icon(I.down, 16)}</span></button>
          <div class="m-cluster" data-gap="2">${chip('Just me', false, `${icon(I.user, 16)} `)}${chip('Business', false, `${icon(I.briefcase, 16)} `)}</div>
          <h2 style="${display('xl')}; padding-block-start: var(--m-space-3)">Choose a ride</h2>
          <fieldset class="m-stack" data-gap="1" style="border: 0; padding: 0; margin: 0">
            <legend class="m-sr-only" style="font-weight: inherit">Ride options</legend>
${option('car', 'Standard', 4, '3 min away · 6:42 pm', '$18.40', { on: true, tag: ['info', 'Fastest'] })}
${option('users', 'Roomy', 6, '5 min away · 6:45 pm', '$27.15')}
${option('car', 'Quiet', 4, '7 min away · 6:47 pm', '$22.90', { tag: ['success', 'Low emission'] })}
${option('bike', 'Two wheels', 1, '2 min away · 6:50 pm', '$9.80', { was: '$11.20' })}
          </fieldset>
        </div>
        <div class="m-stack" data-gap="3" style="${hair}; padding: var(--m-space-4)">
          <button type="button" class="m-button" data-variant="ghost" style="justify-content: start; padding-inline: 0">${icon(I.card, 16)} Card ending 2207 <span style="margin-inline-start: auto; display: inline-flex">${icon(I.right, 16)}</span></button>
          <button type="button" class="m-button" data-variant="primary" style="inline-size: 100%">Book Standard</button>
        </div>
      </section>
      <div>${map('clamp(18rem, 60vw, 46rem)')}</div>
    </div>
    <!-- Suggestions: grey tiles with a white pill each -->
    <section class="m-stack" data-gap="6" aria-labelledby="tr-more">
      <h2 id="tr-more" style="${display('3xl')}">More from Roundabout</h2>
      <div class="m-grid" style="--m-layout-grid-min: 18rem">
${suggestion('Parcels', 'Send keys, forms or a forgotten charger across town within the hour.', 'package')}
${suggestion('Book ahead', 'Lock in a pickup up to 30 days out, with the driver waiting for you.', 'calendar')}
${suggestion('By the hour', 'Keep one car and driver for errands, a shoot or a long day of visits.', 'timer')}
      </div>
    </section>
  </main>
</div>`;

// Account pages: a side list where the current row has a grey fill and a 4px black bar
const accountNav = (current: string, items: [string, string, string?][]) => `<nav class="m-sidebar" aria-label="Account" style="padding-block: var(--m-space-6)">
    <ul class="m-sidebar-section">
${items.map(([ic, l, count]) => `      <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${icon(I[ic as keyof typeof I], 16)} ${l}${count ? ` <span class="m-sidebar-count">${count}</span>` : ''}</a></li>`).join('\n')}
    </ul>
  </nav>`;
const accountItems: [string, string, string?][] = [
  ['home', 'Overview'],
  ['receipt', 'Trips', '2'],
  ['wallet', 'Wallet'],
  ['bookmark', 'Saved places'],
  ['tag', 'Offers'],
  ['briefcase', 'Work profile'],
  ['user', 'Account'],
  ['help', 'Support'],
];

const trip = (
  place: string,
  when: string,
  price: string,
  opts: { on?: boolean; status?: [string, string]; ic?: string } = {},
) => `            <li><a href="#" class="m-cluster" data-gap="4" style="flex-wrap: nowrap; padding: calc(var(--m-space-3) - 2px) var(--m-space-3); color: inherit; text-decoration: none; border-radius: var(--m-radius-lg); border: 2px solid ${opts.on ? 'var(--m-color-accent-default)' : 'transparent'}"${opts.on ? ' aria-current="true"' : ''}>
              ${tile(I[(opts.ic ?? 'route') as keyof typeof I], '3rem')}
              <span class="m-stack" data-gap="0" style="flex: 1; min-inline-size: 0">
                <span class="m-cluster" data-gap="2"><span style="${label}">${place}</span>${opts.status ? `<span class="m-badge" data-tone="${opts.status[0]}">${opts.status[1]}</span>` : ''}</span>
                <span style="${small}">${when}</span>
              </span>
              <span style="${figure}">${price}</span>
            </a></li>`;

const fare = (k: string, v: string, strong = false) =>
  `<div class="m-cluster" data-justify="between" style="padding-block: var(--m-space-2)${strong ? `; padding-block-start: var(--m-space-3); ${label}` : ''}"><dt>${k}</dt><dd style="font-variant-numeric: tabular-nums">${v}</dd></div>`;

const listDetail = `<div style="min-block-size: 100vh">
  ${appHeader('Rides')}
  <div class="m-split" style="--m-layout-split-side: 15rem; --m-layout-split-gap: 0">
  ${accountNav('Trips', accountItems)}
  <main style="padding: var(--m-space-8) var(--m-layout-container-padding) var(--m-space-16)">
    <div class="m-stack" data-gap="6">
      <h1 style="${display('3xl')}">Trips</h1>
      <div class="m-cluster" data-justify="between">
        <div class="m-cluster" data-gap="2" role="group" aria-label="Show">${chip('Past', true)}${chip('Coming up')}${chip('Work')}${chip('Parcels')}</div>
        <button type="button" class="m-button" data-size="sm" style="${pill}; font-size: var(--m-font-size-sm)">${icon(I.sliders, 16)} October ${icon(I.down, 16)}</button>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 20rem; --m-layout-grid-gap: var(--m-space-8); align-items: start">
        <!-- The list: tappable rows, the open one edged in black -->
        <section aria-label="Past trips">
          <ul class="m-stack" data-gap="1" style="list-style: none; padding: 0">
${trip('Harbourside Arena, Gate C', 'Oct 28 · 6:31 pm · Standard', '$18.40', { on: true })}
${trip('Fenwick Rail Station', 'Oct 26 · 8:05 am · Quiet', '$22.90')}
${trip('14 Alder Court', 'Oct 24 · 1:12 pm · Parcel', '$7.60', { ic: 'package' })}
${trip('Mulberry Clinic', 'Oct 21 · 9:47 am · Roomy', '$0.00', { status: ['danger', 'Cancelled'] })}
${trip('Quayside Market', 'Oct 19 · 7:20 pm · Standard', '$12.75', { status: ['success', 'Refund sent'] })}
          </ul>
          <div class="m-cluster" data-justify="center" style="padding-block-start: var(--m-space-4)"><button type="button" class="m-button">Show more trips</button></div>
        </section>
        <!-- The detail: the route on the map, the driver, the timeline and the fare -->
        <section class="m-card" aria-labelledby="tr-trip">
          ${map('14rem', '18 min').replace('border-radius: var(--m-radius-lg)', 'border-radius: var(--m-radius-md)')}
          <div class="m-card-body m-stack" data-gap="5">
            <div class="m-stack" data-gap="1">
              <h2 id="tr-trip" style="${display('xl')}">Ride to Harbourside Arena</h2>
              <span style="${small}">Tuesday, October 28 · 6:31 pm</span>
            </div>
            <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap">
              <span class="m-avatar" style="font-size: var(--m-font-size-md)">TO</span>
              <span class="m-stack" data-gap="0" style="flex: 1"><span style="${label}">Tomas Okafor</span><span style="${small}">Grey hatchback · KLM 482</span></span>
              <span class="m-cluster" data-gap="1" style="${label}">${icon(I.star, 16)} 4.96</span>
            </div>
            <ol class="m-stack" data-gap="4" style="list-style: none; padding: 0; ${hair}; padding-block-start: var(--m-space-5)">
              <li class="m-cluster" data-gap="4" style="flex-wrap: nowrap">${endDot}<span class="m-stack" data-gap="0"><span style="${label}">Larch Street Library</span><span style="${small}">6:31 pm</span></span></li>
              <li class="m-cluster" data-gap="4" style="flex-wrap: nowrap">${endSquare}<span class="m-stack" data-gap="0"><span style="${label}">Harbourside Arena, Gate C</span><span style="${small}">6:49 pm · 5.8 mi</span></span></li>
            </ol>
            <dl class="m-stack" data-gap="0" style="${hair}; padding-block-start: var(--m-space-3)">
              ${fare('Trip fare', '$15.10')}
              ${fare('Booking fee', '$2.05')}
              ${fare('Tip', '$1.25')}
            </dl>
            <dl style="${hair}">${fare('Total', '$18.40', true)}</dl>
            <div class="m-cluster" data-gap="2">
              <button type="button" class="m-button">${icon(I.download, 16)} Receipt</button>
              <button type="button" class="m-button">${icon(I.route, 16)} Ride again</button>
              <button type="button" class="m-button" data-variant="ghost">${icon(I.help, 16)} Get help</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
  </div>
</div>`;

const vehicle = (ic: string, name: string, note: string, on = false) => `          <label class="m-cluster" data-gap="4" style="flex-wrap: nowrap; padding: calc(var(--m-space-3) - 2px) var(--m-space-4); border-radius: var(--m-radius-lg); cursor: pointer; border: 2px solid ${on ? 'var(--m-color-accent-default)' : 'var(--m-color-border-default)'}">
            ${tile(I[ic as keyof typeof I], '3rem')}
            <span class="m-stack" data-gap="0" style="flex: 1"><span style="${label}">${name}</span><span style="${small}">${note}</span></span>
            <input class="m-radio" type="radio" name="tr-vehicle"${on ? ' checked' : ''} aria-label="${name}">
          </label>`;

const onboarding = `<div style="min-block-size: 100vh">
  <header class="m-cluster" data-justify="between" style="padding: var(--m-space-4) var(--m-layout-container-padding); background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)">
    <span style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-medium)">Roundabout</span>
    <span style="font-size: var(--m-font-size-sm); ${label}">Courier sign-up</span>
  </header>
  <main class="m-container" data-size="sm" style="padding-block: var(--m-space-10) var(--m-space-16)">
    <form class="m-stack" data-gap="6" aria-labelledby="tr-onb">
      <div class="m-stack" data-gap="2">
        <span id="tr-onb-step" style="${small}">Step 2 of 4</span>
        <progress class="m-progress" value="2" max="4" aria-labelledby="tr-onb-step">2 of 4</progress>
      </div>
      <div class="m-stack" data-gap="2">
        <h1 id="tr-onb" style="${display('2xl')}">How will you make deliveries?</h1>
        <p class="m-muted">You can add another way later from your courier account.</p>
      </div>
      <fieldset class="m-stack" data-gap="3" style="border: 0; padding: 0; margin: 0">
        <legend class="m-sr-only" style="font-weight: inherit">Vehicle</legend>
${vehicle('car', 'Car', 'Larger orders and longer trips')}
${vehicle('bike', 'Bicycle or e-bike', 'Short trips in the centre', true)}
${vehicle('users', 'On foot', 'Walking routes under a mile')}
      </fieldset>
      <div class="m-field">
        <label class="m-field-label" for="tr-onb-city">City</label>
        <select class="m-select" id="tr-onb-city"><option>Port Ellery</option><option>Westbridge</option></select>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="tr-onb-code">Invite code (optional)</label>
        <input class="m-input" id="tr-onb-code" value="RB-41" aria-invalid="true" aria-describedby="tr-onb-code-e">
        <p class="m-field-error" id="tr-onb-code-e">That code is too short. Codes look like RB-4187.</p>
      </div>
      <div class="m-stack" data-gap="2">
        <button type="submit" class="m-button" data-variant="primary" style="inline-size: 100%">Continue</button>
        <button type="button" class="m-button" data-variant="ghost" style="inline-size: 100%">${icon(I.left, 16)} Back</button>
      </div>
      <p class="m-subtle" style="font-size: var(--m-font-size-xs)">By continuing you agree to be contacted about your application by phone, text or email.</p>
    </form>
  </main>
</div>`;

const setting = (name: string, value: string, opts: { control?: string; last?: boolean } = {}) => `          <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding-block: var(--m-space-3); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
            <div class="m-stack" data-gap="0"><dt style="${label}">${name}</dt><dd class="m-muted">${value}</dd></div>
            ${opts.control ?? icon(I.right, 16)}
          </div>`;
const toggle = (id: string, name: string, desc: string, on: boolean) => `          <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding-block: var(--m-space-3); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
            <label class="m-stack" data-gap="0" for="${id}"><span style="${label}">${name}</span><span class="m-muted">${desc}</span></label>
            <input class="m-switch" id="${id}" type="checkbox" role="switch"${on ? ' checked' : ''}>
          </div>`;

// A prompt banner: the pale brand tint, 12px corners, a bold line, one sentence, and its action in the
// brand blue (the one place a button is blue); a white button beside it when there is a second way
const brandButton = (text: string, href = '') =>
  href
    ? `<a class="m-button" href="${href}" style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">${text}</a>`
    : `<button type="button" class="m-button" style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">${text}</button>`;
const prompt = (title: string, body: string, actions: string) => `<section class="m-cluster" data-justify="between" data-gap="4" style="padding: var(--m-space-4); border-radius: var(--m-radius-lg); background: var(--m-color-brand-subtle)" aria-label="${title}">
        <div class="m-stack" data-gap="1" style="flex: 1 1 16rem"><span style="${display('xl')}">${title}</span><span>${body}</span></div>
        <div class="m-cluster" data-gap="2">${actions}</div>
      </section>`;

const settingsNav: [string, string][] = [
  ['user', 'Profile'],
  ['lock', 'Sign-in and security'],
  ['bell', 'Notifications'],
  ['card', 'Payment methods'],
  ['shield', 'Safety'],
  ['link', 'Connected apps'],
];

const settings = `<div style="min-block-size: 100vh">
  ${appHeader('Rides')}
  <div class="m-split" style="--m-layout-split-side: 15rem; --m-layout-split-gap: 0">
  ${accountNav('Profile', settingsNav)}
  <div>
  <main class="m-container" data-size="md" style="padding-block: var(--m-space-8) var(--m-space-16); margin-inline: 0">
    <div class="m-stack" data-gap="8">
      <h1 style="${display('3xl')}">Profile</h1>
      ${prompt('Add a recovery phone', 'Get back into your account if you lose access to your email.', brandButton('Add phone'))}
      <div class="m-cluster" data-gap="4">
        <span class="m-avatar" data-size="lg" style="inline-size: 5rem; block-size: 5rem; font-size: var(--m-font-size-2xl)">NH</span>
        <div class="m-stack" data-gap="1"><span style="${display('xl')}">Noor Haddad</span><button type="button" class="m-button" data-size="sm" style="${pill}; font-size: var(--m-font-size-sm); align-self: start">Change photo</button></div>
      </div>
      <section class="m-stack" data-gap="0" aria-labelledby="tr-basic">
        <h2 id="tr-basic" style="${display('xl')}; padding-block-end: var(--m-space-2)">Basic info</h2>
        <dl class="m-stack" data-gap="0">
${setting('Name', 'Noor Haddad')}
${setting('Phone number', '+1 555 0148 220 <span class="m-badge" data-tone="success">Verified</span>')}
${setting('Email', 'noor.haddad@example.com')}
${setting('Language', 'English (United States)')}
        </dl>
      </section>
      <section class="m-stack" data-gap="0" aria-labelledby="tr-notify">
        <h2 id="tr-notify" style="${display('xl')}; padding-block-end: var(--m-space-2)">Trip updates</h2>
${toggle('tr-s1', 'Driver arrival alerts', 'A push when your driver is two minutes away.', true)}
${toggle('tr-s2', 'Share trip status', 'Send your live route to saved contacts on late-night rides.', true)}
${toggle('tr-s3', 'Offers and news', 'Discounts on rides and parcels, at most once a week.', false)}
      </section>
      <section class="m-stack" data-gap="3" aria-labelledby="tr-del">
        <h2 id="tr-del" style="${display('xl')}">Delete account</h2>
        <p class="m-muted" style="max-inline-size: 36rem">Your trips, receipts and $12.40 of ride credit are removed for good. Work trips stay with your company.</p>
        <div><button type="button" class="m-button" data-variant="danger">Delete account</button></div>
      </section>
    </div>
  </main>
  </div>
  </div>
</div>`;

const emptyState = `<div style="min-block-size: 100vh">
  ${appHeader('By the hour')}
  <main class="m-container" style="padding-block: var(--m-space-8) var(--m-space-16)">
    <div class="m-stack" data-gap="10">
      <h1 style="${display('3xl')}">By the hour</h1>
      <section class="m-stack" data-gap="5" data-align="center" style="text-align: center; padding-block: var(--m-space-8)" aria-labelledby="tr-empty">
        <span class="m-cluster" data-justify="center" style="inline-size: 6rem; block-size: 6rem; border-radius: var(--m-radius-full); background: var(--m-color-bg-sunken)">${icon(I.calendar, 40)}</span>
        <h2 id="tr-empty" style="${display('xl')}">No hourly bookings yet</h2>
        <p class="m-muted" style="max-inline-size: 24rem">Keep one car and driver for as long as you need, from 2 to 10 hours. Your bookings show up here.</p>
        <div class="m-stack" data-gap="2" style="inline-size: 100%; max-inline-size: 20rem">
          <button type="button" class="m-button" data-variant="primary">Book by the hour</button>
          <button type="button" class="m-button">See how it works</button>
        </div>
      </section>
    </div>
  </main>
</div>`;

// The public header: a black bar, the brand, pill links and a white Join pill
const publicBar = (links: string[], current = '') => `<nav class="m-navbar" aria-label="Main">
    <span class="m-navbar-brand">Roundabout</span>
    <div class="m-navbar-nav">
${links.map((l) => `      <a class="m-navbar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${l}</a>`).join('\n')}
    </div>
    <div class="m-navbar-actions">
      <a class="m-navbar-link" href="#">${icon(I.user, 16)} Sign in</a>
      <a class="m-button" data-size="sm" href="#" style="${pill}; font-size: var(--m-font-size-sm); background: var(--m-color-bg-canvas); color: var(--m-color-fg-default)">Join</a>
    </div>
  </nav>`;

// A perk: a 16px tick, the perk in medium weight and one muted line under it
const perk = ([text, more]: [string, string]) =>
  `<li class="m-cluster" data-gap="3" style="flex-wrap: nowrap; align-items: start"><span style="display: inline-flex; padding-block-start: 4px">${icon(I.check, 16)}</span><span class="m-stack" data-gap="0"><span style="${label}">${text}</span><span style="${small}">${more}</span></span></li>`;
const plan = (name: string, price: string, per: string, note: string, perks: [string, string][], featured = false) => `      <section class="m-card"${featured ? ' style="border-color: var(--m-color-accent-default)"' : ''} aria-labelledby="tr-plan-${name.toLowerCase()}">
        <div class="m-card-body m-stack" data-gap="5">
          <div class="m-cluster" data-justify="between">
            <h2 id="tr-plan-${name.toLowerCase()}" style="${display('2xl')}">${name}</h2>
            ${featured ? '<span class="m-badge" data-variant="solid">Most picked</span>' : ''}
          </div>
          <div class="m-stack" data-gap="1">
            <span><span style="${display('3xl')}; font-variant-numeric: tabular-nums">${price}</span> <span class="m-muted">${per}</span></span>
            <span style="${small}">${note}</span>
          </div>
          <button type="button" class="m-button"${featured ? ' data-variant="primary"' : ''} style="inline-size: 100%">${featured ? 'Start free month' : `Choose ${name}`}</button>
          <ul class="m-stack" data-gap="3" style="list-style: none; padding: 0; ${hair}; padding-block-start: var(--m-space-5)">
${perks.map((p) => `            ${perk(p)}`).join('\n')}
          </ul>
        </div>
      </section>`;

const pricing = `<div>
  ${publicBar(['Get a ride', 'Send a parcel', 'Plans', 'For teams'], 'Plans')}
  <main>
    <div class="m-container" style="padding-block: var(--m-space-16) var(--m-space-12)">
      <div class="m-stack" data-gap="10">
        <div class="m-cluster" data-justify="between" data-align="end">
          <div class="m-stack" data-gap="4" style="max-inline-size: 36rem">
            <h1 style="${display('4xl')}; font-size: clamp(var(--m-font-size-3xl), 3.6vw, var(--m-font-size-4xl))">Ride more, pay less every month</h1>
            <p>One membership for rides and parcels. Cancel from your account at any time.</p>
          </div>
          <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Billing">
            <button type="button" class="m-tab" role="tab" aria-selected="true">Monthly</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Yearly · save 20%</button>
          </div></div>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 18rem; --m-layout-grid-gap: var(--m-space-6); align-items: start">
${plan('Basic', '$0', 'a month', 'Pay as you go, trip by trip.', [['Rides and parcels', 'Book either from one account'], ['3 saved places', 'Home, work and one more'], ['Receipts by email', 'Sent when each trip ends']])}
${plan('Member', '$7.99', 'a month', 'First month free, then billed monthly.', [['6% back', 'As ride credit on every trip'], ['No parcel booking fee', 'On parcels over $15'], ['10-minute price lock', 'Hold a quote while you decide'], ['Priority pickups', 'Matched first at busy times']], true)}
${plan('Household', '$13.99', 'a month', 'Up to 5 people on one bill.', [['Everything in Member', 'For up to five people'], ['Shared payment', 'With trip alerts for the payer'], ['Teen accounts', 'With limits you set']])}
        </div>
      </div>
    </div>
    <!-- A bold block: full-bleed black, white display heading and a white action -->
    <section style="background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse); padding-block: var(--m-space-16)" aria-labelledby="tr-teams">
      <div class="m-container m-cluster" data-justify="between" data-gap="8">
        <div class="m-stack" data-gap="3" style="max-inline-size: 34rem">
          <h2 id="tr-teams" style="${display('3xl')}">Moving a whole team?</h2>
          <p>Central billing, ride rules by time and place, and one monthly invoice for every trip.</p>
        </div>
        <a class="m-button" data-size="lg" href="#" style="background: var(--m-color-bg-canvas); color: var(--m-color-fg-default)">Talk to sales ${icon(I.arrow, 16)}</a>
      </div>
    </section>
    <section class="m-container" data-size="md" style="padding-block: var(--m-space-16)" aria-labelledby="tr-faq">
      <div class="m-stack" data-gap="6">
        <h2 id="tr-faq" style="${display('3xl')}">Questions</h2>
        <div class="m-accordion">
          <details class="m-accordion-item" name="tr-faq" open><summary>When does ride credit show up?</summary><div class="m-accordion-content">Within an hour of the trip ending. It applies to your next ride or parcel automatically.</div></details>
          <details class="m-accordion-item" name="tr-faq"><summary>Can I switch plans mid-month?</summary><div class="m-accordion-content">Yes. Moving up starts today and you pay the difference; moving down starts on your next billing date.</div></details>
          <details class="m-accordion-item" name="tr-faq"><summary>Does the price lock cover parcels?</summary><div class="m-accordion-content">It covers rides only. Parcel prices are fixed when you book, so there is nothing to lock.</div></details>
        </div>
      </div>
    </section>
  </main>
</div>`;

// Errors: grey fields turn red-edged with the reason underneath, a tinted banner sums up the form,
// a dark snackbar reports something that failed elsewhere, and full pages say what to do next
const errorPage = (code: string, ic: string, title: string, body: string, actions: string) => `  <section class="m-stack" data-gap="4" data-align="start" style="padding-block: var(--m-space-12); ${hair}" aria-labelledby="tr-err-${code}">
    <span class="m-cluster" data-justify="center" style="inline-size: 4rem; block-size: 4rem; border-radius: var(--m-radius-full); background: var(--m-color-bg-sunken)">${icon(ic, 24)}</span>
    <span style="${small}">Error ${code}</span>
    <h1 id="tr-err-${code}" style="${display('3xl')}">${title}</h1>
    <p style="max-inline-size: 32rem">${body}</p>
    <div class="m-cluster" data-gap="2">${actions}</div>
  </section>`;
// The other full-page errors, smaller: a grey tile each, side by side
const errorTile = (code: string, ic: string, title: string, body: string, action: string) => `        <section class="m-card" data-variant="sunken" aria-labelledby="tr-err-${code}">
          <div class="m-card-body m-stack" data-gap="3" data-align="start">
            <span class="m-cluster" data-gap="2" style="${small}">${icon(ic, 16)} Error ${code}</span>
            <h2 id="tr-err-${code}" style="${display('xl')}">${title}</h2>
            <p>${body}</p>
            <div style="padding-block-start: var(--m-space-2)">${action}</div>
          </div>
        </section>`;

const errors = `<div style="min-block-size: 100vh">
  ${appHeader('Parcels')}
  <main class="m-container" data-size="md" style="padding-block: var(--m-space-8) var(--m-space-16)">
    <div class="m-stack" data-gap="8">
      <section class="m-stack" data-gap="4" aria-labelledby="tr-err-form" style="max-inline-size: 30rem">
        <h1 id="tr-err-form" style="${display('3xl')}">Send a parcel</h1>
        <div class="m-alert" data-tone="danger" role="alert">
          <span class="m-alert-icon">${icon(I.alert, 20)}</span>
          <div class="m-alert-content"><div class="m-alert-title">Check 2 details</div><div class="m-alert-body">Nothing has been booked yet.</div></div>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="tr-err-to">Deliver to</label>
          <input class="m-input" id="tr-err-to" value="Harbourside Arena" aria-invalid="true" aria-describedby="tr-err-to-e">
          <p class="m-field-error" id="tr-err-to-e">Add a gate or a unit. The arena has 6 entrances.</p>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="tr-err-phone">Recipient’s phone</label>
          <input class="m-input" id="tr-err-phone" value="555 014" aria-invalid="true" aria-describedby="tr-err-phone-e" style="font-variant-numeric: tabular-nums">
          <p class="m-field-error" id="tr-err-phone-e">Enter the full number, so the courier can call on arrival.</p>
        </div>
        <button type="submit" class="m-button" data-variant="primary" style="inline-size: 100%">Review parcel</button>
      </section>
      <section aria-label="A snackbar">
        <div class="m-toast" role="alert" style="max-inline-size: 30rem">
          <div class="m-toast-content"><div class="m-toast-title">Payment didn’t go through</div><div class="m-toast-body">Card ending 2207 was declined for $18.40.</div></div>
          <button type="button" class="m-button" data-size="sm" style="${pill}; font-size: var(--m-font-size-sm)">Update card</button>
        </div>
      </section>
${errorPage('404', I.pin, 'This page took a wrong turn', 'The link may be out of date. Head back home and start again from there.', `<a class="m-button" data-variant="primary" href="#">Go home</a><a class="m-button" href="#">Get help</a>`)}
      <div class="m-grid" style="--m-layout-grid-min: 18rem; align-items: start">
${errorTile('500', I.alert, 'We hit a bump on our side', 'Your trip and payment are unchanged. Try again in a minute.', `<button type="button" class="m-button">${icon(I.arrow, 16)} Try again</button>`)}
${errorTile('403', I.lock, 'This trip belongs to another account', 'Sign in with the account that booked it, or ask its owner to share it with you.', `<a class="m-button" href="#">Switch account</a>`)}
      </div>
    </div>
  </main>
</div>`;


// A help row: a 20px icon, the title in medium weight, a chevron; a hairline under the words only
const helpRow = (ic: string, title: string) => `          <li><a href="#" class="m-cluster" data-gap="0" style="flex-wrap: nowrap; color: inherit; text-decoration: none; min-block-size: 4.5rem">
            <span style="flex: none; inline-size: 4rem; display: inline-flex; justify-content: center">${icon(ic, 20)}</span>
            <span class="m-cluster" data-justify="between" style="flex: 1; flex-wrap: nowrap; align-self: stretch; ${label}; border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default); padding-inline-end: var(--m-space-4)">${title}${icon(I.right, 16)}</span>
          </a></li>`;

const article = '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>';

const reading = `<div>
  ${publicBar([])}
  <!-- The help bar: its name, then the audiences, the current one a black pill -->
  <div class="m-cluster" data-gap="6" style="padding: var(--m-space-3) var(--m-layout-container-padding); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
    <span style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-xl); ${label}">Help</span>
    <div class="m-cluster" data-gap="2" style="padding-inline-start: var(--m-space-6); border-inline-start: var(--m-border-width-thin) solid var(--m-color-border-default)">
      <a class="m-button" data-variant="primary" data-size="sm" href="#" aria-current="page" style="${pill}; font-size: var(--m-font-size-sm)">Passengers</a>
      <a class="m-button" data-variant="ghost" data-size="sm" href="#" style="${pill}; font-size: var(--m-font-size-sm)">Couriers</a>
      <a class="m-button" data-variant="ghost" data-size="sm" href="#" style="${pill}; font-size: var(--m-font-size-sm)">Teams</a>
    </div>
  </div>
  <main class="m-container" style="padding-block: var(--m-space-4) var(--m-space-16)">
    <div class="m-cluster" data-justify="between">
      <nav class="m-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="#" style="color: var(--m-color-fg-default); text-decoration: underline">Home</a></li><li><a href="#" style="color: var(--m-color-fg-default); text-decoration: underline">Account</a></li><li><span aria-current="page">Payment</span></li></ol></nav>
      <button type="button" class="m-button" data-icon-only aria-label="Search help" style="${pill}">${icon(I.search, 16)}</button>
    </div>
    <div style="max-inline-size: 48rem; padding-block-start: var(--m-space-6)">${prompt('Sign in for help with a trip', 'See your recent trips and get an answer about each one.', `${brandButton('Sign in', '#')}<a class="m-button" href="#" style="background: var(--m-color-bg-canvas)">Join</a>`)}</div>
    <article class="m-stack" data-gap="6" style="max-inline-size: 48rem; padding-block-start: var(--m-space-10)" aria-labelledby="tr-read">
      <h1 id="tr-read" style="${display('3xl')}">Change how you pay for a trip</h1>
      <div class="m-stack" data-gap="4">
        <p>You can switch the card or wallet for a trip until the driver arrives. After that, the fare goes to the method you booked with.</p>
        <p><strong>Note:</strong> Work trips always go to your company’s card, so the switch only shows on personal trips.</p>
        <p><a href="#" style="color: var(--m-color-info-fg); text-decoration: underline; ${label}">I can’t add a new card</a></p>
      </div>
      <section class="m-stack" data-gap="3" aria-labelledby="tr-read-app">
        <h2 id="tr-read-app" style="${display('xl')}">From the app</h2>
        <ol class="m-stack" data-gap="1" style="padding-inline-start: var(--m-space-5)">
          <li>Open the trip and tap the payment row under the fare</li>
          <li>Pick another card, or add one</li>
          <li>Tap Done; the new method shows on the trip at once</li>
        </ol>
      </section>
      <section class="m-stack" data-gap="3" aria-labelledby="tr-read-web">
        <h2 id="tr-read-web" style="${display('xl')}">On the web</h2>
        <p>Sign in, open Trips and choose the trip. The payment row works the same way.</p>
      </section>
    </article>
    <section class="m-stack" data-gap="2" style="max-inline-size: 48rem; padding-block-start: var(--m-space-12)" aria-labelledby="tr-read-more">
      <h2 id="tr-read-more" style="${display('xl')}">More about payment</h2>
      <ul style="list-style: none; padding: 0">
${helpRow(article, 'Remove a card from your account')}
${helpRow(article, 'Why was I charged twice?')}
${helpRow(article, 'Pay with ride credit')}
${helpRow(article, 'Get a receipt for a work trip')}
      </ul>
    </section>
  </main>
</div>`;

// Sign in: one narrow column under the black bar; one field, the black Continue, then the other ways in on the grey fill
const otherWay = (ic: string, text: string) =>
  `<button type="button" class="m-button" style="inline-size: 100%">${ic} ${text}</button>`;
const signIn = `<div style="min-block-size: 100vh">
  <header class="m-cluster" style="padding: var(--m-space-4) var(--m-layout-container-padding); background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)">
    <span style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); ${label}">Roundabout</span>
  </header>
  <main class="m-container" data-size="sm" style="max-inline-size: 26rem; padding-block: var(--m-space-12) var(--m-space-16)">
    <form class="m-stack" data-gap="4" aria-labelledby="tr-in">
      <h1 id="tr-in" style="${display('xl')}">Sign in with your phone or email</h1>
      <div class="m-field">
        <label class="m-sr-only" for="tr-in-id">Phone number or email</label>
        <input class="m-input" id="tr-in-id" autocomplete="username" placeholder="Phone number or email address">
      </div>
      <button type="submit" class="m-button" data-variant="primary" style="inline-size: 100%">Continue</button>
      <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap; ${small}" role="separator" aria-label="or">
        <span aria-hidden="true" style="flex: 1; ${hair}"></span>or<span aria-hidden="true" style="flex: 1; ${hair}"></span>
      </div>
      ${otherWay(icon('<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>', 16), 'Continue with a passkey')}
      ${otherWay(icon(I.briefcase, 16), 'Continue with work sign-in')}
      ${otherWay(icon('<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>', 16), 'Use a one-time code')}
      <p style="${small}">By continuing, you agree to calls, texts or messages from Roundabout and its partners at the number or address you give, to confirm it’s you.</p>
    </form>
  </main>
</div>`;

export const transitRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'The booking home: a bordered panel with the two trip ends, when and who for, ride options as rows with the chosen one edged in black, a black Book button, the map beside it, and grey suggestion tiles below.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'Account nav with a 4px bar on the current row; pill filters over 72px trip rows with icon tiles; the open trip as a card with its map, driver, timeline and fare.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'A black header, one narrow column, a thin blue progress bar, a bold question, choices as edged rows, grey fields and a full-width black Continue.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'Account nav beside a big bold title, a pale-blue prompt banner with its blue action, label-and-value rows that open with a chevron, switches that act at once, and deletion last.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'The page title stays; under it a large icon in a grey circle, a bold heading, one sentence, a black action and a grey one.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The black public header with pill links, a 52px headline (36px on a phone) beside a segmented switch, three edged plan cards with two-line perks (the picked one in black), a full-bleed black block and an FAQ with 72px rows.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Red-edged fields with the reason below, a tinted banner that says nothing was booked, a dark snackbar with one action, a left-aligned bold 404, and 500 and no access as grey tiles.',
    html: errors,
  },
  {
    name: 'reading',
    title: 'Reading',
    description:
      'A public help article: the black bar, the help bar with the current audience as a black pill, an underlined breadcrumb, a 36px title, 16px text with one blue link, numbered steps and rows of related articles.',
    html: reading,
  },
  {
    name: 'sign-in',
    title: 'Sign in',
    description:
      'The black bar with the brand alone, one 26rem column: a bold title, one grey field, a full-width black Continue, an "or" rule and other ways in as grey buttons, then the small print.',
    html: signIn,
  },
];
