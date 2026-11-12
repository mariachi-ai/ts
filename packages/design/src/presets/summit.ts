import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Summit: a sporty, energetic activity app. Near-black warm greys on a cool off-white, white cards
 * with 4px corners and a faint long shadow, one loud signature orange for the brand, routes,
 * achievements and the current item, a burnt orange for actions, bold compact type, stats rows of big
 * figures with small units, and a blue focus ring. The dark mode is the phone app's near-black.
 * Category: bold and fast. The values are the reference's own web tokens and component styles, read
 * from its stylesheets, and measured off its pages and app screens (see DESIGN.md).
 */

// The signature orange: the brand colour, route lines, achievements, the current-item bar
const orange = '#fc5200';
// The quiet warm grey fill (the reference's n6) behind table headers, social buttons and wells
const fill = { light: '#f2f2f0', dark: '#2e2e2b' };
// The reference's hairline grey (n5) and its dark counterpart (n2)
const hair = { light: '#e0e0de', dark: '#43423f' };
// Action-orange text: links, ghost buttons, the current tab's label in dark mode
const orangeText = { light: '#c94100', dark: '#fc7433' };

export const summit = extendTheme(minimal, {
  name: 'summit',
  label: 'Summit',
  description:
    'Sporty and loud: warm near-black on off-white, a signature orange, bold compact type, white 4px cards, stats rows with big figures and small units.',
  tokens: {
    color: {
      bg: {
        // The web dashboard's cool off-white behind white cards; the app's near-black in dark
        canvas: { light: '#f7f7fa', dark: '#141413' },
        surface: { light: '#ffffff', dark: '#21211f' },
        raised: { light: '#ffffff', dark: '#2e2e2b' },
        sunken: fill,
        // The modal scrim: black at 70%
        overlay: { light: 'rgb(0 0 0 / 0.7)', dark: 'rgb(0 0 0 / 0.7)' },
        // The sticky banners and plan cards: the warm near-black n1
        inverse: { light: '#21211f', dark: '#f2f2f0' },
      },
      fg: {
        // The reference's neutral ramp: n1 for text, n2 for secondary, n3 for labels and placeholders
        default: { light: '#21211f', dark: '#fafafa' },
        muted: { light: '#43423f', dark: '#c2c1bb' },
        subtle: { light: '#64635e', dark: '#a8a6a0' },
        inverse: { light: '#ffffff', dark: '#21211f' },
      },
      border: {
        default: hair,
        muted: { light: '#f2f2f0', dark: '#2e2e2b' },
        // The text input's border (n4)
        strong: { light: '#918e89', dark: '#918e89' },
        // Focus is blue, not orange: the reference's b3 outline
        focus: { light: '#0060d0', dark: '#669fe2' },
      },
      accent: {
        // The action orange. The signature #fc5200 is 3.3:1 under white text, so actions rest on the
        // reference's own hover step (o2), hover on o1, pressed one step further
        default: { light: '#c94100', dark: '#c94100' },
        hover: { light: '#a63600', dark: '#a63600' },
        active: { light: '#973100', dark: '#973100' },
        subtle: { light: '#fff2eb', dark: '#3a1500' },
        fg: '#ffffff',
        text: orangeText,
      },
      // The signature orange itself: logo marks, route lines, achievements, hero bands, the current
      // item's bar. Text on it is near-black (white is 3.3:1)
      brand: {
        default: { light: orange, dark: orange },
        fg: { light: '#000000', dark: '#000000' },
        subtle: { light: '#fedccc', dark: '#321000' },
      },
      // The reference's alert palette (light) and its extended ramps (dark)
      success: {
        bg: { light: '#e9f5e9', dark: '#162907' },
        fg: { light: '#2f6e2f', dark: '#8cd850' },
        border: { light: '#a7d8a7', dark: '#2c520e' },
        solid: { light: '#437c16', dark: '#437c16' },
        onSolid: '#ffffff',
      },
      warning: {
        bg: { light: '#fdf5e9', dark: '#322700' },
        fg: { light: '#8a5409', dark: '#ffd233' },
        border: { light: '#f6ce95', dark: '#654f00' },
        solid: { light: '#ffc700', dark: '#ffc700' },
        onSolid: { light: '#21211f', dark: '#21211f' },
      },
      danger: {
        bg: { light: '#fae8e8', dark: '#2d0404' },
        fg: { light: '#b52b27', dark: '#ef7575' },
        border: { light: '#eba6a4', dark: '#5b0909' },
        solid: { light: '#df2626', dark: '#df2626' },
        onSolid: '#ffffff',
      },
      info: {
        bg: { light: '#d4ecf3', dark: '#042425' },
        fg: { light: '#175d72', dark: '#73d4d8' },
        border: { light: '#9bd8eb', dark: '#09494b' },
        solid: { light: '#0d6e72', dark: '#0d6e72' },
        onSolid: '#ffffff',
      },
      selection: {
        bg: { light: '#fedccc', dark: '#642000' },
        fg: { light: '#21211f', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // A compact grotesque with a double-storey a, standing in for the reference's own face
        sans: '"Instrument Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Roboto, Arial, sans-serif',
        display: '"Instrument Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", "Helvetica Neue", sans-serif',
        mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      // The reference's ramp: 12, 14, 16, 20, 24, 32, 48, 64
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.25rem',
        xl: '1.5rem',
        '2xl': '2rem',
        '3xl': '3rem',
        '4xl': '4rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      // 110% headings, 130% for most UI text
      leading: { tight: '1.1', normal: '1.3', relaxed: '1.5' },
      tracking: { tight: '-0.01em', normal: '0', wide: '0.08em' },
      body: { weight: '400' },
      heading: { weight: '700', tracking: '0' },
    },
    control: {
      // Buttons: 32px small, 40px default (the header's Log In), 44px large (the text input)
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(2.5rem * var(--m-density))',
        lg: 'calc(2.75rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.625rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.5rem * var(--m-density))',
      },
      fontSize: '0.875rem',
    },
    // The web tokens: 2px tags, 4px controls, cards and menus, 8px dialogs; 12/16px for marketing
    radius: { sm: '2px', md: '4px', lg: '8px' },
    shadow: {
      // The global header's hairline drop
      sm: { light: '0 1px 2px rgb(0 0 0 / 0.033)', dark: '0 0 0 1px rgb(255 255 255 / 0.05)' },
      // The card shadow: long and faint
      md: {
        light: '0 8px 24px rgb(13 13 18 / 0.04)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.06)',
      },
      // Lifted panels and menus
      lg: {
        light: '0 0.5px 4px rgb(0 0 0 / 0.1), 0 6px 12px rgb(0 0 0 / 0.1)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.08), 0 8px 20px rgb(0 0 0 / 0.5)',
      },
      // The modal
      overlay: {
        light: '0 24px 45px rgb(15 23 42 / 0.18)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.08), 0 24px 45px rgb(0 0 0 / 0.6)',
      },
    },
    motion: {
      duration: { fast: '150ms', normal: '150ms', slow: '660ms' },
      easing: { standard: 'ease', emphasized: 'cubic-bezier(0.45, 1.005, 0, 1.005)' },
    },
  },
  components: {
    // The web app's 1248px container; a 240px side column; 12px gaps between feed cards
    layout: {
      containerMax: { sm: '30rem', md: '48rem', lg: '78rem' },
      containerPadding: 'clamp(1rem, 3vw, 1.5rem)',
      gridGap: 'var(--m-space-4)',
      splitSide: '15rem',
    },
    // 4px corners at 600: burnt orange for the action, white with a hairline for the rest, orange
    // text for quiet ones; pressing insets a shadow
    button: {
      radius: '4px',
      fontWeight: 'var(--m-font-weight-semibold)',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'inset 0 3px 5px rgb(0 0 0 / 0.125)',
      disabledOpacity: '0.65',
      secondary: {
        bg: 'var(--m-color-bg-surface)',
        fg: 'var(--m-color-fg-default)',
        border: hair,
        hoverBg: { light: '#e6e6e6', dark: '#2e2e2b' },
        activeBg: { light: '#e6e6e6', dark: '#2e2e2b' },
      },
      ghost: {
        fg: orangeText,
        hoverBg: { light: '#ffeee6', dark: '#3a1500' },
        activeBg: { light: '#ffe2d4', dark: '#4a1b00' },
      },
      danger: {
        bg: '#df2626',
        fg: '#ffffff',
        border: '#df2626',
        hoverBg: '#b91c1c',
        activeBg: '#a01818',
      },
    },
    // The text input: 44px, 4px corners, a mid-grey border, placeholder in n3
    input: {
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: '#64635e', dark: '#c2c1bb' },
      focusBorder: { light: '#43423f', dark: '#c2c1bb' },
      invalidBorder: { light: '#b71414', dark: '#ef7575' },
      placeholder: 'var(--m-color-fg-subtle)',
      fontSize: 'var(--m-font-size-sm)',
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(2.75rem * var(--m-density))',
        lg: 'calc(3rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.625rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1rem * var(--m-density))',
      },
      paddingY: '0.75rem',
    },
    select: {
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-strong)',
      hoverBorder: { light: '#64635e', dark: '#c2c1bb' },
      focusBorder: { light: '#43423f', dark: '#c2c1bb' },
      invalidBorder: { light: '#b71414', dark: '#ef7575' },
      fontSize: 'var(--m-font-size-sm)',
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(2.75rem * var(--m-density))',
        lg: 'calc(3rem * var(--m-density))',
      },
    },
    // Labels: 16px at 500 above, 12px gap; messages 14px under
    field: {
      gap: 'var(--m-space-2)',
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-semibold)',
      hintFg: 'var(--m-color-fg-subtle)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFg: { light: '#b52b27', dark: '#ef7575' },
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    checkbox: { size: '1.125rem', radius: '2px', border: 'var(--m-color-border-strong)' },
    radio: { size: '1.125rem', border: 'var(--m-color-border-strong)' },
    // The app's switch: an orange track when on, a white knob
    switch: {
      width: '2.75rem',
      height: '1.625rem',
      thumbInset: '2px',
      // n4: the one grey that clears 3:1 against both the screen and the white knob
      trackBg: '#918e89',
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbShadow: '0 1px 3px rgb(0 0 0 / 0.25)',
    },
    // White cards with 4px corners, a warm hairline and the long faint shadow; titles bold
    card: {
      radius: '4px',
      border: { light: '#f2f2f0', dark: '#2e2e2b' },
      shadow: 'var(--m-shadow-md)',
      hoverShadow: 'var(--m-shadow-lg)',
      hoverBorder: { light: '#e0e0de', dark: '#43423f' },
      hoverTransform: 'none',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-6)', lg: 'var(--m-space-8)' },
      titleFamily: 'var(--m-font-family-sans)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-bold)',
      descriptionFg: 'var(--m-color-fg-muted)',
      outline: { bg: 'var(--m-color-bg-surface)', border: hair },
      sunken: { bg: fill, border: 'transparent' },
    },
    // Data tables: a warm grey header row of small bold labels, 14px rows split by hairlines
    table: {
      fontSize: 'var(--m-font-size-sm)',
      cellPaddingX: '0.5rem',
      cellPaddingY: '0.75rem',
      borderColor: { light: '#f2f2f0', dark: '#2e2e2b' },
      headerBg: fill,
      headerFg: 'var(--m-color-fg-default)',
      headerFontSize: 'var(--m-font-size-xs)',
      headerFontWeight: 'var(--m-font-weight-semibold)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      rowHoverBg: { light: '#fafafa', dark: '#2a2a27' },
      stripeBg: { light: '#fafafa', dark: '#1a1a19' },
      wrapBorder: 'transparent',
      wrapRadius: '4px',
    },
    // The activity page's left column: grey items on white, the current one dark with an orange bar
    sidebar: {
      bg: 'var(--m-color-bg-surface)',
      border: hair,
      fontSize: 'var(--m-font-size-sm)',
      padding: 'var(--m-space-3)',
      itemGap: '0',
      link: {
        fg: 'var(--m-color-fg-muted)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: fill,
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
        activeWeight: 'var(--m-font-weight-semibold)',
        radius: '0',
        paddingX: 'var(--m-space-4)',
        paddingY: 'calc(0.625rem * var(--m-density))',
        indicator: orange,
        indicatorWidth: '3px',
      },
      heading: {
        fg: 'var(--m-color-fg-subtle)',
        size: '0.6875rem',
        weight: 'var(--m-font-weight-semibold)',
        transform: 'uppercase',
        tracking: '0.04em',
      },
      // The notification count: an orange pill with white figures
      count: { bg: 'var(--m-color-accent-default)', fg: '#ffffff', radius: '8px' },
    },
    // The global header: white, 56px, a near-invisible bottom hairline; 14px dark links
    navbar: {
      height: '3.5rem',
      border: { light: '#f2f2f0', dark: '#2e2e2b' },
      shadow: 'var(--m-shadow-sm)',
      brandFamily: 'var(--m-font-family-display)',
      brandWeight: '700',
      brandSize: 'var(--m-font-size-xl)',
      brandTransform: 'uppercase',
      // Links fill the bar's height, so the current one's orange line sits on its bottom edge
      link: {
        height: 'calc(3.5rem - 1px)',
        radius: '0',
        paddingX: '0.75rem',
        fontSize: 'var(--m-font-size-sm)',
        fontWeight: 'var(--m-font-weight-regular)',
        fg: 'var(--m-color-fg-default)',
        hoverFg: orangeText,
        hoverBg: 'transparent',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'transparent',
      },
    },
    // Tabs: 14px at 600, grey, the current one dark over a 2px orange line; the segmented control is
    // a warm grey track with a white knob
    tabs: {
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-semibold)',
      paddingX: '1.25rem',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: orange,
      indicatorWidth: '2px',
      listBorder: hair,
      listBorderWidth: '2px',
      pill: {
        listBg: { light: '#f2f2f0', dark: '#2e2e2b' },
        listRadius: '8px',
        listPadding: '3px',
        radius: '6px',
        activeBg: { light: '#ffffff', dark: '#43423f' },
        activeShadow: '0 1px 3px rgb(0 0 0 / 0.12)',
      },
    },
    // Page numbers: hairline squares, the current one burnt orange
    pagination: {
      radius: '4px',
      border: hair,
      fg: 'var(--m-color-fg-default)',
      hoverBg: fill,
      currentBg: 'var(--m-color-accent-default)',
      currentFg: '#ffffff',
      currentBorder: 'var(--m-color-accent-default)',
    },
    breadcrumb: {
      separator: '"›"',
      fg: 'var(--m-color-fg-default)',
      hoverFg: orangeText,
      currentFg: 'var(--m-color-fg-subtle)',
    },
    // Tags: 4px corners, 12px; "New" and subscriber tags are orange, small and bold
    badge: {
      height: '1.375rem',
      paddingX: '0.5rem',
      radius: '4px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-semibold)',
      textTransform: 'none',
      neutral: {
        bg: fill,
        fg: 'var(--m-color-fg-default)',
        border: 'transparent',
        solidBg: { light: '#21211f', dark: '#f2f2f0' },
        solidFg: { light: '#ffffff', dark: '#21211f' },
      },
    },
    // Round avatars on the hairline grey
    avatar: {
      size: { sm: '2rem', md: '3rem', lg: '4rem' },
      bg: { light: '#e0e0de', dark: '#43423f' },
      fg: { light: '#21211f', dark: '#fafafa' },
      fontWeight: 'var(--m-font-weight-semibold)',
      ringColor: 'var(--m-color-bg-surface)',
      ringWidth: '2px',
      groupOverlap: '0.5rem',
    },
    // Alerts: a pale wash of the tone, 4px corners, no border, no side stripe, 12px padding
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
    // The sticky banner: a near-black bar with white text
    toast: {
      bg: { light: '#21211f', dark: '#2e2e2b' },
      fg: '#ffffff',
      bodyFg: { light: '#e0e0de', dark: '#e0e0de' },
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '4px',
      shadow: 'var(--m-shadow-lg)',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    // The modal: white, 8px corners, the long navy-tinted shadow over a 70% black scrim
    dialog: {
      border: 'transparent',
      radius: '8px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-6)',
      titleFamily: 'var(--m-font-family-display)',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: '700',
      descriptionFg: 'var(--m-color-fg-subtle)',
    },
    // Menus: 4px corners, a hairline border, 14px items that highlight in the hairline grey
    popover: {
      border: hair,
      radius: '4px',
      shadow: 'var(--m-shadow-lg)',
      padding: '0.25rem',
      item: {
        height: '2.25rem',
        paddingX: '0.75rem',
        radius: '4px',
        fontSize: 'var(--m-font-size-sm)',
        hoverBg: hair,
        hoverFg: 'var(--m-color-fg-default)',
      },
    },
    tooltip: {
      radius: '4px',
      shadow: 'none',
      paddingX: 'var(--m-space-2)',
      paddingY: 'var(--m-space-1)',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-regular)',
    },
    // Challenge progress: a rounded bar in the signature orange on the hairline grey
    progress: {
      height: { sm: '0.25rem', md: '0.5rem', lg: '0.75rem' },
      radius: '9999px',
      track: hair,
      // The signature orange is 2.5:1 on the light track; light mode fills with the action orange
      fill: { light: '#c94100', dark: orange },
      optimum: { light: '#59a51d', dark: '#70cf25' },
      suboptimum: { light: '#ffc700', dark: '#ffc700' },
      bad: { light: '#df2626', dark: '#ea4747' },
    },
    // Questions in a 4px hairline box, rows split by hairlines
    accordion: {
      radius: '4px',
      bg: 'var(--m-color-bg-surface)',
      paddingX: 'var(--m-space-4)',
      paddingY: 'var(--m-space-4)',
      summarySize: 'var(--m-font-size-md)',
      summaryWeight: 'var(--m-font-weight-semibold)',
      contentFg: 'var(--m-color-fg-muted)',
    },
    skeleton: { bg: fill, highlight: { light: '#fafafa', dark: '#3a3a36' }, duration: '1.2s' },
    // The reference's spinner: a 2px dark ring with a faded track, 1.2s a turn
    spinner: {
      thickness: '2px',
      color: 'var(--m-color-fg-muted)',
      track: { light: 'rgb(67 66 63 / 0.25)', dark: 'rgb(194 193 187 / 0.25)' },
      duration: '1.2s',
    },
    kbd: { radius: '4px', shadow: 'none', fontWeight: 'var(--m-font-weight-medium)' },
    code: {
      radius: '4px',
      inlineRadius: '2px',
      inlineBg: fill,
      bg: { light: '#fafafa', dark: '#2e2e2b' },
    },
    prose: { linkFg: orangeText, linkDecoration: 'none', maxWidth: '42rem' },
    // Comments and coaching: the person's notes in burnt orange, the coach's on the warm grey fill
    chat: {
      radius: '8px',
      userBg: 'var(--m-color-accent-default)',
      userFg: '#ffffff',
      userBorder: 'transparent',
      assistantBg: fill,
      assistantBorder: 'transparent',
    },
    composer: { radius: '4px', focusBorder: { light: '#43423f', dark: '#c2c1bb' } },
    citation: { chipBg: fill, chipFg: 'var(--m-color-fg-default)', chipRadius: '4px' },
    toolCall: { radius: '4px', statusRadius: '4px' },
    usage: { radius: '9999px', okFill: { light: '#c94100', dark: orange } },
  },
});
