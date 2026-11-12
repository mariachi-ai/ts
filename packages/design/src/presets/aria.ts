import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Aria: a content-first listening app in the current glass-era look. White pages (a true dark
 * mode of #1f1f1f), a pale sidebar library with blue glyphs, artwork as the hero (square tiles with
 * 7 and 10px corners on a soft layered shadow), bold large titles, black pills for the main action
 * (white in dark), round grey buttons beside them, hairline track lists, and a floating capsule
 * player with the transport, the track and the lyrics and queue buttons. System blue carries links,
 * selection and controls; the pink-red signature is the brand colour (the mark, live badges, art
 * washes), not an action colour. Category: content-first. The values are the reference's published
 * web stylesheet read as data and measured off its public pages (see DESIGN.md).
 */

// The published neutrals: the round grey button (black 6% / white 4%), the segmented track, the
// sidebar selection (#3c3c43 at 10%) and the track-list hover (black 6% / white 6%)
const fill = { light: '#efeff0', dark: '#2b2b2d' };
const fillHover = { light: '#e5e5e6', dark: '#353537' };
const fillPress = { light: '#dadadb', dark: '#404042' };
const navSelected = { light: '#e7e7e8', dark: '#2f2f30' };
const rowHover = { light: '#f0f0f0', dark: '#2c2c2c' };
// The main pill: black with white text in light, white with black text in dark
const pill = { light: '#000000', dark: '#ffffff' };
const pillFg = { light: '#ffffff', dark: '#000000' };
const pillHover = { light: '#262626', dark: '#e6e6e6' };
const pillPress = { light: '#3a3a3a', dark: '#d1d1d1' };

