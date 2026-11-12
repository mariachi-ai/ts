import type { ArchetypeRecipe } from '../types';

/*
 * Chalk's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with invented data from a small landscaping studio's notes-and-lists app
 * ("Sorrel"). They follow the language's real screen patterns, translated from a native desktop and
 * phone app to the web: a floating grey sidebar with coloured smart-list tiles and counts, round
 * coloured list icons and notebook rows; a list of notes or tasks; an editor or detail pane; glass
 * capsule toolbars; checklist circles; white inset groups on the grouped grey; big bold titles.
 */

// Lucide icons, outlined, 1.75 on the 24px grid (about 1.4px at 18px), like the system's regular weight
const icon = (paths: string, size = 18, stroke = 1.75) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none">${paths}</svg>`;
const I = {
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  share: '<path d="M12 2v13"/><path d="m16 6-4-4-4 4"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>',
  panel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
  listPlus: '<path d="M16 5H3"/><path d="M11 12H3"/><path d="M16 19H3"/><path d="M18 9v6"/><path d="M21 12h-6"/>',
  compose:
    '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>',
  folder:
    '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  folderPlus:
    '<path d="M12 10v6"/><path d="M9 13h6"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  checks: '<path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/>',
  table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
  clip: '<path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/>',
  pen: '<path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z"/><path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18"/><path d="m2.3 2.3 7.286 7.286"/><circle cx="11" cy="11" r="2"/>',
  camera:
    '<path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  hourglass:
    '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  truck:
    '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  drops:
    '<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>',
  hammer:
    '<path d="m15 12-9.373 9.373a1 1 0 0 1-3.001-3L12 9"/><path d="m18 15 4-4"/><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172v-.344a2 2 0 0 0-.586-1.414l-1.657-1.657A6 6 0 0 0 12.516 3H9l1.243 1.243A6 6 0 0 1 12 8.485V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/>',
  phone:
    '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>',
  sprout:
    '<path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3"/><path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4"/><path d="M5 21h14"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  updown: '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  searchX: '<path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  cloudOff:
    '<path d="M10.94 5.274A7 7 0 0 1 15.71 10h1.79a4.5 4.5 0 0 1 4.222 6.057"/><path d="M18.796 18.81A4.5 4.5 0 0 1 17.5 19H9A7 7 0 0 1 5.79 5.78"/><path d="m2 2 20 20"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  warn: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
  palette:
    '<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>',
  clock: '<path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/>',
  calendar:
    '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  mic: '<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/>',
  sparkles:
    '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
  image:
    '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
};

// Shared inline treatments (tokens only)
const muted = 'color: var(--m-color-fg-muted)';
const small = 'font-size: var(--m-font-size-sm)';
const num = 'font-variant-numeric: tabular-nums';
const clip = 'min-inline-size: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap';
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)';
const largeTitle = 'font-size: var(--m-font-size-4xl); font-weight: var(--m-font-weight-bold); line-height: var(--m-font-leading-tight)';

// The app's mark: a dark rounded tile with a sprout (not the reference's logo)
const mark = (size = '1.75rem', glyph = 16) =>
  `<span aria-hidden="true" style="flex: none; display: inline-grid; place-items: center; inline-size: ${size}; block-size: ${size}; border-radius: var(--m-radius-sm); background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)">${icon(I.sprout, glyph, 2)}</span>`;

// A round coloured list icon with a white glyph
const listIcon = (tone: string, paths: string, size = '1.625rem') =>
  `<span aria-hidden="true" style="flex: none; display: inline-grid; place-items: center; inline-size: ${size}; block-size: ${size}; border-radius: var(--m-radius-full); background: var(--m-color-${tone}); color: var(--m-color-accent-fg)">${icon(paths, 14, 2.25)}</span>`;

// Glass controls: a white capsule or circle with a hairline edge and a soft lift, dark glyphs
const glassStyle = 'background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-sm); color: var(--m-color-fg-default)';
const glass = (paths: string, label: string, size = '') =>
  `<button type="button" class="m-button" data-variant="secondary"${size ? ` data-size="${size}"` : ''} data-icon-only aria-label="${label}" style="${glassStyle}">${icon(paths)}</button>`;
const glassGroup = (buttons: [string, string][]) =>
  `<div class="m-cluster" data-gap="0" role="group" style="flex-wrap: nowrap; padding: 2px; border-radius: var(--m-radius-full); ${glassStyle}">${buttons.map(([p, l]) => `<button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="${l}" style="color: var(--m-color-fg-default)">${p.startsWith('<') ? icon(p) : `<span aria-hidden="true" style="font-size: var(--m-font-size-lg)">${p}</span>`}</button>`).join('')}</div>`;

// A smart-list tile: solid colour, glyph and big count on top, the name below
const tile = (tone: string, paths: string, count: string, label: string, current = false) =>
  `<a href="#"${current ? ' aria-current="page"' : ''} style="display: flex; flex-direction: column; gap: var(--m-space-2); padding: var(--m-space-2) var(--m-space-3) var(--m-space-2); border-radius: var(--m-radius-lg); background: var(--m-color-${tone}); color: var(--m-color-accent-fg); text-decoration: none;${current ? ` box-shadow: 0 0 0 2px var(--m-color-bg-sunken), 0 0 0 4px var(--m-color-${tone});` : ''}">
          <span class="m-cluster" data-justify="between" style="flex-wrap: nowrap">${icon(paths, 20, 2)}<span style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold); ${num}">${count}</span></span>
          <span style="font-weight: var(--m-font-weight-semibold)">${label}</span>
        </a>`;

