import type { ArchetypeRecipe } from '../types';

/*
 * Marigold's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from a made-up plant-care learning app ("Bramblewood").
 * They follow the language's real screen patterns, translated to a desktop web layout: a white side
 * column with uppercase heavy nav labels and the current item in a sky-blue outlined tint; a centred
 * learning column with a green unit banner on a lip and round lesson buttons; a right column of
 * grey-outlined cards; uppercase grey section labels; thick rounded progress bars; chunky
 * uppercase buttons that stand on a darker lip.
 */

// Lucide icons, outlined, a heavy 2.5px stroke with round ends, like the reference's UI glyphs
const icon = (paths: string, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  house:
    '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  tree: '<path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z"/><path d="M12 22v-3"/>',
  trophy:
    '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  flame:
    '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  gem: '<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>',
  heart:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  sprout:
    '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  droplet:
    '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  shovel:
    '<path d="M2 22v-5l5-5 5 5-5 5z"/><path d="M9.5 14.5 16 8"/><path d="m17 2 5 5-.5.5a3.53 3.53 0 0 1-5 0s0 0 0 0a3.53 3.53 0 0 1 0-5L17 2"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  userPlus:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/>',
  share:
    '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  crown:
    '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  circleCheck: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  compass:
    '<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/>',
  wrench:
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  volume:
    '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>',
};

// Type and colour helpers, all tokens
const label =
  'font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-bold); text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide); color: var(--m-color-fg-muted)';
const heading = 'font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold)';
const pageTitle = 'font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); line-height: var(--m-font-leading-tight)';
// The marketing headline: the display face at the one heavy weight (the reference uses two weights a screen),
// lowercase, tight
const display =
  'font-family: var(--m-font-family-display); font-size: var(--m-font-size-4xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight); text-transform: lowercase';
const line = 'var(--m-border-width-thin) solid var(--m-color-border-default)';
const hue = (tone: string) => `color: var(--m-color-${tone})`;
const upper = 'text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide)';

// A coloured stat: an icon in its tone, the figure in heavy type
const stat = (ic: string, tone: string, value: string, name: string) =>
  `<span class="m-cluster" data-gap="2" style="font-weight: var(--m-font-weight-bold); ${hue(tone)}" aria-label="${value} ${name}">${icon(ic, 22)} ${value}</span>`;

const navItems: [keyof typeof I, string][] = [
  ['house', 'Path'],
  ['target', 'Practice'],
  ['tree', 'Groves'],
  ['trophy', 'Challenges'],
  ['book', 'Field guide'],
  ['user', 'Profile'],
  ['more', 'More'],
];

const sidebar = (current: string) => `  <nav class="m-sidebar" aria-label="Main">
    <div class="m-stack" data-gap="6">
      <a href="#" style="padding: var(--m-space-2) var(--m-space-4); font-family: var(--m-font-family-display); font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-bold); letter-spacing: var(--m-font-tracking-tight); color: var(--m-color-brand-default); text-decoration: none">bramblewood</a>
      <div class="m-sidebar-section">
        <ul style="${upper}; font-weight: var(--m-font-weight-bold)">
${navItems
  .map(
    ([ic, l]) =>
      `          <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${icon(I[ic], 24)} ${l}</a></li>`,
  )
  .join('\n')}
        </ul>
      </div>
    </div>
  </nav>`;

// The right column: the learner's stats on top, then grey-outlined cards
const rail = (cards: string) => `      <aside class="m-stack" data-gap="6" style="flex: 1 1 18rem; max-inline-size: 23rem" aria-label="Your progress">
        <div class="m-cluster" data-justify="between" style="padding-inline: var(--m-space-2)">
          <span class="m-cluster" data-gap="2" style="font-weight: var(--m-font-weight-bold)"><span class="m-avatar" data-size="sm" style="border-radius: var(--m-radius-sm)" aria-label="Course: Houseplants">HP</span></span>
          ${stat(I.flame, 'warning-fg', '23', 'day run')}
          ${stat(I.gem, 'info-fg', '1,140', 'seeds')}
          ${stat(I.heart, 'danger-fg', '4', 'hearts')}
        </div>
${cards}
      </aside>`;

const shell = (current: string, main: string) => `<div class="m-split" style="--m-layout-split-side: 16rem; --m-layout-split-gap: 0; min-block-size: 100vh">
${sidebar(current)}
  <div class="m-cluster" data-align="start" data-gap="12" style="padding: var(--m-space-6) var(--m-space-8) var(--m-space-12); align-items: flex-start">
${main}
  </div>
</div>`;

