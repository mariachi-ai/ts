import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Relay: a busy, appetising delivery marketplace. Near-black bold type on white, one signature red
 * for the action that matters (pill buttons, the cart, the current nav row), a pale grey fill for
 * search, chips and secondary pills, image-led store cards with rating, time and fee, underline tabs
 * with a black bar, 16px-rounded hairline cards and a black progress stepper for live orders.
 * Category: marketplace (delivery, takeout, groceries). The values are measured from the
 * reference's public pages, its published help-centre tokens and real app screenshots, not invented
 * (see DESIGN.md).
 */
const ink = { light: '#191919', dark: '#f7f7f7' };
// The grey fill: search, secondary pills, segmented tracks, quantity steppers
const fill = { light: '#f1f1f1', dark: '#2b2b2b' };
const fillHover = { light: '#e7e7e7', dark: '#363636' };
const fillActive = { light: '#d9d9d9', dark: '#424242' };
// The current nav row: the red at 9% over white (the reference's own nav token)
const redTint = { light: '#fdeae8', dark: '#3a1410' };

export const relay = extendTheme(minimal, {
  name: 'relay',
  label: 'Relay',
  description:
    'Bold and appetising: near-black type on white, one signature red for actions, grey-filled pills and chips, image-led store cards and a black order stepper.',
  tokens: {
    color: {
      bg: {
        canvas: { light: '#ffffff', dark: '#121212' },
        surface: { light: '#ffffff', dark: '#1a1a1a' },
        raised: { light: '#ffffff', dark: '#262626' },
        // Tiles and quiet panels (category tiles, the store header's info strip)
        sunken: { light: '#f7f7f7', dark: '#202020' },
        overlay: { light: 'rgb(0 0 0 / 0.5)', dark: 'rgb(0 0 0 / 0.7)' },
        inverse: { light: '#191919', dark: '#f7f7f7' },
      },
      fg: {
        default: ink,
        // Store meta lines: rating, distance, time, fee
        muted: { light: '#606060', dark: '#bdbdbd' },
        subtle: { light: '#767676', dark: '#a3a3a3' },
        inverse: { light: '#ffffff', dark: '#191919' },
      },
      border: {
        // Hairlines between rows and around cards
        default: { light: '#e7e7e7', dark: '#333333' },
        muted: { light: '#f1f1f1', dark: '#262626' },
        // Control edges: the reference's chips use #d9d9d9; the library's 3:1 floor needs this
        strong: { light: '#858585', dark: '#7a7a7a' },
        // Focus is the red, as on the reference's own fields
        focus: { light: '#eb1700', dark: '#ff4a2e' },
      },
      // The action red: the darker of the reference's two reds, the one that carries white text
      accent: {
        default: { light: '#eb1700', dark: '#eb1700' },
        hover: { light: '#d91400', dark: '#d91400' },
        active: { light: '#b71000', dark: '#b71000' },
        // Promo tags ("20% off select items") sit on this pale pink
        subtle: { light: '#fff2f1', dark: '#3a1410' },
        fg: '#ffffff',
        // Red text: the app's promo-tag red (links on the web use the action red itself)
        text: { light: '#c62218', dark: '#ff7a66' },
      },
      // The signature red is the brand: hero bands, the footer band and brand panels. The logo red
      // (#ff3008) is too light for white text, so bands use the action red, as the help centre does
      brand: {
        default: { light: '#eb1700', dark: '#eb1700' },
        fg: '#ffffff',
        // The warm off-white behind the help centre's home and brand panels
        subtle: { light: '#fff7f5', dark: '#2a1512' },
      },
      success: {
        bg: { light: '#eafdf2', dark: '#10301c' },
        fg: { light: '#1f7f37', dark: '#7fd49a' },
        border: { light: '#b9e5c6', dark: '#25553a' },
        solid: { light: '#1f7f37', dark: '#2e9e52' },
        onSolid: { light: '#ffffff', dark: '#0b1f12' },
      },
      warning: {
        bg: { light: '#fff6e0', dark: '#33260a' },
        fg: { light: '#875400', dark: '#f2c55c' },
        border: { light: '#f3d38c', dark: '#5c4614' },
        solid: { light: '#f5b800', dark: '#e0a800' },
        onSolid: '#191919',
      },
      danger: {
        bg: { light: '#fff2f1', dark: '#3a1410' },
        fg: { light: '#c62218', dark: '#ff8a78' },
        border: { light: '#f8c6c1', dark: '#6b2219' },
        // A step darker than the action red, so a destructive button never reads as the main action
        solid: { light: '#b71000', dark: '#b71000' },
        onSolid: '#ffffff',
      },
      info: {
        bg: { light: '#eef3ff', dark: '#172447' },
        fg: { light: '#1d4ed8', dark: '#9db8ff' },
        border: { light: '#c5d5fb', dark: '#2c427c' },
        solid: { light: '#2563eb', dark: '#2563eb' },
        onSolid: '#ffffff',
      },
      selection: {
        bg: { light: '#ffd9d3', dark: '#5a1d14' },
        fg: { light: '#191919', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // A geometric grotesque; Figtree stands in for the reference's proprietary face
        sans: '"Figtree Variable", "Figtree", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        display: '"Figtree Variable", "Figtree", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        mono: '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.15', normal: '1.5', relaxed: '1.625' },
      tracking: { tight: '-0.02em', normal: '0', wide: '0.02em' },
      body: { weight: '400' },
      heading: { weight: '700', tracking: '-0.02em' },
    },
    control: {
      // 32px chips, 40px buttons (measured), 48px checkout and add-to-cart
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
      fontSize: 'var(--m-font-size-md)',
    },
    // 4px tags, 8px fields and menus, 16px cards; actions, chips and search are pills
    radius: { sm: '4px', md: '8px', lg: '16px', control: '8px', container: '16px' },
    shadow: {
      // The help centre's card: a barely-there stack
      sm: {
        light: '0 1px 1px rgb(25 25 25 / 0.02), 0 2px 2px rgb(0 0 0 / 0.02), 0 4px 4px rgb(0 0 0 / 0.02)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.04)',
      },
      // Floating pills on photos (the round add button, the back button over a store banner)
      md: { light: '0 1px 4px rgb(0 0 0 / 0.2)', dark: '0 1px 4px rgb(0 0 0 / 0.6)' },
      // Card hover and menus
      lg: { light: '0 4px 16px rgb(0 0 0 / 0.15)', dark: '0 4px 16px rgb(0 0 0 / 0.6)' },
      overlay: {
        light: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1), 0 16px 40px rgb(0 0 0 / 0.12)',
        dark: '0 16px 40px rgb(0 0 0 / 0.7)',
      },
    },
    focus: { width: '2px', offset: '2px' },
    motion: {
      duration: { fast: '150ms', normal: '200ms', slow: '300ms' },
      easing: { standard: 'cubic-bezier(0.4, 0, 0.2, 1)', emphasized: 'cubic-bezier(0.2, 0, 0, 1)' },
    },
  },
  components: {
    // A 76.5rem content column beside a 15rem side nav; the cart drawer is about 24rem
    layout: {
      containerMax: { sm: '30rem', md: '48rem', lg: '76.5rem' },
      containerPadding: 'clamp(1rem, 3vw, 1.5rem)',
      gridGap: 'var(--m-space-4)',
      splitSide: '15rem',
    },
    // Pills, 16px bold labels: red for the one action, the grey fill for the rest
    button: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-bold)',
      tracking: '-0.01em',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      secondary: {
        bg: fill,
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        hoverBg: fillHover,
        activeBg: fillActive,
      },
      ghost: { hoverBg: fill, activeBg: fillHover },
      danger: {
        hoverBg: { light: '#951000', dark: '#951000' },
        activeBg: { light: '#7a0d00', dark: '#7a0d00' },
      },
    },
    // Fields are the grey fill with 8px corners; the edge is drawn at the 3:1 floor and turns ink
    // while typing (the reference's fields have no visible edge)
    input: {
      bg: fill,
      border: 'var(--m-color-border-strong)',
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-fg-default)',
      disabledBg: { light: '#f7f7f7', dark: '#202020' },
      placeholder: { light: '#606060', dark: '#b0b0b0' },
      paddingX: { sm: 'var(--m-space-3)', md: 'var(--m-space-4)', lg: 'var(--m-space-4)' },
    },
    select: {
      bg: fill,
      border: 'var(--m-color-border-strong)',
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-fg-default)',
    },
    field: {
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-bold)',
      hintFg: 'var(--m-color-fg-muted)',
      hintFontSize: 'var(--m-font-size-xs)',
      errorFontWeight: 'var(--m-font-weight-medium)',
    },
    // Checks and radios are ink, not red: the app's appearance picker draws black rings and dots
    checkbox: {
      size: '1.125rem',
      radius: '4px',
      borderWidth: '2px',
      border: { light: '#767676', dark: '#a3a3a3' },
      hoverBorder: 'var(--m-color-fg-default)',
      checkedBg: 'var(--m-color-fg-default)',
      checkedBorder: 'var(--m-color-fg-default)',
      mark: 'var(--m-color-fg-inverse)',
    },
    radio: {
      size: '1.25rem',
      borderWidth: '2px',
      border: { light: '#767676', dark: '#a3a3a3' },
      hoverBorder: 'var(--m-color-fg-default)',
      // The app's radio is an ink ring around an ink dot; the 3:1 floor checks the fill, so the
      // checked radio is ink with a white dot
      checkedBg: 'var(--m-color-fg-default)',
      checkedBorder: 'var(--m-color-fg-default)',
      dot: 'var(--m-color-fg-inverse)',
    },
    // On is the red; off is a mid grey (the 3:1 floor) with a white thumb
    switch: {
      width: '3.25rem',
      height: '2rem',
      smWidth: '2.5rem',
      smHeight: '1.5rem',
      borderWidth: '0px',
      trackBg: { light: '#858585', dark: '#7a7a7a' },
      trackCheckedBg: 'var(--m-color-accent-default)',
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbInset: '3px',
      thumbShadow: '0 1px 3px rgb(0 0 0 / 0.25)',
    },
    // White, a hairline, 16px corners and the faint stack (the help centre's category card)
    card: {
      border: 'var(--m-color-border-default)',
      shadow: 'var(--m-shadow-sm)',
      hoverShadow: 'var(--m-shadow-lg)',
      hoverBorder: 'var(--m-color-border-default)',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-6)', lg: 'var(--m-space-8)' },
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-bold)',
      descriptionSize: 'var(--m-font-size-sm)',
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    // Rows on hairlines, small bold grey headers, 14px cells (the merchant portal's tables)
    table: {
      fontSize: 'var(--m-font-size-sm)',
      cellPaddingX: 'var(--m-space-4)',
      cellPaddingY: 'var(--m-space-3)',
      borderColor: 'var(--m-color-border-default)',
      headerBg: 'var(--m-color-bg-surface)',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-xs)',
      headerFontWeight: 'var(--m-font-weight-bold)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      rowHoverBg: 'var(--m-color-bg-sunken)',
      stripeBg: 'var(--m-color-bg-sunken)',
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    // The side nav: 16px medium rows with 8px corners; the current one is red text on a red tint
    sidebar: {
      width: '15rem',
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      padding: 'var(--m-space-3)',
      sectionGap: 'var(--m-space-5)',
      itemGap: '2px',
      fontSize: 'var(--m-font-size-md)',
      heading: {
        fg: 'var(--m-color-fg-default)',
        size: 'var(--m-font-size-sm)',
        weight: 'var(--m-font-weight-bold)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#f7f7f7', dark: '#262626' },
        activeFg: 'var(--m-color-accent-text)',
        activeBg: redTint,
        activeWeight: 'var(--m-font-weight-bold)',
        radius: '8px',
        paddingX: 'var(--m-space-3)',
        paddingY: 'calc(0.625rem * var(--m-density))',
        indicatorWidth: '0px',
      },
      count: { bg: 'var(--m-color-accent-default)', fg: 'var(--m-color-accent-fg)' },
    },
    // The header: white, 64px, a hairline under it; links are grey-fill pills when current
    navbar: {
      height: 'calc(4rem * var(--m-density))',
      paddingX: 'clamp(1rem, 3vw, 1.5rem)',
      bg: 'var(--m-color-bg-surface)',
      fg: 'var(--m-color-fg-default)',
      border: 'var(--m-color-border-default)',
      brandSize: 'var(--m-font-size-xl)',
      brandWeight: 'var(--m-font-weight-bold)',
      link: {
        height: '2.5rem',
        paddingX: 'var(--m-space-4)',
        radius: 'var(--m-radius-full)',
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-medium)',
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: fill,
        activeFg: 'var(--m-color-fg-default)',
        activeBg: fill,
      },
    },
    // Underline tabs: grey labels, the current one in ink over a 2px ink bar. The segmented control
    // (Delivery / Pickup) is a grey pill track whose current segment is a white pill
    tabs: {
      listGap: 'var(--m-space-2)',
      listBorder: 'var(--m-color-border-default)',
      listBorderWidth: '1px',
      height: '2.75rem',
      paddingX: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-md)',
      fontWeight: 'var(--m-font-weight-bold)',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-fg-default)',
      indicatorWidth: '2px',
      pill: {
        listBg: fill,
        listRadius: 'var(--m-radius-full)',
        listPadding: '3px',
        radius: 'var(--m-radius-full)',
        activeBg: { light: '#ffffff', dark: '#3d3d3d' },
        activeShadow: '0 1px 4px rgb(0 0 0 / 0.16)',
      },
    },
    breadcrumb: {
      separator: '"/"',
      separatorFg: 'var(--m-color-fg-subtle)',
      fontSize: 'var(--m-font-size-sm)',
      fg: 'var(--m-color-fg-default)',
      currentWeight: 'var(--m-font-weight-medium)',
    },
    pagination: {
      size: '2.5rem',
      radius: 'var(--m-radius-full)',
      fontWeight: 'var(--m-font-weight-bold)',
      hoverBg: fill,
    },
    // Tags: 4px corners, 12px bold, a tint with matching text (promo red, stock green)
    badge: {
      height: '1.5rem',
      paddingX: '0.375rem',
      radius: '4px',
      borderWidth: '0px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-bold)',
      neutral: {
        bg: fill,
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
      },
    },
    avatar: {
      size: { sm: '2rem', md: '2.5rem', lg: '4rem' },
      bg: fill,
      fg: 'var(--m-color-fg-default)',
      fontWeight: 'var(--m-font-weight-bold)',
    },
    // Banners: a tint, ink text, 12px corners, no border or stripe
    alert: {
      fg: 'var(--m-color-fg-default)',
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '12px',
      padding: 'var(--m-space-4)',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    // The snackbar: near-black, white text, 8px corners
    toast: {
      bg: { light: '#191919', dark: '#333333' },
      fg: '#ffffff',
      bodyFg: { light: '#e7e7e7', dark: '#e7e7e7' },
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '8px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-4)',
      width: '24rem',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    dialog: {
      border: 'transparent',
      radius: '16px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-6)',
      titleSize: 'var(--m-font-size-2xl)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    popover: {
      border: 'transparent',
      radius: '12px',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-2)',
      item: {
        height: '2.5rem',
        paddingX: 'var(--m-space-3)',
        radius: '8px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: { light: '#f7f7f7', dark: '#333333' },
      },
      separator: 'var(--m-color-border-default)',
    },
    tooltip: {
      bg: { light: '#191919', dark: '#f7f7f7' },
      fg: { light: '#ffffff', dark: '#191919' },
      radius: '8px',
      shadow: 'none',
      paddingX: 'var(--m-space-3)',
      paddingY: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-bold)',
    },
    // Progress is the order stepper's ink bar on a pale grey track
    progress: {
      height: { sm: '2px', md: '4px', lg: '6px' },
      radius: '9999px',
      track: { light: '#e7e7e7', dark: '#333333' },
      fill: ink,
    },
    usage: {
      height: '4px',
      radius: '9999px',
      track: { light: '#e7e7e7', dark: '#333333' },
      okFill: ink,
    },
    skeleton: {
      bg: { light: '#f1f1f1', dark: '#262626' },
      highlight: { light: '#f7f7f7', dark: '#303030' },
      radius: '4px',
      blockRadius: '12px',
    },
    spinner: {
      thickness: '3px',
      track: { light: '#e7e7e7', dark: '#333333' },
      color: 'var(--m-color-accent-default)',
    },
    kbd: {
      bg: fill,
      border: 'transparent',
      radius: '4px',
      shadow: 'none',
      fontWeight: 'var(--m-font-weight-bold)',
    },
    code: {
      bg: 'var(--m-color-bg-sunken)',
      border: 'transparent',
      radius: '8px',
      inlineBorder: 'transparent',
      inlineRadius: '4px',
      keyword: 'var(--m-color-accent-text)',
      function: 'var(--m-color-info-fg)',
      comment: 'var(--m-color-fg-muted)',
    },
    // FAQ rows on hairlines inside a 16px card, 16px bold questions, muted answers
    accordion: {
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-default)',
      radius: '16px',
      paddingX: 'var(--m-space-5)',
      paddingY: 'var(--m-space-5)',
      summaryWeight: 'var(--m-font-weight-bold)',
      hoverBg: 'var(--m-color-bg-sunken)',
      contentFg: 'var(--m-color-fg-muted)',
    },
    divider: {
      color: 'var(--m-color-border-default)',
      labelTransform: 'none',
      labelTracking: '0',
    },
    prose: { linkFg: 'var(--m-color-accent-text)', h2Border: 'transparent' },
    chat: {
      radius: '16px',
      userBg: 'var(--m-color-accent-default)',
      userFg: 'var(--m-color-accent-fg)',
      userBorder: 'var(--m-color-accent-default)',
      assistantBg: fill,
      assistantBorder: 'transparent',
      avatarBg: fill,
      avatarFg: 'var(--m-color-fg-default)',
    },
    composer: {
      bg: 'var(--m-color-bg-surface)',
      shadow: 'var(--m-shadow-lg)',
      radius: '24px',
      focusBorder: 'var(--m-color-fg-default)',
    },
    citation: {
      chipBg: fill,
      chipFg: 'var(--m-color-fg-default)',
      chipRadius: 'var(--m-radius-full)',
    },
    toolCall: { radius: '12px', statusRadius: '4px' },
  },
});
