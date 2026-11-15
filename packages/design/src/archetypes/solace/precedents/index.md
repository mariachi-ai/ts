# Precedents

Solace's screens are its nine recipes: the seven every language has, then `reading` and `sign-in`. Each is built from the library's classes and tokens with invented content (a made-up app, "Lull"); the build writes them to `recipes/<id>.html` beside `DESIGN.md`, and the fingerprint probe measures each at 1440, 1024 and 390 wide (`fingerprint.json`). The source product's own screens, which these follow, are listed only in the private notes.

| Id | Purpose | Kind | Patterns it uses |
| --- | --- | --- | --- |
| `dashboard` | The evening: the day's sessions as a timeline, the one up next raised with Begin; the streak, the player and tiles beside it | dashboard | [show-progress](../patterns/show-progress.md) (timeline, streak), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md), [play-a-session](../patterns/play-a-session.md), [browse-many-things](../patterns/browse-many-things.md) (tiles), [move-between-areas](../patterns/move-between-areas.md) (app header) |
| `list-detail` | The library: search, a segmented filter and rows; then one course with its guide choice, Begin course, the player and its sessions | list, detail | [browse-many-things](../patterns/browse-many-things.md), [show-one-thing](../patterns/show-one-thing.md), [choose-an-option](../patterns/choose-an-option.md) (guides, filter), [play-a-session](../patterns/play-a-session.md), [show-progress](../patterns/show-progress.md) (session rows) |
| `onboarding` | One question of a short flow: goals as choice rows, Continue | firstUse | [choose-an-option](../patterns/choose-an-option.md), [show-progress](../patterns/show-progress.md) (step count and bar), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `settings` | Membership, account rows, reminders and deleting the account | settings | [edit-a-setting](../patterns/edit-a-setting.md), [move-between-areas](../patterns/move-between-areas.md) (side list), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (the membership panel) |
| `empty-state` | Nothing saved for offline yet | empty | [say-nothing-is-here](../patterns/say-nothing-is-here.md) |
| `pricing` | Plans: a big heading with one orange word, two plan options, the trial, what you get, questions | marketing | [choose-an-option](../patterns/choose-an-option.md) (plan options), [show-progress](../patterns/show-progress.md) (trial timeline), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md), [move-between-areas](../patterns/move-between-areas.md) (bare mark) |
| `errors` | A field, a form, a toast, the confirm sheet and the whole-page 404, 500 and 403 | error | [show-an-error](../patterns/show-an-error.md), [say-nothing-is-here](../patterns/say-nothing-is-here.md) (the band) |
| `reading` | A public article: contents, breadcrumb, title, byline, picture band, text, a session to try, more articles | detail | [show-one-thing](../patterns/show-one-thing.md) (the article variation), [play-a-session](../patterns/play-a-session.md), [browse-many-things](../patterns/browse-many-things.md) (picture cards), [move-between-areas](../patterns/move-between-areas.md) (site header, contents, footer), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (the header's pill) |
| `sign-in` | Log in: one white sheet over a soft blue sky | form, firstUse | [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (a sheet), [move-between-areas](../patterns/move-between-areas.md) (bare mark) |

## Which recipe to start from

- Something to scan and pick → `list-detail`'s library half.
- One thing with a step to take → `list-detail`'s course half.
- A tool someone opens every day → `dashboard`.
- A flow of questions → `onboarding`.
- Values someone checks and sometimes changes → `settings`.
- An empty place → `empty-state`; a whole-page error → `errors`.
- Plans and prices, or any page that sells → `pricing`.
- An article, a guide or any page someone reads → `reading`.
- Signing in or joining → `sign-in`.