// A quest-style goal: its name, an icon, and a thick bar with the count on it
const goal = (ic: string, tone: string, name: string, value: number, max: number) => `          <div class="m-stack" data-gap="2">
            <div class="m-cluster" data-justify="between"><span style="font-weight: var(--m-font-weight-bold)">${name}</span><span style="${hue(tone)}">${icon(ic, 22)}</span></div>
            <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap"><progress class="m-progress" value="${value}" max="${max}" style="flex: 1" aria-label="${name}">${value} of ${max}</progress><span class="m-muted" style="font-weight: var(--m-font-weight-bold); font-variant-numeric: tabular-nums">${value}/${max}</span></div>
          </div>`;

const groveCard = `        <section class="m-card" aria-labelledby="mg-grove">
          <div class="m-cluster" data-justify="between">
            <h2 id="mg-grove" style="${heading}">Copper grove</h2>
            <a href="#" style="${upper}; font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-bold); color: var(--m-color-accent-text); text-decoration: none">View grove</a>
          </div>
          <div class="m-cluster" data-gap="4" style="flex-wrap: nowrap">
            <span style="${hue('warning-fg')}">${icon(I.trophy, 40)}</span>
            <p class="m-muted">You’re in 6th place. Finish 2 more lessons to move up before Sunday.</p>
          </div>
        </section>`;

const goalsCard = `        <section class="m-card" aria-labelledby="mg-goals">
          <div class="m-cluster" data-justify="between">
            <h2 id="mg-goals" style="${heading}">Today’s goals</h2>
            <a href="#" style="${upper}; font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-bold); color: var(--m-color-accent-text); text-decoration: none">View all</a>
          </div>
${goal(I.zap, 'warning-fg', 'Earn 40 seeds', 26, 40)}
${goal(I.clock, 'info-fg', 'Practise for 12 minutes', 12, 12)}
${goal(I.target, 'danger-fg', 'Get 4 answers right in a row', 1, 4)}
        </section>`;

// A round lesson button on the path: done (green with a tick), current (green with a star and a
// "Start" bubble), or locked (grey)
const node = (state: 'done' | 'current' | 'locked', offset: number, ic: string, name: string) => {
  const shape = `inline-size: 4.5rem; block-size: 4rem; border-radius: 50%; margin-inline-start: calc(var(--m-space-12) * ${offset})`;
  if (state === 'locked')
    return `          <button type="button" class="m-button" data-icon-only aria-label="${name}, locked" style="${shape}; --m-button-secondary-bg: var(--m-color-border-default); --m-button-secondary-hover-bg: var(--m-color-border-default); --m-button-secondary-fg: var(--m-color-fg-subtle)">${icon(ic, 30)}</button>`;
  const btn = `<button type="button" class="m-button" data-variant="primary" data-icon-only aria-label="${name}${state === 'done' ? ', done' : ''}" style="${shape}">${icon(ic, 30)}</button>`;
  if (state === 'done') return `          ${btn}`;
  return `          <span class="m-tooltip" data-tip="Start" data-open style="margin-block-start: var(--m-space-12); margin-inline-start: calc(var(--m-space-12) * ${offset})">
            ${btn.replace(`; margin-inline-start: calc(var(--m-space-12) * ${offset})`, '')}
          </span>`;
};

const dashboard = shell(
  'Path',
  `      <main class="m-stack" data-gap="8" style="flex: 1 1 30rem; max-inline-size: 38rem; margin-inline: auto">
        <section class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding: var(--m-space-4) var(--m-space-5); border-radius: var(--m-radius-lg); background: var(--m-color-brand-default); color: var(--m-color-brand-fg); border-block-end: var(--m-border-width-thick) solid var(--m-color-accent-default)" aria-labelledby="mg-unit">
          <div class="m-stack" data-gap="1">
            <span style="${upper}; font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-bold); opacity: 0.8">Section 2, unit 4</span>
            <h1 id="mg-unit" style="${heading}">Repot a root-bound plant</h1>
          </div>
          <button type="button" class="m-button" data-size="sm">${icon(I.book, 18)} Guide</button>
        </section>
        <div class="m-stack" data-gap="5" data-align="center" role="list" aria-label="Lessons in this unit">
${node('done', 0, I.check, 'Spot the signs')}
${node('done', -1, I.check, 'Pick a pot')}
${node('current', -2, I.star, 'Loosen the roots')}
${node('locked', -1, I.droplet, 'First watering')}
${node('locked', 0, I.sun, 'Find the light')}
${node('locked', 1, I.trophy, 'Unit review')}
        </div>
        <div class="m-cluster" data-gap="4" style="flex-wrap: nowrap">
          <hr class="m-divider" style="flex: 1">
          <span style="${label}">Unit 5 · Pests without panic</span>
          <hr class="m-divider" style="flex: 1">
        </div>
      </main>
${rail(`${groveCard}
${goalsCard}`)}`,
);

