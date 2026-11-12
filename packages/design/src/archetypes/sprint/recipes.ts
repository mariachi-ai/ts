import type { ArchetypeRecipe } from '../types';

/*
 * Sprint's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from a made-up training app ("Kinetic"). They follow the
 * language's real screen patterns, translated from a phone-first app to the desktop the way its
 * maker's own web pages do it: a white 60px bar with centred links and a grey search pill, a grey
 * promo strip, full-bleed dark media with huge condensed capitals and white pills, workout cards
 * with an image well over a medium title and a grey meta line, centred condensed numerals for
 * progress, a filter column beside the list, and black pills for the one action that matters.
 *
 * Full-bleed media sections set `data-theme="sprint" data-mode="dark"` on themselves, so they stay
 * dark (and their pills white) in both modes, as the reference's photo-led screens do. Images are
 * token placeholders: a dark gradient for hero media, the grey well for thumbnails.
 */

// Lucide icons, outlined, 1.5px stroke
const icon = (paths: string, size = 24) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  timer: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
  dumbbell:
    '<path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"/><path d="m2.5 21.5 1.4-1.4"/><path d="m20.1 3.9 1.4-1.4"/><path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"/><path d="m9.6 14.4 4.8-4.8"/>',
  activity:
    '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
  person: '<circle cx="12" cy="5" r="1"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/>',
  screen:
    '<path d="M10 7.75a.75.75 0 0 1 1.142-.638l3.664 2.249a.75.75 0 0 1 0 1.278l-3.664 2.25a.75.75 0 0 1-1.142-.64z"/><path d="M12 17v4"/><path d="M8 21h8"/><rect x="2" y="3" width="20" height="14" rx="2"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  flame:
    '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  sliders:
    '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  trophy:
    '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  circleCheck: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  watch:
    '<circle cx="12" cy="12" r="6"/><path d="M12 10v2l1 1"/><path d="m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05"/><path d="m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
};

// The condensed display capitals: tight leading, no tracking
const display = (size: string) =>
  `font-family: var(--m-font-family-display); font-weight: var(--m-font-weight-bold); font-size: ${size}; line-height: var(--m-font-leading-tight); text-transform: uppercase; letter-spacing: 0`;
const title = (size = 'var(--m-font-size-xl)') =>
  `font-size: ${size}; font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-tight); line-height: 1.2`;
const meta = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
const num = 'font-variant-numeric: tabular-nums';
const hair = 'border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)';
// A dark media block: the stand-in for a full-bleed photo, dark in both modes
const media = (extra = '') =>
  `data-theme="sprint" data-mode="dark" style="position: relative; display: flex; color: var(--m-color-fg-default); background: linear-gradient(150deg, var(--m-color-bg-raised) 0%, var(--m-color-bg-sunken) 75%); ${extra}"`;
// The grey image well for thumbnails, with the discipline's icon as the placeholder
const well = (ic: keyof typeof I, ratio = '4 / 3', size = 32) =>
  `<div aria-hidden="true" style="aspect-ratio: ${ratio}; display: grid; place-items: center; background: var(--m-color-bg-sunken); color: var(--m-color-fg-muted)">${icon(I[ic], size)}</div>`;
const iconButton = (ic: keyof typeof I, label: string, variant = 'ghost', size = '') =>
  `<button type="button" class="m-button" data-variant="${variant}"${size ? ` data-size="${size}"` : ''} data-icon-only aria-label="${label}">${icon(I[ic], 24)}</button>`;

const shell = (current: string, main: string) => {
  const links = ['Today', 'Plans', 'Library', 'Coaches', 'Progress']
    .map(
      (l) =>
        `        <a class="m-navbar-link" href="#"${l === current ? ' aria-current="page" style="box-shadow: inset 0 -2px 0 currentColor"' : ''}>${l}</a>`,
    )
    .join('\n');
  return `<div class="m-stack" data-gap="0" style="min-block-size: 100vh">
  <header class="m-navbar">
    <a class="m-navbar-brand" href="#">Kinetic</a>
    <nav class="m-navbar-nav" aria-label="Main" style="justify-content: center">
${links}
    </nav>
    <div class="m-navbar-actions m-cluster" data-gap="2">
      <label class="m-cluster" data-gap="2" style="block-size: 2.5rem; padding-inline: var(--m-space-2) var(--m-space-4); border-radius: var(--m-radius-lg); background: var(--m-color-bg-sunken); color: var(--m-color-fg-muted); font-weight: var(--m-font-weight-medium)">${icon(I.search, 24)}<span>Search</span></label>
      ${iconButton('bookmark', 'Saved', 'ghost', 'sm')}
      <span style="position: relative; display: inline-flex">${iconButton('bell', 'Inbox, 2 unread', 'ghost', 'sm')}<span aria-hidden="true" style="position: absolute; inset-block-start: 6px; inset-inline-end: 6px; inline-size: 8px; block-size: 8px; border-radius: var(--m-radius-full); background: var(--m-color-brand-default)"></span></span>
      <span class="m-avatar" data-size="sm" aria-label="Maya Okafor">MO</span>
    </div>
  </header>
  <p style="padding-block: var(--m-space-3); background: var(--m-color-bg-sunken); text-align: center; font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-medium)"><a href="#" style="color: inherit">New this week: a four-week mobility plan</a></p>
  <main>
${main}
  </main>
</div>`;
};

