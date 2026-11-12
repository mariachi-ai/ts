import type { ArchetypeRecipe } from '../types';

/*
 * Ochre's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with sample data from a small publishing team's writing desk ("Harrow").
 * They follow the language's real screen patterns: a warm left rail with thin icons and the
 * current row on a fill, a narrow reading column, serif headings and reading text over a sans
 * interface, a soft white composer with a clay send square, ink buttons with 8px corners,
 * settings as label-and-control rows on hairlines, and pricing cards with 24px corners.
 */

// Lucide icons, outlined, 1.5px stroke
const icon = (paths: string, size = 16, stroke = 1.5) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const I = {
  today: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  drafts: '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  issues: '<path d="M15 18h-5"/><path d="M18 14h-8"/><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="10" y="6" rx="1"/>',
  readers: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
  sources: '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
  calendar: '<path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M8 13h.01"/><path d="M12 13h.01"/><path d="M16 13h.01"/><path d="M8 17h.01"/><path d="M12 17h.01"/><path d="M16 17h.01"/>',
  panel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  up: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  mic: '<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/>',
  clip: '<path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/>',
  gear: '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  feather: '<path d="M14.086 18.412A2 2 0 0112.67 19H5v-7.672a2 2 0 01.586-1.414L11.75 3.75a6 6 0 118.49 8.49z"/><path d="M16 8 2 22"/><path d="M17.488 15H9"/>',
  book: '<path d="M12 5v16"/><path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  left: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  external: '<path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/><path d="m21 3-9 9"/><path d="M15 3h6v6"/>',
  retry: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  trash: '<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  listChecks: '<path d="M13 5h8"/><path d="M13 12h8"/><path d="M13 19h8"/><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/>',
  penLine: '<path d="M13 21h8"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
  bookmark: '<path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"/>',
  warn: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  alert: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  ok: '<circle cx="12" cy="12" r="10"/><path d="m16 9-5.5 5.5L8 12"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/><path d="M6 14h2"/>',
  mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  funnel: '<path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"/>',
  notebook: '<path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  download: '<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
};

const serif = 'font-family: var(--m-font-family-serif); font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-tight)';
const pageTitle = `${serif}; font-size: var(--m-font-size-2xl); line-height: var(--m-font-leading-tight)`;
const small = 'font-size: var(--m-font-size-sm); color: var(--m-color-fg-muted)';
// Interface headings stay in the sans; the serif is for titles and reading
const sans = 'font-family: var(--m-font-body-family); letter-spacing: 0'
const tiny = 'font-size: var(--m-font-size-xs); color: var(--m-color-fg-muted)';
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)';
const hairMuted = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-muted)';
// Reading text: the serif at 17px
const reading = 'font-family: var(--m-font-family-serif); font-size: var(--m-font-size-lg); line-height: var(--m-font-leading-relaxed)';

// The mark: an ink tile with a feather, and the name in the serif (not the reference's mark)
const mark = (size = 'var(--m-font-size-xl)') =>
  `<span class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span style="display: inline-grid; place-items: center; inline-size: 1.5rem; block-size: 1.5rem; border-radius: var(--m-radius-sm); background: var(--m-color-accent-default); color: var(--m-color-accent-fg)">${icon(I.feather, 14)}</span><span style="${serif}; font-size: ${size}">Harrow</span></span>`;

const nav = (items: [keyof typeof I, string, string?][], current: string) =>
  items
    .map(
      ([ic, l, extra]) =>
        `          <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${icon(I[ic])} ${l}${extra ?? ''}</a></li>`,
    )
    .join('\n');

const people = (rows: [string, string, string][]) =>
  rows
    .map(
      ([initials, name, count]) =>
        `          <li><a class="m-sidebar-link" href="#"><span class="m-avatar" data-size="sm" aria-hidden="true">${initials}</span> ${name} <span class="m-sidebar-count">${count}</span></a></li>`,
    )
    .join('\n');

