# Ask the assistant

**The job:** let someone ask for work in words and see it done beside the data.

## What Garnet does

1. A white panel beside the table or record, 16px inside.
2. The person's message in a `#f4f4f4` box with a hairline and 16px corners; the answer as plain 13px text with no bubble.
3. A subtle "Thought for 4s ⌄" line between them.
4. A proposed action as a card: white, 12px corners, a hairline, the step at 500 ("Find a person at each"), a subtle count, and one pill to run it.
5. The composer at the foot: 16px corners, a plus at the left, a quiet model or mode label, and a round send button with `arrow-up`.

## Where it appears

- `empty-state`; the gallery's chat, composer, thinking and tool-call components.
- Source: `observed` on the product frames on the public home and product pages (the request box, a thinking line, the action card with a dark pill, the composer with a round send button) (ids in the private notes).

## What it does not do

- No avatar for the assistant; no coloured bubbles.
- No action taken without the card and its pill.

## Why

- `inferred`: the card makes each agent step something a person approves.
