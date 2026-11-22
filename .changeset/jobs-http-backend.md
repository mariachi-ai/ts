---
"@mariachi/jobs": minor
"@mariachi/config": minor
---

A job backend for a remote queue spoken over HTTP: `createJobQueue({ adapter: 'http', ... })`.

- The protocol ships with the package as two OpenAPI 3.1 documents, `protocol/app-api.openapi.yaml` and
  `protocol/webhook.openapi.yaml`, with signature test vectors.
- `start()` declares the app's jobs and schedules (`PUT /v1/definitions`, replacing the set, so a removed
  schedule stops); `enqueue` and `cancel` call `/v1/runs` with the key as a Bearer token. A refusal is a
  `JobsError` from the HTTP status (`jobs/unauthorized`, `jobs/rate-limited`, `jobs/unavailable`,
  `jobs/rejected`), carrying the queue's own code in its details.
- `handleJobRun(backend, { headers, rawBody })` answers the queue's signed `POST /_jobs/run`: it checks
  `Jobs-Signature` (HMAC-SHA256 over `<t>.<raw body>`, two values during a rotation, 300 s limit) before
  anything else, answers a finished run id without running it again, and maps the outcome to 200, 409,
  422, 429 (with `Retry-After`) or 500. `signJobRun` and `verifyJobRunSignature` are exported.
- `@mariachi/config` reads `JOBS_ADAPTER`, `JOBS_HTTP_URL`, `JOBS_HTTP_KEY` and `JOBS_HTTP_SIGNING_SECRET`
  (both secrets redacted) into `config.jobs`, and refuses an `http://` `JOBS_HTTP_URL` other than
  localhost in production (`config/insecure-jobs-url`).
