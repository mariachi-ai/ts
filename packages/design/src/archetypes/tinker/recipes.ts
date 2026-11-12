import type { ArchetypeRecipe } from '../types';

/*
 * Tinker's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from "quanta", a small workshop that builds electronics
 * kits. They follow the language's real patterns: a tall header of line-drawn groups with small
 * sub-links, a row of grey lowercase category words with a count at the right, off-white tiles with
 * the name and figure under them and a plus at the right, full-bleed rows split by black hairlines,
 * tiny technical caps for labels and numbers, black device screens with dot-matrix readouts, knobs
 * and meters drawn from token shapes, square black actions, and overlays on a hard offset shadow.
 * All copy is lowercase, as the reference writes it.
 */

// Lucide icons, outlined, 1px stroke (the reference's line drawings are hairline-thin)
const icon = (paths: string, size = 16, stroke = 1) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display: inline-block; flex: none; vertical-align: -0.15em">${paths}</svg>`;
const I = {
  bench: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  runs: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M11 9h4a2 2 0 0 0 2-2V3"/><circle cx="9" cy="9" r="2"/><path d="M7 21v-4a2 2 0 0 1 2-2h4"/><circle cx="15" cy="15" r="2"/>',
  parts: '<path d="M12 20v2"/><path d="M12 2v2"/><path d="M17 20v2"/><path d="M17 2v2"/><path d="M2 12h2"/><path d="M2 17h2"/><path d="M2 7h2"/><path d="M20 12h2"/><path d="M20 17h2"/><path d="M20 7h2"/><path d="M7 20v2"/><path d="M7 2v2"/><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="8" y="8" width="8" height="8" rx="1"/>',
  orders: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  reports: '<path d="M5 21v-6"/><path d="M12 21V3"/><path d="M19 21V9"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  left: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  right: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  external: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  filter: '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
  gear: '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  alert: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  ok: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  warn: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  download: '<path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  temp: '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
  timer: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
  edit: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  trash: '<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  unplug: '<path d="m19 5 3-3"/><path d="m2 22 3-3"/><path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"/><path d="M7.5 13.5 10 11"/><path d="M10.5 16.5 13 14"/><path d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z"/>',
  searchX: '<path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  minus: '<path d="M5 12h14"/>',
  pkg: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>',
};

// Tiny technical caps: numbered labels, captions, table headers
const cap =
  'font-family: var(--m-font-family-display); font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-wide); text-transform: uppercase; line-height: 1.3';
const capMuted = `${cap}; color: var(--m-color-fg-muted)`;
// Large light type
const big = (size: string, weight = '200') =>
  `font-size: var(--m-font-size-${size}); font-weight: ${weight}; line-height: var(--m-font-leading-tight); letter-spacing: var(--m-font-tracking-tight)`;
const muted = 'color: var(--m-color-fg-muted)';
const subtle = 'color: var(--m-color-fg-subtle)';
const fig = 'font-variant-numeric: tabular-nums';
const rule = 'border-block-start: var(--m-border-width-thin) solid var(--m-table-border-color)';
const plain = 'color: inherit; text-decoration: none';

// The device colours, all tokens, the same in both modes
const knobColour = {
  orange: 'var(--m-color-brand-default)',
  blue: 'var(--m-color-info-solid)',
  yellow: 'var(--m-color-warning-solid)',
  green: 'var(--m-color-success-solid)',
  red: 'var(--m-color-danger-solid)',
  grey: 'var(--m-color-border-strong)',
};
type Knob = keyof typeof knobColour;

// A knob from token shapes: a ring of ticks, a coloured cap and a black pointer at `angle`
const knob = (colour: Knob, angle: number, size = '4.5rem', ground = 'var(--m-color-bg-surface)') =>
  `<span aria-hidden="true" style="position: relative; display: inline-block; flex: none; inline-size: ${size}; block-size: ${size}; border-radius: 50%; background: repeating-conic-gradient(from -1deg, var(--m-color-fg-muted) 0 2deg, transparent 2deg 30deg)"><span style="position: absolute; inset: 9%; border-radius: 50%; background: ${ground}"></span><span style="position: absolute; inset: 17%; border-radius: 50%; background: ${knobColour[colour]}"></span><span style="position: absolute; inset-inline-start: calc(50% - 1px); inset-block-start: 19%; inline-size: 2px; block-size: 31%; background: var(--m-color-brand-fg); transform-origin: 50% 100%; transform: rotate(${angle}deg)"></span></span>`;

// A readout lit on a black device screen: the display face, cut into dots by a fine grid
const readout = (text: string, size = '4xl', colour = 'var(--m-color-brand-default)') =>
  `<span style="position: relative; display: inline-block; font-family: var(--m-font-family-display); font-size: var(--m-font-size-${size}); font-weight: var(--m-font-weight-bold); line-height: 1; color: ${colour}; ${fig}">${text}<span aria-hidden="true" style="position: absolute; inset: 0; background: repeating-linear-gradient(90deg, var(--m-color-brand-fg) 0 1px, transparent 1px 4px), repeating-linear-gradient(0deg, var(--m-color-brand-fg) 0 1px, transparent 1px 4px)"></span></span>`;
// The screen itself: black in both modes, off-white technical caps
const screen = (inner: string, label: string, minH = '9rem') =>
  `<div role="img" aria-label="${label}" style="display: flex; flex-direction: column; justify-content: space-between; gap: var(--m-space-3); min-block-size: ${minH}; padding: var(--m-space-3) var(--m-space-4); border-radius: var(--m-radius-sm); background: var(--m-color-brand-fg); color: var(--m-color-info-on-solid); font-family: var(--m-font-family-display)">${inner}</div>`;
