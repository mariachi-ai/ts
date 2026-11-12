import type { ArchetypeRecipe } from '../types';

/*
 * Meridian's seven layout recipes: framework-free HTML using only @mariachi/design classes and
 * tokens (no colour literals), with sample data from a made-up background-jobs platform
 * ("Relayworks", workspace "Kestrel Labs"). They follow the language's real screen patterns: a
 * background-200 sidebar with a hairline edge beside the content, a breadcrumb bar, a toolbar of
 * search, filter and a view switch over hairline cards, 10px status dots beside the state's name,
 * monospace for hashes, endpoints and logs, settings as stacked cards with a background-200 footer
 * that holds the save, and pricing as one hairline frame split into three columns.
 */

// Lucide icons, outlined, 1.5px stroke at 16px
const icon = (paths: string, size = 16, label?: string) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${size > 24 ? 1.25 : 1.5}" stroke-linecap="round" stroke-linejoin="round"${label ? ` role="img" aria-label="${label}"` : ' aria-hidden="true"'} style="flex: none">${paths}</svg>`;
const I = {
  workflow:
    '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
  updown: '<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  activity:
    '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
  box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  queue:
    '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>',
  webhook:
    '<path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2"/><path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06"/><path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8"/>',
  key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  gear: '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',
  bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
  filter: '<path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  branch: '<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  commit: '<circle cx="12" cy="12" r="3"/><line x1="3" x2="9" y1="12" y2="12"/><line x1="15" x2="21" y1="12" y2="12"/>',
  repo: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/><path d="M8 11V7"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  alert: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/>',
  server:
    '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  terminal: '<path d="M12 19h8"/><path d="m4 17 6-6-6-6"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  headset:
    '<path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/>',
  minus: '<path d="M5 12h14"/>',
};

// Shared styles, all from tokens
const mono = 'font-family: var(--m-font-family-mono)';
const muted = 'color: var(--m-color-fg-muted)';
const small = 'font-size: var(--m-font-size-sm)';
const hair = 'var(--m-border-width-thin) solid var(--m-color-border-default)';
const h1 =
  'font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)';
const h2 =
  'font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-heading-tracking)';
const h3 = 'font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-heading-tracking)';
const tile =
  'display: inline-grid; place-items: center; inline-size: 1.5rem; block-size: 1.5rem; border-radius: var(--m-radius-md); background: var(--m-color-accent-default); color: var(--m-color-accent-fg)';

// The 10px status dot, always beside the state's name
const tones = {
  ready: 'var(--m-color-success-solid)',
  building: 'var(--m-color-warning-solid)',
  error: 'var(--m-color-danger-solid)',
  queued: 'var(--m-color-border-strong)',
  canceled: 'var(--m-color-border-default)',
};
const dot = (t: keyof typeof tones) =>
  `<span aria-hidden="true" style="display: inline-block; flex: none; inline-size: 10px; block-size: 10px; border-radius: var(--m-radius-full); background: ${tones[t]}"></span>`;
const state = (t: keyof typeof tones, label: string) =>
  `<span class="m-cluster" data-gap="2" style="flex-wrap: nowrap">${dot(t)}<span>${label}</span></span>`;

// A search box with an icon on the left and a key on the right
const search = (id: string, placeholder: string, key: string, size = 'md', flex = '1 1 14rem') =>
  `<div style="position: relative; flex: ${flex}; min-inline-size: 0">
            <span style="position: absolute; inset-block: 0; inset-inline-start: var(--m-space-3); display: flex; align-items: center; ${muted}">${icon(I.search, 16)}</span>
            <input class="m-input" data-size="${size}" id="${id}" type="search" placeholder="${placeholder}" aria-label="${placeholder.replace('…', '')}" style="padding-inline: 2.25rem 2.75rem">
            <span style="position: absolute; inset-block: 0; inset-inline-end: var(--m-space-2); display: flex; align-items: center"><kbd class="m-kbd">${key}</kbd></span>
          </div>`;

// The app: a background-200 sidebar with a hairline edge, and the content on background-100
const navItems: [keyof typeof I, string, string?][] = [
  ['activity', 'Activity'],
  ['box', 'Jobs'],
  ['queue', 'Queues', '4'],
  ['clock', 'Schedules'],
  ['cpu', 'Workers'],
  ['webhook', 'Webhooks'],
  ['key', 'Secrets'],
];
const navLower: [keyof typeof I, string][] = [
  ['users', 'Members'],
  ['card', 'Billing'],
  ['gear', 'Settings'],
];
const navList = (items: [keyof typeof I, string, string?][], current: string) =>
  items
    .map(
      ([ic, l, count]) =>
        `          <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${icon(I[ic], 16)} ${l}${count ? ` <span class="m-sidebar-count">${count}</span>` : ''}</a></li>`,
    )
    .join('\n');

const shell = (current: string, crumbs: string[], main: string) => `<div class="m-split" style="--m-layout-split-side: 16rem; --m-layout-split-gap: 0; min-block-size: 100vh">
  <nav class="m-sidebar" aria-label="Main">
    <div class="m-stack" data-gap="3" style="padding: var(--m-space-1)">
      <button type="button" class="m-button" data-variant="ghost" style="justify-content: space-between; inline-size: 100%; padding-inline: var(--m-space-2)">
        <span class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span style="${tile}">${icon(I.workflow, 14)}</span> Kestrel Labs <span class="m-badge" data-tone="info">Crew</span></span>
        <span style="${muted}">${icon(I.updown, 16)}</span>
      </button>
      ${search(`mr-find-${current.toLowerCase()}`, 'Search…', '⌘K', 'sm', 'none')}
    </div>
    <div class="m-sidebar-section">
      <ul>
${navList(navItems, current)}
      </ul>
    </div>
    <div class="m-sidebar-section" style="margin-block-start: auto; padding-block-start: var(--m-space-3); border-block-start: ${hair}">
      <ul>
${navList(navLower, current)}
      </ul>
    </div>
  </nav>
  <div class="m-stack" data-gap="0">
    <header class="m-cluster" data-justify="between" style="min-block-size: 3.5rem; padding: var(--m-space-2) var(--m-space-6); border-block-end: ${hair}">
      <nav class="m-breadcrumb" aria-label="Breadcrumb">
        <ol>
${crumbs.map((c, i) => `          <li>${i === crumbs.length - 1 ? `<span aria-current="page">${c}</span>` : `<a href="#">${c}</a>`}</li>`).join('\n')}
        </ol>
      </nav>
      <div class="m-cluster" data-gap="2">
        <a class="m-button" data-variant="ghost" data-size="sm" href="#">${dot('ready')} All systems normal</a>
        <button type="button" class="m-button" data-variant="secondary" data-size="sm" data-icon-only aria-label="Notifications" style="border-radius: var(--m-radius-full)">${icon(I.bell, 16)}</button>
        <span class="m-avatar" data-size="md" aria-label="Noor Abbasi">NA</span>
      </div>
    </header>
${main}
  </div>
</div>`;

