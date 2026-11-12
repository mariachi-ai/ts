import type { ArchetypeRecipe } from '../types';

/*
 * Harbor's seven page shapes: framework-free HTML using only @mariachi/design classes and tokens (no
 * colour literals), with sample data from an invented messenger, "Wavelet". They follow the
 * language's real screen patterns: a 64px icon rail on warm off-white, a white list column with a
 * bold title, a pill search and filter chips, 49px round avatars and rows with the time and a green
 * unread count, and the open conversation on a warm wallpaper with tailed bubbles, small timestamps,
 * blue read ticks and a floating composer. Names, messages, sections and their order are invented.
 */

// Lucide icons, outlined, 2px stroke (the reference's rounded outline glyphs)
const icon = (paths: string, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  messages: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  people:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  calendar:
    '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  files: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  star: '<path d="M11.5 2.9a.5.5 0 0 1 1 0l2.3 4.7a2 2 0 0 0 1.5 1.1l5.2.8a.5.5 0 0 1 .3.9l-3.8 3.7a2 2 0 0 0-.6 1.8l.9 5.2a.5.5 0 0 1-.8.5l-4.6-2.5a2 2 0 0 0-1.9 0l-4.6 2.5a.5.5 0 0 1-.8-.5l.9-5.2a2 2 0 0 0-.6-1.8L2.7 10.4a.5.5 0 0 1 .3-.9l5.2-.8a2 2 0 0 0 1.5-1.1z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1"/>',
  compose:
    '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.4 2.6a1 1 0 0 1 3 3l-9 9a2 2 0 0 1-.9.5l-2.9.8a.5.5 0 0 1-.6-.6l.8-2.9a2 2 0 0 1 .5-.9z"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  video:
    '<path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 11"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  phone:
    '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
  send: '<path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z"/><path d="M6 12h16"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  pin: '<path d="M12 17v5"/><path d="M9 10.8a2 2 0 0 1-1.1 1.8l-1.8.9A2 2 0 0 0 5 15.2V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.8a2 2 0 0 0-1.1-1.8l-1.8-.9A2 2 0 0 1 15 10.8V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
  mute: '<path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',
  back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.7 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/>',
  disk: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  palette:
    '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1a1.6 1.6 0 0 1 1.6-1.7h2c3.1 0 5.6-2.5 5.6-5.6C22 6 17.5 2 12 2z"/>',
  keyboard:
    '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  user: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  block: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
  trash:
    '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  wifiOff:
    '<path d="M12 20h.01"/><path d="M8.5 16.4a5 5 0 0 1 7 0"/><path d="M2 8.8a15 15 0 0 1 4.2-2.7"/><path d="M22 8.8a15 15 0 0 0-11.3-3.7"/><path d="M5 12.9a10 10 0 0 1 5.2-2.7"/><path d="M19 12.9a10 10 0 0 0-2.1-1.6"/><path d="m2 2 20 20"/>',
  devices:
    '<rect x="2" y="4" width="14" height="10" rx="2"/><path d="M6 18h6"/><path d="M9 14v4"/><rect x="16" y="9" width="6" height="11" rx="1"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checks: '<path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  external: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6a2 2 0 0 1 .7 1.5v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  refresh:
    '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  timer: '<path d="M10 2h4"/><path d="M12 14l3-3"/><circle cx="12" cy="14" r="8"/>',
};

const hair = (side = 'block-end') => `border-${side}: var(--m-border-width-thin) solid var(--m-color-border-default)`;
const muted = 'color: var(--m-color-fg-muted)';
const small = 'font-size: var(--m-font-size-sm)';
const tiny = 'font-size: 0.6875rem';
const panelTitle =
  'font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold); line-height: var(--m-font-leading-tight)';
// Read ticks in the read-receipt blue; delivered in grey
const ticks = (read = true) =>
  `<span style="display: inline-flex; color: var(--m-color-${read ? 'info-solid' : 'fg-muted'})" role="img" aria-label="${read ? 'Read' : 'Delivered'}">${icon(I.checks, 16)}</span>`;

// The rail: icons only, the current one on a round warm tint, the unread count as a green dot
const railLink = (ic: string, label: string, current: string, count?: string) =>
  `<li><a class="m-sidebar-link" href="#" aria-label="${label}"${label === current ? ' aria-current="page"' : ''} style="position: relative; justify-content: center; inline-size: 2.5rem; block-size: 2.5rem">${icon(ic, 22)}${count ? `<span class="m-sidebar-count" style="position: absolute; inset-block-start: -2px; inset-inline-end: -4px; margin: 0; padding: 0 5px; min-inline-size: 1.25rem; font-weight: var(--m-font-weight-medium)">${count}</span>` : ''}</a></li>`;

const rail = (
  current: string,
) => `<nav class="m-sidebar" aria-label="Main" style="--m-sidebar-width: 4rem; --m-sidebar-padding: var(--m-space-3) var(--m-space-3); --m-sidebar-bg: var(--m-color-bg-sunken); --m-sidebar-link-radius: 9999px; --m-sidebar-link-padding-x: 0; --m-sidebar-link-padding-y: 0; --m-sidebar-link-fg: var(--m-color-fg-muted); --m-sidebar-item-gap: var(--m-space-2); justify-content: space-between; min-block-size: 100vh">
    <ul>
      ${railLink(I.messages, 'Messages', current, '6')}
      ${railLink(I.calendar, 'Events', current)}
      ${railLink(I.people, 'People', current)}
      ${railLink(I.files, 'Files', current)}
      <li aria-hidden="true" style="${hair('block-start')}; margin: var(--m-space-1) var(--m-space-2) 0"></li>
      ${railLink(I.star, 'Saved', current)}
    </ul>
    <ul>
      ${railLink(I.gear, 'Settings', current)}
      <li><a href="#" aria-label="Your profile" style="display: grid; place-items: center; inline-size: 2.5rem; block-size: 2.5rem"><span class="m-avatar" data-size="sm">ML</span></a></li>
    </ul>
  </nav>`;

