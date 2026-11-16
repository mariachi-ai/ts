---
'@mariachi/cli': patch
'@mariachi/core': patch
'@mariachi/create': patch
---

The docs can be read and searched from the terminal, and have an index for tools.

- **`mariachi docs`** lists the framework's docs by group, prints one (`mariachi docs jobs`) or one
  section (`mariachi docs http#pages-and-files`), and searches them (`mariachi docs --search
  idempotency key`): every doc with a matching line is shown, likeliest first, and each line says
  which section to read. In a project it reads the docs of the `@mariachi/core` installed there.
  `--json` and `--path` are for tools.
- **`llms.txt`** ships in `@mariachi/core`'s docs folder: every doc with a line about it, in the
  llms.txt format, generated from the docs index and checked in CI. The check fails for a doc that
  is not in the index, or whose index line doesn't say what it is.
- A generated project's AGENTS.md names the command.
