import type { ArchetypeRecipe } from '../types';

/*
 * Volt's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from a made-up payments app ("brisk"). They follow the
 * language's real screen patterns, translated from a phone app to the desktop: white 20px cards on
 * a light grey screen, bold amounts set tight, big regular headlines, black pill actions with grey
 * pill secondaries, round icon tiles, a green money keypad with huge numerals, green bars and rings,
 * and big grey questions between hairlines on the public pages.
 */

// Lucide icons, outlined, 2px stroke
const icon = (paths: string, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  transfer: '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  gear: '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  up: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  down: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  upRight: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  downLeft: '<path d="M17 7 7 17"/><path d="M17 17H7V7"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  expand: '<path d="m6 9 6 6 6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  alert: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  phone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  user: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>',
  mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
  bank: '<path d="M10 18v-7"/><path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  clock: '<path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  logout: '<path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  split: '<path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/>',
  car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  bag: '<path d="M16 10a4 4 0 0 1-8 0"/><path d="M3.103 6.034h17.794"/><path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"/>',
  file: '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  piggy: '<path d="M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z"/><path d="M16 10h.01"/><path d="M2 8v1a2 2 0 0 0 2 2h1"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  eyeOff: '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
  qr: '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
  sparkles: '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
  rotate: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  chat: '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>',
  coins: '<path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 16 6 6"/><circle cx="16" cy="9" r="2.9"/><circle cx="6" cy="5" r="3"/>',
  percent: '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m15 9-6 6"/><path d="M9 9h.01"/><path d="M15 15h.01"/>',
  cash: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  trash: '<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  film: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/>',
  book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
  fuel: '<path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0v-6.998a2 2 0 0 0-.59-1.42L18 5"/><path d="M14 21V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16"/><path d="M2 21h13"/><path d="M3 9h11"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
};

// Money: bold, set tight, tabular figures
const num = 'font-variant-numeric: tabular-nums';
const money = `font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: 1; ${num}`;
// Headlines: big, regular weight, tight
const display =
  'font-family: var(--m-font-family-display); font-weight: var(--m-font-weight-regular); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)';
const pageTitle = `${display}; font-size: var(--m-font-size-3xl)`;
// Section titles: medium, 20px
const sectionTitle = 'font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium); letter-spacing: -0.01em';
const cardTitle = 'font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-medium)';
const label = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
const gain = 'color: var(--m-color-success-fg)';
const hair = 'border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)';
const strong = 'font-weight: var(--m-font-weight-medium); color: var(--m-color-fg-default)';
const plainList = 'padding: 0; margin: 0; list-style: none';

// A round icon tile: grey for most rows, ink (black, white in dark) or the brand green for emphasis
const tileColours: Record<string, [string, string]> = {
  grey: ['var(--m-color-bg-sunken)', 'var(--m-color-fg-default)'],
  ink: ['var(--m-color-fg-default)', 'var(--m-color-bg-surface)'],
  brand: ['var(--m-color-brand-default)', 'var(--m-color-brand-fg)'],
  danger: ['var(--m-color-danger-bg)', 'var(--m-color-danger-fg)'],
  info: ['var(--m-color-info-bg)', 'var(--m-color-info-fg)'],
};
const tile = (ic: string, tone = 'grey', size = 40) => {
  const [bg, fg] = tileColours[tone];
  return `<span aria-hidden="true" style="display: inline-grid; place-items: center; flex: none; inline-size: ${size}px; block-size: ${size}px; border-radius: 9999px; background: ${bg}; color: ${fg}">${icon(ic, Math.round(size / 2))}</span>`;
};
// A person: initials in a round avatar, the brand green by default, blue or ink for variety
const person = (initials: string, tone = '', size = '') => {
  const style =
    tone === 'info'
      ? ' style="background: var(--m-color-info-solid); color: var(--m-color-info-on-solid)"'
      : tone === 'ink'
        ? ' style="background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)"'
        : tone === 'grey'
          ? ' style="background: var(--m-color-accent-subtle); color: var(--m-color-fg-default)"'
          : '';
  return `<span class="m-avatar"${size ? ` data-size="${size}"` : ''}${style} aria-hidden="true">${initials}</span>`;
};
const chevron = `<span style="color: var(--m-color-fg-subtle); display: inline-flex; flex: none">${icon(I.right, 18)}</span>`;

// The wordmark: a green rounded square with a bolt, then the name
const mark = (size = 32) =>
  `<span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: ${size}px; block-size: ${size}px; border-radius: ${Math.round(size * 0.28)}px; background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">${icon(I.zap, Math.round(size * 0.6))}</span>`;
const wordmark = (size = 32) =>
  `<a href="#" class="m-cluster" data-gap="2" style="color: var(--m-color-fg-default); text-decoration: none; font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-medium); letter-spacing: -0.02em">${mark(size)}brisk</a>`;

const nav = (items: [keyof typeof I, string, string?][], current: string) =>
  items
    .map(
      ([ic, l, count]) =>
        `          <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${icon(I[ic], 20)} ${l}${count ? ` <span class="m-sidebar-count">${count}</span>` : ''}</a></li>`,
    )
    .join('\n');

