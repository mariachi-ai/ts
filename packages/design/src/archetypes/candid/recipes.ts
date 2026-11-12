import type { ArchetypeRecipe } from '../types';

/*
 * Candid's seven page shapes: framework-free HTML using only @mariachi/design classes and tokens (no
 * colour literals), with sample data from an invented daily-photo app, "Twofold". They follow the
 * language's real screen patterns, translated from a phone app to a desktop web layout: a bare black
 * top bar with text tabs, a centred feed column with a nav panel on the left and a side panel on
 * the right, dual-camera posts (a big photo with a small inset in the corner, drawn as token shapes,
 * never photos), a grey "late" line under each name, round reactions stacked on the photo's edge,
 * dark grey pills for small actions and one white button. Names, captions, sections and their order
 * are invented.
 */

// Lucide icons, outlined at 2px (the reference's system symbols are bold); a few closed shapes filled
const icon = (paths: string, size = 20, filled = false) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  aperture:
    '<circle cx="12" cy="12" r="10"/><path d="m14.31 8 5.74 9.94"/><path d="M9.69 8h11.48"/><path d="m7.38 12 5.74-9.94"/><path d="M9.69 16 3.95 6.06"/><path d="M14.31 16H2.83"/><path d="m16.62 12-5.74 9.94"/>',
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6a2 2 0 0 1 .7 1.5v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  inbox:
    '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  user: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1"/>',
  bell: '<path d="M10.27 21a2 2 0 0 0 3.46 0"/><path d="M3.26 15.33A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.67C19.41 13.96 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.41 5.96-2.74 7.33"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  send: '<path d="M14.54 21.69a.5.5 0 0 0 .94-.03l6.5-19a.5.5 0 0 0-.64-.64l-19 6.5a.5.5 0 0 0-.03.94l7.93 3.18a2 2 0 0 1 1.11 1.11z"/>',
  comment:
    '<path d="M22 17a2 2 0 0 1-2 2H6.83a2 2 0 0 0-1.41.59l-2.2 2.2A.71.71 0 0 1 2 21.29V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/>',
  heart:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  flame:
    '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  thumb:
    '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  mountain: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
  coffee:
    '<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',
  bike: '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
  book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  pin: '<path d="M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  eyeOff:
    '<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="M9.9 4.24"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="m2 2 20 20"/>',
  camera:
    '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  share: '<path d="M12 2v13"/><path d="m16 6-4-4-4 4"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  arrowUpRight: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  warning:
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  refresh:
    '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  globe:
    '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  wifiOff:
    '<path d="M12 20h.01"/><path d="M8.5 16.43a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 4.17-2.65"/><path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76"/><path d="M16.85 11.25a10 10 0 0 1 2.22 1.68"/><path d="M5 12.86a10 10 0 0 1 5.17-2.69"/><path d="m2 2 20 20"/>',
  sparkles:
    '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.13a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.13 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0z"/>',
};

const muted = 'color: var(--m-color-fg-muted)';
const subtle = 'color: var(--m-color-fg-subtle)';
const small = 'font-size: var(--m-font-size-sm)';
const name = 'font-weight: var(--m-font-weight-semibold)';
const bold =
  'font-family: var(--m-font-family-display); font-weight: var(--m-font-weight-bold); letter-spacing: -0.02em';
const title = (size: string) =>
  `${bold}; font-size: var(--m-font-size-${size}); line-height: var(--m-font-leading-tight)`;
const hair = (side = 'block-end') => `border-${side}: var(--m-border-width-thin) solid var(--m-color-border-muted)`;
// Small actions are dark grey pills, not the 12px-cornered button
const pill = '--m-button-radius: 9999px';
// Links are bold text with an arrow, never a colour
const arrowLink = (label: string) =>
  `<a href="#" class="m-cluster" data-gap="1" style="display: inline-flex; color: var(--m-color-fg-default); ${name}; text-decoration: none">${label} ${icon(I.arrowUpRight, 18)}</a>`;

// The sample product's mark: a plain name beside a white tile with an unrelated glyph
const mark = (size = 'lg') =>
  `<a href="#" class="m-cluster" data-gap="2" style="color: var(--m-color-fg-default); text-decoration: none; font-size: var(--m-font-size-${size}); ${name}"><span style="display: inline-grid; place-items: center; inline-size: 1.75rem; block-size: 1.75rem; border-radius: var(--m-radius-sm); background: var(--m-color-accent-default); color: var(--m-color-accent-fg)">${icon(I.aperture, 18)}</span>Twofold</a>`;

// A photo, as token shapes: a toned field with a faint horizon and a glyph, never a picture
const shot = (tone: 'a' | 'b' | 'c' = 'a') => {
  const bg = {
    a: 'linear-gradient(170deg, var(--m-color-border-strong) 0%, var(--m-color-bg-raised) 58%, var(--m-color-bg-sunken) 58%, var(--m-color-border-default) 100%)',
    b: 'linear-gradient(200deg, var(--m-color-fg-subtle) 0%, var(--m-color-border-default) 48%, var(--m-color-bg-sunken) 48%, var(--m-color-bg-raised) 100%)',
    c: 'linear-gradient(160deg, var(--m-color-border-default) 0%, var(--m-color-border-strong) 64%, var(--m-color-bg-raised) 64%, var(--m-color-bg-sunken) 100%)',
  }[tone];
  return `background: ${bg}; color: var(--m-color-fg-default); display: grid; place-items: center`;
};

