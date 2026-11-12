import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Nacre: a playful, colourful browsing-tool interface. A periwinkle frame holds a borderless sidebar
 * and a white content panel with soft 10–12px corners; the current row is a white tile with a soft
 * glow; groups are tinted in their own colour; actions are a vivid blue with 10px corners; headings
 * are a heavy, tightly tracked geometric sans and labels are tracked mono capitals. Brand bands are
 * a deep indigo with cream type. Category: playful. The values are measured, not invented (see
 * DESIGN.md).
 */
export const nacre = extendTheme(minimal, {
  name: 'nacre',
  label: 'Nacre',
  description:
    'Playful and colourful: a periwinkle frame around a white panel, soft rounded rows, a white current tile with a glow, tinted groups, a vivid blue and heavy tight headings.',
  tokens: {
    color: {
      bg: {
        // The frame: the sidebar and the window around the content panel take the space colour
        canvas: { light: '#d9dcfa', dark: '#1b1938' },
        // The content panel, cards and inputs
        surface: { light: '#ffffff', dark: '#202024' },
        // The command bar, menus and dialogs
        raised: { light: '#ffffff', dark: '#2a2a30' },
        // Settings wells, table headers, quiet fills
        sunken: { light: '#f3f3f5', dark: '#18181c' },
        overlay: { light: 'rgb(20 18 60 / 0.35)', dark: 'rgb(0 0 0 / 0.6)' },
        // Tooltips and tags: near-black, as the reference's dark tag pills
        inverse: { light: '#1a1a1a', dark: '#f2f2f5' },
      },
      fg: {
        // Black at 86–90% over white
        default: { light: '#1a1a1a', dark: '#f2f2f5' },
        // Black at 68% (tab titles, command-bar rows)
        muted: { light: '#525252', dark: '#b5b5c0' },
        // The reference's "New Tab" grey (#727272) is 3.7:1 on the frame; this is the frame-tinted
        // grey it uses on coloured spaces, darkened to the 4.5:1 floor
        subtle: { light: '#5c5d84', dark: '#9a9ab0' },
        inverse: { light: '#ffffff', dark: '#1a1a1a' },
      },
      border: {
        // Black at 7% (separators) and 4%
        default: { light: '#e6e6ea', dark: '#36364a' },
        muted: { light: '#efeff2', dark: '#2a2a33' },
        // Controls: the reference's inputs use a 10% hairline (1.3:1); the library holds controls at
        // 3:1, so this is the frame's own indigo-grey at that floor
        strong: { light: '#727494', dark: '#77778a' },
        focus: { light: '#3139fb', dark: '#9ea3ff' },
      },
      // The vivid blue of the brand gradient
      accent: {
        default: { light: '#3139fb', dark: '#4f56fb' },
        hover: { light: '#2a31e3', dark: '#454cec' },
        active: { light: '#2702c2', dark: '#3a40d6' },
        // The violet group tint (#8d7bff at 16% over the panel grey)
        subtle: { light: '#e6e5fe', dark: '#2b2a5a' },
        fg: '#ffffff',
        text: { light: '#3139fb', dark: '#9ea3ff' },
      },
      // The signature: the deep indigo band with cream type
      brand: {
        default: { light: '#2702c2', dark: '#2702c2' },
        fg: { light: '#fffcec', dark: '#fffcec' },
        subtle: { light: '#ebe7fd', dark: '#262256' },
      },
      // The mint group colour
      success: {
        bg: { light: '#ddf7ee', dark: '#0f2e26' },
        fg: { light: '#006a4e', dark: '#5fe0b6' },
        border: { light: '#a8e9d3', dark: '#1d5244' },
        solid: { light: '#00805f', dark: '#1fbf8f' },
        onSolid: { light: '#ffffff', dark: '#06201a' },
      },
      // The orange group colour
      warning: {
        bg: { light: '#fdf0dc', dark: '#33260f' },
        fg: { light: '#8f4b00', dark: '#ffc06b' },
        border: { light: '#f6d4a3', dark: '#5c4317' },
        solid: { light: '#ffaa33', dark: '#ffaa33' },
        onSolid: { light: '#1a1a1a', dark: '#1a1a1a' },
      },
      // The coral-red of the mark and the close light
      danger: {
        bg: { light: '#fde8ea', dark: '#3a161d' },
        fg: { light: '#b51d34', dark: '#ff8f9c' },
        border: { light: '#f7c3ca', dark: '#682631' },
        solid: { light: '#d6283f', dark: '#d42a42' },
        onSolid: '#ffffff',
      },
      // The cyan group colour
      info: {
        bg: { light: '#dcf4fc', dark: '#0c2a38' },
        fg: { light: '#00628f', dark: '#6fd3f7' },
        border: { light: '#a9e1f5', dark: '#164b62' },
        solid: { light: '#007bb3', dark: '#1aa6dc' },
        onSolid: { light: '#ffffff', dark: '#04202c' },
      },
      selection: {
        bg: { light: '#c9cbfd', dark: '#3a3f9e' },
        fg: { light: '#1a1a1a', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // The interface and body face (the reference's site body face; the app uses the system UI face)
        sans: '"Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"',
        // Heavy, tight, geometric: stands in for the reference's soft display face
        display:
          '"Plus Jakarta Sans Variable", "Plus Jakarta Sans", "Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif',
        // Tracked capitals and figures, as the site's mono labels
        mono: '"Space Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      size: {
        xs: '0.75rem',
        sm: '0.8125rem',
        md: '0.875rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.75rem',
        '3xl': '2.25rem',
        '4xl': '2.875rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.05', normal: '1.5', relaxed: '1.65' },
      tracking: { tight: '-0.04em', normal: '0', wide: '0.06em' },
      body: { weight: '400' },
      heading: { weight: '700', tracking: '-0.04em' },
    },
    control: {
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(2.25rem * var(--m-density))',
        lg: 'calc(2.75rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.5rem * var(--m-density))',
      },
      fontSize: '0.875rem',
    },
    // 8px inputs and small parts, 10px buttons, rows and tiles, 12px groups, cards and the command bar
    radius: { sm: '6px', md: '8px', lg: '12px', control: '10px', container: '12px' },
    shadow: {
      // Buttons and tiles: a half-pixel ring and a short drop
      sm: {
        light: '0 0 0 0.5px rgb(0 0 0 / 0.08), 0 1px 3px rgb(0 0 0 / 0.1)',
        dark: '0 0 0 0.5px rgb(255 255 255 / 0.08), 0 1px 3px rgb(0 0 0 / 0.5)',
      },
      // The content panel and cards: a 2px halo
      md: {
        light: '0 0 0 0.5px rgb(0 0 0 / 0.06), 0 0 2px rgb(0 0 0 / 0.18)',
        dark: '0 0 0 0.5px rgb(255 255 255 / 0.08), 0 0 2px rgb(0 0 0 / 0.6)',
      },
      // The current tab's glow: a wide, faint, centred blur
      lg: {
        light: '0 0.4px 19.3px rgb(0 0 0 / 0.12), 0 0 0 0.5px rgb(0 0 0 / 0.04)',
        dark: '0 0.4px 19.3px rgb(0 0 0 / 0.5), 0 0 0 0.5px rgb(255 255 255 / 0.08)',
      },
      // The window and the command bar
      overlay: {
        light: '0 20px 50px rgb(0 0 0 / 0.27), 0 0 0 0.5px rgb(0 0 0 / 0.12)',
        dark: '0 20px 50px rgb(0 0 0 / 0.6), 0 0 0 0.5px rgb(255 255 255 / 0.12)',
      },
    },
    focus: { width: '2px', offset: '2px' },
    motion: {
      duration: { fast: '150ms', normal: '250ms', slow: '400ms' },
      // Springy: things overshoot a touch and settle
      easing: { standard: 'cubic-bezier(0.2, 0, 0, 1)', emphasized: 'cubic-bezier(0.34, 1.4, 0.64, 1)' },
    },
  },
  components: {
    // A 244px sidebar on the frame beside a white panel; content to 72rem
    layout: {
      containerMax: { sm: '30rem', md: '46rem', lg: '72rem' },
      containerPadding: 'clamp(1rem, 4vw, 2.5rem)',
      gridGap: 'var(--m-space-3)',
      gridMin: '15rem',
      splitSide: '15.25rem',
    },
    // 10px corners; solid blue for the one action, white tiles with a ring for the rest
    button: {
      fontWeight: 'var(--m-font-weight-semibold)',
      shadow: 'var(--m-shadow-sm)',
      hoverShadow: 'var(--m-shadow-sm)',
      activeShadow: 'none',
      activeTransform: 'scale(0.98)',
      primary: { border: 'transparent' },
      secondary: {
        bg: { light: '#ffffff', dark: '#2f2f36' },
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        hoverBg: { light: '#f7f7f9', dark: '#38383f' },
        activeBg: { light: '#efeff2', dark: '#414149' },
      },
      ghost: {
        fg: 'var(--m-color-fg-default)',
        hoverBg: { light: 'rgb(0 0 0 / 0.05)', dark: 'rgb(255 255 255 / 0.07)' },
        activeBg: { light: 'rgb(0 0 0 / 0.09)', dark: 'rgb(255 255 255 / 0.12)' },
      },
      danger: { border: 'transparent' },
    },
    // White panels with a 2px halo instead of a border, 12px corners
    card: {
      border: 'transparent',
      shadow: 'var(--m-shadow-md)',
      hoverShadow: 'var(--m-shadow-lg)',
      hoverBorder: 'transparent',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-3)', md: 'var(--m-space-5)', lg: 'var(--m-space-8)' },
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-semibold)',
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    input: {
      radius: '8px',
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-accent-default)',
    },
    field: {
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-medium)',
      hintFontSize: 'var(--m-font-size-sm)',
    },
    checkbox: { size: '1rem', radius: '4px' },
    // A small system-style switch, blue when on
    switch: {
      width: '2.25rem',
      height: '1.375rem',
      smWidth: '1.75rem',
      smHeight: '1rem',
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
    },
    // Lists sit in a rounded white panel: no header fill, sentence-case labels, faint hover rows
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: 'var(--m-space-3)',
      cellPaddingY: 'calc(0.625rem * var(--m-density))',
      borderColor: 'var(--m-color-border-muted)',
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-medium)',
      headerTransform: 'none',
      headerTracking: '0',
      rowHoverBg: { light: 'rgb(0 0 0 / 0.035)', dark: 'rgb(255 255 255 / 0.04)' },
      stripeBg: 'var(--m-color-bg-sunken)',
      wrapBorder: 'transparent',
      wrapRadius: '12px',
      wrapShadow: 'var(--m-shadow-md)',
    },
    // The vertical tab strip: no edge, on the frame colour; rows 36px with 10px corners; the current
    // row is a white tile (add the glow, --m-shadow-lg, on the current link)
    sidebar: {
      width: '15.25rem',
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      padding: 'var(--m-space-2)',
      sectionGap: 'var(--m-space-4)',
      itemGap: '2px',
      fontSize: 'var(--m-font-size-md)',
      heading: {
        fg: 'var(--m-color-accent-text)',
        size: '0.71875rem',
        weight: 'var(--m-font-weight-semibold)',
        transform: 'none',
        tracking: '0.01em',
      },
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: 'rgb(0 0 0 / 0.06)', dark: 'rgb(255 255 255 / 0.07)' },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: '#fbfbff', dark: '#35345e' },
        activeWeight: 'var(--m-font-weight-medium)',
        radius: '10px',
        paddingX: '0.625rem',
        paddingY: 'calc(0.5rem * var(--m-density))',
      },
      count: { bg: 'transparent', fg: 'var(--m-color-fg-subtle)' },
    },
    // The public site's header: on the band, heavy display links in small rounded hit areas
    navbar: {
      height: 'calc(4rem * var(--m-density))',
      paddingX: 'clamp(1rem, 6vw, 5.5rem)',
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      brandFamily: 'var(--m-font-family-display)',
      brandWeight: 'var(--m-font-weight-bold)',
      link: {
        height: '2.25rem',
        paddingX: '0.625rem',
        radius: '8px',
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-semibold)',
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: 'rgb(0 0 0 / 0.05)', dark: 'rgb(255 255 255 / 0.07)' },
        activeFg: 'var(--m-color-accent-text)',
        activeBg: 'transparent',
      },
    },
    // Settings-style tabs: a grey tile behind the current one; underline tabs in the blue
    tabs: {
      fontWeight: 'var(--m-font-weight-medium)',
      pill: {
        listBg: { light: 'rgb(0 0 0 / 0.05)', dark: 'rgb(255 255 255 / 0.06)' },
        listRadius: '10px',
        listPadding: '3px',
        radius: '8px',
        activeBg: { light: '#ffffff', dark: '#3a3a42' },
        activeShadow: 'var(--m-shadow-sm)',
      },
    },
    breadcrumb: { separator: '"›"', currentWeight: 'var(--m-font-weight-medium)' },
    pagination: {
      radius: '8px',
      fg: 'var(--m-color-fg-muted)',
      hoverBg: { light: 'rgb(0 0 0 / 0.05)', dark: 'rgb(255 255 255 / 0.07)' },
    },
    // Tags: soft tinted pills, semibold
    badge: {
      height: '1.375rem',
      radius: '9999px',
      borderWidth: '0px',
      fontWeight: 'var(--m-font-weight-semibold)',
      neutral: {
        bg: { light: '#ececf0', dark: '#33333c' },
        fg: { light: '#45455a', dark: '#c9c9d4' },
        border: 'transparent',
        solidBg: 'var(--m-color-bg-inverse)',
        solidFg: 'var(--m-color-fg-inverse)',
      },
    },
    avatar: {
      size: { sm: '1.5rem', md: '2rem', lg: '2.75rem' },
      bg: 'var(--m-color-accent-subtle)',
      fg: 'var(--m-color-accent-text)',
      groupOverlap: '-0.375rem',
    },
    // Tinted callouts, like the tinted groups: no border, no stripe
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '12px',
      padding: 'var(--m-space-3) var(--m-space-4)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    toast: {
      border: 'transparent',
      accentWidth: '0px',
      radius: '12px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-3) var(--m-space-4)',
    },
    // The window: 16px corners, the long soft drop, display title
    dialog: {
      border: 'transparent',
      radius: '16px',
      padding: 'var(--m-space-6)',
      titleFamily: 'var(--m-font-heading-family)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    // The command bar: white, 12px corners, rows 44px; the highlighted row fills with the blue
    popover: {
      border: 'transparent',
      radius: '12px',
      shadow: 'var(--m-shadow-overlay)',
      padding: '6px',
      item: {
        height: '2.75rem',
        paddingX: 'var(--m-space-3)',
        gap: 'var(--m-space-3)',
        radius: '8px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: 'var(--m-color-accent-default)',
        hoverFg: 'var(--m-color-accent-fg)',
      },
      separator: 'var(--m-color-border-default)',
    },
    // A near-black tag pill
    tooltip: {
      radius: '9999px',
      paddingX: '0.625rem',
      paddingY: '0.25rem',
      shadow: 'none',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
      delay: '300ms',
    },
    progress: {
      height: { sm: '0.25rem', md: '0.375rem', lg: '0.5rem' },
      track: { light: 'rgb(0 0 0 / 0.07)', dark: 'rgb(255 255 255 / 0.1)' },
      fill: 'var(--m-color-accent-text)',
    },
    usage: {
      height: '0.375rem',
      track: { light: 'rgb(0 0 0 / 0.07)', dark: 'rgb(255 255 255 / 0.1)' },
      okFill: 'var(--m-color-accent-text)',
    },
    skeleton: {
      bg: { light: 'rgb(0 0 0 / 0.05)', dark: 'rgb(255 255 255 / 0.06)' },
      highlight: { light: 'rgb(0 0 0 / 0.02)', dark: 'rgb(255 255 255 / 0.1)' },
      radius: '6px',
      blockRadius: '12px',
    },
    spinner: { thickness: '2px' },
    // Keycaps: a white cap on a grey 2px base
    kbd: {
      fontFamily: 'var(--m-font-body-family)',
      fontWeight: 'var(--m-font-weight-medium)',
      bg: { light: '#ffffff', dark: '#2f2f36' },
      border: 'var(--m-color-border-default)',
      radius: '5px',
      shadow: { light: '0 2px 0 #d2d2d2', dark: '0 2px 0 #111114' },
      paddingX: '0.375rem',
    },
    code: { radius: '10px', inlineRadius: '5px', border: 'transparent', inlineBorder: 'transparent' },
    // Questions are hairline rows with a chevron: no fill
    accordion: {
      radius: '0',
      bg: 'transparent',
      paddingX: '0',
      paddingY: 'var(--m-space-5)',
      summarySize: 'var(--m-font-size-xl)',
      summaryWeight: 'var(--m-font-weight-regular)',
      hoverBg: 'transparent',
    },
    prose: { maxWidth: '64ch', lineHeight: '1.5', fontSize: 'var(--m-font-size-lg)' },
    chat: {
      radius: '16px',
      userBg: 'var(--m-color-accent-default)',
      userFg: '#ffffff',
      userBorder: 'var(--m-color-accent-default)',
      assistantBorder: 'transparent',
      assistantBg: 'var(--m-color-bg-sunken)',
      avatarBg: 'var(--m-color-accent-subtle)',
      avatarFg: 'var(--m-color-accent-text)',
    },
    composer: { radius: '12px', shadow: 'var(--m-shadow-lg)' },
    citation: { chipRadius: '9999px' },
    toolCall: { radius: '10px', border: 'transparent', bg: 'var(--m-color-bg-sunken)' },
  },
});
