import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Halcyon: a quiet, airy money interface. Ink-violet text on white, one blue-violet accent, light
 * type weights, pill-shaped actions, ring-shadowed cards, hairline rows and figures with small
 * raised cents. Category: calm fintech. The values are measured, not invented (see DESIGN.md).
 */
export const halcyon = extendTheme(minimal, {
  name: 'halcyon',
  label: 'Halcyon',
  description:
    'Airy and exact: ink-violet on white, a blue-violet accent, light type, pill actions, ring-shadowed cards and hairline rows.',
  tokens: {
    color: {
      bg: {
        canvas: { light: '#ffffff', dark: '#171721' },
        surface: { light: '#ffffff', dark: '#1e1e2a' },
        raised: { light: '#ffffff', dark: '#272735' },
        // The sidebar and quiet panels
        sunken: { light: '#fbfcfd', dark: '#13131b' },
        overlay: { light: 'rgb(30 30 42 / 0.4)', dark: 'rgb(0 0 0 / 0.6)' },
        inverse: { light: '#272735', dark: '#ededf3' },
      },
      fg: {
        default: { light: '#1e1e2a', dark: '#ededf3' },
        muted: { light: '#535461', dark: '#c3c3cc' },
        subtle: { light: '#70707d', dark: '#9d9da8' },
        inverse: { light: '#ededf3', dark: '#1e1e2a' },
      },
      border: {
        // Hairlines: the neutral (112 115 147) at 16% and 10% over the surface
        default: { light: '#e8e9ef', dark: '#3b3c4b' },
        muted: { light: '#f1f1f4', dark: '#2c2c3a' },
        strong: { light: '#8a8b9a', dark: '#7d7e90' },
        focus: { light: '#5266eb', dark: '#a7b6f8' },
      },
      accent: {
        default: { light: '#5266eb', dark: '#5266eb' },
        hover: { light: '#465bd1', dark: '#465bd1' },
        active: { light: '#3c4fbb', dark: '#3c4fbb' },
        subtle: { light: '#eef0fd', dark: '#262a4d' },
        fg: '#ffffff',
        text: { light: '#465bd1', dark: '#a7b6f8' },
      },
      success: {
        bg: { light: '#e6f1ec', dark: '#14302a' },
        fg: { light: '#036e43', dark: '#7fd3ab' },
        border: { light: '#bfdccd', dark: '#24513f' },
        solid: { light: '#036e43', dark: '#2f9e6c' },
        onSolid: { light: '#ffffff', dark: '#0d1f17' },
      },
      warning: {
        bg: { light: '#fbf3e4', dark: '#33291a' },
        fg: { light: '#7a4d00', dark: '#f0c77a' },
        border: { light: '#efd8ab', dark: '#5a4524' },
        solid: { light: '#c98a12', dark: '#d9a03a' },
        onSolid: { light: '#1e1e2a', dark: '#1e1e2a' },
      },
      // Lost or failed is a deep magenta, not a red
      danger: {
        bg: { light: '#fbeaf1', dark: '#3a1a2a' },
        fg: { light: '#b0175f', dark: '#f39cc3' },
        border: { light: '#f1c9da', dark: '#6a2a48' },
        solid: { light: '#b0175f', dark: '#d0327a' },
        onSolid: { light: '#ffffff', dark: '#ffffff' },
      },
      info: {
        bg: { light: '#eef0fd', dark: '#262a4d' },
        fg: { light: '#3c4fbb', dark: '#c3cdfa' },
        border: { light: '#d3d9fa', dark: '#3a4280' },
        solid: { light: '#5266eb', dark: '#5266eb' },
        onSolid: '#ffffff',
      },
      selection: {
        bg: { light: '#d9defb', dark: '#3a4280' },
        fg: { light: '#1e1e2a', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // A neutral grotesque with fine weight steps; the light weights below need the variable font
        sans: '"Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        display: '"Inter Display", "Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif',
        mono: '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      size: {
        xs: '0.75rem',
        sm: '0.8125rem',
        md: '0.9375rem',
        lg: '1rem',
        xl: '1.1875rem',
        '2xl': '1.75rem',
        '3xl': '2.625rem',
        '4xl': '3.5625rem',
      },
      weight: { regular: '360', medium: '420', semibold: '480', bold: '560' },
      leading: { tight: '1.15', normal: '1.6', relaxed: '1.7' },
      tracking: { tight: '-0.016em', normal: '0', wide: '0.06em' },
      body: { weight: '360' },
      heading: { weight: '380', tracking: '0' },
    },
    control: {
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(2.25rem * var(--m-density))',
        lg: 'calc(2.5rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.25rem * var(--m-density))',
      },
    },
    radius: { sm: '4px', md: '8px', lg: '12px' },
    shadow: {
      // A ring, not a border: a 2px halo in the neutral, then a short soft drop
      sm: {
        light: '0 0 2px rgb(175 178 206 / 0.56), 0 1px 4px rgb(4 4 52 / 0.1)',
        dark: '0 0 0 1px rgb(175 178 206 / 0.14)',
      },
      md: {
        light: '0 0 2px rgb(175 178 206 / 0.56), 0 1px 4px rgb(4 4 52 / 0.1)',
        dark: '0 0 0 1px rgb(175 178 206 / 0.14), 0 4px 12px rgb(0 0 0 / 0.3)',
      },
      lg: {
        light: '0 0 3px rgb(28 28 35 / 0.09), 0 6px 10px rgb(28 28 35 / 0.04), 0 10px 16px rgb(28 28 35 / 0.02)',
        dark: '0 0 0 1px rgb(175 178 206 / 0.16), 0 10px 24px rgb(0 0 0 / 0.45)',
      },
      overlay: {
        light:
          '0 0 2px rgb(175 178 206 / 0.65), 0 0 3px rgb(0 0 0 / 0.09), 0 12px 16px rgb(0 0 0 / 0.01), 0 22px 28px rgb(0 0 0 / 0.04)',
        dark: '0 0 0 1px rgb(175 178 206 / 0.18), 0 22px 40px rgb(0 0 0 / 0.55)',
      },
    },
    motion: {
      duration: { fast: '150ms', normal: '300ms', slow: '500ms' },
      easing: { standard: 'cubic-bezier(0, 0, 0.6, 1)', emphasized: 'cubic-bezier(0, 0, 0.6, 1)' },
    },
  },
  components: {
    // The content column is narrow and left of centre-heavy: about 61rem beside a 220px sidebar
    layout: {
      containerMax: { sm: '30rem', md: '48rem', lg: '61rem' },
      containerPadding: 'clamp(1rem, 4vw, 2rem)',
      gridGap: 'var(--m-space-6)',
      splitSide: '13.75rem',
    },
    // Actions are pills: solid accent for the one that matters, a quiet neutral fill for the rest
    button: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-regular)',
      shadow: 'none',
      secondary: {
        bg: { light: '#f1f1f4', dark: '#2c2c3a' },
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        hoverBg: { light: '#e8e9ef', dark: '#3b3c4b' },
        activeBg: { light: '#dddee6', dark: '#45465a' },
      },
      ghost: { hoverBg: { light: '#f1f1f4', dark: '#2c2c3a' } },
    },
    // Cards float on a ring shadow, with no drawn border
    card: {
      border: 'transparent',
      shadow: 'var(--m-shadow-sm)',
      hoverShadow: 'var(--m-shadow-lg)',
      hoverBorder: 'transparent',
      hoverTransform: 'none',
    },
    table: {
      headerBg: 'var(--m-color-bg-surface)',
      headerFg: 'var(--m-color-fg-muted)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-regular)',
      fontSize: 'var(--m-font-size-md)',
      cellPaddingY: 'var(--m-space-3)',
      rowHoverBg: 'var(--m-color-bg-sunken)',
      stripeBg: 'var(--m-color-bg-surface)',
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    sidebar: {
      bg: 'var(--m-color-bg-sunken)',
      link: {
        fg: 'var(--m-color-fg-default)',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: '#f1f1f4', dark: '#2c2c3a' },
        hoverBg: { light: '#f1f1f4', dark: '#2c2c3a' },
        activeWeight: 'var(--m-font-weight-regular)',
        radius: '8px',
      },
      heading: { transform: 'none', tracking: '0', weight: 'var(--m-font-weight-regular)' },
    },
    badge: {
      radius: '4px',
      fontWeight: 'var(--m-font-weight-regular)',
      neutral: { bg: { light: '#e8e9ef', dark: '#3b3c4b' } },
    },
    avatar: { bg: { light: '#eef0fd', dark: '#262a4d' }, fg: { light: '#3c4fbb', dark: '#c3cdfa' } },
    tabs: { fontWeight: 'var(--m-font-weight-regular)' },
    // Feedback and overlays float on shadow, with no drawn border and no coloured side stripe
    alert: { border: 'transparent', borderWidth: '0px', accentWidth: '0px' },
    toast: { border: 'transparent', accentWidth: '0px' },
    dialog: { border: 'transparent' },
    popover: { border: 'transparent', radius: '8px', shadow: 'var(--m-shadow-overlay)' },
    tooltip: { fontSize: 'var(--m-font-size-sm)', fontWeight: 'var(--m-font-weight-regular)', shadow: 'none' },
    progress: { height: { md: '0.375rem' }, fill: 'var(--m-color-accent-default)' },
    checkbox: { size: '1rem' },
    kbd: {
      radius: '9999px',
      border: 'var(--m-color-border-default)',
      shadow: 'none',
      fontWeight: 'var(--m-font-weight-regular)',
    },
    accordion: { radius: '0', bg: 'transparent' },
  },
});
