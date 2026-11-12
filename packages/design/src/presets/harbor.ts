import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Harbor: a messenger's quiet desktop. Near-black ink on white, warm off-white panels, one fresh
 * green for the action that matters, pill buttons and filter chips, a conversation on a warm
 * wallpaper with tailed bubbles (pale green for yours, white for theirs), small timestamps with
 * read ticks in blue, and a floating composer. Dark mode is a neutral near-black with a deep green
 * outgoing bubble. Category: social and messaging. The values are read from the reference's
 * published theme tokens and measured from its screens, not invented (see DESIGN.md).
 */
export const harbor = extendTheme(minimal, {
  name: 'harbor',
  label: 'Harbor',
  description:
    'A messenger on the desktop: near-black on white, warm off-white panels, one fresh green, pill buttons and chips, tailed bubbles on a warm wallpaper and blue read ticks.',
  tokens: {
    color: {
      bg: {
        // The chat list and the open conversation's header are white; dark is a neutral near-black
        canvas: { light: '#ffffff', dark: '#161717' },
        surface: { light: '#ffffff', dark: '#161717' },
        // Menus, dialogs and drawers: white, or one step up in dark
        raised: { light: '#ffffff', dark: '#1d1f1f' },
        // The warm off-white of the navigation rail, the search pill and quiet panels
        sunken: { light: '#f7f5f3', dark: '#1d1f1f' },
        // The reference's own dimmer: black at 32% in both modes
        overlay: { light: 'rgb(0 0 0 / 0.32)', dark: 'rgb(0 0 0 / 0.32)' },
        inverse: { light: '#242626', dark: '#eeeeee' },
      },
      fg: {
        default: { light: '#0a0a0a', dark: '#fafafa' },
        // Secondary text is ink at 60%, flattened over the surface
        muted: { light: '#666666', dark: '#a2a3a3' },
        // A third step: the reference's neutral grey, a hair darker to hold 4.5:1 on white
        subtle: { light: '#737576', dark: '#959393' },
        inverse: { light: '#ffffff', dark: '#0a0a0a' },
      },
      border: {
        // Dividers: ink at 10% (light) and white at 10% (dark), flattened
        default: { light: '#e6e6e6', dark: '#2d2e2e' },
        muted: { light: '#f2f2f2', dark: '#222323' },
        // The reference's input outline grey, which meets 3:1 as it is
        strong: { light: '#959393', dark: '#757778' },
        focus: { light: '#1daa61', dark: '#21c063' },
      },
      // The app green. Its own text-on-green is white in light (3.0:1, below the floor), so text on
      // it is the near-black the reference uses in dark mode and on its login and download pages
      accent: {
        default: { light: '#1daa61', dark: '#21c063' },
        hover: { light: '#1a9957', dark: '#1eae5a' },
        active: { light: '#199152', dark: '#1ca554' },
        // The pale green of the selected filter chip and of your own bubbles
        subtle: { light: '#d9fdd3', dark: '#103529' },
        fg: '#0a0a0a',
        // Links and green labels: the reference's action green, a hair darker to read on the pale green
        text: { light: '#197f50', dark: '#21c063' },
      },
      // The signature green of the logo, the unread dot and the public pages
      brand: {
        default: '#25d366',
        fg: '#0a0a0a',
        subtle: { light: '#e7fce3', dark: '#103529' },
      },
      success: {
        bg: { light: '#e7fce3', dark: '#103529' },
        fg: { light: '#197f50', dark: '#71eb85' },
        border: { light: '#bdf0b8', dark: '#15603e' },
        solid: { light: '#1daa61', dark: '#21c063' },
        onSolid: '#0a0a0a',
      },
      warning: {
        bg: { light: '#fff7e5', dark: '#362c1f' },
        fg: { light: '#98682a', dark: '#ffd279' },
        border: { light: '#ffe4af', dark: '#5a4627' },
        solid: { light: '#ffb938', dark: '#ffd279' },
        onSolid: '#0a0a0a',
      },
      danger: {
        bg: { light: '#fde8eb', dark: '#321622' },
        fg: { light: '#b80531', dark: '#fb5061' },
        border: { light: '#fbc6cd', dark: '#5e1f33' },
        solid: { light: '#ea0038', dark: '#fb5061' },
        onSolid: { light: '#ffffff', dark: '#0a0a0a' },
      },
      // The read-receipt blue
      info: {
        bg: { light: '#d2e8fe', dark: '#092642' },
        fg: { light: '#0063cb', dark: '#53a6fd' },
        border: { light: '#99cafe', dark: '#123d68' },
        solid: { light: '#007bfc', dark: '#53bdeb' },
        onSolid: '#0a0a0a',
      },
      selection: {
        bg: { light: '#d9fdd3', dark: '#144d37' },
        fg: { light: '#0a0a0a', dark: '#fafafa' },
      },
    },
    font: {
      family: {
        // The web app's own open face (it self-hosts the variable Roboto)
        sans: '"Roboto Variable", "Roboto", "Helvetica Neue", Helvetica, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"',
        display: '"Roboto Variable", "Roboto", "Helvetica Neue", Helvetica, ui-sans-serif, system-ui, sans-serif',
        mono: '"Roboto Mono Variable", "Roboto Mono", Consolas, Menlo, Monaco, ui-monospace, monospace',
      },
      // 11, 13, 15, 17 and 22px in the app; 27, 34 and 48px for the large titles of empty panels
      size: {
        xs: '0.75rem',
        sm: '0.8125rem',
        md: '0.9375rem',
        lg: '1.0625rem',
        xl: '1.375rem',
        '2xl': '1.6875rem',
        '3xl': '2.125rem',
        '4xl': '3rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.2', normal: '1.35', relaxed: '1.5' },
      tracking: { tight: '0', normal: '0', wide: '0.02em' },
      body: { weight: '400' },
      heading: { weight: '600', tracking: '0' },
    },
    // 32px chips, 40px search and buttons, 48px for the large public-page pills
    control: {
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(2.5rem * var(--m-density))',
        lg: 'calc(3rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.875rem * var(--m-density))',
        md: 'calc(1.5rem * var(--m-density))',
        lg: 'calc(1.75rem * var(--m-density))',
      },
      fontSize: '0.9375rem',
    },
    // 8px bubbles, 12px fields and rows, 24px dialogs and cards; pills for buttons, chips and search
    radius: { sm: '8px', md: '12px', lg: '24px', control: '9999px', container: '24px' },
    shadow: {
      // The bubble's one-pixel drop
      sm: { light: '0 1px 0.5px rgb(11 20 26 / 0.13)', dark: '0 1px 0.5px rgb(0 0 0 / 0.26)' },
      // Menus and popovers
      md: {
        light: '0 2px 5px rgb(11 20 26 / 0.26), 0 2px 10px rgb(11 20 26 / 0.16)',
        dark: '0 2px 5px rgb(0 0 0 / 0.4), 0 2px 10px rgb(0 0 0 / 0.3)',
      },
      // The design system's elevation
      lg: { light: '0 12px 16px -4px rgb(10 10 10 / 0.1)', dark: '0 12px 16px -4px rgb(0 0 0 / 0.4)' },
      // Dialogs and toasts
      overlay: {
        light: '0 8px 20px rgb(0 0 0 / 0.2), 0 2px 4px rgb(0 0 0 / 0.1)',
        dark: '0 8px 20px rgb(0 0 0 / 0.5), 0 2px 4px rgb(0 0 0 / 0.3)',
      },
    },
    focus: { offset: '2px' },
    motion: {
      duration: { fast: '150ms', normal: '200ms', slow: '450ms' },
      easing: { standard: 'cubic-bezier(0.1, 0.82, 0.25, 1)', emphasized: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    },
  },
  components: {
    // A 64px rail, the list column (about 30% of the window), then the conversation
    layout: {
      containerMax: { sm: '30rem', md: '45rem', lg: '75rem' },
      containerPadding: 'clamp(1rem, 3vw, 2rem)',
      gridGap: 'var(--m-space-4)',
      splitSide: '26.5rem',
    },
    // Pills: solid green with near-black text for the one that matters; an outlined pill with green
    // text for the rest
    button: {
      fontWeight: 'var(--m-font-weight-medium)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      primary: { border: 'transparent' },
      secondary: {
        bg: 'var(--m-color-bg-surface)',
        fg: 'var(--m-color-accent-text)',
        border: { light: '#cccccc', dark: '#424445' },
        hoverBg: { light: '#f6f5f4', dark: '#2d2e2e' },
        activeBg: { light: '#ebe9e7', dark: '#3a3b3b' },
      },
      ghost: {
        fg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#f6f5f4', dark: '#2d2e2e' },
        activeBg: { light: '#ebe9e7', dark: '#3a3b3b' },
      },
      danger: { border: 'transparent' },
    },
    // Flat white panels with a hairline and 24px corners; the outlined card is the public pages' ink line
    card: {
      border: 'var(--m-color-border-default)',
      shadow: 'none',
      hoverShadow: 'var(--m-shadow-lg)',
      hoverBorder: 'var(--m-color-border-default)',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-6)', lg: 'var(--m-space-8)' },
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-medium)',
      descriptionFg: 'var(--m-color-fg-muted)',
      outline: { bg: 'var(--m-color-bg-surface)', border: 'var(--m-color-fg-default)' },
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    // Outlined fields with 12px corners; the outline turns green while typing
    input: {
      radius: '12px',
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-accent-default)',
      paddingX: { sm: 'var(--m-space-3)', md: 'var(--m-space-4)', lg: 'var(--m-space-4)' },
    },
    select: {
      radius: '12px',
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-accent-default)',
    },
    field: {
      labelFg: 'var(--m-color-fg-muted)',
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-regular)',
      hintFontSize: 'var(--m-font-size-sm)',
    },
    // Round-cornered squares that fill green with a near-black tick
    checkbox: {
      size: '1.125rem',
      radius: '4px',
      borderWidth: '2px',
      border: 'var(--m-color-border-strong)',
      hoverBorder: 'var(--m-color-fg-muted)',
      checkedBg: 'var(--m-color-accent-default)',
      checkedBorder: 'var(--m-color-accent-default)',
      mark: '#0a0a0a',
    },
    radio: {
      size: '1.25rem',
      borderWidth: '2px',
      border: 'var(--m-color-border-strong)',
      // The reference draws a green ring around a green dot; the library needs a filled checked
      // state that stands out from the page, so it is a green disc with a light dot
      checkedBg: 'var(--m-color-accent-default)',
      checkedBorder: 'var(--m-color-accent-default)',
      dot: { light: '#ffffff', dark: '#0a0a0a' },
    },
    // A green track with a white thumb when on; a grey track when off
    switch: {
      width: '2.25rem',
      height: '1.25rem',
      smWidth: '1.875rem',
      smHeight: '1rem',
      trackBg: 'var(--m-color-border-strong)',
      trackCheckedBg: 'var(--m-color-accent-default)',
      thumbBg: '#ffffff',
      // Dark: a near-black thumb on the green (white is 2.4:1 there)
      thumbCheckedBg: { light: '#ffffff', dark: '#0a0a0a' },
      thumbShadow: 'var(--m-shadow-sm)',
    },
    // Lists, not grids: no frame, no header fill, hairlines between rows, a warm hover
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: 'var(--m-space-4)',
      cellPaddingY: 'calc(0.875rem * var(--m-density))',
      borderColor: 'var(--m-color-border-default)',
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-regular)',
      headerTransform: 'none',
      headerTracking: '0',
      rowHoverBg: { light: '#f6f5f4', dark: '#2d2e2e' },
      stripeBg: 'var(--m-color-bg-surface)',
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    // The list column: rows of icon and label at 17px; the current row is the warm grey, rounded
    sidebar: {
      width: '26.5rem',
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-default)',
      padding: 'var(--m-space-3)',
      sectionGap: 'var(--m-space-4)',
      itemGap: '2px',
      fontSize: 'var(--m-font-size-lg)',
      heading: {
        fg: 'var(--m-color-accent-text)',
        size: 'var(--m-font-size-md)',
        weight: 'var(--m-font-weight-regular)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#f6f5f4', dark: '#2d2e2e' },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: '#f0eeec', dark: '#343535' },
        activeWeight: 'var(--m-font-weight-regular)',
        radius: '12px',
        paddingX: 'var(--m-space-4)',
        paddingY: 'calc(0.875rem * var(--m-density))',
      },
      // Unread counts: the bright green dot with near-black figures
      count: { bg: 'var(--m-color-brand-default)', fg: 'var(--m-color-brand-fg)', radius: '9999px' },
    },
    // The public pages' bar: white, ink links, pill actions at the right
    navbar: {
      height: 'calc(4.5rem * var(--m-density))',
      paddingX: 'clamp(1rem, 4vw, 3rem)',
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      brandWeight: 'var(--m-font-weight-bold)',
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-medium)',
        radius: '9999px',
      },
    },
    // Underline tabs in green; the pill variant is the filter-chip row
    tabs: {
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-muted)',
      activeFg: 'var(--m-color-accent-text)',
      indicator: 'var(--m-color-accent-default)',
      indicatorWidth: '3px',
      pill: {
        listBg: 'transparent',
        listRadius: '9999px',
        listPadding: '0px',
        radius: '9999px',
        activeBg: 'var(--m-color-accent-subtle)',
        activeShadow: 'none',
      },
    },
    breadcrumb: { separator: '"›"', currentWeight: 'var(--m-font-weight-medium)' },
    pagination: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-muted)',
      currentBg: 'var(--m-color-accent-subtle)',
      currentFg: { light: '#15603e', dark: '#d9fdd3' },
      currentBorder: 'transparent',
    },
    // Small pills: a faint grey for labels, the green tint for good news
    badge: {
      height: '1.375rem',
      radius: '9999px',
      borderWidth: '0px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-medium)',
      textTransform: 'none',
      tracking: '0',
      neutral: {
        bg: { light: '#f2f2f2', dark: '#2d2e2e' },
        fg: { light: '#5c5c5c', dark: '#bdbdbd' },
        border: 'transparent',
        solidBg: 'var(--m-color-bg-inverse)',
        solidFg: 'var(--m-color-fg-inverse)',
      },
    },
    // Round photos; without a photo, initials on a soft colour (the reference's grey placeholder
    // carries a person glyph)
    avatar: {
      size: { sm: '1.75rem', md: '2.5rem', lg: '3.0625rem' },
      bg: { light: '#d9fdd3', dark: '#103529' },
      fg: { light: '#15603e', dark: '#d9fdd3' },
      fontWeight: 'var(--m-font-weight-medium)',
    },
    divider: { color: 'var(--m-color-border-default)' },
    // Banners in the list: a pale tint, 16px corners, no border, no side stripe
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '16px',
      padding: 'var(--m-space-4)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    // The snackbar: dark ink, white text, a green action, bottom left
    toast: {
      bg: 'var(--m-color-bg-inverse)',
      fg: 'var(--m-color-fg-inverse)',
      bodyFg: 'var(--m-color-fg-inverse)',
      border: 'transparent',
      accentWidth: '0px',
      radius: '12px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-3) var(--m-space-4)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    // White, 24px corners, no border, the long soft shadow; the title at 17px medium
    dialog: {
      border: 'transparent',
      radius: '24px',
      padding: 'var(--m-space-6)',
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    // Menus: white, 16px corners, the menu shadow, 15px rows that tint on hover
    popover: {
      border: 'transparent',
      radius: '16px',
      shadow: 'var(--m-shadow-md)',
      padding: 'var(--m-space-2)',
      item: {
        height: '2.5rem',
        radius: '8px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: { light: '#f6f5f4', dark: '#2d2e2e' },
        hoverFg: 'var(--m-color-fg-default)',
      },
      separator: 'var(--m-color-border-default)',
    },
    tooltip: {
      radius: '8px',
      shadow: 'none',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
      delay: '300ms',
    },
    progress: {
      height: { sm: '0.1875rem', md: '0.25rem', lg: '0.375rem' },
      track: { light: '#e6e6e6', dark: '#2d2e2e' },
      // The light fill is the green text step: the bright green is 2.4:1 on the grey track
      fill: { light: '#197f50', dark: '#21c063' },
    },
    usage: {
      height: '0.25rem',
      track: { light: '#e6e6e6', dark: '#2d2e2e' },
      okFill: { light: '#197f50', dark: '#21c063' },
    },
    skeleton: {
      bg: { light: '#f2f2f2', dark: '#222323' },
      highlight: { light: '#f7f5f3', dark: '#2d2e2e' },
      radius: '8px',
      blockRadius: '12px',
    },
    spinner: { thickness: '3px', color: 'var(--m-color-accent-default)' },
    kbd: {
      fontWeight: 'var(--m-font-weight-medium)',
      bg: 'var(--m-color-bg-sunken)',
      border: 'var(--m-color-border-default)',
      radius: '6px',
      shadow: 'none',
    },
    code: {
      radius: '12px',
      inlineRadius: '4px',
      border: 'var(--m-color-border-default)',
      comment: 'var(--m-color-fg-muted)',
      constant: 'var(--m-color-info-fg)',
    },
    // A white box with 16px corners and hairlines between the rows, like the reference's grouped lists
    accordion: {
      radius: '16px',
      bg: 'var(--m-color-bg-surface)',
      paddingX: 'var(--m-space-4)',
      summarySize: 'var(--m-font-size-lg)',
      summaryWeight: 'var(--m-font-weight-regular)',
      hoverBg: { light: '#f6f5f4', dark: '#2d2e2e' },
    },
    prose: { maxWidth: '68ch', lineHeight: '1.5', linkFg: 'var(--m-color-accent-text)' },
    // Bubbles: yours pale green on the right, theirs white on the left, 8px corners, the 1px drop
    chat: {
      gap: 'var(--m-space-1)',
      maxWidth: 'none',
      bubbleMaxWidth: '65%',
      radius: '8px',
      padding: '6px',
      paddingX: '9px',
      userBg: { light: '#d9fdd3', dark: '#144d37' },
      userFg: 'var(--m-color-fg-default)',
      userBorder: { light: '#d9fdd3', dark: '#144d37' },
      assistantBg: { light: '#ffffff', dark: '#242626' },
      assistantBorder: { light: '#e6e6e6', dark: '#242626' },
      avatarBg: { light: '#d9fdd3', dark: '#103529' },
      avatarFg: { light: '#15603e', dark: '#d9fdd3' },
      assistantAvatarBg: { light: '#eeeeee', dark: '#242626' },
      assistantAvatarFg: { light: '#424445', dark: '#bdbdbd' },
      metaFontSize: '0.6875rem',
    },
    // The composer: a white pill-ended box floating over the wallpaper, an outline grey edge
    composer: {
      bg: { light: '#ffffff', dark: '#242626' },
      border: 'var(--m-color-border-strong)',
      focusBorder: 'var(--m-color-accent-default)',
      radius: '24px',
      shadow: 'var(--m-shadow-sm)',
      padding: 'var(--m-space-2) var(--m-space-3)',
      gap: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-md)',
    },
    citation: { chipRadius: '9999px' },
    toolCall: { radius: '12px' },
    thinking: { radius: '8px' },
  },
});
