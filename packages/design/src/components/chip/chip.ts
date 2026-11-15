import { defineComponent } from '../../contract/component';
import { ref, t } from '../../contract/tokens';

export const chip = defineComponent({
  name: 'chip',
  title: 'Chip',
  category: 'actions',
  description: 'A compact pill to filter, toggle or pick, with hover, pressed, focus, selected and disabled states.',
  useWhen: 'Filters above a list, quick replies, a choice among a few short options, or tags a person can remove. Use a badge for status that is not interactive.',
  anatomy: {
    '.m-chip': 'On a <button> (aria-pressed for a toggle), an <a>, or a <label> wrapping a checkbox or radio',
    '[aria-pressed="true"] / :has(:checked)': 'Selected',
    '.m-chip-remove': 'Optional trailing remove button inside a static chip (<span class="m-chip">)',
    '[data-size]': 'sm | md (default)',
    ':disabled / [aria-disabled="true"]': 'Disabled',
  },
  tokens: {
    height: {
      sm: t.length('Small height', '1.75rem'),
      md: t.length('Default height', ref('control.height.sm')),
    },
    paddingX: t.length('Horizontal padding', ref('space.3')),
    gap: t.length('Space between an icon and the text', ref('space.1')),
    radius: t.length('Corner radius', ref('radius.full')),
    borderWidth: t.length('Border width', ref('borderWidth.thin')),
    fontSize: t.length('Text size', ref('font.size.sm')),
    fontWeight: t.fontWeight('Text weight', ref('font.weight.medium')),
    bg: t.color('Background', ref('color.bg.surface')),
    fg: t.color('Text', ref('color.fg.default')),
    border: t.color('Border', ref('color.border.default')),
    hoverBg: t.color('Background on hover', ref('color.bg.sunken')),
    activeBg: t.color('Background when pressed', ref('color.border.muted')),
    selectedBg: t.color('Selected background', ref('color.accent.subtle')),
    selectedFg: t.color('Selected text', ref('color.accent.text')),
    selectedBorder: t.color('Selected border', ref('color.accent.default')),
  },
  contrast: [
    { fg: 'fg', bg: 'bg', min: 4.5 },
    { fg: 'fg', bg: 'hoverBg', min: 4.5 },
    { fg: 'selectedFg', bg: 'selectedBg', min: 4.5 },
  ],
  a11y: [
    'A toggle chip is a <button aria-pressed>; a single choice among chips is a group of radios in labels, so arrow keys work.',
    'Selected chips must differ by more than colour: the border, a check icon or the weight.',
    'Give a remove button an aria-label that names the chip ("Remove Design").',
  ],
});
