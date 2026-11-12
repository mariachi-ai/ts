import type { ArchetypeRecipe } from '../types';

/*
 * Vellum's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from a personal journal ("Keepsake"). They follow the
 * language's real screen patterns, translated from a native desktop and phone app to the web: a
 * cool grey journal column with square colour swatches and counts, a timeline with the weekday and
 * a big day numeral in a bordered tile, bold month headings, the entry at a reading width in a warm
 * humanist face, grey grouped panels with large corners, pill buttons, and photos drawn as token
 * shapes (never images).
 */

// Lucide icons, outlined, 1.5px stroke (the platform's regular-weight glyphs)
const icon = (paths: string, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  pen: '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>',
  feather: '<path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  map: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
  cal: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  clip: '<path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  quote: '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  wifiOff: '<path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.177-2.643"/><path d="M22 8.82a15 15 0 0 0-11.288-3.764"/><path d="m2 2 20 20"/>',
};

// The journals, each with its own colour, drawn from tokens
const J = {
  all: 'var(--m-color-fg-default)',
  notebook: 'var(--m-color-brand-default)',
  garden: 'var(--m-color-success-solid)',
  kitchen: 'var(--m-color-warning-solid)',
  letters: 'var(--m-color-danger-solid)',
  work: 'var(--m-color-accent-default)',
};
const swatch = (c: string, size = '0.75rem') =>
  `<span aria-hidden="true" style="flex: none; inline-size: ${size}; block-size: ${size}; border-radius: 3px; background: ${c}"></span>`;

// A photo, drawn as a token shape: a pale field, a sun and two hills in one hue
const tones = {
  sky: ['var(--m-color-brand-subtle)', 'var(--m-color-brand-default)'],
  leaf: ['var(--m-color-success-bg)', 'var(--m-color-success-solid)'],
  dusk: ['var(--m-color-warning-bg)', 'var(--m-color-warning-solid)'],
  rose: ['var(--m-color-danger-bg)', 'var(--m-color-danger-solid)'],
  ink: ['var(--m-color-bg-sunken)', 'var(--m-color-fg-subtle)'],
} as const;
const photo = (tone: keyof typeof tones, style = 'inline-size: 4.5rem; block-size: 4.5rem', label = 'Photo') =>
  `<svg viewBox="0 0 120 90" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}" style="display: block; flex: none; border-radius: var(--m-radius-sm); ${style}"><rect width="120" height="90" style="fill: ${tones[tone][0]}"/><circle cx="88" cy="26" r="11" style="fill: var(--m-color-warning-solid); opacity: 0.55"/><path d="M0 70 L34 38 L62 64 L80 50 L120 80 L120 90 L0 90 Z" style="fill: ${tones[tone][1]}; opacity: 0.45"/><path d="M0 90 L0 78 L44 56 L86 90 Z" style="fill: ${tones[tone][1]}; opacity: 0.8"/></svg>`;

const muted = 'color: var(--m-color-fg-muted)';
const subtle = 'color: var(--m-color-fg-subtle)';
const small = 'font-size: var(--m-font-size-sm)';
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)';
const largeTitle =
  'font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)';
const sectionTitle = 'font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold)';
const entryFace = 'font-family: var(--m-font-family-display)';

// The journal column: no logo, the app's views, the journals with swatches and counts, then the rest
const navRow = (lead: string, label: string, count: string | null, current: string) =>
  `        <li><a class="m-sidebar-link" href="#"${label === current ? ' aria-current="page"' : ''}>${lead} ${label}${count ? ` <span class="m-sidebar-count">${count}</span>` : ''}</a></li>`;
const rule = `    <hr class="m-divider" style="margin: var(--m-space-1) var(--m-space-3)">`;
const sidebar = (current: string) => `  <nav class="m-sidebar" aria-label="Journals">
    <div class="m-cluster" data-gap="2" style="padding: var(--m-space-2) var(--m-space-3)">
      <span class="m-avatar" data-size="sm" style="border-radius: var(--m-radius-md); background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)">${icon(I.feather, 14)}</span>
      <span style="font-weight: var(--m-font-weight-semibold)">Keepsake</span>
    </div>
    <div class="m-sidebar-section">
      <ul>
${navRow(icon(I.home, 15), 'Home', null, current)}
${navRow(icon(I.history, 15), 'Years ago', '4', current)}
${navRow(icon(I.star, 15), 'Starred', '12', current)}
      </ul>
    </div>
${rule}
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Journals</h2>
      <ul>
${navRow(swatch(J.all), 'Everything', '486', current)}
${navRow(swatch(J.notebook), 'Notebook', '231', current)}
${navRow(swatch(J.garden), 'Garden log', '64', current)}
${navRow(swatch(J.kitchen), 'Kitchen', '38', current)}
${navRow(swatch(J.letters), 'Letters to Ada', '17', current)}
${navRow(swatch(J.work), 'Work diary', '136', current)}
${navRow(icon(I.plus, 15), 'Add a journal', null, current)}
      </ul>
    </div>
${rule}
    <div class="m-sidebar-section">
      <ul>
${navRow(icon(I.trash, 15), 'Recently deleted', '3', current)}
${navRow(icon(I.gear, 15), 'Preferences', null, current)}
      </ul>
    </div>
  </nav>`;