// The three-column window: rail, the list column, the main pane
const shell = (
  current: string,
  list: string,
  main: string,
) => `<div class="m-split" style="--m-layout-split-side: 4rem; --m-layout-split-gap: 0; min-block-size: 100vh; background: var(--m-color-bg-sunken)">
  ${rail(current)}
  <div class="m-split" style="--m-layout-split-side: 26.5rem; --m-layout-split-gap: 0; align-items: stretch">
    ${list}
    ${main}
  </div>
</div>`;

const listHead = (
  title: string,
  actions: string,
) => `<div class="m-cluster" data-justify="between" style="padding: var(--m-space-2) var(--m-space-2) 0 var(--m-space-2)">
        <h1 style="${panelTitle}">${title}</h1>
        <div class="m-cluster" data-gap="1">${actions}</div>
      </div>`;

const searchPill = (id: string, placeholder: string) => `<div style="position: relative">
        <label class="m-sr-only" for="${id}">Search</label>
        <span style="position: absolute; inset-inline-start: var(--m-space-4); inset-block-start: 50%; translate: 0 -50%; display: inline-flex; ${muted}">${icon(I.search, 18)}</span>
        <input class="m-input" id="${id}" type="search" placeholder="${placeholder}" style="border-radius: 9999px; border-color: transparent; background: var(--m-color-bg-sunken); padding-inline-start: 2.75rem">
      </div>`;

const iconBtn = (ic: string, label: string, size = 20) =>
  `<button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="${label}">${icon(ic, size)}</button>`;

