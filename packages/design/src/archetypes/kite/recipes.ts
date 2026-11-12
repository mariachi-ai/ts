import { DesignError } from '../../errors';
import { lucidePaths } from '../lucide';
import type { ArchetypeRecipe } from '../types';

/*
 * Kite's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from a made-up site builder ("Glider") and the site being
 * built in it ("Nightjar Records", a small record label). They follow the language's real screen
 * patterns, translated from a canvas editor to app pages: a 50px toolbar on the panel colour with a
 * filled menu button, a centred site name and a blue Publish; a 260px panel of 30px rows; cards one
 * grey step up with 15px corners; a canvas well with breakpoint frames under blue labels; property
 * rows with 30px filled inputs, unit suffixes, steppers, segmented controls and colour swatches;
 * dialogs with 18px corners; and the public site's huge tight display type on black. Icons are
 * Lucide at 1.5px.
 */

// Lucide icons, outlined, 1.5px stroke
const icon = (paths: string, size = 16, label?: string) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${size > 24 ? 1.25 : 1.5}" stroke-linecap="round" stroke-linejoin="round"${label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"'} style="flex: none">${paths}</svg>`;
const I: Record<string, string> = {
  ...lucidePaths,
  pointer:
    '<path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"/>',
  house:
    '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  database:
    '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  image:
    '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  chartLine: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/>',
  rocket:
    '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  globe:
    '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  wind: '<path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
  sort: '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
  grip: '<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>',
  folder:
    '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  palette:
    '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  webhook:
    '<path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2"/><path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06"/><path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8"/>',
  code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  square: '<rect width="18" height="18" x="3" y="3" rx="2"/>',
  textBox:
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M13 8H7"/><path d="M17 12H7"/>',
  penTool:
    '<path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z"/><path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18"/><path d="m2.3 2.3 7.286 7.286"/><circle cx="11" cy="11" r="2"/>',
  disc: '<circle cx="12" cy="12" r="10"/><path d="M6 12c0-1.7.7-3.2 1.8-4.2"/><circle cx="12" cy="12" r="2"/><path d="M18 12c0 1.7-.7 3.2-1.8 4.2"/>',
  mic: '<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/>',
  ticket:
    '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',
  newspaper:
    '<path d="M15 18h-5"/><path d="M18 14h-8"/><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="10" y="6" rx="1"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/>',
  cloudOff:
    '<path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193"/><path d="M21.532 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.008 7.008 0 0 0 10 5.07"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
};
const ic = (name: string, size = 16, label?: string) => {
  const paths = I[name];
  if (!paths) throw new DesignError('design/missing-asset', `No icon named ${name}`);
  return icon(paths, size, label);
};

// Type and small shared styles (the editor's 11, 12 and 13px; 15px titles; display on the site)
const ui = 'font-size: var(--m-font-size-sm)';
const meta = 'font-size: var(--m-font-size-xs); color: var(--m-color-fg-muted)';
const strong = 'font-weight: var(--m-font-weight-semibold)';
const num = 'font-variant-numeric: tabular-nums';
const hair = 'var(--m-border-width-thin) solid var(--m-color-border-muted)';
const line = 'var(--m-border-width-thin) solid var(--m-color-border-default)';
const panelTitle = `font-size: var(--m-font-size-lg); ${strong}; letter-spacing: var(--m-font-tracking-normal)`;
// The public site's display type: a tight geometric face at 44–54px, tracked −4%
const display = (size: string) =>
  `font-family: var(--m-font-family-display); font-size: var(--m-font-size-${size}); font-weight: var(--m-font-weight-medium); line-height: var(--m-font-leading-tight); letter-spacing: var(--m-font-tracking-tight)`;
// Gradients are drawn from tokens: the signature blue into the warm pink of the danger hue
const glow =
  'linear-gradient(135deg, var(--m-color-brand-default) 0%, var(--m-color-info-solid) 40%, var(--m-color-danger-fg) 100%)';

const iconBtn = (name: string, label: string, size = 'md') =>
  `<button type="button" class="m-button" data-variant="ghost" data-size="${size}" data-icon-only aria-label="${label}" style="color: var(--m-color-fg-muted)">${ic(name, 16)}</button>`;
const avatar = (initials: string, name: string, size = 'sm') =>
  `<span class="m-avatar" data-size="${size}" role="img" aria-label="${name}" style="font-size: 0.5625rem">${initials}</span>`;
const kbd = (...keys: string[]) => keys.map((k) => `<kbd class="m-kbd">${k}</kbd>`).join(' ');
const segmented = (labels: string[], current: string, name: string, iconOnly = false) =>
  `<div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="${name}">${labels
    .map((l) => {
      const [glyph, text] = l.includes(':') ? (l.split(':') as [string, string]) : [null, l];
      const sel = text === current;
      return `<button type="button" class="m-tab" role="tab" aria-selected="${sel}"${sel ? '' : ' tabindex="-1"'}${iconOnly ? ` aria-label="${text}"` : ''}>${glyph ? ic(glyph, 14) : ''}${iconOnly ? '' : `${glyph ? ' ' : ''}${text}`}</button>`;
    })
    .join('')}</div></div>`;
// The sample app's mark: a blue tile with an unrelated glyph, then a plain wordmark
const mark = (size = '1.25rem') =>
  `<span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: ${size}; block-size: ${size}; border-radius: var(--m-radius-sm); background: var(--m-color-brand-default); color: var(--m-color-brand-fg); flex: none">${ic('wind', 12)}</span>`;
// A breakpoint label: blue text on a 10% tint, 10px corners
const frameLabel = (glyph: string, name: string, width: string, current = false) =>
  `<span class="m-cluster" data-gap="1" style="${ui}; ${strong}; padding: 3px 6px; border-radius: 10px; flex-wrap: nowrap; ${current ? 'color: var(--m-color-accent-text); background: var(--m-color-brand-subtle)' : 'color: var(--m-color-fg-muted); background: var(--m-color-bg-surface)'}">${ic(glyph, 12)} ${name} <span style="font-weight: var(--m-font-weight-regular); ${num}">${width}</span></span>`;

/* ---------------------------------------------------------------- the frame */

// The toolbar: a 50px bar on the panel colour; the menu button left, the site centred, Publish right
const toolbar = (
  tools: string,
  status: string,
) => `<header class="m-cluster" data-justify="between" style="min-block-size: 3.125rem; padding: var(--m-space-2) 10px; background: var(--m-color-bg-canvas); border-block-end: ${hair}">
    <div class="m-cluster" data-gap="1" style="flex: 1 1 0; flex-wrap: nowrap">
      <button type="button" class="m-button" style="background: var(--m-color-bg-surface)">${mark('1rem')} Glider ${ic('chevron-down', 12)}</button>
      ${tools}
    </div>
    <div class="m-cluster" data-gap="2" style="${ui}; flex-wrap: nowrap">${status}</div>
    <div class="m-cluster" data-gap="2" data-justify="end" style="flex: 1 1 0; flex-wrap: nowrap">
      <span class="m-avatar-group" aria-label="3 people here">${avatar('IV', 'Ilse Varga')}${avatar('KM', 'Kofi Mensah')}${avatar('RD', 'Rhea Dutta')}</span>
      ${iconBtn('play', 'Preview')}
      <button type="button" class="m-button" data-variant="primary">Publish</button>
    </div>
  </header>`;
