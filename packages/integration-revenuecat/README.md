# @mariachi/integration-revenuecat

RevenueCat's REST API v2: what a mobile or web app's customers bought through the App Store,
Google Play, the web and promotional grants, read as **entitlements**; promotional grants and
revokes; offerings and products for a paywall; and RevenueCat's webhooks.

RevenueCat isn't a billing adapter: the stores charge the customer, and RevenueCat reports what
they're entitled to. Card payments on the app's own web checkout stay with `@mariachi/billing`
(see [With @mariachi/billing](#with-mariachibilling)).

**Status: alpha.** Covered by unit tests against a scripted RevenueCat. The contract is in
[contract.json](./contract.json).

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `REVENUECAT_SECRET_KEY` | A v2 secret API key, `sk_…` (secret, server only) | Project settings › API keys › + New secret API key, version V2, with the permissions below |
| `REVENUECAT_PROJECT_ID` | The project every call is made in | Project settings › General › Project ID (`proj1ab2c3d4`) |
| `REVENUECAT_PUBLIC_KEY_IOS`, `_ANDROID`, `_WEB` | Public SDK keys for the app's clients (optional) | Project settings › API keys, or Apps › the app |
| `REVENUECAT_WEBHOOK_SIGNING_SECRET` | Checks the webhook's HMAC signature (secret, optional) | Integrations › Webhooks › the webhook › HMAC webhook signing; shown once |
| `REVENUECAT_WEBHOOK_AUTH` | The Authorization header value the webhook sends (secret, optional) | A long random string of your own, entered on the webhook |

The secret key needs `customer_information:customers:read_write`, `customer_information:subscriptions:read`,
`customer_information:purchases:read` and `project_configuration:` `entitlements:read`,
`offerings:read`, `packages:read`, `products:read`.

RevenueCat has no test keys: sandbox purchases land in the same project, marked `sandbox`
(`environment` on subscriptions, purchases and webhook events). For tests on a device, the
**Test Store** key replaces a client's public key in debug builds. Never ship it in a release build:
the SDK crashes on purpose when it finds one there.

The server uses only the secret key and the project id. The public keys are settings so a host can
hand them to the app's clients (they're marked `public`).

## Use

```ts
import { createRevenueCat, isEntitled, settings } from '@mariachi/integration-revenuecat';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

// src/app.ts: once, with the container's tracer and metrics
const revenuecat = createRevenueCat(settingsFromEnv(settings, readEnv), { tracer, metrics });

// Does this user have Pro? The customer id is the App User ID the app's SDK logged them in with.
const customer = await revenuecat.customers.get(ctx, user.id);
if (!isEntitled(customer, config.revenuecat.proEntitlementId)) throw new AuthError('auth/forbidden', 'Pro is required');

// Support gives a week of Pro
await revenuecat.customers.grantEntitlement(ctx, { customerId: user.id, entitlementId: proId, expiresAt: new Date(Date.now() + 7 * 86_400_000) });
await revenuecat.customers.revokeGrantedEntitlement(ctx, { customerId: user.id, entitlementId: proId });

// History, every store
for await (const sub of revenuecat.subscriptions.all(ctx, { customerId: user.id, environment: 'production' })) { /* … */ }

// A paywall: offerings with their packages and products
const { items } = await revenuecat.offerings.list(ctx);
const current = items.find((o) => o.is_current);

// A deletion request
await revenuecat.customers.delete(ctx, user.id);
```

| Operation | Call |
| --- | --- |
| `customers.get`, `customers.delete` | `GET`/`DELETE /projects/{projectId}/customers/{customerId}` |
| `customers.grantEntitlement`, `customers.revokeGrantedEntitlement` | `POST …/customers/{customerId}/actions/grant_entitlement`, `…/revoke_granted_entitlement` |
| `activeEntitlements.list`, `subscriptions.list`/`all`, `purchases.list`/`all` | `GET …/customers/{customerId}/active_entitlements`, `/subscriptions`, `/purchases` |
| `entitlements.list`/`all`, `offerings.list`, `products.list` | `GET /projects/{projectId}/entitlements`, `/offerings`, `/products` |

All are REST API v2. Every operation takes `ctx` first and makes one span
(`revenuecat customers.get`). A failure is a `RevenueCatError` with a category and RevenueCat's
error `type` as `providerCode`: only `rate-limited` and `unavailable` (including `store_error`) are
retried, honouring `Retry-After`, and the client already did. Granting and revoking are POSTs, but
repeating one is harmless, so they're retried like a read. A customer RevenueCat doesn't know is
`revenuecat/not-found`.

### Things to get right

- **Check entitlements, not products.** An entitlement is what a purchase unlocks, in every store,
  through promotional grants and family sharing alike. `isEntitled(customer, id, now?)` and
  `activeEntitlements(customer, now?)` read the customer at a time, so a customer you cached a
  while ago still answers right once an entitlement has expired.
- **Entitlement ids, not lookup keys.** v2 names an entitlement by its id (`entl…`). The lookup
  key you chose (`premium`) is on `entitlements.list`: map it to the id once, at startup or in
  config.
- `customers.get` fetches every page of the customer's active entitlements, so `isEntitled` never
  misses one on a second page.
- A grant within two hours of an existing grant's expiry is ignored, so a retry is harmless. To
  extend, grant again at least two hours later; to shorten, revoke and grant again.
- Offerings and products are limited to 60 calls a minute (customer calls to 480): cache them.

## Webhooks

```ts
import { WebhookController } from '@mariachi/webhooks';
import { RevenueCatWebhookBody, activeEntitlements, customersToRefresh, revenueCatEventType, revenueCatWebhookAuth } from '@mariachi/integration-revenuecat';

export class RevenueCatWebhooks extends WebhookController {
  readonly prefix = 'revenuecat';
  readonly auth = revenueCatWebhookAuth({
    signingSecret: config.revenuecat.webhookSigningSecret,   // HMAC: X-RevenueCat-Webhook-Signature
    authorization: config.revenuecat.webhookAuthorization,   // or (and) the Authorization header
  });
  init() {
    this.post('events', { mode: 'queue', jobName: 'revenuecat-event', eventType: revenueCatEventType },
      async (_ctx, body) => RevenueCatWebhookBody.parse(body));
  }
}

// The job: fetch the customer again and decide from it, as RevenueCat recommends
for (const id of customersToRefresh(payload.event)) {
  const customer = await revenuecat.customers.get(ctx, id);
  await access.set(ctx, id, activeEntitlements(customer));
}
```

- **The signature.** With HMAC signing on, `X-RevenueCat-Webhook-Signature` is `t=…,v1=…`: the hex
  HMAC-SHA256 of `"<t>.<raw body>"`, within five minutes. Prefer it: it covers the body. Without
  it, the `Authorization` header must equal the value you set, compared in constant time. Give both
  and both are checked. A delivery that fails is answered 401.
- **Duplicates.** Delivery is at least once and RevenueCat signs each retry afresh, so the
  authenticator deduplicates on the body's `event.id`, which stays the same. Give `WebhookServer`
  an idempotency store.
- **Don't trust the payload for access.** Re-fetch the customer (`customersToRefresh(event)`:
  the `app_user_id`, or both sides of a `TRANSFER`). Event types are in `webhookEvents`;
  `CANCELLATION` doesn't end access, `EXPIRATION` does. `environment` is `SANDBOX` or `PRODUCTION`
  per event.
