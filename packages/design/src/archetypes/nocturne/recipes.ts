import type { ArchetypeRecipe } from '../types';

/*
 * Nocturne's seven layout recipes: framework-free HTML using only @mariachi/design classes and
 * tokens (no colour literals), with sample data from a made-up sleep and meditation app,
 * "Hushwood". They follow the language's real screen patterns, translated from the tablet app to
 * the desktop: a deep-navy side menu whose current row has a white edge, the page washed from the
 * scene's blue into the night, light titles, rows of rounded tiles with a duration chip, outlined
 * pill chips with the chosen one white, white pill actions, a daily check-in and a streak. The
 * tiles' art is token gradients standing in for the photographs, which are content.
 */

// Lucide icons, outlined, 1.5px stroke
const icon = (paths: string, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
// The play mark is solid, as in the reference's chips and buttons
const solid = (paths: string, size = 12) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  wind: '<path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>',
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  heart:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  back15: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  queue: '<path d="M11 12H3"/><path d="M16 6H3"/><path d="M16 18H3"/><path d="M18 9v6"/><path d="M21 12h-6"/>',
  flame:
    '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  headphones:
    '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  infinity:
    '<path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  rain: '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  user: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>',
  volume:
    '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  logout: '<path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>',
  compass:
    '<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
};
type IconName = keyof typeof I;

// Type: light titles over the scene, names on tiles at 600, secondary lines in the softened white
const pageTitle =
  'font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-regular); line-height: var(--m-font-leading-tight)';
const sectionTitle = 'font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-regular)';
const name = 'font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-semibold)';
const meta = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)';
// The scene: the page washes from the brand's blue into the night (a pale blue into white by day)
const scene =
  'background: linear-gradient(180deg, var(--m-color-brand-subtle), var(--m-color-bg-canvas) 36rem); min-block-size: 100vh';
// Round icon buttons (back, close, search) are a filled veil disc with no edge
const roundFill = 'background: var(--m-color-bg-surface); border-color: transparent';
// The app's edge round the current row and the chosen tile
const ring = 'box-shadow: inset 0 0 0 1.5px var(--m-color-fg-default)';
const roundBtn = (ic: IconName, labelText: string) =>
  `<button type="button" class="m-button" data-size="sm" data-icon-only aria-label="${labelText}" style="${roundFill}">${icon(I[ic], 20)}</button>`;

// Art for tiles: token gradients in place of the reference's photographs and scenes
const art = {
  dusk: 'linear-gradient(165deg, var(--m-color-info-solid), var(--m-color-brand-default))',
  ember: 'linear-gradient(190deg, var(--m-color-brand-default), var(--m-color-danger-solid))',
  sunset: 'linear-gradient(200deg, var(--m-color-warning-solid), var(--m-color-danger-solid))',
  lagoon: 'linear-gradient(160deg, var(--m-color-success-solid), var(--m-color-info-solid))',
  moonlit:
    'radial-gradient(circle at 72% 30%, var(--m-color-warning-solid) 0 7%, transparent 8%), linear-gradient(180deg, var(--m-color-brand-default), var(--m-color-info-solid))',
  tide: 'linear-gradient(180deg, var(--m-color-info-solid), var(--m-color-success-solid))',
};

// A session tile: square art with an optional "New" pill and the duration chip, then the name and
// what it is, by whom
const tile = (a: string, title: string, kind: string, mins: string, fresh = false) => `<a href="#" class="m-stack" data-gap="2" style="color: inherit; text-decoration: none; min-inline-size: 0">
            <div style="position: relative; aspect-ratio: 1; border-radius: 14px; background: ${a}">
              ${fresh ? '<span class="m-badge" data-variant="solid" style="position: absolute; inset-block-start: var(--m-space-3); inset-inline-start: var(--m-space-3)">New</span>' : ''}
              <span class="m-badge" style="position: absolute; inset-block-end: var(--m-space-3); inset-inline-start: var(--m-space-3); background: var(--m-color-bg-surface); color: var(--m-color-fg-default); border-color: transparent">${solid(I.play, 10)} ${mins}</span>
            </div>
            <span class="m-stack" data-gap="0"><span style="${name}">${title}</span><span style="${meta}">${kind}</span></span>
          </a>`;

const sectionHead = (id: string, title: string, kicker = '') => `<div class="m-cluster" data-justify="between" data-align="end">
          <h2 id="${id}" class="m-stack" data-gap="0" style="${sectionTitle}">${kicker ? `<span style="${meta}; font-size: var(--m-font-size-md)">${kicker}</span>` : ''}${title}</h2>
          <a href="#" style="color: var(--m-color-fg-default); text-decoration: none; font-size: var(--m-font-size-sm)">See all</a>
        </div>`;