const siteStatus = `<span style="${strong}">Nightjar Records</span><span class="m-badge" data-tone="info">${ic('zap', 10)} 3 unpublished</span>`;

type NavItem = [string, string, string?];
const navList = (items: NavItem[], current: string) =>
  `<ul>
${items
  .map(
    ([g, l, count]) =>
      `          <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${ic(g, 14)} ${l}${count ? ` <span class="m-sidebar-count">${count}</span>` : ''}</a></li>`,
  )
  .join('\n')}
        </ul>`;

// The left panel: the site's own sections and order; the treatment is the reference's pages panel
const sitePanel = (current: string) => `<nav class="m-sidebar" aria-label="Site" style="border-inline-end: ${hair}">
    <div class="m-sidebar-section">
      ${navList(
        [
          ['house', 'Overview'],
          ['file', 'Pages', '12'],
          ['database', 'Collections', '4'],
          ['inbox', 'Form replies'],
        ],
        current,
      )}
    </div>
    <div class="m-sidebar-section" style="border-block-start: ${hair}; padding-block-start: var(--m-space-3)">
      <div class="m-cluster" data-justify="between" style="padding-inline: 5px"><h2 class="m-sidebar-heading">Live site</h2>${iconBtn('plus', 'Add a check', 'sm')}</div>
      ${navList(
        [
          ['chartLine', 'Visitors'],
          ['rocket', 'Deploys'],
          ['globe', 'Languages', '3'],
        ],
        current,
      )}
    </div>
    <div class="m-sidebar-section" style="border-block-start: ${hair}; padding-block-start: var(--m-space-3)">
      <h2 class="m-sidebar-heading" style="padding-inline: 5px">Together</h2>
      ${navList(
        [
          ['message', 'Comments', '5'],
          ['webhook', 'Integrations'],
        ],
        current,
      )}
    </div>
  </nav>`;

const app = (
  header: string,
  body: string,
) => `<div class="m-stack" data-gap="0" style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  ${header}
${body}
</div>`;

const shell = (current: string, main: string) =>
  app(
    toolbar(`${iconBtn('search', 'Search')} ${iconBtn('plus', 'New page')}`, siteStatus),
    `  <div class="m-split" style="--m-layout-split-side: 16.25rem; --m-layout-split-gap: 0; flex: 1">
  ${sitePanel(current)}
  <main class="m-stack" data-gap="5" style="padding: var(--m-space-5) clamp(1rem, 3vw, 1.5rem) var(--m-space-10)">
${main}
  </main>
  </div>`,
  );

/* ---------------------------------------------------------------- dashboard */

// A small site drawn in a frame: a bar, a headline, a gradient band, two cards
const miniSite = (
  w: string,
  h: string,
  big: boolean,
) => `<div style="inline-size: ${w}; block-size: ${h}; border-radius: 4px; background: var(--m-color-bg-sunken); overflow: hidden; box-shadow: 0 0 0 1px var(--m-color-border-default); display: flex; flex-direction: column; gap: ${big ? '10px' : '6px'}; padding: ${big ? '12px' : '8px'}; flex: none">
              <div class="m-cluster" data-justify="between"><span style="inline-size: 28%; block-size: 4px; border-radius: 2px; background: var(--m-color-fg-default)"></span><span style="inline-size: 30%; block-size: 3px; border-radius: 2px; background: var(--m-color-fg-subtle)"></span></div>
              <span style="${display(big ? 'lg' : 'sm')}; color: var(--m-color-fg-default)">Records for late nights</span>
              <div style="flex: 1; border-radius: 4px; background: ${glow}"></div>
              <div class="m-cluster" data-gap="1" style="flex-wrap: nowrap"><span style="flex: 1; block-size: ${big ? '22px' : '12px'}; border-radius: 3px; background: var(--m-color-bg-surface)"></span><span style="flex: 1; block-size: ${big ? '22px' : '12px'}; border-radius: 3px; background: var(--m-color-bg-surface)"></span></div>
            </div>`;

