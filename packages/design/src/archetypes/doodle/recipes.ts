import type { ArchetypeRecipe } from '../types';

/*
 * Doodle's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from a made-up whiteboard app ("Pinwheel") used by a made-up
 * bike maker ("Copperleaf Bikes"). The reference is a canvas editor, so its screens are translated:
 * the dashboard is a board of stickies (dotted canvas, sections, cursors with name tags, stamps, a
 * vote panel and the chunky floating toolbar), and the list is the file browser (a 240px white
 * sidebar with full-width rows, pill tabs, thumbnail cards, and a properties-style detail panel).
 * Pricing follows the public site. People, boards, navigation, plans, prices and words are invented.
 */

// Lucide icons, outlined; a 1.5px stroke at 16px reads as the reference's 1px line
const icon = (paths: string, size = 16, style = '', stroke = 1.5) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${style ? ` style="${style}"` : ''}>${paths}</svg>`;
const I = {
  pointer:
    '<path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"/>',
  hand: '<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
  sticky: '<path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/>',
  type: '<path d="M12 4v16"/><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2"/><path d="M9 20h6"/>',
  table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
  stamp:
    '<path d="M5 22h14"/><path d="M19.27 13.73A2.5 2.5 0 0 0 17.5 13h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1.5c0-.66-.26-1.3-.73-1.77Z"/><path d="M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-3-3c-1.69 0-3 1-3 3s1 2 1 3.5V13"/>',
  comment: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  pencil:
    '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  frame:
    '<line x1="22" x2="2" y1="6" y2="6"/><line x1="22" x2="2" y1="18" y2="18"/><line x1="6" x2="6" y1="2" y2="22"/><line x1="18" x2="18" y1="2" y2="22"/>',
  shapes:
    '<path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z"/><rect x="3" y="14" width="7" height="7" rx="1"/><circle cx="17.5" cy="17.5" r="3.5"/>',
  sparkles:
    '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
  timer:
    '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
  thumbs:
    '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
  heart:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  map: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
  presentation: '<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>',
  vote: '<path d="m9 12 2 2 4-4"/><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"/><path d="M22 19H2"/>',
  retro: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  calendar:
    '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  hash: '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
  wind: '<path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  minus: '<path d="M5 12h14"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  up: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  filter: '<path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/>',
  external: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  copy: '<rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  warn: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  trash:
    '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
  plug: '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
  key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
  server:
    '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/>',
};
type IconName = keyof typeof I;

// ---------------------------------------------------------------- shared pieces

const xs = 'font-size: var(--m-font-size-xs)';
const sm = 'font-size: var(--m-font-size-sm)';
const strong = 'font-weight: var(--m-font-weight-semibold)';
const hair = (side = 'block-end') => `border-${side}: var(--m-border-width-thin) solid var(--m-color-border-default)`;
const num = 'font-variant-numeric: tabular-nums';
// The dotted board
const board =
  'background-color: var(--m-color-bg-sunken); background-image: radial-gradient(circle, var(--m-color-border-strong) 0.6px, transparent 0.9px); background-size: 20px 20px';
// A floating panel: white, 13px corners, the soft elevation
const floating = 'background: var(--m-color-bg-surface); border-radius: var(--m-radius-lg); box-shadow: var(--m-shadow-md)';

// The multiplayer colours, as token pairs (fill and the text that sits on it)
const people = {
  violet: ['var(--m-color-brand-default)', 'var(--m-color-brand-fg)'],
  blue: ['var(--m-color-info-solid)', 'var(--m-color-info-on-solid)'],
  green: ['var(--m-color-success-solid)', 'var(--m-color-success-on-solid)'],
  red: ['var(--m-color-danger-solid)', 'var(--m-color-danger-on-solid)'],
  yellow: ['var(--m-color-warning-solid)', 'var(--m-color-warning-on-solid)'],
} as const;
type Hue = keyof typeof people;

// The sticky-note colours: the tone borders and the brand's pale violet carry them
const tint = {
  yellow: 'var(--m-color-warning-border)',
  green: 'var(--m-color-success-border)',
  pink: 'var(--m-color-danger-border)',
  blue: 'var(--m-color-info-border)',
  violet: 'var(--m-color-brand-subtle)',
} as const;
type Tint = keyof typeof tint;

// A cursor with its name tag
const cursor = (name: string, hue: Hue, style: string) =>
  `<span aria-hidden="true" style="position: absolute; ${style}; display: flex; flex-direction: column; align-items: flex-start; pointer-events: none; z-index: 2">
          <svg width="18" height="18" viewBox="0 0 24 24" style="color: ${people[hue][0]}; filter: drop-shadow(0 1px 1px var(--m-color-bg-overlay))"><path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" fill="currentColor" stroke="var(--m-color-bg-surface)" stroke-width="1.5"/></svg>
          <span style="margin-inline-start: var(--m-space-3); padding: 2px var(--m-space-1); border-radius: var(--m-radius-sm); background: ${people[hue][0]}; color: ${people[hue][1]}; ${xs}; ${strong}; white-space: nowrap">${name}</span>
        </span>`;

// A sticky: a square of colour with a soft lift, the words, the author underneath
const sticky = (words: string, author: string, t: Tint, extra = '') =>
  `<div style="background: ${tint[t]}; box-shadow: var(--m-shadow-sm); padding: var(--m-space-3); min-block-size: 120px; display: flex; flex-direction: column; justify-content: space-between; gap: var(--m-space-2); position: relative${extra ? `; ${extra}` : ''}">
              <p style="margin: 0; font-size: var(--m-font-size-lg); line-height: var(--m-font-leading-tight)">${words}</p>
              <span style="font-size: 10px">${author}</span>
            </div>`;

// A stamp: a coloured disc with a white glyph
const stamp = (ic: IconName, hue: Hue, style = '') =>
  `<span aria-hidden="true" style="position: absolute; ${style}; display: grid; place-items: center; inline-size: 28px; block-size: 28px; border-radius: var(--m-radius-full); background: ${people[hue][0]}; color: ${people[hue][1]}; box-shadow: 0 0 0 2px var(--m-color-bg-surface), var(--m-shadow-sm); z-index: 1">${icon(I[ic], 14, '', 2)}</span>`;

// The app's mark: a violet tile with a plain glyph, then the name
const mark = (name = 'Pinwheel') =>
  `<span class="m-cluster" data-gap="2" style="${strong}"><span style="display: grid; place-items: center; inline-size: 24px; block-size: 24px; border-radius: var(--m-radius-md); background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">${icon(I.wind, 14, '', 2)}</span>${name}</span>`;

const avatar = (initial: string, hue: Hue, size = 'md') =>
  `<span class="m-avatar" data-size="${size}" style="background: ${people[hue][0]}; color: ${people[hue][1]}">${initial}</span>`;

// ---------------------------------------------------------------- the file browser shell

const navLink = (ic: IconName, label: string, current: string, extra = '') =>
  `          <li><a class="m-sidebar-link" href="#"${label === current ? ' aria-current="page"' : ''}>${icon(I[ic], 16)} ${label}${extra}</a></li>`;
const roomLink = (label: string, hue: Hue, current: string) =>
  `          <li><a class="m-sidebar-link" href="#"${label === current ? ' aria-current="page"' : ''}><span style="display: grid; place-items: center; inline-size: 16px; block-size: 16px; border-radius: var(--m-radius-sm); background: ${people[hue][0]}; color: ${people[hue][1]}">${icon(I.hash, 10, '', 2.5)}</span> ${label}</a></li>`;

const sidebar = (current: string) => `<nav class="m-sidebar" aria-label="Main" style="min-block-size: 100vh">
    <div class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-2) var(--m-space-2) var(--m-space-4)">
      <span class="m-cluster" data-gap="2" style="${strong}">${avatar('C', 'green', 'md')} Copperleaf Bikes ${icon(I.down, 12)}</span>
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Notifications">${icon(I.bell, 16)}</button>
    </div>
    <div style="padding: 0 var(--m-space-2) var(--m-space-2)">
      <label class="m-cluster" data-gap="2" style="background: var(--m-color-bg-sunken); border-radius: var(--m-radius-md); padding: var(--m-space-2) var(--m-space-3); color: var(--m-color-fg-subtle); flex-wrap: nowrap">${icon(I.search, 14)}<input aria-label="Find boards, people and rooms" placeholder="Find boards, people, rooms" style="border: 0; background: transparent; font: inherit; color: var(--m-color-fg-default); inline-size: 100%; outline-offset: 2px"></label>
    </div>
    <div class="m-sidebar-section">
      <ul>