- Answer within 60 seconds (queue the work); RevenueCat retries five times over about 80 minutes.

## With @mariachi/billing

`@mariachi/billing` has no entitlement or plan port that a second provider could feed: its
`hasActiveSubscription(ctx, planIds)` reads its own Stripe mirror. So an app that sells both in the
app stores (RevenueCat) and on its own web checkout (billing) checks both, in one place:

```ts
// src/services/access.service.ts
async hasPro(ctx: Context, userId: string): Promise<boolean> {
  if (await this.billing.hasActiveSubscription(ctx, ['price_pro_monthly', 'price_pro_yearly'])) return true;
  return isEntitled(await this.revenuecat.customers.get(ctx, userId), this.proEntitlementId);
}
```

Keep the mapping from your plans to RevenueCat entitlement ids in config, next to the Stripe price
ids. If RevenueCat itself handles the web checkout (its Stripe or Web Billing integration), it's
one source: check entitlements only.

## Test

```ts
import { fakeRevenueCat, revenueCatCustomer, revenueCatEvent, signedRevenueCatWebhook } from '@mariachi/integration-revenuecat/testing';

const revenuecat = fakeRevenueCat({ customers: [revenueCatCustomer('user_1', [{ entitlement_id: 'entl_pro', expires_at: null }])] });
const { rawBody, headers } = signedRevenueCatWebhook(revenueCatEvent({ type: 'RENEWAL', app_user_id: 'user_1' }), { signingSecret });
```
