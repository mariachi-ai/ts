import type { ArchetypeRecipe } from '../types';

/*
 * Summit's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from a made-up training app ("Trailmark"). They follow the
 * language's real screen patterns: a white 56px top bar with an orange line under the current link,
 * three columns on a cool off-white (the athlete, the feed, challenges), feed cards with a stats row of
 * big figures and small units, a token-drawn route map, achievements and a props row; the activity
 * page's left column with an orange bar, segment tables and a top-ten board; plan cards on a dark band.
 * Maps are drawn from tokens; they are placeholders, never real maps.
 */

// Lucide icons, outlined, 1.5px stroke
const icon = (paths: string, size = 20, extra = '') =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${paths}</svg>`;
const I = {
  props:
    '<path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/><path d="M7 10v12"/>',
  comment:
    '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>',
  share:
    '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  mountain: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
  timer: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
  trophy:
    '<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/>',
  medal:
    '<path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2h-.5"/>',
  award:
    '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',
  crown:
    '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>',
  run: '<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/><path d="M16 17h4"/><path d="M4 13h4"/>',
  ride: '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
  swim: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  flame: '<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/>',
  pulse:
    '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
  route:
    '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  flag: '<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/>',
  calendar:
    '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  plusCircle: '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  gear: '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
  heart:
    '<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  trend: '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  upload: '<path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
  download: '<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  pencil:
    '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  map: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
  strength:
    '<path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"/><path d="m2.5 21.5 1.4-1.4"/><path d="m20.1 3.9 1.4-1.4"/><path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"/><path d="m9.6 14.4 4.8-4.8"/>',
  watch:
    '<path d="M12 10v2.2l1.6 1"/><path d="m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05"/><path d="m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05"/><circle cx="12" cy="12" r="6"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  globe:
    '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  compass:
    '<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/>',
  bookmark:
    '<path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"/>',
  clock: '<path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/>',
  refresh:
    '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  alert:
    '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  warn: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
};

// Type: bold compact headings, small grey labels, tabular figures with small units
const num = 'font-variant-numeric: tabular-nums';
const bold = 'font-weight: var(--m-font-weight-bold); line-height: var(--m-font-leading-tight)';
const pageTitle = `${bold}; font-size: var(--m-font-size-xl)`;
const label = 'font-size: var(--m-font-size-xs); color: var(--m-color-fg-subtle)';
const meta = 'font-size: var(--m-font-size-xs); color: var(--m-color-fg-muted)';
const caps =
  'font-size: 0.6875rem; font-weight: var(--m-font-weight-semibold); text-transform: uppercase; letter-spacing: 0.04em; color: var(--m-color-fg-subtle)';
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-muted)';
const link = 'color: inherit; text-decoration: none';
const unit = (v: string, u: string) =>
  `${v}<span style="font-size: 0.6em; font-weight: var(--m-font-weight-regular); margin-inline-start: 0.12em">${u}</span>`;

// The wordmark: the app's own name in heavy capitals in the signature orange (no logo)
const wordmark = (size = 'var(--m-font-size-lg)') =>
  `<a href="#" class="m-navbar-brand" style="font-weight: 800; font-size: ${size}; letter-spacing: -0.02em; text-transform: uppercase; color: var(--m-color-brand-default); text-decoration: none">Trailmark</a>`;

// The top bar: white, 56px, links in near-black with a 2px signature-orange line under the current one
const topbar = (current: string) => {
  const links = ['Feed', 'Calendar', 'Routes', 'Crews', 'Events']
    .map(
      (l) =>
        `      <a class="m-navbar-link" href="#"${l === current ? ' aria-current="page"' : ''} style="gap: var(--m-space-1)${l === current ? '; box-shadow: inset 0 -2px 0 var(--m-color-brand-default)' : ''}">${l}${l === 'Routes' || l === 'Feed' ? ` ${icon(I.down, 14)}` : ''}</a>`,
    )
    .join('\n');
  return `<header class="m-navbar" style="padding-inline: max(var(--m-space-4), calc((100% - 76rem) / 2))">
    ${wordmark()}
    <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Search">${icon(I.search, 18)}</button>
    <nav class="m-navbar-nav" aria-label="Main">
${links}
    </nav>
    <div class="m-navbar-actions">
      <span style="position: relative; display: inline-flex">
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Notifications, 4 new" style="color: var(--m-color-fg-muted)">${icon(I.bell, 20)}</button>
        <span class="m-sidebar-count" aria-hidden="true" style="position: absolute; inset-block-start: 0; inset-inline-end: 0; font-size: 0.625rem">4</span>
      </span>
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" aria-label="Your account" style="gap: var(--m-space-1); padding-inline: var(--m-space-1)"><span class="m-avatar" data-size="sm">NH</span>${icon(I.down, 14)}</button>
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Upload or record" style="color: var(--m-color-accent-text)">${icon(I.plusCircle, 26)}</button>
    </div>
  </header>`;
};

// A placeholder map drawn from tokens: land, a park, water, a road grid and the route in orange
const map = (route: string, h = 220, label = 'Route map') =>
  `<svg viewBox="0 0 600 ${h}" width="100%" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label} (placeholder)" style="display: block; block-size: auto; background: var(--m-color-bg-sunken)">
              <path d="M0 ${h * 0.72} C 120 ${h * 0.6}, 210 ${h * 0.95}, 330 ${h * 0.82} S 520 ${h * 0.7}, 600 ${h * 0.78} L600 ${h} L0 ${h} Z" style="fill: var(--m-color-info-bg)"/>
              <path d="M380 20 C 450 10, 540 40, 560 90 C 575 130, 500 150, 440 130 C 390 115, 350 60, 380 20 Z" style="fill: var(--m-color-success-bg)"/>
              <path d="M40 30 C 90 20, 150 50, 140 90 C 130 120, 70 115, 45 90 Z" style="fill: var(--m-color-success-bg)"/>
              <g style="stroke: var(--m-color-border-default); stroke-width: 1.5; fill: none">
                <path d="M0 60 L600 40"/><path d="M0 120 L600 110"/><path d="M90 0 L120 ${h}"/><path d="M230 0 L210 ${h}"/><path d="M350 0 L370 ${h}"/><path d="M480 0 L470 ${h}"/>
              </g>
              <g style="stroke: var(--m-color-bg-surface); stroke-width: 5; fill: none"><path d="M0 170 C 150 150, 300 175, 600 150"/><path d="M290 0 C 300 80, 260 140, 280 ${h}"/></g>
              <path d="${route}" style="fill: none; stroke: var(--m-color-brand-default); stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round"/>
              <circle cx="${route.split(' ')[1]}" cy="${route.split(' ')[2]}" r="6" style="fill: var(--m-color-success-solid); stroke: var(--m-color-bg-surface); stroke-width: 2"/>
            </svg>`;
const runRoute =
  'M 150 160 C 170 120, 200 90, 250 85 S 330 70, 360 100 S 420 150, 380 175 S 280 190, 230 180 S 160 185, 150 160';
const rideRoute =
  'M 60 180 L 110 140 C 150 110, 170 60, 230 55 S 300 90, 330 70 S 420 30, 470 60 S 540 120, 520 160 S 430 190, 380 175';

// A stat: a small grey label over a big figure with a small unit
const stat = (lbl: string, value: string, size = 'var(--m-font-size-lg)') =>
  `<div class="m-stack" data-gap="0"><span style="${label}">${lbl}</span><span style="font-size: ${size}; ${num}; line-height: 1.2; white-space: nowrap">${value}</span></div>`;
// The stats row: stats split by hairline rules
const statsRow = (items: string[]) =>
  `<div class="m-cluster" data-gap="4" style="flex-wrap: nowrap">${items.join('<span aria-hidden="true" style="align-self: stretch; inline-size: 1px; background: var(--m-color-border-default)"></span>')}</div>`;

const avatarPile = (names: string[]) =>
  `<span class="m-avatar-group" aria-hidden="true">${names.map((n) => `<span class="m-avatar" data-size="sm" style="inline-size: 1.25rem; block-size: 1.25rem; font-size: 0.5rem">${n}</span>`).join('')}</span>`;

// The props row: a face pile and counts on the left; square grey buttons on the right
const propsRow = (pile: string[], props: number, comments: number) =>
  `<div class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-6); ${hair}">
              <a href="#" class="m-cluster" data-gap="2" style="${link}; ${meta}">${avatarPile(pile)}<span>${props} gave props · ${comments} comments</span></a>
              <div class="m-cluster" data-gap="1">
                <button type="button" class="m-button" data-size="sm" data-icon-only aria-label="Give props" style="background: var(--m-color-bg-sunken); border-color: var(--m-color-bg-sunken); color: var(--m-color-fg-muted)">${icon(I.props, 18)}</button>
                <button type="button" class="m-button" data-size="sm" data-icon-only aria-label="Comment" style="background: var(--m-color-bg-sunken); border-color: var(--m-color-bg-sunken); color: var(--m-color-fg-muted)">${icon(I.comment, 18)}</button>
                <button type="button" class="m-button" data-size="sm" data-icon-only aria-label="Share" style="background: var(--m-color-bg-sunken); border-color: var(--m-color-bg-sunken); color: var(--m-color-fg-muted)">${icon(I.share, 18)}</button>
              </div>
            </div>`;

// An achievement line: a medal or crown in the tone, then the words
const achievement = (ic: string, text: string, tone = 'var(--m-color-warning-solid)') =>
  `<li class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-sm)"><span style="color: ${tone}; display: inline-flex">${icon(ic, 18)}</span>${text}</li>`;