const count = (n: string, current: boolean) =>
  `<span class="m-sidebar-count" style="font-size: var(--m-font-size-md)${current ? '; color: inherit' : ''}">${n}</span>`;
const listLink = (tone: string, paths: string, name: string, n: string, current: string) =>
  `          <li><a class="m-sidebar-link" href="#"${name === current ? ' aria-current="page"' : ''}>${listIcon(tone, paths)}<span style="${clip}">${name}</span>${count(n, name === current)}</a></li>`;
const notebookLink = (name: string, n: string, current: string) =>
  `          <li><a class="m-sidebar-link" href="#"${name === current ? ' aria-current="page"' : ''}><span style="color: ${name === current ? 'inherit' : 'var(--m-color-brand-default)'}; display: inline-flex">${icon(I.folder, 18)}</span><span style="${clip}">${name}</span>${count(n, name === current)}</a></li>`;

// The floating grey sidebar: the mark and its glass buttons, smart tiles, projects, notebooks
const sidebar = (current: string, opts: { tiles?: boolean; notebooks?: boolean; tags?: boolean } = {}) => {
  const { tiles = true, notebooks = true, tags = false } = opts;
  return `  <nav class="m-sidebar" aria-label="Lists and notebooks" style="border-radius: var(--m-radius-container); align-self: stretch">
    <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap">
      <span class="m-cluster" data-gap="2" style="font-weight: var(--m-font-weight-semibold)">${mark()} Sorrel</span>
      <span class="m-cluster" data-gap="1">${glass(I.listPlus, 'New project', 'sm')}${glass(I.panel, 'Hide the sidebar', 'sm')}</span>
    </div>
${
  tiles
    ? `    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--m-space-2)">
        ${tile('accent-default', I.camera, '7', 'Photos due', current === 'Photos due')}
        ${tile('warning-solid', I.zap, '12', 'Quick wins', current === 'Quick wins')}
        ${tile('success-solid', I.bulb, '23', 'Ideas', current === 'Ideas')}
        ${tile('danger-solid', I.hourglass, '4', 'Waiting on', current === 'Waiting on')}
    </div>`
    : ''
}
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Projects</h2>
      <ul>
${listLink('success-solid', I.leaf, 'Hollis garden', '9', current)}
${listLink('accent-default', I.drops, 'Pond rebuild', '6', current)}
${listLink('warning-solid', I.truck, 'Nursery run', '11', current)}
${listLink('danger-solid', I.phone, 'Client calls', '3', current)}
${listLink('brand-default', I.sprout, 'Seed swap', '5', current)}
${listLink('fg-subtle', I.hammer, 'Workshop', '8', current)}
      </ul>
    </div>
${
  notebooks
    ? `    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Notebooks</h2>
      <ul>
${notebookLink('Site visits', '14', current)}
${notebookLink('Planting plans', '22', current)}
${notebookLink('Estimates', '6', current)}
${notebookLink('Sketchbook', '31', current)}
      </ul>
    </div>`
    : ''
}${
  tags
    ? `
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading">Tags</h2>
      <div class="m-cluster" data-gap="2" style="padding-inline: var(--m-space-2)">${['#drainage', '#paving', '#shade', '#orders', '#hollis', '#winter'].map((t) => `<a class="m-badge" href="#" style="text-decoration: none">${t}</a>`).join('')}</div>
    </div>`
    : ''
}
  </nav>`;
};

// The window: a white page with the sidebar floating inside it, 8px from the edges
const shell = (nav: string, main: string) => `<div class="m-split" style="--m-layout-split-side: 17.5rem; min-block-size: 100vh; padding: var(--m-space-2); background: var(--m-color-bg-surface)">
${nav}
${main}
</div>`;

// A task row: the checklist circle, the title, then the when and the tag in the list's colour
const task = (title: string, meta = '', tag = '', tone = 'accent', done = false) =>
  `            <li style="display: grid; grid-template-columns: 1.375rem minmax(0, 1fr); gap: var(--m-space-3); align-items: start; padding-block: var(--m-space-2)"><input class="m-checkbox" type="checkbox"${done ? ' checked' : ''} aria-label="${title}" style="margin-block-start: 1px; --m-checkbox-checked-bg: var(--m-color-${tone}-${tone === 'accent' ? 'default' : 'solid'}); --m-checkbox-checked-border: var(--m-color-${tone}-${tone === 'accent' ? 'default' : 'solid'})"><span class="m-stack" data-gap="0"><span${done ? ` style="${muted}"` : ''}>${title}</span>${meta || tag ? `<span style="${small}; ${muted}">${meta}${meta && tag ? ' ' : ''}${tag ? `<span style="color: var(--m-color-${tone === 'accent' ? 'accent-text' : `${tone}-fg`})">${tag}</span>` : ''}</span>` : ''}</span></li>`;
