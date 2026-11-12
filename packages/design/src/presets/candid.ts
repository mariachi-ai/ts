import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Candid: a daily photo feed, black-first and stark. Pure black, white type set bold and tight, one
 * dual-camera post per person (a big photo with a small inset in the corner), a grey "late" line
 * under each name, round reactions stacked on the photo's edge, a bare top bar with text tabs, dark
 * grey pills for small actions and one white button for the action that matters. The light theme
 * is ours: the same structure inverted. Category: social and messaging. The values are measured
 * from the reference's screens and public pages, not invented (see DESIGN.md).
 */
export const candid = extendTheme(minimal, {
  name: 'candid',
  label: 'Candid',
  description:
    'Black-first and stark: white type set bold and tight, dual-camera posts, a grey late line, stacked round reactions, dark grey pills and one white button.',
  tokens: {
    color: {
      bg: {
        // Pure black in dark; the light theme is ours, plain white
        canvas: { light: '#ffffff', dark: '#000000' },
        // Panels and the profile stats card: one step off black
        surface: { light: '#ffffff', dark: '#121214' },
        // Menus, dialogs and the mention list
        raised: { light: '#ffffff', dark: '#232325' },
        // Grouped lists, chips and the small-action pills
        sunken: { light: '#f2f2f7', dark: '#1c1c1e' },
        overlay: { light: 'rgb(0 0 0 / 0.4)', dark: 'rgb(0 0 0 / 0.7)' },
        inverse: { light: '#000000', dark: '#ffffff' },
      },
      fg: {
        default: { light: '#000000', dark: '#ffffff' },
        // The secondary grey of captions, comments and "View all" lines
        muted: { light: '#5b5b60', dark: '#99999c' },
        // The timestamp grey ("4 min late")
        subtle: { light: '#6c6c70', dark: '#8e8e93' },
        inverse: { light: '#ffffff', dark: '#000000' },
      },
      border: {
        // White at about 10% over black: card rings and dividers
        default: { light: '#e5e5ea', dark: '#262628' },
        // The feed's own divider, a step fainter
        muted: { light: '#f2f2f7', dark: '#1a1a1c' },
        // The reference's control greys are under 3:1 on black; these are the nearest passing steps
        strong: { light: '#848488', dark: '#6e6e73' },
        focus: { light: '#000000', dark: '#ffffff' },
      },
      // The action is white on black (black on white in the light theme)
      accent: {
        default: { light: '#000000', dark: '#ffffff' },
        hover: { light: '#1c1c1e', dark: '#e5e5ea' },
        active: { light: '#2c2c2e', dark: '#d1d1d6' },
        subtle: { light: '#e5e5ea', dark: '#2c2c2e' },
        fg: { light: '#ffffff', dark: '#000000' },
        // Links are plain bold text with an arrow, not a colour
        text: { light: '#000000', dark: '#ffffff' },
      },
      success: {
        bg: { light: '#e8f5ea', dark: '#0e2614' },
        fg: { light: '#217e38', dark: '#30d158' },
        border: { light: '#b9e2c2', dark: '#1d4d2a' },
        solid: { light: '#217e38', dark: '#30d158' },
        onSolid: { light: '#ffffff', dark: '#000000' },
      },
      warning: {
        bg: { light: '#fff6d9', dark: '#2b2508' },
        fg: { light: '#8a5a00', dark: '#ffd60a' },
        border: { light: '#f5dc8a', dark: '#5a4a0c' },
        solid: { light: '#ffcc00', dark: '#ffd60a' },
        onSolid: '#000000',
      },
      // The notification-badge red; on black the text on it is black (white is 3.6:1)
      danger: {
        bg: { light: '#ffeceb', dark: '#2e100e' },
        fg: { light: '#d70015', dark: '#ff453a' },
        border: { light: '#ffc9c5', dark: '#5c1e1a' },
        solid: { light: '#d70015', dark: '#ff453a' },
        onSolid: { light: '#ffffff', dark: '#000000' },
      },
      // Mentions and the verified badge
      info: {
        bg: { light: '#e8efff', dark: '#0b1d33' },
        fg: { light: '#0055ff', dark: '#0a84ff' },
        border: { light: '#c2d4ff', dark: '#173a66' },
        solid: { light: '#0055ff', dark: '#0a84ff' },
        onSolid: { light: '#ffffff', dark: '#000000' },
      },
      selection: {
        bg: { light: '#d1d1d6', dark: '#3a3a3c' },
        fg: { light: '#000000', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // The app's face is the system font (SF Pro); Inter is its closest open match and the
        // marketing site's own face
        sans: '"Inter Variable", "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Text", ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        display:
          '"Inter Variable", "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Display", ui-sans-serif, system-ui, sans-serif',
        mono: '"Fragment Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      // 12, 13, 15 and 17px in the app; 20 and 28px titles; 42 and 58px for the big bold names
      size: {
        xs: '0.75rem',
        sm: '0.8125rem',
        md: '0.9375rem',
        lg: '1.0625rem',
        xl: '1.25rem',
        '2xl': '1.75rem',
        '3xl': '2.625rem',
        '4xl': '3.625rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.05', normal: '1.35', relaxed: '1.5' },
      tracking: { tight: '-0.03em', normal: '0', wide: '0.04em' },
      body: { weight: '400' },
      heading: { weight: '700', tracking: '-0.02em' },
    },
    // 32px chips, 40px buttons (the in-feed action), 52px for the full-width action at the bottom
    control: {
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(2.5rem * var(--m-density))',
        lg: 'calc(3.25rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.875rem * var(--m-density))',
        md: 'calc(1.25rem * var(--m-density))',
        lg: 'calc(1.5rem * var(--m-density))',
      },
      fontSize: '0.9375rem',
    },
    // 8px small tiles, 12px buttons, the inset photo and fields, 16px photos and grouped cards,
    // 24px panels; chips, counts and avatars are fully round
    radius: { sm: '8px', md: '12px', lg: '16px', control: '12px', container: '16px' },
    shadow: {
      // Almost flat: a white ring stands in for a shadow on black
      sm: { light: '0 1px 2px rgb(0 0 0 / 0.08)', dark: '0 0 0 1px rgb(255 255 255 / 0.1)' },
      md: {
        light: '0 4px 16px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(0 0 0 / 0.04)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.1), 0 8px 24px rgb(0 0 0 / 0.6)',
      },
      // The profile card's double shadow: a black drop and a soft white glow
      lg: {
        light: '0 8px 40px rgb(0 0 0 / 0.16)',
        dark: '0 8px 41px rgb(0 0 0 / 0.4), 0 4px 20px rgb(255 255 255 / 0.18)',
      },
      overlay: {
        light: '0 12px 40px rgb(0 0 0 / 0.18), 0 0 0 1px rgb(0 0 0 / 0.05)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.12), 0 16px 48px rgb(0 0 0 / 0.7)',
      },
    },
    focus: { offset: '2px' },
    motion: {
      duration: { fast: '150ms', normal: '200ms', slow: '350ms' },
      easing: { standard: 'cubic-bezier(0.25, 0.1, 0.25, 1)', emphasized: 'cubic-bezier(0.2, 0.9, 0.3, 1)' },
    },
  },
  components: {
    // Columns: sign-up 26rem, settings 37rem, public pages 75rem; the feed column itself is 30rem
    layout: {
      containerMax: { sm: '26rem', md: '37rem', lg: '75rem' },
      containerPadding: 'clamp(1rem, 4vw, 2rem)',
      gridGap: 'var(--m-space-4)',
      splitSide: '16rem',
    },
    // One white button for the action that matters (12px corners, 600); dark grey fills for the rest
    button: {
      fontWeight: 'var(--m-font-weight-semibold)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      primary: { border: 'transparent' },
      secondary: {
        bg: 'var(--m-color-bg-sunken)',
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        hoverBg: { light: '#e5e5ea', dark: '#2c2c2e' },
        activeBg: { light: '#d1d1d6', dark: '#3a3a3c' },
      },
      ghost: {
        fg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#f2f2f7', dark: '#1c1c1e' },
        activeBg: { light: '#e5e5ea', dark: '#2c2c2e' },
      },
      danger: { border: 'transparent' },
    },
    // Panels one step off black with a faint white ring; no shadow
    card: {
      border: 'var(--m-color-border-default)',
      shadow: 'none',
      hoverShadow: 'none',
      hoverBorder: { light: '#d1d1d6', dark: '#3a3a3c' },
      hoverTransform: 'none',
      radius: '16px',
      padding: { sm: 'var(--m-space-3)', md: 'var(--m-space-5)', lg: 'var(--m-space-8)' },
      titleFamily: 'var(--m-font-family-display)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-bold)',
      descriptionFg: 'var(--m-color-fg-muted)',
      outline: { bg: 'transparent', border: 'var(--m-color-border-default)' },
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    // Filled fields, pill-ended, with the passing grey outline
    input: {
      bg: 'var(--m-color-bg-sunken)',
      radius: '1.5rem',
      hoverBorder: 'var(--m-color-fg-subtle)',
      focusBorder: 'var(--m-color-fg-default)',
      placeholder: 'var(--m-color-fg-subtle)',
      paddingX: { sm: 'var(--m-space-3)', md: 'var(--m-space-4)', lg: 'var(--m-space-5)' },
    },
    select: {
      bg: 'var(--m-color-bg-sunken)',
      radius: '1.5rem',
      hoverBorder: 'var(--m-color-fg-subtle)',
      focusBorder: 'var(--m-color-fg-default)',
    },
    field: {
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: 'var(--m-font-size-md)',
      labelFontWeight: 'var(--m-font-weight-regular)',
      hintFg: 'var(--m-color-fg-muted)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFontWeight: 'var(--m-font-weight-medium)',
    },
    // Round checks: white with a black tick when on
    checkbox: {
      size: '1.25rem',
      radius: '9999px',
      borderWidth: '2px',
      border: 'var(--m-color-border-strong)',
      hoverBorder: 'var(--m-color-fg-muted)',
      checkedBg: 'var(--m-color-accent-default)',
      checkedBorder: 'var(--m-color-accent-default)',
      mark: 'var(--m-color-accent-fg)',
    },
    radio: {
      size: '1.25rem',
      borderWidth: '2px',
      border: 'var(--m-color-border-strong)',
      checkedBg: 'var(--m-color-accent-default)',
      checkedBorder: 'var(--m-color-accent-default)',
      dot: 'var(--m-color-accent-fg)',
    },
    // The system switch in the system green
    switch: {
      width: '3.1875rem',
      height: '1.9375rem',
      smWidth: '2.25rem',
      smHeight: '1.375rem',
      trackBg: 'var(--m-color-border-strong)',
      trackCheckedBg: 'var(--m-color-success-solid)',
      thumbBg: '#ffffff',
      // Dark: black on the bright green (white is 1.9:1 there)
      thumbCheckedBg: { light: '#ffffff', dark: '#000000' },
      thumbShadow: '0 2px 6px rgb(0 0 0 / 0.2)',
    },
    // Lists on black: no frame, no header fill, faint hairlines
    table: {
      bg: 'transparent',
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: 'var(--m-space-3)',
      cellPaddingY: 'calc(0.75rem * var(--m-density))',
      borderColor: 'var(--m-color-border-muted)',
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-semibold)',
      headerTransform: 'none',
      headerTracking: '0',
      rowHoverBg: { light: '#f2f2f7', dark: '#121214' },
      stripeBg: 'transparent',
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    // The desktop nav panel: black, no edge, 17px semibold rows; the current row is a dark grey pill
    sidebar: {
      width: '16rem',
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      padding: 'var(--m-space-4)',
      sectionGap: 'var(--m-space-6)',
      itemGap: '2px',
      fontSize: 'var(--m-font-size-lg)',
      heading: {
        fg: 'var(--m-color-fg-muted)',
        size: 'var(--m-font-size-sm)',
        weight: 'var(--m-font-weight-semibold)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#f2f2f7', dark: '#121214' },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'var(--m-color-bg-sunken)',
        activeWeight: 'var(--m-font-weight-semibold)',
        radius: '9999px',
        paddingX: 'var(--m-space-4)',
        paddingY: 'calc(0.625rem * var(--m-density))',
      },
      // Counts: the notification red
      count: { bg: 'var(--m-color-danger-solid)', fg: 'var(--m-color-danger-on-solid)', radius: '9999px' },
    },
    // The public bar: black, 64px, grey links, a white pill at the right
    navbar: {
      height: 'calc(4rem * var(--m-density))',
      paddingX: 'clamp(1rem, 4vw, 4rem)',
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      brandFamily: 'var(--m-font-family-display)',
      brandSize: 'var(--m-font-size-xl)',
      brandWeight: 'var(--m-font-weight-bold)',
      link: {
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
        fontSize: 'var(--m-font-size-lg)',
        fontWeight: 'var(--m-font-weight-regular)',
        radius: '9999px',
      },
    },
    // The top bar's text tabs: white when current, grey otherwise, no underline and no border
    tabs: {
      gap: 'var(--m-space-4)',
      listGap: 'var(--m-space-6)',
      listBorder: 'transparent',
      height: '2.25rem',
      paddingX: '0',
      fontSize: 'var(--m-font-size-lg)',
      fontWeight: 'var(--m-font-weight-semibold)',
      fg: 'var(--m-color-fg-subtle)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'transparent',
      indicatorWidth: '0px',
      // The pill variant is a row of dark grey chips; the current one white
      pill: {
        listBg: 'transparent',
        listRadius: '9999px',
        listPadding: '0px',
        radius: '9999px',
        activeBg: 'var(--m-color-bg-sunken)',
        activeShadow: 'none',
      },
    },
    breadcrumb: { separator: '"/"', currentWeight: 'var(--m-font-weight-semibold)' },
    pagination: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-semibold)',
      fg: 'var(--m-color-fg-muted)',
      border: 'transparent',
      hoverBg: 'var(--m-color-bg-sunken)',
      currentBg: 'var(--m-color-accent-default)',
      currentFg: 'var(--m-color-accent-fg)',
      currentBorder: 'transparent',
    },
    // Small pills; the solid one is the white label chip ("NEW") with black uppercase text
    badge: {
      height: '1.375rem',
      radius: '9999px',
      borderWidth: '0px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-semibold)',
      textTransform: 'none',
      tracking: '0',
      neutral: {
        bg: { light: '#e5e5ea', dark: '#2c2c2e' },
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        solidBg: 'var(--m-color-bg-inverse)',
        solidFg: 'var(--m-color-fg-inverse)',
      },
    },
    // Round; initials on dark grey. Stacked reactions overlap with a black ring
    avatar: {
      size: { sm: '2rem', md: '2.5rem', lg: '4.5rem' },
      bg: { light: '#e5e5ea', dark: '#2c2c2e' },
      fg: 'var(--m-color-fg-default)',
      fontWeight: 'var(--m-font-weight-semibold)',
      ringColor: 'var(--m-color-bg-canvas)',
      ringWidth: '3px',
      groupOverlap: '-0.625rem',
    },
    divider: { color: 'var(--m-color-border-muted)', labelTransform: 'none', labelTracking: '0' },
    // Banners: a dark grey card with 16px corners, no border, no side stripe
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '16px',
      padding: 'var(--m-space-4)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // The pill at the bottom: dark grey on black, white text, 16px corners
    toast: {
      bg: { light: '#1c1c1e', dark: '#232325' },
      fg: '#ffffff',
      bodyFg: '#d1d1d6',
      border: 'transparent',
      accentWidth: '0px',
      radius: '16px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-3) var(--m-space-4)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    dialog: {
      border: 'transparent',
      radius: '24px',
      padding: 'var(--m-space-6)',
      titleFamily: 'var(--m-font-family-display)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    // Menus: dark grey, 16px corners, 44px rows
    popover: {
      border: 'transparent',
      radius: '16px',
      shadow: 'var(--m-shadow-md)',
      padding: 'var(--m-space-2)',
      item: {
        height: '2.75rem',
        radius: '10px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: { light: '#f2f2f7', dark: '#2c2c2e' },
        hoverFg: 'var(--m-color-fg-default)',
      },
      separator: 'var(--m-color-border-default)',
    },
    tooltip: {
      bg: 'var(--m-color-bg-inverse)',
      fg: 'var(--m-color-fg-inverse)',
      radius: '8px',
      shadow: 'none',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-semibold)',
    },
    progress: {
      height: { sm: '0.1875rem', md: '0.25rem', lg: '0.375rem' },
      track: { light: '#e5e5ea', dark: '#2c2c2e' },
      fill: 'var(--m-color-accent-default)',
    },
    usage: {
      height: '0.25rem',
      track: { light: '#e5e5ea', dark: '#2c2c2e' },
      okFill: 'var(--m-color-accent-default)',
    },
    skeleton: {
      bg: { light: '#f2f2f7', dark: '#1c1c1e' },
      highlight: { light: '#e5e5ea', dark: '#2c2c2e' },
      radius: '8px',
      blockRadius: '16px',
    },
    spinner: { thickness: '3px', color: 'var(--m-color-accent-default)' },
    kbd: {
      fontWeight: 'var(--m-font-weight-semibold)',
      bg: 'var(--m-color-bg-sunken)',
      border: 'var(--m-color-border-default)',
      radius: '6px',
      shadow: 'none',
    },
    code: {
      bg: 'var(--m-color-bg-sunken)',
      radius: '12px',
      inlineRadius: '6px',
      border: 'transparent',
      comment: 'var(--m-color-fg-subtle)',
      keyword: 'var(--m-color-fg-default)',
      constant: 'var(--m-color-info-fg)',
    },
    // A grouped card: dark grey, 16px corners, hairlines between rows
    accordion: {
      radius: '16px',
      bg: 'var(--m-color-bg-sunken)',
      border: 'transparent',
      paddingX: 'var(--m-space-4)',
      summarySize: 'var(--m-font-size-md)',
      summaryWeight: 'var(--m-font-weight-semibold)',
      hoverBg: { light: '#e5e5ea', dark: '#232325' },
    },
    prose: {
      maxWidth: '62ch',
      lineHeight: '1.5',
      linkFg: 'var(--m-color-fg-default)',
      headingFg: 'var(--m-color-fg-default)',
    },
    // Messages: yours white with black text, theirs dark grey; 18px corners
    chat: {
      gap: 'var(--m-space-2)',
      bubbleMaxWidth: '72%',
      radius: '18px',
      padding: 'var(--m-space-2)',
      paddingX: 'var(--m-space-3)',
      userBg: 'var(--m-color-accent-default)',
      userFg: 'var(--m-color-accent-fg)',
      userBorder: 'var(--m-color-accent-default)',
      assistantBg: 'var(--m-color-bg-sunken)',
      assistantBorder: 'var(--m-color-bg-sunken)',
      avatarBg: { light: '#e5e5ea', dark: '#2c2c2e' },
      avatarFg: 'var(--m-color-fg-default)',
      assistantAvatarBg: { light: '#e5e5ea', dark: '#2c2c2e' },
      assistantAvatarFg: 'var(--m-color-fg-default)',
    },
    // The comment field: a filled pill with the passing outline, a round white send button
    composer: {
      bg: 'var(--m-color-bg-sunken)',
      border: 'var(--m-color-border-strong)',
      focusBorder: 'var(--m-color-fg-default)',
      radius: '24px',
      shadow: 'none',
      padding: 'var(--m-space-2) var(--m-space-3)',
      gap: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-md)',
    },
    citation: { chipRadius: '9999px' },
    toolCall: { radius: '12px' },
    thinking: { radius: '12px' },
  },
});