const feedEntry = (o: {
  initials: string;
  name: string;
  sport: string;
  when: string;
  title: string;
  note: string;
  stats: string[];
  route: string;
  wins: string[];
  pile: string[];
  props: number;
  comments: number;
}) => `          <article class="m-card" style="padding: 0" aria-label="${o.title}">
            <div class="m-card-body m-stack" data-gap="3" style="padding: var(--m-space-6) var(--m-space-6) var(--m-space-4)">
              <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap">
                <span class="m-avatar">${o.initials}</span>
                <div class="m-stack" data-gap="0">
                  <a href="#" style="${link}; font-weight: var(--m-font-weight-semibold)">${o.name}</a>
                  <span class="m-cluster" data-gap="1" style="${meta}">${icon(o.sport, 14)} ${o.when}</span>
                </div>
              </div>
              <h3 style="${bold}; font-size: var(--m-font-size-lg)"><a href="#" style="${link}">${o.title}</a></h3>
              <p style="font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)">${o.note}</p>
              ${statsRow(o.stats)}
            </div>
            ${map(o.route)}
            <ul class="m-stack" data-gap="2" style="list-style: none; padding: var(--m-space-3) var(--m-space-6)">
              ${o.wins.join('\n              ')}
            </ul>
            ${propsRow(o.pile, o.props, o.comments)}
          </article>`;

// The week: seven bars, days with a session in the signature orange
const week = [
  ['M', 42],
  ['T', 0],
  ['W', 70],
  ['T', 28],
  ['F', 0],
  ['S', 96],
  ['S', 54],
] as const;
const weekBars = `<svg viewBox="0 0 210 84" width="100%" role="img" aria-label="Distance by day this week: Monday 6.3 km, Wednesday 10.5 km, Thursday 4.2 km, Saturday 14.4 km, Sunday 8.1 km" style="display: block; block-size: auto">
${week.map(([d, v], i) => `                <rect x="${i * 30 + 6}" y="${v ? 66 - v * 0.6 : 64}" width="18" height="${v ? v * 0.6 : 2}" rx="2" style="fill: ${v ? 'var(--m-color-brand-default)' : 'var(--m-color-border-default)'}"/><text x="${i * 30 + 15}" y="80" text-anchor="middle" style="fill: var(--m-color-fg-subtle); font-size: 10px">${d}</text>`).join('\n')}
              </svg>`;

const leaderRow = (rank: string, initials: string, name: string, time: string, me = false, crown = false) =>
  `<tr${me ? ' style="background: var(--m-color-brand-subtle)"' : ''}><td style="${num}; inline-size: 2rem">${crown ? `<span style="color: var(--m-color-warning-solid); display: inline-flex" aria-label="First">${icon(I.crown, 16)}</span>` : rank}</td><td><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span class="m-avatar" data-size="sm" style="inline-size: 1.5rem; block-size: 1.5rem; font-size: 0.625rem">${initials}</span>${me ? `<strong>${name}</strong>` : name}</span></td><td data-numeric style="${num}">${time}</td></tr>`;

const challenge = (ic: string, name: string, detail: string, pct: number) =>
  `<li class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap">
                  <span aria-hidden="true" style="display: inline-grid; place-items: center; flex: none; inline-size: 2.5rem; block-size: 2.5rem; border-radius: 4px; background: var(--m-color-brand-subtle); color: var(--m-color-accent-text)">${icon(ic, 20)}</span>
                  <div class="m-stack" data-gap="1" style="flex: 1">
                    <a href="#" style="${link}; font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-semibold)">${name}</a>
                    <progress class="m-progress" data-size="sm" value="${pct}" max="100" aria-label="${name}: ${pct}%">${pct}%</progress>
                    <span style="${label}">${detail}</span>
                  </div>
                </li>`;

const dashboard = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  ${topbar('Feed')}
  <main class="m-container" data-size="lg" style="padding-block: var(--m-space-6) var(--m-space-16)">
    <div style="display: flex; flex-wrap: wrap; gap: var(--m-space-6); align-items: flex-start">
      <!-- The athlete: a centred card, then the week -->
      <div class="m-stack" data-gap="4" style="flex: 1 1 15rem; min-inline-size: 0">
        <section class="m-card" aria-labelledby="sm-me">
          <div class="m-card-body m-stack" data-gap="4" style="align-items: center; text-align: center">
            <span class="m-avatar" data-size="lg" style="border: 2px solid var(--m-color-brand-default)">NH</span>
            <h2 id="sm-me" style="${bold}; font-size: var(--m-font-size-lg)">Noor Haddad</h2>
            <div class="m-cluster" data-justify="center" data-gap="4" style="flex-wrap: nowrap">
              ${stat('Following', '86')}
              ${stat('Followers', '112')}
              ${stat('Logged', '431')}
            </div>
          </div>
          <div class="m-stack" data-gap="1" style="padding: var(--m-space-3) var(--m-space-6); ${hair}">
            <span style="${label}">Latest</span>
            <a href="#" style="${link}; font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-semibold)">Easy shakeout · Nov 10</a>
          </div>
        </section>
        <section class="m-card" aria-labelledby="sm-week">
          <div class="m-card-body m-stack" data-gap="3">
            <div class="m-cluster" data-justify="between"><h2 id="sm-week" style="${bold}; font-size: var(--m-font-size-md)">This week</h2><span class="m-cluster" data-gap="1" style="${meta}">${icon(I.run, 14)} Run</span></div>
            ${statsRow([stat('Distance', unit('43.5', 'km')), stat('Time', '3h 51m'), stat('Elev', unit('612', 'm'))])}
            ${weekBars}
            <div class="m-stack" data-gap="1">
              <div class="m-cluster" data-justify="between" style="font-size: var(--m-font-size-xs)"><span>Weekly goal</span><span style="${num}">43.5 / 50 km</span></div>
              <progress class="m-progress" data-size="sm" value="87" max="100" aria-label="Weekly goal: 87%">87%</progress>
            </div>
          </div>
        </section>
      </div>
      <!-- The feed -->
      <div class="m-stack" data-gap="3" style="flex: 2 1 30rem; min-inline-size: 0">
        <div class="m-cluster" data-justify="between">
          <select class="m-select" data-size="sm" aria-label="Show activities from" style="inline-size: auto"><option>People you follow</option><option>Just you</option><option>Your crews</option></select>
          <span style="${meta}">Updated a moment ago</span>
        </div>
