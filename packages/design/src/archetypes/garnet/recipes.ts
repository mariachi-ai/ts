import type { ArchetypeRecipe } from '../types';

/*
 * Garnet's nine layout recipes: framework-free HTML using only @mariachi/design classes and tokens (no
 * colour literals), with invented data from a small revenue team's CRM ("Larch"). They follow the
 * language's real screen patterns: the page as a rounded warm-grey sheet inside a white rim, a white
 * header plate, heavy display headlines with tight tracking, maroon pill buttons, mono step numbers,
 * and the product drawn as neutral white panels: a record table on a hairline grid with five-step
 * signal bars, an evidence timeline, an assistant panel with a composer, and a dark maroon footer.
 */

// Lucide icons, outlined, 1.5 on the 24px grid; 14px by default
const icon = (paths: string, size = 14) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none">${paths}</svg>`;
const I = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  inbox:
    '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  phone:
    '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  tasks: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/>',
  bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
  reports: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  company:
    '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  people:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  deals: '<path d="M6 5v11"/><path d="M12 5v6"/><path d="M18 5v14"/>',
  filter: '<path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/>',
  sliders:
    '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
  sort: '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  right: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  left: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  up: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  external: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  warn: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  grip: '<circle cx="12" cy="5" r="1"/><circle cx="19" cy="5" r="1"/><circle cx="5" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="12" cy="19" r="1"/><circle cx="19" cy="19" r="1"/><circle cx="5" cy="19" r="1"/>',
  sparkles:
    '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1"/>',
  plug: '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  note: '<path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/>',
  layers:
    '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  searchX: '<path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
};

// ── Shared treatments (tokens only) ─────────────────────────────────────────────────────────────────
const num = 'font-variant-numeric: tabular-nums';
const muted = 'color: var(--m-color-fg-muted)';
const subtle = 'color: var(--m-color-fg-subtle)';
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-muted)';
// The heavy display line: the display face at 800, tracked in
const display = (size: string) =>
  `font-family: var(--m-font-family-display); font-size: ${size}; font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)`;
// Mono step numbers and labels: "01 Workspace"
const monoCaps =
  'font-family: var(--m-font-family-mono); font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-wide); text-transform: uppercase';
// The tracked capital eyebrow over a page rail: "Contents"
const eyebrow =
  'font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-semibold); letter-spacing: 0.12em; text-transform: uppercase';
const panelTitle = 'font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-medium)';
// A white product panel: 12px corners, a muted hairline drawn as an inset ring (as the source draws its
// product frames), a breath of shadow
const panel =
  'background: var(--m-color-bg-surface); border-radius: var(--m-radius-md); box-shadow: inset 0 0 0 var(--m-border-width-thin) var(--m-color-border-muted), var(--m-shadow-sm)';
// The rim: a near-white lip around a white card, as the site frames its cards and product pictures
const rim = (inner: string, style = '') =>
  `<div style="background: var(--m-color-bg-sunken); padding: var(--m-space-2); border-radius: calc(var(--m-radius-lg) + var(--m-space-2)); ${style}">${inner}</div>`;
// From a phone up the page sits in a white rim with 40px corners; on a phone it runs to the edges
const rimPad = 'min(0.5rem, max(0px, calc((100vw - 40rem) * 100)))';
const sheetRadius = 'min(2.5rem, max(0px, calc((100vw - 40rem) * 100)))';

// A company mark: a 16px rounded square with its initial on a tint (never a real logo)
const mark = (letter: string, tone: string) =>
  `<span aria-hidden="true" style="flex: none; display: inline-grid; place-items: center; inline-size: 1rem; block-size: 1rem; border-radius: 4px; background: var(--m-color-${tone}-bg); color: var(--m-color-${tone}-fg); font-size: 0.625rem; font-weight: var(--m-font-weight-semibold)">${letter}</span>`;
// The fit signal: five 5px segments with 9px ends; green from 80, amber below
const bar = (score: number) => {
  const on = score >= 90 ? 5 : score >= 80 ? 4 : score >= 65 ? 3 : 2;
  const tone = score >= 80 ? 'success' : 'warning';
  const segs = Array.from(
    { length: 5 },
    (_, i) =>
      `<span style="inline-size: 0.75rem; block-size: 5px; border-radius: 9px; background: var(--m-color-${i < on ? `${tone}-solid` : 'border-default'})"></span>`,
  ).join('');
  return `<span class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span role="img" aria-label="Fit ${score} of 100" style="display: inline-flex; gap: 2px">${segs}</span><span style="${num}">${score}</span></span>`;
};
// A count chip in the product blue: "Filter 2"
const count = (n: string) =>
  `<span class="m-badge" data-tone="info" style="block-size: 1rem; padding-inline: 0.3rem; border: 0; font-size: 0.6875rem">${n}</span>`;
// A small chip button in the product: white, hairline, 6px corners, 12px
const chip = (inner: string, pressed = false) =>
  `<button type="button" class="m-button" data-size="sm" style="block-size: 1.75rem; border-radius: var(--m-radius-sm); font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-medium); background: var(--m-color-bg-surface); --m-button-secondary-border: var(--m-color-border-default)"${pressed ? ' aria-pressed="true"' : ''}>${inner}</button>`;
const iconButton = (paths: string, label: string) =>
  `<button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="${label}">${icon(paths)}</button>`;
// The invented product's mark: a cut-gem outline, never the reference's
const logo = (size = 18) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linejoin="round" aria-hidden="true" style="flex: none"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20"/></svg>`;
const wordmark = (size = 'var(--m-font-size-xl)') =>
  `<span class="m-cluster" data-gap="2" style="flex-wrap: nowrap; ${display(size)}; letter-spacing: -0.02em">${logo()} Larch</span>`;

// ── The app shell ───────────────────────────────────────────────────────────────────────────────────
// The nav sits on the white rim; the page is a near-white sheet with 24px corners beside it. On a phone
// the sheet comes first and the nav drops below it (wrap-reverse)
const navLink = (ic: string, label: string, current: string, extra = '') =>
  `        <li><a class="m-sidebar-link" href="#"${label === current ? ' aria-current="page"' : ''}>${icon(ic)} ${label}${extra}</a></li>`;
const shell = (current: string, main: string) => `<div class="m-split" style="--m-layout-split-side: 15rem; --m-layout-split-gap: 0; flex-wrap: wrap-reverse; min-block-size: 100vh; padding: ${rimPad}; background: var(--m-color-bg-surface)">
  <nav class="m-sidebar" aria-label="Main">
    <div class="m-cluster" data-justify="between" style="padding: var(--m-space-1) var(--m-space-2)">
      <span class="m-cluster" data-gap="2" style="font-weight: var(--m-font-weight-semibold)"><span class="m-avatar" data-size="sm" style="border-radius: var(--m-radius-sm); background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)">${logo(12)}</span>Fieldwork Co.</span>
      ${iconButton(I.search, 'Search')}
    </div>
    <div class="m-sidebar-section">
      <ul>
${navLink(I.home, 'Home', current)}
${navLink(I.chat, 'Chat', current)}
${navLink(I.search, 'Lead search', current)}
${navLink(I.send, 'Sequences', current)}
${navLink(I.inbox, 'Inbox', current, ' <span class="m-sidebar-count">4</span>')}
${navLink(I.phone, 'Calls', current)}
${navLink(I.tasks, 'Tasks', current, ' <span class="m-sidebar-count">7</span>')}
${navLink(I.bot, 'Agents', current)}
${navLink(I.reports, 'Reports', current)}
      </ul>
    </div>
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Records</h2>
      <ul>
${navLink(I.company, 'Companies', current)}
${navLink(I.people, 'People', current)}
${navLink(I.deals, 'Deals', current)}
      </ul>
    </div>
    <div class="m-sidebar-section" style="margin-block-start: auto">
      <ul>
${navLink(I.gear, 'Settings', current)}
      </ul>
    </div>
  </nav>
  <div style="min-block-size: calc(100vh - 1rem); background: var(--m-color-bg-sunken); border-radius: ${sheetRadius}; padding: clamp(var(--m-space-5), 3vw, var(--m-space-8))">
${main}
  </div>
</div>`;

