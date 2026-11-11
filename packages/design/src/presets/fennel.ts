import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Fennel: a plain, confident money interface. Near-black text on white, forest green for every
 * control and link, one bright lime-green pill for the action that matters, soft grey-green fills
 * instead of borders and shadows, and heavy condensed capitals for the big moments. Category: calm
 * fintech. The values are the reference's published tokens, read from its own stylesheets, and
 * measured off its live pages (see DESIGN.md).
 */

// The neutral fill: forest green at 8%, 13% and 18% over white (and white at 10%, 20%, 30% over the
// dark screen), flattened so the contrast checker can read them.
const fill = { light: '#edefeb', dark: '#2a2d29' };
const fillHover = { light: '#e1e5de', dark: '#414441' };
const fillActive = { light: '#d5dad1', dark: '#5a5c59' };
// The pale lime used for secondary actions; forest green in dark
const lime = { light: '#e2f6d5', dark: '#163300' };
const limeHover = { light: '#d3f2c0', dark: '#214d00' };
const limeActive = { light: '#c5edab', dark: '#2c6600' };
// Forest green: controls, links, focus (bright green in dark)
const forest = { light: '#163300', dark: '#9fe870' };

export const fennel = extendTheme(minimal, {
  name: 'fennel',
  label: 'Fennel',
  description:
    'Plain and confident: near-black on white, forest-green controls, one bright lime pill, soft green-grey fills and heavy condensed capitals.',
  tokens: {
    color: {
      bg: {
        canvas: { light: '#ffffff', dark: '#121511' },
        surface: { light: '#ffffff', dark: '#121511' },
        raised: { light: '#ffffff', dark: '#1e211d' },
        // The neutral fill: cards, quiet panels, the footer, skeletons
        sunken: fill,
        overlay: { light: 'rgb(14 15 12 / 0.4)', dark: 'rgb(243 245 241 / 0.25)' },
        // Forest-green panels with pale lime text (bright lime with forest text in dark)
        inverse: { light: '#163300', dark: '#9fe870' },
      },
      fg: {
        default: { light: '#0e0f0c', dark: '#f3f5f1' },
        muted: { light: '#454745', dark: '#e8ebe6' },
        subtle: { light: '#6a6c6a', dark: '#cacfc7' },
        inverse: { light: '#e2f6d5', dark: '#163300' },
      },
      border: {
        // Hairlines: near-black at 12% (white at 20% in dark), flattened
        default: { light: '#e2e2e2', dark: '#414441' },
        muted: fill,
        // Control rings: the reference's own value, already 3.6:1 on white
        strong: { light: '#868685', dark: '#b9bab7' },
        focus: forest,
      },
      accent: {
        // Forest green is the interactive colour; bright lime only fills the primary pill (see button)
        default: forest,
        hover: { light: '#0d1f00', dark: '#cdffad' },
        active: { light: '#0e0f0c', dark: '#ecffe0' },
        subtle: lime,
        fg: { light: '#9fe870', dark: '#163300' },
        text: forest,
      },
      // The signature bright lime, with forest-green text: hero bands, brand panels, the logo tile
      brand: {
        default: '#9fe870',
        fg: '#163300',
        subtle: { light: '#e2f6d5', dark: '#1d2d12' },
      },
      success: {
        bg: { light: '#e2f6d5', dark: '#054d28' },
        fg: { light: '#054d28', dark: '#cef1b8' },
        border: { light: '#b4cab9', dark: '#3d6b52' },
        solid: { light: '#054d28', dark: '#bae5a0' },
        onSolid: { light: '#cef1b8', dark: '#252c20' },
      },
      warning: {
        bg: { light: '#fff7d7', dark: '#3a3523' },
        fg: { light: '#4a3b1c', dark: '#fadc65' },
        border: { light: '#dbd1b5', dark: '#6e6235' },
        solid: { light: '#ffd11a', dark: '#fadc65' },
        onSolid: { light: '#4a3b1c', dark: '#3a3523' },
      },
      danger: {
        bg: { light: '#fbeaea', dark: '#410b0d' },
        fg: { light: '#cb272f', dark: '#ffa8ad' },
        border: { light: '#efbcbf', dark: '#7a3a3e' },
        solid: { light: '#cb272f', dark: '#ffa8ad' },
        onSolid: { light: '#ffffff', dark: '#410b0d' },
      },
      // Information is the reference's teal "proposition" surface
      info: {
        bg: { light: '#e0f7f7', dark: '#054d4d' },
        fg: { light: '#054d4d', dark: '#e0f7f7' },
        border: { light: '#a9cfcf', dark: '#4c8383' },
        solid: { light: '#054d4d', dark: '#a0e1e1' },
        onSolid: { light: '#ffffff', dark: '#054d4d' },
      },
      selection: {
        bg: { light: '#9fe870', dark: '#9fe870' },
        fg: { light: '#163300', dark: '#163300' },
      },
    },
    font: {
      family: {
        // The reference's own text face is open: Inter, used as is
        sans: '"Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        // Stand-in for the reference's proprietary heavy condensed display face
        display:
          '"Sofia Sans Condensed", "Sofia Sans Semi Condensed", "Arial Narrow", "Inter Variable", "Inter", sans-serif',
        mono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.375rem',
        '2xl': '1.875rem',
        '3xl': '2.5rem',
        '4xl': '4rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.2', normal: '1.5', relaxed: '1.55' },
      tracking: { tight: '-0.02em', normal: '-0.006em', wide: '0.02em' },
      body: { weight: '400' },
      // In the product every heading is the text face at 600; the display face is for big moments
      heading: {
        family: 'var(--m-font-family-sans)',
        weight: '600',
        tracking: '-0.02em',
      },
    },
    control: {
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(2.5rem * var(--m-density))',
        lg: 'calc(3rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.5rem * var(--m-density))',
      },
      fontSize: '1rem',
    },
    radius: { sm: '6px', md: '10px', lg: '16px' },
    shadow: {
      // Flat by default: a hairline ring where something must lift, long soft drops for overlays
      sm: { light: '0 0 0 1px rgb(14 15 12 / 0.12)', dark: '0 0 0 1px rgb(255 255 255 / 0.2)' },
      md: { light: '0 4px 16px rgb(0 0 0 / 0.16)', dark: '0 0 0 1px rgb(255 255 255 / 0.2)' },
      lg: {
        light: '0 10px 32px rgb(0 0 0 / 0.15), 0 40px 40px rgb(0 0 0 / 0.04)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.2)',
      },
      overlay: { light: '0 0 40px rgb(69 71 69 / 0.2)', dark: '0 0 0 1px rgb(255 255 255 / 0.2)' },
    },
    motion: {
      duration: { fast: '150ms', normal: '300ms', slow: '350ms' },
      easing: { standard: 'ease-in-out', emphasized: 'cubic-bezier(0, 0.94, 0.62, 1)' },
    },
  },
  components: {
    // A login-width form column, a 264px side column, and content to about 65rem
    layout: {
      containerMax: { sm: '30rem', md: '45rem', lg: '65rem' },
      containerPadding: 'clamp(1rem, 4vw, 2.5rem)',
      gridGap: 'var(--m-space-4)',
      splitSide: '16.5rem',
    },
    // Every button is a pill at 600: bright lime with forest text for the one action, pale lime for
    // the rest, forest text alone for quiet ones
    button: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-semibold)',
      tracking: '-0.011em',
      gap: 'var(--m-space-2)',
      disabledOpacity: '0.45',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      primary: {
        bg: { light: '#9fe870', dark: '#9fe870' },
        fg: { light: '#163300', dark: '#163300' },
        border: { light: '#9fe870', dark: '#9fe870' },
        hoverBg: { light: '#80e142', dark: '#cdffad' },
        activeBg: { light: '#65cf21', dark: '#ecffe0' },
      },
      secondary: { bg: lime, fg: forest, border: 'transparent', hoverBg: limeHover, activeBg: limeActive },
      ghost: { fg: forest, hoverBg: fill, activeBg: fillHover },
      danger: {
        bg: { light: '#cb272f', dark: '#ffa8ad' },
        fg: { light: '#ffffff', dark: '#410b0d' },
        border: { light: '#cb272f', dark: '#ffa8ad' },
        hoverBg: { light: '#b8232b', dark: '#ffbdc0' },
        activeBg: { light: '#a72027', dark: '#ffd1d3' },
      },
    },
    // Inputs are 48px, 10px corners, a 1px grey ring that darkens on hover and turns forest on focus
    input: {
      bg: 'transparent',
      placeholder: 'var(--m-color-fg-subtle)',
      hoverBorder: { light: '#6c6c6b', dark: '#ecede9' },
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(3rem * var(--m-density))',
        lg: 'calc(3.5rem * var(--m-density))',
      },
      paddingX: { md: 'calc(1rem * var(--m-density))' },
    },
    select: {
      bg: 'transparent',
      hoverBorder: { light: '#6c6c6b', dark: '#ecede9' },
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(3rem * var(--m-density))',
        lg: 'calc(3.5rem * var(--m-density))',
      },
      paddingX: { md: 'calc(1rem * var(--m-density))' },
    },
    field: {
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-semibold)',
      hintFg: 'var(--m-color-fg-muted)',
      hintFontSize: 'var(--m-font-size-sm)',
    },
    checkbox: { size: '1.375rem', radius: '3px', mark: { light: '#ffffff', dark: '#121511' } },
    radio: { size: '1.5rem', dot: { light: '#ffffff', dark: '#121511' } },
    switch: {
      width: '3.125rem',
      height: '1.75rem',
      trackBg: 'var(--m-color-border-strong)',
      thumbBg: { light: '#ffffff', dark: '#121511' },
      thumbCheckedBg: { light: '#ffffff', dark: '#121511' },
      thumbInset: '4px',
      thumbShadow: 'none',
    },
    // Cards are the neutral fill: no border, no shadow, 16px corners
    card: {
      bg: fill,
      border: 'transparent',
      shadow: 'none',
      // A clickable card deepens its fill one step (forest green at 13%), drawn as an inset tint
      hoverShadow: {
        light: 'inset 0 0 0 100vmax rgb(22 51 0 / 0.05)',
        dark: 'inset 0 0 0 100vmax rgb(255 255 255 / 0.1)',
      },
      hoverBorder: 'transparent',
      hoverTransform: 'none',
      titleWeight: 'var(--m-font-weight-semibold)',
      outline: { bg: { light: '#ffffff', dark: '#121511' }, border: 'var(--m-color-border-default)' },
      sunken: { bg: fillHover, border: 'transparent' },
    },
    // A table sits in a neutral frame (8px of fill) with a white inside, as the reference draws it
    table: {
      bg: { light: '#ffffff', dark: '#121511' },
      headerBg: { light: '#ffffff', dark: '#121511' },
      headerFg: 'var(--m-color-fg-muted)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-semibold)',
      fontSize: 'var(--m-font-size-sm)',
      cellPaddingY: 'var(--m-space-4)',
      rowHoverBg: fill,
      stripeBg: { light: '#ffffff', dark: '#121511' },
      wrapBorder: fill,
      wrapBorderWidth: '0.5rem',
      wrapRadius: '16px',
    },
    sidebar: {
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      fontSize: 'var(--m-font-size-md)',
      link: {
        fg: 'var(--m-color-fg-default)',
        activeFg: forest,
        activeBg: fill,
        hoverBg: fill,
        activeWeight: 'var(--m-font-weight-semibold)',
        radius: '9999px',
        paddingX: 'var(--m-space-3)',
        paddingY: 'var(--m-space-2)',
      },
      heading: {
        fg: 'var(--m-color-fg-muted)',
        size: 'var(--m-font-size-sm)',
        weight: 'var(--m-font-weight-semibold)',
        transform: 'none',
        tracking: '0',
      },
      count: { bg: lime, fg: forest, radius: '9999px' },
    },
    navbar: {
      height: '4.75rem',
      border: 'transparent',
      shadow: 'none',
      brandFamily: 'var(--m-font-family-display)',
      brandWeight: '900',
      link: {
        radius: '9999px',
        fontWeight: 'var(--m-font-weight-semibold)',
        fontSize: 'var(--m-font-size-lg)',
        fg: forest,
        hoverFg: forest,
        hoverBg: fill,
        activeFg: forest,
        activeBg: fill,
      },
    },
    tabs: {
      fontWeight: 'var(--m-font-weight-semibold)',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: forest,
      activeFg: forest,
      indicator: forest,
      indicatorWidth: '2px',
      listBorder: 'var(--m-color-border-default)',
      // The segmented control: a neutral pill track with a white pill for the selected segment
      pill: {
        listBg: fill,
        listRadius: '9999px',
        listPadding: '4px',
        radius: '9999px',
        activeBg: { light: '#ffffff', dark: '#121511' },
        activeShadow: 'none',
      },
    },
    pagination: {
      radius: '9999px',
      border: 'transparent',
      fg: forest,
      hoverBg: fill,
      currentBg: forest,
      currentFg: { light: '#9fe870', dark: '#163300' },
      currentBorder: 'transparent',
    },
    breadcrumb: { fg: 'var(--m-color-fg-muted)', hoverFg: forest, currentFg: 'var(--m-color-fg-default)' },
    badge: {
      radius: '8px',
      paddingX: '6px',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-semibold)',
      neutral: {
        bg: fill,
        fg: 'var(--m-color-fg-muted)',
        border: 'transparent',
        solidBg: forest,
        solidFg: { light: '#9fe870', dark: '#163300' },
      },
    },
    avatar: {
      size: { sm: '2rem', md: '2.5rem', lg: '3rem' },
      bg: lime,
      fg: forest,
      fontWeight: 'var(--m-font-weight-semibold)',
    },
    // Prompts: the tone's tinted surface, 16px corners, no border, no stripe
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '16px',
      padding: 'var(--m-space-4)',
      gap: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // The snackbar: a dark grey slab with light text, whatever the tone
    toast: {
      bg: { light: '#454745', dark: '#f1f1ed' },
      fg: { light: '#f1f1ed', dark: '#2a2c29' },
      bodyFg: { light: '#f1f1ed', dark: '#2a2c29' },
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '16px',
      padding: 'var(--m-space-3) var(--m-space-4)',
      shadow: 'none',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-semibold)',
      width: '30rem',
    },
    dialog: {
      border: 'transparent',
      radius: '32px',
      shadow: 'none',
      padding: 'var(--m-space-6)',
      titleFamily: 'var(--m-font-family-sans)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-semibold)',
      descriptionFg: 'var(--m-color-fg-muted)',
      width: { sm: '25rem', md: '36rem', lg: '49.5rem' },
    },
    popover: {
      border: 'transparent',
      radius: '16px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-2)',
      item: {
        height: '3rem',
        paddingX: 'var(--m-space-4)',
        radius: '10px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: fill,
        hoverFg: 'var(--m-color-fg-default)',
      },
    },
    // A white panel with a soft drop, not a dark chip
    tooltip: {
      bg: { light: '#ffffff', dark: '#1e211d' },
      fg: 'var(--m-color-fg-default)',
      radius: '10px',
      shadow: 'var(--m-shadow-overlay)',
      paddingX: 'var(--m-space-4)',
      paddingY: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-sm)',
      maxWidth: '15rem',
    },
    progress: {
      height: { sm: '0.25rem', md: '0.5rem', lg: '0.75rem' },
      radius: '10px',
      track: fill,
      fill: forest,
    },
    accordion: {
      radius: '0',
      bg: 'transparent',
      summarySize: 'var(--m-font-size-lg)',
      summaryWeight: 'var(--m-font-weight-semibold)',
      contentFg: 'var(--m-color-fg-muted)',
      paddingX: '0',
      paddingY: 'var(--m-space-5)',
    },
    skeleton: { bg: fill },
    spinner: { color: forest },
    kbd: { radius: '6px', bg: fill, border: 'transparent', shadow: 'none' },
    code: { radius: '10px', inlineRadius: '6px', inlineBg: fill, bg: fill, border: 'transparent' },
    prose: { linkFg: forest, linkDecoration: 'underline' },
    chat: { radius: '16px', userBg: fill, userBorder: 'transparent' },
    composer: { radius: '16px', focusBorder: forest },
  },
});