// The grove: a weekly ranking. Open rows with no lines between them, the learner's own row in the pale
// well, and the promotion line as a labelled divider
const ranked = (n: number, initials: string, name: string, seeds: number, me = false, tone = '') =>
  `            <li class="m-cluster" data-gap="4" style="flex-wrap: nowrap; padding: var(--m-space-3) var(--m-space-4); border-radius: var(--m-radius-md)${me ? '; background: var(--m-color-bg-sunken)' : ''}">
              <span style="inline-size: 1.5rem; text-align: center; font-weight: var(--m-font-weight-bold); ${n <= 3 ? hue('warning-fg') : me ? '' : hue('fg-muted')}">${n}</span>
              <span class="m-avatar"${tone ? ` style="background: var(--m-color-${tone}-bg); color: var(--m-color-${tone}-fg)"` : ''} aria-hidden="true">${initials}</span>
              <span style="flex: 1; font-weight: var(--m-font-weight-bold)">${name}</span>
              <span style="font-variant-numeric: tabular-nums; ${me ? '' : hue('fg-muted')}">${seeds} seeds</span>
            </li>`;

const listDetail = shell(
  'Groves',
  `      <main class="m-stack" data-gap="6" style="flex: 1 1 30rem; max-inline-size: 38rem; margin-inline: auto">
        <div class="m-stack" data-gap="3" data-align="center" style="text-align: center">
          <span style="${hue('warning-fg')}">${icon(I.trophy, 48)}</span>
          <h1 style="${pageTitle}">Copper grove</h1>
          <p class="m-muted">The top 8 move up to the Bronze grove</p>
          <span class="m-cluster" data-gap="1" style="${upper}; font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-bold); ${hue('warning-fg')}">${icon(I.clock, 16)} 3 days left</span>
        </div>
        <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Ranking">
          <button type="button" class="m-tab" role="tab" aria-selected="true">This week</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Friends</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">All time</button>
        </div></div>
        <ol class="m-stack" data-gap="0" style="padding: 0; border-block-start: ${line}">
${ranked(1, 'TO', 'Tomasz Okafor', 812, false, 'warning')}
${ranked(2, 'LV', 'Lin Vanterpool', 774, false, 'info')}
${ranked(3, 'RA', 'Rosa Abernathy', 701, false, 'danger')}
${ranked(4, 'KM', 'Kenji Marchetti', 655, false, 'success')}
${ranked(5, 'BD', 'Bea Dunmore', 590, false, 'info')}
${ranked(6, 'YO', 'You', 548, true)}
${ranked(7, 'ES', 'Ezra Szabo', 512, false, 'warning')}
${ranked(8, 'NP', 'Nia Pellegrino', 496, false, 'danger')}
            <li class="m-cluster" data-gap="3" data-justify="center" style="padding-block: var(--m-space-3); ${upper}; font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-bold); color: var(--m-color-success-fg)">${icon(I.down, 18)} Promotion zone ${icon(I.down, 18)}</li>
${ranked(9, 'AH', 'Arlo Hutchins', 430, false, 'success')}
${ranked(10, 'MF', 'Mira Fairweather', 402, false, 'info')}
        </ol>
      </main>
${rail(`        <section class="m-card" aria-labelledby="mg-person">
          <div class="m-cluster" data-gap="4" style="flex-wrap: nowrap">
            <span class="m-avatar" data-size="lg" style="background: var(--m-color-warning-bg); color: var(--m-color-warning-fg)" aria-hidden="true">TO</span>
            <div class="m-stack" data-gap="1">
              <h2 id="mg-person" style="${heading}">Tomasz Okafor</h2>
              <span class="m-muted" style="font-size: var(--m-font-size-sm)">Growing since March 2024</span>
            </div>
          </div>
          <div class="m-cluster" data-gap="2">
            <button type="button" class="m-button" style="flex: 1">${icon(I.userPlus, 18)} Follow</button>
            <button type="button" class="m-button" data-icon-only aria-label="Share profile">${icon(I.share, 18)}</button>
          </div>
          <h3 style="${label}">Stats</h3>
          <div class="m-grid" style="--m-layout-grid-min: 8rem; --m-layout-grid-gap: var(--m-space-3)">
            <div class="m-card" data-size="sm" style="gap: 0; border-block-end-width: var(--m-border-width-thick)"><span class="m-cluster" data-gap="2" style="font-weight: var(--m-font-weight-bold)"><span style="${hue('warning-fg')}">${icon(I.flame, 20)}</span>61</span><span class="m-muted" style="font-size: var(--m-font-size-sm)">Day run</span></div>
            <div class="m-card" data-size="sm" style="gap: 0; border-block-end-width: var(--m-border-width-thick)"><span class="m-cluster" data-gap="2" style="font-weight: var(--m-font-weight-bold)"><span style="${hue('info-fg')}">${icon(I.gem, 20)}</span>9,306</span><span class="m-muted" style="font-size: var(--m-font-size-sm)">Seeds earned</span></div>
            <div class="m-card" data-size="sm" style="gap: 0; border-block-end-width: var(--m-border-width-thick)"><span class="m-cluster" data-gap="2" style="font-weight: var(--m-font-weight-bold)"><span style="${hue('success-fg')}">${icon(I.tree, 20)}</span>Silver</span><span class="m-muted" style="font-size: var(--m-font-size-sm)">Best grove</span></div>
            <div class="m-card" data-size="sm" style="gap: 0; border-block-end-width: var(--m-border-width-thick)"><span class="m-cluster" data-gap="2" style="font-weight: var(--m-font-weight-bold)"><span style="${hue('danger-fg')}">${icon(I.crown, 20)}</span>3</span><span class="m-muted" style="font-size: var(--m-font-size-sm)">Grove wins</span></div>
          </div>
        </section>`)}`,
);

