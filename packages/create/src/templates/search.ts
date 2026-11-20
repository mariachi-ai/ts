/** What the generated docs say about search, shared by both sign-in templates. */

/** The AGENTS.md row for `src/search/`. */
export const searchAgentsRow = (example: boolean): string =>
  `| \`src/search/\` | The search indexes${example ? ` (the example notes' is \`notes.ts\`)` : ''}; services reach search as \`deps.search\` |`;
/** Said in AGENTS.md after "don't add a search server", when the project has the example notes. */
export const SEARCH_EXAMPLE_AGENTS = ` The example
notes show search: their service indexes each write in its transaction, and
\`GET /api/notes/search?q=\` finds them, in the caller's tenant only.`;
