# Never

What Obsidian refuses to do. Each refusal cites the screens that show it: the language's recipes by name, and the source study by measure (the source's pages are named only in the private notes).

| Never | Evidence |
| --- | --- |
| **Lift a card or panel with a shadow in dark.** Surfaces separate by one step of grey and a hairline; only menus, dialogs, toasts and the command menu cast a shadow. | `observed`: source separated containers are border-only 0.87, shadow 0.03 (60 screen-widths). The preset's card shadow is `none` in dark since the faithfulness pass; `dashboard` and `settings` show it. |
| **Box a list in a card, stripe it, or give it an outer frame.** Lists run edge to edge under grey group bars. | `observed`: `list-detail`, `dashboard` (projects list). Source list pages: divider 0.75, border 0.05 of separated containers. |
| **Put a chart or figures in a card.** | `observed`: `dashboard` (after the faithfulness pass); the source's public usage-chart screenshot (private notes). |
| **Use indigo for decoration.** Indigo marks only something you can act on or a state: the one primary button, checked controls, focus, the selected row's edge, progress bars, the done glyph and the first chart series; a person without a photo gets initials on it. Never the product mark, workspace or squad marks, label dots, icons, headings, backgrounds or borders. | `observed`: accent area 0.1–1.3% of the window on the app recipes (colour.accentArea 0.001–0.013 by kind); the source's mark is monochrome on every public page and on sign-in. Marks and label dots in identity hues: `inferred`. |
| **Mix the two families.** No inset panel, grey group bars, status glyphs or indigo buttons on a public page; no navbar, pills or 48px titles in the app (sign-in's pills are the one crossing). | `observed`: the source's writing index, docs and pricing (page colour, no panel, inverted pills) against the app frame on its home page; recipes `pricing`, `reading` against the six app recipes. |
| **Draw a blue info box.** Notes and information are the neutral callout; only success, warning and danger are tinted. | `observed`: the source's docs callouts are a raised grey with a faint hairline (three on one article); recipe `reading`. |
| **Put a logo or brand colour on a sign-in button.** Third-party methods are text-only pills; the first is the indigo primary. | `observed`: the source's sign-in and sign-up pages, both themes, three widths; recipe `sign-in`. |
| **Mark required fields.** No asterisk; an optional field says so in its hint. | `observed`: the source's public contact form marks none of its three required fields; the preset turns the marker off. |
| **Show status with colour alone or with a filled badge.** A glyph (shape) carries it; colour is second. | `observed`: `list-detail`, `dashboard` (sprint counts), `empty-state` (none). |
| **Set UI text above 13px, or use more than three weights.** Rows, buttons and menus are 13px; meta 12px; titles alone are larger. | `observed`: type.weights 3 on 24 of 27 recipe screen-widths (2 on `sign-in`); source 2–3. |
| **Use upper case or title case for labels and headings.** | `observed`: source words.case sentence 0.91 of headings and buttons; the recipes write sentence case throughout (DESIGN.md, Words). |
| **Use pictures in the app.** No photos, illustrations or decorative images; avatars are initials; marks are lettered squares. | `observed`: media.role `none` on 27 of 27 recipe screen-widths. The source's pictures are on public pages only (product images on its changelog and docs). |
| **Hide an action with no key.** Every command is in the command menu and shows its shortcut. | `observed`: `onboarding` (every row has keys), `empty-state` (the key inside the primary button). |
| **Ask for Save on a property or setting.** Changes apply at once. | `observed`: `settings` (switches and menus, no save button), `list-detail` (property rows). |
| **Put a glow, gradient or illustration behind a public title.** | `observed`: the source's pricing page shows none in two captures (2026-11-12, 2026-11-13); removed from `pricing`. |
| **Bounce or spring.** Motion is 100–250ms with an ease-out curve. | `observed`: motion.durations 100ms the most declared on recipes and source alike. |
