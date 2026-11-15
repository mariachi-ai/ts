# Precedents

Cadence's screens are its nine recipes: the seven every language has, then `reading` and `sign-in`. Each is built from the library's classes and tokens with invented content (a listening app, "Wavelet"); the build writes them to `recipes/<id>.html` beside `DESIGN.md`, and the fingerprint probe measures each in dark at 1440, 1024 and 390 wide (`fingerprint.json`). The source product's own screens, which these follow, are listed only in the private notes.

| Id | Purpose | Kind | Family | Patterns it uses |
| --- | --- | --- | --- | --- |
| `dashboard` | Home: chips, a greeting, shortcut tiles, shelves of covers and of performers | dashboard | app | [browse-many-things](../patterns/browse-many-things.md), [search-and-filter](../patterns/search-and-filter.md), [move-between-areas](../patterns/move-between-areas.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (play on a hovered card) |
| `list-detail` | One mix: the washed header, the action row, the track list, and the now-playing panel | list, detail | app | [show-one-thing](../patterns/show-one-thing.md), [play-from-a-list](../patterns/play-from-a-list.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md), [move-between-areas](../patterns/move-between-areas.md) |
| `onboarding` | Sign-up's second step: pick performers, name the profile | firstUse | flow | [choose-an-option](../patterns/choose-an-option.md) (round picks), [search-and-filter](../patterns/search-and-filter.md) (the white field), [show-an-error](../patterns/show-an-error.md) (a field), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (Next) |
| `settings` | Playback, sound, sharing and storage, one column; closing the account last | settings | app | [edit-a-setting](../patterns/edit-a-setting.md), [move-between-areas](../patterns/move-between-areas.md) |
| `empty-state` | No shows saved yet: the centred block and the prompt boxes | empty | app | [say-nothing-is-here](../patterns/say-nothing-is-here.md), [search-and-filter](../patterns/search-and-filter.md) (chips), [move-between-areas](../patterns/move-between-areas.md) |
| `pricing` | The plans page: a hero filling the window, plan cards, questions, the site footer | marketing | public | [choose-an-option](../patterns/choose-an-option.md) (plan cards), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md), [move-between-areas](../patterns/move-between-areas.md) (site header and footer) |
| `errors` | A field, a form banner, the snackbar, and the full-page 404, 500 and 403 | error | flow and public | [show-an-error](../patterns/show-an-error.md) |
| `reading` | A help article: breadcrumb, search box, topic card, the article on grey, topics beside it, related links, the site footer | detail | public | [move-between-areas](../patterns/move-between-areas.md) (site header, breadcrumb, footer), [search-and-filter](../patterns/search-and-filter.md) (the outlined box), [choose-an-option](../patterns/choose-an-option.md) (device chips) |
| `sign-in` | Sign in: one centred panel with the email field, the green Continue and other ways in | form, firstUse | public | [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (Continue) |

## Which recipe to start from

- Something to browse and play → `dashboard`.
- One record, mix, show or performer with its list → `list-detail`.
- A flow of questions → `onboarding`.
- Values someone checks and sometimes changes → `settings`.
- A place with nothing in it yet → `empty-state`.
- A marketing or plans page → `pricing`.
- An article, a guide or any page someone reads → `reading`.
- Signing in or joining → `sign-in`.
- Something went wrong → `errors`.
