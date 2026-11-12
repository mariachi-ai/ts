import type { ArchetypeRecipe } from '../types';

/*
 * Heather's seven layout recipes: framework-free HTML using only @mariachi/design classes and
 * tokens (no colour literals), with sample data from a small studio's video-message workspace. They
 * follow the language's real screen patterns: a white sidebar whose current row is pale blue, a wide
 * rounded search field, a grid of video cards with a hairline and 16px corners, a viewer page with
 * a side panel of tabs and a highlighted transcript row, 12px buttons, pale-blue time chips, and
 * settings as titled sections with a hairline between them. Thumbnails, the video and avatars are
 * content: they are drawn as token shapes, never images.
 */

// Lucide icons, outlined, 2px stroke (the reference's 1.5px icons, drawn on a 16px grid)
const icon = (paths: string, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  video:
    '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  draft:
    '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1"/>',
  hash: '<path d="M4 9h16"/><path d="M4 15h16"/><path d="M10 3 8 21"/><path d="M16 3l-2 18"/>',
  folder:
    '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  comment: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  smile:
    '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
  smilePlus:
    '<path d="M22 11v1a10 10 0 1 1-9-10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/><path d="M16 5h6"/><path d="M19 2v6"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  userPlus:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  copy: '<rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  sparkles:
    '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/>',
  collapse: '<path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/>',
  panel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
  camera:
    '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
  trash:
    '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  building:
    '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  wand: '<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/>',
  headset:
    '<path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  play: '<path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  refresh: '<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
};

// Styles that recur, as tokens
const pageTitle =
  'font-size: var(--m-font-size-4xl); font-weight: var(--m-font-weight-bold); line-height: var(--m-font-leading-tight)';
const h2 = 'font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold); line-height: var(--m-font-leading-tight)';
const h3 = 'font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-bold)';
const small = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-subtle)';
const meta = 'font-size: var(--m-font-size-md); color: var(--m-color-fg-subtle)';
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)';
// A pale-blue time chip: transcript stamps, comment stamps, chapter marks
const chip = (t: string) =>
  `<span style="display: inline-flex; align-items: center; padding: 0 var(--m-space-1); border-radius: var(--m-radius-sm); background: var(--m-color-accent-subtle); color: var(--m-color-accent-text); font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-medium); font-variant-numeric: tabular-nums">${t}</span>`;

// The product mark: a plain wordmark with an unrelated outline glyph in the brand colour, no tile
const mark = (size = 2) =>
  `<span style="display: inline-flex; color: var(--m-color-brand-default)">${icon(I.megaphone, size * 11)}</span>`;

const nav = (items: [keyof typeof I, string, string?][], current: string) =>
  items
    .map(
      ([ic, l, extra]) =>
        `          <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${icon(I[ic], 20)} ${l}${extra ?? ''}</a></li>`,
    )
    .join('\n');

// The app shell: a white sidebar (mark, workspace switcher, nav, channels, the record tab) and a
// top bar with the wide rounded search field
const shell = (current: string, main: string) => `<div class="m-split" style="--m-layout-split-side: 15rem; --m-layout-split-gap: 0; min-block-size: 100vh">
  <nav class="m-sidebar" aria-label="Main" style="font-weight: var(--m-font-weight-semibold)">
    <div class="m-cluster" data-justify="between" style="padding-inline: var(--m-space-2)">
      <span class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-medium)">${mark(2)} Murmur</span>
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Collapse the sidebar">${icon(I.panel, 18)}</button>
    </div>
    <button type="button" class="m-card" style="display: flex; flex-direction: row; align-items: center; gap: var(--m-space-3); padding: var(--m-space-2) var(--m-space-3); border-radius: var(--m-radius-control); text-align: start; font: inherit; color: inherit; cursor: pointer">
      <span class="m-avatar" data-size="sm" style="border-radius: var(--m-radius-sm)">PS</span>
      <span class="m-stack" data-gap="0" style="flex: 1; min-inline-size: 0"><span style="font-weight: var(--m-font-weight-medium)">Pinecrest Studio</span><span style="${small}">42 members</span></span>
      ${icon(I.down, 16)}
    </button>
    <div class="m-sidebar-section">
      <ul>
${nav(
  [
    ['home', 'Home'],
    ['video', 'My videos'],
    ['users', 'Shared with me', ' <span class="m-sidebar-count">3</span>'],
    ['bookmark', 'Bookmarked'],
    ['draft', 'Drafts'],
    ['chart', 'Insights'],
    ['gear', 'Settings'],
  ],
  current,
)}
      </ul>
    </div>
    <div class="m-sidebar-section" style="${hair}; padding-block-start: var(--m-space-4)">
      <div class="m-cluster" data-justify="between"><h2 class="m-sidebar-heading">Channels</h2><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="New channel">${icon(I.plus, 16)}</button></div>
      <ul>
${nav(
  [
    ['hash', 'Design reviews'],
    ['hash', 'Customer calls'],
    ['hash', 'Friday demos'],
  ],
  current,
)}
      </ul>
    </div>
    <div style="margin-block-start: auto; padding-block-start: var(--m-space-6)">
      <button type="button" class="m-button" data-variant="primary" style="inline-size: 100%">${icon(I.video, 18)} Start recording</button>
    </div>
  </nav>
  <div class="m-stack" data-gap="0">
    <header class="m-cluster" data-justify="between" data-gap="4" style="padding: var(--m-space-3) clamp(1rem, 3vw, 2.5rem); flex-wrap: nowrap">
      <label style="display: flex; align-items: center; flex: 1; max-inline-size: 40rem; position: relative">
        <span class="m-sr-only">Search</span>
        <span style="position: absolute; inset-inline-start: var(--m-space-3); display: inline-flex; color: var(--m-color-fg-subtle)">${icon(I.search, 18)}</span>
        <input class="m-input" data-size="lg" type="search" placeholder="Search videos, people, folders and channels" style="inline-size: 100%; border-radius: 12px; padding-inline-start: calc(var(--m-space-3) * 2 + 18px)">
      </label>
      <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap">
        <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Notifications">${icon(I.bell, 20)}</button>
        <span class="m-avatar" aria-label="Ines Calder">IC</span>
      </div>
    </header>
    <main class="m-container" style="padding-block: var(--m-space-6) var(--m-space-12)">
${main}
    </main>
  </div>
</div>`;

