import type { ArchetypeRecipe } from '../types';

/*
 * Linen's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from one person's task lists. They follow the language's
 * real screen patterns, translated from a desktop app to the web: a pale sidebar of lists with
 * coloured list glyphs, a white page with a bold list title, small rounded checkboxes with the
 * project name in grey beneath, blue section headings over a hairline, outlined tag pills, a quiet
 * toolbar of icons along the bottom, and settings as a window of icon tabs over right-aligned
 * labels.
 */

// Lucide icons, outlined, 1.5px stroke. `fill` gives the list glyphs their soft solid look.
const icon = (paths: string, size = 16, fill: 'none' | 'soft' | 'solid' = 'none') =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill === 'none' ? 'none' : 'currentColor'}"${fill === 'soft' ? ' fill-opacity="0.16"' : ''} stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  inbox:
    '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  days: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
  layers:
    '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
  archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
  done: '<path d="M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5"/><path d="m9 11 3 3L22 4"/>',
  box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
  note: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  checklist: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  squarePlus: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  sliders:
    '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  circle: '<circle cx="12" cy="12" r="9"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  cloudOff:
    '<path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193"/><path d="M21.532 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.008 7.008 0 0 0 10 5.07"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  laptop:
    '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>',
  phone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  tablet: '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><line x1="12" x2="12.01" y1="18" y2="18"/>',
  watch:
    '<circle cx="12" cy="12" r="6"/><polyline points="12 10 12 12 13 13"/><path d="m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05"/><path d="m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  searchX: '<path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  updown: '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
};

// A project's progress: an outlined circle with a wedge filled to how much is done
const pie = (done: number, size = 15) => {
  const a = done * 2 * Math.PI;
  const x = (12 + 6 * Math.sin(a)).toFixed(2);
  const y = (12 - 6 * Math.cos(a)).toFixed(2);
  const wedge = done <= 0 ? '' : done >= 1 ? '<circle cx="12" cy="12" r="6" fill="currentColor" stroke="none"/>' : `<path d="M12 12V6A6 6 0 ${done > 0.5 ? 1 : 0} 1 ${x} ${y}Z" fill="currentColor" stroke="none"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/>${wedge}</svg>`;
};

const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)';
const sub = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
const listTitle =
  'font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)';
const glyph = (tone: string) => `display: inline-flex; color: var(--m-color-${tone})`;

// The sidebar of lists. Each entry: [glyph, tone, label, extra]
type Entry = [string, string, string, string?];
const link = ([g, tone, label, extra]: Entry, current: string, bold = false) =>
  `          <li><a class="m-sidebar-link" href="#"${label === current ? ' aria-current="page"' : ''}${bold ? ' style="font-weight: var(--m-font-weight-semibold)"' : ''}><span style="${glyph(tone)}">${g}</span> ${label}${extra ?? ''}</a></li>`;
const count = (n: number) => ` <span class="m-sidebar-count" style="font-size: var(--m-font-size-sm)">${n}</span>`;
const due = (n: number, total: number) =>
  ` <span class="m-badge" data-tone="danger" data-variant="solid" style="margin-inline-start: auto">${n}</span><span class="m-sidebar-count" style="margin-inline-start: 0; font-size: var(--m-font-size-sm)">${total}</span>`;

const sidebar = (current: string) => `  <nav class="m-sidebar" aria-label="Lists" style="padding-block-start: var(--m-space-10)">
    <ul>
${link([icon(I.inbox, 16, 'soft'), 'accent-default', 'Capture', count(3)], current)}
    </ul>
    <ul>
${[
  link([icon(I.star, 16, 'solid'), 'warning-solid', 'Focus', due(1, 6)], current),
  link([icon(I.days, 16, 'soft'), 'danger-fg', 'Ahead'], current),
  link([icon(I.layers, 16, 'soft'), 'success-fg', 'Open'], current),
  link([icon(I.archive, 16, 'soft'), 'warning-fg', 'Later'], current),
].join('\n')}
    </ul>
    <ul>
${link([icon(I.done, 16, 'soft'), 'success-solid', 'Finished'], current)}
    </ul>
${[
  ['Home', [['Repaint the hallway', 0.6], ['Winter garden prep', 0.25], ['Book the boiler service', 0]]],
  ['Studio', [['Spring glaze tests', 0.45], ['Kiln shelf order', 0.8], ['Open studio weekend', 0.1]]],
  ['Learning', [['Portuguese basics', 0.35], ['Half-marathon base', 0.55]]],
]
  .map(
    ([area, projects]) => `    <ul>
