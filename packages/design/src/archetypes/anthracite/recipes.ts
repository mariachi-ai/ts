import type { ArchetypeRecipe } from '../types';

/*
 * Anthracite's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from a small engineering team's command tool. The
 * reference is a desktop launcher with no web app, so its screens are translated to web layouts:
 * the launcher window becomes a centred panel (the dashboard is a command palette), its list-with-
 * detail view a two-pane page, its forms label-left forms, and its preferences window a settings
 * page with a sidebar. The patterns kept exactly: the big search field, 11px section labels,
 * 40px rows with an icon tile, a muted subtitle and accessories on the right, the selected row in
 * white at 10%, outlined key caps, and a footer bar naming what Enter and ⌘K do.
 */

// Lucide icons, outlined, 1.5px stroke
const icon = (paths: string, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  command: '<path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>',
  pr: '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M6 9v12"/>',
  rocket:
    '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  key: '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  languages:
    '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
  clipboard:
    '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  terminal: '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>',
  sparkles:
    '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  contrast: '<circle cx="12" cy="12" r="10"/><path d="M12 18a6 6 0 0 0 0-12v12z"/>',
  keyboard:
    '<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  branch: '<path d="M6 3v12"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  notebook:
    '<path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M16 2v20"/>',
  dot: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>',
  timer: '<path d="M10 2h4"/><path d="m12 14 3-3"/><circle cx="12" cy="14" r="8"/>',
  activity:
    '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  server:
    '<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',
  compass:
    '<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  quote: '<path d="M17 6H3"/><path d="M21 12H8"/><path d="M21 18H8"/><path d="M3 12v6"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  panel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/>',
  filter: '<path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/>',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  circlePlus: '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>',
  check: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  seal: '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
  x: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  warn: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  pencil:
    '<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/><path d="m15 5 4 4"/>',
  trash:
    '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  copy: '<rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  external: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  arrowDown: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  type: '<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>',
  pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
};
type IconName = keyof typeof I;

// The palette of icon tiles: a status colour with its own text colour on top, or the neutral fill
type Tile = 'brand' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';
const tileColours: Record<Tile, [string, string]> = {
  brand: ['var(--m-color-brand-default)', 'var(--m-color-brand-fg)'],
  info: ['var(--m-color-info-solid)', 'var(--m-color-info-on-solid)'],
  success: ['var(--m-color-success-solid)', 'var(--m-color-success-on-solid)'],
  warning: ['var(--m-color-warning-solid)', 'var(--m-color-warning-on-solid)'],
  danger: ['var(--m-color-danger-solid)', 'var(--m-color-danger-on-solid)'],
  neutral: ['var(--m-color-accent-subtle)', 'var(--m-color-fg-default)'],
};
const tile = (ic: IconName, tone: Tile, size = 20) => {
  const [bg, fg] = tileColours[tone];
  return `<span style="display: inline-flex; flex: none; align-items: center; justify-content: center; inline-size: ${size}px; block-size: ${size}px; border-radius: ${Math.round(size / 4)}px; background: ${bg}; color: ${fg}">${icon(I[ic], Math.round(size * 0.65))}</span>`;
};

// Key caps: one outlined square per key
const keys = (...ks: string[]) => `<span class="m-cluster" data-gap="1" style="display: inline-flex; flex-wrap: nowrap; vertical-align: middle">${ks.map((k) => `<kbd class="m-kbd">${k}</kbd>`).join('')}</span>`;

const muted = 'color: var(--m-color-fg-muted)';
// Selects in bars and settings rows are text and a chevron, with no box until hovered
const ghostSelect = 'inline-size: auto; border-color: transparent; background-color: transparent';
const small = 'font-size: var(--m-font-size-sm)';
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-muted)';
const sectionLabel = (label: string, count?: string) =>
  `<div style="padding: var(--m-space-3) var(--m-space-2) var(--m-space-1); font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-medium); ${muted}">${label}${count ? `<span style="margin-inline-start: var(--m-space-2)">${count}</span>` : ''}</div>`;

// The launcher's page: the canvas under a soft brand glow from the top
const glowPage = (body: string, pad = 'var(--m-space-12)') =>
  `<div style="min-block-size: 100vh; background: radial-gradient(56rem 26rem at 50% -6rem, var(--m-color-brand-subtle), transparent 70%), var(--m-color-bg-canvas); padding-block: ${pad}">
${body}
</div>`;

// The launcher window: a raised panel with a fine edge, 12px corners and the window shadow
const windowPanel = (inner: string, label: string, extra = '') =>
  `<section aria-label="${label}" style="position: relative; display: flex; flex-direction: column; overflow: hidden; border: var(--m-border-width-thin) solid var(--m-color-border-default); border-radius: var(--m-radius-lg); background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-overlay)${extra}">
${inner}
</section>`;

