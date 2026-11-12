import type { ArchetypeRecipe } from '../types';

/*
 * Quill's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with invented notes from a personal notes app ("Folio"). The reference is a
 * desktop and phone app with no web app, so its three desktop columns are translated to the web:
 * a 180px graphite sidebar of tags, a 280px note list, and the editor. They follow its real
 * patterns: notes as bold titles over two muted lines and a small date, the selected note on a pale
 * fill with a red leading edge, grey tag capsules, round quiet chrome buttons, a red pin, red links
 * and bullets, callouts with a coloured bar, framed tables with a filled header, a floating format
 * bar, and an info panel with a segmented control.
 */

// Lucide icons, outlined, 1.75 on the 24px grid: the reference's thin, round-ended glyphs
const icon = (paths: string, size = 16, stroke = 1.75) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none; display: inline-block; vertical-align: middle">${paths}</svg>`;
const I = {
  inbox:
    '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  everything:
    '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  agenda: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  drafts:
    '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/><path d="m15 5 3 3"/>',
  tasks:
    '<rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
  hash: '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  kitchen:
    '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  place:
    '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  palette:
    '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
  feather:
    '<path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/>',
  compose:
    '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  sliders:
    '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
  dots: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  heading: '<path d="M6 12h12"/><path d="M6 20V4"/><path d="M18 20V4"/>',
  list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
  bold: '<path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8"/>',
  italic: '<line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/>',
  highlight: '<path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  type: '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>',
  keyboard:
    '<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  sqCheck: '<rect width="18" height="18" x="3" y="3" rx="3"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  sqMinus: '<rect width="18" height="18" x="3" y="3" rx="3"/><path d="M8 12h8"/>',
  sq: '<rect width="18" height="18" x="3" y="3" rx="3"/>',
  searchX:
    '<path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  warn: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  cloudOff:
    '<path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193"/><path d="M21.532 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.008 7.008 0 0 0 10 5.07"/>',
  enter: '<polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
};

// Shared inline treatments (tokens only)
const muted = 'color: var(--m-color-fg-muted)';
const subtle = 'color: var(--m-color-fg-subtle)';
const hair = 'var(--m-border-width-thin) solid var(--m-color-border-default)';
const num = 'font-variant-numeric: tabular-nums';
const display = (size: string) =>
  `font-family: var(--m-font-family-display); font-weight: var(--m-font-weight-bold); font-size: var(--m-font-size-${size}); line-height: var(--m-font-leading-tight); letter-spacing: 0`;
const sideFg = 'color: var(--m-sidebar-link-fg)';

// The round chrome: a pale disc with a hairline ring and a breath of shadow, the icon in grey
const round = (paths: string, label: string, extra = '') =>
  `<button type="button" class="m-button" data-variant="secondary" data-icon-only aria-label="${label}" style="border-radius: var(--m-radius-full); border-color: transparent; box-shadow: var(--m-shadow-sm); ${muted}${extra}">${icon(paths, 17)}</button>`;
// The text-style capsule at the top of the editor
const biu = `<button type="button" class="m-button" data-variant="secondary" aria-label="Text styles" style="border-radius: var(--m-radius-full); border-color: transparent; box-shadow: var(--m-shadow-sm); ${muted}; gap: 1px; letter-spacing: 0; padding-inline: var(--m-space-4)"><b style="font-weight: var(--m-font-weight-bold)">B</b><i style="font-family: var(--m-font-family-serif)">I</i><u>U</u></button>`;
// A tag capsule, written in the text
const tag = (path: string) => `<span class="m-badge">${icon(I.hash, 12)}${path}</span>`;
// A red link with the small pencil the editor shows beside it
const noteLink = (label: string) =>
  `<a href="#" style="display: inline-flex; align-items: center; gap: 3px">${label}${icon(I.drafts, 12)}</a>`;
// A callout: a faint wash, a hairline frame, a solid bar on the leading edge, a coloured icon
const callout = (tone: string, paths: string, title: string, body: string) =>
  `<div class="m-alert" data-tone="${tone}" role="note" style="border-inline-start-color: var(--m-color-${tone}-solid)">
  <span class="m-alert-icon" aria-hidden="true" style="color: var(--m-color-${tone}-solid)">${icon(paths, 17)}</span>
  <div class="m-alert-content">
    <p class="m-alert-title" style="color: var(--m-color-fg-default)">${title}</p>
    <p class="m-alert-body" style="color: var(--m-color-fg-default)">${body}</p>
  </div>
</div>`;
// A to-do row
const todo = (label: string, done = false) =>
  `<label class="m-field" data-layout="inline" style="font-size: var(--m-font-size-lg)${done ? `; ${muted}` : ''}"><input class="m-checkbox" type="checkbox"${done ? ' checked' : ''}> ${label}</label>`;

// The graphite sidebar: fixed rows, then the tag tree
interface Tag {
  name: string;
  icon: string;
  children?: string[];
  open?: boolean;
  pinned?: boolean;
}
const tags: Tag[] = [
  { name: 'garden', icon: I.leaf, children: ['balcony', 'seeds'], open: true, pinned: true },
  { name: 'reading', icon: I.book, children: ['essays', 'novels'] },
  { name: 'kitchen', icon: I.kitchen, children: ['bread'] },
  { name: 'letters', icon: I.mail },
  { name: 'studio', icon: I.palette },
  { name: 'travel', icon: I.place },
];
const chev = (open: boolean | undefined, has: boolean) =>
  has
    ? `<span aria-hidden="true" style="display: inline-flex; margin-inline-start: -2px; transform: rotate(${open ? '0' : '-90'}deg); color: var(--m-sidebar-heading-fg)">${icon(I.down, 12, 2)}</span>`
    : '<span aria-hidden="true" style="inline-size: 10px; flex: none"></span>';
const sideLink = (paths: string, label: string, current: string, extra = '') =>
  `<li><a class="m-sidebar-link" href="#"${label === current ? ' aria-current="page"' : ''}><span aria-hidden="true" style="inline-size: 10px; flex: none"></span>${icon(paths, 16)}<span style="flex: 1">${label}</span>${extra}</a></li>`;
