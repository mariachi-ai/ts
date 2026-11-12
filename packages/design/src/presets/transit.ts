import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Transit: a stark black-and-white booking interface. Black ink and black actions on white, big
 * bold geometric headings, 8px square-ish controls on a pale grey fill, 48px touch-sized buttons,
 * a 4px black bar for the current tab and nav row, and a single blue for focus, progress and
 * brand panels. Category: marketplace (rides, delivery, bookings). The values are measured from the
 * reference's live pages and its published component library, not invented (see DESIGN.md).
 */
const blue = { light: '#276ef1', dark: '#5e8bdb' };

export const transit = extendTheme(minimal, {
  name: 'transit',
  label: 'Transit',
  description:
    'Stark and direct: black on white, big bold headings, 8px controls on a grey fill, black actions and one blue for focus.',
  tokens: {
    color: {
      bg: {
        // Dark is true black behind, with the component library's dark greys for raised parts
        canvas: { light: '#ffffff', dark: '#000000' },
        surface: { light: '#ffffff', dark: '#161616' },
        raised: { light: '#ffffff', dark: '#292929' },
        // The grey fill: inputs, chips, secondary buttons, marketing tiles
        sunken: { light: '#f3f3f3', dark: '#292929' },
        overlay: { light: 'rgb(0 0 0 / 0.5)', dark: 'rgb(0 0 0 / 0.7)' },
        inverse: { light: '#000000', dark: '#dedede' },
      },
      fg: {
        default: { light: '#000000', dark: '#ffffff' },
        muted: { light: '#4b4b4b', dark: '#c4c4c4' },
        subtle: { light: '#5e5e5e', dark: '#ababab' },
        inverse: { light: '#ffffff', dark: '#000000' },
      },
      border: {
        // Hairlines: the panel edge and table rules
        default: { light: '#e2e2e2', dark: '#383838' },
        muted: { light: '#eeeeee', dark: '#292929' },
        // Controls: the reference's fields have no visible edge; the library's 3:1 floor needs one
        strong: { light: '#868686', dark: '#8c8c8c' },
        // Focus is the one place the blue shows in controls
        focus: blue,
      },
      // The action colour is black (white in dark): every primary button, check and current bar
      accent: {
        default: { light: '#000000', dark: '#ffffff' },
        hover: { light: '#282828', dark: '#e2e2e2' },
        active: { light: '#4b4b4b', dark: '#c6c6c6' },
        subtle: { light: '#f3f3f3', dark: '#292929' },
        fg: { light: '#ffffff', dark: '#000000' },
        // Links are black and underlined, never blue
        text: { light: '#000000', dark: '#ffffff' },
      },
      // The design system's own brand token is a blue (promo banners, safety, brand panels)
      brand: {
        default: { light: '#276ef1', dark: '#276ef1' },
        fg: '#ffffff',
        subtle: { light: '#eff4fe', dark: '#182946' },
      },
      success: {
        bg: { light: '#eaf6ed', dark: '#162f1e' },
        fg: { light: '#166c3b', dark: '#8fc19c' },
        border: { light: '#0e8345', dark: '#3d8351' },
        solid: { light: '#0e8345', dark: '#306c44' },
        onSolid: '#ffffff',
      },
      warning: {
        bg: { light: '#fdf2dc', dark: '#39240a' },
        fg: { light: '#845201', dark: '#d7ac57' },
        border: { light: '#9f6402', dark: '#916c1a' },
        solid: { light: '#f6bc2f', dark: '#d7ac57' },
        onSolid: '#000000',
      },
      danger: {
        bg: { light: '#fff0ee', dark: '#4a1216' },
        fg: { light: '#bb032a', dark: '#ea9b98' },
        border: { light: '#de1135', dark: '#c33840' },
        solid: { light: '#de1135', dark: '#a32c34' },
        onSolid: '#ffffff',
      },
      info: {
        bg: { light: '#eff4fe', dark: '#182946' },
        fg: { light: '#175bcc', dark: '#93b4ee' },
        border: { light: '#276ef1', dark: '#3f6ec5' },
        solid: { light: '#276ef1', dark: '#335ba3' },
        onSolid: '#ffffff',
      },
      selection: {
        bg: { light: '#cddeff', dark: '#2d4775' },
        fg: { light: '#000000', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // A tight geometric grotesque; Figtree stands in for the reference's proprietary face
        sans: '"Figtree Variable", "Figtree", system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif',
        display: '"Figtree Variable", "Figtree", system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif',
        mono: '"IBM Plex Mono", "Lucida Console", Monaco, ui-monospace, monospace',
      },
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.75rem',
        '3xl': '2.25rem',
        '4xl': '3.25rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.23', normal: '1.5', relaxed: '1.6' },
      tracking: { tight: '-0.01em', normal: '0', wide: '0.02em' },
      body: { weight: '400' },
      heading: { weight: '700', tracking: '-0.01em' },
    },
    control: {
      // Touch-sized: 36px compact, 48px default, 56px large
      height: {
        sm: 'calc(2.25rem * var(--m-density))',
        md: 'calc(3rem * var(--m-density))',
        lg: 'calc(3.5rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.25rem * var(--m-density))',
      },
      fontSize: 'var(--m-font-size-md)',
    },
    // 8px for controls and menus, 12px for panels and banners, 16px for dialogs; pills for chips
    radius: { sm: '4px', md: '8px', lg: '12px', control: '8px', container: '12px' },
    shadow: {
      sm: { light: '0 1px 4px rgb(0 0 0 / 0.16)', dark: '0 1px 4px rgb(0 0 0 / 0.5)' },
      md: { light: '0 2px 8px rgb(0 0 0 / 0.16)', dark: '0 2px 8px rgb(0 0 0 / 0.5)' },
      lg: { light: '0 4px 16px rgb(0 0 0 / 0.16)', dark: '0 4px 16px rgb(0 0 0 / 0.6)' },
      overlay: { light: '0 16px 48px rgb(0 0 0 / 0.22)', dark: '0 16px 48px rgb(0 0 0 / 0.7)' },
    },
    focus: { width: '2px', offset: '2px' },
    motion: {
      duration: { fast: '150ms', normal: '200ms', slow: '400ms' },
      easing: { standard: 'cubic-bezier(0.4, 0, 0.2, 1)', emphasized: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    },
  },
  components: {
    // A 72rem content column; the booking panel beside the map is about 20.5rem
    layout: {
      containerMax: { sm: '30rem', md: '48rem', lg: '72rem' },
      containerPadding: 'clamp(1rem, 4vw, 2.5rem)',
      gridGap: 'var(--m-space-4)',
      splitSide: '20.5rem',
    },
    // 8px corners, medium weight: black for the one action, the grey fill for the rest
    button: {
      fontWeight: 'var(--m-font-weight-medium)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      secondary: {
        bg: { light: '#f3f3f3', dark: '#292929' },
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        hoverBg: { light: '#dddddd', dark: '#383838' },
        activeBg: { light: '#c6c6c6', dark: '#484848' },
      },
      ghost: {
        hoverBg: { light: '#f3f3f3', dark: '#292929' },
        activeBg: { light: '#e8e8e8', dark: '#383838' },
      },
      danger: {
        hoverBg: { light: '#bb032a', dark: '#c33840' },
        activeBg: { light: '#950f22', dark: '#7f1f26' },
      },
    },
    // Fields are a grey fill; the edge is drawn at the 3:1 floor and turns black while typing
    input: {
      bg: 'var(--m-color-bg-sunken)',
      border: 'var(--m-color-border-strong)',
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-fg-default)',
      disabledBg: { light: '#f3f3f3', dark: '#1f1f1f' },
      placeholder: 'var(--m-color-fg-subtle)',
      paddingX: { sm: 'var(--m-space-3)', md: 'var(--m-space-4)', lg: 'var(--m-space-4)' },
    },
    field: {
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-medium)',
      hintFg: 'var(--m-color-fg-subtle)',
      hintFontSize: 'var(--m-font-size-xs)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    // A 17px box with a 2px grey edge; black with a white tick when checked
    checkbox: {
      size: '1.0625rem',
      radius: '4px',
      borderWidth: '2px',
      border: { light: '#5e5e5e', dark: '#ababab' },
      hoverBorder: 'var(--m-color-fg-default)',
      checkedBg: 'var(--m-color-accent-default)',
      checkedBorder: 'var(--m-color-accent-default)',
      mark: 'var(--m-color-accent-fg)',
    },
    // 52 x 32 with a 2px edge; black with a white thumb when on. The reference's off track is a pale
    // grey (#e8e8e8) behind a grey thumb; the 3:1 floor needs the mid grey, so the thumb is white
    switch: {
      width: '3.25rem',
      height: '2rem',
      smWidth: '2.5rem',
      smHeight: '1.5rem',
      borderWidth: '2px',
      border: { light: '#5e5e5e', dark: '#ababab' },
      trackBg: 'var(--m-color-border-strong)',
      trackCheckedBg: 'var(--m-color-accent-default)',
      thumbBg: { light: '#ffffff', dark: '#000000' },
      thumbCheckedBg: 'var(--m-color-accent-fg)',
      thumbInset: '4px',
      thumbShadow: 'none',
    },
    // White, a 2px pale-grey edge, 12px corners, no shadow (the booking panel)
    card: {
      border: 'var(--m-color-border-default)',
      borderWidth: '2px',
      shadow: 'none',
      hoverShadow: 'var(--m-shadow-lg)',
      hoverBorder: 'var(--m-color-border-default)',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-4)', lg: 'var(--m-space-6)' },
      titleFamily: 'var(--m-font-family-display)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-bold)',
      descriptionSize: 'var(--m-font-size-sm)',
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    // Rows on white, 16px headers at medium weight, 14px cells, 16px padding, 12%-black rules
    table: {
      fontSize: 'var(--m-font-size-sm)',
      cellPaddingX: 'var(--m-space-4)',
      cellPaddingY: 'var(--m-space-4)',
      compactPaddingY: 'var(--m-space-2)',
      borderColor: 'var(--m-color-border-default)',
      headerBg: 'var(--m-color-bg-surface)',
      headerFg: 'var(--m-color-fg-default)',
      headerFontSize: 'var(--m-font-size-md)',
      headerFontWeight: 'var(--m-font-weight-medium)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      rowHoverBg: { light: '#f6f6f6', dark: '#1f1f1f' },
      stripeBg: 'var(--m-color-bg-sunken)',
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    // The current row: a pale grey fill and a 4px black bar on its leading edge
    sidebar: {
      width: '15rem',
      bg: 'var(--m-color-bg-canvas)',
      border: 'var(--m-color-border-default)',
      padding: '0',
      sectionGap: 'var(--m-space-4)',
      itemGap: '0',
      fontSize: 'var(--m-font-size-md)',
      heading: {
        fg: 'var(--m-color-fg-subtle)',
        size: 'var(--m-font-size-sm)',
        weight: 'var(--m-font-weight-medium)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#f6f6f6', dark: '#1f1f1f' },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: '#ebebeb', dark: '#292929' },
        activeWeight: 'var(--m-font-weight-medium)',
        radius: '0',
        paddingX: 'var(--m-space-3)',
        paddingY: 'calc(0.75rem * var(--m-density))',
        indicator: 'var(--m-color-accent-default)',
        indicatorWidth: '4px',
      },
      count: { bg: 'var(--m-color-accent-default)', fg: 'var(--m-color-accent-fg)' },
    },
    // The public header: a black bar with pill links
    navbar: {
      height: 'calc(4rem * var(--m-density))',
      paddingX: 'clamp(1rem, 4vw, 2.5rem)',
      bg: '#000000',
      fg: '#ffffff',
      border: 'transparent',
      brandFamily: 'var(--m-font-family-display)',
      brandSize: 'var(--m-font-size-2xl)',
      brandWeight: 'var(--m-font-weight-medium)',
      link: {
        height: '2.25rem',
        paddingX: 'var(--m-space-3)',
        radius: 'var(--m-radius-full)',
        fontSize: 'var(--m-font-size-sm)',
        fontWeight: 'var(--m-font-weight-medium)',
        fg: '#ffffff',
        hoverFg: '#ffffff',
        hoverBg: '#333333',
        activeFg: '#000000',
        activeBg: '#ffffff',
      },
    },
    // A 4px black bar under the current tab. The reference also lays a 4px grey baseline under the
    // whole bar; the tab list scrolls, which clips an indicator drawn over its own border, so the
    // baseline belongs to the header around the tabs (see the recipes). The segmented control is a
    // grey track whose current segment is white with a 2px black edge
    tabs: {
      listGap: '0',
      listBorder: 'var(--m-color-border-muted)',
      listBorderWidth: '0px',
      height: '3rem',
      paddingX: 'var(--m-space-4)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-subtle)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-accent-default)',
      indicatorWidth: '4px',
      pill: {
        listBg: 'var(--m-color-bg-sunken)',
        listRadius: '12px',
        listPadding: '4px',
        radius: '8px',
        activeBg: 'var(--m-color-bg-surface)',
        activeShadow: 'inset 0 0 0 2px var(--m-color-accent-default)',
      },
    },
    breadcrumb: {
      separator: '"›"',
      separatorFg: 'var(--m-color-fg-subtle)',
      fontSize: 'var(--m-font-size-md)',
      fg: 'var(--m-color-fg-muted)',
      currentWeight: 'var(--m-font-weight-medium)',
    },
    pagination: {
      size: '2.25rem',
      radius: '8px',
      fontWeight: 'var(--m-font-weight-medium)',
      hoverBg: 'var(--m-color-bg-sunken)',
    },
    // Badges: small 4px tags on a tint, no border; solid black for emphasis
    badge: {
      height: '1.5rem',
      paddingX: '0.375rem',
      radius: '4px',
      borderWidth: '0px',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-medium)',
      neutral: {
        bg: 'var(--m-color-bg-sunken)',
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
      },
    },
    // Round, black, white initials (light grey in dark)
    avatar: {
      size: { sm: '2rem', md: '2.5rem', lg: '3.5rem' },
      bg: 'var(--m-color-bg-inverse)',
      fg: 'var(--m-color-fg-inverse)',
      fontWeight: 'var(--m-font-weight-regular)',
    },
    // Banners: a tint, black text, 12px corners, no border or stripe
    alert: {
      fg: 'var(--m-color-fg-default)',
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '12px',
      padding: 'var(--m-space-4)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    // The snackbar: dark grey, white text, 12px corners, a long soft shadow
    toast: {
      bg: { light: '#282828', dark: '#383838' },
      fg: '#ffffff',
      bodyFg: { light: '#dddddd', dark: '#dedede' },
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '12px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-4)',
      width: '25rem',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    // Dialogs: 16px corners on a 50% black scrim, bold 20px titles
    dialog: {
      border: 'transparent',
      radius: '16px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-6)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    // Menus: white, 8px corners, the 16px soft shadow, square full-width rows
    popover: {
      border: 'transparent',
      radius: '8px',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-2) 0',
      item: {
        height: '2.25rem',
        paddingX: 'var(--m-space-4)',
        radius: '0',
        fontSize: 'var(--m-font-size-sm)',
        hoverBg: { light: '#f3f3f3', dark: '#383838' },
      },
      separator: 'var(--m-color-border-muted)',
    },
    tooltip: {
      bg: { light: '#282828', dark: '#dedede' },
      fg: { light: '#ffffff', dark: '#000000' },
      radius: '8px',
      shadow: 'var(--m-shadow-sm)',
      paddingX: 'var(--m-space-3)',
      paddingY: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-medium)',
    },
    // Progress is the system blue on a grey track, 4px, barely rounded
    progress: {
      height: { sm: '2px', md: '4px', lg: '8px' },
      radius: '2px',
      track: { light: '#e8e8e8', dark: '#383838' },
      fill: blue,
    },
    usage: {
      height: '4px',
      radius: '2px',
      track: { light: '#e8e8e8', dark: '#383838' },
      okFill: blue,
    },
    skeleton: {
      bg: { light: '#e8e8e8', dark: '#292929' },
      highlight: { light: '#f3f3f3', dark: '#383838' },
      radius: '4px',
      blockRadius: '8px',
    },
    spinner: {
      thickness: '3px',
      track: { light: '#e8e8e8', dark: '#383838' },
      color: blue,
    },
    kbd: {
      bg: 'var(--m-color-bg-sunken)',
      border: 'transparent',
      radius: '4px',
      shadow: 'none',
      fontWeight: 'var(--m-font-weight-medium)',
    },
    code: {
      bg: 'var(--m-color-bg-sunken)',
      border: 'transparent',
      radius: '8px',
      inlineBorder: 'transparent',
      inlineRadius: '4px',
      keyword: 'var(--m-color-info-fg)',
      function: 'var(--m-color-fg-default)',
      comment: 'var(--m-color-fg-subtle)',
    },
    // Accordion: rows on a faint rule, 16px medium questions, no box
    accordion: {
      bg: 'transparent',
      border: 'var(--m-color-border-muted)',
      radius: '0',
      paddingX: 'var(--m-space-5)',
      paddingY: 'var(--m-space-4)',
      summaryWeight: 'var(--m-font-weight-medium)',
      hoverBg: { light: '#f6f6f6', dark: '#1f1f1f' },
      contentFg: 'var(--m-color-fg-default)',
    },
    divider: {
      color: 'var(--m-color-border-muted)',
      labelTransform: 'none',
      labelTracking: '0',
    },
    prose: { linkFg: 'var(--m-color-fg-default)', h2Border: 'transparent' },
    chat: {
      radius: '12px',
      userBg: 'var(--m-color-accent-default)',
      userFg: 'var(--m-color-accent-fg)',
      userBorder: 'var(--m-color-accent-default)',
      assistantBg: 'var(--m-color-bg-sunken)',
      assistantBorder: 'transparent',
      avatarBg: 'var(--m-color-bg-sunken)',
      avatarFg: 'var(--m-color-fg-default)',
    },
    composer: {
      bg: 'var(--m-color-bg-sunken)',
      shadow: 'none',
      radius: '12px',
      focusBorder: 'var(--m-color-fg-default)',
    },
    citation: {
      chipBg: 'var(--m-color-bg-sunken)',
      chipFg: 'var(--m-color-fg-default)',
      chipRadius: 'var(--m-radius-full)',
    },
    toolCall: { radius: '8px', statusRadius: '4px' },
  },
});
