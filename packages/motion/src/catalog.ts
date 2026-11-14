/**
 * The motion catalog (dist/catalog.json): every pattern with its markup, in the shape of
 * @mariachi/design's catalog components (name, title, description, useWhen, examples of
 * { name, html }), plus `code` where a pattern is started from JavaScript. design_reference reads it.
 * Build-time only: not part of the package's runtime files.
 */
import { chart } from './charts';

export interface PatternExample {
  name: string;
  description?: string;
  html: string;
  /** The JavaScript that goes with the markup, when there is some. */
  code?: string;
}

export interface Pattern {
  name: string;
  title: string;
  category: 'loading' | 'actions' | 'motion' | 'charts';
  description: string;
  useWhen: string;
  /** Classes, attributes and functions the pattern defines. */
  anatomy: Record<string, string>;
  a11y: string[];
  examples: PatternExample[];
}

export interface MotionCatalog {
  package: '@mariachi/motion';
  version: string;
  /** In an app: the CSS after the kit's, and enhance() once at start. */
  usage: { css: string; js: string };
  patterns: Pattern[];
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const row = '<div class="m-skeleton" data-shape="row" aria-hidden="true"></div>';
const people = [
  ['Amara Okafor', 'Design lead · 3 open reviews'],
  ['Jonas Lindqvist', 'Engineer · on call this week'],
  ['Priya Raman', 'Product · 12 comments today'],
];

export const patterns: Pattern[] = [
  {
    name: 'skeleton',
    title: 'Skeletons shaped like content',
    category: 'loading',
    description:
      'Placeholders in the shape of what is coming: a line of text, an avatar, a picture at its aspect ratio, a list row, a card, a paragraph. Group them the way the loaded content is laid out. The language decides corners, colour and whether they shimmer, pulse or stay still.',
    useWhen: 'Any list, card grid, table, profile or article while its data loads. Prefer it to a lone spinner whenever the layout is known.',
    anatomy: {
      '.m-skeleton': 'On an empty <div> or <span>, with aria-hidden="true"',
      '[data-shape]': 'text (default) | circle | block | media (keeps aspect-ratio) | row (avatar and two lines) | card (picture, title, meta) | lines (a paragraph)',
      'style="--lines: 4"': 'How many lines a data-shape="lines" paragraph has (default 3)',
      'style="inline-size: 60%"': 'Vary a text line’s width',
      'style="aspect-ratio: 4 / 3"': 'A media skeleton at the ratio of the picture that is coming',
    },
    a11y: [
      'Skeletons are decorative: aria-hidden="true" on each, aria-busy="true" on the region that is loading.',
      'The loaded content (or a live region) is what screen readers hear; a skeleton says nothing.',
      'Under prefers-reduced-motion the shimmer stops and the skeleton stays still.',
    ],
    examples: [
      {
        name: 'A list loading',
        html: `<div class="m-stack" data-gap="4" aria-busy="true" aria-label="Loading people">\n  ${row}\n  ${row}\n  ${row}\n</div>`,
      },
      {
        name: 'A card grid loading',
        html: `<div class="m-grid" style="--m-layout-grid-min: 12rem" aria-busy="true" aria-label="Loading projects">
  <div class="m-skeleton" data-shape="card" aria-hidden="true"></div>
  <div class="m-skeleton" data-shape="card" aria-hidden="true"></div>
  <div class="m-skeleton" data-shape="card" aria-hidden="true"></div>
</div>`,
      },
      {
        name: 'An article loading',
        html: `<article class="m-stack" data-gap="4" aria-busy="true" aria-label="Loading article">
  <div class="m-skeleton" data-shape="media" style="aspect-ratio: 21 / 9" aria-hidden="true"></div>
  <div class="m-skeleton" style="inline-size: 55%; block-size: 1.5em" aria-hidden="true"></div>
  <div class="m-skeleton" data-shape="lines" style="--lines: 4" aria-hidden="true"></div>
</article>`,
      },
      {
        name: 'The base shapes',
        html: `<div class="m-cluster" data-gap="4" data-align="center" aria-hidden="true">
  <div class="m-skeleton" data-shape="circle"></div>
  <div class="m-skeleton" style="inline-size: 10rem"></div>
  <div class="m-skeleton" data-shape="block" style="inline-size: 8rem; block-size: 4rem"></div>
</div>`,
      },
    ],
  },
  {
    name: 'loading-region',
    title: 'A region that loads',
    category: 'loading',
    description:
      'A region holds both its loading state and its content. While aria-busy="true" its [data-when="loading"] children show; set aria-busy="false" and they hide while the [data-when="loaded"] children enter. A region inside another follows its own aria-busy.',
    useWhen: 'Every list, card region, table or panel that fetches data: render the skeleton in the same place as the content, then flip aria-busy.',
    anatomy: {
      '[aria-busy="true" | "false"]': 'On the region (a <section>, a list, a card body)',
      '[data-when="loading"]': 'Shown while the region is busy (usually skeletons)',
      '[data-when="loaded"]': 'Shown, with the entrance, once it isn’t',
    },
    a11y: [
      'aria-busy tells screen readers to wait and read the region when it is ready.',
      'Give the region a name (aria-label or a heading) so the loaded content is announced in context.',
      'Focus stays where it was; the swap never moves it.',
    ],
    examples: [
      {
        name: 'A list region',
        html: `<section aria-busy="true" aria-labelledby="team-title">
  <h3 id="team-title">Team</h3>
  <div class="m-stack" data-gap="4" data-when="loading" aria-hidden="true">${row}${row}${row}</div>
  <ul class="m-stack" data-gap="4" data-when="loaded" data-stagger>
${people.map(([name, role]) => `    <li class="m-cluster" data-gap="3"><span class="m-avatar">${name.split(' ').map((w) => w[0]).join('')}</span><span class="m-stack" data-gap="1"><strong>${name}</strong><span class="m-muted">${role}</span></span></li>`).join('\n')}
  </ul>
</section>`,
        code: `const region = document.querySelector('[aria-labelledby="team-title"]');\nconst people = await load();\nrender(people);\nregion.setAttribute('aria-busy', 'false');`,
      },
    ],
  },
  {
    name: 'media',
    title: 'Pictures that load',
    category: 'loading',
    description:
      'An image blurs up from a tiny placeholder (a data: URI of a few pixels), then sharpens as it loads. Without a placeholder it fades in, and a .m-media-frame around it shows a spinner until it arrives. enhance() marks it loaded; without enhance() pictures show as normal.',
    useWhen: 'Cover art, photos, avatars from a server, thumbnails in grids. Give the frame or the image its aspect ratio so nothing jumps.',
    anatomy: {
      'img.m-media': 'The picture; data-loaded is set by enhance() ("true", or "error")',
      '[data-placeholder]': 'A tiny image (data: URI) to blur up from',
      '.m-media-frame': 'A frame around a picture with no placeholder: holds its space and shows a spinner',
    },
    a11y: ['The picture keeps its alt text; the spinner is decorative.', 'Under reduced motion the picture fades without the blur.'],
    examples: [
      {
        name: 'Blur-up',
        html: `<img class="m-media" src="/covers/harbour.jpg" data-placeholder="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA" alt="Boats in the harbour at dusk" width="640" height="360" style="aspect-ratio: 16 / 9; inline-size: 100%; block-size: auto">`,
      },
      {
        name: 'A frame with a spinner',
        html: `<div class="m-media-frame" style="aspect-ratio: 1">\n  <img class="m-media" src="/avatars/amara.jpg" alt="Amara Okafor">\n</div>`,
      },
    ],
  },
  {
    name: 'progress',
    title: 'Uploads and long work',
    category: 'loading',
    description: "The library's m-progress for work of known length; data-indeterminate on any .m-progress when the length isn't known.",
    useWhen: 'Uploads, imports, exports and jobs longer than a few seconds. Say what is happening beside it.',
    anatomy: {
      '<progress class="m-progress" value max>': 'Known length',
      '.m-progress[data-indeterminate]': 'Unknown length, on any element (a native <progress> with no value is indeterminate too)',
    },
    a11y: ['Label it (a <label> or aria-label) and say what is happening in text.', 'Under reduced motion the indeterminate bar pulses in place.'],
    examples: [
      {
        name: 'Upload',
        html: `<label class="m-stack" data-gap="1"><span class="m-muted">Uploading site-photos.zip (42 of 68 MB)</span><progress class="m-progress" value="62" max="100">62%</progress></label>`,
      },
      {
        name: 'Unknown length',
        html: `<div class="m-stack" data-gap="1"><span class="m-muted" id="import-label">Importing contacts…</span><div class="m-progress" data-indeterminate role="progressbar" aria-labelledby="import-label"></div></div>`,
      },
    ],
  },
  {
    name: 'busy-button',
    title: 'A busy button',
    category: 'actions',
    description:
      'data-busy on any button: a spinner takes the place of its icon (or covers its label, which stays for screen readers), its width holds, aria-busy="true" is set and clicks are ignored, so nothing is sent twice. busy(button, promise) sets and clears it.',
    useWhen: 'Every action that waits on the network: save, send, pay, invite, export.',
    anatomy: {
      '[data-busy]': 'Busy: shows the spinner and ignores clicks (with enhance(), or busy())',
      'busy(button, promise)': 'Sets data-busy and aria-busy until the promise settles; returns its result',
    },
    a11y: [
      'aria-busy="true" while it works; the label stays in the accessibility tree.',
      'The button keeps focus; nothing is disabled, so focus isn’t lost.',
      'Under reduced motion the spinner pulses in place instead of turning.',
    ],
    examples: [
      {
        name: 'With an icon and without',
        html: `<div class="m-cluster" data-gap="3">
  <button type="button" class="m-button" data-variant="primary" data-busy aria-busy="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Save changes</button>
  <button type="button" class="m-button" data-busy aria-busy="true">Export</button>
</div>`,
        code: `import { busy } from './design/motion/motion.js';\nsave.addEventListener('click', () => busy(save, api.save(form)));`,
      },
    ],
  },
  {
    name: 'optimistic',
    title: 'An optimistic change',
    category: 'actions',
    description:
      'optimistic(el, apply, commit, { undo }) applies the change at once and marks el data-pending (dimmed, a small pending mark) while it saves. On success it confirms quietly (or with a toast and Undo when you pass message); on failure undo() puts it back and a toast says so, with Try again.',
    useWhen: 'Small edits only: toggles, renames, reordering, a star or a like. Never payments, sends or deletions.',
    anatomy: {
      '[data-pending]': 'Set while the change is saving',
      'optimistic(el, apply, commit, { undo, message, error, notify })': 'Returns a promise of true (saved) or false (undone)',
      '.m-toast-region': 'Where its toasts go (made on the page if missing); pass notify to use your own',
    },
    a11y: [
      'The element is aria-busy while it saves; the toast is announced (a polite region; failures are alerts).',
      'Undo and Try again are buttons in the toast; focus is never moved to it.',
    ],
    examples: [
      {
        name: 'A setting',
        html: `<label class="m-field" data-layout="inline"><input class="m-switch" type="checkbox" role="switch" id="digest"> Weekly digest</label>`,
        code: `import { optimistic } from './design/motion/motion.js';\ndigest.addEventListener('change', () => {\n  const on = digest.checked;\n  optimistic(digest.closest('label'), () => {}, () => api.settings({ digest: on }), {\n    undo: () => { digest.checked = !on; },\n  });\n});`,
      },
    ],
  },
  {
    name: 'enter',
    title: 'Content that enters',
    category: 'motion',
    description:
      "data-enter on anything: it enters when it appears, by the language's motion style (a fade, a slide or a scale) and tempo. Pure CSS, so it works without JavaScript and when the element is added later.",
    useWhen: 'New content: a panel that opens, a result that arrives, a message added to a thread, a page section on load.',
    anatomy: { '[data-enter]': 'Enters when it is first shown (added, or display changes from none)' },
    a11y: ['Under reduced motion it fades only, briefly.', 'It never moves focus.'],
    examples: [
      {
        name: 'A result',
        html: `<article class="m-card" data-enter><div class="m-card-body">Your export is ready: 1,284 rows.</div></article>`,
      },
    ],
  },
  {
    name: 'stagger',
    title: 'A list that staggers in',
    category: 'motion',
    description:
      'data-stagger on a list: its children enter one after another, each --m-motion-stagger after the last, capped at --m-motion-stagger-max so a long list never waits. CSS counts the first 12; enhance() counts any number, and new items enter as a batch.',
    useWhen: 'A list, a grid of cards or a set of tiles appearing together (search results, a dashboard, a feed page).',
    anatomy: {
      '[data-stagger]': 'On the list; its direct children enter in turn',
      '--i': 'An item’s place in the stagger (set by CSS up to 12, by enhance() beyond)',
    },
    a11y: ['Under reduced motion every item fades in at once.'],
    examples: [
      {
        name: 'Cards',
        html: `<ul class="m-grid" style="--m-layout-grid-min: 10rem" data-stagger>
  <li class="m-card"><div class="m-card-body">Roadmap</div></li>
  <li class="m-card"><div class="m-card-body">Hiring plan</div></li>
  <li class="m-card"><div class="m-card-body">Q3 budget</div></li>
  <li class="m-card"><div class="m-card-body">Launch notes</div></li>
</ul>`,
      },
    ],
  },
  {
    name: 'leave',
    title: 'Something that leaves',
    category: 'motion',
    description: 'leave(el) plays the exit (the reverse of the entrance, with the exit tempo), then removes the element. Resolves once it is gone.',
    useWhen: 'Dismissing a notification, removing a list item after it was archived, closing an inline panel.',
    anatomy: { 'leave(el)': 'Sets data-leaving, waits for the exit, removes the element', '[data-leaving]': 'While it leaves (ignores the pointer)' },
    a11y: ['Move focus yourself before removing something that holds it; leave() never moves focus.', 'Under reduced motion it fades out briefly.'],
    examples: [
      {
        name: 'Archive a row',
        html: `<li class="m-cluster" data-justify="between" id="row-42">Invoice #42 <button type="button" class="m-button" data-size="sm" data-variant="ghost">Archive</button></li>`,
        code: `import { leave } from './design/motion/motion.js';\nawait api.archive(42);\nawait leave(document.getElementById('row-42'));`,
      },
    ],
  },
  {
    name: 'overlays',
    title: 'Dialogs, sheets, popovers and toasts',
    category: 'motion',
    description:
      'Automatic for <dialog>, [popover], dialog.m-sheet and .m-toast: they open with the entrance and close with the exit (CSS @starting-style and transition-behavior: allow-discrete), the backdrop fading with them. A sheet slides in from its edge (data-side="end", "start" or "bottom").',
    useWhen: 'Every dialog, drawer, menu, popover and toast. Nothing to add: open and close them as usual.',
    anatomy: {
      'dialog': 'showModal() / close(), or the invoker commands',
      '[popover]': 'popovertarget, or showPopover() / hidePopover()',
      'dialog.m-sheet[data-side]': 'A side or bottom sheet (with the library’s m-dialog for its look)',
      '.m-toast': 'Enters when added; leaves with data-state="closing" or leave()',
    },
    a11y: ['Native dialogs and popovers keep their focus handling; the motion never moves focus.', 'Under reduced motion they fade in place.'],
    examples: [
      {
        name: 'A sheet',
        html: `<button type="button" class="m-button" commandfor="filters" command="show-modal">Filters</button>
<dialog class="m-dialog m-sheet" id="filters" data-side="end" aria-labelledby="filters-title">
  <header class="m-dialog-header"><h2 class="m-dialog-title" id="filters-title">Filters</h2>
    <form method="dialog"><button class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Close">✕</button></form></header>
  <div class="m-dialog-body">…</div>
</dialog>`,
      },
    ],
  },
  {
    name: 'route',
    title: 'Page and route transitions',
    category: 'motion',
    description:
      "Full-page navigations cross-fade on their own (@view-transition { navigation: auto }). In a single-page app, navigate(() => router.push(…)) wraps the change in a view transition: a fade, or a slide when the language's --m-motion-route is slide. view-transition-name on shared parts (the sidebar, a card that becomes a page) keeps them in place.",
    useWhen: 'Every route change in a single-page app; shared elements between a list and its detail page.',
    anatomy: {
      'navigate(update)': 'Runs update inside a view transition; resolves once the page has changed',
      'style="view-transition-name: sidebar"': 'A part that stays put (names are unique on a page)',
    },
    a11y: ['Under reduced motion page changes cross-fade briefly.', 'Move focus to the new page’s heading yourself, as for any route change.'],
    examples: [
      {
        name: 'A router link',
        html: `<nav style="view-transition-name: sidebar"><a href="/projects" data-route>Projects</a></nav>`,
        code: `import { navigate } from './design/motion/motion.js';\nfor (const a of document.querySelectorAll('a[data-route]')) {\n  a.addEventListener('click', (e) => { e.preventDefault(); navigate(() => router.push(a.getAttribute('href'))); });\n}`,
      },
    ],
  },
  {
    name: 'chart-line',
    title: 'Line chart',
    category: 'charts',
    description: 'One to five series over time. The lines draw on; the latest point is marked. Smooth by default (it never overshoots the data), or curve: "linear".',
    useWhen: 'Trends over time: revenue by month, active users by day, latency by hour.',
    anatomy: { 'chart({ kind: "line", title, labels, series })': 'Returns the figure markup', 'updateChart(el, spec)': 'Animates it to new data' },
    a11y: ['The SVG has a <title> and a <desc> summary; a visually hidden table holds every value.', 'Under reduced motion it appears drawn.'],
    examples: [
      {
        name: 'Two series',
        html: chart({
          kind: 'line',
          id: 'cat-line',
          title: 'Signups by month',
          labels: months,
          series: [
            { name: '2026', values: [320, 380, 360, 450, 520, 490, 610, 680, 720, 690, 780, 860] },
            { name: '2025', values: [210, 240, 260, 250, 300, 340, 330, 390, 410, 450, 470, 520] },
          ],
        }),
        code: `import { chart } from './design/motion/charts.js';\nel.innerHTML = chart({ kind: 'line', title: 'Signups by month', labels, series: [{ name: '2026', values }] });`,
      },
    ],
  },
  {
    name: 'chart-area',
    title: 'Area chart',
    category: 'charts',
    description: 'A line chart with the area under it filled, from zero. The line draws on and the fill fades in under it.',
    useWhen: 'Volumes over time where the total matters: traffic, storage used, spend.',
    anatomy: { 'chart({ kind: "area", … })': 'As a line chart' },
    a11y: ['As the line chart.'],
    examples: [
      {
        name: 'Spend',
        html: chart({
          kind: 'area',
          id: 'cat-area',
          title: 'Cloud spend by week',
          format: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
          labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10'],
          series: [{ name: 'Spend', values: [1840, 2120, 1980, 2460, 2380, 2710, 2590, 3020, 2880, 3240] }],
        }),
      },
    ],
  },
  {
    name: 'chart-bar',
    title: 'Bar chart',
    category: 'charts',
    description: 'Bars grow from their base one after another (capped, so a long chart never waits). Several series are grouped. Negative values grow down from zero.',
    useWhen: 'Comparing amounts across categories or periods: sales by region, tickets by week.',
    anatomy: { 'chart({ kind: "bar", … })': 'Each bar has a <title> with its label and value' },
    a11y: ['As the line chart; each bar also has a tooltip title.'],
    examples: [
      {
        name: 'By quarter',
        html: chart({
          kind: 'bar',
          id: 'cat-bar',
          title: 'Orders by quarter',
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          series: [
            { name: 'Online', values: [1240, 1580, 1720, 2140] },
            { name: 'In store', values: [980, 1020, 1110, 1290] },
          ],
        }),
      },
    ],
  },
  {
    name: 'chart-donut',
    title: 'Donut chart',
    category: 'charts',
    description: 'Parts of a whole, sweeping round in turn, with the total in the middle and a legend with each value and share.',
    useWhen: 'A few parts of one total (up to five): plan mix, traffic sources, storage by type.',
    anatomy: { 'chart({ kind: "donut", labels, series: [values] })': 'One series; labels name the parts', totalLabel: 'The word under the total' },
    a11y: ['As the line chart; each segment has a tooltip title.'],
    examples: [
      {
        name: 'Plan mix',
        html: chart({ kind: 'donut', id: 'cat-donut', title: 'Customers by plan', labels: ['Starter', 'Team', 'Business', 'Enterprise'], series: [1820, 1240, 610, 190] }),
      },
    ],
  },
  {
    name: 'chart-sparkline',
    title: 'Sparkline',
    category: 'charts',
    description: 'A small trend line with no axes, for inside a table row, a stat or a list item.',
    useWhen: 'A trend beside a number: in a table of accounts, in a stat tile.',
    anatomy: { 'chart({ kind: "sparkline", title, series: [values] })': 'About 120 × 32 px; it scales' },
    a11y: ['Its title names it; the table holds the values.'],
    examples: [{ name: 'In a row', html: chart({ kind: 'sparkline', id: 'cat-spark', title: 'Requests, last 14 days', series: [42, 48, 45, 52, 61, 58, 64, 70, 66, 72, 81, 78, 86, 92] }) }],
  },
  {
    name: 'chart-stat',
    title: 'Stat',
    category: 'charts',
    description: 'A number that counts up when it scrolls into view, with its change (an arrow, good or bad by goodWhen) and an optional sparkline.',
    useWhen: 'The headline numbers of a dashboard: revenue, active users, conversion, error rate.',
    anatomy: {
      'chart({ kind: "stat", title, value, change, changeLabel, format, series? })': 'change is a fraction (0.124 is 12.4%)',
      '[data-count-up]': 'Counted by enhance() (or countUp(el)) when visible',
    },
    a11y: ['The number is aria-busy while it counts, so screen readers read the final value.', 'The direction is said in words, not only by the arrow and colour.'],
    examples: [
      {
        name: 'Revenue',
        html: chart({
          kind: 'stat',
          id: 'cat-stat',
          title: 'Revenue this month',
          value: 48210,
          format: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
          change: 0.124,
          changeLabel: 'vs last month',
          series: [31, 34, 33, 38, 41, 40, 44, 48],
        }),
      },
    ],
  },
];

export function buildCatalog(version: string): MotionCatalog {
  return {
    package: '@mariachi/motion',
    version,
    usage: {
      css: "import './design/index.css'; import './design/motion/motion.css';",
      js: "import { enhance } from './design/motion/motion.js'; enhance();",
    },
    patterns,
  };
}