const tagLink = (t: Tag, current: string) => {
  const kids =
    t.children && t.open
      ? `\n          <ul>${t.children
          .map(
            (c) =>
              `<li><a class="m-sidebar-link" href="#"${`${t.name}/${c}` === current ? ' aria-current="page"' : ''}>${icon(I.hash, 14)}<span style="flex: 1">${c}</span></a></li>`,
          )
          .join('')}</ul>`
      : '';
  return `        <li><a class="m-sidebar-link" href="#"${t.name === current ? ' aria-current="page"' : ''}>${chev(t.open, !!t.children)}${icon(t.icon, 16)}<span style="flex: 1">${t.name}</span>${t.pinned ? `<span class="m-sidebar-count">${icon(I.pin, 12)}</span>` : ''}</a>${kids}</li>`;
};
const sidebar = (current: string) => `  <nav class="m-sidebar" aria-label="Notes and tags">
    <div class="m-cluster" data-justify="end" style="padding: var(--m-space-2) var(--m-space-1) 0">
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Filter the sidebar" style="${sideFg}; background: transparent">${icon(I.sliders, 18)}</button>
    </div>
    <div class="m-sidebar-section">
      <ul>
        ${sideLink(I.inbox, 'Inbox', current, '<span class="m-sidebar-count">4</span>')}
        ${sideLink(I.agenda, 'Agenda', current, '<span class="m-sidebar-count">2</span>')}
        ${sideLink(I.star, 'Starred', current)}
        ${sideLink(I.everything, 'Everything', current)}
        ${sideLink(I.archive, 'Put away', current)}
      </ul>
    </div>
    <div class="m-sidebar-section">
      <h2 class="m-sidebar-heading" style="padding-inline: var(--m-space-2)">Tags</h2>
      <ul>
${tags.map((t) => tagLink(t, current)).join('\n')}
      </ul>
    </div>
  </nav>`;

// The note list: a header with the current place and round chrome, then notes
interface Note {
  title: string;
  snippet: string;
  date: string;
  pinned?: boolean;
  selected?: boolean;
  file?: string;
  locked?: boolean;
}
const fileTile = (name: string) => `<span class="m-stack" data-gap="1" style="inline-size: 6.5rem; padding: var(--m-space-2) var(--m-space-3); border-radius: var(--m-radius-md); background: var(--m-color-bg-sunken); box-shadow: inset 0 0 0 var(--m-border-width-thin) var(--m-color-border-default); font-size: var(--m-font-size-xs); ${muted}; line-height: 1.3; margin-block: var(--m-space-2) var(--m-space-1)">
            <span style="overflow-wrap: anywhere">${name}</span>
            <span class="m-badge" style="align-self: start; block-size: 1rem; font-size: 0.5625rem; font-weight: var(--m-font-weight-semibold); padding-inline: 5px">PDF</span>
          </span>`;
const lockedLines = `<span class="m-stack" data-gap="1" aria-label="Locked note" style="padding-block: var(--m-space-1)">
            <span class="m-cluster" data-gap="1">${['3rem', '2rem', '3.5rem', '2.5rem', '4rem'].map((w) => `<span class="m-skeleton" style="inline-size: ${w}; block-size: 0.75rem"></span>`).join('')}</span>
            <span class="m-cluster" data-gap="1">${['2.5rem', '4rem', '1.5rem', '3rem'].map((w) => `<span class="m-skeleton" style="inline-size: ${w}; block-size: 0.75rem"></span>`).join('')}</span>
          </span>`;
const noteRow = (n: Note) => `      <li>
        <a href="#"${n.selected ? ' aria-current="true"' : ''} style="display: block; padding: var(--m-space-3) var(--m-space-4); border-radius: var(--m-radius-md); text-decoration: none; color: inherit${n.selected ? '; background: var(--m-color-bg-sunken); box-shadow: inset 3px 0 0 var(--m-color-accent-default)' : ''}">
          <span style="display: block; font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-semibold); line-height: 1.35">${n.title}</span>
          ${
            n.locked
              ? lockedLines
              : `<span style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; ${muted}; font-size: var(--m-font-size-md); line-height: 1.4; margin-block-start: 2px">${n.snippet}</span>`
          }
          ${n.file ? fileTile(n.file) : ''}
          <span class="m-cluster" data-gap="2" style="margin-block-start: var(--m-space-1); font-size: var(--m-font-size-xs); ${subtle}">${n.pinned ? `<span style="color: var(--m-color-accent-text); display: inline-flex">${icon(I.pin, 12)}</span>` : ''}${n.date}</span>
        </a>
      </li>`;
const sep = '      <li aria-hidden="true"><hr class="m-divider" style="margin: 0 var(--m-space-4)"></li>';
const noteList = (notes: Note[]) =>
  notes
    .map((n, i) => {
      const prev = notes[i - 1];
      return `${i > 0 && !n.selected && !prev?.selected ? `${sep}\n` : ''}${noteRow(n)}`;
    })
    .join('\n');
const listColumn = (place: string, notes: Note[], top = '') => `    <section aria-label="${place}" style="background: var(--m-color-bg-surface); border-inline-end: ${hair}">
      <header class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-3) var(--m-space-2) var(--m-space-4)">
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="font-weight: var(--m-font-weight-bold); font-size: var(--m-font-size-lg); padding-inline: var(--m-space-1); letter-spacing: 0">${place} ${icon(I.down, 13, 2)}</button>
        <span class="m-cluster" data-gap="2">${round(I.compose, 'New note')}${round(I.search, 'Search notes')}</span>
      </header>${top}
      <ul class="m-stack" data-gap="0" role="list" style="list-style: none; margin: 0; padding: 0 var(--m-space-2) var(--m-space-6)">