// Onboarding: one question per screen. A close button and a thick progress bar on top, a heavy question
// centred over a grid of choice tiles (the reference's first-use screen: square outlined tiles on a 4px lip,
// four across on wide screens, a picture over a name and a muted count), the picked tile in the sky tint with
// a blue outline, and a footer bar with the action. One question only: nothing else asked on the screen
const choice = (ic: string, tone: string, name: string, hint: string, selected = false) =>
  `          <button type="button" class="m-card" data-size="sm" role="radio" aria-checked="${selected}" style="align-items: center; gap: var(--m-space-3); padding-block: var(--m-space-6); text-align: center; font: inherit; color: inherit; cursor: pointer; border-block-end-width: var(--m-border-width-thick)${selected ? '; background: var(--m-color-info-bg); border-color: var(--m-color-info-border); color: var(--m-color-info-fg)' : ''}">
            <span style="display: grid; place-items: center; inline-size: 4.5rem; block-size: 3.5rem; border-radius: var(--m-radius-md); background: var(--m-color-${tone}-bg); color: var(--m-color-${tone}-fg)">${icon(ic, 32)}</span>
            <span style="font-weight: var(--m-font-weight-bold)">${name}</span>
            <span style="font-size: var(--m-font-size-sm)${selected ? '' : '; color: var(--m-color-fg-muted)'}">${hint}</span>
          </button>`;

const onboarding = `<div class="m-stack" data-gap="0" style="min-block-size: 100vh">
  <header class="m-cluster" data-gap="4" style="flex-wrap: nowrap; padding: var(--m-space-8) var(--m-space-6) var(--m-space-4); max-inline-size: 64rem; inline-size: 100%; margin-inline: auto">
    <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Close" style="--m-button-ghost-fg: var(--m-color-fg-subtle)">${icon(I.x, 24)}</button>
    <progress class="m-progress" data-size="lg" value="2" max="5" style="flex: 1" aria-label="Step 2 of 5">Step 2 of 5</progress>
  </header>
  <main class="m-container" style="flex: 1; padding-block: var(--m-space-10)">
    <div class="m-stack" data-gap="10" style="max-inline-size: 54rem; margin-inline: auto">
      <h1 style="${pageTitle}; text-align: center">What would you like to grow first?</h1>
      <div class="m-grid" style="--m-layout-grid-min: 10rem; --m-layout-grid-gap: var(--m-space-4)" role="radiogroup" aria-label="First goal">
${choice(I.leaf, 'success', 'Houseplants', '24 lessons')}
${choice(I.sprout, 'success', 'Windowsill herbs', '18 lessons', true)}
${choice(I.shovel, 'warning', 'A vegetable bed', '31 lessons')}
${choice(I.sun, 'danger', 'Balcony flowers', '22 lessons')}
${choice(I.droplet, 'info', 'Watering well', '12 lessons')}
${choice(I.tree, 'success', 'Fruit trees', '27 lessons')}
${choice(I.leaf, 'warning', 'Succulents', '15 lessons')}
${choice(I.sun, 'info', 'Shade gardens', '19 lessons')}
      </div>
    </div>
  </main>
  <footer style="border-block-start: ${line}">
    <div class="m-cluster" data-justify="between" style="padding: var(--m-space-6); max-inline-size: 64rem; margin-inline: auto">
      <button type="button" class="m-button" data-size="lg" style="min-inline-size: 9rem">Skip</button>
      <button type="button" class="m-button" data-variant="primary" data-size="lg" style="min-inline-size: 9rem">Continue</button>
    </div>
  </footer>
</div>`;

