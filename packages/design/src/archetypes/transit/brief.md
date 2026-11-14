# Transit: the brief

Stark and direct: black on white, big bold titles, grey-filled fields with trip ends, black actions, chosen rows edged in black, flat panels. Read this first; the depth is in [DESIGN.md](./DESIGN.md), [patterns/](./patterns/) and [never.md](./never.md). Numbers are from the fingerprint (`fingerprint.json`) and the private source measurements; `observed` = measured or seen on the source, `inferred` = a reading of it.

## Signature moves

1. **Black is the action and the selection:** one black 48px button per view (full width at a panel's foot), a 2px black border on the chosen row, black chips, a 4px black bar under the current tab or beside the current row. `observed`.
2. **Grey-filled 48px fields** with a black dot and a black square for the two ends of a trip. `observed` on every studied form.
3. **Rows about 72px tall:** a 48px grey icon tile or a 20px icon, a medium name, a grey line, the figure or a chevron. `observed`: 69px help rows and 73px question rows on the source; the language's rows 45–85px (`density.rowHeight`).
4. **Two headers:** a white one with underline tabs in the app, a black bar with pill links and a white Join pill on public pages. `observed`.
5. **The map leads the booking screen,** always a token-drawn placeholder. `told` (no real maps).

## Refusals

No coloured main action · no shadow on a panel on the page · no inset-shadow edges · no fourth weight · no 18 or 24px text · no panels three deep · no white outlined fields · no blue links outside help articles · no pill main action · no photos, map tiles, logos or illustrations · no sidebar on public pages. Evidence in [never.md](./never.md).

## Two families

The **app** (dashboard, list and detail, settings, empty state, errors, onboarding): the white header with tabs, 36px titles, a side list on account pages. **Public pages** (pricing, reading, sign-in): the black bar, 52px headlines on a wide window (36px on a phone), a prompt banner's blue button where the help pages have one. See DESIGN.md, The two families.

## The five habits that matter most

1. **Three weights.** 400 body, 500 labels, 700 titles. `observed`: 3 on 63 of 66 studied source screen-widths; the language 3 on all 27.
2. **Four or five sizes, the title about 2.25 times the body.** `observed`: source `type.sizes` typical 5 [4, 6], `type.headingRatio` 2.25 [1.6, 3.25]; the language 5 [4, 5] and 2.25 [2, 2.57] (public headlines reach 3.25 on a wide window, as the source's do).
3. **16px icons** in buttons, tabs, lists and beside labels. `observed`: source `icons.size` 16 on 52 of 66; the language 16 [16, 17.6].
4. **Flat, one level deep.** No shadow on the page; panels nest once. `observed`: source `structure.elevated` 0 on 57 of 66, `structure.depth` [1, 2]; the language 0 except the snackbar, depth [1, 2].
5. **One black action in view.** `observed` in the source's screenshots (the probe can't count black on the source); the language 1–2 black controls in every first window at 1440 and 1024 (`emphasis.primaries` [1, 2]).

## Start from

Booking → `dashboard`. Browse, then one thing → `list-detail`. A flow → `onboarding`. Settings → `settings`. Nothing yet → `empty-state`. Plans or marketing → `pricing`. An article → `reading`. Signing in → `sign-in`. See [precedents/index.md](./precedents/index.md).