// The app on a desktop: a white side column (the phone's tab bar, standing up) and a grey screen
const shell = (
  current: string,
  main: string,
  size = '',
) => `<div class="m-split" style="--m-layout-split-side: 15rem; --m-layout-split-gap: 0; min-block-size: 100vh">
  <nav class="m-sidebar" aria-label="Main">
    <div class="m-stack" data-gap="6">
      <div style="padding-inline: var(--m-space-2)">${wordmark()}</div>
      <div class="m-stack" data-gap="1" style="padding: var(--m-space-4); border-radius: 16px; background: var(--m-color-bg-sunken)">
        <span style="${label}">Balance</span>
        <span style="${money}; font-size: var(--m-font-size-xl)">$2,184.50</span>
      </div>
      <div class="m-sidebar-section">
        <ul>
${nav(
  [
    ['home', 'Overview'],
    ['transfer', 'Transfers', '2'],
    ['target', 'Goals'],
    ['card', 'Cards'],
    ['gift', 'Rewards'],
    ['chart', 'Insights'],
  ],
  current,
)}
        </ul>
      </div>
      <div class="m-sidebar-section">
        <ul>
${nav(
  [
    ['gear', 'Settings'],
    ['help', 'Support'],
  ],
  current,
)}
        </ul>
      </div>
    </div>
  </nav>
  <div class="m-stack" data-gap="0">
    <header class="m-cluster" data-justify="between" data-gap="3" style="padding: var(--m-space-5) var(--m-layout-container-padding)">
      <div style="position: relative; inline-size: min(22rem, 100%)">
        <span style="position: absolute; inset-inline-start: var(--m-space-4); inset-block: 0; display: inline-flex; align-items: center; color: var(--m-color-fg-muted)">${icon(I.search, 18)}</span>
        <input class="m-input" type="search" placeholder="Search people and payments" aria-label="Search" style="--m-input-radius: 9999px; padding-inline-start: var(--m-space-10); border-color: transparent">
      </div>
      <div class="m-cluster" data-gap="2">
        <button type="button" class="m-button" data-variant="secondary" data-icon-only aria-label="Scan a code">${icon(I.qr, 20)}</button>
        <button type="button" class="m-button" data-variant="secondary" data-icon-only aria-label="Notifications">${icon(I.bell, 20)}</button>
        <button type="button" class="m-button" data-variant="primary">${icon(I.up, 18)} Send</button>
      </div>
    </header>
    <main class="m-container"${size ? ` data-size="${size}"` : ''} style="padding-block: var(--m-space-2) var(--m-space-16)">
${main}
    </main>
  </div>
</div>`;

// ---------------------------------------------------------------------------------------------
// Dashboard: the money screen, translated. A balance card with two black pills, the green keypad,
// small cards with a ring, a sparkline and offer circles, then recent activity and spending bars

const keyRow = (keys: string[]) =>
  keys
    .map(
      (k) =>
        `<button type="button" class="m-button" data-variant="ghost" style="--m-button-ghost-fg: var(--m-color-brand-fg); --m-button-ghost-hover-bg: transparent; --m-button-ghost-active-bg: transparent; font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold); inline-size: 100%"${k === '‹' ? ' aria-label="Delete a digit"' : ''}>${k === '‹' ? icon(I.left, 22) : k}</button>`,
    )
    .join('');

const keypad = `<section class="m-card" style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg)" aria-labelledby="vt-pad">
              <div class="m-card-body m-stack" data-gap="4">
                <div class="m-cluster" data-justify="between">
                  <h2 id="vt-pad" style="${cardTitle}">Send or request</h2>
                  <span class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-sm)">${person('ND', 'ink', 'sm')} Noor Daniels</span>
                </div>
                <output style="display: block; text-align: center; font-size: 5.5rem; font-weight: var(--m-font-weight-bold); letter-spacing: -0.04em; line-height: 1; padding-block: var(--m-space-4); ${num}" aria-label="Amount: 36 dollars">$36</output>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--m-space-1)" role="group" aria-label="Keypad">
                  ${keyRow(['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '‹'])}
                </div>
                <div class="m-grid" style="--m-layout-grid-min: 8rem; --m-layout-grid-gap: var(--m-space-2)">
                  <button type="button" class="m-button" data-variant="ghost" style="--m-button-ghost-fg: var(--m-color-brand-fg); --m-button-ghost-border: var(--m-color-brand-fg); --m-button-ghost-hover-bg: transparent; inline-size: 100%">Request</button>
                  <button type="button" class="m-button" data-variant="primary" style="--m-button-primary-bg: var(--m-color-brand-fg); --m-button-primary-border: var(--m-color-brand-fg); --m-button-primary-fg: var(--m-color-brand-default); --m-button-primary-hover-bg: var(--m-color-brand-fg); inline-size: 100%">Send</button>
                </div>
              </div>
            </section>`;

// A progress ring: the goal in the brand green on a grey track
const ring = (pct: number, ic: string, size = 72) => {
  const r = 30;
  const c = 2 * Math.PI * r;
  return `<svg width="${size}" height="${size}" viewBox="0 0 72 72" role="img" aria-label="${pct}% of the goal" style="flex: none"><circle cx="36" cy="36" r="${r}" fill="none" stroke-width="5" style="stroke: var(--m-color-border-default)"/><circle cx="36" cy="36" r="${r}" fill="none" stroke-width="5" stroke-linecap="round" stroke-dasharray="${((c * pct) / 100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 36 36)" style="stroke: var(--m-color-brand-default)"/><g transform="translate(24 24)" style="color: var(--m-color-fg-default)">${icon(ic, 24)}</g></svg>`;
};

const spark = `<svg viewBox="0 0 120 48" width="120" height="48" role="img" aria-label="Up 2.4% today" style="flex: none"><polyline fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="2,40 12,34 20,38 30,22 38,28 48,26 58,30 66,18 76,22 86,12 96,16 106,8 118,4" style="stroke: var(--m-color-brand-default)"/></svg>`;

// Activity rows: a round avatar, the name and what for, the amount at the end
const activity = (who: string, name: string, sub: string, value: string, inflow = false, last = false) =>
  `                  <li class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${who}<span class="m-cluster" data-justify="between" data-gap="3" style="flex: 1; flex-wrap: nowrap; padding-block: var(--m-space-3)${last ? '' : `; ${hair}`}"><span class="m-stack" data-gap="0"><span style="${strong}">${name}</span><span style="${label}">${sub}</span></span><span style="${num}; font-weight: var(--m-font-weight-medium)${inflow ? `; ${gain}` : ''}">${value}</span></span></li>`;

