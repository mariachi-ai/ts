# Move between areas

**The job:** let someone get to another part of the app or the site.

## What Cirrus does

1. **In the app, the 256px white sidebar** with a hairline edge:
   - a square collapse button and a sync button at the top;
   - nav rows at 16px with an 18px grey icon; the current row pale blue with blue text and icon; counts as plain muted numbers at the right;
   - accounts in groups under a small triangle and a muted heading, each with a coloured dot, its name and a muted balance;
   - at the bottom, after a hairline: help, settings and an amber "Finish setup" row with what's left.
2. **The 56px white header** names the area at 16px.
3. **On public pages, the transparent 72px header:** the mark, muted 16px links at 550 (the current one navy), a white pill and a blue pill at the right; and the white footer at the end of every page.

## Where it appears

- Every app recipe (`dashboard`, `list-detail`, `settings`, `empty-state`, `errors`); `pricing` and `reading` (header and footer).
- Source: observed on the app screenshots (sidebar, header) and on every site page (header, footer: 16/500 headings, 16/430 links at 70% in 22px rows, measured).

## Variations and triggers

- **On a phone** the page comes first and the sidebar drops under it.
- **Settings** add a second, plain list of sections inside the page.

## What it does not do

- No dark or coloured sidebar in light mode.
- No tabs across the top of the app for its areas (the phone app's scrolling tabs aren't reproduced).
- No footer inside the app.
- No breadcrumb trails in the app; a back arrow when one is needed.

## Why

- `inferred`: accounts and their balances are the second thing people check, so they live in the sidebar under the areas.