${navLink('calendar', 'Sessions', current, ' <span class="m-sidebar-count" style="margin-inline-start: auto">3</span>')}
${navLink('presentation', 'Workshops', current)}
${navLink('retro', 'Retros', current)}
${navLink('map', 'Roadmaps', current)}
${navLink('vote', 'Polls', current)}
${navLink('users', 'People', current)}
      </ul>
    </div>
    <div class="m-sidebar-section" style="${hair('block-start')}; padding-block-start: var(--m-space-4)">
      <h2 class="m-sidebar-heading" style="margin-block-end: var(--m-space-1)">Rooms</h2>
      <ul>
${roomLink('Frame shop', 'yellow', current)}
${roomLink('Ride team', 'blue', current)}
${roomLink('Spring range', 'violet', current)}
${roomLink('Repair café', 'red', current)}
      </ul>
    </div>
    <div class="m-sidebar-section" style="margin-block-start: auto; ${hair('block-start')}; padding-block: var(--m-space-2)">
      <ul>
${navLink('help', 'Guides and shortcuts', current)}
      </ul>
    </div>
  </nav>`;

// The main area's top bar: 48px, a hairline, the title on the left and actions on the right
const topBar = (title: string, actions: string) => `<header class="m-cluster" data-justify="between" style="block-size: 48px; padding-inline: var(--m-space-8); ${hair()}">
      <h1 style="margin: 0; font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-regular)">${title}</h1>
      <div class="m-cluster" data-gap="2">${actions}</div>
    </header>`;

const shell = (current: string, main: string) => `<div class="m-split" style="min-block-size: 100vh">
  ${sidebar(current)}
  <div class="m-stack" data-gap="0" style="min-inline-size: 0">
${main}
  </div>
</div>`;

// Pill tabs (the reference's tab style), with the toolbar on the right
const pillTabs = (label: string, tabs: string[], current: string) => `<div class="m-tabs" data-variant="pill">
          <div class="m-tab-list" role="tablist" aria-label="${label}">
${tabs.map((t) => `            <button type="button" class="m-tab" role="tab" aria-selected="${t === current}"${t === current ? '' : ' tabindex="-1"'} style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-regular); block-size: 32px; padding-inline: var(--m-space-3)">${t}</button>`).join('\n')}
          </div>
        </div>`;

// A board thumbnail drawn from token shapes: a dotted ground with little stickies
const thumb = (tints: Tint[], extra = '') =>
  `<div aria-hidden="true" style="${board}; background-size: 10px 10px; aspect-ratio: 16 / 10; position: relative; overflow: hidden; border-radius: var(--m-radius-md) var(--m-radius-md) 0 0; ${hair()}${extra ? `; ${extra}` : ''}">
              <div style="position: absolute; inset: 18% 14%; display: grid; grid-template-columns: repeat(${Math.min(tints.length, 4)}, 1fr); gap: 6%; align-content: center">
${tints.map((t, i) => `                <span style="aspect-ratio: 1; background: ${tint[t]}; box-shadow: var(--m-shadow-sm); transform: rotate(${[-3, 2, -1, 3, -2, 1][i % 6]}deg)"></span>`).join('\n')}
              </div>
            </div>`;

// A file card: thumbnail, then a board tile, the name and when it changed
const fileCard = (name: string, edited: string, tints: Tint[], selected = false) =>
  `<a href="#" class="m-card" style="padding: 0; text-decoration: none; color: inherit; overflow: hidden${selected ? '; border-color: var(--m-color-border-focus); box-shadow: 0 0 0 1px var(--m-color-border-focus)' : ''}"${selected ? ' aria-current="true"' : ''}>
            ${thumb(tints)}
            <div class="m-cluster" data-gap="3" style="padding: var(--m-space-3) var(--m-space-4); flex-wrap: nowrap">
              <span style="display: grid; place-items: center; flex: none; inline-size: 20px; block-size: 20px; border-radius: var(--m-radius-md); background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">${icon(I.sticky, 12, '', 2)}</span>
              <span class="m-stack" data-gap="0" style="min-inline-size: 0; font-size: var(--m-font-size-md)"><span style="${strong}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">${name}</span><span style="color: var(--m-color-fg-subtle)">${edited}</span></span>
            </div>
          </a>`;

// ---------------------------------------------------------------- dashboard (a board)

const section = (label: string, hue: Hue, body: string, style = '') =>
  `<section style="position: relative; background: var(--m-color-bg-surface); border: var(--m-border-width-thin) solid var(--m-color-border-default); border-radius: var(--m-radius-md); padding: var(--m-space-10) var(--m-space-4) var(--m-space-4)${style ? `; ${style}` : ''}" aria-label="${label}">
          <span style="position: absolute; inset-block-start: var(--m-space-3); inset-inline-start: var(--m-space-3); padding: 2px var(--m-space-2); border-radius: var(--m-radius-md); background: ${people[hue][0]}; color: ${people[hue][1]}; ${xs}; ${strong}">${label}</span>
          <div class="m-grid" style="--m-layout-grid-min: 136px; --m-layout-grid-gap: var(--m-space-3)">