// Spending by day: green bars with rounded tops, empty days as grey stubs, the scale on the right
const days = [
  ['M', 34],
  ['T', 22],
  ['W', 64],
  ['T', 0],
  ['F', 46],
  ['S', 18],
  ['S', 0],
] as const;
const bars = `<svg viewBox="0 0 320 150" width="100%" style="display: block; block-size: auto" role="img" aria-label="Spending by day this week: $186.40 in all, most on Wednesday">
                  <line x1="0" x2="284" y1="20" y2="20" stroke-width="1" style="stroke: var(--m-color-border-muted)"/><line x1="0" x2="284" y1="70" y2="70" stroke-width="1" style="stroke: var(--m-color-border-muted)"/><line x1="0" x2="284" y1="120" y2="120" stroke-width="1" style="stroke: var(--m-color-border-default)"/>
                  <text x="318" y="24" text-anchor="end" style="fill: var(--m-color-fg-muted); font-size: 10px">$80</text><text x="318" y="74" text-anchor="end" style="fill: var(--m-color-fg-muted); font-size: 10px">$40</text><text x="318" y="124" text-anchor="end" style="fill: var(--m-color-fg-muted); font-size: 10px">$0</text>
${days.map(([d, v], i) => `                  <rect x="${i * 40 + 6}" y="${v ? 120 - v * 1.25 : 116}" width="26" height="${v ? v * 1.25 : 4}" rx="${v ? 4 : 2}" style="fill: ${v ? 'var(--m-color-brand-default)' : 'var(--m-color-border-default)'}"/><text x="${i * 40 + 19}" y="140" text-anchor="middle" style="fill: var(--m-color-fg-muted); font-size: 10px">${d}</text>`).join('\n')}
                </svg>`;

const offer = (ic: string, tone: string, pct: string, what: string) =>
  `<li class="m-stack" data-gap="2" data-align="center" style="text-align: center">${tile(ic, tone, 52)}<span style="font-size: var(--m-font-size-sm); line-height: 1.25"><span style="${strong}">${pct}</span><br><span style="color: var(--m-color-fg-muted)">${what}</span></span></li>`;

const dashboard = shell(
  'Overview',
  `      <div class="m-stack" data-gap="6">
        <h1 style="${pageTitle}">Overview</h1>
        <div class="m-grid" style="--m-layout-grid-min: 21rem; align-items: start">
          <div class="m-stack" data-gap="4">
            <section class="m-card" aria-labelledby="vt-bal">
              <div class="m-card-body m-stack" data-gap="5">
                <div class="m-cluster" data-justify="between" data-align="start">
                  <div class="m-stack" data-gap="2">
                    <h2 id="vt-bal" style="${cardTitle}">Spending balance</h2>
                    <span style="${money}; font-size: var(--m-font-size-3xl)">$2,184.50</span>
                    <span style="${label}; ${num}">Account ••7712 &nbsp; Routing ••068</span>
                  </div>
                  ${chevron}
                </div>
                <div class="m-grid" style="--m-layout-grid-min: 8rem; --m-layout-grid-gap: var(--m-space-2)">
                  <button type="button" class="m-button" data-variant="primary" style="inline-size: 100%">Add funds</button>
                  <button type="button" class="m-button" data-variant="primary" style="inline-size: 100%">Cash out</button>
                </div>
              </div>
              <a href="#" class="m-cluster" data-justify="between" data-gap="3" style="flex-wrap: nowrap; padding: var(--m-space-4) var(--m-space-5); border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default); color: inherit; text-decoration: none">
                <span class="m-cluster" data-gap="2">${tile(I.check, 'brand', 22)}<span style="${strong}">Direct deposit</span></span>
                <span class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span style="${label}; ${num}">$1,120 so far in June</span>${chevron}</span>
              </a>
            </section>
            <section class="m-card" aria-labelledby="vt-recent">
              <div class="m-card-body m-stack" data-gap="1">
                <div class="m-cluster" data-justify="between">
                  <h2 id="vt-recent" style="${sectionTitle}">Recent</h2>
                  <a class="m-button" data-variant="ghost" data-size="sm" href="#">See all</a>
                </div>
                <ul class="m-stack" data-gap="0" style="${plainList}">
${activity(person('ND', 'ink'), 'Noor Daniels', 'Paid you · Rent split', '+$410.00', true)}
${activity(tile(I.bag, 'grey'), 'Kettle &amp; Crumb', 'Card · Groceries', '$38.62')}
${activity(person('MO', 'info'), 'Maya Ortiz', 'You paid · Concert seats', '$54.00')}
${activity(tile(I.car, 'grey'), 'Lanefare Rides', 'Card · Tuesday', '$17.25', false, true)}
                </ul>
              </div>
            </section>
          </div>
          <div class="m-stack" data-gap="4">
            ${keypad}
            <section class="m-card" aria-labelledby="vt-week">
              <div class="m-card-body m-stack" data-gap="3">
                <div class="m-stack" data-gap="1">
                  <h2 id="vt-week" style="${label}">Spent this week</h2>
                  <span style="${money}; font-size: var(--m-font-size-2xl)">$186.40</span>
                  <span class="m-cluster" data-gap="1" style="font-size: var(--m-font-size-sm)"><span style="display: inline-flex">${icon(I.down, 16)}</span> <span style="${strong}">$22.10</span> under last week</span>
                </div>
                ${bars}
                <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Period" style="justify-content: space-between; inline-size: 100%">
                  <button type="button" class="m-tab" role="tab" aria-selected="true">Week</button>
                  <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Month</button>
                  <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Quarter</button>
                </div></div>
              </div>
            </section>
          </div>
        </div>
        <h2 style="${sectionTitle}">Growing</h2>
        <div class="m-grid" style="--m-layout-grid-min: 15rem; align-items: stretch">
          <section class="m-card" aria-labelledby="vt-goal">
            <div class="m-card-body m-cluster" data-justify="between" data-gap="3" style="flex-wrap: nowrap">
              <div class="m-stack" data-gap="1">
                <h3 id="vt-goal" style="${cardTitle}">Moving fund</h3>
                <span style="${money}; font-size: var(--m-font-size-xl)">$3,420.00</span>
                <span style="${label}; ${num}">$580.00 to go</span>
              </div>
              ${ring(86, I.target)}
            </div>
          </section>
          <section class="m-card" aria-labelledby="vt-stocks">
            <div class="m-card-body m-cluster" data-justify="between" data-gap="3" style="flex-wrap: nowrap">
              <div class="m-stack" data-gap="1">
                <h3 id="vt-stocks" style="${cardTitle}">Stocks</h3>
                <span style="${money}; font-size: var(--m-font-size-xl)">$812.36</span>
                <span class="m-cluster" data-gap="1" style="font-size: var(--m-font-size-sm); ${gain}"><span style="display: inline-flex">${icon(I.up, 14)}</span>2.4% <span style="color: var(--m-color-fg-muted)">today</span></span>
              </div>
              ${spark}
            </div>
          </section>
          <section class="m-card" aria-labelledby="vt-offers">
            <div class="m-card-body m-stack" data-gap="3">
              <div class="m-cluster" data-justify="between"><h3 id="vt-offers" style="${cardTitle}">Deals for you</h3>${chevron}</div>
              <ul class="m-cluster" data-justify="between" data-gap="2" style="${plainList}">
                ${offer(I.fuel, 'ink', '6% off', 'fuel')}
                ${offer(I.book, 'brand', '12% off', 'books')}
                ${offer(I.film, 'ink', '$3 off', 'cinema')}
              </ul>
            </div>
          </section>
        </div>
      </div>`,
);