${feedEntry({
  initials: 'TR',
  name: 'Tomas Reyes',
  sport: I.run,
  when: 'Today at 6:42 AM · Millbrook',
  title: 'Tempo Tuesday on the river path',
  note: 'Held it together for the last two k. Legs felt fresh after the rest day.',
  stats: [
    stat('Distance', unit('12.4', 'km'), 'var(--m-font-size-xl)'),
    stat('Pace', unit('4:52', '/km'), 'var(--m-font-size-xl)'),
    stat('Time', '1h 0m', 'var(--m-font-size-xl)'),
  ],
  route: runRoute,
  wins: [
    achievement(I.medal, '<span><strong>2 personal records</strong>, including your fastest 10 km</span>'),
    achievement(
      I.trophy,
      'Third-best time on <a href="#" style="color: var(--m-color-accent-text); text-decoration: none; font-weight: var(--m-font-weight-semibold)">Weir Bridge Sprint</a>',
      'var(--m-color-fg-subtle)',
    ),
  ],
  pile: ['AB', 'WO', 'LK'],
  props: 18,
  comments: 4,
})}
${feedEntry({
  initials: 'AB',
  name: 'Aiko Brandt',
  sport: I.ride,
  when: 'Yesterday at 9:15 AM · Wexford Ridge',
  title: 'Three climbs before lunch',
  note: 'Windy on the top road. Took the long way home through the orchards.',
  stats: [
    stat('Distance', unit('64.8', 'km'), 'var(--m-font-size-xl)'),
    stat('Elev Gain', unit('1,126', 'm'), 'var(--m-font-size-xl)'),
    stat('Time', '2h 41m', 'var(--m-font-size-xl)'),
  ],
  route: rideRoute,
  wins: [
    achievement(I.crown, '<span><strong>Local leader</strong> on Kestrel Hill Climb, 14 efforts in 90 days</span>'),
  ],
  pile: ['NH', 'TR'],
  props: 31,
  comments: 7,
})}
      </div>
      <!-- Challenges, a board, suggested crews -->
      <div class="m-stack" data-gap="4" style="flex: 1 1 15rem; min-inline-size: 0">
        <section class="m-card" aria-labelledby="sm-chal">
          <div class="m-card-body m-stack" data-gap="4">
            <h2 id="sm-chal" style="${bold}; font-size: var(--m-font-size-md)">Challenges</h2>
            <ul class="m-stack" data-gap="4" style="list-style: none; padding: 0">
              ${challenge(I.flag, 'November 100 km', '62.3 of 100 km · 18 days left', 62)}
              ${challenge(I.mountain, 'Climb 2,000 m', '1,480 of 2,000 m', 74)}
            </ul>
            <a href="#" style="color: var(--m-color-accent-text); text-decoration: none; font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-semibold)">See every challenge</a>
          </div>
        </section>
        <section class="m-card" aria-labelledby="sm-board">
          <div class="m-card-body m-stack" data-gap="3">
            <div class="m-stack" data-gap="0"><h2 id="sm-board" style="${bold}; font-size: var(--m-font-size-md)">Weir Bridge Sprint</h2><span style="${label}">0.8 km · 1% · this month</span></div>
            <table class="m-table" data-density="compact" style="font-size: var(--m-font-size-xs)">
              <caption class="m-sr-only">Fastest this month</caption>
              <thead><tr><th scope="col">#</th><th scope="col">Athlete</th><th scope="col" data-numeric>Time</th></tr></thead>
              <tbody>
                ${leaderRow('1', 'LK', 'Lena Kowal', '2:21', false, true)}
                ${leaderRow('2', 'WO', 'Wes Okafor', '2:26')}
                ${leaderRow('3', 'TR', 'Tomas Reyes', '2:29', true)}
                ${leaderRow('4', 'JP', 'June Park', '2:34')}
              </tbody>
            </table>
          </div>
        </section>
        <section class="m-card" aria-labelledby="sm-crews">
          <div class="m-card-body m-stack" data-gap="3">
            <h2 id="sm-crews" style="${bold}; font-size: var(--m-font-size-md)">Crews near you</h2>
            <ul class="m-stack" data-gap="3" style="list-style: none; padding: 0">
              <li class="m-cluster" data-justify="between" style="flex-wrap: nowrap"><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span class="m-avatar" data-size="sm" style="border-radius: 4px">DR</span><span class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-semibold)">Dawn Runners</span><span style="${label}">412 members</span></span></span><button type="button" class="m-button" data-variant="secondary" data-size="sm">Join</button></li>
              <li class="m-cluster" data-justify="between" style="flex-wrap: nowrap"><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span class="m-avatar" data-size="sm" style="border-radius: 4px">GC</span><span class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-semibold)">Gravel Collective</span><span style="${label}">1,086 members</span></span></span><button type="button" class="m-button" data-variant="secondary" data-size="sm">Join</button></li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  </main>