export const aria = extendTheme(minimal, {
  name: 'aria',
  label: 'Aria',
  description:
    'Content-first and glassy: white pages and a true dark mode, a pale sidebar library with blue glyphs, square artwork everywhere, bold large titles, black pills, hairline track lists and a floating capsule player.',
  tokens: {
    color: {
      bg: {
        // pageBG: white, and #1f1f1f in dark
        canvas: { light: '#ffffff', dark: '#1f1f1f' },
        // Grouped boxes (settings groups, plan cards): the system's grouped grey; in dark a step
        // above the page (the published #2c2c2e is moved to raised, see DESIGN.md)
        surface: { light: '#f5f5f7', dark: '#262628' },
        // Menus, popovers, dialogs and the floating player (the glass material, opaque here)
        raised: { light: '#ffffff', dark: '#2c2c2e' },
        // The sidebar: #3c3c43 at 3% over white (#ebebf5 at 3% over the page in dark)
        sunken: { light: '#fafafb', dark: '#232324' },
        // modalScrimColor: black 45% in both modes
        overlay: { light: 'rgb(0 0 0 / 0.45)', dark: 'rgb(0 0 0 / 0.45)' },
        inverse: { light: '#1d1d1f', dark: '#f5f5f7' },
      },
      fg: {
        // systemPrimary as measured: black 88% (#1f1f1f), white 92% in dark
        default: { light: '#1f1f1f', dark: '#ededed' },
        // Secondary text: black 56%; in dark the album metadata grey
        muted: { light: '#707070', dark: '#a1a1a6' },
        // Tertiary text: the nearest passing steps of the system greys
        subtle: { light: '#6e6e73', dark: '#939398' },
        inverse: { light: '#f5f5f7', dark: '#1d1d1f' },
      },
      border: {
        // labelDivider (black 15%, white 10%) and systemQuaternary as hairlines
        default: { light: '#d9d9d9', dark: '#383838' },
        muted: { light: '#e8e8e8', dark: '#2c2c2c' },
        // Control edges: the system's mid grey (3:1 on the grouped grey)
        strong: { light: '#86868b', dark: '#838387' },
        // The focus ring is system blue
        focus: { light: '#007aff', dark: '#0a84ff' },
      },
      accent: {
        // System blue: links, glyphs, selection, checks and switches. Light is systemBlue-vibrant
        // (#007aff is 4.0:1 under white text); dark is the nearest passing step of #0a84ff
        default: { light: '#0070f5', dark: '#0a72e6' },
        hover: { light: '#005cd7', dark: '#0a68dd' },
        active: { light: '#0045b7', dark: '#005cd7' },
        subtle: { light: '#e5f1ff', dark: '#0b2a4d' },
        fg: '#ffffff',
        // systemLink
        text: { light: '#0068da', dark: '#409cff' },
      },
      // The signature pink-red: the mark, live badges and art washes, never an action. #fa2d48 is
      // 3.8:1 under white, so it is the nearest passing step
      brand: {
        default: { light: '#e0193a', dark: '#e0193a' },
        fg: '#ffffff',
        subtle: { light: '#fde8eb', dark: '#4a1219' },
      },
      success: {
        bg: { light: '#e5f7e9', dark: '#12301a' },
        fg: { light: '#1e7a35', dark: '#30d158' },
        border: { light: '#a8e2b4', dark: '#1f5c2c' },
        solid: { light: '#1e7a35', dark: '#1e7a35' },
        onSolid: '#ffffff',
      },
      warning: {
        bg: { light: '#fff3e0', dark: '#3a2a10' },
        fg: { light: '#b25000', dark: '#ff9f0a' },
        border: { light: '#ffd18a', dark: '#6b4a12' },
        solid: { light: '#ff9500', dark: '#ff9f0a' },
        onSolid: '#1f1f1f',
      },
      // systemRed's accessible step (#d70015) for text and fills; #ff6961 on dark tints
      danger: {
        bg: { light: '#ffebea', dark: '#3b1715' },
        fg: { light: '#d70015', dark: '#ff6961' },
        border: { light: '#ffb8b3', dark: '#6e2a26' },
        solid: { light: '#d70015', dark: '#d70015' },
        onSolid: '#ffffff',
      },
      info: {
        bg: { light: '#e5f1ff', dark: '#0b2a4d' },
        fg: { light: '#0068da', dark: '#409cff' },
        border: { light: '#a9cfff', dark: '#1d4a80' },
        solid: { light: '#0070f5', dark: '#0a72e6' },
        onSolid: '#ffffff',
      },
      // The system text selection
      selection: {
        bg: { light: '#b3d7ff', dark: '#3f638b' },
        fg: { light: '#1f1f1f', dark: '#ededed' },
      },
    },
    font: {
      family: {
        // The reference's own system face is proprietary; Inter (variable, with optical sizes) is
        // the closest open match in Chrome
        sans: '"Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        display: '"Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        mono: '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      // The published text styles: subhead 11, callout 12, body 13, title-3 15, title-2 17,
      // title-1 22, large title 26, header 34
      size: {
        xs: '11px',
        sm: '12px',
        md: '13px',
        lg: '15px',
        xl: '17px',
        '2xl': '22px',
        '3xl': '26px',
        '4xl': '34px',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      // body 13/16 (1.23), body-tall 13/18 (1.38); 17/25 on the public pages
      leading: { tight: '1.18', normal: '1.3846', relaxed: '1.47' },
      tracking: { tight: '-0.015em', normal: '0', wide: '0.02em' },
      body: { weight: '400' },
      heading: { weight: '700', tracking: '-0.015em' },
    },
    control: {
      // 28px push buttons and rows, the 36px pill, 44px for big calls
      height: {
        sm: 'calc(28px * var(--m-density))',
        md: 'calc(36px * var(--m-density))',
        lg: 'calc(44px * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(12px * var(--m-density))',
        md: 'calc(20px * var(--m-density))',
        lg: 'calc(24px * var(--m-density))',
      },
      fontSize: '13px',
    },
    // Sizes are set in px: the body is 13px, and the library scales rem from the themed root, so
    // rem values would shrink with it
    space: { unit: '4px' },
    // 5px badges and small art, 8px rows and fields, 10px artwork, tiles and menus
    radius: { sm: '5px', md: '8px', lg: '10px', control: '8px', container: '10px' },
    shadow: {
      // The artwork lockup: five soft layers
      sm: {
        light:
          '0 1px 1px rgb(0 0 0 / 0.01), 0 2px 2px rgb(0 0 0 / 0.01), 0 4px 4px rgb(0 0 0 / 0.02), 0 8px 8px rgb(0 0 0 / 0.03), 0 14px 14px rgb(0 0 0 / 0.03)',
        dark: '0 1px 1px rgb(0 0 0 / 0.04), 0 2px 2px rgb(0 0 0 / 0.04), 0 4px 4px rgb(0 0 0 / 0.06), 0 8px 8px rgb(0 0 0 / 0.08), 0 14px 14px rgb(0 0 0 / 0.1)',
      },
      // Large album art: the radiosity shadow
      md: { light: '0 10px 20px rgb(0 0 0 / 0.1)', dark: '0 10px 20px rgb(0 0 0 / 0.3)' },
      // Glass: the floating player, the search field, the sidebar panel
      lg: { light: '0 10px 40px rgb(0 0 0 / 0.1)', dark: '0 10px 40px rgb(0 0 0 / 0.2)' },
      // Popovers and dialogs: an inner light stroke, a half-pixel edge and a long drop
      overlay: {
        light: 'inset 0 0 0 1px rgb(255 255 255 / 0.2), 0 0 0 0.5px rgb(0 0 0 / 0.2), 0 8px 40px rgb(0 0 0 / 0.25)',
        dark: 'inset 0 0 0 1px rgb(255 255 255 / 0.12), 0 0 0 0.5px rgb(0 0 0 / 0.6), 0 8px 40px rgb(0 0 0 / 0.55)',
      },
    },
    focus: { width: '3px', offset: '1px' },
    motion: {
      // .1s ease-in feedback, .2s ease fills, .4s for panels
      duration: { fast: '100ms', normal: '200ms', slow: '400ms' },
      easing: { standard: 'cubic-bezier(0.25, 0.1, 0.25, 1)', emphasized: 'cubic-bezier(0.215, 0.61, 0.355, 1)' },
    },
  },
  components: {
    // A 260px sidebar; the content runs edge to edge with 40px gutters and 20px between artwork
    layout: {
      containerMax: { sm: '480px', md: '720px', lg: '1400px' },
      containerPadding: 'clamp(16px, 3vw, 40px)',
      gridGap: '20px',
      splitSide: '260px',
      splitGap: '0',
    },
    // The pill: 36px, 15px semibold, black (white in dark); secondary is the round grey button's
    // fill; ghost is ink with a faint fill on hover
    button: {
      radius: '9999px',
      fontSize: 'var(--m-font-size-lg)',
      fontWeight: 'var(--m-font-weight-semibold)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      hoverTransform: 'none',
      activeTransform: 'none',
      disabledOpacity: '0.4',
      gap: '6px',
      primary: { bg: pill, fg: pillFg, border: pill, hoverBg: pillHover, activeBg: pillPress },
      secondary: {
        bg: fill,
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        hoverBg: fillHover,
        activeBg: fillPress,
      },
      ghost: { fg: 'var(--m-color-fg-default)', hoverBg: fill, activeBg: fillHover },
      danger: { border: 'transparent', hoverBg: '#c20618', activeBg: '#a80012' },
    },
    // Fields: white, a mid-grey edge, 8px corners; the focus ring is the blue halo
    input: {
      bg: 'var(--m-color-bg-canvas)',
      placeholder: 'var(--m-color-fg-subtle)',
      border: 'var(--m-color-border-strong)',
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-accent-default)',
      invalidBorder: 'var(--m-color-danger-fg)',
      radius: '8px',
      fontSize: 'var(--m-font-size-md)',
      paddingX: { sm: '10px', md: '12px', lg: '14px' },
    },
    select: {
      bg: 'var(--m-color-bg-canvas)',
      border: 'var(--m-color-border-strong)',
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-accent-default)',
      invalidBorder: 'var(--m-color-danger-fg)',
      radius: '8px',
      fontSize: 'var(--m-font-size-md)',
      paddingX: { sm: '10px', md: '12px', lg: '14px' },
    },
    // Labels 13px semibold above, footnotes 12px grey below, red for errors
    field: {
      gap: '6px',
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: 'var(--m-font-size-md)',
      labelFontWeight: 'var(--m-font-weight-semibold)',
      hintFg: 'var(--m-color-fg-muted)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    // 14px boxes with 4px corners, blue when checked
    checkbox: { size: '14px', radius: '4px', borderWidth: '1px' },
    radio: { size: '14px', borderWidth: '1px' },
    // The capsule switch: blue when on, a white knob with a soft drop
    switch: {
      width: '40px',
      height: '24px',
      thumbInset: '2px',
      trackBg: { light: '#86868b', dark: '#838387' },
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbShadow: '0 1px 3px rgb(0 0 0 / 0.25)',
      border: 'transparent',
    },
    // Grouped boxes: the grouped grey, 10px corners, no border, no shadow
    card: {
      border: 'transparent',
      shadow: 'none',
      hoverShadow: 'none',
      hoverBorder: 'transparent',
      hoverTransform: 'none',
      radius: '10px',
      padding: { sm: 'var(--m-space-3)', md: 'var(--m-space-4)', lg: 'var(--m-space-6)' },
      titleFamily: 'var(--m-font-family-display)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-bold)',
      descriptionFg: 'var(--m-color-fg-muted)',
      descriptionSize: 'var(--m-font-size-md)',
      outline: { bg: 'transparent', border: 'var(--m-color-border-default)' },
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    // The track list: no frame, 12px semibold grey headers, hairlines between rows, a grey row
    // hover and the faint alternate row of the library's song lists
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: 'var(--m-space-2)',
      cellPaddingY: '11px',
      bg: 'transparent',
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-semibold)',
      headerTransform: 'none',
      headerTracking: '0',
      borderColor: 'var(--m-color-border-default)',
      rowHoverBg: rowHover,
      stripeBg: { light: '#fafafa', dark: '#262626' },
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    // The library sidebar: pale, a faint edge, 32px rows with 8px corners, blue glyphs (drawn in
    // the recipes), the current row in the selection grey and semibold; plain grey headings
    sidebar: {
      width: '260px',
      bg: 'var(--m-color-bg-sunken)',
      border: 'var(--m-color-border-muted)',
      padding: 'var(--m-space-5)',
      sectionGap: 'var(--m-space-5)',
      itemGap: '4px',
      fontSize: '14px',
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: fill,
        activeFg: 'var(--m-color-fg-default)',
        activeBg: navSelected,
        activeWeight: 'var(--m-font-weight-semibold)',
        radius: '8px',
        paddingX: '6px',
        paddingY: '6px',
      },
      heading: {
        fg: 'var(--m-color-fg-muted)',
        size: 'var(--m-font-size-xs)',
        weight: 'var(--m-font-weight-semibold)',
        transform: 'none',
        tracking: '0',
      },
      // Counts are plain grey figures, no pill
      count: { bg: 'transparent', fg: 'var(--m-color-fg-muted)', radius: '9999px' },
    },
    // The public pages' local bar: a translucent white (dark) strip, the product name at 21px
    // semibold, 12px links and a small pill
    navbar: {
      height: '52px',
      bg: { light: '#ffffff', dark: '#1d1d1f' },
      border: 'var(--m-color-border-default)',
      shadow: 'none',
      brandFamily: 'var(--m-font-family-display)',
      brandWeight: '600',
      brandSize: '21px',
      link: {
        radius: '9999px',
        paddingX: 'var(--m-space-2)',
        fontSize: 'var(--m-font-size-sm)',
        fontWeight: 'var(--m-font-weight-regular)',
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
      },
    },
    // The segmented control is the pill variant: a grey capsule track with the chosen segment
    // white (grey in dark) on a soft shadow. Underline tabs are ink over a 2px ink line
    tabs: {
      fontSize: 'var(--m-font-size-md)',
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-default)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-fg-default)',
      indicatorWidth: '2px',
      listBorder: 'var(--m-color-border-default)',
      pill: {
        listBg: { light: '#eeeeef', dark: '#363638' },
        listRadius: '9999px',
        listPadding: '2px',
        radius: '9999px',
        activeBg: { light: '#ffffff', dark: '#636366' },
        activeShadow: '0 3px 8px rgb(0 0 0 / 0.12), 0 3px 1px rgb(0 0 0 / 0.04)',
      },
    },
    pagination: {
      radius: '9999px',
      border: 'transparent',
      fg: 'var(--m-color-fg-default)',
      hoverBg: fill,
      currentBg: pill,
      currentFg: pillFg,
      currentBorder: 'transparent',
    },
    breadcrumb: {
      separator: '"›"',
      fg: 'var(--m-color-accent-text)',
      hoverFg: 'var(--m-color-accent-hover)',
      currentFg: 'var(--m-color-fg-default)',
    },
    // Small grey platters, 4px corners, 11px semibold (the explicit mark, title badges)
    badge: {
      height: '18px',
      paddingX: '6px',
      radius: '4px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-semibold)',
      textTransform: 'none',
      tracking: '0',
      neutral: {
        bg: { light: '#eeeeef', dark: '#363638' },
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        solidBg: { light: '#6e6e73', dark: '#a1a1a6' },
        solidFg: { light: '#ffffff', dark: '#1f1f1f' },
      },
    },
    // Round monograms in the system grey
    avatar: {
      size: { sm: '24px', md: '32px', lg: '44px' },
      bg: { light: '#e5e5ea', dark: '#3a3a3c' },
      fg: { light: '#545458', dark: '#d1d1d6' },
      fontWeight: 'var(--m-font-weight-semibold)',
    },
    // A tinted panel, 10px corners, no border, a 16px status glyph
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '10px',
      padding: 'var(--m-space-3)',
      gap: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // The notification banner: the raised glass, 16px corners, the overlay shadow
    toast: {
      bg: 'var(--m-color-bg-raised)',
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '16px',
      shadow: 'var(--m-shadow-overlay)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // Sheets: raised, 18px corners over the 45% scrim, bold 17px titles
    dialog: {
      bg: 'var(--m-color-bg-raised)',
      border: 'transparent',
      radius: '18px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-5)',
      width: { sm: '384px', md: '480px', lg: '640px' },
      titleFamily: 'var(--m-font-family-display)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-bold)',
      descriptionFg: 'var(--m-color-fg-muted)',
    },
    // Menus: raised, 10px corners, 5px in, 28px rows at 13px with 5px corners; the hovered row
    // fills with the system blue, as native menus do; hairlines between groups
    popover: {
      border: 'transparent',
      radius: '10px',
      shadow: 'var(--m-shadow-overlay)',
      padding: '5px',
      minWidth: '185px',
      item: {
        height: '28px',
        paddingX: 'var(--m-space-2)',
        radius: '5px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: 'var(--m-color-accent-default)',
        hoverFg: 'var(--m-color-accent-fg)',
        dangerFg: 'var(--m-color-danger-fg)',
      },
      labelFg: 'var(--m-color-fg-muted)',
      separator: 'var(--m-color-border-default)',
    },
    // The help tag: a small raised box, 12px text, 5px corners
    tooltip: {
      bg: 'var(--m-color-bg-raised)',
      fg: 'var(--m-color-fg-default)',
      radius: '5px',
      shadow: '0 0 0 0.5px rgb(0 0 0 / 0.2), 0 2px 8px rgb(0 0 0 / 0.15)',
      paddingX: 'var(--m-space-2)',
      paddingY: 'var(--m-space-1)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
    },
    // The 4px scrubber: blue on black 10% (white 10% in dark); the link blue, so it reads 3:1 on
    // the dark track
    progress: {
      height: { sm: '4px', md: '4px', lg: '6px' },
      radius: '9999px',
      track: { light: '#e6e6e6', dark: '#3a3a3a' },
      fill: 'var(--m-color-accent-text)',
    },
    // Questions: hairline rows, 17px semibold summaries, a chevron on the right
    accordion: {
      radius: '0',
      bg: 'transparent',
      border: 'var(--m-color-border-default)',
      paddingX: '0',
      paddingY: 'var(--m-space-5)',
      hoverBg: 'transparent',
      summarySize: 'var(--m-font-size-xl)',
      summaryWeight: 'var(--m-font-weight-semibold)',
      contentFg: 'var(--m-color-fg-muted)',
    },
    // The artwork placeholder grey
    skeleton: {
      bg: { light: '#ebebeb', dark: '#323232' },
      highlight: { light: '#f5f5f5', dark: '#3a3a3a' },
      radius: '5px',
      blockRadius: '10px',
      duration: '1.5s',
    },
    spinner: { color: 'var(--m-color-fg-muted)', duration: '1s' },
    kbd: {
      radius: '5px',
      shadow: 'none',
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-default)',
      fontWeight: 'var(--m-font-weight-medium)',
    },
    code: {
      radius: '10px',
      inlineRadius: '5px',
      inlineBg: 'var(--m-color-bg-surface)',
      bg: 'var(--m-color-bg-surface)',
      border: 'transparent',
    },
    prose: { linkFg: 'var(--m-color-accent-text)', linkDecoration: 'none', maxWidth: '672px' },
    // Chat: your own messages in a blue bubble, the other side in the grouped grey, 18px corners
    chat: {
      radius: '18px',
      userBg: 'var(--m-color-accent-default)',
      userFg: 'var(--m-color-accent-fg)',
      userBorder: 'transparent',
      assistantBg: 'var(--m-color-bg-surface)',
      assistantBorder: 'transparent',
    },
    // The search capsule: white, a faint edge, the glass shadow
    composer: {
      radius: '19px',
      bg: 'var(--m-color-bg-canvas)',
      border: 'var(--m-color-border-strong)',
      focusBorder: 'var(--m-color-accent-default)',
      shadow: 'var(--m-shadow-lg)',
    },
    citation: { chipBg: fill, chipFg: 'var(--m-color-fg-default)', chipRadius: '9999px' },
    toolCall: { radius: '10px', statusRadius: '9999px' },
    usage: { radius: '9999px', track: { light: '#e6e6e6', dark: '#3a3a3a' } },
  },
});