// ---------------------------------------------------------------------------------------------
// List and detail: payments grouped by day in white cards, chip filters, the receipt beside

const tx = (who: string, name: string, sub: string, value: string, inflow = false, last = false, current = false) =>
  `              <li><a href="#" class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding-inline: var(--m-space-3); margin-inline: calc(var(--m-space-3) * -1); border-radius: 14px; color: inherit; text-decoration: none${current ? '; background: var(--m-color-bg-sunken)' : ''}"${current ? ' aria-current="true"' : ''}>${who}<span class="m-cluster" data-justify="between" data-gap="3" style="flex: 1; flex-wrap: nowrap; padding-block: var(--m-space-3)${last || current ? '' : `; ${hair}`}"><span class="m-stack" data-gap="0"><span style="${strong}">${name}</span><span style="${label}">${sub}</span></span><span style="${num}; font-weight: var(--m-font-weight-medium)${inflow ? `; ${gain}` : ''}">${value}</span></span></a></li>`;

const day = (title: string, rows: string) => `          <section class="m-stack" data-gap="2" aria-label="${title}">
            <h2 style="${cardTitle}; padding-inline: var(--m-space-1)">${title}</h2>
            <div class="m-card" style="padding-block: var(--m-space-1)"><div class="m-card-body"><ul class="m-stack" data-gap="0" style="${plainList}">
${rows}
            </ul></div></div>
          </section>`;

// A step on the receipt: an icon, what happened, when
const step = (ic: string, title: string, sub: string) =>
  `                  <li class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap"><span style="display: inline-flex; padding-block-start: 2px">${icon(ic, 18)}</span><span class="m-stack" data-gap="0"><span style="${strong}">${title}</span><span style="${label}">${sub}</span></span></li>`;
const linkRow = (ic: string, title: string, last = false) =>
  `                  <li><a href="#" class="m-cluster" data-justify="between" data-gap="3" style="flex-wrap: nowrap; padding-block: var(--m-space-3); color: inherit; text-decoration: none${last ? '' : `; ${hair}`}"><span class="m-cluster" data-gap="3"><span style="display: inline-flex">${icon(ic, 18)}</span><span style="${strong}">${title}</span></span>${chevron}</a></li>`;

const chip = (text: string, on = false) =>
  `<button type="button" class="m-button" data-size="sm" data-variant="${on ? 'primary' : 'ghost'}" aria-pressed="${on}"${on ? '' : ' style="--m-button-ghost-border: var(--m-color-border-strong)"'}>${text}</button>`;

const listDetail = shell(
  'Transfers',
  `      <div class="m-grid" style="--m-layout-grid-min: 22rem; --m-layout-grid-gap: var(--m-space-8); align-items: start">
        <div class="m-stack" data-gap="5">
          <h1 style="${pageTitle}">Transfers</h1>
          <div class="m-cluster" data-gap="2" role="group" aria-label="Show">
            ${chip('Everything', true)}
            ${chip('Received')}
            ${chip('Sent')}
            ${chip('Pending')}
          </div>
${day(
  'Waiting on you',
  [
    tx(person('JL', 'grey'), 'Jonah Lindqvist', 'Asked for $24.00 · Pizza night', '<span class="m-badge" data-tone="warning">Request</span>', false, true),
  ].join('\n'),
)}
${day(
  'This week',
  [
    tx(person('ND', 'ink'), 'Noor Daniels', 'Rent split · Today', '+$410.00', true, false, true),
    tx(person('MO', 'info'), 'Maya Ortiz', 'Concert seats · Monday', '$54.00'),
    tx(person('TW'), 'Theo Wright', 'Gas money · Monday', '+$15.00', true),
    tx(tile(I.bank, 'grey'), 'To Pinecrest Credit', 'Cash out · Sunday', '$300.00', false, true),
  ].join('\n'),
)}
${day(
  'Earlier in June',
  [
    tx(person('AK'), 'Ama Kusi', 'Birthday gift', '$40.00'),
    tx(tile(I.cash, 'brand'), 'Payroll · Fernhill Labs', 'Direct deposit', '+$1,120.00', true),
    tx(person('RB', 'ink'), 'Rafael Bianchi', 'Climbing gym', '$22.50', false, true),
  ].join('\n'),
)}
        </div>

        <!-- The receipt: who, the amount large, what happened, what you can do -->
        <section class="m-card" aria-labelledby="vt-tx-title" style="position: sticky; inset-block-start: var(--m-space-6)">
          <div class="m-card-body m-stack" data-gap="6">
            <div class="m-cluster" data-justify="between">
              <button type="button" class="m-button" data-variant="secondary" data-size="sm" data-icon-only aria-label="Close">${icon(I.x, 18)}</button>
              <button type="button" class="m-button" data-variant="secondary" data-size="sm" data-icon-only aria-label="More for this payment">${icon(I.more, 18)}</button>
            </div>
            <div class="m-stack" data-gap="3" data-align="center" style="text-align: center">
              ${person('ND', 'ink', 'lg')}
              <div class="m-stack" data-gap="1">
                <h2 id="vt-tx-title" style="${sectionTitle}">Noor Daniels</h2>
                <span style="${label}">Today at 9:14 AM · Rent split</span>
              </div>
              <span style="${money}; font-size: var(--m-font-size-4xl); ${gain}">+$410.00</span>
              <span class="m-badge" data-tone="success">Received</span>
            </div>
            <div class="m-grid" style="--m-layout-grid-min: 9rem; --m-layout-grid-gap: var(--m-space-2)">
              <button type="button" class="m-button" data-variant="primary" style="inline-size: 100%">Pay back</button>
              <button type="button" class="m-button" data-variant="secondary" style="inline-size: 100%">${icon(I.split, 18)} Split it</button>
            </div>
            <div class="m-stack" data-gap="3">
              <h3 style="${cardTitle}">What happened</h3>
              <ul class="m-stack" data-gap="4" style="${plainList}">
${step(I.check, 'Arrived', 'In your spending balance instantly')}
${step(I.wallet, 'From', 'Noor’s brisk balance')}
${step(I.receipt, 'Reference', '<span style="font-family: var(--m-font-family-mono)">BRK-8Q4T-2291</span>')}
              </ul>
            </div>
            <div class="m-stack" data-gap="1">
              <h3 style="${cardTitle}">What you can do</h3>
              <ul class="m-stack" data-gap="0" style="${plainList}">
${linkRow(I.copy, 'Copy the receipt')}
${linkRow(I.chat, 'Get help with this payment', true)}
              </ul>
            </div>
          </div>
        </section>
      </div>`,
);

