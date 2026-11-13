# Marigold: precedents

The language's own screens: its nine recipes (the seven required shapes, then `reading` and `sign-in`),
built only from the library's classes and tokens, with invented content (a plant-care learning app).
Each is measured by the probe at three widths; the numbers are in `fingerprint.json`. Screenshots are
built with the package: `recipes/<id>.html` in the kit and the gallery. The source's screens stay in
the private notes. `dashboard` to `errors` (bar `pricing`) are the app family; `pricing`, `reading` and
`sign-in` are public (DESIGN.md, The two families).

| Id | Purpose | Kind | Patterns it uses |
| --- | --- | --- | --- |
| `dashboard` | The home screen: today's unit as a path of steps, with progress and goals beside it | dashboard | [path-of-steps](../patterns/path-of-steps.md), [show-progress](../patterns/show-progress.md), [rank-people](../patterns/rank-people.md) (the ranking card) |
| `list-detail` | This week's ranking of a group, with one person's card and totals | list, detail | [rank-people](../patterns/rank-people.md), [show-progress](../patterns/show-progress.md) (stat tiles) |
| `onboarding` | The first question of sign-up: pick what to learn first | firstUse | [one-step-at-a-time](../patterns/one-step-at-a-time.md), [choose-an-answer](../patterns/choose-an-answer.md) |
| `settings` | Change how lessons behave and edit the account | settings | [set-something-up](../patterns/set-something-up.md), [ask-for-details](../patterns/ask-for-details.md) (the fields) |
| `empty-state` | Friends, before following anyone | empty | [nothing-here](../patterns/nothing-here.md), [show-progress](../patterns/show-progress.md) (the goals card stays) |
| `pricing` | The paid plan against the free one, with questions | marketing | [offer-the-upgrade](../patterns/offer-the-upgrade.md) |
| `errors` | Every size of error on one page: field, form, answer, background task, whole page | error | [show-an-error](../patterns/show-an-error.md), [choose-an-answer](../patterns/choose-an-answer.md) (the answer banners), [ask-for-details](../patterns/ask-for-details.md) (the profile form), [nothing-here](../patterns/nothing-here.md) (the whole-page block) |
| `reading` | A how-to post on the product's blog: setting a watering reminder (public) | detail | DESIGN.md: The two families (public), Page shapes: Reading, Pictures (the three picture slots drawn as stand-ins) |
| `sign-in` | The log-in screen: labelled fields, one green action, other ways in (public, account) | form, firstUse | [ask-for-details](../patterns/ask-for-details.md) |

## What each one measures (typical, wide)

From the probe, at 1440 × 900. Weights and sizes count distinct values carrying at least 3
characters; hues count saturated hue bins covering at least 0.2% of the window.

| Id | Text sizes | Weights | Hues | Largest ÷ body | Depth | Primaries |
| --- | --- | --- | --- | --- | --- | --- |
| `dashboard` | 4 | 2 | 2 | 1.88 | 1 | 3 (the done and current steps) |
| `list-detail` | 5 | 2 | 3 | 1.88 | 2 | 0 |
| `onboarding` | 3 | 2 | 2 | 1.88 | 1 | 1 |
| `settings` | 4 | 2 | 2 | 2.13 | 1 | 1 |
| `empty-state` | 4 | 2 | 2 | 1.88 | 1 | 1 |
| `pricing` | 4 | 2 | 2 | 3.65 (1.88 on phones) | 2 | 1 |
| `errors` | 4 | 2 | 2 | 1.88 | 2 | 2 |
| `reading` | 4 | 2 | 2 | 1.88 | 2 | 0 (its one action is the white top-bar button) |
| `sign-in` | 3 | 2 | 2 | 2.13 | 0 | 1 |

## Not yet a precedent

- **A lesson screen** (one exercise, the answer and its banner) exists only in parts: the frame in
  `onboarding` and the banners in `errors`.
- **A landing page** exists only as words (DESIGN.md, Page shapes: Landing): the hero, feature rows,
  the closing call and the green footer band.
- **Recovery and "link sent"** exist only as words (patterns/ask-for-details.md); `sign-in` draws the
  log-in form.
- **A celebration after finishing** (a lesson complete, a run of days) isn't drawn by any recipe.
