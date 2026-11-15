# Cadence: the brief

Dark and content-first: near-black panels in a fixed black frame, the art's colour washing each page, one huge title, green only for play. Read this first; the depth is in [DESIGN.md](./DESIGN.md), [patterns/](./patterns/) and [never.md](./never.md). Numbers are from the fingerprint (`fingerprint.json`); `observed` = measured or seen on the source, `inferred` = a reading of it.

## Signature moves

1. **A fixed black frame.** Rounded near-black panels 8px apart; the page never scrolls; the now-playing bar is always at the bottom. `observed`.
2. **The art paints the page.** A wash of the art's colour behind a page's header; the chrome stays black and grey. `observed`.
3. **One huge title** for one thing: up to 96px at 800 beside its art; everything else 24px or smaller. `observed`.
4. **Green means play.** The round green play button, the public pages' green pill, switches that are on; nothing else. `observed`.
5. **Dense rows without rules:** 56px song rows of art and two lines, set apart by space and the hover tint. `observed`.
6. **Pills that grow** 104% on hover; circles for icon buttons. `observed`.

## Refusals

No green for links, headings or decoration · no rule between song rows · no page scroll in the app · no square button · no border around a panel or card · no white or coloured header · no middling title on one thing · no fourth weight · no uppercase but the site footer's titles · no spinner over a page · not light first. Evidence in [never.md](./never.md).

## Two families

The **app** (home, one thing, the collection, settings, empty places) sits in the frame with the top bar, the collection panel, the pinned now-playing bar and the main view's foot; its main action is the green play button and its top bar's call a white pill. **Public pages** (plans, help articles, sign-in) scroll normally under the black site header with the green pill and end with the black site footer. `observed` on the source's web player and site; the phone order (main view first) is `inferred`. See DESIGN.md, The two families.

## The five habits that matter most

1. **Four or five text sizes, three weights.** 12, 14, 16, 24 and the title; 400, 700, 800. `observed`: 4 [4, 5] sizes and 2 [2, 3] weights on the source; the recipes 4 [3, 5] and 2 [2, 3].
2. **Rows by place:** 30px links in the main view's foot, 40px in the site footer, 48px settings, 56px songs, 64px collection rows. `observed`: rows 33 [30, 52] on the source; the recipes 40 [30, 48].
3. **Tint, not lines.** Areas stand apart by their grey (`#121212` panels on black, `#1f1f1f` boxes); one rule under a table header, none between rows. `observed`: 87% of the source's separated areas are tint and 1% a border; the recipes 79% and 1%.
4. **16px icons, outlined at 2px**; 24px in the top bar; play and pause filled. `observed`: icons 16 [16, 24] on the source; the recipes 16 [16, 20].
5. **Art everywhere:** 40px in song rows, 48px in the collection, square covers with 6px corners on cards, circles for people, 232px in a header. `observed` on every studied app screen.

## Start from

Browse and play → `dashboard`. One thing with its list → `list-detail`. A flow → `onboarding`. Settings → `settings`. Nothing here yet → `empty-state`. Plans or marketing → `pricing`. An article → `reading`. Signing in → `sign-in`. Something went wrong → `errors`. See [precedents/index.md](./precedents/index.md).
