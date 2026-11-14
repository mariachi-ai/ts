# Lagoon: the brief

A system messenger on the desktop: near-black on white, a grey sidebar of round faces beside the
thread, blue bubbles for you and grey for them, capsules for everything you press, and grouped white
cards on a light grey. Read this first; the depth is in [DESIGN.md](./DESIGN.md),
[patterns/](./patterns/) and [never.md](./never.md). Numbers are from the fingerprint
(`fingerprint.json`, 27 screen-widths) unless marked; `observed` = measured, or seen in the source's
public help screenshots of its own window; `inferred` = a reading of them.

## Signature moves

1. **Blue is yours:** your bubbles, the one blue capsule, the current row or pin, checks and links.
   Their bubbles are flat light grey. `observed`.
2. **Tailed bubbles in runs:** 2px apart, a tail on the last, timestamps between runs, one quiet
   "Delivered" under your last. `observed`.
3. **Round glass, no bar:** 36px round buttons float at the pane's corners; the person's circle sits
   over a name capsule. `observed` (drawn opaque: `told`).
4. **Circles for people:** initials on soft tints, 40px in rows, 64px pinned, 88px on a details page.
   `observed` (shape), `told` (no photos).
5. **Grouped cards on the grouped grey:** white, 20px corners, no border, 44px rows, hairlines inset
   to the text, a grey title above and a footnote below. `observed`.
6. **Capsules and circles** for every control, with 18px glyphs in the round ones. `observed`.

## Refusals

No header bar over the thread · no second bubble colour · no time inside a bubble · no tail on every
bubble · no blur · no square buttons or fields · no borders on cards · no photos or illustrations · no
more than one blue capsule in the window · no large feature glyphs. Evidence in [never.md](./never.md).

## The families

The **window** (sidebar and pane; details, settings, empty and errors keep it), **sheets** (onboarding,
sign-in: one centred column on the grouped grey) and **public pages** (pricing, reading: the site bar,
larger titles, 17px article text). On a phone, a page reached from the list comes first. See
DESIGN.md, Page shapes.

## The five habits that matter most

1. **Titles about twice the text.** The largest text is 1.87 [1.41, 2.15] times the body: 28px over
   13–15 on details and sheets, 34 over 17 in an article; pricing's headline, 3.7×, is the one public
   exception. `observed`: the source's public reading pages 2 [1.65, 2.82].
2. **Four weights.** 400 text, 500 buttons and segments, 600 the day in a timestamp and receipts, 700
   names and titles: 4 [3, 4]. `observed`: the source's public reading pages 4 [3, 5]; `inferred`
   for the app.
3. **Four to six text sizes.** 5 [4, 6]: 11, 13, 15 and 17px with one title size. `observed`: the
   source 5 [3, 6].
4. **Rows of about 44px.** density.rowHeight 44 [31, 52.7] over 16 screen-widths; conversation rows
   with two-line previews run near 58. `inferred` from the system's 44pt minimum row, seen in its
   settings screenshots.
5. **18px icons.** icons.size 18 [15.3, 18] over 24 screen-widths: round buttons 18, beside text
   16, settings tiles 15; only empty and error states go large. `observed` on the recipes.

## Start from

A conversation or the home → `dashboard`. One person or group → `list-detail`. Settings → `settings`.
A set-up step → `onboarding`. Nothing yet → `empty-state`. Errors → `errors`. A help page or post →
`reading`. Signing in → `sign-in`. Marketing and plans → `pricing`. See
[precedents/index.md](./precedents/index.md).