// A video thumbnail drawn with tokens: a screen (a top bar and blocks) on a tint, a camera bubble
// and the duration chip. Content, never an image
const tints = [
  'var(--m-color-info-bg)',
  'var(--m-color-success-bg)',
  'var(--m-color-warning-bg)',
  'var(--m-color-bg-sunken)',
  'var(--m-color-danger-bg)',
  'var(--m-color-accent-subtle)',
];
const thumb = (n: number, duration: string, initials: string, radius = 'var(--m-radius-lg) var(--m-radius-lg) 0 0') =>
  `<div style="position: relative; aspect-ratio: 16 / 10; overflow: hidden; border-radius: ${radius}; background: ${tints[n % tints.length]}" role="img" aria-label="Video preview">
            <div style="position: absolute; inset: 12% 10% 0 10%; border-radius: var(--m-radius-md) var(--m-radius-md) 0 0; background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-sm)">
              <div style="block-size: 12%; border-block-end: var(--m-border-width-thin) solid var(--m-color-border-muted)"></div>
              <div class="m-stack" data-gap="2" style="padding: 8%">
                <span style="display: block; block-size: 0.5rem; inline-size: ${45 + ((n * 13) % 30)}%; border-radius: var(--m-radius-sm); background: var(--m-color-border-default)"></span>
                <span style="display: block; block-size: 0.375rem; inline-size: 80%; border-radius: var(--m-radius-sm); background: var(--m-color-border-muted)"></span>
                <span style="display: block; block-size: 0.375rem; inline-size: 64%; border-radius: var(--m-radius-sm); background: var(--m-color-border-muted)"></span>
                <span style="display: block; block-size: 1.75rem; inline-size: 50%; border-radius: var(--m-radius-sm); background: var(--m-color-accent-subtle)"></span>
              </div>
            </div>
            <span class="m-avatar" style="position: absolute; inset-inline-start: 6%; inset-block-end: 8%; inline-size: 22%; block-size: auto; aspect-ratio: 1; background: var(--m-color-brand-subtle); box-shadow: 0 0 0 3px var(--m-color-bg-surface)" aria-hidden="true">${initials}</span>
            <span style="position: absolute; inset-inline-end: var(--m-space-2); inset-block-end: var(--m-space-2); padding: 0.125rem var(--m-space-2); border-radius: var(--m-radius-md); background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse); font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-semibold); font-variant-numeric: tabular-nums">${duration}</span>
          </div>`;

const stat = (ic: keyof typeof I, n: string, label: string) =>
  `<span class="m-cluster" data-gap="1" aria-label="${n} ${label}">${icon(I[ic], 16)} ${n}</span>`;

const videoCard = (
  n: number,
  title: string,
  who: string,
  initials: string,
  when: string,
  access: string,
  duration: string,
  views: string,
  comments: string,
  reactions: string,
) => `        <article class="m-card" data-interactive style="overflow: hidden; padding: 0; gap: 0">
          ${thumb(n, duration, initials, '0')}
          <div class="m-card-body m-stack" data-gap="2" style="padding: var(--m-space-4)">
            <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap">
              <span class="m-avatar" data-size="sm">${initials}</span>
              <span class="m-stack" data-gap="0" style="min-inline-size: 0"><span style="${meta}">${who} · ${when}</span><span class="m-cluster" data-gap="1" style="${meta}">${access} ${icon(I.down, 14)}</span></span>
            </div>
            <h3 class="m-card-title" style="text-wrap: pretty">${title}</h3>
            <div class="m-cluster" data-gap="4" style="${meta}; font-variant-numeric: tabular-nums">${stat('eye', views, 'views')}${stat('comment', comments, 'comments')}${stat('smile', reactions, 'reactions')}</div>
          </div>
        </article>`;

const folderCard = (name: string, count: string) =>
  `        <a class="m-card" data-interactive href="#" style="display: flex; flex-direction: row; align-items: center; gap: var(--m-space-3); padding: var(--m-space-3) var(--m-space-4); text-align: start; color: inherit; text-decoration: none; border-radius: 12px"><span style="color: var(--m-color-fg-muted); display: inline-flex">${icon(I.folder, 20)}</span><span class="m-stack" data-gap="0"><span style="font-weight: var(--m-font-weight-medium)">${name}</span><span style="${small}">${count}</span></span></a>`;

const dashboard = shell(
  'My videos',
  `      <div class="m-stack" data-gap="6">
        <div class="m-cluster" data-justify="between" data-align="end">
          <div class="m-stack" data-gap="1">
            <span style="${meta}">Library</span>
            <h1 style="${pageTitle}">My videos</h1>
          </div>
          <div class="m-cluster" data-gap="2">
            <button type="button" class="m-button">${icon(I.folder, 16)} New folder</button>
            <button type="button" class="m-button" data-variant="primary">New recording ${icon(I.down, 16)}</button>
          </div>
        </div>
        <div class="m-tabs">
          <div class="m-cluster" data-justify="between" style="border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
            <div class="m-tab-list" role="tablist" aria-label="Kind" style="border: 0">
              <button type="button" class="m-tab" role="tab" aria-selected="true">Videos</button>
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Clips</button>
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Imported</button>
              <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Archived</button>
            </div>
            <span style="${meta}">18 videos</span>
          </div>
        </div>
        <section class="m-stack" data-gap="3" aria-labelledby="ht-folders">
          <h2 id="ht-folders" style="${h3}">Folders</h2>
          <div class="m-grid" style="--m-layout-grid-min: 14rem; --m-layout-grid-gap: var(--m-space-3)">
${folderCard('Product walkthroughs', '7 videos')}
${folderCard('Hiring', '4 videos')}
${folderCard('Client handoffs', '11 videos')}
          </div>
        </section>
        <section class="m-stack" data-gap="3" aria-labelledby="ht-videos">
          <div class="m-cluster" data-justify="between">
            <h2 id="ht-videos" style="${h2}">Videos</h2>
            <div class="m-cluster" data-gap="2">
              <select class="m-select" data-size="sm" aria-label="Sort by"><option>Date recorded</option><option>Title</option><option>Most viewed</option></select>
              <select class="m-select" data-size="sm" aria-label="Order"><option>Newest first</option><option>Oldest first</option></select>
            </div>
          </div>
          <div class="m-grid" style="--m-layout-grid-min: 17rem; --m-layout-grid-gap: var(--m-space-4)">
${videoCard(0, 'Onboarding flow: first-week walkthrough', 'Ines Calder', 'IC', '2 days ago', 'Pinecrest Studio', '6:12', '38', '4', '9')}
${videoCard(1, 'Bug repro: coupon field clears on back', 'Theo Marsh', 'TM', '3 days ago', 'Not shared', '1:47', '5', '2', '1')}
${videoCard(2, 'Friday demo: new export panel', 'Priya Nandakumar', 'PN', 'Last week', 'Friday demos', '11:30', '64', '12', '23')}
${videoCard(3, 'How we triage support tickets', 'Ravi Okafor', 'RO', 'Oct 28', 'Pinecrest Studio', '8:05', '112', '6', '17')}
${videoCard(4, 'Brand refresh: type and colour notes', 'June Albright', 'JA', 'Oct 24', 'Design reviews', '4:58', '27', '9', '6')}
${videoCard(5, 'Welcome to the team, Mateo', 'Ines Calder', 'IC', 'Oct 20', 'Anyone with the link', '2:21', '19', '3', '14')}
          </div>
        </section>
      </div>`,
);

