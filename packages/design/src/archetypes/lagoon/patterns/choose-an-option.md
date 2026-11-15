# Choose an option

**The job:** pick one of a few options.

## What Lagoon does

- **Two to four views of the same thing:** a segmented control: a grey capsule track, 2px inset, the current segment a raised white capsule with a soft drop, 13px medium text (sections, members/photos/links, monthly/yearly).
- **One of a list:** check rows in a grouped card: the chosen row carries a blue check at the right; nothing else changes.
- **A value in a settings row:** a borderless menu showing the current value in grey at the right.
- **A look or a person:** circles in a row; the chosen one ringed in blue (2px, a 2px gap of the surface colour).

## Where it appears

- `dashboard` and `list-detail` (segments), `pricing` (billing segments), `settings` (menus), `onboarding` (looks and check rows).

## Variations and triggers

- **On/off:** a switch, never a pair of radios (see edit-a-setting).
- **A plan:** a card; the suggested one ringed in blue with a small blue-tint badge.

## What it does not do

- No radio circles in a row of their own; no dropdown for two options; no tabs with underlines for sections.
- No blue fill for the chosen option except a pinned circle or the current row.

## Why

- `inferred`: the system's segmented control, check rows and menus are the reference's own choice controls, seen in its help screenshots; the ring on a chosen circle follows its picture picker.