</div>`;

// The activity page: a left column with an orange bar, a header of big stats, the map and profile,
// then segments with the open one's top-ten board
const elevation = `<svg viewBox="0 0 600 120" width="100%" role="img" aria-label="Elevation profile: 1,126 m gained, highest point 512 m" style="display: block; block-size: auto">
              <g style="stroke: var(--m-color-border-muted); stroke-width: 1"><path d="M40 20 H600"/><path d="M40 55 H600"/><path d="M40 90 H600"/></g>
              <g style="fill: var(--m-color-fg-subtle); font-size: 8px"><text x="0" y="24">500 m</text><text x="0" y="59">300 m</text><text x="0" y="94">100 m</text><text x="40" y="116">0 km</text><text x="300" y="116">32 km</text><text x="560" y="116">64 km</text></g>
              <path d="M40 100 L80 92 L120 60 L150 34 L180 70 L220 88 L260 52 L290 30 L320 64 L360 84 L400 74 L440 40 L470 26 L500 58 L540 84 L600 96 L600 104 L40 104 Z" style="fill: var(--m-color-border-default)"/>
              <path d="M220 88 L260 52 L290 30 L290 104 L220 104 Z" style="fill: var(--m-color-brand-subtle)"/>
              <path d="M220 88 L260 52 L290 30" style="fill: none; stroke: var(--m-color-brand-default); stroke-width: 2"/>
            </svg>`;

const segRow = (
  name: string,
  sub: string,
  time: string,
  speed: string,
  power: string,
  hr: string,
  open = false,
  pr = false,
) =>
  `<tr${open ? ' aria-selected="true" style="box-shadow: inset 3px 0 0 var(--m-color-brand-default); background: var(--m-color-bg-sunken)"' : ''}><td style="inline-size: 2.5rem; color: var(--m-color-fg-subtle)">${pr ? `<span style="color: var(--m-color-warning-solid); display: inline-flex" aria-label="Personal record">${icon(I.medal, 18)}</span>` : icon(I.star, 18)}</td><td><a href="#" style="${link}; font-weight: var(--m-font-weight-semibold)">${name}</a><div style="${label}; ${num}">${sub}</div></td><td data-numeric style="${num}">${time}</td><td data-numeric style="${num}">${speed}</td><td data-numeric style="${num}">${power}</td><td data-numeric style="${num}">${hr}</td></tr>`;

const listDetail = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  ${topbar('Feed')}
  <main class="m-container" data-size="lg" style="padding-block: var(--m-space-6) var(--m-space-16)">
    <div class="m-split" style="--m-layout-split-side: 11rem; --m-layout-split-gap: var(--m-space-4); align-items: start">
      <nav class="m-sidebar" aria-label="This activity" style="border: var(--m-border-width-thin) solid var(--m-color-border-default); border-radius: 4px; padding: 0">
        <div class="m-sidebar-section">
          <ul>
            <li><a class="m-sidebar-link" href="#">Summary</a></li>
            <li><a class="m-sidebar-link" href="#">Splits</a></li>
            <li><a class="m-sidebar-link" href="#" aria-current="page">Segments <span class="m-sidebar-count">9</span></a></li>
          </ul>
        </div>
        <div class="m-sidebar-section">
          <h2 class="m-sidebar-heading" style="padding-inline: var(--m-space-4)">Members</h2>
          <ul>
            <li><a class="m-sidebar-link" href="#">Power zones</a></li>
            <li><a class="m-sidebar-link" href="#">Heart rate</a></li>
            <li><a class="m-sidebar-link" href="#">Climbs</a></li>
          </ul>
        </div>
        <div class="m-cluster" data-gap="0" style="${hair}">
          <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Edit activity" style="flex: 1; border-radius: 0; color: var(--m-color-fg-muted)">${icon(I.pencil, 18)}</button>
          <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="More actions" style="flex: 1; border-radius: 0; color: var(--m-color-fg-muted)">${icon(I.more, 18)}</button>
        </div>
      </nav>
      <div class="m-stack" data-gap="4">
        <section class="m-card" style="padding: 0; overflow: hidden" aria-labelledby="sm-act">
          <div class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-4); background: var(--m-color-bg-sunken); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
            <span class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-lg)"><span style="color: var(--m-color-brand-default); display: inline-flex">${icon(I.ride, 20)}</span><span><strong>Aiko Brandt</strong> – Ride</span></span>
            <span class="m-cluster" data-gap="3" style="${meta}; ${num}"><span class="m-cluster" data-gap="1">${icon(I.props, 16)} 31</span><span class="m-cluster" data-gap="1">${icon(I.comment, 16)} 7</span><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Share">${icon(I.share, 16)}</button></span>
          </div>
          <div class="m-grid" style="--m-layout-grid-min: 18rem; --m-layout-grid-gap: 0">
            <div class="m-cluster" data-gap="4" data-align="start" style="flex-wrap: nowrap; padding: var(--m-space-6); border-inline-end: var(--m-border-width-thin) solid var(--m-color-border-muted)">
              <span class="m-avatar" data-size="lg">AB</span>
              <div class="m-stack" data-gap="2">
                <span style="${meta}">9:15 AM on Wednesday, November 11 · Wexford Ridge</span>
                <h1 id="sm-act" style="${pageTitle}">Three climbs before lunch</h1>
                <p style="font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)">Windy on the top road. Took the long way home through the orchards.</p>
                <div class="m-cluster" data-gap="2"><span class="m-badge">Gravel</span><span class="m-badge">Long ride</span></div>
              </div>
            </div>
            <div class="m-stack" data-gap="4" style="padding: var(--m-space-6)">
              <div class="m-cluster" data-gap="6">
                <div class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-2xl); ${num}; line-height: 1.1">${unit('64.8', 'km')}</span><span style="${label}">Distance</span></div>
                <div class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-2xl); ${num}; line-height: 1.1">2:41:07</span><span style="${label}">Moving time</span></div>
                <div class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-2xl); ${num}; line-height: 1.1">${unit('1,126', 'm')}</span><span style="${label}">Elevation</span></div>
              </div>
              <div class="m-cluster" data-gap="6" style="padding-block-start: var(--m-space-3); ${hair}">
                <div class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-lg); ${num}">${unit('24.1', 'km/h')}</span><span style="${label}">Avg speed</span></div>
                <div class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-lg); ${num}">${unit('212', 'W')}</span><span style="${label}">Avg power</span></div>
                <div class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-lg); ${num}">1,640</span><span style="${label}">Calories</span></div>
                <div class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-lg); ${num}; color: var(--m-color-danger-fg)">86</span><span style="${label}">Effort</span></div>
              </div>
            </div>
          </div>
        </section>
        <section class="m-card" style="padding: 0; overflow: hidden" aria-label="Map and elevation">
          ${map(rideRoute, 200, 'Ride map')}
          <div style="padding: var(--m-space-4)">${elevation}</div>
        </section>
        <section class="m-card" style="padding: 0; overflow: hidden" aria-labelledby="sm-segs">
          <div class="m-card-body m-stack" data-gap="3" style="padding: var(--m-space-6) var(--m-space-6) var(--m-space-3)">
            <div class="m-cluster" data-justify="between"><h2 id="sm-segs" style="${bold}; font-size: var(--m-font-size-xl)">Segments</h2><a href="#" style="color: var(--m-color-accent-text); text-decoration: none; font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-semibold)">How segments work</a></div>
          </div>
          <div class="m-table-wrap" role="region" aria-label="Segments on this ride" tabindex="0">
            <table class="m-table">
              <caption class="m-sr-only">Segments on this ride</caption>
              <thead><tr><th scope="col"><span class="m-sr-only">Starred</span></th><th scope="col">Name</th><th scope="col" data-numeric>Time</th><th scope="col" data-numeric>Speed</th><th scope="col" data-numeric>Power</th><th scope="col" data-numeric>HR</th></tr></thead>
              <tbody>
                ${segRow('Orchard Lane Drag', '3.2 km · 41 m · 1.3%', '6:08', unit('31.3', 'km/h'), unit('228', 'W'), unit('151', 'bpm'))}
                ${segRow('Kestrel Hill Climb', '5.6 km · 288 m · 5.1%', '18:42', unit('18.0', 'km/h'), unit('271', 'W'), unit('168', 'bpm'), true, true)}
                ${segRow('Quarry Road Descent', '2.4 km · −176 m · −7.3%', '3:12', unit('45.0', 'km/h'), unit('96', 'W'), unit('139', 'bpm'))}
              </tbody>
            </table>
          </div>
          <div class="m-grid" style="--m-layout-grid-min: 18rem; --m-layout-grid-gap: var(--m-space-6); padding: var(--m-space-6); box-shadow: inset 3px 0 0 var(--m-color-brand-default)">
            <div class="m-stack" data-gap="4">
              <div class="m-cluster" data-gap="6">
                <div class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-2xl); ${num}; line-height: 1.1">18:42</span><span style="${label}">This effort</span></div>
                <div class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-2xl); ${num}; line-height: 1.1; color: var(--m-color-fg-subtle)">19:05</span><span style="${label}">Previous best</span></div>
              </div>
              <div class="m-stack" data-gap="2">
                <button type="button" class="m-button">Compare efforts</button>
                <button type="button" class="m-button">Set a target time</button>
                <button type="button" class="m-button">Open the segment</button>
              </div>
            </div>
            <div class="m-stack" data-gap="3">
              <div class="m-cluster" data-justify="between"><h3 style="${bold}; font-size: var(--m-font-size-lg)">Top 10</h3><select class="m-select" data-size="sm" aria-label="Board period" style="inline-size: auto"><option>This year</option><option>All time</option><option>Today</option></select></div>
              <table class="m-table" data-density="compact">
                <caption class="m-sr-only">Kestrel Hill Climb, top times this year</caption>
                <thead><tr><th scope="col">Rank</th><th scope="col">Athlete</th><th scope="col" data-numeric>Time</th></tr></thead>
                <tbody>
                  ${leaderRow('1', 'AB', 'Aiko Brandt', '18:42', true, true)}
                  ${leaderRow('2', 'RS', 'Ravi Sen', '18:57')}
                  ${leaderRow('3', 'MD', 'Mara Dunn', '19:20')}
                  ${leaderRow('4', 'WO', 'Wes Okafor', '19:31')}
                  ${leaderRow('5', 'EV', 'Eli Varga', '20:02')}
                </tbody>
              </table>
              <button type="button" class="m-button" style="inline-size: 100%">See the full board</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
</div>`;