// The search bar: a big field with no box, an optional back key, and a filter on the right
const searchBar = (placeholder: string, opts: { back?: boolean; filter?: string; value?: string; id: string }) =>
  `<div class="m-cluster" data-gap="3" style="flex-wrap: nowrap; min-block-size: 3.5rem; padding-inline: var(--m-space-4); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-muted)">
    ${opts.back ? `<button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Back">${icon(I.back, 16)}</button>` : `<span style="display: inline-flex; ${muted}">${icon(I.search, 18)}</span>`}
    <label class="m-sr-only" for="${opts.id}">Search</label>
    <input id="${opts.id}" type="search" placeholder="${placeholder}"${opts.value ? ` value="${opts.value}"` : ''} style="flex: 1; min-inline-size: 0; border: 0; outline-offset: 4px; background: transparent; color: var(--m-color-fg-default); font: inherit; font-size: 1.125rem; letter-spacing: 0">
    ${opts.filter ? `<select class="m-select" data-size="sm" aria-label="Filter" style="${ghostSelect}">${opts.filter}</select>` : ''}
  </div>`;

// One result row: icon tile, title, muted subtitle, accessories on the right. 40px; the selected
// row in white at 10% with 10px corners
const row = (
  ic: IconName,
  tone: Tile,
  title: string,
  subtitle: string,
  right: string,
  selected = false,
) => `<li role="option" aria-selected="${selected}" class="m-cluster" data-gap="3" style="flex-wrap: nowrap; min-block-size: 2.5rem; padding-inline: var(--m-space-2); border-radius: 10px${selected ? '; background: var(--m-color-accent-subtle)' : ''}">
        ${tile(ic, tone)}
        <span class="m-cluster" data-gap="3" style="flex: 1; min-inline-size: 0; flex-wrap: nowrap; overflow: hidden; white-space: nowrap"><span style="font-weight: var(--m-font-weight-medium)">${title}</span><span style="${muted}; overflow: hidden; text-overflow: ellipsis">${subtitle}</span></span>
        <span class="m-cluster" data-gap="3" style="flex: none; flex-wrap: nowrap; ${muted}; ${small}">${right}</span>
      </li>`;

// The footer bar: what's open on the left; the primary action and Actions ⌘K on the right
const footer = (ic: IconName, tone: Tile, name: string, primary: string, primaryKeys: string[]) =>
  `<div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; min-block-size: 2.5rem; padding-inline: var(--m-space-3); border-block-start: var(--m-border-width-thin) solid var(--m-color-border-muted); background: var(--m-color-bg-raised); ${small}">
    <span class="m-cluster" data-gap="2" style="flex-wrap: nowrap; ${muted}">${tile(ic, tone, 18)} ${name}</span>
    <span class="m-cluster" data-gap="3" style="flex-wrap: nowrap">
      <span class="m-cluster" data-gap="2" style="flex-wrap: nowrap; font-weight: var(--m-font-weight-medium)">${primary} ${keys(...primaryKeys)}</span>
      <span aria-hidden="true" style="inline-size: 1px; block-size: 0.75rem; background: var(--m-color-border-default)"></span>
      <span class="m-cluster" data-gap="2" style="flex-wrap: nowrap; ${muted}">Actions ${keys('⌘', 'K')}</span>
    </span>
  </div>`;

/* ------------------------------------------------------------------------------------------------
 * Dashboard: the command palette, with the action panel open, over a week's numbers
 * --------------------------------------------------------------------------------------------- */

const actionPanel = `<div class="m-popover" data-static style="position: absolute; inset-block-end: 3rem; inset-inline-end: var(--m-space-2); z-index: 1">
      <div class="m-menu" role="menu" aria-label="Actions for Ship to staging">
        <div class="m-menu-label">Ship to staging</div>
        <button type="button" class="m-menu-item" role="menuitem" style="background: var(--m-color-accent-subtle)">${icon(I.rocket, 16)} Run workflow <span class="m-menu-shortcut">${keys('↵')}</span></button>
        <button type="button" class="m-menu-item" role="menuitem">${icon(I.panel, 16)} Show last run <span class="m-menu-shortcut">${keys('⌘', '↵')}</span></button>
        <div class="m-menu-separator" role="separator"></div>
        <button type="button" class="m-menu-item" role="menuitem">${icon(I.pencil, 16)} Edit steps… <span class="m-menu-shortcut">${keys('⌘', 'E')}</span></button>
        <button type="button" class="m-menu-item" role="menuitem">${icon(I.pin, 16)} Unpin <span class="m-menu-shortcut">${keys('⇧', '⌘', 'P')}</span></button>
        <button type="button" class="m-menu-item" role="menuitem">${icon(I.copy, 16)} Copy deeplink <span class="m-menu-shortcut">${keys('⇧', '⌘', 'C')}</span></button>
        <div class="m-menu-separator" role="separator"></div>
        <label class="m-sr-only" for="cb-act-search">Search for actions</label>
        <input id="cb-act-search" type="search" placeholder="Search for actions…" style="inline-size: 100%; min-block-size: 2rem; padding-inline: var(--m-space-2); border: 0; background: transparent; color: var(--m-color-fg-default); font: inherit">
      </div>
    </div>`;

// Bars for the week's runs, drawn in the brand colour
const bars = [18, 26, 22, 31, 28, 12, 9];
const barChart = `<svg viewBox="0 0 140 48" width="100%" preserveAspectRatio="none" style="display: block; block-size: 3rem" role="img" aria-label="Runs per day this week, peaking at 31 on Thursday">${bars
  .map(
    (v, i) =>
      `<rect x="${i * 20 + 2}" y="${48 - v * 1.4}" width="14" height="${v * 1.4}" rx="2" style="fill: var(--m-color-brand-default)"${i === 3 ? '' : ' opacity="0.45"'}/>`,
  )
  .join('')}</svg>`;

const stat = (labelText: string, value: string, note: string, extra = '') =>
  `<section class="m-card" data-size="sm" aria-label="${labelText}">
      <div class="m-card-body m-stack" data-gap="2">
        <span style="font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-medium); ${muted}">${labelText}</span>
        <span style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-semibold); font-variant-numeric: tabular-nums">${value}</span>
        <span style="${small}; ${muted}">${note}</span>
        ${extra}
      </div>
    </section>`;

const dashboard = glowPage(`<main class="m-container" data-size="md" style="--m-layout-container-max-md: 50rem">
  <div class="m-stack" data-gap="8">
    <div class="m-cluster" data-justify="between">
      <span class="m-cluster" data-gap="2"><span class="m-avatar" data-size="md" style="border-radius: var(--m-radius-md)">SL</span><span class="m-stack" data-gap="0"><strong style="font-weight: var(--m-font-weight-medium)">Saltmarsh Labs</strong><span style="${small}; ${muted}">Platform team</span></span></span>
      <span class="m-cluster" data-gap="2" style="${small}; ${muted}">Open from anywhere ${keys('⌥', 'Space')}</span>
    </div>
    ${windowPanel(
      `  ${searchBar('Search workflows, links and snippets…', { id: 'cb-root-search', filter: '<option>All types</option><option>Workflows</option><option>Links</option><option>Snippets</option>' })}
  <div style="padding: var(--m-space-1) var(--m-space-2) var(--m-space-2)">
    ${sectionLabel('Pinned')}
    <ul role="listbox" aria-label="Pinned" style="margin: 0; padding: 0; list-style: none">
      ${row('rocket', 'brand', 'Ship to staging', 'Deploys', `<span class="m-badge" data-tone="success">Passing</span><span>Workflow</span>`, true)}
      ${row('pr', 'info', 'Review queue', 'Code host', `<span style="font-variant-numeric: tabular-nums">7 open</span><span>Workflow</span>`)}
      ${row('book', 'neutral', 'Search runbooks', 'Docs', '<span>Workflow</span>')}
      ${row('key', 'warning', 'Rotate a token', 'Secrets', `${keys('⌃', 'R')}<span>Script</span>`)}
    </ul>
    ${sectionLabel('Recent')}
    <ul role="listbox" aria-label="Recent" style="margin: 0; padding: 0; list-style: none">
      ${row('calendar', 'danger', 'On-call this week', 'Schedules', '<span>Link</span>')}
      ${row('languages', 'success', 'Translate selection', 'Language', '<span>Workflow</span>')}
      ${row('quote', 'neutral', 'Incident update template', 'Snippets', `<span style="font-family: var(--m-font-family-mono)">;inc</span><span>Snippet</span>`)}
      ${row('sparkles', 'brand', 'Explain this stack trace', 'Assistant', '<span>Prompt</span>')}
    </ul>
  </div>
  ${actionPanel}
  ${footer('rocket', 'brand', 'Ship to staging', 'Run Workflow', ['↵'])}`,
      'Command palette',
    )}
    <section class="m-stack" data-gap="3" aria-labelledby="cb-week">
      <div class="m-cluster" data-justify="between">
        <h2 id="cb-week" style="font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-medium); ${muted}">This week</h2>
        <a href="#" class="m-cluster" data-gap="1" style="${small}; color: var(--m-color-accent-text); text-decoration: none">All activity ${icon(I.right, 14)}</a>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 13rem; --m-layout-grid-gap: var(--m-space-4)">
        ${stat('Workflow runs', '146', '31 on Thursday, the busiest day', barChart)}
        ${stat('Time saved', '9 h 40 m', 'Against doing each step by hand')}
        ${stat('Failed runs', '3', '<span style="color: var(--m-color-danger-fg)">2 from Rotate a token</span>')}
      </div>
    </section>
  </div>
