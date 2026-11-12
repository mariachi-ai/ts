import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Marquee: a dark-first, content-first screening room. A near-black canvas under a black top bar,
 * one signature red for the brand and the main action, big rounded hero billboards with a title,
 * a synopsis and white and grey pill buttons, horizontal rows of rounded poster cards that grow into
 * a preview on hover, outlined rating boxes and red progress bars, and plain light account and help
 * pages. Category: content-first. The values are the reference's published component tokens (read
 * from its public pages' stylesheets as data) and measurements of its public pages and of real
 * screenshots of its signed-in screens.
 */

// The red set: the published action surface, hovered and pressed steps; white text on all three
const red = '#e50914';
const redHover = '#c11119';
const redPress = '#99161d';
// The grey pill ("More info"): the published translucent grey (109 109 110 at 70%, then 40% on
// hover) flattened on the canvas; light uses the published 128 grey at 20–40% on white
const greyPill = { light: '#e5e5e5', dark: '#525252' };
const greyPillHover = { light: '#d9d9d9', dark: '#3a3a3a' };
const greyPillPress = { light: '#cccccc', dark: '#333333' };
// White at 10% on the canvas: hovered rows and menu items
const tint = { light: '#f0f0f0', dark: '#2b2b2b' };

export const marquee = extendTheme(minimal, {
  name: 'marquee',
  label: 'Marquee',
  description:
    'Dark-first and content-first: a near-black canvas, one signature red, rounded hero billboards with white and grey pills, rows of rounded posters that grow on hover, rating boxes, red progress bars and plain light account pages.',
  tokens: {
    color: {
      bg: {
        // The browse canvas; light is the account page's off-white
        canvas: { light: '#fafafa', dark: '#141414' },
        // Info panels, tiles and fields: white at 10% on the canvas (the landing tiles' #232323 is
        // the nearest step that keeps the red at 3:1); light is the account page's white cards
        surface: { light: '#ffffff', dark: '#232323' },
        // The title modal and the hover preview card
        raised: { light: '#ffffff', dark: '#181818' },
        // The top bar, the landing page and the TV canvas: black; light, the help centre's table
        // header grey
        sunken: { light: '#f5f5f1', dark: '#000000' },
        overlay: { light: 'rgb(0 0 0 / 0.5)', dark: 'rgb(0 0 0 / 0.7)' },
        // The white "Play" pill on dark; the help centre's black header on light
        inverse: { light: '#141414', dark: '#ffffff' },
      },
      fg: {
        // White on dark; the help centre's warm near-black on light
        default: { light: '#221f1f', dark: '#ffffff' },
        // White at 70% (every synopsis, description and footer line); light, the classic grey
        muted: { light: '#6d6d6e', dark: '#b9b9b9' },
        // White at 50%
        subtle: { light: '#707070', dark: '#8c8c8c' },
        inverse: { light: '#ffffff', dark: '#141414' },
      },
      border: {
        // Rules between episodes and inside panels; the account page's card edges in light
        default: { light: '#e5e5e5', dark: '#404040' },
        muted: { light: '#f0f0f0', dark: '#2b2b2b' },
        // The published field border (128 128 128), solid so it reads 3:1 on the panels
        strong: { light: '#808080', dark: '#808080' },
        // The published focus ring: white on dark; black on light
        focus: { light: '#141414', dark: '#ffffff' },
      },
      accent: {
        default: { light: red, dark: red },
        hover: { light: redHover, dark: redHover },
        active: { light: redPress, dark: redPress },
        subtle: { light: '#fde8e9', dark: '#3a1215' },
        fg: '#ffffff',
        // Red text: the hovered red on light (the help centre's #e50914 is under 4.5:1 on the tint);
        // a lighter red on dark, where the reference links in white
        text: { light: redHover, dark: '#ff6b6f' },
      },
      // The signature red itself: the mark, ranked and "new" tags, the hero glow
      brand: {
        default: { light: red, dark: red },
        fg: { light: '#ffffff', dark: '#ffffff' },
        subtle: { light: '#fde8e9', dark: '#3a1215' },
      },
      // The published success (#2bb871) and the green of the "for you" score
      success: {
        bg: { light: '#e3f6ec', dark: '#0f2a1b' },
        fg: { light: '#0b7a43', dark: '#46d369' },
        border: { light: '#2bb871', dark: '#2bb871' },
        solid: { light: '#2bb871', dark: '#2bb871' },
        onSolid: '#000000',
      },
      // The published warning (#d89d31)
      warning: {
        bg: { light: '#fdf3e1', dark: '#33260d' },
        fg: { light: '#8a5a00', dark: '#e8b04a' },
        border: { light: '#d89d31', dark: '#d89d31' },
        solid: { light: '#d89d31', dark: '#d89d31' },
        onSolid: '#000000',
      },
      // The published error (#eb3942) for rings and messages; the brand red for solid fills
      danger: {
        bg: { light: '#fde8e9', dark: '#3a1215' },
        fg: { light: redHover, dark: '#f26d74' },
        border: { light: '#eb3942', dark: '#eb3942' },
        solid: { light: red, dark: red },
        onSolid: '#ffffff',
      },
      // The account pages' link blue
      info: {
        bg: { light: '#e5f0fd', dark: '#0c2340' },
        fg: { light: '#0058b8', dark: '#6ba8ff' },
        border: { light: '#0071eb', dark: '#0071eb' },
        solid: { light: '#0071eb', dark: '#0071eb' },
        onSolid: '#ffffff',
      },
      selection: {
        bg: { light: '#fbd0d2', dark: '#7a0c12' },
        fg: { light: '#221f1f', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // The reference's own grotesque is proprietary; Instrument Sans is the closest open match
        sans: '"Instrument Sans Variable", "Instrument Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        display:
          '"Instrument Sans Variable", "Instrument Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", "Helvetica Neue", sans-serif',
        mono: '"Geist Mono Variable", "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      // 12, 14, 16, 18 (synopses), 20, 24 (row titles), 32 (section titles), 48 (page titles)
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '3rem',
      },
      // 400 text, 500 labels and buttons, 700 titles (the reference's 900 hero weight has no open
      // match at this width; 700 is the stand-in's heaviest)
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.2', normal: '1.5', relaxed: '1.6' },
      // Kicker labels ("TRAILER") are 13px bold caps tracked 2px
      tracking: { tight: '0', normal: '0', wide: '0.16em' },
      body: { weight: '400' },
      heading: { weight: '700', tracking: '0' },
    },
    control: {
      // The published button heights: 32, 40 and 48px
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(2.5rem * var(--m-density))',
        lg: 'calc(3rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(1rem * var(--m-density))',
        md: 'calc(1.5rem * var(--m-density))',
        lg: 'calc(2rem * var(--m-density))',
      },
      fontSize: '1rem',
    },
    // 4px fields, tags and menus (the published field radius); 8px account cards; 12px posters;
    // 16px panels and dialogs; buttons are pills
    radius: { sm: '4px', md: '8px', lg: '16px', control: '4px', container: '16px' },
    shadow: {
      sm: { light: '0 1px 2px rgb(0 0 0 / 0.06)', dark: '0 1px 2px rgb(0 0 0 / 0.4)' },
      // The help centre's card shadow; on dark, the preview card's black glow
      md: { light: '0 3px 10px rgb(0 0 0 / 0.125)', dark: '0 3px 10px rgb(0 0 0 / 0.75)' },
      lg: { light: '0 8px 24px rgb(0 0 0 / 0.15)', dark: '0 8px 24px rgb(0 0 0 / 0.6)' },
      overlay: {
        light: '0 3px 10px rgb(0 0 0 / 0.125), 0 16px 40px rgb(0 0 0 / 0.12)',
        dark: '0 3px 10px rgb(0 0 0 / 0.75), 0 16px 40px rgb(0 0 0 / 0.5)',
      },
    },
    motion: {
      // 200ms for row arrows and hovers, the published 250ms for buttons, slower for the card's grow
      duration: { fast: '200ms', normal: '250ms', slow: '400ms' },
      // The published hover curve, and its exit curve for things that leave
      easing: { standard: 'cubic-bezier(0.32, 0.94, 0.6, 1)', emphasized: 'cubic-bezier(0.32, 0.94, 0.6, 1)' },
    },
  },
  components: {
    // Browse runs edge to edge with 4% gutters; account pages a 58rem column beside a 15rem nav;
    // sign-up and profile forms 28rem
    layout: {
      containerMax: { sm: '28rem', md: '58rem', lg: '120rem' },
      containerPadding: 'clamp(1rem, 4vw, 3.75rem)',
      gridGap: 'var(--m-space-2)',
      splitSide: '15rem',
      splitGap: 'var(--m-space-12)',
    },
    // Pills, 500 weight. Primary is the red; secondary the grey pill; ghost text only; danger the red
    button: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-medium)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      hoverTransform: 'none',
      disabledOpacity: '0.4',
      primary: { bg: red, fg: '#ffffff', border: red, hoverBg: redHover, activeBg: redPress },
      secondary: {
        bg: greyPill,
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        hoverBg: greyPillHover,
        activeBg: greyPillPress,
      },
      ghost: { fg: 'var(--m-color-fg-default)', hoverBg: tint, activeBg: tint },
      danger: { border: 'transparent', hoverBg: redHover, activeBg: redPress },
    },
    // The published field: a dark translucent fill, a 1px grey border, 4px corners, 16px text, 16px in
    input: {
      bg: { light: '#ffffff', dark: '#161616' },
      placeholder: 'var(--m-color-fg-muted)',
      border: 'var(--m-color-border-strong)',
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-fg-default)',
      invalidBorder: 'var(--m-color-danger-border)',
      radius: '4px',
      fontSize: 'var(--m-font-size-md)',
      height: { sm: '2.5rem', md: '3rem', lg: '3.5rem' },
      paddingX: { sm: '0.75rem', md: '1rem', lg: '1rem' },
    },
    select: {
      bg: { light: '#ffffff', dark: '#161616' },
      border: 'var(--m-color-border-strong)',
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: 'var(--m-color-fg-default)',
      invalidBorder: 'var(--m-color-danger-border)',
      radius: '4px',
      fontSize: 'var(--m-font-size-md)',
      paddingX: { sm: '0.625rem', md: '0.625rem', lg: '1rem' },
    },
    // A 14px label above, 13px descriptions and messages 6px below (the published field spacing)
    field: {
      gap: '0.375rem',
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-medium)',
      hintFg: 'var(--m-color-fg-muted)',
      hintFontSize: '0.8125rem',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    // A grey square that fills with the text colour, ticked in the canvas colour
    checkbox: {
      size: '1.125rem',
      radius: '2px',
      borderWidth: '1px',
      hoverBorder: 'var(--m-color-fg-default)',
      checkedBg: 'var(--m-color-fg-default)',
      checkedBorder: 'var(--m-color-fg-default)',
      mark: 'var(--m-color-bg-canvas)',
    },
    radio: {
      size: '1.125rem',
      borderWidth: '1px',
      hoverBorder: 'var(--m-color-fg-default)',
      checkedBg: 'var(--m-color-fg-default)',
      checkedBorder: 'var(--m-color-fg-default)',
      dot: 'var(--m-color-bg-canvas)',
    },
    // The phone app's toggle: red when on, grey when off, a white knob
    switch: {
      width: '2.75rem',
      height: '1.5rem',
      thumbInset: '2px',
      trackBg: '#808080',
      trackCheckedBg: red,
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      border: 'transparent',
      thumbShadow: '0 1px 2px rgb(0 0 0 / 0.3)',
    },
    // Info panels: white at 10% with a faint edge, 16px corners, 24px in. Posters (12px) and the
    // preview card are drawn in the recipes; account pages set 8px corners
    card: {
      border: { light: '#ebebeb', dark: 'rgb(255 255 255 / 0.04)' },
      borderWidth: '1px',
      shadow: { light: '0 1px 2px rgb(0 0 0 / 0.06)', dark: 'none' },
      hoverShadow: 'var(--m-shadow-md)',
      hoverBorder: { light: '#ebebeb', dark: 'rgb(255 255 255 / 0.04)' },
      hoverTransform: 'none',
      radius: '16px',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-6)', lg: 'var(--m-space-8)' },
      titleFamily: 'var(--m-font-family-sans)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-bold)',
      descriptionFg: 'var(--m-color-fg-muted)',
      descriptionSize: 'var(--m-font-size-sm)',
      outline: { bg: 'transparent', border: 'var(--m-color-border-default)' },
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    // The help centre's table: a grey header in regular 16px, hairlines everywhere, 16px cells
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: 'var(--m-space-4)',
      cellPaddingY: 'var(--m-space-4)',
      headerBg: 'var(--m-color-bg-sunken)',
      headerFg: 'var(--m-color-fg-default)',
      headerFontSize: 'var(--m-font-size-md)',
      headerFontWeight: 'var(--m-font-weight-regular)',
      headerTransform: 'none',
      headerTracking: '0',
      borderColor: 'var(--m-color-border-default)',
      rowHoverBg: tint,
      stripeBg: 'transparent',
      wrapBorder: 'var(--m-color-border-default)',
      wrapRadius: '0',
    },
    // The account nav: a 24px outline icon and the label; the current one bold, no fill
    sidebar: {
      width: '15rem',
      bg: 'transparent',
      border: 'transparent',
      padding: '0',
      itemGap: 'var(--m-space-1)',
      fontSize: 'var(--m-font-size-md)',
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
        activeWeight: 'var(--m-font-weight-bold)',
        radius: '4px',
        paddingX: '0',
        paddingY: 'var(--m-space-2)',
      },
      heading: {
        fg: 'var(--m-color-fg-muted)',
        size: 'var(--m-font-size-sm)',
        weight: 'var(--m-font-weight-regular)',
        transform: 'none',
        tracking: '0',
      },
      count: { bg: red, fg: '#ffffff', radius: '9999px' },
    },
    // The top bar: black over the hero, 68px, 14px links in a light grey that dim on hover; the
    // current one white and bold (set in the page). Light: the help centre's white bar with a rule
    navbar: {
      height: '4.25rem',
      paddingX: 'clamp(1rem, 4vw, 3.75rem)',
      bg: { light: '#ffffff', dark: '#000000' },
      border: { light: '#e5e5e5', dark: 'transparent' },
      shadow: 'none',
      brandFamily: 'var(--m-font-family-display)',
      brandWeight: '700',
      brandSize: 'var(--m-font-size-xl)',
      link: {
        radius: '4px',
        paddingX: 'var(--m-space-2)',
        fontSize: 'var(--m-font-size-sm)',
        fontWeight: 'var(--m-font-weight-regular)',
        fg: { light: '#221f1f', dark: '#e5e5e5' },
        hoverFg: 'var(--m-color-fg-muted)',
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
      },
    },
    // Underline tabs: 16px labels in the muted grey, white when current over a red bar. Pill tabs:
    // the TV nav, the current one in a grey pill
    tabs: {
      fontSize: 'var(--m-font-size-md)',
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: red,
      indicatorWidth: '3px',
      listBorder: 'var(--m-color-border-default)',
      pill: {
        listBg: 'transparent',
        listRadius: '9999px',
        listPadding: '0px',
        radius: '9999px',
        activeBg: { light: '#e5e5e5', dark: '#333333' },
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
      separator: '"›"',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      currentFg: 'var(--m-color-fg-default)',
    },
    // The rating and quality boxes: an outlined box with 3px corners, the text colour inside; the
    // solid tones are the red "new" and ranked tags
    badge: {
      height: '1.25rem',
      paddingX: '0.375rem',
      radius: '3px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-medium)',
      textTransform: 'none',
      tracking: '0',
      neutral: {
        bg: 'var(--m-color-bg-canvas)',
        fg: 'var(--m-color-fg-default)',
        border: 'var(--m-color-border-strong)',
        solidBg: 'var(--m-color-bg-inverse)',
        solidFg: 'var(--m-color-fg-inverse)',
      },
    },
    // Profiles are rounded squares, not circles
    avatar: {
      size: { sm: '2rem', md: '2.5rem', lg: '4rem' },
      radius: '4px',
      bg: { light: '#0071eb', dark: '#0071eb' },
      fg: '#ffffff',
      fontWeight: 'var(--m-font-weight-bold)',
    },
    // Banners: the tone's tint, 4px corners, a 20px icon, a bold title, no border
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '4px',
      padding: 'var(--m-space-3) var(--m-space-4)',
      gap: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    // A dark grey snackbar with white text (near-black on light), 4px corners
    toast: {
      bg: { light: '#221f1f', dark: '#333333' },
      fg: '#ffffff',
      bodyFg: { light: '#e5e5e5', dark: '#e5e5e5' },
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '4px',
      shadow: 'var(--m-shadow-lg)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    // The title modal: #181818, 16px corners, a 70% black scrim, a black glow
    dialog: {
      bg: 'var(--m-color-bg-raised)',
      border: 'transparent',
      radius: '16px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-6) var(--m-space-8)',
      width: { sm: '28rem', md: '36rem', lg: '53rem' },
      titleFamily: 'var(--m-font-family-display)',
      titleSize: 'var(--m-font-size-2xl)',
      titleWeight: 'var(--m-font-weight-bold)',
      descriptionFg: 'var(--m-color-fg-muted)',
    },
    // The profile menu: black at 90% with a white-15% edge, 14px rows; white with a rule on light
    popover: {
      bg: { light: '#ffffff', dark: '#0f0f0f' },
      border: { light: '#e5e5e5', dark: '#3a3a3a' },
      radius: '4px',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-2)',
      item: {
        height: '2.25rem',
        paddingX: 'var(--m-space-3)',
        radius: '2px',
        fontSize: 'var(--m-font-size-sm)',
        hoverBg: tint,
        hoverFg: 'var(--m-color-fg-default)',
        dangerFg: 'var(--m-color-danger-fg)',
      },
      labelFg: 'var(--m-color-fg-muted)',
      separator: { light: '#e5e5e5', dark: '#3a3a3a' },
    },
    // The light grey label on the round card buttons: dark bold text, 4px corners
    tooltip: {
      bg: { light: '#221f1f', dark: '#e6e6e6' },
      fg: { light: '#ffffff', dark: '#141414' },
      radius: '4px',
      shadow: '0 2px 6px rgb(0 0 0 / 0.4)',
      paddingX: 'var(--m-space-3)',
      paddingY: 'var(--m-space-1)',
      fontSize: 'var(--m-font-size-md)',
      fontWeight: 'var(--m-font-weight-bold)',
    },
    // The "still watching" bar: red, square-ended, thin, on a near-black track (see notes)
    progress: {
      height: { sm: '0.1875rem', md: '0.25rem', lg: '0.375rem' },
      radius: '2px',
      track: { light: '#d1d1d1', dark: '#1a1a1a' },
      fill: red,
    },
    // The published accordion: grey headline bars 8px apart, 24px in, 18px regular text, square
    // corners (the library draws its chevron where the reference has a plus)
    accordion: {
      radius: '0',
      bg: 'var(--m-color-bg-surface)',
      border: { light: '#e5e5e5', dark: 'transparent' },
      paddingX: 'var(--m-space-6)',
      paddingY: 'var(--m-space-6)',
      hoverBg: { light: '#f5f5f5', dark: '#414141' },
      summarySize: 'var(--m-font-size-lg)',
      summaryWeight: 'var(--m-font-weight-regular)',
      contentFg: 'var(--m-color-fg-default)',
      separatedGap: 'var(--m-space-2)',
    },
    skeleton: {
      bg: { light: '#e5e5e5', dark: '#232323' },
      highlight: { light: '#f0f0f0', dark: '#2f2f2f' },
      radius: '4px',
      blockRadius: '12px',
      duration: '1.5s',
    },
    spinner: { color: red, duration: '1s' },
    kbd: {
      radius: '4px',
      shadow: 'none',
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-default)',
      fontWeight: 'var(--m-font-weight-medium)',
    },
    code: {
      radius: '8px',
      inlineRadius: '4px',
      inlineBg: 'var(--m-color-bg-surface)',
      bg: 'var(--m-color-bg-sunken)',
      border: 'var(--m-color-border-default)',
    },
    // Links in text are the text colour, underlined
    prose: { linkFg: 'var(--m-color-fg-default)', linkDecoration: 'underline', maxWidth: '42rem' },
    divider: { color: 'var(--m-color-border-default)' },
    // Chat (ours): the other side plain, your own on the panel grey with 16px corners
    chat: {
      radius: '16px',
      userBg: 'var(--m-color-bg-surface)',
      userFg: 'var(--m-color-fg-default)',
      userBorder: 'transparent',
      assistantBg: 'transparent',
      assistantBorder: 'transparent',
    },
    composer: {
      radius: '24px',
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-strong)',
      focusBorder: 'var(--m-color-fg-default)',
    },
    citation: { chipBg: 'var(--m-color-bg-surface)', chipFg: 'var(--m-color-fg-default)', chipRadius: '4px' },
    toolCall: { radius: '12px', statusRadius: '9999px' },
    usage: { radius: '2px', track: { light: '#d1d1d1', dark: '#1a1a1a' } },
  },
});
