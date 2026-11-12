import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Keel: a commerce back office. A near-black frame holds the side navigation; the work sits on a white
 * page with rounded corners. Ink text at 13px, ink pill buttons with a soft inner glow, flat grey
 * secondaries, 20px containers on a hairline ring shadow, index tables with a grey header row, and
 * small status badges in yellow, green, cyan and pink. Category: marketplace. The values are the
 * reference's published component runtime and tokens (read as data) and its own product images,
 * measured (see DESIGN.md).
 */

// The frame (the side navigation's ground) is the same near-black in both modes
const frame = '#0a0a0a';
// Flat grey fills: the secondary button, chips, the segmented track
const fill = { light: '#ebebeb', dark: '#2f2f2f' };
const fillHover = { light: '#dddddd', dark: '#373737' };
const fillActive = { light: '#d0d0d0', dark: '#414141' };
// The quiet hover and selected fill on white: black at 5%
const quiet = { light: '#f2f2f2', dark: '#262626' };
// The control border: the reference's input-border token (light); the dark one stepped to pass 3:1
const control = { light: '#8c8c8c', dark: '#6b6b6b' };

// The ink pill's raised look: a soft four-step drop, an ink rim and a white inner glow
const primaryShadow = {
  light:
    '0 1px 0.5px -0.5px rgb(0 0 0 / 0.13), 0 1px 2px -0.5px rgb(0 0 0 / 0.13), 0 4px 6px -2px rgb(0 0 0 / 0.13), 0 2px 3px -1.5px rgb(0 0 0 / 0.13), inset 0 0 4px 1px #101010, inset 0 0 4px 2px rgb(255 255 255 / 0.1), inset 0 0 12px -6px rgb(255 255 255 / 0.75)',
  // On dark the primary is white with a grey bevel under it
  dark: 'inset 0 -1px 0 0 #aaaaaa, inset 0 0 0 1px rgb(0 0 0 / 0.1), inset 0 0.5px 0 1.5px #fcfcfc',
};
const primaryPressed = {
  light:
    '0 1px 0.5px -0.5px rgb(0 0 0 / 0.13), inset 0 0 12px -6px rgb(255 255 255 / 0.75), inset 0 0 4px 2px rgb(255 255 255 / 0.1), inset 0 0 4px 1px #101010',
  dark: 'inset -1px 0 1px 0 rgb(26 26 26 / 0.12), inset 1px 0 1px 0 rgb(26 26 26 / 0.12), inset 0 2px 1px 0 rgb(26 26 26 / 0.2)',
};
// The flat grey button presses in
const pressedIn = {
  light:
    'inset 0 2px 6px -1px rgb(0 0 0 / 0.07), inset 0 3px 2px -2px rgb(0 0 0 / 0.05), inset 0 2px 3px -2px rgb(0 0 0 / 0.03), inset 0 1px 1px -0.5px rgb(0 0 0 / 0.06), inset 0 0 0 0.5px rgb(0 0 0 / 0.05)',
  dark: 'inset 0 2px 1px 0 rgb(0 0 0 / 0.3)',
};
const dangerShadow = {
  light:
    '0 1px 0.5px -0.5px rgb(229 0 0 / 0.16), 0 1px 2px -0.5px rgb(229 0 0 / 0.16), 0 4px 6px -2px rgb(229 0 0 / 0.16), 0 2px 3px -1.5px rgb(255 0 0 / 0.1), inset 0 0 4px 1px #f50000, inset 0 0 4px 2px rgb(255 255 255 / 0.1), inset 0 0 12px -6px rgb(255 255 255 / 0.75)',
  dark: 'inset 0 -1px 0 1px rgb(142 11 33 / 0.8), inset 0 0 0 1px rgb(163 10 36 / 0.8), inset 0 0.5px 0 1.5px rgb(247 128 134 / 0.64)',
};
const dangerPressed = {
  light:
    '0 1px 0.5px -0.5px rgb(0 0 0 / 0.13), inset 0 0 12px -6px rgb(255 255 255 / 0.75), inset 0 0 4px 2px rgb(255 255 255 / 0.1), inset 0 0 4px 1px #e0000b',
  dark: 'inset -1px 0 1px 0 rgb(0 0 0 / 0.2), inset 1px 0 1px 0 rgb(0 0 0 / 0.2), inset 0 2px 0 0 rgb(0 0 0 / 0.6)',
};
// Fields: a soft drop under the control border
const inputShadow = {
  light: '0 2px 3px -1px rgb(0 0 0 / 0.04), 0 3px 4px -1.5px rgb(0 0 0 / 0.04)',
  dark: 'none',
};
// The selected item in the frame: a faint inner light
const navSelected =
  'inset 0 0 0 1px rgb(255 255 255 / 0.02), inset 0 1px 1px 0 rgb(255 255 255 / 0.06), inset 0 0 12px 1px rgb(255 255 255 / 0.06), 0 1px 2px 0 rgb(0 0 0 / 0.1), 0 0 0 1px rgb(0 0 0 / 0.1)';