// The viewer page: a title band, the video on a soft well, reactions and the summary; a side panel
// of tabs with the transcript, the current line highlighted
const line = (t: string, text: string, current = false) =>
  `            <li style="display: grid; grid-template-columns: 2.5rem 1fr; gap: var(--m-space-2); padding: var(--m-space-2); border-radius: var(--m-radius-md); border: var(--m-border-width-thin) solid ${current ? 'var(--m-color-accent-default)' : 'transparent'}${current ? '; background: var(--m-color-accent-subtle)' : ''}"${current ? ' aria-current="true"' : ''}><a href="#" style="font-size: var(--m-font-size-sm); color: var(--m-color-accent-text); text-decoration: none; font-variant-numeric: tabular-nums; padding-block-start: 0.125rem">${t}</a><span>${text}</span></li>`;

const comment = (initials: string, who: string, t: string, when: string, text: string) =>
  `          <li class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap">
            <span class="m-avatar">${initials}</span>
            <div class="m-stack" data-gap="1">
              <div class="m-cluster" data-gap="2"><span style="font-weight: var(--m-font-weight-bold)">${who}</span>${chip(t)}<span style="${small}">${when}</span></div>
              <p>${text}</p>
              <div class="m-cluster" data-gap="3" style="${small}"><a href="#" style="color: inherit; text-decoration: none">Reply</a><span>·</span><a href="#" style="color: inherit; text-decoration: none">React</a></div>
            </div>
          </li>`;

const upNext = (n: number, title: string, who: string, initials: string, duration: string, views: string) =>
  `          <li><a href="#" class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding: var(--m-space-2); border-radius: var(--m-radius-md); color: inherit; text-decoration: none"><span style="inline-size: 8rem; flex: none">${thumb(n, duration, initials, 'var(--m-radius-md)')}</span><span class="m-stack" data-gap="1"><span style="font-weight: var(--m-font-weight-medium)">${title}</span><span style="${meta}">${who} · ${views} views</span></span></a></li>`;

