import type { ArchetypeRecipe } from '../types';

/*
 * Prism's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with invented data from a studio's shared web library ("Pinwheel"). They
 * translate a browser's chrome to web layouts: the whole window takes the space colour (the canvas);
 * a borderless sidebar sits on it with a search field, a grid of shortcut tiles, the space's name,
 * rows with 10px corners and a white current tile with a soft glow, and groups tinted in their own
 * colour; the page itself is a white panel with soft corners inset from the frame. The command bar
 * is a white panel whose highlighted row fills with the blue. Headings are heavy and tightly
 * tracked; small labels are tracked mono capitals.
 */

// Lucide icons, outlined, 1.75 on the 24px grid
const icon = (paths: string, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none">${paths}</svg>`;
const I = {
  house:
    '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  inbox:
    '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  layoutGrid:
    '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  paperclip:
    '<path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/>',
  fileText:
    '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
  folder:
    '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  folderOpen:
    '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  panelLeft: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
  arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  rotateCw: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  slidersHorizontal:
    '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
  archive:
    '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  share: '<path d="M12 2v13"/><path d="m16 6-4-4-4 4"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>',
  sparkles:
    '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  settings:
    '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  ellipsis: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  calendar:
    '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  clock: '<path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/>',
  image:
    '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  palette:
    '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>',
  keyboard:
    '<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  flaskConical:
    '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  circleAlert:
    '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  triangleAlert:
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  searchX: '<path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  arrowUpRight: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  download: '<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
  mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  upload: '<path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
  trash2:
    '<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  pencil:
    '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  command: '<path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>',
  bookmark:
    '<path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"/>',
  globe:
    '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  heart:
    '<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
  monitor:
    '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
  smartphone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  circleCheck: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  wifiOff:
    '<path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.177-2.643"/><path d="M22 8.82a15 15 0 0 0-11.288-3.764"/><path d="m2 2 20 20"/>',
  circleQuestionMark:
    '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  messageCircle:
    '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>',
  compass:
    '<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/>',
  layers:
    '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
  pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
  gripVertical:
    '<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>',
};

// Shared inline treatments (tokens only)
const num = 'font-variant-numeric: tabular-nums';
const muted = 'color: var(--m-color-fg-muted)';
const subtle = 'color: var(--m-color-fg-subtle)';
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)';
const display = (size: string) =>
  `font-family: var(--m-font-heading-family); font-weight: var(--m-font-heading-weight); letter-spacing: var(--m-font-heading-tracking); line-height: var(--m-font-leading-tight); font-size: var(--m-font-size-${size})`;
// Tracked mono capitals: dates, step counts, section labels
const label =
  'font-family: var(--m-font-family-mono); font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-wide); text-transform: uppercase';
const mono = (t: string, extra = '') => `<span style="${label}; ${subtle}${extra ? `; ${extra}` : ''}">${t}</span>`;
const ellipsis = 'min-inline-size: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap';
// The white content panel inset from the coloured frame
const panelBase =
  'background: var(--m-color-bg-surface); border-radius: var(--m-radius-control); box-shadow: var(--m-shadow-md)';
const panel = `${panelBase}; min-inline-size: 0`;

// A tone's tint and its text colour; "accent" is the violet group
const tint = (tone: string) =>
  tone === 'accent'
    ? { bg: 'var(--m-color-accent-subtle)', fg: 'var(--m-color-accent-text)' }
    : tone === 'brand'
      ? { bg: 'var(--m-color-brand-subtle)', fg: 'var(--m-color-brand-default)' }
      : { bg: `var(--m-color-${tone}-bg)`, fg: `var(--m-color-${tone}-fg)` };
const solid = (tone: string) =>
  tone === 'accent'
    ? { bg: 'var(--m-color-accent-default)', fg: 'var(--m-color-accent-fg)' }
    : tone === 'brand'
      ? { bg: 'var(--m-color-brand-default)', fg: 'var(--m-color-brand-fg)' }
      : tone === 'ink'
        ? { bg: 'var(--m-color-bg-inverse)', fg: 'var(--m-color-fg-inverse)' }
        : { bg: `var(--m-color-${tone}-solid)`, fg: `var(--m-color-${tone}-on-solid)` };
// A site's favicon stand-in: a small rounded square with a letter (no logos)
const fav = (tone: string, letter: string, size = '1rem') => {
  const s = solid(tone);
  return `<span aria-hidden="true" style="flex: none; display: inline-grid; place-items: center; inline-size: ${size}; block-size: ${size}; border-radius: calc(${size} * 0.2); background: ${s.bg}; color: ${s.fg}; font-size: calc(${size} * 0.62); font-weight: var(--m-font-weight-bold); line-height: 1">${letter}</span>`;
};
// A tinted icon tile (stat cards, empty states)
const tile = (tone: string, paths: string, size = '2rem', iconSize = 16) => {
  const t = tint(tone);
  return `<span aria-hidden="true" style="flex: none; display: inline-grid; place-items: center; inline-size: ${size}; block-size: ${size}; border-radius: calc(${size} * 0.28); background: ${t.bg}; color: ${t.fg}">${icon(paths, iconSize)}</span>`;
};
const iconButton = (paths: string, labelText: string, variant = 'ghost', size = 'sm') =>
  `<button type="button" class="m-button" data-variant="${variant}" data-size="${size}" data-icon-only aria-label="${labelText}">${icon(paths)}</button>`;
const dot = (tone: string, size = '0.5rem') =>
  `<span aria-hidden="true" style="flex: none; inline-size: ${size}; block-size: ${size}; border-radius: var(--m-radius-full); background: ${solid(tone).bg}"></span>`;

// ── The frame: a borderless sidebar on the space colour ─────────────────────────────────────────
const glow = ' style="box-shadow: var(--m-shadow-lg)"';
const navLink = (ic: string, name: string, current: string, extra = '') =>
  `          <li><a class="m-sidebar-link" href="#"${name === current ? ` aria-current="page"${glow}` : ''}>${icon(ic)} <span style="flex: 1; ${ellipsis}">${name}</span>${extra}</a></li>`;
const tabRow = (favicon: string, name: string, current: string, indent = false) =>
  `              <li><a class="m-sidebar-link" href="#" style="${indent ? 'padding-inline-start: 1.5625rem; ' : ''}${name === current ? 'box-shadow: var(--m-shadow-lg); ' : 'color: var(--m-color-fg-muted); '}font-weight: var(--m-font-weight-regular)"${name === current ? ' aria-current="page"' : ''}>${favicon} <span style="${ellipsis}">${name}</span></a></li>`;
