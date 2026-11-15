# Edit a setting

**The job:** let someone see a value and change it in place.

## What Vellum does

1. **Grey grouped panels** (`bg.sunken`, 20px corners, no border, no shadow), one per group, under a 13px semibold muted group label.
2. **Rows inside,** 12px by 16px padding: the label at the left (a 13px muted help line under it when needed), the control at the right: a select about 11rem wide, a platform switch, or a ghost action.
3. **Inset dividers** between rows (the library's divider, inset to the text), never a border on the row itself.
4. **Switches act at once;** there is no Save button.
5. **The destructive row last,** its label in red, with a red pill to confirm.

## Where it appears

- `settings` (Appearance, Timeline, Your entries), `onboarding` (three switches), `dashboard` (Start from a moment: icon rows with counts and chevrons), `sign-in` (other ways in).
- Source: grouped panels set apart from the ground with inset hairlines are `observed` in the phone app's settings screenshot on a studied help page; the web app's settings modal (earlier study) draws one outlined white group instead (see questions).

## Variations and triggers

- **A value to pick** → a select at the right.
- **On or off** → a switch.
- **A place to go** → an 18px icon, the label, a count and a chevron; the inset divider starts after the icon.

## What it does not do

- No outlined white boxes for groups, no row borders.
- No Save button for switches.
- No more than one destructive row, and never first.

## Why

- `observed`: the phone app's settings and the Today screen's Moments list are grouped panels with inset hairlines.
- `inferred`: a switch that waits for Save is a second step the platform doesn't ask for.