</main>`);

/* ------------------------------------------------------------------------------------------------
 * List and detail: a list beside a detail pane with markdown on top and metadata below
 * --------------------------------------------------------------------------------------------- */

const meta = (k: string, v: string) =>
  `<div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; min-block-size: 1.75rem; padding-inline: var(--m-space-2); border-radius: var(--m-radius-sm); ${small}"><dt style="${muted}">${k}</dt><dd style="margin: 0; text-align: end">${v}</dd></div>`;

const issue = (id: string, title: string, right: string, tone: Tile, selected = false) =>
  row(tone === 'danger' ? 'dot' : tone === 'warning' ? 'timer' : 'check', tone, title, `<span style="font-family: var(--m-font-family-mono); ${small}">${id}</span>`, right, selected);

const listDetail = glowPage(
  `<main class="m-container" style="--m-layout-container-max-lg: 66rem">
  ${windowPanel(
    `  ${searchBar('Search incidents…', { id: 'cb-inc-search', back: true, filter: '<option>All services</option><option>Checkout</option><option>Search API</option><option>Billing worker</option>' })}
  <div class="m-split" style="--m-layout-split-side: 22rem; --m-layout-split-gap: 0; flex: 1">
    <div style="padding: var(--m-space-1) var(--m-space-2) var(--m-space-2); border-inline-end: var(--m-border-width-thin) solid var(--m-color-border-muted)">
      ${sectionLabel('Assigned to me', '3')}
      <ul role="listbox" aria-label="Assigned to me" style="margin: 0; padding: 0; list-style: none">
        ${issue('INC-482', 'Checkout p95 above 2 s', '<span class="m-avatar" data-size="sm">TO</span>', 'danger', true)}
        ${issue('INC-479', 'Search API 5xx spike', '<span>2h</span>', 'warning')}
        ${issue('INC-471', 'Stale cache on pricing page', '<span>1d</span>', 'warning')}
      </ul>
      ${sectionLabel('Resolved this week', '4')}
      <ul role="listbox" aria-label="Resolved this week" style="margin: 0; padding: 0; list-style: none">
        ${issue('INC-466', 'Webhook retries piling up', '<span>Mon</span>', 'success')}
        ${issue('INC-463', 'Billing worker memory leak', '<span>Mon</span>', 'success')}
        ${issue('INC-460', 'Expired cert on status page', '<span>Sun</span>', 'success')}
        ${issue('INC-458', 'Slow cold starts in eu-west', '<span>Sat</span>', 'success')}
      </ul>
    </div>
    <article class="m-stack" data-gap="4" aria-labelledby="cb-inc-title" style="padding: var(--m-space-5)">
      <div class="m-stack" data-gap="2">
        <h1 id="cb-inc-title" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold)">Checkout p95 above 2 s</h1>
        <p class="m-muted">Latency on <code class="m-code-inline">POST /cart/confirm</code> climbed after the 14:05 deploy. Rolling back the payment client to 4.18 brought p50 down; p95 is still high on cold instances.</p>
        <ul class="m-stack" data-gap="1" style="margin: 0; padding-inline-start: var(--m-space-5)">
          <li>Pin the client until the retry change is reviewed</li>
          <li>Warm two extra instances before the evening peak</li>
        </ul>
      </div>
      <dl class="m-stack" data-gap="0" style="${hair}; padding-block-start: var(--m-space-3)">
        <div style="padding: 0 var(--m-space-2) var(--m-space-1); font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-medium); ${muted}">Information</div>
        ${meta('Status', '<span class="m-badge" data-tone="danger">Open</span>')}
        ${meta('Severity', '<span class="m-badge" data-tone="warning">Sev 2</span>')}
        ${meta('Owner', '<span class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span class="m-avatar" data-size="sm">TO</span>Theo Okafor</span>')}
        ${meta('Service', 'Checkout')}
        ${meta('Opened', 'Today at 14:22')}
        ${meta('Labels', '<span class="m-cluster" data-gap="1" data-justify="end"><span class="m-badge" data-tone="info">latency</span><span class="m-badge">payments</span></span>')}
      </dl>
    </article>
  </div>
  ${footer('activity', 'danger', 'Search incidents', 'Open Incident', ['↵'])}`,
    'Incidents',
  )}
</main>`,
  'var(--m-space-10)',
);