${body}
          </div>
        </section>`;

const tool = (ic: IconName, label: string, current = false) =>
  `<button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="${label}"${current ? ' aria-pressed="true"' : ''} style="inline-size: 40px; block-size: 40px${current ? '; background: var(--m-color-brand-default); color: var(--m-color-brand-fg)' : ''}">${icon(I[ic], 20)}</button>`;
const sep = '<span aria-hidden="true" style="align-self: stretch; inline-size: var(--m-border-width-thin); background: var(--m-color-border-default); margin-inline: var(--m-space-1)"></span>';

const votes: [string, number, Hue][] = [
  ['Clip-on mudguards', 14, 'violet'],
  ['Repair café every month', 11, 'blue'],
  ['Shorter test-ride form', 9, 'green'],
  ['Kids’ sizing chart', 6, 'yellow'],
  ['Night-ride lights bundle', 4, 'red'],
];

const dashboard = `<div style="${board}; min-block-size: 100vh; position: relative; padding: var(--m-space-3)">
  <header class="m-cluster" data-justify="between" style="position: relative; z-index: 3; align-items: flex-start; gap: var(--m-space-3)">
    <div class="m-cluster" data-gap="1" style="${floating}; padding: var(--m-space-1); flex-wrap: nowrap">
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" aria-label="Main menu" style="padding-inline: var(--m-space-1)">${icon(I.wind, 16)} ${icon(I.down, 10)}</button>
      <span class="m-stack" data-gap="0" style="padding-inline: var(--m-space-2)"><strong style="${strong}">Spring range retro</strong><span style="${xs}; color: var(--m-color-fg-subtle)">Spring range</span></span>
      ${sep}
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" aria-label="Pages">${icon(I.copy, 16)}</button>
    </div>
    <div class="m-cluster" data-gap="2" style="${floating}; padding: var(--m-space-1) var(--m-space-1) var(--m-space-1) var(--m-space-2)">
      <span class="m-avatar-group">${avatar('O', 'violet', 'sm')}${avatar('M', 'blue', 'sm')}${avatar('P', 'green', 'sm')}${avatar('T', 'red', 'sm')}</span>
      <span style="${xs}; color: var(--m-color-fg-subtle)">+5</span>
      ${sep}
      <span class="m-cluster" data-gap="1" style="background: var(--m-color-brand-subtle); color: var(--m-color-fg-default); border-radius: var(--m-radius-md); padding: var(--m-space-1) var(--m-space-2); font-family: var(--m-font-family-mono); ${xs}; ${num}">${icon(I.timer, 14)} 06:40</span>
      <button type="button" class="m-button" data-variant="primary" data-size="sm" style="--m-button-primary-bg: var(--m-color-brand-default); --m-button-primary-hover-bg: var(--m-color-brand-default); --m-button-primary-active-bg: var(--m-color-brand-default); --m-button-primary-fg: var(--m-color-brand-fg)">Share</button>
    </div>
  </header>

  <main style="position: relative; padding: var(--m-space-8) var(--m-space-6) 112px; max-inline-size: 1248px; margin-inline: auto">
    <div class="m-cluster" data-justify="between" style="align-items: flex-end; margin-block-end: var(--m-space-6)">
      <div class="m-stack" data-gap="1">
        <p style="margin: 0; ${xs}; color: var(--m-color-fg-subtle)">Wednesday session · 9 people · 41 stickies</p>
        <h1 style="margin: 0; font-family: var(--m-font-family-display); font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-regular); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)">What should the spring range keep?</h1>
      </div>
      <div class="m-cluster" data-gap="2">
        <span class="m-badge" data-tone="success">${icon(I.checkCircle, 12)} Voting open</span>
        <span class="m-badge">3 votes each</span>
      </div>
    </div>

    <div class="m-split" style="--m-layout-split-side: 272px; --m-layout-split-gap: var(--m-space-6); flex-direction: row-reverse; align-items: flex-start">
      <aside class="m-stack" data-gap="3" style="${floating}; padding: var(--m-space-4)" aria-label="Vote count">
        <div class="m-cluster" data-justify="between"><strong style="${strong}">Top ideas</strong><span style="${xs}; color: var(--m-color-fg-subtle)">44 votes in</span></div>
        <ol class="m-stack" data-gap="3" style="list-style: none; margin: 0; padding: 0">
${votes
  .map(
    ([label, n, hue]) => `          <li class="m-stack" data-gap="1">
            <span class="m-cluster" data-justify="between" style="${xs}"><span>${label}</span><span style="${num}; color: var(--m-color-fg-muted)">${n}</span></span>
            <span aria-hidden="true" style="display: block; block-size: 8px; border-radius: var(--m-radius-full); background: var(--m-color-bg-sunken)"><span style="display: block; block-size: 100%; inline-size: ${Math.round((n / 14) * 100)}%; border-radius: inherit; background: ${people[hue][0]}"></span></span>
          </li>`,
  )
  .join('\n')}
        </ol>
        <div style="${hair('block-start')}; padding-block-start: var(--m-space-3)" class="m-stack" data-gap="2">
          <div class="m-cluster" data-justify="between" style="${xs}"><span style="color: var(--m-color-fg-subtle)">Your votes</span><span class="m-cluster" data-gap="1">${[0, 1, 2].map((i) => `<span aria-hidden="true" style="inline-size: 10px; block-size: 10px; border-radius: var(--m-radius-full); background: ${i < 2 ? 'var(--m-color-brand-default)' : 'var(--m-color-border-default)'}"></span>`).join('')} 1 left</span></div>
          <button type="button" class="m-button" data-size="sm">${icon(I.sparkles, 14)} Sum up the board</button>
        </div>
      </aside>

      <div class="m-stack" data-gap="6" style="position: relative">
${section(
  'Keep doing',
  'green',
  `            ${sticky('Test rides on Saturday mornings', 'Odile', 'green')}
            ${sticky('Printed fit cards in every box', 'Marek', 'green', 'transform: rotate(1deg)')}
            ${sticky('Mechanics answering the chat', 'Priya', 'yellow')}
            ${sticky('Same-week spare parts', 'Ines', 'green', 'transform: rotate(-1deg)')}`,
)}
${section(
  'Change',
  'red',
  `            ${sticky('Sizing chart is buried three clicks deep', 'Tomasz', 'pink')}
            ${sticky('Too many colours of the same frame', 'Kwame', 'pink', 'transform: rotate(-1deg)')}
            ${sticky('Pick-up slots fill by Tuesday', 'Odile', 'yellow')}`,
)}
${section(
  'Try next',
  'violet',
  `            ${sticky('Clip-on mudguards as a launch extra', 'Priya', 'violet')}
            ${sticky('A repair café every month', 'Marek', 'blue', 'transform: rotate(1deg)')}
            ${sticky('Shorter test-ride form', 'Ines', 'violet')}
            ${sticky('Night-ride lights bundle', 'Kwame', 'blue', 'transform: rotate(-1deg)')}`,
)}
        ${stamp('thumbs', 'blue', 'inset-block-start: 88px; inset-inline-start: 120px')}
        ${stamp('heart', 'red', 'inset-block-start: 80px; inset-inline-start: 148px')}
        ${stamp('star', 'yellow', 'inset-block-start: 304px; inset-inline-start: 256px')}
        ${stamp('thumbs', 'violet', 'inset-block-end: 28px; inset-inline-start: 200px')}
        ${cursor('Marek', 'blue', 'inset-block-start: 144px; inset-inline-start: 42%')}
        ${cursor('Priya', 'green', 'inset-block-start: 352px; inset-inline-start: 22%')}
        ${cursor('Kwame', 'red', 'inset-block-end: 48px; inset-inline-end: 12%')}
      </div>
    </div>
  </main>

  <nav aria-label="Tools" style="position: sticky; inset-block-end: var(--m-space-4); z-index: 3; display: flex; justify-content: center; pointer-events: none">
    <div class="m-cluster" data-gap="1" style="${floating}; box-shadow: var(--m-shadow-lg); padding: var(--m-space-2); flex-wrap: nowrap; pointer-events: auto; overflow-x: auto; max-inline-size: 100%">
      ${tool('pointer', 'Select', true)}
      ${tool('hand', 'Move around')}
      ${sep}
      ${tool('pencil', 'Draw')}
      <button type="button" class="m-button" data-variant="ghost" aria-label="Sticky note" style="inline-size: 52px; block-size: 40px; position: relative; padding: 0">
        <span aria-hidden="true" style="position: absolute; inset: 8px 12px 4px 14px; background: var(--m-color-warning-solid); transform: rotate(-8deg)"></span>
        <span aria-hidden="true" style="position: absolute; inset: 6px 10px 4px 16px; background: var(--m-color-warning-border); box-shadow: var(--m-shadow-sm)"></span>
      </button>
      <button type="button" class="m-button" data-variant="ghost" aria-label="Shapes" style="inline-size: 40px; block-size: 40px; position: relative; padding: 0">
        <span aria-hidden="true" style="position: absolute; inset-block-start: 8px; inset-inline-start: 8px; inline-size: 14px; block-size: 14px; border-radius: var(--m-radius-sm); background: var(--m-color-brand-subtle); border: var(--m-border-width-thin) solid var(--m-color-brand-default)"></span>
        <span aria-hidden="true" style="position: absolute; inset-block-end: 6px; inset-inline-end: 6px; inline-size: 14px; block-size: 14px; border-radius: var(--m-radius-full); background: var(--m-color-brand-subtle); border: var(--m-border-width-thin) solid var(--m-color-brand-default)"></span>
      </button>
      ${sep}
      ${tool('type', 'Text')}
      ${tool('frame', 'Section')}
      ${tool('table', 'Table')}
      ${tool('stamp', 'Stamp')}
      ${tool('comment', 'Comment')}
      ${tool('sparkles', 'Ideas')}
      <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="More tools" style="inline-size: 40px; block-size: 40px; border-radius: var(--m-radius-full); background: var(--m-color-bg-sunken)">${icon(I.plus, 18)}</button>
    </div>
  </nav>
  <div class="m-cluster" data-gap="2" style="position: fixed; inset-block-end: var(--m-space-4); inset-inline-end: var(--m-space-4); z-index: 3">
    <div class="m-cluster" data-gap="0" style="${floating}; padding: var(--m-space-1)">
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Zoom out">${icon(I.minus, 14)}</button>
      <span style="${xs}; ${num}; padding-inline: var(--m-space-1)">84%</span>
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Zoom in">${icon(I.plus, 14)}</button>
    </div>
    <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Help" style="${floating}; border-radius: var(--m-radius-full)">${icon(I.help, 16)}</button>
  </div>