// Visits per day over two weeks: the blue line over a faint fade, last week as a dotted grey
const visits = [1.9, 2.1, 2.0, 2.4, 2.8, 2.6, 2.2, 2.3, 2.7, 2.6, 3.1, 3.5, 3.2, 3.6];
const lastWeek = [1.6, 1.7, 1.9, 1.8, 2.0, 2.3, 2.1, 1.9, 2.2, 2.4, 2.3, 2.5, 2.4, 2.6];
const pathOf = (pts: number[]) =>
  pts
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${((i * 560) / (pts.length - 1)).toFixed(1)},${(170 - v * 40).toFixed(1)}`)
    .join(' ');
const chart = `<svg viewBox="0 0 560 180" width="100%" preserveAspectRatio="none" style="display: block; block-size: 11rem" role="img" aria-label="Visits per day over 14 days, rising from 1.9K to 3.6K; the two weeks before ran from 1.6K to 2.6K">
            <defs><linearGradient id="kt-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: var(--m-color-brand-default); stop-opacity: 0.22"/><stop offset="1" style="stop-color: var(--m-color-brand-default); stop-opacity: 0"/></linearGradient></defs>
            ${[30, 70, 110, 150].map((y) => `<path d="M0 ${y}H560" style="stroke: var(--m-color-border-muted)"/>`).join('')}
            <path d="${pathOf(visits)} L560,180 L0,180 Z" fill="url(#kt-fade)"/>
            <path d="${pathOf(lastWeek)}" fill="none" style="stroke: var(--m-color-fg-subtle)" stroke-width="1.5" stroke-dasharray="2 4" vector-effect="non-scaling-stroke"/>
            <path d="${pathOf(visits)}" fill="none" style="stroke: var(--m-color-brand-default)" stroke-width="2" vector-effect="non-scaling-stroke"/>
            <circle cx="${((11 * 560) / 13).toFixed(1)}" cy="${(170 - 3.5 * 40).toFixed(1)}" r="4" style="fill: var(--m-color-brand-default); stroke: var(--m-color-bg-surface)" stroke-width="2"/>
          </svg>`;
const stat = (labelText: string, value: string, trend: string, tone = 'success') =>
  `<div class="m-card" data-size="sm"><div class="m-card-body m-stack" data-gap="2">
            <span class="m-muted" style="${ui}">${labelText}</span>
            <span style="font-size: var(--m-font-size-xl); ${num}">${value}</span>
            <span style="${meta}"><span style="color: var(--m-color-${tone}-fg)">${trend}</span> vs last week</span>
          </div></div>`;
const change = (who: [string, string], what: string, where: string, when: string) =>
  `<li class="m-cluster" data-gap="3" style="padding-block: var(--m-space-2); border-block-start: ${hair}; flex-wrap: nowrap">${avatar(who[0], who[1])}<span style="${ui}; flex: 1; min-inline-size: 0"><span style="${strong}">${who[1].split(' ')[0]}</span> <span class="m-muted">${what}</span> ${where}</span><span style="${meta}; ${num}">${when}</span></li>`;

const dashboard = shell(
  'Overview',
  `    <div class="m-cluster" data-justify="between">
      <div class="m-stack" data-gap="1">
        <h1 style="${panelTitle}">Overview</h1>
        <a href="#" class="m-cluster" data-gap="1" style="${ui}; color: var(--m-color-fg-muted); text-decoration: none">${ic('link', 12)} nightjar-records.glider.site ${ic('arrow-up-right', 12)}</a>
      </div>
      <div class="m-cluster" data-gap="2">
        ${segmented(['7 days', '30 days', '90 days'], '7 days', 'Range')}
        <button type="button" class="m-button">${ic('pointer', 14)} Open canvas</button>
      </div>
    </div>
    <section class="m-card" data-variant="sunken" aria-label="Breakpoints">
      <div class="m-card-body m-stack" data-gap="3">
        <div class="m-cluster" data-gap="6" data-align="end" style="overflow: hidden; flex-wrap: nowrap; padding: var(--m-space-2)">
          <div class="m-stack" data-gap="2" data-align="start">${frameLabel('monitor', 'Home', '1440', true)}${miniSite('22rem', '13rem', true)}</div>
          <div class="m-stack" data-gap="2" data-align="start">${frameLabel('square', 'Home', '768')}${miniSite('12.5rem', '13rem', false)}</div>
          <div class="m-stack" data-gap="2" data-align="start">${frameLabel('square', 'Home', '375')}${miniSite('6.5rem', '13rem', false)}</div>
        </div>
        <div class="m-cluster" data-justify="between" style="${meta}"><span>Home · edited by Ilse 12 minutes ago</span><span class="m-cluster" data-gap="1">${kbd('⌘', 'P')} to preview</span></div>
      </div>
    </section>
    <div class="m-grid" style="--m-layout-grid-min: 10rem">
      ${stat('Visits', '18.4K', '+12%')}
      ${stat('Unique visitors', '11.2K', '+8%')}
      ${stat('Form replies', '126', '+31')}
      ${stat('Median load', '0.9s', '−0.2s')}
    </div>
    <div class="m-cluster" data-gap="3" data-align="stretch">
      <section class="m-card" aria-labelledby="kt-visits" style="flex: 2 1 26rem; min-inline-size: 0">
        <div class="m-card-body m-stack" data-gap="3">
          <div class="m-cluster" data-justify="between">
            <h2 id="kt-visits" style="${ui}; ${strong}">Visits per day</h2>
            <div class="m-cluster" data-gap="4" style="${meta}">
              <span class="m-cluster" data-gap="2"><span aria-hidden="true" style="inline-size: 10px; block-size: 2px; background: var(--m-color-brand-default)"></span> This week</span>
              <span class="m-cluster" data-gap="2"><span aria-hidden="true" style="inline-size: 10px; block-size: 0; border-block-start: 2px dotted var(--m-color-fg-subtle)"></span> Week before</span>
            </div>
          </div>
          <div style="position: relative">
            ${chart}
            <div class="m-popover" data-static style="position: absolute; inset-block-start: 0.25rem; inset-inline-start: 62%; min-inline-size: 9.5rem; padding: var(--m-space-2) var(--m-space-3)">
              <div class="m-stack" data-gap="2" style="${ui}">
                <span class="m-muted">Nov 9</span>
                <span class="m-cluster" data-justify="between"><span class="m-cluster" data-gap="2"><span aria-hidden="true" style="inline-size: 8px; block-size: 8px; border-radius: var(--m-radius-full); border: 2px solid var(--m-color-brand-default)"></span>Visits</span><span style="${num}">3,512</span></span>
                <span class="m-cluster" data-justify="between"><span class="m-cluster" data-gap="2"><span aria-hidden="true" style="inline-size: 8px; block-size: 8px; border-radius: var(--m-radius-full); border: 2px dotted var(--m-color-fg-subtle)"></span>Before</span><span style="${num}">2,487</span></span>
              </div>
            </div>
          </div>
          <div class="m-cluster" data-justify="between" style="${meta}; ${num}"><span>Oct 30</span><span>Nov 2</span><span>Nov 5</span><span>Nov 8</span><span>Nov 12</span></div>
        </div>
      </section>
      <section class="m-card" aria-labelledby="kt-changes" style="flex: 1 1 17rem">
        <div class="m-card-body m-stack" data-gap="2">
          <div class="m-cluster" data-justify="between">
            <h2 id="kt-changes" style="${ui}; ${strong}">Unpublished changes</h2>
            <button type="button" class="m-button" data-size="sm">Review</button>
          </div>
          <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
            ${change(['IV', 'Ilse Varga'], 'edited', 'Home', '12m')}
            ${change(['KM', 'Kofi Mensah'], 'added 4 entries to', 'Tour dates', '1h')}
            ${change(['RD', 'Rhea Dutta'], 'renamed', '/shop', '3h')}
          </ul>
          <div class="m-usage" data-level="ok" style="--m-usage-value: 64%; margin-block-start: auto">
            <div class="m-usage-header"><span class="m-usage-label">Bandwidth this month</span><span class="m-usage-amount">32 of 50 GB</span></div>
            <div class="m-usage-bar" role="meter" aria-label="Bandwidth this month" aria-valuemin="0" aria-valuemax="100" aria-valuenow="64"></div>
          </div>
        </div>
      </section>
    </div>`,
);

/* ---------------------------------------------------------------- list and detail */

// The collections tree: folders and collections with counts; the current one on a grey step
const tree = (current: string) => {
  const row = (g: string, name: string, count: string, depth: number) =>
    `<li><a class="m-sidebar-link" href="#"${name === current ? ' aria-current="page"' : ''} style="padding-inline-start: calc(0.625rem + ${depth} * 1.25rem)">${ic(g, 14)} ${name}${count ? ` <span class="m-sidebar-count" style="font-size: 0.625rem">${count}</span>` : ''}</a></li>`;
  return `<nav class="m-sidebar" aria-label="Collections" style="border-inline-end: ${hair}">
    <div class="m-sidebar-section">
      <div class="m-cluster" data-justify="between" style="padding-inline: 5px"><h2 class="m-sidebar-heading">Collections</h2>${iconBtn('plus', 'New collection', 'sm')}</div>
      <ul>
        <li><a class="m-sidebar-link" href="#">${ic('chevron-down', 12)} ${ic('folder', 14)} Music</a></li>
        ${row('disc', 'Releases', '24', 1)}
        ${row('mic', 'Artists', '11', 1)}
        ${row('ticket', 'Tour dates', '18', 1)}
        <li><a class="m-sidebar-link" href="#">${ic('chevron-right', 12)} ${ic('folder', 14)} Studio</a></li>
        ${row('newspaper', 'Press', '7', 0)}
      </ul>
    </div>
  </nav>`;
};

type Release = [string, string, string, 'success' | 'neutral' | 'info', string, string];
const releases: Release[] = [
  ['Low Tide Lanterns', 'Ambient', 'Live', 'success', 'Oct 18', 'brand-default'],
  ['Copper Wires', 'Post-punk', 'Live', 'success', 'Sep 27', 'danger-fg'],
  ['Night Bus to Ostend', 'Electronic', 'Scheduled', 'info', 'Nov 22', 'success-solid'],
  ['Paper Moons', 'Folk', 'Draft', 'neutral', '—', 'warning-solid'],
  ['Slow Signal', 'Ambient', 'Live', 'success', 'Aug 30', 'info-solid'],
  ['Glass Orchard', 'Indie', 'Draft', 'neutral', '—', 'brand-default'],
];
const cover = (tone: string) =>
  `<span aria-hidden="true" style="display: inline-block; inline-size: 2.875rem; block-size: 1.25rem; border-radius: 4px; background: linear-gradient(120deg, var(--m-color-${tone}), var(--m-color-bg-sunken))"></span>`;
const releaseRow = (
  [title, genre, status, tone, date, coverTone]: Release,
  selected: boolean,
) => `<tr${selected ? ' aria-selected="true" style="background: var(--m-color-bg-surface)"' : ''}>
              <td style="inline-size: 2.5rem"><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap; color: var(--m-color-fg-subtle)">${ic('grip', 12)}<input type="checkbox" class="m-checkbox" aria-label="Select ${title}"${selected ? ' checked' : ''}></span></td>
              <td style="${selected ? strong : ''}">${title}</td>
              <td>${cover(coverTone)}</td>
              <td><span class="m-badge" style="border-radius: var(--m-radius-lg); padding-inline: var(--m-space-2)">${genre}</span></td>
              <td><span class="m-badge" data-tone="${tone}">${status}</span></td>
              <td class="m-muted" style="${num}">${date}</td>
            </tr>`;

// A property row: the label left in light grey, the control right
const prop = (labelText: string, control: string, id?: string) =>
  `<div class="m-cluster" data-gap="2" style="flex-wrap: nowrap; min-block-size: 1.875rem">
              ${id ? `<label class="m-field-label" for="${id}" style="flex: 0 0 4.5rem">${labelText}</label>` : `<span class="m-field-label" style="flex: 0 0 4.5rem">${labelText}</span>`}
              <div class="m-cluster" data-gap="2" style="flex: 1; flex-wrap: nowrap; min-inline-size: 0">${control}</div>
            </div>`;
// A number input with its unit inside, on the right, in grey
const numInput = (id: string, value: string, unit: string, labelText: string) =>
  `<span style="position: relative; flex: 1; min-inline-size: 0"><input class="m-input" id="${id}" inputmode="decimal" value="${value}" aria-label="${labelText}" style="padding-inline-end: 1.75rem; ${num}"><span aria-hidden="true" style="position: absolute; inset-inline-end: 0.625rem; inset-block-start: 50%; translate: 0 -50%; font-size: 0.625rem; color: var(--m-color-fg-subtle)">${unit}</span></span>`;
const stepper = (labelText: string) =>
  `<span class="m-cluster" data-gap="0" style="flex: 1; flex-wrap: nowrap; border-radius: var(--m-radius-md); background: var(--m-input-bg)"><button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Less ${labelText}" style="flex: 1">${ic('minus', 14)}</button><span aria-hidden="true" style="inline-size: 1px; block-size: 0.875rem; background: var(--m-color-border-default)"></span><button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="More ${labelText}" style="flex: 1">${ic('plus', 14)}</button></span>`;
