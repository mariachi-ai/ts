# Recipe: add a webhook endpoint

Goal: receive GitHub `push` deliveries, verify their signature, acknowledge fast, and process them in a
job with retries.

```
POST /webhooks/github/events
  → WebhookServer: raw body captured, request logged (secrets redacted)
  → GitHubWebhookAuth: HMAC over the raw bytes, constant-time compare
  → dedup on the delivery id (idempotency store)
  → route handler: returns the payload
  → mode 'queue': enqueue job, respond 202    |    mode 'direct': communication.call(procedure), respond 200
```

Prefer `queue` mode for anything slower than a few hundred milliseconds or anything that calls other
APIs. Providers time out and retry quickly; the job gives you your own retries and a dead-letter queue.

## 0. Generate it

```bash
mariachi generate webhook acme
```

In a project made by `mariachi init`, this writes all of the steps below for a sender that signs with
Standard Webhooks, and registers them:

| File | What it is |
| --- | --- |
| `src/webhooks/acme.controller.ts` | `POST /webhooks/acme/events`: `StandardWebhookAuth`, the body parsed with Zod, queue mode |
| `src/contracts/acme-webhook.ts` | the body's schema and the job's |
| `src/jobs/acme-webhook.job.ts` | the job the delivery is handed to, listed in `src/jobs/index.ts` |
| `src/webhooks/acme.controller.test.ts` | signed, wrongly signed and unsigned deliveries, a redelivery, a bad body |
| `src/webhooks/index.ts` | the `WebhookServer` (on `WEBHOOK_PORT`, deduplicating in Postgres) and its controllers |
| `src/schema/webhooks.ts` | the dedup table (with the first webhook: run `mariachi db generate`) |

Set `ACME_WEBHOOK_SECRET`. Without it the webhook is off, with a warning, except in production, which
won't start. For GitHub, Stripe or a plain HMAC, change the authenticator in the controller (below).

**Why this way.** The framework has more than one way to take a signed call: this one
(`WebhookServer` with a `WebhookController`), a signature strategy on the API facade, the auth
providers' webhook dispatcher, the billing package's Stripe handler and `defineWebhookHandler` in
integrations. The last three each serve one source (identity providers, Stripe billing, one
integration) and the facade strategy puts deliveries behind the API's sign-in, limits and body size.
For an app's own endpoint, `WebhookServer` is the one that does everything a webhook needs in one
place: raw-body verification, dedup that survives a restart, a log with secrets redacted, and the
hand-off to a job or a procedure, on a port of its own.

## 1. Verify the signature

`@mariachi/webhooks` ships the common schemes, so there's usually no class to write:

| Sender | Authenticator | Deduplicated on |
| --- | --- | --- |
| GitHub | `new GitHubWebhookAuth({ secret })` | a digest of the signature |
| Stripe, and senders that copy its `t=…,v1=…` header | `new StripeWebhookAuth({ secret })` (`header`, `provider` to adapt it) | the signed body's `id` |
| Standard Webhooks and Svix (Clerk, Resend, ...) | `new StandardWebhookAuth({ secret })` | the signed `webhook-id` / `svix-id` |
| Anything with one HMAC header | `new HmacWebhookAuth({ provider, secret, header, deliveryIdHeader?, algorithm?, encoding?, prefix? })` | a digest of the signature |

Each one checks the exact bytes received, compares in constant time, refuses a timestamp more than
five minutes off where the scheme signs one (`toleranceSeconds`), and takes a list of secrets while
one is being rotated. A rejected delivery is logged with the reason and answered 401.

**Dedup only uses signed material.** GitHub's `X-GitHub-Delivery` (like most senders' delivery-id
headers) isn't covered by the signature, so someone replaying a captured delivery can change it.
Those authenticators key dedup on a digest of the signature instead, which is the same for the same
body; the sender's id is in `identity.metadata.deliveryId` for logs.

GitHub and plain-HMAC senders sign no timestamp, so for them the idempotency store is the only
replay protection: don't run without one, and keep its keys for a long time (a delivery replayed
after its key expires is processed again). A key is recorded only after the handler succeeds; if
it throws, the claim is released, so the sender's own redelivery of a failed attempt (GitHub's
"Redeliver": same body, same signature) is processed and not dropped as a duplicate. A delivery
seen again while the first is still being processed is answered as a duplicate.

**A tenant has to be authenticated too.** Nothing signs a URL, so with one secret for everyone, a
valid delivery posted to another tenant's path would be attributed to that tenant. Two safe ways:

```ts
// One shared secret: take the tenant from the signed body.
new StripeWebhookAuth({ secret, tenantFromPayload: (event) => (event as { account?: string })?.account });

// A secret per tenant: the path names the tenant, and the delivery must verify under that tenant's secret.
new GitHubWebhookAuth({
  tenantFromRequest: (req) => req.params.tenant,
  secret: (tenantId) => secrets.get('GITHUB_WEBHOOK_SECRET', tenantId),   // nothing returned → 401
});
```

`tenantFromRequest` with a single shared secret is refused at construction
(`webhooks/unauthenticated-tenant`).

Always verify over `rawBody`, never over re-serialized JSON: key order and whitespace change the bytes.
The same checks are plain functions in `@mariachi/webhooks/verify` (`verifyGitHubWebhook`,
`verifyStripeWebhook`, `verifyStandardWebhook`, `verifyHmacSignature`), with no HTTP server behind
them, for use anywhere else. For a scheme none of them covers, extend `SignatureAuthController`:

