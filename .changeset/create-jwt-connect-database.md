---
"@mariachi/create": patch
---

A project generated with `--auth jwt` (the default) connects its database before building repositories. Its `main.ts` stopped at startup with `database/not-connected`.