/* ------------------------------------------------------------------------------------------------
 * Onboarding: one step in the launcher's own window: a hotkey recorder, then label-left fields
 * --------------------------------------------------------------------------------------------- */

const formRow = (labelHtml: string, control: string) =>
  `<div class="m-split" style="--m-layout-split-side: 9rem; --m-layout-split-gap: var(--m-space-4); align-items: center">
        <div style="text-align: end; ${small}; ${muted}">${labelHtml}</div>
        <div>${control}</div>
      </div>`;

const onboarding = glowPage(`<main class="m-container" data-size="md" style="--m-layout-container-max-md: 40rem">
  ${windowPanel(
    `  <div class="m-cluster" data-justify="between" style="min-block-size: 3.5rem; padding-inline: var(--m-space-4); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-muted)">
    <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Back">${icon(I.back, 16)}</button>
    <span id="cb-onb-step" style="${small}; ${muted}">Step 2 of 4</span>
  </div>
  <progress class="m-progress" data-size="sm" value="2" max="4" aria-labelledby="cb-onb-step" style="border-radius: 0">2 of 4</progress>
  <form class="m-stack" data-gap="6" aria-labelledby="cb-onb-title" style="padding: var(--m-space-8) var(--m-space-6)">
    <div class="m-stack" data-gap="2" data-align="center" style="text-align: center">
      <h1 id="cb-onb-title" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-semibold)">Pick a hotkey</h1>
      <p class="m-muted" style="max-inline-size: 26rem">Press it from any app to open the palette. Something you can reach with one hand works best.</p>
    </div>
    <div class="m-stack" data-gap="3" data-align="center" style="padding: var(--m-space-6); border: var(--m-border-width-thin) solid var(--m-color-border-default); border-radius: var(--m-radius-lg); background: var(--m-color-bg-canvas)">
      <span style="${small}; ${muted}">Recording…</span>
      <span class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-xl)"><kbd class="m-kbd" style="--m-kbd-height: 2.5rem; --m-kbd-padding-x: 0.75rem; font-size: var(--m-font-size-lg)">⌥</kbd><kbd class="m-kbd" style="--m-kbd-height: 2.5rem; --m-kbd-padding-x: 1rem; font-size: var(--m-font-size-lg)">Space</kbd></span>
      <span class="m-cluster" data-gap="1" style="${small}; ${muted}">Press ${keys('⌫')} to clear</span>
    </div>
    <div class="m-stack" data-gap="4">
      ${formRow('<label for="cb-onb-theme">Appearance</label>', '<select class="m-select" id="cb-onb-theme"><option>Follow the system</option><option>Always dark</option><option>Always light</option></select>')}
      ${formRow('<span id="cb-onb-size">Window</span>', `<div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-labelledby="cb-onb-size"><button type="button" class="m-tab" role="tab" aria-selected="true">Compact</button><button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Roomy</button></div></div>`)}
      ${formRow('<span>Start up</span>', '<label class="m-field" data-layout="inline"><input class="m-checkbox" type="checkbox" checked> Open when I log in</label>')}
    </div>
  </form>
  <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; min-block-size: 2.5rem; padding-inline: var(--m-space-3); border-block-start: var(--m-border-width-thin) solid var(--m-color-border-muted); background: var(--m-color-bg-raised); ${small}">
    <span class="m-cluster" data-gap="2" style="${muted}">${tile('zap', 'brand', 18)} Setup</span>
    <span class="m-cluster" data-gap="3" style="flex-wrap: nowrap">
      <span class="m-cluster" data-gap="2" style="${muted}">Skip ${keys('esc')}</span>
      <span aria-hidden="true" style="inline-size: 1px; block-size: 0.75rem; background: var(--m-color-border-default)"></span>
      <button type="submit" class="m-button" data-variant="primary" data-size="sm">Continue <span style="--m-kbd-fg: currentColor; --m-kbd-border: currentColor; display: inline-flex">${keys('↵')}</span></button>
    </span>
  </div>`,
    'Setup',
  )}
</main>`);

/* ------------------------------------------------------------------------------------------------
 * Settings: the preferences window as a page: a sidebar of icon tiles, grouped panels of rows
 * --------------------------------------------------------------------------------------------- */

const navItem = (ic: IconName, tone: Tile, label: string, current: string) =>
  `<li><a class="m-sidebar-link" href="#"${label === current ? ' aria-current="page"' : ''}>${tile(ic, tone)} ${label}</a></li>`;

const setRow = (title: string, desc: string, control: string, first = false) =>
  `<div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; gap: var(--m-space-6); padding: var(--m-space-3) var(--m-space-4)${first ? '' : `; ${hair}`}">
          <div class="m-stack" data-gap="1"><span>${title}</span>${desc ? `<span style="${small}; ${muted}">${desc}</span>` : ''}</div>
          <div style="flex: none">${control}</div>
        </div>`;

