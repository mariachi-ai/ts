import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Doodle: a playful multiplayer canvas tool. Clean white chrome with compact 11–13px type, filled
 * grey inputs, 5px corners and a bright blue selection; floating panels with 13px corners and soft
 * elevation; near-black menus and tooltips; a violet brand for the whiteboard side, with bright
 * sticky-note tints, colourful stamps and cursor name tags. Category: playful. The colours are the
 * reference's own published theme tokens (light and dark), read as data; sizes are measured off its
 * help-centre screenshots and public site (see DESIGN.md).
 */

// The published light and dark neutrals
const n = {
  white: '#ffffff',
  secondary: '#f5f5f5', // bg-secondary, bg-hover
  tertiary: '#e6e6e6', // bg-tertiary, border
  ink: '#1a1a1a', // text: black at 90%, flattened on white
  menu: '#1e1e1e', // menus, tooltips and the visual bell
  d1: '#2c2c2c', // dark bg
  d2: '#383838', // dark bg-secondary
  d3: '#444444', // dark bg-tertiary, border
};

// Elevation: a half-pixel ring plus soft drops (estimated from the floating toolbars and menus)
const ring = { light: '0 0 0.5px rgb(0 0 0 / 0.18)', dark: '0 0 0 0.5px rgb(255 255 255 / 0.1)' };
const elevation = (light: string, dark: string) => ({ light: `${ring.light}, ${light}`, dark: `${ring.dark}, ${dark}` });

