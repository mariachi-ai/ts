# Browse many things

**The job:** let someone scan a month of activity (payments, bills, accounts) and spot the ones that need them.

## What Cirrus does

1. The white header: the area's name at 16px with its icon in blue, icon buttons (add, export) and a 32px search field at the right.
2. White bands under it: the filter chips (see [search-and-filter](./search-and-filter.md)), then a totals strip ("24 transactions · Out · In · Net", the net in green when it is money in).
3. The month and its total as 28px figures on the canvas.
4. Rows **grouped by day** under muted 15px date lines at 550 ("Today", "Yesterday", "Monday, April 13"). Each row: a checkbox, the payee with its account in subtle text, a tag chip if any, the category pill (tint, emoji, capitals), the amount right-aligned at 550 with the small raised sign, and a 6px blue dot when it still needs a look. Rows are about 38px, separated by space, not rules.
5. In a panel (the dashboard's "Needs a look", "Coming up"), the same rows in fewer columns, a "See all ›" link in the panel's title row and "1 – 3 of 3" with chevrons at the foot.

## Where it appears

- `list-detail` (the activity), `dashboard` (Needs a look, Top categories, Coming up), `settings` (the budgets table).
- Source: observed on the app's activity, dashboard and categories screenshots (ids in the private notes).

## Variations and triggers

- **Money in** is green; money out is navy, with no minus sign.
- **Budgets** become a table: capital column labels, a coloured disclosure triangle and a count chip on each group, children indented with their emoji, a 6px bar between spent and budget (green, amber past 85%, red past 100%).
- **Upcoming items** lead with the date in muted text instead of a checkbox.
- **Selected rows** take the pale blue tint with a 2px blue edge on the left, and a floating action bar appears (see [commit-to-the-main-action](./commit-to-the-main-action.md)).

## What it does not do

- No grid of rules or zebra stripes around activity; days and space do the grouping.
- No category as plain text: it is always the tinted pill with its emoji.
- No red for an ordinary expense; red means over budget or an error.
- No full-size currency sign.
- No thumbnails or logos on rows (institutions are coloured dots).

## Why

- `inferred`: people scan money by day and by category, so the day line and the pill carry the scanning; the amount is the only thing at 550.
- `inferred`: colour is saved for meaning (money in, over budget, needs a look), so it can be trusted at a glance.
