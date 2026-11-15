# Choose an option

**The job:** pick one or several options: goals, a plan, a guide, a filter.

## What Solace does

- **Choice rows** (several may be picked): each a 56px warm off-white row with 12px corners, the label bold on the left, a 24px checkbox on the right that fills blue with a white tick when chosen. Rows stack 12px apart.
- **Plan options** (one is picked): two cards side by side with 12px corners and 24px inside; the chosen one is filled sun yellow, the other white with a thin charcoal border; an offer label in solid blue sits on the chosen card's top edge; the radio on the right.
- **A guide or a period**: full-width pills, the chosen one charcoal (`bg.inverse`) with white text, the other white with the soft border.
- **A filter**: the segmented control (the warm off-white track, the chosen segment white).

## Where it appears

- `onboarding` (choice rows), `pricing` (plan options), `list-detail` (the guide pills; the segmented filter).
- Source: `observed` on the public plans page (the chosen plan filled yellow with a blue label on its edge, the other white with a thin dark border) and in the published app screenshots (warm choice rows with blue ticks on the right, charcoal guide pills).

## Variations and triggers

- **One answer only:** the same rows with a radio circle on the right.
- **Inside a flow:** choices sit under a 32px question and one muted line that says how many may be picked.

## What it does not do

- Never blue for "chosen" on a pill or a card: chosen is charcoal or sun yellow; blue is the tick inside a control and the one action.
- No dropdown for a handful of options; they are all shown.
- No borders on choice rows: the warm off-white fill is the row.

## Why

- `inferred`: the chosen plan in sun yellow reads as warm and celebratory rather than a system state; it also keeps the blue for the step that follows.
