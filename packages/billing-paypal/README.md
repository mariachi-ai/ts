# @mariachi/billing-paypal

PayPal behind `@mariachi/billing`'s port, so `DefaultBilling` takes payments and subscriptions through
PayPal: one-time payments as orders the buyer approves and the server captures, subscriptions on
billing plans with an approval link, refunds, and certificate-signed webhooks turned into the same
billing events Stripe's give. PayPal's own operations are there too, `ctx` first, for what the
port doesn't cover.

**Status: alpha.** Covered by unit tests against a scripted PayPal; not yet checked against a
sandbox account. The contract is in [contract.json](./contract.json).

## How PayPal differs from Stripe

| | Stripe | PayPal, and what the adapter does |
| --- | --- | --- |
| Customer | A stored customer with cards | None: the buyer signs in to PayPal each time. `createCustomer` makes no call; the customer is the tenant, `paypal:<tenantId>`, sent as PayPal's `custom_id` so webhooks find the tenant again |
| One-time payment | A payment intent, confirmed with a stored card | An **order**, created, **approved by the buyer on PayPal**, then **captured** by the server. `billing.charge` creates it (`requires_action`, id = order id); `paypal.orders.capture` captures it |
| Subscription | Prices on a subscription | One **billing plan** (a product's price and interval) per subscription, which **the subscriber approves on PayPal**. `billing.createCheckout({ mode: 'subscription' })` returns the approve link; `billing.subscribe` returns a subscription waiting for approval, for the JavaScript SDK |
| Plan change | `changePlan` | Needs the subscriber's consent: `paypal.subscriptions.revise` gives an approve link |
| Cancel | At period end or now | Now only: pass `{ atPeriodEnd: false }` |
| Pause, resume | Pause collection | Suspend and activate |
| Webhooks | HMAC over the body | RSA signature by a PayPal certificate over the transmission id, time, webhook id and the body's CRC32 |

What PayPal can't do fails with `billing/not-supported`, never silently: several prices on one
subscription, a trial set per subscription (put it in the plan), `changePlan` and
`previewPlanChange`, cancel at period end, `createPortal`, `listInvoices`, metered usage
(`reportUsage` with a provider), the provider's credit balance (the local ledger works),
`lookupKeys` (refer to plans by id), a checkout in `payment` mode, a stored payment method, and
`createBillingWebhookHandler` (use the webhook route below).

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `PAYPAL_CLIENT_ID` | The REST app's client id (public: the browser's SDK uses it) | Developer Dashboard › Apps & Credentials, with the Sandbox/Live toggle |
| `PAYPAL_CLIENT_SECRET` | Its secret | Next to the client id |
| `PAYPAL_ENVIRONMENT` | `sandbox` or `live`, required | The side of the toggle the credentials came from. Test must be `sandbox`, production `live` |
| `PAYPAL_WEBHOOK_ID` | The app's webhook id, to verify deliveries (not secret) | The app's Webhooks section, after adding the webhook URL |

PayPal's credentials carry no prefix, so `PAYPAL_ENVIRONMENT` says which PayPal they belong to:
`sandbox` calls `api-m.sandbox.paypal.com`, `live` calls `api-m.paypal.com`.

## Use

```ts
// src/app.ts
import { DefaultBilling } from '@mariachi/billing';
import { DrizzleBillingStore } from '@mariachi/billing/postgres';
import { createPayPal, createPayPalBillingAdapter, settings } from '@mariachi/billing-paypal';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

const paypal = createPayPal(settingsFromEnv(settings, readEnv), { tracer, metrics });
const billing = new DefaultBilling({ adapter: createPayPalBillingAdapter(paypal), store: new DrizzleBillingStore(db) }, instrumentation);
```

The client signs in with the client credentials and keeps the access token until shortly before
it expires. Every call makes one span (`paypal orders.create`) and carries a `PayPal-Request-Id`
derived from your idempotency key, so a retried create, capture or refund happens once. Amounts
are integers in minor units, as everywhere in billing; `toPayPalAmount` and `fromPayPalAmount`
convert (HUF, JPY and TWD are whole units at PayPal).

### A one-time payment

The server creates the order and captures it; the browser shows PayPal's button with the client id.