// The side menu: a plain wordmark, icon-and-label rows, the current one edged in white
const navItems: [IconName, string, string?][] = [
  ['sun', 'Today'],
  ['moon', 'Wind down'],
  ['wind', 'Breathwork'],
  ['music', 'Soundscapes'],
  ['book', 'Journal', ' <span class="m-sidebar-count">3</span>'],
  ['heart', 'Saved'],
];
const navLink = (ic: IconName, l: string, current: string, extra = '') =>
  `<li><a class="m-sidebar-link" href="#"${l === current ? ` aria-current="page" style="${ring}"` : ''}>${icon(I[ic], 22)} ${l}${extra}</a></li>`;
const sidebar = (current: string) => `<nav class="m-sidebar" aria-label="Main">
    <div class="m-stack" data-gap="8">
      <a href="#" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold); color: var(--m-color-fg-default); text-decoration: none; padding-inline: var(--m-space-3)">hushwood</a>
      <div class="m-sidebar-section">
        <ul>
${navItems.map(([ic, l, extra]) => `          ${navLink(ic, l, current, extra)}`).join('\n')}
        </ul>
      </div>
      <div class="m-sidebar-section">
        <ul>
          ${navLink('gear', 'Settings', current)}
        </ul>
      </div>
    </div>
  </nav>`;

const shell = (current: string, main: string) => `<div class="m-split" style="--m-layout-split-side: 15rem; --m-layout-split-gap: 0; min-block-size: 100vh">
  ${sidebar(current)}
  <div style="${scene}">
${main}
  </div>
</div>`;

// A page header as on the tablet app: a round back button, the title centred
const centredHead = (title: string, right = '') => `<header class="m-cluster" data-justify="between" style="padding-block: var(--m-space-6) var(--m-space-4)">
        ${roundBtn('left', 'Back')}
        <h1 style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-regular)">${title}</h1>
        ${right || '<span style="inline-size: var(--m-control-height-sm)"></span>'}
      </header>`;

// The daily check-in: a question and a grid of mood tiles; the chosen one takes the white edge
const moods: [IconName, string][] = [
  ['sun', 'Bright'],
  ['leaf', 'Steady'],
  ['moon', 'Sleepy'],
  ['cloud', 'Foggy'],
  ['zap', 'Wired'],
  ['rain', 'Heavy'],
];
const moodTile = (ic: IconName, l: string, chosen = false) =>
  `<button type="button" class="m-stack" data-gap="2" data-align="center" aria-pressed="${chosen}" style="padding: var(--m-space-4) var(--m-space-2); border-radius: 12px; background: var(--m-color-bg-surface); border: var(--m-border-width-thin) solid var(--m-color-border-default); color: var(--m-color-fg-default); font: inherit; cursor: pointer${chosen ? `; ${ring}` : ''}">${icon(I[ic], 24)}<span style="font-size: var(--m-font-size-sm)">${l}</span></button>`;

// A week of practice: done nights are mint discs with a tick; tonight has the white edge
const week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  .map((d, i) => {
    const done = i < 4;
    const today = i === 4;
    const disc = done
      ? 'background: var(--m-color-success-solid); color: var(--m-color-success-on-solid)'
      : today
        ? `${ring}; color: var(--m-color-fg-default)`
        : 'border: var(--m-border-width-thin) solid var(--m-color-border-default); color: var(--m-color-fg-subtle)';
    return `<li class="m-stack" data-gap="2" data-align="center"><span style="${meta}">${d}</span><span class="m-cluster" data-justify="center" style="inline-size: 2.25rem; block-size: 2.25rem; border-radius: 9999px; ${disc}"${done ? ' aria-label="Done"' : ''}>${done ? icon(I.check, 16) : `<span style="font-size: var(--m-font-size-sm)">${i + 9}</span>`}</span></li>`;
  })
  .join('');

const stat = (ic: IconName, l: string, v: string) =>
  `<div class="m-stack" data-gap="1" data-align="center" style="text-align: center"><span style="color: var(--m-color-accent-text)">${icon(I[ic], 22)}</span><span style="${meta}">${l}</span><span style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-semibold); font-variant-numeric: tabular-nums">${v}</span></div>`;

