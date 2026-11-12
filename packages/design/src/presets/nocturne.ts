import { extendTheme } from '../engine/theme';
import { minimal } from './minimal';

// Dark mode is the app: night-blue scenes with white type. Surfaces are darker than the scene (the
// app lays a dark veil over it), and the one action is a white pill with night-navy text
const night = '#1c2154';
const veil = '#171a3f';
const navy = '#0e1d45';
const ink = '#291a3c';
const violet = '#555be4';
// The neutral fill on light pages (category chips, quiet panels)
const mist = '#f7f7f7';

/**
 * Nocturne: a dark-first wellbeing interface. Night-blue scenes washed from blue into indigo, white
 * type over them, generous rounded tiles with durations, white pill actions, outlined pill chips
 * and a soft brand violet; light pages are white with deep-plum ink and a violet action. Category:
 * calm and minimal. The values are measured, not invented (see DESIGN.md).
 */
export const nocturne = extendTheme(minimal, {
  name: 'nocturne',
  label: 'Nocturne',
  description:
    'Dark-first and gentle: night-blue scenes, white type, rounded tiles with durations, white pill actions and a soft violet brand; light pages in deep-plum ink.',
  tokens: {
    color: {
      bg: {
        canvas: { light: '#ffffff', dark: night },
        // Panels on a scene are a dark veil over it, darker than the canvas
        surface: { light: '#ffffff', dark: veil },
        raised: { light: '#ffffff', dark: '#262b66' },
        // The side menu's deep navy; on light pages the pale chip grey
        sunken: { light: mist, dark: navy },
        overlay: { light: 'rgb(41 26 60 / 0.5)', dark: 'rgb(6 8 28 / 0.72)' },
        inverse: { light: ink, dark: '#ffffff' },
      },
      fg: {
        default: { light: ink, dark: '#ffffff' },
        // White at about 75% and 60% over the night canvas, flattened
        muted: { light: '#4f4763', dark: '#c6c8d4' },
        subtle: { light: '#6b6580', dark: '#a4a6bb' },
        inverse: { light: '#ffffff', dark: '#121331' },
      },
      border: {
        // White at 14% and 8% over the night canvas; field edges at 50%
        default: { light: '#e6e4ec', dark: '#3c406c' },
        muted: { light: '#f1f0f4', dark: '#2e3362' },
        strong: { light: '#8a8599', dark: '#8e90aa' },
        focus: { light: violet, dark: '#ffffff' },
      },
      accent: {
        // Light pages: the violet action. The app: a white pill with night-navy text
        default: { light: violet, dark: '#ffffff' },
        hover: { light: '#4a4fd0', dark: '#e6e8f2' },
        active: { light: '#4e4bb1', dark: '#d3d6e6' },
        subtle: { light: '#efeffc', dark: '#2b3170' },
        fg: { light: '#ffffff', dark: '#121331' },
        // Links: the violet; on the night, the app's periwinkle
        text: { light: violet, dark: '#8fbcf2' },
      },
      // The signature violet of the brand gradient (sky to violet); subtle is the scene wash's top
      brand: {
        default: '#6461e0',
        fg: '#ffffff',
        subtle: { light: '#eef4fd', dark: '#1d4a86' },
      },
      // Done days and finished sessions are a soft mint
      success: {
        bg: { light: '#e8f7f1', dark: '#183a3e' },
        fg: { light: '#1a7a5c', dark: '#7fe0c0' },
        border: { light: '#b5e6d4', dark: '#2c6a62' },
        solid: { light: '#1d7d5f', dark: '#5fd0ac' },
        onSolid: { light: '#ffffff', dark: navy },
      },
      // The trial badge's yellow
      warning: {
        bg: { light: '#fff8dc', dark: '#3a3420' },
        fg: { light: '#8a5a00', dark: '#f7d77a' },
        border: { light: '#f2dc8a', dark: '#6b5a26' },
        solid: '#f7d32f',
        onSolid: '#2a1d00',
      },
      danger: {
        bg: { light: '#fdeeee', dark: '#3b1d3f' },
        fg: { light: '#b83a3a', dark: '#ff9a9a' },
        border: { light: '#f3c4c0', dark: '#7a3550' },
        solid: '#c8414a',
        onSolid: '#ffffff',
      },
      info: {
        bg: { light: '#eef6ff', dark: '#1d2f66' },
        fg: { light: '#1863dc', dark: '#8fbcf2' },
        border: { light: '#c4dcf7', dark: '#355a9a' },
        solid: { light: '#1863dc', dark: '#60b4e7' },
        onSolid: { light: '#ffffff', dark: navy },
      },
      selection: {
        bg: { light: '#d9d8f8', dark: '#3b4185' },
        fg: { light: ink, dark: '#ffffff' },
      },
    },
    font: {
      family: {
        // The reference's own web face, open; the app's face is close to it
        sans: '"Figtree Variable", "Figtree", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        display: '"Figtree Variable", "Figtree", ui-sans-serif, system-ui, sans-serif',
        // Long reading (articles, stories) is set in a gentle serif
        serif: '"Lora Variable", "Lora", ui-serif, Georgia, Cambria, serif',
        mono: '"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      },
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
      weight: { regular: '400', medium: '500', semibold: '600', bold: '650' },
      leading: { tight: '1.1', normal: '1.5', relaxed: '1.8' },
      tracking: { tight: '0', normal: '0', wide: '0.1em' },
      // Titles over scenes are light and roomy; names on tiles carry the weight
      heading: { weight: '400', tracking: '0' },
    },
    control: {
      // Big touch targets: 44px by default, 52px for the main pill
      height: {
        sm: 'calc(2.25rem * var(--m-density))',
        md: 'calc(2.75rem * var(--m-density))',
        lg: 'calc(3.25rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(1rem * var(--m-density))',
        md: 'calc(1.5rem * var(--m-density))',
        lg: 'calc(2rem * var(--m-density))',
      },
      fontSize: 'var(--m-font-size-md)',
      minTarget: '44px',
    },
    radius: { sm: '6px', md: '8px', lg: '20px' },
    shadow: {
      // Light pages: one soft, wide, neutral drop. The night needs no shadow, only depth
      sm: { light: '0 2px 10px rgb(0 0 0 / 0.05)', dark: '0 1px 2px rgb(0 0 0 / 0.3)' },
      md: { light: '0 2px 12px rgb(0 0 0 / 0.08)', dark: '0 4px 16px rgb(0 0 0 / 0.35)' },
      lg: { light: '0 2px 24px rgb(0 0 0 / 0.08)', dark: '0 8px 28px rgb(0 0 0 / 0.4)' },
      overlay: {
        light: '0 8px 22px rgb(70 90 140 / 0.12), 0 24px 48px rgb(41 26 60 / 0.12)',
        dark: '0 0 0 1px rgb(255 255 255 / 0.08), 0 24px 56px rgb(0 0 0 / 0.55)',
      },
    },
    motion: {
      // Unhurried: things fade and settle
      duration: { fast: '200ms', normal: '400ms', slow: '700ms' },
      easing: { standard: 'cubic-bezier(0.4, 0, 0.2, 1)', emphasized: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    },
  },
  components: {
    // A content column beside a side menu; tiles in rows 24px apart
    layout: {
      containerMax: { sm: '28rem', md: '44rem', lg: '75rem' },
      containerPadding: 'clamp(1rem, 4vw, 3rem)',
      gridGap: 'var(--m-space-6)',
      splitSide: '15rem',
    },
    // Pills. Primary: the white pill on the night, violet on light pages. Secondary: the outlined
    // pill (a dark veil with a white edge on the night; white with a violet edge on light pages)
    button: {
      radius: '9999px',
      fontWeight: 'var(--m-font-weight-semibold)',
      borderWidth: '1.5px',
      shadow: 'none',
      hoverShadow: 'none',
      activeShadow: 'none',
      gap: 'var(--m-space-2)',
      secondary: {
        bg: { light: '#ffffff', dark: '#13163a' },
        fg: { light: violet, dark: '#ffffff' },
        border: { light: violet, dark: '#8e90aa' },
        hoverBg: { light: '#efeffc', dark: '#232861' },
        activeBg: { light: '#e3e3fa', dark: '#2b3170' },
      },
      ghost: {
        fg: { light: violet, dark: '#ffffff' },
        hoverBg: { light: '#efeffc', dark: '#2b3170' },
        activeBg: { light: '#e3e3fa', dark: '#343a7c' },
      },
      danger: {
        bg: 'var(--m-color-danger-solid)',
        fg: '#ffffff',
        border: 'transparent',
        hoverBg: '#b5363f',
        activeBg: '#a02f37',
      },
    },
    // Fields: a dark veil with a half-white edge on the night; white with a grey edge on light
    // pages. 52px tall, 8px corners, the icon inside on the left
    input: {
      bg: { light: '#ffffff', dark: veil },
      border: 'var(--m-color-border-strong)',
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: { light: violet, dark: '#ffffff' },
      invalidBorder: 'var(--m-color-danger-fg)',
      disabledBg: 'var(--m-color-bg-sunken)',
      radius: '8px',
      fontSize: 'var(--m-font-size-md)',
      height: {
        sm: 'calc(2.5rem * var(--m-density))',
        md: 'calc(3.25rem * var(--m-density))',
        lg: 'calc(3.5rem * var(--m-density))',
      },
      paddingX: {
        sm: 'calc(0.75rem * var(--m-density))',
        md: 'calc(1rem * var(--m-density))',
        lg: 'calc(1.25rem * var(--m-density))',
      },
    },
    select: {
      bg: { light: '#ffffff', dark: veil },
      border: 'var(--m-color-border-strong)',
      hoverBorder: 'var(--m-color-fg-muted)',
      focusBorder: { light: violet, dark: '#ffffff' },
      invalidBorder: 'var(--m-color-danger-fg)',
      radius: '8px',
      fontSize: 'var(--m-font-size-md)',
      height: {
        sm: 'calc(2.5rem * var(--m-density))',
        md: 'calc(3.25rem * var(--m-density))',
        lg: 'calc(3.5rem * var(--m-density))',
      },
    },
    field: {
      gap: 'var(--m-space-2)',
      labelFg: 'var(--m-color-fg-muted)',
      labelFontSize: 'var(--m-font-size-sm)',
      labelFontWeight: 'var(--m-font-weight-regular)',
      hintFg: 'var(--m-color-fg-subtle)',
      hintFontSize: 'var(--m-font-size-sm)',
      errorFontWeight: 'var(--m-font-weight-regular)',
    },
    // Ticks are round: a white disc with a dark tick on the night, violet on light pages
    checkbox: { size: '1.375rem', radius: '9999px', borderWidth: '1.5px', hoverBorder: 'var(--m-color-fg-muted)' },
    radio: { size: '1.375rem', borderWidth: '1.5px', hoverBorder: 'var(--m-color-fg-muted)' },
    switch: {
      width: '3.25rem',
      height: '2rem',
      thumbInset: '2px',
      trackBg: 'var(--m-color-border-strong)',
      trackCheckedBg: 'var(--m-color-brand-default)',
      thumbBg: '#ffffff',
      thumbCheckedBg: '#ffffff',
      thumbShadow: '0 2px 4px rgb(0 0 0 / 0.2)',
      border: 'transparent',
    },
    // Light pages: white, 20px corners, one wide soft drop, no border. On the night: the dark veil,
    // no border, no shadow
    card: {
      border: 'transparent',
      shadow: { light: 'var(--m-shadow-lg)', dark: 'none' },
      hoverShadow: { light: '0 8px 22px rgb(70 90 140 / 0.12)', dark: 'none' },
      hoverBorder: 'transparent',
      hoverTransform: 'none',
      radius: '20px',
      padding: { sm: 'var(--m-space-4)', md: 'var(--m-space-6)', lg: 'var(--m-space-8)' },
      titleFamily: 'var(--m-font-family-sans)',
      titleSize: 'var(--m-font-size-lg)',
      titleWeight: 'var(--m-font-weight-semibold)',
      descriptionFg: 'var(--m-color-fg-muted)',
      descriptionSize: 'var(--m-font-size-sm)',
      outline: { bg: 'transparent', border: 'var(--m-color-border-default)' },
      sunken: { bg: 'var(--m-color-bg-sunken)', border: 'transparent' },
    },
    table: {
      bg: 'transparent',
      fontSize: 'var(--m-font-size-md)',
      cellPaddingX: 'var(--m-space-4)',
      cellPaddingY: 'var(--m-space-4)',
      headerBg: 'transparent',
      headerFg: 'var(--m-color-fg-subtle)',
      headerFontSize: 'var(--m-font-size-sm)',
      headerFontWeight: 'var(--m-font-weight-regular)',
      headerTransform: 'none',
      headerTracking: '0',
      borderColor: 'var(--m-color-border-default)',
      rowHoverBg: { light: mist, dark: '#232861' },
      stripeBg: 'transparent',
      wrapBorder: 'transparent',
      wrapRadius: '0',
    },
    // The side menu: deep navy on the night, icon and label rows; the current one is a lifted row
    // (recipes add the white edge the app draws round it)
    sidebar: {
      width: '15rem',
      bg: 'var(--m-color-bg-sunken)',
      border: 'transparent',
      padding: 'var(--m-space-6) var(--m-space-4)',
      itemGap: 'var(--m-space-2)',
      fontSize: 'var(--m-font-size-md)',
      link: {
        fg: { light: ink, dark: '#c6c8d4' },
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: '#efeef3', dark: '#16275a' },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: '#ffffff', dark: '#1a2a5e' },
        activeWeight: 'var(--m-font-weight-semibold)',
        radius: '10px',
        paddingX: 'var(--m-space-3)',
        paddingY: 'calc(var(--m-space-3) * var(--m-density))',
      },
      heading: {
        fg: 'var(--m-color-fg-subtle)',
        size: 'var(--m-font-size-sm)',
        weight: 'var(--m-font-weight-regular)',
        transform: 'none',
        tracking: '0',
      },
      count: { bg: 'var(--m-color-brand-default)', fg: '#ffffff', radius: '9999px' },
    },
    // Light pages: a white bar, 14px ink links, the violet pill on the right
    navbar: {
      height: '5rem',
      border: 'transparent',
      shadow: 'none',
      brandFamily: 'var(--m-font-family-sans)',
      brandWeight: 'var(--m-font-weight-semibold)',
      brandSize: 'var(--m-font-size-xl)',
      link: {
        radius: '9999px',
        paddingX: 'var(--m-space-4)',
        fontSize: 'var(--m-font-size-sm)',
        fontWeight: 'var(--m-font-weight-regular)',
        fg: 'var(--m-color-fg-default)',
        hoverFg: 'var(--m-color-fg-default)',
        hoverBg: { light: mist, dark: '#2b3170' },
        activeFg: 'var(--m-color-fg-default)',
        activeBg: { light: mist, dark: '#2b3170' },
      },
    },
    // Underline tabs: white (ink) text with a 2px line. The segmented control: a dark veil track
    // with a lifted segment; on light pages a grey track with a white segment
    tabs: {
      fontSize: 'var(--m-font-size-md)',
      fontWeight: 'var(--m-font-weight-regular)',
      fg: 'var(--m-color-fg-muted)',
      hoverFg: 'var(--m-color-fg-default)',
      activeFg: 'var(--m-color-fg-default)',
      indicator: 'var(--m-color-fg-default)',
      indicatorWidth: '2px',
      listBorder: 'var(--m-color-border-default)',
      pill: {
        listBg: { light: '#f1f0f4', dark: veil },
        listRadius: '9999px',
        listPadding: '3px',
        radius: '9999px',
        activeBg: { light: '#ffffff', dark: '#3b4185' },
        activeShadow: { light: '0 2px 10px rgb(0 0 0 / 0.08)', dark: 'none' },
      },
    },
    pagination: {
      radius: '9999px',
      border: 'transparent',
      fg: 'var(--m-color-fg-default)',
      hoverBg: { light: mist, dark: '#2b3170' },
      currentBg: 'var(--m-color-accent-default)',
      currentFg: 'var(--m-color-accent-fg)',
      currentBorder: 'transparent',
    },
    breadcrumb: {
      separator: '"›"',
      fg: 'var(--m-color-fg-subtle)',
      hoverFg: 'var(--m-color-fg-default)',
      currentFg: 'var(--m-color-fg-default)',
    },
    // Small pills: tags in tracked caps on light pages, "New" as a white pill, durations on a veil
    badge: {
      height: '1.5rem',
      paddingX: '0.625rem',
      radius: '9999px',
      fontSize: 'var(--m-font-size-xs)',
      fontWeight: 'var(--m-font-weight-semibold)',
      textTransform: 'none',
      tracking: '0',
      neutral: {
        bg: { light: '#f3fcff', dark: '#2b3170' },
        fg: { light: '#1f5f9e', dark: '#ffffff' },
        border: 'var(--m-color-border-strong)',
        solidBg: { light: ink, dark: '#ffffff' },
        solidFg: { light: '#ffffff', dark: '#121331' },
      },
    },
    avatar: {
      bg: { light: '#efeffc', dark: '#2b3170' },
      fg: { light: '#4e4bb1', dark: '#ffffff' },
      fontWeight: 'var(--m-font-weight-semibold)',
    },
    alert: {
      border: 'transparent',
      borderWidth: '0px',
      accentWidth: '0px',
      radius: '12px',
      padding: 'var(--m-space-4)',
      titleWeight: 'var(--m-font-weight-semibold)',
    },
    // The app's toast is a small white card with dark text, on both pages
    toast: {
      bg: { light: ink, dark: '#ffffff' },
      fg: { light: '#ffffff', dark: '#121331' },
      bodyFg: { light: '#d9d5e2', dark: '#4f4763' },
      border: 'transparent',
      accentWidth: '0px',
      radius: '14px',
      shadow: 'var(--m-shadow-overlay)',
    },
    dialog: {
      bg: 'var(--m-color-bg-raised)',
      border: 'transparent',
      radius: '24px',
      padding: 'var(--m-space-8)',
      titleFamily: 'var(--m-font-family-sans)',
      titleSize: 'var(--m-font-size-2xl)',
      titleWeight: 'var(--m-font-weight-regular)',
    },
    popover: {
      bg: 'var(--m-color-bg-raised)',
      border: 'transparent',
      radius: '16px',
      shadow: 'var(--m-shadow-overlay)',
      padding: 'var(--m-space-2)',
      item: {
        height: '2.75rem',
        radius: '10px',
        fontSize: 'var(--m-font-size-md)',
        hoverBg: { light: mist, dark: '#343a7c' },
        dangerFg: { light: '#b83a3a', dark: '#ffb3b3' },
      },
    },
    tooltip: {
      bg: 'var(--m-color-bg-inverse)',
      fg: 'var(--m-color-fg-inverse)',
      radius: '8px',
      fontSize: 'var(--m-font-size-sm)',
      fontWeight: 'var(--m-font-weight-medium)',
      shadow: 'none',
    },
    // A rounded bar in the brand violet on a quiet track
    progress: {
      height: { sm: '0.25rem', md: '0.375rem', lg: '0.5rem' },
      radius: '9999px',
      track: { light: '#e6e4ec', dark: '#2e3362' },
      // On the night, the violet's lighter step (the base violet is under 3:1 on the track)
      fill: { light: '#6461e0', dark: '#8a88f0' },
    },
    skeleton: { bg: { light: '#efeef3', dark: '#262b66' }, highlight: { light: mist, dark: '#2e3473' } },
    spinner: { color: 'var(--m-color-fg-default)', track: 'var(--m-color-border-default)' },
    kbd: {
      radius: '6px',
      border: 'var(--m-color-border-default)',
      shadow: 'none',
      fontWeight: 'var(--m-font-weight-medium)',
    },
    accordion: { radius: '0', bg: 'transparent', summarySize: 'var(--m-font-size-lg)', summaryWeight: 'var(--m-font-weight-regular)' },
    divider: { color: 'var(--m-color-border-default)' },
    prose: {
      fontSize: 'var(--m-font-size-lg)',
      lineHeight: 'var(--m-font-leading-relaxed)',
      linkFg: 'var(--m-color-accent-text)',
    },
    chat: {
      radius: '20px',
      userBg: { light: '#efeffc', dark: '#2b3170' },
      userFg: 'var(--m-color-fg-default)',
    },
    composer: { radius: '20px', borderWidth: '1.5px' },
  },
});
