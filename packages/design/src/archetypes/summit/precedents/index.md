# Precedents

Summit's screens are its nine recipes: the seven every language has, then `reading` and `sign-in`. Each is built from the library's classes and tokens with invented content (a made-up training app, "Trailmark"); the build writes them to `recipes/<id>.html` beside `DESIGN.md`, and the fingerprint probe measures each at 1440, 1024 and 390 wide (`fingerprint.json`). The source product's own screens, which these follow, are listed only in the private notes.

| Id | Purpose | Kind | Patterns it uses |
| --- | --- | --- | --- |
| `dashboard` | The feed: the athlete and the week, sessions with figures, maps and props, challenges, a board and crews | dashboard | [browse-many-things](../patterns/browse-many-things.md), [show-the-numbers](../patterns/show-the-numbers.md), [show-progress](../patterns/show-progress.md) (challenges, the week), [move-between-areas](../patterns/move-between-areas.md) (the bar), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (the bar's trial), [choose-an-option](../patterns/choose-an-option.md) (whose sessions) |
| `list-detail` | One session: sections column, header card with two rows of figures, map and elevation, segments and the top ten | list, detail | [show-one-thing](../patterns/show-one-thing.md), [show-the-numbers](../patterns/show-the-numbers.md), [browse-many-things](../patterns/browse-many-things.md) (segments, the board), [move-between-areas](../patterns/move-between-areas.md) (side column) |
| `onboarding` | One step of setting up: sports and a weekly goal | firstUse | [choose-an-option](../patterns/choose-an-option.md) (sport tiles), [show-progress](../patterns/show-progress.md) (step bar), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (Continue at the foot) |
| `settings` | Profile and visibility as rows, deleting the account, the account card with Upgrade | settings | [edit-a-setting](../patterns/edit-a-setting.md), [move-between-areas](../patterns/move-between-areas.md) (filled side column), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `empty-state` | No saved routes yet | empty | [say-nothing-is-here](../patterns/say-nothing-is-here.md), [move-between-areas](../patterns/move-between-areas.md) (tabs) |
| `pricing` | Plans on a dark band, the comparison, questions, the trial bar | marketing | [choose-an-option](../patterns/choose-an-option.md) (plans, the period), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md), [show-the-numbers](../patterns/show-the-numbers.md) (prices) |
| `errors` | A field, a form, a banner, the 404, 500 and 403 | error | [show-an-error](../patterns/show-an-error.md) |
| `reading` | A public help article: breadcrumb and search, title, lede and byline, sections, "did this help" | detail | [show-one-thing](../patterns/show-one-thing.md) (the article variation), [move-between-areas](../patterns/move-between-areas.md) (the public bar, breadcrumb, sections column) |
| `sign-in` | Log in: one near-black panel over a token-drawn map | form, firstUse | [commit-to-the-main-action](../patterns/commit-to-the-main-action.md), [move-between-areas](../patterns/move-between-areas.md) (the public bar with only "Sign up free") |

## Which recipe to start from

- A feed or a home someone opens every day → `dashboard`.
- One session, route or segment → `list-detail`.
- A flow of questions → `onboarding`.
- Values someone checks and sometimes changes → `settings`.
- An empty place → `empty-state`; a whole-page error → `errors`.
- Plans and prices, or any page that sells → `pricing`.
- An article, a guide or a help page → `reading`.
- Signing in or joining → `sign-in`.