const section = (title: string, body: string, open = true) =>
  `<section class="m-stack" data-gap="2" style="padding: var(--m-space-3) 0; border-block-start: ${hair}">
            <div class="m-cluster" data-justify="between"><h3 style="${ui}; ${strong}">${title}</h3>${iconBtn(open ? 'minus' : 'plus', `${open ? 'Hide' : 'Show'} ${title}`, 'sm')}</div>
            ${open ? body : ''}
          </section>`;

const listDetail = app(
  toolbar(
    `${iconBtn('pointer', 'Select')} ${iconBtn('plus', 'Insert')} ${iconBtn('database', 'Collections')}`,
    siteStatus,
  ),
  `  <div class="m-split" style="--m-layout-split-side: 16.25rem; --m-layout-split-gap: 0; flex: 1">
  ${tree('Releases')}
  <div class="m-cluster" data-gap="0" data-align="stretch">
    <main class="m-stack" data-gap="0" style="flex: 999 1 30rem; min-inline-size: 0">
      <div class="m-cluster" data-justify="between" style="padding: 10px var(--m-space-3); border-block-end: ${hair}">
        <div class="m-cluster" data-gap="1">
          <h1 style="${ui}; ${strong}; padding-inline: var(--m-space-2)">Releases</h1>
          ${iconBtn('plus', 'New entry')} ${iconBtn('list-filter', 'Filter')} ${iconBtn('sort', 'Sort')} ${iconBtn('search', 'Search entries')}
        </div>
        ${segmented(['All', 'Live', 'Drafts'], 'All', 'Show')}
      </div>
      <div class="m-table-wrap">
        <table class="m-table">
          <thead><tr><th scope="col"><span class="m-sr-only">Select</span></th><th scope="col">Title</th><th scope="col">Cover</th><th scope="col">Genre</th><th scope="col">Status</th><th scope="col">Out</th></tr></thead>
          <tbody>
            ${releases.map((r, i) => releaseRow(r, i === 2)).join('\n            ')}
          </tbody>
        </table>
      </div>
      <p style="${meta}; padding: var(--m-space-3) var(--m-space-4)">6 of 24 entries · 2 drafts</p>
    </main>
    <aside class="m-stack" data-gap="0" aria-label="Entry properties" style="flex: 1 1 17.5rem; max-inline-size: 22rem; padding: 10px var(--m-space-3) var(--m-space-6); border-inline-start: ${hair}">
      <div style="padding-block-end: 10px">${segmented(['Entry', 'Activity'], 'Entry', 'Panel')}</div>
      ${section(
        'Content',
        `<div class="m-stack" data-gap="2">
            ${prop('Title', `<input class="m-input" id="kt-title" value="Night Bus to Ostend" style="flex: 1; min-inline-size: 0">`, 'kt-title')}
            ${prop('Slug', `<span style="position: relative; flex: 1"><span aria-hidden="true" style="position: absolute; inset-inline-start: 0.625rem; inset-block-start: 50%; translate: 0 -50%; color: var(--m-color-fg-subtle)">/</span><input class="m-input" id="kt-slug" value="night-bus-to-ostend" style="padding-inline-start: 1.25rem"></span>`, 'kt-slug')}
            ${prop('Status', segmented(['Draft', 'Scheduled', 'Live'], 'Scheduled', 'Status'))}
            ${prop('Out', `<input class="m-input" id="kt-out" value="Nov 22, 2026" style="${num}; flex: 1; min-inline-size: 0">${iconBtn('calendar', 'Pick a date')}`, 'kt-out')}
            ${prop('Format', `<select class="m-select" id="kt-format" style="flex: 1; min-inline-size: 0"><option>Vinyl and digital</option><option>Digital only</option><option>Cassette</option></select>`, 'kt-format')}
          </div>`,
      )}
      ${section(
        'Cover',
        `<div class="m-stack" data-gap="2">
            <div aria-hidden="true" style="block-size: 6rem; border-radius: 10px; background: linear-gradient(120deg, var(--m-color-success-solid), var(--m-color-brand-default) 55%, var(--m-color-bg-sunken))"></div>
            ${prop('Size', `${numInput('kt-w', '1600', 'W', 'Width')}${numInput('kt-h', '1600', 'H', 'Height')}`)}
            ${prop('Fit', `<select class="m-select" id="kt-fit" style="flex: 1; min-inline-size: 0"><option>Fill</option><option>Fit</option><option>Stretch</option></select>`, 'kt-fit')}
            ${prop('Radius', `${numInput('kt-r', '12', 'PX', 'Corner radius')}${stepper('radius')}`)}
            ${prop('Align', segmented(['Left', 'Centre', 'Right'], 'Centre', 'Align'))}
            ${prop('Tint', `<span style="position: relative; flex: 1"><span aria-hidden="true" style="position: absolute; inset-inline-start: 5px; inset-block-start: 50%; translate: 0 -50%; inline-size: 1.25rem; block-size: 1.25rem; border-radius: 5px; background: var(--m-color-success-solid); box-shadow: inset 0 0 0 1px var(--m-color-border-default)"></span><input class="m-input" id="kt-tint" value="00BB88" aria-label="Tint colour" style="padding-inline-start: 2rem; font-family: var(--m-font-family-mono)"></span>`)}
            ${prop('Opacity', `${numInput('kt-o', '80', '%', 'Opacity')}<span aria-hidden="true" style="flex: 1; position: relative; block-size: 1rem; display: flex; align-items: center"><span style="flex: 1; block-size: 2px; border-radius: 1px; background: linear-gradient(90deg, var(--m-color-brand-default) 80%, var(--m-color-border-default) 80%)"></span><span style="position: absolute; inset-inline-start: calc(80% - 6px); inline-size: 12px; block-size: 12px; border-radius: var(--m-radius-full); background: var(--m-color-accent-fg); box-shadow: 0 0 0 1px var(--m-color-border-default), var(--m-shadow-sm)"></span></span>`)}
          </div>`,
      )}
      ${section('Search', '', false)}
      ${section('Linked artists', '', false)}
    </aside>
  </div>
  </div>`,
);