</div>`;

// ---------------------------------------------------------------- list and detail (the file browser)

const prop = (label: string, value: string) =>
  `<div class="m-cluster" data-justify="between" style="${xs}; min-block-size: 24px"><span style="color: var(--m-color-fg-subtle)">${label}</span><span style="${num}">${value}</span></div>`;
const panelSection = (title: string, body: string, action = '') =>
  `<section class="m-stack" data-gap="2" style="padding: var(--m-space-3) var(--m-space-4) var(--m-space-4); ${hair()}">
          <div class="m-cluster" data-justify="between" style="min-block-size: 24px"><h3 style="margin: 0; ${xs}; ${strong}">${title}</h3>${action}</div>
${body}
        </section>`;

const listDetail = shell(
  'Workshops',
  `    ${topBar(
    'Workshops',
    `<button type="button" class="m-button" data-variant="ghost" data-size="sm">${icon(I.upload, 14)} Import</button>
        <button type="button" class="m-button" data-variant="primary" data-size="sm">${icon(I.plus, 14)} New board</button>`,
  )}
    <div class="m-split" style="--m-layout-split-side: 272px; flex-direction: row-reverse; align-items: stretch; flex: 1">
      <aside class="m-stack" data-gap="0" style="${hair('inline-start')}; background: var(--m-color-bg-surface)" aria-label="Board details">
        <div class="m-stack" data-gap="2" style="padding: var(--m-space-3) var(--m-space-4); ${hair()}">
          <div class="m-cluster" data-justify="between"><strong style="${strong}">Saddle fit interviews</strong><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="More">${icon(I.more, 14)}</button></div>
          <div class="m-tabs" data-variant="pill">
            <div class="m-tab-list" role="tablist" aria-label="Panel">
              <button type="button" class="m-tab" role="tab" aria-selected="true">Details</button>
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Activity</button>
            </div>
          </div>
        </div>
        <div style="padding: var(--m-space-3) var(--m-space-4); ${hair()}">${thumb(['yellow', 'violet', 'green', 'blue', 'pink', 'yellow'], 'border-radius: var(--m-radius-md); border: var(--m-border-width-thin) solid var(--m-color-border-default)')}</div>
${panelSection(
  'Board',
  `          ${prop('Room', '<span class="m-cluster" data-gap="1"><span aria-hidden="true" style="inline-size: 8px; block-size: 8px; border-radius: var(--m-radius-sm); background: var(--m-color-info-solid)"></span>Ride team</span>')}
          ${prop('Facilitator', 'Ines Varga')}
          ${prop('Last session', '11 Nov, 10:30')}
          ${prop('Stickies', '64')}
          ${prop('Votes cast', '138')}`,
)}
${panelSection(
  'People',
  `          <div class="m-cluster" data-justify="between"><span class="m-avatar-group">${avatar('I', 'blue', 'sm')}${avatar('O', 'violet', 'sm')}${avatar('K', 'red', 'sm')}${avatar('P', 'green', 'sm')}${avatar('T', 'yellow', 'sm')}</span><span style="${xs}; color: var(--m-color-fg-subtle)">12 can edit</span></div>`,
  `<button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Invite">${icon(I.plus, 14)}</button>`,
)}
${panelSection(
  'Link access',
  `          <select class="m-select" data-size="sm" aria-label="Who can open the link"><option>Anyone at Copperleaf can edit</option><option>Anyone with the link can view</option><option>Only people invited</option></select>
          <label class="m-cluster" data-gap="2" style="${xs}"><input class="m-checkbox" type="checkbox" checked> Let guests add stickies</label>`,
)}
        <div class="m-cluster" data-gap="2" style="padding: var(--m-space-4)">
          <button type="button" class="m-button" data-variant="primary" data-size="sm" style="flex: 1">Open board</button>
          <button type="button" class="m-button" data-size="sm">${icon(I.link, 14)} Copy link</button>
        </div>
      </aside>
      <main class="m-stack" data-gap="4" style="padding: var(--m-space-6) var(--m-space-8) var(--m-space-12); min-inline-size: 0">
        <div class="m-cluster" data-justify="between">
          ${pillTabs('Which boards', ['All boards', 'Facilitating', 'Invited to', 'Templates'], 'All boards')}
          <div class="m-cluster" data-gap="1">
            <button type="button" class="m-button" data-variant="ghost" data-size="sm">Room: any ${icon(I.down, 12)}</button>
            <button type="button" class="m-button" data-variant="ghost" data-size="sm">Last changed ${icon(I.down, 12)}</button>
            <div class="m-cluster" data-gap="0" role="group" aria-label="View" style="border-radius: var(--m-radius-md)">
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Grid" aria-pressed="true" style="background: var(--m-color-bg-sunken)">${icon(I.grid, 14)}</button>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="List">${icon(I.list, 14)}</button>
            </div>
          </div>
        </div>
        <p style="margin: 0; ${xs}; color: var(--m-color-fg-subtle)">This week</p>
        <div class="m-grid" style="--m-layout-grid-min: 200px">
          ${fileCard('Saddle fit interviews', 'Edited 12 minutes ago', ['yellow', 'violet', 'green', 'blue'], true)}
          ${fileCard('Shop floor map', 'Edited 2 hours ago', ['blue', 'blue', 'pink'])}
          ${fileCard('Spring range retro', 'Edited yesterday', ['green', 'pink', 'violet', 'green'])}
        </div>
        <p style="margin: 0; ${xs}; color: var(--m-color-fg-subtle)">Earlier</p>
        <div class="m-table-wrap">
          <table class="m-table">
            <thead><tr><th>Name</th><th>Room</th><th>Facilitator</th><th data-numeric>Stickies</th><th>Last changed</th></tr></thead>
            <tbody>