// The player: art, the name, a scrubber with times, and a white round play button
const miniPlayer = `<section class="m-card" aria-label="Now playing">
          <div class="m-card-body m-cluster" data-gap="4">
            <div style="inline-size: 4rem; block-size: 4rem; flex: none; border-radius: 12px; background: ${art.moonlit}"></div>
            <div class="m-stack" data-gap="2" style="flex: 1; min-inline-size: 0">
              <div class="m-cluster" data-justify="between"><span class="m-stack" data-gap="0"><span style="${name}">The Lighthouse Keeper’s Garden</span><span style="${meta}">Story · Read by Elena Marsh</span></span></div>
              <progress class="m-progress" data-size="sm" value="11" max="32" aria-label="Played 11 of 32 minutes"></progress>
              <div class="m-cluster" data-justify="between" style="${meta}; font-variant-numeric: tabular-nums"><span>11:04</span><span>−20:56</span></div>
            </div>
            <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap">
              ${roundBtn('back15', 'Back 15 seconds')}
              <button type="button" class="m-button" data-variant="primary" data-size="lg" data-icon-only aria-label="Play">${solid(I.play, 18)}</button>
            </div>
          </div>
        </section>`;

const dashboard = shell(
  'Today',
  `    <header class="m-cluster" data-justify="end" data-gap="2" style="padding: var(--m-space-4) var(--m-space-8)">
      ${roundBtn('search', 'Search')}
      ${roundBtn('bell', 'Reminders')}
      <span class="m-avatar" aria-label="Priya Anand">PA</span>
    </header>
    <main class="m-container" style="padding-block: var(--m-space-4) var(--m-space-16)">
      <div class="m-stack" data-gap="10">
        <div class="m-stack" data-gap="2">
          <h1 style="${pageTitle}">Good evening, Priya</h1>
          <p style="${meta}; font-size: var(--m-font-size-md)">Friday · your bedtime reminder is in 22 minutes</p>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 22rem">
          <section class="m-card" aria-labelledby="nc-checkin">
            <div class="m-card-body m-stack" data-gap="4">
              <div class="m-stack" data-gap="1">
                <h2 id="nc-checkin" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-regular)">How does tonight feel?</h2>
                <p style="${meta}">One tap. It shapes what we suggest next.</p>
              </div>
              <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--m-space-3)">
                ${moods.map(([ic, l]) => moodTile(ic, l, l === 'Sleepy')).join('\n                ')}
              </div>
            </div>
          </section>
          <section class="m-card" aria-labelledby="nc-streak">
            <div class="m-card-body m-stack" data-gap="5">
              <div class="m-cluster" data-justify="between">
                <h2 id="nc-streak" class="m-cluster" data-gap="2" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-regular)"><span style="color: var(--m-color-warning-solid); display: inline-flex">${icon(I.flame, 22)}</span> 4 nights in a row</h2>
                <a href="#" style="color: var(--m-color-fg-default); font-size: var(--m-font-size-sm); text-decoration: none">History</a>
              </div>
              <ol style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: var(--m-space-1); padding: 0; list-style: none">${week}</ol>
              <div class="m-grid" style="--m-layout-grid-min: 5.5rem; --m-layout-grid-gap: var(--m-space-3); ${hair}; padding-block-start: var(--m-space-4)">
                ${stat('headphones', 'Sessions', '58')}
                ${stat('clock', 'Minutes this month', '214')}
                ${stat('flame', 'Best run', '19 nights')}
              </div>
            </div>
          </section>
        </div>
        ${miniPlayer}
        <section class="m-stack" data-gap="4" aria-labelledby="nc-tonight">
        ${sectionHead('nc-tonight', 'Picked for tonight')}
          <div class="m-grid" style="--m-layout-grid-min: 9.5rem">
          ${tile(art.moonlit, 'Lanterns on the Canal', 'Story · Tomas Reyes', '41 min', true)}
          ${tile(art.dusk, 'Loosen the Shoulders', 'Body scan · Ines Kowal', '12 min')}
          ${tile(art.lagoon, 'Slow Tide', 'Soundscape · all night', '8 hr')}
          ${tile(art.ember, 'Count Down to Sleep', 'Breathwork · Rafael Ode', '9 min')}
          </div>
        </section>
        <section class="m-stack" data-gap="4" aria-labelledby="nc-mornings" style="${hair}; padding-block-start: var(--m-space-8)">
        ${sectionHead('nc-mornings', 'Gentle mornings', 'Because you liked Slow Tide')}
          <div class="m-grid" style="--m-layout-grid-min: 9.5rem">
          ${tile(art.sunset, 'First Light', 'Course · 7 days', '10 min')}
          ${tile(art.tide, 'Kettle On', 'Meditation · Ines Kowal', '6 min')}
          ${tile(art.dusk, 'Walk It Off', 'Movement · Rafael Ode', '15 min')}
          ${tile(art.ember, 'Name Three Things', 'Reflection · Elena Marsh', '5 min')}
          </div>
        </section>
      </div>
    </main>`,
);