const shell = (current: string, main: string) => `<div class="m-split" style="--m-layout-split-gap: 0; min-block-size: 100vh">
${sidebar(current)}
  <div>
${main}
  </div>
</div>`;

// The date column: the weekday in small capitals over a big day numeral, in a bordered tile
const dateTile = (dow: string, day: string) =>
  `<span class="m-stack" data-gap="0" data-align="center" style="flex: none; inline-size: 3.25rem; padding-block: var(--m-space-2); border: var(--m-border-width-thin) solid var(--m-color-border-default); border-radius: var(--m-radius-md); background: var(--m-color-bg-surface); color: var(--m-color-fg-default); line-height: 1"><span style="font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-wide); ${muted}">${dow}</span><span style="font-size: var(--m-font-size-2xl); font-variant-numeric: tabular-nums; margin-block-start: var(--m-space-1)">${day}</span></span>`;
const meta = (journal: string, color: string, rest: string) =>
  `<span style="font-size: var(--m-font-size-xs); ${muted}">${swatch(color, '0.5rem').replace('flex: none;', 'display: inline-block; vertical-align: 0.05em; margin-inline-end: 0.3em;')}<span style="color: var(--m-color-accent-text); font-weight: var(--m-font-weight-medium)">${journal}</span> · ${rest}</span>`;
const clamp2 = 'display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden';

// One entry row in the timeline. The open one fills with its journal's colour.
const entry = (o: {
  dow?: string;
  day?: string;
  title: string;
  text: string;
  journal: string;
  color: string;
  rest: string;
  pic?: keyof typeof tones;
  open?: boolean;
}) => {
  const openStyle = o.open ? '; background: var(--m-color-brand-default); color: var(--m-color-brand-fg)' : '';
  return `          <li>
            <a href="#" class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap; padding: var(--m-space-3) var(--m-space-4); color: inherit; text-decoration: none; ${hair}${openStyle}"${o.open ? ' aria-current="true"' : ''}>
              ${o.dow ? dateTile(o.dow, o.day ?? '') : '<span aria-hidden="true" style="flex: none; inline-size: 3.25rem"></span>'}
              <span class="m-stack" data-gap="1" style="flex: 1; min-inline-size: 0">
                <span style="font-weight: var(--m-font-weight-semibold)">${o.title}</span>
                <span style="${clamp2}">${o.text}</span>
                ${o.open ? `<span style="font-size: var(--m-font-size-xs)">${o.journal} · ${o.rest}</span>` : meta(o.journal, o.color, o.rest)}
              </span>
              ${o.pic ? photo(o.pic) : ''}
            </a>
          </li>`;
};
const month = (label: string) =>
  `          <li style="padding: var(--m-space-4) var(--m-space-4) var(--m-space-2); ${hair}"><h3 style="${sectionTitle}">${label}</h3></li>`;

// A grouped panel row: icon, label, count and chevron; rows are split by an inset hairline
const groupRow = (ic: string, label: string, value: string) =>
  `<a href="#" class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding: var(--m-space-3) var(--m-space-4); color: inherit; text-decoration: none"><span style="display: inline-flex">${icon(ic, 18)}</span><span style="flex: 1">${label}</span><span style="${subtle}">${value}</span><span style="display: inline-flex; ${subtle}">${icon(I.right, 14)}</span></a>`;
const inset = '<hr class="m-divider" style="margin: 0 0 0 calc(var(--m-space-4) * 2 + 18px)">';

// ---------- Dashboard: Home, the day at a glance ----------

const calDays = () => {
  const written = new Set([2, 3, 5, 6, 9, 10, 11, 14, 16, 17, 18, 21, 23, 24, 25, 28]);
  const cells: string[] = [];
  for (let i = 0; i < 6; i++) cells.push('<span></span>');
  for (let d = 1; d <= 30; d++) {
    const on = written.has(d);
    const today = d === 28;
    const style = on
      ? 'background: var(--m-color-brand-default); color: var(--m-color-brand-fg); font-weight: var(--m-font-weight-semibold)'
      : 'color: var(--m-color-fg-default)';
    cells.push(
      `<span style="display: grid; place-items: center; aspect-ratio: 5 / 4; border-radius: var(--m-radius-md); font-variant-numeric: tabular-nums; ${style}${today ? '; outline: 2px solid var(--m-color-accent-default); outline-offset: 1px' : ''}"${today ? ' aria-current="date"' : ''}>${d}</span>`,
    );
  }
  return cells.join('');
};

const stat = (label: string, value: string) =>
  `<div class="m-card" style="padding: var(--m-space-3) var(--m-space-4)"><div class="m-stack" data-gap="1"><span style="font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-semibold); text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide); ${muted}">${label}</span><span style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold); font-variant-numeric: tabular-nums">${value}</span></div></div>`;

