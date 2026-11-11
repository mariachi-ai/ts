import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

const slate = (l: number, c = 0.02, a = 1) => (a === 1 ? `oklch(${l} ${c} 255)` : `oklch(${l} ${c} 255 / ${a})`);

/**
 * Calm trust: cool slate, one deep blue, quiet surfaces and exact numbers. For money, health,
 * insurance and anything where people need to feel safe. The first of the design archetypes
 * (see `src/archetypes/calm-trust/DESIGN.md`); built on minimal, changing only what differs.
 */
export const calmTrust = extendTheme(minimal, {
  name: 'calm-trust',
  label: 'Calm trust',
  description:
    'Cool slate, one deep blue, quiet surfaces and exact, tabular figures. For money, health and anything where people need to feel safe.',
  tokens: {
    color: {
      bg: {
        canvas: { light: 'oklch(0.985 0.004 255)', dark: 'oklch(0.17 0.012 255)' },
        surface: { light: 'oklch(1 0 0)', dark: 'oklch(0.205 0.014 255)' },
        raised: { light: 'oklch(1 0 0)', dark: 'oklch(0.24 0.016 255)' },
        sunken: { light: 'oklch(0.965 0.006 255)', dark: 'oklch(0.15 0.01 255)' },
        overlay: { light: slate(0.24, 0.02, 0.42), dark: 'oklch(0 0 0 / 0.6)' },
        inverse: { light: slate(0.24), dark: 'oklch(0.95 0.006 255)' },
      },
      fg: {
        default: { light: slate(0.24), dark: 'oklch(0.95 0.006 255)' },
        muted: { light: slate(0.46), dark: 'oklch(0.76 0.015 255)' },
        subtle: { light: slate(0.52, 0.018), dark: 'oklch(0.68 0.015 255)' },
        inverse: { light: 'oklch(0.97 0.004 255)', dark: slate(0.2) },
      },
      border: {
        default: { light: 'oklch(0.91 0.008 255)', dark: 'oklch(0.31 0.015 255)' },
        muted: { light: 'oklch(0.945 0.006 255)', dark: 'oklch(0.26 0.014 255)' },
        strong: { light: slate(0.6, 0.016), dark: 'oklch(0.55 0.016 255)' },
        focus: { light: 'oklch(0.52 0.14 255)', dark: 'oklch(0.72 0.12 245)' },
      },
      accent: {
        default: { light: 'oklch(0.48 0.13 255)', dark: 'oklch(0.68 0.12 245)' },
        hover: { light: 'oklch(0.43 0.13 255)', dark: 'oklch(0.73 0.11 245)' },
        active: { light: 'oklch(0.39 0.12 255)', dark: 'oklch(0.77 0.1 245)' },
        subtle: { light: 'oklch(0.955 0.02 255)', dark: 'oklch(0.29 0.05 250)' },
        fg: { light: 'oklch(1 0 0)', dark: 'oklch(0.17 0.02 255)' },
        text: { light: 'oklch(0.46 0.13 255)', dark: 'oklch(0.8 0.09 245)' },
      },
      // Green and red mean gained and lost, never decoration (DESIGN.md).
      success: {
        bg: { light: 'oklch(0.96 0.03 165)', dark: 'oklch(0.26 0.04 165)' },
        fg: { light: 'oklch(0.4 0.09 165)', dark: 'oklch(0.85 0.09 165)' },
        border: { light: 'oklch(0.85 0.06 165)', dark: 'oklch(0.42 0.06 165)' },
        solid: { light: 'oklch(0.5 0.11 165)', dark: 'oklch(0.7 0.11 165)' },
        onSolid: { light: 'oklch(0.99 0 0)', dark: 'oklch(0.17 0.02 165)' },
      },
      danger: {
        bg: { light: 'oklch(0.96 0.025 25)', dark: 'oklch(0.27 0.055 25)' },
        fg: { light: 'oklch(0.45 0.16 25)', dark: 'oklch(0.85 0.08 25)' },
        border: { light: 'oklch(0.85 0.07 25)', dark: 'oklch(0.44 0.09 25)' },
        solid: { light: 'oklch(0.52 0.17 25)', dark: 'oklch(0.7 0.15 25)' },
        onSolid: { light: 'oklch(0.99 0 0)', dark: 'oklch(0.17 0.02 25)' },
      },
      info: {
        bg: { light: 'oklch(0.96 0.02 245)', dark: 'oklch(0.27 0.04 245)' },
        fg: { light: 'oklch(0.42 0.11 250)', dark: 'oklch(0.85 0.07 245)' },
        border: { light: 'oklch(0.85 0.05 245)', dark: 'oklch(0.44 0.06 245)' },
        solid: { light: 'oklch(0.48 0.13 255)', dark: 'oklch(0.68 0.12 245)' },
        onSolid: { light: 'oklch(0.99 0 0)', dark: 'oklch(0.17 0.02 255)' },
      },
      selection: {
        bg: { light: 'oklch(0.89 0.05 255)', dark: 'oklch(0.4 0.08 250)' },
        fg: { light: slate(0.2), dark: 'oklch(0.98 0 0)' },
      },
    },
    font: {
      family: {
        sans: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        // Account numbers, IDs and references
        mono: '"Geist Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
      },
      heading: { weight: '600', tracking: '-0.015em' },
    },
    radius: { sm: '4px', md: '8px', lg: '12px' },
    shadow: {
      sm: { light: `0 1px 2px ${slate(0.24, 0.02, 0.06)}`, dark: 'none' },
      md: { light: `0 2px 8px ${slate(0.24, 0.02, 0.06)}, 0 1px 2px ${slate(0.24, 0.02, 0.04)}`, dark: 'none' },
      lg: {
        light: `0 4px 12px ${slate(0.24, 0.02, 0.08)}, 0 12px 32px ${slate(0.24, 0.02, 0.08)}`,
        dark: '0 12px 32px oklch(0 0 0 / 0.45)',
      },
      overlay: { light: `0 16px 48px ${slate(0.24, 0.02, 0.16)}`, dark: '0 16px 48px oklch(0 0 0 / 0.5)' },
    },
    motion: {
      duration: { fast: '120ms', normal: '180ms', slow: '260ms' },
      // No overshoot, ever
      easing: { emphasized: 'cubic-bezier(0.2, 0, 0, 1)' },
    },
  },
  components: {
    // Structure comes from hairline borders; a shadow only says "this whole card is clickable".
    card: { shadow: 'none', hoverShadow: 'var(--m-shadow-sm)' },
    button: { shadow: 'none' },
    table: {
      headerBg: 'var(--m-color-bg-sunken)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      headerFontSize: 'var(--m-font-size-xs)',
      stripeBg: 'var(--m-color-bg-surface)',
    },
  },
});
