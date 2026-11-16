---
'@mariachi/storage': patch
---

The three AWS SDK packages storage uses are asked for at one version line (`^3.1138.0`).

`@aws-sdk/lib-storage` 3.1138 needs `@aws-sdk/client-s3` of at least the same version, and storage
asked for any 3.x of each, so an install could pair a new upload library with an older client and
warn about an unmet peer.
