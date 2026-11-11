import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Ember: a friendly, plain-spoken money app. A pale mint screen with white rounded cards, deep navy
 * text, one clear blue for every action, heavy wide headings, pill buttons and pale pill secondaries,
 * grouped list rows with line icons, and amounts with small pence. Navy is the dark mode, and the
 * slab colour in light mode. Category: calm fintech. The values are the reference's own web tokens,
 * read from its stylesheets, and measured off its site and app screens (see DESIGN.md).
 */

// The quiet fill the app puts behind grouped rows and pale pills, and its dark-mode counterpart
const fill = { light: '#f4f5f5', dark: '#1a2c3d' };
// The pale pill behind secondary actions ("Upgrade", "Done", "Cancel")
const pill = { light: '#e5eee8', dark: '#173247' };
const pillHover = { light: '#d9e6dd', dark: '#1d3d55' };
const pillActive = { light: '#cddcd2', dark: '#234762' };
// The action blue's text step: links, ghost buttons, the pale pill's label
const blueText = { light: '#006596', dark: '#5db4e3' };

export const ember = extendTheme(minimal, {
  name: 'ember',
  label: 'Ember',
  description:
    'Friendly and plain: deep navy on a pale mint screen, white rounded cards, one clear blue for actions, heavy wide headings and pill buttons.',
  tokens: {
    color: {
      bg: {
        // The app's screen and the site's panels are the same pale mint; cards sit on it in white
        canvas: { light: '#f2f8f3', dark: '#091723' },
        surface: { light: '#ffffff', dark: '#112231' },
        raised: { light: '#ffffff', dark: '#1a2c3d' },
        sunken: fill,
        overlay: { light: 'rgb(9 23 35 / 0.5)', dark: 'rgb(0 0 0 / 0.6)' },
        // Navy slabs (the footer, the not-found page, account cards); a lifted blue-navy in dark
        inverse: { light: '#091723', dark: '#1d4466' },
      },
      fg: {
        default: { light: '#091723', dark: '#ffffff' },
        // The web app's secondary text, and the site's 60% navy for quieter lines
        muted: { light: '#4d5870', dark: '#c3c8cf' },
        subtle: { light: '#5f6b76', dark: '#a3adb8' },
        inverse: { light: '#ffffff', dark: '#ffffff' },
      },
      border: {
        // Hairlines: the web tokens' border-color-primary
        default: { light: '#e1e3e7', dark: '#24384a' },
        muted: { light: '#edf0ee', dark: '#1a2c3d' },
        // Control borders: the reference's hover grey (its resting grey is under 3:1; see the notes)
        strong: { light: '#7e8898', dark: '#7a8a9b' },
        // The reference's focus border
        focus: { light: '#247baf', dark: '#5db4e3' },
      },
      accent: {
        // The action blue. The reference's resting blue (#2991cc) is 3.5:1 under white text, so the
        // resting fill is its own hover step and hover is its pressed step
        default: { light: '#007cb4', dark: '#007cb4' },
        hover: { light: '#006596', dark: '#006596' },
        active: { light: '#005680', dark: '#005680' },
        subtle: { light: '#e3f1f9', dark: '#0f3149' },
        fg: '#ffffff',
        text: blueText,
      },
      // Money in and positive moments are a clear green
      success: {
        bg: { light: '#e9f7ee', dark: '#0e2f22' },
        fg: { light: '#007a32', dark: '#5ddc8a' },
        border: { light: '#34c759', dark: '#1f7a43' },
        solid: { light: '#008838', dark: '#008838' },
        onSolid: { light: '#ffffff', dark: '#ffffff' },
      },
      warning: {
        bg: { light: '#fff5e3', dark: '#33270f' },
        fg: { light: '#7d4e00', dark: '#f5c46a' },
        border: { light: '#f5c97a', dark: '#6a5222' },
        solid: { light: '#f5a623', dark: '#f5a623' },
        onSolid: { light: '#091723', dark: '#091723' },
      },
      // Errors and destructive actions: the brand's coral-red family
      danger: {
        bg: { light: '#fff3f2', dark: '#3a1715' },
        fg: { light: '#c82f1f', dark: '#ff8a80' },
        border: { light: '#ff4b44', dark: '#ff6a5f' },
        solid: { light: '#dd3524', dark: '#dd3524' },
        onSolid: { light: '#ffffff', dark: '#ffffff' },
      },
      // Information: a pale wash of the action blue with navy text
      info: {
        bg: { light: '#e8f3fa', dark: '#0f2a3d' },
        fg: { light: '#14233c', dark: '#cfe6f5' },
        border: { light: '#bedeef', dark: '#24506e' },
        solid: { light: '#007cb4', dark: '#007cb4' },
        onSolid: '#ffffff',
      },
      selection: {
        bg: { light: '#bedeef', dark: '#24506e' },
        fg: { light: '#091723', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // A wide, friendly grotesque with a straight-tailed y; the reference's own face is proprietary
        sans: '"Golos Text", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        display: '"Golos Text", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        mono: '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      // The site's modular scale (1.25): 13.3, 16, 20, 25, 31, 39, 49
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.25rem',
        xl: '1.5625rem',
        '2xl': '1.9531rem',
        '3xl': '2.4414rem',
        '4xl': '3.0518rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '800' },
      leading: { tight: '1.2', normal: '1.4', relaxed: '1.5' },
      tracking: { tight: '-0.01em', normal: '0', wide: '0.04em' },
      body: { weight: '400' },
      heading: { weight: '800', tracking: '-0.01em' },
    },
    control: {
      // Buttons and inputs are 48px (12px + 22px line + 12px + borders); small ones 38px
      height: {
        sm: 'calc(2.375rem * var(--m-density))',
        md: 'calc(3rem * var(--m-density))',
        lg: 'calc(3.5rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(1rem * var(--m-density))',
        md: 'calc(1.5rem * var(--m-density))',
        lg: 'calc(2rem * var(--m-density))',
      },
      fontSize: '1rem',
    },
    // 4px tags, 6px inputs and selects, 16px cards and sheets; buttons and chips are pills
    radius: { sm: '4px', md: '6px', lg: '16px' },
    shadow: {
      // The web card shadow: a 1px drop and an 8px haze
      sm: {
        light: '0 1px 0 rgb(17 17 26 / 0.05), 0 0 8px rgb(17 17 26 / 0.1)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.06)',
      },
      // The web dialog shadow
      md: {
        light: '0 1px 6px 0 rgb(0 0 0 / 0.2)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.08), 0 4px 12px rgb(0 0 0 / 0.4)',
      },
      // The plan cards' green-tinted lift
      lg: {
        light:
          '0 2px 4px 0 rgb(63 104 70 / 0.08), 0 4px 8px 0 rgb(63 104 70 / 0.05), 0 10px 24px rgb(63 104 70 / 0.08)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.08), 0 10px 24px rgb(0 0 0 / 0.45)',
      },
      // The layered sheet shadow from the cookie and dialog sheets
      overlay: {
        light:
          '0 0.4px 2.8px rgb(0 0 0 / 0.02), 0 1.1px 6.7px rgb(0 0 0 / 0.03), 0 2px 12.5px rgb(0 0 0 / 0.035), 0 3.6px 22.3px rgb(0 0 0 / 0.045), 0 6.7px 41.8px rgb(0 0 0 / 0.05), 0 16px 100px rgb(0 0 0 / 0.07)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.08), 0 22px 40px rgb(0 0 0 / 0.55)',
      },
    },
    motion: {
      duration: { fast: '150ms', normal: '200ms', slow: '400ms' },
      easing: { standard: 'ease-out', emphasized: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
    },
  },
  components: {
    // Wide pages with generous gutters; a login-width column; a white side column
    layout: {
      containerMax: { sm: '27.5rem', md: '45rem', lg: '72rem' },
      containerPadding: 'clamp(1rem, 4vw, 4rem)',
      gridGap: 'var(--m-space-4)',
      splitSide: '15rem',
    },
    // Every button is a pill at 600: solid blue for the action, a pale pill with blue text for the
    // rest, blue text alone for quiet ones
    button: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-semibold)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      secondary: { bg: pill, fg: blueText, border: 'transparent', hoverBg: pillHover, activeBg: pillActive },
      // Ghost hover has to show on the mint screen as well as on white cards
      ghost: {
        fg: blueText,
        hoverBg: { light: '#e8eee9', dark: '#1a2c3d' },
        activeBg: { light: '#dde6df', dark: '#22374a' },
      },
      danger: {
        bg: { light: '#dd3524', dark: '#dd3524' },
        fg: '#ffffff',
        border: { light: '#dd3524', dark: '#dd3524' },
        hoverBg: { light: '#c82f1f', dark: '#c82f1f' },
        activeBg: { light: '#b02718', dark: '#b02718' },
      },
    },
    // Inputs: 48px, 6px corners, white, a grey border that darkens on hover and turns blue on focus
    input: {
      bg: 'var(--m-color-bg-surface)',
      hoverBorder: { light: '#4d5870', dark: '#c3c8cf' },
      invalidBorder: 'var(--m-color-danger-border)',
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.25rem * var(--m-density))',
      },
      paddingY: '0.75rem',
    },
    select: {
      bg: 'var(--m-color-bg-surface)',
      hoverBorder: { light: '#4d5870', dark: '#c3c8cf' },
      invalidBorder: 'var(--m-color-danger-border)',
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.25rem * var(--m-density))',
      },
    },
    field: {
      gap: 'var(--m-space-2)',
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: 'var(--m-font-size-md)',
      labelFontWeight: 'var(--m-font-weight-regular)',
      hintFg: 'var(--m-color-fg-muted)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    checkbox: { size: '1.5rem', radius: '4px', hoverBorder: { light: '#4d5870', dark: '#c3c8cf' } },
    radio: { size: '1.5rem' },
    // The phone's switch: 51 × 31, blue when on, a white knob with a soft shadow
    switch: {
      width: '3.1875rem',
      height: '1.9375rem',
      thumbInset: '2px',
      thumbCheckedBg: '#ffffff',
      thumbShadow: '0 3px 8px rgb(0 0 0 / 0.15), 0 1px 1px rgb(0 0 0 / 0.16)',
    },
    // White cards on the mint screen: 16px corners, no border, no resting shadow
    card: {
      border: 'transparent',
      shadow: 'none',
      hoverShadow: 'var(--m-shadow-lg)',
      hoverBorder: 'transparent',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-5)', lg: 'var(--m-space-8)' },
      titleFamily: 'var(--m-font-family-sans)',
      titleSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
      outline: { bg: 'var(--m-color-bg-surface)', border: 'var(--m-color-border-default)' },
      sunken: { bg: 'var(--m-color-bg-canvas)', border: 'transparent' },
    },
    // The web table: a white body, bold sentence-case headers under a hairline, striped rows
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: '0.75rem',
      cellPaddingY: '0.75rem',
      headerBg: 'var(--m-color-bg-surface)',
      headerFg: 'var(--m-color-fg-default)',
      headerFontSize: 'var(--m-font-size-md)',
      headerFontWeight: '700',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      stripeBg: { light: '#f7f7f7', dark: '#0e1e2d' },
      rowHoverBg: { light: '#ededed', dark: '#1a2c3d' },
      wrapBorder: 'transparent',
      wrapRadius: '16px',
    },
    // A white side column like the app's tab bar: grey items, the current one in blue on a pale pill
    sidebar: {
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-default)',
      fontSize: 'var(--m-font-size-md)',
      padding: 'var(--m-space-4)',
      itemGap: '2px',
      link: {
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: fill,
        activeFg: blueText,
        activeBg: 'var(--m-color-accent-subtle)',
        activeWeight: 'var(--m-font-weight-semibold)',
        radius: '9999px',
        paddingX: 'var(--m-space-4)',
        paddingY: 'calc(var(--m-space-2) * var(--m-density))',
      },
      heading: {
        fg: 'var(--m-color-fg-muted)',
        size: 'var(--m-font-size-sm)',
        weight: 'var(--m-font-weight-semibold)',
        transform: 'none',
        tracking: '0',
      },
      count: { bg: 'var(--m-color-accent-subtle)', fg: blueText, radius: '9999px' },
    },
    // The site header: white, 16px links in quiet navy as pills, a pale mint pill for the current one
    navbar: {
      height: '5.25rem',
      border: 'transparent',
      shadow: 'none',
      brandFamily: 'var(--m-font-family-display)',
      brandWeight: '800',
      brandSize: 'var(--m-font-size-xl)',
      link: {
        radius: '9999px',
        paddingX: '0.75rem',
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-regular)',
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'var(--m-color-bg-canvas)',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'var(--m-color-bg-canvas)',
      },
    },
    // Tabs: 16px bold, grey, the current one blue with a 2px blue line; the segmented control is a
    // grey pill track with a white knob
    tabs: {
      fontSize: 'var(--m-font-size-md)',
      fontWeight: '700',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: blueText,
      indicator: 'var(--m-color-accent-default)',
      indicatorWidth: '2px',
      listBorder: 'var(--m-color-border-default)',
      pill: {
        listBg: { light: '#eeeeee', dark: '#1a2c3d' },
        listRadius: '9999px',
        listPadding: '3px',
        radius: '9999px',
        activeBg: 'var(--m-color-bg-surface)',
        activeShadow: '0 0 0 1px var(--m-color-border-default), 0 1px 3px rgb(9 23 35 / 0.12)',
      },
    },
    // Page numbers: quiet grey, the current one a navy square with 5px corners
    pagination: {
      radius: '6px',
      border: 'transparent',
      fg: 'var(--m-color-fg-muted)',
      hoverBg: fill,
      currentBg: 'var(--m-color-bg-inverse)',
      currentFg: 'var(--m-color-fg-inverse)',
      currentBorder: 'transparent',
    },
    breadcrumb: {
      separator: '"›"',
      fg: blueText,
      hoverFg: 'var(--m-color-accent-hover)',
      currentFg: 'var(--m-color-fg-default)',
    },
    // Badges are small bold capitals in a pill
    badge: {
      height: '1.5rem',
      paddingX: '0.625rem',
      radius: '9999px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: '700',
      textTransform: 'uppercase',
      tracking: '0.02em',
      neutral: {
        bg: 'var(--m-color-bg-canvas)',
        fg: 'var(--m-color-fg-default)',
        border: 'var(--m-color-border-default)',
      },
    },
    // Initials on a pastel: the teal step of the reference's avatar palette, darkened to read
    avatar: {
      size: { sm: '1.5rem', md: '2.5rem', lg: '4rem' },
      bg: { light: '#d2e4e8', dark: '#16394a' },
      fg: { light: '#155a6a', dark: '#a6d8e4' },
      fontWeight: 'var(--m-font-weight-semibold)',
    },
    // Notices: a pale wash in the tone with a 1px border of the tone, 6px corners, no stripe
    alert: {
      borderWidth: '1px',
      accentWidth: '0px',
      radius: '6px',
      padding: 'var(--m-space-4)',
      gap: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // A navy banner with white text, whatever the tone
    toast: {
      bg: 'var(--m-color-bg-inverse)',
      fg: 'var(--m-color-fg-inverse)',
      bodyFg: { light: '#c3c8cf', dark: '#d7e6f2' },
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '12px',
      shadow: 'var(--m-shadow-md)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    dialog: {
      border: 'transparent',
      radius: '16px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-6)',
      titleFamily: 'var(--m-font-family-display)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: '800',
      descriptionFg: 'var(--m-color-fg-muted)',
    },
    popover: {
      border: 'transparent',
      radius: '12px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-2)',
      item: {
        height: '2.75rem',
        paddingX: 'var(--m-space-3)',
        radius: '8px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: fill,
        hoverFg: 'var(--m-color-fg-default)',
      },
    },
    // The toggletip: a navy chip with light text, 5px corners, roomy padding
    tooltip: {
      radius: '5px',
      shadow: 'none',
      paddingX: 'var(--m-space-3)',
      paddingY: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
    },
    progress: {
      height: { sm: '0.25rem', md: '0.375rem', lg: '0.5rem' },
      radius: '9999px',
      track: 'var(--m-color-border-default)',
      // The bar takes the brighter action blue in dark, to stand off the track
      fill: { light: '#007cb4', dark: '#2991cc' },
    },
    accordion: {
      radius: '8px',
      bg: 'var(--m-color-bg-surface)',
      paddingX: 'var(--m-space-4)',
      paddingY: '1.125rem',
      summarySize: 'var(--m-font-size-md)',
      summaryWeight: 'var(--m-font-weight-semibold)',
      contentFg: 'var(--m-color-fg-muted)',
    },
    skeleton: {
      bg: { light: '#e1e3e7', dark: '#1a2c3d' },
      highlight: { light: '#eef0f2', dark: '#22374a' },
      duration: '1.2s',
    },
    spinner: { color: 'var(--m-color-accent-default)', duration: '0.8s' },
    kbd: { radius: '4px', shadow: 'none', fontWeight: 'var(--m-font-weight-medium)' },
    code: { radius: '8px', inlineRadius: '4px', inlineBg: 'var(--m-color-bg-canvas)', bg: 'var(--m-color-bg-canvas)' },
    prose: { linkFg: blueText, linkDecoration: 'underline', maxWidth: '40rem' },
    // Support chat: the person's messages in blue, the other side on white, 16px corners
    chat: {
      radius: '16px',
      userBg: 'var(--m-color-accent-default)',
      userFg: 'var(--m-color-accent-fg)',
      userBorder: 'transparent',
      assistantBg: 'var(--m-color-bg-surface)',
      assistantBorder: 'transparent',
    },
    composer: { radius: '24px', focusBorder: 'var(--m-color-accent-default)' },
    citation: { chipBg: 'var(--m-color-accent-subtle)', chipFg: blueText, chipRadius: '9999px' },
    toolCall: { radius: '12px', statusRadius: '9999px' },
    usage: { radius: '9999px', okFill: 'var(--m-color-success-solid)' },
  },
});