// A tinted group: its title in the group's colour, its rows indented under it
const group = (tone: string, name: string, rows: string[], current: string, open = true) => {
  const t = tint(tone);
  return `          <li style="background: ${open ? t.bg : 'transparent'}; border-radius: var(--m-radius-lg); padding-block-end: ${open ? '3px' : '0'}">
            <a class="m-sidebar-link" href="#" style="color: ${open ? t.fg : 'var(--m-color-fg-default)'}">${icon(open ? I.folderOpen : I.folder)} <span style="${ellipsis}">${name}</span><span style="opacity: 0.6; display: inline-flex">${icon(open ? I.chevronDown : I.chevronRight, 12)}</span></a>${
              open
                ? `
            <ul style="margin: 0; padding: 0; border: 0">
${rows.map((r) => r).join('\n')}
            </ul>`
                : ''
            }
          </li>`;
};
const sidebar = (
  current: string,
) => `  <nav class="m-sidebar" aria-label="Studio space" style="padding: var(--m-space-1) var(--m-space-2) var(--m-space-1) 0">
    <div class="m-cluster" data-justify="between" data-gap="1" style="padding-inline-start: var(--m-space-2)">
      <span style="${display('lg')}">Pinwheel</span>
      <span class="m-cluster" data-gap="0">${iconButton(I.panelLeft, 'Hide the sidebar')}${iconButton(I.arrowLeft, 'Back')}${iconButton(I.arrowRight, 'Forward')}</span>
    </div>
    <button type="button" class="m-cluster" data-gap="2" style="flex-wrap: nowrap; block-size: 2.25rem; padding-inline: var(--m-space-3); border: 0; border-radius: var(--m-radius-control); background: var(--m-sidebar-link-hover-bg); color: var(--m-color-fg-muted); font: inherit; text-align: start; cursor: pointer">${icon(I.search, 14)}<span style="flex: 1">Search or jump to…</span><kbd class="m-kbd">⌘K</kbd></button>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px" aria-label="Shortcuts">
${[
  ['accent', 'K', 'Kanban'],
  ['warning', 'S', 'Sketches'],
  ['info', 'M', 'Mail'],
  ['success', 'C', 'Calendar'],
]
  .map(
    ([tone, l, n]) =>
      `      <a href="#" aria-label="${n}" style="display: grid; place-items: center; block-size: 2.5rem; border-radius: var(--m-radius-control); background: var(--m-sidebar-link-hover-bg); text-decoration: none">${fav(tone, l)}</a>`,
  )
  .join('\n')}
    </div>
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Studio</h2>
      <ul>
${navLink(I.house, 'Home', current)}
${navLink(I.inbox, 'Inbox', current, ' <span class="m-sidebar-count">7</span>')}
${navLink(I.layoutGrid, 'Boards', current)}
${navLink(I.paperclip, 'Clips', current)}
${navLink(I.fileText, 'Briefs', current)}
      </ul>
    </div>
    <div class="m-sidebar-section" style="${hair}; padding-block-start: var(--m-space-3); margin-inline: var(--m-space-2) 0">
      <ul style="margin-inline-start: calc(var(--m-space-2) * -1)">
${group(
  'accent',
  'Spring launch',
  [
    tabRow(fav('accent', 'P'), 'Poster drafts', current, true),
    tabRow(fav('ink', 'T'), 'Type specimens', current, true),
    tabRow(fav('danger', 'R'), 'Retail moodboard', current, true),
  ],
  current,
)}
${group(
  'warning',
  'Sundial Tea',
  [
    tabRow(fav('warning', 'S'), 'Packaging brief', current, true),
    tabRow(fav('info', 'F'), 'Feedback round 2', current, true),
  ],
  current,
)}
${group('info', 'Field research', [], current, false)}
${tabRow(fav('success', 'G'), 'Grant application', current)}
${tabRow(fav('brand', 'Q'), 'Quarterly review deck', current)}
        <li><a class="m-sidebar-link" href="#" style="${subtle}; font-weight: var(--m-font-weight-regular)">${icon(I.plus)} New clip</a></li>
      </ul>
    </div>
    <div class="m-cluster" data-justify="between" style="margin-block-start: auto; padding-inline: var(--m-space-1)">
      ${iconButton(I.archive, 'Archive')}
      <span class="m-cluster" data-gap="2" aria-label="Spaces: Studio, Home, Side projects">${dot('ink', '0.375rem')}<span style="inline-size: 0.375rem; block-size: 0.375rem; border-radius: var(--m-radius-full); background: var(--m-color-fg-subtle); opacity: 0.4"></span><span style="inline-size: 0.375rem; block-size: 0.375rem; border-radius: var(--m-radius-full); background: var(--m-color-fg-subtle); opacity: 0.4"></span></span>
      ${iconButton(I.plus, 'New space')}
    </div>
  </nav>`;

const frame = (
  current: string,
  main: string,
  bare = false,
) => `<div class="m-split" style="--m-layout-split-side: 15.25rem; --m-layout-split-gap: var(--m-space-2); min-block-size: 100vh; padding: var(--m-space-2); background: var(--m-color-bg-canvas)">
${sidebar(current)}
  <main${bare ? '' : ` style="${panelBase}"`}>
${main}
  </main>
</div>`;

// A page's own top line inside the panel: where you are, and its actions
const topLine = (
  crumbs: string,
  actions: string,
) => `    <header class="m-cluster" data-justify="between" style="min-block-size: 3rem; padding: var(--m-space-2) var(--m-space-4) var(--m-space-2) var(--m-space-5); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-muted)">
      ${crumbs}
      <div class="m-cluster" data-gap="1">${actions}</div>
    </header>`;
const crumb = (...parts: string[]) =>
  `<nav class="m-breadcrumb" aria-label="Breadcrumb"><ol>${parts.map((p, i) => (i === parts.length - 1 ? `<li><span aria-current="page">${p}</span></li>` : `<li><a href="#">${p}</a></li>`)).join('')}</ol></nav>`;

// ── Dashboard ────────────────────────────────────────────────────────────────────────────────────
const stat = (
  tone: string,
  ic: string,
  name: string,
  value: string,
  delta: string,
  deltaTone: string,
) => `          <div class="m-card" data-size="sm">
            <div class="m-cluster" data-justify="between">${tile(tone, ic)}<span class="m-badge" data-tone="${deltaTone}">${delta}</span></div>
            <p style="${muted}; font-size: var(--m-font-size-md)">${name}</p>
            <p style="${display('2xl')}; ${num}">${value}</p>
          </div>`;

// Clips saved per week, stacked by group colour
const weeks = [
  [14, 6, 4],
  [18, 9, 3],
  [11, 12, 6],
  [22, 8, 7],
  [19, 14, 5],
  [26, 10, 9],
  [21, 16, 8],
  [31, 12, 11],
];
const bars = weeks
  .map((w, i) => {
    let y = 160;
    const x = 18 + i * 72;
    return ['accent-default', 'warning-solid', 'info-solid']
      .map((c, k) => {
        const h = w[k] * 2.4;
        y -= h;
        return `<rect x="${x}" y="${y.toFixed(1)}" width="40" height="${(h - 2).toFixed(1)}" rx="4" style="fill: var(--m-color-${c})${i === weeks.length - 1 ? '' : '; opacity: 0.85'}"/>`;
      })
      .join('');
  })
  .join('\n                ');
const chart = `<svg viewBox="0 0 594 186" width="100%" style="display: block; block-size: auto; max-block-size: 13rem" role="img" aria-label="Clips saved each week for eight weeks, by group: 54 this week, the most so far">
                <path d="M0 160.5H594" style="stroke: var(--m-color-border-default)" stroke-width="1"/>
                ${bars}
                ${['Aug 25', 'Sep 1', 'Sep 8', 'Sep 15', 'Sep 22', 'Sep 29', 'Oct 6', 'Oct 13'].map((d, i) => `<text x="${38 + i * 72}" y="180" text-anchor="middle" style="fill: var(--m-color-fg-subtle); font-size: 12px; font-family: var(--m-font-family-sans)">${d}</text>`).join('')}
              </svg>`;