// A page header in the app: a mono crumb, the display title, the actions at the right
const pageHead = (crumb: string, title: string, actions: string) => `    <header class="m-cluster" data-justify="between" data-align="end" data-gap="4" style="margin-block-end: var(--m-space-6)">
      <div class="m-stack" data-gap="2">
        <span style="${monoCaps}; ${subtle}">${crumb}</span>
        <h1 style="${display('var(--m-font-size-3xl)')}">${title}</h1>
      </div>
      <div class="m-cluster" data-gap="2">${actions}</div>
    </header>`;

// ── Dashboard ───────────────────────────────────────────────────────────────────────────────────────
const stage = (tone: string, name: string, deals: string, value: string) =>
  `<li class="m-cluster" data-justify="between" style="padding-block: var(--m-space-2); ${hair}"><span class="m-cluster" data-gap="2"><span aria-hidden="true" style="inline-size: 0.5rem; block-size: 0.5rem; border-radius: var(--m-radius-full); background: var(--m-color-${tone})"></span>${name} <span style="${subtle}">${deals}</span></span><span style="${num}; font-weight: var(--m-font-weight-medium)">${value}</span></li>`;
const todo = (text: string, who: string, when: string, done = false) =>
  `<li class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding-block: var(--m-space-2); ${hair}"><input class="m-checkbox" type="checkbox" aria-label="${text}"${done ? ' checked' : ''}><span style="flex: 1; min-inline-size: 0${done ? `; ${subtle}; text-decoration: line-through` : ''}">${text}</span><span class="m-badge">${who}</span><span style="${subtle}; ${num}; inline-size: 3rem; text-align: end">${when}</span></li>`;
const legend = (tone: string, label: string) =>
  `<span class="m-badge"><span aria-hidden="true" style="inline-size: 0.4rem; block-size: 0.4rem; border-radius: var(--m-radius-full); background: var(--m-color-${tone})"></span>${label}</span>`;
const activity = [62, 70, 66, 74, 81, 77, 90, 86, 95, 92, 104, 99, 112, 108, 121, 118, 126, 133, 129, 141, 138, 150];
const line = activity.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * 600) / (activity.length - 1)},${170 - v}`).join(' ');
const grid = [40, 80, 120]
  .map((y) => `<path d="M0,${y} L600,${y}" style="stroke: var(--m-color-border-muted)" stroke-width="1" vector-effect="non-scaling-stroke"/>`)
  .join('');
const chart = `<svg viewBox="0 0 600 160" width="100%" preserveAspectRatio="none" style="display: block; block-size: 10rem" role="img" aria-label="Touches per day over three weeks, rising from 62 to 150">${grid}<path d="${line}" fill="none" style="stroke: var(--m-color-success-solid)" stroke-width="1.75" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
const signalRow = (letter: string, tone: string, name: string, why: string, score: number) =>
  `<tr><td><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${mark(letter, tone)}${name}</span></td><td style="${muted}">${why}</td><td>${bar(score)}</td></tr>`;

const dashboard = shell(
  'Home',
  `${pageHead(
    'Thursday · 12 Nov',
    'Good morning, Ines',
    `<button type="button" class="m-button">${icon(I.sparkles)} Ask Larch</button><button type="button" class="m-button" data-variant="primary">${icon(I.plus)} New deal</button>`,
  )}
    <div class="m-stack" data-gap="3">
      <div class="m-grid" style="--m-layout-grid-min: 20rem">
        <section style="${panel}; padding: var(--m-space-4) var(--m-space-5)" aria-labelledby="gn-today">
          <div class="m-cluster" data-justify="between" style="margin-block-end: var(--m-space-2)"><h2 id="gn-today" style="${panelTitle}">Today</h2><span style="${subtle}">5 of 7 left</span></div>
          <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none; font-size: var(--m-font-size-sm)">
            ${todo('Send the revised order form to Copperline', 'Ines', '10:00')}
            ${todo('Prepare notes for the Ondine Robotics review', 'Ines', '11:30')}
            ${todo('Send Tallgrass the data-retention summary', 'Rafe', '14:00')}
            ${todo('Confirm the rollout date with Mirelle Bio', 'Ines', 'Fri')}
            ${todo('Log notes from the Fernway demo', 'Ines', 'Done', true)}
          </ul>
        </section>
        <section style="${panel}; padding: var(--m-space-4) var(--m-space-5)" aria-labelledby="gn-pipe">
          <div class="m-cluster" data-justify="between" style="margin-block-end: var(--m-space-2)"><h2 id="gn-pipe" style="${panelTitle}">Pipeline this quarter</h2><a href="#" class="m-cluster" data-gap="1" style="${subtle}; text-decoration: none">Open board ${icon(I.right, 12)}</a></div>
          <p class="m-cluster" data-gap="2" data-align="baseline" style="margin-block-end: var(--m-space-2)"><span style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-medium); letter-spacing: -0.04em; ${num}">$412K</span><span class="m-badge" data-tone="success">${icon(I.up, 12)} 18%</span></p>
          <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none; font-size: var(--m-font-size-sm)">
            ${stage('info-solid', 'Qualification', '9 deals', '$118K')}
            ${stage('warning-solid', 'Demo', '6 deals', '$96K')}
            ${stage('success-solid', 'Pilot', '4 deals', '$131K')}
            ${stage('fg-default', 'Contract', '2 deals', '$67K')}
          </ul>
        </section>
      </div>
      <section style="${panel}; padding: var(--m-space-4) var(--m-space-5)" aria-labelledby="gn-act">
        <div class="m-cluster" data-justify="between" data-gap="3" style="margin-block-end: var(--m-space-3)">
          <div class="m-cluster" data-gap="2"><h2 id="gn-act" style="${panelTitle}">Activity</h2>${chip(`30 days ${icon(I.down, 12)}`)}</div>
          <div class="m-cluster" data-gap="1">${legend('success-solid', 'Emails')}${legend('info-solid', 'Meetings')}${legend('warning-solid', 'Calls')}${legend('danger-solid', 'Notes')}</div>
        </div>
        ${chart}
        <div class="m-cluster" data-justify="between" style="${subtle}; font-size: var(--m-font-size-xs); margin-block-start: var(--m-space-2)"><span>Oct 22</span><span>Oct 29</span><span>Nov 5</span><span>Nov 12</span></div>
      </section>
      <section class="m-stack" data-gap="2" aria-labelledby="gn-sig">
        <h2 id="gn-sig" style="${panelTitle}; padding-inline: var(--m-space-1)">New signals on your accounts</h2>
        <div class="m-table-wrap" style="background: var(--m-color-bg-surface)">
          <table class="m-table">
            <thead><tr><th scope="col">Company</th><th scope="col">Signal</th><th scope="col">Fit</th></tr></thead>
            <tbody>
              ${signalRow('B', 'info', 'Brightwater Labs', 'Hired a head of revenue last week', 93)}
              ${signalRow('S', 'success', 'Saltmarsh AI', 'Two account executive roles opened', 86)}
              ${signalRow('P', 'warning', 'Petrel Systems', 'Raised a Series A on Monday', 81)}
              ${signalRow('A', 'danger', 'Arden Mapping', 'Pricing page visited six times', 72)}
            </tbody>
          </table>
        </div>
      </section>
    </div>`,
);

