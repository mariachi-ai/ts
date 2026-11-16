# Move between areas

**The job:** let someone switch product areas and pages without losing their place.

## What Tally does

1. A light grey frame (`#e5e5e5`) holds everything; the content is one white panel with 12px corners, 8px in from the top, right and bottom.
2. A 64px icon rail on the frame: the wordmark, the workspace's round mark, then one 44px square per product area with a 20px icon. The current area's square is white.
3. Beside it, a 232px area panel on `#f5f5f5` with 12px corners: the area's title at 18px/600, then groups 32px apart under 14px grey labels, items 32px tall with 8px corners and a 16px icon.
4. The current page is the one blue thing in the chrome: blue text at 500 on a pale blue fill. Counts are small blue tags.
5. Settings is its own area: the panel's title gains a 24px back square, and its groups (Workspace, Developer, Account) replace the product's.
6. Usage meters (12px figures over a blue bar) sit at the foot of the panel.

## Where it appears

- Every app recipe: `dashboard`, `list-detail`, `settings`, `empty-state`, `errors`.
- Source: `observed` in the repo's sidebar and app-shell files (widths 304/64/240, the 8px page margin, item height and active colours; paths in the private notes) and in two public product screenshots of the sidebar.

## Variations and triggers

- **On a phone:** the panel comes first and the sidebar drops below it (the source opens it as a drawer over a dimmed page).
- **Nested pages:** sub-items sit under their parent on a hairline guide, 8px in.

## What it does not do

- No top bar across the app; the page header lives inside the white panel.
- No dark sidebar, and no accent fill on the current rail square: it's white.
- No icons without labels in the area panel; only the rail is icons alone.
- No more than one blue item in the chrome at a time.

## Why

- `inferred`: two tiers let one product hold several products (links, programs, settings) without a long single list.
- `inferred`: the frame makes the white panel read as the one place work happens.