${noteList(notes)}
      </ul>
    </section>`;

// The editor's top bar: the text-style capsule, info and more
const editorBar = (extra = '') => `      <div class="m-cluster" data-justify="end" data-gap="2" style="padding: var(--m-space-3) var(--m-space-4)">${extra}${biu}${round(I.info, 'Note info')}${round(I.more, 'More')}</div>`;
// The floating format bar at the foot of the editor
const fmt = (paths: string, label: string) =>
  `<button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="${label}" style="${muted}">${icon(paths, 16)}</button>`;
const formatBar = `      <div role="toolbar" aria-label="Format" class="m-cluster" data-gap="1" style="margin: var(--m-space-8) auto var(--m-space-5); inline-size: fit-content; padding: 3px; border-radius: var(--m-radius-md); background: var(--m-color-bg-sunken); box-shadow: var(--m-shadow-sm)">
        ${fmt(I.heading, 'Heading')}${fmt(I.tasks, 'To-do')}${fmt(I.list, 'List')}
        <hr class="m-divider" data-orientation="vertical" style="margin-inline: var(--m-space-1)">
        ${fmt(I.bold, 'Bold')}${fmt(I.italic, 'Italic')}${fmt(I.highlight, 'Highlight')}
        <hr class="m-divider" data-orientation="vertical" style="margin-inline: var(--m-space-1)">
        ${fmt(I.link, 'Link')}${fmt(I.table, 'Table')}${fmt(I.image, 'Image')}${fmt(I.dots, 'More formats')}
      </div>`;

// Three columns: the sidebar, then the note list beside everything else
const shell = (current: string, list: string, editor: string) => `<div class="m-split" data-gap="0" style="--m-layout-split-side: 11.25rem; min-block-size: 100vh; background: var(--m-color-bg-canvas)">
${sidebar(current)}
  <div class="m-split" data-gap="0" style="--m-layout-split-side: 17.5rem">
${list}
${editor}
  </div>
</div>`;

const homeNotes: Note[] = [
  {
    title: 'Sourdough log, week six',
    snippet: 'Starter doubled in five hours at 24°. Next loaf: 78% water and a longer cold proof overnight.',
    date: 'Yesterday',
    pinned: true,
  },
  {
    title: 'Reading list for winter',
    snippet: 'Two essay collections, the lighthouse novel Inés lent me, and a field guide to coastal birds.',
    date: 'Nov 9',
  },
  {
    title: 'Balcony herb plan',
    snippet: 'Three troughs along the south rail, filled in the order below. Mint stays in its own pot.',
    date: 'Just now',
    selected: true,
    file: 'trough-layout.pdf',
  },
  {
    title: 'Letter to Aunt Marisol',
    snippet: 'Thank you for the quince paste. The jar made it through the post in one piece, which feels like…',
    date: 'Nov 6',
  },
  { title: 'Studio rent, 2027', snippet: '', date: 'Nov 2', locked: true },
  {
    title: 'Porto, day by day',
    snippet: 'Early tram before the crowds, the tile museum, then lunch by the river with the cousins.',
    date: 'Oct 30',
  },
];

const dashboard = shell(
  'garden/balcony',
  listColumn('garden/balcony', homeNotes),
  `    <main style="background: var(--m-color-bg-canvas); display: flex; flex-direction: column">
${editorBar()}
      <article class="m-prose" style="inline-size: 100%; margin-inline: auto; padding: var(--m-space-6) var(--m-space-8) 0">
        <h1>Balcony herb plan</h1>
        <p>Three troughs along the south rail, filled in the order below. Tagged ${tag('garden/balcony')} so it sits with the rest of the <strong>spring</strong> notes. Seeds come from the ${noteLink('swap table list')}.</p>
        ${callout('warning', I.alert, 'Before planting', 'Mint spreads underground, so it gets <em>its own pot</em>, never the shared trough.')}
        <h2>This weekend</h2>
        <div class="m-stack" data-gap="2">
          ${todo('Drill drainage holes in trough two')}
          ${todo('Buy compost and two bags of grit', true)}
          ${todo('Soak the parsley seed overnight', true)}
          ${todo('Ask Tomás about the spare trellis')}
        </div>
        <h2>Where everything goes</h2>
        <div class="m-table-wrap" style="overflow: hidden">
          <table class="m-table" style="display: table; inline-size: calc(100% + 2px); max-inline-size: none; margin: -1px">
            <thead><tr><th scope="col">Herb</th><th scope="col">Trough</th><th scope="col">Light</th></tr></thead>
            <tbody>
              <tr><td>Basil</td><td>One</td><td>Full sun</td></tr>
              <tr><td>Flat parsley</td><td>One</td><td>Part sun</td></tr>
              <tr><td>Thyme</td><td>Two</td><td>${noteLink('Full sun')}</td></tr>
              <tr><td>Chives</td><td>Three</td><td>Part shade</td></tr>
            </tbody>
          </table>
        </div>
        <ul>
          <li>Water in the evening, not at noon</li>
          <li>Pinch the basil tips once it has six leaves</li>
        </ul>
      </article>
${formatBar}
    </main>`,
);

// List and detail: a search across notes, the matches marked, and the note with its info panel
const mark = (w: string) =>
  `<mark style="background: var(--m-color-warning-border); color: inherit; border-radius: 3px; padding-inline: 1px">${w}</mark>`;
const searchNotes: Note[] = [
  {
    title: 'Notes on The Lantern Keeper',
    snippet: `Finished it on the train. The ${mark('lighthouse')} is never described from outside, only from the lamp room…`,
    date: '2 hours ago',
    selected: true,
  },
  {
    title: 'Reading list for winter',
    snippet: `Two essay collections, the ${mark('lighthouse')} novel Inés lent me, and a field guide to coastal birds.`,
    date: 'Nov 9',
  },
  {
    title: 'Porto, day by day',
    snippet: `Walked out along the breakwater to the little ${mark('lighthouse')} at Foz before dinner.`,
    date: 'Oct 30',
    file: 'foz-walk-map.pdf',
  },
  {
    title: 'Essay ideas',
    snippet: `Places that only make sense at night: night ferries, bakeries at four, a ${mark('lighthouse')} keeper's log.`,
    date: 'Sep 14',
  },
];
const searchBox = `
      <div style="padding: 0 var(--m-space-3) var(--m-space-3)">
        <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap; padding-inline: var(--m-space-3); block-size: var(--m-control-height-md); border-radius: var(--m-radius-full); background: var(--m-color-bg-surface); box-shadow: 0 0 0 2px var(--m-color-accent-subtle), inset 0 0 0 var(--m-border-width-thin) var(--m-color-accent-default)">
          <span style="${muted}; display: inline-flex">${icon(I.search, 15)}</span>
          <input class="m-input" type="search" value="lighthouse" aria-label="Search notes" style="border: 0; background: transparent; padding: 0; block-size: auto; box-shadow: none">
          <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Clear the search" style="${subtle}">${icon(I.x, 14, 2)}</button>
        </div>
        <p style="font-size: var(--m-font-size-xs); ${subtle}; margin: var(--m-space-2) var(--m-space-1) 0">4 notes</p>
      </div>`;
