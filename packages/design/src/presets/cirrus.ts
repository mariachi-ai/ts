import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Cirrus: a bright, friendly money interface. Deep navy ink on a cool off-white canvas, white
 * panels with 20px corners and a hairline, one clear blue, soft tinted category pills in capitals,
 * and figures whose currency sign is small and raised. Dark mode is a near-black navy with the same
 * blue. Category: calm fintech. The values are measured, not invented (see DESIGN.md).
 */
export const cirrus = extendTheme(minimal, {
  name: 'cirrus',
  label: 'Cirrus',
  description:
    'Bright and friendly: navy ink on cool off-white, white 20px panels with a hairline, one clear blue, tinted capital pills and a near-black navy dark mode.',
  tokens: {
    color: {
      bg: {
        // The page is a cool off-white; panels, the sidebar and the header are white
        canvas: { light: '#f9fafb', dark: '#00060f' },
        surface: { light: '#ffffff', dark: '#010e21' },
        raised: { light: '#ffffff', dark: '#041022' },
        // Quiet fills: the hover row, the segmented track, progress tracks
        sunken: { light: '#f5f6f6', dark: '#020c1b' },
        overlay: { light: 'rgb(0 0 0 / 0.3)', dark: 'rgb(0 0 0 / 0.6)' },
        // Chart flags and tooltips: navy on light, pale on dark
        inverse: { light: '#143352', dark: '#dee4ed' },
      },
      fg: {
        default: { light: '#143352', dark: '#dee4ed' },
        // The reference's secondary grey (#7f8ba4, 3.4:1) is too light for the 4.5:1 floor; this is
        // its marketing-site secondary (the navy at 70%), the same family one step darker
        muted: { light: '#5a7086', dark: '#5c7eab' },
        // Tertiary grey, darkened from #a5aebf (light) and #3f5b81 (dark) to the 4.5:1 floor
        subtle: { light: '#62758d', dark: '#657c9b' },
        inverse: { light: '#ffffff', dark: '#010e21' },
      },
      border: {
        // Hairlines: ink at 10% (light), the blue at 16% (dark)
        default: { light: '#e6e6e7', dark: '#112542' },
        muted: { light: '#f3f3f3', dark: '#0d1f3a' },
        // Controls: the reference's secondary grey, which meets 3:1; dark lifted from #285a8e
        strong: { light: '#7f8ba4', dark: '#316193' },
        focus: { light: '#3e72db', dark: '#6aa7f8' },
      },
      // The blue, a step darker than the reference's #437cef / #1878f7 so white text meets 4.5:1
      accent: {
        default: { light: '#3e72db', dark: '#1772e9' },
        hover: { light: '#3764bf', dark: '#1564cb' },
        active: { light: '#325aab', dark: '#145ab6' },
        // Selected nav, the highlighted menu row, chips
        subtle: { light: '#e6f1ff', dark: '#162d4c' },
        fg: '#ffffff',
        text: { light: '#056dc7', dark: '#6aa7f8' },
      },
      // Money in and "under budget": the bright green, with its deep green for text
      success: {
        bg: { light: '#e1f2e2', dark: '#062f2a' },
        fg: { light: '#017c30', dark: '#19b24d' },
        border: { light: '#d2ecd4', dark: '#094530' },
        // The bright green of bars, lines and the "under" flag; navy text on it (white is 2.2:1)
        solid: { light: '#00cc4b', dark: '#0ac24e' },
        onSolid: { light: '#143352', dark: '#010e21' },
      },
      warning: {
        bg: { light: '#fef0e0', dark: '#282224' },
        fg: { light: '#a75a07', dark: '#ffaa52' },
        border: { light: '#fde8d1', dark: '#4a3326' },
        solid: { light: '#ff9900', dark: '#f2960d' },
        onSolid: { light: '#143352', dark: '#010e21' },
      },
      // Over budget: a warm red
      danger: {
        bg: { light: '#ffe8e6', dark: '#301c29' },
        fg: { light: '#d61301', dark: '#eb5749' },
        border: { light: '#ffddda', dark: '#4f262e' },
        solid: { light: '#e51300', dark: '#f54c3d' },
        onSolid: { light: '#ffffff', dark: '#010e21' },
      },
      info: {
        bg: { light: '#e3f1ff', dark: '#0d2848' },
        fg: { light: '#056dc7', dark: '#8ac4ff' },
        border: { light: '#d6eaff', dark: '#173e69' },
        solid: { light: '#3e72db', dark: '#1772e9' },
        onSolid: '#ffffff',
      },
      selection: {
        bg: { light: '#d9e5fc', dark: '#213c62' },
        fg: { light: '#143352', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // A friendly geometric grotesque: Figtree stands in for the reference's own variable face
        sans: '"Figtree Variable", "Figtree", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"',
        display: '"Figtree Variable", "Figtree", ui-sans-serif, system-ui, sans-serif',
        mono: '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      },
      size: {
        xs: '0.75rem',
        sm: '0.8125rem',
        md: '0.9375rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.75rem',
        '3xl': '2.25rem',
        '4xl': '3rem',
      },
      weight: { regular: '450', medium: '550', semibold: '620', bold: '700' },
      leading: { tight: '1.15', normal: '1.5', relaxed: '1.6' },
      tracking: { tight: '-0.01em', normal: '0', wide: '0.05em' },
      body: { weight: '450' },
      heading: { weight: '550', tracking: '-0.01em' },
    },
    control: {
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(2.25rem * var(--m-density))',
        lg: 'calc(2.75rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.625rem * var(--m-density))',
        md: 'calc(0.875rem * var(--m-density))',
        lg: 'calc(1.25rem * var(--m-density))',
      },
      fontSize: '0.9375rem',
    },
    // 8px controls, 12px menus and toasts, 20px panels; pills for chips, segments and badges
    radius: { sm: '4px', md: '8px', lg: '12px', control: '8px', container: '20px' },
    shadow: {
      // Buttons: a faint 1px drop and a tight inner edge
      sm: {
        light: '0 1px 4px rgb(10 14 20 / 0.02), 0 1px 2px -2px rgb(10 14 20 / 0.1)',
        dark: '0 1px 4px rgb(13 83 186 / 0.06), 0 1px 2px -2px rgb(2 13 29 / 0.6)',
      },
      // Panels: the hairline does the work; the shadow is barely there
      md: { light: '0 2px 6px rgb(10 14 20 / 0.02)', dark: '0 2px 6px rgb(13 83 186 / 0.06)' },
      lg: { light: '0 4px 16px rgb(10 14 20 / 0.1)', dark: '0 4px 16px rgb(2 13 29 / 0.6)' },
      overlay: { light: '0 4px 16px rgb(10 14 20 / 0.12)', dark: '0 4px 16px rgb(2 13 29 / 1)' },
    },
    focus: { offset: '2px' },
    motion: {
      duration: { fast: '150ms', normal: '200ms', slow: '300ms' },
      easing: { standard: 'cubic-bezier(0.4, 0, 0.2, 1)', emphasized: 'cubic-bezier(0.25, 1, 0.5, 1)' },
    },
  },
  components: {
    // A 256px white sidebar, a 56px header, then cards on the off-white canvas 24px apart
    layout: {
      containerMax: { sm: '28rem', md: '48rem', lg: '76rem' },
      containerPadding: 'clamp(1rem, 3vw, 2rem)',
      gridGap: 'var(--m-space-6)',
      splitSide: '16rem',
    },
    // 8px buttons: solid blue for the one that matters, white with a hairline for the rest
    button: {
      fontWeight: 'var(--m-font-weight-medium)',
      shadow: 'var(--m-shadow-sm)',
      hoverShadow: 'var(--m-shadow-sm)',
      activeShadow: 'none',
      primary: { border: 'transparent' },
      secondary: {
        bg: { light: '#ffffff', dark: '#09182f' },
        fg: 'var(--m-color-fg-default)',
        border: 'var(--m-color-border-default)',
        hoverBg: { light: '#f5f6f6', dark: '#1d2d44' },
        activeBg: { light: '#ececed', dark: '#314058' },
      },
      ghost: {
        fg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#f5f6f6', dark: '#0b203e' },
        activeBg: { light: '#ececed', dark: '#14264a' },
      },
      danger: { border: 'transparent' },
    },
    // White panels, 20px corners, a hairline and a breath of shadow
    card: {
      border: 'var(--m-color-border-default)',
      shadow: 'var(--m-shadow-md)',
      hoverShadow: 'var(--m-shadow-lg)',
      hoverBorder: 'var(--m-color-border-default)',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-6)', lg: 'var(--m-space-8)' },
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-medium)',
      descriptionFg: 'var(--m-color-fg-muted)',
    },
    input: {
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-accent-default)',
      paddingX: { sm: 'var(--m-space-3)', md: 'var(--m-space-3)', lg: 'var(--m-space-4)' },
    },
    field: {
      labelFg: 'var(--m-color-fg-muted)',
      labelFontSize: 'var(--m-font-size-md)',
      labelFontWeight: 'var(--m-font-weight-regular)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFontWeight: 'var(--m-font-weight-medium)',
    },
    checkbox: {
      size: '1rem',
      radius: '4px',
      border: 'var(--m-color-border-strong)',
      hoverBorder: 'var(--m-color-accent-default)',
    },
    // A small iOS-like switch: blue when on
    switch: {
      width: '2.25rem',
      height: '1.375rem',
      smWidth: '1.875rem',
      smHeight: '1.125rem',
      trackBg: 'var(--m-color-border-strong)',
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
    },
    // Lists rather than grids: no frame, no header fill, capital column labels, faint rows
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: 'var(--m-space-3)',
      cellPaddingY: 'calc(0.625rem * var(--m-density))',
      borderColor: 'var(--m-color-border-muted)',
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-xs)',
      headerFontWeight: 'var(--m-font-weight-medium)',
      headerTransform: 'uppercase',
      headerTracking: 'var(--m-font-tracking-wide)',
      rowHoverBg: 'var(--m-color-bg-sunken)',
      stripeBg: 'var(--m-color-bg-canvas)',
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    sidebar: {
      width: '16rem',
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-default)',
      padding: 'var(--m-space-4)',
      sectionGap: 'var(--m-space-5)',
      itemGap: '2px',
      fontSize: 'var(--m-font-size-lg)',
      heading: {
        fg: 'var(--m-color-fg-muted)',
        size: 'var(--m-font-size-md)',
        weight: 'var(--m-font-weight-regular)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'var(--m-color-bg-sunken)',
        // Light: a pale blue row with blue text. Dark: a solid soft blue with navy-black text
        activeFg: { light: '#056dc7', dark: '#020c1b' },
        activeBg: { light: '#f0f5fe', dark: '#5089d7' },
        activeWeight: 'var(--m-font-weight-regular)',
        radius: '8px',
        paddingX: 'var(--m-space-3)',
        paddingY: 'calc(0.4375rem * var(--m-density))',
      },
      count: { bg: 'transparent', fg: 'var(--m-color-fg-muted)' },
    },
    // The public site's header: transparent, roomy, muted links, pill buttons at the right
    navbar: {
      height: 'calc(4.5rem * var(--m-density))',
      paddingX: 'clamp(1rem, 4vw, 4rem)',
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      link: {
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
        fontSize: 'var(--m-font-size-lg)',
        fontWeight: 'var(--m-font-weight-medium)',
        radius: '9999px',
      },
    },
    // Segments are pills on a faint track; underline tabs are blue
    tabs: {
      fontWeight: 'var(--m-font-weight-medium)',
      pill: {
        listBg: 'var(--m-color-bg-sunken)',
        listRadius: '9999px',
        listPadding: '4px',
        radius: '9999px',
        activeBg: { light: '#ffffff', dark: '#14264a' },
        activeShadow: 'var(--m-shadow-sm)',
      },
    },
    breadcrumb: { separator: '"›"', currentWeight: 'var(--m-font-weight-medium)' },
    pagination: {
      radius: '8px',
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-muted)',
      currentBg: 'var(--m-color-accent-subtle)',
      currentFg: 'var(--m-color-accent-text)',
      currentBorder: 'transparent',
    },
    // Category pills: a soft tint, capitals, no border
    badge: {
      height: '1.375rem',
      radius: '9999px',
      borderWidth: '0px',
      fontSize: '0.6875rem',
      fontWeight: 'var(--m-font-weight-semibold)',
      textTransform: 'uppercase',
      tracking: '0.04em',
      neutral: {
        bg: { light: '#eceff5', dark: '#1d2838' },
        fg: { light: '#536780', dark: '#b4c1d3' },
        border: 'transparent',
        solidBg: 'var(--m-color-bg-inverse)',
        solidFg: 'var(--m-color-fg-inverse)',
      },
    },
    avatar: {
      size: { sm: '1.5rem', md: '2rem', lg: '2.75rem' },
      bg: 'var(--m-color-accent-subtle)',
      fg: 'var(--m-color-accent-text)',
      fontWeight: 'var(--m-font-weight-medium)',
    },
    // Callouts: a pale tint, 12px corners, no border, no side stripe
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '12px',
      padding: 'var(--m-space-4) var(--m-space-5)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    // The floating bar: white, a hairline, 12px corners, a soft lift
    toast: {
      border: 'var(--m-color-border-default)',
      accentWidth: 'var(--m-border-width-thin)',
      radius: '12px',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-3) var(--m-space-4)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    dialog: {
      border: 'var(--m-color-border-default)',
      radius: '20px',
      padding: 'var(--m-space-8)',
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-2xl)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    popover: {
      border: 'var(--m-color-border-default)',
      radius: '12px',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-2)',
      item: {
        height: '2.5rem',
        radius: '8px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: 'var(--m-color-accent-subtle)',
        hoverFg: 'var(--m-color-accent-text)',
      },
      separator: 'var(--m-color-border-default)',
    },
    // A navy flag with white text (pale with navy in dark), like the chart's value flags
    tooltip: {
      radius: '6px',
      shadow: 'none',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-medium)',
      delay: '300ms',
    },
    progress: {
      height: { sm: '0.25rem', md: '0.375rem', lg: '0.5rem' },
      track: { light: '#ececed', dark: '#14264a' },
      fill: 'var(--m-color-accent-default)',
    },
    usage: {
      height: '0.375rem',
      track: { light: '#ececed', dark: '#14264a' },
      okFill: 'var(--m-color-accent-default)',
    },
    skeleton: {
      bg: { light: '#f0f1f3', dark: '#0b203e' },
      highlight: { light: '#f9fafb', dark: '#14264a' },
      radius: '6px',
      blockRadius: '20px',
    },
    spinner: { thickness: '2px' },
    kbd: {
      fontWeight: 'var(--m-font-weight-medium)',
      border: 'var(--m-color-border-default)',
      radius: '6px',
      shadow: 'var(--m-shadow-sm)',
    },
    code: { radius: '12px', inlineRadius: '6px', border: 'var(--m-color-border-default)', comment: 'var(--m-color-fg-muted)' },
    // Questions are separate white rows with 24px corners; the open one lifts
    accordion: {
      radius: '24px',
      separatedGap: 'var(--m-space-3)',
      paddingX: 'var(--m-space-6)',
      paddingY: 'var(--m-space-5)',
      summarySize: 'var(--m-font-size-xl)',
      summaryWeight: 'var(--m-font-weight-medium)',
      hoverBg: 'transparent',
    },
    prose: { maxWidth: '68ch', lineHeight: '1.6' },
    // The assistant: your messages in blue bubbles, its answers in white ones
    chat: {
      radius: '20px',
      userBg: 'var(--m-color-accent-default)',
      userFg: '#ffffff',
      userBorder: 'var(--m-color-accent-default)',
      assistantBorder: 'var(--m-color-border-default)',
      avatarBg: 'var(--m-color-accent-subtle)',
      avatarFg: 'var(--m-color-accent-text)',
    },
    composer: { radius: '20px', shadow: 'var(--m-shadow-lg)' },
    citation: { chipRadius: '9999px' },
    toolCall: { radius: '12px' },
  },
});