// A workout card: the image well, then a medium title, the grey meta line and the minutes
const workout = (ic: keyof typeof I, name: string, level: string, mins: string, saved = false) => `<article class="m-stack" data-gap="3">
            ${well(ic)}
            <div class="m-cluster" data-justify="between" data-align="start" style="flex-wrap: nowrap">
              <div class="m-stack" data-gap="1">
                <h3 style="font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-medium)">${name}</h3>
                <p style="${meta}">${level}</p>
                <p style="${meta}; ${num}">${mins}</p>
              </div>
              <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="${saved ? 'Saved' : 'Save'}" aria-pressed="${saved}"${saved ? ' style="color: var(--m-color-fg-default)"' : ''}>${icon(I.bookmark, 20).replace('fill="none"', saved ? 'fill="currentColor"' : 'fill="none"')}</button>
            </div>
          </article>`;

// A focus tile: dark media, the label bottom-left
const focusTile = (label: string, count: string) => `<a href="#" ${media('aspect-ratio: 4 / 3; align-items: end; padding: var(--m-space-6); text-decoration: none')}>
            <span class="m-stack" data-gap="1"><span style="${display('var(--m-font-size-2xl)')}">${label}</span><span style="${meta}">${count}</span></span>
          </a>`;

// The week: done days filled, today ringed, the rest a hairline ring
const day = (d: string, state: 'done' | 'today' | 'rest') => {
  const style =
    state === 'done'
      ? 'background: var(--m-color-fg-default); color: var(--m-color-bg-canvas)'
      : state === 'today'
        ? 'box-shadow: inset 0 0 0 1.5px var(--m-color-fg-default)'
        : 'box-shadow: inset 0 0 0 1px var(--m-color-border-default); color: var(--m-color-fg-muted)';
  return `<li class="m-stack" data-gap="2" data-align="center"><span style="display: grid; place-items: center; inline-size: 2.5rem; block-size: 2.5rem; border-radius: var(--m-radius-full); ${style}">${state === 'done' ? icon(I.check, 18) : ''}</span><span style="${meta}">${d}</span></li>`;
};

const stat = (n: string, l: string) =>
  `<div class="m-stack" data-gap="1" data-align="center"><span style="${display('var(--m-font-size-4xl)')}; ${num}">${n}</span><span style="${meta}">${l}</span></div>`;

