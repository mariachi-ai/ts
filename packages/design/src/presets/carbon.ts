import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Carbon: a dark, keyboard-first command surface. Near-black panels in fine grey steps, white text,
 * a red-orange brand used for glow and marks (never for actions), a light-grey primary button,
 * 40px list rows that highlight in white at 10%, outlined key caps beside every action, and a
 * footer bar that always says what Enter and ⌘K will do. Light mode mirrors it in pale greys.
 * Category: dark and sharp. The values are measured, not invented (see DESIGN.md).
 */
export const carbon = extendTheme(minimal, {
  name: 'carbon',
  label: 'Carbon',
  description:
    'Dark and exact: near-black panels, white text, a red-orange brand glow, light-grey actions, 40px list rows and key caps for every shortcut.',
  tokens: {
    color: {
      bg: {
        // The window (`#111214`), grouped panels (`#18191a`), menus and the action panel (`#1b1c1e`)
        canvas: { light: '#f7f7f8', dark: '#111214' },
        surface: { light: '#ffffff', dark: '#18191a' },
        raised: { light: '#ffffff', dark: '#1b1c1e' },
        // The quiet fill: white at 7% on the window (hover rows, tracks, wells)
        sunken: { light: '#ececed', dark: '#222325' },
        overlay: { light: 'rgb(17 18 20 / 0.25)', dark: 'rgb(0 0 0 / 0.6)' },
        inverse: { light: '#1b1c1e', dark: '#e6e6e6' },
      },
      fg: {
        default: { light: '#111214', dark: '#ffffff' },
        // White at 60% (section labels, subtitles, accessories): the site's grey-200
        muted: { light: '#5e6366', dark: '#9c9c9d' },
        subtle: { light: '#6a6b6c', dark: '#8a8b8d' },
        inverse: { light: '#ffffff', dark: '#2f3031' },
      },
      border: {
        // Card and panel edges `#2f3031`; dividers `#242728`
        default: { light: '#e6e6e6', dark: '#2f3031' },
        muted: { light: '#efeff0', dark: '#242728' },
        strong: { light: '#8a8a8c', dark: '#6a6b6c' },
        // Selection is a light outline, not a colour
        focus: { light: '#6a6b6c', dark: '#cdcece' },
      },
      // The action colour is the light-grey button of the site (dark) and its ink mirror (light)
      accent: {
        default: { light: '#2f3031', dark: '#e6e6e6' },
        hover: { light: '#1b1c1e', dark: '#ffffff' },
        active: { light: '#07080a', dark: '#cdcece' },
        // White at 10%: the selected row
        subtle: { light: '#e9e9ea', dark: '#2a2b2d' },
        fg: { light: '#ffffff', dark: '#2f3031' },
        // Links are the brand red
        text: { light: '#c81e28', dark: '#ff6363' },
      },
      brand: {
        default: '#ff6363',
        fg: '#07080a',
        subtle: { light: '#ffe5e5', dark: '#351e20' },
      },
      success: {
        bg: { light: '#e3f5ec', dark: '#1c2f28' },
        fg: { light: '#127346', dark: '#59d499' },
        border: { light: '#b5e3cb', dark: '#284c3d' },
        solid: { light: '#127346', dark: '#59d499' },
        onSolid: { light: '#ffffff', dark: '#07080a' },
      },
      warning: {
        bg: { light: '#fff4d6', dark: '#352d19' },
        fg: { light: '#835500', dark: '#ffc533' },
        border: { light: '#f5d98f', dark: '#58481d' },
        solid: { light: '#ffc533', dark: '#ffc533' },
        onSolid: '#07080a',
      },
      danger: {
        bg: { light: '#ffe8e8', dark: '#351e20' },
        fg: { light: '#c01c26', dark: '#ff6363' },
        border: { light: '#f8c2c2', dark: '#582526' },
        solid: { light: '#c81e28', dark: '#ff6363' },
        onSolid: { light: '#ffffff', dark: '#07080a' },
      },
      info: {
        bg: { light: '#e5f4ff', dark: '#1b2c37' },
        fg: { light: '#0a64a0', dark: '#56c2ff' },
        border: { light: '#b8e0fb', dark: '#26475a' },
        solid: { light: '#0a6aa8', dark: '#56c2ff' },
        onSolid: { light: '#ffffff', dark: '#07080a' },
      },
      selection: {
        bg: { light: '#ffd0d0', dark: '#582526' },
        fg: { light: '#111214', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // The site's own Inter; the app's system font (SF Pro) is closest to it among open fonts
        sans: '"Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        display: '"Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
        mono: '"Geist Mono Variable", "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      size: {
        xs: '0.6875rem',
        sm: '0.8125rem',
        md: '0.875rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '4rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.1', normal: '1.5', relaxed: '1.6' },
      // +0.2px on 14px text, as the site sets it
      tracking: { tight: '0', normal: '0.014em', wide: '0.03em' },
      body: { weight: '400' },
      heading: { weight: '600', tracking: '0' },
    },
    control: {
      height: {
        sm: 'calc(1.75rem * var(--m-density))',
        md: 'calc(2.25rem * var(--m-density))',
        lg: 'calc(2.5rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.625rem * var(--m-density))',
        md: 'calc(0.75rem * var(--m-density))',
        lg: 'calc(1rem * var(--m-density))',
      },
      fontSize: '0.875rem',
    },
    // 6px tags, 8px buttons and inputs, 10px rows, 12px windows and panels
    radius: { sm: '6px', md: '8px', lg: '12px', control: '8px', container: '12px' },
    shadow: {
      // Dark surfaces lift by colour and a 1px top highlight, not by a drop
      sm: { light: '0 1px 2px rgb(17 18 20 / 0.06)', dark: 'inset 0 1px 0 rgb(255 255 255 / 0.05)' },
      md: {
        light: '0 0 0 0.5px rgb(17 18 20 / 0.08), 0 1px 3px rgb(17 18 20 / 0.06)',
        dark: 'inset 0 1px 0 rgb(255 255 255 / 0.05), 0 1px 2px rgb(0 0 0 / 0.4)',
      },
      lg: {
        light: '0 0 0 0.5px rgb(17 18 20 / 0.1), 0 8px 24px rgb(17 18 20 / 0.12)',
        dark: '0 0 0 0.5px rgb(0 0 0 / 0.75), 0 4px 8px rgb(0 0 0 / 0.4), 0 12px 32px rgb(0 0 0 / 0.5)',
      },
      // The launcher window's own shadow
      overlay: {
        light: '0 0 0 0.5px rgb(17 18 20 / 0.12), 0 4px 8px rgb(17 18 20 / 0.08), 0 16px 48px rgb(17 18 20 / 0.18)',
        dark: '0 0 0 0.5px rgb(0 0 0 / 0.75), 0 4px 8px rgb(0 0 0 / 0.4), 0 12px 32px rgb(0 0 0 / 0.8), 0 16px 48px 8px rgb(0 0 0 / 0.2)',
      },
    },
    motion: {
      duration: { fast: '150ms', normal: '200ms', slow: '300ms' },
      easing: { standard: 'cubic-bezier(0.25, 0.1, 0.25, 1)', emphasized: 'cubic-bezier(0, 0, 0.58, 1)' },
    },
  },
  components: {
    // A 750px launcher window; the site's 1204px container; 32px between marketing columns
    layout: {
      containerMax: { sm: '32rem', md: '50rem', lg: '75.25rem' },
      containerPadding: 'clamp(1rem, 4vw, 2rem)',
      gridGap: 'var(--m-space-4)',
      splitSide: '13rem',
    },
    // 8px buttons, 36px tall, 14px at 500. Primary: light grey with the site's layered edge.
    // Secondary: the dark button with a white ring. Danger: red text on a red tint
    button: {
      radius: '8px',
      fontWeight: 'var(--m-font-weight-medium)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      primary: { border: 'transparent' },
      secondary: {
        bg: { light: '#ffffff', dark: '#1f2022' },
        fg: 'var(--m-color-fg-default)',
        border: { light: '#d4d4d6', dark: '#46474a' },
        hoverBg: { light: '#f2f2f3', dark: '#2a2b2d' },
        activeBg: { light: '#e8e8e9', dark: '#323335' },
      },
      ghost: {
        fg: 'var(--m-color-fg-default)',
        hoverBg: 'var(--m-color-bg-sunken)',
        activeBg: { light: '#e2e2e3', dark: '#2a2b2d' },
      },
      danger: {
        bg: 'var(--m-color-danger-bg)',
        fg: 'var(--m-color-danger-fg)',
        border: 'transparent',
        hoverBg: { light: '#ffdcdc', dark: '#45232a' },
        activeBg: { light: '#ffd0d0', dark: '#552a30' },
      },
    },
    // Panels: a fine edge and a 1px top highlight, 12px corners; no lift on hover
    card: {
      border: 'var(--m-color-border-muted)',
      shadow: 'var(--m-shadow-sm)',
      hoverShadow: 'var(--m-shadow-md)',
      hoverBorder: 'var(--m-color-border-default)',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-5)', lg: 'var(--m-space-8)' },
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    input: {
      bg: { light: '#ffffff', dark: '#1b1c1e' },
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-border-focus)',
      paddingX: { sm: 'var(--m-space-2)', md: 'var(--m-space-3)', lg: 'var(--m-space-3)' },
    },
    // Form labels are muted 13px at regular weight (right-aligned beside the control in forms)
    field: {
      labelFg: 'var(--m-color-fg-muted)',
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-regular)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    checkbox: { size: '1rem', radius: '4px' },
    // Settings switches: the system blue when on (a step deeper than the measured #4fa3f8, so the
    // white knob holds 3:1), a white knob
    switch: {
      width: '2.25rem',
      height: '1.25rem',
      smWidth: '1.875rem',
      smHeight: '1.125rem',
      trackCheckedBg: '#2f8ce6',
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
    },
    // There are no grids of cells: tables read as lists, with 11px section-style headers
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingY: 'calc(0.625rem * var(--m-density))',
      borderColor: 'var(--m-color-border-muted)',
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-xs)',
      headerFontWeight: 'var(--m-font-weight-medium)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      rowHoverBg: 'var(--m-color-bg-sunken)',
      stripeBg: 'var(--m-color-bg-canvas)',
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    // The settings window's sidebar: lighter than the content, white labels, the current row in
    // white at 10% with a 8px radius
    sidebar: {
      width: '13rem',
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-muted)',
      padding: 'var(--m-space-3)',
      sectionGap: 'var(--m-space-5)',
      itemGap: '2px',
      fontSize: 'var(--m-font-size-md)',
      heading: {
        fg: 'var(--m-color-fg-muted)',
        size: 'var(--m-font-size-xs)',
        weight: 'var(--m-font-weight-medium)',
        transform: 'none',
        tracking: 'var(--m-font-tracking-normal)',
      },
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'var(--m-color-bg-sunken)',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'var(--m-color-accent-subtle)',
        activeWeight: 'var(--m-font-weight-regular)',
        radius: '8px',
        paddingX: 'var(--m-space-2)',
        paddingY: 'calc(0.375rem * var(--m-density))',
      },
      count: { bg: 'transparent', fg: 'var(--m-color-fg-muted)' },
    },
    // The site header: a 58px bar with a fine edge, muted 14px links, the light button at the right
    navbar: {
      height: 'calc(3.625rem * var(--m-density))',
      paddingX: 'var(--m-space-8)',
      bg: 'var(--m-color-bg-canvas)',
      border: 'var(--m-color-border-muted)',
      link: {
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-medium)',
      },
    },
    // Segmented controls are pills: a dark track with a fine edge, the current segment in white
    // at 9% with a top highlight
    tabs: {
      fontWeight: 'var(--m-font-weight-medium)',
      pill: {
        listBg: { light: '#ececed', dark: '#0c0d0f' },
        listRadius: '9999px',
        listPadding: '4px',
        radius: '9999px',
        activeBg: { light: '#ffffff', dark: '#2a2b2d' },
        activeShadow: 'var(--m-shadow-sm)',
      },
    },
    breadcrumb: { separator: '"›"', currentWeight: 'var(--m-font-weight-medium)' },
    pagination: {
      radius: '6px',
      fg: 'var(--m-color-fg-muted)',
      currentBg: 'var(--m-color-accent-subtle)',
      currentFg: 'var(--m-color-fg-default)',
      currentBorder: 'transparent',
    },
    // Tags: coloured text on a 15% tint of the same colour, 6px corners, no border
    badge: {
      height: '1.25rem',
      paddingX: '0.375rem',
      radius: '6px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-medium)',
      neutral: {
        bg: 'var(--m-color-bg-sunken)',
        fg: 'var(--m-color-fg-muted)',
        border: 'transparent',
      },
    },
    avatar: {
      size: { sm: '1.25rem', md: '1.75rem', lg: '2.5rem' },
      bg: 'var(--m-color-accent-subtle)',
      fg: 'var(--m-color-fg-default)',
      fontWeight: 'var(--m-font-weight-medium)',
    },
    divider: { labelTransform: 'none', labelTracking: 'var(--m-font-tracking-normal)' },
    // Callouts: the tone's tint, no border, no side stripe
    alert: { border: 'transparent', borderWidth: '0px', accentWidth: '0px', radius: '10px' },
    // The toast lives at the window's bottom edge: a small raised bar, the icon carries the tone
    toast: {
      border: 'var(--m-color-border-default)',
      accentWidth: '0px',
      radius: '10px',
      padding: 'var(--m-space-3)',
      width: '22rem',
    },
    // The alert window: compact, centred, 12px corners, the window shadow
    dialog: {
      border: 'var(--m-color-border-default)',
      radius: '12px',
      padding: 'var(--m-space-5)',
      width: { sm: '20rem', md: '30rem', lg: '46rem' },
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-lg)',
    },
    // The action panel: a raised list with a section title, 6px rows, shortcuts on the right
    popover: {
      border: 'var(--m-color-border-default)',
      radius: '12px',
      shadow: 'var(--m-shadow-overlay)',
      padding: '0.375rem',
      minWidth: '16rem',
      item: {
        height: '2rem',
        paddingX: 'var(--m-space-2)',
        radius: '6px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: 'var(--m-color-accent-subtle)',
      },
      separator: 'var(--m-color-border-muted)',
    },
    tooltip: {
      bg: '#2f3031',
      fg: '#ffffff',
      radius: '6px',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
    },
    progress: {
      height: { sm: '0.125rem', md: '0.25rem', lg: '0.375rem' },
      fill: 'var(--m-color-accent-default)',
    },
    // Settings groups: one panel, rows split by hairlines
    accordion: { border: 'var(--m-color-border-muted)', radius: '12px' },
    code: { radius: '8px', inlineRadius: '4px', inlineBorder: 'transparent' },
    // Key caps: outlined squares in the text font, 20px tall
    kbd: {
      fontFamily: 'var(--m-font-body-family)',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-medium)',
      bg: 'transparent',
      fg: 'var(--m-color-fg-default)',
      border: { light: '#b9b9bc', dark: '#5a5b5e' },
      radius: '5px',
      shadow: 'none',
      height: '1.25rem',
      paddingX: '0.3125rem',
    },
    prose: { linkDecoration: 'none', h2Border: 'transparent' },
    // AI chat: the person's messages in a grey bubble, the assistant's as plain text
    chat: {
      assistantBg: 'transparent',
      assistantBorder: 'transparent',
      userBorder: 'transparent',
      assistantAvatarBg: 'var(--m-color-brand-default)',
      assistantAvatarFg: 'var(--m-color-brand-fg)',
    },
    composer: { radius: '12px', shadow: 'none' },
    toolCall: { radius: '8px' },
    usage: { okFill: 'var(--m-color-accent-default)' },
  },
});