const upNext = (f: string, t: string, meta: string, when: string, tone = '') =>
  `              <li class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding: var(--m-space-2) var(--m-space-1)">${f}<span class="m-stack" data-gap="0" style="flex: 1; min-inline-size: 0"><span style="${ellipsis}; font-weight: var(--m-font-weight-medium)">${t}</span><span style="${muted}; font-size: var(--m-font-size-sm); ${ellipsis}">${meta}</span></span><span class="m-badge"${tone ? ` data-tone="${tone}"` : ''}>${when}</span></li>`;

const board = (tone: string, ic: string, name: string, meta: string, people: string[]) => {
  const t = tint(tone);
  return `          <a class="m-card" href="#" data-size="sm" style="text-decoration: none; color: inherit; gap: var(--m-space-3)">
            <div style="display: grid; place-items: center; block-size: 5.5rem; border-radius: var(--m-radius-md); background: ${t.bg}; color: ${t.fg}">${icon(ic, 28)}</div>
            <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap">
              <span class="m-stack" data-gap="0" style="min-inline-size: 0"><span style="font-weight: var(--m-font-weight-semibold); ${ellipsis}">${name}</span><span style="${muted}; font-size: var(--m-font-size-sm)">${meta}</span></span>
              <span class="m-avatar-group">${people
                .map(
                  (p) =>
                    `<span class="m-avatar" data-size="sm" aria-label="${p}">${p
                      .split(' ')
                      .map((s) => s[0])
                      .join('')}</span>`,
                )
                .join('')}</span>
            </div>
          </a>`;
};

const dashboard = frame(
  'Home',
  `${topLine(crumb('Studio', 'Home'), `${iconButton(I.bell, 'Notifications')}${iconButton(I.share, 'Share this space')}${iconButton(I.ellipsis, 'More')}`)}
    <div class="m-container" style="padding-block: var(--m-space-10) var(--m-space-12)">
      <div class="m-stack" data-gap="8">
        <div class="m-cluster" data-justify="between" data-align="end" data-gap="4">
          <div class="m-stack" data-gap="2">
            ${mono('Tuesday, October 14')}
            <h1 style="${display('3xl')}">Morning, Mira.<br>Nine boards are on the go.</h1>
          </div>
          <div class="m-cluster" data-gap="2">
            <button type="button" class="m-button" data-variant="secondary">${icon(I.upload)} Import links</button>
            <button type="button" class="m-button" data-variant="primary">${icon(I.plus)} New board</button>
          </div>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 12rem">
${stat('accent', I.paperclip, 'Clips this week', '54', '+12', 'success')}
${stat('warning', I.layoutGrid, 'Boards on the go', '9', '2 due', 'warning')}
${stat('info', I.users, 'Shared with you', '17', '4 new', 'info')}
${stat('success', I.clock, 'Reading time', '3h 40m', 'Steady', '')}
        </div>
        <div class="m-cluster" data-gap="3" data-align="start">
          <section class="m-card" aria-labelledby="pw-week" style="flex: 2 1 26rem; min-inline-size: 0">
            <div class="m-cluster" data-justify="between">
              <h2 id="pw-week" class="m-card-title">Clips saved by week</h2>
              <span class="m-cluster" data-gap="3" style="font-size: var(--m-font-size-sm); ${muted}"><span class="m-cluster" data-gap="1">${dot('accent')} Spring launch</span><span class="m-cluster" data-gap="1">${dot('warning')} Sundial Tea</span><span class="m-cluster" data-gap="1">${dot('info')} Research</span></span>
            </div>
            ${chart}
          </section>
          <section class="m-card" aria-labelledby="pw-next" style="flex: 1 1 18rem; min-inline-size: 0">
            <div class="m-cluster" data-justify="between"><h2 id="pw-next" class="m-card-title">Up next</h2><a href="#" style="color: var(--m-color-accent-text); font-size: var(--m-font-size-md); text-decoration: none">See all</a></div>
            <ul class="m-stack" data-gap="0" style="list-style: none; margin: 0; padding: 0">
${upNext(fav('accent', 'P'), 'Poster drafts review', 'Spring launch · 6 clips', 'Today', 'accent')}
${upNext(fav('warning', 'S'), 'Packaging brief v3', 'Sundial Tea · Ines left 2 notes', 'Wed')}
${upNext(fav('info', 'F'), 'Interview notes, round 2', 'Field research · shared by Tomás', 'Thu')}
${upNext(fav('success', 'G'), 'Grant application', 'Due Oct 31 · 3 sections left', 'Oct 31', 'warning')}
            </ul>
          </section>
        </div>
        <section class="m-stack" data-gap="3" aria-labelledby="pw-boards">
          <div class="m-cluster" data-justify="between"><h2 id="pw-boards" style="${display('xl')}">Boards</h2><div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Show"><button type="button" class="m-tab" role="tab" aria-selected="true">Recent</button><button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Mine</button><button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Starred</button></div></div></div>
          <div class="m-grid" style="--m-layout-grid-min: 14rem">
${board('accent', I.image, 'Spring launch', '38 clips · edited 2h ago', ['Mira Okafor', 'Jun Park', 'Ines Varga'])}
${board('warning', I.palette, 'Sundial Tea', '21 clips · edited yesterday', ['Ines Varga', 'Tomás Reyes'])}
${board('info', I.compass, 'Field research', '64 clips · edited Mon', ['Tomás Reyes'])}
${board('success', I.sparkles, 'Ideas parking lot', '112 clips · edited Sep 30', ['Mira Okafor', 'Jun Park'])}
          </div>
        </section>
      </div>
    </div>`,
);

// ── List and detail: two panes side by side, the focused one outlined ────────────────────────────
const paneBar = (
  url: string,
  focused = false,
) => `      <div class="m-cluster" data-gap="1" style="flex-wrap: nowrap; min-block-size: 2.75rem; padding-inline: var(--m-space-2); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-muted)">
        ${iconButton(I.arrowLeft, 'Back')}${iconButton(I.arrowRight, 'Forward')}${iconButton(I.rotateCw, 'Reload')}
        <span class="m-cluster" data-gap="2" style="flex: 1; justify-content: center; flex-wrap: nowrap; font-size: var(--m-font-size-md); ${focused ? '' : muted}">${icon(I.link, 14)}<span style="${ellipsis}">${url}</span></span>
        ${iconButton(I.slidersHorizontal, 'Page options')}${iconButton(I.x, 'Close this pane')}
      </div>`;

const clipRow = (
  sel: boolean,
  f: string,
  title: string,
  domain: string,
  tone: string,
  boardName: string,
  who: string,
  when: string,
) => `            <tr${sel ? ' aria-selected="true" style="background: var(--m-color-accent-subtle)"' : ''}>
              <td><input class="m-checkbox" type="checkbox" aria-label="Select ${title}"${sel ? ' checked' : ''}></td>
              <td><span class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${f}<span class="m-stack" data-gap="0" style="min-inline-size: 0"><a href="#" style="color: inherit; text-decoration: none; font-weight: var(--m-font-weight-medium); ${ellipsis}">${title}</a><span style="${muted}; font-size: var(--m-font-size-sm)">${domain}</span></span></span></td>
              <td><span class="m-badge" data-tone="${tone}">${boardName}</span></td>
              <td><span class="m-avatar" data-size="sm" aria-label="${who}">${who
                .split(' ')
                .map((s) => s[0])
                .join('')}</span></td>
              <td style="${muted}; ${num}; white-space: nowrap">${when}</td>
            </tr>`;