${[
  ['Repair café kickoff', 'Repair café', 'red', 'Marek Duda', '37', '4 Nov'],
  ['Kids’ bikes: who buys them?', 'Spring range', 'violet', 'Odile Brun', '52', '29 Oct'],
  ['Test-ride route ideas', 'Ride team', 'blue', 'Ines Varga', '18', '21 Oct'],
  ['Paint booth layout', 'Frame shop', 'yellow', 'Tomasz Wilk', '9', '14 Oct'],
]
  .map(
    ([n, room, hue, who, s, d]) =>
      `              <tr><td><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span style="display: grid; place-items: center; inline-size: 20px; block-size: 20px; border-radius: var(--m-radius-md); background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">${icon(I.sticky, 12, '', 2)}</span>${n}</span></td><td><span class="m-cluster" data-gap="1"><span aria-hidden="true" style="inline-size: 8px; block-size: 8px; border-radius: var(--m-radius-sm); background: ${people[hue as Hue][0]}"></span>${room}</span></td><td>${who}</td><td data-numeric>${s}</td><td style="color: var(--m-color-fg-subtle)">${d}</td></tr>`,
  )
  .join('\n')}
            </tbody>
          </table>
        </div>
      </main>
    </div>`,
);

// ---------------------------------------------------------------- onboarding

const choice = (ic: IconName, title: string, line: string, t: Tint, picked = false) =>
  `<label style="display: flex; flex-direction: column; gap: var(--m-space-3); padding: var(--m-space-4); border-radius: var(--m-radius-md); border: var(--m-border-width-thin) solid ${picked ? 'var(--m-color-border-focus)' : 'var(--m-color-border-default)'}; background: ${picked ? 'var(--m-color-accent-subtle)' : 'var(--m-color-bg-surface)'}; cursor: pointer${picked ? '; box-shadow: 0 0 0 1px var(--m-color-border-focus)' : ''}">
              <span class="m-cluster" data-justify="between"><span style="display: grid; place-items: center; inline-size: 36px; block-size: 36px; background: ${tint[t]}; box-shadow: var(--m-shadow-sm); transform: rotate(-3deg)">${icon(I[ic], 18)}</span><input class="m-checkbox" type="checkbox"${picked ? ' checked' : ''}></span>
              <span class="m-stack" data-gap="1"><strong style="${strong}">${title}</strong><span style="${xs}; color: var(--m-color-fg-muted)">${line}</span></span>
            </label>`;

const onboarding = `<div style="${board}; min-block-size: 100vh; position: relative; overflow: hidden">
  <header class="m-cluster" data-justify="between" style="padding: var(--m-space-4) var(--m-space-6)">
    ${mark()}
    <span style="${xs}; color: var(--m-color-fg-subtle)">Signed in as odile@copperleaf.example</span>
  </header>
  ${cursor('Ines', 'blue', 'inset-block-start: 128px; inset-inline-start: 12%')}
  ${cursor('Kwame', 'yellow', 'inset-block-end: 144px; inset-inline-end: 10%')}
  <div aria-hidden="true" style="position: absolute; inset-block-start: 192px; inset-inline-start: 6%; inline-size: 112px; block-size: 112px; background: var(--m-color-warning-border); box-shadow: var(--m-shadow-sm); transform: rotate(-6deg); padding: var(--m-space-3); font-size: var(--m-font-size-md)">Pick as many as you like</div>
  <div aria-hidden="true" style="position: absolute; inset-block-end: 96px; inset-inline-start: 9%; inline-size: 88px; block-size: 88px; background: var(--m-color-success-border); box-shadow: var(--m-shadow-sm); transform: rotate(4deg)"></div>
  <main class="m-container" data-size="md" style="position: relative; z-index: 1; padding-block: var(--m-space-8) var(--m-space-16)">
    <form class="m-stack" data-gap="6" style="${floating}; box-shadow: var(--m-shadow-overlay); padding: var(--m-space-8); max-inline-size: 640px; margin-inline: auto">
      <div class="m-stack" data-gap="3">
        <div class="m-cluster" data-justify="between" style="${xs}; color: var(--m-color-fg-subtle)"><span>Step 2 of 3</span><a href="#" style="color: var(--m-color-fg-subtle)">Skip for now</a></div>
        <div class="m-cluster" data-gap="1" aria-hidden="true">${[1, 1, 0].map((on) => `<span style="flex: 1; block-size: 4px; border-radius: var(--m-radius-full); background: ${on ? 'var(--m-color-border-focus)' : 'var(--m-color-bg-sunken)'}"></span>`).join('')}</div>
        <h1 style="margin: 0; font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)">What will your team use boards for?</h1>
        <p style="margin: 0; color: var(--m-color-fg-muted)">We’ll start you with a few blank boards and the stencils that go with them. You can change this later.</p>
      </div>
      <fieldset class="m-grid" style="--m-layout-grid-min: 160px; --m-layout-grid-gap: var(--m-space-3); border: 0; padding: 0; margin: 0">
        <legend class="m-sr-only">Uses</legend>
        ${choice('retro', 'Retros', 'Look back after a launch or a sprint', 'green', true)}
        ${choice('presentation', 'Workshops', 'Run a session with timers and votes', 'violet', true)}
        ${choice('map', 'Roadmaps', 'Lay out the next few months', 'blue')}
        ${choice('shapes', 'Diagrams', 'Flows, floor plans and org charts', 'yellow')}
        ${choice('vote', 'Quick polls', 'Ask the room and count the stickies', 'pink')}
        ${choice('users', 'Interviews', 'Sort what customers told you', 'yellow')}
      </fieldset>
      <div class="m-field">
        <label class="m-field-label" for="team">Name your first room</label>
        <input class="m-input" id="team" value="Spring range">
        <span class="m-field-hint">Rooms hold boards for one team or project.</span>
      </div>
      <div class="m-cluster" data-justify="between">
        <button type="button" class="m-button" data-variant="ghost">${icon(I.left, 14)} Back</button>
        <button type="button" class="m-button" data-variant="primary" data-size="lg">Continue</button>
      </div>
    </form>
  </main>
</div>`;

// ---------------------------------------------------------------- settings

const row = (label: string, help: string, control: string) =>
  `<div class="m-cluster" data-justify="between" style="padding-block: var(--m-space-3); ${hair()}; gap: var(--m-space-4)">
            <div class="m-stack" data-gap="0" style="flex: 1 1 256px"><span>${label}</span>${help ? `<span style="${xs}; color: var(--m-color-fg-subtle)">${help}</span>` : ''}</div>
            <div class="m-cluster" data-gap="2">${control}</div>
          </div>`;
const group = (title: string, body: string) =>
  `<section class="m-stack" data-gap="0">
          <h2 style="margin: 0 0 var(--m-space-1); ${xs}; ${strong}; color: var(--m-color-fg-default)">${title}</h2>
