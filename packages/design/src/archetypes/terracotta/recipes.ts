import type { ArchetypeRecipe } from '../types';

/*
 * Terracotta's nine layout recipes (the seven shapes, then `reading` and `sign-in`): framework-free
 * HTML using only @mariachi/design classes and tokens (no colour literals), with sample data from a made-up stays marketplace, "Hearthway". They
 * follow the language's real screen patterns: a white header with a centred pill search bar and a
 * coral search disc, frameless photo cards with 20px corners and a heart, white pill badges on the
 * photos, ink text with grey secondary lines, prices underlined, panels lifted on a soft shadow, hairline
 * sections, underlined text links and full-width coral actions. Photos are never shipped: every image
 * is a token-built placeholder.
 */
// Lucide paths (24×24), copied from the Lucide source
const I: Record<string, string> = {
  'sliders-horizontal': '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
  'circle-user': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>',
  heart: '<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  house: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  'map-pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  'message-square': '<path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/>',
  'key-round': '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
  wifi: '<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/>',
  'chart-column': '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  'layout-grid': '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  list: '<path d="M3 5h.01"/><path d="M3 12h.01"/><path d="M3 19h.01"/><path d="M8 5h13"/><path d="M8 12h13"/><path d="M8 19h13"/>',
  'calendar-days': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  share: '<path d="M12 2v13"/><path d="m16 6-4-4-4 4"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>',
  'bed-double': '<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/><path d="M2 18h20"/>',
  trees: '<path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5"/>',
  flame: '<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/>',
  mountain: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
  waves: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  tent: '<path d="M3.5 21 14 3"/><path d="M20.5 21 10 3"/><path d="M15.5 21 12 15l-3.5 6"/><path d="M2 21h20"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  menu: '<path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  sparkles: '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  settings: '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  'trash-2': '<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-up': '<path d="m18 15-6-6-6 6"/>',
  'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  'circle-check': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  'circle-alert': '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  'triangle-alert': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  'credit-card': '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  'receipt-text': '<path d="M13 16H8"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  'bell-ring': '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M22 8c0-2.3-.8-4.3-2-6"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/><path d="M4 2C2.8 3.7 2 5.7 2 8"/>',
  languages: '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
  'briefcase-business': '<path d="M12 12h.01"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M22 13a18.15 18.15 0 0 1-20 0"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  'user-round': '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  'file-text': '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  'clock-3': '<path d="M12 6v6h4"/><circle cx="12" cy="12" r="10"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  'car-front': '<path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8"/><path d="M7 14h.01"/><path d="M17 14h.01"/><rect width="18" height="8" x="3" y="10" rx="2"/><path d="M5 18v2"/><path d="M19 18v2"/>',
  snowflake: '<path d="m10 20-1.25-2.5L6 18"/><path d="M10 4 8.75 6.5 6 6"/><path d="m14 20 1.25-2.5L18 18"/><path d="m14 4 1.25 2.5L18 6"/><path d="m17 21-3-6h-4"/><path d="m17 3-3 6 1.5 3"/><path d="M2 12h6.5L10 9"/><path d="m20 10-1.5 2 1.5 2"/><path d="M22 12h-6.5L14 15"/><path d="m4 10 1.5 2L4 14"/><path d="m7 21 3-6-1.5-3"/><path d="m7 3 3 6h4"/>',
  mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
  phone: '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  ellipsis: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  'cloud-off': '<path d="M10.94 5.274A7 7 0 0 1 15.71 10h1.79a4.5 4.5 0 0 1 4.222 6.057"/><path d="M18.796 18.81A4.5 4.5 0 0 1 17.5 19H9A7 7 0 0 1 5.79 5.78"/><path d="m2 2 20 20"/>',
  'server-crash': '<path d="M6 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M6 14H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2"/><path d="M6 6h.01"/><path d="M6 18h.01"/><path d="m13 6-4 6h6l-4 6"/>',
  compass: '<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/>',
};
I['circle-help'] =
  '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>';

// Lucide icons, outlined, 2px stroke: the reference's own icons are drawn at about that weight
const icon = (name: string, size = 16, stroke = 2) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[name]}</svg>`;
// A filled glyph (the rating star, the saved heart)
const solid = (name: string, size = 12) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round" aria-hidden="true">${I[name]}</svg>`;

// Photo placeholders: a soft two-token wash with a thin outline glyph, never a picture
const washes = [
  ['--m-color-brand-subtle', '--m-color-warning-bg'],
  ['--m-color-info-bg', '--m-color-success-bg'],
  ['--m-color-warning-bg', '--m-color-bg-sunken'],
  ['--m-color-success-bg', '--m-color-info-bg'],
  ['--m-color-bg-sunken', '--m-color-brand-subtle'],
  ['--m-color-accent-subtle', '--m-color-info-bg'],
];
const photo = (n: number, glyph: string, label: string, extra = '', ratio = '20 / 19', radius = 'var(--m-radius-lg)') => {
  const [a, b] = washes[n % washes.length];
  return `<div role="img" aria-label="${label}" style="position: relative; aspect-ratio: ${ratio}; border-radius: ${radius}; background: linear-gradient(160deg, var(${a}), var(${b})); display: grid; place-items: center; color: var(--m-color-fg-subtle); overflow: hidden">${icon(glyph, 40, 1.25)}${extra}</div>`;
};
// The white pill that sits on a photo, and the heart in the corner
const onPhotoBadge = (text: string) =>
  `<span class="m-badge" style="position: absolute; inset-block-start: var(--m-space-3); inset-inline-start: var(--m-space-3); border-color: transparent; box-shadow: var(--m-shadow-sm)">${text}</span>`;
const heart = (saved = false) =>
  `<button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="${saved ? 'Remove from saved' : 'Save'}" aria-pressed="${saved}" style="position: absolute; inset-block-start: var(--m-space-2); inset-inline-end: var(--m-space-2); color: var(--m-color-brand-default)">${saved ? solid('heart', 24) : `<svg width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke-linejoin="round" aria-hidden="true" style="fill: var(--m-color-fg-default); fill-opacity: 0.5; stroke: var(--m-color-bg-canvas)">${I.heart}</svg>`}</button>`;

const rating = (score: string, count?: string) =>
  `<span class="m-cluster" data-gap="1" style="font-size: var(--m-font-size-sm); white-space: nowrap; flex: none">${solid('star', 12)} ${score}${count ? ` (${count})` : ''}</span>`;

// A listing card: the photo, then the title, two grey lines and the price underlined
const listing = (n: number, glyph: string, title: string, sub: string, dates: string, price: string, score: string, badge = '', saved = false, was = '') => `<a class="m-stack" data-gap="3" href="#" style="color: inherit; text-decoration: none">
            ${photo(n, glyph, title, `${badge ? onPhotoBadge(badge) : ''}${heart(saved)}`)}
            <div class="m-stack" data-gap="0" style="line-height: var(--m-font-leading-tight)">
              <div class="m-cluster" data-justify="between" data-gap="2" style="flex-wrap: nowrap"><span style="font-weight: var(--m-font-weight-medium)">${title}</span>${rating(score)}</div>
              <span class="m-muted">${sub}</span>
              <span class="m-muted">${dates}</span>
              <span style="margin-block-start: var(--m-space-1)">${was ? `<s class="m-muted">${was}</s> ` : ''}<span style="text-decoration: underline; font-weight: var(--m-font-weight-semibold)">${price}</span></span>
            </div>
          </a>`;

const h1 = 'font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)';
const h2 = 'font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)';
// Public reading pages set their section headings at 500, as the source's articles do
const h2Public = h2.replace('semibold', 'medium');
const h3 = 'font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-semibold)';
const small = 'font-size: var(--m-font-size-sm)';
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)';
const link = 'color: var(--m-color-fg-default); text-decoration: underline; font-weight: var(--m-font-weight-medium)';
// The booking action: the coral gradient from the resting stop to the hover stop, in a pill
const gradientCta =
  '--m-button-primary-bg: linear-gradient(to right, var(--m-color-accent-default), var(--m-color-accent-hover)); --m-button-radius: var(--m-radius-full); inline-size: 100%';
// The host side's ink action
const inkCta =
  '--m-button-primary-bg: var(--m-color-bg-inverse); --m-button-primary-border: var(--m-color-bg-inverse); --m-button-primary-fg: var(--m-color-fg-inverse); --m-button-primary-hover-bg: var(--m-color-fg-default); --m-button-primary-active-bg: var(--m-color-fg-default)';

// The word mark: an outline glyph and the name in the signature coral
const brand = `<a class="m-navbar-brand" href="#" style="color: var(--m-color-brand-default); gap: var(--m-space-1); font-weight: var(--m-font-weight-semibold)">${icon('flame', 30, 2.25)} hearthway</a>`;
const userMenu = `<div class="m-navbar-actions">
      <a class="m-navbar-link" href="#">Host a place</a>
      <button type="button" class="m-button" data-size="sm" data-icon-only aria-label="Menu, with language and currency" style="--m-button-radius: var(--m-radius-full)">${icon('menu', 16)}</button>
    </div>`;

// The pill search bar: three segments split by hairlines and a coral search disc; its edge is the elevation's 1px ring, not a border
const seg = (label: string, value: string, last = false) =>
  `<button type="button" class="m-stack" data-gap="0" style="flex: 1 1 0; min-inline-size: 0; text-align: start; padding: var(--m-space-3) var(--m-space-6); border: 0; border-radius: var(--m-radius-full); background: transparent; color: inherit; font: inherit; cursor: pointer${last ? '' : '; box-shadow: inset calc(-1 * var(--m-border-width-thin)) 0 0 var(--m-color-border-default)'}"><span style="font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-semibold)">${label}</span><span class="m-muted" style="${small}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">${value}</span></button>`;
const searchBar = (where: string, when: string, who: string) => `<div role="search" class="m-cluster" data-gap="0" style="flex-wrap: nowrap; max-inline-size: 53rem; margin-inline: auto; inline-size: 100%; padding-inline-end: var(--m-space-2); border-radius: var(--m-radius-full); background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-md)">
      ${seg('Where', where)}${seg('When', when)}${seg('Who', who, true)}
      <button type="button" class="m-button" data-variant="primary" data-icon-only aria-label="Search" style="--m-button-primary-bg: var(--m-color-brand-default); --m-button-primary-border: var(--m-color-brand-default); --m-button-primary-hover-bg: var(--m-color-accent-default); --m-button-radius: var(--m-radius-full); flex: none">${icon('search', 16, 3)}</button>
    </div>`;
