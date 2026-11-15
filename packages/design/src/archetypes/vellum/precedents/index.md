# Precedents

Vellum's screens are its nine recipes: the seven every language has, then `reading` and `sign-in`. Each is built from the library's classes and tokens with invented content; the build writes them to `recipes/<id>.html` beside `DESIGN.md`, and the fingerprint probe measures each at 1440, 1024 and 390 wide (`fingerprint.json`). The source product's own screens, which these follow, are listed only in the private notes.

| Id | Purpose | Kind | Patterns it uses |
| --- | --- | --- | --- |
| `dashboard` | Write: today's counts, a question to write about, moments to start from, the month calendar, recent entries and streak tiles | dashboard | [commit-to-the-main-action](../patterns/commit-to-the-main-action.md), [edit-a-setting](../patterns/edit-a-setting.md) (moment rows), [show-progress](../patterns/show-progress.md), [browse-many-things](../patterns/browse-many-things.md) (recent), [mark-which-journal](../patterns/mark-which-journal.md), [move-between-areas](../patterns/move-between-areas.md) |
| `list-detail` | A journal's timeline beside the open entry | list, detail | [browse-many-things](../patterns/browse-many-things.md), [show-one-thing](../patterns/show-one-thing.md), [choose-an-option](../patterns/choose-an-option.md) (view glyphs), [mark-which-journal](../patterns/mark-which-journal.md), [move-between-areas](../patterns/move-between-areas.md) |
| `onboarding` | Make the first journal: a name, a colour, three switches | firstUse | [show-progress](../patterns/show-progress.md), [choose-an-option](../patterns/choose-an-option.md) (colour), [edit-a-setting](../patterns/edit-a-setting.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md), [mark-which-journal](../patterns/mark-which-journal.md) (the band) |
| `settings` | Look and feel: grouped panels of selects and switches, export and delete | settings | [move-between-areas](../patterns/move-between-areas.md) (section list), [edit-a-setting](../patterns/edit-a-setting.md) |
| `empty-state` | A new journal with nothing written | empty | [say-nothing-is-here](../patterns/say-nothing-is-here.md), [mark-which-journal](../patterns/mark-which-journal.md), [choose-an-option](../patterns/choose-an-option.md) (text tabs), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `pricing` | The public plans page with a comparison table | marketing | [choose-an-option](../patterns/choose-an-option.md) (plans), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md), [move-between-areas](../patterns/move-between-areas.md) (public header) |
| `errors` | In the app: a form with errors, two notices, three whole-page errors | error | [show-an-error](../patterns/show-an-error.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md), [move-between-areas](../patterns/move-between-areas.md) |
| `reading` | A public help article with related guides and a contact panel | detail | [show-one-thing](../patterns/show-one-thing.md), [move-between-areas](../patterns/move-between-areas.md) (public header, breadcrumb), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `sign-in` | Sign in on a new computer, and other ways in | form, firstUse | [commit-to-the-main-action](../patterns/commit-to-the-main-action.md), [edit-a-setting](../patterns/edit-a-setting.md) (other ways in as grouped rows), [mark-which-journal](../patterns/mark-which-journal.md) (the band) |

## Which recipe to start from

- A home for the day, with counts and a calendar → `dashboard`.
- Many entries in time order, then one → `list-detail`.
- A short flow → `onboarding`.
- Values someone checks and sometimes changes → `settings`.
- Nothing there yet → `empty-state`.
- Plans or a marketing page → `pricing`.
- A guide, an article or any page someone reads on the public site → `reading`.
- Signing in or joining → `sign-in`.
- Anything that can fail → `errors`.
