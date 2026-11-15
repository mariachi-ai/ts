# Precedents

Quire's screens are its nine recipes: the seven every language has, then `reading` and `sign-in`. Each is
built from the library's classes and tokens with invented content (a small publication's writing studio,
"Alder Press"); the build writes them to `recipes/<id>.html` beside `DESIGN.md`, and the fingerprint
probe measures each at 1440, 1024 and 390 wide in light (`fingerprint.json`). The source product's own
screens, which these follow, are listed only in the private notes.

| Id | Purpose | Kind | Family | Patterns it uses |
| --- | --- | --- | --- | --- |
| `dashboard` | The desk: page cards with covers, recently edited rows, a month and tasks | dashboard | app | [browse-many-things](../patterns/browse-many-things.md), [show-progress](../patterns/show-progress.md), [move-between-areas](../patterns/move-between-areas.md), [search-and-filter](../patterns/search-and-filter.md), [choose-an-option](../patterns/choose-an-option.md) (view segments) |
| `list-detail` | A collection table of drafts in review, and one draft as a page | list, detail | app | [browse-many-things](../patterns/browse-many-things.md) (table), [show-one-thing](../patterns/show-one-thing.md), [set-a-block-apart](../patterns/set-a-block-apart.md), [search-and-filter](../patterns/search-and-filter.md), [move-between-areas](../patterns/move-between-areas.md) |
| `onboarding` | One setup step: a name, a page style and an accent | firstUse | first use | [show-one-thing](../patterns/show-one-thing.md) (the sheet), [choose-an-option](../patterns/choose-an-option.md) (tiles, swatches), [edit-a-setting](../patterns/edit-a-setting.md) (a field), [show-progress](../patterns/show-progress.md) (step dots) |
| `settings` | Appearance: theme tiles, accent swatches, switch rows | settings | app | [edit-a-setting](../patterns/edit-a-setting.md), [choose-an-option](../patterns/choose-an-option.md), [move-between-areas](../patterns/move-between-areas.md) |
| `empty-state` | Scheduled, with nothing scheduled | empty | app | [say-nothing-is-here](../patterns/say-nothing-is-here.md), [move-between-areas](../patterns/move-between-areas.md) |
| `pricing` | Three plans, a comparison and questions | marketing | public | [choose-an-option](../patterns/choose-an-option.md) (Yearly/Monthly), [browse-many-things](../patterns/browse-many-things.md) (plans, comparison), [set-a-block-apart](../patterns/set-a-block-apart.md) (toggle questions), [move-between-areas](../patterns/move-between-areas.md) (capsule bar) |
| `errors` | Field and form errors, a toast, and whole-page 404, 500 and 403 | error | app | [show-an-error](../patterns/show-an-error.md), [edit-a-setting](../patterns/edit-a-setting.md) |
| `reading` | A published page: contents in the sidebar, two sheets on a soft cover | detail | published | [show-one-thing](../patterns/show-one-thing.md), [set-a-block-apart](../patterns/set-a-block-apart.md), [move-between-areas](../patterns/move-between-areas.md) (contents), [search-and-filter](../patterns/search-and-filter.md) (search field), [browse-many-things](../patterns/browse-many-things.md) (page cards), [show-progress](../patterns/show-progress.md) (tasks) |
| `sign-in` | Sign in: the space's tile, a title, two fields, a blue capsule and a white one | form, firstUse | first use | [show-one-thing](../patterns/show-one-thing.md) (the sheet), [edit-a-setting](../patterns/edit-a-setting.md) (fields), [show-an-error](../patterns/show-an-error.md) (field rules) |

## Which recipe to start from

- Many pages, tasks or issues → `dashboard`'s cards and rows, or `list-detail`'s table.
- One page to read or edit → `list-detail`'s page; a page readers see → `reading`.
- Values someone checks and sometimes changes → `settings`.
- A setup step → `onboarding`; signing in → `sign-in`.
- Nothing yet → `empty-state`. Something went wrong → `errors`.
- Plans and marketing → `pricing`.