const dashboard = shell(
  'Today',
  `    <section ${media('min-block-size: 32rem; align-items: end')} aria-labelledby="sp-hero">
      <div class="m-container m-stack" data-gap="5" style="padding-block: var(--m-space-12)">
        <p style="font-weight: var(--m-font-weight-medium)">Today · Week 3 of your plan</p>
        <h1 id="sp-hero" style="${display('calc(var(--m-font-size-4xl) * 1.25)')}; max-inline-size: 12ch">Own the first mile</h1>
        <p style="max-inline-size: 34rem">A 24-minute strength block with Dev Ramos. Dumbbells, no jumping, all effort.</p>
        <div class="m-cluster" data-gap="3">
          <button type="button" class="m-button" data-variant="primary">${icon(I.play, 20)} Start workout</button>
          <button type="button" class="m-button">Preview</button>
        </div>
      </div>
    </section>
    <div class="m-container m-stack" data-gap="12" style="padding-block: var(--m-space-12) var(--m-space-16)">
      <section class="m-grid" style="--m-layout-grid-min: 22rem; --m-layout-grid-gap: var(--m-space-8); align-items: center" aria-labelledby="sp-week">
        <div class="m-stack" data-gap="6">
          <div class="m-cluster" data-justify="between">
            <h2 id="sp-week" style="${title()}">This week</h2>
            <span class="m-cluster" data-gap="1" style="font-weight: var(--m-font-weight-medium)">${icon(I.flame, 20)} 5-day streak</span>
          </div>
          <ol class="m-cluster" data-justify="between" style="list-style: none; padding: 0; flex-wrap: nowrap; gap: var(--m-space-1)">
            ${day('Mon', 'done')}${day('Tue', 'done')}${day('Wed', 'done')}${day('Thu', 'done')}${day('Fri', 'today')}${day('Sat', 'rest')}${day('Sun', 'rest')}
          </ol>
        </div>
        <div class="m-cluster" data-justify="center" data-gap="12">
          ${stat('14', 'Workouts')}
          ${stat('312', 'Active minutes')}
          ${stat('3', 'New bests')}
        </div>
      </section>
      <section class="m-stack" data-gap="6" aria-labelledby="sp-next">
        <div class="m-cluster" data-justify="between">
          <h2 id="sp-next" style="${title()}">Up next</h2>
          <a href="#" style="font-weight: var(--m-font-weight-medium); color: var(--m-color-fg-default)">View all</a>
        </div>
        <div class="m-tabs">
          <div class="m-tab-list" role="tablist" aria-label="Workouts">
            <button type="button" class="m-tab" role="tab" aria-selected="true">For you</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Saved</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Recent</button>
          </div>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 15rem; --m-layout-grid-gap: var(--m-space-4)">
          ${workout('dumbbell', 'Upper-Body Ladder', 'Intermediate · Strength · Dumbbells', '24 min', true)}
          ${workout('activity', 'Sprint Intervals on the Spot', 'Advanced · Endurance · No equipment', '15 min')}
          ${workout('person', 'Hip Opener Flow', 'Beginner · Mobility · Mat', '18 min')}
          ${workout('timer', 'Core Countdown', 'Intermediate · Strength · No equipment', '10 min')}
        </div>
      </section>
      <section ${media('border-radius: var(--m-radius-md); overflow: hidden; flex-wrap: wrap; gap: var(--m-space-8); align-items: end; justify-content: space-between; padding: var(--m-space-10)')} aria-labelledby="sp-plan">
        <div class="m-stack" data-gap="4" style="flex: 1 1 22rem">
          <p style="font-weight: var(--m-font-weight-medium)">Your plan · Stage 2 of 4</p>
          <h2 id="sp-plan" style="${display('var(--m-font-size-3xl)')}">Build the base</h2>
          <progress class="m-progress" value="7" max="12" aria-label="Stage progress">7 of 12</progress>
          <p style="${meta}; ${num}">7 of 12 workouts · 2 left this week</p>
        </div>
        <div class="m-cluster" data-gap="3">
          <button type="button" class="m-button" data-variant="primary">Continue plan</button>
          <button type="button" class="m-button">Plan details</button>
        </div>
      </section>
      <section class="m-stack" data-gap="6" aria-labelledby="sp-focus">
        <h2 id="sp-focus" style="${title()}">Train by focus</h2>
        <div class="m-grid" style="--m-layout-grid-min: 15rem; --m-layout-grid-gap: var(--m-space-4)">
          ${focusTile('Strength', '86 workouts')}
          ${focusTile('Conditioning', '54 workouts')}
          ${focusTile('Mobility', '41 workouts')}
          ${focusTile('Recovery', '23 workouts')}
        </div>
      </section>
    </div>`,
);

// A list row: the thumbnail, the title, the meta lines and the minutes, a bookmark on the right
const row = (ic: keyof typeof I, name: string, level: string, kit: string, mins: string, current = false) => `<li class="m-cluster" data-gap="4" data-align="start" style="flex-wrap: nowrap; padding: var(--m-space-3); ${current ? 'background: var(--m-color-bg-sunken)' : ''}"${current ? ' aria-current="true"' : ''}>
              <div style="inline-size: 7.5rem; flex: none">${well(ic, '4 / 3', 24)}</div>
              <div class="m-stack" data-gap="1" style="flex: 1; min-inline-size: 0">
                <a href="#" style="font-weight: var(--m-font-weight-medium); color: var(--m-color-fg-default); text-decoration: none">${name}</a>
                <span style="${meta}">${level}</span>
                <span style="${meta}">${kit}</span>
                <span style="${meta}; ${num}">${mins}</span>
              </div>
              ${iconButton('bookmark', `Save ${name}`, 'ghost', 'sm')}
            </li>`;

const check = (label: string, checked = false) =>
  `<label class="m-field" data-layout="inline"><input class="m-checkbox" type="checkbox"${checked ? ' checked' : ''}> ${label}</label>`;
const filterGroup = (name: string, body: string) => `<details class="m-accordion-item" open>
            <summary style="font-size: var(--m-font-size-md)">${name}</summary>
            <div class="m-accordion-content m-stack" data-gap="3">${body}</div>
          </details>`;
const chip = (label: string, on = false) =>
  `<button type="button" class="m-button" data-size="sm"${on ? ' data-variant="primary"' : ''} aria-pressed="${on}">${label}${on ? ` ${icon(I.x, 16)}` : ''}</button>`;
const metaRow = (ic: keyof typeof I, text: string) =>
  `<li class="m-cluster" data-gap="3">${icon(I[ic], 20)} ${text}</li>`;