// List and detail: a category page (chips, new tiles, a list of sessions) beside the open session:
// art, title, the white Play pill, an outlined pill, the blurb and its parts
const chip = (l: string, on = false) =>
  `<button type="button" class="m-button"${on ? ' data-variant="primary"' : ''} aria-pressed="${on}" style="font-weight: var(--m-font-weight-regular)">${l}</button>`;

const listRow = (a: string, title: string, by: string, mins: string, saved = false) => `<li class="m-cluster" data-gap="4" style="flex-wrap: nowrap; padding-block: var(--m-space-3); ${hair}">
              <div style="inline-size: 3.5rem; block-size: 3.5rem; flex: none; border-radius: 12px; background: ${a}"></div>
              <span class="m-stack" data-gap="0" style="flex: 1; min-inline-size: 0"><span style="${name}">${title}</span><span style="${meta}">Story · ${by} · ${mins}</span></span>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Save ${title}" aria-pressed="${saved}">${saved ? solid(I.heart, 20) : icon(I.heart, 20)}</button>
            </li>`;

const part = (n: string, title: string, mins: string) => `<li class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding-block: var(--m-space-3); ${hair}">
                <span class="m-stack" data-gap="0"><span style="${name}">${n}. ${title}</span><span style="${meta}">Elena Marsh · ${mins}</span></span>
                <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Play ${title}">${solid(I.play, 14)}</button>
              </li>`;

const listDetail = shell(
  'Wind down',
  `    <main class="m-container" style="padding-block: 0 var(--m-space-16)">
      ${centredHead('Wind down', roundBtn('search', 'Search'))}
      <div class="m-grid" style="--m-layout-grid-min: 24rem; --m-layout-grid-gap: var(--m-space-10); align-items: start">
        <div class="m-stack" data-gap="8">
          <div class="m-cluster" data-gap="2" role="group" aria-label="Show">
            ${chip('Everything')}${chip('Stories', true)}${chip('Body scans')}${chip('Sounds')}${chip('Under 10 min')}
          </div>
          <section class="m-stack" data-gap="4" aria-labelledby="nc-new">
          ${sectionHead('nc-new', 'New this week')}
            <div class="m-grid" style="--m-layout-grid-min: 9.5rem">
            ${tile(art.moonlit, 'Lanterns on the Canal', 'Story · Tomas Reyes', '41 min', true)}
            ${tile(art.ember, 'The Night Ferry', 'Story · Elena Marsh', '35 min')}
            </div>
          </section>
          <section class="m-stack" data-gap="2" aria-labelledby="nc-all">
            <h2 id="nc-all" style="${sectionTitle}">All stories</h2>
            <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
            ${listRow(art.moonlit, 'The Lighthouse Keeper’s Garden', 'Elena Marsh', '32 min', true)}
            ${listRow(art.lagoon, 'A Slow Train North', 'Tomas Reyes', '44 min')}
            ${listRow(art.sunset, 'Orchard at the End of Summer', 'Ines Kowal', '28 min')}
            ${listRow(art.tide, 'The Map Room', 'Rafael Ode', '37 min')}
            ${listRow(art.dusk, 'Snow on the Observatory', 'Elena Marsh', '30 min')}
            </ul>
          </section>
        </div>
        <section class="m-card" aria-labelledby="nc-open" style="overflow: hidden; padding: 0; gap: 0">
          <div style="block-size: 13rem; background: ${art.moonlit}"></div>
          <div class="m-card-body m-stack" data-gap="5" style="padding: var(--m-space-6)">
            <div class="m-cluster" data-justify="between" data-align="start" style="flex-wrap: nowrap">
              <h2 id="nc-open" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-medium); line-height: var(--m-font-leading-tight)">The Lighthouse Keeper’s Garden</h2>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Saved" aria-pressed="true">${solid(I.heart, 20)}</button>
            </div>
            <div class="m-cluster" data-gap="3"><span class="m-avatar">EM</span><span style="${name}">Read by Elena Marsh</span></div>
            <div class="m-grid" style="--m-layout-grid-min: 9rem; --m-layout-grid-gap: var(--m-space-3)">
              <button type="button" class="m-button" data-variant="primary" data-size="lg">${solid(I.play, 16)} Play</button>
              <button type="button" class="m-button" data-size="lg">${icon(I.queue, 20)} Add to queue</button>
            </div>
            <p style="color: var(--m-color-fg-muted)">A keeper tends a walled garden on a windy point, one bed at a time, while the lamp turns overhead. Best with headphones and the lights low.</p>
            <p style="${meta}; color: var(--m-color-fg-subtle)">3 parts, 32 min</p>
            <ol class="m-stack" data-gap="0" style="padding: 0; list-style: none">
              ${part('1', 'Seeds in the Salt Air', '11 min')}
              ${part('2', 'The Lamp Room', '10 min')}
              ${part('3', 'Frost on the Glass', '11 min')}
            </ol>
          </div>
        </section>
      </div>
    </main>`,
);