// The empty row a new task is typed into: a dotted circle
const newTask = `            <li style="padding-block: var(--m-space-2)"><span aria-hidden="true" style="display: block; inline-size: 1.375rem; block-size: 1.375rem; border-radius: var(--m-radius-full); border: var(--m-border-width-thin) dashed var(--m-color-border-strong)"></span></li>`;

// A group of tasks under a bold, coloured heading with a disclosure chevron
const group = (title: string, tone: string, rows: string, id: string) => `          <section aria-labelledby="${id}" style="${hair}; padding-block-start: var(--m-space-3)">
            <div class="m-cluster" data-justify="between"><h2 id="${id}" style="font-size: var(--m-font-size-xl); color: var(--m-color-${tone})">${title}</h2><span style="${muted}">${icon(I.down)}</span></div>
            <ul class="m-stack" data-gap="0" style="list-style: none; margin: 0; padding: 0">
${rows}
            </ul>
          </section>`;

// The round add button that floats at the bottom right of a list, in the list's colour
const fab = (tone: string, label: string) =>
  `<button type="button" class="m-button" data-variant="primary" data-size="lg" data-icon-only aria-label="${label}" style="position: absolute; inset-block-end: var(--m-space-6); inset-inline-end: var(--m-space-6); background: var(--m-color-${tone}); box-shadow: var(--m-shadow-md)">${icon(I.plus, 22, 2)}</button>`;

// The glass toolbar at the top of a pane
const toolbar = (left: string, right: string) =>
  `      <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding-block-end: var(--m-space-2)">${left}<span class="m-cluster" data-gap="2" style="flex-wrap: nowrap; min-inline-size: 0">${right}</span></div>`;
const searchField = (label: string) =>
  `<label class="m-cluster" data-gap="2" style="flex-wrap: nowrap; flex: 0 1 14rem; min-inline-size: 6rem; padding-inline: var(--m-space-3); block-size: var(--m-control-height-md); border-radius: var(--m-radius-full); ${glassStyle}; ${muted}">${icon(I.search, 16)}<input class="m-input" type="search" placeholder="Search" aria-label="${label}" style="--m-input-border: transparent; --m-input-bg: transparent; --m-input-height-md: 2rem; padding-inline: 0; box-shadow: none"></label>`;

// ── Dashboard ────────────────────────────────────────────────────────────────────────────────────
// The home: the sidebar's smart tiles, and one smart list across projects, grouped by project
const dashboard = shell(
  sidebar('Quick wins'),
  `  <main style="position: relative; padding: var(--m-space-3) var(--m-space-8) var(--m-space-16)">
${toolbar('<span></span>', `${glassGroup([[I.share, 'Share'], [I.checks, 'Show finished'], [I.more, 'More']])}${glass(I.plus, 'New task')}${searchField('Search tasks')}`)}
      <div class="m-stack" data-gap="4">
        <div class="m-cluster" data-justify="between" style="color: var(--m-color-warning-solid)"><h1 style="${largeTitle}">Quick wins</h1><span style="${largeTitle}; font-weight: var(--m-font-weight-regular); ${num}">12</span></div>
        <div class="m-cluster" data-justify="between" style="${muted}"><span>3 finished this week · <a href="#" style="color: var(--m-color-warning-fg); text-decoration: none">Clear</a></span><a href="#" style="color: var(--m-color-warning-fg); text-decoration: none">Show</a></div>
${group(
  'Hollis garden',
  'success-fg',
  [
    task('Edge the gravel path by the shed', 'Thu, 9:00', '#paths', 'success'),
    task('Send Ruth the photo of the moss patch', 'Today', '', 'success'),
    task('Lift and split the hostas', 'Sat', '#borders', 'success'),
    newTask,
  ].join('\n'),
  'ch-g-hollis',
)}
${group(
  'Pond rebuild',
  'accent-text',
  [task('Order 40 m of liner underlay', 'Tomorrow, 8:30', '#orders'), task('Check the pump warranty card'), newTask].join('\n'),
  'ch-g-pond',
)}
${group(
  'Nursery run',
  'warning-fg',
  [
    task('Ask about bare-root hornbeam', 'Fri', '', 'warning'),
    task('Return the empty trays', '', '#errands', 'warning'),
    task('Pick up two bags of grit', 'Fri', '', 'warning', true),
    newTask,
  ].join('\n'),
  'ch-g-nursery',
)}
      </div>
      ${fab('warning-solid', 'Add a quick win')}
  </main>`,
);

// ── List and detail ──────────────────────────────────────────────────────────────────────────────
// Notebooks in the sidebar; the notebook's notes in a column; the open note in the editor
const noteRow = (title: string, when: string, preview: string, book: string, selected = false, last = false) =>
  `            <li><a href="#"${selected ? ' aria-current="true"' : ''} style="display: grid; gap: 1px; padding: var(--m-space-2) var(--m-space-3); border-radius: var(--m-radius-md); color: inherit; text-decoration: none${selected ? '; background: var(--m-color-brand-subtle)' : ''}">
              <strong style="font-weight: var(--m-font-weight-bold); ${clip}">${title}</strong>
              <span style="${clip}; ${small}"><span style="${num}">${when}</span>&nbsp;&nbsp;<span style="${muted}">${preview}</span></span>
              <span class="m-cluster" data-gap="1" style="${small}; ${muted}">${icon(I.folder, 13)} ${book}</span>
            </a></li>${last ? '' : `\n            <li aria-hidden="true" style="block-size: var(--m-border-width-thin); margin-inline: var(--m-space-3); background: var(--m-color-border-default)"></li>`}`;