// The app: a warm left rail (288px) beside the page
const shell = (current: string, main: string) => `<div class="m-split" style="--m-layout-split-side: 18rem; --m-layout-split-gap: 0; min-block-size: 100vh">
  <nav class="m-sidebar" aria-label="Main" style="border-inline-end: var(--m-border-width-thin) solid var(--m-color-border-default); display: flex; flex-direction: column">
    <div class="m-stack" data-gap="3" style="padding: var(--m-space-1)">
      <div class="m-cluster" data-justify="between">
        ${mark()}
        <span class="m-cluster" data-gap="1">
          <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Search">${icon(I.search)}</button>
          <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Collapse the sidebar">${icon(I.panel)}</button>
        </span>
      </div>
      <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Mode" style="display: grid; grid-template-columns: 1fr 1fr">
        <button type="button" class="m-tab" role="tab" aria-selected="true">${icon(I.penLine, 14)} Write</button>
        <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">${icon(I.globe, 14)} Publish</button>
      </div></div>
    </div>
    <div class="m-sidebar-section">
      <ul>
${nav(
  [
    ['today', 'Today'],
    ['drafts', 'Drafts', ' <span class="m-sidebar-count">14</span>'],
    ['issues', 'Issues'],
    ['readers', 'Readers'],
    ['sources', 'Sources', ' <span class="m-badge">New</span>'],
    ['chart', 'Growth'],
  ],
  current,
)}
      </ul>
    </div>
    <div class="m-sidebar-section">
      <div class="m-cluster" data-justify="between" style="padding-inline: var(--m-space-2)">
        <h2 class="m-sidebar-heading" style="padding: 0">Contributors</h2>
        <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Invite a contributor">${icon(I.plus, 14)}</button>
      </div>
      <ul>
${people([['JO', 'Jonah Okafor', '3'], ['PV', 'Priya Venkat', '5'], ['EH', 'Elsie Hartmann', '1'], ['TB', 'Tomas Berg', '2']])}
      </ul>
    </div>
    <div class="m-cluster" data-justify="between" style="margin-block-start: auto; ${hair}; padding: var(--m-space-3) var(--m-space-2) var(--m-space-1)">
      <span class="m-cluster" data-gap="2"><span class="m-avatar" data-size="sm" aria-hidden="true">ML</span><span>Mara Lindqvist <span class="m-subtle">· Studio</span></span></span>
      ${icon(I.down, 14)}
    </div>
  </nav>
  <div class="m-stack" data-gap="0">
${main}
  </div>
</div>`;

// The composer: a white box, the input on top, actions under it, a clay send square
const composer = (id: string, placeholder: string, model = 'House style') => `<form class="m-composer" aria-label="Ask about your drafts">
          <label class="m-sr-only" for="${id}">Message</label>
          <textarea class="m-composer-input" id="${id}" rows="2" placeholder="${placeholder}"></textarea>
          <div class="m-composer-actions">
            <button type="button" class="m-button" data-variant="secondary" data-size="sm" data-icon-only aria-label="Attach a file">${icon(I.plus)}</button>
            <button type="button" class="m-button" data-variant="ghost" data-size="sm">${icon(I.sources, 14)} Sources</button>
            <span class="m-composer-spacer"></span>
            <select class="m-composer-model" aria-label="Voice"><option>${model}</option><option>Plain and brief</option><option>Long-form</option></select>
            <button type="submit" class="m-button" data-size="sm" data-icon-only aria-label="Send" style="background: var(--m-color-brand-default); border-color: var(--m-color-brand-default); color: var(--m-color-brand-fg)">${icon(I.up, 16, 2)}</button>
          </div>
        </form>`;

const stat = (label: string, value: string, delta: string, tone = '') => `          <section class="m-card" data-size="sm" aria-label="${label}">
            <div class="m-card-body m-stack" data-gap="1">
              <span style="${small}">${label}</span>
              <span class="m-cluster" data-gap="2" data-align="baseline"><span style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-medium); font-variant-numeric: tabular-nums">${value}</span><span style="font-size: var(--m-font-size-xs);${tone ? ` color: var(--m-color-${tone}-fg)` : ' color: var(--m-color-fg-muted)'}">${delta}</span></span>
            </div>
          </section>`;

const recent = (ic: keyof typeof I, title: string, meta: string) =>
  `            <li class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding-block: var(--m-space-2)"><span style="color: var(--m-color-fg-muted); display: inline-flex">${icon(I[ic], 18)}</span><span class="m-stack" data-gap="0"><a href="#" style="color: var(--m-color-fg-default); text-decoration: none">${title}</a><span style="${tiny}">${meta}</span></span></li>`;

