# Edit a setting

**The job:** let someone find one setting and change it, with the effect clear before they do.

## What Fennel does

1. The profile at the top: a 72px avatar with initials in forest green on pale lime, the name at
   30px/600, a muted line with the account kind and its number, and a small pale-lime "Edit profile"
   pill.
2. Groups under muted 14px/600 headings ("Account", "Notifications", "Business").
3. Each setting is a row like any other (see [browse-many-things](./browse-many-things.md)): a 48px
   icon circle, a 16px/600 title and a muted line saying what it covers or its current value, then a
   24px chevron (it opens a page) or a switch (it takes effect at once).
4. Closing the account comes last, under a hairline, with what it does and a danger pill.

## Where it appears

- `settings`. The rows use the full content column, not a narrow one.

## Variations and triggers

- **A setting that can't be turned off** shows its switch disabled with the reason in its line
  ("Always on for your security").
- **A connected service** shows a success badge in its line ("Connected").

## What it does not do

- No Save button for switches; they apply at once.
- No lime pill on the settings page: no action leads it.
- No cards around groups; headings and space group them.

## Why

- `inferred`: settings are found by scanning titles, so every setting is the same row shape and the
  description says what the setting is now.
