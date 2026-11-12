import type { ArchetypeRecipe } from '../types';

/*
 * Hearth's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from a made-up community of amateur astronomers. They follow
 * the language's real screen patterns: a rail of rounded-square spaces, a channel list on the darkest
 * layer, a conversation of grouped messages beside round avatars, role-coloured names, presence dots,
 * a rounded composer, and settings as a grouped list beside label-and-value panels.
 */

// Lucide icons, outlined, 2px stroke
const icon = (paths: string, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none">${paths}</svg>`;
const I = {
  arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  atSign: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>',
  bellOff: '<path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5"/><path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="m2 2 20 20"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  circleAlert: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  circleCheck: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  circleHelp: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  circlePlus: '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>',
  circleX: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  compass: '<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  crown: '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>',
  ellipsis: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  hash: '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
  headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  keyboard: '<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  listFilter: '<path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/>',
  lockKeyhole: '<circle cx="12" cy="16" r="1"/><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  messageCircle: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
  minus: '<path d="M5 12h14"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  palette: '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
  pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  reply: '<polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  shieldCheck: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  smartphone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
  sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  sticker: '<path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M14 3v4a2 2 0 0 0 2 2h4"/><path d="M8 13h.01"/><path d="M16 13h.01"/><path d="M10 16s.8 1 2 1c1.3 0 2-1 2-1"/>',
  trash2: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  triangleAlert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  volume2: '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
};

// Translucent fills and type, from the tokens
const strong = 'color: var(--m-color-fg-default); font-weight: var(--m-font-weight-semibold)';
const sm = 'font-size: var(--m-font-size-sm)';
const xs = 'font-size: var(--m-font-size-xs)';
const subtle = 'color: var(--m-color-fg-subtle)';
const muted = 'color: var(--m-color-fg-muted)';
const hairBottom = 'border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)';
const hairTop = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)';
const pageTitle = 'font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold); color: var(--m-color-fg-default)';
// The wide, heavy, italic capitals of the marketing pages
const display =
  'font-family: var(--m-font-family-display); font-weight: 800; font-style: italic; font-stretch: 112%; text-transform: uppercase; line-height: 1; letter-spacing: var(--m-font-tracking-tight)';

// Role colours come from the status tones and the accent, so they hold contrast in both modes
const role = {
  host: 'var(--m-color-warning-fg)',
  guide: 'var(--m-color-success-fg)',
  photo: 'var(--m-color-info-fg)',
  crew: 'var(--m-color-accent-text)',
  mod: 'var(--m-color-danger-fg)',
};

// People are circles: initials on a tone, with an optional presence dot cut into the corner
type Presence = 'online' | 'idle' | 'busy' | 'offline';
const dot: Record<Presence, string> = {
  online: 'var(--m-color-success-solid)',
  idle: 'var(--m-color-warning-solid)',
  busy: 'var(--m-color-danger-solid)',
  offline: 'var(--m-color-fg-subtle)',
};
const fill = ['var(--m-color-accent-default)', 'var(--m-color-success-solid)', 'var(--m-color-danger-solid)', 'var(--m-color-info-solid)'];
const person = (initials: string, n: number, size = '2.5rem', presence?: Presence, ring = 'var(--m-color-bg-canvas)') =>
  `<span style="position: relative; display: inline-flex; flex: none"><span class="m-avatar" style="inline-size: ${size}; block-size: ${size}; background: ${fill[n % fill.length]}; font-size: calc(${size} * 0.36)" aria-hidden="true">${initials}</span>${
    presence
      ? `<span style="position: absolute; inset-block-end: -0.125rem; inset-inline-end: -0.125rem; inline-size: 0.75rem; block-size: 0.75rem; border-radius: 9999px; background: ${dot[presence]}; box-shadow: 0 0 0 0.1875rem ${ring}" role="img" aria-label="${presence === 'busy' ? 'Do not disturb' : presence[0].toUpperCase() + presence.slice(1)}"></span>`
      : ''
  }</span>`;

// Things are rounded squares: a space in the rail, 40px with 12px corners
const space = (initials: string, n: number, current = false, unread = false, label = initials) =>
  `<li style="position: relative; display: flex; justify-content: center">${
    current || unread
      ? `<span style="position: absolute; inset-inline-start: 0; inset-block-start: 50%; translate: 0 -50%; inline-size: 0.25rem; block-size: ${current ? '2.5rem' : '0.5rem'}; border-radius: 0 0.25rem 0.25rem 0; background: var(--m-color-fg-default)" aria-hidden="true"></span>`
      : ''
  }<a href="#" aria-label="${label}"${current ? ' aria-current="page"' : ''} style="display: grid; place-items: center; inline-size: 2.5rem; block-size: 2.5rem; border-radius: var(--m-radius-lg); background: ${fill[n % fill.length]}; color: var(--m-color-accent-fg); font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-semibold); text-decoration: none">${initials}</a></li>`;
const railButton = (paths: string, label: string, tone = 'var(--m-color-fg-default)') =>
  `<li style="display: flex; justify-content: center"><a href="#" aria-label="${label}" style="display: grid; place-items: center; inline-size: 2.5rem; block-size: 2.5rem; border-radius: var(--m-radius-lg); background: var(--m-button-secondary-bg); color: ${tone}">${icon(paths, 20)}</a></li>`;

// The rail: home, a hairline, the spaces, then add and explore
const rail = (current: string) => `<nav aria-label="Spaces" style="grid-row: 1; padding-block: var(--m-space-3)">
      <ul class="m-stack" data-gap="2" style="padding: 0; margin: 0; list-style: none">
        <li style="display: flex; justify-content: center"><a href="#" aria-label="Direct messages"${current === 'home' ? ' aria-current="page"' : ''} style="display: grid; place-items: center; inline-size: 2.5rem; block-size: 2.5rem; border-radius: var(--m-radius-lg); background: ${current === 'home' ? 'var(--m-color-brand-default)' : 'var(--m-button-secondary-bg)'}; color: ${current === 'home' ? 'var(--m-color-brand-fg)' : 'var(--m-color-fg-default)'}">${icon(I.messageCircle, 22)}</a></li>
        <li aria-hidden="true" style="margin-inline: auto; inline-size: 2rem; ${hairTop}"></li>
        ${space('LO', 0, current === 'space', false, 'Lowlight Observers')}
        ${space('KS', 1, false, true, 'Kettle Street Makers')}
        ${space('TB', 2, false, false, 'Tabletop Brigade')}
        ${space('AR', 3, false, true, 'Arden Running Club')}
        ${railButton(I.plus, 'Add a space', 'var(--m-color-success-fg)')}
        ${railButton(I.compass, 'Explore spaces')}
      </ul>
    </nav>`;

// The floating "you" panel across the foot of the rail and the list
const youPanel = `<div class="m-cluster" data-justify="between" style="grid-column: 1 / -1; margin: var(--m-space-2); padding: var(--m-space-2); border-radius: var(--m-radius-md); background: var(--m-color-bg-canvas); border: var(--m-border-width-thin) solid var(--m-color-border-default); flex-wrap: nowrap">
      <span class="m-cluster" data-gap="2" style="flex-wrap: nowrap; min-inline-size: 0">${person('MR', 0, '2rem', 'online')}<span class="m-stack" data-gap="0" style="min-inline-size: 0"><span style="${strong}; ${sm}">Mika Rowe</span><span style="${xs}; ${subtle}">Online</span></span></span>
      <span class="m-cluster" data-gap="0" style="flex-wrap: nowrap">
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Mute">${icon(I.mic, 18)}</button>
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Deafen">${icon(I.headphones, 18)}</button>
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="User settings">${icon(I.settings, 18)}</button>
      </span>
    </div>`;

