# Choose an option

**Job.** Pick one value from a set: a status, a person, a theme, a view, a range.

## What Obsidian does (parts in order)

- **Menus** (most choices): a button showing the current value and a 12px chevron opens a raised menu (8px radius, 4px padding, hairline); 32px rows at 13px with a 16px icon, the shortcut key on the right, grey group labels, hairline separators.
- **The command menu** for anything reachable by keyboard: a context chip for what it acts on, a borderless 17px input, grouped commands with their keys; the highlighted row is one grey step.
- **View chips** for two to four views or ranges: separate 28px chips, no track; the current one a grey step with a hairline ring.
- **Switches** for on/off that applies at once: 30 × 18, indigo when on.

## Where it appears

- `settings`: theme, accent and text size as buttons with a chevron; row height as view chips; four switches.
- `onboarding`: the command menu shown open, with keys on every row.
- `dashboard`: the range (This sprint, Last 90 days, All time) as view chips in the header bar.
- `list-detail` and `empty-state`: view chips beside the breadcrumb.
- `errors`: status, priority and assignee as small secondary buttons in the new-item dialog.

## Variations and triggers

- Two to four mutually exclusive views → view chips. More, or values with icons → a menu. Any action at all → also in the command menu.
- A long list of people or labels → the menu gains a filter input at the top (seen in public screenshots; not a recipe).

## What it does not do

- No native select boxes in settings rows; no radio-button lists for more than two options.
- No segmented control with a sliding track.
- No choice without a keyboard path: menus show keys, and the command menu reaches everything.

## Why

- `observed`: settings dropdowns in the source's public screenshots are buttons with a chevron (recorded in the private notes; recipe `settings`).
- `inferred`: one menu treatment everywhere means one set of keys to learn.
