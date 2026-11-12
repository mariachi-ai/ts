import type { ArchetypeRecipe } from '../types';

/*
 * Trellis's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from a made-up ferry operator's team workspace. They follow
 * the language's real screen patterns: an aubergine frame (top bar with search, icon rail with
 * labels) round a white panel with rounded corners, a plum channel list with Bold unread rows, red
 * mention counts and a blue current row, flat message rows beside rounded-square faces, reactions as
 * chips, replies under a message, a composer with a formatting bar and a green split send, and a
 * thread or profile pane on the right.
 */

// Lucide icons, outlined, 1.5px stroke
const icon = (paths: string, size = 18) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none">${paths}</svg>`;
const I = {
  anchor: '<path d="M12 6v16"/><path d="m19 13 2-1a9 9 0 0 1-18 0l2 1"/><path d="M9 11h6"/><circle cx="12" cy="4" r="2"/>',
  arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  atSign: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>',
  bold: '<path d="M6 12h9a4 4 0 010 8H7a1 1 0 01-1-1V5a1 1 0 011-1h7a4 4 0 010 8"/>',
  calendarDays: '<path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M8 13h.01"/><path d="M12 13h.01"/><path d="M16 13h.01"/><path d="M8 17h.01"/><path d="M12 17h.01"/><path d="M16 17h.01"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  circleAlert: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  circleCheck: '<circle cx="12" cy="12" r="10"/><path d="m16 9-5.5 5.5L8 12"/>',
  circleHelp: '<circle cx="12" cy="12" r="10"/><path d="M9 9.5a3 2.5 0 016 0c0 2-2 2-3 3.5"/><path d="M12 17h.01"/>',
  circleX: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  clipboardList: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  ellipsisVertical: '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
  fileText: '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  hash: '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  italic: '<line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/>',
  keyboard: '<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>',
  laptop: '<path d="M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z"/><path d="M20.054 15.987H3.946"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  listFilter: '<path d="M2 5h20"/><path d="M6 12h12"/><path d="M9 19h6"/>',
  listOrdered: '<path d="M11 5h10"/><path d="M11 12h10"/><path d="M11 19h10"/><path d="M4 4h1v5"/><path d="M4 9h2"/><path d="M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02"/>',
  list: '<path d="M3 5h.01"/><path d="M3 12h.01"/><path d="M3 19h.01"/><path d="M8 5h13"/><path d="M8 12h13"/><path d="M8 19h13"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  messageCircle: '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>',
  messageSquare: '<path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/>',
  mic: '<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/>',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
  moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
  notebookPen: '<path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/>',
  pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  sendHorizontal: '<path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z"/><path d="M6 12h16"/>',
  ship: '<path d="M12 2v2"/><path d="M12 9.189V13"/><path d="M19 12V6a2 2 0 00-2-2H7a2 2 0 00-2 2v6"/><path d="M19.38 19A11.6 11.6 0 0021 13l-8.188-3.639a2 2 0 00-1.624 0L3 13.001a11.6 11.6 0 002.81 7.76"/><path d="M2 20c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  smilePlus: '<path d="M13.267 2.08a10 10 0 108.653 8.653"/><path d="M15 10V9"/><path d="M16 5h6"/><path d="M16.472 15a6 6 0 01-8.943 0"/><path d="M19 2v6"/><path d="M9 10V9"/>',
  smile: '<path d="M15 10V9"/><path d="M16.472 15a6 6 0 01-8.943 0"/><path d="M9 10V9"/><circle cx="12" cy="12" r="10"/>',
  squareCode: '<path d="m10 9-3 3 3 3"/><path d="m14 15 3-3-3-3"/><rect x="3" y="3" width="18" height="18" rx="2"/>',
  squarePen: '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>',
  squareSlash: '<rect width="18" height="18" x="3" y="3" rx="2"/><line x1="9" x2="15" y1="15" y2="9"/>',
  strikethrough: '<path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  textQuote: '<path d="M17 5H3"/><path d="M21 12H8"/><path d="M21 19H8"/><path d="M3 12v7"/>',
  triangleAlert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  type: '<path d="M12 4v16"/><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2"/><path d="M9 20h6"/>',
  userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
  video: '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  volume2: '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>',
  waves: '<path d="M2 12q2.5 2 5 0t5 0 5 0 5 0"/><path d="M2 19q2.5 2 5 0t5 0 5 0 5 0"/><path d="M2 5q2.5 2 5 0t5 0 5 0 5 0"/>',
  wifiOff: '<path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.177-2.643"/><path d="M22 8.82a15 15 0 0 0-11.288-3.764"/><path d="m2 2 20 20"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
};

// Type and fills, from the tokens
const black = 'font-weight: var(--m-font-weight-bold)';
const bold = 'font-weight: var(--m-font-weight-medium)';
const sm = 'font-size: var(--m-font-size-sm)';
const xs = 'font-size: var(--m-font-size-xs)';
const md = 'font-size: var(--m-font-size-md)';
const muted = 'color: var(--m-color-fg-muted)';
const subtle = 'color: var(--m-color-fg-subtle)';
const ink = 'color: var(--m-color-fg-default)';
const link = 'color: var(--m-color-accent-text)';
const hair = 'var(--m-border-width-thin) solid var(--m-color-border-default)';
const onBrand = 'color: var(--m-color-brand-fg)';
// A translucent white layer on the aubergine, drawn without a colour literal
const veil = (o: number, radius = 'var(--m-radius-md)') =>
  `<span aria-hidden="true" style="position: absolute; inset: 0; border-radius: ${radius}; background: var(--m-color-brand-fg); opacity: ${o}; pointer-events: none"></span>`;

// People are rounded squares: initials in white on a tone, with an optional presence dot
type Presence = 'active' | 'away' | '';
const tones = [
  'var(--m-color-brand-default)',
  'var(--m-color-info-solid)',
  'var(--m-color-accent-default)',
  'var(--m-color-danger-solid)',
  'var(--m-sidebar-bg)',
];
const person = (initials: string, n: number, size = '2.25rem', presence: Presence = '', ring = 'var(--m-color-bg-canvas)') =>
  `<span style="position: relative; display: inline-flex; flex: none"><span class="m-avatar" aria-hidden="true" style="inline-size: ${size}; block-size: ${size}; border-radius: calc(${size} * 0.22); background: ${tones[n % tones.length]}; font-size: calc(${size} * 0.36)">${initials}</span>${
    presence
      ? `<span role="img" aria-label="${presence === 'active' ? 'Active' : 'Away'}" style="position: absolute; inset-block-end: -0.1875rem; inset-inline-end: -0.1875rem; inline-size: max(0.5rem, calc(${size} * 0.28)); block-size: max(0.5rem, calc(${size} * 0.28)); border-radius: 9999px; box-sizing: border-box; background: ${presence === 'active' ? 'var(--m-color-success-solid)' : ring}; border: ${presence === 'active' ? '0' : '0.125rem solid var(--m-color-fg-muted)'}; box-shadow: 0 0 0 0.125rem ${ring}"></span>`
      : ''
  }</span>`;

// ---- The frame: an aubergine top bar and icon rail around a rounded white panel ----

const topBar = (place: string) => `<header class="m-cluster" data-gap="3" style="grid-column: 1 / -1; block-size: 2.75rem; padding-inline: var(--m-space-3); flex-wrap: nowrap; ${onBrand}">
    <span class="m-cluster" data-gap="1" style="flex: 1 1 0; justify-content: flex-end; flex-wrap: nowrap">
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Back" style="${onBrand}">${icon(I.arrowLeft, 18)}</button>
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Forward" style="${onBrand}; opacity: 0.5">${icon(I.arrowRight, 18)}</button>
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Recent" style="${onBrand}">${icon(I.clock, 18)}</button>
    </span>
    <label style="position: relative; flex: 0 1 38rem; min-inline-size: 0; display: flex; align-items: center; gap: var(--m-space-2); block-size: 1.75rem; padding-inline: var(--m-space-3); border-radius: var(--m-radius-md); ${sm}">${veil(0.22)}<span style="position: relative; display: inline-flex">${icon(I.search, 16)}</span><span style="position: relative; overflow: hidden; white-space: nowrap; text-overflow: ellipsis">Search ${place}</span><input class="m-sr-only" type="search" aria-label="Search ${place}"></label>
    <span class="m-cluster" style="flex: 1 1 0; justify-content: flex-end; flex-wrap: nowrap">
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Help" style="${onBrand}">${icon(I.circleHelp, 18)}</button>
    </span>
  </header>`;

