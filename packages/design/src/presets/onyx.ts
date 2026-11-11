import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Onyx: a bold, fast money super-app. Near-black type on a pale grey screen, white widgets with 16px
 * corners and no border or shadow, one blue-violet for every action, heavy wide headings, balances
 * set huge with small cents, pill buttons, round action buttons and grey filled fields. Pure black is
 * the dark mode, and the brand colour: the black marketing bands and the hero panels. Category: bold
 * and fast. The values are the reference's published component library tokens, read as data, and
 * measured off its published app screens (see DESIGN.md).
 */

// The grey fills: search fields and segmented tracks, and the hover step behind list rows and nav items
const fill = { light: '#ebebf0', dark: '#1c1c1e' };
const fillHover = { light: '#e2e2e7', dark: '#272729' };
// The pale "action background" behind secondary pills, with the action colour's pressed step for text
const action = { light: '#edeefd', dark: '#1c1d34' };
const actionText = { light: '#4348cd', dark: '#8c99ff' };

export const onyx = extendTheme(minimal, {
  name: 'onyx',
  label: 'Onyx',
  description:
    'Bold and fast: near-black on a pale grey screen, white 16px widgets, one blue-violet action, heavy headings, huge balances, pill and round buttons.',
  tokens: {
    color: {
      bg: {
        // The grouped background; widgets sit on it in white. Dark is pure black with grey widgets
        canvas: { light: '#f7f7f7', dark: '#000000' },
        surface: { light: '#ffffff', dark: '#161618' },
        // Popovers, dropdowns and toasts
        raised: { light: '#ffffff', dark: '#242426' },
        sunken: { light: '#f1f2f4', dark: '#111112' },
        overlay: { light: 'rgb(0 0 0 / 0.4)', dark: 'rgb(0 0 0 / 0.6)' },
        inverse: { light: '#191c1f', dark: '#f4f4f4' },
      },
      fg: {
        default: { light: '#191c1f', dark: '#f4f4f4' },
        // The accessible theme's grey-50, then the grey-tone-50 the app uses for secondary lines
        muted: { light: '#505a63', dark: '#c9c9cd' },
        subtle: { light: '#717173', dark: '#a1a1a3' },
        inverse: { light: '#ffffff', dark: '#191c1f' },
      },
      border: {
        // The separator (grey-tone-10) and the lighter grey-tone-8
        default: { light: '#e2e2e7', dark: '#3b3b3d' },
        muted: { light: '#ebebf0', dark: '#272729' },
        // Control borders: the reference's "inactive" grey (its grey-tone-20 is under 3:1)
        strong: { light: '#75808a', dark: '#8f8f92' },
        focus: { light: '#4f55f1', dark: '#667dff' },
      },
      accent: {
        // The action blue-violet. Hover and pressed are its 8% and 15% black state overlays. In dark,
        // the reference's #667dff is 3.5:1 under white text, so the fill is one step deeper
        default: { light: '#4f55f1', dark: '#5560f0' },
        hover: { light: '#494ede', dark: '#4e58dd' },
        active: { light: '#4348cd', dark: '#4852cc' },
        subtle: action,
        fg: '#ffffff',
        text: { light: '#4f55f1', dark: '#667dff' },
      },
      // The black of the marketing bands and the app's hero panels; a deep grey in dark mode
      brand: {
        default: { light: '#191c1f', dark: '#0e0e0f' },
        fg: { light: '#ffffff', dark: '#ffffff' },
        subtle: { light: '#f1f2f4', dark: '#242426' },
      },
      // Positive money is the reference's teal-green; its text is darkened to read on white
      success: {
        bg: { light: '#e5f7f1', dark: '#0c2a22' },
        fg: { light: '#007a5c', dark: '#1ac097' },
        border: { light: '#9fe3cf', dark: '#14614d' },
        solid: { light: '#00b88b', dark: '#1ac097' },
        onSolid: { light: '#191c1f', dark: '#000000' },
      },
      warning: {
        bg: { light: '#fdf1e3', dark: '#33230a' },
        fg: { light: '#a35600', dark: '#ff9f0a' },
        border: { light: '#f7c58a', dark: '#6b4507' },
        solid: { light: '#ec7e00', dark: '#ff9f0a' },
        onSolid: { light: '#191c1f', dark: '#000000' },
      },
      // Errors: the input-error wash with the danger red, one step deeper to read on it
      danger: {
        bg: { light: '#feedec', dark: '#330e0c' },
        fg: { light: '#c8303f', dark: '#ff6b78' },
        border: { light: '#e23b4a', dark: '#ee4a59' },
        solid: { light: '#d0283a', dark: '#d0283a' },
        onSolid: { light: '#ffffff', dark: '#ffffff' },
      },
      info: {
        bg: action,
        fg: actionText,
        border: { light: '#c5c8fa', dark: '#33367a' },
        solid: { light: '#4f55f1', dark: '#5560f0' },
        onSolid: '#ffffff',
      },
      selection: {
        bg: { light: '#d6d8fc', dark: '#2e3170' },
        fg: { light: '#191c1f', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // The reference's app face is Inter itself; its marketing face (wide, geometric) is
        // proprietary, and Figtree is the closest open match
        sans: '"Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        display: '"Figtree Variable", "Figtree", "Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif',
        mono: '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      // The published text styles: body 12/14/16, headings 20/24/32, display 44/56
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.25rem',
        xl: '1.5rem',
        '2xl': '2rem',
        '3xl': '2.75rem',
        '4xl': '3.5rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.1875', normal: '1.375', relaxed: '1.5' },
      // Text tracks in slightly (-0.18em/16 at 16px); headings tighter (-0.35em/32)
      tracking: { tight: '-0.011em', normal: '-0.007em', wide: '0.01em' },
      body: { weight: '400' },
      heading: { weight: '700', tracking: '-0.011em' },
    },
    control: {
      // The three published button sizes: 30, 40 and 52px
      height: {
        sm: 'calc(1.875rem * var(--m-density))',
        md: 'calc(2.5rem * var(--m-density))',
        lg: 'calc(3.25rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.5rem * var(--m-density))',
      },
      fontSize: '0.875rem',
    },
    // 8px small parts, 12px inner corners, 16px widgets, dropdowns and fields; buttons are pills
    radius: { sm: '8px', md: '12px', lg: '16px' },
    shadow: {
      // The published elevation levels 1 to 4; dark mode lifts by colour, so only overlays cast
      sm: { light: '0 0.125rem 0.1875rem rgb(25 28 31 / 0.05)', dark: '0 0 0 1px rgb(255 255 255 / 0.04)' },
      md: { light: '0 0.1875rem 0.5rem rgb(25 28 31 / 0.1)', dark: '0 0 0 1px rgb(255 255 255 / 0.06)' },
      lg: {
        light: '0 0.1875rem 1.875rem rgb(25 28 31 / 0.08)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.06), 0 0.5rem 1.5rem rgb(0 0 0 / 0.5)',
      },
      overlay: {
        light: '0 1rem 4rem rgb(25 28 31 / 0.12)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.06), 0 1rem 4rem rgb(0 0 0 / 0.6)',
      },
    },
    motion: {
      duration: { fast: '200ms', normal: '300ms', slow: '450ms' },
      // The default ease-out, and the toast's overshoot for things that arrive
      easing: { standard: 'cubic-bezier(0.15, 0.5, 0.5, 1)', emphasized: 'cubic-bezier(0.175, 0.885, 0.21, 1.65)' },
    },
  },
  components: {
    // Popup widths 400 / 768 / 1152px set the columns; the side menu is 248px; widgets 16px apart
    layout: {
      containerMax: { sm: '25rem', md: '48rem', lg: '72rem' },
      containerPadding: 'clamp(1rem, 3vw, 2rem)',
      gridGap: 'var(--m-space-4)',
      splitSide: '15.5rem',
    },
    // Pills at 500. Primary is the action colour; secondary the pale action background with the
    // action text; ghost is text in the action colour; danger the pale red with red text
    button: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-medium)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      disabledOpacity: '0.5',
      secondary: {
        bg: action,
        fg: actionText,
        border: 'transparent',
        hoverBg: { light: '#e1e2f0', dark: '#27283e' },
        activeBg: { light: '#d5d6e4', dark: '#333448' },
      },
      ghost: {
        fg: { light: '#4f55f1', dark: '#8c99ff' },
        hoverBg: fill,
        activeBg: fillHover,
      },
      danger: {
        bg: { light: '#feedec', dark: '#330e0c' },
        fg: { light: '#b8202f', dark: '#ff6b78' },
        border: 'transparent',
        hoverBg: { light: '#f1e1e0', dark: '#3d1a18' },
        activeBg: { light: '#eadad9', dark: '#43211f' },
      },
    },
    // Fields are grey filled boxes, 56px tall with 16px corners; a hairline at the control floor
    input: {
      bg: fill,
      placeholder: 'var(--m-color-fg-muted)',
      border: { light: '#75808a', dark: '#75808a' },
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-accent-default)',
      invalidBorder: 'var(--m-color-danger-border)',
      disabledBg: 'var(--m-color-bg-sunken)',
      radius: '16px',
      fontSize: 'var(--m-font-size-md)',
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
      paddingY: '1rem',
    },
    select: {
      bg: fill,
      border: { light: '#75808a', dark: '#75808a' },
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-accent-default)',
      invalidBorder: 'var(--m-color-danger-border)',
      radius: '16px',
      fontSize: 'var(--m-font-size-md)',
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
      labelFg: 'var(--m-color-fg-muted)',
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-regular)',
      hintFg: 'var(--m-color-fg-muted)',
      hintFontSize: 'var(--m-font-size-xs)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    // Checkboxes and radios are round, 24px, filled in the action colour when on
    checkbox: { size: '1.5rem', radius: '9999px', borderWidth: '2px', hoverBorder: 'var(--m-color-fg-muted)' },
    radio: { size: '1.5rem', borderWidth: '2px', hoverBorder: 'var(--m-color-fg-muted)' },
    // 48 × 28, a 24px white knob 2px in; off is the inactive grey (the reference's lighter grey is under 3:1)
    switch: {
      width: '3rem',
      height: '1.75rem',
      thumbInset: '2px',
      trackBg: { light: '#75808a', dark: '#6e6e71' },
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbShadow: '0 0.125rem 0.25rem rgb(0 0 0 / 0.15)',
      border: 'transparent',
    },
    // Widgets: white, 16px corners, no border, no shadow; 16px inside
    card: {
      border: 'transparent',
      shadow: 'none',
      hoverShadow: 'var(--m-shadow-lg)',
      hoverBorder: 'transparent',
      hoverTransform: 'none',
      radius: '16px',
      padding: { sm: 'var(--m-space-3)', md: 'var(--m-space-4)', lg: 'var(--m-space-6)' },
      titleFamily: 'var(--m-font-family-sans)',
      titleSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
      descriptionFg: 'var(--m-color-fg-subtle)',
      descriptionSize: 'var(--m-font-size-sm)',
      outline: { bg: 'var(--m-color-bg-surface)', border: 'var(--m-color-border-default)' },
      sunken: { bg: 'var(--m-color-bg-canvas)', border: 'transparent' },
    },
    // The business table: inside a white widget, grey 14px headers, hairline rows, a grey hover
    table: {
      fontSize: 'var(--m-font-size-sm)',
      cellPaddingX: 'var(--m-space-4)',
      cellPaddingY: 'var(--m-space-3)',
      headerBg: 'var(--m-color-bg-surface)',
      headerFg: 'var(--m-color-fg-subtle)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-regular)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      borderColor: { light: '#f1f2f4', dark: '#272729' },
      rowHoverBg: { light: '#f7f7f7', dark: '#1c1c1e' },
      stripeBg: 'var(--m-color-bg-surface)',
      wrapBorder: 'transparent',
      wrapRadius: '16px',
    },
    // The side menu: on the grouped background, 16px-corner items; the current one a white widget
    // with action-coloured text; hover is the grey step
    sidebar: {
      width: '15.5rem',
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      padding: 'var(--m-space-2) var(--m-space-4)',
      itemGap: 'var(--m-space-1)',
      fontSize: 'var(--m-font-size-md)',
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: fillHover,
        activeFg: { light: '#4f55f1', dark: '#667dff' },
        activeBg: 'var(--m-color-bg-surface)',
        activeWeight: 'var(--m-font-weight-medium)',
        radius: '16px',
        paddingX: 'var(--m-space-4)',
        paddingY: 'calc(var(--m-space-3) * var(--m-density))',
      },
      heading: {
        fg: 'var(--m-color-fg-subtle)',
        size: 'var(--m-font-size-sm)',
        weight: 'var(--m-font-weight-regular)',
        transform: 'none',
        tracking: '0',
      },
      count: { bg: { light: '#d0283a', dark: '#d0283a' }, fg: '#ffffff', radius: '9999px' },
    },
    // Public pages: a white bar, 16px links, a pill for the current one
    navbar: {
      height: '4.5rem',
      border: 'transparent',
      shadow: 'none',
      brandFamily: 'var(--m-font-family-display)',
      brandWeight: '800',
      brandSize: 'var(--m-font-size-lg)',
      link: {
        radius: '9999px',
        paddingX: 'var(--m-space-4)',
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-medium)',
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: fill,
        activeFg: 'var(--m-color-fg-default)',
        activeBg: fill,
      },
    },
    // Tabs: 14px at 500; the current one in ink. The segmented control is a grey round track with a
    // white round segment; inactive labels take the darker grey to read on the track
    tabs: {
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-medium)',
      fg: { light: '#636366', dark: '#a1a1a3' },
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-fg-default)',
      indicatorWidth: '2px',
      listBorder: 'var(--m-color-border-default)',
      pill: {
        listBg: fill,
        listRadius: '9999px',
        listPadding: '2px',
        radius: '9999px',
        activeBg: { light: '#ffffff', dark: '#525254' },
        activeShadow: '0 0.125rem 0.1875rem rgb(0 0 0 / 0.08)',
      },
    },
    pagination: {
      radius: '9999px',
      border: 'transparent',
      fg: 'var(--m-color-fg-default)',
      hoverBg: fill,
      currentBg: 'var(--m-color-bg-inverse)',
      currentFg: 'var(--m-color-fg-inverse)',
      currentBorder: 'transparent',
    },
    breadcrumb: {
      separator: '"›"',
      fg: 'var(--m-color-fg-subtle)',
      hoverFg: 'var(--m-color-fg-default)',
      currentFg: 'var(--m-color-fg-default)',
    },
    // Tags: 24px pills, 12px at 500
    badge: {
      height: '1.5rem',
      paddingX: '0.5rem',
      radius: '9999px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-medium)',
      textTransform: 'none',
      tracking: '0',
      neutral: {
        bg: fill,
        fg: 'var(--m-color-fg-default)',
        border: 'var(--m-color-border-default)',
        solidBg: 'var(--m-color-bg-inverse)',
        solidFg: 'var(--m-color-fg-inverse)',
      },
    },
    // Round, 32 / 40 / 56px, initials in the action colour on its pale background
    avatar: {
      size: { sm: '2rem', md: '2.5rem', lg: '3.5rem' },
      bg: action,
      fg: { light: '#4348cd', dark: '#8c99ff' },
      fontWeight: 'var(--m-font-weight-semibold)',
    },
    // Notices: a tinted 16px panel, no border and no stripe
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
    // The toast: a white 16px card on the level-4 shadow, ink text, whatever the tone
    toast: {
      bg: 'var(--m-color-bg-raised)',
      fg: 'var(--m-color-fg-default)',
      bodyFg: 'var(--m-color-fg-muted)',
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '16px',
      shadow: 'var(--m-shadow-overlay)',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // The popup: the grouped grey, 24px corners, 24px inside, a 40% black scrim
    dialog: {
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      radius: '24px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-6)',
      width: { sm: '25rem', md: '30rem', lg: '48rem' },
      titleFamily: 'var(--m-font-family-sans)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-bold)',
      descriptionFg: 'var(--m-color-fg-muted)',
    },
    // Dropdowns: white, 16px corners, 44px rows with 12px inner corners
    popover: {
      border: 'transparent',
      radius: '16px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-1)',
      item: {
        height: '2.75rem',
        paddingX: 'var(--m-space-3)',
        radius: '12px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: { light: '#f1f2f4', dark: '#3b3b3d' },
        hoverFg: 'var(--m-color-fg-default)',
        dangerFg: 'var(--m-color-danger-fg)',
      },
      labelFg: 'var(--m-color-fg-subtle)',
    },
    // The tooltip is a small popover: white, ink text, 12px corners, 4px by 8px
    tooltip: {
      bg: 'var(--m-color-bg-raised)',
      fg: 'var(--m-color-fg-default)',
      radius: '12px',
      shadow: 'var(--m-shadow-md)',
      paddingX: 'var(--m-space-2)',
      paddingY: 'var(--m-space-1)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
    },
    // A 4px round bar in the action colour on the grey-20 track
    progress: {
      height: { sm: '0.25rem', md: '0.25rem', lg: '0.5rem' },
      radius: '9999px',
      track: { light: '#c9c9cd', dark: '#272729' },
      // In dark the bar takes the reference's brighter #667dff, to stand off the track
      fill: { light: '#4f55f1', dark: '#667dff' },
    },
    // Settings-style rows inside a white widget, no fills
    accordion: {
      radius: '16px',
      bg: 'var(--m-color-bg-surface)',
      // The lightest line: separates the rows, and all but vanishes as a frame on the grey
      border: { light: '#f1f2f4', dark: '#272729' },
      paddingX: 'var(--m-space-4)',
      paddingY: 'var(--m-space-4)',
      summarySize: 'var(--m-font-size-md)',
      summaryWeight: 'var(--m-font-weight-medium)',
      contentFg: 'var(--m-color-fg-muted)',
    },
    // The shimmer: ink at 6% (white at 20% in dark), round ends, 1.5s
    skeleton: {
      bg: { light: '#eff0f0', dark: '#333334' },
      highlight: { light: '#f7f7f7', dark: '#3f3f40' },
      radius: '9999px',
      blockRadius: '16px',
      duration: '1.5s',
    },
    spinner: { color: 'var(--m-color-accent-default)', duration: '0.9s' },
    kbd: { radius: '8px', shadow: 'none', bg: fill, border: 'transparent', fontWeight: 'var(--m-font-weight-medium)' },
    code: {
      radius: '16px',
      inlineRadius: '8px',
      inlineBg: fill,
      bg: { light: '#f7f7f7', dark: '#161618' },
      border: 'transparent',
    },
    prose: { linkFg: 'var(--m-color-accent-text)', linkDecoration: 'none', maxWidth: '40rem' },
    // Chat: the other side on a white (dark grey) bubble, your own on the grey fill, 16px corners
    chat: {
      radius: '16px',
      userBg: { light: '#e2e2e7', dark: '#3b3b3d' },
      userFg: 'var(--m-color-fg-default)',
      userBorder: 'transparent',
      assistantBg: 'var(--m-color-bg-surface)',
      assistantBorder: 'transparent',
    },
    composer: { radius: '24px', bg: 'var(--m-color-bg-surface)', focusBorder: 'var(--m-color-accent-default)' },
    citation: { chipBg: action, chipFg: actionText, chipRadius: '9999px' },
    toolCall: { radius: '16px', statusRadius: '9999px' },
    usage: { radius: '9999px', track: { light: '#c9c9cd', dark: '#3b3b3d' } },
  },
});