// ---------------------------------------------------------------------------------------------
// Onboarding: one question at a time on white, a green bar at the top, choice tiles, a black pill

const tileChoice = (name: string, value: string, title: string, ic: string, checked = false) =>
  `<label class="m-stack" data-gap="2" style="padding: var(--m-space-4); border-radius: 12px; border: ${checked ? '2px solid var(--m-color-fg-default)' : 'var(--m-border-width-thin) solid var(--m-color-border-strong)'}; cursor: pointer"><input class="m-sr-only" type="radio" name="${name}" value="${value}"${checked ? ' checked' : ''}><span style="display: inline-flex">${icon(ic, 22)}</span><span style="${strong}">${title}</span></label>`;

const onboarding = `<div style="min-block-size: 100vh; background: var(--m-color-bg-surface)">
  <header class="m-cluster" data-justify="between" style="padding: var(--m-space-5) var(--m-layout-container-padding)">
    ${wordmark()}
    <a class="m-button" data-variant="secondary" href="#">Log in</a>
  </header>
  <main class="m-container" data-size="sm" style="padding-block: var(--m-space-8) var(--m-space-16)">
    <form class="m-stack" data-gap="8" aria-labelledby="vt-onb-title">
      <div class="m-stack" data-gap="2">
        <span style="${label}" id="vt-onb-step">Step 2 of 4</span>
        <progress class="m-progress" value="2" max="4" aria-labelledby="vt-onb-step">2 of 4</progress>
      </div>
      <div class="m-stack" data-gap="3">
        <h1 id="vt-onb-title" style="${display}; font-size: var(--m-font-size-3xl)">What will you use brisk for first?</h1>
        <p style="color: var(--m-color-fg-muted); font-size: var(--m-font-size-lg)">Pick one. You can turn on everything else later.</p>
      </div>
      <fieldset style="border: 0; padding: 0; margin: 0">
        <legend class="m-sr-only">First thing to set up</legend>
        <div class="m-grid" style="--m-layout-grid-min: 10rem; --m-layout-grid-gap: var(--m-space-3)">
          ${tileChoice('vt-use', 'friends', 'Paying friends', I.transfer, true)}
          ${tileChoice('vt-use', 'pay', 'Getting paid', I.cash)}
          ${tileChoice('vt-use', 'save', 'Saving up', I.piggy)}
          ${tileChoice('vt-use', 'card', 'A debit card', I.card)}
        </div>
      </fieldset>
      <div class="m-field">
        <label class="m-field-label" for="vt-onb-name">Name for your profile</label>
        <input class="m-input" id="vt-onb-name" value="Jordan Lee" autocomplete="name">
      </div>
      <div class="m-field">
        <label class="m-field-label" for="vt-onb-handle">Your handle</label>
        <input class="m-input" id="vt-onb-handle" value="@jordanlee" aria-describedby="vt-onb-handle-hint">
        <p class="m-field-hint" id="vt-onb-handle-hint">Friends pay you with this. It’s free, and yours.</p>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="vt-onb-email">Email</label>
        <input class="m-input" id="vt-onb-email" type="email" value="jordan.lee@example" aria-invalid="true" aria-describedby="vt-onb-email-error">
        <p class="m-field-error" id="vt-onb-email-error">That email is missing its ending, like .com or .org.</p>
      </div>
      <div class="m-stack" data-gap="3">
        <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Next</button>
        <button type="button" class="m-button" data-variant="ghost" style="inline-size: 100%">Back</button>
      </div>
      <p style="${label}; text-align: center">By continuing you agree to the terms. brisk is a made-up app; no account is opened.</p>
    </form>
  </main>
</div>`;

// ---------------------------------------------------------------------------------------------
// Settings: the profile on top, then grouped white cards of rows: a grey round icon, a title and a
// line of help, and a chevron, a switch or a value

const setRow = (ic: string, name: string, desc: string, control: string, last = false) =>
  `              <li class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${tile(ic)}<span class="m-cluster" data-justify="between" data-gap="3" style="flex: 1; flex-wrap: nowrap; padding-block: var(--m-space-3)${last ? '' : `; ${hair}`}"><span class="m-stack" data-gap="0"><span style="${strong}">${name}</span>${desc ? `<span style="${label}">${desc}</span>` : ''}</span>${control}</span></li>`;
const go = (value = '') =>
  `<span class="m-cluster" data-gap="1" style="color: var(--m-color-fg-muted); flex-wrap: nowrap">${value}${chevron}</span>`;
const toggle = (id: string, on: boolean, name: string) =>
  `<input class="m-switch" id="${id}" type="checkbox" role="switch"${on ? ' checked' : ''} aria-label="${name}">`;
const group = (id: string, title: string, rows: string) => `        <section class="m-stack" data-gap="2" aria-labelledby="${id}">
          <h2 id="${id}" style="${sectionTitle}; padding-inline: var(--m-space-1)">${title}</h2>
          <div class="m-card" style="padding-block: var(--m-space-1)"><div class="m-card-body">
            <ul class="m-stack" data-gap="0" style="${plainList}">
${rows}
            </ul>
          </div></div>
        </section>`;