// A rail tab: the icon on a tile (a stronger veil when current), its name under it
const railTab = (paths: string, label: string, current: boolean, badge = '') =>
  `<li><a href="#"${current ? ' aria-current="page"' : ''} style="display: flex; flex-direction: column; align-items: center; gap: 0.125rem; text-decoration: none; ${onBrand}; ${xs}; ${current ? black : bold}">
          <span style="position: relative; display: grid; place-items: center; inline-size: 2.25rem; block-size: 2.25rem; border-radius: var(--m-radius-md)">${current ? veil(0.22) : ''}<span style="position: relative; display: inline-flex">${icon(paths, 20)}</span>${badge ? `<span style="position: absolute; inset-block-start: -0.25rem; inset-inline-end: -0.375rem; min-inline-size: 1.125rem; block-size: 1.125rem; padding-inline: 0.25rem; border-radius: 9999px; background: var(--m-sidebar-count-bg); color: var(--m-sidebar-count-fg); font-size: 0.6875rem; ${black}; line-height: 1.125rem; text-align: center; box-shadow: 0 0 0 0.125rem var(--m-color-brand-default)">${badge}</span>` : ''}</span>
          <span style="opacity: ${current ? 1 : 0.85}">${label}</span></a></li>`;

const rail = (current: string) => `<nav aria-label="Workspace" style="grid-row: 2; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding-block: var(--m-space-2) var(--m-space-3)">
      <ul class="m-stack" data-gap="4" style="align-items: center; margin: 0; padding: 0; list-style: none">
        <li><a href="#" aria-label="Bellwether Ferries" style="display: grid; place-items: center; inline-size: 2.25rem; block-size: 2.25rem; border-radius: var(--m-radius-md); background: var(--m-color-brand-fg); color: var(--m-color-brand-default); ${black}; text-decoration: none; ${sm}">BF</a></li>
        ${railTab(I.messageSquare, 'Rooms', current === 'rooms')}
        ${railTab(I.calendarDays, 'Rota', current === 'rota', current === 'rota' ? '' : '3')}
        ${railTab(I.users, 'Crew', current === 'crew')}
        ${railTab(I.ship, 'Fleet', current === 'fleet')}
      </ul>
      <div class="m-stack" data-gap="3" style="align-items: center">
        <button type="button" aria-label="Start something new" style="position: relative; display: grid; place-items: center; inline-size: 2.25rem; block-size: 2.25rem; border: 0; border-radius: 9999px; background: none; ${onBrand}; cursor: pointer">${veil(0.22, '9999px')}<span style="position: relative; display: inline-flex">${icon(I.plus, 20)}</span></button>
        ${person('MO', 2, '2.25rem', 'active', 'var(--m-color-brand-default)')}
      </div>
    </nav>`;

// The page: the frame, then the white panel holding the channel list and the views
const frame = (current: string, place: string, panel: string) => `<div style="min-block-size: 100vh; display: grid; grid-template-columns: 4.5rem minmax(0, 1fr); grid-template-rows: auto 1fr; background: var(--m-color-brand-default)">
  ${topBar(place)}
  ${rail(current)}
  <div style="grid-row: 2; display: flex; flex-wrap: wrap; align-items: stretch; margin: 0 var(--m-space-1) var(--m-space-1) 0; border-radius: var(--m-radius-md); overflow: hidden; background: var(--m-color-bg-canvas)">
${panel}
  </div>
</div>`;

// ---- The channel list ----

const quick = (paths: string, label: string, count = '', current = false) =>
  `          <li><a class="m-sidebar-link" href="#"${current ? ' aria-current="page"' : ''}>${icon(paths, 18)} ${label}${count ? ` <span style="margin-inline-start: auto; ${sm}">${count}</span>` : ''}</a></li>`;
// A channel row: # and the name; unread is Bold and white; mentions add the red count
const room = (name: string, state: 'current' | 'unread' | '' = '', count = '', paths = I.hash) =>
  `          <li><a class="m-sidebar-link" href="#"${state === 'current' ? ' aria-current="page"' : ''}${state === 'unread' ? ` style="color: var(--m-sidebar-link-hover-fg); ${black}"` : ''}>${icon(paths, 18)} ${name}${count ? ` <span class="m-sidebar-count" style="${black}">${count}</span>` : ''}</a></li>`;
const dm = (initials: string, n: number, name: string, presence: Presence, state: 'current' | 'unread' | '' = '', note = '') =>
  `          <li><a class="m-sidebar-link" href="#"${state === 'current' ? ' aria-current="page"' : ''}${state === 'unread' ? ` style="color: var(--m-sidebar-link-hover-fg); ${black}"` : ''}>${person(initials, n, '1.25rem', presence, 'var(--m-sidebar-bg)')} ${name}${note ? ` <span style="opacity: 0.7">${note}</span>` : ''}</a></li>`;
const section = (name: string, rows: string, add: string) => `      <div class="m-sidebar-section">
        <h2 class="m-sidebar-heading m-cluster" data-gap="2" style="flex-wrap: nowrap">${icon(I.chevronDown, 14)} ${name}</h2>
        <ul>
${rows}
          <li><a class="m-sidebar-link" href="#"><span style="display: grid; place-items: center; inline-size: 1.125rem; block-size: 1.125rem; border-radius: var(--m-radius-sm); position: relative">${veil(0.15, 'var(--m-radius-sm)')}<span style="position: relative; display: inline-flex">${icon(I.plus, 12)}</span></span> ${add}</a></li>
        </ul>
      </div>`;

const channelList = (current: string) => `    <nav class="m-sidebar" aria-label="Rooms" style="flex: 1 1 16.25rem; max-inline-size: 100%; inline-size: auto; padding-block-start: 0">
      <div class="m-cluster" data-justify="between" style="block-size: 3.25rem; padding-inline: var(--m-space-4) var(--m-space-1); flex-wrap: nowrap; ${onBrand}">
        <span class="m-cluster" data-gap="1" style="flex-wrap: nowrap; min-inline-size: 0; font-size: var(--m-font-size-lg); ${black}"><span style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis">Bellwether Ferries</span>${icon(I.chevronDown, 16)}</span>
        <span class="m-cluster" data-gap="0" style="flex-wrap: nowrap">
          <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Filter the list" style="${onBrand}">${icon(I.listFilter, 18)}</button>
          <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="New message" style="${onBrand}">${icon(I.squarePen, 18)}</button>
        </span>
      </div>
      <div class="m-sidebar-section">
        <ul>
${quick(I.clipboardList, 'Handovers', current === 'handovers' ? '' : '2', current === 'handovers')}
${quick(I.notebookPen, 'Shift notes')}
${quick(I.calendarDays, 'Swap requests')}
        </ul>
      </div>
${section(
  'Routes',
  [
    room('north-crossing', current === 'north-crossing' ? 'current' : ''),
    room('island-loop', 'unread', '2'),
    room('night-freight'),
    room('pier-works', 'unread'),
    room('skippers-only', '', '', I.lock),
  ].join('\n'),
  'Add a route',
)}
${section('Depots', [room('kelso-depot'), room('morrow-yard')].join('\n'), 'Add a depot')}
${section(
  'On shift now',
  [
    dm('HG', 1, 'Hollis Grant', 'active', current === 'hollis' ? 'current' : 'unread'),
    dm('LO', 3, 'Lucía Ortega', 'active'),
    dm('TW', 1, 'Tomasz Wilk', 'active'),
    dm('MO', 2, 'Mae Okafor', 'active', '', 'you'),
  ].join('\n'),
  'Invite crew',
)}
    </nav>`;

// ---- The conversation ----

const channelHeader = (name: string, tabs: [string, string][], selected: number) => `      <header style="border-block-end: ${hair}">
        <div class="m-cluster" data-justify="between" style="min-block-size: 3.25rem; padding: var(--m-space-2) var(--m-space-3) 0 var(--m-space-5); flex-wrap: nowrap">
          <h1 class="m-cluster" data-gap="1" style="font-size: var(--m-font-size-lg); flex-wrap: nowrap; min-inline-size: 0"><span style="display: inline-flex">${icon(I.hash, 18)}</span>${name} <span style="display: inline-flex; ${muted}">${icon(I.chevronDown, 16)}</span></h1>
          <span class="m-cluster" data-gap="2" style="flex-wrap: nowrap">
            <button type="button" class="m-button" data-size="sm" aria-label="23 members"><span class="m-cluster" data-gap="0" style="flex-wrap: nowrap">${person('HG', 1, '1.25rem')}${person('LO', 3, '1.25rem')}${person('DR', 0, '1.25rem')}</span>23</button>
            <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Room details">${icon(I.ellipsisVertical, 18)}</button>
          </span>
        </div>
        <div class="m-tabs" style="padding-inline: var(--m-space-4)"><div class="m-tab-list" role="tablist" aria-label="${name}" style="border-block-end: 0">
${tabs.map(([ic, l], i) => `          <button type="button" class="m-tab" role="tab" aria-selected="${i === selected}"${i === selected ? '' : ' tabindex="-1"'}><span class="m-cluster" data-gap="1" style="flex-wrap: nowrap">${icon(ic, 16)} ${l}</span></button>`).join('\n')}
          <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Add a tab">${icon(I.plus, 16)}</button>
        </div></div>
      </header>`;

