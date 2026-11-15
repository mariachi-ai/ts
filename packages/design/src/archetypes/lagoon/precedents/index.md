# Precedents

Lagoon's screens are its nine recipes: the seven every language has, then `reading` and `sign-in`.
Each is built from the library's classes and tokens with invented content (a messenger, "Natter", and
its people and groups); the build writes them to `recipes/<id>.html` beside `DESIGN.md`, and the
fingerprint probe measures each at 1440, 1024 and 390 wide in light (`fingerprint.json`). The source
product's own screens, which these follow, are listed only in the private notes.

| Id | Purpose | Kind | Family | Patterns it uses |
| --- | --- | --- | --- | --- |
| `dashboard` | The window: pinned circles and conversation rows beside a group thread | dashboard | window | [browse-many-things](../patterns/browse-many-things.md), [talk-in-a-thread](../patterns/talk-in-a-thread.md), [search-and-filter](../patterns/search-and-filter.md), [move-between-areas](../patterns/move-between-areas.md), [choose-an-option](../patterns/choose-an-option.md) (segments), [show-progress](../patterns/show-progress.md) (typing, Delivered) |
| `list-detail` | The list with the current row, and a group's details | list, detail | window | [show-one-thing](../patterns/show-one-thing.md), [browse-many-things](../patterns/browse-many-things.md) (rows, member circles), [edit-a-setting](../patterns/edit-a-setting.md) (switch rows), [choose-an-option](../patterns/choose-an-option.md) (segments), [move-between-areas](../patterns/move-between-areas.md) |
| `onboarding` | The first step: your name and picture, and who sees them | firstUse | sheet | [show-one-thing](../patterns/show-one-thing.md) (the head), [choose-an-option](../patterns/choose-an-option.md) (looks, check rows), [show-progress](../patterns/show-progress.md) (the step) |
| `settings` | A settings section as grouped cards | settings | window | [edit-a-setting](../patterns/edit-a-setting.md), [choose-an-option](../patterns/choose-an-option.md) (menus), [search-and-filter](../patterns/search-and-filter.md), [move-between-areas](../patterns/move-between-areas.md) |
| `empty-state` | A search with no results, and the pane at rest | empty | window | [say-nothing-is-here](../patterns/say-nothing-is-here.md), [search-and-filter](../patterns/search-and-filter.md) |
| `pricing` | Three plans, a comparison and questions | marketing | public | [choose-an-option](../patterns/choose-an-option.md) (billing segments, plans), [browse-many-things](../patterns/browse-many-things.md) (feature rows), [move-between-areas](../patterns/move-between-areas.md) (site bar) |
| `errors` | Offline, a message that didn't send and a banner in the window; a sheet with field errors; full-page errors | error | window | [show-an-error](../patterns/show-an-error.md), [talk-in-a-thread](../patterns/talk-in-a-thread.md), [browse-many-things](../patterns/browse-many-things.md) |
| `reading` | A public help article with a sample thread and steps | detail | public | [move-between-areas](../patterns/move-between-areas.md) (site bar, breadcrumb), [search-and-filter](../patterns/search-and-filter.md) (search help), [talk-in-a-thread](../patterns/talk-in-a-thread.md) (the sample), [show-progress](../patterns/show-progress.md) (Read) |
| `sign-in` | Sign in: the mark, one grouped card of two rows, Continue | form, firstUse | sheet | [edit-a-setting](../patterns/edit-a-setting.md) (field rows), [show-an-error](../patterns/show-an-error.md) (field rules) |

## Which recipe to start from

- Many conversations, people or things to open → `dashboard`'s rows, or `list-detail`'s member circles.
- One person, group or thing, with what you can do → `list-detail`'s details.
- A conversation → `dashboard`'s thread.
- Values someone checks and sometimes changes → `settings`.
- A step of setting up → `onboarding`.
- Nothing yet, or nothing matches → `empty-state`.
- Something went wrong → `errors`.
- A public guide, a post or a help page → `reading`.
- Signing in or signing up → `sign-in`.
- Marketing and plans → `pricing`.
