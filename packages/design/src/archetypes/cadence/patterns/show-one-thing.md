# Show one thing

**The job:** open one record, mix, show, episode or performer: what it is, who made it, and the way to play it.

## What Cadence does

1. **A header washed in colour**: the colour of the art fading down into the panel. Big art on the left (up to 232px, 6px corners, the `lg` shadow), and beside it, aligned to the bottom:
   - the type in 14px ("Public mix", "Record", "Show");
   - **the title, huge**: up to 96px at 800 with −0.04em tracking (`clamp(2.5rem, 5.5vw, 6rem)`);
   - a grey description, if any;
   - a meta line: a small avatar, the owner in bold white, then grey counts separated by "•".
2. **The action row**, under the header on the fading wash: the 56px green play button, then 32px ghost icons (shuffle, add to the collection, more), and a view switch on the right.
3. The content (a track list, episodes, an about text), then the main view's foot.
4. **The detail panel** on the right, when something is playing: its own 8px panel with the big art, the title at 24px bold, the performer, the saved tick, an "About the performer" box on the highlight grey and the credits.

## Where it appears

- `list-detail` (the mix page and the now-playing panel).
- Source: observed on the record, playlist, song, show and episode screens; the panel is from a published screenshot of the signed-in app (ids in the private notes).

## Variations and triggers

- **A performer** opens on a full-width photo with the name over it, then "Popular" as a numbered list.
- **A long title** shrinks until it fits on two or three lines (down to 32px at 800); it never wraps at 96px.
- **A show** puts an outlined Follow pill before more, and its play is in each episode row.

## What it does not do

- No white or grey header: the wash always comes from the art.
- No title at a middling size: it is the page's one huge thing, and everything else is 16px or 14px.
- No second green button in the action row.
- No tabs between the parts of one thing; they stack down the panel.

## Why

- `inferred`: the art is the thing's face, so the header takes its colour and its title the largest type in the product.
