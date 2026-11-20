---
'@mariachi/create': minor
'@mariachi/cli': minor
'@mariachi/core': patch
---

The example notes of a new project are a worked example of `deps.search`, on the Postgres search
adapter, so the app still needs nothing but its database.

- `NotesService` indexes a note when it is created or updated and removes it when it is deleted,
  inside `withTransaction` with the write: the index can't disagree with the table, and no job,
  outbox or reindex loop is needed to keep it current.
- `notes.search` and `GET /api/notes/search?q=&limit=&cursor=` answer a page of notes as
  `notes.list` does (`{ data, nextCursor, hasMore }`), most relevant first, read back from the table,
  and only ever from the caller's tenant.
- The index is defined in `src/search/notes.ts` and listed in `src/search/index.ts`, which now has
  `mariachi:imports` and `mariachi:search` markers.
- The generated unit and end-to-end tests cover indexing, search, update, delete, paging and tenant
  isolation.

`mariachi generate entity <name> --search` (`generateEntity({ search: true })`) does the same for
any entity with a `string` or `text` field; one without is refused (`create/nothing-to-search`).
Entities generated without it are not indexed. In a project made before the markers, it says what to
add to `src/search/index.ts` by hand.

The docs (`search.md` gains "The generated example"; `cli.md`, the entity recipe and `ai-guide.md`)
and the generated README and AGENTS.md point to it.
