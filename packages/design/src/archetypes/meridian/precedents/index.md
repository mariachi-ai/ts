# Precedents

Meridian's screens are its nine recipes: the seven every language has, then `reading` and `sign-in`. Each is
built from the library's classes and tokens with invented content (a background-jobs platform,
"Relayworks", and its workspace "Kestrel Labs"); the build writes them to `recipes/<id>.html` beside
`DESIGN.md`, and the fingerprint probe measures each at 1440, 1024 and 390 wide in light
(`fingerprint.json`). The source product's own screens, which these follow, are listed only in the private
notes.

| Id | Purpose | Kind | Family | Patterns it uses |
| --- | --- | --- | --- | --- |
| `dashboard` | The workspace's activity: a toolbar, usage gauges, recent runs, job cards | dashboard | app | [browse-many-things](../patterns/browse-many-things.md), [search-and-filter](../patterns/search-and-filter.md), [choose-an-option](../patterns/choose-an-option.md) (view switch), [show-progress](../patterns/show-progress.md) (gauges, dots), [move-between-areas](../patterns/move-between-areas.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `list-detail` | A job's runs in a table, and one run with its details and log | list, detail | app | [browse-many-things](../patterns/browse-many-things.md), [search-and-filter](../patterns/search-and-filter.md), [show-one-thing](../patterns/show-one-thing.md), [choose-an-option](../patterns/choose-an-option.md) (trigger, status), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md), [move-between-areas](../patterns/move-between-areas.md) |
| `onboarding` | Setting up the first job: the source, the steps, one configuration card | firstUse | first use | [edit-a-setting](../patterns/edit-a-setting.md), [show-progress](../patterns/show-progress.md), [choose-an-option](../patterns/choose-an-option.md) (runtime, region), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `settings` | Workspace settings as stacked cards with their own saves | settings | app | [edit-a-setting](../patterns/edit-a-setting.md), [choose-an-option](../patterns/choose-an-option.md) (region, switches), [move-between-areas](../patterns/move-between-areas.md) |
| `empty-state` | Webhooks with none yet | empty | app | [say-nothing-is-here](../patterns/say-nothing-is-here.md), [move-between-areas](../patterns/move-between-areas.md) (tabs), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `pricing` | Three plans in one frame, a comparison and questions | marketing | public | [choose-an-option](../patterns/choose-an-option.md) (period, plans), [browse-many-things](../patterns/browse-many-things.md) (comparison table), [move-between-areas](../patterns/move-between-areas.md) (site bar) |
| `errors` | A form with field errors in the app, a toast, and full-page errors | error | app | [show-an-error](../patterns/show-an-error.md), [edit-a-setting](../patterns/edit-a-setting.md) (the form card), [show-progress](../patterns/show-progress.md) (busy Save) |
| `reading` | A public guide in the docs frame | detail | public | [show-one-thing](../patterns/show-one-thing.md), [move-between-areas](../patterns/move-between-areas.md) (site bar, docs sidebar, contents), [search-and-filter](../patterns/search-and-filter.md) (docs search) |
| `sign-in` | Log in: the email and the one primary, then other ways in | form, firstUse | first use | [choose-an-option](../patterns/choose-an-option.md) (ways in), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |

## Which recipe to start from

- Many runs, jobs or members → `list-detail`'s table, or `dashboard`'s cards.
- One run, job or thing, with what you can do → `list-detail`'s detail.
- An overview of a workspace → `dashboard`.
- Values someone checks and sometimes changes → `settings`.
- A step of setting up → `onboarding`.
- Nothing yet, or nothing matches → `empty-state`.
- Something went wrong → `errors`.
- A public guide, a post or a help page → `reading`.
- Signing in or signing up → `sign-in`.
- Marketing and plans → `pricing`.
