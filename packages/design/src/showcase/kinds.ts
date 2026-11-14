/**
 * The templates, one per kind. Each reads the language's arrangement for its structure: where the picture goes
 * (it leads, sits beside, or is a thumbnail), what sets things apart, where the main action sits, how loud the
 * title is and how tight it all sits. The kit's tokens do the rest.
 */
import {
  artwork,
  avatars,
  badge,
  btnSize,
  type Ctx,
  esc,
  frame,
  gap,
  ghost,
  icon,
  maxWidth,
  muted,
  picture,
  titleSize,
} from './parts';
import type { CardContent, ListRowContent, PlayerContent } from './types';

const pct = (x: number) => Math.round(Math.max(0, Math.min(1, x)) * 100);
const STEPS = ['md', 'lg', 'xl', '2xl', '3xl', '4xl'];
/** The title, at the language's step, capped where the layout is compact; `oneLine` truncates instead of wrapping. */
const titleEl = (
  c: Ctx,
  text: string,
  opts: { where?: 'component' | 'screen'; cap?: string; oneLine?: boolean } = {},
) => {
  const want = titleSize(c, opts.where ?? 'component');
  const size = opts.cap && STEPS.indexOf(want) > STEPS.indexOf(opts.cap) ? opts.cap : want;
  const display =
    c.arr.title === 'display' && !opts.cap ? '; font-family: var(--m-font-family-display); line-height: 1.05' : '';
  return `<h3 class="m-card-title" style="margin: 0; font-size: var(--m-font-size-${size})${display}${opts.oneLine ? `; ${ONE_LINE}` : ''}">${esc(text)}</h3>`;
};
const ONE_LINE = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis';
const line = (s: string, oneLine: boolean, size = 'sm') =>
  `<span style="color: var(--m-color-fg-muted); font-size: var(--m-font-size-${size})${oneLine ? `; ${ONE_LINE}` : ''}">${s}</span>`;

// ---------------------------------------------------------------------------------------------
// The player