const group = (heading: string, rows: string, id: string) =>
  `<section class="m-stack" data-gap="2" aria-labelledby="${id}">
        ${heading ? `<h2 id="${id}" style="padding-inline: var(--m-space-4); font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-medium)">${heading}</h2>` : `<h2 id="${id}" class="m-sr-only">General</h2>`}
        <div style="border-radius: var(--m-radius-lg); background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-sm)">
        ${rows}
        </div>
      </section>`;

const sw = (label: string, on = true) =>
  `<input class="m-switch" type="checkbox" role="switch" aria-label="${label}"${on ? ' checked' : ''}>`;

const preview = (labelText: string, roomy: boolean, selected: boolean) =>
  `<label class="m-stack" data-gap="2" data-align="center" style="${small}">
            <span aria-hidden="true" style="display: block; inline-size: 7rem; padding: var(--m-space-2); border-radius: var(--m-radius-md); background: var(--m-color-bg-canvas); border: var(--m-border-width-thick) solid ${selected ? 'var(--m-color-border-focus)' : 'var(--m-color-border-muted)'}">
              <span style="display: block; block-size: 0.375rem; inline-size: 60%; border-radius: 2px; background: var(--m-color-fg-subtle)"></span>
              ${roomy ? '<span style="display: block; margin-block-start: 0.375rem; block-size: 0.375rem; border-radius: 2px; background: var(--m-color-accent-subtle)"></span><span style="display: block; margin-block-start: 0.25rem; block-size: 0.375rem; inline-size: 80%; border-radius: 2px; background: var(--m-color-accent-subtle)"></span><span style="display: block; margin-block-start: 0.25rem; block-size: 0.375rem; inline-size: 70%; border-radius: 2px; background: var(--m-color-accent-subtle)"></span>' : ''}
            </span>
            <span class="m-cluster" data-gap="1"><input class="m-radio" type="radio" name="cb-set-mode"${selected ? ' checked' : ''}> ${labelText}</span>
          </label>`;

const settings = `<div class="m-split" style="--m-layout-split-side: 13rem; --m-layout-split-gap: 0; min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  <nav class="m-sidebar" aria-label="Settings" style="border-inline-end: var(--m-border-width-thin) solid var(--m-color-border-muted)">
    <a href="#" class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding: var(--m-space-2); color: var(--m-color-fg-default); text-decoration: none">
      <span class="m-avatar" data-size="lg" style="background: var(--m-color-brand-subtle)">TO</span>
      <span class="m-stack" data-gap="0"><span>Theo Okafor</span><span style="${small}; ${muted}">Profile</span></span>
    </a>
    <div class="m-sidebar-section">
      <ul>
        ${navItem('contrast', 'neutral', 'Appearance', 'Appearance')}
        ${navItem('keyboard', 'neutral', 'Hotkeys', 'Appearance')}
        ${navItem('search', 'neutral', 'Search', 'Appearance')}
        ${navItem('cloud', 'neutral', 'Sync', 'Appearance')}
        ${navItem('shield', 'neutral', 'Privacy', 'Appearance')}
        ${navItem('card', 'neutral', 'Billing', 'Appearance')}
      </ul>
    </div>
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Integrations</h2>
      <ul>
        ${navItem('sparkles', 'brand', 'Assistant', 'Appearance')}
        ${navItem('calendar', 'danger', 'Calendar', 'Appearance')}
        ${navItem('branch', 'info', 'Code host', 'Appearance')}
        ${navItem('activity', 'warning', 'Incidents', 'Appearance')}
        ${navItem('chat', 'success', 'Team chat', 'Appearance')}
        ${navItem('notebook', 'neutral', 'Notes vault', 'Appearance')}
      </ul>
    </div>
  </nav>
  <div>
  <main class="m-container" data-size="md" style="--m-layout-container-max-md: 46rem; padding-block: var(--m-space-5) var(--m-space-12)">
    <div class="m-stack" data-gap="6">
      <div class="m-cluster" data-gap="3">
        <span class="m-cluster" data-gap="0" style="border: var(--m-border-width-thin) solid var(--m-color-border-default); border-radius: var(--m-radius-full)">
          <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Back" style="border-radius: var(--m-radius-full)">${icon(I.left, 16)}</button>
          <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Forward" disabled style="border-radius: var(--m-radius-full)">${icon(I.right, 16)}</button>
        </span>
        <h1 style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-semibold)">Appearance</h1>
      </div>
      ${group(
        '',
        `${setRow('Open at login', '', sw('Open at login'), true)}
        ${setRow('Show in the menu bar', '', sw('Show in the menu bar'))}
        ${setRow('Palette hotkey', 'Opens the palette from any app.', `<span class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${keys('⌥', 'Space')}<button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Record a new hotkey">${icon(I.refresh, 14)}</button></span>`)}`,
        'cb-set-general',
      )}
      ${group(
        'Theme',
        `${setRow('Follow the system', 'Switch between your dark and light themes with the system.', sw('Follow the system'), true)}
        ${setRow('Dark theme', '', `<select class="m-select" data-size="sm" aria-label="Dark theme" style="${ghostSelect}"><option>Anthracite dark</option><option>Graphite</option><option>Midnight</option></select>`)}
        ${setRow('Light theme', '', `<select class="m-select" data-size="sm" aria-label="Light theme" style="${ghostSelect}"><option>Anthracite light</option><option>Paper</option></select>`)}
        ${setRow('Text size', 'The size of text in the palette and its windows.', `<div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Text size"><button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1" style="font-size: var(--m-font-size-xs)">Aa</button><button type="button" class="m-tab" role="tab" aria-selected="true">Aa</button><button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1" style="font-size: var(--m-font-size-lg)">Aa</button></div></div>`)}`,
        'cb-set-theme',
      )}
      ${group(
        'Window',
        `${setRow('Window size', 'Compact shows only the search bar until you type.', `<div class="m-cluster" data-gap="4" role="radiogroup" aria-label="Window size">${preview('Compact', false, false)}${preview('Roomy', true, true)}</div>`, true)}
        ${setRow('Show pinned items when compact', '', sw('Show pinned items when compact', false))}`,
        'cb-set-window',
      )}
      <section class="m-stack" data-gap="2" aria-labelledby="cb-set-out">
        <h2 id="cb-set-out" class="m-sr-only">Session</h2>
        <div class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-4); border-radius: var(--m-radius-lg); background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-sm)">
          <div class="m-stack" data-gap="1"><span>Sign out on this Mac</span><span style="${small}; ${muted}">Pinned items and snippets stay synced to your account.</span></div>
          <button type="button" class="m-button" data-variant="danger" data-size="sm">Sign out</button>
        </div>
      </section>
    </div>
  </main>
  </div>
</div>`;

