import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Meridian: stark and exact. Black and white with one published ten-step grey scale, dark mode as
 * a first-class twin, hairline borders and rings instead of fills, small radii, dense 14px lists,
 * coloured status dots, monospace for hashes, URLs and logs, and a restrained blue kept for focus
 * and links. The primary action is the darkest grey in light mode and the lightest in dark.
 * Category: dark and sharp. The values are published or measured, not invented (see DESIGN.md).
 */
export const meridian = extendTheme(minimal, {
  name: 'meridian',
  label: 'Meridian',
  description:
    'Stark and exact: black and white on a ten-step grey scale, hairline rings, 6px corners, dense 14px lists, status dots, mono for hashes and logs, and blue only for focus and links.',
  tokens: {
    color: {
      bg: {
        // background-100 is the content and every card; background-200 the sidebar, wells and footers
        canvas: { light: '#ffffff', dark: '#0a0a0a' },
        surface: { light: '#ffffff', dark: '#0a0a0a' },
        raised: { light: '#ffffff', dark: '#0a0a0a' },
        sunken: { light: '#fafafa', dark: '#000000' },
        // The published backdrop: grey-100 at 80% in light, background-200 at 80% in dark
        overlay: { light: 'rgb(242 242 242 / 0.8)', dark: 'rgb(0 0 0 / 0.8)' },
        // Tooltips invert the mode
        inverse: { light: '#0a0a0a', dark: '#ffffff' },
      },
      fg: {
        // grey-1000 and grey-900
        default: { light: '#171717', dark: '#ededed' },
        muted: { light: '#4d4d4d', dark: '#a1a1a1' },
        // grey-700 in dark; in light grey-700 (#8f8f8f) is 3.3:1, so the nearest grey that reaches 4.5:1
        subtle: { light: '#737373', dark: '#8f8f8f' },
        inverse: { light: '#ededed', dark: '#171717' },
      },
      border: {
        // grey-alpha-400 over the background (#00000014, #ffffff24), flattened
        default: { light: '#ebebeb', dark: '#2e2e2e' },
        muted: { light: '#f2f2f2', dark: '#1f1f1f' },
        // Control borders must reach 3:1: grey-700 in light, grey-600 in dark (the published hover
        // and active border steps); the reference's resting control ring is the faint grey-alpha-400
        strong: { light: '#8f8f8f', dark: '#878787' },
        // blue-700, the published focus colour
        focus: { light: '#0072f5', dark: '#0072f5' },
      },
      accent: {
        // The primary action is grey-1000: near-black in light, near-white in dark
        default: { light: '#171717', dark: '#ededed' },
        hover: { light: '#383838', dark: '#cccccc' },
        active: { light: '#4d4d4d', dark: '#a1a1a1' },
        subtle: { light: '#f2f2f2', dark: '#1a1a1a' },
        fg: { light: '#ffffff', dark: '#0a0a0a' },
        // Links are blue: blue-900 (the scale's text step) in both modes
        text: { light: '#0068d6', dark: '#52a8ff' },
      },
      // Subtle tones are the 200 step with 900 text and a 400 border; solids are the status-dot colours
      success: {
        bg: { light: '#ebfaeb', dark: '#0f2e18' },
        fg: { light: '#297a3a', dark: '#62c073' },
        border: { light: '#c6f1c7', dark: '#0c451b' },
        // The "ready" dot: a bright cyan-green that only ever carries dark text
        solid: { light: '#50e3c2', dark: '#50e3c2' },
        onSolid: '#0a0a0a',
      },
      warning: {
        bg: { light: '#fff4d6', dark: '#331b00' },
        fg: { light: '#a35200', dark: '#f2a20d' },
        border: { light: '#ffdd8f', dark: '#573300' },
        // The "building" dot
        solid: { light: '#f5a623', dark: '#f5a623' },
        onSolid: '#0a0a0a',
      },
      danger: {
        bg: { light: '#ffebeb', dark: '#3c1618' },
        fg: { light: '#cb2a2f', dark: '#ff6166' },
        border: { light: '#fdd8d8', dark: '#671e21' },
        // red-800, the error button; the error dot (#ee0000) is close and white text needs this step
        solid: { light: '#da2f35', dark: '#da2f35' },
        onSolid: '#ffffff',
      },
      info: {
        bg: { light: '#ebf5ff', dark: '#10233d' },
        fg: { light: '#0068d6', dark: '#52a8ff' },
        border: { light: '#cce6ff', dark: '#0d3868' },
        // blue-700 carries white at 4.45:1; blue-900 is the nearest step that reaches 4.5:1
        solid: { light: '#0068d6', dark: '#0068d6' },
        onSolid: '#ffffff',
      },
      // The published selection: grey-1000 with grey-100 text
      selection: {
        bg: { light: '#171717', dark: '#ededed' },
        fg: { light: '#f2f2f2', dark: '#1a1a1a' },
      },
    },
    font: {
      family: {
        // The reference's own open faces (SIL OFL), self-hosted
        sans: '"Geist", "Geist Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
        display: '"Geist", "Geist Variable", ui-sans-serif, system-ui, sans-serif',
        mono: '"Geist Mono", "Geist Mono Variable", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
      },
      // The published scale: label 12 and 13, copy 14, label 16, headings 20, 24, 32 and 48
      size: {
        xs: '0.75rem',
        sm: '0.8125rem',
        md: '0.875rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '3rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      // copy-14 is 14/20, headings 24/32 and 32/40, copy-16 16/24
      leading: { tight: '1.25', normal: '1.43', relaxed: '1.6' },
      // Headings track in: -0.02em at 14 to 20px, -0.04em at 24 and 32px, -0.06em on marketing sizes
      tracking: { tight: '-0.04em', normal: '0', wide: '0.02em' },
      body: { weight: '400' },
      heading: { weight: '600', tracking: '-0.02em' },
    },
    control: {
      // 32, 36 and 40px controls; the label is copy-14
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(2.25rem * var(--m-density))',
        lg: 'calc(2.5rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.25rem * var(--m-density))',
      },
      fontSize: '0.875rem',
    },
    // Published radii: 4px small parts, 6px controls and base surfaces, 12px menus and dialogs
    radius: { sm: '4px', md: '6px', lg: '12px', control: '6px', container: '8px' },
    shadow: {
      // Shadows are faint: separation comes from a 1px ring; in dark, from the ring alone
      sm: { light: '0 1px 2px rgb(0 0 0 / 0.04)', dark: '0 1px 2px rgb(0 0 0 / 0.16)' },
      md: { light: '0 2px 2px rgb(0 0 0 / 0.04)', dark: '0 2px 2px rgb(0 0 0 / 0.32), 0 8px 8px -8px rgb(0 0 0 / 0.16)' },
      lg: {
        light: '0 1px 1px rgb(0 0 0 / 0.02), 0 4px 8px -4px rgb(0 0 0 / 0.04), 0 16px 24px -8px rgb(0 0 0 / 0.06)',
        dark: '0 1px 1px rgb(0 0 0 / 0.02), 0 4px 8px -4px rgb(0 0 0 / 0.04), 0 16px 24px -8px rgb(0 0 0 / 0.06)',
      },
      overlay: {
        light: '0 32px 72px -12px rgb(0 0 0 / 0.06), 0 8px 32px -12px rgb(0 0 0 / 0.08), 0 8px 24px -12px rgb(0 0 0 / 0.12)',
        dark: '0 32px 72px -12px rgb(0 0 0 / 0.06), 0 8px 32px -12px rgb(0 0 0 / 0.08), 0 8px 24px -12px rgb(0 0 0 / 0.12)',
      },
    },
    // The published ring: 2px of the background, then 2px of blue
    focus: { width: '2px', offset: '2px' },
    motion: {
      duration: { fast: '150ms', normal: '200ms', slow: '300ms' },
      easing: { standard: 'cubic-bezier(0.4, 0, 0.2, 1)', emphasized: 'cubic-bezier(0.175, 0.885, 0.32, 1.1)' },
    },
  },
  components: {
    // A 256px sidebar beside the content; pages to 1200px with a 24px margin, settings to 64rem
    layout: {
      containerMax: { sm: '30rem', md: '64rem', lg: '75rem' },
      containerPadding: 'clamp(1rem, 3vw, 1.5rem)',
      gridGap: 'var(--m-space-6)',
      gridMin: '18rem',
      splitSide: '16rem',
      stackGap: 'var(--m-space-4)',
      clusterGap: 'var(--m-space-2)',
    },
    // Rectangles, 6px corners: grey-1000 for the one action, a background-100 box with a hairline ring
    // for the rest, text-only for tertiary
    button: {
      fontWeight: 'var(--m-font-weight-medium)',
      radius: 'var(--m-radius-control)',
      gap: '6px',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      secondary: {
        bg: 'var(--m-color-bg-surface)',
        fg: 'var(--m-color-fg-default)',
        border: { light: '#ebebeb', dark: '#2e2e2e' },
        hoverBg: { light: '#f2f2f2', dark: '#1a1a1a' },
        activeBg: { light: '#ebebeb', dark: '#1f1f1f' },
      },
      ghost: {
        fg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#ebebeb', dark: '#1f1f1f' },
        activeBg: { light: '#e6e6e6', dark: '#292929' },
      },
      danger: {
        hoverBg: { light: '#cb2a2f', dark: '#cb2a2f' },
        activeBg: { light: '#b8262b', dark: '#b8262b' },
      },
    },
    // Cards: background-100, a hairline ring, 8px corners, a faint drop in light only
    card: {
      border: 'var(--m-color-border-default)',
      shadow: 'var(--m-shadow-sm)',
      hoverShadow: 'var(--m-shadow-md)',
      hoverBorder: { light: '#c9c9c9', dark: '#454545' },
      hoverTransform: 'none',
      gap: 'var(--m-space-3)',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-6)', lg: 'var(--m-space-8)' },
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-semibold)',
      descriptionSize: 'var(--m-font-size-md)',
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'var(--m-color-border-default)' },
    },
    divider: {
      color: 'var(--m-color-border-default)',
      labelTransform: 'none',
      labelTracking: '0',
      labelFontSize: 'var(--m-font-size-sm)',
    },
    input: {
      bg: 'var(--m-color-bg-surface)',
      hoverBorder: { light: '#4d4d4d', dark: '#a1a1a1' },
      focusBorder: 'var(--m-color-fg-default)',
      shadow: 'none',
      disabledBg: { light: '#f2f2f2', dark: '#1a1a1a' },
      disabledOpacity: '0.75',
      paddingX: { sm: 'var(--m-space-3)', md: 'var(--m-space-3)', lg: 'var(--m-space-3)' },
      textareaMinHeight: '6.25rem',
    },
    select: {
      hoverBorder: { light: '#4d4d4d', dark: '#a1a1a1' },
      focusBorder: 'var(--m-color-fg-default)',
      disabledBg: { light: '#f2f2f2', dark: '#1a1a1a' },
      chevronSize: '0.3rem',
    },
    // Labels are 13px grey above the control; errors are red 13px with an icon
    field: {
      gap: 'var(--m-space-2)',
      labelFg: 'var(--m-color-fg-muted)',
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-regular)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    // 16px boxes with 4px corners; checked is grey-1000 with a background-100 mark
    checkbox: {
      size: '1rem',
      radius: '4px',
      checkedBg: 'var(--m-color-accent-default)',
      checkedBorder: 'var(--m-color-accent-default)',
      mark: 'var(--m-color-accent-fg)',
    },
    radio: {
      size: '1rem',
      checkedBg: 'var(--m-color-accent-default)',
      checkedBorder: 'var(--m-color-accent-default)',
      dot: 'var(--m-color-accent-fg)',
    },
    // The toggle: a 28x14 track (40x24 large), blue-700 when on, a white knob
    switch: {
      width: '2.5rem',
      height: '1.5rem',
      smWidth: '1.75rem',
      smHeight: '0.875rem',
      trackBg: 'var(--m-color-border-strong)',
      trackCheckedBg: { light: '#0072f5', dark: '#0072f5' },
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbShadow: '0 1px 2px rgb(0 0 0 / 0.16)',
    },
    avatar: {
      size: { sm: '1.5rem', md: '2rem', lg: '2.5rem' },
      bg: { light: '#ebebeb', dark: '#1f1f1f' },
      fg: 'var(--m-color-fg-default)',
      fontWeight: 'var(--m-font-weight-medium)',
      border: 'var(--m-color-border-default)',
      ringColor: 'var(--m-color-bg-surface)',
      ringWidth: '1px',
      groupOverlap: '-0.625rem',
    },
    // Lists sit in a hairline frame: 14px rows split by hairlines, a grey 14px medium header, no fill
    table: {
      bg: 'var(--m-color-bg-surface)',
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: 'var(--m-space-4)',
      cellPaddingY: '0.625rem',
      compactPaddingY: '0.375rem',
      borderColor: 'var(--m-color-border-default)',
      headerBg: 'var(--m-color-bg-sunken)',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-md)',
      headerFontWeight: 'var(--m-font-weight-medium)',
      headerTransform: 'none',
      headerTracking: '0',
      rowHoverBg: { light: '#fafafa', dark: '#1a1a1a' },
      stripeBg: 'var(--m-color-bg-sunken)',
      wrapBorder: 'var(--m-color-border-default)',
      wrapRadius: 'var(--m-radius-container)',
    },
    breadcrumb: {
      separator: '"/"',
      separatorFg: { light: '#ebebeb', dark: '#2e2e2e' },
      gap: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-md)',
      fg: 'var(--m-color-fg-muted)',
      currentWeight: 'var(--m-font-weight-medium)',
    },
    // The public site's bar: 64px, background-200 at 80% with a blur, a hairline, 14px grey links
    navbar: {
      height: 'calc(4rem * var(--m-density))',
      bg: 'var(--m-color-bg-sunken)',
      border: 'var(--m-color-border-default)',
      translucentOpacity: '80%',
      backdropFilter: 'saturate(1.8) blur(8px)',
      brandFamily: 'var(--m-font-body-family)',
      brandSize: 'var(--m-font-size-lg)',
      brandWeight: 'var(--m-font-weight-semibold)',
      link: {
        height: 'calc(2rem * var(--m-density))',
        paddingX: 'var(--m-space-3)',
        radius: 'var(--m-radius-full)',
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-regular)',
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#ebebeb', dark: '#1f1f1f' },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
      },
    },
    pagination: {
      size: 'calc(2rem * var(--m-density))',
      radius: 'var(--m-radius-control)',
      fontWeight: 'var(--m-font-weight-medium)',
      hoverBg: { light: '#ebebeb', dark: '#1f1f1f' },
      currentBg: 'var(--m-color-bg-surface)',
      currentFg: 'var(--m-color-fg-default)',
      currentBorder: 'var(--m-color-border-default)',
    },
    // The app sidebar: background-200 with a hairline edge, 36px rows of 14px text with 16px icons,
    // the current row on a grey step, 6px corners
    sidebar: {
      width: '16rem',
      bg: 'var(--m-color-bg-sunken)',
      border: 'var(--m-color-border-default)',
      padding: 'var(--m-space-2)',
      sectionGap: 'var(--m-space-4)',
      itemGap: '2px',
      fontSize: 'var(--m-font-size-md)',
      nestedIndent: 'var(--m-space-6)',
      heading: {
        fg: 'var(--m-color-fg-muted)',
        size: 'var(--m-font-size-xs)',
        weight: 'var(--m-font-weight-medium)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#f2f2f2', dark: '#1a1a1a' },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: '#ebebeb', dark: '#1f1f1f' },
        activeWeight: 'var(--m-font-weight-regular)',
        radius: 'var(--m-radius-md)',
        paddingX: 'var(--m-space-2)',
        paddingY: 'calc(0.5rem * var(--m-density))',
      },
      count: { bg: 'transparent', fg: 'var(--m-color-fg-subtle)', radius: 'var(--m-radius-full)' },
    },
    // Underline tabs: 14px, 24px apart, a 2px grey-1000 bar on the current one over a hairline.
    // The secondary (pill) tabs: 32px chips, the current one on a grey step
    tabs: {
      listGap: 'var(--m-space-6)',
      height: 'calc(3rem * var(--m-density))',
      paddingX: '2px',
      fontWeight: 'var(--m-font-weight-regular)',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-fg-default)',
      indicatorWidth: '2px',
      listBorder: 'var(--m-color-border-default)',
      pill: {
        listBg: 'transparent',
        listRadius: 'var(--m-radius-control)',
        listPadding: '0',
        radius: 'var(--m-radius-control)',
        activeBg: { light: '#ebebeb', dark: '#1f1f1f' },
        activeShadow: 'none',
      },
    },
    // Notes: a hairline box with 6px corners, an icon, 14px text; coloured notes take the 200 tint
    alert: {
      bg: 'var(--m-color-bg-surface)',
      fg: 'var(--m-color-fg-default)',
      border: 'var(--m-color-border-default)',
      accentWidth: '1px',
      radius: 'var(--m-radius-control)',
      padding: 'var(--m-space-2) var(--m-space-3)',
      gap: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    // Badges are pills: 12px medium, the 200 tint with 900 text for tones, grey-200 for neutral
    badge: {
      height: '1.5rem',
      paddingX: '0.625rem',
      gap: '4px',
      radius: 'var(--m-radius-full)',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-medium)',
      neutral: {
        bg: { light: '#ebebeb', dark: '#1f1f1f' },
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        solidBg: { light: '#4d4d4d', dark: '#454545' },
        solidFg: '#ffffff',
      },
    },
    progress: {
      height: { sm: '0.25rem', md: '0.625rem', lg: '0.75rem' },
      radius: 'var(--m-radius-control)',
      track: { light: '#ebebeb', dark: '#1f1f1f' },
      fill: 'var(--m-color-accent-default)',
      optimum: 'var(--m-color-success-solid)',
      suboptimum: 'var(--m-color-warning-solid)',
      bad: 'var(--m-color-danger-solid)',
    },
    skeleton: {
      bg: { light: '#ebebeb', dark: '#1a1a1a' },
      highlight: { light: '#f2f2f2', dark: '#1f1f1f' },
      radius: '5px',
      blockRadius: 'var(--m-radius-container)',
    },
    spinner: { thickness: '2px', track: 'var(--m-color-border-default)', color: 'var(--m-color-fg-muted)' },
    // Toasts: background-100, a ring instead of a border, 12px corners, the menu shadow, 420px wide
    toast: {
      bg: 'var(--m-color-bg-raised)',
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: 'var(--m-radius-lg)',
      shadow: '0 0 0 1px var(--m-color-border-default), var(--m-shadow-lg)',
      padding: 'var(--m-space-4)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-medium)',
      width: '26.25rem',
    },
    // Modals: 540px, 12px corners, a ring, the long modal shadow; the footer sits on background-200
    dialog: {
      border: 'var(--m-color-border-default)',
      radius: 'var(--m-radius-lg)',
      padding: 'var(--m-space-6)',
      gap: 'var(--m-space-4)',
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-2xl)',
      titleWeight: 'var(--m-font-weight-semibold)',
      width: { sm: '25rem', md: '33.75rem', lg: '45rem' },
      enterTransform: 'scale(0.96)',
    },
    // Menus: 12px corners, a ring, 6px inside, 36px rows with 6px corners
    popover: {
      border: 'var(--m-color-border-default)',
      radius: 'var(--m-radius-lg)',
      shadow: 'var(--m-shadow-lg)',
      padding: '6px',
      minWidth: '12.5rem',
      item: {
        height: 'calc(2.25rem * var(--m-density))',
        paddingX: 'var(--m-space-2)',
        radius: 'var(--m-radius-md)',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: { light: '#f2f2f2', dark: '#1f1f1f' },
      },
      labelFg: 'var(--m-color-fg-muted)',
      separator: 'var(--m-color-border-default)',
    },
    // Tooltips invert: 13px, 8px corners, no shadow
    tooltip: {
      radius: '8px',
      shadow: 'none',
      paddingX: 'var(--m-space-2)',
      paddingY: '6px',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
      delay: '400ms',
    },
    // Collapse: hairline rows, the question 16px medium, no fills
    accordion: {
      bg: 'transparent',
      border: 'var(--m-color-border-default)',
      radius: '0',
      paddingX: '0',
      paddingY: 'var(--m-space-3)',
      summarySize: 'var(--m-font-size-lg)',
      summaryWeight: 'var(--m-font-weight-medium)',
      hoverBg: 'transparent',
    },
    code: {
      bg: 'var(--m-color-bg-sunken)',
      border: 'var(--m-color-border-default)',
      radius: 'var(--m-radius-control)',
      fontSize: 'var(--m-font-size-sm)',
      lineHeight: '1.54',
      headerBg: 'var(--m-color-bg-surface)',
      headerFg: 'var(--m-color-fg-muted)',
      headerTransform: 'none',
      inlineBg: { light: '#f2f2f2', dark: '#1a1a1a' },
      inlineFg: 'var(--m-color-fg-default)',
      inlineBorder: { light: '#e6e6e6', dark: '#292929' },
      inlineRadius: 'var(--m-radius-md)',
      comment: 'var(--m-color-fg-subtle)',
      keyword: { light: '#c41562', dark: '#f75f8f' },
      string: { light: '#297a3a', dark: '#62c073' },
      function: { light: '#7820bc', dark: '#bf7af0' },
      constant: 'var(--m-color-accent-text)',
    },
    // Keys: the sans face, background-100 with a hairline ring, 4px corners
    kbd: {
      fontFamily: 'var(--m-font-body-family)',
      fontWeight: 'var(--m-font-weight-regular)',
      bg: 'var(--m-color-bg-surface)',
      fg: 'var(--m-color-fg-default)',
      border: 'var(--m-color-border-default)',
      radius: 'var(--m-radius-sm)',
      shadow: 'none',
      height: '1.5rem',
      paddingX: '0.375rem',
    },
    prose: {
      maxWidth: '42rem',
      fontSize: 'var(--m-font-size-lg)',
      lineHeight: '1.5',
      h1Size: 'var(--m-font-size-3xl)',
      h2Size: 'var(--m-font-size-2xl)',
      h3Size: 'var(--m-font-size-xl)',
      h2Border: 'transparent',
      linkDecoration: 'none',
      quoteBorderWidth: '2px',
      tableHeaderBg: 'var(--m-color-bg-sunken)',
    },
    chat: {
      gap: 'var(--m-space-4)',
      radius: 'var(--m-radius-lg)',
      userBg: { light: '#f2f2f2', dark: '#1a1a1a' },
      userBorder: 'transparent',
      assistantBg: 'transparent',
      assistantBorder: 'transparent',
      avatarSize: '1.5rem',
      avatarBg: { light: '#ebebeb', dark: '#1f1f1f' },
      avatarFg: 'var(--m-color-fg-default)',
      assistantAvatarBg: 'var(--m-color-accent-default)',
      assistantAvatarFg: 'var(--m-color-accent-fg)',
    },
    citation: {
      chipBg: { light: '#ebebeb', dark: '#1f1f1f' },
      chipFg: 'var(--m-color-fg-default)',
      chipRadius: 'var(--m-radius-full)',
      sourceBg: 'var(--m-color-bg-raised)',
      sourceRadius: 'var(--m-radius-lg)',
    },
    composer: {
      bg: 'var(--m-color-bg-surface)',
      radius: 'var(--m-radius-lg)',
      shadow: 'var(--m-shadow-sm)',
      padding: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-md)',
    },
    thinking: { fontSize: 'var(--m-font-size-md)', ruleWidth: '1px' },
    toolCall: {
      bg: 'var(--m-color-bg-surface)',
      radius: 'var(--m-radius-control)',
      summaryHeight: 'calc(2.25rem * var(--m-density))',
      fontSize: 'var(--m-font-size-sm)',
      nameFamily: 'var(--m-font-family-mono)',
      statusRadius: 'var(--m-radius-full)',
    },
    usage: {
      height: '0.5rem',
      track: { light: '#ebebeb', dark: '#1f1f1f' },
      okFill: { light: '#0072f5', dark: '#0072f5' },
      // The amber dot is 1.7:1 on the light track; amber-900 (the warning text) in light
      warnFill: { light: '#a35200', dark: '#f5a623' },
      overFill: 'var(--m-color-danger-solid)',
      fontSize: 'var(--m-font-size-md)',
    },
  },
});
