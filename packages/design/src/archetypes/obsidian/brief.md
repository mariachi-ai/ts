# Obsidian: brief

Dark-first and exact: near-black panels a step apart, one muted indigo, small dense type, hairlines instead of boxes, a glyph for every state and a key for every action. Numbers are from `fingerprint.json` (the recipes at three widths); markers say how we know.

## Signature moves

1. **One inset panel on a darker frame**: a 232px sidebar on the sunken colour, the work in one panel with a hairline and 8px corners. `observed` (every app recipe)
2. **Rows, not boxes**: lists, settings and plans split by hairlines and grey group bars. `observed` (source: divider 0.73 of separated containers, shadow 0.03)
3. **A glyph for every state**: 14px status circles and priority bars lead each row. `observed` (`list-detail`, `dashboard`)
4. **Indigo once per view**: the one primary, checked controls, focus, "done". `observed` (accent covers 0.1–1.3% of the window)
5. **The key is always shown**: menus, tooltips, empty states and the command menu print the shortcut. `observed` (`onboarding`, `empty-state`)

## Two families (in full in DESIGN.md)

The app is the frame, the inset panel and indigo 6px buttons; the public pages (the site and the docs) sit on the darkest step with no panel, a 72px navbar or the docs' 64px bar, 48px or 32px titles, inverted pills and an 80rem or 40rem column; sign-in is the app's theme and indigo in 44px pills. Decide the family first. `observed`

## Refusals (in full in `never.md`)

- No shadow under cards or panels in dark; no cards around lists, charts or figures. `observed`
- No pictures in the app; no indigo for decoration (marks are monochrome or an identity hue); no status by colour alone. `observed`
- No Save step for properties or settings; no action without a key. `observed`
- No glow, gradient or illustration on public pages. `observed`

## The five habits that matter most

| Habit | Number | Evidence |
| --- | --- | --- |
| Few sizes, three weights: UI 13px at 510, meta 12px, titles 24px in the app (32px docs titles, 48px site titles) | type.sizes 4 (2.6–5; 7 on the docs article); type.weights 3 (2 on sign-in); heading ratio 1.85 in the app, 3.69 on pricing | `observed` |
| Dense rows: 36px items, 28px sidebar rows | density.rowHeight 29.75px on `list-detail` (sidebar included) | `observed` |
| Shallow nesting: frame → panel → at most one more level; public pages flatter | structure.depth 2 (0.6–3): 2–3 in the app, 1 on the docs, 0 on sign-in | `observed` |
| Wide content, edge to edge in the panel | space.contentWidth 0.80 of the window on `list-detail`; one column | `observed` |
| Small, light icons, grey unless they carry state | icons.size 14–16px; Lucide at 1.5px stroke | `observed` |

## When in doubt

Make it smaller, greyer and flatter, give it a key, and put it in a row. `inferred`