const dashboard = shell(
  'Today',
  `    <main class="m-container" data-size="md" style="padding-block: var(--m-space-16) var(--m-space-12)">
      <div class="m-stack" data-gap="8">
        <h1 style="${serif}; font-size: var(--m-font-size-3xl); line-height: var(--m-font-leading-tight); text-align: center; font-weight: var(--m-font-weight-regular)">Morning, Mara</h1>
        <div class="m-stack" data-gap="3">
        ${composer('oc-home', 'What should we work on for issue 48?')}
          <div class="m-cluster" data-gap="2" data-justify="center">
            <button type="button" class="m-button" data-size="sm">${icon(I.listChecks, 14)} Outline a piece</button>
            <button type="button" class="m-button" data-size="sm">${icon(I.pencil, 14)} Tighten a draft</button>
            <button type="button" class="m-button" data-size="sm">${icon(I.book, 14)} Check a quote</button>
            <button type="button" class="m-button" data-size="sm">${icon(I.calendar, 14)} Plan the issue</button>
          </div>
        </div>
        <section class="m-stack" data-gap="3" aria-labelledby="oc-week">
          <div class="m-cluster" data-justify="between">
            <h2 id="oc-week" style="${sans}; font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-medium)">This week</h2>
            <select class="m-select" data-size="sm" aria-label="Period"><option>Last 7 days</option><option>Last 30 days</option></select>
          </div>
          <div class="m-grid" style="--m-layout-grid-min: 10rem; --m-layout-grid-gap: var(--m-space-3)">
${stat('Readers', '12,480', '+214', 'success')}
${stat('Opened issue 47', '58.2%', '+1.4 pts', 'success')}
${stat('Drafts in review', '6', '2 waiting on you')}
${stat('Replies', '93', '−12 on last week')}
          </div>
        </section>
        <section class="m-stack" data-gap="2" aria-labelledby="oc-next">
          <div class="m-cluster" data-justify="between">
            <h2 id="oc-next" style="${sans}; ${small}">Going out next</h2>
            <a href="#" style="${small}; text-decoration: none">See the calendar</a>
          </div>
          <div class="m-table-wrap">
            <table class="m-table">
              <thead><tr><th>Issue</th><th>Lead piece</th><th>Sends</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td>48</td><td>The long way round</td><td>Thu, Nov 14</td><td><span class="m-badge" data-tone="warning">In review</span></td></tr>
                <tr><td>49</td><td>Notes from the salt marsh</td><td>Thu, Nov 21</td><td><span class="m-badge">Drafting</span></td></tr>
                <tr><td>Special</td><td>A year of letters</td><td>Mon, Dec 1</td><td><span class="m-badge" data-tone="success">Scheduled</span></td></tr>
              </tbody>
            </table>
          </div>
        </section>
        <section class="m-stack" data-gap="1" aria-labelledby="oc-recent">
          <div class="m-cluster" data-justify="between">
            <h2 id="oc-recent" style="${sans}; ${small}">Picked up recently</h2>
            <button type="button" class="m-button" data-variant="ghost" data-size="sm">Clear</button>
          </div>
          <ul class="m-stack" data-gap="0" style="padding: 0">
${recent('drafts', 'The long way round', 'Edited 2 hours ago · 1,840 words')}
${recent('notebook', 'Interview notes: the ferry crew', 'Edited yesterday')}
${recent('sources', 'Reading list for winter issues', '3 days ago')}
          </ul>
        </section>
      </div>
    </main>`,
);

const draftRow = (title: string, meta: string, badge: string, current = false) =>
  `            <li class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding: var(--m-space-3) var(--m-space-3); ${hairMuted}${current ? '; background: var(--m-color-accent-subtle); border-radius: var(--m-radius-md)' : ''}">
              <span class="m-stack" data-gap="0"><a href="#" style="color: var(--m-color-fg-default); text-decoration: none"${current ? ' aria-current="true"' : ''}>${title}</a><span style="${tiny}">${meta}</span></span>
              <span class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${badge}<button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="More for ${title}">${icon(I.more)}</button></span>
            </li>`;

