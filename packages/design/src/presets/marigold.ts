import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Marigold: a bright, chunky, encouraging learning app. White screens, grey 2px outlines, a bright
 * green for the one action and for progress, a sky blue for links and selection, rounded heavy type,
 * uppercase button labels, and buttons that stand on a thick darker lip and press down when tapped.
 * Category: warm and friendly. The values are the reference's own palette and component styles,
 * read from its public stylesheets and published guidelines (see DESIGN.md).
 */

// The reference's palette, by its own role names in the notes: green, blue, the greys and the tints
const green = '#58cc02';
const greenDark = '#93d333';
const ink = { light: '#4b4b4b', dark: '#f1f7fb' };
// Dark ink for labels on bright fills: the reference's own dark-mode screen colour
const onBright = '#131f24';
// Line grey (2px outlines, hairlines, the lip under white buttons)
const line = { light: '#e5e5e5', dark: '#37464f' };
// The pale grey well (inputs, quiet panels)
const well = { light: '#f7f7f7', dark: '#202f36' };
// Selected: a pale sky tint with a light-blue outline and blue text
const skyTint = { light: '#ddf4ff', dark: '#1a3546' };
const skyLine = { light: '#84d8ff', dark: '#3f87ab' };
const skyText = { light: '#0b6fb0', dark: '#49c0f8' };
// The pale green tint behind "correct" and the learner's own row
const greenTint = { light: '#d7ffb8', dark: '#1f3a1a' };
// The 3D lip and ring, drawn inside the button so one value works on every fill
const lip = {
  light: 'inset 0 0 0 2px rgb(0 0 0 / 0.1), inset 0 -4px 0 rgb(0 0 0 / 0.12)',
  dark: 'inset 0 0 0 2px rgb(255 255 255 / 0.14), inset 0 -4px 0 rgb(0 0 0 / 0.3)',
};
const lipPressed = {
  light: 'inset 0 0 0 2px rgb(0 0 0 / 0.1)',
  dark: 'inset 0 0 0 2px rgb(255 255 255 / 0.14)',
};