// The dual-camera post: the big photo, the small inset at the top left with a canvas-coloured edge,
// and the reactions stacked over the bottom-right edge
const reactionIcons = [I.heart, I.flame, I.thumb, I.zap];
const reactions = (people: string[], more?: string) =>
  `<div class="m-avatar-group" aria-label="${people.length + (more ? Number(more) : 0)} reactions" style="position: absolute; inset-block-end: calc(var(--m-space-6) * -1); inset-inline-end: var(--m-space-2); --m-avatar-size-md: 4.25rem; --m-avatar-group-overlap: -0.875rem">
              ${people
                .map(
                  (p, i) =>
                    `<span style="position: relative; display: inline-grid"><span class="m-avatar">${p}</span><span style="position: absolute; inset-block-end: -2px; inset-inline-end: -4px; display: grid; place-items: center; inline-size: 1.625rem; block-size: 1.625rem; border-radius: 9999px; background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)">${icon(reactionIcons[i % reactionIcons.length], 14, true)}</span></span>`,
                )
                .join('')}
              ${more ? `<span class="m-avatar" style="background: var(--m-color-bg-canvas); font-size: var(--m-font-size-2xl); text-transform: none">${more}+</span>` : ''}
            </div>`;

const photo = (glyph: string, insetGlyph: string, tone: 'a' | 'b' | 'c', reacts = '', ratio = '3 / 4') =>
  `<div style="position: relative; margin-block-end: ${reacts ? 'var(--m-space-6)' : '0'}">
            <div role="img" aria-label="Photo with a selfie inset" style="aspect-ratio: ${ratio}; border-radius: var(--m-radius-lg); ${shot(tone)}">${icon(glyph, 56)}</div>
            <div aria-hidden="true" style="position: absolute; inset-block-start: var(--m-space-3); inset-inline-start: var(--m-space-3); inline-size: 28%; aspect-ratio: 3 / 4; border-radius: var(--m-radius-md); border: 2px solid var(--m-color-bg-canvas); ${shot(tone === 'a' ? 'c' : 'a')}">${icon(insetGlyph, 28)}</div>
            ${reacts}
          </div>`;