const noteGroup = (label: string, rows: string) => `          <h2 style="font-size: var(--m-font-size-lg); padding: var(--m-space-4) var(--m-space-3) var(--m-space-1)">${label}</h2>
          <ul style="list-style: none; margin: 0; padding: 0; display: grid">
${rows}
          </ul>`;

const checkItem = (text: string, done: boolean) =>
  `              <li class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding-block: var(--m-space-1)"><input class="m-checkbox" type="checkbox"${done ? ' checked' : ''} aria-label="${text}" style="--m-checkbox-checked-bg: var(--m-color-brand-default); --m-checkbox-checked-border: var(--m-color-brand-default); --m-checkbox-mark: var(--m-color-brand-fg)"><span>${text}</span></li>`;

const listDetail = shell(
  sidebar('Site visits', { tiles: false, tags: true }),
  `  <div class="m-split" style="--m-layout-split-side: 20rem; --m-layout-split-gap: 0">
    <section aria-labelledby="ch-ld-book" style="padding: var(--m-space-3) var(--m-space-3) var(--m-space-8); border-inline-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
      <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding-inline: var(--m-space-3)">
        <div class="m-stack" data-gap="0"><h1 id="ch-ld-book" style="font-size: var(--m-font-size-lg)">Site visits</h1><span style="${small}; ${muted}">14 notes</span></div>
        ${glass(I.more, 'Notebook options')}
      </div>
${noteGroup(
  'November',
  [
    noteRow('Hollis garden, second walk', '11/10/26', 'Moss under the beech is worse…', 'Site visits', true),
    noteRow('Corner plot on Marsh Lane', '11/6/26', 'Clay, standing water after rain', 'Site visits'),
    noteRow('School courtyard beds', '11/3/26', 'Raised beds need new sleepers', 'Site visits', false, true),
  ].join('\n'),
)}
${noteGroup(
  'October',
  [
    noteRow('Allotment 14B handover', '10/28/26', 'Keys with the committee', 'Site visits'),
    noteRow('Pond survey, Wren Cottage', '10/21/26', 'Liner split at the shelf', 'Site visits'),
    noteRow('Tea garden by the library', '10/9/26', 'Shade list for the north wall', 'Site visits', false, true),
  ].join('\n'),
)}
    </section>
    <main style="padding: var(--m-space-3) var(--m-space-8) var(--m-space-12)">
${toolbar(
  glass(I.compose, 'New note'),
  `${glassGroup([
    ['Aa', 'Text style'],
    [I.checks, 'Checklist'],
    [I.table, 'Table'],
    [I.clip, 'Attach'],
    [I.pen, 'Draw'],
  ])}${glassGroup([
    [I.share, 'Share'],
    [I.more, 'More'],
  ])}${glass(I.search, 'Search notes')}`,
)}
      <article class="m-stack" data-gap="4" style="max-inline-size: 44rem; margin-inline: auto">
        <p style="text-align: center; ${small}; color: var(--m-color-fg-subtle)">November 10, 2026 at 4:12 PM</p>
        <h2 style="font-size: var(--m-font-size-3xl)">Hollis garden, second walk</h2>
        <p>Walked the whole plot with Ruth. The lawn under the copper beech is more moss than grass, and the path by the shed floods at the low end. She wants the herb bed moved closer to the kitchen door.</p>
        <h3 style="font-size: var(--m-font-size-xl)">Before the next visit</h3>
        <ul style="list-style: none; margin: 0; padding: 0">
${checkItem('Soil test from three spots', true)}
${checkItem('Measure the path from shed to gate', true)}
${checkItem('Price a French drain at the low end', false)}
${checkItem('Shortlist shade-tolerant ground cover', false)}
        </ul>
        <div class="m-table-wrap" style="--m-table-wrap-radius: var(--m-radius-md); --m-table-wrap-border: var(--m-color-border-default); --m-table-header-fg: var(--m-color-fg-default); --m-table-header-font-weight: var(--m-font-weight-bold)">
          <table class="m-table">
            <thead><tr><th scope="col">Area</th><th scope="col">Size</th><th scope="col">Plan</th></tr></thead>
            <tbody>
              <tr><td>Under the beech</td><td style="${num}">38 m²</td><td>Scarify, then woodland mix</td></tr>
              <tr><td>Herb bed</td><td style="${num}">6 m²</td><td>Move to the kitchen door</td></tr>
              <tr><td>Shed path</td><td style="${num}">14 m</td><td>Lift, add drain, relay</td></tr>
            </tbody>
          </table>
        </div>
        <div class="m-cluster" data-gap="2"><span class="m-badge">#drainage</span><span class="m-badge">#shade</span><span class="m-badge">#hollis</span></div>
      </article>
    </main>
  </div>`,
);

// ── Onboarding ───────────────────────────────────────────────────────────────────────────────────
// The welcome sheet: a big bold title, three features each led by a coloured glyph, one blue button
const feature = (tone: string, paths: string, title: string, body: string) =>
  `          <li style="display: grid; grid-template-columns: 2.75rem minmax(0, 1fr); gap: var(--m-space-4); align-items: center"><span style="color: var(--m-color-${tone}); display: inline-grid; place-items: center">${icon(paths, 34, 1.75)}</span><span class="m-stack" data-gap="0"><strong style="font-weight: var(--m-font-weight-semibold)">${title}</strong><span style="${muted}">${body}</span></span></li>`;

