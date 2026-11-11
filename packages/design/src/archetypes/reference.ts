/**
 * What every design language gets generated from its preset, so it's complete and exact without
 * hand-copying values: the gallery page (foundations, icons, every component in every state, the
 * error, loading and empty patterns) and the reference appended to its DESIGN.md (the actual
 * scales and values, resolved for light and dark).
 */
import { componentList, tokenByVar, tokenList } from '../contract';
import { componentExamples } from '../components/examples';
import { type Mode, resolveToken, type Theme } from '../engine/theme';
import { lucideSvg } from './lucide';
import { type Archetype, categories, iconActions } from './types';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] as const;
const SPACE = ['1', '2', '3', '4', '5', '6', '8', '10', '12', '16'] as const;
const WEIGHTS = ['regular', 'medium', 'semibold', 'bold'] as const;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A token's value with every `var(--m-…)` inside it followed, in one mode. */
export function resolveDeep(theme: Theme, path: string, mode: Mode, depth = 0): string {
  const v = resolveToken(theme, path, mode) ?? '';
  if (depth > 8) return v;
  return v.replace(/var\((--m-[a-z0-9-]+)(?:,[^)]*)?\)/g, (m, name: string) => {
    if (name === '--m-density') return '1';
    const t = tokenByVar.get(name);
    return t ? resolveDeep(theme, t.path, mode, depth + 1) : m;
  });
}

/** `calc(0.25rem * 4)` → `16px`; plain lengths in rem → px; anything else unchanged. */
export function toPx(value: string): string {
  const len = (s: string) => {
    const m = s.trim().match(/^(-?[\d.]+)(rem|px|em)?$/);
    if (!m) return undefined;
    return Number(m[1]) * (m[2] === 'rem' || m[2] === 'em' ? 16 : 1);
  };
  const plain = len(value);
  if (plain !== undefined) return `${Math.round(plain * 100) / 100}px`;
  const c = value.match(/^calc\(\s*(.+?)\s*\*\s*(.+?)\s*\)$/);
  if (c) {
    const a = len(c[1]);
    const b = len(c[2]);
    if (a !== undefined && b !== undefined) return `${Math.round(a * b * 100) / 100}px`;
  }
  return value;
}

const both = (theme: Theme, path: string) => {
  const l = resolveDeep(theme, path, 'light');
  const d = resolveDeep(theme, path, 'dark');
  return l === d ? l : `${l} / ${d}`;
};

// ---------------------------------------------------------------------------------------------
// DESIGN.md: the generated reference

