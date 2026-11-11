import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Basalt: a flat, square, warm-grey money interface. Near-black ink on white and warm off-white,
 * hairline-bordered panels with square corners, one electric lime for the primary action and for
 * counts, green for anything confirmed, and pills only for counts, avatars and toolbar controls.
 * Category: calm fintech. The values are measured, not invented (see DESIGN.md).
 */
const lime = '#e4f222';

export const basalt = extendTheme(minimal, {
  name: 'basalt',
  label: 'Basalt',
  description:
    'Flat and exact: near-black ink on warm off-white, square hairline panels, an electric lime primary action and green for done.',
  tokens: {
    color: {
      bg: {
        // The page behind dashboards; lists and forms sit on plain white
        canvas: { light: '#fcfbfa', dark: '#121110' },
        surface: { light: '#ffffff', dark: '#1a1919' },
        raised: { light: '#ffffff', dark: '#232221' },
        // The sidebar, the search bar and quiet fills
        sunken: { light: '#f4f2f0', dark: '#1e1d1c' },
        overlay: { light: 'rgb(26 25 25 / 0.4)', dark: 'rgb(0 0 0 / 0.6)' },
        inverse: { light: '#1a1919', dark: '#f4f2f0' },
      },
      fg: {
        default: { light: '#1a1919', dark: '#f4f2f0' },
        muted: { light: '#6e6a68', dark: '#b9b4b1' },
        // The reference's placeholder grey (#a39d99) is 2.6:1; darkened to the 4.5:1 floor
        subtle: { light: '#75716e', dark: '#a39d99' },
        inverse: { light: '#f4f2f0', dark: '#1a1919' },
      },
      border: {
        // Panels, cards and buttons: the warm hairline
        default: { light: '#d2cecb', dark: '#3a3735' },
        // Dividers, the sidebar edge, quiet fills
        muted: { light: '#e9e5e2', dark: '#2b2927' },
        // Controls: darkened from #d2cecb to the 3:1 floor
        strong: { light: '#8f8985', dark: '#7a7470' },
        // Focus is a 2px ring in the current ink
        focus: { light: '#1a1919', dark: '#f4f2f0' },
      },
      // The accent is the ink; the lime lives on the primary button and counts (see components)
      accent: {
        default: { light: '#1a1919', dark: '#f4f2f0' },
        hover: { light: '#34312f', dark: '#dcd8d5' },
        active: { light: '#4a4644', dark: '#c6c1bd' },
        // The palest lime: highlights, AI-filled fields, accent notices
        subtle: { light: '#feffe1', dark: '#2c2e10' },
        fg: { light: '#ffffff', dark: '#1a1919' },
        text: { light: '#1a1919', dark: '#f4f2f0' },
      },
      success: {
        bg: { light: '#e4f2e7', dark: '#15301e' },
        fg: { light: '#26763b', dark: '#7fd49a' },
        border: { light: '#24863e', dark: '#3fa35b' },
        solid: { light: '#24863e', dark: '#24863e' },
        onSolid: '#ffffff',
      },
      warning: {
        bg: { light: '#f7f5e6', dark: '#2e2814' },
        fg: { light: '#876634', dark: '#e3c27a' },
        border: { light: '#af7a2b', dark: '#af7a2b' },
        solid: { light: '#af7a2b', dark: '#af7a2b' },
        onSolid: '#1a1919',
      },
      // Orange-red, not a pure red
      danger: {
        bg: { light: '#f7e5d9', dark: '#3a1d12' },
        fg: { light: '#b74018', dark: '#f29a78' },
        border: { light: '#cf491e', dark: '#cf491e' },
        solid: { light: '#cf491e', dark: '#cf491e' },
        onSolid: '#ffffff',
      },
      // Muted denim blue: notices and suggestions
      info: {
        bg: { light: '#f2f5f9', dark: '#1a2335' },
        fg: { light: '#425e93', dark: '#a9c0ec' },
        border: { light: '#5683d2', dark: '#5683d2' },
        solid: { light: '#425e93', dark: '#425e93' },
        onSolid: '#ffffff',
      },
      selection: {
        bg: { light: '#f5ff78', dark: '#4a4f12' },
        fg: { light: '#1a1919', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // A tight neo-grotesque; Geist 400 stands in for the reference's light 300 body cut
        sans: '"Geist Variable", "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
        display: '"Geist Variable", "Geist", ui-sans-serif, system-ui, sans-serif',
        mono: '"Geist Mono Variable", "Geist Mono", ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace',
      },
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.75rem',
        '3xl': '2.5rem',
        '4xl': '3.5rem',
      },
      weight: { regular: '400', medium: '480', semibold: '600', bold: '700' },
      leading: { tight: '1.15', normal: '1.5', relaxed: '1.6' },
      tracking: { tight: '-0.02em', normal: '0', wide: '0.02em' },
      body: { weight: '400' },
      heading: { weight: '460', tracking: '-0.02em' },
    },
    control: {
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(2.5rem * var(--m-density))',
        lg: 'calc(3.5rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.25rem * var(--m-density))',
      },
    },
    // Square by default: buttons, inputs, panels and dialogs have no rounding
    radius: { sm: '2px', md: '4px', lg: '8px', control: '0', container: '0' },
    shadow: {
      sm: { light: '0 1px 2px rgb(0 0 0 / 0.1)', dark: '0 1px 2px rgb(0 0 0 / 0.4)' },
      md: {
        light: '0 1px 2px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(124 119 116 / 0.1)',
        dark: '0 1px 2px rgb(0 0 0 / 0.4), 0 0 0 1px rgb(255 255 255 / 0.08)',
      },
      // Menus and popovers: a short drop, a long soft one, and a faint warm ring
      lg: {
        light: '1px 4px 8px rgb(0 0 0 / 0.15), 2px 12px 24px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(124 119 116 / 0.2)',
        dark: '1px 4px 8px rgb(0 0 0 / 0.5), 2px 12px 24px rgb(0 0 0 / 0.4), 0 0 0 1px rgb(255 255 255 / 0.12)',
      },
      // Dialogs: a long diagonal fall to the lower right
      overlay: {
        light:
          '10px 16px 40px rgb(0 0 0 / 0.16), 40px 60px 72px rgb(0 0 0 / 0.08), 84px 124px 90px rgb(0 0 0 / 0.05), 0 0 0 1px rgb(124 119 116 / 0.2)',
        dark: '10px 16px 40px rgb(0 0 0 / 0.5), 40px 60px 72px rgb(0 0 0 / 0.35), 0 0 0 1px rgb(255 255 255 / 0.12)',
      },
    },
    focus: { offset: '2px' },
    motion: {
      duration: { fast: '150ms', normal: '200ms', slow: '250ms' },
      easing: { standard: 'ease-in-out', emphasized: 'ease-out' },
    },
  },
  components: {
    // A 216px sidebar, then content with 56px gutters; full-page flows in a 768px column
    layout: {
      containerMax: { sm: '30rem', md: '48rem', lg: '80rem' },
      containerPadding: 'clamp(1rem, 4vw, 3.5rem)',
      gridGap: 'var(--m-space-6)',
      splitSide: '13.5rem',
    },
    // Square buttons: lime for the one primary action, white with a warm hairline for the rest
    button: {
      fontWeight: 'var(--m-font-weight-medium)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      primary: {
        bg: lime,
        fg: '#1a1919',
        border: lime,
        hoverBg: { light: '#d3e01f', dark: '#d3e01f' },
        activeBg: { light: '#c2ce1c', dark: '#c2ce1c' },
      },
      secondary: {
        bg: 'var(--m-color-bg-surface)',
        fg: 'var(--m-color-fg-default)',
        border: 'var(--m-color-border-default)',
        hoverBg: { light: '#f4f2f0', dark: '#262524' },
        activeBg: { light: '#e9e5e2', dark: '#2f2d2c' },
      },
      ghost: {
        hoverBg: { light: '#f4f2f0', dark: '#262524' },
        activeBg: { light: '#e9e5e2', dark: '#2f2d2c' },
      },
    },
    // Panels: white, a 1px warm hairline, square, no shadow
    card: {
      border: 'var(--m-color-border-default)',
      shadow: 'none',
      hoverShadow: 'none',
      hoverBorder: 'var(--m-color-border-strong)',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-5)', lg: 'var(--m-space-6)' },
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-regular)',
    },
    input: {
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-fg-default)',
      paddingX: { sm: 'var(--m-space-3)', md: 'var(--m-space-3)', lg: 'var(--m-space-3)' },
    },
    field: {
      labelFg: 'var(--m-color-fg-muted)',
      labelFontSize: 'var(--m-font-size-xs)',
      labelFontWeight: 'var(--m-font-weight-regular)',
      hintFontSize: 'var(--m-font-size-xs)',
      errorFontWeight: 'var(--m-font-weight-regular)',
      // The required mark is a muted asterisk tight against the label
      requiredMarker: '"*"',
      requiredFg: 'var(--m-color-fg-muted)',
    },
    // Checked controls are the confirmation green
    checkbox: {
      size: '1rem',
      radius: '2px',
      border: 'var(--m-color-fg-muted)',
      hoverBorder: 'var(--m-color-fg-default)',
      checkedBg: { light: '#01a741', dark: '#01a741' },
      checkedBorder: { light: '#01a741', dark: '#01a741' },
      mark: '#ffffff',
    },
    switch: {
      width: '2.25rem',
      height: '1.25rem',
      smWidth: '1.875rem',
      smHeight: '1rem',
      trackBg: 'var(--m-color-border-strong)',
      trackCheckedBg: { light: '#01a741', dark: '#01a741' },
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbShadow: 'none',
    },
    table: {
      fontSize: 'var(--m-font-size-sm)',
      cellPaddingX: 'var(--m-space-3)',
      cellPaddingY: 'var(--m-space-3)',
      borderColor: 'var(--m-color-border-muted)',
      headerBg: 'var(--m-color-bg-surface)',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-xs)',
      headerFontWeight: 'var(--m-font-weight-regular)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      rowHoverBg: 'var(--m-color-bg-canvas)',
      stripeBg: 'var(--m-color-bg-canvas)',
      wrapBorder: 'var(--m-color-border-muted)',
      wrapRadius: '0',
    },
    sidebar: {
      width: '13.5rem',
      bg: 'var(--m-color-bg-sunken)',
      border: 'var(--m-color-border-muted)',
      padding: 'var(--m-space-2)',
      sectionGap: 'var(--m-space-4)',
      itemGap: '4px',
      heading: {
        fg: 'var(--m-color-fg-muted)',
        weight: 'var(--m-font-weight-regular)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'var(--m-color-border-muted)',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'var(--m-color-border-muted)',
        activeWeight: 'var(--m-font-weight-regular)',
        radius: '4px',
        paddingX: 'var(--m-space-2)',
        paddingY: 'calc(0.375rem * var(--m-density))',
      },
      // Counts are pale-lime pills
      count: { bg: { light: '#f5ff78', dark: '#3a3d10' }, fg: 'var(--m-color-fg-default)' },
    },
    navbar: {
      height: 'calc(3.875rem * var(--m-density))',
      border: 'var(--m-color-border-muted)',
      link: {
        fg: 'var(--m-color-fg-default)',
        fontWeight: 'var(--m-font-weight-regular)',
        radius: '4px',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'var(--m-color-bg-sunken)',
      },
    },
    tabs: {
      listGap: 'var(--m-space-2)',
      listBorder: 'var(--m-color-border-muted)',
      height: '3rem',
      paddingX: 'var(--m-space-4)',
      fontWeight: 'var(--m-font-weight-regular)',
      pill: {
        listBg: 'var(--m-color-bg-sunken)',
        listRadius: '0',
        listPadding: 'var(--m-space-1)',
        radius: '0',
        activeShadow: 'none',
      },
    },
    breadcrumb: { currentWeight: 'var(--m-font-weight-regular)' },
    pagination: { radius: '0', fontWeight: 'var(--m-font-weight-regular)' },
    // Status tags: a 4px tint with no border. Counts are pills (see the sidebar count)
    badge: {
      radius: '4px',
      borderWidth: '0px',
      fontWeight: 'var(--m-font-weight-regular)',
      neutral: {
        bg: 'var(--m-color-border-muted)',
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
      },
    },
    avatar: {
      size: { sm: '1.5rem', md: '2rem', lg: '2.5rem' },
      bg: { light: '#deb1b9', dark: '#deb1b9' },
      fg: '#1a1919',
      fontWeight: 'var(--m-font-weight-regular)',
    },
    // Notices: a 1px tone border on a pale tint, square
    alert: {
      bg: 'var(--m-color-bg-surface)',
      fg: 'var(--m-color-fg-muted)',
      border: 'var(--m-color-border-default)',
      accentWidth: '1px',
      padding: 'var(--m-space-4) var(--m-space-5)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    toast: {
      bg: 'var(--m-color-bg-canvas)',
      border: 'var(--m-color-fg-subtle)',
      accentWidth: '1px',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-3)',
      width: '25rem',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    dialog: { border: 'transparent', padding: 'var(--m-space-8)', titleWeight: 'var(--m-font-heading-weight)' },
    popover: {
      border: 'transparent',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-1)',
      item: { height: '2.25rem', radius: '0', hoverBg: 'var(--m-color-bg-sunken)' },
      separator: 'var(--m-color-border-muted)',
    },
    // White, hairline-ringed, small ink text
    tooltip: {
      bg: 'var(--m-color-bg-raised)',
      fg: 'var(--m-color-fg-default)',
      radius: '0',
      shadow: '0 0 0 1px var(--m-color-border-default), 0 1px 2px rgb(0 0 0 / 0.1)',
      fontWeight: 'var(--m-font-weight-regular)',
      delay: '300ms',
    },
    progress: {
      height: { sm: '0.25rem', md: '0.25rem', lg: '0.5rem' },
      radius: '0',
      track: 'var(--m-color-border-muted)',
      fill: 'var(--m-color-success-solid)',
    },
    usage: {
      radius: '0',
      height: '0.25rem',
      track: 'var(--m-color-border-muted)',
      okFill: 'var(--m-color-success-solid)',
    },
    skeleton: {
      bg: 'var(--m-color-bg-sunken)',
      highlight: 'var(--m-color-bg-canvas)',
      radius: '0',
    },
    kbd: {
      fontWeight: 'var(--m-font-weight-regular)',
      border: 'var(--m-color-border-default)',
      radius: '4px',
      shadow: 'none',
    },
    code: {
      radius: '0',
      keyword: 'var(--m-color-info-fg)',
      function: 'var(--m-color-fg-default)',
      comment: 'var(--m-color-fg-muted)',
    },
    accordion: {
      separatedGap: 'var(--m-space-4)',
      paddingX: 'var(--m-space-5)',
      paddingY: 'var(--m-space-4)',
      summaryWeight: 'var(--m-font-weight-regular)',
      hoverBg: 'var(--m-color-bg-canvas)',
    },
    chat: {
      userBg: 'var(--m-color-bg-sunken)',
      userBorder: 'var(--m-color-bg-sunken)',
      assistantBorder: 'transparent',
      avatarBg: 'var(--m-color-border-muted)',
      avatarFg: 'var(--m-color-fg-default)',
      assistantAvatarBg: lime,
      assistantAvatarFg: '#1a1919',
    },
    citation: {
      chipBg: 'var(--m-color-border-muted)',
      chipFg: 'var(--m-color-fg-default)',
      chipRadius: '4px',
    },
    composer: { shadow: 'none' },
    toolCall: { radius: '0', statusRadius: '4px' },
  },
});