export function player(c: Ctx, p: PlayerContent): string {
  const cover = p.cover ?? artwork(0);
  const by = esc([p.by, p.from].filter(Boolean).join(' · '));
  // In a bar the words keep to one line each; beside a picture the title steps down a size at most
  const words = (layout: 'leads' | 'beside' | 'bar') =>
    `<div class="m-stack" data-gap="1" style="min-inline-size: 0; flex: 1">${titleEl(c, p.title, layout === 'bar' ? { cap: 'lg', oneLine: true } : layout === 'beside' ? { cap: 'xl' } : {})}${line(by, layout !== 'leads')}</div>`;
  const progress = `<div class="m-stack" data-gap="1" style="inline-size: 100%"><progress class="m-progress" data-size="sm" value="${pct(p.played)}" max="100" aria-label="Played">${pct(p.played)}%</progress><div class="m-cluster" style="justify-content: space-between; font-variant-numeric: tabular-nums">${muted(esc(p.elapsed), 'xs')}${muted(esc(p.length), 'xs')}</div></div>`;
  const play = (bump = 1) =>
    `<button type="button" class="m-button" data-variant="primary" data-icon-only${btnSize(c, bump)} aria-label="Play">${icon(c, 'play', c.a.icons.size.control + 4)}</button>`;
  const playWide = `<button type="button" class="m-button" data-variant="primary"${btnSize(c, 1)} style="inline-size: 100%">${icon(c, 'play')} Play</button>`;
  const like = ghost(c, 'heart', 'Like');
  const g = gap(c, 'normal');

  // The controls row, by where the main action sits
  const controls = () => {
    switch (c.arr.primary) {
      case 'centre':
        return `<div class="m-cluster" style="justify-content: space-between; flex-wrap: nowrap">${ghost(c, 'shuffle', 'Shuffle')}${ghost(c, 'skip-back', 'Previous')}${play()}${ghost(c, 'skip-forward', 'Next')}${ghost(c, 'repeat', 'Repeat')}</div>`;
      case 'footer':
        return `<div class="m-cluster" style="justify-content: space-between; flex-wrap: nowrap">${ghost(c, 'shuffle', 'Shuffle')}${ghost(c, 'skip-back', 'Previous')}${ghost(c, 'skip-forward', 'Next')}${ghost(c, 'repeat', 'Repeat')}</div>${playWide}`;
      case 'inline':
        return `<div class="m-cluster" style="justify-content: space-between; flex-wrap: nowrap"><div class="m-cluster" data-gap="1" style="flex-wrap: nowrap">${ghost(c, 'skip-back', 'Previous')}${ghost(c, 'skip-forward', 'Next')}${ghost(c, 'shuffle', 'Shuffle')}</div>${play(0)}</div>`;
      default: // header: play sits by the title
        return `<div class="m-cluster" style="justify-content: space-between; flex-wrap: nowrap">${ghost(c, 'shuffle', 'Shuffle')}${ghost(c, 'skip-back', 'Previous')}${ghost(c, 'skip-forward', 'Next')}${ghost(c, 'repeat', 'Repeat')}</div>`;
    }
  };
  const head = (layout: 'leads' | 'beside') =>
    `<div class="m-cluster" style="justify-content: space-between; flex-wrap: nowrap; align-items: flex-start">${words(layout)}${c.arr.primary === 'header' ? play(0) : like}</div>`;

  if (c.arr.media === 'leads') {
    // The cover leads, full width, then the words, the bar and the controls
    return frame(
      c,
      `<div class="m-stack" data-gap="${g}">${picture(cover, 'full', 'container', `Cover of ${p.from ?? p.title}`)}${head('leads')}${progress}${controls()}</div>`,
      maxWidth(c),
    );
  }
  if (c.arr.media === 'beside') {
    // The cover beside the words and the bar; the controls under both
    return frame(
      c,
      `<div class="m-stack" data-gap="${g}"><div class="m-cluster" data-gap="${gap(c, 'normal')}" style="flex-wrap: nowrap; align-items: center">${picture(cover, 6, 'md', `Cover of ${p.from ?? p.title}`)}<div class="m-stack" data-gap="${gap(c, 'tight')}" style="flex: 1; min-inline-size: 0">${head('beside')}${progress}</div></div>${controls()}</div>`,
      maxWidth(c, true),
    );
  }
  // A bar, in two lines: a thumbnail and the words (with the like, or play where it heads); then the bar and the
  // controls in line, so the words keep the width
  const barControls = `<div class="m-cluster" data-gap="1" style="flex-wrap: nowrap">${ghost(c, 'skip-back', 'Previous')}${c.arr.primary === 'header' ? '' : play(0)}${ghost(c, 'skip-forward', 'Next')}</div>`;
  const thin = `<progress class="m-progress" data-size="sm" value="${pct(p.played)}" max="100" aria-label="Played" style="flex: 1">${pct(p.played)}%</progress>`;
  return frame(
    c,
    `<div class="m-stack" data-gap="${gap(c, 'tight')}"><div class="m-cluster" data-gap="${gap(c, 'normal')}" style="flex-wrap: nowrap; align-items: center">${picture(cover, 3, 'sm', '')}${words('bar')}${c.arr.primary === 'header' ? play(0) : like}</div><div class="m-cluster" data-gap="${gap(c, 'normal')}" style="flex-wrap: nowrap; align-items: center">${muted(esc(p.elapsed), 'xs')}${thin}${muted(esc(p.length), 'xs')}${barControls}</div></div>`,
    maxWidth(c, true),
  );
}

// ---------------------------------------------------------------------------------------------
// The card: one thing with its checklist

export function card(c: Ctx, p: CardContent): string {
  const done = p.items.filter((i) => i.done).length;
  const status = p.status ? badge(p.status.label, p.status.tone) : '';
  const action = (variant: 'primary' | 'ghost' | '', wide = false) =>
    `<button type="button" class="m-button"${variant ? ` data-variant="${variant}"` : ''}${btnSize(c, -1)}${wide ? ' style="inline-size: 100%"' : ''}>${icon(c, 'plus')} ${esc(p.action)}</button>`;
  const words = `<div class="m-stack" data-gap="1" style="min-inline-size: 0">${titleEl(c, p.title, { cap: '2xl' })}${muted(esc(p.meta))}</div>`;
  const head =
    c.arr.primary === 'header'
      ? `<div class="m-stack" data-gap="${gap(c, 'tight')}"><div class="m-cluster" style="justify-content: space-between; flex-wrap: nowrap; align-items: flex-start">${words}${action('primary')}</div>${status ? `<div>${status}</div>` : ''}</div>`
      : `<div class="m-cluster" style="justify-content: space-between; flex-wrap: nowrap; align-items: flex-start">${words}${status}</div>`;
  const items = `<div class="m-stack" data-gap="${gap(c, 'tight')}">${p.items
    .map(
      (i) =>
        `<label class="m-field" data-layout="inline"><input class="m-checkbox" type="checkbox"${i.done ? ' checked' : ''}> <span${i.done ? ' style="text-decoration: line-through; color: var(--m-color-fg-muted)"' : ''}>${esc(i.label)}</span></label>`,
    )
    .join('')}</div>`;
  const bar = `<div class="m-stack" data-gap="1"><progress class="m-progress" data-size="sm" value="${Math.round((100 * done) / Math.max(1, p.items.length))}" max="100" aria-label="Done">${done} of ${p.items.length}</progress>${muted(`${done} of ${p.items.length} done`, 'xs')}</div>`;
  const people = avatars(c, p.people ?? []);
  const foot = (() => {
    switch (c.arr.primary) {
      case 'footer':
        return `${people ? `<div>${people}</div>` : ''}${action('primary', true)}`;
      case 'centre':
        return `<div class="m-cluster" style="justify-content: center">${action('')}</div>${people ? `<div class="m-cluster" style="justify-content: center">${people}</div>` : ''}`;
      case 'inline':
        return `<div class="m-cluster" style="justify-content: space-between">${people}${action('ghost')}</div>`;
      default:
        return people ? `<div>${people}</div>` : '';
    }
  })();
  const divide =
    c.arr.separation === 'divider'
      ? '<hr style="border: 0; border-block-start: 1px solid var(--m-color-border-muted); margin: 0">'
      : '';
  return frame(
    c,
    `<div class="m-stack" data-gap="${gap(c, 'normal')}">${head}${divide}${items}${bar}${foot}</div>`,
    maxWidth(c),
  );
}

