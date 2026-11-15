# Search and filter

**The job:** narrow a long list of payments to the ones someone is looking for.

## What Fennel does

1. A pill-shaped search field (48px, the control grey ring) with a 20px search icon inside on the
   left and a placeholder that names what it searches ("Search payments").
2. Filter pills under it, the current one forest green with lime text (see
   [choose-an-option](./choose-an-option.md)).
3. The rows stay grouped by day under the filter.

## Where it appears

- `list-detail`.

## Variations and triggers

- **No results:** the title and the search stay; the empty block takes the rows' place (see
  [say-nothing-is-here](./say-nothing-is-here.md)), with a pale-lime "Clear filters".

## What it does not do

- No square search box, no search button: results update as someone types.
- No filter panel or sidebar of facets.

## Why

- `inferred`: a person usually knows the payee or the amount, so one field and a few pills cover
  most searches.