// A channel row: an icon, the name, and for unread channels a pip and the name in full strength
const channel = (paths: string, name: string, state: 'current' | 'unread' | '' = '', count = '') =>
  `          <li style="position: relative">${state === 'unread' ? `<span style="position: absolute; inset-inline-start: calc(var(--m-space-2) * -1); inset-block-start: 50%; translate: 0 -50%; inline-size: 0.25rem; block-size: 0.5rem; border-radius: 0 0.25rem 0.25rem 0; background: var(--m-color-fg-default)" aria-hidden="true"></span>` : ''}<a class="m-sidebar-link" href="#"${state === 'current' ? ' aria-current="page"' : ''}${state === 'unread' ? ` style="color: var(--m-color-fg-default); font-weight: var(--m-font-weight-semibold)"` : ''}>${icon(paths, 20)} ${name}${count ? ` <span class="m-sidebar-count">${count}</span>` : ''}</a></li>`;
const category = (name: string) =>
  `<h2 class="m-sidebar-heading m-cluster" data-gap="1" style="justify-content: space-between">${name} <span class="m-cluster" data-gap="1">${icon(I.chevronDown, 12)}</span></h2>`;
const voiceMember = (initials: string, n: number, name: string) =>
  `<li class="m-cluster" data-gap="2" style="padding: 0.125rem var(--m-space-2) 0.125rem calc(var(--m-space-8) + var(--m-space-1)); ${muted}; ${sm}">${person(initials, n, '1.5rem')} ${name}</li>`;

const channelList = `<nav class="m-sidebar" aria-label="Channels" style="grid-row: 1; inline-size: auto; padding-block-start: 0; border-inline-start: var(--m-border-width-thin) solid var(--m-color-border-default); border-start-start-radius: var(--m-radius-md)">
      <div class="m-cluster" data-justify="between" style="block-size: 3rem; padding-inline: var(--m-space-2); margin-inline: calc(var(--m-space-2) * -1); padding-inline-start: var(--m-space-4); ${hairBottom}">
        <span style="${strong}">Lowlight Observers</span>${icon(I.chevronDown, 18)}
      </div>
      <div class="m-sidebar-section">
        <ul>
${channel(I.calendar, '3 sky nights')}
${channel(I.star, 'Highlights')}
${channel(I.shield, 'Rules &amp; roles')}
        </ul>
      </div>
      <div class="m-sidebar-section" style="${hairTop}; padding-block-start: var(--m-space-3)">
        ${category('Observing')}
        <ul>
${channel(I.hash, 'tonight', 'current')}
${channel(I.hash, 'sky-reports', 'unread', '4')}
${channel(I.image, 'photo-wall')}
${channel(I.hash, 'kit-swap')}
        </ul>
      </div>
      <div class="m-sidebar-section">
        ${category('Workshops')}
        <ul>
${channel(I.hash, 'beginners-desk', 'unread')}
${channel(I.megaphone, 'star-maps')}
        </ul>
      </div>
      <div class="m-sidebar-section">
        ${category('Voice')}
        <ul>
${channel(I.volume2, 'The dome')}
          <li><ul style="gap: 0; margin: 0; padding: 0; border: 0">
            ${voiceMember('IO', 0, 'Ines Okoye')}
            ${voiceMember('BK', 3, 'Bram Kettering')}
          </ul></li>
${channel(I.volume2, 'Late shift')}
        </ul>
      </div>
    </nav>`;

// The whole app frame: a slim title strip, then the rail and channel list on the darkest layer,
// the "you" panel across their foot, and the page beside them
const frame = (title: string, side: string, main: string, current = 'space') => `<div style="min-block-size: 100vh; display: flex; flex-direction: column; background: var(--m-color-bg-sunken)">
  <div class="m-cluster" data-justify="center" data-gap="2" style="block-size: 2rem; ${sm}; ${strong}"><span style="display: inline-grid; place-items: center; inline-size: 1.25rem; block-size: 1.25rem; border-radius: var(--m-radius-sm); background: var(--m-color-accent-default); color: var(--m-color-accent-fg); font-size: 0.5625rem">LO</span>${title}</div>
  <div style="flex: 1; display: flex; flex-wrap: wrap; align-items: stretch">
    <div style="flex: 1 1 19.5rem; max-inline-size: 100%; display: grid; grid-template-columns: 4.5rem minmax(0, 1fr); grid-template-rows: 1fr auto">
    ${rail(current)}
    ${side}
    ${youPanel}
    </div>
    <div style="flex: 999 1 0; min-inline-size: 60%; display: flex; flex-direction: column; background: var(--m-color-bg-canvas); border-start-start-radius: var(--m-radius-md); border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default); border-inline-start: var(--m-border-width-thin) solid var(--m-color-border-default)">
${main}
    </div>
  </div>
</div>`;

// The bar over a channel: its icon and name, the topic, icon buttons and a small search field
const channelBar = (paths: string, name: string, topic: string, extra = '') => `      <header class="m-cluster" data-justify="between" style="min-block-size: 3rem; padding: var(--m-space-2) var(--m-space-4); ${hairBottom}">
        <span class="m-cluster" data-gap="2" style="min-inline-size: 0"><span style="${subtle}; display: inline-flex">${icon(paths, 22)}</span><h1 style="font-size: var(--m-font-size-md); ${strong}">${name}</h1>${topic ? `<span aria-hidden="true" style="${subtle}">•</span><span style="${sm}; ${muted}">${topic}</span>` : ''}</span>
        <span class="m-cluster" data-gap="1">${extra}
          <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Notification settings">${icon(I.bell, 20)}</button>
          <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Pinned messages">${icon(I.pin, 20)}</button>
          <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Member list">${icon(I.users, 20)}</button>
          <label class="m-cluster" data-gap="1" style="block-size: 2rem; padding-inline: var(--m-space-2); border-radius: var(--m-radius-md); background: var(--m-color-bg-sunken); ${sm}; ${subtle}; inline-size: 12rem; justify-content: space-between; flex-wrap: nowrap"><span>Search</span>${icon(I.search, 16)}<input class="m-sr-only" type="search" aria-label="Search Lowlight Observers"></label>
        </span>
      </header>`;

// A message group: the avatar, the name in its role colour, the time, then the lines
const msg = (
  initials: string,
  n: number,
  name: string,
  colour: string,
  time: string,
  lines: string[],
  extra = '',
  style = '',
) => `          <article class="m-message" data-role="user"${style ? ` style="${style}"` : ''}>
            <span class="m-message-avatar" style="background: ${fill[n % fill.length]}">${initials}</span>
            <div class="m-message-meta" style="align-items: baseline"><span style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-medium); color: ${colour}">${name}</span><time>${time}</time></div>
            <div class="m-message-body m-stack" data-gap="0">${lines.map((l) => `<p>${l}</p>`).join('')}${extra}</div>
          </article>`;
const mention = (who: string) =>
  `<span style="padding: 0 0.125rem; border-radius: var(--m-radius-sm); background: var(--m-color-accent-subtle); color: var(--m-color-accent-text); font-weight: var(--m-font-weight-medium)">@${who}</span>`;
