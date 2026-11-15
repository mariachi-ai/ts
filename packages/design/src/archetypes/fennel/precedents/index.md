# Precedents

Fennel's screens are its nine recipes: the seven every language has, then `reading` and `sign-in`. Each is built from the library's classes and tokens with invented content (a ceramics studio's money app, "Tidepay"); the build writes them to `recipes/<id>.html` beside `DESIGN.md`, and the fingerprint probe measures each at 1440, 1024 and 390 wide (`fingerprint.json`). The source product's own screens, which these follow, are listed only in the private notes.

| Id | Purpose | Kind | Family | Patterns it uses |
| --- | --- | --- | --- | --- |
| `dashboard` | The total, the money actions, balances and the latest payments | dashboard | app | [move-between-areas](../patterns/move-between-areas.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (Send), [browse-many-things](../patterns/browse-many-things.md) (balances, transactions) |
| `list-detail` | Payments grouped by day, searched and filtered; one open in the side panel | list, detail | app | [search-and-filter](../patterns/search-and-filter.md), [browse-many-things](../patterns/browse-many-things.md), [show-one-thing](../patterns/show-one-thing.md), [show-progress](../patterns/show-progress.md) (the timeline), [choose-an-option](../patterns/choose-an-option.md) (filter pills, tabs) |
| `onboarding` | One step of opening a business account: name, kind, country | firstUse | flow | [show-progress](../patterns/show-progress.md) (the step bar), [choose-an-option](../patterns/choose-an-option.md) (choice rows), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (Continue) |
| `settings` | The profile, then account, notification and business settings as rows | settings | app | [edit-a-setting](../patterns/edit-a-setting.md), [move-between-areas](../patterns/move-between-areas.md) |
| `empty-state` | No recipients yet | empty | app | [say-nothing-is-here](../patterns/say-nothing-is-here.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `pricing` | What it costs: the lime band, what you can do, the fees, questions, the footer | marketing | public | [move-between-areas](../patterns/move-between-areas.md) (navbar, footer), [browse-many-things](../patterns/browse-many-things.md) (fee rows) |
| `errors` | A field, a form, a snackbar and the whole-page 404, 500 and 403 | error | app (without the frame) | [show-an-error](../patterns/show-an-error.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `reading` | A help article: breadcrumbs, title, text, helpful or not, related articles | detail | public | [show-one-thing](../patterns/show-one-thing.md) (the article), [move-between-areas](../patterns/move-between-areas.md) (header, breadcrumbs, footer) |
| `sign-in` | Log in: two fields, a help link, the lime Log in and an alternative | form, firstUse | flow | [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |

## Which recipe to start from

- Something to scan and open → `list-detail`'s list.
- One payment and what can be done with it → `list-detail`'s side panel.
- The screen someone opens every day → `dashboard`.
- Values someone checks and sometimes changes → `settings`.
- A flow of questions → `onboarding`.
- A help article or any page someone reads → `reading`.
- Logging in or joining → `sign-in`.
- A marketing page → `pricing`, plus the two families in [DESIGN.md](../DESIGN.md).