// A ring gauge, 16px, in the published blue
const gauge = (pct: number, label: string) => {
  const c = 2 * Math.PI * 9;
  return `<svg width="16" height="16" viewBox="0 0 24 24" role="img" aria-label="${label}" style="flex: none; transform: rotate(-90deg)"><circle cx="12" cy="12" r="9" fill="none" stroke-width="3" style="stroke: var(--m-color-border-default)"/><circle cx="12" cy="12" r="9" fill="none" stroke-width="3" stroke-linecap="round" stroke-dasharray="${((c * pct) / 100).toFixed(1)} ${c.toFixed(1)}" style="stroke: var(--m-color-info-solid)"/></svg>`;
};
const usageRow = (pct: number, name: string, amount: string, shaded: boolean) =>
  `<li class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding: var(--m-space-2) var(--m-space-3); border-radius: var(--m-radius-md)${shaded ? '; background: var(--m-color-accent-subtle)' : ''}"><span class="m-cluster" data-gap="3" style="flex-wrap: nowrap; min-inline-size: 0">${gauge(pct, `${pct}% used`)}<span>${name}</span></span><span style="font-variant-numeric: tabular-nums; ${muted}">${amount}</span></li>`;

const jobCard = (
  initials: string,
  name: string,
  endpoint: string,
  repo: string,
  message: string,
  when: string,
  branch: string,
  st: keyof typeof tones,
) => `<a class="m-card" href="#" style="gap: var(--m-space-4)">
              <div class="m-cluster" data-justify="between" data-align="start" style="flex-wrap: nowrap">
                <span class="m-cluster" data-gap="3" style="flex-wrap: nowrap; min-inline-size: 0"><span class="m-avatar" data-size="lg">${initials}</span><span class="m-stack" data-gap="0" style="min-inline-size: 0"><span style="font-weight: var(--m-font-weight-medium)">${name}</span><span style="${mono}; ${small}; ${muted}">${endpoint}</span></span></span>
                <span class="m-cluster" data-gap="2">${dot(st)}<span class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="More for ${name}" role="button">${icon(I.more, 16)}</span></span>
              </div>
              <span class="m-badge" style="align-self: flex-start">${icon(I.repo, 12)} ${repo}</span>
              <div class="m-stack" data-gap="1">
                <span style="font-weight: var(--m-font-weight-medium); overflow: hidden; text-overflow: ellipsis; white-space: nowrap">${message}</span>
                <span class="m-cluster" data-gap="1" style="${small}; ${muted}">${when} on ${icon(I.branch, 14)} <span style="${mono}">${branch}</span></span>
              </div>
            </a>`;

const runLine = (st: keyof typeof tones, label: string, name: string, hash: string, when: string) =>
  `<li class="m-cluster" data-justify="between" style="flex-wrap: nowrap; padding-block: var(--m-space-3); border-block-start: ${hair}"><span class="m-stack" data-gap="1" style="min-inline-size: 0"><span>${name}</span><span class="m-cluster" data-gap="3" style="${small}; ${muted}">${state(st, label)}<span style="${mono}">${hash}</span></span></span><span style="${small}; ${muted}; white-space: nowrap">${when}</span></li>`;

const dashboard = shell(
  'Activity',
  ['Kestrel Labs', 'Activity'],
  `    <main class="m-container" style="padding-block: var(--m-space-6) var(--m-space-12)">
      <div class="m-stack" data-gap="6">
        <div class="m-cluster" data-gap="2">
          ${search('mr-dash-search', 'Search jobs…', '/')}
          <button type="button" class="m-button" data-icon-only aria-label="Filter and sort">${icon(I.filter, 16)}</button>
          <div class="m-tabs" data-variant="pill" style="padding: 3px; border: ${hair}; border-radius: var(--m-radius-control)"><div class="m-tab-list" role="tablist" aria-label="View">
            <button type="button" class="m-tab" role="tab" aria-selected="true" aria-label="Grid" style="block-size: 1.75rem; padding-inline: var(--m-space-2)">${icon(I.grid, 16)}</button>
            <button type="button" class="m-tab" role="tab" aria-selected="false" aria-label="List" tabindex="-1" style="block-size: 1.75rem; padding-inline: var(--m-space-2)">${icon(I.list, 16)}</button>
          </div></div>
          <button type="button" class="m-button" data-variant="primary">New job ${icon(I.down, 16)}</button>
        </div>
        <div class="m-split" style="--m-layout-split-side: 22rem; --m-layout-split-gap: var(--m-space-6); align-items: flex-start">
          <div class="m-stack" data-gap="6">
            <section class="m-stack" data-gap="3" aria-labelledby="mr-usage">
              <h2 id="mr-usage" style="${h3}">Usage</h2>
              <div class="m-card" style="gap: var(--m-space-3); padding: var(--m-space-4)">
                <div class="m-cluster" data-justify="between" data-align="start">
                  <div class="m-stack" data-gap="0"><span style="font-weight: var(--m-font-weight-medium)">Period ends Nov 30</span><span style="${small}; ${muted}">Refreshed every hour</span></div>
                  <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Usage options">${icon(I.more, 16)}</button>
                </div>
                <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
                  ${usageRow(64, 'Job runs', '64K / 100K', true)}
                  ${usageRow(38, 'Worker minutes', '1,140 / 3,000', false)}
                  ${usageRow(91, 'Queue messages', '9.1M / 10M', true)}
                  ${usageRow(12, 'Log retention', '1.2 GB / 10 GB', false)}
                </ul>
                <a class="m-button" data-size="sm" href="#" style="align-self: flex-start">Upgrade</a>
              </div>
            </section>
            <section class="m-stack" data-gap="3" aria-labelledby="mr-recent">
              <h2 id="mr-recent" style="${h3}">Recent runs</h2>
              <div class="m-card" style="gap: 0; padding: 0 var(--m-space-4)">
                <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none; margin-block-start: -1px">
                  ${runLine('ready', 'Ready', 'nightly-rollup', 'r_8f2c1a9', '4m ago')}
                  ${runLine('building', 'Running', 'thumbnail-fanout', 'r_31be07d', '7m ago')}
                  ${runLine('error', 'Failed', 'invoice-sync', 'r_c94d2e0', '22m ago')}
                </ul>
              </div>
            </section>
          </div>
          <section class="m-stack" data-gap="3" aria-labelledby="mr-jobs">
            <h2 id="mr-jobs" class="m-sr-only">Jobs</h2>
            <div class="m-grid" style="--m-layout-grid-min: 17rem; --m-layout-grid-gap: var(--m-space-4)">
            ${jobCard('NR', 'nightly-rollup', 'jobs.kestrel.dev/rollup', 'kestrel/pipelines', 'Batch rollups by tenant before writing', '4m ago', 'main', 'ready')}
            ${jobCard('TF', 'thumbnail-fanout', 'jobs.kestrel.dev/thumbs', 'kestrel/media', 'Cap fan-out at 64 workers per upload', '7m ago', 'cap-fanout', 'building')}
            ${jobCard('IS', 'invoice-sync', 'jobs.kestrel.dev/invoices', 'kestrel/billing', 'Retry ledger writes with backoff', '22m ago', 'main', 'error')}
            ${jobCard('SC', 'search-compactor', 'jobs.kestrel.dev/compact', 'kestrel/search', 'Skip empty segments when merging', '2h ago', 'main', 'ready')}
            ${jobCard('EW', 'email-warmup', 'jobs.kestrel.dev/warmup', 'kestrel/outreach', 'Spread sends across the morning', 'Yesterday', 'spread-sends', 'queued')}
            ${jobCard('GC', 'orphan-sweeper', 'jobs.kestrel.dev/sweep', 'kestrel/storage', 'Keep orphaned uploads for 7 days', 'Oct 28', 'main', 'canceled')}
            </div>
          </section>
        </div>
      </div>
    </main>`,
);