const listDetail = `<div class="m-stack" data-gap="0" style="min-block-size: 100vh; background: var(--m-color-bg-sunken)">
  <header class="m-cluster" data-justify="between" style="padding: var(--m-space-2) var(--m-space-4); background: var(--m-color-bg-surface); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
    <span class="m-cluster" data-gap="3">
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Open the sidebar">${icon(I.panel, 18)}</button>
      <span class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-medium)">${mark(2)} Murmur</span>
    </span>
    <span class="m-cluster" data-gap="2">
      <span class="m-cluster" data-gap="0" style="flex-wrap: nowrap">
        <button type="button" class="m-button" data-variant="primary" style="border-start-end-radius: 0; border-end-end-radius: 0">${icon(I.userPlus, 16)} Share</button>
        <button type="button" class="m-button" data-variant="primary" data-icon-only aria-label="Copy link" style="border-start-start-radius: 0; border-end-start-radius: 0; box-shadow: inset 1px 0 0 var(--m-color-accent-hover)">${icon(I.link, 16)}</button>
      </span>
      <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="More">${icon(I.more, 20)}</button>
      <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Search">${icon(I.search, 20)}</button>
      <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Notifications">${icon(I.bell, 20)}</button>
      <span class="m-avatar" aria-label="Theo Marsh">TM</span>
    </span>
  </header>
  <div class="m-split" style="--m-layout-split-side: 26rem; --m-layout-split-gap: 0; flex-direction: row-reverse; flex-wrap: wrap-reverse; flex: 1">
    <aside class="m-stack" data-gap="0" aria-label="Video panel" style="background: var(--m-color-bg-surface); border-inline-start: var(--m-border-width-thin) solid var(--m-color-border-default)">
      <div class="m-tabs" style="padding: var(--m-space-2) var(--m-space-6) 0">
        <div class="m-cluster" data-justify="between" style="border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
          <div class="m-tab-list" role="tablist" aria-label="Panel" style="border: 0">
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Comments</button>
            <button type="button" class="m-tab" role="tab" aria-selected="true">Transcript</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Details</button>
          </div>
          <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Hide the panel">${icon(I.collapse, 16)}</button>
        </div>
      </div>
      <div class="m-stack" data-gap="3" style="padding: var(--m-space-4) var(--m-space-4) var(--m-space-8)">
        <div class="m-cluster" data-gap="1">
          <button type="button" class="m-button" data-variant="ghost" data-size="sm">${icon(I.copy, 16)} Copy</button>
          <button type="button" class="m-button" data-variant="ghost" data-size="sm">${icon(I.search, 16)} Find</button>
          <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="More transcript actions">${icon(I.more, 16)}</button>
        </div>
        <ol class="m-stack" data-gap="1" style="padding: 0; list-style: none">
${line('0:00', 'Hi all, this is the first-week flow as it stands today, start to finish, so we can agree on what to cut.')}
${line('0:21', 'You land on the welcome screen. We ask for a name and a team, then straight into the checklist.')}
${line('0:48', 'Here is the part I want feedback on: the checklist has nine steps, and most people stop after the third one.', true)}
${line('1:15', 'My suggestion is to fold steps four to six into one card, and move the invite step to the end.')}
${line('1:52', 'The empty project screen also needs a clearer first action. Right now there are three buttons of equal weight.')}
${line('2:30', 'I left comments on each frame. Reply in the thread and I will collect them on Thursday.')}
        </ol>
      </div>
    </aside>
    <main class="m-stack" data-gap="0">
      <div class="m-cluster" data-justify="between" style="padding: var(--m-space-4) var(--m-space-6); background: var(--m-color-bg-surface); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
        <div class="m-stack" data-gap="0">
          <h1 style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); line-height: var(--m-font-leading-tight)">Onboarding flow: first-week walkthrough</h1>
          <span style="${meta}">Ines Calder · Nov 10, 2026</span>
        </div>
        <div class="m-cluster" data-gap="2">
          <span class="m-cluster" data-gap="2" style="padding: var(--m-space-1) var(--m-space-3) var(--m-space-1) var(--m-space-1); border: var(--m-border-width-thin) solid var(--m-color-border-default); border-radius: var(--m-radius-md)">
            <span class="m-avatar-group"><span class="m-avatar" data-size="sm">RO</span><span class="m-avatar" data-size="sm">JA</span><span class="m-avatar" data-size="sm">PN</span></span>
            <span style="font-weight: var(--m-font-weight-bold); font-variant-numeric: tabular-nums">38 views</span>
          </span>
          <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Copy link">${icon(I.link, 16)}</button>
          <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Download">${icon(I.download, 16)}</button>
        </div>
      </div>
      <div class="m-stack" data-gap="6" style="padding: var(--m-space-6)">
        <div style="position: relative; overflow: hidden; border-radius: var(--m-radius-lg); border: var(--m-border-width-thin) solid var(--m-color-border-default); background: var(--m-color-info-bg)" role="img" aria-label="Video, paused at 0:48 of 6:12">
          <div style="aspect-ratio: 16 / 9; position: relative">
            <div style="position: absolute; inset: 8% 8% 0; border-radius: var(--m-radius-md) var(--m-radius-md) 0 0; background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-sm); display: grid; grid-template-columns: 18% 1fr">
              <div class="m-stack" data-gap="2" style="padding: 4%; border-inline-end: var(--m-border-width-thin) solid var(--m-color-border-muted)">
                <span style="display: block; block-size: 0.5rem; border-radius: var(--m-radius-sm); background: var(--m-color-border-default)"></span>
                <span style="display: block; block-size: 0.5rem; border-radius: var(--m-radius-sm); background: var(--m-color-accent-subtle)"></span>
                <span style="display: block; block-size: 0.5rem; border-radius: var(--m-radius-sm); background: var(--m-color-border-muted)"></span>
                <span style="display: block; block-size: 0.5rem; border-radius: var(--m-radius-sm); background: var(--m-color-border-muted)"></span>
              </div>
              <div class="m-stack" data-gap="3" style="padding: 4%">
                <span style="display: block; block-size: 0.875rem; inline-size: 40%; border-radius: var(--m-radius-sm); background: var(--m-color-border-default)"></span>
                <div class="m-grid" style="--m-layout-grid-min: 6rem; --m-layout-grid-gap: var(--m-space-3)">
                  <span style="display: block; aspect-ratio: 4 / 3; border-radius: var(--m-radius-md); background: var(--m-color-success-bg)"></span>
                  <span style="display: block; aspect-ratio: 4 / 3; border-radius: var(--m-radius-md); background: var(--m-color-warning-bg)"></span>
                  <span style="display: block; aspect-ratio: 4 / 3; border-radius: var(--m-radius-md); background: var(--m-color-accent-subtle)"></span>
                </div>
              </div>
            </div>
            <span class="m-avatar" style="position: absolute; inset-inline-start: 3%; inset-block-end: 6%; inline-size: 13%; block-size: auto; aspect-ratio: 1; font-size: var(--m-font-size-xl); background: var(--m-color-brand-subtle); box-shadow: 0 0 0 4px var(--m-color-bg-surface)" aria-hidden="true">IC</span>
            <span style="position: absolute; inset: 50% auto auto 50%; translate: -50% -50%; display: grid; place-items: center; inline-size: 5rem; block-size: 5rem; border-radius: var(--m-radius-full); background: var(--m-color-accent-default); color: var(--m-color-accent-fg); box-shadow: 0 0 0 8px var(--m-color-accent-subtle)"><svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${I.play}</svg></span>
          </div>
          <div style="block-size: 4px; background: var(--m-color-border-default)"><div style="block-size: 100%; inline-size: 13%; background: var(--m-color-accent-default)"></div></div>
        </div>
        <div class="m-cluster" data-gap="3" data-justify="center">
          <div class="m-card" style="display: flex; flex-direction: row; gap: var(--m-space-1); padding: var(--m-space-1) var(--m-space-2); box-shadow: var(--m-shadow-md); font-size: var(--m-font-size-2xl)" role="group" aria-label="React">
            <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Thumbs up" style="font-size: var(--m-font-size-xl)">👍</button>
            <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Party" style="font-size: var(--m-font-size-xl)">🎉</button>
            <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Heart" style="font-size: var(--m-font-size-xl)">❤️</button>
            <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Eyes" style="font-size: var(--m-font-size-xl)">👀</button>
            <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Laughing" style="font-size: var(--m-font-size-xl)">😄</button>
            <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="More reactions">${icon(I.smilePlus, 24)}</button>
          </div>
          <button type="button" class="m-button" data-size="lg" style="box-shadow: var(--m-shadow-md)">${icon(I.comment, 18)} Comment</button>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 20rem; --m-layout-grid-gap: var(--m-space-6)">
          <section class="m-stack" data-gap="3" aria-labelledby="ht-summary">
            <div class="m-stack" data-gap="0"><h2 id="ht-summary" style="${h3}">Summary</h2><span class="m-cluster" data-gap="1" style="${small}">${icon(I.sparkles, 14)} Written by the assistant</span></div>
            <p>A tour of the first-week flow with one proposal: shorten the nine-step checklist to five and move the invite step to the end, because most new people stop after step three.</p>
            <ul class="m-stack" data-gap="2" style="padding: 0; list-style: none">
              <li class="m-cluster" data-gap="2">${chip('0:21')} The welcome screen</li>
              <li class="m-cluster" data-gap="2">${chip('0:48')} Where people drop off</li>
              <li class="m-cluster" data-gap="2">${chip('1:52')} The empty project screen</li>
            </ul>
          </section>
          <section class="m-stack" data-gap="3" aria-labelledby="ht-next">
            <h2 id="ht-next" style="${h3}">Up next in Product walkthroughs</h2>
            <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
${upNext(2, 'Friday demo: new export panel', 'Priya Nandakumar', 'PN', '11:30', '64')}
${upNext(3, 'How we triage support tickets', 'Ravi Okafor', 'RO', '8:05', '112')}
            </ul>
          </section>
        </div>
        <section class="m-stack" data-gap="4" aria-labelledby="ht-comments" style="${hair}; padding-block-start: var(--m-space-6)">
          <h2 id="ht-comments" style="${h3}">4 comments</h2>
          <ul class="m-stack" data-gap="5" style="padding: 0; list-style: none">
${comment('RO', 'Ravi Okafor', '0:48', '1 hour ago', 'Agreed on cutting the checklist. Could step two be skipped for people invited by a teammate?')}
${comment('JA', 'June Albright', '1:52', '40 minutes ago', 'I can mock up the empty project screen with one main action. Thursday works.')}
          </ul>
          <form class="m-composer">
            <label class="m-sr-only" for="ht-reply">Comment</label>
            <textarea class="m-composer-input" id="ht-reply" rows="1" placeholder="Add a comment at 0:48"></textarea>
            <div class="m-composer-actions">
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Record a video reply">${icon(I.video, 16)}</button>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Add a reaction">${icon(I.smile, 16)}</button>
              <span class="m-composer-spacer"></span>
              <button type="submit" class="m-button" data-variant="primary" data-size="sm">Post</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  </div>
</div>`;