const onboarding = `<main style="min-block-size: 100vh; display: grid; place-items: center; padding: var(--m-space-8) var(--m-space-4); background: var(--m-color-bg-canvas)">
  <section class="m-dialog" data-static data-size="md" role="dialog" aria-modal="false" aria-labelledby="ch-ob-title" style="box-shadow: var(--m-shadow-overlay)">
    <div class="m-stack" data-gap="8" style="padding: var(--m-space-6) var(--m-space-4) var(--m-space-2)">
      <div class="m-stack" data-gap="3" data-align="center" style="text-align: center">
        ${mark('3.5rem', 32)}
        <h1 id="ch-ob-title" style="${largeTitle}">Welcome to Sorrel</h1>
        <p style="${muted}">Notes and lists for every garden you look after.</p>
      </div>
      <ul class="m-stack" data-gap="6" style="list-style: none; margin: 0; padding: 0">
${feature('brand-default', I.compose, 'Notes from the site', 'Jot what you see, add photos and sketches, and tick off what to check next time.')}
${feature('accent-default', I.checks, 'A list for every job', 'Give each project its own colour and see what is left at a glance.')}
${feature('success-solid', I.users, 'Share with your crew', 'Invite the people you work with and hand tasks to them by name.')}
      </ul>
      <div class="m-stack" data-gap="3" data-align="center">
        <button type="button" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%; max-inline-size: 20rem">Continue</button>
        <a href="#" style="color: var(--m-color-accent-text); text-decoration: none">Bring in notes from another app</a>
      </div>
    </div>
  </section>
</main>`;

// ── Settings ─────────────────────────────────────────────────────────────────────────────────────
// Grouped settings: grey page, grey section labels, white inset groups of rows, footnotes below
const row = (label: string, control: string, lead = '', last = false) =>
  `            <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; min-block-size: 3rem; padding: var(--m-space-2) var(--m-space-4)${last ? '' : '; box-shadow: inset 0 calc(-1 * var(--m-border-width-thin)) 0 var(--m-color-border-default)'}"><span class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${lead}<span>${label}</span></span>${control}</div>`;
const groupBox = (rows: string) =>
  `          <div style="border-radius: var(--m-radius-md); background: var(--m-color-bg-surface); overflow: hidden">\n${rows}\n          </div>`;
const section = (label: string, rows: string, note = '') => `        <section class="m-stack" data-gap="2">
          <h2 style="padding-inline: var(--m-space-4); ${small}; font-weight: var(--m-font-weight-semibold); color: var(--m-color-fg-subtle)">${label}</h2>
${groupBox(rows)}
${note ? `          <p style="padding-inline: var(--m-space-4); ${small}; ${muted}">${note}</p>` : ''}
        </section>`;
const toggle = (label: string, on: boolean) =>
  `<input class="m-switch" type="checkbox" role="switch"${on ? ' checked' : ''} aria-label="${label}">`;
const popup = (label: string, options: string[]) =>
  `<select class="m-select" aria-label="${label}" style="inline-size: auto; --m-input-border: transparent; --m-input-bg: transparent; color: var(--m-color-fg-muted); text-align: end">${options.map((o) => `<option>${o}</option>`).join('')}</select>`;
const value = (text: string) => `<span class="m-cluster" data-gap="1" style="flex-wrap: nowrap; ${muted}">${text} ${icon(I.right, 14, 2)}</span>`;
const sq = (tone: string, paths: string) =>
  `<span aria-hidden="true" style="flex: none; display: inline-grid; place-items: center; inline-size: 1.75rem; block-size: 1.75rem; border-radius: var(--m-radius-sm); background: var(--m-color-${tone}); color: var(--m-color-accent-fg)">${icon(paths, 16, 2)}</span>`;
const glyph = (paths: string) => `<span style="color: var(--m-color-fg-subtle); display: inline-flex">${icon(paths, 20, 1.5)}</span>`;
const settingsLink = (tone: string, paths: string, label: string, current: string) =>
  `        <li><a class="m-sidebar-link" href="#"${label === current ? ' aria-current="page"' : ''}>${sq(tone, paths)} ${label}</a></li>`;