// A run row: id and trigger | state and duration | branch and commit | when and who | more
const run = (
  id: string,
  trigger: string,
  current: boolean,
  st: keyof typeof tones,
  label: string,
  took: string,
  branch: string,
  sha: string,
  msg: string,
  when: string,
  who: string,
  selected = false,
) => `<tr${selected ? ' aria-selected="true" style="background: var(--m-color-accent-subtle)"' : ''}>
              <td><div class="m-stack" data-gap="0"><a href="#" style="${mono}; color: var(--m-color-fg-default); text-decoration: none; font-weight: var(--m-font-weight-medium)">${id}</a><span class="m-cluster" data-gap="2" style="${small}; ${muted}">${trigger}${current ? ' <span class="m-badge" data-tone="info" style="block-size: 1.25rem">Latest</span>' : ''}</span></div></td>
              <td><div class="m-stack" data-gap="0">${state(st, label)}<span style="${small}; ${muted}; padding-inline-start: 18px; font-variant-numeric: tabular-nums">${took}</span></div></td>
              <td><div class="m-stack" data-gap="0" style="min-inline-size: 0"><span class="m-cluster" data-gap="1" style="flex-wrap: nowrap">${icon(I.branch, 14)}<span style="${mono}; ${small}">${branch}</span></span><span class="m-cluster" data-gap="1" style="flex-wrap: nowrap; ${small}; ${muted}">${icon(I.commit, 14)}<span style="${mono}">${sha}</span> <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-inline-size: 16rem">${msg}</span></span></div></td>
              <td style="text-align: end; white-space: nowrap"><span class="m-cluster" data-gap="2" data-justify="end" style="flex-wrap: nowrap; ${small}; ${muted}">${when} by ${who} <span class="m-avatar" data-size="sm">${who.slice(0, 2).toUpperCase()}</span></span></td>
              <td style="inline-size: 3rem"><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Actions for ${id}">${icon(I.more, 16)}</button></td>
            </tr>`;

const meta = (k: string, v: string) =>
  `<div class="m-stack" data-gap="1"><span style="${small}; ${muted}">${k}</span><span>${v}</span></div>`;

const log = (t: string, lvl: 'info' | 'warn' | 'error', msg: string) =>
  `<div style="display: grid; grid-template-columns: 7.5rem 3rem 1fr; gap: var(--m-space-3); padding: 2px var(--m-space-4)${lvl === 'error' ? '; background: var(--m-color-danger-bg); color: var(--m-color-danger-fg)' : lvl === 'warn' ? '; background: var(--m-color-warning-bg); color: var(--m-color-warning-fg)' : ''}"><span style="${lvl === 'info' ? muted : ''}">${t}</span><span style="${lvl === 'info' ? muted : ''}">${lvl.toUpperCase()}</span><span>${msg}</span></div>`;