const screenCap = (text: string, colour = 'var(--m-color-info-on-solid)') =>
  `<span style="${cap}; color: ${colour}">${text}</span>`;

// A segmented LED meter, as on a mixer: lit to `pct` in a device colour
const ledMeter = (colour: Knob, pct: number, h = '6.5rem') =>
  `<span aria-hidden="true" style="display: block; inline-size: 0.75rem; block-size: ${h}; background: repeating-linear-gradient(to top, transparent 0 4px, var(--m-color-bg-surface) 4px 6px), linear-gradient(to top, ${knobColour[colour]} 0 ${pct}%, var(--m-color-border-default) ${pct}% 100%)"></span>`;

// A circled number, as in the reference's printed indexes
const circled = (n: string, filled = false) =>
  `<span aria-hidden="true" style="display: inline-grid; place-items: center; flex: none; inline-size: 1.625rem; block-size: 1.625rem; border-radius: 50%; border: var(--m-border-width-thin) solid currentColor; ${filled ? 'background: var(--m-color-fg-default); color: var(--m-color-bg-canvas);' : ''} ${cap}; font-size: var(--m-font-size-sm)">${n}</span>`;

// The workshop's mark: an orange square with a lightning glyph and the name in technical caps
const mark = `<a class="m-cluster" data-gap="2" href="#" style="${plain}; flex-wrap: nowrap"><span style="display: inline-grid; place-items: center; inline-size: 2rem; block-size: 2rem; background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">${icon(I.zap, 18, 1.5)}</span><span style="${cap}; font-size: var(--m-font-size-sm)">quanta</span></a>`;

// The header: line-drawn groups, each a word over small sub-links; the current group's drawing is orange
const groups: [keyof typeof I, string, string[]][] = [
  ['bench', 'bench', ['today', 'timers']],
  ['runs', 'runs', ['active', 'queued', 'archive']],
  ['parts', 'parts', ['stock', 'reorder', 'bins']],
  ['orders', 'orders', ['open', 'shipped']],
  ['reports', 'reports', ['yield', 'costs']],
];
const header = (current: string) => `<header style="padding: var(--m-space-4) var(--m-layout-container-padding) var(--m-space-3)">
  <div class="m-cluster" data-gap="6" data-align="start" style="flex-wrap: nowrap; overflow-x: auto">
    <div style="flex: none; padding-block-start: var(--m-space-1)">${mark}</div>
    <nav aria-label="Main" class="m-cluster" data-gap="8" data-align="start" style="flex-wrap: nowrap">
${groups
  .map(
    ([ic, word, subs]) => `      <div class="m-cluster" data-gap="2" data-align="start" style="flex-wrap: nowrap">
        <span style="color: ${word === current ? 'var(--m-color-brand-default)' : 'var(--m-color-fg-default)'}">${icon(I[ic], 40, 1)}</span>
        <div class="m-stack" data-gap="1">
          <a href="#" style="${plain}; ${big('xl')}"${word === current ? ' aria-current="page"' : ''}>${word}</a>
          <span class="m-stack" data-gap="0" style="font-size: var(--m-font-size-sm); line-height: 1.25">${subs.map((s) => `<a href="#" style="${plain}">${s}</a>`).join('')}</span>
        </div>
      </div>`,
  )
  .join('\n')}
    </nav>
    <div class="m-cluster" data-gap="1" style="margin-inline-start: auto; flex: none; flex-wrap: nowrap">
      <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Search">${icon(I.search, 20)}</button>
      <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Notifications">${icon(I.bell, 20)}</button>
      <a class="m-button" data-variant="ghost" data-icon-only href="#" aria-label="Settings">${icon(I.gear, 20)}</a>
      <span class="m-avatar" data-size="sm" aria-label="Ines Ruiz">ir</span>
    </div>
  </div>
</header>`;

// A slim header for flows: the mark, a caption and a way out
const slimHeader = (right: string) => `<header class="m-cluster" data-justify="between" style="padding: var(--m-space-4) var(--m-layout-container-padding)">
  ${mark}
  ${right}
</header>`;

// The category row: grey lowercase words over a hairline, the current one black, a count at the right
const categories = (label: string, items: string[], current: string, count: string) => `<div class="m-cluster" data-justify="between" data-align="end">
          <div class="m-tabs" style="margin-inline-start: -0.5rem"><div class="m-tab-list" role="tablist" aria-label="${label}">
${items.map((t) => `            <button type="button" class="m-tab" role="tab" aria-selected="${t === current}"${t === current ? '' : ' tabindex="-1"'}>${t}</button>`).join('\n')}
          </div></div>
          <span style="font-size: var(--m-font-size-lg); ${fig}">${count}</span>
        </div>`;

const page = (head: string, main: string) => `<div style="min-block-size: 100vh">
${head}
<main class="m-container" style="padding-block: var(--m-space-6) var(--m-space-16)">
${main}
</main>
</div>`;

/* ---------------------------------------------------------------- dashboard */

const runRow = (n: string, kit: string, run: string, done: number, total: number, stage: string, tone: string, due: string) =>
  `<tr>
                <td style="${capMuted}">${n}</td>
                <td>${kit}</td>
                <td style="font-family: var(--m-font-family-mono); font-size: var(--m-font-size-sm)">${run}</td>
                <td style="min-inline-size: 9rem"><span class="m-stack" data-gap="1"><span style="${fig}">${done} / ${total}</span><progress class="m-progress" data-size="sm" value="${done}" max="${total}">${Math.round((done / total) * 100)}%</progress></span></td>
                <td><span class="m-badge" data-tone="${tone}">${stage}</span></td>
                <td style="text-align: end; ${fig}">${due}</td>
              </tr>`;