const compactSearch = `<div role="search" class="m-cluster" data-gap="0" style="flex-wrap: nowrap; max-inline-size: 100%; padding: var(--m-space-1) var(--m-space-1) var(--m-space-1) var(--m-space-2); border-radius: var(--m-radius-full); box-shadow: var(--m-shadow-sm); font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-medium); --m-button-padding-x-sm: var(--m-space-3)">
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="--m-button-radius: var(--m-radius-full); font-size: var(--m-font-size-sm)">Lisbon coast</button>
      <span aria-hidden="true" style="block-size: 1.5rem; border-inline-start: var(--m-border-width-thin) solid var(--m-color-border-default)"></span>
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="--m-button-radius: var(--m-radius-full); font-size: var(--m-font-size-sm)">Mar 6 – 11</button>
      <span aria-hidden="true" style="block-size: 1.5rem; border-inline-start: var(--m-border-width-thin) solid var(--m-color-border-default)"></span>
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="--m-button-radius: var(--m-radius-full); font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-regular)">3 guests</button>
      <button type="button" class="m-button" data-variant="primary" data-size="sm" data-icon-only aria-label="Search" style="--m-button-primary-bg: var(--m-color-brand-default); --m-button-primary-border: var(--m-color-brand-default); --m-button-radius: var(--m-radius-full); --m-button-height-sm: 2rem; flex: none">${icon('search', 14, 3)}</button>
    </div>`;

// The guest header. Recipes have no media queries, so it is laid out as flow: the mark floats to the
// start and the icon buttons to the end, and the search (its own formatting context, at least 20rem
// wide) sits centred between them while there is room. On a phone it can't fit beside them, so it drops
// under them as one full-width row; the mark and the buttons keep the first row. Below 20rem of free
// space nothing squeezes: the search moves, it never shrinks.
const startSlot = 'float: inline-start; display: flex; align-items: center; block-size: 3rem; margin-inline-end: var(--m-space-6); margin-block-end: var(--m-space-3)';
const endSlot = 'float: inline-end; display: flex; align-items: center; block-size: 3rem; margin-inline-start: var(--m-space-6); margin-block-end: var(--m-space-3)';
const searchSlot = 'display: flex; justify-content: center; align-items: center; min-block-size: 3rem; min-inline-size: 20rem';
const guestHeader = (search: string, actions = userMenu, mark = brand) => `<header class="m-navbar" style="display: flow-root; block-size: auto; padding-block: var(--m-space-4) var(--m-space-1)">
    <div style="${startSlot}">${mark}</div>
    <div style="${endSlot}">${actions}</div>
    ${search ? `<div style="${searchSlot}">${search}</div>` : ''}
  </header>`;

// ---------------------------------------------------------------------------------------------
// Dashboard: the host's Today, laid out for a desktop

const hostNav = (current: string) => `<header class="m-navbar">
    ${brand}
    <nav class="m-navbar-nav" aria-label="Hosting">
${['Today', 'Calendar', 'Listings', 'Inbox']
  .map((l) => `      <a class="m-navbar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${l}</a>`)
  .join('\n')}
    </nav>
    <div class="m-navbar-actions">
      <a class="m-navbar-link" href="#">Switch to travelling</a>
      <button type="button" class="m-button" data-size="sm" data-icon-only aria-label="Menu" style="--m-button-radius: var(--m-radius-full)">${icon('menu', 16)}</button>
      <span class="m-avatar" data-size="sm" aria-label="Ines Varga">IV</span>
    </div>
  </header>`;

const stay = (initials: string, who: string, guests: string, place: string, dates: string, tone: string, status: string) => `<article class="m-card" data-size="sm" style="flex: 0 0 17rem; --m-card-border: transparent; --m-card-shadow: var(--m-shadow-md)">
            <div class="m-card-body m-stack" data-gap="3">
              <div class="m-cluster" data-justify="between"><span class="m-badge" data-tone="${tone}">${status}</span><span class="m-muted" style="${small}">${dates}</span></div>
              <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap"><span class="m-avatar">${initials}</span><span class="m-stack" data-gap="0"><span style="font-weight: var(--m-font-weight-semibold)">${who}</span><span class="m-muted" style="${small}">${guests}</span></span></div>
              <span class="m-muted" style="${small}">${place}</span>
            </div>
          </article>`;

// Earnings this year against last year: a coral line over a dotted plum one
const thisYear = [18, 22, 30, 34, 41, 52, 66, 71, 58, 46, 38, 44];
const lastYear = [20, 19, 26, 31, 36, 47, 55, 61, 54, 40, 33, 36];
const path = (pts: number[]) => pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * 600) / (pts.length - 1)},${170 - v * 2.2}`).join(' ');
const earningsChart = `<svg viewBox="0 0 600 180" width="100%" preserveAspectRatio="none" style="display: block; block-size: 11rem" role="img" aria-label="Earnings by month: this year above last year from April, peaking in August">
              <path d="M0,170 H600" fill="none" style="stroke: var(--m-color-border-default)" vector-effect="non-scaling-stroke"/>
              <path d="${path(lastYear)}" fill="none" style="stroke: var(--m-color-accent-active)" stroke-width="2" stroke-dasharray="2 5" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
              <path d="${path(thisYear)}" fill="none" style="stroke: var(--m-color-brand-default)" stroke-width="2.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
              <circle cx="${(7 * 600) / 11}" cy="${170 - 71 * 2.2}" r="5" style="fill: var(--m-color-bg-surface); stroke: var(--m-color-brand-default)" stroke-width="2.5"/>
            </svg>`;
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const dashboard = `<div class="m-stack" data-gap="0" style="min-block-size: 100vh">
  ${hostNav('Today')}
  <main class="m-container" style="padding-block: var(--m-space-10) var(--m-space-16)">
    <div class="m-stack" data-gap="10">
      <div class="m-stack" data-gap="6">
        <h1 style="${h1}">Good morning, Ines</h1>
        <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Reservations">
          <button type="button" class="m-tab" role="tab" aria-selected="true">Arriving soon (3)</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Staying now (2)</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Upcoming (9)</button>
        </div></div>
        <div class="m-cluster" data-gap="4" style="flex-wrap: nowrap; overflow-x: auto; padding: var(--m-space-2) var(--m-space-1) var(--m-space-4)">
          ${stay('MO', 'Marcus Osei', '2 adults', 'Stone cottage above the vineyard', 'Tomorrow', 'warning', 'Arrives tomorrow')}
          ${stay('PS', 'Priya and Sam', '2 adults · 1 dog', 'Loft by the canal', 'Thu – Sun', 'info', 'Check-in Thursday')}
          ${stay('TK', 'Tomasz Kowal', '4 adults', 'Cedar cabin with a sauna', 'Sat – Tue', 'neutral', 'Confirmed')}
          ${stay('LB', 'Lena Brandt', '1 adult', 'Stone cottage above the vineyard', 'Mar 14 – 18', 'neutral', 'Request')}
        </div>
      </div>
      <div class="m-cluster" data-gap="6" data-align="start">
        <section class="m-card" data-variant="outline" aria-labelledby="tc-earn" style="flex: 2 1 28rem">
          <div class="m-card-body m-stack" data-gap="4">
            <div class="m-cluster" data-justify="between" data-align="start">
              <div class="m-stack" data-gap="1">
                <h2 id="tc-earn" style="${h3}">Earnings</h2>
                <span style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-tight); font-variant-numeric: tabular-nums">$24,318</span>
                <span class="m-muted" style="${small}">This year so far · <span style="color: var(--m-color-success-fg); font-weight: var(--m-font-weight-medium)">+14% on last year</span></span>
              </div>
              <button type="button" class="m-button" data-size="sm">2026 ${icon('chevron-down', 14)}</button>
            </div>
            ${earningsChart}
            <div class="m-cluster" data-justify="between" style="font-size: var(--m-font-size-xs); color: var(--m-color-fg-muted)">${months.map((m) => (m === 'Aug' ? `<span class="m-badge" data-variant="solid" data-tone="neutral">${m}</span>` : `<span>${m}</span>`)).join('')}</div>
            <ul class="m-stack" data-gap="2" style="padding: 0; list-style: none; ${small}">
              <li class="m-cluster" data-justify="between"><span class="m-cluster" data-gap="2"><span aria-hidden="true" style="inline-size: 0.5rem; block-size: 0.5rem; border-radius: var(--m-radius-full); background: var(--m-color-brand-default)"></span>August 2026</span><span style="font-variant-numeric: tabular-nums; font-weight: var(--m-font-weight-medium)">$4,615.40</span></li>
              <li class="m-cluster" data-justify="between"><span class="m-cluster" data-gap="2"><span aria-hidden="true" style="inline-size: 0.5rem; block-size: 0.5rem; border-radius: var(--m-radius-full); background: var(--m-color-accent-active)"></span>August 2025</span><span class="m-muted" style="font-variant-numeric: tabular-nums">$3,980.15</span></li>
            </ul>
          </div>
        </section>
        <div class="m-stack" data-gap="6" style="flex: 1 1 18rem">
          <section class="m-card" data-variant="outline" aria-labelledby="tc-todo">
            <div class="m-card-body m-stack" data-gap="4">
              <h2 id="tc-todo" style="${h3}">To do</h2>
              <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
                <li class="m-cluster" data-justify="between" style="padding-block: var(--m-space-3); flex-wrap: nowrap"><span class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${icon('message-square', 20)}<span class="m-stack" data-gap="0"><span style="font-weight: var(--m-font-weight-medium)">Reply to Lena</span><span class="m-muted" style="${small}">Asked about late check-in</span></span></span>${icon('chevron-right', 16)}</li>
                <li class="m-cluster" data-justify="between" style="padding-block: var(--m-space-3); flex-wrap: nowrap; ${hair}"><span class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${icon('star', 20)}<span class="m-stack" data-gap="0"><span style="font-weight: var(--m-font-weight-medium)">Review Noor's stay</span><span class="m-muted" style="${small}">4 days left to write it</span></span></span>${icon('chevron-right', 16)}</li>
                <li class="m-cluster" data-justify="between" style="padding-block: var(--m-space-3); flex-wrap: nowrap; ${hair}"><span class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${icon('key-round', 20)}<span class="m-stack" data-gap="0"><span style="font-weight: var(--m-font-weight-medium)">Add door code</span><span class="m-muted" style="${small}">Cedar cabin, before Saturday</span></span></span>${icon('chevron-right', 16)}</li>
              </ul>
            </div>
          </section>
          <section class="m-card" data-variant="sunken" aria-labelledby="tc-tip">
            <div class="m-card-body m-stack" data-gap="3">
              ${icon('sparkles', 24)}
              <h2 id="tc-tip" style="${h3}">Weekends in March are filling fast</h2>
              <p style="${small}">Homes like yours nearby are 82% booked. A nightly price of $168 would keep you in the top results.</p>
              <div><a href="#" style="${link}">See price tips</a></div>
            </div>
          </section>
        </div>
      </div>
      <section class="m-stack" data-gap="6" aria-labelledby="tc-listings">
        <div class="m-cluster" data-justify="between"><h2 id="tc-listings" style="${h2}">Your listings</h2><a href="#" style="${link}">Manage all</a></div>
        <div class="m-grid" style="--m-layout-grid-min: 14rem; --m-layout-grid-gap: var(--m-space-6)">
          ${listing(0, 'house', 'Stone cottage above the vineyard', 'Cortona, Italy', 'Booked 21 of 30 nights', '$214 night', '4.93', 'Listed')}
          ${listing(1, 'waves', 'Loft by the canal', 'Ghent, Belgium', 'Booked 17 of 30 nights', '$146 night', '4.88', 'Listed')}
          ${listing(2, 'trees', 'Cedar cabin with a sauna', 'Lake Placid, New York', 'Booked 9 of 30 nights', '$232 night', '4.97', 'Listed')}
          ${listing(4, 'image', 'Garden room', 'Cortona, Italy', 'Finish 3 steps to publish', 'Draft', '—', 'In progress')}
        </div>
      </section>
    </div>
  </main>
</div>`;