const listDetail = shell(
  'Jobs',
  ['Kestrel Labs', 'invoice-sync', 'Runs'],
  `    <main class="m-container" style="padding-block: var(--m-space-8) var(--m-space-12)">
      <div class="m-stack" data-gap="6">
        <div class="m-cluster" data-justify="between">
          <div class="m-stack" data-gap="1">
            <h1 style="${h1}">Runs</h1>
            <p style="${muted}">Every run of invoice-sync, newest first. Runs are kept for 30 days.</p>
          </div>
          <div class="m-cluster" data-gap="2">
            <button type="button" class="m-button">${icon(I.refresh, 16)} Rerun latest</button>
            <button type="button" class="m-button" data-variant="primary">${icon(I.zap, 16)} Trigger run</button>
          </div>
        </div>
        <div class="m-cluster" data-gap="2">
          <button type="button" class="m-button">${icon(I.calendar, 16)} Last 7 days</button>
          ${search('mr-runs-search', 'Filter by id, branch or commit…', '/')}
          <select class="m-select" aria-label="Trigger" style="inline-size: 11rem"><option>All triggers</option><option>Schedule</option><option>Webhook</option><option>Manual</option></select>
          <button type="button" class="m-button"><span class="m-cluster" data-gap="0" aria-hidden="true">${dot('ready')}<span style="margin-inline-start: -4px; display: inline-flex">${dot('error')}</span><span style="margin-inline-start: -4px; display: inline-flex">${dot('building')}</span></span> Status <span class="m-badge" style="block-size: 1.25rem">3 of 5</span> ${icon(I.down, 16)}</button>
        </div>
        <div class="m-table-wrap">
          <table class="m-table">
            <caption class="m-sr-only">Runs of invoice-sync</caption>
            <thead><tr><th scope="col">Run</th><th scope="col">State</th><th scope="col">Source</th><th scope="col" style="text-align: end">Started</th><th scope="col"><span class="m-sr-only">Actions</span></th></tr></thead>
            <tbody>
            ${run('r_c94d2e0', 'Schedule', true, 'error', 'Failed', '1m 12s', 'main', '7a1e94c', 'Retry ledger writes with backoff', '22m ago', 'kai', true)}
            ${run('r_6b0f3a1', 'Webhook', false, 'ready', 'Succeeded', '48s', 'main', '7a1e94c', 'Retry ledger writes with backoff', '1h ago', 'kai')}
            ${run('r_e27c55d', 'Manual', false, 'ready', 'Succeeded', '51s', 'ledger-v2', 'c03d812', 'Write ledger rows in one batch', '3h ago', 'ines')}
            ${run('r_19ad7b4', 'Schedule', false, 'building', 'Running', '2m 05s', 'main', 'f4b9e10', 'Read currency from the tenant', '4h ago', 'mo')}
            ${run('r_a3c8f62', 'Schedule', false, 'canceled', 'Canceled', '—', 'main', 'f4b9e10', 'Read currency from the tenant', 'Yesterday', 'mo')}
            ${run('r_0de4b97', 'Webhook', false, 'queued', 'Queued', '—', 'fix-rounding', '91ce2aa', 'Round half to even on totals', 'Yesterday', 'ines')}
            </tbody>
          </table>
        </div>
        <button type="button" class="m-button" style="inline-size: 100%">Load more</button>

        <section class="m-stack" data-gap="4" aria-labelledby="mr-run-detail" style="padding-block-start: var(--m-space-6); border-block-start: ${hair}">
          <a href="#" class="m-cluster" data-gap="2" style="${small}; ${muted}; text-decoration: none">${icon(I.arrowLeft, 16)} Back to runs</a>
          <div class="m-cluster" data-justify="between">
            <h2 id="mr-run-detail" class="m-cluster" data-gap="3" style="${h2}"><span style="${mono}; font-weight: var(--m-font-weight-medium)">r_c94d2e0</span> <span class="m-badge" data-tone="danger">Failed</span></h2>
            <div class="m-cluster" data-gap="2">
              <button type="button" class="m-button" data-size="sm">${icon(I.copy, 16)} Copy id</button>
              <button type="button" class="m-button" data-size="sm">${icon(I.terminal, 16)} Open in shell</button>
              <button type="button" class="m-button" data-variant="primary" data-size="sm">${icon(I.refresh, 16)} Rerun</button>
            </div>
          </div>
          <div class="m-card" style="padding: 0; gap: 0">
            <div class="m-grid" style="--m-layout-grid-min: 10rem; --m-layout-grid-gap: var(--m-space-6); padding: var(--m-space-6)">
              ${meta('Created', '<span>Nov 11, 14:02</span>')}
              ${meta('State', state('error', 'Failed'))}
              ${meta('Duration', '<span style="font-variant-numeric: tabular-nums">1m 12s (3 attempts)</span>')}
              ${meta('Worker', '<span style="font-family: var(--m-font-family-mono)">fra1 · w-4c2</span>')}
              ${meta('Trigger', 'Schedule <span style="color: var(--m-color-fg-muted)">0 */2 * * *</span>')}
              ${meta('Source', `<span class="m-cluster" data-gap="1">${icon(I.branch, 14)}<span style="font-family: var(--m-font-family-mono)">main</span> · <span style="font-family: var(--m-font-family-mono)">7a1e94c</span></span>`)}
            </div>
            <div class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-6); border-block-start: ${hair}; background: var(--m-color-bg-sunken)">
              <span class="m-cluster" data-gap="2" style="${small}; ${muted}">${icon(I.globe, 14)}<a href="#" style="${mono}; color: var(--m-color-accent-text); text-decoration: none">jobs.kestrel.dev/invoices</a></span>
              <a href="#" class="m-cluster" data-gap="1" style="${small}; color: var(--m-color-accent-text); text-decoration: none">View traces ${icon(I.external, 14)}</a>
            </div>
          </div>
          <div class="m-card" style="padding: 0; gap: 0; overflow: hidden">
            <div class="m-cluster" data-justify="between" style="padding: var(--m-space-2) var(--m-space-2) var(--m-space-2) var(--m-space-4); border-block-end: ${hair}">
              <span style="font-weight: var(--m-font-weight-medium)">Run log <span style="${muted}; font-weight: var(--m-font-weight-regular)">· 9 lines</span></span>
              <div class="m-cluster" data-gap="1"><button type="button" class="m-button" data-variant="ghost" data-size="sm">Errors only</button><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Copy log">${icon(I.copy, 16)}</button></div>
            </div>
            <div style="${mono}; ${small}; line-height: 1.6; padding-block: var(--m-space-2); overflow-x: auto">
              ${log('14:02:11.204', 'info', 'Fetched 1,284 open invoices for 37 tenants')}
              ${log('14:02:11.910', 'info', 'Writing batch 1 of 3 to ledger.kestrel.internal')}
              ${log('14:02:24.372', 'warn', 'Ledger answered 429 after 412 rows; retrying in 2s')}
              ${log('14:02:26.388', 'info', 'Retry 1: writing rows 413–856')}
              ${log('14:02:41.050', 'warn', 'Ledger answered 429 again; retrying in 8s')}
              ${log('14:02:49.067', 'info', 'Retry 2: writing rows 413–856')}
              ${log('14:03:20.114', 'error', 'Ledger did not answer within 30s; 872 rows not written')}
              ${log('14:03:20.118', 'info', 'Rolled back batch 2; batch 1 kept (412 rows)')}
              ${log('14:03:23.441', 'info', 'Exited with code 1 after 1m 12s')}
            </div>
          </div>
        </section>
      </div>
    </main>`,
);