const postHead = (initials: string, who: string, line: string, context = '') =>
  `${context ? `<p class="m-cluster" data-gap="2" style="${small}; ${muted}; flex-wrap: nowrap">${icon(I.users, 16)} <span style="flex: 1">${context}</span><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Hide" style="${pill}">${icon(I.close, 16)}</button></p>` : ''}
          <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap">
            <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap"><span class="m-avatar">${initials}</span><span class="m-stack" data-gap="0"><span style="${name}">${who}</span><span style="${small}; ${subtle}">${line}</span></span></div>
            <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="More" style="${pill}">${icon(I.more, 20)}</button>
          </div>`;

const actions = (comments: string) =>
  `<div class="m-cluster" data-gap="2">
            <button type="button" class="m-button" data-icon-only aria-label="Send to someone" style="${pill}">${icon(I.send, 18, true)}</button>
            <button type="button" class="m-button" style="${pill}" aria-label="${comments} comments">${icon(I.comment, 18, true)} ${comments}</button>
          </div>`;

const comment = (who: string, text: string) =>
  `<p style="display: grid; grid-template-columns: 6.5rem 1fr; gap: var(--m-space-3)"><span style="${name}">${who}</span><span>${text}</span></p>`;

const viewAll = (label: string) =>
  `<div class="m-cluster" data-gap="3" style="flex-wrap: nowrap; ${muted}"><span style="flex: 1; ${hair()}"></span><a href="#" style="color: inherit; text-decoration: none; white-space: nowrap">${label}</a><span style="flex: 1; ${hair()}"></span></div>`;

// The bare top bar: the mark, text tabs in the middle, the bell with a red count and your avatar
const topBar = (current: string) => {
  const tabs = ['Today', 'Groups', 'Campus'];
  return `<header style="padding: var(--m-space-3) clamp(1rem, 3vw, 2rem) 0; background: var(--m-color-bg-canvas); position: sticky; inset-block-start: 0; z-index: 2">
    <div style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: var(--m-space-4)">
      <div><button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Search" style="${pill}">${icon(I.search, 22)}</button></div>
      ${mark()}
      <div class="m-cluster" data-gap="2" data-justify="end" style="flex-wrap: nowrap">
        <span style="position: relative; display: inline-grid"><button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Notifications, 4 new" style="${pill}">${icon(I.bell, 22, true)}</button><span class="m-sidebar-count" style="position: absolute; inset-block-start: -2px; inset-inline-end: -2px; margin: 0; min-inline-size: 1.125rem; padding: 0 4px">4</span></span>
        <span class="m-avatar" data-size="sm" aria-label="Your profile">RK</span>
      </div>
    </div>
    <div class="m-tabs" style="align-items: center"><div class="m-tab-list" role="tablist" aria-label="Feed">
      ${tabs.map((t) => `<button type="button" class="m-tab" role="tab" aria-selected="${t === current}"${t === current ? '' : ' tabindex="-1"'}>${t}</button>`).join('\n      ')}
    </div></div>
  </header>`;
};

// The desktop nav panel: grey rows, the current one white on a dark grey pill
const navItems: [string, string, string?][] = [
  [I.home, 'Feed'],
  [I.inbox, 'Inbox', '3'],
  [I.users, 'People'],
  [I.bookmark, 'Saved'],
  [I.user, 'Profile'],
  [I.gear, 'Settings'],
];
const navPanel = (
  current: string,
) => `<nav class="m-sidebar" aria-label="Main" style="flex: 0 1 15rem; align-self: flex-end; position: sticky; inset-block-start: 7rem">
      <div class="m-sidebar-section">
        <ul>
          ${navItems.map(([ic, l, c]) => `<li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${icon(ic, 22)} ${l}${c ? ` <span class="m-sidebar-count">${c}</span>` : ''}</a></li>`).join('\n          ')}
        </ul>
      </div>
      <div class="m-sidebar-section">
        <h2 class="m-sidebar-heading">Your groups</h2>
        <ul>
          <li><a class="m-sidebar-link" href="#"><span class="m-avatar" data-size="sm" style="--m-avatar-size-sm: 1.75rem">F4</span> Flat 4</a></li>
          <li><a class="m-sidebar-link" href="#"><span class="m-avatar" data-size="sm" style="--m-avatar-size-sm: 1.75rem">BC</span> Boulder club</a></li>
          <li><a class="m-sidebar-link" href="#"><span class="m-avatar" data-size="sm" style="--m-avatar-size-sm: 1.75rem">S2</span> Studio 2B</a></li>
        </ul>
      </div>
    </nav>`;

// The side panel: today's photo, people to add, small grey links
const person = (initials: string, who: string, why: string) =>
  `<li class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding-block: var(--m-space-2)">
            <span class="m-cluster" data-gap="3" style="flex-wrap: nowrap"><span class="m-avatar">${initials}</span><span class="m-stack" data-gap="0"><span style="${name}">${who}</span><span style="${small}; ${subtle}">${why}</span></span></span>
            <span class="m-cluster" data-gap="1" style="flex-wrap: nowrap"><button type="button" class="m-button" data-variant="primary" data-size="sm" style="${pill}">Add</button><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Dismiss" style="${pill}">${icon(I.close, 16)}</button></span>
          </li>`;

const sidePanel = (
  posted: boolean,
) => `<aside class="m-stack" data-gap="6" style="flex: 0 1 19rem; align-self: flex-end; position: sticky; inset-block-start: 7rem" aria-label="Today">
      <section class="m-card" aria-labelledby="cd-today">
        <div class="m-card-body m-stack" data-gap="3">
          <h2 id="cd-today" class="m-card-title">Your photo today</h2>
          ${
            posted
              ? `<div class="m-cluster" data-gap="3" style="flex-wrap: nowrap">
            <div style="position: relative; flex: none; inline-size: 4.5rem">
              <div role="img" aria-label="Your photo" style="aspect-ratio: 3 / 4; border-radius: var(--m-radius-md); ${shot('b')}">${icon(I.coffee, 22)}</div>
              <div aria-hidden="true" style="position: absolute; inset-block-start: 4px; inset-inline-start: 4px; inline-size: 40%; aspect-ratio: 3 / 4; border-radius: 6px; border: 2px solid var(--m-color-bg-surface); ${shot('a')}"></div>
            </div>
            <div class="m-stack" data-gap="1"><span style="${name}">Posted 9:41:07am</span><span style="${small}; ${subtle}">On time · 14 reactions</span><a href="#" style="${small}; color: var(--m-color-fg-default); ${name}">See who reacted</a></div>
          </div>`
              : `<p style="${muted}">Not yet. Your feed opens the moment you post.</p>
          <button type="button" class="m-button" data-variant="primary">${icon(I.camera, 18)} Take today’s photo</button>`
          }
        </div>
      </section>
      <section class="m-stack" data-gap="2" aria-labelledby="cd-add">
        <div class="m-cluster" data-justify="between"><h2 id="cd-add" style="${title('lg')}">People to add</h2><a href="#" style="${small}; ${muted}">See all</a></div>
        <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
          ${person('TO', 'Tomi Okafor', '6 people in common')}
          ${person('LW', 'Lena Wirth', 'In Boulder club')}
          ${person('DA', 'Dev Anand', 'From your contacts')}
        </ul>
      </section>
      <p style="${small}; ${subtle}">About · Safety · Terms · Careers</p>
    </aside>`;

// The window: top bar, then three columns that wrap (on a phone the feed comes first)
const shell = (
  current: string,
  nav: string,
  feed: string,
  posted: boolean | null = true,
  max = '30rem',
) => `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas); color: var(--m-color-fg-default)">
  ${topBar(current)}
  <div style="display: flex; flex-wrap: wrap-reverse; align-items: flex-end; justify-content: center; gap: var(--m-space-8); padding: var(--m-space-4) clamp(1rem, 3vw, 2rem) var(--m-space-16)">
    ${navPanel(nav)}
    <main style="flex: 1 1 22rem; max-inline-size: ${max}; align-self: flex-end">
${feed}
    </main>
    ${posted === null ? '' : sidePanel(posted)}
  </div>
</div>`;

const post = (
  body: string,
) => `      <article class="m-stack" data-gap="3" style="padding-block: var(--m-space-4) var(--m-space-6)">
          ${body}
        </article>`;

const dashboard = shell(
  'Today',
  'Feed',
  `      <div class="m-stack" data-gap="2">
${post(`${postHead('MQ', 'mara.quint', 'Lisbon · 4 min late')}
          ${photo(I.bike, I.user, 'a', reactions(['JS', 'AB', 'NP'], '5'))}
          ${actions('12')}
          <p>Third flat tyre this month and still smiling</p>
          <div class="m-stack" data-gap="1">
            ${comment('jonas.s', 'you need new tyres not new friends')}
            ${comment('aya.b', 'on time for once?? who are you')}
          </div>
          ${viewAll('View all 12 comments')}`)}
