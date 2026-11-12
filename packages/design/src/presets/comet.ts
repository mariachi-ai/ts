import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Comet: a fast, focused, keyboard-first mail interface. Warm neutral greys from paper white to
 * warm charcoal, one muted purple for the primary action and the current row, a light-weight
 * grotesque, large split-inbox tabs with small grey counts, generous one-line rows, a command menu
 * with shortcut keys everywhere and toasts with Undo. A calm, high-contrast dark theme and a light
 * theme with the same structure. Category: dark and sharp. The values are measured or published,
 * not invented (see DESIGN.md).
 */
export const comet = extendTheme(minimal, {
  name: 'comet',
  label: 'Comet',
  description:
    'Fast and focused: warm greys, one muted purple, light grotesque type, big split tabs with counts, generous one-line rows and a command menu.',
  tokens: {
    color: {
      bg: {
        // The list pane; the icon rail and side panels are the sunken step
        canvas: { light: '#ffffff', dark: '#292827' },
        surface: { light: '#ffffff', dark: '#2e2d2b' },
        raised: { light: '#ffffff', dark: '#383634' },
        sunken: { light: '#f7f5f2', dark: '#1f1e1d' },
        overlay: { light: 'rgb(20 20 19 / 0.6)', dark: 'rgb(20 20 19 / 0.6)' },
        inverse: { light: '#292827', dark: '#f7f5f2' },
      },
      fg: {
        default: { light: '#292827', dark: '#fcfaf7' },
        // The reference's sub text: near-black at 65% over white; white at 80% over charcoal is too
        // close to default, so dark takes its warm grey 30
        muted: { light: '#666563', dark: '#bfbcb6' },
        // Grey 60 (#73716d) fails on the warm sunken step; the nearest passing steps
        subtle: { light: '#6c6a66', dark: '#a3a09b' },
        inverse: { light: '#fcfaf7', dark: '#292827' },
      },
      border: {
        // Grey 60 at 20% over white, and the rail's divider in dark
        default: { light: '#e3e2df', dark: '#474543' },
        muted: { light: '#f2f0eb', dark: '#353331' },
        // Controls: the reference's grey 40 is its 3:1 control border
        strong: { light: '#8d8a86', dark: '#8d8a86' },
        focus: { light: '#005fcc', dark: '#daedfb' },
      },
      accent: {
        // Purple 60 in light; in dark the reference's actions turn to lilac (purple 20) with dark text
        default: { light: '#714cb6', dark: '#d4c7ff' },
        hover: { light: '#533192', dark: '#bea1f5' },
        active: { light: '#3f256f', dark: '#9e7be0' },
        // The current row: purple 0 in light; in dark the reference's current row is a plain grey step
        subtle: { light: '#f7f5ff', dark: '#474543' },
        fg: { light: '#ffffff', dark: '#141413' },
        text: { light: '#714cb6', dark: '#d4c7ff' },
      },
      // The logo and product-icon colour: a deep mulberry, never an action
      brand: {
        default: { light: '#421d24', dark: '#f6aadd' },
        fg: { light: '#ffffff', dark: '#241013' },
        subtle: { light: '#fff2fa', dark: '#421d24' },
      },
      success: {
        bg: { light: '#d5f7eb', dark: '#17261f' },
        fg: { light: '#005c54', dark: '#3ac7a1' },
        border: { light: '#98ebcd', dark: '#0c4243' },
        solid: { light: '#148072', dark: '#26a28b' },
        onSolid: { light: '#ffffff', dark: '#141413' },
      },
      // The reference's warnings are orange
      warning: {
        bg: { light: '#ffe9c9', dark: '#3d2210' },
        fg: { light: '#812d00', dark: '#fdc298' },
        border: { light: '#fdc298', dark: '#812d00' },
        solid: { light: '#f18333', dark: '#f18333' },
        onSolid: '#141413',
      },
      danger: {
        bg: { light: '#fff0f0', dark: '#3d0a17' },
        fg: { light: '#9f182d', dark: '#ffa8aa' },
        border: { light: '#ffa8aa', dark: '#860628' },
        solid: { light: '#cd0037', dark: '#f72a42' },
        onSolid: { light: '#ffffff', dark: '#141413' },
      },
      // Highlight blue: the unread dot and info
      info: {
        bg: { light: '#eff8fd', dark: '#16293d' },
        fg: { light: '#0c5683', dark: '#bbdff7' },
        border: { light: '#bbdff7', dark: '#0a476d' },
        solid: { light: '#1173a8', dark: '#4198d2' },
        onSolid: { light: '#ffffff', dark: '#141413' },
      },
      selection: {
        bg: { light: '#e8e0ff', dark: '#533192' },
        fg: { light: '#292827', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // A neutral grotesque of the same width; its light weights need the variable font
        sans: '"Geist Variable", "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        display: '"Geist Variable", "Geist", ui-sans-serif, system-ui, sans-serif',
        mono: '"Geist Mono Variable", "Geist Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace',
      },
      // The app: 12 meta, 13 menus, 14 rows, 16 reading, 22 split tabs; the site: 28, 39, 49
      size: {
        xs: '0.75rem',
        sm: '0.8125rem',
        md: '0.875rem',
        lg: '1rem',
        xl: '1.375rem',
        '2xl': '1.75rem',
        '3xl': '2.4375rem',
        '4xl': '3.0625rem',
      },
      weight: { regular: '360', medium: '440', semibold: '500', bold: '600' },
      leading: { tight: '1.1', normal: '1.5', relaxed: '1.6' },
      tracking: { tight: '-0.0275em', normal: '-0.0075em', wide: '0.04em' },
      body: { weight: '360' },
      heading: { weight: '360', tracking: '-0.0275em' },
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
        lg: 'calc(1rem * var(--m-density))',
      },
      fontSize: 'var(--m-font-size-sm)',
    },
    radius: { sm: '6px', md: '8px', lg: '12px', control: '8px', container: '12px' },
    shadow: {
      // The published elevations: a 1px ring in warm grey plus soft drops in the shadow grey
      sm: {
        light:
          '0 0 0 1px rgb(71 69 67 / 0.04), 0 4px 8px -2px rgb(71 69 67 / 0.06), 0 2px 4px 0 rgb(71 69 67 / 0.04), 0 1px 2px 0 rgb(71 69 67 / 0.04), 0 0 0 1px rgb(222 219 213 / 0.2)',
        dark: '0 0 0 1px rgb(20 20 19 / 0.3), 0 2px 4px 0 rgb(20 20 19 / 0.2), 0 0 0 1px rgb(71 69 67 / 0.2)',
      },
      md: {
        light:
          '0 0 0 1px rgb(71 69 67 / 0.04), 0 16px 8px -8px rgb(71 69 67 / 0.01), 0 12px 6px -6px rgb(71 69 67 / 0.02), 0 5px 5px -2.5px rgb(71 69 67 / 0.08), 0 1px 3px -1.5px rgb(71 69 67 / 0.16), 0 0 0 1px rgb(222 219 213 / 0.2)',
        dark: '0 0 0 1px rgb(20 20 19 / 0.3), 0 5px 5px -2.5px rgb(20 20 19 / 0.3), 0 1px 3px -1.5px rgb(20 20 19 / 0.4), 0 0 0 1px rgb(71 69 67 / 0.2)',
      },
      lg: {
        light:
          '0 0 0 1px rgb(71 69 67 / 0.04), 0 1px 1px 0.5px rgb(71 69 67 / 0.04), 0 3px 3px -1.5px rgb(71 69 67 / 0.02), 0 6px 6px -3px rgb(71 69 67 / 0.04), 0 12px 12px -6px rgb(71 69 67 / 0.04), 0 24px 24px -12px rgb(71 69 67 / 0.04), 0 48px 48px -24px rgb(71 69 67 / 0.04), 0 0 0 1px rgb(222 219 213 / 0.2)',
        dark: '0 0 0 1px rgb(20 20 19 / 0.4), 0 6px 6px -3px rgb(20 20 19 / 0.3), 0 24px 24px -12px rgb(20 20 19 / 0.4), 0 0 0 1px rgb(71 69 67 / 0.3)',
      },
      overlay: {
        light:
          '0 0 0 1px rgb(71 69 67 / 0.04), 0 1px 1px 0.5px rgb(71 69 67 / 0.04), 0 3px 3px -1.5px rgb(71 69 67 / 0.02), 0 6px 6px -3px rgb(71 69 67 / 0.04), 0 12px 12px -6px rgb(71 69 67 / 0.04), 0 24px 24px -12px rgb(71 69 67 / 0.04), 0 48px 48px -24px rgb(71 69 67 / 0.04), 0 96px 96px -32px rgb(71 69 67 / 0.06), 0 0 0 1px rgb(222 219 213 / 0.2)',
        dark: '0 0 0 1px rgb(20 20 19 / 0.5), 0 12px 12px -6px rgb(20 20 19 / 0.4), 0 48px 48px -24px rgb(20 20 19 / 0.5), 0 0 0 1px rgb(71 69 67 / 0.4)',
      },
    },
    focus: { width: '2px', offset: '2px' },
    motion: {
      duration: { fast: '100ms', normal: '200ms', slow: '300ms' },
      easing: { standard: 'cubic-bezier(0.16, 1, 0.3, 1)', emphasized: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    },
  },
  components: {
    // A 56px icon rail, then the list; reading and settings sit in a 44rem column
    layout: {
      containerMax: { sm: '30rem', md: '44rem', lg: '72rem' },
      containerPadding: 'clamp(1rem, 4vw, 2rem)',
      gridGap: 'var(--m-space-4)',
      gridMin: '15rem',
      splitSide: '15rem',
      stackGap: 'var(--m-space-3)',
      clusterGap: 'var(--m-space-2)',
    },
    // Rounded rectangles: solid purple for the one action, a warm grey wash for the rest
    button: {
      fontWeight: 'var(--m-font-weight-medium)',
      radius: 'var(--m-radius-md)',
      gap: '6px',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      activeTransform: 'none',
      secondary: {
        bg: { light: '#f2f0eb', dark: '#383634' },
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        hoverBg: { light: '#e9e6e0', dark: '#423f3d' },
        activeBg: { light: '#dedbd5', dark: '#474543' },
      },
      // Ghost buttons take the text colour around them, so they read on the inverted toast too
      ghost: {
        fg: 'currentColor',
        hoverBg: { light: '#f2f0eb', dark: '#353331' },
        activeBg: { light: '#e9e6e0', dark: '#3d3b39' },
      },
      danger: { hoverBg: { light: '#9f182d', dark: '#ff565e' }, activeBg: { light: '#860628', dark: '#ffa8aa' } },
    },
    // Panels: white on the warm page, a ring shadow rather than a drawn border
    card: {
      border: 'var(--m-color-border-default)',
      shadow: 'none',
      hoverShadow: 'var(--m-shadow-sm)',
      hoverBorder: 'var(--m-color-border-default)',
      hoverTransform: 'none',
      gap: 'var(--m-space-3)',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-5)', lg: 'var(--m-space-6)' },
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-medium)',
      descriptionSize: 'var(--m-font-size-sm)',
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    divider: {
      color: 'var(--m-color-border-default)',
      labelTransform: 'none',
      labelTracking: '0',
    },
    input: {
      bg: 'var(--m-color-bg-surface)',
      hoverBorder: 'var(--m-color-fg-subtle)',
      focusBorder: 'var(--m-color-accent-default)',
      height: {
        sm: 'calc(1.75rem * var(--m-density))',
        md: 'calc(2.25rem * var(--m-density))',
        lg: 'calc(2.5rem * var(--m-density))',
      },
      paddingX: { sm: 'var(--m-space-2)', md: 'var(--m-space-3)', lg: 'var(--m-space-3)' },
      textareaMinHeight: '5rem',
    },
    select: { chevronSize: '0.25rem' },
    field: {
      gap: '6px',
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-medium)',
      hintFontSize: 'var(--m-font-size-xs)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    // Filled purple squares with a white tick, as in the calendar options
    checkbox: { size: '1rem', radius: '4px' },
    switch: {
      width: '2rem',
      height: '1.125rem',
      smWidth: '1.75rem',
      smHeight: '1rem',
      trackBg: 'var(--m-color-border-strong)',
      thumbBg: '#ffffff',
      thumbCheckedBg: { light: '#ffffff', dark: '#141413' },
      thumbShadow: '0 1px 2px rgb(20 20 19 / 0.2)',
    },
    avatar: {
      size: { sm: '1.5rem', md: '2rem', lg: '3rem' },
      bg: { light: '#e8e0ff', dark: '#3f256f' },
      fg: { light: '#533192', dark: '#e8e0ff' },
      fontWeight: 'var(--m-font-weight-medium)',
      ringWidth: '2px',
      groupOverlap: '-0.375rem',
    },
    // The mail list: no header row, no frame, 44px rows split by nothing but space; hover a warm wash
    table: {
      bg: 'var(--m-color-bg-canvas)',
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: 'var(--m-space-3)',
      cellPaddingY: 'calc(0.75rem * var(--m-density))',
      borderColor: 'transparent',
      headerBg: 'var(--m-color-bg-canvas)',
      headerFg: 'var(--m-color-fg-subtle)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-regular)',
      headerTransform: 'none',
      headerTracking: '0',
      rowHoverBg: { light: '#f7f5f2', dark: '#2f2e2c' },
      stripeBg: 'var(--m-color-bg-canvas)',
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    breadcrumb: {
      separator: '"/"',
      fontSize: 'var(--m-font-size-sm)',
      currentWeight: 'var(--m-font-weight-medium)',
    },
    // The public site's bar: 66px, white, a hairline, 16px links at the light weight
    navbar: {
      height: 'calc(4.125rem * var(--m-density))',
      bg: 'var(--m-color-bg-canvas)',
      border: 'var(--m-color-border-default)',
      translucentOpacity: '100%',
      backdropFilter: 'none',
      brandFamily: 'var(--m-font-body-family)',
      brandSize: 'var(--m-font-size-lg)',
      brandWeight: 'var(--m-font-weight-semibold)',
      brandTransform: 'none',
      link: {
        fontSize: 'var(--m-font-size-lg)',
        fontWeight: 'var(--m-font-weight-regular)',
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-accent-text)',
        activeBg: 'transparent',
      },
    },
    pagination: {
      radius: 'var(--m-radius-md)',
      fontWeight: 'var(--m-font-weight-regular)',
      hoverBg: { light: '#f2f0eb', dark: '#353331' },
      currentBg: 'var(--m-color-bg-inverse)',
      currentFg: 'var(--m-color-fg-inverse)',
      currentBorder: 'transparent',
    },
    // Folders and settings sections: 32px rows, 14px light labels, the current one a warm grey wash
    sidebar: {
      width: '15rem',
      bg: 'var(--m-color-bg-sunken)',
      border: 'transparent',
      padding: 'var(--m-space-3)',
      sectionGap: 'var(--m-space-5)',
      itemGap: '2px',
      fontSize: 'var(--m-font-size-md)',
      nestedIndent: 'var(--m-space-5)',
      heading: {
        fg: 'var(--m-color-fg-subtle)',
        size: 'var(--m-font-size-xs)',
        weight: 'var(--m-font-weight-regular)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#f2f0eb', dark: '#292827' },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: '#e9e6e0', dark: '#383634' },
        activeWeight: 'var(--m-font-weight-medium)',
        radius: 'var(--m-radius-md)',
        paddingX: 'var(--m-space-3)',
        paddingY: 'calc(0.4375rem * var(--m-density))',
      },
      count: { bg: 'transparent', fg: 'var(--m-color-fg-subtle)', radius: '4px' },
    },
    // Split inbox tabs: large light labels, no indicator, the current one in full ink
    tabs: {
      listGap: 'var(--m-space-6)',
      height: 'calc(2.5rem * var(--m-density))',
      paddingX: '0',
      fontSize: 'var(--m-font-size-md)',
      fontWeight: 'var(--m-font-weight-regular)',
      fg: 'var(--m-color-fg-subtle)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      listBorder: 'transparent',
      indicator: 'var(--m-color-fg-default)',
      indicatorWidth: '1px',
      // The segmented switch (Monthly / Annual): a white track with a hairline, the choice a grey step
      // (the reference inverts it to charcoal; recipes do that with the inverse tokens)
      pill: {
        listBg: 'var(--m-color-bg-surface)',
        listRadius: '10px',
        listPadding: '2px',
        radius: 'var(--m-radius-md)',
        activeBg: { light: '#e9e6e0', dark: '#474543' },
        activeShadow: 'none',
      },
    },
    // Callouts: a tinted panel, no stripe
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: 'var(--m-radius-md)',
      padding: 'var(--m-space-3) var(--m-space-4)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    // Labels are small tinted chips with dark text in the hue
    badge: {
      height: '1.375rem',
      borderWidth: '0px',
      paddingX: '0.5rem',
      radius: 'var(--m-radius-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
      neutral: {
        bg: { light: '#f2f0eb', dark: '#383634' },
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        solidBg: 'var(--m-color-bg-inverse)',
        solidFg: 'var(--m-color-fg-inverse)',
      },
    },
    progress: {
      height: { sm: '0.125rem', md: '0.25rem', lg: '0.5rem' },
      track: { light: '#f2f0eb', dark: '#383634' },
      fill: 'var(--m-color-accent-default)',
    },
    skeleton: {
      bg: { light: '#f2f0eb', dark: '#353331' },
      highlight: { light: '#f7f5f2', dark: '#3d3b39' },
      radius: 'var(--m-radius-sm)',
      blockRadius: 'var(--m-radius-md)',
    },
    spinner: { thickness: '2px', track: 'var(--m-color-border-default)', color: 'var(--m-color-accent-default)' },
    // The confirmation with Undo: a small inverted bar, bottom left, one line, the action underlined
    toast: {
      bg: 'var(--m-color-bg-inverse)',
      fg: 'var(--m-color-fg-inverse)',
      bodyFg: 'var(--m-color-fg-inverse)',
      border: 'transparent',
      accentWidth: '0px',
      radius: 'var(--m-radius-md)',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-3) var(--m-space-4)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-medium)',
      width: '22rem',
    },
    dialog: {
      border: { light: 'transparent', dark: '#474543' },
      radius: 'var(--m-radius-lg)',
      padding: 'var(--m-space-6)',
      gap: 'var(--m-space-4)',
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-regular)',
      width: { sm: '26rem', md: '36rem', lg: '44rem' },
      enterTransform: 'translateY(-4px)',
    },
    // Menus and the command menu: white (charcoal in dark), the ring shadow, 36px rows with keys
    popover: {
      border: { light: 'transparent', dark: '#474543' },
      radius: 'var(--m-radius-lg)',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-1)',
      minWidth: '14rem',
      item: {
        height: 'calc(2.25rem * var(--m-density))',
        paddingX: 'var(--m-space-3)',
        radius: 'var(--m-radius-md)',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: { light: '#f2f0eb', dark: '#474543' },
      },
      labelFg: 'var(--m-color-fg-subtle)',
      separator: 'var(--m-color-border-default)',
    },
    // A charcoal label with its key, quick
    tooltip: {
      bg: { light: '#474543', dark: '#474543' },
      fg: '#fcfaf7',
      radius: 'var(--m-radius-md)',
      shadow: 'var(--m-shadow-md)',
      paddingX: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
      delay: '300ms',
    },
    // Questions in one hairline frame with 8px corners, split by hairlines, no fill
    accordion: {
      bg: 'transparent',
      border: 'var(--m-color-border-default)',
      radius: 'var(--m-radius-md)',
      paddingX: 'var(--m-space-5)',
      paddingY: 'var(--m-space-5)',
      summarySize: 'var(--m-font-size-lg)',
      summaryWeight: 'var(--m-font-weight-regular)',
      hoverBg: 'transparent',
    },
    code: {
      bg: 'var(--m-color-bg-sunken)',
      radius: 'var(--m-radius-md)',
      fontSize: 'var(--m-font-size-sm)',
      inlineBg: { light: '#f2f0eb', dark: '#383634' },
      inlineBorder: 'transparent',
      inlineRadius: '4px',
      comment: 'var(--m-color-fg-subtle)',
      keyword: 'var(--m-color-accent-text)',
      function: 'var(--m-color-info-fg)',
    },
    // Shortcut keys: small warm-grey squares in the UI face, no border, everywhere
    kbd: {
      fontFamily: 'var(--m-font-body-family)',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-medium)',
      bg: { light: '#f2f0eb', dark: '#474543' },
      fg: 'var(--m-color-fg-muted)',
      border: 'transparent',
      radius: '4px',
      shadow: 'none',
      height: '1.5em',
      paddingX: '0.4em',
    },
    prose: {
      maxWidth: '40rem',
      lineHeight: 'var(--m-font-leading-normal)',
      h1Size: 'var(--m-font-size-2xl)',
      h2Size: 'var(--m-font-size-xl)',
      h3Size: 'var(--m-font-size-lg)',
      h2Border: 'transparent',
      linkDecoration: 'underline',
      quoteBorderWidth: '2px',
      tableHeaderBg: 'var(--m-color-bg-sunken)',
    },
    chat: {
      gap: 'var(--m-space-4)',
      radius: 'var(--m-radius-lg)',
      userBg: { light: '#f2f0eb', dark: '#383634' },
      userBorder: 'transparent',
      assistantBg: 'transparent',
      assistantBorder: 'transparent',
      avatarSize: '1.5rem',
      avatarBg: { light: '#f2f0eb', dark: '#383634' },
      avatarFg: 'var(--m-color-fg-default)',
      assistantAvatarBg: 'var(--m-color-accent-subtle)',
      assistantAvatarFg: 'var(--m-color-accent-text)',
    },
    citation: {
      chipBg: { light: '#f2f0eb', dark: '#383634' },
      chipFg: 'var(--m-color-fg-default)',
      chipRadius: '4px',
      sourceBg: 'var(--m-color-bg-raised)',
      sourceRadius: 'var(--m-radius-lg)',
    },
    composer: {
      bg: 'var(--m-color-bg-surface)',
      radius: 'var(--m-radius-lg)',
      shadow: 'var(--m-shadow-md)',
      padding: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-md)',
    },
    thinking: { fontSize: 'var(--m-font-size-sm)', ruleWidth: '1px' },
    toolCall: {
      bg: 'var(--m-color-bg-sunken)',
      radius: 'var(--m-radius-md)',
      summaryHeight: 'calc(2.25rem * var(--m-density))',
      fontSize: 'var(--m-font-size-sm)',
      statusRadius: 'var(--m-radius-sm)',
    },
    usage: {
      height: '0.25rem',
      track: { light: '#f2f0eb', dark: '#383634' },
      okFill: 'var(--m-color-accent-default)',
      warnFill: 'var(--m-color-warning-fg)',
      overFill: 'var(--m-color-danger-solid)',
      fontSize: 'var(--m-font-size-sm)',
    },
  },
});