// Onboarding: the source on the left, one configuration card on the right, a full-width action
const onboarding = `<div style="min-block-size: 100vh; background: var(--m-color-bg-sunken)">
  <header class="m-cluster" data-justify="between" style="block-size: 3.5rem; padding-inline: var(--m-space-6); border-block-end: ${hair}; background: var(--m-color-bg-canvas)">
    <span class="m-cluster" data-gap="2" style="font-weight: var(--m-font-weight-semibold)"><span style="${tile}">${icon(I.workflow, 14)}</span> Relayworks</span>
    <span class="m-cluster" data-gap="3" style="${small}; ${muted}">Step 2 of 3 <span class="m-avatar" data-size="sm">NA</span></span>
  </header>
  <main class="m-container" style="padding-block: var(--m-space-12) var(--m-space-16)">
    <div class="m-stack" data-gap="8">
      <div class="m-stack" data-gap="2">
        <a href="#" class="m-cluster" data-gap="2" style="${small}; ${muted}; text-decoration: none">${icon(I.arrowLeft, 16)} Back</a>
        <h1 style="${h1}; font-size: var(--m-font-size-4xl); letter-spacing: -0.05em">Set up your first job</h1>
        <p style="${muted}; font-size: var(--m-font-size-lg)">Point Relayworks at the code, choose when it runs, and it will take the first run for you.</p>
      </div>
      <div class="m-split" style="--m-layout-split-side: 18rem; --m-layout-split-gap: var(--m-space-8); align-items: flex-start">
        <aside class="m-stack" data-gap="6" aria-label="Source">
          <div class="m-stack" data-gap="2">
            <span style="${small}; ${muted}">Importing from</span>
            <span class="m-cluster" data-gap="2" style="font-weight: var(--m-font-weight-medium)">${icon(I.repo, 16)} kestrel/billing</span>
            <span class="m-cluster" data-gap="2" style="${small}; ${muted}">${icon(I.branch, 14)}<span style="${mono}">main</span></span>
          </div>
          <ol class="m-stack" data-gap="3" style="padding: 0; list-style: none; ${small}">
            <li class="m-cluster" data-gap="2" style="${muted}"><span style="color: var(--m-color-success-fg); display: inline-flex">${icon(I.checkCircle, 16)}</span> Connect a repository</li>
            <li class="m-cluster" data-gap="2" style="font-weight: var(--m-font-weight-medium)"><span style="display: inline-flex">${icon(I.info, 16)}</span> Configure the job</li>
            <li class="m-cluster" data-gap="2" style="${muted}"><span style="display: inline-flex">${icon(I.clock, 16)}</span> First run</li>
          </ol>
          <progress class="m-progress" data-size="sm" value="2" max="3" aria-label="Setup progress">2 of 3</progress>
        </aside>
        <form class="m-card" style="padding: 0; gap: 0" aria-labelledby="mr-ob-title">
          <div class="m-stack" data-gap="5" style="padding: var(--m-space-6)">
            <h2 id="mr-ob-title" style="${h2}">Configure job</h2>
            <div class="m-field">
              <label class="m-field-label" for="mr-ob-name">Job name</label>
              <input class="m-input" id="mr-ob-name" value="invoice-sync" aria-describedby="mr-ob-name-h">
              <p class="m-field-hint" id="mr-ob-name-h">Lowercase letters, numbers and dashes. It becomes part of the endpoint.</p>
            </div>
            <div class="m-grid" style="--m-layout-grid-min: 12rem; --m-layout-grid-gap: var(--m-space-4)">
              <div class="m-field">
                <label class="m-field-label" for="mr-ob-runtime">Runtime</label>
                <select class="m-select" id="mr-ob-runtime"><option>Node 22</option><option>Python 3.13</option><option>Go 1.24</option></select>
              </div>
              <div class="m-field">
                <label class="m-field-label" for="mr-ob-region">Region</label>
                <select class="m-select" id="mr-ob-region"><option>Frankfurt (fra1)</option><option>Virginia (iad1)</option><option>Singapore (sin1)</option></select>
              </div>
            </div>
            <div class="m-field">
              <label class="m-field-label" for="mr-ob-root">Root directory</label>
              <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><input class="m-input" id="mr-ob-root" value="./jobs/invoices" style="${mono}"><button type="button" class="m-button">Edit</button></div>
            </div>
            <div class="m-field">
              <label class="m-field-label" for="mr-ob-cron">Schedule</label>
              <input class="m-input" id="mr-ob-cron" value="0 */2 * * *" aria-describedby="mr-ob-cron-h" style="${mono}">
              <p class="m-field-hint" id="mr-ob-cron-h">Every two hours, on the hour, in UTC.</p>
            </div>
            <div class="m-accordion" style="border-block-end: ${hair}">
              <details class="m-accordion-item">
                <summary>Build and run commands</summary>
                <div class="m-accordion-content">Install with <code class="m-code-inline">pnpm install</code> and start with <code class="m-code-inline">pnpm job:invoices</code>.</div>
              </details>
              <details class="m-accordion-item" open>
                <summary>Secrets</summary>
                <div class="m-accordion-content">
                  <div class="m-stack" data-gap="3">
                    <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><input class="m-input" aria-label="Key" value="LEDGER_URL" style="${mono}"><input class="m-input" aria-label="Value" value="https://ledger.kestrel.internal" style="${mono}"><button type="button" class="m-button" data-icon-only aria-label="Remove LEDGER_URL">${icon(I.minus, 16)}</button></div>
                    <div class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><input class="m-input" aria-label="Key" placeholder="EXAMPLE_NAME" style="${mono}"><input class="m-input" aria-label="Value" placeholder="value" style="${mono}"><button type="button" class="m-button" data-icon-only aria-label="Add another">${icon(I.plus, 16)}</button></div>
                    <p style="${small}; ${muted}">Tip: paste a whole <code class="m-code-inline">.env</code> file into the key field.</p>
                  </div>
                </div>
              </details>
            </div>
          </div>
          <div style="padding: var(--m-space-4) var(--m-space-6); border-block-start: ${hair}; background: var(--m-color-bg-sunken); border-end-start-radius: var(--m-radius-container); border-end-end-radius: var(--m-radius-container)">
            <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%">Create job</button>
          </div>
        </form>
      </div>
    </div>
  </main>
</div>`;

// Settings: a plain list of sections beside stacked cards; each card's save sits in its footer
const settingsSection = (
  id: string,
  title: string,
  desc: string,
  control: string,
  footNote: string,
  action: string,
  danger = false,
) => `<section class="m-card" aria-labelledby="${id}" style="padding: 0; gap: 0; overflow: hidden${danger ? '; border-color: var(--m-color-danger-border)' : ''}">
            <div class="m-stack" data-gap="3" style="padding: var(--m-space-6)">
              <h2 id="${id}" style="${h2}">${title}</h2>
              <p style="${muted}">${desc}</p>
              ${control}
            </div>
            <div class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-6); border-block-start: var(--m-border-width-thin) solid ${danger ? 'var(--m-color-danger-border)' : 'var(--m-color-border-default)'}; background: ${danger ? 'var(--m-color-danger-bg)' : 'var(--m-color-bg-sunken)'}">
              <span style="${danger ? 'color: var(--m-color-danger-fg)' : muted}">${footNote}</span>
              ${action}
            </div>
          </section>`;

const settingsNav = ['Workspace', 'Regions', 'Retention', 'Alerts', 'Tokens', 'Single sign-on', 'Data export', 'Audit trail'];

