# Commit to the main action

**The job:** make the one thing a screen is for obvious, and quick to do from the keyboard.

## What Flint does

- **One inverted button per view:** light grey with near-black text in dark, near-black with
  off-white text in light; 6px corners in the app, a full pill on public pages.
- **Its place:** the top right of a title bar ("Refresh"), the bottom right of a dialog after Cancel,
  full width at the end of a flow ("Continue ↵"), the send button in the composer (round, `arrow-up`).
- **Its key** beside the label at 60% ("↵", "⌘↵"); Cancel shows "esc".
- **Everything else** is secondary (a grey step and a hairline) or ghost.

## Where it appears

- `dashboard` (Refresh), `list-detail` (Keep, Send), `onboarding` and `sign-in` (Continue),
  `empty-state` (Connect alerts), `pricing` and `reading` (Start building), `errors` (Save schedule).

## Variations and triggers

- **A pane of its own:** a split view may carry one per pane (the thread's Send, the diff's Keep).
- **Settings:** none; changes apply at once.
- **Destructive:** a solid red button, only inside a confirm.

## What it does not do

- No orange button: the orange is the mark and highlights only.
- No two inverted buttons side by side.
- No bold or uppercase labels; labels stay 13px regular.

## Why

- `inferred`: an inverted button is the strongest thing on a near-black screen without adding a
  colour. Observed on the source's public pages: the main action is a near-black pill in the text
  colour ("Download"), the other a lighter grey pill or an outline.
