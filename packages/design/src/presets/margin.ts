import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Margin: a reading-first, editorial interface. A quiet slate-ink sans for the chrome on white, a
 * pale grey side rail, a calm serif for documents, yellow highlights with a darker underline and
 * lavender for annotated ones, small uppercase labels, keyboard hints everywhere, pill buttons in
 * soft grey fills and one restrained blue. Dark mode is a deep blue-slate. Category: editorial and
 * warm-neutral. The values are measured, not invented (see DESIGN.md).
 */
export const margin = extendTheme(minimal, {
  name: 'margin',
  label: 'Margin',
  description:
    'Reading first: slate ink on white, a pale grey rail, a calm serif for documents, yellow highlights, soft grey pill buttons, one restrained blue and a deep slate dark mode.',
  tokens: {
    color: {
      bg: {
        // The panes are white; the side rail and quiet panels are the pale grey canvas
        canvas: { light: '#ffffff', dark: '#151c23' },
        surface: { light: '#ffffff', dark: '#151c23' },
        // Menus, popovers, the toast in dark mode: white, or the lifted slate
        raised: { light: '#ffffff', dark: '#28313b' },
        // The side rail (the reference's own "canvas"): a pale grey, darker than the panes in dark
        sunken: { light: '#f8f9fa', dark: '#10161d' },
        overlay: { light: 'rgb(40 49 59 / 0.3)', dark: 'rgb(0 0 0 / 0.5)' },
        // Toasts: near-black slate in light mode, white in dark
        inverse: { light: '#151c23', dark: '#e0e3e6' },
      },
      fg: {
        default: { light: '#28313b', dark: '#e0e3e6' },
        muted: { light: '#616c77', dark: '#959faa' },
        // The reference's tertiary grey (#88929c light, #6e7883 dark) is under 4.5:1; these are
        // its nearest passing steps on the same slate ramp
        subtle: { light: '#6a747f', dark: '#8f99a3' },
        inverse: { light: '#e0e3e6', dark: '#28313b' },
      },
      border: {
        // Hairlines: neutral-90 and -95 (light), neutral-20 and -15 (dark)
        default: { light: '#e0e3e6', dark: '#28313b' },
        muted: { light: '#f0f1f2', dark: '#1f272f' },
        // Control borders: the reference's #c1c7ce is 1.7:1; this is the nearest step at 3:1
        strong: { light: '#838c96', dark: '#959faa' },
        // The focus ring: blue-60, one step deeper in light mode to clear 3:1 on the grey rail
        focus: { light: '#488aee', dark: '#5292f1' },
      },
      // The one blue. Light: blue-50 (#2d75e5) a hair deeper so white text clears 4.5:1. Dark: blue-70
      // with black text, as the reference sets it
      accent: {
        default: { light: '#2b73e3', dark: '#76b2ed' },
        hover: { light: '#1a59c8', dark: '#a8ccef' },
        active: { light: '#25438f', dark: '#cfe7fd' },
        // The blue at 6% (light) and 15% (dark): the soft "primary" button and the selected row
        subtle: { light: '#f2f5fc', dark: '#192940' },
        fg: { light: '#ffffff', dark: '#000000' },
        text: { light: '#216ad6', dark: '#76b2ed' },
      },
      // The highlighter: a pale yellow wash with a 2px deeper underline. In dark, the same yellow at
      // 15% and 80% over the slate
      brand: {
        default: { light: '#ffcc00', dark: '#d0b007' },
        fg: { light: '#28313b', dark: '#151c23' },
        subtle: { light: '#fff3b0', dark: '#38381e' },
      },
      success: {
        bg: { light: '#eefdee', dark: '#152114' },
        fg: { light: '#328235', dark: '#43ac47' },
        border: { light: '#c4f3c2', dark: '#233823' },
        solid: { light: '#328235', dark: '#43ac47' },
        onSolid: { light: '#ffffff', dark: '#10161d' },
      },
      warning: {
        bg: { light: '#fcf9ed', dark: '#2c1701' },
        fg: { light: '#c34d1e', dark: '#fa8b25' },
        border: { light: '#fae0af', dark: '#4b290d' },
        solid: { light: '#fa8b25', dark: '#fa8b25' },
        onSolid: { light: '#28313b', dark: '#10161d' },
      },
      danger: {
        bg: { light: '#fff6f3', dark: '#2b1612' },
        fg: { light: '#c03c36', dark: '#f76b60' },
        border: { light: '#f9dcd2', dark: '#4d2520' },
        solid: { light: '#ce3e38', dark: '#f65c52' },
        onSolid: { light: '#ffffff', dark: '#10161d' },
      },
      // Info is the reference's indigo (backlinks, the assistant). Its border is the lavender of an
      // annotated highlight
      info: {
        bg: { light: '#f8f7fe', dark: '#1e1636' },
        fg: { light: '#693fc6', dark: '#aca0e6' },
        border: { light: '#cdcdfe', dark: '#362c57' },
        solid: { light: '#8059e4', dark: '#957de8' },
        onSolid: { light: '#ffffff', dark: '#10161d' },
      },
      // Selected text: the blue at 30%
      selection: {
        bg: { light: '#b2d4ff', dark: '#0f3665' },
        fg: { light: '#28313b', dark: '#e0e3e6' },
      },
    },
    font: {
      family: {
        // The reference's own faces, all open: Inter for the interface, Source Serif 4 for reading,
        // Roboto Mono for code
        sans: '"Inter Variable", "Inter", ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        serif: '"Source Serif 4 Variable", "Source Serif 4", Georgia, serif',
        display: '"Source Serif 4 Variable", "Source Serif 4", Georgia, serif',
        mono: '"Roboto Mono Variable", "Roboto Mono", ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
      },
      // The interface scale: 11, 12, 14 (base), 16, 20; then the reading heading steps
      size: {
        xs: '0.6875rem',
        sm: '0.75rem',
        md: '0.875rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.8rem',
        '3xl': '2.25rem',
        '4xl': '3.25rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.25', normal: '1.43', relaxed: '1.6' },
      tracking: { tight: '-0.011em', normal: '0', wide: '0.06em' },
      body: { weight: '400' },
      // Titles are the reading serif at 600, set slightly tight
      heading: { weight: '600', tracking: '-0.015em' },
    },
    control: {
      height: {
        sm: 'calc(1.75rem * var(--m-density))',
        md: 'calc(2rem * var(--m-density))',
        lg: 'calc(2.5rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.625rem * var(--m-density))',
        md: 'calc(0.75rem * var(--m-density))',
        lg: 'calc(1.25rem * var(--m-density))',
      },
      fontSize: '0.875rem',
    },
    // 4px tags, 6px toasts and rows, 8px inputs, cards and menus, 12px dialogs; pill buttons
    radius: { sm: '4px', md: '6px', lg: '12px', control: '8px', container: '8px' },
    shadow: {
      // The reference's four elevations: a faint 1px ring plus soft drops
      sm: {
        light: '0 0 0 1px rgb(60 64 67 / 0.05), 0 1px 4px rgb(60 64 67 / 0.1)',
        dark: '0 0 0 1px rgb(0 0 0 / 0.05), 0 1px 4px rgb(0 0 0 / 0.1)',
      },
      md: {
        light: '0 0 0 1px rgb(60 64 67 / 0.05), 0 1.5px 4px rgb(60 64 67 / 0.1), 0 3px 10px rgb(60 64 67 / 0.2)',
        dark: '0 0 0 1px rgb(0 0 0 / 0.05), 0 1.5px 4px rgb(0 0 0 / 0.1), 0 3px 10px rgb(0 0 0 / 0.2)',
      },
      lg: {
        light: '0 0 0 1px rgb(60 64 67 / 0.05), 0 3px 5px rgb(60 64 67 / 0.1), 0 6px 24px rgb(60 64 67 / 0.2)',
        dark: '0 0 0 1px rgb(0 0 0 / 0.05), 0 3px 5px rgb(0 0 0 / 0.1), 0 6px 24px rgb(0 0 0 / 0.25)',
      },
      overlay: {
        light:
          '0 0 0 1px rgb(60 64 67 / 0.05), 0 5px 12px rgb(60 64 67 / 0.1), 0 12px 32px rgb(60 64 67 / 0.2), 0 20px 96px rgb(60 64 67 / 0.1)',
        dark: '0 0 0 1px rgb(0 0 0 / 0.05), 0 5px 12px rgb(0 0 0 / 0.1), 0 12px 32px rgb(0 0 0 / 0.2), 0 20px 96px rgb(0 0 0 / 0.4)',
      },
    },
    // A 2px ring flush with the control, as the reference draws it
    focus: { offset: '0px' },
    motion: {
      duration: { fast: '150ms', normal: '200ms', slow: '300ms' },
      easing: { standard: 'cubic-bezier(0.42, 0, 0.58, 1)', emphasized: 'cubic-bezier(0, 0, 0.58, 1)' },
    },
  },
  components: {
    // A 240px rail, then panes; reading columns are 648px (40.5rem) at most
    layout: {
      containerMax: { sm: '30rem', md: '40.5rem', lg: '64rem' },
      containerPadding: 'clamp(1rem, 3vw, 1.875rem)',
      gridGap: 'var(--m-space-4)',
      gridMin: '13rem',
      splitSide: '15rem',
      splitGap: 'var(--m-space-8)',
    },
    // Pills at weight 500. Primary is the solid blue; the default is a soft grey fill (slate at 6%);
    // the destructive one is a red tint with red text
    button: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-medium)',
      shadow: 'none',
      primary: { border: 'transparent' },
      secondary: {
        bg: { light: '#f2f3f3', dark: '#222a30' },
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        hoverBg: { light: '#ececed', dark: '#272e36' },
        activeBg: { light: '#e5e6e7', dark: '#2b333b' },
      },
      // Ghost buttons take the colour of what they sit in, as the reference's unstyled buttons do
      // (so a toolbar icon on a dark toast stays light)
      ghost: {
        fg: 'currentColor',
        hoverBg: { light: '#f2f3f3', dark: '#222a30' },
        activeBg: { light: '#ececed', dark: '#272e36' },
      },
      danger: {
        bg: { light: '#fdf4f3', dark: '#322126' },
        fg: 'var(--m-color-danger-fg)',
        border: 'transparent',
        hoverBg: { light: '#fbeeed', dark: '#3c2328' },
        activeBg: { light: '#fae8e7', dark: '#462529' },
      },
    },
    // Document cards: white, a hairline, 8px corners, no shadow until hover
    card: {
      border: 'var(--m-color-border-default)',
      shadow: 'none',
      hoverShadow: {
        light: '0 1.5px 4px rgb(60 64 67 / 0.03), 0 3px 10px rgb(60 64 67 / 0.1)',
        dark: '0 1.5px 4px rgb(0 0 0 / 0.03), 0 2px 8px rgb(0 0 0 / 0.3)',
      },
      hoverBorder: { light: '#c1c7ce', dark: '#545f6b' },
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-3)', md: 'var(--m-space-4)', lg: 'var(--m-space-6)' },
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
      descriptionSize: 'var(--m-font-size-sm)',
    },
    input: {
      hoverBorder: 'var(--m-color-fg-subtle)',
      focusBorder: 'var(--m-color-border-focus)',
      paddingX: { sm: 'var(--m-space-2)', md: 'var(--m-space-3)', lg: 'var(--m-space-3)' },
    },
    field: {
      labelFontWeight: 'var(--m-font-weight-medium)',
      labelFontSize: 'var(--m-font-size-md)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    checkbox: { size: '1rem', radius: '4px' },
    // A small blue toggle, grey when off
    switch: {
      width: '2.125rem',
      height: '1.25rem',
      smWidth: '1.75rem',
      smHeight: '1rem',
      // Off: the control grey (dark: neutral-50, so the white knob keeps 3:1)
      trackBg: { light: '#838c96', dark: '#6e7883' },
      thumbBg: '#ffffff',
      thumbCheckedBg: { light: '#ffffff', dark: '#10161d' },
    },
    // Lists and tables: no frame, no header fill, small uppercase column labels, hairline rows
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: 'var(--m-space-3)',
      cellPaddingY: 'calc(0.625rem * var(--m-density))',
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-medium)',
      headerTransform: 'uppercase',
      headerTracking: 'var(--m-font-tracking-wide)',
      rowHoverBg: 'var(--m-color-bg-sunken)',
      stripeBg: 'var(--m-color-bg-sunken)',
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    // The 240px rail: pale grey, dark labels with grey icons, a grey fill for the current row
    sidebar: {
      width: '15rem',
      bg: 'var(--m-color-bg-sunken)',
      border: 'var(--m-color-border-default)',
      padding: 'var(--m-space-3)',
      sectionGap: 'var(--m-space-4)',
      itemGap: '1px',
      fontSize: 'var(--m-font-size-md)',
      heading: {
        fg: 'var(--m-color-fg-muted)',
        size: 'var(--m-font-size-sm)',
        weight: 'var(--m-font-weight-medium)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#f0f1f2', dark: '#1e252d' },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: '#eaecee', dark: '#28313b' },
        activeWeight: 'var(--m-font-weight-medium)',
        radius: '6px',
        paddingX: 'var(--m-space-2)',
        paddingY: 'calc(0.3125rem * var(--m-density))',
      },
      count: { bg: 'transparent', fg: 'var(--m-color-fg-muted)' },
    },
    // The public site's header: no fill, no rule, plain links, a grey pill at the right
    navbar: {
      height: 'calc(4.75rem * var(--m-density))',
      paddingX: 'clamp(1rem, 4vw, 3rem)',
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      brandFamily: 'var(--m-font-body-family)',
      brandWeight: 'var(--m-font-weight-semibold)',
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
        fontSize: 'var(--m-font-size-lg)',
        fontWeight: 'var(--m-font-weight-regular)',
        radius: '9999px',
      },
    },
    // Underline tabs in ink, not blue; segments are pills on a grey track
    tabs: {
      fontWeight: 'var(--m-font-weight-medium)',
      listGap: 'var(--m-space-4)',
      paddingX: 'var(--m-space-1)',
      height: 'calc(2.5rem * var(--m-density))',
      fg: 'var(--m-color-fg-muted)',
      indicator: 'var(--m-color-fg-default)',
      pill: {
        listBg: { light: '#f0f1f2', dark: '#222a30' },
        listRadius: '9999px',
        listPadding: '3px',
        radius: '9999px',
        activeBg: { light: '#ffffff', dark: '#28313b' },
        activeShadow: '0 1px 4px rgb(0 0 0 / 0.1)',
      },
    },
    breadcrumb: { separator: '"›"', currentWeight: 'var(--m-font-weight-medium)' },
    pagination: {
      radius: '9999px',
      fg: 'var(--m-color-fg-muted)',
      hoverBg: { light: '#f2f3f3', dark: '#222a30' },
      currentBg: { light: '#eaecee', dark: '#28313b' },
      currentFg: 'var(--m-color-fg-default)',
      currentBorder: 'transparent',
    },
    // Tags: a 4px grey chip, no border; tone chips are soft tints
    badge: {
      height: '1.25rem',
      paddingX: '0.375rem',
      radius: '4px',
      borderWidth: '0px',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
      neutral: {
        bg: { light: '#f2f3f3', dark: '#222a30' },
        fg: 'var(--m-color-fg-muted)',
        border: 'transparent',
      },
    },
    avatar: {
      size: { sm: '1.5rem', md: '2rem', lg: '2.5rem' },
      bg: { light: '#e0e3e6', dark: '#28313b' },
      fg: { light: '#545f6b', dark: '#c1c7ce' },
      fontWeight: 'var(--m-font-weight-medium)',
    },
    // Inline notices: a soft tint, 6px corners, no border, no stripe
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '6px',
      padding: 'var(--m-space-2) var(--m-space-3)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // Toasts: near-black slate with light text in light mode, white in dark
    toast: {
      bg: 'var(--m-color-bg-inverse)',
      fg: 'var(--m-color-fg-inverse)',
      bodyFg: { light: '#b1b9c2', dark: '#48535f' },
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '6px',
      shadow: '0 1px 10px 0 rgb(0 0 0 / 0.1), 0 2px 15px 0 rgb(0 0 0 / 0.05)',
      padding: 'var(--m-space-3) var(--m-space-4)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-medium)',
      width: '25rem',
    },
    dialog: {
      border: 'transparent',
      radius: '12px',
      padding: 'var(--m-space-6)',
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // Menus: white, 8px, the soft lift with a faint ring; grey rows; shortcuts at the right
    popover: {
      border: 'transparent',
      radius: '8px',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-1)',
      minWidth: '13rem',
      item: {
        height: 'calc(2rem * var(--m-density))',
        radius: '4px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: { light: '#f2f3f3', dark: '#323b45' },
      },
      shortcutFg: 'var(--m-color-fg-subtle)',
      separator: 'var(--m-color-border-default)',
    },
    tooltip: {
      bg: { light: '#3e4046', dark: '#ffffff' },
      fg: { light: '#e0e3e6', dark: '#202226' },
      radius: '4px',
      shadow: 'none',
      fontSize: 'var(--m-font-size-sm)',
      delay: '300ms',
    },
    // Reading progress: a 3px line on a grey track
    progress: {
      height: { sm: '0.125rem', md: '0.1875rem', lg: '0.375rem' },
      track: { light: '#e0e3e6', dark: '#28313b' },
      fill: 'var(--m-color-accent-default)',
    },
    usage: {
      height: '0.25rem',
      track: { light: '#e0e3e6', dark: '#28313b' },
      okFill: 'var(--m-color-accent-default)',
    },
    skeleton: {
      bg: { light: '#ededed', dark: '#222a30' },
      highlight: { light: '#f8f9fa', dark: '#2b333b' },
      radius: '4px',
      blockRadius: '8px',
    },
    spinner: { thickness: '2px' },
    // Shortcut keys: a grey chip in the interface face, no border
    kbd: {
      fontFamily: 'var(--m-font-body-family)',
      fontWeight: 'var(--m-font-weight-medium)',
      bg: { light: '#f0f1f2', dark: '#222a30' },
      fg: 'var(--m-color-fg-muted)',
      border: 'transparent',
      radius: '4px',
      shadow: 'none',
      paddingX: '0.3125rem',
    },
    // Inline code in a reading pane is a dark red on a faint grey chip
    code: {
      bg: 'var(--m-color-bg-sunken)',
      border: 'var(--m-color-border-default)',
      radius: '6px',
      inlineBg: { light: '#f5f6f7', dark: '#202730' },
      inlineFg: { light: '#a73832', dark: '#fab960' },
      inlineBorder: { light: '#e5e6e7', dark: '#333c46' },
      inlineRadius: '4px',
    },
    accordion: {
      radius: '0',
      bg: 'transparent',
      paddingX: '0',
      paddingY: 'var(--m-space-5)',
      summarySize: 'var(--m-font-size-lg)',
      summaryWeight: 'var(--m-font-weight-semibold)',
      hoverBg: 'transparent',
    },
    // The reading pane: 20px text, 1.6 leading, a 612px measure; set it in the serif (see DESIGN.md)
    prose: {
      maxWidth: '38.25rem',
      fontSize: 'var(--m-font-size-xl)',
      smallFontSize: 'var(--m-font-size-lg)',
      lineHeight: '1.6',
      flow: '1.25rem',
      headingFlow: 'var(--m-space-8)',
      h1Size: 'var(--m-font-size-2xl)',
      h2Size: '1.5rem',
      h3Size: 'var(--m-font-size-xl)',
      h4Size: 'var(--m-font-size-xl)',
      h2Border: 'transparent',
      linkFg: { light: '#0d1e8e', dark: '#aec8f1' },
      quoteFg: 'var(--m-color-fg-default)',
      quoteBorder: 'var(--m-color-accent-default)',
      quoteStyle: 'italic',
      imageRadius: '4px',
    },
    // The document chat: your questions in a grey box, answers as plain text
    chat: {
      radius: '6px',
      userBg: { light: '#f0f1f2', dark: '#28313b' },
      userFg: 'var(--m-color-fg-default)',
      userBorder: 'transparent',
      assistantBg: 'transparent',
      assistantBorder: 'transparent',
      avatarBg: { light: '#e0e3e6', dark: '#28313b' },
      avatarFg: { light: '#545f6b', dark: '#c1c7ce' },
      assistantAvatarBg: 'var(--m-color-info-bg)',
      assistantAvatarFg: 'var(--m-color-info-fg)',
    },
    composer: { radius: '8px', shadow: 'none' },
    citation: { chipRadius: '4px' },
    toolCall: { radius: '6px' },
  },
});
