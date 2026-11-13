# Show one thing in detail

**The job:** give everything about one place (or offer) on one page, and keep the action to book it in reach.

## What Terracotta does

1. The title at 26px and 500, with underlined `Send` and `Save` on the right of the same line.
2. A photo mosaic: one large photo and four smaller ones, 8px apart, with 12px corners on the outer edge only, and a small white `All 32 photos` button on the last photo.
3. Two columns under it: the content (about 60%) and a sticky booking panel (about 23rem).
4. The content is a run of sections, each opened by a full-width hairline and about 40–48px of space: the summary line ("4 guests · 2 bedrooms · …"), the rating, the host row with an avatar, the description in ink with an underlined `Read more`, then the amenities with 24px outline icons at 1.5px, and one grey-fill `See all 41 things` button.
5. The booking panel: price underlined, the dates and guests as one outlined box split by hairlines with 10px uppercase captions, the full-width gradient pill, "Nothing is charged yet", then the price lines underlined and the total under a hairline (see [commit-to-the-main-action](./commit-to-the-main-action.md)).

## Where it appears

- `list-detail` (the listing half). Source: observed on the place pages and the photo tour (private notes ids); the help and resource articles share the hairline-section reading column without the panel.

## Variations and triggers

- **Narrow screens:** the panel drops under the content; on phones the mosaic becomes one full-width photo (observed: the source's place page on a phone opens with a full-bleed photo) and the booking action pins to the bottom bar.
- **Articles** (help, guides): the same reading column with hairline sections, no mosaic and no panel; one photo may lead.

## What it does not do

- No tabs between sections: it is one long page, sections opened by hairlines.
- No card around each section; only the booking panel is lifted.
- No coloured section headings or icons; icons are ink outline.
- The panel never holds more than one primary action.

## Why

- `inferred`: one scroll keeps the decision in one place; the sticky panel means the action never needs hunting for.
- `observed`: on the place pages the only bordered, shadowed container in the window is the booking panel (border and shadow both) (private notes).
