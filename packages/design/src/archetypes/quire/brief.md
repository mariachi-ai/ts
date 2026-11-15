# Quire: the brief

A calm document editor: white pages that float on a pale grey window, a quiet grey sidebar where the
current row is a white tile, capsules and circles for everything you press, tinted blocks and soft
covers for colour, and one clear blue. Read this first; the depth is in [DESIGN.md](./DESIGN.md),
[patterns/](./patterns/) and [never.md](./never.md). Numbers are from the fingerprint
(`fingerprint.json`, 27 screen-widths) unless marked; `observed` = measured or seen on the source's public
pages and shared documents; `inferred` = a reading of them, or of the app screenshots in the private notes.

## Signature moves

1. **White sheets that float:** 14–16px corners, a soft long shadow, never a border, on the grey window
   or a soft colour cover. `observed` (shared documents).
2. **Title about one and a half times the text,** from one short scale: 12, 13, 16, 17, 19, 24.
   `observed` (shared documents).
3. **The grey sidebar with a white current tile:** 280px, 13px rows with 10px corners, ink group names,
   counts without pills. `observed` (the contents sidebar), `inferred` (the current tile).
4. **Capsules and circles,** one blue capsule per view; ink capsules on public pages. `observed` (public
   pages), `inferred` (the app).
5. **Colour from the writing:** green, orange, red and blue tinted blocks, grey toggle wells, cover
   gradients on cards. `observed` (blocks), `told` (gradients stand in for photos).
6. **People as mentions,** dates as chips. `observed` (mentions), `inferred` (chips).

## Refusals

No document text at interface size · no title over about twice the text in the app · no borders on
sheets, cards or blocks · no square buttons · no coloured bar for the current row · no second blue action
in a view · no photos, illustrations or emoji · no stripes on tinted blocks · no uppercase in the
interface · no initials for people in tables. Evidence in [never.md](./never.md).

## The families

The **app** (dashboard, list and detail, settings, empty state, errors: the grey sidebar and a toolbar
row), **first use** (onboarding, sign-in: one white sheet over a soft cover), **published pages**
(reading: the contents sidebar and sheets on a cover) and **public pages** (pricing: warm paper, a
capsule bar, a serif headline, ink capsules). See DESIGN.md, Page shapes.

## The five habits that matter most

1. **Titles about one and a half times the text.** The largest text is 1.5 [1.46, 2.06] times the body:
   19 over 13 in a view, 24 over 16 on a page, 24 over 13 on a form; pricing alone runs 2.4–3.4.
   `observed`: the source's shared documents 1.41–1.85, its marketing pages 2.5–4.1.
2. **Three to six text sizes.** 4 [3, 6] per screen, from 12, 13, 16, 17, 19 and 24px. `observed`: a
   shared document uses exactly those six.
3. **Three or four weights.** 4 [3, 4]: 400 text, 500 rows and buttons, 600 group names and headings, 700
   the page title. `observed`: the source's shared documents 3–4.
4. **Rounded controls.** Control corners 10 [10, 16]: 10px sidebar rows and fields, capsule buttons.
   `observed`: capsules on the public pages (16 [1, 22]); `inferred` for the app's rows.
5. **A light ground under white sheets.** Ground 0.96 [0.89, 1]: the pale grey window, or a soft cover
   behind a first-use page. `inferred`: the window grey is from the app's screenshots; the public pages
   measure 0.98–1.

Icons are 16px [14, 16] everywhere but chips and empty or error states. `observed` on the recipes.

## Start from

Many pages → `dashboard`. One page → `list-detail`. A page readers see → `reading`. Settings →
`settings`. A setup step → `onboarding`. Signing in → `sign-in`. Nothing yet → `empty-state`. Errors →
`errors`. Plans and marketing → `pricing`. See [precedents/index.md](./precedents/index.md).