/** Markdown appended to a language's DESIGN.md: the actual values, generated from its preset. */
export function designReference(a: Archetype, theme: Theme): string {
  const row = (cells: string[]) => `| ${cells.join(' | ')} |`;
  const colours = tokenList.filter((t) => t.path.startsWith('color.'));
  const lines = [
    '',
    '---',
    '',
    '## Reference (generated from the preset)',
    '',
    `Every value below is \`${theme.name}\`'s own, resolved; the same values are in \`themes/${theme.name}.css\` and \`tokens/${theme.name}.json\`. Use the tokens, not the values.`,
    '',
    '### Type scale',
    '',
    row(['Token', 'Size', 'Use']),
    row(['---', '---', '---']),
    ...SIZES.map((s) =>
      row([
        `\`--m-font-size-${s}\``,
        toPx(resolveDeep(theme, `font.size.${s}`, 'light')),
        tokenList.find((t) => t.path === `font.size.${s}`)?.def.description ?? '',
      ]),
    ),
    '',
    row(['Weights', ...WEIGHTS.map((w) => `${w} ${resolveDeep(theme, `font.weight.${w}`, 'light')}`)]),
    row(['---', ...WEIGHTS.map(() => '---')]),
    row([
      'Body / heading',
      `body ${resolveDeep(theme, 'font.body.weight', 'light')}`,
      `heading ${resolveDeep(theme, 'font.heading.weight', 'light')}`,
      `heading tracking ${resolveDeep(theme, 'font.heading.tracking', 'light')}`,
      '',
    ]),
    '',
    `Line heights: tight ${resolveDeep(theme, 'font.leading.tight', 'light')}, normal ${resolveDeep(theme, 'font.leading.normal', 'light')}, relaxed ${resolveDeep(theme, 'font.leading.relaxed', 'light')}. Tracking: tight ${resolveDeep(theme, 'font.tracking.tight', 'light')}, wide ${resolveDeep(theme, 'font.tracking.wide', 'light')}.`,
    '',
    `Families: sans \`${resolveDeep(theme, 'font.family.sans', 'light')}\`; display \`${resolveDeep(theme, 'font.family.display', 'light')}\`; mono \`${resolveDeep(theme, 'font.family.mono', 'light')}\`.`,
    '',
    '### Spacing scale',
    '',
    `The unit is ${toPx(resolveDeep(theme, 'space.unit', 'light'))}; every step is a multiple of it.`,
    '',
    row(['Step', ...SPACE.map((s) => `\`--m-space-${s}\``)]),
    row(['---', ...SPACE.map(() => '---')]),
    row(['Value', ...SPACE.map((s) => toPx(resolveDeep(theme, `space.${s}`, 'light')))]),
    '',
    '### Layout and density',
    '',
    row(['What', 'Value']),
    row(['---', '---']),
    row([
      'Page widths (container sm / md / lg)',
      ['sm', 'md', 'lg'].map((s) => resolveDeep(theme, `components.layout.containerMax.${s}`, 'light')).join(' / '),
    ]),
    row(['Page gutter (container padding)', resolveDeep(theme, 'components.layout.containerPadding', 'light')]),
    row(['Sidebar / split side column', resolveDeep(theme, 'components.layout.splitSide', 'light')]),
    row([
      'Grid gap / minimum column',
      `${toPx(resolveDeep(theme, 'components.layout.gridGap', 'light'))} / ${resolveDeep(theme, 'components.layout.gridMin', 'light')}`,
    ]),
    row([
      'Stack gap / cluster gap',
      `${toPx(resolveDeep(theme, 'components.layout.stackGap', 'light'))} / ${toPx(resolveDeep(theme, 'components.layout.clusterGap', 'light'))}`,
    ]),
    row([
      'Control height sm / md / lg',
      ['sm', 'md', 'lg'].map((s) => resolveDeep(theme, `control.height.${s}`, 'light').replace(' * 1', '')).join(' / '),
    ]),
    row([
      'Density',
      `${resolveDeep(theme, 'density', 'light')} by default; set \`--m-density: ${a.density.dense}\` on a page for dense data screens`,
    ]),
    '',
    '### Radius, borders and shadows',
    '',
    row(['Token', 'Value (light / dark)']),
    row(['---', '---']),
    ...[
      'radius.sm',
      'radius.md',
      'radius.lg',
      'radius.control',
      'radius.container',
      'components.button.radius',
      'borderWidth.thin',
      'shadow.sm',
      'shadow.md',
      'shadow.lg',
      'shadow.overlay',
    ].map((p) => row([`\`${p}\``, `\`${both(theme, p)}\``])),
    '',
    '### Motion',
    '',
    row(['Token', 'Value']),
    row(['---', '---']),
    ...[
      'motion.duration.fast',
      'motion.duration.normal',
      'motion.duration.slow',
      'motion.easing.standard',
      'motion.easing.emphasized',
    ].map((p) => row([`\`${p}\``, `\`${both(theme, p)}\``])),
    '',
    'Under `prefers-reduced-motion: reduce` every duration is 0ms.',
    '',
    '### Colour',
    '',
    row(['Token', 'Light', 'Dark', 'Use']),
    row(['---', '---', '---', '---']),
    ...colours.map((t) =>
      row([
        `\`${t.cssVar}\``,
        `\`${resolveDeep(theme, t.path, 'light')}\``,
        `\`${resolveDeep(theme, t.path, 'dark')}\``,
        t.def.description,
      ]),
    ),
    '',
    '### Icons for common actions',
    '',
    `${a.icons.set === 'lucide' ? 'Lucide' : a.icons.set}, ${a.icons.style}, ${a.icons.stroke}px stroke; ${a.icons.size.text}px beside text, ${a.icons.size.control}px in controls. Use these for these actions, every time:`,
    '',
    row(['Action', 'Icon']),
    row(['---', '---']),
    ...iconActions.map((k) => row([k, `\`${a.icons.actions[k]}\``])),
    '',
    '### Components',
    '',
    `Every component is in \`@mariachi/design\` (\`.m-<name>\`); this language themes all ${componentList.length}. Their anatomy, states and accessibility are in \`catalog.json\`; each one, in every state, light and dark, is drawn in \`gallery.html\` beside this file.`,
    '',
    componentList.map((c) => `\`${c.name}\``).join(', '),
    '',
  ];
  return lines.join('\n');
}

