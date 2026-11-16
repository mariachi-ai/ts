---
'@mariachi/lifecycle': patch
'@mariachi/observability': minor
---

`bootstrap` no longer starts a second OpenTelemetry SDK over one that is already registered, for example by a `--require` preload. It logs "An OpenTelemetry SDK is already registered; using it", and Mariachi's spans go to that SDK. Without `@opentelemetry/sdk-node` and `@opentelemetry/exporter-trace-otlp-http` installed, a tracing endpoint no longer stops the app from starting: it warns that spans are not exported. `@mariachi/observability` exports `openTelemetryRegistered()`, the check it uses.