${link([icon(I.box, 16), 'fg-subtle', area as string], current, true)}
${(projects as [string, number][]).map(([p, d]) => link([pie(d), 'fg-subtle', p], current)).join('\n')}
    </ul>`,
  )
  .join('\n')}
    <div class="m-cluster" data-justify="between" style="margin-block-start: auto; ${hair}; padding-block-start: var(--m-space-2)">
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="color: var(--m-color-fg-muted)">${icon(I.plus, 14)} New list</button>
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Settings" style="color: var(--m-color-fg-muted)">${icon(I.sliders, 16)}</button>
    </div>
  </nav>`;

// The quiet toolbar along the bottom of the page
const toolbar = (items: [string, string][]) => `    <footer class="m-cluster" data-justify="center" data-gap="10" style="margin-block-start: auto; padding-block: var(--m-space-2); background: var(--m-color-bg-canvas); border-block-start: var(--m-border-width-thin) solid var(--m-color-border-muted); color: var(--m-color-fg-muted)">
${items.map(([ic, l]) => `      <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="${l}" style="color: inherit">${icon(ic, 18)}</button>`).join('\n')}
    </footer>`;

const shell = (current: string, main: string, tools: [string, string][]) => `<div class="m-split" style="--m-layout-split-side: 14rem; --m-layout-split-gap: 0; min-block-size: 100vh">
${sidebar(current)}
  <div class="m-stack" data-gap="0" style="min-block-size: 100vh">
    <main class="m-container" data-size="md" style="inline-size: 100%; padding-block: var(--m-space-12) var(--m-space-16)">
${main}
    </main>
${toolbar(tools)}
  </div>
</div>`;

// A to-do: the small rounded box, the title, and the project in grey underneath
const todo = (title: string, project = '', opts: { extras?: string; right?: string; done?: boolean } = {}) =>
  `          <li class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap; padding-block: var(--m-space-1)">
            <input class="m-checkbox" type="checkbox" aria-label="${title.replace(/<[^>]+>/g, '')}"${opts.done ? ' checked' : ''} style="margin-block-start: 0.1875rem">
            <span class="m-stack" data-gap="0" style="flex: 1; min-inline-size: 0; line-height: var(--m-font-leading-tight)">
              <span class="m-cluster" data-gap="2"${opts.done ? ' style="color: var(--m-color-fg-muted)"' : ''}>${title}${opts.extras ?? ''}</span>${project ? `\n              <span style="${sub}; padding-block-start: 2px">${project}</span>` : ''}
            </span>${opts.right ? `\n            ${opts.right}` : ''}
          </li>`;
const list = (items: string[]) => `        <ul class="m-stack" data-gap="1" style="padding: 0">
${items.join('\n')}
        </ul>`;
const noteMark = `<span style="${glyph('fg-subtle')}" aria-label="Has notes">${icon(I.note, 13)}</span>`;
const checklistMark = `<span style="${glyph('fg-subtle')}" aria-label="Has a checklist">${icon(I.checklist, 13)}</span>`;
const dueFlag = (when: string) =>
  `<span class="m-cluster" data-gap="1" style="color: var(--m-color-danger-fg); font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-medium); white-space: nowrap">${icon(I.flag, 14, 'solid')} ${when}</span>`;
const tag = (t: string) => `<span class="m-badge">${t}</span>`;
const dateChip = (d: string) => `<span class="m-badge" data-variant="solid">${d}</span>`;

// A blue section heading over a hairline, with its actions on the right
const heading = (title: string, id: string) =>
  `        <div class="m-cluster" data-justify="between" style="border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default); padding-block-end: var(--m-space-1)">
          <h2 id="${id}" style="color: var(--m-color-accent-text); font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-semibold)">${title}</h2>
          <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Actions for ${title}" style="color: var(--m-color-accent-text)">${icon(I.more, 18)}</button>
        </div>`;

// The day's calendar: a quiet grey box with coloured times
const event = (time: string, what: string, tone: 'info' | 'success') =>
  `<div><span style="color: var(--m-color-${tone}-fg); font-variant-numeric: tabular-nums">${time}</span> ${what}</div>`;