const pastEntry = (when: string, title: string, text: string, pic: keyof typeof tones) =>
  `<a href="#" class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap; padding: var(--m-space-3) 0; color: inherit; text-decoration: none; ${hair}">
                <span class="m-stack" data-gap="1" style="flex: 1; min-inline-size: 0"><span style="font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-semibold); text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide); color: var(--m-color-accent-text)">${when}</span><span style="font-weight: var(--m-font-weight-semibold)">${title}</span><span class="m-muted" style="${small}; ${clamp2}">${text}</span></span>
                ${photo(pic, 'inline-size: 3.5rem; block-size: 3.5rem')}
              </a>`;

const dashboard = shell(
  'Home',
  `    <main class="m-container" style="padding-block: var(--m-space-8) var(--m-space-12)">
      <div class="m-grid" style="--m-layout-grid-min: 22rem; --m-layout-grid-gap: var(--m-space-10); align-items: start">
        <div class="m-stack" data-gap="8">
          <header class="m-cluster" data-justify="between" data-align="start">
            <div class="m-stack" data-gap="1">
              <h1 style="${largeTitle}">Home</h1>
              <span class="m-subtle">Saturday, 28 September</span>
            </div>
            <div class="m-cluster" data-gap="2">
              <button type="button" class="m-button" data-icon-only aria-label="Previous day">${icon(I.left, 16)}</button>
              <button type="button" class="m-button" data-icon-only aria-label="Next day">${icon(I.right, 16)}</button>
            </div>
          </header>
          <div class="m-grid" style="--m-layout-grid-min: 11rem; --m-layout-grid-gap: var(--m-space-3)">
            <a href="#" class="m-button" data-size="lg" style="justify-content: space-between; font-weight: var(--m-font-weight-medium)">2 entries today <span style="display: inline-flex; flex: none; color: var(--m-color-accent-text)">${icon(I.plus, 16)}</span></a>
            <a href="#" class="m-button" data-size="lg" style="justify-content: space-between; font-weight: var(--m-font-weight-medium)">4 from years ago <span style="display: inline-flex; flex: none; ${subtle}">${icon(I.right, 16)}</span></a>
          </div>
          <section class="m-stack" data-gap="3" aria-labelledby="vl-question">
            <h2 id="vl-question" style="${sectionTitle}">A question for today</h2>
            <p class="m-muted">What did you notice this week that you would have missed a year ago?</p>
            <button type="button" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">${icon(I.pen, 16)} Write about it</button>
            <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="align-self: center">Another question</button>
          </section>
          <section class="m-stack" data-gap="2" aria-labelledby="vl-moments">
            <h2 id="vl-moments" style="${sectionTitle}">Start from a moment</h2>
            <p class="m-muted" style="${small}">Turn something from today into an entry.</p>
            <div class="m-card" style="padding: var(--m-space-1) 0; gap: 0">
              ${groupRow(I.image, 'Photos from today', '6')}
              ${inset}
              ${groupRow(I.pin, 'Places you went', '3')}
              ${inset}
              ${groupRow(I.mic, 'Voice memos', '1')}
            </div>
          </section>
        </div>
        <div class="m-stack" data-gap="8">
          <section class="m-stack" data-gap="3" aria-labelledby="vl-cal">
            <div class="m-cluster" data-justify="between">
              <h2 id="vl-cal" style="${sectionTitle}">September</h2>
              <span class="m-muted" style="${small}">16 days written</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: var(--m-space-1); text-align: center">
              ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => `<span style="font-size: var(--m-font-size-xs); ${muted}; padding-block-end: var(--m-space-1)">${d}</span>`).join('')}
              ${calDays()}
            </div>
          </section>
          <section class="m-stack" data-gap="1" aria-labelledby="vl-past">
            <h2 id="vl-past" style="${sectionTitle}; padding-block-end: var(--m-space-2)">From years ago</h2>
            <div class="m-stack" data-gap="0">
              ${pastEntry('1 year ago', 'First tomatoes off the vine', 'Three of them, split from the rain but still the best thing I ate all week.', 'leaf')}
              ${pastEntry('3 years ago', 'The ferry to Inishmore', 'Grey water, a dog asleep on the deck, and the island arriving slowly out of the fog.', 'sky')}
            </div>
          </section>
          <section class="m-stack" data-gap="3" aria-labelledby="vl-stats">
            <h2 id="vl-stats" style="${sectionTitle}">This journal</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--m-space-2)">
              <div class="m-card" style="grid-row: span 2; display: grid; place-items: center; text-align: center"><div class="m-stack" data-gap="1" data-align="center"><span style="display: inline-flex; color: var(--m-color-warning-fg)">${icon(I.flame, 18)}</span><span style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-bold); line-height: 1">11</span><span style="font-weight: var(--m-font-weight-semibold)">day streak</span></div></div>
              ${stat('Entries', '231')}
              ${stat('Photos', '418')}
              ${stat('Words', '64,210')}
              ${stat('Places', '57')}
            </div>
          </section>
        </div>
      </div>
    </main>`,
);

// ---------- List and detail: the timeline beside the open entry ----------

const toolbarBtn = (ic: string, label: string, current = false) =>
  `<button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="${label}"${current ? ' aria-pressed="true" style="color: var(--m-color-fg-default); background: var(--m-color-bg-sunken)"' : ` style="color: var(--m-color-fg-subtle)"`}>${icon(ic, 18)}</button>`;

