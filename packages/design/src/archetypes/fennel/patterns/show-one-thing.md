# Show one thing

**The job:** show everything about one payment, or one article, and what can be done with it.

## What Fennel does

- **A payment:** a white side panel at the right of the list (16px corners, the soft halo, 24px
  padding).
  1. Its 48px icon circle and a round neutral close button.
  2. "To Harbour Clay Supply" in muted 14px/600, the amount as a 40px figure at 600, and one muted
     line with what the other side receives and the rate.
  3. Updates and Details tabs (the 2px forest line), a timeline of steps (see
     [show-progress](./show-progress.md)).
  4. Label-and-value rows over hairlines: the label muted 14px on the left, the value on the right;
     account numbers in mono.
  5. Two pale-lime pills ("Get receipt", "Repeat").
- **An article:** one column about 33rem wide under the site header: underlined breadcrumbs, a 30px
  title, 16px text in the muted colour, 18px/600 subheads, a helpful-or-not question with two small
  pills, related articles as rows with a chevron, then the footer.

## Where it appears

- `list-detail` (the side panel), `reading` (the article).

## Variations and triggers

- **Narrow screens:** the panel drops under the list.
- **A payment still moving:** the timeline's last step is an outlined circle with "should have it"
  and a time.

## What it does not do

- No lime in the panel: its actions are pale-lime pills.
- No display face for the amount: it is the text face at 600.
- No article wider than about 33rem, and no sidebar on a help article.

## Why

- `inferred`: a payment is checked against what was promised (amount, rate, arrival), so those come
  first and the paperwork (fee, account, reference) comes last.