const kv = (k: string, v: string) =>
  `          <div class="m-cluster" data-justify="between" style="padding-block: var(--m-space-3); ${hair}"><span style="${muted}">${k}</span><span style="text-align: end">${v}</span></div>`;

const listDetail = frame(
  'Clips',
  `    <div class="m-grid" style="--m-layout-grid-min: 24rem; --m-layout-grid-gap: var(--m-space-2); align-items: stretch; min-block-size: 100%">
    <section aria-label="Clips" style="${panel}; outline: var(--m-focus-width) solid var(--m-color-accent-default); outline-offset: 0">
${paneBar('pinwheel.app/studio/clips', true)}
      <div class="m-stack" data-gap="5" style="padding: var(--m-space-6) var(--m-space-5)">
        <div class="m-cluster" data-justify="between">
          <div class="m-stack" data-gap="1">${mono('Studio · 214 clips')}<h1 style="${display('2xl')}">Clips</h1></div>
          <button type="button" class="m-button" data-variant="primary" data-size="sm">${icon(I.plus)} Add clip</button>
        </div>
        <div class="m-cluster" data-justify="between" data-gap="2">
          <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Kind"><button type="button" class="m-tab" role="tab" aria-selected="true">All</button><button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Links</button><button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Images</button><button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Notes</button></div></div>
          <div class="m-cluster" data-gap="2"><input class="m-input" data-size="sm" type="search" placeholder="Filter clips" aria-label="Filter clips" style="inline-size: 10rem"><select class="m-select" data-size="sm" aria-label="Sort"><option>Newest first</option><option>Oldest first</option><option>By board</option></select></div>
        </div>
        <div class="m-table-wrap" tabindex="0" role="region" aria-label="Clips" style="box-shadow: none">
          <table class="m-table">
            <thead><tr><th style="inline-size: 2rem"><span class="m-sr-only">Select</span></th><th>Clip</th><th>Board</th><th>By</th><th>Added</th></tr></thead>
            <tbody>
${clipRow(false, fav('accent', 'P'), 'Risograph poster tests', 'printshop.example', 'accent', 'Spring launch', 'Jun Park', '10:42')}
${clipRow(true, fav('warning', 'K'), 'Kiln-dried label stock', 'paperandpulp.example', 'warning', 'Sundial Tea', 'Ines Varga', '09:15')}
${clipRow(false, fav('info', 'O'), 'Oral history methods', 'fieldnotes.example', 'info', 'Field research', 'Tomás Reyes', 'Yesterday')}
${clipRow(false, fav('ink', 'G'), 'Grotesque specimen sheet', 'typefoundry.example', 'accent', 'Spring launch', 'Mira Okafor', 'Yesterday')}
${clipRow(false, fav('success', 'C'), 'Community fund guidelines', 'artscouncil.example', 'success', 'Grants', 'Mira Okafor', 'Oct 11')}
${clipRow(false, fav('danger', 'W'), 'Window display ideas', 'shopfront.example', 'danger', 'Retail', 'Jun Park', 'Oct 10')}
${clipRow(false, fav('brand', 'T'), 'Tea ceremony timings', 'leafandcup.example', 'warning', 'Sundial Tea', 'Ines Varga', 'Oct 9')}
            </tbody>
          </table>
        </div>
        <nav class="m-pagination" aria-label="Pages"><a class="m-pagination-item" href="#" aria-label="Previous page">${icon(I.arrowLeft, 14)}</a><a class="m-pagination-item" href="#" aria-current="page">1</a><a class="m-pagination-item" href="#">2</a><a class="m-pagination-item" href="#">3</a><span class="m-pagination-ellipsis">…</span><a class="m-pagination-item" href="#">31</a><a class="m-pagination-item" href="#" aria-label="Next page">${icon(I.arrowRight, 14)}</a></nav>
      </div>
    </section>
    <section aria-label="Kiln-dried label stock" style="${panel}">
${paneBar('paperandpulp.example/label-stock')}
      <div class="m-stack" data-gap="6" style="padding: var(--m-space-6) var(--m-space-6) var(--m-space-8)">
        <a href="#" class="m-cluster" data-gap="1" style="${muted}; text-decoration: none; font-size: var(--m-font-size-md)">${icon(I.arrowLeft, 14)} Clips</a>
        <div class="m-cluster" data-gap="4" style="flex-wrap: nowrap; align-items: start">
          ${fav('warning', 'K', '2.75rem')}
          <div class="m-stack" data-gap="1" style="min-inline-size: 0">
            <h2 style="${display('xl')}">Kiln-dried label stock</h2>
            <a href="#" class="m-cluster" data-gap="1" style="color: var(--m-color-accent-text); text-decoration: none; font-size: var(--m-font-size-md)">paperandpulp.example ${icon(I.arrowUpRight, 14)}</a>
          </div>
        </div>
        <div class="m-cluster" data-gap="2"><button type="button" class="m-button" data-variant="primary" data-size="sm">${icon(I.arrowUpRight)} Open</button><button type="button" class="m-button" data-variant="secondary" data-size="sm">${icon(I.copy)} Copy link</button><button type="button" class="m-button" data-variant="secondary" data-size="sm">${icon(I.layoutGrid)} Move</button>${iconButton(I.ellipsis, 'More actions')}</div>
        <div style="block-size: 9rem; border-radius: var(--m-radius-lg); background: linear-gradient(135deg, var(--m-color-warning-bg), var(--m-color-danger-bg) 55%, var(--m-color-accent-subtle)); display: grid; place-items: center; color: var(--m-color-warning-fg)">${icon(I.image, 28)}</div>
        <div class="m-stack" data-gap="0">
${kv('Board', '<span class="m-badge" data-tone="warning">Sundial Tea</span>')}
${kv('Saved by', 'Ines Varga')}
${kv('Added', '<span style="font-variant-numeric: tabular-nums">Oct 14, 09:15</span>')}
${kv('Tags', '<span class="m-cluster" data-gap="1"><span class="m-badge">paper</span><span class="m-badge">labels</span><span class="m-badge">suppliers</span></span>')}
        </div>
        <div class="m-stack" data-gap="2">
          <h3 style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-semibold)">Highlight</h3>
          <blockquote style="margin: 0; padding: var(--m-space-3) var(--m-space-4); border-radius: var(--m-radius-lg); background: var(--m-color-warning-bg); color: var(--m-color-fg-default)">"Uncoated stock takes letterpress well and ages to a warm cream within a season."</blockquote>
        </div>
        <div class="m-composer"><textarea class="m-composer-input" rows="1" aria-label="Add a note" placeholder="Add a note for the team…"></textarea><div class="m-composer-actions"><span class="m-composer-spacer"></span><button type="button" class="m-button" data-variant="primary" data-size="sm" data-icon-only aria-label="Post note">${icon(I.arrowRight)}</button></div></div>
      </div>
    </section>
    </div>`,
  true,
);