// A message row: the rounded-square avatar, the name in Black, the time, then the text with no gap
const msg = (initials: string, n: number, name: string, time: string, lines: string[], extra = '', style = '', tag = '') => `          <article class="m-message" data-role="user" style="padding: var(--m-space-2) var(--m-space-5); column-gap: var(--m-space-2); row-gap: 0${style ? `; ${style}` : ''}">
            <span class="m-message-avatar" style="background: ${tones[n % tones.length]}">${initials}</span>
            <div class="m-message-meta" style="align-items: baseline; gap: var(--m-space-2)"><span style="${md}; ${black}; ${ink}">${name}</span>${tag}<time>${time}</time></div>
            <div class="m-message-body m-stack" data-gap="0" style="${md}">${lines.map((l) => `<p>${l}</p>`).join('')}${extra}</div>
          </article>`;
// Mentions: blue on the blue tint; a mention of you is on the yellow
const mention = (who: string, you = false) =>
  `<a href="#" style="padding: 0 0.125rem; border-radius: var(--m-radius-sm); text-decoration: none; background: ${you ? 'var(--m-color-warning-bg)' : 'var(--m-color-accent-subtle)'}; color: ${you ? 'var(--m-color-fg-default)' : 'var(--m-color-accent-text)'}${you ? '; box-shadow: inset 0 -0.125rem 0 var(--m-color-warning-solid)' : ''}">@${who}</a>`;
// Reactions: rounded chips; yours is tinted and edged in the blue
const reaction = (glyph: string, count: number, mine = false, label = '') =>
  `<button type="button" aria-pressed="${mine}" aria-label="${label}: ${count}" style="display: inline-flex; align-items: center; gap: 0.25rem; block-size: 1.5rem; padding-inline: 0.4375rem; border-radius: 9999px; border: var(--m-border-width-thin) solid ${mine ? 'var(--m-color-accent-text)' : 'transparent'}; background: ${mine ? 'var(--m-color-accent-subtle)' : 'var(--m-color-bg-sunken)'}; color: ${mine ? 'var(--m-color-accent-text)' : 'var(--m-color-fg-default)'}; ${xs}; ${bold}; cursor: pointer"><span aria-hidden="true" style="${sm}">${glyph}</span>${count}</button>`;
const reactions = (chips: string) =>
  `<div class="m-cluster" data-gap="1" style="margin-block-start: var(--m-space-1)">${chips}<button type="button" aria-label="Add a reaction" style="display: inline-grid; place-items: center; block-size: 1.5rem; inline-size: 2rem; border: var(--m-border-width-thin) solid transparent; border-radius: 9999px; background: var(--m-color-bg-sunken); ${muted}; cursor: pointer">${icon(I.smilePlus, 16)}</button></div>`;
// Replies under a message: the repliers' faces, the count in blue Bold and the time of the last
const replies = (who: [string, number][], count: string, last: string) =>
  `<a href="#" class="m-cluster" data-gap="2" style="margin-block-start: var(--m-space-1); padding: 0.1875rem; margin-inline-start: -0.1875rem; border-radius: var(--m-radius-md); text-decoration: none; ${sm}; flex-wrap: nowrap; inline-size: fit-content"><span class="m-cluster" data-gap="1" style="flex-wrap: nowrap">${who.map(([i, n]) => person(i, n, '1.5rem')).join('')}</span><span style="${link}; ${black}">${count}</span><span style="${muted}">${last}</span></a>`;
const dateDivider = (label: string) =>
  `<div class="m-divider" role="separator" style="margin: var(--m-space-3) 0"><span class="m-cluster" data-gap="1" style="padding: 0.25rem var(--m-space-3) 0.25rem var(--m-space-4); border: ${hair}; border-radius: 9999px; background: var(--m-color-bg-canvas); ${black}; ${sm}">${label} ${icon(I.chevronDown, 12)}</span></div>`;
// The new-messages line: red, with "New" at the end
const newLine = `<div role="separator" aria-label="New messages" class="m-cluster" data-gap="0" style="flex-wrap: nowrap; margin-inline: var(--m-space-5); color: var(--m-color-danger-solid)"><span style="flex: 1; border-block-start: var(--m-border-width-thin) solid var(--m-color-danger-solid)"></span><span style="padding: 0 var(--m-space-2); border-radius: var(--m-radius-sm); background: var(--m-color-danger-solid); color: var(--m-color-danger-on-solid); ${xs}; ${black}">New</span></div>`;

// The composer: a formatting bar inside on top, the text, then the tools and the green split send
const fmt = (paths: string, label: string) =>
  `<button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="${label}" style="${subtle}; block-size: 1.75rem; inline-size: 1.75rem">${icon(paths, 16)}</button>`;
const bar = `<span aria-hidden="true" style="align-self: center; block-size: 1.25rem; border-inline-start: ${hair}; margin-inline: var(--m-space-1)"></span>`;
const composer = (id: string, placeholder: string, compact = false) => `<form class="m-composer" style="gap: var(--m-space-1); padding: 0">
            <div class="m-cluster" data-gap="0" role="toolbar" aria-label="Formatting" style="padding: var(--m-space-1); border-start-start-radius: var(--m-radius-md); border-start-end-radius: var(--m-radius-md); background: var(--m-color-bg-sunken)">${fmt(I.bold, 'Bold')}${fmt(I.italic, 'Italic')}${fmt(I.strikethrough, 'Strikethrough')}${bar}${fmt(I.link, 'Link')}${bar}${fmt(I.listOrdered, 'Numbered list')}${fmt(I.list, 'Bulleted list')}${compact ? '' : `${bar}${fmt(I.textQuote, 'Quote')}${bar}${fmt(I.code, 'Code')}${fmt(I.squareCode, 'Code block')}`}</div>
            <label class="m-sr-only" for="${id}">${placeholder}</label>
            <textarea class="m-composer-input" id="${id}" rows="1" placeholder="${placeholder}" style="padding-inline: var(--m-space-3)"></textarea>
            <div class="m-composer-actions" style="padding: 0 var(--m-space-2) var(--m-space-2)">
              <button type="button" class="m-button" data-size="sm" data-icon-only aria-label="Attach" style="border-radius: 9999px; block-size: 1.75rem; inline-size: 1.75rem">${icon(I.plus, 16)}</button>
              ${fmt(I.type, 'Show formatting')}${fmt(I.smile, 'Emoji')}${fmt(I.atSign, 'Mention someone')}${compact ? '' : `${bar}${fmt(I.video, 'Record a clip')}${fmt(I.mic, 'Record audio')}${bar}${fmt(I.squareSlash, 'Run a shortcut')}`}
              <span class="m-composer-spacer"></span>
              <span class="m-cluster" data-gap="0" style="flex-wrap: nowrap"><button type="submit" class="m-button" data-variant="primary" data-size="sm" data-icon-only aria-label="Send now" style="border-start-end-radius: 0; border-end-end-radius: 0; block-size: 1.75rem">${icon(I.sendHorizontal, 16)}</button><button type="button" class="m-button" data-variant="primary" data-size="sm" data-icon-only aria-label="Schedule for later" style="border-start-start-radius: 0; border-end-start-radius: 0; block-size: 1.75rem; inline-size: 1.5rem; box-shadow: inset 0.0625rem 0 0 var(--m-color-accent-hover)">${icon(I.chevronDown, 14)}</button></span>
            </div>
          </form>`;

// An app's message laid out in blocks: a bold title, two columns of fields, a pair of buttons
const appCard = `<div class="m-stack" data-gap="2" style="margin-block-start: var(--m-space-1); padding-inline-start: var(--m-space-3); border-inline-start: 0.25rem solid var(--m-color-border-default)">
              <p style="${black}">Wind backing south-west by 14:00</p>
              <div class="m-grid" style="--m-layout-grid-min: 9rem; --m-layout-grid-gap: var(--m-space-2) var(--m-space-6); max-inline-size: 26rem">
                <div><p style="${black}">Gusts</p><p>28 knots at the point</p></div>
                <div><p style="${black}">Swell</p><p>1.6 m, period 7 s</p></div>
                <div><p style="${black}">Affects</p><p>14:20 and 15:05 sailings</p></div>
                <div><p style="${black}">Review by</p><p>12:30 today</p></div>
              </div>
              <div class="m-cluster" data-gap="2"><button type="button" class="m-button" data-variant="primary" data-size="sm">Acknowledge</button><button type="button" class="m-button" data-size="sm">Open forecast</button></div>
            </div>`;
