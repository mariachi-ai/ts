import type { ArchetypeRecipe } from '../types';

/*
 * Cirrus's seven layout recipes: framework-free HTML using only @mariachi/design classes and tokens
 * (no colour literals), with invented data from a household money app ("Kestrel"). They follow the
 * language's real screen patterns: a white 256px sidebar with grey icons and a pale-blue current
 * row, account groups with coloured dots, a white header bar over an off-white canvas, white 20px
 * panels with a hairline, lists grouped under muted date lines, tinted capital category pills with
 * an emoji, a small raised currency sign, budget bars that turn amber then red, and one blue button.
 */

// Lucide icons, outlined, 1.75 on the 24px grid (about 1.2px at 16px)
const icon = (paths: string, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none">${paths}</svg>`;
const I = {
  overview: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  activity:
    '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
  budgets:
    '<path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"/><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  growth: '<path d="M5 21v-6"/><path d="M12 21V3"/><path d="M19 21V9"/>',
  bills:
    '<path d="m2 9 3-3 3 3"/><path d="M13 18H7a2 2 0 0 1-2-2V6"/><path d="m22 15-3 3-3-3"/><path d="M11 6h6a2 2 0 0 1 2 2v10"/>',
  goal: '<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/>',
  guide:
    '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  help: '<path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1"/>',
  panel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
  panelRight: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  download: '<path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  filter: '<path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/>',
  calendar:
    '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  up: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  split: '<path d="M5 12h14"/><circle cx="12" cy="6" r="1"/><circle cx="12" cy="18" r="1"/>',
  bank: '<path d="M10 18v-7"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/><path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z"/>',
  wallet:
    '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  warn: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  searchX:
    '<path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  sparkles:
    '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
};

// Shared inline treatments (tokens only)
const num = 'font-variant-numeric: tabular-nums';
const muted = 'color: var(--m-color-fg-muted)';
const hair = 'border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)';
const sectionTitle = 'font-size: var(--m-font-size-lg); font-weight: var(--m-font-weight-medium)';
const link = `display: inline-flex; align-items: center; gap: var(--m-space-1); ${muted}; text-decoration: none; font-size: var(--m-font-size-md)`;
const figure = `font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-tight); ${num}`;

// A money figure with the currency sign small and raised: $1,486
const usd = (v: string, sign = '') =>
  `${sign}<span style="font-size: 0.62em; vertical-align: 0.42em; margin-inline-end: 0.04em">$</span>${v}`;
// A coloured dot (accounts, unreviewed rows, tags)
const dot = (tone: string, size = '0.5rem') =>
  `<span aria-hidden="true" style="flex: none; inline-size: ${size}; block-size: ${size}; border-radius: var(--m-radius-full); background: var(--m-color-${tone})"></span>`;
// A category pill: a soft tint, capitals, an emoji first
const pill = (tone: string, emoji: string, label: string) =>
  `<span class="m-badge"${tone ? ` data-tone="${tone}"` : ''}><span aria-hidden="true" style="font-size: 1.1em">${emoji}</span>${label}</span>`;
// A white chip with a hairline: tag counts and the like
const chip = (inner: string) =>
  `<span class="m-badge" style="background: var(--m-color-bg-surface); box-shadow: inset 0 0 0 var(--m-border-width-thin) var(--m-color-border-default); color: var(--m-color-fg-default); text-transform: none; letter-spacing: 0; font-size: var(--m-font-size-sm); font-weight: var(--m-font-weight-medium)">${inner}</span>`;
// A small disclosure triangle in a group's colour
const tri = (tone: string, open = true) =>
  `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" style="flex: none; fill: var(--m-color-${tone}); transform: rotate(${open ? '0' : '-90'}deg)"><path d="M1 2.5h8L5 8z"/></svg>`;
const viewAll = (label: string) => `<a href="#" style="${link}">${label} ${icon(I.right, 14)}</a>`;
const iconButton = (paths: string, label: string, variant = 'ghost') =>
  `<button type="button" class="m-button" data-variant="${variant}" data-size="sm" data-icon-only aria-label="${label}">${icon(paths)}</button>`;

// The app shell: a white sidebar (nav, accounts by group, help), a white header bar, the off-white canvas
const navLink = (ic: string, label: string, current: string, extra = '') =>
  `        <li><a class="m-sidebar-link" href="#"${label === current ? ' aria-current="page"' : ''}>${icon(ic, 18)} ${label}${extra}</a></li>`;
const acct = (tone: string, name: string, amount: string) =>
  `          <li><a class="m-sidebar-link" href="#" style="color: var(--m-color-fg-default)">${dot(tone)}<span style="flex: 1; min-inline-size: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">${name}</span><span style="${muted}; font-size: var(--m-font-size-md); ${num}">${usd(amount)}</span></a></li>`;
const group = (name: string, rows: string) => `      <div class="m-sidebar-section">
        <h2 class="m-sidebar-heading m-cluster" data-gap="2">${tri('fg-subtle')} ${name}</h2>
        <ul>
${rows}
        </ul>
      </div>`;

const shell = (current: string, header: string, main: string, mainStyle = 'padding: var(--m-space-8)') => `<div class="m-split" style="--m-layout-split-side: 16rem; --m-layout-split-gap: 0; min-block-size: 100vh; background: var(--m-color-bg-canvas)">
  <nav class="m-sidebar" aria-label="Main">
    <div class="m-cluster" data-justify="between">
      ${iconButton(I.panel, 'Collapse the sidebar', 'secondary')}
      ${iconButton(I.refresh, 'Sync accounts')}
    </div>
    <div class="m-sidebar-section">
      <ul>
${navLink(I.overview, 'Overview', current)}
${navLink(I.activity, 'Activity', current, ' <span class="m-sidebar-count" style="color: inherit">6</span>')}
${navLink(I.budgets, 'Budgets', current)}
${navLink(I.card, 'Accounts', current)}
${navLink(I.growth, 'Portfolio', current)}
${navLink(I.bills, 'Bills', current)}
${navLink(I.goal, 'Goals', current)}
      </ul>
    </div>
    <div class="m-stack" data-gap="4" style="${hair}; padding-block-start: var(--m-space-5)">
${group(
  'Cards',
  [acct('accent-default', 'Everyday Visa', '1,208'), acct('danger-solid', 'Travel Rewards', '642')].join('\n'),
)}
${group(
  'Cash',
  [acct('success-solid', 'Joint checking', '8,315'), acct('success-solid', 'Rainy day fund', '14,900')].join('\n'),
)}
${group(
  'Investing',
  [acct('info-solid', 'Retirement 401(k)', '41,770'), acct('warning-solid', 'Brokerage', '6,092')].join('\n'),
)}
    </div>
    <div class="m-sidebar-section" style="${hair}; padding-block-start: var(--m-space-4); margin-block-start: auto">
      <ul>
        <li><a class="m-sidebar-link" href="#">${icon(I.help, 18)} Help center</a></li>
        <li><a class="m-sidebar-link" href="#"${current === 'Settings' ? ' aria-current="page"' : ''}>${icon(I.gear, 18)} Settings</a></li>
        <li><a class="m-sidebar-link" href="#" style="color: var(--m-color-warning-fg)">${icon(I.guide, 18)} Finish setup <span class="m-sidebar-count" style="color: inherit">2 left</span></a></li>
      </ul>
    </div>
  </nav>
  <div class="m-stack" data-gap="0">
    <header class="m-cluster" data-justify="between" style="min-block-size: 3.5rem; padding-inline: var(--m-space-8); background: var(--m-color-bg-surface); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
${header}
    </header>
    <main style="${mainStyle}">
${main}
    </main>
  </div>
</div>`;

const pageTitle = (t: string) => `      <h1 style="${sectionTitle}">${t}</h1>`;

// ── Dashboard ────────────────────────────────────────────────────────────────────────────────────
// This month's spending against the planned pace: a line that warms from red to green, a dashed pace line
const spend = [6, 30, 31, 33, 36, 41, 44, 45, 52, 55, 57, 60];
const spendLine = spend.map((v, i) => `${i === 0 ? 'M' : 'L'}${i * 36},${170 - v * 2.2}`).join(' ');
const spendChart = `<div style="position: relative">
              <svg viewBox="0 0 600 180" width="100%" preserveAspectRatio="none" style="display: block; block-size: 11rem; overflow: visible" role="img" aria-label="Spending so far this month, $212 below the planned pace">
                <defs><linearGradient id="ci-pace" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color: var(--m-color-danger-solid)"/><stop offset="0.35" style="stop-color: var(--m-color-warning-solid)"/><stop offset="1" style="stop-color: var(--m-color-success-solid)"/></linearGradient></defs>
                <path d="M0,170 L600,30" fill="none" style="stroke: var(--m-color-border-strong)" stroke-width="1" stroke-dasharray="4 5" vector-effect="non-scaling-stroke"/>
                <path d="${spendLine}" fill="none" stroke="url(#ci-pace)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
                <circle cx="396" cy="${170 - 60 * 2.2}" r="5" style="fill: var(--m-color-bg-surface); stroke: var(--m-color-success-solid)" stroke-width="2.5"/>
              </svg>
              <span class="m-badge" data-tone="success" data-variant="solid" style="position: absolute; inset-inline-start: 63%; inset-block-start: 4%; border-radius: var(--m-radius-sm); text-transform: none; letter-spacing: 0; font-size: var(--m-font-size-sm); ${num}">${usd('212')} below pace</span>
            </div>`;

const worth = [40, 41, 40, 42, 42, 41, 43, 44, 44, 46, 45, 47, 49, 48, 50, 53, 52, 55, 58, 57, 60];
const worthLine = worth.map((v, i) => `${i === 0 ? 'M' : 'L'}${i * 30},${150 - (v - 38) * 5.6}`).join(' ');
const worthChart = `<svg viewBox="0 0 600 150" width="100%" preserveAspectRatio="none" style="display: block; block-size: 9rem" role="img" aria-label="Net worth over the month, up 4.2%">
              <defs><linearGradient id="ci-worth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: var(--m-color-success-solid); stop-opacity: 0.18"/><stop offset="1" style="stop-color: var(--m-color-success-solid); stop-opacity: 0"/></linearGradient></defs>
              <path d="${worthLine} L600,150 L0,150 Z" fill="url(#ci-worth)"/>
              <path d="${worthLine}" fill="none" style="stroke: var(--m-color-success-solid)" stroke-width="2.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
            </svg>`;
const ranges = (sel: string) => `<div class="m-tabs" data-variant="pill" style="align-items: center"><div class="m-tab-list" role="tablist" aria-label="Range" style="background: transparent">
${['1W', '1M', '3M', 'YTD', '1Y', 'ALL'].map((r) => `                <button type="button" class="m-tab" role="tab" aria-selected="${r === sel}"${r === sel ? ' style="background: var(--m-color-border-muted); box-shadow: none"' : ' tabindex="-1"'}>${r}</button>`).join('\n')}
              </div></div>`;

const reviewRow = (who: string, tags: string, cat: string, amount: string) =>
  `              <li class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding-block: var(--m-space-2)"><input class="m-checkbox" type="checkbox" aria-label="Mark ${who} reviewed"><span style="flex: 1; min-inline-size: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">${who}</span>${tags}${cat}<span style="${num}; min-inline-size: 4.5rem; text-align: end; font-weight: var(--m-font-weight-medium)">${usd(amount)}</span>${dot('accent-default', '0.375rem')}</li>`;
const dateLine = (d: string) =>
  `              <li style="${muted}; font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-medium); padding-block: var(--m-space-3) var(--m-space-1)">${d}</li>`;

const catRow = (tone: string, lead: string, name: string, spent: string, value: number, budget: string) =>
  `              <li style="display: grid; grid-template-columns: 1rem 1.5rem minmax(0, 1fr) auto minmax(2.5rem, 8rem) auto; align-items: center; gap: var(--m-space-3); padding-block: var(--m-space-2)">${tri(tone)}${lead}<span style="min-inline-size: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">${name}</span><span style="text-align: end; font-weight: var(--m-font-weight-medium); ${num}">${usd(spent)}</span><progress class="m-progress" value="${Math.min(value, 100)}" max="100" aria-label="${name}: ${value}% of budget" style="--m-progress-fill: var(--m-color-${value > 100 ? 'danger' : value > 85 ? 'warning' : 'success'}-solid)">${value}%</progress><span style="text-align: end; font-weight: var(--m-font-weight-medium); ${num}">${usd(budget)}</span></li>`;
const countChip = (tone: string, n: string) =>
  `<span class="m-badge" data-tone="${tone}" style="justify-content: center; padding-inline: 0; inline-size: 1.5rem; border-radius: var(--m-radius-sm); font-size: var(--m-font-size-sm)">${n}</span>`;

const upcoming = (when: string, emoji: string, who: string, cat: string, amount: string) =>
  `              <li style="display: grid; grid-template-columns: auto 1.25rem minmax(0, 1fr) auto auto; align-items: center; gap: var(--m-space-3); padding-block: var(--m-space-2)"><span style="${muted}; min-inline-size: 3.25rem">${when}</span><span aria-hidden="true">${emoji}</span><span style="min-inline-size: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">${who}</span>${cat}<span style="text-align: end; font-weight: var(--m-font-weight-medium); ${num}">${usd(amount)}</span></li>`;

const card = (title: string, action: string, body: string, id: string) => `        <section class="m-card" aria-labelledby="${id}">
          <div class="m-cluster" data-justify="between"><h2 id="${id}" class="m-card-title">${title}</h2>${action}</div>
${body}
        </section>`;

const dashboard = shell(
  'Overview',
  `${pageTitle('Overview')}
      <div class="m-cluster" data-gap="1">${iconButton(I.search, 'Search')}${iconButton(I.plus, 'Add a transaction')}</div>`,
  `      <div class="m-stack" data-gap="6">
      <div class="m-grid" style="--m-layout-grid-min: 24rem; --m-layout-grid-gap: var(--m-space-6)">
${card(
  'Spending this month',
  viewAll('Activity'),
  `          <div class="m-stack" data-gap="1" data-align="center" style="text-align: center; padding-block-start: var(--m-space-2)">
            <span style="${figure}">${usd('1,486')} left</span>
            <span style="${muted}; font-size: var(--m-font-size-lg); ${num}">${usd('4,200')} planned</span>
          </div>
          ${spendChart}`,
  'ci-spend',
)}
${card(
  'Net worth',
  viewAll('Accounts'),
  `          <div class="m-stack" data-gap="1" data-align="center" style="text-align: center">
            <span style="${muted}; font-size: var(--m-font-size-lg)">All accounts</span>
            <span style="${figure}">${usd('62,415')}</span>
            <span class="m-badge" data-tone="success" style="text-transform: none; letter-spacing: 0; font-size: var(--m-font-size-sm)">${icon(I.up, 12)} 4.2%</span>
          </div>
          ${worthChart}
          ${ranges('1M')}`,
  'ci-worth-t',
)}
      </div>
      <div class="m-grid" style="--m-layout-grid-min: 24rem; --m-layout-grid-gap: var(--m-space-6); align-items: start">
${card(
  'Needs a look',
  viewAll('See all'),
  `          <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
${dateLine('Today')}
${reviewRow('Halfmoon Coffee', '', pill('warning', '☕', 'Coffee'), '6.40')}
${reviewRow('Juniper Market', chip(`${dot('success-solid', '0.375rem')}1`), pill('success', '🥦', 'Groceries'), '83.17')}
${dateLine('Tuesday, April 14')}
${reviewRow('Northside Climbing', '', pill('info', '🧗', 'Fitness'), '58.00')}
          </ul>
          <div class="m-cluster" data-justify="between" style="${hair}; margin-inline: calc(var(--m-space-6) * -1); padding: var(--m-space-4) var(--m-space-6) 0">
            <span class="m-cluster" data-gap="2" style="${muted}; ${num}">1 – 3 of 3 ${iconButton(I.left, 'Previous page')}${iconButton(I.right, 'Next page')}</span>
            <button type="button" class="m-button" data-size="sm">${icon(I.check)} Review all 3</button>
          </div>`,
  'ci-review',
)}
${card(
  'Top categories',
  viewAll('See all'),
  `          <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
${catRow('accent-default', countChip('info', '3'), 'Home', '1,772', 92, '1,930')}
${catRow('accent-default', '<span aria-hidden="true">🎟️</span>', 'Going out', '148', 74, '200')}
${catRow('success-solid', countChip('success', '2'), 'Food', '509', 64, '800')}
${catRow('danger-solid', '<span aria-hidden="true">🧘</span>', 'Wellness', '237', 118, '200')}
${catRow('warning-solid', countChip('warning', '2'), 'Transport', '131', 52, '250')}
          </ul>`,
  'ci-cats',
)}
${card(
  'Coming up',
  viewAll('Bills'),
  `          <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
${upcoming('Today', '💡', 'Riverbend Power', pill('info', '🔌', 'Utilities'), '74.20')}
${upcoming('Apr 19', '📺', 'Streamline TV', pill('accent', '🍿', 'Streaming'), '15.99')}
${upcoming('Apr 22', '🏠', 'Maple Court rent', pill('', '🔑', 'Rent'), '1,480.00')}
          </ul>`,
  'ci-next',
)}
      </div>
      </div>`,
);

// ── List and detail ──────────────────────────────────────────────────────────────────────────────
const tx = (
  who: string,
  acctName: string,
  cat: string,
  amount: string,
  opts: { selected?: boolean; tag?: string; income?: boolean; unreviewed?: boolean } = {},
) =>
  `            <li class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding: var(--m-space-2) var(--m-space-8)${opts.selected ? '; background: var(--m-color-accent-subtle); box-shadow: inset var(--m-border-width-thick) 0 0 var(--m-color-accent-default)' : ''}"><input class="m-checkbox" type="checkbox" aria-label="Select ${who}"${opts.selected ? ' checked' : ''}><span style="flex: 1; min-inline-size: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">${who} <span style="color: var(--m-color-fg-subtle)">${acctName}</span></span>${opts.tag ?? ''}${cat}<span style="${num}; min-inline-size: 5rem; text-align: end; font-weight: var(--m-font-weight-medium)${opts.income ? '; color: var(--m-color-success-fg)' : ''}">${usd(amount)}</span><span style="inline-size: 0.375rem; display: inline-flex">${opts.unreviewed ? dot('accent-default', '0.375rem') : ''}</span></li>`;
const txDate = (d: string) =>
  `            <li style="${muted}; font-size: var(--m-font-size-md); font-weight: var(--m-font-weight-medium); padding: var(--m-space-4) var(--m-space-8) var(--m-space-1)">${d}</li>`;
const detailRow = (label: string, value: string) =>
  `            <div class="m-cluster" data-gap="6" style="flex-wrap: nowrap"><dt style="${muted}; inline-size: 7rem; flex: none">${label}</dt><dd class="m-cluster" data-gap="2">${value}</dd></div>`;

const listDetail = shell(
  'Activity',
  `      <h1 class="m-cluster" data-gap="2" style="${sectionTitle}"><span style="color: var(--m-color-accent-default); display: inline-flex">${icon(I.activity, 18)}</span>Activity</h1>
      <div class="m-cluster" data-gap="2">
        ${iconButton(I.plus, 'Add a transaction')}${iconButton(I.download, 'Export')}
        <input class="m-input" data-size="sm" type="search" placeholder="Search" aria-label="Search activity" style="inline-size: 15rem; border-color: var(--m-color-border-default)">
      </div>`,
  `      <div class="m-cluster" data-gap="0" style="flex: 1; align-items: stretch">
        <section style="flex: 999 1 30rem; min-inline-size: 0; position: relative; padding-block-end: var(--m-space-16)" aria-labelledby="ci-month">
          <div class="m-cluster" data-gap="2" style="padding: var(--m-space-3) var(--m-space-8); background: var(--m-color-bg-surface); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
            ${chip(`${icon(I.calendar, 14)} This month <span aria-label="Remove filter" style="display: inline-flex; ${muted}">${icon(I.x, 14)}</span>`)}
            <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="${muted}">${icon(I.plus, 14)} More filters</button>
          </div>
          <div class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-8); background: var(--m-color-bg-surface); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default); ${num}">
            <span style="font-weight: var(--m-font-weight-medium)">24 transactions</span>
            <span class="m-cluster" data-gap="5"><span><span style="${muted}">Out</span> ${usd('1,318.62')}</span><span><span style="${muted}">In</span> ${usd('3,400.00')}</span><span><span style="${muted}">Net</span> <span style="color: var(--m-color-success-fg)">${usd('2,081.38')}</span></span></span>
          </div>
          <div class="m-cluster" data-justify="between" style="padding: var(--m-space-8) var(--m-space-8) var(--m-space-1)">
            <h2 id="ci-month" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-medium)">April 2026</h2>
            <span style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-medium); ${num}">${usd('1,318.62')}</span>
          </div>
          <ul class="m-stack" data-gap="0" style="padding: 0; list-style: none">
${txDate('Today')}
${tx('Parcel &amp; Pine', 'Everyday Visa 4410', pill('accent', '🛍️', 'Shopping'), '64.25', { selected: true, tag: chip(`${dot('danger-solid', '0.375rem')}1`), unreviewed: true })}
${tx('Halfmoon Coffee', 'Everyday Visa 4410', pill('warning', '☕', 'Coffee'), '6.40', { unreviewed: true })}
${txDate('Yesterday')}
${tx('Metro Transit', 'Travel Rewards 0287', pill('info', '🚌', 'Transit'), '2.90', { selected: true })}
${tx('Juniper Market', 'Joint checking 7702', pill('success', '🥦', 'Groceries'), '83.17', { selected: true, tag: chip(`${dot('success-solid', '0.375rem')}1`) })}
${txDate('Monday, April 13')}
${tx('Payroll deposit', 'Joint checking 7702', pill('success', '💰', 'Paycheck'), '3,400.00', { income: true })}
${tx('Corner Pharmacy', 'Everyday Visa 4410', pill('danger', '💊', 'Pharmacy'), '18.75')}
${txDate('Saturday, April 11')}
${tx('Northside Climbing', 'Travel Rewards 0287', pill('info', '🧗', 'Fitness'), '58.00')}
${tx('Lantern Noodle Bar', 'Everyday Visa 4410', pill('warning', '🍜', 'Dining out'), '41.30')}
${tx('Streamline TV', 'Travel Rewards 0287', pill('accent', '🍿', 'Streaming'), '15.99')}
          </ul>
          <div class="m-cluster" data-gap="2" role="toolbar" aria-label="Selected transactions" style="position: absolute; inset-block-end: var(--m-space-4); inset-inline: 0; margin-inline: auto; inline-size: max-content; max-inline-size: calc(100% - var(--m-space-8)); padding: var(--m-space-2); background: var(--m-color-bg-raised); border: var(--m-border-width-thin) solid var(--m-color-border-default); border-radius: var(--m-radius-lg); box-shadow: var(--m-shadow-lg)">
            ${iconButton(I.x, 'Clear the selection')}<span style="padding-inline: var(--m-space-1) var(--m-space-2); font-weight: var(--m-font-weight-medium)">3 selected</span>
            <button type="button" class="m-button" data-variant="primary" data-size="sm">${icon(I.check)} Review</button>
            <button type="button" class="m-button" data-size="sm">${icon(I.budgets)} Category</button>
            <button type="button" class="m-button" data-size="sm">${icon(I.tag)} Tag</button>
            ${iconButton(I.more, 'More actions', 'secondary')}
          </div>
        </section>
        <aside style="flex: 1 1 22rem; min-inline-size: 0; background: var(--m-color-bg-surface); border-inline-start: var(--m-border-width-thin) solid var(--m-color-border-default)" aria-labelledby="ci-tx-name">
          <div class="m-cluster" data-justify="between" style="padding: var(--m-space-3) var(--m-space-6); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
            <button type="button" class="m-button" data-variant="ghost" data-size="sm" style="font-size: var(--m-font-size-lg)">Card purchase ${icon(I.down, 14)}</button>
            <span class="m-cluster" data-gap="1">${iconButton(I.split, 'Split')}${iconButton(I.more, 'More')}</span>
          </div>
          <div class="m-stack" data-gap="2" style="padding: var(--m-space-6); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
            <div class="m-cluster" data-justify="between" style="${muted}"><span>Wednesday, Apr 15, 2026</span><span class="m-cluster" data-gap="2">${dot('accent-default', '0.375rem')} To review</span></div>
            <div class="m-cluster" data-justify="between"><h2 id="ci-tx-name" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-medium)">Parcel &amp; Pine</h2><span style="${figure}">${usd('64.25')}</span></div>
            <span class="m-cluster" data-gap="2" style="${muted}">${dot('accent-default', '0.625rem')} Everyday Visa 4410</span>
          </div>
          <dl class="m-stack" data-gap="4" style="padding: var(--m-space-6); border-block-end: var(--m-border-width-thin) solid var(--m-color-border-default)">
${detailRow('Category', `${pill('accent', '🛍️', 'Shopping')} <span style="${muted}; display: inline-flex">${icon(I.right, 14)}</span>`)}
${detailRow('Repeats', iconButton(I.plus, 'Mark as a bill', 'secondary'))}
${detailRow('Labels', chip(`${dot('danger-solid', '0.375rem')} Birthday gifts`))}
          </dl>
          <div class="m-field" style="padding: var(--m-space-6)">
            <label class="m-field-label" for="ci-note">Note</label>
            <textarea class="m-input" id="ci-note" rows="3" placeholder="Write a note…"></textarea>
          </div>
        </aside>
      </div>`,
  'padding: 0; flex: 1; display: flex; flex-direction: column',
);

// ── Onboarding ───────────────────────────────────────────────────────────────────────────────────
const option = (id: string, title: string, desc: string, checked = false) =>
  `        <label for="${id}" class="m-cluster" data-gap="3" style="flex-wrap: nowrap; align-items: start; padding: var(--m-space-4); border: var(--m-border-width-thin) solid ${checked ? 'var(--m-color-accent-default)' : 'var(--m-color-border-default)'}; border-radius: var(--m-radius-lg); background: ${checked ? 'var(--m-color-accent-subtle)' : 'var(--m-color-bg-surface)'}; cursor: pointer">
          <input class="m-radio" type="radio" name="ci-style" id="${id}"${checked ? ' checked' : ''} style="margin-block-start: 0.15rem">
          <span class="m-stack" data-gap="1"><span style="font-weight: var(--m-font-weight-medium)">${title}</span><span style="${muted}; font-size: var(--m-font-size-md)">${desc}</span></span>
        </label>`;

const onboarding = `<main style="min-block-size: 100vh; display: grid; place-items: center; padding: var(--m-space-10) var(--m-space-4); background: var(--m-color-bg-canvas)">
  <form class="m-card" style="inline-size: min(100%, 36rem); padding: clamp(var(--m-space-6), 6vw, var(--m-space-16)) clamp(var(--m-space-5), 7vw, var(--m-space-16))" aria-labelledby="ci-onb-title">
    <div class="m-stack" data-gap="6">
      <div class="m-stack" data-gap="4" data-align="center" style="text-align: center">
        <span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: 3rem; block-size: 3rem; border-radius: var(--m-radius-lg); background: var(--m-color-bg-surface); box-shadow: var(--m-shadow-lg); color: var(--m-color-accent-default)">${icon(I.wallet, 24)}</span>
        <div class="m-stack" data-gap="2" style="inline-size: 100%">
          <span id="ci-onb-step" style="${muted}; font-size: var(--m-font-size-md)">Step 2 of 3</span>
          <progress class="m-progress" data-size="sm" value="2" max="3" aria-labelledby="ci-onb-step">2 of 3</progress>
        </div>
        <h1 id="ci-onb-title" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)">Set up your first budget</h1>
        <p style="${muted}; font-size: var(--m-font-size-lg); max-inline-size: 26rem">We looked at the last three months you connected. Change anything that doesn't look right.</p>
      </div>
      <div class="m-field">
        <label class="m-field-label" for="ci-onb-income">Monthly take-home pay</label>
        <input class="m-input" data-size="lg" id="ci-onb-income" value="$5,200" inputmode="decimal" aria-describedby="ci-onb-income-hint" style="${num}">
        <p class="m-field-hint" id="ci-onb-income-hint">From your last three paychecks into Joint checking.</p>
      </div>
      <fieldset class="m-stack" data-gap="2" style="border: 0; padding: 0; margin: 0">
        <legend class="m-field-label" style="margin-block-end: var(--m-space-2)">How should we start?</legend>
${option('ci-onb-a', 'Match how I spend now', 'Budgets based on your average for each category. You can trim them later.', true)}
${option('ci-onb-b', 'Start from zero', 'Give every dollar of income a job before the month begins.')}
      </fieldset>
      <div class="m-stack" data-gap="2">
        <button type="submit" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%; border-radius: var(--m-radius-lg)">Continue</button>
        <button type="button" class="m-button" data-variant="ghost" data-size="lg" style="inline-size: 100%; ${muted}">${icon(I.back)} Back</button>
      </div>
    </div>
  </form>
</main>`;

// ── Settings ─────────────────────────────────────────────────────────────────────────────────────
const setNav = (items: string[], current: string) =>
  items
    .map(
      (l) =>
        `            <li><a class="m-sidebar-link" href="#"${l === current ? ' aria-current="page"' : ''}>${l}</a></li>`,
    )
    .join('\n');

const budgetRow = (lead: string, name: string, spent: string, value: number, budget: string, child = false) =>
  `              <tr>
                <td><span class="m-cluster" data-gap="3" style="flex-wrap: nowrap${child ? '; padding-inline-start: var(--m-space-8)' : ''}">${lead}${name}</span></td>
                <td data-numeric style="font-weight: var(--m-font-weight-medium)">${usd(spent)}</td>
                <td style="inline-size: 32%"><progress class="m-progress" value="${Math.min(value, 100)}" max="100" aria-label="${name}: ${value}% of budget" style="--m-progress-fill: var(--m-color-${value > 100 ? 'danger' : value > 85 ? 'warning' : 'success'}-solid)">${value}%</progress></td>
                <td data-numeric style="font-weight: var(--m-font-weight-medium)">${usd(budget)}</td>
              </tr>`;
const emo = (e: string) => `<span aria-hidden="true">${e}</span>`;

const settingRow = (title: string, desc: string, control: string) =>
  `            <div class="m-cluster" data-justify="between" data-gap="6" style="flex-wrap: nowrap; padding-block: var(--m-space-4); ${hair}">
              <div class="m-stack" data-gap="1"><span>${title}</span><span style="${muted}; font-size: var(--m-font-size-md)">${desc}</span></div>
              ${control}
            </div>`;

// A ring of the month's budget used, in category colours
const ring = `<svg width="96" height="96" viewBox="0 0 36 36" role="img" aria-label="71% of the budget spent" style="flex: none; transform: rotate(-90deg)">
              <circle cx="18" cy="18" r="15.5" fill="none" style="stroke: var(--m-color-bg-sunken)" stroke-width="4"/>
              <circle cx="18" cy="18" r="15.5" fill="none" style="stroke: var(--m-color-accent-default)" stroke-width="4" stroke-dasharray="44 100" pathLength="100"/>
              <circle cx="18" cy="18" r="15.5" fill="none" style="stroke: var(--m-color-success-solid)" stroke-width="4" stroke-dasharray="15 100" stroke-dashoffset="-45" pathLength="100"/>
              <circle cx="18" cy="18" r="15.5" fill="none" style="stroke: var(--m-color-danger-solid)" stroke-width="4" stroke-dasharray="6 100" stroke-dashoffset="-61" pathLength="100"/>
              <circle cx="18" cy="18" r="15.5" fill="none" style="stroke: var(--m-color-warning-solid)" stroke-width="4" stroke-dasharray="4 100" stroke-dashoffset="-68" pathLength="100"/>
            </svg>`;

const settings = shell(
  'Settings',
  `${pageTitle('Settings')}
      <span class="m-avatar" data-size="sm" aria-label="Maya Okafor">MO</span>`,
  `      <div class="m-split" style="--m-layout-split-side: 13rem; --m-layout-split-gap: var(--m-space-8); align-items: start">
        <nav aria-label="Settings sections" class="m-sidebar" style="--m-sidebar-width: 13rem; padding: 0; border: 0; background: transparent">
          <ul>
${setNav(['Profile', 'Linked accounts', 'Categories & budgets', 'Rules', 'Notifications', 'Shared access', 'Membership'], 'Categories & budgets')}
          </ul>
        </nav>
        <div class="m-stack" data-gap="6" style="max-inline-size: 52rem">
          <div class="m-cluster" data-justify="between">
            <h2 style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-medium)">Categories &amp; budgets</h2>
            <button type="button" class="m-button" data-size="sm">${icon(I.plus)} New category</button>
          </div>
          <section class="m-card" aria-label="This month">
            <div class="m-cluster" data-justify="center" data-gap="10" style="text-align: center; ${num}">
              <div class="m-stack" data-gap="1"><span style="${figure}; font-size: var(--m-font-size-xl)">${usd('3,108')}</span><span style="${muted}">spent so far</span></div>
              ${ring}
              <div class="m-stack" data-gap="1"><span style="${figure}; font-size: var(--m-font-size-xl)">${usd('4,400')}</span><span style="${muted}">budgeted</span></div>
            </div>
          </section>
          <section class="m-card" aria-labelledby="ci-cat-title" style="padding-block-end: var(--m-space-3)">
            <div class="m-table-wrap">
            <table class="m-table">
              <caption class="m-sr-only" id="ci-cat-title">Monthly categories</caption>
              <thead><tr><th>Monthly categories</th><th data-numeric>Spent</th><th><span class="m-sr-only">Progress</span></th><th data-numeric>Budget</th></tr></thead>
              <tbody>
${budgetRow(`${tri('accent-default')}${countChip('info', '3')}`, 'Home', '1,772', 92, '1,930')}
${budgetRow(emo('🔑'), 'Rent', '1,480', 100, '1,480', true)}
${budgetRow(emo('💡'), 'Power and water', '206', 82, '250', true)}
${budgetRow(emo('🧺'), 'Household', '86', 43, '200', true)}
${budgetRow(`${dot('accent-default')}${emo('🎟️')}`, 'Going out', '148', 74, '200')}
${budgetRow(`${tri('success-solid')}${countChip('success', '2')}`, 'Food', '509', 64, '800')}
${budgetRow(emo('🥦'), 'Groceries', '371', 74, '500', true)}
${budgetRow(emo('🥡'), 'Takeout', '138', 46, '300', true)}
${budgetRow(`${dot('danger-solid')}${emo('🧘')}`, 'Wellness', '237', 118, '200')}
              </tbody>
            </table>
            </div>
          </section>
          <section class="m-card" aria-labelledby="ci-budgeting" style="gap: 0">
            <h2 id="ci-budgeting" class="m-card-title" style="padding-block-end: var(--m-space-3)">Budgeting</h2>
${settingRow('Roll leftovers into next month', 'Money you don’t spend in a category carries over.', '<input class="m-switch" type="checkbox" role="switch" checked aria-label="Roll leftovers into next month">')}
${settingRow('Alert me when a budget runs over', 'A notification the day a category goes past its budget.', '<input class="m-switch" type="checkbox" role="switch" checked aria-label="Alert me when a budget runs over">')}
${settingRow('Budget month starts on', 'Line it up with your payday.', '<select class="m-select" data-size="sm" aria-label="Budget month starts on" style="inline-size: auto"><option>The 1st</option><option>The 15th</option></select>')}
${settingRow('Show hidden categories', 'Hidden categories stay out of totals and charts.', '<input class="m-switch" type="checkbox" role="switch" aria-label="Show hidden categories">')}
          </section>
        </div>
      </div>`,
);

// ── Empty state ──────────────────────────────────────────────────────────────────────────────────
const emptyState = shell(
  'Bills',
  `${pageTitle('Bills')}
      ${iconButton(I.plus, 'Add a bill')}`,
  `      <section class="m-card" style="max-inline-size: 44rem; margin-inline: auto; padding-block: var(--m-space-16)" aria-labelledby="ci-empty">
        <div class="m-stack" data-gap="4" data-align="center" style="text-align: center">
          <span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: 3.5rem; block-size: 3.5rem; border-radius: var(--m-radius-lg); background: var(--m-color-accent-subtle); color: var(--m-color-accent-text)">${icon(I.bills, 28)}</span>
          <h1 id="ci-empty" style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-medium)">No bills yet</h1>
          <p style="${muted}; font-size: var(--m-font-size-lg); max-inline-size: 26rem">When a charge repeats, it shows up here with its next date, so nothing catches you by surprise.</p>
          <div class="m-cluster" data-gap="2" data-justify="center">
            <button type="button" class="m-button" data-variant="primary">${icon(I.sparkles)} Find my bills</button>
            <button type="button" class="m-button">${icon(I.plus)} Add one yourself</button>
          </div>
        </div>
      </section>`,
);

// ── Pricing ──────────────────────────────────────────────────────────────────────────────────────
const mono = 'font-family: var(--m-font-family-mono); font-size: var(--m-font-size-xs); letter-spacing: var(--m-font-tracking-wide); text-transform: uppercase';
const leader = (label: string, value: string, soon = false) =>
  `          <li class="m-cluster" data-gap="2" style="flex-wrap: nowrap"><span style="${muted}">${label}</span><span aria-hidden="true" style="flex: 1; border-block-end: var(--m-border-width-thin) dotted var(--m-color-border-default); transform: translateY(0.25em)"></span><span style="${mono}; color: var(--m-color-fg-${soon ? 'subtle' : 'muted'})">${value}</span></li>`;
const faq = (q: string, a: string, open = false) =>
  `      <details class="m-accordion-item" name="ci-faq"${open ? ' open' : ''}${open ? ' style="box-shadow: var(--m-shadow-lg)"' : ''}><summary>${q}</summary><div class="m-accordion-content">${a}</div></details>`;

const pricing = `<div style="min-block-size: 100vh; background: radial-gradient(60rem 40rem at 20% 0%, var(--m-color-accent-subtle), transparent 70%), var(--m-color-bg-canvas)">
  <header class="m-navbar" style="background: transparent">
    <a class="m-navbar-brand m-cluster" data-gap="2" href="#"><span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: 2rem; block-size: 2rem; border-radius: var(--m-radius-md); background: var(--m-color-bg-inverse); color: var(--m-color-fg-inverse)">${icon(I.wallet, 18)}</span>Kestrel</a>
    <nav class="m-navbar-nav" aria-label="Site">
      <a class="m-navbar-link" href="#">Features ${icon(I.down, 14)}</a>
      <a class="m-navbar-link" href="#">Stories</a>
      <a class="m-navbar-link" href="#" aria-current="page">Pricing</a>
      <a class="m-navbar-link" href="#">Changelog</a>
    </nav>
    <div class="m-navbar-actions">
      <a class="m-button" href="#" style="border-radius: var(--m-radius-full)">Sign in</a>
      <a class="m-button" data-variant="primary" href="#" style="border-radius: var(--m-radius-full)">Try it free</a>
    </div>
  </header>
  <main class="m-container" style="padding-block: var(--m-space-16)">
    <div class="m-stack" data-gap="10" data-align="center">
      <div class="m-stack" data-gap="4" data-align="center" style="text-align: center">
        <h1 style="font-size: var(--m-font-size-4xl); font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-tight); line-height: var(--m-font-leading-tight)">Every feature, one price.</h1>
        <p style="${muted}; font-size: var(--m-font-size-xl); max-inline-size: 36rem">Pay for the app, not for features. It works the same on every screen you use.</p>
      </div>
      <div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Billing" style="padding: var(--m-space-1)">
        <button type="button" class="m-tab" role="tab" aria-selected="true" style="block-size: 2.75rem; padding-inline: var(--m-space-6); font-size: var(--m-font-size-xl)">Yearly</button>
        <button type="button" class="m-tab" role="tab" aria-selected="false" tabindex="-1" style="block-size: 2.75rem; padding-inline: var(--m-space-6); font-size: var(--m-font-size-xl)">Monthly</button>
      </div></div>
      <section class="m-stack" data-gap="6" aria-labelledby="ci-plan" style="inline-size: min(100%, 26rem); padding: var(--m-space-6) var(--m-space-8); background: var(--m-color-bg-surface); border: var(--m-border-width-thin) solid var(--m-color-border-default); border-radius: 0; box-shadow: var(--m-shadow-lg)">
        <div class="m-cluster" data-justify="between" style="padding-block-end: var(--m-space-4); border-block-end: var(--m-border-width-thin) dotted var(--m-color-border-default)"><span style="${mono}; ${muted}">Whole app</span><span style="${mono}; color: var(--m-color-warning-fg)">Save 25% yearly</span></div>
        <div class="m-stack" data-gap="1" data-align="center" style="text-align: center">
          <span id="ci-plan" style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-semibold); ${num}">${usd('7')}</span>
          <span style="font-size: var(--m-font-size-xl); font-weight: var(--m-font-weight-medium)">a month</span>
          <span style="color: var(--m-color-fg-subtle); ${num}">${usd('84')} once a year, instead of <s>${usd('112')}</s></span>
        </div>
        <ul class="m-stack" data-gap="3" style="padding: var(--m-space-5) 0; margin: 0; list-style: none; border-block: var(--m-border-width-thin) dotted var(--m-color-border-default)">
${leader('Linked accounts', 'Unlimited')}
${leader('Budgets and rollovers', 'Yes')}
${leader('Every device you use', 'Yes')}
${leader('Email support, seven days', 'Yes')}
${leader('Read-only advisor access', 'Later', true)}
        </ul>
        <button type="button" class="m-button" data-variant="primary" data-size="lg" style="inline-size: 100%; border-radius: var(--m-radius-full)">Start a free month</button>
      </section>
    </div>
    <section class="m-stack" data-gap="6" aria-labelledby="ci-faq" style="max-inline-size: 54rem; margin: var(--m-space-16) auto 0">
      <h2 id="ci-faq" style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-semibold); letter-spacing: var(--m-font-tracking-tight)">Questions</h2>
      <div class="m-accordion" data-variant="separated">
${faq('Is there a free trial?', 'Yes. Your first month is free, and we remind you three days before it ends.', true)}
${faq('Can I import from a spreadsheet?', 'Yes. Upload a CSV and match its columns once; we remember the layout for next time.')}
${faq('Where is my data kept?', 'Encrypted in the US, and only read to show it back to you. You can delete it any time.')}
${faq('What happens if I cancel?', 'You keep access until the end of the period you paid for, then your data can be exported or deleted.')}
      </div>
    </section>
  </main>
</div>`;

// ── Errors ───────────────────────────────────────────────────────────────────────────────────────
// In a field, in a form, a connection that needs attention, a toast for elsewhere, and whole pages
const errorPage = (code: string, ic: string, title: string, body: string, actions: string) =>
  `        <section class="m-card" style="padding-block: var(--m-space-12)" aria-labelledby="ci-err-${code}">
          <div class="m-stack" data-gap="4" data-align="center" style="text-align: center">
            <span aria-hidden="true" style="display: inline-grid; place-items: center; inline-size: 3.5rem; block-size: 3.5rem; border-radius: var(--m-radius-lg); background: var(--m-color-bg-sunken); color: var(--m-color-fg-muted)">${icon(ic, 28)}</span>
            <span style="${mono}; color: var(--m-color-fg-subtle)">Error ${code}</span>
            <h2 id="ci-err-${code}" style="font-size: var(--m-font-size-2xl); font-weight: var(--m-font-weight-medium); letter-spacing: var(--m-font-tracking-tight)">${title}</h2>
            <p style="${muted}; font-size: var(--m-font-size-lg); max-inline-size: 28rem">${body}</p>
            <div class="m-cluster" data-gap="2" data-justify="center">${actions}</div>
          </div>
        </section>`;

const errors = shell(
  'Activity',
  `${pageTitle('Add a transaction')}
      ${iconButton(I.x, 'Close')}`,
  `      <div class="m-stack" data-gap="8" style="max-inline-size: 44rem; margin-inline: auto">
        <form class="m-card" aria-labelledby="ci-err-form" novalidate>
          <h2 id="ci-err-form" class="m-card-title">New transaction</h2>
          <div class="m-alert" data-tone="danger" role="alert">
            <span class="m-alert-icon">${icon(I.alert)}</span>
            <div class="m-alert-content"><div class="m-alert-title">2 things to fix</div><div class="m-alert-body">Nothing was saved yet. Add the amount and who you paid.</div></div>
          </div>
          <div class="m-grid" style="--m-layout-grid-min: 14rem; --m-layout-grid-gap: var(--m-space-4)">
            <div class="m-field">
              <label class="m-field-label" for="ci-err-amount">Amount</label>
              <input class="m-input" id="ci-err-amount" value="$0.00" aria-invalid="true" aria-describedby="ci-err-amount-e" style="${num}">
              <p class="m-field-error" id="ci-err-amount-e">Enter an amount above $0.00, like 24.50.</p>
            </div>
            <div class="m-field">
              <label class="m-field-label" for="ci-err-date">Date</label>
              <input class="m-input" id="ci-err-date" value="Apr 15, 2026">
            </div>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="ci-err-who">Paid to</label>
            <input class="m-input" id="ci-err-who" value="" placeholder="Who did you pay?" aria-invalid="true" aria-describedby="ci-err-who-e">
            <p class="m-field-error" id="ci-err-who-e">Add a name so you can find this later.</p>
          </div>
          <div class="m-field">
            <label class="m-field-label" for="ci-err-cat">Category</label>
            <select class="m-select" id="ci-err-cat"><option>🥦 Groceries</option><option>🍜 Dining out</option></select>
          </div>
          <div class="m-cluster" data-justify="end" data-gap="2">
            <button type="button" class="m-button" data-variant="ghost">Cancel</button>
            <button type="submit" class="m-button" data-variant="primary">Save transaction</button>
          </div>
        </form>
        <div class="m-alert" data-tone="warning" role="status">
          <span class="m-alert-icon">${icon(I.warn)}</span>
          <div class="m-alert-content"><div class="m-alert-title">Harbor Credit Union needs you to sign in again</div><div class="m-alert-body">We last synced it 3 days ago. Balances and new transactions from it are paused until you reconnect.</div>
          <div class="m-alert-actions"><button type="button" class="m-button" data-size="sm">${icon(I.refresh)} Reconnect</button></div></div>
        </div>
        <div class="m-toast" data-tone="danger" role="alert"><div class="m-toast-content"><div class="m-toast-title">Couldn’t sync Travel Rewards</div><div class="m-toast-body">Their servers didn’t answer. We’ll try again in 15 minutes.</div></div><button type="button" class="m-button" data-size="sm">Retry now</button></div>
${errorPage('404', I.searchX, 'We can’t find that page', 'The link may be out of date, or the page has moved.', `<a class="m-button" data-variant="primary" href="#">${icon(I.overview)} Back to overview</a>`)}
${errorPage('500', I.alert, 'Something went wrong on our end', 'Your data is safe and nothing was changed. Try again in a moment.', `<button type="button" class="m-button" data-variant="primary">${icon(I.refresh)} Try again</button><button type="button" class="m-button">${icon(I.help)} Contact support</button>`)}
${errorPage('403', I.lock, 'This belongs to someone else', 'Only the person who linked this account can see it. Ask them to share it with you.', `<button type="button" class="m-button" data-variant="primary">Ask for access</button><a class="m-button" data-variant="ghost" href="#">Go back</a>`)}
      </div>`,
);

export const cirrusRecipes: ArchetypeRecipe[] = [
  {
    name: 'dashboard',
    title: 'Dashboard',
    description:
      'A white sidebar and header over the off-white canvas; spending against the planned pace, net worth with its range pills, then to review, top categories and what is due.',
    html: dashboard,
  },
  {
    name: 'list-detail',
    title: 'List and detail',
    description:
      'Filter chips and the totals above a month of activity grouped by day, tinted category pills, selected rows in pale blue with a floating action bar, and the detail in a side panel.',
    html: listDetail,
  },
  {
    name: 'onboarding',
    title: 'Onboarding',
    description:
      'One white card centred on the canvas: a soft icon tile, a thin progress bar, a friendly heading, one question at a time and a full-width blue button.',
    html: onboarding,
  },
  {
    name: 'settings',
    title: 'Settings',
    description:
      'A plain list of sections beside white panels: the month as a ring, budgets as a table with coloured bars, and switches in hairline rows.',
    html: settings,
  },
  {
    name: 'empty-state',
    title: 'Empty state',
    description: 'A pale-blue icon tile, a short heading, one sentence, a blue button and a quiet alternative.',
    html: emptyState,
  },
  {
    name: 'pricing',
    title: 'Pricing',
    description:
      'A soft blue wash, a big yearly or monthly segment, one receipt-like card with mono labels and dotted leaders, a pill button, and separated question cards.',
    html: pricing,
  },
  {
    name: 'errors',
    title: 'Errors',
    description:
      'Field errors under the field, a summary above the form that says nothing was saved, a reconnect callout, a toast for failures elsewhere, and whole pages for 404, 500 and no access.',
    html: errors,
  },
];