const dashboard = shell(
  'Focus',
  `      <div class="m-stack" data-gap="8">
        <h1 class="m-cluster" data-gap="2" style="${listTitle}"><span style="${glyph('warning-solid')}">${icon(I.star, 26, 'solid')}</span> Focus</h1>
        <section aria-label="Calendar" class="m-stack" data-gap="0" style="padding: var(--m-space-3) var(--m-space-4); background: var(--m-color-bg-sunken); border-radius: var(--m-radius-lg); color: var(--m-color-fg-muted); line-height: 1.35">
          <div class="m-cluster" data-gap="2"><span style="inline-size: 3px; block-size: 0.875rem; border-radius: 2px; background: var(--m-color-info-fg)"></span>Ines flies home</div>
          ${event('8:15 AM', 'Swim, lane 4', 'info')}
          ${event('10:00 AM', 'Call with the framer', 'info')}
          ${event('1:30 PM', 'Studio clean-up', 'success')}
          ${event('6:00 PM', 'Supper at Tomas’s', 'success')}
        </section>
${list([
  todo('Order 20 kiln shelf posts', 'Kiln shelf order', { right: dueFlag('today') }),
  todo('Sand the hallway skirting', 'Repaint the hallway', { extras: noteMark }),
  todo('Mix three celadon test batches', 'Spring glaze tests'),
  todo('Ask Priya about the gallery wall', 'Open studio weekend'),
  todo('Renew library books', 'Home'),
  todo('Twenty minutes of verb drills', 'Portuguese basics', { extras: checklistMark }),
])}
        <section class="m-stack" data-gap="2" aria-labelledby="ln-evening">
          <h2 id="ln-evening" class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-bold); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default); padding-block-end: var(--m-space-2)"><span style="${glyph('info-fg')}">${icon(I.moon, 16, 'soft')}</span> Evening</h2>
${list([
  todo('Lay out tomorrow’s running kit', 'Half-marathon base'),
  todo('Read the chapter on reduction firing', 'Spring glaze tests', { extras: noteMark }),
  todo('Write the open-studio flyer', 'Open studio weekend', { extras: `${noteMark}${checklistMark}` }),
])}
        </section>
      </div>`,
  [
    [I.plus, 'New to-do'],
    [I.calendar, 'When'],
    [I.arrow, 'Move'],
    [I.search, 'Quick find'],
  ],
);

// The date picker: a dark menu with Today and Tonight, a month and Later
const day = (d: string, today = false) =>
  `<span style="text-align: center; padding-block: 2px${today ? '; color: var(--m-color-fg-muted)' : ''}">${today ? icon(I.star, 12, 'solid') : d}</span>`;
const picker = `<div class="m-popover" data-static data-theme="linen" data-mode="dark" style="inline-size: 15rem; font-size: var(--m-font-size-md)" aria-label="When">
          <div class="m-menu" role="menu" aria-label="When">
            <div class="m-menu-label">When</div>
            <button type="button" class="m-menu-item" role="menuitem" style="background: var(--m-color-accent-default); color: var(--m-color-accent-fg)"><span style="${glyph('warning-solid')}">${icon(I.star, 14, 'solid')}</span> Today</button>
            <button type="button" class="m-menu-item" role="menuitem"><span style="${glyph('info-fg')}">${icon(I.moon, 14, 'soft')}</span> Tonight</button>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; padding: var(--m-space-2); font-size: var(--m-font-size-sm); font-variant-numeric: tabular-nums">
              ${['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => `<span style="text-align: center; color: var(--m-color-fg-muted); font-size: var(--m-font-size-xs)">${d}</span>`).join('')}
              ${['', '', ''].map(() => '<span></span>').join('')}${day('', true)}${['13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'].map((d) => day(d)).join('')}
            </div>
            <button type="button" class="m-menu-item" role="menuitem"><span style="${glyph('warning-fg')}">${icon(I.archive, 14, 'soft')}</span> Later</button>
            <div class="m-menu-separator" role="separator"></div>
            <button type="button" class="m-menu-item" role="menuitem" style="color: var(--m-color-fg-muted)">${icon(I.plus, 14)} Add a reminder</button>
          </div>
        </div>`;