const appTag = `<span class="m-badge" style="align-self: center">App</span>`;

// A shared file: an icon tile, the name in Bold and the kind under it, in a 12px-cornered card
const fileCard = (name: string, kind: string) =>
  `<a href="#" class="m-card m-cluster" data-gap="3" style="flex-direction: row; align-items: center; justify-content: flex-start; text-align: start; flex-wrap: nowrap; inline-size: min(22rem, 100%); margin-block-start: var(--m-space-1); padding: var(--m-space-3); text-decoration: none; ${ink}"><span style="display: grid; place-items: center; inline-size: 2.5rem; block-size: 2.5rem; border-radius: var(--m-radius-md); background: var(--m-color-danger-solid); color: var(--m-color-danger-on-solid); flex: none">${icon(I.fileText, 20)}</span><span class="m-stack" data-gap="0" style="min-inline-size: 0"><span style="${black}">${name}</span><span style="${sm}; ${muted}">${kind}</span></span></a>`;

// The thread pane on the right: its title, the room under it, close; the parent, a reply count rule, the replies
const threadPane = `    <aside aria-labelledby="tr-thread" style="flex: 1 1 22rem; max-inline-size: 100%; display: flex; flex-direction: column; border-inline-start: ${hair}">
      <header class="m-cluster" data-justify="between" style="min-block-size: 3.25rem; padding: var(--m-space-2) var(--m-space-3) var(--m-space-2) var(--m-space-5); border-block-end: ${hair}; flex-wrap: nowrap">
        <span class="m-cluster" data-gap="2" style="align-items: baseline"><h2 id="tr-thread" style="font-size: var(--m-font-size-lg)">Thread</h2><span style="${sm}; ${muted}"># north-crossing</span></span>
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Close the thread">${icon(I.x, 18)}</button>
      </header>
      <div class="m-chat" data-variant="flat" role="log" aria-label="Thread" style="flex: 1; gap: 0; padding-block: var(--m-space-2)">
${msg('LO', 3, 'Lucía Ortega', '07:51', [`${mention('Mae Okafor', true)} can you confirm the vehicle deck count for the 10:40? Two hauliers rang ahead.`])}
        <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding: var(--m-space-1) var(--m-space-5); ${sm}; ${muted}"><span>3 replies</span><span style="flex: 1; border-block-start: ${hair}"></span></div>
${msg('MO', 2, 'Mae Okafor', '07:58', ['31 cars and 4 vans booked. With the hauliers we’re at 38 of 42 lanes.'])}
${msg('HG', 1, 'Hollis Grant', '08:02', ['Hold the last two lanes for the doctor’s car and the bread run, please.'], reactions(reaction('👍', 2, true, 'Thumbs up')))}
${msg('LO', 3, 'Lucía Ortega', '08:05', ['Done. Closing bookings at 38.'])}
      </div>
      <div class="m-stack" data-gap="2" style="padding: 0 var(--m-space-5) var(--m-space-5)">
        ${composer('tr-reply', 'Reply…', true)}
        <label class="m-cluster" data-gap="2" style="${sm}"><input class="m-checkbox" type="checkbox"> Also send to <span style="${black}"># north-crossing</span></label>
      </div>
    </aside>`;

const dashboard = frame(
  'rooms',
  'Bellwether Ferries',
  `${channelList('north-crossing')}
    <main style="flex: 999 1 28rem; min-inline-size: 0; display: flex; flex-direction: column">
${channelHeader(
  'north-crossing',
  [
    [I.messageCircle, 'Messages'],
    [I.calendarDays, 'Timetable'],
    [I.clipboardList, 'Checklists'],
  ],
  0,
)}
      <div class="m-chat" data-variant="flat" role="log" aria-label="Messages in north-crossing" style="flex: 1; gap: 0; padding-block-end: var(--m-space-2)">
        ${dateDivider('Today')}
${msg('HG', 1, 'Hollis Grant', '07:42', ['Morning all. The 08:15 is loading on time and the swell is under a metre past the point.'], reactions(reaction('⛴️', 4, false, 'Ferry') + reaction('👀', 1, true, 'Eyes')))}
${msg('LO', 3, 'Lucía Ortega', '07:51', [`${mention('Mae Okafor', true)} can you confirm the vehicle deck count for the 10:40? Two hauliers rang ahead.`], replies([['MO', 2], ['HG', 1]], '3 replies', 'Last reply 4 minutes ago'), 'background: var(--m-color-warning-bg); box-shadow: inset 0.1875rem 0 0 var(--m-color-warning-solid)')}
${msg('DR', 0, 'Dev Ramaswamy', '08:03', [`Updated deck plan for the Kelso run, with the new ramp markings. ${mention('Hollis Grant')} for sign-off.`], fileCard('Kelso deck plan, rev 6.pdf', 'PDF · 2 pages'))}
        ${newLine}
${msg('TT', 1, 'Tide Table', '08:10', [], appCard, '', appTag)}
      </div>
      <div style="padding: 0 var(--m-space-5) var(--m-space-5)">
        ${composer('tr-msg', 'Message #north-crossing')}
      </div>
    </main>
${threadPane}`,
);

// ---- List and detail: the crew directory, with a profile pane ----

const pageHeader = (title: string, actions: string) => `      <header class="m-cluster" data-justify="between" style="min-block-size: 3.25rem; padding: var(--m-space-2) var(--m-space-3) var(--m-space-2) var(--m-space-5); border-block-end: ${hair}; flex-wrap: nowrap">
        <h1 style="font-size: var(--m-font-size-lg)">${title}</h1>
        <span class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${actions}</span>
      </header>`;

const crewRow = (initials: string, n: number, name: string, role: string, base: string, status: string, presence: Presence, selected = false) =>
  `            <tr${selected ? ' aria-selected="true" style="background: var(--m-color-accent-subtle)"' : ''}>
              <td><a href="#" class="m-cluster" data-gap="3" style="flex-wrap: nowrap; text-decoration: none; ${ink}">${person(initials, n, '2.25rem', presence, selected ? 'var(--m-color-accent-subtle)' : 'var(--m-color-bg-canvas)')}<span class="m-stack" data-gap="0"><span style="${black}">${name}</span><span style="${sm}; ${muted}">${role}</span></span></a></td>
              <td style="${muted}">${base}</td>
              <td>${status}</td>
              <td style="text-align: end"><button type="button" class="m-button" data-size="sm">Message</button></td>
            </tr>`;
const onShift = (label: string) => `<span class="m-cluster" data-gap="1" style="${sm}; flex-wrap: nowrap"><span aria-hidden="true" style="inline-size: 0.5rem; block-size: 0.5rem; border-radius: 9999px; background: var(--m-color-success-solid)"></span>${label}</span>`;
const offShift = (label: string) => `<span style="${sm}; ${muted}">${label}</span>`;

const detailRow = (label: string, value: string) =>
  `<div class="m-stack" data-gap="0"><span style="${sm}; ${black}">${label}</span><span>${value}</span></div>`;