/* ---------------------------------------------------------------- onboarding */

const startOption = (g: string, title: string, text: string, checked: boolean) =>
  `<label class="m-card" data-size="sm" style="cursor: pointer; flex: 1 1 10rem; ${checked ? 'box-shadow: 0 0 0 1px var(--m-color-border-focus), 0 0 0 4px var(--m-color-brand-subtle)' : ''}">
          <div class="m-card-body m-stack" data-gap="3">
            <span class="m-cluster" data-justify="between"><span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: 2rem; block-size: 2rem; border-radius: var(--m-radius-md); ${checked ? `background: ${glow}; color: var(--m-color-brand-fg)` : 'background: var(--m-color-bg-raised); color: var(--m-color-fg-default)'}">${ic(g, 16)}</span><input type="radio" class="m-radio" name="kt-start"${checked ? ' checked' : ''} aria-label="${title}"></span>
            <span class="m-stack" data-gap="1"><span style="${ui}; ${strong}">${title}</span><span class="m-muted" style="${ui}">${text}</span></span>
          </div>
        </label>`;

const onboarding = `<div class="m-stack" data-align="center" style="min-block-size: 100vh; background: var(--m-color-bg-sunken); position: relative; overflow: hidden; padding: var(--m-space-6) var(--m-space-4) var(--m-space-12)">
  <div aria-hidden="true" style="position: absolute; inset-block-start: -14rem; inset-inline: 0; margin-inline: auto; inline-size: 44rem; max-inline-size: 140%; block-size: 26rem; border-radius: var(--m-radius-full); background: ${glow}; opacity: 0.5; filter: blur(90px)"></div>
  <header class="m-cluster" data-justify="between" style="inline-size: 100%; max-inline-size: 75rem; position: relative">
    <span class="m-cluster" data-gap="2" style="${strong}; font-size: 0.875rem">${mark()} Glider</span>
    <button type="button" class="m-button" data-variant="ghost">Skip setup</button>
  </header>
  <main class="m-stack" data-gap="6" style="inline-size: 100%; max-inline-size: 36rem; margin-block-start: var(--m-space-12); position: relative">
    <div class="m-stack" data-gap="3">
      <div class="m-cluster" data-gap="3" style="${meta}; ${num}"><span>Step 2 of 3</span><progress class="m-progress" data-size="sm" value="2" max="3" aria-label="Setup progress: step 2 of 3" style="inline-size: 6rem">2 of 3</progress></div>
      <h1 style="${display('3xl')}">Where should your site begin?</h1>
      <p class="m-muted" style="font-size: var(--m-font-size-lg)">Pick a starting point. Everything stays editable on the canvas, so nothing here is final.</p>
    </div>
    <div class="m-cluster" data-gap="3" data-align="stretch" role="radiogroup" aria-label="Start from">
      ${startOption('square', 'Blank canvas', 'An empty page at three breakpoints.', false)}
      ${startOption('textBox', 'Describe it', 'Say what the site is for and get a first draft.', true)}
      ${startOption('penTool', 'Bring a design', 'Paste frames from a design file.', false)}
    </div>
    <div class="m-card"><div class="m-card-body m-stack" data-gap="3">
      <div class="m-field">
        <label class="m-field-label" for="kt-brief">What is the site for?</label>
        <textarea class="m-input" id="kt-brief" rows="3" aria-describedby="kt-brief-hint">A label site for Nightjar Records: new releases, artist pages, tour dates and a small shop for vinyl.</textarea>
        <p class="m-field-hint" id="kt-brief-hint">A sentence or two is plenty.</p>
      </div>
      <div class="m-cluster" data-justify="between" data-gap="3">
        <div class="m-field" data-layout="inline" style="${ui}"><span class="m-field-label">Look</span>${segmented(['moon:Dark', 'sun:Light'], 'Dark', 'Look')}</div>
        <div class="m-cluster" data-gap="2" style="${ui}"><span class="m-muted">Pages</span>${['Home', 'Releases', 'Artists', 'Tour', 'Shop'].map((p) => `<span class="m-badge">${p}</span>`).join('')}</div>
      </div>
    </div></div>
    <div class="m-cluster" data-justify="between">
      <button type="button" class="m-button" data-variant="ghost">${ic('chevron-left', 14)} Back</button>
      <button type="button" class="m-button" data-variant="primary" data-size="lg">Make the first draft ${ic('arrow-right', 14)}</button>
    </div>
  </main>
</div>`;

/* ---------------------------------------------------------------- settings */

const settingsNav = (current: string) =>
  `<nav class="m-sidebar" aria-label="Site settings" style="border-inline-end: ${line}; background: transparent; --m-sidebar-link-active-bg: var(--m-color-bg-raised); --m-sidebar-link-fg: var(--m-field-label-fg); --m-sidebar-link-padding-y: 0.5625rem">
        <div class="m-sidebar-section">
          ${navList(
            [
              ['settings', 'General'],
              ['palette', 'Appearance'],
              ['eye', 'Visitors and privacy'],
              ['bell', 'Notifications'],
              ['code', 'Embeds'],
              ['webhook', 'Webhooks', '2'],
              ['key', 'Ownership'],
            ],
            current,
          )}
        </div>
      </nav>`;
const row = (labelText: string, hint: string, control: string, id?: string) =>
  `<div class="m-cluster" data-justify="between" data-gap="4" style="padding-block: var(--m-space-3); border-block-start: ${line}">
              <div class="m-stack" data-gap="1" style="flex: 1 1 14rem">
                ${id ? `<label class="m-field-label" for="${id}" style="color: var(--m-color-fg-default)">${labelText}</label>` : `<span style="${ui}; font-weight: var(--m-font-weight-medium)">${labelText}</span>`}
                <span class="m-muted" style="${ui}" ${id ? `id="${id}-hint"` : ''}>${hint}</span>
              </div>
              <div class="m-cluster" data-gap="2" style="flex: 0 1 15rem; justify-content: flex-end">${control}</div>
            </div>`;