// ---------------------------------------------------------------------------------------------
// The gallery page

const section = (
  id: string,
  title: string,
  intro: string,
  body: string,
) => `<section class="m-stack" data-gap="5" id="${id}" aria-labelledby="g-${id}" style="padding-block: var(--m-space-10); border-block-start: var(--m-border-width-thin) solid var(--m-color-border-default)">
  <div class="m-stack" data-gap="1"><h2 id="g-${id}">${title}</h2>${intro ? `<p class="m-muted" style="max-inline-size: 48rem">${intro}</p>` : ''}</div>
  ${body}
</section>`;

const label = (s: string) =>
  `<span class="m-subtle" style="font-size: var(--m-font-size-xs); font-family: var(--m-font-family-mono)">${s}</span>`;

/** A row of one control in several states: each cell its label above the control. */
const stateRow = (name: string, cells: [string, string][]) => `<div class="m-stack" data-gap="2">
    <h3 style="font-size: var(--m-font-size-md)">${name}</h3>
    <div class="m-cluster" data-gap="6" data-align="start">
${cells.map(([s, html]) => `      <div class="m-stack" data-gap="2" data-align="start" style="min-inline-size: 7rem">${label(s)}${html}</div>`).join('\n')}
    </div>
  </div>`;

function statesMatrix(a: Archetype): string {
  const ic = (k: (typeof iconActions)[number]) => lucideSvg(a.icons.actions[k], a.icons.size.control, a.icons.stroke);
  const button = (variant: string, label: string) => {
    const v = variant ? ` data-variant="${variant}"` : '';
    return stateRow(`Button, ${label}`, [
      ['default', `<button type="button" class="m-button"${v}>${ic('add')} Add</button>`],
      ['hover', `<button type="button" class="m-button"${v} data-g-hover>${ic('add')} Add</button>`],
      ['focus', `<button type="button" class="m-button"${v} data-g-focus>${ic('add')} Add</button>`],
      ['active', `<button type="button" class="m-button"${v} data-g-active>${ic('add')} Add</button>`],
      ['disabled', `<button type="button" class="m-button"${v} disabled>${ic('add')} Add</button>`],
      [
        'loading',
        `<button type="button" class="m-button"${v} aria-busy="true">Saving</button>`,
      ],
    ]);
  };
  const field = (control: (extra: string) => string, name: string) =>
    stateRow(name, [
      ['default', control('')],
      ['hover', control(' data-g-hover')],
      ['focus', control(' data-g-focus')],
      ['disabled', control(' disabled')],
      ['error', control(' aria-invalid="true"')],
    ]);
  return [
    button('primary', 'primary'),
    button('', 'secondary (default)'),
    button('ghost', 'ghost'),
    button('danger', 'danger'),
    stateRow('Icon button', [
      ['default', `<button type="button" class="m-button" data-icon-only aria-label="More">${ic('more')}</button>`],
      [
        'hover',
        `<button type="button" class="m-button" data-icon-only data-g-hover aria-label="More">${ic('more')}</button>`,
      ],
      [
        'focus',
        `<button type="button" class="m-button" data-icon-only data-g-focus aria-label="More">${ic('more')}</button>`,
      ],
      [
        'ghost',
        `<button type="button" class="m-button" data-variant="ghost" data-icon-only aria-label="Settings">${ic('settings')}</button>`,
      ],
      [
        'disabled',
        `<button type="button" class="m-button" data-icon-only disabled aria-label="More">${ic('more')}</button>`,
      ],
    ]),
    field((x) => `<input class="m-input" value="Fieldstone" aria-label="Input"${x}>`, 'Input'),
    field((x) => `<select class="m-select" aria-label="Select"${x}><option>Operations</option></select>`, 'Select'),
    field((x) => `<textarea class="m-input" rows="2" aria-label="Textarea"${x}>A note</textarea>`, 'Textarea'),
    stateRow('Checkbox, radio, switch', [
      [
        'off',
        `<span class="m-cluster" data-gap="3"><input class="m-checkbox" type="checkbox" aria-label="Off"><input class="m-radio" type="radio" name="g-r1" aria-label="Off"><input class="m-switch" type="checkbox" role="switch" aria-label="Off"></span>`,
      ],
      [
        'on',
        `<span class="m-cluster" data-gap="3"><input class="m-checkbox" type="checkbox" checked aria-label="On"><input class="m-radio" type="radio" name="g-r2" checked aria-label="On"><input class="m-switch" type="checkbox" role="switch" checked aria-label="On"></span>`,
      ],
      [
        'focus',
        `<span class="m-cluster" data-gap="3"><input class="m-checkbox" type="checkbox" checked data-g-focus aria-label="Focus"><input class="m-radio" type="radio" name="g-r3" checked data-g-focus aria-label="Focus"><input class="m-switch" type="checkbox" role="switch" checked data-g-focus aria-label="Focus"></span>`,
      ],
      [
        'disabled',
        `<span class="m-cluster" data-gap="3"><input class="m-checkbox" type="checkbox" checked disabled aria-label="Disabled"><input class="m-radio" type="radio" name="g-r4" checked disabled aria-label="Disabled"><input class="m-switch" type="checkbox" role="switch" checked disabled aria-label="Disabled"></span>`,
      ],
      [
        'error',
        `<span class="m-cluster" data-gap="3"><input class="m-checkbox" type="checkbox" aria-invalid="true" aria-label="Error"><input class="m-radio" type="radio" name="g-r5" aria-invalid="true" aria-label="Error"></span>`,
      ],
    ]),
    stateRow('Tabs', [
      [
        'underline',
        `<div class="m-tabs"><div class="m-tab-list" role="tablist" aria-label="Underline"><button type="button" class="m-tab" role="tab" aria-selected="true">Overview</button><button type="button" class="m-tab" role="tab" aria-selected="false" data-g-hover>Hover</button><button type="button" class="m-tab" role="tab" aria-selected="false" aria-disabled="true">Disabled</button></div></div>`,
      ],
      [
        'pill',
        `<div class="m-tabs" data-variant="pill"><div class="m-tab-list" role="tablist" aria-label="Pill"><button type="button" class="m-tab" role="tab" aria-selected="true">Day</button><button type="button" class="m-tab" role="tab" aria-selected="false" data-g-hover>Week</button><button type="button" class="m-tab" role="tab" aria-selected="false">Month</button></div></div>`,
      ],
    ]),
    stateRow('Navigation link', [
      [
        'default',
        `<nav class="m-sidebar" aria-label="Default" style="inline-size: 12rem"><ul><li><a class="m-sidebar-link" href="#">${ic('settings')} Settings</a></li></ul></nav>`,
      ],
      [
        'hover',
        `<nav class="m-sidebar" aria-label="Hover" style="inline-size: 12rem"><ul><li><a class="m-sidebar-link" href="#" data-g-hover>${ic('settings')} Settings</a></li></ul></nav>`,
      ],
      [
        'current',
        `<nav class="m-sidebar" aria-label="Current" style="inline-size: 12rem"><ul><li><a class="m-sidebar-link" href="#" aria-current="page">${ic('settings')} Settings</a></li></ul></nav>`,
      ],
      [
        'focus',
        `<nav class="m-sidebar" aria-label="Focus" style="inline-size: 12rem"><ul><li><a class="m-sidebar-link" href="#" data-g-focus>${ic('settings')} Settings</a></li></ul></nav>`,
      ],
    ]),
    stateRow('Link', [
      ['default', '<a href="#">View statement</a>'],
      ['hover', '<a href="#" data-g-hover>View statement</a>'],
      ['focus', '<a href="#" data-g-focus>View statement</a>'],
    ]),
    stateRow('Card', [
      ['resting', '<div class="m-card" style="inline-size: 12rem"><div class="m-card-body">Resting</div></div>'],
      [
        'interactive, hover',
        '<a class="m-card" href="#" data-g-hover style="inline-size: 12rem; text-decoration: none; color: inherit"><div class="m-card-body">Hover</div></a>',
      ],
      [
        'focus',
        '<a class="m-card" href="#" data-g-focus style="inline-size: 12rem; text-decoration: none; color: inherit"><div class="m-card-body">Focus</div></a>',
      ],
    ]),
  ].join('\n');
}

