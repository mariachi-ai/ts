# Search and filter

**The job:** narrow a large catalogue or collection to what someone is looking for.

## What Cadence does

1. **The round search field** in the top bar, always there: 48px, fully round, the highlight grey, a 24px search icon on the left, a grey placeholder ("Search songs, performers, shows").
2. **Filter chips** under it, at the top of the results or the collection: 32px pills with 14px regular labels on the highlight grey; the current one white with black text. One row; it scrolls sideways when it doesn't fit.
3. **Results** keep the browse shapes: a top result in a highlight-grey box beside the first rows of songs, then shelves of cards by type.
4. **In the collection**, a search icon and a ghost sort control ("Latest added" with a list icon) above the rows.

## Where it appears

- Every app recipe (the top bar's field); `dashboard`, `empty-state` and the collection panel (chips); `onboarding` (a white search field for picking performers); `reading` (an outlined search box with 16px corners).
- Source: observed: the field on every web player screen; the chips and the result layout on the search results screen; the outlined box on the help pages (ids in the private notes).

## Variations and triggers

- **Inside a flow** (onboarding) the search is a white field with black text, so it stands out on the panel.
- **On help pages** the search is an outlined box (1px grey ring, 16px corners, about 72px tall).
- **Sort** offers recent, alphabetical and by creator; the current choice is the button's label.

## What it does not do

- No filter sidebar, no dropdown of facets, no "Apply" button: a chip filters at once.
- No green on chips; the current one is white.
- No square search field in the app.

## Why

- `inferred`: the catalogue is too big to browse alone, so search is never more than one click away; chips are one tap because the filters are few and coarse (songs, shows, performers).
