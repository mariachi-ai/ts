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
  mapGround,
  maxWidth,
  muted,
  picture,
  titleSize,
} from './parts';
import type {
  CalendarContent,
  CardContent,
  ChatThreadContent,
  DashboardTileContent,
  FeedItemContent,
  FormContent,
  FormField,
  ListRowContent,
  MapContent,
  PlayerContent,
  TableCell,
  TableContent,
} from './types';

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

// ---------------------------------------------------------------------------------------------
// Shared by the kinds below

/** A button with an optional icon, a step below the language's control size unless bumped. */
const btn = (
  c: Ctx,
  label: string,
  o: { variant?: 'primary' | 'ghost'; icon?: string; wide?: boolean; bump?: number } = {},
) =>
  `<button type="button" class="m-button"${o.variant ? ` data-variant="${o.variant}"` : ''}${btnSize(c, o.bump ?? -1)}${o.wide ? ' style="inline-size: 100%"' : ''}>${o.icon ? `${icon(c, o.icon)} ` : ''}${esc(label)}</button>`;

/**
 * The main action where the language puts it: beside the title (`head`), or at the foot, full width or centred.
 * In line, it belongs with the rows, so each kind places that one itself.
 */
const placed = (c: Ctx, label: string, iconName?: string) => ({
  head: c.arr.primary === 'header' ? btn(c, label, { variant: 'primary', icon: iconName }) : '',
  foot:
    c.arr.primary === 'footer'
      ? btn(c, label, { variant: 'primary', icon: iconName, wide: true })
      : c.arr.primary === 'centre'
        ? `<div class="m-cluster" style="justify-content: center">${btn(c, label, { icon: iconName })}</div>`
        : '',
});

/** Two things at either end of a row. */
const between = (left: string, right: string, align = 'center') =>
  `<div class="m-cluster" style="justify-content: space-between; flex-wrap: nowrap; align-items: ${align}">${left}${right}</div>`;

/** A title with a muted line under it. */
const titled = (c: Ctx, title: string, meta: string, cap = '2xl') =>
  `<div class="m-stack" data-gap="1" style="min-inline-size: 0">${titleEl(c, title, { cap })}${meta ? muted(meta) : ''}</div>`;

const RULE = '<hr style="border: 0; border-block-start: 1px solid var(--m-color-border-muted); margin: 0">';
const STRONG = 'font-weight: var(--m-font-weight-medium)';

/** Rows set apart the language's way: small raised or tinted cards, rules between, or space alone. */
function rowsBy(c: Ctx, rows: string[]): string {
  switch (c.arr.separation) {
    case 'shadow':
      return `<div class="m-stack" data-gap="${gap(c, 'tight')}">${rows.map((r) => `<div class="m-card" data-size="sm" style="box-shadow: var(--m-shadow-sm)">${r}</div>`).join('')}</div>`;
    case 'tint':
      return `<div class="m-stack" data-gap="${gap(c, 'tight')}">${rows.map((r) => `<div class="m-card" data-variant="sunken" data-size="sm">${r}</div>`).join('')}</div>`;
    case 'space':
      return `<div class="m-stack" data-gap="${gap(c, 'normal')}">${rows.join('')}</div>`;
    default:
      return `<div class="m-stack" data-gap="0">${rows.map((r, i) => `<div style="padding-block: var(--m-space-${gap(c, 'tight')})${i ? '; border-block-start: 1px solid var(--m-color-border-muted)' : ''}">${r}</div>`).join('')}</div>`;
  }
}

/**
 * The outside of a kind whose rows stand on their own: one card for a bordered language, rules above and below for
 * a ruled one, nothing for the rest (their rows are the cards).
 */
const shell = (c: Ctx, body: string, widthRem: number) =>
  c.arr.separation === 'border' || c.arr.separation === 'divider'
    ? frame(c, body, widthRem)
    : `<section style="max-inline-size: ${widthRem}rem; margin-inline: auto">${body}</section>`;

// ---------------------------------------------------------------------------------------------
// A calendar: a week of bookings, one day open

