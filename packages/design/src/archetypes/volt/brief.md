# Volt: the brief

A loud, quick money app: black, white and one electric green; white cards on a light grey screen; black pill actions; big regular headlines set tight and bold amounts; round icons in rows. Read this first; the depth is in [DESIGN.md](./DESIGN.md), [patterns/](./patterns/) and [never.md](./never.md). Numbers are from the fingerprint (`fingerprint.json`) and the private source measurements; `observed` = measured or seen on the source, `inferred` = a reading of it.

## Signature moves

1. **Black pill, white card, grey screen.** App actions are 48px pills, the main one black (green in dark); cards are white with 20px corners, no edge and no shadow on `#f0f0f0`. `observed` (help centre, not-found pages, app screenshots).
2. **Big, tight, regular headlines; bold amounts.** Titles 40px at 400 tracked −3% (marketing 56px); money at 700 in tabular figures, the keypad's amount at 88px. `observed` (marketing headlines at 400; the balance in bold on the public home page).
3. **One bright colour, the electric green:** keypad, picked plan, bars, rings, wordmark, progress. `observed`.
4. **Round icons in rows:** a 40px grey circle or round initials, a medium title over a muted line, the amount or a chevron at the end, hairlines between. `observed` (help-centre rows; app screenshots).
5. **Flat, three weights, few sizes.** `observed`; see the habits.

## Refusals

No shadow on app content · no 600 weight · no square buttons · no green action or green text in the light app · no bold headline, no light amount · no red for money going out · no floating toast for a failure on screen · no giant error number · no outlined cards in the app · no pictures, logos or illustrations · no side column on public pages. Evidence in [never.md](./never.md).

## Two families

The **app** (dashboard, list and detail, settings, empty state, errors; onboarding and sign-in on white before it): the side column, the top bar with a black "Send", 40px regular titles. **Public pages:** marketing (`pricing`: a bare bar with green and black pills, 56px headlines, a black footer band) and the help centre (`reading`: a white bar and footer with a faint shadow, black and grey pills, 32px titles at 500, rows on a grey band). See DESIGN.md, The two families.

## The five habits that matter most

1. **Three weights: 400, 500, 700.** `observed`: the source's pages use 2 or 3 (`type.weights` 2 on 38 of 57 studied screen-widths, 3 on 19); the language 3 on 20 of 27, 2 on 7.
2. **Four to six text sizes a screen,** mostly from 12 / 14 / 16 / 24 / 32 / 40 / 56px (`type.sizes` [4, 6], typical 4; 4 on 18 of 27). `observed`: the source's pages 2–5, typical 4.
3. **The largest text two to three and a half times the body** (`type.headingRatio` [2, 3.5], typical 2.5), with the keypad's amount as the one exception (5.5). `observed`: help centre 2 on all 18 screen-widths, marketing up to 4.45.
4. **Flat panels, one level of nesting inside a card.** `structure.depth` 2 on 27 of 27; `structure.elevated` 0 on 24 of 27 (the reading page's bar and footer the rest). `observed` (source depth typical 2; shadows only on the help centre's bar and footer).
5. **Rows about 70px in the app, 57px on the help centre,** a 40px circle at the start (`density.rowHeight` typical 70). `observed`: 57px on the source's help rows; `inferred` for the app's two-line rows.

## Start from

Money at a glance → `dashboard`. Payments, then one → `list-detail`. A first-run step → `onboarding`. Signing in → `sign-in`. Settings → `settings`. Nothing yet → `empty-state`. Plans → `pricing`. A help article → `reading`. Anything that fails → `errors`. See [precedents/index.md](./precedents/index.md).