// Filter chips: the selected one pale green, the rest outlined
const chips = (
  labels: string[],
  selected: string,
) => `<div class="m-tabs" data-variant="pill" style="--m-tabs-height: 2rem; --m-tabs-list-gap: var(--m-space-2); --m-tabs-padding-x: var(--m-space-3)"><div class="m-tab-list" role="tablist" aria-label="Filter">
        ${labels
          .map((l) =>
            l === selected
              ? `<button type="button" class="m-tab" role="tab" aria-selected="true">${l}</button>`
              : `<button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1" style="box-shadow: inset 0 0 0 1px var(--m-color-border-default)">${l}</button>`,
          )
          .join('')}
      </div></div>`;

// A conversation row: 49px avatar, the name and time, then the last message and the unread count
const row = (
  initials: string,
  name: string,
  time: string,
  preview: string,
  opts: { unread?: string; current?: boolean; tick?: 'read' | 'sent'; muted?: boolean; pinned?: boolean } = {},
) => `<li><a class="m-sidebar-link" href="#"${opts.current ? ' aria-current="page"' : ''} style="gap: var(--m-space-3); padding-block: var(--m-space-3)">
          <span class="m-avatar" data-size="lg" aria-hidden="true">${initials}</span>
          <span class="m-stack" data-gap="1" style="flex: 1; min-inline-size: 0">
            <span class="m-cluster" data-justify="between" style="flex-wrap: nowrap"><span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">${name}</span><span style="${tiny}; font-size: var(--m-font-size-xs); ${opts.unread ? 'color: var(--m-color-accent-text); font-weight: var(--m-font-weight-medium)' : muted}">${time}</span></span>
            <span class="m-cluster" data-justify="between" style="flex-wrap: nowrap; ${small}; font-size: var(--m-font-size-md); ${muted}"><span class="m-cluster" data-gap="1" style="flex-wrap: nowrap; min-inline-size: 0">${opts.tick ? ticks(opts.tick === 'read') : ''}<span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">${preview}</span></span><span class="m-cluster" data-gap="1" style="flex-wrap: nowrap">${opts.muted ? icon(I.mute, 16) : ''}${opts.pinned ? icon(I.pin, 16) : ''}${opts.unread ? `<span class="m-sidebar-count" style="font-weight: var(--m-font-weight-medium)">${opts.unread}</span>` : ''}</span></span>
          </span>
        </a></li>`;

const listColumn = (
  body: string,
) => `<aside class="m-sidebar" aria-label="Conversations" style="--m-sidebar-padding: var(--m-space-3) var(--m-space-3); --m-sidebar-section-gap: var(--m-space-3); min-block-size: 100vh">
      ${body}
    </aside>`;

// A bubble's tail: a small corner flag at the top outer edge of the first bubble in a run
const tail = (side: 'in' | 'out') =>
  side === 'in'
    ? `<svg width="8" height="13" viewBox="0 0 8 13" aria-hidden="true" style="position: absolute; inset-block-start: 0; inset-inline-start: -8px; fill: var(--m-chat-assistant-bg)"><path d="M1.5 0H8v12L.6 2.3C-.1 1.3.3 0 1.5 0Z"/></svg>`
    : `<svg width="8" height="13" viewBox="0 0 8 13" aria-hidden="true" style="position: absolute; inset-block-start: 0; inset-inline-end: -8px; fill: var(--m-chat-user-bg)"><path d="M6.5 0H0v12l7.4-9.7C8.1 1.3 7.7 0 6.5 0Z"/></svg>`;

// Time and ticks sit inside the bubble, bottom right, small and muted
const stamp = (time: string, tick?: 'read' | 'sent') =>
  `<span class="m-cluster" data-gap="1" style="flex-wrap: nowrap; float: inline-end; margin: var(--m-space-2) 0 calc(var(--m-space-1) * -1) var(--m-space-3); ${tiny}; ${muted}; line-height: 1">${time}${tick ? ticks(tick === 'read') : ''}</span>`;

const bubble = (
  role: 'in' | 'out',
  text: string,
  time: string,
  opts: { first?: boolean; tick?: 'read' | 'sent'; who?: string; extra?: string } = {},
) =>
  `<article class="m-message" data-role="${role === 'out' ? 'user' : 'assistant'}"${opts.first ? ' style="margin-block-start: var(--m-space-2)"' : ''}>
            <div class="m-message-body" style="position: relative; box-shadow: var(--m-shadow-sm);${opts.first ? (role === 'in' ? ' border-start-start-radius: 0;' : ' border-start-end-radius: 0;') : ''}">${opts.first ? tail(role) : ''}${opts.who ? `<span style="display: block; ${small}; font-weight: var(--m-font-weight-medium); color: var(--m-color-accent-text)">${opts.who}</span>` : ''}${opts.extra ?? ''}${text}${stamp(time, opts.tick)}</div>
          </article>`;

const datePill = (label: string) =>
  `<article class="m-message" data-role="system" style="margin-block: var(--m-space-3)"><div class="m-message-body"><span style="display: inline-block; padding: var(--m-space-1) var(--m-space-3); border-radius: var(--m-radius-sm); background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-sm); ${small}; ${muted}">${label}</span></div></article>`;

const convHeader = (
  initials: string,
  name: string,
  status: string,
) => `<header class="m-cluster" data-justify="between" style="padding: var(--m-space-2) var(--m-space-4); background: var(--m-color-bg-surface); ${hair()}">
        <a href="#" class="m-cluster" data-gap="3" style="color: inherit; text-decoration: none"><span class="m-avatar" aria-hidden="true">${initials}</span><span class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-lg)">${name}</span><span style="${small}; ${muted}">${status}</span></span></a>
        <div class="m-cluster" data-gap="1">${iconBtn(I.video, 'Video call')}${iconBtn(I.phone, 'Voice call')}${iconBtn(I.search, 'Search in this chat')}${iconBtn(I.more, 'More')}</div>
      </header>`;

const composer = (
  id: string,
  value = '',
) => `<form class="m-composer" style="flex-direction: row; align-items: center; padding: var(--m-space-1) var(--m-space-2)">
          ${iconBtn(I.plus, 'Attach', 22)}
          ${iconBtn(I.smile, 'Emoji', 22)}
          <label class="m-sr-only" for="${id}">Message</label>
          <textarea class="m-composer-input" id="${id}" rows="1" placeholder="Write a message"${value ? '' : ''} style="flex: 1; min-block-size: 1.5rem">${value}</textarea>
          ${value ? `<button type="submit" class="m-button" data-variant="primary" data-icon-only aria-label="Send">${icon(I.send, 20)}</button>` : iconBtn(I.mic, 'Record a voice note', 22)}
        </form>`;

// The open conversation: header, the wallpaper with the thread, the floating composer
const conversation = `<main class="m-stack" data-gap="0" style="min-block-size: 100vh; background: var(--m-color-bg-sunken)">
      ${convHeader('AG', 'Allotment gang', 'Ines, Tomasz, Priya, Kofi, you')}
      <div style="flex: 1; padding: var(--m-space-4) clamp(var(--m-space-4), 6%, var(--m-space-16))">
        <div class="m-chat" role="log" aria-label="Messages in Allotment gang" style="--m-chat-assistant-border: var(--m-chat-assistant-bg); --m-chat-user-border: var(--m-chat-user-bg)">
          ${datePill('Yesterday')}
          <article class="m-message" data-role="system"><div class="m-message-body"><span class="m-cluster" data-gap="2" style="flex-wrap: nowrap; display: inline-flex; max-inline-size: 30rem; padding: var(--m-space-2) var(--m-space-3); border-radius: var(--m-radius-sm); background: var(--m-color-warning-bg); ${small}; ${muted}; text-align: start">${icon(I.lock, 14)} Only the people in this group can read what's sent here. Tap for details.</span></div></article>
          ${bubble('in', 'Who has the key to the shed this week? The padlock code changed', '18:02', { first: true, who: 'Tomasz Wilk' })}
          ${bubble('out', 'I do, I can leave it under the blue pot', '18:09', { first: true, tick: 'read' })}
          ${datePill('Today')}
          ${bubble('in', 'Squash is ready to pick on plot 14. Bring bags on Saturday', '08:41', { first: true, who: 'Priya Natarajan' })}
          ${bubble('in', 'There are at least twenty of them 🎃', '08:41')}
          ${bubble('in', 'Count me in, I’ll bring the wheelbarrow too', '09:15', {
            first: true,
            who: 'Kofi Mensah',
            extra: `<span style="display: block; margin-block: var(--m-space-1) var(--m-space-2); padding: var(--m-space-2) var(--m-space-3); border-inline-start: 4px solid var(--m-color-accent-default); border-radius: var(--m-radius-sm); background: var(--m-color-bg-sunken); ${small}"><span style="display: block; color: var(--m-color-accent-text); font-weight: var(--m-font-weight-medium)">Priya Natarajan</span><span style="${muted}">Squash is ready to pick on plot 14…</span></span>`,
          })}
          ${bubble('out', 'Great. I’ll be there from 10', '09:20', { first: true, tick: 'read' })}
          ${bubble('out', 'Does anyone need seed trays? I have spares', '09:21', { tick: 'sent' })}
        </div>
      </div>
      <div style="padding: var(--m-space-2) var(--m-space-4) var(--m-space-4)">${composer('hb-composer')}</div>
    </main>`;

const dashboard = shell(
  'Messages',
  listColumn(`${listHead('Messages', `${iconBtn(I.compose, 'New message')}${iconBtn(I.more, 'Menu')}`)}
      ${searchPill('hb-search', 'Search names and messages')}
      ${chips(['Everything', 'New', 'Direct', 'Teams'], 'Everything')}
      <ul>
        ${row('AG', 'Allotment gang', '09:21', 'You: Does anyone need seed trays? I have spares', { current: true, tick: 'sent' })}
        ${row('RO', 'Rosa Ortega', '09:02', 'Can you send me the photos from the walk?', { unread: '2' })}
        ${row('F3', 'Flat 3B', '08:30', 'Hamid: Bins go out tonight, not tomorrow', { unread: '4', muted: true })}
        ${row('DP', 'Dad', 'Yesterday', 'Call me when you’re back home', { pinned: true })}
        ${row('LC', 'Lena Choi', 'Yesterday', 'Thanks! See you at the station', { tick: 'read' })}
        ${row('SF', 'Sunday five-a-side', 'Tuesday', 'Marco: Pitch 2 again, kick-off 11:00')}
        ${row('JA', 'Jonah Abara', '11/08/2026', 'Voice note (0:42)', { tick: 'read' })}
      </ul>`),
  conversation,
);

// List and detail: people grouped by letter, and one person's profile drawer
const letter = (l: string) =>
  `<li style="padding: var(--m-space-3) var(--m-space-4) var(--m-space-1); color: var(--m-color-accent-text); ${small}">${l}</li>`;
const person = (initials: string, name: string, about: string, current = false) =>
  `<li><a class="m-sidebar-link" href="#"${current ? ' aria-current="page"' : ''} style="gap: var(--m-space-3); padding-block: var(--m-space-2)"><span class="m-avatar" data-size="lg" aria-hidden="true">${initials}</span><span class="m-stack" data-gap="0" style="min-inline-size: 0"><span>${name}</span><span style="${small}; font-size: var(--m-font-size-md); ${muted}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">${about}</span></span></a></li>`;

const infoRow = (ic: string, label: string, value = '', tone = '') =>
  `<a href="#" class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding: var(--m-space-4) var(--m-space-6); color: ${tone ? `var(--m-color-${tone}-fg)` : 'inherit'}; text-decoration: none"><span class="m-cluster" data-gap="6" style="flex-wrap: nowrap"><span style="display: inline-flex; ${tone ? '' : muted}">${icon(ic, 20)}</span>${label}</span><span class="m-cluster" data-gap="2" style="${muted}">${value}${tone ? '' : icon(I.right, 18)}</span></a>`;