// ---------------------------------------------------------------------------------------------
// List and detail: search results beside a map, then a listing's own page

const chip = (label: string, glyph = '', pressed = false) =>
  `<button type="button" class="m-button" data-size="sm" aria-pressed="${pressed}" style="--m-button-height-sm: 2.125rem; --m-button-padding-x-sm: var(--m-space-3); --m-button-radius: var(--m-radius-full); --m-button-secondary-bg: ${pressed ? 'var(--m-color-bg-sunken)' : 'var(--m-color-bg-surface)'}; --m-button-secondary-border: ${pressed ? 'var(--m-color-fg-default)' : 'var(--m-color-border-default)'}; --m-button-secondary-hover-bg: var(--m-color-bg-surface); --m-button-font-size: var(--m-font-size-xs); --m-button-font-weight: var(--m-font-weight-regular); flex: none; white-space: nowrap">${glyph ? icon(glyph, 14) : ''}${label}</button>`;
const pin = (price: string, x: number, y: number, current = false) =>
  `<span class="m-badge" style="position: absolute; inset-inline-start: ${x}%; inset-block-start: ${y}%; font-size: var(--m-font-size-sm); --m-badge-height: 1.75rem; box-shadow: var(--m-shadow-sm); border-color: transparent${current ? '; background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)' : ''}">${price}</span>`;
// The map is a picture layer with the price pins and zoom laid over it
const mapPanel = `<div style="position: relative; block-size: 100%; min-block-size: 32rem; border-radius: var(--m-radius-lg); overflow: hidden">
            <div role="img" aria-label="Map of the results" style="position: absolute; inset: 0; background:
              radial-gradient(circle at 70% 85%, var(--m-color-info-bg) 0 22%, transparent 22.5%),
              linear-gradient(115deg, transparent 47%, var(--m-color-border-default) 47% 47.6%, transparent 47.6%),
              linear-gradient(20deg, transparent 62%, var(--m-color-border-default) 62% 62.5%, transparent 62.5%),
              linear-gradient(160deg, var(--m-color-success-bg), var(--m-color-bg-sunken) 55%)"></div>
            ${pin('$184', 18, 22)}${pin('$212', 52, 16)}${pin('$139', 34, 46, true)}${pin('$265', 66, 40)}${pin('$158', 44, 70)}${pin('$301', 12, 64)}
            <div class="m-stack" data-gap="0" style="position: absolute; inset-block-start: var(--m-space-4); inset-inline-end: var(--m-space-4); border-radius: var(--m-radius-md); background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-sm)">
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Zoom in">${icon('plus', 16)}</button>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Zoom out" style="${hair}"><span aria-hidden="true" style="inline-size: 0.75rem; border-block-start: var(--m-border-width-thick) solid currentColor"></span></button>
            </div>
          </div>`;

const results = `<section class="m-stack" data-gap="6" aria-labelledby="tc-results">
      <div class="m-cluster" data-gap="2" style="padding-block: var(--m-space-2); flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none">
        ${chip('Filters', 'sliders-horizontal')}
        <span aria-hidden="true" style="block-size: 1.5rem; border-inline-start: var(--m-border-width-thin) solid var(--m-color-border-default)"></span>
        ${chip('Sea view', '', true)}${chip('Book instantly')}${chip('Pool')}${chip('Workspace')}${chip('Pets welcome')}${chip('Free cancellation')}${chip('2+ bedrooms')}
      </div>
      <div class="m-cluster" data-gap="6" data-align="stretch" style="flex-wrap: wrap">
        <div class="m-stack" data-gap="6" style="flex: 3 1 30rem">
          <h1 id="tc-results" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold)">280 places on the Lisbon coast</h1>
          <div class="m-grid" style="--m-layout-grid-min: 15rem; --m-layout-grid-gap: var(--m-space-10) var(--m-space-6)">
            ${listing(0, 'house', 'Whitewashed flat in Cascais', 'Two bedrooms · Sea view', 'Hosted by Joana · Mar 6 – 11', '$920 total', '4.91', 'Top rated')}
            ${listing(1, 'waves', 'Surf house in Ericeira', 'Four beds · Garden', 'Hosted by Rui · Mar 6 – 11', '$695 total', '4.84', '', true, '$780')}
            ${listing(3, 'trees', 'Cork oak cottage', 'One bedroom · Wood stove', 'Hosted by Marta · Mar 6 – 11', '$1,325 total', '4.98', 'Rare find')}
            ${listing(2, 'sun', 'Rooftop studio in Alfama', 'Studio · Terrace', 'Hosted by Duarte · Mar 6 – 11', '$790 total', '4.79')}
          </div>
          <nav class="m-pagination" aria-label="Results pages" style="justify-content: center">
            <a class="m-pagination-item" href="#" aria-label="Previous page" aria-disabled="true">${icon('chevron-left', 16)}</a>
            <a class="m-pagination-item" href="#" aria-current="page">1</a>
            <a class="m-pagination-item" href="#">2</a>
            <a class="m-pagination-item" href="#">3</a>
            <span class="m-pagination-ellipsis">…</span>
            <a class="m-pagination-item" href="#">15</a>
            <a class="m-pagination-item" href="#" aria-label="Next page">${icon('chevron-right', 16)}</a>
          </nav>
        </div>
        <div style="flex: 2 1 22rem">${mapPanel}</div>
      </div>
    </section>`;

const amenity = (glyph: string, label: string) =>
  `<li class="m-cluster" data-gap="4" style="flex-wrap: nowrap">${icon(glyph, 24, 1.5)}<span>${label}</span></li>`;
const booking = `<aside class="m-card" style="position: sticky; inset-block-start: var(--m-space-6)" aria-labelledby="tc-book">
            <div class="m-card-body m-stack" data-gap="6">
              <div class="m-cluster" data-gap="1" data-align="baseline"><span id="tc-book" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold); text-decoration: underline">$184</span><span>night</span></div>
              <div class="m-stack" data-gap="0" style="border: var(--m-border-width-thin) solid var(--m-color-border-strong); border-radius: var(--m-radius-md); overflow: hidden">
                <div class="m-cluster" data-gap="0" style="flex-wrap: nowrap">
                  <button type="button" class="m-stack" data-gap="0" style="flex: 1 1 0; text-align: start; padding: var(--m-space-3); border: 0; background: transparent; color: inherit; font: inherit; box-shadow: inset calc(-1 * var(--m-border-width-thin)) 0 0 var(--m-color-border-strong)"><span style="font-size: 0.625rem; font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-wide); text-transform: uppercase">Arrive</span><span style="${small}">3/6/2027</span></button>
                  <button type="button" class="m-stack" data-gap="0" style="flex: 1 1 0; text-align: start; padding: var(--m-space-3); border: 0; background: transparent; color: inherit; font: inherit"><span style="font-size: 0.625rem; font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-wide); text-transform: uppercase">Leave</span><span style="${small}">3/11/2027</span></button>
                </div>
                <button type="button" class="m-cluster" data-justify="between" style="padding: var(--m-space-3); border: 0; background: transparent; color: inherit; font: inherit; text-align: start; ${hair.replace('default', 'strong')}"><span class="m-stack" data-gap="0"><span style="font-size: 0.625rem; font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-wide); text-transform: uppercase">Guests</span><span style="${small}">3 guests</span></span>${icon('chevron-down', 20)}</button>
              </div>
              <button type="button" class="m-button" data-variant="primary" style="${gradientCta}">Book these dates</button>
              <p class="m-muted" style="${small}; text-align: center">Nothing is charged yet</p>
              <dl class="m-stack" data-gap="3" style="margin: 0">
                <div class="m-cluster" data-justify="between"><dt style="text-decoration: underline">$184 × 5 nights</dt><dd style="margin: 0">$920</dd></div>
                <div class="m-cluster" data-justify="between"><dt style="text-decoration: underline">Cleaning</dt><dd style="margin: 0">$45</dd></div>
                <div class="m-cluster" data-justify="between"><dt style="text-decoration: underline">Booking fee</dt><dd style="margin: 0">$127</dd></div>
                <div class="m-cluster" data-justify="between" style="padding-block-start: var(--m-space-6); ${hair}; font-weight: var(--m-font-weight-semibold)"><dt>Total</dt><dd style="margin: 0">$1,092</dd></div>
              </dl>
            </div>
          </aside>`;

// The photo mosaic. It responds without a media query: a flex row of a fixed height that wraps and clips.
// From about 45rem the large photo and the 2 × 2 block share one row; on a phone the block wraps to a
// second row, which the fixed height cuts off, so the page opens on one photo with the count on it.
const mosaicTile = (n: number, glyph: string, label: string) =>
  photo(n, glyph, label, '', 'auto', '0').replace('aspect-ratio: auto', 'block-size: 100%');