function patterns(a: Archetype): string {
  const ic = (k: (typeof iconActions)[number], size = a.icons.size.text) =>
    lucideSvg(a.icons.actions[k], size, a.icons.stroke);
  const fullPage = (
    code: string,
    title: string,
    body: string,
    action: string,
  ) => `<div class="m-card" style="flex: 1 1 16rem"><div class="m-card-body m-stack" data-gap="3" data-align="start">
      <span class="m-subtle" style="font-family: var(--m-font-family-mono); font-size: var(--m-font-size-sm)">${code}</span>
      <h3 style="font-size: var(--m-font-size-xl)">${title}</h3>
      <p class="m-muted">${body}</p>
      ${action}
    </div></div>`;
  return `<div class="m-stack" data-gap="8">
  <div class="m-stack" data-gap="3">
    <h3>Errors in a form</h3>
    <div class="m-alert" data-tone="danger" role="alert">
      <span class="m-alert-icon">${ic('error')}</span>
      <div class="m-alert-content"><div class="m-alert-title">2 things need fixing before you can continue</div><div class="m-alert-body">Check the routing number and the amount below.</div></div>
    </div>
    <div class="m-grid" style="--m-layout-grid-min: 16rem">
      <div class="m-field"><label class="m-field-label" for="g-routing">Routing number</label><input class="m-input" id="g-routing" value="02100002" aria-invalid="true" aria-describedby="g-routing-e"><p class="m-field-error" id="g-routing-e">A routing number has 9 digits.</p></div>
      <div class="m-field"><label class="m-field-label" for="g-amount">Amount</label><input class="m-input" id="g-amount" value="$0.00" aria-invalid="true" aria-describedby="g-amount-e"><p class="m-field-error" id="g-amount-e">Enter an amount above $0.00.</p></div>
      <div class="m-field"><label class="m-field-label" for="g-memo">Memo</label><input class="m-input" id="g-memo" value="October retainer" aria-describedby="g-memo-h"><p class="m-field-hint" id="g-memo-h">Shown to the recipient.</p></div>
    </div>
  </div>
  <div class="m-stack" data-gap="3">
    <h3>Alerts and toasts</h3>
    <div class="m-stack" data-gap="2">
${(['info', 'success', 'warning', 'danger'] as const)
  .map(
    (t) =>
      `      <div class="m-alert" data-tone="${t}" role="${t === 'danger' ? 'alert' : 'status'}"><span class="m-alert-icon">${ic(t === 'danger' ? 'error' : t === 'success' ? 'success' : t === 'warning' ? 'warning' : 'info')}</span><div class="m-alert-content"><div class="m-alert-title">${{ info: 'Statements are ready', success: 'Payment sent', warning: 'Card expires soon', danger: 'Payment failed' }[t]}</div><div class="m-alert-body">${{ info: 'October’s statement is ready to download.', success: '$1,200.00 to Acme Ltd arrives on Nov 14.', warning: 'The card ending 4821 expires at the end of the month.', danger: 'The bank returned $419.00 to Bluebird Studio. Check the account details and try again.' }[t]}</div></div></div>`,
  )
  .join('\n')}
    </div>
    <div class="m-cluster" data-gap="3" data-align="start">
      <div class="m-toast" data-tone="success" role="status"><div class="m-toast-content"><div class="m-toast-title">Payment sent</div><div class="m-toast-body">$1,200.00 to Acme Ltd.</div></div><button type="button" class="m-button" data-variant="ghost" data-size="sm" data-icon-only aria-label="Dismiss">${ic('close', a.icons.size.control)}</button></div>
      <div class="m-toast" data-tone="danger" role="alert"><div class="m-toast-content"><div class="m-toast-title">Couldn't save</div><div class="m-toast-body">Check your connection and try again.</div></div><button type="button" class="m-button" data-size="sm">Retry</button></div>
    </div>
  </div>
  <div class="m-stack" data-gap="3">
    <h3>Full-page errors</h3>
    <div class="m-cluster" data-gap="4" data-align="stretch">
      ${fullPage('404', 'This page doesn’t exist', 'The link may be old, or the page moved.', `<a class="m-button" data-variant="primary" href="#">${ic('back', a.icons.size.control)} Go home</a>`)}
      ${fullPage('500', 'Something went wrong on our side', 'Nothing was changed. Try again in a moment; if it keeps happening, contact support.', `<button type="button" class="m-button">${ic('refresh', a.icons.size.control)} Try again</button>`)}
      ${fullPage('403', 'You don’t have access to this', 'Ask an admin of Fieldstone to give you access.', '<button type="button" class="m-button">Request access</button>')}
    </div>
  </div>
  <div class="m-stack" data-gap="3">
    <h3>Loading</h3>
    <div class="m-cluster" data-gap="8" data-align="center">
      <div class="m-stack" data-gap="2" style="inline-size: 16rem" aria-busy="true" aria-label="Loading"><div class="m-skeleton" style="block-size: 1.25rem; inline-size: 60%"></div><div class="m-skeleton" style="block-size: 2rem"></div><div class="m-skeleton" style="block-size: 0.875rem; inline-size: 80%"></div></div>
      <span class="m-spinner" role="status" aria-label="Loading"></span>
      <button type="button" class="m-button" data-variant="primary" aria-busy="true">Sending</button>
      <progress class="m-progress" style="inline-size: 12rem" aria-label="Loading">Loading</progress>
    </div>
  </div>
  <div class="m-stack" data-gap="3">
    <h3>Empty</h3>
    <div class="m-stack" data-gap="3" data-align="center" style="text-align: center; padding-block: var(--m-space-8)">
      <span style="color: var(--m-color-fg-subtle)">${lucideSvg(a.icons.actions.search, 32, a.icons.stroke)}</span>
      <h4 style="font-size: var(--m-font-size-lg)">No results for “acme”</h4>
      <p class="m-muted">Try another name or amount, or clear the filters.</p>
      <button type="button" class="m-button">Clear filters</button>
    </div>
  </div>
</div>`;
}