const listDetail = shell(
  'Library',
  `    <div class="m-container m-stack" data-gap="6" style="padding-block: var(--m-space-4) var(--m-space-16)">
      <nav class="m-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="#">Library</a></li><li><span aria-current="page">Strength</span></li></ol></nav>
      <div class="m-cluster" data-justify="between">
        <h1 style="${title()}">Strength workouts <span style="${num}">(86)</span></h1>
        <div class="m-cluster" data-gap="6">
          <button type="button" class="m-button" data-variant="ghost">Hide filters ${icon(I.sliders, 20)}</button>
          <button type="button" class="m-button" data-variant="ghost">Sort by ${icon(I.down, 20)}</button>
        </div>
      </div>
      <div class="m-split" style="--m-layout-split-side: 12rem; --m-layout-split-gap: var(--m-space-12)">
        <aside class="m-stack" data-gap="2" aria-label="Filters">
          <label class="m-field" data-layout="inline" style="justify-content: space-between; padding-block: var(--m-space-2) var(--m-space-4); ${hair}; font-weight: var(--m-font-weight-medium)">Downloaded only <input class="m-switch" type="checkbox" role="switch"></label>
          <nav class="m-sidebar" aria-label="Disciplines" style="padding-block: var(--m-space-3)">
            <ul>
              <li><a class="m-sidebar-link" href="#" aria-current="page">Strength</a></li>
              <li><a class="m-sidebar-link" href="#">Conditioning</a></li>
              <li><a class="m-sidebar-link" href="#">Mobility</a></li>
              <li><a class="m-sidebar-link" href="#">Pilates</a></li>
              <li><a class="m-sidebar-link" href="#">Recovery</a></li>
              <li><a class="m-sidebar-link" href="#">Mindset</a></li>
            </ul>
          </nav>
          <div class="m-accordion" style="--m-accordion-padding-y: var(--m-space-4); border-inline: 0; border-block-start: 0">
          ${filterGroup('Duration', `${check('Under 10 min')}${check('10–20 min', true)}${check('20–30 min')}${check('Over 30 min')}`)}
          ${filterGroup('Level', `${check('Beginner')}${check('Intermediate', true)}${check('Advanced')}`)}
          ${filterGroup('Equipment', `${check('None')}${check('Dumbbells')}${check('Kettlebell')}${check('Bands')}`)}
          </div>
        </aside>
        <div class="m-stack" data-gap="6">
          <div class="m-cluster" data-gap="2">
            ${chip('10–20 min', true)}${chip('Intermediate', true)}${chip('Clear all')}
          </div>
          <div class="m-grid" style="--m-layout-grid-min: 22rem; --m-layout-grid-gap: var(--m-space-8); align-items: start">
            <ul class="m-stack" data-gap="1" style="list-style: none; padding: 0">
            ${row('dumbbell', 'Kettlebell Ladder With Ines', 'Intermediate · Strength', 'Kettlebell', '18 min', true)}
            ${row('dumbbell', 'Upper-Body Ladder', 'Intermediate · Strength', 'Dumbbells', '16 min')}
            ${row('person', 'Single-Leg Strength', 'Intermediate · Strength · Balance', 'No equipment', '12 min')}
            ${row('timer', 'Tempo Squats and Holds', 'Intermediate · Strength', 'No equipment', '15 min')}
            ${row('activity', 'Push, Pull, Repeat', 'Intermediate · Strength · Endurance', 'Bands', '20 min')}
            </ul>
            <article class="m-stack" data-gap="0" aria-labelledby="sp-detail" style="position: sticky; inset-block-start: var(--m-space-4)">
              <div ${media('min-block-size: 16rem; flex-direction: column; justify-content: space-between; padding: var(--m-space-4) var(--m-space-6) var(--m-space-6)')}>
                <div class="m-cluster" data-justify="between">
                  ${iconButton('back', 'Back to the list', 'ghost', 'sm')}
                  <div class="m-cluster" data-gap="1">${iconButton('share', 'Share', 'ghost', 'sm')}${iconButton('bookmark', 'Save', 'ghost', 'sm')}</div>
                </div>
                <div class="m-stack" data-gap="1">
                  <h2 id="sp-detail" style="${title('var(--m-font-size-2xl)')}">Kettlebell Ladder With Ines</h2>
                  <p style="color: var(--m-color-fg-muted)">With Ines Kalu</p>
                </div>
              </div>
              <div data-theme="sprint" data-mode="dark" class="m-stack" data-gap="6" style="padding: var(--m-space-6); background: var(--m-color-bg-canvas); color: var(--m-color-fg-default)">
                <ul class="m-stack" data-gap="4" style="list-style: none; padding: 0">
                  ${metaRow('timer', '18 minutes, Intermediate')}
                  ${metaRow('person', 'Total-body strength, grip')}
                  ${metaRow('dumbbell', 'Kettlebell, one medium')}
                  ${metaRow('screen', 'Follow-along class')}
                  ${metaRow('music', 'Hip-hop, house')}
                </ul>
                <p>Three rounds that climb from five reps to fifteen. Swings, goblet squats and rows, with short rests that shrink as you go.</p>
                <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap">
                  <button type="button" class="m-button" data-variant="primary" style="flex: 1">Start workout</button>
                  ${iconButton('watch', 'Send to your watch', 'primary')}
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>`,
);