// Settings: the form on the left, under a heavy title and grey uppercase group labels; toggles as
// rows separated by 2px lines; the settings menu as an outlined card on the right
const toggle = (name: string, hint: string, on: boolean) =>
  `          <label class="m-cluster" data-justify="between" style="flex-wrap: nowrap; gap: var(--m-space-6); padding-block: var(--m-space-4); border-block-start: ${line}">
            <span class="m-stack" data-gap="0"><span style="font-weight: var(--m-font-weight-bold)">${name}</span><span class="m-muted" style="font-size: var(--m-font-size-sm)">${hint}</span></span>
            <input class="m-switch" type="checkbox" role="switch"${on ? ' checked' : ''}>
          </label>`;

const settingsNav = (items: string[], current: string) =>
  items
    .map(
      (l) =>
        `            <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''} style="${upper}">${l}</a></li>`,
    )
    .join('\n');

const settings = shell(
  'Profile',
  `      <main class="m-stack" data-gap="8" style="flex: 1 1 30rem; max-inline-size: 38rem; margin-inline: auto">
        <div class="m-cluster" data-justify="between">
          <h1 style="${pageTitle}">Preferences</h1>
          <button type="button" class="m-button" data-variant="primary" data-size="sm">Save changes</button>
        </div>
        <section class="m-stack" data-gap="0" aria-labelledby="mg-set-lessons">
          <h2 id="mg-set-lessons" style="${label}; padding-block-end: var(--m-space-2)">Lessons</h2>
${toggle('Sound effects', 'A chime for right answers, a thud for wrong ones', true)}
${toggle('Cheer me on', 'Short messages between exercises', true)}
${toggle('Read-aloud exercises', 'Plant names spoken by a gardener', false)}
${toggle('Photo exercises', 'Identify leaves and pests from pictures', true)}
        </section>
        <section class="m-stack" data-gap="4" aria-labelledby="mg-set-account">
          <h2 id="mg-set-account" style="${label}">Account</h2>
          <div class="m-field">
            <label class="m-field-label" for="mg-set-name">Name</label>
            <input class="m-input" id="mg-set-name" value="Saoirse Lindqvist">
          </div>
          <div class="m-field">
            <label class="m-field-label" for="mg-set-user">Username</label>
            <input class="m-input" id="mg-set-user" value="saoirse.grows">
            <p class="m-field-hint">Others find you by this in groves.</p>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="mg-set-email">Email</label>
            <input class="m-input" id="mg-set-email" type="email" value="saoirse@example.net">
          </div>
          <div class="m-field">
            <label class="m-field-label" for="mg-set-time">Reminder time</label>
            <select class="m-select" id="mg-set-time"><option>7:30 am</option><option selected>6:00 pm</option><option>9:00 pm</option></select>
          </div>
        </section>
        <section class="m-stack" data-gap="3" style="padding-block-start: var(--m-space-6); border-block-start: ${line}" aria-labelledby="mg-set-danger">
          <h2 id="mg-set-danger" style="${label}">Leave</h2>
          <div class="m-cluster" data-gap="3">
            <button type="button" class="m-button">Export my data</button>
            <button type="button" class="m-button" data-variant="danger">Delete account</button>
          </div>
        </section>
      </main>
      <aside class="m-stack" data-gap="6" style="flex: 1 1 18rem; max-inline-size: 23rem">
        <nav class="m-card" aria-labelledby="mg-set-nav" style="padding: var(--m-space-4)">
          <h2 id="mg-set-nav" style="${heading}; padding: var(--m-space-2) var(--m-space-4)">Settings</h2>
          <ul class="m-stack" data-gap="1" style="padding: 0; list-style: none; font-weight: var(--m-font-weight-bold)">
${settingsNav(['Account', 'Preferences', 'Profile', 'Reminders', 'Courses', 'Privacy'], 'Preferences')}
          </ul>
        </nav>
        <nav class="m-card" aria-label="Subscription" style="padding: var(--m-space-4)">
          <ul class="m-stack" data-gap="1" style="padding: 0; list-style: none; font-weight: var(--m-font-weight-bold)">
${settingsNav(['Plus membership', 'Help centre'], '')}
          </ul>
        </nav>
      </aside>`,
);