const tile = (ic: string, label: string) =>
  `<button type="button" class="m-button" style="flex-direction: column; block-size: auto; padding: var(--m-space-3) var(--m-space-5); border-radius: var(--m-radius-md); gap: var(--m-space-1); min-inline-size: 6rem">${icon(ic, 22)}<span style="${small}; color: var(--m-color-fg-default)">${label}</span></button>`;

const listDetail = shell(
  'People',
  listColumn(`${listHead('People', `${iconBtn(I.plus, 'Add a person')}${iconBtn(I.more, 'Menu')}`)}
      ${searchPill('hb-people-search', 'Search people')}
      <ul>
        ${letter('A')}
        ${person('JA', 'Jonah Abara', 'Out sailing until Friday')}
        ${person('KA', 'Kemi Adeyemi', 'Ask me about the choir')}
        ${letter('C')}
        ${person('LC', 'Lena Choi', 'Coffee first, then email')}
        ${person('MC', 'Marco Conti', 'Available')}
        ${letter('M')}
        ${person('KM', 'Kofi Mensah', 'Plot 9, usually on Saturdays', true)}
        ${person('YM', 'Yuki Mori', 'Hey there, I’m on Wavelet')}
        ${letter('N')}
        ${person('PN', 'Priya Natarajan', 'Growing far too much squash')}
      </ul>`),
  `<main class="m-stack" data-gap="0" style="min-block-size: 100vh; background: var(--m-color-bg-sunken)">
      <header class="m-cluster" data-gap="4" style="padding: var(--m-space-3) var(--m-space-4); background: var(--m-color-bg-surface); ${hair()}">
        ${iconBtn(I.close, 'Close')}<h2 style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-regular)">Contact details</h2>
      </header>
      <div class="m-stack" data-gap="2" style="flex: 1">
        <section class="m-stack" data-gap="2" data-align="center" style="padding: var(--m-space-8) var(--m-space-6) var(--m-space-6); background: var(--m-color-bg-surface); text-align: center" aria-labelledby="hb-person">
          <span class="m-avatar" aria-hidden="true" style="inline-size: 12.5rem; block-size: 12.5rem; font-size: var(--m-font-size-4xl)">KM</span>
          <h1 id="hb-person" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-regular); margin-block-start: var(--m-space-2)">Kofi Mensah</h1>
          <p style="font-size: var(--m-font-size-lg); ${muted}">+44 7700 900 418</p>
          <div class="m-cluster" data-gap="3" data-justify="center" style="margin-block-start: var(--m-space-3)">${tile(I.phone, 'Voice')}${tile(I.video, 'Video')}${tile(I.messages, 'Message')}${tile(I.search, 'Search')}</div>
        </section>
        <section class="m-stack" data-gap="1" style="padding: var(--m-space-4) var(--m-space-6); background: var(--m-color-bg-surface)" aria-label="About">
          <span style="${small}; ${muted}">About</span>
          <p>Plot 9, usually on Saturdays</p>
        </section>
        <section style="background: var(--m-color-bg-surface)" aria-labelledby="hb-media">
          <a href="#" class="m-cluster" data-justify="between" style="padding: var(--m-space-4) var(--m-space-6) var(--m-space-2); color: inherit; text-decoration: none"><span id="hb-media" style="${small}; ${muted}">Photos, links and files</span><span class="m-cluster" data-gap="1" style="${small}; ${muted}">38 ${icon(I.right, 16)}</span></a>
          <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap; padding: 0 var(--m-space-6) var(--m-space-4)">
            ${['files', 'link', 'files', 'link']
              .map(
                (k) =>
                  `<span style="display: grid; place-items: center; inline-size: 5.5rem; block-size: 5.5rem; border-radius: var(--m-radius-md); background: var(--m-color-bg-sunken); ${muted}">${icon(I[k as keyof typeof I], 24)}</span>`,
              )
              .join('')}
          </div>
        </section>
        <section style="background: var(--m-color-bg-surface)" aria-label="Chat settings">
          ${infoRow(I.star, 'Saved messages', '3')}
          ${infoRow(I.bell, 'Alerts', 'On')}
          ${infoRow(I.timer, 'Vanishing messages', 'Off')}
          ${infoRow(I.lock, 'Privacy of this chat', '')}
          <div style="${hair('block-start')}; margin-inline: var(--m-space-6)"></div>
          ${infoRow(I.people, '2 groups in common', '')}
        </section>
        <section style="background: var(--m-color-bg-surface)" aria-label="Actions">
          ${infoRow(I.block, 'Block Kofi Mensah', '', 'danger')}
          ${infoRow(I.flag, 'Report Kofi Mensah', '', 'danger')}
          ${infoRow(I.trash, 'Delete chat', '', 'danger')}
        </section>
      </div>
    </main>`,
);

