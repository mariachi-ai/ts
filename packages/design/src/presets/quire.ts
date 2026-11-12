import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Quire: a polished, native-feeling document editor. Near-black ink on white pages that float on a
 * pale grey window, a calm grey sidebar where the current row is a white tile, capsule buttons and
 * round icon buttons, tinted block decorations, page blocks as rounded cards with soft colour covers,
 * and one clear blue. Dark mode is true black with graphite panels. Optional serif and mono document
 * styles. Category: editorial. The values are measured, not invented (see DESIGN.md).
 */
export const quire = extendTheme(minimal, {
  name: 'quire',
  label: 'Quire',
  description:
    'A calm document editor: ink on white pages over a pale grey window, capsule buttons, tinted blocks, page cards with soft covers, one clear blue and a true-black dark mode.',
  tokens: {
    color: {
      bg: {
        // The window behind lists and boards is a pale grey; pages, capsules and cards are white
        canvas: { light: '#f8f8f8', dark: '#000000' },
        surface: { light: '#ffffff', dark: '#1d1d1d' },
        // Menus, popovers, dialogs and the page itself in dark mode
        raised: { light: '#ffffff', dark: '#222222' },
        // The sidebar and quiet wells (toggle blocks, the search field, segmented tracks)
        sunken: { light: '#f2f2f2', dark: '#181818' },
        overlay: { light: 'rgb(26 28 30 / 0.24)', dark: 'rgb(0 0 0 / 0.6)' },
        inverse: { light: '#1f2225', dark: '#f4f4f4' },
      },
      fg: {
        default: { light: '#1f2225', dark: '#f4f4f4' },
        // The block-decoration grey the reference uses for secondary text (#5f6368; dark #b2b4b6)
        muted: { light: '#5f6368', dark: '#b2b4b6' },
        // Tertiary: the reference's ink at 55% (#818283, 3.9:1) darkened to the 4.5:1 floor
        subtle: { light: '#6b6e72', dark: '#8c8e90' },
        inverse: { light: '#f4f4f4', dark: '#1f2225' },
      },
      border: {
        // Hairlines: table cells #e3e3e3, the title rule #f1f1f2; dark #2f2f2f
        default: { light: '#e6e6e7', dark: '#2f2f2f' },
        muted: { light: '#f1f1f2', dark: '#262626' },
        // Controls: the checkbox grey (#c5c7c9, 1.7:1) taken to the 3:1 floor
        strong: { light: '#8a8d91', dark: '#6f7478' },
        focus: { light: '#006fd6', dark: '#4aa8ff' },
      },
      // The interface blue (#0087ff) one step deeper, so white text on it meets 4.5:1
      accent: {
        default: { light: '#006fd6', dark: '#006fd6' },
        hover: { light: '#0063c0', dark: '#0063c0' },
        active: { light: '#0058ab', dark: '#0058ab' },
        // The selected date, the highlighted task row
        subtle: { light: '#e5eefd', dark: '#18222c' },
        fg: '#ffffff',
        text: { light: '#0060c0', dark: '#4aa8ff' },
      },
      // The signature is ink, not blue: the public pages' black capsule and warm paper
      brand: {
        default: { light: '#030302', dark: '#f4f4f4' },
        fg: { light: '#ffffff', dark: '#030302' },
        subtle: { light: '#fcf9f7', dark: '#1b1a18' },
      },
      // The green block decoration
      success: {
        bg: { light: '#e6faf3', dark: '#1f3831' },
        fg: { light: '#107655', dark: '#7afad7' },
        border: { light: '#c3eedd', dark: '#2e5148' },
        solid: { light: '#107655', dark: '#2fbf8f' },
        onSolid: { light: '#ffffff', dark: '#000000' },
      },
      // The orange block decoration
      warning: {
        bg: { light: '#fff4e6', dark: '#382d1f' },
        fg: { light: '#8f5a13', dark: '#fac37a' },
        border: { light: '#fbdfba', dark: '#56432b' },
        solid: { light: '#f5a524', dark: '#f5a524' },
        onSolid: { light: '#1f2225', dark: '#000000' },
      },
      // The red block decoration; overdue flags in the system red
      danger: {
        bg: { light: '#fde6ea', dark: '#3a1f24' },
        fg: { light: '#871428', dark: '#ff9aa8' },
        border: { light: '#f8c7d0', dark: '#5c2b34' },
        solid: { light: '#d42a30', dark: '#e5484d' },
        onSolid: { light: '#ffffff', dark: '#000000' },
      },
      info: {
        bg: { light: '#e5eefd', dark: '#18222c' },
        fg: { light: '#0060c0', dark: '#86c6f6' },
        border: { light: '#c7dcfb', dark: '#24384b' },
        solid: { light: '#006fd6', dark: '#006fd6' },
        onSolid: '#ffffff',
      },
      // The mention highlight
      selection: {
        bg: { light: '#c7e7ff', dark: '#24465f' },
        fg: { light: '#1f2225', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // The native app is set in the system grotesque; its web chrome uses Inter, the closest open face
        sans: '"Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"',
        display: '"Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
        // The optional serif document style, and the public pages' headlines
        serif: '"Newsreader Variable", "Newsreader", ui-serif, Georgia, Cambria, "Times New Roman", serif',
        mono: '"Roboto Mono Variable", "Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      size: {
        xs: '0.75rem',
        sm: '0.8125rem',
        md: '1rem',
        lg: '1.0625rem',
        xl: '1.1875rem',
        '2xl': '1.5rem',
        '3xl': '2.25rem',
        '4xl': '3.375rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.2', normal: '1.5', relaxed: '1.6' },
      tracking: { tight: '-0.012em', normal: '-0.01em', wide: '0.1em' },
      heading: { weight: '700', tracking: '-0.012em' },
    },
    control: {
      height: {
        sm: 'calc(1.75rem * var(--m-density))',
        md: 'calc(2rem * var(--m-density))',
        lg: 'calc(2.5rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(0.875rem * var(--m-density))',
        lg: 'calc(1.25rem * var(--m-density))',
      },
      fontSize: '0.8125rem',
    },
    // 6px blocks and chips, 10px rows and fields, 16px pages and dialogs; buttons are capsules
    radius: { sm: '6px', md: '10px', lg: '16px', control: '10px', container: '16px' },
    shadow: {
      // Capsules and the current sidebar row: a faint ring and a short drop
      sm: {
        light: '0 0 0 1px rgb(26 28 30 / 0.05), 0 1px 3px rgb(0 0 0 / 0.08)',
        dark: '0 0 0 1px rgb(249 249 249 / 0.06), 0 1px 3px rgb(0 0 0 / 0.5)',
      },
      // The page: a 3% ring, then a soft 20px fall
      md: {
        light: '0 0 0 1px rgb(26 28 30 / 0.03), 0 8px 20px rgb(0 0 0 / 0.08), 0 8px 12px -6px rgb(0 0 0 / 0.04)',
        dark: '0 0 0 1px rgb(249 249 249 / 0.04), 0 8px 20px rgb(0 0 0 / 0.5)',
      },
      // A page block shown as a card
      lg: {
        light: '0 0 1px rgb(0 0 0 / 0.2), 0 10px 20px rgb(0 0 0 / 0.08)',
        dark: '0 0 0 1px rgb(249 249 249 / 0.06), 0 10px 20px rgb(0 0 0 / 0.5)',
      },
      // Menus and popovers: the reference's five-step fall
      overlay: {
        light:
          '0 0 0 1px rgb(26 28 30 / 0.04), 0 2px 4px rgb(0 0 0 / 0.07), 0 8px 8px rgb(0 0 0 / 0.06), 0 18px 11px rgb(0 0 0 / 0.04), 0 32px 13px rgb(0 0 0 / 0.01)',
        dark: '0 0 0 1px rgb(249 249 249 / 0.08), 0 2px 4px rgb(0 0 0 / 0.4), 0 18px 32px rgb(0 0 0 / 0.6)',
      },
    },
    motion: {
      duration: { fast: '150ms', normal: '250ms', slow: '400ms' },
      easing: { standard: 'cubic-bezier(0.25, 0.1, 0.25, 1)', emphasized: 'cubic-bezier(0.2, 0.9, 0.3, 1.05)' },
    },
  },
  components: {
    // A 280px sidebar, then a 776px page with a 664px text column
    layout: {
      containerMax: { sm: '30rem', md: '48.5rem', lg: '72rem' },
      containerPadding: 'clamp(1rem, 4vw, 2.5rem)',
      gridGap: 'var(--m-space-4)',
      splitSide: '17.5rem',
    },
    // Capsules: blue for the one that matters, white with a ring for the rest, a grey wash for quiet ones
    button: {
      radius: '9999px',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-medium)',
      shadow: 'var(--m-shadow-sm)',
      hoverShadow: 'var(--m-shadow-sm)',
      activeShadow: 'none',
      primary: { border: 'transparent' },
      secondary: {
        bg: 'var(--m-color-bg-surface)',
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        hoverBg: { light: '#f5f5f5', dark: '#262626' },
        activeBg: { light: '#ececec', dark: '#2f2f2f' },
      },
      ghost: {
        fg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#ececec', dark: '#262626' },
        activeBg: { light: '#e3e3e3', dark: '#2f2f2f' },
      },
      danger: { border: 'transparent' },
    },
    // Cards are pages and tiles: white, rounded, floating on the page shadow with no drawn border
    card: {
      border: 'transparent',
      radius: '14px',
      shadow: 'var(--m-shadow-md)',
      hoverShadow: 'var(--m-shadow-lg)',
      hoverBorder: 'transparent',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-6)', lg: 'var(--m-space-10)' },
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-semibold)',
      sunken: { bg: { light: '#ececec', dark: '#1d1d1d' }, border: 'transparent' },
    },
    input: {
      fontSize: 'var(--m-font-size-sm)',
      radius: '10px',
      hoverBorder: 'var(--m-color-fg-subtle)',
      focusBorder: 'var(--m-color-accent-default)',
    },
    select: { fontSize: 'var(--m-font-size-sm)', radius: '10px' },
    field: {
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-semibold)',
      hintFontSize: 'var(--m-font-size-sm)',
      hintFg: 'var(--m-color-fg-muted)',
    },
    checkbox: { size: '1rem', radius: '4px', border: 'var(--m-color-border-strong)' },
    radio: { size: '1rem', border: 'var(--m-color-border-strong)' },
    // The native switch: accent when on, a grey track when off, a white knob with a soft shadow
    switch: {
      width: '2.375rem',
      height: '1.375rem',
      smWidth: '1.875rem',
      smHeight: '1.125rem',
      border: 'transparent',
      trackBg: { light: '#8a8d91', dark: '#5c5f63' },
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbShadow: '0 1px 2px rgb(0 0 0 / 0.2)',
    },
    // A collection table: hairline grid, quiet 12px column names, no header fill
    table: {
      fontSize: 'var(--m-font-size-sm)',
      cellPaddingX: 'var(--m-space-3)',
      cellPaddingY: 'calc(0.5rem * var(--m-density))',
      borderColor: 'var(--m-color-border-default)',
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-xs)',
      headerFontWeight: 'var(--m-font-weight-medium)',
      headerTransform: 'none',
      headerTracking: '0',
      rowHoverBg: { light: '#f5f6f7', dark: '#1d1d1d' },
      stripeBg: 'transparent',
      wrapBorder: 'var(--m-color-border-default)',
      wrapRadius: '6px',
    },
    // A calm grey column: bold group names, 13px rows, the current row a white tile
    sidebar: {
      width: '17.5rem',
      bg: 'var(--m-color-bg-sunken)',
      border: 'transparent',
      padding: 'var(--m-space-3)',
      sectionGap: 'var(--m-space-5)',
      itemGap: '2px',
      fontSize: 'var(--m-font-size-sm)',
      heading: {
        fg: 'var(--m-color-fg-default)',
        size: 'var(--m-font-size-sm)',
        weight: 'var(--m-font-weight-semibold)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#e9e9e9', dark: '#212121' },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: '#ffffff', dark: '#2a2a2a' },
        activeWeight: 'var(--m-font-weight-medium)',
        radius: '10px',
        paddingX: 'var(--m-space-2)',
        paddingY: 'calc(0.375rem * var(--m-density))',
      },
      count: { bg: 'transparent', fg: 'var(--m-color-fg-subtle)' },
    },
    // The public pages' header: a floating frosted capsule with ink links and a black capsule
    navbar: {
      height: 'calc(3.25rem * var(--m-density))',
      paddingX: 'var(--m-space-5)',
      bg: 'var(--m-color-bg-surface)',
      border: 'transparent',
      shadow: 'var(--m-shadow-sm)',
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-regular)',
        radius: '9999px',
      },
    },
    // Segmented capsules: a white group on a ring, the chosen segment a grey wash
    tabs: {
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-muted)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-fg-default)',
      pill: {
        listBg: 'var(--m-color-bg-surface)',
        listRadius: '9999px',
        listPadding: '3px',
        radius: '9999px',
        activeBg: { light: '#ececec', dark: '#2f2f2f' },
        activeShadow: 'none',
      },
    },
    breadcrumb: { separator: '"›"', fontSize: 'var(--m-font-size-xs)' },
    pagination: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-medium)',
      currentBg: { light: '#ececec', dark: '#2f2f2f' },
      currentFg: 'var(--m-color-fg-default)',
      currentBorder: 'transparent',
    },
    // Inline tags and date chips: 6px corners, no border, a soft tint
    badge: {
      height: '1.25rem',
      paddingX: '0.375rem',
      radius: '6px',
      borderWidth: '0px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-medium)',
      neutral: {
        bg: { light: '#eeeeee', dark: '#2a2a2b' },
        fg: { light: '#5f6368', dark: '#b2b4b6' },
        border: 'transparent',
        solidBg: 'var(--m-color-bg-inverse)',
        solidFg: 'var(--m-color-fg-inverse)',
      },
    },
    avatar: {
      size: { sm: '1.25rem', md: '1.75rem', lg: '2.5rem' },
      bg: 'var(--m-color-accent-subtle)',
      fg: 'var(--m-color-accent-text)',
      fontWeight: 'var(--m-font-weight-semibold)',
    },
    divider: { color: 'var(--m-color-border-muted)' },
    // A block decoration: a tinted block with 6px corners, no border and no side stripe
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '6px',
      padding: '0.625rem 0.875rem',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    toast: {
      border: 'transparent',
      accentWidth: '0px',
      radius: '14px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-3) var(--m-space-4)',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    dialog: {
      border: 'transparent',
      radius: '20px',
      padding: 'var(--m-space-6)',
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // macOS menus: white, rounded, the highlighted row filled with the accent
    popover: {
      border: 'transparent',
      radius: '14px',
      shadow: 'var(--m-shadow-overlay)',
      padding: '6px',
      item: {
        height: '1.75rem',
        paddingX: 'var(--m-space-2)',
        radius: '8px',
        fontSize: 'var(--m-font-size-sm)',
        hoverBg: 'var(--m-color-accent-default)',
        hoverFg: '#ffffff',
      },
      labelSize: 'var(--m-font-size-xs)',
      separator: 'var(--m-color-border-muted)',
    },
    tooltip: {
      radius: '6px',
      shadow: 'var(--m-shadow-sm)',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-medium)',
      delay: '500ms',
    },
    progress: {
      height: { sm: '0.25rem', md: '0.375rem', lg: '0.5rem' },
      track: { light: '#ececec', dark: '#2a2a2b' },
      // The accent, lifted in dark mode so the bar holds 3:1 on its track
      fill: 'var(--m-color-accent-text)',
    },
    usage: { height: '0.375rem', track: { light: '#ececec', dark: '#2a2a2b' }, okFill: 'var(--m-color-accent-text)' },
    skeleton: {
      bg: { light: '#f0f0f0', dark: '#1d1d1d' },
      highlight: { light: '#f8f8f8', dark: '#262626' },
      radius: '6px',
      blockRadius: '14px',
    },
    spinner: { thickness: '2px' },
    kbd: {
      fontFamily: 'var(--m-font-family-sans)',
      fontWeight: 'var(--m-font-weight-medium)',
      border: 'var(--m-color-border-default)',
      radius: '6px',
      shadow: '0 1px 0 var(--m-color-border-default)',
    },
    // Code blocks are grey wells; inline code is mono with a hairline box
    code: {
      bg: { light: '#f5f6f7', dark: '#2a2a2b' },
      border: 'transparent',
      radius: '6px',
      inlineBg: 'transparent',
      inlineBorder: 'var(--m-color-border-default)',
      inlineRadius: '4px',
      comment: 'var(--m-color-fg-muted)',
    },
    // Toggle blocks: grey wells with 6px corners, the question in semibold
    accordion: {
      bg: { light: '#f5f6f7', dark: '#2a2a2b' },
      border: 'transparent',
      radius: '6px',
      separatedGap: 'var(--m-space-2)',
      paddingX: '0.875rem',
      paddingY: '0.625rem',
      summarySize: 'var(--m-font-size-md)',
      summaryWeight: 'var(--m-font-weight-semibold)',
      hoverBg: { light: '#eef0f2', dark: '#303032' },
    },
    // The document: 16/24 body, a 664px column, 24/19/17 headings, quotes as a focus bar
    prose: {
      maxWidth: '41.5rem',
      fontSize: 'var(--m-font-size-md)',
      lineHeight: '1.5',
      h1Size: 'var(--m-font-size-2xl)',
      h2Size: 'var(--m-font-size-xl)',
      h3Size: 'var(--m-font-size-lg)',
      h4Size: 'var(--m-font-size-md)',
      h2Border: 'transparent',
      linkFg: 'var(--m-color-accent-text)',
      quoteFg: 'var(--m-color-fg-muted)',
      quoteBorder: { light: '#9ea4aa', dark: '#6f7478' },
      quoteBorderWidth: '3px',
      quoteStyle: 'normal',
      hrColor: 'var(--m-color-border-default)',
      tableBorder: { light: '#e3e3e3', dark: '#2f2f2f' },
      tableHeaderBg: { light: '#f7faff', dark: '#1f2e39' },
      imageRadius: '7px',
    },
    // The assistant: your messages in a grey bubble, its answers on the page
    chat: {
      radius: '16px',
      userBg: { light: '#f0f0f0', dark: '#2a2a2b' },
      userFg: 'var(--m-color-fg-default)',
      userBorder: 'transparent',
      assistantBg: 'transparent',
      assistantBorder: 'transparent',
      avatarBg: 'var(--m-color-accent-subtle)',
      avatarFg: 'var(--m-color-accent-text)',
    },
    composer: { radius: '20px', border: 'var(--m-color-border-strong)', shadow: 'var(--m-shadow-sm)' },
    citation: { chipRadius: '6px' },
    toolCall: { radius: '10px' },
  },
});
