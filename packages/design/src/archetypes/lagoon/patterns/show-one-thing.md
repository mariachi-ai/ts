# Show one thing

**The job:** show one person or group, and what you can do with them.

## What Lagoon does

1. **On the grouped grey,** one centred column 30rem wide; a round close button at the top left and a grey "Edit" capsule at the top right.
2. **The circle:** 88px, initials on a tint, then the name in 28px bold and one muted 13px line ("6 people · reading together since March").
3. **Round actions:** four 44px grey circles with 18px ink glyphs (call, video, mute, invite), labelled for screen readers.
4. **A segmented control** for what to show (members, photos, links).
5. **Grouped cards:** blue link rows, then switch and chevron rows with a footnote, then a red "Leave" row alone in its own card, last.

## Where it appears

- `list-detail` (the group's details); `onboarding` uses the same head (circle, name, round buttons) for your own profile.

## Variations and triggers

- **A person, not a group:** the same head, no member grid.
- **Your own profile while setting up:** the round buttons turn pale blue with blue glyphs (choose a photo, an emoji, edit the name).

## What it does not do

- No header bar or tabs across the top; no side-by-side panels.
- No destructive action in the same card as other rows, and never red fill: a red text row.
- No cover image or banner behind the circle.

## Why

- `inferred`: a details view is a sheet over the conversation, so it is one narrow column you close, not a page you navigate.