// Onboarding: the public start page: warm off-white, outlined white cards, numbered steps
const step = (n: string, text: string, last = false) =>
  `<li class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap; position: relative; padding-block-end: ${last ? '0' : 'var(--m-space-5)'}">
          ${last ? '' : `<span aria-hidden="true" style="position: absolute; inset-inline-start: 0.75rem; inset-block: 1.5rem 0; border-inline-start: var(--m-border-width-thin) solid var(--m-color-fg-default)"></span>`}
          <span style="display: grid; flex: none; place-items: center; inline-size: 1.5rem; block-size: 1.5rem; border: var(--m-border-width-thin) solid var(--m-color-fg-default); border-radius: 9999px; background: var(--m-color-bg-surface); ${small}">${n}</span>
          <span style="font-size: var(--m-font-size-lg)">${text}</span>
        </li>`;

const onboarding = `<div style="min-block-size: 100vh; background: var(--m-color-bg-sunken)">
  <header class="m-cluster" data-gap="2" style="padding: var(--m-space-4) var(--m-space-10); color: var(--m-color-accent-text); font-weight: var(--m-font-weight-bold); font-size: var(--m-font-size-lg)">${icon(I.messages, 28)} Wavelet</header>
  <main class="m-container" style="--m-layout-container-max-lg: 54.5rem; padding-block: var(--m-space-6) var(--m-space-12)">
    <div class="m-stack" data-gap="4">
      <section class="m-card" data-variant="outline" aria-labelledby="hb-app">
        <div class="m-card-body m-cluster" data-justify="between" data-gap="6">
          <div class="m-cluster" data-gap="5" style="flex-wrap: nowrap; flex: 1 1 24rem">
            <span style="display: grid; flex: none; place-items: center; inline-size: 4rem; block-size: 4rem; border-radius: var(--m-radius-md); background: var(--m-color-brand-subtle); color: var(--m-color-accent-text)">${icon(I.devices, 32)}</span>
            <div class="m-stack" data-gap="1"><h2 id="hb-app" style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium)">Get Wavelet for your computer</h2><p>Faster start-up, calls with screen sharing, and alerts when the browser is closed.</p></div>
          </div>
          <a href="#" class="m-button" data-variant="primary" data-size="lg" style="--m-button-primary-bg: var(--m-color-brand-default); border: var(--m-border-width-thin) solid var(--m-color-fg-default)">Get the app ${icon(I.download, 18)}</a>
        </div>
      </section>
      <section class="m-card" data-variant="outline" aria-labelledby="hb-setup">
        <div class="m-card-body m-stack" data-gap="6" style="padding: var(--m-space-12)">
          <progress class="m-progress" value="2" max="3" aria-label="Setup, step 2 of 3">Step 2 of 3</progress>
          <div class="m-grid" style="--m-layout-grid-min: 18rem; --m-layout-grid-gap: var(--m-space-12); align-items: start">
            <div class="m-stack" data-gap="6">
              <h1 id="hb-setup" style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-regular); line-height: var(--m-font-leading-tight)">Set up your profile</h1>
              <ol class="m-stack" data-gap="0" style="padding: 0; list-style: none">
                ${step('1', 'Add the name people will see')}
                ${step('2', 'Choose who can see your photo and status')}
                ${step('3', 'Turn on alerts for new messages', true)}
              </ol>
              <a href="#" class="m-cluster" data-gap="1" style="align-self: start; color: var(--m-color-fg-default); font-weight: var(--m-font-weight-medium); text-decoration: underline; text-decoration-color: var(--m-color-accent-default); text-decoration-thickness: 2px; text-underline-offset: 4px">Need a hand? ${icon(I.external, 16)}</a>
            </div>
            <form class="m-stack" data-gap="5">
              <div class="m-field">
                <label class="m-field-label" for="hb-ob-name">Your name</label>
                <input class="m-input" id="hb-ob-name" value="Maya Lindqvist" autocomplete="name">
                <p class="m-field-hint">Shown to people who don’t have you saved.</p>
              </div>
              <div class="m-field">
                <label class="m-field-label" for="hb-ob-status">Status line</label>
                <input class="m-input" id="hb-ob-status" placeholder="For example, “On the night bus”">
              </div>
              <fieldset class="m-stack" data-gap="3" style="border: 0; padding: 0; margin: 0">
                <legend class="m-field-label" style="margin-block-end: var(--m-space-3)">Who can see your photo</legend>
                <label class="m-cluster" data-gap="3"><input class="m-radio" type="radio" name="hb-ob-photo" checked> Everyone</label>
                <label class="m-cluster" data-gap="3"><input class="m-radio" type="radio" name="hb-ob-photo"> People I’ve saved</label>
                <label class="m-cluster" data-gap="3"><input class="m-radio" type="radio" name="hb-ob-photo"> Nobody</label>
              </fieldset>
              <div class="m-cluster" data-justify="between" style="margin-block-start: var(--m-space-2)">
                <button type="button" class="m-button" data-variant="ghost">Back</button>
                <button type="submit" class="m-button" data-variant="primary">Continue</button>
              </div>
            </form>
          </div>
        </div>
      </section>
      <p class="m-cluster" data-gap="2" data-justify="center" style="font-size: var(--m-font-size-lg)">New here? <a href="#" class="m-cluster" data-gap="1" style="color: var(--m-color-fg-default); font-weight: var(--m-font-weight-medium); text-decoration: underline; text-decoration-color: var(--m-color-accent-default); text-decoration-thickness: 2px; text-underline-offset: 4px">Create an account ${icon(I.external, 16)}</a></p>
      <p class="m-cluster" data-gap="2" data-justify="center" style="${muted}">${icon(I.lock, 16)} Messages are private between you and the people you write to</p>
    </div>
  </main>
</div>`;

// Settings: the list column holds the sections; the open one is a stack of white groups
const setLink = (ic: string, label: string, current = false, tone = '') =>
  `<li><a class="m-sidebar-link" href="#"${current ? ' aria-current="page"' : ''} style="gap: var(--m-space-5)${tone ? `; color: var(--m-color-${tone}-fg)` : ''}"><span style="display: inline-flex; ${tone ? '' : muted}">${icon(ic, 22)}</span>${label}</a></li>`;

