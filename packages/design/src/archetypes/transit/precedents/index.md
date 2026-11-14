# Precedents

Transit's screens are its nine recipes: the seven every language has, then `reading` and `sign-in`. Each is built from the library's classes and tokens with invented content; the build writes them to `recipes/<id>.html` beside `DESIGN.md`, and the fingerprint probe measures each at 1440, 1024 and 390 wide (`fingerprint.json`). The source product's own screens, which these follow, are listed only in the private notes.

| Id | Purpose | Kind | Patterns it uses |
| --- | --- | --- | --- |
| `dashboard` | The booking home: where from and to, when, who for, the options with prices, the map, suggestions | dashboard | [search-and-filter](../patterns/search-and-filter.md) (trip fields, chips), [choose-an-option](../patterns/choose-an-option.md) (option rows), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (Book), [move-between-areas](../patterns/move-between-areas.md) (app header) |
| `list-detail` | Past trips as rows, the open trip as a card with its map, driver, timeline and fare | list, detail | [move-between-areas](../patterns/move-between-areas.md) (side list), [search-and-filter](../patterns/search-and-filter.md) (chips), [browse-many-things](../patterns/browse-many-things.md), [show-one-thing](../patterns/show-one-thing.md), [show-progress](../patterns/show-progress.md) (timeline) |
| `onboarding` | A courier sign-up step: how you'll deliver, city, invite code | firstUse | [show-progress](../patterns/show-progress.md), [choose-an-option](../patterns/choose-an-option.md) (edged rows), [show-an-error](../patterns/show-an-error.md) (a field), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `settings` | The profile: what's set, changed one row at a time; switches; deleting | settings | [move-between-areas](../patterns/move-between-areas.md) (side list), [edit-a-setting](../patterns/edit-a-setting.md) (rows, switches, the prompt banner) |
| `empty-state` | No hourly bookings yet, with the page title kept | empty | [say-nothing-is-here](../patterns/say-nothing-is-here.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `pricing` | Membership plans, a team offer and questions | marketing | [choose-an-option](../patterns/choose-an-option.md) (plan cards, period switch), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md), [move-between-areas](../patterns/move-between-areas.md) (black bar) |
| `errors` | A form with field errors, a snackbar, the 404 and two more codes | error | [show-an-error](../patterns/show-an-error.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `reading` | A public help article with related answers | detail | [show-one-thing](../patterns/show-one-thing.md) (the article), [browse-many-things](../patterns/browse-many-things.md) (help rows), [search-and-filter](../patterns/search-and-filter.md) (round search), [move-between-areas](../patterns/move-between-areas.md) (black bar, help bar, breadcrumb) |
| `sign-in` | One field to start signing in, and other ways in | form, firstUse | [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (Continue), [move-between-areas](../patterns/move-between-areas.md) (the black bar alone) |

## Which recipe to start from

- Booking or ordering something with options → `dashboard`.
- Something to scan and pick, then its details → `list-detail`.
- A flow of questions → `onboarding`.
- Values someone checks and sometimes changes → `settings`.
- Nothing there yet → `empty-state`.
- Plans or a marketing page → `pricing` (and the public family in [DESIGN.md](../DESIGN.md), Page shapes).
- An article, a guide or any page someone reads → `reading`.
- Signing in or joining → `sign-in`.