const mosaic = `<div style="position: relative; display: flex; flex-wrap: wrap; align-content: flex-start; gap: var(--m-space-2); block-size: clamp(16rem, 30vw, 25rem); border-radius: var(--m-radius-md); overflow: hidden">
        <div style="flex: 2 1 22rem; block-size: 100%">${mosaicTile(0, 'house', 'Living room facing the bay')}</div>
        <div style="flex: 1 1 22rem; block-size: 100%; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: var(--m-space-2)">
          ${mosaicTile(1, 'bed-double', 'Main bedroom')}
          ${mosaicTile(2, 'utensils', 'Kitchen')}
          ${mosaicTile(3, 'sun', 'Terrace')}
          ${mosaicTile(5, 'waves', 'The beach')}
        </div>
        <button type="button" class="m-button" data-size="sm" style="position: absolute; inset-block-end: var(--m-space-4); inset-inline-end: var(--m-space-4); --m-button-secondary-bg: var(--m-color-bg-surface); --m-button-secondary-border: transparent; --m-button-radius: var(--m-radius-sm); --m-button-font-size: var(--m-font-size-xs); box-shadow: var(--m-shadow-sm)">${icon('layout-grid', 14)} All 32 photos</button>
      </div>`;

// A sleeping card: a photo with 12px corners, the room at 500, the beds in grey
const bedroom = (n: number, room: string, beds: string) => `<div class="m-stack" data-gap="3">
              ${photo(n, 'bed-double', room, '', '3 / 2', 'var(--m-radius-md)')}
              <div class="m-stack" data-gap="0"><span style="font-weight: var(--m-font-weight-medium)">${room}</span><span class="m-muted" style="${small}">${beds}</span></div>
            </div>`;

// Reviews: the score large and centred, the categories split by short hairlines, then two columns of
// reviews (avatar, name, a grey line, small ink stars with the date, three lines of text, Read more)
const stars = (n: number) =>
  `<span role="img" aria-label="Rated ${n} out of 5" style="display: inline-flex; gap: 1px">${solid('star', 10).repeat(n)}</span>`;
const category = (label: string, score: string, glyph: string, first = false) => `<div class="m-stack" data-gap="4" style="padding-inline: var(--m-space-4)${first ? '' : '; border-inline-start: var(--m-border-width-thin) solid var(--m-color-border-default)'}">
              <span class="m-stack" data-gap="0" style="font-size: var(--m-font-size-xs)"><span style="font-weight: var(--m-font-weight-medium)">${label}</span><span>${score}</span></span>
              ${icon(glyph, 24, 1.5)}
            </div>`;
const review = (initials: string, name: string, line: string, n: number, when: string, text: string) => `<article class="m-stack" data-gap="3">
              <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap"><span class="m-avatar" data-size="md">${initials}</span><span class="m-stack" data-gap="0"><span style="font-weight: var(--m-font-weight-medium)">${name}</span><span class="m-muted" style="${small}">${line}</span></span></div>
              <p class="m-cluster" data-gap="2" style="${small}">${stars(n)}<span class="m-muted">· ${when}</span></p>
              <p style="display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden">${text}</p>
              <div><a href="#" style="${link}">Read more</a></div>
            </article>`;

// One place on a map: the 48px ink disc with a white house and a short point, on the small shadow
const placePin = `<span style="position: absolute; inset-inline-start: 50%; inset-block-start: 45%; translate: -50% -50%; display: grid; place-items: center">
              <span aria-hidden="true" style="position: absolute; inset-block-end: -0.3rem; inline-size: 0.75rem; block-size: 0.75rem; rotate: 45deg; background: var(--m-color-bg-inverse)"></span>
              <span role="img" aria-label="The flat's location" style="position: relative; display: grid; place-items: center; inline-size: 3rem; block-size: 3rem; border-radius: var(--m-radius-full); background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse); box-shadow: var(--m-shadow-sm)">${icon('house', 20)}</span>
            </span>`;
const placeMap = `<div style="position: relative; block-size: clamp(18rem, 34vw, 30rem); border-radius: var(--m-radius-lg); overflow: hidden">
            <div role="img" aria-label="Map of Cascais and the coast" style="position: absolute; inset: 0; background:
              radial-gradient(ellipse at 15% 110%, var(--m-color-info-bg) 0 38%, transparent 38.5%),
              linear-gradient(105deg, transparent 52%, var(--m-color-border-default) 52% 52.5%, transparent 52.5%),
              linear-gradient(15deg, transparent 40%, var(--m-color-border-default) 40% 40.4%, transparent 40.4%),
              linear-gradient(170deg, var(--m-color-bg-sunken), var(--m-color-success-bg) 70%)"></div>
            ${placePin}
            <div class="m-stack" data-gap="0" style="position: absolute; inset-block-start: var(--m-space-4); inset-inline-end: var(--m-space-4); border-radius: var(--m-radius-md); background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-sm)">
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Zoom in">${icon('plus', 16)}</button>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Zoom out" style="${hair}"><span aria-hidden="true" style="inline-size: 0.75rem; border-block-start: var(--m-border-width-thick) solid currentColor"></span></button>
            </div>
          </div>`;

const knowing = (glyph: string, title: string, line: string, more = true) => `<div class="m-stack" data-gap="3" style="${small}">
              ${icon(glyph, 24, 1.5)}
              <div class="m-stack" data-gap="1"><span style="font-weight: var(--m-font-weight-medium)">${title}</span><span class="m-muted">${line}</span>${more ? `<span><a href="#" style="${link}">Read more</a></span>` : ''}</div>
            </div>`;

const detail = `<article class="m-stack" data-gap="8" aria-labelledby="tc-title">
      <div class="m-cluster" data-justify="between">
        <h2 id="tc-title" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-medium); line-height: var(--m-font-leading-tight)">Whitewashed flat in Cascais</h2>
        <div class="m-cluster" data-gap="1">
          <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="--m-button-radius: var(--m-radius-sm); text-decoration: underline; font-size: var(--m-font-size-sm)">${icon('share', 16)} Send</button>
          <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="--m-button-radius: var(--m-radius-sm); text-decoration: underline; font-size: var(--m-font-size-sm)">${icon('heart', 16)} Save</button>
        </div>
      </div>
      ${mosaic}
      <div class="m-cluster" data-gap="16" data-align="start">
        <div class="m-stack" data-gap="8" style="flex: 1 1 28rem">
          <div class="m-stack" data-gap="1">
            <h3 style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-tight)">Entire flat in Cascais, Portugal</h3>
            <p>4 guests · 2 bedrooms · 3 beds · 1 bath</p>
            <p class="m-cluster" data-gap="1" style="font-weight: var(--m-font-weight-semibold)">${solid('star', 14)} 4.91 · <a href="#" style="${link}">126 reviews</a></p>
          </div>
          <div class="m-cluster" data-gap="4" style="padding-block: var(--m-space-6); ${hair}; border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default); flex-wrap: nowrap">
            <span class="m-avatar" data-size="md">JS</span>
            <span class="m-stack" data-gap="0"><span style="font-weight: var(--m-font-weight-medium)">Hosted by Joana Serra</span><span class="m-muted" style="${small}">Trusted host · 6 years hosting</span></span>
          </div>
          <p>Bright, quiet and two minutes from the sand. Mornings are best on the terrace, where the bay turns silver before the fishing boats head out. The station is a short walk, so Lisbon is forty minutes away.</p>
          <div><button type="button" class="m-button" data-variant="ghost" data-size="sm" style="--m-button-padding-x-sm: 0; text-decoration: underline">Read more ${icon('chevron-right', 16)}</button></div>
          <section class="m-stack" data-gap="6" style="padding-block-start: var(--m-space-10); ${hair}" aria-labelledby="tc-beds">
            <h3 id="tc-beds" style="${h2}">The bedrooms</h3>
            <div class="m-grid" style="--m-layout-grid-min: 12rem; --m-layout-grid-gap: var(--m-space-4)">
              ${bedroom(3, 'Main bedroom', '1 double bed')}
              ${bedroom(1, 'Second bedroom', '2 single beds')}
            </div>
          </section>
          <section class="m-stack" data-gap="6" style="padding-block-start: var(--m-space-10); ${hair}" aria-labelledby="tc-offers">
            <h3 id="tc-offers" style="${h2}">In the flat</h3>
            <ul class="m-grid" style="--m-layout-grid-min: 14rem; --m-layout-grid-gap: var(--m-space-4); padding: 0; list-style: none">
              ${amenity('wifi', 'Fast wifi, 300 Mbps')}${amenity('utensils', 'Full kitchen')}${amenity('briefcase-business', 'Desk by the window')}${amenity('car-front', 'Street parking')}${amenity('snowflake', 'Air conditioning')}${amenity('sun', 'Terrace with loungers')}
            </ul>
            <div><button type="button" class="m-button">See all 41 things</button></div>
          </section>
        </div>
        <div style="flex: 0 1 23rem; min-inline-size: min(100%, 20rem); align-self: stretch">${booking}</div>
      </div>
      <section class="m-stack" data-gap="10" style="padding-block-start: var(--m-space-12); ${hair}" aria-labelledby="tc-reviews">
        <div class="m-stack" data-gap="2" style="align-items: center; text-align: center">
          <p id="tc-reviews" style="font-size: clamp(4.5rem, 7vw, 6.25rem); font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-tight); line-height: 1"><span class="m-sr-only">Rated </span>4.91<span class="m-sr-only"> out of 5 from 126 reviews</span></p>
          <h3 style="${h2}">Guests keep coming back</h3>
          <p class="m-muted" style="max-inline-size: 26rem">Among the best-rated places on the coast for tidiness, honesty and an easy arrival.</p>
          <a href="#" class="m-muted" style="font-size: var(--m-font-size-xs); text-decoration: underline">About ratings</a>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 8rem; --m-layout-grid-gap: var(--m-space-6) 0">
          ${category('Clean and tidy', '4.9', 'sparkles', true)}${category('As described', '4.9', 'circle-check')}${category('Arrival', '5.0', 'key-round')}${category('Talking to Joana', '5.0', 'message-square')}${category('Location', '4.8', 'map-pin')}${category('Value', '4.7', 'wallet')}
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 24rem; --m-layout-grid-gap: var(--m-space-10) var(--m-space-16)">
          ${review('AN', 'Aiko', 'From Osaka, Japan', 5, 'March 2026 · 4 nights', 'We woke to the sea every day. Joana left a map of the best bakeries and a note about which beach is calm in the morning, and both were right.')}
          ${review('TB', 'Theo', '3 years travelling with us', 5, 'February 2026 · A week', 'Exactly as the photos show. The desk by the window is a real desk, the wifi held up on calls, and the station really is five minutes away.')}
          ${review('MR', 'Mireille', 'From Lyon, France', 4, 'January 2026 · 3 nights', 'Lovely flat and very quiet. The stairs are steep with suitcases, so travel light, but the terrace makes up for every step.')}
          ${review('DK', 'Dev', 'From Leeds, UK', 5, 'December 2025 · 5 nights', 'Warm in winter, which we did not expect. Joana answered every message within the hour.')}
        </div>
        <div><button type="button" class="m-button">See all 126 reviews</button></div>
      </section>
      <section class="m-stack" data-gap="6" style="padding-block-start: var(--m-space-12); ${hair}" aria-labelledby="tc-where">
        <div class="m-stack" data-gap="2">
          <h3 id="tc-where" style="${h2}">Where it is</h3>
          <p style="font-weight: var(--m-font-weight-medium)">Cascais, Lisbon coast, Portugal</p>
        </div>
        ${placeMap}
        <p>A quiet lane behind the old harbour. The beach is two minutes down the hill, the market four, and the train to Lisbon leaves every twenty minutes.</p>
        <div><a href="#" style="${link}">More about the area</a></div>
      </section>
      <section class="m-stack" data-gap="8" style="padding-block-start: var(--m-space-12); ${hair}" aria-labelledby="tc-know">
        <h3 id="tc-know" style="${h2}">Before you book</h3>
        <div class="m-grid" style="--m-layout-grid-min: 15rem; --m-layout-grid-gap: var(--m-space-8) var(--m-space-6)">
          ${knowing('clock-3', 'Arrival and leaving', 'Arrive after 3pm, leave by 11am. Self check-in with a key box.', false)}
          ${knowing('file-text', 'House rules', 'Up to 4 guests. No parties. Quiet after 10pm.')}
          ${knowing('shield-check', 'Safety', 'Smoke alarm and a first-aid kit. Steep stairs to the terrace.')}
          ${knowing('calendar-days', 'Cancelling', 'Free until Mar 1. After that, half of the stay is refunded.')}
        </div>
      </section>
    </article>`;

