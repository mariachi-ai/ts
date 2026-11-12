import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

// The neutral fills: the reference's grey ramp (250, 238, 219) and its dark steps
const fill = { light: '#eeeeee', dark: '#232525' };
const fillHover = { light: '#dbdbdb', dark: '#363737' };
const sunken = { light: '#fafafa', dark: '#1b1c1d' };
// The signature orange, where it carries no text: the logo mark, the selected card, charts
const signal = { light: '#ff6719', dark: '#ff6719' };
// The same orange two steps along its ramp, where it must stand 3:1 off the grey track (bars, meters)
const signalBar = { light: '#e7570a', dark: '#ff6719' };

/**
 * Broadsheet: a reading-first publishing interface. Warm graphite ink on white, a serif for what is
 * read and a grotesque for everything else, one bright orange for subscribing and the brand mark,
 * 8px corners, hairlines at 10% black, a blue focus ring, and quiet grey chrome. Category: editorial
 * and warm-neutral. The values are read from the reference's published stylesheet tokens and its
 * live pages, not invented (see DESIGN.md).
 */
export const broadsheet = extendTheme(minimal, {
  name: 'broadsheet',
  label: 'Broadsheet',
  description:
    'Reading first: graphite ink on white, a serif for the words and a grotesque for the chrome, one bright orange for subscribing, 8px corners and hairlines.',
  tokens: {
    color: {
      bg: {
        canvas: { light: '#ffffff', dark: '#161718' },
        surface: { light: '#ffffff', dark: '#161718' },
        // Popovers, menus and dialogs: white, or the first elevated step in dark
        raised: { light: '#ffffff', dark: '#1b1c1d' },
        // Quiet panels, unselected stat tiles, the footer band
        sunken,
        overlay: { light: 'rgb(0 0 0 / 0.5)', dark: 'rgb(0 0 0 / 0.6)' },
        // The snackbar is the ink colour, inverted in dark
        inverse: { light: '#363737', dark: '#eeeeee' },
      },
      fg: {
        // Ink is a warm graphite, never black
        default: { light: '#363737', dark: '#eeeeee' },
        // Secondary text: the reference's #777 (white at 60% in dark), one step darker to pass on #fafafa
        muted: { light: '#727272', dark: '#a2a3a3' },
        subtle: { light: '#757575', dark: '#8b8c8c' },
        inverse: { light: '#ffffff', dark: '#363737' },
      },
      border: {
        // Hairlines: black at 10% (white at 10% in dark), flattened
        default: { light: '#e6e6e6', dark: '#2d2e2f' },
        muted: { light: '#f0f0f0', dark: '#232525' },
        // Control borders: the reference's 10% hairline is far under 3:1; its contrast-4 step passes
        strong: { light: '#929292', dark: '#717272' },
        // Focus is the blue "select" colour, not the orange
        focus: { light: '#005dd9', dark: '#3d8bff' },
      },
      accent: {
        // The orange that carries white text: the reference's #ff6719 is 2.9:1 with white, so actions
        // take the nearest passing step on its own 500 → 600 → 700 ramp
        default: { light: '#cd4900', dark: '#cd4900' },
        hover: { light: '#b43e00', dark: '#b43e00' },
        active: { light: '#a53800', dark: '#a53800' },
        // Orange at 20%, flattened: the "Subscribe" chips, highlighted rows
        subtle: { light: '#ffe1d1', dark: '#452718' },
        fg: '#ffffff',
        text: { light: '#b43e00', dark: '#ff853d' },
      },
      brand: {
        // The signature orange itself, for the logo mark, brand bands and highlights
        default: signal,
        // White on #ff6719 is 2.9:1; the ramp's darkest step reads on it
        fg: { light: '#1c0c01', dark: '#1c0c01' },
        subtle: { light: '#ffe1d1', dark: '#452718' },
      },
      success: {
        bg: { light: '#d1f3e5', dark: '#17392c' },
        fg: { light: '#006c41', dark: '#52dd98' },
        border: { light: '#a4e7cb', dark: '#1f5a41' },
        solid: { light: '#007c4a', dark: '#1bc47d' },
        onSolid: { light: '#ffffff', dark: '#0e2a1b' },
      },
      warning: {
        bg: { light: '#fff4cc', dark: '#453a13' },
        fg: { light: '#6e5400', dark: '#ffdf41' },
        border: { light: '#ffe999', dark: '#6e5400' },
        solid: { light: '#ffc700', dark: '#ffc700' },
        onSolid: { light: '#6e5400', dark: '#372a08' },
      },
      danger: {
        bg: { light: '#fbdddd', dark: '#412425' },
        fg: { light: '#b23538', dark: '#ff7772' },
        border: { light: '#f7bcbc', dark: '#6b2f31' },
        solid: { light: '#c53e41', dark: '#c53e41' },
        onSolid: '#ffffff',
      },
      info: {
        bg: { light: '#cce4ff', dark: '#122a46' },
        fg: { light: '#0052c2', dark: '#5390ff' },
        border: { light: '#99c8ff', dark: '#1f4680' },
        solid: { light: '#005dd9', dark: '#005dd9' },
        onSolid: '#ffffff',
      },
      selection: {
        // The link-blue at 20%
        bg: { light: '#d1ecfe', dark: '#163245' },
        fg: { light: '#363737', dark: '#eeeeee' },
      },
    },
    font: {
      family: {
        // The UI grotesque (a system San Francisco in the reference) and the reading serif
        sans: '"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        display: '"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        serif: '"Spectral", Georgia, "Times New Roman", serif',
        mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      size: {
        // 11 meta (uppercase), 13 secondary, 15 interface, 19 reading, 20, 24, 32 and 44 headings
        xs: '0.6875rem',
        sm: '0.8125rem',
        md: '0.9375rem',
        lg: '1.1875rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.75rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.125', normal: '1.4', relaxed: '1.6' },
      tracking: { tight: '-0.01em', normal: '0', wide: '0.02em' },
      body: { weight: '400' },
      heading: { weight: '700', tracking: '0' },
    },
    control: {
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(2.5rem * var(--m-density))',
        lg: 'calc(3rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.25rem * var(--m-density))',
      },
      fontSize: 'var(--m-font-size-md)',
    },
    // xs 4, sm 8, md 12, lg 20 in the reference; controls 8, cards and dialogs 12
    radius: { sm: '4px', md: '8px', lg: '12px', control: '8px', container: '12px' },
    shadow: {
      sm: {
        light: '0 1px 3px rgb(0 0 0 / 0.1), 0 1px 2px rgb(0 0 0 / 0.06)',
        dark: '0 1px 3px rgb(0 0 0 / 0.2), 0 1px 2px rgb(0 0 0 / 0.12)',
      },
      md: {
        light: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
        dark: '0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -1px rgb(0 0 0 / 0.12)',
      },
      lg: {
        light: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.1), 0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -2px rgb(0 0 0 / 0.1)',
      },
      overlay: {
        light: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.1), 0 20px 25px -5px rgb(0 0 0 / 0.2), 0 10px 10px -5px rgb(0 0 0 / 0.08)',
      },
    },
    focus: { width: '2px', offset: '2px' },
    motion: {
      // 125, 250 and 500 ms on a long ease-out
      duration: { fast: '125ms', normal: '250ms', slow: '500ms' },
      easing: { standard: 'cubic-bezier(0.19, 1, 0.22, 1)', emphasized: 'cubic-bezier(0.32, 0.72, 0, 1)' },
    },
  },
  components: {
    // A 728px reading column; dashboards to about 64rem beside a 232px sidebar
    layout: {
      containerMax: { sm: '30rem', md: '45.5rem', lg: '64rem' },
      containerPadding: 'clamp(1rem, 4vw, 2rem)',
      gridGap: 'var(--m-space-4)',
      splitSide: '14.5rem',
    },
    // 8px corners at 600: orange for the one action, the grey fill for the rest, text alone for quiet ones
    button: {
      radius: '8px',
      fontWeight: 'var(--m-font-weight-semibold)',
      gap: 'var(--m-space-2)',
      // The solid buttons carry a 1px inner highlight above and a shade below
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      primary: {
        bg: 'var(--m-color-accent-default)',
        fg: '#ffffff',
        border: 'transparent',
        hoverBg: 'var(--m-color-accent-hover)',
        activeBg: 'var(--m-color-accent-active)',
      },
      secondary: {
        bg: fill,
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        hoverBg: fillHover,
        activeBg: { light: '#cccccc', dark: '#45474a' },
      },
      ghost: { fg: 'var(--m-color-fg-default)', hoverBg: fill, activeBg: fillHover },
      danger: {
        bg: { light: '#c53e41', dark: '#c53e41' },
        fg: '#ffffff',
        border: 'transparent',
        hoverBg: { light: '#972c2f', dark: '#972c2f' },
        activeBg: { light: '#7d2427', dark: '#7d2427' },
      },
    },
    // Inputs: 40px, 8px corners, a hairline that strengthens to the control grey, a tiny drop
    input: {
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: '#757575', dark: '#8b8c8c' },
      focusBorder: 'var(--m-color-border-focus)',
      placeholder: 'var(--m-color-fg-subtle)',
      shadow: '0 1px 2px rgb(0 0 0 / 0.05)',
      paddingX: { md: 'calc(0.75rem * var(--m-density))' },
    },
    select: {
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: '#757575', dark: '#8b8c8c' },
      focusBorder: 'var(--m-color-border-focus)',
      shadow: '0 1px 2px rgb(0 0 0 / 0.05)',
      paddingX: { md: 'calc(0.75rem * var(--m-density))' },
    },
    field: {
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: '0.875rem',
      labelFontWeight: 'var(--m-font-weight-semibold)',
      hintFg: 'var(--m-color-fg-muted)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFg: 'var(--m-color-danger-fg)',
      requiredFg: 'var(--m-color-danger-fg)',
    },
    checkbox: { size: '1.125rem', radius: '4px', mark: '#ffffff' },
    radio: { size: '1.125rem', dot: '#ffffff' },
    switch: {
      width: '2.5rem',
      height: '1.5rem',
      trackBg: 'var(--m-color-border-strong)',
      trackCheckedBg: 'var(--m-color-accent-default)',
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbInset: '2px',
      thumbShadow: '0 1px 2px rgb(0 0 0 / 0.2)',
    },
    // Cards: white, a 10% hairline, 12px corners, no shadow until hovered
    card: {
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-default)',
      shadow: 'none',
      hoverShadow: 'var(--m-shadow-md)',
      hoverBorder: 'var(--m-color-border-default)',
      hoverTransform: 'none',
      titleFamily: 'var(--m-font-family-sans)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-bold)',
      descriptionFg: 'var(--m-color-fg-muted)',
      outline: { bg: 'var(--m-color-bg-surface)', border: 'var(--m-color-border-default)' },
      sunken: { bg: sunken, border: 'var(--m-color-border-default)' },
    },
    // Tables: rows on hairlines, a small grey header, no stripes
    table: {
      bg: 'var(--m-color-bg-surface)',
      headerBg: 'var(--m-color-bg-surface)',
      headerFg: 'var(--m-color-fg-muted)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-medium)',
      fontSize: 'var(--m-font-size-md)',
      cellPaddingY: 'var(--m-space-3)',
      rowHoverBg: sunken,
      stripeBg: 'var(--m-color-bg-surface)',
      wrapBorder: 'var(--m-color-border-default)',
      wrapRadius: '12px',
    },
    // The writer's sidebar: white, a hairline edge, small uppercase group labels, the current row on grey
    sidebar: {
      bg: 'var(--m-color-bg-canvas)',
      border: 'var(--m-color-border-default)',
      fontSize: 'var(--m-font-size-md)',
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: sunken,
        activeFg: 'var(--m-color-fg-default)',
        activeBg: fill,
        activeWeight: 'var(--m-font-weight-semibold)',
        radius: '8px',
        paddingX: 'var(--m-space-3)',
        paddingY: 'var(--m-space-2)',
      },
      heading: {
        fg: 'var(--m-color-fg-muted)',
        size: 'var(--m-font-size-xs)',
        weight: 'var(--m-font-weight-medium)',
        transform: 'uppercase',
        tracking: 'var(--m-font-tracking-wide)',
      },
      count: { bg: fill, fg: 'var(--m-color-fg-default)', radius: '9999px' },
    },
    // The publication masthead: the name centred, bold, on a 72px bar with a hairline under it
    navbar: {
      height: '4.5rem',
      bg: 'var(--m-color-bg-canvas)',
      border: 'var(--m-color-border-default)',
      shadow: 'none',
      brandFamily: 'var(--m-font-family-display)',
      brandSize: 'var(--m-font-size-2xl)',
      brandWeight: 'var(--m-font-weight-bold)',
      link: {
        radius: '8px',
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-medium)',
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: fill,
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
      },
    },
    // Underline tabs in grey, the current one in ink with a 2px ink line; the segmented control is a
    // bordered track with a grey current segment
    tabs: {
      fontSize: '0.875rem',
      fontWeight: 'var(--m-font-weight-semibold)',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-fg-default)',
      indicatorWidth: '2px',
      listBorder: 'var(--m-color-border-default)',
      pill: {
        listBg: 'var(--m-color-bg-surface)',
        listRadius: '8px',
        listPadding: '3px',
        radius: '4px',
        activeBg: fill,
        activeShadow: 'none',
      },
    },
    pagination: {
      radius: '8px',
      border: 'transparent',
      fg: 'var(--m-color-fg-default)',
      hoverBg: fill,
      currentBg: fill,
      currentFg: 'var(--m-color-fg-default)',
      currentBorder: 'transparent',
    },
    breadcrumb: {
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      currentFg: 'var(--m-color-fg-default)',
      currentWeight: 'var(--m-font-weight-semibold)',
    },
    // Tags: 4px corners, 11–12px at 500, a tint and a 20% hairline of the tone
    badge: {
      radius: '4px',
      paddingX: '6px',
      fontSize: '0.75rem',
      fontWeight: 'var(--m-font-weight-medium)',
      neutral: {
        bg: fill,
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        solidBg: { light: '#161718', dark: '#ffffff' },
        solidFg: { light: '#eeeeee', dark: '#363737' },
      },
    },
    avatar: {
      size: { sm: '1.5rem', md: '2.25rem', lg: '3.5rem' },
      bg: fill,
      fg: 'var(--m-color-fg-default)',
      fontWeight: 'var(--m-font-weight-semibold)',
    },
    // Alerts: the tone at 20% with a 20% hairline of the same tone, 8px corners, no stripe
    alert: {
      borderWidth: '1px',
      accentWidth: '0px',
      radius: '8px',
      padding: 'var(--m-space-3) var(--m-space-4)',
      gap: 'var(--m-space-3)',
      fontSize: '0.875rem',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // The snackbar: an ink slab with white text, 8px corners
    toast: {
      bg: 'var(--m-color-bg-inverse)',
      fg: 'var(--m-color-fg-inverse)',
      bodyFg: 'var(--m-color-fg-inverse)',
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '8px',
      padding: '10px 16px',
      shadow: 'var(--m-shadow-lg)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
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
    popover: {
      border: 'var(--m-color-border-default)',
      radius: '8px',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-1)',
      item: {
        radius: '4px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: sunken,
        hoverFg: 'var(--m-color-fg-default)',
      },
    },
    // Tooltips: near-black, white 12px text, 4px corners
    tooltip: {
      bg: { light: '#161718', dark: '#000000' },
      fg: '#ffffff',
      radius: '4px',
      shadow: 'none',
      paddingX: '10px',
      paddingY: '5px',
      fontSize: '0.75rem',
      fontWeight: 'var(--m-font-weight-medium)',
    },
    progress: {
      height: { sm: '0.25rem', md: '0.375rem', lg: '0.5rem' },
      radius: '9999px',
      track: fill,
      fill: signalBar,
    },
    accordion: {
      radius: '0',
      bg: 'transparent',
      paddingX: '0',
      paddingY: 'var(--m-space-4)',
      summarySize: 'var(--m-font-size-md)',
      summaryWeight: 'var(--m-font-weight-semibold)',
      contentFg: 'var(--m-color-fg-muted)',
    },
    skeleton: { bg: fill },
    spinner: { color: 'var(--m-color-accent-default)' },
    kbd: { radius: '4px', bg: fill, border: 'transparent', shadow: 'none' },
    code: {
      radius: '8px',
      inlineRadius: '4px',
      inlineBg: fill,
      bg: sunken,
      border: 'var(--m-color-border-default)',
      comment: 'var(--m-color-fg-muted)',
    },
    // Links in prose are ink, underlined; the reading size and line height come from the post body
    prose: {
      maxWidth: '45.5rem',
      fontSize: 'var(--m-font-size-lg)',
      lineHeight: 'var(--m-font-leading-relaxed)',
      linkFg: 'var(--m-color-fg-default)',
      linkDecoration: 'underline',
      quoteBorder: 'var(--m-color-brand-default)',
    },
    // Chat: your own messages in the reference's blue (its 600 step, for white text), others plain
    chat: { radius: '12px', userBg: '#005dd9', userFg: '#ffffff', userBorder: 'transparent' },
    composer: { radius: '8px', focusBorder: 'var(--m-color-border-focus)' },
    usage: { okFill: signalBar },
  },
});
