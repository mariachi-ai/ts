# Flint: the brief

Dark, compact and exact: neutral near-black panels a step apart, one light grey text at set strengths,
7% hairlines, 12–13px type at two weights, 31px one-line rows, small radii, one inverted primary with
its key, green and red diff counts, and an agent thread of quiet one-line steps above a composer.
Public pages are a warm off-white site with pill buttons and one orange used for the mark and links.
Read this first; the depth is in [DESIGN.md](./DESIGN.md), [patterns/](./patterns/) and
[never.md](./never.md). Numbers are from the fingerprint (`fingerprint.json`, 27 screens); `observed` =
measured or seen on the source, `inferred` = a reading of it.

## Signature moves

1. **One inverted primary per view, with its key** ("Continue ↵"); never orange. `observed` on public pages.
2. **Two weights, 400 and 500;** titles at 400 however large. `observed` (the source's 1 to 2 weights).
3. **31px one-line rows** in side panels and pickers, the detail or key muted at the right. `observed`.
4. **Neutral steps and hairlines;** no shadow on anything that sits on the page. `observed` (theme, screenshots).
5. **The agent's work as quiet lines;** a box only for a command or files; changes as "+38 −6". `observed` in the site's product frame.
6. **Keys beside actions:** ⌘N, ⌘K, esc, ↵. `observed`.

## Refusals

No orange button · no 600 or 700 · no bold title · no shadow on a box · no tinted dark surface · no
two-line side-panel row · no agent avatar or bubble · no illustration in an empty or error state · no
colour without a number or word · no side panel on marketing, no site bar in the app. Evidence in
[never.md](./never.md).

## Three families

The **app** (the 240px side panel on the darkest step, a 40px title bar per area, 22px regular titles,
13px text, no footer), **flows** (a top line with the mark, one 360–480px column, a full-width inverted
Continue) and **public pages** (the 52px site bar with pills; docs add search with ⌘K and a sunken docs
panel; 14px text, 36–52px regular titles). See DESIGN.md, Page shapes.

## The five habits that matter most

1. **Two weights.** 2 [2, 2] on every recipe (one phone window shows 1, its 500 titles below the fold).
   `observed`: the source 2 [1, 2] over 75 public screens.
2. **Rows about 31px.** The typical row is 31 [22, 73]; side-panel, docs and picker rows 31–32, the
   longer ones are settings rows and form fields with a help line. `observed`: the source 30 [23, 45].
3. **Few, small sizes.** 4 [3, 5] text sizes in a window; 13px app text, 14px public. `observed`: the
   source 6 [3, 7], the extra sizes on its docs pages.
4. **Small thin icons.** 14 [13, 16]px at a 1.25px stroke. `observed`: the source 14 [12, 16].
5. **Quiet titles in the app, large ones outside.** The largest text is 1.69 times the body on app
   pages (22px over 13px), 2.57 on docs, 3.71 on pricing. `observed` for public pages (the source 2.27
   [1.78, 2.57]; its pricing 3.71); `inferred` for the app from public screenshots.

## Start from

Scan and open → `list-detail` (side panel) or `dashboard` (table). One task → `list-detail`. Daily screen
→ `dashboard`. Settings → `settings`. A setup step → `onboarding`. Nothing yet → `empty-state`. Errors →
`errors`. Docs or help → `reading`. Logging in → `sign-in`. Marketing → `pricing`. See
[precedents/index.md](./precedents/index.md).