// Onboarding: one white column, a step bar, sport tiles that fill orange when picked, one goal
const sportTile = (ic: string, name: string, picked = false) =>
  `<label class="m-stack" data-gap="2" style="align-items: center; cursor: pointer; font-size: var(--m-font-size-sm)${picked ? '; font-weight: var(--m-font-weight-semibold); color: var(--m-color-accent-text)' : ''}">
              <input type="checkbox" class="m-sr-only"${picked ? ' checked' : ''}>
              <span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: 4rem; block-size: 4rem; border-radius: 9999px; ${picked ? 'background: var(--m-color-brand-subtle); color: var(--m-color-accent-text); box-shadow: inset 0 0 0 2px var(--m-color-brand-default)' : 'background: var(--m-color-bg-sunken); color: var(--m-color-fg-muted)'}">${icon(ic, 28)}</span>
              ${name}
            </label>`;

const onboarding = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  <header class="m-navbar" style="justify-content: center">${wordmark()}</header>
  <main class="m-container" data-size="sm" style="padding-block: var(--m-space-10) var(--m-space-16)">
    <section class="m-card" aria-labelledby="sm-ob">
      <div class="m-card-body m-stack" data-gap="6" style="padding: var(--m-space-8)">
        <div class="m-stack" data-gap="2">
          <div class="m-cluster" data-justify="between"><span style="${caps}">Step 2 of 4</span><a href="#" style="${meta}; text-decoration: none">Skip</a></div>
          <progress class="m-progress" data-size="sm" value="50" max="100" aria-label="Step 2 of 4">50%</progress>
        </div>
        <div class="m-stack" data-gap="2" style="text-align: center">
          <h1 id="sm-ob" style="${bold}; font-size: var(--m-font-size-2xl)">What do you train for?</h1>
          <p style="color: var(--m-color-fg-muted)">Pick everything you do. We'll set up your stats, maps and goals for each.</p>
        </div>
        <fieldset class="m-grid" style="--m-layout-grid-min: 5.5rem; --m-layout-grid-gap: var(--m-space-4); border: 0; padding: 0; margin: 0">
          <legend class="m-sr-only">Sports</legend>
          ${sportTile(I.run, 'Running', true)}
          ${sportTile(I.ride, 'Cycling', true)}
          ${sportTile(I.swim, 'Swimming')}
          ${sportTile(I.mountain, 'Hiking')}
          ${sportTile(I.strength, 'Strength')}
          ${sportTile(I.pulse, 'Other')}
        </fieldset>
        <div class="m-field">
          <label class="m-field-label" for="sm-ob-goal">Weekly distance goal</label>
          <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap">
            <input class="m-input" id="sm-ob-goal" inputmode="numeric" value="30" style="${num}" aria-describedby="sm-ob-goal-h">
            <select class="m-select" aria-label="Unit" style="inline-size: 7rem"><option>km</option><option>mi</option></select>
          </div>
          <p class="m-field-hint" id="sm-ob-goal-h">You can change it any week. Most new members start between 15 and 30 km.</p>
        </div>
        <label class="m-cluster" data-gap="3" style="flex-wrap: nowrap; font-size: var(--m-font-size-sm)"><input type="checkbox" class="m-checkbox" checked> Show me crews and events near my home area</label>
        <div class="m-stack" data-gap="2">
          <button type="button" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Continue</button>
          <button type="button" class="m-button" data-variant="ghost" style="inline-size: 100%">Back</button>
        </div>
      </div>
    </section>
    <p style="text-align: center; margin-block-start: var(--m-space-4); ${meta}">Already have an account? <a href="#" style="color: var(--m-color-accent-text); font-weight: var(--m-font-weight-semibold); text-decoration: none">Log in</a></p>
  </main>