const listDetail = shell(
  'Notebook',
  `    <div class="m-split" style="--m-layout-split-side: 24rem; --m-layout-split-gap: 0; min-block-size: 100vh">
      <section aria-label="Notebook timeline" style="border-inline-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
        <div class="m-cluster" data-justify="between" style="padding: var(--m-space-2) var(--m-space-3); background: var(--m-color-bg-surface)">
          <div class="m-cluster" data-gap="1" role="group" aria-label="View">
            ${toolbarBtn(I.list, 'Timeline', true)}
            ${toolbarBtn(I.grid, 'Photos')}
            ${toolbarBtn(I.cal, 'Calendar')}
            ${toolbarBtn(I.map, 'Places')}
          </div>
          ${toolbarBtn(I.search, 'Search entries')}
        </div>
        <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
${month('September 2026')}
${entry({ dow: 'SAT', day: '28', title: 'Low tide at Saltcoats', text: 'We walked out further than I thought the sand would let us, past the old pier posts and the pools full of tiny crabs.', journal: 'Notebook', color: J.notebook, rest: '7:42 PM · Ardrossan · 14° Cloudy', pic: 'sky', open: true })}
${entry({ title: 'A quiet Saturday morning', text: 'Coffee on the step before anyone else was up. The street sounded different with the market closed.', journal: 'Notebook', color: J.notebook, rest: '8:05 AM · Home' })}
${entry({ dow: 'WED', day: '25', title: 'Ada’s first day at the new school', text: 'She wanted to walk the last bit on her own. I watched from the corner until the door closed behind her.', journal: 'Notebook', color: J.notebook, rest: '3:30 PM · 16° Sunny', pic: 'dusk' })}
${entry({ dow: 'MON', day: '23', title: 'Bread, attempt four', text: 'Finally an open crumb. Longer proof, wetter dough, and not opening the oven door to check every ten minutes.', journal: 'Notebook', color: J.notebook, rest: '6:12 PM · Home', pic: 'rose' })}
${month('August 2026')}
${entry({ dow: 'FRI', day: '30', title: 'Storm over the hills', text: 'Watched it come in from the west for nearly an hour. The light went copper just before the rain.', journal: 'Notebook', color: J.notebook, rest: '9:20 PM · Kilbirnie · 18° Rain', pic: 'ink' })}
${entry({ dow: 'TUE', day: '27', title: 'Notes from the long drive', text: 'Six hours, two podcasts, one wrong turn that turned out to be the best part of the day.', journal: 'Notebook', color: J.notebook, rest: '11:48 AM · A82' })}
        </ul>
      </section>
      <article aria-labelledby="vl-entry-title" style="display: flex; flex-direction: column">
        <div class="m-cluster" data-justify="between" style="padding: var(--m-space-2) var(--m-space-4)">
          <div class="m-cluster" data-gap="3">
            ${toolbarBtn(I.x, 'Close entry')}
            <span class="m-subtle">Saturday, 28 September 2026</span>
          </div>
          <div class="m-cluster" data-gap="1">
            ${toolbarBtn(I.more, 'More')}
            ${toolbarBtn(I.plus, 'New entry')}
          </div>
        </div>
        <div class="m-prose" style="${entryFace}; flex: 1; padding: var(--m-space-6) clamp(1rem, 4vw, 3rem) var(--m-space-10)">
          <h1 id="vl-entry-title" style="${entryFace}; font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold)">Low tide at Saltcoats</h1>
          <p>We walked out further than I thought the sand would let us, past the old pier posts and the pools full of tiny crabs. Ada named every one of them and then forgot the names by the time we turned back.</p>
          ${photo('sky', 'inline-size: 100%; block-size: auto; aspect-ratio: 3 / 2', 'Photo: the beach at low tide')}
          <p>The wind dropped just as the sun went. Everything turned the same pale grey, sea and sky and sand, and for a few minutes there was no horizon at all.</p>
          <blockquote>The sea went out so far it felt like it might not come back.</blockquote>
        </div>
        <footer class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-4); ${small}">
          <span class="m-cluster" data-gap="3"><span style="color: var(--m-color-accent-text)">Notebook</span><span class="m-subtle">14° Cloudy</span><span class="m-subtle">Ardrossan, North Ayrshire</span></span>
          <span class="m-cluster" data-gap="1">${toolbarBtn(I.tag, 'Tags')}${toolbarBtn(I.clip, 'Attach')}</span>
        </footer>
      </article>
    </div>`,
);

// ---------- Onboarding: make the first journal ----------

const colourChoice = (name: string, c: string, checked = false) =>
  `<label class="m-stack" data-gap="1" data-align="center" style="cursor: pointer; ${small}"><input class="m-radio" type="radio" name="vl-colour" value="${name}"${checked ? ' checked' : ''} aria-label="${name}"><span aria-hidden="true" style="display: block; inline-size: 2.25rem; block-size: 2.25rem; border-radius: var(--m-radius-md); background: ${c}"></span>${name}</label>`;

