# Edit a setting

**The job:** let someone see and change how the product behaves, one value at a time.

## What Cadence does

1. One column inside the app frame (52rem), on the main panel.
2. **The title**, "Settings", 32px bold, with a round search icon button on the right.
3. **Groups**, each a bold 16px title, then rows. No boxes and no rules around a group; 32px between groups.
4. **Rows**: the label on the left in 14px grey (with a 12px grey line under it when it needs explaining), the control on the right:
   - a **switch** (42 × 24, green when on) for anything on or off; it takes effect at once;
   - a **select** (32px, the panel colour, 4px corners) for a choice of several;
   - an **outlined pill** (small, bold 14px) for anything that opens elsewhere ("Edit" with an external-link icon) or runs once ("Clear downloads");
   - a value in grey (a folder path in the mono face, a size in tabular figures).
5. **Closing the account comes last**, under a rule: a bold 16px title, one grey sentence saying what is lost and when, and a small red pill.

## Where it appears

- `settings`.
- Source: observed on the settings screen: the 32px bold title with search on the right, bold 16px group titles, 14px grey labels, outlined pills, a grey select and green switches on the right, 12px notes with an info icon (ids in the private notes).

## Variations and triggers

- **A note on a group** (it takes time to apply, it needs a restart) is a 12px grey line with an `info` icon under the group title.
- **A setting that needs the app to restart** says so in its label line, not in a dialog.

## What it does not do

- No Save button: every control applies at once.
- No cards or panels around groups, no rules between rows.
- No side menu of setting sections; one long column with search.
- No green except switches that are on.

## Why

- `inferred`: settings are rare visits; one searchable column is faster than a hierarchy, and controls that apply at once need no save.