/* ------------------------------------------------------------------------------------------------
 * Empty state: the launcher with nothing to list yet
 * --------------------------------------------------------------------------------------------- */

const emptyState = glowPage(`<main class="m-container" data-size="md" style="--m-layout-container-max-md: 46rem">
  ${windowPanel(
    `  ${searchBar('Search snippets…', { id: 'cb-empty-search', back: true, filter: '<option>All folders</option>' })}
  <div class="m-stack" data-gap="3" data-align="center" style="padding: var(--m-space-16) var(--m-space-6); text-align: center">
    <span style="${muted}">${icon(I.quote, 32)}</span>
    <h1 style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-medium)">No snippets yet</h1>
    <p style="max-inline-size: 22rem; ${small}; ${muted}">Snippets expand short keywords into longer text in any app. Press ${keys('↵')} to write your first one.</p>
    <div class="m-cluster" data-gap="2" data-justify="center" style="margin-block-start: var(--m-space-2)">
      <button type="button" class="m-button" data-variant="primary" data-size="sm">${icon(I.plus, 14)} Create snippet</button>
      <button type="button" class="m-button" data-size="sm">Import from a file</button>
    </div>
  </div>
  ${footer('quote', 'neutral', 'Search snippets', 'Create Snippet', ['↵'])}`,
    'Snippets',
  )}
</main>`);

/* ------------------------------------------------------------------------------------------------
 * Pricing: the marketing site: the floating header, a red glow, a billing switch and three plans
 * --------------------------------------------------------------------------------------------- */

const feature = (title: string, desc = '', badge = '', dim = false) =>
  `<li class="m-cluster" data-gap="2" data-align="start" style="flex-wrap: nowrap${dim ? `; ${muted}` : ''}"><span style="display: inline-flex; padding-block-start: 0.15rem">${icon(dim ? I.circlePlus : I.check, 15)}</span><span class="m-stack" data-gap="1"><span class="m-cluster" data-gap="2">${title}${badge}</span>${desc ? `<span style="${muted}">${desc}</span>` : ''}</span></li>`;

const plan = (
  name: string,
  intro: string,
  price: string,
  unit: string,
  billed: string,
  button: string,
  features: string,
  opts: { featured?: boolean; seal?: boolean; tiers?: string } = {},
) => `<section class="m-stack" data-gap="6" aria-label="${name}" style="padding: var(--m-space-8); border: var(--m-border-width-thin) solid ${opts.featured ? 'var(--m-color-border-default)' : 'var(--m-color-border-muted)'}; border-radius: var(--m-radius-lg); background: ${opts.featured ? 'linear-gradient(137deg, var(--m-color-bg-raised), var(--m-color-bg-surface) 76%)' : 'var(--m-color-bg-canvas)'}${opts.featured ? '; box-shadow: var(--m-shadow-overlay); margin-block: calc(var(--m-space-2) * -1)' : ''}">
        <div class="m-cluster" data-justify="between" data-align="start" style="flex-wrap: nowrap">
          <div class="m-stack" data-gap="1">
            <h2 style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-medium)">${name}</h2>
            <p style="${muted}">${intro}</p>
          </div>
          ${opts.seal ? `<span style="color: var(--m-color-info-fg)">${icon(I.seal, 28)}</span>` : ''}
        </div>
        ${opts.tiers ?? '<div style="block-size: 2.375rem" aria-hidden="true"></div>'}
        <div class="m-stack" data-gap="2">
          <div class="m-cluster" data-gap="3" data-align="baseline"><span style="font-size: var(--m-font-size-4xl); font-weight: var(--m-font-weight-semibold); line-height: 1; font-variant-numeric: tabular-nums">${price}</span><span style="font-family: var(--m-font-family-mono); ${small}; ${muted}">${unit}</span></div>
          <span style="font-family: var(--m-font-family-mono); ${small}; ${muted}; min-block-size: 1.25rem">${billed}</span>
        </div>
        ${button}
        <ul class="m-stack" data-gap="3" style="margin: 0; padding: 0; list-style: none; ${small}">
${features}
        </ul>
      </section>`;

