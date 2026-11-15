---
'@mariachi/config': minor
'@mariachi/observability': minor
'@mariachi/database': patch
'@mariachi/encryption': patch
---

Config fields the docs named now exist, and an option that was accepted and ignored now works.

- `config.storage.signingSecret` and `config.storage.publicBaseUrl` (`STORAGE_SIGNING_SECRET`, 32 or
  more characters, and `STORAGE_PUBLIC_BASE_URL`): the storage doc's example read the first, which
  wasn't in the config.
- `config.encryption.kmsKeyId` (`ENCRYPTION_KMS_KEY_ID`), for the `aws-kms` and `gcp-kms` adapters.
  `createEncryption`'s example named `kmsKeyId` and `localKey`; it now uses `kmsKeyId`, `key` and
  `keyVersion`, which says what `keyVersion` is for: the key's id.
- `PinoLoggerAdapter({ pretty: true })` writes human-readable lines; before, `pretty` did nothing.
  It needs the optional peer `pino-pretty`. `LOG_PRETTY` / `observability.logging.pretty` turns it
  on from config, and `destination` says where to write.
- `database.poolMin` / `DATABASE_POOL_MIN` is marked deprecated: it was never used, because the
  Postgres driver opens connections on demand. It still loads, so existing environments don't break.
