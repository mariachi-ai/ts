# Precedents

Flint's screens are its nine recipes: the seven every language has, then `reading` and `sign-in`.
Each is built from the library's classes and tokens with invented content (an agent workspace,
"Lathe", used by the Kestrel team); the build writes them to `recipes/<id>.html` beside `DESIGN.md`,
and the fingerprint probe measures each at 1440, 1024 and 390 wide in dark (`fingerprint.json`). The
source product's own screens, which these follow, are listed only in the private notes.

| Id | Purpose | Kind | Family | Patterns it uses |
| --- | --- | --- | --- | --- |
| `dashboard` | What merged across the workspace: totals, a two-tone chart, open changes | dashboard | app | [move-between-areas](../patterns/move-between-areas.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (Refresh), [browse-many-things](../patterns/browse-many-things.md) (the table), [search-and-filter](../patterns/search-and-filter.md) (range, Filter), [show-progress](../patterns/show-progress.md) (split bars, check dots) |
| `list-detail` | Tasks grouped by repository; one task's thread beside its diff | list, detail | app | [browse-many-things](../patterns/browse-many-things.md), [show-one-thing](../patterns/show-one-thing.md), [show-progress](../patterns/show-progress.md) (ring, steps, the command box), [choose-an-option](../patterns/choose-an-option.md) (mode, model), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (Keep, Send) |
| `onboarding` | One step of setting up: pick the repositories agents may work in | firstUse | flow | [show-progress](../patterns/show-progress.md) (the step bar), [choose-an-option](../patterns/choose-an-option.md) (the picker), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (Continue) |
| `settings` | Notification settings as grouped rows | settings | app | [edit-a-setting](../patterns/edit-a-setting.md), [move-between-areas](../patterns/move-between-areas.md), [choose-an-option](../patterns/choose-an-option.md) (selects) |
| `empty-state` | No incidents yet | empty | app | [say-nothing-is-here](../patterns/say-nothing-is-here.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `pricing` | Plans, the comparison and questions | marketing | public | [move-between-areas](../patterns/move-between-areas.md) (site bar), [choose-an-option](../patterns/choose-an-option.md) (billing toggle), [browse-many-things](../patterns/browse-many-things.md) (comparison table), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `errors` | A field, a dialog, a run, a toast and the whole-page 404, 500 and 403 | error | app | [show-an-error](../patterns/show-an-error.md), [show-progress](../patterns/show-progress.md) (a failed command), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `reading` | A docs page: the docs panel, one article, "On this page" | detail | public | [show-one-thing](../patterns/show-one-thing.md) (the article), [move-between-areas](../patterns/move-between-areas.md) (site bar, docs panel), [search-and-filter](../patterns/search-and-filter.md) (docs search), [browse-many-things](../patterns/browse-many-things.md) (the docs panel) |
| `sign-in` | Log in: two ways in, an email field, Continue | form, firstUse | flow | [commit-to-the-main-action](../patterns/commit-to-the-main-action.md), [show-an-error](../patterns/show-an-error.md) (field rules) |

## Which recipe to start from

- Something to scan and open → `list-detail`'s side panel, or `dashboard`'s table for columns of figures.
- One task, its thread and its change → `list-detail`'s work area.
- The screen someone opens every day → `dashboard`.
- Values someone checks and sometimes changes → `settings`.
- A step of setting up → `onboarding`.
- Nothing yet → `empty-state`.
- Something went wrong → `errors`.
- A docs or help page, or any page someone reads → `reading`.
- Logging in or joining → `sign-in`.
- A marketing page → `pricing`, plus the three families in [DESIGN.md](../DESIGN.md).