// The footer: a grey band across the window, its columns to 90rem whatever the page's own width. Link
// lists are plain ink (a product's CSS underlines them on hover); the legal row sits above a light hairline.
const footLinks = (title: string, links: string[]) => `<section class="m-stack" data-gap="4" aria-label="${title}">
          <h2 style="font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-medium)">${title}</h2>
          <ul class="m-stack" data-gap="4" style="padding: 0; list-style: none; ${small}">
${links.map((l) => `            <li><a href="#" style="color: var(--m-color-fg-default); text-decoration: none">${l}</a></li>`).join('\n')}
          </ul>
        </section>`;
const nearby = (place: string, kind: string) =>
  `<a href="#" class="m-stack" data-gap="0" style="color: var(--m-color-fg-default); text-decoration: none; ${small}"><span style="font-weight: var(--m-font-weight-medium)">${place}</span><span class="m-muted">${kind}</span></a>`;
const siteFooter = (lead = '') => `<footer style="margin-block-start: auto; background: var(--m-color-bg-sunken)">
    <div class="m-container" style="--m-layout-container-max-lg: 90rem; padding-block: var(--m-space-12) var(--m-space-6)">
      <div class="m-stack" data-gap="12">
        ${lead}
        <div class="m-grid" style="--m-layout-grid-min: 15rem; --m-layout-grid-gap: var(--m-space-8) var(--m-space-6)">
        ${footLinks('Help', ['Help articles', 'Safety while you travel', 'Cancelling a stay', 'Access needs', 'Report a problem'])}
        ${footLinks('Hosting', ['Share your place', 'Hosting guides', 'Protection for hosts', 'Learn to host', 'Get help hosting'])}
        ${footLinks('Hearthway', ['About us', 'News', 'Jobs', 'Gift vouchers', 'Stays for relief work'])}
        </div>
        <div class="m-cluster" data-justify="between" data-gap="4" style="padding-block-start: var(--m-space-6); border-block-start: var(--m-border-width-thin) solid var(--m-color-border-muted); ${small}">
          <p class="m-cluster" data-gap="2">© 2026 Hearthway <span aria-hidden="true">·</span> <a href="#" style="color: var(--m-color-fg-default); text-decoration: none">Privacy</a> <span aria-hidden="true">·</span> <a href="#" style="color: var(--m-color-fg-default); text-decoration: none">Terms</a> <span aria-hidden="true">·</span> <a href="#" style="color: var(--m-color-fg-default); text-decoration: none">Site map</a></p>
          <p class="m-cluster" data-gap="6" style="font-weight: var(--m-font-weight-medium)"><a href="#" class="m-cluster" data-gap="2" style="color: var(--m-color-fg-default); text-decoration: none">${icon('globe', 16)} English (UK)</a><a href="#" style="color: var(--m-color-fg-default); text-decoration: none">€ EUR</a></p>
        </div>
      </div>
    </div>
  </footer>`;
// On a place page the band opens with where the place sits and nearby places, at the page's width
const placeFooterLead = `<div class="m-stack" data-gap="8">
          <nav class="m-breadcrumb" aria-label="Where this place is" style="${small}"><ol><li><a href="#">Hearthway</a></li><li><a href="#">Portugal</a></li><li><a href="#">Lisbon coast</a></li><li aria-current="page">Cascais</li></ol></nav>
          <h2 style="${h2}">More places near Cascais</h2>
          <div class="m-grid" style="--m-layout-grid-min: 14rem; --m-layout-grid-gap: var(--m-space-6)">
            ${nearby('Sintra', 'Cottages and quintas')}${nearby('Ericeira', 'Surf houses')}${nearby('Comporta', 'Beach cabins')}${nearby('Lisbon', 'Flats with a view')}${nearby('Setúbal', 'Homes by the bay')}${nearby('Óbidos', 'Rooms in the walls')}
          </div>
        </div>`;

const listDetail = `<div class="m-stack" data-gap="0" style="min-block-size: 100vh">
  ${guestHeader(compactSearch)}
  <main class="m-container" style="--m-layout-container-max-lg: 90rem; padding-block: var(--m-space-4) var(--m-space-16)">
    <div class="m-stack" data-gap="12">
    ${results}
    <hr class="m-divider" style="--m-divider-spacing: 0">
    <div class="m-container" style="--m-layout-container-padding: 0px; --m-layout-container-max-lg: 70rem">
    ${detail}
    </div>
    </div>
  </main>
  ${siteFooter(placeFooterLead)}
</div>`;

// ---------------------------------------------------------------------------------------------
// Onboarding: the listing set-up flow, one question a screen, a segmented progress bar at the foot

const tile = (glyph: string, label: string, selected = false) =>
  `<label class="m-stack" data-gap="3" style="padding: var(--m-space-4) var(--m-space-5); border-radius: var(--m-radius-md); cursor: pointer; background: ${selected ? 'var(--m-color-bg-sunken)' : 'var(--m-color-bg-surface)'}; box-shadow: inset 0 0 0 ${selected ? 'var(--m-border-width-thick) var(--m-color-fg-default)' : 'var(--m-border-width-thin) var(--m-color-border-default)'}"><input class="m-sr-only" type="radio" name="tc-kind"${selected ? ' checked' : ''}>${icon(glyph, 32, 1.5)}<span style="font-weight: var(--m-font-weight-medium)">${label}</span></label>`;

const onboarding = `<div class="m-stack" data-gap="0" style="min-block-size: 100vh">
  <header class="m-navbar" style="border-block-end-color: transparent">
    <a class="m-navbar-brand" href="#" aria-label="Hearthway home" style="color: var(--m-color-fg-default)">${icon('flame', 30, 2.25)}</a>
    <div class="m-navbar-actions">
      <button type="button" class="m-button" data-size="sm" style="--m-button-radius: var(--m-radius-full); --m-button-secondary-bg: var(--m-color-bg-surface); --m-button-secondary-border: var(--m-color-border-default); --m-button-font-size: var(--m-font-size-sm)">Questions?</button>
      <button type="button" class="m-button" data-size="sm" style="--m-button-radius: var(--m-radius-full); --m-button-secondary-bg: var(--m-color-bg-surface); --m-button-secondary-border: var(--m-color-border-default); --m-button-font-size: var(--m-font-size-sm)">Save and leave</button>
    </div>
  </header>
  <main class="m-container" data-size="sm" style="flex: 1; padding-block: var(--m-space-12) var(--m-space-16)">
    <form class="m-stack" data-gap="8" aria-labelledby="tc-q">
      <div class="m-stack" data-gap="2">
        <span class="m-muted" style="${small}">Step 1 of 3</span>
        <h1 id="tc-q" style="${h1}">What kind of place are you sharing?</h1>
        <p style="font-size: var(--m-font-size-lg)">Pick the one that fits best. You can change it later.</p>
      </div>
      <fieldset class="m-grid" style="--m-layout-grid-min: 9rem; --m-layout-grid-gap: var(--m-space-3); border: 0; padding: 0; margin: 0">
        <legend class="m-sr-only">Kind of place</legend>
        ${tile('house', 'House')}${tile('layout-grid', 'Flat', true)}${tile('trees', 'Cabin')}${tile('waves', 'Houseboat')}${tile('tent', 'Tent or yurt')}${tile('mountain', 'Chalet')}${tile('bed-double', 'Guest room')}${tile('sun', 'Farm stay')}${tile('flame', 'Something else')}
      </fieldset>
      <div class="m-stack" data-gap="4">
        <div class="m-field">
          <label class="m-field-label" for="tc-name">What should guests call it?</label>
          <input class="m-input" id="tc-name" type="text" value="Whitewashed flat in Cascais" aria-describedby="tc-name-hint">
          <p class="m-field-hint" id="tc-name-hint">28 of 50 characters. Short and specific works best.</p>
        </div>
        <label class="m-field" data-layout="inline"><input class="m-checkbox" type="checkbox" checked> Guests will have the whole place to themselves</label>
      </div>
    </form>
  </main>
  <footer style="background: var(--m-color-bg-canvas)">
    <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap" aria-label="Progress: step 1 of 3" role="group">
      <progress class="m-progress" value="60" max="100" aria-label="Step 1" style="--m-progress-radius: 0; flex: 1"></progress>
      <progress class="m-progress" value="0" max="100" aria-label="Step 2" style="--m-progress-radius: 0; flex: 1"></progress>
      <progress class="m-progress" value="0" max="100" aria-label="Step 3" style="--m-progress-radius: 0; flex: 1"></progress>
    </div>
    <div class="m-cluster" data-justify="between" style="padding: var(--m-space-4) clamp(1.5rem, 4vw, 3rem)">
      <button type="button" class="m-button" data-variant="ghost" style="text-decoration: underline; --m-button-padding-x-md: var(--m-space-2)">Back</button>
      <button type="submit" class="m-button" data-variant="primary" style="${inkCta}; --m-button-padding-x-md: var(--m-space-8)">Next</button>
    </div>
  </footer>
</div>`;