const settings = `<div style="min-block-size: 100vh; background: var(--m-color-bg-sunken); padding: clamp(0.5rem, 4vw, 3rem) clamp(0.5rem, 3vw, 2rem)">
  <div class="m-stack" data-gap="0" role="dialog" aria-modal="false" aria-labelledby="kt-settings" style="max-inline-size: 60rem; margin-inline: auto; border-radius: var(--m-dialog-radius); background: var(--m-dialog-bg); box-shadow: var(--m-shadow-overlay); overflow: hidden">
    <header class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-3) var(--m-space-3) var(--m-space-5); border-block-end: ${line}">
      <h1 id="kt-settings" style="font-size: var(--m-font-size-md); ${strong}">Site settings</h1>
      <input class="m-input" type="search" placeholder="Search settings" aria-label="Search settings" style="inline-size: 14rem; margin-inline-start: auto; margin-inline-end: var(--m-space-2)">
      ${iconBtn('x', 'Close settings')}
    </header>
    <div class="m-split" style="--m-layout-split-side: 14rem; --m-layout-split-gap: 0">
      ${settingsNav('General')}
      <main class="m-stack" data-gap="8" style="padding: var(--m-space-6) var(--m-space-8) var(--m-space-8)">
        <section class="m-stack" data-gap="3" aria-labelledby="kt-general">
          <div class="m-stack" data-gap="1">
            <h2 id="kt-general" style="font-size: var(--m-font-size-lg); ${strong}">General</h2>
            <p class="m-muted" style="${ui}">How the site introduces itself to browsers, search and link previews.</p>
          </div>
          <div class="m-stack" data-gap="0">
            ${row('Site name', 'Shown in the browser tab and on shared links.', `<input class="m-input" id="kt-name" value="Nightjar Records" aria-describedby="kt-name-hint">`, 'kt-name')}
            ${row('Description', 'One or two sentences; search shows about 150 characters.', `<textarea class="m-input" id="kt-desc" rows="2" aria-describedby="kt-desc-hint">Independent label for night music. Releases, artists and tour dates.</textarea>`, 'kt-desc')}
            ${row('Icon', 'A square image, at least 256 pixels.', `<span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: 1.875rem; block-size: 1.875rem; border-radius: var(--m-radius-md); background: ${glow}; color: var(--m-color-brand-fg)">${ic('disc', 14)}</span><button type="button" class="m-button">${ic('upload', 14)} Replace</button>`)}
            ${row('Main language', 'Other languages are set up under Languages.', `<select class="m-select" id="kt-lang" aria-describedby="kt-lang-hint"><option>English</option><option>Dutch</option><option>French</option></select>`, 'kt-lang')}
          </div>
        </section>
        <section class="m-stack" data-gap="3" aria-labelledby="kt-look">
          <h2 id="kt-look" style="font-size: var(--m-font-size-lg); ${strong}">Look and feel</h2>
          <div class="m-stack" data-gap="0">
            ${row('Default theme', 'Visitors can still switch if the page offers it.', segmented(['monitor:System', 'sun:Light', 'moon:Dark'], 'Dark', 'Default theme'))}
            ${row('Smooth scrolling', 'Eases page scrolls and anchor jumps.', `<input type="checkbox" role="switch" class="m-switch" aria-label="Smooth scrolling" checked>`)}
            ${row('Reduce motion for everyone', 'Turns off scroll effects even when the system allows them.', `<input type="checkbox" role="switch" class="m-switch" aria-label="Reduce motion for everyone">`)}
            ${row('Accent', 'Used for links and focus rings on the site.', `<span style="position: relative"><span aria-hidden="true" style="position: absolute; inset-inline-start: 5px; inset-block-start: 50%; translate: 0 -50%; inline-size: 1.25rem; block-size: 1.25rem; border-radius: 5px; background: var(--m-color-brand-default)"></span><input class="m-input" value="0099FF" aria-label="Accent colour" style="padding-inline-start: 2rem; inline-size: 8rem; font-family: var(--m-font-family-mono)"></span>`)}
          </div>
        </section>
        <section class="m-stack" data-gap="3" aria-labelledby="kt-own">
          <h2 id="kt-own" style="font-size: var(--m-font-size-lg); ${strong}">Hand over</h2>
          <div class="m-stack" data-gap="0">
            ${row('Move to another workspace', 'The site keeps its address, plan and history.', `<button type="button" class="m-button">Move site</button>`)}
            ${row('Take the site offline', 'Visitors see a holding page; nothing is deleted.', `<button type="button" class="m-button" data-variant="danger">Take offline</button>`)}
          </div>
        </section>
        <div class="m-cluster" data-justify="end" data-gap="2" style="border-block-start: ${line}; padding-block-start: var(--m-space-4)">
          <span class="m-muted" style="${ui}; margin-inline-end: auto">Saved 2 minutes ago</span>
          <button type="button" class="m-button" data-variant="ghost">Discard</button>
          <button type="button" class="m-button" data-variant="primary">Save changes</button>
        </div>
      </main>
    </div>
  </div>
