# Show one thing in detail

**The job:** give everything about one place (or offer) on one page, and keep the action to book it in reach.

## What Terracotta does

1. The title at 26px and 500, with underlined `Send` and `Save` on the right of the same line.
2. A photo mosaic: one large photo and four smaller ones, 8px apart, with 12px corners on the outer edge only, and a small white `All 32 photos` button on the last photo.
3. Two columns under it: the main column (about 60%) and a sticky booking panel (about 23rem). The panel's wrapper stretches to the main column's height (`align-self: stretch`) so the panel can stick.
4. The main column is a run of sections, each opened by a full-width hairline and about 40–48px of space: the summary line ("4 guests · 2 bedrooms · …"), the rating, the host row with an avatar, the description in ink with an underlined `Read more`, **the bedrooms** (a photo card per room with 12px corners, the room at 16/500, the beds in grey 14px), then the amenities with 24px outline icons at 1.5px and one grey-fill `See all 41 things` button.
5. The booking panel: price underlined at 600, the dates and guests as one outlined box split by hairlines with 10px uppercase captions at 600, the full-width gradient pill, "Nothing is charged yet", then the price lines underlined and the total under a hairline (see [commit-to-the-main-action](./commit-to-the-main-action.md)).
6. Where the panel's column ends, the sections run the full width of the 70rem column:
   - **Reviews:** the score huge and centred (72–100px at 500, tracked −2%), a 22px line, a grey sentence and a small underlined grey link; the rating categories in one row split by short vertical hairlines (a 12px label and score, a 24px ink icon); then the reviews in two columns, each a 48px avatar, the name at 500 over a grey line, small ink stars with the date in grey, three lines of ink text and an underlined `Read more`; then a grey-fill `See all 126 reviews`.
   - **Location:** the place's name at 16/500, the map across the column (20px corners, about 30rem tall) with the place pin: a 48px ink disc with a white `house` and a short point, on the `sm` shadow. A sentence about the area and an underlined link follow.
   - **Before you book:** a grid of three or four facts, each a 24px ink outline icon, a 14/500 title, a grey 14px line and an underlined `Read more`.
7. The footer band opens with a breadcrumb of where the place is and a grid of nearby places.

## Where it appears

- `list-detail` (the listing half); `reading` uses the same column without the mosaic. Source: observed on the place pages and the photo tour (private notes ids), including the lower sections, measured again on 2026-11-13; the help and resource articles share the reading column without the panel.

## Variations and triggers

- **Narrow screens:** the panel drops under the main column.
- **Phones** (`observed`): the mosaic becomes one full-bleed photo with a small dark "1 / 32" count; the title and facts are centred under it; the booking action pins to a bottom bar (see [commit-to-the-main-action](./commit-to-the-main-action.md)).
  - **In a recipe** the mosaic does this by itself: a wrapping flex row of a fixed height (`clamp(16rem, 30vw, 25rem)`, `overflow: hidden`) holding the large photo (`flex: 2 1 22rem`) and the 2 × 2 block (`flex: 1 1 22rem`). On a phone the block wraps to a second row and the height cuts it off. The bottom bar can't be drawn only on phones, so recipes leave it out and the panel drops under the main column.
- **Articles** (help, guides): the reading column with a small hairline panel beside it for the page's one action; no mosaic; one picture leads (see the `reading` recipe).

## What it does not do

- No tabs between sections: it is one long page, sections opened by hairlines.
- No card around each section; only the booking panel is lifted.
- No coloured section headings or icons; icons are ink outline, the place pin included.
- No bar pinned to the bottom of a wide screen.
- The panel never holds more than one primary action.

## Why

- `inferred`: one scroll keeps the decision in one place; the sticky panel means the action never needs hunting for.
- `observed`: on the place pages the only bordered, shadowed container in the window is the booking panel (border and shadow both) (private notes).
