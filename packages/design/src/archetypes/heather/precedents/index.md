# Precedents

Heather's screens are its nine recipes: the seven every language has, then `reading` and `sign-in`.
Each is built from the library's classes and tokens with invented content (a video-message product,
"Murmur", used by a small studio, "Pinecrest Studio"); the build writes them to `recipes/<id>.html`
beside `DESIGN.md`, and the fingerprint probe measures each at 1440, 1024 and 390 wide in light
(`fingerprint.json`). The source product's own screens, which these follow, are listed only in the
private notes.

| Id | Purpose | Kind | Family | Patterns it uses |
| --- | --- | --- | --- | --- |
| `dashboard` | The library: folders, then a grid of video cards | dashboard | app | [browse-many-things](../patterns/browse-many-things.md), [move-between-areas](../patterns/move-between-areas.md), [search-and-filter](../patterns/search-and-filter.md) (search, sort), [choose-an-option](../patterns/choose-an-option.md) (sort selects) |
| `list-detail` | The video page: the video, reactions, summary, up next, comments; the side panel with the transcript | list, detail | video page | [show-one-thing](../patterns/show-one-thing.md), [reply-at-a-moment](../patterns/reply-at-a-moment.md), [browse-many-things](../patterns/browse-many-things.md) (up next), [show-progress](../patterns/show-progress.md) (the video's line), [move-between-areas](../patterns/move-between-areas.md) (panel tabs) |
| `onboarding` | The last set-up step: what to record first, then the recorder | firstUse | flow | [choose-an-option](../patterns/choose-an-option.md) (tiles, segments, selects, switch), [show-progress](../patterns/show-progress.md) (steps, the microphone meter) |
| `settings` | Workspace settings: sections on hairlines, the members table, delete last | settings | app | [edit-a-setting](../patterns/edit-a-setting.md), [browse-many-things](../patterns/browse-many-things.md) (members), [choose-an-option](../patterns/choose-an-option.md) (radios, switches), [search-and-filter](../patterns/search-and-filter.md) (find a member), [move-between-areas](../patterns/move-between-areas.md) |
| `empty-state` | A channel with no videos yet | empty | app | [say-nothing-is-here](../patterns/say-nothing-is-here.md), [move-between-areas](../patterns/move-between-areas.md) (breadcrumb) |
| `pricing` | Plans as four cards, questions, the footer | marketing | public | [choose-an-option](../patterns/choose-an-option.md) (billing segment), [move-between-areas](../patterns/move-between-areas.md) (site bar, footer) |
| `errors` | A share form with errors, a flag, and not found, failure and no access, in the frame | error | app | [show-an-error](../patterns/show-an-error.md), [show-progress](../patterns/show-progress.md) (the upload flag), [move-between-areas](../patterns/move-between-areas.md) |
| `reading` | A public help guide: the video first, its chapters, then the text | detail | public | [show-one-thing](../patterns/show-one-thing.md), [reply-at-a-moment](../patterns/reply-at-a-moment.md) (chapters as transcript rows), [move-between-areas](../patterns/move-between-areas.md) (site bar, breadcrumb, footer) |
| `sign-in` | Log in: email, Continue, two other ways in | form, firstUse | flow | [show-an-error](../patterns/show-an-error.md) (field rules), [choose-an-option](../patterns/choose-an-option.md) (ways in) |

## Which recipe to start from

- Many videos, folders or people to scan and open → `dashboard`'s grid, or `settings`' members table.
- One video, or one thing with a conversation around it → `list-detail`.
- Values someone checks and sometimes changes → `settings`.
- A step of setting up → `onboarding`.
- Nothing yet, or nothing matches → `empty-state`.
- Something went wrong → `errors`.
- A public guide, a post or a help page → `reading`.
- Logging in or signing up → `sign-in`.
- Marketing and plans → `pricing`.