const channelRef = (name: string) =>
  `<span style="padding: 0 0.125rem; border-radius: var(--m-radius-sm); background: var(--m-color-accent-subtle); color: var(--m-color-accent-text); font-weight: var(--m-font-weight-medium)"># ${name}</span>`;
// Reactions: small rounded chips; the one you added is tinted and edged in the accent
const reaction = (paths: string, count: number, mine = false, label = '') =>
  `<button type="button" class="m-cluster" data-gap="1" aria-pressed="${mine}" aria-label="${label}, ${count}" style="padding: 0.125rem 0.5rem; border-radius: var(--m-radius-md); border: var(--m-border-width-thin) solid ${mine ? 'var(--m-color-accent-default)' : 'transparent'}; background: ${mine ? 'var(--m-color-accent-subtle)' : 'var(--m-button-secondary-bg)'}; color: ${mine ? 'var(--m-color-accent-text)' : 'var(--m-color-fg-muted)'}; ${sm}; font-weight: var(--m-font-weight-semibold); cursor: pointer">${icon(paths, 16)}${count}</button>`;

// A member row in the list on the right, under a role heading with its count
const member = (initials: string, n: number, name: string, colour: string, presence: Presence, status = '') =>
  `<li><a href="#" class="m-sidebar-link" style="${presence === 'offline' ? 'opacity: 0.5; ' : ''}padding-block: var(--m-space-1)">${person(initials, n, '2rem', presence, 'var(--m-color-bg-canvas)')}<span class="m-stack" data-gap="0" style="min-inline-size: 0"><span style="color: ${colour}; font-weight: var(--m-font-weight-medium)">${name}</span>${status ? `<span style="${xs}; ${subtle}">${status}</span>` : ''}</span></a></li>`;

const embed = `<div class="m-stack" data-gap="2" style="max-inline-size: 30rem; margin-block-start: var(--m-space-1); padding: var(--m-space-3) var(--m-space-4) var(--m-space-4); border-radius: var(--m-radius-sm); border-inline-start: 0.25rem solid var(--m-color-info-solid); background: var(--m-color-bg-surface)">
              <span style="${xs}; ${subtle}">Skyline Forecasts</span>
              <a href="#" style="color: var(--m-color-info-fg); font-weight: var(--m-font-weight-semibold); text-decoration: none">Seeing tonight: 4 of 5, transparency good after 22:00</a>
              <span style="${sm}; ${muted}">Cloud clears from the west by ten. Light wind, dew point 3°, moon sets at 23:41.</span>
            </div>`;

const dashboard = frame(
  'Lowlight Observers',
  channelList,
  `${channelBar(I.hash, 'tonight', 'Clear-sky calls and who’s heading out')}
      <div style="flex: 1; display: flex; flex-wrap: wrap">
        <div style="flex: 999 1 0; min-inline-size: 60%; display: flex; flex-direction: column">
          <div class="m-chat" data-variant="flat" style="flex: 1; padding: var(--m-space-4) var(--m-space-4) var(--m-space-2)">
          <div class="m-divider" role="separator">November 11, 2026</div>
${msg('IO', 0, 'Ines Okoye', role.host, 'Yesterday at 21:14', ['Hill car park is open again after the resurfacing. Gate code is the same as last month.', 'I’ll bring the 8-inch and the red torches.'], `<div class="m-cluster" data-gap="1" style="margin-block-start: var(--m-space-1)">${reaction(I.star, 6, true, 'Star')}${reaction(I.flame, 2, false, 'Flame')}</div>`)}
${msg('TM', 1, 'Teo Marsh', role.guide, 'Yesterday at 21:20', [`Perfect. Anyone new, read ${channelRef('beginners-desk')} first: no white light past the gate.`])}
          <div class="m-cluster" data-gap="0" role="separator" aria-label="New messages" style="flex-wrap: nowrap"><span style="flex: 1; border-block-start: var(--m-border-width-thin) solid var(--m-color-danger-solid)"></span><span class="m-badge" data-tone="danger" data-variant="solid" style="border-start-start-radius: 0; border-end-start-radius: 0">New</span></div>
${msg('PV', 3, 'Priya Vale', role.photo, 'Today at 17:02', ['Forecast just updated:'], embed)}
${msg('BK', 2, 'Bram Kettering', role.crew, 'Today at 17:09', [`${mention('Mika Rowe')} can you open the dome booking for 22:00? I can host the first hour.`], '', 'margin-inline: calc(var(--m-space-4) * -1); padding: var(--m-space-1) var(--m-space-4); background: var(--m-color-warning-bg); box-shadow: inset 0.125rem 0 0 var(--m-color-warning-solid)')}
${msg('OS', 0, 'Odile Sato', role.crew, 'Today at 17:15', ['Count me in. Bringing flasks.', 'Will there be a beginner session at 21:30, or is that next week?'])}
          </div>
          <form class="m-composer" style="margin: 0 var(--m-space-4) var(--m-space-1); flex-direction: row; align-items: center; gap: var(--m-space-2)">
            <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Upload a file">${icon(I.circlePlus, 22)}</button>
            <label class="m-sr-only" for="hh-msg">Message #tonight</label>
            <textarea class="m-composer-input" id="hh-msg" rows="1" placeholder="Message #tonight" style="flex: 1"></textarea>
            <span class="m-cluster" data-gap="0" style="flex-wrap: nowrap">
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Send a gift">${icon(I.gift, 22)}</button>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Pictures">${icon(I.image, 22)}</button>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Stickers">${icon(I.sticker, 22)}</button>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Emoji">${icon(I.smile, 22)}</button>
            </span>
          </form>
          <p class="m-cluster" data-gap="1" style="padding: 0 var(--m-space-4) var(--m-space-2); ${xs}; ${muted}"><span style="font-weight: var(--m-font-weight-bold)">•••</span> <span><strong>Odile</strong> is typing…</span></p>
        </div>
        <aside class="m-sidebar" aria-label="Members" style="flex: 1 1 15rem; inline-size: auto; background: var(--m-color-bg-canvas); border-inline-start: var(--m-border-width-thin) solid var(--m-color-border-default)">
          <div class="m-sidebar-section">
            <h2 class="m-sidebar-heading">Hosts — 2</h2>
            <ul>
              ${member('IO', 0, 'Ines Okoye', role.host, 'online', 'At the hill car park')}
              ${member('TM', 1, 'Teo Marsh', role.guide, 'idle')}
            </ul>
          </div>
          <div class="m-sidebar-section">
            <h2 class="m-sidebar-heading">Observers — 3</h2>
            <ul>
              ${member('PV', 3, 'Priya Vale', role.photo, 'busy', 'Stacking frames')}
              ${member('BK', 2, 'Bram Kettering', role.crew, 'online')}
              ${member('OS', 0, 'Odile Sato', role.crew, 'online')}
            </ul>
          </div>
          <div class="m-sidebar-section">
            <h2 class="m-sidebar-heading">Offline — 2</h2>
            <ul>
              ${member('SL', 1, 'Sol Lindqvist', role.crew, 'offline')}
              ${member('RA', 3, 'Rafe Adeyemi', role.crew, 'offline')}
            </ul>
          </div>
        </aside>
      </div>`,
);