export const doodle = extendTheme(minimal, {
  name: 'doodle',
  label: 'Doodle',
  description:
    'Playful and compact: white chrome, 11–13px type, filled grey inputs, a bright blue selection, near-black menus, a violet brand and bright sticky-note colours.',
  tokens: {
    color: {
      bg: {
        // The chrome is white; the dark theme's panels are #2c2c2c
        canvas: { light: n.white, dark: n.d1 },
        surface: { light: n.white, dark: n.d1 },
        raised: { light: n.white, dark: n.d2 },
        // bg-secondary: filled inputs, hover fills, the board under the stickies
        sunken: { light: n.secondary, dark: n.d2 },
        overlay: { light: 'rgb(0 0 0 / 0.3)', dark: 'rgb(0 0 0 / 0.5)' },
        // bg-inverse: tooltips
        inverse: { light: n.menu, dark: n.white },
      },
      fg: {
        default: { light: n.ink, dark: '#ffffff' },
        // text-secondary is black at 50% (3.9:1); these are the nearest steps that reach 4.5:1
        muted: { light: '#666666', dark: '#c0c0c0' },
        subtle: { light: '#707070', dark: '#a1a1a1' },
        inverse: { light: '#ffffff', dark: n.ink },
      },
      border: {
        default: { light: n.tertiary, dark: n.d3 },
        muted: { light: '#f0f0f0', dark: n.d2 },
        // Control borders: the reference's controls are filled with no outline; this is the nearest
        // grey that reaches the library's 3:1 floor on the fill and the page
        strong: { light: '#8a8a8a', dark: '#8c8c8c' },
        // border-selected (#0d99ff): the bright blue, one hair darker to reach 3:1 on the grey fill
        focus: { light: '#0090fa', dark: '#0c8ce9' },
      },
      accent: {
        // bg-brand is #0d99ff (white text 3:1); the action blue is the nearest step of the same hue
        // that carries white text at 4.5:1. Hover and pressed are the published brand-secondary steps
        default: { light: '#0079d2', dark: '#0a7acb' },
        hover: { light: '#0768cf', dark: '#0a6dc2' },
        active: { light: '#0a5cb5', dark: '#105cad' },
        // bg-selected: the pale blue under the current row and selected tiles
        subtle: { light: '#e5f4ff', dark: '#394360' },
        fg: '#ffffff',
        // text-brand #007be5, one step darker to reach 4.5:1 on the pale blue
        text: { light: '#006ece', dark: '#7cc4f8' },
      },
      // The whiteboard's brand: its violet (share button, current tool, brand panels)
      brand: {
        default: { light: '#9747ff', dark: '#8a38f5' },
        fg: '#ffffff',
        // The sticky-note violet (published brand-tertiary is #f1e5ff)
        subtle: { light: '#d9b8ff', dark: '#473956' },
      },
      success: {
        bg: { light: '#cff7d3', dark: '#0a4c2d' },
        fg: { light: '#007c42', dark: '#79d297' },
        // The sticky-note green (published border-success is #aff4c6)
        border: { light: '#85e0a3', dark: '#0a5c35' },
        solid: { light: '#008043', dark: '#008043' },
        onSolid: '#ffffff',
      },
      warning: {
        bg: { light: '#fff1c2', dark: '#3d3014' },
        fg: { light: '#a85900', dark: '#f7d15f' },
        // The sticky-note yellow (published border-warning is #ffe8a3)
        border: { light: '#ffd966', dark: '#925711' },
        solid: { light: '#ffcd29', dark: '#f3c11b' },
        onSolid: n.ink,
      },
      danger: {
        bg: { light: '#ffe2e0', dark: '#7c2622' },
        fg: { light: '#c62f10', dark: '#fca397' },
        // The sticky-note red (published border-danger is #ffc7c2)
        border: { light: '#ffafa3', dark: '#963323' },
        solid: { light: '#d4310f', dark: '#c4381c' },
        onSolid: '#ffffff',
      },
      // No info colour of its own: the selection blue
      info: {
        bg: { light: '#e5f4ff', dark: '#394360' },
        fg: { light: '#006ece', dark: '#7cc4f8' },
        // The sticky-note blue (published border-brand is #bde3ff)
        border: { light: '#80caff', dark: '#105cad' },
        solid: { light: '#0079d2', dark: '#0a7acb' },
        onSolid: '#ffffff',
      },
      selection: {
        bg: { light: '#bde3ff', dark: '#536383' },
        fg: { light: n.ink, dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // The app's own UI face is Inter (open), at the variable font's 450 and 550 steps
        sans: '"Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        // The public site's proprietary grotesque; Inter Tight is the closest open face
        display: '"Inter Tight", "Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif',
        mono: '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      // 11px panels and controls, 13px file lists and body, 15px and 24px headings, the site's 32/56px
      size: {
        xs: '11px',
        sm: '12px',
        md: '13px',
        lg: '15px',
        xl: '18px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '56px',
      },
      weight: { regular: '450', medium: '500', semibold: '550', bold: '650' },
      leading: { tight: '1.2', normal: '1.45', relaxed: '1.6' },
      tracking: { tight: '-0.02em', normal: '0.005em', wide: '0.04em' },
      body: { weight: '450' },
      heading: {
        family: '"Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        weight: '550',
        tracking: '-0.005em',
      },
    },
    control: {
      // 24px panel controls, 32px in the file browser, 40px on the site
      height: {
        sm: 'calc(24px * var(--m-density))',
        md: 'calc(32px * var(--m-density))',
        lg: 'calc(40px * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(8px * var(--m-density))',
        md: 'calc(12px * var(--m-density))',
        lg: 'calc(20px * var(--m-density))',
      },
      fontSize: '11px',
    },
    // 2px small parts, 5px controls and cards, 13px floating panels, menus and dialogs
    radius: { sm: '2px', md: '5px', lg: '13px', control: '5px', container: '5px' },
    shadow: {
      sm: elevation('0 1px 3px rgb(0 0 0 / 0.1)', '0 1px 3px rgb(0 0 0 / 0.35)'),
      md: elevation('0 3px 8px rgb(0 0 0 / 0.1), 0 1px 3px rgb(0 0 0 / 0.1)', '0 3px 8px rgb(0 0 0 / 0.35)'),
      lg: elevation('0 5px 12px rgb(0 0 0 / 0.13), 0 1px 3px rgb(0 0 0 / 0.1)', '0 5px 12px rgb(0 0 0 / 0.45)'),
      overlay: elevation(
        '0 10px 16px rgb(0 0 0 / 0.12), 0 2px 5px rgb(0 0 0 / 0.15)',
        '0 10px 24px rgb(0 0 0 / 0.5), 0 2px 5px rgb(0 0 0 / 0.35)',
      ),
    },
    // A 4px unit, in px: the page's root size is the 13px body size, so rem would shrink the scale
    space: { unit: '4px' },
    focus: { width: '2px', offset: '0px' },
    motion: {
      duration: { fast: '100ms', normal: '150ms', slow: '300ms' },
      easing: { standard: 'cubic-bezier(0.4, 0, 0.2, 1)', emphasized: 'cubic-bezier(0.2, 1.4, 0.4, 1)' },
    },
  },
  components: {
    // A 240px sidebar beside the main area; content has a 32px margin
    layout: {
      containerMax: { sm: '480px', md: '768px', lg: '1280px' },
      containerPadding: 'clamp(16px, 4vw, 32px)',
      gridGap: 'var(--m-space-4)',
      gridMin: '208px',
      splitSide: '240px',
      splitGap: '0',
    },
    // Buttons: 5px corners, 11px at 550; the blue for the main action, white with a hairline for the
    // rest, flat for icons; destructive is a solid red
    button: {
      fontSize: 'var(--m-control-font-size)',
      fontWeight: 'var(--m-font-weight-semibold)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      hoverTransform: 'none',
      activeTransform: 'none',
      disabledOpacity: '0.4',
      gap: 'var(--m-space-1)',
      secondary: {
        bg: 'var(--m-color-bg-surface)',
        fg: 'var(--m-color-fg-default)',
        border: 'var(--m-color-border-default)',
        hoverBg: { light: n.secondary, dark: n.d2 },
        activeBg: { light: n.tertiary, dark: n.d3 },
      },
      ghost: {
        fg: 'var(--m-color-fg-default)',
        hoverBg: { light: n.secondary, dark: n.d2 },
        activeBg: { light: n.tertiary, dark: n.d3 },
      },
      danger: {
        bg: 'var(--m-color-danger-solid)',
        fg: '#ffffff',
        border: 'transparent',
        hoverBg: { light: '#bd2915', dark: '#963323' },
        activeBg: { light: '#a8240f', dark: '#86291d' },
      },
    },
    // Inputs are filled with the secondary grey; the outline turns blue on focus
    input: {
      bg: { light: n.secondary, dark: n.d2 },
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: '#6b6b6b', dark: '#a8a8a8' },
      focusBorder: 'var(--m-color-border-focus)',
      invalidBorder: 'var(--m-color-danger-solid)',
      shadow: 'none',
      paddingX: {
        sm: 'calc(8px * var(--m-density))',
        md: 'calc(10px * var(--m-density))',
        lg: 'calc(12px * var(--m-density))',
      },
    },
    select: { bg: { light: n.secondary, dark: n.d2 }, chevronSize: '4px' },
    field: {
      gap: '6px',
      labelFontSize: 'var(--m-font-size-xs)',
      labelFontWeight: 'var(--m-font-weight-semibold)',
      hintFg: 'var(--m-color-fg-subtle)',
      hintFontSize: 'var(--m-font-size-xs)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    // 14px boxes with an ink outline and 2px corners; checked fills with the bright blue
    checkbox: {
      size: '14px',
      radius: '2px',
      borderWidth: '1px',
      border: 'var(--m-color-fg-default)',
      hoverBorder: 'var(--m-color-fg-default)',
      checkedBg: 'var(--m-color-border-focus)',
      checkedBorder: 'var(--m-color-border-focus)',
      mark: '#ffffff',
    },
    radio: {
      size: '14px',
      borderWidth: '1px',
      border: 'var(--m-color-fg-default)',
      hoverBorder: 'var(--m-color-fg-default)',
      checkedBg: 'var(--m-color-border-focus)',
      checkedBorder: 'var(--m-color-border-focus)',
      dot: '#ffffff',
    },
    // The small toggle: 24 × 14, grey off, blue on
    switch: {
      width: '24px',
      height: '14px',
      smWidth: '20px',
      smHeight: '12px',
      thumbInset: '2px',
      trackBg: { light: '#8a8a8a', dark: '#8c8c8c' },
      trackCheckedBg: 'var(--m-color-border-focus)',
      thumbBg: '#ffffff',
      thumbShadow: 'none',
    },
    // File cards: white, a hairline, 5px corners, no shadow; hovering frames them in grey
    card: {
      border: 'var(--m-color-border-default)',
      shadow: 'none',
      hoverShadow: 'none',
      hoverBorder: { light: '#c4c4c4', dark: '#5c5c5c' },
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-3)', md: 'var(--m-space-4)', lg: 'var(--m-space-6)' },
      titleSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
      descriptionFg: 'var(--m-color-fg-subtle)',
      descriptionSize: 'var(--m-font-size-sm)',
      outline: { bg: 'transparent', border: 'var(--m-color-border-default)' },
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    // The list view: 11px grey headers, 13px rows, hairlines, a grey hover and no frame
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: '12px',
      cellPaddingY: '8px',
      headerBg: 'var(--m-color-bg-surface)',
      headerFg: 'var(--m-color-fg-subtle)',
      headerFontSize: 'var(--m-font-size-xs)',
      headerFontWeight: 'var(--m-font-weight-regular)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      rowHoverBg: { light: n.secondary, dark: n.d2 },
      stripeBg: 'var(--m-color-bg-surface)',
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    // The file browser's sidebar: 240px, white, a hairline edge, 13px full-width rows; the current
    // one is the pale selection blue
    sidebar: {
      width: '240px',
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-default)',
      padding: '0',
      sectionGap: 'var(--m-space-2)',
      itemGap: '0px',
      fontSize: 'var(--m-font-size-md)',
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: n.secondary, dark: n.d2 },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'var(--m-color-accent-subtle)',
        activeWeight: 'var(--m-font-weight-regular)',
        radius: '0',
        paddingX: '16px',
        paddingY: 'calc(7px * var(--m-density))',
      },
      heading: {
        fg: 'var(--m-color-fg-default)',
        size: 'var(--m-font-size-md)',
        weight: 'var(--m-font-weight-semibold)',
        transform: 'none',
        tracking: '0',
      },
      count: {
        bg: { light: n.secondary, dark: n.d2 },
        fg: 'var(--m-color-fg-muted)',
        radius: '5px',
      },
    },
    // The top bar: 48px, white, a hairline, 13px links in 28px boxes
    navbar: {
      height: 'calc(48px * var(--m-density))',
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-default)',
      brandWeight: 'var(--m-font-weight-semibold)',
      brandSize: 'var(--m-font-size-md)',
      link: {
        height: '28px',
        paddingX: '8px',
        radius: '5px',
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-regular)',
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: n.secondary, dark: n.d2 },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: n.secondary, dark: n.d2 },
      },
    },
    // Tabs are grey pills: the current one gets the secondary fill and the ink colour. Underline tabs
    // (ours) keep the same labels with a 2px ink bar
    tabs: {
      height: '24px',
      paddingX: '8px',
      listGap: 'var(--m-space-1)',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-semibold)',
      fg: 'var(--m-color-fg-subtle)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-fg-default)',
      indicatorWidth: '2px',
      pill: {
        listBg: 'var(--m-color-bg-surface)',
        listRadius: '5px',
        listPadding: '0',
        radius: '5px',
        activeBg: { light: n.secondary, dark: n.d3 },
        activeShadow: 'none',
      },
    },
    pagination: {
      size: '24px',
      radius: '5px',
      fontSize: 'var(--m-font-size-xs)',
      fg: 'var(--m-color-fg-default)',
      hoverBg: { light: n.secondary, dark: n.d2 },
      currentBg: 'var(--m-color-accent-subtle)',
      currentFg: 'var(--m-color-accent-text)',
      currentBorder: 'transparent',
    },
    breadcrumb: {
      separator: '"/"',
      fontSize: 'var(--m-font-size-xs)',
      fg: 'var(--m-color-fg-subtle)',
      hoverFg: 'var(--m-color-fg-default)',
      currentFg: 'var(--m-color-fg-default)',
      currentWeight: 'var(--m-font-weight-semibold)',
    },
    // Labels: 16px tall, 11px, 5px corners, a soft fill and no border
    badge: {
      height: '16px',
      paddingX: '4px',
      gap: '2px',
      radius: '5px',
      borderWidth: '0px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-medium)',
      neutral: {
        bg: { light: n.secondary, dark: n.d3 },
        fg: 'var(--m-color-fg-muted)',
        border: 'transparent',
        solidBg: { light: n.menu, dark: '#ffffff' },
        solidFg: { light: '#ffffff', dark: n.ink },
      },
    },
    // Multiplayer avatars: a round colour with a white initial, ringed in the panel colour
    avatar: {
      size: { sm: '16px', md: '24px', lg: '32px' },
      bg: 'var(--m-color-brand-default)',
      fg: '#ffffff',
      fontWeight: 'var(--m-font-weight-semibold)',
      ringColor: 'var(--m-color-bg-surface)',
      ringWidth: '2px',
      groupOverlap: '-4px',
    },
    // Banners: the tone's pale tertiary fill, no border, 5px corners, ink text with a tone icon
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '5px',
      padding: 'var(--m-space-2) var(--m-space-3)',
      gap: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-xs)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // The visual bell: a near-black bar with white 11px text, 13px corners
    toast: {
      bg: n.menu,
      fg: '#ffffff',
      bodyFg: '#c0c0c0',
      border: { light: n.menu, dark: n.d3 },
      borderWidth: '1px',
      accentWidth: '0px',
      radius: '13px',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-xs)',
      titleWeight: 'var(--m-font-weight-semibold)',
      width: '352px',
    },
    // Modals: white, 13px corners, no border, the high elevation; a 13px semibold title over a hairline
    dialog: {
      bg: 'var(--m-color-bg-surface)',
      border: 'transparent',
      radius: '13px',
      padding: 'var(--m-space-4)',
      gap: 'var(--m-space-4)',
      titleSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
      descriptionFg: 'var(--m-color-fg-muted)',
      width: { sm: '352px', md: '480px', lg: '720px' },
      enterTransform: 'scale(0.98)',
    },
    // Menus are near-black in both themes: white 11px rows, 24px tall, the blue under the pointer
    popover: {
      bg: n.menu,
      fg: '#ffffff',
      border: { light: n.menu, dark: n.d3 },
      radius: '13px',
      shadow: 'var(--m-shadow-lg)',
      padding: '8px',
      minWidth: '192px',
      item: {
        height: '24px',
        paddingX: '8px',
        radius: '5px',
        fontSize: 'var(--m-font-size-xs)',
        fg: '#ffffff',
        hoverBg: 'var(--m-color-accent-default)',
        hoverFg: '#ffffff',
        dangerFg: '#fca397',
      },
      labelFg: '#a1a1a1',
      labelSize: 'var(--m-font-size-xs)',
      shortcutFg: '#a1a1a1',
      separator: n.d3,
    },
    tooltip: {
      radius: '5px',
      shadow: 'var(--m-shadow-sm)',
      paddingX: 'var(--m-space-2)',
      paddingY: 'var(--m-space-1)',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-medium)',
      delay: '500ms',
    },
    progress: {
      height: { sm: '4px', md: '6px', lg: '8px' },
      radius: '9999px',
      track: 'var(--m-color-bg-sunken)',
      fill: 'var(--m-color-border-focus)',
    },
    // The properties panel's collapsible sections: hairlines between, 11px semibold titles
    accordion: {
      radius: '0',
      bg: 'transparent',
      paddingX: 'var(--m-space-4)',
      paddingY: 'var(--m-space-3)',
      summarySize: 'var(--m-font-size-xs)',
      summaryWeight: 'var(--m-font-weight-semibold)',
      hoverBg: 'transparent',
      contentFg: 'var(--m-color-fg-muted)',
    },
    divider: { labelFontSize: 'var(--m-font-size-xs)', labelTransform: 'none' },
    skeleton: {
      bg: { light: n.secondary, dark: n.d2 },
      highlight: { light: n.tertiary, dark: n.d3 },
      radius: '5px',
      duration: '1.6s',
    },
    spinner: { color: 'var(--m-color-border-focus)', track: 'var(--m-color-border-default)', duration: '0.8s' },
    // Shortcuts: plain grey keys, 2px corners
    kbd: {
      fontFamily: 'var(--m-font-family-sans)',
      fontSize: 'var(--m-font-size-xs)',
      bg: { light: n.secondary, dark: n.d3 },
      fg: 'var(--m-color-fg-muted)',
      border: 'transparent',
      radius: '2px',
      shadow: 'none',
      height: '16px',
      paddingX: '4px',
    },
    // Code: the inspect panel's mono on the secondary grey
    code: {
      radius: '5px',
      bg: { light: n.secondary, dark: n.menu },
      border: 'transparent',
      headerBg: 'var(--m-color-bg-surface)',
      inlineBg: { light: n.secondary, dark: n.d3 },
      inlineBorder: 'transparent',
      inlineRadius: '2px',
      fontSize: 'var(--m-font-size-xs)',
      keyword: { light: '#8638e5', dark: '#d1a8ff' },
      string: { light: '#007c42', dark: '#79d297' },
      stringExpression: { light: '#007c42', dark: '#79d297' },
      function: { light: '#006ece', dark: '#7cc4f8' },
      constant: { light: '#a85900', dark: '#f7d15f' },
    },
    prose: {
      fontSize: 'var(--m-font-size-md)',
      linkFg: 'var(--m-color-accent-text)',
      maxWidth: '672px',
      h2Border: 'transparent',
      quoteBorder: 'var(--m-color-brand-default)',
      quoteBorderWidth: '2px',
    },
    // The assistant: your messages in a grey bubble with 13px corners, the replies on the panel
    chat: {
      radius: '13px',
      userBg: { light: n.secondary, dark: n.d2 },
      userBorder: 'transparent',
      assistantBg: 'transparent',
      assistantBorder: 'transparent',
      avatarRadius: '9999px',
      assistantAvatarBg: 'var(--m-color-brand-default)',
      assistantAvatarFg: '#ffffff',
    },
    composer: {
      radius: '13px',
      shadow: 'var(--m-shadow-sm)',
      border: 'var(--m-color-border-strong)',
      focusBorder: 'var(--m-color-border-focus)',
    },
    citation: { chipRadius: '5px' },
    toolCall: { radius: '5px', statusRadius: '5px' },
    thinking: { radius: '5px' },
    usage: {
      radius: '9999px',
      height: '6px',
      track: 'var(--m-color-bg-sunken)',
      okFill: 'var(--m-color-border-focus)',
    },
  },
});
