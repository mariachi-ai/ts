import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

// The quiet neutral fills, light and dark: the selected note, table headers, attachment tiles
const fill = { light: '#f3f5f7', dark: '#2d2d31' };
const fillActive = { light: '#e4e5e6', dark: '#3e3e42' };
// The tag pill: a pale grey capsule with ink text
const tagBg = { light: '#e4e5e6', dark: '#3e3e42' };

/**
 * Quill: a calm writing interface. Warm ink-grey type on white paper, a graphite sidebar of tags
 * even in light mode, one signature red for actions, links, pins and list bullets, grey tag
 * capsules, a note list whose selected note sits on a pale fill with a red edge, and quiet round
 * chrome. Dark mode is a near-black graphite with a calm blue, as the reference's own dark theme.
 * Category: calm and minimal. The values are measured, not invented (see DESIGN.md).
 */
export const quill = extendTheme(minimal, {
  name: 'quill',
  label: 'Quill',
  description:
    'Calm and bookish: ink-grey type on white, a graphite tag sidebar, one signature red, grey tag capsules, a red-edged selected note and round quiet chrome; a graphite dark mode with a calm blue.',
  tokens: {
    color: {
      bg: {
        // Paper: the editor and the note list are both white (graphite #1e1e20 in dark)
        canvas: { light: '#ffffff', dark: '#1e1e20' },
        surface: { light: '#ffffff', dark: '#1e1e20' },
        raised: { light: '#ffffff', dark: '#2d2d31' },
        // The selected note, table headers, attachment tiles, feature panels
        sunken: fill,
        overlay: { light: 'rgb(46 49 54 / 0.32)', dark: 'rgb(0 0 0 / 0.55)' },
        // Graphite: the sidebar's colour, used for tooltips and the toast
        inverse: { light: '#2e3136', dark: '#dddddd' },
      },
      fg: {
        default: { light: '#444444', dark: '#dddddd' },
        // The reference's secondary grey (#888888, 3.5:1) darkened to the 4.5:1 floor on the fill
        muted: { light: '#6f6f6f', dark: '#b0b0b2' },
        // Dates and quiet meta: #ababab (light) and #737375 (dark), moved to the 4.5:1 floor
        subtle: { light: '#767676', dark: '#949495' },
        inverse: { light: '#ffffff', dark: '#1e1e20' },
      },
      border: {
        // Separators between notes and the tag capsule fill
        default: { light: '#e4e5e6', dark: '#333336' },
        muted: { light: '#ecedee', dark: '#29292c' },
        // The to-do box ring: #888888, which meets 3:1
        strong: { light: '#888888', dark: '#6e6e72' },
        focus: { light: '#cf474a', dark: '#43a3e9' },
      },
      // The signature red (#dd4c4f) a step darker so white text meets 4.5:1. Dark mode is the
      // reference's dark theme: a calm blue
      accent: {
        default: { light: '#cf474a', dark: '#286ab3' },
        hover: { light: '#bd4144', dark: '#2f74c0' },
        active: { light: '#ab3b3e', dark: '#235e9f' },
        subtle: { light: '#fdf2f2', dark: '#1f3247' },
        fg: '#ffffff',
        text: { light: '#c44346', dark: '#43a3e9' },
      },
      // The red stays the brand in both modes: the logo square, the plan badge
      brand: {
        default: '#cf474a',
        fg: '#ffffff',
        subtle: { light: '#fdf2f2', dark: '#3a2426' },
      },
      success: {
        bg: { light: '#eef6f1', dark: '#1b2f27' },
        fg: { light: '#2b6451', dark: '#86d0ac' },
        border: { light: '#d3e8dc', dark: '#2b4a3c' },
        solid: { light: '#2a865b', dark: '#3a9e6f' },
        onSolid: { light: '#ffffff', dark: '#111f18' },
      },
      // The warning callout: an orange bar (#ef8930) on a faint warm wash
      warning: {
        bg: { light: '#fef9f6', dark: '#2b2621' },
        fg: { light: '#a15c20', dark: '#f5b57a' },
        border: { light: '#fce9db', dark: '#4a3826' },
        solid: { light: '#ef8930', dark: '#ef8930' },
        onSolid: { light: '#222222', dark: '#1e1e20' },
      },
      danger: {
        bg: { light: '#fdf2f2', dark: '#3a2224' },
        fg: { light: '#b8383b', dark: '#f39a9c' },
        border: { light: '#f6d5d5', dark: '#5e3134' },
        solid: { light: '#cf474a', dark: '#c94d49' },
        onSolid: { light: '#ffffff', dark: '#ffffff' },
      },
      info: {
        bg: { light: '#eff4fa', dark: '#1c2a3a' },
        fg: { light: '#456aa3', dark: '#8fc3ef' },
        border: { light: '#d8e3f1', dark: '#2c4560' },
        solid: { light: '#456aa3', dark: '#286ab3' },
        onSolid: '#ffffff',
      },
      selection: {
        bg: { light: '#f6d4d5', dark: '#2e4a6b' },
        fg: { light: '#444444', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // A geometric face with a grotesque's a, g and y, near the reference's own custom sans
        sans: '"Gantari Variable", "Gantari", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"',
        display: '"Gantari Variable", "Gantari", ui-sans-serif, system-ui, -apple-system, sans-serif',
        mono: '"Roboto Mono Variable", "Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      size: {
        xs: '0.6875rem',
        sm: '0.8125rem',
        md: '0.9375rem',
        lg: '1rem',
        xl: '1.375rem',
        '2xl': '1.875rem',
        '3xl': '2.6rem',
        '4xl': '3.2rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.1', normal: '1.6', relaxed: '1.7' },
      tracking: { tight: '0', normal: '0', wide: '0.04em' },
      body: { weight: '400' },
      heading: { weight: '700', tracking: '0' },
    },
    control: {
      height: {
        sm: 'calc(1.75rem * var(--m-density))',
        md: 'calc(2.25rem * var(--m-density))',
        lg: 'calc(2.75rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.625rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.5rem * var(--m-density))',
      },
      fontSize: '0.9375rem',
    },
    // 4px badges and marks, 8px buttons, inputs and the selected note, 16px panels
    radius: { sm: '4px', md: '8px', lg: '16px', control: '8px', container: '16px' },
    shadow: {
      // The round chrome buttons: a hairline ring and a breath of drop
      sm: {
        light: '0 0 0 0.5px rgb(0 0 0 / 0.1), 0 1px 3px rgb(0 0 0 / 0.06)',
        dark: '0 0 0 0.5px rgb(255 255 255 / 0.12), 0 1px 3px rgb(0 0 0 / 0.4)',
      },
      md: {
        light: '0 0 0 0.5px rgb(0 0 0 / 0.08), 0 4px 12px rgb(0 0 0 / 0.06)',
        dark: '0 0 0 0.5px rgb(255 255 255 / 0.1), 0 4px 12px rgb(0 0 0 / 0.4)',
      },
      // The public site's soft card lift: 0 13px 34px at 12%
      lg: {
        light: '0 13px 34px rgb(0 0 0 / 0.12)',
        dark: '0 0 0 0.5px rgb(255 255 255 / 0.1), 0 13px 34px rgb(0 0 0 / 0.5)',
      },
      // Menus and sheets: a hairline edge and a long soft drop, like the desktop's own
      overlay: {
        light: '0 0 0 0.5px rgb(0 0 0 / 0.14), 0 10px 32px rgb(0 0 0 / 0.16)',
        dark: '0 0 0 0.5px rgb(255 255 255 / 0.14), 0 10px 32px rgb(0 0 0 / 0.6)',
      },
    },
    focus: { offset: '2px' },
    motion: {
      duration: { fast: '120ms', normal: '200ms', slow: '320ms' },
      easing: { standard: 'cubic-bezier(0.25, 0.1, 0.25, 1)', emphasized: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
    },
  },
  components: {
    // Three columns: a 180px tag sidebar, a 280px note list, the editor; a 960px public site
    layout: {
      containerMax: { sm: '30rem', md: '40rem', lg: '60rem' },
      containerPadding: 'clamp(1rem, 4vw, 2rem)',
      gridGap: 'var(--m-space-6)',
      splitSide: '11.25rem',
    },
    // 8px buttons, regular weight with a little tracking: solid red for the one that matters, a
    // pale round-chrome fill for the rest, text alone for quiet ones
    button: {
      fontWeight: 'var(--m-font-weight-regular)',
      tracking: '0.02em',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      primary: { border: 'transparent' },
      secondary: {
        bg: { light: '#f7f7f7', dark: '#2d2d31' },
        fg: 'var(--m-color-fg-default)',
        border: { light: '#e4e5e6', dark: '#3e3e42' },
        hoverBg: { light: '#efeff0', dark: '#353539' },
        activeBg: { light: '#e4e5e6', dark: '#3e3e42' },
      },
      ghost: {
        fg: 'var(--m-color-fg-default)',
        hoverBg: fill,
        activeBg: fillActive,
      },
      danger: { border: 'transparent' },
    },
    // Inputs: white, 8.8px corners, a grey ring that turns red on focus
    input: {
      radius: '0.55rem',
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: '#6f6f6f', dark: '#8c8c90' },
      focusBorder: 'var(--m-color-accent-default)',
      placeholder: 'var(--m-color-fg-subtle)',
      paddingX: {
        sm: 'calc(0.625rem * var(--m-density))',
        md: 'calc(0.875rem * var(--m-density))',
        lg: 'calc(1.1rem * var(--m-density))',
      },
    },
    select: {
      radius: '0.55rem',
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: '#6f6f6f', dark: '#8c8c90' },
      focusBorder: 'var(--m-color-accent-default)',
    },
    field: {
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-medium)',
      hintFg: 'var(--m-color-fg-muted)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    // The to-do box: 18px, 5px corners, a grey ring; red when ticked
    checkbox: {
      size: '1.125rem',
      radius: '5px',
      borderWidth: '1.5px',
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: '#6f6f6f', dark: '#8c8c90' },
    },
    radio: { size: '1.125rem', borderWidth: '1.5px' },
    // The desktop switch: 38 × 22, red when on, a white knob with a soft shadow
    switch: {
      width: '2.375rem',
      height: '1.375rem',
      smWidth: '1.875rem',
      smHeight: '1.125rem',
      thumbInset: '2px',
      trackBg: 'var(--m-color-border-strong)',
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbShadow: '0 1px 2px rgb(0 0 0 / 0.25)',
    },
    // Feature panels: the quiet fill, 16px corners, no border, no shadow; a click lifts them
    card: {
      bg: fill,
      border: 'transparent',
      shadow: 'none',
      hoverShadow: 'var(--m-shadow-lg)',
      hoverBorder: 'transparent',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-6)', lg: 'var(--m-space-10)' },
      titleFamily: 'var(--m-font-family-display)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-bold)',
      descriptionFg: 'var(--m-color-fg-muted)',
      outline: { bg: 'var(--m-color-bg-surface)', border: 'var(--m-color-border-default)' },
      sunken: { bg: 'var(--m-color-bg-surface)', border: 'transparent' },
    },
    // The editor's table: a hairline frame with small corners, a filled bold header row, column
    // rules, alternate rows on the fill
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: 'var(--m-space-4)',
      cellPaddingY: 'calc(0.625rem * var(--m-density))',
      borderColor: 'var(--m-color-border-default)',
      headerBg: fill,
      headerFg: 'var(--m-color-fg-default)',
      headerFontSize: 'var(--m-font-size-md)',
      headerFontWeight: 'var(--m-font-weight-semibold)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      rowHoverBg: fill,
      stripeBg: fill,
      wrapBorder: { light: '#d9d9d9', dark: '#3e3e42' },
      wrapRadius: '6px',
    },
    // The graphite sidebar: dark in both modes, light text, the current row a soft grey block
    sidebar: {
      width: '11.25rem',
      bg: { light: '#2e3136', dark: '#2a2a2c' },
      border: { light: '#2e3136', dark: '#38383b' },
      padding: 'var(--m-space-2)',
      sectionGap: 'var(--m-space-4)',
      itemGap: '0px',
      fontSize: 'var(--m-font-size-md)',
      nestedIndent: 'var(--m-space-4)',
      guide: 'transparent',
      heading: {
        fg: { light: '#a3a6ab', dark: '#a3a3a6' },
        size: 'var(--m-font-size-xs)',
        weight: 'var(--m-font-weight-medium)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: { light: '#d1d1d1', dark: '#c8c8cb' },
        hoverFg: '#ffffff',
        hoverBg: { light: '#3a3d42', dark: '#343437' },
        activeFg: '#ffffff',
        activeBg: { light: '#474747', dark: '#3e3e42' },
        activeWeight: 'var(--m-font-weight-regular)',
        radius: '6px',
        paddingX: 'var(--m-space-2)',
        paddingY: 'calc(0.25rem * var(--m-density))',
      },
      count: { bg: { light: '#2e3136', dark: '#2a2a2c' }, fg: { light: '#a3a6ab', dark: '#a3a3a6' } },
    },
    // The public site's header: white, 64px, ink links at 16px, the wordmark bold
    navbar: {
      height: 'calc(4rem * var(--m-density))',
      paddingX: 'clamp(1rem, 4vw, 2rem)',
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      shadow: 'none',
      brandFamily: 'var(--m-font-family-display)',
      brandWeight: 'var(--m-font-weight-bold)',
      brandSize: '1.2rem',
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-accent-text)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-accent-text)',
        activeBg: 'transparent',
        fontSize: 'var(--m-font-size-lg)',
        fontWeight: 'var(--m-font-weight-regular)',
        radius: '8px',
      },
    },
    // Underline tabs in ink with a red line; the info panel's segmented control is a grey track
    // with a white pill
    tabs: {
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-accent-default)',
      indicatorWidth: '2px',
      pill: {
        listBg: fill,
        listRadius: '9999px',
        listPadding: '3px',
        radius: '9999px',
        activeBg: { light: '#ffffff', dark: '#4a4a4f' },
        activeShadow: 'var(--m-shadow-sm)',
      },
    },
    breadcrumb: { separator: '"/"', currentWeight: 'var(--m-font-weight-medium)' },
    pagination: {
      radius: '8px',
      border: 'transparent',
      fg: 'var(--m-color-fg-muted)',
      hoverBg: fill,
      currentBg: tagBg,
      currentFg: 'var(--m-color-fg-default)',
      currentBorder: 'transparent',
    },
    // The tag capsule: pale grey, ink text, regular weight; tones tint it
    badge: {
      height: '1.375rem',
      paddingX: '0.5rem',
      radius: '9999px',
      borderWidth: '0px',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
      textTransform: 'none',
      tracking: '0',
      neutral: {
        bg: tagBg,
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        solidBg: 'var(--m-color-bg-inverse)',
        solidFg: 'var(--m-color-fg-inverse)',
      },
    },
    avatar: {
      size: { sm: '1.5rem', md: '2rem', lg: '3rem' },
      bg: tagBg,
      fg: 'var(--m-color-fg-default)',
      fontWeight: 'var(--m-font-weight-semibold)',
    },
    divider: { color: 'var(--m-color-border-default)' },
    // Callouts: a faint wash, a hairline frame and a 3px bar on the leading edge, 6px corners
    alert: {
      borderWidth: '1px',
      accentWidth: '3px',
      radius: '6px',
      padding: 'var(--m-space-4) var(--m-space-5)',
      gap: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // A graphite HUD: the sidebar's colour, light text, rounded, no stripe
    toast: {
      bg: 'var(--m-color-bg-inverse)',
      fg: 'var(--m-color-fg-inverse)',
      bodyFg: { light: '#c9cbce', dark: '#444446' },
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '10px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-3) var(--m-space-4)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // Sheets: white, 12px corners, the overlay shadow, a bold title
    dialog: {
      border: 'transparent',
      radius: '12px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-6)',
      titleFamily: 'var(--m-font-family-display)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-bold)',
      descriptionFg: 'var(--m-color-fg-muted)',
    },
    // Menus: the desktop's own, 10px corners, 28px rows, muted section labels, a grey highlight
    popover: {
      bg: 'var(--m-color-bg-raised)',
      border: 'transparent',
      radius: '10px',
      shadow: 'var(--m-shadow-overlay)',
      padding: '5px',
      item: {
        height: '1.75rem',
        paddingX: 'var(--m-space-2)',
        radius: '5px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: fillActive,
        hoverFg: 'var(--m-color-fg-default)',
      },
      labelFg: 'var(--m-color-fg-muted)',
      separator: 'var(--m-color-border-default)',
    },
    // A graphite chip with light text
    tooltip: {
      radius: '6px',
      shadow: 'none',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
      delay: '500ms',
    },
    progress: {
      height: { sm: '0.1875rem', md: '0.25rem', lg: '0.375rem' },
      radius: '9999px',
      track: { light: '#e4e5e6', dark: '#3e3e42' },
      // Dark mode takes the brighter link blue so the bar stands off the track
      fill: { light: '#cf474a', dark: '#43a3e9' },
    },
    usage: {
      height: '0.25rem',
      radius: '9999px',
      track: { light: '#e4e5e6', dark: '#3e3e42' },
      okFill: { light: '#cf474a', dark: '#43a3e9' },
    },
    // The locked-note placeholder: grey word blocks with small corners
    skeleton: {
      bg: { light: '#e4e5e6', dark: '#2d2d31' },
      highlight: { light: '#eff0f1', dark: '#38383c' },
      radius: '3px',
      blockRadius: '8px',
    },
    spinner: { thickness: '2px', color: 'var(--m-color-fg-muted)' },
    kbd: {
      fontFamily: 'var(--m-font-family-sans)',
      fontWeight: 'var(--m-font-weight-medium)',
      bg: fill,
      border: { light: '#d9d9d9', dark: '#3e3e42' },
      radius: '5px',
      shadow: 'none',
    },
    // Code: Roboto Mono on the quiet fill, 6px corners
    code: {
      bg: fill,
      border: 'transparent',
      radius: '6px',
      inlineBg: fill,
      inlineRadius: '4px',
      fontSize: '0.875rem',
      comment: 'var(--m-color-fg-muted)',
    },
    // Folded headings: hairline rows, a chevron, no fill
    accordion: {
      radius: '0',
      bg: 'transparent',
      border: 'var(--m-color-border-default)',
      paddingX: '0',
      paddingY: 'var(--m-space-4)',
      summarySize: 'var(--m-font-size-lg)',
      summaryWeight: 'var(--m-font-weight-semibold)',
      hoverBg: 'transparent',
      contentFg: 'var(--m-color-fg-muted)',
    },
    // The editor: 16px text at 1.6, red links without underline, red bullets, bold headings
    prose: {
      maxWidth: '38rem',
      fontSize: 'var(--m-font-size-lg)',
      lineHeight: '1.6',
      headingFg: 'var(--m-color-fg-default)',
      h1Size: 'var(--m-font-size-2xl)',
      h2Size: 'var(--m-font-size-xl)',
      h3Size: '1.125rem',
      h2Border: 'transparent',
      linkFg: 'var(--m-color-accent-text)',
      linkDecoration: 'none',
      markerFg: 'var(--m-color-accent-default)',
      quoteFg: 'var(--m-color-fg-muted)',
      quoteBorder: 'var(--m-color-border-strong)',
      quoteBorderWidth: '3px',
      quoteStyle: 'italic',
      hrColor: 'var(--m-color-border-default)',
      tableBorder: 'var(--m-color-border-default)',
      tableFontSize: 'var(--m-font-size-md)',
      cellPaddingX: 'var(--m-space-4)',
      cellPaddingY: 'calc(0.625rem * var(--m-density))',
      tableHeaderBg: fill,
      tableHeaderFg: 'var(--m-color-fg-default)',
      imageRadius: '8px',
    },
    // The assistant: your words on the fill, its answers plain on the paper
    chat: {
      radius: '12px',
      userBg: fill,
      userFg: 'var(--m-color-fg-default)',
      userBorder: 'transparent',
      assistantBg: 'transparent',
      assistantBorder: 'transparent',
      avatarBg: tagBg,
      avatarFg: 'var(--m-color-fg-default)',
    },
    composer: { radius: '12px', shadow: 'var(--m-shadow-sm)', focusBorder: 'var(--m-color-accent-default)' },
    citation: {
      chipBg: tagBg,
      chipFg: 'var(--m-color-fg-default)',
      chipHoverBg: fillActive,
      chipHoverFg: 'var(--m-color-fg-default)',
      chipRadius: '9999px',
    },
    toolCall: { radius: '8px', statusRadius: '9999px' },
  },
});
