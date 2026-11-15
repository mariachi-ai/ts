---
'@mariachi/design': minor
---

Library-wide component and base-style fixes, and five small components.

- **Fixes.** `m-avatar-group` applies `--m-avatar-group-overlap` as an overlap (a positive distance; a
  negative value still works), and an initials avatar's letters are no longer covered by the next one.
  Avatar initials take the type-ramp step nearest `initialsScale` × the size. The `m-progress` track
  defaults to the hairline colour, which shows on a white surface.
- **Base styles.** `<legend>` inherits its weight. Lists used as layout (`m-stack` and the other layout
  classes, lists in a `<nav>`) lose their bullets and indent, never inside `m-prose`. Heading sizes come
  from `font.heading.size.h1`–`h6` (defaults unchanged).
- **New tokens.** Required and optional field marking (`components.field.optionalMarker` and friends),
  `components.popover.labelWeight`, breadcrumb `separatorIcon`, `linkDecoration` and a 24px `targetSize`
  hit area, `components.prose.h2RuleWidth` to turn off the rule under `h2`, `radius.xl`, `ring.width`
  and `ring.offset`, `components.select.chevronStroke` for an open chevron, and a `notice` alert tone
  that stays visible on a surface.
- **New components:** `m-row` (a tappable list row), `m-tile` (an icon tile), `m-chip`, `m-amount` (money
  figures with a currency sign and cents) and `m-dropzone` (a file input to click or drop on; the
  behaviours set its drag-over state).
