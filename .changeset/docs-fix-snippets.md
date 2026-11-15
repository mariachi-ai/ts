---
'@mariachi/core': patch
---

Docs: fix snippets that didn't compile or broke the framework's own rules. `ConflictError` takes a
message, not a code (`ai-guide.md`, the entity recipe); the webhook recipe read a secret as a property
and used an undeclared `redis`; the integration recipe threw raw `Error`. `conventions.md` now says
which errors have fixed codes and how an app's own code gets its HTTP status.