const smallKnob = (colour: Knob, angle: number, name: string, value: string) =>
  `<div class="m-stack" data-gap="2" data-align="center">${knob(colour, angle, '3rem')}<span style="${capMuted}">${name}</span><span style="${fig}">${value}</span></div>`;

const bin = (colour: Knob, pct: number, name: string) =>
  `<div class="m-stack" data-gap="2" data-align="center">${ledMeter(colour, pct)}<span style="${capMuted}">${name}</span><span style="font-size: var(--m-font-size-sm); ${fig}">${pct}%</span></div>`;

const dashboard = page(
  header('bench'),
  `      <div class="m-stack" data-gap="8">
        <div class="m-cluster" data-justify="between" data-align="end">
          <h1 style="${big('4xl')}">bench</h1>
          <span style="${capMuted}">week 46 · 3 runs on the line</span>
        </div>
        ${categories('Period', ['today', 'this week', 'this month'], 'today', 'thu 13 nov')}
        <div class="m-grid" style="--m-layout-grid-min: 17rem">
          <section class="m-card" aria-labelledby="tk-run">
            <div class="m-card-body m-stack" data-gap="4">
              <div class="m-cluster" data-justify="between"><h2 id="tk-run" style="${capMuted}">01 · current run</h2><span class="m-badge" data-variant="solid">live</span></div>
              ${screen(
                `<div class="m-cluster" data-justify="between">${screenCap('run 0412')}${screenCap('fm radio kit', 'var(--m-color-warning-solid)')}</div>
                <div class="m-cluster" data-gap="2" data-align="end">${readout('142')}${readout('/200', 'xl', 'var(--m-color-info-on-solid)')}</div>
                <div class="m-cluster" data-justify="between">${screenCap('boards')}${screenCap('71%')}</div>`,
                'Run 0412, fm radio kit: 142 of 200 boards done',
              )}
              <div class="m-cluster" data-justify="between" style="font-size: var(--m-font-size-sm)"><span style="${muted}">finishes around</span><span style="${fig}">16:40</span></div>
            </div>
          </section>
          <section class="m-card" aria-labelledby="tk-iron">
            <div class="m-card-body m-stack" data-gap="4">
              <h2 id="tk-iron" style="${capMuted}">02 · station b</h2>
              <div class="m-cluster" data-gap="5" style="flex-wrap: nowrap">
                ${knob('orange', 110, '6rem')}
                <div class="m-stack" data-gap="1">
                  <span style="${capMuted}">iron</span>
                  <span style="${big('3xl')}; ${fig}">340°</span>
                  <span style="font-size: var(--m-font-size-sm); ${muted}">set 340 · tip ok</span>
                </div>
              </div>
              <div class="m-cluster" data-justify="between" style="${rule}; padding-block-start: var(--m-space-3)">
                ${smallKnob('blue', -60, 'fan', '40%')}
                ${smallKnob('yellow', 20, 'light', '80%')}
                ${smallKnob('green', -120, 'fume', 'low')}
              </div>
            </div>
          </section>
          <section class="m-card" aria-labelledby="tk-bins">
            <div class="m-card-body m-stack" data-gap="4">
              <div class="m-cluster" data-justify="between"><h2 id="tk-bins" style="${capMuted}">03 · bins</h2><a href="#" style="font-size: var(--m-font-size-sm)">reorder</a></div>
              <div class="m-cluster" data-justify="between" data-align="end" style="flex-wrap: nowrap">
                ${bin('green', 82, 'a')}
                ${bin('green', 64, 'b')}
                ${bin('yellow', 31, 'c')}
                ${bin('orange', 12, 'd')}
                ${bin('green', 90, 'e')}
                ${bin('blue', 55, 'f')}
              </div>
            </div>
          </section>
        </div>
        <section class="m-stack" data-gap="3" aria-labelledby="tk-line">
          <div class="m-cluster" data-justify="between" data-align="end">
            <h2 id="tk-line" style="${big('xl')}">on the line</h2>
            <button type="button" class="m-button" data-size="sm">${icon(I.plus)} new run</button>
          </div>
          <div class="m-table-wrap">
            <table class="m-table">
              <thead><tr><th scope="col">no.</th><th scope="col">kit</th><th scope="col">run</th><th scope="col">boards</th><th scope="col">stage</th><th scope="col" style="text-align: end">due</th></tr></thead>
              <tbody>
              ${runRow('01', 'fm radio kit', 'r-0412', 142, 200, 'assembly', 'neutral', '13 nov')}
              ${runRow('02', 'drum trigger, 4 pads', 'r-0415', 36, 120, 'reflow', 'info', '17 nov')}
              ${runRow('03', 'tiny amp 2×3 w', 'r-0409', 88, 88, 'testing', 'success', '13 nov')}
              ${runRow('04', 'clock divider', 'r-0418', 0, 60, 'waiting parts', 'warning', '24 nov')}
              </tbody>
            </table>
          </div>
        </section>
        <div class="m-grid" style="--m-layout-grid-min: 22rem">
          <section class="m-card" aria-labelledby="tk-low">
            <div class="m-card-body m-stack" data-gap="3">
              <h2 id="tk-low" style="${capMuted}">04 · running low</h2>
              <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
                ${[
                  ['enc-24', 'rotary encoder, 24 det.', '38 pcs'],
                  ['c-100n', 'capacitor 100 nf 0603', '410 pcs'],
                  ['j-35', 'jack 3.5 mm, stereo', '22 pcs'],
                ]
                  .map(
                    ([code, name, left]) =>
                      `<li class="m-cluster" data-justify="between" style="${rule}; padding-block: var(--m-space-2)"><span class="m-cluster" data-gap="3"><span style="${capMuted}; min-inline-size: 4rem">${code}</span>${name}</span><span style="${fig}; ${muted}">${left}</span></li>`,
                  )
                  .join('\n                ')}
              </ul>
            </div>
          </section>
          <section class="m-card" aria-labelledby="tk-ship">
            <div class="m-card-body m-stack" data-gap="3">
              <h2 id="tk-ship" style="${capMuted}">05 · next shipment</h2>
              <div class="m-cluster" data-justify="between" data-align="end">
                <span style="${big('2xl')}">fri 14 nov</span>
                <span style="${muted}">3 boxes · 46 kits</span>
              </div>
              <div class="m-cluster" data-gap="2"><span class="m-badge">courier booked</span><span class="m-badge">labels printed</span><span class="m-badge" data-tone="warning">1 kit short</span></div>
            </div>
          </section>
        </div>
      </div>`,
);

