# Fennel: the brief

Plain, confident money: near-black text on white, forest green for every control and link, one bright lime pill for the action that matters, neutral green-grey fills instead of lines, rows led by icon circles, and heavy condensed capitals only on marketing pages. Read this first; the depth is in [DESIGN.md](./DESIGN.md), [patterns/](./patterns/) and [never.md](./never.md). Numbers are from the fingerprint (`fingerprint.json`); `observed` = measured or seen on the source, `inferred` = a reading of it.

## Signature moves

1. **One bright lime pill, forest-green text on it;** forest green is every other interactive thing. `observed`.
2. **Rows led by a 48px icon circle** on the neutral fill: 16px/600 title, a muted 14px line, the amount or a chevron at the right, about 72px apart, no rules. `inferred` for the app (public screenshots).
3. **Two weights,** Inter 400 and 600, on every product and help page. `observed`.
4. **Heavy capitals on lime, outside the product only.** `observed` on marketing pages.
5. **Money with the code after it:** `1,240.00 GBP`, incoming green with a plus. `observed`.
6. **Fills, not lines:** neutral-fill cards, pills everywhere, icons in circles. `observed`.

## Refusals

No second lime pill · no white on lime or lime on white · no third weight on a product page · no display face inside the product · no card borders or shadows · no square buttons, no row without its circle · no red or minus for money out · no fill on the current nav item · no footer in the app · no table for activity. Evidence in [never.md](./never.md).

## Two families

The **app** (the white side column of plain nav items, a quiet top bar, the full content column, 30px titles, a 40px figure, no footer), its **flows** (a flow bar with close, one centred 30rem column, a full-width 48px lime pill) and **public pages** (help: a white header over a hairline, a 33rem column, the footer on the neutral fill; marketing: the lime band with display capitals). See DESIGN.md, The two families.

## The five habits that matter most

1. **Two weights.** 400 and 600 on every product and help page: 2 on every recipe but pricing (3, the display face's 900). `observed`: 2 on the source's help and not-found pages, 3 to 4 on its marketing pages.
2. **A modest big line inside, a loud one outside.** The largest text is 1.88 to 2.86 times the body on product pages (30px titles, the 40px figure); marketing headlines 4.6 to 4.9 on a wide screen. `observed`: the source's help pages 1.88 to 2.14, marketing 4.06 [2.57, 5.56].
3. **Icons at 24px** in rows, nav and circles, 16px in buttons and prompts: 24 [18.4, 24]. `observed`: the source 21 [18, 24].
4. **Flat.** Panels nest one deep, two at most: depth 1 [1, 2]; cards are fills, only overlays lift. `observed`: the source 2 [1, 4], the deeper ones on marketing pages.
5. **Open space and one hue.** About three quarters of a window is empty, 0.73 [0.52, 0.84], and one saturated hue (the greens) besides neutrals, 1 [1, 2], the second being status colour. `observed`: the source 0.51 [0.32, 0.77] (fuller: its marketing pictures) and 1 [1, 1].

## Start from

Scan and open → `list-detail` (list). One payment → `list-detail` (panel). Daily screen → `dashboard`. Settings → `settings`. A flow → `onboarding`. Nothing yet → `empty-state`. An article → `reading`. Logging in → `sign-in`. Marketing → `pricing`. See [precedents/index.md](./precedents/index.md).