const settings = shell(
  'Settings',
  `      <div class="m-stack" data-gap="8">
        <section class="m-stack" data-gap="4" data-align="center" style="text-align: center" aria-label="Your profile">
          ${person('JL', '', 'lg')}
          <div class="m-stack" data-gap="1">
            <h1 style="${display}; font-size: var(--m-font-size-2xl)">Jordan Lee</h1>
            <span style="${label}">@jordanlee · member since 2023</span>
          </div>
          <div class="m-cluster" data-gap="2" data-justify="center">
            <button type="button" class="m-button" data-variant="secondary" data-size="sm">${icon(I.qr, 16)} My code</button>
            <button type="button" class="m-button" data-variant="secondary" data-size="sm">${icon(I.copy, 16)} Copy handle</button>
          </div>
        </section>
${group(
  'vt-set-account',
  'Account',
  [
    setRow(I.user, 'Personal info', 'Name, birthday and address', go()),
    setRow(I.bank, 'Bank accounts', 'Pinecrest Credit ••4410', go()),
    setRow(I.file, 'Statements and tax forms', 'Monthly PDFs, ready on the 3rd', go()),
    setRow(I.sparkles, 'Your plan', '', go('Boost'), true),
  ].join('\n'),
)}
${group(
  'vt-set-security',
  'Privacy and security',
  [
    setRow(I.lock, 'Passcode on payments', 'Ask for your passcode before money leaves', toggle('vt-sw-lock', true, 'Passcode on payments')),
    setRow(I.eyeOff, 'Hide balance', 'Blur amounts until you tap them', toggle('vt-sw-hide', false, 'Hide balance')),
    setRow(I.phone, 'Trusted devices', '2 phones, 1 laptop', go(), true),
  ].join('\n'),
)}
${group(
  'vt-set-notify',
  'Notifications',
  [
    setRow(I.bell, 'Payments', 'When money comes in or goes out', toggle('vt-sw-pay', true, 'Payment notifications')),
    setRow(I.gift, 'Offers', 'New offers that match how you spend', toggle('vt-sw-offers', false, 'Offer notifications')),
    setRow(I.mail, 'Email receipts', 'jordan.lee@example.com', toggle('vt-sw-receipts', true, 'Email receipts'), true),
  ].join('\n'),
)}
        <section class="m-stack" data-gap="2" aria-labelledby="vt-set-look">
          <h2 id="vt-set-look" style="${sectionTitle}; padding-inline: var(--m-space-1)">Appearance</h2>
          <div class="m-card"><div class="m-card-body m-cluster" data-justify="between" data-gap="3">
            <span class="m-cluster" data-gap="3">${tile(I.sun)}<span style="${strong}">Theme</span></span>
            <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Theme">
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Light</button>
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Dark</button>
              <button type="button" class="m-tab" role="tab" aria-selected="true">Device</button>
            </div></div>
          </div></div>
        </section>
        <div class="m-cluster" data-gap="2" data-justify="center">
          <button type="button" class="m-button" data-variant="secondary">${icon(I.logout, 18)} Sign out</button>
          <button type="button" class="m-button" data-variant="ghost" style="--m-button-ghost-fg: var(--m-color-danger-fg)">${icon(I.trash, 18)} Close account</button>
        </div>
      </div>`,
  'md',
);

// ---------------------------------------------------------------------------------------------
// Empty state: a big green circle with a black icon, a big regular title, one line, two pills

const emptyState = shell(
  'Goals',
  `      <div class="m-stack" data-gap="6">
        <h1 style="${pageTitle}">Goals</h1>
        <section class="m-card" aria-labelledby="vt-empty">
          <div class="m-card-body m-stack" data-gap="5" data-align="center" style="text-align: center; padding-block: var(--m-space-16)">
            ${tile(I.target, 'brand', 112)}
            <h2 id="vt-empty" style="${display}; font-size: var(--m-font-size-2xl)">Nothing saved up yet</h2>
            <p style="color: var(--m-color-fg-muted); font-size: var(--m-font-size-lg); max-inline-size: 28rem">Name a goal and set an amount. We’ll put a little aside every payday until you get there.</p>
            <div class="m-cluster" data-gap="2" data-justify="center">
              <button type="button" class="m-button" data-variant="primary">${icon(I.plus, 18)} Start a goal</button>
              <button type="button" class="m-button" data-variant="secondary">See how it works</button>
            </div>
          </div>
        </section>
      </div>`,
  'md',
);

// ---------------------------------------------------------------------------------------------
// Pricing: the public site. A bare bar with pill actions, a huge regular headline, three plan
// cards (the recommended one in brand green), a benefits table, big grey questions, a black footer

const tick = (t: string) =>
  `            <li class="m-cluster" data-gap="2" style="flex-wrap: nowrap; align-items: start"><span style="display: inline-flex; flex: none; padding-block-start: 2px">${icon(I.check, 18)}</span>${t}</li>`;
const plan = (
  id: string,
  name: string,
  price: string,
  per: string,
  intro: string,
  features: string[],
  hero = false,
) => `      <section class="m-card"${hero ? ' style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg)"' : ' data-variant="outline"'} aria-labelledby="vt-plan-${id}">
        <div class="m-card-body m-stack" data-gap="6" style="block-size: 100%">
          <div class="m-stack" data-gap="3">
            <div class="m-cluster" data-justify="between"><h2 id="vt-plan-${id}" style="${sectionTitle}">${name}</h2>${hero ? '<span class="m-badge" style="background: var(--m-color-brand-fg); color: var(--m-color-brand-default)">Most picked</span>' : ''}</div>
            <p class="m-cluster" data-gap="1" data-align="end"><span style="${money}; font-size: var(--m-font-size-3xl)">${price}</span><span${hero ? '' : ` style="color: var(--m-color-fg-muted)"`}>${per}</span></p>
            <p>${intro}</p>
          </div>
          <ul class="m-stack" data-gap="2" style="${plainList}; flex: 1">
${features.map(tick).join('\n')}
          </ul>
          <a class="m-button" data-variant="primary" href="#" style="inline-size: 100%${hero ? '; --m-button-primary-bg: var(--m-color-brand-fg); --m-button-primary-border: var(--m-color-brand-fg); --m-button-primary-fg: var(--m-color-brand-default); --m-button-primary-hover-bg: var(--m-color-brand-fg)' : ''}">${hero ? `Get ${name}` : `Choose ${name}`}</a>
        </div>
      </section>`;

