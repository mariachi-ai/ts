# Tally: the brief

Crisp and neutral: near-black on white panels set into a light grey frame, a two-tier sidebar with one blue "you are here", a black primary with a soft grey halo and its keyboard key, 8px controls, 12px hairline cards and rows, 14px text, and colour kept for charts and status. Read this first; the depth is in [DESIGN.md](./DESIGN.md), [patterns/](./patterns/) and [never.md](./never.md). Numbers are from the fingerprint (`fingerprint.json`); `observed` = read from the source's code as data or seen in its public screenshots, `inferred` = a reading of it.

## Signature moves

1. **The framed panel:** a `#e5e5e5` frame, a 64px icon rail, a 232px `#f5f5f5` area panel with 12px corners, and one white content panel with 12px corners, 8px in from the edges. Every app page keeps it. `observed`.
2. **One blue in the chrome:** the current sidebar item is blue text at 500 on a pale blue fill; everything else in the chrome is grey. `observed`.
3. **Black primary, grey halo, a key:** 40px, 8px corners, white 14px text at 400; on hover `#171717` with a 4px `#e5e5e5` ring; "Create link `C`". `observed`.
4. **Rows as hairline cards:** each link a 12px bordered card: a 32px favicon ring, the short link at 14px/600, a grey destination line, a clicks chip and vertical dots. `observed`.
5. **Stat tabs over one line:** 30px figures as tabs with an ink bar under the current one, a single fading area line, then tinted bar rows. `observed`.
6. **White overlays:** menus (items with key hints), tooltips and toasts are white with hairlines; dialogs have 16px corners over a pale blurred scrim. `observed`.
7. **Cards with a grey footer:** each setting is a card closing on a `#fafafa` strip with a hint and its own save. `observed`.

## Refusals

No coloured primary · no resting shadows on cards or rows · no dark tooltips or toasts · no second blue in the chrome · no big titles in the app · no edge-to-edge app · no top bar over the app · no pie charts · no full-page link form · no fourth weight in the app (keys aside). Evidence in [never.md](./never.md).

## Three families

The **app** (the frame, rail and area panel, the white panel with a 64px header, 18px/600 titles, 14px text, no footer), the **doors** (sign-in, onboarding: a split page, the form open on a faint grid with the wordmark above it, a `#fafafa` panel with one card at the right) and **public pages** (a white site bar with a grey current link, left-aligned 48px display headlines at 500, 8px black and white buttons, plans in one `#fafafa` box, the help centre's left nav with the same blue current item). See DESIGN.md, The three families.

## The five habits that matter most

1. **Three weights.** 400 text, 500 labels and figures, 600 titles: language 3 [3, 3]; source 3 [2, 4] (`observed`).
2. **8px controls.** Language 8 [8, 8]; source 8 [0, 12] (its 0 and 12 are text-only pages and the hosted docs theme) (`observed`).
3. **16px icons at 1.5px.** Language 16 [16, 16]; the app's `size-4` everywhere; the public site's chevrons run 10–14 (`observed`).
4. **Small titles.** The largest text is 1.29× the body on app pages (18 over 14); only the dashboard's 30px figures and public headlines go bigger: language 1.29 [1.29, 2.72]; source public pages 2.54 [1.92, 3.43] (`observed`).
5. **Room around few things.** About 62% of a window is empty: language 0.62 [0.45, 0.76]; the source's public pages 0.49 [0.27, 0.69], denser with product art the language doesn't copy (`observed`; `inferred` for the reason).

## Start from

Scan and act → `list-detail` (rows). Create or edit one thing → `list-detail` (dialog). Numbers → `dashboard`. Settings → `settings`. First run → `onboarding`. Nothing yet → `empty-state`. Help or docs → `reading`. Signing in → `sign-in`. Marketing → `pricing`. See [precedents/index.md](./precedents/index.md).