const stat = (n: string, label: string, paths: string) => `<div class="m-card" data-size="sm" style="border-radius: 12px">
            <div class="m-cluster" data-justify="between" style="${subtle}"><span style="${display('2xl')}; color: var(--m-color-fg-default); ${num}">${n}</span>${icon(paths, 15)}</div>
            <p style="font-size: var(--m-font-size-sm); ${muted}; margin: var(--m-space-1) 0 0">${label}</p>
          </div>`;
const backlink = (title: string, before: string, linked: string, after: string) => `<li style="padding-block: var(--m-space-3); border-block-start: ${hair}">
            <p style="font-weight: var(--m-font-weight-semibold); margin: 0">${title}</p>
            <p style="margin: var(--m-space-1) 0 0; font-size: var(--m-font-size-md); ${muted}">${before}<a href="#" style="color: var(--m-color-accent-text); text-decoration: none">${linked}</a>${after}</p>
          </li>`;
const listDetail = shell(
  'reading',
  listColumn('reading', searchNotes, searchBox),
  `    <div class="m-cluster" data-gap="0" data-align="stretch" style="flex-wrap: wrap; background: var(--m-color-bg-canvas)">
      <main style="flex: 1 1 24rem; min-inline-size: 0">
${editorBar()}
        <article class="m-prose" style="margin-inline: auto; padding: var(--m-space-6) var(--m-space-8) var(--m-space-12)">
          <h1>Notes on The Lantern Keeper</h1>
          <p>${tag('reading/novels')} Finished it on the train home. The ${mark('lighthouse')} is never described from outside, only from the lamp room, which is the whole trick of the book.</p>
          <h2>Lines to keep</h2>
          <blockquote><p>The light does not care who is at sea. It only turns.</p></blockquote>
          <p>Lend it to Inés next; she will argue with the ending. Compare with the ${noteLink('Essay ideas')} note.</p>
          <h3>Questions for book club</h3>
          <ol>
            <li>Why does the keeper stop writing the log in winter?</li>
            <li>Is the narrator the daughter, or the next keeper?</li>
          </ol>
        </article>
      </main>
      <aside aria-label="Note info" style="flex: 1 0 16rem; max-inline-size: 22rem; border-inline-start: ${hair}; padding: var(--m-space-4) var(--m-space-4) var(--m-space-8); background: var(--m-color-bg-surface)">
        <div class="m-tabs" data-variant="pill">
          <div class="m-tab-list" role="tablist" aria-label="Note info" style="display: flex; inline-size: 100%">
            <button type="button" class="m-tab" role="tab" id="qi-tab-0" aria-controls="qi-panel-0" aria-selected="true" tabindex="0" style="flex: 1; justify-content: center" aria-label="Details">${icon(I.info, 16)}</button>
            <button type="button" class="m-tab" role="tab" id="qi-tab-1" aria-selected="false" tabindex="-1" style="flex: 1; justify-content: center" aria-label="Links">${icon(I.link, 16)}</button>
            <button type="button" class="m-tab" role="tab" id="qi-tab-2" aria-selected="false" tabindex="-1" style="flex: 1; justify-content: center" aria-label="History">${icon(I.history, 16)}</button>
          </div>
          <div class="m-tab-panel" role="tabpanel" id="qi-panel-0" aria-labelledby="qi-tab-0" tabindex="0">
            <p style="text-align: center; font-weight: var(--m-font-weight-semibold); ${muted}; margin: var(--m-space-3) 0">Details</p>
            <div class="m-grid" data-gap="2" style="--m-layout-grid-min: 6.5rem">
              ${stat('8', 'Minutes to read', I.book)}
              ${stat('1,846', 'Words', I.type)}
              ${stat('2', 'Open to-dos', I.tasks)}
              ${stat('1', 'Attachment', I.file)}
            </div>
            <dl class="m-stack" data-gap="0" style="margin: var(--m-space-4) 0 0; font-size: var(--m-font-size-md)">
              <div style="padding-block: var(--m-space-2); border-block-start: ${hair}"><dt style="font-size: var(--m-font-size-xs); ${subtle}">Edited</dt><dd style="margin: 0">Nov 12, 2026 at 09:41</dd></div>
              <div style="padding-block: var(--m-space-2); border-block-start: ${hair}"><dt style="font-size: var(--m-font-size-xs); ${subtle}">Created</dt><dd style="margin: 0">Nov 3, 2026 at 21:07</dd></div>
            </dl>
            <p style="font-weight: var(--m-font-weight-semibold); margin: var(--m-space-5) 0 var(--m-space-1)">Mentioned in</p>
            <ul style="list-style: none; margin: 0; padding: 0">
              ${backlink('Book club, November', 'We meet on the 20th to talk about ', 'The Lantern Keeper', '.')}
              ${backlink('Essay ideas', 'Start from the log entries in ', 'The Lantern Keeper', ' and work outward.')}
            </ul>
          </div>
        </div>
      </aside>
    </div>`,
);

