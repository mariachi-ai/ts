# Precedents

Terracotta's screens are its nine recipes: the seven every language has, then `reading` and `sign-in`. Each is built from the library's classes and tokens with invented content; the build writes them to `recipes/<id>.html` beside `DESIGN.md`, and the fingerprint probe measures each at 1440, 1024 and 390 wide (`fingerprint.json`). The source product's own screens, which these follow, are listed only in the private notes.

| Id | Purpose | Kind | Patterns it uses |
| --- | --- | --- | --- |
| `dashboard` | A host's day: reservations to come, earnings against last year, what to do, the listings | dashboard | [choose-an-option](../patterns/choose-an-option.md) (the pill switch), [browse-many-things](../patterns/browse-many-things.md) (listings as photo cards), [move-between-areas](../patterns/move-between-areas.md) (host header) |
| `list-detail` | Search results beside a map, then one place's page with its booking panel | list, detail | [search-and-filter](../patterns/search-and-filter.md), [browse-many-things](../patterns/browse-many-things.md), [show-one-thing](../patterns/show-one-thing.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `onboarding` | Set up a listing: one question a screen | firstUse | [choose-an-option](../patterns/choose-an-option.md) (tiles), [show-progress](../patterns/show-progress.md) (segmented bar, Back and Next) |
| `settings` | The account: what's set, changed one row at a time | settings | [move-between-areas](../patterns/move-between-areas.md) (account column), [edit-a-setting](../patterns/edit-a-setting.md) |
| `empty-state` | No trips yet, nothing saved yet | empty | [say-nothing-is-here](../patterns/say-nothing-is-here.md), [show-progress](../patterns/show-progress.md) (resting skeleton cards) |
| `pricing` | A host tool: choose how a booking fee is paid, with what a stay earns | marketing | [choose-an-option](../patterns/choose-an-option.md) (fee cards, period switch), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (breakdown card with the ink action) |
| `errors` | A field, a form, a toast, a warning and the full-page codes | error | [show-an-error](../patterns/show-an-error.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (the busy action) |
| `reading` | A public help article: breadcrumb, title, lead picture, the reading column, a hairline panel with the one gradient action, the footer | detail | [show-one-thing](../patterns/show-one-thing.md) (the article variation), [search-and-filter](../patterns/search-and-filter.md) (the single-field pill), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (public), [move-between-areas](../patterns/move-between-areas.md) (reading header, footer) |
| `sign-in` | Sign in or join: a white sheet over a quietened wall of pictures, one field, the gradient Continue, other ways in | form, firstUse | [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (a sheet), [move-between-areas](../patterns/move-between-areas.md) (guest header, footer) |

## Which recipe to start from

- Something to scan and pick → `list-detail`'s results half.
- One thing with an action → `list-detail`'s listing half.
- A flow of questions → `onboarding`.
- Values someone checks and sometimes changes → `settings`.
- A tool someone opens every day → `dashboard`.
- An article, a guide or any page someone reads → `reading`.
- Signing in or joining → `sign-in`.
- A marketing page → the Marketing shape in [DESIGN.md](../DESIGN.md) (Page shapes); there is no recipe yet.
