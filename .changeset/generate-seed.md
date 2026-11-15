---
'@mariachi/create': minor
'@mariachi/cli': minor
---

`mariachi generate seed <name>` writes `src/seeds/<name>.seed.ts` (a `defineSeed`, with a note on
writing it so it is safe to repeat) and lists it in `src/seeds/index.ts`, which `mariachi db seed`
runs. A new project's seeds index has the markers the generator inserts at; in an older project it
says which two lines to add by hand.

`mariachi db seed` runs as `NODE_ENV` when `--env` isn't given. It used to run as `development`
whatever the environment said, so against a production database it ran every seed that didn't name
its environments. With `NODE_ENV=production`, such seeds are now skipped unless you pass `--env`.