// Empty state: a large icon in a pale circle, a heavy heading, one sentence, the action and a
// quieter one
const emptyState = shell(
  'Profile',
  `      <main class="m-stack" data-gap="6" style="flex: 1 1 30rem; max-inline-size: 38rem; margin-inline: auto">
        <h1 style="${pageTitle}">Friends</h1>
        <div class="m-tabs"><div class="m-tab-list" role="tablist" aria-label="Friends">
          <button type="button" class="m-tab" role="tab" aria-selected="true">Following</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Followers</button>
        </div></div>
        <section class="m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-12)" aria-labelledby="mg-empty">
          <span style="display: grid; place-items: center; inline-size: 7rem; block-size: 7rem; border-radius: 50%; background: var(--m-color-info-bg); color: var(--m-color-info-fg)">${icon(I.users, 56)}</span>
          <h2 id="mg-empty" style="${heading}">Gardening is better together</h2>
          <p class="m-muted" style="max-inline-size: 24rem">Follow friends to compare groves, swap tips and cheer each other on when a plant pulls through.</p>
          <div class="m-stack" data-gap="3" style="inline-size: 100%; max-inline-size: 20rem">
            <button type="button" class="m-button" data-variant="primary">${icon(I.userPlus, 20)} Find friends</button>
            <button type="button" class="m-button">${icon(I.mail, 20)} Invite by email</button>
          </div>
        </section>
      </main>
${rail(goalsCard)}`,
);

// Pricing: a heavy lowercase headline, three plan columns joined side by side (the paid one raised,
// white, outlined in blue with a tick badge), each a header band and a list of ticks and crosses,
// then one big action and the questions as an outlined accordion
const perk = (name: string, has: boolean) =>
  `              <li class="m-cluster" data-gap="2" style="flex-wrap: nowrap; ${has ? '' : hue('fg-muted')}"><span style="display: inline-flex; ${hue(has ? 'success-fg' : 'fg-subtle')}" aria-label="${has ? 'Included' : 'Not included'}">${icon(has ? I.check : I.x, 20)}</span>${name}</li>`;
const plan = (name: string, price: string, note: string, perks: [string, boolean][], picked = false) =>
  `        <section class="m-stack" data-gap="0" style="flex: 1 1 15rem; border: ${picked ? 'var(--m-border-width-thin) solid var(--m-color-info-border)' : line}; border-radius: var(--m-radius-lg); background: var(--m-color-bg-surface); overflow: hidden${picked ? '; box-shadow: var(--m-shadow-md); margin-block: calc(var(--m-space-3) * -1)' : ''}" aria-labelledby="mg-plan-${name.toLowerCase()}">
          <div class="m-stack" data-gap="1" style="padding: var(--m-space-5) var(--m-space-6); background: var(--m-color-${picked ? 'info-bg' : 'bg-sunken'})${picked ? '; color: var(--m-color-info-fg)' : ''}">
            <div class="m-cluster" data-justify="between"><h2 id="mg-plan-${name.toLowerCase()}" style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-bold)">${name}</h2>${picked ? `<span class="m-badge" data-tone="info" data-variant="solid" style="font-size: var(--m-font-size-sm)">${icon(I.check, 14)} Most picked</span>` : ''}</div>
            <span style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold); font-variant-numeric: tabular-nums; color: var(--m-color-fg-default)">${price}</span>
            <span style="font-size: var(--m-font-size-sm)${picked ? '' : '; color: var(--m-color-fg-muted)'}">${note}</span>
          </div>
          <ul class="m-stack" data-gap="3" style="padding: var(--m-space-5) var(--m-space-6) var(--m-space-6); list-style: none">
${perks.map(([n, h]) => perk(n, h)).join('\n')}
          </ul>
        </section>`;
