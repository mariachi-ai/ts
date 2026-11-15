# Obsidian: brief

Dark-first and exact: near-black panels a step apart, one muted indigo, small dense type, hairlines instead of boxes, a glyph for every state and a key for every action. Numbers are from `fingerprint.json` (the recipes at three widths, in dark); markers say how we know.

## Signature moves

1. **One inset panel on a darker frame**: a 232px sidebar on the sunken colour, the work in one panel with a hairline and 8px corners. `observed` (every app recipe)
2. **Rows, not boxes**: lists, settings and plans split by hairlines and grey group bars. `observed` (source: divider 0.70 of separated containers, shadow 0.02)
3. **A glyph for every state**: 16px priority bars and 14px status circles lead each row. `observed` (`list-detail`, `dashboard`; the source's app frame)
4. **Indigo once per view**: the one primary, checked controls, focus, "done". `observed` (accent covers 0.1–1.4% of the window in the app)
5. **The key is always shown**: menus, tooltips, empty states and the command menu print the shortcut. `observed` (`onboarding`, `empty-state`)

## Two families (in full in DESIGN.md)

The app is the frame, the inset panel, 14px icons and indigo 6px buttons; the public pages (the site and the docs) sit on the darkest step with no panel, a 72px navbar or the docs' 64px bar, 48px or 32px titles, 16px icons, inverted pills and an 80rem or 40rem column. Sign-in and onboarding take the first-use pages' type (a 17px/510 title over 13px, two weights); sign-in is the app's theme and indigo in 44px pills. Decide the family first. `observed`

## Refusals (in full in `never.md`)

- No shadow under cards or panels in dark; no cards around lists, charts or figures. `observed`
- No pictures in the app; no indigo for decoration (marks are monochrome or an identity hue); no status by colour alone. `observed`
- No Save step for properties or settings; no action without a key. `observed`
- No glow, gradient or illustration on public pages. `observed`

## The five habits that matter most

| Habit | Number | Evidence |
| --- | --- | --- |
| Rows about 28px wherever things are listed: sidebar, footer links, the dense app; settings rows are the tall exception | density.rowHeight 29.75px (27.5–53): 27.5 on `dashboard`, `empty-state`, `errors`; 28 on `pricing`; 66.5 on `settings` | `observed` |
| Small icons: 14px in the app, 16px on public pages and for priority bars | icons.size 14 (14–16): 14 on every app recipe, 16 on `reading`, `pricing`, `onboarding` | `observed` |
| Few sizes and three weights; first-use screens two weights | type.sizes 4 (2.6–5); type.weights 3 on 21 of 27 screen-widths, 2 on `sign-in` and `onboarding` | `observed` |
| Titles barely grow in the app, a lot on the site | type.headingRatio 1.85 in the app (1–1.85), 1.31 on first-use screens, 3.69 on `pricing` | `observed` |
| One column, shallow nesting: frame → panel → at most one more level | structure.columns 1 everywhere; structure.depth 2 (0.6–3): 2–3 in the app, 1 on the docs, 0 on sign-in | `observed` |

## When in doubt

Make it smaller, greyer and flatter, give it a key, and put it in a row. `inferred`