// ── List and detail: lead search with the record beside it ─────────────────────────────────────────
// The record table's grid: a faint line between columns as well as rows
const vline = 'border-inline-end: var(--m-border-width-thin) solid var(--m-color-border-muted)';
const leadRow = (letter: string, tone: string, name: string, size: string, why: string, score: number, picked = false, open = false) =>
  `<tr${open ? ' aria-selected="true" style="background: var(--m-color-bg-sunken)"' : ''}><td style="inline-size: 2.25rem; ${vline}"><input class="m-checkbox" type="checkbox" aria-label="Select ${name}"${picked ? ' checked' : ''}></td><td style="${vline}"><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap; font-weight: var(--m-font-weight-medium)">${mark(letter, tone)}${name}</span></td><td style="${muted}; ${num}; ${vline}">${size}</td><td style="${muted}; ${vline}">${why}</td><td>${bar(score)}</td></tr>`;
const evidence = (source: string, fact: string, why: string) =>
  `<li class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap"><span aria-hidden="true" style="flex: none; display: inline-grid; place-items: center; inline-size: 1.125rem; block-size: 1.125rem; border-radius: var(--m-radius-full); background: var(--m-color-success-fg); color: var(--m-color-fg-inverse); margin-block-start: 1.1rem">${icon(I.check, 11)}</span><span class="m-stack" data-gap="1"><span style="${subtle}; font-size: var(--m-font-size-xs)">${source}</span><span>${fact}</span><span style="color: var(--m-color-success-fg)">${why}</span></span></li>`;

const listDetail = shell(
  'Lead search',
  `${pageHead(
    'Lead search · 24 found',
    'Companies to call',
    `<button type="button" class="m-button">${icon(I.sliders)} Columns</button><button type="button" class="m-button" data-variant="primary">${icon(I.people)} Find people</button>`,
  )}
    <div class="m-split" style="--m-layout-split-side: 22rem; --m-layout-split-gap: var(--m-space-3); flex-direction: row-reverse; align-items: start">
      <aside style="${panel}; padding: var(--m-space-5)" aria-labelledby="gn-rec">
        <div class="m-cluster" data-justify="between" data-gap="3" style="padding-block-end: var(--m-space-4); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-muted)">
          <div class="m-stack" data-gap="1"><h2 id="gn-rec" style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium)">Brightwater Labs</h2><span style="${subtle}; font-size: var(--m-font-size-sm)">brightwater.example · 340 people</span></div>
          <span class="m-cluster" data-gap="2">${bar(93).replace(`<span style="${num}">93</span>`, `<span style="${num}; font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-medium)">93</span>`)}</span>
        </div>
        <ol class="m-stack" data-gap="4" style="padding: var(--m-space-2) 0 0; list-style: none; font-size: var(--m-font-size-sm)">
          ${evidence('Company record', 'Water analytics, 340 people, offices in Leeds and Porto.', 'Fits the industry and headcount you set.')}
          ${evidence('Funding', 'Raised $24M on 3 Nov.', 'Raised this year, as the list asks.')}
          ${evidence('Job posts', 'Hiring a head of revenue and two account executives.', 'Building a sales team now.')}
        </ol>
        <div class="m-cluster" data-gap="2" style="margin-block-start: var(--m-space-5)"><button type="button" class="m-button" data-size="sm">${icon(I.external, 12)} Open record</button><button type="button" class="m-button" data-variant="ghost" data-size="sm">${icon(I.x, 12)} Not a fit</button></div>
      </aside>
      <section style="${panel}; overflow: hidden" aria-label="Companies">
        <div class="m-cluster" data-gap="2" style="padding: var(--m-space-2) var(--m-space-3); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-muted)">
          <label class="m-cluster" data-gap="2" style="block-size: 1.75rem; padding-inline: var(--m-space-2); border: var(--m-border-width-thin) solid var(--m-color-border-default); border-radius: var(--m-radius-sm); ${subtle}; font-size: var(--m-font-size-xs)">${icon(I.search, 12)}<input class="m-sr-only" aria-label="Search companies">Search</label>
          ${chip(`${icon(I.filter, 12)} Filter ${count('2')}`, true)}
          ${chip(`${icon(I.sort, 12)} Fit`)}
          <span style="margin-inline-start: auto; ${subtle}; font-size: var(--m-font-size-xs)">3 selected</span>
        </div>
        <div style="overflow-x: auto">
          <table class="m-table" style="--m-table-wrap-border: transparent">
            <thead><tr><th scope="col" style="${vline}"><span class="m-sr-only">Select</span></th><th scope="col" style="${vline}">Company</th><th scope="col" style="${vline}">People</th><th scope="col" style="${vline}"><span class="m-cluster" data-gap="1" style="flex-wrap: nowrap"><span aria-hidden="true" style="color: var(--m-color-info-solid)">${icon(I.sparkles, 12)}</span>Signal</span></th><th scope="col">Fit</th></tr></thead>
            <tbody>
              ${leadRow('B', 'info', 'Brightwater Labs', '340', 'Head of revenue hired', 93, true, true)}
              ${leadRow('C', 'success', 'Copperline', '210', 'Second sales team forming', 91, true)}
              ${leadRow('O', 'warning', 'Ondine Robotics', '95', 'Raised a seed extension', 88, true)}
              ${leadRow('F', 'danger', 'Fernway', '420', 'Opened an office in Lyon', 84)}
              ${leadRow('Q', 'info', 'Quillon Health', '160', 'Pricing page visited twice', 81)}
              ${leadRow('T', 'success', 'Tallgrass Data', '75', 'New CRO started', 78)}
              ${leadRow('V', 'warning', 'Veridian Freight', '600', 'Sales ops role posted', 74)}
              ${leadRow('H', 'danger', 'Hollis &amp; Cove', '55', 'Partner team announced', 69)}
            </tbody>
          </table>
        </div>
      </section>
    </div>`,
);

// ── Onboarding: one question on the sheet, the steps as a numbered pill track ─────────────────────
const stepTab = (n: string, label: string, state: 'done' | 'current' | 'next') =>
  `<li style="display: inline-flex; align-items: center; gap: var(--m-space-2); block-size: 2rem; padding-inline: var(--m-space-4); border-radius: var(--m-radius-full); font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-medium)${state === 'current' ? '; background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-sm); color: var(--m-color-fg-default)' : `; ${subtle}`}"${state === 'current' ? ' aria-current="step"' : ''}><span style="font-family: var(--m-font-family-mono); font-size: var(--m-font-size-xs)">${n}</span>${label}${state === 'done' ? ` ${icon(I.check, 12)}` : ''}</li>`;