// ── Onboarding: one big rounded card on a soft multicolour wash ─────────────────────────────────
const swatch = (tone: string, name: string, checked = false) =>
  `<label style="display: inline-grid; place-items: center; inline-size: 2.25rem; block-size: 2.25rem; border-radius: var(--m-radius-full); background: ${solid(tone).bg}; cursor: pointer;${checked ? ' box-shadow: 0 0 0 2px var(--m-color-bg-surface), 0 0 0 4px var(--m-color-accent-default);' : ''}"><input class="m-sr-only" type="radio" name="pw-colour" value="${name}"${checked ? ' checked' : ''}><span class="m-sr-only">${name}</span>${checked ? `<span style="color: ${solid(tone).fg}; display: inline-flex">${icon(I.check)}</span>` : ''}</label>`;
const miniRow = (f: string, t: string, cur = false) =>
  `<div class="m-cluster" data-gap="2" style="flex-wrap: nowrap; padding: var(--m-space-2) var(--m-space-2); border-radius: var(--m-radius-control); font-size: var(--m-font-size-sm);${cur ? ' background: var(--m-sidebar-link-active-bg); box-shadow: var(--m-shadow-lg); font-weight: var(--m-font-weight-medium);' : ' color: var(--m-color-fg-muted);'}">${f}<span style="${ellipsis}">${t}</span></div>`;

const onboarding = `<div style="min-block-size: 100vh; display: grid; place-items: center; padding: clamp(1rem, 5vw, 4rem); background: linear-gradient(135deg, var(--m-color-accent-subtle), var(--m-color-info-bg) 45%, var(--m-color-warning-bg))">
  <div style="${panel}; inline-size: min(100%, 60rem); border-radius: 20px; box-shadow: var(--m-shadow-overlay); overflow: hidden; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr))">
    <form class="m-stack" data-gap="6" style="padding: clamp(1.5rem, 4vw, 3rem)">
      <div class="m-stack" data-gap="2">
        ${mono('Step 2 of 4')}
        <progress class="m-progress" data-size="sm" value="2" max="4" aria-label="Setup, step 2 of 4">2 of 4</progress>
      </div>
      <div class="m-stack" data-gap="3">
        <h1 style="${display('3xl')}">Give your first space a colour.</h1>
        <p style="${muted}; font-size: var(--m-font-size-lg)">Spaces keep work and the rest of life apart. Each one gets its own sidebar, its own pins and its own colour, so you always know where you are.</p>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="pw-space">Space name</label>
        <input class="m-input" id="pw-space" type="text" value="Studio" required aria-describedby="pw-space-hint">
        <p class="m-field-hint" id="pw-space-hint">You can rename it any time.</p>
      </div>
      <fieldset class="m-stack" data-gap="3" style="border: 0; margin: 0; padding: 0">
        <legend class="m-field-label" style="margin-block-end: var(--m-space-3)">Colour</legend>
        <div class="m-cluster" data-gap="3">${swatch('accent', 'Blue', true)}${swatch('brand', 'Indigo')}${swatch('info', 'Cyan')}${swatch('success', 'Mint')}${swatch('warning', 'Tangerine')}${swatch('danger', 'Coral')}${swatch('ink', 'Graphite')}</div>
      </fieldset>
      <label class="m-field" data-layout="inline"><input class="m-switch" type="checkbox" role="switch" checked> Bring my bookmarks across</label>
      <div class="m-cluster" data-justify="between" style="margin-block-start: auto; padding-block-start: var(--m-space-4)">
        <button type="button" class="m-button" data-variant="ghost">${icon(I.arrowLeft)} Back</button>
        <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="min-inline-size: 11rem">Continue</button>
      </div>
    </form>
    <div class="m-stack" data-gap="4" style="padding: clamp(1.5rem, 4vw, 3rem); background: var(--m-color-bg-sunken); border-inline-start: 2px dotted var(--m-color-border-default); align-items: center; justify-content: center">
      <div class="m-stack" data-gap="2" style="inline-size: min(100%, 15rem); padding: var(--m-space-2); border-radius: var(--m-radius-lg); background: var(--m-color-bg-canvas); box-shadow: var(--m-shadow-overlay)" aria-label="Preview of the Studio sidebar">
        <div style="block-size: 1.75rem; border-radius: var(--m-radius-md); background: var(--m-sidebar-link-hover-bg)"></div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px">${['accent', 'warning', 'info'].map((t, i) => `<div style="display: grid; place-items: center; block-size: 2rem; border-radius: var(--m-radius-md); background: var(--m-sidebar-link-hover-bg)">${fav(t, ['K', 'S', 'M'][i], '0.875rem')}</div>`).join('')}</div>
        <span style="padding-inline: var(--m-space-2); color: var(--m-color-accent-text); font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-semibold)">Studio</span>
        ${miniRow(fav('accent', 'H', '0.875rem'), 'Home', true)}
        ${miniRow(fav('ink', 'B', '0.875rem'), 'Boards')}
        <div style="border-radius: var(--m-radius-lg); background: var(--m-color-accent-subtle); padding-block-end: 2px">${miniRow(`<span style="color: var(--m-color-accent-text); display: inline-flex">${icon(I.folderOpen, 14)}</span>`, '<span style="color: var(--m-color-accent-text); font-weight: var(--m-font-weight-medium)">First board</span>')}${miniRow(fav('danger', 'W', '0.875rem'), 'Welcome tour')}</div>
        ${miniRow(`<span style="display: inline-flex">${icon(I.plus, 14)}</span>`, 'New clip')}
      </div>
      <p style="${muted}; font-size: var(--m-font-size-sm); text-align: center">Your sidebar, in Blue. Switch spaces with a swipe or ⌃1, ⌃2…</p>
    </div>
  </div>
</div>`;

// ── Settings: icon tabs along the top, grouped rows in rounded wells ─────────────────────────────
const settingsTab = (ic: string, name: string, cur = false) =>
  `<button type="button" role="tab" aria-selected="${cur}"${cur ? '' : ' tabindex="-1"'} class="m-stack" data-gap="1" style="align-items: center; min-inline-size: 4.25rem; padding: var(--m-space-2) var(--m-space-2); border: 0; border-radius: var(--m-radius-md); background: ${cur ? 'var(--m-sidebar-link-hover-bg)' : 'transparent'}; color: ${cur ? 'var(--m-color-accent-text)' : 'var(--m-color-fg-muted)'}; font: inherit; font-size: var(--m-font-size-sm); cursor: pointer">${icon(ic, 20)}${name}</button>`;
const well = (rows: string[]) =>
  `        <div style="border-radius: var(--m-radius-lg); background: var(--m-color-bg-sunken); padding-inline: var(--m-space-4)">
${rows.map((r, i) => `          <div class="m-cluster" data-justify="between" data-gap="4" style="min-block-size: 3.5rem; padding-block: var(--m-space-3);${i ? ` ${hair}` : ''}">${r}</div>`).join('\n')}
        </div>`;
const rowText = (t: string, d = '') =>
  `<span class="m-stack" data-gap="0" style="flex: 1; min-inline-size: 12rem"><span style="font-weight: var(--m-font-weight-medium)">${t}</span>${d ? `<span style="${muted}; font-size: var(--m-font-size-sm)">${d}</span>` : ''}</span>`;
const sw = (labelText: string, on: boolean) =>
  `<input class="m-switch" type="checkbox" role="switch" aria-label="${labelText}"${on ? ' checked' : ''}>`;
