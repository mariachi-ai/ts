import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Tinker: an engineered, playful-industrial instrument look. White and off-white grounds with grey
 * tiles, near-black text in a light grotesque set lowercase, square black actions, black hairline
 * rules between numbered rows, tiny technical all-caps captions, and one signal orange beside the
 * primary knob colours (blue, yellow, green, red). Overlays stand on a hard offset shadow. Category:
 * playful. The values are the reference's own published CSS variables, read as data, and measured
 * off its pages and web tools (see DESIGN.md).
 */

// The reference's published greys and knob colours
const black = '#0f0e12';
const grey = { 100: '#e5e5e5', 200: '#cccccc', 300: '#b2b2b2', 500: '#a1a7af', 700: '#7f7f7f', 900: '#4d4d4d', 1000: '#272727' };
const offWhite = '#f5f5f5';
const signal = '#f05a24';

// The hard, unblurred offset shadow its web tools stand their notice and title blocks on
const hard = (n: number) => ({ light: `${n}px ${n}px 0 ${black}`, dark: `${n}px ${n}px 0 #000000` });

export const tinker = extendTheme(minimal, {
  name: 'tinker',
  label: 'Tinker',
  description:
    'Engineered and playful: a light lowercase grotesque on white and off-white, square black actions, black hairline rules, tiny technical caps, and a signal orange beside knob blue, yellow, green and red.',
  tokens: {
    color: {
      bg: {
        // White pages; the off-white product and tool panels; the grey of tags and wells
        canvas: { light: '#ffffff', dark: black },
        surface: { light: offWhite, dark: '#1a191e' },
        raised: { light: '#ffffff', dark: grey[1000] },
        sunken: { light: grey[100], dark: '#000000' },
        overlay: { light: 'rgb(15 14 18 / 0.4)', dark: 'rgb(0 0 0 / 0.6)' },
        inverse: { light: black, dark: offWhite },
      },
      fg: {
        default: { light: black, dark: offWhite },
        muted: { light: grey[900], dark: grey[300] },
        // The reference's inactive grey (#767676) is 4.1:1 on the off-white tiles; one step darker
        subtle: { light: '#6b6b6b', dark: grey[500] },
        inverse: { light: offWhite, dark: black },
      },
      border: {
        // List rules in its web tools; the field and tag grey; control borders at the 3:1 floor
        default: { light: '#c7c7c7', dark: grey[900] },
        muted: { light: grey[100], dark: grey[1000] },
        strong: { light: grey[700], dark: grey[700] },
        // A focused field's border turns black
        focus: { light: black, dark: offWhite },
      },
      accent: {
        // The action colour is black: "add to cart" and "subscribe" are black blocks. Hover is the
        // reference's 70% opacity, flattened onto white
        default: { light: black, dark: offWhite },
        hover: { light: '#575659', dark: '#b1b1b2' },
        active: { light: grey[1000], dark: grey[200] },
        subtle: { light: grey[100], dark: grey[1000] },
        fg: { light: offWhite, dark: black },
        // Links are black and underlined
        text: { light: black, dark: offWhite },
      },
      // The signal orange: record keys, notices, the one lit thing on a page
      brand: {
        default: signal,
        // White on the orange is 3.4:1; black text reads at 6:1 (see the notes)
        fg: black,
        subtle: { light: '#fde6dc', dark: '#3d2117' },
      },
      success: {
        bg: { light: '#e2efe7', dark: '#0d2a1c' },
        fg: { light: '#006837', dark: '#5fc18b' },
        border: { light: '#9fc8b0', dark: '#1f5236' },
        solid: '#006837',
        onSolid: offWhite,
      },
      warning: {
        bg: { light: '#fef3d4', dark: '#33270a' },
        fg: { light: '#7a5300', dark: '#fab413' },
        border: { light: '#f3cf74', dark: '#6b4f10' },
        solid: '#fab413',
        onSolid: black,
      },
      danger: {
        bg: { light: '#f9e3e3', dark: '#3a1214' },
        fg: { light: '#b81d13', dark: '#f08a8d' },
        border: { light: '#eaa9ab', dark: '#6e2427' },
        solid: '#c0262c',
        onSolid: offWhite,
      },
      info: {
        bg: { light: '#e1eef7', dark: '#0b2537' },
        fg: { light: '#00609f', dark: '#6fb6e6' },
        border: { light: '#a3c9e4', dark: '#1d4a6b' },
        solid: '#0071bb',
        onSolid: offWhite,
      },
      selection: {
        bg: { light: '#fde0d2', dark: '#5a2a17' },
        fg: { light: black, dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // The reference's own light grotesque is proprietary; Inter Tight is the closest open face
        sans: '"Inter Tight", "Helvetica Neue", Helvetica, Arial, ui-sans-serif, system-ui, sans-serif',
        // The technical face for tiny caps, numbered labels and readouts
        display: '"Jura", "Inter Tight", ui-sans-serif, system-ui, sans-serif',
        mono: '"Sometype Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
      },
      // The reference's own steps (fs-10 … fs-40) at a 1440px window, plus an 11px caption
      size: {
        xs: '0.6875rem',
        sm: '0.8125rem',
        md: '1rem',
        lg: '1.1875rem',
        xl: '1.625rem',
        '2xl': '2.125rem',
        '3xl': '2.5rem',
        '4xl': '3.3125rem',
      },
      // Everything is light: its "300" is the body; its "100" the large type
      weight: { regular: '300', medium: '400', semibold: '500', bold: '600' },
      leading: { tight: '1.11', normal: '1.5', relaxed: '1.6' },
      tracking: { tight: '-0.0225em', normal: '0', wide: '0.06em' },
      body: { weight: '300' },
      heading: { family: 'var(--m-font-family-sans)', weight: '200', tracking: '-0.01em' },
    },
    // The base design's 5px rhythm: 5, 10, 15, 20 … (its space-xs, -sm and -md)
    space: { unit: '0.3125rem' },
    control: {
      // A field is 40px (a 1.5 line plus 10px padding); buttons 35px small and 50px large
      height: {
        sm: 'calc(2.1875rem * var(--m-density))',
        md: 'calc(2.5rem * var(--m-density))',
        lg: 'calc(3.125rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.25rem * var(--m-density))',
      },
      fontSize: '1rem',
    },
    // Square controls and tiles; 2px tags; 10px tool tiles and 15px tool panels
    radius: { sm: '2px', md: '10px', lg: '15px', control: '0px', container: '0px' },
    shadow: {
      sm: { light: '0 0 0 transparent', dark: '0 0 0 transparent' },
      md: { light: '0 0 0 transparent', dark: '0 0 0 transparent' },
      lg: hard(3),
      overlay: hard(4),
    },
    focus: { width: '2px', offset: '2px' },
    motion: {
      duration: { fast: '100ms', normal: '150ms', slow: '400ms' },
      easing: { standard: 'ease-in-out', emphasized: 'ease-in' },
    },
  },
  components: {
    // Wide product layouts: a 66px gutter at 1440px, content to about 82rem, 15px grid gaps
    layout: {
      containerMax: { sm: '45rem', md: '60rem', lg: '82rem' },
      containerPadding: 'clamp(1rem, 4.6vw, 4.125rem)',
      gridGap: '0.9375rem',
      gridMin: '18rem',
      splitSide: '15rem',
    },
    // Square blocks with a light lowercase label: black for the action, grey for the rest
    button: {
      fontWeight: 'var(--m-font-weight-regular)',
      radius: '0px',
      shadow: 'none',
      disabledOpacity: '0.4',
      secondary: {
        bg: { light: grey[100], dark: grey[1000] },
        fg: { light: grey[900], dark: grey[300] },
        border: 'transparent',
        hoverBg: { light: '#ededed', dark: '#333236' },
        activeBg: { light: grey[200], dark: grey[900] },
      },
      ghost: {
        fg: 'var(--m-color-fg-default)',
        hoverBg: 'var(--m-color-bg-surface)',
        activeBg: { light: grey[100], dark: grey[1000] },
      },
      danger: {
        bg: '#c0262c',
        fg: offWhite,
        border: '#c0262c',
        hoverBg: { light: '#d3676b', dark: '#9a1f24' },
        activeBg: { light: '#a11f25', dark: '#7d191d' },
      },
    },
    // Fields: white, square, a 1px border that turns black on focus, 10px padding
    input: {
      bg: { light: '#ffffff', dark: '#000000' },
      hoverBorder: { light: grey[900], dark: grey[300] },
      focusBorder: 'var(--m-color-border-focus)',
      invalidBorder: 'var(--m-color-danger-solid)',
      radius: '0px',
      paddingX: {
        sm: 'calc(0.5rem * var(--m-density))',
        md: 'calc(0.625rem * var(--m-density))',
        lg: 'calc(0.875rem * var(--m-density))',
      },
    },
    select: { bg: { light: '#ffffff', dark: '#000000' }, radius: '0px' },
    // Labels are small, grey and lowercase, as the reference's floating labels are
    field: {
      gap: '0.3125rem',
      labelFg: 'var(--m-color-fg-muted)',
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-regular)',
      labelTransform: 'lowercase',
      hintFg: 'var(--m-color-fg-muted)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    // 20px square boxes with a 2px border; black when checked, an off-white tick
    checkbox: {
      size: '1.25rem',
      radius: '0px',
      borderWidth: '2px',
      hoverBorder: 'var(--m-color-fg-default)',
      bg: { light: '#ffffff', dark: '#000000' },
    },
    // A square toggle that lights up in the signal orange, like a key's LED
    switch: {
      width: '2.5rem',
      height: '1.25rem',
      smWidth: '2rem',
      smHeight: '1rem',
      radius: '0px',
      trackBg: { light: grey[700], dark: grey[700] },
      trackCheckedBg: signal,
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbShadow: 'none',
    },
    // Product tiles: the off-white, square, no border and no shadow, generous padding
    card: {
      border: 'transparent',
      shadow: 'none',
      hoverShadow: 'none',
      hoverBorder: 'transparent',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-3)', md: 'var(--m-space-5)', lg: 'var(--m-space-8)' },
      titleFamily: 'var(--m-font-family-sans)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-regular)',
      outline: { bg: 'transparent', border: { light: grey[900], dark: grey[700] } },
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    // Lists: full-bleed rows split by black hairlines, no frame, tiny technical caps for headers
    table: {
      bg: 'transparent',
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: 'var(--m-space-3)',
      cellPaddingY: 'var(--m-space-2)',
      borderColor: { light: black, dark: grey[900] },
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-xs)',
      headerFontWeight: 'var(--m-font-weight-medium)',
      headerTransform: 'uppercase',
      headerTracking: 'var(--m-font-tracking-wide)',
      rowHoverBg: 'var(--m-color-bg-surface)',
      stripeBg: 'var(--m-color-bg-surface)',
      wrapBorder: 'transparent',
      wrapRadius: '0px',
    },
    // A plain column: grey lowercase links, the current one black; headings in tiny caps
    sidebar: {
      width: '15rem',
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      padding: 'var(--m-space-4)',
      sectionGap: 'var(--m-space-6)',
      itemGap: '0px',
      fontSize: 'var(--m-font-size-md)',
      link: {
        fg: 'var(--m-color-fg-subtle)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
        activeWeight: 'var(--m-font-weight-regular)',
        radius: '0px',
        paddingX: '0px',
        paddingY: 'calc(0.25rem * var(--m-density))',
        indicator: 'var(--m-color-fg-default)',
        indicatorWidth: '0px',
      },
      heading: {
        fg: 'var(--m-color-fg-muted)',
        size: 'var(--m-font-size-xs)',
        weight: 'var(--m-font-weight-medium)',
        transform: 'uppercase',
        tracking: 'var(--m-font-tracking-wide)',
      },
      count: { bg: 'transparent', fg: 'var(--m-color-fg-subtle)', radius: '0px' },
    },
    // The header: tall, no rule, a thin brand word and light lowercase links
    navbar: {
      height: 'calc(4.5rem * var(--m-density))',
      paddingX: 'clamp(1rem, 4.6vw, 4.125rem)',
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      brandFamily: 'var(--m-font-family-sans)',
      brandSize: 'var(--m-font-size-xl)',
      brandWeight: '200',
      link: {
        height: 'var(--m-control-height-sm)',
        paddingX: '0px',
        radius: '0px',
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-regular)',
        fg: 'var(--m-color-fg-subtle)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
      },
    },
    // The category row: grey lowercase words, the current one black over a 1px rule. The
    // segmented control is an off-white well with square segments, the chosen one white
    tabs: {
      height: 'var(--m-control-height-md)',
      paddingX: '0.5rem',
      listGap: '0.3125rem',
      fontSize: 'var(--m-font-size-lg)',
      fontWeight: 'var(--m-font-weight-regular)',
      fg: 'var(--m-color-fg-subtle)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      listBorder: 'transparent',
      indicator: 'var(--m-color-fg-default)',
      indicatorWidth: '1px',
      pill: {
        listBg: { light: offWhite, dark: '#000000' },
        listRadius: '0px',
        listPadding: '0.125rem',
        radius: '0px',
        activeBg: { light: '#ffffff', dark: grey[900] },
        activeShadow: 'none',
      },
    },
    pagination: {
      radius: '0px',
      fontWeight: 'var(--m-font-weight-regular)',
      hoverBg: 'var(--m-color-bg-surface)',
    },
    breadcrumb: {
      fontSize: 'var(--m-font-size-sm)',
      currentWeight: 'var(--m-font-weight-regular)',
    },
    // Tags: tiny caps on a grey block with 2px corners; the solid one is black
    badge: {
      height: '1.25rem',
      paddingX: '0.375rem',
      radius: '2px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-medium)',
      textTransform: 'uppercase',
      tracking: 'var(--m-font-tracking-wide)',
      neutral: {
        bg: 'var(--m-color-bg-sunken)',
        fg: { light: grey[900], dark: grey[300] },
        border: 'transparent',
        solidBg: { light: black, dark: offWhite },
        solidFg: { light: offWhite, dark: black },
      },
    },
    // Round like a knob cap: initials on the grey
    avatar: {
      bg: { light: grey[100], dark: grey[1000] },
      fg: 'var(--m-color-fg-default)',
      fontWeight: 'var(--m-font-weight-regular)',
    },
    // Notices: a flat tint with 10px corners (the tools' notice box), no border or stripe
    alert: {
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '10px',
      padding: 'var(--m-space-3) var(--m-space-4)',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    // Toasts, dialogs and menus: square white blocks with a black hairline on a hard offset shadow
    toast: {
      bg: 'var(--m-color-bg-raised)',
      border: { light: black, dark: grey[700] },
      accentWidth: '0px',
      radius: '0px',
      shadow: 'var(--m-shadow-overlay)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    dialog: {
      border: { light: black, dark: grey[700] },
      radius: '0px',
      padding: 'var(--m-space-6)',
      titleFamily: 'var(--m-font-family-sans)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: '200',
      enterTransform: 'translateY(0.5rem)',
    },
    popover: {
      border: { light: black, dark: grey[700] },
      radius: '0px',
      shadow: 'var(--m-shadow-lg)',
      padding: '0px',
      item: {
        radius: '0px',
        paddingX: 'var(--m-space-3)',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: 'var(--m-color-bg-surface)',
      },
      labelSize: 'var(--m-font-size-xs)',
      separator: { light: black, dark: grey[700] },
    },
    // The tools' tooltip: a navy pill with off-white 13px text
    tooltip: {
      bg: '#192a3c',
      fg: offWhite,
      radius: '9999px',
      shadow: 'none',
      paddingX: '0.875rem',
      paddingY: '0.375rem',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
      delay: '150ms',
    },
    progress: {
      height: { sm: '0.125rem', md: '0.25rem', lg: '0.5rem' },
      radius: '0px',
      track: 'var(--m-color-bg-sunken)',
      fill: 'var(--m-color-accent-default)',
    },
    accordion: {
      bg: 'transparent',
      border: { light: black, dark: grey[900] },
      radius: '0px',
      paddingX: '0.625rem',
      paddingY: 'var(--m-space-3)',
      summarySize: 'var(--m-font-size-lg)',
      summaryWeight: 'var(--m-font-weight-regular)',
      hoverBg: 'transparent',
    },
    divider: { labelFontSize: 'var(--m-font-size-xs)' },
    skeleton: { bg: { light: grey[100], dark: grey[1000] }, highlight: { light: offWhite, dark: '#333236' }, radius: '0px' },
    // The reference's spinner: a thin turning arc, no track
    spinner: { color: 'var(--m-color-fg-default)', track: 'transparent', thickness: '2px', duration: '1s' },
    // Keys: small black keycaps with off-white technical caps, like a device's buttons
    kbd: {
      fontFamily: 'var(--m-font-family-display)',
      fontWeight: 'var(--m-font-weight-semibold)',
      bg: { light: black, dark: offWhite },
      fg: { light: offWhite, dark: black },
      border: { light: black, dark: offWhite },
      radius: '2px',
      shadow: 'none',
      paddingX: '0.3125rem',
    },
    code: {
      radius: '0px',
      bg: 'var(--m-color-bg-surface)',
      border: 'transparent',
      headerBg: 'var(--m-color-bg-sunken)',
      inlineBg: 'var(--m-color-bg-sunken)',
      inlineBorder: 'transparent',
      inlineRadius: '2px',
    },
    prose: {
      maxWidth: '40rem',
      lineHeight: 'var(--m-font-leading-normal)',
      h2Border: 'transparent',
      quoteBorder: 'var(--m-color-fg-default)',
      quoteBorderWidth: '1px',
      tableHeaderBg: 'transparent',
      tableBorder: { light: black, dark: grey[900] },
    },
    // The assistant writes straight on the page; your messages sit in a grey square block
    chat: {
      radius: '0px',
      userBg: 'var(--m-color-bg-sunken)',
      userBorder: 'transparent',
      assistantBg: 'transparent',
      assistantBorder: 'transparent',
      assistantAvatarBg: signal,
      assistantAvatarFg: black,
    },
    composer: { radius: '0px', shadow: 'none', focusBorder: 'var(--m-color-border-focus)' },
    citation: { chipRadius: '2px', chipBg: 'var(--m-color-bg-sunken)', chipFg: 'var(--m-color-fg-default)' },
    toolCall: { radius: '0px', statusRadius: '2px' },
    thinking: { radius: '0px', ruleWidth: '1px' },
    usage: { radius: '0px', height: '0.25rem', okFill: 'var(--m-color-accent-default)' },
  },
});