const pickOption = (id: string, title: string, desc: string, checked = false) =>
  `<label for="${id}" class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap; padding: var(--m-space-4); border-radius: var(--m-radius-md); border: var(--m-border-width-thin) solid var(--m-color-border-${checked ? 'strong' : 'default'}); background: var(--m-color-bg-surface); cursor: pointer"><input class="m-radio" type="radio" name="gn-source" id="${id}"${checked ? ' checked' : ''} style="margin-block-start: 2px"><span class="m-stack" data-gap="1"><span style="font-weight: var(--m-font-weight-medium)">${title}</span><span style="${muted}; font-size: var(--m-font-size-sm)">${desc}</span></span></label>`;

const onboarding = `<div style="min-block-size: 100vh; padding: ${rimPad}; background: var(--m-color-bg-surface)">
  <main style="min-block-size: calc(100vh - 1rem); background: var(--m-color-bg-canvas); border-radius: ${sheetRadius}; padding: var(--m-space-6) var(--m-space-4) var(--m-space-16); display: flex; flex-direction: column; align-items: center; gap: var(--m-space-10)">
    <div class="m-cluster" data-justify="between" style="inline-size: min(100%, 61rem)">${wordmark()}<button type="button" class="m-button" data-variant="ghost" data-size="sm">Do this later</button></div>
    <ol class="m-cluster" data-gap="1" data-justify="center" style="padding: 3px; margin: 0; list-style: none; border-radius: var(--m-radius-full); background: var(--m-color-bg-sunken)" aria-label="Setup steps">
      ${stepTab('01', 'Workspace', 'done')}
      ${stepTab('02', 'Your data', 'current')}
      ${stepTab('03', 'Mailbox', 'next')}
      ${stepTab('04', 'Team', 'next')}
    </ol>
    <div class="m-stack" data-gap="4" data-align="center" style="text-align: center; max-inline-size: 40rem">
      <h1 style="${display('clamp(2.25rem, 5vw, var(--m-font-size-4xl))')}">Start with what you already have</h1>
      <p style="${muted}; font-size: var(--m-font-size-lg); line-height: var(--m-font-leading-relaxed)">Point Larch at your current system or a file. People and companies arrive with their history attached.</p>
    </div>
    ${rim(
      `<form class="m-stack" data-gap="4" style="background: var(--m-color-bg-surface); border-radius: var(--m-radius-lg); padding: clamp(var(--m-space-5), 4vw, var(--m-space-8))" aria-label="Where your data is">
        ${pickOption('gn-src-crm', 'Another CRM', 'Records, custom fields and pipelines, with owners kept.', true)}
        ${pickOption('gn-src-csv', 'A spreadsheet', 'Upload a CSV and match its columns to fields.')}
        ${pickOption('gn-src-none', 'Start empty', 'Find companies with lead search and build from there.')}
        <div class="m-field">
          <label class="m-field-label" for="gn-src-url">Which one?</label>
          <select class="m-select" id="gn-src-url"><option>Choose your current CRM</option><option>Another hosted CRM</option><option>A self-hosted CRM</option></select>
          <p class="m-field-hint">Most imports finish while you set up your mailbox.</p>
        </div>
        <div class="m-cluster" data-justify="between" style="padding-block-start: var(--m-space-2)">
          <button type="button" class="m-button" data-variant="ghost">${icon(I.left)} Back</button>
          <button type="submit" class="m-button" data-variant="primary" data-size="lg">Continue ${icon(I.right)}</button>
        </div>
      </form>`,
      'inline-size: min(100%, 34rem)',
    )}
  </main>
</div>`;

// ── Settings: a grouped nav beside hairline rows in one white panel ─────────────────────────────────
const setNav = (groups: [string, string[]][], current: string) =>
  groups
    .map(
      ([h, items]) => `        <div class="m-stack" data-gap="1">
          <h2 style="${eyebrow}; ${subtle}; padding-inline: var(--m-space-3); margin-block-end: var(--m-space-1)">${h}</h2>
${items.map((l) => `          <a href="#" style="display: block; padding: var(--m-space-1) var(--m-space-3); border-radius: var(--m-radius-full); text-decoration: none; font-size: var(--m-font-size-sm); ${l === current ? 'background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-sm); color: var(--m-color-fg-default); font-weight: var(--m-font-weight-medium)' : muted}"${l === current ? ' aria-current="page"' : ''}>${l}</a>`).join('\n')}
        </div>`,
    )
    .join('\n');
const setRow = (title: string, desc: string, control: string, first = false) =>
  `<div class="m-cluster" data-justify="between" data-gap="4" style="padding-block: var(--m-space-4)${first ? '' : `; ${hair}`}"><div class="m-stack" data-gap="1" style="flex: 1 1 18rem"><span style="font-weight: var(--m-font-weight-medium)">${title}</span><span style="${muted}; font-size: var(--m-font-size-sm)">${desc}</span></div><div style="flex: 0 1 16rem; display: flex; justify-content: flex-end">${control}</div></div>`;
const member = (initials: string, name: string, email: string, role: string) =>
  `<tr><td><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span class="m-avatar" data-size="sm">${initials}</span><span style="font-weight: var(--m-font-weight-medium)">${name}</span></span></td><td style="${muted}">${email}</td><td><span class="m-badge">${role}</span></td><td style="text-align: end">${iconButton(I.more, `More for ${name}`)}</td></tr>`;

const settings = shell(
  'Settings',
  `${pageHead('Settings · Workspace', 'General', '')}
    <div class="m-split" style="--m-layout-split-side: 12rem; --m-layout-split-gap: var(--m-space-6); align-items: start">
      <nav class="m-stack" data-gap="5" aria-label="Settings">
${setNav(
  [
    ['Workspace', ['General', 'Members', 'Pipeline stages', 'Custom properties']],
    ['Channels', ['Mailboxes', 'Calendars', 'Call recorders']],
    ['Data', ['Integrations', 'Import', 'Export']],
  ],
  'General',
)}
      </nav>
      <div class="m-stack" data-gap="6" style="max-inline-size: 48rem">
        <section style="${panel}; padding: var(--m-space-2) var(--m-space-5)" aria-label="Workspace">
          ${setRow('Workspace name', 'Shown on invites and in shared links.', '<input class="m-input" value="Fieldwork Co." aria-label="Workspace name">', true)}
          ${setRow('Email domain', 'People with this domain can join without an invite.', '<input class="m-input" value="fieldwork.example" aria-label="Email domain">')}
          ${setRow('Fiscal year starts', 'Quarters in reports follow it.', '<select class="m-select" aria-label="Fiscal year starts"><option>January</option><option>April</option><option>July</option></select>')}
          ${setRow('Draft before sending', 'Nothing an agent writes goes out until someone approves it.', '<input class="m-switch" type="checkbox" role="switch" checked aria-label="Draft before sending">')}
          ${setRow('Weekly summary', 'A Monday email with the pipeline and what changed.', '<input class="m-switch" type="checkbox" role="switch" aria-label="Weekly summary">')}
        </section>
        <section class="m-stack" data-gap="3" aria-labelledby="gn-mem">
          <div class="m-cluster" data-justify="between"><h2 id="gn-mem" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold); letter-spacing: -0.02em">Members <span style="${subtle}; font-weight: var(--m-font-weight-regular)">4</span></h2><button type="button" class="m-button" data-size="sm">${icon(I.plus, 12)} Invite</button></div>
          <div class="m-table-wrap" style="background: var(--m-color-bg-surface)">
            <table class="m-table">
              <thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Role</th><th scope="col"><span class="m-sr-only">Actions</span></th></tr></thead>
              <tbody>
                ${member('IM', 'Ines Marlow', 'ines@fieldwork.example', 'Owner')}
                ${member('RT', 'Rafe Tamsin', 'rafe@fieldwork.example', 'Admin')}
                ${member('OB', 'Oda Brennick', 'oda@fieldwork.example', 'Member')}
                ${member('JK', 'Jory Kell', 'jory@fieldwork.example', 'Member')}
              </tbody>
            </table>
          </div>
        </section>
        <section style="${panel}; padding: var(--m-space-2) var(--m-space-5)" aria-label="Delete the workspace">
          ${setRow('Delete this workspace', 'Removes every record, sequence and recording. It can’t be undone.', '<button type="button" class="m-button" data-variant="danger" data-size="sm">Delete workspace</button>', true)}
        </section>
      </div>
    </div>`,
);