const keys = (...k: string[]) =>
  `<span class="m-cluster" data-gap="1">${k.map((x) => `<kbd class="m-kbd">${x}</kbd>`).join('')}</span>`;
const sectionTitle = (t: string) =>
  `        <h2 style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-semibold); margin-block-start: var(--m-space-4)">${t}</h2>`;

const settings = frame(
  'Settings',
  `    <div class="m-stack" data-gap="0" style="align-items: center; padding: var(--m-space-3) var(--m-space-4) var(--m-space-2); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-muted)">
      <h1 style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-semibold)">Settings</h1>
      <div role="tablist" aria-label="Settings sections" class="m-cluster" data-gap="1" style="justify-content: center; margin-block-start: var(--m-space-2)">${settingsTab(I.user, 'Account', true)}${settingsTab(I.palette, 'Look')}${settingsTab(I.layers, 'Spaces')}${settingsTab(I.keyboard, 'Keys')}${settingsTab(I.shield, 'Privacy')}${settingsTab(I.flaskConical, 'Labs')}</div>
    </div>
    <div class="m-container" data-size="md" style="padding-block: var(--m-space-8) var(--m-space-12)">
      <div class="m-stack" data-gap="3">
        <div class="m-cluster" data-gap="4" style="flex-wrap: nowrap; margin-block-end: var(--m-space-4)">
          <span class="m-avatar" data-size="lg" aria-label="Mira Okafor">MO</span>
          <div class="m-stack" data-gap="0"><p style="${display('xl')}">Mira Okafor</p><p style="${muted}">Member since March 2024 · Studio, Home, Side projects</p></div>
        </div>
${sectionTitle('Account')}
${well([
  `${rowText('Email', 'mira@pinwheel.studio')}<button type="button" class="m-button" data-variant="secondary" data-size="sm">Edit</button>`,
  `${rowText('Sync across devices', `<span class="m-cluster" data-gap="1">${dot('success', '0.4375rem')} Synced 2 minutes ago</span>`)}${sw('Sync across devices', true)}`,
  `${rowText('Invite a teammate', 'They get their own spaces and can join yours.')}<button type="button" class="m-button" data-variant="secondary" data-size="sm" style="background: var(--m-color-info-bg); color: var(--m-color-info-fg); box-shadow: none">${icon(I.gift)} Send an invite</button>`,
])}
${sectionTitle('Look')}
${well([
  `${rowText('Theme')}<div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Theme"><button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">${icon(I.sun, 14)} Light</button><button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">${icon(I.moon, 14)} Dark</button><button type="button" class="m-tab" role="tab" aria-selected="true">${icon(I.monitor, 14)} Match system</button></div></div>`,
  `${rowText('Sidebar side', 'Where the sidebar sits in every space.')}<select class="m-select" data-size="sm" aria-label="Sidebar side" style="inline-size: 9rem"><option>Left</option><option>Right</option></select>`,
  `${rowText('Show tile labels', 'Names under the shortcut tiles.')}${sw('Show tile labels', false)}`,
])}
${sectionTitle('Keys')}
        <div class="m-stack" data-gap="0" style="border-radius: var(--m-radius-lg); background: var(--m-color-bg-sunken); padding: var(--m-space-3) var(--m-space-4) var(--m-space-1)">
          <input class="m-input" data-size="sm" type="search" placeholder="Find a shortcut, like “split”" aria-label="Find a shortcut">
${[
  ['Open the command bar', keys('⌘', 'K')],
  ['New board', keys('⌘', 'B')],
  ['Pin the current clip', keys('⌘', 'D')],
  ['Open side by side', keys('⌃', '⇧', '=')],
]
  .map(
    ([a, k]) =>
      `          <div class="m-cluster" data-justify="between" style="min-block-size: 3rem; ${hair}; margin-block-start: var(--m-space-1)"><span>${a}</span>${k}</div>`,
  )
  .join('\n')}
        </div>
${sectionTitle('Leave')}
${well([`${rowText('Delete Side projects', 'Removes the space and its 48 clips for everyone in it. This can’t be undone.')}<button type="button" class="m-button" data-variant="danger" data-size="sm">${icon(I.trash2)} Delete space</button>`])}
      </div>
    </div>`,
);

// ── Empty state: a blank board, a nudge, and the command bar ─────────────────────────────────────
const cmdRow = (ic: string, t: string, hint: string, hot = false) =>
  `      <button type="button" class="m-menu-item" role="option" aria-selected="${hot}"${hot ? ' style="background: var(--m-color-accent-default); color: var(--m-color-accent-fg)"' : ''}>${ic}<span style="flex: 1; text-align: start">${t}</span><span class="m-menu-shortcut"${hot ? ' style="color: inherit; opacity: 0.85"' : ''}>${hint}</span></button>`;
const step = (n: string, t: string, d: string) =>
  `        <div class="m-card" data-size="sm" style="flex-direction: row; align-items: start; gap: var(--m-space-3)"><span style="${label}; ${subtle}; padding-block-start: 0.2em">${n}</span><span class="m-stack" data-gap="1"><span style="font-weight: var(--m-font-weight-semibold); font-size: var(--m-font-size-lg)">${t}</span><span style="${muted}">${d}</span></span></div>`;

const emptyState = frame(
  'Boards',
  `${topLine(crumb('Studio', 'Boards', 'Autumn fair stand'), `${iconButton(I.share, 'Share board')}${iconButton(I.ellipsis, 'More')}`)}
    <div class="m-container" data-size="md" style="padding-block: clamp(3rem, 10vh, 6rem) var(--m-space-12)">
      <div class="m-stack" data-gap="10" style="align-items: center">
        <div class="m-stack" data-gap="4" style="align-items: center; text-align: center; max-inline-size: 30rem">
          ${tile('accent', I.layers, '3.5rem', 26)}
          <h1 style="${display('2xl')}">This board is a blank canvas</h1>
          <p style="${muted}; font-size: var(--m-font-size-lg)">Drop links, images and notes here as you find them. Everyone on the board sees them the moment you do.</p>
          <div class="m-cluster" data-gap="2" style="justify-content: center"><button type="button" class="m-button" data-variant="primary">${icon(I.plus)} Add a clip</button><button type="button" class="m-button" data-variant="secondary">${icon(I.upload)} Import bookmarks</button></div>
        </div>
        <div class="m-popover" data-static role="dialog" aria-label="Command bar" style="inline-size: min(100%, 36rem); max-inline-size: 100%">
          <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding: var(--m-space-2) var(--m-space-3) var(--m-space-3)">${icon(I.search)}<input type="text" aria-label="Search or type a command" placeholder="Paste a link or type a command…" style="flex: 1; min-inline-size: 0; border: 0; background: transparent; color: inherit; font: inherit; font-size: var(--m-font-size-lg); outline: none"><kbd class="m-kbd">esc</kbd></div>
          <div class="m-menu" role="listbox" aria-label="Suggestions" style="${hair}; padding-block-start: 6px">
${cmdRow(icon(I.paperclip), 'Paste the link on your clipboard', 'Enter ↵', true)}
${cmdRow(icon(I.fileText), 'New note on this board', '⌘N')}
${cmdRow(icon(I.users), 'Invite people to Autumn fair stand', '')}
${cmdRow(icon(I.download), 'Import a bookmarks file', '')}
          </div>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 13rem; inline-size: 100%">