// Onboarding: a centred welcome, one big bold line, then a theme choice in three cards
const preview = (mode: string) => `<span data-theme="quill" data-mode="${mode}" aria-hidden="true" style="display: flex; block-size: 6rem; border-radius: var(--m-radius-md); overflow: hidden; box-shadow: inset 0 0 0 var(--m-border-width-thin) var(--m-color-border-default); background: var(--m-color-bg-canvas)">
            <span style="inline-size: 26%; background: var(--m-sidebar-bg); padding: var(--m-space-2)" class="m-stack" data-gap="1"><span style="block-size: 4px; inline-size: 70%; border-radius: 2px; background: var(--m-sidebar-link-fg)"></span><span style="block-size: 4px; inline-size: 55%; border-radius: 2px; background: var(--m-sidebar-heading-fg)"></span><span style="block-size: 4px; inline-size: 62%; border-radius: 2px; background: var(--m-sidebar-heading-fg)"></span></span>
            <span class="m-stack" data-gap="1" style="flex: 1; padding: var(--m-space-3)"><span style="block-size: 6px; inline-size: 60%; border-radius: 2px; background: var(--m-color-fg-default)"></span><span style="block-size: 4px; inline-size: 90%; border-radius: 2px; background: var(--m-color-fg-subtle)"></span><span style="block-size: 4px; inline-size: 80%; border-radius: 2px; background: var(--m-color-fg-subtle)"></span><span style="block-size: 4px; inline-size: 35%; border-radius: 2px; background: var(--m-color-accent-default)"></span></span>
          </span>`;
const lookCard = (name: string, mode: string, note: string, checked = false) => `<label class="m-card" data-variant="outline" data-size="sm" style="cursor: pointer; display: flex; flex-direction: column; gap: var(--m-space-3)${checked ? '; border-color: var(--m-color-accent-default); box-shadow: 0 0 0 1px var(--m-color-accent-default)' : ''}">
          ${preview(mode)}
          <span class="m-cluster" data-gap="2"><input class="m-radio" type="radio" name="quill-look"${checked ? ' checked' : ''}> <span style="font-weight: var(--m-font-weight-semibold)">${name}</span></span>
          <span style="font-size: var(--m-font-size-sm); ${muted}">${note}</span>
        </label>`;
const brandMark = (size = '2.25rem') =>
  `<span aria-hidden="true" style="display: inline-flex; align-items: center; justify-content: center; inline-size: ${size}; block-size: ${size}; border-radius: 28%; background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">${icon(I.feather, 20, 2)}</span>`;
const onboarding = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  <div class="m-container" data-size="md" style="padding-block: var(--m-space-10) var(--m-space-16)">
    <div class="m-stack" data-gap="8">
      <div class="m-cluster" data-justify="between">
        <span class="m-cluster" data-gap="2" style="font-weight: var(--m-font-weight-bold); font-size: var(--m-font-size-lg)">${brandMark('1.75rem')} Folio</span>
        <span style="font-size: var(--m-font-size-sm); ${muted}">Step 2 of 3</span>
      </div>
      <progress class="m-progress" value="2" max="3" aria-label="Setup progress" data-size="sm"></progress>
      <div class="m-stack" data-gap="3" style="text-align: center">
        <h1 style="${display('4xl')}">A quiet place<br>for every thought</h1>
        <p style="font-size: var(--m-font-size-xl); ${muted}; margin: 0">Choose how your notes look. You can change it any time in Settings.</p>
      </div>
      <fieldset class="m-grid" data-gap="4" style="--m-layout-grid-min: 11rem; border: 0; padding: 0; margin: 0">
        <legend class="m-sr-only">Look</legend>
        ${lookCard('Paper', 'light', 'White pages and a graphite sidebar.', true)}
        ${lookCard('Night', 'dark', 'Graphite pages for late writing.')}
        ${lookCard('Match my device', 'light', 'Paper by day, Night after sunset.')}
      </fieldset>
      <div class="m-stack" data-gap="4" style="padding: var(--m-space-5) var(--m-space-6); border-radius: var(--m-radius-lg); background: var(--m-color-bg-sunken)">
        <div class="m-cluster" data-justify="between" data-gap="4">
          <label class="m-field-label" for="quill-size" style="margin: 0">Text size</label>
          <select class="m-select" id="quill-size" style="inline-size: 10rem"><option>Small</option><option selected>Medium</option><option>Large</option></select>
        </div>
        <hr class="m-divider" style="margin: 0">
        <label class="m-cluster" data-justify="between" data-gap="4">
          <span class="m-stack" data-gap="0"><span style="font-weight: var(--m-font-weight-medium)">Keep notes on all my devices</span><span style="font-size: var(--m-font-size-sm); ${muted}">Encrypted on the way and at rest.</span></span>
          <input class="m-switch" type="checkbox" role="switch" checked>
        </label>
      </div>
      <div class="m-cluster" data-justify="between">
        <button type="button" class="m-button" data-variant="ghost">${icon(I.left, 16)} Back</button>
        <span class="m-cluster" data-gap="2">
          <button type="button" class="m-button" data-variant="ghost" style="${muted}">Skip setup</button>
          <button type="button" class="m-button" data-variant="primary" data-size="lg">Continue</button>
        </span>
      </div>
    </div>
  </div>
