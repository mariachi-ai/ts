import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Saffron: a warm, plain-spoken marketing app. A signature sunny yellow as the brand colour (a thin
 * stripe across the top of the app, highlights, the big public buttons), a deep teal for every
 * action and link, graphite ink on white with cool grey hairlines and fills, a sturdy serif for big
 * numbers and public headings beside a plain grotesque, 6px controls and flat bordered cards.
 * Category: warm and friendly. The values are measured or read from the reference's published
 * product stylesheet, not invented (see DESIGN.md).
 */
export const saffron = extendTheme(minimal, {
  name: 'saffron',
  label: 'Saffron',
  description:
    'Warm and plain-spoken: a sunny yellow brand stripe, deep teal actions, graphite on white, a sturdy serif for figures and a plain grotesque for the rest.',
  tokens: {
    color: {
      bg: {
        // The app: a near-white page under white cards, bars and sidebar; a cool grey for fills and hover
        canvas: { light: '#f8fafb', dark: '#181c1f' },
        surface: { light: '#ffffff', dark: '#21262a' },
        raised: { light: '#ffffff', dark: '#2b3135' },
        sunken: { light: '#f0f4f6', dark: '#2b3135' },
        overlay: { light: 'rgb(0 0 0 / 0.5)', dark: 'rgb(0 0 0 / 0.6)' },
        inverse: { light: '#21262a', dark: '#ffffff' },
      },
      fg: {
        default: { light: '#21262a', dark: '#ffffff' },
        muted: { light: '#4c555b', dark: '#d5dee3' },
        // The reference's tertiary text (#727e85, 4.2:1) nudged to pass 4.5:1
        subtle: { light: '#6a757c', dark: '#adbac2' },
        inverse: { light: '#ffffff', dark: '#21262a' },
      },
      border: {
        default: { light: '#e2e9ed', dark: '#3c4348' },
        muted: { light: '#f0f4f6', dark: '#2b3135' },
        // Control borders: the reference's #c3ced5 is 1.6:1; its own next 3:1 step
        strong: { light: '#859299', dark: '#727e85' },
        focus: { light: '#017e89', dark: '#00b3c2' },
      },
      accent: {
        default: { light: '#017e89', dark: '#00b3c2' },
        hover: { light: '#006771', dark: '#00d0e0' },
        active: { light: '#005056', dark: '#38e8f6' },
        // A 5% teal tint (the reference's 10% tint fails 4.5:1 under teal links)
        subtle: { light: '#f2f9fa', dark: '#003c42' },
        fg: { light: '#ffffff', dark: '#181c1f' },
        text: { light: '#017e89', dark: '#00b3c2' },
      },
      // The signature yellow: the top stripe, highlights and the big public buttons, with near-black
      // warm ink on it. Never the colour of an in-app action or a link
      brand: {
        default: { light: '#ffe01b', dark: '#ffe01b' },
        fg: { light: '#241c15', dark: '#241c15' },
        subtle: { light: '#fff9d1', dark: '#615e31' },
      },
      success: {
        bg: { light: '#d2f8d5', dark: '#005419' },
        fg: { light: '#006c23', dark: '#5bef76' },
        border: { light: '#00a63b', dark: '#00892e' },
        solid: { light: '#00892e', dark: '#00a63b' },
        onSolid: { light: '#ffffff', dark: '#181c1f' },
      },
      // "Attention": a burnt orange, not an amber
      warning: {
        bg: { light: '#ffeac7', dark: '#651e00' },
        fg: { light: '#a53900', dark: '#f88a42' },
        border: { light: '#c84f00', dark: '#a53900' },
        solid: { light: '#c84f00', dark: '#f88a42' },
        onSolid: { light: '#ffffff', dark: '#21262a' },
      },
      danger: {
        bg: { light: '#ffe7e7', dark: '#6e0b1e' },
        fg: { light: '#b61a37', dark: '#ff9ba4' },
        border: { light: '#db334d', dark: '#b61a37' },
        solid: { light: '#db334d', dark: '#f7576c' },
        onSolid: { light: '#ffffff', dark: '#21262a' },
      },
      // Information is a violet
      info: {
        bg: { light: '#f0e9ff', dark: '#490097' },
        fg: { light: '#7c00f6', dark: '#d0c2ff' },
        border: { light: '#a275ff', dark: '#8f4bff' },
        solid: { light: '#7c00f6', dark: '#a275ff' },
        onSolid: { light: '#ffffff', dark: '#21262a' },
      },
      selection: {
        bg: { light: '#c5e1ff', dark: '#17497f' },
        fg: { light: '#21262a', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // A plain, slightly wide grotesque for everything in the product
        sans: '"Public Sans Variable", "Public Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
        // A sturdy, soft-wedged serif for big figures and public headings (set at 500 to match the
        // original's colour at 400)
        display: '"Fraunces Variable", "Fraunces", Georgia, "Times New Roman", serif',
        serif: '"Fraunces Variable", "Fraunces", Georgia, "Times New Roman", serif',
        mono: '"Roboto Mono Variable", "Roboto Mono", SFMono-Regular, Menlo, Consolas, monospace',
      },
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.25rem',
        xl: '1.5rem',
        '2xl': '1.75rem',
        '3xl': '2.5rem',
        '4xl': '3rem',
      },
      // The reference uses two weights: 400 and 500 ("bold")
      weight: { regular: '400', medium: '500', semibold: '500', bold: '600' },
      leading: { tight: '1.2', normal: '1.4', relaxed: '1.6' },
      tracking: { tight: '-0.02em', normal: '0', wide: '0.04em' },
      // App headings are the grotesque at 500, tracked in; the serif is for figures and public pages
      heading: { family: 'var(--m-font-family-sans)', weight: '500', tracking: '-0.02em' },
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
        lg: 'calc(1.5rem * var(--m-density))',
      },
      fontSize: 'var(--m-font-size-sm)',
    },
    // 4px inputs and badges, 6px actions and nav rows, 12px cards
    radius: { sm: '4px', md: '6px', lg: '12px' },
    shadow: {
      // The reference's elevation levels in its shadow grey (graphite at 20%)
      sm: { light: '0 1px 4px 0 rgb(76 85 91 / 0.2)', dark: '0 1px 4px 0 rgb(0 0 0 / 0.4)' },
      md: { light: '0 2px 8px 0 rgb(76 85 91 / 0.2)', dark: '0 2px 8px 0 rgb(0 0 0 / 0.4)' },
      lg: { light: '0 4px 16px 0 rgb(76 85 91 / 0.2)', dark: '0 4px 16px 0 rgb(0 0 0 / 0.45)' },
      overlay: { light: '0 6px 24px 0 rgb(76 85 91 / 0.2)', dark: '0 6px 24px 0 rgb(0 0 0 / 0.5)' },
    },
    motion: {
      duration: { fast: '150ms', normal: '200ms', slow: '350ms' },
      // Things ease into place; entrances overshoot a little
      easing: { standard: 'cubic-bezier(0.35, 0, 0.25, 1)', emphasized: 'cubic-bezier(0.15, 1.4, 0.25, 1)' },
    },
  },
  components: {
    // A 216px white sidebar beside a wide content column (1248px at most)
    layout: {
      containerMax: { sm: '30rem', md: '48rem', lg: '78rem' },
      containerPadding: 'clamp(1rem, 3vw, 2.5rem)',
      gridGap: 'var(--m-space-6)',
      splitSide: '13.5rem',
    },
    // 6px corners: solid teal for the main action, white with a light border for the rest, teal text for quiet ones
    button: {
      fontWeight: 'var(--m-font-weight-medium)',
      radius: '6px',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      primary: { border: 'transparent' },
      secondary: {
        bg: { light: '#ffffff', dark: '#21262a' },
        fg: 'var(--m-color-fg-default)',
        border: { light: '#c3ced5', dark: '#5d686f' },
        hoverBg: { light: '#f0f4f6', dark: '#2b3135' },
        activeBg: { light: '#e2e9ed', dark: '#3c4348' },
      },
      ghost: {
        fg: 'var(--m-color-accent-text)',
        hoverBg: { light: '#f0f4f6', dark: '#2b3135' },
        activeBg: { light: '#e2e9ed', dark: '#3c4348' },
      },
      danger: {
        border: 'transparent',
        hoverBg: { light: '#b61a37', dark: '#ff808c' },
        activeBg: { light: '#8f1229', dark: '#ff9ba4' },
      },
    },
    // Flat white panels: a hairline, 12px corners, no shadow
    card: {
      border: 'var(--m-color-border-default)',
      shadow: 'none',
      hoverShadow: 'var(--m-shadow-md)',
      hoverBorder: 'var(--m-color-border-default)',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-6)', lg: 'var(--m-space-8)' },
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-medium)',
      sunken: { border: 'transparent' },
    },
    // Inputs: 4px corners, a grey border (the 3:1 control floor) that goes graphite on hover and teal on focus
    input: {
      radius: '4px',
      hoverBorder: { light: '#3c4348', dark: '#9aa7b0' },
      focusBorder: 'var(--m-color-accent-default)',
      placeholder: 'var(--m-color-fg-subtle)',
      disabledBg: { light: '#d5dee3', dark: '#3c4348' },
    },
    field: {
      labelFg: 'var(--m-color-fg-muted)',
      labelFontWeight: 'var(--m-font-weight-regular)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    checkbox: {
      size: '1.25rem',
      radius: '4px',
      border: 'var(--m-color-border-strong)',
    },
    radio: { size: '1.25rem', border: 'var(--m-color-border-strong)' },
    switch: {
      width: '2.75rem',
      height: '1.5rem',
      trackBg: 'var(--m-color-border-strong)',
      border: 'transparent',
      thumbBg: '#ffffff',
      thumbCheckedBg: { light: '#ffffff', dark: '#21262a' },
      thumbShadow: 'none',
    },
    // Tables: no frame, no header fill, sentence-case headers at 500, hairline rows
    table: {
      bg: 'var(--m-color-bg-canvas)',
      fontSize: 'var(--m-font-size-sm)',
      cellPaddingX: 'var(--m-space-4)',
      cellPaddingY: 'calc(0.875rem * var(--m-density))',
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-default)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-medium)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      rowHoverBg: { light: '#f8fafb', dark: '#2b3135' },
      stripeBg: { light: '#f8fafb', dark: '#21262a' },
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    // The app's side navigation: white, a hairline edge, 16px items, the current one on a grey fill
    sidebar: {
      width: '13.5rem',
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-default)',
      padding: 'var(--m-space-3)',
      sectionGap: 'var(--m-space-4)',
      itemGap: '2px',
      fontSize: 'var(--m-font-size-md)',
      nestedIndent: 'var(--m-space-8)',
      guide: 'transparent',
      heading: {
        fg: 'var(--m-color-fg-muted)',
        size: 'var(--m-font-size-sm)',
        weight: 'var(--m-font-weight-medium)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#f0f4f6', dark: '#2b3135' },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: '#e2e9ed', dark: '#3c4348' },
        activeWeight: 'var(--m-font-weight-medium)',
        radius: '6px',
        paddingX: 'var(--m-space-2)',
        paddingY: 'calc(0.3125rem * var(--m-density))',
      },
      count: { bg: 'transparent', fg: 'var(--m-color-fg-muted)' },
    },
    // The public site's bar: white, roomy, small bold links in ink
    navbar: {
      height: 'calc(4.125rem * var(--m-density))',
      paddingX: 'clamp(1rem, 2vw, 1.5rem)',
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-default)',
      brandFamily: 'var(--m-font-family-display)',
      brandSize: 'var(--m-font-size-xl)',
      brandWeight: 'var(--m-font-weight-medium)',
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'var(--m-color-brand-subtle)',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
        fontSize: '0.8125rem',
        fontWeight: 'var(--m-font-weight-bold)',
        radius: '3px',
      },
    },
    // Underline tabs in teal; segmented controls are a grey track with a white segment
    tabs: {
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-default)',
      hoverFg: 'var(--m-color-accent-text)',
      activeFg: 'var(--m-color-accent-text)',
      fontSize: 'var(--m-font-size-md)',
      paddingX: 'var(--m-space-3)',
      listGap: 'var(--m-space-4)',
      pill: {
        listBg: 'var(--m-color-bg-sunken)',
        listRadius: '6px',
        listPadding: '3px',
        radius: '4px',
        activeBg: { light: '#ffffff', dark: '#21262a' },
        activeShadow: 'var(--m-shadow-sm)',
      },
    },
    breadcrumb: { separator: '"/"', fg: 'var(--m-color-accent-text)', hoverFg: 'var(--m-color-accent-hover)' },
    pagination: {
      radius: '6px',
      fg: 'var(--m-color-fg-default)',
      border: 'transparent',
      hoverBg: { light: '#f0f4f6', dark: '#2b3135' },
      currentBg: 'var(--m-color-accent-default)',
      currentFg: 'var(--m-color-accent-fg)',
    },
    // Small rectangular tags: a flat tint and no border
    badge: {
      height: '1.5rem',
      radius: '4px',
      borderWidth: '0px',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
      neutral: {
        bg: { light: '#e2e9ed', dark: '#3c4348' },
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        solidBg: 'var(--m-color-bg-inverse)',
        solidFg: 'var(--m-color-fg-inverse)',
      },
    },
    // People are an initial on the pale yellow, in the serif
    avatar: {
      size: { sm: '1.75rem', md: '2.25rem', lg: '3rem' },
      bg: 'var(--m-color-brand-subtle)',
      fg: { light: '#241c15', dark: '#ffffff' },
      fontWeight: 'var(--m-font-weight-medium)',
    },
    // Feedback blocks: a flat tint, no border, 4px corners
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '4px',
      padding: 'var(--m-space-4) var(--m-space-5)',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    // The snackbar: graphite with white text, 6px corners
    toast: {
      bg: 'var(--m-color-bg-inverse)',
      fg: 'var(--m-color-fg-inverse)',
      bodyFg: { light: '#d5dee3', dark: '#3c4348' },
      border: 'transparent',
      accentWidth: '0px',
      radius: '6px',
      shadow: 'var(--m-shadow-lg)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    dialog: {
      radius: '8px',
      border: 'transparent',
      padding: 'var(--m-space-8)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-medium)',
      backdrop: 'var(--m-color-bg-overlay)',
    },
    popover: {
      radius: '8px',
      border: 'var(--m-color-border-default)',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-2) 0',
      item: {
        height: '2.5rem',
        radius: '0',
        paddingX: 'var(--m-space-4)',
        fontSize: 'var(--m-font-size-sm)',
        hoverBg: { light: '#f0f4f6', dark: '#3c4348' },
      },
      separator: 'var(--m-color-border-default)',
    },
    tooltip: {
      radius: '4px',
      shadow: 'none',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
      paddingX: 'var(--m-space-3)',
      paddingY: 'var(--m-space-2)',
      delay: '300ms',
    },
    progress: {
      height: { sm: '0.25rem', md: '0.5rem', lg: '0.75rem' },
      track: { light: '#e2e9ed', dark: '#3c4348' },
      fill: 'var(--m-color-accent-default)',
    },
    usage: {
      track: { light: '#e2e9ed', dark: '#3c4348' },
      okFill: 'var(--m-color-accent-default)',
      labelWeight: 'var(--m-font-weight-medium)',
    },
    skeleton: {
      bg: { light: '#f0f4f6', dark: '#2b3135' },
      highlight: { light: '#f8fafb', dark: '#3c4348' },
      radius: '4px',
    },
    spinner: { thickness: '3px' },
    kbd: { radius: '4px', border: 'var(--m-color-border-default)', shadow: 'none' },
    code: {
      bg: { light: '#f8fafb', dark: '#21262a' },
      radius: '8px',
      inlineRadius: '4px',
      border: 'var(--m-color-border-default)',
      comment: 'var(--m-color-fg-muted)',
    },
    // Questions are hairline rows with a chevron, no boxes
    accordion: {
      radius: '0',
      bg: 'transparent',
      paddingX: '0',
      paddingY: 'var(--m-space-5)',
      summarySize: 'var(--m-font-size-lg)',
      summaryWeight: 'var(--m-font-weight-regular)',
      hoverBg: 'transparent',
    },
    prose: { maxWidth: '68ch', lineHeight: '1.6' },
    // Your messages are teal bubbles with white text; replies are grey ones
    chat: {
      radius: '12px',
      userBg: 'var(--m-color-accent-default)',
      userFg: 'var(--m-color-accent-fg)',
      userBorder: 'var(--m-color-accent-default)',
      assistantBg: 'var(--m-color-bg-sunken)',
      assistantBorder: 'var(--m-color-bg-sunken)',
      avatarBg: 'var(--m-color-brand-subtle)',
      avatarFg: { light: '#241c15', dark: '#ffffff' },
      assistantAvatarBg: 'var(--m-color-brand-default)',
      assistantAvatarFg: 'var(--m-color-brand-fg)',
    },
    composer: { radius: '8px', shadow: 'none', border: { light: '#859299', dark: '#727e85' } },
    citation: { chipRadius: '4px' },
    toolCall: { radius: '8px' },
  },
});
