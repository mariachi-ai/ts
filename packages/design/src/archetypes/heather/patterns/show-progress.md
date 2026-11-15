# Show progress

**The job:** show how far something has got: a set-up, an upload, a video, a level.

## What Heather does

- **Steps:** "Step 3 of 3" in 14px subtle at the right of the wordmark, over a thin round blue bar
  on the quiet fill.
- **A video:** a 4px blue line along the bottom of the frame; the time chip in the corner.
- **A level** (the microphone): the same round bar as a meter that turns amber, then red, past its
  marks.
- **Work in the background:** a flag with the percentage in its title when it stops; a spinner only
  inside a button or a small area.
- **Loading lists:** skeleton blocks on the quiet fill at the cards' size, with 16px corners.

## Where it appears

- `onboarding` (the step bar and the microphone meter), `list-detail` (the video's progress),
  `errors` (the upload flag).

## Variations and triggers

- **Reduced motion:** skeletons stop shimmering; nothing else moves.

## What it does not do

- No numbered step circles; no percentage over a running bar.
- No full-page spinners.

## Why

- `inferred`: progress is a quiet line in the accent; it should be readable at a glance without
  taking the eye from the content.
