# Choose an option

**The job:** let someone pick one of a few things: a kind of account, a filter, a tab.

## What Fennel does

- **A few described choices (in a flow):** choice rows in a column, each a 16px-cornered box with a
  hairline: a 48px icon circle, a 16px/600 title and a muted line, and a radio at the right. The
  chosen row's ring is forest green.
- **Filters:** small pills in a row ("All", "Sent", "Received"); the current one is filled forest
  green with lime text, the rest are outlined in the control grey.
- **Views of one thing:** underline tabs (muted labels, the current in forest green at 600 on a 2px
  line), or a segmented control (a neutral pill track with a white pill).
- **A long list:** a select, the same 48px box as an input.

## Where it appears

- `onboarding` (the kind of business), `list-detail` (filter pills, the panel's tabs).

## Variations and triggers

- Two to five described choices → choice rows; more → a select.
- Choosing a filter changes the list at once; choosing in a flow waits for Continue.

## What it does not do

- No lime on a selected choice: selection is forest green.
- No square checkboxes for a single choice.
- No cards with shadows for choices.

## Why

- `inferred`: forest green means "this is set"; lime means "do this now". Keeping them apart keeps
  the one lime pill readable as the next step.