const listDetail = shell(
  'Drafts',
  `    <div class="m-split" style="--m-layout-split-side: 24rem; --m-layout-split-gap: 0; min-block-size: 100vh">
      <!-- The list: a search box, a segment, then draft rows on faint hairlines -->
      <section class="m-stack" data-gap="4" aria-labelledby="oc-drafts" style="padding: var(--m-space-6) var(--m-space-5); border-inline-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
        <div class="m-cluster" data-justify="between">
          <h1 id="oc-drafts" style="${pageTitle}">Drafts</h1>
          <button type="button" class="m-button" data-variant="primary" data-size="sm">${icon(I.plus, 14)} New draft</button>
        </div>
        <div class="m-cluster" data-gap="2" role="search" style="flex-wrap: nowrap">
          <input class="m-input" type="search" placeholder="Search your drafts" aria-label="Search your drafts">
          <button type="button" class="m-button" data-icon-only aria-label="Filter">${icon(I.funnel)}</button>
        </div>
        <div class="m-cluster" data-justify="between">
          <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Whose drafts">
            <button type="button" class="m-tab" role="tab" aria-selected="true">All</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Mine</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Shared</button>
          </div></div>
          <span style="${tiny}">14 drafts</span>
        </div>
        <ul class="m-stack" data-gap="0" style="padding: 0">
${draftRow('The long way round', 'Edited 2 hours ago · 1,840 words', '<span class="m-badge" data-tone="warning">In review</span>', true)}
${draftRow('Notes from the salt marsh', 'Edited yesterday · 960 words', '<span class="m-badge">Drafting</span>')}
${draftRow('Letters, issue 48', 'Edited Monday · 12 letters', '<span class="m-badge">Drafting</span>')}
${draftRow('A field guide to rain', 'Edited Nov 3 · 2,310 words', '<span class="m-badge" data-tone="success">Ready</span>')}
${draftRow('What the archive kept', 'Edited Oct 28 · 3,050 words', '<span class="m-badge" data-tone="success">Ready</span>')}
        </ul>
      </section>

      <!-- The detail: the draft in a narrow serif column, then a conversation about it -->
      <div class="m-stack" data-gap="0">
        <header class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-6)">
          <span class="m-cluster" data-gap="1" style="${small}">Drafts ${icon(I.right, 14)} <span style="color: var(--m-color-fg-default)">The long way round</span></span>
          <span class="m-cluster" data-gap="1">
            <button type="button" class="m-button" data-size="sm">Share</button>
            <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="More">${icon(I.more)}</button>
          </span>
        </header>
        <main class="m-container" data-size="sm" style="--m-layout-container-max-sm: 42rem; padding-block: var(--m-space-8) var(--m-space-10)">
          <article class="m-stack" data-gap="6" aria-labelledby="oc-draft-title">
            <div class="m-stack" data-gap="2">
              <h1 id="oc-draft-title" style="${serif}; font-size: var(--m-font-size-3xl); line-height: var(--m-font-leading-tight)">The long way round</h1>
              <span style="${small}">By Mara Lindqvist · Issue 48 · 1,840 words · 8 minute read</span>
            </div>
            <div class="m-prose" style="${reading}">
              <p>The ferry was cancelled at seven, so we walked the headland instead: two hours along a path that the map called a road and the sheep called theirs.</p>
              <p>Somewhere past the second gate the wind dropped, and the bay opened out below us like a page that had been folded for years.</p>
              <blockquote>Nobody takes the long way on purpose. That is what makes it worth writing down.</blockquote>
            </div>
            <div class="m-chat" data-variant="flat" role="log" aria-label="Notes on this draft">
              <article class="m-message" data-role="user">
                <div class="m-message-body" style="justify-self: end; max-inline-size: 85%">Can you check the pacing of the middle section? It drags for me.</div>
              </article>
              <article class="m-message" data-role="assistant">
                <div class="m-message-body">
                  <details class="m-thinking">
                    <summary><span class="m-thinking-label">Reading the draft for pacing</span><span class="m-thinking-duration">6s</span></summary>
                    <div class="m-thinking-body"><p>The middle three paragraphs repeat the weather twice and the gate once.</p></div>
                  </details>
                  <div class="m-prose" style="${reading}">
                    <p>It slows in three places. The walk itself is quick; it's the asides that stall it:</p>
                  </div>
                    <div class="m-table-wrap" style="${reading}; margin-block: var(--m-space-4)"><table class="m-table" style="font-size: inherit">
                      <thead><tr><th style="color: var(--m-color-fg-default); font-size: inherit; font-weight: var(--m-font-weight-semibold)">Paragraph</th><th style="color: var(--m-color-fg-default); font-size: inherit; font-weight: var(--m-font-weight-semibold)">What slows it</th><th style="color: var(--m-color-fg-default); font-size: inherit; font-weight: var(--m-font-weight-semibold)" data-numeric>Words</th></tr></thead>
                      <tbody>
                        <tr><td>6</td><td>The weather, described a second time</td><td data-numeric>142</td></tr>
                        <tr><td>8</td><td>A list of the gates</td><td data-numeric>96</td></tr>
                        <tr><td>9</td><td>The ferry timetable</td><td data-numeric>118</td></tr>
                      </tbody>
                    </table></div>
                  <div class="m-prose" style="${reading}">
                    <p>Cutting paragraph 9 and folding 6 into 5 saves about 250 words without losing the turn at the second gate.</p>
                  </div>
                </div>
                <div class="m-message-actions">
                  <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Copy">${icon(I.copy)}</button>
                  <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Try again">${icon(I.retry)}</button>
                  <button type="button" class="m-button" data-variant="ghost" data-size="sm">Apply the cuts</button>
                </div>
              </article>
            </div>
            <div class="m-stack" data-gap="2">
        ${composer('oc-reply', 'Reply…')}
              <p style="${tiny}; text-align: end">Suggestions can be wrong. Check quotes against your sources.</p>
            </div>
          </article>
        </main>
      </div>
    </div>`,
);