// A project page with its tag filters and headings; one to-do open as a card, its date picker beside it
const listDetail = shell(
  'Spring glaze tests',
  `      <div class="m-stack" data-gap="8">
        <div class="m-stack" data-gap="3">
          <h1 class="m-cluster" data-gap="2" style="${listTitle}"><span style="${glyph('accent-text')}">${pie(0.45, 24)}</span> Spring glaze tests <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Project actions" style="color: var(--m-color-fg-muted)">${icon(I.more, 18)}</button></h1>
          <p style="max-inline-size: 34rem">Three new glazes for the spring range. Fire every test at cone 6 and keep notes on each tile, so the winners can go straight into the order.</p>
        </div>
        <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Filter by tag">
          <button type="button" class="m-tab" role="tab" aria-selected="true">All</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Kiln</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Errand</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Priya</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1" aria-label="More tags">${icon(I.more, 16)}</button>
        </div></div>
        <section class="m-stack" data-gap="2" aria-labelledby="ln-h-mix">
${heading('Mixing', 'ln-h-mix')}
${list([
  todo('Weigh out the base recipe', '', { extras: noteMark }),
  todo('Buy a second sieve', '', { extras: tag('Errand') }),
  todo('Label twelve test tiles', ''),
])}
          <article class="m-card" aria-label="Open to-do: Mix three celadon test batches" style="margin-block: var(--m-space-2)">
            <div class="m-card-body m-stack" data-gap="4">
              <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap"><input class="m-checkbox" type="checkbox" aria-label="Mix three celadon test batches"> <span>Mix three celadon test batches</span></div>
              <p style="color: var(--m-color-fg-muted); padding-inline-start: calc(0.9375rem + var(--m-space-3))">Half the iron in batch two. Priya has the 80-mesh sieve until Thursday.</p>
              <ul class="m-stack" data-gap="0" style="padding: 0; margin-inline-start: calc(0.9375rem + var(--m-space-3))">
                <li class="m-cluster" data-gap="2" style="padding-block: var(--m-space-1); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-muted); color: var(--m-color-fg-muted)"><span style="${glyph('fg-subtle')}">${icon(I.check, 14)}</span> Batch one, standard</li>
                <li class="m-cluster" data-gap="2" style="padding-block: var(--m-space-1); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-muted)"><span style="${glyph('accent-text')}">${icon(I.circle, 14)}</span> Batch two, half iron</li>
                <li class="m-cluster" data-gap="2" style="padding-block: var(--m-space-1); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-muted)"><span style="${glyph('accent-text')}">${icon(I.circle, 14)}</span> Batch three, extra silica</li>
              </ul>
              <div class="m-cluster" data-justify="between" style="padding-inline-start: calc(0.9375rem + var(--m-space-3))">
                <span class="m-cluster" data-gap="2"><span class="m-badge" data-tone="success">Kiln</span><span class="m-cluster" data-gap="1" style="font-size: var(--m-font-size-sm)"><span style="${glyph('warning-solid')}">${icon(I.star, 14, 'solid')}</span> Today</span></span>
                <span class="m-cluster" data-gap="1" style="color: var(--m-color-fg-subtle)">
                  <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Tags" style="color: inherit">${icon(I.tag, 16)}</button>
                  <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Checklist" style="color: inherit">${icon(I.checklist, 16)}</button>
                  <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Deadline" style="color: inherit">${icon(I.flag, 16)}</button>
                </span>
              </div>
            </div>
          </article>
        </section>
        <section class="m-stack" data-gap="2" aria-labelledby="ln-h-fire">
${heading('Firing', 'ln-h-fire')}
${list([
  todo('Book a slot in the shared kiln', '', { extras: tag('Kiln') }),
  todo(`${dateChip('Mar 12')} Collect the fired tiles`, ''),
  todo('Photograph each tile in daylight', '', { extras: noteMark }),
])}
        </section>
        <section class="m-cluster" data-gap="6" data-align="start" aria-label="Choosing a date">
          ${picker}
          <p style="${sub}; max-inline-size: 16rem">Pickers open beside what they change: a dark menu with Today and Tonight first, then the month.</p>
        </section>
      </div>`,
  [
    [I.plus, 'New to-do'],
    [I.squarePlus, 'New heading'],
    [I.calendar, 'When'],
    [I.arrow, 'Move'],
    [I.search, 'Quick find'],
  ],
);