</div>`;

// Settings: the account column on the left, label-and-value rows with pencil buttons, privacy radios
const settingRow = (lbl: string, value: string, last = false) =>
  `<div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding-block: var(--m-space-3)${last ? '' : '; border-block-end: var(--m-border-width-thin) solid var(--m-color-border-muted)'}">
              <span class="m-stack" data-gap="0"><span style="${label}">${lbl}</span><span style="font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-semibold)">${value}</span></span>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Edit ${lbl.toLowerCase()}" style="color: var(--m-color-fg-subtle)">${icon(I.pencil, 16)}</button>
            </div>`;
const choice = (name: string, value: string, title: string, sub: string, checked = false) =>
  `<label class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap"><input type="radio" class="m-radio" name="${name}" value="${value}"${checked ? ' checked' : ''}><span class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-semibold)">${title}</span><span style="${label}">${sub}</span></span></label>`;
const toggle = (id: string, title: string, sub: string, on = false, last = false) =>
  `<div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding-block: var(--m-space-4)${last ? '' : '; border-block-end: var(--m-border-width-thin) solid var(--m-color-border-muted)'}"><label for="${id}" class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-semibold)">${title}</span><span style="${label}">${sub}</span></label><input type="checkbox" role="switch" class="m-switch" id="${id}"${on ? ' checked' : ''}></div>`;

const settings = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  ${topbar('')}
  <main class="m-container" data-size="lg" style="padding-block: var(--m-space-8) var(--m-space-16)">
    <div class="m-split" style="--m-layout-split-side: 13rem; --m-layout-split-gap: var(--m-space-6); align-items: start">
      <nav class="m-sidebar" aria-label="Settings" style="border: var(--m-border-width-thin) solid var(--m-color-border-default); border-radius: 4px; padding: 0">
        <div class="m-sidebar-section">
          <ul>
            <li><a class="m-sidebar-link" href="#" aria-current="page" style="background: var(--m-color-accent-default); color: var(--m-color-accent-fg); box-shadow: none">${icon(I.user, 16)} Profile</a></li>
            <li><a class="m-sidebar-link" href="#">${icon(I.eye, 16)} Visibility</a></li>
            <li><a class="m-sidebar-link" href="#">${icon(I.watch, 16)} Devices <span class="m-sidebar-count">2</span></a></li>
            <li><a class="m-sidebar-link" href="#">${icon(I.bell, 16)} Alerts</a></li>
            <li><a class="m-sidebar-link" href="#">${icon(I.globe, 16)} Units and language</a></li>
            <li><a class="m-sidebar-link" href="#">${icon(I.star, 16)} Membership</a></li>
            <li><a class="m-sidebar-link" href="#">${icon(I.gear, 16)} Account</a></li>
          </ul>
        </div>
      </nav>
      <div style="display: flex; flex-wrap: wrap; gap: var(--m-space-6); align-items: flex-start">
      <div class="m-stack" data-gap="6" style="flex: 3 1 28rem; min-inline-size: 0">
        <h1 style="${bold}; font-size: var(--m-font-size-2xl)">Profile</h1>
        <section class="m-card" aria-label="Your details">
          <div class="m-card-body">
            <div class="m-cluster" data-gap="4" style="padding-block-end: var(--m-space-4); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-muted)">
              <span class="m-avatar" data-size="lg">NH</span>
              <div class="m-stack" data-gap="1"><span style="font-weight: var(--m-font-weight-semibold)">Noor Haddad</span><span style="${label}">Member since March 2021</span></div>
              <button type="button" class="m-button" data-size="sm" style="margin-inline-start: auto">${icon(I.upload, 16)} Change photo</button>
            </div>
            ${settingRow('Name', 'Noor Haddad')}
            ${settingRow('Home area', 'Millbrook')}
            ${settingRow('Birthday', 'April 14')}
            ${settingRow('Weight', '61 kg')}
            <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding-block: var(--m-space-4)">
              <label for="sm-sport" style="inline-size: 12rem; flex: none; font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-semibold)">Main sport</label>
              <select class="m-select" id="sm-sport" data-size="sm" style="inline-size: 14rem"><option>Running</option><option>Cycling</option><option>Swimming</option></select>
            </div>
          </div>
        </section>
        <section class="m-card" aria-labelledby="sm-vis">
          <div class="m-card-body m-stack" data-gap="4">
            <div class="m-stack" data-gap="1"><h2 id="sm-vis" style="${bold}; font-size: var(--m-font-size-lg)">Who sees your sessions</h2><span style="font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)">Applies to new uploads. Change older ones from each session.</span></div>
            <fieldset class="m-stack" data-gap="3" style="border: 0; padding: 0; margin: 0">
              <legend class="m-sr-only">Who sees your sessions</legend>
              ${choice('vis', 'all', 'Anyone on Trailmark', 'Shows on boards and in search')}
              ${choice('vis', 'mutual', 'People you follow back', 'Hidden from public boards', true)}
              ${choice('vis', 'me', 'Just you', 'Nobody else sees the map or stats')}
            </fieldset>
            <div>
              ${toggle('sm-hide', 'Hide the start and finish', 'Trims 200 m from each end of every map', true)}
              ${toggle('sm-board', 'Appear on crew boards', 'Your times count in crew rankings', true)}
              ${toggle('sm-beacon', 'Share live location while recording', 'Only with the two contacts you choose', false, true)}
            </div>
          </div>
        </section>
        <section class="m-card" aria-labelledby="sm-del">
          <div class="m-card-body m-cluster" data-justify="between">
            <div class="m-stack" data-gap="1"><h2 id="sm-del" style="${bold}; font-size: var(--m-font-size-md)">Delete your account</h2><span style="font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)">Removes every session, route and photo. Download them first.</span></div>
            <div class="m-cluster" data-gap="2"><button type="button" class="m-button">${icon(I.download, 16)} Download data</button><button type="button" class="m-button" data-variant="danger">Delete account</button></div>
          </div>
        </section>
      </div>
      <aside class="m-stack" data-gap="4" style="flex: 1 1 14rem; min-inline-size: 0">
        <section class="m-card" data-size="sm" aria-labelledby="sm-acct">
          <div class="m-card-body m-stack" data-gap="3">
            <h2 id="sm-acct" style="${bold}; font-size: var(--m-font-size-md)">Your account</h2>
            <div class="m-stack" data-gap="0"><span style="${label}">Sign-in email</span><span style="font-size: var(--m-font-size-sm)">noor.h@example.com</span></div>
            <div class="m-stack" data-gap="0"><span style="${label}">Plan</span><span style="font-size: var(--m-font-size-sm)">Free</span></div>
            <div><button type="button" class="m-button" data-variant="primary" data-size="sm">Upgrade</button></div>
          </div>
        </section>
        <section class="m-card" data-size="sm" aria-labelledby="sm-links">
          <div class="m-card-body m-stack" data-gap="3">
            <h2 id="sm-links" style="${bold}; font-size: var(--m-font-size-md)">Linked devices</h2>
            <span class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-sm)">${icon(I.watch, 18)} Wrist GPS, synced today</span>
            <span class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-sm)">${icon(I.ride, 18)} Bike computer, synced Monday</span>
          </div>
        </section>
      </aside>
      </div>
    </div>
  </main>
</div>`;

// Empty state: underline tabs, then one card with a dashed placeholder route and two actions
const emptyState = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  ${topbar('Routes')}
  <main class="m-container" data-size="lg" style="padding-block: var(--m-space-8) var(--m-space-16)">
    <div class="m-stack" data-gap="6">
      <div class="m-cluster" data-justify="between"><h1 style="${bold}; font-size: var(--m-font-size-2xl)">Your routes</h1><button type="button" class="m-button" data-variant="primary">${icon(I.plus, 18)} Plan a route</button></div>
      <div class="m-tabs">
        <div class="m-tab-list" role="tablist" aria-label="Routes">
          <button type="button" class="m-tab" role="tab" aria-selected="true">Saved</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Planned by you</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Done recently</button>
        </div>
      </div>
      <section class="m-card" aria-labelledby="sm-empty">
        <div class="m-card-body m-stack" data-gap="5" style="align-items: center; text-align: center; padding-block: var(--m-space-12)">
          <svg viewBox="0 0 240 120" width="240" height="120" aria-hidden="true" style="display: block; border-radius: 4px; background: var(--m-color-bg-sunken)">
            <g style="stroke: var(--m-color-border-default); stroke-width: 1.5; fill: none"><path d="M0 40 L240 30"/><path d="M0 90 L240 84"/><path d="M60 0 L70 120"/><path d="M170 0 L160 120"/></g>
            <path d="M40 96 C 70 60, 100 90, 128 56 S 180 30, 204 44" style="fill: none; stroke: var(--m-color-brand-default); stroke-width: 3; stroke-dasharray: 2 8; stroke-linecap: round"/>
            <circle cx="40" cy="96" r="6" style="fill: var(--m-color-success-solid)"/><circle cx="204" cy="44" r="6" style="fill: var(--m-color-bg-surface); stroke: var(--m-color-fg-default); stroke-width: 2"/>
          </svg>
          <h2 id="sm-empty" style="${bold}; font-size: var(--m-font-size-xl)">No saved routes yet</h2>
          <p style="max-inline-size: 28rem; color: var(--m-color-fg-muted)">Save a route from a friend's session or plan your own. Saved routes work offline and sync to your watch.</p>
          <div class="m-cluster" data-justify="center" data-gap="2">
            <button type="button" class="m-button" data-variant="primary">${icon(I.route, 18)} Plan a route</button>
            <button type="button" class="m-button">${icon(I.compass, 18)} Popular near Millbrook</button>
          </div>
        </div>
      </section>
    </div>
  </main>
