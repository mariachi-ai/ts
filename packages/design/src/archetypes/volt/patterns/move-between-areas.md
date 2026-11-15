# Move between areas

**The job:** let someone get to another part of the product.

## What Volt does

- **In the app:** a 240px white side column (the phone's tab bar, standing up):
  1. the wordmark (a green rounded square with a black mark, then the name at 24px 500);
  2. a grey panel with the balance at 24px bold;
  3. the main areas as 48px pill items with a 20px icon, the current one on the grey pill in
     medium; a count as a small green pill;
  4. Settings and Support apart, below.
- **The top bar:** a white pill search at the left; round grey icon buttons and one black "Send"
  pill at the right.
- **On marketing pages:** a bare 84px bar: the wordmark, 14px medium pill links, a green pill
  ("Join →") and a black pill ("Log in").
- **On the help centre:** a white bar with the faint shadow, the wordmark, a black pill and a grey
  pill; no links. A white footer with the wordmark and underlined medium links.

## Where it appears

- The side column and top bar on `dashboard`, `list-detail`, `settings`, `empty-state`, `errors`.
  The marketing bar on `pricing`; the help bar and footer on `reading`. Onboarding and sign-in have
  only the wordmark and one grey pill.
- Source: `observed` for both public bars (marketing pages: green and black pills; help pages:
  black and grey pills, white bar with a shadow). The side column is `inferred`: the app is
  phone-first and its web app wasn't studied.

## Variations and triggers

- **A first run or signing in** → no side column: the wordmark and one grey pill.
- **A phone** → the side column stacks above the page.

## What it does not do

- No breadcrumbs in the app; a round grey back button instead.
- No tabs across the top of the app.
- No links in the help bar.

## Why

- `inferred`: the phone's bottom tab bar becomes a side column on a wide screen, keeping its pill
  items.
