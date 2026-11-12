import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

// The reference's own warm grey ramp, by step (light end to dark end)
const g = {
  50: '#faf9f5',
  100: '#f5f4ed',
  150: '#f0eee6',
  200: '#e8e6dc',
  250: '#dedcd1',
  300: '#d1cfc5',
  350: '#c2c0b6',
  450: '#9c9a92',
  500: '#87867f',
  550: '#73726c',
  600: '#5e5d59',
  650: '#4d4c48',
  700: '#3d3d3a',
  750: '#30302e',
  800: '#262624',
  850: '#1f1e1d',
  900: '#1a1918',
  950: '#141413',
};
// The switch and tip blue, used for controls that are "on"
const blue = '#2c84db';

/**
 * Ochre: a warm, editorial assistant interface. Ink on an ivory page, a ramp of warm greys, serif
 * headings and reading text over a clean sans for the interface, ink actions with 8px corners, a
 * clay brand colour for the send button and brand moments, a blue for switches, and a warm
 * near-black dark mode. Category: editorial. The values are measured, not invented (see DESIGN.md).
 */
export const ochre = extendTheme(minimal, {
  name: 'ochre',
  label: 'Ochre',
  description:
    'Warm and editorial: ink on ivory, warm greys, serif headings and reading text, ink actions, a clay brand colour and a warm near-black dark mode.',
  tokens: {
    color: {
      bg: {
        // The ivory page; cards and the composer are white; the sidebar and wells one step warmer
        canvas: { light: g[50], dark: g[850] },
        surface: { light: '#ffffff', dark: g[800] },
        raised: { light: '#ffffff', dark: g[750] },
        sunken: { light: g[100], dark: g[900] },
        overlay: { light: 'rgb(20 20 19 / 0.4)', dark: 'rgb(0 0 0 / 0.6)' },
        inverse: { light: g[950], dark: g[50] },
      },
      fg: {
        default: { light: g[950], dark: g[50] },
        muted: { light: g[600], dark: g[350] },
        subtle: { light: g[550], dark: g[450] },
        inverse: { light: g[50], dark: g[950] },
      },
      border: {
        // Hairlines in the warm greys
        default: { light: g[250], dark: g[700] },
        muted: { light: g[150], dark: g[750] },
        // Controls: the ramp's first step that meets 3:1 (the reference draws inputs with the hairline)
        strong: { light: g[500], dark: '#75746e' },
        // The reference's published focus colour, a darker clay
        focus: { light: '#c46849', dark: '#d97757' },
      },
      // The action colour is ink (ivory in dark mode): primary buttons, checked boxes, current tabs
      accent: {
        default: { light: g[950], dark: g[50] },
        hover: { light: g[750], dark: g[200] },
        active: { light: g[700], dark: g[300] },
        // The current row: the nav item, the selected menu row, the segment
        subtle: { light: g[150], dark: g[700] },
        fg: { light: g[50], dark: g[950] },
        text: { light: g[950], dark: g[50] },
      },
      // The clay: the send button, the brand tile, brand panels. Darkened a step so white meets 4.5:1
      brand: {
        default: { light: '#b95839', dark: '#b45a3e' },
        fg: '#ffffff',
        subtle: { light: '#ebc9b7', dark: '#3d2a22' },
      },
      success: {
        bg: { light: '#eaeee2', dark: '#232b1d' },
        fg: { light: '#4c6535', dark: '#a9bd8e' },
        border: { light: '#cdd7bd', dark: '#3a4a2c' },
        solid: { light: '#5a7a3e', dark: '#788c5d' },
        onSolid: { light: '#ffffff', dark: g[950] },
      },
      warning: {
        bg: { light: '#f7ecd9', dark: '#33281a' },
        fg: { light: '#86561a', dark: '#e3b871' },
        border: { light: '#e9d2a8', dark: '#55432a' },
        solid: { light: '#c98a2b', dark: '#d39a42' },
        onSolid: { light: g[950], dark: g[950] },
      },
      // The reference's published error red
      danger: {
        bg: { light: '#f8e6e2', dark: '#3a201d' },
        fg: { light: '#a8433a', dark: '#ec9a91' },
        border: { light: '#eec5bf', dark: '#5e2f2a' },
        solid: { light: '#bf4d43', dark: '#bb4b40' },
        onSolid: '#ffffff',
      },
      // The switch blue
      info: {
        bg: { light: '#e6f0fb', dark: '#1b2a3b' },
        fg: { light: '#1f64ad', dark: '#8fc0f2' },
        border: { light: '#c3dbf5', dark: '#28466a' },
        // A step darker than the switch blue so white text meets 4.5:1
        solid: { light: '#2672cc', dark: '#2672cc' },
        onSolid: '#ffffff',
      },
      selection: {
        bg: { light: '#cde2fb', dark: '#28466a' },
        fg: { light: g[950], dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // A clean grotesque for the interface; the reference's own sans is proprietary
        sans: '"Instrument Sans Variable", "Instrument Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        // A text serif for headings and reading; the reference's own serif is proprietary
        serif: '"Source Serif 4 Variable", "Source Serif 4", Georgia, "Iowan Old Style", ui-serif, serif',
        display: 'var(--m-font-family-serif)',
        mono: '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.0625rem',
        xl: '1.25rem',
        '2xl': '1.75rem',
        '3xl': '2.25rem',
        '4xl': '3.25rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.1', normal: '1.5', relaxed: '1.6' },
      tracking: { tight: '-0.01em', normal: '0', wide: '0.04em' },
      body: { weight: '400' },
      heading: { weight: '500', tracking: '-0.01em' },
    },
    control: {
      height: {
        sm: 'calc(1.75rem * var(--m-density))',
        md: 'calc(2.25rem * var(--m-density))',
        lg: 'calc(2.75rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.25rem * var(--m-density))',
      },
      fontSize: '0.875rem',
    },
    // 4px badges, 8px controls and rows, 12px segments and menus, 16px cards, dialogs and the composer
    radius: { sm: '4px', md: '8px', lg: '12px', control: '8px', container: '16px' },
    shadow: {
      sm: { light: '0 2px 8px rgb(0 0 0 / 0.04)', dark: '0 2px 8px rgb(0 0 0 / 0.25)' },
      md: { light: '0 4px 20px rgb(0 0 0 / 0.04)', dark: '0 4px 20px rgb(0 0 0 / 0.3)' },
      lg: { light: '0 4px 16px rgb(0 0 0 / 0.1)', dark: '0 4px 16px rgb(0 0 0 / 0.45)' },
      overlay: {
        light: '0 0 0 1px rgb(31 30 29 / 0.08), 0 4px 16px rgb(0 0 0 / 0.1)',
        dark: '0 0 0 1px rgb(222 220 209 / 0.1), 0 12px 32px rgb(0 0 0 / 0.5)',
      },
    },
    focus: { offset: '2px' },
    motion: {
      duration: { fast: '150ms', normal: '250ms', slow: '400ms' },
      easing: { standard: 'cubic-bezier(0.165, 0.84, 0.44, 1)', emphasized: 'cubic-bezier(0.19, 1, 0.22, 1)' },
    },
  },
  components: {
    // A 288px sidebar beside a narrow reading column; settings and lists up to 48rem
    layout: {
      containerMax: { sm: '30rem', md: '48rem', lg: '72rem' },
      containerPadding: 'clamp(1rem, 4vw, 2rem)',
      gridGap: 'var(--m-space-4)',
      splitSide: '18rem',
    },
    // Ink for the one that matters, an outlined ivory button for the rest, a quiet fill on hover
    button: {
      fontWeight: 'var(--m-font-weight-medium)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      primary: { border: 'transparent' },
      secondary: {
        bg: 'transparent',
        fg: 'var(--m-color-fg-default)',
        border: { light: g[300], dark: g[650] },
        hoverBg: { light: g[150], dark: g[750] },
        activeBg: { light: g[200], dark: g[700] },
      },
      ghost: {
        fg: 'var(--m-color-fg-default)',
        hoverBg: { light: g[150], dark: g[750] },
        activeBg: { light: g[200], dark: g[700] },
      },
      danger: { border: 'transparent' },
    },
    // White cards with a pale hairline, no shadow; they don't move on hover
    card: {
      border: 'var(--m-color-border-muted)',
      shadow: 'none',
      hoverShadow: 'var(--m-shadow-md)',
      hoverBorder: 'var(--m-color-border-default)',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-6)', lg: 'var(--m-space-8)' },
      titleFamily: 'var(--m-font-family-serif)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    input: {
      bg: { light: '#ffffff', dark: g[800] },
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-border-focus)',
      placeholder: 'var(--m-color-fg-subtle)',
    },
    field: {
      labelFontWeight: 'var(--m-font-weight-medium)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    // Checked boxes are ink; switches are the reference's blue
    checkbox: { size: '1rem', radius: '4px' },
    switch: {
      width: '2.25rem',
      height: '1.25rem',
      smWidth: '1.875rem',
      smHeight: '1.0625rem',
      trackBg: 'var(--m-color-border-strong)',
      trackCheckedBg: { light: blue, dark: blue },
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbShadow: 'none',
    },
    // Tables in answers and lists: no frame, no header fill, sentence-case headers, hairline rows
    table: {
      bg: 'transparent',
      fontSize: 'var(--m-font-size-sm)',
      cellPaddingX: 'var(--m-space-3)',
      cellPaddingY: 'calc(0.625rem * var(--m-density))',
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-medium)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      rowHoverBg: 'var(--m-color-bg-sunken)',
      stripeBg: 'var(--m-color-bg-sunken)',
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    // The left rail: one step warmer than the page, ink rows, the current one on the neutral fill
    sidebar: {
      width: '18rem',
      bg: { light: g[100], dark: g[800] },
      border: 'var(--m-color-border-default)',
      padding: 'var(--m-space-2)',
      sectionGap: 'var(--m-space-5)',
      itemGap: '2px',
      fontSize: 'var(--m-font-size-sm)',
      heading: {
        fg: 'var(--m-color-fg-muted)',
        size: 'var(--m-font-size-xs)',
        weight: 'var(--m-font-weight-regular)',
        transform: 'none',
        tracking: '0.01em',
      },
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: g[150], dark: g[750] },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: g[200], dark: g[700] },
        activeWeight: 'var(--m-font-weight-regular)',
        radius: '8px',
        paddingX: 'var(--m-space-2)',
        paddingY: 'calc(0.375rem * var(--m-density))',
      },
      count: { bg: 'transparent', fg: 'var(--m-color-fg-muted)' },
    },
    // The public site's header: on the page colour, a hairline under it, quiet links, ink action
    navbar: {
      height: 'calc(5.25rem * var(--m-density))',
      paddingX: 'clamp(1rem, 4.5vw, 4rem)',
      bg: 'var(--m-color-bg-canvas)',
      border: 'var(--m-color-border-muted)',
      brandFamily: 'var(--m-font-family-serif)',
      brandSize: 'var(--m-font-size-2xl)',
      brandWeight: 'var(--m-font-weight-medium)',
      link: {
        fontSize: '0.9375rem',
        fontWeight: 'var(--m-font-weight-regular)',
        fg: { light: g[750], dark: g[350] },
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
      },
    },
    // Segments: white on a warm track with 12px corners; underline tabs in ink
    tabs: {
      fontWeight: 'var(--m-font-weight-regular)',
      fg: 'var(--m-color-fg-muted)',
      pill: {
        listBg: { light: g[150], dark: g[900] },
        listRadius: '16px',
        listPadding: '4px',
        radius: '12px',
        activeBg: { light: '#ffffff', dark: g[750] },
        activeShadow: 'none',
      },
    },
    breadcrumb: { separator: '"/"', currentWeight: 'var(--m-font-weight-regular)' },
    pagination: {
      fontWeight: 'var(--m-font-weight-regular)',
      currentBg: 'var(--m-color-accent-subtle)',
      currentFg: 'var(--m-color-fg-default)',
      currentBorder: 'transparent',
      hoverBg: { light: g[150], dark: g[750] },
    },
    // Small square-cornered tags: ivory with a hairline ("New"), or the warm fill ("Beta")
    badge: {
      height: '1.375rem',
      paddingX: '6px',
      radius: '4px',
      fontWeight: 'var(--m-font-weight-medium)',
      neutral: {
        bg: { light: g[50], dark: g[750] },
        fg: { light: g[950], dark: g[350] },
        border: { light: g[250], dark: g[650] },
        solidBg: { light: g[200], dark: g[700] },
        solidFg: { light: g[950], dark: g[50] },
      },
    },
    avatar: {
      size: { sm: '1.5rem', md: '2rem', lg: '2.5rem' },
      bg: { light: g[700], dark: g[300] },
      fg: { light: g[50], dark: g[950] },
      fontWeight: 'var(--m-font-weight-medium)',
    },
    // Notices: a tinted panel with a hairline in the tone, 12px corners, no side stripe
    alert: {
      accentWidth: '0px',
      radius: '12px',
      padding: 'var(--m-space-3) var(--m-space-4)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    toast: {
      border: 'var(--m-color-border-default)',
      accentWidth: 'var(--m-border-width-thin)',
      radius: '12px',
      shadow: 'var(--m-shadow-lg)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    // Dialogs on the page colour, 16px corners, a sans title
    dialog: {
      bg: { light: g[50], dark: g[800] },
      border: 'var(--m-color-border-muted)',
      radius: '16px',
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    popover: {
      border: 'var(--m-color-border-default)',
      radius: '12px',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-1)',
      item: {
        height: '2rem',
        radius: '8px',
        fontSize: 'var(--m-font-size-sm)',
        hoverBg: { light: g[150], dark: g[700] },
      },
      separator: 'var(--m-color-border-muted)',
    },
    tooltip: {
      radius: '8px',
      shadow: 'none',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-regular)',
      delay: '300ms',
    },
    progress: {
      height: { sm: '0.25rem', md: '0.5rem', lg: '0.625rem' },
      track: { light: g[200], dark: g[750] },
      fill: { light: '#2a79d7', dark: blue },
    },
    usage: {
      height: '0.5rem',
      track: { light: g[200], dark: g[750] },
      okFill: { light: '#2a79d7', dark: blue },
    },
    skeleton: {
      bg: { light: g[150], dark: g[750] },
      highlight: { light: g[50], dark: g[700] },
      radius: '6px',
    },
    spinner: { thickness: '2px', color: 'var(--m-color-brand-default)' },
    kbd: {
      fontFamily: 'var(--m-font-family-sans)',
      fontWeight: 'var(--m-font-weight-regular)',
      bg: { light: g[150], dark: g[750] },
      border: 'transparent',
      radius: '4px',
      shadow: 'none',
    },
    code: {
      radius: '12px',
      bg: { light: g[100], dark: g[900] },
      border: 'var(--m-color-border-muted)',
      inlineBg: { light: g[150], dark: g[750] },
      inlineBorder: 'transparent',
      inlineRadius: '4px',
      keyword: { light: '#a8433a', dark: '#ec9a91' },
      comment: 'var(--m-color-fg-muted)',
    },
    // Questions on hairlines, no fill: the reference's FAQ
    accordion: {
      bg: 'transparent',
      radius: '0',
      paddingX: '0',
      paddingY: 'var(--m-space-5)',
      summarySize: 'var(--m-font-size-lg)',
      summaryWeight: 'var(--m-font-weight-regular)',
      hoverBg: 'transparent',
    },
    // Reading text: links in ink, underlined
    prose: {
      maxWidth: '42rem',
      fontSize: 'var(--m-font-size-lg)',
      lineHeight: '1.6',
      linkFg: 'var(--m-color-fg-default)',
      tableHeaderBg: 'transparent',
      quoteBorder: 'var(--m-color-border-default)',
    },
    // The conversation: your turns on the warm fill, its answers straight on the page
    chat: {
      maxWidth: '42rem',
      radius: '16px',
      userBg: { light: g[150], dark: g[950] },
      userFg: 'var(--m-color-fg-default)',
      userBorder: 'transparent',
      assistantBg: 'var(--m-color-bg-canvas)',
      assistantBorder: 'transparent',
      avatarBg: { light: g[700], dark: g[300] },
      avatarFg: { light: g[50], dark: g[950] },
      assistantAvatarBg: 'var(--m-color-brand-default)',
      assistantAvatarFg: 'var(--m-color-brand-fg)',
      caretColor: 'var(--m-color-brand-default)',
    },
    // A white box with soft corners and a soft lift; send is a clay square
    composer: {
      bg: { light: '#ffffff', dark: g[750] },
      radius: '20px',
      shadow: 'var(--m-shadow-md)',
      padding: 'var(--m-space-3) var(--m-space-4)',
      focusBorder: 'var(--m-color-fg-subtle)',
      streamingColor: 'var(--m-color-brand-default)',
    },
    thinking: { summaryWeight: 'var(--m-font-weight-regular)', ruleWidth: 'var(--m-border-width-thin)' },
    citation: {
      chipBg: { light: g[150], dark: g[700] },
      chipFg: 'var(--m-color-fg-default)',
      chipHoverBg: 'var(--m-color-accent-default)',
      chipHoverFg: 'var(--m-color-accent-fg)',
      chipRadius: '4px',
      sourceRadius: '12px',
    },
    toolCall: { radius: '12px', nameFamily: 'var(--m-font-family-sans)' },
  },
});
