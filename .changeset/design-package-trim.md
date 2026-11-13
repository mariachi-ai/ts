---
"@mariachi/design": patch
"@mariachi/cli": patch
---

`@mariachi/design` ships only what an app or tool reads: ESM only (no CommonJS build), no source maps, and no per-language galleries, recipe pages, DTCG token files or `catalog.json`. They're still built in the repo for the explorer. The packed size goes from 11.5 MB to 2.3 MB. `@mariachi/cli` now has `@mariachi/design` as an optional peer, loaded only by `mariachi design`, so a project that never runs it doesn't install the design package.
