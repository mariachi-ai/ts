import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Reel: a dark, content-first diary for things people watch. A slate blue-grey canvas where every
 * grey leans blue, posters in tight grids with a faint inner frame, a green for the main action and
 * for "done", orange for likes and blue for collections, star ratings, small tracked uppercase
 * section headings over a hairline, serif titles and serif reading text beside a neutral grotesque,
 * and dense, quiet metadata. Category: content-first. The values are the reference's published CSS
 * variables (read from a public extraction) and colours measured off screenshots of the live site
 * and apps; light mode is built from the same ramp (see DESIGN.md).
 */

// The published slate ramp: every grey sits on the same cool blue
const slate = {
  canvas: '#14181c',
  well: '#12161a',
  surface: '#202830',
  panel: '#2c3440',
  raised: '#445566',
  mid: '#556677',
  meta: '#667788',
  metaHi: '#778899',
  medium: '#8899aa',
  body: '#99aabb',
  ice: '#ccddee',
  hi: '#d8e0e8',
};
// The action green. The published fill (#00ac1c) carries white text at 3.0:1, so the fill steps
// down the same hue to the nearest pass; hover and press go one step darker still
const green = '#008a17';
const greenHover = '#007d15';
const greenPress = '#007012';
// The signature greens, oranges and blues: rating stars and "watched", likes, lists and the top tier
const brandGreen = '#00e054';
const orange = '#ff8000';
const blue = '#40bcf4';