export const marigold = extendTheme(minimal, {
  name: 'marigold',
  label: 'Marigold',
  description:
    'Bright and encouraging: white screens with grey 2px outlines, a bright green action, sky-blue selection, rounded heavy type and chunky buttons on a darker lip.',
  tokens: {
    color: {
      bg: {
        canvas: { light: '#ffffff', dark: '#131f24' },
        surface: { light: '#ffffff', dark: '#131f24' },
        raised: { light: '#ffffff', dark: '#202f36' },
        sunken: well,
        overlay: { light: 'rgb(0 0 0 / 0.5)', dark: 'rgb(0 0 0 / 0.6)' },
        inverse: { light: '#4b4b4b', dark: '#f1f7fb' },
      },
      fg: {
        default: ink,
        // The secondary grey, one step darker so it reads on the pale well
        muted: { light: '#666666', dark: '#dce6ec' },
        // Placeholder and tertiary text: the reference's light grey is far under 4.5:1, so a passing step
        subtle: { light: '#707070', dark: '#8197a0' },
        inverse: { light: '#ffffff', dark: '#131f24' },
      },
      border: {
        default: line,
        muted: { light: '#f0f0f0', dark: '#202f36' },
        // Control borders: the reference's line grey is 1.3:1; this is the nearest 3:1 grey
        strong: { light: '#8f8f8f', dark: '#677b84' },
        focus: { light: '#1590cc', dark: '#49c0f8' },
      },
      // The action: the bright green. The semantic step is the reference's lip green (3:1 on white) so
      // checks and rings read; the primary button itself is the bright green (see components)
      accent: {
        default: { light: '#58a700', dark: greenDark },
        hover: { light: '#61b800', dark: '#a2e43a' },
        active: { light: '#58a700', dark: greenDark },
        subtle: greenTint,
        fg: onBright,
        text: skyText,
      },
      // The signature green: banners, the logo mark, the learner's highlights
      brand: {
        default: { light: green, dark: greenDark },
        fg: onBright,
        subtle: greenTint,
      },
      success: {
        bg: greenTint,
        fg: { light: '#3b7700', dark: greenDark },
        border: { light: '#a5ed6e', dark: '#3f6a1f' },
        solid: { light: green, dark: greenDark },
        onSolid: onBright,
      },
      warning: {
        bg: { light: '#fff5d3', dark: '#3a301a' },
        fg: { light: '#8c5a11', dark: '#ffc800' },
        border: { light: '#ffc800', dark: '#7a5f12' },
        solid: { light: '#ffc800', dark: '#ffc800' },
        onSolid: onBright,
      },
      danger: {
        bg: { light: '#ffdfe0', dark: '#3a1f22' },
        fg: { light: '#c21f1f', dark: '#ff7878' },
        border: { light: '#ff4b4b', dark: '#a33a3a' },
        solid: { light: '#ff4b4b', dark: '#ee5555' },
        onSolid: onBright,
      },
      info: {
        bg: skyTint,
        fg: skyText,
        border: skyLine,
        solid: { light: '#1cb0f6', dark: '#49c0f8' },
        onSolid: onBright,
      },
      selection: {
        bg: { light: '#ddf4ff', dark: '#1a3546' },
        fg: ink,
      },
    },
    font: {
      family: {
        // The reference's own text face is proprietary; its published substitute is this rounded sans
        sans: '"Nunito Variable", "Nunito", ui-rounded, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        display: '"Nunito Variable", "Nunito", ui-rounded, ui-sans-serif, system-ui, sans-serif',
        mono: '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      // 13, 15, 17, 19, 24, 32, 48, 62: the reference's label, button, body, subhead, heading,
      // page title and marketing sizes
      size: {
        xs: '0.8125rem',
        sm: '0.9375rem',
        md: '1.0625rem',
        lg: '1.1875rem',
        xl: '1.5rem',
        '2xl': '2rem',
        '3xl': '3rem',
        '4xl': '3.875rem',
      },
      weight: { regular: '500', medium: '600', semibold: '700', bold: '800' },
      leading: { tight: '1.1', normal: '1.45', relaxed: '1.6' },
      tracking: { tight: '-0.02em', normal: '0', wide: '0.05em' },
      body: { weight: '500' },
      heading: { weight: '800', tracking: '0' },
    },
    space: { unit: '0.25rem' },
    control: {
      height: {
        sm: 'calc(2.5rem * var(--m-density))',
        md: 'calc(3.125rem * var(--m-density))',
        lg: 'calc(3.5rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.5rem * var(--m-density))',
      },
      fontSize: '0.9375rem',
    },
    // 8px badges, 12px inputs and nav items, 16px buttons, cards and dialogs
    radius: { sm: '8px', md: '12px', lg: '16px', control: '16px' },
    // Every outline is 2px: cards, rows, inputs, the sidebar edge
    borderWidth: { thin: '2px', thick: '4px', control: '2px', container: '2px' },
    shadow: {
      // No soft shadows: depth is a solid lip under the shape
      sm: { light: '0 2px 0 #e5e5e5', dark: '0 2px 0 #37464f' },
      md: { light: '0 4px 0 #e5e5e5', dark: '0 4px 0 #37464f' },
      lg: { light: '0 4px 0 #e5e5e5', dark: '0 4px 0 #37464f' },
      overlay: {
        light: '0 4px 0 #e5e5e5, 0 12px 32px rgb(0 0 0 / 0.08)',
        dark: '0 4px 0 #37464f, 0 12px 32px rgb(0 0 0 / 0.4)',
      },
    },
    focus: { width: '2px', offset: '2px' },
    motion: {
      // The reference's filter fade is .2s; presses are near-instant
      duration: { fast: '100ms', normal: '200ms', slow: '400ms' },
      easing: { standard: 'ease', emphasized: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
    },
  },
  components: {
    // A 256px side column with a 2px edge; a centred content column; a narrow form column
    layout: {
      containerMax: { sm: '24rem', md: '42rem', lg: '66rem' },
      containerPadding: 'clamp(1rem, 4vw, 2rem)',
      gridGap: 'var(--m-space-6)',
      splitSide: '16rem',
    },
    // Chunky 50px buttons: uppercase heavy labels, a darker lip at the bottom, a lighter fill on hover,
    // and on press the lip goes and the button moves down
    button: {
      fontWeight: '800',
      textTransform: 'uppercase',
      tracking: '0.05em',
      radius: '16px',
      borderWidth: '0px',
      shadow: lip,
      hoverShadow: lip,
      activeShadow: lipPressed,
      activeTransform: 'translateY(2px)',
      primary: {
        bg: { light: green, dark: greenDark },
        fg: onBright,
        border: 'transparent',
        hoverBg: { light: '#61e002', dark: '#a2e43a' },
        activeBg: { light: green, dark: greenDark },
      },
      // The white "stroke" button: grey ring and lip, blue label
      secondary: {
        bg: { light: '#ffffff', dark: '#131f24' },
        fg: skyText,
        border: 'transparent',
        hoverBg: { light: '#f7f7f7', dark: '#202f36' },
        activeBg: { light: '#ffffff', dark: '#131f24' },
      },
      ghost: {
        fg: skyText,
        hoverBg: { light: '#f7f7f7', dark: '#202f36' },
        activeBg: { light: '#f0f0f0', dark: '#37464f' },
      },
      danger: {
        bg: { light: '#ff4b4b', dark: '#ee5555' },
        fg: onBright,
        border: 'transparent',
        hoverBg: { light: '#ff6363', dark: '#ff6b6b' },
        activeBg: { light: '#ff4b4b', dark: '#ee5555' },
      },
    },
    // Inputs sit in the pale well with a 2px outline and 12px corners
    input: {
      bg: well,
      fontSize: 'var(--m-font-size-md)',
      radius: '12px',
      borderWidth: '2px',
      hoverBorder: { light: '#6f6f6f', dark: '#8197a0' },
      focusBorder: 'var(--m-color-border-focus)',
      invalidBorder: 'var(--m-color-danger-border)',
      height: {
        sm: 'calc(2.5rem * var(--m-density))',
        md: 'calc(3rem * var(--m-density))',
        lg: 'calc(3.5rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(0.875rem * var(--m-density))',
        lg: 'calc(1rem * var(--m-density))',
      },
    },
    select: {
      bg: well,
      fontSize: 'var(--m-font-size-md)',
      radius: '12px',
      borderWidth: '2px',
      hoverBorder: { light: '#6f6f6f', dark: '#8197a0' },
      focusBorder: 'var(--m-color-border-focus)',
      invalidBorder: 'var(--m-color-danger-border)',
      height: {
        sm: 'calc(2.5rem * var(--m-density))',
        md: 'calc(3rem * var(--m-density))',
        lg: 'calc(3.5rem * var(--m-density))',
      },
    },
    field: {
      gap: 'var(--m-space-2)',
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: 'var(--m-font-size-md)',
      labelFontWeight: '700',
      hintFg: 'var(--m-color-fg-muted)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFontWeight: '700',
    },
    // Ticked and on are the selection blue (the reference's blue lip step, 3:1 on white)
    checkbox: {
      size: '1.5rem',
      radius: '8px',
      borderWidth: '2px',
      checkedBg: { light: '#1899d6', dark: '#49c0f8' },
      checkedBorder: { light: '#1899d6', dark: '#49c0f8' },
      mark: { light: '#ffffff', dark: onBright },
    },
    radio: {
      size: '1.5rem',
      borderWidth: '2px',
      checkedBg: { light: '#1899d6', dark: '#49c0f8' },
      checkedBorder: { light: '#1899d6', dark: '#49c0f8' },
      dot: { light: '#ffffff', dark: onBright },
    },
    switch: {
      width: '3.25rem',
      height: '2rem',
      borderWidth: '0px',
      trackBg: { light: '#8f8f8f', dark: '#677b84' },
      trackCheckedBg: { light: '#1899d6', dark: '#49c0f8' },
      thumbBg: '#ffffff',
      thumbCheckedBg: { light: '#ffffff', dark: onBright },
      thumbInset: '4px',
      thumbShadow: '0 2px 0 rgb(0 0 0 / 0.15)',
    },
    // Cards are white with a 2px grey outline and 16px corners; no shadow, a lip on hover
    card: {
      border: 'var(--m-color-border-default)',
      borderWidth: '2px',
      radius: '16px',
      shadow: 'none',
      hoverShadow: 'var(--m-shadow-md)',
      hoverBorder: 'var(--m-color-border-default)',
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-6)', lg: 'var(--m-space-8)' },
      titleFamily: 'var(--m-font-family-sans)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: '800',
      descriptionFg: 'var(--m-color-fg-muted)',
      outline: { bg: 'var(--m-color-bg-surface)', border: 'var(--m-color-border-default)' },
      sunken: { bg: well, border: 'transparent' },
    },
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: '1rem',
      cellPaddingY: '0.875rem',
      borderColor: 'var(--m-color-border-default)',
      borderWidth: '2px',
      headerBg: 'var(--m-color-bg-surface)',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: '800',
      headerTransform: 'uppercase',
      headerTracking: '0.05em',
      rowHoverBg: well,
      stripeBg: 'var(--m-color-bg-surface)',
      wrapBorder: 'var(--m-color-border-default)',
      wrapBorderWidth: '2px',
      wrapRadius: '16px',
      wrapShadow: 'none',
    },
    // The app's side column: uppercase heavy labels in grey; the current one in blue on the sky
    // tint with a light-blue 2px outline
    sidebar: {
      width: '16rem',
      bg: 'var(--m-color-bg-canvas)',
      border: 'var(--m-color-border-default)',
      borderWidth: '2px',
      padding: 'var(--m-space-4)',
      itemGap: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-sm)',
      heading: {
        fg: 'var(--m-color-fg-muted)',
        size: 'var(--m-font-size-xs)',
        weight: '800',
        transform: 'uppercase',
        tracking: '0.05em',
      },
      link: {
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-muted)',
        hoverBg: well,
        activeFg: skyText,
        activeBg: skyTint,
        activeWeight: '800',
        radius: '12px',
        paddingX: 'var(--m-space-4)',
        paddingY: 'calc(0.6875rem * var(--m-density))',
        // The outline, drawn as an inset ring through the indicator shadow
        indicator: { light: '2px #84d8ff', dark: '2px #3f87ab' },
        indicatorWidth: '0',
      },
      count: { bg: '#ff4b4b', fg: onBright, radius: '9999px' },
    },
    navbar: {
      height: '4.375rem',
      bg: 'var(--m-color-bg-canvas)',
      border: 'var(--m-color-border-default)',
      borderWidth: '2px',
      shadow: 'none',
      brandFamily: 'var(--m-font-family-display)',
      brandSize: '2rem',
      brandWeight: '900',
      link: {
        radius: '12px',
        fontSize: 'var(--m-font-size-sm)',
        fontWeight: '800',
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: well,
        activeFg: skyText,
        activeBg: skyTint,
      },
    },
    // Tabs: uppercase heavy labels, grey, the current one blue over a 2px blue line; the segmented
    // control is a pale well with a white, outlined segment
    tabs: {
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: '800',
      textTransform: 'uppercase',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: skyText,
      indicator: { light: '#1899d6', dark: '#49c0f8' },
      indicatorWidth: '2px',
      listBorder: 'var(--m-color-border-default)',
      listBorderWidth: '2px',
      pill: {
        listBg: well,
        listRadius: '14px',
        listPadding: '4px',
        radius: '12px',
        activeBg: 'var(--m-color-bg-surface)',
        activeShadow: { light: 'inset 0 0 0 2px #e5e5e5, 0 2px 0 #e5e5e5', dark: 'inset 0 0 0 2px #37464f, 0 2px 0 #37464f' },
      },
    },
    pagination: {
      radius: '12px',
      fontWeight: '800',
      border: 'var(--m-color-border-default)',
      borderWidth: '2px',
      fg: 'var(--m-color-fg-muted)',
      hoverBg: well,
      currentBg: skyTint,
      currentFg: skyText,
      currentBorder: skyLine,
    },
    // Uppercase blue crumbs with a chevron, as on the help pages
    breadcrumb: {
      separator: '"›"',
      fontSize: 'var(--m-font-size-sm)',
      fg: skyText,
      hoverFg: skyText,
      currentFg: skyText,
      currentWeight: '800',
    },
    badge: {
      height: '1.5rem',
      paddingX: '0.5rem',
      radius: '8px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: '800',
      textTransform: 'uppercase',
      tracking: '0.05em',
      neutral: { bg: well, fg: 'var(--m-color-fg-muted)', border: 'var(--m-color-border-default)' },
    },
    avatar: {
      size: { sm: '2rem', md: '2.75rem', lg: '4rem' },
      bg: skyTint,
      fg: skyText,
      fontWeight: '800',
      border: 'var(--m-color-border-default)',
      borderWidth: '2px',
    },
    divider: { width: '2px', labelTransform: 'uppercase', labelTracking: '0.05em' },
    // Feedback is a pale tint in the tone with a 2px outline of the tone and a heavy title
    alert: {
      borderWidth: '2px',
      accentWidth: '0px',
      radius: '16px',
      padding: 'var(--m-space-4)',
      gap: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: '800',
    },
    toast: {
      bg: 'var(--m-color-bg-raised)',
      fg: 'var(--m-color-fg-default)',
      bodyFg: 'var(--m-color-fg-muted)',
      border: 'var(--m-color-border-default)',
      borderWidth: '2px',
      accentWidth: '0px',
      radius: '16px',
      shadow: 'var(--m-shadow-overlay)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: '800',
    },
    // White with a 2px outline, so a dialog still reads where the scrim is light
    dialog: {
      border: 'var(--m-color-border-default)',
      borderWidth: '2px',
      radius: '16px',
      shadow: 'none',
      padding: 'var(--m-space-6)',
      titleFamily: 'var(--m-font-family-sans)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: '800',
      descriptionFg: 'var(--m-color-fg-muted)',
    },
    popover: {
      border: 'var(--m-color-border-default)',
      borderWidth: '2px',
      radius: '16px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-2)',
      item: {
        height: '2.75rem',
        paddingX: 'var(--m-space-3)',
        radius: '12px',
        fontSize: 'var(--m-font-size-sm)',
        hoverBg: well,
        hoverFg: 'var(--m-color-fg-default)',
      },
      labelFg: 'var(--m-color-fg-muted)',
    },
    // A white bubble with a grey outline, like the reference's speech and hint bubbles
    tooltip: {
      bg: 'var(--m-color-bg-raised)',
      fg: 'var(--m-color-fg-default)',
      radius: '12px',
      shadow: { light: 'inset 0 0 0 2px #e5e5e5, 0 2px 0 #e5e5e5', dark: 'inset 0 0 0 2px #37464f, 0 2px 0 #37464f' },
      paddingX: 'var(--m-space-3)',
      paddingY: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: '700',
    },
    // Thick rounded bars; the green fill is one step darker than the reference's to hold 3:1
    progress: {
      height: { sm: '0.625rem', md: '1rem', lg: '1.25rem' },
      radius: '9999px',
      track: line,
      fill: { light: '#468a00', dark: greenDark },
    },
    accordion: {
      radius: '16px',
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-default)',
      borderWidth: '2px',
      paddingX: 'var(--m-space-6)',
      paddingY: '1.375rem',
      summarySize: 'var(--m-font-size-md)',
      summaryWeight: '600',
      contentFg: 'var(--m-color-fg-muted)',
    },
    skeleton: {
      bg: line,
      highlight: well,
      radius: '8px',
      duration: '1.4s',
    },
    spinner: { color: { light: '#1899d6', dark: '#49c0f8' }, track: line, duration: '0.8s' },
    kbd: {
      radius: '8px',
      border: 'var(--m-color-border-default)',
      borderWidth: '2px',
      shadow: 'var(--m-shadow-sm)',
      fontWeight: '800',
    },
    code: { radius: '12px', inlineRadius: '8px', bg: well, inlineBg: well, border: 'var(--m-color-border-default)' },
    prose: { linkFg: skyText, linkDecoration: 'none', maxWidth: '40rem', h2Border: 'transparent' },
    // Messages are speech bubbles: the other side's in white with a grey outline, the person's in the
    // sky tint with blue text
    chat: {
      radius: '16px',
      borderWidth: '2px',
      userBg: skyTint,
      userFg: 'var(--m-color-fg-default)',
      userBorder: skyLine,
      assistantBg: 'var(--m-color-bg-surface)',
      assistantBorder: 'var(--m-color-border-default)',
      avatarBg: greenTint,
      avatarFg: { light: '#3b7700', dark: greenDark },
    },
    composer: {
      radius: '16px',
      borderWidth: '2px',
      bg: well,
      focusBorder: 'var(--m-color-border-focus)',
      shadow: 'none',
    },
    citation: { chipBg: skyTint, chipFg: skyText, chipRadius: '8px' },
    toolCall: { radius: '16px', borderWidth: '2px', statusRadius: '8px' },
    thinking: { radius: '12px' },
    usage: { radius: '9999px', height: '1rem', okFill: { light: '#468a00', dark: greenDark }, track: line },
  },
});