// ── Empty state: the table frame with no rows, a line in its middle, the assistant ready beside it ──
const emptyState = shell(
  'Sequences',
  `${pageHead('Sequences', 'Sequences', `<button type="button" class="m-button" data-variant="primary">${icon(I.plus)} New sequence</button>`)}
    <div class="m-split" style="--m-layout-split-side: 20rem; --m-layout-split-gap: var(--m-space-3); flex-direction: row-reverse; align-items: stretch">
      <aside class="m-stack" data-gap="3" style="${panel}; padding: var(--m-space-4); justify-content: space-between" aria-label="Ask Larch">
        <div class="m-stack" data-gap="2"><span style="${monoCaps}; ${subtle}">Ask Larch</span><p style="${muted}; font-size: var(--m-font-size-sm)">Say who to reach and why. Larch drafts the steps and keeps each email for you to approve.</p></div>
        <form class="m-composer">
          <label class="m-sr-only" for="gn-empty-ask">Message</label>
          <textarea class="m-composer-input" id="gn-empty-ask" rows="3">Write a three-step email sequence for heads of revenue at companies that raised this year.</textarea>
          <div class="m-composer-actions">${iconButton(I.plus, 'Attach')}<span class="m-composer-spacer"></span><button type="submit" class="m-button" data-variant="primary" data-size="sm" data-icon-only aria-label="Send">${icon(I.up)}</button></div>
        </form>
      </aside>
      <section style="${panel}; overflow: hidden; display: flex; flex-direction: column; min-block-size: 28rem" aria-labelledby="gn-empty-t">
        <table class="m-table" style="--m-table-wrap-border: transparent">
          <thead><tr><th scope="col">Name</th><th scope="col">Steps</th><th scope="col">Enrolled</th><th scope="col">Replies</th></tr></thead>
        </table>
        <div class="m-stack" data-gap="4" data-align="center" style="flex: 1; justify-content: center; text-align: center; padding: var(--m-space-10) var(--m-space-6)">
          <span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: 2.5rem; block-size: 2.5rem; border-radius: var(--m-radius-md); background: var(--m-color-bg-sunken); ${muted}">${icon(I.send, 18)}</span>
          <h2 id="gn-empty-t" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold); letter-spacing: -0.02em">No sequences yet</h2>
          <p style="${subtle}; font-size: var(--m-font-size-sm); max-inline-size: 22rem">Ask for one in chat, or lay out the steps yourself. They will be listed here.</p>
          <div class="m-cluster" data-gap="2" data-justify="center"><button type="button" class="m-button">Start blank</button><button type="button" class="m-button" data-variant="ghost">${icon(I.file)} Templates</button></div>
        </div>
      </section>
    </div>`,
);

// ── The public frame: the white rim, the warm sheet, the header plate, the maroon footer ────────────
// On a phone the plate keeps only the wordmark, the main pill and a nine-dot menu (no media queries: the
// widths collapse to zero below 48rem, or above it for the menu)
const wideOnly = 'max(0px, calc((100vw - 48rem) * 100))';
const phoneOnly = 'max(0px, calc((48rem - 100vw) * 100))';
const siteHeader = (current: string) => `    <header class="m-navbar" style="max-inline-size: 69rem; margin-inline: auto; border-end-start-radius: var(--m-radius-lg); border-end-end-radius: var(--m-radius-lg)">
      <a class="m-navbar-brand" href="#" style="color: var(--m-color-fg-default); text-decoration: none">${wordmark('var(--m-font-size-lg)')}</a>
      <nav class="m-navbar-nav" aria-label="Site" style="max-inline-size: ${wideOnly}; overflow: hidden">
${['Product', 'Stories', 'Careers', 'Pricing'].map((l) => `        <a class="m-navbar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${l}${l === 'Product' ? ` ${icon(I.down, 12)}` : ''}</a>`).join('\n')}
      </nav>
      <div class="m-navbar-actions m-cluster" data-gap="2" style="flex-wrap: nowrap; margin-inline-start: auto">
        <span style="display: inline-flex; max-inline-size: ${wideOnly}; overflow: hidden"><a class="m-button" href="#">Log in</a></span>
        <a class="m-button" data-variant="primary" href="#">Try it free</a>
        <span style="display: inline-flex; max-inline-size: ${phoneOnly}; overflow: hidden">${iconButton(I.grip, 'Menu')}</span>
      </div>
    </header>`;
const footCol = (ic: string, title: string, links: string[]) =>
  `<div style="flex: 1 1 11rem; border-inline-end: var(--m-border-width-thin) solid var(--m-color-border-default)"><div class="m-cluster" data-gap="2" style="padding: var(--m-space-3); ${subtle}; font-size: var(--m-font-size-sm); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)">${icon(ic)} ${title}</div><ul style="list-style: none; margin: 0; padding: 0">${links.map((l) => `<li style="border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)"><a href="#" style="display: block; padding: var(--m-space-3); color: var(--m-color-fg-default); text-decoration: none; font-size: var(--m-font-size-sm)">${l}</a></li>`).join('')}</ul></div>`;
const siteFooter = `  <footer data-theme="garnet" data-mode="dark" style="background: var(--m-color-bg-surface); color: var(--m-color-fg-default); padding: var(--m-space-16) clamp(var(--m-space-4), 4vw, var(--m-space-10)) var(--m-space-6); border-radius: ${sheetRadius}; margin-block-start: var(--m-space-16)">
    <div style="max-inline-size: 70rem; margin-inline: auto; border: var(--m-border-width-thin) solid var(--m-color-border-default); border-radius: var(--m-radius-md); box-shadow: var(--m-shadow-lg); overflow: hidden">
      <div class="m-cluster" data-justify="between" style="padding: var(--m-space-2) var(--m-space-3); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)"><span class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-semibold)">${logo(14)} Larch site</span><span class="m-cluster" data-gap="2"><a class="m-button" data-size="sm" href="#">Log in</a><a class="m-button" data-variant="primary" data-size="sm" href="#">Try it free</a></span></div>
      <div class="m-cluster" data-gap="0" style="align-items: stretch">
        ${footCol(I.layers, 'Product', ['Lead search', 'Sequences', 'Records', 'Agents', 'Docs', 'Changelog'])}
        ${footCol(I.company, 'Company', ['Stories', 'Careers', 'Blog', 'Contact'])}
        ${footCol(I.file, 'Compare', ['All comparisons', 'Larch or a spreadsheet', 'Larch or a suite'])}
        ${footCol(I.lock, 'Legal', ['Terms', 'Privacy', 'Security', 'Cookie settings'])}
      </div>
    </div>
    <p style="text-align: center; ${subtle}; font-size: var(--m-font-size-xs); margin-block-start: var(--m-space-12)">© 2026 Larch Software</p>
  </footer>`;
const site = (current: string, main: string) => `<div style="min-block-size: 100vh; padding: ${rimPad}; padding-block-start: 0; background: var(--m-color-bg-surface)">
  <div style="background: var(--m-color-bg-canvas); border-radius: 0 0 ${sheetRadius} ${sheetRadius}; padding-block-end: var(--m-space-2)">
