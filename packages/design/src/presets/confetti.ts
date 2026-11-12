import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Confetti: a characterful analytics workbench. Warm yellow-grey canvases, white panels with hairline
 * borders, near-black text, an orange-red accent that turns brand yellow in dark mode, and chunky
 * "3D" buttons that stand on a darker bottom ledge and sink when pressed. Dense 14px UI, 6px corners,
 * uppercase bold table headers, a solid 3px ledge under menus and lifted cards. Category: playful.
 * The values are the reference's own published design tokens, read as data, and measured off its
 * site and app screens (see DESIGN.md).
 */

// The app's warm yellow-grey scale (hue 67–78, 8–16% saturation), flattened to hex
const warm = { 25: '#f6f7f3', 50: '#f3f4f0', 100: '#eff0ea', 150: '#e5e7df', 200: '#dbded4' };
// Cool neutrals for dark mode (hue 230–240, 8% saturation)
const cool = { 950: '#131316', 900: '#18181b', 850: '#232429', 800: '#2f3037', 750: '#3b3d45' };

// The tertiary (flat) button's fills: black at 7.5% and 5% over the panel, flattened
const hoverFill = { light: '#ededea', dark: '#2f3035' };
const activeFill = { light: '#f1f2ee', dark: '#2b2c31' };
// The solid bottom ledge under menus, popovers and lifted cards
const ledge = { light: '0 3px 0 #dadbd2', dark: '0 3px 0 #35373e' };

