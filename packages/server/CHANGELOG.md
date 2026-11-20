# @mariachi/server

## 0.2.0

### Patch Changes

- Updated dependencies [fb0b344]
- Updated dependencies [d957338]
  - @mariachi/core@0.2.0
  - @mariachi/observability@0.2.0

## 0.1.1

### Patch Changes

- aea145a: The API server can send pages and the files they load.
  - `root: true` on a route mounts it at the server's root, outside its prefix (`/`, not `/api/…`),
    and keeps it out of the OpenAPI document. `@mariachi/server` routes take `root` too.
  - `html` is a template that escapes what is put into it; `raw` vouches for markup; `safeHref` keeps
    a link from data to this site, `http:`, `https:` or `mailto:`; `htmlResponse` sends a page with a
    Content-Security-Policy that loads from its own origin only and runs no inline script.
  - `api.withStatic(urlPath, directory)` serves a directory's files, for the app's own styles,
    scripts, fonts and images: regular files inside the directory only (no `..`, no link out of it, no
    listings, no dotfiles), with a type by extension, `nosniff` and an `ETag`. `staticFiles` is the
    handler alone.

- Updated dependencies [f04e223]
- Updated dependencies [0964659]
- Updated dependencies [8486aa5]
- Updated dependencies [867c6ca]
  - @mariachi/core@0.1.1
  - @mariachi/observability@0.1.1

## 0.1.0

### Minor Changes

- 662ccc5: Harden the framework core: architecture, security, data, async, HTTP, CLI and docs.

  Breaking changes to migrate:
  - **Communication**
    - The call signature is now `communication.call(ctx, name, input)`, with `ctx` first.
    - Procedures register as `register(name, { schema: { input, output }, handler })`.
    - Duplicate names throw `communication/duplicate-procedure`.
    - Declare procedure types with `declare module '@mariachi/communication' { interface Procedures { ... } }`.
  - **Dependency injection**
    - Abstract services take an explicit `deps` or instrumentation object instead of reading the global container in their constructors.
    - Container keys are typed (`createKey<T>()`, `KEYS`).
  - **Config**
    - Importing `@mariachi/config` no longer loads `.env`. Pass `loadConfig({ dotenv: true })` or load it yourself.
    - Invalid config throws `ConfigError`.
  - **HTTP**
    - The api-facade stub auth strategies, the auth resolver and `createRouter` are removed. Use `bearerStrategy`, `apiKeyStrategy`, `serviceTokenStrategy` or `hmacSignatureStrategy`, or use `SignatureAuthController` for webhooks.
    - Controller routes declare Zod schemas and are prefixed automatically.
    - Health and OpenAPI routes live under the server prefix, for example `/api/health/ready`.
    - Errors use the JSON error envelope.
  - **Database**
    - A repository with a `tenantColumn` throws when `ctx.tenantId` is missing, unless the call goes through `crossTenant()`.
    - Database failures throw `DatabaseError`.
    - Migrations are generated from `defineTable` schemas with `mariachi db generate`.
  - **Jobs**
    - `enqueue` and `enqueueWithDedup` take `ctx` first. Job data travels in a context envelope.
    - `start()` prunes schedules that the current process didn't register.
  - **Events**
    - `traceId` and `tenantId` travel on the envelope, not in the payload.
    - For at-least-once delivery, use the Redis Streams adapter or the outbox.
  - **Encryption**
    - Ciphertexts use the new `mx1:` envelope, which records the key id and supports associated data.
    - Values written by earlier versions can't be read. Decrypt them with the old version and re-encrypt them.
  - **Tenancy**
    - The authenticated tenant is authoritative. A header that names another tenant throws `tenancy/mismatch`, which maps to HTTP 403.
  - **`@mariachi/create` and the CLI**
    - Generators target the `src/` project layout created by `mariachi init` and use the current APIs.
    - The generator API is `generateEntity`, `generateService`, `generateController`, `generateJob` and `generateIntegration`.
    - The Handlebars dependency is removed.
    - `mariachi validate` rules have new names (list them with `mariachi validate --list`).
  - **Docs**
    - The docs are consolidated in `@mariachi/core/docs`, and the `.mariachi/` copies are removed.
    - The package catalog is generated from `package.json` metadata.

- fcdeb4e: Controllers can set cookies, stream, send server-sent events and take file uploads, so none of
  those needs the raw Fastify instance (whose routes skip authentication, validation and rate limits).
  - **Cookies.** `ctx.request.cookies`, `ctx.setCookie(name, value, options)` (any number per response;
    defaults `Path=/; HttpOnly; Secure; SameSite=Lax`) and `ctx.clearCookie`. `httpResponse` headers may
    be lists. `@mariachi/server` exports `serializeCookie` and `parseCookies`.
  - **Cookie sessions.** `cookieStrategy(verifier, { cookie, allowedOrigins })` signs a request in by a
    cookie and refuses a state-changing request that another site caused (`auth/cross-site-request`,
    403), judged by `Sec-Fetch-Site` and `Origin`. `assertSameOrigin` is the check on its own.
  - **Streams.** A handler may return `sseResponse(asyncIterable)` or `streamResponse(iterable | Readable,
{ contentType })`. Events are sent as produced, with a heartbeat. An event stream always ends
    with `event: done` (optionally carrying data such as usage) or, when its source fails, `event: error`
    carrying the error envelope, so a client can tell a finished stream from a dropped connection. `ctx.request.signal` aborts when the client
    disconnects, and the iterable is ended.
  - **Uploads.** `upload` on a route takes `multipart/form-data`: files in `ctx.request.files`, text
    fields as the validated body, with limits on count, size and declared type. Parsed after
    authentication and the rate limit.

  **Changed:** `bearerStrategy(verifier, { cookie })` now applies the same-origin check when the token
  came from the cookie. A `POST`, `PUT`, `PATCH` or `DELETE` authenticated that way must carry an
  `Origin` (or `Sec-Fetch-Site: same-origin`) for the API's own origin, or one listed in
  `allowedOrigins`. Requests with an `Authorization` header are unaffected. `RequestContext` gains
  `responseCookies` and `signal`, and `HttpContext.request` gains `cookies`, `files` and `signal`, for
  code that builds those objects by hand.

### Patch Changes

- Updated dependencies [2fd4011]
- Updated dependencies [bb7f53a]
- Updated dependencies [44879db]
- Updated dependencies [6ad742b]
- Updated dependencies [92577a6]
- Updated dependencies [47f9687]
- Updated dependencies [da7d762]
- Updated dependencies [662ccc5]
- Updated dependencies [fcdeb4e]
- Updated dependencies [ea2f8fc]
- Updated dependencies [662ccc5]
- Updated dependencies [879b40f]
  - @mariachi/core@0.1.0
  - @mariachi/observability@0.1.0
