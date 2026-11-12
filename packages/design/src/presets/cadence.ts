import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Cadence: a dark-first, content-first player. Near-black panels with 8px corners inside a black
 * frame, one bright green for play and for "on", white pills for the main call, bold heavy titles
 * set huge over a colour wash, cover art everywhere (token placeholders here), dense track lists with
 * no rules between rows, and buttons that grow a little on hover. Category: content-first. The
 * values are the reference's published theme and component stylesheet, read as data, and measured
 * off its public pages; light mode is built from the same system's published light palette.
 */

// The published tints: white at 10% (hover rows, chips) and the elevated grey of menus and tooltips
const tint = { light: '#ebebeb', dark: '#2a2a2a' };
const tintPress = { light: '#e0e0e0', dark: '#333333' };
const elevated = { light: '#ffffff', dark: '#282828' };
const menuHover = { light: '#f0f0f0', dark: '#3e3e3e' };
// The bright green set: the same in both modes, black text on it
const green = '#1ed760';
const greenHover = '#3be477';
const greenPress = '#1abc54';

export const cadence = extendTheme(minimal, {
  name: 'cadence',
  label: 'Cadence',
  description:
    'Dark-first and content-first: near-black 8px panels in a black frame, a bright green for play and on, white pills, huge bold titles, cover-art tiles and dense track lists.',
  tokens: {
    color: {
      bg: {
        // The main panel and the library panel (#121212); light is the published light base
        canvas: { light: '#ffffff', dark: '#121212' },
        // Highlighted boxes: promo cards, plan cards, the search field, hovered cards
        surface: { light: '#f5f5f5', dark: '#1f1f1f' },
        // Menus, tooltips, dialogs
        raised: elevated,
        // The app frame the panels sit in: black; in light, the published light frame's highlight
        // step, so grey fields and white panels both stand off it
        sunken: { light: '#e6e6e6', dark: '#000000' },
        overlay: { light: 'rgb(0 0 0 / 0.5)', dark: 'rgb(0 0 0 / 0.7)' },
        // The inverted set: the white "Log in" pill on dark, black on light
        inverse: { light: '#000000', dark: '#ffffff' },
      },
      fg: {
        default: { light: '#000000', dark: '#ffffff' },
        // text-subdued: every secondary line, column headers, inactive nav
        muted: { light: '#656565', dark: '#b3b3b3' },
        // The inverted-dark set's subdued grey; in light, the nearest passing step of the frame's grey
        subtle: { light: '#6a6a6a', dark: '#939393' },
        inverse: { light: '#ffffff', dark: '#000000' },
      },
      border: {
        // decorative-subdued: rules under column headers, dividers
        default: { light: '#dedede', dark: '#292929' },
        muted: { light: '#ebebeb', dark: '#1f1f1f' },
        // essential-subdued: input rings, outlined pills, checkbox and radio edges
        strong: { light: '#818181', dark: '#7c7c7c' },
        // essential-base: focus is the text colour
        focus: { light: '#000000', dark: '#ffffff' },
      },
      accent: {
        // The bright accent. In light mode the published essential green (#159542) carries rings,
        // checks and progress, since #1ed760 is 1.9:1 on white; buttons keep #1ed760 in both modes
        default: { light: '#159542', dark: green },
        hover: { light: '#1aa64b', dark: greenHover },
        active: { light: '#17a049', dark: greenPress },
        subtle: { light: '#c5f7d7', dark: '#073116' },
        fg: '#000000',
        text: { light: '#107434', dark: green },
      },
      // The signature green itself, on hero bands and the logo mark, black text on it
      brand: {
        default: { light: green, dark: green },
        fg: { light: '#000000', dark: '#000000' },
        subtle: { light: '#c5f7d7', dark: '#073116' },
      },
      // The published positive, warning, negative and announcement sets (subdued for the tint)
      success: {
        bg: { light: '#c5f7d7', dark: '#073116' },
        fg: { light: '#107434', dark: green },
        border: { light: '#159542', dark: greenPress },
        solid: { light: green, dark: green },
        onSolid: '#000000',
      },
      warning: {
        bg: { light: '#ffeab8', dark: '#491e00' },
        fg: { light: '#955500', dark: '#ffa42b' },
        border: { light: '#bf6d00', dark: '#ffa42b' },
        solid: { light: '#ffa42b', dark: '#ffa42b' },
        onSolid: '#000000',
      },
      danger: {
        bg: { light: '#ffe5e8', dark: '#590810' },
        fg: { light: '#c91123', dark: '#f3727f' },
        border: { light: '#e91429', dark: '#ed2c3f' },
        solid: { light: '#e91429', dark: '#e91429' },
        onSolid: '#ffffff',
      },
      info: {
        bg: { light: '#e0edfd', dark: '#052a56' },
        fg: { light: '#0b62c8', dark: '#539df5' },
        border: { light: '#0d72ea', dark: '#1278f2' },
        solid: { light: '#0d72ea', dark: '#0d72ea' },
        onSolid: '#ffffff',
      },
      selection: {
        bg: { light: '#c5f7d7', dark: '#0d5928' },
        fg: { light: '#000000', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // The reference's own geometric grotesque is proprietary; Figtree is the closest open match
        sans: '"Figtree Variable", "Figtree", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        display: '"Figtree Variable", "Figtree", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        mono: '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      // The published desktop text sizes: 12, 14, 16, 20, 24, 32, 48 and the 96px page title
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.25rem',
        xl: '1.5rem',
        '2xl': '2rem',
        '3xl': '3rem',
        '4xl': '6rem',
      },
      // 400 for text, 700 for titles, labels and buttons, 800 for the huge page titles
      weight: { regular: '400', medium: '500', semibold: '700', bold: '800' },
      leading: { tight: '1.15', normal: '1.375', relaxed: '1.5' },
      tracking: { tight: '-0.04em', normal: '0', wide: '0.1em' },
      body: { weight: '400' },
      heading: { weight: '700', tracking: '0' },
    },
    control: {
      // The published control sizes: 32, 48 and 56px
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(3rem * var(--m-density))',
        lg: 'calc(3.5rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(1rem * var(--m-density))',
        md: 'calc(2rem * var(--m-density))',
        lg: 'calc(2rem * var(--m-density))',
      },
      fontSize: '0.875rem',
    },
    // 4px rows, inputs, menus and small art; 6px cards and cover art; 8px panels and dialogs
    radius: { sm: '4px', md: '6px', lg: '8px', control: '4px', container: '8px' },
    shadow: {
      sm: { light: '0 2px 4px rgb(0 0 0 / 0.08)', dark: '0 2px 4px rgb(0 0 0 / 0.2)' },
      // The floating play button on a hovered card
      md: { light: '0 8px 8px rgb(0 0 0 / 0.12)', dark: '0 8px 8px rgb(0 0 0 / 0.3)' },
      // Big cover art and sticky headers
      lg: { light: '0 8px 24px rgb(0 0 0 / 0.15)', dark: '0 8px 24px rgb(0 0 0 / 0.5)' },
      // Context menus and tooltips
      overlay: {
        light: '0 16px 24px rgb(0 0 0 / 0.12), 0 6px 8px rgb(0 0 0 / 0.08), 0 0 0 1px rgb(0 0 0 / 0.06)',
        dark: '0 16px 24px rgb(0 0 0 / 0.3), 0 6px 8px rgb(0 0 0 / 0.2)',
      },
    },
    motion: {
      // shortest-3, short-1 and short-2 with the "productive" curve
      duration: { fast: '150ms', normal: '250ms', slow: '300ms' },
      easing: { standard: 'cubic-bezier(0.3, 0, 0, 1)', emphasized: 'cubic-bezier(0, 0, 0.2, 1)' },
    },
  },
  components: {
    // The main panel fills the window beside a ~21rem library panel; settings run in a 52rem column
    layout: {
      containerMax: { sm: '28rem', md: '52rem', lg: '90rem' },
      containerPadding: 'var(--m-space-6)',
      gridGap: 'var(--m-space-6)',
      splitSide: '21rem',
      splitGap: 'var(--m-space-2)',
    },
    // Pills in bold that grow 4% on hover. Primary is the green with black text; secondary is the
    // outlined pill (a 1px grey ring that turns white on hover); ghost is subdued text only
    button: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-semibold)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      hoverTransform: 'scale(1.04)',
      activeTransform: 'scale(1)',
      disabledOpacity: '0.3',
      primary: { bg: green, fg: '#000000', border: green, hoverBg: greenHover, activeBg: greenPress },
      secondary: {
        bg: 'transparent',
        fg: 'var(--m-color-fg-default)',
        border: 'var(--m-color-border-strong)',
        hoverBg: 'transparent',
        activeBg: 'transparent',
      },
      ghost: { fg: 'var(--m-color-fg-muted)', hoverBg: 'transparent', activeBg: 'transparent' },
      danger: { border: 'transparent', hoverBg: '#d81326', activeBg: '#a60e1d' },
    },
    // The form control: the panel colour with a 1px inset grey ring that turns to the text colour on
    // hover; 48px, 4px corners, 12px in
    input: {
      bg: 'var(--m-color-bg-canvas)',
      placeholder: 'var(--m-color-fg-muted)',
      border: 'var(--m-color-border-strong)',
      hoverBorder: 'var(--m-color-fg-default)',
      focusBorder: 'var(--m-color-fg-default)',
      invalidBorder: 'var(--m-color-danger-border)',
      radius: '4px',
      fontSize: 'var(--m-font-size-md)',
      paddingX: { sm: '0.75rem', md: '0.75rem', lg: '0.875rem' },
    },
    select: {
      bg: 'var(--m-color-bg-canvas)',
      border: 'var(--m-color-border-strong)',
      hoverBorder: 'var(--m-color-fg-default)',
      focusBorder: 'var(--m-color-fg-default)',
      invalidBorder: 'var(--m-color-danger-border)',
      radius: '4px',
      fontSize: 'var(--m-font-size-md)',
      paddingX: { sm: '0.75rem', md: '0.75rem', lg: '0.875rem' },
    },
    // The form group: a bold 14px label 8px above, subdued help, the negative red for errors
    field: {
      gap: 'var(--m-space-2)',
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-semibold)',
      hintFg: 'var(--m-color-fg-muted)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    // 16px, 3px corners, a grey edge that turns green on hover; green with a dark tick when on
    checkbox: { size: '1rem', radius: '3px', borderWidth: '1px', hoverBorder: 'var(--m-color-accent-default)' },
    radio: { size: '1rem', borderWidth: '1px', hoverBorder: 'var(--m-color-accent-default)' },
    // The settings toggle: 42 × 24, a 20px knob 2px in, green when on. Off is the essential-subdued
    // grey (the settings page's #535353 is 2.4:1 on the panel). On, the knob takes the panel colour,
    // as the published toggle draws it: a white knob on the green is 1.9:1
    switch: {
      width: '2.625rem',
      height: '1.5rem',
      thumbInset: '2px',
      trackBg: { light: '#818181', dark: '#7c7c7c' },
      thumbBg: '#ffffff',
      thumbCheckedBg: { light: '#ffffff', dark: '#121212' },
      thumbShadow: '0 2px 4px rgb(0 0 0 / 0.2)',
      border: 'transparent',
    },
    // Boxes: the highlight grey, 8px corners, no border, no shadow, 16 by 20px inside
    card: {
      border: 'transparent',
      shadow: 'none',
      hoverShadow: 'none',
      hoverBorder: 'transparent',
      hoverTransform: 'none',
      radius: '8px',
      padding: { sm: 'var(--m-space-3)', md: 'var(--m-space-4) var(--m-space-5)', lg: 'var(--m-space-6)' },
      titleFamily: 'var(--m-font-family-sans)',
      titleSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
      descriptionFg: 'var(--m-color-fg-muted)',
      descriptionSize: 'var(--m-font-size-sm)',
      outline: { bg: 'transparent', border: 'var(--m-color-border-default)' },
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    // The track list: no frame and no rules between rows (one rule under the header, drawn in the
    // recipes), 14px subdued headers in sentence case, 56px rows that light up white-10% on hover
    table: {
      fontSize: 'var(--m-font-size-sm)',
      fg: 'var(--m-color-fg-muted)',
      cellPaddingX: 'var(--m-space-2)',
      cellPaddingY: 'var(--m-space-2)',
      bg: 'transparent',
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-regular)',
      headerTransform: 'none',
      headerTracking: '0',
      borderColor: 'transparent',
      rowHoverBg: tint,
      stripeBg: 'transparent',
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    // The library panel: rows with art, 6px corners, the highlight grey on hover and the tint when
    // open; headings bold in the text colour
    sidebar: {
      width: '21rem',
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      padding: 'var(--m-space-2)',
      itemGap: '0',
      fontSize: 'var(--m-font-size-md)',
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'var(--m-color-bg-surface)',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: tint,
        activeWeight: 'var(--m-font-weight-regular)',
        radius: '6px',
        paddingX: 'var(--m-space-2)',
        paddingY: 'var(--m-space-2)',
      },
      heading: {
        fg: 'var(--m-color-fg-default)',
        size: 'var(--m-font-size-md)',
        weight: 'var(--m-font-weight-semibold)',
        transform: 'none',
        tracking: '0',
      },
      // "New" is the announcement blue
      count: { bg: '#0d72ea', fg: '#ffffff', radius: '9999px' },
    },
    // The site header: black (the frame grey in light), bold 16px links that brighten on hover
    navbar: {
      height: '4rem',
      bg: 'var(--m-color-bg-sunken)',
      border: 'transparent',
      shadow: 'none',
      brandFamily: 'var(--m-font-family-display)',
      brandWeight: '800',
      brandSize: 'var(--m-font-size-xl)',
      link: {
        radius: '9999px',
        paddingX: 'var(--m-space-2)',
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-semibold)',
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
      },
    },
    // Navigation tabs: subdued 14px bold, white when current over a 2px green line. The pill
    // variant is the filter chip row: tinted pills, the current one a step brighter
    tabs: {
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-semibold)',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-accent-default)',
      indicatorWidth: '2px',
      listBorder: 'transparent',
      pill: {
        listBg: 'transparent',
        listRadius: '9999px',
        listPadding: '0px',
        radius: '9999px',
        activeBg: tintPress,
        activeShadow: 'none',
      },
    },
    pagination: {
      radius: '9999px',
      border: 'transparent',
      fg: 'var(--m-color-fg-muted)',
      hoverBg: tint,
      currentBg: 'var(--m-color-bg-inverse)',
      currentFg: 'var(--m-color-fg-inverse)',
      currentBorder: 'transparent',
    },
    breadcrumb: {
      separator: '"•"',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      currentFg: 'var(--m-color-fg-default)',
    },
    // Tags: the tinted grey, 4px corners, 12px bold
    badge: {
      height: '1.25rem',
      paddingX: '0.375rem',
      radius: '4px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-semibold)',
      textTransform: 'none',
      tracking: '0',
      neutral: {
        bg: tint,
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        solidBg: 'var(--m-color-fg-muted)',
        solidFg: 'var(--m-color-bg-canvas)',
      },
    },
    // Round; initials on the mid grey the reference shows before a photo loads
    avatar: {
      size: { sm: '1.5rem', md: '2rem', lg: '3rem' },
      bg: { light: '#d9d9d9', dark: '#535353' },
      fg: { light: '#000000', dark: '#ffffff' },
      fontWeight: 'var(--m-font-weight-semibold)',
    },
    // The banner: a tinted panel in the tone's subdued set, 4px corners, a 16px icon, no border
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '4px',
      padding: 'var(--m-space-3)',
      gap: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // The snackbar: the announcement blue with white text, whatever the tone
    toast: {
      bg: '#0d72ea',
      fg: '#ffffff',
      bodyFg: '#ffffff',
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '8px',
      shadow: 'var(--m-shadow-overlay)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // Dialogs: the elevated grey, 8px corners, 70% black behind, 24px bold titles
    dialog: {
      bg: 'var(--m-color-bg-raised)',
      border: 'transparent',
      radius: '8px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-6)',
      width: { sm: '26rem', md: '32rem', lg: '37.5rem' },
      titleFamily: 'var(--m-font-family-display)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-semibold)',
      descriptionFg: 'var(--m-color-fg-muted)',
    },
    // The context menu: #282828, 4px corners, 4px in, 40px rows at 14px with 2px corners
    popover: {
      border: 'transparent',
      radius: '4px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-1)',
      item: {
        height: '2.5rem',
        paddingX: 'var(--m-space-3)',
        radius: '2px',
        fontSize: 'var(--m-font-size-sm)',
        hoverBg: menuHover,
        hoverFg: 'var(--m-color-fg-default)',
        dangerFg: 'var(--m-color-danger-fg)',
      },
      labelFg: 'var(--m-color-fg-muted)',
      separator: menuHover,
    },
    // The same grey, white 14px, 4px corners, 4 by 8px
    tooltip: {
      bg: 'var(--m-color-bg-raised)',
      fg: 'var(--m-color-fg-default)',
      radius: '4px',
      shadow: 'var(--m-shadow-overlay)',
      paddingX: 'var(--m-space-2)',
      paddingY: 'var(--m-space-1)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
    },
    // The 4px scrubber bar: green on white-30% (in light, a pale grey so the darker green reads 3:1)
    progress: {
      height: { sm: '0.25rem', md: '0.25rem', lg: '0.375rem' },
      radius: '9999px',
      track: { light: '#ebebeb', dark: '#4d4d4d' },
      fill: 'var(--m-color-accent-default)',
    },
    // Help topics: rows on the panel, a grey hairline between, 24px in, bold 16px summaries
    accordion: {
      radius: '8px',
      bg: 'transparent',
      border: 'var(--m-color-border-strong)',
      paddingX: 'var(--m-space-6)',
      paddingY: 'var(--m-space-6)',
      hoverBg: 'transparent',
      summarySize: 'var(--m-font-size-md)',
      summaryWeight: 'var(--m-font-weight-semibold)',
      contentFg: 'var(--m-color-fg-muted)',
    },
    skeleton: {
      bg: { light: '#ebebeb', dark: '#2a2a2a' },
      highlight: { light: '#f5f5f5', dark: '#333333' },
      radius: '4px',
      blockRadius: '6px',
      duration: '1.5s',
    },
    spinner: { color: 'var(--m-color-accent-default)', duration: '1s' },
    kbd: { radius: '4px', shadow: 'none', bg: tint, border: 'transparent', fontWeight: 'var(--m-font-weight-semibold)' },
    code: {
      radius: '8px',
      inlineRadius: '4px',
      inlineBg: tint,
      bg: 'var(--m-color-bg-surface)',
      border: 'transparent',
    },
    prose: { linkFg: 'var(--m-color-fg-default)', linkDecoration: 'underline', maxWidth: '42rem' },
    // Chat: the other side plain on the panel, your own on the highlight grey, 16px corners
    chat: {
      radius: '16px',
      userBg: 'var(--m-color-bg-surface)',
      userFg: 'var(--m-color-fg-default)',
      userBorder: 'transparent',
      assistantBg: 'transparent',
      assistantBorder: 'transparent',
    },
    // The search field: the highlight grey, fully round
    composer: {
      radius: '24px',
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-strong)',
      focusBorder: 'var(--m-color-fg-default)',
    },
    citation: { chipBg: tint, chipFg: 'var(--m-color-fg-default)', chipRadius: '9999px' },
    toolCall: { radius: '8px', statusRadius: '9999px' },
    usage: { radius: '9999px', track: { light: '#ebebeb', dark: '#4d4d4d' } },
  },
});