// First run: one sheet in the middle of the page, a question at a time
const choice = (name: string, label: string, desc: string, checked = false) =>
  `          <label class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap; padding: var(--m-space-3) var(--m-space-4); border-radius: var(--m-radius-md);${checked ? ' background: var(--m-color-bg-sunken)' : ''}">
            <input class="m-radio" type="radio" name="${name}"${checked ? ' checked' : ''} style="margin-block-start: 0.1875rem">
            <span class="m-stack" data-gap="0"><span style="font-weight: var(--m-font-weight-medium)">${label}</span><span style="${sub}">${desc}</span></span>
          </label>`;

const onboarding = `<main class="m-container" data-size="sm" style="padding-block: var(--m-space-16)">
  <form class="m-card" aria-labelledby="ln-onb-title" style="--m-card-padding-md: var(--m-space-8)">
    <div class="m-card-body m-stack" data-gap="6">
      <div class="m-stack" data-gap="3" data-align="center" style="text-align: center">
        <span style="${glyph('accent-default')}">${icon(I.done, 40, 'soft')}</span>
        <span style="${sub}" id="ln-onb-step">Step 2 of 3</span>
        <h1 id="ln-onb-title" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight)">Where should new to-dos go?</h1>
        <p class="m-muted" style="max-inline-size: 22rem">You can change this any time in Settings. Nothing is decided for you until you choose.</p>
      </div>
      <fieldset class="m-stack" data-gap="1">
        <legend class="m-sr-only">New to-dos</legend>
${choice('ln-dest', 'Capture', 'Collect everything in one list and sort it later.', true)}
${choice('ln-dest', 'Focus', 'Put new to-dos straight onto today’s list.')}
${choice('ln-dest', 'The list I’m looking at', 'Add to whichever list is open.')}
      </fieldset>
      <div class="m-field">
        <label class="m-field-label" for="ln-onb-name">Name your first area</label>
        <input class="m-input" id="ln-onb-name" value="Studio" aria-describedby="ln-onb-name-hint">
        <p class="m-field-hint" id="ln-onb-name-hint">Areas hold the projects for one part of your life, like Home or Work.</p>
      </div>
      <div class="m-cluster" data-justify="between">
        <button type="button" class="m-button" data-variant="ghost">${icon(I.left, 14)} Back</button>
        <button type="submit" class="m-button" data-variant="primary">Continue</button>
      </div>
    </div>
  </form>
  <progress class="m-progress" data-size="sm" value="2" max="3" aria-label="Step 2 of 3" style="display: block; inline-size: 6rem; margin: var(--m-space-6) auto 0">2 of 3</progress>
</main>`;

// Settings: a window of icon tabs over right-aligned labels and their controls
const tabTile = (ic: string, label: string, current = false) =>
  `<button type="button" class="m-stack" data-gap="1" data-align="center" role="tab" aria-selected="${current}"${current ? '' : ' tabindex="-1"'} style="padding: var(--m-space-2) var(--m-space-3); border: 0; border-radius: var(--m-radius-lg); font: inherit; font-size: var(--m-font-size-sm); cursor: pointer; ${current ? 'background: var(--m-color-bg-surface); color: var(--m-color-accent-text); box-shadow: var(--m-shadow-sm)' : 'background: transparent; color: var(--m-color-fg-muted)'}">${icon(ic, 22)}${label}</button>`;
const formRow = (id: string, label: string, control: string) =>
  `        <label for="${id}" style="text-align: end">${label}</label>
        <div>${control}</div>`;
const box = (label: string, checked = true) =>
  `          <label class="m-field" data-layout="inline"><input class="m-checkbox" type="checkbox"${checked ? ' checked' : ''}> ${label}</label>`;