// ---------------------------------------------------------------------------------------------
// Settings: the account column beside label-and-value rows with underlined Edit links

const settingsNav = (current: string) =>
  [
    ['user-round', 'Your details'],
    ['shield-check', 'Sign-in and safety'],
    ['eye', 'Privacy'],
    ['bell', 'Notifications'],
    ['credit-card', 'Payments and payouts'],
    ['file-text', 'Tax info'],
    ['languages', 'Language and currency'],
    ['briefcase-business', 'Business trips'],
  ]
    .map(
      ([g, l]) =>
        `          <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${icon(g, 22, 1.5)} ${l}</a></li>`,
    )
    .join('\n');

const row = (label: string, value: string, action = 'Edit', first = false) => `<div class="m-cluster" data-justify="between" data-align="start" style="padding-block: var(--m-space-6); flex-wrap: nowrap${first ? '' : `; ${hair}`}">
              <div class="m-stack" data-gap="1"><span>${label}</span><span class="m-muted" style="${small}">${value}</span></div>
              <a href="#" style="${link}; ${small}">${action}</a>
            </div>`;
const notify = (label: string, hint: string, on: boolean) => `<label class="m-cluster" data-justify="between" style="padding-block: var(--m-space-5); flex-wrap: nowrap; ${hair}">
              <span class="m-stack" data-gap="1"><span>${label}</span><span class="m-muted" style="${small}">${hint}</span></span>
              <input class="m-switch" type="checkbox" role="switch"${on ? ' checked' : ''}>
            </label>`;

const settings = `<div class="m-stack" data-gap="0" style="min-block-size: 100vh">
  ${guestHeader('')}
  <main class="m-container" style="padding-block: var(--m-space-10) var(--m-space-16)">
    <div class="m-split" style="--m-layout-split-side: 20rem; --m-layout-split-gap: var(--m-space-16)">
      <nav class="m-sidebar" aria-label="Account" style="border: 0; padding: 0">
        <div class="m-stack" data-gap="6">
          <h1 style="${h1}">Account</h1>
          <div class="m-sidebar-section">
            <ul>
${settingsNav('Your details')}
            </ul>
          </div>
        </div>
      </nav>
      <div class="m-stack" data-gap="12" style="max-inline-size: 42rem">
        <section class="m-stack" data-gap="2" aria-labelledby="tc-details">
          <h2 id="tc-details" style="${h2}">Your details</h2>
          <div class="m-stack" data-gap="0">
            ${row('Legal name', 'Ines Varga', 'Edit', true)}
            ${row('Preferred first name', 'Not set', 'Add')}
            ${row('Email', 'i***a@hearthmail.net')}
            ${row('Phone', 'Add a number so guests and support can reach you', 'Add')}
            ${row('Identity', 'Checked on 4 Feb 2026', 'Update')}
            <div class="m-stack" data-gap="4" style="padding-block: var(--m-space-6); ${hair}">
              <div class="m-cluster" data-justify="between" data-align="start" style="flex-wrap: nowrap">
                <div class="m-stack" data-gap="1"><span>Home address</span><span class="m-muted" style="${small}">Used for tax forms; never shown to guests</span></div>
                <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="text-decoration: underline; --m-button-padding-x-sm: 0; --m-button-font-size: var(--m-font-size-sm)">Cancel</button>
              </div>
              <div class="m-field">
                <label class="m-field-label" for="tc-street">Street address</label>
                <input class="m-input" id="tc-street" type="text" value="Rua das Flores 18, 2º">
              </div>
              <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap">
                <div class="m-field" style="flex: 2 1 0"><label class="m-field-label" for="tc-city">City</label><input class="m-input" id="tc-city" type="text" value="Cascais"></div>
                <div class="m-field" style="flex: 1 1 0"><label class="m-field-label" for="tc-post">Postcode</label><input class="m-input" id="tc-post" type="text" value="2750-339"></div>
              </div>
              <div class="m-field">
                <label class="m-field-label" for="tc-country">Country or region</label>
                <select class="m-select" id="tc-country"><option>Portugal</option><option>Spain</option><option>Italy</option></select>
              </div>
              <div><button type="button" class="m-button" data-variant="primary" style="${inkCta}">Save</button></div>
            </div>
          </div>
        </section>
        <section class="m-stack" data-gap="2" aria-labelledby="tc-notify">
          <h2 id="tc-notify" style="${h2}">Messages from us</h2>
          <div class="m-stack" data-gap="0">
            ${notify('Booking updates', 'Requests, changes and arrivals', true)}
            ${notify('Reminders', 'Things to do before a stay starts', true)}
            ${notify('Ideas and offers', 'Places and prices we think you will like', false)}
          </div>
        </section>
        <section class="m-stack" data-gap="3" style="padding-block-start: var(--m-space-6); ${hair}" aria-labelledby="tc-close">
          <h2 id="tc-close" style="${h3}">Close your account</h2>
          <p style="${small}">Your listings come down and future stays are cancelled. This can't be undone.</p>
          <div><button type="button" class="m-button" data-variant="danger" data-size="sm">Close account</button></div>
        </section>
      </div>
    </div>
  </main>
</div>`;

// ---------------------------------------------------------------------------------------------
// Empty state: a page title, a hairline, then a short invitation and one outlined action

const emptyState = `<div class="m-stack" data-gap="0" style="min-block-size: 100vh">
  ${guestHeader('')}
  <main class="m-container" style="padding-block: var(--m-space-10) var(--m-space-16)">
    <div class="m-stack" data-gap="8">
      <h1 style="${h1}">Trips</h1>
      <section class="m-cluster" data-gap="8" data-align="center" style="padding-block: var(--m-space-8); ${hair}; border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)" aria-labelledby="tc-empty">
        <div class="m-stack" data-gap="4" style="flex: 1 1 22rem">
          ${icon('compass', 40, 1.5)}
          <h2 id="tc-empty" style="${h2}">Nothing planned yet</h2>
          <p>When you book a stay it shows up here, with directions, the door code and your host's details.</p>
          <div class="m-cluster" data-gap="3">
            <a class="m-button" href="#" style="--m-button-secondary-bg: var(--m-color-bg-surface); --m-button-secondary-border: var(--m-color-fg-default); --m-button-secondary-hover-bg: var(--m-color-bg-sunken)">Find a place</a>
          </div>
        </div>
        <div style="flex: 1 1 22rem">${photo(0, 'map-pin', 'A quiet coastline', '', '16 / 9')}</div>
      </section>
      <p class="m-muted" style="${small}">Can't find a booking? <a href="#" style="${link}">Visit the help centre</a></p>
      <section class="m-stack" data-gap="6" aria-labelledby="tc-saved">
        <div class="m-cluster" data-justify="between"><h2 id="tc-saved" style="${h2}">Saved for later</h2><span class="m-muted" style="${small}">0 places</span></div>
        <div class="m-grid" style="--m-layout-grid-min: 14rem">
          ${[0, 1, 2, 3].map((n) => `<div class="m-stack" data-gap="3" aria-hidden="true"><div class="m-skeleton" data-shape="block" style="aspect-ratio: 20 / 19; block-size: auto; animation: none"></div><div class="m-skeleton" style="inline-size: 70%; animation: none"></div><div class="m-skeleton" style="inline-size: 45%; animation: none"></div></div>`).join('')}
        </div>
        <p class="m-muted" style="${small}">Tap the ${icon('heart', 14)} on any place to keep it here.</p>
      </section>
    </div>
  </main>
</div>`;

// ---------------------------------------------------------------------------------------------
// Pricing: choose how the booking fee is split, with a live price breakdown beside it

const plan = (id: string, name: string, fee: string, who: string, points: string[], selected = false, tag = '') => `<label for="${id}" class="m-stack" data-gap="4" style="flex: 1 1 15rem; padding: var(--m-space-6); border-radius: var(--m-radius-md); cursor: pointer; background: var(--m-color-bg-surface); box-shadow: inset 0 0 0 ${selected ? 'var(--m-border-width-thick) var(--m-color-fg-default)' : 'var(--m-border-width-thin) var(--m-color-border-default)'}">
          <div class="m-cluster" data-justify="between"><span style="font-weight: var(--m-font-weight-semibold); font-size: var(--m-font-size-lg)">${name}</span><input class="m-radio" type="radio" name="tc-plan" id="${id}"${selected ? ' checked' : ''}></div>
          ${tag ? `<div><span class="m-badge" data-tone="success">${tag}</span></div>` : ''}
          <div class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-tight)">${fee}</span><span class="m-muted" style="${small}">${who}</span></div>
          <ul class="m-stack" data-gap="3" style="padding: 0; list-style: none; ${small}">
            ${points.map((p) => `<li class="m-cluster" data-gap="3" style="flex-wrap: nowrap" data-align="start"><span style="display: inline-flex">${icon('check', 16)}</span><span>${p}</span></li>`).join('')}
          </ul>
        </label>`;