// Settings: a grouped list beside the page; the same frame is used for a space's own settings
const settingsLink = (paths: string, label: string, current: string, extra = '') =>
  `          <li><a class="m-sidebar-link" href="#"${label === current ? ' aria-current="page"' : ''}>${icon(paths, 20)} ${label}${extra}</a></li>`;
const spaceSettingsNav = (current: string) => `<nav class="m-sidebar" aria-label="Space settings" style="grid-row: 1; inline-size: auto; border-inline-start: var(--m-border-width-thin) solid var(--m-color-border-default); border-start-start-radius: var(--m-radius-md)">
      <a href="#" class="m-cluster" data-gap="2" style="padding: var(--m-space-2); ${muted}; text-decoration: none; ${sm}">${icon(I.arrowLeft, 18)} Back to Lowlight Observers</a>
      <div class="m-sidebar-section">
        <h2 class="m-sidebar-heading">People</h2>
        <ul>
${settingsLink(I.users, 'Members', current, ' <span class="m-sidebar-count" style="background: var(--m-button-secondary-bg); color: var(--m-color-fg-muted)">212</span>')}
${settingsLink(I.crown, 'Roles', current)}
${settingsLink(I.userPlus, 'Invites', current)}
${settingsLink(I.shieldCheck, 'Join requests', current, ' <span class="m-sidebar-count">3</span>')}
        </ul>
      </div>
      <div class="m-sidebar-section">
        <h2 class="m-sidebar-heading">Space</h2>
        <ul>
${settingsLink(I.palette, 'Look and name', current)}
${settingsLink(I.hash, 'Channels', current)}
${settingsLink(I.calendar, 'Sky nights', current)}
        </ul>
      </div>
      <div class="m-sidebar-section">
        <h2 class="m-sidebar-heading">Safety</h2>
        <ul>
${settingsLink(I.shield, 'Word filters', current)}
${settingsLink(I.inbox, 'Audit trail', current)}
        </ul>
      </div>
    </nav>`;

// A role chip: a coloured dot and the role name, on the neutral fill
const roleChip = (name: string, colour: string) =>
  `<span class="m-cluster" data-gap="1" style="flex-wrap: nowrap; padding: 0.125rem var(--m-space-2); border-radius: var(--m-radius-sm); background: var(--m-button-secondary-bg); ${xs}; font-weight: var(--m-font-weight-medium); color: var(--m-color-fg-default)"><span style="inline-size: 0.625rem; block-size: 0.625rem; border-radius: 9999px; background: ${colour}" aria-hidden="true"></span>${name}</span>`;
const memberRow = (
  initials: string,
  n: number,
  name: string,
  handle: string,
  since: string,
  joined: string,
  via: string,
  roles: string,
  presence: Presence,
  selected = false,
) => `              <tr${selected ? ' aria-selected="true" style="background: var(--m-color-accent-subtle)"' : ''}>
                <td><input class="m-checkbox" type="checkbox" aria-label="Select ${name}"${selected ? ' checked' : ''}></td>
                <td><span class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${person(initials, n, '2rem', presence, 'var(--m-color-bg-canvas)')}<span class="m-stack" data-gap="0"><span style="${strong}">${name}</span><span style="${xs}; ${subtle}">${handle}</span></span></span></td>
                <td style="${muted}">${since}</td>
                <td style="${muted}">${joined}</td>
                <td><span class="m-cluster" data-gap="1" style="${muted}; flex-wrap: nowrap">${icon(I.link, 16)}${via}</span></td>
                <td><span class="m-cluster" data-gap="1">${roles}</span></td>
                <td><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="More for ${name}">${icon(I.ellipsis, 18)}</button></td>
              </tr>`;

const listDetail = frame(
  'Lowlight Observers',
  spaceSettingsNav('Members'),
  `      <main class="m-container" style="padding-block: var(--m-space-10) var(--m-space-12)">
        <div class="m-stack" data-gap="10">
          <section class="m-stack" data-gap="4" aria-labelledby="hh-members">
            <div class="m-stack" data-gap="1">
              <h1 id="hh-members" style="${pageTitle}">Members</h1>
              <p style="${sm}; ${muted}">212 people in Lowlight Observers. Hosts can give roles and remove people here.</p>
            </div>
            <div class="m-cluster" data-justify="between">
              <div class="m-cluster" data-gap="2">
                <label class="m-cluster" data-gap="2" style="block-size: 2rem; padding-inline: var(--m-space-3); border-radius: var(--m-radius-md); background: var(--m-color-bg-sunken); ${sm}; ${subtle}; flex-wrap: nowrap">${icon(I.search, 16)}<span>Search by name or handle</span><input class="m-sr-only" type="search" aria-label="Search members"></label>
                <select class="m-select" data-size="sm" aria-label="Sort" style="font-size: var(--m-font-size-sm)"><option>Sort: newest first</option><option>Sort: oldest first</option></select>
                <button type="button" class="m-button" data-size="sm">${icon(I.listFilter, 16)} Roles</button>
              </div>
              <button type="button" class="m-button" data-variant="primary" data-size="sm">${icon(I.userPlus, 16)} Invite people</button>
            </div>
            <div class="m-table-wrap" style="position: relative">
              <table class="m-table">
                <thead><tr><th style="inline-size: 2rem"><span class="m-sr-only">Select</span></th><th>Name</th><th>Member since</th><th>Joined the app</th><th>Joined by</th><th>Roles</th><th style="inline-size: 2.5rem"><span class="m-sr-only">Actions</span></th></tr></thead>
                <tbody>
${memberRow('IO', 0, 'Ines Okoye', 'ines.okoye', '2 years ago', '6 years ago', 'Invite from Teo', `${roleChip('Host', role.host)}${roleChip('Photo crew', role.photo)}`, 'online')}
${memberRow('BK', 2, 'Bram Kettering', 'brambles', '3 months ago', '4 years ago', 'Space finder', roleChip('Observer', role.crew), 'online', true)}
${memberRow('PV', 3, 'Priya Vale', 'priyav', '1 year ago', '2 years ago', 'Invite from Ines', `${roleChip('Photo crew', role.photo)}${roleChip('Observer', role.crew)}`, 'busy')}
${memberRow('TM', 1, 'Teo Marsh', 'teo.m', '2 years ago', '7 years ago', 'Founder', roleChip('Guide', role.guide), 'idle')}
${memberRow('SL', 1, 'Sol Lindqvist', 'sol_l', '2 weeks ago', '3 weeks ago', 'Invite from Bram', roleChip('Observer', role.crew), 'offline')}
                </tbody>
              </table>
            </div>
            <p class="m-cluster" data-justify="between" style="${sm}; ${subtle}"><span>Showing 5 of 212</span><a href="#" style="color: var(--m-color-accent-text); text-decoration: none; font-weight: var(--m-font-weight-medium)">Show more</a></p>
          </section>

          <!-- The detail: the person's profile card, as it opens beside the list -->
          <section class="m-card" aria-labelledby="hh-profile" style="max-inline-size: 26rem; overflow: hidden; padding: 0">
            <div style="block-size: 6rem; background: var(--m-color-brand-default)"></div>
            <div class="m-stack" data-gap="4" style="padding: 0 var(--m-space-4) var(--m-space-4)">
              <div class="m-cluster" data-justify="between" data-align="end" style="margin-block-start: -2.75rem">
                <span style="border-radius: 9999px; box-shadow: 0 0 0 0.375rem var(--m-color-bg-surface)">${person('BK', 2, '5rem', 'online', 'var(--m-color-bg-surface)')}</span>
                <span class="m-cluster" data-gap="1"><span class="m-badge" data-variant="solid">New</span></span>
              </div>
              <div class="m-stack" data-gap="0">
                <h2 id="hh-profile" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold); color: var(--m-color-fg-default)">Bram Kettering</h2>
                <span style="${sm}; ${muted}">brambles · he/him</span>
              </div>
              <p style="${sm}">Dobsonian on a wheelbarrow. Usually at the hill on Fridays; ask me about collimation.</p>
              <dl class="m-stack" data-gap="3" style="padding: var(--m-space-3); border-radius: var(--m-radius-md); background: var(--m-button-secondary-bg)">
                <div class="m-stack" data-gap="1"><dt style="${xs}; ${strong}">Member since</dt><dd style="${sm}; ${muted}">Aug 14, 2026</dd></div>
                <div class="m-stack" data-gap="1"><dt style="${xs}; ${strong}">Roles</dt><dd class="m-cluster" data-gap="1">${roleChip('Observer', role.crew)}<button type="button" class="m-button" data-size="sm" data-icon-only aria-label="Add a role" style="block-size: 1.5rem; min-inline-size: 1.5rem; padding: 0">${icon(I.plus, 14)}</button></dd></div>
              </dl>
              <div class="m-cluster" data-gap="2">
                <button type="button" class="m-button" data-variant="primary" style="flex: 1">${icon(I.messageCircle, 18)} Message</button>
                <button type="button" class="m-button" data-icon-only aria-label="More">${icon(I.ellipsis, 18)}</button>
              </div>
            </div>
          </section>
        </div>
      </main>`,
);