function foundations(a: Archetype, theme: Theme): string {
  const groups = ['bg', 'fg', 'border', 'accent', 'success', 'warning', 'danger', 'info', 'selection'];
  const colours = groups
    .map((g) => {
      const toks = tokenList.filter((t) => t.path.startsWith(`color.${g}.`));
      return `<div class="m-stack" data-gap="2"><h3 style="font-size: var(--m-font-size-md)">${g}</h3><div class="m-cluster" data-gap="3" data-align="start">
${toks
  .map(
    (t) =>
      `  <div class="m-stack" data-gap="1" style="inline-size: 7.5rem"><span style="display: block; block-size: 3rem; border-radius: var(--m-radius-md); background: var(${t.cssVar}); box-shadow: inset 0 0 0 1px var(--m-color-border-default)"></span>${label(t.path.replace('color.', ''))}<span class="m-subtle" style="font-size: var(--m-font-size-xs); font-family: var(--m-font-family-mono)">${esc(resolveDeep(theme, t.path, 'light'))}<br>${esc(resolveDeep(theme, t.path, 'dark'))}</span></div>`,
  )
  .join('\n')}
</div></div>`;
    })
    .join('\n');
  const type = SIZES.map(
    (s) =>
      `<div class="m-cluster" data-gap="6" data-align="baseline" style="flex-wrap: nowrap">${label(`${s} · ${toPx(resolveDeep(theme, `font.size.${s}`, 'light'))}`)}<span style="font-size: var(--m-font-size-${s}); ${['2xl', '3xl', '4xl'].includes(s) ? 'font-family: var(--m-font-family-display); font-weight: var(--m-font-heading-weight)' : ''}">Fieldstone pays $5,216,471.18</span></div>`,
  ).join('\n');
  const weights = WEIGHTS.map(
    (w) =>
      `<span style="font-weight: var(--m-font-weight-${w})">${w} ${resolveDeep(theme, `font.weight.${w}`, 'light')}</span>`,
  ).join('');
  const space = SPACE.map(
    (s) =>
      `<div class="m-cluster" data-gap="4" style="flex-wrap: nowrap">${label(`space-${s} · ${toPx(resolveDeep(theme, `space.${s}`, 'light'))}`)}<span style="display: block; block-size: 0.75rem; inline-size: var(--m-space-${s}); background: var(--m-color-accent-default); border-radius: 2px"></span></div>`,
  ).join('\n');
  const radius = ['sm', 'md', 'lg', 'control', 'container']
    .map(
      (r) =>
        `<div class="m-stack" data-gap="1" data-align="center"><span style="display: block; inline-size: 4rem; block-size: 4rem; border-radius: var(--m-radius-${r}); border: var(--m-border-width-thin) solid var(--m-color-border-strong)"></span>${label(`${r} · ${resolveDeep(theme, `radius.${r}`, 'light')}`)}</div>`,
    )
    .concat(
      `<div class="m-stack" data-gap="1" data-align="center"><span style="display: block; inline-size: 6rem; block-size: 2.25rem; border-radius: var(--m-button-radius); border: var(--m-border-width-thin) solid var(--m-color-border-strong)"></span>${label(`button · ${resolveDeep(theme, 'components.button.radius', 'light')}`)}</div>`,
    )
    .join('\n');
  const shadows = ['sm', 'md', 'lg', 'overlay']
    .map(
      (s) =>
        `<div class="m-stack" data-gap="2" data-align="center"><span style="display: block; inline-size: 8rem; block-size: 5rem; border-radius: var(--m-radius-lg); background: var(--m-color-bg-raised); box-shadow: var(--m-shadow-${s})"></span>${label(`shadow-${s}`)}</div>`,
    )
    .join('\n');
  return `<div class="m-stack" data-gap="8">
  <div class="m-stack" data-gap="4"><h3>Colour</h3>${colours}</div>
  <div class="m-stack" data-gap="3"><h3>Type</h3>
    ${label(`sans: ${esc(resolveDeep(theme, 'font.family.sans', 'light'))}`)}
    ${label(`display: ${esc(resolveDeep(theme, 'font.family.display', 'light'))} · mono: ${esc(resolveDeep(theme, 'font.family.mono', 'light'))}`)}
    <div class="m-stack" data-gap="3">${type}</div>
    <div class="m-cluster" data-gap="6">${weights}</div>
    <div class="m-stack" data-gap="2" style="max-inline-size: 40rem"><h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3><h4>Heading 4</h4><p>Body text at the base size and weight. Payments sent before 5pm arrive the next business day; the recipient sees your memo.</p><p class="m-muted">Muted secondary text.</p><p class="m-subtle">Subtle tertiary text.</p><p><a href="#">A link</a> and <code class="m-code-inline">code</code> and <kbd class="m-kbd">⌘</kbd> <kbd class="m-kbd">K</kbd></p></div>
  </div>
  <div class="m-stack" data-gap="3"><h3>Spacing</h3>${space}</div>
  <div class="m-stack" data-gap="3"><h3>Radius</h3><div class="m-cluster" data-gap="6" data-align="end">${radius}</div></div>
  <div class="m-stack" data-gap="3"><h3>Shadows</h3><div class="m-cluster" data-gap="8" style="padding: var(--m-space-4)">${shadows}</div></div>
  <div class="m-stack" data-gap="2"><h3>Motion and layout</h3>
    <dl class="m-grid" style="--m-layout-grid-min: 14rem; --m-layout-grid-gap: var(--m-space-3)">
${[
  ['Durations', ['fast', 'normal', 'slow'].map((d) => resolveDeep(theme, `motion.duration.${d}`, 'light')).join(' / ')],
  ['Easing', resolveDeep(theme, 'motion.easing.standard', 'light')],
  [
    'Page widths',
    ['sm', 'md', 'lg'].map((s) => resolveDeep(theme, `components.layout.containerMax.${s}`, 'light')).join(' / '),
  ],
  ['Gutter', resolveDeep(theme, 'components.layout.containerPadding', 'light')],
  [
    'Controls',
    ['sm', 'md', 'lg']
      .map((s) => resolveDeep(theme, `control.height.${s}`, 'light').replace(/calc\((.+) \* 1\)/, '$1'))
      .join(' / '),
  ],
  ['Density', `${resolveDeep(theme, 'density', 'light')} (dense: ${a.density.dense})`],
]
  .map(
    ([k, v]) =>
      `      <div class="m-stack" data-gap="1"><dt class="m-muted" style="font-size: var(--m-font-size-sm)">${k}</dt><dd style="font-family: var(--m-font-family-mono); font-size: var(--m-font-size-sm)">${esc(v)}</dd></div>`,
  )
  .join('\n')}
    </dl>
  </div>
</div>`;
}

