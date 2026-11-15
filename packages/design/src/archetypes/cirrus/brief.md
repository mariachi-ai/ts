# Cirrus: the brief

Bright and friendly money: navy ink on a cool off-white, white panels with 20px corners and a hairline, one clear blue, tinted capital category pills with an emoji, and figures with a small raised currency sign. Read this first; the depth is in [DESIGN.md](./DESIGN.md), [patterns/](./patterns/) and [never.md](./never.md). Numbers are from the fingerprint (`fingerprint.json`); `observed` = measured or seen on the source, `inferred` = a reading of it.

## Signature moves

1. **Money set like money:** tabular figures, the sign small and raised, and one 28px figure or title as the page's big line. `observed` on the public pages and the sign-in card; `inferred` for the signed-in app, which couldn't be measured.
2. **Categories you can see:** a tinted capital pill led by an emoji, the same colour everywhere. `observed`.
3. **Budgets in traffic colours:** green on track, amber near the limit, red over; a pace line that warms from red to green over a dashed plan. `observed`.
4. **White on off-white with a hairline:** panels, sidebar and header are white on `#f9fafb`, edged by a hairline and a 2% shadow. `observed`.
5. **One blue, only for doing:** the primary button, the current nav row, links; on public pages the header's pill. `observed`.
6. **Mono capitals as labels on public pages:** a post's tag and date, the pricing card's labels. `observed`.

## Refusals

No second blue button · no black text or grey-on-grey · no heavy shadow · no plain-text category · no full-size currency sign · no red for an ordinary expense · no ruled grid for activity · no fourth weight in the app · no page without a big line · no page spinner · no footer in the app. Evidence in [never.md](./never.md).

## Two families

The **app** (sidebar, 56px header, 15px body, buttons 620, no footer) and **public pages** (transparent header with two pills, 16px body, 48px centred titles (about 30px on a phone), pill buttons at 550, the white footer). The sign-in card is the app's door: no shell, one centred card. See DESIGN.md, The two families.

## The five habits that matter most

1. **One big line per window.** The largest text is 1.75–1.87 times the body on every app page (a 28px figure or title over 15px) and 3 times on public pages (48 over 16), about 1.9 times on a phone (30 over 16; the sign-in card's 28px title steps down to 24px there). `observed` for public pages and the sign-in card at every width. `inferred` for app pages: the source's ratio is 1.75–3 on every kind measured (public pages and the sign-in card, `observed`), and no signed-in app screen could be measured; the language's is 1.87 [1.75, 3].
2. **Three weights.** 450 body, 550 titles and figures, 620 buttons and pills; the sign-in card adds a 700 link. `observed`: the sign-in card's 450/550/620/700; the language has 3 [3, 3.4].
3. **Calm space.** About two thirds of a window is empty: 0.68 [0.50, 0.86] in the language, 0.57 [0.23, 0.83] on the source.
4. **Flat panels.** Panels nest two deep at most: depth 2 [1, 2] (the source 2 [1, 3.1]); white on the canvas, never a panel in a panel in a panel.
5. **Small icons.** Lucide outlines at 1.75: 16px in buttons and rows, 18px in the sidebar, 24px in icon tiles. `observed`: 16 [14, 20.8] on the source; the language 18 [16, 20].

## Start from

Scan and act → `list-detail` (list). One thing → `list-detail` (panel). Daily tool → `dashboard`. Settings → `settings`. A flow → `onboarding`. Nothing yet → `empty-state`. An article or post → `reading`. Signing in → `sign-in`. Marketing → `pricing`. See [precedents/index.md](./precedents/index.md).