const onboarding = `<main style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  <div style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg); padding: var(--m-space-12) 0 var(--m-space-16)">
    <div class="m-container" data-size="sm">
      <div class="m-stack" data-gap="2">
        <span style="font-weight: var(--m-font-weight-semibold)">Step 2 of 3</span>
        <h1 style="${largeTitle}">Make your first journal</h1>
        <p>Keep one for everything, or one for each part of your life. You can add more at any time.</p>
      </div>
    </div>
  </div>
  <div class="m-container" data-size="sm" style="margin-block-start: calc(var(--m-space-8) * -1)">
    <form class="m-stack" data-gap="6" style="background: var(--m-color-bg-canvas); border-start-start-radius: 28px; border-start-end-radius: 28px; padding: var(--m-space-8) var(--m-space-2) var(--m-space-12)">
      <progress class="m-progress" max="3" value="2" aria-label="Setup, step 2 of 3"></progress>
      <div class="m-field">
        <label class="m-field-label" for="vl-ob-name">Journal name</label>
        <input class="m-input" id="vl-ob-name" value="Notebook" data-size="lg">
        <p class="m-field-hint">Only you can see this. Rename it whenever you like.</p>
      </div>
      <fieldset class="m-stack" data-gap="3" style="border: 0; padding: 0; margin: 0">
        <legend class="m-field-label" style="padding-block-end: var(--m-space-3)">Colour</legend>
        <div class="m-cluster" data-gap="4">
          ${colourChoice('Sky', J.notebook, true)}
          ${colourChoice('Fern', J.garden)}
          ${colourChoice('Amber', J.kitchen)}
          ${colourChoice('Poppy', J.letters)}
          ${colourChoice('Deep', J.work)}
          ${colourChoice('Charcoal', J.all)}
        </div>
      </fieldset>
      <div class="m-card" style="padding: 0; gap: 0">
        <label class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-4)"><span class="m-stack" data-gap="0"><span>Remind me to write</span><span class="m-muted" style="${small}">Every evening at 9:00 PM</span></span><input class="m-switch" type="checkbox" role="switch" checked></label>
        <label class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-4); ${hair}; margin-inline-start: var(--m-space-4); padding-inline-start: 0"><span>Add place and weather to new entries</span><input class="m-switch" type="checkbox" role="switch" checked></label>
        <label class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-4); ${hair}; margin-inline-start: var(--m-space-4); padding-inline-start: 0"><span>Show a question each day</span><input class="m-switch" type="checkbox" role="switch"></label>
      </div>
      <div class="m-stack" data-gap="2">
        <button type="submit" class="m-button" data-variant="primary" data-size="lg">Continue</button>
        <button type="button" class="m-button" data-variant="ghost">Back</button>
      </div>
    </form>
  </div>
</main>`;

// ---------- Settings: a section list beside grouped panels of rows ----------

const setRow = (label: string, control: string, first = false, help = '') =>
  `<div class="m-cluster" data-justify="between" data-gap="4" style="flex-wrap: nowrap; padding: var(--m-space-3) var(--m-space-4)${first ? '' : `; ${hair}`}"><span class="m-stack" data-gap="0"><span>${label}</span>${help ? `<span class="m-muted" style="${small}">${help}</span>` : ''}</span>${control}</div>`;
const sel = (id: string, label: string, options: string[]) =>
  `<select class="m-select" id="${id}" aria-label="${label}" data-size="sm" style="inline-size: 11rem">${options.map((o, i) => `<option${i === 0 ? ' selected' : ''}>${o}</option>`).join('')}</select>`;
const sw = (label: string, on: boolean) =>
  `<input class="m-switch" type="checkbox" role="switch" aria-label="${label}"${on ? ' checked' : ''}>`;
const settingsSections = ['Profile', 'Writing', 'Look and feel', 'Reminders', 'Privacy and lock', 'Backups', 'Connected apps', 'Help'];