function icons(a: Archetype): string {
  return `<p class="m-muted">${a.icons.set === 'lucide' ? 'Lucide' : a.icons.set}, ${a.icons.style}, ${a.icons.stroke}px stroke: ${a.icons.size.text}px beside text, ${a.icons.size.control}px in controls.</p>
<div class="m-grid" style="--m-layout-grid-min: 9rem; --m-layout-grid-gap: var(--m-space-3)">
${iconActions
  .map(
    (k) =>
      `  <div class="m-cluster" data-gap="3" style="flex-wrap: nowrap; padding: var(--m-space-2) var(--m-space-3); border-radius: var(--m-radius-md); background: var(--m-color-bg-sunken)">${lucideSvg(a.icons.actions[k], 20, a.icons.stroke)}<span class="m-stack" data-gap="0"><span>${k}</span>${label(a.icons.actions[k])}</span></div>`,
  )
  .join('\n')}
</div>`;
}

function components(): string {
  return componentList
    .map((c) => {
      const ex = componentExamples.find((e) => e.component === c.name)?.examples ?? [];
      return `<div class="m-stack" data-gap="4" id="c-${c.name}" style="padding-block: var(--m-space-6); border-block-start: var(--m-border-width-thin) solid var(--m-color-border-muted)">
  <div class="m-stack" data-gap="1"><h3>${c.title} ${label(`.m-${c.name}`)}</h3><p class="m-muted" style="max-inline-size: 48rem">${esc(c.description)}</p></div>
${ex.map((e) => `  <div class="m-stack" data-gap="2">${label(esc(e.name))}<div>${e.html.replace(/\bid="/g, `id="g-${c.name}-`).replace(/\b(for|aria-controls|aria-labelledby|aria-describedby|popovertarget|commandfor)="/g, `$1="g-${c.name}-`)}</div></div>`).join('\n')}
</div>`;
    })
    .join('\n');
}

/** The gallery: one page with everything an app is built from in this language. */
export function galleryPage(a: Archetype, theme: Theme): string {
  const cat = categories[a.category];
  return `<!doctype html>
<html lang="en" data-theme="${a.id}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${theme.label}: gallery</title>
<link rel="stylesheet" href="../gallery.css">
<link rel="stylesheet" href="../../css/themes/${a.id}.css">
</head>
<body>
<main class="m-container" style="padding-block: var(--m-space-12)">
<header class="m-stack" data-gap="3">
  ${label(`${cat.label} · data-theme="${a.id}"`)}
  <h1 style="font-family: var(--m-font-family-display); font-size: var(--m-font-size-4xl); font-weight: var(--m-font-heading-weight)">${theme.label}</h1>
  <p style="font-size: var(--m-font-size-lg); max-inline-size: 44rem">${esc(a.pitch)}</p>
  <p class="m-muted">${esc(a.for)}.</p>
  <div class="m-cluster" data-gap="2">${[...a.tags.feel, a.tags.density, a.tags.mode, ...a.tags.style].map((t) => `<span class="m-badge">${esc(t)}</span>`).join('')}</div>
  <p class="m-muted" style="font-size: var(--m-font-size-sm)">Open with <code class="m-code-inline">data-mode="dark"</code> on the root for dark. Hover, focus and pressed are drawn with the components' own rules.</p>
</header>
${section('foundations', 'Foundations', 'Colour, type, spacing, radius, shadows, motion and layout: every value resolved from the preset.', foundations(a, theme))}
${section('icons', 'Icons', 'The icon for each common action. Use the same one every time.', icons(a))}
${section('states', 'States', 'Default, hover, focus, pressed, disabled, error and loading for every control.', statesMatrix(a))}
${section('patterns', 'Errors, loading and empty', 'Field and form errors, alerts and toasts, full-page errors, loading and empty results.', patterns(a))}
${section('components', `Components (${componentList.length})`, 'Every component in the library, every example, in this language.', components())}
</main>
</body>
</html>
`;
}

/** The package CSS with each :hover, :focus-visible and :active rule also matching a data attribute,
 *  so the gallery can draw those states statically. Only the galleries load it. */
export function galleryCss(mariachiCss: string): string {
  return mariachiCss
    .replace(/:hover\b/g, ':is(:hover, [data-g-hover])')
    .replace(/:focus-visible\b/g, ':is(:focus-visible, [data-g-focus])')
    .replace(/:active\b/g, ':is(:active, [data-g-active])');
}
