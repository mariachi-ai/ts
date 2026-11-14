# Heather: the brief

Friendly and clean: charcoal on white, one clear blue for the action and the current place, three
weights, 12px buttons, hairline cards with 16px corners, and the video first, with a side panel of
transcript and comments. Read this first; the depth is in [DESIGN.md](./DESIGN.md),
[patterns/](./patterns/) and [never.md](./never.md). Numbers are from the fingerprint
(`fingerprint.json`, 27 screens) unless marked; `observed` = measured or seen on the source's public
screens (its public video pages, site and not-found pages), `inferred` = a reading of them or of public
screenshots.

## Signature moves

1. **Three weights:** 400 text, 500 controls and labels, 653 headings. No 600. `observed`.
2. **One blue** for the solid button, the current nav row (pale blue, blue text), the current tab
   (over a 2px line), links and times. `observed`.
3. **The video leads:** a picture in a 16px hairline frame on the grey well, a round blue play
   button; a charcoal duration chip on every thumbnail. `observed`.
4. **The side panel of tabs** beside the video; the playing transcript line pale blue with a blue
   edge; times always blue. `observed`.
5. **Hairlines, then shadow:** resting cards and panels have a hairline; only what floats lifts.
   `observed` (floating), `inferred` (resting).
6. **12px buttons in the app, pills on the public site.** `inferred` (app), `observed` (site).
7. **The app frame stays** on empty and error pages. `inferred`.

## Refusals

No fourth weight or 600 · no second accent · no grey timestamps · no bold playing line · no shadow on
a resting card · no pills in the app · no more than two solid blue buttons in view · no illustration in
an empty or error state · no sidebar on public pages · no uppercase but tiny public tags. Evidence in
[never.md](./never.md).

## The families

The **app** (240px white sidebar, the wide search, 32px titles, 14px text), the **video page** (title
band, 24px title, the 435px side panel), **flows** (onboarding, sign-in: the wordmark over one column,
24px titles) and **public pages** (pricing, reading: the 60px site bar, 16px text, larger headlines,
pills, the footer). See DESIGN.md, Page shapes.

## The five habits that matter most

1. **Three weights on every screen.** 3 [3, 3]. `observed`: the source's video pages 3 [2, 3]; its
   marketing pages 2.
2. **Titles about twice the text.** The largest text is 2.29 [1.71, 2.37] times the body: 1.71 for a
   video or flow title (24 over 14), 2.29 for an app page (32 over 14), 2.5–3.4 on pricing. `observed`:
   the source 2.29 [1.46, 3.14]; its video pages 1.71.
3. **Four to seven text sizes.** 5 [4, 7]. `observed`: the source 5 [3, 6.4].
4. **One colour besides neutrals.** colour.hues 1 [1, 1.4]; the second, where there is one, is
   status red. `observed`: the source 1 [0, 1].
5. **Pictures lead the video pages.** Media covers 0.22 [0.08, 0.40] of the window on detail pages
   and 0.24 [0.21, 0.28] on the library; none on settings, flows or errors. `observed`: the source's
   detail pages 0.37 [0, 0.68].

## Start from

One video → `list-detail`. The library → `dashboard`. Settings → `settings`. A set-up step →
`onboarding`. Nothing yet → `empty-state`. Errors → `errors`. A guide or post → `reading`. Logging in →
`sign-in`. Marketing → `pricing`. See [precedents/index.md](./precedents/index.md).