/* ------------------------------------------------------------ list and detail */

const partRow = (code: string, name: string, pkg: string, qty: string, state: 'ok' | 'low' | 'order', current = false) => {
  const s = {
    ok: '<span class="m-badge" data-tone="success">in stock</span>',
    low: '<span class="m-badge" data-tone="warning">low</span>',
    order: '<span class="m-badge">on order</span>',
  }[state];
  const sel = current ? ' aria-selected="true" style="background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)"' : '';
  return `<tr${sel}>
                <td style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-lg); white-space: nowrap">${code}</td>
                <td>${name}</td>
                <td style="${current ? '' : muted}">${pkg}</td>
                <td style="text-align: end; ${fig}">${qty}</td>
                <td style="text-align: end">${s}</td>
              </tr>`;
};

const spec = (label: string, value: string) =>
  `<div class="m-cluster" data-justify="between" style="${rule}; padding-block: var(--m-space-2)"><dt style="${capMuted}">${label}</dt><dd style="margin: 0; ${fig}">${value}</dd></div>`;

const listDetail = page(
  header('parts'),
  `      <div class="m-stack" data-gap="6">
        ${categories('Category', ['all parts', 'passives', 'chips', 'mechanical', 'connectors'], 'mechanical', '212 parts')}
        <div class="m-grid" style="--m-layout-grid-min: 26rem; --m-layout-grid-gap: var(--m-space-10); align-items: start">
          <div class="m-stack" data-gap="3">
            <div class="m-cluster" data-gap="2">
              <input class="m-input" type="search" placeholder="find a part" aria-label="Find a part" style="flex: 1 1 12rem">
              <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Filter">${icon(I.filter, 20)}</button>
            </div>
            <div class="m-table-wrap">
              <table class="m-table">
                <thead><tr><th scope="col">code</th><th scope="col">part</th><th scope="col">package</th><th scope="col" style="text-align: end">qty</th><th scope="col" style="text-align: end">state</th></tr></thead>
                <tbody>
              ${partRow('ENC-24', 'rotary encoder, 24 detents', 'tht', '38', 'low', true)}
              ${partRow('POT-10K', 'potentiometer 10 kΩ, linear', 'tht', '240', 'ok')}
              ${partRow('SW-TAC', 'tactile switch 6×6', 'smd', '1,180', 'ok')}
              ${partRow('FDR-45', 'slide fader 45 mm', 'tht', '0', 'order')}
              ${partRow('KNB-14', 'knob cap 14 mm', '—', '600', 'ok')}
              ${partRow('SPK-28', 'speaker 28 mm, 8 Ω', 'leads', '64', 'ok')}
              ${partRow('BAT-AAA', 'battery holder, 2×aaa', 'tht', '19', 'low')}
              ${partRow('SCR-M2', 'screw m2 × 4, black', '—', '3,200', 'ok')}
                </tbody>
              </table>
            </div>
            <div class="m-cluster" data-justify="between" style="font-size: var(--m-font-size-sm); ${muted}"><span>8 of 46 in mechanical</span><a href="#">show all</a></div>
          </div>
          <article class="m-stack" data-gap="5" aria-labelledby="tk-part">
            <div class="m-card"><div class="m-card-body" style="display: grid; place-items: center; min-block-size: 15rem; gap: var(--m-space-4)">
              ${knob('grey', 45, '7.5rem')}
              <span style="${capMuted}">enc-24 · shaft 6 mm d</span>
            </div></div>
            <div class="m-stack" data-gap="1">
              <h1 id="tk-part" style="${big('2xl')}">rotary encoder, 24 detents</h1>
              <span style="${big('2xl')}; ${fig}">0.84 € / pc</span>
              <span style="font-size: var(--m-font-size-lg)">38 left · bin c-07</span>
            </div>
            <button type="button" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">reorder 500 pcs</button>
            <div class="m-cluster" data-gap="2">
              <button type="button" class="m-button" data-size="sm">${icon(I.edit)} edit</button>
              <button type="button" class="m-button" data-size="sm">move bin</button>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="More">${icon(I.more, 20)}</button>
            </div>
            <p style="font-size: var(--m-font-size-lg); ${muted}">used on the front panel of the fm radio and the clock divider. it clicks 24 times a turn and pushes in, so one control can tune and select.</p>
            <dl class="m-stack" data-gap="0" style="margin: 0">
              ${spec('detents', '24 / turn')}
              ${spec('push switch', 'yes, 0.5 mm')}
              ${spec('rated life', '30,000 turns')}
              ${spec('used in', '2 kits · 1 per board')}
              ${spec('supplier', 'nordvik components')}
              ${spec('last order', '2 oct · 1,000 pcs')}
            </dl>
          </article>
        </div>
      </div>`,
);