${post(`${postHead('OF', 'oli.ferreira', 'Rotterdam · On time', 'Also in Boulder club with lena.w and 2 more')}
          ${photo(I.mountain, I.user, 'c', reactions(['MQ', 'RK']))}
          ${actions('3')}
          <p>Rest day. Mostly.</p>
          ${viewAll('View all 3 comments')}`)}
      </div>`,
);

// People: a list column with requests and your people, then one person's page
const req = (initials: string, who: string, handle: string) =>
  `<li class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding-block: var(--m-space-3)"><span class="m-cluster" data-gap="3" style="flex-wrap: nowrap"><span class="m-avatar">${initials}</span><span class="m-stack" data-gap="0"><span style="${name}">${who}</span><span style="${small}; ${subtle}">${handle}</span></span></span><span class="m-cluster" data-gap="1" style="flex-wrap: nowrap"><button type="button" class="m-button" data-variant="primary" data-size="sm" style="${pill}">Accept</button><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Decline" style="${pill}">${icon(I.close, 16)}</button></span></li>`;
const friend = (initials: string, who: string, handle: string, current = false) =>
  `<li><a href="#" class="m-cluster" data-justify="between"${current ? ' aria-current="true"' : ''} style="flex-wrap: nowrap; padding: var(--m-space-2) var(--m-space-3); margin-inline: calc(var(--m-space-3) * -1); border-radius: var(--m-radius-md); color: inherit; text-decoration: none${current ? '; background: var(--m-color-bg-sunken)' : ''}"><span class="m-cluster" data-gap="3" style="flex-wrap: nowrap"><span class="m-avatar">${initials}</span><span class="m-stack" data-gap="0"><span style="${name}">${who}</span><span style="${small}; ${subtle}">${handle}</span></span></span>${icon(I.right, 18)}</a></li>`;

const tile = (glyph: string, date: string, year: string, tone: 'a' | 'b' | 'c') =>
  `<figure style="position: relative; margin: 0">
              <div role="img" aria-label="Photo from ${date}" style="aspect-ratio: 3 / 4; border-radius: var(--m-radius-md); ${shot(tone)}">${icon(glyph, 28)}</div>
              <figcaption style="position: absolute; inset-inline-start: var(--m-space-2); inset-block-end: var(--m-space-2); line-height: 1.1"><span style="${name}; display: block">${date}</span><span style="font-size: var(--m-font-size-xs)">${year}</span></figcaption>
            </figure>`;

const listDetail = shell(
  'Today',
  'People',
  `      <div class="m-split" style="--m-layout-split-side: 17.5rem; --m-layout-split-gap: var(--m-space-8); align-items: flex-start">
        <section class="m-stack" data-gap="4" aria-labelledby="cd-people">
          <h1 id="cd-people" style="${title('2xl')}">People</h1>
          <div style="position: relative"><span style="position: absolute; inset-inline-start: var(--m-space-3); inset-block-start: 50%; translate: 0 -50%; display: inline-flex; ${subtle}">${icon(I.search, 18)}</span><input class="m-input" type="search" aria-label="Search people" placeholder="Search names" style="padding-inline-start: 2.5rem"></div>
          <div class="m-stack" data-gap="0">
            <h2 style="${small}; ${muted}; ${name}">Requests (2)</h2>
            <ul style="padding: 0; list-style: none">
              ${req('PV', 'Priya Varma', 'priya.v')}
              ${req('HB', 'Hugo Brandt', 'hugobr')}
            </ul>
          </div>
          <div class="m-stack" data-gap="1">
            <h2 style="${small}; ${muted}; ${name}">Your people (84)</h2>
            <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
              ${friend('AB', 'Aya Bennani', 'aya.b')}
              ${friend('JS', 'Jonas Sørensen', 'jonas.s')}
              ${friend('MQ', 'Mara Quint', 'mara.quint', true)}
              ${friend('NP', 'Noor Patel', 'noorp')}
              ${friend('OF', 'Oli Ferreira', 'oli.ferreira')}
            </ul>
          </div>
        </section>
        <section class="m-stack" data-gap="5" aria-labelledby="cd-person">
          <div style="position: relative; border-radius: var(--m-radius-lg); overflow: hidden; box-shadow: var(--m-shadow-lg)">
            <div role="img" aria-label="Profile photo" style="aspect-ratio: 4 / 3; ${shot('c')}">${icon(I.sparkles, 48)}</div>
            <div class="m-stack" data-gap="1" style="position: absolute; inset: auto 0 0; padding: var(--m-space-12) var(--m-space-5) var(--m-space-5); background: linear-gradient(to top, var(--m-color-bg-canvas), transparent)">
              <h1 id="cd-person" style="${title('3xl')}">Mara Quint</h1>
              <span class="m-cluster" data-gap="1" style="${subtle}">${icon(I.pin, 16)} Lisbon</span>
            </div>
          </div>
          <p style="text-align: center; ${muted}"><b style="color: var(--m-color-fg-default); font-weight: var(--m-font-weight-regular)">84</b> people · <b style="color: var(--m-color-fg-default); font-weight: var(--m-font-weight-regular)">212</b> photos since March</p>
          <div class="m-cluster" data-gap="2">
            <button type="button" class="m-button" data-variant="primary" style="flex: 1">Message</button>
            <button type="button" class="m-button" style="flex: 1">In your people ${icon(I.check, 16)}</button>
            <button type="button" class="m-button" data-icon-only aria-label="Share profile" style="${pill}">${icon(I.share, 18)}</button>
          </div>
          <div class="m-cluster" data-justify="between"><h2 style="${title('lg')}">Recent</h2><span class="m-cluster" data-gap="1" style="${small}; ${subtle}">${icon(I.lock, 14)} Only your people see these</span></div>
          <div class="m-grid" style="--m-layout-grid-min: 8rem; --m-layout-grid-gap: var(--m-space-2)">
            ${tile(I.bike, '11 Nov', '2026', 'a')}
            ${tile(I.book, '8 Nov', '2026', 'b')}
            ${tile(I.music, '2 Nov', '2026', 'c')}
          </div>
        </section>
      </div>`,
  null,
  '56rem',
);

// Sign-up: one question at a time, centred on black, a big bold line and the white button at the end
const onboarding = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas); color: var(--m-color-fg-default); display: flex; flex-direction: column">
  <header class="m-cluster" data-justify="between" style="padding: var(--m-space-3) clamp(1rem, 3vw, 2rem)">
    <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Back" style="${pill}">${icon(I.left, 24)}</button>
    ${mark()}
    <span style="inline-size: 2.5rem"></span>
  </header>
  <main class="m-container" data-size="sm" style="flex: 1; display: flex; flex-direction: column; padding-block: var(--m-space-8) var(--m-space-12)">
    <div class="m-stack" data-gap="8" style="flex: 1">
      <div class="m-cluster" data-gap="1" role="progressbar" aria-label="Step 2 of 4" aria-valuemin="1" aria-valuemax="4" aria-valuenow="2" style="flex-wrap: nowrap">
        <span style="flex: 1; block-size: 4px; border-radius: 9999px; background: var(--m-color-accent-default)"></span>
        <span style="flex: 1; block-size: 4px; border-radius: 9999px; background: var(--m-color-accent-default)"></span>
        <span style="flex: 1; block-size: 4px; border-radius: 9999px; background: var(--m-color-bg-sunken)"></span>
        <span style="flex: 1; block-size: 4px; border-radius: 9999px; background: var(--m-color-bg-sunken)"></span>
      </div>
      <div class="m-stack" data-gap="2" style="text-align: center">
        <h1 style="${title('2xl')}">What should people call you?</h1>
        <p style="${muted}">Your people see this above every photo.</p>
      </div>
      <form class="m-stack" data-gap="6" onsubmit="return false">
        <div class="m-field">
          <label class="m-field-label m-sr-only" for="cd-ob-name">Username</label>
          <input class="m-input" id="cd-ob-name" data-size="lg" value="rosa.k" autocomplete="username" style="text-align: center; ${title('xl')}; letter-spacing: 0">
          <p class="m-field-hint" style="text-align: center">rosa.k is free · letters, numbers, dots and underscores</p>
        </div>
        <div class="m-card" data-variant="sunken">
          <div class="m-card-body m-stack" data-gap="3">
            <p style="${small}; ${muted}; ${name}">How you’ll appear</p>
            <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap"><span class="m-avatar">RK</span><span class="m-stack" data-gap="0"><span style="${name}">rosa.k</span><span style="${small}; ${subtle}">Ghent · On time</span></span></div>
          </div>
        </div>
      </form>
    </div>
    <div class="m-stack" data-gap="4" style="text-align: center">
      <button type="button" class="m-button" data-variant="primary" data-size="lg" style="--m-button-radius: var(--m-radius-lg); inline-size: 100%">Continue</button>
      <p style="${small}; ${muted}">Already have an account? <a href="#" style="color: var(--m-color-fg-default); ${name}">Log in</a></p>
    </div>
  </main>
</div>`;