const listDetail = frame(
  'crew',
  'Bellwether Ferries',
  `${channelList('')}
    <main style="flex: 999 1 28rem; min-inline-size: 0; display: flex; flex-direction: column">
${pageHeader('Crew', `<button type="button" class="m-button" data-size="sm">${icon(I.userPlus, 16)} Invite crew</button>`)}
      <div class="m-stack" data-gap="4" style="padding: var(--m-space-4) var(--m-space-5)">
        <label class="m-cluster" data-gap="2" style="flex-wrap: nowrap; block-size: 2.5rem; padding-inline: var(--m-space-3); border: var(--m-border-width-thin) solid var(--m-color-border-strong); border-radius: var(--m-radius-md); ${muted}">${icon(I.search, 18)}<input type="search" placeholder="Search by name, role or depot" aria-label="Search crew" style="flex: 1; min-inline-size: 0; border: 0; background: none; outline: none; font: inherit; ${ink}"></label>
        <div class="m-cluster" data-gap="2">
          <select class="m-select" data-size="sm" aria-label="Role" style="inline-size: auto"><option>Any role</option><option>Skippers</option><option>Deckhands</option><option>Engineers</option></select>
          <select class="m-select" data-size="sm" aria-label="Depot" style="inline-size: auto"><option>Kelso depot</option><option>Morrow yard</option></select>
          <select class="m-select" data-size="sm" aria-label="Shift" style="inline-size: auto"><option>On shift now</option><option>Everyone</option></select>
          <span style="margin-inline-start: auto; ${sm}; ${muted}">14 people</span>
        </div>
        <div class="m-table-wrap">
          <table class="m-table">
            <thead><tr><th scope="col">Name</th><th scope="col">Depot</th><th scope="col">Shift</th><th scope="col"><span class="m-sr-only">Actions</span></th></tr></thead>
            <tbody>
${crewRow('HG', 1, 'Hollis Grant', 'Skipper', 'Kelso', onShift('Until 16:00'), 'active', true)}
${crewRow('LO', 3, 'Lucía Ortega', 'Booking desk', 'Kelso', onShift('Until 14:30'), 'active')}
${crewRow('DR', 0, 'Dev Ramaswamy', 'Marine engineer', 'Morrow', offShift('Back Thursday'), 'away')}
${crewRow('EP', 4, 'Ezra Penhale', 'Deckhand', 'Kelso', onShift('Until 18:00'), 'active')}
${crewRow('SB', 2, 'Sunniva Berg', 'Mate', 'Morrow', offShift('Starts 19:00'), 'away')}
${crewRow('TW', 1, 'Tomasz Wilk', 'Deckhand', 'Morrow', onShift('Until 20:00'), 'active')}
            </tbody>
          </table>
        </div>
        <button type="button" class="m-button" data-variant="ghost" style="align-self: center; ${link}">Show 8 more</button>
      </div>
    </main>
    <aside aria-labelledby="tr-profile" style="flex: 1 1 22rem; max-inline-size: 100%; display: flex; flex-direction: column; border-inline-start: ${hair}">
      <header class="m-cluster" data-justify="between" style="min-block-size: 3.25rem; padding: var(--m-space-2) var(--m-space-3) var(--m-space-2) var(--m-space-5); border-block-end: ${hair}; flex-wrap: nowrap">
        <h2 style="font-size: var(--m-font-size-lg)">Profile</h2>
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Close the profile">${icon(I.x, 18)}</button>
      </header>
      <div class="m-stack" data-gap="4" style="padding: var(--m-space-5)">
        <span class="m-avatar" aria-hidden="true" style="inline-size: 100%; max-inline-size: 15rem; block-size: auto; aspect-ratio: 1; align-self: center; border-radius: var(--m-radius-lg); background: var(--m-color-info-solid); font-size: var(--m-font-size-4xl)">HG</span>
        <div class="m-stack" data-gap="1">
          <h3 id="tr-profile-name" style="font-size: var(--m-font-size-xl)">Hollis Grant</h3>
          <p>Skipper, north crossing</p>
          <p class="m-cluster" data-gap="2" style="${muted}"><span aria-hidden="true" style="inline-size: 0.625rem; block-size: 0.625rem; border-radius: 9999px; background: var(--m-color-success-solid)"></span>On the bridge until 16:00</p>
          <p class="m-cluster" data-gap="2" style="${muted}">${icon(I.clock, 16)} 09:24 local time</p>
        </div>
        <div class="m-cluster" data-gap="2">
          <button type="button" class="m-button" data-size="sm">${icon(I.messageCircle, 16)} Message</button>
          <button type="button" class="m-button" data-size="sm">${icon(I.calendarDays, 16)} View rota</button>
          <button type="button" class="m-button" data-size="sm" data-icon-only aria-label="More for Hollis Grant">${icon(I.ellipsisVertical, 16)}</button>
        </div>
        <div class="m-stack" data-gap="3" style="padding-block-start: var(--m-space-4); border-block-start: ${hair}">
          <h4 style="${md}">Contact</h4>
          ${detailRow('Radio call sign', 'Bellwether Two')}
          ${detailRow('Email', `<a href="#" style="${link}">hollis@bellwether.example</a>`)}
        </div>
        <div class="m-stack" data-gap="3" style="padding-block-start: var(--m-space-4); border-block-start: ${hair}">
          <h4 style="${md}">Tickets and checks</h4>
          ${detailRow('Master’s ticket', 'Valid until March 2029')}
          ${detailRow('Sea survival', `<span class="m-badge" data-tone="warning">Renew by 12 Dec</span>`)}
        </div>
      </div>
    </aside>`,
);

// ---- Onboarding: setting up a workspace ----

const ghostRow = (w: string) =>
  `<li style="position: relative; block-size: 0.75rem; inline-size: ${w}; margin-block: 0.4375rem; border-radius: 9999px">${veil(0.22, '9999px')}</li>`;
const onboarding = `<div style="min-block-size: 100vh; display: grid; grid-template-columns: 4.5rem minmax(0, 1fr); grid-template-rows: auto 1fr; background: var(--m-color-brand-default)">
  ${topBar('Bellwether Ferries')}
  <nav aria-label="Workspace" style="grid-row: 2; display: flex; flex-direction: column; align-items: center; padding-block: var(--m-space-2)">
    <span aria-hidden="true" style="display: grid; place-items: center; inline-size: 2.25rem; block-size: 2.25rem; border-radius: var(--m-radius-md); background: var(--m-color-brand-fg); color: var(--m-color-brand-default); ${black}; ${sm}">BF</span>
  </nav>
  <div style="grid-row: 2; display: flex; flex-wrap: wrap; margin: 0 var(--m-space-1) var(--m-space-1) 0; border-radius: var(--m-radius-md); overflow: hidden; background: var(--m-color-bg-canvas)">
    <aside class="m-sidebar" aria-label="Preview of your workspace" style="flex: 1 1 16.25rem; max-inline-size: 100%; inline-size: auto">
      <p style="padding: var(--m-space-3) var(--m-space-4); ${onBrand}; font-size: var(--m-font-size-lg); ${black}">Bellwether Ferries</p>
      <ul style="padding-inline: var(--m-space-4)">${ghostRow('70%')}${ghostRow('55%')}${ghostRow('62%')}</ul>
      <div class="m-sidebar-section"><h2 class="m-sidebar-heading">Routes</h2><ul>
        <li><span class="m-sidebar-link" style="color: var(--m-sidebar-link-hover-fg); ${black}">${icon(I.hash, 18)} north-crossing</span></li>
        <li><span class="m-sidebar-link">${icon(I.hash, 18)} everyone</span></li>
      </ul></div>
      <div class="m-sidebar-section"><h2 class="m-sidebar-heading">On shift now</h2><ul style="padding-inline: var(--m-space-4)">${ghostRow('48%')}${ghostRow('58%')}</ul></div>
    </aside>
    <main style="flex: 999 1 28rem; min-inline-size: 0; padding: clamp(2rem, 6vw, 5rem) clamp(1.25rem, 6vw, 5rem)">
      <form class="m-stack" data-gap="6" style="max-inline-size: 36rem" aria-labelledby="tr-onb-title">
        <p style="${sm}; ${muted}">Step 2 of 3</p>
        <div class="m-stack" data-gap="3">
          <h1 id="tr-onb-title" style="font-size: var(--m-font-size-4xl); line-height: var(--m-font-leading-tight); letter-spacing: var(--m-font-tracking-tight)">Which route should your crew talk about first?</h1>
          <p style="font-size: var(--m-font-size-lg); ${muted}">It becomes your first room: a place for everything about that route, from loading counts to the weather.</p>
        </div>
        <div class="m-field">
          <label class="m-field-label m-sr-only" for="tr-onb-route">Route name</label>
          <div style="position: relative"><input class="m-input" id="tr-onb-route" value="north-crossing" maxlength="80" aria-describedby="tr-onb-hint" style="font-size: var(--m-font-size-lg); block-size: 3rem; padding-inline-end: 3rem"><span style="position: absolute; inset-inline-end: var(--m-space-3); inset-block-start: 50%; translate: 0 -50%; ${sm}; ${subtle}">66</span></div>
          <p class="m-field-hint" id="tr-onb-hint">Lowercase, no spaces. You can rename it later.</p>
        </div>
        <fieldset class="m-stack" data-gap="2" style="border: 0; padding: 0; margin: 0">
          <legend style="${bold}; margin-block-end: var(--m-space-2)">Start it with</legend>
          <label class="m-cluster" data-gap="2"><input class="m-checkbox" type="checkbox" checked> A pinned timetable</label>
          <label class="m-cluster" data-gap="2"><input class="m-checkbox" type="checkbox" checked> A daily loading checklist</label>
          <label class="m-cluster" data-gap="2"><input class="m-checkbox" type="checkbox"> Weather alerts from the coastguard feed</label>
        </fieldset>
        <div class="m-cluster" data-gap="3">
          <button type="submit" class="m-button" data-variant="primary" data-size="lg">Next</button>
          <button type="button" class="m-button" data-variant="ghost" data-size="lg" style="${link}">Skip this step</button>
        </div>
      </form>
    </main>
  </div>
</div>`;