const yes = `<span style="display: inline-flex" role="img" aria-label="Included">${icon(I.check, 20)}</span>`;
const no = `<span style="color: var(--m-color-fg-subtle)" aria-label="Not included">—</span>`;
const cmp = (feature: string, cells: string[]) =>
  `            <tr><th scope="row" style="font-weight: var(--m-font-weight-regular); color: var(--m-color-fg-default)">${feature}</th>${cells.map((c) => `<td style="text-align: end; ${num}">${c}</td>`).join('')}</tr>`;
const faq = (q: string, a: string, open = false) =>
  `        <details class="m-accordion-item" name="vt-faq"${open ? ' open' : ''}><summary>${q}</summary><div class="m-accordion-content">${a}</div></details>`;
const stat = (big: string, small: string) =>
  `<div class="m-card" data-variant="outline" style="background: transparent; color: var(--m-color-fg-inverse); --m-card-outline-border: var(--m-color-fg-subtle); border-radius: 32px"><div class="m-card-body m-stack" data-justify="between" style="min-block-size: 11rem; justify-content: space-between"><span style="${display}; font-size: var(--m-font-size-3xl)">${big}</span><span style="font-size: var(--m-font-size-sm)">${small}</span></div></div>`;

const pricing = `<div style="background: var(--m-color-bg-surface)">
<header class="m-navbar" style="background: transparent">
  ${wordmark(36)}
  <nav class="m-navbar-nav" aria-label="Main">
    <a class="m-navbar-link" href="#">Card</a>
    <a class="m-navbar-link" href="#" aria-current="page">Plans</a>
    <a class="m-navbar-link" href="#">Business</a>
    <a class="m-navbar-link" href="#">Support</a>
  </nav>
  <div class="m-navbar-actions">
    <a class="m-button" data-variant="primary" data-size="sm" href="#" style="--m-button-primary-bg: var(--m-color-brand-default); --m-button-primary-border: var(--m-color-brand-default); --m-button-primary-fg: var(--m-color-brand-fg); --m-button-primary-hover-bg: var(--m-color-brand-default)">Join brisk ${icon(I.arrowRight, 16)}</a>
    <a class="m-button" data-variant="primary" data-size="sm" href="#" style="--m-button-primary-bg: var(--m-color-bg-inverse); --m-button-primary-border: var(--m-color-bg-inverse); --m-button-primary-fg: var(--m-color-fg-inverse); --m-button-primary-hover-bg: var(--m-color-bg-inverse)">Log in</a>
  </div>
</header>
<main class="m-container" style="padding-block: var(--m-space-12) var(--m-space-16)">
  <div class="m-stack" data-gap="16">
    <div class="m-grid" style="--m-layout-grid-min: 22rem; --m-layout-grid-gap: var(--m-space-8); align-items: end">
      <h1 style="${display}; font-size: var(--m-font-size-4xl)">Pick how hard your money works</h1>
      <div class="m-stack" data-gap="4">
        <p style="font-size: var(--m-font-size-lg)">Every account sends, spends and saves for free. Plans add more back on what you already do, and you can leave whenever you like.</p>
        <p style="${label}">brisk is a made-up app. Plans and prices are examples.</p>
      </div>
    </div>
    <div class="m-grid" style="--m-layout-grid-min: 17rem; align-items: stretch">
${plan('starter', 'Starter', '$0', '/ month', 'Send, spend and save with nothing to pay.', ['Instant transfers to friends', 'A debit card in four colours', 'One savings goal'])}
${plan('boost', 'Boost', '$5', '/ month', 'More back on everyday spending.', ['Everything in Starter', 'Weekly offers picked for you', 'Up to 10 savings goals', '3.1% on savings'], true)}
${plan('turbo', 'Turbo', '$12', '/ month', 'For the ones who move money all day.', ['Everything in Boost', 'Free same-day cash outs', 'Two cards on one balance', 'A support line that answers'])}
    </div>
    <section class="m-stack" data-gap="6" aria-labelledby="vt-compare">
      <h2 id="vt-compare" style="${display}; font-size: var(--m-font-size-3xl)">Side by side</h2>
      <div class="m-table-wrap" style="background: var(--m-color-bg-sunken); padding: var(--m-space-2) var(--m-space-4); border-radius: 24px; --m-table-bg: transparent; --m-table-header-bg: transparent">
        <table class="m-table">
          <thead><tr><th scope="col">What you get</th><th scope="col" style="text-align: end">Starter</th><th scope="col" style="text-align: end">Boost</th><th scope="col" style="text-align: end">Turbo</th></tr></thead>
          <tbody>
${cmp('Sending to friends', [yes, yes, yes])}
${cmp('Savings goals', ['1', '10', 'No limit'])}
${cmp('Interest on savings', ['1.2%', '3.1%', '3.1%'])}
${cmp('Same-day cash out', ['$1.75', '$0.75', 'Free'])}
${cmp('Weekly offers', [no, yes, yes])}
${cmp('Second card', [no, no, yes])}
          </tbody>
        </table>
      </div>
    </section>
    <section class="m-stack" data-gap="4" aria-labelledby="vt-faq">
      <h2 id="vt-faq" style="${display}; font-size: var(--m-font-size-3xl)">Questions, answered</h2>
      <div class="m-accordion" style="border-inline-width: 0; border-block-start-width: 0; --m-accordion-summary-size: var(--m-font-size-2xl); --m-accordion-padding-y: var(--m-space-5)">
${faq('Can I change plans whenever I want?', 'Yes. Moving up starts right away; moving down starts at the end of the month you’ve paid for.', true)}
${faq('Is there a minimum to keep in my account?', 'No. Starter has no minimum and no monthly charge.')}
${faq('What happens to my goals if I move to Starter?', 'They all stay, money and all. You just can’t add a new one until you’re under the limit.')}
${faq('How is the plan paid for?', 'From your spending balance on the same day each month. We’ll remind you two days before.')}
      </div>
    </section>
  </div>
</main>
<footer style="background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse); padding: var(--m-space-16) var(--m-layout-container-padding)">
  <div class="m-stack" data-gap="10" style="max-inline-size: var(--m-layout-container-max-lg); margin-inline: auto">
    <h2 style="${display}; font-size: var(--m-font-size-3xl)">Money that keeps up with you</h2>
    <div class="m-grid" style="--m-layout-grid-min: 12rem">
      ${stat('2m+', 'People paid this year')}
      ${stat('4.8', 'Average rating from reviews')}
      ${stat('8 sec', 'Typical time to send')}
      <a href="#" class="m-card" style="border-radius: 32px; background: var(--m-color-brand-default); color: var(--m-color-brand-fg); text-decoration: none"><div class="m-card-body m-stack" style="min-block-size: 11rem; justify-content: space-between"><span style="${display}; font-size: var(--m-font-size-3xl)">Join today</span><span style="display: inline-flex">${icon(I.arrowRight, 32)}</span></div></a>
    </div>
    <p style="font-size: var(--m-font-size-xs); opacity: 0.7">brisk is a made-up app used to show this design. Nothing here is a real offer.</p>
  </div>
</footer>
</div>`;

