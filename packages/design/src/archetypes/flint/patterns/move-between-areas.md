# Move between areas

**The job:** let someone see where they are and get to another part of the product or site.

## What Flint does

- **In the app:** a 240px side panel on the darkest step with a hairline on its right.
  1. The workspace as a ghost button with the small mark, then search and hide-panel icons.
  2. The one creation action ("New task" with ⌘N).
  3. The areas as 31px rows with 16px icons and muted counts; then named groups.
  4. The person's name and a settings icon at the bottom.
  5. Each area opens with a 40px title bar: a 12px breadcrumb on the left, quiet actions on the right.
- **On public pages:** a 52px site bar on the page colour: the mark and wordmark (500), 14px links
  in the text colour, "Log in" as a ghost pill and the main action as an inverted pill. Docs add a
  search box with "⌘K" and a hairline under the bar, and a sunken docs panel at the left.
- **In a flow (onboarding, sign-in):** only a top line: the mark and wordmark at the left, the step
  or a way back at the right.

## Where it appears

- App: `dashboard`, `list-detail`, `empty-state`, `errors`; `settings` (its own panel with a back
  link). Public: `pricing`, `reading`. Flow: `onboarding`, `sign-in`.

## Variations and triggers

- **A phone:** the app's side panel stacks above the work; the docs panel drops below the article.
- **Settings:** the side panel swaps to the settings areas with "Back to …" at the top.

## What it does not do

- No top bar inside the app; no tabs as the main navigation.
- No coloured or filled current item beyond one grey step (the docs' current page is the link colour).
- No side panel on marketing pages; no site bar inside the app.

## Why

- `inferred`: the app is a tool beside the work, so its navigation sits in one quiet column. Observed
  on the source's public pages: the 52px site bar with pill actions, and the docs' sunken panel with
  muted group labels and its current page in the orange link colour.
