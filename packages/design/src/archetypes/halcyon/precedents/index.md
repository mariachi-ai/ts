# Precedents

Halcyon's screens are its nine recipes: the seven every language has, then `reading` and `sign-in`.
Each is built from the library's classes and tokens with invented content (a money app used by a small
company, "Fieldstone"; the product's public site is "Tidewater"); the build writes them to
`recipes/<id>.html` beside `DESIGN.md`, and the fingerprint probe measures each at 1440, 1024 and 390
wide in light (`fingerprint.json`). The source product's own screens, which these follow, are listed
only in the private notes.

| Id | Purpose | Kind | Family | Patterns it uses |
| --- | --- | --- | --- | --- |
| `dashboard` | The home page: action pills, the balance and its chart, accounts, summaries | dashboard | app | [move-between-areas](../patterns/move-between-areas.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (Send), [show-an-amount](../patterns/show-an-amount.md), [browse-many-things](../patterns/browse-many-things.md) (the accounts card), [choose-an-option](../patterns/choose-an-option.md) (chart or table, the period), [show-progress](../patterns/show-progress.md) (the credit bar) |
| `list-detail` | Transactions: filters, the month's figures, the table; one payment's page | list, detail | app | [browse-many-things](../patterns/browse-many-things.md), [show-one-thing](../patterns/show-one-thing.md), [show-an-amount](../patterns/show-an-amount.md), [choose-an-option](../patterns/choose-an-option.md) (filters, category) |
| `onboarding` | One step of opening an account: the company's details | firstUse | flow | [show-progress](../patterns/show-progress.md), [choose-an-option](../patterns/choose-an-option.md) (company type), [show-an-error](../patterns/show-an-error.md) (the EIN), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (Continue) |
| `settings` | The company profile as label-and-value rows | settings | app | [edit-a-setting](../patterns/edit-a-setting.md), [move-between-areas](../patterns/move-between-areas.md) (the settings sidebar), [show-one-thing](../patterns/show-one-thing.md) (the company's head) |
| `empty-state` | Recipients with none yet | empty | app | [say-nothing-is-here](../patterns/say-nothing-is-here.md), [browse-many-things](../patterns/browse-many-things.md) (filters and heads), [move-between-areas](../patterns/move-between-areas.md) |
| `pricing` | Plans in one split card, questions, the footer | marketing | public | [move-between-areas](../patterns/move-between-areas.md) (site bar, footer), [choose-an-option](../patterns/choose-an-option.md) (yearly switch), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md), [show-an-amount](../patterns/show-an-amount.md) (prices) |
| `errors` | A form with errors, a toast, and not found, failure and no access in the frame | error | app | [show-an-error](../patterns/show-an-error.md), [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (Review payment), [move-between-areas](../patterns/move-between-areas.md) |
| `reading` | A journal article on the public site | detail | public | [show-one-thing](../patterns/show-one-thing.md) (the article), [move-between-areas](../patterns/move-between-areas.md) (site bar, section bar, footer) |
| `sign-in` | Log in: email and password, then a passkey | form, firstUse | flow | [commit-to-the-main-action](../patterns/commit-to-the-main-action.md) (Log in), [show-an-error](../patterns/show-an-error.md) (field rules) |

## Which recipe to start from

- Many things to scan, filter and open → `list-detail`'s table.
- One payment, account or company → `list-detail`'s payment page, or `settings`' head and rows.
- The screen someone opens every day → `dashboard`.
- Values someone checks and sometimes changes → `settings`.
- A step of setting up → `onboarding`.
- Nothing yet, or nothing matches → `empty-state`.
- Something went wrong → `errors`.
- A help page, guide or post → `reading`.
- Logging in or joining → `sign-in`.
- A marketing page → `pricing`, with the three families in [DESIGN.md](../DESIGN.md).