const settings = shell(
  'Settings',
  ['Kestrel Labs', 'Settings'],
  `    <main class="m-container" style="padding-block: var(--m-space-8) var(--m-space-12)">
      <div class="m-stack" data-gap="8">
        <h1 style="${h1}">Settings</h1>
        <div class="m-split" style="--m-layout-split-side: 12rem; --m-layout-split-gap: var(--m-space-8); align-items: flex-start">
          <nav aria-label="Settings" class="m-stack" data-gap="1">
${settingsNav.map((s, i) => `            <a href="#" class="m-button" data-variant="ghost" style="justify-content: flex-start; ${i === 0 ? 'background: var(--m-color-accent-subtle); color: var(--m-color-fg-default)' : muted}"${i === 0 ? ' aria-current="page"' : ''}>${s}</a>`).join('\n')}
          </nav>
          <div class="m-stack" data-gap="6">
          ${settingsSection(
            'mr-set-name',
            'Workspace name',
            'Shown on runs, invoices and the emails Relayworks sends for you.',
            '<input class="m-input" aria-labelledby="mr-set-name" value="Kestrel Labs" style="max-inline-size: 20rem">',
            'Use 32 characters at most.',
            '<button type="button" class="m-button" data-variant="primary" data-size="sm">Save</button>',
          )}
          ${settingsSection(
            'mr-set-url',
            'Workspace URL',
            'The address of this workspace and the prefix of every job endpoint.',
            `<div class="m-cluster" data-gap="0" style="flex-wrap: nowrap; max-inline-size: 26rem"><span style="display: flex; align-items: center; block-size: var(--m-control-height-md); padding-inline: var(--m-space-3); border: var(--m-border-width-thin) solid var(--m-color-border-strong); border-inline-end: 0; border-start-start-radius: var(--m-radius-control); border-end-start-radius: var(--m-radius-control); background: var(--m-color-bg-sunken); ${muted}; ${mono}; ${small}">relayworks.dev/</span><input class="m-input" aria-label="Workspace URL" value="kestrel" style="${mono}; border-start-start-radius: 0; border-end-start-radius: 0"></div>`,
            'Old links redirect for 90 days after a change.',
            '<button type="button" class="m-button" data-variant="primary" data-size="sm" disabled>Save</button>',
          )}
          ${settingsSection(
            'mr-set-region',
            'Default region',
            'New jobs run here unless they choose a region of their own. Pick the one closest to your data.',
            '<select class="m-select" aria-labelledby="mr-set-region" style="max-inline-size: 20rem"><option>Frankfurt, Germany (fra1)</option><option>Virginia, USA (iad1)</option><option>Singapore (sin1)</option></select>',
            'Learn more about <a href="#" style="color: var(--m-color-accent-text); text-decoration: none">regions and latency</a>.',
            '<button type="button" class="m-button" data-variant="primary" data-size="sm" disabled>Save</button>',
          )}
          ${settingsSection(
            'mr-set-alerts',
            'Failure alerts',
            'Who hears about it when a run fails twice in a row.',
            `<div class="m-stack" data-gap="3">
                <label class="m-field" data-layout="inline"><input class="m-switch" type="checkbox" role="switch" checked> Email the job’s owner</label>
                <label class="m-field" data-layout="inline"><input class="m-switch" type="checkbox" role="switch" checked> Post to the team channel</label>
                <label class="m-field" data-layout="inline"><input class="m-switch" type="checkbox" role="switch"> Page whoever is on call</label>
              </div>`,
            'Changes here apply at once.',
            '<a class="m-button" data-size="sm" href="#">Manage channels</a>',
          )}
          ${settingsSection(
            'mr-set-delete',
            'Delete workspace',
            'Permanently delete Kestrel Labs: 14 jobs, their runs, logs and secrets. This can’t be undone.',
            '',
            'Only owners can delete a workspace.',
            '<button type="button" class="m-button" data-variant="danger" data-size="sm">Delete workspace</button>',
            true,
          )}
          </div>
        </div>
      </div>
    </main>`,
);

// Empty state: a bordered icon tile, a 16px title, one sentence, one action and a link
const emptyState = shell(
  'Webhooks',
  ['Kestrel Labs', 'Webhooks'],
  `    <main class="m-container" style="padding-block: var(--m-space-8) var(--m-space-12)">
      <div class="m-stack" data-gap="6">
        <div class="m-cluster" data-justify="between">
          <h1 style="${h1}">Webhooks</h1>
          <button type="button" class="m-button" data-variant="primary">${icon(I.plus, 16)} Add webhook</button>
        </div>
        <div class="m-tabs"><div class="m-tab-list" role="tablist" aria-label="Webhooks">
          <button type="button" class="m-tab" role="tab" aria-selected="true">Incoming</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Outgoing</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1">Delivery log</button>
        </div></div>
        <section class="m-card" aria-labelledby="mr-empty-title" style="align-items: center; text-align: center; padding: var(--m-space-16) var(--m-space-6); gap: var(--m-space-4); border-style: dashed; box-shadow: none">
          <span style="display: grid; place-items: center; inline-size: 3rem; block-size: 3rem; border: ${hair}; border-radius: var(--m-radius-container); background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-sm)">${icon(I.webhook, 20)}</span>
          <div class="m-stack" data-gap="1" style="align-items: center">
            <h2 id="mr-empty-title" style="${h3}">No incoming webhooks yet</h2>
            <p style="${muted}; max-inline-size: 26rem">Give a service a URL to call, and each call starts a run of the job you choose, with its body as the input.</p>
          </div>
          <div class="m-cluster" data-gap="3" data-justify="center">
            <button type="button" class="m-button">${icon(I.plus, 16)} Add webhook</button>
            <a href="#" class="m-cluster" data-gap="1" style="${muted}; text-decoration: none">Read the guide ${icon(I.arrowRight, 14)}</a>
          </div>
        </section>
        <div class="m-alert" role="note">
          <span class="m-alert-icon">${icon(I.info, 16)}</span>
          <div class="m-alert-content"><div class="m-alert-body">Signing secrets are made for each webhook and shown once. Keep them in <a href="#" style="color: var(--m-color-accent-text); text-decoration: none">Secrets</a>.</div></div>
        </div>
      </div>
    </main>`,
);

// Pricing: one hairline frame split into three columns, the middle on background-100; pill CTAs
const feature = (ic: keyof typeof I, text: string) =>
  `<li class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span style="${muted}; display: inline-flex">${icon(I[ic], 16)}</span>${text}</li>`;