${body}
        </section>`;

const settings = shell(
  '',
  `    ${topBar('Settings', `<button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Close">${icon(I.x, 16)}</button>`)}
    <main class="m-stack" data-gap="6" style="padding: var(--m-space-6) var(--m-space-8) var(--m-space-16); max-inline-size: 736px; inline-size: 100%">
      ${pillTabs('Settings', ['Profile', 'Alerts', 'Sessions and privacy', 'Connected apps'], 'Profile')}
      <div class="m-cluster" data-gap="4">
        <span class="m-avatar" data-size="lg" style="inline-size: 56px; block-size: 56px; font-size: var(--m-font-size-xl); background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">O</span>
        <div class="m-stack" data-gap="1"><strong style="${strong}">Odile Brun</strong><span style="${xs}; color: var(--m-color-fg-subtle)">Facilitator in 3 rooms · joined March</span></div>
        <button type="button" class="m-button" data-size="sm" style="margin-inline-start: auto">${icon(I.upload, 14)} New photo</button>
      </div>
${group(
  'You',
  `          ${row('Name', '', '<input class="m-input" data-size="sm" aria-label="Name" value="Odile Brun" style="inline-size: 224px">')}
          ${row('Email', 'Where invites and sums-ups are sent', '<input class="m-input" data-size="sm" aria-label="Email" value="odile@copperleaf.example" style="inline-size: 224px">')}
          ${row('Cursor colour', 'What others see when you move around a board', `<span class="m-cluster" data-gap="1" role="radiogroup" aria-label="Cursor colour">${(['violet', 'blue', 'green', 'red', 'yellow'] as Hue[]).map((h, i) => `<span role="radio" aria-checked="${i === 0}" aria-label="${h}" tabindex="${i === 0 ? 0 : -1}" style="inline-size: 20px; block-size: 20px; border-radius: var(--m-radius-full); background: ${people[h][0]}${i === 0 ? '; box-shadow: 0 0 0 2px var(--m-color-bg-surface), 0 0 0 3px var(--m-color-border-focus)' : ''}"></span>`).join('')}</span>`)}`,
)}
${group(
  'On boards',
  `          ${row('Show other people’s cursors', 'Turn off to work without the moving tags', '<input class="m-switch" type="checkbox" role="switch" checked aria-label="Show cursors">')}
          ${row('Play sounds for stamps', '', '<input class="m-switch" type="checkbox" role="switch" aria-label="Stamp sounds">')}
          ${row('Snap stickies to the grid', '', '<input class="m-switch" type="checkbox" role="switch" checked aria-label="Snap to grid">')}
          ${row('Theme', '', '<select class="m-select" data-size="sm" aria-label="Theme" style="inline-size: 160px"><option>Match the system</option><option>Light</option><option>Dark</option></select>')}`,
)}
${group(
  'Email me when',
  `          <div class="m-stack" data-gap="2" style="padding-block: var(--m-space-3); ${hair()}">
            <label class="m-cluster" data-gap="2"><input class="m-checkbox" type="checkbox" checked> Someone mentions me in a comment</label>
            <label class="m-cluster" data-gap="2"><input class="m-checkbox" type="checkbox" checked> A session I run starts in 15 minutes</label>
            <label class="m-cluster" data-gap="2"><input class="m-checkbox" type="checkbox"> A board in my rooms gets a new page</label>
          </div>`,
)}
${group(
  'Leave',
  `          ${row('Leave Copperleaf Bikes', 'Your stickies stay on their boards, with your name on them.', `<button type="button" class="m-button" data-variant="danger" data-size="sm">${icon(I.trash, 14)} Leave workspace</button>`)}`,
)}
    </main>`,
);

// ---------------------------------------------------------------- empty state

const emptyState = shell(
  'Retros',
  `    ${topBar('Retros', `<button type="button" class="m-button" data-variant="primary" data-size="sm">${icon(I.plus, 14)} New retro</button>`)}
    <main class="m-stack" data-gap="6" style="padding: var(--m-space-6) var(--m-space-8) var(--m-space-16)">
      ${pillTabs('Which retros', ['Open', 'Closed', 'Shared with guests'], 'Open')}
      <section class="m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-12); max-inline-size: 480px; margin-inline: auto" aria-labelledby="empty-title">
        <div aria-hidden="true" style="position: relative; inline-size: 144px; block-size: 104px">
          <span style="position: absolute; inset-block-start: 8px; inset-inline-start: 8px; inline-size: 80px; block-size: 80px; border: 1.5px dashed var(--m-color-border-strong); transform: rotate(-6deg)"></span>
          <span style="position: absolute; inset-block-start: 16px; inset-inline-start: 48px; inline-size: 80px; block-size: 80px; display: grid; place-items: center; background: var(--m-color-warning-border); box-shadow: var(--m-shadow-md); transform: rotate(4deg); color: var(--m-color-fg-muted)">${icon(I.plus, 24)}</span>
          ${cursor('You', 'violet', 'inset-block-end: -8px; inset-inline-end: -24px')}
        </div>
        <h2 id="empty-title" style="margin: 0; font-size: var(--m-font-size-lg); ${strong}">No open retros</h2>
        <p style="margin: 0; color: var(--m-color-fg-muted)">Start one after a launch or a busy week. Everyone adds stickies on their own first, then you vote together.</p>
        <div class="m-cluster" data-gap="2" data-justify="center">
          <button type="button" class="m-button" data-variant="primary">${icon(I.plus, 14)} New retro</button>
          <button type="button" class="m-button">Start from a stencil</button>
        </div>
      </section>
      <div class="m-stack" data-gap="3">
        <p style="margin: 0; ${xs}; color: var(--m-color-fg-subtle)">Stencils for retros</p>
        <div class="m-grid" style="--m-layout-grid-min: 208px">
          ${fileCard('Keep, change, try', '3 sections · 20 minutes', ['green', 'pink', 'violet'])}
          ${fileCard('Four quick questions', '4 sections · 30 minutes', ['yellow', 'blue', 'green', 'pink'])}
          ${fileCard('Ride the timeline', '1 section · 45 minutes', ['blue', 'yellow', 'blue', 'yellow'])}
        </div>
      </div>
    </main>`,
);

// ---------------------------------------------------------------- pricing (the public site)

const ink = 'background: var(--m-color-fg-default); color: var(--m-color-bg-surface); border-color: var(--m-color-fg-default)';
const seat = (name: string, price: string, extra: string, hues: Hue[]) =>
  `<div class="m-stack" data-gap="2" style="padding-block: var(--m-space-4); ${hair()}">
              <div class="m-cluster" data-justify="between" style="font-size: var(--m-font-size-xl)"><span>${name}</span><span style="${num}">${price}<span style="color: var(--m-color-fg-subtle)">${/^\$/.test(price) ? '/mo' : ''}</span></span></div>
              <span class="m-cluster" data-gap="1" aria-hidden="true">${hues.map((h) => `<span style="inline-size: 12px; block-size: 12px; border-radius: var(--m-radius-sm); background: ${people[h][0]}"></span>`).join('')}</span>
              <span style="color: var(--m-color-fg-subtle)">${extra}</span>
            </div>`;
const plan = (name: string, sub: string, seats: string, cta: string, filled: boolean, why: string[]) =>
  `<section class="m-stack" data-gap="0" style="padding: 0 var(--m-space-6); ${hair('inline-start')}" aria-label="${name}">
            <h2 style="margin: 0 0 var(--m-space-4); font-family: var(--m-font-family-display); font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-regular); letter-spacing: var(--m-font-tracking-tight)">${name}</h2>
            <div style="min-block-size: 32px">${sub}</div>