const onboarding = `<main class="m-container" data-size="sm" style="--m-layout-container-max-sm: 30rem; padding-block: var(--m-space-12)">
  <div class="m-stack" data-gap="8" data-align="center">
    ${mark('var(--m-font-size-2xl)')}
    <div class="m-stack" data-gap="2" data-align="center" style="text-align: center">
      <h1 style="${serif}; font-size: var(--m-font-size-3xl); line-height: var(--m-font-leading-tight); font-weight: var(--m-font-weight-regular)">Set up your desk</h1>
      <p style="${serif}; font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-regular)">A few answers, and Harrow writes in your house style.</p>
    </div>
    <form class="m-card" style="--m-card-radius: 24px; inline-size: 100%; box-shadow: var(--m-shadow-md)" aria-labelledby="oc-onb-step">
      <div class="m-card-body m-stack" data-gap="6">
        <div class="m-stack" data-gap="2">
          <span id="oc-onb-step" style="${tiny}">Step 2 of 3</span>
          <progress class="m-progress" data-size="sm" value="2" max="3" aria-labelledby="oc-onb-step">2 of 3</progress>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="oc-onb-name">Publication name</label>
          <input class="m-input" id="oc-onb-name" value="The Tidal Letter" aria-describedby="oc-onb-name-hint">
          <p class="m-field-hint" id="oc-onb-name-hint">Readers see this in the From line.</p>
        </div>
        <fieldset class="m-stack" data-gap="2" style="border: 0; padding: 0; margin: 0">
          <legend class="m-field-label" style="margin-block-end: var(--m-space-2)">How often do you send?</legend>
          <div class="m-grid" style="--m-layout-grid-min: 9rem; --m-layout-grid-gap: var(--m-space-2)">
            <label class="m-stack" data-gap="1" style="padding: var(--m-space-3); border: var(--m-border-width-thin) solid var(--m-color-accent-default); border-radius: var(--m-radius-lg)"><span class="m-cluster" data-justify="between">${icon(I.calendar)} <input class="m-radio" type="radio" name="oc-onb-cadence" checked></span><span>Weekly</span><span style="${tiny}">One issue, same day</span></label>
            <label class="m-stack" data-gap="1" style="padding: var(--m-space-3); border: var(--m-border-width-thin) solid var(--m-color-border-default); border-radius: var(--m-radius-lg)"><span class="m-cluster" data-justify="between">${icon(I.clock)} <input class="m-radio" type="radio" name="oc-onb-cadence"></span><span>When it's ready</span><span style="${tiny}">No fixed day</span></label>
          </div>
        </fieldset>
        <div class="m-field">
          <label class="m-field-label" for="oc-onb-voice">House style</label>
          <textarea class="m-input" id="oc-onb-voice" rows="3" aria-describedby="oc-onb-voice-hint">Plain words, short paragraphs, British spelling. No exclamation marks.</textarea>
          <p class="m-field-hint" id="oc-onb-voice-hint">You can change this any time in Publication settings.</p>
        </div>
        <div class="m-stack" data-gap="2">
          <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Continue</button>
          <button type="button" class="m-button" data-variant="ghost" style="inline-size: 100%">${icon(I.left, 14)} Back</button>
        </div>
      </div>
    </form>
    <p style="${tiny}; text-align: center; max-inline-size: 24rem">By continuing you agree to the <a href="#" style="color: inherit">terms</a>. You can delete your desk and everything in it from Settings.</p>
  </div>
</main>`;

const settingsRow = (label: string, desc: string, control: string) => `        <div class="m-cluster" data-justify="between" style="flex-wrap: nowrap; gap: var(--m-space-6); padding-block: var(--m-space-4)">
          <div class="m-stack" data-gap="1"><span>${label}</span>${desc ? `<span style="${small}">${desc}</span>` : ''}</div>
          <div style="flex: none">${control}</div>
        </div>`;

const switchRow = (label: string, desc: string, on: boolean) =>
  settingsRow(
    `<span style="font-weight: var(--m-font-weight-medium)">${label}</span>`,
    desc,
    `<input class="m-switch" type="checkbox" role="switch" aria-label="${label}"${on ? ' checked' : ''}>`,
  );