const settings = shell(
  'Preferences',
  `    <div class="m-split" style="--m-layout-split-side: 14rem; --m-layout-split-gap: 0; min-block-size: 100vh">
      <nav aria-label="Preferences" style="background: var(--m-color-bg-sunken); padding: var(--m-space-6) var(--m-space-3)">
        <ul class="m-stack" data-gap="1" style="padding: 0; list-style: none">
${settingsSections
  .map(
    (s) =>
      `          <li><a href="#" style="display: block; padding: var(--m-space-2) var(--m-space-4); border-radius: var(--m-radius-md); text-decoration: none; ${s === 'Look and feel' ? 'background: var(--m-color-accent-default); color: var(--m-color-accent-fg)" aria-current="page"' : 'color: var(--m-color-fg-default)"'}>${s}</a></li>`,
  )
  .join('\n')}
        </ul>
      </nav>
      <main>
        <div class="m-cluster" data-justify="between" style="padding: var(--m-space-4) var(--m-space-6); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
          <h1 style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-bold)">Look and feel</h1>
          ${toolbarBtn(I.x, 'Close preferences')}
        </div>
        <div class="m-container" data-size="md" style="padding-block: var(--m-space-6) var(--m-space-12)">
          <div class="m-stack" data-gap="8">
            <section class="m-stack" data-gap="2" aria-labelledby="vl-set-app">
              <h2 id="vl-set-app" class="m-muted" style="${small}; font-weight: var(--m-font-weight-semibold); padding-inline: var(--m-space-4)">Appearance</h2>
              <div class="m-card" data-variant="outline" style="padding: 0; gap: 0; border-radius: var(--m-radius-md)">
                ${setRow('Theme', sel('vl-theme', 'Theme', ['Match the system', 'Light', 'Dark']), true)}
                ${setRow('Entry font', sel('vl-font', 'Entry font', ['Humanist', 'System', 'Serif', 'Mono']))}
                ${setRow('Text size', sel('vl-size', 'Text size', ['Medium', 'Small', 'Large']))}
                ${setRow('Use a 24-hour clock', sw('Use a 24-hour clock', true))}
              </div>
            </section>
            <section class="m-stack" data-gap="2" aria-labelledby="vl-set-timeline">
              <h2 id="vl-set-timeline" class="m-muted" style="${small}; font-weight: var(--m-font-weight-semibold); padding-inline: var(--m-space-4)">Timeline</h2>
              <div class="m-card" data-variant="outline" style="padding: 0; gap: 0; border-radius: var(--m-radius-md)">
                ${setRow('Show photos beside entries', sw('Show photos beside entries', true), true)}
                ${setRow('Show weather and place', sw('Show weather and place', true))}
                ${setRow('Hide entry text', sw('Hide entry text', false), false, 'Shows titles only, for writing in public.')}
              </div>
            </section>
            <section class="m-stack" data-gap="2" aria-labelledby="vl-set-data">
              <h2 id="vl-set-data" class="m-muted" style="${small}; font-weight: var(--m-font-weight-semibold); padding-inline: var(--m-space-4)">Your entries</h2>
              <div class="m-card" data-variant="outline" style="padding: 0; gap: 0; border-radius: var(--m-radius-md)">
                ${setRow('Export everything', '<button type="button" class="m-button" data-size="sm">Export…</button>', true, 'A folder of text files and photos.')}
                ${setRow('<span style="color: var(--m-color-danger-fg)">Delete all entries</span>', '<button type="button" class="m-button" data-variant="danger" data-size="sm">Delete…</button>', false, '486 entries and 1,204 photos. This can’t be undone.')}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>`,
);

// ---------- Empty state: a new journal with its colour band ----------

const emptyState = shell(
  'Letters to Ada',
  `    <div style="background: var(--m-color-danger-solid); color: var(--m-color-danger-on-solid); padding: var(--m-space-10) clamp(1rem, 4vw, 2.5rem) var(--m-space-12)">
      <div class="m-stack" data-gap="1">
        <h1 style="${largeTitle}">Letters to Ada</h1>
        <span>Started today</span>
      </div>
    </div>
    <main style="background: var(--m-color-bg-canvas); margin-block-start: calc(var(--m-space-6) * -1); border-start-start-radius: 28px; border-start-end-radius: 28px; min-block-size: 60vh">
      <div class="m-tabs" style="padding: var(--m-space-2) clamp(1rem, 4vw, 2.5rem) 0">
        <div class="m-tab-list" role="tablist" aria-label="Journal views">
          <button type="button" class="m-tab" role="tab" aria-selected="true">Entries</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Photos</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Places</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Calendar</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1" aria-label="About this journal">${icon(I.book, 16)}</button>
        </div>
      </div>
      <div class="m-container" data-size="sm" style="padding-block: var(--m-space-16)">
        <div class="m-stack" data-gap="4" data-align="center" style="text-align: center">
          <span style="${subtle}">${icon(I.feather, 40)}</span>
          <h2 style="${sectionTitle}">Nothing written here yet</h2>
          <p class="m-muted" style="max-inline-size: 24rem">A letter can be two lines long. Start with what happened today, and it will be here when she is old enough to read it.</p>
          <div class="m-stack" data-gap="2" style="inline-size: 100%; max-inline-size: 18rem">
            <button type="button" class="m-button" data-variant="primary" data-size="lg">${icon(I.pen, 16)} Write the first letter</button>
            <button type="button" class="m-button">${icon(I.quote, 16)} Start from a question</button>
          </div>
        </div>
      </div>
    </main>`,
);

// ---------- Pricing: the public page ----------

const tier = (o: {
  ic: string;
  icColor: string;
  name: string;
  line: string;
  price: string;
  features: string[];
  cta: string;
  primary?: boolean;
  featured?: boolean;
}) => `      <section class="m-card" data-variant="outline" style="padding: var(--m-space-6)${o.featured ? '; border: 2px solid var(--m-color-warning-solid)' : ''}" aria-labelledby="vl-tier-${o.name.toLowerCase()}">
        <div class="m-stack" data-gap="5" style="block-size: 100%">
          <div class="m-stack" data-gap="3">
            <div class="m-cluster" data-gap="3"><span style="display: inline-flex; color: ${o.icColor}">${icon(o.ic, 24)}</span><h2 id="vl-tier-${o.name.toLowerCase()}" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold)">${o.name}</h2>${o.featured ? '<span class="m-badge" data-tone="warning">Most chosen</span>' : ''}</div>
            <p style="font-size: var(--m-font-size-lg)">${o.line}</p>
          </div>
          <div class="m-cluster" data-gap="2" data-align="baseline"><span style="font-size: var(--m-font-size-4xl); font-weight: var(--m-font-weight-bold); line-height: 1; font-variant-numeric: tabular-nums">${o.price}</span><span class="m-muted" style="${small}">per year</span></div>
          <ul class="m-stack" data-gap="2" style="padding: 0; list-style: none; flex: 1">