</div>`;

/* ---------------------------------------------------------------- empty state */

const emptyState = shell(
  'Form replies',
  `    <div class="m-cluster" data-justify="between">
      <h1 style="${panelTitle}">Form replies</h1>
      <div class="m-cluster" data-gap="2">${segmented(['Inbox', 'Spam', 'Archived'], 'Inbox', 'Folder')} <button type="button" class="m-button" disabled>${ic('download', 14)} Export</button></div>
    </div>
    <section class="m-card" data-variant="sunken" aria-labelledby="kt-empty" style="flex: 1; min-block-size: 26rem; background-image: radial-gradient(var(--m-color-border-default) 1px, transparent 1px); background-size: 16px 16px">
      <div class="m-card-body m-stack" data-gap="4" data-align="center" style="justify-content: center; min-block-size: 24rem; block-size: 100%; text-align: center">
        <span aria-hidden="true" style="position: relative; display: inline-grid; place-items: center; inline-size: 4rem; block-size: 4rem; border-radius: var(--m-radius-lg); background: var(--m-color-bg-surface); box-shadow: 0 0 0 1px var(--m-color-border-focus), 0 0 0 6px var(--m-color-brand-subtle); color: var(--m-color-fg-default)">${ic('mail', 28)}<span style="position: absolute; inset-block-start: -0.5rem; inset-inline-end: -0.5rem; inline-size: 1rem; block-size: 1rem; border-radius: var(--m-radius-full); background: ${glow}"></span></span>
        <div class="m-stack" data-gap="2" data-align="center">
          <h2 id="kt-empty" style="font-size: var(--m-font-size-lg); ${strong}">No replies yet</h2>
          <p class="m-muted" style="${ui}; max-inline-size: 22rem">When someone sends a form on your site, it lands here and in your email. Add a form to a page to start collecting.</p>
        </div>
        <div class="m-cluster" data-gap="2" data-justify="center">
          <button type="button" class="m-button" data-variant="primary">${ic('plus', 14)} Add a form to a page</button>
          <button type="button" class="m-button">How forms work</button>
        </div>
        <span style="${meta}" class="m-cluster" data-gap="1">Or press ${kbd('F')} on the canvas</span>
      </div>
    </section>`,
);

/* ---------------------------------------------------------------- pricing */

type Plan = [string, string, string, string, string[], 'primary' | 'secondary' | 'inverse', string];
const plans: Plan[] = [
  [
    'Draft',
    'Try it out',
    '$0',
    '',
    ['1 site on a glider.site address', '2 GB bandwidth', 'Up to 5 pages', 'Community help'],
    'secondary',
    'Start drafting',
  ],
  [
    'Solo',
    'One site, your address',
    '$12',
    'per month',
    ['Your own domain', '40 GB bandwidth', '2 collections', 'Search settings', 'Form replies by email'],
    'secondary',
    'Choose Solo',
  ],
  [
    'Studio',
    'Sites that grow',
    '$28',
    'per month',
    [
      'Everything in Solo',
      '150 GB bandwidth',
      '12 collections',
      'Preview links for clients',
      'Scheduled publishing',
      'Three languages',
      'Visitor insights',
    ],
    'primary',
    'Choose Studio',
  ],
  [
    'Label',
    'Many sites, one team',
    'Let’s talk',
    '',
    ['Shared components', 'Single sign-on', 'Review before publish', 'Uptime commitment', 'A named contact'],
    'secondary',
    'Talk to us',
  ],
];
const planCol = (
  [name, sub, price, per, features, variant, cta]: Plan,
  i: number,
) => `<div class="m-stack" data-gap="5" style="flex: 1 1 15rem; padding: var(--m-space-5); ${i > 0 ? `border-inline-start: ${line};` : ''} border-block-end: ${line}">
          <div class="m-stack" data-gap="0" style="font-size: var(--m-font-size-xl)"><h2 style="font-size: inherit; font-weight: var(--m-font-weight-regular); letter-spacing: -0.01em">${name}</h2><span class="m-muted">${sub}</span></div>
          <div class="m-cluster" data-gap="2" data-align="baseline" style="padding-block: var(--m-space-4); border-block: ${line}"><span style="font-size: var(--m-font-size-xl); ${num}">${price}</span>${per ? `<span class="m-muted" style="font-size: 0.875rem">${per}</span>` : ''}${variant === 'primary' ? '<span class="m-badge" data-tone="info" style="margin-inline-start: auto">Most picked</span>' : ''}</div>
          <ul class="m-stack" data-gap="2" style="padding: 0; list-style: none; font-size: 0.875rem; flex: 1">
            ${features.map((f) => `<li class="m-cluster" data-gap="2" style="flex-wrap: nowrap; color: var(--m-color-fg-muted)">${ic('check', 12)} ${f}</li>`).join('\n            ')}
          </ul>
          <a href="#" class="m-button" data-size="lg"${variant === 'primary' ? ' data-variant="primary"' : ''} style="inline-size: 100%; font-size: 0.875rem; font-weight: var(--m-font-weight-regular)">${cta}</a>
        </div>`;
const compare = (feature: string, sub: string, cells: string[]) => `<tr>
            <th scope="row" style="font-weight: var(--m-font-weight-regular)"><span class="m-stack" data-gap="0"><span>${feature}</span><span class="m-muted">${sub}</span></span></th>
            ${cells.map((c) => `<td style="text-align: center">${c === 'yes' ? `<span style="display: inline-flex">${ic('check', 14, 'Included')}</span>` : c === 'no' ? `<span style="display: inline-flex; color: var(--m-color-fg-subtle)">${ic('x', 14, 'Not included')}</span>` : c}</td>`).join('')}
          </tr>`;
const faq = (q: string, a: string, open = false) =>
  `<details class="m-accordion-item"${open ? ' open' : ''}><summary>${q}</summary><div class="m-accordion-content"><p>${a}</p></div></details>`;

const pricing = `<div style="min-block-size: 100vh; background: var(--m-color-bg-sunken); overflow: hidden">
  <header class="m-navbar" data-sticky data-translucent>
    <a class="m-navbar-brand" href="#">${mark()} Glider</a>
    <nav class="m-navbar-nav" aria-label="Main">
      <a class="m-navbar-link" href="#">Changelog</a>
      <a class="m-navbar-link" href="#">Showcase</a>
      <a class="m-navbar-link" href="#">Careers</a>
      <a class="m-navbar-link" href="#" aria-current="page">Pricing</a>
    </nav>
    <div class="m-navbar-actions">
      <a class="m-navbar-link" href="#" style="color: var(--m-color-fg-muted)">Log in</a>
      <a class="m-button" href="#" style="background: var(--m-color-fg-default); color: var(--m-color-bg-sunken); font-size: 0.875rem; font-weight: var(--m-font-weight-regular)">Sign up</a>
    </div>
  </header>
  <main class="m-container" style="position: relative; padding-block: var(--m-space-16) var(--m-space-16)">
    <div aria-hidden="true" style="position: absolute; inset-block-start: 2rem; inset-inline-end: -6rem; inline-size: 34rem; max-inline-size: 90%; block-size: 18rem; border-radius: var(--m-radius-full); background: ${glow}; opacity: 0.28; filter: blur(80px)"></div>
    <div class="m-stack" data-gap="16" style="position: relative">
      <div class="m-cluster" data-justify="between" data-align="end" data-gap="6">
        <h1 style="${display('4xl')}; max-inline-size: 12ch">Free to start, <span style="background: ${glow}; -webkit-background-clip: text; background-clip: text; color: transparent">built to launch</span></h1>
        <label class="m-cluster" data-gap="2" style="font-size: 0.875rem; color: var(--m-color-fg-muted)">Annual billing <input type="checkbox" role="switch" class="m-switch" data-size="sm" checked></label>
      </div>
      <div class="m-stack" data-gap="6">
        <div class="m-cluster" data-gap="0" data-align="stretch" style="border: ${line}; border-radius: 16px; overflow: hidden; background: var(--m-color-bg-sunken)">
        ${plans.map(planCol).join('\n        ')}
        </div>
        <p class="m-muted" style="text-align: center; font-size: 0.875rem">Extra editors are $15 a month each; people who only comment are free. <a href="#" style="color: var(--m-color-fg-default)">How seats work</a></p>
      </div>
      <section class="m-stack" data-gap="4" aria-labelledby="kt-compare">
        <h2 id="kt-compare" style="${display('3xl')}">Side by side</h2>
        <div class="m-table-wrap" style="border: ${line}; border-radius: 16px">
          <table class="m-table" style="font-size: 0.875rem">
            <thead><tr><th scope="col"><span class="m-sr-only">Feature</span></th><th scope="col" style="text-align: center">Solo</th><th scope="col" style="text-align: center">Studio</th><th scope="col" style="text-align: center">Label</th></tr></thead>
            <tbody>
            ${compare('Pages', 'Designed by hand', ['20', '120', 'No limit'])}
            ${compare('Collection entries', 'Across all collections', ['800', '6,000', 'No limit'])}
            ${compare('Preview links', 'Share a draft before it goes live', ['no', 'yes', 'yes'])}
            ${compare('Scheduled publishing', 'Pick a time for changes to go out', ['no', 'yes', 'yes'])}
            ${compare('Password pages', 'Keep a page for invited people', ['yes', 'yes', 'yes'])}
            </tbody>
          </table>
        </div>
      </section>
      <section class="m-split" style="--m-layout-split-side: 18rem; --m-layout-split-gap: var(--m-space-8)" aria-labelledby="kt-faq">
        <h2 id="kt-faq" style="${display('3xl')}">Questions</h2>
        <div class="m-accordion">
          ${faq('Can I change plans later?', 'Yes. Moving up takes effect at once and is prorated; moving down applies from your next bill.', true)}
          ${faq('What happens when I go over my bandwidth?', 'Nothing switches off. We email you at 80% and 100%, and extra bandwidth is billed in 50 GB steps.')}
          ${faq('Do I need a plan to try things?', 'No. Draft is free for as long as you like, with the full canvas and every component.')}
          ${faq('Is there a discount for students and non-profits?', 'Yes, half off Solo and Studio. Write to us from your school or organisation address.')}
        </div>
      </section>
    </div>
  </main>