const settings = `<div class="m-split" style="--m-layout-split-side: 15rem; min-block-size: 100vh; padding: var(--m-space-2); background: var(--m-color-bg-canvas)">
  <nav class="m-sidebar" aria-label="Settings" style="border-radius: var(--m-radius-container); background: var(--m-color-bg-surface)">
    <label class="m-cluster" data-gap="2" style="flex-wrap: nowrap; padding-inline: var(--m-space-3); block-size: var(--m-control-height-md); border-radius: var(--m-radius-full); background: var(--m-color-bg-sunken); ${muted}">${icon(I.search, 16)}<input class="m-input" type="search" placeholder="Search" aria-label="Search settings" style="--m-input-border: transparent; --m-input-bg: transparent; --m-input-height-md: 2rem; padding-inline: 0"></label>
    <a class="m-sidebar-link" href="#" style="padding-block: var(--m-space-2)"><span class="m-avatar" data-size="md" aria-hidden="true">RT</span><span class="m-stack" data-gap="0"><span style="font-weight: var(--m-font-weight-semibold)">Rosa Thackeray</span><span style="${small}; ${muted}">Sorrel account</span></span></a>
    <div class="m-sidebar-section">
      <ul>
${settingsLink('fg-subtle', I.gear, 'General', 'Notes and lists')}
${settingsLink('brand-default', I.compose, 'Notes and lists', 'Notes and lists')}
${settingsLink('danger-solid', I.bell, 'Alerts', 'Notes and lists')}
${settingsLink('success-solid', I.users, 'Crew and sharing', 'Notes and lists')}
${settingsLink('accent-default', I.palette, 'Look and feel', 'Notes and lists')}
${settingsLink('warning-solid', I.lock, 'Privacy', 'Notes and lists')}
      </ul>
    </div>
  </nav>
  <main style="padding: var(--m-space-5) var(--m-space-8) var(--m-space-12)">
    <div class="m-container" data-size="md">
      <div class="m-stack" data-gap="6">
        <div class="m-cluster" data-gap="3">${glass(I.left, 'Back', 'sm')}<h1 style="font-size: var(--m-font-size-lg)">Notes and lists</h1></div>
${section(
  'New notes',
  [
    row('Start a note with', popup('Start a note with', ['Title', 'Heading', 'Body'])),
    row('Paper', value('Lined')),
    row('Move ticked items to the bottom', toggle('Move ticked items to the bottom', true), '', true),
  ].join('\n'),
  'Applies to notes you start from now on. Existing notes keep their style.',
)}
${section(
  'Lists',
  [
    row('Default project', `<span class="m-cluster" data-gap="2" style="flex-wrap: nowrap; ${muted}">${listIcon('success-solid', I.leaf, '1.25rem')} Hollis garden ${icon(I.updown, 14, 2)}</span>`),
    row('Show finished tasks', toggle('Show finished tasks', false)),
    row('Count in the sidebar', popup('Count in the sidebar', ['Tasks left', 'All tasks', 'None'])),
    row('Suggest quick wins', toggle('Suggest quick wins', true), '', true),
  ].join('\n'),
)}
${section(
  'Alerts on this device',
  [
    row('Morning summary', `<input class="m-input" type="time" value="07:30" aria-label="Morning summary time" style="inline-size: 8rem; --m-input-border: transparent; --m-input-bg: var(--m-color-bg-sunken)">`, glyph(I.bell)),
    row('Arriving at a site', toggle('Arriving at a site', true), glyph(I.pin)),
    row('Badge on the app icon', toggle('Badge on the app icon', true), glyph(I.clock), true),
  ].join('\n'),
  'Sorrel only uses your location to remind you when you arrive at a saved site.',
)}
${section(
  'Storage',
  `            <div class="m-stack" data-gap="2" style="padding: var(--m-space-3) var(--m-space-4); box-shadow: inset 0 calc(-1 * var(--m-border-width-thin)) 0 var(--m-color-border-default)">
              <div class="m-cluster" data-justify="between"><span>Photos and sketches</span><span style="${muted}; ${num}">1.3 GB of 2 GB</span></div>
              <progress class="m-progress" value="65" max="100" aria-label="Storage used: 65%">65%</progress>
            </div>
${row(`<span style="color: var(--m-color-danger-fg)">Clear downloaded photos…</span>`, '', '', true)}`,
)}
      </div>
    </div>
  </main>
</div>`;

// ── Empty state ──────────────────────────────────────────────────────────────────────────────────
// A project with nothing in it: a large grey glyph, a bold line, one sentence, one capsule button
const emptyState = shell(
  sidebar('Client calls'),
  `  <main style="position: relative; display: flex; flex-direction: column; padding: var(--m-space-3) var(--m-space-8) var(--m-space-16)">
${toolbar('<span></span>', `${glassGroup([[I.share, 'Share'], [I.more, 'More']])}${glass(I.plus, 'New task')}${searchField('Search tasks')}`)}
      <div class="m-cluster" data-justify="between" style="color: var(--m-color-danger-solid)"><h1 style="${largeTitle}">Client calls</h1><span style="${largeTitle}; font-weight: var(--m-font-weight-regular); ${num}">0</span></div>
      <div class="m-stack" data-gap="3" data-align="center" style="flex: 1; justify-content: center; text-align: center; padding-block: var(--m-space-16); max-inline-size: 24rem; margin-inline: auto">
        <span style="color: var(--m-color-fg-subtle)">${icon(I.phone, 52, 1.5)}</span>
        <h2 style="font-size: var(--m-font-size-2xl)">No calls to make</h2>
        <p style="${muted}">Add the people you need to ring back, and Sorrel will put them at the top of the day.</p>
        <button type="button" class="m-button" data-variant="secondary">${icon(I.plus, 16, 2)} Add a call</button>
      </div>
      ${fab('danger-solid', 'Add a call')}
  </main>`,
);

// ── Pricing ──────────────────────────────────────────────────────────────────────────────────────
// Plans as a grouped page: a segmented control, plan cards as white inset groups, a check list each
const perk = (text: string) =>
  `              <li class="m-cluster" data-gap="2" style="flex-wrap: nowrap; align-items: start"><span style="color: var(--m-color-accent-text); margin-block-start: 2px">${icon(I.check, 16, 2.25)}</span><span>${text}</span></li>`;