${step('1', 'Pin what you use daily', 'Shortcut tiles sit at the top of every space.')}
${step('2', 'Group clips into boards', 'Boards tint the sidebar so they’re easy to spot.')}
${step('3', 'Share with a link', 'Guests can look without signing up.')}
        </div>
      </div>
    </div>`,
);

// ── Pricing: the brand band, white plan cards, a hairline FAQ and an indigo footer ──────────────
const wave = `<svg width="100%" height="10" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 240 10" style="display: block; flex: 1; min-inline-size: 2rem; color: inherit; opacity: 0.6"><path d="M0 5 Q 5 0 10 5 T 20 5 T 30 5 T 40 5 T 50 5 T 60 5 T 70 5 T 80 5 T 90 5 T 100 5 T 110 5 T 120 5 T 130 5 T 140 5 T 150 5 T 160 5 T 170 5 T 180 5 T 190 5 T 200 5 T 210 5 T 220 5 T 230 5 T 240 5" fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>`;
const feature = (t: string) =>
  `<li class="m-cluster" data-gap="2" style="flex-wrap: nowrap; align-items: start"><span style="color: var(--m-color-accent-text); display: inline-flex; padding-block-start: 0.15em">${icon(I.check)}</span><span>${t}</span></li>`;
const plan = (
  name: string,
  price: string,
  per: string,
  blurb: string,
  features: string[],
  cta: string,
  featured = false,
) => `        <section class="m-card" data-size="lg" aria-label="${name}" style="border-radius: 16px; gap: var(--m-space-5);${featured ? ' box-shadow: var(--m-shadow-overlay); outline: var(--m-focus-width) solid var(--m-color-accent-default)' : ''}">
          <div class="m-cluster" data-justify="between"><span style="${label}; color: var(--m-color-accent-text)">${name}</span>${featured ? '<span class="m-badge" data-tone="neutral" data-variant="solid">Most loved</span>' : ''}</div>
          <p class="m-cluster" data-gap="2" data-align="baseline"><span style="${display('4xl')}; ${num}">${price}</span><span style="${muted}">${per}</span></p>
          <p style="${muted}">${blurb}</p>
          <button type="button" class="m-button" data-variant="${featured ? 'primary' : 'secondary'}" data-size="lg" style="inline-size: 100%">${cta}</button>
          <ul class="m-stack" data-gap="2" style="list-style: none; margin: 0; padding: 0; ${hair}; padding-block-start: var(--m-space-5)">${features.map(feature).join('')}</ul>
        </section>`;
const faq = (q: string, a: string, open = false) =>
  `      <details class="m-accordion-item" name="pw-faq"${open ? ' open' : ''}><summary>${q}</summary><div class="m-accordion-content">${a}</div></details>`;
const footCol = (h: string, links: string[]) =>
  `        <div class="m-stack" data-gap="3"><span style="font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-semibold); letter-spacing: 0.04em; text-transform: uppercase; opacity: 0.75">${h}</span>${links.map((l) => `<a href="#" style="color: inherit; text-decoration: none; font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-semibold); letter-spacing: 0.03em">${l}</a>`).join('')}</div>`;

const pricing = `<div style="min-block-size: 100vh; background: var(--m-color-bg-surface)">
  <div style="background: var(--m-color-accent-default); color: var(--m-color-brand-fg)">
    <header class="m-navbar" style="background: transparent; color: inherit">
      <a class="m-navbar-brand" href="#" style="color: inherit">Pinwheel</a>
      <nav class="m-navbar-nav" aria-label="Main"><a class="m-navbar-link" href="#" style="color: inherit">Tour</a><a class="m-navbar-link" href="#" style="color: inherit">For teams</a><a class="m-navbar-link" href="#" aria-current="page" style="color: inherit; text-decoration: underline; text-underline-offset: 0.3em">Pricing</a><a class="m-navbar-link" href="#" style="color: inherit">Journal</a></nav>
      <div class="m-navbar-actions"><a class="m-navbar-link" href="#" style="color: inherit">Sign in</a><button type="button" class="m-button" style="background: var(--m-color-bg-surface); color: var(--m-color-brand-default)">Get Pinwheel</button></div>
    </header>
    <div class="m-container" style="padding-block: var(--m-space-12) var(--m-space-16)">
      <div class="m-stack" data-gap="10" style="align-items: center">
        <div class="m-stack" data-gap="4" style="align-items: center; text-align: center; max-inline-size: 40rem">
          <span style="${label}">Plans for every size of studio</span>
          <h1 style="${display('4xl')}">Pick the plan that fits<br>the way you collect.</h1>
          <p style="font-size: var(--m-font-size-lg); opacity: 0.9">Every plan has unlimited clips and spaces. Pay for more people and more room for files.</p>
          <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Billing" style="background: var(--m-color-bg-surface)"><button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Monthly</button><button type="button" class="m-tab" role="tab" aria-selected="true" style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">Yearly · 2 months free</button></div></div>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 17rem; inline-size: 100%; color: var(--m-color-fg-default); align-items: start">
${plan('Sketch', '$0', 'forever', 'For one person keeping a tidy corner of the web.', ['3 spaces, unlimited clips', '1 GB of files', 'Share boards by link'], 'Start for free')}
${plan('Studio', '$8', 'per person, a month', 'For small teams who make things together.', ['Unlimited spaces and boards', '50 GB of files per person', 'Comments and highlights', 'Guest access to any board'], 'Try Studio for 14 days', true)}
${plan('Workshop', '$15', 'per person, a month', 'For agencies juggling many clients at once.', ['Everything in Studio', 'Client spaces with their own branding', 'Version history for a year', 'Priority help, 7 days a week'], 'Talk to us')}
        </div>
        <div class="m-cluster" data-gap="4" style="flex-wrap: nowrap; inline-size: 100%">${wave}<span style="${label}; white-space: nowrap">Also on your phone</span>${wave}</div>
      </div>
    </div>
  </div>
  <section class="m-container" data-size="md" style="padding-block: var(--m-space-16)" aria-labelledby="pw-faq-title">
    <h2 id="pw-faq-title" style="${display('4xl')}; margin-block-end: var(--m-space-8)">Questions</h2>
    <div class="m-accordion" style="border-inline: 0; border-block-start: 0">
${faq('Can I switch plans later?', 'Yes. Changes apply from the next bill, and anything you paid for and didn’t use is credited.', true)}
${faq('What counts as a person?', 'Anyone who can add to your spaces. Guests who only look at a shared board are free.')}
${faq('Do you offer discounts for schools?', 'Students and teachers get Studio for free with a school email address.')}
${faq('What happens to my clips if I stop paying?', 'Nothing is deleted. Your spaces become read-only until you pick a plan again or export them.')}
    </div>
  </section>
  <footer style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg); padding: var(--m-space-10) clamp(1rem, 4vw, 2rem)">
    <div class="m-cluster" data-justify="between" data-align="start" data-gap="8">
      <span style="${display('xl')}">Pinwheel</span>
      <div class="m-cluster" data-gap="10" data-align="start">
${footCol('Pinwheel', ['Tour', 'Pricing', 'For teams', 'Changelog'])}
${footCol('Help', ['Guides', 'Shortcuts', 'Status', 'Contact'])}
${footCol('Company', ['About', 'Jobs', 'Privacy', 'Terms'])}
      </div>
    </div>
  </footer>
</div>`;

