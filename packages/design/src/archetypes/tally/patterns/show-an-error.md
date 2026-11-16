# Show an error

**The job:** say what went wrong, where, and what to do.

## What Tally does

1. **In a field:** the border turns red, a filled red alert icon sits at the field's right end, the message in red under it.
2. **Above a form:** a danger alert (8px corners, a red hairline over a pale red tint, a 16px icon, the title at 500).
3. **Elsewhere:** a white toast at the bottom centre with a status icon, the line at 500, one line of detail and one action.
4. **A whole page:** inside the app frame, centred: the 64px tile, a 16px line, one sentence, one button, a small "Error 404".

## Where it appears

- `errors`. Source: `observed` in the repo's input (error icon and border), alert and the app's toaster position; the 404 shape is `inferred` from the empty-state component.

## What it does not do

- No red page backgrounds, no dark toasts, no error codes in the sentence.
- No toast at the top or the right; it's the bottom centre.

## Why

- `inferred`: errors stay as quiet as the rest of the interface; only the red border and icon mark the spot.