const perks = (a: boolean[]): [string, boolean][] =>
  ['Every course and lesson', 'Practice from your mistakes', 'Unlimited hearts', 'No breaks between lessons', 'Offline lessons', 'A shared progress board'].map((n, i) => [n, a[i]]);

const pricing = `<div class="m-stack" data-gap="0">
  <header class="m-navbar">
    <a class="m-navbar-brand" href="#" style="color: var(--m-color-brand-default); font-size: var(--m-font-size-xl)">bramblewood</a>
    <div class="m-navbar-actions" style="margin-inline-start: auto">
      <a class="m-button" data-size="sm" href="#">Log in</a>
    </div>
  </header>
  <main class="m-container" style="padding-block: var(--m-space-12) var(--m-space-16)">
    <div class="m-stack" data-gap="10">
      <div class="m-stack" data-gap="4" data-align="center" style="text-align: center">
        <h1 style="${display}; color: var(--m-color-brand-default)">grow further with plus</h1>
        <p class="m-muted" style="max-inline-size: 34rem">Every lesson stays free. Plus takes away the waiting, adds practice made from your mistakes, and keeps your hearts full.</p>
        <label class="m-field" data-layout="inline" style="font-weight: var(--m-font-weight-bold)"><input class="m-switch" type="checkbox" role="switch" checked> Pay yearly and save 35%</label>
      </div>
      <div class="m-cluster" data-align="stretch" data-gap="0" style="max-inline-size: 56rem; inline-size: 100%; margin-inline: auto; gap: var(--m-space-3)">
${plan('Free', '$0', 'Always free', perks([true, false, false, false, false, false]))}
${plan('Plus', '$5.75 a month', 'Billed $69 a year', perks([true, true, true, true, true, false]), true)}
${plan('Household', '$9.50 a month', 'Up to 5 people', perks([true, true, true, true, true, true]))}
      </div>
      <div class="m-stack" data-gap="3" data-align="center">
        <button type="button" class="m-button" data-variant="primary" data-size="lg" style="min-inline-size: 18rem">Try plus free for 14 days</button>
        <p class="m-muted" style="font-size: var(--m-font-size-sm)">We’ll remind you 2 days before the trial ends. Cancel in two taps.</p>
      </div>
      <section class="m-stack" data-gap="4" aria-labelledby="mg-faq" style="max-inline-size: 44rem; margin-inline: auto; inline-size: 100%">
        <h2 id="mg-faq" style="${pageTitle}; text-align: center">Questions</h2>
        <div class="m-accordion">
          <details class="m-accordion-item" name="mg-faq" open><summary>Can I keep learning if I don’t subscribe?</summary><div class="m-accordion-content">Yes. Every course, lesson and grove is free. Plus only removes limits and adds extra practice.</div></details>
          <details class="m-accordion-item" name="mg-faq"><summary>How does the household plan work?</summary><div class="m-accordion-content">One person pays and invites up to four others by email. Each keeps their own path and progress.</div></details>
          <details class="m-accordion-item" name="mg-faq"><summary>What happens when the trial ends?</summary><div class="m-accordion-content">Your plan starts on day 15 unless you cancel. Nothing you learned is lost either way.</div></details>
        </div>
      </section>
    </div>
  </main>
</div>`;

// Errors: the field turns red with its message below; a summary alert above the form; the answer
// banners in the pale tints; and full pages with a big icon in a pale circle
// The answer banner under an exercise: the pale tint, a big icon in a white circle, a heavy title in
// the tone, one line, and the button on the right
const banner = (tone: string, ic: string, title: string, body: string, action: string) =>
  `      <div class="m-cluster" data-justify="between" data-gap="4" role="status" style="padding: var(--m-space-6); border-radius: var(--m-radius-lg); background: var(--m-color-${tone}-bg); color: var(--m-color-${tone}-fg)">
        <div class="m-cluster" data-gap="4" style="flex-wrap: nowrap">
          <span style="display: grid; place-items: center; flex: none; inline-size: 4rem; block-size: 4rem; border-radius: 50%; background: var(--m-color-bg-surface)">${icon(ic, 36)}</span>
          <div class="m-stack" data-gap="1"><strong style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-bold)">${title}</strong><span>${body}</span></div>
        </div>
        ${action}
      </div>`;

