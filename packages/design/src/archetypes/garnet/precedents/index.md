# Precedents

Garnet's screens are its nine recipes: the seven every language has, then `reading` and `sign-in`. Each is built from the library's classes and tokens with invented content (a revenue team's CRM, "Larch", used by "Fieldwork Co."); the build writes them to `recipes/<id>.html` beside `DESIGN.md`, and the fingerprint probe measures each at 1440, 1024 and 390 wide (`fingerprint.json`). The source product's own screens, which these follow, are listed only in the private notes.

| Id | Purpose | Kind | Family | Patterns it uses |
| --- | --- | --- | --- | --- |
| `dashboard` | The day: tasks, the quarter's pipeline by stage, activity, new signals with fit | dashboard | app | [move-between-areas](../patterns/move-between-areas.md), [browse-many-things](../patterns/browse-many-things.md), [search-and-filter](../patterns/search-and-filter.md) (range chip), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `list-detail` | Lead search: the record table with three checked and one open beside it | list, detail | app | [search-and-filter](../patterns/search-and-filter.md), [browse-many-things](../patterns/browse-many-things.md), [show-one-thing](../patterns/show-one-thing.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `onboarding` | Bring your data: numbered steps, a headline, choices in a rimmed card | firstUse | door | [choose-an-option](../patterns/choose-an-option.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `settings` | Workspace settings, members and the danger row | settings | app | [edit-a-setting](../patterns/edit-a-setting.md), [browse-many-things](../patterns/browse-many-things.md) (members), [move-between-areas](../patterns/move-between-areas.md) |
| `empty-state` | No sequences yet, with the assistant ready | empty | app | [say-nothing-is-here](../patterns/say-nothing-is-here.md), [ask-the-assistant](../patterns/ask-the-assistant.md) |
| `pricing` | Two plans, a period switch, the comparison, questions, the footer | marketing | public | [choose-an-option](../patterns/choose-an-option.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md), [move-between-areas](../patterns/move-between-areas.md) |
| `errors` | Field, form, connection, toast and whole-page errors | error | app | [show-an-error](../patterns/show-an-error.md) |
| `reading` | A changelog post with its rail and a rimmed picture | detail | public | [show-one-thing](../patterns/show-one-thing.md), [move-between-areas](../patterns/move-between-areas.md) |
| `sign-in` | The app's door: one rimmed card | form, firstUse | door | [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |

## Which recipe to start from

- Something to scan and act on → `list-detail`'s table.
- One record and why it matters → `list-detail`'s side panel.
- A screen someone opens every morning → `dashboard`.
- Values someone checks and sometimes changes → `settings`.
- A flow of questions → `onboarding`.
- Nothing yet → `empty-state`.
- A post, a docs page or anything read → `reading`.
- Signing in → `sign-in`.
- A marketing page → `pricing` plus the two families in [DESIGN.md](../DESIGN.md).