</div>`;

// Settings: a desktop preferences window. An icon toolbar of panes, then right-aligned labels
const pane = (paths: string, label: string, current = false) =>
  `<button type="button" class="m-button" data-variant="ghost" style="flex-direction: column; block-size: auto; gap: 2px; padding: var(--m-space-2) var(--m-space-3); font-size: var(--m-font-size-sm); letter-spacing: 0${current ? '; background: var(--m-color-border-default); color: var(--m-color-accent-text)' : `; ${muted}`}"${current ? ' aria-current="page"' : ''}>${icon(paths, 22, 1.5)}${label}</button>`;
const row = (label: string, control: string, hint = '') => `<div class="m-split" data-gap="4" style="--m-layout-split-side: 11rem; align-items: baseline">
          <div style="text-align: end; padding-block-start: var(--m-space-2); font-weight: var(--m-font-weight-medium)">${label}</div>
          <div class="m-stack" data-gap="1">${control}${hint ? `<p class="m-field-hint" style="margin: 0">${hint}</p>` : ''}</div>
        </div>`;
const check = (label: string, checked = false) =>
  `<label class="m-field" data-layout="inline"><input class="m-checkbox" type="checkbox"${checked ? ' checked' : ''}> ${label}</label>`;
const settings = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas); padding: var(--m-space-10) var(--m-space-4)">
  <section class="m-container" data-size="md" aria-labelledby="quill-settings-title" style="background: var(--m-color-bg-sunken); border-radius: 12px; box-shadow: var(--m-shadow-overlay); padding: 0; overflow: hidden">
    <header style="border-block-end: ${hair}; padding: var(--m-space-3) var(--m-space-4) var(--m-space-2)">
      <h1 id="quill-settings-title" style="text-align: center; font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-semibold); margin: 0 0 var(--m-space-2)">Writing</h1>
      <nav aria-label="Settings" class="m-cluster" data-justify="center" data-gap="1">
        ${pane(I.drafts, 'Writing', true)}
        ${pane(I.palette, 'Look')}
        ${pane(I.keyboard, 'Keyboard')}
        ${pane(I.shield, 'Privacy')}
      </nav>
    </header>
    <div class="m-stack" data-gap="6" style="padding: var(--m-space-8) var(--m-space-8) var(--m-space-6)">
      <div class="m-stack" data-gap="4">
        ${row('Text size', '<select class="m-select" aria-label="Text size" style="inline-size: 8rem"><option>Small</option><option selected>Medium</option><option>Large</option></select>')}
        ${row('Spacing', '<select class="m-select" aria-label="Spacing" style="inline-size: 12rem"><option>Compact</option><option selected>Comfortable</option><option>Airy</option></select>', 'Sets lines and paragraphs together.')}
        ${row('Typeface', '<select class="m-select" aria-label="Typeface" style="inline-size: 16rem"><option selected>Folio Sans</option><option>Book serif</option><option>Typewriter</option></select>')}
      </div>
      <hr class="m-divider" style="margin: 0">
      <div class="m-stack" data-gap="4">
        ${row('While writing', `<div class="m-stack" data-gap="2">${check('Show Markdown symbols', true)}${check('Turn straight quotes into curly ones', true)}${check('Keep the cursor line in the middle')}${check('Check spelling as I type', true)}</div>`)}
        ${row('New notes', `<div class="m-stack" data-gap="2"><label class="m-field" data-layout="inline"><input class="m-radio" type="radio" name="quill-new" checked> Start with a title</label><label class="m-field" data-layout="inline"><input class="m-radio" type="radio" name="quill-new"> Start with today’s date</label></div>`)}
        ${row('Shortcuts', '<span class="m-cluster" data-gap="2" style="padding-block-start: var(--m-space-1)">New note <kbd class="m-kbd">⌘</kbd><kbd class="m-kbd">N</kbd> · Find <kbd class="m-kbd">⌘</kbd><kbd class="m-kbd">F</kbd></span>')}
      </div>
      <hr class="m-divider" style="margin: 0">
      ${callout('info', I.bulb, 'Tip', 'Hold <kbd class="m-kbd">⌥</kbd> while choosing a size to apply it to this note only.')}
      <div class="m-cluster" data-justify="center">
        <button type="button" class="m-button" style="background: var(--m-color-bg-surface)">Reset writing settings</button>
      </div>
    </div>
  </section>
</div>`;

// Empty state: the tag holds no notes; the list and the editor both say what to do next
const emptyNotes: Note[] = [];
const emptyState = shell(
  'kitchen',
  `    <section aria-label="kitchen" style="background: var(--m-color-bg-surface); border-inline-end: ${hair}; display: flex; flex-direction: column">
      <header class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-3) var(--m-space-2) var(--m-space-4)">
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="font-weight: var(--m-font-weight-bold); font-size: var(--m-font-size-lg); padding-inline: var(--m-space-1); letter-spacing: 0">${icon(I.kitchen, 15)} kitchen ${icon(I.down, 13, 2)}</button>
        <span class="m-cluster" data-gap="2">${round(I.compose, 'New note')}${round(I.search, 'Search notes')}</span>
      </header>
      <div class="m-stack" data-gap="3" data-align="center" style="flex: 1; justify-content: center; text-align: center; padding: var(--m-space-8) var(--m-space-6); ${muted}">
        <span style="${subtle}">${icon(I.hash, 40, 1.25)}</span>
        <p style="font-weight: var(--m-font-weight-semibold); color: var(--m-color-fg-default); margin: 0">No notes in #kitchen yet</p>
        <p style="font-size: var(--m-font-size-md); margin: 0">Write <span class="m-badge">${icon(I.hash, 12)}kitchen</span> anywhere in a note and it appears here.</p>
      </div>${emptyNotes.map(noteRow).join('')}
    </section>`,
  `    <main style="background: var(--m-color-bg-canvas); display: flex; flex-direction: column">
${editorBar()}
      <div class="m-stack" data-gap="4" data-align="center" style="flex: 1; justify-content: center; text-align: center; padding: var(--m-space-12) var(--m-space-6)">
        <span style="${subtle}">${icon(I.feather, 56, 1)}</span>
        <h1 style="${display('xl')}; margin: 0">Nothing open</h1>
        <p style="${muted}; margin: 0; max-inline-size: 26rem">Pick a note from the list, or start a new one in #kitchen. Press <kbd class="m-kbd">⌘</kbd><kbd class="m-kbd">N</kbd> any time.</p>
        <span class="m-cluster" data-gap="2" data-justify="center">
          <button type="button" class="m-button" data-variant="primary">${icon(I.compose, 16)} New note</button>
          <button type="button" class="m-button">Import notes</button>
        </span>
      </div>
    </main>`,
);

// Pricing: the public site. A white header, a big bold title, a plain free column beside a lifted
// card with a red badge, checklists with square marks, prices in light large figures
const navbar = `<header class="m-navbar">
  <a class="m-navbar-brand" href="#" style="gap: var(--m-space-3)">${brandMark()} Folio</a>
  <nav class="m-navbar-nav" aria-label="Site" style="margin-inline-start: auto; justify-content: flex-end">
    <a class="m-navbar-link" href="#">What’s new</a>
    <a class="m-navbar-link" href="#" aria-current="page">Plans</a>
    <a class="m-navbar-link" href="#">Help</a>
    <a class="m-navbar-link" href="#">Download</a>
  </nav>
</header>`;
const feat = (state: 'yes' | 'part' | 'no', text: string) =>
  `<li class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap; padding-block: var(--m-space-3); border-block-end: ${hair}">
            <span style="display: inline-flex; padding-block-start: 3px; color: var(--m-color-${state === 'yes' ? 'accent-default' : 'border-strong'})" aria-label="${state === 'yes' ? 'Included' : state === 'part' ? 'Partly included' : 'Not included'}">${icon(state === 'yes' ? I.sqCheck : state === 'part' ? I.sqMinus : I.sq, 18, 1.5)}</span>
            <span${state === 'no' ? ` style="text-decoration: line-through; ${muted}"` : ''}>${text}</span>
          </li>`;
