# Show an amount

**The job:** make a sum of money readable at a glance: a balance, a payment, a total, a price.

## What Volt does

- **Bold (700), tracked −3%, line height 1, tabular figures,** the currency sign and the cents at
  the same size: `$2,184.50`.
- **Sizes by role:**
  - the keypad's amount: about 88px;
  - a receipt's amount: 56px;
  - a balance, a plan price: 40px;
  - an amount in a small card or the side column: 24px;
  - an amount at the end of a row: 16px at 500.
- **Colour:** black; green text (`success.fg`) with a plus when money comes in; on the green keypad,
  black.
- **Beside it,** a muted 14px line that says what it is ("$580.00 to go", "Account ••7712").

## Where it appears

- `dashboard` (balance, keypad, spending, goal and stocks), `list-detail` (rows and the receipt),
  `pricing` (prices), `errors` (the amount field at 24px bold), the side column of every app page.
- Source: `observed` in the app screen on the public home page (the balance in very large bold
  figures) and in the App Store screenshots (earlier study).

## Variations and triggers

- **Typing an amount** → the green keypad: the amount at 88px, bold 24px digits, a black outline
  pill and a black pill.
- **A change over time** → a small green arrow and the figure ("↑ 2.4% today").

## What it does not do

- No light or regular amounts; no amounts in the display weight of a headline.
- No minus sign or red for money going out.
- No rounding: always to the cent.

## Why

- `observed`: the source's amounts are its boldest, largest type.
- `inferred`: the amount is the answer on every money screen, so it gets the weight the headlines
  don't.
