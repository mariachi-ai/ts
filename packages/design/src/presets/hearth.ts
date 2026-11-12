import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Hearth: a dark-first community chat. Layered near-black greys (the space rail and channel list
 * darkest, the conversation one step up, cards and menus above that), one blue-violet accent, rounded
 * bold type, people as circles and things as rounded squares, avatars beside grouped messages,
 * presence dots and role colours. A matching light theme. Category: social. The values are the
 * reference's published theme tokens and measured styles, not invented (see DESIGN.md).
 */

// Translucent fills, as the reference draws them, so they read the same on every layer
const tint = (a: number) => `rgb(149 149 160 / ${a})`;

export const hearth = extendTheme(minimal, {
  name: 'hearth',
  label: 'Hearth',
  description:
    'Dark-first community chat: layered near-black greys, a blue-violet accent, rounded bold type, round avatars beside grouped messages, presence dots and role colours.',
  tokens: {
    color: {
      bg: {
        // The conversation
        canvas: { light: '#fbfbfb', dark: '#1a1a1e' },
        // Cards, modals and the settings panels
        surface: { light: '#ffffff', dark: '#242429' },
        // Menus and popovers
        raised: { light: '#ffffff', dark: '#28282d' },
        // The space rail and the channel list: the darkest layer
        sunken: { light: '#f3f3f4', dark: '#121214' },
        overlay: { light: 'rgb(0 0 0 / 0.52)', dark: 'rgb(0 0 0 / 0.72)' },
        inverse: { light: '#28282d', dark: '#fbfbfb' },
      },
      fg: {
        default: { light: '#2e2e34', dark: '#efeff1' },
        // Secondary text and channel names at rest
        muted: { light: '#595a63', dark: '#abacb2' },
        // Timestamps, placeholders, counts
        subtle: { light: '#6c6d76', dark: '#96979e' },
        inverse: { light: '#ffffff', dark: '#2f3035' },
      },
      border: {
        // Hairlines: the neutral at 28% (light) and 12% (dark), flattened onto the canvas
        default: { light: '#dfdfe1', dark: '#29292d' },
        muted: { light: '#e9e9eb', dark: '#1f1f23' },
        // Control edges: the checkbox border, held at 3:1 (the reference's input edge is fainter)
        strong: { light: '#84858d', dark: '#75767e' },
        focus: { light: '#408eec', dark: '#6aa8f4' },
      },
      accent: {
        default: { light: '#5865f2', dark: '#5865f2' },
        hover: { light: '#4452bb', dark: '#4452bb' },
        active: { light: '#3a48a3', dark: '#3a48a3' },
        // The selected and highlighted tint: the accent at 16%
        subtle: { light: 'rgb(88 101 242 / 0.16)', dark: 'rgb(88 101 242 / 0.16)' },
        fg: '#ffffff',
        text: { light: '#4a57d4', dark: '#798df9' },
      },
      success: {
        bg: { light: 'rgb(0 128 64 / 0.08)', dark: 'rgb(0 128 64 / 0.08)' },
        fg: { light: '#01713a', dark: '#5eb479' },
        border: { light: '#64b48d', dark: '#0d5132' },
        solid: { light: '#008545', dark: '#008545' },
        onSolid: '#ffffff',
      },
      warning: {
        bg: { light: 'rgb(242 166 0 / 0.08)', dark: 'rgb(242 166 0 / 0.08)' },
        fg: { light: '#945300', dark: '#ea9800' },
        border: { light: '#f0c46b', dark: '#614614' },
        solid: { light: '#faaa00', dark: '#faaa00' },
        onSolid: '#000000',
      },
      danger: {
        bg: { light: 'rgb(204 51 51 / 0.08)', dark: 'rgb(204 51 51 / 0.08)' },
        fg: { light: '#b92733', dark: '#f87e7a' },
        border: { light: '#e27f87', dark: '#7a232d' },
        solid: { light: '#d22d39', dark: '#d22d39' },
        onSolid: '#ffffff',
      },
      info: {
        bg: { light: 'rgb(0 115 230 / 0.08)', dark: 'rgb(0 115 230 / 0.08)' },
        fg: { light: '#0361bc', dark: '#66a5f3' },
        border: { light: '#64abed', dark: '#0d4984' },
        solid: { light: '#0361bc', dark: '#0361bc' },
        onSolid: '#ffffff',
      },
      selection: {
        bg: { light: '#c4c9fb', dark: '#3a48a3' },
        fg: { light: '#2e2e34', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // A rounded, compact grotesque in the app; the wide italic display face only on marketing pages
        sans: '"Figtree Variable", "Figtree", "Noto Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        display: '"Archivo Variable", "Archivo", "Figtree Variable", ui-sans-serif, system-ui, sans-serif',
        mono: '"Source Code Pro Variable", "Source Code Pro", ui-monospace, Consolas, "Andale Mono", monospace',
      },
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.75rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.25', normal: '1.375', relaxed: '1.5' },
      tracking: { tight: '-0.01em', normal: '0', wide: '0.02em' },
      body: { weight: '400' },
      // App headings are the text face at 600; the display face is for marketing bands
      heading: {
        family: '"Figtree Variable", "Figtree", "Noto Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        weight: '600',
        tracking: '0',
      },
    },
    control: {
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(2.5rem * var(--m-density))',
        lg: 'calc(2.75rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.25rem * var(--m-density))',
      },
    },
    radius: { sm: '4px', md: '8px', lg: '12px', control: '8px', container: '8px' },
    shadow: {
      sm: { light: '0 1px 4px 0 rgb(0 0 0 / 0.08)', dark: '0 1px 4px 0 rgb(0 0 0 / 0.14)' },
      md: { light: '0 4px 8px 0 rgb(0 0 0 / 0.08)', dark: '0 4px 8px 0 rgb(0 0 0 / 0.16)' },
      lg: { light: '0 12px 36px 0 rgb(0 0 0 / 0.12)', dark: '0 12px 24px 0 rgb(0 0 0 / 0.24)' },
      overlay: { light: '0 12px 36px 0 rgb(0 0 0 / 0.12)', dark: '0 12px 24px 0 rgb(0 0 0 / 0.24)' },
    },
    motion: {
      duration: { fast: '150ms', normal: '200ms', slow: '300ms' },
      easing: { standard: 'cubic-bezier(0, 0, 0.58, 1)', emphasized: 'cubic-bezier(0.25, 1.25, 0.5, 1)' },
    },
  },
  components: {
    // A 240px channel list beside the conversation; settings in a 740px column
    layout: {
      containerMax: { sm: '30rem', md: '46.25rem', lg: '75rem' },
      containerPadding: 'clamp(1rem, 3vw, 2.5rem)',
      gridGap: 'var(--m-space-4)',
      splitSide: '15rem',
    },
    // Rounded rectangles, 8px, medium weight; secondary is a translucent grey on any layer
    button: {
      radius: '8px',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-medium)',
      borderWidth: '1px',
      shadow: 'none',
      gap: 'var(--m-space-1)',
      primary: { border: 'rgb(255 255 255 / 0.08)' },
      secondary: {
        bg: tint(0.12),
        fg: { light: '#28282d', dark: '#fbfbfb' },
        border: { light: tint(0.2), dark: 'rgb(153 153 153 / 0.04)' },
        hoverBg: tint(0.16),
        activeBg: { light: tint(0.24), dark: tint(0.2) },
      },
      ghost: { fg: { light: '#28282d', dark: '#fbfbfb' }, hoverBg: tint(0.16), activeBg: tint(0.2) },
      danger: {
        bg: '#d22d39',
        fg: '#ffffff',
        border: 'rgb(255 255 255 / 0.08)',
        hoverBg: '#a9232e',
        activeBg: '#971d28',
      },
    },
    input: {
      bg: { light: 'rgb(0 0 0 / 0.02)', dark: 'rgb(0 0 0 / 0.12)' },
      placeholder: { light: '#696a73', dark: '#8f9097' },
      // An active field is edged in the accent
      focusBorder: 'var(--m-color-accent-default)',
      radius: '8px',
      fontSize: 'var(--m-font-size-md)',
      height: { md: 'calc(2.75rem * var(--m-density))' },
      paddingX: { md: 'calc(0.75rem * var(--m-density))' },
    },
    select: {
      bg: { light: 'rgb(0 0 0 / 0.02)', dark: 'rgb(0 0 0 / 0.12)' },
      focusBorder: 'var(--m-color-accent-default)',
      radius: '8px',
      fontSize: 'var(--m-font-size-md)',
      height: { md: 'calc(2.75rem * var(--m-density))' },
    },
    field: {
      labelFg: { light: '#28282d', dark: '#fbfbfb' },
      labelFontSize: 'var(--m-font-size-md)',
      labelFontWeight: 'var(--m-font-weight-medium)',
      hintFg: 'var(--m-color-fg-subtle)',
      requiredFg: 'var(--m-color-danger-fg)',
    },
    checkbox: {
      size: '1.25rem',
      radius: '6px',
      border: { light: '#84858d', dark: 'rgb(152 152 160 / 0.8)' },
      hoverBorder: { light: '#5c5d67', dark: '#abacb2' },
    },
    radio: { size: '1.25rem', border: { light: '#84858d', dark: 'rgb(152 152 160 / 0.8)' } },
    // An older grey track with a white knob when off (the reference's own off track is too faint for 3:1)
    switch: {
      width: '2.5rem',
      height: '1.5rem',
      trackBg: { light: '#84858d', dark: '#72737b' },
      trackCheckedBg: 'var(--m-color-accent-default)',
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbShadow: 'none',
    },
    card: {
      bg: 'var(--m-color-bg-surface)',
      border: { light: '#dfdfe1', dark: 'rgb(148 148 156 / 0.12)' },
      radius: '8px',
      shadow: 'none',
      hoverShadow: 'var(--m-shadow-md)',
      hoverTransform: 'none',
      titleSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
      padding: { md: 'var(--m-space-4)' },
    },
    // Channel and settings lists: medium-weight rows, a translucent fill when hovered and a stronger one when current
    sidebar: {
      bg: 'var(--m-color-bg-sunken)',
      border: 'transparent',
      borderWidth: '0px',
      fontSize: 'var(--m-font-size-md)',
      itemGap: '2px',
      padding: 'var(--m-space-2)',
      link: {
        fg: { light: '#666770', dark: '#81828a' },
        hoverFg: { light: '#28282d', dark: '#fbfbfb' },
        hoverBg: tint(0.12),
        activeFg: { light: '#28282d', dark: '#fbfbfb' },
        activeBg: { light: tint(0.24), dark: tint(0.2) },
        activeWeight: 'var(--m-font-weight-medium)',
        radius: '8px',
        paddingX: 'var(--m-space-2)',
        paddingY: '0.375rem',
      },
      heading: {
        fg: { light: '#666770', dark: '#81828a' },
        size: 'var(--m-font-size-sm)',
        weight: 'var(--m-font-weight-medium)',
        transform: 'none',
        tracking: '0',
      },
      // Unread counts: the red notification pill
      count: { bg: '#d22d39', fg: '#ffffff', radius: '9999px' },
    },
    navbar: {
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      link: { fontSize: 'var(--m-font-size-md)', fontWeight: 'var(--m-font-weight-medium)', fg: 'var(--m-color-fg-default)' },
    },
    tabs: {
      fontSize: 'var(--m-font-size-md)',
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-accent-text)',
      indicator: 'var(--m-color-accent-text)',
      indicatorWidth: '2px',
      listBorder: 'var(--m-color-border-default)',
      pill: {
        listBg: 'transparent',
        listPadding: '0',
        listRadius: '8px',
        radius: '8px',
        // Selected toggles take the accent tint, as the reference's toggle buttons do
        activeBg: 'var(--m-color-accent-subtle)',
        activeShadow: 'none',
      },
    },
    table: {
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-subtle)',
      headerTransform: 'none',
      headerTracking: '0',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-medium)',
      fontSize: 'var(--m-font-size-sm)',
      rowHoverBg: tint(0.08),
      stripeBg: 'transparent',
      borderColor: 'var(--m-color-border-default)',
      wrapBorder: 'var(--m-color-border-default)',
      wrapRadius: '8px',
    },
    // Tag badges: small, bold, uppercase, 4px corners
    badge: {
      radius: '4px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-bold)',
      textTransform: 'uppercase',
      tracking: '0.02em',
      borderWidth: '0px',
      paddingX: '0.375rem',
      neutral: {
        bg: tint(0.16),
        fg: { light: '#28282d', dark: '#fbfbfb' },
        solidBg: 'var(--m-color-accent-default)',
        solidFg: '#ffffff',
      },
    },
    // People are circles: default avatars are the accent with white initials
    avatar: {
      size: { sm: '1.5rem', md: '2rem', lg: '2.5rem' },
      radius: '9999px',
      bg: 'var(--m-color-accent-default)',
      fg: '#ffffff',
      fontWeight: 'var(--m-font-weight-semibold)',
    },
    // Inline notices: an 8% tint of the tone, a stronger tone edge, 8px corners
    alert: {
      borderWidth: '1px',
      accentWidth: '0px',
      radius: '8px',
      padding: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    toast: {
      bg: 'var(--m-color-bg-raised)',
      border: { light: '#dfdfe1', dark: 'rgb(148 148 156 / 0.12)' },
      borderWidth: '1px',
      accentWidth: '0px',
      radius: '8px',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-3)',
      fontSize: 'var(--m-font-size-sm)',
      titleWeight: 'var(--m-font-weight-semibold)',
      width: '22rem',
    },
    dialog: {
      bg: 'var(--m-color-bg-surface)',
      border: { light: '#dfdfe1', dark: 'rgb(148 148 156 / 0.12)' },
      borderWidth: '1px',
      radius: '12px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-6)',
      backdrop: 'var(--m-color-bg-overlay)',
      width: { sm: '27.625rem', md: '37.625rem', lg: '50rem' },
      titleSize: 'var(--m-font-size-2xl)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // Menus: one step above the card, a hairline, 8px corners, 32px rows
    popover: {
      bg: 'var(--m-color-bg-raised)',
      border: { light: '#dfdfe1', dark: 'rgb(148 148 156 / 0.12)' },
      borderWidth: '1px',
      radius: '8px',
      shadow: 'var(--m-shadow-lg)',
      padding: 'var(--m-space-2)',
      minWidth: '11.75rem',
      item: {
        height: '2rem',
        paddingX: 'var(--m-space-2)',
        radius: '4px',
        fontSize: 'var(--m-font-size-sm)',
        fg: 'var(--m-color-fg-muted)',
        hoverBg: tint(0.12),
        hoverFg: { light: '#28282d', dark: '#fbfbfb' },
        dangerFg: 'var(--m-color-danger-fg)',
      },
      separator: 'var(--m-color-border-default)',
    },
    // Tooltips are not inverted: the card surface, a hairline and a deep shadow
    tooltip: {
      bg: 'var(--m-color-bg-surface)',
      fg: 'var(--m-color-fg-default)',
      radius: '8px',
      shadow: { light: 'inset 0 0 0 1px #dfdfe1, 0 12px 36px 0 rgb(0 0 0 / 0.12)', dark: 'inset 0 0 0 1px rgb(148 148 156 / 0.12), 0 12px 24px 0 rgb(0 0 0 / 0.24)' },
      paddingX: 'var(--m-space-3)',
      paddingY: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-medium)',
      maxWidth: '12.5rem',
    },
    // Date dividers: a hairline with the date centred in small muted type
    divider: {
      color: 'var(--m-color-border-default)',
      labelFg: 'var(--m-color-fg-subtle)',
      labelFontSize: 'var(--m-font-size-xs)',
      labelTransform: 'none',
      labelTracking: '0',
      labelGap: 'var(--m-space-2)',
    },
    progress: {
      height: { md: '0.5rem' },
      radius: '9999px',
      // The reference's track is the neutral at 20%; dark mode drops it to 12% so the fill holds 3:1
      track: { light: tint(0.24), dark: tint(0.12) },
      fill: 'var(--m-color-accent-default)',
    },
    skeleton: { bg: tint(0.12), highlight: tint(0.2) },
    accordion: { radius: '8px', bg: 'transparent', summaryWeight: 'var(--m-font-weight-semibold)', hoverBg: tint(0.08) },
    code: {
      bg: { light: '#f3f3f4', dark: '#121214' },
      border: { light: '#dfdfe1', dark: 'rgb(148 148 156 / 0.12)' },
      radius: '8px',
      inlineBg: { light: tint(0.16), dark: tint(0.2) },
      inlineFg: 'var(--m-color-fg-default)',
      inlineRadius: '4px',
    },
    kbd: {
      bg: tint(0.16),
      border: 'transparent',
      radius: '4px',
      shadow: 'none',
      fontWeight: 'var(--m-font-weight-semibold)',
    },
    prose: { linkFg: { light: '#006dd4', dark: '#4d96ee' }, quoteBorder: { light: '#c5c6ca', dark: '#474851' }, quoteBorderWidth: '4px', quoteStyle: 'normal' },
    // The message list: no bubbles, round avatars, the name and a muted time on one line
    chat: {
      gap: 'var(--m-space-4)',
      maxWidth: 'none',
      padding: '0',
      paddingX: '0',
      userBg: 'transparent',
      userBorder: 'transparent',
      avatarSize: '2.5rem',
      avatarRadius: '9999px',
      avatarBg: 'var(--m-color-accent-default)',
      avatarFg: '#ffffff',
      assistantAvatarBg: { light: '#5f606a', dark: '#4f505a' },
      assistantAvatarFg: '#ffffff',
      metaFg: 'var(--m-color-fg-subtle)',
      metaFontSize: 'var(--m-font-size-xs)',
    },
    composer: {
      bg: { light: '#ffffff', dark: '#222327' },
      radius: '8px',
      fontSize: 'var(--m-font-size-md)',
      shadow: 'none',
      focusBorder: 'var(--m-color-accent-default)',
    },
    citation: { chipBg: tint(0.16), chipRadius: '4px' },
    usage: { okFill: 'var(--m-color-accent-default)', track: { light: tint(0.24), dark: tint(0.12) } },
  },
});
