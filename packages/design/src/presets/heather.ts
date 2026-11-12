import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Heather: a friendly, clean video-messaging workspace. Charcoal ink on white, one clear blue for
 * the action and the current place, 12px buttons, 16px cards and video frames drawn with a hairline,
 * pale-blue chips for timestamps and a soft grey for everything quiet. Dark mode is a warm charcoal
 * with a lighter blue and dark text on it. Category: warm and friendly. The values are measured, not
 * invented (see DESIGN.md).
 */
export const heather = extendTheme(minimal, {
  name: 'heather',
  label: 'Heather',
  description:
    'Friendly and clean: charcoal ink on white, one clear blue, 12px buttons, 16px hairline cards and video frames, pale-blue time chips and a charcoal dark mode.',
  tokens: {
    color: {
      bg: {
        canvas: { light: '#ffffff', dark: '#1f1f21' },
        surface: { light: '#ffffff', dark: '#1f1f21' },
        // Menus, dialogs, popovers
        raised: { light: '#ffffff', dark: '#2b2c2f' },
        // The well behind the video, quiet panels, code blocks
        sunken: { light: '#f8f8f8', dark: '#18191a' },
        // The blanket: a navy-black at 46% (light), black-ink at 60% (dark)
        overlay: { light: 'rgb(5 12 31 / 0.46)', dark: 'rgb(16 18 20 / 0.6)' },
        // Tooltips and the solid neutral: charcoal on light, pale grey on dark
        inverse: { light: '#292a2e', dark: '#cecfd2' },
      },
      fg: {
        default: { light: '#292a2e', dark: '#cecfd2' },
        muted: { light: '#505258', dark: '#a9abaf' },
        subtle: { light: '#6b6e76', dark: '#96999e' },
        inverse: { light: '#ffffff', dark: '#1f1f21' },
      },
      border: {
        // Hairlines: ink at 14% (light) and pale at 12% (dark), flattened onto the surface
        default: { light: '#dddedd', dark: '#37373a' },
        muted: { light: '#f0f1f2', dark: '#2b2b2e' },
        // Inputs and checkboxes: the reference's input border
        strong: { light: '#8c8f97', dark: '#7e8188' },
        focus: { light: '#4688ec', dark: '#8fb8f6' },
      },
      // The blue: buttons, links, the current tab and nav row. Dark mode lightens it and puts dark
      // text on it, as the reference does
      accent: {
        default: { light: '#1868db', dark: '#669df1' },
        hover: { light: '#1558bc', dark: '#8fb8f6' },
        active: { light: '#144794', dark: '#adcbfb' },
        subtle: { light: '#e9f2fe', dark: '#1c2b42' },
        fg: { light: '#ffffff', dark: '#1f1f21' },
        text: { light: '#1868db', dark: '#669df1' },
      },
      // The logo tile keeps the same blue in both modes
      brand: {
        default: { light: '#1868db', dark: '#1868db' },
        fg: '#ffffff',
        subtle: { light: '#e9f2fe', dark: '#1c2b42' },
      },
      success: {
        bg: { light: '#efffd6', dark: '#28311b' },
        fg: { light: '#4c6b1f', dark: '#b3df72' },
        border: { light: '#b3df72', dark: '#4c6b1f' },
        solid: { light: '#5b7f24', dark: '#94c748' },
        onSolid: { light: '#ffffff', dark: '#1f1f21' },
      },
      warning: {
        bg: { light: '#fff5db', dark: '#3a2c1f' },
        fg: { light: '#9e4c00', dark: '#fbc828' },
        border: { light: '#fbc828', dark: '#7a3b00' },
        solid: { light: '#fbc828', dark: '#fbc828' },
        onSolid: { light: '#292a2e', dark: '#1f1f21' },
      },
      danger: {
        bg: { light: '#ffeceb', dark: '#42221f' },
        fg: { light: '#ae2e24', dark: '#fd9891' },
        border: { light: '#fd9891', dark: '#872821' },
        solid: { light: '#c9372c', dark: '#f87168' },
        onSolid: { light: '#ffffff', dark: '#1f1f21' },
      },
      info: {
        bg: { light: '#e9f2fe', dark: '#1c2b42' },
        fg: { light: '#1558bc', dark: '#8fb8f6' },
        border: { light: '#8fb8f6', dark: '#1558bc' },
        solid: { light: '#1868db', dark: '#669df1' },
        onSolid: { light: '#ffffff', dark: '#1f1f21' },
      },
      selection: {
        bg: { light: '#cfe1fd', dark: '#123263' },
        fg: { light: '#292a2e', dark: '#e9f2fe' },
      },
    },
    font: {
      family: {
        // A neutral grotesque with optical sizes: Inter's variable font with its opsz axis stands in
        // for the reference's own face and matches it width for width at 14, 24 and 32px
        sans: '"Inter Variable", "Inter", ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Ubuntu, system-ui, "Helvetica Neue", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"',
        display: '"Inter Variable", "Inter", ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        mono: '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, Menlo, "Segoe UI Mono", "Ubuntu Mono", monospace',
      },
      // 12 small, 14 body, 16 large body, 20/24/28/32 headings
      size: {
        xs: '0.6875rem',
        sm: '0.75rem',
        md: '0.875rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.75rem',
        '4xl': '2rem',
      },
      // Bold is the reference's own 653
      weight: { regular: '400', medium: '500', semibold: '600', bold: '653' },
      leading: { tight: '1.167', normal: '1.57', relaxed: '1.6' },
      tracking: { tight: '-0.01em', normal: '0', wide: '0.03em' },
      body: { weight: '400' },
      heading: { weight: '653', tracking: '0' },
    },
    control: {
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(2.25rem * var(--m-density))',
        lg: 'calc(2.5rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.25rem * var(--m-density))',
      },
      fontSize: '0.875rem',
    },
    // 4px badges and checkboxes, 8px inputs, menus and rows, 16px cards, video frames and panels;
    // buttons are 12px (set on the button)
    radius: { sm: '4px', md: '8px', lg: '16px', control: '8px', container: '16px' },
    shadow: {
      // The reference's raised shadow: a 1px drop and a 1px perimeter
      sm: {
        light: '0 1px 1px rgb(30 31 33 / 0.25), 0 0 1px rgb(30 31 33 / 0.31)',
        dark: '0 1px 1px rgb(1 4 4 / 0.5), 0 0 1px rgb(1 4 4 / 0.5)',
      },
      // The soft card lift (the reaction bar, the comment box)
      md: {
        light: '0 4px 10px rgb(0 0 0 / 0.05)',
        dark: '0 0 0 1px rgb(189 189 189 / 0.12), 0 4px 10px rgb(1 4 4 / 0.36)',
      },
      // Menus and popovers: the reference's overlay shadow
      lg: {
        light: '0 8px 12px rgb(30 31 33 / 0.15), 0 0 1px rgb(30 31 33 / 0.31)',
        dark: '0 0 0 1px rgb(189 189 189 / 0.12), 0 8px 12px rgb(1 4 4 / 0.36), 0 0 1px 1px rgb(1 4 4 / 0.5)',
      },
      // Dialogs and toasts: the overlay shadow with the large soft drop
      overlay: {
        light: '0 6px 24px rgb(0 0 0 / 0.1), 0 8px 12px rgb(30 31 33 / 0.15), 0 0 1px rgb(30 31 33 / 0.31)',
        dark: '0 0 0 1px rgb(189 189 189 / 0.12), 0 8px 24px rgb(1 4 4 / 0.5), 0 0 1px 1px rgb(1 4 4 / 0.5)',
      },
    },
    focus: { width: '2px', offset: '2px' },
    motion: {
      duration: { fast: '150ms', normal: '200ms', slow: '250ms' },
      easing: { standard: 'cubic-bezier(0.4, 0, 0, 1)', emphasized: 'cubic-bezier(0, 0.4, 0, 1)' },
    },
  },
  components: {
    // A 240px white sidebar with a hairline, a fluid content column with 40px gutters, card grids
    layout: {
      containerMax: { sm: '30rem', md: '50rem', lg: '80rem' },
      containerPadding: 'clamp(1rem, 3vw, 2.5rem)',
      gridGap: 'var(--m-space-4)',
      gridMin: '17rem',
      splitSide: '15rem',
    },
    // 12px corners, medium 14px labels: solid blue for the one that matters, white with a hairline
    // for the rest, and quiet text buttons for icons and tools
    button: {
      radius: '12px',
      fontWeight: 'var(--m-font-weight-medium)',
      fontSize: 'var(--m-font-size-md)',
      shadow: 'none',
      gap: 'var(--m-space-2)',
      primary: { border: 'transparent' },
      secondary: {
        bg: { light: '#ffffff', dark: '#1f1f21' },
        fg: 'var(--m-color-fg-default)',
        border: 'var(--m-color-border-default)',
        hoverBg: { light: '#f0f1f2', dark: '#2b2b2e' },
        activeBg: { light: '#dddedd', dark: '#37373a' },
      },
      ghost: {
        fg: 'var(--m-color-fg-muted)',
        hoverBg: { light: '#f0f1f2', dark: '#2b2b2e' },
        activeBg: { light: '#dddedd', dark: '#37373a' },
      },
      danger: {
        border: 'transparent',
        hoverBg: { light: '#ae2e24', dark: '#fd9891' },
        activeBg: { light: '#872821', dark: '#ffb8b2' },
      },
    },
    // Video cards and panels: white, 16px corners, a hairline, no shadow until hovered
    card: {
      border: 'var(--m-color-border-default)',
      shadow: 'none',
      hoverShadow: 'var(--m-shadow-md)',
      hoverBorder: 'var(--m-color-border-default)',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-3)', md: 'var(--m-space-4)', lg: 'var(--m-space-6)' },
      gap: 'var(--m-space-2)',
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-bold)',
      descriptionFg: 'var(--m-color-fg-subtle)',
      descriptionSize: 'var(--m-font-size-md)',
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    input: {
      fontSize: 'var(--m-font-size-md)',
      hoverBorder: 'var(--m-color-border-strong)',
      focusBorder: 'var(--m-color-accent-default)',
      disabledBg: { light: '#f0f1f2', dark: '#2b2b2e' },
      paddingX: { sm: 'var(--m-space-3)', md: 'var(--m-space-4)', lg: 'var(--m-space-4)' },
    },
    select: {
      fontSize: 'var(--m-font-size-md)',
      hoverBorder: 'var(--m-color-border-strong)',
      focusBorder: 'var(--m-color-accent-default)',
      disabledBg: { light: '#f0f1f2', dark: '#2b2b2e' },
    },
    field: {
      gap: 'var(--m-space-1)',
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: 'var(--m-font-size-md)',
      labelFontWeight: 'var(--m-font-weight-medium)',
      hintFg: 'var(--m-color-fg-subtle)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    checkbox: {
      size: '1rem',
      radius: '4px',
      border: 'var(--m-color-border-strong)',
      hoverBorder: 'var(--m-color-fg-muted)',
    },
    // A 2px dark ring; chosen, the ring stays dark around the blue (the library fills the checked
    // radio, so the reference's white gap becomes the blue and its blue dot a white one)
    radio: {
      size: '1rem',
      borderWidth: '2px',
      border: 'var(--m-color-fg-muted)',
      hoverBorder: 'var(--m-color-fg-default)',
      checkedBg: 'var(--m-color-accent-default)',
      checkedBorder: 'var(--m-color-fg-default)',
      dot: 'var(--m-color-accent-fg)',
    },
    // A round blue track with a large white knob; grey when off
    switch: {
      width: '2.5rem',
      height: '1.5rem',
      smWidth: '2rem',
      smHeight: '1.25rem',
      trackBg: 'var(--m-color-border-strong)',
      thumbBg: '#ffffff',
      // Dark mode's lighter blue needs a dark knob for 3:1
      thumbCheckedBg: { light: '#ffffff', dark: '#1f1f21' },
      thumbInset: '3px',
      thumbShadow: 'none',
    },
    // Members and lists: no frame, no header fill, 12px semibold headers, hairline rows
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: 'var(--m-space-3)',
      cellPaddingY: 'calc(0.625rem * var(--m-density))',
      borderColor: 'var(--m-color-border-default)',
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-subtle)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-semibold)',
      headerTransform: 'none',
      headerTracking: '0',
      rowHoverBg: { light: '#f8f8f8', dark: '#242528' },
      stripeBg: 'var(--m-color-bg-sunken)',
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    // White, a hairline edge; medium 14px rows with a 16px icon; the current one pale blue with
    // blue text; section headings in plain muted text
    sidebar: {
      width: '15rem',
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-default)',
      padding: 'var(--m-space-3)',
      sectionGap: 'var(--m-space-4)',
      itemGap: '2px',
      // 15px rows, a touch above body size, as measured
      fontSize: '0.9375rem',
      heading: {
        fg: 'var(--m-color-fg-subtle)',
        size: 'var(--m-font-size-sm)',
        weight: 'var(--m-font-weight-semibold)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#f0f1f2', dark: '#2b2b2e' },
        activeFg: 'var(--m-color-accent-text)',
        activeBg: 'var(--m-color-accent-subtle)',
        activeWeight: 'var(--m-font-weight-semibold)',
        radius: '6px',
        paddingX: 'var(--m-space-3)',
        paddingY: 'calc(0.5rem * var(--m-density))',
      },
      count: { bg: 'transparent', fg: 'var(--m-color-fg-subtle)' },
    },
    // The public header: white, 60px, medium links, buttons at the right
    navbar: {
      height: 'calc(3.75rem * var(--m-density))',
      paddingX: 'var(--m-space-4)',
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-default)',
      brandSize: 'var(--m-font-size-xl)',
      brandWeight: 'var(--m-font-weight-medium)',
      link: {
        height: '2rem',
        paddingX: 'var(--m-space-3)',
        radius: '6px',
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-medium)',
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#f0f1f2', dark: '#2b2b2e' },
        activeFg: 'var(--m-color-accent-text)',
        activeBg: 'transparent',
      },
    },
    // Underline tabs: medium 14px in the subtle grey, the current one blue over a 2px blue line.
    // Segments: a grey track, the chosen one white and raised
    tabs: {
      gap: 'var(--m-space-4)',
      listGap: 'var(--m-space-4)',
      listBorder: 'var(--m-color-border-default)',
      height: '2.25rem',
      paddingX: '0',
      fontSize: 'var(--m-font-size-md)',
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-subtle)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-accent-text)',
      indicator: 'var(--m-color-accent-default)',
      indicatorWidth: '2px',
      pill: {
        listBg: { light: '#f0f1f2', dark: '#18191a' },
        listRadius: '12px',
        listPadding: '4px',
        radius: '8px',
        activeBg: { light: '#ffffff', dark: '#2b2c2f' },
        activeShadow: 'var(--m-shadow-sm)',
      },
    },
    breadcrumb: {
      separator: '"/"',
      fontSize: 'var(--m-font-size-md)',
      fg: 'var(--m-color-fg-subtle)',
      currentWeight: 'var(--m-font-weight-medium)',
    },
    pagination: {
      radius: '8px',
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-muted)',
      border: 'transparent',
      currentBg: 'var(--m-color-accent-subtle)',
      currentFg: 'var(--m-color-accent-text)',
      currentBorder: 'transparent',
    },
    // Small 4px labels in sentence case, semibold, on a soft tint
    badge: {
      height: '1.25rem',
      paddingX: '0.375rem',
      radius: '4px',
      borderWidth: '0px',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-semibold)',
      textTransform: 'none',
      tracking: '0',
      neutral: {
        bg: { light: '#f0f1f2', dark: '#303134' },
        fg: { light: '#505258', dark: '#a9abaf' },
        border: 'transparent',
        solidBg: 'var(--m-color-bg-inverse)',
        solidFg: 'var(--m-color-fg-inverse)',
      },
    },
    avatar: {
      size: { sm: '1.5rem', md: '2rem', lg: '2.5rem' },
      bg: 'var(--m-color-accent-subtle)',
      fg: 'var(--m-color-accent-text)',
      fontWeight: 'var(--m-font-weight-semibold)',
      ringColor: 'var(--m-color-bg-surface)',
      ringWidth: '2px',
    },
    // Section messages: a pale tint, 8px corners, no border, no stripe
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '8px',
      padding: 'var(--m-space-4)',
      gap: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    // Flags: white, 8px corners, the overlay shadow, a coloured icon
    toast: {
      border: 'transparent',
      accentWidth: '0px',
      radius: '8px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-4)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    dialog: {
      border: 'transparent',
      radius: '12px',
      padding: 'var(--m-space-6)',
      titleFamily: 'var(--m-font-body-family)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-bold)',
      descriptionFg: 'var(--m-color-fg-muted)',
    },
    // Menus: white, 8px corners, the overlay shadow, full-width rows that tint grey on hover
    popover: {
      border: 'transparent',
      radius: '8px',
      shadow: 'var(--m-shadow-lg)',
      padding: '0.375rem 0',
      item: {
        height: '2.25rem',
        paddingX: 'var(--m-space-4)',
        gap: 'var(--m-space-2)',
        radius: '0',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: { light: '#f0f1f2', dark: '#37373a' },
        hoverFg: 'var(--m-color-fg-default)',
      },
      labelFg: 'var(--m-color-fg-subtle)',
      labelSize: 'var(--m-font-size-sm)',
      separator: 'var(--m-color-border-default)',
    },
    // Charcoal with white 12px medium text, 6px corners, a soft drop
    tooltip: {
      radius: '6px',
      shadow: '0 4px 10px rgb(0 0 0 / 0.1)',
      paddingX: 'var(--m-space-3)',
      paddingY: '0.4375rem',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-medium)',
      delay: '300ms',
    },
    progress: {
      height: { sm: '0.25rem', md: '0.375rem', lg: '0.5rem' },
      radius: '9999px',
      track: { light: '#f0f1f2', dark: '#2b2b2e' },
      fill: 'var(--m-color-accent-default)',
    },
    usage: {
      height: '0.375rem',
      track: { light: '#f0f1f2', dark: '#2b2b2e' },
      okFill: 'var(--m-color-accent-default)',
    },
    skeleton: {
      bg: { light: '#f0f1f2', dark: '#2b2b2e' },
      highlight: { light: '#f8f8f8', dark: '#37373a' },
      radius: '4px',
      blockRadius: '16px',
    },
    spinner: { thickness: '2px' },
    kbd: {
      fontFamily: 'var(--m-font-family-sans)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-semibold)',
      bg: { light: '#f0f1f2', dark: '#303134' },
      border: 'transparent',
      radius: '4px',
      shadow: 'none',
    },
    code: {
      radius: '8px',
      border: 'var(--m-color-border-default)',
      inlineRadius: '4px',
      inlineBg: { light: '#f0f1f2', dark: '#303134' },
      inlineBorder: 'transparent',
      keyword: { light: '#ae2e24', dark: '#fd9891' },
      string: { light: '#4c6b1f', dark: '#b3df72' },
      function: { light: '#216e4e', dark: '#7ee2b8' },
      constant: { light: '#7f5f01', dark: '#eed12b' },
      comment: { light: '#505258', dark: '#a9abaf' },
    },
    // Questions as hairline rows, no fills
    accordion: {
      radius: '0',
      bg: 'transparent',
      paddingX: '0',
      paddingY: 'var(--m-space-4)',
      summarySize: 'var(--m-font-size-lg)',
      summaryWeight: 'var(--m-font-weight-medium)',
      hoverBg: 'transparent',
    },
    prose: { maxWidth: '68ch', lineHeight: '1.57', linkFg: 'var(--m-color-accent-text)' },
    // Comments and the assistant: no bubbles for others; your own on the pale blue
    chat: {
      radius: '12px',
      userBg: 'var(--m-color-accent-subtle)',
      userFg: 'var(--m-color-fg-default)',
      userBorder: 'transparent',
      assistantBg: 'transparent',
      assistantBorder: 'transparent',
      avatarBg: 'var(--m-color-accent-subtle)',
      avatarFg: 'var(--m-color-accent-text)',
    },
    // The comment box: the input border, 2px blue while typing
    composer: {
      radius: '12px',
      border: 'var(--m-color-border-strong)',
      focusBorder: 'var(--m-color-accent-default)',
      shadow: 'none',
    },
    citation: { chipRadius: '4px', chipBg: 'var(--m-color-accent-subtle)', chipFg: 'var(--m-color-accent-text)' },
    toolCall: { radius: '8px' },
  },
});