export const keel = extendTheme(minimal, {
  name: 'keel',
  label: 'Keel',
  description:
    'Commerce back office: a near-black side frame around a white page, 13px ink type, ink pill buttons with an inner glow, flat grey secondaries, 20px containers on a hairline ring, index tables with bulk actions and small status badges.',
  tokens: {
    color: {
      bg: {
        // The page is white; containers are white on a ring shadow, and quiet panels are grey
        canvas: { light: '#ffffff', dark: '#0a0a0a' },
        surface: { light: '#ffffff', dark: '#1a1a1a' },
        raised: { light: '#ffffff', dark: '#262626' },
        sunken: { light: '#f7f7f7', dark: '#222222' },
        overlay: { light: 'rgb(0 0 0 / 0.71)', dark: 'rgb(0 0 0 / 0.71)' },
        inverse: { light: '#1b1b1b', dark: '#303030' },
      },
      fg: {
        default: { light: '#101010', dark: '#eeeeee' },
        muted: { light: '#4a4a4a', dark: '#aaaaaa' },
        subtle: { light: '#606060', dark: '#8c8c8c' },
        inverse: { light: '#f7f7f7', dark: '#e3e3e3' },
      },
      border: {
        // Hairlines: #dddddd round fields and tables, #f2f2f2 between rows
        default: { light: '#dddddd', dark: '#2f2f2f' },
        muted: { light: '#f2f2f2', dark: '#262626' },
        strong: control,
        focus: { light: '#5083f0', dark: '#97adff' },
      },
      accent: {
        // The one action is ink (white on dark); links are the blue
        default: { light: '#101010', dark: '#fcfcfc' },
        hover: { light: '#0a0a0a', dark: '#eeeeee' },
        active: { light: '#000000', dark: '#dddddd' },
        subtle: quiet,
        fg: { light: '#ffffff', dark: '#121212' },
        text: { light: '#1650d0', dark: '#c5d0ff' },
      },
      // The marketing pages' leaf green: plan taglines, the yearly switch, highlights on the dark site.
      // The product itself is black and white; green never fills an action.
      brand: {
        default: '#95bf47',
        fg: '#02090a',
        subtle: { light: '#eef6e3', dark: '#1d2a10' },
      },
      // Tints for banners; the solid steps are the badge fills, with the badge text on them
      success: {
        bg: { light: '#e8fcd9', dark: '#073630' },
        fg: { light: '#214b03', dark: '#2ced83' },
        border: { light: '#c2f59e', dark: '#014b40' },
        solid: { light: '#b3f782', dark: '#014b40' },
        onSolid: { light: '#214b03', dark: '#2ced83' },
      },
      // Warning is the reference's yellow "caution" (unfulfilled, needs attention)
      warning: {
        bg: { light: '#fff5c5', dark: '#332e00' },
        fg: { light: '#574100', dark: '#ffeb78' },
        border: { light: '#ffef9d', dark: '#4f4700' },
        solid: { light: '#ffe45c', dark: '#4f4700' },
        onSolid: { light: '#574100', dark: '#ffeb78' },
      },
      danger: {
        bg: { light: '#ffe7e6', dark: '#2f040b' },
        fg: { light: '#7e100c', dark: '#f78086' },
        border: { light: '#f89996', dark: '#8e0b21' },
        solid: { light: '#d82019', dark: '#c70a24' },
        onSolid: '#ffffff',
      },
      info: {
        bg: { light: '#d2f6fe', dark: '#003a5a' },
        fg: { light: '#01596f', dark: '#a8d8ff' },
        // The info icon's sky (#00b0de): also the first series in charts and sparklines
        border: { light: '#00b0de', dark: '#4fc3f7' },
        solid: { light: '#8ce1f8', dark: '#003a5a' },
        onSolid: { light: '#01596f', dark: '#a8d8ff' },
      },
      selection: {
        bg: { light: '#cddbf9', dark: '#1347b9' },
        fg: { light: '#101010', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // A custom cut of a neutral grotesque; the open original is the stand-in
        sans: '"Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        display: '"Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif',
        mono: '"Roboto Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
      },
      // 11, 12, 13 (body), 15, 22, 26 (page titles), 29, 36
      size: {
        xs: '11px',
        sm: '12px',
        md: '13px',
        lg: '15px',
        xl: '22px',
        '2xl': '26px',
        '3xl': '29px',
        '4xl': '36px',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '600' },
      leading: { tight: '1.24', normal: '1.54', relaxed: '1.6' },
      tracking: { tight: '-0.02em', normal: '0', wide: '0.02em' },
      body: { weight: '400' },
      heading: { weight: '500', tracking: '-0.02em' },
    },
    control: {
      height: {
        sm: 'calc(24px * var(--m-density))',
        md: 'calc(28px * var(--m-density))',
        lg: 'calc(36px * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(8px * var(--m-density))',
        md: 'calc(12px * var(--m-density))',
        lg: 'calc(16px * var(--m-density))',
      },
    },
    // A 4px unit, in pixels: the page root takes the 13px body size, so rem would shrink everything
    space: { unit: '4px' },
    // Tags 6px, fields 10px, containers and dialogs 20px; every action is a pill
    radius: { sm: '6px', md: '10px', lg: '20px' },
    shadow: {
      // The page-header button and toolbar ring: a 7% hairline with long faint drops
      sm: {
        light:
          '0 0 0 1px rgb(0 0 0 / 0.07), 0 2px 20px 0 rgb(0 0 0 / 0.03), 0 5px 20px 0 rgb(0 0 0 / 0.03), 0 8px 60px 0 rgb(0 0 0 / 0.03)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.09)',
      },
      // Containers: a 2px 24% ring, then three very faint drops
      md: {
        light:
          '0 0 2px 0 rgb(0 0 0 / 0.24), 0 2px 12px 0 rgb(0 0 0 / 0.02), 0 4px 16px 0 rgb(0 0 0 / 0.02), 0 4px 48px 0 rgb(0 0 0 / 0.02)',
        dark: '0 0 0 1px rgb(220 220 220 / 0.14), 0 1px 0 0 rgb(255 255 255 / 0.03), 0 2.5px 0.5px 0 rgb(0 0 0 / 0.34), 0 4px 4px -1.5px rgb(0 0 0 / 0.12), 0 5px 5px -2.5px rgb(0 0 0 / 0.24)',
      },
      // Popovers and menus
      lg: {
        light:
          '0 2px 2px -1px rgb(0 0 0 / 0.06), 0 3px 4px -2px rgb(0 0 0 / 0.06), 0 6px 8px -3px rgb(0 0 0 / 0.06), 0 12px 16px -4px rgb(0 0 0 / 0.06), 0 0 0 1px rgb(0 0 0 / 0.08)',
        dark: '0 0 0 1px rgb(220 220 220 / 0.18), 0 1px 2px 0 rgb(0 0 0 / 0.15), 0 3px 6px -5px rgb(0 0 0 / 0.15), 0 8px 24px -8px rgb(0 0 0 / 0.84)',
      },
      // Dialogs
      overlay: {
        light:
          '0 2px 3px -1px rgb(0 0 0 / 0.06), 0 4px 6px -2px rgb(0 0 0 / 0.06), 0 8px 12px -4px rgb(0 0 0 / 0.06), 0 16px 24px -6px rgb(0 0 0 / 0.06), 0 32px 48px -8px rgb(0 0 0 / 0.06), 0 0 0 1px rgb(0 0 0 / 0.08)',
        dark: '0 0 0 1px rgb(220 220 220 / 0.18), 0 1px 2px 0 rgb(0 0 0 / 0.15), 0 3px 6px -3px rgb(0 0 0 / 0.24), 0 20px 32px -12px rgb(0 0 0 / 0.6)',
      },
    },
    focus: { width: '2px', offset: '1px' },
    motion: {
      duration: { fast: '100ms', normal: '200ms', slow: '300ms' },
      easing: { standard: 'cubic-bezier(0.25, 0.1, 0.25, 1)', emphasized: 'cubic-bezier(0.2, 0.8, 0, 1)' },
    },
  },
  components: {
    // A wide work column: 992px for index and detail pages, 640px for settings and forms
    layout: {
      containerMax: { sm: '512px', md: '720px', lg: '992px' },
      containerPadding: 'clamp(16px, 4vw, 32px)',
      gridGap: 'var(--m-space-4)',
      stackGap: 'var(--m-space-4)',
      splitSide: '224px',
    },
    // Ink pills that sit slightly raised; flat grey pills for the rest; each variant has its own shadow
    button: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-medium)',
      gap: 'var(--m-space-1)',
      primary: {
        border: 'transparent',
        shadow: primaryShadow,
        hoverShadow: primaryShadow,
        activeShadow: primaryPressed,
      },
      secondary: {
        bg: fill,
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        hoverBg: fillHover,
        activeBg: fillActive,
        shadow: 'none',
        hoverShadow: 'none',
        activeShadow: pressedIn,
      },
      ghost: {
        hoverBg: quiet,
        activeBg: fill,
        shadow: 'none',
        hoverShadow: 'none',
        activeShadow: 'none',
      },
      danger: {
        border: 'transparent',
        hoverBg: { light: '#ce1f18', dark: '#a30a24' },
        activeBg: { light: '#b31a14', dark: '#8e0b21' },
        shadow: dangerShadow,
        hoverShadow: dangerShadow,
        activeShadow: dangerPressed,
      },
    },
    // Containers float on the ring shadow: no drawn border, 20px corners, 16px padding
    card: {
      border: 'transparent',
      shadow: 'var(--m-shadow-md)',
      padding: { sm: 'var(--m-space-3)', md: 'var(--m-space-4)', lg: 'var(--m-space-5)' },
      gap: 'var(--m-space-3)',
      titleSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-medium)',
      descriptionSize: 'var(--m-font-size-md)',
      hoverShadow: 'var(--m-shadow-lg)',
      hoverBorder: 'transparent',
      hoverTransform: 'none',
      outline: { border: 'var(--m-color-border-default)' },
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    input: {
      fontSize: 'var(--m-font-size-md)',
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: '#606060', dark: '#8c8c8c' },
      focusBorder: 'var(--m-color-border-focus)',
      invalidBorder: { light: '#e2221a', dark: '#f78086' },
      disabledBg: 'var(--m-color-bg-sunken)',
      shadow: inputShadow,
      height: {
        sm: 'calc(24px * var(--m-density))',
        md: 'calc(30px * var(--m-density))',
        lg: 'calc(36px * var(--m-density))',
      },
      paddingX: { md: 'calc(10px * var(--m-density))' },
      paddingY: 'var(--m-space-1)',
    },
    field: {
      gap: 'var(--m-space-1)',
      labelFontSize: 'var(--m-font-size-md)',
      labelFontWeight: 'var(--m-font-weight-medium)',
      hintFg: 'var(--m-color-fg-muted)',
      hintFontSize: 'var(--m-font-size-md)',
      errorFontWeight: 'var(--m-font-weight-regular)',
      requiredMarker: '""',
    },
    // Checked controls are ink, not blue
    checkbox: {
      size: '16px',
      radius: '4px',
      border: 'var(--m-color-border-strong)',
      hoverBorder: 'var(--m-color-fg-muted)',
      invalidBorder: { light: '#e2221a', dark: '#f78086' },
    },
    switch: {
      width: '32px',
      height: '18px',
      smWidth: '28px',
      smHeight: '16px',
      trackBg: 'var(--m-color-border-strong)',
      thumbShadow:
        '0 1px 1px -0.5px rgb(0 0 0 / 0.06), 0 2px 2px -1px rgb(0 0 0 / 0.06), 0 4px 4px -2px rgb(0 0 0 / 0.06), 0 2px 8px 0 rgb(0 0 0 / 0.06)',
    },
    // Index tables: a grey header row, #f2f2f2 hairlines between rows, a grey row on hover
    table: {
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: 'var(--m-space-3)',
      cellPaddingY: 'calc(var(--m-space-1) * 1.5 * var(--m-density))',
      compactPaddingY: 'var(--m-space-1)',
      borderColor: 'var(--m-color-border-muted)',
      headerBg: 'var(--m-color-bg-sunken)',
      headerFg: 'var(--m-color-fg-muted)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-medium)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      rowHoverBg: 'var(--m-color-bg-sunken)',
      stripeBg: 'var(--m-color-bg-sunken)',
      wrapBorder: 'transparent',
      wrapRadius: 'var(--m-radius-lg)',
      wrapShadow: 'var(--m-shadow-md)',
    },
    // The frame: near-black, grey text, a lit pill for the current page, counts in a translucent pill
    sidebar: {
      width: '224px',
      bg: frame,
      border: 'transparent',
      padding: 'var(--m-space-2)',
      sectionGap: 'var(--m-space-4)',
      itemGap: '2px',
      fontSize: 'var(--m-font-size-md)',
      nestedIndent: 'var(--m-space-6)',
      guide: 'transparent',
      heading: {
        fg: '#8c8c8c',
        size: 'var(--m-font-size-sm)',
        weight: 'var(--m-font-weight-medium)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: '#d0d0d0',
        hoverFg: '#f7f7f7',
        hoverBg: '#151515',
        activeFg: '#f7f7f7',
        activeBg: '#232323',
        activeWeight: 'var(--m-font-weight-medium)',
        radius: 'var(--m-radius-md)',
        paddingX: 'var(--m-space-2)',
        paddingY: 'calc(var(--m-space-1) * var(--m-density))',
      },
      count: { bg: '#383838', fg: '#d0d0d0', radius: '9999px' },
    },
    // Public pages: a white bar with ink links and the ink pill
    navbar: {
      height: 'calc(56px * var(--m-density))',
      border: 'transparent',
      link: {
        fontSize: 'var(--m-font-size-md)',
        fg: 'var(--m-color-fg-default)',
        hoverBg: quiet,
        activeFg: 'var(--m-color-fg-default)',
        activeBg: quiet,
        radius: '9999px',
      },
      brandFamily: 'var(--m-font-family-sans)',
      brandWeight: 'var(--m-font-weight-semibold)',
    },
    breadcrumb: { fontSize: 'var(--m-font-size-md)', currentWeight: 'var(--m-font-weight-medium)' },
    pagination: {
      radius: '9999px',
      hoverBg: quiet,
      currentBg: fill,
      currentFg: 'var(--m-color-fg-default)',
      currentBorder: 'transparent',
    },
    // Underlined tabs for detail pages; the segmented control is a grey track with a white segment
    tabs: {
      height: 'calc(28px * var(--m-density))',
      paddingX: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-md)',
      fontWeight: 'var(--m-font-weight-medium)',
      listBorder: 'var(--m-color-border-muted)',
      indicator: 'var(--m-color-fg-default)',
      pill: {
        listBg: quiet,
        listRadius: 'var(--m-radius-md)',
        listPadding: '2px',
        radius: '8px',
        activeBg: { light: '#ffffff', dark: '#373737' },
        activeShadow: 'var(--m-shadow-sm)',
      },
    },
    // Badges: 20px, 6px corners, 12px medium, no border
    badge: {
      height: '20px',
      paddingX: '6px',
      radius: '6px',
      borderWidth: '0px',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-medium)',
      neutral: {
        bg: fill,
        fg: { light: '#4a4a4a', dark: '#dcdcdc' },
        border: 'transparent',
        solidBg: { light: '#101010', dark: '#fcfcfc' },
        solidFg: { light: '#ffffff', dark: '#121212' },
      },
    },
    // A rounded square for people and shops, in the reference's blue
    avatar: {
      size: { sm: '24px', md: '32px', lg: '40px' },
      radius: 'clamp(6px, 30%, 12px)',
      bg: { light: '#195ae8', dark: '#51c0ff' },
      fg: { light: '#ffffff', dark: '#002133' },
      fontWeight: 'var(--m-font-weight-medium)',
    },
    // Banners: the tone's tint, 12px corners, the container ring, no drawn border
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '12px',
      shadow: 'var(--m-shadow-md)',
      padding: 'var(--m-space-3)',
      gap: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // Toasts are dark pills of text at the bottom of the page
    toast: {
      bg: 'var(--m-color-bg-inverse)',
      fg: 'var(--m-color-fg-inverse)',
      bodyFg: { light: '#cccccc', dark: '#b5b5b5' },
      border: 'transparent',
      accentWidth: '0px',
      radius: '12px',
      shadow:
        '0 2px 4px -1px rgb(0 0 0 / 0.08), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 8px 16px -4px rgb(0 0 0 / 0.08), 0 16px 32px -8px rgb(0 0 0 / 0.08), 0 0 0 1px rgb(0 0 0 / 0.08)',
      padding: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-medium)',
    },
    dialog: {
      border: 'transparent',
      radius: '20px',
      padding: 'var(--m-space-4)',
      gap: 'var(--m-space-3)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-semibold)',
      width: { sm: '400px', md: '620px', lg: '980px' },
    },
    popover: {
      border: 'transparent',
      radius: '12px',
      shadow: 'var(--m-shadow-lg)',
      padding: '6px',
      item: {
        height: 'calc(28px * var(--m-density))',
        paddingX: 'var(--m-space-2)',
        radius: '8px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: quiet,
        dangerFg: { light: '#ce1f18', dark: '#f78086' },
      },
      labelFg: 'var(--m-color-fg-muted)',
      labelSize: 'var(--m-font-size-sm)',
      separator: 'var(--m-color-border-muted)',
    },
    // Tooltips are white cards on the popover shadow, not dark chips
    tooltip: {
      bg: 'var(--m-color-bg-raised)',
      fg: 'var(--m-color-fg-default)',
      radius: '8px',
      shadow: 'var(--m-shadow-lg)',
      paddingX: 'var(--m-space-2)',
      paddingY: 'var(--m-space-1)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-regular)',
    },
    progress: {
      height: { sm: '4px', md: '6px', lg: '8px' },
      track: fill,
      fill: 'var(--m-color-accent-default)',
      optimum: { light: '#5ecb10', dark: '#2ced83' },
      suboptimum: { light: '#ffd607', dark: '#ead300' },
      bad: { light: '#e2221a', dark: '#f78086' },
    },
    skeleton: { bg: fill, highlight: quiet, radius: '6px', blockRadius: 'var(--m-radius-lg)' },
    spinner: { thickness: '2px', track: 'var(--m-color-border-default)', color: 'var(--m-color-fg-default)' },
    divider: { color: 'var(--m-color-border-muted)', labelTransform: 'none', labelTracking: '0', labelFontSize: 'var(--m-font-size-sm)' },
    accordion: {
      border: 'var(--m-color-border-muted)',
      radius: 'var(--m-radius-lg)',
      summarySize: 'var(--m-font-size-md)',
      hoverBg: 'var(--m-color-bg-sunken)',
    },
    code: {
      radius: '12px',
      border: 'transparent',
      fontSize: 'var(--m-font-size-sm)',
      inlineBg: fill,
      inlineBorder: 'transparent',
      inlineRadius: '4px',
    },
    kbd: {
      bg: fill,
      border: 'transparent',
      shadow: 'none',
      radius: '4px',
      fontFamily: 'var(--m-font-family-sans)',
    },
    prose: {
      fontSize: 'var(--m-font-size-md)',
      lineHeight: 'var(--m-font-leading-normal)',
      h1Size: 'var(--m-font-size-2xl)',
      h2Size: 'var(--m-font-size-xl)',
      h3Size: 'var(--m-font-size-lg)',
      h4Size: 'var(--m-font-size-md)',
      h2Border: 'transparent',
      tableHeaderBg: 'var(--m-color-bg-sunken)',
      imageRadius: '12px',
    },
    // The assistant: a floating composer pill at the foot of the page, your messages in grey
    chat: {
      radius: '16px',
      userBg: 'var(--m-color-bg-sunken)',
      userBorder: 'transparent',
      assistantBg: 'transparent',
      assistantBorder: 'transparent',
      avatarRadius: 'clamp(6px, 30%, 12px)',
      assistantAvatarBg: '#7854f6',
      assistantAvatarFg: '#ffffff',
    },
    composer: {
      // The floating bar is a pill when it is one line; a growing box keeps the container radius
      radius: 'var(--m-radius-lg)',
      border: 'var(--m-color-border-strong)',
      shadow: 'var(--m-shadow-sm)',
      padding: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-md)',
    },
    citation: {
      chipBg: fill,
      chipFg: 'var(--m-color-fg-default)',
      chipHoverBg: 'var(--m-color-accent-default)',
      chipHoverFg: 'var(--m-color-accent-fg)',
      chipRadius: '6px',
      sourceRadius: '12px',
    },
    thinking: { rule: 'var(--m-color-border-muted)' },
    toolCall: { radius: '12px', border: 'var(--m-color-border-default)', bodyBg: 'var(--m-color-bg-sunken)' },
    usage: { height: '6px', track: fill, okFill: 'var(--m-color-accent-default)', warnFill: { light: '#856400', dark: '#ead300' } },
  },
});
