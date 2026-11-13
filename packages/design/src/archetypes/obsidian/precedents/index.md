# Precedents

The language's recipes, as the screens a builder copies from. Each is built at `dist/archetypes/obsidian/recipes/<id>.html` and measured at 1440, 1024 and 390px wide (`fingerprint.json`). Source screens are listed in the private notes, never here.

| Id | Purpose | Kind | Patterns |
| --- | --- | --- | --- |
| `dashboard` | A team overview: plain figures, a stacked bar chart on the panel, a sprint side pane split by a hairline, then a full-bleed projects list | dashboard | [navigation](../patterns/navigation.md), [progress](../patterns/progress.md), [status-list](../patterns/status-list.md), [choose-option](../patterns/choose-option.md) (range chips) |
| `list-detail` | Items grouped under grey status bars in 36px rows, the selected one open in a side panel with property rows and activity | list, detail | [navigation](../patterns/navigation.md), [status-list](../patterns/status-list.md), [detail-panel](../patterns/detail-panel.md), [filter-search](../patterns/filter-search.md), [choose-option](../patterns/choose-option.md) (view chips) |
| `onboarding` | One centred setup step teaching the command menu by showing it open | firstUse | [progress](../patterns/progress.md) (step count), [choose-option](../patterns/choose-option.md) (command menu), [filter-search](../patterns/filter-search.md) |
| `settings` | A settings sidebar and a 40rem column of hairline panels with label-and-help left, control right | settings | [navigation](../patterns/navigation.md) (settings sidebar), [settings-rows](../patterns/settings-rows.md), [choose-option](../patterns/choose-option.md) |
| `empty-state` | No sprint running: centred icon, short heading, one muted line, the primary with its key | empty | [navigation](../patterns/navigation.md), [empty](../patterns/empty.md) |
| `pricing` | The public plans page on the page colour: translucent navbar, a 48px title alone, plan columns split by hairlines in the 80rem column, comparison table, questions, the site footer | marketing | [choose-plan](../patterns/choose-plan.md) |
| `errors` | Field and summary errors in the new-item dialog, an offline toast that keeps the change, and full-page 404, 500 and 403 | error, dialog, form | [error](../patterns/error.md), [detail-panel](../patterns/detail-panel.md) (properties in a dialog), [empty](../patterns/empty.md) (full-page stack) |
| `reading` | A public docs article: the docs sidebar and 64px bar on the page colour, a 32px title, a figure placeholder, 15px prose with a neutral callout, contents on the right, related articles at the end | detail | [read](../patterns/read.md), [navigation](../patterns/navigation.md) (docs sidebar) |
| `sign-in` | The sign-in screen: the mark, a 17px title, four 44px pills in an 18rem column with the first in indigo, one muted footnote | form, firstUse | [sign-in](../patterns/sign-in.md) |

Screenshots: `dist/archetypes/obsidian/recipes/<id>.html` renders each; the gallery (`gallery.html`) shows every component in light and dark.
