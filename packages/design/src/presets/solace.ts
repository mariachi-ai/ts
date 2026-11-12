import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

// The warm greys and the midnight blues the language is built from (published values, see DESIGN.md)
const warm100 = '#f9f4f2';
const warm200 = '#e2ded9';
const warm300 = '#c6c1b9';
const warm500 = '#63605d';
const warm600 = '#44423f';
const warm700 = '#2d2c2b';
const midnight = '#050726';
const midnight700 = '#101340';
const midnight600 = '#2a2d55';

/**
 * Solace: warm and soothing. Warm charcoal text on white with a warm off-white for grouped areas, a
 * sunny orange as the brand, one bright blue for the action, bold rounded type, pill buttons with a
 * small press-shadow, big rounded cards with soft 2px borders, and a midnight-blue dark mode made for
 * bedtime. Category: warm and friendly. The values are published or measured, not invented (see
 * DESIGN.md).
 */
export const solace = extendTheme(minimal, {
  name: 'solace',
  label: 'Solace',
  description:
    'Warm and soothing: charcoal on white and warm off-white, a sunny orange brand, one bright blue action, bold rounded type, pill buttons and a midnight-blue night mode.',
  tokens: {
    color: {
      bg: {
        canvas: { light: '#ffffff', dark: midnight },
        surface: { light: '#ffffff', dark: midnight700 },
        raised: { light: '#ffffff', dark: '#161946' },
        // Grouped areas, footers, the player card and quiet pills: the warm off-white
        sunken: { light: warm100, dark: '#0b0d33' },
        overlay: { light: 'rgb(20 19 19 / 0.6)', dark: 'rgb(2 3 20 / 0.72)' },
        inverse: { light: warm700, dark: '#e5e7ec' },
      },
      fg: {
        default: { light: warm700, dark: '#e5e7ec' },
        muted: { light: warm600, dark: '#9da5b8' },
        subtle: { light: warm500, dark: '#7580a3' },
        inverse: { light: '#ffffff', dark: midnight },
      },
      border: {
        default: { light: warm200, dark: midnight600 },
        muted: { light: warm100, dark: '#181b47' },
        // Control borders: the published hover step, the nearest one that holds 3:1
        strong: { light: warm500, dark: '#7580a3' },
        focus: { light: '#0061ef', dark: '#0061ef' },
      },
      accent: {
        default: { light: '#0061ef', dark: '#0061ef' },
        hover: { light: '#0040ea', dark: '#0040ea' },
        active: { light: '#0000db', dark: '#0000db' },
        subtle: { light: '#e6efff', dark: '#14215e' },
        fg: '#ffffff',
        // Links are blue on white and white on midnight
        text: { light: '#0061ef', dark: '#ffffff' },
      },
      // The signature orange: brand marks, highlight words, tiles and the player's play button
      brand: {
        default: { light: '#ff7300', dark: '#ff7300' },
        fg: { light: warm700, dark: warm700 },
        subtle: { light: '#fff1e5', dark: '#3a2418' },
      },
      success: {
        bg: { light: '#e6f5ec', dark: '#0b2a26' },
        fg: { light: '#0b662a', dark: '#31cc66' },
        border: { light: '#a8dcbc', dark: '#1d5a3b' },
        solid: { light: '#02873e', dark: '#01a652' },
        onSolid: { light: '#ffffff', dark: midnight },
      },
      warning: {
        bg: { light: '#fff6db', dark: '#2a2410' },
        fg: { light: '#8a5a00', dark: '#ffce00' },
        border: { light: '#ffe14f', dark: '#5c4a10' },
        solid: { light: '#ffb700', dark: '#ffb700' },
        onSolid: { light: warm700, dark: midnight },
      },
      danger: {
        bg: { light: '#fdecec', dark: '#2e0f24' },
        fg: { light: '#bf0000', dark: '#ff5a5a' },
        border: { light: '#e01919', dark: '#ff5a5a' },
        solid: { light: '#e01919', dark: '#e01919' },
        onSolid: { light: '#ffffff', dark: '#ffffff' },
      },
      info: {
        bg: { light: '#e6efff', dark: '#14215e' },
        fg: { light: '#0040ea', dark: '#00a4ff' },
        border: { light: '#b3cdfb', dark: '#24357a' },
        solid: { light: '#0040ea', dark: '#0061ef' },
        onSolid: '#ffffff',
      },
      selection: {
        bg: { light: '#ffe14f', dark: '#2a2d55' },
        fg: { light: warm700, dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // A friendly geometric grotesque with round bowls and straight-tailed y
        sans: '"Figtree Variable", "Figtree", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        display:
          '"Figtree Variable", "Figtree", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        mono: '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      // The published scale: 12, 14, 16, 18, 20 for text and labels; 24, 32 and 48 for headings
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '3rem',
      },
      // Only three weights: regular, medium and bold
      weight: { regular: '400', medium: '500', semibold: '700', bold: '700' },
      leading: { tight: '1.2', normal: '1.5', relaxed: '1.6' },
      // Headings and labels are tracked in by 3%
      tracking: { tight: '-0.03em', normal: '0', wide: '0.04em' },
      body: { weight: '400' },
      heading: { weight: '700', tracking: '-0.03em' },
    },
    control: {
      // 40, 48 and 56: the published button heights; 48 is the default
      height: {
        sm: 'calc(2.5rem * var(--m-density))',
        md: 'calc(3rem * var(--m-density))',
        lg: 'calc(3.5rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(1rem * var(--m-density))',
        md: 'calc(1.25rem * var(--m-density))',
        lg: 'calc(1.5rem * var(--m-density))',
      },
      fontSize: 'var(--m-font-size-md)',
    },
    // 8px tiles, 12px inputs and panels, 16px cards; big brand panels go to 24px
    radius: { sm: '8px', md: '12px', lg: '16px', control: '12px', container: '16px' },
    borderWidth: { control: '2px', container: '2px' },
    focus: { width: '3px', offset: '2px' },
    shadow: {
      // The press-shadow under pill buttons: a 2px hard line, no blur
      sm: { light: '0 2px 0 rgb(20 19 19 / 0.2)', dark: '0 2px 0 rgb(0 0 0 / 0.45)' },
      // Raised cards
      md: { light: '0 2px 4px rgb(20 19 19 / 0.2)', dark: '0 2px 6px rgb(0 0 0 / 0.5)' },
      // Menus and popovers: an even 12px glow
      lg: { light: '0 0 12px rgb(20 19 19 / 0.2)', dark: '0 0 0 1px #2a2d55, 0 0 16px rgb(0 0 0 / 0.55)' },
      // Dialogs and banners
      overlay: { light: '0 1px 8px rgb(20 19 19 / 0.2)', dark: '0 0 0 1px #2a2d55, 0 8px 32px rgb(0 0 0 / 0.6)' },
    },
    motion: {
      duration: { fast: '120ms', normal: '200ms', slow: '400ms' },
      easing: { standard: 'ease', emphasized: 'cubic-bezier(0.25, 0.1, 0.25, 1)' },
    },
  },
  components: {
    // Wide pages with 48px gutters; a 1160px content column; a phone-width column for flows
    layout: {
      containerMax: { sm: '30rem', md: '48rem', lg: '72.5rem' },
      containerPadding: 'clamp(1rem, 4vw, 3rem)',
      gridGap: 'var(--m-space-6)',
      splitSide: '17.5rem',
    },
    // Every button is a bold pill with a 2px press-shadow; blue for the one action, the warm
    // off-white for the rest, and the shadow goes when pressed
    button: {
      radius: '9999px',
      fontWeight: '700',
      tracking: '-0.03em',
      gap: 'var(--m-space-2)',
      shadow: 'var(--m-shadow-sm)',
      hoverShadow: 'var(--m-shadow-sm)',
      activeShadow: 'none',
      disabledOpacity: '0.4',
      secondary: {
        bg: { light: warm100, dark: midnight600 },
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        hoverBg: { light: warm200, dark: '#363a6b' },
        activeBg: { light: warm200, dark: '#363a6b' },
      },
      ghost: {
        fg: 'var(--m-color-fg-default)',
        hoverBg: { light: warm200, dark: midnight600 },
        activeBg: { light: warm200, dark: midnight600 },
      },
      danger: {
        bg: '#e01919',
        fg: '#ffffff',
        border: '#e01919',
        hoverBg: '#bf0000',
        activeBg: '#bf0000',
      },
    },
    // Inputs are tall (56px) with 12px corners and a 2px border that turns blue on focus
    input: {
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: warm700, dark: '#9da5b8' },
      focusBorder: 'var(--m-color-accent-default)',
      invalidBorder: 'var(--m-color-danger-border)',
      height: {
        sm: 'calc(2.5rem * var(--m-density))',
        md: 'calc(3.5rem * var(--m-density))',
        lg: 'calc(3.5rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1rem * var(--m-density))',
      },
      paddingY: '0.75rem',
    },
    select: {
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: warm700, dark: '#9da5b8' },
      focusBorder: 'var(--m-color-accent-default)',
      invalidBorder: 'var(--m-color-danger-border)',
      height: {
        sm: 'calc(2.5rem * var(--m-density))',
        md: 'calc(3.5rem * var(--m-density))',
        lg: 'calc(3.5rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1rem * var(--m-density))',
      },
    },
    field: {
      gap: 'var(--m-space-2)',
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: '700',
      hintFg: 'var(--m-color-fg-subtle)',
      hintFontSize: 'var(--m-font-size-xs)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    // Rounded 24px boxes and circles; checked is the action blue with a white mark
    checkbox: { size: '1.5rem', radius: '6px', hoverBorder: { light: warm700, dark: '#9da5b8' } },
    radio: { size: '1.5rem', hoverBorder: { light: warm700, dark: '#9da5b8' } },
    // The phone's switch: green when on, a white knob
    switch: {
      width: '3.1875rem',
      height: '1.9375rem',
      thumbInset: '2px',
      trackBg: 'var(--m-color-border-strong)',
      trackCheckedBg: { light: '#02873e', dark: '#01a652' },
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbShadow: '0 2px 4px rgb(20 19 19 / 0.2)',
    },
    // White cards with a soft 2px warm border and 16px corners, no resting shadow; they lift on hover
    card: {
      border: 'var(--m-color-border-default)',
      borderWidth: '2px',
      shadow: 'none',
      hoverShadow: 'var(--m-shadow-md)',
      hoverBorder: 'var(--m-color-border-default)',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-6)', lg: 'var(--m-space-8)' },
      titleFamily: 'var(--m-font-family-sans)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: '700',
      descriptionFg: 'var(--m-color-fg-muted)',
      outline: { bg: 'var(--m-color-bg-surface)', border: 'var(--m-color-border-default)' },
      // The warm off-white panel: quotes, the player, grouped content
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: '1rem',
      cellPaddingY: '1rem',
      borderColor: 'var(--m-color-border-default)',
      borderWidth: '2px',
      headerBg: 'var(--m-color-bg-sunken)',
      headerFg: 'var(--m-color-fg-default)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: '700',
      headerTransform: 'none',
      headerTracking: '-0.01em',
      rowHoverBg: 'var(--m-color-bg-sunken)',
      stripeBg: 'var(--m-color-bg-surface)',
      wrapBorder: 'var(--m-color-border-default)',
      wrapBorderWidth: '2px',
      wrapRadius: '16px',
    },
    // The app's tab bar as a side column: bold labels, the current one on the warm off-white pill
    sidebar: {
      bg: 'var(--m-color-bg-canvas)',
      border: 'var(--m-color-border-default)',
      fontSize: 'var(--m-font-size-md)',
      padding: 'var(--m-space-4)',
      itemGap: '4px',
      link: {
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'var(--m-color-bg-sunken)',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: warm100, dark: midnight600 },
        activeWeight: '700',
        radius: '9999px',
        paddingX: 'var(--m-space-4)',
        paddingY: 'calc(0.625rem * var(--m-density))',
      },
      heading: {
        fg: 'var(--m-color-fg-subtle)',
        size: 'var(--m-font-size-sm)',
        weight: '700',
        transform: 'none',
        tracking: '0',
      },
      count: { bg: 'var(--m-color-brand-default)', fg: 'var(--m-color-brand-fg)', radius: '9999px' },
    },
    // The site header: 80px, white, 16px links in charcoal, 48px gutters, no rule underneath
    navbar: {
      height: '5rem',
      paddingX: 'clamp(1rem, 3.5vw, 3rem)',
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      shadow: 'none',
      brandFamily: 'var(--m-font-family-display)',
      brandWeight: '700',
      brandSize: 'var(--m-font-size-2xl)',
      link: {
        radius: '9999px',
        paddingX: '0.75rem',
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-regular)',
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'var(--m-color-bg-sunken)',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: warm100, dark: midnight600 },
      },
    },
    // Tabs: bold, the current one in charcoal over a 2px charcoal line; the segmented control is a
    // warm off-white track with the selected segment raised in white
    tabs: {
      fontSize: 'var(--m-font-size-lg)',
      fontWeight: '700',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-fg-default)',
      indicatorWidth: '2px',
      listBorder: 'transparent',
      pill: {
        listBg: { light: warm100, dark: midnight600 },
        listRadius: '9999px',
        listPadding: '4px',
        radius: '9999px',
        activeBg: { light: '#ffffff', dark: '#3d4275' },
        activeShadow: '0 2px 4px rgb(20 19 19 / 0.12)',
      },
    },
    // Round page numbers on the warm off-white; the current one solid charcoal
    pagination: {
      size: '2rem',
      radius: '9999px',
      border: 'transparent',
      fontWeight: '500',
      fg: 'var(--m-color-fg-default)',
      hoverBg: { light: warm200, dark: midnight600 },
      currentBg: 'var(--m-color-bg-inverse)',
      currentFg: 'var(--m-color-fg-inverse)',
      currentBorder: 'transparent',
    },
    breadcrumb: {
      separator: '"/"',
      fg: 'var(--m-color-fg-default)',
      hoverFg: 'var(--m-color-fg-muted)',
      currentFg: 'var(--m-color-fg-subtle)',
    },
    // Labels: 12px medium on 4px corners ("Annual plan" on blue, "Guided" outlined)
    badge: {
      height: '1.5rem',
      paddingX: '0.75rem',
      radius: '4px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-medium)',
      neutral: {
        bg: 'var(--m-color-bg-sunken)',
        fg: 'var(--m-color-fg-default)',
        border: 'var(--m-color-border-default)',
      },
    },
    // Round initials on the pale orange
    avatar: {
      size: { sm: '2rem', md: '2.5rem', lg: '4rem' },
      bg: 'var(--m-color-brand-subtle)',
      fg: 'var(--m-color-fg-default)',
      fontWeight: '700',
    },
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '12px',
      padding: 'var(--m-space-4)',
      gap: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: '700',
    },
    // A charcoal bar with white text, 12px corners, whatever the tone
    toast: {
      bg: { light: warm700, dark: midnight600 },
      fg: '#ffffff',
      bodyFg: { light: warm300, dark: '#c3c8d6' },
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '12px',
      shadow: 'var(--m-shadow-overlay)',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: '700',
    },
    dialog: {
      border: 'transparent',
      borderWidth: '0px',
      radius: '16px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-6)',
      titleFamily: 'var(--m-font-family-display)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: '700',
      descriptionFg: 'var(--m-color-fg-muted)',
    },
    // The select menu: white, 12px corners, an even glow, 48px rows
    popover: {
      border: 'transparent',
      borderWidth: '0px',
      radius: '12px',
      shadow: 'var(--m-shadow-lg)',
      padding: '0',
      item: {
        height: '3rem',
        paddingX: 'var(--m-space-4)',
        radius: '0',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: 'var(--m-color-bg-sunken)',
        hoverFg: 'var(--m-color-fg-default)',
      },
    },
    // The coach mark: midnight with white text, 8px corners
    tooltip: {
      bg: { light: midnight, dark: '#2a2d55' },
      fg: '#ffffff',
      radius: '8px',
      shadow: 'none',
      paddingX: 'var(--m-space-4)',
      paddingY: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
    },
    // The scrubber: a thin rounded track a shade lighter than the warm off-white; the played part in
    // the deeper published orange (the brand orange is under 3:1 on white)
    progress: {
      height: { sm: '0.25rem', md: '0.375rem', lg: '0.5rem' },
      radius: '9999px',
      track: { light: '#faf6f4', dark: midnight600 },
      fill: { light: '#fc5500', dark: '#ff7300' },
    },
    accordion: {
      radius: '12px',
      bg: 'var(--m-color-bg-sunken)',
      border: 'transparent',
      separatedGap: 'var(--m-space-3)',
      paddingX: 'var(--m-space-6)',
      paddingY: 'var(--m-space-5)',
      summarySize: 'var(--m-font-size-lg)',
      summaryWeight: '700',
      contentFg: 'var(--m-color-fg-muted)',
    },
    skeleton: {
      bg: { light: warm100, dark: midnight700 },
      highlight: { light: '#ffffff', dark: '#181b47' },
      radius: '8px',
      blockRadius: '16px',
      duration: '1.4s',
    },
    spinner: { thickness: '3px', color: 'var(--m-color-accent-default)', duration: '0.75s' },
    kbd: { radius: '6px', shadow: 'var(--m-shadow-sm)', fontWeight: 'var(--m-font-weight-medium)' },
    code: {
      radius: '12px',
      inlineRadius: '4px',
      inlineBg: 'var(--m-color-bg-sunken)',
      bg: 'var(--m-color-bg-sunken)',
      border: 'transparent',
    },
    prose: { linkFg: 'var(--m-color-accent-text)', linkDecoration: 'underline', maxWidth: '40rem', lineHeight: '1.6' },
    // The companion chat: the person's messages on white cards with a 2px border, the companion's on
    // the warm off-white
    chat: {
      radius: '16px',
      userBg: 'var(--m-color-bg-surface)',
      userFg: 'var(--m-color-fg-default)',
      userBorder: 'var(--m-color-border-default)',
      assistantBg: 'var(--m-color-bg-sunken)',
      assistantFg: 'var(--m-color-fg-default)',
      assistantBorder: 'transparent',
      assistantAvatarBg: 'var(--m-color-brand-default)',
      assistantAvatarFg: 'var(--m-color-brand-fg)',
    },
    composer: {
      radius: '16px',
      border: 'var(--m-color-border-strong)',
      focusBorder: 'var(--m-color-accent-default)',
      borderWidth: '2px',
      shadow: 'none',
    },
    citation: {
      chipBg: 'var(--m-color-bg-sunken)',
      chipFg: 'var(--m-color-fg-default)',
      chipRadius: '9999px',
    },
    toolCall: { radius: '12px', borderWidth: '2px', statusRadius: '4px' },
    usage: {
      radius: '9999px',
      okFill: { light: '#0061ef', dark: '#00a4ff' },
      track: { light: warm200, dark: midnight600 },
    },
    thinking: { radius: '12px' },
  },
});
