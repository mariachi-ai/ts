---
'@mariachi/server': minor
'@mariachi/api-facade': minor
'@mariachi/core': patch
---

Controllers can set cookies, stream, send server-sent events and take file uploads, so none of
those needs the raw Fastify instance (whose routes skip authentication, validation and rate limits).

- **Cookies.** `ctx.request.cookies`, `ctx.setCookie(name, value, options)` (any number per response;
  defaults `Path=/; HttpOnly; Secure; SameSite=Lax`) and `ctx.clearCookie`. `httpResponse` headers may
  be lists. `@mariachi/server` exports `serializeCookie` and `parseCookies`.
- **Cookie sessions.** `cookieStrategy(verifier, { cookie, allowedOrigins })` signs a request in by a
  cookie and refuses a state-changing request that another site caused (`auth/cross-site-request`,
  403), judged by `Sec-Fetch-Site` and `Origin`. `assertSameOrigin` is the check on its own.
- **Streams.** A handler may return `sseResponse(asyncIterable)` or `streamResponse(iterable | Readable,
  { contentType })`. Events are sent as produced, with a heartbeat; a failing source ends an event
  stream with `event: error` carrying the error envelope. `ctx.request.signal` aborts when the client
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