/* ----------------------------------------------------------------- onboarding */

const step = (n: string, label: string, state: 'done' | 'now' | 'next') =>
  `<li class="m-cluster" data-gap="2" style="flex-wrap: nowrap; ${state === 'next' ? subtle : ''}">${state === 'done' ? `<span style="display: inline-grid; place-items: center; inline-size: 1.625rem; block-size: 1.625rem; border-radius: 50%; border: var(--m-border-width-thin) solid currentColor">${icon(I.check, 14, 1.5)}</span>` : circled(n, state === 'now')}<span>${label}</span></li>`;

const onboarding = page(
  slimHeader(`<a href="#" style="font-size: var(--m-font-size-sm)">skip for now</a>`),
  `      <div class="m-container" data-size="sm" style="padding-inline: 0">
        <div class="m-stack" data-gap="8">
          <ol class="m-cluster" data-gap="6" style="padding: 0; list-style: none; justify-content: center" aria-label="Steps">
            ${step('1', 'workshop', 'done')}
            ${step('2', 'bench', 'now')}
            ${step('3', 'crew', 'next')}
          </ol>
          <div class="m-stack" data-gap="3" style="text-align: center">
            <h1 style="${big('3xl')}">set up your bench</h1>
            <p style="font-size: var(--m-font-size-xl); font-weight: 200; line-height: 1.25; ${muted}">tell us how your stations run. you can change all of it later in settings.</p>
          </div>
          <form class="m-stack" data-gap="5" onsubmit="return false">
            <div class="m-field">
              <label class="m-field-label" for="tk-bench">bench name</label>
              <input class="m-input" id="tk-bench" type="text" value="back room" data-size="lg">
            </div>
            <div class="m-grid" style="--m-layout-grid-min: 12rem; --m-layout-grid-gap: var(--m-space-4)">
              <div class="m-field">
                <label class="m-field-label" for="tk-stations">soldering stations</label>
                <select class="m-select" id="tk-stations" data-size="lg"><option>1</option><option selected>2</option><option>3</option><option>4 or more</option></select>
              </div>
              <div class="m-field">
                <span class="m-field-label" id="tk-units-l">units</span>
                <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-labelledby="tk-units-l">
                  <button type="button" class="m-tab" role="tab" aria-selected="true" style="flex: 1">°c · mm</button>
                  <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1" style="flex: 1">°f · in</button>
                </div></div>
              </div>
            </div>
            <fieldset class="m-stack" data-gap="2" style="border: 0; padding: 0; margin: 0">
              <legend class="m-field-label" style="margin-block-end: var(--m-space-2)">how do boards come in?</legend>
              <label class="m-field" data-layout="inline"><input class="m-radio" type="radio" name="tk-boards" checked> we place parts by hand</label>
              <label class="m-field" data-layout="inline"><input class="m-radio" type="radio" name="tk-boards"> they arrive assembled, we finish them</label>
              <label class="m-field" data-layout="inline"><input class="m-radio" type="radio" name="tk-boards"> a bit of both</label>
            </fieldset>
            <label class="m-field" data-layout="inline"><input class="m-checkbox" type="checkbox" checked> start a timer when a run begins</label>
            <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">continue</button>
            <a href="#" class="m-cluster" data-gap="2" style="justify-content: center">${icon(I.left)} back to workshop</a>
          </form>
          <p style="${capMuted}; text-align: center">step 2 of 3 · about a minute left</p>
        </div>
      </div>`,
);

/* ------------------------------------------------------------------- settings */

// The settings index, as a printed manual's: black chapter rows with circled numbers, grey sub-rows
const chapter = (n: string, label: string) =>
  `<li><a href="#" class="m-cluster" data-gap="4" style="${plain}; flex-wrap: nowrap; padding: var(--m-space-2) var(--m-space-3); background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse); ${rule}">${circled(n)}<span style="${cap}; font-size: var(--m-font-size-md)">${label}</span></a></li>`;
const sub = (n: string, label: string, current = false) =>
  `<li><a href="#" class="m-cluster" data-gap="4" style="${plain}; flex-wrap: nowrap; padding: var(--m-space-2) var(--m-space-3) var(--m-space-2) var(--m-space-5); ${rule}; background: ${current ? 'var(--m-color-brand-default)' : 'var(--m-color-bg-sunken)'}; color: ${current ? 'var(--m-color-brand-fg)' : 'var(--m-color-fg-default)'}"${current ? ' aria-current="page"' : ''}><span style="${cap}; font-size: var(--m-font-size-md); min-inline-size: 2rem">${n}</span><span style="${cap}; font-size: var(--m-font-size-md)">${label}</span></a></li>`;

const setRow = (label: string, hint: string, control: string) =>
  `<div class="m-cluster" data-justify="between" style="${rule}; padding-block: var(--m-space-3)">
                <div class="m-stack" data-gap="0" style="flex: 1 1 14rem"><span>${label}</span><span style="font-size: var(--m-font-size-sm); ${muted}">${hint}</span></div>
                ${control}
              </div>`;
const sw = (label: string, on: boolean) =>
  `<input class="m-switch" type="checkbox" role="switch" aria-label="${label}"${on ? ' checked' : ''}>`;
