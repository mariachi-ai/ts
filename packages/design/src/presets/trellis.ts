import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Trellis: a work messaging app. A deep aubergine frame (the icon rail and the top bar) around a
 * white conversation panel with rounded corners, a plum channel list with bold unread rows and red
 * mention counts, a blue highlight for the current row, links and your own reactions, and one green
 * for sending. People are rounded squares beside flat message rows; the composer carries a
 * formatting bar. A matching dark theme. Category: social. Values are sampled from the reference's
 * screenshots and public pages, not invented (see DESIGN.md and the notes).
 */

// The quiet neutral of the reference: its near-black ink, used at set strengths
const ink = (a: number) => `rgb(29 28 29 / ${a})`;
const snow = (a: number) => `rgb(232 232 232 / ${a})`;

export const trellis = extendTheme(minimal, {
  name: 'trellis',
  label: 'Trellis',
  description:
    'Work messaging: an aubergine frame round a white conversation panel, bold unread rows with red mention counts, blue for the current row and links, green for send, rounded-square people and a composer with a formatting bar.',
  tokens: {
    color: {
      bg: {
        // The conversation panel
        canvas: { light: '#ffffff', dark: '#1a1d21' },
        // Dialogs, cards, the thread pane
        surface: { light: '#ffffff', dark: '#222529' },
        // Menus and popovers
        raised: { light: '#ffffff', dark: '#222529' },
        // Row hover, the add-reaction chip, quiet wells
        sunken: { light: '#f8f8f8', dark: '#16181b' },
        overlay: { light: 'rgb(0 0 0 / 0.5)', dark: 'rgb(0 0 0 / 0.7)' },
        inverse: { light: '#1d1c1d', dark: '#e8e8e8' },
      },
      fg: {
        default: { light: '#1d1c1d', dark: '#d1d2d3' },
        // Timestamps, secondary lines: the ink at 70%
        muted: { light: '#616061', dark: '#ababad' },
        // Placeholders and hints (the reference's 50% ink is too faint for 4.5:1)
        subtle: { light: '#737273', dark: '#9a9b9e' },
        inverse: { light: '#ffffff', dark: '#1d1c1d' },
      },
      border: {
        // Hairlines: the ink at 13%
        default: { light: '#dddddd', dark: '#35373b' },
        muted: { light: '#ebebeb', dark: '#2b2d31' },
        // Control edges held at 3:1 (the reference's input edge is the ink at 30%)
        strong: { light: '#868686', dark: '#7c7e82' },
        focus: { light: '#1264a3', dark: '#1d9bd1' },
      },
      // Green is for sending and the one primary action
      accent: {
        default: { light: '#007a5a', dark: '#00845f' },
        hover: { light: '#148567', dark: '#148567' },
        active: { light: '#006e51', dark: '#006e51' },
        // The blue highlight: your own reaction, a saved row, selected rows
        subtle: { light: '#e8f5fa', dark: '#14293a' },
        fg: '#ffffff',
        // Links, the current row and selection are blue, not green
        text: { light: '#1264a3', dark: '#1d9bd1' },
      },
      // The signature aubergine: the window frame, the icon rail, the marketing buttons
      brand: {
        default: { light: '#3f0e40', dark: '#3f0e40' },
        fg: '#ffffff',
        subtle: { light: '#f9f0ff', dark: '#2e1f33' },
      },
      success: {
        bg: { light: '#e6f2ef', dark: '#10302a' },
        fg: { light: '#007a5a', dark: '#2bac76' },
        border: { light: '#99cabd', dark: '#1f5c47' },
        solid: { light: '#007a5a', dark: '#007a5a' },
        onSolid: '#ffffff',
      },
      // The yellow banner (external people, mentions of you)
      warning: {
        bg: { light: '#fef7e0', dark: '#332a14' },
        fg: { light: '#7a5200', dark: '#ecb22e' },
        border: { light: '#f2d58e', dark: '#6b5321' },
        solid: { light: '#ecb22e', dark: '#ecb22e' },
        onSolid: '#1d1c1d',
      },
      danger: {
        bg: { light: '#fce9ef', dark: '#3a1a24' },
        fg: { light: '#c41d51', dark: '#f0628e' },
        border: { light: '#f3a5bd', dark: '#7a2a43' },
        solid: { light: '#e01e5a', dark: '#e01e5a' },
        onSolid: '#ffffff',
      },
      info: {
        bg: { light: '#e8f5fa', dark: '#14293a' },
        fg: { light: '#1264a3', dark: '#1d9bd1' },
        border: { light: '#a3d3ea', dark: '#1d4e66' },
        solid: { light: '#1264a3', dark: '#1264a3' },
        onSolid: '#ffffff',
      },
      selection: {
        bg: { light: '#c8e1f4', dark: '#1d4e66' },
        fg: { light: '#1d1c1d', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // The reference's own UI face is Lato (served as a private build of it)
        sans: '"Lato", -apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        // Marketing headings: a geometric bold, standing in for the reference's proprietary face
        display: '"Red Hat Display Variable", "Red Hat Display", "Lato", ui-sans-serif, system-ui, sans-serif',
        mono: '"Fira Mono", Monaco, Menlo, Consolas, "Courier New", monospace',
      },
      size: {
        xs: '0.75rem',
        sm: '0.8125rem',
        md: '0.9375rem',
        lg: '1.125rem',
        xl: '1.375rem',
        '2xl': '1.75rem',
        '3xl': '2rem',
        '4xl': '3.125rem',
      },
      // Lato ships 400, 700 and 900: names and titles are Black, buttons and labels Bold
      weight: { regular: '400', medium: '700', semibold: '700', bold: '900' },
      leading: { tight: '1.2', normal: '1.46668', relaxed: '1.5' },
      tracking: { tight: '-0.016em', normal: '0', wide: '0.057em' },
      body: { weight: '400' },
      heading: {
        family: '"Lato", -apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        weight: '900',
        tracking: '-0.012em',
      },
    },
    control: {
      height: {
        sm: 'calc(1.75rem * var(--m-density))',
        md: 'calc(2.25rem * var(--m-density))',
        lg: 'calc(2.75rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.5rem * var(--m-density))',
        md: 'calc(0.75rem * var(--m-density))',
        lg: 'calc(1rem * var(--m-density))',
      },
    },
    radius: { sm: '4px', md: '8px', lg: '12px', control: '8px', container: '8px' },
    shadow: {
      // A 13% ink ring plus a short drop, as the reference's floating message actions and menus
      sm: {
        light: `0 0 0 1px ${ink(0.13)}, 0 1px 3px 0 rgb(0 0 0 / 0.08)`,
        dark: `0 0 0 1px ${snow(0.13)}, 0 1px 3px 0 rgb(0 0 0 / 0.3)`,
      },
      md: {
        light: `0 0 0 1px ${ink(0.13)}, 0 4px 12px 0 rgb(0 0 0 / 0.12)`,
        dark: `0 0 0 1px ${snow(0.13)}, 0 4px 12px 0 rgb(0 0 0 / 0.4)`,
      },
      lg: {
        light: `0 0 0 1px ${ink(0.13)}, 0 4px 12px 0 rgb(0 0 0 / 0.12)`,
        dark: `0 0 0 1px ${snow(0.13)}, 0 4px 12px 0 rgb(0 0 0 / 0.4)`,
      },
      overlay: {
        light: `0 0 0 1px ${ink(0.13)}, 0 18px 48px 0 rgb(0 0 0 / 0.35)`,
        dark: `0 0 0 1px ${snow(0.13)}, 0 18px 48px 0 rgb(0 0 0 / 0.55)`,
      },
    },
    motion: {
      duration: { fast: '80ms', normal: '150ms', slow: '250ms' },
      easing: { standard: 'cubic-bezier(0.36, 0.19, 0.29, 1)', emphasized: 'cubic-bezier(0.36, 0.19, 0.29, 1)' },
    },
  },
  components: {
    // A 72px rail, a 260px channel list, the conversation, and a 400px thread pane
    layout: {
      containerMax: { sm: '30rem', md: '45rem', lg: '75rem' },
      containerPadding: 'clamp(1rem, 3vw, 1.25rem)',
      gridGap: 'var(--m-space-4)',
      splitSide: '16.25rem',
    },
    // 8px corners, Lato Bold 15px; secondary is white with a faint ink edge
    button: {
      radius: '8px',
      fontSize: 'var(--m-font-size-md)',
      fontWeight: 'var(--m-font-weight-medium)',
      borderWidth: '1px',
      shadow: 'none',
      hoverShadow: `0 1px 4px 0 ${ink(0.08)}`,
      gap: 'var(--m-space-2)',
      primary: { border: 'transparent' },
      secondary: {
        bg: { light: '#ffffff', dark: '#1a1d21' },
        fg: 'var(--m-color-fg-default)',
        border: { light: ink(0.3), dark: snow(0.3) },
        hoverBg: { light: '#f8f8f8', dark: '#222529' },
        activeBg: { light: '#efefef', dark: '#2b2d31' },
      },
      ghost: { fg: 'var(--m-color-fg-default)', hoverBg: { light: ink(0.06), dark: snow(0.08) }, activeBg: { light: ink(0.1), dark: snow(0.12) } },
      danger: {
        bg: '#e01e5a',
        fg: '#ffffff',
        border: 'transparent',
        hoverBg: '#e23067',
        activeBg: '#c41d51',
      },
    },
    input: {
      bg: 'var(--m-color-bg-canvas)',
      placeholder: 'var(--m-color-fg-subtle)',
      focusBorder: 'var(--m-color-border-focus)',
      radius: '8px',
      fontSize: 'var(--m-font-size-md)',
      height: { md: 'calc(2.5rem * var(--m-density))' },
      paddingX: { md: 'calc(0.75rem * var(--m-density))' },
    },
    select: {
      bg: 'var(--m-color-bg-canvas)',
      focusBorder: 'var(--m-color-border-focus)',
      radius: '8px',
      fontSize: 'var(--m-font-size-md)',
      height: { md: 'calc(2.5rem * var(--m-density))' },
    },
    field: {
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: 'var(--m-font-size-md)',
      labelFontWeight: 'var(--m-font-weight-medium)',
      hintFg: 'var(--m-color-fg-muted)',
      requiredFg: 'var(--m-color-danger-fg)',
    },
    // Checked boxes are the blue highlight, not the send green
    checkbox: {
      size: '1.125rem',
      radius: '4px',
      checkedBg: { light: '#1264a3', dark: '#1d9bd1' },
      checkedBorder: { light: '#1264a3', dark: '#1d9bd1' },
      mark: { light: '#ffffff', dark: '#1a1d21' },
    },
    radio: {
      size: '1.125rem',
      checkedBg: { light: '#1264a3', dark: '#1d9bd1' },
      checkedBorder: { light: '#1264a3', dark: '#1d9bd1' },
      dot: { light: '#ffffff', dark: '#1a1d21' },
    },
    switch: {
      width: '2.25rem',
      height: '1.25rem',
      trackBg: { light: '#868686', dark: '#7c7e82' },
      trackCheckedBg: 'var(--m-color-accent-default)',
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbShadow: 'none',
    },
    // Attachments and app cards: a hairline, 12px corners, no shadow
    card: {
      bg: 'var(--m-color-bg-surface)',
      border: 'var(--m-color-border-default)',
      radius: '12px',
      shadow: 'none',
      hoverShadow: 'var(--m-shadow-sm)',
      hoverBorder: 'var(--m-color-border-default)',
      hoverTransform: 'none',
      titleSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-bold)',
      padding: { md: 'var(--m-space-4)' },
    },
    // The channel list on its plum: dimmed rows, a darker hover, the blue current row
    sidebar: {
      bg: { light: '#4a154b', dark: '#2c0f2e' },
      border: 'transparent',
      borderWidth: '0px',
      fontSize: 'var(--m-font-size-md)',
      itemGap: '0px',
      padding: 'var(--m-space-2)',
      sectionGap: 'var(--m-space-4)',
      link: {
        fg: { light: '#d6c9d6', dark: '#cbbdcc' },
        hoverFg: '#ffffff',
        hoverBg: { light: '#350d36', dark: '#1e0a20' },
        activeFg: '#ffffff',
        activeBg: '#1164a3',
        activeWeight: 'var(--m-font-weight-regular)',
        radius: '6px',
        paddingX: 'var(--m-space-4)',
        paddingY: 'calc(0.25rem * var(--m-density))',
      },
      heading: {
        fg: { light: '#d6c9d6', dark: '#cbbdcc' },
        size: 'var(--m-font-size-md)',
        weight: 'var(--m-font-weight-regular)',
        transform: 'none',
        tracking: '0',
      },
      // Mention counts: the red pill with a white number
      count: { bg: '#cd2553', fg: '#ffffff', radius: '9999px' },
    },
    navbar: {
      bg: 'var(--m-color-bg-canvas)',
      border: 'var(--m-color-border-default)',
      link: {
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-regular)',
        fg: 'var(--m-color-fg-default)',
        activeFg: 'var(--m-color-fg-default)',
        activeBg: 'var(--m-color-bg-sunken)',
      },
    },
    // Channel tabs: 13px Bold, a 2px plum underline under the current one
    tabs: {
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-medium)',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: { light: '#83388a', dark: '#c58ec9' },
      indicatorWidth: '2px',
      listBorder: 'var(--m-color-border-default)',
      pill: {
        listBg: 'transparent',
        listPadding: '0',
        listRadius: '8px',
        radius: '8px',
        activeBg: 'var(--m-color-accent-subtle)',
        activeShadow: 'inset 0 0 0 1px var(--m-color-accent-text)',
      },
    },
    // Admin tables: no header fill, hairline rows, a faint hover
    table: {
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-muted)',
      headerTransform: 'none',
      headerTracking: '0',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-medium)',
      fontSize: 'var(--m-font-size-md)',
      rowHoverBg: 'var(--m-color-bg-sunken)',
      stripeBg: 'transparent',
      borderColor: 'var(--m-color-border-default)',
      wrapBorder: 'var(--m-color-border-default)',
      wrapRadius: '8px',
    },
    // Small tags: "NEW" in blue on the blue tint, "APP" in grey; 4px corners, Bold capitals
    badge: {
      radius: '4px',
      fontSize: '0.6875rem',
      fontWeight: 'var(--m-font-weight-medium)',
      textTransform: 'uppercase',
      tracking: '0.02em',
      borderWidth: '0px',
      paddingX: '0.3125rem',
      neutral: {
        bg: { light: ink(0.1), dark: snow(0.13) },
        fg: 'var(--m-color-fg-muted)',
        solidBg: 'var(--m-color-brand-default)',
        solidFg: '#ffffff',
      },
    },
    // People are rounded squares: initials in white on a colour
    avatar: {
      size: { sm: '1.25rem', md: '2.25rem', lg: '4.5rem' },
      radius: '8px',
      bg: { light: '#4a154b', dark: '#83388a' },
      fg: '#ffffff',
      fontWeight: 'var(--m-font-weight-bold)',
    },
    // Banners: the tone's tint, no edge, 8px corners
    alert: {
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '8px',
      padding: 'var(--m-space-3) var(--m-space-4)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    toast: {
      bg: 'var(--m-color-bg-raised)',
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '8px',
      shadow: 'var(--m-shadow-md)',
      padding: 'var(--m-space-3) var(--m-space-4)',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-bold)',
      width: '22rem',
    },
    dialog: {
      bg: 'var(--m-color-bg-surface)',
      border: 'transparent',
      borderWidth: '0px',
      radius: '12px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-5) var(--m-space-6)',
      backdrop: 'var(--m-color-bg-overlay)',
      width: { sm: '30rem', md: '32.5rem', lg: '50rem' },
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-bold)',
    },
    // Menus: 15px rows that fill with the blue highlight and turn white under the pointer
    popover: {
      bg: 'var(--m-color-bg-raised)',
      border: 'transparent',
      borderWidth: '0px',
      radius: '8px',
      shadow: 'var(--m-shadow-md)',
      padding: 'var(--m-space-3) 0',
      minWidth: '15rem',
      item: {
        height: '1.75rem',
        paddingX: 'var(--m-space-6)',
        radius: '0',
        fontSize: 'var(--m-font-size-md)',
        fg: 'var(--m-color-fg-default)',
        hoverBg: '#1264a3',
        hoverFg: '#ffffff',
        dangerFg: 'var(--m-color-danger-fg)',
      },
      separator: 'var(--m-color-border-default)',
    },
    // Tooltips are black with white Bold 13px
    tooltip: {
      bg: { light: '#1d1c1d', dark: '#0b0c0e' },
      fg: '#ffffff',
      radius: '6px',
      shadow: 'var(--m-shadow-md)',
      paddingX: 'var(--m-space-2)',
      paddingY: 'var(--m-space-1)',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-medium)',
      maxWidth: '15rem',
    },
    // The date divider: a hairline with a pill on it
    divider: {
      color: 'var(--m-color-border-default)',
      labelFg: 'var(--m-color-fg-default)',
      labelFontSize: 'var(--m-font-size-sm)',
      labelTransform: 'none',
      labelTracking: '0',
      labelGap: '0',
    },
    progress: {
      height: { md: '0.5rem' },
      radius: '9999px',
      track: { light: '#e8e8e8', dark: '#35373b' },
      fill: 'var(--m-color-accent-text)',
    },
    skeleton: { bg: { light: ink(0.06), dark: snow(0.08) }, highlight: { light: ink(0.1), dark: snow(0.13) } },
    accordion: { radius: '8px', bg: 'transparent', summaryWeight: 'var(--m-font-weight-medium)', hoverBg: 'var(--m-color-bg-sunken)' },
    // Code: blocks on the quiet grey with a hairline; inline code in red on a faint grey
    code: {
      bg: { light: '#f8f8f8', dark: '#222529' },
      border: { light: ink(0.13), dark: snow(0.13) },
      radius: '4px',
      inlineBg: { light: '#f6f6f6', dark: '#222529' },
      inlineFg: { light: '#c41d51', dark: '#f0628e' },
      inlineRadius: '3px',
    },
    kbd: {
      bg: 'var(--m-color-bg-canvas)',
      border: { light: ink(0.3), dark: snow(0.3) },
      radius: '4px',
      shadow: `0 1px 0 0 ${ink(0.3)}`,
      fontWeight: 'var(--m-font-weight-medium)',
    },
    prose: {
      linkFg: 'var(--m-color-accent-text)',
      quoteBorder: { light: '#dddddd', dark: '#545559' },
      quoteBorderWidth: '4px',
      quoteStyle: 'normal',
    },
    // The message list: flat rows, a 36px rounded-square avatar, the name in Black and a muted time
    chat: {
      gap: 'var(--m-space-2)',
      maxWidth: 'none',
      padding: '0',
      paddingX: '0',
      radius: '0',
      borderWidth: '0px',
      userBg: 'transparent',
      userBorder: 'transparent',
      assistantBg: 'transparent',
      assistantBorder: 'transparent',
      avatarSize: '2.25rem',
      avatarRadius: '8px',
      avatarBg: { light: '#4a154b', dark: '#83388a' },
      avatarFg: '#ffffff',
      assistantAvatarBg: 'var(--m-color-accent-default)',
      assistantAvatarFg: '#ffffff',
      metaFg: 'var(--m-color-fg-muted)',
      metaFontSize: 'var(--m-font-size-xs)',
    },
    // The composer: a hairline box, 8px corners; the formatting bar sits inside on top
    composer: {
      bg: 'var(--m-color-bg-canvas)',
      radius: '8px',
      fontSize: 'var(--m-font-size-md)',
      shadow: 'none',
      padding: 'var(--m-space-2) var(--m-space-3)',
      focusBorder: { light: '#616061', dark: '#ababad' },
    },
    citation: { chipBg: { light: ink(0.06), dark: snow(0.08) }, chipFg: 'var(--m-color-fg-default)', chipRadius: '4px' },
    usage: { okFill: 'var(--m-color-accent-text)', track: { light: '#e8e8e8', dark: '#35373b' } },
  },
});