// Onboarding: centred on the scene, a round back button, a light question with outlined choice
// tiles, then the account fields with their icon inside and a full-width white pill
const fieldWithIcon = (id: string, ic: IconName, l: string, type: string, value: string, ok = false) => `<div class="m-field">
          <label class="m-sr-only" for="${id}">${l}</label>
          <div style="position: relative">
            <span style="position: absolute; inset-block: 0; inset-inline-start: var(--m-space-4); display: flex; align-items: center; pointer-events: none">${icon(I[ic], 22)}</span>
            <input class="m-input" id="${id}" type="${type}" placeholder="${l}" value="${value}" style="padding-inline: calc(var(--m-space-4) * 3) calc(var(--m-space-4) * 2.5)">
            ${ok ? `<span style="position: absolute; inset-block: 0; inset-inline-end: var(--m-space-4); display: flex; align-items: center; color: var(--m-color-fg-default)" role="img" aria-label="Looks good">${icon(I.checkCircle, 20)}</span>` : ''}
          </div>
        </div>`;

const goal = (ic: IconName, l: string, on = false) =>
  `<button type="button" class="m-cluster" data-gap="3" aria-pressed="${on}" style="flex-wrap: nowrap; padding: var(--m-space-4); border-radius: 12px; background: var(--m-color-bg-surface); border: var(--m-border-width-thin) solid var(--m-color-border-default); color: var(--m-color-fg-default); font: inherit; text-align: start; cursor: pointer${on ? `; ${ring}` : ''}">${icon(I[ic], 22)}<span style="flex: 1">${l}</span>${on ? icon(I.checkCircle, 20) : ''}</button>`;

const onboarding = `<div style="${scene}">
  <main class="m-container" data-size="sm" style="padding-block: var(--m-space-6) var(--m-space-16)">
    <div class="m-stack" data-gap="8">
      <div class="m-cluster" data-justify="between">
        ${roundBtn('left', 'Back')}
        <span style="${meta}">Step 2 of 3</span>
        <a href="#" style="color: var(--m-color-fg-default); text-decoration: none; font-size: var(--m-font-size-sm)">Skip</a>
      </div>
      <progress class="m-progress" data-size="sm" value="2" max="3" aria-label="Step 2 of 3"></progress>
      <section class="m-stack" data-gap="5" aria-labelledby="nc-goals">
        <h1 id="nc-goals" style="${pageTitle}; text-align: center">What would help most right now?</h1>
        <p style="${meta}; text-align: center; font-size: var(--m-font-size-md)">Pick as many as you like. You can change this later.</p>
        <div class="m-stack" data-gap="3">
          ${goal('moon', 'Falling asleep sooner', true)}
          ${goal('wind', 'Easing a busy mind', true)}
          ${goal('sun', 'Starting the day steady')}
          ${goal('book', 'Building a small daily habit')}
        </div>
      </section>
      <section class="m-stack" data-gap="4" aria-labelledby="nc-account" style="${hair}; padding-block-start: var(--m-space-8)">
        <h2 id="nc-account" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-regular); text-align: center">Make an account to keep your nights in one place</h2>
        ${fieldWithIcon('nc-name', 'user', 'First name', 'text', 'Priya', true)}
        ${fieldWithIcon('nc-email', 'mail', 'Email', 'email', 'priya@example.com', true)}
        ${fieldWithIcon('nc-pass', 'lock', 'Password', 'password', '')}
        <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Continue</button>
        <p style="${meta}; text-align: center; font-size: var(--m-font-size-xs)">By continuing you agree to the <a href="#" style="color: inherit">Terms</a> and have read the <a href="#" style="color: inherit">Privacy notice</a>.</p>
      </section>
    </div>
  </main>
</div>`;