export function calendar(c: Ctx, p: CalendarContent): string {
  const sel = Math.max(0, Math.min(p.days.length - 1, p.selected));
  const open = p.days[sel];
  const act = placed(c, p.action, 'plus');
  const nav = `<div class="m-cluster" data-gap="1" style="flex-wrap: nowrap">${ghost(c, 'chevron-left', 'Previous week')}${ghost(c, 'chevron-right', 'Next week')}</div>`;
  const head = between(titled(c, p.title, esc(p.range), 'xl'), act.head || nav);
  const cols = `display: grid; grid-template-columns: repeat(${p.days.length}, minmax(0, 1fr)); gap: var(--m-space-1)`;
  const dayHead = (d: CalendarContent['days'][number], on: boolean) =>
    `<span style="font-size: var(--m-font-size-xs)${on ? '' : '; color: var(--m-color-fg-muted)'}">${esc(d.day)}</span><span style="font-weight: var(--m-font-weight-semibold); font-variant-numeric: tabular-nums">${esc(d.date)}</span>`;
  const onDay = 'background: var(--m-color-accent-default); color: var(--m-color-accent-fg)';

  // A dense language shows the whole week as a grid of slots; the others a strip of days, with dots for bookings
  const week =
    c.arr.density === 'dense'
      ? `<div style="${cols}">${p.days
          .map(
            (d, i) =>
              `<div class="m-stack" data-gap="1" style="min-inline-size: 0"><div class="m-stack" data-gap="0" style="align-items: center; padding-block: var(--m-space-1); border-radius: var(--m-radius-sm)${i === sel ? `; ${onDay}` : ''}">${dayHead(d, i === sel)}</div>${d.slots
                .map(
                  (s) =>
                    `<span title="${esc(`${s.time} ${s.label}`)}" style="font-size: var(--m-font-size-xs); font-variant-numeric: tabular-nums; text-align: center; padding-block: var(--m-space-1); border-radius: var(--m-radius-sm); ${s.free ? 'border: 1px dashed var(--m-color-border-strong); color: var(--m-color-fg-muted)' : 'background: var(--m-color-accent-subtle); color: var(--m-color-accent-text)'}">${esc(s.time)}</span>`,
                )
                .join('')}</div>`,
          )
          .join('')}</div>`
      : `<div style="${cols}">${p.days
          .map((d, i) => {
            const booked = Math.min(3, d.slots.filter((s) => !s.free).length);
            const dots = `<span class="m-cluster" data-gap="1" style="justify-content: center; block-size: var(--m-space-1)">${Array.from({ length: booked }, () => `<span style="inline-size: var(--m-space-1); block-size: var(--m-space-1); border-radius: var(--m-radius-full); background: ${i === sel ? 'var(--m-color-accent-fg)' : 'var(--m-color-accent-default)'}"></span>`).join('')}</span>`;
            return `<button type="button" class="m-button"${i === sel ? ' data-variant="primary"' : ' data-variant="ghost"'} aria-pressed="${i === sel}" style="flex-direction: column; gap: var(--m-space-1); block-size: auto; min-inline-size: 0; padding-inline: 0; padding-block: var(--m-space-2)">${dayHead(d, i === sel)}${dots}</button>`;
          })
          .join('')}</div>`;

  // The open day's slots: the time, what's booked (with a bar in the accent), and a free slot's badge or Book
  const slot = (s: CalendarContent['days'][number]['slots'][number]) => {
    const words = `<div class="m-stack" data-gap="0" style="flex: 1; min-inline-size: 0${s.free ? '' : '; border-inline-start: 3px solid var(--m-color-accent-default); padding-inline-start: var(--m-space-2)'}"><span style="${STRONG}; ${ONE_LINE}${s.free ? '; color: var(--m-color-fg-muted)' : ''}">${esc(s.label)}</span>${s.meta ? line(esc(s.meta), true) : ''}</div>`;
    const end = s.free ? (c.arr.primary === 'inline' ? btn(c, 'Book', { variant: 'ghost', icon: 'plus' }) : badge('Free', 'success')) : '';
    return `<div class="m-cluster" data-gap="${gap(c, 'normal')}" style="flex-wrap: nowrap; align-items: center"><span style="inline-size: 3rem; flex-shrink: 0; font-variant-numeric: tabular-nums; ${STRONG}">${esc(s.time)}</span>${words}${end}</div>`;
  };
  const dayTitle = `<span style="color: var(--m-color-fg-muted); font-size: var(--m-font-size-sm); ${STRONG}">${esc(`${open.day} ${open.date}`)} · ${open.slots.length} slots</span>`;
  return shell(
    c,
    `<div class="m-stack" data-gap="${gap(c, 'normal')}">${head}${week}<div class="m-stack" data-gap="${gap(c, 'tight')}">${dayTitle}${rowsBy(c, open.slots.map(slot))}</div>${act.foot}</div>`,
    maxWidth(c, true),
  );
}

// ---------------------------------------------------------------------------------------------
// A chat thread: a conversation with one other person

