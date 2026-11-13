---
"@mariachi/design": patch
---

The design fingerprint (spec 1, `docs/design-fingerprint.md`): `@mariachi/design/build` exports the probe that measures a rendered screen (`measureScreen`, and `probeSource` to evaluate it in a page), `buildFingerprint` and `buildChecks` for `fingerprint.json` and `checks.json`, `checkMessage`, and the `distance` and `spreads` used by the distinctiveness matrix. `pnpm --filter @mariachi/design fingerprint` measures every language's recipes at three widths in Chrome and writes each language's fingerprint, its checks and the matrix to `dist/`.
