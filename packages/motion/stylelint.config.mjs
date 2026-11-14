/**
 * Motion CSS rules: tokens only. No colour literals anywhere (fallbacks are other tokens,
 * currentcolor or transparent), no raw lengths for radius. Custom properties are contract tokens
 * (`--m-*`), private to a rule (`--_*`), or one of the few the markup sets (`--i`, `--lines`).
 */
const colorFunctions = ['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'color'];

export default {
  extends: ['stylelint-config-standard'],
  rules: {
    'color-no-hex': true,
    'color-named': 'never',
    'function-disallowed-list': colorFunctions,
    'custom-property-pattern': ['^(m-[a-z0-9-]+|_[a-z0-9-]+|i|lines)$', { message: 'Use --m-* tokens, --_* private properties, --i or --lines' }],
    'selector-class-pattern': ['^m-[a-z0-9-]+$', { message: 'Classes are prefixed m-' }],
    'keyframes-name-pattern': ['^m-[a-z0-9-]+$', { message: 'Keyframes are prefixed m-' }],
    'declaration-empty-line-before': null,
    'custom-property-empty-line-before': null,
    'no-descending-specificity': null,
    'selector-no-vendor-prefix': null,
    'property-no-vendor-prefix': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'declaration-property-value-disallowed-list': [
      { '/^border(-.*)?-radius$/': ['/\\d(px|rem|em)/'] },
      { message: 'Use a token for radius' },
    ],
  },
};