const errorPage = (code: string, ic: string, tone: string, title: string, body: string, actions: string) =>
  `    <section class="m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-12); border-block-start: ${line}" aria-labelledby="mg-err-${code}">
      <span style="display: grid; place-items: center; inline-size: 6rem; block-size: 6rem; border-radius: 50%; background: var(--m-color-${tone}-bg); color: var(--m-color-${tone}-fg)">${icon(ic, 48)}</span>
      <span style="${label}">Error ${code}</span>
      <h2 id="mg-err-${code}" style="${pageTitle}">${title}</h2>
      <p class="m-muted" style="max-inline-size: 26rem">${body}</p>
      <div class="m-stack" data-gap="3" style="inline-size: 100%; max-inline-size: 20rem">${actions}</div>
    </section>`;

const errors = `<main class="m-container" data-size="md" style="padding-block: var(--m-space-12)">
  <div class="m-stack" data-gap="10">
    <section class="m-stack" data-gap="5" aria-labelledby="mg-err-form">
      <h1 id="mg-err-form" style="${pageTitle}">Create your profile</h1>
      <div class="m-alert" data-tone="danger" role="alert">
        <span class="m-alert-icon">${icon(I.alert, 22)}</span>
        <div class="m-alert-content"><div class="m-alert-title">2 things to fix</div><div class="m-alert-body">Your profile wasn’t saved yet. Check the username and your age.</div></div>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="mg-err-user">Username</label>
        <input class="m-input" id="mg-err-user" value="fern" aria-invalid="true" aria-describedby="mg-err-user-e">
        <p class="m-field-error" id="mg-err-user-e">That username is taken. Try fern.at.home or ferngrows.</p>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="mg-err-age">Age</label>
        <input class="m-input" id="mg-err-age" inputmode="numeric" value="" aria-invalid="true" aria-describedby="mg-err-age-e">
        <p class="m-field-error" id="mg-err-age-e">Enter your age so we can suggest the right courses.</p>
      </div>
      <button type="submit" class="m-button" data-variant="primary">Create profile</button>
    </section>
    <section class="m-stack" data-gap="3" aria-label="Answer feedback">
${banner('success', I.circleCheck, 'Nicely done!', 'Rosemary likes to dry out between waterings.', '<button type="button" class="m-button" data-variant="primary">Continue</button>')}
${banner('danger', I.alert, 'Correct answer:', 'Yellow lower leaves usually mean too much water.', '<button type="button" class="m-button" data-variant="danger">Got it</button>')}
      <div class="m-toast" data-tone="danger" role="alert"><div class="m-toast-content"><div class="m-toast-title">Lesson didn’t sync</div><div class="m-toast-body">Your 3 answers are saved on this device and will sync when you’re back online.</div></div><button type="button" class="m-button" data-size="sm">Retry</button></div>
    </section>
${errorPage('404', I.compass, 'info', 'We can’t find that page', 'The link may be old, or the lesson has moved to another unit.', `<a class="m-button" data-variant="primary" href="#">Back to my path</a>`)}
${errorPage('500', I.wrench, 'warning', 'Something broke on our end', 'Your progress is safe. Try again in a moment.', `<button type="button" class="m-button" data-variant="primary">Try again</button><a class="m-button" href="#">Check service status</a>`)}
${errorPage('403', I.lock, 'danger', 'This grove is private', 'Only members can see it. Ask the owner for an invite.', `<button type="button" class="m-button" data-variant="primary">Ask to join</button><a class="m-button" href="#">Go back</a>`)}
  </div>
</main>`;

export const marigoldRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'A side column of uppercase nav, a green unit banner on a lip above round lesson buttons, and a right column of stats and outlined goal cards with thick progress bars.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'A weekly ranking under a big icon and heavy title: open rows with tinted initials, the learner’s own row in pale green, a promotion divider; a person’s card with stat tiles beside it.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One question per screen: a close button and thick progress bar, a heavy centred question over a grid of choice tiles on a lip (the picked one in the sky tint with a blue outline), and a footer bar with Skip and Continue.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A heavy title with Save, grey uppercase group labels, toggles in rows on 2px lines, inputs in pale wells, and the settings menu as an outlined card on the right.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description: 'A large icon in a pale circle, a heavy heading, one friendly sentence, and stacked full-width buttons.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'A heavy lowercase headline in green, three plan columns side by side with the paid one raised and outlined in blue, ticks and crosses, one big action, and the questions as an outlined accordion.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors under the field, a summary alert above the form, right and wrong answer banners, a toast, and full pages for 404, 500 and no access.',
    html: errors,
  },
];
