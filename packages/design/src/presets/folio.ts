import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Folio: a document-first workspace. Warm near-black ink on a white page, a warm off-white sidebar,
 * warm-grey hairlines, one blue for the primary action, quiet controls that only fill on hover, soft
 * tinted callouts and pale tag pills, and a warm charcoal dark mode. Category: editorial. The values
 * are measured, not invented (see DESIGN.md).
 */
export const folio = extendTheme(minimal, {
  name: 'folio',
  label: 'Folio',
  description:
    'Document-first and warm-neutral: near-black ink on a white page, a warm off-white sidebar, hover-only controls, tinted callouts and tag pills, one blue action.',
  tokens: {
    color: {
      bg: {
        // The page is white; the sidebar and quiet panels are a warm off-white
        canvas: { light: '#ffffff', dark: '#191919' },
        surface: { light: '#ffffff', dark: '#202020' },
        // Menus, popovers and dialogs
        raised: { light: '#ffffff', dark: '#252525' },
        sunken: { light: '#f9f8f7', dark: '#202020' },
        overlay: { light: 'rgb(15 15 15 / 0.6)', dark: 'rgb(15 15 15 / 0.8)' },
        // Tooltips and the solid tag: the ink itself
        inverse: { light: '#2c2c2b', dark: '#f0efed' },
      },
      fg: {
        default: { light: '#2c2c2b', dark: '#f0efed' },
        // The reference's accent-text grey (sidebar items, secondary UI); its lighter #7d7a75 is
        // 4.0:1 on the sidebar, so it is the subtle step below
        muted: { light: '#5f5e59', dark: '#ada9a3' },
        // #7d7a75 (light) and #7d7a75 (dark) moved to their nearest passing steps
        subtle: { light: '#73726e', dark: '#8e8b86' },
        inverse: { light: '#f0efed', dark: '#191919' },
      },
      border: {
        // Warm hairlines: #e6e5e3 (the ink-brown at 11%), lighter #f0efed
        default: { light: '#e6e5e3', dark: '#383836' },
        muted: { light: '#f0efed', dark: '#2c2c2b' },
        // Controls: the reference's accent border #8e8b86 (its #d4d3cf strong border is 1.5:1)
        strong: { light: '#8e8b86', dark: '#7d7a75' },
        focus: { light: '#2383e2', dark: '#2383e2' },
      },
      // The blue: the reference's hover step #0077d4 is the default, because white on its #2383e2
      // is 3.9:1; hover and pressed follow its own darker steps
      accent: {
        default: { light: '#0077d4', dark: '#0077d4' },
        hover: { light: '#006bc7', dark: '#006bc7' },
        active: { light: '#105fad', dark: '#105fad' },
        subtle: { light: '#e5f2fc', dark: '#233850' },
        fg: '#ffffff',
        text: { light: '#006bc7', dark: '#4fa7ff' },
      },
      // The signature is the ink itself: near-black marks and bands, on a warm beige panel
      brand: {
        default: { light: '#191919', dark: '#f0efed' },
        fg: { light: '#ffffff', dark: '#191919' },
        subtle: { light: '#fbf8f3', dark: '#25201d' },
      },
      // The classic green, red, yellow and blue: pale tints with a deeper step of the same hue for text
      success: {
        bg: { light: '#edf3ec', dark: '#222b26' },
        fg: { light: '#33684e', dark: '#6cb38a' },
        border: { light: '#d7e6dd', dark: '#263d30' },
        solid: { light: '#448361', dark: '#529e72' },
        onSolid: { light: '#ffffff', dark: '#191919' },
      },
      warning: {
        bg: { light: '#fbf3db', dark: '#392e1e' },
        fg: { light: '#835e33', dark: '#ca984d' },
        border: { light: '#f2e3b7', dark: '#504425' },
        solid: { light: '#cb912f', dark: '#d99e35' },
        onSolid: { light: '#2c2c2b', dark: '#191919' },
      },
      danger: {
        bg: { light: '#fdebec', dark: '#362422' },
        fg: { light: '#ae2f2e', dark: '#e07a76' },
        border: { light: '#f7d9d5', dark: '#502c29' },
        solid: { light: '#cd3c3a', dark: '#de5550' },
        onSolid: { light: '#ffffff', dark: '#191919' },
      },
      info: {
        bg: { light: '#e7f3f8', dark: '#1d282e' },
        fg: { light: '#2d6387', dark: '#379ad3' },
        border: { light: '#cee3f7', dark: '#143a4e' },
        solid: { light: '#0077d4', dark: '#0077d4' },
        onSolid: '#ffffff',
      },
      // The blue at 28% over the page
      selection: {
        bg: { light: '#c2dcf7', dark: '#1c3751' },
        fg: { light: '#2c2c2b', dark: '#f0efed' },
      },
    },
    font: {
      family: {
        // The reference sets its UI in the system face (SF Pro, Segoe UI) and its site in its own Inter
        sans: '"Inter Variable", "Inter", ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
        display: '"Inter Variable", "Inter", ui-sans-serif, -apple-system, system-ui, "Segoe UI", Helvetica, sans-serif',
        // The page's serif option
        serif: '"Source Serif 4 Variable", "Source Serif 4", ui-serif, Georgia, Cambria, "Times New Roman", serif',
        mono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
      },
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.5rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.2', normal: '1.5', relaxed: '1.6' },
      tracking: { tight: '-0.01em', normal: '0', wide: '0.02em' },
      body: { weight: '400' },
      heading: { weight: '600', tracking: '-0.01em' },
    },
    control: {
      height: {
        sm: 'calc(1.75rem * var(--m-density))',
        md: 'calc(2rem * var(--m-density))',
        lg: 'calc(2.5rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.5rem * var(--m-density))',
        md: 'calc(0.75rem * var(--m-density))',
        lg: 'calc(1rem * var(--m-density))',
      },
      fontSize: '0.875rem',
    },
    // 4px tags and rows, 6px buttons and inputs, 10px cards, menus and board columns
    radius: { sm: '4px', md: '6px', lg: '10px', control: '6px', container: '10px' },
    shadow: {
      // A hairline ring and a short drop (buttons, outlined controls)
      sm: {
        light: '0 2px 4px rgb(0 0 0 / 0.04), 0 0 0 1px rgb(42 28 0 / 0.07)',
        dark: '0 0 0 1px #383836, 0 2px 4px rgb(25 25 25 / 0.08)',
      },
      // Board cards: a warm ring and a faint, wide drop
      md: {
        light: '0 4px 12px rgb(25 25 25 / 0.027), 0 1px 2px rgb(25 25 25 / 0.02), 0 0 0 1px rgb(42 28 0 / 0.07)',
        dark: '0 0 0 1px #383836, 0 4px 12px -2px rgb(25 25 25 / 0.08)',
      },
      lg: {
        light: '0 20px 24px rgb(25 25 25 / 0.05), 0 5px 8px rgb(25 25 25 / 0.027), 0 0 0 1px rgb(42 28 0 / 0.07)',
        dark: '0 0 0 1px #383836, 0 14px 28px -6px rgb(25 25 25 / 0.2), 0 2px 4px -1px rgb(25 25 25 / 0.12)',
      },
      // Menus, popovers and dialogs
      overlay: {
        light: '0 14px 28px -6px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06), 0 0 0 1px rgb(28 19 1 / 0.11)',
        dark: 'inset 0 0 0 1px rgb(255 255 235 / 0.1), 0 14px 28px -6px rgb(0 0 0 / 0.2), 0 2px 4px -1px rgb(0 0 0 / 0.12)',
      },
    },
    focus: { width: '2px', offset: '1px' },
    motion: {
      duration: { fast: '100ms', normal: '200ms', slow: '300ms' },
      easing: { standard: 'ease', emphasized: 'cubic-bezier(0.2, 0, 0, 1)' },
    },
  },
  components: {
    // A 240px sidebar beside a page column of 708px with 96px gutters; full-width pages go wider
    layout: {
      containerMax: { sm: '22.5rem', md: '44.25rem', lg: '75rem' },
      containerPadding: 'clamp(1rem, 6vw, 6rem)',
      gridGap: 'var(--m-space-4)',
      splitSide: '15rem',
      splitGap: '0',
    },
    // Quiet buttons: a blue fill for the one action, a hairline outline for the rest, text-only in bars
    button: {
      fontWeight: 'var(--m-font-weight-medium)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      primary: { border: 'transparent' },
      secondary: {
        bg: 'transparent',
        fg: 'var(--m-color-fg-default)',
        border: { light: '#e6e5e3', dark: '#383836' },
        hoverBg: { light: '#f3f3f3', dark: '#2c2c2c' },
        activeBg: { light: '#dfdfde', dark: '#2f2f2f' },
      },
      ghost: {
        fg: 'var(--m-color-fg-muted)',
        hoverBg: { light: '#f3f3f3', dark: '#2c2c2c' },
        activeBg: { light: '#dfdfde', dark: '#2f2f2f' },
      },
      danger: { border: 'transparent', hoverBg: { light: '#ae2f2e', dark: '#e65b58' }, activeBg: { light: '#862120', dark: '#c94a46' } },
    },
    // Board cards: white, 10px corners, a warm ring and a whisper of shadow, no lift
    card: {
      border: 'transparent',
      shadow: 'var(--m-shadow-md)',
      hoverShadow: 'var(--m-shadow-md)',
      hoverBorder: 'transparent',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-3)', md: 'var(--m-space-4)', lg: 'var(--m-space-6)' },
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-semibold)',
      descriptionSize: 'var(--m-font-size-xs)',
      sunken: { bg: { light: '#f9f8f7', dark: '#202020' }, border: 'transparent' },
    },
    // Inputs: a faint warm fill and a hairline box; focus is a blue ring
    input: {
      bg: { light: '#fdfdfc', dark: '#202020' },
      hoverBorder: 'var(--m-color-fg-subtle)',
      focusBorder: '#2383e2',
      invalidBorder: { light: '#cd3c3a', dark: '#de5550' },
      paddingX: { sm: 'var(--m-space-2)', md: 'var(--m-space-2)', lg: 'var(--m-space-3)' },
      paddingY: 'var(--m-space-1)',
    },
    field: {
      gap: 'var(--m-space-1)',
      labelFg: 'var(--m-color-fg-muted)',
      labelFontSize: 'var(--m-font-size-xs)',
      labelFontWeight: 'var(--m-font-weight-medium)',
      hintFontSize: 'var(--m-font-size-xs)',
      hintFg: 'var(--m-color-fg-subtle)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    // Square to-do boxes with a 1.5px ink edge that fill blue when done
    checkbox: {
      size: '1rem',
      radius: '3px',
      borderWidth: '1.5px',
      border: 'var(--m-color-fg-muted)',
      hoverBorder: 'var(--m-color-fg-default)',
      checkedBg: { light: '#2383e2', dark: '#2383e2' },
      checkedBorder: { light: '#2383e2', dark: '#2383e2' },
    },
    // A small rounded switch: warm grey off, blue on
    switch: {
      width: '1.875rem',
      height: '1.125rem',
      smWidth: '1.625rem',
      smHeight: '1rem',
      trackBg: 'var(--m-color-border-strong)',
      trackCheckedBg: { light: '#2383e2', dark: '#2383e2' },
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbShadow: '0 1px 2px rgb(15 15 15 / 0.2)',
    },
    // Database tables: no frame or header fill, light grey headers in sentence case, warm hairlines
    table: {
      fontSize: 'var(--m-font-size-sm)',
      cellPaddingX: 'var(--m-space-2)',
      cellPaddingY: 'calc(0.4375rem * var(--m-density))',
      borderColor: 'var(--m-color-border-default)',
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-subtle)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-regular)',
      headerTransform: 'none',
      headerTracking: '0',
      rowHoverBg: { light: '#fcfcfb', dark: '#1e1e1e' },
      stripeBg: 'var(--m-color-bg-sunken)',
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    // The warm off-white sidebar: 14px items in grey ink, quiet section labels, a soft grey current row
    sidebar: {
      width: '15rem',
      bg: 'var(--m-color-bg-sunken)',
      border: 'var(--m-color-border-muted)',
      padding: 'var(--m-space-2)',
      sectionGap: 'var(--m-space-4)',
      itemGap: '1px',
      fontSize: 'var(--m-font-size-sm)',
      nestedIndent: 'var(--m-space-4)',
      guide: 'transparent',
      heading: {
        fg: { light: '#73726e', dark: '#8e8b86' },
        size: 'var(--m-font-size-xs)',
        weight: 'var(--m-font-weight-medium)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-muted)',
        hoverBg: { light: '#eeedeb', dark: '#2c2c2c' },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: '#efeeec', dark: '#2c2c2c' },
        activeWeight: 'var(--m-font-weight-medium)',
        radius: '6px',
        paddingX: 'var(--m-space-2)',
        paddingY: 'calc(0.3125rem * var(--m-density))',
      },
      count: { bg: 'transparent', fg: 'var(--m-color-fg-subtle)' },
    },
    // The public site's header: white, no rule, 16px ink links that fill grey on hover
    navbar: {
      height: 'calc(4rem * var(--m-density))',
      paddingX: 'clamp(1rem, 2vw, 1.5rem)',
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      link: {
        height: '1.875rem',
        paddingX: '0.625rem',
        radius: '4px',
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-regular)',
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#f3f3f3', dark: '#2c2c2c' },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: '#f3f3f3', dark: '#2c2c2c' },
      },
    },
    // View tabs: grey text, the current one in ink on a soft grey pill; underline tabs in ink
    tabs: {
      height: 'var(--m-control-height-sm)',
      paddingX: 'var(--m-space-2)',
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-muted)',
      indicator: 'var(--m-color-fg-default)',
      pill: {
        listBg: 'transparent',
        listPadding: '0',
        radius: '9999px',
        listRadius: '0',
        activeBg: { light: '#f0efed', dark: '#2f2f2f' },
        activeShadow: 'none',
      },
    },
    breadcrumb: { gap: '0.375rem', fg: 'var(--m-color-fg-default)', currentWeight: 'var(--m-font-weight-regular)' },
    pagination: {
      radius: '6px',
      fg: 'var(--m-color-fg-muted)',
      hoverBg: { light: '#f3f3f3', dark: '#2c2c2c' },
      currentBg: { light: '#f0efed', dark: '#2f2f2f' },
      currentFg: 'var(--m-color-fg-default)',
      currentBorder: 'transparent',
    },
    // Tag pills: 20px, 4px corners, a pale tint and no border, text at 12px
    badge: {
      height: '1.25rem',
      paddingX: '0.375rem',
      radius: '4px',
      borderWidth: '0px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-regular)',
      neutral: {
        bg: { light: '#e6e5e3', dark: '#383836' },
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
      },
    },
    avatar: {
      size: { sm: '1.25rem', md: '1.75rem', lg: '2.5rem' },
      bg: { light: '#f0efed', dark: '#383836' },
      fg: 'var(--m-color-fg-muted)',
      fontWeight: 'var(--m-font-weight-medium)',
      border: { light: '#e6e5e3', dark: '#383836' },
      ringColor: 'var(--m-color-bg-canvas)',
    },
    divider: { color: 'var(--m-color-border-default)', labelTransform: 'none' },
    // Callouts: a pale tint, 10px corners, no border or side stripe, ink text beside an icon
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '10px',
      padding: 'var(--m-space-4) var(--m-space-4) var(--m-space-4) var(--m-space-3)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    toast: {
      border: 'transparent',
      accentWidth: '0px',
      radius: '10px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-3) var(--m-space-4)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    dialog: {
      border: 'transparent',
      radius: '12px',
      padding: 'var(--m-space-6)',
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // Menus: white, 10px corners, a warm ring and a long soft drop, 28px rows in a 4px inset
    popover: {
      border: 'transparent',
      radius: '10px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-1)',
      minWidth: '14rem',
      item: {
        height: '1.75rem',
        paddingX: 'var(--m-space-2)',
        radius: '6px',
        hoverBg: { light: '#f3f3f3', dark: '#2c2c2c' },
      },
      labelFg: 'var(--m-color-fg-subtle)',
      separator: 'var(--m-color-border-default)',
    },
    // Ink tooltips with a second line of grey for the shortcut
    tooltip: {
      radius: '6px',
      shadow: 'none',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-medium)',
      paddingX: 'var(--m-space-2)',
      delay: '500ms',
    },
    progress: {
      height: { sm: '0.25rem', md: '0.25rem', lg: '0.5rem' },
      track: { light: '#e6e5e3', dark: '#383836' },
      fill: 'var(--m-color-success-solid)',
    },
    usage: {
      height: '0.25rem',
      track: { light: '#e6e5e3', dark: '#383836' },
      okFill: { light: '#0077d4', dark: '#4fa7ff' },
    },
    skeleton: {
      bg: { light: '#f0efed', dark: '#2c2c2b' },
      highlight: { light: '#f9f8f7', dark: '#383836' },
      radius: '4px',
      blockRadius: '10px',
    },
    spinner: { thickness: '2px', color: 'var(--m-color-fg-subtle)', track: 'var(--m-color-border-default)' },
    kbd: {
      fontFamily: 'var(--m-font-body-family)',
      fontWeight: 'var(--m-font-weight-regular)',
      bg: 'transparent',
      fg: 'var(--m-color-fg-muted)',
      border: 'var(--m-color-border-default)',
      radius: '4px',
      shadow: 'none',
    },
    // Code blocks on the warm off-white; inline code in red on a grey tint
    code: {
      bg: { light: '#f7f6f3', dark: '#202020' },
      border: 'transparent',
      radius: '10px',
      padding: 'var(--m-space-6)',
      fontSize: '0.85em',
      lineHeight: '1.5',
      headerBg: 'transparent',
      inlineBg: { light: '#f0efed', dark: '#2f2f2f' },
      inlineFg: { light: '#b8433f', dark: '#e07a76' },
      inlineBorder: 'transparent',
      inlineRadius: '4px',
      inlinePaddingX: '0.4em',
      inlineFontSize: '0.85em',
      comment: 'var(--m-color-fg-muted)',
    },
    // Toggles: no box, rows with hairlines only when separated
    accordion: {
      bg: 'transparent',
      border: 'transparent',
      radius: '0',
      paddingX: 'var(--m-space-1)',
      paddingY: 'var(--m-space-1)',
      summarySize: 'var(--m-font-size-md)',
      summaryWeight: 'var(--m-font-weight-regular)',
      hoverBg: { light: '#f3f3f3', dark: '#2c2c2c' },
      contentFg: 'var(--m-color-fg-default)',
      separatedGap: '1px',
    },
    // The page itself: 16px at 1.5, 30/24/20px headings at 600, blockquotes with a 3px ink bar
    prose: {
      maxWidth: '44.25rem',
      lineHeight: 'var(--m-font-leading-normal)',
      flow: 'var(--m-space-2)',
      headingFlow: 'var(--m-space-8)',
      headingGap: 'var(--m-space-1)',
      h2Border: 'transparent',
      linkFg: 'var(--m-color-fg-default)',
      linkDecoration: 'underline',
      markerFg: 'var(--m-color-fg-default)',
      quoteFg: 'var(--m-color-fg-default)',
      quoteBorder: 'var(--m-color-fg-default)',
      quoteBorderWidth: '3px',
      tableHeaderBg: { light: '#f7f6f3', dark: '#202020' },
      imageRadius: '4px',
    },
    // Ask-anything chat: the person's turns on a warm grey, the assistant on the page with no bubble
    chat: {
      userBg: { light: '#f0efed', dark: '#2f2f2f' },
      userBorder: 'transparent',
      assistantBg: 'transparent',
      assistantBorder: 'transparent',
      radius: '16px',
      avatarBg: { light: '#f0efed', dark: '#2f2f2f' },
      assistantAvatarBg: 'var(--m-color-bg-inverse)',
      assistantAvatarFg: 'var(--m-color-fg-inverse)',
    },
    composer: {
      border: 'var(--m-color-border-strong)',
      focusBorder: '#2383e2',
      radius: '12px',
      shadow: 'var(--m-shadow-md)',
    },
    citation: {
      chipBg: { light: '#f0efed', dark: '#2f2f2f' },
      chipFg: 'var(--m-color-fg-muted)',
      chipHoverBg: 'var(--m-color-bg-inverse)',
      chipHoverFg: 'var(--m-color-fg-inverse)',
    },
    thinking: { rule: 'var(--m-color-border-default)' },
    toolCall: { radius: '10px', bodyBg: 'var(--m-color-bg-sunken)' },
  },
});
