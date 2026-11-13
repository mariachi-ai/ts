# Marigold: brief

Bright, encouraging practice screens: white, 2px grey outlines, one bright green action, sky blue for
whatever is chosen, rounded heavy type, and chunky things that stand on a lip and press down.

## Signature moves

1. **A lip under everything pressable:** a darker 4px band that goes when pressed; tiles draw it as a
   4px bottom border under 2px sides (`observed`, 28 of 28 source tiles).
2. **Two weights, both friendly:** 500 and 800 in one rounded sans (`observed`, 51 of 51 source
   screens use one or two).
3. **Green is go, blue is chosen:** the sky tint, a light-blue outline and blue text together mark
   what's picked or current (`observed`).
4. **One thing at a time:** flows show a close button, a thick progress bar, one question and a
   footer bar with the action (`inferred`).
5. **Progress as a game score:** coloured icons with heavy figures, goals on 16px bars with a count
   at the end (`inferred`).

## Never

- A blurred shadow (source shadow share 0 of 51), a line under 2px, a third font weight.
- Green for a selection; red for a miss; blame or codes in an error.
- A table, pagination or column headers for people or progress.
- Pictures or characters (the language's own rule; the source uses them).

## The five habits that matter most

| Habit | Number | Evidence |
| --- | --- | --- |
| Few text sizes, one big jump | 3 to 4 sizes a screen; the largest about 1.9 × the body (3.65 on public pages) | `observed`: source 2–5 (typically 3), ratio 1.0–2.9 (typically 1.9) |
| Two weights | 1 to 2 a screen | `observed`: source 1–2 on every screen |
| One or two hues | 2 a screen (3 where stats bring their colours) | `observed`: source 0–2 (typically 1) |
| Outlines, not shadows | no soft shadow outside overlays (shadow share .03, all overlays) | `observed`: source 0; border only where an edge is drawn (11 of 11) |
| Roomy, open rows | rows about 57px; 41–80% of a screen empty | `observed`: source lists 21–84px (typically 72), empty 36–90% |

Depth is in `patterns/` (ten jobs), `never.md`, `precedents/index.md` and `DESIGN.md`; open
questions in `questions.md`.