// Onboarding: a centred card on the brand colour, one step at a time, with a footer band for actions
const template = (paths: string, label: string, n: number) =>
  `<li><a href="#" class="m-cluster" data-justify="between" style="padding: var(--m-space-2) var(--m-space-3) var(--m-space-2) var(--m-space-2); border-radius: var(--m-radius-md); border: var(--m-border-width-thin) solid var(--m-color-border-default); color: var(--m-color-fg-default); text-decoration: none; font-weight: var(--m-font-weight-semibold); flex-wrap: nowrap"><span class="m-cluster" data-gap="3" style="flex-wrap: nowrap"><span style="display: grid; place-items: center; inline-size: 2.5rem; block-size: 2.5rem; border-radius: var(--m-radius-lg); background: ${fill[n % fill.length]}; color: var(--m-color-accent-fg)">${icon(paths, 20)}</span>${label}</span><span style="${subtle}; display: inline-flex">${icon(I.chevronRight, 20)}</span></a></li>`;

const onboarding = `<main style="min-block-size: 100vh; display: grid; place-items: center; padding: var(--m-space-6) var(--m-space-4); background: var(--m-color-brand-default)">
  <form class="m-card" aria-labelledby="hh-onb-title" style="inline-size: 100%; max-inline-size: 27.625rem; padding: 0; overflow: hidden; border-radius: var(--m-radius-lg); box-shadow: var(--m-shadow-overlay)">
    <div class="m-stack" data-gap="5" style="padding: var(--m-space-6) var(--m-space-4) var(--m-space-4)">
      <div class="m-stack" data-gap="2" data-align="center" style="text-align: center">
        <span style="${xs}; ${subtle}; font-weight: var(--m-font-weight-semibold)" id="hh-onb-step">Step 2 of 3</span>
        <h1 id="hh-onb-title" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); color: var(--m-color-fg-default)">Make your space yours</h1>
        <p style="${muted}">Give it a name and a picture. You can change both later in its settings.</p>
      </div>
      <div class="m-stack" data-align="center">
        <button type="button" class="m-stack" data-gap="1" data-align="center" style="justify-content: center; inline-size: 5rem; block-size: 5rem; border-radius: 9999px; border: 0.125rem dashed var(--m-color-border-strong); background: transparent; color: var(--m-color-fg-muted); ${xs}; font-weight: var(--m-font-weight-bold); text-transform: uppercase; cursor: pointer">${icon(I.upload, 22)} Upload</button>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="hh-onb-name">Space name</label>
        <input class="m-input" id="hh-onb-name" value="Lowlight Observers" required>
        <p class="m-field-hint">By creating a space you agree to the community rules.</p>
      </div>
      <div class="m-stack" data-gap="2">
        <span class="m-field-label" style="${xs}; ${muted}; text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide); font-weight: var(--m-font-weight-bold)">Start from a template</span>
        <ul class="m-stack" data-gap="2" style="padding: 0; margin: 0; list-style: none">
          ${template(I.star, 'Hobby club', 0)}
          ${template(I.users, 'Friends and family', 1)}
          ${template(I.calendar, 'Local events', 3)}
        </ul>
      </div>
      <label class="m-cluster" data-gap="2" style="${sm}; flex-wrap: nowrap"><input class="m-checkbox" type="checkbox" checked> Show me around once it’s ready</label>
    </div>
    <div class="m-cluster" data-justify="between" style="padding: var(--m-space-4); background: var(--m-color-bg-sunken)">
      <button type="button" class="m-button" data-variant="ghost">Back</button>
      <button type="submit" class="m-button" data-variant="primary">Create space</button>
    </div>
  </form>
</main>`;

// Settings: the profile header, a search field and grouped rows on the left; a page of panels on the right
const settingsNavGroups = (current: string) =>
  (
    [
      ['Your profile', [[I.user, 'Account'], [I.palette, 'Profile card'], [I.moon, 'Status and presence'], [I.lockKeyhole, 'Sign-in and security']]],
      ['Spaces', [[I.compass, 'Joined spaces'], [I.userPlus, 'Invites'], [I.shield, 'Blocked people']]],
      ['App', [[I.eye, 'Theme'], [I.messageCircle, 'Text and images'], [I.volume2, 'Sound'], [I.keyboard, 'Shortcuts'], [I.globe, 'Language']]],
      ['Membership', [[I.zap, 'Plan'], [I.gift, 'Gifts']]],
    ] as [string, [string, string][]][]
  )
    .map(
      ([h, items], gi) => `      <div class="m-sidebar-section"${gi ? ` style="${hairTop}; padding-block-start: var(--m-space-3)"` : ''}>
        <h2 class="m-sidebar-heading">${h}</h2>
        <ul>
${items.map(([ic, l]) => settingsLink(ic, l, current, l === 'Plan' ? ' <span class="m-badge" style="margin-inline-start: auto; border-radius: 9999px">Offer</span>' : '')).join('\n')}
        </ul>
      </div>`,
    )
    .join('\n');

const valueRow = (label: string, value: string, action: string) =>
  `              <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; gap: var(--m-space-4)"><div class="m-stack" data-gap="1" style="min-inline-size: 0"><dt style="${strong}">${label}</dt><dd style="${muted}; overflow-wrap: anywhere">${value}</dd></div><button type="button" class="m-button" data-size="sm">${action}</button></div>`;
