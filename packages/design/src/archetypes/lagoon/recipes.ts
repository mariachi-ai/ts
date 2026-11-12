import type { ArchetypeRecipe } from '../types';

/*
 * Lagoon's seven page shapes: framework-free HTML using only @mariachi/design classes and tokens (no
 * colour literals), with sample data from an invented messenger, "Natter". They follow the
 * language's real screen patterns, translated from a desktop window to a web layout: a light grey
 * sidebar with a capsule search, a grid of pinned circles and rows of round avatars, names, times
 * and two-line previews; the thread on white with round glass buttons at its top corners, the
 * person's circle over a name capsule, centred timestamps, grouped bubbles (blue for you, grey for
 * them) with a tail on the last of each run, reactions on their top corners, a quiet receipt under
 * the last one you sent, and a capsule composer. People, groups, messages, sections and their order
 * are invented.
 */

// Lucide icons, outlined, 1.75px stroke (the reference's regular-weight symbols)
const icon = (paths: string, size = 18, stroke = 1.75) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  filter: '<path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/>',
  compose:
    '<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>',
  panel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
  phone:
    '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
  video:
    '<path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 11"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
  wave: '<path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/>',
  up: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  bellOff:
    '<path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5"/><path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="m2 2 20 20"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.7 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/>',
  palette:
    '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1a1.6 1.6 0 0 1 1.6-1.7h2c3.1 0 5.6-2.5 5.6-5.6C22 6 17.5 2 12 2z"/>',
  laptop:
    '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>',
  disk: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  image:
    '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  wifiOff:
    '<path d="M12 20h.01"/><path d="M8.5 16.4a5 5 0 0 1 7 0"/><path d="M2 8.8a15 15 0 0 1 4.2-2.7"/><path d="M22 8.8a15 15 0 0 0-11.3-3.7"/><path d="M5 12.9a10 10 0 0 1 5.2-2.7"/><path d="M19 12.9a10 10 0 0 0-2.1-1.6"/><path d="m2 2 20 20"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  waves:
    '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  sparkle:
    '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
};

const muted = 'color: var(--m-color-fg-muted)';
const xs = 'font-size: var(--m-font-size-xs)';
const sm = 'font-size: var(--m-font-size-sm)';
const semi = 'font-weight: var(--m-font-weight-semibold)';
const bold = 'font-weight: var(--m-font-weight-bold)';
const clip = 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap';
const hair = (side = 'block-end') => `border-${side}: var(--m-border-width-thin) solid var(--m-color-border-default)`;

// Avatars are content: tinted circles with initials, never photos
type Tone = 'info' | 'success' | 'warning' | 'danger' | 'grey';
const tint = (t: Tone, v = '--m-avatar') =>
  t === 'grey' ? '' : `${v}-bg: var(--m-color-${t}-bg); ${v}-fg: var(--m-color-${t}-fg)`;
const face = (initials: string, t: Tone, size: 'sm' | 'md' | 'lg' = 'md', extra = '') =>
  `<span class="m-avatar" data-size="${size}" aria-hidden="true" style="${tint(t)}${extra ? `; ${extra}` : ''}">${initials}</span>`;

// Round glass buttons (drawn opaque): a raised white circle with a hairline and a soft drop
const glass = (ic: string, label: string, size = 18) =>
  `<button type="button" class="m-button" data-variant="secondary" data-icon-only aria-label="${label}" style="--m-button-secondary-bg: var(--m-color-bg-raised); inline-size: 2.25rem; block-size: 2.25rem; padding: 0; box-shadow: var(--m-shadow-sm)">${icon(ic, size)}</button>`;

// The mark: a plain blue tile with an unrelated glyph, then the wordmark
const mark = (size = 1.75) =>
  `<span style="display: grid; flex: none; place-items: center; inline-size: ${size}rem; block-size: ${size}rem; border-radius: ${size > 2 ? 'var(--m-radius-lg)' : 'var(--m-radius-sm)'}; background: var(--m-color-accent-default); color: var(--m-color-accent-fg)">${icon(I.waves, Math.round(size * 10), 2)}</span>`;
const brand = `<span class="m-cluster" data-gap="2" style="flex-wrap: nowrap; ${bold}; font-size: var(--m-font-size-lg); letter-spacing: var(--m-font-tracking-tight)">${mark()} Natter</span>`;

const searchField = (id: string, placeholder: string, value = '') => `<div style="position: relative">
        <label class="m-sr-only" for="${id}">Search</label>
        <span style="position: absolute; inset-inline-start: var(--m-space-3); inset-block-start: 50%; translate: 0 -50%; display: inline-flex; ${muted}">${icon(I.search, 16)}</span>
        <input class="m-input" id="${id}" type="search" placeholder="${placeholder}"${value ? ` value="${value}"` : ''} style="block-size: 2.25rem; border-radius: 9999px; border-color: transparent; background: var(--m-color-bg-raised); box-shadow: var(--m-shadow-sm); padding-inline-start: 2.25rem">
      </div>`;

// A segmented control: a grey track with the current segment raised in white
const segments = (labels: string[], current: string, name: string) =>
  `<div class="m-tabs" data-variant="pill" style="--m-tabs-height: 1.75rem; --m-tabs-font-size: var(--m-font-size-sm)"><div class="m-tab-list" role="tablist" aria-label="${name}" style="display: flex; inline-size: 100%">
        ${labels.map((l) => `<button type="button" class="m-tab" role="tab" aria-selected="${l === current}"${l === current ? '' : ' tabindex="-1"'} style="flex: 1">${l}</button>`).join('')}
      </div></div>`;

// A pinned circle: a large avatar over its name; the current one sits in a blue rounded square
const pinned = (initials: string, name: string, t: Tone, current = false) =>
  `<li><a href="#"${current ? ' aria-current="page"' : ''} class="m-stack" data-gap="1" data-align="center" style="padding: var(--m-space-2) var(--m-space-1); border-radius: var(--m-radius-md); text-decoration: none; ${current ? 'background: var(--m-color-accent-default); color: var(--m-color-accent-fg)' : 'color: var(--m-color-fg-default)'}">${face(initials, t, 'lg', 'inline-size: 4rem; block-size: 4rem; font-size: var(--m-font-size-xl); box-shadow: var(--m-shadow-sm)')}<span style="${xs}; max-inline-size: 100%; ${clip}">${name}</span></a></li>`;
