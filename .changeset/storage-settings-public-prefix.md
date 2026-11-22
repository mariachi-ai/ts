---
"@mariachi/storage": minor
"@mariachi/config": minor
---

Storage works on any S3-compatible service from settings alone.

- `@mariachi/config` reads `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY` (kept
  secret) and `STORAGE_PUBLIC_PREFIX` into `config.storage`.
- `storageConfig(config.storage)` turns those settings into a `createStorage` config; the two keys go
  together or not at all.
- With an `endpoint` set, the S3 adapter uses path-style addressing unless `forcePathStyle: false` says
  otherwise.
- `publicPrefix` (say `public`) limits `publicUrl` to keys under it, throwing `storage/not-public` for
  the rest, and makes `publicBaseUrl` required. Unset, `publicUrl` behaves as before. It limits which
  links get built; the bucket or CDN policy is what must expose only that prefix.
- In production, an `http://` `STORAGE_ENDPOINT` other than localhost is refused
  (`config/insecure-storage-endpoint`).
