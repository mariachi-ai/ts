# Edit a setting

**The job:** see what is set, and change one thing at a time.

## What Solace does

1. A 32px bold "Settings" title; a side list of sections at the left (see [move-between-areas](./move-between-areas.md)).
2. **The membership panel first:** warm off-white, 12px corners, the plan in 20px bold with one muted line, and the one blue pill at the right ("Switch to yearly").
3. **Sections** with a 24px bold heading over **rows** separated by 2px soft warm rules: a 14px bold label over the value in muted text, and at the right a **small capital action in blue** ("EDIT", "MANAGE"), 14px bold, tracked out.
4. **Switches** for reminders: a bold label and a 14px muted hint on the left, the switch on the right; green when on; it takes effect at once.
5. **Deleting the account** last, under a rule: a 20px bold heading, a muted sentence on what is lost, a red pill.

## Where it appears

- `settings`.
- Source: `observed` in a published capture of the app's account screen (rows with the label over the value and blue capital EDIT and MANAGE on the right; deleting the account as the last row). The membership panel's blue pill is `inferred` from the public pages, where a blue offer pill is always in view.

## Variations and triggers

- **Editing a row** opens the field in place or the confirm sheet; there is no page-wide Save.
- **A member on the yearly plan** sees the panel without the pill, or with a gift pill.

## What it does not do

- No Save button for switches.
- No form of every field at once; one row at a time.
- No icons on rows; icons are in the side list only.

## Why

- `inferred`: settings are checked more often than changed, so values are text with an action beside them rather than open fields.
