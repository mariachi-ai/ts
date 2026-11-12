import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Kite: a dark-first canvas tool for people who make websites. Near-black panels a step apart, filled
 * controls, a compact 12px UI type, 30px rows and inputs with 8px corners, one bright
 * blue for selection and the publish action, segmented controls with a lifted grey thumb, and bold
 * public pages: huge tight display type on black, white and translucent buttons, glows drawn from
 * tokens. A light theme with the same structure. Category: playful. The values are measured or
 * published, not invented (see DESIGN.md).
 */
export const kite = extendTheme(minimal, {
  name: 'kite',
  label: 'Kite',
  description:
    'Dark-first and compact: near-black panels, filled 30px controls, 12px UI type, one bright blue for selection and publish, and huge tight display type on black.',
  tokens: {
    color: {
      bg: {
        // The panels (layers, properties, toolbar); cards and inputs a step up; menus a step more
        canvas: { light: '#ffffff', dark: '#111111' },
        surface: { light: '#f5f5f5', dark: '#1f1f1f' },
        raised: { light: '#ffffff', dark: '#242424' },
        // The public site's black, and the light twin's faint grey
        sunken: { light: '#fafafa', dark: '#000000' },
        overlay: { light: 'rgb(0 0 0 / 0.3)', dark: 'rgb(0 0 0 / 0.6)' },
        inverse: { light: '#111111', dark: '#ffffff' },
      },
      fg: {
        default: { light: '#000000', dark: '#ffffff' },
        muted: { light: '#666666', dark: '#999999' },
        // The reference's tertiary grey (#999 light, #666 dark) is under 4.5:1; nearest steps that pass
        subtle: { light: '#6e6e6e', dark: '#888888' },
        inverse: { light: '#ffffff', dark: '#000000' },
      },
      border: {
        // Panel dividers and menu separators; marketing hairlines are white at 10% over black
        default: { light: '#ebebeb', dark: '#2a2a2a' },
        muted: { light: '#f3f3f3', dark: '#1f1f1f' },
        // Control borders: the reference draws none on its filled inputs; the floor needs a 3:1 line
        strong: { light: '#8a8a8a', dark: '#707070' },
        // Selection blue; the light twin takes a step darker to reach 3:1 on white
        focus: { light: '#0088ee', dark: '#0099ff' },
      },
      accent: {
        // The reference's blue (#0099ff) carries white at 3:1; the nearest step that carries it at 4.5:1
        default: { light: '#0077d4', dark: '#0077d4' },
        hover: { light: '#0070c8', dark: '#0070c8' },
        active: { light: '#0066b8', dark: '#0066b8' },
        // The breakpoint chip: the blue at 10% over the panel
        subtle: { light: '#e5f5ff', dark: '#0f1f29' },
        fg: '#ffffff',
        text: { light: '#006bbd', dark: '#0099ff' },
      },
      // The signature blue itself: selection outlines, frame labels, the logo tile, glows
      brand: {
        default: { light: '#0099ff', dark: '#0099ff' },
        fg: '#000000',
        subtle: { light: '#e5f5ff', dark: '#0f1f29' },
      },
      success: {
        bg: { light: '#e5f8f3', dark: '#0f2a22' },
        fg: { light: '#00775a', dark: '#00bb88' },
        // Chips and callouts are tints with no ring: the border is the tint itself
        border: { light: '#e5f8f3', dark: '#0f2a22' },
        solid: { light: '#00bb88', dark: '#00bb88' },
        onSolid: '#000000',
      },
      warning: {
        bg: { light: '#fff6e0', dark: '#2a2210' },
        fg: { light: '#8a5a00', dark: '#ffaa00' },
        border: { light: '#fff6e0', dark: '#2a2210' },
        solid: { light: '#ffaa00', dark: '#ffaa00' },
        onSolid: '#000000',
      },
      danger: {
        bg: { light: '#ffeef0', dark: '#2c1418' },
        fg: { light: '#c22a3f', dark: '#ff5566' },
        border: { light: '#ffeef0', dark: '#2c1418' },
        // #ff3355 carries white at 3.4:1; the nearest red that carries it at 4.5:1
        solid: { light: '#d92040', dark: '#d92040' },
        onSolid: '#ffffff',
      },
      info: {
        bg: { light: '#e5f5ff', dark: '#0f1f29' },
        fg: { light: '#006bbd', dark: '#0099ff' },
        border: { light: '#e5f5ff', dark: '#0f1f29' },
        solid: { light: '#0099ff', dark: '#0099ff' },
        onSolid: '#000000',
      },
      selection: {
        bg: { light: '#cce9ff', dark: '#0077d4' },
        fg: { light: '#000000', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // The reference's UI face (open); the display face is the nearest open geometric to its own
        sans: '"Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        display: '"DM Sans Variable", "DM Sans", "Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif',
        mono: '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace',
      },
      // The editor's 11/12/13px UI, 15–18px reading and plan names, 24px titles, 44 and 54px display
      size: {
        xs: '0.6875rem',
        sm: '0.75rem',
        md: '0.8125rem',
        lg: '0.9375rem',
        xl: '1.125rem',
        '2xl': '1.5rem',
        '3xl': '2.75rem',
        '4xl': '3.375rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.1', normal: '1.4', relaxed: '1.6' },
      tracking: { tight: '-0.04em', normal: '0', wide: '0.02em' },
      body: { weight: '400' },
      heading: { family: 'var(--m-font-family-sans)', weight: '600', tracking: '-0.01em' },
    },
    control: {
      // 24, 30 and 34px: the editor's 30px controls, and the public site's 34px buttons
      height: {
        sm: 'calc(1.5rem * var(--m-density))',
        md: 'calc(1.875rem * var(--m-density))',
        lg: 'calc(2.125rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.5rem * var(--m-density))',
        md: 'calc(0.625rem * var(--m-density))',
        lg: 'calc(0.875rem * var(--m-density))',
      },
      fontSize: 'var(--m-font-size-sm)',
    },
    // 5px chips, 8px controls and rows, 15px cards, 18px dialogs and the floating toolbar
    radius: { sm: '5px', md: '8px', lg: '15px', control: '8px', container: '15px' },
    shadow: {
      // Dark panels separate by a step of grey; shadows lift menus, dialogs and the floating toolbar
      sm: { light: '0 1px 2px rgb(0 0 0 / 0.1)', dark: '0 1px 2px rgb(0 0 0 / 0.25)' },
      md: {
        light: '0 1px 2px rgb(0 0 0 / 0.05), 0 10px 20px rgb(0 0 0 / 0.05)',
        dark: '0 10px 20px rgb(0 0 0 / 0.05)',
      },
      lg: {
        light: '0 0 0 1px rgb(0 0 0 / 0.05), 0 2px 6px rgb(0 0 0 / 0.08), 0 10px 30px rgb(0 0 0 / 0.1)',
        dark: '0 2px 6px rgb(0 0 0 / 0.2), 0 10px 30px rgb(0 0 0 / 0.4)',
      },
      overlay: {
        light: '0 0 0 1px rgb(0 0 0 / 0.05), 0 10px 20px rgb(0 0 0 / 0.1), 0 30px 60px rgb(0 0 0 / 0.15)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.06), 0 10px 20px rgb(0 0 0 / 0.3), 0 30px 60px rgb(0 0 0 / 0.5)',
      },
    },
    focus: { width: '2px', offset: '1px' },
    motion: {
      // Hovers are quick; opening and moving things use a spring-like overshoot
      duration: { fast: '150ms', normal: '300ms', slow: '500ms' },
      easing: { standard: 'cubic-bezier(0.44, 0, 0.56, 1)', emphasized: 'cubic-bezier(0.34, 1.36, 0.64, 1)' },
    },
  },
  components: {
    // A 260px panel beside the work; settings read in a 42rem column; the public site is 1200px wide
    layout: {
      containerMax: { sm: '30rem', md: '42rem', lg: '75rem' },
      containerPadding: 'clamp(1rem, 4vw, 2rem)',
      gridGap: 'var(--m-space-3)',
      gridMin: '15rem',
      splitSide: '16.25rem',
      stackGap: 'var(--m-space-3)',
      clusterGap: 'var(--m-space-2)',
    },
    // Filled rectangles with 8px corners and no border: blue for publish, a grey step for the rest
    button: {
      fontWeight: 'var(--m-font-weight-semibold)',
      radius: 'var(--m-radius-md)',
      gap: '6px',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      activeTransform: 'scale(0.97)',
      primary: {
        shadow: '0 1px 2px rgb(0 153 255 / 0.15), 0 2px 4px rgb(0 153 255 / 0.2)',
        hoverShadow: '0 1px 2px rgb(0 153 255 / 0.15), 0 2px 4px rgb(0 153 255 / 0.2)',
        activeShadow: 'none',
      },
      secondary: {
        bg: { light: '#f0f0f0', dark: '#242424' },
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        hoverBg: { light: '#e8e8e8', dark: '#2e2e2e' },
        activeBg: { light: '#e0e0e0', dark: '#333333' },
      },
      ghost: {
        fg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#f0f0f0', dark: '#1f1f1f' },
        activeBg: { light: '#e8e8e8', dark: '#242424' },
      },
      danger: { hoverBg: { light: '#c81c3a', dark: '#c81c3a' }, activeBg: { light: '#b51834', dark: '#b51834' } },
    },
    // Cards are a grey step with 15px corners and no line; the canvas well is a lighter grey
    card: {
      border: 'transparent',
      shadow: 'none',
      hoverShadow: 'none',
      hoverBorder: 'transparent',
      hoverTransform: 'none',
      gap: 'var(--m-space-3)',
      padding: { sm: 'var(--m-space-3)', md: 'var(--m-space-4)', lg: 'var(--m-space-6)' },
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
      descriptionSize: 'var(--m-font-size-sm)',
      outline: { bg: 'transparent', border: { light: '#ebebeb', dark: 'rgb(255 255 255 / 0.1)' } },
      sunken: { bg: { light: '#f3f3f3', dark: '#171717' }, border: 'transparent' },
    },
    divider: {
      color: 'var(--m-color-border-default)',
      labelTransform: 'none',
      labelTracking: '0',
    },
    // Inputs are filled boxes; the reference has no border until focus draws the blue, but the
    // contrast floor needs a 3:1 control line, so they take the strong grey
    input: {
      bg: { light: '#f3f3f3', dark: '#242424' },
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: '#666666', dark: '#999999' },
      placeholder: { light: '#6e6e6e', dark: '#999999' },
      focusBorder: 'var(--m-color-border-focus)',
      disabledBg: 'var(--m-color-bg-surface)',
      shadow: 'none',
      height: {
        sm: 'calc(1.5rem * var(--m-density))',
        md: 'calc(1.875rem * var(--m-density))',
        lg: 'calc(2.125rem * var(--m-density))',
      },
      paddingX: { sm: 'var(--m-space-2)', md: '0.625rem', lg: 'var(--m-space-3)' },
      textareaMinHeight: '4.5rem',
    },
    select: {
      bg: { light: '#f3f3f3', dark: '#242424' },
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: '#666666', dark: '#999999' },
      focusBorder: 'var(--m-color-border-focus)',
      disabledBg: 'var(--m-color-bg-surface)',
      shadow: 'none',
      chevronSize: '0.25rem',
    },
    // Property rows: the label left in a light grey, the control right; stacked fields elsewhere
    field: {
      gap: '6px',
      labelFg: { light: '#333333', dark: '#cccccc' },
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-medium)',
      hintFontSize: 'var(--m-font-size-xs)',
      errorFontWeight: 'var(--m-font-weight-medium)',
    },
    checkbox: {
      size: '0.875rem',
      radius: '4px',
      border: 'var(--m-color-border-strong)',
      bg: { light: '#f3f3f3', dark: '#242424' },
      // The signature blue carries white at 3:1 only; checked controls take the action blue
      checkedBg: 'var(--m-color-accent-default)',
      checkedBorder: 'var(--m-color-accent-default)',
      mark: '#ffffff',
    },
    radio: {
      size: '0.875rem',
      border: 'var(--m-color-border-strong)',
      bg: { light: '#f3f3f3', dark: '#242424' },
      checkedBg: 'var(--m-color-accent-default)',
      checkedBorder: 'var(--m-color-accent-default)',
      dot: '#ffffff',
    },
    // The public site's billing toggle: a small blue track, a white knob
    switch: {
      width: '1.75rem',
      height: '1rem',
      smWidth: '1.5rem',
      smHeight: '0.875rem',
      trackBg: 'var(--m-color-border-strong)',
      trackCheckedBg: 'var(--m-color-accent-default)',
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbShadow: '0 1px 2px rgb(0 0 0 / 0.25)',
    },
    avatar: {
      size: { sm: '1.25rem', md: '1.5rem', lg: '2rem' },
      bg: { light: '#e5f5ff', dark: '#0f1f29' },
      fg: 'var(--m-color-accent-text)',
      fontWeight: 'var(--m-font-weight-semibold)',
      ringColor: 'var(--m-color-bg-canvas)',
      ringWidth: '2px',
      groupOverlap: '-0.375rem',
    },
    // Collections: 13px rows split by hairlines, a quiet 13px header in grey, no outer frame
    table: {
      bg: 'transparent',
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: 'var(--m-space-4)',
      cellPaddingY: 'var(--m-space-4)',
      borderColor: 'var(--m-color-border-muted)',
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-md)',
      headerFontWeight: 'var(--m-font-weight-medium)',
      headerTransform: 'none',
      headerTracking: '0',
      rowHoverBg: { light: '#fafafa', dark: '#171717' },
      stripeBg: 'transparent',
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    breadcrumb: {
      separator: '"/"',
      fontSize: 'var(--m-font-size-sm)',
      fg: 'var(--m-color-fg-muted)',
      currentFg: 'var(--m-color-fg-default)',
      currentWeight: 'var(--m-font-weight-medium)',
    },
    // The public site's bar: 64px on black, 14px links at 80%, a white "Sign up" and a muted "Log in"
    navbar: {
      height: 'calc(4rem * var(--m-density))',
      // The bar's content sits in the same 1200px column as the page
      paddingX: 'max(var(--m-space-4), calc((100% - 75rem) / 2))',
      bg: 'var(--m-color-bg-sunken)',
      border: 'transparent',
      translucentOpacity: '80%',
      backdropFilter: 'blur(20px)',
      brandFamily: 'var(--m-font-body-family)',
      brandSize: '0.875rem',
      brandWeight: 'var(--m-font-weight-semibold)',
      link: {
        height: 'calc(1.875rem * var(--m-density))',
        fontSize: '0.875rem',
        fontWeight: 'var(--m-font-weight-regular)',
        fg: { light: 'rgb(0 0 0 / 0.8)', dark: 'rgb(255 255 255 / 0.8)' },
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
      },
    },
    pagination: {
      radius: 'var(--m-radius-md)',
      fontWeight: 'var(--m-font-weight-medium)',
      border: 'transparent',
      hoverBg: 'var(--m-color-bg-surface)',
      currentBg: { light: '#f0f0f0', dark: '#242424' },
      currentFg: 'var(--m-color-fg-default)',
      currentBorder: 'transparent',
    },
    // The pages panel: 30px rows, 12px labels in grey, the current one white on a grey step
    sidebar: {
      width: '16.25rem',
      bg: 'var(--m-color-bg-canvas)',
      border: 'var(--m-color-border-muted)',
      padding: 'var(--m-space-2) var(--m-space-3)',
      sectionGap: 'var(--m-space-3)',
      itemGap: '0',
      fontSize: 'var(--m-font-size-sm)',
      nestedIndent: '1.25rem',
      heading: {
        fg: 'var(--m-color-fg-default)',
        size: 'var(--m-font-size-sm)',
        weight: 'var(--m-font-weight-medium)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: '#f3f3f3', dark: '#1f1f1f' },
        activeWeight: 'var(--m-font-weight-regular)',
        radius: '8px',
        paddingX: '0.625rem',
        paddingY: 'calc(0.4375rem * var(--m-density))',
      },
      count: { bg: 'transparent', fg: 'var(--m-color-fg-muted)', radius: '4px' },
    },
    // Segmented controls: a grey track, the current option on a lighter grey thumb
    tabs: {
      listGap: '2px',
      height: 'calc(1.875rem * var(--m-density))',
      paddingX: '0.625rem',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-fg-default)',
      indicatorWidth: '1px',
      pill: {
        listBg: { light: '#f3f3f3', dark: '#242424' },
        listRadius: 'var(--m-radius-md)',
        listPadding: '2px',
        radius: '6px',
        activeBg: { light: '#ffffff', dark: '#484848' },
        activeShadow: { light: '0 1px 2px rgb(0 0 0 / 0.1)', dark: 'none' },
      },
    },
    // Callouts: a grey step, 10px corners, a tone in the icon and title; no stripe
    alert: {
      bg: 'var(--m-color-bg-surface)',
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '10px',
      padding: 'var(--m-space-3) var(--m-space-4)',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // Chips: 5px corners, 10–11px medium text on a 10% tint of the hue
    badge: {
      height: '1.125rem',
      paddingX: '0.3125rem',
      radius: 'var(--m-radius-sm)',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-medium)',
      neutral: {
        bg: { light: '#f0f0f0', dark: '#242424' },
        fg: 'var(--m-color-fg-muted)',
        border: 'transparent',
        solidBg: { light: '#000000', dark: '#ffffff' },
        solidFg: { light: '#ffffff', dark: '#000000' },
      },
    },
    progress: {
      height: { sm: '0.125rem', md: '0.25rem', lg: '0.375rem' },
      track: { light: '#ebebeb', dark: '#2e2e2e' },
      // The signature blue in dark; the action blue in light, where #0099ff is under 3:1
      fill: { light: '#0077d4', dark: '#0099ff' },
    },
    skeleton: {
      bg: { light: '#f0f0f0', dark: '#1f1f1f' },
      highlight: { light: '#f7f7f7', dark: '#2a2a2a' },
      radius: 'var(--m-radius-sm)',
      blockRadius: 'var(--m-radius-lg)',
    },
    spinner: { thickness: '1.5px', track: 'var(--m-color-border-default)', color: 'var(--m-color-fg-default)' },
    toast: {
      bg: 'var(--m-color-bg-raised)',
      border: 'transparent',
      accentWidth: '0px',
      radius: '12px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-semibold)',
      width: '20rem',
    },
    // Dialogs: one step off the panel, 18px corners, a 15px title bar split by a hairline
    dialog: {
      bg: { light: '#ffffff', dark: '#171717' },
      border: 'transparent',
      radius: '18px',
      padding: 'var(--m-space-5)',
      gap: 'var(--m-space-4)',
      backdrop: 'var(--m-color-bg-overlay)',
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
      width: { sm: '22.5rem', md: '32.5rem', lg: '45rem' },
      enterTransform: 'scale(0.96)',
    },
    // Menus: raised grey, 12px corners, 30px rows with 8px corners, a lighter grey for the hovered row
    popover: {
      border: 'transparent',
      radius: '12px',
      shadow: 'var(--m-shadow-lg)',
      padding: '5px',
      minWidth: '10rem',
      item: {
        height: 'calc(1.875rem * var(--m-density))',
        paddingX: '0.625rem',
        radius: 'var(--m-radius-md)',
        fontSize: 'var(--m-font-size-sm)',
        hoverBg: { light: '#f0f0f0', dark: '#333333' },
      },
      labelFg: 'var(--m-color-fg-muted)',
      separator: 'var(--m-color-border-default)',
    },
    tooltip: {
      bg: { light: '#111111', dark: '#333333' },
      fg: '#ffffff',
      radius: 'var(--m-radius-md)',
      shadow: 'var(--m-shadow-lg)',
      paddingX: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-medium)',
      delay: '400ms',
    },
    // The public site's questions: 18px white over 16px grey answers; no lines, no fill
    accordion: {
      bg: 'transparent',
      border: 'transparent',
      radius: '0',
      paddingX: '0',
      paddingY: 'var(--m-space-4)',
      summarySize: 'var(--m-font-size-xl)',
      summaryWeight: 'var(--m-font-weight-regular)',
      hoverBg: 'transparent',
      contentFg: 'var(--m-color-fg-muted)',
    },
    code: {
      bg: { light: '#f3f3f3', dark: '#171717' },
      radius: '10px',
      fontSize: 'var(--m-font-size-sm)',
      inlineBg: { light: '#f0f0f0', dark: '#242424' },
      inlineBorder: 'transparent',
      inlineRadius: '4px',
      comment: 'var(--m-color-fg-muted)',
      keyword: 'var(--m-color-accent-text)',
      function: 'var(--m-color-success-fg)',
    },
    kbd: {
      fontFamily: 'var(--m-font-body-family)',
      fontWeight: 'var(--m-font-weight-medium)',
      bg: { light: '#f0f0f0', dark: '#2e2e2e' },
      fg: 'var(--m-color-fg-muted)',
      border: 'transparent',
      radius: '4px',
      shadow: 'none',
      height: '1.5em',
      paddingX: '0.35em',
    },
    prose: {
      maxWidth: '42rem',
      fontSize: 'var(--m-font-size-xl)',
      lineHeight: 'var(--m-font-leading-relaxed)',
      linkDecoration: 'underline',
      quoteBorderWidth: '2px',
      tableHeaderBg: 'transparent',
    },
    // The agent panel: the person's message in a grey card, the agent's turns as plain text
    chat: {
      gap: 'var(--m-space-3)',
      radius: 'var(--m-radius-lg)',
      userBg: 'var(--m-color-bg-surface)',
      userBorder: 'transparent',
      assistantBg: 'transparent',
      assistantBorder: 'transparent',
      avatarSize: '1.25rem',
      avatarBg: { light: '#f0f0f0', dark: '#242424' },
      avatarFg: 'var(--m-color-fg-default)',
      assistantAvatarBg: 'var(--m-color-brand-default)',
      assistantAvatarFg: '#000000',
      metaFg: 'var(--m-color-fg-subtle)',
    },
    citation: {
      chipBg: { light: '#f0f0f0', dark: '#242424' },
      chipFg: 'var(--m-color-fg-default)',
      chipRadius: '4px',
      sourceBg: 'var(--m-color-bg-raised)',
      sourceRadius: '12px',
      domainFg: 'var(--m-color-fg-muted)',
    },
    composer: {
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-strong)',
      focusBorder: 'var(--m-color-border-focus)',
      radius: 'var(--m-radius-lg)',
      shadow: 'none',
      padding: '10px',
      fontSize: 'var(--m-font-size-sm)',
    },
    thinking: { fontSize: 'var(--m-font-size-sm)', ruleWidth: '1px' },
    toolCall: {
      bg: 'var(--m-color-bg-surface)',
      border: 'transparent',
      radius: '10px',
      summaryHeight: 'calc(1.875rem * var(--m-density))',
      fontSize: 'var(--m-font-size-sm)',
      statusRadius: 'var(--m-radius-sm)',
    },
    usage: {
      height: '0.25rem',
      track: { light: '#ebebeb', dark: '#2e2e2e' },
      okFill: { light: '#0077d4', dark: '#0099ff' },
      warnFill: 'var(--m-color-warning-fg)',
      overFill: 'var(--m-color-danger-fg)',
      fontSize: 'var(--m-font-size-sm)',
    },
  },
});
