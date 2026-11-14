# Garnet: the brief

Warm and confident: near-black maroon ink on a warm grey sheet inside a white rim, a white header plate, heavy display headlines tracked in, maroon pills, mono step numbers, and the product drawn as neutral white panels with hairline grids and signal bars. Read this first; the depth is in [DESIGN.md](./DESIGN.md), [patterns/](./patterns/) and [never.md](./never.md). Numbers are from the fingerprint (`fingerprint.json`); `observed` = measured or seen on the source's public pages, `inferred` = a reading of it.

## Signature moves

1. **The sheet in a rim:** pages are a `#ece9ea` sheet with 40px corners inside 8px of white, and the white header plate is joined to the rim. `observed` on every public page; `inferred` for the app, whose nav sits on the rim beside a `#f8f8f8` sheet.
2. **One heavy line:** the display face at 800, tracked −0.03em, once per window; everything else is 13–16px Geist. `observed`.
3. **The ink is the accent:** maroon `#2e0000` pills, outline pills in the ink at 20%; cream pills on dark. `observed`.
4. **Mono step numbers:** "01 Workspace · 02 Your data". `observed`.
5. **The record table:** a hairline grid between rows and columns, sentence-case headers, five-step green and amber fit bars. `observed` in the product frames on public pages.
6. **The maroon footer as a window:** a framed grid of link columns with its own title bar. `observed`.

## Refusals

No second accent colour for actions · no square buttons · no second heavy line in view · no fifth weight · no public page on flat white · no heavy borders or dark shadows in the product · no colour without meaning · no yellow beyond one small mark · no capitals outside mono labels and the rail's eyebrow · no illustrated error pages. Evidence in [never.md](./never.md).

## Two families

The **app** (nav on the white rim, a near-white sheet, a mono crumb and a 32px display title, white panels with 12px corners and inset hairline rings, 13px text, no footer) and **public pages** (the warm sheet, the header plate, centred 48–54px display headlines, 44px pills, 24px-cornered cards, the maroon footer). The doors (onboarding, sign-in) are one rimmed card on the warm sheet. See DESIGN.md, The two families.

## The five habits that matter most

1. **Four weights.** 400 body, 500 labels, 600 buttons and section titles, 800 display. Language 4 [4, 4]; source 4 [4, 5] (`observed`).
2. **A big line.** The largest text is 2.3–3.7 times the body: language 2.46 [2.29, 3.73]; source 2.61 [1.85, 4.15] on its own pages (`observed`; `inferred` for app pages).
3. **Small icons.** Lucide at 1.5, 14px (12px in chips): language 14 [14, 14.8]; source 14 [9.4, 18] (`observed`).
4. **Frames, not boxes.** Panels sit three deep (rim, sheet, panel): language 3 [3, 5]; source 3 [1, 5].
5. **Room to breathe.** About two thirds of a window is empty: language 0.64 [0.49, 0.80]; the source's own pages 0.47 [0.30, 0.79], denser on phones.

## Start from

Scan and act → `list-detail` (table). One record → `list-detail` (side panel). Daily screen → `dashboard`. Settings → `settings`. A flow → `onboarding`. Nothing yet → `empty-state`. A post or docs page → `reading`. Signing in → `sign-in`. Marketing → `pricing`. See [precedents/index.md](./precedents/index.md).
