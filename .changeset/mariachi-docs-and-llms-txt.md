---
'@mariachi/cli': minor
'@mariachi/core': minor
'@mariachi/create': patch
---

The docs can be read and searched from the terminal, and have an index for tools.

- **`mariachi docs`** lists the framework's docs by group, prints one (`mariachi docs jobs`) or one
  section (`mariachi docs http#pages-and-files`), and searches them (`mariachi docs --search
  tables-missing`). In a project it reads the docs of the `@mariachi/core` installed there. `--json`
  and `--path` are for tools.
- **`llms.txt`** ships in `@mariachi/core`'s docs folder: every doc with a line about it, in the
  llms.txt format, generated from the docs index and checked in CI.
- A generated project's AGENTS.md names the command.