const settings = `<main class="m-container" style="--m-layout-container-max-lg: 72rem; padding-block: var(--m-space-8) var(--m-space-12)">
  <div class="m-stack" data-gap="8">
    <h1 style="${pageTitle}; padding-inline: var(--m-space-2)">Settings</h1>
    <div class="m-split" style="--m-layout-split-side: 14rem; --m-layout-split-gap: var(--m-space-10)">
      <nav class="m-sidebar" aria-label="Settings" style="--m-sidebar-bg: transparent; --m-sidebar-link-active-bg: var(--m-color-accent-subtle); border: 0; padding: 0">
        <div class="m-sidebar-section">
          <ul>
${['Profile', 'Publication', 'Members', 'Delivery', 'Domains', 'Plan and invoices', 'Imports'].map((l) => `            <li><a class="m-sidebar-link" href="#"${l === 'Publication' ? ' aria-current="page"' : ''} style="font-size: var(--m-font-size-md)">${l}</a></li>`).join('\n')}
          </ul>
        </div>
      </nav>
      <div class="m-stack" data-gap="6" style="max-inline-size: 48rem">
        <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap">
          <span style="display: inline-grid; place-items: center; inline-size: 2.5rem; block-size: 2.5rem; flex: none; border-radius: var(--m-radius-md); border: var(--m-border-width-thin) solid var(--m-color-border-default); background: var(--m-color-bg-sunken); color: var(--m-color-fg-muted)">${icon(I.issues, 20)}</span>
          <div class="m-stack" data-gap="0"><h2 style="${sans}; font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium)">Publication</h2><span style="color: var(--m-color-fg-muted)">How The Tidal Letter looks and sends</span></div>
        </div>
        <p>These apply to every issue. Members with the Editor role can change them; everyone else sees them read-only. <a href="#" style="color: inherit">About roles</a></p>
        <div class="m-stack" data-gap="0">
${settingsRow('Publication name', '', '<input class="m-input" value="The Tidal Letter" aria-label="Publication name" style="inline-size: 16rem">')}
${settingsRow('Sender address', 'Replies come back to this inbox.', '<span class="m-cluster" data-gap="3"><span style="font-family: var(--m-font-family-mono); font-size: var(--m-font-size-sm)">letters@tidal.example</span><button type="button" class="m-button">Change</button></span>')}
${settingsRow('House style', 'The voice Harrow writes and edits in.', `<button type="button" class="m-button">Edit ${icon(I.external, 14)}</button>`)}
${settingsRow('Archive', 'Past issues on a public page.', '<button type="button" class="m-button" data-variant="secondary" style="background: var(--m-color-accent-subtle); border-color: var(--m-color-accent-subtle)">Manage</button>')}
        </div>
        <hr class="m-divider">
        <h2 style="${sans}; font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-semibold)">Drafting</h2>
        <div class="m-stack" data-gap="0">
${switchRow('Suggest headlines', 'Offer three headline options when a draft is marked ready.', true)}
${switchRow('Check quotes against sources', 'Flag any quote that doesn’t match a saved source word for word.', true)}
${switchRow('Learn from past issues', 'Use the archive to keep names, places and spellings consistent.', false)}
        </div>
        <hr class="m-divider">
        <section class="m-cluster" data-justify="between" style="flex-wrap: nowrap; gap: var(--m-space-6)" aria-labelledby="oc-close">
          <div class="m-stack" data-gap="1"><h2 id="oc-close" style="${sans}; font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-semibold)">Close the publication</h2><span style="${small}">Stops sending, keeps the archive for 30 days, then deletes it with all 212 issues.</span></div>
          <button type="button" class="m-button" data-variant="danger" style="flex: none">Close publication</button>
        </section>
      </div>
    </div>
  </div>
</main>`;

const emptyState = shell(
  'Sources',
  `    <main class="m-container" data-size="md" style="padding-block: var(--m-space-8) var(--m-space-12)">
      <div class="m-stack" data-gap="16">
        <div class="m-cluster" data-justify="between">
          <h1 style="${pageTitle}">Sources</h1>
          <button type="button" class="m-button" data-variant="primary" data-size="sm">${icon(I.plus, 14)} Add a source</button>
        </div>
        <div class="m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-12)">
          <span style="color: var(--m-color-fg-subtle)">${icon(I.sources, 40, 1.25)}</span>
          <h2 style="${serif}; font-size: var(--m-font-size-xl)">Nothing on the shelf yet</h2>
          <p class="m-muted" style="max-inline-size: 26rem">Sources are the articles, books and notes your pieces lean on. Save one, and Harrow can check every quote against it.</p>
          <div class="m-cluster" data-gap="2" data-justify="center">
            <button type="button" class="m-button" data-variant="primary">${icon(I.plus, 14)} Add a source</button>
            <button type="button" class="m-button">Import a reading list</button>
          </div>
        </div>
      </div>
    </main>`,
);