// Onboarding: one centred column with a step bar, then the recorder set up in its own panel
const onboarding = `<main class="m-container" data-size="sm" style="padding-block: var(--m-space-10) var(--m-space-16)">
  <div class="m-stack" data-gap="6">
    <div class="m-cluster" data-justify="between">
      <span class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-medium)">${mark(2)} Murmur</span>
      <span style="${meta}">Step 3 of 3</span>
    </div>
    <progress class="m-progress" data-size="sm" value="100" max="100" aria-label="Step 3 of 3">100%</progress>
    <div class="m-stack" data-gap="2">
      <h1 style="${pageTitle}">Record your first video</h1>
      <p class="m-muted" style="font-size: var(--m-font-size-lg)">Pick what to show. You can change all of this before every recording.</p>
    </div>
    <fieldset class="m-stack" data-gap="3" style="border: 0; padding: 0; margin: 0">
      <legend style="font-weight: var(--m-font-weight-medium); margin-block-end: var(--m-space-3)">What will you record first?</legend>
      <div class="m-grid" style="--m-layout-grid-min: 12rem; --m-layout-grid-gap: var(--m-space-3)">
        <label class="m-card" style="display: flex; flex-direction: row; gap: var(--m-space-3); align-items: flex-start; padding: var(--m-space-4); border-radius: var(--m-radius-md); cursor: pointer; border-color: var(--m-color-accent-default); background: var(--m-color-accent-subtle); box-shadow: inset 0 0 0 1px var(--m-color-accent-default)"><input class="m-radio" type="radio" name="ht-first" checked><span class="m-stack" data-gap="1"><span style="font-weight: var(--m-font-weight-medium)">A walkthrough or demo</span><span style="${small}">Show a flow, a design or a release</span></span></label>
        <label class="m-card" style="display: flex; flex-direction: row; gap: var(--m-space-3); align-items: flex-start; padding: var(--m-space-4); border-radius: var(--m-radius-md); cursor: pointer"><input class="m-radio" type="radio" name="ht-first"><span class="m-stack" data-gap="1"><span style="font-weight: var(--m-font-weight-medium)">Feedback on work</span><span style="${small}">Talk through a draft, frame by frame</span></span></label>
        <label class="m-card" style="display: flex; flex-direction: row; gap: var(--m-space-3); align-items: flex-start; padding: var(--m-space-4); border-radius: var(--m-radius-md); cursor: pointer"><input class="m-radio" type="radio" name="ht-first"><span class="m-stack" data-gap="1"><span style="font-weight: var(--m-font-weight-medium)">A team update</span><span style="${small}">Replace a meeting with five minutes</span></span></label>
        <label class="m-card" style="display: flex; flex-direction: row; gap: var(--m-space-3); align-items: flex-start; padding: var(--m-space-4); border-radius: var(--m-radius-md); cursor: pointer"><input class="m-radio" type="radio" name="ht-first"><span class="m-stack" data-gap="1"><span style="font-weight: var(--m-font-weight-medium)">An answer for a customer</span><span style="${small}">Show the fix instead of writing it</span></span></label>
      </div>
    </fieldset>
    <section class="m-card" aria-labelledby="ht-recorder" style="box-shadow: var(--m-shadow-lg); border-color: transparent">
      <div class="m-card-body m-stack" data-gap="4">
        <h2 id="ht-recorder" style="${h3}">Recorder</h2>
        <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="What to record">
          <button type="button" class="m-tab" role="tab" aria-selected="true">${icon(I.monitor, 16)} Screen and camera</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">${icon(I.monitor, 16)} Screen</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">${icon(I.camera, 16)} Camera</button>
        </div></div>
        <div class="m-field">
          <label class="m-field-label" for="ht-cam">Camera</label>
          <select class="m-select" id="ht-cam"><option>Built-in camera</option><option>Desk camera</option></select>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="ht-mic">Microphone</label>
          <select class="m-select" id="ht-mic"><option>Headset microphone</option><option>Built-in microphone</option></select>
          <meter class="m-meter" min="0" max="100" low="70" high="90" optimum="40" value="46" aria-label="Microphone level">46</meter>
        </div>
        <label class="m-cluster" data-justify="between"><span class="m-stack" data-gap="0"><span>Show my camera in a bubble</span><span style="${small}">Viewers see you in the corner</span></span><input class="m-switch" type="checkbox" role="switch" checked></label>
        <button type="button" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%"><span style="inline-size: 0.75rem; block-size: 0.75rem; border-radius: var(--m-radius-full); background: var(--m-color-danger-solid); box-shadow: 0 0 0 2px var(--m-color-accent-fg)"></span> Start recording</button>
        <p style="${small}; text-align: center">Recordings up to 25 minutes on your plan. Press <kbd class="m-kbd">⌥</kbd> <kbd class="m-kbd">⇧</kbd> <kbd class="m-kbd">R</kbd> to start from anywhere.</p>
      </div>
    </section>
    <div class="m-cluster" data-justify="between">
      <button type="button" class="m-button" data-variant="ghost">${icon(I.back, 16)} Back</button>
      <button type="button" class="m-button" data-variant="ghost">Skip for now</button>
    </div>
  </div>
</main>`;

// Settings: titled sections with a hairline between them, then the members table
const sectionHead = (id: string, title: string, desc: string) =>
  `<div class="m-stack" data-gap="1"><h2 id="${id}" style="${h3}">${title}</h2><p style="${meta}">${desc}</p></div>`;