const switchRow = (label: string, desc: string, on: boolean, first = false) =>
  `            <label class="m-cluster" data-justify="between" style="flex-wrap: nowrap; gap: var(--m-space-6); padding-block: var(--m-space-4); ${first ? '' : hairTop}"><span class="m-stack" data-gap="1"><span style="${strong}">${label}</span><span style="${sm}; ${muted}">${desc}</span></span><input class="m-switch" type="checkbox" role="switch"${on ? ' checked' : ''}></label>`;

const settings = `<div style="min-block-size: 100vh; display: flex; flex-wrap: wrap; background: var(--m-color-bg-canvas)">
  <nav class="m-sidebar" aria-label="Settings" style="flex: 1 1 17.5rem; padding: var(--m-space-4) var(--m-space-3); --m-sidebar-link-fg: var(--m-color-fg-muted)">
      <div class="m-cluster" data-gap="3" style="padding: var(--m-space-2); flex-wrap: nowrap">${person('MR', 0, '3rem', 'online', 'var(--m-color-bg-sunken)')}<span class="m-stack" data-gap="0"><span style="${strong}">Mika Rowe</span><a href="#" class="m-cluster" data-gap="1" style="${sm}; ${muted}; text-decoration: none">Edit profile ${icon(I.chevronRight, 14)}</a></span></div>
      <label class="m-cluster" data-gap="2" style="block-size: 2.5rem; margin-block: var(--m-space-1) var(--m-space-2); padding-inline: var(--m-space-3); border-radius: var(--m-radius-md); border: var(--m-border-width-thin) solid var(--m-color-border-strong); ${muted}; flex-wrap: nowrap">${icon(I.search, 18)}<span>Search settings</span><input class="m-sr-only" type="search" aria-label="Search settings"></label>
${settingsNavGroups('Sign-in and security')}
      <div class="m-sidebar-section" style="${hairTop}; padding-block-start: var(--m-space-3)">
        <ul><li><a class="m-sidebar-link" href="#" style="color: var(--m-color-danger-fg)">${icon(I.arrowRight, 20)} Sign out</a></li></ul>
      </div>
  </nav>
  <div style="flex: 999 1 0; min-inline-size: 60%">
    <header class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-6); ${hairBottom}">
      <h1 style="${pageTitle}; font-size: var(--m-font-size-lg)">Sign-in and security</h1>
      <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Close settings">${icon(I.x, 22)}</button>
    </header>
    <main class="m-container" data-size="md" style="padding-block: var(--m-space-8) var(--m-space-12)">
      <div class="m-stack" data-gap="8">
        <div class="m-tabs"><div class="m-tab-list" role="tablist" aria-label="Sign-in and security">
          <button type="button" class="m-tab" role="tab" aria-selected="true">Details</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Sessions</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Standing</button>
        </div></div>
        <section class="m-card" aria-labelledby="hh-acct" style="padding: 0; overflow: hidden; background: var(--m-color-bg-sunken)">
          <div style="block-size: 6.5rem; background: var(--m-color-brand-default)"></div>
          <div class="m-cluster" data-justify="between" style="padding: 0 var(--m-space-4); margin-block-start: -2.25rem">
            <span class="m-cluster" data-gap="3" data-align="end"><span style="border-radius: 9999px; box-shadow: 0 0 0 0.375rem var(--m-color-bg-sunken)">${person('MR', 0, '5rem', 'online', 'var(--m-color-bg-sunken)')}</span><span id="hh-acct" style="font-size: var(--m-font-size-xl); ${strong}; padding-block-end: var(--m-space-2)">Mika Rowe</span></span>
            <button type="button" class="m-button" data-variant="primary" data-size="sm" style="margin-block-start: var(--m-space-8)">Edit profile</button>
          </div>
          <dl class="m-stack" data-gap="5" style="margin: var(--m-space-4); padding: var(--m-space-4); border-radius: var(--m-radius-md); background: var(--m-color-bg-surface)">
${valueRow('Display name', 'Mika Rowe', 'Edit')}
${valueRow('Handle', 'mikarowe', 'Edit')}
${valueRow('Email', '••••••••••@example.org <a href="#" style="color: var(--m-color-accent-text); text-decoration: none">Show</a>', 'Edit')}
${valueRow('Phone', 'No phone number added yet.', 'Add')}
          </dl>
        </section>
        <section class="m-stack" data-gap="3" aria-labelledby="hh-signin">
          <h2 id="hh-signin" style="${pageTitle}">Password and two-step sign-in</h2>
          <div class="m-alert" data-tone="success" role="status">
            <span class="m-alert-icon">${icon(I.lockKeyhole, 18)}</span>
            <div class="m-alert-content"><div class="m-alert-title" style="color: var(--m-color-fg-default)">Two-step sign-in is on</div></div>
          </div>
          <div class="m-cluster" data-gap="2">
            <button type="button" class="m-button" data-variant="primary">Change password</button>
            <button type="button" class="m-button">View backup codes</button>
          </div>
          <div class="m-stack" data-gap="0">
${switchRow('Ask for a code on new devices', 'We’ll send a code to your authenticator app whenever you sign in somewhere new.', true, true)}
${switchRow('Sign-in alerts by email', 'An email each time your account is used from a new place.', false)}
          </div>
        </section>
        <section class="m-stack" data-gap="3" aria-labelledby="hh-remove" style="${hairTop}; padding-block-start: var(--m-space-6)">
          <h2 id="hh-remove" style="${pageTitle}">Account removal</h2>
          <p style="${muted}">Pausing hides your profile and keeps your messages. Deleting removes your account after 14 days; it can’t be undone after that.</p>
          <div class="m-cluster" data-gap="2">
            <button type="button" class="m-button" style="color: var(--m-color-danger-fg)">Pause account</button>
            <button type="button" class="m-button" data-variant="danger">Delete account</button>
          </div>
        </section>
      </div>
    </main>
  </div>
</div>`;

// Empty state: the people page with pill tabs, nothing to show, a squircle icon and one way forward
const dmRow = (initials: string, n: number, name: string, presence: Presence, current = false) =>
  `          <li><a class="m-sidebar-link" href="#"${current ? ' aria-current="page"' : ''}>${person(initials, n, '2rem', presence, 'var(--m-color-bg-sunken)')} ${name}</a></li>`;
const peopleList = `<nav class="m-sidebar" aria-label="Conversations" style="grid-row: 1; inline-size: auto; padding-block-start: 0; border-inline-start: var(--m-border-width-thin) solid var(--m-color-border-default); border-start-start-radius: var(--m-radius-md)">
      <div style="block-size: 3rem; display: grid; align-items: center; margin-inline: calc(var(--m-space-2) * -1); padding-inline: var(--m-space-2); ${hairBottom}"><span class="m-cluster" style="block-size: 1.75rem; padding-inline: var(--m-space-2); border-radius: var(--m-radius-md); background: var(--m-color-bg-canvas); ${sm}; ${subtle}">Find a conversation</span></div>
      <div class="m-sidebar-section">
        <ul>
${settingsLink(I.users, 'People', 'People')}
${settingsLink(I.inbox, 'Requests', '', ' <span class="m-sidebar-count">2</span>')}
${settingsLink(I.star, 'Saved', '')}
        </ul>
      </div>
      <div class="m-sidebar-section">
        <h2 class="m-sidebar-heading m-cluster" style="justify-content: space-between">Conversations ${icon(I.plus, 16)}</h2>
        <ul>
${dmRow('TM', 1, 'Teo Marsh', 'idle')}
${dmRow('PV', 3, 'Priya Vale', 'busy')}
${dmRow('SL', 1, 'Sol Lindqvist', 'offline')}
        </ul>
      </div>
    </nav>`;