// ---- Settings: the preferences panel ----

const prefLink = (paths: string, label: string, current = false, badge = '') =>
  `          <li><a class="m-sidebar-link" href="#"${current ? ' aria-current="page"' : ''}>${icon(paths, 18)} ${label}${badge}</a></li>`;
const choice = (paths: string, label: string, on = false) =>
  `<label style="flex: 1 1 9rem; display: flex; align-items: center; justify-content: center; gap: var(--m-space-2); block-size: 2.75rem; border-radius: var(--m-radius-md); border: ${on ? '0.125rem solid var(--m-color-accent-text)' : 'var(--m-border-width-thin) solid var(--m-color-border-strong)'}; ${bold}; cursor: pointer"><input class="m-sr-only" type="radio" name="tr-density"${on ? ' checked' : ''}>${icon(paths, 18)} ${label}</label>`;
const prefCheck = (label: string, hint: string, on = true) =>
  `<label class="m-cluster" data-gap="3" style="align-items: flex-start; flex-wrap: nowrap"><input class="m-checkbox" type="checkbox"${on ? ' checked' : ''} style="margin-block-start: 0.1875rem"><span class="m-stack" data-gap="0"><span>${label}</span>${hint ? `<span style="${sm}; ${muted}">${hint}</span>` : ''}</span></label>`;

const settings = `<div style="min-block-size: 100vh; display: grid; place-items: start center; padding: clamp(0.5rem, 4vw, 3rem) clamp(0.5rem, 4vw, 3rem); background: var(--m-color-brand-default)">
  <section role="dialog" aria-modal="true" aria-labelledby="tr-pref-title" style="inline-size: min(60rem, 100%); border-radius: var(--m-radius-lg); background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-overlay); overflow: hidden">
    <header class="m-cluster" data-justify="between" style="padding: var(--m-space-5) var(--m-space-5) var(--m-space-4) var(--m-space-6); border-block-end: ${hair}; flex-wrap: nowrap">
      <h1 id="tr-pref-title" style="font-size: var(--m-font-size-xl)">Preferences</h1>
      <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Close">${icon(I.x, 20)}</button>
    </header>
    <div style="display: flex; flex-wrap: wrap">
      <nav class="m-sidebar" aria-label="Preferences" style="flex: 1 1 14rem; max-inline-size: 100%; inline-size: auto; padding: var(--m-space-4) var(--m-space-3); --m-sidebar-bg: var(--m-color-bg-surface); --m-sidebar-link-fg: var(--m-color-fg-default); --m-sidebar-link-hover-fg: var(--m-color-fg-default); --m-sidebar-link-hover-bg: var(--m-color-bg-sunken); --m-sidebar-link-padding-x: var(--m-space-3); --m-sidebar-link-padding-y: 0.3125rem">
        <ul>
${prefLink(I.clock, 'Shift hours')}
${prefLink(I.volume2, 'Sounds')}
${prefLink(I.monitor, 'Display', true)}
${prefLink(I.waves, 'On the water', false, ' <span class="m-badge" data-tone="info">New</span>')}
${prefLink(I.keyboard, 'Keyboard')}
${prefLink(I.laptop, 'Sign-in and devices')}
${prefLink(I.wifiOff, 'Data saver')}
        </ul>
      </nav>
      <div class="m-stack" data-gap="6" style="flex: 999 1 26rem; min-inline-size: 0; padding: var(--m-space-5) var(--m-space-6) var(--m-space-8)">
        <section class="m-stack" data-gap="4" aria-labelledby="tr-pref-msgs">
          <h2 id="tr-pref-msgs" style="font-size: var(--m-font-size-md)">Messages</h2>
          <p>How much fits on the screen. Compact suits the small tablets on the bridge.</p>
          <div class="m-cluster" data-gap="3" role="radiogroup" aria-labelledby="tr-pref-msgs">${choice(I.messageSquare, 'Roomy', true)}${choice(I.list, 'Compact')}</div>
          ${prefCheck('Show faces beside messages', 'Turn this off for a denser list on small screens.')}
          ${prefCheck('Show times as 24-hour', '')}
          ${prefCheck('Show a preview of shared files', 'Large files on the water only load when you tap them.', false)}
        </section>
        <section class="m-stack" data-gap="4" aria-labelledby="tr-pref-look" style="padding-block-start: var(--m-space-6); border-block-start: ${hair}">
          <h2 id="tr-pref-look" style="font-size: var(--m-font-size-md)">Look</h2>
          <div class="m-grid" style="--m-layout-grid-min: 14rem; --m-layout-grid-gap: var(--m-space-4)">
            <div class="m-field">
              <label class="m-field-label" for="tr-pref-size">Text size</label>
              <select class="m-select" id="tr-pref-size"><option>Standard (15px)</option><option>Large (17px)</option><option>Extra large (19px)</option></select>
            </div>
            <div class="m-field">
              <label class="m-field-label" for="tr-pref-mode">Light or dark</label>
              <select class="m-select" id="tr-pref-mode"><option>Follow this device</option><option>Always light</option><option>Always dark</option></select>
              <p class="m-field-hint">Dark switches on by itself after sunset on night crossings.</p>
            </div>
          </div>
        </section>
        <section class="m-stack" data-gap="3" aria-labelledby="tr-pref-quiet" style="padding-block-start: var(--m-space-6); border-block-start: ${hair}">
          <h2 id="tr-pref-quiet" style="font-size: var(--m-font-size-md)">Quiet sidebar</h2>
          <label class="m-cluster" data-justify="between" style="flex-wrap: nowrap; gap: var(--m-space-4)"><span class="m-stack" data-gap="0"><span>Only show rooms with something new</span><span style="${sm}; ${muted}">Starred rooms stay put either way.</span></span><input class="m-switch" type="checkbox" role="switch" checked></label>
        </section>
      </div>
    </div>
  </section>
</div>`;

// ---- Empty state: no handovers yet ----