const switchRow = (id: string, label: string, hint: string, on = true) =>
  `<label class="m-cluster" data-justify="between" data-gap="6" style="flex-wrap: nowrap; padding: var(--m-space-4) 0" for="${id}"><span class="m-stack" data-gap="1"><span>${label}</span><span style="${small}; ${muted}">${hint}</span></span><input class="m-switch" id="${id}" type="checkbox" role="switch"${on ? ' checked' : ''}></label>`;

const group = (title: string, body: string) =>
  `<section class="m-stack" data-gap="0" style="padding: var(--m-space-4) var(--m-space-6); background: var(--m-color-bg-surface)" aria-label="${title}"><h3 style="${small}; font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-regular); color: var(--m-color-accent-text)">${title}</h3>${body}</section>`;

const settings = shell(
  'Settings',
  listColumn(`${listHead('Settings', '')}
      ${searchPill('hb-set-search', 'Search settings')}
      <a href="#" class="m-sidebar-link" style="gap: var(--m-space-4); padding-block: var(--m-space-3)"><span class="m-avatar" data-size="lg" aria-hidden="true">ML</span><span class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-lg)">Maya Lindqvist</span><span style="${small}; font-size: var(--m-font-size-md); ${muted}">Back on Monday</span></span></a>
      <ul>
        ${setLink(I.user, 'Profile')}
        ${setLink(I.bell, 'Alerts', true)}
        ${setLink(I.shield, 'Privacy')}
        ${setLink(I.disk, 'Storage and data')}
        ${setLink(I.palette, 'Appearance')}
        ${setLink(I.keyboard, 'Shortcuts')}
        ${setLink(I.help, 'Support')}
      </ul>
      <div style="${hair('block-start')}"></div>
      <ul>${setLink(I.logout, 'Sign out', false, 'danger')}</ul>`),
  `<main class="m-stack" data-gap="0" style="min-block-size: 100vh; background: var(--m-color-bg-sunken)">
      <header class="m-cluster" data-gap="4" style="padding: var(--m-space-3) var(--m-space-4); background: var(--m-color-bg-surface); ${hair()}">
        ${iconBtn(I.back, 'Back')}<h2 style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-medium)">Alerts</h2>
      </header>
      <div class="m-stack" data-gap="2">
        ${group(
          'Messages',
          `${switchRow('hb-s1', 'Alerts for new messages', 'Show a banner and play a sound')}
        <div style="${hair()}"></div>
        ${switchRow('hb-s2', 'Show a preview', 'Include the first line of the message in the banner')}
        <div style="${hair()}"></div>
        ${switchRow('hb-s3', 'Reactions', 'Tell me when someone reacts to my message', false)}`,
        )}
        ${group(
          'Groups',
          `${switchRow('hb-s4', 'Alerts for groups', 'Muted groups stay quiet either way')}
        <div style="${hair()}"></div>
        <div class="m-field" style="padding-block: var(--m-space-4)">
          <label class="m-field-label" for="hb-s5">Sound</label>
          <select class="m-select" id="hb-s5"><option>Ripple</option><option>Bell</option><option>Pebble</option><option>None</option></select>
        </div>`,
        )}
        ${group(
          'Calls',
          `<fieldset class="m-stack" data-gap="3" style="border: 0; padding: var(--m-space-4) 0; margin: 0">
          <legend class="m-sr-only">Ring for</legend>
          <label class="m-cluster" data-gap="3"><input class="m-radio" type="radio" name="hb-ring" checked> Ring for everyone</label>
          <label class="m-cluster" data-gap="3"><input class="m-radio" type="radio" name="hb-ring"> Ring for saved people only</label>
          <label class="m-cluster" data-gap="3"><input class="m-checkbox" type="checkbox" checked> Show missed calls in Messages</label>
        </fieldset>`,
        )}
        <section style="padding: var(--m-space-4) var(--m-space-6); background: var(--m-color-bg-surface)" aria-label="Reset">
          <button type="button" class="m-button" data-variant="ghost" style="color: var(--m-color-danger-fg); padding-inline: 0">${icon(I.trash, 20)} Reset alert settings</button>
        </section>
      </div>
    </main>`,
);

// Empty state: the list column with nothing in it, and the main pane's resting page
const emptyState = shell(
  'Messages',
  listColumn(`${listHead('Messages', `${iconBtn(I.compose, 'New message')}${iconBtn(I.more, 'Menu')}`)}
      ${searchPill('hb-empty-search', 'Search names and messages')}
      ${chips(['Everything', 'New', 'Direct', 'Teams'], 'New')}
      <div class="m-stack" data-gap="3" data-align="center" style="padding: var(--m-space-16) var(--m-space-6); text-align: center">
        <span style="display: grid; place-items: center; inline-size: 4.5rem; block-size: 4.5rem; border-radius: 9999px; background: var(--m-color-bg-sunken); ${muted}">${icon(I.checks, 32)}</span>
        <h2 style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium)">You’re all caught up</h2>
        <p style="${muted}">New messages land here until you’ve read them.</p>
        <button type="button" class="m-button" data-size="sm">See everything</button>
      </div>`),
  `<main class="m-stack" data-gap="0" style="min-block-size: 100vh; background: var(--m-color-bg-sunken); ${hair('block-end')}">
      <div class="m-stack" data-gap="4" data-align="center" style="flex: 1; justify-content: center; padding: var(--m-space-12) var(--m-space-6); text-align: center">
        <span style="display: grid; place-items: center; inline-size: 10rem; block-size: 10rem; border-radius: 9999px; background: var(--m-color-brand-subtle); color: var(--m-color-accent-text)">${icon(I.devices, 72)}</span>
        <h1 style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-regular); margin-block-start: var(--m-space-4)">Pick up where you left off</h1>
        <p style="max-inline-size: 30rem; ${muted}">Open a conversation on the left, or start a new one. Everything you send here also shows on your phone.</p>
        <div class="m-cluster" data-gap="3" data-justify="center" style="margin-block-start: var(--m-space-2)">
          <button type="button" class="m-button" data-variant="primary">${icon(I.compose, 18)} New message</button>
          <button type="button" class="m-button">${icon(I.link, 18)} Invite someone</button>
        </div>
      </div>
      <p class="m-cluster" data-gap="2" data-justify="center" style="padding: var(--m-space-6); ${small}; ${muted}">${icon(I.lock, 14)} Only you and the people you write to can read your messages</p>
    </main>`,
);