const plan = (name: string, space: string, price: string, perks: string[], featured = false) => `        <section class="m-card" aria-labelledby="ch-pr-${name.toLowerCase()}" style="border-radius: 1.75rem; padding: var(--m-space-8) var(--m-space-6); gap: var(--m-space-5)">
          <div class="m-stack" data-gap="0" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-semibold); line-height: var(--m-font-leading-tight)">
            <h2 id="ch-pr-${name.toLowerCase()}" style="font-size: inherit; font-weight: inherit${price === 'Free' ? '' : '; color: var(--m-color-accent-text)'}">${name} ${space}</h2>
            <span style="${num}">${price}</span>
            ${featured ? '<span class="m-badge" data-tone="info" style="align-self: start; margin-block-start: var(--m-space-2)">Most crews pick this</span>' : ''}
          </div>
          <ul class="m-stack" data-gap="3" style="list-style: none; margin: 0; padding: 0; ${hair}; padding-block-start: var(--m-space-5)">
${perks.map(perk).join('\n')}
          </ul>
          <button type="button" class="m-button" data-variant="${price === 'Free' ? 'secondary' : 'primary'}" style="margin-block-start: auto; align-self: start">Choose ${name}</button>
        </section>`;
const faq = (q: string, a: string, open = false) =>
  `          <details class="m-accordion-item"${open ? ' open' : ''}><summary>${q}</summary><div class="m-accordion-content">${a}</div></details>`;

const pricing = `<main style="min-block-size: 100vh; padding: var(--m-space-12) var(--m-space-4); background: var(--m-color-bg-canvas)">
  <div class="m-container" data-size="lg">
    <div class="m-stack" data-gap="8">
      <div class="m-stack" data-gap="3" data-align="start">
        ${mark('2.75rem', 26)}
        <h1 style="${largeTitle}">More room for every garden</h1>
        <p style="${muted}; font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold); max-inline-size: 40rem">Keep every photo, sketch and plan in one place, and share projects with the people you work with.</p>
        <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Billing">
          <button type="button" class="m-tab" role="tab" aria-selected="true">Monthly</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Yearly · 2 months free</button>
        </div></div>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 17rem; --m-layout-grid-gap: var(--m-space-4)">
${plan('Seedling', '2 GB', 'Free', ['Unlimited notes and lists', 'Photos up to 2 GB', 'One device at a time'])}
${plan('Crew', '100 GB', '$5/month', ['Everything in Seedling', 'Share projects with 5 people', 'Hand tasks to your crew', 'Site arrival alerts'], true)}
${plan('Studio', '1 TB', '$14/month', ['Everything in Crew', 'Share with up to 25 people', 'Client-ready plan exports'])}
      </div>
      <section class="m-stack" data-gap="3" style="max-inline-size: 44rem; margin-inline: auto; inline-size: 100%" aria-labelledby="ch-pr-q">
        <h2 id="ch-pr-q" style="font-size: var(--m-font-size-xl); padding-inline: var(--m-space-4)">Questions</h2>
        <div class="m-accordion" style="background: var(--m-color-bg-surface); border-radius: var(--m-radius-container)">
${faq('Can I change plans later?', 'Yes. Moving up takes effect right away; moving down starts at your next billing date, and nothing you made is removed.', true)}
${faq('What happens to shared projects if I stop paying?', 'You keep everything you made. Shared projects become read-only for your crew until someone on a paid plan owns them.')}
${faq('Do photos count against my space?', 'Photos, sketches and attachments do. Notes and lists never do.')}
        </div>
        <p style="padding-inline: var(--m-space-4); ${small}; ${muted}">Prices in US dollars. Plans renew automatically until you cancel in Settings.</p>
      </section>
    </div>
  </div>
</main>`;

// ── Errors ───────────────────────────────────────────────────────────────────────────────────────
// A sheet with field errors under the rows, a sync banner, a notification banner, an alert and whole pages
const unavailable = (code: string, paths: string, title: string, body: string, actions: string) => `        <section class="m-card" aria-labelledby="ch-err-${code}" style="align-items: center; text-align: center; padding-block: var(--m-space-10)">
          <span style="color: var(--m-color-fg-subtle)">${icon(paths, 48, 1.5)}</span>
          <span style="${small}; color: var(--m-color-fg-subtle); font-family: var(--m-font-family-mono)">Error ${code}</span>
          <h2 id="ch-err-${code}" style="font-size: var(--m-font-size-2xl)">${title}</h2>
          <p style="${muted}; max-inline-size: 26rem">${body}</p>
          <div class="m-cluster" data-justify="center" data-gap="2">${actions}</div>
        </section>`;
const fieldRow = (id: string, label: string, val: string, err = '', last = false) =>
  `              <div class="m-stack" data-gap="1" style="padding: var(--m-space-2) var(--m-space-4)${last ? '' : '; box-shadow: inset 0 calc(-1 * var(--m-border-width-thin)) 0 var(--m-color-border-default)'}">
                <div class="m-cluster" data-gap="4" style="flex-wrap: nowrap"><label for="${id}" style="inline-size: 6rem; flex: none">${label}</label><input class="m-input" id="${id}" value="${val}"${err ? ` aria-invalid="true" aria-describedby="${id}-e"` : ''} style="--m-input-border: ${err ? 'var(--m-color-danger-solid)' : 'transparent'}; --m-input-bg: transparent"></div>
                ${err ? `<p class="m-field-error" id="${id}-e" style="padding-inline-start: calc(6rem + var(--m-space-4))">${err}</p>` : ''}
              </div>`;

