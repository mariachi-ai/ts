# Offer the upgrade

**The job:** show what the paid plan adds over the free one and get one decision: start the trial.

## What Marigold does, in order

1. **A public top bar:** white, 70px, a 2px line under it, the wordmark in the text green on the
   left and a small white "Log in" button on the right. Nothing else.
2. **A centred, lowercase display headline at 800 in the text green** (`--m-color-success-fg`, never
   the bright brand green, which is 2.1:1 on white), 62px and 32px on phones, tracked tight ("grow
   further with plus"), then one muted sentence that says the free plan stays free, then the yearly
   switch.
3. **The plans side by side,** joined by a 12px gap, each a column with 16px corners and a 2px
   outline:
   - a header band in the pale well with the plan's name, the price at 24px 800 and a muted note;
   - the perks as a list of rows, a green tick or a grey cross before each, the same rows in the same
     order in every column.
   - The recommended plan is raised (it sticks out 12px above and below), outlined in blue, its
     header in the sky tint, and carries a solid "Most picked" badge.
4. **One large green action** under the plans, about 18rem wide, with one muted line about when the
   trial ends.
5. **Questions in an outlined accordion:** one card, rows split by 2px lines, a chevron at the right
   of each, the first open.

## Where it appears

- Recipe: `pricing`.
- The accordion is the same one the help pages use.

## Variations and triggers

- **Two plans:** the same columns, the paid one raised.
- **A family or group plan** is a third column, not a separate page.

## What it does not do

- It doesn't put a button in each plan column; there is one action for the page.
- It doesn't use pictures, testimonials or logos between the plans and the action.
- It doesn't set the headline in title case, in grey or in the bright brand green; it is lowercase
  in the text green.
- It doesn't cross out a price or use red for savings; the saving is said in the switch's label.
- It doesn't hide the free plan.

## Why

- `inferred`: the free column stays visible so the upgrade reads as "more" rather than "or else",
  which fits a language that never scolds.
- `inferred`: one action for the page keeps the green for one thing per window (DESIGN.md, How a
  screen is assembled).
- Note: the source's own plan comparison sits on a dark sub-brand; Marigold keeps the core white
  brand. That is the language's choice, not the source's habit (see questions.md).