// Settings: the profile header, a row of chip tabs (the chosen one white), then grouped rows on veil cards (an icon, the
// label, a value, switch or chevron), the way the app lists its settings
const setRow = (ic: IconName, l: string, value: string, first = false) => `<li class="m-cluster" data-gap="4" style="flex-wrap: nowrap; padding: var(--m-space-4) var(--m-space-5)${first ? '' : `; ${hair}`}">
              <span style="color: var(--m-color-accent-text); display: inline-flex">${icon(I[ic], 22)}</span>
              <span style="flex: 1">${l}</span>
              ${value}
            </li>`;
const goTo = (v: string) =>
  `<a href="#" class="m-cluster" data-gap="1" style="color: var(--m-color-fg-muted); text-decoration: none">${v}${icon(I.right, 18)}</a>`;
const toggle = (id: string, l: string, on: boolean) =>
  `<input class="m-switch" type="checkbox" role="switch" id="${id}" aria-label="${l}"${on ? ' checked' : ''}>`;
const group = (id: string, title: string, rows: string) => `<section class="m-stack" data-gap="3" aria-labelledby="${id}">
          <h2 id="${id}" style="${meta}; font-size: var(--m-font-size-md)">${title}</h2>
          <ul class="m-card" style="padding: 0; gap: 0; list-style: none">
            ${rows}
          </ul>
        </section>`;

const settings = shell(
  'Settings',
  `    <main class="m-container" data-size="md" style="padding-block: var(--m-space-10) var(--m-space-16)">
      <div class="m-stack" data-gap="8">
        <div class="m-cluster" data-gap="4">
          <span class="m-avatar" data-size="lg">PA</span>
          <div class="m-stack" data-gap="0"><h1 style="${pageTitle}">Priya Anand</h1><span style="${meta}">Member since March · Yearly plan</span></div>
        </div>
        <div class="m-cluster" data-gap="2" role="tablist" aria-label="Settings">
          ${['Account', 'Reminders', 'Sound', 'Privacy'].map((t, i) => `<button type="button" class="m-button" data-size="sm" role="tab" aria-selected="${i === 0}"${i === 0 ? ' data-variant="primary"' : ' tabindex="-1"'} style="font-weight: var(--m-font-weight-regular)">${t}</button>`).join('')}
        </div>
        ${group('nc-set-you', 'You', [setRow('user', 'Name', goTo('Priya Anand'), true), setRow('mail', 'Email', goTo('priya@example.com')), setRow('lock', 'Password', goTo('Change'))].join('\n            '))}
        ${group(
          'nc-set-nights',
          'Your nights',
          [
            setRow(
              'bell',
              'Bedtime reminder',
              '<select class="m-select" data-size="sm" aria-label="Bedtime reminder" style="inline-size: 8rem"><option>22:15</option><option>22:30</option><option>23:00</option></select>',
              true,
            ),
            setRow('moon', 'Fade out when a session ends', toggle('nc-fade', 'Fade out when a session ends', true)),
            setRow('volume', 'Keep a soundscape on after stories', toggle('nc-after', 'Keep a soundscape on after stories', false)),
            setRow('sun', 'Morning check-in', toggle('nc-morning', 'Morning check-in', true)),
          ].join('\n            '),
        )}
        ${group('nc-set-plan', 'Plan and data', [setRow('infinity', 'Plan', goTo('Yearly · renews 14 March'), true), setRow('shield', 'Download my data', goTo('Request')), setRow('logout', 'Sign out', '')].join('\n            '))}
        <section class="m-stack" data-gap="3" aria-labelledby="nc-set-delete" style="${hair}; padding-block-start: var(--m-space-6)">
          <h2 id="nc-set-delete" style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-regular)">Delete account</h2>
          <p style="color: var(--m-color-fg-muted)">This removes your journal, saved sessions and 58 nights of history. Your plan keeps running until you cancel it where you subscribed.</p>
          <div><button type="button" class="m-button" data-variant="danger">Delete account…</button></div>
        </section>
      </div>
    </main>`,
);

const emptyState = shell(
  'Saved',
  `    <main class="m-container" data-size="md" style="padding-block: 0 var(--m-space-16)">
      ${centredHead('Saved')}
      <div class="m-stack" data-gap="5" data-align="center" style="text-align: center; padding-block: var(--m-space-16)">
        <span class="m-cluster" data-justify="center" style="inline-size: 5rem; block-size: 5rem; border-radius: 9999px; background: var(--m-color-bg-surface); color: var(--m-color-accent-text)">${icon(I.heart, 36)}</span>
        <h2 style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-regular)">Nothing saved yet</h2>
        <p style="color: var(--m-color-fg-muted); max-inline-size: 26rem">Tap the heart on any story, sound or session and it waits here for the nights you need it.</p>
        <div class="m-cluster" data-gap="3" data-justify="center">
          <button type="button" class="m-button" data-variant="primary" data-size="lg">Browse tonight’s picks</button>
          <button type="button" class="m-button" data-size="lg">${icon(I.search, 20)} Search</button>
        </div>
      </div>
    </main>`,
);

