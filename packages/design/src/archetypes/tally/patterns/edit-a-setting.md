# Edit a setting

**The job:** let someone see and change one setting at a time, safely.

## What Tally does

1. A stack of full-width cards, 20px apart, each one setting: 12px corners, a hairline, 24px padding.
2. Inside: the title at 16px/600, one grey line, then the control (fields up to 28rem).
3. A `#fafafa` footer strip with a hairline above: a grey hint at the left ("Max 32 characters.") and the card's own small primary at the right.
4. The danger card comes last: edged in red, a pale red footer, the red button.

## Where it appears

- `settings`, `errors` (the add-domain card). Source: `observed` in the repo's form component and settings layout.

## Variations and triggers

- **Read-only values** (an ID): the field in mono with a copy button, no save.
- **Toggles:** a switch row that acts at once, no save.

## What it does not do

- No single Save for the whole page.
- No label-and-value rows on hairlines; every setting is a card.
- No tabs across settings; the area panel lists the pages.

## Why

- `inferred`: one save per card means a change is small and its effect is clear.