const plan = (
  name: string,
  badge: string,
  price: string,
  unit: string,
  pitch: string,
  lead: string,
  features: string[],
  cta: string,
  primary: boolean,
) => `<div class="m-stack" data-gap="5" style="padding: var(--m-space-8); ${primary ? 'background: var(--m-color-bg-canvas)' : ''}">
              <div class="m-stack" data-gap="3">
                <span class="m-cluster" data-gap="2" style="${small}; font-weight: var(--m-font-weight-medium)">${name}${badge ? ` <span class="m-badge" style="block-size: 1.25rem; font-size: 11px">${badge}</span>` : ''}</span>
                <span class="m-cluster" data-gap="2" data-align="baseline"><span style="font-size: 3.5rem; font-weight: var(--m-font-weight-medium); letter-spacing: -0.06em; line-height: 1">${price}</span><span style="${small}; ${muted}">${unit}</span></span>
                <p style="${muted}; max-inline-size: 18rem">${pitch}</p>
              </div>
              <hr class="m-divider">
              <div class="m-stack" data-gap="3">
                <span style="${small}; ${muted}">${lead}</span>
                <ul class="m-stack" data-gap="3" style="padding: 0; list-style: none">
                  ${features.join('\n                  ')}
                </ul>
              </div>
              <a class="m-button"${primary ? ' data-variant="primary"' : ''} href="#" style="align-self: flex-start; border-radius: var(--m-radius-full); margin-block-start: auto">${cta}</a>
            </div>`;
const yes = `<span style="display: inline-flex" role="img" aria-label="Included">${icon(I.check, 16)}</span>`;
const no = `<span style="color: var(--m-color-fg-subtle)" aria-label="Not included">—</span>`;
const cmp = (name: string, a: string, b: string, c: string) =>
  `<tr><th scope="row" style="font-weight: var(--m-font-weight-regular)">${name}</th><td style="text-align: center">${a}</td><td style="text-align: center">${b}</td><td style="text-align: center">${c}</td></tr>`;

const pricing = `<div style="min-block-size: 100vh; background: var(--m-color-bg-sunken)">
  <header class="m-navbar">
    <a class="m-navbar-brand" href="#"><span style="${tile}">${icon(I.workflow, 14)}</span> Relayworks</a>
    <nav class="m-navbar-nav" aria-label="Main">
      <a class="m-navbar-link" href="#">Platform</a>
      <a class="m-navbar-link" href="#">Guides</a>
      <a class="m-navbar-link" href="#">Customers</a>
      <a class="m-navbar-link" href="#" aria-current="page">Pricing</a>
    </nav>
    <div class="m-navbar-actions">
      <a class="m-button" data-size="sm" href="#">Talk to us</a>
      <a class="m-button" data-size="sm" href="#">Log in</a>
      <a class="m-button" data-variant="primary" data-size="sm" href="#">Start free</a>
    </div>
  </header>
  <main class="m-container" style="padding-block: var(--m-space-16)">
    <div class="m-stack" data-gap="10">
      <div class="m-cluster" data-justify="between" data-align="end">
        <h1 style="font-size: 4rem; font-weight: var(--m-font-weight-medium); letter-spacing: -0.06em; line-height: 1; max-inline-size: 40rem">Pricing that grows<br>with your queue</h1>
        <div class="m-tabs" data-variant="pill" style="padding: 3px; border: ${hair}; border-radius: var(--m-radius-full); background: var(--m-color-bg-canvas)"><div class="m-tab-list" role="tablist" aria-label="Billing period">
          <button type="button" class="m-tab" role="tab" aria-selected="true" style="border-radius: var(--m-radius-full)">Monthly</button>
          <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1" style="border-radius: var(--m-radius-full)">Yearly <span class="m-badge" data-tone="info" style="block-size: 1.25rem">−15%</span></button>
        </div></div>
      </div>
      <section aria-label="Plans" style="border: ${hair}; border-radius: 2px; overflow: hidden">
        <div class="m-grid" style="--m-layout-grid-min: 18rem; --m-layout-grid-gap: 1px; background: var(--m-color-border-default)">
          <div style="background: var(--m-color-bg-sunken); display: flex">${plan('Solo', '', '$0', '/mo.', 'For one person trying an idea or running a side project.', 'Included:', [feature('box', '5 jobs, 10K runs a month'), feature('clock', 'Schedules down to every 5 minutes'), feature('history', 'Logs kept for 1 day'), feature('globe', 'One region')], 'Start running', false)}</div>
          <div style="background: var(--m-color-bg-canvas); display: flex">${plan('Crew', 'Best for teams', '$24', '/seat a month', 'For teams with jobs in production and someone on call.', 'Everything in Solo, plus:', [feature('zap', '$30 of runs included, then by the run'), feature('clock', 'Schedules down to every minute'), feature('history', 'Logs kept for 30 days'), feature('globe', 'Every region, failover between them'), feature('bell', 'Failure alerts to email and chat')], 'Start a 14-day trial', true)}</div>
          <div style="background: var(--m-color-bg-sunken); display: flex">${plan('Fleet', '', 'Let’s talk', '', 'For companies with compliance needs and thousands of jobs.', 'Everything in Crew, plus:', [feature('shield', 'Single sign-on and audit trail'), feature('server', 'Dedicated workers'), feature('history', 'Logs kept for a year'), feature('headset', 'A named engineer, 1-hour response')], 'Contact sales', false)}</div>
        </div>
      </section>
      <p style="${small}; ${muted}; text-align: center">Usage past what a plan includes is billed at $0.40 per thousand runs.</p>
      <section class="m-stack" data-gap="4" aria-labelledby="mr-compare">
        <h2 id="mr-compare" style="${h2}">Compare plans</h2>
        <div class="m-table-wrap">
          <table class="m-table">
            <thead><tr><th scope="col">Feature</th><th scope="col" style="text-align: center">Solo</th><th scope="col" style="text-align: center">Crew</th><th scope="col" style="text-align: center">Fleet</th></tr></thead>
            <tbody>
              ${cmp('Concurrent runs', '2', '50', 'Custom')}
              ${cmp('Retries with backoff', yes, yes, yes)}
              ${cmp('Run history', '1 day', '30 days', '1 year')}
              ${cmp('Regional failover', no, yes, yes)}
              ${cmp('Single sign-on', no, no, yes)}
            </tbody>
          </table>
        </div>
      </section>
      <section class="m-stack" data-gap="4" aria-labelledby="mr-faq">
        <h2 id="mr-faq" style="${h2}">Questions</h2>
        <div class="m-accordion" style="border-block-end: ${hair}">
          <details class="m-accordion-item" open><summary>What counts as a run?</summary><div class="m-accordion-content">One start of a job, whatever started it. Retries of the same run are free.</div></details>
          <details class="m-accordion-item"><summary>Can I cap what I spend?</summary><div class="m-accordion-content">Yes. Set a monthly limit in Billing; jobs pause when you reach it and we email the owners.</div></details>
          <details class="m-accordion-item"><summary>Do seats include viewers?</summary><div class="m-accordion-content">Viewers are free. Seats are only for people who can change jobs or secrets.</div></details>
        </div>
      </section>
    </div>
  </main>
</div>`;