const emptyState = frame(
  'rooms',
  'Bellwether Ferries',
  `${channelList('handovers')}
    <main style="flex: 999 1 28rem; min-inline-size: 0; display: flex; flex-direction: column">
${pageHeader(
  'Handovers',
  `<div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Show"><button type="button" class="m-tab" role="tab" aria-selected="true">For you</button><button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Sent</button><button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Done</button></div></div>`,
)}
      <div class="m-stack" data-gap="4" style="flex: 1; align-items: center; justify-content: center; padding: var(--m-space-12) var(--m-space-6); text-align: center">
        <span aria-hidden="true" style="display: grid; place-items: center; inline-size: 6rem; block-size: 6rem; border-radius: var(--m-radius-lg); background: var(--m-color-brand-subtle); color: var(--m-color-brand-default)">${icon(I.clipboardList, 44)}</span>
        <div class="m-stack" data-gap="2" style="max-inline-size: 26rem; align-items: center">
          <h2 style="font-size: var(--m-font-size-xl)">No handovers waiting</h2>
          <p style="${muted}">When the last shift writes you a handover, it lands here with its checklist. Write one for the next crew before you go ashore.</p>
        </div>
        <div class="m-cluster" data-gap="2" style="justify-content: center">
          <button type="button" class="m-button" data-variant="primary">Write a handover</button>
          <button type="button" class="m-button">See a sample</button>
        </div>
      </div>
    </main>`,
);

// ---- Pricing: the marketing page ----

const tick = `<span style="display: inline-flex; color: var(--m-color-brand-default)">${icon(I.check, 16)}</span>`;
const dash = `<span style="display: inline-flex; ${subtle}">${icon('<path d="M5 12h14"/>', 16)}</span>`;
const feature = (on: boolean, text: string) =>
  `<li class="m-cluster" data-gap="2" style="flex-wrap: nowrap; align-items: flex-start; ${sm}${on ? '' : `; ${subtle}`}">${on ? tick : dash}<span>${text}</span></li>`;
const capsButton = (label: string, filled: boolean) =>
  `<a href="#" class="m-button" style="inline-size: 100%; block-size: 3rem; border-radius: var(--m-radius-sm); text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide); ${sm}; ${black}; ${filled ? 'background: var(--m-color-brand-default); color: var(--m-color-brand-fg); border-color: var(--m-color-brand-default)' : 'background: var(--m-color-bg-canvas); color: var(--m-color-brand-default); border-color: var(--m-color-brand-default)'}">${label}</a>`;
const plan = (id: string, name: string, line: string, price: string, per: string, button: string, filled: boolean, features: [boolean, string][], featured = false) => `        <section aria-labelledby="tr-plan-${id}" class="m-stack" data-gap="4" style="position: relative; flex: 1 1 13rem; padding: var(--m-space-6) var(--m-space-4); ${featured ? 'z-index: 1; margin: -0.125rem 0; border: 0.125rem solid var(--m-color-brand-default); border-radius: 0 0 var(--m-radius-md) var(--m-radius-md); background: var(--m-color-bg-canvas)' : `border-inline-start: ${hair}`}">
          ${featured ? `<p style="position: absolute; inset-inline: -0.125rem; inset-block-end: 100%; padding: var(--m-space-1); border-radius: var(--m-radius-md) var(--m-radius-md) 0 0; background: var(--m-color-brand-default); color: var(--m-color-brand-fg); text-align: center; ${xs}; ${black}; letter-spacing: var(--m-font-tracking-wide); text-transform: uppercase">Most picked</p>` : ''}
          <div class="m-stack" data-gap="1" style="min-block-size: 3.5rem"><h3 id="tr-plan-${id}" style="font-size: var(--m-font-size-lg); ${bold}">${name}</h3><p style="${sm}">${line}</p></div>
          <div class="m-stack" data-gap="0" style="min-block-size: 4.5rem; justify-content: flex-end"><p style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-3xl); font-weight: 700; letter-spacing: var(--m-font-tracking-tight)">${price}</p><p style="${xs}; ${muted}">${per}</p></div>
          ${capsButton(button, filled)}
          <ul class="m-stack" data-gap="2" style="margin: 0; padding: 0; list-style: none">${features.map(([on, t]) => feature(on, t)).join('')}</ul>
        </section>`;
const compareRow = (label: string, cells: string[]) =>
  `<tr><th scope="row" style="${bold}">${label}</th>${cells.map((c) => `<td style="text-align: center">${c === 'y' ? `<span role="img" aria-label="Included" style="display: inline-flex; color: var(--m-color-brand-default)">${icon(I.check, 18)}</span>` : c === 'n' ? `<span role="img" aria-label="Not included" style="display: inline-flex; ${subtle}">${icon('<path d="M5 12h14"/>', 18)}</span>` : c}</td>`).join('')}</tr>`;

const pricing = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  <nav class="m-navbar" aria-label="Main">
    <a class="m-navbar-brand m-cluster" data-gap="2" href="#" style="flex-wrap: nowrap; font-size: var(--m-font-size-xl); ${black}; letter-spacing: var(--m-font-tracking-tight); text-transform: lowercase"><span aria-hidden="true" style="display: grid; place-items: center; inline-size: 1.75rem; block-size: 1.75rem; border-radius: var(--m-radius-md); background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">${icon(I.anchor, 18)}</span>quaypost</a>
    <div class="m-navbar-nav"><a class="m-navbar-link" href="#">Why quaypost ${icon(I.chevronDown, 14)}</a><a class="m-navbar-link" href="#">For crews ${icon(I.chevronDown, 14)}</a><a class="m-navbar-link" href="#">Guides</a><a class="m-navbar-link" href="#" aria-current="page">Plans</a></div>
    <div class="m-navbar-actions"><a class="m-navbar-link" href="#">Sign in</a><a href="#" class="m-button" data-size="sm" style="border-radius: var(--m-radius-sm); text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide); ${xs}; ${black}; color: var(--m-color-brand-default); border-color: var(--m-color-brand-default)">Talk to us</a><a href="#" class="m-button" data-size="sm" style="border-radius: var(--m-radius-sm); text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide); ${xs}; ${black}; background: var(--m-color-brand-default); color: var(--m-color-brand-fg); border-color: var(--m-color-brand-default)">Try it free</a></div>
  </nav>
  <main class="m-container" style="padding-block: var(--m-space-12) var(--m-space-16)">
    <div class="m-stack" data-gap="10">
      <header class="m-stack" data-gap="3" style="align-items: center; text-align: center">
        <h1 style="font-family: var(--m-font-family-display); font-size: clamp(2rem, 5vw, var(--m-font-size-4xl)); font-weight: 700; line-height: 1.12; letter-spacing: -0.012em">Plans that sail with your crew.</h1>
        <p style="font-size: var(--m-font-size-lg)">Start free on one route. Add depots, vessels and people as you grow.</p>
      </header>
      <div style="display: flex; flex-wrap: wrap; margin-block-start: var(--m-space-6); border: ${hair}; border-radius: var(--m-radius-md)">
${plan('deckhand', 'Deckhand', 'For one boat and its crew', '£0', 'free, for up to 12 people', 'Start free', false, [
  [true, '90 days of messages'],
  [true, 'Rooms for 3 routes'],
  [true, 'Rota for one depot'],
  [false, 'Weather and tide alerts'],
  [false, 'Offline mode on the water'],
])}
${plan('crew', 'Crew', 'For a small fleet', '£5.40', 'per person / month, paid yearly', 'Choose Crew', false, [
  [true, 'Every message, kept'],
  [true, 'Unlimited routes and depots'],
  [true, 'Shift swaps and handovers'],
  [true, 'Weather and tide alerts'],
  [false, 'Offline mode on the water'],
])}
${plan('bridge', 'Bridge', 'For operators running daily timetables', '£9.80', 'per person / month, paid yearly', 'Choose Bridge', true, [
  [true, 'Everything in Crew'],
  [true, 'Offline mode on the water'],
  [true, 'Ticket and check reminders'],
  [true, 'Single sign-on'],
  [true, 'Priority help, 7 days'],
], true)}
${plan('admiralty', 'Admiralty', 'For ports and multi-operator groups', 'Let’s talk', 'priced for your fleet', 'Contact us', false, [
  [true, 'Everything in Bridge'],
  [true, 'Shared rooms with partner operators'],
  [true, 'Audit log and retention rules'],
  [true, 'Your own data region'],
  [true, 'A named onboarding lead'],
])}
      </div>
      <section class="m-stack" data-gap="4" aria-labelledby="tr-compare">
        <h2 id="tr-compare" style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-3xl); font-weight: 700; text-align: center">Compare every plan</h2>
        <div class="m-table-wrap" style="border: 0; border-radius: 0">
          <table class="m-table">
            <thead><tr><th scope="col"><span class="m-sr-only">Feature</span></th><th scope="col" style="text-align: center">Deckhand</th><th scope="col" style="text-align: center">Crew</th><th scope="col" style="text-align: center">Bridge</th><th scope="col" style="text-align: center">Admiralty</th></tr></thead>
            <tbody>
              ${compareRow('Message history', ['90 days', 'y', 'y', 'y'])}
              ${compareRow('Routes and depots', ['3 routes', 'y', 'y', 'y'])}
              ${compareRow('Weather and tide alerts', ['n', 'y', 'y', 'y'])}
              ${compareRow('Offline mode', ['n', 'n', 'y', 'y'])}
              ${compareRow('Partner rooms', ['n', 'n', 'n', 'y'])}
            </tbody>
          </table>
        </div>
      </section>
      <section class="m-stack" data-gap="4" aria-labelledby="tr-faq" style="max-inline-size: 48rem; inline-size: 100%; margin-inline: auto">
        <h2 id="tr-faq" style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-3xl); font-weight: 700; text-align: center">Questions</h2>
        <div class="m-accordion">
          <details class="m-accordion-item" name="tr-faq" open><summary>Do seasonal crew count all year?</summary><div class="m-accordion-content">No. You pay for the months someone can sign in; switch them off when the season ends and their history stays.</div></details>
          <details class="m-accordion-item" name="tr-faq"><summary>Can we try Bridge before we buy?</summary><div class="m-accordion-content">Yes. Every new workspace gets 30 days of Bridge, then moves to Deckhand unless you choose a plan.</div></details>
          <details class="m-accordion-item" name="tr-faq"><summary>What happens with no signal at sea?</summary><div class="m-accordion-content">On Bridge and Admiralty, messages you write are kept on the device and sent as soon as you’re back in range.</div></details>
        </div>
      </section>
    </div>
  </main>
</div>`;

// ---- Errors: in a field, a form, a banner, a toast and a whole page ----

