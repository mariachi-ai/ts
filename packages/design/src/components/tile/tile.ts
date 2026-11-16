import { defineComponent } from '../../contract/component';
import { ref, t } from '../../contract/tokens';

export const tile = defineComponent({
  name: 'tile',
  title: 'Icon tile',
  category: 'data',
  description: 'An icon on a small tinted square: the leading mark of a row, a category, an app or a feature, in three sizes and six tones.',
  useWhen: 'Giving a row, a category or a feature a recognisable mark. Use an avatar for people and a badge for status text.',
  anatomy: {
    '.m-tile': 'On a <span> holding one icon (an <svg>, an emoji or a letter); aria-hidden when a label sits beside it',
    '[data-size]': 'sm | md (default) | lg',
    '[data-tone]': 'accent (default) | neutral | success | warning | danger | info',
  },
  tokens: {
    size: {
      sm: t.length('Small tile', '1.5rem'),
      md: t.length('Default tile', '2rem'),
      lg: t.length('Large tile', '2.5rem'),
    },
    iconSize: t.length('Icon size, as a share of the tile', '50%'),
    radius: t.length('Corner radius', ref('radius.md')),
    bg: t.color('Accent tile background', ref('color.accent.subtle')),
    fg: t.color('Accent tile icon colour', ref('color.accent.text')),
    neutralBg: t.color('Neutral tile background', ref('color.bg.sunken')),
    neutralFg: t.color('Neutral tile icon colour', ref('color.fg.muted')),
    fontSize: t.length('Size of an emoji or letter in the tile', ref('font.size.sm')),
    fontWeight: t.fontWeight('Weight of a letter in the tile', ref('font.weight.semibold')),
  },
  contrast: [
    { fg: 'fg', bg: 'bg', min: 3 },
    { fg: 'neutralFg', bg: 'neutralBg', min: 3 },
  ],
  a11y: [
    'A tile is decorative next to its label: aria-hidden="true". Alone, give it role="img" and an aria-label.',
    'Don\'t let the tone be the only sign of a status; say it in the text beside it.',
  ],
});
