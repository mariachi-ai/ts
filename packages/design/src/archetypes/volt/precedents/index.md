# Precedents

Volt's screens are its nine recipes: the seven every language has, then `reading` and `sign-in`. Each is built from the library's classes and tokens with invented content; the build writes them to `recipes/<id>.html` beside `DESIGN.md`, and the fingerprint probe measures each at 1440, 1024 and 390 wide (`fingerprint.json`). The source product's own screens, which these follow, are listed only in the private notes.

| Id | Purpose | Kind | Patterns it uses |
| --- | --- | --- | --- |
| `dashboard` | The money screen: balance with two pills, the green keypad, recent activity, spending bars, goal, stocks and offers | dashboard | [show-an-amount](../patterns/show-an-amount.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md), [browse-many-things](../patterns/browse-many-things.md), [show-progress](../patterns/show-progress.md), [choose-an-option](../patterns/choose-an-option.md) (period), [move-between-areas](../patterns/move-between-areas.md) |
| `list-detail` | Payments grouped by day, filter chips, the open payment as a receipt | list, detail | [browse-many-things](../patterns/browse-many-things.md), [show-one-thing](../patterns/show-one-thing.md), [show-an-amount](../patterns/show-an-amount.md), [choose-an-option](../patterns/choose-an-option.md) (chips), [move-between-areas](../patterns/move-between-areas.md) |
| `onboarding` | One first-run question: what to use first, and a handle | firstUse | [show-progress](../patterns/show-progress.md), [choose-an-option](../patterns/choose-an-option.md) (tiles), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) |
| `settings` | The profile, grouped rows with switches and chevrons, the theme, sign out | settings | [edit-a-setting](../patterns/edit-a-setting.md), [choose-an-option](../patterns/choose-an-option.md) (theme), [move-between-areas](../patterns/move-between-areas.md) |
| `empty-state` | Goals with nothing saved yet | empty | [say-nothing-is-here](../patterns/say-nothing-is-here.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md), [move-between-areas](../patterns/move-between-areas.md) |
| `pricing` | The public plans page with a comparison table and questions | marketing | [choose-an-option](../patterns/choose-an-option.md) (plans), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md), [show-an-amount](../patterns/show-an-amount.md), [move-between-areas](../patterns/move-between-areas.md) (marketing bar) |
| `errors` | In the app: a send form with errors, a failed payment, not found, failure and no access | error | [show-an-error](../patterns/show-an-error.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md), [move-between-areas](../patterns/move-between-areas.md) |
| `reading` | A public help article with numbered steps, related articles and contact cards | detail | [show-one-thing](../patterns/show-one-thing.md), [browse-many-things](../patterns/browse-many-things.md) (Related), [show-progress](../patterns/show-progress.md) (steps), [move-between-areas](../patterns/move-between-areas.md) (help bar, footer) |
| `sign-in` | Sign in with a code, or other ways in | form, firstUse | [commit-to-the-main-action](../patterns/commit-to-the-main-action.md), [edit-a-setting](../patterns/edit-a-setting.md) (rows), [browse-many-things](../patterns/browse-many-things.md) |

## Which recipe to start from

- A home for money, with a balance and activity → `dashboard`.
- Many payments, then one → `list-detail`.
- A first-run step → `onboarding`; signing in → `sign-in`.
- Values someone checks and sometimes changes → `settings`.
- Nothing there yet → `empty-state`.
- Plans or a marketing page → `pricing`.
- A help article or any page someone reads on the public site → `reading`.
- Anything that can fail → `errors`.
