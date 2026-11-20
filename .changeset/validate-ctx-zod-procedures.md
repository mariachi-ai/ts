---
'@mariachi/create': minor
'@mariachi/cli': minor
---

`mariachi validate` reads each file's syntax tree (with the TypeScript compiler, now a dependency of
`@mariachi/create`, loaded only when `validate` runs) and checks more than imports:

- `ctx-first`: procedure, route, job and event handlers, and the public methods of services and
  repositories, take `ctx: Context` first; `communication.call`, `this.call`, `jobs.enqueue` and
  `events.publish` pass it first.
- `zod-at-boundaries`: procedures have input and output schemas, routes a schema for the body, params
  and query their handler reads, and jobs and events a payload schema.
- `procedure-name-format`: registered and called procedure names are `domainCamel.action`.
- `procedure-registered` (warning): each procedure called with a literal name is registered in the project.
- `unique-procedure-names` now reads registrations from the syntax tree too.

Each finding gives the file and line, the rule and a one-line fix; `--json` and the exit code are as before.

Projects made by `mariachi init` get a `lint` script, `mariachi validate && tsc --noEmit`, and their
README and AGENTS.md say to run it before committing.