// Pricing: the app's plan screen. A short bold line, a light heading, what's included as icon rows
// on hairlines, then plan boxes (the chosen one edged in white with a yellow tag) and the white pill
const perk = (ic: IconName, text: string) =>
  `<li class="m-cluster" data-gap="4" style="flex-wrap: nowrap; padding-block: var(--m-space-4); ${hair}"><span style="color: var(--m-color-accent-text); display: inline-flex">${icon(I[ic], 26)}</span><span>${text}</span></li>`;
const plan = (id: string, title: string, sub: string, price: string, on = false, tag = '') => `<label for="${id}" style="position: relative; display: block; padding: var(--m-space-4) var(--m-space-5); border-radius: 12px; background: var(--m-color-bg-surface); border: ${on ? '2px' : 'var(--m-border-width-thin)'} solid ${on ? 'var(--m-color-fg-default)' : 'var(--m-color-border-strong)'}; cursor: pointer">
          ${tag ? `<span class="m-badge" style="position: absolute; inset-block-start: calc(var(--m-space-3) * -1); inset-inline-end: var(--m-space-4); border-radius: var(--m-radius-sm); background: var(--m-color-warning-solid); color: var(--m-color-warning-on-solid); border-color: transparent">${tag}</span>` : ''}
          <span class="m-cluster" data-justify="between" style="flex-wrap: nowrap">
            <span class="m-cluster" data-gap="3" style="flex-wrap: nowrap"><input class="m-radio" type="radio" name="nc-plan" id="${id}"${on ? ' checked' : ''}><span class="m-stack" data-gap="0"><span style="font-size: var(--m-font-size-lg)">${title}</span><span style="${meta}">${sub}</span></span></span>
            <span style="font-size: var(--m-font-size-lg); font-variant-numeric: tabular-nums; white-space: nowrap">${price}</span>
          </span>
        </label>`;

const pricing = `<div style="${scene}">
  <main class="m-container" data-size="sm" style="padding-block: var(--m-space-6) var(--m-space-16)">
    <div class="m-stack" data-gap="8">
      <div>${roundBtn('x', 'Close')}</div>
      <div class="m-stack" data-gap="2">
        <p style="font-weight: var(--m-font-weight-semibold)">Your nights, made easier.</p>
        <h1 style="${pageTitle}">Try everything free for 14 days</h1>
      </div>
      <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
        ${perk('infinity', 'Every story, sound and course, with no limits')}
        ${perk('headphones', 'New bedtime tales every week, read by gentle voices')}
        ${perk('moon', 'Wind-down plans that fit your bedtime')}
        ${perk('users', 'Share with up to five people on the Household plan')}
      </ul>
      <fieldset class="m-stack" data-gap="4" style="border: 0; padding: 0; margin: 0">
        <legend class="m-sr-only">Choose a plan</legend>
        ${plan('nc-yearly', 'Yearly', '£44.99 a year after the trial', '£3.75/mo', true, '14 days free')}
        ${plan('nc-monthly', 'Monthly', 'Billed each month, cancel any time', '£8.99/mo')}
        ${plan('nc-household', 'Household', 'Up to five people, billed yearly', '£6.25/mo')}
      </fieldset>
      <div class="m-stack" data-gap="3">
        <button type="button" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Start my free trial</button>
        <p style="${meta}; font-size: var(--m-font-size-xs); text-align: center">Free for 14 days, then £44.99 a year. We’ll remind you two days before it ends. Cancel any time.</p>
      </div>
      <section class="m-stack" data-gap="3" aria-labelledby="nc-faq" style="${hair}; padding-block-start: var(--m-space-6)">
        <h2 id="nc-faq" style="${sectionTitle}">Questions</h2>
        <div class="m-accordion">
          <details class="m-accordion-item" name="nc-faq" open><summary>Will I be charged when the trial ends?</summary><div class="m-accordion-content">Only if you keep the plan. We send a reminder two days before, and cancelling in Settings stops the charge.</div></details>
          <details class="m-accordion-item" name="nc-faq"><summary>Can I listen without a connection?</summary><div class="m-accordion-content">Yes. Save a session and it downloads, so it plays on a plane or with your phone in airplane mode.</div></details>
          <details class="m-accordion-item" name="nc-faq"><summary>How does the Household plan work?</summary><div class="m-accordion-content">You invite up to five people by email. Each gets their own account, history and journal.</div></details>
        </div>
      </section>
    </div>
  </main>
</div>`;