const pins = (items: [string, string, Tone, boolean?][]) =>
  `<ul aria-label="Pinned" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--m-space-1); padding: 0; list-style: none">${items.map(([i, n, t, c]) => pinned(i, n, t, c)).join('')}</ul>`;

// A conversation row: unread dot, 40px avatar, the name and time, then a two-line preview; an inset
// separator runs from the text to the edge
const row = (
  initials: string,
  t: Tone,
  name: string,
  time: string,
  preview: string,
  o: { unread?: boolean; current?: boolean; muted?: boolean } = {},
) => {
  const quiet = o.current ? 'color: inherit' : muted;
  return `<li><a class="m-sidebar-link" href="#"${o.current ? ' aria-current="page"' : ''} style="align-items: start; gap: var(--m-space-2); padding-inline-start: 0">
          <span aria-hidden="true" style="flex: none; inline-size: 0.5rem; block-size: 0.5rem; margin: 1rem 0 0 var(--m-space-1); border-radius: 9999px; background: ${o.unread ? 'var(--m-color-accent-default)' : 'transparent'}"></span>
          ${face(initials, t)}
          <span class="m-stack" data-gap="0" style="flex: 1; min-inline-size: 0; padding-block: 1px var(--m-space-1)">
            <span class="m-cluster" data-justify="between" data-gap="2" style="flex-wrap: nowrap"><span style="${bold}; ${clip}">${name}</span><span class="m-cluster" data-gap="1" style="flex: none; flex-wrap: nowrap; ${xs}; ${quiet}">${o.muted ? icon(I.bellOff, 12) : ''}${time}</span></span>
            <span style="${quiet}; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden">${preview}${o.unread ? '<span class="m-sr-only"> (unread)</span>' : ''}</span>
          </span>
        </a></li>`;
};
const sep =
  '<li aria-hidden="true" style="margin-inline: 3.75rem var(--m-space-2); border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)"></li>';
const rows = (items: string[]) => `<ul style="padding: 0; list-style: none" aria-label="Chats">${items.join(sep)}</ul>`;

const sidebarTop = (actions: string) =>
  `<div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding: var(--m-space-1) var(--m-space-1) 0">${brand}<div class="m-cluster" data-gap="2">${actions}</div></div>`;

const sidebar = (label: string, body: string) =>
  `<aside class="m-sidebar" aria-label="${label}" style="min-block-size: 100vh; --m-sidebar-section-gap: var(--m-space-3)">
      ${body}
    </aside>`;

// The window: the sidebar beside the main pane
const shell = (side: string, main: string) =>
  `<div class="m-split" style="--m-layout-split-gap: 0; min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  ${side}
  ${main}
</div>`;

// ---- The thread -----------------------------------------------------------------------------------

// The tail: a small hook at the bottom outer corner of the last bubble in a run
const tail = (role: 'in' | 'out') =>
  `<svg width="20" height="22" viewBox="0 0 20 22" aria-hidden="true" style="position: absolute; inset-block-end: -2px; ${role === 'out' ? 'inset-inline-end: -7px' : 'inset-inline-start: -7px; scale: -1 1'}; fill: var(--m-chat-${role === 'out' ? 'user' : 'assistant'}-bg)"><path d="M0 0h13v12c0 4.5 2.5 8 7 9.5-5 .9-10-.2-13-2.5-2 .8-4.5 1-7 1Z"/></svg>`;

// A reaction on a bubble's top corner: a small round bubble with a trail of two dots
const reaction = (emoji: string, side: 'in' | 'out', mine = false) => {
  const bg = mine ? 'var(--m-chat-user-bg)' : 'var(--m-chat-assistant-bg)';
  const pos = side === 'in' ? 'inset-inline-end: -1.25rem' : 'inset-inline-start: -1.25rem';
  const dot = side === 'in' ? 'inset-inline-end' : 'inset-inline-start';
  return `<span aria-hidden="true" style="position: absolute; inset-block-start: -1.125rem; ${pos}; display: grid; place-items: center; inline-size: 1.75rem; block-size: 1.75rem; border-radius: 9999px; background: ${bg}; box-shadow: 0 0 0 2px var(--m-color-bg-canvas); ${sm}; line-height: 1">${emoji}<span style="position: absolute; inset-block-end: -3px; ${dot}: 1px; inline-size: 0.5rem; block-size: 0.5rem; border-radius: 9999px; background: ${bg}"></span><span style="position: absolute; inset-block-end: -8px; ${dot}: -3px; inline-size: 0.25rem; block-size: 0.25rem; border-radius: 9999px; background: ${bg}"></span></span>`;
};

const bubble = (
  role: 'in' | 'out',
  text: string,
  o: { last?: boolean; who?: string; avatar?: [string, Tone] | 'space'; react?: [string, boolean?]; label?: string } = {},
) => {
  const av =
    o.avatar === 'space'
      ? '<span class="m-message-avatar" aria-hidden="true" style="visibility: hidden"></span>'
      : o.avatar
        ? `<span class="m-message-avatar" aria-hidden="true" style="align-self: end; ${tint(o.avatar[1], '--m-chat-assistant-avatar')}">${o.avatar[0]}</span>`
        : '';
  const gapTop = o.react ? 'margin-block-start: var(--m-space-5)' : o.who ? 'margin-block-start: var(--m-space-2)' : '';
  const react = o.react ? `<span class="m-sr-only">Reaction ${o.react[0]}. </span>` : '';
  return `<article class="m-message" data-role="${role === 'out' ? 'user' : 'assistant'}"${gapTop ? ` style="${gapTop}"` : ''}>
            ${av}${o.who ? `<span class="m-message-meta" style="padding-inline-start: var(--m-space-3)">${o.who}</span>` : ''}
            <div class="m-message-body" style="position: relative">${o.react ? reaction(o.react[0], role, o.react[1]) : ''}${react}${text}${o.last ? tail(role) : ''}</div>
          </article>`;
};