${o.features.map((f) => `            <li class="m-cluster" data-gap="2" style="flex-wrap: nowrap; ${small}"><span style="display: inline-flex">${icon(I.check, 14)}</span>${f}</li>`).join('\n')}
          </ul>
          <button type="button" class="m-button" data-size="lg"${o.primary ? ' data-variant="primary"' : ' style="background: transparent; border-color: var(--m-color-border-strong)"'}>${o.cta}</button>
        </div>
      </section>`;

const cmpRow = (feature: string, a: string, b: string, c: string) =>
  `          <tr><td>${feature}</td><td style="text-align: center">${a}</td><td style="text-align: center">${b}</td><td style="text-align: center">${c}</td></tr>`;
const tick = `<span aria-label="Included" style="display: inline-flex">${icon(I.check, 14)}</span>`;

const pricing = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  <header class="m-navbar">
    <a class="m-navbar-brand" href="#" style="gap: var(--m-space-2)"><span class="m-avatar" data-size="sm" style="border-radius: var(--m-radius-md); background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)">${icon(I.feather, 14)}</span> Keepsake</a>
    <nav class="m-navbar-nav" aria-label="Site" style="margin-inline-start: auto">
      <a class="m-navbar-link" href="#">How it works</a>
      <a class="m-navbar-link" href="#">Stories</a>
      <a class="m-navbar-link" href="#" aria-current="page">Plans</a>
      <a class="m-navbar-link" href="#">Help</a>
    </nav>
    <div class="m-navbar-actions"><a class="m-button" href="#" style="background: transparent; border-color: var(--m-color-accent-default); color: var(--m-color-accent-text); border-radius: var(--m-radius-sm)">Download</a></div>
  </header>
  <main style="background: var(--m-color-bg-sunken); padding-block: var(--m-space-16)">
    <div class="m-container">
      <div class="m-stack" data-gap="12">
        <div class="m-stack" data-gap="3" data-align="center" style="text-align: center">
          <h1 style="font-size: var(--m-font-size-4xl); font-weight: var(--m-font-weight-bold); letter-spacing: -0.02em; line-height: var(--m-font-leading-tight)">Pick a plan for your journal</h1>
          <p style="font-size: var(--m-font-size-lg)">Write every day. Keep every photo. Look back whenever you like.</p>
          <p class="m-muted" style="${small}">Try any paid plan free for 14 days. Your entries stay yours if you stop.</p>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 17rem; --m-layout-grid-gap: var(--m-space-5); align-items: stretch">
${tier({ ic: I.feather, icColor: 'var(--m-color-brand-default)', name: 'Starter', line: 'Everything you need to write every day', price: '$0', features: ['One journal, no entry limit', 'One photo in each entry', 'Daily questions', 'Search by word and date', 'Years-ago reminders'], cta: 'Start writing' })}
${tier({ ic: I.book, icColor: 'var(--m-color-fg-subtle)', name: 'Keeper', line: 'For a life in many journals, on every device', price: '$39.99', features: ['Unlimited journals and colours', 'Twenty photos in each entry', 'Sync between all your devices', 'Voice notes, written out for you', 'Printed books at 20% off'], cta: 'Try it free', primary: true })}
${tier({ ic: I.star, icColor: 'var(--m-color-warning-solid)', name: 'Archivist', line: 'Everything in Keeper, plus a deeper look back', price: '$69.99', features: ['Video and scanned pages', 'Shared journals with family', 'Yearly printed recap', 'Priority help from a person', 'Printed books at 35% off'], cta: 'Try it free', primary: true, featured: true })}
        </div>
        <section class="m-stack" data-gap="4" aria-labelledby="vl-compare" style="max-inline-size: 56rem; margin-inline: auto; inline-size: 100%">
          <h2 id="vl-compare" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); text-align: center">Compare the plans</h2>
          <div class="m-table-wrap">
            <table class="m-table">
              <caption style="caption-side: top; text-align: start; padding: var(--m-space-4); background: var(--m-color-bg-surface)"><span class="m-stack" data-gap="1"><strong>Writing and photos</strong><span class="m-muted" style="${small}; font-weight: var(--m-font-weight-regular)">Words, pictures, voice and paper, any time.</span></span></caption>
              <thead><tr><th scope="col">Feature</th><th scope="col" style="text-align: center">Starter</th><th scope="col" style="text-align: center">Keeper</th><th scope="col" style="text-align: center">Archivist</th></tr></thead>
              <tbody>
${cmpRow('Entries', 'Unlimited', 'Unlimited', 'Unlimited')}
${cmpRow('Photos in each entry', '1', '20', '20')}
${cmpRow('Voice notes', '', tick, tick)}
${cmpRow('Video', '', '', tick)}
${cmpRow('Scanned pages', '', '', tick)}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </main>
</div>`;