const pricing = `<div class="m-stack" data-gap="0" style="min-block-size: 100vh">
  ${hostNav('Listings')}
  <main class="m-container" style="padding-block: var(--m-space-12) var(--m-space-16)">
    <div class="m-stack" data-gap="10">
      <div class="m-cluster" data-gap="10" data-align="center">
        <div class="m-stack" data-gap="3" style="flex: 1 1 24rem; max-inline-size: 36rem">
          <nav class="m-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="#">Listings</a></li><li><a href="#">Whitewashed flat in Cascais</a></li><li aria-current="page">Pricing</li></ol></nav>
          <h1 style="${h1}">Choose how the booking fee is paid</h1>
          <p style="font-size: var(--m-font-size-lg)">It applies to every new booking. Stays already booked keep the fee they were booked with.</p>
        </div>
        <div style="flex: 1 1 22rem">${photo(0, 'house', 'The flat this pricing applies to', '', '16 / 9')}</div>
      </div>
      <div class="m-cluster" data-justify="between">
        <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Billing">
          <button type="button" class="m-tab" role="tab" aria-selected="true">Per booking</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Per month</button>
        </div></div>
        <label class="m-field" data-layout="inline" style="${small}"><input class="m-switch" type="checkbox" role="switch" checked> Show prices with taxes</label>
      </div>
      <fieldset class="m-cluster" data-gap="4" data-align="stretch" style="border: 0; padding: 0; margin: 0">
        <legend class="m-sr-only">Fee plan</legend>
        ${plan('tc-p1', 'Shared', '4%', 'of each booking, paid by you; guests pay the rest', ['Guests see a lower nightly price', 'Payouts the day after arrival', 'Standard support'])}
        ${plan('tc-p2', 'Host pays', '13%', 'of each booking, paid by you; guests pay nothing extra', ['The price guests see is the price they pay', 'Ranks well with fee-free search', 'Priority support', 'Payouts the day after arrival'], true, 'Most chosen')}
        ${plan('tc-p3', 'Studio', '$29', 'a month per listing, plus 9% of each booking', ['Pricing rules across all your places', 'A shared inbox for co-hosts', 'Monthly earnings reports', 'A dedicated success manager'])}
      </fieldset>
      <div class="m-cluster" data-gap="10" data-align="start">
        <section class="m-card" style="flex: 1 1 22rem" aria-labelledby="tc-breakdown">
          <div class="m-card-body m-stack" data-gap="4">
            <h2 id="tc-breakdown" style="${h3}">What a 5-night stay looks like</h2>
            <dl class="m-stack" data-gap="3" style="margin: 0">
              <div class="m-cluster" data-justify="between"><dt>Nightly price</dt><dd style="margin: 0">$184 × 5</dd></div>
              <div class="m-cluster" data-justify="between"><dt>Cleaning</dt><dd style="margin: 0">$45</dd></div>
              <div class="m-cluster" data-justify="between" style="padding-block-start: var(--m-space-3); ${hair}; font-weight: var(--m-font-weight-semibold)"><dt>Guest pays</dt><dd style="margin: 0">$965</dd></div>
              <div class="m-cluster" data-justify="between"><dt class="m-muted">Booking fee (13%)</dt><dd class="m-muted" style="margin: 0">−$125.45</dd></div>
              <div class="m-cluster" data-justify="between" style="padding-block-start: var(--m-space-3); ${hair}; font-weight: var(--m-font-weight-semibold)"><dt>You earn</dt><dd style="margin: 0; color: var(--m-color-success-fg)">$839.55</dd></div>
            </dl>
            <button type="button" class="m-button" data-variant="primary" style="${inkCta}; inline-size: 100%">Use Host pays</button>
          </div>
        </section>
        <section class="m-stack" data-gap="0" style="flex: 2 1 26rem" aria-labelledby="tc-faq">
          <h2 id="tc-faq" style="${h2}; margin-block-end: var(--m-space-2)">Questions hosts ask</h2>
          <div class="m-accordion" style="border-inline: 0; border-block-start: 0">
            <details class="m-accordion-item" open><summary>Can I switch later?</summary><div class="m-accordion-content">Yes, once every 30 days. The new fee applies to bookings made after the switch.</div></details>
            <details class="m-accordion-item"><summary>Do guests see which plan I'm on?</summary><div class="m-accordion-content">No. They only see the total for their dates, before they book.</div></details>
            <details class="m-accordion-item"><summary>What does the Studio fee cover?</summary><div class="m-accordion-content">The tools for running several places at once, billed monthly for each listed place.</div></details>
          </div>
        </section>
      </div>
    </div>
  </main>
</div>`;

// ---------------------------------------------------------------------------------------------
// Errors: a field, a form, a toast, and the full-page codes

const fieldError = (msg: string) =>
  `<span class="m-cluster" data-gap="2" style="flex-wrap: nowrap" data-align="start"><span style="display: inline-flex; margin-block-start: 0.125rem">${icon('circle-alert', 14)}</span><span>${msg}</span></span>`;
const pageError = (code: string, word: string, line: string, links: string[]) => `<section class="m-cluster" data-gap="12" data-align="center" style="padding-block: var(--m-space-12); ${hair}" aria-labelledby="tc-e${code}">
        <div class="m-stack" data-gap="5" style="flex: 1 1 24rem">
          <p id="tc-e${code}" style="font-size: clamp(4rem, 12vw, 8rem); font-weight: var(--m-font-weight-bold); letter-spacing: -0.04em; line-height: 1">${word}</p>
          <p style="font-size: var(--m-font-size-3xl); line-height: var(--m-font-leading-tight); color: var(--m-color-fg-muted)">${line}</p>
          <p class="m-muted" style="${small}">Error code: <code style="font-family: var(--m-font-family-mono)">${code}</code></p>
          <div class="m-stack" data-gap="2">
            <span style="${small}">Try one of these instead:</span>
            <ul class="m-stack" data-gap="1" style="padding: 0; list-style: none; ${small}">${links.map((l) => `<li><a href="#" style="${link}">${l}</a></li>`).join('')}</ul>
          </div>
        </div>
        <div style="flex: 1 1 18rem">${photo(code === '404' ? 0 : code === '500' ? 2 : 1, code === '404' ? 'compass' : code === '500' ? 'cloud-off' : 'lock', 'An empty frame', '', '4 / 3')}</div>
      </section>`;

const errors = `<div class="m-stack" data-gap="0">
  ${guestHeader('')}
  <main class="m-container" style="padding-block: var(--m-space-10) var(--m-space-16)">
    <div class="m-stack" data-gap="12">
      <div class="m-cluster" data-gap="12" data-align="start">
        <section class="m-stack" data-gap="6" style="flex: 1 1 24rem" aria-labelledby="tc-form">
          <h1 id="tc-form" style="${h1}">Confirm and pay</h1>
          <div class="m-alert" data-tone="danger" role="alert" tabindex="-1">
            <span class="m-alert-icon" aria-hidden="true">${icon('circle-alert', 20)}</span>
            <div class="m-alert-content">
              <p class="m-alert-title">Two things need a look</p>
              <p class="m-alert-body">Your card wasn't charged and the dates are still free.</p>
            </div>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="tc-card">Card number</label>
            <input class="m-input" id="tc-card" type="text" inputmode="numeric" value="4242 4242 4242" aria-invalid="true" aria-describedby="tc-card-e">
            <p class="m-field-error" id="tc-card-e">${fieldError('This number is too short. Check it against your card.')}</p>
          </div>
          <div class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap">
            <div class="m-field" style="flex: 1 1 0"><label class="m-field-label" for="tc-exp">Expiry</label><input class="m-input" id="tc-exp" type="text" value="09 / 24" aria-invalid="true" aria-describedby="tc-exp-e"><p class="m-field-error" id="tc-exp-e">${fieldError('This card has expired.')}</p></div>
            <div class="m-field" style="flex: 1 1 0"><label class="m-field-label" for="tc-cvc">Security code</label><input class="m-input" id="tc-cvc" type="text" value="381"></div>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="tc-msg">Message to your host <span class="m-muted">(optional)</span></label>
            <textarea class="m-input" id="tc-msg" rows="3">Hi Joana, we land at 9pm. Is a late arrival all right?</textarea>
          </div>
          <button type="button" class="m-button" data-variant="primary" style="${gradientCta}" aria-busy="true">Confirming</button>
        </section>
        <section class="m-stack" data-gap="4" style="flex: 1 1 20rem" aria-labelledby="tc-elsewhere">
          <h2 id="tc-elsewhere" style="${h3}">When something fails out of view</h2>
          <div class="m-toast-region" data-static aria-live="polite">
            <div class="m-toast" data-tone="danger" role="alert">
              <div class="m-toast-content">
                <p class="m-toast-title">Couldn't save to Coast weekends</p>
                <p class="m-toast-body">Check your connection. Nothing was lost.</p>
                <div class="m-toast-actions"><button type="button" class="m-button" data-size="sm" style="--m-button-secondary-bg: var(--m-color-bg-canvas); --m-button-radius: var(--m-radius-sm)">Try again</button></div>
              </div>
              <button type="button" class="m-toast-close" aria-label="Dismiss">${icon('x', 16)}</button>
            </div>
          </div>
          <div class="m-alert" data-tone="warning" role="status">
            <span class="m-alert-icon" aria-hidden="true">${icon('triangle-alert', 20)}</span>
            <div class="m-alert-content">
              <p class="m-alert-title">Those dates just went</p>
              <p class="m-alert-body">Someone booked Mar 6 – 8 a moment ago. The 9th to the 14th are still open.</p>
            </div>
          </div>
        </section>
      </div>
      <div class="m-stack" data-gap="2">
        <h2 style="${h2}">When a whole page can't load</h2>
        <p class="m-muted">These replace the page. They are public pages: no search in the header, the word at 700, and a few places to go next.</p>
      </div>
      ${pageError('404', 'Hmm.', "We can't find the page you were after.", ['Home', 'Search for a stay', 'Help centre', 'Hosting'])}
      ${pageError('500', 'Sorry.', 'Something went wrong on our side. Nothing was booked or charged.', ['Try again', 'Service status', 'Contact support'])}
      ${pageError('403', 'Not yet.', "You don't have access to this listing. Ask its host to add you as a co-host.", ['Request access', 'Switch account', 'Your listings'])}
    </div>
  </main>
</div>`;

// ---------------------------------------------------------------------------------------------
// Reading: a public help article. The public family: an ink mark with the section's name, a single-field
// search pill, a 40rem reading column with hairline-free sections, a hairline panel holding the page's one
// gradient action, and the full footer. Section headings are 22/500 here, as on the source's articles.

const helpMark = `<a class="m-navbar-brand" href="#" style="color: var(--m-color-fg-default); gap: var(--m-space-2); font-weight: var(--m-font-weight-semibold)">${icon('flame', 30, 2.25)} Help</a>`;
const helpSearch = `<form role="search" class="m-cluster" data-gap="2" style="flex-wrap: nowrap; inline-size: min(100%, 24rem); padding: var(--m-space-1) var(--m-space-1) var(--m-space-1) var(--m-space-5); border: var(--m-border-width-thin) solid var(--m-color-border-default); border-radius: var(--m-radius-full); background: var(--m-color-bg-sunken)">
      <input type="search" aria-label="Search the help guides" placeholder="Search guides and answers" style="flex: 1 1 auto; min-inline-size: 0; border: 0; background: transparent; color: inherit; font: inherit; font-weight: var(--m-font-weight-medium)">
      <button type="submit" class="m-button" data-variant="primary" data-size="sm" data-icon-only aria-label="Search" style="--m-button-primary-bg: var(--m-color-brand-default); --m-button-primary-border: var(--m-color-brand-default); --m-button-radius: var(--m-radius-full); --m-button-height-sm: 2.25rem; flex: none">${icon('search', 16, 3)}</button>
    </form>`;
