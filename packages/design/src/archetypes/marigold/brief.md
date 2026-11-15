# Marigold: brief

Bright, encouraging practice screens: white, 2px grey outlines, one bright green action, sky blue for
whatever is chosen, rounded heavy type, and chunky things that stand on a lip and press down.

**Two families** (DESIGN.md, The two families): the **app** (a 256px side column, 32px page titles and
24px card titles in ink, no footer) and **public pages** (a 70px white top bar, a 66rem page, lowercase
display headlines in the text green at 62/48px, 32px on phones, a footer). Account screens are public
but bare: a close button, a 24rem column, labelled fields, one full-width green action.

## Signature moves

1. **A lip under everything pressable:** a darker 4px band that goes when pressed; tiles draw it as a
   4px bottom border under 2px sides (`observed`, 28 of 28 source tiles).
2. **Two weights, both friendly:** 500 and 800 in one rounded sans (`observed`, 51 of 51 source
   screens use one or two).
3. **Green is go, blue is chosen:** one green action in any window (a long public page may repeat
   it at its close); the sky tint, a light-blue outline and blue text together mark what's picked or
   current (`observed`). The bright green is a fill; green words use the text green (`#3b7700`).
4. **One thing at a time:** flows show a close button, a thick progress bar, one question and a
   footer bar with the action (`inferred`).
5. **Progress as a game score:** coloured icons with heavy figures, goals on 16px bars with a count
   at the end (`inferred`).

## Never

- A blurred shadow (source shadow share 0 of 51), a line under 2px, a third font weight.
- Green for a selection; the bright green as text (2.1:1); red for a miss or a required field; blame or
  codes in an error.
- A table, pagination or column headers for people or progress.
- Pictures of its own, or any picture outside the four public picture slots (DESIGN.md, Pictures).

## The five habits that matter most

| Habit | Number | Evidence |
| --- | --- | --- |
| Few text sizes, one big jump | at most 4 a screen (15, 17 and two heading steps); the largest about 1.9 × the body (3.65 on wide landing and pricing) | `observed`: source 2–5 (typically 3), ratio 1.0–2.9 (typically 1.9) |
| Two weights | 1 to 2 a screen | `observed`: source 1–2 on every screen |
| One or two hues | 2 a screen (green and sky; 3 in the app where stats bring their colours) | `observed`: source 0–2 (typically 1) |
| Outlines, not shadows | no soft shadow outside overlays (shadow share .03, all overlays) | `observed`: source 0; border only where an edge is drawn (11 of 11) |
| Roomy, open rows | rows about 57px; 41–80% of a screen empty | `observed`: source lists 21–84px (typically 72), empty 36–90% |

Depth is in `patterns/` (ten jobs), `never.md`, `precedents/index.md` and `DESIGN.md`; open
questions in `questions.md`.
