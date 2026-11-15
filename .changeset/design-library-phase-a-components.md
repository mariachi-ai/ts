---
'@mariachi/design': minor
---

Library-wide component and base-style fixes, new tokens, and five small components.

**Changes to how things look today** (check these before releasing):

- **Avatar groups overlap as the token says.** `--m-avatar-group-overlap` is now a positive distance
  applied as an overlap (a negative value still means the same). Presets with negative values look the
  same; **summit**'s `0.5rem`, which used to space its avatars apart, now overlaps them.
- **Avatar initials snap to the type scale:** the language's ramp step nearest `initialsScale` (0.38) ×
  the size, instead of an exact 0.38 × the size. Initials move by up to about 3px in most languages
  (24px avatars go from about 9px to the 11–12px xs step); past the top of the ramp they keep the
  plain share, and under 24px they cap at half the size. In a group, an initials avatar centres its
  letters in the part the next one leaves visible.
- **The progress track defaults to the hairline colour** (`color.border.default`) instead of
  `color.bg.sunken`, so it shows on white surfaces. This changes `m-progress` and `m-meter` in the
  presets that leave the track at its default: **minimal, editorial, soft, enterprise, anthracite**
  (both modes) and **halcyon** (light; it keeps the sunken track in dark). Brutalist and terminal now
  set the sunken track themselves and look the same.
- **Lists used as layout lose their bullets and indent:** `ul`/`ol` with `m-stack`, `m-cluster`,
  `m-grid` or `m-split`, and lists inside a `<nav>`, never inside `m-prose`. The reset has zero
  specificity, so any class or inline style wins; a content list built on `m-stack` keeps its markers
  with an inline `list-style`.
- **`<legend>` inherits its weight** instead of taking 600 from the base styles.
- **Tailwind:** `rounded-xl` now follows the theme's new `radius.xl`, which defaults to `radius.lg`,
  instead of Tailwind's own 12px.

**New tokens** (defaults keep today's look): `font.heading.size.h1`–`h6` for the base heading sizes;
required and optional field marking (`components.field.optionalMarker`, `.optionalFg`,
`.optionalFontWeight`; the required marker accepts `none`); `components.popover.labelWeight`; breadcrumb
`separatorIcon`, `separatorIconSize`, `linkDecoration`, and `targetSize`, a 24px hit area around each
link that leaves the layout as it is; `components.prose.h2RuleWidth` (`0px` turns off the rule under
`h2`) and `h2RuleGap`; `radius.xl`; `ring.width` and `ring.offset`, with an avatar `[data-ring]` halo;
`components.select.chevronStroke` for an open chevron; `components.avatar.initialsScale`; and a
`notice` alert tone (`components.alert.notice.*`) that stays visible on a surface.

**New components:** `m-row` (a tappable list row), `m-tile` (an icon tile), `m-chip`, `m-amount`
(money figures with a currency sign and cents) and `m-dropzone` (a file input to click or drop on; the
behaviours set its drag-over state).