const pricing = `<div style="position: relative; min-block-size: 100vh; overflow: hidden; background: var(--m-color-bg-canvas)">
  <div aria-hidden="true" style="position: absolute; inset: -12rem -10% auto; block-size: 44rem; background: repeating-linear-gradient(135deg, transparent 0 1.5rem, var(--m-color-brand-default) 1.5rem 4.5rem, transparent 4.5rem 8rem); opacity: 0.85; filter: blur(22px); mask-image: radial-gradient(30rem 16rem at 50% 45%, var(--m-color-fg-default), transparent); pointer-events: none"></div>
  <div class="m-container" style="position: relative; padding-block-start: var(--m-space-4)">
    <header class="m-navbar" style="border: var(--m-border-width-thin) solid var(--m-color-border-muted); border-radius: var(--m-radius-lg)">
      <a class="m-navbar-brand" href="#" style="display: inline-flex; align-items: center; gap: var(--m-space-2)">${tile('command', 'brand', 22)} Switchback</a>
      <nav class="m-navbar-nav" aria-label="Main">
        <a class="m-navbar-link" href="#">Features</a>
        <a class="m-navbar-link" href="#">Integrations</a>
        <a class="m-navbar-link" href="#">Changelog</a>
        <a class="m-navbar-link" href="#">Docs</a>
        <a class="m-navbar-link" href="#" aria-current="page">Pricing</a>
      </nav>
      <div class="m-navbar-actions">
        <a class="m-button" data-variant="ghost" href="#">Sign in</a>
        <a class="m-button" data-variant="primary" href="#">${icon(I.download, 14)} Get the app</a>
      </div>
    </header>
  </div>
  <main class="m-container" style="position: relative; padding-block: var(--m-space-12) var(--m-space-16)">
    <div class="m-stack" data-gap="10">
      <div class="m-stack" data-gap="6" data-align="center" style="text-align: center">
        <h1 style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-semibold); line-height: var(--m-font-leading-tight)">Pay for the hours it gives back</h1>
        <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Billing period">
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Monthly</button>
          <button type="button" class="m-tab" role="tab" aria-selected="true">Yearly <span class="m-badge" data-variant="solid" style="font-family: var(--m-font-family-mono)">−15%</span></button>
        </div></div>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 18rem; --m-layout-grid-gap: 0">
${plan(
  'Solo',
  'The palette, snippets and links, for one person.',
  '$0',
  '/ month',
  '',
  '<a class="m-button" href="#" style="inline-size: 100%">Get the app</a>',
  [
    feature('Everything in the palette', 'Workflows, links, snippets, calculator, window layouts.'),
    feature('Clipboard history for 7 days'),
    feature('Two synced devices'),
    feature('Community integrations'),
  ].join('\n'),
)}
${plan(
  'Plus',
  'The assistant and unlimited history.',
  '$10',
  '/ month',
  '<s>$144</s> $120 billed yearly',
  `<a class="m-button" data-variant="primary" href="#" style="inline-size: 100%">${icon(I.seal, 14)} Try it for 14 days</a>`,
  [
    feature('Everything in Solo', '', '', true),
    feature('Assistant in every window', 'Ask about a selection, a file or the screen, with 800 credits a month.'),
    feature('Your own model keys', 'Bring a key from a provider you already pay for.', '<span class="m-badge" data-tone="info" data-variant="outline">New</span>'),
    feature('Unlimited clipboard history'),
    feature('Custom themes'),
  ].join('\n'),
  {
    featured: true,
    seal: true,
    tiers: `<div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Plus tier" style="display: grid; grid-template-columns: 1fr 1fr 1fr"><button type="button" class="m-tab" role="tab" aria-selected="true">Plus</button><button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Plus+</button><button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Unlimited</button></div></div>`,
  },
)}
${plan(
  'Crew',
  'Shared workflows for a whole team.',
  '$15',
  '/ seat / month',
  '<s>$216</s> $180 billed yearly',
  `<a class="m-button" href="#" style="inline-size: 100%">${icon(I.users, 14)} Start a crew</a>`,
  [
    feature('Everything in Plus', '', '', true),
    feature('Shared workflows and snippets', 'One library the team edits together.'),
    feature('A private integration store'),
    feature('Seat management and roles'),
  ].join('\n'),
)}
      </div>
      <a href="#" class="m-cluster" data-gap="1" data-justify="center" style="${small}; ${muted}; text-decoration: none">Compare every feature ${icon(I.arrowDown, 14)}</a>
      <section class="m-stack" data-gap="3" aria-labelledby="cb-faq" style="max-inline-size: 44rem; margin-inline: auto; inline-size: 100%">
        <h2 id="cb-faq" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-medium)">Questions</h2>
        <div class="m-accordion">
          <details class="m-accordion-item" name="cb-faq" open><summary>What counts as a credit?</summary><div class="m-accordion-content">One question to a fast model is one credit; the largest models take more. The count is shown before you send.</div></details>
          <details class="m-accordion-item" name="cb-faq"><summary>Can I move between plans?</summary><div class="m-accordion-content">Yes. Upgrades start at once with the difference prorated; downgrades take effect at the end of the period.</div></details>
          <details class="m-accordion-item" name="cb-faq"><summary>Is there a discount for students?</summary><div class="m-accordion-content">Plus is free for a year with a school email address.</div></details>
        </div>
      </section>
    </div>
  </main>