</div>`;

// Pricing: a dark band with an orange glow, plan cards (one light), a comparison card, a sticky bar
const tick = (member = false) =>
  `<span style="display: inline-flex; color: ${member ? 'var(--m-color-accent-text)' : 'var(--m-color-fg-default)'}" aria-label="Included">${icon(I.checkCircle, 20)}</span>`;
const featureRow = (ic: string, name: string, free: boolean) =>
  `<tr><th scope="row" style="font-weight: var(--m-font-weight-regular)"><span class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${icon(ic, 18)}${name}</span></th><td style="text-align: center">${free ? tick() : '<span class="m-sr-only">Not included</span>'}</td><td style="text-align: center">${tick(true)}</td></tr>`;
const plan = (o: {
  tag: string;
  name: string;
  price: string;
  per: string;
  note: string;
  cta: string;
  light?: boolean;
}) =>
  `<section class="m-card"${o.light ? ' data-theme="summit" data-mode="light"' : ''} style="border-radius: 16px; border-color: transparent; background: ${o.light ? 'var(--m-color-bg-sunken)' : 'var(--m-color-bg-surface)'}; color: var(--m-color-fg-default)" aria-label="${o.name}">
          <div class="m-card-body m-stack" data-gap="5" style="padding: var(--m-space-8)">
            <div><span class="m-badge" data-variant="solid"${o.light ? ' data-tone="neutral"' : ''}>${o.tag}</span></div>
            <h2 style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-semibold); text-transform: uppercase; letter-spacing: 0.08em">${o.name}</h2>
            <p style="${num}"><span style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-bold); line-height: 1">${o.price}</span> <span style="font-size: var(--m-font-size-sm)">${o.per}</span></p>
            <p style="font-size: var(--m-font-size-xs); color: var(--m-color-fg-muted)">${o.note}</p>
            <button type="button" class="m-button" data-variant="${o.light ? 'primary' : 'secondary'}" data-size="lg" style="border-radius: 16px; inline-size: 100%">${o.cta}</button>
          </div>
        </section>`;

const pricing = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  ${topbar('')}
  <div data-theme="summit" data-mode="dark" style="background: radial-gradient(60rem 30rem at 0% 0%, var(--m-color-brand-default), transparent 70%), var(--m-color-bg-canvas); color: var(--m-color-fg-default)">
    <main class="m-container" data-size="lg" style="padding-block: var(--m-space-16)">
      <div class="m-stack" data-gap="10">
        <div class="m-stack" data-gap="4" style="text-align: center; align-items: center">
          <span style="font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em">Trailmark <span style="font-weight: var(--m-font-weight-semibold); text-transform: none; letter-spacing: 0">Membership</span></span>
          <h1 style="${bold}; font-size: clamp(var(--m-font-size-2xl), 5vw, var(--m-font-size-3xl)); max-inline-size: 44rem">Train with a plan. Race with your crew.</h1>
          <p style="font-size: var(--m-font-size-lg); color: var(--m-color-fg-muted); max-inline-size: 36rem">Every board, every route tool and your fitness trend, free for the first 14 days.</p>
          <div class="m-tabs" data-variant="pill" style="inline-size: 16rem"><div class="m-tab-list" role="tablist" aria-label="Billing" style="inline-size: 100%">
            <button type="button" class="m-tab" role="tab" aria-selected="true" style="flex: 1">Yearly</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1" style="flex: 1">Monthly</button>
          </div></div>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 17rem; --m-layout-grid-gap: var(--m-space-4); max-inline-size: 64rem; margin-inline: auto; inline-size: 100%">
          ${plan({ tag: 'Most picked', name: 'Solo', price: '$6.67', per: '/month', note: '14 days free, then $79.99 a year.', cta: 'Start free trial', light: true })}
          ${plan({ tag: 'Up to 5 people', name: 'Household', price: '$2.50', per: '/month each', note: 'Billed $149.99 a year for five members.', cta: 'Choose Household' })}
          ${plan({ tag: 'Half price', name: 'Student', price: '$3.33', per: '/month', note: 'With a school email. Billed $39.99 a year.', cta: 'Check eligibility' })}
        </div>
      </div>
    </main>
  </div>
  <main class="m-container" data-size="md" style="padding-block: var(--m-space-16)">
    <div class="m-stack" data-gap="10">
      <h2 style="${bold}; font-size: var(--m-font-size-2xl); text-align: center">Free gets you moving. Members go further.</h2>
      <section class="m-card" style="border-radius: 16px" aria-label="Free and member features">
        <div class="m-card-body">
          <table class="m-table" style="--m-table-header-bg: transparent">
            <caption class="m-sr-only">What free and member accounts include</caption>
            <thead><tr><th scope="col" style="${caps}; color: var(--m-color-fg-default)">Feature</th><th scope="col" style="${caps}; color: var(--m-color-fg-default); text-align: center">Free</th><th scope="col" style="${caps}; color: var(--m-color-fg-default); text-align: center">Member</th></tr></thead>
            <tbody>
              ${featureRow(I.pulse, 'Log every session from any device', true)}
              ${featureRow(I.props, 'Follow friends and give props', true)}
              ${featureRow(I.pin, 'Live location for two trusted contacts', true)}
              ${featureRow(I.trophy, 'Full segment boards, beyond the top ten', false)}
              ${featureRow(I.route, 'Route planner with offline maps', false)}
              ${featureRow(I.trend, 'Training load and fitness trend', false)}
              ${featureRow(I.timer, 'Race-time predictions from 5 km to marathon', false)}
              ${featureRow(I.flag, 'Your own goals and crew challenges', false)}
            </tbody>
          </table>
        </div>
      </section>
      <section class="m-stack" data-gap="2" aria-labelledby="sm-faq">
        <h2 id="sm-faq" style="${bold}; font-size: var(--m-font-size-xl)">Questions</h2>
        <div class="m-accordion">
          <details class="m-accordion-item" open><summary>When does the trial end?</summary><div class="m-accordion-content">Fourteen days after you start. We'll remind you two days before, and you can cancel from Settings at any time.</div></details>
          <details class="m-accordion-item"><summary>Can I move my household plan to someone else?</summary><div class="m-accordion-content">Yes. The person who pays can hand the plan over from Membership in Settings.</div></details>
          <details class="m-accordion-item"><summary>What happens to my routes if I stop?</summary><div class="m-accordion-content">They stay saved. Offline maps and the planner pause until you rejoin.</div></details>
        </div>
      </section>
    </div>
  </main>
  <div class="m-cluster" data-justify="between" data-theme="summit" data-mode="dark" style="padding: var(--m-space-4) max(var(--m-space-4), calc((100% - 60rem) / 2)); background: var(--m-color-bg-surface); color: var(--m-color-fg-default)">
    <div class="m-stack" data-gap="0"><strong>Two weeks of everything, on us.</strong><span style="font-size: var(--m-font-size-xs)">$6.67/month after the trial, billed yearly. Taxes may apply.</span></div>
    <button type="button" class="m-button" data-variant="primary">Start free trial</button>
  </div>
</div>`;

