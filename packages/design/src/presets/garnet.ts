import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Garnet: a warm, heavy-headlined revenue tool. Near-black maroon ink on a warm grey ground, the page
 * set as a rounded sheet inside a white rim, a white header plate, heavy geometric display headlines
 * with tight tracking, maroon pill buttons, mono step numbers, and the product itself drawn in neutral
 * white panels with hairline grids and green signal bars. Dark mode is the deep maroon of its footer.
 * Category: editorial and warm-neutral. The values are measured, not invented (see DESIGN.md).
 */
export const garnet = extendTheme(minimal, {
  name: 'garnet',
  label: 'Garnet',
  description:
    'Warm and heavy-headlined: maroon ink on warm grey, rounded sheets in a white rim, maroon pill buttons, mono step numbers and neutral product panels with signal bars.',
  tokens: {
    color: {
      bg: {
        // The public ground is a warm grey sheet; product wells are a cool near-white; panels are white.
        // Dark is the deep maroon of the footer
        canvas: { light: '#ece9ea', dark: '#1c0202' },
        surface: { light: '#ffffff', dark: '#2e0404' },
        raised: { light: '#ffffff', dark: '#3a0b09' },
        sunken: { light: '#f8f8f8', dark: '#160101' },
        overlay: { light: 'rgb(46 0 0 / 0.32)', dark: 'rgb(0 0 0 / 0.6)' },
        inverse: { light: '#2e0000', dark: '#f2efe8' },
      },
      fg: {
        default: { light: '#2e0000', dark: '#f2efe8' },
        // Lead and secondary text: the ink at 68% over the ground (dark: the cream at 70% over the maroon)
        muted: { light: '#724e4e', dark: '#b7a8a4' },
        // Small print: the ink at 62% (dates are 48% on the source, too light for 4.5:1; see the notes)
        subtle: { light: '#7c5c5c', dark: '#a1918e' },
        inverse: { light: '#f2efe8', dark: '#2e0000' },
      },
      border: {
        // Hairlines: the product's #e5e5e5 rows and #f0f0f0 grid lines; dark is the cream at 8%
        default: { light: '#e5e5e5', dark: '#3e1716' },
        muted: { light: '#f0f0f0', dark: '#341010' },
        // Controls: the ink at 50% (the source's outline pills are 20%, below the 3:1 floor)
        strong: { light: '#8d7575', dark: '#907a76' },
        focus: { light: '#2e0000', dark: '#f2efe8' },
      },
      // The action colour is the ink itself: maroon pills with white text; on dark, cream pills with maroon text
      accent: {
        default: { light: '#2e0000', dark: '#f2efe8' },
        hover: { light: '#4a1212', dark: '#ffffff' },
        active: { light: '#1f0000', dark: '#e2ddd3' },
        subtle: { light: '#f3eeee', dark: '#4a1a17' },
        fg: { light: '#ffffff', dark: '#2e0404' },
        text: { light: '#2e0000', dark: '#f2efe8' },
      },
      // The highlight: an electric yellow for small marks only (a discount, a "new"), with ink on it
      brand: {
        default: { light: '#f6ff00', dark: '#ffff48' },
        fg: { light: '#2e0000', dark: '#2e0000' },
        subtle: { light: '#fbffb8', dark: '#4a4a12' },
      },
      // The signal green of the fit bars, its deep text green and pale tint (measured in the product frames)
      success: {
        bg: { light: '#d8f3e3', dark: '#0e2f1d' },
        fg: { light: '#127040', dark: '#5fd99a' },
        border: { light: '#b4e6c8', dark: '#1d5135' },
        solid: { light: '#05d052', dark: '#05d052' },
        onSolid: { light: '#2e0000', dark: '#1c0202' },
      },
      // The yellow of a middling fit bar
      warning: {
        bg: { light: '#fff4d1', dark: '#3a2c08' },
        fg: { light: '#7d5600', dark: '#fed047' },
        border: { light: '#fbe3a0', dark: '#5c4510' },
        solid: { light: '#fed047', dark: '#fed047' },
        onSolid: { light: '#2e0000', dark: '#1c0202' },
      },
      danger: {
        bg: { light: '#fde8ea', dark: '#4a0f14' },
        fg: { light: '#b4162b', dark: '#ff9aa5' },
        border: { light: '#f7c3ca', dark: '#7a1d27' },
        solid: { light: '#c8202f', dark: '#d42a37' },
        onSolid: { light: '#ffffff', dark: '#ffffff' },
      },
      // The product's blue: AI-made cells, count chips, links inside the app
      info: {
        bg: { light: '#e6f4fe', dark: '#0b2a45' },
        fg: { light: '#0b65b4', dark: '#7cc4ff' },
        border: { light: '#bfe0fb', dark: '#174a73' },
        solid: { light: '#0d74ce', dark: '#0090ff' },
        onSolid: { light: '#ffffff', dark: '#1c0202' },
      },
      selection: {
        bg: { light: '#fbffb8', dark: '#4a4a12' },
        fg: { light: '#2e0000', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // Geist for everything you read; Figtree at 800 stands in for the heavy geometric display face
        sans: '"Geist Variable", "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        display: '"Figtree Variable", "Figtree", "Geist Variable", ui-sans-serif, system-ui, sans-serif',
        mono: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      size: {
        xs: '0.75rem',
        sm: '0.8125rem',
        md: '0.875rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '3.375rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '800' },
      leading: { tight: '1.05', normal: '1.5', relaxed: '1.7' },
      tracking: { tight: '-0.03em', normal: '0', wide: '0.08em' },
      body: { weight: '400' },
      heading: { weight: '600', tracking: '-0.025em' },
    },
    control: {
      height: {
        sm: 'calc(1.75rem * var(--m-density))',
        md: 'calc(2.125rem * var(--m-density))',
        lg: 'calc(2.75rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.25rem * var(--m-density))',
      },
      fontSize: '0.875rem',
    },
    // 6px small product controls, 12px rows and menus, 24px panels and sheets; every button a pill
    radius: { sm: '6px', md: '12px', lg: '24px', control: '8px', container: '24px' },
    shadow: {
      // Chips and small lifted things: two faint maroon-tinted drops
      sm: {
        light: '0 1px 2px rgb(46 0 0 / 0.06), 0 2px 8px rgb(46 0 0 / 0.06)',
        dark: '0 1px 2px rgb(0 0 0 / 0.3), 0 2px 8px rgb(0 0 0 / 0.2)',
      },
      // White panels on the ground: a breath close in and a long soft spread
      md: {
        light: '0 2px 6px rgb(73 52 44 / 0.03), 0 12px 36px rgb(73 52 44 / 0.05)',
        dark: 'inset 0 1px 0 rgb(255 255 255 / 0.06), 0 12px 36px rgb(0 0 0 / 0.3)',
      },
      // A product window: a short drop and a long one pulled in under it
      lg: {
        light: '0 2px 6px rgb(18 20 26 / 0.03), 0 28px 60px -30px rgb(18 20 26 / 0.3)',
        dark: 'inset 0 1px 0 rgb(255 255 255 / 0.08), 0 40px 120px rgb(0 0 0 / 0.24)',
      },
      overlay: {
        light: '0 0 0 1px rgb(18 20 26 / 0.06), 0 4px 12px rgb(0 0 0 / 0.08)',
        dark: '0 0 0 1px rgb(242 239 232 / 0.1), 0 12px 32px rgb(0 0 0 / 0.5)',
      },
    },
    focus: { offset: '2px' },
    motion: {
      duration: { fast: '140ms', normal: '200ms', slow: '700ms' },
      easing: { standard: 'ease', emphasized: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    },
  },
  components: {
    // Text to 980px, pictures and product frames to 1200px, prose to 40rem; the gutter grows with the window
    layout: {
      containerMax: { sm: '40rem', md: '61.25rem', lg: '75rem' },
      containerPadding: 'clamp(1.25rem, 4vw, 2.5rem)',
      gridGap: 'var(--m-space-3)',
      splitSide: '15rem',
    },
    // Every button is a pill at 600: maroon for the one that matters, an ink-hairline outline for the rest
    button: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-semibold)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      primary: { border: 'transparent' },
      secondary: {
        bg: 'transparent',
        fg: 'var(--m-color-fg-default)',
        border: { light: 'rgb(46 0 0 / 0.2)', dark: 'rgb(242 239 232 / 0.16)' },
        hoverBg: { light: 'rgb(46 0 0 / 0.05)', dark: 'rgb(242 239 232 / 0.08)' },
        activeBg: { light: 'rgb(46 0 0 / 0.09)', dark: 'rgb(242 239 232 / 0.14)' },
      },
      ghost: {
        fg: 'var(--m-color-fg-muted)',
        hoverBg: { light: 'rgb(46 0 0 / 0.05)', dark: 'rgb(242 239 232 / 0.08)' },
        activeBg: { light: 'rgb(46 0 0 / 0.09)', dark: 'rgb(242 239 232 / 0.14)' },
      },
      danger: { border: 'transparent' },
    },
    // White panels with large corners, no drawn edge, the soft spread shadow
    card: {
      border: 'transparent',
      radius: '24px',
      shadow: 'var(--m-shadow-md)',
      hoverShadow: 'var(--m-shadow-lg)',
      hoverBorder: 'transparent',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-6)', lg: 'var(--m-space-8)' },
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-semibold)',
      descriptionFg: 'var(--m-color-fg-muted)',
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    input: {
      fontSize: 'var(--m-font-size-md)',
      radius: '8px',
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-accent-default)',
    },
    select: { radius: '8px', fontSize: 'var(--m-font-size-md)' },
    field: {
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-medium)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFontWeight: 'var(--m-font-weight-medium)',
    },
    checkbox: { size: '1rem', radius: '4px', border: 'var(--m-color-border-strong)' },
    switch: {
      width: '2.25rem',
      height: '1.25rem',
      smWidth: '1.75rem',
      smHeight: '1rem',
      trackBg: 'var(--m-color-border-strong)',
      thumbBg: '#ffffff',
      thumbCheckedBg: { light: '#ffffff', dark: '#2e0404' },
    },
    // The product's record table: white, 13px, a hairline grid, quiet sentence-case headers, 37px rows
    table: {
      fontSize: 'var(--m-font-size-sm)',
      cellPaddingX: 'var(--m-space-3)',
      cellPaddingY: 'calc(0.5625rem * var(--m-density))',
      borderColor: 'var(--m-color-border-muted)',
      headerBg: 'var(--m-color-bg-surface)',
      headerFg: 'var(--m-color-fg-subtle)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-regular)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      rowHoverBg: 'var(--m-color-bg-sunken)',
      stripeBg: 'var(--m-color-bg-sunken)',
      wrapBorder: 'var(--m-color-border-muted)',
      wrapRadius: '12px',
    },
    // The app's nav sits on the white rim beside the sheet: muted rows, the current one on the sheet's grey
    sidebar: {
      width: '15rem',
      bg: 'transparent',
      border: 'transparent',
      padding: 'var(--m-space-3)',
      sectionGap: 'var(--m-space-5)',
      itemGap: '1px',
      fontSize: 'var(--m-font-size-md)',
      heading: {
        fg: 'var(--m-color-fg-subtle)',
        size: 'var(--m-font-size-xs)',
        weight: 'var(--m-font-weight-semibold)',
        transform: 'uppercase',
        tracking: '0.12em',
      },
      link: {
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'var(--m-color-bg-sunken)',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: '#f1eeef', dark: '#3a0b09' },
        activeWeight: 'var(--m-font-weight-medium)',
        radius: '9999px',
        paddingX: 'var(--m-space-3)',
        paddingY: 'calc(0.375rem * var(--m-density))',
      },
      count: { bg: 'transparent', fg: 'var(--m-color-fg-subtle)' },
    },
    // The header plate: white, 58px, muted 14/500 links, an outline pill and the maroon pill at the right
    navbar: {
      height: 'calc(3.625rem * var(--m-density))',
      paddingX: 'var(--m-space-5)',
      bg: 'var(--m-color-bg-surface)',
      border: 'transparent',
      link: {
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-medium)',
        radius: '9999px',
      },
    },
    // A grey pill track with the chosen segment white and lifted; underline tabs in ink
    tabs: {
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-muted)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-fg-default)',
      pill: {
        listBg: { light: '#e2dfe0', dark: '#160101' },
        listRadius: '9999px',
        listPadding: '3px',
        radius: '9999px',
        activeBg: { light: '#ffffff', dark: '#3a0b09' },
        activeShadow: 'var(--m-shadow-sm)',
      },
    },
    breadcrumb: { separator: '"/"', currentWeight: 'var(--m-font-weight-regular)' },
    pagination: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-muted)',
      currentBg: 'var(--m-color-accent-default)',
      currentFg: 'var(--m-color-accent-fg)',
      currentBorder: 'transparent',
    },
    // Chips: white pills with a hairline, 12px at 500
    badge: {
      height: '1.375rem',
      radius: '9999px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-medium)',
      neutral: {
        bg: 'var(--m-color-bg-surface)',
        fg: 'var(--m-color-fg-default)',
        border: { light: '#e4e4e4', dark: '#4a1a17' },
        solidBg: 'var(--m-color-bg-inverse)',
        solidFg: 'var(--m-color-fg-inverse)',
      },
    },
    avatar: {
      size: { sm: '1.25rem', md: '1.75rem', lg: '2.5rem' },
      bg: { light: '#ece9ea', dark: '#4a1a17' },
      fg: 'var(--m-color-fg-default)',
      fontWeight: 'var(--m-font-weight-semibold)',
    },
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '12px',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    toast: {
      border: 'var(--m-color-border-muted)',
      accentWidth: '0px',
      radius: '12px',
      shadow: 'var(--m-shadow-overlay)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    dialog: {
      border: 'transparent',
      radius: '24px',
      padding: 'var(--m-space-8)',
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    popover: {
      border: 'var(--m-color-border-muted)',
      radius: '12px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-1)',
      item: {
        height: '2rem',
        radius: '8px',
        fontSize: 'var(--m-font-size-sm)',
        hoverBg: 'var(--m-color-bg-sunken)',
      },
      separator: 'var(--m-color-border-muted)',
    },
    tooltip: {
      radius: '8px',
      shadow: 'none',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-medium)',
      delay: '300ms',
    },
    progress: {
      height: { sm: '0.25rem', md: '0.375rem', lg: '0.5rem' },
      track: { light: '#ebebeb', dark: '#3e1716' },
      fill: 'var(--m-color-accent-default)',
    },
    usage: {
      height: '0.375rem',
      track: { light: '#ebebeb', dark: '#3e1716' },
      // The bright signal green is 1.7:1 on the track; a bar takes its text green
      okFill: 'var(--m-color-success-fg)',
    },
    skeleton: {
      bg: { light: '#f0f0f0', dark: '#3a0b09' },
      highlight: { light: '#f8f8f8', dark: '#4a1a17' },
      radius: '6px',
      blockRadius: '12px',
    },
    spinner: { thickness: '2px' },
    kbd: {
      fontWeight: 'var(--m-font-weight-medium)',
      border: 'var(--m-color-border-default)',
      radius: '6px',
      shadow: 'none',
    },
    code: { radius: '12px', inlineRadius: '6px', border: 'var(--m-color-border-muted)' },
    // Questions are hairline rows with a plus at the right; nothing boxed
    accordion: {
      radius: '0',
      bg: 'transparent',
      paddingX: '0',
      paddingY: 'var(--m-space-5)',
      summarySize: '0.95rem',
      summaryWeight: 'var(--m-font-weight-medium)',
      hoverBg: 'transparent',
    },
    prose: { maxWidth: '40rem', lineHeight: '1.7', fg: { light: '#633c3c', dark: '#cdc3bf' }, h2Size: '1.5rem' },
    // The assistant beside the data: your message in a grey box, its answer as plain text
    chat: {
      radius: '16px',
      userBg: { light: '#f4f4f4', dark: '#3a0b09' },
      userFg: 'var(--m-color-fg-default)',
      userBorder: { light: '#ebebeb', dark: '#4a1a17' },
      assistantBg: 'transparent',
      assistantBorder: 'transparent',
      avatarBg: { light: '#ece9ea', dark: '#4a1a17' },
      avatarFg: 'var(--m-color-fg-default)',
    },
    composer: { radius: '16px', shadow: 'none' },
    citation: { chipRadius: '9999px' },
    toolCall: { radius: '12px' },
  },
});