const emptyState = frame(
  'People',
  peopleList,
  `      <header class="m-cluster" data-gap="4" style="min-block-size: 3rem; padding: var(--m-space-2) var(--m-space-4); ${hairBottom}">
        <span class="m-cluster" data-gap="2"><span style="${subtle}; display: inline-flex">${icon(I.users, 22)}</span><h1 style="font-size: var(--m-font-size-md); ${strong}">People</h1></span>
        <span aria-hidden="true" style="${subtle}">•</span>
        <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Show">
          <button type="button" class="m-tab" role="tab" aria-selected="true" style="block-size: 2rem">Online</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1" style="block-size: 2rem">Everyone</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1" style="block-size: 2rem">Waiting</button>
        </div></div>
        <button type="button" class="m-button" data-variant="primary" data-size="sm">Add people</button>
      </header>
      <main class="m-container" data-size="sm" style="flex: 1; display: grid; place-items: center; padding-block: var(--m-space-16)">
        <div class="m-stack" data-gap="4" data-align="center" style="text-align: center">
          <span style="display: grid; place-items: center; inline-size: 5rem; block-size: 5rem; border-radius: var(--m-radius-lg); background: var(--m-button-secondary-bg); color: var(--m-color-fg-muted)">${icon(I.moon, 40)}</span>
          <h2 style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold); color: var(--m-color-fg-default)">Nobody’s online right now</h2>
          <p style="${muted}; max-inline-size: 24rem">When people you know come online, they show up here. Invite a few, or check back after dark.</p>
          <div class="m-cluster" data-gap="2" data-justify="center">
            <button type="button" class="m-button" data-variant="primary">${icon(I.userPlus, 18)} Add people</button>
            <button type="button" class="m-button">${icon(I.link, 18)} Copy invite link</button>
          </div>
        </div>
      </main>`,
  'home',
);

// Pricing: the marketing face. A brand band with wide italic capitals, two plan cards with big round
// corners, a feature table with hairlines, and questions below
const perk = (text: string) =>
  `<li class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${icon(I.check, 18)}<span>${text}</span></li>`;
const tick = `<span style="color: var(--m-color-accent-text); display: inline-flex" role="img" aria-label="Included">${icon(I.check, 18)}</span>`;
const none = `<span style="${subtle}; display: inline-flex" role="img" aria-label="Not included">${icon(I.minus, 18)}</span>`;
const compareRow = (feature: string, a: string, b: string) =>
  `            <tr><td>${feature}</td><td style="text-align: center">${a}</td><td style="text-align: center; background: var(--m-color-accent-subtle)">${b}</td></tr>`;

const pricing = `<div style="background: var(--m-color-bg-canvas)">
  <nav class="m-navbar" aria-label="Site" style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">
    <a class="m-navbar-brand" href="#" style="color: var(--m-color-brand-fg)">${icon(I.messageCircle, 24)} Glowroom</a>
    <div class="m-navbar-nav" style="margin-inline: auto"><a class="m-navbar-link" href="#" style="color: var(--m-color-brand-fg)">Get the app</a><a class="m-navbar-link" href="#" aria-current="page" style="color: var(--m-color-brand-fg)">Plans</a><a class="m-navbar-link" href="#" style="color: var(--m-color-brand-fg)">Creators</a><a class="m-navbar-link" href="#" style="color: var(--m-color-brand-fg)">Safety</a><a class="m-navbar-link" href="#" style="color: var(--m-color-brand-fg)">Help</a></div>
    <div class="m-navbar-actions"><a class="m-button" href="#" style="background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse); border-color: transparent">Open the app</a></div>
  </nav>
  <section class="m-stack" data-gap="5" data-align="center" style="padding: var(--m-space-12) var(--m-space-4) 9rem; text-align: center; background: var(--m-color-brand-default); color: var(--m-color-brand-fg)" aria-labelledby="hh-price-title">
    <h1 id="hh-price-title" style="${display}; font-size: clamp(2.25rem, 6vw, 4rem); max-inline-size: 14ch">Turn up the glow</h1>
    <p style="font-size: var(--m-font-size-lg); max-inline-size: 34rem">Bigger uploads, your own look in every space and a few extras for the people you hang out with.</p>
    <div class="m-tabs" data-variant="pill" style="padding: var(--m-space-1); border-radius: var(--m-radius-md); background: var(--m-color-bg-overlay)"><div class="m-tab-list" role="tablist" aria-label="Billing period">
      <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1" style="color: var(--m-color-brand-fg)">Monthly</button>
      <button type="button" class="m-tab" role="tab" aria-selected="true" style="background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)">Yearly · 2 months free</button>
    </div></div>
  </section>
  <main class="m-container" style="margin-block-start: -6.5rem; padding-block-end: var(--m-space-16)">
    <div class="m-stack" data-gap="12">
      <div class="m-grid" style="--m-layout-grid-min: 19rem; --m-layout-grid-gap: var(--m-space-5); max-inline-size: 60rem; margin-inline: auto; inline-size: 100%">
        <section class="m-card m-stack" data-gap="6" aria-labelledby="hh-tier-spark" style="padding: var(--m-space-10) var(--m-space-8); border-radius: calc(var(--m-radius-lg) * 3); box-shadow: var(--m-shadow-lg)">
          <div class="m-stack" data-gap="3">
            <h2 id="hh-tier-spark" style="${display}; font-size: var(--m-font-size-3xl)">Spark</h2>
            <p style="${muted}">The small upgrades people use every day.</p>
            <p><span style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-bold); color: var(--m-color-fg-default)">$3.25</span> <span style="${muted}">/ month, billed yearly</span></p>
          </div>
          <button type="button" class="m-button" data-size="lg" style="inline-size: 100%">Choose Spark</button>
          <ul class="m-stack" data-gap="3" style="padding: 0; margin: 0; list-style: none; ${hairTop}; padding-block-start: var(--m-space-6)">
            ${perk('Your own emoji in any space')}
            ${perk('100 MB uploads')}
            ${perk('A custom app icon')}
          </ul>
        </section>
        <section class="m-card m-stack" data-gap="6" aria-labelledby="hh-tier-blaze" style="padding: var(--m-space-10) var(--m-space-8); border-radius: calc(var(--m-radius-lg) * 3); border-color: var(--m-color-accent-default); box-shadow: var(--m-shadow-lg), 0 0 0 1px var(--m-color-accent-default); background: var(--m-color-bg-surface)">
          <div class="m-stack" data-gap="3">
            <div class="m-cluster" data-justify="between"><h2 id="hh-tier-blaze" style="${display}; font-size: var(--m-font-size-3xl)">Blaze</h2><span class="m-badge" data-variant="solid">Most picked</span></div>
            <p style="${muted}">Everything, for people who live here.</p>
            <p><span style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-bold); color: var(--m-color-fg-default)">$8.50</span> <span style="${muted}">/ month, billed yearly</span></p>
          </div>
          <button type="button" class="m-button" data-size="lg" style="inline-size: 100%; background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse); border-color: transparent">Choose Blaze</button>
          <ul class="m-stack" data-gap="3" style="padding: 0; margin: 0; list-style: none; ${hairTop}; padding-block-start: var(--m-space-6)">
            <li style="${strong}">Everything in Spark, and:</li>
            ${perk('A profile banner and colour theme')}
            ${perk('1 GB uploads and sharper screen share')}
            ${perk('Two boosts for a space you love')}
            ${perk('Animated avatar')}
          </ul>
        </section>
      </div>
      <section class="m-stack" data-gap="5" aria-labelledby="hh-compare" style="max-inline-size: 60rem; margin-inline: auto; inline-size: 100%">
        <h2 id="hh-compare" style="${display}; font-size: var(--m-font-size-3xl); text-align: center">Side by side</h2>
        <div class="m-table-wrap" style="position: relative">
          <table class="m-table">
            <thead><tr><th>What you get</th><th style="text-align: center">Spark</th><th style="text-align: center">Blaze</th></tr></thead>
            <tbody>
${compareRow('Custom emoji anywhere', tick, tick)}
${compareRow('Upload size', '100 MB', '1 GB')}
${compareRow('Profile banner and theme', none, tick)}
${compareRow('Screen share quality', '720p', '1080p, 60 fps')}
${compareRow('Space boosts included', none, '2')}
            </tbody>
          </table>
        </div>
      </section>
      <section class="m-stack" data-gap="4" aria-labelledby="hh-faq" style="max-inline-size: 48rem; margin-inline: auto; inline-size: 100%">
        <h2 id="hh-faq" style="${display}; font-size: var(--m-font-size-3xl); text-align: center">Questions?</h2>
        <div class="m-accordion">
          <details class="m-accordion-item" name="hh-faq" open><summary>Can I switch between Spark and Blaze?</summary><div class="m-accordion-content">Yes. Moving up starts at once and we credit what’s left of your current plan; moving down starts at your next renewal.</div></details>
          <details class="m-accordion-item" name="hh-faq"><summary>Do the people I talk to need a plan?</summary><div class="m-accordion-content">No. Everything you share works for everyone; only your own perks need a plan.</div></details>
          <details class="m-accordion-item" name="hh-faq"><summary>What happens to my boosts if I cancel?</summary><div class="m-accordion-content">They stay on the space until the end of the period you’ve paid for, then return to the pool.</div></details>
        </div>
      </section>
    </div>
  </main>
</div>`;