export const confetti = extendTheme(minimal, {
  name: 'confetti',
  label: 'Confetti',
  description:
    'Playful and dense: warm yellow-grey canvases, white hairline panels, an orange-red accent (brand yellow in dark), chunky ledge buttons and bold uppercase table headers.',
  tokens: {
    color: {
      bg: {
        // The app's scene background, its white panels, and the warmer fills behind toolbars
        canvas: { light: warm[50], dark: cool[950] },
        surface: { light: '#ffffff', dark: cool[850] },
        raised: { light: '#ffffff', dark: cool[850] },
        sunken: { light: warm[100], dark: cool[900] },
        overlay: { light: 'rgb(0 0 0 / 0.2)', dark: 'rgb(0 0 0 / 0.5)' },
        // Tooltips: cool charcoal in light, near-white in dark
        inverse: { light: cool[850], dark: '#e6e6e6' },
      },
      fg: {
        default: { light: '#111111', dark: '#e6e6e6' },
        muted: { light: '#404040', dark: '#a6a6a6' },
        subtle: { light: '#666666', dark: '#999999' },
        inverse: { light: '#e6e6e6', dark: '#0d0d0d' },
      },
      border: {
        default: { light: warm[200], dark: cool[800] },
        muted: { light: warm[150], dark: '#26272c' },
        // Control borders: the reference's resting border (#dbded4) is 1.3:1, so this is the nearest
        // step of the same warm grey that reaches the library's 3:1 floor (see the notes)
        strong: { light: '#86887a', dark: '#74778a' },
        focus: { light: '#f54e00', dark: '#f8be2a' },
      },
      accent: {
        // The brand orange-red in light; the brand yellow in dark. Hover and pressed get lighter,
        // as the reference's do (+10% and +15% lightness)
        default: { light: '#f54e00', dark: '#f8be2a' },
        hover: { light: '#ff6d29', dark: '#face5c' },
        active: { light: '#ff7e42', dark: '#fbd574' },
        subtle: { light: '#feede6', dark: '#383329' },
        // Dark text on the accent, as on the reference's yellow buttons (white on the orange is 3.5:1)
        fg: '#111111',
        // Links: the orange one step darker to reach 4.5:1 on white; the reference's dark link amber
        text: { light: '#c03c00', dark: '#f1a82c' },
      },
      // The website's buttons and frames: the amber between the brand orange and yellow
      brand: {
        default: { light: '#eb9d2a', dark: '#f8be2a' },
        fg: '#111111',
        subtle: { light: '#fdf3e4', dark: '#3a3224' },
      },
      success: {
        bg: { light: '#dcfce7', dark: '#052e16' },
        fg: { light: '#15803d', dark: '#4ade80' },
        border: { light: '#4ade80', dark: '#14532d' },
        solid: { light: '#388600', dark: '#388600' },
        onSolid: '#ffffff',
      },
      warning: {
        bg: { light: '#fef9c3', dark: '#422006' },
        fg: { light: '#854d0e', dark: '#facc15' },
        border: { light: '#facc15', dark: '#713f12' },
        solid: { light: '#f7a501', dark: '#f7a501' },
        onSolid: '#111111',
      },
      // The reference's danger is an orange-red (#db3707), not a crimson
      danger: {
        bg: { light: '#fee2e2', dark: '#450a0a' },
        fg: { light: '#b02c05', dark: '#f87171' },
        border: { light: '#f87171', dark: '#7f1d1d' },
        solid: { light: '#db3707', dark: '#db3707' },
        onSolid: '#ffffff',
      },
      // Info is the brand blue (the first data colour)
      info: {
        bg: { light: '#dbeafe', dark: '#172554' },
        fg: { light: '#1d4ed8', dark: '#60a5fa' },
        border: { light: '#60a5fa', dark: '#1e3a8a' },
        solid: { light: '#1d4aff', dark: '#1d4aff' },
        onSolid: '#ffffff',
      },
      // The reference's highlighter yellow
      selection: {
        bg: { light: '#fce6ad', dark: '#5c4b14' },
        fg: { light: '#111111', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // The reference's own face is a proprietary grotesque with softened ends; Inter is the open
        // face closest to it, and the one its own fallback stack names
        sans: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        display: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        mono: '"Source Code Pro", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
      },
      // The app's 14px base: 11/12, 13, 14, 16, 20, 24, 36, 48
      size: {
        xs: '0.75rem',
        sm: '0.8125rem',
        md: '0.875rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2.25rem',
        '4xl': '3rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.2', normal: '1.5715', relaxed: '1.7' },
      tracking: { tight: '-0.025em', normal: '0', wide: '0.04em' },
      body: { weight: '400' },
      heading: { weight: '700', tracking: '-0.025em' },
    },
    control: {
      // Buttons and inputs are 37px (34px plus the 3px ledge); small 33px; large 49px
      height: {
        sm: 'calc(2.0625rem * var(--m-density))',
        md: 'calc(2.3125rem * var(--m-density))',
        lg: 'calc(3.0625rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.5rem * var(--m-density))',
        md: 'calc(0.75rem * var(--m-density))',
        lg: 'calc(1rem * var(--m-density))',
      },
      fontSize: '0.875rem',
    },
    // 4px small parts, 6px controls and panels, 10px popovers
    radius: { sm: '4px', md: '6px', lg: '10px', control: '6px', container: '6px' },
    shadow: {
      sm: { light: '0 1px 2px rgb(0 0 0 / 0.05)', dark: '0 1px 2px rgb(0 0 0 / 0.4)' },
      // Cards: the solid 3px ledge (lifted cards and dashboards tiles)
      md: ledge,
      // Menus and popovers: the same ledge
      lg: ledge,
      // Dialogs: a short, dark drop under the bottom edge
      overlay: {
        light: '0 16px 16px -16px rgb(0 0 0 / 0.35), 0 3px 0 #dadbd2',
        dark: '0 16px 16px -16px rgb(0 0 0 / 0.7), 0 3px 0 #35373e',
      },
    },
    focus: { width: '2px', offset: '1px' },
    motion: {
      duration: { fast: '100ms', normal: '200ms', slow: '400ms' },
      easing: { standard: 'ease', emphasized: 'cubic-bezier(0, 0.5, 0.5, 1)' },
    },
  },
  components: {
    // Full-width scenes with a 16px gutter; a 215px navigation column
    layout: {
      containerMax: { sm: '36rem', md: '52rem', lg: '90rem' },
      containerPadding: '1rem',
      gridGap: 'var(--m-space-4)',
      splitSide: '13.4375rem',
      splitGap: '0',
    },
    // The chunky button: a face with a 1px border, standing on a 3px ledge that darkens the face
    // colour (an inset shadow, so every variant gets its own ledge). Hover lifts it; pressing sinks
    // it. Primary is the brand amber (yellow in dark), secondary is white, tertiary (ghost) is flat.
    button: {
      fontWeight: 'var(--m-font-weight-medium)',
      shadow: { light: 'inset 0 -3px 0 rgb(0 0 0 / 0.13)', dark: 'inset 0 -3px 0 rgb(0 0 0 / 0.4)' },
      hoverShadow: { light: 'inset 0 -3px 0 rgb(0 0 0 / 0.13)', dark: 'inset 0 -3px 0 rgb(0 0 0 / 0.4)' },
      activeShadow: { light: 'inset 0 -1px 0 rgb(0 0 0 / 0.13)', dark: 'inset 0 -1px 0 rgb(0 0 0 / 0.4)' },
      hoverTransform: 'translateY(-1px)',
      activeTransform: 'translateY(1px)',
      disabledOpacity: '0.65',
      primary: {
        bg: { light: '#eb9d2a', dark: '#f8be2a' },
        fg: '#111111',
        border: { light: '#b17816', dark: '#b17816' },
        hoverBg: { light: '#eb9d2a', dark: '#f8be2a' },
        activeBg: { light: '#e7962a', dark: '#f5b81f' },
      },
      secondary: {
        bg: 'var(--m-color-bg-surface)',
        fg: 'var(--m-color-fg-default)',
        border: { light: '#cccccc', dark: '#4a4c52' },
        hoverBg: 'var(--m-color-bg-surface)',
        activeBg: 'var(--m-color-bg-surface)',
      },
      ghost: { fg: 'var(--m-color-fg-default)', hoverBg: hoverFill, activeBg: activeFill },
      // Danger is an outlined orange-red button on white, standing on the same ledge
      danger: {
        bg: 'var(--m-color-bg-surface)',
        fg: { light: '#b02c05', dark: '#ff7b47' },
        border: { light: '#e96b30', dark: '#c44003' },
        hoverBg: { light: '#fcebe6', dark: '#3a2721' },
        activeBg: { light: '#fae2da', dark: '#43291f' },
      },
    },
    // Inputs: 37px, white, 6px corners, a hairline that darkens on hover and focus
    input: {
      bg: 'var(--m-color-bg-surface)',
      hoverBorder: { light: '#6b6d61', dark: '#9a9dae' },
      focusBorder: { light: '#6b6d61', dark: '#9a9dae' },
      invalidBorder: 'var(--m-color-danger-solid)',
      shadow: 'none',
      paddingX: {
        sm: 'calc(0.25rem * var(--m-density))',
        md: 'calc(0.5rem * var(--m-density))',
        lg: 'calc(0.75rem * var(--m-density))',
      },
      paddingY: '0.25rem',
    },
    select: { bg: 'var(--m-color-bg-surface)' },
    field: {
      gap: '0.375rem',
      labelFontSize: 'var(--m-font-size-md)',
      labelFontWeight: 'var(--m-font-weight-semibold)',
      hintFg: 'var(--m-color-fg-muted)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFontWeight: 'var(--m-font-weight-medium)',
    },
    // 16px boxes with a 1.5px border and 4px corners; the tick is the panel colour
    checkbox: {
      size: '1rem',
      radius: '4px',
      borderWidth: '1.5px',
      hoverBorder: 'var(--m-color-accent-hover)',
      mark: { light: '#ffffff', dark: cool[850] },
    },
    // The tiny switch: 28 × 15 with a 13px knob; orange (yellow in dark) when on
    switch: {
      width: '1.75rem',
      height: '0.9375rem',
      smWidth: '1.25rem',
      smHeight: '0.6875rem',
      thumbInset: '1px',
      trackBg: { light: '#8a8c99', dark: '#6b6e7e' },
      thumbBg: '#ffffff',
      thumbCheckedBg: { light: '#ffffff', dark: cool[850] },
      thumbShadow: 'none',
    },
    // Panels: white, a hairline, 6px corners, no shadow; a clickable one lifts onto the ledge
    card: {
      border: 'var(--m-color-border-default)',
      shadow: 'none',
      hoverShadow: 'var(--m-shadow-md)',
      hoverBorder: 'var(--m-color-border-default)',
      hoverTransform: 'scale(1.01)',
      padding: { sm: 'var(--m-space-3)', md: 'var(--m-space-4)', lg: 'var(--m-space-6)' },
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-bold)',
      outline: { bg: 'transparent', border: 'var(--m-color-border-default)' },
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'var(--m-color-border-default)' },
    },
    // Tables: a white framed panel; 12px bold uppercase headers on white; 40px rows with hairlines
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: '0.75rem',
      cellPaddingY: '0.5rem',
      headerBg: 'var(--m-color-bg-surface)',
      headerFg: 'var(--m-color-fg-default)',
      headerFontSize: 'var(--m-font-size-xs)',
      headerFontWeight: 'var(--m-font-weight-bold)',
      headerTransform: 'uppercase',
      headerTracking: '0.04em',
      rowHoverBg: { light: '#f9faf7', dark: '#2a2b30' },
      stripeBg: { light: '#f9faf7', dark: '#26272c' },
      wrapRadius: '6px',
    },
    // The warm navigation column: 215px, 14px items with coloured icons, the current one filled
    sidebar: {
      width: '13.4375rem',
      bg: { light: warm[150], dark: cool[950] },
      border: 'var(--m-color-border-default)',
      padding: '0.375rem',
      sectionGap: 'var(--m-space-3)',
      itemGap: '0px',
      fontSize: 'var(--m-font-size-md)',
      link: {
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#d5d7cf', dark: '#24252a' },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: '#dadcd4', dark: '#202125' },
        activeWeight: 'var(--m-font-weight-medium)',
        radius: '6px',
        paddingX: '0.375rem',
        paddingY: 'calc(0.3125rem * var(--m-density))',
      },
      heading: {
        fg: { light: '#595959', dark: '#a6a6a6' },
        size: 'var(--m-font-size-sm)',
        weight: 'var(--m-font-weight-semibold)',
        transform: 'none',
        tracking: '0',
      },
      count: {
        bg: { light: '#f3f4f0', dark: cool[850] },
        fg: { light: '#404040', dark: '#a6a6a6' },
        radius: '4px',
      },
    },
    // The site's taskbar: a warm strip, small 13px medium links in 28px rounded boxes
    navbar: {
      height: 'calc(3rem * var(--m-density))',
      bg: { light: warm[150], dark: cool[900] },
      border: 'var(--m-color-border-default)',
      brandWeight: 'var(--m-font-weight-bold)',
      brandSize: 'var(--m-font-size-lg)',
      link: {
        height: '1.75rem',
        paddingX: '0.5rem',
        radius: '4px',
        fontSize: 'var(--m-font-size-sm)',
        fontWeight: 'var(--m-font-weight-medium)',
        fg: { light: '#23251d', dark: '#e6e6e6' },
        hoverFg: { light: '#111111', dark: '#ffffff' },
        hoverBg: { light: '#d5d7cf', dark: '#2f3035' },
        activeFg: { light: '#111111', dark: '#ffffff' },
        activeBg: { light: '#dadcd4', dark: '#2b2c31' },
      },
    },
    // Tabs: grey 14px labels about 32px apart over a hairline; the current one in the accent with a
    // 2px accent bar. The segmented control is a row of joined segments, the current one white and
    // framed in dark amber on an amber ledge
    tabs: {
      height: '2.5rem',
      paddingX: '1rem',
      listGap: '0',
      fontWeight: 'var(--m-font-weight-regular)',
      fg: 'var(--m-color-fg-subtle)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-accent-text)',
      indicator: 'var(--m-color-accent-default)',
      indicatorWidth: '2px',
      pill: {
        listBg: { light: warm[100], dark: cool[900] },
        listRadius: '6px',
        listPadding: '0',
        radius: '6px',
        activeBg: 'var(--m-color-bg-surface)',
        activeShadow: {
          light: '0 0 0 1px #b17816, inset 0 -3px 0 #eb9d2a',
          dark: '0 0 0 1px #b17816, inset 0 -3px 0 #926826',
        },
      },
    },
    pagination: {
      radius: '6px',
      fg: 'var(--m-color-fg-default)',
      hoverBg: hoverFill,
      currentBg: 'var(--m-color-bg-surface)',
      currentFg: 'var(--m-color-fg-default)',
      currentBorder: 'var(--m-color-border-strong)',
    },
    breadcrumb: {
      separator: '"/"',
      fontSize: 'var(--m-font-size-sm)',
      fg: 'var(--m-color-fg-subtle)',
      hoverFg: 'var(--m-color-fg-default)',
      currentFg: 'var(--m-color-fg-default)',
      currentWeight: 'var(--m-font-weight-semibold)',
    },
    // Tags: 11px medium, a 1px border, 6px corners, tight padding
    badge: {
      height: '1.25rem',
      paddingX: '0.25rem',
      gap: '0.125rem',
      radius: '6px',
      fontSize: '0.6875rem',
      fontWeight: 'var(--m-font-weight-medium)',
      neutral: {
        bg: 'var(--m-color-bg-surface)',
        fg: 'var(--m-color-fg-muted)',
        border: 'var(--m-color-border-default)',
        solidBg: { light: '#111111', dark: '#e6e6e6' },
        solidFg: { light: '#ffffff', dark: '#111111' },
      },
    },
    // Lettermarks: initials in a deep plum on lilac
    avatar: {
      size: { sm: '1.125rem', md: '1.5rem', lg: '2.5rem' },
      bg: '#dcb1e3',
      fg: '#572e5e',
      fontWeight: 'var(--m-font-weight-semibold)',
      ringColor: 'var(--m-color-bg-surface)',
    },
    // Banners: the tone's tint with the tone's border, 6px corners, 8px padding, medium text
    alert: {
      borderWidth: '1px',
      accentWidth: '0px',
      radius: '6px',
      padding: 'var(--m-space-2) var(--m-space-3)',
      gap: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    toast: {
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-default)',
      borderWidth: '1px',
      accentWidth: '0px',
      radius: '6px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
      width: '26rem',
    },
    // Modals: white, a darker 1px border, 6px corners, a bold 18px title over a hairline
    dialog: {
      bg: 'var(--m-color-bg-surface)',
      border: { light: '#c2c2c2', dark: '#3f4046' },
      radius: '6px',
      padding: 'var(--m-space-4)',
      gap: 'var(--m-space-4)',
      titleFamily: 'var(--m-font-family-sans)',
      titleSize: '1.125rem',
      titleWeight: 'var(--m-font-weight-bold)',
      width: { sm: '28rem', md: '36rem', lg: '52rem' },
      enterTransform: 'scale(0.98)',
    },
    // Menus: white, a hairline, 10px corners, the solid ledge, flat 33px rows
    popover: {
      bg: 'var(--m-color-bg-surface)',
      radius: '10px',
      shadow: 'var(--m-shadow-lg)',
      padding: '0.25rem',
      item: {
        height: '2.0625rem',
        paddingX: '0.5rem',
        radius: '6px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: hoverFill,
      },
      labelSize: 'var(--m-font-size-xs)',
    },
    tooltip: {
      radius: '6px',
      shadow: '0 16px 16px -16px rgb(0 0 0 / 0.35)',
      paddingX: 'var(--m-space-2)',
      paddingY: 'var(--m-space-1)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
      delay: '100ms',
    },
    progress: {
      height: { sm: '0.25rem', md: '0.375rem', lg: '0.5rem' },
      radius: '9999px',
      track: 'var(--m-color-bg-sunken)',
      fill: 'var(--m-color-accent-default)',
    },
    accordion: {
      radius: '6px',
      paddingX: 'var(--m-space-3)',
      paddingY: 'var(--m-space-2)',
      summarySize: 'var(--m-font-size-md)',
      summaryWeight: 'var(--m-font-weight-semibold)',
      hoverBg: hoverFill,
      contentFg: 'var(--m-color-fg-default)',
    },
    divider: { labelTransform: 'uppercase', labelFontSize: 'var(--m-font-size-xs)' },
    // The shimmer runs from pale to a darker grey and back, over 2s
    skeleton: {
      bg: { light: '#e9eae5', dark: '#2a2b30' },
      highlight: { light: '#dcddd8', dark: '#35363c' },
      radius: '6px',
      duration: '2s',
    },
    spinner: { color: 'var(--m-color-accent-default)', track: 'var(--m-color-border-default)', duration: '1s' },
    // Shortcut keys: white keycaps with a 2px bottom edge
    kbd: {
      fontFamily: 'var(--m-font-family-sans)',
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-strong)',
      radius: '4px',
      shadow: 'inset 0 -1px 0 var(--m-color-border-strong)',
      height: '1.25rem',
      paddingX: '0.25rem',
    },
    code: {
      radius: '6px',
      bg: 'var(--m-color-bg-sunken)',
      headerBg: 'var(--m-color-bg-surface)',
      inlineBg: 'var(--m-color-bg-sunken)',
      inlineRadius: '4px',
      fontSize: 'var(--m-font-size-sm)',
      string: { light: '#166534', dark: '#4ade80' },
      stringExpression: { light: '#166534', dark: '#4ade80' },
    },
    prose: {
      linkFg: 'var(--m-color-accent-text)',
      maxWidth: '44rem',
      h2Border: 'var(--m-color-border-default)',
      quoteBorder: 'var(--m-color-border-default)',
      quoteBorderWidth: '3px',
    },
    // The assistant: your messages in a white bordered bubble, the replies straight on the panel
    chat: {
      radius: '6px',
      userBg: 'var(--m-color-bg-surface)',
      userBorder: 'var(--m-color-border-default)',
      assistantBg: 'transparent',
      assistantBorder: 'transparent',
      avatarRadius: '6px',
    },
    composer: { radius: '6px', shadow: 'none' },
    citation: { chipRadius: '4px' },
    toolCall: { radius: '6px', statusRadius: '4px' },
    thinking: { radius: '6px' },
    usage: { radius: '9999px', height: '0.375rem', okFill: 'var(--m-color-accent-default)' },
  },
});
