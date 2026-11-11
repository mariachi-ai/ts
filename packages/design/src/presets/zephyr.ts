import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Zephyr: a fast, high-contrast trading interface. Pure black screens with cool charcoal cards in
 * dark (its home), white with cool greys in light; a neon lime for gains, brand panels and the
 * primary pill in dark, a deeper green in light; an orange-red for losses; loud solid pills, price
 * chips in the gain or loss colour, thin chart lines and hairline rows. Category: bold and fast.
 * The values are measured, not invented (see DESIGN.md).
 */
const lime = '#ccff00';
const ink = '#110e08';

export const zephyr = extendTheme(minimal, {
  name: 'zephyr',
  label: 'Zephyr',
  description:
    'Fast and high-contrast: black screens and charcoal cards, a neon lime for gains and the primary pill, orange-red for losses, solid pills and price chips.',
  tokens: {
    color: {
      bg: {
        // Dark is the app's screen (sampled #000000) and its cards (#1e2225); light is the web's
        // neutral palette (bg1 #ffffff, bg2 #f5f8fa, bg3 #e3e9ed)
        canvas: { light: '#ffffff', dark: '#000000' },
        surface: { light: '#ffffff', dark: '#1e2225' },
        raised: { light: '#ffffff', dark: '#282b30' },
        // Wells, table headers, the side panel's quiet fill; dark is the desktop platform's panel
        sunken: { light: '#f5f8fa', dark: '#16181b' },
        overlay: { light: 'rgb(0 0 0 / 0.4)', dark: 'rgb(0 0 0 / 0.72)' },
        // The solid pill: black on the light web, white in the dark app
        inverse: { light: '#000000', dark: '#ffffff' },
      },
      fg: {
        default: { light: '#000000', dark: '#ffffff' },
        // Web fg2 #6a7278; the app's secondary grey sampled #9ba3a9
        muted: { light: '#6a7278', dark: '#9ba3a9' },
        // The reference's tertiary grey (#b4bdc2) is 1.9:1; held at the 4.5:1 floor
        subtle: { light: '#6f777d', dark: '#8a9196' },
        inverse: { light: '#ffffff', dark: '#000000' },
      },
      border: {
        // Hairlines: web bg3 #e3e9ed; the app's list divider sampled #333438
        default: { light: '#e3e9ed', dark: '#333438' },
        muted: { light: '#f5f8fa', dark: '#26292d' },
        // Control borders: #e3e9ed is 1.2:1, so the reference's hover grey (fg2 hover #80878c)
        strong: { light: '#80878c', dark: '#737b81' },
        // The web's focus blue (--focus-inner-color)
        focus: { light: '#007ff5', dark: '#007ff5' },
      },
      // The action colour: the app's lime in dark; in light the web's green, one step deeper
      // (#00c805 is 2.3:1 on white), with black text on both
      accent: {
        default: { light: '#00a004', dark: lime },
        hover: { light: '#009604', dark: '#b8e600' },
        active: { light: '#008c03', dark: '#a3cc00' },
        subtle: { light: '#e6fae6', dark: '#1f2600' },
        fg: '#000000',
        text: { light: '#007a03', dark: lime },
      },
      // The signature lime: brand panels, the upsell card, the footer band, the logo mark
      brand: {
        default: { light: lime, dark: lime },
        fg: { light: ink, dark: ink },
        subtle: { light: '#f5ffcc', dark: '#1f2600' },
      },
      // Gains: green on white, lime on black. Chips are solid with black figures
      success: {
        bg: { light: '#e6fae6', dark: '#1f2600' },
        fg: { light: '#007a03', dark: lime },
        border: { light: '#00c805', dark: lime },
        solid: { light: '#00c805', dark: lime },
        onSolid: '#000000',
      },
      // Not in the reference's palette; an amber chosen to sit between lime and orange-red
      warning: {
        bg: { light: '#fff5d6', dark: '#261c00' },
        fg: { light: '#7a5500', dark: '#ffc933' },
        border: { light: '#f5b700', dark: '#ffc933' },
        solid: { light: '#f5b700', dark: '#ffc933' },
        onSolid: '#000000',
      },
      // Losses and errors: the orange-red #ff5000 (--semantic-negative-base), black on the chip
      danger: {
        bg: { light: '#ffeee6', dark: '#1f0a00' },
        fg: { light: '#b33800', dark: '#ff5000' },
        border: { light: '#ff5000', dark: '#ff5000' },
        solid: { light: '#ff5000', dark: '#ff5000' },
        onSolid: '#000000',
      },
      // The focus blue as the information tone
      info: {
        bg: { light: '#e5f2fe', dark: '#001a33' },
        fg: { light: '#0063c0', dark: '#5aa9ff' },
        border: { light: '#007ff5', dark: '#3d9bff' },
        solid: { light: '#007ff5', dark: '#3d9bff' },
        onSolid: '#000000',
      },
      selection: {
        bg: { light: lime, dark: lime },
        fg: { light: '#000000', dark: '#000000' },
      },
    },
    font: {
      family: {
        // A plain, slightly narrow grotesque with a single-storey g, close to the original's widths
        sans: '"Albert Sans Variable", "Albert Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
        display:
          '"Albert Sans Variable", "Albert Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
        // Marketing headlines: a sharp text serif
        serif: '"Newsreader Variable", "Newsreader", ui-serif, Georgia, serif',
        mono: '"Roboto Mono Variable", "Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      // The type palette: textS 13, textM 15, textL 18, displayS 21, displayM 24, displayL 32, cover 44
      size: {
        xs: '0.75rem',
        sm: '0.8125rem',
        md: '0.9375rem',
        lg: '1.125rem',
        xl: '1.3125rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.75rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.25', normal: '1.53', relaxed: '1.6' },
      // Text -0.1px, display -0.33px; the timeframe labels are tracked 2px at 13px
      tracking: { tight: '-0.01em', normal: '-0.007em', wide: '0.15em' },
      body: { weight: '400' },
      heading: { weight: '500', tracking: '-0.01em' },
    },
    control: {
      // Buttons 44px (--buttonHeight); rows 36/48/60 (--cellHeight*)
      height: {
        sm: 'calc(2.25rem * var(--m-density))',
        md: 'calc(2.75rem * var(--m-density))',
        lg: 'calc(3rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(1rem * var(--m-density))',
        md: 'calc(1.5rem * var(--m-density))',
        lg: 'calc(2rem * var(--m-density))',
      },
      fontSize: 'var(--m-font-size-md)',
    },
    // 4px is the web's one radius (--borderRadius); app cards are about 12px; pills everywhere else
    radius: { sm: '4px', md: '8px', lg: '12px', control: '4px', container: '12px' },
    shadow: {
      sm: { light: '0 1px 2px rgb(0 0 0 / 0.06)', dark: 'none' },
      // The web panel's shadow: --shadow__s1 below, --shadow__s2 above
      md: {
        light: '0 -12px 24px rgb(0 0 0 / 0.02), 0 12px 24px rgb(0 0 0 / 0.06)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.06)',
      },
      lg: {
        light: '0 -12px 24px rgb(0 0 0 / 0.02), 0 12px 24px rgb(0 0 0 / 0.08), 0 0 0 1px rgb(0 0 0 / 0.04)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.08), 0 12px 32px rgb(0 0 0 / 0.6)',
      },
      overlay: {
        light: '0 -12px 24px rgb(0 0 0 / 0.02), 0 16px 40px rgb(0 0 0 / 0.12)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.08), 0 24px 48px rgb(0 0 0 / 0.7)',
      },
    },
    motion: {
      duration: { fast: '150ms', normal: '200ms', slow: '300ms' },
      easing: { standard: 'ease-out', emphasized: 'cubic-bezier(0.2, 0.9, 0.3, 1)' },
    },
  },
  components: {
    // The web's two columns: a main column beside a 330px order or list panel; 12px gutters
    layout: {
      containerMax: { sm: '28rem', md: '42rem', lg: '76rem' },
      containerPadding: 'clamp(1rem, 3vw, 1.5rem)',
      gridGap: 'var(--m-space-3)',
      splitSide: '20.625rem',
    },
    // Loud pills: the accent for the one that matters, the solid ink pill (white in dark) for the
    // rest, a hairline outline for chips and quiet actions
    button: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-semibold)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      secondary: {
        bg: 'var(--m-color-bg-inverse)',
        fg: 'var(--m-color-fg-inverse)',
        border: 'var(--m-color-bg-inverse)',
        hoverBg: { light: '#262626', dark: '#e6e6e6' },
        activeBg: { light: '#404040', dark: '#d1d1d1' },
      },
      ghost: {
        fg: 'var(--m-color-fg-default)',
        border: 'var(--m-color-border-default)',
        hoverBg: { light: '#f2f2f2', dark: '#1e2225' },
        activeBg: { light: '#e6e6e6', dark: '#282b30' },
      },
      danger: {
        bg: '#ff5000',
        fg: '#000000',
        border: '#ff5000',
        hoverBg: '#e64800',
        activeBg: '#cc4000',
      },
    },
    // The web field: 36px, 4px corners, 13px text, 12px in from the edge
    input: {
      fontSize: 'var(--m-font-size-sm)',
      bg: 'var(--m-color-bg-surface)',
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-border-focus)',
      invalidBorder: 'var(--m-color-danger-border)',
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(2.25rem * var(--m-density))',
        lg: 'calc(3rem * var(--m-density))',
      },
      paddingX: { sm: '0.75rem', md: '0.75rem', lg: '1.25rem' },
    },
    select: {
      fontSize: 'var(--m-font-size-sm)',
      bg: 'var(--m-color-bg-surface)',
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-border-focus)',
      invalidBorder: 'var(--m-color-danger-border)',
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(2.25rem * var(--m-density))',
        lg: 'calc(3rem * var(--m-density))',
      },
      paddingX: { sm: '0.75rem', md: '0.75rem', lg: '1.25rem' },
    },
    field: {
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-regular)',
      hintFg: 'var(--m-color-fg-muted)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    checkbox: { size: '1.125rem', radius: '4px', hoverBorder: 'var(--m-color-fg-default)' },
    radio: { size: '1.125rem' },
    // The phone switch: the accent when on, the control grey when off, a white knob (black on the
    // lime, where white is 1.2:1)
    switch: {
      width: '3.1875rem',
      height: '1.9375rem',
      smWidth: '2.5rem',
      smHeight: '1.5rem',
      thumbInset: '2px',
      trackBg: 'var(--m-color-border-strong)',
      thumbBg: '#ffffff',
      thumbCheckedBg: { light: '#ffffff', dark: '#000000' },
      thumbShadow: '0 2px 6px rgb(0 0 0 / 0.2)',
    },
    // App cards: charcoal on black, no border, no shadow, 12px corners; on white they take the
    // web panel's hairline and soft shadow
    card: {
      bg: 'var(--m-color-bg-surface)',
      // The web panel's 4px in light; the app's 12px cards in dark
      radius: { light: '4px', dark: '12px' },
      border: { light: '#e3e9ed', dark: 'transparent' },
      shadow: { light: '0 -12px 24px rgb(0 0 0 / 0.02), 0 12px 24px rgb(0 0 0 / 0.06)', dark: 'none' },
      hoverShadow: 'var(--m-shadow-lg)',
      hoverBorder: { light: '#e3e9ed', dark: 'transparent' },
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-3)', md: 'var(--m-space-5)', lg: 'var(--m-space-6)' },
      titleFamily: 'var(--m-font-family-display)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-medium)',
      outline: { bg: 'transparent', border: 'var(--m-color-border-default)' },
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    // Hairline rows, no fill: bold 13px labels, 15px values, right-aligned figures
    table: {
      bg: 'transparent',
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: '0.75rem',
      cellPaddingY: '0.75rem',
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-default)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-bold)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      rowHoverBg: { light: '#f5f8fa', dark: '#16181b' },
      stripeBg: { light: '#f5f8fa', dark: '#16181b' },
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    // The side panel (lists and watchlists): a 330px column on a hairline, rows without fills
    sidebar: {
      width: '20.625rem',
      bg: 'var(--m-color-bg-canvas)',
      border: 'var(--m-color-border-default)',
      fontSize: 'var(--m-font-size-md)',
      padding: 'var(--m-space-3)',
      itemGap: '0',
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#f5f8fa', dark: '#16181b' },
        activeFg: 'var(--m-color-accent-text)',
        activeBg: 'transparent',
        activeWeight: 'var(--m-font-weight-bold)',
        radius: '4px',
        paddingX: 'var(--m-space-3)',
        paddingY: 'calc(0.75rem * var(--m-density))',
        indicator: 'var(--m-color-accent-default)',
      },
      heading: {
        fg: 'var(--m-color-fg-default)',
        size: 'var(--m-font-size-md)',
        weight: 'var(--m-font-weight-bold)',
        transform: 'none',
        tracking: '0',
      },
      count: { bg: 'var(--m-color-bg-sunken)', fg: 'var(--m-color-fg-muted)', radius: '9999px' },
    },
    // The signed-in web bar: 64px, the canvas colour with no rule under it, bold 14px ink links, the
    // current one in the accent text
    navbar: {
      height: '4rem',
      paddingX: 'var(--m-space-6)',
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      shadow: 'none',
      brandFamily: 'var(--m-font-family-display)',
      brandWeight: 'var(--m-font-weight-medium)',
      brandSize: 'var(--m-font-size-xl)',
      link: {
        radius: '4px',
        paddingX: '0.75rem',
        fontSize: '0.875rem',
        fontWeight: 'var(--m-font-weight-bold)',
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-accent-text)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-accent-text)',
        activeBg: 'transparent',
      },
    },
    // Underline tabs: bold 13px, the current one in ink over a 2px ink line on a hairline. The
    // pill variant is the timeframe row: no track, 4px chips (recipes paint the chip in the accent)
    tabs: {
      listGap: 'var(--m-space-6)',
      height: '2.5rem',
      paddingX: '0',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-bold)',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-fg-default)',
      indicatorWidth: '2px',
      listBorder: 'var(--m-color-border-default)',
      pill: {
        listBg: 'transparent',
        listRadius: '0',
        listPadding: '0',
        radius: '4px',
        activeBg: 'var(--m-color-accent-subtle)',
        activeShadow: 'none',
      },
    },
    pagination: {
      radius: '9999px',
      border: 'transparent',
      fontWeight: 'var(--m-font-weight-semibold)',
      fg: 'var(--m-color-fg-default)',
      hoverBg: { light: '#f2f2f2', dark: '#1e2225' },
      currentBg: 'var(--m-color-bg-inverse)',
      currentFg: 'var(--m-color-fg-inverse)',
      currentBorder: 'transparent',
    },
    breadcrumb: {
      separator: '"›"',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      currentFg: 'var(--m-color-fg-default)',
      currentWeight: 'var(--m-font-weight-bold)',
    },
    // Price chips: 4px corners, bold figures; solid in the gain or loss colour with black text
    badge: {
      height: '1.75rem',
      paddingX: '0.5rem',
      radius: '4px',
      borderWidth: '0px',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-semibold)',
      neutral: {
        bg: { light: '#e3e9ed', dark: '#282b30' },
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        solidBg: 'var(--m-color-bg-inverse)',
        solidFg: 'var(--m-color-fg-inverse)',
      },
    },
    avatar: {
      size: { sm: '1.5rem', md: '2.25rem', lg: '3rem' },
      bg: { light: '#e3e9ed', dark: '#282b30' },
      fg: 'var(--m-color-fg-default)',
      fontWeight: 'var(--m-font-weight-semibold)',
    },
    // Notices: a tinted panel with 4px corners, no stripe, no border
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '4px',
      padding: 'var(--m-space-4)',
      gap: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    // The snackbar: the solid ink pill colour (white in dark), squared to 8px
    toast: {
      bg: 'var(--m-color-bg-inverse)',
      fg: 'var(--m-color-fg-inverse)',
      bodyFg: { light: '#c3c8cc', dark: '#3d4247' },
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '8px',
      shadow: 'var(--m-shadow-overlay)',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    // The web sheet: 24px corners, generous padding, a display title
    dialog: {
      bg: 'var(--m-color-bg-raised)',
      border: 'transparent',
      radius: '24px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-8)',
      titleFamily: 'var(--m-font-family-display)',
      titleSize: 'var(--m-font-size-2xl)',
      titleWeight: 'var(--m-font-weight-medium)',
      descriptionFg: 'var(--m-color-fg-muted)',
    },
    popover: {
      bg: 'var(--m-color-bg-raised)',
      border: { light: '#e3e9ed', dark: 'transparent' },
      radius: '8px',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-2)',
      item: {
        height: '2.5rem',
        paddingX: 'var(--m-space-3)',
        radius: '4px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: { light: '#f5f8fa', dark: '#33373c' },
        hoverFg: 'var(--m-color-fg-default)',
        // #ff5000 is 4.3:1 on the raised charcoal; one step lighter
        dangerFg: { light: '#b33800', dark: '#ff6d33' },
      },
      separator: 'var(--m-color-border-default)',
    },
    tooltip: {
      radius: '4px',
      shadow: 'none',
      paddingX: 'var(--m-space-3)',
      paddingY: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
    },
    progress: {
      height: { sm: '0.125rem', md: '0.25rem', lg: '0.375rem' },
      radius: '9999px',
      track: 'var(--m-color-bg-sunken)',
      fill: 'var(--m-color-accent-default)',
    },
    usage: {
      radius: '9999px',
      height: '0.25rem',
      track: 'var(--m-color-bg-sunken)',
      okFill: 'var(--m-color-accent-default)',
      warnFill: 'var(--m-color-warning-fg)',
      overFill: 'var(--m-color-danger-solid)',
    },
    // Hairline rows, a 21px question (the site's is 22px), the chevron at the right; no fills
    accordion: {
      bg: 'transparent',
      radius: '0',
      paddingX: '0',
      paddingY: '0.9375rem',
      summarySize: 'var(--m-font-size-xl)',
      summaryWeight: 'var(--m-font-weight-regular)',
      hoverBg: 'transparent',
      contentFg: 'var(--m-color-fg-muted)',
    },
    skeleton: {
      bg: { light: '#e3e9ed', dark: '#1e2225' },
      highlight: { light: '#f5f8fa', dark: '#282b30' },
      radius: '4px',
      duration: '1.2s',
    },
    spinner: { color: 'var(--m-color-accent-default)', duration: '0.8s' },
    kbd: { radius: '4px', shadow: 'none', fontWeight: 'var(--m-font-weight-semibold)' },
    code: {
      radius: '8px',
      inlineRadius: '4px',
      bg: 'var(--m-color-bg-sunken)',
      inlineBg: 'var(--m-color-bg-sunken)',
      keyword: 'var(--m-color-info-fg)',
      string: 'var(--m-color-success-fg)',
      function: 'var(--m-color-fg-default)',
      comment: 'var(--m-color-fg-muted)',
    },
    prose: { linkFg: 'var(--m-color-accent-text)', linkDecoration: 'underline', maxWidth: '42rem' },
    // Support chat: the person's messages in lime with black text, the agent's on charcoal; the
    // corner nearest the speaker squared
    chat: {
      radius: '12px',
      userBg: 'var(--m-color-brand-default)',
      userFg: 'var(--m-color-brand-fg)',
      userBorder: 'transparent',
      assistantBg: 'var(--m-color-bg-surface)',
      assistantFg: 'var(--m-color-fg-default)',
      assistantBorder: { light: '#e3e9ed', dark: 'transparent' },
      avatarBg: { light: '#e3e9ed', dark: '#282b30' },
      avatarFg: 'var(--m-color-fg-default)',
      assistantAvatarBg: 'var(--m-color-bg-inverse)',
      assistantAvatarFg: 'var(--m-color-fg-inverse)',
    },
    composer: {
      bg: 'var(--m-color-bg-surface)',
      radius: '24px',
      shadow: 'none',
      focusBorder: 'var(--m-color-border-focus)',
    },
    citation: {
      chipBg: { light: '#e3e9ed', dark: '#282b30' },
      chipFg: 'var(--m-color-fg-default)',
      chipRadius: '4px',
    },
    toolCall: { radius: '8px', statusRadius: '4px' },
  },
});