// Errors: inline on the field, a notice above the form, a toast, and full pages in the marketing face
const errorPage = (code: string, title: string, body: string, actions: string) => `  <section class="m-stack" data-gap="4" style="padding-block: var(--m-space-12); ${hairTop}" aria-labelledby="hh-err-${code}">
    <span style="${sm}; ${subtle}; font-family: var(--m-font-family-mono)">Error ${code}</span>
    <h1 id="hh-err-${code}" style="${display}; font-style: normal; font-size: clamp(2rem, 5vw, 3rem); color: var(--m-color-accent-text)">${title}</h1>
    <p style="font-size: var(--m-font-size-lg); max-inline-size: 34rem">${body}</p>
    <div class="m-cluster" data-gap="2">${actions}</div>
  </section>`;

const errors = `<main class="m-container" data-size="md" style="padding-block: var(--m-space-12)">
  <div class="m-stack" data-gap="10">
    <form class="m-card m-stack" data-gap="5" aria-labelledby="hh-err-form" style="padding: var(--m-space-6); max-inline-size: 30rem">
      <div class="m-stack" data-gap="2" data-align="center" style="text-align: center">
        <h1 id="hh-err-form" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); color: var(--m-color-fg-default)">Join a space</h1>
        <p style="${muted}">Paste an invite to join. It looks like a short link or a code.</p>
      </div>
      <div class="m-alert" data-tone="danger" role="alert">
        <span class="m-alert-icon">${icon(I.circleAlert, 18)}</span>
        <div class="m-alert-content"><div class="m-alert-title">2 things to fix</div><div class="m-alert-body">You haven’t joined yet. Check the invite and your nickname.</div></div>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="hh-err-invite">Invite link</label>
        <input class="m-input" id="hh-err-invite" value="glowroom.example/lowlight-obs" required aria-invalid="true" aria-describedby="hh-err-invite-e">
        <p class="m-field-error" id="hh-err-invite-e">This invite has expired. Ask whoever sent it for a new one.</p>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="hh-err-nick">Nickname in this space</label>
        <input class="m-input" id="hh-err-nick" value="m" aria-invalid="true" aria-describedby="hh-err-nick-e">
        <p class="m-field-error" id="hh-err-nick-e">Use 2 to 32 characters.</p>
      </div>
      <div class="m-cluster" data-justify="between">
        <button type="button" class="m-button" data-variant="ghost">Back</button>
        <button type="submit" class="m-button" data-variant="primary">Join space</button>
      </div>
    </form>
    <section class="m-toast-region" data-static aria-label="Toasts" style="align-items: stretch; inline-size: min(22rem, 100%)">
      <div class="m-toast" data-tone="danger" role="alert"><div class="m-toast-content"><p class="m-toast-title m-cluster" data-gap="2" style="flex-wrap: nowrap"><span style="color: var(--m-color-danger-fg); display: inline-flex">${icon(I.circleX, 18)}</span>Message failed to send</p><p class="m-toast-body">Your connection dropped. It’s saved in the box.</p><div class="m-toast-actions"><button type="button" class="m-button" data-size="sm">Retry</button></div></div><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Dismiss">${icon(I.x, 16)}</button></div>
      <div class="m-toast" data-tone="success" role="status"><div class="m-toast-content"><p class="m-toast-title m-cluster" data-gap="2" style="flex-wrap: nowrap"><span style="color: var(--m-color-success-fg); display: inline-flex">${icon(I.circleCheck, 18)}</span>Link copied</p></div></div>
    </section>
${errorPage('404', 'Lost in the dark?', 'This page doesn’t exist, or it moved. The link may be old.', `<a class="m-button" data-variant="primary" href="#">Go to your spaces</a><a class="m-button" href="#">Search spaces</a>`)}
${errorPage('500', 'Something broke on our side', 'Nothing you sent was lost. Try again in a minute; if it keeps happening, check the status page.', `<button type="button" class="m-button" data-variant="primary">${icon(I.arrowRight, 18)} Try again</button><a class="m-button" href="#">Status page</a>`)}
${errorPage('403', 'This space is invite-only', 'You need a role to see this channel. Ask a host, or join with an invite.', `<button type="button" class="m-button" data-variant="primary">Ask a host</button><a class="m-button" data-variant="ghost" href="#">Go back</a>`)}
  </div>
</main>`;

export const hearthRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'The home of the app: a rail of spaces, the channel list on the darkest layer, a conversation of grouped messages with role colours, a composer, and the member list with presence dots.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'A space’s members as a table with search, sort and role chips; a row opens the person’s profile card with its banner, presence, roles and Message.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'A centred card on the brand colour: step, bold title, an upload circle, one field, template rows, and a footer band with Back and the primary action.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A grouped settings list with the profile and a search field; underline tabs, a profile panel with label-and-value rows and Edit buttons, a notice, switches, and account removal last.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description:
      'The people page with pill tabs: a rounded-square icon, a short heading, one sentence, the primary action and a secondary one.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The marketing face: a brand band with wide italic capitals, two plan cards with large corners, a comparison table and questions.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors under the field, a notice above the form saying nothing happened, toasts, and full pages for 404, 500 and no access in the marketing face.',
    html: errors,
  },
];