const price = (amount: string, per: string) =>
  `<span style="font-size: 2.25rem; font-weight: var(--m-font-weight-regular); line-height: 1; ${num}">${amount}<span style="font-size: var(--m-font-size-lg); ${muted}">/${per}</span></span>`;
const faq = (q: string, a: string, open = false) => `<details class="m-accordion-item"${open ? ' open' : ''}>
      <summary>${q}</summary>
      <div class="m-accordion-content">${a}</div>
    </details>`;
const pricing = `<div style="background: var(--m-color-bg-canvas); min-block-size: 100vh">
${navbar}
<main class="m-container" style="padding-block: var(--m-space-12) var(--m-space-16)">
  <div class="m-stack" data-gap="3" style="text-align: center; margin-block-end: var(--m-space-12)">
    <h1 style="${display('4xl')}">Plans</h1>
    <p style="font-size: var(--m-font-size-xl); ${muted}; margin: 0 auto; max-inline-size: 34rem">Write for free for as long as you like. Plus keeps every device in step and opens the extras.</p>
  </div>
  <div class="m-grid" data-gap="8" style="--m-layout-grid-min: 20rem; align-items: start">
    <section aria-labelledby="quill-free" style="padding: var(--m-space-10) var(--m-space-2) 0">
      <h2 id="quill-free" style="${display('3xl')}; margin-block-end: var(--m-space-6)">Free</h2>
      <ul style="list-style: none; margin: 0; padding: 0">
          ${feat('yes', 'Write in Markdown or plain text')}
          ${feat('yes', 'Tags, nested tags and links between notes')}
          ${feat('part', 'Version history for 7 days')}
          ${feat('part', 'Export to Markdown only')}
          ${feat('no', 'Encrypted sync between devices')}
      </ul>
      <p style="font-size: var(--m-font-size-md); ${muted}; margin: var(--m-space-8) 0 0; max-inline-size: 22rem">Free stays free. Plus pays for the time we spend on new features and on keeping your notes safe.</p>
    </section>
    <section aria-labelledby="quill-plus" style="padding: var(--m-space-10); border-radius: 2.5rem; background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-lg)">
      <h2 id="quill-plus" class="m-cluster" data-gap="3" style="${display('3xl')}; margin-block-end: var(--m-space-6)">Folio <span class="m-badge" style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg); border-radius: var(--m-radius-sm); font-weight: var(--m-font-weight-bold); font-size: var(--m-font-size-xl); block-size: auto; padding: 0 var(--m-space-2); letter-spacing: 0.02em">PLUS</span></h2>
      <ul style="list-style: none; margin: 0; padding: 0">
          ${feat('yes', 'Everything in Free')}
          ${feat('yes', 'Encrypted sync between devices')}
          ${feat('yes', 'Version history, kept for good')}
          ${feat('yes', 'Export to PDF, Word and web pages')}
          ${feat('yes', 'Publish a note as a private link')}
          ${feat('yes', 'Every look, light and dark')}
      </ul>
      <div style="border-block-start: ${hair}; margin-block-start: var(--m-space-8); padding-block-start: var(--m-space-6)" class="m-stack" data-gap="4">
        <div class="m-cluster" data-gap="3" data-align="center">${price('$32.99', 'year')}<span class="m-badge" data-tone="success" style="font-weight: var(--m-font-weight-semibold)">2 months free</span></div>
        <p style="margin: 0; ${muted}">or $3.49 a month, billed monthly</p>
        <button type="button" class="m-button" data-variant="primary" data-size="lg" style="align-self: start">Start the free trial</button>
        <p style="margin: 0; font-size: var(--m-font-size-sm); ${subtle}">Free for <strong>14 days</strong>. Cancel any time before then and pay nothing.</p>
      </div>
    </section>
  </div>
  <section aria-labelledby="quill-faq" class="m-container" data-size="md" style="padding: var(--m-space-16) 0 0">
    <h2 id="quill-faq" style="${display('2xl')}; margin-block-end: var(--m-space-4)">Questions</h2>
    <div class="m-accordion" style="border-inline: 0; border-radius: 0">
    ${faq('What happens to my notes if I stop paying?', 'Nothing is deleted. Your notes stay on each device and you keep editing them; only syncing and the Plus extras pause.', true)}
    ${faq('Can I share one plan with my family?', 'Yes. Plus works for everyone in your household who signs in with the same family group.')}
    ${faq('Is there a student price?', 'Students and teachers pay $14.99 a year. Write to us from a school address.')}
    ${faq('Where are my notes stored?', 'On your devices, and encrypted in your own cloud storage when sync is on. We never see them.')}
    </div>
  </section>
</main>
<footer style="border-block-start: ${hair}; padding: var(--m-space-8) 0; font-size: var(--m-font-size-sm); ${muted}">
  <div class="m-container m-cluster" data-justify="between"><span>© 2026 Folio Notes</span><span class="m-cluster" data-gap="4"><a href="#" style="color: inherit">Privacy</a><a href="#" style="color: inherit">Terms</a><a href="#" style="color: inherit">Press kit</a></span></div>
</footer>
</div>`;

// Errors: a field that says how to fix it, a callout that says nothing was saved, a toast for
// failures elsewhere, and whole pages for 404, 500 and no access
const fullPage = (code: string, paths: string, title: string, body: string, actions: string) => `<div class="m-card" data-variant="outline" style="text-align: center; padding: var(--m-space-10) var(--m-space-6)">
        <div class="m-stack" data-gap="3" data-align="center">
          <span style="${subtle}">${icon(paths, 44, 1.25)}</span>
          <code style="font-family: var(--m-font-family-mono); font-size: var(--m-font-size-xs); ${subtle}">${code}</code>
          <h3 style="${display('xl')}; margin: 0">${title}</h3>
          <p style="${muted}; margin: 0; font-size: var(--m-font-size-md)">${body}</p>
          <span class="m-cluster" data-gap="2" data-justify="center">${actions}</span>
        </div>
      </div>`;
