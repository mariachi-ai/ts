# Vellum: the brief

A quiet, native-feeling journal: a grey journal column beside white pages, timelines led by the date, one colour per journal, grey grouped panels, pill actions in a deep blue, and entry text in a warm humanist face. Read this first; the depth is in [DESIGN.md](./DESIGN.md), [patterns/](./patterns/) and [never.md](./never.md). Numbers are from the fingerprint (`fingerprint.json`) and the private source measurements; `observed` = measured or seen on the source, `inferred` = a reading of it.

## Signature moves

1. **The date leads:** timeline rows open with a bordered tile (11px weekday capitals over a 24px numeral), grouped under grey month bands. `observed` in the source's app screenshots.
2. **Colour says which journal:** swatches, the band behind a journal's title, the open row, written calendar days. Actions are the deep blue `#1e75ae`, the source's own button blue. `observed`.
3. **Grey grouped panels** (20px corners, no border, no shadow, inset dividers) and a cool-grey journal column. `observed` in the phone and desktop screenshots.
4. **Pills,** one deep-blue primary per view, often full width under a question or a form. `observed` (phone Today screen; plans page pills 49px).
5. **Entry text in Lato** at 17px and a 40rem measure; the interface in Inter at 15px. `observed` (font matched in the earlier study).

## Refusals

No shadow on content · no fourth weight · no outlined groups or bordered rows · no white text on the sky blue · no sky-blue primary · no square buttons in the app · no cards around entries · no colour for decoration · no floating toast in a page shape · no photos, logos or illustrations · no journal column on public pages. Evidence in [never.md](./never.md).

## Two families

The **app** (dashboard, list and detail, settings, empty state, errors; onboarding and sign-in under the brand band): the journal column, 34px large titles, pills. **Public pages** (pricing, reading): a white header with plain links and an outlined 4px-cornered Download button, 48px or 34px titles, 4px-cornered buttons on help pages and pills on plans. See DESIGN.md, The two families.

## The five habits that matter most

1. **Flat.** Nothing on the page casts a shadow. `observed` in the app screenshots; the language `structure.elevated` 0 on 27 of 27 screen-widths (the source's public site: 0 on 48 of 60, the rest its help-category cards).
2. **Set apart by grey, not by lines.** Panels are tinted: `structure.tinted` 0.5–1 (typical 1) across the language. `observed` in the app (grey column, grouped panels, month bands); `inferred` for screens not seen.
3. **Three weights:** 400, 600, 700. `observed`: the source's pages use 2–3 (`type.weights` [2, 3]); the language 3 on 26 of 27.
4. **A large title about 2.3 times the body:** 34px over 15px in the app (`type.headingRatio` 2.27 on 15 of 27); three to five text sizes on an app screen (`type.sizes` typical 5). The source's pages: ratio typical 2.7 [1.6, 3.6], sizes 5 [4, 6]. `observed`.
5. **Rounded, never square, in the app:** pills, 8px rows in the column, 10px fields (`shape.controlRadius` 8 on 20 of 27). `observed` in the app; the source's public site is square (0 on 53 of 60), so public help pages use 4px.

## Start from

The day → `dashboard`. Entries, then one → `list-detail`. A flow → `onboarding`. Settings → `settings`. Nothing yet → `empty-state`. Plans → `pricing`. Anything that fails → `errors`. A guide → `reading`. Signing in → `sign-in`. See [precedents/index.md](./precedents/index.md).