const settings = `<main class="m-container" data-size="md" style="padding-block: var(--m-space-12)">
  <div class="m-stack" data-gap="8">
  <section class="m-card" aria-labelledby="ln-set-title" style="padding: 0; overflow: hidden">
    <header class="m-stack" data-gap="2" style="padding: var(--m-space-2) var(--m-space-4) var(--m-space-3); background: var(--m-color-bg-sunken); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
      <h1 id="ln-set-title" style="text-align: center; font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-semibold)">Basics</h1>
      <div class="m-cluster" data-gap="1" data-justify="center" role="tablist" aria-label="Settings">
        ${tabTile(I.sliders, 'Basics', true)}
        ${tabTile(I.cloud, 'Sync')}
        ${tabTile(I.squarePlus, 'Capture')}
        ${tabTile(I.bell, 'Alerts')}
        ${tabTile(I.days, 'Schedule')}
      </div>
    </header>
    <div class="m-stack" data-gap="5" style="padding: var(--m-space-6) var(--m-space-8) var(--m-space-8)">
      <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr); gap: var(--m-space-3) var(--m-space-3); align-items: center">
${formRow('ln-set-clear', 'Clear finished items:', '<select class="m-select" id="ln-set-clear" data-size="sm"><option>At the end of each day</option><option>Straight away</option><option>Never</option></select>')}
${formRow('ln-set-badge', 'Number on the app icon:', '<select class="m-select" id="ln-set-badge" data-size="sm"><option>Due and overdue</option><option>Everything in Focus</option><option>None</option></select>')}
${formRow('ln-set-look', 'Look:', '<select class="m-select" id="ln-set-look" data-size="sm"><option>Match the system</option><option>Light</option><option>Dark</option></select>')}
${formRow('ln-set-week', 'Weeks begin on:', '<select class="m-select" id="ln-set-week" data-size="sm"><option>Monday</option><option>Sunday</option></select>')}
      </div>
      <hr class="m-divider">
      <fieldset class="m-stack" data-gap="2" style="padding-inline-start: calc(44.4% + var(--m-space-3))">
        <legend class="m-sr-only">Options</legend>
${box('Show a count beside each list')}
${box('Fold finished checklist items away')}
${box('Open new windows on Focus', false)}
${box('Ask before deleting a project')}
      </fieldset>
    </div>
  </section>
  <section class="m-card" aria-labelledby="ln-sync-title">
    <div class="m-card-body" style="display: grid; grid-template-columns: minmax(6rem, 9rem) minmax(0, 1fr); gap: var(--m-space-6); align-items: start">
      <div class="m-stack" data-gap="3" data-align="center" style="text-align: center">
        <span style="${glyph('accent-default')}">${icon(I.cloud, 56, 'soft')}</span>
        <h2 id="ln-sync-title" style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-semibold)">Sync</h2>
        <input class="m-switch" type="checkbox" role="switch" checked aria-label="Sync on">
      </div>
      <div class="m-stack" data-gap="5">
        <div class="m-stack" data-gap="2">
          <h3 style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-semibold)">Your account</h3>
          <span style="font-family: var(--m-font-family-mono); font-size: var(--m-font-size-sm); overflow-wrap: anywhere">marisol.ortega@example.com</span>
          <div><button type="button" class="m-button" data-size="sm">Change account…</button></div>
          <p class="m-muted" style="font-size: var(--m-font-size-sm)">Syncing is on. Last synced today at 9:41 AM.</p>
        </div>
        <div class="m-stack" data-gap="2">
          <h3 style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-semibold)">Email in</h3>
          <p class="m-muted" style="font-size: var(--m-font-size-sm)">Forward a message to your private address and it arrives in Capture.</p>
          <div><button type="button" class="m-button" data-size="sm">Set up…</button></div>
        </div>
        <a href="#" class="m-cluster" data-gap="1" style="align-self: end; color: var(--m-color-accent-text); text-decoration: none; font-size: var(--m-font-size-sm)">Sync help ${icon(I.right, 12)}</a>
      </div>
    </div>
  </section>
  </div>
</main>`;

// An empty list: the list's own glyph, large and faint, in the middle of the page
const emptyState = shell(
  'Capture',
  `      <div class="m-stack" data-gap="8" style="min-block-size: 70vh">
        <h1 class="m-cluster" data-gap="2" style="${listTitle}"><span style="${glyph('accent-default')}">${icon(I.inbox, 26, 'soft')}</span> Capture</h1>
        <div class="m-stack" data-gap="3" data-align="center" style="text-align: center; margin-block: auto; color: var(--m-color-fg-subtle)">
          <span style="display: inline-flex; opacity: 0.45">${icon(I.inbox, 72, 'soft')}</span>
          <p style="max-inline-size: 22rem">Nothing to sort. New to-dos land here until you give them a list or a day.</p>
          <button type="button" class="m-button" data-variant="ghost" style="color: var(--m-color-accent-text)">${icon(I.plus, 14)} New to-do</button>
        </div>
      </div>`,
  [
    [I.plus, 'New to-do'],
    [I.calendar, 'When'],
    [I.search, 'Quick find'],
  ],
);