```ts
import { SignatureAuthController, verifyHmacSignature } from '@mariachi/webhooks';

class AcmeWebhookAuth extends SignatureAuthController {
  readonly provider = 'acme';
  readonly signatureHeader = 'x-acme-signature';
  constructor(private readonly signingSecret: string) {
    super();
  }
  protected signingSecrets() {
    return this.signingSecret;                       // or several, during a rotation
  }
  protected verifySignature(signature: string, rawBody: Buffer, secret: string) {
    try {
      verifyHmacSignature(rawBody, signature, secret, { encoding: 'base64' });   // constant-time
      return true;
    } catch {
      return false;
    }
  }
  protected tenantFromPayload(payload: unknown) {
    return (payload as { account?: string } | undefined)?.account;
  }
}
```

**A controller written before 0.1.0 needs changing, and the compiler won't always say so.** Then,
`verifySignature(signature, rawBody)` read its secret itself. That still compiles, because
TypeScript accepts a method that takes fewer parameters, but the base class now asks
`signingSecrets()` for the secrets first, finds none, and throws `webhooks/invalid-secret` (a
configuration error, not a 401) on every delivery. Return the secret from `signingSecrets()` and
verify with the `secret` you are passed, as above. The four-argument form,
`verifySignature(signature, rawBody, ctx, req)`, does not compile: the third parameter is now the
`secret` string, not the request context. `eventIdHeader` and `resolveTenant` are gone: use
`dedupKey`, and `tenantFromPayload` or `tenantFromRequest` with `tenantSigningSecrets`.

The base class keeps both rules for you: it deduplicates on a digest of the raw body (override
`dedupKey` only to return an id the signature covers), and it takes a tenant from the verified body,
or from the request only when you also implement `tenantSigningSecrets(tenantId)` so the delivery verifies
under that tenant's own secret. Provider packages ship ready-made
controllers (`ClerkWebhookController`, `FusionAuthWebhookHandler`), and billing verifies Stripe's
billing events itself.

## 2. Route: `src/webhooks/github.controller.ts`

```ts
import { type GitHubWebhookAuth, WebhookController } from '@mariachi/webhooks';

export class GitHubWebhookController extends WebhookController {
  readonly prefix = 'github';

  constructor(readonly auth: GitHubWebhookAuth) {
    super();
  }

  init(): void {
    this.post('/events', { mode: 'queue', jobName: 'github-push', ttl: '30d' }, async (ctx, body) => {
      const event = pushEventSchema.parse(body);             // validate at the boundary
      return { repository: event.repository.full_name, commits: event.commits.length };
    });
  }
}
```

The handler's return value becomes the job payload (or the procedure input in `direct` mode). Set
`logPayload: false` on routes whose bodies carry personal data.

## 3. Job: `src/jobs/github-push.job.ts`

```ts
export const githubPushJob = defineJob({
  name: 'github-push',
  schema: z.object({ repository: z.string(), commits: z.number().int() }),
  retry: { attempts: 5, backoff: 'exponential', delay: 2_000 },
  handler: async (ctx, data) => { /* ... */ },
});
```

Register it in `src/jobs/index.ts` (`mariachi generate job github-push` does this). The job id is
derived from the provider's delivery id, so a redelivery that slips past the idempotency store still
doesn't enqueue twice. That holds only while the first job is still in the queue. Without
`idempotency`, a redelivery of an event whose job has completed is dropped at enqueue on BullMQ
(while the completed job is kept) but processed on the Postgres queue. Configure `idempotency` for
at-most-once on both.

## 4. Server: in `src/app.ts`

```ts
import { RedisIdempotencyStore, createRedisClient } from '@mariachi/cache';
import { createSecrets } from '@mariachi/config';

const redis = createRedisClient(config.redis.url);                                // connects on first use
const githubSecret = await createSecrets().getOrThrow('GITHUB_WEBHOOK_SECRET');   // secrets are read by key, asynchronously

// The generated main.ts builds the queue inline; lift it into a variable so the webhook server shares it.
const jobBackend = createJobQueue({ adapter: 'bullmq', redisUrl: config.redis.url, prefix: config.serviceName }, logger);
const jobs = new DefaultJobs({ queue: jobBackend }, instrumentation);   // the generated app.ts already has this

const webhooks = new WebhookServer(
  { name: 'webhooks', prefix: '/webhooks', logger },
  {
    jobQueue: jobBackend,                               // queue mode
    communication,                                      // direct mode
    idempotency: new RedisIdempotencyStore(redis),      // dedup by provider + delivery id
  },
).registerController(new GitHubWebhookController(new GitHubWebhookAuth({ secret: githubSecret })));

lifecycle.startup.register({ name: 'webhooks', priority: 100, fn: async () => void (await webhooks.listen(config.server.webhookPort)) });
lifecycle.shutdown.register({
  name: 'webhooks',
  priority: 100,
  fn: async () => {
    await webhooks.close();
    await redis.quit();
  },
});
```

Run webhooks on their own port (`WEBHOOK_PORT`, default 3002) so API auth and rate limits don't apply to
them and they can be exposed separately. Add `logStore` (`RepositoryWebhookLogStore` over the
`webhookLogsTable` schema) to keep an audit trail of deliveries.

## 5. Test

Use `webhooks.inject({ method: 'POST', url: '/webhooks/github/events', headers, payload })` with a body
signed using the test secret. Assert:

- a valid signature returns 202 and enqueues exactly one job;
- a bad or missing signature returns 401;
- the same delivery id sent twice returns `{ duplicate: true }` the second time.
