import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Vellum: a quiet, native-feeling journal. White pages and soft grey grouped panels, ink text, a
 * bright sky blue as the signature (journal bands, swatches, the default journal) with a deeper blue
 * for actions, pill buttons, an entry timeline with big date numerals in a left column, and a
 * humanist sans for entry text at a generous reading width. Light, and a true black dark mode.
 * Category: calm and minimal. The values are measured, not invented (see DESIGN.md).
 */
export const vellum = extendTheme(minimal, {
  name: 'vellum',
  label: 'Vellum',
  description:
    'A quiet journal: white pages, grey grouped panels, a sky-blue signature, pill actions, an entry timeline with big date numerals, and a true black dark mode.',
  tokens: {
    color: {
      bg: {
        canvas: { light: '#ffffff', dark: '#000000' },
        surface: { light: '#ffffff', dark: '#1c1c1e' },
        raised: { light: '#ffffff', dark: '#2c2c2e' },
        // The grouped panels, grey pills and month bands
        sunken: { light: '#f2f2f7', dark: '#1c1c1e' },
        overlay: { light: 'rgb(0 0 0 / 0.3)', dark: 'rgb(0 0 0 / 0.6)' },
        inverse: { light: '#333b40', dark: '#f2f2f7' },
      },
      fg: {
        // Titles; entry text is the slightly softer ink (prose.fg)
        default: { light: '#22282b', dark: '#ffffff' },
        muted: { light: '#535a5f', dark: '#98989f' },
        subtle: { light: '#62676a', dark: '#8e8e93' },
        inverse: { light: '#ffffff', dark: '#22282b' },
      },
      border: {
        default: { light: '#e6e6ec', dark: '#38383a' },
        muted: { light: '#f2f2f7', dark: '#2c2c2e' },
        // The system grey: the controls' 3:1 border
        strong: { light: '#8e8e93', dark: '#8e8e93' },
        focus: { light: '#248bd9', dark: '#44c0ff' },
      },
      // Actions: the reference's own deeper button blue, which carries white text
      accent: {
        default: { light: '#1e75ae', dark: '#1e75ae' },
        hover: { light: '#1a6699', dark: '#1a6699' },
        active: { light: '#165a87', dark: '#165a87' },
        subtle: { light: '#e3f5ff', dark: '#0d2a3a' },
        fg: '#ffffff',
        text: { light: '#1b6ca1', dark: '#44c0ff' },
      },
      // The signature sky blue: journal bands, swatches, the default journal's colour
      brand: {
        default: { light: '#44c0ff', dark: '#44c0ff' },
        fg: { light: '#22282b', dark: '#22282b' },
        subtle: { light: '#e3f5ff', dark: '#0d2a3a' },
      },
      // Status: the platform's accessible system colours
      success: {
        bg: { light: '#e8f7ec', dark: '#0f2a17' },
        fg: { light: '#1d7a33', dark: '#30d158' },
        border: { light: '#b7e4c2', dark: '#1d4a2a' },
        solid: { light: '#1f8238', dark: '#30d158' },
        onSolid: { light: '#ffffff', dark: '#000000' },
      },
      warning: {
        bg: { light: '#fff4e5', dark: '#33240a' },
        fg: { light: '#a14600', dark: '#ff9f0a' },
        border: { light: '#ffd9a6', dark: '#5c3d0c' },
        solid: { light: '#ff9500', dark: '#ff9f0a' },
        onSolid: { light: '#22282b', dark: '#000000' },
      },
      danger: {
        bg: { light: '#ffeceb', dark: '#3a1311' },
        fg: { light: '#c8001a', dark: '#ff6961' },
        border: { light: '#ffc4c0', dark: '#6b221d' },
        solid: { light: '#d70015', dark: '#ff453a' },
        onSolid: { light: '#ffffff', dark: '#000000' },
      },
      info: {
        bg: { light: '#e3f5ff', dark: '#0d2a3a' },
        fg: { light: '#1b6ca1', dark: '#44c0ff' },
        border: { light: '#b3e3fc', dark: '#1d4a63' },
        solid: { light: '#1e75ae', dark: '#44c0ff' },
        onSolid: { light: '#ffffff', dark: '#000000' },
      },
      selection: {
        bg: { light: '#c7ebff', dark: '#1d4a63' },
        fg: { light: '#22282b', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // The interface face: a neutral grotesque standing in for the platform's system font
        sans: '"Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        // Entry text and entry titles: a warm humanist sans
        display: '"Lato", "Inter Variable", ui-sans-serif, system-ui, sans-serif',
        mono: '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      size: {
        xs: '0.6875rem',
        sm: '0.8125rem',
        md: '0.9375rem',
        lg: '1.0625rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2.125rem',
        '4xl': '3rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.2', normal: '1.45', relaxed: '1.65' },
      tracking: { tight: '-0.015em', normal: '0', wide: '0.04em' },
      // Page titles and month headings are the interface face, bold; entry titles use the display face
      heading: { family: 'var(--m-font-family-sans)', weight: '700', tracking: '-0.015em' },
    },
    control: {
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(2.5rem * var(--m-density))',
        lg: 'calc(3rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.875rem * var(--m-density))',
        md: 'calc(1.125rem * var(--m-density))',
        lg: 'calc(1.5rem * var(--m-density))',
      },
    },
    radius: { sm: '4px', md: '8px', lg: '14px' },
    shadow: {
      sm: { light: '0 1px 2px rgb(0 0 0 / 0.06)', dark: '0 0 0 1px rgb(255 255 255 / 0.06)' },
      md: {
        light: '0 0 0 0.5px rgb(0 0 0 / 0.06), 0 4px 12px rgb(0 0 0 / 0.08)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.08), 0 4px 12px rgb(0 0 0 / 0.5)',
      },
      // The site's floating screens: one long soft drop
      lg: { light: '0 4px 40px rgb(0 0 0 / 0.15)', dark: '0 0 0 1px rgb(255 255 255 / 0.08), 0 8px 40px rgb(0 0 0 / 0.6)' },
      // Menus and sheets: a half-pixel edge and a deep soft drop
      overlay: {
        light: '0 0 0 0.5px rgb(0 0 0 / 0.12), 0 10px 30px rgb(0 0 0 / 0.18)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.1), 0 12px 36px rgb(0 0 0 / 0.7)',
      },
    },
    motion: {
      duration: { fast: '150ms', normal: '250ms', slow: '400ms' },
      easing: { standard: 'cubic-bezier(0.25, 0.1, 0.25, 1)', emphasized: 'cubic-bezier(0.2, 0.9, 0.3, 1)' },
    },
  },
  components: {
    // Three panes on a wide screen: a 240px journal list, the timeline, then the entry at a reading width
    layout: {
      containerMax: { sm: '30rem', md: '42rem', lg: '64rem' },
      containerPadding: 'clamp(1rem, 4vw, 2rem)',
      gridGap: 'var(--m-space-4)',
      splitSide: '15rem',
    },
    // Pills: deep blue for the one that matters, a grey fill for the rest, blue text when plain
    button: {
      radius: '9999px',
      fontSize: 'var(--m-font-size-md)',
      fontWeight: 'var(--m-font-weight-semibold)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      primary: { border: 'transparent' },
      secondary: {
        bg: 'var(--m-color-bg-sunken)',
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        hoverBg: { light: '#e5e5ea', dark: '#2c2c2e' },
        activeBg: { light: '#d8d8de', dark: '#3a3a3c' },
      },
      ghost: {
        fg: 'var(--m-color-accent-text)',
        hoverBg: 'var(--m-color-bg-sunken)',
        activeBg: { light: '#e5e5ea', dark: '#2c2c2e' },
      },
      danger: { border: 'transparent' },
    },
    // Grouped panels: a grey fill with large corners and no border or shadow
    card: {
      bg: 'var(--m-color-bg-sunken)',
      border: 'transparent',
      radius: '20px',
      shadow: 'none',
      hoverShadow: 'none',
      hoverBorder: 'transparent',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-3)', md: 'var(--m-space-5)', lg: 'var(--m-space-6)' },
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-bold)',
      descriptionFg: 'var(--m-color-fg-muted)',
      outline: { bg: 'var(--m-color-bg-surface)', border: 'var(--m-color-border-default)' },
      sunken: { bg: 'var(--m-color-bg-canvas)', border: 'transparent' },
    },
    divider: { color: 'var(--m-color-border-default)' },
    input: {
      radius: '10px',
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-strong)',
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-border-focus)',
      paddingX: { sm: 'var(--m-space-3)', md: 'var(--m-space-3)', lg: 'var(--m-space-4)' },
    },
    select: { radius: '10px', border: 'var(--m-color-border-strong)', focusBorder: 'var(--m-color-border-focus)' },
    field: {
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-medium)',
      hintFontSize: 'var(--m-font-size-sm)',
      requiredFg: 'var(--m-color-danger-fg)',
    },
    // Rounded squares that fill with the control blue when checked
    checkbox: {
      size: '1.125rem',
      radius: '5px',
      border: 'var(--m-color-border-strong)',
      hoverBorder: 'var(--m-color-border-focus)',
      checkedBg: '#248bd9',
      checkedBorder: '#248bd9',
    },
    radio: { size: '1.125rem', border: 'var(--m-color-border-strong)', checkedBg: '#248bd9', checkedBorder: '#248bd9' },
    // The platform switch: wide, a round white knob, blue when on
    switch: {
      width: '2.75rem',
      height: '1.625rem',
      smWidth: '2.125rem',
      smHeight: '1.25rem',
      trackBg: 'var(--m-color-border-strong)',
      trackCheckedBg: '#248bd9',
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbInset: '2px',
      thumbShadow: '0 1px 3px rgb(0 0 0 / 0.2)',
    },
    avatar: {
      size: { sm: '1.75rem', md: '2.25rem', lg: '3.5rem' },
      bg: 'var(--m-color-brand-subtle)',
      fg: 'var(--m-color-accent-text)',
      fontWeight: 'var(--m-font-weight-semibold)',
    },
    // Plan comparisons: an outlined panel, capital column labels, hairline rows
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: 'var(--m-space-4)',
      cellPaddingY: 'calc(0.625rem * var(--m-density))',
      borderColor: 'var(--m-color-border-default)',
      headerBg: 'var(--m-color-bg-surface)',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-semibold)',
      headerTransform: 'uppercase',
      headerTracking: 'var(--m-font-tracking-wide)',
      rowHoverBg: 'var(--m-color-bg-sunken)',
      stripeBg: 'var(--m-color-bg-surface)',
      wrapBorder: 'var(--m-color-border-default)',
      wrapRadius: '14px',
    },
    breadcrumb: { separator: '"›"', currentWeight: 'var(--m-font-weight-semibold)' },
    navbar: {
      height: 'calc(4.5rem * var(--m-density))',
      paddingX: 'clamp(1rem, 3vw, 2.5rem)',
      bg: 'var(--m-color-bg-canvas)',
      border: 'var(--m-color-border-muted)',
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-accent-text)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-accent-text)',
        activeBg: 'transparent',
        fontSize: 'var(--m-font-size-lg)',
        fontWeight: 'var(--m-font-weight-regular)',
      },
    },
    pagination: {
      radius: '9999px',
      border: 'transparent',
      fg: 'var(--m-color-fg-default)',
      hoverBg: 'var(--m-color-bg-sunken)',
      currentBg: 'var(--m-color-accent-default)',
      currentFg: '#ffffff',
      currentBorder: 'transparent',
    },
    // The journal list: a cool grey column, square colour swatches, counts at the right, the
    // current row a darker grey
    sidebar: {
      width: '15rem',
      bg: { light: '#e2e7ea', dark: '#1c1c1e' },
      border: 'transparent',
      padding: 'var(--m-space-3)',
      sectionGap: 'var(--m-space-4)',
      itemGap: '0px',
      fontSize: 'var(--m-font-size-md)',
      heading: {
        fg: { light: '#4f5559', dark: '#98989f' },
        size: 'var(--m-font-size-sm)',
        weight: 'var(--m-font-weight-semibold)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: { light: '#2f3436', dark: '#ffffff' },
        hoverFg: { light: '#2f3436', dark: '#ffffff' },
        hoverBg: { light: '#d6dbde', dark: '#2c2c2e' },
        activeFg: { light: '#22282b', dark: '#ffffff' },
        activeBg: { light: '#cbcfd2', dark: '#3a3a3c' },
        activeWeight: 'var(--m-font-weight-regular)',
        radius: '8px',
        paddingX: 'var(--m-space-3)',
        paddingY: 'calc(0.4375rem * var(--m-density))',
      },
      count: { bg: 'transparent', fg: { light: '#50565a', dark: '#98989f' } },
    },
    // Text tabs: grey until current, the current one in ink with a short bar under it
    tabs: {
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-fg-default)',
      indicatorWidth: '3px',
      listBorder: 'var(--m-color-border-default)',
      // The segmented control: a grey track with a white segment
      pill: {
        listBg: 'var(--m-color-bg-sunken)',
        listRadius: '9999px',
        listPadding: '3px',
        radius: '9999px',
        activeBg: { light: '#ffffff', dark: '#3a3a3c' },
        activeShadow: '0 1px 3px rgb(0 0 0 / 0.12)',
      },
    },
    // Callouts: a pale tint, 14px corners, no border, no side stripe
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '14px',
      padding: 'var(--m-space-4)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // Tags and plan marks: small rounded pills, no border
    badge: {
      height: '1.375rem',
      radius: '9999px',
      borderWidth: '0px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-semibold)',
      neutral: {
        bg: 'var(--m-color-bg-sunken)',
        fg: 'var(--m-color-fg-muted)',
        border: 'transparent',
        solidBg: 'var(--m-color-bg-inverse)',
        solidFg: 'var(--m-color-fg-inverse)',
      },
    },
    progress: {
      height: { sm: '0.25rem', md: '0.375rem', lg: '0.5rem' },
      radius: '9999px',
      track: { light: '#f2f2f7', dark: '#2c2c2e' },
      fill: '#248bd9',
    },
    skeleton: {
      bg: { light: '#f2f2f7', dark: '#1c1c1e' },
      highlight: { light: '#fafafc', dark: '#2c2c2e' },
      radius: '6px',
      blockRadius: '14px',
    },
    spinner: { thickness: '2px', color: '#248bd9' },
    // Floating banners: white on the overlay shadow, rounded, no stripe
    toast: {
      border: 'transparent',
      accentWidth: '0px',
      radius: '14px',
      shadow: 'var(--m-shadow-overlay)',
      bg: 'var(--m-color-bg-raised)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // Sheets: 14px corners on the overlay shadow, a bold title, buttons at the right
    dialog: {
      border: 'transparent',
      radius: '14px',
      padding: 'var(--m-space-6)',
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    // Menus: a white panel, 10px corners, rows that fill with the control blue (white text)
    popover: {
      border: 'transparent',
      radius: '10px',
      shadow: 'var(--m-shadow-overlay)',
      padding: '5px',
      item: {
        height: '1.75rem',
        radius: '5px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: 'var(--m-color-accent-default)',
        hoverFg: '#ffffff',
      },
      separator: 'var(--m-color-border-default)',
    },
    usage: { height: '0.375rem', track: { light: '#f2f2f7', dark: '#2c2c2e' }, okFill: '#248bd9' },
    tooltip: {
      radius: '6px',
      shadow: 'var(--m-shadow-md)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
      delay: '500ms',
    },
    kbd: {
      radius: '5px',
      border: 'var(--m-color-border-default)',
      shadow: 'none',
      fontWeight: 'var(--m-font-weight-medium)',
    },
    code: { radius: '10px', inlineRadius: '4px', border: 'transparent', bg: 'var(--m-color-bg-sunken)' },
    // Questions as hairline rows on white
    accordion: {
      radius: '0',
      bg: 'transparent',
      paddingX: '0',
      paddingY: 'var(--m-space-4)',
      summarySize: 'var(--m-font-size-lg)',
      summaryWeight: 'var(--m-font-weight-semibold)',
      hoverBg: 'transparent',
    },
    // Entry text: the display face, a size up, a generous measure, in the softer ink
    prose: {
      maxWidth: '40rem',
      fg: { light: '#333b40', dark: '#ebebf0' },
      fontSize: 'var(--m-font-size-lg)',
      lineHeight: '1.65',
      headingFg: 'var(--m-color-fg-default)',
      linkFg: 'var(--m-color-accent-text)',
      quoteFg: 'var(--m-color-fg-muted)',
      quoteBorder: 'var(--m-color-border-default)',
      quoteStyle: 'normal',
      imageRadius: '6px',
    },
    chat: {
      radius: '20px',
      userBg: 'var(--m-color-bg-sunken)',
      userFg: 'var(--m-color-fg-default)',
      userBorder: 'transparent',
      assistantBorder: 'transparent',
      avatarBg: 'var(--m-color-brand-subtle)',
      avatarFg: 'var(--m-color-accent-text)',
    },
    composer: { radius: '22px', shadow: 'var(--m-shadow-md)' },
    citation: { chipRadius: '9999px' },
    toolCall: { radius: '14px' },
  },
});
