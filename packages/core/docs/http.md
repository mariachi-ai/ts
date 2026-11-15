# HTTP

Three packages, stacked:

| Package | Role | Use it for |
| --- | --- | --- |
| `@mariachi/server` | Transport. Fastify with request ids, `traceparent` propagation, body limits, raw body capture, CORS, security headers, request timeouts, graceful close, the error envelope. No auth or policy. | Only when building a new kind of HTTP surface. |
| `@mariachi/api-facade` | Public API policy on top of `server`: controllers, Zod-validated routes, auth strategies, scopes, rate limits, OpenAPI, health endpoints. | Every client-facing endpoint. |
| `@mariachi/webhooks` | Inbound webhook policy on top of `server`: signature/API key/OAuth verification over the raw body, delivery dedup, request logging, direct or queued processing. | Stripe, GitHub, auth-provider callbacks, any signed sender. |

Run the API and webhook servers on different ports (`PORT`, `WEBHOOK_PORT`) so their auth and body
limits never mix.

## API server

```ts
const api = createApiServer({ name: 'api', prefix: '/api', logger, tracer, cors: { origins: ['https://app.example.com'] } })
  .withAuthStrategy('session', bearerStrategy(new JWTAdapter({ secret })))
  .withAuthStrategy('api-key', apiKeyStrategy(apiKeyVerifier))
  .withAuth(['session', 'api-key'])                  // default for routes that don't set `auth`
  .withRateLimit({ limiter: createRateLimiter({ adapter: 'redis', url }), default: { windowMs: 60_000, maxRequests: 300 } })
  .withHealth(lifecycle.health)                     // /api/health/live, /ready, /startup (under the prefix)
  .withOpenApi({ info: { title: 'My API', version: '1.0.0' } }); // /api/openapi.json

api.registerController(new NotesController(communication));
await api.listen(3000);
```

A strategy returns an identity when its credentials are present and valid, returns `null` when they're
absent (the next strategy is tried), and throws `AuthError` when they're present but invalid. Built in:
`bearerStrategy` (JWT or session verifier), `apiKeyStrategy` (`x-api-key`), `serviceTokenStrategy`
(pre-shared tokens compared in constant time; a service may act in a tenant via `x-tenant-id`) and
`hmacSignatureStrategy`.

## Controllers and routes

```ts
export class NotesController extends BaseController {
  readonly prefix = 'notes';          // → /api/notes
  readonly tags = ['notes'];          // OpenAPI tags

  init(): void {
    this.post('/', { schema: { body: createNoteInput, response: noteSchema }, status: 201 }, (ctx, body) =>
      this.call<NoteDto>(ctx, 'notes.create', body),
    );
    this.get('/:id', { schema: { params: noteIdInput, response: noteSchema }, scopes: ['notes:read'] }, (ctx, _body, params) =>
      this.call<NoteDto>(ctx, 'notes.get', params),
    );
    this.get('/public/stats', { auth: false, rateLimit: { windowMs: 60_000, maxRequests: 30 } }, async () => stats());
  }
}
```

- `schema.body`, `params` and `query` are parsed before the handler runs; the handler receives the
  parsed (typed) values. Failures return 400 with the issues in `error.details`.
- `schema.response` is validated on the way out (`validateResponses: true` by default), so a handler
  can't leak fields the contract doesn't declare. It also documents the route in OpenAPI.
- Return a value for 200 (or `status`), `undefined` for 204, or `httpResponse(status, body, headers)`
  for full control.
- Route options: `auth` (strategy, list, or `false`), `scopes` (all required), `rateLimit` (rule or
  `false`), `status`, `summary`, `description`, `tags`, `deprecated`, `bodyLimitBytes`, `upload`.
- `tenant: 'optional'` lets a signed-in user who is in no tenant onto a route (`ctx.tenantId` is
  null there). The default refuses them with `tenancy/missing-tenant`. Use it only for what a user
  does before they are in a tenant, such as creating or joining an organization, and never touch
  tenant-scoped data in such a handler.
- Duplicate `method + path` throws `api/duplicate-route` at registration.

## Cookies, redirects, streams and uploads

Controllers cover these, so a route that needs one still goes through authentication, validation and
rate limits. `configure()` (the raw Fastify instance) is for Fastify plugins and hooks only.

### Cookies and redirects

```ts
this.post('/session', { auth: false, schema: { body: signInInput } }, async (ctx, body) => {
  const { token } = await this.call<{ token: string }>(ctx, 'auth.signIn', body);
  ctx.setCookie('__Host-session', token, { maxAgeSeconds: 60 * 60 * 24 * 7 });
  return httpResponse(303, undefined, { location: '/app' });
});
this.delete('/session', async (ctx) => {
  ctx.clearCookie('__Host-session');
});
```

- `ctx.request.cookies` holds the request's cookies by name. `ctx.setCookie(name, value, options)`
  adds a `Set-Cookie`, as many as you call it, also when the handler then throws.