// Errors: inline field errors, a red alert, a dark banner, the 404 dead end, and 500 and 403 cards
const errorCard = (code: string, ic: string, tone: string, title: string, body: string, actions: string) =>
  `    <section class="m-card" data-size="lg" aria-labelledby="sm-err-${code}">
      <div class="m-card-body m-cluster" data-gap="6" data-align="start" style="flex-wrap: nowrap">
        <span aria-hidden="true" style="display: inline-grid; place-items: center; flex: none; inline-size: 3.5rem; block-size: 3.5rem; border-radius: 9999px; background: var(--m-color-${tone}-bg); color: var(--m-color-${tone}-fg)">${icon(ic, 28)}</span>
        <div class="m-stack" data-gap="3">
          <span style="${caps}">Error ${code}</span>
          <h2 id="sm-err-${code}" style="${bold}; font-size: var(--m-font-size-xl)">${title}</h2>
          <p style="color: var(--m-color-fg-muted)">${body}</p>
          <div class="m-cluster" data-gap="2">${actions}</div>
        </div>
      </div>
    </section>`;

const errors = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  ${topbar('')}
  <main class="m-container" data-size="md" style="padding-block: var(--m-space-10) var(--m-space-16)">
  <div class="m-stack" data-gap="8">
    <form class="m-card" aria-labelledby="sm-err-form">
      <div class="m-card-body m-stack" data-gap="5">
        <div class="m-cluster" data-justify="between"><h1 id="sm-err-form" style="${bold}; font-size: var(--m-font-size-2xl)">Add a session by hand</h1><button type="submit" class="m-button" data-variant="primary">Save</button></div>
        <div class="m-alert" data-tone="danger" role="alert">
          <span class="m-alert-icon">${icon(I.alert, 20)}</span>
          <div class="m-alert-content"><div class="m-alert-title">Two fields need a fix</div><div class="m-alert-body">Nothing is saved yet. Your notes are still here.</div></div>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="sm-err-title">Title</label>
          <input class="m-input" id="sm-err-title" value="Lunch loop with June">
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 12rem; --m-layout-grid-gap: var(--m-space-4)">
          <div class="m-field">
            <label class="m-field-label" for="sm-err-dist">Distance (km)</label>
            <input class="m-input" id="sm-err-dist" value="0" aria-invalid="true" aria-describedby="sm-err-dist-e" style="${num}">
            <p class="m-field-error" id="sm-err-dist-e">Enter a distance above 0, for example 8.2.</p>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="sm-err-time">Moving time</label>
            <input class="m-input" id="sm-err-time" value="0:61:00" aria-invalid="true" aria-describedby="sm-err-time-e" style="${num}">
            <p class="m-field-error" id="sm-err-time-e">Minutes go up to 59. Try 1:01:00.</p>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="sm-err-sport">Sport</label>
            <select class="m-select" id="sm-err-sport"><option>Run</option><option>Ride</option><option>Swim</option></select>
          </div>
        </div>
      </div>
    </form>
    <div class="m-toast" data-tone="danger" role="status"><div class="m-toast-content"><div class="m-toast-title">Upload didn't finish</div><div class="m-toast-body">Your watch file is safe on this device. We'll try again on Wi-Fi.</div></div><button type="button" class="m-button" data-variant="primary" data-size="sm">${icon(I.refresh, 16)} Retry now</button></div>
    <section class="m-card" style="padding: 0; overflow: hidden" aria-labelledby="sm-err-404">
      <div class="m-grid" style="--m-layout-grid-min: 16rem; --m-layout-grid-gap: 0; align-items: center">
        <svg viewBox="0 0 300 220" width="100%" aria-hidden="true" style="display: block; block-size: 100%; background: var(--m-color-bg-sunken)">
          <g style="stroke: var(--m-color-border-default); stroke-width: 10; stroke-linecap: round; fill: none"><path d="M0 60 L150 110"/><path d="M0 180 L150 110"/><path d="M150 110 L300 30"/></g>
          <g style="stroke: var(--m-color-brand-default); stroke-width: 10; stroke-linecap: round; fill: none"><path d="M0 110 L150 110"/><path d="M150 110 L250 200"/></g>
          <circle cx="150" cy="110" r="10" style="fill: var(--m-color-brand-default); stroke: var(--m-color-bg-surface); stroke-width: 4"/>
          <path d="M240 192 l20 16 m0 -16 l-20 16" style="stroke: var(--m-color-danger-solid); stroke-width: 4; stroke-linecap: round"/>
        </svg>
        <div class="m-stack" data-gap="3" style="padding: var(--m-space-8)">
          <span style="font-size: var(--m-font-size-4xl); font-weight: 800; line-height: 1; color: var(--m-color-accent-text); ${num}">404</span>
          <h2 id="sm-err-404" style="${bold}; font-size: var(--m-font-size-xl)">Wrong turn. This trail doesn't go anywhere.</h2>
          <p style="font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)">The page moved or never existed. From here you can:</p>
          <ul class="m-stack" data-gap="1" style="font-size: var(--m-font-size-sm); padding-inline-start: var(--m-space-5)">
            <li>check the address and try again,</li>
            <li>head back to <a href="#" style="color: var(--m-color-accent-text); text-decoration: none; font-weight: var(--m-font-weight-semibold)">your feed</a>,</li>
            <li>or search for a <a href="#" style="color: var(--m-color-accent-text); text-decoration: none; font-weight: var(--m-font-weight-semibold)">route</a> or <a href="#" style="color: var(--m-color-accent-text); text-decoration: none; font-weight: var(--m-font-weight-semibold)">crew</a>.</li>
          </ul>
        </div>
      </div>
    </section>
${errorCard('500', I.warn, 'danger', 'We dropped the baton', 'Something broke on our side and your feed didn’t load. Your sessions are safe. Try again in a minute.', `<button type="button" class="m-button" data-variant="primary">${icon(I.refresh, 16)} Try again</button><a class="m-button" href="#">Service status</a>`)}
${errorCard('403', I.lock, 'info', 'This session is just for followers', 'Lena Kowal shares sessions with people she follows back. Ask to follow and you’ll see it once she accepts.', `<button type="button" class="m-button" data-variant="primary">Ask to follow</button><a class="m-button" data-variant="ghost" href="#">${icon(I.left, 16)} Back to your feed</a>`)}
  </div>
  </main>
</div>`;

export const summitRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'The white top bar with an orange line under the current link, then three columns: the athlete and the week, the feed of sessions (stats row, route map, achievements, props), and challenges with a board.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'The activity page: a left column with an orange bar on the current section, a header of big stats with small units, the map and elevation profile, segments and the open one’s top ten.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One white card on the off-white screen: a step bar, a bold centred question, sport tiles that fill orange when picked, one goal field and a full-width orange button.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'The settings column with the current item filled orange, rows of a small label over a value with pencil buttons, visibility radios and switches, deleting the account last, and the account beside.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'Underline tabs, then one card with a dashed placeholder route, a bold heading, one sentence and an orange and a white button.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'A dark band with an orange glow, a yearly and monthly switch, plan cards with tracked capitals (the picked one light), a comparison card with orange ticks, questions and a sticky dark bar.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Red messages under the fields with a red notice above that says nothing is saved, a dark banner, the 404 dead end drawn as routes, and 500 and 403 cards.',
    html: errors,
  },
];
