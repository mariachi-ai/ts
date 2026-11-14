# Say nothing is here

**The job:** say that there's nothing to show yet, or nothing matched, and what to do.

## What Lagoon does

1. **The frame stays:** the sidebar and the pane are where they always are.
2. **Centred in the space that is empty:** a large grey outline glyph (44px in the sidebar, 64px in the pane, 1.25–1.5px stroke).
3. **A 22px bold title** that says what's missing ("No results", "Pick someone to talk to").
4. **One grey sentence** saying what to do or why.
5. **At most two capsules,** the blue one first ("New chat", then "Invite a friend").

## Where it appears

- `empty-state` (both), `errors` (the full-page errors share the shape inside a white card).

## Variations and triggers

- **A search found nothing:** the sentence names the search; no buttons.
- **Nothing chosen yet:** the pane at rest, with the two capsules.

## What it does not do

- No illustration, no photo, no coloured glyph.
- No more than one sentence; no list of tips.

## Why

- `inferred`: the system's own empty views use a large grey symbol, a bold title and a line of text; Lagoon never copies illustrations.