// ---------- Errors ----------

const errorPage = (code: string, ic: string, title: string, body: string, actions: string) => `    <section class="m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-12); ${hair}" aria-labelledby="vl-err-${code}">
      <span style="${subtle}">${icon(ic, 40)}</span>
      <span class="m-subtle" style="${small}; font-variant-numeric: tabular-nums">Error ${code}</span>
      <h2 id="vl-err-${code}" style="${sectionTitle}">${title}</h2>
      <p class="m-muted" style="max-inline-size: 26rem">${body}</p>
      <div class="m-stack" data-gap="2" style="inline-size: 100%; max-inline-size: 16rem">${actions}</div>
    </section>`;

const errors = `<main class="m-container" data-size="md" style="padding-block: var(--m-space-10)">
  <div class="m-stack" data-gap="10">
    <section class="m-stack" data-gap="5" aria-labelledby="vl-err-form">
      <h1 id="vl-err-form" style="${largeTitle}">New journal</h1>
      <div class="m-alert" data-tone="danger" role="alert">
        <span class="m-alert-icon">${icon(I.alert, 18)}</span>
        <div class="m-alert-content"><div class="m-alert-title">Two things to fix</div><div class="m-alert-body">The journal wasn’t made yet. Give it a name and choose when to be reminded.</div></div>
      </div>
      <div class="m-card" style="padding: var(--m-space-5)">
        <div class="m-stack" data-gap="4">
          <div class="m-field">
            <label class="m-field-label" for="vl-err-name">Journal name</label>
            <input class="m-input" id="vl-err-name" value="" aria-invalid="true" aria-describedby="vl-err-name-e" placeholder="Garden log">
            <p class="m-field-error" id="vl-err-name-e">Give the journal a name; it can be one word.</p>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="vl-err-time">Remind me at</label>
            <input class="m-input" id="vl-err-time" value="25:30" aria-invalid="true" aria-describedby="vl-err-time-e" style="font-variant-numeric: tabular-nums">
            <p class="m-field-error" id="vl-err-time-e">Use a time between 00:00 and 23:59.</p>
          </div>
        </div>
      </div>
      <div class="m-cluster" data-justify="end" data-gap="2">
        <button type="button" class="m-button">Cancel</button>
        <button type="submit" class="m-button" data-variant="primary">Make journal</button>
      </div>
    </section>
    <section class="m-stack" data-gap="3" aria-label="Notices">
      <div class="m-toast" data-tone="danger" role="alert"><div class="m-toast-content"><div class="m-toast-title m-cluster" data-gap="2"><span style="display: inline-flex; color: var(--m-color-danger-fg)">${icon(I.cloud, 18)}</span>3 entries haven’t synced</div><div class="m-toast-body">They’re safe on this device and will sync when you’re back online.</div></div><button type="button" class="m-button" data-size="sm">Retry</button></div>
      <div class="m-toast" data-tone="success" role="status"><div class="m-toast-content"><div class="m-toast-title m-cluster" data-gap="2"><span style="display: inline-flex; color: var(--m-color-success-fg)">${icon(I.check, 18)}</span>Entry moved to Garden log</div></div><button type="button" class="m-button" data-variant="ghost" data-size="sm">Undo</button></div>
    </section>
${errorPage('404', I.search, 'This entry isn’t here', 'It may have been deleted, or moved to a journal you no longer share.', `<a class="m-button" data-variant="primary" href="#">${icon(I.home, 16)} Go to Home</a>`)}
${errorPage('500', I.wifiOff, 'Something went wrong on our side', 'Nothing you wrote was lost. Try again in a moment.', `<button type="button" class="m-button" data-variant="primary">Try again</button><button type="button" class="m-button" data-variant="ghost">Get help</button>`)}
${errorPage('403', I.lock, 'This journal is locked', 'Only its owner can open it. Ask them to share it with you.', `<button type="button" class="m-button" data-variant="primary">Ask for access</button><a class="m-button" data-variant="ghost" href="#">Go back</a>`)}
  </div>
</main>`;

export const vellumRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'Home: a large bold title with the date, grey count pills, today’s question with a full-width primary pill, a grouped panel of moments, the month calendar with written days in the brand colour, entries from years ago and streak tiles.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'Three panes: the journal column, a timeline under bold month headings with weekday-and-numeral date tiles and photo shapes, and the open entry at a reading width in the entry face.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'A brand-colour band with a large title, a rounded white sheet over it, one field, colour swatches and a grouped panel of switches, then a full-width primary pill.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A grey section list whose current row fills with the action blue, a title bar with Close, and grouped panels of label-and-control rows separated by hairlines.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'A new journal: its colour band and large title, a rounded sheet with text tabs, then a thin icon, a bold heading, one sentence and two stacked pills.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The public page: a white header, a grey band with a big bold heading, three white plan cards with 20px corners (the top plan ringed in amber), large prices, tick lists, pill buttons and a comparison table.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'A danger callout above the form saying nothing was made, field errors under each field, banners for sync trouble and undo, and full pages for 404, 500 and a locked journal.',
    html: errors,
  },
];