const member = (initials: string, name: string, role: string, tone: string, added: string, email: string) =>
  `            <tr>
              <td><input class="m-checkbox" type="checkbox" aria-label="Select ${name}"></td>
              <td><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span class="m-avatar" data-size="sm">${initials}</span>${name}</span></td>
              <td><span class="m-badge"${tone}>${role}</span></td>
              <td style="color: var(--m-color-fg-muted)">${added}</td>
              <td style="color: var(--m-color-fg-muted)">${email}</td>
              <td><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Actions for ${name}">${icon(I.more, 16)}</button></td>
            </tr>`;

const settings = shell(
  'Settings',
  `      <div class="m-stack" data-gap="6" style="max-inline-size: 56rem">
        <div class="m-stack" data-gap="1">
          <span style="${meta}">Pinecrest Studio</span>
          <h1 style="${pageTitle}">Workspace settings</h1>
        </div>
        <div class="m-tabs">
          <div class="m-tab-list" role="tablist" aria-label="Settings sections">
            <button type="button" class="m-tab" role="tab" aria-selected="true">General</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Members</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Branding</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Privacy</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Billing</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Apps</button>
          </div>
        </div>
        <section class="m-stack" data-gap="3" aria-labelledby="ht-name">
          ${sectionHead('ht-name', 'Workspace name', 'Shown on every video page and in invitations.')}
          <div class="m-cluster" data-gap="2"><label class="m-sr-only" for="ht-ws">Workspace name</label><input class="m-input" id="ht-ws" value="Pinecrest Studio" style="max-inline-size: 22rem"><button type="button" class="m-button">Save</button></div>
        </section>
        <section class="m-stack" data-gap="3" aria-labelledby="ht-icon" style="${hair}; padding-block-start: var(--m-space-6)">
          ${sectionHead('ht-icon', 'Workspace icon', 'A square image, at least 160 × 160 pixels.')}
          <div class="m-cluster" data-gap="3"><span class="m-avatar" data-size="lg" style="border-radius: var(--m-radius-md)">PS</span><button type="button" class="m-button">${icon(I.upload, 16)} Upload image</button><button type="button" class="m-button" data-variant="ghost">Remove</button></div>
        </section>
        <section class="m-stack" data-gap="3" aria-labelledby="ht-access" style="${hair}; padding-block-start: var(--m-space-6)">
          ${sectionHead('ht-access', 'Who can watch new videos', 'The starting point for every new recording. Each video can still be changed on its own.')}
          <div class="m-stack" data-gap="3" role="radiogroup" aria-labelledby="ht-access">
            <label class="m-cluster" data-gap="3"><input class="m-radio" type="radio" name="ht-acc">${icon(I.globe, 16)} Anyone with the link</label>
            <label class="m-cluster" data-gap="3"><input class="m-radio" type="radio" name="ht-acc" checked>${icon(I.building, 16)} Members of Pinecrest Studio</label>
            <label class="m-cluster" data-gap="3"><input class="m-radio" type="radio" name="ht-acc">${icon(I.lock, 16)} Only people I add</label>
          </div>
        </section>
        <section class="m-stack" data-gap="4" aria-labelledby="ht-viewers" style="${hair}; padding-block-start: var(--m-space-6)">
          ${sectionHead('ht-viewers', 'Viewer options', 'These take effect at once.')}
          <label class="m-cluster" data-justify="between"><span class="m-stack" data-gap="0"><span>Let viewers download videos</span><span style="${small}">Members can always download their own</span></span><input class="m-switch" type="checkbox" role="switch"></label>
          <label class="m-cluster" data-justify="between"><span class="m-stack" data-gap="0"><span>Show the transcript beside the video</span><span style="${small}">In 50 languages, made after each upload</span></span><input class="m-switch" type="checkbox" role="switch" checked></label>
          <label class="m-cluster" data-justify="between"><span class="m-stack" data-gap="0"><span>Write a summary for new videos ${'<span class="m-badge" data-tone="info">New</span>'}</span><span style="${small}">The assistant drafts it; the owner can edit</span></span><input class="m-switch" type="checkbox" role="switch" checked></label>
        </section>
        <section class="m-stack" data-gap="4" aria-labelledby="ht-members" style="${hair}; padding-block-start: var(--m-space-6)">
          <div class="m-cluster" data-justify="between" data-align="end">
            ${sectionHead('ht-members', 'Members', '42 people, 6 of them admins.')}
            <div class="m-cluster" data-gap="2"><label class="m-sr-only" for="ht-find">Find a member</label><input class="m-input" id="ht-find" data-size="sm" type="search" placeholder="Find a member" style="inline-size: 14rem"><button type="button" class="m-button" data-variant="primary" data-size="sm">${icon(I.userPlus, 16)} Invite people</button></div>
          </div>
          <div class="m-table-wrap">
          <table class="m-table">
            <thead><tr><th scope="col"><input class="m-checkbox" type="checkbox" aria-label="Select all"></th><th scope="col">Name</th><th scope="col">Role</th><th scope="col">Added</th><th scope="col">Email</th><th scope="col"><span class="m-sr-only">Actions</span></th></tr></thead>
            <tbody>
${member('IC', 'Ines Calder', 'Admin', ' data-tone="accent"', 'Mar 3, 2025', 'ines@pinecrest.example')}
${member('TM', 'Theo Marsh', 'Creator', '', 'Jun 18, 2025', 'theo@pinecrest.example')}
${member('PN', 'Priya Nandakumar', 'Creator', '', 'Sep 2, 2025', 'priya@pinecrest.example')}
${member('RO', 'Ravi Okafor', 'Viewer', '', 'Oct 30, 2026', 'ravi@pinecrest.example')}
${member('MV', 'Mateo Vidal', 'Invited', ' data-tone="warning"', 'Nov 9, 2026', 'mateo@pinecrest.example')}
            </tbody>
          </table>
          </div>
        </section>
        <section class="m-stack" data-gap="3" aria-labelledby="ht-delete" style="${hair}; padding-block-start: var(--m-space-6)">
          ${sectionHead('ht-delete', 'Delete workspace', 'Deletes all 318 videos, comments and transcripts for everyone in Pinecrest Studio. This can’t be undone.')}
          <div><button type="button" class="m-button" data-variant="danger">${icon(I.trash, 16)} Delete workspace…</button></div>
        </section>
      </div>`,
);