${seats}
            <button type="button" class="m-button" data-size="lg" style="margin-block: var(--m-space-6); border-radius: 8px; font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-regular)${filled ? `; ${ink}` : '; border-color: var(--m-color-fg-default)'}">${cta}</button>
            <p style="margin: 0 0 var(--m-space-3)">Good if you:</p>
            <ul class="m-stack" data-gap="2" style="list-style: none; margin: 0; padding: 0">
${why.map((w) => `              <li class="m-cluster" data-gap="2" style="flex-wrap: nowrap; align-items: flex-start"><span style="display: grid; place-items: center; flex: none; inline-size: 16px; block-size: 16px; margin-block-start: 2px; border-radius: var(--m-radius-full); background: var(--m-color-success-solid); color: var(--m-color-success-on-solid)">${icon(I.check, 10, '', 3)}</span>${w}</li>`).join('\n')}
            </ul>
          </section>`;

const pricing = `<div style="background: var(--m-color-bg-canvas); min-block-size: 100vh; font-size: var(--m-font-size-lg)">
  <nav class="m-navbar" aria-label="Site" style="block-size: 76px">
    <a class="m-navbar-brand" href="#" style="text-decoration: none; color: inherit">${mark()}</a>
    <div class="m-navbar-nav">
      <a class="m-navbar-link" href="#" style="font-size: var(--m-font-size-xl); color: var(--m-color-fg-default)">Product ${icon(I.down, 12)}</a>
      <a class="m-navbar-link" href="#" style="font-size: var(--m-font-size-xl); color: var(--m-color-fg-default)">Stencils</a>
      <a class="m-navbar-link" href="#" style="font-size: var(--m-font-size-xl); color: var(--m-color-fg-default)">Stories</a>
      <a class="m-navbar-link" href="#" aria-current="page" style="font-size: var(--m-font-size-xl)">Plans</a>
    </div>
    <div class="m-navbar-actions">
      <a class="m-navbar-link" href="#" style="font-size: var(--m-font-size-lg); color: var(--m-color-fg-default)">Log in</a>
      <a class="m-button" data-size="lg" href="#" style="border-radius: 8px; font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-regular)">Talk to us</a>
      <a class="m-button" data-size="lg" href="#" style="border-radius: 8px; font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-regular); ${ink}">Start for free</a>
    </div>
  </nav>
  <main class="m-container" style="padding-block: var(--m-space-12) var(--m-space-16)">
    <div class="m-stack" data-gap="6">
      <span class="m-cluster" data-gap="2" style="align-self: flex-start; padding: var(--m-space-2) var(--m-space-4) var(--m-space-2) var(--m-space-2); border-radius: var(--m-radius-full); background: var(--m-color-success-bg)"><span class="m-badge" style="background: var(--m-color-success-solid); color: var(--m-color-success-on-solid); font-family: var(--m-font-family-mono)">NEW</span> Guest seats now come with every paid plan.</span>
      <h1 style="margin: 0; font-family: var(--m-font-family-display); font-size: var(--m-font-size-4xl); font-weight: var(--m-font-weight-regular); letter-spacing: var(--m-font-tracking-tight); line-height: 1; max-inline-size: 14em">Choose a plan, then the seats you need</h1>
      <div class="m-cluster" data-justify="between" style="gap: var(--m-space-4)">
        <div class="m-cluster" data-gap="4" style="padding: var(--m-space-3) var(--m-space-6); border-radius: var(--m-radius-full); background: var(--m-color-bg-sunken); flex: 1">
${[
  ['sticky', 'Boards', 'violet'],
  ['presentation', 'Sessions', 'blue'],
  ['vote', 'Polls', 'green'],
  ['map', 'Roadmaps', 'yellow'],
  ['sparkles', 'Board helper', 'red'],
]
  .map(
    ([ic, l, h]) =>
      `          <span class="m-cluster" data-gap="1"><span style="display: grid; place-items: center; inline-size: 18px; block-size: 18px; border-radius: var(--m-radius-sm); background: ${people[h as Hue][0]}; color: ${people[h as Hue][1]}">${icon(I[ic as IconName], 11, '', 2)}</span>${l}</span>`,
  )
  .join('\n')}
        </div>
        <label class="m-stack" data-gap="0" style="padding: var(--m-space-2) var(--m-space-3); border-radius: var(--m-radius-md); background: var(--m-color-bg-sunken); min-inline-size: 144px"><span style="font-size: 10px; letter-spacing: var(--m-font-tracking-wide)">CURRENCY</span><select aria-label="Currency" style="border: 0; background: transparent; font: inherit; color: inherit; padding: 0"><option>$ USD</option><option>€ EUR</option><option>£ GBP</option></select></label>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 240px; --m-layout-grid-gap: 0; margin-block-start: var(--m-space-4)">
        ${plan('Jotter', '', seat('Every seat', 'Free', 'Three open boards per room', ['violet', 'blue', 'green']), 'Pick this plan', false, ['Are trying boards out with a few people', 'Need a handful of rooms', 'Run short sessions, up to 40 minutes'])}
        ${plan(
          'Studio',
          `<div class="m-tabs" data-variant="pill" style="display: inline-block; border-radius: var(--m-radius-full); background: var(--m-color-bg-sunken); padding: 3px"><div class="m-tab-list" role="tablist" aria-label="Billing"><button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1" style="border-radius: var(--m-radius-full)">Monthly</button><button type="button" class="m-tab" role="tab" aria-selected="true" style="border-radius: var(--m-radius-full); background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-sm)">Yearly</button></div></div>`,
          `${seat('Facilitator seat', '$14', '+ unlimited sessions and timers', ['violet', 'blue', 'green', 'yellow', 'red'])}${seat('Member seat', '$6', '+ voting and stamps', ['violet', 'green'])}${seat('Guest seat', '$0', '+ view and add stickies', ['violet'])}`,
          'Pick this plan',
          true,
          ['Run sessions every week', 'Want unlimited rooms and boards', 'Invite clients as guests'],
        )}
        ${plan(
          'Guild',
          '<span style="font-size: var(--m-font-size-md)">Billed yearly</span>',
          `${seat('Facilitator seat', '$32', '+ shared stencils across rooms', ['violet', 'blue', 'green', 'yellow', 'red'])}${seat('Member seat', '$10', '+ room-level permissions', ['violet', 'green', 'blue'])}${seat('Guest seat', '$0', '+ view and add stickies', ['violet'])}`,
          'Pick this plan',
          true,
          ['Have several teams sharing stencils', 'Need sign-in through your company', 'Want an admin view of every room'],
        )}
        ${plan('Campus', '<span style="font-size: var(--m-font-size-md)">For schools and large groups</span>', seat('Every seat', 'Ask', 'Priced by headcount', ['violet', 'blue', 'green', 'yellow', 'red']), 'Talk to us', true, ['Teach with boards across a school', 'Need data kept in your region', 'Want a named contact'])}
      </div>
      <div class="m-split" style="--m-layout-split-side: 352px; --m-layout-split-gap: var(--m-space-8); margin-block-start: var(--m-space-12); align-items: flex-start">
        <div class="m-stack" data-gap="3"><h2 style="margin: 0; font-family: var(--m-font-family-display); font-size: var(--m-font-size-4xl); font-weight: var(--m-font-weight-regular); letter-spacing: var(--m-font-tracking-tight); line-height: 1">Extras</h2><p style="margin: 0; font-size: var(--m-font-size-xl)">Add these to any paid plan</p></div>
        <div class="m-stack" data-gap="4">
