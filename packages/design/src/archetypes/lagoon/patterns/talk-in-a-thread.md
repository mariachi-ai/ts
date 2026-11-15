# Talk in a thread

**The job:** show a conversation and let someone answer.

## What Lagoon does

1. **The top:** a round glass button at each corner (hide the sidebar; video and details), and in the middle the person's 44px circle over a raised name capsule with a small chevron.
2. **Timestamps between runs,** centred, 11px grey: "**Today** 9:40 AM".
3. **Bubbles:** theirs on the left in light grey, yours on the right in blue with white text; 18px corners, 7 × 12px padding, at most 70% wide; 2px between bubbles in a run; a tail on the last of each run only.
4. **In groups:** the sender's name in 11px grey above their first bubble, their 32px circle beside their last.
5. **Reactions:** a 28px round bubble on the top outer corner with a trail of two dots.
6. **Receipts:** "**Delivered**" or "**Read** 9:42 AM", 11px grey, under your last message only.
7. **Someone typing:** three grey dots in a grey bubble with a tail.
8. **The composer:** a round add button, the capsule field with a voice glyph (a blue round send arrow once there is text), a round emoji button.

## Where it appears

- `dashboard`, `errors` (the unsent message), `reading` (a sample thread in a grouped-grey card).

## Variations and triggers

- **A message that didn't send:** a red circled mark beside the bubble and "**Not sent.**" under it.
- **Offline:** an orange-tint notice under the top; messages wait.

## What it does not do

- No time inside each bubble; no borders or shadows on bubbles; no second colour for your bubbles.
- No tail on every bubble, and none on a bubble that is not last in its run.
- No header bar with a rule; no names on your own bubbles.

## Why

- `inferred`: the reference's own window, read from its public help screenshots, draws exactly these parts; times and receipts stay out of the bubbles so the words lead.