const section = (n: string, title: string, body: string) => `<section class="m-stack" data-gap="2" aria-labelledby="tk-s${n.replace('.', '-')}">
              <div class="m-cluster" data-gap="3" data-align="baseline"><span style="${capMuted}">${n}</span><h2 id="tk-s${n.replace('.', '-')}" style="${big('xl')}">${title}</h2></div>
              <div class="m-stack" data-gap="0">
              ${body}
              </div>
            </section>`;

const settings = page(
  header(''),
  `      <div class="m-stack" data-gap="8">
        <div class="m-cluster" data-justify="between" data-align="end">
          <h1 style="${big('4xl')}">settings</h1>
          <span style="${capMuted}; text-align: end">changes save<br>as you make them</span>
        </div>
        <div class="m-split" style="--m-layout-split-side: 17rem; --m-layout-split-gap: var(--m-space-10); align-items: start">
          <nav aria-label="Settings">
            <ol class="m-stack" data-gap="0" style="padding: 0; list-style: none; border-block-end: var(--m-border-width-thin) solid var(--m-table-border-color)">
              ${chapter('1', 'workshop')}
              ${sub('1.1', 'name and address')}
              ${sub('1.2', 'units and money', true)}
              ${chapter('2', 'stations')}
              ${sub('2.1', 'irons and tips')}
              ${chapter('3', 'alerts')}
              ${chapter('4', 'crew and roles')}
              ${chapter('5', 'plan and invoices')}
              ${chapter('6', 'close workshop')}
            </ol>
          </nav>
          <div class="m-stack" data-gap="10">
            ${section(
              '1.2',
              'units and money',
              `${setRow('temperature', 'shown on stations and in run logs', `<div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Temperature"><button type="button" class="m-tab" role="tab" aria-selected="true">°c</button><button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">°f</button></div></div>`)}
              ${setRow('lengths', 'for cable cuts and enclosures', `<select class="m-select" data-size="sm" aria-label="Lengths" style="inline-size: 10rem"><option selected>millimetres</option><option>inches</option></select>`)}
              ${setRow('currency', 'part prices and costs per kit', `<select class="m-select" data-size="sm" aria-label="Currency" style="inline-size: 10rem"><option selected>euro · €</option><option>krona · kr</option><option>pound · £</option></select>`)}
              ${setRow('round costs', 'to the nearest cent in reports', sw('Round costs', true))}`,
            )}
            ${section(
              '3',
              'alerts',
              `${setRow('a bin runs low', 'when a part drops under its reorder point', sw('A bin runs low', true))}
              ${setRow('a run finishes', 'a light on the bench and a message', sw('A run finishes', true))}
              ${setRow('a test fails', 'every failed board, not just the first', sw('A test fails', false))}
              ${setRow('weekly yield', 'mondays at 08:00', sw('Weekly yield', false))}`,
            )}
            ${section(
              '6',
              'close workshop',
              `<div class="m-cluster" data-justify="between" style="${rule}; padding-block: var(--m-space-4)">
                <p style="flex: 1 1 18rem; ${muted}">closing removes runs, parts and crew for good. export your logs first; we keep nothing after 30 days.</p>
                <button type="button" class="m-button" data-variant="danger">close workshop</button>
              </div>`,
            )}
          </div>
        </div>
      </div>`,
);

/* ---------------------------------------------------------------- empty state */

const kitTile = (name: string, parts: string, drawing: string) => `<a href="#" class="m-stack" data-gap="2" style="${plain}">
            <div class="m-card"><div class="m-card-body" style="display: grid; place-items: center; aspect-ratio: 4 / 3">${drawing}</div></div>
            <div class="m-cluster" data-justify="between" data-align="start" style="flex-wrap: nowrap">
              <span class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-lg)">${name}</span><span style="font-size: var(--m-font-size-lg); ${fig}">${parts}</span></span>
              ${icon(I.plus, 22)}
            </div>
          </a>`;

const emptyState = page(
  header('runs'),
  `      <div class="m-stack" data-gap="12">
        ${categories('Runs', ['active', 'queued', 'archive'], 'active', '0 runs')}
        <div class="m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-8)">
          <div style="inline-size: 12rem">
          ${screen(`${screenCap('run ----')}<div>${readout('00:00', '3xl', 'var(--m-color-fg-subtle)')}</div>`, 'No run on the line', '6.5rem')}
          </div>
          <h1 style="${big('3xl')}">nothing on the line.</h1>
          <p style="font-size: var(--m-font-size-lg); ${muted}">start a run from one of your kits and its boards show up here.</p>
          <div class="m-cluster" data-gap="5" style="justify-content: center">
            <button type="button" class="m-button" data-variant="primary">${icon(I.plus)} start a run</button>
            <a href="#">import a bill of materials</a>
          </div>
        </div>
        <section class="m-stack" data-gap="5" aria-labelledby="tk-kits">
          <h2 id="tk-kits" style="${big('3xl')}; text-align: center">start from a kit</h2>
          <div class="m-grid" style="--m-layout-grid-min: 14rem">
          ${kitTile('fm radio kit', '38 parts', knob('orange', 30, '5rem'))}
          ${kitTile('drum trigger', '52 parts', `<div class="m-cluster" data-gap="2">${knob('blue', -40, '3rem')}${knob('blue', 60, '3rem')}</div>`)}
          ${kitTile('tiny amp', '24 parts', knob('yellow', -100, '5rem'))}
          ${kitTile('clock divider', '61 parts', `<div class="m-cluster" data-gap="2" data-align="end">${ledMeter('green', 70, '4.5rem')}${ledMeter('green', 40, '4.5rem')}${ledMeter('orange', 90, '4.5rem')}</div>`)}
          </div>
        </section>
      </div>`,
);