const helpActions = `<div class="m-navbar-actions">
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Language and currency" style="--m-button-radius: var(--m-radius-full)">${icon('globe', 16)}</button>
      <button type="button" class="m-button" data-size="sm" data-icon-only aria-label="Menu" style="--m-button-radius: var(--m-radius-full)">${icon('menu', 16)}</button>
    </div>`;
const related = (title: string, line: string) =>
  `<li class="m-stack" data-gap="1"><a href="#" style="${link}">${title}</a><span style="${small}">${line}</span></li>`;

const reading = `<div class="m-stack" data-gap="0" style="min-block-size: 100vh">
  ${guestHeader(helpSearch, helpActions, helpMark)}
  <main class="m-container" style="padding-block: var(--m-space-6) var(--m-space-16)">
    <div class="m-stack" data-gap="8">
      <nav class="m-breadcrumb" aria-label="Breadcrumb" style="font-size: var(--m-font-size-xs)"><ol><li><a href="#">Help</a></li><li><a href="#">Booking</a></li><li><a href="#">Changes and cancelling</a></li><li aria-current="page">Changing the dates of a stay</li></ol></nav>
      <div class="m-split" style="--m-layout-split-side: 18rem; --m-layout-split-gap: var(--m-space-16); flex-direction: row-reverse; justify-content: space-between; align-items: flex-start">
        <aside class="m-card" data-variant="outline" data-size="sm" aria-label="Your trips" style="max-inline-size: 22rem">
          <div class="m-card-body m-stack" data-gap="4">
            <p>Sign in to see your stays and change them in a few taps.</p>
            <a class="m-button" data-variant="primary" data-size="sm" href="#" style="--m-button-primary-bg: linear-gradient(to right, var(--m-color-accent-default), var(--m-color-accent-hover)); --m-button-radius: var(--m-radius-sm); inline-size: 100%">Sign in or join</a>
          </div>
        </aside>
        <article class="m-stack" data-gap="6" aria-labelledby="tc-article" style="max-inline-size: 40rem; line-height: var(--m-font-leading-relaxed)">
          <div class="m-stack" data-gap="1">
            <p class="m-muted" style="${small}; font-weight: var(--m-font-weight-medium)">Guide · Guests</p>
            <h1 id="tc-article" style="${h1}">Changing the dates of a stay</h1>
          </div>
          ${photo(1, 'calendar-days', 'A calendar on a kitchen table', '', '3 / 2', 'var(--m-radius-md)')}
          <p>You can ask to move a stay to new dates as long as it hasn't started. Your host sees the request with the new price and has 24 hours to answer. Until they do, your original dates stay booked.</p>
          <h2 style="${h2Public}">Before you ask</h2>
          <ul class="m-stack" data-gap="2" style="padding-inline-start: var(--m-space-6)">
            <li>Check the place is free on the new dates. Dates in grey on its calendar are taken.</li>
            <li>See whether the <a href="#" style="${link}">price for the new dates</a> is higher. If it is, you pay the difference when the host says yes.</li>
            <li>Read the <a href="#" style="${link}">cancelling rules</a>. A change counts from the day you ask, not the day it's accepted.</li>
          </ul>
          <h2 style="${h2Public}">Asking for new dates</h2>
          <ol class="m-stack" data-gap="2" style="padding-inline-start: var(--m-space-6)">
            <li>Open <a href="#" style="${link}">Trips</a> and choose the stay.</li>
            <li>Choose Change dates, pick the new ones, and check the new total.</li>
            <li>Send the request. We'll message you as soon as your host answers.</li>
          </ol>
          <p>If your host says no, nothing changes and nothing is charged. You can ask again, or <a href="#" style="${link}">cancel the stay</a> under its own rules.</p>
          <section class="m-stack" data-gap="4" style="padding-block-start: var(--m-space-6)" aria-labelledby="tc-related">
            <h2 id="tc-related" style="${h2Public}">Related guides</h2>
            <ul class="m-stack" data-gap="4" style="padding: 0; list-style: none">
              ${related('When a refund reaches you', 'How long each way of paying takes.')}
              ${related('Adding a guest to a stay', 'Ask the host and pay any extra before you arrive.')}
              ${related('If your host cancels', 'What we do, and what you get back.')}
            </ul>
          </section>
        </article>
      </div>
    </div>
  </main>
  ${siteFooter()}
</div>`;

// ---------------------------------------------------------------------------------------------
// Sign-in: the public header over a wall of pictures, quietened by a white veil; a centred white sheet
// with 32px corners, lifted on the overlay shadow alone like a dialog, holds the mark, a 26/600
// title, one field, the full-width gradient action, an "or" rule and two outlined 60px buttons for
// other ways in. The full footer follows.

const otherWay = (glyph: string, label: string) =>
  `<button type="button" class="m-button" data-icon-only aria-label="${label}" style="--m-button-height-md: 3.75rem; --m-button-secondary-bg: var(--m-color-bg-surface); --m-button-secondary-border: var(--m-color-border-default); --m-button-secondary-hover-bg: var(--m-color-bg-sunken); --m-button-radius: var(--m-radius-md); inline-size: 3.75rem">${icon(glyph, 24, 1.5)}</button>`;
const wall = [
  [0, 'house'], [1, 'waves'], [2, 'trees'], [3, 'sun'], [4, 'mountain'], [5, 'tent'],
  [2, 'utensils'], [0, 'map-pin'], [3, 'compass'], [1, 'bed-double'], [5, 'flame'], [4, 'snowflake'],
]
  .map(([n, g]) => photo(n as number, g as string, '', '', '3 / 4').replace(' role="img" aria-label=""', ''))
  .join('');

const signIn = `<div class="m-stack" data-gap="0" style="min-block-size: 100vh">
  ${guestHeader('')}
  <main style="position: relative; flex: 1; display: grid; place-items: center; padding: var(--m-space-12) var(--m-space-6); overflow: hidden">
    <div aria-hidden="true" class="m-grid" style="position: absolute; inset: 0; --m-layout-grid-min: 11rem; --m-layout-grid-gap: var(--m-space-8); padding: var(--m-space-8); align-content: start">${wall}</div>
    <div aria-hidden="true" style="position: absolute; inset: 0; background: var(--m-color-bg-canvas); opacity: 0.55"></div>
    <section class="m-card" aria-labelledby="tc-signin" style="position: relative; inline-size: min(100%, 30rem); --m-card-radius: 2rem; --m-card-border: transparent; --m-card-shadow: var(--m-shadow-overlay)">
      <div class="m-card-body m-stack" data-gap="5" style="padding: var(--m-space-12) var(--m-space-6) var(--m-space-10)">
        <div class="m-stack" data-gap="3" style="align-items: center; text-align: center">
          <span style="color: var(--m-color-brand-default)">${icon('flame', 40, 2.25)}</span>
          <h1 id="tc-signin" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)">Sign in or join</h1>
        </div>
        <form class="m-stack" data-gap="4">
          <div class="m-field">
            <label class="m-field-label" for="tc-who">Email or phone number</label>
            <input class="m-input" id="tc-who" type="text" autocomplete="username" aria-describedby="tc-who-hint">
            <p class="m-field-hint" id="tc-who-hint">We'll send a six-digit code to check it's you. <a href="#" style="${link}">How we use your details</a></p>
          </div>
          <button type="submit" class="m-button" data-variant="primary" style="--m-button-primary-bg: linear-gradient(to right, var(--m-color-accent-default), var(--m-color-accent-hover)); inline-size: 100%">Continue</button>
        </form>
        <div class="m-cluster" data-gap="4" style="flex-wrap: nowrap; ${small}" role="separator" aria-label="or">
          <span aria-hidden="true" style="flex: 1; border-block-start: var(--m-border-width-thin) solid var(--m-color-border-muted)"></span>or<span aria-hidden="true" style="flex: 1; border-block-start: var(--m-border-width-thin) solid var(--m-color-border-muted)"></span>
        </div>
        <div class="m-cluster" data-gap="3" data-justify="center">
          ${otherWay('key-round', 'Continue with a passkey')}${otherWay('mail', 'Email me a sign-in link')}
        </div>
      </div>
    </section>
  </main>
  ${siteFooter()}
</div>`;

export const terracottaRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Host today',
    description:
      "The host's day: a pill switch over a row of floating reservation cards, earnings against last year in coral and dotted plum and a to-do list in hairline panels, and the listings as photo cards.",
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'Search and listing',
    description:
      'Rounded filter chips over a grid of frameless photo cards beside a map with white price pins; then the listing: a photo mosaic, hairline sections and a sticky booking panel with the coral pill.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Set up a listing',
    description:
      'One question a screen: a large heading, bordered choice tiles that take a 2px ink edge when picked, a segmented ink progress bar at the foot, an underlined Back and an ink Next.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Account',
    description:
      'An icon list of settings areas beside label-and-value rows split by hairlines, each with an underlined Edit; one row opened inline as a form, notification switches, and closing the account last.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'No trips yet',
    description:
      'A page title, then a hairline-bounded invitation with an outline icon, one sentence and an ink-outlined action beside a placeholder photo; resting skeleton cards where saved places will go.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Fee plans',
    description:
      'The title beside a leading photo, then three radio cards that take a 2px ink edge when chosen, a pill switch for the billing period, a breakdown card with the coral pill, and questions in hairline rows.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'A field error in burnt red with its icon, a form alert that says what did not happen, an ink toast with one action, and the full-page codes: a huge bold word, a plain line, the code, and helpful links.',
    html: errors,
  },
  {
    name: 'reading',
    title: 'Help article',
    description:
      'A public reading page: an ink mark with the section name and a single-field pill search, a breadcrumb, a 40rem column with a 32px title, a lead picture and 22/500 headings, underlined ink links, a hairline panel with the one gradient action, and the grey footer.',
    html: reading,
  },
  {
    name: 'sign-in',
    title: 'Sign in',
    description:
      'The public header over a quietened wall of pictures, a centred white sheet with 32px corners: the coral mark, a 26/600 title, one field, the full-width gradient Continue, an "or" rule and two outlined 60px buttons; the grey footer under it.',
    html: signIn,
  },
];