${siteHeader(current)}
${main}
${siteFooter}
  </div>
</div>`;

// ── Pricing ─────────────────────────────────────────────────────────────────────────────────────────
const tick = (text: string) =>
  `<li class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap"><span aria-hidden="true" style="flex: none; display: inline-grid; place-items: center; inline-size: 1rem; block-size: 1rem; margin-block-start: 0.15rem; border-radius: var(--m-radius-full); background: var(--m-color-fg-default); color: var(--m-color-bg-surface)">${icon(I.check, 10)}</span><span style="${muted}">${text}</span></li>`;
const dashed = 'border-block-start: var(--m-border-width-thin) dashed var(--m-color-border-default)';
const compareRow = (ic: string, label: string, a: string, b: string) =>
  `<tr><th scope="row" style="font-weight: var(--m-font-weight-regular); color: var(--m-color-fg-default)"><span class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${icon(ic, 16)}${label}</span></th><td style="${muted}">${a}</td><td style="${muted}">${b}</td></tr>`;
const faq = (q: string, a: string, open = false) =>
  `<details class="m-accordion-item" name="gn-faq"${open ? ' open' : ''}><summary>${q}</summary><div class="m-accordion-content" style="${muted}">${a}</div></details>`;

const pricing = site(
  'Pricing',
  `    <main style="padding: var(--m-space-16) clamp(var(--m-space-4), 4vw, var(--m-space-10)) 0">
      <div class="m-stack" data-gap="5" data-align="center" style="text-align: center; max-inline-size: 46rem; margin-inline: auto">
        <h1 style="${display('clamp(2.25rem, 5vw, var(--m-font-size-4xl))')}">One plan for the whole sales team</h1>
        <p style="${muted}; font-size: var(--m-font-size-xl); line-height: 1.55">Every customer, every conversation and the next step, kept together. The busywork runs itself; every email waits for your yes.</p>
        <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Billing period">
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Monthly</button>
          <button type="button" class="m-tab" role="tab" aria-selected="true">Yearly <span class="m-badge" style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg); border: 0; block-size: 1.125rem">−15%</span></button>
        </div></div>
      </div>
      <div class="m-cluster" data-gap="0" style="align-items: stretch; max-inline-size: 50rem; margin: var(--m-space-12) auto 0; border-radius: calc(var(--m-radius-lg) + var(--m-space-3)); background: var(--m-color-bg-sunken); box-shadow: var(--m-shadow-md)">
        <section class="m-stack" data-gap="5" style="flex: 1 1 22rem; margin: var(--m-space-3); padding: var(--m-space-8) var(--m-space-6); background: var(--m-color-bg-surface); border-radius: var(--m-radius-lg); box-shadow: var(--m-shadow-sm)" aria-labelledby="gn-team">
          <h2 id="gn-team" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-medium); letter-spacing: -0.02em">Team</h2>
          <p class="m-cluster" data-gap="2" data-align="baseline"><span style="font-size: 2.6rem; font-weight: var(--m-font-weight-semibold); letter-spacing: -0.055em; ${num}">$58</span><s style="${subtle}; font-size: var(--m-font-size-xl); ${num}">$68</s><span style="${subtle}; font-size: var(--m-font-size-xs)">seat / month</span></p>
          <p style="${muted}; font-size: var(--m-font-size-md)">$696 per seat, billed yearly. <strong style="color: var(--m-color-fg-default); font-weight: var(--m-font-weight-semibold)">Two months free.</strong></p>
          <a class="m-button" data-variant="primary" data-size="lg" href="#" style="inline-size: 100%">Start a 14-day trial</a>
          <div class="m-stack" data-gap="1" style="padding-block-start: var(--m-space-5); ${dashed}"><span style="font-weight: var(--m-font-weight-medium)">400 credits per seat each month</span><span style="${muted}; font-size: var(--m-font-size-md)">Pooled across the team</span></div>
          <ul class="m-stack" data-gap="3" style="list-style: none; padding: var(--m-space-5) 0 0; margin: 0; font-size: var(--m-font-size-md); ${dashed}">
            ${tick('Records, pipelines and reports')}
            ${tick('Email, calendar and call notes on each record')}
            ${tick('Email sequences you approve')}
            ${tick('Company search with work emails')}
          </ul>
        </section>
        <section class="m-stack" data-gap="5" style="flex: 1 1 22rem; padding: calc(var(--m-space-8) + var(--m-space-3)) var(--m-space-8)" aria-labelledby="gn-company">
          <h2 id="gn-company" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-medium); letter-spacing: -0.02em">Company</h2>
          <p style="font-size: 1.65rem; font-weight: var(--m-font-weight-semibold); letter-spacing: -0.055em">Priced with you</p>
          <p style="${muted}; font-size: var(--m-font-size-md)">From 12 seats</p>
          <a class="m-button" data-size="lg" href="#" style="inline-size: 100%; margin-block-start: auto">Contact sales</a>
          <div class="m-stack" data-gap="1" style="padding-block-start: var(--m-space-5); ${dashed}"><span style="font-weight: var(--m-font-weight-medium)">Credits sized to your team</span><span style="${muted}; font-size: var(--m-font-size-md)">Set once a year</span></div>
          <ul class="m-stack" data-gap="3" style="list-style: none; padding: var(--m-space-5) 0 0; margin: 0; font-size: var(--m-font-size-md); ${dashed}">
            ${tick('Everything in Team')}
            ${tick('Single sign-on and roles')}
            ${tick('Help moving your team over')}
          </ul>
        </section>
      </div>
      <section class="m-stack" data-gap="6" style="max-inline-size: 69rem; margin: var(--m-space-16) auto 0" aria-labelledby="gn-cmp">
        <div class="m-stack" data-gap="2"><h2 id="gn-cmp" style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-medium); letter-spacing: -0.045em">Both plans, side by side</h2><p style="${muted}">Start with the basics and add what the team needs as it grows.</p></div>
        <div style="background: var(--m-color-bg-surface); border-radius: var(--m-radius-lg); overflow-x: auto">
          <table class="m-table" style="--m-table-wrap-border: transparent; --m-table-font-size: var(--m-font-size-md); --m-table-border-color: var(--m-color-border-default); --m-table-cell-padding-y: var(--m-space-4); --m-table-cell-padding-x: var(--m-space-5)">
            <thead><tr><th scope="col">Features</th><th scope="col" style="font-size: var(--m-font-size-xl); color: var(--m-color-fg-default)">Team</th><th scope="col" style="font-size: var(--m-font-size-xl); color: var(--m-color-fg-default)">Company</th></tr></thead>
            <tbody>
              ${compareRow(I.people, 'Seats', 'Add seats any time', 'From 12 seats')}
              ${compareRow(I.layers, 'Records and reports', 'No limit on records', 'Everything in Team')}
              ${compareRow(I.plug, 'Connections', 'Mail, calendar, calls and chat', 'Plus custom connections')}
              ${compareRow(I.bot, 'Agents', 'Research, updates and drafts', 'Plus agents you design')}
              ${compareRow(I.lock, 'Security', 'Two-step sign-in', 'Single sign-on, audit log')}
            </tbody>
          </table>
        </div>
      </section>
      <section class="m-cluster" data-gap="10" data-align="start" style="max-inline-size: 69rem; margin: var(--m-space-16) auto 0" aria-labelledby="gn-faq">
        <div class="m-stack" data-gap="2" style="flex: 1 1 18rem"><h2 id="gn-faq" style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-medium); letter-spacing: -0.045em">Questions</h2><p style="${muted}">Billing, trials and moving over.</p></div>
        <div class="m-accordion" style="flex: 2 1 26rem; border-inline: 0">
          ${faq('What uses credits?', 'Searches and agent runs use credits from a pool the whole team shares. Unused credits roll over for one month.', true)}
          ${faq('Is anything lost after the trial?', 'Nothing is deleted. Pick a plan to keep going, or export everything as CSV.')}
          ${faq('Can we bring our old records?', 'Yes. Imports keep owners, custom fields and history, and fill in missing details as they go.')}
        </div>
      </section>
      <section class="m-stack" data-gap="6" data-align="center" style="text-align: center; padding-block: var(--m-space-16) 0" aria-labelledby="gn-move">
        <h2 id="gn-move" style="${display('clamp(2rem, 4.5vw, var(--m-font-size-4xl))')}">Switch in an afternoon.<br>Keep every thread.</h2>
        <p style="${muted}; font-size: var(--m-font-size-lg); max-inline-size: 34rem; line-height: var(--m-font-leading-relaxed)">Your old system's history comes along, owners and all, and gaps get filled while you work.</p>
        <div class="m-cluster" data-gap="3" data-justify="center"><a class="m-button" data-variant="primary" data-size="lg" href="#">Start a 14-day trial</a><a class="m-button" data-size="lg" href="#">Book a demo</a></div>
      </section>
    </main>`,
);