export function chat_thread(c: Ctx, p: ChatThreadContent): string {
  const status = p.status ? badge(p.status.label, p.status.tone) : '';
  const small = c.arr.density === 'dense' ? ' data-size="sm"' : '';
  // Who it's with: a large avatar centred above (a picture-led language), or a small one beside the name
  const head =
    c.arr.media === 'leads'
      ? `<div class="m-stack" data-gap="${gap(c, 'tight')}" style="align-items: center; text-align: center"><span class="m-avatar" data-size="lg">${esc(p.initials)}</span>${titleEl(c, p.title, { cap: 'xl' })}${muted(esc(p.meta))}${status}</div>`
      : between(
          `<div class="m-cluster" data-gap="${gap(c, 'normal')}" style="flex-wrap: nowrap; min-inline-size: 0"><span class="m-avatar"${small}>${esc(p.initials)}</span><div class="m-stack" data-gap="0" style="min-inline-size: 0">${titleEl(c, p.title, { cap: 'lg', oneLine: true })}${line(esc(p.meta), true, 'xs')}</div></div>`,
          status,
        );
  // Bubbles, unless the language sets things apart with rules or space alone: then flat, with the person's own turns
  // tinted. Avatars sit beside the other person's messages only where pictures sit beside the words.
  const flat = c.arr.separation === 'space' || c.arr.separation === 'divider';
  const avatarsBeside = c.arr.media === 'beside';
  const msgs = p.messages.map((m, i) => {
    const last = p.messages[i + 1]?.from !== m.from;
    const mine = m.from === 'me';
    const withAvatar = avatarsBeside && !mine;
    const av = withAvatar
      ? `<div class="m-message-avatar" aria-hidden="true"${last ? '' : ' style="visibility: hidden"'}>${last ? esc(p.initials) : ''}</div>`
      : '';
    const cols = mine && !flat ? 'minmax(0, 1fr) 0' : '0 minmax(0, 1fr)';
    return `<article class="m-message" data-role="${mine ? 'user' : 'assistant'}"${withAvatar ? '' : ` style="grid-template-columns: ${cols}; column-gap: 0"`}>${av}<div class="m-message-body">${esc(m.text)}</div>${last ? `<div class="m-message-meta"><span>${esc(m.time)}</span></div>` : ''}</article>`;
  });
  const thread = `<div class="m-chat"${flat ? ' data-variant="flat"' : ''} role="log" aria-label="Conversation" style="max-inline-size: none">${msgs.join('')}</div>`;

  // The reply, by where the main action sits: a composer with Send at its foot, one line with Send beside it (a
  // word at the head, an icon in line), or quick replies centred above the line
  const input = `<input class="m-input" type="text" placeholder="${esc(p.placeholder)}" aria-label="Reply" style="flex: 1">`;
  const sendIcon = `<button type="button" class="m-button" data-variant="primary" data-icon-only${btnSize(c, -1)} aria-label="${esc(p.action)}">${icon(c, 'send-horizontal')}</button>`;
  const oneLine = (send: string, lead = '') =>
    `<div class="m-cluster" data-gap="${gap(c, 'tight')}" style="flex-wrap: nowrap">${lead}${input}${send}</div>`;
  const reply = (() => {
    switch (c.arr.primary) {
      case 'footer':
        return `<form class="m-composer"><textarea class="m-composer-input" rows="1" placeholder="${esc(p.placeholder)}" aria-label="Reply"></textarea><div class="m-composer-actions">${ghost(c, 'paperclip', 'Attach')}<span class="m-composer-spacer"></span>${btn(c, p.action, { variant: 'primary', icon: 'send-horizontal' })}</div></form>`;
      case 'centre':
        return `${p.suggestions?.length ? `<div class="m-cluster" data-gap="${gap(c, 'tight')}" style="justify-content: center">${p.suggestions.map((s) => `<button type="button" class="m-button" data-size="sm">${esc(s)}</button>`).join('')}</div>` : ''}${oneLine(sendIcon)}`;
      case 'header':
        return oneLine(btn(c, p.action, { variant: 'primary' }));
      default:
        return oneLine(sendIcon, ghost(c, 'paperclip', 'Attach'));
    }
  })();
  const divide = c.arr.separation === 'divider' ? RULE : '';
  return frame(
    c,
    `<div class="m-stack" data-gap="${gap(c, 'normal')}">${head}${divide}${thread}${divide}${reply}</div>`,
    maxWidth(c, true),
  );
}

// ---------------------------------------------------------------------------------------------
// A table: rows and columns, with a total