// A large choice: a rounded outline row with a title and a grey line, the chosen one ringed in black
const choice = (name: string, label: string, sub: string, checked = false) =>
  `<label class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding: var(--m-space-4) var(--m-space-6); border-radius: var(--m-radius-lg); box-shadow: inset 0 0 0 ${checked ? '1.5px var(--m-color-fg-default)' : '1px var(--m-color-border-default)'}; cursor: pointer">
              <span class="m-stack" data-gap="1"><span style="font-weight: var(--m-font-weight-medium)">${label}</span><span style="${meta}">${sub}</span></span>
              <input class="m-radio" type="radio" name="${name}"${checked ? ' checked' : ''}>
            </label>`;

const onboarding = `<div class="m-grid" style="--m-layout-grid-min: 26rem; --m-layout-grid-gap: 0; min-block-size: 100vh">
  <section ${media('flex-direction: column; justify-content: space-between; padding: var(--m-space-10) clamp(1.5rem, 4vw, 3rem)')} aria-label="About your plan">
    <span style="${display('var(--m-font-size-2xl)')}">Kinetic</span>
    <div class="m-stack" data-gap="4" style="padding-block: var(--m-space-16) 0">
      <h2 style="${display('calc(var(--m-font-size-4xl) * 1.25)')}">Let's build your plan</h2>
      <p style="max-inline-size: 26rem; color: var(--m-color-fg-muted)">Four questions. Your answers set your first two weeks, and you can change them any time.</p>
    </div>
  </section>
  <main class="m-stack" data-gap="8" style="padding: var(--m-space-10) clamp(1.5rem, 4vw, 3rem); justify-content: center">
    <div class="m-stack" data-gap="8" style="inline-size: 100%; max-inline-size: 30rem; margin-inline: auto">
      <div class="m-stack" data-gap="4">
        <div class="m-cluster" data-justify="between">
          ${iconButton('back', 'Back', 'ghost', 'sm')}
          <span style="font-weight: var(--m-font-weight-medium); ${num}">2 of 4</span>
          <a href="#" style="font-weight: var(--m-font-weight-medium); color: var(--m-color-fg-default)">Skip</a>
        </div>
        <progress class="m-progress" value="2" max="4" aria-label="Step 2 of 4">2 of 4</progress>
      </div>
      <div class="m-stack" data-gap="2">
        <h1 style="${title()}">How often do you want to train?</h1>
        <p style="color: var(--m-color-fg-muted)">We'll use this to space your workouts and rest days.</p>
      </div>
      <fieldset class="m-stack" data-gap="3" style="border: 0; padding: 0; margin: 0">
        <legend class="m-sr-only">Workouts each week</legend>
        ${choice('sp-freq', '1–2 workouts', 'Getting started', false)}
        ${choice('sp-freq', '3–4 workouts', 'Building a habit', true)}
        ${choice('sp-freq', '5 or more', 'Going all in', false)}
      </fieldset>
      <div class="m-field">
        <label class="m-field-label" for="sp-start">Start date</label>
        <select class="m-select" id="sp-start"><option>Monday, Nov 17</option><option>Tomorrow</option><option>Today</option></select>
      </div>
      <button type="button" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Next</button>
    </div>
  </main>
</div>`;

// A settings row: the label and the value, with a chevron or a control at the end
const setRow = (label: string, value: string, end = icon(I.right, 20)) =>
  `<li class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding-block: var(--m-space-5); ${hair}">
              <span class="m-stack" data-gap="1"><span style="font-weight: var(--m-font-weight-medium)">${label}</span>${value ? `<span style="${meta}">${value}</span>` : ''}</span>
              ${end}
            </li>`;
const toggle = (label: string, on: boolean) =>
  `<input class="m-switch" type="checkbox" role="switch" aria-label="${label}"${on ? ' checked' : ''}>`;
const setNav = (items: string[], current: string) =>
  items
    .map(
      (l) =>
        `              <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${l}</a></li>`,
    )
    .join('\n');