// ---------------------------------------------------------------------------------------------
// Errors: red field errors, a notice above the form, a notification-card toast, a green 404 slab,
// and white cards for failure and no access

const errorCard = (code: string, ic: string, tone: string, title: string, body: string, actions: string) => `    <section class="m-card" aria-labelledby="vt-err-${code}">
      <div class="m-card-body m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-12)">
        ${tile(ic, tone, 80)}
        <span style="${label}; font-family: var(--m-font-family-mono)">Error ${code}</span>
        <h2 id="vt-err-${code}" style="${display}; font-size: var(--m-font-size-2xl)">${title}</h2>
        <p style="color: var(--m-color-fg-muted); max-inline-size: 28rem">${body}</p>
        <div class="m-cluster" data-gap="2" data-justify="center">${actions}</div>
      </div>
    </section>`;

const errors = `<main class="m-container" data-size="md" style="padding-block: var(--m-space-12)">
  <div class="m-stack" data-gap="10">
    <form class="m-card" aria-labelledby="vt-err-form">
      <div class="m-card-body m-stack" data-gap="5">
        <h1 id="vt-err-form" style="${display}; font-size: var(--m-font-size-2xl)">Send to someone new</h1>
        <div class="m-alert" data-tone="danger" role="alert">
          <span class="m-alert-icon">${icon(I.alert, 20)}</span>
          <div class="m-alert-content"><div class="m-alert-title">Two things to fix</div><div class="m-alert-body">Nothing was sent. Check the handle and the amount, then try again.</div></div>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="vt-err-to">To</label>
          <input class="m-input" id="vt-err-to" value="@theo-wrigth" aria-invalid="true" aria-describedby="vt-err-to-e">
          <p class="m-field-error" id="vt-err-to-e">No one has that handle. Did you mean @theowright?</p>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="vt-err-amount">Amount</label>
          <input class="m-input" id="vt-err-amount" value="$2,400.00" aria-invalid="true" aria-describedby="vt-err-amount-e" style="${money}; font-size: var(--m-font-size-xl)">
          <p class="m-field-error" id="vt-err-amount-e">That’s more than your $2,184.50 balance. Lower it or add funds first.</p>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="vt-err-for">For</label>
          <input class="m-input" id="vt-err-for" value="Gas money">
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 10rem; --m-layout-grid-gap: var(--m-space-2)">
          <button type="button" class="m-button" data-variant="secondary" style="inline-size: 100%">Cancel</button>
          <button type="submit" class="m-button" data-variant="primary" style="inline-size: 100%">Send</button>
        </div>
      </div>
    </form>
    <section class="m-stack" data-gap="3" aria-label="A toast">
      <div class="m-toast" data-tone="danger" role="alert" style="max-inline-size: 30rem; align-items: center"><div class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${tile(I.alert, 'danger')}<div class="m-toast-content"><div class="m-toast-title">Your $15.00 to Theo didn’t go through</div><div class="m-toast-body">The money is still in your balance.</div></div></div><button type="button" class="m-button" data-variant="primary" data-size="sm">Retry</button></div>
    </section>
    <section class="m-card" style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg)" aria-labelledby="vt-err-404">
      <div class="m-card-body m-stack" data-gap="5" style="padding: var(--m-space-12) var(--m-space-10)">
        <span style="${display}; font-size: 8rem; line-height: 0.9; letter-spacing: -0.05em">404</span>
        <h2 id="vt-err-404" style="${display}; font-size: var(--m-font-size-2xl); max-inline-size: 24rem">This page took the money and ran</h2>
        <div><a class="m-button" data-variant="primary" href="#" style="--m-button-primary-bg: var(--m-color-brand-fg); --m-button-primary-border: var(--m-color-brand-fg); --m-button-primary-fg: var(--m-color-brand-default); --m-button-primary-hover-bg: var(--m-color-brand-fg)">${icon(I.home, 18)} Go home</a></div>
      </div>
    </section>
${errorCard('500', I.rotate, 'ink', 'We tripped on our end', 'No money moved. Give it a minute and try again; if it keeps happening, message us from Support.', `<button type="button" class="m-button" data-variant="primary">Try again</button><a class="m-button" data-variant="secondary" href="#">${icon(I.help, 18)} Support</a>`)}
${errorCard('403', I.lock, 'grey', 'This one isn’t yours to open', 'Only the person who set up this shared goal can change it. Ask them to add you as a member.', `<button type="button" class="m-button" data-variant="primary">Ask to join</button><a class="m-button" data-variant="ghost" href="#">${icon(I.back, 18)} Back</a>`)}
  </div>
</main>`;

export const voltRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'The money screen on a desktop: a balance card with black pills, the green keypad with huge numerals, spending bars with a period switch, recent activity, and small cards with a goal ring, a sparkline and offer circles.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'Chip filters above payments grouped in white cards, round avatars and amounts at the end; the open one beside as a receipt: the person, the amount large, two pills, what happened and what you can do.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One question at a time on white: a green progress bar, a big regular title, choice tiles that take a 2px black line when picked, fields, and a full-width black pill.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'The profile centred on top, then titled groups of rows in white cards: a grey round icon, a title and a line of help, and a chevron, a switch or a value. Sign out and close account at the end.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description: 'A big green circle with a black icon, a big regular title, one friendly line, a black pill and a grey pill.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The public site: a bare bar with a green and a black pill, a huge regular headline, three plan cards with the picked one in green, a side-by-side table, big grey questions, and a black footer with outlined stat cards and a green call to action.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Red field errors that say how to fix it, a red notice above the form that says nothing was sent, a white notification toast, the green not-found slab, and white cards for failure and no access.',
    html: errors,
  },
];