/* -------------------------------------------------------------------- pricing */

const tick = `<span style="color: var(--m-color-fg-default)">${icon(I.check, 18, 1.5)}</span>`;
const none = `<span style="${subtle}">${icon(I.minus, 18)}</span>`;

const plan = (name: string, price: string, per: string, knobs: Knob[], points: string[], primary: boolean) => `<section class="m-stack" data-gap="4" aria-label="${name}">
            <div class="m-card"><div class="m-card-body" style="display: grid; place-items: center; aspect-ratio: 4 / 3">
              <div class="m-cluster" data-gap="3" style="justify-content: center; max-inline-size: 13rem">${knobs.map((k, i) => knob(k, i * 47 - 90, knobs.length > 3 ? '3rem' : '4rem')).join('')}</div>
            </div></div>
            <div class="m-cluster" data-justify="between" data-align="start" style="flex-wrap: nowrap">
              <span class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-lg)">${name}</span><span style="${big('2xl')}; ${fig}">${price} <span style="font-size: var(--m-font-size-md); ${muted}">${per}</span></span></span>
              ${icon(I.plus, 22)}
            </div>
            <ul style="margin: 0; padding-inline-start: 1.25em; font-size: var(--m-font-size-lg); ${muted}">${points.map((p) => `<li>${p}</li>`).join('')}</ul>
            <button type="button" class="m-button"${primary ? ' data-variant="primary"' : ''} data-size="lg" style="inline-size: 100%; margin-block-start: auto">choose ${name}</button>
          </section>`;

const cmp = (label: string, a: string, b: string, c: string) =>
  `<tr><th scope="row" style="font-weight: var(--m-font-weight-regular)">${label}</th><td style="text-align: center">${a}</td><td style="text-align: center">${b}</td><td style="text-align: center">${c}</td></tr>`;

const faq = (q: string, a: string, open = false) =>
  `<details class="m-accordion-item" name="tk-faq"${open ? ' open' : ''}><summary>${q}</summary><div class="m-accordion-content">${a}</div></details>`;

const pricing = page(
  header(''),
  `      <div class="m-stack" data-gap="10">
        <div class="m-cluster" data-justify="between" data-align="end">
          <div class="m-stack" data-gap="2">
            <h1 style="${big('4xl')}">plans</h1>
            <p style="font-size: var(--m-font-size-xl); font-weight: 200; ${muted}">one bench free for good. more stations when you need them.</p>
          </div>
          <div class="m-stack" data-gap="2" data-align="end">
            <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Billing">
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">monthly</button>
              <button type="button" class="m-tab" role="tab" aria-selected="true">yearly · 2 months free</button>
            </div></div>
            <span style="${capMuted}">prices excl. vat</span>
          </div>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 17rem; align-items: stretch">
          ${plan('solo', '0 €', 'for good', ['grey'], ['1 bench, 1 station', '3 active runs', 'parts list to 150 lines'], false)}
          ${plan('studio', '18 €', '/ month', ['orange', 'blue', 'yellow'], ['3 benches, 8 stations', 'unlimited runs', 'reorder points and bins', 'yield reports'], true)}
          ${plan('plant', '56 €', '/ month', ['orange', 'blue', 'yellow', 'green', 'red', 'grey'], ['unlimited benches', 'crew roles and sign-off', 'test rig logs', 'priority help'], false)}
        </div>
        <section class="m-stack" data-gap="3" aria-labelledby="tk-cmp">
          <h2 id="tk-cmp" style="${big('xl')}">compare</h2>
          <div class="m-table-wrap">
            <table class="m-table">
              <thead><tr><th scope="col">spec</th><th scope="col" style="text-align: center">solo</th><th scope="col" style="text-align: center">studio</th><th scope="col" style="text-align: center">plant</th></tr></thead>
              <tbody>
              ${cmp('benches', '1', '3', 'no limit')}
              ${cmp('stations per bench', '1', '8', '16')}
              ${cmp('run history', '30 days', '2 years', 'no limit')}
              ${cmp('bins and reorder points', none, tick, tick)}
              ${cmp('test rig logs', none, none, tick)}
              ${cmp('crew sign-off', none, none, tick)}
              </tbody>
            </table>
          </div>
        </section>
        <section class="m-stack" data-gap="3" aria-labelledby="tk-faq">
          <h2 id="tk-faq" style="${big('xl')}">questions</h2>
          <div class="m-accordion" style="border-inline: 0">
            ${faq('can i move between plans?', 'yes, at any time. moving up starts at once; moving down waits for the end of the period you paid for.', true)}
            ${faq('what counts as a station?', 'anything that logs to a run: an iron, a reflow plate or a test rig. hand tools don’t count.')}
            ${faq('do you keep my logs if i stop paying?', 'your runs stay readable on solo. benches over the limit are frozen, not deleted.')}
          </div>
        </section>
      </div>`,
);

/* --------------------------------------------------------------------- errors */

const fullPage = (code: string, title: string, body: string, links: string) => `<section class="m-card" aria-label="${code}"><div class="m-card-body m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-10)">
            <div style="inline-size: 11rem">${screen(`${screenCap(`error ${code}`, 'var(--m-color-warning-solid)')}<div>${readout(code, '3xl')}</div>`, `Error ${code}`, '6rem')}</div>
            <h3 style="${big('2xl')}">${title}</h3>
            <p style="${muted}; max-inline-size: 22rem">${body}</p>
            <div class="m-cluster" data-gap="4" style="justify-content: center">${links}</div>
          </div></section>`;