export function table(c: Ctx, p: TableContent): string {
  const cols = p.columns;
  const text = (v: TableCell | undefined) => (v === undefined ? '' : typeof v === 'string' ? v : v.label);
  const cell = (v: TableCell | undefined) =>
    v === undefined ? '' : typeof v === 'string' ? esc(v) : badge(v.label, v.tone);
  const minor = cols.map((col, i) => i > 0 && !!col.minor);
  const statusAt = cols.findIndex((_, i) => i > 0 && p.rows.some((r) => typeof r[i] === 'object'));
  const valueAt = cols.reduce((at, col, i) => (col.numeric ? i : at), -1);
  // Where room is short, the status folds under the value, so the table runs two columns, not three: a narrow
  // language, an airy one (its padding), or one that adds an action to every row
  const inline = c.arr.primary === 'inline';
  const fold = (c.arr.width === 'narrow' || c.arr.density === 'airy' || inline) && statusAt > 0 && valueAt > 0;
  const shown = cols.map((_, i) => i === 0 || !(minor[i] || (fold && i === statusAt)));
  const thead = `<thead><tr>${cols.map((col, i) => (shown[i] ? `<th scope="col"${col.numeric ? ' data-numeric' : ''}>${esc(col.label)}</th>` : '')).join('')}${inline ? '<th scope="col"><span class="m-sr-only">Actions</span></th>' : ''}</tr></thead>`;
  const row = (r: TableCell[]) =>
    `<tr>${cols
      .map((col, i) => {
        if (!shown[i]) return '';
        if (i === 0) {
          // Minor columns fold under the first cell, as one muted line that wraps between values, not inside one
          const sub = cols
            .map((_, j) => (minor[j] ? text(r[j]) : ''))
            .filter(Boolean)
            .map((v) => `<span style="white-space: nowrap">${esc(v)}</span>`)
            .join(' · ');
          return `<th scope="row"><div class="m-stack" data-gap="0"><span>${cell(r[0])}</span>${sub ? `<span style="color: var(--m-color-fg-muted); font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-regular)">${sub}</span>` : ''}</div></th>`;
        }
        if (fold && i === valueAt)
          return `<td data-numeric><div class="m-stack" data-gap="1" style="align-items: flex-end"><span>${cell(r[i])}</span>${cell(r[statusAt])}</div></td>`;
        return `<td${col.numeric ? ' data-numeric' : ''}>${cell(r[i])}</td>`;
      })
      .join(
        '',
      )}${inline ? `<td style="inline-size: 1%; padding-inline-start: 0">${ghost(c, 'ellipsis', `More for ${text(r[0])}`)}</td>` : ''}</tr>`;
  const shownCount = shown.filter(Boolean).length + (inline ? 1 : 0);
  const before = shown.slice(0, valueAt).filter(Boolean).length;
  const tfoot =
    p.total && valueAt > 0
      ? `<tfoot><tr><th scope="row" colspan="${before}" style="font-weight: var(--m-font-weight-semibold)">${esc(p.total.label)}</th><td data-numeric style="font-weight: var(--m-font-weight-semibold)">${esc(p.total.value)}</td>${shownCount - before - 1 > 0 ? `<td colspan="${shownCount - before - 1}"></td>` : ''}</tr></tfoot>`
      : '';
  // Density sets the cell padding; a language set apart by space alone draws no rules between rows
  const attrs = `${c.arr.density === 'dense' ? ' data-density="compact"' : ''}${c.arr.separation === 'tint' ? ' data-striped' : ''}`;
  const style = [
    c.arr.density === 'airy' ? '--m-table-cell-padding-y: var(--m-space-3)' : '',
    c.arr.separation === 'space' ? '--m-table-border-width: 0' : '',
  ]
    .filter(Boolean)
    .join('; ');
  const tbl = `<table class="m-table"${attrs}${style ? ` style="${style}"` : ''}><caption class="m-sr-only">${esc(p.title)}</caption>${thead}<tbody>${p.rows.map(row).join('')}</tbody>${tfoot}</table>`;
  const act = placed(c, p.action, 'plus');
  const head = between(
    titleEl(c, p.title, { cap: 'xl' }),
    act.head || (inline ? btn(c, p.action, { variant: 'ghost', icon: 'plus' }) : ''),
  );
  // A bordered language draws the table in its own outlined wrap; the others draw it inside their container
  if (c.arr.separation === 'border')
    return `<section class="m-stack" data-gap="${gap(c, 'normal')}" style="max-inline-size: ${maxWidth(c, true)}rem; margin-inline: auto">${head}<div class="m-table-wrap" role="region" aria-label="${esc(p.title)}">${tbl}</div>${act.foot}</section>`;
  return frame(c, `<div class="m-stack" data-gap="${gap(c, 'normal')}">${head}${tbl}${act.foot}</div>`, maxWidth(c, true));
}

// ---------------------------------------------------------------------------------------------
// A form: a short sign-up or booking