- Defaults: `Path=/; HttpOnly; Secure; SameSite=Lax`. Options: `maxAgeSeconds`, `expires`, `path`,
  `domain`, `secure`, `httpOnly`, `sameSite`, `partitioned`. The value is percent-encoded. A cookie a
  browser would reject (`SameSite=None` without `Secure`, a `__Host-` name with a `Domain`) throws
  `http/invalid-cookie`.
- `ctx.clearCookie(name, { path, domain })` needs the path and domain the cookie was set with.

To sign requests in by that cookie:

```ts
api.withAuthStrategy('session', cookieStrategy(sessions, { cookie: '__Host-session' })).withAuth('session');
```

A browser attaches cookies to requests that other sites cause, so `cookieStrategy` refuses a
`POST`, `PUT`, `PATCH` or `DELETE` that doesn't come from a page of the API's own origin
(`auth/cross-site-request`, 403). It reads `Sec-Fetch-Site` and `Origin`, which a page can't forge.
What follows from that:

- **`GET` routes must not change anything.** They aren't checked.
- **A web app on another origin** (`app.example.com` calling `api.example.com`) goes on the list:
  `cookieStrategy(sessions, { cookie, allowedOrigins: ['https://app.example.com'] })`, with CORS
  `credentials: true` for the same origin. A sibling subdomain isn't trusted without it.
- **A client that isn't a browser** (a script, another service) sends no `Origin` and is refused. It
  uses a bearer token or an API key instead; register both strategies and list them in `withAuth`.
- `bearerStrategy(verifier, { cookie })` applies the same check when the token came from the cookie.
- **Name the cookie `__Host-…`.** Without the prefix, another host under the same domain can set a
  cookie of that name, and the planted one may be the one read. `cookieStrategy` warns at start
  when the name lacks it.
- **Set `publicOrigin`** (`https://api.example.com`) when you know it. A browser too old to send
  `Sec-Fetch-Site` must then send exactly that `Origin`; without it only the host is compared with
  the `Host` header, which can't tell http from https.
- **The check guards writes, not reads.** What another site can read from your API is CORS's job:
  never combine `credentials: true` with an origin you echo back from the request or with a
  wildcard. List the origins. (`origins: '*'` with `credentials` is refused at start.)

### Streams and server-sent events

```ts
this.post('/chat', { schema: { body: chatInput } }, async (ctx, body) => {
  const tokens = await this.call<AsyncIterable<string>>(ctx, 'chat.reply', body);
  return sseResponse(
    (async function* () {
      for await (const token of tokens) yield { event: 'token', data: { token } };
    })(),
  );
});

this.get('/export.csv', async (ctx) =>
  streamResponse(this.rows(ctx), { contentType: 'text/csv; charset=utf-8', headers: { 'content-disposition': 'attachment; filename="export.csv"' } }),
);
```

- `sseResponse(events)` takes an async iterable; each item is `{ data, event?, id?, retry? }` or a
  string. Data that isn't a string is sent as JSON. A comment line every 15 seconds
  (`heartbeatMs`) keeps proxies from closing a quiet stream, and the response carries
  `Cache-Control: no-cache, no-transform` and `X-Accel-Buffering: no`.
- `streamResponse(body, { contentType, status, headers })` takes an async iterable of strings and
  bytes, or a Node stream.
- **Every event stream ends with `event: done` or `event: error`**, and the client closes on
  either. Without one, a browser's `EventSource` takes the closed stream for a dropped connection
  and reconnects, which for a model stream is a second, paid call. `{ done: () => ({ usage }) }`
  puts data in the `done` event, worked out once the source has ended; `{ done: false }` sends
  none. For the same reason, leave `id` off events a reconnect couldn't resume from.
- Authentication, validation and the rate limit run before the first byte, so they fail with a
  normal error response. After that there's no status left to change: if an event stream's source
  throws, the last event is `event: error` whose data is the usual error envelope; a byte stream
  is cut off and the error logged.
- When the client disconnects, the iterable is ended (its `finally` blocks run) and
  `ctx.request.signal` aborts. Pass the signal to slow upstream calls, such as a model request, so
  they stop too.
- A procedure can hand back an async iterable in-process: declare its output as
  `z.custom<AsyncIterable<T>>()`. The procedure's timeout covers starting the stream, not reading it.
- `schema.response` isn't applied to a stream, and OpenAPI shows such a route without a response body.

### Uploads

```ts
this.post(
  '/avatars',
  {
    upload: { maxFiles: 1, maxFileBytes: 2 * 1024 * 1024, allowedTypes: ['image/png', 'image/jpeg'] },
    bodyLimitBytes: 3 * 1024 * 1024,
    schema: { body: z.object({ alt: z.string().max(200).optional() }) },
  },
  async (ctx, body) => {
    const [file] = ctx.request.files;
    if (!file) throw new ValidationError('avatars/missing-file', 'Send one image');
    await storage.put(ctx, `avatars/${ctx.userId}`, file.bytes, { contentType: file.contentType });
    return { size: file.size, alt: body.alt };
  },
);
```