const errors = page(
  header(''),
  `      <div class="m-stack" data-gap="10">
        <h1 style="${big('4xl')}">when things go wrong</h1>
        <div class="m-grid" style="--m-layout-grid-min: 24rem; --m-layout-grid-gap: var(--m-space-10); align-items: start">
          <section class="m-stack" data-gap="4" aria-labelledby="tk-e1">
            <h2 id="tk-e1" style="${capMuted}">01 · in a form</h2>
            <div class="m-alert" data-tone="danger" role="alert">
              <span class="m-alert-icon">${icon(I.alert, 18, 1.5)}</span>
              <div class="m-alert-content">
                <p class="m-alert-title">2 things need fixing. the run wasn’t started.</p>
                <p class="m-alert-body">check the fields marked below, then start it again.</p>
              </div>
            </div>
            <form class="m-stack" data-gap="4" onsubmit="return false">
              <div class="m-field">
                <label class="m-field-label" for="tk-qty">boards in this run</label>
                <input class="m-input" id="tk-qty" type="text" value="0" aria-invalid="true" aria-describedby="tk-qty-e">
                <p class="m-field-error" id="tk-qty-e">${icon(I.alert, 14, 1.5)} enter at least 1 board.</p>
              </div>
              <div class="m-field">
                <label class="m-field-label" for="tk-kit">kit</label>
                <select class="m-select" id="tk-kit" aria-invalid="true" aria-describedby="tk-kit-e"><option>choose a kit</option><option>fm radio kit</option></select>
                <p class="m-field-error" id="tk-kit-e">${icon(I.alert, 14, 1.5)} choose which kit to build.</p>
              </div>
              <div class="m-field">
                <label class="m-field-label" for="tk-note">note for the crew</label>
                <input class="m-input" id="tk-note" type="text" value="use the new tips">
                <p class="m-field-hint">optional. shown on every station.</p>
              </div>
              <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">start run</button>
            </form>
          </section>
          <section class="m-stack" data-gap="4" aria-labelledby="tk-e2">
            <h2 id="tk-e2" style="${capMuted}">02 · somewhere else</h2>
            <div class="m-toast-region" data-static aria-live="polite" style="position: static; inline-size: auto; padding: 0">
              <div class="m-toast" data-tone="danger" role="alert">
                <div class="m-toast-content">
                  <p class="m-toast-title">station b stopped logging</p>
                  <p class="m-toast-body">the last 12 boards weren’t saved to run r-0412.</p>
                  <div class="m-toast-actions"><button type="button" class="m-button" data-size="sm">${icon(I.refresh)} retry</button></div>
                </div>
                <button type="button" class="m-toast-close" aria-label="Dismiss">${icon(I.x)}</button>
              </div>
              <div class="m-toast" role="status">
                <div class="m-toast-content">
                  <p class="m-toast-title">reorder sent</p>
                  <p class="m-toast-body">500 × enc-24 from nordvik components.</p>
                </div>
                <button type="button" class="m-toast-close" aria-label="Dismiss">${icon(I.x)}</button>
              </div>
            </div>
            <div class="m-alert" data-tone="neutral" role="status">
              <span class="m-alert-icon">${icon(I.info, 18, 1.5)}</span>
              <div class="m-alert-content"><p class="m-alert-body">the test rig needs a usb connection to log. <a href="#">how to connect it</a></p></div>
            </div>
          </section>
        </div>
        <section class="m-stack" data-gap="4" aria-labelledby="tk-e3">
          <h2 id="tk-e3" style="${capMuted}">03 · a whole page</h2>
          <div class="m-grid" style="--m-layout-grid-min: 17rem">
          ${fullPage('404', 'we can’t find that page.', 'the link may be old, or the page has moved.', '<a href="#">back to the bench</a>')}
          ${fullPage('500', 'something broke on our side.', 'nothing was changed. try again in a moment.', `<button type="button" class="m-button" data-variant="primary">${icon(I.refresh)} try again</button><a href="#">status</a>`)}
          ${fullPage('403', 'this bench isn’t yours.', 'ask the workshop owner to add you to the crew.', `<button type="button" class="m-button">${icon(I.lock)} ask for access</button>`)}
          </div>
        </section>
      </div>`,
);

export const tinkerRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Bench',
    description:
      'The tall header of line-drawn groups, a thin title, the category row, then three off-white tiles (a device screen with a dot-matrix readout, a knob station, LED bin meters), a numbered run table split by black hairlines and two smaller tiles.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'Parts',
    description:
      'The category row over a parts table with technical codes, the chosen row inverted to black, beside a product-page detail: a tile with a drawn knob, the name and price in thin type, a full-width black action and a spec sheet of hairline rows.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Set up a bench',
    description:
      'A slim header, circled step numbers, a thin centred title over a light subline, square fields with small lowercase labels, and one full-width black block to continue.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A printed-manual index (black chapter rows with circled numbers, grey numbered sub-rows, the current one orange) beside numbered sections of hairline rows with switches that light orange.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'No runs',
    description:
      'A small blank device screen, a thin "nothing on the line." with one black action and a link, then kits as off-white tiles with the name and figure under them and a plus at the right.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Plans',
    description:
      'Plans as store tiles (a row of knobs for how much you get, the name and price under the tile, a plus), bullet specs, full-width square buttons, a spec-sheet comparison and a hairline FAQ.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors in red with a small icon, a tinted form alert that says nothing was started, square toasts on a hard offset shadow, a grey notice, and full-page 404, 500 and 403 on a black device screen.',
    html: errors,
  },
];