${[
  ['Board helper credits', 'Let the helper sort stickies, find themes and write the sum-up after a session. Credits are shared by the whole workspace.', 'See how credits work'],
  ['Long-term archive', 'Keep closed boards, votes and comments for seven years, with exports for audits.', 'Talk to us'],
]
  .map(
    ([t, d, a]) => `          <article class="m-card" style="border-radius: 16px; padding: var(--m-space-6)">
            <div class="m-stack" data-gap="3"><h3 style="margin: 0; font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-medium)">${t}</h3><p style="margin: 0; color: var(--m-color-fg-muted)">${d}</p>
            <a href="#" class="m-cluster" data-gap="1" style="align-self: flex-end; color: var(--m-color-fg-default)">${a} ${icon(I.right, 14)}</a></div>
          </article>`,
  )
  .join('\n')}
        </div>
      </div>
    </div>
  </main>
</div>`;

// ---------------------------------------------------------------- errors

const errorPage = (code: string, t: Tint, note: string, title: string, line: string, actions: string, who: [string, Hue]) =>
  `<section class="m-card" style="text-align: center; padding: var(--m-space-8) var(--m-space-6); ${board}; position: relative; overflow: hidden" aria-label="${code} page">
          <div class="m-stack" data-gap="3" data-align="center">
            <div aria-hidden="true" style="inline-size: 112px; block-size: 112px; display: flex; flex-direction: column; justify-content: space-between; padding: var(--m-space-3); background: ${tint[t]}; box-shadow: var(--m-shadow-md); transform: rotate(-3deg); text-align: start">
              <span style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-3xl); line-height: 1; ${num}">${code}</span><span style="${xs}; color: var(--m-color-fg-muted)">${note}</span>
            </div>
            <h2 style="margin: var(--m-space-2) 0 0; font-size: var(--m-font-size-lg); ${strong}">${title}</h2>
            <p style="margin: 0; color: var(--m-color-fg-muted)">${line}</p>
            <div class="m-cluster" data-gap="2" data-justify="center">${actions}</div>
          </div>
          ${cursor(who[0], who[1], 'inset-block-start: 40px; inset-inline-end: 18%')}
        </section>`;

const errors = shell(
  'Workshops',
  `    ${topBar('Workshops / New board', `<button type="button" class="m-button" data-size="sm">Cancel</button><button type="button" class="m-button" data-variant="primary" data-size="sm" aria-busy="true">Creating</button>`)}
    <main class="m-stack" data-gap="6" style="padding: var(--m-space-6) var(--m-space-8) var(--m-space-16); max-inline-size: 1024px">
      <div class="m-alert" data-tone="danger" role="alert">
        <span class="m-alert-icon">${icon(I.alert, 16)}</span>
        <div class="m-alert-content">
          <p class="m-alert-title">Two things to fix before the board can be made</p>
          <p class="m-alert-body">Nothing was created yet. Your choices are kept.</p>
        </div>
      </div>
      <form class="m-stack" data-gap="4" style="max-inline-size: 448px" novalidate>
        <div class="m-field"><label class="m-field-label" for="bn">Board name</label>
          <input class="m-input" id="bn" aria-invalid="true" aria-describedby="bn-err" placeholder="Name this board">
          <span class="m-field-error" id="bn-err">Give the board a name so people can find it.</span></div>
        <div class="m-field"><label class="m-field-label" for="rm">Room</label>
          <select class="m-select" id="rm" aria-invalid="true" aria-describedby="rm-err"><option>Pick a room</option></select>
          <span class="m-field-error" id="rm-err">“Night rides” was archived on Monday. Pick another room.</span></div>
        <div class="m-field"><label class="m-field-label" for="st">Session length</label>
          <input class="m-input" id="st" value="45 minutes"><span class="m-field-hint">The timer starts when you open the board.</span></div>
      </form>
      <div class="m-alert" data-tone="warning" role="status">
        <span class="m-alert-icon">${icon(I.warn, 16)}</span>
        <div class="m-alert-content"><p class="m-alert-body">You’re offline. Stickies you add are saved here and sent when you’re back.</p></div>
      </div>
      <div class="m-toast-region" data-static aria-live="polite">
        <div class="m-toast" data-tone="danger" role="alert">
          <div class="m-toast-content"><p class="m-toast-title">Couldn’t paste 12 stickies</p><p class="m-toast-body">The board is full for guests. Ask a facilitator to make room.</p>
            <div class="m-toast-actions"><button type="button" class="m-button" data-size="sm">Try again</button></div></div>
          <button type="button" class="m-toast-close" aria-label="Dismiss">${icon(I.x, 14)}</button>
        </div>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 272px">
        ${errorPage('404', 'yellow', 'Nothing pinned here', 'This board isn’t here', 'It may have been moved to another room, or the link is old.', `<button type="button" class="m-button" data-variant="primary" data-size="sm">Back to Workshops</button>`, ['Lost?', 'violet'])}
        ${errorPage('500', 'pink', 'Ink ran dry', 'Something went wrong on our side', 'Nothing on the board was lost. Try again in a moment.', `<button type="button" class="m-button" data-variant="primary" data-size="sm">${icon(I.refresh, 14)} Try again</button><button type="button" class="m-button" data-size="sm">Status</button>`, ['Ines', 'blue'])}
        ${errorPage('403', 'violet', 'Room is private', 'You can’t open this board', 'It’s in a room you aren’t in yet. The owner can let you in.', `<button type="button" class="m-button" data-variant="primary" data-size="sm">Ask to join</button>`, ['Marek', 'green'])}
      </div>
    </main>`,
);

export const doodleRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Board',
    description:
      'The whiteboard as the dashboard: a dotted canvas with floating panels (board name; avatars, timer and a violet Share), three labelled sections of sticky notes with authors, stamps, cursors with name tags, a vote-count panel, and the chunky floating toolbar with the current tool in violet.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'Boards in the file browser',
    description:
      'The file browser as the list: a 240px white sidebar with full-width rows (the current one pale blue), a 48px top bar, pill tabs and quiet sort buttons, thumbnail cards with the selected one framed in blue, a list view below, and a properties-style detail panel with 11px section titles.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Set-up on the board',
    description:
      'A floating panel on the dotted board with cursors and stickies around it: a step line, a 24px question, sticky-tile choices (the picked ones pale blue and framed in blue), one field, Back and a large Continue.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'Pill tabs, then 11px semibold group titles over label-and-control rows divided by hairlines: filled inputs, a cursor-colour picker, switches, a select, checkboxes, and a red Leave button.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty room',
    description:
      'Pill tabs, then a dashed sticky outline and a yellow sticky with a cursor, a 15px title, one sentence, a blue primary and a white secondary, and stencils as thumbnail cards below.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Plans',
    description:
      'The public site: a light 56px headline, a pill of products, four plan columns split by hairlines with seat rows and per-month prices, a pill billing switch, ink buttons, green-tick reasons, and rounded extras cards.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors under filled inputs, a danger banner that says nothing was created, an offline warning, the near-black toast, and full pages for 404, 500 and no access drawn as stickies on the board.',
    html: errors,
  },
];
