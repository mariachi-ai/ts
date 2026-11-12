import type { ArchetypeRecipe } from '../types';

/*
 * Solace's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from a made-up wellbeing app, "lull". They follow the
 * language's real screen patterns, translated from the phone to a desktop width: a white header
 * with charcoal links and one blue pill, a day laid out as a timeline of big bordered session cards,
 * the warm off-white player with a round orange play button, streak dots, flat colour tiles, a
 * segmented control with a solid charcoal selection, settings as rows with small capital EDIT
 * links, and a midnight-blue dark mode. Artwork is never drawn: flat token shapes stand in for it.
 */

// Lucide icons, outlined, 2px stroke, round caps
const icon = (paths: string, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
// Play and other glyphs that the reference fills
const solid = (paths: string, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  heart:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  play: '<path d="M6 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L7.5 3.64A1 1 0 0 0 6 4.5z"/>',
  headphones:
    '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  video:
    '<path d="m16 13 5.22 3.48a.5.5 0 0 0 .78-.42V7.94a.5.5 0 0 0-.76-.43L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  pencil:
    '<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/><path d="m15 5 4 4"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  flame:
    '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  notebook:
    '<path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M16 2v20"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  download: '<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  rewind: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  forward: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  calendar:
    '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
  unplug:
    '<path d="m19 5 3-3"/><path d="m2 22 3-3"/><path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"/><path d="M7.5 13.5 10 11"/><path d="M10.5 16.5 13 14"/><path d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z"/>',
};

const tone = {
  brand: 'var(--m-color-brand-default)',
  sun: 'var(--m-color-warning-solid)',
  blue: 'var(--m-color-accent-default)',
  night: 'var(--m-tooltip-bg)',
  pale: 'var(--m-color-bg-sunken)',
  white: 'var(--m-color-bg-surface)',
};

// Flat token shapes in place of artwork: a band of colour, a big circle rising over a hill
const art = (bg: string, sun: string, hill: string, h = '7.5rem', radius = 'var(--m-radius-md)') =>
  `<svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" width="100%" style="display: block; block-size: ${h}; border-radius: ${radius}; background: ${bg}" aria-hidden="true"><circle cx="128" cy="78" r="46" style="fill: ${sun}"/><path d="M0 92 Q60 64 120 88 T200 84 V120 H0 Z" style="fill: ${hill}"/></svg>`;

const h1 =
  'font-size: var(--m-font-size-3xl); font-weight: 700; letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)';
const h2 =
  'font-size: var(--m-font-size-2xl); font-weight: 700; letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)';
const h3 =
  'font-size: var(--m-font-size-xl); font-weight: 700; letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)';
const meta = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
const rule = 'border-block-start: 2px solid var(--m-color-border-default)';
const caps =
  'font-size: var(--m-font-size-sm); font-weight: 700; text-transform: uppercase; letter-spacing: var(--m-font-tracking-wide); color: var(--m-color-accent-text); text-decoration: none';

// The brand mark: an orange disc and the app's name in lower case
const brand = `<a class="m-navbar-brand" href="#"><svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="14" style="fill: var(--m-color-brand-default)"/></svg>lull</a>`;

const navItems = ['Home', 'Library', 'Rest', 'Journal', 'Coaching'];
const header = (current: string) => `<header class="m-navbar">
  ${brand}
  <nav class="m-navbar-nav" aria-label="Main">
    <ul>
${navItems.map((l) => `      <li><a class="m-navbar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${l}</a></li>`).join('\n')}
    </ul>
  </nav>
  <div class="m-navbar-actions">
    <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Saved">${icon(I.heart)}</button>
    <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="History">${icon(I.history)}</button>
    <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Notifications">${icon(I.bell)}</button>
    <span class="m-avatar" aria-label="Priya Raman">PR</span>
  </div>
</header>`;

const metaLine = (ic: string, text: string) =>
  `<span class="m-cluster" data-gap="2" style="${meta}">${icon(ic, 16)} ${text}</span>`;

// A session card in the day's timeline: a bold title, two lines of detail with icons, a picture
const session = (
  title: string,
  kind: [string, string],
  length: string,
  pic: string,
  state: 'now' | 'next' | 'done',
  featured = false,
) => {
  const marker =
    state === 'now'
      ? `<span style="inline-size: 1.25rem; block-size: 1.25rem; border-radius: 9999px; background: var(--m-color-brand-default)" aria-label="Up next"></span>`
      : state === 'done'
        ? `<span style="display: inline-grid; place-items: center; inline-size: 1.25rem; block-size: 1.25rem; border-radius: 9999px; background: var(--m-color-success-solid); color: var(--m-color-success-on-solid)" aria-label="Done">${icon(I.check, 12)}</span>`
        : `<span style="inline-size: 1.25rem; block-size: 1.25rem; border-radius: 9999px; border: 2px solid var(--m-color-border-default); background: var(--m-color-bg-surface)" aria-label="Later"></span>`;
  return `            <li class="m-cluster" data-gap="4" data-align="center" style="flex-wrap: nowrap">
              <span style="display: grid; place-items: center; inline-size: 1.25rem; flex: none">${marker}</span>
              <a href="#" class="m-card" data-interactive style="flex: 1; text-decoration: none; color: inherit${featured ? '; box-shadow: var(--m-shadow-md)' : ''}">
                <div class="m-card-body m-cluster" data-justify="between" data-gap="4" style="flex-wrap: nowrap">
                  <div class="m-stack" data-gap="2">
                    <h3 style="${featured ? h2 : h3}">${title}</h3>
                    ${metaLine(kind[0], kind[1])}
                    ${metaLine(I.clock, length)}
                  </div>
                  <div style="inline-size: 40%; max-inline-size: 15rem; flex: none">${pic}</div>
                </div>
              </a>
            </li>`;
};

// The streak: seven dots for the week, filled orange for each day with a session
const week = (days: [string, 'done' | 'today' | 'later'][]) =>
  days
    .map(
      ([d, s]) =>
        `<li class="m-stack" data-gap="1" data-align="center"><span style="display: grid; place-items: center; inline-size: 2rem; block-size: 2rem; border-radius: 9999px; ${s === 'done' ? 'background: var(--m-color-brand-default); color: var(--m-color-brand-fg)' : s === 'today' ? 'border: 2px solid var(--m-color-brand-default)' : 'background: var(--m-color-bg-sunken)'}">${s === 'done' ? icon(I.check, 14) : ''}</span><span style="${meta}">${d}</span></li>`,
    )
    .join('');

// The session player: the warm off-white panel, a round orange play button, the scrubber and times.
// On the panel the scrubber's track is the soft border and the played part the brand orange, as in
// the reference; the times carry the position in text.
const player = (
  title: string,
  sub: string,
  at: string,
  total: string,
  value: number,
) => `<section class="m-card" data-variant="sunken" data-size="sm" aria-label="Player: ${title}" style="border-radius: var(--m-radius-md)">
            <div class="m-cluster" data-gap="4" style="flex-wrap: nowrap">
              <button type="button" class="m-button" data-icon-only aria-label="Play ${title}" style="--m-button-secondary-bg: var(--m-color-brand-default); --m-button-secondary-fg: var(--m-color-brand-fg); --m-button-secondary-hover-bg: var(--m-color-brand-default); flex: none">${solid(I.play, 20)}</button>
              <div class="m-stack" data-gap="2" style="flex: 1 1 0; min-inline-size: 0">
                <div class="m-stack" data-gap="0"><span style="font-weight: 700; letter-spacing: var(--m-font-tracking-tight)">${title}</span><span style="${meta}">${sub}</span></div>
                <progress class="m-progress" data-size="sm" value="${value}" max="100" aria-label="${at} of ${total} played" style="--m-progress-track: var(--m-color-border-default); --m-progress-fill: var(--m-color-brand-default)">${value}%</progress>
                <div class="m-cluster" data-justify="between" style="font-size: var(--m-font-size-xs); color: var(--m-color-fg-muted); font-variant-numeric: tabular-nums"><span>${at}</span><span>${total}</span></div>
              </div>
            </div>
          </section>`;

// A flat colour tile with a bold label and a shape in the corner
const tile = (label: string, bg: string, fg: string, shape: string) =>
  `<a href="#" style="position: relative; display: flex; align-items: center; justify-content: center; block-size: 5.5rem; border-radius: var(--m-radius-md); overflow: hidden; background: ${bg}; color: ${fg}; font-size: var(--m-font-size-xl); font-weight: 700; letter-spacing: var(--m-font-tracking-tight); text-decoration: none"><svg viewBox="0 0 100 60" width="100%" height="100%" preserveAspectRatio="none" style="position: absolute; inset: 0; opacity: 0.22" aria-hidden="true"><circle cx="86" cy="58" r="30" style="fill: ${shape}"/><circle cx="12" cy="8" r="6" style="fill: ${shape}"/></svg><span style="position: relative">${label}</span></a>`;

const dashboard = `${header('Home')}
<main class="m-container" style="padding-block: var(--m-space-8) var(--m-space-16)">
  <div class="m-stack" data-gap="8">
    <div class="m-stack" data-gap="2">
      <p style="font-size: var(--m-font-size-xl); color: var(--m-color-fg-muted)">Good evening, Priya</p>
      <h1 style="${h1}">Your evening</h1>
    </div>
    <div class="m-grid" style="--m-layout-grid-min: 22rem; --m-layout-grid-gap: var(--m-space-10); align-items: start; grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr))">
      <section aria-label="Tonight's plan" style="grid-column: span 2; min-inline-size: 0">
        <ol class="m-stack" data-gap="5" style="padding: 0; list-style: none; background: linear-gradient(var(--m-color-border-default), var(--m-color-border-default)) 0.5625rem 0 / 2px 100% no-repeat">
${session('Settle the day', [I.video, 'Video'], '4–6 min', art(tone.sun, tone.brand, tone.white, '8.5rem'), 'done', true)}
${session('Breathe out the to-do list', [I.headphones, 'Guided session'], '3 min', art(tone.blue, tone.sun, tone.pale), 'now')}
${session('Check in with yourself', [I.pencil, 'Reflection'], '5 min', art(tone.brand, tone.sun, tone.blue), 'next')}
${session('Drifting off by the lake', [I.moon, 'Sleep story'], '35 min', art(tone.night, tone.sun, tone.blue), 'next')}
        </ol>
      </section>
      <aside class="m-stack" data-gap="6" aria-label="Your progress">
        <section class="m-card" aria-labelledby="sl-streak">
          <div class="m-card-body m-stack" data-gap="4">
            <div class="m-cluster" data-justify="between">
              <h2 id="sl-streak" style="${h3}">Your streak</h2>
              <span class="m-cluster" data-gap="1" style="color: var(--m-color-brand-default)">${icon(I.flame, 20)}<span style="color: var(--m-color-fg-default); font-size: var(--m-font-size-2xl); font-weight: 700">9 days</span></span>
            </div>
            <ol class="m-cluster" data-justify="between" style="padding: 0; list-style: none">${week([
              ['M', 'done'],
              ['T', 'done'],
              ['W', 'done'],
              ['T', 'done'],
              ['F', 'today'],
              ['S', 'later'],
              ['S', 'later'],
            ])}</ol>
            <dl class="m-grid" style="--m-layout-grid-min: 7rem; --m-layout-grid-gap: var(--m-space-3)">
              <div class="m-stack" data-gap="1" style="padding: var(--m-space-3) var(--m-space-4); border-radius: var(--m-radius-md); background: var(--m-color-bg-sunken)"><dt style="${meta}">Minutes this week</dt><dd style="${h2}; font-variant-numeric: tabular-nums">68</dd></div>
              <div class="m-stack" data-gap="1" style="padding: var(--m-space-3) var(--m-space-4); border-radius: var(--m-radius-md); background: var(--m-color-bg-sunken)"><dt style="${meta}">Sessions</dt><dd style="${h2}; font-variant-numeric: tabular-nums">14</dd></div>
            </dl>
          </div>
        </section>
        ${player('Breathe out the to-do list', 'Guided session', '1:12', '3:00', 40)}
        <section class="m-stack" data-gap="3" aria-labelledby="sl-explore">
          <h2 id="sl-explore" style="${h3}">Explore</h2>
          <div class="m-grid" style="--m-layout-grid-min: 9rem; --m-layout-grid-gap: var(--m-space-3)">
            ${tile('Unwind', tone.brand, 'var(--m-color-brand-fg)', 'var(--m-color-warning-solid)')}
            ${tile('Rest', 'var(--m-tooltip-bg)', 'var(--m-tooltip-fg)', 'var(--m-color-warning-solid)')}
            ${tile('Focus', 'var(--m-color-accent-default)', 'var(--m-color-accent-fg)', 'var(--m-color-bg-surface)')}
            ${tile('Stretch', 'var(--m-color-warning-solid)', 'var(--m-color-warning-on-solid)', 'var(--m-color-brand-default)')}
          </div>
        </section>
      </aside>
    </div>
  </div>
</main>`;

const row = (title: string, kindIcon: string, kind: string, pic: string) => `            <li style="${rule}">
              <a href="#" class="m-cluster" data-gap="4" style="flex-wrap: nowrap; padding-block: var(--m-space-4); color: inherit; text-decoration: none">
                <span style="inline-size: 6rem; flex: none">${pic}</span>
                <span class="m-stack" data-gap="1" style="flex: 1"><span style="font-size: var(--m-font-size-lg); font-weight: 700; letter-spacing: var(--m-font-tracking-tight)">${title}</span>${metaLine(kindIcon, kind)}</span>
                <span style="color: var(--m-color-fg-default)">${icon(I.right)}</span>
              </a>
            </li>`;

const step = (
  n: number,
  title: string,
  length: string,
  state: 'done' | 'now' | 'locked',
) => `            <li class="m-cluster" data-gap="4" style="flex-wrap: nowrap; padding-block: var(--m-space-3); ${rule}">
              <span style="display: grid; place-items: center; inline-size: 2.5rem; block-size: 2.5rem; flex: none; border-radius: 9999px; ${state === 'done' ? 'background: var(--m-color-success-solid); color: var(--m-color-success-on-solid)' : state === 'now' ? 'background: var(--m-color-brand-default); color: var(--m-color-brand-fg)' : 'background: var(--m-color-bg-sunken); color: var(--m-color-fg-subtle)'}">${state === 'done' ? icon(I.check, 18) : state === 'now' ? solid(I.play, 14) : icon(I.lock, 16)}</span>
              <span class="m-stack" data-gap="0" style="flex: 1"><span style="font-weight: 700">Session ${n}: ${title}</span><span style="${meta}">${length}</span></span>
              ${state === 'done' ? '<span class="m-badge" data-tone="success">Done</span>' : state === 'now' ? '<span class="m-badge" data-variant="solid">Up next</span>' : ''}
            </li>`;

const listDetail = `${header('Library')}
<main class="m-container" style="padding-block: var(--m-space-8) var(--m-space-16)">
  <div class="m-grid" style="--m-layout-grid-min: 24rem; --m-layout-grid-gap: var(--m-space-12); align-items: start">
    <!-- The list: search, a segmented filter, then rows with a picture, a bold title and a line of detail -->
    <section class="m-stack" data-gap="5" aria-labelledby="sl-lib">
      <h1 id="sl-lib" style="${h1}">Library</h1>
      <div style="position: relative">
        <span style="position: absolute; inset-inline-start: var(--m-space-4); inset-block-start: 50%; translate: 0 -50%; color: var(--m-color-fg-default)">${icon(I.search)}</span>
        <input class="m-input" type="search" placeholder="Search sessions, guides and sounds" aria-label="Search the library" style="padding-inline-start: var(--m-space-12)">
      </div>
      <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Show">
        <button type="button" class="m-tab" role="tab" aria-selected="true">All</button>
        <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Courses</button>
        <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Singles</button>
        <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Sounds</button>
      </div></div>
      <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
${row('Kinder self-talk', I.headphones, 'Course · 21 days · 5–15 min', art(tone.brand, tone.sun, tone.white, '4.5rem', 'var(--m-radius-sm)'))}
${row('A softer Monday', I.headphones, 'Single · 8 min', art(tone.blue, tone.white, tone.sun, '4.5rem', 'var(--m-radius-sm)'))}
${row('Rain on a tin roof', I.moon, 'Sound · 45–120 min', art(tone.night, tone.blue, tone.brand, '4.5rem', 'var(--m-radius-sm)'))}
${row('Walking without hurry', I.compass, 'Activity · 12 min', art(tone.sun, tone.brand, tone.pale, '4.5rem', 'var(--m-radius-sm)'))}
${row('Letting a hard day go', I.headphones, 'Course · 7 days · 10 min', art(tone.pale, tone.brand, tone.blue, '4.5rem', 'var(--m-radius-sm)'))}
      </ul>
      <nav class="m-pagination" aria-label="Pages">
        <a class="m-pagination-item" href="#" aria-label="Previous page" aria-disabled="true">${icon(I.left, 16)}</a>
        <a class="m-pagination-item" href="#" aria-current="page">1</a>
        <a class="m-pagination-item" href="#">2</a>
        <a class="m-pagination-item" href="#">3</a>
        <span class="m-pagination-ellipsis">…</span>
        <a class="m-pagination-item" href="#">9</a>
        <a class="m-pagination-item" href="#" aria-label="Next page">${icon(I.right, 16)}</a>
      </nav>
    </section>

    <!-- The detail: a picture band, the title and its line, the guide choice, one blue pill, the player -->
    <section class="m-stack" data-gap="6" aria-labelledby="sl-course">
      <div style="position: relative">
        ${art(tone.sun, tone.brand, tone.brand, '15rem', 'var(--m-radius-lg)')}
        <a href="#" class="m-button" data-icon-only aria-label="Back to the library" style="position: absolute; inset: var(--m-space-4) auto auto var(--m-space-4); --m-button-secondary-bg: var(--m-color-bg-surface)">${icon(I.left)}</a>
      </div>
      <div class="m-stack" data-gap="3">
        <div class="m-cluster" data-justify="between" data-align="start" style="flex-wrap: nowrap">
          <div class="m-stack" data-gap="2">
            <span><span class="m-badge" data-variant="outline">Course</span></span>
            <h1 id="sl-course" style="${h1}">Kinder self-talk</h1>
          </div>
          <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Save">${icon(I.heart)}</button>
        </div>
        ${metaLine(I.headphones, 'Course · 21 days · 5–15 min a day')}
        <p style="font-size: var(--m-font-size-lg); line-height: var(--m-font-leading-normal); max-inline-size: 36rem">Notice the voice in your head, and practise answering it the way you would answer a friend.</p>
      </div>
      <div class="m-stack" data-gap="3">
        <h2 style="${h3}">Choose your guide</h2>
        <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap"><span class="m-avatar" data-size="md">MV</span><button type="button" class="m-button" aria-pressed="true" style="flex: 1; --m-button-secondary-bg: var(--m-color-bg-inverse); --m-button-secondary-fg: var(--m-color-fg-inverse); --m-button-secondary-hover-bg: var(--m-color-bg-inverse)">Marisol</button></div>
        <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap"><span class="m-avatar" data-size="md">TO</span><button type="button" class="m-button" aria-pressed="false" style="flex: 1; --m-button-secondary-bg: var(--m-color-bg-surface); --m-button-secondary-border: var(--m-color-border-default); --m-button-shadow: none">Theo</button></div>
      </div>
      <div class="m-cluster" data-gap="3">
        <button type="button" class="m-button" data-variant="primary" data-size="lg" style="flex: 1">${solid(I.play, 16)} Begin course</button>
        <button type="button" class="m-button" data-size="lg">${icon(I.download, 18)} Save offline</button>
      </div>
      ${player('Session 4: The inner coach', 'Marisol', '3:40', '10:00', 37)}
      <ol class="m-stack" data-gap="0" style="padding: 0; list-style: none" aria-label="Sessions">
${step(3, 'Catching the critic', '10 min', 'done')}
${step(4, 'The inner coach', '10 min', 'now')}
${step(5, 'A softer sentence', '10 min', 'locked')}
      </ol>
    </section>
  </div>
</main>`;

const option = (id: string, label: string, checked: boolean) =>
  `      <label for="sl-onb-${id}" class="m-cluster" data-justify="between" style="flex-wrap: nowrap; min-block-size: 3.5rem; padding: var(--m-space-3) var(--m-space-5); border-radius: var(--m-radius-md); background: var(--m-color-bg-sunken); font-weight: 700; cursor: pointer">${label}<input class="m-checkbox" type="checkbox" id="sl-onb-${id}"${checked ? ' checked' : ''}></label>`;

const onboarding = `<main class="m-container" data-size="sm" style="padding-block: var(--m-space-8) var(--m-space-12)">
  <form class="m-stack" data-gap="6" aria-labelledby="sl-onb-title">
    <div class="m-cluster" data-justify="between">
      <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Back">${icon(I.left)}</button>
      <span style="${meta}; font-weight: 500" id="sl-onb-step">2 of 4</span>
      <button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Close">${icon(I.x)}</button>
    </div>
    <progress class="m-progress" data-size="sm" value="2" max="4" aria-labelledby="sl-onb-step">2 of 4</progress>
    <svg viewBox="0 0 320 150" width="100%" style="display: block; border-radius: var(--m-radius-lg) var(--m-radius-lg) 0 0; background: var(--m-color-warning-solid)" aria-hidden="true"><circle cx="160" cy="92" r="58" style="fill: var(--m-color-brand-default)"/><path d="M0 150 Q160 70 320 150 Z" style="fill: var(--m-color-bg-canvas)"/></svg>
    <div class="m-stack" data-gap="2" data-align="center" style="text-align: center">
      <h1 id="sl-onb-title" style="${h1}">What brings you here?</h1>
      <p class="m-muted" style="font-size: var(--m-font-size-lg)">Choose as many as you like. You can change them later.</p>
    </div>
    <fieldset class="m-stack" data-gap="3" style="border: 0; padding: 0; margin: 0">
      <legend class="m-sr-only">Your goals</legend>
${option('sleep', 'Fall asleep more easily', true)}
${option('worry', 'Worry a little less', false)}
${option('focus', 'Keep my focus at work', true)}
${option('kind', 'Be kinder to myself', false)}
${option('habit', 'Build a daily habit', false)}
    </fieldset>
    <div class="m-stack" data-gap="3">
      <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Continue</button>
      <button type="button" class="m-button" data-variant="ghost" style="inline-size: 100%">Skip for now</button>
    </div>
  </form>
</main>`;

const setting = (
  label: string,
  value: string,
  action: string,
) => `          <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding-block: var(--m-space-4); ${rule}">
            <dt class="m-stack" data-gap="1"><span style="font-size: var(--m-font-size-sm); font-weight: 700">${label}</span><span class="m-muted">${value}</span></dt>
            <dd><a href="#" style="${caps}">${action}</a></dd>
          </div>`;

const toggle = (
  id: string,
  label: string,
  hint: string,
  on: boolean,
) => `          <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding-block: var(--m-space-4); ${rule}">
            <label for="sl-set-${id}" class="m-stack" data-gap="1"><span style="font-weight: 700">${label}</span><span style="${meta}">${hint}</span></label>
            <input class="m-switch" type="checkbox" role="switch" id="sl-set-${id}"${on ? ' checked' : ''}>
          </div>`;

const settingsNav = [
  ['Account', I.users],
  ['Membership', I.star],
  ['Reminders', I.bell],
  ['Downloads', I.download],
  ['Linked apps', I.unplug],
  ['Help', I.chat],
] as const;

const settings = `${header('')}
<main class="m-container" data-size="md" style="--m-layout-container-max-md: 60rem; padding-block: var(--m-space-8) var(--m-space-16)">
  <div class="m-stack" data-gap="6">
    <h1 style="${h1}">Settings</h1>
    <div class="m-split" style="--m-layout-split-side: 14rem; --m-layout-split-gap: var(--m-space-10)">
      <nav class="m-sidebar" aria-label="Settings" style="--m-sidebar-padding: 0; border: 0">
        <div class="m-sidebar-section">
          <ul>
${settingsNav.map(([l, ic]) => `            <li><a class="m-sidebar-link" href="#"${l === 'Account' ? ' aria-current="page"' : ''}>${icon(ic, 18)} ${l}</a></li>`).join('\n')}
          </ul>
        </div>
      </nav>
      <div class="m-stack" data-gap="10">
        <section class="m-stack" data-gap="2" aria-labelledby="sl-acct">
          <h2 id="sl-acct" style="${h2}">Account</h2>
          <dl class="m-stack" data-gap="0">
${setting('First name', 'Priya', 'Edit')}
${setting('Email address', 'priya.r@example.com', 'Manage')}
${setting('Password', '••••••••••', 'Edit')}
${setting('Membership', 'Yearly · renews March 3', 'Manage')}
          </dl>
        </section>
        <section class="m-stack" data-gap="2" aria-labelledby="sl-rem">
          <h2 id="sl-rem" style="${h2}">Reminders</h2>
          <div class="m-stack" data-gap="0">
${toggle('morning', 'Morning nudge', 'A gentle note at 7:30 to start the day', true)}
${toggle('bed', 'Wind-down reminder', 'Half an hour before your usual bedtime', true)}
${toggle('streak', 'Show my streak', 'Hide it if counting days feels like pressure', false)}
          </div>
        </section>
        <section class="m-stack" data-gap="3" style="${rule}; padding-block-start: var(--m-space-6)" aria-labelledby="sl-del">
          <h2 id="sl-del" style="${h3}">Delete account</h2>
          <p class="m-muted" style="max-inline-size: 34rem">Your history, journal entries and downloads are removed for good. An active membership has to be cancelled first.</p>
          <div><button type="button" class="m-button" data-variant="danger">Delete my account</button></div>
        </section>
      </div>
    </div>
  </div>
</main>`;

const emptyState = `${header('Library')}
<main class="m-container" data-size="sm" style="padding-block: var(--m-space-16)">
  <div class="m-stack" data-gap="5" data-align="center" style="text-align: center">
    <svg viewBox="0 0 200 140" width="200" height="140" aria-hidden="true"><circle cx="86" cy="76" r="56" style="fill: var(--m-color-brand-default)"/><circle cx="150" cy="40" r="24" style="fill: var(--m-color-warning-solid)"/><rect x="104" y="100" width="88" height="28" rx="14" style="fill: var(--m-color-accent-default)"/></svg>
    <h1 style="${h2}">Nothing saved for offline yet</h1>
    <p class="m-muted" style="font-size: var(--m-font-size-lg); max-inline-size: 26rem">Save a session and it plays without a connection: on a plane, a train, or with your phone on airplane mode at night.</p>
    <div class="m-cluster" data-gap="3" data-justify="center">
      <button type="button" class="m-button" data-variant="primary">Browse the library</button>
      <button type="button" class="m-button">How saving works</button>
    </div>
  </div>
</main>`;

const plan = (
  name: string,
  price: string,
  was: string,
  note: string,
  selected: boolean,
  tag = '',
) => `      <label class="m-cluster" data-justify="between" style="position: relative; flex: 1 1 16rem; flex-wrap: nowrap; padding: var(--m-space-6); border-radius: var(--m-radius-md); cursor: pointer; ${selected ? 'background: var(--m-color-warning-solid); color: var(--m-color-warning-on-solid); border: 1px solid var(--m-color-warning-solid)' : 'background: var(--m-color-bg-surface); border: 1px solid var(--m-color-fg-muted)'}">
        ${tag ? `<span class="m-badge" data-tone="accent" data-variant="solid" style="position: absolute; inset-block-start: -0.75rem; inset-inline-start: var(--m-space-6)">${tag}</span>` : ''}
        <span class="m-stack" data-gap="1">
          <span style="font-size: var(--m-font-size-xs); font-weight: 500">${name}</span>
          <span style="font-size: var(--m-font-size-lg); font-weight: 700; font-variant-numeric: tabular-nums">${price}${was ? ` <s style="font-weight: 500">${was}</s>` : ''}</span>
          <span style="font-size: var(--m-font-size-sm); font-weight: 500">${note}</span>
        </span>
        <input class="m-checkbox" type="radio" name="sl-plan" aria-label="${name}"${selected ? ' checked' : ''} style="border-radius: 6px">
      </label>`;

const trial = (
  ic: string,
  when: string,
  what: string,
  last = false,
) => `        <li class="m-cluster" data-gap="4" data-align="start" style="flex-wrap: nowrap">
          <span class="m-stack" data-align="center" style="align-self: stretch; flex: none">
            <span style="display: grid; place-items: center; inline-size: 2.5rem; block-size: 2.5rem; border-radius: 9999px; background: var(--m-color-brand-default); color: var(--m-color-brand-fg)">${icon(ic, 18)}</span>
            ${last ? '' : '<span style="flex: 1; inline-size: 4px; min-block-size: 1.5rem; border-radius: 9999px; background: var(--m-color-brand-subtle)"></span>'}
          </span>
          <span class="m-stack" data-gap="1" style="padding-block-end: var(--m-space-4)"><span style="${h3}">${when}</span><span class="m-muted">${what}</span></span>
        </li>`;

const pricing = `<header class="m-navbar" style="justify-content: center">${brand}</header>
<main class="m-container" data-size="md" style="padding-block: var(--m-space-12) var(--m-space-16)">
  <div class="m-stack" data-gap="12">
    <div class="m-stack" data-gap="4" data-align="center" style="text-align: center">
      <p style="font-size: var(--m-font-size-xl); font-weight: 700; letter-spacing: var(--m-font-tracking-tight); color: var(--m-color-fg-muted)">Two weeks free, then one price</p>
      <h1 style="font-size: var(--m-font-size-4xl); font-weight: 700; letter-spacing: var(--m-font-tracking-tight); line-height: 1.1">Rest easier, <span style="color: var(--m-color-brand-default)">all year</span></h1>
      <p class="m-muted" style="font-size: var(--m-font-size-lg)">Every session, sleep story and course. Cancel any time before your trial ends.</p>
    </div>
    <fieldset class="m-stack" data-gap="3" style="border: 0; padding: 0; margin: 0 auto; inline-size: 100%; max-inline-size: 43rem">
      <legend class="m-sr-only">Choose a plan</legend>
      <div class="m-cluster" data-gap="4" style="align-items: stretch">
${plan('Yearly', '$64.99/yr', '', 'Works out at $5.42 a month', true, 'Save 55%')}
${plan('Monthly', '$11.99/mo', '', 'Billed every month', false)}
      </div>
      <p style="${meta}; text-align: center; font-size: var(--m-font-size-xs)">After 14 days the yearly plan renews at $64.99 unless you cancel. <a href="#" style="color: var(--m-color-accent-text)">Terms</a> · <a href="#" style="color: var(--m-color-accent-text)">Cancel any time</a></p>
      <div class="m-cluster" data-justify="center"><button type="submit" class="m-button" data-variant="primary" data-size="lg" style="min-inline-size: 16rem">Start my free trial</button></div>
    </fieldset>
    <section class="m-grid" style="--m-layout-grid-min: 20rem; --m-layout-grid-gap: var(--m-space-10); align-items: start" aria-labelledby="sl-trial">
      <div class="m-stack" data-gap="5">
        <h2 id="sl-trial" style="${h2}">How the trial works</h2>
        <ol class="m-stack" data-gap="0" style="padding: 0; list-style: none">
${trial(I.lock, 'Today', 'Everything opens up: courses, sleep stories, sounds and music.')}
${trial(I.bell, 'Day 12', 'We send you a reminder that your trial is ending soon.')}
${trial(I.star, 'Day 14', 'Your membership starts. Cancel before then and you pay nothing.', true)}
        </ol>
      </div>
      <section class="m-card" data-variant="sunken" style="border-radius: 24px" aria-labelledby="sl-incl">
        <div class="m-card-body m-stack" data-gap="4" style="padding: var(--m-space-8)">
          <h2 id="sl-incl" style="${h3}">What you get</h2>
          <ul class="m-stack" data-gap="3" style="padding: 0; list-style: none">
${['Over 600 guided sessions and courses', 'Sleep stories and sounds for every night', 'Short resets for busy days', 'Progress, streaks and gentle reminders', 'Offline listening on any device'].map((f) => `            <li class="m-cluster" data-gap="3" style="flex-wrap: nowrap"><span style="color: var(--m-color-success-fg); display: inline-flex; flex: none">${icon(I.check, 20)}</span>${f}</li>`).join('\n')}
          </ul>
        </div>
      </section>
    </section>
    <section class="m-stack" data-gap="4" aria-labelledby="sl-faq">
      <h2 id="sl-faq" style="${h2}">Questions</h2>
      <div class="m-accordion" data-variant="separated">
        <details class="m-accordion-item" name="sl-faq" open><summary>Can I share my membership?</summary><div class="m-accordion-content">The household plan covers up to six people, each with their own history and streak.</div></details>
        <details class="m-accordion-item" name="sl-faq"><summary>What happens when the trial ends?</summary><div class="m-accordion-content">Your chosen plan starts on day 14. We remind you two days before, and cancelling takes a minute in Settings.</div></details>
        <details class="m-accordion-item" name="sl-faq"><summary>Is there a discount for students?</summary><div class="m-accordion-content">Yes: students pay $14.99 a year after confirming their enrolment.</div></details>
      </div>
    </section>
    <section class="m-stack" data-gap="4" data-align="center" style="text-align: center; ${rule}; padding-block-start: var(--m-space-10)">
      <h2 style="${h2}">Signing up more than one person?</h2>
      <div class="m-cluster" data-gap="4" data-justify="center"><a class="m-button" href="#">See household pricing</a><a class="m-button" href="#">See student pricing</a></div>
    </section>
  </div>
</main>`;

// Errors: the field turns red with its message underneath, a summary above the form, a charcoal
// toast for what went wrong elsewhere, the app's confirm sheet, and full pages for 404, 500 and 403
const errorPage = (
  code: string,
  title: string,
  body: string,
  actions: string,
  shape: string,
) => `  <section class="m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-12); ${rule}" aria-labelledby="sl-err-${code}">
    ${shape}
    <span style="font-family: var(--m-font-family-mono); ${meta}">Error ${code}</span>
    <h1 id="sl-err-${code}" style="${h2}">${title}</h1>
    <p class="m-muted" style="max-inline-size: 26rem; font-size: var(--m-font-size-lg)">${body}</p>
    <div class="m-cluster" data-gap="3" data-justify="center">${actions}</div>
  </section>`;

const shapeLost = `<svg viewBox="0 0 160 100" width="160" height="100" aria-hidden="true"><circle cx="58" cy="54" r="40" style="fill: var(--m-color-warning-solid)"/><circle cx="118" cy="62" r="26" style="fill: var(--m-color-accent-default)"/></svg>`;
const shapeBroken = `<svg viewBox="0 0 160 100" width="160" height="100" aria-hidden="true"><path d="M20 96 A60 60 0 0 1 140 96 Z" style="fill: var(--m-color-brand-default)"/><circle cx="128" cy="22" r="12" style="fill: var(--m-color-warning-solid)"/></svg>`;
const shapeLocked = `<svg viewBox="0 0 160 100" width="160" height="100" aria-hidden="true"><rect x="40" y="36" width="80" height="60" rx="16" style="fill: var(--m-color-bg-inverse)"/><path d="M58 36 V28 a22 22 0 0 1 44 0 V36" style="fill: none; stroke: var(--m-color-brand-default); stroke-width: 10; stroke-linecap: round"/></svg>`;

const errors = `<main class="m-container" data-size="sm" style="padding-block: var(--m-space-12)">
  <div class="m-stack" data-gap="10">
    <form class="m-stack" data-gap="5" aria-labelledby="sl-err-form" novalidate>
      <h1 id="sl-err-form" style="${h1}">Create your account</h1>
      <div class="m-alert" data-tone="danger" role="alert">
        <span class="m-alert-icon">${icon(I.alert, 20)}</span>
        <div class="m-alert-content"><div class="m-alert-title">2 things to fix</div><div class="m-alert-body">Your account hasn’t been created yet. Check the email and the password.</div></div>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="sl-err-name">First name</label>
        <input class="m-input" id="sl-err-name" value="Priya" autocomplete="given-name">
      </div>
      <div class="m-field">
        <label class="m-field-label" for="sl-err-email">Email address</label>
        <input class="m-input" id="sl-err-email" type="email" value="priya.r@example" aria-invalid="true" aria-describedby="sl-err-email-e">
        <p class="m-field-error" id="sl-err-email-e">Enter an email address like name@example.com.</p>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="sl-err-pass">Password (8+ characters)</label>
        <input class="m-input" id="sl-err-pass" type="password" value="calm12" aria-invalid="true" aria-describedby="sl-err-pass-e">
        <p class="m-field-error" id="sl-err-pass-e">Use at least 8 characters. This one has 6.</p>
      </div>
      <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Continue</button>
    </form>
    <section class="m-stack" data-gap="3" aria-label="A toast">
      <div class="m-toast" role="alert"><div class="m-toast-content"><div class="m-toast-title">Your reminder wasn’t saved</div><div class="m-toast-body">You seem to be offline. We’ll try again when you’re back.</div></div><div class="m-toast-actions"><button type="button" class="m-button" data-size="sm">Retry</button></div></div>
    </section>
    <section aria-label="A confirm sheet" style="display: grid; place-items: center; padding: var(--m-space-8); border-radius: var(--m-radius-lg); background: var(--m-color-bg-overlay)">
      <div class="m-dialog" data-static role="dialog" aria-labelledby="sl-dlg-t" aria-describedby="sl-dlg-d" data-size="sm" style="max-inline-size: 100%">
        <div class="m-dialog-header"><h2 class="m-dialog-title" id="sl-dlg-t">Sign out?</h2><button type="button" class="m-button" data-variant="ghost" data-icon-only data-size="sm" aria-label="Close">${icon(I.x, 18)}</button></div>
        <p class="m-dialog-description" id="sl-dlg-d">Signing out clears today’s progress on this device and removes downloaded sessions.</p>
        <div class="m-stack" data-gap="3" style="margin-block-start: var(--m-space-5)">
          <button type="button" class="m-button" data-variant="danger" style="inline-size: 100%">Sign out</button>
          <button type="button" class="m-button" style="inline-size: 100%">Stay signed in</button>
        </div>
      </div>
    </section>
${errorPage('404', 'We can’t find that page', 'It may have moved, or the link has a typo. Your sessions are all still here.', `<a class="m-button" data-variant="primary" href="#">${icon(I.home, 18)} Back home</a>`, shapeLost)}
${errorPage('500', 'Something went wrong on our side', 'Nothing you did. Your progress is saved. Give it a moment and try again.', `<button type="button" class="m-button" data-variant="primary">Try again</button><a class="m-button" href="#">Get help</a>`, shapeBroken)}
${errorPage('403', 'This one is for members', 'Your plan doesn’t include coaching yet. Ask your workplace admin, or see what’s included.', `<a class="m-button" data-variant="primary" href="#">See plans</a><a class="m-button" href="#">Go back</a>`, shapeLocked)}
  </div>
</main>`;

export const solaceRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'A greeting and the day laid out as a timeline of big bordered session cards, beside the streak, the player and flat colour tiles.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'Search, a segmented filter and rows with a picture and a bold title; the detail has a picture band, the guide choice, one blue pill and the player.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One phone-width column: a thin progress bar, a sun-shape header, a bold question and warm off-white choice rows, a full-width blue pill.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A side list of sections; account rows with small capital EDIT links, reminder switches, and deleting the account at the end.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description: 'Flat colour shapes, a bold heading, one kind sentence, a blue pill and a warm off-white one.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'A big bold heading with a highlighted word, two plan options (the chosen one filled sun yellow), one blue pill, how the trial works, and questions.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Red field borders with the fix underneath, a summary above the form, a charcoal toast, the confirm sheet, and full pages for 404, 500 and 403.',
    html: errors,
  },
];
