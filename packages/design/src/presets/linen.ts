import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Linen: a calm, quiet task interface. A pale blue-grey sidebar of lists beside a white page, bold
 * list titles, small rounded checkboxes, blue section headings over a hairline, outlined tag pills,
 * one soft blue for actions and a pink-red only for what's due. Dark mode is a soft charcoal, never
 * black. Motion is short and lightly sprung. Category: calm and minimal. Values are measured from the
 * reference's own screenshots (see DESIGN.md).
 */
export const linen = extendTheme(minimal, {
  name: 'linen',
  label: 'Linen',
  description:
    'Calm and quiet: a pale blue-grey list sidebar beside a white page, bold titles, small rounded checkboxes, blue headings over a hairline, outlined tags and a soft charcoal dark mode.',
  tokens: {
    color: {
      bg: {
        // The page is white; dark mode is a soft charcoal
        canvas: { light: '#ffffff', dark: '#242529' },
        surface: { light: '#ffffff', dark: '#26272b' },
        raised: { light: '#ffffff', dark: '#2e2f33' },
        // Quiet panels (the day's calendar box, code, skeletons): a breath of grey
        sunken: { light: '#f5f7f9', dark: '#2e2f33' },
        overlay: { light: 'rgb(30 34 40 / 0.28)', dark: 'rgb(0 0 0 / 0.55)' },
        // The date picker's slate: tooltips and inverse flags
        inverse: { light: '#252d38', dark: '#e4e6ea' },
      },
      fg: {
        default: { light: '#1f2125', dark: '#f4f4f6' },
        // The reference's project-name grey (#8d9095, 3.2:1) darkened to the 4.5:1 floor on panels
        muted: { light: '#6c6f74', dark: '#b4b5b7' },
        subtle: { light: '#727579', dark: '#9a9b9f' },
        inverse: { light: '#ffffff', dark: '#1f2125' },
      },
      border: {
        // Hairlines under headings and between groups
        default: { light: '#e6e8eb', dark: '#38393d' },
        muted: { light: '#f0f1f3', dark: '#2f3034' },
        // Checkbox and field edges: the reference's filter grey, which meets 3:1 (its own #b9bdc0 doesn't)
        strong: { light: '#8e9196', dark: '#7a7b80' },
        focus: { light: '#2f6fdf', dark: '#6aaeff' },
      },
      // The soft blue: a step deeper than the reference's #5998fe so white text meets 4.5:1
      accent: {
        default: { light: '#2f6fdf', dark: '#2f6fd6' },
        hover: { light: '#2963cc', dark: '#2a64c4' },
        active: { light: '#2458b8', dark: '#2459b0' },
        subtle: { light: '#e3edfd', dark: '#253652' },
        fg: '#ffffff',
        // Section headings and links: the reference's own heading blue
        text: { light: '#0062c1', dark: '#6aaeff' },
      },
      // The public site's pink (#f92f65, the free-trial button), a step deeper so white text meets 4.5:1
      brand: {
        default: { light: '#dd225c', dark: '#dd225c' },
        fg: '#ffffff',
        subtle: { light: '#fde8ee', dark: '#3a2129' },
      },
      success: {
        bg: { light: '#e1f2ea', dark: '#1e3529' },
        fg: { light: '#1d6b4c', dark: '#7fd1a4' },
        border: { light: '#bde1d3', dark: '#2c5440' },
        solid: { light: '#2a8550', dark: '#27794a' },
        onSolid: '#ffffff',
      },
      warning: {
        bg: { light: '#fdf3d6', dark: '#3a3220' },
        fg: { light: '#8a5a00', dark: '#f0c75e' },
        border: { light: '#f3dd9b', dark: '#5c4b24' },
        // The star's yellow, with ink on it
        solid: { light: '#f5c400', dark: '#e8b900' },
        onSolid: { light: '#1f2125', dark: '#1f2125' },
      },
      // Due and overdue: the reference's pink-red
      danger: {
        bg: { light: '#fef0f3', dark: '#3a2129' },
        fg: { light: '#c9134a', dark: '#ff7a96' },
        border: { light: '#f8c9d5', dark: '#5e2a39' },
        solid: { light: '#d81b52', dark: '#c62c55' },
        onSolid: '#ffffff',
      },
      info: {
        bg: { light: '#e8f1fd', dark: '#1f3350' },
        fg: { light: '#0062c1', dark: '#8cc4ff' },
        border: { light: '#c5dbf8', dark: '#2d4a73' },
        solid: { light: '#2f6fdf', dark: '#2f6fd6' },
        onSolid: '#ffffff',
      },
      // The highlighted row: a pale blue in light, a deep blue in dark
      selection: {
        bg: { light: '#bad1fb', dark: '#274174' },
        fg: { light: '#1f2125', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // The reference uses the system's own grotesque; Geist is the open face closest in width and form
        sans: '"Geist Variable", "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        display: '"Geist Variable", "Geist", ui-sans-serif, system-ui, -apple-system, sans-serif',
        mono: '"Geist Mono Variable", "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      size: {
        xs: '0.6875rem',
        sm: '0.8125rem',
        md: '0.9375rem',
        lg: '1.0625rem',
        xl: '1.25rem',
        '2xl': '1.625rem',
        '3xl': '2rem',
        '4xl': '2.25rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.2', normal: '1.4', relaxed: '1.55' },
      tracking: { tight: '-0.015em', normal: '0', wide: '0.02em' },
      body: { weight: '400' },
      heading: { weight: '700', tracking: '-0.015em' },
    },
    control: {
      height: {
        sm: 'calc(1.75rem * var(--m-density))',
        md: 'calc(2rem * var(--m-density))',
        lg: 'calc(2.5rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.625rem * var(--m-density))',
        md: 'calc(0.875rem * var(--m-density))',
        lg: 'calc(1.25rem * var(--m-density))',
      },
      fontSize: '0.875rem',
    },
    // 4px checkboxes and chips, 6px controls and list rows, 10px cards and menus
    radius: { sm: '4px', md: '6px', lg: '10px', control: '6px', container: '10px' },
    shadow: {
      // A push button: a half-pixel edge and a breath of drop
      sm: {
        light: '0 0 0 0.5px rgb(0 0 0 / 0.1), 0 1px 1px rgb(0 0 0 / 0.06)',
        dark: '0 0 0 0.5px rgb(255 255 255 / 0.1), 0 1px 1px rgb(0 0 0 / 0.3)',
      },
      // The open to-do: a soft card lifted off the page
      md: {
        light: '0 1px 3px rgb(25 30 40 / 0.08), 0 4px 14px rgb(25 30 40 / 0.07)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.06), 0 4px 14px rgb(0 0 0 / 0.35)',
      },
      // Menus and pickers
      lg: {
        light: '0 0 0 0.5px rgb(0 0 0 / 0.08), 0 2px 8px rgb(0 0 0 / 0.1), 0 10px 28px rgb(0 0 0 / 0.1)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.08), 0 10px 28px rgb(0 0 0 / 0.5)',
      },
      // A window: a hairline edge and a long soft shadow
      overlay: {
        light: '0 0 0 0.5px rgb(0 0 0 / 0.12), 0 8px 20px rgb(0 0 0 / 0.08), 0 24px 56px rgb(0 0 0 / 0.16)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.1), 0 24px 56px rgb(0 0 0 / 0.6)',
      },
    },
    // Short and calm, with a light spring on entrances
    motion: {
      duration: { fast: '150ms', normal: '250ms', slow: '400ms' },
      easing: { standard: 'cubic-bezier(0.25, 0.1, 0.25, 1)', emphasized: 'cubic-bezier(0.32, 1.24, 0.56, 1)' },
    },
  },
  components: {
    // A list sidebar beside a white page whose column stays narrow and centred
    layout: {
      containerMax: { sm: '28rem', md: '40rem', lg: '48rem' },
      containerPadding: 'clamp(1.25rem, 5vw, 4rem)',
      gridGap: 'var(--m-space-5)',
      splitSide: '14rem',
    },
    // Push buttons: the soft blue for the one that matters, white with a half-pixel edge for the rest
    button: {
      fontWeight: 'var(--m-font-weight-medium)',
      shadow: 'var(--m-shadow-sm)',
      hoverShadow: 'var(--m-shadow-sm)',
      activeShadow: 'none',
      primary: { border: 'transparent' },
      secondary: {
        bg: { light: '#ffffff', dark: '#45464b' },
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        hoverBg: { light: '#f5f7f9', dark: '#4f5055' },
        activeBg: { light: '#e6e8ec', dark: '#5a5b60' },
      },
      ghost: {
        fg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#eff1f4', dark: '#34353a' },
        activeBg: { light: '#e3e6ea', dark: '#3d3e43' },
      },
      danger: { border: 'transparent' },
    },
    // The open to-do: white, 10px corners, no border, a soft lift
    card: {
      border: 'transparent',
      shadow: 'var(--m-shadow-md)',
      hoverShadow: 'var(--m-shadow-lg)',
      hoverBorder: 'transparent',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-5)', lg: 'var(--m-space-8)' },
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
      outline: { border: 'var(--m-color-border-default)' },
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    input: {
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-accent-default)',
      paddingX: { sm: 'var(--m-space-2)', md: 'var(--m-space-3)', lg: 'var(--m-space-4)' },
    },
    // Labels are plain: regular weight, the field's own colour
    field: {
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-regular)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    // Small, quiet, rounded boxes that fill with the blue when done
    checkbox: {
      size: '0.9375rem',
      radius: '4px',
      border: 'var(--m-color-border-strong)',
      hoverBorder: 'var(--m-color-fg-muted)',
    },
    switch: {
      width: '2.25rem',
      height: '1.375rem',
      smWidth: '1.75rem',
      smHeight: '1rem',
      trackBg: { light: '#8e9196', dark: '#7a7b80' },
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
    },
    // Lists, not grids: no frame, no header fill, hairline rows
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingY: 'calc(0.625rem * var(--m-density))',
      borderColor: 'var(--m-color-border-muted)',
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-medium)',
      headerTransform: 'none',
      headerTracking: '0',
      rowHoverBg: 'var(--m-color-bg-sunken)',
      stripeBg: 'var(--m-color-bg-sunken)',
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    // The list sidebar: pale blue-grey, list names in ink, the current one on a soft grey row; areas
    // are bold names, not capital labels
    sidebar: {
      width: '14rem',
      bg: { light: '#eff4f8', dark: '#1d1e22' },
      border: 'transparent',
      padding: 'var(--m-space-3)',
      sectionGap: 'var(--m-space-5)',
      itemGap: '1px',
      fontSize: 'var(--m-font-size-md)',
      heading: {
        fg: 'var(--m-color-fg-default)',
        size: 'var(--m-font-size-md)',
        weight: 'var(--m-font-weight-semibold)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: { light: '#374046', dark: '#d9dadc' },
        hoverFg: { light: '#1f2125', dark: '#f4f4f6' },
        hoverBg: { light: '#e4eaf0', dark: '#2c2d31' },
        activeFg: { light: '#1f2125', dark: '#f4f4f6' },
        activeBg: { light: '#d5dce5', dark: '#3a3b3f' },
        activeWeight: 'var(--m-font-weight-regular)',
        radius: '6px',
        paddingX: 'var(--m-space-2)',
        paddingY: 'calc(0.25rem * var(--m-density))',
      },
      count: { bg: 'transparent', fg: { light: '#5f6770', dark: '#9a9ba0' } },
    },
    // The public site's header: on the page colour, muted semibold links, a hairline underneath
    navbar: {
      height: 'calc(4.25rem * var(--m-density))',
      bg: 'var(--m-color-bg-canvas)',
      border: 'var(--m-color-border-default)',
      brandWeight: 'var(--m-font-weight-bold)',
      link: {
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-semibold)',
      },
    },
    // Tag filters: muted words, the chosen one a solid grey pill
    tabs: {
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-muted)',
      indicator: 'var(--m-color-accent-default)',
      pill: {
        listBg: 'var(--m-color-bg-surface)',
        listRadius: '9999px',
        listPadding: '0',
        radius: '9999px',
        // The reference's chosen pill is mid grey with white text (2:1); the library keeps the tab's
        // ink text, so the pill is a lighter grey here and a darker one in dark mode
        activeBg: { light: '#d3d6da', dark: '#5d6066' },
        activeShadow: 'none',
      },
    },
    breadcrumb: { separator: '"›"', currentWeight: 'var(--m-font-weight-semibold)' },
    pagination: {
      radius: '9999px',
      fg: 'var(--m-color-fg-muted)',
      currentBg: { light: '#6e7176', dark: '#919193' },
      currentFg: { light: '#ffffff', dark: '#1d1e22' },
      currentBorder: 'transparent',
    },
    // Tags: small outlined pills in grey; tones are soft tints
    badge: {
      height: '1.125rem',
      radius: '9999px',
      paddingX: '0.4375rem',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-regular)',
      neutral: {
        bg: 'var(--m-color-bg-surface)',
        fg: 'var(--m-color-fg-muted)',
        border: { light: '#bec2c8', dark: '#5d5e62' },
        solidBg: { light: '#e6e8ec', dark: '#3a3b3f' },
        solidFg: { light: '#4f5358', dark: '#d9dadc' },
      },
    },
    avatar: {
      size: { sm: '1.5rem', md: '2rem', lg: '2.5rem' },
      bg: 'var(--m-color-accent-subtle)',
      fg: 'var(--m-color-accent-text)',
      fontWeight: 'var(--m-font-weight-medium)',
    },
    // Notes and notices sit in the quiet grey panel, like the day's calendar box: no border, no stripe
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '8px',
      padding: 'var(--m-space-3) var(--m-space-4)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    toast: {
      border: 'transparent',
      accentWidth: '0px',
      radius: '10px',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-3) var(--m-space-4)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // A sheet: white, 12px corners, the window shadow
    dialog: {
      border: 'transparent',
      radius: '12px',
      padding: 'var(--m-space-6)',
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    // Menus and Quick Find: white, 12px corners, rows that highlight in the pale selection blue
    popover: {
      border: 'transparent',
      radius: '12px',
      shadow: 'var(--m-shadow-lg)',
      padding: '0.375rem',
      item: {
        height: '1.875rem',
        paddingX: 'var(--m-space-2)',
        radius: '6px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: 'var(--m-color-selection-bg)',
        hoverFg: 'var(--m-color-selection-fg)',
      },
      separator: 'var(--m-color-border-default)',
    },
    tooltip: {
      radius: '6px',
      shadow: 'var(--m-shadow-sm)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
      delay: '500ms',
    },
    progress: {
      height: { sm: '0.25rem', md: '0.25rem', lg: '0.375rem' },
      track: { light: '#e6e8ec', dark: '#3a3b3f' },
      // The blue bar; in dark mode the lighter heading blue, so it reads against the track
      fill: { light: '#2f6fdf', dark: '#6aaeff' },
    },
    usage: {
      height: '0.25rem',
      track: { light: '#e6e8ec', dark: '#3a3b3f' },
      okFill: { light: '#2f6fdf', dark: '#6aaeff' },
    },
    skeleton: {
      bg: { light: '#eef0f3', dark: '#323338' },
      highlight: { light: '#f7f8fa', dark: '#3a3b40' },
      radius: '4px',
      blockRadius: '10px',
    },
    spinner: { thickness: '2px', track: 'var(--m-color-border-default)' },
    kbd: {
      fontFamily: 'var(--m-font-family-sans)',
      fontWeight: 'var(--m-font-weight-medium)',
      border: 'var(--m-color-border-default)',
      radius: '5px',
      shadow: 'var(--m-shadow-sm)',
    },
    // Notes' code: the quiet grey panel, no border
    code: {
      radius: '8px',
      border: 'transparent',
      inlineBorder: 'transparent',
      inlineRadius: '4px',
      comment: 'var(--m-color-fg-muted)',
    },
    // Like a heading in a project: a bold row over a hairline, no box
    accordion: {
      radius: '0',
      bg: 'transparent',
      paddingX: '0',
      paddingY: 'var(--m-space-3)',
      summaryWeight: 'var(--m-font-weight-semibold)',
      hoverBg: 'transparent',
    },
    prose: { maxWidth: '64ch', lineHeight: '1.5', h2Border: 'transparent' },
    divider: { labelTransform: 'none', labelTracking: '0', labelFontSize: 'var(--m-font-size-sm)' },
    chat: {
      radius: '12px',
      userBg: 'var(--m-color-bg-sunken)',
      userFg: 'var(--m-color-fg-default)',
      userBorder: 'transparent',
      assistantBorder: 'transparent',
      assistantBg: 'transparent',
      avatarBg: 'var(--m-color-accent-subtle)',
      avatarFg: 'var(--m-color-accent-text)',
    },
    composer: { radius: '10px', shadow: 'var(--m-shadow-md)', border: 'var(--m-color-border-strong)' },
    citation: { chipRadius: '9999px', chipBg: 'var(--m-color-bg-sunken)', chipFg: 'var(--m-color-fg-muted)' },
    toolCall: { radius: '8px' },
    thinking: { rule: 'var(--m-color-border-default)' },
  },
});