const errors = frame(
  'rooms',
  'Bellwether Ferries',
  `${channelList('')}
    <main style="flex: 999 1 28rem; min-inline-size: 0; display: flex; flex-direction: column">
${pageHeader('Things that go wrong', '')}
      <div class="m-stack" data-gap="8" style="padding: var(--m-space-6) var(--m-space-5) var(--m-space-12); max-inline-size: 46rem">
        <section class="m-stack" data-gap="4" aria-labelledby="tr-err-form">
          <h2 id="tr-err-form" style="font-size: var(--m-font-size-lg)">Add a route</h2>
          <div class="m-alert" data-tone="danger" role="alert">
            <span class="m-alert-icon">${icon(I.circleAlert, 20)}</span>
            <div class="m-alert-content"><div class="m-alert-title">The route wasn’t added</div><div class="m-alert-body">Two things need a look before we can create it.</div></div>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="tr-err-name">Name</label>
            <input class="m-input" id="tr-err-name" value="North Crossing!" aria-invalid="true" aria-describedby="tr-err-name-e">
            <p class="m-field-error m-cluster" data-gap="1" id="tr-err-name-e">${icon(I.circleAlert, 14)} Use lowercase letters, numbers and hyphens only.</p>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="tr-err-depot">Home depot</label>
            <select class="m-select" id="tr-err-depot" aria-invalid="true" aria-describedby="tr-err-depot-e"><option>Choose a depot</option><option>Kelso</option><option>Morrow</option></select>
            <p class="m-field-error m-cluster" data-gap="1" id="tr-err-depot-e">${icon(I.circleAlert, 14)} Pick the depot that crews this route.</p>
          </div>
          <div class="m-cluster" data-gap="2"><button type="button" class="m-button">Cancel</button><button type="submit" class="m-button" data-variant="primary">Create route</button></div>
        </section>
        <section class="m-stack" data-gap="3" aria-labelledby="tr-err-banner">
          <h2 id="tr-err-banner" style="font-size: var(--m-font-size-lg)">Banners over the conversation</h2>
          <div class="m-alert" data-tone="warning" role="status"><span class="m-alert-icon">${icon(I.wifiOff, 20)}</span><div class="m-alert-content"><div class="m-alert-body" style="${ink}">You’re offline. Messages you write now will send when you’re back in range.</div></div></div>
          <div class="m-alert" data-tone="info" role="status"><span class="m-alert-icon">${icon(I.info, 20)}</span><div class="m-alert-content"><div class="m-alert-body" style="${ink}"><a href="#" style="${link}; ${black}">4 people</a> in this room are from Saltire Port Authority.</div></div></div>
          <article class="m-message" data-role="user" style="column-gap: var(--m-space-2); row-gap: 0; padding: var(--m-space-2); border-radius: var(--m-radius-md); background: var(--m-color-danger-bg)">
            <span class="m-message-avatar" style="background: ${tones[2]}">MO</span>
            <div class="m-message-meta" style="gap: var(--m-space-2)"><span style="${md}; ${black}; ${ink}">Mae Okafor</span><time>09:12</time></div>
            <div class="m-message-body m-stack" data-gap="1" style="${md}"><p>Loading ramp two is sticking again, can someone from engineering look?</p><p class="m-cluster" data-gap="1" style="${sm}; color: var(--m-color-danger-fg)">${icon(I.circleAlert, 14)} Not sent. <a href="#" style="${link}; ${black}">Try again</a> or <a href="#" style="${link}; ${black}">delete it</a></p></div>
          </article>
        </section>
        <section class="m-stack" data-gap="3" aria-labelledby="tr-err-toast">
          <h2 id="tr-err-toast" style="font-size: var(--m-font-size-lg)">Toasts</h2>
          <section class="m-toast-region" data-static aria-label="Notifications" style="align-items: stretch; inline-size: min(22rem, 100%)">
            <div class="m-toast" data-tone="danger" role="alert"><div class="m-toast-content"><p class="m-toast-title m-cluster" data-gap="2" style="flex-wrap: nowrap"><span style="color: var(--m-color-danger-fg); display: inline-flex">${icon(I.circleX, 18)}</span>Couldn’t upload the deck plan</p><p class="m-toast-body">The file is over 1 GB. Try a smaller copy.</p></div><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Dismiss">${icon(I.x, 16)}</button></div>
            <div class="m-toast" data-tone="success" role="status"><div class="m-toast-content"><p class="m-toast-title m-cluster" data-gap="2" style="flex-wrap: nowrap"><span style="color: var(--m-color-success-fg); display: inline-flex">${icon(I.circleCheck, 18)}</span>Handover sent to the 14:00 crew</p></div><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Dismiss">${icon(I.x, 16)}</button></div>
          </section>
        </section>
        <section class="m-stack" data-gap="4" aria-labelledby="tr-err-pages">
          <h2 id="tr-err-pages" style="font-size: var(--m-font-size-lg)">Whole pages</h2>
          <div class="m-stack" data-gap="4" style="max-inline-size: 32rem">
            <article class="m-card m-stack" data-gap="3" style="padding: var(--m-space-8) var(--m-space-8) var(--m-space-10); border-color: transparent; border-radius: var(--m-radius-sm); box-shadow: var(--m-shadow-sm)">
              <h3 class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-3xl); letter-spacing: -0.016em; line-height: var(--m-font-leading-tight); flex-wrap: nowrap"><span style="display: inline-flex; color: var(--m-color-danger-solid)">${icon(I.triangleAlert, 28)}</span>We’ve lost the chart…</h3>
              <p style="font-size: var(--m-font-size-lg)">There’s no page at this address (error 404). Head back to <a href="#" style="${link}; text-decoration: underline">your rooms</a> or search for what you need.</p>
            </article>
            <article class="m-card m-stack" data-gap="3" style="padding: var(--m-space-8) var(--m-space-8) var(--m-space-10); border-color: transparent; border-radius: var(--m-radius-sm); box-shadow: var(--m-shadow-sm)">
              <h3 class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-3xl); letter-spacing: -0.016em; line-height: var(--m-font-leading-tight); flex-wrap: nowrap"><span style="display: inline-flex; color: var(--m-color-danger-solid)">${icon(I.triangleAlert, 28)}</span>Rough water on our side</h3>
              <p style="font-size: var(--m-font-size-lg)">Something broke while loading this (error 500). Nothing you wrote was lost. <a href="#" style="${link}; text-decoration: underline">Try again</a> in a minute.</p>
            </article>
            <article class="m-card m-stack" data-gap="3" style="padding: var(--m-space-8) var(--m-space-8) var(--m-space-10); border-color: transparent; border-radius: var(--m-radius-sm); box-shadow: var(--m-shadow-sm)">
              <h3 class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-3xl); letter-spacing: -0.016em; line-height: var(--m-font-leading-tight); flex-wrap: nowrap"><span style="display: inline-flex; color: var(--m-color-fg-muted)">${icon(I.lock, 28)}</span>Skippers only</h3>
              <p style="font-size: var(--m-font-size-lg)">This room is private (error 403). Ask <a href="#" style="${link}; text-decoration: underline">Hollis Grant</a> to add you.</p>
            </article>
          </div>
        </section>
      </div>
    </main>`,
);

export const trellisRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'The app’s home: the aubergine frame with the icon rail and search, the plum channel list (Bold unread rows, a red mention count, the blue current row), a room with its header, member stack and tabs, a date pill, message rows with reactions, a mention of you on the yellow, replies under a message, a shared file, the red new-messages line, an app message in blocks, the composer with its formatting bar and green split send, and the thread pane on the right.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'The crew directory: a search well, three filter selects and a count; a framed table of people (rounded-square faces with presence, name in Black, role under it, depot, shift with a green dot, a Message button) with the selected row on the blue tint; and the profile pane on the right with a large rounded-square face, name, title, status and local time, three buttons and label-over-value detail groups.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'Setting up a workspace: the frame with a live preview of the channel list on the left (the name and the first room filling in), and on the white panel the step, a very large Black question, one sentence, a large input with a character count and a hint, a short checklist, and Next with a quiet Skip.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'The preferences panel over the aubergine: a 12px-cornered panel with its Black title and close; a list of sections with the current one filled blue in white text and a NEW tag; on the right, choice buttons edged blue when chosen, checkboxes with hints, two selects and one switch, each section under a hairline.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'An empty view in the app: the channel list, the view’s title bar with pill filters, then a centred rounded-square icon tile on the pale brand tint, a Black title, one or two sentences and a primary with a secondary button.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The marketing page: a white navbar with a plain wordmark, links and two capitals buttons in the brand colour (outlined and filled); a centred geometric bold headline; four plans joined in one hairline frame, the featured one edged in the brand colour with a capitals label tab on top; prices in the display face, capitals buttons and tick lists; a comparison table and questions.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Every error at once, inside the app: a danger banner over a form, fields with red edges and an icon before the message, the yellow offline banner and blue info banner, a message that failed to send, toasts, and the 404, 500 and 403 pages as small white cards with a Black title after a warning icon.',
    html: errors,
  },
];