// ── Errors: in a field, in a form, in the command bar, as a toast, and as a whole page ───────────
const pageError = (
  ic: string,
  code: string,
  title: string,
  body: string,
  actions: string,
) => `          <div class="m-card" style="align-items: center; text-align: center; gap: var(--m-space-3); padding-block: var(--m-space-8)">
            ${tile('accent', ic, '3rem', 22)}
            ${mono(code)}
            <h3 style="${display('xl')}">${title}</h3>
            <p style="${muted}">${body}</p>
            <div class="m-cluster" data-gap="2" style="justify-content: center">${actions}</div>
          </div>`;
const alertIcon = (paths: string) => `<span class="m-alert-icon" aria-hidden="true">${icon(paths)}</span>`;

const errors = frame(
  'Inbox',
  `${topLine(crumb('Studio', 'Publish a board'), iconButton(I.ellipsis, 'More'))}
    <div class="m-container" data-size="md" style="padding-block: var(--m-space-8) var(--m-space-12)">
      <div class="m-stack" data-gap="10">
        <div class="m-alert" data-tone="warning" role="status">${alertIcon(I.wifiOff)}<div class="m-alert-content"><p class="m-alert-title">You’re offline</p><p class="m-alert-body">Clips you add now are kept on this device and sync when you reconnect.</p></div></div>
        <section class="m-stack" data-gap="5" aria-labelledby="pw-pub">
          <div class="m-stack" data-gap="1">${mono('In a form')}<h1 id="pw-pub" style="${display('2xl')}">Publish Autumn fair stand</h1></div>
          <div class="m-alert" data-tone="danger" role="alert" tabindex="-1">${alertIcon(I.circleAlert)}<div class="m-alert-content"><p class="m-alert-title">2 things need fixing</p><p class="m-alert-body">The board wasn’t published. Nothing changed for the people on it.</p></div></div>
          <div class="m-field">
            <label class="m-field-label" for="pw-slug">Public link</label>
            <input class="m-input" id="pw-slug" type="text" value="autumn-fair" aria-invalid="true" aria-describedby="pw-slug-err">
            <p class="m-field-error" id="pw-slug-err">That link is taken. Try autumn-fair-stand or add the year.</p>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="pw-reply">Email for replies</label>
            <input class="m-input" id="pw-reply" type="email" value="mira@pinwheel" aria-invalid="true" aria-describedby="pw-reply-err">
            <p class="m-field-error" id="pw-reply-err">Add the end of the address, like mira@pinwheel.studio.</p>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="pw-who">Who can see it</label>
            <select class="m-select" id="pw-who"><option>Anyone with the link</option><option>People in Studio</option></select>
          </div>
          <div class="m-cluster" data-justify="end" data-gap="2"><button type="button" class="m-button" data-variant="ghost">Cancel</button><button type="button" class="m-button" data-variant="primary">Publish board</button></div>
        </section>
        <section class="m-grid" style="--m-layout-grid-min: 18rem; align-items: start" aria-label="Command bar and toast">
          <div class="m-stack" data-gap="3">${mono('In the command bar')}
            <div class="m-popover" data-static role="dialog" aria-label="Command bar" style="inline-size: 100%; max-inline-size: 100%">
              <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding: var(--m-space-2) var(--m-space-3) var(--m-space-3)">${icon(I.search)}<span style="flex: 1">quinoa poster</span></div>
              <div class="m-stack" data-gap="1" style="${hair}; align-items: center; text-align: center; padding: var(--m-space-6) var(--m-space-4)"><span style="${subtle}; display: inline-flex">${icon(I.searchX, 20)}</span><p style="font-weight: var(--m-font-weight-medium)">No clips match “quinoa poster”</p><p style="${muted}; font-size: var(--m-font-size-sm)">Press Enter to search the web instead.</p></div>
            </div>
          </div>
          <div class="m-stack" data-gap="3">${mono('Somewhere else')}
            <div class="m-toast-region" data-static aria-live="polite" style="position: static; inline-size: 100%">
              <div class="m-toast" data-tone="danger" role="alert"><div class="m-toast-content"><p class="m-toast-title" style="display: flex; gap: var(--m-space-2); align-items: center"><span style="color: var(--m-color-danger-fg); display: inline-flex">${icon(I.circleAlert)}</span>Couldn’t save “Window display ideas”</p><p class="m-toast-body">The site took too long to answer. Your note was kept.</p></div><div class="m-toast-actions"><button type="button" class="m-button" data-variant="secondary" data-size="sm">Retry</button></div></div>
              <div class="m-toast" data-tone="success" role="status"><div class="m-toast-content"><p class="m-toast-title" style="display: flex; gap: var(--m-space-2); align-items: center"><span style="color: var(--m-color-success-fg); display: inline-flex">${icon(I.circleCheck)}</span>Moved 3 clips to Sundial Tea</p></div><div class="m-toast-actions"><button type="button" class="m-button" data-variant="ghost" data-size="sm">Undo</button></div></div>
            </div>
          </div>
        </section>
        <section class="m-stack" data-gap="4" aria-label="Whole-page errors">
          ${mono('A whole page')}
          <div class="m-grid" style="--m-layout-grid-min: 14rem; align-items: stretch">
${pageError(I.compass, '404', 'Nothing lives here', 'The board may have moved or been deleted.', '<button type="button" class="m-button" data-variant="primary" data-size="sm">Go home</button>')}
${pageError(I.rotateCw, '500', 'Something broke on our side', 'Nothing you made was lost.', '<button type="button" class="m-button" data-variant="primary" data-size="sm">Try again</button><button type="button" class="m-button" data-variant="ghost" data-size="sm">Status</button>')}
${pageError(I.lock, '403', 'This board is private', 'Ask its owner, Ines, to let you in.', '<button type="button" class="m-button" data-variant="primary" data-size="sm">Ask for access</button>')}
          </div>
        </section>
      </div>
    </div>`,
);

export const prismRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Home',
    description:
      'The frame: a borderless sidebar on the space colour (search field, shortcut tiles, the space name, rows with a white current tile, tinted groups, space dots), then a white panel with a heavy greeting, stat cards with tinted icon tiles, stacked bars by group colour and board cards.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'Clips, side by side',
    description:
      'Two panes in the frame, the focused one outlined in the blue: a pill filter, a rounded list with favicon tiles and tinted board tags, and the open clip with its actions, a tinted highlight and a note composer.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Pick a space colour',
    description:
      'One big 20px card on a soft multicolour wash: a mono step label, a heavy heading, a name field, round colour swatches and Continue, beside a preview of the sidebar in the chosen colour.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'Icon tabs along the top with a grey tile behind the current one, then grouped rows in rounded wells: switches, small white buttons, a tinted invite button, a segmented theme control, keycaps and a danger action last.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty board',
    description:
      'A tinted icon tile, a heavy heading, one sentence and two buttons; the command bar with its highlighted row filled in the blue; three numbered first steps.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The brand band (the vivid blue, cream type), a white segmented billing switch, white 16px plan cards with mono labels and heavy prices, a wave-ruled mono caption, a hairline FAQ and an indigo footer.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'An offline notice, a form whose alert says what didn’t happen, fields with their fixes, the command bar with no results, toasts with one action, and 404, 500 and 403 pages.',
    html: errors,
  },
];
