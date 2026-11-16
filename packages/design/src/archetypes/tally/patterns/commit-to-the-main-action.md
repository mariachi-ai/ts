# Commit to the main action

**The job:** make the one thing a screen is for obvious and fast.

## What Tally does

1. One black primary per view, 40px, 8px corners, white 14px text at 400.
2. It often ends in its key: "Create link `C`", "Save changes ↵"; keys are 12px light in a small grey box.
3. On hover it turns `#171717` and grows a 4px `#e5e5e5` halo.
4. It sits last: at the right of the toolbar, a card footer, or a dialog footer.
5. In a door (onboarding, sign-in), it is full width at the end of the form.

## Where it appears

- Every recipe. Source: `observed` in the repo's button file (variants, height, halo) and the link builder's footer.

## Variations and triggers

- **Settings:** each card has its own small primary ("Save changes") in its footer.
- **Public pages:** the same black button with 8px corners ("Sign up" in the site bar, the recommended plan); the others are white secondaries.
- **Destructive:** a solid red button, only inside a red-edged card or a confirm dialog.

## What it does not do

- No coloured primary: never blue, never the chart colours.
- No two black buttons side by side; the second action is a white secondary.
- No primary in the page header of a list page; it lives in the toolbar.
- None on analytics: its header is the title alone and its toolbar holds only secondaries (`observed` in the source's analytics page and toolbar).

## Why

- `inferred`: black reads as the action in a neutral interface without adding a hue that competes with data colours.
