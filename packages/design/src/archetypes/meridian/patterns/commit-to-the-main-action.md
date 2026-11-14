# Commit to the main action

**The job:** make the one thing someone came to do obvious, without shouting.

## What Meridian does

1. **One primary per view:** grey-1000 with white text (light), or the reverse in dark; 6px corners, 14px
   at 500.
2. **Where it sits:** the top right of the page beside its title (Trigger run, Add webhook, New job), or
   the right of a card's footer (Save changes), or full width at the end of a first-use flow (Create job,
   Continue with email, at 40px with a 16px label).
3. **Everything else is secondary** (background-100 with a hairline) or ghost (text only).
4. **Destructive actions** confirm in solid red, only in the red-bordered card or a dialog.

## Where it appears

- Every recipe: `list-detail` (Trigger run), `dashboard` (New job), `empty-state` (Add webhook),
  `settings` (Save changes), `onboarding` (Create job), `sign-in` (Continue with email), `pricing` (the
  middle plan's pill), `reading` (Set up retries), `errors` (Save secret, Go to Activity).

## Variations and triggers

- **Public pages:** the site bar's primary plus one in the page; plan buttons are pills.

## What it does not do

- No blue or brand-coloured primary; blue is for links and focus.
- No two primaries side by side; no primary in a table row.

## Why

- `observed`: the log-in page, the design system's fieldset, the docs article and pricing each show one
  black button among secondary ones. `inferred`: a primary in the text colour keeps the screen in greys.