// Timestamps sit between runs, centred: the day in semibold, the time regular
const stamp = (day: string, time: string) =>
  `<article class="m-message" data-role="system" style="margin-block: var(--m-space-4) var(--m-space-2)"><div class="m-message-body"><span style="${semi}">${day}</span> ${time}</div></article>`;

// The receipt under the last message you sent
const receipt = (what: string, when = '') =>
  `<p style="align-self: end; margin-inline-end: var(--m-space-1); ${xs}; ${muted}"><span style="${semi}">${what}</span>${when ? ` ${when}` : ''}</p>`;

const typing = `<article class="m-message" data-role="assistant" style="margin-block-start: var(--m-space-2)">
            <span class="m-message-avatar" aria-hidden="true" style="align-self: end; ${tint('warning', '--m-chat-assistant-avatar')}">AM</span>
            <div class="m-message-body" style="position: relative; display: flex; gap: 4px; padding-block: 12px"><span class="m-sr-only">Arjun is typing</span>${[0, 1, 2].map(() => '<span aria-hidden="true" style="inline-size: 0.5rem; block-size: 0.5rem; border-radius: 9999px; background: var(--m-color-fg-subtle)"></span>').join('')}${tail('in')}</div>
          </article>`;

// The thread's top: round glass buttons at either corner, the circle over a name capsule in the middle
const threadTop = (initials: string, t: Tone, name: string, left: string, right: string) =>
  `<header class="m-cluster" data-justify="between" data-align="start" style="flex-wrap: nowrap; padding: var(--m-space-3) var(--m-space-4) var(--m-space-2)">
        <div class="m-cluster" data-gap="2">${left}</div>
        <a href="#" class="m-stack" data-gap="0" data-align="center" style="color: inherit; text-decoration: none">${face(initials, t, 'md', 'inline-size: 2.75rem; block-size: 2.75rem; box-shadow: var(--m-shadow-sm)')}<span class="m-cluster" data-gap="1" style="flex-wrap: nowrap; margin-block-start: -0.375rem; padding: 2px var(--m-space-3); border-radius: 9999px; background: var(--m-color-bg-raised); box-shadow: var(--m-shadow-sm); ${sm}; ${semi}">${name}<span style="display: inline-flex; color: var(--m-color-fg-subtle)">${icon(I.right, 12, 2.5)}</span></span></a>
        <div class="m-cluster" data-gap="2">${right}</div>
      </header>`;

