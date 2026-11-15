import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

// The neutral fill: secondary buttons, icon buttons, the segmented track (grey200 / the dark interactive grey)
const fill = { light: '#f2f2f2', dark: '#2c2c2c' };
const fillHover = { light: '#ebebeb', dark: '#3f3f3f' };
const fillActive = { light: '#dddddd', dark: '#515151' };
// The quiet hover behind text buttons, rows and menu items
const quietHover = { light: '#f7f7f7', dark: '#222222' };

/**
 * Terracotta: a warm, image-forward marketplace. Near-black ink on white, one coral-to-magenta
 * action colour, rounded photo cards with no frame, a pill search bar, soft lifted panels, hairline
 * sections and underlined text links. Category: warm and friendly, also marketplace. The values are
 * the reference's published palette, type and elevation tokens, read as data (see DESIGN.md).
 */
export const terracotta = extendTheme(minimal, {
  name: 'terracotta',
  label: 'Terracotta',
  description:
    'Warm and image-forward: ink on white, a coral-magenta action colour, rounded photo cards, a pill search bar, soft lifted panels and underlined links.',
  tokens: {
    color: {
      bg: {
        canvas: { light: '#ffffff', dark: '#111111' },
        surface: { light: '#ffffff', dark: '#191919' },
        raised: { light: '#ffffff', dark: '#222222' },
        // The footer, quiet bands and wells
        sunken: { light: '#f7f7f7', dark: '#191919' },
        // The modal scrim: black at 40%
        overlay: { light: 'rgb(0 0 0 / 0.4)', dark: 'rgb(0 0 0 / 0.6)' },
        inverse: { light: '#222222', dark: '#f7f7f7' },
      },
      fg: {
        default: { light: '#222222', dark: '#f7f7f7' },
        muted: { light: '#6c6c6c', dark: '#a6a6a6' },
        // The reference's tertiary grey (#8c8c8c) is under 4.5:1; this is its older secondary grey
        subtle: { light: '#717171', dark: '#8c8c8c' },
        inverse: { light: '#ffffff', dark: '#222222' },
      },
      border: {
        // Hairlines and the divider
        default: { light: '#dddddd', dark: '#2c2c2c' },
        muted: { light: '#ebebeb', dark: '#222222' },
        // The quaternary border grey: the first step that holds 3:1 for a control
        strong: { light: '#8c8c8c', dark: '#6c6c6c' },
        // Focus is an ink ring, not the brand colour
        focus: { light: '#222222', dark: '#f7f7f7' },
      },
      // The action colour: the coral-magenta gradient's middle stop at rest, its end on hover, the
      // hover gradient's outer stop when pressed
      accent: {
        default: { light: '#e31c5f', dark: '#da1249' },
        hover: { light: '#d70466', dark: '#e31c5f' },
        active: { light: '#bd1e59', dark: '#bd1e59' },
        subtle: { light: '#fff5f6', dark: '#361a21' },
        fg: '#ffffff',
        // Links and accent text are ink, underlined, as in the reference; the brand's text red (#da1249) is not a link colour
        text: { light: '#222222', dark: '#f7f7f7' },
      },
      // The signature coral: the logo mark, the search disc, saved hearts and the viewer's own place on a public map
      brand: {
        default: { light: '#ff385c', dark: '#ff385c' },
        fg: { light: '#111111', dark: '#111111' },
        subtle: { light: '#fff5f6', dark: '#361a21' },
      },
      success: {
        bg: { light: '#e6f6e9', dark: '#112716' },
        fg: { light: '#038026', dark: '#12a139' },
        border: { light: '#8dd19e', dark: '#104b20' },
        solid: { light: '#038026', dark: '#12a139' },
        onSolid: { light: '#ffffff', dark: '#111111' },
      },
      warning: {
        bg: { light: '#fef6ec', dark: '#371c10' },
        fg: { light: '#8f3400', dark: '#f7b383' },
        border: { light: '#f7b383', dark: '#712a05' },
        solid: { light: '#eb6100', dark: '#eb6100' },
        onSolid: { light: '#222222', dark: '#111111' },
      },
      // Errors are a burnt red, never the brand coral
      danger: {
        bg: { light: '#fff5f3', dark: '#241513' },
        fg: { light: '#c13515', dark: '#e74d2e' },
        border: { light: '#c13515', dark: '#e74d2e' },
        solid: { light: '#c13515', dark: '#e74d2e' },
        onSolid: { light: '#ffffff', dark: '#111111' },
      },
      info: {
        bg: { light: '#f0f8ff', dark: '#162339' },
        fg: { light: '#0d4daa', dark: '#94c5fd' },
        border: { light: '#94c5fd', dark: '#173f7f' },
        solid: { light: '#166bd8', dark: '#318cf7' },
        onSolid: { light: '#ffffff', dark: '#111111' },
      },
      selection: {
        bg: { light: '#ffd2d7', dark: '#732139' },
        fg: { light: '#222222', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // A friendly geometric grotesque: double-storey a, straight-tailed y, round dots
        sans: '"Figtree Variable", "Figtree", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
        display: '"Figtree Variable", "Figtree", ui-sans-serif, system-ui, -apple-system, sans-serif',
        mono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      // The published scale: 12/16, 14/18, 16/20, 18/24, 22/26, 26/30, 32/36, and 48 for display
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.375rem',
        '2xl': '1.625rem',
        '3xl': '2rem',
        '4xl': '3rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.18', normal: '1.375', relaxed: '1.5' },
      tracking: { tight: '-0.02em', normal: '0', wide: '0.04em' },
      body: { weight: '400' },
      heading: { weight: '600', tracking: '-0.02em' },
    },
    control: {
      height: {
        sm: 'calc(2.5rem * var(--m-density))',
        md: 'calc(3rem * var(--m-density))',
        lg: 'calc(3.5rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(1rem * var(--m-density))',
        md: 'calc(1.5rem * var(--m-density))',
        lg: 'calc(1.75rem * var(--m-density))',
      },
      fontSize: 'var(--m-font-size-md)',
    },
    radius: { sm: '8px', md: '12px', lg: '20px', control: '8px', container: '12px' },
    shadow: {
      // elevation 1: a 2% ring and a short drop (chips, image badges)
      sm: {
        light: '0 0 0 1px rgb(0 0 0 / 0.02), 0 2px 4px rgb(0 0 0 / 0.16)',
        dark: '0 0.5px 1px rgb(0 0 0 / 0.32), 0 1.25px 5px rgb(0 0 0 / 0.24), 0 2.75px 7px rgb(0 0 0 / 0.2)',
      },
      // elevation 3: the search bar and the floating room cards
      md: {
        light: '0 0 0 1px rgb(0 0 0 / 0.02), 0 8px 24px rgb(0 0 0 / 0.1)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.06), 0 2px 8px rgb(0 0 0 / 0.4), 0 6px 18px rgb(0 0 0 / 0.3)',
      },
      // the secondary elevation: the booking panel and menus
      lg: {
        light: '0 6px 16px rgb(0 0 0 / 0.12)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.06), 0 6px 16px rgb(0 0 0 / 0.5)',
      },
      // the high elevation: dialogs, toasts and the cookie sheet
      overlay: {
        light: '0 8px 28px rgb(0 0 0 / 0.28)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.08), 0 8px 28px rgb(0 0 0 / 0.6)',
      },
    },
    focus: { width: '2px', offset: '2px' },
    motion: {
      duration: { fast: '200ms', normal: '300ms', slow: '450ms' },
      easing: { standard: 'cubic-bezier(0.2, 0, 0, 1)', emphasized: 'cubic-bezier(0.1, 0.9, 0.2, 1)' },
    },
  },
  components: {
    // A 1120px (70rem) column for place, reading and account pages; browse grids and the footer run to 90rem, with 24–80px gutters
    layout: {
      containerMax: { sm: '35rem', md: '50rem', lg: '70rem' },
      containerPadding: 'clamp(1.5rem, 5vw, 5rem)',
      gridGap: 'var(--m-space-6)',
      gridMin: '15rem',
      splitSide: '20rem',
    },
    // 48px buttons at 500 with 12px corners: the coral action, a grey fill for the rest, ink text for
    // quiet ones
    button: {
      radius: '12px',
      fontSize: 'var(--m-font-size-md)',
      fontWeight: 'var(--m-font-weight-medium)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      activeTransform: 'scale(0.96)',
      gap: 'var(--m-space-2)',
      secondary: {
        bg: fill,
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        hoverBg: fillHover,
        activeBg: fillActive,
      },
      ghost: { fg: 'var(--m-color-fg-default)', hoverBg: quietHover, activeBg: fill },
      danger: {
        bg: { light: '#c13515', dark: '#e74d2e' },
        fg: { light: '#ffffff', dark: '#111111' },
        border: { light: '#c13515', dark: '#e74d2e' },
        hoverBg: { light: '#a3150f', dark: '#f76b4f' },
        activeBg: { light: '#772320', dark: '#e74d2e' },
      },
    },
    // Inputs: 56px boxes with 8px corners and a grey border that turns ink on hover; focus is an
    // ink ring
    input: {
      bg: 'var(--m-color-bg-surface)',
      fontSize: 'var(--m-font-size-md)',
      hoverBorder: 'var(--m-color-fg-default)',
      focusBorder: 'var(--m-color-fg-default)',
      invalidBorder: { light: '#c13515', dark: '#e74d2e' },
      disabledBg: { light: '#f2f2f2', dark: '#2c2c2c' },
      radius: '8px',
      height: {
        sm: 'calc(2.5rem * var(--m-density))',
        md: 'calc(3.5rem * var(--m-density))',
        lg: 'calc(4rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(0.75rem * var(--m-density))',
        lg: 'calc(1rem * var(--m-density))',
      },
      paddingY: '0.875rem',
    },
    select: {
      bg: 'var(--m-color-bg-surface)',
      fontSize: 'var(--m-font-size-md)',
      hoverBorder: 'var(--m-color-fg-default)',
      focusBorder: 'var(--m-color-fg-default)',
      invalidBorder: { light: '#c13515', dark: '#e74d2e' },
      disabledBg: { light: '#f2f2f2', dark: '#2c2c2c' },
      radius: '8px',
      height: {
        sm: 'calc(2.5rem * var(--m-density))',
        md: 'calc(3.5rem * var(--m-density))',
        lg: 'calc(4rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(0.75rem * var(--m-density))',
        lg: 'calc(1rem * var(--m-density))',
      },
    },
    // Labels in ink at 14/500; help in grey; errors in burnt red at 12px with an icon
    field: {
      gap: 'var(--m-space-2)',
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-medium)',
      hintFg: 'var(--m-color-fg-muted)',
      hintFontSize: 'var(--m-font-size-xs)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    // 24px boxes with 4px corners; ink when checked, not coral
    checkbox: {
      size: '1.5rem',
      radius: '4px',
      hoverBorder: 'var(--m-color-fg-default)',
      checkedBg: 'var(--m-color-fg-default)',
      checkedBorder: 'var(--m-color-fg-default)',
      mark: 'var(--m-color-bg-surface)',
    },
    radio: {
      size: '1.5rem',
      hoverBorder: 'var(--m-color-fg-default)',
      // Checked is an ink disc with a white centre
      checkedBg: 'var(--m-color-fg-default)',
      checkedBorder: 'var(--m-color-fg-default)',
      dot: 'var(--m-color-bg-surface)',
    },
    // The switch: a grey track that turns ink when on, a white knob with a soft ring
    switch: {
      width: '3rem',
      height: '2rem',
      trackBg: { light: '#8c8c8c', dark: '#6c6c6c' },
      trackCheckedBg: 'var(--m-color-fg-default)',
      thumbBg: '#ffffff',
      thumbCheckedBg: { light: '#ffffff', dark: '#111111' },
      thumbInset: '2px',
      thumbShadow: '0 0 0 1px rgb(0 0 0 / 0.04), 0 2px 4px rgb(0 0 0 / 0.18)',
      border: 'transparent',
    },
    // The panel card (booking, help): 12px corners, a hairline and the secondary elevation. Photo
    // cards are frameless (outline variant on the page bg, see the recipes)
    card: {
      border: 'var(--m-color-border-default)',
      shadow: 'var(--m-shadow-lg)',
      hoverShadow: 'var(--m-shadow-overlay)',
      hoverBorder: 'var(--m-color-border-default)',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-6)', lg: 'var(--m-space-8)' },
      titleFamily: 'var(--m-font-family-sans)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-semibold)',
      descriptionSize: 'var(--m-font-size-sm)',
      outline: { bg: 'var(--m-color-bg-surface)', border: 'var(--m-color-border-default)' },
      sunken: { bg: { light: '#f7f7f7', dark: '#191919' }, border: 'transparent' },
    },
    // Tables are hairline rows with no frame and an ink header row at 14/500
    table: {
      fontSize: 'var(--m-font-size-sm)',
      cellPaddingX: 'var(--m-space-3)',
      cellPaddingY: 'var(--m-space-4)',
      headerBg: 'var(--m-color-bg-surface)',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-medium)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      rowHoverBg: quietHover,
      stripeBg: quietHover,
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    // The account column: 16px items, the current one on the quiet grey with 12px corners
    sidebar: {
      bg: 'var(--m-color-bg-canvas)',
      border: 'var(--m-color-border-default)',
      fontSize: 'var(--m-font-size-md)',
      padding: 'var(--m-space-6)',
      itemGap: '2px',
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: quietHover,
        activeFg: 'var(--m-color-fg-default)',
        activeBg: fill,
        activeWeight: 'var(--m-font-weight-medium)',
        radius: '12px',
        paddingX: 'var(--m-space-4)',
        paddingY: 'calc(0.75rem * var(--m-density))',
      },
      heading: {
        fg: 'var(--m-color-fg-default)',
        size: 'var(--m-font-size-lg)',
        weight: 'var(--m-font-weight-semibold)',
        transform: 'none',
        tracking: '0',
      },
      count: { bg: 'var(--m-color-brand-default)', fg: 'var(--m-color-brand-fg)', radius: '9999px' },
    },
    // The header: white, 80px, no edge until scrolled; links are ink 14/500 on a pill hover
    navbar: {
      height: '5rem',
      paddingX: 'clamp(1.5rem, 4vw, 3rem)',
      border: 'var(--m-color-border-muted)',
      shadow: 'none',
      brandFamily: 'var(--m-font-family-display)',
      brandWeight: '700',
      brandSize: 'var(--m-font-size-xl)',
      link: {
        height: '2.5rem',
        radius: '9999px',
        paddingX: '0.75rem',
        fontSize: 'var(--m-font-size-sm)',
        fontWeight: 'var(--m-font-weight-medium)',
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: quietHover,
        activeFg: 'var(--m-color-fg-default)',
        activeBg: quietHover,
      },
    },
    // Tabs: 14/500 grey, the current one ink with a 2px ink bar; the segmented control is a grey
    // pill track with a white knob
    tabs: {
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-fg-default)',
      indicatorWidth: '2px',
      listBorder: 'var(--m-color-border-default)',
      height: '2.75rem',
      pill: {
        listBg: fill,
        listRadius: '9999px',
        listPadding: '4px',
        radius: '9999px',
        activeBg: { light: '#ffffff', dark: '#515151' },
        activeShadow: '0 0 0 1px rgb(0 0 0 / 0.04), 0 2px 4px rgb(0 0 0 / 0.12)',
      },
    },
    // Page numbers: round, ink text, the current one an ink disc
    pagination: {
      size: '2rem',
      radius: '9999px',
      border: 'transparent',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-default)',
      hoverBg: quietHover,
      currentBg: 'var(--m-color-bg-inverse)',
      currentFg: 'var(--m-color-fg-inverse)',
      currentBorder: 'transparent',
    },
    breadcrumb: {
      separator: '"›"',
      fontSize: 'var(--m-font-size-sm)',
      fg: 'var(--m-color-fg-default)',
      hoverFg: 'var(--m-color-fg-default)',
      currentFg: 'var(--m-color-fg-muted)',
    },
    // Badges are white pills on photos and light chips elsewhere, 12–14px at 600
    badge: {
      height: '1.625rem',
      paddingX: '0.625rem',
      radius: '9999px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-semibold)',
      textTransform: 'none',
      tracking: '0',
      neutral: {
        bg: { light: '#ffffff', dark: '#222222' },
        fg: 'var(--m-color-fg-default)',
        border: 'var(--m-color-border-default)',
        solidBg: 'var(--m-color-bg-inverse)',
        solidFg: 'var(--m-color-fg-inverse)',
      },
    },
    // Initials on the coral-tinted avatar scheme
    avatar: {
      size: { sm: '2rem', md: '3rem', lg: '4rem' },
      bg: { light: '#fee5e7', dark: '#361a21' },
      fg: { light: '#a21039', dark: '#ffabb6' },
      fontWeight: 'var(--m-font-weight-semibold)',
    },
    // Notices: the tone's pale wash with no border, 12px corners, ink title
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '12px',
      padding: 'var(--m-space-4)',
      gap: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // Toasts: an ink chip with white text, 12px corners, bottom left
    toast: {
      bg: 'var(--m-color-bg-inverse)',
      fg: 'var(--m-color-fg-inverse)',
      bodyFg: { light: '#c1c1c1', dark: '#515151' },
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '12px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-4)',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // Dialogs: white sheets with 32px corners on a 40% black scrim; the title centred at 16/600 in
    // the full sheet, 22px in a confirm
    dialog: {
      border: 'transparent',
      radius: '32px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-6)',
      titleFamily: 'var(--m-font-family-sans)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-semibold)',
      descriptionFg: 'var(--m-color-fg-muted)',
    },
    // Menus: 12px corners on the secondary elevation, 14px rows with the quiet grey on hover
    popover: {
      border: 'transparent',
      radius: '12px',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-2)',
      item: {
        height: '2.75rem',
        paddingX: 'var(--m-space-4)',
        radius: '8px',
        fontSize: 'var(--m-font-size-sm)',
        hoverBg: quietHover,
        hoverFg: 'var(--m-color-fg-default)',
        dangerFg: { light: '#c13515', dark: '#f76b4f' },
      },
    },
    // The tooltip: near-black with white 12px text, 8px corners
    tooltip: {
      bg: { light: '#111111', dark: '#f7f7f7' },
      fg: { light: '#ffffff', dark: '#111111' },
      radius: '8px',
      shadow: 'var(--m-shadow-lg)',
      paddingX: 'var(--m-space-3)',
      paddingY: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-medium)',
    },
    // Progress: an ink bar on the light grey track, round ends
    progress: {
      height: { sm: '0.25rem', md: '0.375rem', lg: '0.5rem' },
      radius: '9999px',
      track: { light: '#dddddd', dark: '#3f3f3f' },
      fill: 'var(--m-color-fg-default)',
    },
    accordion: {
      radius: '0',
      bg: 'transparent',
      paddingX: '0',
      paddingY: 'var(--m-space-6)',
      summarySize: 'var(--m-font-size-md)',
      summaryWeight: 'var(--m-font-weight-medium)',
      contentFg: 'var(--m-color-fg-muted)',
    },
    // The loading grey, with a slow sweep
    skeleton: {
      bg: { light: '#ebebeb', dark: '#222222' },
      highlight: { light: '#f7f7f7', dark: '#2c2c2c' },
      radius: '8px',
      blockRadius: '20px',
      duration: '1.3s',
    },
    spinner: { color: 'var(--m-color-fg-default)', duration: '0.8s' },
    kbd: { radius: '6px', shadow: 'none', fontWeight: 'var(--m-font-weight-medium)' },
    code: { radius: '12px', inlineRadius: '6px', inlineBg: fill, bg: { light: '#f7f7f7', dark: '#191919' } },
    // Links in body copy are ink and underlined, not coloured
    prose: {
      linkFg: 'var(--m-color-fg-default)',
      linkDecoration: 'underline',
      maxWidth: '40rem',
      headingFg: 'var(--m-color-fg-default)',
    },
    // Messages: the person's own in ink on the grey fill, the other side on white, 20px corners
    chat: {
      radius: '20px',
      userBg: fill,
      userFg: 'var(--m-color-fg-default)',
      userBorder: 'transparent',
      assistantBg: 'var(--m-color-bg-surface)',
      assistantBorder: 'var(--m-color-border-default)',
      avatarBg: { light: '#fee5e7', dark: '#361a21' },
      avatarFg: { light: '#a21039', dark: '#ffabb6' },
    },
    composer: { radius: '9999px', focusBorder: 'var(--m-color-fg-default)', shadow: 'var(--m-shadow-md)' },
    citation: { chipBg: fill, chipFg: 'var(--m-color-fg-default)', chipRadius: '9999px' },
    toolCall: { radius: '12px', statusRadius: '9999px' },
    usage: { radius: '9999px', okFill: 'var(--m-color-fg-default)', track: { light: '#dddddd', dark: '#2c2c2c' } },
  },
});