- With `upload`, the route takes `multipart/form-data` only (415 otherwise). Files arrive in
  `ctx.request.files` as `{ field, filename, contentType, bytes, size }`; text fields are the
  handler's `body`, checked by `schema.body` (a field sent twice is an array).
- Limits: `maxFiles` (10), `maxFileBytes`, `maxFields` (100), `maxFieldBytes` (64 KiB),
  `allowedTypes` (exact types or `image/*`). Breaking one is `http/too-many-files`,
  `http/file-too-large`, `http/too-many-fields`, `http/field-too-large` (all 413) or
  `http/unsupported-file-type` (415).
- Files are held in memory and the whole request is bounded by `bodyLimitBytes` (1 MiB unless the
  route raises it). For large files, have the browser upload straight to storage with a
  [signed upload URL](./storage.md#browser-uploads-and-downloads).
- `filename` is reduced to a bare name but is still the client's word, and `contentType` is what the
  client declared. Never use the name as a path, and check the bytes when the type matters.
- The body is parsed after authentication and the rate limit.

## Rate limits

`withRateLimit` applies `default` to authenticated callers and `anonymous` (default: `default`) to
anonymous callers keyed by IP. `forTenant(tenantId)` returns per-plan overrides. Responses carry
`RateLimit-Limit`, `RateLimit-Remaining` and `RateLimit-Reset` (seconds); over the limit the request
fails with 429. If the limiter backend errors, requests are allowed (`failOpen`, default true) and the
error is logged.

Each rule picks an `algorithm`:

| Algorithm | Behavior | Use for |
| --- | --- | --- |
| `sliding-window` (default) | Exact count over the last `windowMs`. One sorted-set entry per request. | Public APIs where bursts at window edges matter. |
| `fixed-window` | One counter per window; up to 2× the limit across a boundary. Cheapest. | High-volume, coarse limits. |
| `token-bucket` | `maxRequests` tokens refilled evenly over `windowMs`; bursts up to the bucket size. | Smooth per-client throughput. |

`cost` weights a request (an export can cost 10). The Redis limiter runs each check as one Lua
script using Redis server time, so every instance shares one budget whatever its clock says.

For quotas outside HTTP (jobs, AI calls, exports), use `DefaultRateLimiting` from
`@mariachi/rate-limit` with named tiers:

```ts
const limits = new DefaultRateLimiting({
  limiter,
  resolveTier: async (ctx) => (await plans.forTenant(ctx.tenantId!))?.rateTier,   // undefined → 'default'
}, instrumentation);
const tiers = {
  default: { name: 'default', rule: { algorithm: 'token-bucket', maxRequests: 60, windowMs: 60_000 } },
  pro: { name: 'pro', rule: { algorithm: 'token-bucket', maxRequests: 600, windowMs: 60_000 } },
};
await limits.consumeTier(ctx, 'ai.chat', tiers);   // throws rate-limit/exceeded (429) with retryAfterSeconds
```

Each tenant has its own counter per action. A tier name that doesn't exist is an error
(`rate-limit/unknown-tier`), not a silent fallback. A backend failure is `rate-limit/backend-failed`
(503).

## Context and tracing

Each request gets a `Context` built from the resolved identity. `traceId` comes from the W3C
`traceparent` header when present, otherwise from the request id (`x-request-id`, echoed back). With
a `tracer`, every request runs inside an `http.request` span tagged with method and route.

## Webhooks

```ts
import { StripeWebhookAuth, WebhookController, WebhookServer } from '@mariachi/webhooks';

class StripeWebhooks extends WebhookController {
  readonly prefix = 'stripe';
  // Checks `Stripe-Signature` over the raw body, refuses a stale timestamp, dedups on the event id.
  // Also shipped: GitHubWebhookAuth, StandardWebhookAuth (Svix, Clerk, Resend, ...) and HmacWebhookAuth.
  readonly auth = new StripeWebhookAuth({ secret: stripeWebhookSecret });
  init(): void {
    // queue mode: acknowledge with 202 fast, process in a job (retries, DLQ)
    this.post('/events', { mode: 'queue', jobName: 'stripe-event' }, async (_ctx, body) => body);
  }
}

const webhooks = new WebhookServer({ name: 'webhooks' }, { jobQueue: queue, communication, idempotency, logStore })
  .registerController(new StripeWebhooks());
```

The handler's return value is the procedure input (`mode: 'direct'`) or the job payload
(`mode: 'queue'`). With an `idempotency` store and a provider event id, redeliveries return
`200 { duplicate: true }` without reprocessing. Signature checks always run over the exact raw bytes;
a route with no raw body is rejected. See [recipes/add-webhook-endpoint.md](./recipes/add-webhook-endpoint.md).