// Settings: a back arrow and a centred title, then grouped dark grey cards with icon rows
const row = (ic: string, label: string, trail = '', danger = false) =>
  `<li><a href="#" class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding: var(--m-space-3) var(--m-space-4); color: ${danger ? 'var(--m-color-danger-fg)' : 'inherit'}; text-decoration: none">${icon(ic, 22)}<span style="flex: 1">${label}</span>${trail ? `<span style="${subtle}">${trail}</span>` : ''}<span style="display: inline-flex; ${subtle}">${icon(I.right, 18)}</span></a></li>`;
const toggle = (id: string, label: string, hint: string, on: boolean) =>
  `<li><label class="m-cluster" data-gap="4" for="${id}" style="flex-wrap: nowrap; padding: var(--m-space-3) var(--m-space-4)"><span class="m-stack" data-gap="0" style="flex: 1"><span>${label}</span><span style="${small}; ${muted}">${hint}</span></span><input class="m-switch" id="${id}" type="checkbox" role="switch"${on ? ' checked' : ''}></label></li>`;
const group = (heading: string, rows: string[]) =>
  `<section class="m-stack" data-gap="2" aria-label="${heading}">
        <h2 style="${small}; ${muted}; ${name}; padding-inline: var(--m-space-4)">${heading}</h2>
        <ul class="m-card" data-variant="sunken" style="--m-card-gap: 0; padding: 0; list-style: none; overflow: hidden">
          ${rows.join(`\n          <li aria-hidden="true" style="${hair('block-start')}; margin-inline-start: 3.25rem; border-color: var(--m-color-border-default)"></li>\n          `)}
        </ul>
      </section>`;

