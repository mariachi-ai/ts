---
"@mariachi/auth": patch
---

`auth.sign` and `auth.authenticate` spans no longer record the user id. A trace backend is not the place for
who is signed in; `auth.authenticate` still records the identity type.