</div>`;

/* ------------------------------------------------------------------------------------------------
 * Errors: a form with field errors beside the fields, a failure toast in the footer, the confirm
 * window, and the full-page states
 * --------------------------------------------------------------------------------------------- */

const errField = (id: string, labelText: string, control: string, error: string) =>
  `<div class="m-split" style="--m-layout-split-side: 9rem; --m-layout-split-gap: var(--m-space-4); align-items: center">
        <label for="${id}" style="text-align: end; ${small}; ${muted}">${labelText}</label>
        <div class="m-cluster" data-gap="3" style="flex-wrap: wrap">
          <div style="flex: 1 1 14rem">${control}</div>
          ${error ? `<p class="m-field-error m-cluster" data-gap="1" id="${id}-e" style="flex-wrap: nowrap">${icon(I.warn, 14)} ${error}</p>` : ''}
        </div>
      </div>`;

const pageError = (code: string, ic: IconName, title: string, body: string, actions: string) =>
  `<section class="m-stack" data-gap="3" data-align="center" aria-labelledby="cb-err-${code}" style="padding: var(--m-space-12) var(--m-space-6); text-align: center; border: var(--m-border-width-thin) solid var(--m-color-border-muted); border-radius: var(--m-radius-lg); background: var(--m-color-bg-surface)">
      <span style="${muted}">${icon(I[ic], 32)}</span>
      <span style="font-family: var(--m-font-family-mono); ${small}; ${muted}">${code}</span>
      <h2 id="cb-err-${code}" style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-semibold)">${title}</h2>
      <p style="max-inline-size: 24rem; ${small}; ${muted}">${body}</p>
      <div class="m-cluster" data-gap="2" data-justify="center">${actions}</div>
    </section>`;

const errors = glowPage(`<main class="m-container" data-size="md" style="--m-layout-container-max-md: 46rem">
  <div class="m-stack" data-gap="10">
    ${windowPanel(
      `  <div class="m-cluster" data-gap="3" style="min-block-size: 3.5rem; padding-inline: var(--m-space-4); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-muted)">
    <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Back">${icon(I.back, 16)}</button>
    <h1 style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-medium)">New workflow</h1>
  </div>
  <form class="m-stack" data-gap="4" aria-label="New workflow" style="padding: var(--m-space-6) var(--m-space-5)">
    <div class="m-alert" data-tone="danger" role="alert">
      <span class="m-alert-icon">${icon(I.x, 16)}</span>
      <div class="m-alert-content"><div class="m-alert-title">2 fields need a fix</div><div class="m-alert-body">The workflow wasn't saved.</div></div>
    </div>
    ${errField('cb-err-name', 'Name', '<input class="m-input" id="cb-err-name" value="" placeholder="Ship to staging" aria-invalid="true" aria-describedby="cb-err-name-e">', 'Give the workflow a name')}
    ${errField('cb-err-alias', 'Alias', '<input class="m-input" id="cb-err-alias" value="deploy" aria-invalid="true" aria-describedby="cb-err-alias-e" style="font-family: var(--m-font-family-mono)">', '“deploy” is used by Deploy preview')}
    ${errField('cb-err-repo', 'Repository', '<select class="m-select" id="cb-err-repo"><option>platform/checkout</option><option>platform/search</option></select>', '')}
  </form>
  <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; min-block-size: 2.5rem; padding-inline: var(--m-space-3); border-block-start: var(--m-border-width-thin) solid var(--m-color-border-muted); background: var(--m-color-bg-raised); ${small}">
    <span class="m-cluster" data-gap="2" role="status" style="flex-wrap: nowrap"><span style="display: inline-flex; color: var(--m-color-danger-fg)">${icon(I.x, 16)}</span> Couldn't save the workflow</span>
    <span class="m-cluster" data-gap="2" style="flex-wrap: nowrap; font-weight: var(--m-font-weight-medium)">Save Workflow ${keys('⌘', '↵')}</span>
  </div>`,
      'New workflow',
    )}
    <section class="m-cluster" data-gap="6" data-justify="center" data-align="start" aria-label="Messages">
      <div class="m-toast-region" data-static aria-live="polite">
        <div class="m-toast" data-tone="danger" role="alert">
          <div class="m-toast-content">
            <p class="m-toast-title m-cluster" data-gap="2" style="flex-wrap: nowrap"><span style="display: inline-flex; color: var(--m-color-danger-fg)">${icon(I.x, 16)}</span>Couldn't rotate the token</p>
            <p class="m-toast-body">The vault refused the request. Nothing was changed.</p>
            <div class="m-toast-actions"><button type="button" class="m-button" data-size="sm">Retry</button></div>
          </div>
          <button type="button" class="m-toast-close" aria-label="Dismiss">${icon(I.x.replace('<circle cx="12" cy="12" r="10"/>', ''), 14)}</button>
        </div>
      </div>
      <div class="m-dialog" data-static data-size="sm" role="alertdialog" aria-modal="false" aria-labelledby="cb-dlg-title" aria-describedby="cb-dlg-desc">
        <div class="m-stack" data-gap="3" data-align="center" style="text-align: center">
          ${tile('trash', 'danger', 40)}
          <h2 class="m-dialog-title" id="cb-dlg-title" style="font-size: var(--m-font-size-md)">Delete “Ship to staging”?</h2>
          <p class="m-dialog-description" id="cb-dlg-desc" style="${small}">Its 146 runs of history go with it. You can't undo this.</p>
          <div class="m-grid" style="--m-layout-grid-min: 6rem; --m-layout-grid-gap: var(--m-space-2); inline-size: 100%">
            <button type="button" class="m-button" data-size="sm">Cancel</button>
            <button type="button" class="m-button" data-variant="danger" data-size="sm">Delete</button>
          </div>
        </div>
      </div>
    </section>
    <div class="m-grid" style="--m-layout-grid-min: 13rem; --m-layout-grid-gap: var(--m-space-4)">
${pageError('404', 'compass', 'Nothing here', 'The link may be old, or the workflow was moved to another team.', `<a class="m-button" data-variant="primary" data-size="sm" href="#">Open the palette</a>`)}
${pageError('500', 'server', 'Something broke on our side', 'Nothing was changed. Try again in a minute; the status page has more.', `<button type="button" class="m-button" data-size="sm">${icon(I.refresh, 14)} Try again</button>`)}
${pageError('403', 'lock', 'This one is private', 'Only members of Platform can run it. Ask an owner to add you.', `<button type="button" class="m-button" data-size="sm">Ask for access</button>`)}
    </div>
  </div>
</main>`);

export const carbonRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'The command palette as the home screen: a big search field, sectioned rows with accessories, the action panel open over the footer bar, then the week in small cards.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'The launcher’s list beside a detail pane: markdown on top, label-and-value metadata with coloured tags below, the primary action in the footer.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One step in the launcher window: a thin progress line, a hotkey recorder with large key caps, label-left fields and Continue in the footer.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'The preferences window as a page: a sidebar of icon tiles with the profile on top, then grouped panels of rows with a switch, select or key caps on the right.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description: 'The launcher with nothing to list: a muted icon, a 14px title, one line, and the action in the footer.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The marketing site: a floating header, a blurred red glow, a pill billing switch and three plans, the middle one raised with tiers, mono prices and check-circle features.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors beside the fields with a warning icon, a summary above, the failure in the footer bar, a toast, the compact confirm window, and full-page 404, 500 and 403.',
    html: errors,
  },
];