const settings = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas); color: var(--m-color-fg-default)">
  <header style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: var(--m-space-3) clamp(1rem, 3vw, 2rem)">
    <a href="#" class="m-button" data-variant="ghost" data-icon-only aria-label="Back to profile" style="${pill}">${icon(I.left, 24)}</a>
    <h1 style="${title('lg')}">Settings</h1>
    <span></span>
  </header>
  <main class="m-container" data-size="md" style="padding-block: var(--m-space-4) var(--m-space-16)">
    <div class="m-stack" data-gap="6">
      <a href="#" class="m-card" data-variant="sunken" style="display: block; color: inherit; text-decoration: none">
        <div class="m-card-body m-cluster" data-gap="4" style="flex-wrap: nowrap">
          <span class="m-avatar" data-size="lg">RK</span>
          <span class="m-stack" data-gap="0" style="flex: 1"><span style="${title('xl')}">Rosa Kerckhove</span><span style="${subtle}">rosa.k</span></span>
          <span style="display: inline-flex; ${subtle}">${icon(I.right, 20)}</span>
        </div>
      </a>
      ${group('You', [row(I.user, 'Edit profile'), row(I.link, 'Linked accounts', '2'), row(I.globe, 'Language', 'English (UK)')])}
      ${group('Feed', [toggle('cd-s1', 'Show my photo on Campus', 'People at your school can see it for 24 hours.', true), toggle('cd-s2', 'Let groups re-share', 'Group members can pin your photo to the group.', false), toggle('cd-s3', 'Daily reminder', 'A nudge at 8pm if you haven’t posted.', true)])}
      ${group('Safety', [row(I.shield, 'Privacy'), row(I.ban, 'Blocked people', '1'), row(I.bell, 'Notifications')])}
      ${group('Support', [row(I.help, 'Help centre'), row(I.flag, 'Report a problem'), row(I.file, 'Terms and privacy')])}
      <ul class="m-card" data-variant="sunken" style="--m-card-gap: 0; padding: 0; list-style: none; overflow: hidden">
        <li><button type="button" style="all: unset; box-sizing: border-box; display: block; inline-size: 100%; padding: var(--m-space-3) var(--m-space-4); text-align: center; color: var(--m-color-danger-fg); ${name}; cursor: pointer">Log out</button></li>
      </ul>
      <p style="text-align: center; ${small}; ${subtle}">Version 4.12.0 (2611)<br><a href="#" style="color: inherit">Delete account</a></p>
    </div>
  </main>
</div>`;

// Before you post: the photo is hidden behind a dark veil with one line and the white button;
// below, the end of the feed
const lockedPost = `      <article class="m-stack" data-gap="3" style="padding-block: var(--m-space-4) var(--m-space-6)">
          ${postHead('AB', 'aya.b', 'Marseille · 1 min late')}
          <div style="position: relative; border-radius: var(--m-radius-lg); overflow: hidden">
            <div aria-hidden="true" style="aspect-ratio: 3 / 4; ${shot('b')}; filter: blur(18px); transform: scale(1.1)"></div>
            <div class="m-stack" data-gap="3" style="position: absolute; inset: 0; align-items: center; justify-content: center; text-align: center; padding: var(--m-space-6); background: var(--m-color-bg-overlay)">
              ${icon(I.eyeOff, 40)}
              <h2 style="${title('xl')}">Hidden until you post</h2>
              <p style="max-inline-size: 22rem; ${muted}">Add your photo for today and everyone’s opens up.</p>
              <button type="button" class="m-button" data-variant="primary">Take today’s photo</button>
            </div>
          </div>
          ${actions('0')}
        </article>`;

const emptyState = shell(
  'Today',
  'Feed',
  `      <div class="m-stack" data-gap="2">
