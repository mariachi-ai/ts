import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Bazaar: a handmade marketplace. Warm ink on white and a faint warm canvas, a light serif for display
 * headings beside a plain sans, an orange brand mark, black pill buttons that swell a little on hover,
 * 2px outlined secondaries, 6px inputs with an inner shadow, 12px cards on hairlines, listing cards with
 * photos on top, black stars and green sale prices, and a quieter seller admin with a white side
 * column. Category: marketplace. The values are the reference's published web toolkit (read as data)
 * and its own product screenshots, measured (see DESIGN.md).
 */

// 7.5% and 15% of the ink over white: the toolkit's tertiary fill and its hover
const fill = { light: '#eeeeee', dark: '#2d2c29' };
const fillHover = { light: '#dedede', dark: '#3a3935' };
// The toolkit's flat grey (badges, striped rows, disabled inputs)
const gray = { light: '#eaeaea', dark: '#33322e' };
// The resting control border: 50% of the ink (the toolkit's hover border), stepped to pass 3:1
const control = { light: '#8c8c8c', dark: '#8a877f' };

export const bazaar = extendTheme(minimal, {
  name: 'bazaar',
  label: 'Bazaar',
  description:
    'Handmade marketplace: warm ink on white, a light serif for headings, an orange brand mark, black pill buttons, outlined secondaries, 12px cards and listing cards with black stars and green sale prices.',
  tokens: {
    color: {
      bg: {
        // The seller pages' warm canvas behind white cards; buyer pages sit on white surfaces
        canvas: { light: '#f9f8f4', dark: '#1b1a18' },
        surface: { light: '#ffffff', dark: '#242320' },
        raised: { light: '#ffffff', dark: '#2d2c29' },
        sunken: { light: '#f5f4f0', dark: '#151413' },
        // The toolkit's scrim: the ink at 65%
        overlay: { light: 'rgb(34 34 34 / 0.65)', dark: 'rgb(0 0 0 / 0.7)' },
        // Tooltips and the dark buttons are the ink
        inverse: { light: '#222222', dark: '#f2f0eb' },
      },
      fg: {
        default: { light: '#222222', dark: '#f2f0eb' },
        muted: { light: '#595959', dark: '#c4c1ba' },
        // The placeholder grey (#757575) stepped down to pass 4.5:1 on the warm canvas
        subtle: { light: '#6a6a6a', dark: '#a6a39c' },
        inverse: { light: '#ffffff', dark: '#222222' },
      },
      border: {
        // Hairlines: the ink at 15% and the toolkit's grey
        default: { light: '#dedede', dark: '#3d3b37' },
        muted: { light: '#eaeaea', dark: '#2f2e2b' },
        strong: control,
        // The toolkit's focus halo is the ink at 50% outside a 2px white gap
        focus: { light: '#8c8c8c', dark: '#a6a39c' },
      },
      accent: {
        // Every primary action is the ink: a black pill (white on dark, the toolkit's light variant)
        default: { light: '#222222', dark: '#ffffff' },
        hover: { light: '#222222', dark: '#f9f9f9' },
        active: { light: '#000000', dark: '#eaeaea' },
        // The toolkit's selected-row tint: the orange tint
        subtle: { light: '#f8ebe6', dark: '#3a2a22' },
        fg: { light: '#ffffff', dark: '#222222' },
        // Links are the ink, underlined
        text: { light: '#222222', dark: '#f2f0eb' },
      },
      // The orange is the brand: the wordmark, the search button, brand panels; never an action
      brand: {
        default: { light: '#f1641e', dark: '#f1641e' },
        fg: { light: '#222222', dark: '#222222' },
        // The cream tint ("beeswax tint") behind brand panels and banners
        subtle: { light: '#fdebd2', dark: '#3b2e1c' },
      },
      // Sale prices and "Free shipping": the listing page's green
      success: {
        bg: { light: '#e4f1e6', dark: '#13301c' },
        fg: { light: '#007634', dark: '#8fd19e' },
        border: { light: '#9ec063', dark: '#2d6a3a' },
        solid: { light: '#258635', dark: '#258635' },
        onSolid: '#ffffff',
      },
      // The beeswax family: the yellow "active" pill and cream notices
      warning: {
        bg: { light: '#fdebd2', dark: '#3a2c12' },
        fg: { light: '#8a5500', dark: '#fdd95c' },
        border: { light: '#faa129', dark: '#7a5a1c' },
        solid: { light: '#fdd95c', dark: '#fdd95c' },
        onSolid: '#222222',
      },
      // Errors and "low stock": brick
      danger: {
        bg: { light: '#fddcd8', dark: '#3d1419' },
        fg: { light: '#a61a2e', dark: '#fd9184' },
        border: { light: '#e5a4ab', dark: '#7a2a35' },
        solid: { light: '#a61a2e', dark: '#c4283d' },
        onSolid: '#ffffff',
      },
      // The denim family: info notices and the occasional blue link in fine print
      info: {
        bg: { light: '#d7e6f5', dark: '#1c2740' },
        fg: { light: '#2f466c', dark: '#b8cdf0' },
        border: { light: '#a9c3e6', dark: '#34507e' },
        solid: { light: '#4d6bc6', dark: '#4d6bc6' },
        onSolid: '#ffffff',
      },
      selection: {
        bg: { light: '#fdebd2', dark: '#5a3a1c' },
        fg: { light: '#222222', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // A plain neo-grotesque for everything that isn't a display heading; the original is proprietary
        sans: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        // A light, narrow text serif for display headings and big figures
        display: '"Newsreader", Charter, "Bitstream Charter", Cambria, Georgia, serif',
        serif: '"Newsreader", Charter, "Bitstream Charter", Cambria, Georgia, serif',
        mono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      // The toolkit's scale: caption 13, body 16, title 18 and 24, serif headings 24, 32, 44 and 52
      size: {
        xs: '0.75rem',
        sm: '0.8125rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.5rem',
        '2xl': '2rem',
        '3xl': '2.75rem',
        '4xl': '3.25rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.125', normal: '1.5', relaxed: '1.75' },
      tracking: { tight: '0', normal: '0', wide: '0.08em' },
      body: { weight: '400' },
      // Serif headings are light, with a touch of tracking (0.5px at 32px)
      heading: { weight: '300', tracking: '0.015em' },
    },
    // The toolkit spaces everything on a 6px grid
    space: { unit: '0.375rem' },
    control: {
      // 48px controls, 36px small ones
      height: {
        sm: 'calc(2.25rem * var(--m-density))',
        md: 'calc(3rem * var(--m-density))',
        lg: 'calc(3.75rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.9375rem * var(--m-density))',
        md: 'calc(1.125rem * var(--m-density))',
        lg: 'calc(1.5rem * var(--m-density))',
      },
      fontSize: '1rem',
    },
    // 6px inputs, 12px cards and menus, 18px large panels; buttons and chips are pills
    radius: { sm: '6px', md: '12px', lg: '18px', control: '6px', container: '12px' },
    borderWidth: { thick: '2px' },
    shadow: {
      // The select's resting shadow
      sm: { light: '0 1px 6px rgb(34 34 34 / 0.15)', dark: '0 0 0 1px rgb(255 255 255 / 0.06)' },
      // "Shadow 01": hovered buttons and cards, menus
      md: {
        light: '0 4px 20px rgb(34 34 34 / 0.15)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.08), 0 4px 20px rgb(0 0 0 / 0.45)',
      },
      lg: {
        light: '0 4px 20px rgb(34 34 34 / 0.2)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.08), 0 6px 24px rgb(0 0 0 / 0.5)',
      },
      // "Shadow 02": dialogs and popovers
      overlay: {
        light: '0 6px 36px rgb(34 34 34 / 0.325)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.1), 0 6px 36px rgb(0 0 0 / 0.6)',
      },
    },
    focus: { width: '2px', offset: '2px' },
    motion: {
      duration: { fast: '150ms', normal: '200ms', slow: '300ms' },
      // The toolkit's springy button curve is the emphasised one
      easing: { standard: 'ease-out', emphasized: 'cubic-bezier(0.345, 0.115, 0.135, 1.42)' },
    },
  },
  components: {
    // Wide pages; a 280px white side column in the seller pages
    layout: {
      containerMax: { sm: '30rem', md: '48rem', lg: '75rem' },
      containerPadding: 'clamp(1rem, 3vw, 2.25rem)',
      gridGap: 'var(--m-space-3)',
      splitSide: '17.5rem',
    },
    // Pills at 700. Primary is a solid ink pill; secondary a 2px ink outline; ghost is transparent
    // and fills on hover. Hover swells the pill (1.5% wide, 3.5% tall) and lifts it on shadow 01
    button: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-bold)',
      borderWidth: '2px',
      shadow: 'none',
      hoverShadow: { light: '0 4px 20px rgb(34 34 34 / 0.15)', dark: '0 4px 20px rgb(0 0 0 / 0.45)' },
      activeShadow: 'none',
      hoverTransform: 'scale(1.015, 1.035)',
      activeTransform: 'none',
      disabledOpacity: '0.5',
      gap: 'var(--m-space-1)',
      primary: { border: 'var(--m-color-accent-default)' },
      secondary: {
        bg: 'transparent',
        fg: 'var(--m-color-fg-default)',
        border: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeBg: fill,
      },
      ghost: { bg: 'transparent', fg: 'var(--m-color-fg-default)', border: 'transparent', hoverBg: fill, activeBg: fillHover },
      danger: {
        bg: 'var(--m-color-danger-solid)',
        fg: '#ffffff',
        border: 'var(--m-color-danger-solid)',
        hoverBg: 'var(--m-color-danger-solid)',
        activeBg: { light: '#540d17', dark: '#a61a2e' },
      },
    },
    // Inputs: white, 6px, a 1px border, the toolkit's soft inner shadow; darker on hover, ink on focus
    input: {
      bg: 'var(--m-color-bg-surface)',
      border: control,
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-fg-default)',
      invalidBorder: 'var(--m-color-danger-fg)',
      disabledBg: gray,
      shadow: { light: 'inset 0 1px 4px rgb(34 34 34 / 0.1)', dark: 'inset 0 1px 4px rgb(0 0 0 / 0.4)' },
      paddingX: { sm: '0.75rem', md: '0.75rem', lg: '1rem' },
      paddingY: '0.625rem',
    },
    // Selects float a little: the toolkit puts a soft shadow under them
    select: {
      bg: 'var(--m-color-bg-surface)',
      border: control,
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-fg-default)',
      invalidBorder: 'var(--m-color-danger-fg)',
      disabledBg: gray,
      shadow: 'var(--m-shadow-sm)',
      paddingX: { sm: '0.75rem', md: '0.75rem', lg: '1rem' },
    },
    // Labels are 16px bold; hints 13px grey; errors brick at body size; a brick asterisk
    field: {
      gap: 'var(--m-space-1)',
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: 'var(--m-font-size-md)',
      labelFontWeight: 'var(--m-font-weight-bold)',
      hintFg: 'var(--m-color-fg-muted)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFg: 'var(--m-color-danger-fg)',
      errorFontWeight: 'var(--m-font-weight-regular)',
      requiredFg: 'var(--m-color-danger-fg)',
      requiredMarker: '" *"',
    },
    // Rounded squares with a 2px border; checked is a solid ink square with a white tick
    checkbox: {
      size: '1.5rem',
      radius: '6px',
      borderWidth: '2px',
      border: control,
      hoverBorder: 'var(--m-color-fg-muted)',
      checkedBg: 'var(--m-color-accent-default)',
      checkedBorder: 'var(--m-color-accent-default)',
      mark: 'var(--m-color-accent-fg)',
    },
    radio: {
      size: '1.5rem',
      borderWidth: '2px',
      border: control,
      hoverBorder: 'var(--m-color-fg-muted)',
      checkedBg: 'var(--m-color-accent-default)',
      checkedBorder: 'var(--m-color-accent-default)',
      dot: 'var(--m-color-accent-fg)',
    },
    // The toolkit's small switch: a 2px ink outline with an ink knob; on, it fills with ink and the
    // knob turns white. The reference's off track is white; it is the control grey here to pass 3:1
    switch: {
      // The seller pages' size (the toolkit's base switch is 84 × 48, its small one 63 × 36)
      width: '3rem',
      height: '1.75rem',
      smWidth: '2.5rem',
      smHeight: '1.5rem',
      radius: '9999px',
      borderWidth: '2px',
      border: 'var(--m-color-accent-default)',
      trackBg: control,
      trackCheckedBg: 'var(--m-color-accent-default)',
      thumbBg: 'var(--m-color-accent-default)',
      thumbCheckedBg: 'var(--m-color-accent-fg)',
      thumbInset: '3px',
      thumbShadow: 'none',
    },
    // White cards with 12px corners on a 15% hairline; hover lifts them on shadow 01
    card: {
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-default)',
      radius: '12px',
      shadow: 'none',
      hoverShadow: 'var(--m-shadow-md)',
      hoverBorder: 'var(--m-color-border-default)',
      hoverTransform: 'none',
      gap: 'var(--m-space-2)',
      padding: { sm: 'var(--m-space-3)', md: 'var(--m-space-4)', lg: 'var(--m-space-5)' },
      titleFamily: 'var(--m-font-family-sans)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-bold)',
      descriptionFg: 'var(--m-color-fg-muted)',
      outline: { bg: 'transparent', border: 'var(--m-color-border-default)' },
      sunken: { bg: 'var(--m-color-bg-canvas)', border: 'transparent' },
    },
    // Tables: no frame, 13px semibold sentence-case headers, rows on 15% hairlines, roomy cells
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: '0.75rem',
      cellPaddingY: '1rem',
      compactPaddingY: '0.5rem',
      borderColor: 'var(--m-color-border-default)',
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-default)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-semibold)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      rowHoverBg: 'var(--m-color-bg-sunken)',
      stripeBg: gray,
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    // The seller side column: white, a hairline on its right, 16px rows with filled-looking icons,
    // the current row on the toolkit's grey pill, counts in orange-dark circles
    sidebar: {
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-default)',
      fontSize: 'var(--m-font-size-md)',
      padding: 'var(--m-space-3)',
      sectionGap: 'var(--m-space-4)',
      itemGap: '0',
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: fill,
        activeFg: 'var(--m-color-fg-default)',
        activeBg: fill,
        activeWeight: 'var(--m-font-weight-bold)',
        radius: '9999px',
        paddingX: '0.75rem',
        paddingY: 'calc(0.4375rem * var(--m-density))',
        indicator: 'transparent',
        indicatorWidth: '0px',
      },
      heading: {
        fg: 'var(--m-color-fg-muted)',
        size: 'var(--m-font-size-sm)',
        weight: 'var(--m-font-weight-semibold)',
        transform: 'uppercase',
        tracking: '0.08em',
      },
      count: { bg: { light: '#cf4018', dark: '#cf4018' }, fg: '#ffffff', radius: '9999px' },
    },
    // The shop header: white, the wordmark in the serif, quiet text links that fill grey on hover
    navbar: {
      height: '4.5rem',
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-default)',
      shadow: 'none',
      brandFamily: 'var(--m-font-family-display)',
      brandWeight: '500',
      brandSize: '1.75rem',
      link: {
        radius: '9999px',
        paddingX: '0.75rem',
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-regular)',
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: fill,
        activeFg: 'var(--m-color-fg-default)',
        activeBg: fill,
      },
    },
    // Tabs: 16px, grey, a grey rule under the row; the current tab in ink with a 2px ink line.
    // Segmented chips are grey pills with the current one white
    tabs: {
      fontSize: 'var(--m-font-size-md)',
      fontWeight: 'var(--m-font-weight-regular)',
      // The listing editor's tabs: the line spans the label plus 12px each side
      paddingX: '0.75rem',
      listGap: '0.375rem',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-fg-default)',
      // The tab row scrolls sideways, which clips what hangs below it: a 3px line over a 1px rule
      // shows as the reference's 2px ink line on its grey rule
      indicatorWidth: '3px',
      listBorder: 'var(--m-color-border-default)',
      listBorderWidth: '1px',
      pill: {
        listBg: fill,
        listRadius: '9999px',
        listPadding: '4px',
        radius: '9999px',
        activeBg: 'var(--m-color-bg-surface)',
        activeShadow: '0 1px 6px rgb(34 34 34 / 0.15)',
      },
    },
    // Page numbers are 48px circles; the current one is solid ink
    pagination: {
      size: '3rem',
      radius: '9999px',
      border: 'transparent',
      fontWeight: 'var(--m-font-weight-regular)',
      fg: 'var(--m-color-fg-default)',
      hoverBg: fill,
      currentBg: 'var(--m-color-accent-default)',
      currentFg: 'var(--m-color-accent-fg)',
      currentBorder: 'transparent',
    },
    // Category trails: underlined ink links, a chevron between
    breadcrumb: {
      separator: '"›"',
      fg: 'var(--m-color-fg-default)',
      hoverFg: 'var(--m-color-fg-default)',
      currentFg: 'var(--m-color-fg-muted)',
      fontSize: 'var(--m-font-size-sm)',
    },
    // Badges are 13px pills at normal weight: grey, cream, green or yellow, never shouting
    badge: {
      height: '1.5625rem',
      paddingX: '0.5625rem',
      radius: '9999px',
      borderWidth: '0px',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
      textTransform: 'none',
      tracking: '0',
      neutral: {
        bg: gray,
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        solidBg: 'var(--m-color-accent-default)',
        solidFg: 'var(--m-color-accent-fg)',
      },
    },
    // Round avatars; without a photo, initials on the grey
    avatar: {
      radius: '9999px',
      bg: gray,
      fg: 'var(--m-color-fg-default)',
      fontWeight: 'var(--m-font-weight-bold)',
    },
    // Notices: a flat block in the tone, a faint border, 6px corners, 18px padding
    alert: {
      borderWidth: '1px',
      accentWidth: '0px',
      radius: '6px',
      padding: 'var(--m-space-3)',
      gap: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    // The floating notice: denim with white text, 6px corners, shadow 01
    toast: {
      bg: { light: '#2f466c', dark: '#2f466c' },
      fg: '#ffffff',
      bodyFg: { light: '#d7e6f5', dark: '#d7e6f5' },
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '6px',
      shadow: 'var(--m-shadow-md)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-bold)',
      width: '38.5rem',
    },
    // Overlays: 24px corners, 30px padding, shadow 02 over a 65% ink scrim, a light serif title
    dialog: {
      border: 'transparent',
      radius: '24px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-5)',
      gap: 'var(--m-space-4)',
      titleFamily: 'var(--m-font-family-display)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: '300',
      descriptionFg: 'var(--m-color-fg-muted)',
      width: { sm: '26.25rem', md: '36.25rem', lg: '46.25rem' },
    },
    // Menus: white, 12px, a hairline and shadow 01; full-bleed 16px rows that go grey
    popover: {
      border: 'var(--m-color-border-default)',
      radius: '12px',
      shadow: 'var(--m-shadow-md)',
      padding: '0',
      minWidth: '10rem',
      maxWidth: '18.75rem',
      item: {
        height: '3rem',
        paddingX: 'var(--m-space-3)',
        radius: '0',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: gray,
        hoverFg: 'var(--m-color-fg-default)',
      },
    },
    // Tooltips: an ink chip, 6px corners, 12px padding, 13px text
    tooltip: {
      radius: '6px',
      shadow: 'none',
      paddingX: '0.75rem',
      paddingY: '0.75rem',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
    },
    progress: {
      height: { sm: '0.375rem', md: '0.5rem', lg: '0.75rem' },
      radius: '9999px',
      track: gray,
      fill: 'var(--m-color-accent-default)',
    },
    // Item details and policies: open rows on hairlines, 18px semibold summaries
    accordion: {
      radius: '0',
      bg: 'transparent',
      border: 'var(--m-color-border-default)',
      paddingX: '0',
      paddingY: 'var(--m-space-3)',
      summarySize: 'var(--m-font-size-lg)',
      summaryWeight: 'var(--m-font-weight-semibold)',
      hoverBg: 'transparent',
      contentFg: 'var(--m-color-fg-default)',
    },
    // A slow sweep from 7.5% to 15% ink
    skeleton: { bg: fill, highlight: fillHover, radius: '6px', blockRadius: '12px', duration: '2s' },
    spinner: { color: 'var(--m-color-accent-default)', track: fillHover, thickness: '4px', duration: '1.2s' },
    kbd: { radius: '6px', shadow: 'none', fontWeight: 'var(--m-font-weight-regular)' },
    code: { radius: '12px', inlineRadius: '6px', inlineBg: gray, bg: 'var(--m-color-bg-sunken)' },
    divider: { color: 'var(--m-color-border-default)' },
    prose: {
      linkFg: 'var(--m-color-fg-default)',
      linkDecoration: 'underline',
      maxWidth: '42rem',
      lineHeight: '1.75',
      h2Border: 'transparent',
    },
    // Conversations with a shop: your messages on the deep denim, theirs on white with a hairline
    chat: {
      radius: '18px',
      userBg: { light: '#232347', dark: '#2f466c' },
      userFg: '#ffffff',
      userBorder: 'transparent',
      assistantBg: 'var(--m-color-bg-surface)',
      assistantBorder: 'var(--m-color-border-default)',
      avatarRadius: '9999px',
    },
    composer: { radius: '24px', focusBorder: 'var(--m-color-fg-default)' },
    citation: { chipBg: gray, chipFg: 'var(--m-color-fg-default)', chipRadius: '9999px' },
    toolCall: { radius: '12px', statusRadius: '9999px' },
    usage: { radius: '9999px', track: gray, okFill: { light: '#258635', dark: '#4caf5f' } },
  },
});