const tier = (
  ic: keyof typeof I,
  name: string,
  tagline: string,
  price: string,
  note: string,
  intro: string,
  features: string[],
  cta: string,
) => `      <section class="m-card" style="--m-card-radius: 24px" aria-labelledby="oc-tier-${name.toLowerCase()}">
        <div class="m-card-body m-stack" data-gap="6" style="padding: var(--m-space-8)">
          <span style="color: var(--m-color-fg-default)">${icon(I[ic], 40, 1.25)}</span>
          <div class="m-stack" data-gap="1">
            <h2 id="oc-tier-${name.toLowerCase()}" style="${serif}; font-size: var(--m-font-size-3xl); line-height: var(--m-font-leading-tight)">${name}</h2>
            <p style="font-size: var(--m-font-size-lg); color: var(--m-color-fg-muted)">${tagline}</p>
          </div>
          <div class="m-stack" data-gap="1" style="min-block-size: 5.25rem">
            <span style="font-size: 1.5rem; font-weight: var(--m-font-weight-semibold); font-variant-numeric: tabular-nums">${price}</span>
            <span style="${tiny}">${note}</span>
          </div>
          <button type="button" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">${cta}</button>
          <div class="m-stack" data-gap="3" style="${hairMuted}; padding-block-start: var(--m-space-6)">
            ${intro ? `<p style="font-weight: var(--m-font-weight-semibold)">${intro}</p>` : ''}
            <ul class="m-stack" data-gap="3" style="padding: 0">
${features.map((f) => `              <li class="m-cluster" data-gap="3" data-align="start" style="flex-wrap: nowrap"><span style="flex: none; display: inline-flex; padding-block-start: 0.2em">${icon(I.check, 14)}</span><span>${f}</span></li>`).join('\n')}
            </ul>
          </div>
        </div>
      </section>`;

const pricing = `<div>
  <header class="m-navbar">
    <a class="m-navbar-brand" href="#">${mark('var(--m-font-size-2xl)')}</a>
    <nav class="m-navbar-nav" aria-label="Main">
      <a class="m-navbar-link" href="#">Writing ${icon(I.down, 12)}</a>
      <a class="m-navbar-link" href="#">For teams ${icon(I.down, 12)}</a>
      <a class="m-navbar-link" href="#">Stories</a>
      <a class="m-navbar-link" href="#" aria-current="page">Plans</a>
    </nav>
    <div class="m-navbar-actions">
      <a class="m-navbar-link" href="#">Sign in</a>
      <a class="m-button" data-size="sm" href="#">Talk to us</a>
      <a class="m-button" data-variant="primary" href="#">Start writing</a>
    </div>
  </header>
  <div class="m-cluster" data-justify="between" style="padding: var(--m-space-3) clamp(1rem, 4.5vw, 4rem); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-muted); ${tiny}"><span style="color: var(--m-color-fg-default)">Plans</span><span class="m-cluster" data-gap="1">On this page ${icon(I.down, 12)}</span></div>
  <main class="m-container" data-size="lg" style="padding-block: var(--m-space-16)">
    <div class="m-stack" data-gap="12">
      <div class="m-stack" data-gap="8" data-align="center" style="text-align: center">
        <h1 style="${serif}; font-size: var(--m-font-size-4xl); line-height: var(--m-font-leading-tight)">Plans for every desk</h1>
        <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Billing">
          <button type="button" class="m-tab" role="tab" aria-selected="true" style="font-size: var(--m-font-size-xs)">Yearly</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1" style="font-size: var(--m-font-size-xs)">Monthly</button>
        </div></div>
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 17rem; --m-layout-grid-gap: var(--m-space-6)">
${tier('book', 'Reader', 'For reading and notes', '$0', 'Free, for one person', '', ['Save up to 50 sources', 'Notes and highlights', 'One draft at a time', 'Read on the web and phone'], 'Start reading')}
${tier('feather', 'Writer', 'For a weekly letter', '$12', 'A month, billed yearly ($144). $15 billed monthly.', 'Everything in Reader, plus:', ['Unlimited drafts and sources', 'House style for every edit', 'Quote checking against sources <span class="m-badge">New</span>', 'Send to up to 5,000 readers'], 'Start writing')}
${tier('sources', 'Studio', 'For a small editorial team', '$34', 'Per editor, a month, billed yearly', 'Everything in Writer, plus:', ['Shared drafts and review', 'Roles for editors and contributors', 'Custom sending domain', 'Priority help from a person'], 'Start a studio')}
      </div>
      <p style="${tiny}; text-align: center">Prices exclude sales tax. Readers on every plan read for free.</p>
      <section class="m-stack" data-gap="6" aria-labelledby="oc-faq" style="max-inline-size: 48rem; margin-inline: auto; inline-size: 100%; padding-block-start: var(--m-space-12)">
        <h2 id="oc-faq" style="${serif}; font-size: var(--m-font-size-4xl); text-align: center">Questions</h2>
        <div class="m-accordion" style="border-inline: 0; border-block-start: 0">
          <details class="m-accordion-item" name="oc-faq" open><summary>Can I bring my old archive?</summary><div class="m-accordion-content">Yes. Import a file of past issues, and they keep their dates and links.</div></details>
          <details class="m-accordion-item" name="oc-faq"><summary>What counts as a reader?</summary><div class="m-accordion-content">Anyone subscribed to receive your letter. Unsubscribed and bounced addresses don't count.</div></details>
          <details class="m-accordion-item" name="oc-faq"><summary>Can I switch plans later?</summary><div class="m-accordion-content">Any time. Moving up applies at once; moving down applies at the end of the billing period.</div></details>
          <details class="m-accordion-item" name="oc-faq"><summary>Do you train on my drafts?</summary><div class="m-accordion-content">No. Your drafts and sources are used only to answer you.</div></details>
        </div>
      </section>
    </div>
  </main>
</div>`;