export function form(c: Ctx, p: FormContent): string {
  const size = { dense: ' data-size="sm"', regular: '', airy: ' data-size="lg"' }[c.arr.density];
  const label = (s: string) => `<span class="m-field-label">${esc(s)}</span>`;
  const field = (f: FormField, i: number): string => {
    switch (f.kind) {
      case 'check':
        return `<label class="m-field" data-layout="inline"><input class="m-checkbox" type="checkbox"${f.checked ? ' checked' : ''}> ${esc(f.label)}</label>`;
      case 'select':
        return `<label class="m-field">${label(f.label)}<select class="m-select"${size}>${f.options.map((o) => `<option${o === f.value ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
      case 'choice': {
        // A few options: a select where the language is dense, radios in a row where it's regular, buttons where
        // it's airy
        if (c.arr.density === 'dense') return field({ kind: 'select', label: f.label, options: f.options, value: f.value }, i);
        const name = `sc-${esc(c.a.id)}-${i}`;
        const opts =
          c.arr.density === 'regular'
            ? f.options
                .map(
                  (o) =>
                    `<label class="m-field" data-layout="inline"><input class="m-radio" type="radio" name="${name}"${o === f.value ? ' checked' : ''}> ${esc(o)}</label>`,
                )
                .join('')
            : f.options
                .map(
                  (o) =>
                    `<button type="button" class="m-button"${btnSize(c, -1)} aria-pressed="${o === f.value}" style="flex: 1; min-inline-size: 0${o === f.value ? '; border-color: var(--m-color-accent-default); background: var(--m-color-accent-subtle); color: var(--m-color-accent-text)' : ''}">${esc(o)}</button>`,
                )
                .join('');
        return `<fieldset class="m-field" style="border: 0; padding: 0; margin: 0"><legend class="m-field-label" style="padding: 0; margin-block-end: var(--m-space-2)">${esc(f.label)}</legend><div class="m-cluster" data-gap="${c.arr.density === 'regular' ? 4 : 1}" style="flex-wrap: nowrap">${opts}</div></fieldset>`;
      }
      default:
        return `<label class="m-field">${label(f.label)}<input class="m-input"${size} type="${f.kind}"${f.value ? ` value="${esc(f.value)}"` : ''}${f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : ''}>${f.hint ? `<span class="m-field-hint">${esc(f.hint)}</span>` : ''}</label>`;
    }
  };
  // Half fields pair up side by side, except in a narrow language or an airy one (its large controls need the width)
  const pair = c.arr.width !== 'narrow' && c.arr.density !== 'airy';
  const parts: string[] = [];
  for (let i = 0; i < p.fields.length; i++) {
    const f = p.fields[i];
    const next = p.fields[i + 1];
    if (pair && 'half' in f && f.half && next && 'half' in next && next.half) {
      parts.push(
        `<div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--m-space-${gap(c, 'normal')})">${field(f, i)}${field(next, i + 1)}</div>`,
      );
      i++;
    } else parts.push(field(f, i));
  }
  const fields = `<div class="m-stack" data-gap="${gap(c, 'normal')}">${parts.join('')}</div>`;
  const words = titled(c, p.title, p.intro ? esc(p.intro) : '', '2xl');
  const submit = (wide = false) => btn(c, p.action, { variant: 'primary', wide, bump: 0 });
  const second = (wide = false) => (p.secondary ? btn(c, p.secondary, { variant: 'ghost', wide, bump: 0 }) : '');
  const note = (centre = false) =>
    p.note ? `<span style="color: var(--m-color-fg-muted); font-size: var(--m-font-size-xs)${centre ? '; text-align: center' : ''}">${esc(p.note)}</span>` : '';
  let top = words;
  let foot: string;
  switch (c.arr.primary) {
    case 'header':
      // A sheet's bar: close at the start, the action at the end; the title under it
      top = `${between(p.secondary ? ghost(c, 'x', p.secondary) : '<span></span>', btn(c, p.action, { variant: 'primary' }))}${words}`;
      foot = note();
      break;
    case 'centre':
      foot = `<div class="m-stack" data-gap="${gap(c, 'tight')}" style="align-items: center">${submit()}${second()}${note(true)}</div>`;
      break;
    case 'inline':
      foot = `<div class="m-cluster" data-gap="${gap(c, 'tight')}" style="justify-content: flex-end">${second()}${submit()}</div>${note()}`;
      break;
    default:
      foot = `<div class="m-stack" data-gap="${gap(c, 'tight')}">${submit(true)}${second(true)}${note(true)}</div>`;
  }
  const divide = c.arr.separation === 'divider' ? RULE : '';
  return frame(
    c,
    `<form class="m-stack" data-gap="${gap(c, 'loose')}">${`<div class="m-stack" data-gap="${gap(c, 'normal')}">${top}</div>`}${divide}${fields}${divide}${foot}</form>`,
    maxWidth(c),
  );
}

// ---------------------------------------------------------------------------------------------
// A map: places nearby, one place's card open

/** Where the pins sit on the ground, in per cent; the same for every language. */
const SPOTS = [
  [30, 40],
  [66, 28],
  [54, 62],
  [80, 56],
  [18, 70],
  [44, 20],
] as const;

export function map(c: Ctx, p: MapContent): string {
  const sel = Math.max(0, Math.min(p.places.length - 1, p.selected));
  const place = p.places[sel];
  const numbered = c.arr.media === 'thumb';
  const pin = (i: number) => {
    const [x, y] = SPOTS[i % SPOTS.length];
    const on = i === sel;
    const dot = on
      ? `<span style="display: grid; place-items: center; inline-size: 2rem; block-size: 2rem; border-radius: var(--m-radius-full); background: var(--m-color-accent-default); color: var(--m-color-accent-fg); box-shadow: var(--m-shadow-md)">${numbered ? `<b style="font-size: var(--m-font-size-sm)">${i + 1}</b>` : icon(c, 'map-pin', 16)}</span>`
      : `<span style="display: grid; place-items: center; inline-size: 1.5rem; block-size: 1.5rem; border-radius: var(--m-radius-full); background: var(--m-color-bg-surface); color: var(--m-color-fg-default); border: 2px solid var(--m-color-accent-default); box-shadow: var(--m-shadow-sm); font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-semibold)">${numbered ? i + 1 : ''}</span>`;
    return `<span aria-hidden="true" style="position: absolute; left: ${x}%; top: ${y}%; transform: translate(-50%, -50%)">${dot}</span>`;
  };
  const you = `<span aria-label="You are here" role="img" style="position: absolute; left: 42%; top: 50%; transform: translate(-50%, -50%); inline-size: 1.25rem; block-size: 1.25rem; border-radius: var(--m-radius-full); background: var(--m-color-info-solid); border: var(--m-space-1) solid var(--m-color-info-bg)"></span>`;
  const ground = (ratio: string, overlay = '') =>
    `<div style="position: relative; overflow: hidden; aspect-ratio: ${ratio}; border-radius: var(--m-radius-container); border: 1px solid var(--m-color-border-muted)">${mapGround()}${you}${p.places.map((_, i) => pin(i)).join('')}${overlay}</div>`;
  const search = p.query
    ? `<input class="m-input"${c.arr.density === 'dense' ? ' data-size="sm"' : ''} type="search" value="${esc(p.query)}" aria-label="Search places">`
    : '';
  const facts = (pl: MapContent['places'][number]) =>
    `<span class="m-cluster" data-gap="2" style="color: var(--m-color-fg-muted); font-size: var(--m-font-size-sm); font-variant-numeric: tabular-nums">${pl.rating ? `<span class="m-cluster" data-gap="1">${icon(c, 'star', 14)}${esc(pl.rating)}</span>` : ''}<span>${esc(pl.distance)}</span></span>`;
  const act = placed(c, p.action, 'navigation');
  const g = gap(c, 'normal');

  if (c.arr.media === 'thumb') {
    // A list with a strip of map above it: numbered pins, numbered rows
    const row = (pl: MapContent['places'][number], i: number) => {
      const n = `<span style="display: grid; place-items: center; flex-shrink: 0; inline-size: 1.75rem; block-size: 1.75rem; border-radius: var(--m-radius-full); font-size: var(--m-font-size-xs); font-weight: var(--m-font-weight-semibold); ${i === sel ? 'background: var(--m-color-accent-default); color: var(--m-color-accent-fg)' : 'border: 1px solid var(--m-color-border-default)'}">${i + 1}</span>`;
      const end =
        c.arr.primary === 'inline'
          ? ghost(c, 'navigation', `${p.action} to ${pl.name}`)
          : pl.status
            ? badge(pl.status.label, pl.status.tone)
            : '';
      return `<div class="m-cluster" data-gap="${g}" style="flex-wrap: nowrap; align-items: center">${n}<div class="m-stack" data-gap="0" style="flex: 1; min-inline-size: 0"><span style="${STRONG}; ${ONE_LINE}">${esc(pl.name)}</span>${line(esc(pl.meta), true)}${facts(pl)}</div>${end}</div>`;
    };
    const head = between(titleEl(c, p.title, { cap: 'xl' }), act.head);
    return shell(
      c,
      `<div class="m-stack" data-gap="${g}">${head}${search}${ground(c.arr.width === 'narrow' ? '16 / 9' : '2 / 1')}${rowsBy(c, p.places.map(row))}${act.foot}</div>`,
      maxWidth(c, true),
    );
  }

  // The open place's card: its name, facts and status; the action by where the language puts it
  const go = (wide = false) => btn(c, p.action, { variant: 'primary', icon: 'navigation', wide });
  const top = between(
    `<div class="m-stack" data-gap="0" style="min-inline-size: 0">${titleEl(c, place.name, { cap: 'lg' })}${line(esc(place.meta), true)}</div>`,
    c.arr.primary === 'header' ? go() : ghost(c, 'bookmark', 'Save'),
    'flex-start',
  );
  const status = place.status ? badge(place.status.label, place.status.tone) : '';
  const info =
    c.arr.primary === 'inline'
      ? between(`<span class="m-cluster" data-gap="2">${facts(place)}${status}</span>`, go())
      : `<span class="m-cluster" data-gap="2">${facts(place)}${status}</span>`;
  const foot =
    c.arr.primary === 'footer'
      ? go(true)
      : c.arr.primary === 'centre'
        ? `<div class="m-cluster" style="justify-content: center">${btn(c, p.action, { icon: 'navigation' })}</div>`
        : '';
  const placeCard = `<div class="m-stack" data-gap="${gap(c, 'tight')}">${top}${info}${foot}</div>`;
  const head = `<div class="m-stack" data-gap="${gap(c, 'tight')}">${titleEl(c, p.title, { cap: 'xl' })}${search}</div>`;
  if (c.arr.media === 'beside') {
    // The card floats over the map, at its foot
    const overlay = `<div class="m-card" data-size="sm" style="position: absolute; inset-inline: var(--m-space-3); inset-block-end: var(--m-space-3); box-shadow: var(--m-shadow-md)">${placeCard}</div>`;
    return frame(c, `<div class="m-stack" data-gap="${g}">${head}${ground('4 / 5', overlay)}</div>`, maxWidth(c, true));
  }
  // The map leads, full width, and the card follows
  return frame(
    c,
    `<div class="m-stack" data-gap="${g}">${head}${ground('4 / 3')}${placeCard}${muted(`${p.places.length - 1} more nearby`, 'xs')}</div>`,
    maxWidth(c, true),
  );
}

// ---------------------------------------------------------------------------------------------
// A feed item: one post, with a picture and reactions

export function feed_item(c: Ctx, p: FeedItemContent): string {
  const pic = p.picture === false ? '' : (p.picture ?? artwork(1));
  const avatar = `<span class="m-avatar"${c.arr.density === 'dense' ? ' data-size="sm"' : ''}>${esc(p.initials)}</span>`;
  const who = `<div class="m-cluster" data-gap="${gap(c, 'tight')}" style="flex-wrap: nowrap; min-inline-size: 0">${avatar}<div class="m-stack" data-gap="0" style="min-inline-size: 0"><span style="font-weight: var(--m-font-weight-semibold); ${ONE_LINE}">${esc(p.author)}</span>${line(esc(p.meta), true, 'xs')}</div></div>`;
  const author = between(
    who,
    c.arr.primary === 'header' ? btn(c, p.action, { variant: 'primary', icon: 'message-circle' }) : ghost(c, 'ellipsis', 'More'),
  );
  const tag = p.tag ? `<div>${badge(p.tag.label, p.tag.tone)}</div>` : '';
  const words = `<div class="m-stack" data-gap="${gap(c, 'tight')}" style="flex: 1; min-inline-size: 0">${tag}${p.title ? titleEl(c, p.title, { cap: c.arr.media === 'beside' ? 'xl' : '2xl' }) : ''}<p style="margin: 0">${esc(p.text)}</p></div>`;
  const react = (name: string, n: string, label: string) =>
    `<button type="button" class="m-button" data-variant="ghost"${btnSize(c, -1)} aria-label="${esc(`${n} ${label}`)}">${icon(c, name)} ${esc(n)}</button>`;
  const reactions = between(
    `<div class="m-cluster" data-gap="1" style="flex-wrap: nowrap">${react('heart', p.likes, 'likes')}${react('message-circle', p.comments, 'comments')}${ghost(c, 'share-2', 'Share')}</div>`,
    c.arr.primary === 'inline' ? btn(c, p.action, { variant: 'primary' }) : '',
  );
  const foot =
    c.arr.primary === 'footer'
      ? btn(c, p.action, { variant: 'primary', icon: 'message-circle', wide: true })
      : c.arr.primary === 'centre'
        ? `<div class="m-cluster" style="justify-content: center">${btn(c, p.action, { icon: 'message-circle' })}</div>`
        : '';
  const img = (style: string) => `<img src="${pic}" alt="" style="display: block; object-fit: cover; ${style}">`;
  const divide = c.arr.separation === 'divider' ? RULE : '';
  let body: string;
  if (pic && c.arr.media === 'leads') {
    // The picture leads, full width, between who and what
    body = `${author}${img('inline-size: 100%; aspect-ratio: 4 / 3; border-radius: var(--m-radius-md)')}${reactions}${words}${foot}`;
  } else if (pic && c.arr.media === 'beside') {
    body = `${author}<div class="m-cluster" data-gap="${gap(c, 'normal')}" style="flex-wrap: nowrap; align-items: flex-start">${words}${img('inline-size: 6rem; block-size: 6rem; flex-shrink: 0; border-radius: var(--m-radius-md)')}</div>${divide}${reactions}${foot}`;
  } else {
    // A thumbnail under the words
    body = `${author}${words}${pic ? img('inline-size: 5rem; block-size: 5rem; border-radius: var(--m-radius-sm)') : ''}${divide}${reactions}${foot}`;
  }
  return frame(c, `<div class="m-stack" data-gap="${gap(c, 'normal')}">${body}</div>`, maxWidth(c, c.arr.media === 'beside'));
}

// ---------------------------------------------------------------------------------------------
// A dashboard tile: one number, its change, its trend

/** A sparkline in the accent, stretched to its box: a line and a faint fill under it. */
function sparkline(c: Ctx, series: number[], height: string): string {
  const pts = series.length > 1 ? series : [0, 0];
  const lo = Math.min(...pts);
  const hi = Math.max(...pts);
  const xy = pts.map((v, i) => [(100 * i) / (pts.length - 1), 30 - (hi === lo ? 14 : (28 * (v - lo)) / (hi - lo))]);
  const d = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return `<div style="block-size: ${height}; color: var(--m-color-accent-default)"><svg viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true" style="display: block; inline-size: 100%; block-size: 100%"><path d="${d} L100 32 L0 32Z" fill="currentColor" opacity="0.12"/><path d="${d}" fill="none" stroke="currentColor" stroke-width="${c.a.icons.stroke}" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg></div>`;
}

export function dashboard_tile(c: Ctx, p: DashboardTileContent): string {
  const g = gap(c, 'normal');
  const beside = c.arr.media === 'beside';
  // The value is the tile's title: its size follows the language's title step
  const step = { quiet: '2xl', medium: '3xl', loud: '4xl', display: '4xl' }[c.arr.title];
  const valueSize = beside && step === '4xl' ? '3xl' : step;
  const display = c.arr.title === 'display' ? '; font-family: var(--m-font-family-display)' : '';
  // Capped by the tile's own width (a container unit), so a loud language's figure still fits a phone
  const value = `<span style="font-size: min(var(--m-font-size-${valueSize}), 16cqi); font-weight: var(--m-font-weight-semibold); line-height: 1.1; font-variant-numeric: tabular-nums${display}">${esc(p.value)}</span>`;
  const change = `<span class="m-cluster" data-gap="2"><span class="m-badge"${p.change.tone === 'neutral' ? '' : ` data-tone="${p.change.tone}"`}>${icon(c, p.change.direction === 'up' ? 'trending-up' : 'trending-down', 14)} ${esc(p.change.label)}</span>${muted(esc(p.period), 'xs')}</span>`;
  const act = placed(c, p.action, 'arrow-up-right');
  const label = `<span style="color: var(--m-color-fg-muted); font-size: var(--m-font-size-sm); ${STRONG}">${esc(p.label)}</span>`;
  const head = between(
    label,
    act.head ? btn(c, p.action, { variant: 'primary', bump: -1 }) : c.arr.primary === 'inline' ? ghost(c, 'arrow-up-right', p.action) : '',
  );
  // Where the trend goes: it leads, large; it sits beside the number; or a short strip under it
  const figure = (() => {
    if (c.arr.media === 'leads')
      return `${sparkline(c, p.series, '5rem')}<div class="m-stack" data-gap="1">${value}${change}</div>`;
    if (beside)
      return `<div class="m-cluster" data-gap="${g}" style="flex-wrap: nowrap; align-items: flex-end"><div class="m-stack" data-gap="1" style="flex-shrink: 0">${value}${change}</div><div style="flex: 1; min-inline-size: 0">${sparkline(c, p.series, '3.5rem')}</div></div>`;
    return `<div class="m-stack" data-gap="1">${value}${change}</div>${sparkline(c, p.series, '2.5rem')}`;
  })();
  // What it's made of: one line where the language is dense, rules between rows where regular, bars where airy
  const parts = p.breakdown ?? [];
  const breakdown = !parts.length
    ? ''
    : c.arr.density === 'dense'
      ? `<div class="m-cluster" data-gap="3" style="font-size: var(--m-font-size-sm)">${parts.map((b) => `<span>${muted(esc(b.label))} <span style="${STRONG}; font-variant-numeric: tabular-nums">${esc(b.value)}</span></span>`).join('')}</div>`
      : c.arr.density === 'regular'
        ? `<div class="m-stack" data-gap="0">${parts.map((b) => `<div style="padding-block: var(--m-space-2); border-block-start: 1px solid var(--m-color-border-muted)">${between(muted(esc(b.label)), `<span style="${STRONG}; font-variant-numeric: tabular-nums; font-size: var(--m-font-size-sm)">${esc(b.value)}</span>`)}</div>`).join('')}</div>`
        : `<div class="m-stack" data-gap="${gap(c, 'tight')}">${parts.map((b) => `<div class="m-stack" data-gap="1">${between(muted(esc(b.label)), `<span style="${STRONG}; font-variant-numeric: tabular-nums; font-size: var(--m-font-size-sm)">${esc(b.value)}</span>`)}${b.share !== undefined ? `<progress class="m-progress" data-size="sm" value="${pct(b.share)}" max="100" aria-label="${esc(b.label)}">${pct(b.share)}%</progress>` : ''}</div>`).join('')}</div>`;
  return frame(
    c,
    `<div class="m-stack" data-gap="${g}" style="container-type: inline-size">${head}${figure}${breakdown}${act.foot}</div>`,
    maxWidth(c, beside),
  );
}