// Pricing: the public site: white bar with pill actions, a pale green band, white plan cards on the
// warm off-white, full-width pills, questions below
const feature = (text: string) =>
  `<li class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap"><span style="display: inline-flex; color: var(--m-color-accent-text)">${icon(I.check, 18)}</span>${text}</li>`;

const plan = (
  name: string,
  price: string,
  per: string,
  line: string,
  features: string[],
  cta: string,
  popular = false,
) =>
  `<section class="m-card"${popular ? ' data-variant="outline"' : ''} aria-labelledby="hb-plan-${name.toLowerCase()}" style="--m-card-border: ${popular ? 'var(--m-color-fg-default)' : 'transparent'}; box-shadow: var(--m-shadow-lg)">
        <div class="m-card-body m-stack" data-gap="5" style="padding: var(--m-space-8); block-size: 100%">
          <div class="m-cluster" data-justify="between"><h2 id="hb-plan-${name.toLowerCase()}" style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium)">${name}</h2>${popular ? '<span class="m-badge" data-tone="success">Most picked</span>' : ''}</div>
          <p class="m-stack" data-gap="1"><span style="font-size: var(--m-font-size-4xl); line-height: 1; font-variant-numeric: tabular-nums">${price}</span><span style="${muted}">${per}</span></p>
          <p>${line}</p>
          <ul class="m-stack" data-gap="3" style="padding: 0; list-style: none; flex: 1">${features.map(feature).join('')}</ul>
          <a href="#" class="m-button" data-variant="${popular ? 'primary' : 'secondary'}" style="inline-size: 100%${popular ? '' : '; --m-button-secondary-fg: var(--m-color-fg-default); --m-button-secondary-border: var(--m-color-fg-default)'}">${cta}</a>
        </div>
      </section>`;

const pricing = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  <header class="m-navbar">
    <a class="m-navbar-brand m-cluster" data-gap="2" href="#" style="color: var(--m-color-accent-text)">${icon(I.messages, 26)} Wavelet</a>
    <nav class="m-navbar-nav" aria-label="Site">
      <a class="m-navbar-link" href="#">Teams</a>
      <a class="m-navbar-link" href="#" aria-current="page">Plans</a>
      <a class="m-navbar-link" href="#">Safety</a>
      <a class="m-navbar-link" href="#">Stories</a>
      <a class="m-navbar-link" href="#">Support ${icon(I.external, 14)}</a>
    </nav>
    <div class="m-navbar-actions">
      <a class="m-button" data-variant="secondary" href="#" style="--m-button-secondary-fg: var(--m-color-fg-default); --m-button-secondary-border: var(--m-color-fg-default)">Sign in ${icon(I.right, 16)}</a>
      <a class="m-button" data-variant="primary" href="#" style="--m-button-primary-bg: var(--m-color-brand-default); border: var(--m-border-width-thin) solid var(--m-color-fg-default)">Get the app ${icon(I.download, 16)}</a>
    </div>
  </header>
  <main>
    <section style="padding: var(--m-space-16) 0 var(--m-space-12); background: var(--m-color-brand-subtle)" aria-labelledby="hb-pricing">
      <div class="m-container m-stack" data-gap="5">
        <p style="font-size: var(--m-font-size-sm)">Wavelet for teams</p>
        <h1 id="hb-pricing" style="max-inline-size: 40rem; font-size: var(--m-font-size-4xl); font-weight: var(--m-font-weight-regular); line-height: var(--m-font-leading-tight)">Plans that grow with your crew</h1>
        <p style="max-inline-size: 34rem; font-size: var(--m-font-size-lg)">Talk to customers and each other in one place. Pay per person, cancel when you like.</p>
        <label class="m-cluster" data-gap="3" style="margin-block-start: var(--m-space-2)"><input class="m-switch" type="checkbox" role="switch" checked> Pay yearly and save two months</label>
      </div>
    </section>
    <section style="padding: var(--m-space-12) 0 var(--m-space-16); background: var(--m-color-bg-sunken)" aria-label="Plans">
      <div class="m-container m-grid" style="--m-layout-grid-min: 17rem; --m-layout-grid-gap: var(--m-space-6)">
        ${plan('Starter', '$0', 'for up to 5 people', 'For a small group getting organised.', ['Unlimited messages and groups', 'Voice and video calls', 'One shared inbox'], 'Start free')}
        ${plan('Crew', '$4', 'per person a month, billed yearly', 'For teams that answer customers.', ['Everything in Starter', 'Labels, quick replies and away messages', 'Five shared inboxes', 'Chat history search for a year'], 'Try Crew free for 14 days', true)}
        ${plan('Fleet', '$9', 'per person a month, billed yearly', 'For larger teams with admins.', ['Everything in Crew', 'Admin roles and sign-in rules', 'Unlimited shared inboxes', 'Priority support'], 'Talk to us')}
      </div>
    </section>
    <section class="m-container m-stack" data-gap="4" style="--m-layout-container-max-lg: 45rem; padding-block: var(--m-space-16)" aria-labelledby="hb-faq">
      <h2 id="hb-faq" style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-regular)">Questions</h2>
      <div class="m-accordion">
        <details class="m-accordion-item" name="hb-faq" open><summary>Who counts as a person on the plan?</summary><div class="m-accordion-content">Anyone on your team who signs in to a shared inbox. Customers you talk to are always free.</div></details>
        <details class="m-accordion-item" name="hb-faq"><summary>Can I switch plans later?</summary><div class="m-accordion-content">Yes. Moving up takes effect straight away; moving down applies from your next bill.</div></details>
        <details class="m-accordion-item" name="hb-faq"><summary>Is my team’s history kept if I cancel?</summary><div class="m-accordion-content">Everyone keeps their own conversations. Shared inboxes become read-only for 90 days, then close.</div></details>
      </div>
    </section>
  </main>
