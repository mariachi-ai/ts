import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Chalk: a quiet, native-feeling notes-and-lists interface. Black ink on white panes beside a
 * system-grey sidebar, white inset groups on a grey grouped page, one clear blue for doing things,
 * a warm signature yellow (selected note, checked checklist circles, text selection), round
 * coloured list icons, capsule buttons and big bold titles. Dark mode is true black with
 * near-black grouped rows. Category: calm and minimal. The values are measured or taken from the
 * reference's published system colours, not invented (see DESIGN.md).
 */
export const chalk = extendTheme(minimal, {
  name: 'chalk',
  label: 'Chalk',
  description:
    'Native and calm: black ink on white panes, a system-grey sidebar, white inset groups on grey, one clear blue, a warm signature yellow, round coloured list icons and a true-black dark mode.',
  tokens: {
    color: {
      bg: {
        // The grouped page: system grey (light), true black (dark)
        canvas: { light: '#f2f2f7', dark: '#000000' },
        // Panes, inset groups, fields: white; dark grouped rows
        surface: { light: '#ffffff', dark: '#1c1c1e' },
        // Menus, popovers, sheets
        raised: { light: '#ffffff', dark: '#2c2c2e' },
        // The sidebar and wells: the grouped grey (light), the elevated grey (dark)
        sunken: { light: '#f2f2f7', dark: '#2c2c2e' },
        overlay: { light: 'rgb(0 0 0 / 0.2)', dark: 'rgb(0 0 0 / 0.5)' },
        inverse: { light: '#1c1c1e', dark: '#f2f2f7' },
      },
      fg: {
        default: { light: '#000000', dark: '#ffffff' },
        // Secondary label (#3c3c43 at 60%, 3.4:1) moved toward its own ink to the 4.5:1 floor
        muted: { light: '#636366', dark: '#98989f' },
        // Tertiary label (#3c3c43 at 30%) lifted the same way; dark is the system grey a hair lighter
        subtle: { light: '#6e6e73', dark: '#939397' },
        inverse: { light: '#ffffff', dark: '#000000' },
      },
      border: {
        // Separators: the measured hairline; dark the opaque separator
        default: { light: '#e5e5ea', dark: '#38383a' },
        muted: { light: '#efeff4', dark: '#2c2c2e' },
        // Controls (empty checklist circles, field edges): the system grey stepped to 3:1
        strong: { light: '#8b8b90', dark: '#6c6c70' },
        focus: { light: '#1e6ef4', dark: '#0091ff' },
      },
      // The system blue at its own increased-contrast step, so white text meets 4.5:1
      accent: {
        default: '#1e6ef4',
        hover: '#1b63dc',
        active: '#1858c3',
        subtle: { light: '#e0f1ff', dark: '#0e2a42' },
        fg: '#ffffff',
        text: { light: '#1c65e0', dark: '#0d97ff' },
      },
      // The signature yellow: the selected note, checked checklist circles, folder glyphs, the mark
      brand: {
        default: { light: '#e4af09', dark: '#ffd60a' },
        fg: '#000000',
        subtle: { light: '#fbe59b', dark: '#605418' },
      },
      // Each status solid is the reference's own increased-contrast colour (white text 4.5:1)
      success: {
        bg: { light: '#e3f7e8', dark: '#20402a' },
        fg: { light: '#007f2f', dark: '#30d158' },
        border: { light: '#b8ebc5', dark: '#246435' },
        solid: '#008932',
        onSolid: '#ffffff',
      },
      // Orange, the flag colour
      warning: {
        bg: { light: '#ffefe1', dark: '#493422' },
        fg: { light: '#b74d00', dark: '#ff9230' },
        border: { light: '#ffd7b4', dark: '#774b25' },
        solid: '#c55300',
        onSolid: '#ffffff',
      },
      danger: {
        bg: { light: '#ffe7e8', dark: '#492426' },
        fg: { light: '#d41329', dark: '#ff6165' },
        border: { light: '#ffc3c5', dark: '#772b2e' },
        solid: '#e9152d',
        onSolid: '#ffffff',
      },
      info: {
        bg: { light: '#e0f1ff', dark: '#163650' },
        fg: { light: '#1c65e0', dark: '#5cb8ff' },
        border: { light: '#b3dbff', dark: '#114b78' },
        solid: '#1e6ef4',
        onSolid: '#ffffff',
      },
      // Selected text is highlighted in the yellow
      selection: {
        bg: { light: '#fbe59b', dark: '#605418' },
        fg: { light: '#000000', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // The reference's system face is proprietary; Inter with optical sizes is its closest open kin
        sans: '"Inter Variable", "Inter", ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Segoe UI Emoji", "Noto Color Emoji"',
        display: '"Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif',
        mono: '"Roboto Mono Variable", "Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      // The phone type ramp (caption 12, footnote 13, subhead 15, body 17, title 20/22/28, large title 34)
      size: {
        xs: '0.75rem',
        sm: '0.8125rem',
        md: '0.9375rem',
        lg: '1.0625rem',
        xl: '1.25rem',
        '2xl': '1.375rem',
        '3xl': '1.75rem',
        '4xl': '2.125rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.2', normal: '1.35', relaxed: '1.5' },
      tracking: { tight: '-0.01em', normal: '0', wide: '0.02em' },
      heading: { weight: '700', tracking: '0' },
    },
    control: {
      height: {
        sm: 'calc(1.75rem * var(--m-density))',
        md: 'calc(2.25rem * var(--m-density))',
        lg: 'calc(2.75rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.375rem * var(--m-density))',
      },
      fontSize: '0.9375rem',
    },
    // 6px small, 10px rows and fields, 14px menus and tiles, 16px panels and sheets; capsule buttons
    radius: { sm: '6px', md: '10px', lg: '14px', control: '10px', container: '16px' },
    borderWidth: { control: '1px' },
    shadow: {
      // Glass controls: a half-pixel edge and a soft lift
      sm: {
        light: '0 0 0 0.5px rgb(0 0 0 / 0.06), 0 1px 3px rgb(0 0 0 / 0.1)',
        dark: '0 0 0 0.5px rgb(255 255 255 / 0.12), 0 1px 3px rgb(0 0 0 / 0.5)',
      },
      md: {
        light: '0 0 0 0.5px rgb(0 0 0 / 0.05), 0 4px 16px rgb(0 0 0 / 0.08)',
        dark: '0 0 0 0.5px rgb(255 255 255 / 0.1), 0 4px 16px rgb(0 0 0 / 0.5)',
      },
      // Menus and popovers
      lg: {
        light: '0 0 0 0.5px rgb(0 0 0 / 0.08), 0 8px 28px rgb(0 0 0 / 0.14)',
        dark: '0 0 0 0.5px rgb(255 255 255 / 0.14), 0 8px 28px rgb(0 0 0 / 0.6)',
      },
      // Sheets, alerts and banners
      overlay: {
        light: '0 0 0 0.5px rgb(0 0 0 / 0.08), 0 20px 60px rgb(0 0 0 / 0.22)',
        dark: '0 0 0 0.5px rgb(255 255 255 / 0.14), 0 20px 60px rgb(0 0 0 / 0.7)',
      },
    },
    focus: { width: '3px', offset: '1px' },
    motion: {
      duration: { fast: '150ms', normal: '250ms', slow: '400ms' },
      easing: { standard: 'cubic-bezier(0.25, 0.1, 0.25, 1)', emphasized: 'cubic-bezier(0.32, 0.72, 0, 1)' },
    },
  },
  components: {
    // A floating 280px sidebar, a list column, the editor; grouped pages in a narrow column
    layout: {
      containerMax: { sm: '30rem', md: '44rem', lg: '68rem' },
      containerPadding: 'clamp(1rem, 4vw, 2rem)',
      gridGap: 'var(--m-space-4)',
      splitSide: '17.5rem',
      splitGap: '0',
    },
    // Capsules: solid blue for the one that matters, a grey fill for the rest, blue text for quiet ones
    button: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-medium)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      primary: { border: 'transparent' },
      secondary: {
        bg: { light: '#e9e9eb', dark: '#3a3a3c' },
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        hoverBg: { light: '#dedee1', dark: '#48484a' },
        activeBg: { light: '#d1d1d6', dark: '#545456' },
      },
      ghost: {
        fg: 'var(--m-color-accent-text)',
        hoverBg: { light: '#e9e9eb', dark: '#2c2c2e' },
        activeBg: { light: '#dedee1', dark: '#3a3a3c' },
      },
      danger: { border: 'transparent' },
    },
    // Inset groups: white on the grouped grey, no border, no shadow
    card: {
      border: 'transparent',
      shadow: 'none',
      hoverShadow: 'none',
      hoverBorder: 'transparent',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-3)', md: 'var(--m-space-5)', lg: 'var(--m-space-6)' },
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-semibold)',
      descriptionSize: 'var(--m-font-size-sm)',
      // The recessed variant: the neutral fill (the page itself is already the grouped grey)
      sunken: { bg: { light: '#e9e9eb', dark: '#1c1c1e' }, border: 'transparent' },
    },
    input: {
      hoverBorder: 'var(--m-color-fg-subtle)',
      focusBorder: 'var(--m-color-accent-default)',
    },
    field: {
      labelFontSize: 'var(--m-font-size-md)',
      labelFontWeight: 'var(--m-font-weight-regular)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    // Round checklist circles
    checkbox: {
      size: '1.375rem',
      radius: '9999px',
      borderWidth: '1.5px',
      hoverBorder: 'var(--m-color-fg-subtle)',
    },
    radio: { borderWidth: '1.5px' },
    // The wide capsule switch, blue when on
    switch: {
      width: '3.125rem',
      height: '1.75rem',
      smWidth: '2.5rem',
      smHeight: '1.375rem',
      trackBg: 'var(--m-color-border-strong)',
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbShadow: '0 1px 3px rgb(0 0 0 / 0.2)',
    },
    // Lists, not grids: an inset white group, light column labels, separators between rows
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingY: 'calc(0.6875rem * var(--m-density))',
      headerBg: 'var(--m-color-bg-surface)',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-medium)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      rowHoverBg: 'var(--m-color-bg-sunken)',
      stripeBg: 'var(--m-color-bg-sunken)',
      wrapBorder: 'transparent',
      wrapRadius: 'var(--m-radius-container)',
    },
    // The grey sidebar: plain rows, a solid blue current row, grey counts with no pill
    sidebar: {
      width: '17.5rem',
      bg: 'var(--m-color-bg-sunken)',
      border: 'transparent',
      padding: 'var(--m-space-3)',
      sectionGap: 'var(--m-space-5)',
      itemGap: '2px',
      fontSize: 'var(--m-font-size-md)',
      heading: {
        fg: 'var(--m-color-fg-subtle)',
        size: 'var(--m-font-size-sm)',
        weight: 'var(--m-font-weight-semibold)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#e5e5ea', dark: '#3a3a3c' },
        activeFg: 'var(--m-color-accent-fg)',
        activeBg: 'var(--m-color-accent-default)',
        activeWeight: 'var(--m-font-weight-regular)',
        radius: '10px',
        paddingX: 'var(--m-space-2)',
        paddingY: 'calc(0.375rem * var(--m-density))',
      },
      count: { bg: 'transparent', fg: 'var(--m-color-fg-subtle)' },
    },
    // A translucent bar that the content scrolls under, no rule
    navbar: {
      height: 'calc(3.25rem * var(--m-density))',
      bg: 'var(--m-color-bg-surface)',
      border: 'transparent',
      brandWeight: 'var(--m-font-weight-bold)',
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-accent-text)',
        activeBg: 'transparent',
        fontWeight: 'var(--m-font-weight-regular)',
        radius: '9999px',
      },
    },
    // Segmented control: a grey capsule track, the chosen segment a white capsule
    tabs: {
      fontWeight: 'var(--m-font-weight-medium)',
      pill: {
        listBg: { light: '#e9e9eb', dark: '#2c2c2e' },
        listRadius: '9999px',
        listPadding: '2px',
        radius: '9999px',
        activeBg: { light: '#ffffff', dark: '#636366' },
        activeShadow: 'var(--m-shadow-sm)',
      },
    },
    breadcrumb: { separator: '"›"', currentWeight: 'var(--m-font-weight-semibold)' },
    pagination: { radius: '9999px' },
    // Tag chips: grey capsules, sentence case
    badge: {
      height: '1.5rem',
      paddingX: 'var(--m-space-3)',
      radius: '9999px',
      borderWidth: '0px',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
      neutral: {
        bg: { light: '#e9e9eb', dark: '#3a3a3c' },
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
      },
    },
    // Monogram circles: the grey contact disc with white initials
    avatar: {
      size: { sm: '1.5rem', md: '2rem', lg: '2.75rem' },
      bg: { light: '#6e6e73', dark: '#636366' },
      fg: '#ffffff',
    },
    divider: { labelTransform: 'none', labelTracking: '0', labelFontSize: 'var(--m-font-size-sm)' },
    // Banners: a tinted rounded card, no border, no side stripe
    alert: {
      // The neutral banner is the grey fill, so it shows on white panes and on the grouped grey
      bg: { light: '#e9e9eb', dark: '#2c2c2e' },
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '14px',
      padding: 'var(--m-space-3) var(--m-space-4)',
      fontSize: 'var(--m-font-size-md)',
    },
    // The notification banner: a raised rounded card with a soft lift
    toast: {
      border: 'transparent',
      accentWidth: '0px',
      radius: '20px',
      padding: 'var(--m-space-3) var(--m-space-4)',
      fontSize: 'var(--m-font-size-md)',
    },
    // Sheets and alerts: 20px corners, no border, a deep soft shadow
    dialog: {
      border: 'transparent',
      radius: '20px',
      titleSize: 'var(--m-font-size-lg)',
    },
    // Menus: rounded glass, rows highlighted in solid blue
    popover: {
      border: 'transparent',
      radius: '14px',
      padding: '5px',
      item: {
        height: '1.875rem',
        paddingX: 'var(--m-space-2)',
        radius: '8px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: 'var(--m-color-accent-default)',
        hoverFg: 'var(--m-color-accent-fg)',
      },
      labelFg: 'var(--m-color-fg-subtle)',
      separator: 'var(--m-color-border-default)',
    },
    // The desktop tooltip: a small pale box with a hairline, plain text
    tooltip: {
      bg: 'var(--m-color-bg-raised)',
      fg: 'var(--m-color-fg-default)',
      radius: '6px',
      shadow: 'var(--m-shadow-lg)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
      delay: '700ms',
    },
    progress: {
      height: { sm: '0.1875rem', md: '0.25rem', lg: '0.375rem' },
      track: { light: '#e5e5ea', dark: '#3a3a3c' },
    },
    usage: { height: '0.25rem', track: { light: '#e5e5ea', dark: '#3a3a3c' } },
    skeleton: {
      bg: { light: '#e5e5ea', dark: '#2c2c2e' },
      highlight: { light: '#f2f2f7', dark: '#3a3a3c' },
      radius: '6px',
      blockRadius: '16px',
    },
    // The activity indicator is grey, not blue
    spinner: { thickness: '2px', color: 'var(--m-color-fg-subtle)' },
    // Shortcuts are glyphs in the system face (⌘N), on a quiet fill
    kbd: {
      fontFamily: 'var(--m-font-body-family)',
      fontWeight: 'var(--m-font-weight-regular)',
      bg: 'var(--m-color-bg-sunken)',
      border: 'transparent',
      radius: '6px',
      shadow: 'none',
    },
    code: { border: 'transparent', radius: '10px', inlineBorder: 'transparent' },
    // Collapsible sections: bold headings with a chevron, hairlines between
    accordion: {
      border: 'transparent',
      radius: 'var(--m-radius-container)',
      paddingX: 'var(--m-space-4)',
      summarySize: 'var(--m-font-size-lg)',
      summaryWeight: 'var(--m-font-weight-semibold)',
      contentFg: 'var(--m-color-fg-default)',
    },
    prose: {
      maxWidth: '70ch',
      lineHeight: '1.5',
      h1Size: 'var(--m-font-size-3xl)',
      h2Size: 'var(--m-font-size-2xl)',
      h3Size: 'var(--m-font-size-lg)',
      h2Border: 'transparent',
      quoteBorder: 'var(--m-color-border-strong)',
    },
    // Message bubbles: yours in blue, replies in grey
    chat: {
      radius: '18px',
      userBg: 'var(--m-color-accent-default)',
      userFg: '#ffffff',
      userBorder: 'var(--m-color-accent-default)',
      assistantBg: { light: '#e9e9eb', dark: '#2c2c2e' },
      assistantBorder: 'transparent',
      avatarBg: 'var(--m-color-bg-sunken)',
    },
    composer: { radius: '22px', border: 'var(--m-color-border-strong)', shadow: 'var(--m-shadow-sm)' },
    citation: { chipRadius: '9999px' },
    toolCall: { radius: '12px', border: 'var(--m-color-border-default)' },
  },
});