// An empty folder: a soft round icon, one heading, one sentence, the record button and an upload
const emptyState = shell(
  'Customer calls',
  `      <div class="m-stack" data-gap="6">
        <div class="m-cluster" data-justify="between" data-align="end">
          <div class="m-stack" data-gap="1">
            <nav class="m-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="#">Channels</a></li><li><span aria-current="page">Customer calls</span></li></ol></nav>
            <h1 style="${pageTitle}">Customer calls</h1>
          </div>
          <button type="button" class="m-button">${icon(I.userPlus, 16)} Add people</button>
        </div>
        <div class="m-card" data-variant="sunken" style="padding-block: var(--m-space-16)">
          <div class="m-stack" data-gap="4" data-align="center" style="text-align: center; max-inline-size: 28rem; margin-inline: auto">
            <span style="display: grid; place-items: center; inline-size: 4rem; block-size: 4rem; border-radius: var(--m-radius-full); background: var(--m-color-accent-subtle); color: var(--m-color-accent-text)">${icon(I.video, 28)}</span>
            <h2 style="${h2}">No videos in this channel yet</h2>
            <p class="m-muted">Record a call recap or a quick answer, and everyone in the channel can watch it, react and reply at the exact second.</p>
            <div class="m-cluster" data-gap="2" data-justify="center">
              <button type="button" class="m-button" data-variant="primary">${icon(I.video, 16)} Start recording</button>
              <button type="button" class="m-button">${icon(I.upload, 16)} Upload a video</button>
            </div>
          </div>
        </div>
      </div>`,
);

// Pricing: the public page. Roomy cards with large corners and a hairline; the favourite plan
// tinted pale blue; pill buttons as the public site draws them
const plan = (
  name: string,
  blurb: string,
  price: string,
  per: string,
  cta: string,
  features: [string, boolean?][],
  favourite = false,
) => `      <section class="m-card" style="border-radius: calc(var(--m-radius-lg) * 2); padding: var(--m-space-8) var(--m-space-6)${favourite ? '; background: var(--m-color-accent-subtle); border-color: var(--m-color-accent-default)' : ''}" aria-labelledby="ht-plan-${name.toLowerCase().replace(/\W+/g, '')}">
        <div class="m-stack" data-gap="5">
          <div class="m-stack" data-gap="2">
            ${favourite ? '<span><span class="m-badge" data-tone="info" style="text-transform: uppercase; font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-bold)">Team favourite</span></span>' : '<span style="block-size: 1.25rem"></span>'}
            <h2 id="ht-plan-${name.toLowerCase().replace(/\W+/g, '')}" style="font-size: calc(var(--m-font-size-4xl) * 1.25); font-weight: var(--m-font-weight-bold); line-height: var(--m-font-leading-tight); letter-spacing: var(--m-font-tracking-tight)">${name}</h2>
            <p style="font-size: var(--m-font-size-lg); min-block-size: 3em">${blurb}</p>
          </div>
          <p class="m-cluster" data-gap="2" data-align="baseline"><span style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); font-variant-numeric: tabular-nums">${price}</span><span style="font-size: var(--m-font-size-sm)">${per}</span></p>
          <div><button type="button" class="m-button" data-size="lg"${favourite ? ' data-variant="primary"' : ''} style="border-radius: var(--m-radius-full)${favourite ? '' : '; background: var(--m-color-accent-subtle); border-color: transparent'}">${cta}</button></div>
          <div class="m-stack" data-gap="3">
            <span style="font-weight: var(--m-font-weight-bold)">What you get</span>
            <ul class="m-stack" data-gap="2" style="padding: 0; list-style: none">
${features.map(([f, isNew]) => `              <li class="m-cluster" data-gap="2" style="flex-wrap: nowrap" data-align="start"><span style="display: inline-flex; padding-block-start: 0.2em">${icon(I.check, 16)}</span><span>${f}${isNew ? ' <span style="color: var(--m-color-accent-text); font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-bold); text-transform: uppercase">New</span>' : ''}</span></li>`).join('\n')}
            </ul>
          </div>
        </div>
      </section>`;

const pricing = `<header class="m-navbar">
  <a class="m-navbar-brand" href="#">${mark(2)} Murmur</a>
  <nav class="m-navbar-nav" aria-label="Site">
    <a class="m-navbar-link" href="#">Product</a>
    <a class="m-navbar-link" href="#">For teams</a>
    <a class="m-navbar-link" href="#">Customers</a>
    <a class="m-navbar-link" href="#" aria-current="page">Pricing</a>
  </nav>
  <div class="m-navbar-actions">
    <a class="m-button" href="#">Log in</a>
    <a class="m-button" data-variant="primary" href="#">Try it free</a>
  </div>
</header>
<main class="m-container" style="padding-block: var(--m-space-16)">
  <div class="m-stack" data-gap="10">
    <div class="m-stack" data-gap="4" data-align="center" style="text-align: center">
      <h1 style="font-size: calc(var(--m-font-size-4xl) * 1.75); font-weight: var(--m-font-weight-bold); line-height: 1.05; letter-spacing: var(--m-font-tracking-tight)">Plans for every size of team</h1>
      <p style="font-size: var(--m-font-size-lg); color: var(--m-color-fg-muted); max-inline-size: 34rem">Record, share and reply on video. Start free, and pay per person when your team needs more.</p>
      <div class="m-cluster" data-gap="6" data-justify="center" style="padding-block-start: var(--m-space-2)">
        <label class="m-cluster" data-gap="2"><span style="font-weight: var(--m-font-weight-bold)">Team size</span><input class="m-input" data-size="sm" value="25" inputmode="numeric" style="inline-size: 6rem; border-radius: 12px"> people</label>
        <div class="m-cluster" data-gap="3" role="radiogroup" aria-label="Billing">
          <span style="font-weight: var(--m-font-weight-bold)">Billing</span>
          <label class="m-cluster" data-gap="2"><input class="m-radio" type="radio" name="ht-bill"> Monthly</label>
          <label class="m-cluster" data-gap="2"><input class="m-radio" type="radio" name="ht-bill" checked> Yearly</label>
          <span class="m-badge" data-tone="info" style="text-transform: uppercase; font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-bold)">Save 15%</span>
        </div>
      </div>
    </div>
    <div class="m-grid" style="--m-layout-grid-min: 15rem; --m-layout-grid-gap: var(--m-space-5)">
${plan('Free', 'For trying video messages on your own', '$0', '', 'Sign up', [['30 videos per person'], ['Recordings up to 5 minutes'], ['Transcripts in 50 languages'], ['Comments and reactions']])}
${plan('Team', 'For small teams that record every week', '$14', 'per person / month, billed yearly', 'Try it free', [['Unlimited videos'], ['Recordings of any length'], ['Trim and stitch clips'], ['Download and upload videos']])}
${plan('Team Plus', 'For teams that want the assistant to do the writing', '$22', 'per person / month, billed yearly', 'Try it free', [['Everything in Team'], ['Summaries and chapters', true], ['Filler words removed'], ['Recap emails after meetings', true], ['Viewer insights']], true)}
${plan('Company', 'For organisations that need control and support', 'Custom', '', 'Talk to us', [['Single sign-on and SCIM'], ['Retention rules'], ['99.9% uptime commitment'], ['A named support lead']])}
    </div>
    <section class="m-stack" data-gap="4" aria-labelledby="ht-faq" style="max-inline-size: 48rem; margin-inline: auto; inline-size: 100%">
      <h2 id="ht-faq" style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-bold)">Questions</h2>
      <div class="m-accordion" style="border-inline: 0">
        <details class="m-accordion-item" name="ht-faq" open><summary>Do people need an account to watch?</summary><div class="m-accordion-content">No. Anyone with the link can watch, unless you limit a video to your workspace or to people you add.</div></details>
        <details class="m-accordion-item" name="ht-faq"><summary>What counts as a person on the bill?</summary><div class="m-accordion-content">Anyone who records. Viewers and commenters are free on every plan.</div></details>
        <details class="m-accordion-item" name="ht-faq"><summary>Can I move between plans?</summary><div class="m-accordion-content">Yes, any time. Moving up applies at once; moving down applies at the end of the billing period.</div></details>
      </div>
    </section>
  </div>
</main>`;

