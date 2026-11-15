# Precedents

Cirrus's screens are its nine recipes: the seven every language has, then `reading` and `sign-in`. Each is built from the library's classes and tokens with invented content (a household money app, "Kestrel"); the build writes them to `recipes/<id>.html` beside `DESIGN.md`, and the fingerprint probe measures each at 1440, 1024 and 390 wide (`fingerprint.json`). The source product's own screens, which these follow, are listed only in the private notes.

| Id | Purpose | Kind | Family | Patterns it uses |
| --- | --- | --- | --- | --- |
| `dashboard` | The month at a glance: spending against the plan, net worth, what needs a look, top categories, what's coming up | dashboard | app | [move-between-areas](../patterns/move-between-areas.md), [show-progress](../patterns/show-progress.md), [browse-many-things](../patterns/browse-many-things.md), [choose-an-option](../patterns/choose-an-option.md) (range pills) |
| `list-detail` | A month of activity grouped by day, three selected, one open in the side panel | list, detail | app | [search-and-filter](../patterns/search-and-filter.md), [browse-many-things](../patterns/browse-many-things.md), [show-one-thing](../patterns/show-one-thing.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (the floating bar) |
| `onboarding` | Set up a first budget: one question in a centred card | firstUse | app | [choose-an-option](../patterns/choose-an-option.md) (choice cards), [show-progress](../patterns/show-progress.md) (steps), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `settings` | Categories and budgets: the month's figures, the budgets table, switches | settings | app | [move-between-areas](../patterns/move-between-areas.md) (sections), [edit-a-setting](../patterns/edit-a-setting.md), [show-progress](../patterns/show-progress.md) (bars, ring) |
| `empty-state` | No bills yet | empty | app | [say-nothing-is-here](../patterns/say-nothing-is-here.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `pricing` | One plan, yearly or monthly, with questions | marketing | public | [choose-an-option](../patterns/choose-an-option.md) (period), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (the pill), [move-between-areas](../patterns/move-between-areas.md) (header, footer) |
| `errors` | A field, a form, a connection, a toast and the whole-page codes | error | app | [show-an-error](../patterns/show-an-error.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `reading` | A changelog post: tag and date, title, lead picture, text, newer and older | detail | public | [show-one-thing](../patterns/show-one-thing.md) (the post), [move-between-areas](../patterns/move-between-areas.md) (header, footer) |
| `sign-in` | The app's door: one card, two ways in, a line to create an account | form, firstUse | app's door | [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |

## Which recipe to start from

- Something to scan and act on → `list-detail`'s list.
- One thing and what can change about it → `list-detail`'s side panel.
- A tool someone opens every day → `dashboard`.
- Values someone checks and sometimes changes → `settings`.
- A flow of questions → `onboarding`.
- An article, a changelog post or any page someone reads → `reading`.
- Signing in or joining → `sign-in`.
- A marketing page → `pricing` plus the two families in [DESIGN.md](../DESIGN.md).
