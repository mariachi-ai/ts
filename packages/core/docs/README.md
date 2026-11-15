# Mariachi docs

Mariachi is an opinionated TypeScript backend framework: a modular monolith of `@mariachi/*` packages
behind adapters chosen by config, plus a framework-agnostic design library and an explorer for all of
it. The opinions exist so that people and coding agents write the same code the same way.

These docs ship inside `@mariachi/core` (`node_modules/@mariachi/core/docs/`) and are the single
source of truth. `mariachi docs` lists them, prints one or one section, and searches them;
[`llms.txt`](./llms.txt) is the same index for tools. Files elsewhere (`CLAUDE.md`, `.cursor/rules`, a generated project's `AGENTS.md`)
only point here.

## Read first

1. [architecture.md](./architecture.md): layers, request flow, project layout, import boundaries
2. [conventions.md](./conventions.md): rules that `mariachi validate` and the lint enforce, and why
3. [patterns.md](./patterns.md): composition root, DI keys, context, errors, adapters, lifecycle
4. [packages.md](./packages.md): generated catalog of every package, with status and entry points

## Guides

- [cli.md](./cli.md): `mariachi init`, `generate`, `dev`, `token`, `docs`, `validate`, `db`, `design`, `explore`
- [http.md](./http.md): `server` vs `api-facade` vs `webhooks`, routes, auth strategies, rate limits, OpenAPI
- [events.md](./events.md): envelopes, consumer groups, delivery guarantees, dead letters, outbox
- [jobs.md](./jobs.md): `defineJob`, retries, dedup, scheduling, hooks, dead-letter queue
- [realtime.md](./realtime.md): WebSockets, channel authorization, presence, multi-instance fanout
- [billing.md](./billing.md): Stripe with a local mirror, idempotent money movement, credits, replayable webhooks
- [notifications.md](./notifications.md): channels, preferences, queued delivery and delivery tracking
- [ai.md](./ai.md): sessions, budgets, cost, provider fallback, streaming
- [audit.md](./audit.md): append-only log, hash chain verification, retention and export
- [auth-and-providers.md](./auth-and-providers.md): identity providers, RBAC, API keys, webhook dedup
- [organizations.md](./organizations.md): organizations, memberships and invitations in your own database
- [feature-flags.md](./feature-flags.md): tenant overrides, rollouts, caching
- [storage.md](./storage.md): files on S3 and compatible services, local disk or memory; signed URLs, browser uploads
- [search.md](./search.md): typed indexes, filters and facets in Postgres, Typesense or memory; tenant scoping, reindexing
- [integrations.md](./integrations.md): wrapping a third-party API: validated functions, retries, per-tenant credentials, inbound webhooks
- [testing.md](./testing.md): doubles, contract suites, integration tests
- [runbook.md](./runbook.md): running, deploying and configuring an app; developing the framework itself
- [design.md](./design.md): the design library: presets, markup contract, overriding at any granularity, tokens
- [design-catalog.md](./design-catalog.md): generated list of every component and preset
- [design-playbook.md](./design-playbook.md): how a design language is made, measured and tested
- [design-fingerprint.md](./design-fingerprint.md): the measures behind a design language's fingerprint and checks
- [explorer.md](./explorer.md): browse every package, doc, API, error code and component; how it's built
- [ai-guide.md](./ai-guide.md): decision trees and gotchas for coding agents

## Recipes

- [add-domain-entity.md](./recipes/add-domain-entity.md): table, repository, service, handler, controller, tests
- [add-background-job.md](./recipes/add-background-job.md): a job outside the request, at most once, with retries
- [add-webhook-endpoint.md](./recipes/add-webhook-endpoint.md): receive deliveries, verify the signature, acknowledge fast, process in a job
- [add-integration.md](./recipes/add-integration.md): a third-party integration with `@mariachi/integrations`, file by file
- [wiring-and-bootstrap.md](./recipes/wiring-and-bootstrap.md): the composition root, step by step
- [add-design-component.md](./recipes/add-design-component.md): a new component in `@mariachi/design`, readable by every preset
- [add-design-preset.md](./recipes/add-design-preset.md): a new built-in preset in `@mariachi/design`

## Decisions

- [adr/001-adapter-pattern.md](./adr/001-adapter-pattern.md): why every external system sits behind an adapter
