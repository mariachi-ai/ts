# Choose an option

**The job:** let someone pick one of a few options, or turn something on or off.

## What Halcyon does

- **A few views of the same thing** (Banking or Payroll; chart or table): a segmented pill, the neutral
  track with the selected segment white on the ring shadow.
- **A value from a list** (company type, category, date range): a select, 8px corners, a hairline
  border; `sm` (32px) in rows and filter bars.
- **On or off** (yearly pricing): a switch, the accent track when on, with the label beside it at 400.
- **A period:** a ghost pill with a chevron ("Last 30 days ⌄").

## Where it appears

- `dashboard` (chart/table segments, the period), `list-detail` (filter selects, the category select),
  `onboarding` (company type), `pricing` (yearly switch), the sidebar's product switch on every app page.

## Variations and triggers

- **Icon-only segments** carry an `aria-label` ("Chart", "Table").
- **More than about five options** go in a select, not a segmented pill.

## What it does not do

- No radio cards with pictures; no accent-filled segment.
- No switch that needs a Save.

## Why

- `inferred`: the choices are quiet so they never compete with the figures they change.