```ts
// checkout.service.ts
async createOrder(ctx: Context, input: { cartId: string; amount: number; email: string }) {
  await billing.ensureCustomer(ctx, { email: input.email });
  const charge = await billing.charge(ctx, { amount: input.amount, currency: 'usd', idempotencyKey: `cart:${input.cartId}` });
  return { orderId: charge.id };                          // status 'requires_action': the buyer approves it next
}

async captureOrder(ctx: Context, orderId: string) {
  // The order id comes from the browser: check it is this tenant's before capturing
  if (chargeFromOrder(await paypal.orders.get(ctx, orderId)).tenantId !== ctx.tenantId) throw new NotFoundError('order', orderId);
  const charge = chargeFromOrder(await paypal.orders.capture(ctx, { orderId }));
  return { status: charge.status };                       // fulfil only on 'succeeded'; 'pending' settles by webhook
}
```

```html
<!-- PayPal JavaScript SDK v6. Live: https://www.paypal.com/web-sdk/v6/core -->
<script src="https://www.sandbox.paypal.com/web-sdk/v6/core" onload="startPayPal()"></script>
<paypal-button hidden></paypal-button>
<script>
  async function startPayPal() {
    const sdk = await window.paypal.createInstance({ clientId: PAYPAL_CLIENT_ID, components: ['paypal-payments'], pageType: 'checkout' });
    const methods = await sdk.findEligibleMethods({ currencyCode: 'USD' });
    if (!methods.isEligible('paypal')) return;
    const session = sdk.createPayPalOneTimePaymentSession({
      onApprove: async ({ orderId }) => {
        const { status } = await (await fetch(`/api/checkout/orders/${orderId}/capture`, { method: 'POST' })).json();
        if (status === 'succeeded') location.href = '/thanks';
      },
    });
    const button = document.querySelector('paypal-button');
    button.hidden = false;
    button.addEventListener('click', () =>
      session.start({ presentationMode: 'auto' }, fetch('/api/checkout/orders', { method: 'POST' }).then((r) => r.json())),
    );
  }
</script>
```

Without the SDK, give `paypal.orders.create` a `returnUrl` and `cancelUrl` and send the buyer to
`approvalUrl(order)`; capture when they come back.

### Subscriptions

Create the product and its plans once (a script or an admin action), and keep the plan ids in
config:

```ts
const product = await paypal.products.create(ctx, { name: 'Acme Pro', idempotencyKey: 'product:pro' });
const plan = await paypal.plans.create(ctx, { productId: product.id, name: 'Pro monthly', amount: 1_200, currency: 'usd', interval: 'month', idempotencyKey: 'plan:pro-monthly' });
await billing.syncPlans(ctx);                              // mirrors them into billing_plans
```

Then send the subscriber to PayPal to approve:

```ts
const { url } = await billing.createCheckout(ctx, { mode: 'subscription', priceId: config.paypal.proPlanId, successUrl, cancelUrl });
// redirect to url; BILLING.SUBSCRIPTION.ACTIVATED arrives once they've approved
```

`billing.subscribe(ctx, { priceId })` makes the same subscription without a redirect (status
`incomplete`), for the JavaScript SDK's subscription flow. `billing.pauseSubscription` and
`resumeSubscription` suspend and activate it, `billing.cancelSubscription(ctx, id, { atPeriodEnd: false })`
ends it at once. To change the plan or quantity, ask the subscriber:

```ts
const revision = await paypal.subscriptions.revise(ctx, { subscriptionId, planId: config.paypal.teamPlanId, returnUrl, cancelUrl });
// redirect to approvalUrl(revision); the subscription keeps its plan until they approve
```

## Webhooks

```ts
import { WebhookController } from '@mariachi/webhooks';
import { PayPalWebhookBody, normalizePayPalEvent, payPalEventType, payPalWebhookAuth } from '@mariachi/billing-paypal';

export class PayPalWebhooks extends WebhookController {
  readonly prefix = 'paypal';
  readonly auth = payPalWebhookAuth({ webhookId: config.paypal.webhookId, environment: config.paypal.environment }, { tracer, metrics });
  init() {
    this.post('events', { mode: 'queue', jobName: 'paypal-event', eventType: payPalEventType },
      async (_ctx, body) => PayPalWebhookBody.parse(body));
  }
}

// The job: mirror the change and act on the billing events
const events = await normalizePayPalEvent(ctx, payload, { paypal, store });
for (const event of events) if (event.type === 'subscription.canceled') await entitlements.revoke(ctx, event.subscription);
```

