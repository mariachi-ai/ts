# Commit to the main action

**The job:** do the one thing the screen is for (book, continue, save, sign in).

## What Transit does

1. **One black button** (48px, 8px corners, 16px medium white text) per view.
2. In a panel or a narrow form it's **full width at the foot**, after everything it commits ("Book Standard", "Continue", "Review parcel").
3. On a wide public page it sits left-aligned under the fields or the headline, at its own width ("See prices" style).
4. Secondary actions are grey-filled buttons beside or under it; Back and Get help are ghost buttons.
5. A prompt banner's action is the brand blue and is never the page's main action.

## Where it appears

- `dashboard` (Book), `onboarding` (Continue), `errors` (Review parcel, Go home), `sign-in` (Continue), `pricing` (the picked plan), `empty-state` (Book by the hour).
- Source: one black 48px button with 8px corners under the trip fields is `observed` on its ride, price, city and 404 pages, and full width at the foot of the booking panel on its web booking page.

## Variations and triggers

- **Destructive** → a solid red button, only to confirm.
- **On the black block of a marketing page** → the button turns white with black text.

## What it does not do

- Never two black buttons for two different actions in one view.
- No pill-shaped main action (pills are chips and header links).
- No icon-only main action; no gradient or shadow.

## Why

- `observed` (screenshots, not counted by the probe): the source's ride, price, city and not-found pages each show one black button under their fields or title, with other buttons grey or white. The probe can't count them on the source, because a black fill has no hue for it to recognise as the action colour (`emphasis.primaries` reads 0 there).
- The language keeps one or two black controls in every first window (`emphasis.primaries` 1 to 2 on all nine recipes at 1440 and 1024, measured; a chosen chip or a switch that's on is black too, and counts).