const settings = shell(
  '',
  `    <div class="m-container" style="padding-block: var(--m-space-10) var(--m-space-16)">
      <div class="m-split" style="--m-layout-split-side: 12rem; --m-layout-split-gap: var(--m-space-12)">
        <div class="m-stack" data-gap="6">
          <h1 style="${title()}">Settings</h1>
          <nav class="m-sidebar" aria-label="Settings">
            <ul>
${setNav(['Profile', 'Training', 'Units and body', 'Notifications', 'Connected devices', 'Privacy', 'Account'], 'Training')}
            </ul>
          </nav>
        </div>
        <div class="m-stack" data-gap="12" style="max-inline-size: 48rem">
          <section class="m-stack" data-gap="2" aria-labelledby="sp-training">
            <h2 id="sp-training" style="${title()}">Training</h2>
            <ul style="list-style: none; padding: 0">
            ${setRow('Weekly goal', '4 workouts')}
            ${setRow('Rest timer', '45 seconds between sets')}
            ${setRow('Pause music when a workout pauses', '', toggle('Pause music when a workout pauses', true))}
            ${setRow('Audio cues', 'Counts down the last 3 seconds of each move', toggle('Audio cues', true))}
            ${setRow('Show demo video first', '', toggle('Show demo video first', false))}
            </ul>
          </section>
          <section class="m-stack" data-gap="4" aria-labelledby="sp-units">
            <h2 id="sp-units" style="${title()}">Units and body</h2>
            <fieldset class="m-cluster" data-gap="6" style="border: 0; padding: 0; margin: 0">
              <legend class="m-sr-only">Units of measure</legend>
              <label class="m-field" data-layout="inline"><input class="m-radio" type="radio" name="sp-units" checked> Metric</label>
              <label class="m-field" data-layout="inline"><input class="m-radio" type="radio" name="sp-units"> Imperial</label>
            </fieldset>
            <div class="m-grid" style="--m-layout-grid-min: 12rem; --m-layout-grid-gap: var(--m-space-4)">
              <div class="m-field"><label class="m-field-label" for="sp-height">Height (cm)</label><input class="m-input" id="sp-height" inputmode="numeric" value="171"></div>
              <div class="m-field"><label class="m-field-label" for="sp-weight">Weight (kg)</label><input class="m-input" id="sp-weight" inputmode="decimal" value="64.5"></div>
            </div>
            <p style="${meta}">Used to estimate calories. Only you can see it.</p>
          </section>
          <section class="m-stack" data-gap="2" aria-labelledby="sp-devices">
            <h2 id="sp-devices" style="${title()}">Connected devices</h2>
            <ul style="list-style: none; padding: 0">
            ${setRow('Heart-rate strap', 'Connected · Battery 80%')}
            ${setRow('Health data sync', 'Workouts and minutes')}
            ${setRow('Smart watch', 'Not connected', '<button type="button" class="m-button" data-size="sm">Connect</button>')}
            </ul>
          </section>
          <section class="m-stack" data-gap="4" aria-labelledby="sp-delete" style="padding-block-start: var(--m-space-6); border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)">
            <h2 id="sp-delete" style="${title('var(--m-font-size-lg)')}">Delete account</h2>
            <p style="color: var(--m-color-fg-muted); max-inline-size: 36rem">This removes your plans, history and saved workouts. It can't be undone.</p>
            <div><button type="button" class="m-button" data-variant="danger">Delete account</button></div>
          </section>
        </div>
      </div>
    </div>`,
);

const emptyState = shell(
  'Progress',
  `    <section ${media('min-block-size: 30rem; align-items: center; justify-content: center; text-align: center')} aria-labelledby="sp-empty">
      <div class="m-stack" data-gap="5" data-align="center" style="padding: var(--m-space-16) var(--m-space-6); max-inline-size: 40rem">
        <h1 id="sp-empty" style="${display('var(--m-font-size-4xl)')}">Keep your streak on track</h1>
        <p style="color: var(--m-color-fg-muted)">Workouts you finish show up here, with your minutes, bests and streaks.</p>
        <button type="button" class="m-button">Find a workout</button>
      </div>
    </section>
    <div class="m-container m-stack" data-gap="10" style="padding-block: var(--m-space-12) var(--m-space-16)">
      <div class="m-tabs">
        <div class="m-tab-list" role="tablist" aria-label="Progress">
          <button type="button" class="m-tab" role="tab" aria-selected="true">History</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Awards</button>
        </div>
      </div>
      <div class="m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-12)">
        <span style="color: var(--m-color-fg-muted)">${icon(I.bookmark, 48)}</span>
        <h2 style="font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium); text-transform: uppercase">Nothing saved yet</h2>
        <p style="color: var(--m-color-fg-muted); max-inline-size: 26rem">Tap the bookmark on any workout to keep it here for later.</p>
        <button type="button" class="m-button" data-variant="primary">Browse the library</button>
      </div>
    </div>`,
);

