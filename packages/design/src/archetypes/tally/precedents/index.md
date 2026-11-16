# Precedents

Tally's screens are its nine recipes: the seven every language has, then `reading` and `sign-in`. Each is built from the library's classes and tokens with invented content (a link tool, "Hopline", used by the workspace "Orbit Coffee" on the short domain `orbt.co`); the build writes them to `recipes/<id>.html` beside `DESIGN.md`, and the fingerprint probe measures each at 1440, 1024 and 390 wide (`fingerprint.json`). The source product's own screens, which these follow, are listed only in the private notes.

| Id | Purpose | Kind | Family | Patterns it uses |
| --- | --- | --- | --- | --- |
| `dashboard` | Analytics: stat tabs over the area chart, four breakdown cards | dashboard | app | [move-between-areas](../patterns/move-between-areas.md), [read-the-numbers](../patterns/read-the-numbers.md), [search-and-filter](../patterns/search-and-filter.md) |
| `list-detail` | The links list, the row menu and the edit dialog | list, detail | app | [browse-many-things](../patterns/browse-many-things.md), [search-and-filter](../patterns/search-and-filter.md), [edit-a-thing](../patterns/edit-a-thing.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `onboarding` | Create a workspace, in the centred door | firstUse | door | [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `settings` | Workspace settings as cards with grey footers, the danger card last | settings | app | [edit-a-setting](../patterns/edit-a-setting.md), [move-between-areas](../patterns/move-between-areas.md) |
| `empty-state` | No links yet: placeholder rows, a line and two buttons | empty | app | [say-nothing-is-here](../patterns/say-nothing-is-here.md), [browse-many-things](../patterns/browse-many-things.md) |
| `pricing` | Three plans in a hairline grid, the period switch, questions | marketing | public | [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `errors` | Alert, field error, toast and whole-page states | error | app | [show-an-error](../patterns/show-an-error.md), [edit-a-setting](../patterns/edit-a-setting.md) |
| `reading` | A help article | detail | public | [move-between-areas](../patterns/move-between-areas.md) |
| `sign-in` | Log in, in the split door (onboarding is the centred step) | form, firstUse | door | [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |

## Which recipe to start from

- Many things to scan and act on → `list-detail`'s rows.
- Creating or editing one thing → `list-detail`'s dialog.
- Numbers over time and where they come from → `dashboard`.
- Values someone checks and sometimes changes → `settings`.
- A first-run step → `onboarding`.
- Nothing yet → `empty-state`.
- A help page, a post or docs → `reading`.
- Signing in → `sign-in`.
- A marketing page → `pricing` plus the three families in [DESIGN.md](../DESIGN.md).