// Errors: the field (a red border and a message with its icon), a summary above the form, a flag
// for what failed elsewhere, and whole pages for not found, failure and no access
const errorPage = (code: string, ic: keyof typeof I, title: string, body: string, actions: string) =>
  `  <section class="m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-16); ${hair}" aria-labelledby="ht-err-${code}">
    <span style="display: grid; place-items: center; inline-size: 4rem; block-size: 4rem; border-radius: var(--m-radius-full); background: var(--m-color-bg-sunken); color: var(--m-color-fg-subtle)">${icon(I[ic], 28)}</span>
    <span style="${small}; font-family: var(--m-font-family-mono)">${code}</span>
    <h1 id="ht-err-${code}" style="${pageTitle}">${title}</h1>
    <p class="m-muted" style="max-inline-size: 28rem">${body}</p>
    <div class="m-cluster" data-gap="2" data-justify="center">${actions}</div>
  </section>`;

const errors = `<main class="m-container" data-size="md" style="padding-block: var(--m-space-12)">
  <div class="m-stack" data-gap="10">
    <section class="m-stack" data-gap="5" aria-labelledby="ht-err-form" style="max-inline-size: 30rem">
      <h1 id="ht-err-form" style="${pageTitle}">Share this video</h1>
      <div class="m-alert" data-tone="danger" role="alert">
        <span class="m-alert-icon">${icon(I.alert, 18)}</span>
        <div class="m-alert-content"><div class="m-alert-title">2 things need fixing</div><div class="m-alert-body">Nobody was invited yet. Check the email address and the title.</div></div>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="ht-err-email">Invite by email</label>
        <input class="m-input" id="ht-err-email" value="june@pinecrest" aria-invalid="true" aria-describedby="ht-err-email-e">
        <p class="m-field-error" id="ht-err-email-e"><span style="display: inline-flex; vertical-align: -0.2em">${icon(I.alert, 14)}</span> Add the full address, like june@pinecrest.example</p>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="ht-err-title">Title</label>
        <input class="m-input" id="ht-err-title" value="" aria-invalid="true" aria-describedby="ht-err-title-e">
        <p class="m-field-error" id="ht-err-title-e"><span style="display: inline-flex; vertical-align: -0.2em">${icon(I.alert, 14)}</span> Give the video a title so people know what they’re opening</p>
      </div>
      <div class="m-cluster" data-justify="end" data-gap="2">
        <button type="button" class="m-button" data-variant="ghost">Cancel</button>
        <button type="submit" class="m-button" data-variant="primary">${icon(I.userPlus, 16)} Invite</button>
      </div>
    </section>
    <section class="m-stack" data-gap="3" aria-label="A flag">
      <div class="m-toast-region" data-static aria-live="polite">
        <div class="m-toast" data-tone="danger" role="alert">
          <div class="m-toast-content">
            <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span style="color: var(--m-color-danger-fg); display: inline-flex">${icon(I.alert, 18)}</span><p class="m-toast-title">Upload stopped at 64%</p></div>
            <p class="m-toast-body">“Client handoff, Nov 12” is saved on this computer. Nothing was lost.</p>
            <div class="m-toast-actions"><button type="button" class="m-button" data-size="sm">${icon(I.refresh, 16)} Retry</button></div>
          </div>
          <button type="button" class="m-toast-close" aria-label="Dismiss">${icon(I.x, 16)}</button>
        </div>
      </div>
    </section>
${errorPage('404', 'search', 'We can’t find that video', 'It may have been moved or deleted, or the link is missing a few characters.', `<a class="m-button" data-variant="primary" href="#">${icon(I.home, 16)} Go to your library</a>`)}
${errorPage('500', 'alert', 'Something went wrong on our side', 'Your videos are safe and nothing was changed. Try again in a moment.', `<button type="button" class="m-button" data-variant="primary">${icon(I.refresh, 16)} Try again</button><a class="m-button" href="#">Check the status page</a>`)}
${errorPage('403', 'lock', 'This video is private', 'Ines Calder shared it with Pinecrest Studio only. Ask for access and we’ll let her know.', `<button type="button" class="m-button" data-variant="primary">Request access</button><a class="m-button" data-variant="ghost" href="#">Switch account</a>`)}
  </div>
</main>`;

export const heatherRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'The library: a white sidebar with the current row in pale blue, a wide rounded search, folders, then a grid of video cards with duration chips and view, comment and reaction counts.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'The video page: a title band, the video on a soft well, reactions and Comment, the summary and up next; a side panel of tabs with the transcript and its current line highlighted.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One column with a step bar: choice tiles (the chosen one pale blue with a blue edge), then the recorder: mode segments, camera and microphone, the bubble switch and Start recording.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'Workspace settings under underline tabs: titled sections with a hairline between them, radios, switches that apply at once, the members table and Delete last.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'An empty channel: a soft round icon in pale blue, one bold heading, one sentence, Start recording and an upload button.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The public page: a huge bold heading, team size and billing, four roomy cards with large corners, the favourite tinted pale blue, pill buttons and questions below.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'A red-bordered field with its message and icon, a summary that says nobody was invited, a flag with Retry for a failed upload, and full pages for 404, 500 and no access.',
    html: errors,
  },
];
