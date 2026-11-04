---
"@mariachi/ai": patch
"@mariachi/audit": patch
"@mariachi/auth": patch
"@mariachi/billing": patch
"@mariachi/cli": patch
"@mariachi/config": patch
"@mariachi/events": patch
"@mariachi/notifications": patch
---

Peer dependencies on `@mariachi/database`, `@mariachi/database-postgres` and `@mariachi/explorer` accept any 0.x release (`>=0.0.5 <1`) instead of one exact version. A minor release no longer forces a major one: changesets bumped every peer dependent to major, and the fixed group took every package with it.