// The composer: a round add button, the capsule field with the voice glyph, a round emoji button
const composer = (id: string, placeholder: string, value = '') =>
  `<div class="m-cluster" data-gap="2" style="flex-wrap: nowrap; align-items: end; padding: var(--m-space-2) var(--m-space-4) var(--m-space-4)">
        ${glass(I.plus, 'Add a photo, file or place')}
        <form class="m-composer" style="flex: 1; flex-direction: row; align-items: center">
          <label class="m-sr-only" for="${id}">Message</label>
          <textarea class="m-composer-input" id="${id}" rows="1" placeholder="${placeholder}" style="flex: 1; min-block-size: 1.375rem">${value}</textarea>
          ${
            value
              ? `<button type="submit" class="m-button" data-variant="primary" data-icon-only aria-label="Send" style="inline-size: 1.75rem; block-size: 1.75rem; padding: 0">${icon(I.up, 16, 2.5)}</button>`
              : `<button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Record a voice message" style="inline-size: 1.75rem; block-size: 1.75rem; padding: 0; color: var(--m-color-fg-subtle)">${icon(I.wave, 18)}</button>`
          }
        </form>
        ${glass(I.smile, 'Emoji and stickers')}
      </div>`;

// ---- Dashboard: the window --------------------------------------------------------------------------

const homeList = [
  row('NH', 'success', 'Noor Haddad', '9:41 AM', 'Thursday works. I’ll book the table by the window', { unread: true }),
  row('DV', 'grey', 'Dmitri Volkov', '9:18 AM', 'Photo'),
  row('F4', 'warning', 'Flat 4', '8:55 AM', 'Ruth: The plumber comes between ten and twelve, can someone be in?', {
    unread: true,
    muted: true,
  }),
  row('AE', 'danger', 'Amara Eze', 'Yesterday', 'Thanks for lending the tent! It survived the storm'),
  row('GO', 'info', 'Gus Okafor', 'Yesterday', 'You: See you at the station'),
  row('RA', 'success', 'Ruth Abernathy', 'Tuesday', 'Did the parcel ever turn up?'),
];

const homeSidebar = sidebar(
  'Conversations',
  `${sidebarTop(`${glass(I.filter, 'Show only')}${glass(I.compose, 'New chat')}`)}
      ${searchField('lg-search', 'Search')}
      ${segments(['Chats', 'Plans', 'Photos'], 'Chats', 'Sections')}
      ${pins([
        ['MD', 'Mum & Dad', 'danger'],
        ['WL', 'Wen', 'info'],
        ['SQ', 'Saoirse', 'success'],
        ['RC', 'Rowing crew', 'info', true],
        ['BC', 'Book club', 'warning'],
        ['FB', 'Felix', 'grey'],
      ])}
      ${rows(homeList)}`,
);

const thread = `<main class="m-stack" data-gap="0" style="min-block-size: 100vh; background: var(--m-color-bg-canvas)">
      ${threadTop('RC', 'info', 'Rowing crew', glass(I.panel, 'Hide the sidebar'), `${glass(I.video, 'Video call')}${glass(I.info, 'Details')}`)}
      <div style="flex: 1; padding: 0 clamp(var(--m-space-4), 4%, var(--m-space-10))">
        <div class="m-chat" role="log" aria-label="Messages in Rowing crew">
          ${stamp('Today', '7:02 AM')}
          ${bubble('in', 'The river was flat as glass this morning', { who: 'Felix Brandt', avatar: 'space' })}
          ${bubble('in', 'Who’s in for the 6:30 row tomorrow?', { avatar: ['FB', 'grey'], last: true })}
          ${bubble('in', 'Me! I’ll bring the speaker for the cox', { who: 'Saoirse Quinn', avatar: ['SQ', 'success'], last: true, react: ['❤️', true] })}
          ${bubble('out', 'Count me in')}
          ${bubble('out', 'Can someone look at the rigger on boat three? It was loose on Sunday', { last: true, react: ['👍'] })}
          ${stamp('Today', '9:40 AM')}
          ${bubble('in', 'Tightened it last night, it’s solid now 🔧', { who: 'Arjun Mehta', avatar: ['AM', 'warning'], last: true })}
          ${bubble('out', 'Legend. See you all at the boathouse', { last: true })}
          ${receipt('Delivered')}
          ${typing}
        </div>
      </div>
      ${composer('lg-composer', 'Message')}
    </main>`;

const dashboard = shell(homeSidebar, thread);

// ---- List and detail: a group's details beside the list ----------------------------------------------

const roundAction = (ic: string, label: string) =>
  `<a href="#" aria-label="${label}" style="display: grid; place-items: center; inline-size: 2.75rem; block-size: 2.75rem; border-radius: 9999px; background: var(--m-button-secondary-bg); color: var(--m-color-fg-default)">${icon(ic, 20, 2)}</a>`;

const member = (initials: string, name: string, t: Tone) =>
  `<li class="m-stack" data-gap="1" data-align="center" style="${xs}">${face(initials, t, 'lg')}<span>${name}</span></li>`;

const groupRow = (label: string, end: string, tone = '') =>
  `<li class="m-cluster" data-justify="between" data-gap="3" style="flex-wrap: nowrap; min-block-size: 2.75rem; padding: var(--m-space-2) var(--m-space-4)${tone ? `; color: var(--m-color-${tone})` : ''}">${label}${end}</li>`;
const grouped = (items: string[], label: string) =>
  `<ul class="m-card" aria-label="${label}" style="gap: 0; padding: 0; list-style: none">${items.join(`<li aria-hidden="true" style="margin-inline-start: var(--m-space-4); ${hair('block-start')}"></li>`)}</ul>`;
const chevron = (value = '') =>
  `<span class="m-cluster" data-gap="1" style="flex-wrap: nowrap; ${muted}">${value}<span style="display: inline-flex; color: var(--m-color-fg-subtle)">${icon(I.right, 14, 2.25)}</span></span>`;
const sw = (id: string, label: string, on = true) =>
  `<input class="m-switch" type="checkbox" role="switch" id="${id}" aria-label="${label}"${on ? ' checked' : ''}>`;

const detailList = [
  row('NH', 'success', 'Noor Haddad', '9:41 AM', 'Thursday works. I’ll book the table by the window'),
  row('BC', 'warning', 'Book club', '9:02 AM', 'Gus: Chapter twelve has me in pieces, no spoilers please', { current: true }),
  row('DV', 'grey', 'Dmitri Volkov', '8:30 AM', 'Photo'),
  row('AE', 'danger', 'Amara Eze', 'Yesterday', 'Thanks for lending the tent! It survived the storm'),
  row('GO', 'info', 'Gus Okafor', 'Yesterday', 'You: See you at the station'),
  row('RA', 'success', 'Ruth Abernathy', 'Tuesday', 'Did the parcel ever turn up?'),
];

const listDetail = shell(
  sidebar(
    'Conversations',
    `${sidebarTop(`${glass(I.filter, 'Show only')}${glass(I.compose, 'New chat')}`)}
      ${searchField('lg-ld-search', 'Search')}
      ${rows(detailList)}`,
  ),
  `<main style="min-block-size: 100vh; background: var(--m-color-bg-sunken)">
      <div class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-4)">
        ${glass(I.close, 'Close details')}
        <button type="button" class="m-button" data-variant="secondary" style="--m-button-secondary-bg: var(--m-color-bg-raised); box-shadow: var(--m-shadow-sm)">Edit</button>
      </div>
      <div class="m-stack" data-gap="5" style="max-inline-size: 30rem; margin-inline: auto; padding: 0 var(--m-space-4) var(--m-space-10)">
        <section class="m-stack" data-gap="3" data-align="center" aria-labelledby="lg-group" style="text-align: center">
          ${face('BC', 'warning', 'lg', 'inline-size: 5.5rem; block-size: 5.5rem; font-size: var(--m-font-size-3xl)')}
          <h1 id="lg-group" style="font-size: var(--m-font-size-3xl); ${bold}; letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)">Book club</h1>
          <p style="${sm}; ${muted}">6 people · reading together since March</p>
          <div class="m-cluster" data-gap="4" data-justify="center" style="margin-block-start: var(--m-space-1)">${roundAction(I.phone, 'Call')}${roundAction(I.video, 'Video')}${roundAction(I.bellOff, 'Mute')}${roundAction(I.link, 'Invite')}</div>
        </section>
        <div style="align-self: center; min-inline-size: 16rem">${segments(['Members', 'Photos', 'Links'], 'Members', 'Group details')}</div>
        <ul class="m-grid" aria-label="Members" style="--m-layout-grid-min: 4.25rem; --m-layout-grid-gap: var(--m-space-3); padding: 0; list-style: none">
          ${member('GO', 'Gus', 'info')}
          ${member('NH', 'Noor', 'success')}
          ${member('RA', 'Ruth', 'danger')}
          ${member('WL', 'Wen', 'info')}
          ${member('DV', 'Dmitri', 'grey')}
          <li class="m-stack" data-gap="1" data-align="center" style="${xs}"><a href="#" aria-label="Add someone" style="display: grid; place-items: center; inline-size: 3.5rem; block-size: 3.5rem; border-radius: 9999px; background: var(--m-button-secondary-bg); color: var(--m-color-fg-default)">${icon(I.plus, 22)}</a><span>Add</span></li>
        </ul>
        ${grouped(
          [
            groupRow('<a href="#" style="color: var(--m-color-accent-text); text-decoration: none">Copy the invite link</a>', ''),
            groupRow('<a href="#" style="color: var(--m-color-accent-text); text-decoration: none">Add the next meeting to my calendar</a>', ''),
          ],
          'Links',
        )}
        <div class="m-stack" data-gap="2">
          ${grouped(
            [
              groupRow('<label for="lg-ld-mute">Mute until tomorrow</label>', sw('lg-ld-mute', 'Mute until tomorrow', false)),
              groupRow('<label for="lg-ld-mentions">Only alert me when I’m mentioned</label>', sw('lg-ld-mentions', 'Only alert me when I’m mentioned')),
              groupRow('<span>Shared photos</span>', chevron('214')),
            ],
            'Alerts and media',
          )}
          <p style="padding-inline: var(--m-space-4); ${xs}; ${muted}">Muted chats stay in your list without banners or sounds.</p>
        </div>
        ${grouped([groupRow('<button type="button" style="all: unset; cursor: pointer">Leave this group</button>', '', 'danger-fg')], 'Leave')}
      </div>
    </main>`,
);

// ---- Onboarding: a centred welcome on the grouped grey ----------------------------------------------

const feature = (ic: string, title: string, body: string) =>
  `<li class="m-cluster" data-gap="4" data-align="start" style="flex-wrap: nowrap"><span style="flex: none; display: inline-flex; color: var(--m-color-accent-default)">${icon(ic, 30)}</span><span class="m-stack" data-gap="0"><span style="${semi}">${title}</span><span style="${muted}">${body}</span></span></li>`;

const onboarding = `<main style="min-block-size: 100vh; padding: var(--m-space-12) var(--m-space-4); background: var(--m-color-bg-sunken)">
  <div class="m-stack" data-gap="8" style="max-inline-size: 30rem; margin-inline: auto">
    <section class="m-stack" data-gap="4" data-align="center" style="text-align: center" aria-labelledby="lg-ob-title">
      ${mark(4.5)}
      <h1 id="lg-ob-title" style="font-size: var(--m-font-size-4xl); ${bold}; letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)">Say hello to Natter</h1>
      <p style="font-size: var(--m-font-size-lg); ${muted}">Three things to know before your first chat.</p>
    </section>
    <ul class="m-stack" data-gap="5" style="padding: 0 var(--m-space-2); list-style: none">
      ${feature(I.users, 'Friends and groups in one list', 'Pin the people you talk to most; they stay at the top as circles.')}
      ${feature(I.lock, 'Private by default', 'Only the people in a chat can read it, on any of your devices.')}
      ${feature(I.sparkle, 'React without typing', 'Press and hold any message to answer with a heart or a thumbs-up.')}
    </ul>
    <form class="m-stack" data-gap="2" aria-labelledby="lg-ob-profile">
      <h2 id="lg-ob-profile" style="padding-inline: var(--m-space-4); ${sm}; ${muted}; font-weight: var(--m-font-weight-medium)">Your name</h2>
      <div class="m-card" style="padding: var(--m-space-4)">
        <div class="m-cluster" data-gap="4" style="flex-wrap: nowrap">
          ${face('CV', 'info', 'lg')}
          <div class="m-stack" data-gap="2" style="flex: 1">
            <label class="m-sr-only" for="lg-ob-first">First name</label>
            <input class="m-input" id="lg-ob-first" value="Clara" autocomplete="given-name">
            <label class="m-sr-only" for="lg-ob-last">Last name</label>
            <input class="m-input" id="lg-ob-last" placeholder="Last name" autocomplete="family-name">
          </div>
        </div>
      </div>
      <p style="padding-inline: var(--m-space-4); ${xs}; ${muted}">People you message see your name and initials. You can add a picture later.</p>
    </form>
    <div class="m-stack" data-gap="3" data-align="center">
      <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Continue</button>
      <a href="#" style="color: var(--m-color-accent-text); text-decoration: none">Set up later</a>
      <span class="m-cluster" data-gap="2" role="img" aria-label="Step 1 of 3" style="margin-block-start: var(--m-space-2)"><span style="inline-size: 0.5rem; block-size: 0.5rem; border-radius: 9999px; background: var(--m-color-fg-default)"></span><span style="inline-size: 0.5rem; block-size: 0.5rem; border-radius: 9999px; background: var(--m-color-border-strong)"></span><span style="inline-size: 0.5rem; block-size: 0.5rem; border-radius: 9999px; background: var(--m-color-border-strong)"></span></span>
    </div>
  </div>
