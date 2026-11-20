---
'@mariachi/create': minor
'@mariachi/cli': minor
---

New generators, and entities with columns of their own.

- `mariachi generate event <domain.thing.happened> [--subscriber [name]]`: the event's Zod payload and
  `defineEvent` in `src/events/<name>.event.ts`, how to publish it (through the outbox, or straight
  away), and a test. `mariachi generate subscriber <event> [name]` adds a subscriber, registered in
  `src/events/index.ts`, with a test.
- `mariachi generate webhook <name>`: a `WebhookController` on the app's webhook server (its own port,
  `WEBHOOK_PORT`) that checks a Standard Webhooks signature, parses the body with Zod, answers a
  redelivery as a duplicate and hands the delivery to a job it also writes; with a test. The secret is
  `<NAME>_WEBHOOK_SECRET`.
- `mariachi generate procedure <service> <name>`: one more procedure on a service that exists (its
  contract, method, registration and a test). It refuses, naming the services there are, when the
  service doesn't exist.
- `mariachi generate entity <name> --field title:string --field due_at:timestamp:optional`: the
  entity's own columns (string, text, integer, number, boolean, timestamp, date, uuid) instead of the
  fixed `name`, which stays the default. Plurals know irregular and uncountable words (`person` →
  `people`, `leaf` → `leaves`, `sheep`) and more endings (`analysis` → `analyses`, `quiz` →
  `quizzes`); `--plural` overrides them.

A new project sets up events (an in-process bus with the outbox in Postgres relayed to it: services
get `deps.events` and `deps.outbox`) and starts a webhook server once it has a webhook. It depends on
`@mariachi/events` and `@mariachi/webhooks`, and its first migration has the outbox table. Generated
services mark where `generate procedure` adds (`// mariachi:procedures`). A project made before this
gets the registries from its first `generate event` or `generate webhook`, and a note saying what to
add to its `src/app.ts`.