${lockedPost}
        <section class="m-stack" data-gap="4" style="align-items: center; text-align: center; padding: var(--m-space-12) var(--m-space-4); ${hair('block-start')}" aria-labelledby="cd-empty">
          <span style="display: grid; place-items: center; inline-size: 4.5rem; block-size: 4.5rem; border-radius: 9999px; background: var(--m-color-bg-sunken)">${icon(I.users, 32)}</span>
          <h2 id="cd-empty" style="${title('2xl')}">That’s everyone so far</h2>
          <p style="max-inline-size: 24rem; ${muted}">Nobody else in your people has posted today. The more people you add, the more you’ll see.</p>
          <div class="m-cluster" data-gap="2" data-justify="center">
            <button type="button" class="m-button" data-variant="primary">${icon(I.plus, 18)} Add people</button>
            <button type="button" class="m-button" style="${pill}">${icon(I.link, 18)} Copy invite link</button>
          </div>
        </section>
      </div>`,
  false,
);

// The public site: a black bar with grey links and a white pill, a huge tight headline, plan cards
// with a faint ring, a ringed figures panel and questions
const plan = (
  label: string,
  price: string,
  per: string,
  blurb: string,
  points: string[],
  cta: string,
  featured = false,
) => `<section class="m-card" style="--m-card-radius: 24px; ${featured ? 'border-color: var(--m-color-fg-default)' : 'background: transparent'}" aria-label="${label}">
          <div class="m-card-body m-stack" data-gap="5" style="padding: var(--m-space-8)">
            <div class="m-cluster" data-justify="between"><h2 style="${title('xl')}">${label}</h2>${featured ? '<span class="m-badge" data-variant="solid" style="text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide); border-radius: 4px">Most picked</span>' : ''}</div>
            <p><span style="${title('3xl')}">${price}</span> <span style="${muted}">${per}</span></p>
            <p style="${muted}">${blurb}</p>
            <ul class="m-stack" data-gap="2" style="padding: 0; list-style: none">
              ${points.map((p) => `<li class="m-cluster" data-gap="2" style="flex-wrap: nowrap; align-items: start"><span style="display: inline-flex; padding-block-start: 2px">${icon(I.check, 18)}</span>${p}</li>`).join('\n              ')}
            </ul>
            <a class="m-button" href="#" data-size="lg" ${featured ? 'data-variant="primary" ' : ''}style="${pill}">${cta}</a>
          </div>
        </section>`;

const pricing = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas); color: var(--m-color-fg-default)">
  <header class="m-navbar">
    <a class="m-navbar-brand" href="#" style="color: var(--m-color-fg-default)">${mark('xl')}</a>
    <nav class="m-navbar-nav" aria-label="Site">
      <a class="m-navbar-link" href="#">Clubs</a>
      <a class="m-navbar-link" href="#" aria-current="page">Plus</a>
      <a class="m-navbar-link" href="#">Safety</a>
      <a class="m-navbar-link" href="#">Careers</a>
    </nav>
    <div class="m-navbar-actions">
      <a class="m-navbar-link" href="#">Log in</a>
      <a class="m-button" href="#" data-variant="primary" style="${pill}">Get the app</a>
    </div>
  </header>
  <main class="m-container" style="padding-block: var(--m-space-16) var(--m-space-16)">
    <div class="m-stack" data-gap="16">
      <div class="m-stack" data-gap="4" style="align-items: center; text-align: center">
        <h1 style="${title('4xl')}; max-inline-size: 14ch">More of the people you actually know</h1>
        <p style="font-size: var(--m-font-size-lg); ${muted}; max-inline-size: 34rem">Twofold is free, and always will be. Plus gives you more room for the photos you keep, and Clubs is for teams, schools and societies.</p>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 17rem; --m-layout-grid-gap: var(--m-space-6)">
        ${plan('Free', '£0', 'forever', 'Everything you need for one photo a day.', ['Up to 150 people', 'Three groups', 'Your last 90 days, saved'], 'Get the app')}
        ${plan('Plus', '£2.99', 'a month', 'For people who keep every day.', ['Every photo, saved for good', 'Unlimited groups', 'Download your year as a book file', 'Early features'], 'Try Plus free for 14 days', true)}
        ${plan('Clubs', '£24', 'a month per club', 'One shared space for a team, a class or a society.', ['A club page with its own feed', 'Up to 500 members', 'Admins and a verified badge'], 'Talk to us')}
      </div>
      <section aria-label="In numbers" style="border: var(--m-border-width-thin) solid var(--m-color-border-default); border-radius: 24px; padding: var(--m-space-10) var(--m-space-6)">
        <div class="m-grid" style="--m-layout-grid-min: 12rem; --m-layout-grid-gap: var(--m-space-6); text-align: center">
          <div class="m-stack" data-gap="1"><span style="${title('4xl')}">14</span><span style="${title('lg')}">days free</span><span style="${small}; ${muted}">on Plus, no card needed</span></div>
          <div class="m-stack" data-gap="1" style="${hair('inline-start')}; border-color: var(--m-color-border-default)"><span style="${title('4xl')}">1</span><span style="${title('lg')}">tap to cancel</span><span style="${small}; ${muted}">from Settings, any time</span></div>
          <div class="m-stack" data-gap="1" style="${hair('inline-start')}; border-color: var(--m-color-border-default)"><span style="${title('4xl')}">0</span><span style="${title('lg')}">ads on Plus</span><span style="${small}; ${muted}">your feed is only your people</span></div>
        </div>
      </section>
      <section class="m-container" data-size="md" style="padding: 0" aria-labelledby="cd-faq">
        <div class="m-stack" data-gap="6">
          <h2 id="cd-faq" style="${title('2xl')}; text-align: center">Questions</h2>
          <div class="m-accordion">
            <details class="m-accordion-item" name="cd-faq" open><summary>What happens to my photos if I stop paying?</summary><div class="m-accordion-content">Nothing is deleted. Photos older than 90 days stay safe and come back if you rejoin; you can download them all from Settings at any time.</div></details>
            <details class="m-accordion-item" name="cd-faq"><summary>Can my school use Clubs?</summary><div class="m-accordion-content">Yes. Schools and societies get Clubs at half price; write to us from your school address.</div></details>
            <details class="m-accordion-item" name="cd-faq"><summary>Does Plus change who sees my photo?</summary><div class="m-accordion-content">No. Only the people you add see your photo, whichever plan you’re on.</div></details>
          </div>
        </div>
      </section>
      <div style="text-align: center">${arrowLink('Compare every feature')}</div>
    </div>
  </main>
  <footer class="m-cluster" data-gap="6" data-justify="center" style="padding: var(--m-space-8) var(--m-space-4); ${small}; ${muted}; ${hair('block-start')}">
    <a href="#" style="color: inherit">Help</a><a href="#" style="color: inherit">Privacy</a><a href="#" style="color: inherit">Terms</a><a href="#" style="color: inherit">Community rules</a><a href="#" style="color: inherit">Cookies</a>
  </footer>
</div>`;

// Errors: a bold centred line, one sentence and an arrow link, on black
const errorPage = (code: string, ic: string, head: string, line: string, action: string) =>
  `<section class="m-card" data-variant="outline" style="--m-card-radius: 24px" aria-labelledby="cd-e${code}">
        <div class="m-card-body m-stack" data-gap="3" style="align-items: center; text-align: center; padding: var(--m-space-10) var(--m-space-6)">
          <span style="display: grid; place-items: center; inline-size: 3.5rem; block-size: 3.5rem; border-radius: 9999px; background: var(--m-color-bg-sunken)">${icon(ic, 26)}</span>
          <span style="font-family: var(--m-font-family-mono); ${small}; ${subtle}">${code}</span>
          <h2 id="cd-e${code}" style="${title('2xl')}">${head}</h2>
          <p style="${muted}; max-inline-size: 22rem">${line}</p>
          <div class="m-cluster" data-gap="3" data-justify="center">${action}</div>
        </div>
      </section>`;