</main>`;

// ---- Settings: sections with coloured tiles; the open one as grouped cards --------------------------

type TileTone = 'accent' | 'danger' | 'success' | 'warning' | 'grey';
const tile = (ic: string, tone: TileTone) => {
  const bg =
    tone === 'grey'
      ? 'var(--m-color-fg-muted)'
      : tone === 'accent'
        ? 'var(--m-color-accent-default)'
        : `var(--m-color-${tone}-solid)`;
  const fg =
    tone === 'grey'
      ? 'var(--m-color-fg-inverse)'
      : tone === 'accent'
        ? 'var(--m-color-accent-fg)'
        : `var(--m-color-${tone}-on-solid)`;
  return `<span aria-hidden="true" style="flex: none; display: grid; place-items: center; inline-size: 1.5rem; block-size: 1.5rem; border-radius: 7px; background: ${bg}; color: ${fg}">${icon(ic, 15, 2)}</span>`;
};
const section = (ic: string, tone: TileTone, label: string, current = false) =>
  `<li><a class="m-sidebar-link" href="#"${current ? ' aria-current="page"' : ''} style="gap: var(--m-space-3); padding-block: 5px">${tile(ic, tone)}${label}</a></li>`;

const setGroup = (title: string, items: string[], foot = '') =>
  `<section class="m-stack" data-gap="2" aria-label="${title}">
          <h2 style="padding-inline: var(--m-space-4); ${sm}; ${muted}; font-weight: var(--m-font-weight-medium)">${title}</h2>
          ${grouped(items, title)}
          ${foot ? `<p style="padding-inline: var(--m-space-4); ${xs}; ${muted}">${foot}</p>` : ''}
        </section>`;
const labelled = (id: string, label: string, hint = '') =>
  `<span class="m-stack" data-gap="0"><label for="${id}">${label}</label>${hint ? `<span style="${xs}; ${muted}">${hint}</span>` : ''}</span>`;
const menu = (id: string, options: string[], selected: string) =>
  `<select class="m-select" id="${id}" style="inline-size: auto; border-color: transparent; background-color: transparent; color: var(--m-color-fg-muted); text-align: end">${options.map((o) => `<option${o === selected ? ' selected' : ''}>${o}</option>`).join('')}</select>`;

const settings = shell(
  sidebar(
    'Settings',
    `${searchField('lg-set-search', 'Search')}
      <a href="#" class="m-sidebar-link" style="gap: var(--m-space-3); padding-block: var(--m-space-2)">${face('CV', 'info', 'md')}<span class="m-stack" data-gap="0"><span style="${semi}">Clara Voss</span><span style="${xs}; ${muted}">Account and sign-in</span></span></a>
      <ul style="padding: 0; list-style: none" aria-label="Chat settings">
        ${section(I.bell, 'danger', 'Notifications', true)}
        ${section(I.shield, 'accent', 'Privacy and receipts')}
        ${section(I.palette, 'warning', 'Chat look')}
        ${section(I.moon, 'accent', 'Quiet hours')}
      </ul>
      <ul style="padding: 0; list-style: none" aria-label="Device settings">
        ${section(I.laptop, 'grey', 'Linked devices')}
        ${section(I.disk, 'grey', 'Storage')}
        ${section(I.help, 'success', 'Help')}
      </ul>`,
  ),
  `<main style="min-block-size: 100vh; background: var(--m-color-bg-sunken)">
      <header class="m-cluster" data-gap="3" style="padding: var(--m-space-3) var(--m-space-6)">
        <div class="m-cluster" data-gap="1">${glass(I.left, 'Back')}${glass(I.right, 'Forward')}</div>
        <h1 style="font-size: var(--m-font-size-lg); ${bold}">Notifications</h1>
      </header>
      <div class="m-stack" data-gap="6" style="max-inline-size: 40rem; margin-inline: auto; padding: var(--m-space-4) var(--m-space-6) var(--m-space-12)">
        ${setGroup(
          'Messages',
          [
            groupRow(labelled('lg-n1', 'Show banners', 'For new messages and replies'), sw('lg-n1', 'Show banners')),
            groupRow(labelled('lg-n2', 'Message preview'), menu('lg-n2', ['Always', 'When unlocked', 'Never'], 'When unlocked')),
            groupRow('<span>Sound</span>', chevron('Pebble')),
            groupRow(labelled('lg-n3', 'Count on the app icon'), sw('lg-n3', 'Count on the app icon')),
          ],
          'Banners show the sender and the first line of the message.',
        )}
        ${setGroup('Groups', [
          groupRow(labelled('lg-n4', 'Busy groups', 'Alert me only when I’m mentioned in groups over 20 people'), sw('lg-n4', 'Busy groups')),
          groupRow(labelled('lg-n5', 'Reactions to my messages'), sw('lg-n5', 'Reactions to my messages', false)),
        ])}
        ${setGroup(
          'Reminders',
          [groupRow(labelled('lg-n6', 'Remind me of unread messages'), menu('lg-n6', ['Never', 'Once', 'Twice'], 'Once'))],
          'A reminder plays a few minutes after a message arrives if you haven’t read it.',
        )}
        ${grouped([groupRow('<button type="button" style="all: unset; cursor: pointer">Reset notification settings</button>', '', 'danger-fg')], 'Reset')}
      </div>
    </main>`,
);

// ---- Empty state: a search with nothing found, and the thread pane at rest --------------------------

const emptyState = shell(
  sidebar(
    'Conversations',
    `${sidebarTop(`${glass(I.filter, 'Show only')}${glass(I.compose, 'New chat')}`)}
      ${searchField('lg-empty-search', 'Search', 'harbour picnic')}
      <div class="m-stack" data-gap="1" data-align="center" style="padding: var(--m-space-12) var(--m-space-4); text-align: center">
        <span style="display: inline-flex; color: var(--m-color-fg-subtle)">${icon(I.search, 36, 1.5)}</span>
        <h2 style="margin-block-start: var(--m-space-2); font-size: var(--m-font-size-lg); ${bold}">No results</h2>
        <p style="${sm}; ${muted}">Nothing matches “harbour picnic”. Check the spelling, or search for a name.</p>
      </div>`,
  ),
  `<main class="m-stack" data-gap="0" data-align="center" style="min-block-size: 100vh; justify-content: center; padding: var(--m-space-12) var(--m-space-6); background: var(--m-color-bg-canvas); text-align: center">
      <span style="display: inline-flex; color: var(--m-color-fg-subtle)">${icon(I.users, 64, 1.25)}</span>
      <h1 style="margin-block-start: var(--m-space-4); font-size: var(--m-font-size-2xl); ${bold}; letter-spacing: var(--m-font-tracking-tight)">Pick someone to talk to</h1>
      <p style="max-inline-size: 24rem; margin-block-start: var(--m-space-2); ${muted}">Choose a chat on the left, or start a new one. Messages you send here also appear on your phone.</p>
      <div class="m-cluster" data-gap="3" data-justify="center" style="margin-block-start: var(--m-space-6)">
        <button type="button" class="m-button" data-variant="primary">${icon(I.compose, 16)} New chat</button>
        <button type="button" class="m-button" data-variant="secondary">Invite a friend</button>
      </div>
    </main>`,
);

// ---- Pricing: an invented product's plans, on the same system ---------------------------------------

const tick = (text: string) =>
  `<li class="m-cluster" data-gap="2" data-align="start" style="flex-wrap: nowrap"><span style="flex: none; display: inline-flex; margin-block-start: 2px; color: var(--m-color-accent-default)">${icon(I.check, 16, 2.5)}</span>${text}</li>`;
const plan = (
  id: string,
  name: string,
  price: string,
  per: string,
  line: string,
  list: string[],
  cta: string,
  best = false,
) =>
  `<section class="m-card" aria-labelledby="lg-plan-${id}"${best ? ' style="box-shadow: 0 0 0 2px var(--m-color-accent-default)"' : ''}>
        <div class="m-card-body m-stack" data-gap="4" style="block-size: 100%; padding: var(--m-space-6)">
          <div class="m-cluster" data-justify="between"><h2 id="lg-plan-${id}" style="font-size: var(--m-font-size-xl); ${bold}">${name}</h2>${best ? '<span class="m-badge" data-tone="info">Best for families</span>' : ''}</div>
          <p class="m-cluster" data-gap="1" data-align="baseline"><span style="font-size: var(--m-font-size-4xl); ${bold}; letter-spacing: var(--m-font-tracking-tight); font-variant-numeric: tabular-nums">${price}</span><span style="${sm}; ${muted}">${per}</span></p>
          <p style="${muted}">${line}</p>
          <ul class="m-stack" data-gap="2" style="flex: 1; padding: 0; list-style: none; ${sm}">${list.map(tick).join('')}</ul>
          <a href="#" class="m-button" data-variant="${best ? 'primary' : 'secondary'}" style="inline-size: 100%">${cta}</a>
        </div>
      </section>`;
const yes = `<span role="img" aria-label="Included" style="display: inline-flex; color: var(--m-color-accent-default)">${icon(I.check, 16, 2.5)}</span>`;
const no = `<span role="img" aria-label="Not included" style="color: var(--m-color-fg-subtle)">–</span>`;
const rowHead = (text: string) => `<th scope="row" style="font-weight: var(--m-font-weight-regular)">${text}</th>`;

const pricing = `<div style="min-block-size: 100vh; background: var(--m-color-bg-sunken)">
  <header class="m-navbar" style="--m-navbar-bg: var(--m-color-bg-sunken)">
    <a class="m-navbar-brand" href="#" style="color: inherit; text-decoration: none">${brand}</a>
    <nav class="m-navbar-nav" aria-label="Site">
      <a class="m-navbar-link" href="#">Features</a>
      <a class="m-navbar-link" href="#" aria-current="page">Plans</a>
      <a class="m-navbar-link" href="#">Safety</a>
      <a class="m-navbar-link" href="#">Help</a>
    </nav>
    <div class="m-navbar-actions">
      <a class="m-button" data-variant="ghost" href="#">Sign in</a>
      <a class="m-button" data-variant="primary" href="#">Get Natter</a>
    </div>
  </header>
  <main>
    <section class="m-container m-stack" data-gap="4" data-align="center" style="padding-block: var(--m-space-16) var(--m-space-10); text-align: center" aria-labelledby="lg-pricing">
      <h1 id="lg-pricing" style="max-inline-size: 40rem; font-size: clamp(var(--m-font-size-3xl), 5vw, 3rem); ${bold}; letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)">Free to chat. Plus when you want more.</h1>
      <p style="max-inline-size: 32rem; font-size: var(--m-font-size-lg); ${muted}">Every plan has unlimited messages, groups and calls. Pay only for storage and the extras.</p>
      <div style="min-inline-size: 14rem; margin-block-start: var(--m-space-2)">${segments(['Monthly', 'Yearly'], 'Yearly', 'Billing period')}</div>
    </section>
    <section class="m-container" style="padding-block-end: var(--m-space-12)" aria-label="Plans">
      <div class="m-grid" style="--m-layout-grid-min: 16rem; --m-layout-grid-gap: var(--m-space-5)">
        ${plan('free', 'Free', '£0', 'forever', 'For chatting with friends.', ['Unlimited messages and groups', 'Voice and video calls', '5 GB for photos and files'], 'Start chatting')}
        ${plan('plus', 'Plus', '£2.49', 'a month, billed yearly', 'For people who share a lot.', ['Everything in Free', '200 GB for photos and files', 'Schedule messages', 'Custom chat colours'], 'Try Plus free for a month')}
        ${plan('family', 'Family', '£4.99', 'a month for up to six', 'For a household on one bill.', ['Everything in Plus, for six people', '1 TB shared between you', 'A family group with shared albums', 'Parental controls for under-13s'], 'Choose Family', true)}
      </div>
    </section>
    <section class="m-container m-stack" data-gap="3" style="--m-layout-container-max-lg: 46rem; padding-block-end: var(--m-space-12)" aria-labelledby="lg-compare">
      <h2 id="lg-compare" style="padding-inline: var(--m-space-4); font-size: var(--m-font-size-xl); ${bold}">Compare plans</h2>
      <div class="m-card" style="padding: var(--m-space-2) 0">
        <div class="m-table-wrap"><table class="m-table">
          <thead><tr><th scope="col">Feature</th><th scope="col">Free</th><th scope="col">Plus</th><th scope="col">Family</th></tr></thead>
          <tbody>
            <tr>${rowHead('Storage')}<td>5 GB</td><td>200 GB</td><td>1 TB</td></tr>
            <tr>${rowHead('Schedule messages')}<td>${no}</td><td>${yes}</td><td>${yes}</td></tr>
            <tr>${rowHead('Custom chat colours')}<td>${no}</td><td>${yes}</td><td>${yes}</td></tr>
            <tr>${rowHead('Shared family albums')}<td>${no}</td><td>${no}</td><td>${yes}</td></tr>
          </tbody>
        </table></div>
      </div>
    </section>
    <section class="m-container m-stack" data-gap="3" style="--m-layout-container-max-lg: 46rem; padding-block-end: var(--m-space-16)" aria-labelledby="lg-faq">
      <h2 id="lg-faq" style="padding-inline: var(--m-space-4); font-size: var(--m-font-size-xl); ${bold}">Questions</h2>
      <div class="m-accordion">
        <details class="m-accordion-item" name="lg-faq" open><summary>What happens to my photos if I go back to Free?</summary><div class="m-accordion-content">Nothing is deleted. You can still see everything; new uploads pause until you’re under 5 GB.</div></details>
        <details class="m-accordion-item" name="lg-faq"><summary>Who can join a Family plan?</summary><div class="m-accordion-content">Up to six people you invite. Each keeps their own chats private; only the storage is shared.</div></details>
        <details class="m-accordion-item" name="lg-faq"><summary>Can I pay monthly instead?</summary><div class="m-accordion-content">Yes. Monthly costs a little more and you can cancel at any time.</div></details>
      </div>
    </section>
  </main>