// Errors: on the field, a summary above the form, a white toast for what happened elsewhere, and
// full pages, all gentle: the icon and the words carry it, not colour
const errorPage = (code: string, ic: IconName, title: string, body: string, actions: string) => `      <section class="m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-12); ${hair}" aria-labelledby="nc-err-${code}">
        <span class="m-cluster" data-justify="center" style="inline-size: 4.5rem; block-size: 4.5rem; border-radius: 9999px; background: var(--m-color-bg-surface); color: var(--m-color-fg-muted)">${icon(I[ic], 32)}</span>
        <span style="${meta}; font-family: var(--m-font-family-mono)">${code}</span>
        <h2 id="nc-err-${code}" style="${sectionTitle}">${title}</h2>
        <p style="color: var(--m-color-fg-muted); max-inline-size: 26rem">${body}</p>
        <div class="m-cluster" data-gap="3" data-justify="center">${actions}</div>
      </section>`;

const errors = `<div style="${scene}">
  <main class="m-container" data-size="sm" style="padding-block: var(--m-space-10) var(--m-space-16)">
    <div class="m-stack" data-gap="10">
      <form class="m-stack" data-gap="4" aria-labelledby="nc-err-form" novalidate>
        <h1 id="nc-err-form" style="${pageTitle}; text-align: center">Welcome back</h1>
        <div class="m-alert" data-tone="danger" role="alert">
          <span class="m-alert-icon">${icon(I.alert, 20)}</span>
          <div class="m-alert-content"><div class="m-alert-title">We couldn’t sign you in</div><div class="m-alert-body">Check the two fields below. Nothing on your account changed.</div></div>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="nc-err-email">Email</label>
          <input class="m-input" id="nc-err-email" type="email" value="priya@example" aria-invalid="true" aria-describedby="nc-err-email-e">
          <p class="m-field-error" id="nc-err-email-e">Add the end of the address, like priya@example.com.</p>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="nc-err-pass">Password</label>
          <input class="m-input" id="nc-err-pass" type="password" value="moonlight" aria-invalid="true" aria-describedby="nc-err-pass-e">
          <p class="m-field-error" id="nc-err-pass-e">That password doesn’t match. Try again, or reset it by email.</p>
        </div>
        <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Sign in</button>
        <a href="#" style="color: var(--m-color-accent-text); text-align: center; font-size: var(--m-font-size-sm)">Email me a reset link</a>
      </form>
      <section class="m-stack" data-gap="3" aria-label="A toast">
        <div class="m-toast" data-tone="danger" role="alert"><div class="m-toast-content"><div class="m-toast-title">“Slow Tide” didn’t download</div><div class="m-toast-body">You’re offline. It will try again when you reconnect.</div></div><button type="button" class="m-button" data-size="sm">Retry</button></div>
      </section>
${errorPage('404', 'compass', 'We can’t find that page', 'It may have moved, or the link is old. Your saved sessions are safe.', '<a class="m-button" data-variant="primary" href="#">Back to Today</a>')}
${errorPage('500', 'cloud', 'Something went wrong on our side', 'Nothing was lost. Give it a moment and try again.', '<button type="button" class="m-button" data-variant="primary">Try again</button><a class="m-button" data-variant="ghost" href="#">Get help</a>')}
${errorPage('403', 'lock', 'This one is for members', 'Start a free trial to hear every story, or go back to the free sessions.', '<a class="m-button" data-variant="primary" href="#">Start free trial</a><a class="m-button" href="#">Free sessions</a>')}
    </div>
  </main>
</div>`;

export const nocturneRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'A greeting over the scene, the daily check-in beside the week’s streak and stats, the player, then rows of session tiles with durations.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'A category page with outlined pill chips (the chosen one white), new tiles and a list of sessions, beside the open session: art, the white Play pill, the blurb and its parts.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'Centred on the scene: a round back button, a light question with outlined choice tiles, then fields with their icon inside and a full-width white pill.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'The profile header and a row of chip tabs above grouped rows on veil cards: an icon, the label, and a value, switch or chevron.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description: 'A soft disc with a thin icon, a light heading, one kind sentence, the white pill and an outlined one.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'The plan screen: a light heading, what’s included on hairlines, plan boxes with the chosen one edged in white and a yellow tag, and the white pill.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors under the field, a summary above the form that says nothing changed, a white toast for failures elsewhere, and gentle full pages for 404, 500 and no access.',
    html: errors,
  },
];
