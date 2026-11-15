# Edit a setting

**The job:** let someone check a value and change it, with the change taking effect at once.

## What Flint does

1. A settings side panel: a muted "Back to …" link, then the areas as 31px rows, a group label for
   the workspace's own settings.
2. A 672px column: a 22px regular title and one muted line ("Changes save as you make them.").
3. Groups: a 13px muted label above one box with 12px corners on the raised step.
4. Rows inside the box, split by hairlines: the setting's name and one muted line on the left; the
   control on the right (a green switch, a small select sized to its value, a 192px input, or a
   small secondary button).

## Where it appears

- `settings`.

## Variations and triggers

- **A setting that is on and allowed:** a small tinted badge beside its name ("Allowed").
- **A setting with two values:** two small selects with "to" between them.
- **A destructive setting:** a small secondary button ("Unpair"), never red until a confirm.

## What it does not do

- No Save button for switches and selects: they apply at once.
- No primary (inverted) button on a settings page.
- No section titles larger than the row text; group labels are muted 13px.

## Why

- `inferred`: settings are read far more than changed; plain rows with the control at the right keep
  them scannable. The grouped boxes with a muted label above follow public screenshots of the source's
  app settings (reference only).
