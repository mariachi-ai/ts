# Search and filter

**The job:** narrow down what you see, or say where you're going.

## What Transit does

1. **Trip fields:** two 48px grey fields stacked 8px apart, a black dot in a ring inside the first, a black square inside the second, a "locate" icon at the end of the first.
2. **Filters:** 36px pill chips on the grey fill, black when chosen, with an optional 16px icon; a grey pill with `sliders-horizontal` and the period at the right.
3. **Search on a reading page:** a 48px round grey icon button at the right of the breadcrumb line; on a help home, one long grey field with a black Search button joined to it.

## Where it appears

- `dashboard` (trip fields, rider chips), `list-detail` (filter chips, the period pill), `reading` (the round search button).
- Source: the trip fields with dot and square are `observed` on its booking page, ride page, price page and city page; the round search button and the long field with a black button are `observed` on its help pages.

## Variations and triggers

- **Where from and to** → the two trip fields, always in that order.
- **A few fixed filters** → chips; **a long list to search** → one field.

## What it does not do

- No outlined white search boxes; fields are always the grey fill.
- No filter sidebar; no dropdown for two or three choices.
- No blue in chips or fields except the focus ring.

## Why

- `observed`: every studied form on the source fills its fields grey and marks the trip ends with a dot and a square.