// ── Errors ──────────────────────────────────────────────────────────────────────────────────────────
// A whole page says it in one line: the code, a hairline, one sentence; then one way out
const wholePage = (code: string, text: string, action: string) =>
  `<section style="${panel}; padding: var(--m-space-12) var(--m-space-6)" aria-label="Error ${code}">
          <div class="m-stack" data-gap="6" data-align="center">
            <div class="m-cluster" data-gap="5" data-justify="center" style="flex-wrap: nowrap"><span style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-medium); ${num}">${code}</span><span aria-hidden="true" style="inline-size: 1px; align-self: stretch; min-block-size: 3rem; background: var(--m-color-border-strong)"></span><span style="font-size: var(--m-font-size-md)">${text}</span></div>
            ${action}
          </div>
        </section>`;

const errors = shell(
  'Deals',
  `${pageHead('Deals · New', 'Add a deal', '')}
    <div class="m-stack" data-gap="4" style="max-inline-size: 44rem">
      <form class="m-stack" data-gap="4" style="${panel}; padding: var(--m-space-6)" aria-labelledby="gn-err-form" novalidate>
        <h2 id="gn-err-form" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold); letter-spacing: -0.02em">Deal details</h2>
        <div class="m-alert" data-tone="danger" role="alert">
          <span class="m-alert-icon">${icon(I.alert, 16)}</span>
          <div class="m-alert-content"><div class="m-alert-title">Two fields need a look</div><div class="m-alert-body">The deal wasn't saved. Fix them and save again.</div></div>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="gn-err-co">Company</label>
          <input class="m-input" id="gn-err-co" value="" placeholder="Search companies" aria-invalid="true" aria-describedby="gn-err-co-e">
          <p class="m-field-error" id="gn-err-co-e">Choose a company. Deals live on a company record.</p>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 12rem; --m-layout-grid-gap: var(--m-space-4)">
          <div class="m-field">
            <label class="m-field-label" for="gn-err-val">Value</label>
            <input class="m-input" id="gn-err-val" value="$0" aria-invalid="true" aria-describedby="gn-err-val-e" style="${num}">
            <p class="m-field-error" id="gn-err-val-e">Enter a value above $0.</p>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="gn-err-stage">Stage</label>
            <select class="m-select" id="gn-err-stage"><option>Qualification</option><option>Demo</option><option>Pilot</option></select>
          </div>
        </div>
        <div class="m-cluster" data-justify="end" data-gap="2"><button type="button" class="m-button" data-variant="ghost">Cancel</button><button type="submit" class="m-button" data-variant="primary">Save deal</button></div>
      </form>
      <div class="m-alert" data-tone="warning" role="status">
        <span class="m-alert-icon">${icon(I.warn, 16)}</span>
        <div class="m-alert-content"><div class="m-alert-title">Your mailbox stopped syncing</div><div class="m-alert-body">New email since 09:40 isn't on records yet. Reconnect to catch up.</div>
        <div class="m-alert-actions"><button type="button" class="m-button" data-size="sm">${icon(I.refresh, 12)} Reconnect</button></div></div>
      </div>
      <div class="m-toast" data-tone="danger" role="alert"><div class="m-toast-content"><div class="m-toast-title">Couldn't start the call</div><div class="m-toast-body">The number didn't connect. Nothing was logged.</div></div><button type="button" class="m-button" data-size="sm">Try again</button></div>
      ${wholePage('404', 'This page doesn’t exist.', `<a class="m-button" data-variant="primary" href="#">${icon(I.home)} Back home</a>`)}
      ${wholePage('500', 'Something broke on our side. Nothing was changed.', `<div class="m-cluster" data-gap="2" data-justify="center"><button type="button" class="m-button" data-variant="primary">${icon(I.refresh)} Try again</button><a class="m-button" href="#">Status page</a></div>`)}
      ${wholePage('403', 'This record belongs to another team.', `<button type="button" class="m-button" data-variant="primary">${icon(I.key)} Ask for access</button>`)}
    </div>`,
);

// ── Reading: a changelog entry on the public site ───────────────────────────────────────────────────
const rail = (items: string[], current: string) =>
  items
    .map(
      (l) =>
        `<li><a href="#" class="m-cluster" data-gap="2" style="flex-wrap: nowrap; text-decoration: none; font-size: var(--m-font-size-md); ${l === current ? 'color: var(--m-color-fg-default)' : subtle}"${l === current ? ' aria-current="location"' : ''}>${l === current ? '<span aria-hidden="true" style="inline-size: 0.5rem; block-size: 1.5px; background: currentColor"></span>' : ''}${l}</a></li>`,
    )
    .join('');
