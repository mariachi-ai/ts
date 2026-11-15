# Commit to the main action

**The job:** make the one action that moves money or finishes a flow unmistakable, and keep the rest quiet.

## What Halcyon does

- **Every button is a pill,** label at 360, 32px in bars and rows, 36px in forms.
- **The solid accent pill** appears only where money moves or a flow ends: "Send" first in the
  dashboard's row, "Review payment" at the end of a form, "Continue" and "Log in" at the end of a flow,
  the site bar's "Open an account" and the recommended plan.
- **Everything else** is a neutral pill (the page's own action on a list page, "Transfer", "Deposit"),
  a ghost (the top bar, "Customize", Back, Cancel) or, on public pages, a pill tinted with the accent.
- **In a form,** Cancel or Back as a ghost at the left, the primary at the right.

## Where it appears

- `dashboard` (Send), `errors` (Review payment), `onboarding` (Continue), `sign-in` (Log in),
  `pricing` (the trial and the site bar), `reading` (the site bar). `list-detail`, `settings` and
  `empty-state` have no solid accent pill.

## Variations and triggers

- **Destructive and final:** a solid magenta danger pill, only to confirm ("Close account…").
- **Public pages:** quiet pills tinted with the accent rather than grey.

## What it does not do

- No square or outlined primary; no second solid accent pill in the same group.
- No solid accent pill for adding, importing or matching things on a list page.

## Why

- `inferred`: the accent marks the moments that cost something; seen rarely, it stays a signal.
