# Precedents

Terracotta's screens are its seven recipes. Each is built from the library's classes and tokens with invented content; the build writes them to `recipes/<id>.html` beside `DESIGN.md`, and the fingerprint probe measures each at 1440, 1024 and 390 wide (`fingerprint.json`). The source product's own screens, which these follow, are listed only in the private notes.

| Id | Purpose | Kind | Patterns it uses |
| --- | --- | --- | --- |
| `dashboard` | A host's day: reservations to come, earnings against last year, what to do, the listings | dashboard | [choose-an-option](../patterns/choose-an-option.md) (the pill switch), [browse-many-things](../patterns/browse-many-things.md) (listings as photo cards), [move-between-areas](../patterns/move-between-areas.md) (host header) |
| `list-detail` | Search results beside a map, then one place's page with its booking panel | list, detail | [search-and-filter](../patterns/search-and-filter.md), [browse-many-things](../patterns/browse-many-things.md), [show-one-thing](../patterns/show-one-thing.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `onboarding` | Set up a listing: one question a screen | firstUse | [choose-an-option](../patterns/choose-an-option.md) (tiles), [show-progress](../patterns/show-progress.md) (segmented bar, Back and Next) |
| `settings` | The account: what's set, changed one row at a time | settings | [move-between-areas](../patterns/move-between-areas.md) (account column), [edit-a-setting](../patterns/edit-a-setting.md) |
| `empty-state` | No trips yet, nothing saved yet | empty | [say-nothing-is-here](../patterns/say-nothing-is-here.md), [show-progress](../patterns/show-progress.md) (resting skeleton cards) |
| `pricing` | Choose how a booking fee is paid, with what a stay earns | marketing | [choose-an-option](../patterns/choose-an-option.md) (fee cards, period switch), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (breakdown card) |
| `errors` | A field, a form, a toast, a warning and the full-page codes | error | [show-an-error](../patterns/show-an-error.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (the busy action) |

## Which recipe to start from

- Something to scan and pick → `list-detail`'s results half.
- One thing with an action → `list-detail`'s listing half.
- A flow of questions → `onboarding`.
- Values someone checks and sometimes changes → `settings`.
- A tool someone opens every day → `dashboard`.