// Errors: inline on the field, a notice above the form, a toast for what happened elsewhere, and
// full pages for not found, failure and no access. Calm: serif titles, plain words, no red pages.
const errorPage = (
  code: string,
  ic: string,
  title: string,
  body: string,
  actions: string,
) => `  <section class="m-stack" data-gap="4" data-align="center" style="text-align: center; padding-block: var(--m-space-16); ${hair}" aria-labelledby="oc-err-${code}">
    <span style="color: var(--m-color-fg-subtle)">${icon(ic, 40, 1.25)}</span>
    <span style="${tiny}; font-family: var(--m-font-family-mono)">${code}</span>
    <h1 id="oc-err-${code}" style="${pageTitle}">${title}</h1>
    <p class="m-muted" style="max-inline-size: 28rem">${body}</p>
    <div class="m-cluster" data-gap="2" data-justify="center">${actions}</div>
  </section>`;

const errors = `<main class="m-container" data-size="md" style="padding-block: var(--m-space-12)">
  <div class="m-stack" data-gap="10">
    <section class="m-stack" data-gap="5" aria-labelledby="oc-err-form" style="max-inline-size: 30rem">
      <h1 id="oc-err-form" style="${pageTitle}">Schedule issue 48</h1>
      <div class="m-alert" data-tone="danger" role="alert">
        <span class="m-alert-icon">${icon(I.alert, 16)}</span>
        <div class="m-alert-content"><div class="m-alert-title">2 things need fixing</div><div class="m-alert-body">Nothing was scheduled. Check the send time and the subject line.</div></div>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="oc-err-subject">Subject line</label>
        <input class="m-input" id="oc-err-subject" value="" aria-invalid="true" aria-describedby="oc-err-subject-e">
        <p class="m-field-error" id="oc-err-subject-e">Add a subject line. Readers see it before anything else.</p>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="oc-err-time">Send at</label>
        <input class="m-input" id="oc-err-time" value="Nov 10, 07:00" aria-invalid="true" aria-describedby="oc-err-time-e" style="font-variant-numeric: tabular-nums">
        <p class="m-field-error" id="oc-err-time-e">That time has passed. Pick a time after 14:20 today.</p>
      </div>
      <div class="m-cluster" data-justify="end" data-gap="2">
        <button type="button" class="m-button">Cancel</button>
        <button type="submit" class="m-button" data-variant="primary">Schedule</button>
      </div>
    </section>
    <section class="m-stack" data-gap="3" aria-label="A toast">
      <div class="m-toast" data-tone="danger" role="alert"><div class="m-toast-content"><div class="m-toast-title">Issue 47 didn't reach 31 readers</div><div class="m-toast-body">Their addresses bounced. Nothing else was affected.</div></div><button type="button" class="m-button" data-size="sm">Review</button></div>
    </section>
${errorPage('404', I.search, 'We can’t find that page', 'The link may be old, or the draft was moved to another desk.', `<a class="m-button" data-variant="primary" href="#">Back to Today</a>`)}
${errorPage('500', I.alert, 'Something went wrong on our side', 'Your draft is saved and nothing was sent. Try again in a moment.', `<button type="button" class="m-button" data-variant="primary">${icon(I.retry, 14)} Try again</button><a class="m-button" href="#">Status page</a>`)}
${errorPage('403', I.lock, 'This draft is private', 'Only its author and editors of The Tidal Letter can open it. Ask Mara for access.', `<button type="button" class="m-button" data-variant="primary">Ask for access</button><a class="m-button" data-variant="ghost" href="#">Go back</a>`)}
  </div>
</main>`;

export const ochreRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'A warm left rail, a serif greeting over a soft composer with suggestion buttons, then the week’s figures, a hairline table and a recent list.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'Searchable rows on faint hairlines beside the open item in a narrow serif reading column, with a conversation and a composer under it.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'A serif welcome over one white card with 24px corners: a thin progress bar, fields, choice cards and a full-width ink button.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A serif title, a plain settings list with the current row on a fill, and label-and-control rows on hairlines with blue switches.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description: 'Inside the app: a thin outline icon, a serif heading, one sentence, an ink button and an outlined one.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'A public page: a large serif title, a segment, white cards with 24px corners, ink buttons, check lists and a hairline FAQ.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors under the field, a notice above the form that says nothing was scheduled, a toast, and calm full pages for 404, 500 and no access.',
    html: errors,
  },
];
