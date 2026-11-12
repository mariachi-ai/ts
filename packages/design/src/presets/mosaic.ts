import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Mosaic: a visual-discovery interface where the pictures are the page. Near-black ink on white,
 * one saturated red for the action that matters (save, follow, sign up), neutral grey pills for
 * everything else, black for what's selected, and big rounded corners: 16px on every image tile,
 * 32px on dialogs and detail cards. Type is a bold, round grotesque. Category: content-first.
 * The values are the reference design system's published tokens and measured styles (see DESIGN.md).
 */
export const mosaic = extendTheme(minimal, {
  name: 'mosaic',
  label: 'Mosaic',
  description:
    'Pictures first: ink on white, one bold red for saving, grey and black pills, 16px image tiles in a masonry grid and 32px dialogs.',
  tokens: {
    color: {
      bg: {
        canvas: { light: '#ffffff', dark: '#111111' },
        surface: { light: '#ffffff', dark: '#111111' },
        // Menus, popovers and dialogs; dark lifts to the floating grey
        raised: { light: '#ffffff', dark: '#2b2b2b' },
        // The quiet fill: the segmented track, hovered rows and menu items, skeletons, placeholders
        sunken: { light: '#efefef', dark: '#404040' },
        overlay: { light: 'rgb(0 0 0 / 0.8)', dark: 'rgb(0 0 0 / 0.8)' },
        // Tooltips, toasts and the selected chip: near-black on light, pale on dark
        inverse: { light: '#111111', dark: '#efefef' },
      },
      fg: {
        default: { light: '#111111', dark: '#ffffff' },
        // The grey scale's 550 step: secondary text that still reads on the grey fill
        muted: { light: '#5f5f5f', dark: '#cdcdcd' },
        // Meta lines ("48 ideas · 2d"), placeholders
        subtle: { light: '#767676', dark: '#a5a5a5' },
        inverse: { light: '#ffffff', dark: '#111111' },
      },
      border: {
        // Dividers and container edges
        default: { light: '#cdcdcd', dark: '#4a4a4a' },
        muted: { light: '#e9e9e9', dark: '#2b2b2b' },
        // Controls: the reference's #cdcdcd field edge is 1.6:1, so fields take the next passing grey
        strong: { light: '#767676', dark: '#a5a5a5' },
        // The reference's ring is this blue at 50% (1.9:1); 85% is the first step that meets 3:1
        focus: { light: '#2696ff', dark: '#75bfff' },
      },
      // The red is the action colour: Save, Follow, Sign up, the one primary per view
      accent: {
        default: { light: '#e60023', dark: '#e60023' },
        hover: { light: '#b60000', dark: '#b60000' },
        active: { light: '#a3081a', dark: '#b8001b' },
        subtle: { light: '#ffebeb', dark: '#3d0000' },
        fg: '#ffffff',
        // Links are ink and underlined, not red
        text: { light: '#111111', dark: '#ffffff' },
      },
      // The signature red is also the brand: the round logo mark, brand bands
      brand: {
        default: { light: '#e60023', dark: '#e60023' },
        fg: '#ffffff',
        subtle: { light: '#ffebeb', dark: '#3d0000' },
      },
      success: {
        bg: { light: '#c3f9c2', dark: '#00422c' },
        fg: { light: '#005f3e', dark: '#39d377' },
        border: { light: '#9fe6a0', dark: '#0b5c3e' },
        solid: { light: '#008753', dark: '#6bec8c' },
        onSolid: { light: '#ffffff', dark: '#111111' },
      },
      warning: {
        bg: { light: '#ffe4c1', dark: '#7c2d00' },
        // #bd5b00 is 3.7:1 on its tint; the tag's hover step passes
        fg: { light: '#aa4900', dark: '#fdc900' },
        border: { light: '#fbc98a', dark: '#9b4b1c' },
        solid: { light: '#bd5b00', dark: '#fdc900' },
        onSolid: { light: '#ffffff', dark: '#111111' },
      },
      danger: {
        bg: { light: '#ffe0e0', dark: '#660000' },
        fg: { light: '#cc0000', dark: '#f47171' },
        border: { light: '#fcbbbb', dark: '#9b0000' },
        solid: { light: '#cc0000', dark: '#f47171' },
        onSolid: { light: '#ffffff', dark: '#111111' },
      },
      info: {
        bg: { light: '#d7edff', dark: '#003c96' },
        fg: { light: '#004ba9', dark: '#abdbff' },
        border: { light: '#abdbff', dark: '#005fcb' },
        solid: { light: '#0074e8', dark: '#75bfff' },
        onSolid: { light: '#ffffff', dark: '#111111' },
      },
      selection: {
        bg: { light: '#d7edff', dark: '#003c96' },
        fg: { light: '#111111', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // A round, bold grotesque: Albert Sans stands in for the reference's custom face
        sans: '"Albert Sans Variable", "Albert Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
        display:
          '"Albert Sans Variable", "Albert Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        mono: '"Roboto Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace',
      },
      // The reference's scale: 12, 14, 16, 20, 28, 36, then the marketing 48 and 70
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.25rem',
        xl: '1.75rem',
        '2xl': '2.25rem',
        '3xl': '3rem',
        '4xl': '4.375rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.1', normal: '1.4', relaxed: '1.5' },
      tracking: { tight: '-0.014em', normal: '0', wide: '0.02em' },
      body: { weight: '400' },
      heading: { weight: '700', tracking: '-0.014em' },
    },
    // Buttons and fields: 32, 40 and 48px; the 48px "large" is the everyday size
    control: {
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(2.5rem * var(--m-density))',
        lg: 'calc(3rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(0.875rem * var(--m-density))',
        lg: 'calc(1rem * var(--m-density))',
      },
      fontSize: '1rem',
    },
    // 4px badges, 8px checkboxes and nav rows, 16px image tiles, fields and menus, 32px dialogs
    radius: { sm: '4px', md: '8px', lg: '16px', control: '16px', container: '16px' },
    borderWidth: { control: '2px' },
    shadow: {
      // Floating: the faint all-round glow of menus and hovered tiles
      sm: { light: '0 0 8px rgb(0 0 0 / 0.1)', dark: '0 0 0 1px rgb(255 255 255 / 0.06)' },
      // The detail card's long soft shadow
      md: { light: '0 1px 20px rgb(0 0 0 / 0.1)', dark: '0 0 0 1px rgb(255 255 255 / 0.06)' },
      lg: {
        light: '0 3px 12px rgb(0 0 0 / 0.2)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.08), 0 3px 12px rgb(0 0 0 / 0.6)',
      },
      overlay: {
        light: '0 0 8px rgb(0 0 0 / 0.1)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.08), 0 4px 16px rgb(0 0 0 / 0.6)',
      },
    },
    // A wide soft ring with no gap, as on the reference's fields and tiles
    focus: { width: '4px', offset: '0px' },
    motion: {
      duration: { fast: '150ms', normal: '250ms', slow: '400ms' },
      easing: { standard: 'cubic-bezier(0.25, 0.375, 0.1, 0.975)', emphasized: 'cubic-bezier(0, 0.35, 0, 1.25)' },
    },
  },
  components: {
    // Content runs wide (the masonry fills the window); forms sit in a 488px column
    layout: {
      containerMax: { sm: '30.5rem', md: '50rem', lg: '84rem' },
      containerPadding: 'clamp(1rem, 3vw, 1.5rem)',
      gridGap: 'var(--m-space-4)',
      gridMin: '14.75rem',
      splitSide: '15rem',
    },
    // Pills: red for the one action, grey for the rest, a clear ghost; black when selected
    button: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-semibold)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      hoverTransform: 'none',
      activeTransform: 'scale(0.97)',
      gap: 'var(--m-space-2)',
      primary: { border: 'transparent' },
      secondary: {
        bg: { light: '#e9e9e9', dark: '#4a4a4a' },
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        hoverBg: { light: '#e2e2e2', dark: '#535353' },
        activeBg: { light: '#dadada', dark: '#666666' },
      },
      ghost: {
        fg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#f0f0f0', dark: '#3a3a3a' },
        activeBg: { light: '#e6e6e6', dark: '#454545' },
      },
      danger: { border: 'transparent' },
    },
    // Tiles and panels: no border, 16px corners; the detail card adds the long soft shadow
    card: {
      bg: { light: '#ffffff', dark: '#212121' },
      border: 'transparent',
      shadow: 'none',
      hoverShadow: 'var(--m-shadow-sm)',
      hoverBorder: 'transparent',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-3)', md: 'var(--m-space-4)', lg: 'var(--m-space-6)' },
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-bold)',
      descriptionFg: 'var(--m-color-fg-muted)',
      descriptionSize: 'var(--m-font-size-sm)',
      outline: { border: 'var(--m-color-border-default)' },
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    // Fields: 48px, 16px corners, a 2px edge, the wide blue ring on focus
    input: {
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(3rem * var(--m-density))',
        lg: 'calc(3rem * var(--m-density))',
      },
      paddingX: { sm: 'var(--m-space-2)', md: 'var(--m-space-4)', lg: 'var(--m-space-4)' },
      radius: '16px',
      borderWidth: '2px',
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: '#5f5f5f', dark: '#cdcdcd' },
      focusBorder: 'var(--m-color-border-strong)',
      invalidBorder: 'var(--m-color-danger-fg)',
      placeholder: 'var(--m-color-fg-subtle)',
      bg: { light: '#ffffff', dark: '#030303' },
      disabledBg: 'var(--m-color-bg-sunken)',
    },
    select: {
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(3rem * var(--m-density))',
        lg: 'calc(3rem * var(--m-density))',
      },
      radius: '16px',
      borderWidth: '2px',
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: '#5f5f5f', dark: '#cdcdcd' },
      focusBorder: 'var(--m-color-border-strong)',
      bg: { light: '#ffffff', dark: '#030303' },
    },
    // Labels small above the field; errors small and red below it
    field: {
      gap: 'var(--m-space-1)',
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: 'var(--m-font-size-xs)',
      labelFontWeight: 'var(--m-font-weight-regular)',
      hintFg: 'var(--m-color-fg-subtle)',
      hintFontSize: 'var(--m-font-size-xs)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    // Checked is black, not red; 24px with 8px corners
    checkbox: {
      size: '1.5rem',
      radius: '8px',
      borderWidth: '2px',
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: '#5f5f5f', dark: '#cdcdcd' },
      checkedBg: 'var(--m-color-bg-inverse)',
      checkedBorder: 'var(--m-color-bg-inverse)',
      mark: 'var(--m-color-fg-inverse)',
    },
    radio: {
      size: '1.5rem',
      borderWidth: '2px',
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: '#5f5f5f', dark: '#cdcdcd' },
      checkedBg: 'var(--m-color-bg-inverse)',
      checkedBorder: 'var(--m-color-bg-inverse)',
      dot: 'var(--m-color-fg-inverse)',
    },
    // 40 by 24 and black when on. The reference's off track is white with a grey edge, which the 3:1
    // floor can't see; off is the grey of that edge instead, with a white knob
    switch: {
      width: '2.5rem',
      height: '1.5rem',
      smWidth: '2rem',
      smHeight: '1.25rem',
      border: 'transparent',
      trackBg: { light: '#767676', dark: '#767676' },
      trackCheckedBg: 'var(--m-color-bg-inverse)',
      thumbBg: '#ffffff',
      thumbCheckedBg: { light: '#ffffff', dark: '#111111' },
    },
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: 'var(--m-space-3)',
      cellPaddingY: 'calc(0.75rem * var(--m-density))',
      borderColor: 'var(--m-color-border-muted)',
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-default)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-bold)',
      headerTransform: 'none',
      headerTracking: '0',
      rowHoverBg: 'var(--m-color-bg-sunken)',
      stripeBg: { light: '#f9f9f9', dark: '#191919' },
      wrapBorder: 'transparent',
      wrapRadius: '16px',
    },
    // The tool sidebar: plain rows, the current one solid black with white text and 8px corners
    sidebar: {
      width: '15rem',
      bg: 'var(--m-color-bg-surface)',
      border: 'transparent',
      padding: 'var(--m-space-4)',
      sectionGap: 'var(--m-space-6)',
      itemGap: '2px',
      fontSize: 'var(--m-font-size-md)',
      heading: {
        fg: 'var(--m-color-fg-default)',
        size: 'var(--m-font-size-md)',
        weight: 'var(--m-font-weight-bold)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#e9e9e9', dark: '#4a4a4a' },
        activeFg: 'var(--m-color-fg-inverse)',
        activeBg: 'var(--m-color-bg-inverse)',
        activeWeight: 'var(--m-font-weight-regular)',
        radius: '8px',
        paddingX: 'var(--m-space-4)',
        paddingY: 'calc(0.5rem * var(--m-density))',
      },
      count: { bg: 'transparent', fg: 'var(--m-color-fg-muted)' },
    },
    // The top bar: white, 80px, the logo, nav pills (the current one black) and a grey search pill
    navbar: {
      height: 'calc(5rem * var(--m-density))',
      paddingX: 'var(--m-space-4)',
      gap: 'var(--m-space-2)',
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      brandFamily: 'var(--m-font-display-family)',
      brandSize: 'var(--m-font-size-lg)',
      brandWeight: 'var(--m-font-weight-bold)',
      link: {
        height: 'calc(3rem * var(--m-density))',
        paddingX: 'var(--m-space-4)',
        radius: '9999px',
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-semibold)',
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#f0f0f0', dark: '#3a3a3a' },
        activeFg: 'var(--m-color-fg-inverse)',
        activeBg: 'var(--m-color-bg-inverse)',
      },
    },
    // Underline tabs: ink text, a 3px black bar; pill tabs are the segmented control
    tabs: {
      height: 'calc(3rem * var(--m-density))',
      paddingX: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-md)',
      fontWeight: 'var(--m-font-weight-semibold)',
      fg: 'var(--m-color-fg-default)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-bg-inverse)',
      indicatorWidth: '3px',
      listBorder: 'transparent',
      pill: {
        listBg: 'var(--m-color-bg-sunken)',
        listRadius: '16px',
        listPadding: '4px',
        radius: '12px',
        activeBg: { light: '#ffffff', dark: '#030303' },
        activeShadow: 'none',
      },
    },
    breadcrumb: {
      separator: '"/"',
      fg: 'var(--m-color-fg-default)',
      currentWeight: 'var(--m-font-weight-bold)',
      fontSize: 'var(--m-font-size-md)',
    },
    pagination: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-semibold)',
      fg: 'var(--m-color-fg-default)',
      border: 'transparent',
      hoverBg: { light: '#e9e9e9', dark: '#4a4a4a' },
      currentBg: 'var(--m-color-bg-inverse)',
      currentFg: 'var(--m-color-fg-inverse)',
      currentBorder: 'transparent',
    },
    // Small square-ish labels, 20px, bold 12px; neutral is the grey pill fill
    badge: {
      height: '1.25rem',
      paddingX: '6px',
      radius: '4px',
      borderWidth: '0px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-semibold)',
      neutral: {
        bg: { light: '#e9e9e9', dark: '#4a4a4a' },
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        solidBg: 'var(--m-color-bg-inverse)',
        solidFg: 'var(--m-color-fg-inverse)',
      },
    },
    // Round, on the grey fill with a bold initial; a white ring when they overlap
    avatar: {
      size: { sm: '1.5rem', md: '2rem', lg: '3rem' },
      bg: { light: '#efefef', dark: '#404040' },
      fg: 'var(--m-color-fg-default)',
      fontWeight: 'var(--m-font-weight-bold)',
      ringColor: 'var(--m-color-bg-canvas)',
      ringWidth: '2px',
    },
    divider: { color: 'var(--m-color-border-muted)' },
    // Callouts: a pale tint, 16px corners, no border or stripe, a bold title
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '16px',
      padding: 'var(--m-space-4) var(--m-space-6)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    // The toast is a near-black bar with white text and 16px corners
    toast: {
      bg: 'var(--m-color-bg-inverse)',
      fg: 'var(--m-color-fg-inverse)',
      bodyFg: 'var(--m-color-fg-inverse)',
      border: 'transparent',
      accentWidth: '0px',
      radius: '16px',
      shadow: 'none',
      padding: 'var(--m-space-3) var(--m-space-4)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    // Dialogs: white, 32px corners, over an 80% black scrim, a centred bold title
    dialog: {
      bg: 'var(--m-color-bg-raised)',
      border: 'transparent',
      radius: '32px',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-6)',
      backdrop: 'rgb(0 0 0 / 0.8)',
      titleFamily: 'var(--m-font-display-family)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    // Menus: white, 16px corners, the faint floating glow, rows with 8px corners and a grey hover
    popover: {
      border: 'transparent',
      radius: '16px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-2)',
      item: {
        height: '2.75rem',
        paddingX: 'var(--m-space-2)',
        radius: '8px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: 'var(--m-color-bg-sunken)',
        hoverFg: 'var(--m-color-fg-default)',
      },
      labelFg: 'var(--m-color-fg-default)',
      labelSize: 'var(--m-font-size-xs)',
      separator: 'transparent',
    },
    // A near-black tag with white 12px text and 8px corners
    tooltip: {
      radius: '8px',
      shadow: 'none',
      paddingX: 'var(--m-space-2)',
      paddingY: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-regular)',
      delay: '300ms',
    },
    progress: {
      height: { sm: '0.25rem', md: '0.5rem', lg: '0.75rem' },
      track: 'var(--m-color-bg-sunken)',
      fill: 'var(--m-color-bg-inverse)',
    },
    usage: { height: '0.5rem', track: 'var(--m-color-bg-sunken)', okFill: 'var(--m-color-bg-inverse)' },
    skeleton: {
      bg: 'var(--m-color-bg-sunken)',
      highlight: { light: '#f9f9f9', dark: '#4a4a4a' },
      radius: '8px',
      blockRadius: '16px',
    },
    spinner: { thickness: '3px', color: 'var(--m-color-fg-default)', track: 'transparent' },
    kbd: {
      fontWeight: 'var(--m-font-weight-semibold)',
      bg: 'var(--m-color-bg-sunken)',
      border: 'transparent',
      radius: '8px',
      shadow: 'none',
    },
    code: {
      radius: '16px',
      inlineRadius: '4px',
      border: 'transparent',
      bg: { light: '#f9f9f9', dark: '#191919' },
      inlineBg: 'var(--m-color-bg-sunken)',
      inlineBorder: 'transparent',
      comment: { light: '#5f5f5f', dark: '#a5a5a5' },
    },
    // Questions in rows with hairlines, bold, a chevron on the right
    accordion: {
      radius: '0',
      bg: 'transparent',
      border: 'var(--m-color-border-muted)',
      paddingX: '0',
      paddingY: 'var(--m-space-4)',
      summarySize: 'var(--m-font-size-lg)',
      summaryWeight: 'var(--m-font-weight-bold)',
      hoverBg: 'transparent',
    },
    prose: {
      maxWidth: '66ch',
      lineHeight: '1.5',
      linkFg: 'var(--m-color-fg-default)',
      linkDecoration: 'underline',
      headingFg: 'var(--m-color-fg-default)',
    },
    // Messages: yours in grey bubbles, theirs in white with a hairline; round 24px corners
    chat: {
      radius: '24px',
      userBg: 'var(--m-color-bg-sunken)',
      userFg: 'var(--m-color-fg-default)',
      userBorder: 'transparent',
      assistantBorder: 'var(--m-color-border-muted)',
      avatarBg: { light: '#efefef', dark: '#404040' },
      avatarFg: 'var(--m-color-fg-default)',
      assistantAvatarBg: 'var(--m-color-brand-default)',
      assistantAvatarFg: 'var(--m-color-brand-fg)',
    },
    composer: {
      radius: '24px',
      shadow: 'var(--m-shadow-sm)',
      border: 'var(--m-color-border-strong)',
      focusBorder: 'var(--m-color-border-strong)',
    },
    citation: {
      chipRadius: '9999px',
      chipBg: { light: '#e9e9e9', dark: '#4a4a4a' },
      chipFg: 'var(--m-color-fg-default)',
      chipHoverBg: 'var(--m-color-bg-inverse)',
      chipHoverFg: 'var(--m-color-fg-inverse)',
      sourceRadius: '16px',
    },
    thinking: { radius: '16px' },
    toolCall: { radius: '16px', border: 'var(--m-color-border-muted)' },
  },
});