Subscribe the webhook to the events below in the Developer Dashboard. `normalizePayPalEvent`
gives the billing port's events:

| PayPal | Billing event |
| --- | --- |
| `PAYMENT.CAPTURE.COMPLETED` | `payment.succeeded` |
| `PAYMENT.CAPTURE.DECLINED`, `PAYMENT.CAPTURE.DENIED` | `payment.failed` |
| `PAYMENT.CAPTURE.REFUNDED` | `charge.refunded` |
| `BILLING.SUBSCRIPTION.ACTIVATED`, `UPDATED`, `SUSPENDED` | `subscription.synced` |
| `BILLING.SUBSCRIPTION.PAYMENT.FAILED` | `subscription.synced`, status `past_due` (PayPal has no invoices) |
| `BILLING.SUBSCRIPTION.CANCELLED`, `EXPIRED` | `subscription.synced` and `subscription.canceled` |

**How a delivery is checked.** Locally, without a call to PayPal per delivery:
`PAYPAL-TRANSMISSION-SIG` is the RSA-SHA256 signature of
`<transmission id>|<transmission time>|<webhook id>|<CRC32 of the raw body>`, verified with the
certificate at `PAYPAL-CERT-URL`. That URL must be `https://` on PayPal's API host for the
environment (`api.sandbox.paypal.com` or `api-m.sandbox.paypal.com` for sandbox, `api.paypal.com` or
`api-m.paypal.com` for live) under `/v1/notifications/certs/`; anything else is refused before
anything is fetched. The certificate is downloaded once (span `paypal webhookCerts.get`) and cached
until it expires. Pass two webhook ids while moving to a new webhook, and `toleranceSeconds` to
refuse old transmissions.

PayPal signs only a CRC32 of the body, which can be forged, so two things guard it: a delivery is
deduplicated on its signed transmission id, and `normalizePayPalEvent` reads the capture, refund or
subscription again from PayPal's API and reports that, not the body. Act on its events, not on the
raw payload. PayPal retries a delivery that isn't answered 2xx, up to 25 times over 3 days, so key
anything else the job does by the event's `id`.

## Errors

Through the adapter (`billing.*`), failures are the billing port's: `billing/payment-failed` (402)
for a decline (`INSTRUMENT_DECLINED`, `PAYER_CANNOT_PAY`, `ORDER_NOT_APPROVED`…),
`billing/invalid-input`, `billing/not-found`, `billing/conflict`, `billing/rate-limited`,
`billing/config` for refused credentials, `billing/upstream-failed`, and `billing/not-supported`,
each with PayPal's code and the category in `metadata`. The client (`paypal.*`) throws
`PayPalError` with codes `paypal/<reason>` (`paypal/instrument-declined`) and a category; only
`rate-limited` and `unavailable` are retried, and the client already did. PayPal's messages are
never kept.

## Test

```ts
import { fakePayPal, payPalEvent, payPalWebhookSigner } from '@mariachi/billing-paypal/testing';

const paypal = fakePayPal();                                // the client's shape, in memory
const billing = new DefaultBilling({ adapter: createPayPalBillingAdapter(paypal), store: new MemoryBillingStore() }, { logger });
const { orderId } = await checkout.createOrder(ctx, { cartId: 'c1', amount: 4_900, email: 'a@b.test' });
paypal.approveOrder(orderId);                               // what the buyer does on PayPal
await checkout.captureOrder(ctx, orderId);

const signer = payPalWebhookSigner();                       // its own key and certificate, made for the test
const auth = payPalWebhookAuth({ webhookId: 'WH-1', environment: 'sandbox' }, { fetch: signer.fetch });
const { rawBody, headers } = signer.sign(payPalEvent('BILLING.SUBSCRIPTION.ACTIVATED', subscription), { webhookId: 'WH-1' });
```