// A plan card: name, the condensed price, what's in it, a full-width pill
const feature = (text: string) => `<li class="m-cluster" data-gap="3" style="flex-wrap: nowrap">${icon(I.check, 20)} ${text}</li>`;
const plan = (name: string, price: string, per: string, blurb: string, features: string[], cta: string, primary = false, flag = '') => `<article class="m-card">
            <div class="m-card-body m-stack" data-gap="6" style="block-size: 100%">
              <div class="m-stack" data-gap="2">
                <div class="m-cluster" data-justify="between"><h3 style="${title()}">${name}</h3>${flag ? `<span class="m-badge" data-variant="solid">${flag}</span>` : ''}</div>
                <p style="color: var(--m-color-fg-muted)">${blurb}</p>
              </div>
              <p class="m-cluster" data-gap="2" data-align="baseline"><span style="${display('var(--m-font-size-3xl)')}; ${num}">${price}</span><span style="${meta}">${per}</span></p>
              <ul class="m-stack" data-gap="3" style="list-style: none; padding: 0; flex: 1">${features.map(feature).join('')}</ul>
              <button type="button" class="m-button"${primary ? ' data-variant="primary"' : ''} style="inline-size: 100%">${cta}</button>
            </div>
          </article>`;
const faq = (q: string, a: string, open = false) => `<details class="m-accordion-item" name="sp-faq"${open ? ' open' : ''}>
            <summary>${q}</summary>
            <div class="m-accordion-content">${a}</div>
          </details>`;

const pricing = shell(
  'Plans',
  `    <section style="background: var(--m-color-brand-default); color: var(--m-color-brand-fg)" aria-labelledby="sp-price">
      <div class="m-container m-stack" data-gap="4" style="padding-block: var(--m-space-16) var(--m-space-12)">
        <h1 id="sp-price" style="${display('calc(var(--m-font-size-4xl) * 1.25)')}">Train without limits</h1>
        <p style="max-inline-size: 34rem; font-weight: var(--m-font-weight-medium)">Every workout is free. Plans add coaching that adapts to you, week by week.</p>
      </div>
    </section>
    <div class="m-container m-stack" data-gap="12" style="padding-block: var(--m-space-12) var(--m-space-16)">
      <div class="m-cluster" data-justify="between">
        <h2 style="${title()}">Choose how you train</h2>
        <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Billing">
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Monthly</button>
          <button type="button" class="m-tab" role="tab" aria-selected="true">Yearly · save 30%</button>
        </div></div>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 18rem; --m-layout-grid-gap: var(--m-space-4); align-items: stretch">
        ${plan('Open', '$0', 'forever', 'The full library, on your own terms.', ['Every workout in the library', 'History and streaks', 'Save and download workouts'], 'Start free')}
        ${plan('Coached', '$7', 'a month, billed $84 yearly', 'A plan that moves with you.', ['Everything in Open', 'Weekly plans that adapt', 'Form notes after each workout', 'Watch and heart-rate sync'], 'Try 14 days free', true, 'Most picked')}
        ${plan('Crew', '$19', 'a month for up to 6 people', 'Train together, keep each other honest.', ['Everything in Coached', 'Shared challenges', 'Crew leaderboard', 'One bill'], 'Start a crew')}
      </div>
      <p style="${meta}">Prices in USD. Cancel any time in Settings; you keep access to the end of the period.</p>
      <section class="m-stack" data-gap="2" aria-labelledby="sp-faq">
        <h2 id="sp-faq" style="${title()}">Questions</h2>
        <div class="m-accordion" style="border-inline: 0; border-block-start: 0">
          ${faq('Is the library really free?', 'Yes. Every workout, every coach and every focus area is free to stream and download. Plans add the adaptive coaching on top.', true)}
          ${faq('What happens when my trial ends?', 'You move to the plan you picked, billed on the day the trial ends. We remind you three days before.')}
          ${faq('Can I switch plans later?', 'Any time. Upgrades start straight away; a downgrade starts at your next billing date.')}
          ${faq('Does a crew need the same device?', 'No. Each person uses their own phone, watch or browser, and the crew sees one shared board.')}
        </div>
      </section>
    </div>`,
);

// A full-page error: centred medium copy, then ways back in
const fullPage = (code: string, ic: keyof typeof I, head: string, body: string, actions: string) => `<section class="m-stack" data-gap="4" data-align="center" style="text-align: center; padding: var(--m-space-12) var(--m-space-6); ${hair}" aria-labelledby="sp-e${code}">
          <span style="color: var(--m-color-fg-muted)">${icon(I[ic], 48)}</span>
          <p style="font-family: var(--m-font-family-mono); font-size: var(--m-font-size-xs); color: var(--m-color-fg-muted)">${code}</p>
          <h2 id="sp-e${code}" style="${title()}; max-inline-size: 28rem">${head}</h2>
          <p style="color: var(--m-color-fg-muted); max-inline-size: 30rem">${body}</p>
          <div class="m-cluster" data-gap="3" data-justify="center">${actions}</div>
        </section>`;

