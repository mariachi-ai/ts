import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Lagoon: a system messenger on the desktop. Near-black text on white, a light grey sidebar of
 * conversations with round avatars and pinned circles, the thread in tailed bubbles (yours in the
 * system blue with white text, theirs in light grey), small centred timestamps and a quiet "Read"
 * under the last one you sent, a capsule composer, capsule buttons and round glass icon buttons
 * (drawn opaque), and a true dark mode. Category: social and messaging. The values come from the
 * reference's published system colours and type, and are measured from its own help screenshots
 * (see DESIGN.md).
 */
export const lagoon = extendTheme(minimal, {
  name: 'lagoon',
  label: 'Lagoon',
  description:
    'A system messenger: near-black on white, a grey sidebar with round avatars, blue bubbles for you and grey for them, capsule buttons and a capsule composer, and a true dark mode.',
  tokens: {
    color: {
      bg: {
        // The thread is white; dark is the system's dark text background
        canvas: { light: '#ffffff', dark: '#1e1e1e' },
        surface: { light: '#ffffff', dark: '#1e1e1e' },
        // Menus, sheets and popovers (glass, drawn opaque)
        raised: { light: '#ffffff', dark: '#2c2c2e' },
        // The grouped-list grey behind settings cards and quiet panels
        sunken: { light: '#f2f2f7', dark: '#141415' },
        overlay: { light: 'rgb(0 0 0 / 0.2)', dark: 'rgb(0 0 0 / 0.5)' },
        inverse: { light: '#1c1c1e', dark: '#f2f2f7' },
      },
      fg: {
        default: { light: '#191919', dark: '#ffffff' },
        // Secondary label (black at 50%, #808080) darkened to hold 4.5:1 on the sidebar and segment greys
        muted: { light: '#646469', dark: '#a1a1a6' },
        subtle: { light: '#737378', dark: '#9a9a9f' },
        inverse: { light: '#ffffff', dark: '#000000' },
      },
      border: {
        // Separators: black at about 10% over white; dark the system separator over the dark ground
        default: { light: '#e5e5e5', dark: '#3a3a3c' },
        muted: { light: '#f0f0f0', dark: '#2c2c2e' },
        // Control edges: the system grey (#8e8e93), the lightest grey that holds 3:1
        strong: { light: '#8e8e93', dark: '#7c7c80' },
        focus: { light: '#0076de', dark: '#3d9bff' },
      },
      // The system blue (#0088ff light, #0091ff dark), one step deeper so white text holds 4.5:1
      accent: {
        default: { light: '#0076de', dark: '#0077d6' },
        hover: { light: '#006bcb', dark: '#006cc2' },
        active: { light: '#0060b6', dark: '#0062b0' },
        subtle: { light: '#e5f1ff', dark: '#0b2b4d' },
        fg: '#ffffff',
        text: { light: '#0069c9', dark: '#5cb8ff' },
      },
      success: {
        bg: { light: '#e6f8eb', dark: '#0e2e17' },
        fg: { light: '#007a2c', dark: '#4ad968' },
        border: { light: '#b7ebc4', dark: '#1d5a2e' },
        // The system green (#34c759) carries near-black text; white on it is 2.2:1
        solid: { light: '#34c759', dark: '#30d158' },
        onSolid: '#000000',
      },
      warning: {
        bg: { light: '#fff2e2', dark: '#3a2510' },
        fg: { light: '#a14f00', dark: '#ffa056' },
        border: { light: '#ffd6a8', dark: '#6a4113' },
        solid: { light: '#ff8d28', dark: '#ff9230' },
        onSolid: '#000000',
      },
      danger: {
        bg: { light: '#ffeaeb', dark: '#3b1416' },
        fg: { light: '#d1001c', dark: '#ff6165' },
        border: { light: '#ffc3c6', dark: '#6e2226' },
        // The system's increased-contrast red, so white text passes
        solid: { light: '#e9152d', dark: '#e9152d' },
        onSolid: '#ffffff',
      },
      info: {
        bg: { light: '#e5f1ff', dark: '#0b2b4d' },
        fg: { light: '#0069c9', dark: '#5cb8ff' },
        border: { light: '#b3d6ff', dark: '#174a80' },
        solid: { light: '#0076de', dark: '#0077d6' },
        onSolid: '#ffffff',
      },
      selection: {
        bg: { light: '#b3d7ff', dark: '#1f4a7a' },
        fg: { light: '#191919', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // The open stand-in for the system face; the reference's own face follows on its devices
        sans: '"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"',
        display: '"Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        mono: '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace',
      },
      // The phone's text styles: caption 11 and 12, footnote 13, subhead 15, body 17, title 3 20,
      // title 2 22, title 1 28, large title 34; the desktop body (13) is the small step
      size: {
        xs: '0.6875rem',
        sm: '0.8125rem',
        md: '0.9375rem',
        lg: '1.0625rem',
        xl: '1.25rem',
        '2xl': '1.375rem',
        '3xl': '1.75rem',
        '4xl': '2.125rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.2', normal: '1.33', relaxed: '1.47' },
      // The system tracks text tighter as it grows (about -0.02em at 15–17px)
      tracking: { tight: '-0.022em', normal: '-0.01em', wide: '0.01em' },
      body: { weight: '400' },
      heading: { weight: '700', tracking: '-0.022em' },
    },
    // 28px small capsules, 34px by default, 44px for the large ones
    control: {
      height: {
        sm: 'calc(1.75rem * var(--m-density))',
        md: 'calc(2.125rem * var(--m-density))',
        lg: 'calc(2.75rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.375rem * var(--m-density))',
      },
      fontSize: '0.9375rem',
    },
    // 6px small, 10px rows and fields, 20px grouped cards and sheets; capsules for every control
    radius: { sm: '6px', md: '10px', lg: '20px', control: '9999px', container: '20px' },
    shadow: {
      // Round glass buttons and the selected segment: a hairline and a soft drop
      sm: {
        light: '0 0 0 0.5px rgb(0 0 0 / 0.06), 0 1px 3px rgb(0 0 0 / 0.1)',
        dark: '0 0 0 0.5px rgb(255 255 255 / 0.1), 0 1px 3px rgb(0 0 0 / 0.4)',
      },
      // Floating bars and the reactions picker
      md: {
        light: '0 0 0 0.5px rgb(0 0 0 / 0.08), 0 4px 16px rgb(0 0 0 / 0.1)',
        dark: '0 0 0 0.5px rgb(255 255 255 / 0.12), 0 4px 16px rgb(0 0 0 / 0.5)',
      },
      lg: {
        light: '0 0 0 0.5px rgb(0 0 0 / 0.08), 0 10px 30px rgb(0 0 0 / 0.12)',
        dark: '0 0 0 0.5px rgb(255 255 255 / 0.12), 0 10px 30px rgb(0 0 0 / 0.55)',
      },
      // Menus, sheets and alerts
      overlay: {
        light: '0 0 0 0.5px rgb(0 0 0 / 0.1), 0 12px 40px rgb(0 0 0 / 0.18)',
        dark: '0 0 0 0.5px rgb(255 255 255 / 0.14), 0 12px 40px rgb(0 0 0 / 0.6)',
      },
    },
    focus: { width: '3px', offset: '1px' },
    motion: {
      duration: { fast: '150ms', normal: '250ms', slow: '400ms' },
      easing: { standard: 'cubic-bezier(0.25, 0.1, 0.25, 1)', emphasized: 'cubic-bezier(0.32, 0.72, 0, 1)' },
    },
  },
  components: {
    // The sidebar of conversations (about 19rem) beside the thread
    layout: {
      containerMax: { sm: '30rem', md: '42rem', lg: '68rem' },
      containerPadding: 'clamp(1rem, 4vw, 2.5rem)',
      gridGap: 'var(--m-space-5)',
      splitSide: '19rem',
    },
    // Capsules: the system blue for the one that matters; a grey glass capsule for the rest
    button: {
      fontWeight: 'var(--m-font-weight-medium)',
      tracking: 'var(--m-font-tracking-normal)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      primary: { border: 'transparent' },
      secondary: {
        bg: { light: '#ececee', dark: '#3a3a3c' },
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        hoverBg: { light: '#e3e3e6', dark: '#444446' },
        activeBg: { light: '#d8d8dc', dark: '#4e4e50' },
      },
      ghost: {
        fg: 'var(--m-color-accent-text)',
        hoverBg: { light: '#f0f0f2', dark: '#2c2c2e' },
        activeBg: { light: '#e5e5ea', dark: '#3a3a3c' },
      },
      danger: { border: 'transparent' },
    },
    // Grouped cards: white on the grouped grey, 20px corners, no border; a faint ring keeps them
    // visible on white
    card: {
      border: 'transparent',
      shadow: { light: '0 0 0 1px rgb(0 0 0 / 0.04)', dark: 'none' },
      hoverShadow: 'var(--m-shadow-md)',
      hoverBorder: 'transparent',
      hoverTransform: 'none',
      bg: { light: '#ffffff', dark: '#2c2c2e' },
      padding: { sm: 'var(--m-space-3)', md: 'var(--m-space-4)', lg: 'var(--m-space-6)' },
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-semibold)',
      descriptionFg: 'var(--m-color-fg-muted)',
      outline: { bg: 'var(--m-color-bg-surface)', border: 'var(--m-color-border-default)' },
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    // Rounded fields with a quiet edge and the blue focus ring
    input: {
      radius: '10px',
      bg: { light: '#ffffff', dark: '#2c2c2e' },
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-accent-default)',
      paddingX: { sm: 'var(--m-space-3)', md: 'var(--m-space-3)', lg: 'var(--m-space-4)' },
    },
    select: {
      radius: '10px',
      bg: { light: '#ffffff', dark: '#2c2c2e' },
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-accent-default)',
    },
    field: {
      labelFg: 'var(--m-color-fg-muted)',
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-regular)',
      hintFontSize: 'var(--m-font-size-sm)',
    },
    // Small rounded squares that fill blue with a white tick
    checkbox: {
      size: '1rem',
      radius: '5px',
      border: 'var(--m-color-border-strong)',
      checkedBg: 'var(--m-color-accent-default)',
      checkedBorder: 'var(--m-color-accent-default)',
      mark: '#ffffff',
    },
    radio: {
      size: '1rem',
      border: 'var(--m-color-border-strong)',
      checkedBg: 'var(--m-color-accent-default)',
      checkedBorder: 'var(--m-color-accent-default)',
      dot: '#ffffff',
    },
    // The long capsule switch: green when on, grey when off, a white thumb
    switch: {
      width: '2.875rem',
      height: '1.375rem',
      smWidth: '2.25rem',
      smHeight: '1.125rem',
      trackBg: { light: '#8e8e93', dark: '#7c7c80' },
      trackCheckedBg: { light: '#248a3d', dark: '#1f9a43' },
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbShadow: '0 1px 3px rgb(0 0 0 / 0.25)',
    },
    // Lists, not grids: no frame, no header fill, inset separators, a grey hover
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: 'var(--m-space-4)',
      cellPaddingY: 'calc(0.6875rem * var(--m-density))',
      borderColor: 'var(--m-color-border-default)',
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-semibold)',
      headerTransform: 'none',
      headerTracking: '0',
      rowHoverBg: { light: '#f5f5f7', dark: '#2c2c2e' },
      stripeBg: 'var(--m-color-bg-surface)',
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    // The sidebar: the light grey glass panel (drawn opaque); the current row is solid blue
    sidebar: {
      width: '19rem',
      bg: { light: '#efeff0', dark: '#262628' },
      border: 'transparent',
      padding: 'var(--m-space-3)',
      sectionGap: 'var(--m-space-4)',
      itemGap: '0px',
      fontSize: 'var(--m-font-size-sm)',
      heading: {
        fg: 'var(--m-color-fg-muted)',
        size: 'var(--m-font-size-xs)',
        weight: 'var(--m-font-weight-semibold)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#e4e4e6', dark: '#333335' },
        activeFg: '#ffffff',
        activeBg: 'var(--m-color-accent-default)',
        activeWeight: 'var(--m-font-weight-regular)',
        radius: '10px',
        paddingX: 'var(--m-space-2)',
        paddingY: 'calc(0.5rem * var(--m-density))',
      },
      count: { bg: 'var(--m-color-accent-default)', fg: '#ffffff', radius: '9999px' },
    },
    // The toolbar: glass drawn opaque, no rule below, round glass buttons at either end
    navbar: {
      height: 'calc(3.25rem * var(--m-density))',
      paddingX: 'clamp(1rem, 3vw, 2rem)',
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      brandWeight: 'var(--m-font-weight-bold)',
      link: {
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#f0f0f2', dark: '#2c2c2e' },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: '#ececee', dark: '#3a3a3c' },
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-medium)',
        radius: '9999px',
      },
    },
    // Underline tabs are rare; the pill variant is the segmented control: a grey track and a raised
    // white capsule for the current segment
    tabs: {
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-muted)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-accent-default)',
      indicatorWidth: '2px',
      pill: {
        listBg: { light: '#ececee', dark: '#2c2c2e' },
        listRadius: '9999px',
        listPadding: '2px',
        radius: '9999px',
        activeBg: { light: '#ffffff', dark: '#5a5a5e' },
        activeShadow: 'var(--m-shadow-sm)',
      },
    },
    breadcrumb: { separator: '"›"', currentWeight: 'var(--m-font-weight-semibold)' },
    pagination: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-accent-text)',
      currentBg: 'var(--m-color-accent-default)',
      currentFg: '#ffffff',
      currentBorder: 'transparent',
    },
    // Small capsules in the system greys and tints
    badge: {
      height: '1.25rem',
      radius: '9999px',
      borderWidth: '0px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-semibold)',
      textTransform: 'none',
      tracking: '0',
      neutral: {
        bg: { light: '#ececee', dark: '#3a3a3c' },
        fg: { light: '#3c3c43', dark: '#e5e5ea' },
        border: 'transparent',
        solidBg: { light: '#6e6e73', dark: '#a1a1a6' },
        solidFg: { light: '#ffffff', dark: '#000000' },
      },
    },
    // Circles. Without a photo, white initials on the system's grey monogram (deepened to pass)
    avatar: {
      size: { sm: '1.75rem', md: '2.5rem', lg: '3.5rem' },
      bg: { light: '#76767b', dark: '#6c6c70' },
      fg: '#ffffff',
      fontWeight: 'var(--m-font-weight-semibold)',
    },
    divider: { color: 'var(--m-color-border-default)' },
    // Inline notices: a tinted rounded box, no border and no stripe
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '14px',
      padding: 'var(--m-space-3) var(--m-space-4)',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // The notification banner: a raised glass card (drawn opaque), 20px corners, a soft shadow
    toast: {
      bg: 'var(--m-color-bg-raised)',
      fg: 'var(--m-color-fg-default)',
      bodyFg: 'var(--m-color-fg-muted)',
      border: 'transparent',
      accentWidth: '0px',
      radius: '20px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-3) var(--m-space-4)',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // Sheets and alerts: the raised panel with large corners, centred bold titles
    dialog: {
      bg: { light: '#f2f2f7', dark: '#2c2c2e' },
      border: 'transparent',
      radius: '24px',
      padding: 'var(--m-space-5)',
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    // Menus: 12px corners, 13px rows that fill with the blue on hover, hairline separators
    popover: {
      border: 'transparent',
      radius: '12px',
      shadow: 'var(--m-shadow-overlay)',
      padding: '5px',
      item: {
        height: '1.75rem',
        paddingX: 'var(--m-space-3)',
        radius: '7px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: 'var(--m-color-accent-default)',
        hoverFg: '#ffffff',
      },
      separator: 'var(--m-color-border-default)',
    },
    // Small light labels with a hairline, as the desktop draws them
    tooltip: {
      bg: { light: '#f6f6f6', dark: '#3a3a3c' },
      fg: 'var(--m-color-fg-default)',
      radius: '6px',
      shadow: 'var(--m-shadow-md)',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-regular)',
      paddingY: '3px',
      paddingX: '7px',
      delay: '600ms',
    },
    progress: {
      height: { sm: '0.25rem', md: '0.25rem', lg: '0.375rem' },
      track: { light: '#e5e5ea', dark: '#3a3a3c' },
      fill: { light: '#0076de', dark: '#3d9bff' },
    },
    usage: {
      height: '0.375rem',
      track: { light: '#e5e5ea', dark: '#3a3a3c' },
      okFill: { light: '#0076de', dark: '#3d9bff' },
    },
    skeleton: {
      bg: { light: '#ececee', dark: '#2c2c2e' },
      highlight: { light: '#f5f5f7', dark: '#3a3a3c' },
      radius: '6px',
      blockRadius: '10px',
    },
    spinner: { thickness: '2.5px', color: 'var(--m-color-fg-muted)' },
    kbd: {
      fontFamily: 'var(--m-font-family-sans)',
      fontWeight: 'var(--m-font-weight-medium)',
      bg: 'var(--m-color-bg-sunken)',
      border: 'var(--m-color-border-default)',
      radius: '5px',
      shadow: 'none',
    },
    code: {
      radius: '10px',
      inlineRadius: '5px',
      border: 'transparent',
      bg: 'var(--m-color-bg-sunken)',
      comment: 'var(--m-color-fg-muted)',
      constant: 'var(--m-color-info-fg)',
    },
    // A grouped card: white, 20px corners, inset separators, the question at 17px
    accordion: {
      radius: '20px',
      bg: { light: '#ffffff', dark: '#2c2c2e' },
      border: 'transparent',
      paddingX: 'var(--m-space-4)',
      summarySize: 'var(--m-font-size-lg)',
      summaryWeight: 'var(--m-font-weight-regular)',
      hoverBg: { light: '#f5f5f7', dark: '#333335' },
    },
    prose: { maxWidth: '68ch', lineHeight: '1.47', linkFg: 'var(--m-color-accent-text)' },
    // Bubbles: yours blue with white text on the right, theirs light grey on the left, rounded to
    // 18px, no border, 2px between bubbles in a run
    chat: {
      gap: '2px',
      maxWidth: 'none',
      bubbleMaxWidth: '70%',
      radius: '18px',
      borderWidth: '0px',
      padding: '7px',
      paddingX: '12px',
      userBg: 'var(--m-color-accent-default)',
      userFg: '#ffffff',
      userBorder: 'var(--m-color-accent-default)',
      assistantBg: { light: '#e9e9eb', dark: '#3a3a3c' },
      assistantFg: 'var(--m-color-fg-default)',
      assistantBorder: { light: '#e9e9eb', dark: '#3a3a3c' },
      systemFg: 'var(--m-color-fg-muted)',
      systemFontSize: 'var(--m-font-size-xs)',
      avatarSize: '2rem',
      avatarBg: { light: '#76767b', dark: '#6c6c70' },
      avatarFg: '#ffffff',
      assistantAvatarBg: { light: '#76767b', dark: '#6c6c70' },
      assistantAvatarFg: '#ffffff',
      metaFg: 'var(--m-color-fg-subtle)',
      metaFontSize: 'var(--m-font-size-xs)',
      caretColor: 'var(--m-color-accent-default)',
    },
    // The composer: a capsule with a hairline edge; attachments in a round button beside it
    composer: {
      bg: 'var(--m-color-bg-canvas)',
      border: 'var(--m-color-border-strong)',
      focusBorder: 'var(--m-color-accent-default)',
      radius: '18px',
      shadow: 'none',
      padding: '5px var(--m-space-3)',
      gap: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-md)',
    },
    citation: { chipRadius: '9999px' },
    toolCall: { radius: '14px' },
    thinking: { radius: '10px' },
  },
});