// Pricing: the public site's grey cards, one per device, a one-time price and a store button
const product = (ic: string, name: string, needs: string, price: string, trial: boolean) =>
  `      <section class="m-card" data-variant="sunken" style="border-radius: 18px" aria-labelledby="ln-p-${name.toLowerCase()}">
        <div class="m-card-body m-stack" data-gap="3" data-align="center" style="text-align: center; block-size: 100%">
          <span style="${glyph('fg-muted')}">${icon(ic, 64)}</span>
          <h2 id="ln-p-${name.toLowerCase()}" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold)">${name}</h2>
          <p style="color: var(--m-color-fg-muted); line-height: 1.35">${needs}<br><span style="font-variant-numeric: tabular-nums">${price}</span> one time</p>
          <div class="m-stack" data-gap="2" style="margin-block-start: auto; inline-size: 100%">
${trial ? `            <button type="button" class="m-button" style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">${icon(I.arrow, 14)} Try it free for 15 days</button>\n` : ''}            <button type="button" class="m-button" style="background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)">Get it for ${name.toLowerCase()}</button>
          </div>
        </div>
      </section>`;

const pricing = `<div style="background: var(--m-color-bg-canvas)">
<header class="m-navbar" style="max-inline-size: 60rem; margin-inline: auto; flex-wrap: wrap; block-size: auto; min-block-size: 4.25rem; row-gap: 0">
  <a class="m-navbar-brand" href="#"><span style="${glyph('accent-default')}">${icon(I.done, 20, 'soft')}</span> Driftwood</a>
  <nav class="m-navbar-nav" aria-label="Main" style="margin-inline-start: auto">
    <a class="m-navbar-link" href="#">Tour</a>
    <a class="m-navbar-link" href="#">Help</a>
    <a class="m-navbar-link" href="#">Journal</a>
    <a class="m-navbar-link" href="#" aria-current="page">Get it</a>
  </nav>
</header>
<main class="m-container" style="max-inline-size: 66rem; padding-block: var(--m-space-16)">
  <div class="m-stack" data-gap="10">
    <div class="m-stack" data-gap="3" data-align="center" style="text-align: center">
      <h1 style="font-size: var(--m-font-size-4xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight)">One price, no subscription</h1>
      <p class="m-muted" style="font-size: var(--m-font-size-lg); max-inline-size: 30rem">Buy it once for each kind of device. Your lists stay in step across all of them, free.</p>
    </div>
    <div class="m-grid" style="--m-layout-grid-min: 13rem; --m-layout-grid-gap: var(--m-space-5)">
${product(I.laptop, 'Desktop', 'Needs a 2023 system or later', '$44.00', true)}
${product(I.phone, 'Phone', 'Includes the watch app', '$11.00', false)}
${product(I.tablet, 'Tablet', 'Works with a keyboard too', '$22.00', false)}
${product(I.watch, 'Watch', 'Comes with the phone app', 'Free', false)}
    </div>
    <p class="m-muted" style="text-align: center; font-size: var(--m-font-size-sm)">Prices in US dollars. <a href="#" style="color: var(--m-color-accent-text)">See your local price</a></p>
    <section class="m-stack" data-gap="3" aria-labelledby="ln-faq" style="max-inline-size: 40rem; margin-inline: auto; inline-size: 100%">
      <h2 id="ln-faq" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold)">Questions</h2>
      <div class="m-accordion">
        <details class="m-accordion-item" name="ln-faq" open><summary>Do I pay again for updates?</summary><div class="m-accordion-content">No. Updates to the version you bought are free, for as long as it runs on your system.</div></details>
        <details class="m-accordion-item" name="ln-faq"><summary>Is sync extra?</summary><div class="m-accordion-content">Sync is free and needs only an email address. Your lists are encrypted on the way.</div></details>
        <details class="m-accordion-item" name="ln-faq"><summary>Can I try the desktop app first?</summary><div class="m-accordion-content">Yes: every feature, for 15 days, with nothing to cancel at the end.</div></details>
      </div>
    </section>
  </div>