const frameShot = `<div role="img" aria-label="A saved view: a table with three columns and a filter chip" style="border-radius: calc(var(--m-radius-lg) + var(--m-space-2)); background: var(--m-color-bg-sunken); padding: var(--m-space-2); box-shadow: var(--m-shadow-lg)">
          <div style="aspect-ratio: 16 / 9; border-radius: var(--m-radius-lg); background: var(--m-color-bg-surface); display: grid; place-items: center">
            <svg viewBox="0 0 400 200" width="74%" aria-hidden="true"><rect x="20" y="16" width="56" height="18" rx="5" style="fill: var(--m-color-bg-surface); stroke: var(--m-color-border-default)"/><rect x="84" y="16" width="56" height="18" rx="5" style="fill: var(--m-color-info-bg); stroke: var(--m-color-info-border)"/><rect x="20" y="46" width="360" height="138" rx="10" style="fill: var(--m-color-bg-surface); stroke: var(--m-color-border-default)"/><path d="M20 72 H380 M20 100 H380 M20 128 H380 M20 156 H380 M140 46 V184 M260 46 V184" style="stroke: var(--m-color-border-muted)"/><path d="M276 86 h40 M276 114 h40 M276 142 h28 M276 170 h20" stroke-width="5" stroke-linecap="round" style="stroke: var(--m-color-success-solid)"/></svg>
          </div>
        </div>`;
const reading = site(
  'Product',
  `    <main class="m-cluster" data-gap="10" data-align="start" style="max-inline-size: 69rem; margin-inline: auto; padding: var(--m-space-12) clamp(var(--m-space-4), 4vw, var(--m-space-10)) 0; flex-wrap: wrap">
      <nav class="m-stack" data-gap="4" aria-label="Contents" style="flex: 1 1 12rem; max-inline-size: 16rem; padding-block-start: var(--m-space-2)">
        <span style="${eyebrow}">Contents</span>
        <ul class="m-stack" data-gap="2" style="list-style: none; padding: 0; margin: 0">${rail(['In short', 'Making a view', 'Sharing', 'Defaults', 'What is next'], 'In short')}</ul>
      </nav>
      <article class="m-stack" data-gap="6" style="flex: 3 1 30rem; min-inline-size: 0; max-inline-size: 45rem" aria-labelledby="gn-post">
        <div class="m-cluster" data-justify="between" data-gap="3">
          <nav class="m-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="#">Changelog</a></li><li><a href="#" aria-current="page">Saved views</a></li></ol></nav>
          <time datetime="2026-11-04" style="${subtle}; font-size: var(--m-font-size-md)">November 4, 2026</time>
        </div>
        <h1 id="gn-post" style="${display('clamp(2.25rem, 5vw, 3.1rem)')}">Saved views</h1>
        <p style="${muted}; font-size: 1.2rem; line-height: 1.55; max-inline-size: 36rem">Keep the filters, columns and order you use every week, and open them in one click from the nav.</p>
        ${frameShot}
        <div class="m-prose" style="font-size: var(--m-font-size-lg)">
          <h2>A view for every routine</h2>
          <p>Most weeks start the same way: the same filters, the same columns, sorted the same way. Now you can keep that setup as a view. Set the table up once, choose Save view, and give it a name.</p>
          <p>Views sit under Records in the nav, with a count of what is in them today. Change the filters later and the view asks whether to update itself or save a new one.</p>
          <h3>Sharing</h3>
          <ul><li><strong>Just you:</strong> the default; nobody else sees it.</li><li><strong>Your team:</strong> everyone on the team gets it in their nav.</li><li><strong>The workspace:</strong> admins can pin a view for everyone.</li></ul>
          <p>Views keep their own column widths, so a wide table stays readable. <a href="#">Read how views work</a>.</p>
        </div>
      </article>
    </main>`,
);

// ── Sign-in: the app's door, a rimmed white card on the warm sheet ──────────────────────────────────
const signIn = `<div style="min-block-size: 100vh; padding: ${rimPad}; background: var(--m-color-bg-surface)">
  <main style="min-block-size: calc(100vh - 1rem); background: var(--m-color-bg-canvas); border-radius: ${sheetRadius}; display: grid; place-items: center; padding: var(--m-space-10) var(--m-space-4)">
    ${rim(
      `<section class="m-stack" data-gap="6" style="background: var(--m-color-bg-surface); border-radius: var(--m-radius-lg); padding: clamp(var(--m-space-6), 6vw, var(--m-space-10))" aria-labelledby="gn-in-title">
        <div class="m-stack" data-gap="4" data-align="center" style="text-align: center">
          ${wordmark()}
          <h1 id="gn-in-title" style="${display('var(--m-font-size-3xl)')}">Welcome back</h1>
          <p style="${muted}; font-size: var(--m-font-size-md)">Sign in to your team's workspace.</p>
        </div>
        <div class="m-stack" data-gap="3">
          <button type="button" class="m-button" data-size="lg" style="inline-size: 100%">${icon(I.mail, 16)} Continue with your work email</button>
          <button type="button" class="m-button" data-size="lg" style="inline-size: 100%">${icon(I.key, 16)} Continue with a passkey</button>
        </div>
        <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap; ${subtle}; font-size: var(--m-font-size-xs)"><span style="flex: 1; ${hair}"></span>or with a link<span style="flex: 1; ${hair}"></span></div>
        <form class="m-stack" data-gap="3">
          <div class="m-field">
            <label class="m-field-label" for="gn-in-email">Work email</label>
            <input class="m-input" id="gn-in-email" type="email" placeholder="you@company.com" autocomplete="email">
          </div>
          <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Send me a sign-in link</button>
        </form>
        <p style="${subtle}; font-size: var(--m-font-size-xs); text-align: center">New here? <a href="#" style="color: var(--m-color-fg-default); font-weight: var(--m-font-weight-medium)">Start a free trial</a></p>
      </section>`,
      'inline-size: min(100%, 27rem)',
    )}
  </main>
</div>`;

export const garnetRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'The nav on the white rim beside a near-white sheet; a display greeting, then white panels: the day’s tasks, the quarter’s pipeline by stage, an activity line in signal green, and new signals with fit bars.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'Lead search: a record table on a hairline grid with a search box, a filter chip with its count, checkboxes and five-step fit bars; the open company beside it with its evidence timeline.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One question on the warm sheet: a numbered pill track of steps, a heavy centred headline, and the choices in a rimmed white card with maroon pills.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A grouped settings nav with tracked capital headings beside one white panel of hairline rows, the members table and a separate danger row.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'The table frame keeps its headers with one quiet line in its middle, and the assistant beside it holds a ready-made request.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The public frame: a white rim, the warm sheet, the header plate; a heavy centred headline, a period switch with a yellow saving, a rimmed plan card beside a plain one, the comparison table, questions and the maroon footer.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors under their controls with an alert above the form, a warning with one action, a toast, and whole-page errors said in one line: the code, a hairline, a sentence.',
    html: errors,
  },
  {
    name: 'reading',
    title: 'Reading',
    description:
      'A changelog post: a "Contents" rail with a dash on the current section, a breadcrumb with the date at the right, a heavy title, a muted lead, a rimmed product picture and the prose at 16/27.',
    html: reading,
  },
  {
    name: 'sign-in',
    title: 'Sign-in',
    description: 'The app’s door: a rimmed white card centred on the warm sheet with the wordmark, a heavy title, two outline pills and the maroon one.',
    html: signIn,
  },
];
