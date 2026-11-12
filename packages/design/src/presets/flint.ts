import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Flint: a dark-first, sharp tool for working beside an agent. Neutral near-black panels a step
 * apart (#141414 beside #181818), text as one light grey at set opacities, hairlines at 7%,
 * a compact 11/12/13px type scale, small radii, an inverted primary (light on dark, dark on light),
 * green and red diff counts, tool-call rows and a rounded composer with a model picker. The light
 * theme is the public site's warm off-white with pill buttons and one orange brand colour.
 * Category: dark and sharp. The values are measured or published, not invented (see DESIGN.md).
 */
export const flint = extendTheme(minimal, {
  name: 'flint',
  label: 'Flint',
  description:
    'Dark-first and sharp: neutral near-black panels, compact 12–13px type, hairlines, small radii, an inverted primary, green and red diffs and an agent composer.',
  tokens: {
    color: {
      bg: {
        // Dark: the side panels (#141414), the editor (#181818), boxes and menus a step up.
        // Light: the public site's warm off-white, its card step and its docs sidebar.
        canvas: { light: '#f7f7f4', dark: '#181818' },
        surface: { light: '#f2f1ed', dark: '#1e1e1e' },
        raised: { light: '#fcfcfa', dark: '#232323' },
        sunken: { light: '#f0efea', dark: '#141414' },
        overlay: { light: 'rgb(20 18 11 / 0.24)', dark: 'rgb(0 0 0 / 0.5)' },
        inverse: { light: '#26251e', dark: '#e4e4e4' },
      },
      fg: {
        // Dark text is #e4e4e4; secondary is the same grey at 55% (#898989 composited)
        default: { light: '#26251e', dark: '#e4e4e4' },
        // The reference's 60% (light) and 55% (dark) steps, darkened or lifted to pass on every surface
        muted: { light: '#64635d', dark: '#939393' },
        // The reference's 40% and 37% steps fail 4.5:1; the nearest that pass
        subtle: { light: '#6b6a65', dark: '#8a8a8a' },
        inverse: { light: '#f7f7f4', dark: '#141414' },
      },
      border: {
        // Hairlines: the text colour at 10% (light) and 7.5% (dark)
        default: { light: '#e2e2df', dark: '#272727' },
        muted: { light: '#ecebe8', dark: '#212121' },
        // Controls need 3:1; the reference's own control edges are hairlines (see deviations)
        strong: { light: '#8b8a85', dark: '#6b6b6b' },
        // Focus: the site's orange ring in light, the app's link blue in dark
        focus: { light: '#d84500', dark: '#81a1c1' },
      },
      accent: {
        // The primary action is inverted: near-black on the light site, light grey in the dark app
        default: { light: '#26251e', dark: '#e4e4e4' },
        hover: { light: '#3b3a33', dark: '#d4d4d4' },
        active: { light: '#4a4942', dark: '#c4c4c4' },
        subtle: { light: '#e6e5e0', dark: '#2c2c2c' },
        fg: { light: '#f7f7f4', dark: '#141414' },
        // Links: the site's orange, darkened to pass, in light; the app's link blue in dark
        text: { light: '#b23a00', dark: '#81a1c1' },
      },
      // The signature orange: marks, the "most popular" tint, brand panels; never an action
      brand: {
        default: { light: '#f54e00', dark: '#f54e00' },
        fg: { light: '#14120b', dark: '#14120b' },
        subtle: { light: '#f7e6dc', dark: '#2e1d16' },
      },
      success: {
        bg: { light: '#e2ede6', dark: '#1c2a21' },
        fg: { light: '#176a4d', dark: '#70b489' },
        border: { light: '#b9d8c9', dark: '#24402e' },
        solid: { light: '#1d8360', dark: '#3fa266' },
        onSolid: { light: '#ffffff', dark: '#141414' },
      },
      warning: {
        bg: { light: '#f1e7d8', dark: '#2b2418' },
        fg: { light: '#7d5200', dark: '#f1b467' },
        border: { light: '#e2c9a3', dark: '#4a3b22' },
        solid: { light: '#c08532', dark: '#d2943e' },
        onSolid: { light: '#26251e', dark: '#141414' },
      },
      danger: {
        bg: { light: '#f6e4e6', dark: '#2e171d' },
        fg: { light: '#b3244a', dark: '#fc6b83' },
        border: { light: '#ebbcc6', dark: '#4d1f2c' },
        solid: { light: '#cf2d56', dark: '#e34671' },
        onSolid: { light: '#ffffff', dark: '#141414' },
      },
      info: {
        bg: { light: '#e3ebf0', dark: '#1b2529' },
        fg: { light: '#2d6590', dark: '#88c0d0' },
        border: { light: '#bcd0de', dark: '#2c3f47' },
        solid: { light: '#3c7cab', dark: '#81a1c1' },
        onSolid: { light: '#ffffff', dark: '#141414' },
      },
      selection: {
        bg: { light: '#dedcd6', dark: '#3d3d3d' },
        fg: { light: '#26251e', dark: '#e4e4e4' },
      },
    },
    font: {
      family: {
        // The app draws its UI in the system face; Inter is the open stand-in
        sans: '"Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        // The site's own grotesque is proprietary; Geist matches its width and plain forms
        display: '"Geist Variable", "Geist", "Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif',
        mono: '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      // The product's 11, 12, 13; the site's 14, 18, 22, 36, 52
      size: {
        xs: '11px',
        sm: '12px',
        md: '13px',
        lg: '14px',
        xl: '18px',
        '2xl': '22px',
        '3xl': '36px',
        '4xl': '52px',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.2', normal: '1.45', relaxed: '1.55' },
      tracking: { tight: '-0.02em', normal: '0', wide: '0.04em' },
      body: { weight: '400' },
      // Titles stay at regular weight, tracked in, as on the site and the web dashboard
      heading: { weight: '400', tracking: '-0.015em' },
    },
    // Every length is in px, as the reference's own UI: the theme root takes the 13px text size, so
    // rem lengths would shrink to 13/16 of their value
    space: { unit: '4px' },
    control: {
      // Compact: 24, 28 and 36px
      height: {
        sm: 'calc(24px * var(--m-density))',
        md: 'calc(28px * var(--m-density))',
        lg: 'calc(36px * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(8px * var(--m-density))',
        md: 'calc(10px * var(--m-density))',
        lg: 'calc(16px * var(--m-density))',
      },
      fontSize: 'var(--m-font-size-md)',
    },
    radius: { sm: '4px', md: '6px', lg: '12px', control: '6px', container: '8px' },
    shadow: {
      // Flat in the app: steps of grey and hairlines; menus and windows take a long soft drop
      sm: { light: '0 0 0 1px rgb(38 37 30 / 0.025)', dark: '0 0 0 1px rgb(0 0 0 / 0.2)' },
      md: { light: '0 0 16px rgb(0 0 0 / 0.02), 0 0 8px rgb(0 0 0 / 0.01)', dark: '0 4px 12px rgb(0 0 0 / 0.25)' },
      lg: {
        light: '0 14px 32px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(38 37 30 / 0.06)',
        dark: '0 8px 30px rgb(0 0 0 / 0.35), 0 0 0 1px rgb(255 255 255 / 0.04)',
      },
      overlay: {
        light: '0 28px 70px rgb(0 0 0 / 0.14), 0 14px 32px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(38 37 30 / 0.1)',
        dark: '0 22px 70px 4px rgb(0 0 0 / 0.3), 0 0 0 1px rgb(255 255 255 / 0.06)',
      },
    },
    focus: { width: '2px', offset: '1px' },
    motion: {
      duration: { fast: '140ms', normal: '200ms', slow: '250ms' },
      easing: { standard: 'cubic-bezier(0, 0, 0.2, 1)', emphasized: 'cubic-bezier(0.25, 1, 0.5, 1)' },
    },
  },
  components: {
    // A 240px side panel beside the work; settings and docs read in a 672px column
    layout: {
      containerMax: { sm: '448px', md: '672px', lg: '1152px' },
      containerPadding: 'clamp(16px, 4vw, 32px)',
      gridGap: 'var(--m-space-3)',
      gridMin: '224px',
      splitSide: '240px',
      stackGap: 'var(--m-space-3)',
      clusterGap: 'var(--m-space-2)',
    },
    // Small rectangles in the app, regular weight; the one action is inverted
    button: {
      fontWeight: 'var(--m-font-weight-regular)',
      radius: 'var(--m-radius-control)',
      gap: '6px',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      secondary: {
        bg: { light: '#e6e5e0', dark: '#232323' },
        fg: 'var(--m-color-fg-default)',
        border: { light: '#e3e2dd', dark: '#333333' },
        hoverBg: { light: '#e1e0db', dark: '#2a2a2a' },
        activeBg: { light: '#dbdad5', dark: '#313131' },
      },
      ghost: {
        fg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#ebeae5', dark: '#222222' },
        activeBg: { light: '#e6e5e0', dark: '#2c2c2c' },
      },
      danger: { hoverBg: { light: '#bd2850', dark: '#d63f68' }, activeBg: { light: '#a92347', dark: '#c9395f' } },
    },
    // Boxes: a step off the panel, a hairline, 8px corners, no shadow
    card: {
      border: { light: '#ebeae6', dark: '#272727' },
      shadow: 'none',
      hoverShadow: 'none',
      hoverBorder: { light: '#e2e2df', dark: '#333333' },
      hoverTransform: 'none',
      gap: 'var(--m-space-3)',
      padding: { sm: 'var(--m-space-3)', md: 'var(--m-space-4)', lg: 'var(--m-space-5)' },
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-medium)',
      descriptionSize: 'var(--m-font-size-sm)',
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'var(--m-color-border-default)' },
    },
    divider: {
      color: 'var(--m-color-border-default)',
      labelTransform: 'none',
      labelTracking: '0',
    },
    // Inputs: a faint fill, 6px corners, 28px
    input: {
      bg: { light: '#fcfcfa', dark: '#1d1d1d' },
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-border-focus)',
      height: {
        sm: 'calc(24px * var(--m-density))',
        md: 'calc(28px * var(--m-density))',
        lg: 'calc(36px * var(--m-density))',
      },
      paddingX: { sm: 'var(--m-space-2)', md: 'var(--m-space-2)', lg: 'var(--m-space-3)' },
      textareaMinHeight: '72px',
    },
    select: { bg: { light: '#fcfcfa', dark: '#1d1d1d' }, chevronSize: '4px' },
    field: {
      gap: '6px',
      labelFontSize: 'var(--m-font-size-md)',
      labelFontWeight: 'var(--m-font-weight-regular)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    checkbox: { size: '14px', radius: '3px' },
    radio: { size: '14px' },
    // The settings switch: a small green track, a white knob
    switch: {
      width: '32px',
      height: '18px',
      smWidth: '26px',
      smHeight: '15px',
      trackBg: 'var(--m-color-border-strong)',
      trackCheckedBg: { light: '#1f8a65', dark: '#00a561' },
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbShadow: '0 1px 2px rgb(0 0 0 / 0.25)',
    },
    avatar: {
      size: { sm: '20px', md: '24px', lg: '32px' },
      bg: { light: '#e6e5e0', dark: '#2c2c2c' },
      fg: 'var(--m-color-fg-muted)',
      fontWeight: 'var(--m-font-weight-medium)',
      ringWidth: '1.5px',
      groupOverlap: '-4px',
    },
    // Tables sit inside boxes: 12px muted headers in sentence case, hairline rows
    table: {
      bg: 'transparent',
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: 'var(--m-space-3)',
      cellPaddingY: 'calc(var(--m-space-2) + 1px)',
      borderColor: 'var(--m-color-border-default)',
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-regular)',
      headerTransform: 'none',
      headerTracking: '0',
      rowHoverBg: { light: '#efeee9', dark: '#212121' },
      stripeBg: 'var(--m-color-bg-surface)',
      wrapBorder: 'var(--m-color-border-default)',
      wrapRadius: 'var(--m-radius-container)',
    },
    breadcrumb: {
      separator: '"›"',
      fontSize: 'var(--m-font-size-sm)',
      fg: 'var(--m-color-fg-muted)',
      currentWeight: 'var(--m-font-weight-regular)',
    },
    // The public site's bar: 52px on the page colour, 14px links in the text colour, pill actions
    navbar: {
      height: 'calc(52px * var(--m-density))',
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      translucentOpacity: '90%',
      backdropFilter: 'blur(12px)',
      brandFamily: 'var(--m-font-family-display)',
      brandSize: 'var(--m-font-size-lg)',
      brandWeight: 'var(--m-font-weight-medium)',
      link: {
        fontSize: 'var(--m-font-size-lg)',
        fontWeight: 'var(--m-font-weight-regular)',
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
      },
    },
    pagination: {
      radius: 'var(--m-radius-control)',
      fontWeight: 'var(--m-font-weight-regular)',
      border: 'var(--m-color-border-default)',
      hoverBg: { light: '#ebeae5', dark: '#222222' },
      currentBg: 'var(--m-color-accent-subtle)',
      currentFg: 'var(--m-color-fg-default)',
      currentBorder: 'transparent',
    },
    // The side panel: 28px rows at 13px, a grey step with 6px corners for the current one
    sidebar: {
      width: '240px',
      bg: 'var(--m-color-bg-sunken)',
      border: 'var(--m-color-border-default)',
      padding: 'var(--m-space-2)',
      sectionGap: 'var(--m-space-5)',
      itemGap: '1px',
      fontSize: 'var(--m-font-size-md)',
      nestedIndent: 'var(--m-space-5)',
      heading: {
        fg: 'var(--m-color-fg-muted)',
        size: 'var(--m-font-size-sm)',
        weight: 'var(--m-font-weight-regular)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#e9e8e3', dark: '#1f1f1f' },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: '#e3e2dd', dark: '#2a2a2a' },
        activeWeight: 'var(--m-font-weight-regular)',
        radius: 'var(--m-radius-md)',
        paddingX: '8px',
        paddingY: 'calc(6px * var(--m-density))',
      },
      count: { bg: 'transparent', fg: 'var(--m-color-fg-muted)', radius: '4px' },
    },
    // Panel tabs: text with a 14px icon; the current one on a grey chip. Underline is 1px.
    tabs: {
      listGap: '2px',
      height: 'calc(26px * var(--m-density))',
      paddingX: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-fg-default)',
      indicatorWidth: '1px',
      pill: {
        listBg: 'transparent',
        listRadius: '0',
        listPadding: '0',
        radius: 'var(--m-radius-md)',
        activeBg: { light: '#e6e5e0', dark: '#2a2a2a' },
        activeShadow: 'none',
      },
    },
    // Notices: a tinted box with a hairline in the tone, 8px corners, no side stripe
    alert: {
      accentWidth: '0px',
      radius: 'var(--m-radius-container)',
      padding: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    // Tags are small rectangles: 4px corners, 11px text, a tint of the tone
    badge: {
      height: '18px',
      paddingX: '6px',
      radius: 'var(--m-radius-sm)',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-medium)',
      neutral: {
        bg: { light: '#e6e5e0', dark: '#2a2a2a' },
        fg: 'var(--m-color-fg-muted)',
        border: 'transparent',
        solidBg: 'var(--m-color-bg-inverse)',
        solidFg: 'var(--m-color-fg-inverse)',
      },
    },
    // Progress is green, as the app's progress bar
    progress: {
      height: { sm: '3px', md: '4px', lg: '6px' },
      track: { light: '#e6e5e0', dark: '#2a2a2a' },
      fill: 'var(--m-color-success-solid)',
    },
    skeleton: {
      bg: { light: '#ebeae5', dark: '#222222' },
      highlight: { light: '#f2f1ed', dark: '#2a2a2a' },
      radius: 'var(--m-radius-sm)',
      blockRadius: 'var(--m-radius-container)',
    },
    spinner: { thickness: '1.5px', track: 'var(--m-color-border-default)', color: 'var(--m-color-fg-muted)' },
    toast: {
      bg: 'var(--m-color-bg-raised)',
      border: { light: '#e2e2df', dark: '#2e2e2e' },
      accentWidth: '0px',
      radius: 'var(--m-radius-container)',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-medium)',
      width: '352px',
    },
    // Windows and dialogs: 10px corners, a hairline, the long soft drop
    dialog: {
      border: { light: '#e2e2df', dark: '#2e2e2e' },
      radius: '10px',
      padding: 'var(--m-space-4)',
      gap: 'var(--m-space-3)',
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-medium)',
      width: { sm: '384px', md: '512px', lg: '672px' },
      enterTransform: 'scale(0.98)',
    },
    // Menus and pickers: raised, a hairline, 8px corners, 26px rows with keys on the right
    popover: {
      border: { light: '#e2e2df', dark: '#2e2e2e' },
      radius: 'var(--m-radius-container)',
      shadow: 'var(--m-shadow-lg)',
      padding: '4px',
      minWidth: '192px',
      item: {
        height: 'calc(26px * var(--m-density))',
        paddingX: 'var(--m-space-2)',
        radius: '4px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: { light: '#ebeae5', dark: '#2c2c2c' },
      },
      labelFg: 'var(--m-color-fg-muted)',
      labelSize: 'var(--m-font-size-sm)',
      shortcutFg: 'var(--m-color-fg-muted)',
      separator: 'var(--m-color-border-default)',
    },
    tooltip: {
      bg: 'var(--m-color-bg-raised)',
      fg: 'var(--m-color-fg-default)',
      radius: 'var(--m-radius-md)',
      shadow: '0 0 0 1px var(--m-color-border-default), var(--m-shadow-md)',
      paddingX: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
      delay: '400ms',
    },
    accordion: {
      bg: 'transparent',
      border: 'var(--m-color-border-default)',
      radius: 'var(--m-radius-container)',
      paddingX: 'var(--m-space-4)',
      paddingY: 'var(--m-space-4)',
      summarySize: 'var(--m-font-size-lg)',
      summaryWeight: 'var(--m-font-weight-regular)',
      hoverBg: 'transparent',
    },
    // Code in the mono on a box one step off the panel; the app's syntax hues
    code: {
      bg: { light: '#f2f1ed', dark: '#141414' },
      border: 'var(--m-color-border-default)',
      radius: 'var(--m-radius-md)',
      fontSize: 'var(--m-font-size-sm)',
      inlineBg: { light: '#ebeae5', dark: '#262626' },
      inlineBorder: 'transparent',
      inlineRadius: '4px',
      comment: 'var(--m-color-fg-muted)',
      keyword: { light: '#a8003b', dark: '#82d2ce' },
      string: { light: '#1e6090', dark: '#e394dc' },
      function: { light: '#a8492a', dark: '#efb080' },
      constant: { light: '#a23c7a', dark: '#ebc88d' },
    },
    // Key hints are quiet: the UI face at 11px, muted, on a faint grey
    kbd: {
      fontFamily: 'var(--m-font-body-family)',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-regular)',
      bg: { light: '#ebeae5', dark: '#262626' },
      fg: 'var(--m-color-fg-muted)',
      border: 'transparent',
      radius: '4px',
      shadow: 'none',
      height: '1.5em',
      paddingX: '0.4em',
    },
    prose: {
      maxWidth: '640px',
      fontSize: 'var(--m-font-size-md)',
      lineHeight: 'var(--m-font-leading-relaxed)',
      h1Size: 'var(--m-font-size-2xl)',
      h2Size: 'var(--m-font-size-xl)',
      h3Size: 'var(--m-font-size-lg)',
      h2Border: 'transparent',
      linkDecoration: 'none',
      quoteBorderWidth: '2px',
      tableHeaderBg: 'transparent',
    },
    // The agent thread: the person's message in a box, the agent's turns as plain text
    chat: {
      gap: 'var(--m-space-3)',
      radius: 'var(--m-radius-container)',
      userBg: { light: '#fcfcfa', dark: '#212121' },
      userBorder: 'var(--m-color-border-default)',
      assistantBg: 'transparent',
      assistantBorder: 'transparent',
      avatarSize: '20px',
      avatarBg: { light: '#e6e5e0', dark: '#2c2c2c' },
      avatarFg: 'var(--m-color-fg-muted)',
      assistantAvatarBg: 'var(--m-color-accent-default)',
      assistantAvatarFg: 'var(--m-color-accent-fg)',
      metaFontSize: 'var(--m-font-size-xs)',
    },
    citation: {
      chipBg: { light: '#e6e5e0', dark: '#2a2a2a' },
      chipFg: 'var(--m-color-fg-muted)',
      chipRadius: '4px',
      sourceBg: 'var(--m-color-bg-raised)',
      sourceRadius: 'var(--m-radius-container)',
    },
    // The composer: a 12px-cornered box with a hairline; model picker and a round send at the bottom
    composer: {
      bg: { light: '#fcfcfa', dark: '#1e1e1e' },
      // The reference's edge is a hairline; a composer is a control, so it takes the 3:1 control edge
      border: 'var(--m-color-border-strong)',
      radius: 'var(--m-radius-lg)',
      shadow: 'none',
      padding: '10px',
      fontSize: 'var(--m-font-size-md)',
      modelFg: 'var(--m-color-fg-muted)',
    },
    thinking: { fontSize: 'var(--m-font-size-md)', fontStyle: 'normal', ruleWidth: '1px' },
    toolCall: {
      bg: 'var(--m-color-bg-surface)',
      radius: 'var(--m-radius-container)',
      summaryHeight: 'calc(28px * var(--m-density))',
      fontSize: 'var(--m-font-size-sm)',
      nameFamily: 'var(--m-font-body-family)',
      nameWeight: 'var(--m-font-weight-regular)',
      statusRadius: 'var(--m-radius-sm)',
    },
    usage: {
      height: '4px',
      track: { light: '#e6e5e0', dark: '#2a2a2a' },
      okFill: 'var(--m-color-success-solid)',
      warnFill: { light: '#a16900', dark: '#d2943e' },
      overFill: 'var(--m-color-danger-solid)',
      fontSize: 'var(--m-font-size-md)',
    },
  },
});