const errors = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  <div class="m-container" data-size="md" style="padding-block: var(--m-space-10) var(--m-space-16)">
    <div class="m-stack" data-gap="10">
      <div class="m-stack" data-gap="2">
        <h1 style="${display('2xl')}">When something goes wrong</h1>
        <p style="${muted}; margin: 0">Say what happened, whether anything changed, and what to do next.</p>
      </div>

      <section aria-labelledby="quill-unlock" class="m-stack" data-gap="4" data-align="center" style="padding: var(--m-space-10) var(--m-space-6); border-radius: var(--m-radius-lg); background: var(--m-color-bg-sunken); text-align: center">
        <span style="${subtle}">${icon(I.lock, 40, 1.25)}</span>
        <h2 id="quill-unlock" style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-bold); margin: 0">This note is locked</h2>
        <div class="m-field" style="inline-size: min(20rem, 100%); text-align: start">
          <label class="m-sr-only" for="quill-pass">Password</label>
          <div class="m-cluster" data-gap="1" style="flex-wrap: nowrap">
            <input class="m-input" id="quill-pass" type="password" value="lanterns" aria-invalid="true" aria-describedby="quill-pass-error" style="border-radius: var(--m-radius-full)">
            <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Unlock" style="${muted}">${icon(I.enter, 18)}</button>
          </div>
          <p class="m-field-error" id="quill-pass-error">That password didn’t open this note. Try again, or unlock with your device login.</p>
        </div>
      </section>

      <section aria-labelledby="quill-export" class="m-stack" data-gap="5">
        <h2 id="quill-export" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold)">Export 12 notes</h2>
        <div class="m-alert" data-tone="danger" role="alert" style="border-inline-start-color: var(--m-color-danger-solid)">
          <span class="m-alert-icon" aria-hidden="true" style="color: var(--m-color-danger-solid)">${icon(I.alert, 17)}</span>
          <div class="m-alert-content">
            <p class="m-alert-title" style="color: var(--m-color-fg-default)">2 things need fixing</p>
            <p class="m-alert-body" style="color: var(--m-color-fg-default)">Nothing was exported. Fix the fields below and try again.</p>
          </div>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="quill-file">File name</label>
          <input class="m-input" id="quill-file" type="text" value="garden/notes:spring" aria-invalid="true" aria-describedby="quill-file-error">
          <p class="m-field-error" id="quill-file-error">Use letters, numbers and dashes only. Slashes and colons can’t be in a file name.</p>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="quill-format">Format <span aria-hidden="true" style="color: var(--m-color-danger-fg)">*</span></label>
          <select class="m-select" id="quill-format" aria-invalid="true" aria-describedby="quill-format-error"><option selected>Choose a format</option><option>Markdown</option><option>PDF</option></select>
          <p class="m-field-error" id="quill-format-error">Choose a format for the export.</p>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="quill-folder">Save to</label>
          <input class="m-input" id="quill-folder" type="text" value="Documents / Folio exports">
          <p class="m-field-hint">A new folder is made for each export.</p>
        </div>
        <div class="m-cluster" data-gap="2" data-justify="end"><button type="button" class="m-button" data-variant="ghost">Cancel</button><button type="button" class="m-button" data-variant="primary" aria-busy="true">Exporting</button></div>
      </section>

      <section aria-labelledby="quill-toasts" class="m-stack" data-gap="3">
        <h2 id="quill-toasts" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold)">Somewhere else</h2>
        <div class="m-toast-region" data-static aria-live="polite">
          <div class="m-toast" data-tone="danger" role="alert">
            <div class="m-toast-content">
              <p class="m-toast-title" style="display: flex; align-items: center; gap: var(--m-space-2)"><span aria-hidden="true" style="display: inline-flex; color: var(--m-color-danger-solid)">${icon(I.cloudOff, 17)}</span>3 notes didn’t sync</p>
              <p class="m-toast-body">They’re safe on this device. We’ll try again when you’re back online.</p>
              <div class="m-toast-actions"><button type="button" class="m-button" data-size="sm">${icon(I.refresh, 14)} Retry now</button></div>
            </div>
            <button type="button" class="m-toast-close" aria-label="Dismiss">${icon(I.x, 14, 2)}</button>
          </div>
        </div>
      </section>

      <section aria-labelledby="quill-pages" class="m-stack" data-gap="4">
        <h2 id="quill-pages" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold)">Whole pages</h2>
        <div class="m-grid" data-gap="4" style="--m-layout-grid-min: 11rem">
          ${fullPage('404', I.searchX, 'This note isn’t here', 'It may have moved to the bin, or the link is old.', '<button type="button" class="m-button" data-variant="primary">Back to notes</button>')}
          ${fullPage('500', I.warn, 'Something broke on our side', 'Nothing in your notes changed. Try again in a moment.', '<button type="button" class="m-button" data-variant="primary">Try again</button><button type="button" class="m-button" data-variant="ghost">Status</button>')}
          ${fullPage('403', I.lock, 'This note is private', 'Ask its owner to share it with you.', '<button type="button" class="m-button" data-variant="primary">Ask for access</button>')}
        </div>
      </section>
    </div>
  </div>
</div>`;

export const quillRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Home',
    description:
      'The three columns: a graphite sidebar of tags, a note list with the selected note on a pale fill and a red edge, and the editor with tag capsules, a callout, to-dos, a framed table and the floating format bar.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'A search across notes with the matches marked, the open note, and its info panel: a segmented control, figure tiles, dates and the notes that mention it.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'A centred welcome with a thin progress bar, one big bold line, three look cards with live previews, a quiet settings panel and a red Continue.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A desktop preferences window: a toolbar of panes with icons over right-aligned labels, selects, checkboxes, radios, shortcuts and a tip callout.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'An empty tag: the list says how notes get here, the editor shows a large thin icon, one sentence, the shortcut and a red New note.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The public site: a white header, a big bold title, a plain free column beside a lifted card with a red badge, square-mark checklists, light large prices and the questions.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'A locked note with a wrong password, a danger callout above a form that says nothing was exported, a graphite toast for sync, and whole pages for 404, 500 and no access.',
    html: errors,
  },
];
