# Meridian: the brief

A developer platform in black and white: near-black text and a near-black primary on two whites, one grey
scale, 1px hairlines, 6px corners, dense 14px rows with 10px status dots, mono for anything a machine made,
and blue only for links and focus. Read this first; the depth is in [DESIGN.md](./DESIGN.md),
[patterns/](./patterns/) and [never.md](./never.md). Numbers are from the fingerprint (`fingerprint.json`,
27 screen-widths) unless marked; `observed` = measured on the recipes, or measured or seen on the source's
public pages and published design system; `inferred` = a reading of them.

## Signature moves

1. **The primary is the ink:** grey-1000, the text's own colour (white in dark); one per view. `observed`.
2. **Hairline rings on two whites:** background-100 content and cards, background-200 sidebar, footers and
   wells, every edge 1px. `observed`.
3. **A 10px dot beside the state's name;** never colour alone. `observed` (the published status dot).
4. **Mono for machine text:** ids, commits, endpoints, cron lines, request ids, logs. `observed`.
5. **Cards that end in a background-200 footer:** a note left, the action right. `observed` (the published
   fieldset).
6. **Pills only for badges and marketing calls to action;** everything else 6px rectangles. `observed`.

## Refusals

No coloured primary · no colour without a word · no blue on buttons · no pills in the app's controls · no
app page title but 32px · no fourth weight · no icons but 16px in a window · no heavy shadows or fills ·
no mono prose · no sidebar first on a phone. Evidence in [never.md](./never.md).

## The families

The **app** (sidebar, breadcrumb bar, 32px page titles: dashboard, list and detail, settings, empty state,
errors), **first use** (no sidebar, a centred column or one card on background-200: onboarding, sign-in) and
**public pages** (the site bar, larger titles, pill calls to action: pricing, reading). See DESIGN.md,
Page shapes.

## The five habits that matter most

1. **Titles about 2.3 times the text.** type.headingRatio 2.29 [2.17, 3.33]: a 32px title over 14px on
   every app and first-use page, 40 over 16 on an article; pricing's 64px headline (4.57) is the one
   exception. `observed`; the source's pages keep their largest text at least twice the body
   (2.86 [2, 4.16] over 66 screen-widths).
2. **Three weights.** 400 text, 500 buttons, tabs and table headers, 600 headings: type.weights 3 [3, 3].
   `observed`; the source 3 [2, 3].
3. **Four to six text sizes.** type.sizes 5 [4, 6]: 12, 13, 14, 16, then 20 or 32. `observed`; the source's
   public pages use 4 [3, 5], the app's label and copy classes add one.
4. **Rows of about 36px.** density.rowHeight 36 [34, 46.9]: sidebar and menu rows 36, table rows 36 with a
   second line taller, contents rows 32. `observed` on the recipes; on the source's docs and design system
   rows run 32–48 (`inferred` for the app).
5. **16px icons.** icons.size 16 [16, 16] on all 27 screen-widths; 20 in an empty tile, 40 on full-page
   errors. `observed`; the source 16 on 57 of 66.

## Start from

A workspace overview → `dashboard`. Many runs or one run → `list-detail`. Settings → `settings`. A set-up
step → `onboarding`. Nothing yet → `empty-state`. Errors → `errors`. A guide or post → `reading`. Signing in
→ `sign-in`. Plans → `pricing`. See [precedents/index.md](./precedents/index.md).