export const reel = extendTheme(minimal, {
  name: 'reel',
  label: 'Reel',
  description:
    'Slate and posters: a cool blue-grey dark canvas, tight poster grids, a green for the main action, orange likes, blue lists, star ratings, tracked uppercase headings and serif titles.',
  tokens: {
    color: {
      bg: {
        // The page (#14181c); light is ours, from the same ramp
        canvas: { light: '#ffffff', dark: slate.canvas },
        // --poster-inset-background: chips, wells, quiet cards (the chips' #283038 is a step lighter)
        surface: { light: '#eef2f6', dark: slate.surface },
        // Panels: plan columns, inputs, the profile bar, menus' parent panels
        raised: { light: '#ffffff', dark: slate.panel },
        // The poster well, one stop below the page
        sunken: { light: '#e2e8ee', dark: slate.well },
        overlay: { light: 'rgb(20 24 28 / 0.6)', dark: 'rgb(10 12 14 / 0.8)' },
        // The pale ice of dialog inputs and the light dropdown
        inverse: { light: '#2c3440', dark: '#ddeeff' },
      },
      fg: {
        // --panel-content-high-contrast: names, titles, control labels
        default: { light: '#14181c', dark: slate.hi },
        // --theme-body-content-color: the body ink of every paragraph
        muted: { light: '#445566', dark: slate.body },
        // Metadata: the published #667788 is 3.9:1 on the page, so the next step up, #8899aa
        subtle: { light: '#556677', dark: slate.medium },
        inverse: { light: '#ffffff', dark: slate.canvas },
      },
      border: {
        // The hairline under section headings and tab rows
        default: { light: '#ccd5de', dark: slate.raised },
        // --panel-divider: rules between rows
        muted: { light: '#e2e8ee', dark: slate.panel },
        // Control edges, at the nearest 3:1 step of the ramp
        strong: { light: '#778899', dark: slate.metaHi },
        // --link-interaction-active-color: the 2px blue focus outline
        focus: { light: '#1d8ed0', dark: '#209ce4' },
      },
      accent: {
        default: { light: green, dark: green },
        hover: { light: greenHover, dark: greenHover },
        active: { light: greenPress, dark: greenPress },
        subtle: { light: '#ddf5e3', dark: '#10301c' },
        fg: '#ffffff',
        // Links: --theme-body-link-content-color, the pale ice; light is ours, the list blue
        text: { light: '#0b6aa3', dark: '#ddeeff' },
      },
      // The bright green of stars and "watched": glyphs and the brand mark, dark text on it
      brand: {
        default: { light: brandGreen, dark: brandGreen },
        fg: { light: slate.canvas, dark: slate.canvas },
        subtle: { light: '#ddf5e3', dark: '#10301c' },
      },
      success: {
        bg: { light: '#ddf5e3', dark: '#10301c' },
        fg: { light: '#006e12', dark: brandGreen },
        border: { light: '#00ac1c', dark: '#00ac1c' },
        solid: { light: '#00c030', dark: '#00c030' },
        onSolid: slate.canvas,
      },
      // The like and upgrade orange
      warning: {
        bg: { light: '#fff0e0', dark: '#3a2412' },
        fg: { light: '#a34f00', dark: '#ff9933' },
        border: { light: '#ee7000', dark: '#ee7000' },
        solid: { light: '#ee7000', dark: '#ee7000' },
        onSolid: slate.canvas,
      },
      // The published destructive ladder
      danger: {
        bg: { light: '#fde8e6', dark: '#3a1714' },
        fg: { light: '#c40f00', dark: '#ff7a6b' },
        border: { light: '#ec1200', dark: '#ec1200' },
        solid: { light: '#c40f00', dark: '#c40f00' },
        onSolid: '#ffffff',
      },
      // The list and top-tier blue
      info: {
        bg: { light: '#e2f4fd', dark: '#0f2c3c' },
        fg: { light: '#0b6aa3', dark: blue },
        border: { light: '#209ce4', dark: '#209ce4' },
        solid: { light: '#209ce4', dark: '#209ce4' },
        onSolid: slate.canvas,
      },
      selection: {
        bg: { light: '#ccddee', dark: slate.raised },
        fg: { light: '#14181c', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // The reference's grotesque is proprietary; Hanken Grotesk is the closest open cut
        sans: '"Hanken Grotesk Variable", "Hanken Grotesk", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        // Its headline and text serifs are proprietary; Newsreader (with optical sizes) stands in for both
        serif: '"Newsreader Variable", "Newsreader", Georgia, "Times New Roman", serif',
        display: '"Newsreader Variable", "Newsreader", Georgia, "Times New Roman", serif',
        mono: '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      // 11 section caps, 12 metadata, 13 body, 15 reading and bold body, 18 the big action,
      // 24 light display, 28 page titles, 36 the film title
      size: {
        xs: '0.6875rem',
        sm: '0.75rem',
        md: '0.8125rem',
        lg: '0.9375rem',
        xl: '1.125rem',
        '2xl': '1.5rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.25', normal: '1.5', relaxed: '1.667' },
      // Uppercase nav, buttons and section caps run about 1px wide
      tracking: { tight: '-0.005em', normal: '0', wide: '0.075em' },
      body: { weight: '400' },
      heading: { weight: '700', tracking: '0' },
    },
    // A 5px rhythm: 5, 10, 15, 20 are the published gaps
    space: { unit: '0.3125rem' },
    control: {
      height: {
        sm: 'calc(1.625rem * var(--m-density))',
        md: 'calc(1.875rem * var(--m-density))',
        lg: 'calc(2.625rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.625rem * var(--m-density))',
        md: 'calc(0.75rem * var(--m-density))',
        lg: 'calc(1.5rem * var(--m-density))',
      },
      fontSize: '0.75rem',
    },
    // 2px poster tags, 3px controls, 4px posters and panels
    radius: { sm: '2px', md: '3px', lg: '4px', control: '3px', container: '4px' },
    shadow: {
      sm: { light: '0 1px 2px rgb(20 24 28 / 0.12)', dark: '0 1px 2px rgb(0 0 0 / 0.25)' },
      // Posters and cards: the control shadow, black at 25%
      md: { light: '0 2px 6px rgb(20 24 28 / 0.14)', dark: '0 2px 6px rgb(0 0 0 / 0.25)' },
      lg: { light: '0 6px 16px rgb(20 24 28 / 0.16)', dark: '0 6px 16px rgb(0 0 0 / 0.4)' },
      overlay: { light: '0 10px 30px rgb(20 24 28 / 0.25)', dark: '0 10px 30px rgb(0 0 0 / 0.55)' },
    },
    focus: { width: '2px', offset: '1px' },
    motion: {
      // 0.15s dropdowns, 0.33s in, 0.5s out; ease-out-expo, and ease-out-back for pop-ins
      duration: { fast: '150ms', normal: '330ms', slow: '500ms' },
      easing: { standard: 'cubic-bezier(0.19, 1, 0.22, 1)', emphasized: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
    },
  },
  components: {
    // A fixed 950px content column; 230px side columns (the poster and the action panel)
    layout: {
      containerMax: { sm: '30rem', md: '47.5rem', lg: '59.375rem' },
      containerPadding: 'var(--m-space-4)',
      gridGap: 'var(--m-space-2)',
      splitSide: '14.375rem',
      splitGap: 'var(--m-space-6)',
    },
    // Uppercase, bold, tracked labels on 3px boxes. Primary is the green with white text; secondary
    // is the mid slate with white text that lifts a step on hover; ghost is body-ink text
    button: {
      radius: '3px',
      fontWeight: 'var(--m-font-weight-bold)',
      textTransform: 'uppercase',
      tracking: 'var(--m-font-tracking-wide)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      hoverTransform: 'none',
      activeTransform: 'none',
      disabledOpacity: '0.4',
      primary: { bg: green, fg: '#ffffff', border: green, hoverBg: greenHover, activeBg: greenPress },
      secondary: {
        bg: { light: '#556677', dark: slate.mid },
        fg: '#ffffff',
        border: 'transparent',
        hoverBg: { light: '#4a5b6c', dark: slate.meta },
        activeBg: { light: '#445566', dark: '#5e6f80' },
      },
      ghost: { fg: 'var(--m-color-fg-muted)', hoverBg: 'var(--m-color-bg-surface)', activeBg: 'var(--m-color-bg-raised)' },
      danger: { border: 'transparent', hoverBg: '#ad0d00', activeBg: '#960b00' },
    },
    // Filled slate boxes with an inset shade; the edge is the nearest 3:1 step (see DESIGN.md)
    input: {
      bg: { light: '#eef2f6', dark: slate.panel },
      fg: 'var(--m-color-fg-default)',
      placeholder: { light: '#556677', dark: slate.body },
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: '#556677', dark: slate.body },
      focusBorder: 'var(--m-color-border-focus)',
      invalidBorder: 'var(--m-color-danger-border)',
      radius: '3px',
      shadow: { light: 'inset 0 1px 2px rgb(20 24 28 / 0.08)', dark: 'inset 0 1px 2px rgb(0 0 0 / 0.25)' },
      fontSize: 'var(--m-font-size-md)',
      paddingX: { sm: '0.5rem', md: '0.625rem', lg: '0.75rem' },
    },
    select: {
      bg: { light: '#eef2f6', dark: slate.panel },
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: '#556677', dark: slate.body },
      focusBorder: 'var(--m-color-border-focus)',
      invalidBorder: 'var(--m-color-danger-border)',
      radius: '3px',
      fontSize: 'var(--m-font-size-md)',
    },
    // Labels in the text colour at 13px, help in body ink
    field: {
      gap: 'var(--m-space-1)',
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: 'var(--m-font-size-md)',
      labelFontWeight: 'var(--m-font-weight-regular)',
      hintFg: 'var(--m-color-fg-muted)',
      hintFontSize: 'var(--m-font-size-sm)',
      requiredFg: 'var(--m-color-success-fg)',
      requiredMarker: '"•"',
    },
    // Slate boxes with a tick; checked in the green
    checkbox: {
      size: '1rem',
      radius: '2px',
      bg: { light: '#eef2f6', dark: slate.panel },
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: '#556677', dark: slate.body },
    },
    radio: { size: '1rem', bg: { light: '#eef2f6', dark: slate.panel }, border: 'var(--m-color-border-strong)' },
    // The app's toggle: a slate track, green when on, a white knob
    switch: {
      width: '2.75rem',
      height: '1.5rem',
      thumbInset: '2px',
      trackBg: { light: '#778899', dark: slate.metaHi },
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbShadow: '0 1px 2px rgb(0 0 0 / 0.3)',
      border: 'transparent',
    },
    // Panels: the slate panel, 4px corners, no border, no shadow, 15 by 20px inside
    card: {
      bg: 'var(--m-color-bg-raised)',
      border: 'transparent',
      shadow: 'none',
      hoverShadow: 'none',
      hoverBorder: 'transparent',
      hoverTransform: 'none',
      radius: '4px',
      padding: { sm: 'var(--m-space-2)', md: 'var(--m-space-3) var(--m-space-4)', lg: 'var(--m-space-5)' },
      titleFamily: 'var(--m-font-family-display)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-bold)',
      descriptionFg: 'var(--m-color-fg-muted)',
      descriptionSize: 'var(--m-font-size-md)',
      outline: { bg: 'transparent', border: 'var(--m-color-border-muted)' },
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    // The diary: tiny tracked uppercase headers in metadata grey on the poster well, hairline rows,
    // no outer frame
    table: {
      fontSize: 'var(--m-font-size-md)',
      fg: 'var(--m-color-fg-muted)',
      cellPaddingX: 'var(--m-space-2)',
      cellPaddingY: 'var(--m-space-2)',
      bg: 'transparent',
      headerBg: 'var(--m-color-bg-sunken)',
      headerFg: 'var(--m-color-fg-subtle)',
      headerFontSize: 'var(--m-font-size-xs)',
      headerFontWeight: 'var(--m-font-weight-regular)',
      headerTransform: 'uppercase',
      headerTracking: 'var(--m-font-tracking-wide)',
      borderColor: 'var(--m-color-border-muted)',
      rowHoverBg: { light: '#f4f7fa', dark: '#1a2026' },
      stripeBg: 'transparent',
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    // Side navigation: body-ink rows, the current one on the panel slate in the text colour; tracked
    // uppercase section caps
    sidebar: {
      width: '14.375rem',
      bg: 'transparent',
      border: 'transparent',
      padding: '0',
      itemGap: '1px',
      fontSize: 'var(--m-font-size-md)',
      link: {
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'var(--m-color-bg-raised)',
        activeWeight: 'var(--m-font-weight-semibold)',
        radius: '3px',
        paddingX: 'var(--m-space-2)',
        paddingY: 'var(--m-space-1)',
      },
      heading: {
        fg: 'var(--m-color-fg-muted)',
        size: 'var(--m-font-size-xs)',
        weight: 'var(--m-font-weight-regular)',
        transform: 'uppercase',
        tracking: 'var(--m-font-tracking-wide)',
      },
      count: { bg: { light: '#556677', dark: slate.raised }, fg: '#ffffff', radius: '2px' },
    },
    // The site header: the page colour, 72px, bold tracked uppercase links in the high-contrast ink
    navbar: {
      height: '4.5rem',
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      shadow: 'none',
      brandFamily: 'var(--m-font-family-sans)',
      brandWeight: '700',
      brandSize: 'var(--m-font-size-2xl)',
      link: {
        radius: '0',
        paddingX: 'var(--m-space-2)',
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-bold)',
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
      },
    },
    // Section tabs: tracked uppercase in green, the current one in the text colour over a 1px line
    // on the hairline row. The pill variant is the app's segmented control: a well with the
    // current segment on the raised slate
    tabs: {
      fontSize: 'var(--m-font-size-md)',
      fontWeight: 'var(--m-font-weight-regular)',
      textTransform: 'uppercase',
      fg: 'var(--m-color-success-fg)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-fg-default)',
      indicatorWidth: '1px',
      listBorder: 'var(--m-color-border-default)',
      paddingX: 'var(--m-space-1)',
      listGap: 'var(--m-space-3)',
      pill: {
        listBg: 'var(--m-color-bg-sunken)',
        listRadius: '4px',
        listPadding: '2px',
        radius: '3px',
        activeBg: { light: '#ccd5de', dark: slate.raised },
        activeShadow: 'none',
      },
    },
    pagination: {
      radius: '3px',
      border: 'transparent',
      fg: 'var(--m-color-fg-muted)',
      hoverBg: 'var(--m-color-bg-surface)',
      currentBg: 'var(--m-color-bg-raised)',
      currentFg: 'var(--m-color-fg-default)',
      currentBorder: 'transparent',
    },
    breadcrumb: {
      separator: '"›"',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      currentFg: 'var(--m-color-fg-default)',
    },
    // Tags: tiny tracked uppercase on 2px corners; the neutral one is the chip slate
    badge: {
      height: '1rem',
      paddingX: '0.25rem',
      radius: '2px',
      fontSize: '0.625rem',
      fontWeight: 'var(--m-font-weight-bold)',
      textTransform: 'uppercase',
      tracking: '0.05em',
      neutral: {
        bg: 'var(--m-color-bg-surface)',
        fg: 'var(--m-color-fg-muted)',
        border: 'transparent',
        solidBg: { light: '#556677', dark: slate.mid },
        solidFg: '#ffffff',
      },
    },
    // Round; initials on the raised slate before a picture loads, with a thin ring
    avatar: {
      size: { sm: '1.5rem', md: '2.5rem', lg: '6.25rem' },
      bg: { light: '#ccd5de', dark: slate.raised },
      fg: { light: '#14181c', dark: '#ffffff' },
      fontWeight: 'var(--m-font-weight-semibold)',
      border: { light: 'rgb(20 24 28 / 0.1)', dark: 'rgb(221 238 255 / 0.25)' },
      borderWidth: '1px',
    },
    // A message box: the tone's tint, 3px corners, no stripe
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '3px',
      padding: 'var(--m-space-2) var(--m-space-3)',
      gap: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // The flash message: the raised slate, white text, a 3px corner
    toast: {
      bg: { light: '#2c3440', dark: slate.raised },
      fg: '#ffffff',
      bodyFg: { light: '#ccddee', dark: '#ddeeff' },
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '3px',
      shadow: 'var(--m-shadow-overlay)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // The log dialog: the action-panel slate, 3px corners, serif titles, ice-blue text
    dialog: {
      bg: { light: '#ffffff', dark: slate.raised },
      fg: { light: '#14181c', dark: '#ffffff' },
      border: 'transparent',
      radius: '3px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-5)',
      width: { sm: '25rem', md: '35rem', lg: '50rem' },
      titleFamily: 'var(--m-font-family-display)',
      titleSize: 'var(--m-font-size-2xl)',
      titleWeight: 'var(--m-font-weight-bold)',
      descriptionFg: { light: '#445566', dark: slate.ice },
    },
    // Menus: the app's action-sheet slate (#445566) with white rows that deepen to the mid slate. The
    // web's light dropdown (#8899aa with white text, 2.7:1) can't pass, so the sheet treatment is used
    popover: {
      bg: { light: '#ffffff', dark: slate.raised },
      fg: { light: '#14181c', dark: '#ffffff' },
      border: 'transparent',
      radius: '3px',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-1) 0',
      item: {
        height: '1.875rem',
        paddingX: 'var(--m-space-3)',
        radius: '0',
        fontSize: 'var(--m-font-size-md)',
        fg: { light: '#14181c', dark: '#ffffff' },
        hoverBg: { light: '#e2e8ee', dark: slate.mid },
        hoverFg: { light: '#14181c', dark: '#ffffff' },
        dangerFg: { light: '#c40f00', dark: '#ffc2b8' },
      },
      labelFg: { light: '#445566', dark: slate.ice },
      shortcutFg: { light: '#445566', dark: slate.ice },
      separator: { light: '#e2e8ee', dark: slate.mid },
    },
    // A slate tip with white text
    tooltip: {
      bg: { light: '#2c3440', dark: slate.raised },
      fg: '#ffffff',
      radius: '3px',
      shadow: 'var(--m-shadow-md)',
      paddingX: 'var(--m-space-2)',
      paddingY: 'var(--m-space-1)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
    },
    progress: {
      height: { sm: '0.25rem', md: '0.375rem', lg: '0.5rem' },
      radius: '1px',
      track: { light: '#e2e8ee', dark: slate.panel },
      fill: 'var(--m-color-success-fg)',
    },
    accordion: {
      radius: '0',
      bg: 'transparent',
      border: 'var(--m-color-border-muted)',
      paddingX: '0',
      paddingY: 'var(--m-space-3)',
      hoverBg: 'transparent',
      summarySize: 'var(--m-font-size-lg)',
      summaryWeight: 'var(--m-font-weight-semibold)',
      contentFg: 'var(--m-color-fg-muted)',
    },
    skeleton: {
      bg: { light: '#e2e8ee', dark: '#202830' },
      highlight: { light: '#eef2f6', dark: slate.panel },
      radius: '2px',
      blockRadius: '4px',
      duration: '1.5s',
    },
    spinner: { color: 'var(--m-color-success-fg)', duration: '0.8s' },
    kbd: {
      radius: '2px',
      shadow: 'none',
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-default)',
      fontWeight: 'var(--m-font-weight-semibold)',
    },
    code: {
      radius: '3px',
      inlineRadius: '2px',
      inlineBg: 'var(--m-color-bg-surface)',
      bg: 'var(--m-color-bg-sunken)',
      border: 'var(--m-color-border-muted)',
    },
    // Reading text: the serif at 15px over 25px, links in the high-contrast ink, underlined on hover
    prose: {
      fg: 'var(--m-color-fg-muted)',
      fontSize: 'var(--m-font-size-lg)',
      lineHeight: 'var(--m-font-leading-relaxed)',
      headingFg: 'var(--m-color-fg-default)',
      strongFg: 'var(--m-color-fg-default)',
      linkFg: 'var(--m-color-fg-default)',
      linkDecoration: 'none',
      quoteFg: 'var(--m-color-fg-muted)',
      quoteBorder: 'var(--m-color-border-default)',
      hrColor: 'var(--m-color-border-default)',
      maxWidth: '40rem',
    },
    chat: {
      radius: '4px',
      userBg: 'var(--m-color-bg-raised)',
      userFg: 'var(--m-color-fg-default)',
      userBorder: 'transparent',
      assistantBg: 'transparent',
      assistantBorder: 'transparent',
    },
    composer: {
      radius: '4px',
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-strong)',
      focusBorder: 'var(--m-color-border-focus)',
    },
    citation: { chipBg: 'var(--m-color-bg-surface)', chipFg: 'var(--m-color-fg-muted)', chipRadius: '2px' },
    toolCall: { radius: '3px', statusRadius: '2px' },
    usage: { radius: '1px', track: { light: '#e2e8ee', dark: slate.panel } },
  },
});
