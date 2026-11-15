# Show one thing

**The job:** show one payment, account or post in full, with what can be changed about it.

## What Cirrus does

1. **In the app, a white detail panel** on the right of the list (about 22rem, a hairline on its left edge):
   - a 56px header row: the type as a ghost button with a chevron ("Card purchase ⌄") and icon buttons (split, more);
   - the date and the status ("• To review") in muted text, then the payee and the amount as 28px figures on one line, then the account with its coloured dot;
   - label-and-value rows (Category, Repeats, Labels) with muted labels in a 7rem column; values are the pill, a small add button, a tag chip;
   - a note field at the foot.
2. **On a public page, a post** (`reading`): a white Back pill, a tinted mono tag with the mono date, a centred 48px title (about 30px on a phone), the lead picture in a 20px frame, the text in a 40rem column, then newer and older posts.

## Where it appears

- `list-detail` (the detail panel), `reading` (the post).
- Source: observed on the app's transaction-detail screenshot and on the changelog posts (private notes).

## Variations and triggers

- **Narrow:** the panel drops under the list; on a phone it follows the list.
- **A post without a picture** keeps the tag, date and title, and starts the text under them.

## What it does not do

- No separate page for one payment in the app: it opens beside the list, so the list keeps its place.
- No editing form with Save: each row changes on its own (a pill opens a menu, the note saves as typed).
- No big hero picture in the app.

## Why

- `inferred`: reviewing payments is a run through many, so the detail stays beside the list.
- `observed`: the posts and the app share the pale wash, the mono labels and the 20px corners, so the two families feel like one product.
