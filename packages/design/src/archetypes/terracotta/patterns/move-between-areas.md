# Move between areas

**The job:** let someone get to the other parts of the product without losing their place.

## What Terracotta does

1. **The header:** white, 80px, the coral mark at the left; the search pill (guests) or ink text links (host tools, the current one on a pale pill) in the centre; on the right an ink text link ("Host a place") and a round grey 40px menu button. Its own bottom hairline is the only line.
2. **Category tabs** under it on browse screens: 24px icons over 12–14px labels, the current one ink with a 2px ink bar.
3. **Underline tabs** in a page (help audiences, sections): 14/500 grey labels, the current one ink with a 2px ink bar, on a full-width hairline.
4. **The account column** for settings: a 32px title, then 16px items with 22px outline icons, the current one on the grey fill with 12px corners.
5. **Breadcrumbs** only inside host tools, 14px ink links with `›`.

## Where it appears

- Every recipe opens with a header: `dashboard` and `pricing` the host header; `onboarding` the bare flow header; `reading` the reading header (an ink mark with the section's name, the single-field search, a globe and the menu); the rest the guest header. `settings` adds the account column; `pricing` and `reading` a breadcrumb; `list-detail`, `reading` and `sign-in` end with the footer.
- Source: observed on every studied screen (the header), the browse screens (category tabs) and the help home (underline tabs) (private notes).

## Variations and triggers

- **Guests** see the search in the centre; **hosts** see text links; **a flow** (set-up, checkout) sees a bare header with only the mark and outline pills (`Questions?`, `Save and leave`); **a marketing page** sees the mark and one gradient pill; **a reading page** sees the reading header.
- **Phones, on the source** (`observed`, at 390px):
  - browse pages: the header is only the search, one full-width pill, with the category chips under it;
  - a place page: no header; round white back, send and save buttons over the photo;
  - a reading page: the mark, the section's name and a search icon;
  - a marketing page: the mark; its action moves to a bottom bar;
  - browse and sign-in add a bottom tab bar (explore, saved, sign in).
- **Phones, in a recipe** (no media queries): the guest header is drawn as flow so it responds by itself. The `m-navbar` takes `display: flow-root`; the mark floats to the start and the actions to the end, each in a 3rem box; the search sits in its own box with `min-inline-size: 20rem`. While it fits it is centred between them; on a phone it drops under them, full width. So a phone shows two rows: the mark with "Host a place" and the menu, then the search. Keep the end to one short link and one round button so the first row fits 390px. The host header's links sit in `m-navbar-nav`, which scrolls sideways.
- **The bottom tab bar** is not drawn by recipes (no library component appears only on phones). A product may add it below 744px, with the current item in ink.

## What it does not do

- No left sidebar for the whole product on guest screens.
- No coloured or filled nav bar; the header is white.
- The current tab or item is never coral. (The source's phone tab bar paints its current label coral; the language does not carry that, `observed` and set aside.)
- No second hairline under the header (the page's first section doesn't draw its own top line).

## Why

- `inferred`: guests mostly search, so search is the navigation; hosts manage, so they get words.