</div>`;

// ---- Errors ---------------------------------------------------------------------------------------------

const errorPage = (code: string, ic: string, title: string, body: string, actions: string) =>
  `<section class="m-card m-stack" data-gap="2" data-align="center" style="padding: var(--m-space-10) var(--m-space-6); text-align: center" aria-labelledby="lg-err-${code}">
        <span style="display: inline-flex; color: var(--m-color-fg-subtle)">${icon(ic, 44, 1.5)}</span>
        <span style="margin-block-start: var(--m-space-2); ${xs}; ${muted}; font-family: var(--m-font-family-mono)">${code}</span>
        <h2 id="lg-err-${code}" style="font-size: var(--m-font-size-xl); ${bold}">${title}</h2>
        <p style="max-inline-size: 22rem; ${sm}; ${muted}">${body}</p>
        <div class="m-cluster" data-gap="2" data-justify="center" style="margin-block-start: var(--m-space-3)">${actions}</div>
      </section>`;

const errors = `<main style="min-block-size: 100vh; padding-block: var(--m-space-10); background: var(--m-color-bg-sunken)">
  <div class="m-container m-stack" data-gap="8">
    <h1 style="font-size: var(--m-font-size-3xl); ${bold}; letter-spacing: var(--m-font-tracking-tight)">When something goes wrong</h1>
    <div class="m-grid" style="--m-layout-grid-min: 20rem; --m-layout-grid-gap: var(--m-space-6); align-items: start">
      <div class="m-stack" data-gap="6">
        <section class="m-card" style="padding: var(--m-space-4) var(--m-space-5)" aria-label="A message that didn’t send">
          <div class="m-chat" role="log" aria-label="Messages">
            ${bubble('in', 'Are you still bringing the folding chairs?', { last: true })}
            <div class="m-cluster" data-gap="3" data-justify="end" style="flex-wrap: nowrap; margin-block-start: var(--m-space-2)">
              <div style="flex: 1">${bubble('out', 'Yes, all four. Leaving now', { last: true })}</div>
              <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Not sent. Try again" style="flex: none; inline-size: 1.75rem; block-size: 1.75rem; padding: 0; color: var(--m-color-danger-fg)">${icon(I.alert, 22, 2)}</button>
            </div>
            <p style="align-self: end; margin-inline-end: 2.5rem; ${xs}; color: var(--m-color-danger-fg)"><span style="${semi}">Not sent.</span> Click the icon to try again.</p>
          </div>
        </section>
        <div class="m-alert" data-tone="warning" role="status">
          <span class="m-alert-icon">${icon(I.wifiOff, 18)}</span>
          <div class="m-alert-content"><div class="m-alert-title">You’re offline</div><div class="m-alert-body">Messages will send as soon as you reconnect.</div></div>
        </div>
        <div class="m-toast-region" data-static aria-live="polite" style="position: static">
          <div class="m-toast" role="alert" style="inline-size: 100%; max-inline-size: none"><div class="m-toast-content"><p class="m-toast-title">Couldn’t send the photo</p><p class="m-toast-body">It’s larger than 100 MB. Send it as a link instead.</p><div class="m-toast-actions"><button type="button" class="m-button" data-size="sm">Send as a link</button></div></div><button type="button" class="m-button" data-variant="ghost" data-icon-only data-size="sm" aria-label="Dismiss" style="color: var(--m-color-fg-muted)">${icon(I.close, 14, 2)}</button></div>
        </div>
      </div>
      <div class="m-dialog" data-static role="dialog" aria-modal="false" aria-labelledby="lg-err-group" style="inline-size: 100%; max-inline-size: none; margin: 0">
        <header class="m-dialog-header"><h2 class="m-dialog-title" id="lg-err-group">New group</h2></header>
        <div class="m-dialog-body m-stack" data-gap="4">
          <div class="m-alert" data-tone="danger" role="alert">
            <span class="m-alert-icon">${icon(I.alert, 18)}</span>
            <div class="m-alert-content"><div class="m-alert-title">The group wasn’t made</div><div class="m-alert-body">Fix the two things below and try again.</div></div>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="lg-err-name">Group name</label>
            <input class="m-input" id="lg-err-name" value="" aria-invalid="true" aria-describedby="lg-err-name-e">
            <p class="m-field-error" id="lg-err-name-e">Give the group a name, up to 50 characters.</p>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="lg-err-who">Add people</label>
            <input class="m-input" id="lg-err-who" value="clara@" aria-invalid="true" aria-describedby="lg-err-who-e">
            <p class="m-field-error" id="lg-err-who-e">That address isn’t complete. Check the part after the @.</p>
          </div>
        </div>
        <footer class="m-dialog-footer"><button type="button" class="m-button" data-variant="secondary">Cancel</button><button type="submit" class="m-button" data-variant="primary">Make group</button></footer>
      </div>
    </div>
    <div class="m-grid" style="--m-layout-grid-min: 17rem; --m-layout-grid-gap: var(--m-space-5)">
      ${errorPage('404', I.search, 'This chat isn’t here', 'It may have been deleted, or the link is out of date.', '<a class="m-button" data-variant="primary" href="#">Back to chats</a>')}
      ${errorPage('500', I.alert, 'Natter isn’t responding', 'Your messages are safe on this device and will send when we’re back.', `<button type="button" class="m-button" data-variant="primary">${icon(I.refresh, 16)} Try again</button>`)}
      ${errorPage('403', I.lock, 'You’re not in this group', 'Only members can read it. Ask someone in the group to add you.', '<button type="button" class="m-button" data-variant="primary">Ask to join</button><a class="m-button" data-variant="secondary" href="#">Go back</a>')}
    </div>
  </div>
</main>`;

export const lagoonRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Chats (home)',
    description:
      'The messenger window as a web layout: the grey sidebar with a capsule search, sections, pinned circles and conversation rows; the thread with round glass buttons, the name capsule, grouped bubbles with tails, reactions, a receipt and the capsule composer.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'The conversation list with the current row in solid blue, and a group’s details on the grouped grey: a large circle, round actions, a segmented control, member circles and grouped cards.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'A centred welcome on the grouped grey: a large tile, a bold title, three features with blue icons, a grouped card for the name, and a full-width blue capsule.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'Sections with small coloured tiles in the sidebar, the open one as grouped white cards with switches, menus and chevron rows, small footers, and a red reset row.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'A search with no results in the sidebar, and the thread pane at rest: a large grey glyph, a bold title, one sentence and two capsules.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'An invented product’s plans on the same system: an opaque toolbar, a bold centred headline with a segmented control, three white cards (the suggested one ringed in blue), a comparison list and grouped questions.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'A message that didn’t send, the offline notice, a banner, a sheet with field errors, and full pages for 404, 500 and no access.',
    html: errors,
  },
];