</div>`;

// Errors: a field, a banner in the list, a message that didn't send, a snackbar, and full pages
const errorPage = (code: string, ic: string, title: string, body: string, actions: string) =>
  `<section class="m-stack" data-gap="3" data-align="center" style="padding: var(--m-space-12) var(--m-space-6); background: var(--m-color-bg-surface); border-radius: var(--m-radius-lg); text-align: center" aria-labelledby="hb-err-${code}">
        <span style="display: grid; place-items: center; inline-size: 5rem; block-size: 5rem; border-radius: 9999px; background: var(--m-color-bg-sunken); ${muted}">${icon(ic, 36)}</span>
        <span style="${small}; ${muted}; font-family: var(--m-font-family-mono)">${code}</span>
        <h2 id="hb-err-${code}" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-regular)">${title}</h2>
        <p style="max-inline-size: 28rem; ${muted}">${body}</p>
        <div class="m-cluster" data-gap="3" data-justify="center" style="margin-block-start: var(--m-space-2)">${actions}</div>
      </section>`;

const errors = `<main style="min-block-size: 100vh; background: var(--m-color-bg-sunken); padding-block: var(--m-space-10)">
  <div class="m-container m-stack" data-gap="8">
    <h1 style="${panelTitle}">When something goes wrong</h1>
    <div class="m-grid" style="--m-layout-grid-min: 20rem; --m-layout-grid-gap: var(--m-space-6); align-items: start">
      <section class="m-stack" data-gap="4" style="padding: var(--m-space-6); background: var(--m-color-bg-surface); border-radius: var(--m-radius-lg)" aria-labelledby="hb-err-form">
        <h2 id="hb-err-form" style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium)">New group</h2>
        <div class="m-alert" data-tone="danger" role="alert">
          <span class="m-alert-icon">${icon(I.alert, 20)}</span>
          <div class="m-alert-content"><div class="m-alert-title">The group wasn’t created</div><div class="m-alert-body">Fix the 2 things below and try again.</div></div>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="hb-err-name">Group name</label>
          <input class="m-input" id="hb-err-name" value="" aria-invalid="true" aria-describedby="hb-err-name-e">
          <p class="m-field-error" id="hb-err-name-e">Give the group a name, up to 100 characters.</p>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="hb-err-who">Add people</label>
          <input class="m-input" id="hb-err-who" value="+44 7700 9004" aria-invalid="true" aria-describedby="hb-err-who-e">
          <p class="m-field-error" id="hb-err-who-e">This number is too short. Check it has the country code.</p>
        </div>
        <div class="m-cluster" data-justify="end" data-gap="3"><button type="button" class="m-button">Cancel</button><button type="submit" class="m-button" data-variant="primary">Create group</button></div>
      </section>
      <div class="m-stack" data-gap="6">
        <section class="m-stack" data-gap="3" aria-label="A banner in the list">
          <div class="m-alert" data-tone="warning" role="status">
            <span class="m-alert-icon">${icon(I.wifiOff, 20)}</span>
            <div class="m-alert-content"><div class="m-alert-title">You’re offline</div><div class="m-alert-body">Messages will send when you’re back online. <a href="#" style="color: inherit; font-weight: var(--m-font-weight-medium)">Retry now</a></div></div>
          </div>
        </section>
        <section style="padding: var(--m-space-4); background: var(--m-color-bg-sunken); border-radius: var(--m-radius-lg)" aria-label="A message that didn’t send">
          <div class="m-chat" role="log" aria-label="Messages" style="--m-chat-user-border: var(--m-chat-user-bg)">
            ${bubble('out', 'Running ten minutes late, save me a seat', '19:04', { first: true })}
            <p class="m-cluster" data-gap="1" data-justify="end" style="${small}; color: var(--m-color-danger-fg)">${icon(I.alert, 16)} Not sent. <a href="#" style="color: inherit; font-weight: var(--m-font-weight-medium)">Tap to try again</a></p>
          </div>
        </section>
        <div class="m-toast-region" data-static aria-live="polite" style="position: static">
          <div class="m-toast" role="alert" style="inline-size: 100%"><div class="m-toast-content"><p class="m-toast-title">Couldn’t send the photo</p><p class="m-toast-body">The file is over 100 MB.</p></div><button type="button" class="m-button" data-variant="ghost" data-size="sm" style="color: var(--m-color-brand-default)">Choose another</button></div>
        </div>
      </div>
    </div>
    <div class="m-grid" style="--m-layout-grid-min: 18rem; --m-layout-grid-gap: var(--m-space-6)">
      ${errorPage('404', I.search, 'This chat isn’t here', 'It may have been deleted, or the link is out of date.', `<a class="m-button" data-variant="primary" href="#">${icon(I.home, 18)} Back to messages</a>`)}
      ${errorPage('500', I.alert, 'Something went wrong on our side', 'Your messages are safe and nothing was lost. Try again in a moment.', `<button type="button" class="m-button" data-variant="primary">${icon(I.refresh, 18)} Try again</button><button type="button" class="m-button">Get help</button>`)}
      ${errorPage('403', I.lock, 'You can’t open this group', 'Only members can read it. Ask an admin to add you.', `<button type="button" class="m-button" data-variant="primary">Ask to join</button><a class="m-button" href="#">Go back</a>`)}
    </div>
  </div>
</main>`;

export const harborRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Messages (home)',
    description:
      'The home screen of a messenger: an icon rail, the conversation list with a pill search, filter chips and unread counts, and the open conversation with tailed bubbles, ticks and a floating composer.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'People grouped by letter in the list column; one person’s details as white groups on the warm grey: a large avatar, call tiles, about, files, settings rows and red actions last.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'The public start page: warm off-white, white cards with an ink outline and 24px corners, numbered steps joined by a line, and the form beside them.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'Sections with icons in the list column, the open one as white groups with green group titles, switch rows with a hint, and a red reset at the end.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'An empty filter in the list column, and the main pane at rest: a large round tinted icon, a light heading, one sentence, two pills and the privacy line.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The public site: a white bar with pill actions, a pale green band, white plan cards on the warm grey with the popular one outlined in ink, and questions below.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'A field error, a summary banner, the offline banner, a message that didn’t send, a snackbar, and full pages for 404, 500 and no access.',
    html: errors,
  },
];
