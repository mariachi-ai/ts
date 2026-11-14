/**
 * The parts every showcase is drawn from: the container a language sets things apart with, its spacing and title
 * steps, its icons, badges and buttons. Library classes and tokens only, so the paint comes from the kit.
 */
import { lucideSvg } from '../archetypes/lucide';
import type { Archetype } from '../archetypes/types';
import type { Arrangement, Tone } from './types';

export interface Ctx {
  a: Archetype;
  arr: Arrangement;
}

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** An icon in the language's stroke, at its control size unless given. */
export const icon = (c: Ctx, name: string, size?: number, label?: string) =>
  lucideSvg(name, size ?? c.a.icons.size.control, c.a.icons.stroke, label);

/** A space step for a tight, normal or loose gap, by the language's density. */
export function gap(c: Ctx, step: 'tight' | 'normal' | 'loose'): number {
  const steps = {
    dense: { tight: 1, normal: 2, loose: 3 },
    regular: { tight: 2, normal: 3, loose: 5 },
    airy: { tight: 3, normal: 4, loose: 6 },
  } as const;
  return steps[c.arr.density][step];
}

/** The title's size step: in a component, and as a screen's heading. */
export const titleSize = (c: Ctx, where: 'component' | 'screen' = 'component') =>
  (where === 'component'
    ? { quiet: 'md', medium: 'lg', loud: 'xl', display: '3xl' }
    : { quiet: 'lg', medium: 'xl', loud: '2xl', display: '4xl' })[c.arr.title];

/** A button size attribute by density (dense controls are small, airy ones large). */
export const btnSize = (c: Ctx, bump = 0) => {
  const order = ['sm', 'md', 'lg'] as const;
  const i = Math.max(0, Math.min(2, { dense: 0, regular: 1, airy: 2 }[c.arr.density] + bump));
  return order[i] === 'md' ? '' : ` data-size="${order[i]}"`;
};

export const badge = (label: string, tone: Tone = 'neutral') =>
  `<span class="m-badge"${tone === 'neutral' ? '' : ` data-tone="${tone}"`}>${esc(label)}</span>`;

export const ghost = (c: Ctx, name: string, label: string) =>
  `<button type="button" class="m-button" data-variant="ghost" data-icon-only${btnSize(c)} aria-label="${esc(label)}">${icon(c, name)}</button>`;

/** How wide a component runs, in rem, by the language's width and whether it lays out across (a picture beside). */
export const maxWidth = (c: Ctx, across = false) =>
  ({ narrow: 18, regular: 21, wide: 25 })[c.arr.width] + (across ? 7 : 0);

/**
 * The container, as the language sets things apart: a bordered card, a raised card, a tinted panel, rules above and
 * below, or nothing but space.
 */
export function frame(c: Ctx, inner: string, widthRem: number, extraStyle = ''): string {
  const size = { dense: ' data-size="sm"', regular: '', airy: ' data-size="lg"' }[c.arr.density];
  const w = `max-inline-size: ${widthRem}rem; margin-inline: auto; ${extraStyle}`;
  switch (c.arr.separation) {
    case 'border':
      return `<article class="m-card" data-variant="outline"${size} style="${w}">${inner}</article>`;
    case 'shadow':
      return `<article class="m-card"${size} style="box-shadow: var(--m-shadow-md); ${w}">${inner}</article>`;
    case 'tint':
      return `<article class="m-card" data-variant="sunken"${size} style="${w}">${inner}</article>`;
    case 'divider':
      return `<article style="border-block: 1px solid var(--m-color-border-default); padding-block: var(--m-space-${gap(c, 'loose')}); ${w}">${inner}</article>`;
    default:
      return `<article style="${w}">${inner}</article>`;
  }
}

/** A neutral artwork for a cover or picture the content didn't give: shapes in muted tones, the same in every language. */
export function artwork(seed = 0): string {
  const hues = [
    ['#16324a', '#d9733b', '#f4c27a'],
    ['#2c3a2f', '#8aa37b', '#e8d8a8'],
    ['#3b2340', '#c0567a', '#f2b8a0'],
    ['#1f2b3a', '#5c7fa8', '#cfe0ee'],
  ][seed % 4];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hues[0]}"/><stop offset="1" stop-color="${hues[1]}"/></linearGradient></defs><rect width="200" height="200" fill="url(#g)"/><circle cx="132" cy="78" r="38" fill="${hues[2]}" opacity="0.9"/><path d="M0 150 C40 130 70 165 110 148 S170 128 200 140 V200 H0Z" fill="${hues[0]}" opacity="0.85"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** A picture at a size (rem, or 100% for one that leads), in the language's container or small radius. */
export const picture = (src: string, size: number | 'full', radius: 'container' | 'md' | 'sm', alt = '') =>
  `<img src="${src}" alt="${esc(alt)}" style="display: block; ${size === 'full' ? 'inline-size: 100%' : `inline-size: ${size}rem; block-size: ${size}rem; flex-shrink: 0`}; aspect-ratio: 1; object-fit: cover; border-radius: var(--m-radius-${radius})">`;

export const muted = (s: string, size = 'sm') =>
  `<span style="color: var(--m-color-fg-muted); font-size: var(--m-font-size-${size})">${s}</span>`;

export const avatars = (people: string[]) =>
  people.length
    ? `<div class="m-avatar-group">${people.map((p) => `<span class="m-avatar" data-size="sm">${esc(p)}</span>`).join('')}</div>`
    : '';