</div>`;

/* ---------------------------------------------------------------- errors */

const pageError = (g: string, code: string, title: string, text: string, actions: string) =>
  `<section class="m-card" data-variant="sunken" aria-labelledby="kt-e${code}" style="flex: 1 1 15rem">
          <div class="m-card-body m-stack" data-gap="3" data-align="center" style="text-align: center; padding-block: var(--m-space-10)">
            <span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: 3rem; block-size: 3rem; border-radius: var(--m-radius-lg); background: var(--m-color-bg-surface); color: var(--m-color-fg-muted)">${ic(g, 24)}</span>
            <span style="font-family: var(--m-font-family-mono); ${meta}">${code}</span>
            <h3 id="kt-e${code}" style="font-size: var(--m-font-size-lg); ${strong}">${title}</h3>
            <p class="m-muted" style="${ui}; max-inline-size: 18rem">${text}</p>
            <div class="m-cluster" data-gap="2" data-justify="center">${actions}</div>
          </div>
        </section>`;

const errors = shell(
  'Pages',
  `    <h1 style="${panelTitle}">When things go wrong</h1>
    <div class="m-alert" data-tone="danger" role="alert">
      <span class="m-alert-icon">${ic('circle-alert', 16)}</span>
      <div class="m-alert-content">
        <p class="m-alert-title">Publish stopped: 2 pages need a fix</p>
        <p class="m-alert-body">The live site wasn’t changed. Fix the fields marked below, then publish again.</p>
        <div class="m-alert-actions"><button type="button" class="m-button" data-size="sm">Show the first one</button></div>
      </div>
    </div>
    <div class="m-cluster" data-gap="3" data-align="start">
      <section class="m-card" aria-labelledby="kt-page" style="flex: 1 1 22rem">
        <div class="m-card-body m-stack" data-gap="3">
          <div class="m-cluster" data-justify="between"><h2 id="kt-page" style="${ui}; ${strong}">Page · /tour</h2><span class="m-badge" data-tone="danger">2 problems</span></div>
          <div class="m-field">
            <label class="m-field-label" for="kt-path">Path</label>
            <input class="m-input" id="kt-path" value="/releases" aria-invalid="true" aria-describedby="kt-path-err">
            <p class="m-field-error" id="kt-path-err">Another page already uses /releases. Try /tour or /tour-dates.</p>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="kt-meta">Search description</label>
            <textarea class="m-input" id="kt-meta" rows="2" aria-invalid="true" aria-describedby="kt-meta-err"></textarea>
            <p class="m-field-error" id="kt-meta-err">Add a description so search can show this page. One sentence is enough.</p>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="kt-redirect">Old address</label>
            <input class="m-input" id="kt-redirect" value="/live" aria-describedby="kt-redirect-hint">
            <p class="m-field-hint" id="kt-redirect-hint">Visitors to this address are sent here.</p>
          </div>
          <div class="m-cluster" data-justify="end" data-gap="2">
            <button type="button" class="m-button" data-variant="ghost">Cancel</button>
            <button type="button" class="m-button" data-variant="primary" aria-busy="true">Publish</button>
          </div>
        </div>
      </section>
      <div class="m-stack" data-gap="3" style="flex: 1 1 18rem">
        <div class="m-alert" data-tone="warning" role="status">
          <span class="m-alert-icon">${ic('triangle-alert', 16)}</span>
          <div class="m-alert-content"><p class="m-alert-title">Two people are editing Home</p><p class="m-alert-body">Ilse’s changes will show up as you work. Nothing will be overwritten.</p></div>
        </div>
        <div class="m-toast-region" data-static aria-live="polite">
          <div class="m-toast" data-tone="danger" role="alert">
            <div class="m-toast-content">
              <p class="m-toast-title" style="color: var(--m-color-danger-fg)">You’re offline</p>
              <p class="m-toast-body">Your edits are kept on this device and will sync when you reconnect.</p>
              <div class="m-toast-actions"><button type="button" class="m-button" data-size="sm">Retry</button></div>
            </div>
            <button type="button" class="m-toast-close" aria-label="Dismiss">${ic('x', 14)}</button>
          </div>
          <div class="m-toast" role="status">
            <div class="m-toast-content">
              <p class="m-toast-title">Image too large</p>
              <p class="m-toast-body">cover-final.tiff is 64 MB; the limit is 20 MB.</p>
              <div class="m-toast-actions"><button type="button" class="m-button" data-size="sm">Choose another</button></div>
            </div>
            <button type="button" class="m-toast-close" aria-label="Dismiss">${ic('x', 14)}</button>
          </div>
        </div>
      </div>
    </div>
    <div class="m-cluster" data-gap="3" data-align="stretch">
      ${pageError('compass', '404', 'This page has flown off', 'Nothing lives at this address any more. It may have been renamed.', '<button type="button" class="m-button" data-variant="primary" data-size="sm">Go to Pages</button>')}
      ${pageError('cloudOff', '500', 'We dropped the string', 'Something broke on our side. Your work is saved; try again in a moment.', '<button type="button" class="m-button" data-size="sm">Try again</button>')}
      ${pageError('lock', '403', 'This site is private', 'Ask an owner of the workspace to invite you.', '<button type="button" class="m-button" data-variant="primary" data-size="sm">Request access</button>')}
    </div>`,
);

export const kiteRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Site overview',
    description:
      'The toolbar, the site panel, the site at three breakpoints in a canvas well, figures in grey cards, a visits line with its tooltip and the unpublished changes.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'Collection and properties',
    description:
      'A collection tree, entries in hairline rows with chips, and a properties panel of 30px rows: inputs with units, steppers, segmented controls, a swatch and a slider.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'New site',
    description:
      'One step on black under a token-drawn glow: display heading, three starting points, a brief and a blue Continue.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Site settings',
    description:
      'A settings window with 18px corners: a left list of sections, label-and-control rows split by hairlines, and a save bar.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'No form replies',
    description: 'A dotted canvas well with a selected-looking tile, one line of help, the blue action and a key hint.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The public site on black: a 54px tight headline with a gradient phrase, plan columns split by hairlines, a blue choice, a comparison and questions.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'A publish blocked by field errors, a warning callout, toasts, and 404, 500 and 403 pages in canvas wells.',
    html: errors,
  },
];