const errors = `<main style="min-block-size: 100vh; padding: var(--m-space-8) var(--m-space-4); background: var(--m-color-bg-canvas)">
  <div class="m-container" data-size="md">
    <div class="m-stack" data-gap="8">
      <div class="m-alert" data-tone="warning" role="status">
        <span class="m-alert-icon">${icon(I.cloudOff, 18)}</span>
        <div class="m-alert-content"><div class="m-alert-title">You’re offline</div><div class="m-alert-body">Changes are kept on this device and will sync when you’re back online. Shared projects may be out of date.</div></div>
      </div>
      <form class="m-dialog" data-static data-size="md" role="dialog" aria-modal="false" aria-labelledby="ch-err-form" novalidate style="background: var(--m-color-bg-canvas); box-shadow: var(--m-shadow-overlay)">
        <header class="m-cluster" data-justify="between" style="flex-wrap: nowrap">
          ${glass(I.x, 'Cancel')}
          <h2 id="ch-err-form" class="m-dialog-title">New site</h2>
          <button type="submit" class="m-button" data-variant="primary" data-icon-only aria-label="Save the site">${icon(I.check, 20, 2.25)}</button>
        </header>
        <div class="m-alert" data-tone="danger" role="alert">
          <span class="m-alert-icon">${icon(I.alert, 18)}</span>
          <div class="m-alert-content"><div class="m-alert-title">2 things to fix</div><div class="m-alert-body">Nothing was saved yet.</div></div>
        </div>
        <div style="border-radius: var(--m-radius-md); background: var(--m-color-bg-surface); overflow: hidden">
${fieldRow('ch-err-name', 'Name', 'Wren Cottage')}
${fieldRow('ch-err-post', 'Postcode', 'SW1', 'Enter the full postcode, like SW1A 2AA.')}
${fieldRow('ch-err-mail', 'Client email', 'ruth.hollis@', 'Add the part after the @, like ruth.hollis@mail.com.', true)}
        </div>
      </form>
      <div class="m-toast" data-tone="danger" role="alert"><div class="m-toast-content"><div class="m-toast-title">Couldn’t upload 3 photos</div><div class="m-toast-body">Pond survey, Wren Cottage. They’re still on this device.</div></div><button type="button" class="m-button" data-size="sm">Try again</button></div>
      <div class="m-dialog" data-static data-size="sm" role="alertdialog" aria-modal="false" aria-labelledby="ch-err-del" aria-describedby="ch-err-del-d" style="text-align: center; align-items: center">
        <h2 class="m-dialog-title" id="ch-err-del">Delete “Workshop”?</h2>
        <p class="m-dialog-description" id="ch-err-del-d">Its 8 tasks are deleted from every device. You can’t undo this.</p>
        <div class="m-stack" data-gap="2" style="inline-size: 100%">
          <button type="button" class="m-button" data-variant="danger" style="inline-size: 100%">Delete project</button>
          <button type="button" class="m-button" data-variant="secondary" style="inline-size: 100%">Cancel</button>
        </div>
      </div>
${unavailable('404', I.searchX, 'Can’t find that note', 'It may have been deleted, or the link is out of date.', `<a class="m-button" data-variant="primary" href="#">Go to your notes</a>`)}
${unavailable('500', I.alert, 'Something went wrong', 'Sorrel couldn’t load this project. Nothing you wrote was lost. Try again in a moment.', `<button type="button" class="m-button" data-variant="primary">Try again</button><a class="m-button" data-variant="ghost" href="#">Contact support</a>`)}
${unavailable('403', I.lock, 'This project isn’t shared with you', 'Ask the person who owns it to add you to the crew.', `<button type="button" class="m-button" data-variant="primary">Ask for access</button><a class="m-button" data-variant="ghost" href="#">Go back</a>`)}
    </div>
  </div>
</main>`;

export const chalkRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'A floating grey sidebar with coloured smart-list tiles, projects with round coloured icons and notebooks; one smart list across projects under coloured headings, checklist circles and a round add button.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'Three panes: notebooks in the sidebar, the notebook’s notes grouped by month with the selected one in yellow, and the note in an editor under a glass toolbar, with a yellow checklist, a table and tags.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'A welcome sheet on the grouped grey: the mark, a big bold title, three features each led by a coloured glyph, and one wide blue capsule.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A white settings sidebar with an account row and coloured square icons; grey section labels over white inset groups of rows with switches, pop-ups and disclosure chevrons, and footnotes below.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description: 'An empty project: its big coloured title, then a large grey glyph, a bold line, one sentence and a grey capsule button.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'A grouped page: the mark, a big bold headline, a segmented control, three plans as white inset groups with check lists, and questions in a white group.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'An offline banner, a sheet with a summary and errors under its rows, a notification banner with one action, a centred alert, and whole pages for 404, 500 and no access.',
    html: errors,
  },
];
