import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

/**
 * Tally: a crisp, neutral link-and-analytics workspace. Near-black on white panels set into a light grey
 * frame, a two-tier sidebar on a pale grey panel with a blue current item, a black primary with a soft
 * grey ring on hover, 8px controls, 12px cards and rows, 14px text and colour kept for data and status.
 * Category: calm and minimal. The values are measured, not invented (see DESIGN.md).
 */
export const tally = extendTheme(minimal, {
  name: 'tally',
  label: 'Tally',
  description:
    'Crisp and neutral: near-black on white panels in a grey frame, a black primary with a grey halo, a blue current item, 12px cards and 14px text.',
  tokens: {
    color: {
      bg: {
        // The white content panel; the grey frame around it is the sunken step one darker (see the recipes)
        canvas: { light: '#ffffff', dark: '#000000' },
        surface: { light: '#ffffff', dark: '#0a0a0a' },
        raised: { light: '#ffffff', dark: '#171717' },
        // The sidebar's area panel and quiet fills
        sunken: { light: '#f5f5f5', dark: '#171717' },
        overlay: { light: 'rgb(245 245 245 / 0.5)', dark: 'rgb(0 0 0 / 0.6)' },
        inverse: { light: '#171717', dark: '#fafafa' },
      },
      fg: {
        default: { light: '#171717', dark: '#fafafa' },
        muted: { light: '#525252', dark: '#d4d4d4' },
        subtle: { light: '#737373', dark: '#a3a3a3' },
        inverse: { light: '#ffffff', dark: '#000000' },
      },
      border: {
        // Hairlines in the 229 grey; the strong step is darkened from 163 to meet the 3:1 floor for controls
        default: { light: '#e5e5e5', dark: '#404040' },
        muted: { light: '#f5f5f5', dark: '#262626' },
        strong: { light: '#8c8c8c', dark: '#737373' },
        focus: { light: '#737373', dark: '#a3a3a3' },
      },
      // The action colour is black (white in dark): the primary button, the current analytics tab's bar
      accent: {
        default: { light: '#000000', dark: '#ffffff' },
        hover: { light: '#171717', dark: '#e5e5e5' },
        active: { light: '#262626', dark: '#d4d4d4' },
        subtle: { light: '#f5f5f5', dark: '#262626' },
        fg: { light: '#ffffff', dark: '#000000' },
        text: { light: '#171717', dark: '#fafafa' },
      },
      // Status tints are the source's; the text steps are one darker than its 600s to reach 4.5:1 on them
      success: {
        bg: { light: '#dcfce7', dark: '#052e16' },
        fg: { light: '#15803d', dark: '#86efac' },
        border: { light: '#bbf7d0', dark: '#14532d' },
        solid: { light: '#16a34a', dark: '#22c55e' },
        onSolid: { light: '#000000', dark: '#000000' },
      },
      warning: {
        bg: { light: '#fef9c3', dark: '#422006' },
        fg: { light: '#854d0e', dark: '#fde047' },
        border: { light: '#fef08a', dark: '#713f12' },
        solid: { light: '#eab308', dark: '#eab308' },
        onSolid: { light: '#171717', dark: '#171717' },
      },
      danger: {
        bg: { light: '#fee2e2', dark: '#450a0a' },
        fg: { light: '#b91c1c', dark: '#fca5a5' },
        border: { light: '#fecaca', dark: '#7f1d1d' },
        solid: { light: '#dc2626', dark: '#dc2626' },
        onSolid: '#ffffff',
      },
      info: {
        bg: { light: '#dbeafe', dark: '#172554' },
        fg: { light: '#1d4ed8', dark: '#93c5fd' },
        border: { light: '#bfdbfe', dark: '#1e3a8a' },
        solid: { light: '#2563eb', dark: '#2563eb' },
        onSolid: '#ffffff',
      },
      selection: {
        bg: { light: '#dbeafe', dark: '#1e3a8a' },
        fg: { light: '#171717', dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // The app runs in the system UI face; Inter is the open stand-in (and the source's own default family)
        sans: '"Inter Variable", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        // Public headlines: a geometric grotesque at 700 with tight tracking (Figtree stands in)
        display: '"Figtree Variable", "Figtree", "Inter Variable", ui-sans-serif, system-ui, sans-serif',
        mono: '"Geist Mono Variable", "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
      // The source's own steps: 10, 12, 14 (the app's text), 16, 18 (page titles), 24, 30 (figures), 48
      size: {
        xs: '0.625rem',
        sm: '0.75rem',
        md: '0.875rem',
        lg: '1rem',
        xl: '1.125rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '3rem',
      },
      weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
      leading: { tight: '1.25', normal: '1.43', relaxed: '1.625' },
      tracking: { tight: '-0.02em', normal: '0', wide: '0.04em' },
      body: { weight: '400' },
      heading: {
        weight: '600',
        tracking: '0',
        // App titles are small and semibold: 18px pages, 16px cards, 14px groups
        size: {
          h1: 'var(--m-font-size-xl)',
          h2: 'var(--m-font-size-lg)',
          h3: 'var(--m-font-size-md)',
          h4: 'var(--m-font-size-md)',
          h5: 'var(--m-font-size-sm)',
          h6: 'var(--m-font-size-sm)',
        },
      },
    },
    control: {
      height: {
        sm: 'calc(2rem * var(--m-density))',
        md: 'calc(2.5rem * var(--m-density))',
        lg: 'calc(2.75rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.625rem * var(--m-density))',
        md: 'calc(0.75rem * var(--m-density))',
        lg: 'calc(1rem * var(--m-density))',
      },
      fontSize: 'var(--m-font-size-md)',
    },
    // 6px fields and chips, 8px buttons and menus, 12px cards and rows, 16px dialogs and icon tiles
    radius: { sm: '6px', md: '8px', lg: '12px', xl: '16px' },
    shadow: {
      sm: { light: '0 1px 2px rgb(0 0 0 / 0.05)', dark: '0 0 0 1px rgb(255 255 255 / 0.06)' },
      // A card's hover: a short, faint drop in a blue-grey
      md: { light: '0 2px 4px rgb(34 42 53 / 0.05)', dark: '0 2px 4px rgb(0 0 0 / 0.4)' },
      // The floating selection bar and menus
      lg: {
        light: '0 5px 8px rgb(34 42 53 / 0.11)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.08), 0 5px 8px rgb(0 0 0 / 0.5)',
      },
      overlay: {
        light: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.08), 0 20px 25px -5px rgb(0 0 0 / 0.6)',
      },
    },
    ring: { width: '4px', offset: '0px' },
    motion: {
      // Hover fills at 150ms; overlays enter in 200ms on a long ease-out; popovers settle over 400ms
      duration: { fast: '150ms', normal: '200ms', slow: '400ms' },
      easing: { standard: 'cubic-bezier(0.4, 0, 0.2, 1)', emphasized: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    },
  },
  components: {
    // A 1280px column with a 24px gutter, 20px between cards, and the 304px two-tier sidebar
    layout: {
      containerMax: { sm: '28rem', md: '48rem', lg: '80rem' },
      containerPadding: 'clamp(0.75rem, 2vw, 1.5rem)',
      gridGap: '1.25rem',
      splitSide: '19rem',
    },
    // 40px, 8px corners, regular weight; the black primary gains a 4px grey halo on hover
    button: {
      radius: '8px',
      fontWeight: 'var(--m-font-weight-regular)',
      shadow: 'none',
      gap: '0.5rem',
      primary: {
        bg: { light: '#000000', dark: '#ffffff' },
        fg: { light: '#ffffff', dark: '#000000' },
        border: { light: '#000000', dark: '#ffffff' },
        hoverBg: { light: '#171717', dark: '#e5e5e5' },
        activeBg: { light: '#262626', dark: '#d4d4d4' },
        hoverShadow: { light: '0 0 0 4px #e5e5e5', dark: '0 0 0 4px #404040' },
      },
      secondary: {
        bg: { light: '#ffffff', dark: '#000000' },
        fg: { light: '#171717', dark: '#fafafa' },
        border: { light: '#e5e5e5', dark: '#404040' },
        hoverBg: { light: '#fafafa', dark: '#171717' },
        activeBg: { light: '#f5f5f5', dark: '#262626' },
      },
      ghost: {
        fg: { light: '#404040', dark: '#d4d4d4' },
        hoverBg: { light: '#f2f2f2', dark: '#1f1f1f' },
        activeBg: { light: '#e8e8e8', dark: '#262626' },
      },
      danger: {
        bg: '#dc2626',
        fg: '#ffffff',
        border: '#dc2626',
        hoverBg: '#b91c1c',
        activeBg: '#991b1b',
        hoverShadow: { light: '0 0 0 4px #fee2e2', dark: '0 0 0 4px #450a0a' },
      },
    },
    input: {
      radius: '6px',
      border: { light: '#8c8c8c', dark: '#737373' },
      hoverBorder: { light: '#737373', dark: '#a3a3a3' },
      focusBorder: { light: '#525252', dark: '#d4d4d4' },
      placeholder: { light: '#737373', dark: '#a3a3a3' },
      shadow: 'none',
      height: { md: 'calc(2.375rem * var(--m-density))' },
      paddingX: { md: 'calc(0.75rem * var(--m-density))' },
    },
    select: {
      radius: '8px',
      border: { light: '#8c8c8c', dark: '#737373' },
      hoverBorder: { light: '#737373', dark: '#a3a3a3' },
      focusBorder: { light: '#525252', dark: '#d4d4d4' },
      shadow: 'none',
      chevronStroke: '1.5px',
    },
    field: {
      gap: '0.5rem',
      labelFg: { light: '#404040', dark: '#d4d4d4' },
      labelFontSize: 'var(--m-font-size-md)',
      labelFontWeight: 'var(--m-font-weight-medium)',
      hintFg: 'var(--m-color-fg-subtle)',
      hintFontSize: 'var(--m-font-size-md)',
      errorFg: { light: '#b91c1c', dark: '#fca5a5' },
      requiredMarker: 'none',
    },
    checkbox: {
      size: '1rem',
      radius: '4px',
      border: { light: '#8c8c8c', dark: '#737373' },
      checkedBg: { light: '#171717', dark: '#fafafa' },
      checkedBorder: { light: '#171717', dark: '#fafafa' },
      mark: { light: '#ffffff', dark: '#000000' },
    },
    radio: {
      border: { light: '#8c8c8c', dark: '#737373' },
      checkedBg: { light: '#171717', dark: '#fafafa' },
      checkedBorder: { light: '#171717', dark: '#fafafa' },
      dot: { light: '#ffffff', dark: '#000000' },
    },
    // 32 × 16, blue when on
    switch: {
      width: '2rem',
      height: '1rem',
      trackBg: { light: '#8c8c8c', dark: '#737373' },
      trackCheckedBg: { light: '#2563eb', dark: '#3b82f6' },
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
    },
    // White, a 229 hairline, 12px; a faint blue-grey drop on hover, never a lift
    card: {
      border: 'var(--m-color-border-default)',
      shadow: 'none',
      padding: { md: '1.5rem' },
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-semibold)',
      descriptionFg: 'var(--m-color-fg-subtle)',
      hoverShadow: 'var(--m-shadow-md)',
      hoverBorder: 'var(--m-color-border-default)',
      hoverTransform: 'none',
      sunken: { bg: { light: '#fafafa', dark: '#0a0a0a' } },
    },
    table: {
      headerBg: 'var(--m-color-bg-surface)',
      headerFg: 'var(--m-color-fg-default)',
      headerTransform: 'none',
      headerTracking: 'var(--m-font-tracking-normal)',
      headerFontSize: 'var(--m-font-size-md)',
      headerFontWeight: 'var(--m-font-weight-medium)',
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: '1rem',
      cellPaddingY: '0.625rem',
      rowHoverBg: { light: '#fafafa', dark: '#171717' },
      stripeBg: 'var(--m-color-bg-surface)',
      wrapBorder: 'var(--m-color-border-default)',
      wrapRadius: '12px',
    },
    // The link and record rows: 12px corners, 16px across, the title semibold over a grey line
    row: {
      gap: '0.75rem',
      paddingX: '1rem',
      paddingY: '0.625rem',
      radius: '12px',
      hoverBg: { light: '#fafafa', dark: '#171717' },
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-semibold)',
      metaFg: 'var(--m-color-fg-subtle)',
      metaFontSize: 'var(--m-font-size-md)',
      trailFg: 'var(--m-color-fg-muted)',
    },
    // Tags and filter pills: 6px corners, a tinted fill with its own border
    chip: {
      height: { sm: '1.5rem', md: '2rem' },
      paddingX: '0.5rem',
      gap: '0.375rem',
      radius: '6px',
      fontSize: 'var(--m-font-size-md)',
      fontWeight: 'var(--m-font-weight-regular)',
      bg: { light: '#ffffff', dark: '#000000' },
      fg: { light: '#262626', dark: '#e5e5e5' },
      border: { light: '#e5e5e5', dark: '#404040' },
      hoverBg: { light: '#fafafa', dark: '#171717' },
      activeBg: { light: '#f5f5f5', dark: '#262626' },
      selectedBg: { light: '#171717', dark: '#fafafa' },
      selectedFg: { light: '#ffffff', dark: '#000000' },
      selectedBorder: { light: '#171717', dark: '#fafafa' },
    },
    // The empty state's tile: 64px, 16px corners, a hairline on the faintest grey
    tile: {
      size: { sm: '2rem', md: '2.5rem', lg: '4rem' },
      radius: '16px',
      bg: { light: '#fafafa', dark: '#171717' },
      fg: { light: '#262626', dark: '#e5e5e5' },
      neutralBg: { light: '#fafafa', dark: '#171717' },
      neutralFg: { light: '#262626', dark: '#e5e5e5' },
    },
    sidebar: {
      width: '14.5rem',
      bg: 'var(--m-color-bg-sunken)',
      border: 'transparent',
      padding: '0.75rem',
      sectionGap: '2rem',
      itemGap: '0.125rem',
      fontSize: 'var(--m-font-size-md)',
      // The source's 115 grey reads 4.35:1 on the panel, so the labels take one step darker
      heading: {
        fg: { light: '#6b6b6b', dark: '#a3a3a3' },
        size: 'var(--m-font-size-md)',
        weight: 'var(--m-font-weight-regular)',
        transform: 'none',
        tracking: '0',
      },
      link: {
        fg: { light: '#404040', dark: '#d4d4d4' },
        hoverFg: { light: '#171717', dark: '#fafafa' },
        hoverBg: { light: '#e9e9e9', dark: '#262626' },
        activeFg: { light: '#1d4ed8', dark: '#93c5fd' },
        activeBg: { light: '#e8effa', dark: '#172554' },
        activeWeight: 'var(--m-font-weight-medium)',
        radius: '8px',
        paddingX: '0.5rem',
        paddingY: 'calc(0.5rem * var(--m-density))',
      },
      count: {
        bg: { light: '#dbeafe', dark: '#1e3a8a' },
        fg: { light: '#1d4ed8', dark: '#dbeafe' },
        radius: '4px',
      },
    },
    // The public site bar: white, 14px links, the current one on a grey fill with 8px corners
    navbar: {
      height: '3.5rem',
      bg: 'var(--m-color-bg-canvas)',
      border: 'transparent',
      link: {
        height: '2rem',
        paddingX: '0.75rem',
        radius: '8px',
        fontSize: 'var(--m-font-size-md)',
        fontWeight: 'var(--m-font-weight-regular)',
        fg: { light: '#404040', dark: '#d4d4d4' },
        hoverFg: { light: '#171717', dark: '#fafafa' },
        hoverBg: { light: '#f5f5f5', dark: '#262626' },
        activeFg: { light: '#171717', dark: '#fafafa' },
        activeBg: { light: '#f5f5f5', dark: '#262626' },
      },
    },
    breadcrumb: {
      // Lucide's chevron-right, drawn in the separator colour
      separator: '""',
      separatorIcon:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E\")",
      separatorIconSize: '1rem',
      fg: 'var(--m-color-fg-subtle)',
      currentFg: 'var(--m-color-fg-default)',
      currentWeight: 'var(--m-font-weight-semibold)',
    },
    tabs: {
      fontWeight: 'var(--m-font-weight-regular)',
      fg: 'var(--m-color-fg-subtle)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-fg-default)',
      indicatorWidth: '2px',
      pill: {
        listBg: 'var(--m-color-bg-surface)',
        listRadius: '12px',
        listPadding: '0.25rem',
        radius: '8px',
        activeBg: { light: '#fafafa', dark: '#171717' },
        activeShadow: { light: '0 0 0 1px #e5e5e5', dark: '0 0 0 1px #404040' },
      },
    },
    // Pills: 12px medium text, a hairline in the tone, the tint inside
    badge: {
      radius: '9999px',
      height: '1.25rem',
      paddingX: '0.5rem',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-medium)',
      borderWidth: '1px',
      neutral: {
        bg: { light: '#f5f5f5', dark: '#262626' },
        fg: { light: '#262626', dark: '#e5e5e5' },
        border: { light: '#e5e5e5', dark: '#404040' },
        solidBg: { light: '#000000', dark: '#ffffff' },
        solidFg: { light: '#ffffff', dark: '#000000' },
      },
    },
    avatar: {
      bg: { light: '#e5e5e5', dark: '#404040' },
      fg: { light: '#404040', dark: '#e5e5e5' },
      border: { light: '#e5e5e5', dark: '#404040' },
      borderWidth: '1px',
    },
    alert: {
      radius: '8px',
      borderWidth: '1px',
      accentWidth: '0px',
      titleWeight: 'var(--m-font-weight-medium)',
      notice: {
        bg: { light: '#fafafa', dark: '#0a0a0a' },
        fg: 'var(--m-color-fg-muted)',
        border: 'var(--m-color-border-default)',
      },
    },
    // White toasts at the bottom centre, 8px corners, a hairline and a soft drop
    toast: {
      bg: { light: '#ffffff', dark: '#000000' },
      border: { light: '#ededed', dark: '#262626' },
      borderWidth: '1px',
      accentWidth: '0px',
      radius: '8px',
      shadow: { light: '0 4px 12px rgb(0 0 0 / 0.1)', dark: '0 4px 12px rgb(0 0 0 / 0.5)' },
      padding: '1rem',
      fontSize: 'var(--m-font-size-md)',
      titleWeight: 'var(--m-font-weight-medium)',
      width: '22.25rem',
    },
    // 16px corners on a blurred pale scrim, a hairline and the long drop
    dialog: {
      radius: '16px',
      border: 'var(--m-color-border-default)',
      shadow: 'var(--m-shadow-overlay)',
      backdrop: { light: 'rgb(245 245 245 / 0.5)', dark: 'rgb(0 0 0 / 0.6)' },
      padding: '1.5rem',
      titleSize: 'var(--m-font-size-xl)',
      titleWeight: 'var(--m-font-weight-semibold)',
      descriptionFg: 'var(--m-color-fg-subtle)',
      width: { sm: '28rem', md: '40rem', lg: '64rem' },
    },
    // Menus: 8px, a hairline and a soft drop, 36px items with 6px corners and a shortcut key at the end
    popover: {
      radius: '8px',
      border: 'var(--m-color-border-default)',
      shadow: 'var(--m-shadow-lg)',
      padding: '0.5rem',
      item: {
        height: '2.25rem',
        paddingX: '0.5rem',
        gap: '0.5rem',
        radius: '6px',
        fontSize: 'var(--m-font-size-md)',
        fg: { light: '#404040', dark: '#d4d4d4' },
        hoverBg: { light: '#f5f5f5', dark: '#262626' },
        hoverFg: { light: '#171717', dark: '#fafafa' },
        dangerFg: { light: '#dc2626', dark: '#fca5a5' },
      },
      labelFg: 'var(--m-color-fg-subtle)',
      labelSize: 'var(--m-font-size-sm)',
      labelWeight: 'var(--m-font-weight-medium)',
      shortcutFg: 'var(--m-color-fg-subtle)',
    },
    // Tooltips are white cards with 12px corners, not dark chips
    tooltip: {
      bg: { light: '#ffffff', dark: '#171717' },
      fg: { light: '#404040', dark: '#e5e5e5' },
      radius: '12px',
      shadow: {
        light: '0 0 0 1px #d4d4d4, 0 1px 2px rgb(0 0 0 / 0.05)',
        dark: '0 0 0 1px #404040, 0 1px 2px rgb(0 0 0 / 0.4)',
      },
      paddingX: '1rem',
      paddingY: '0.5rem',
      fontSize: 'var(--m-font-size-md)',
      fontWeight: 'var(--m-font-weight-regular)',
    },
    progress: {
      height: { md: '0.75rem' },
      radius: '9999px',
      fill: { light: '#2563eb', dark: '#3b82f6' },
      track: { light: '#e5e5e5', dark: '#262626' },
    },
    skeleton: { bg: { light: '#e5e5e5', dark: '#262626' }, radius: '6px', blockRadius: '12px' },
    kbd: {
      radius: '4px',
      bg: { light: '#f5f5f5', dark: '#262626' },
      fg: { light: '#525252', dark: '#d4d4d4' },
      border: { light: '#e5e5e5', dark: '#404040' },
      shadow: 'none',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: '300',
    },
    accordion: { radius: '12px' },
    // Help and docs prose: 16px on a 1.75 line, 18px semibold steps with no rule, links underlined in ink
    prose: {
      fontSize: 'var(--m-font-size-lg)',
      lineHeight: '1.75',
      fg: { light: '#404040', dark: '#d4d4d4' },
      headingFg: 'var(--m-color-fg-default)',
      h2Size: 'var(--m-font-size-xl)',
      h3Size: 'var(--m-font-size-lg)',
      h2RuleWidth: '0px',
      linkFg: 'var(--m-color-fg-default)',
    },
    code: { radius: '8px', inlineRadius: '6px', comment: { light: '#6b6b6b', dark: '#a3a3a3' } },
  },
});