</main>
</div>`;

// Errors: under the field, a quiet note above the form, a toast for sync, and calm full pages
const errorPage = (code: string, ic: string, title: string, body: string, actions: string) =>
  `  <section class="m-stack" data-gap="3" data-align="center" style="text-align: center; padding-block: var(--m-space-16); ${hair}" aria-labelledby="ln-err-${code}">
    <span style="display: inline-flex; color: var(--m-color-fg-subtle); opacity: 0.6">${icon(ic, 56)}</span>
    <span style="${sub}; font-variant-numeric: tabular-nums">Error ${code}</span>
    <h1 id="ln-err-${code}" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold)">${title}</h1>
    <p class="m-muted" style="max-inline-size: 26rem">${body}</p>
    <div class="m-cluster" data-gap="2" data-justify="center">${actions}</div>
  </section>`;

const errors = `<main class="m-container" data-size="md" style="padding-block: var(--m-space-12)">
  <div class="m-stack" data-gap="10">
    <section class="m-card" aria-labelledby="ln-err-form" style="max-inline-size: 26rem; margin-inline: auto; inline-size: 100%">
      <form class="m-card-body m-stack" data-gap="4">
        <div class="m-stack" data-gap="2" data-align="center" style="text-align: center">
          <span style="${glyph('accent-default')}">${icon(I.cloud, 40, 'soft')}</span>
          <h1 id="ln-err-form" style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-bold)">Turn on sync</h1>
        </div>
        <div class="m-alert" data-tone="danger" role="alert">
          <span class="m-alert-icon">${icon(I.alert, 16)}</span>
          <div class="m-alert-content"><div class="m-alert-title">Sync isn’t on yet</div><div class="m-alert-body">Check the two fields below. Your lists on this device are unchanged.</div></div>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="ln-err-email">Email</label>
          <input class="m-input" id="ln-err-email" type="email" value="marisol.ortega@example" aria-invalid="true" aria-describedby="ln-err-email-e">
          <p class="m-field-error" id="ln-err-email-e">Add the end of the address, like example.com.</p>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="ln-err-pass">Password</label>
          <input class="m-input" id="ln-err-pass" type="password" value="kiln" aria-invalid="true" aria-describedby="ln-err-pass-e">
          <p class="m-field-error" id="ln-err-pass-e">Use at least 8 characters.</p>
        </div>
        <div class="m-cluster" data-justify="end" data-gap="2">
          <button type="button" class="m-button">Cancel</button>
          <button type="submit" class="m-button" data-variant="primary">Turn on</button>
        </div>
      </form>
    </section>
    <section class="m-stack" data-gap="3" data-align="center" aria-label="A toast">
      <div class="m-toast" data-tone="danger" role="alert"><span style="${glyph('danger-fg')}">${icon(I.cloudOff, 18)}</span><div class="m-toast-content"><div class="m-toast-title">Couldn’t sync</div><div class="m-toast-body">You’re offline. Changes are kept here and sync when you’re back.</div></div><button type="button" class="m-button" data-size="sm">Retry</button></div>
    </section>
${errorPage('404', I.searchX, 'This list isn’t here', 'It may have been deleted on another device, or the link is out of date.', `<a class="m-button" data-variant="primary" href="#">${icon(I.star, 14)} Go to Focus</a>`)}
${errorPage('500', I.alert, 'Something went wrong on our side', 'Nothing in your lists was changed. Try again in a moment.', `<button type="button" class="m-button" data-variant="primary">Try again</button><a class="m-button" data-variant="ghost" href="#">Status page</a>`)}
${errorPage('403', I.lock, 'This list is private', 'Only Marisol can open it. Ask her to share it with you.', `<button type="button" class="m-button" data-variant="primary">Ask to see it</button><a class="m-button" data-variant="ghost" href="#">Go back</a>`)}
  </div>
</main>`;

export const linenRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'A day list: the pale sidebar of lists, a bold title with its glyph, the day’s calendar in a grey box, to-dos with the project beneath, an Evening section and a quiet bottom toolbar.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'A project: its progress glyph and notes, tag filters as pills, blue headings over hairlines, and one to-do opened in place as a card, with the dark date picker.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One sheet in the middle of the page: a glyph, a bold question, choices as quiet rows, one field, Back as text and Continue in blue.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A settings window: icon tabs over right-aligned labels with their menus, then checkboxes; a sync pane with a switch, the account and plain buttons.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description: 'An empty list: the list’s glyph large and faint in the middle, one sentence, a quiet New to-do.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The public site: a plain header, a bold line, one grey card per device with a one-time price, and questions below.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors under the field, a quiet note above the form that says nothing changed, a toast for sync, and calm full pages for 404, 500 and no access.',
    html: errors,
  },
];