// ---------------------------------------------------------------------------------------------
// A few rows of a list

export function list_row(c: Ctx, p: ListRowContent): string {
  const pad = gap(c, 'normal');
  const pic = { leads: 3.5, beside: 2.5, thumb: 2 }[c.arr.media];
  const row = (r: ListRowContent['rows'][number], i: number) => {
    const end = r.status
      ? badge(r.status.label, r.status.tone)
      : r.value
        ? `<span style="font-variant-numeric: tabular-nums; font-weight: var(--m-font-weight-medium)">${esc(r.value)}</span>`
        : '';
    const more = c.arr.primary === 'inline' ? ghost(c, 'ellipsis', `More for ${r.title}`) : '';
    const inner = `<div class="m-cluster" data-gap="${gap(c, 'normal')}" style="flex-wrap: nowrap; align-items: center">${r.picture ? picture(artwork(i + 1), pic, c.arr.media === 'leads' ? 'md' : 'sm') : ''}<div class="m-stack" data-gap="0" style="flex: 1; min-inline-size: 0"><span style="font-weight: var(--m-font-weight-medium); white-space: nowrap; overflow: hidden; text-overflow: ellipsis">${esc(r.title)}</span>${muted(esc(r.meta))}</div>${end}${more}</div>`;
    switch (c.arr.separation) {
      case 'shadow':
        return `<div class="m-card" data-size="sm" style="box-shadow: var(--m-shadow-sm)">${inner}</div>`;
      case 'tint':
        return `<div class="m-card" data-variant="sunken" data-size="sm">${inner}</div>`;
      default:
        return `<div style="padding-block: var(--m-space-${pad})">${inner}</div>`;
    }
  };
  const rows = p.rows.map(row);
  const ruled = c.arr.separation === 'divider' || c.arr.separation === 'border';
  const list = ruled
    ? `<div class="m-stack" data-gap="0">${rows.map((r, i) => (i ? `<div style="border-block-start: 1px solid var(--m-color-border-muted)">${r}</div>` : r)).join('')}</div>`
    : `<div class="m-stack" data-gap="${c.arr.separation === 'space' ? gap(c, 'tight') : gap(c, 'tight')}">${rows.join('')}</div>`;
  const action = (variant: string, wide = false) =>
    `<button type="button" class="m-button"${variant ? ` data-variant="${variant}"` : ''}${btnSize(c, -1)}${wide ? ' style="inline-size: 100%"' : ''}>${icon(c, 'plus')} ${esc(p.action)}</button>`;
  const head = `<div class="m-cluster" style="justify-content: space-between; align-items: center">${titleEl(c, p.title, { cap: '2xl' })}${c.arr.primary === 'header' || c.arr.primary === 'inline' ? action(c.arr.primary === 'header' ? 'primary' : 'ghost') : ''}</div>`;
  const foot =
    c.arr.primary === 'footer'
      ? action('primary', true)
      : c.arr.primary === 'centre'
        ? `<div class="m-cluster" style="justify-content: center">${action('')}</div>`
        : '';
  const body = `<div class="m-stack" data-gap="${gap(c, 'normal')}">${head}${list}${foot}</div>`;
  // A bordered language puts the whole list in one card; the others let the rows stand on the page
  return c.arr.separation === 'border'
    ? frame(c, body, maxWidth(c, true))
    : `<section style="max-inline-size: ${maxWidth(c, true)}rem; margin-inline: auto">${body}</section>`;
}