// Errors: red text under the field, a red note above the form, a toast, and full pages with a request id
const errorPage = (code: string, name: string, ic: string, title: string, body: string, actions: string) =>
  `<section class="m-card" aria-labelledby="mr-err-${code}" style="align-items: center; text-align: center; padding: var(--m-space-12) var(--m-space-6); gap: var(--m-space-4)">
      <span style="color: var(--m-color-fg-subtle)">${icon(ic, 40)}</span>
      <span style="${mono}; ${small}; ${muted}">${code} · ${name}</span>
      <h2 id="mr-err-${code}" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-tight)">${title}</h2>
      <p style="${muted}; max-inline-size: 28rem">${body}</p>
      <div class="m-cluster" data-gap="2" data-justify="center">${actions}</div>
      <span class="m-cluster" data-gap="2" style="${small}; ${muted}">Request <span style="${mono}">fra1:q7x2c-1731420931-8e0b</span> <button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Copy request id">${icon(I.copy, 14)}</button></span>
    </section>`;

const fieldError = (id: string, text: string) =>
  `<p class="m-field-error m-cluster" data-gap="1" id="${id}" style="flex-wrap: nowrap">${icon(I.alert, 14)} ${text}</p>`;

const errors = `<main class="m-container" data-size="md" style="padding-block: var(--m-space-12)">
  <div class="m-stack" data-gap="10">
    <form class="m-card" style="padding: 0; gap: 0; overflow: hidden" aria-labelledby="mr-err-form">
      <div class="m-stack" data-gap="5" style="padding: var(--m-space-6)">
        <h1 id="mr-err-form" style="${h2}">Add a secret</h1>
        <div class="m-alert" data-tone="danger" role="alert">
          <span class="m-alert-icon">${icon(I.alert, 16)}</span>
          <div class="m-alert-content"><div class="m-alert-body"><strong style="font-weight: var(--m-font-weight-medium)">2 fields need fixing.</strong> Nothing was saved.</div></div>
        </div>
        <div class="m-field">
          <label class="m-field-label" for="mr-err-key">Key</label>
          <input class="m-input" id="mr-err-key" value="ledger-url" aria-invalid="true" aria-describedby="mr-err-key-e" style="${mono}">
          ${fieldError('mr-err-key-e', 'Use capital letters, digits and underscores, like LEDGER_URL.')}
        </div>
        <div class="m-field">
          <label class="m-field-label" for="mr-err-value">Value</label>
          <textarea class="m-input" id="mr-err-value" rows="2" aria-invalid="true" aria-describedby="mr-err-value-e" style="${mono}"></textarea>
          ${fieldError('mr-err-value-e', 'Enter a value. Secrets can’t be empty.')}
        </div>
        <fieldset class="m-stack" data-gap="2" style="border: 0; padding: 0; margin: 0">
          <legend class="m-field-label" style="margin-block-end: var(--m-space-2)">Available to</legend>
          <label class="m-field" data-layout="inline"><input class="m-checkbox" type="checkbox" checked> Production</label>
          <label class="m-field" data-layout="inline"><input class="m-checkbox" type="checkbox" checked> Staging</label>
          <label class="m-field" data-layout="inline"><input class="m-checkbox" type="checkbox"> Local runs</label>
        </fieldset>
      </div>
      <div class="m-cluster" data-justify="end" data-gap="2" style="padding: var(--m-space-3) var(--m-space-6); border-block-start: ${hair}; background: var(--m-color-bg-sunken)">
        <button type="button" class="m-button" data-size="sm">Cancel</button>
        <button type="submit" class="m-button" data-variant="primary" data-size="sm" aria-busy="true">Save secret</button>
      </div>
    </form>
    <section class="m-stack" data-gap="3" aria-label="A toast">
      <div class="m-toast" data-tone="danger" role="alert"><div class="m-toast-content"><div class="m-toast-title">invoice-sync failed twice in a row</div><div class="m-toast-body">The ledger didn’t answer within 30s. 872 rows weren’t written.</div></div><div class="m-toast-actions"><button type="button" class="m-button" data-size="sm">View run</button></div></div>
    </section>
${errorPage('404', 'NOT_FOUND', I.compass, 'This page can’t be found', 'The job may have been renamed or deleted, or the link is missing a part.', `<a class="m-button" data-variant="primary" href="#">Go to Activity</a>`)}
${errorPage('500', 'INTERNAL_ERROR', I.alert, 'Something went wrong on our side', 'Nothing was changed. Try again in a minute; if it keeps failing, send us the request id below.', `<button type="button" class="m-button" data-variant="primary">${icon(I.refresh, 16)} Try again</button><a class="m-button" href="#">Check status</a>`)}
${errorPage('403', 'FORBIDDEN', I.lock, 'You don’t have access to this job', 'Only members of the Billing team can see invoice-sync. Ask an owner of Kestrel Labs to add you.', `<button type="button" class="m-button" data-variant="primary">Request access</button><a class="m-button" href="#">Switch workspace</a>`)}
  </div>
</main>`;

export const meridianRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'A toolbar of search, filter, a view switch and the primary action; usage gauges and recent runs on the left, job cards with status dots on the right.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'A framed list of runs with ids in mono, a status dot beside each state, branch and commit; a run opens to a details card and a monospace log.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'The source and the steps on the left, one configuration card on the right with collapsible sections, and one full-width action in a background-200 footer.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A plain list of sections beside stacked cards; each card has a 20px title, a sentence and its control, with the save in a background-200 footer. Deleting is a red-bordered card.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description: 'A dashed hairline frame, a bordered icon tile, a 16px title, one sentence, one action and a link.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'One hairline frame split into three columns, the middle one lifted to background-100, large tight prices, icon feature lists and pill actions, then a comparison table and questions.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Red text with an icon under the field, a red note above the form that says nothing was saved, a toast, and full pages for 404, 500 and no access with a request id in mono.',
    html: errors,
  },
];