const errors = shell(
  '',
  `    <div class="m-container m-stack" data-gap="12" style="padding-block: var(--m-space-10) var(--m-space-16); max-inline-size: 56rem">
      <h1 style="${display('var(--m-font-size-3xl)')}">When something goes wrong</h1>
      <section class="m-stack" data-gap="6" aria-labelledby="sp-form">
        <h2 id="sp-form" style="${title()}">In a form</h2>
        <div class="m-alert" data-tone="danger" role="alert">
          <span class="m-alert-icon" style="display: grid; place-items: center; inline-size: 2.25rem; block-size: 2.25rem; border-radius: var(--m-radius-full); background: var(--m-color-danger-solid); color: var(--m-color-danger-on-solid)">${icon(I.alert, 20)}</span>
          <div class="m-alert-content">
            <p class="m-alert-title" style="color: var(--m-color-fg-default)">2 things need fixing</p>
            <p class="m-alert-body" style="color: var(--m-color-fg-default)">Your crew wasn't created. Check the fields below and try again.</p>
          </div>
        </div>
        <div class="m-grid" style="--m-layout-grid-min: 16rem; --m-layout-grid-gap: var(--m-space-4)">
          <div class="m-field">
            <label class="m-field-label" for="sp-crew">Crew name*</label>
            <input class="m-input" id="sp-crew" value="" aria-invalid="true" aria-describedby="sp-crew-error">
            <p class="m-field-error" id="sp-crew-error">Enter a crew name of 3 to 24 characters.</p>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="sp-invite">Invite by email</label>
            <input class="m-input" id="sp-invite" type="email" value="jordan@" aria-invalid="true" aria-describedby="sp-invite-error">
            <p class="m-field-error" id="sp-invite-error">Enter a full email address, like jordan@example.com.</p>
          </div>
        </div>
        <div class="m-cluster" data-gap="3"><button type="button" class="m-button" data-variant="primary">Create crew</button><button type="button" class="m-button">Cancel</button></div>
      </section>
      <section class="m-stack" data-gap="6" aria-labelledby="sp-toast">
        <h2 id="sp-toast" style="${title()}">Somewhere else</h2>
        <div class="m-toast-region" data-static aria-live="polite" style="position: static">
          <div class="m-toast" data-tone="danger" role="alert">
            <div class="m-toast-content">
              <p class="m-toast-title">Workout didn't download</p>
              <p class="m-toast-body">You're offline. It will try again when you reconnect.</p>
              <div class="m-toast-actions"><button type="button" class="m-button" data-size="sm">Retry now</button></div>
            </div>
            <button type="button" class="m-toast-close" aria-label="Dismiss">${icon(I.x, 20)}</button>
          </div>
          <div class="m-toast" data-tone="success" role="status">
            <div class="m-toast-content">
              <p class="m-toast-title">Workout saved</p>
              <p class="m-toast-body">Find it under Saved in your library.</p>
            </div>
            <button type="button" class="m-toast-close" aria-label="Dismiss">${icon(I.x, 20)}</button>
          </div>
        </div>
      </section>
      <section class="m-stack" data-gap="0" aria-label="Full-page errors" style="border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)">
        ${fullPage('404', 'search', "We can't find that page", 'It may have moved, or the link has a typo. Nothing in your account changed.', '<button type="button" class="m-button" data-variant="primary">Go to Today</button><button type="button" class="m-button">Search workouts</button>')}
        ${fullPage('500', 'alert', 'Something went wrong on our end', "Your workout history is safe and nothing was changed. Try again in a minute.", '<button type="button" class="m-button" data-variant="primary">Try again</button><button type="button" class="m-button">Get help</button>')}
        ${fullPage('403', 'lock', 'This plan belongs to another crew', 'Ask the crew owner for an invite to see it.', '<button type="button" class="m-button" data-variant="primary">Request an invite</button>')}
      </section>
    </div>`,
);

export const sprintRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Today',
    description:
      'A full-bleed dark hero with condensed capitals and pills, the week as a streak row beside big condensed numerals, workout cards under underline tabs, a dark plan panel and focus tiles.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'Library and workout',
    description:
      'A title with its count, filters in a side column (switch, current discipline, checkbox groups), chips for the active filters, thumbnail rows, and the chosen workout as a dark panel with icon meta rows and a white Start pill.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Build your plan',
    description:
      'A split screen: dark media with the condensed promise on one side, one question per step on the other, with a thin progress bar, large rounded choices and a full-width black pill.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A plain settings column beside hairline rows (label, grey value, chevron or a green switch), unit radios and paired fields, and Delete account last with the danger pill.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Nothing here yet',
    description:
      'An empty history as full-bleed dark media with condensed capitals and an outline pill, and a quiet in-page empty state: a 48px outline icon, a small uppercase heading, one line and a black pill.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Plans',
    description:
      'A signature-orange band with condensed capitals, a segmented monthly or yearly switch, three cards on the soft lift with condensed prices and full-width pills, and FAQ rows.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors in red under 56px fields, a grey-band alert with a red icon disc, toasts, and centred full-page 404, 500 and 403 states.',
    html: errors,
  },
];
