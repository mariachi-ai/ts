# Show one thing

**The job:** show one session, course or article with what someone needs to start it.

## What Solace does

1. **A picture band** first, 16px corners, with a round white back button over its top-left corner.
2. An outlined badge for the kind ("Course"), then the 32px bold title, a save heart at the right.
3. The meta line with its icon, and one sentence at 18px.
4. **A choice, if there is one** ("Choose your guide"): each option a full-width pill beside its avatar, the chosen one charcoal.
5. **The one blue pill** ("Begin course"), large, with a warm off-white pill beside it for the lesser action ("Save offline").
6. [The player](./play-a-session.md), then the course's sessions as rows with a state circle and a badge.

## Where it appears

- `list-detail` (the course half); `reading` is the public, long-form version.
- Source: `observed` in the published app screenshots (a picture band, a bold title, a meta line, the guide choice with a charcoal pill, a big blue pill) and on the public article pages (below).

## Variations and triggers

- **An article** (`reading`): the contents of the article in a side column ("In this article"), a breadcrumb with ">", a 48px bold title, the date in 12px, the byline in a warm off-white box with a round avatar and a blue name, the picture band (12px corners), 18px text with blue underlined links, then a session in the player and more articles as cards. `observed` on the source's article pages.
- **Locked** (not in the plan): the blue pill becomes "See plans"; the sessions show a grey lock circle.

## What it does not do

- No tabs inside the detail; everything is one column read top to bottom.
- No second blue pill for "Save" or "Share"; those are a heart and a warm off-white pill.
- Never more than one picture band.

## Why

- `inferred`: one column, one step: the screen answers "what is this, how long, who leads it" and then offers the one step.
