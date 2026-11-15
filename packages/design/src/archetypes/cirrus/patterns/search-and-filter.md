# Search and filter

**The job:** narrow a long list down to what someone is looking for.

## What Cirrus does

1. A 32px search field in the header with a hairline border, about 15rem wide.
2. Under the header, a white band of filter chips: each a white chip with a hairline, an icon, its value and an × to remove it ("This month ×"), then a ghost "+ More filters" in muted text.
3. A second band with the result's count and totals, so the filter's effect is a number.

## Where it appears

- `list-detail`. Source: observed on the app's activity screenshot (private notes).

## Variations and triggers

- **A panel's list** (the dashboard) has no filters, only "See all ›" to the full list.

## What it does not do

- No filter sidebar or panel of checkboxes.
- No search as a big field in the page; it stays in the header.
- No blue on the chips.

## Why

- `inferred`: filters read as a sentence about the list ("this month, groceries"), and the totals strip answers it.
