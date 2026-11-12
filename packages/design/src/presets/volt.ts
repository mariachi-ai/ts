import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Volt: a loud, fast money app. Black on white and white on black, one electric green for the brand
 * and the moments that matter, black pill buttons with grey pill secondaries, white 20px cards on a
 * light grey screen, a tight neutral grotesk at regular weight for big headlines and bold for
 * amounts, and heavy-stroked line icons. Green is the action colour in dark mode. Category: bold
 * and fast. The values are measured off the reference's site, stylesheets and app screens (see
 * DESIGN.md).
 */

// The grey pill behind secondary actions and segmented choices, and its steps
const pill = { light: '#e8e8e8', dark: '#333333' };
const pillHover = { light: '#dedede', dark: '#3d3d3d' };
const pillActive = { light: '#d4d4d4', dark: '#474747' };
// A hover that still shows on the grey screen
const quiet = { light: '#e5e5e5', dark: '#262626' };
// The signature green: the brand, progress, counts and charts; the action fill in dark mode
const green = '#00e013';

export const volt = extendTheme(minimal, {
  name: 'volt',
  label: 'Volt',
  description:
    'Loud and fast: black and white with one electric green, black pill buttons, white 20px cards on light grey, big tight headlines and bold amounts.',
  tokens: {
    color: {
      bg: {
        // The app's screen is a light grey with white cards on it; dark mode is pure black
        canvas: { light: '#f0f0f0', dark: '#000000' },
        surface: { light: '#ffffff', dark: '#1a1a1a' },
        raised: { light: '#ffffff', dark: '#262626' },
        // Grey panels inside white cards ("Your benefits"); a lifted grey in dark
        sunken: { light: '#f0f0f0', dark: '#232323' },
        overlay: { light: 'rgb(0 0 0 / 0.4)', dark: 'rgb(0 0 0 / 0.7)' },
        inverse: { light: '#000000', dark: '#ffffff' },
      },
      fg: {
        default: { light: '#000000', dark: '#ffffff' },
        // The site's #5c5c5c; subtle is the reference's #737373 darkened to pass on the grey screen
        muted: { light: '#5c5c5c', dark: '#b3b3b3' },
        subtle: { light: '#6b6b6b', dark: '#999999' },
        inverse: { light: '#ffffff', dark: '#000000' },
      },
      border: {
        // The site's hairline
        default: { light: '#e5e5e5', dark: '#333333' },
        muted: { light: '#f0f0f0', dark: '#262626' },
        strong: { light: '#808080', dark: '#7a7a7a' },
        // A green focus ring, as the site's outline, at a step that passes on the grey screen
        focus: { light: '#128a00', dark: green },
      },
      accent: {
        // Inside the app the action is a black pill; in dark mode it is the green with black text
        default: { light: '#000000', dark: green },
        hover: { light: '#262626', dark: '#00ca11' },
        active: { light: '#3d3d3d', dark: '#00b30f' },
        subtle: pill,
        fg: { light: '#ffffff', dark: '#000000' },
        // Links: the site's link green (#128a00), one step darker to pass on the grey screen
        text: { light: '#0b7300', dark: green },
      },
      brand: {
        default: green,
        fg: '#000000',
        subtle: { light: '#dcfbe0', dark: '#0f2e13' },
      },
      // Money in and good news: the app's up-arrow green for text, the brand green as the fill
      success: {
        bg: { light: '#e3f9e5', dark: '#0f2e13' },
        fg: { light: '#00711f', dark: green },
        border: { light: '#8fe398', dark: '#1d6b26' },
        solid: green,
        onSolid: '#000000',
      },
      warning: {
        bg: { light: '#fff6d6', dark: '#2e2600' },
        fg: { light: '#7a5200', dark: '#ffd84d' },
        border: { light: '#f5d66b', dark: '#665200' },
        solid: '#ffcc00',
        onSolid: '#000000',
      },
      // The app's alert red (its unread dot)
      danger: {
        bg: { light: '#fdecec', dark: '#3a0c10' },
        fg: { light: '#d50511', dark: '#ff8a8f' },
        border: { light: '#f2a5a9', dark: '#7a1f26' },
        solid: { light: '#d50511', dark: '#e5141f' },
        onSolid: '#ffffff',
      },
      // The blue of the app's initials avatars
      info: {
        bg: { light: '#e6f1fd', dark: '#0b2340' },
        fg: { light: '#0a5cb8', dark: '#7cb8ff' },
        border: { light: '#a9cdf5', dark: '#1d4a80' },
        solid: { light: '#0a6fd6', dark: '#2b86f0' },
        onSolid: { light: '#ffffff', dark: '#000000' },
      },
      selection: {
        bg: { light: '#b8f5be', dark: '#146b1c' },
        fg: { light: '#000000', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // A tight neutral grotesk; the reference's own face is proprietary
        sans: '"Inter Tight", ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif',
        display: '"Inter Tight", ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Helvetica, sans-serif',
        mono: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      // 12, 14, 16, 20, 24, 32, 40, 56: the site's and the help centre's sizes
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.25rem',
        xl: '1.5rem',
        '2xl': '2rem',
        '3xl': '2.5rem',
        '4xl': '3.5rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.05', normal: '1.5', relaxed: '1.7' },
      // Headlines are set tight (-3%); body text a hair tight
      tracking: { tight: '-0.03em', normal: '-0.005em', wide: '0.04em' },
      body: { weight: '400' },
      heading: { weight: '500', tracking: '-0.02em' },
    },
    control: {
      // Pills are 48px (the site's nav buttons are 46px); small 36px; large 56px
      height: {
        sm: 'calc(2.25rem * var(--m-density))',
        md: 'calc(3rem * var(--m-density))',
        lg: 'calc(3.5rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(1rem * var(--m-density))',
        md: 'calc(1.5rem * var(--m-density))',
        lg: 'calc(2rem * var(--m-density))',
      },
      fontSize: '1rem',
    },
    // 8px rows and chips, 12px option tiles and inputs, 20px cards; buttons and chips are pills
    radius: { sm: '8px', md: '12px', lg: '20px' },
    shadow: {
      // The help centre's bar shadow
      sm: { light: '0 2px 4px 0 rgb(0 0 0 / 0.06)', dark: '0 0 0 1px rgb(255 255 255 / 0.06)' },
      md: {
        light: '0 2px 4px rgb(0 0 0 / 0.04), 0 6px 16px rgb(0 0 0 / 0.06)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.08), 0 6px 16px rgb(0 0 0 / 0.5)',
      },
      // The app's notification card: a soft, wide lift
      lg: {
        light: '0 4px 12px rgb(0 0 0 / 0.06), 0 12px 32px rgb(0 0 0 / 0.1)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.08), 0 12px 32px rgb(0 0 0 / 0.6)',
      },
      overlay: {
        light: '0 8px 24px rgb(0 0 0 / 0.08), 0 24px 64px rgb(0 0 0 / 0.16)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.1), 0 24px 64px rgb(0 0 0 / 0.7)',
      },
    },
    motion: {
      // The site's .2s, .3s and .45s, on its quick-out curve
      duration: { fast: '200ms', normal: '300ms', slow: '450ms' },
      easing: { standard: 'cubic-bezier(0, 0.45, 0.25, 1)', emphasized: 'cubic-bezier(0, 0.5, 0.2, 1)' },
    },
  },
  components: {
    // Wide pages with the site's 20px gutters; a narrow column for forms; a white side column
    layout: {
      containerMax: { sm: '28rem', md: '46rem', lg: '76rem' },
      containerPadding: 'clamp(1rem, 2.75vw, 2.5rem)',
      gridGap: 'var(--m-space-4)',
      splitSide: '15rem',
    },
    // Every button is a pill at 500: black for the action (green in dark), grey for the rest
    button: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-medium)',
      tracking: '-0.01em',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      secondary: { bg: pill, fg: 'var(--m-color-fg-default)', border: 'transparent', hoverBg: pillHover, activeBg: pillActive },
      ghost: { fg: 'var(--m-color-fg-default)', hoverBg: quiet, activeBg: pill },
      danger: {
        bg: { light: '#d50511', dark: '#e5141f' },
        fg: '#ffffff',
        border: { light: '#d50511', dark: '#e5141f' },
        hoverBg: { light: '#b8040e', dark: '#c8101a' },
        activeBg: { light: '#9e030c', dark: '#ab0d16' },
      },
    },
    // Inputs: white boxes with 12px corners like the app's amount tiles; focus draws the 2px black
    // line of a chosen tile
    input: {
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: '#4b4b4b', dark: '#b3b3b3' },
      focusBorder: 'var(--m-color-fg-default)',
      invalidBorder: 'var(--m-color-danger-fg)',
      placeholder: 'var(--m-color-fg-subtle)',
      radius: '12px',
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.25rem * var(--m-density))',
      },
    },
    select: {
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: '#4b4b4b', dark: '#b3b3b3' },
      focusBorder: 'var(--m-color-fg-default)',
      invalidBorder: 'var(--m-color-danger-fg)',
      radius: '12px',
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.25rem * var(--m-density))',
      },
    },
    field: {
      gap: 'var(--m-space-2)',
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-medium)',
      hintFg: 'var(--m-color-fg-muted)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFg: 'var(--m-color-danger-fg)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    checkbox: { size: '1.25rem', radius: '6px', hoverBorder: { light: '#4b4b4b', dark: '#b3b3b3' } },
    radio: { size: '1.25rem' },
    // A wide pill switch: grey off, black on (green on in dark)
    switch: {
      width: '3.25rem',
      height: '2rem',
      thumbInset: '3px',
      trackBg: { light: '#808080', dark: '#5c5c5c' },
      trackCheckedBg: 'var(--m-color-accent-default)',
      thumbBg: '#ffffff',
      thumbCheckedBg: { light: '#ffffff', dark: '#000000' },
      thumbShadow: '0 2px 6px rgb(0 0 0 / 0.18)',
    },
    // White 20px cards on the grey screen: no border, no shadow
    card: {
      border: 'transparent',
      shadow: 'none',
      hoverShadow: 'var(--m-shadow-md)',
      hoverBorder: 'transparent',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-5)', lg: 'var(--m-space-8)' },
      titleFamily: 'var(--m-font-family-sans)',
      titleSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-medium)',
      // The site's outlined cards: a 1px hairline on white (on black, a dark grey line)
      outline: { bg: 'var(--m-color-bg-surface)', border: { light: '#d8d8d8', dark: '#333333' } },
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    // Clean rows: medium sentence-case headers in grey, hairlines, a white card around them
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: '1rem',
      cellPaddingY: '0.875rem',
      headerBg: 'var(--m-color-bg-surface)',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-medium)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      borderColor: 'var(--m-color-border-default)',
      stripeBg: { light: '#fafafa', dark: '#141414' },
      rowHoverBg: { light: '#f5f5f5', dark: '#232323' },
      wrapBorder: 'transparent',
      wrapRadius: '20px',
    },
    // A white side column: black items as pills, the current one on the grey pill
    sidebar: {
      bg: 'var(--m-color-bg-surface)',
      border: 'transparent',
      fontSize: 'var(--m-font-size-md)',
      padding: 'var(--m-space-4)',
      itemGap: '2px',
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#f0f0f0', dark: '#262626' },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: pill,
        activeWeight: 'var(--m-font-weight-medium)',
        radius: '9999px',
        paddingX: 'var(--m-space-4)',
        paddingY: 'calc(var(--m-space-3) * var(--m-density))',
      },
      heading: {
        fg: 'var(--m-color-fg-subtle)',
        size: 'var(--m-font-size-sm)',
        weight: 'var(--m-font-weight-medium)',
        transform: 'none',
        tracking: '0',
      },
      // Counts in the brand green with black figures
      count: { bg: green, fg: '#000000', radius: '9999px' },
    },
    // The site bar: no fill, a medium wordmark, pill links, pill actions at the right
    navbar: {
      height: '5.25rem',
      bg: 'var(--m-color-bg-surface)',
      border: 'transparent',
      shadow: 'none',
      brandFamily: 'var(--m-font-family-display)',
      brandWeight: '500',
      brandSize: 'var(--m-font-size-xl)',
      link: {
        radius: '9999px',
        paddingX: '1rem',
        fontSize: 'var(--m-font-size-sm)',
        fontWeight: 'var(--m-font-weight-medium)',
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#f0f0f0', dark: '#262626' },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: pill,
      },
    },
    // Underline tabs are medium grey with a 2px black line; the segmented control is the app's
    // Week / Month / Year: no track, the chosen one on the grey pill
    tabs: {
      fontSize: 'var(--m-font-size-md)',
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-fg-default)',
      indicatorWidth: '2px',
      listBorder: 'var(--m-color-border-default)',
      pill: {
        listBg: 'transparent',
        listRadius: '9999px',
        listPadding: '0',
        radius: '9999px',
        activeBg: pill,
        activeShadow: 'none',
      },
    },
    // Page numbers: round, the current one a black circle
    pagination: {
      radius: '9999px',
      border: 'transparent',
      fg: 'var(--m-color-fg-default)',
      hoverBg: pill,
      currentBg: 'var(--m-color-bg-inverse)',
      currentFg: 'var(--m-color-fg-inverse)',
      currentBorder: 'transparent',
    },
    breadcrumb: {
      separator: '"›"',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      currentFg: 'var(--m-color-fg-default)',
      currentWeight: 'var(--m-font-weight-medium)',
    },
    // The offer badge: a small capitals pill
    badge: {
      height: '1.5rem',
      paddingX: '0.625rem',
      radius: '9999px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-semibold)',
      textTransform: 'uppercase',
      tracking: '0.04em',
      neutral: { bg: pill, fg: 'var(--m-color-fg-default)', border: 'transparent' },
    },
    // Initials on the brand green, round
    avatar: {
      size: { sm: '1.75rem', md: '2.5rem', lg: '4rem' },
      bg: green,
      fg: '#000000',
      fontWeight: 'var(--m-font-weight-medium)',
    },
    // Notices: a flat wash of the tone, 16px corners, no border, no stripe
    alert: {
      bg: 'var(--m-color-bg-surface)',
      borderWidth: '0px',
      border: 'transparent',
      accentWidth: '0px',
      radius: '16px',
      padding: 'var(--m-space-4)',
      gap: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    // The app's notification card: white, 20px corners, a soft lift, whatever the tone
    toast: {
      bg: 'var(--m-color-bg-raised)',
      fg: 'var(--m-color-fg-default)',
      bodyFg: 'var(--m-color-fg-muted)',
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '20px',
      shadow: 'var(--m-shadow-lg)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    // The bottom sheet, centred: white, 28px corners, no border
    dialog: {
      border: 'transparent',
      radius: '28px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-6)',
      titleFamily: 'var(--m-font-family-display)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-medium)',
      descriptionFg: 'var(--m-color-fg-muted)',
    },
    popover: {
      border: 'var(--m-color-border-default)',
      radius: '16px',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-2)',
      item: {
        height: '2.75rem',
        paddingX: 'var(--m-space-3)',
        radius: '10px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: { light: '#f0f0f0', dark: '#333333' },
        hoverFg: 'var(--m-color-fg-default)',
      },
    },
    tooltip: {
      radius: '8px',
      shadow: 'none',
      paddingX: 'var(--m-space-3)',
      paddingY: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-medium)',
    },
    // The Green-status bar: a thick green pill on a grey track. The bright green is under 3:1 on
    // white, so light mode fills with the site's deeper button green
    progress: {
      height: { sm: '0.375rem', md: '0.5rem', lg: '0.75rem' },
      radius: '9999px',
      track: pill,
      fill: { light: '#128a00', dark: green },
    },
    // The site's questions: no box, hairlines between, a large regular question in grey
    accordion: {
      radius: '0',
      bg: 'transparent',
      paddingX: '0',
      paddingY: '1.25rem',
      summaryFg: 'var(--m-color-fg-muted)',
      summarySize: 'var(--m-font-size-lg)',
      summaryWeight: 'var(--m-font-weight-regular)',
      contentFg: 'var(--m-color-fg-muted)',
      hoverBg: 'transparent',
      chevronSize: '0.5em',
    },
    skeleton: {
      bg: { light: '#e8e8e8', dark: '#262626' },
      highlight: { light: '#f5f5f5', dark: '#333333' },
      duration: '1.2s',
    },
    spinner: { color: 'var(--m-color-fg-default)', duration: '0.8s' },
    kbd: { radius: '6px', shadow: 'none', fontWeight: 'var(--m-font-weight-medium)' },
    code: { radius: '12px', inlineRadius: '6px', inlineBg: pill, bg: 'var(--m-color-bg-sunken)' },
    prose: { linkFg: 'var(--m-color-accent-text)', linkDecoration: 'underline', maxWidth: '40rem' },
    // The assistant: the person's messages in a grey bubble on the right, the replies as plain text
    chat: {
      radius: '20px',
      userBg: pill,
      userFg: 'var(--m-color-fg-default)',
      userBorder: 'transparent',
      assistantBg: 'transparent',
      assistantBorder: 'transparent',
    },
    // The "I want to…" box: a white pill with a grey line, the send button a black circle
    composer: { radius: '28px', focusBorder: 'var(--m-color-fg-default)' },
    citation: { chipBg: pill, chipFg: 'var(--m-color-fg-default)', chipRadius: '9999px' },
    toolCall: { radius: '16px', statusRadius: '9999px' },
    // The meter needs 3:1 on its track, so its fill is the site's deeper button green in light mode
    usage: { radius: '9999px', okFill: { light: '#128a00', dark: green } },
  },
});