const errors = `<div style="min-block-size: 100vh; background: var(--m-color-bg-canvas); color: var(--m-color-fg-default)">
  ${topBar('Today')}
  <main class="m-container" style="padding-block: var(--m-space-8) var(--m-space-16)">
    <div class="m-stack" data-gap="12">
      <div class="m-grid" style="--m-layout-grid-min: 22rem; --m-layout-grid-gap: var(--m-space-10); align-items: start">
        <form class="m-stack" data-gap="5" onsubmit="return false" aria-labelledby="cd-err-form">
          <h1 id="cd-err-form" style="${title('2xl')}">New group</h1>
          <div class="m-alert" data-tone="danger" role="alert">
            <span class="m-alert-icon">${icon(I.alert, 20)}</span>
            <div class="m-alert-content"><div class="m-alert-title">The group wasn’t made</div><div class="m-alert-body">Two things need a look before you try again.</div></div>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="cd-err-name">Group name</label>
            <input class="m-input" id="cd-err-name" value="" aria-invalid="true" aria-describedby="cd-err-name-e">
            <p class="m-field-error" id="cd-err-name-e">Give the group a name.</p>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="cd-err-who">Invite</label>
            <input class="m-input" id="cd-err-who" value="tomi.okafor, lena" aria-invalid="true" aria-describedby="cd-err-who-e">
            <p class="m-field-error" id="cd-err-who-e">There’s no one called “lena”. Check the username, or invite by link.</p>
          </div>
          <button type="button" class="m-button" data-variant="primary" data-size="lg" style="--m-button-radius: var(--m-radius-lg)">Make group</button>
        </form>
        <div class="m-stack" data-gap="5">
          <div class="m-alert" data-tone="warning" role="status">
            <span class="m-alert-icon">${icon(I.wifiOff, 20)}</span>
            <div class="m-alert-content"><div class="m-alert-title">You’re offline</div><div class="m-alert-body">Your photo is saved and will post when you’re back. <a href="#" style="color: inherit; ${name}">Retry now</a></div></div>
          </div>
          <article class="m-stack" data-gap="3" aria-label="A photo that didn’t post">
            ${postHead('RK', 'rosa.k', 'Ghent · 2 min late')}
            <div style="position: relative; border-radius: var(--m-radius-lg); overflow: hidden">
              <div aria-hidden="true" style="aspect-ratio: 4 / 3; ${shot('b')}; opacity: 0.5"></div>
              <div class="m-stack" data-gap="2" style="position: absolute; inset: 0; align-items: center; justify-content: center; text-align: center; padding: var(--m-space-4)">
                <span style="display: inline-flex; color: var(--m-color-danger-fg)">${icon(I.alert, 32)}</span>
                <p style="${name}">Couldn’t post your photo</p>
                <p style="${small}; ${muted}">It’s still on this device. Nothing was lost.</p>
                <button type="button" class="m-button" data-variant="primary" data-size="sm">${icon(I.refresh, 16)} Try again</button>
              </div>
            </div>
          </article>
          <div class="m-toast-region" data-static aria-live="polite" style="position: static">
            <div class="m-toast" role="alert" style="inline-size: 100%"><div class="m-toast-content"><p class="m-toast-title">Comment not sent</p><p class="m-toast-body">Comments can be up to 300 characters.</p></div><button type="button" class="m-button" data-variant="ghost" data-size="sm" style="color: inherit; ${pill}">Edit</button></div>
          </div>
        </div>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 18rem; --m-layout-grid-gap: var(--m-space-6)">
        ${errorPage('404', I.search, 'Nothing here', 'This page doesn’t exist, or the link has expired.', arrowLink('Back to the feed'))}
        ${errorPage('500', I.warning, 'Something broke on our side', 'Your photos are safe. Give it a minute, then try again.', `<button type="button" class="m-button" data-variant="primary">${icon(I.refresh, 18)} Try again</button>`)}
        ${errorPage('403', I.lock, 'This group is private', 'Only members can see its photos. Ask someone inside to add you.', `<button type="button" class="m-button" data-variant="primary">Ask to join</button><button type="button" class="m-button" style="${pill}">Go back</button>`)}
      </div>
    </div>
  </main>
</div>`;

export const candidRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Feed (home)',
    description:
      'The home feed on the desktop: a bare black top bar with text tabs, a nav panel, a centred column of dual-camera posts with a grey late line, stacked round reactions, pill actions and comments, and a side panel with today’s photo and people to add.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'People: requests with a white Accept pill, your people as rows, and one person’s page with a big bold name over their photo, figures, a white Message button and a grid of recent photos.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'Sign-up one question at a time: thin progress bars, a big bold question, a large centred field, a preview of how you’ll appear and the full-width white button at the bottom.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A back arrow and a centred title, a profile card, then grouped dark grey cards of icon rows with chevrons and switches, a red Log out on its own and the version line.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'Before you post: a friend’s photo veiled with one line and the white button, then the end of the feed with a round icon, a bold line and two actions.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The public site: a black bar with grey links and a white pill, a huge tight headline, plan cards with a faint ring (the picked one ringed in white), a ringed panel of figures and questions.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'A form with a red banner and field errors, the offline banner, a photo that didn’t post, a toast, and full pages for 404, 500 and no access.',
    html: errors,
  },
];
